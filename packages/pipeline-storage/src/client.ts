import { S3Client } from '@aws-sdk/client-s3';

const globalForS3 = globalThis as unknown as { pipelineS3: S3Client };

let _s3: S3Client;
export function getS3() {
  if (!_s3) {
    _s3 = globalForS3.pipelineS3 ?? new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    if (process.env.NODE_ENV !== 'production') globalForS3.pipelineS3 = _s3;
  }
  return _s3;
}

/** @deprecated Use getS3() — kept for backwards compat */
export const s3 = new Proxy({} as S3Client, {
  get(_, prop) {
    const c = getS3();
    const val = (c as any)[prop];
    return typeof val === 'function' ? val.bind(c) : val;
  },
});

export const PIPELINE_BUCKET = process.env.AWS_S3_PIPELINE_BUCKET ?? 'iish-pipeline';
