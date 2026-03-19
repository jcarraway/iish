import type { ResolverContext } from '../context';

export const fertilityResolvers = {
  Query: {
    fertilityAssessment: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getFertilityAssessment(patient.id);
    },
    preservationOptions: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getPreservationOptions(patient.id);
    },
    fertilityProviders: async (_: any, args: { filters?: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      const filters = args.filters ? JSON.parse(args.filters) : undefined;
      return ctx.lib.getFertilityProviders(patient.id, filters);
    },
    fertilityFinancialPrograms: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getFertilityFinancialPrograms(patient.id);
    },
  },
  Mutation: {
    assessFertilityRisk: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.assessFertilityRisk(patient.id);
    },
    generateFertilityDiscussionGuide: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateFertilityDiscussionGuide(patient.id);
    },
    requestFertilityReferral: async (_: any, args: { input: { assessmentId: string; providerId: string } }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.requestFertilityReferral(args.input.assessmentId, args.input.providerId);
    },
    updateFertilityOutcome: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const { assessmentId, ...updates } = args.input;
      return ctx.lib.updateFertilityOutcome(assessmentId, updates);
    },
  },
  FertilityAssessment: {
    riskFactors: (parent: any) => {
      if (Array.isArray(parent.riskFactors)) return parent.riskFactors;
      return typeof parent.riskFactors === 'object' ? Object.values(parent.riskFactors) : [];
    },
  },
};
