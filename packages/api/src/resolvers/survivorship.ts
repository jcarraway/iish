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
    careTeam: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.lib.getCareTeam(patient.id);
    },
    routeSymptom: async (
      _: unknown,
      { symptom }: { symptom: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.routeSymptom(patient.id, symptom);
    },
    appointmentPrep: async (
      _: unknown,
      { eventId }: { eventId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return null;
      // Check cache/stored — generateAppointmentPrep doubles as a getter (it caches)
      return ctx.lib.getAppointmentPrep(patient.id, eventId);
    },
    ctdnaHistory: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.lib.getCtdnaHistory(patient.id);
    },
    notificationPreferences: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return null;
      return ctx.lib.getNotificationPreferences(patient.id);
    },
    notificationHistory: async (
      _: unknown,
      { limit }: { limit?: number },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.lib.getNotificationHistory(patient.id, limit);
    },
    survivorshipFeedback: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.lib.getFeedback(patient.id);
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
    addCareTeamMember: async (
      _: unknown,
      { input }: { input: { name: string; role: string; practice?: string; phone?: string; contactFor?: string[] } },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.addCareTeamMember(patient.id, input);
    },
    updateCareTeamMember: async (
      _: unknown,
      { input }: { input: { memberId: string; name?: string; role?: string; practice?: string; phone?: string; contactFor?: string[] } },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      const { memberId, ...updates } = input;
      return ctx.lib.updateCareTeamMember(patient.id, memberId, updates);
    },
    removeCareTeamMember: async (
      _: unknown,
      { memberId }: { memberId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      await ctx.lib.removeCareTeamMember(patient.id, memberId);
      return true;
    },
    generateAppointmentPrep: async (
      _: unknown,
      { eventId }: { eventId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateAppointmentPrep(patient.id, eventId);
    },
    addCtdnaResult: async (
      _: unknown,
      { input }: { input: { testDate: string; provider: string; result: string; ctdnaLevel?: number; documentId?: string } },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.addCtdnaResult(patient.id, input);
    },
    updateNotificationPreferences: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.updateNotificationPreferences(patient.id, input);
    },
    submitFeedback: async (
      _: unknown,
      { input }: { input: { feedbackType: string; rating?: number; comment?: string; context?: any } },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.submitFeedback(patient.id, input);
    },
    annualRefreshSCP: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      const result = await ctx.lib.annualRefreshSCP(patient.id);
      const plan = await ctx.prisma.survivorshipPlan.findUnique({
        where: { patientId: patient.id },
      });
      return { newPlan: plan, diff: result.diff };
    },
  },
};
