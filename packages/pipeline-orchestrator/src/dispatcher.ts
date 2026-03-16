import { BatchClient, SubmitJobCommand } from '@aws-sdk/client-batch';

const batch = new BatchClient({ region: process.env.AWS_REGION! });

const CPU_INTENSIVE_QUEUE = process.env.AWS_BATCH_JOB_QUEUE_CPU || 'oncovax-pipeline-cpu-intensive';
const STANDARD_QUEUE = process.env.AWS_BATCH_JOB_QUEUE_STANDARD || 'oncovax-pipeline-standard';

const JOB_DEFINITIONS: Record<string, { definition: string; queue: string }> = {
  alignment: { definition: 'oncovax-alignment', queue: CPU_INTENSIVE_QUEUE },
  variant_calling: { definition: 'oncovax-variant-calling', queue: CPU_INTENSIVE_QUEUE },
  hla_typing: { definition: 'oncovax-hla-typing', queue: STANDARD_QUEUE },
  neoantigen_prediction: { definition: 'oncovax-neoantigen-prediction', queue: STANDARD_QUEUE },
  structure_prediction: { definition: 'oncovax-structure-prediction', queue: STANDARD_QUEUE },
  ranking: { definition: 'oncovax-ranking', queue: STANDARD_QUEUE },
  mrna_design: { definition: 'oncovax-mrna-design', queue: STANDARD_QUEUE },
};

export async function dispatchStep(
  jobId: string,
  step: string,
  environment?: Record<string, string>
): Promise<string> {
  const config = JOB_DEFINITIONS[step];
  if (!config) {
    throw new Error(`Unknown pipeline step: ${step}`);
  }

  const envOverrides = [
    { name: 'PIPELINE_JOB_ID', value: jobId },
    { name: 'PIPELINE_STEP', value: step },
    { name: 'NATS_URL', value: process.env.NATS_URL || 'nats://localhost:4222' },
    { name: 'DATABASE_URL', value: process.env.DATABASE_URL! },
    { name: 'AWS_S3_PIPELINE_BUCKET', value: process.env.AWS_S3_PIPELINE_BUCKET! },
  ];

  if (environment) {
    for (const [name, value] of Object.entries(environment)) {
      envOverrides.push({ name, value });
    }
  }

  const command = new SubmitJobCommand({
    jobName: `${step}-${jobId.slice(0, 8)}`,
    jobDefinition: config.definition,
    jobQueue: config.queue,
    containerOverrides: {
      environment: envOverrides,
    },
  });

  const response = await batch.send(command);
  console.log(`Dispatched ${step} for job ${jobId}: AWS Batch job ${response.jobId}`);
  return response.jobId!;
}
