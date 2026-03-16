import type { ResolverContext } from '../context';

export const financialExtendedResolvers = {
  Query: {
    financialProgram: async (
      _: unknown,
      { programId }: { programId: string },
      ctx: ResolverContext,
    ) => {
      return ctx.lib.getFinancialProgram(programId);
    },
  },
};
