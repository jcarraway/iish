import type { ResolverContext } from '../context';

export const financialResolvers = {
  Query: {
    financialPrograms: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      return ctx.prisma.financialProgram.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
      });
    },
    financialMatches: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.prisma.financialMatch.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Mutation: {
    matchFinancialPrograms: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.matchFinancialPrograms(patient.id, input);
    },
  },
};
