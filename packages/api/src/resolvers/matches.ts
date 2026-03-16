import type { ResolverContext } from '../context';

export const matchResolvers = {
  Query: {
    matches: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.prisma.match.findMany({
        where: { patientId: patient.id },
        include: { trial: true },
        orderBy: { matchScore: 'desc' },
      });
    },
    match: async (_: unknown, { id }: { id: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.match.findUnique({
        where: { id },
        include: { trial: true },
      });
    },
  },
  Mutation: {
    generateMatches: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.generateMatches(patient.id);
    },
    updateMatchStatus: async (
      _: unknown,
      { matchId, status }: { matchId: string; status: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.match.update({
        where: { id: matchId },
        data: { status },
        include: { trial: true },
      });
    },
    translateTreatment: async (
      _: unknown,
      { matchId }: { matchId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.translateTreatment(matchId);
    },
  },
  Match: {
    trial: async (parent: any, _: unknown, ctx: ResolverContext) => {
      if (parent.trial) return parent.trial;
      return ctx.prisma.trial.findUnique({ where: { id: parent.trialId } });
    },
  },
};
