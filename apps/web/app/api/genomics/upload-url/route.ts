import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generatePresignedUploadUrl } from '@/lib/s3';
import { presignedUrlRequestSchema, DOCUMENT_TYPES } from '@oncovax/shared';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const { filename, contentType, fileSize } = presignedUrlRequestSchema.parse(body);

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const ext = filename.split('.').pop() ?? 'bin';
    const s3Key = `genomics/${patient.id}/${randomUUID()}.${ext}`;

    const result = await generatePresignedUploadUrl(s3Key, contentType);

    // Create DocumentUpload record
    const doc = await prisma.documentUpload.create({
      data: {
        patientId: patient.id,
        documentType: DOCUMENT_TYPES.GENOMIC_REPORT,
        s3Key: result.s3Key,
        s3Bucket: result.bucket,
        mimeType: contentType,
        extractionStatus: 'pending',
      },
    });

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      s3Key: result.s3Key,
      bucket: result.bucket,
      documentUploadId: doc.id,
      contentType,
      fileSize,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json({ error: 'Invalid request', details: err }, { status: 400 });
    }
    console.error('Genomic upload URL error:', err);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
