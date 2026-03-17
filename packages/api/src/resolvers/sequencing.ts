import type { ResolverContext } from '../context';

export const sequencingResolvers = {
  SequencingProvider: {
    slug: (parent: Record<string, unknown>) => parent.slug ?? (parent.details as Record<string, unknown>)?.slug ?? '',
    testNames: (parent: Record<string, unknown>) => (parent.details as Record<string, unknown>)?.testNames ?? [],
    geneCount: (parent: Record<string, unknown>) => (parent.details as Record<string, unknown>)?.geneCount ?? 0,
    sampleTypes: (parent: Record<string, unknown>) => (parent.details as Record<string, unknown>)?.sampleTypes ?? [],
    turnaroundDaysMin: (parent: Record<string, unknown>) => ((parent.details as Record<string, unknown>)?.turnaroundDays as Record<string, unknown>)?.min ?? 0,
    turnaroundDaysMax: (parent: Record<string, unknown>) => ((parent.details as Record<string, unknown>)?.turnaroundDays as Record<string, unknown>)?.max ?? 0,
    costRangeMin: (parent: Record<string, unknown>) => ((parent.details as Record<string, unknown>)?.costRange as Record<string, unknown>)?.min ?? 0,
    costRangeMax: (parent: Record<string, unknown>) => ((parent.details as Record<string, unknown>)?.costRange as Record<string, unknown>)?.max ?? 0,
    fdaApproved: (parent: Record<string, unknown>) => (parent.details as Record<string, unknown>)?.fdaApproved ?? false,
    orderingProcess: (parent: Record<string, unknown>) => (parent.details as Record<string, unknown>)?.orderingProcess ?? null,
    reportFormat: (parent: Record<string, unknown>) => (parent.details as Record<string, unknown>)?.reportFormat ?? null,
    website: (parent: Record<string, unknown>) => (parent.details as Record<string, unknown>)?.website ?? null,
  },
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
    createSequencingOrder: async (
      _: unknown,
      { providerId, testType }: { providerId: string; testType: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.createSequencingOrder(patient.id, providerId, testType);
    },
  },
};
