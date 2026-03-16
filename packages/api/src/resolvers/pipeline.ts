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
    reports: async (_: unknown, { pipelineJobId }: { pipelineJobId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.report.findMany({
        where: { pipelineJobId },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Mutation: {
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
    generateReport: async (
      _: unknown,
      { pipelineJobId, reportType }: { pipelineJobId: string; reportType: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.generateReport(pipelineJobId, reportType);
    },
  },
};
