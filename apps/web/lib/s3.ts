import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let _s3: S3Client;
function getS3() {
  if (!_s3) _s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  return _s3;
}

const getBucket = () => process.env.AWS_S3_BUCKET!;

export async function generatePresignedUploadUrl(
  s3Key: string,
  contentType: string
): Promise<{ uploadUrl: string; s3Key: string; bucket: string }> {
  const bucket = getBucket();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getS3(), command, { expiresIn: 900 }); // 15 min

  return { uploadUrl, s3Key, bucket };
}

export async function generatePresignedDownloadUrl(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: s3Key,
  });

  return getSignedUrl(getS3(), command, { expiresIn: 3600 }); // 1 hour
}

export async function downloadS3AsText(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: s3Key,
  });

  const response = await getS3().send(command);
  if (!response.Body) throw new Error('Empty S3 response body');
  const stream = response.Body as import('stream').Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}
