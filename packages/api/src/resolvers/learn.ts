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
  },
};
