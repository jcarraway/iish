import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generatePresignedDownloadUrl } from '@/lib/s3';
import { extractGenomicReport } from '@/lib/genomic-extraction';
import { extractionRequestSchema } from '@iish/shared';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const { s3Keys, mimeTypes } = extractionRequestSchema.parse(body);

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Generate presigned download URLs
    const imageUrls = await Promise.all(s3Keys.map((key) => generatePresignedDownloadUrl(key)));

    // Extract genomic report
    const { extraction, cost } = await extractGenomicReport(imageUrls);

    // Create GenomicResult record (unconfirmed)
    const genomicResult = await prisma.genomicResult.create({
      data: {
        patientId: patient.id,
        source: 'document_upload',
        provider: extraction.provider,
        testName: extraction.testName,
        reportDate: extraction.reportDate ? new Date(extraction.reportDate) : null,
        specimenDate: extraction.specimenDate ? new Date(extraction.specimenDate) : null,
        alterations: JSON.parse(JSON.stringify(extraction.genomicAlterations)),
        biomarkers: JSON.parse(JSON.stringify(extraction.biomarkers)),
        germlineFindings: extraction.germlineFindings ? JSON.parse(JSON.stringify(extraction.germlineFindings)) : null,
        reportTherapyMatches: JSON.parse(JSON.stringify(extraction.reportTherapyMatches)),
        extractionConfidence: extraction.extractionConfidence,
        patientConfirmed: false,
      },
    });

    // Update DocumentUpload status
    await prisma.documentUpload.updateMany({
      where: { patientId: patient.id, s3Key: { in: s3Keys } },
      data: { extractionStatus: 'completed', claudeApiCost: cost },
    });

    return NextResponse.json({
      genomicResultId: genomicResult.id,
      extraction,
      cost,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json({ error: 'Invalid request', details: err }, { status: 400 });
    }
    console.error('Genomic extraction error:', err);
    return NextResponse.json({ error: 'Failed to extract genomic report' }, { status: 500 });
  }
}
