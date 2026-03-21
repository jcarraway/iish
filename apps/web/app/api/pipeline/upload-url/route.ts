import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generatePresignedUploadUrl, inputPath } from '@iish/pipeline-storage';
import { pipelineUploadUrlSchema } from '@iish/shared';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const { fileName, fileSize, fileType, sampleType } = pipelineUploadUrlSchema.parse(body);

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const jobId = randomUUID();
    const ext = fileName.split('.').pop() ?? 'fastq';
    const s3Key = inputPath(patient.id, jobId, `${sampleType}_${randomUUID().slice(0, 8)}.${ext}`);

    const contentTypeMap: Record<string, string> = {
      fastq: 'application/octet-stream',
      fastq_gz: 'application/gzip',
      bam: 'application/octet-stream',
    };

    const result = await generatePresignedUploadUrl(s3Key, contentTypeMap[fileType] ?? 'application/octet-stream');

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      s3Key: result.s3Key,
      bucket: result.bucket,
      expiresAt: result.expiresAt,
      jobId,
      fileSize,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json({ error: 'Invalid request', details: err }, { status: 400 });
    }
    console.error('Pipeline upload URL error:', err);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
