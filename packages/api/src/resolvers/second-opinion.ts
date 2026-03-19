import type { ResolverContext } from '../context';

export const secondOpinionResolvers = {
  Query: {
    secondOpinionEvaluation: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.evaluateSecondOpinionTriggers(patient.id);
    },
    secondOpinionRequest: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getSecondOpinionRequest(patient.id);
    },
    secondOpinionCenters: async (_: any, args: { virtual?: boolean; subspecialty?: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      const filters: any = {};
      if (args.virtual != null) filters.virtual = args.virtual;
      if (args.subspecialty) filters.subspecialty = args.subspecialty;
      return ctx.lib.getSecondOpinionCenters(patient.id, Object.keys(filters).length > 0 ? filters : undefined);
    },
  },
  Mutation: {
    createSecondOpinionRequest: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.createSecondOpinionRequest(patient.id);
    },
    generateRecordPacket: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateRecordPacket(patient.id);
    },
    generateCommunicationGuide: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateCommunicationGuide(patient.id);
    },
    selectSecondOpinionCenter: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      const { centerId, isVirtual, appointmentDate } = args.input;
      return ctx.lib.selectCenter(patient.id, centerId, isVirtual, appointmentDate);
    },
    recordSecondOpinionOutcome: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      const { outcome, outcomeSummary } = args.input;
      return ctx.lib.recordSecondOpinionOutcome(patient.id, outcome, outcomeSummary);
    },
  },
};
