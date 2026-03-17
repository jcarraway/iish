export const typeDefs = `#graphql
  scalar DateTime
  scalar JSON

  # ============================================================================
  # Auth
  # ============================================================================

  type SessionData {
    userId: String!
    email: String!
    createdAt: String!
    expiresAt: String!
  }

  # ============================================================================
  # Patient
  # ============================================================================

  type ReceptorDetail {
    status: String!
    percentage: Float
    method: String
  }

  type ReceptorStatus {
    er: ReceptorDetail
    pr: ReceptorDetail
    her2: ReceptorDetail
  }

  type PriorTreatment {
    name: String!
    type: String!
    startDate: String
    endDate: String
    response: String
  }

  type TherapyImplications {
    approvedTherapies: [String!]!
    clinicalTrials: [String!]!
    resistanceMutations: [String!]!
  }

  type GenomicAlteration {
    gene: String!
    alteration: String!
    alterationType: String!
    variantAlleleFrequency: Float
    clinicalSignificance: String!
    therapyImplications: TherapyImplications!
    confidence: Float!
  }

  type TmbBiomarker {
    value: Float!
    unit: String!
    status: String!
  }

  type MsiBiomarker {
    status: String!
    score: Float
  }

  type Pdl1Biomarker {
    tps: Float
    cps: Float
  }

  type LohBiomarker {
    status: String!
  }

  type HrdBiomarker {
    score: Float
    status: String!
  }

  type GenomicBiomarkers {
    tmb: TmbBiomarker
    msi: MsiBiomarker
    pdl1: Pdl1Biomarker
    loh: LohBiomarker
    hrd: HrdBiomarker
  }

  type GermlineFinding {
    gene: String!
    variant: String!
    significance: String!
  }

  type GenomicData {
    testProvider: String!
    testName: String!
    testDate: String
    alterations: [GenomicAlteration!]!
    biomarkers: GenomicBiomarkers!
    germlineFindings: [GermlineFinding!]
  }

  type PatientProfile {
    cancerType: String
    cancerTypeNormalized: String
    stage: String
    histologicalGrade: String
    receptorStatus: ReceptorStatus
    biomarkers: JSON
    priorTreatments: [PriorTreatment!]
    ecogStatus: Int
    age: Int
    zipCode: String
    genomicData: GenomicData
  }

  type Patient {
    id: String!
    email: String!
    name: String
    profile: PatientProfile
    intakeMethod: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # ============================================================================
  # Trials & Matches
  # ============================================================================

  type Trial {
    id: String!
    nctId: String!
    title: String!
    phase: String
    status: String
    conditions: [String!]!
    interventions: [String!]!
    sponsor: String
    locations: JSON
    eligibilityCriteria: String
    parsedEligibility: JSON
    briefSummary: String
    startDate: String
    lastUpdated: String
  }

  type MatchBreakdownItem {
    category: String!
    score: Float!
    weight: Float!
    status: String!
    reason: String!
  }

  type LLMAssessment {
    overallAssessment: String!
    reasoning: String!
    potentialBlockers: [String!]!
    missingInfo: [String!]!
    actionItems: [String!]!
  }

  type Match {
    id: String!
    patientId: String!
    trialId: String!
    matchScore: Float!
    matchBreakdown: [MatchBreakdownItem!]!
    potentialBlockers: [String!]!
    llmAssessment: LLMAssessment
    status: String!
    trial: Trial
    createdAt: DateTime!
  }

  # ============================================================================
  # Oncologist Brief
  # ============================================================================

  type OncologistBrief {
    content: String!
    matchId: String!
    generatedAt: String!
  }

  # ============================================================================
  # Treatment Translation
  # ============================================================================

  type DrugCard {
    name: String!
    genericName: String
    mechanism: String!
    whyThisDrug: String!
    commonSideEffects: [SideEffect!]!
    seriousSideEffects: [String!]!
    tips: [String!]!
  }

  type SideEffect {
    effect: String!
    timing: String!
    management: String!
  }

  type TimelinePhase {
    phase: String!
    duration: String!
    description: String!
    whatToExpect: [String!]!
  }

  type DoctorQuestion {
    question: String!
    whyItMatters: String!
  }

  type SecondOpinionTrigger {
    reason: String!
    level: String!
  }

  type TreatmentTranslation {
    diagnosis: JSON!
    treatmentPlan: JSON!
    timeline: JSON!
    questionsForDoctor: [DoctorQuestion!]!
    additionalConsiderations: JSON
    secondOpinionTriggers: [SecondOpinionTrigger!]!
    generatedAt: String!
  }

  # ============================================================================
  # Documents
  # ============================================================================

  type Document {
    id: String!
    patientId: String!
    type: String!
    filename: String!
    s3Key: String
    status: String!
    extraction: JSON
    createdAt: DateTime!
  }

  type UploadUrl {
    uploadUrl: String!
    s3Key: String!
  }

  # ============================================================================
  # Financial
  # ============================================================================

  type FinancialProgram {
    id: String!
    name: String!
    organization: String!
    type: String!
    description: String
    website: String!
    applicationUrl: String
    maxBenefitAmount: Float
    benefitDescription: String
    assistanceCategories: [String!]!
  }

  type FinancialMatch {
    programId: String!
    programName: String!
    organization: String!
    type: String!
    matchStatus: String!
    estimatedBenefit: String
    matchReasoning: String!
    missingInfo: [String!]!
    maxBenefitAmount: Float
    applicationUrl: String
    website: String!
    assistanceCategories: [String!]!
  }

  # ============================================================================
  # Sequencing
  # ============================================================================

  type SequencingProvider {
    id: String!
    name: String!
    type: String!
    slug: String!
    website: String
    testNames: [String!]!
    geneCount: Int!
    sampleTypes: [String!]!
    turnaroundDaysMin: Int!
    turnaroundDaysMax: Int!
    costRangeMin: Float!
    costRangeMax: Float!
    fdaApproved: Boolean!
    orderingProcess: String
    reportFormat: String
  }

  type SequencingOrder {
    id: String!
    patientId: String!
    providerId: String!
    testType: String!
    status: String!
    provider: SequencingProvider
    insuranceCoverage: JSON
    lomnContent: String
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type InsuranceCoverage {
    status: String!
    insurer: String!
    testType: String!
    reasoning: String!
    conditions: [String!]!
    cptCodes: [String!]!
    priorAuthRequired: Boolean!
    estimatedOutOfPocket: String
    missingInfo: [String!]!
  }

  # ============================================================================
  # Sequencing Guide
  # ============================================================================

  type SequencingRecommendation {
    level: String!
    headline: String!
    personalizedReasoning: String!
    whatItCouldReveal: [String!]!
    howItHelpsRightNow: String!
    howItHelpsLater: String!
    guidelineRecommendation: String!
    generatedAt: String!
  }

  type SequencingExplanation {
    whatIsIt: String!
    howItWorks: String!
    whatItFinds: String!
    personalRelevance: String!
    commonConcerns: [CommonConcern!]!
    generatedAt: String!
  }

  type CommonConcern {
    concern: String!
    answer: String!
  }

  type TestRecommendation {
    primary: TestRecommendationPrimary!
    alternatives: [TestRecommendationAlternative!]!
    reasoning: String!
    generatedAt: String!
  }

  type TestRecommendationPrimary {
    providerId: String!
    providerName: String!
    testName: String!
    testType: String!
    geneCount: Int!
    whyThisTest: String!
    sampleType: String!
    turnaroundDays: Int!
    fdaApproved: Boolean!
  }

  type TestRecommendationAlternative {
    providerId: String!
    providerName: String!
    testName: String!
    geneCount: Int!
    tradeoff: String!
  }

  type ConversationGuide {
    talkingPoints: [TalkingPoint!]!
    questionsToAsk: [DoctorQuestion!]!
    emailTemplate: String!
    orderingInstructions: String!
    generatedAt: String!
  }

  type TalkingPoint {
    point: String!
    detail: String!
  }

  type WaitingContent {
    cancerType: String!
    commonMutations: [CommonMutation!]!
    whatMutationsMean: String!
    clinicalTrialContext: String!
    timelineExpectations: String!
    generatedAt: String!
  }

  type CommonMutation {
    name: String!
    frequency: String!
    significance: String!
    drugs: [String!]!
  }

  type LOMN {
    content: String!
    testType: String!
    cptCodes: [String!]!
    icdCodes: [String!]!
    generatedAt: String!
  }

  # ============================================================================
  # Genomics
  # ============================================================================

  type GenomicResult {
    id: String!
    patientId: String!
    provider: String!
    testName: String!
    reportDate: String
    alterations: [GenomicAlteration!]!
    biomarkers: GenomicBiomarkers
    interpretation: JSON
    createdAt: DateTime!
  }

  type GenomicInterpretation {
    summary: String!
    mutations: JSON!
    biomarkerProfile: JSON!
    questionsForOncologist: [DoctorQuestion!]!
    generatedAt: String!
  }

  type MatchDelta {
    newMatches: [MatchDeltaEntry!]!
    improvedMatches: [MatchDeltaEntry!]!
    removedMatches: [MatchDeltaEntry!]!
    totalBefore: Int!
    totalAfter: Int!
  }

  type MatchDeltaEntry {
    trialId: String!
    nctId: String!
    title: String!
    oldScore: Float
    newScore: Float
    genomicBasis: String
    reason: String
  }

  # ============================================================================
  # Pipeline
  # ============================================================================

  type PipelineJob {
    id: String!
    patientId: String!
    status: String!
    currentStep: String
    stepsCompleted: [String!]!
    inputFormat: String!
    referenceGenome: String!
    startedAt: DateTime
    completedAt: DateTime
    estimatedCompletion: String
    variantCount: Int
    tmb: Float
    hlaGenotype: JSON
    neoantigenCount: Int
    topNeoantigens: JSON
    vaccineBlueprint: JSON
    stepErrors: JSON
    totalComputeSeconds: Float
    estimatedCostUsd: Float
    createdAt: DateTime!
  }

  type NeoantigenCandidate {
    id: String!
    jobId: String!
    gene: String!
    mutation: String!
    mutantPeptide: String!
    wildtypePeptide: String
    hlaAllele: String!
    bindingAffinityNm: Float!
    immunogenicityScore: Float!
    compositeScore: Float!
    rank: Int!
    vaf: Float
    clonality: String
    confidence: String!
  }

  type NeoantigenPage {
    neoantigens: [NeoantigenCandidate!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type PipelineResultDownloads {
    jobId: String!
    patientSummary: String
    fullReportPdf: String
    vaccineBlueprint: String
    neoantigenReport: String
  }

  type ReportPdfResult {
    url: String!
    cached: Boolean!
  }

  type NeoantigenTrialMatch {
    trialId: String!
    nctId: String!
    title: String!
    phase: String
    relevanceScore: Float!
    relevanceExplanation: String!
    matchedNeoantigens: [String!]!
  }

  # ============================================================================
  # Manufacturing
  # ============================================================================

  type ManufacturingPartner {
    id: String!
    name: String!
    slug: String!
    type: String!
    capabilities: [String!]!
    certifications: [String!]!
    capacityTier: String!
    costRangeMin: Float
    costRangeMax: Float
    turnaroundWeeksMin: Int
    turnaroundWeeksMax: Int
    country: String!
    regulatorySupport: [String!]!
    description: String
    contactUrl: String
    status: String!
  }

  type ManufacturingOrder {
    id: String!
    patientId: String!
    partnerId: String!
    pipelineJobId: String!
    status: String!
    quotePrice: Float
    quoteCurrency: String
    quoteTurnaroundWeeks: Int
    totalCost: Float
    batchNumber: String
    trackingNumber: String
    partnerName: String
    message: String
    quoteExpiresAt: String
    productionStartedAt: String
    productionEstimatedCompletion: String
    qcStartedAt: String
    qcCompletedAt: String
    qcPassed: Boolean
    qcNotes: String
    shippedAt: String
    shippingCarrier: String
    shippingConditions: String
    deliveredAt: String
    administeredAt: String
    administeredBy: String
    paymentStatus: String
    assessmentId: String
    administrationSiteId: String
    notes: JSON
    partner: ManufacturingPartner
    administrationSite: AdministrationSite
    assessment: RegulatoryPathwayAssessment
    reports: [MonitoringReport!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type RegulatoryPathwayAssessment {
    id: String!
    patientId: String!
    recommended: String!
    rationale: String!
    alternatives: JSON
    requiredDocuments: [String!]!
    estimatedCostMin: Float!
    estimatedCostMax: Float!
    estimatedTimelineWeeks: Int!
    createdAt: DateTime!
  }

  type RegulatoryDocument {
    id: String!
    assessmentId: String!
    documentType: String!
    content: String!
    status: String!
    reviewNotes: String
    reviewedAt: String
    reviewedBy: String
    createdAt: DateTime!
  }

  type PartnerRecommendation {
    partnerId: String!
    name: String!
    slug: String!
    type: String!
    score: Int!
    reasons: [String!]!
    costRangeMin: Float
    costRangeMax: Float
    turnaroundWeeksMin: Int
    turnaroundWeeksMax: Int
    capabilities: [String!]!
    certifications: [String!]!
  }

  # ============================================================================
  # Monitoring
  # ============================================================================

  type AdministrationSite {
    id: String!
    name: String!
    type: String!
    city: String
    state: String
    address: String
    zip: String
    country: String
    lat: Float
    lng: Float
    distance: Float
    canAdministerMrna: Boolean!
    hasInfusionCenter: Boolean!
    hasEmergencyResponse: Boolean!
    hasMonitoringCapacity: Boolean!
    investigationalExp: Boolean!
    irbAffiliation: String
    verified: Boolean!
    contactName: String
    contactEmail: String
    contactPhone: String
    willingToAdminister: Boolean
    website: String
  }

  type AdverseEvent {
    event: String!
    severity: String!
    onset: String!
    duration: String
    resolved: Boolean!
    treatment: String
  }

  type MonitoringReport {
    id: String!
    orderId: String!
    reportType: String!
    daysPostAdministration: Int!
    hasAdverseEvents: Boolean!
    adverseEvents: [AdverseEvent!]
    temperature: Float
    bloodPressure: String
    heartRate: Int
    qualityOfLifeScore: Int
    tumorResponse: String
    narrative: String
    status: String!
    createdAt: DateTime!
  }

  type MonitoringScheduleEntry {
    reportType: String!
    daysAfter: Int!
    required: Boolean!
    description: String!
    dueDate: String
    status: String!
    submittedAt: String
  }

  # ============================================================================
  # FHIR
  # ============================================================================

  type HealthSystem {
    id: String!
    name: String!
    fhirBaseUrl: String!
    brand: String
    city: String
    state: String
    ehrVendor: String!
  }

  type FhirConnection {
    id: String!
    healthSystemName: String
    syncStatus: String
    lastSyncedAt: DateTime
    scopesGranted: [String!]
    resourcesPulled: JSON
  }

  type FhirAuthorizeResult {
    authorizeUrl: String!
  }

  # ============================================================================
  # Uploads
  # ============================================================================

  type UploadUrlResult {
    uploadUrl: String!
    s3Key: String!
    bucket: String
    expiresAt: String
  }

  # ============================================================================
  # Queries
  # ============================================================================

  type Query {
    # Auth
    me: SessionData

    # Patient
    patient: Patient
    patientProfile: PatientProfile

    # Trials & Matches
    trials(cancerType: String, phase: String, limit: Int): [Trial!]!
    trial(id: String!): Trial
    matches: [Match!]!
    match(id: String!): Match

    # Oncologist Brief
    oncologistBrief(matchId: String!): OncologistBrief!

    # Documents
    documents: [Document!]!

    # Financial
    financialPrograms: [FinancialProgram!]!
    financialMatches: [FinancialMatch!]!
    financialProgram(programId: String!): FinancialProgram

    # Sequencing
    sequencingProviders: [SequencingProvider!]!
    sequencingOrders: [SequencingOrder!]!
    sequencingOrder(id: String!): SequencingOrder

    # Sequencing Guide
    sequencingRecommendation: SequencingRecommendation!
    sequencingExplanation: SequencingExplanation!
    testRecommendation(tissueAvailable: Boolean, preferComprehensive: Boolean): TestRecommendation!
    conversationGuide: ConversationGuide!
    waitingContent: WaitingContent!
    sequencingBrief(testType: String!, providerIds: [String!]!, insurer: String): String!

    # Genomics
    genomicResults: [GenomicResult!]!
    genomicResult(id: String!): GenomicResult
    matchDelta: MatchDelta

    # Pipeline
    pipelineJobs: [PipelineJob!]!
    pipelineJob(id: String!): PipelineJob
    neoantigens(pipelineJobId: String!, sort: String, order: String, confidence: String, gene: String, page: Int, limit: Int): NeoantigenPage!
    pipelineResults(pipelineJobId: String!): PipelineResultDownloads!
    reportPdf(pipelineJobId: String!, reportType: String!): ReportPdfResult!
    neoantigenTrials(pipelineJobId: String!): [NeoantigenTrialMatch!]!

    # Manufacturing
    manufacturingPartners(type: String, capability: String): [ManufacturingPartner!]!
    manufacturingPartner(id: String!): ManufacturingPartner
    manufacturingOrders: [ManufacturingOrder!]!
    manufacturingOrder(id: String!): ManufacturingOrder
    regulatoryAssessments: [RegulatoryPathwayAssessment!]!
    regulatoryAssessment(id: String!): RegulatoryPathwayAssessment
    regulatoryDocuments(assessmentId: String!): [RegulatoryDocument!]!
    regulatoryDocument(id: String!): RegulatoryDocument
    recommendedPartners(pipelineJobId: String!): [PartnerRecommendation!]!

    # Monitoring
    administrationSites(lat: Float, lng: Float, radiusMiles: Float): [AdministrationSite!]!
    administrationSite(id: String!): AdministrationSite
    monitoringReports(orderId: String!): [MonitoringReport!]!
    monitoringSchedule(orderId: String!): [MonitoringScheduleEntry!]!

    # FHIR
    healthSystems(search: String): [HealthSystem!]!
    fhirConnections: [FhirConnection!]!
  }

  # ============================================================================
  # Mutations
  # ============================================================================

  # ============================================================================
  # Patient Intake
  # ============================================================================

  input PatientIntakeInput {
    profile: JSON!
    fieldSources: JSON
    fieldConfidence: JSON
    intakePath: String!
    documents: [DocumentMetaInput!]
    claudeApiCost: Float
  }

  input DocumentMetaInput {
    s3Key: String!
    filename: String!
    mimeType: String!
    fileSize: Int!
  }

  type ExtractionResult {
    status: String!
    profile: JSON
    fieldSources: JSON
    fieldConfidence: JSON
    extractions: JSON
    claudeApiCost: Float
    error: String
  }

  input PatientProfileInput {
    cancerType: String
    stage: String
    histologicalGrade: String
    ecogStatus: Int
    age: Int
    zipCode: String
  }

  input ManualIntakeInput {
    name: String!
    cancerType: String!
    stage: String
    age: Int
    zipCode: String
    priorTreatments: [String!]
  }

  input FinancialProfileInput {
    insuranceType: String
    householdSize: Int
    householdIncome: String
    financialConcerns: [String!]
  }

  input PathwayAssessmentInput {
    pipelineJobId: String
    cancerType: String!
    cancerStage: String!
    priorTreatmentsFailed: Int!
    hasPhysician: Boolean!
    physicianName: String
    physicianEmail: String
    physicianInstitution: String
    isLifeThreatening: Boolean!
    hasExhaustedOptions: Boolean!
    stateOfResidence: String!
  }

  input AdverseEventInput {
    event: String!
    severity: String!
    onset: String!
    duration: String
    resolved: Boolean!
    treatment: String
  }

  input MonitoringReportInput {
    orderId: String!
    reportType: String!
    daysPostAdministration: Int!
    adverseEvents: [AdverseEventInput!]
    temperature: Float
    bloodPressure: String
    heartRate: Int
    qualityOfLifeScore: Int
    tumorResponse: String
    narrative: String
  }

  type Mutation {
    # Auth
    logout: Boolean!

    # Patient
    updatePatientProfile(input: PatientProfileInput!): Patient!
    createPatientManual(input: ManualIntakeInput!): Patient!

    # Matches
    generateMatches: [Match!]!
    updateMatchStatus(matchId: String!, status: String!): Match!

    # Documents
    requestUploadUrl(filename: String!, contentType: String!): UploadUrl!
    extractDocument(documentId: String!): Document!

    # Treatment Translation
    translateTreatment(matchId: String!): TreatmentTranslation!

    # Financial
    matchFinancialPrograms(input: FinancialProfileInput!): [FinancialMatch!]!

    # Sequencing
    checkInsuranceCoverage(insurer: String!, testType: String!): InsuranceCoverage!
    generateLOMN(testType: String!, insurer: String): LOMN!
    generateSequencingRecommendation: SequencingRecommendation!

    # Genomics
    extractGenomicReport(documentId: String!): GenomicResult!
    interpretGenomics: GenomicInterpretation!
    confirmGenomics(genomicResultId: String!, edits: JSON): GenomicResult!
    rematch: MatchDelta!

    # Pipeline
    cancelPipelineJob(jobId: String!): PipelineJob!
    updateSequencingOrderStatus(orderId: String!, status: String!): SequencingOrder!
    revokeFhirConnection(connectionId: String!): Boolean!
    resyncFhirConnection(connectionId: String!): JSON!

    submitPipelineJob(
      tumorDataPath: String!
      normalDataPath: String!
      rnaDataPath: String
      inputFormat: String!
      referenceGenome: String!
    ): PipelineJob!
    generateReportPdf(pipelineJobId: String!, reportType: String!): ReportPdfResult!

    # Manufacturing
    createManufacturingOrder(partnerId: String!, pipelineJobId: String!): ManufacturingOrder!
    updateManufacturingOrderStatus(orderId: String!, status: String!, notes: String): ManufacturingOrder!
    assessRegulatoryPathway(input: PathwayAssessmentInput!): RegulatoryPathwayAssessment!
    generateRegulatoryDocument(assessmentId: String!, documentType: String!): RegulatoryDocument!
    acceptQuote(orderId: String!): ManufacturingOrder!
    connectSite(orderId: String!, siteId: String!): ManufacturingOrder!
    addOrderNote(orderId: String!, note: String!): ManufacturingOrder!

    # Regulatory
    updateRegulatoryDocumentStatus(id: String!, status: String!, reviewNotes: String): RegulatoryDocument!

    # Financial
    subscribeFinancialProgram(programId: String!): Boolean!

    # FHIR
    authorizeFhir(healthSystemId: String!): FhirAuthorizeResult!
    extractFhir(connectionId: String!): JSON!

    # Patient Intake
    savePatientIntake(input: PatientIntakeInput!): Patient!
    extractDocuments(s3Keys: [String!]!, mimeTypes: [String!]!): ExtractionResult!

    # Sequencing Orders
    createSequencingOrder(providerId: String!, testType: String!): SequencingOrder!

    # Monitoring
    submitMonitoringReport(input: MonitoringReportInput!): MonitoringReport!

    # Uploads
    requestGeneralUploadUrl(filename: String!, contentType: String!, bucket: String): UploadUrlResult!
  }
`;
