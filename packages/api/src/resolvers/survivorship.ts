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
    journalTrends: async (
      _: unknown,
      { days }: { days: number },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.getJournalTrends(patient.id, days);
    },
    lifestyleRecommendations: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return null;
      return ctx.lib.getLifestyleRecommendations(patient.id);
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
    markEventComplete: async (
      _: unknown,
      { input }: { input: { eventId: string; completedDate: string; resultSummary?: string; resultDocumentId?: string } },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      const event = await ctx.prisma.surveillanceEvent.findUnique({ where: { id: input.eventId } });
      if (!event || event.patientId !== patient.id) throw new Error('Event not found');
      return ctx.lib.markEventComplete(input.eventId, input.completedDate, input.resultSummary, input.resultDocumentId);
    },
    skipEvent: async (
      _: unknown,
      { input }: { input: { eventId: string; reason: string } },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      const event = await ctx.prisma.surveillanceEvent.findUnique({ where: { id: input.eventId } });
      if (!event || event.patientId !== patient.id) throw new Error('Event not found');
      return ctx.lib.skipEvent(input.eventId, input.reason);
    },
    rescheduleEvent: async (
      _: unknown,
      { input }: { input: { eventId: string; newDueDate: string } },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      const event = await ctx.prisma.surveillanceEvent.findUnique({ where: { id: input.eventId } });
      if (!event || event.patientId !== patient.id) throw new Error('Event not found');
      return ctx.lib.rescheduleEvent(input.eventId, input.newDueDate);
    },
    uploadEventResult: async (
      _: unknown,
      { input }: { input: { eventId: string; documentId: string } },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      const event = await ctx.prisma.surveillanceEvent.findUnique({ where: { id: input.eventId } });
      if (!event || event.patientId !== patient.id) throw new Error('Event not found');
      return ctx.lib.uploadEventResult(input.eventId, input.documentId);
    },
    submitJournalEntry: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.submitJournalEntry(patient.id, input);
    },
    deleteJournalEntry: async (
      _: unknown,
      { entryId }: { entryId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      await ctx.lib.deleteJournalEntry(patient.id, entryId);
      return true;
    },
    generateLifestyleRecommendations: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateLifestyleRecommendations(patient.id);
    },
  },
};
