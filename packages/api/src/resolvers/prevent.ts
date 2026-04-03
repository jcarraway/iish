import type { ResolverContext } from '../context';

export const preventResolvers = {
  Query: {
    preventProfile: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getPreventProfile(patient.userId);
    },
    latestRisk: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getLatestRisk(patient.userId);
    },
    riskAssessments: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getRiskAssessments(patient.userId);
    },
    locationHistory: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return [];
      return ctx.lib.getLocationHistory(patient.userId);
    },
    dataConsent: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getDataConsent(patient.userId);
    },
    screeningSchedule: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getScreeningSchedule(patient.userId);
    },
    chemopreventionEligibility: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.getChemopreventionEligibility(patient.userId);
    },
    chemopreventionGuide: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.getChemopreventionGuide(patient.userId);
    },
    testingRecommendations: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getTestingRecommendations(patient.userId);
    },
    preventGenomicProfile: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getPreventGenomicProfile(patient.userId);
    },
    preventionLifestyle: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({ where: { userId: ctx.session.userId } });
      if (!patient) return null;
      return ctx.lib.getPreventionLifestyle(patient.userId);
    },
  },
  Mutation: {
    createPreventProfile: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.createPreventProfile(ctx.session.userId, args.input);
    },
    updatePreventProfile: async (_: any, args: { input: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.updatePreventProfile(ctx.session.userId, args.input);
    },
    saveLocationHistory: async (_: any, args: { locations: any[] }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.saveLocationHistory(ctx.session.userId, args.locations);
    },
    updateDataConsent: async (_: any, args: { level: number }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.updateDataConsent(ctx.session.userId, args.level);
    },
    generateScreeningSchedule: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.generateScreeningSchedule(ctx.session.userId);
    },
    generateChemopreventionGuide: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.generateChemopreventionGuide(ctx.session.userId);
    },
    updateFamilyHistory: async (_: any, args: { familyHistory: any }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.updateFamilyHistory(ctx.session.userId, args.familyHistory);
    },
    generatePreventionLifestyle: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.generatePreventionLifestyle(ctx.session.userId);
    },
    requestGenotypeUpload: async (_: any, { input }: { input: { filename: string; contentType: string; fileSize: number } }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.requestGenotypeUploadUrl(ctx.session.userId, input.filename, input.contentType, input.fileSize);
    },
    parseGenotypeFile: async (_: any, { s3Key, documentUploadId }: { s3Key: string; documentUploadId: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.processGenotypeFile(ctx.session.userId, s3Key, documentUploadId);
    },
    calculatePrs: async (_: any, { ancestryOverride }: { ancestryOverride?: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.calculatePrsForUser(ctx.session.userId, ancestryOverride);
    },
    recalculateRisk: async (_: any, __: any, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.recalculateRisk(ctx.session.userId);
    },
  },
  RiskAssessment: {
    riskTrajectory: (parent: any) => {
      if (Array.isArray(parent.riskTrajectory)) return parent.riskTrajectory;
      return typeof parent.riskTrajectory === 'string' ? JSON.parse(parent.riskTrajectory) : parent.riskTrajectory ? Object.values(parent.riskTrajectory) : [];
    },
    modifiableFactors: (parent: any) => {
      if (Array.isArray(parent.modifiableFactors)) return parent.modifiableFactors;
      return typeof parent.modifiableFactors === 'string' ? JSON.parse(parent.modifiableFactors) : parent.modifiableFactors ? Object.values(parent.modifiableFactors) : [];
    },
  },
};
