import type { ResolverContext } from '../context';

export const manufacturingExtendedResolvers = {
  Query: {
    recommendedPartners: async (
      _: unknown,
      { pipelineJobId }: { pipelineJobId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.recommendPartners(pipelineJobId);
    },
  },
  Mutation: {
    acceptQuote: async (
      _: unknown,
      { orderId }: { orderId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.acceptQuote(patient.id, orderId);
    },
    connectSite: async (
      _: unknown,
      { orderId, siteId }: { orderId: string; siteId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.connectSite(patient.id, orderId, siteId);
    },
    addOrderNote: async (
      _: unknown,
      { orderId, note }: { orderId: string; note: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.addOrderNote(patient.id, orderId, note);
    },
  },
};
