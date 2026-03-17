import type { ResolverContext } from '../context';

export const patientResolvers = {
  Patient: {
    // Map Prisma's intakePath to GraphQL's intakeMethod
    intakeMethod: (parent: Record<string, unknown>) => parent.intakePath ?? parent.intakeMethod ?? null,
    // Map user email/name
    email: async (parent: Record<string, unknown>, _: unknown, ctx: ResolverContext) => {
      if (parent.email) return parent.email;
      const user = await ctx.prisma.user.findUnique({ where: { id: parent.userId } });
      return user?.email ?? '';
    },
    name: async (parent: Record<string, unknown>, _: unknown, ctx: ResolverContext) => {
      if (parent.name) return parent.name;
      const user = await ctx.prisma.user.findUnique({ where: { id: parent.userId } });
      return user?.name ?? null;
    },
  },
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
          intakePath: 'manual',
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
    savePatientIntake: async (
      _: unknown,
      { input }: { input: { profile: any; fieldSources?: any; fieldConfidence?: any; intakePath: string; documents?: any[]; claudeApiCost?: number } },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.savePatientIntake(ctx.session.userId, ctx.session.email, input);
    },
    extractDocuments: async (
      _: unknown,
      { s3Keys, mimeTypes }: { s3Keys: string[]; mimeTypes: string[] },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.extractDocuments(s3Keys, mimeTypes);
    },
  },
};
