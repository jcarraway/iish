import type { ResolverContext } from '../context';

export const logisticsResolvers = {
  Query: {
    trialLogisticsAssessment: async (_: any, args: { matchId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getLogisticsAssessment(patient.id, args.matchId);
    },
    trialLogisticsAssessments: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getLogisticsAssessments(patient.id);
    },
    assistancePrograms: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getAssistancePrograms(patient.id);
    },
    assistanceApplications: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getAssistanceApplications(patient.id);
    },
  },
  Mutation: {
    assessTrialLogistics: async (_: any, args: { matchId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.assessTrialLogistics(patient.id, args.matchId);
    },
    generateLogisticsPlan: async (_: any, args: { matchId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateLogisticsPlan(patient.id, args.matchId);
    },
    updateAssistanceApplication: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      const { assessmentId, programKey, status, notes } = args.input;
      return ctx.lib.updateAssistanceApplication(patient.id, assessmentId, programKey, status, notes);
    },
  },
};
