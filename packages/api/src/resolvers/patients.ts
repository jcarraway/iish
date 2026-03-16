import type { ResolverContext } from '../context';

export const patientResolvers = {
  Query: {
    patient: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
    },
    patientProfile: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      return patient?.profile ?? null;
    },
  },
  Mutation: {
    updatePatientProfile: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      const currentProfile = (patient.profile as Record<string, unknown>) || {};
      return ctx.prisma.patient.update({
        where: { id: patient.id },
        data: { profile: { ...currentProfile, ...input } },
      });
    },
    createPatientManual: async (
      _: unknown,
      { input }: { input: { name: string; cancerType: string; stage?: string; age?: number; zipCode?: string; priorTreatments?: string[] } },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.patient.create({
        data: {
          userId: ctx.session.userId,
          email: ctx.session.email,
          name: input.name,
          intakeMethod: 'manual',
          profile: {
            cancerType: input.cancerType,
            stage: input.stage,
            age: input.age,
            zipCode: input.zipCode,
            priorTreatments: input.priorTreatments?.map((t: string) => ({ name: t, type: 'unknown' })),
          },
        },
      });
    },
  },
};
