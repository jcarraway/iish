import type { ResolverContext } from '../context';

export const genomicResolvers = {
  Query: {
    genomicResult: async (
      _: unknown,
      { id }: { id: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.genomicResult.findUnique({ where: { id } });
    },
    genomicResults: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.prisma.genomicResult.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Mutation: {
    extractGenomicReport: async (
      _: unknown,
      { documentId }: { documentId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.extractGenomicReport(documentId);
    },
    interpretGenomics: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.interpretGenomics(patient.id);
    },
  },
};
