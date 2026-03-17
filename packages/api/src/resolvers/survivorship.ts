import type { ResolverContext } from '../context';

export const survivorshipResolvers = {
  Query: {
    survivorshipPlan: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return null;
      return ctx.prisma.survivorshipPlan.findUnique({
        where: { patientId: patient.id },
      });
    },
    surveillanceSchedule: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.prisma.surveillanceEvent.findMany({
        where: { patientId: patient.id },
        orderBy: { dueDate: 'asc' },
      });
    },
    journalEntries: async (
      _: unknown,
      { limit }: { limit?: number },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.prisma.journalEntry.findMany({
        where: { patientId: patient.id },
        orderBy: { entryDate: 'desc' },
        ...(limit ? { take: limit } : {}),
      });
    },
  },
  Mutation: {
    completeTreatment: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      await ctx.lib.generateSCP(patient.id, input);
      return ctx.prisma.survivorshipPlan.findUnique({
        where: { patientId: patient.id },
      });
    },
    refreshSCP: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      await ctx.lib.refreshSCP(patient.id);
      return ctx.prisma.survivorshipPlan.findUnique({
        where: { patientId: patient.id },
      });
    },
  },
};
