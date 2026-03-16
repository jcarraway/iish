import { PrismaClient } from '@oncovax/db/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { PIPELINE_STEP_ORDER, PIPELINE_STEP_GRAPH, PIPELINE_STEP_PREREQUISITES } from '@oncovax/shared';

const s3 = new S3Client({});

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
): Promise<{ isLastStep: boolean; nextSteps: string[] }> {
  // Use a transaction with serializable isolation to prevent race conditions
  // when two parallel steps (e.g., hla_typing + peptide_generation) complete simultaneously
  const result = await prisma.$transaction(async (tx) => {
    const job = await tx.pipelineJob.findUniqueOrThrow({ where: { id: jobId } });
    const stepsCompleted = [...job.stepsCompleted, step];

    const updateData: Record<string, unknown> = {
      stepsCompleted,
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
      if (step === 'peptide_generation' && outputs.peptideFilePath) {
        updateData.peptideFilePath = outputs.peptideFilePath;
      }
      if (step === 'neoantigen_prediction') {
        if (outputs.neoantigenCount !== undefined) updateData.neoantigenCount = outputs.neoantigenCount;
        if (outputs.neoantigenReportPath) updateData.neoantigenReportPath = outputs.neoantigenReportPath;
        if (outputs.topNeoantigens) updateData.topNeoantigens = outputs.topNeoantigens;
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

    // DAG-based successor resolution
    const successors = PIPELINE_STEP_GRAPH[step] ?? [];
    const nextSteps: string[] = [];

    for (const successor of successors) {
      const prerequisites = PIPELINE_STEP_PREREQUISITES[successor] ?? [];
      const allPrerequisitesMet = prerequisites.every((prereq) =>
        stepsCompleted.includes(prereq)
      );
      if (allPrerequisitesMet) {
        nextSteps.push(successor);
      }
    }

    const isLastStep = successors.length === 0 && nextSteps.length === 0;

    // Set currentStep: use the first next step, or null if pipeline is done or waiting
    updateData.currentStep = nextSteps.length > 0 ? nextSteps[0] : (isLastStep ? null : job.currentStep);

    await tx.pipelineJob.update({
      where: { id: jobId },
      data: updateData,
    });

    return { isLastStep, nextSteps };
  }, {
    isolationLevel: 'Serializable',
  });

  // Post-transaction: bulk-insert NeoantigenCandidate records
  if (step === 'neoantigen_prediction' && outputs?.neoantigenReportPath) {
    try {
      const reportPath = outputs.neoantigenReportPath as string;
      const bucket = process.env.AWS_S3_PIPELINE_BUCKET!;

      const response = await s3.send(new GetObjectCommand({
        Bucket: bucket,
        Key: reportPath,
      }));
      const chunks: Buffer[] = [];
      const stream = response.Body as AsyncIterable<Buffer>;
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const body = Buffer.concat(chunks).toString('utf-8');
      const report = JSON.parse(body);
      const neoantigens = report.neoantigens as Array<Record<string, unknown>>;

      if (neoantigens && neoantigens.length > 0) {
        await prisma.neoantigenCandidate.createMany({
          data: neoantigens.map((n) => ({
            jobId,
            gene: n.gene as string,
            mutation: n.mutation as string,
            chromosome: n.chromosome as string,
            position: n.position as number,
            refAllele: '',
            altAllele: '',
            variantType: n.variantType as string,
            vaf: n.vaf as number,
            wildtypePeptide: n.wildtypePeptide as string,
            mutantPeptide: n.mutantPeptide as string,
            peptideLength: n.peptideLength as number,
            hlaAllele: n.hlaAllele as string,
            bindingAffinityNm: n.bindingAffinityNm as number,
            bindingRankPercentile: n.bindingRankPercentile as number,
            wildtypeBindingNm: (n.wildtypeBindingNm as number) ?? null,
            bindingClass: n.bindingClass as string,
            immunogenicityScore: n.immunogenicityScore as number,
            agretopicity: n.agretopicity as number,
            expressionLevel: (n.expressionLevel as number) ?? null,
            clonality: n.clonality as number,
            structuralExposure: (n.structuralExposure as number) ?? null,
            compositeScore: n.compositeScore as number,
            rank: n.rank as number,
            confidence: n.confidence as string,
            details: JSON.parse(JSON.stringify(n)),
          })),
        });
      }
    } catch (err) {
      // Log but don't fail the step — the report was already saved to S3
      console.error('Failed to bulk-insert NeoantigenCandidate records:', err);
    }
  }

  return result;
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
