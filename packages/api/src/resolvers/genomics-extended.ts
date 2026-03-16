import type { ResolverContext } from '../context';

export const genomicsExtendedResolvers = {
  Query: {
    matchDelta: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return null;
      return ctx.lib.computeMatchDelta(patient.id);
    },
  },
  Mutation: {
    confirmGenomics: async (
      _: unknown,
      { genomicResultId, edits }: { genomicResultId: string; edits?: any },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.confirmGenomics(patient.id, genomicResultId, edits);
    },
    rematch: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.computeMatchDelta(patient.id);
    },
  },
};
