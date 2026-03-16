import type { ResolverContext } from '../context';

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      return ctx.session;
    },
  },
  Mutation: {
    logout: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) return false;
      return true;
    },
  },
};
