import { PrismaClient } from '@oncovax/db/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { PIPELINE_STEP_ORDER } from '@oncovax/shared';

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { orchestratorPrisma: PrismaClient };
const prisma = globalForPrisma.orchestratorPrisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.orchestratorPrisma = prisma;

export async function markJobStarted(jobId: string, step: string): Promise<void> {
  await prisma.pipelineJob.update({
    where: { id: jobId },
    data: {
      status: 'running',
      currentStep: step,
      startedAt: new Date(),
    },
  });
}

export async function markStepComplete(
  jobId: string,
  step: string,
  outputs?: Record<string, unknown>
): Promise<{ isLastStep: boolean; nextStep: string | null }> {
  const job = await prisma.pipelineJob.findUniqueOrThrow({ where: { id: jobId } });
  const stepsCompleted = [...job.stepsCompleted, step];
  const stepIndex = PIPELINE_STEP_ORDER.indexOf(step as typeof PIPELINE_STEP_ORDER[number]);
  const isLastStep = stepIndex === PIPELINE_STEP_ORDER.length - 1;
  const nextStep = isLastStep ? null : PIPELINE_STEP_ORDER[stepIndex + 1];

  const updateData: Record<string, unknown> = {
    stepsCompleted,
    currentStep: nextStep,
  };

  // Map step outputs to specific columns
  if (outputs) {
    if (step === 'alignment' && outputs.alignedBamPath) {
      updateData.alignedBamPath = outputs.alignedBamPath;
    }
    if (step === 'variant_calling') {
      if (outputs.vcfPath) updateData.vcfPath = outputs.vcfPath;
      if (outputs.annotatedVcfPath) updateData.annotatedVcfPath = outputs.annotatedVcfPath;
      if (outputs.variantCount !== undefined) updateData.variantCount = outputs.variantCount;
      if (outputs.tmb !== undefined) updateData.tmb = outputs.tmb;
    }
    if (step === 'hla_typing' && outputs.hlaGenotype) {
      updateData.hlaGenotype = outputs.hlaGenotype;
    }
    if (step === 'neoantigen_prediction' && outputs.neoantigenCount !== undefined) {
      updateData.neoantigenCount = outputs.neoantigenCount;
    }
    if (step === 'ranking' && outputs.topNeoantigens) {
      updateData.topNeoantigens = outputs.topNeoantigens;
    }
    if (step === 'mrna_design') {
      if (outputs.vaccineBlueprint) updateData.vaccineBlueprint = outputs.vaccineBlueprint;
      if (outputs.vaccineBlueprintPath) updateData.vaccineBlueprintPath = outputs.vaccineBlueprintPath;
      if (outputs.neoantigenReportPath) updateData.neoantigenReportPath = outputs.neoantigenReportPath;
      if (outputs.fullReportPdfPath) updateData.fullReportPdfPath = outputs.fullReportPdfPath;
      if (outputs.patientSummaryPath) updateData.patientSummaryPath = outputs.patientSummaryPath;
    }
  }

  await prisma.pipelineJob.update({
    where: { id: jobId },
    data: updateData,
  });

  return { isLastStep, nextStep };
}

export async function markJobComplete(jobId: string): Promise<void> {
  const job = await prisma.pipelineJob.findUniqueOrThrow({ where: { id: jobId } });
  const totalComputeSeconds = job.startedAt
    ? Math.round((Date.now() - job.startedAt.getTime()) / 1000)
    : null;

  await prisma.pipelineJob.update({
    where: { id: jobId },
    data: {
      status: 'complete',
      currentStep: null,
      completedAt: new Date(),
      totalComputeSeconds,
    },
  });
}

export async function markJobFailed(jobId: string, step: string, error: string): Promise<void> {
  const job = await prisma.pipelineJob.findUniqueOrThrow({ where: { id: jobId } });
  const stepErrors = (job.stepErrors as Record<string, string> | null) ?? {};
  stepErrors[step] = error;

  await prisma.pipelineJob.update({
    where: { id: jobId },
    data: {
      status: 'failed',
      stepErrors,
    },
  });
}

export async function incrementRetry(jobId: string): Promise<{ retryCount: number; maxRetries: number }> {
  const job = await prisma.pipelineJob.update({
    where: { id: jobId },
    data: { retryCount: { increment: 1 } },
  });
  return { retryCount: job.retryCount, maxRetries: job.maxRetries };
}

export async function getJob(jobId: string) {
  return prisma.pipelineJob.findUniqueOrThrow({ where: { id: jobId } });
}
