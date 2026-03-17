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
    requestMagicLink: async (
      _: unknown,
      { email, redirect }: { email: string; redirect?: string },
      ctx: ResolverContext,
    ) => {
      await ctx.lib.sendMagicLink(email, redirect);
      return true;
    },
  },
};
