import type { ResolverContext } from '../context';

export const monitoringResolvers = {
  Query: {
    administrationSites: async (
      _: unknown,
      { lat, lng, radiusMiles }: { lat?: number; lng?: number; radiusMiles?: number },
      ctx: ResolverContext,
    ) => {
      return ctx.lib.searchSites({ lat, lng, radiusMiles });
    },
    monitoringReports: async (
      _: unknown,
      { orderId }: { orderId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.postAdministrationReport.findMany({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Mutation: {
    submitMonitoringReport: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.submitMonitoringReport(input);
    },
  },
};
