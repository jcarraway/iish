import type { ResolverContext } from '../context';

export const advocateResolvers = {
  Query: {
    insuranceDenials: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getDenials(patient.id);
    },
    insuranceDenial: async (_: any, args: { id: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.getDenial(args.id);
    },
    appealLetter: async (_: any, args: { id: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.getAppealLetter(args.id);
    },
    appealStrategy: async (_: any, args: { denialCategory: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.getAppealStrategy(args.denialCategory);
    },
    appealRights: async (_: any, args: { state?: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      if (!args.state) {
        const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
        const profile = patient?.profile as any;
        return ctx.lib.getAppealRights(profile?.state || undefined);
      }
      return ctx.lib.getAppealRights(args.state);
    },
  },
  Mutation: {
    createInsuranceDenial: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.createDenial(patient.id, args.input);
    },
    generateAppealLetter: async (_: any, args: { denialId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.generateAppealLetter(args.denialId);
    },
    updateAppealOutcome: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const { appealId, ...updates } = args.input;
      return ctx.lib.updateAppealOutcome(appealId, updates);
    },
    updateDenialStatus: async (_: any, args: { input: { denialId: string; status: string } }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.updateDenialStatus(args.input.denialId, args.input.status);
    },
    generatePeerReviewPrep: async (_: any, args: { denialId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.generatePeerReviewPrep(args.denialId);
    },
  },
};
