import type { ResolverContext } from '../context';

export const recurrenceResolvers = {
  Query: {
    recurrenceEvent: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return null;
      return ctx.lib.getRecurrenceEvent(patient.id);
    },
    recurrenceEvents: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.lib.getRecurrenceEvents(patient.id);
    },
    genomicComparison: async (
      _: unknown,
      { recurrenceEventId }: { recurrenceEventId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateGenomicComparison(patient.id, recurrenceEventId);
    },
    secondOpinionResources: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.lib.getSecondOpinionResources(patient.id);
    },
  },
  Mutation: {
    reportRecurrence: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.reportRecurrence(patient.id, input);
    },
    acknowledgeRecurrence: async (
      _: unknown,
      { recurrenceEventId }: { recurrenceEventId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.acknowledgeRecurrence(recurrenceEventId);
    },
    updateCascadeStep: async (
      _: unknown,
      { input }: { input: { recurrenceEventId: string; step: string; value: boolean } },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.updateCascadeStep(input.recurrenceEventId, input.step, input.value);
    },
    regenerateTranslator: async (
      _: unknown,
      { recurrenceEventId }: { recurrenceEventId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.regenerateTranslator(patient.id, recurrenceEventId);
    },
    archiveSurvivorshipPlan: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.archiveSurvivorshipPlan(patient.id);
    },
  },
  RecurrenceEvent: {
    cascadeStatus: (parent: any) => {
      const cs = parent.cascadeStatus || {};
      return {
        acknowledged: cs.acknowledged ?? false,
        supportOffered: cs.supportOffered ?? false,
        resequencingRecommended: cs.resequencingRecommended ?? false,
        trialRematched: cs.trialRematched ?? false,
        financialRematched: cs.financialRematched ?? false,
        secondOpinionOffered: cs.secondOpinionOffered ?? false,
        careTeamUpdated: cs.careTeamUpdated ?? false,
        translatorRegenerated: cs.translatorRegenerated ?? false,
        planArchived: cs.planArchived ?? false,
        pipelineActivated: cs.pipelineActivated ?? false,
        genomicComparisonReady: cs.genomicComparisonReady ?? false,
      };
    },
  },
};
