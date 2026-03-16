import type { ResolverContext } from '../context';

export const sequencingResolvers = {
  Query: {
    sequencingProviders: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      return ctx.prisma.sequencingProvider.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
      });
    },
    sequencingOrders: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.prisma.sequencingOrder.findMany({
        where: { patientId: patient.id },
        include: { provider: true },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Mutation: {
    checkInsuranceCoverage: async (
      _: unknown,
      { insurer, testType }: { insurer: string; testType: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.checkCoverage(patient.id, insurer, testType);
    },
  },
};
