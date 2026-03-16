import type { ResolverContext } from '../context';

export const sequencingGuideResolvers = {
  Query: {
    sequencingRecommendation: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateSequencingRecommendation(patient.id);
    },
    sequencingExplanation: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateSequencingExplanation(patient.id);
    },
    testRecommendation: async (
      _: unknown,
      { tissueAvailable, preferComprehensive }: { tissueAvailable?: boolean; preferComprehensive?: boolean },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateTestRecommendation(patient.id, { tissueAvailable, preferComprehensive });
    },
    conversationGuide: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateConversationGuide(patient.id);
    },
    waitingContent: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateWaitingContent(patient.id);
    },
    sequencingBrief: async (
      _: unknown,
      { testType, providerIds, insurer }: { testType: string; providerIds: string[]; insurer?: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateSequencingBrief(patient.id, testType, providerIds, insurer);
    },
  },
  Mutation: {
    generateLOMN: async (
      _: unknown,
      { testType, insurer }: { testType: string; insurer?: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateLOMN(patient.id, testType, insurer);
    },
    generateSequencingRecommendation: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateSequencingRecommendation(patient.id);
    },
  },
};
