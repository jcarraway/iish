import type { ResolverContext } from '../context';

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      return ctx.session;
    },
  },
  Mutation: {
    requestMagicLink: async (_: unknown, { email }: { email: string }, ctx: ResolverContext) => {
      await ctx.lib.requestMagicLink(email);
      return true;
    },
    logout: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) return false;
      return true;
    },
  },
};
