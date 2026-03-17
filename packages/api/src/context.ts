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
    // Matches
    generateMatches: (patientId: string) => Promise<any>;
    translateTreatment: (matchId: string) => Promise<any>;
    generateOncologistBrief: (matchId: string) => Promise<any>;

    // Financial
    matchFinancialPrograms: (patientId: string, profile: any) => Promise<any>;
    getFinancialProgram: (programId: string) => Promise<any>;

    // Sequencing
    checkCoverage: (patientId: string, insurer: string, testType: string) => Promise<any>;
    generateSequencingRecommendation: (patientId: string) => Promise<any>;
    generateSequencingExplanation: (patientId: string) => Promise<any>;
    generateTestRecommendation: (patientId: string, opts?: { tissueAvailable?: boolean; preferComprehensive?: boolean }) => Promise<any>;
    generateConversationGuide: (patientId: string) => Promise<any>;
    generateWaitingContent: (patientId: string) => Promise<any>;
    generateSequencingBrief: (patientId: string, testType: string, providerIds: string[], insurer?: string) => Promise<any>;
    generateLOMN: (patientId: string, testType: string, insurer?: string) => Promise<any>;

    // Genomics
    extractGenomicReport: (documentId: string) => Promise<any>;
    interpretGenomics: (patientId: string) => Promise<any>;
    confirmGenomics: (patientId: string, genomicResultId: string, edits?: any) => Promise<any>;
    computeMatchDelta: (patientId: string) => Promise<any>;

    // Pipeline
    submitPipelineJob: (params: any) => Promise<any>;
    getNeoantigens: (pipelineJobId: string, params: any) => Promise<any>;
    getPipelineResults: (pipelineJobId: string) => Promise<any>;
    generateReportPdf: (pipelineJobId: string, reportType: string) => Promise<any>;
    crossReferenceTrials: (pipelineJobId: string) => Promise<any>;

    // Manufacturing
    createOrder: (patientId: string, partnerId: string, pipelineJobId: string) => Promise<any>;
    updateOrderStatus: (orderId: string, status: string, notes?: string) => Promise<any>;
    assessPathway: (patientId: string, input: any) => Promise<any>;
    generateDocument: (assessmentId: string, documentType: string) => Promise<any>;
    recommendPartners: (pipelineJobId: string) => Promise<any>;
    acceptQuote: (patientId: string, orderId: string) => Promise<any>;
    connectSite: (patientId: string, orderId: string, siteId: string) => Promise<any>;
    addOrderNote: (patientId: string, orderId: string, note: string) => Promise<any>;

    // Monitoring
    searchSites: (params: { lat?: number; lng?: number; radiusMiles?: number }) => Promise<any>;
    submitMonitoringReport: (input: any) => Promise<any>;
    getMonitoringSchedule: (orderId: string) => Promise<any>;

    // FHIR
    searchHealthSystems: (query?: string) => Promise<any>;
    getFhirConnections: (patientId: string) => Promise<any>;
    authorizeFhir: (userId: string, healthSystemId: string) => Promise<any>;
    extractFhir: (patientId: string, connectionId: string) => Promise<any>;
    revokeFhirConnection: (patientId: string, connectionId: string) => Promise<any>;
    resyncFhirConnection: (patientId: string, connectionId: string) => Promise<any>;

    // Documents
    getPresignedUploadUrl: (filename: string, contentType: string) => Promise<any>;
    extractDocument: (documentId: string) => Promise<any>;
    requestGeneralUploadUrl: (filename: string, contentType: string, bucket?: string) => Promise<any>;

    // Patient Intake
    savePatientIntake: (userId: string, email: string, input: any) => Promise<any>;
    extractDocuments: (s3Keys: string[], mimeTypes: string[]) => Promise<any>;

    // Sequencing Orders
    createSequencingOrder: (patientId: string, providerId: string, testType: string) => Promise<any>;
  };
}

export type ResolverContext = GraphQLContext;
