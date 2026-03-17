import type { ResolverContext } from '../context';

export const fhirResolvers = {
  Query: {
    healthSystems: async (
      _: unknown,
      { search }: { search?: string },
      ctx: ResolverContext,
    ) => {
      return ctx.lib.searchHealthSystems(search);
    },
    fhirConnections: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.lib.getFhirConnections(patient.id);
    },
  },
  Mutation: {
    authorizeFhir: async (
      _: unknown,
      { healthSystemId }: { healthSystemId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.authorizeFhir(ctx.session.userId, healthSystemId);
    },
    revokeFhirConnection: async (
      _: unknown,
      { connectionId }: { connectionId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.revokeFhirConnection(patient.id, connectionId);
    },
    resyncFhirConnection: async (
      _: unknown,
      { connectionId }: { connectionId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.resyncFhirConnection(patient.id, connectionId);
    },
    extractFhir: async (
      _: unknown,
      { connectionId }: { connectionId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.extractFhir(patient.id, connectionId);
    },
  },
};
