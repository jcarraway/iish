import type { ResolverContext } from '../context';

export const trialResolvers = {
  Query: {
    trials: async (
      _: unknown,
      { cancerType, phase, limit }: { cancerType?: string; phase?: string; limit?: number },
      ctx: ResolverContext,
    ) => {
      const where: Record<string, unknown> = {};
      if (cancerType) {
        where.conditions = { has: cancerType };
      }
      if (phase) {
        where.phase = phase;
      }
      return ctx.prisma.trial.findMany({
        where,
        take: limit ?? 50,
        orderBy: { lastUpdated: 'desc' },
      });
    },
    trial: async (_: unknown, { id }: { id: string }, ctx: ResolverContext) => {
      return ctx.prisma.trial.findUnique({ where: { id } });
    },
  },
};
