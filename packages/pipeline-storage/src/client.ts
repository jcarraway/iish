import { S3Client } from '@aws-sdk/client-s3';

const globalForS3 = globalThis as unknown as { pipelineS3: S3Client };

export const s3 = globalForS3.pipelineS3 ?? new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

if (process.env.NODE_ENV !== 'production') globalForS3.pipelineS3 = s3;

export const PIPELINE_BUCKET = process.env.AWS_S3_PIPELINE_BUCKET!;
