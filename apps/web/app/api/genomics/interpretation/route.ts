import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generateGenomicInterpretation } from '@/lib/genomic-interpreter';
import type { PatientProfile, GenomicReportExtraction, GenomicAlteration, GenomicBiomarkers, GermlineFinding } from '@oncovax/shared';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const { genomicResultId } = body as { genomicResultId?: string };

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true, profile: true },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Find the genomic result
    const genomicResult = genomicResultId
      ? await prisma.genomicResult.findUnique({ where: { id: genomicResultId } })
      : await prisma.genomicResult.findFirst({
          where: { patientId: patient.id, patientConfirmed: true },
          orderBy: { createdAt: 'desc' },
        });

    if (!genomicResult || genomicResult.patientId !== patient.id) {
      return NextResponse.json({ error: 'No confirmed genomic results found' }, { status: 404 });
    }

    // If interpretation already exists, return it
    if (genomicResult.interpretation) {
      return NextResponse.json({ interpretation: genomicResult.interpretation });
    }

    const profile = (patient.profile as unknown as PatientProfile) ?? {};

    // Reconstruct GenomicReportExtraction from stored data
    const genomicData: GenomicReportExtraction = {
      provider: genomicResult.provider,
      testName: genomicResult.testName,
      reportDate: genomicResult.reportDate?.toISOString().split('T')[0] ?? null,
      specimenDate: genomicResult.specimenDate?.toISOString().split('T')[0] ?? null,
      specimenType: null,
      genomicAlterations: genomicResult.alterations as unknown as GenomicAlteration[],
      biomarkers: genomicResult.biomarkers as unknown as GenomicBiomarkers,
      germlineFindings: genomicResult.germlineFindings as unknown as GermlineFinding[] | null,
      reportTherapyMatches: (genomicResult.reportTherapyMatches ?? []) as unknown as { therapy: string; evidence: string; gene: string }[],
      extractionConfidence: genomicResult.extractionConfidence ?? 0,
    };

    const interpretation = await generateGenomicInterpretation(profile, genomicData, patient.id);

    // Store in GenomicResult
    await prisma.genomicResult.update({
      where: { id: genomicResult.id },
      data: {
        interpretation: JSON.parse(JSON.stringify(interpretation)),
        interpretationAt: new Date(),
      },
    });

    return NextResponse.json({ interpretation });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Genomic interpretation error:', err);
    return NextResponse.json({ error: 'Failed to generate interpretation' }, { status: 500 });
  }
}
