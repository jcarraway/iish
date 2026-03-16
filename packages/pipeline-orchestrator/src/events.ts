import { z } from 'zod';
import { StringCodec, JetStreamClient } from 'nats';
import { getJetStream } from './nats';

const sc = StringCodec();

// Event subjects
export const SUBJECTS = {
  JOB_SUBMITTED: 'PIPELINE.job.submitted',
  JOB_STARTED: 'PIPELINE.job.started',
  JOB_COMPLETED: 'PIPELINE.job.completed',
  JOB_FAILED: 'PIPELINE.job.failed',
  STEP_COMPLETE: (step: string) => `PIPELINE.step.${step}.complete`,
  STEP_FAILED: 'PIPELINE.step.failed',
  PROGRESS: 'PIPELINE.progress',
} as const;

// Event schemas
export const jobSubmittedSchema = z.object({
  jobId: z.string().uuid(),
  patientId: z.string().uuid(),
  tumorDataPath: z.string(),
  normalDataPath: z.string(),
  rnaDataPath: z.string().optional(),
  inputFormat: z.string(),
  referenceGenome: z.string(),
});

export const stepCompleteSchema = z.object({
  jobId: z.string().uuid(),
  step: z.string(),
  outputPath: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const stepFailedSchema = z.object({
  jobId: z.string().uuid(),
  step: z.string(),
  error: z.string(),
  retryable: z.boolean().default(true),
});

export const progressSchema = z.object({
  jobId: z.string().uuid(),
  step: z.string(),
  percentComplete: z.number().min(0).max(100),
  message: z.string(),
});

// Publisher helpers
export async function publishEvent(
  subject: string,
  data: Record<string, unknown>,
  js?: JetStreamClient
): Promise<void> {
  const jetstream = js ?? await getJetStream();
  await jetstream.publish(subject, sc.encode(JSON.stringify(data)));
}

export async function publishJobSubmitted(data: z.infer<typeof jobSubmittedSchema>, js?: JetStreamClient): Promise<void> {
  await publishEvent(SUBJECTS.JOB_SUBMITTED, data, js);
}

export async function publishStepComplete(step: string, data: z.infer<typeof stepCompleteSchema>, js?: JetStreamClient): Promise<void> {
  await publishEvent(SUBJECTS.STEP_COMPLETE(step), data, js);
}

export async function publishStepFailed(data: z.infer<typeof stepFailedSchema>, js?: JetStreamClient): Promise<void> {
  await publishEvent(SUBJECTS.STEP_FAILED, data, js);
}
