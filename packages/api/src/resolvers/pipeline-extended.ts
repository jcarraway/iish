import type { ResolverContext } from '../context';

export const pipelineExtendedResolvers = {
  Query: {
    neoantigens: async (
      _: unknown,
      args: {
        pipelineJobId: string;
        sort?: string;
        order?: string;
        confidence?: string;
        gene?: string;
        page?: number;
        limit?: number;
      },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.getNeoantigens(args.pipelineJobId, {
        sort: args.sort,
        order: args.order,
        confidence: args.confidence,
        gene: args.gene,
        page: args.page,
        limit: args.limit,
      });
    },
    pipelineResults: async (
      _: unknown,
      { pipelineJobId }: { pipelineJobId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.getPipelineResults(pipelineJobId);
    },
    reportPdf: async (
      _: unknown,
      { pipelineJobId, reportType }: { pipelineJobId: string; reportType: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.generateReportPdf(pipelineJobId, reportType);
    },
    neoantigenTrials: async (
      _: unknown,
      { pipelineJobId }: { pipelineJobId: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.crossReferenceTrials(pipelineJobId);
    },
  },
  Mutation: {
    generateReportPdf: async (
      _: unknown,
      { pipelineJobId, reportType }: { pipelineJobId: string; reportType: string },
      ctx: ResolverContext,
    ) => {
      if (!ctx.session) throw new Error('UNAUTHORIZED');
      return ctx.lib.generateReportPdf(pipelineJobId, reportType);
    },
  },
};
