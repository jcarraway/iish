import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, PIPELINE_BUCKET } from './client';

export async function generatePresignedDownloadUrl(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: PIPELINE_BUCKET,
    Key: s3Key,
  });

  return getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
}

export async function objectExists(s3Key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({
      Bucket: PIPELINE_BUCKET,
      Key: s3Key,
    }));
    return true;
  } catch {
    return false;
  }
}
