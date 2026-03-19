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
  },
  Mutation: {
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
  },
};
