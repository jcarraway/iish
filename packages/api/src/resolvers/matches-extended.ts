import type { ResolverContext } from '../context';

export const matchesExtendedResolvers = {
  Query: {
    oncologistBrief: async (
      _: unknown,
      { matchId }: { matchId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.generateOncologistBrief(matchId);
    },
  },
};
