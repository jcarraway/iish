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

    // Auth
    sendMagicLink: (email: string, redirect?: string) => Promise<void>;

    // Report (inline preview)
    generateReport: (pipelineJobId: string, reportType: string) => Promise<any>;

    // Survivorship
    generateSCP: (patientId: string, input: any) => Promise<any>;
    refreshSCP: (patientId: string) => Promise<any>;
    markEventComplete: (eventId: string, completedDate: string, resultSummary?: string, resultDocumentId?: string) => Promise<any>;
    skipEvent: (eventId: string, reason: string) => Promise<any>;
    rescheduleEvent: (eventId: string, newDueDate: string) => Promise<any>;
    uploadEventResult: (eventId: string, documentId: string) => Promise<any>;
    submitJournalEntry: (patientId: string, input: any) => Promise<any>;
    deleteJournalEntry: (patientId: string, entryId: string) => Promise<void>;
    getJournalTrends: (patientId: string, days: number) => Promise<any>;
    getLifestyleRecommendations: (patientId: string) => Promise<any>;
    generateLifestyleRecommendations: (patientId: string) => Promise<any>;
    getCareTeam: (patientId: string) => Promise<any>;
    addCareTeamMember: (patientId: string, input: any) => Promise<any>;
    updateCareTeamMember: (patientId: string, memberId: string, input: any) => Promise<any>;
    removeCareTeamMember: (patientId: string, memberId: string) => Promise<void>;
    routeSymptom: (patientId: string, symptom: string) => Promise<any>;
    generateAppointmentPrep: (patientId: string, eventId: string) => Promise<any>;
    getAppointmentPrep: (patientId: string, eventId: string) => Promise<any>;
    getCtdnaHistory: (patientId: string) => Promise<any>;
    addCtdnaResult: (patientId: string, input: any) => Promise<any>;

    // Notifications + Feedback
    getNotificationPreferences: (patientId: string) => Promise<any>;
    updateNotificationPreferences: (patientId: string, updates: any) => Promise<any>;
    getNotificationHistory: (patientId: string, limit?: number) => Promise<any[]>;
    submitFeedback: (patientId: string, input: any) => Promise<any>;
    getFeedback: (patientId: string) => Promise<any[]>;
    annualRefreshSCP: (patientId: string) => Promise<any>;

    // Recurrence
    reportRecurrence: (patientId: string, input: any) => Promise<any>;
    acknowledgeRecurrence: (recurrenceEventId: string) => Promise<any>;
    updateCascadeStep: (recurrenceEventId: string, step: string, value: boolean) => Promise<any>;
    regenerateTranslator: (patientId: string, recurrenceEventId: string) => Promise<any>;
    archiveSurvivorshipPlan: (patientId: string) => Promise<boolean>;
    getRecurrenceEvent: (patientId: string) => Promise<any>;
    getRecurrenceEvents: (patientId: string) => Promise<any[]>;
    generateGenomicComparison: (patientId: string, recurrenceEventId: string) => Promise<any>;
    getSecondOpinionResources: (patientId: string) => Promise<any[]>;

    // Fertility
    assessFertilityRisk: (patientId: string) => Promise<any>;
    getFertilityAssessment: (patientId: string) => Promise<any>;
    getPreservationOptions: (patientId: string) => Promise<any[]>;
    getFertilityProviders: (patientId: string, filters?: any) => Promise<any[]>;
    getFertilityFinancialPrograms: (patientId: string) => Promise<any[]>;
    generateFertilityDiscussionGuide: (patientId: string) => Promise<any>;
    requestFertilityReferral: (assessmentId: string, providerId: string) => Promise<any>;
    updateFertilityOutcome: (assessmentId: string, input: any) => Promise<any>;

    // Insurance Advocate
    createDenial: (patientId: string, input: any) => Promise<any>;
    getDenials: (patientId: string) => Promise<any[]>;
    getDenial: (denialId: string) => Promise<any>;
    updateDenialStatus: (denialId: string, status: string) => Promise<any>;
    generateAppealLetter: (denialId: string) => Promise<any>;
    getAppealLetter: (appealId: string) => Promise<any>;
    updateAppealOutcome: (appealId: string, input: any) => Promise<any>;
    getAppealStrategy: (denialCategory: string) => any;
    getAppealRights: (state?: string) => any;
    generatePeerReviewPrep: (denialId: string) => Promise<any>;

    // Logistics
    assessTrialLogistics: (patientId: string, matchId: string) => Promise<any>;
    getLogisticsAssessment: (patientId: string, matchId: string) => Promise<any>;
    getLogisticsAssessments: (patientId: string) => Promise<any[]>;
    getAssistancePrograms: (patientId: string) => Promise<any[]>;
    generateLogisticsPlan: (patientId: string, matchId: string) => Promise<any>;
    updateAssistanceApplication: (patientId: string, assessmentId: string, programKey: string, status: string, notes?: string) => Promise<any>;
    getAssistanceApplications: (patientId: string) => Promise<any[]>;

    // Learn
    getArticle: (slug: string) => Promise<any>;
    getArticles: (filters?: any) => Promise<any[]>;
    getArticlesByCategory: (category: string) => Promise<any>;
    searchArticles: (query: string, filters?: any) => Promise<any[]>;
    getGlossaryTerms: (category?: string) => Promise<any[]>;
    getGlossaryTerm: (slug: string) => Promise<any>;
    generateArticle: (spec: any) => Promise<any>;
    publishArticle: (id: string) => Promise<any>;
    generatePersonalizedContext: (patientId: string, slug: string) => Promise<any>;
    generateReadingPlan: (patientId: string) => Promise<any>;
    getArticleForSeo: (slug: string) => Promise<any>;
    getAllPublishedSlugs: () => Promise<any[]>;
    generateArticleBatch: (specs: any[]) => Promise<any[]>;
    getRelatedArticles: (slug: string, limit?: number) => Promise<any[]>;
    getArticlesAdmin: (filters?: any) => Promise<any[]>;
    checkArticleQuality: (articleId: string) => Promise<any>;
    runArticleQualityChecks: () => Promise<any>;
    updateArticleStatus: (articleId: string, status: string, notes?: string) => Promise<any>;
    insertPlatformLinks: (articleId: string) => Promise<any>;

    // Learn — INTEL Bridge
    getRelatedResearch: (slug: string, limit?: number) => Promise<any[]>;
    getArticlesForResearchItem: (itemId: string, limit?: number) => Promise<any[]>;
    getArticleRefreshStatus: (articleId: string) => Promise<any>;
    getArticleEngagement: () => Promise<any[]>;
    generateRefreshSuggestion: (articleId: string, triggerItemIds: string[]) => Promise<any>;
    runRefreshCheckCycle: () => Promise<any>;

    // Second Opinion
    evaluateSecondOpinionTriggers: (patientId: string) => Promise<any>;
    createSecondOpinionRequest: (patientId: string) => Promise<any>;
    getSecondOpinionRequest: (patientId: string) => Promise<any>;
    getSecondOpinionCenters: (patientId: string, filters?: any) => Promise<any[]>;
    generateRecordPacket: (patientId: string) => Promise<any>;
    generateCommunicationGuide: (patientId: string) => Promise<any>;
    selectCenter: (patientId: string, centerId: string, isVirtual: boolean, appointmentDate?: string) => Promise<any>;
    recordSecondOpinionOutcome: (patientId: string, outcome: string, outcomeSummary?: string) => Promise<any>;

    // Intel — Landscape Views (I6)
    getLandscapeOverview: () => Promise<any>;
    getSubtypeLandscape: (subtype: string) => Promise<any>;
    getTreatmentPipeline: (subtype?: string) => Promise<any[]>;
    getRecentDevelopments: (subtype?: string, days?: number) => Promise<any[]>;
    generateStandardOfCareSummary: (subtype: string) => Promise<any>;
    checkTranslatorUpdates: (patientId: string) => Promise<any>;
    checkFinancialUpdates: (patientId: string) => Promise<any>;
    checkSurvivorshipUpdates: (patientId: string) => Promise<any>;

    // Intel — Research Intelligence
    getResearchItems: (filters?: any) => Promise<any>;
    getResearchItem: (id: string) => Promise<any>;
    searchResearchItems: (query: string, filters?: any) => Promise<any>;
    getSyncStates: () => Promise<any[]>;
    triggerIngestion: (sourceId: string) => Promise<any>;
    reclassifyItem: (itemId: string) => Promise<any>;
    processQCQueue: (batchSize?: number) => Promise<any>;
    migrateOldTaxonomy: () => Promise<any>;

    // Intel — Feed Personalization (I4)
    getPersonalizedFeed: (userId: string, filters?: any) => Promise<any>;
    getPersonalizedNote: (itemId: string, userId: string) => Promise<any>;
    getFeedConfig: (userId: string) => Promise<any>;
    markItemViewed: (userId: string, itemId: string) => Promise<boolean>;
    markItemSaved: (userId: string, itemId: string, saved: boolean) => Promise<boolean>;
    markItemDismissed: (userId: string, itemId: string) => Promise<boolean>;
    updateFeedConfig: (userId: string, input: any) => Promise<any>;
    computeRelevanceScores: (userId: string) => Promise<any>;

    // Intel — Community Intelligence (I5)
    submitCommunityReport: (patientId: string, input: any) => Promise<any>;
    getCommunityReports: (patientId: string) => Promise<any[]>;
    getCommunityInsights: (drugName: string) => Promise<any>;
    getCommunityInsightsForItem: (itemId: string) => Promise<any>;
    compileDigest: (userId: string, period: string) => Promise<any>;
    moderateCommunityReport: (reportId: string, status: string) => Promise<any>;
    updateDigestPreferences: (userId: string, frequency: string | null) => Promise<any>;

    // Palliative Care
    submitSymptomAssessment: (patientId: string, esasScores: any) => Promise<any>;
    getSymptomAssessments: (patientId: string, limit?: number) => Promise<any[]>;
    getLatestAssessment: (patientId: string) => Promise<any>;
    getPalliativeCareProviders: (patientId: string, filters?: any) => Promise<any[]>;
    getAdvanceCarePlan: (patientId: string) => Promise<any>;
    updateAdvanceCarePlan: (patientId: string, updates: any) => Promise<any>;
    generateGoalsOfCareGuide: (patientId: string) => Promise<any>;
    generateReferralLetter: (patientId: string) => Promise<any>;
    shouldRecommendPalliative: (patientId: string) => Promise<any>;

    // PREVENT
    createPreventProfile: (userId: string, data: any) => Promise<any>;
    getPreventProfile: (userId: string) => Promise<any>;
    updatePreventProfile: (userId: string, updates: any) => Promise<any>;
    getRiskAssessments: (userId: string) => Promise<any[]>;
    getLatestRisk: (userId: string) => Promise<any>;
    saveLocationHistory: (userId: string, locations: any[]) => Promise<any[]>;
    getLocationHistory: (userId: string) => Promise<any[]>;
    getDataConsent: (userId: string) => Promise<any>;
    updateDataConsent: (userId: string, level: number) => Promise<any>;
    getScreeningSchedule: (userId: string) => Promise<any>;
    generateScreeningSchedule: (userId: string) => Promise<any>;
    getChemopreventionEligibility: (userId: string) => Promise<any>;
    getChemopreventionGuide: (userId: string) => Promise<any>;
    generateChemopreventionGuide: (userId: string) => Promise<any>;
    getTestingRecommendations: (userId: string) => Promise<any>;
    getPreventGenomicProfile: (userId: string) => Promise<any>;
    getPreventionLifestyle: (userId: string) => Promise<any>;
    generatePreventionLifestyle: (userId: string) => Promise<any>;
    updateFamilyHistory: (userId: string, familyHistory: any) => Promise<any>;
    requestGenotypeUploadUrl: (userId: string, filename: string, contentType: string, fileSize: number) => Promise<any>;
    processGenotypeFile: (userId: string, s3Key: string, documentUploadId: string) => Promise<any>;
    calculatePrsForUser: (userId: string, ancestryOverride?: string) => Promise<any>;

    // Preventive Trial Matcher
    getPreventiveTrials: (filters?: any) => Promise<any>;
    runPreventivePrescreen: (input: any, userId?: string | null) => Promise<any>;
    getPreventiveTrialsForFamily: (patientId: string) => Promise<any[]>;
    getRecurrencePreventionTrials: (patientId: string) => Promise<any[]>;
    generateReferralLink: (patientId: string) => Promise<any>;
    redeemReferralCode: (code: string, userId?: string | null) => Promise<any>;
    getReferralStats: (patientId: string) => Promise<any>;

    // PEERS — Peer Matching & Support
    enrollAsMentor: (patientId: string, input: any) => Promise<any>;
    getMentorProfile: (patientId: string) => Promise<any>;
    updateMentorProfile: (patientId: string, updates: any) => Promise<any>;
    findMatches: (patientId: string) => Promise<any[]>;
    proposeConnection: (menteeId: string, mentorProfileId: string) => Promise<any>;
    respondToConnection: (connectionId: string, patientId: string, accept: boolean) => Promise<any>;
    getConnections: (patientId: string) => Promise<any[]>;
    getConnection: (connectionId: string, patientId: string) => Promise<any>;
    getTrainingModules: (patientId: string) => Promise<any[]>;
    completeTrainingModule: (patientId: string, moduleId: string) => Promise<any>;
    sendMessage: (connectionId: string, senderPatientId: string, content: string) => Promise<any>;
    getMessages: (connectionId: string, patientId: string, limit?: number, before?: string) => Promise<any[]>;
    markMessagesRead: (connectionId: string, patientId: string) => Promise<boolean>;
    updateConnectionStatus: (connectionId: string, patientId: string, action: 'pause' | 'resume' | 'complete' | 'end', reason?: string) => Promise<any>;
    reportConcern: (connectionId: string, reporterId: string, input: any) => Promise<any>;
    submitConnectionFeedback: (connectionId: string, patientId: string, input: any) => Promise<any>;
    getMentorStats: (patientId: string) => Promise<any>;
  };
}

export type ResolverContext = GraphQLContext;
