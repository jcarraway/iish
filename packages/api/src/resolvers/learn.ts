import type { ResolverContext } from '../context';

function requirePatientId(ctx: ResolverContext) {
  if (!ctx.session) throw new Error('UNAUTHORIZED');
  return ctx.session.userId;
}

export const learnResolvers = {
  Query: {
    // Public queries — no auth required
    article: async (_: any, args: { slug: string }, ctx: ResolverContext) => {
      return ctx.lib.getArticle(args.slug);
    },
    articles: async (_: any, args: { filters?: any }, ctx: ResolverContext) => {
      return ctx.lib.getArticles(args.filters);
    },
    articlesByCategory: async (_: any, args: { category: string }, ctx: ResolverContext) => {
      return ctx.lib.getArticlesByCategory(args.category);
    },
    searchArticles: async (_: any, args: { query: string; filters?: any }, ctx: ResolverContext) => {
      return ctx.lib.searchArticles(args.query, args.filters);
    },
    glossaryTerms: async (_: any, args: { category?: string }, ctx: ResolverContext) => {
      return ctx.lib.getGlossaryTerms(args.category);
    },
    glossaryTerm: async (_: any, args: { slug: string }, ctx: ResolverContext) => {
      return ctx.lib.getGlossaryTerm(args.slug);
    },

    // Authenticated queries
    readingPlan: async (_: any, __: any, ctx: ResolverContext) => {
      const userId = requirePatientId(ctx);
      const patient = await ctx.prisma.patient.findUnique({ where: { userId } });
      if (!patient) return null;
      return ctx.lib.generateReadingPlan(patient.id);
    },
    articlesAdmin: async (_: any, args: { filters?: any }, ctx: ResolverContext) => {
      requirePatientId(ctx);
      return ctx.lib.getArticlesAdmin(args.filters);
    },

    // Public — INTEL cross-links
    relatedResearch: async (_: any, args: { slug: string; limit?: number }, ctx: ResolverContext) => {
      return ctx.lib.getRelatedResearch(args.slug, args.limit ?? 5);
    },
    articlesForResearchItem: async (_: any, args: { itemId: string; limit?: number }, ctx: ResolverContext) => {
      return ctx.lib.getArticlesForResearchItem(args.itemId, args.limit ?? 3);
    },

    // Authenticated — refresh status
    articleRefreshStatus: async (_: any, args: { articleId: string }, ctx: ResolverContext) => {
      requirePatientId(ctx);
      return ctx.lib.getArticleRefreshStatus(args.articleId);
    },
    articleEngagement: async (_: any, __: any, ctx: ResolverContext) => {
      requirePatientId(ctx);
      return ctx.lib.getArticleEngagement();
    },
  },
  Mutation: {
    generateArticle: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      requirePatientId(ctx);
      return ctx.lib.generateArticle(args.input);
    },
    publishArticle: async (_: any, args: { articleId: string }, ctx: ResolverContext) => {
      requirePatientId(ctx);
      return ctx.lib.publishArticle(args.articleId);
    },
    generatePersonalizedContext: async (_: any, args: { slug: string }, ctx: ResolverContext) => {
      const userId = requirePatientId(ctx);
      const patient = await ctx.prisma.patient.findUnique({ where: { userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generatePersonalizedContext(patient.id, args.slug);
    },
    generateReadingPlan: async (_: any, __: any, ctx: ResolverContext) => {
      const userId = requirePatientId(ctx);
      const patient = await ctx.prisma.patient.findUnique({ where: { userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateReadingPlan(patient.id);
    },
    updateArticleStatus: async (_: any, args: { articleId: string; status: string; notes?: string }, ctx: ResolverContext) => {
      requirePatientId(ctx);
      return ctx.lib.updateArticleStatus(args.articleId, args.status, args.notes);
    },
    checkArticleQuality: async (_: any, args: { articleId: string }, ctx: ResolverContext) => {
      requirePatientId(ctx);
      return ctx.lib.checkArticleQuality(args.articleId);
    },
    runArticleQualityChecks: async (_: any, __: any, ctx: ResolverContext) => {
      requirePatientId(ctx);
      return ctx.lib.runArticleQualityChecks();
    },
    insertPlatformLinks: async (_: any, args: { articleId: string }, ctx: ResolverContext) => {
      requirePatientId(ctx);
      return ctx.lib.insertPlatformLinks(args.articleId);
    },
    generateRefreshSuggestion: async (_: any, args: { articleId: string; triggerItemIds: string[] }, ctx: ResolverContext) => {
      requirePatientId(ctx);
      return ctx.lib.generateRefreshSuggestion(args.articleId, args.triggerItemIds);
    },
    runRefreshCheckCycle: async (_: any, __: any, ctx: ResolverContext) => {
      requirePatientId(ctx);
      return ctx.lib.runRefreshCheckCycle();
    },
  },
};
