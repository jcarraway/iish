import type { ResolverContext } from '../context';

function requireAuth(ctx: ResolverContext) {
  if (!ctx.session) throw new Error('UNAUTHORIZED');
  return ctx.session.userId;
}

export const intelResolvers = {
  Query: {
    // Public queries — no auth required
    researchItems: async (_: any, args: { filters?: any }, ctx: ResolverContext) => {
      const result = await ctx.lib.getResearchItems(args.filters);
      // lib returns { items, total } — GraphQL expects array
      return result?.items ?? result ?? [];
    },
    researchItem: async (_: any, args: { id: string }, ctx: ResolverContext) => {
      return ctx.lib.getResearchItem(args.id);
    },
    searchResearch: async (_: any, args: { query: string; filters?: any }, ctx: ResolverContext) => {
      const result = await ctx.lib.searchResearchItems(args.query, args.filters);
      return result?.items ?? result ?? [];
    },

    // Authenticated queries
    ingestionSyncStates: async (_: any, __: any, ctx: ResolverContext) => {
      requireAuth(ctx);
      return ctx.lib.getSyncStates();
    },
    personalizedFeed: async (_: any, args: { filters?: any }, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      return ctx.lib.getPersonalizedFeed(userId, args.filters);
    },
    personalizedNote: async (_: any, args: { itemId: string }, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      return ctx.lib.getPersonalizedNote(args.itemId, userId);
    },
    feedConfig: async (_: any, __: any, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      return ctx.lib.getFeedConfig(userId);
    },

    // Landscape Views (I6, public)
    landscapeOverview: async (_: any, __: any, ctx: ResolverContext) => {
      return ctx.lib.getLandscapeOverview();
    },
    subtypeLandscape: async (_: any, args: { subtype: string }, ctx: ResolverContext) => {
      return ctx.lib.getSubtypeLandscape(args.subtype);
    },
    treatmentPipeline: async (_: any, args: { subtype?: string }, ctx: ResolverContext) => {
      return ctx.lib.getTreatmentPipeline(args.subtype);
    },
    recentDevelopments: async (_: any, args: { subtype?: string; days?: number }, ctx: ResolverContext) => {
      return ctx.lib.getRecentDevelopments(args.subtype, args.days);
    },

    // Landscape Integration (I6, authenticated)
    translatorUpdates: async (_: any, __: any, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      const patient = await ctx.prisma.patient.findFirst({ where: { userId } });
      if (!patient) return { hasUpdates: false, items: [], count: 0, since: '' };
      return ctx.lib.checkTranslatorUpdates(patient.id);
    },
    financialUpdates: async (_: any, __: any, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      const patient = await ctx.prisma.patient.findFirst({ where: { userId } });
      if (!patient) return { newApprovals: [], hasPAPOpportunities: false };
      return ctx.lib.checkFinancialUpdates(patient.id);
    },
    survivorshipUpdates: async (_: any, __: any, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      const patient = await ctx.prisma.patient.findFirst({ where: { userId } });
      if (!patient) return { lateEffectsItems: [], ctdnaItems: [], hasUpdates: false };
      return ctx.lib.checkSurvivorshipUpdates(patient.id);
    },

    // Community Intelligence (I5)
    communityReports: async (_: any, __: any, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      const patient = await ctx.prisma.patient.findFirst({ where: { userId } });
      if (!patient) return [];
      return ctx.lib.getCommunityReports(patient.id);
    },
    communityInsights: async (_: any, args: { drugName: string }, ctx: ResolverContext) => {
      requireAuth(ctx);
      return ctx.lib.getCommunityInsights(args.drugName);
    },
    communityInsightsForItem: async (_: any, args: { itemId: string }, ctx: ResolverContext) => {
      requireAuth(ctx);
      return ctx.lib.getCommunityInsightsForItem(args.itemId);
    },
    digestPreview: async (_: any, __: any, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      return ctx.lib.compileDigest(userId, 'weekly');
    },
  },
  Mutation: {
    markItemViewed: async (_: any, args: { itemId: string }, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      return ctx.lib.markItemViewed(userId, args.itemId);
    },
    markItemSaved: async (_: any, args: { itemId: string; saved: boolean }, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      return ctx.lib.markItemSaved(userId, args.itemId, args.saved);
    },
    markItemDismissed: async (_: any, args: { itemId: string }, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      return ctx.lib.markItemDismissed(userId, args.itemId);
    },
    updateFeedConfig: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      return ctx.lib.updateFeedConfig(userId, args.input);
    },
    computeRelevanceScores: async (_: any, __: any, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      const result = await ctx.lib.computeRelevanceScores(userId);
      return result.computed;
    },
    triggerIngestion: async (_: any, args: { sourceId: string }, ctx: ResolverContext) => {
      requireAuth(ctx);
      const result = await ctx.lib.triggerIngestion(args.sourceId);
      // triggerIngestion returns { ingested, skipped, errors } — map to IngestionCycleResult
      return {
        ingested: result?.ingested ?? 0,
        classified: 0,
        summarized: 0,
        skipped: result?.skipped ?? 0,
        errors: result?.errors ?? 0,
      };
    },
    reclassifyItem: async (_: any, args: { itemId: string }, ctx: ResolverContext) => {
      requireAuth(ctx);
      return ctx.lib.reclassifyItem(args.itemId);
    },
    runQCPipeline: async (_: any, args: { batchSize?: number }, ctx: ResolverContext) => {
      requireAuth(ctx);
      return ctx.lib.processQCQueue(args.batchSize ?? 10);
    },
    migrateOldTaxonomy: async (_: any, __: any, ctx: ResolverContext) => {
      requireAuth(ctx);
      return ctx.lib.migrateOldTaxonomy();
    },

    // Landscape Views (I6)
    generateStandardOfCare: async (_: any, args: { subtype: string }, ctx: ResolverContext) => {
      requireAuth(ctx);
      return ctx.lib.generateStandardOfCareSummary(args.subtype);
    },

    // Community Intelligence (I5)
    submitCommunityReport: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      const patient = await ctx.prisma.patient.findFirst({ where: { userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.submitCommunityReport(patient.id, args.input);
    },
    moderateCommunityReport: async (_: any, args: { reportId: string; status: string }, ctx: ResolverContext) => {
      requireAuth(ctx);
      return ctx.lib.moderateCommunityReport(args.reportId, args.status);
    },
    updateDigestPreferences: async (_: any, args: { frequency?: string | null }, ctx: ResolverContext) => {
      const userId = requireAuth(ctx);
      return ctx.lib.updateDigestPreferences(userId, args.frequency ?? null);
    },
  },
};
