import { NextRequest, NextResponse } from 'next/server';
import { presignedUrlRequestSchema } from '@oncovax/shared';
import { generatePresignedUploadUrl } from '@/lib/s3';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, contentType, fileSize } = presignedUrlRequestSchema.parse(body);

    // Generate a unique S3 key with UUID prefix
    const ext = filename.split('.').pop() ?? 'bin';
    const s3Key = `uploads/${randomUUID()}/${Date.now()}.${ext}`;

    const result = await generatePresignedUploadUrl(s3Key, contentType);

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      s3Key: result.s3Key,
      bucket: result.bucket,
      contentType,
      fileSize,
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json({ error: 'Invalid request', details: err }, { status: 400 });
    }
    console.error('Presigned URL error:', err);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
