import type { ResolverContext } from '../context';

export const palliativeResolvers = {
  Query: {
    latestPalliativeAssessment: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getLatestAssessment(patient.id);
    },
    symptomAssessmentHistory: async (_: any, args: { limit?: number }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getSymptomAssessments(patient.id, args.limit);
    },
    palliativeCareProviders: async (_: any, args: { filters?: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getPalliativeCareProviders(patient.id, args.filters);
    },
    advanceCarePlan: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.getAdvanceCarePlan(patient.id);
    },
    shouldRecommendPalliative: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return { recommended: false, reasons: [] };
      return ctx.lib.shouldRecommendPalliative(patient.id);
    },
  },
  Mutation: {
    submitSymptomAssessment: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.submitSymptomAssessment(patient.id, args.input);
    },
    updateAdvanceCarePlan: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.updateAdvanceCarePlan(patient.id, args.input);
    },
    generateGoalsOfCareGuide: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateGoalsOfCareGuide(patient.id);
    },
    generateReferralLetter: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateReferralLetter(patient.id);
    },
    selectPalliativeProvider: async (_: any, args: { assessmentId: string; providerId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.palliativeAssessment.update({
        where: { id: args.assessmentId },
        data: { providerId: args.providerId },
      });
    },
  },
  PalliativeAssessment: {
    recommendations: (parent: any) => {
      if (Array.isArray(parent.recommendations)) return parent.recommendations;
      return [];
    },
  },
};
