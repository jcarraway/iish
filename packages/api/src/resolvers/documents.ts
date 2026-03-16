import type { ResolverContext } from '../context';

export const documentResolvers = {
  Query: {
    documents: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      const patient = await ctx.prisma.patient.findUnique({
        where: { userId: ctx.session.userId },
      });
      if (!patient) return [];
      return ctx.prisma.document.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Mutation: {
    requestUploadUrl: async (
      _: unknown,
      { filename, contentType }: { filename: string; contentType: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.getPresignedUploadUrl(filename, contentType);
    },
    extractDocument: async (
      _: unknown,
      { documentId }: { documentId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      await ctx.lib.extractDocument(documentId);
      return ctx.prisma.document.findUnique({ where: { id: documentId } });
    },
  },
};
