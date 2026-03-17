import type { ResolverContext } from '../context';

export const pipelineResolvers = {
  Query: {
    pipelineJobs: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.prisma.pipelineJob.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
      });
    },
    pipelineJob: async (_: unknown, { id }: { id: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.pipelineJob.findUnique({ where: { id } });
    },
  },
  Mutation: {
    cancelPipelineJob: async (
      _: unknown,
      { jobId }: { jobId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const job = await ctx.prisma.pipelineJob.findUnique({ where: { id: jobId } });
      if (!job) throw new Error('Pipeline job not found');
      if (!['queued', 'running'].includes(job.status)) {
        throw new Error(`Cannot cancel job with status: ${job.status}`);
      }
      return ctx.prisma.pipelineJob.update({
        where: { id: jobId },
        data: { status: 'cancelled' },
      });
    },
    submitPipelineJob: async (
      _: unknown,
      args: {
        tumorDataPath: string;
        normalDataPath: string;
        rnaDataPath?: string;
        inputFormat: string;
        referenceGenome: string;
      },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.submitPipelineJob({ patientId: patient.id, ...args });
    },
  },
};
