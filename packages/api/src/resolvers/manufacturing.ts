import type { ResolverContext } from '../context';

export const manufacturingResolvers = {
  ManufacturingOrder: {
    partner: async (parent: { partnerId: string }, _: unknown, ctx: ResolverContext) => {
      return ctx.prisma.manufacturingPartner.findUnique({ where: { id: parent.partnerId } });
    },
    administrationSite: async (
      parent: { administrationSiteId?: string | null },
      _: unknown,
      ctx: ResolverContext,
    ) => {
      if (!parent.administrationSiteId) return null;
      return ctx.prisma.administrationSite.findUnique({ where: { id: parent.administrationSiteId } });
    },
    assessment: async (
      parent: { assessmentId?: string | null },
      _: unknown,
      ctx: ResolverContext,
    ) => {
      if (!parent.assessmentId) return null;
      return ctx.prisma.regulatoryPathwayAssessment.findUnique({ where: { id: parent.assessmentId } });
    },
    reports: async (parent: { id: string }, _: unknown, ctx: ResolverContext) => {
      return ctx.prisma.postAdministrationReport.findMany({
        where: { orderId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Query: {
    manufacturingPartners: async (
      _: unknown,
      { type, capability }: { type?: string; capability?: string },
      ctx: ResolverContext,
    ) => {
      const where: Record<string, unknown> = { status: 'active' };
      if (type) where.type = type;
      if (capability) where.capabilities = { has: capability };
      return ctx.prisma.manufacturingPartner.findMany({
        where,
        orderBy: { name: 'asc' },
      });
    },
    manufacturingPartner: async (_: unknown, { id }: { id: string }, ctx: ResolverContext) => {
      return ctx.prisma.manufacturingPartner.findUnique({ where: { id } });
    },
    manufacturingOrders: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.prisma.manufacturingOrder.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
      });
    },
    manufacturingOrder: async (_: unknown, { id }: { id: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.manufacturingOrder.findUnique({ where: { id } });
    },
    regulatoryAssessments: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.prisma.regulatoryPathwayAssessment.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
      });
    },
    regulatoryAssessment: async (_: unknown, { id }: { id: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.regulatoryPathwayAssessment.findUnique({ where: { id } });
    },
    regulatoryDocuments: async (
      _: unknown,
      { assessmentId }: { assessmentId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.regulatoryDocument.findMany({
        where: { assessmentId },
        orderBy: { createdAt: 'desc' },
      });
    },
    regulatoryDocument: async (_: unknown, { id }: { id: string }, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.regulatoryDocument.findUnique({ where: { id } });
    },
  },
  Mutation: {
    createManufacturingOrder: async (
      _: unknown,
      { partnerId, pipelineJobId }: { partnerId: string; pipelineJobId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.createOrder(patient.id, partnerId, pipelineJobId);
    },
    updateManufacturingOrderStatus: async (
      _: unknown,
      { orderId, status, notes }: { orderId: string; status: string; notes?: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.updateOrderStatus(orderId, status, notes);
    },
    assessRegulatoryPathway: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) throw new Error('Patient not found');
      return ctx.lib.assessPathway(patient.id, input);
    },
    generateRegulatoryDocument: async (
      _: unknown,
      { assessmentId, documentType }: { assessmentId: string; documentType: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.generateDocument(assessmentId, documentType);
    },
    updateRegulatoryDocumentStatus: async (
      _: unknown,
      { id, status, reviewNotes }: { id: string; status: string; reviewNotes?: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.prisma.regulatoryDocument.update({
        where: { id },
        data: { status, ...(reviewNotes !== undefined ? { reviewNotes } : {}) },
      });
    },
  },
};
