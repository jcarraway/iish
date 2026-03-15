import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const bucket = process.env.AWS_S3_BUCKET!;

export async function generatePresignedUploadUrl(
  s3Key: string,
  contentType: string
): Promise<{ uploadUrl: string; s3Key: string; bucket: string }> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 min

  return { uploadUrl, s3Key, bucket };
}

export async function generatePresignedDownloadUrl(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: s3Key,
  });

  return getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
}
