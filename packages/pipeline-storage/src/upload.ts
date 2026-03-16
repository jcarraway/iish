import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { s3, PIPELINE_BUCKET } from './client';

export async function generatePresignedUploadUrl(
  s3Key: string,
  contentType: string
): Promise<{ uploadUrl: string; s3Key: string; bucket: string; expiresAt: string }> {
  const command = new PutObjectCommand({
    Bucket: PIPELINE_BUCKET,
    Key: s3Key,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  });

  const expiresIn = 3600; // 1 hour for large file uploads
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn });
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  return { uploadUrl, s3Key, bucket: PIPELINE_BUCKET, expiresAt };
}

export async function multipartUpload(
  s3Key: string,
  body: Readable | Buffer,
  contentType: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: PIPELINE_BUCKET,
      Key: s3Key,
      Body: body,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
    },
    queueSize: 4,
    partSize: 50 * 1024 * 1024, // 50MB parts
  });

  if (onProgress) {
    upload.on('httpUploadProgress', (progress) => {
      if (progress.loaded !== undefined && progress.total !== undefined) {
        onProgress(progress.loaded, progress.total);
      }
    });
  }

  await upload.done();
}
