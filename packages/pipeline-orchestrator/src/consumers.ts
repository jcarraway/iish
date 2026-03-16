import { StringCodec, JetStreamClient, ConsumerMessages } from 'nats';
import { PIPELINE_STEP_ORDER } from '@oncovax/shared';
import { getJetStream, connectNats } from './nats';
import { SUBJECTS, jobSubmittedSchema, stepCompleteSchema, stepFailedSchema } from './events';
import { dispatchStep } from './dispatcher';
import { getRetryDelay, shouldRetry } from './retry';
import {
  markJobStarted,
  markStepComplete,
  markJobComplete,
  markJobFailed,
  incrementRetry,
  getJob,
} from './job-manager';

const sc = StringCodec();

async function handleJobSubmitted(data: string): Promise<void> {
  const payload = jobSubmittedSchema.parse(JSON.parse(data));
  console.log(`Job submitted: ${payload.jobId}`);

  const firstStep = PIPELINE_STEP_ORDER[0];
  await markJobStarted(payload.jobId, firstStep);
  await dispatchStep(payload.jobId, firstStep, {
    TUMOR_DATA_PATH: payload.tumorDataPath,
    NORMAL_DATA_PATH: payload.normalDataPath,
    INPUT_FORMAT: payload.inputFormat,
    REFERENCE_GENOME: payload.referenceGenome,
    ...(payload.rnaDataPath ? { RNA_DATA_PATH: payload.rnaDataPath } : {}),
  });
}

async function handleStepComplete(data: string): Promise<void> {
  const payload = stepCompleteSchema.parse(JSON.parse(data));
  console.log(`Step complete: ${payload.step} for job ${payload.jobId}`);

  const { isLastStep, nextStep } = await markStepComplete(
    payload.jobId,
    payload.step,
    payload.metadata as Record<string, unknown> | undefined
  );

  if (isLastStep) {
    await markJobComplete(payload.jobId);
    console.log(`Pipeline complete for job ${payload.jobId}`);
  } else if (nextStep) {
    const job = await getJob(payload.jobId);
    await dispatchStep(payload.jobId, nextStep, {
      TUMOR_DATA_PATH: job.tumorDataPath,
      NORMAL_DATA_PATH: job.normalDataPath,
      INPUT_FORMAT: job.inputFormat,
      REFERENCE_GENOME: job.referenceGenome,
      ...(job.rnaDataPath ? { RNA_DATA_PATH: job.rnaDataPath } : {}),
    });
  }
}

async function handleStepFailed(data: string): Promise<void> {
  const payload = stepFailedSchema.parse(JSON.parse(data));
  console.log(`Step failed: ${payload.step} for job ${payload.jobId}: ${payload.error}`);

  const { retryCount, maxRetries } = await incrementRetry(payload.jobId);

  if (shouldRetry(retryCount, maxRetries, payload.retryable)) {
    const delay = getRetryDelay(retryCount);
    console.log(`Retrying ${payload.step} for job ${payload.jobId} in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);

    setTimeout(async () => {
      try {
        const job = await getJob(payload.jobId);
        await dispatchStep(payload.jobId, payload.step, {
          TUMOR_DATA_PATH: job.tumorDataPath,
          NORMAL_DATA_PATH: job.normalDataPath,
          INPUT_FORMAT: job.inputFormat,
          REFERENCE_GENOME: job.referenceGenome,
          ...(job.rnaDataPath ? { RNA_DATA_PATH: job.rnaDataPath } : {}),
        });
      } catch (err) {
        console.error(`Failed to retry ${payload.step} for job ${payload.jobId}:`, err);
        await markJobFailed(payload.jobId, payload.step, `Retry dispatch failed: ${err}`);
      }
    }, delay);
  } else {
    await markJobFailed(payload.jobId, payload.step, payload.error);
    console.log(`Job ${payload.jobId} failed permanently at step ${payload.step}`);
  }
}

export async function startConsumers(): Promise<() => Promise<void>> {
  const nc = await connectNats();
  const js = await getJetStream();
  const jsm = await nc.jetstreamManager();

  // Create durable consumers
  await jsm.consumers.add('PIPELINE', {
    durable_name: 'job-submitted',
    filter_subject: SUBJECTS.JOB_SUBMITTED,
    ack_policy: 'explicit' as unknown as import('nats').AckPolicy,
  });

  await jsm.consumers.add('PIPELINE', {
    durable_name: 'step-complete',
    filter_subject: 'PIPELINE.step.*.complete',
    ack_policy: 'explicit' as unknown as import('nats').AckPolicy,
  });

  await jsm.consumers.add('PIPELINE', {
    durable_name: 'step-failed',
    filter_subject: SUBJECTS.STEP_FAILED,
    ack_policy: 'explicit' as unknown as import('nats').AckPolicy,
  });

  // Start consuming
  const consumers: ConsumerMessages[] = [];

  const jobSubmittedConsumer = await js.consumers.get('PIPELINE', 'job-submitted');
  const jobSubmittedMessages = await jobSubmittedConsumer.consume();
  consumers.push(jobSubmittedMessages);

  const stepCompleteConsumer = await js.consumers.get('PIPELINE', 'step-complete');
  const stepCompleteMessages = await stepCompleteConsumer.consume();
  consumers.push(stepCompleteMessages);

  const stepFailedConsumer = await js.consumers.get('PIPELINE', 'step-failed');
  const stepFailedMessages = await stepFailedConsumer.consume();
  consumers.push(stepFailedMessages);

  // Process messages
  (async () => {
    for await (const msg of jobSubmittedMessages) {
      try {
        await handleJobSubmitted(sc.decode(msg.data));
        msg.ack();
      } catch (err) {
        console.error('Error handling job.submitted:', err);
        msg.nak();
      }
    }
  })();

  (async () => {
    for await (const msg of stepCompleteMessages) {
      try {
        await handleStepComplete(sc.decode(msg.data));
        msg.ack();
      } catch (err) {
        console.error('Error handling step.complete:', err);
        msg.nak();
      }
    }
  })();

  (async () => {
    for await (const msg of stepFailedMessages) {
      try {
        await handleStepFailed(sc.decode(msg.data));
        msg.ack();
      } catch (err) {
        console.error('Error handling step.failed:', err);
        msg.nak();
      }
    }
  })();

  console.log('All NATS consumers started');

  return async () => {
    for (const consumer of consumers) {
      consumer.stop();
    }
  };
}
