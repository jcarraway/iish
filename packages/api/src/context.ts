/**
 * GraphQL request context.
 *
 * Built by the route handler in apps/web/app/api/graphql/route.ts
 * and passed to all resolvers. The route handler injects the prisma
 * client, redis, session, and lib function references.
 *
 * This keeps packages/api/ decoupled from apps/web/lib/ — the route
 * handler is the bridge.
 */

export interface GraphQLContext {
  prisma: any;
  redis: any;
  session: { userId: string; email: string } | null;
  /**
   * Lib functions injected from apps/web/lib/ by the route handler.
   * Resolvers that need complex business logic call these.
   * Typed loosely to avoid coupling to specific lib/ return types.
   */
  lib: {
    generateMatches: (patientId: string) => Promise<any>;
    translateTreatment: (matchId: string) => Promise<any>;
    matchFinancialPrograms: (patientId: string, profile: any) => Promise<any>;
    checkCoverage: (patientId: string, insurer: string, testType: string) => Promise<any>;
    extractGenomicReport: (documentId: string) => Promise<any>;
    interpretGenomics: (patientId: string) => Promise<any>;
    submitPipelineJob: (params: any) => Promise<any>;
    generateReport: (pipelineJobId: string, reportType: string) => Promise<any>;
    createOrder: (patientId: string, partnerId: string, pipelineJobId: string) => Promise<any>;
    updateOrderStatus: (orderId: string, status: string, notes?: string) => Promise<any>;
    assessPathway: (patientId: string, input: any) => Promise<any>;
    generateDocument: (assessmentId: string, documentType: string) => Promise<any>;
    searchSites: (params: { lat?: number; lng?: number; radiusMiles?: number }) => Promise<any>;
    submitMonitoringReport: (input: any) => Promise<any>;
    getPresignedUploadUrl: (filename: string, contentType: string) => Promise<any>;
    extractDocument: (documentId: string) => Promise<any>;
    requestMagicLink: (email: string) => Promise<any>;
  };
}

export type ResolverContext = GraphQLContext;
