import type { ResolverContext } from '../context';

export const preventiveResolvers = {
  Query: {
    // Public
    preventiveTrials: async (_: any, args: { category?: string }, ctx: ResolverContext) => {
      const result = await ctx.lib.getPreventiveTrials(args.category ? { category: args.category } : undefined);
      return result.trials;
    },
    preventivePrescreen: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      const userId = ctx.session?.userId ?? null;
      const result = await ctx.lib.runPreventivePrescreen(args.input, userId);
      const { trials } = await ctx.lib.getPreventiveTrials();
      return { ...result, totalPreventiveTrials: trials.length };
    },

    // Authenticated
    preventiveTrialsForFamily: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getPreventiveTrialsForFamily(patient.id);
    },
    recurrencePreventionTrials: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getRecurrencePreventionTrials(patient.id);
    },
    referralStats: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return { totalSent: 0, totalRedeemed: 0 };
      return ctx.lib.getReferralStats(patient.id);
    },
  },
  Mutation: {
    // Public
    redeemReferralCode: async (_: any, args: { code: string }, ctx: ResolverContext) => {
      const userId = ctx.session?.userId ?? null;
      return ctx.lib.redeemReferralCode(args.code, userId);
    },

    // Authenticated
    generateFamilyReferralLink: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateReferralLink(patient.id);
    },
  },
};
