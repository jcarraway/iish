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
  # Survivorship
  # ============================================================================

  type SurvivorshipPlan {
    id: String!
    patientId: String!
    treatmentCompletionDate: String!
    completionType: String!
    ongoingTherapies: [String!]!
    planContent: JSON!
    riskCategory: String
    currentPhase: String!
    lastGeneratedAt: DateTime!
    nextReviewDate: String
    createdAt: DateTime!
  }

  type SurveillanceEvent {
    id: String!
    patientId: String!
    planId: String!
    type: String!
    title: String!
    description: String
    frequency: String
    guidelineSource: String
    dueDate: String
    status: String!
    completedDate: String
    resultSummary: String
    nextDueDate: String
    createdAt: DateTime!
  }

  type JournalEntry {
    id: String!
    patientId: String!
    entryDate: String!
    energy: Int
    pain: Int
    mood: Int
    sleepQuality: Int
    hotFlashes: Int
    jointPain: Int
    newSymptoms: [String!]
    exerciseType: String
    exerciseMinutes: Int
    medicationsTaken: JSON
    notes: String
    createdAt: DateTime!
  }

  type JournalTrends {
    averageEnergy: Float
    averagePain: Float
    averageMood: Float
    averageSleep: Float
    energyDelta: Float
    painDelta: Float
    moodDelta: Float
    sleepDelta: Float
    streak: Int!
    totalEntries: Int!
    entries: [JournalEntry!]!
  }

  # --- ctDNA ---

  type CtdnaResult {
    id: String!
    testDate: String!
    provider: String
    result: String!
    ctdnaLevel: Float
    interpretation: CtdnaInterpretation
    documentUploadId: String
    triggeredTrialRematch: Boolean!
    createdAt: String!
  }

  type CtdnaInterpretation {
    summary: String!
    whatThisMeans: String!
    nextSteps: String!
    trendContext: String
  }

  # --- Care Team ---

  type CareTeamMember {
    id: String!
    name: String!
    role: String!
    practice: String
    phone: String
    contactFor: [String!]!
  }

  type SymptomRouting {
    urgency: String!
    providerName: String
    providerRole: String
    providerPhone: String
    reasoning: String!
    immediateAction: String
  }

  type AppointmentPrep {
    eventId: String!
    appointmentType: String!
    appointmentDate: String
    symptomSummary: [SymptomTrendItem!]!
    completedSince: [String!]!
    upcomingTests: [String!]!
    overdueItems: [String!]!
    questionsToAsk: [PrepQuestion!]!
    medicationNotes: [String!]!
    generatedAt: String!
  }

  type SymptomTrendItem {
    dimension: String!
    average: Float
    trend: String!
    notableChanges: String
  }

  type PrepQuestion {
    question: String!
    context: String!
  }

  # --- Lifestyle ---

  type LifestyleRecommendations {
    exercise: ExerciseRecommendation!
    nutrition: NutritionRecommendation!
    alcohol: AlcoholRecommendation!
    environment: EnvironmentalRecommendation!
    generatedAt: String!
  }

  type ExerciseRecommendation {
    headline: String!
    effectSize: String!
    weeklyTargetMinutes: Int!
    intensity: String!
    strengthDaysPerWeek: Int!
    precautions: [ExercisePrecaution!]!
    starterPlan: [ExerciseWeek!]!
    symptomExercises: [SymptomExercise!]!
  }

  type ExercisePrecaution {
    issue: String!
    guidance: String!
  }

  type ExerciseWeek {
    week: Int!
    totalMinutes: Int!
    sessions: [ExerciseSession!]!
  }

  type ExerciseSession {
    day: String!
    type: String!
    duration: Int!
    description: String!
  }

  type SymptomExercise {
    symptom: String!
    exerciseType: String!
    evidence: String!
  }

  type NutritionRecommendation {
    headline: String!
    strongEvidence: [String!]!
    medicationGuidance: [MedicationNutrition!]!
    mythBusting: [NutritionMyth!]!
  }

  type MedicationNutrition {
    medication: String!
    considerations: [String!]!
    emphasize: [String!]!
    limit: [String!]!
  }

  type NutritionMyth {
    myth: String!
    reality: String!
    nuance: String!
  }

  type AlcoholRecommendation {
    headline: String!
    quantifiedRisk: String!
    subtypeContext: String!
    recommendation: String!
    evidenceStrength: String!
    honestFraming: String!
  }

  type EnvironmentalRecommendation {
    approach: String!
    steps: [EnvironmentalStep!]!
    overblownConcerns: [OverblownConcern!]!
  }

  type EnvironmentalStep {
    category: String!
    action: String!
    why: String!
    difficulty: String!
    cost: String!
    evidence: String!
  }

  type OverblownConcern {
    claim: String!
    reality: String!
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
    isCancerCenter: Boolean!
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
  # Notifications + Feedback
  # ============================================================================

  type NotificationPreference {
    id: String!
    patientId: String!
    surveillanceReminders: Boolean!
    journalReminders: Boolean!
    weeklySummary: Boolean!
    appointmentPrep: Boolean!
    ctdnaResults: Boolean!
    scpAnnualReview: Boolean!
    lifestyleCheckIn: Boolean!
    phaseTransitions: Boolean!
    researchAlerts: Boolean!
    quietHoursStart: String
    quietHoursEnd: String
    timezone: String!
  }

  type NotificationLogEntry {
    id: String!
    patientId: String!
    category: String!
    channel: String!
    subject: String
    referenceId: String
    referenceType: String
    sentAt: DateTime!
  }

  type SurvivorshipFeedback {
    id: String!
    patientId: String!
    feedbackType: String!
    rating: Int
    comment: String
    context: JSON
    createdAt: DateTime!
  }

  # ============================================================================
  # Recurrence
  # ============================================================================

  type RecurrenceEvent {
    id: String!
    patientId: String!
    detectedDate: String!
    detectionMethod: String!
    recurrenceType: String
    recurrenceSites: [String!]!
    confirmedByBiopsy: Boolean!
    newPathologyAvailable: Boolean!
    newStage: String
    newBiomarkers: JSON
    timeSinceInitialDx: Int
    timeSinceCompletion: Int
    ctdnaResultId: String
    priorTreatments: [String!]!
    documentUploadId: String
    cascadeStatus: CascadeStatus!
    acknowledgedAt: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CascadeStatus {
    acknowledged: Boolean!
    supportOffered: Boolean!
    resequencingRecommended: Boolean!
    trialRematched: Boolean!
    financialRematched: Boolean!
    secondOpinionOffered: Boolean!
    careTeamUpdated: Boolean!
    translatorRegenerated: Boolean!
    planArchived: Boolean!
    pipelineActivated: Boolean!
    genomicComparisonReady: Boolean!
  }

  type GenomicComparison {
    hasNewData: Boolean!
    resistanceMutations: [String!]!
    biomarkerChanges: [String!]!
    actionableChanges: [String!]!
    patientSummary: String!
    generatedAt: String!
  }

  type SecondOpinionResource {
    name: String!
    type: String!
    description: String!
    url: String!
    virtual: Boolean!
  }

  type SCPDiff {
    changedSections: [String!]!
    addedItems: [String!]!
    removedItems: [String!]!
    summary: String!
  }

  type AnnualRefreshResult {
    newPlan: SurvivorshipPlan!
    diff: SCPDiff!
  }

  # ============================================================================
  # Fertility
  # ============================================================================

  type FertilityAssessment {
    id: String!
    patientId: String!
    gonadotoxicityRisk: String!
    riskFactors: [FertilityRiskFactor!]!
    preservationWindowDays: Int
    windowStatus: String!
    recommendation: String!
    recommendationRationale: String
    optionsPresented: JSON
    referralRequested: Boolean!
    referralRequestedAt: String
    providerId: String
    preservationPursued: Boolean
    preservationMethod: String
    preservationCompleted: Boolean
    createdAt: DateTime!
  }

  type FertilityRiskFactor {
    agent: String!
    risk: String!
    amenorrheaRate: String
  }

  type PreservationOption {
    key: String!
    label: String!
    timing: String!
    cost: String!
    successRate: String!
    contraindications: [String!]!
    erPositiveNote: String
    available: Boolean!
  }

  type FertilityProvider {
    id: String!
    name: String!
    type: String!
    address: String!
    city: String!
    state: String!
    zipCode: String!
    latitude: Float
    longitude: Float
    distance: Float
    servicesOffered: [String!]!
    oncologyExperience: Boolean!
    randomStartProtocol: Boolean!
    letrozoleProtocol: Boolean!
    weekendAvailability: Boolean!
    livestrongPartner: Boolean!
    phone: String
    urgentPhone: String
    website: String
    oncofertilityCoordinator: String
  }

  type FertilityFinancialProgram {
    name: String!
    organization: String!
    url: String!
    description: String!
    eligibility: String!
    maxBenefit: String!
    eligible: Boolean!
  }

  type FertilityDiscussionGuide {
    openingStatement: String!
    questions: [String!]!
    keyFacts: [String!]!
    timelineNotes: [String!]!
    generatedAt: String!
  }

  # ============================================================================
  # Insurance Advocate
  # ============================================================================

  type InsuranceDenial {
    id: String!
    patientId: String!
    deniedService: String!
    serviceCategory: String!
    denialDate: String!
    insurerName: String!
    planType: String
    claimNumber: String
    denialReason: String!
    denialReasonCode: String
    denialCategory: String!
    appealDeadline: String
    status: String!
    appealLetters: [AppealLetter!]!
    createdAt: DateTime!
  }

  type AppealLetter {
    id: String!
    denialId: String!
    appealLevel: String!
    letterContent: String!
    supportingDocuments: [String!]!
    patientSummary: String
    generatedAt: String!
    submittedAt: String
    outcome: String
    outcomeDate: String
    outcomeDetails: String
  }

  type AppealStrategy {
    name: String!
    levels: [String!]!
    successRates: JSON!
    supportingEvidence: [String!]!
  }

  type AppealRights {
    acaRights: AcaRights!
    stateProtections: StateProtection
  }

  type AcaRights {
    internalAppealDays: Int!
    urgentInternalHours: Int!
    externalReviewAvailable: Boolean!
    externalReviewDays: Int!
    continuationOfCoverage: Boolean!
  }

  type StateProtection {
    fertilityMandate: Boolean!
    clinicalTrialCoverage: Boolean!
    stepTherapyProtection: Boolean!
    cancerSpecific: String!
  }

  type PeerReviewPrep {
    keyPoints: [String!]!
    anticipatedArguments: [PeerReviewArgument!]!
    guidelines: [String!]!
    reviewerQuestions: [String!]!
    tips: [String!]!
    generatedAt: String!
  }

  type PeerReviewArgument {
    argument: String!
    rebuttal: String!
  }

  # ============================================================================
  # Logistics
  # ============================================================================

  type TrialLogisticsAssessment {
    id: String!
    patientId: String!
    matchId: String!
    siteId: String
    distanceMiles: Float
    estimatedCosts: JSON
    matchedPrograms: JSON
    estimatedOutOfPocket: Float
    feasibilityScore: String!
    barriers: [String!]!
    logisticsPlan: String
    logisticsPlanGeneratedAt: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AssistanceProgramMatch {
    key: String!
    name: String!
    provider: String!
    category: String!
    description: String!
    coverage: String!
    phone: String
    url: String
    eligibility: String!
    eligible: Boolean!
    eligibleReason: String
  }

  type LogisticsAssistanceApplication {
    id: String!
    patientId: String!
    assessmentId: String!
    programKey: String!
    programName: String!
    status: String!
    appliedAt: String
    statusUpdatedAt: String
    notes: String
    createdAt: DateTime!
  }

  input UpdateAssistanceApplicationInput {
    assessmentId: String!
    programKey: String!
    status: String!
    notes: String
  }

  # ============================================================================
  # Second Opinion
  # ============================================================================

  type SecondOpinionTriggerResult {
    id: String!
    name: String!
    severity: String!
    rationale: String!
    evidenceBase: String!
  }

  type SecondOpinionEvaluation {
    triggers: [SecondOpinionTriggerResult!]!
    overallSeverity: String!
    recommended: Boolean!
  }

  type SecondOpinionCenter {
    id: String!
    name: String!
    nciDesignation: String
    subspecialties: [String!]!
    offersVirtual: Boolean!
    virtualPlatform: String
    averageWaitDays: Int
    pathologyReReview: Boolean!
    address: String
    city: String
    state: String
    latitude: Float
    longitude: Float
    distance: Float
    acceptsInsurance: [String!]!
    estimatedCostInsured: String
    estimatedCostUninsured: String
    financialAssistance: Boolean!
    coordinator: String
    phone: String
    website: String
    intakeFormUrl: String
  }

  type SecondOpinionRequest {
    id: String!
    patientId: String!
    triggerReasons: JSON!
    triggerSeverity: String!
    status: String!
    centerId: String
    centerName: String
    isVirtual: Boolean
    appointmentDate: String
    clinicalSummary: String
    questionsForReview: [String!]!
    communicationGuide: JSON
    outcome: String
    outcomeSummary: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CommunicationGuide {
    portalMessage: String!
    inPersonScript: String!
    recordsRequest: String!
    reassurance: String!
  }

  input SelectCenterInput {
    centerId: String!
    isVirtual: Boolean!
    appointmentDate: String
  }

  input RecordSecondOpinionOutcomeInput {
    outcome: String!
    outcomeSummary: String
  }

  # ============================================================================
  # Learn — Educational Content
  # ============================================================================

  type Article {
    id: String!
    slug: String!
    type: String!
    title: String!
    metaTitle: String!
    metaDescription: String!
    patientSummary: String!
    keyTakeaways: [String!]!
    patientContent: [ArticleSection!]!
    clinicalContent: [ArticleSection!]
    actionItems: [ArticleActionItem!]
    keyStatistics: [KeyStatistic!]
    references: JSON
    cancerTypes: [String!]!
    breastSubtypes: [String!]!
    biomarkers: [String!]!
    treatmentClasses: [String!]!
    journeyStages: [String!]!
    audienceLevel: String!
    category: String!
    primaryKeyword: String!
    secondaryKeywords: [String!]!
    relatedArticleSlugs: [String!]!
    glossaryTerms: [String!]!
    status: String!
    viewCount: Int!
    publishedAt: String
    createdAt: DateTime!
  }

  type ArticleSection {
    heading: String!
    body: String!
  }

  type ArticleActionItem {
    text: String!
    link: String
  }

  type KeyStatistic {
    label: String!
    value: String!
    source: String
  }

  type GlossaryTerm {
    id: String!
    term: String!
    slug: String!
    shortDefinition: String!
    fullDefinition: String
    fullArticleSlug: String
    aliases: [String!]!
    category: String!
  }

  type ArticlePersonalizedContext {
    content: String!
    generatedAt: String!
  }

  type ReadingPlanItem {
    articleSlug: String!
    articleTitle: String!
    reason: String!
    priority: String!
  }

  type ReadingPlan {
    readNow: [ReadingPlanItem!]!
    readSoon: [ReadingPlanItem!]!
    whenReady: [ReadingPlanItem!]!
  }

  type ArticleCategoryResult {
    articles: [Article!]!
    label: String!
    description: String!
  }

  input ArticleFilters {
    category: String
    cancerTypes: [String!]
    breastSubtypes: [String!]
    journeyStages: [String!]
    audienceLevel: String
  }

  input GenerateArticleInput {
    type: String!
    topic: String!
    primaryKeyword: String!
    cancerType: String
    category: String!
  }

  input ArticleAdminFilters {
    status: String
    category: String
  }

  type QualityIssue {
    type: String!
    severity: String!
    description: String!
    section: String
  }

  type QualityCheckResult {
    issues: [QualityIssue!]!
    score: Int!
    checkedAt: String!
  }

  type RelatedResearchItem {
    id: String!
    title: String!
    maturityTier: String
    patientSummary: String
    publishedAt: String
    sourceType: String!
    practiceImpact: String
  }

  type RelatedArticle {
    slug: String!
    title: String!
    category: String!
    patientSummary: String!
    viewCount: Int!
  }

  type RefreshTriggerItem {
    id: String!
    title: String!
    maturityTier: String
    practiceImpact: String
    publishedAt: String
  }

  type RefreshTrigger {
    articleId: String!
    articleTitle: String!
    articleSlug: String!
    urgency: String!
    triggerItems: [RefreshTriggerItem!]!
  }

  type RefreshSuggestion {
    sectionsToUpdate: [String!]!
    newDataToIncorporate: [String!]!
    referencesToAdd: [String!]!
    summary: String!
  }

  type ArticleRefreshStatus {
    needsRefresh: Boolean!
    urgency: String
    triggers: [RefreshTriggerItem!]!
    suggestion: RefreshSuggestion
  }

  type ArticleEngagement {
    id: String!
    slug: String!
    title: String!
    category: String!
    viewCount: Int!
    publishedAt: String
  }

  # ============================================================================
  # Intel — Research Intelligence
  # ============================================================================

  type ResearchItem {
    id: String!
    sourceType: String!
    sourceItemId: String
    sourceUrl: String
    sourceCredibility: String!
    title: String!
    rawContent: String
    authors: [String!]!
    institutions: [String!]!
    journalName: String
    doi: String
    publishedAt: String
    cancerTypes: [String!]!
    breastSubtypes: [String!]!
    maturityTier: String
    domains: [String!]!
    treatmentClasses: [String!]!
    biomarkerRelevance: [String!]!
    treatmentStages: [String!]!
    evidenceLevel: String
    practiceImpact: String
    classificationConfidence: Float
    patientSummary: String
    clinicianSummary: ClinicianSummary
    keyEndpoints: JSON
    drugNames: [String!]!
    trialNctIds: [String!]!
    retractionStatus: String
    industrySponsored: Boolean
    sponsorName: String
    authorCOI: String
    hypeScore: Float
    hypeFlags: [String!]!
    relatedItemIds: [String!]!
    contradictedBy: [String!]!
    classificationStatus: String!
    createdAt: DateTime!
  }

  type ClinicianSummary {
    headline: String!
    keyEndpoints: [String!]!
    studyDesign: String!
    context: String!
    practiceImplication: String!
    limitations: [String!]!
    grade: String!
  }

  type IngestionSyncState {
    sourceId: String!
    lastSyncAt: String
    lastItemDate: String
    itemsIngestedTotal: Int!
    itemsIngestedLastRun: Int!
    lastError: String
  }

  type IngestionCycleResult {
    ingested: Int!
    classified: Int!
    summarized: Int!
    skipped: Int!
    errors: Int!
  }

  type SourceIngestionResult {
    ingested: Int!
    skipped: Int!
    errors: Int!
  }

  type IngestionBreakdown {
    pubmed: SourceIngestionResult!
    fda: SourceIngestionResult!
    preprints: SourceIngestionResult!
    clinicaltrials: SourceIngestionResult!
    institutions: SourceIngestionResult!
    nih_reporter: SourceIngestionResult!
  }

  type QCResult {
    checked: Int!
    retracted: Int!
    contradictions: Int!
    errors: Int!
  }

  type TaxonomyMigrationResult {
    practiceImpactUpdated: Int!
    breastSubtypesUpdated: Int!
  }

  # ============================================================================
  # Intel — Feed Personalization (I4)
  # ============================================================================

  type FeedRelevanceItem {
    item: ResearchItem!
    relevanceScore: Int!
    personalizedNote: String
    viewed: Boolean!
    saved: Boolean!
    dismissed: Boolean!
  }

  type PersonalizedFeedResponse {
    items: [FeedRelevanceItem!]!
    total: Int!
    hasMore: Boolean!
  }

  type UserFeedConfig {
    id: ID!
    audienceType: String!
    contentDepth: String!
    showPreclinical: Boolean!
    showNegativeResults: Boolean!
    digestFrequency: String
  }

  type PersonalizedNote {
    itemId: String!
    note: String!
  }

  input PersonalizedFeedFilters {
    maturityTiers: [String!]
    domains: [String!]
    treatmentClasses: [String!]
    practiceImpact: String
    limit: Int
    offset: Int
  }

  input UpdateFeedConfigInput {
    audienceType: String
    contentDepth: String
    showPreclinical: Boolean
    showNegativeResults: Boolean
    digestFrequency: String
  }

  # ============================================================================
  # Intel — Community Intelligence (I5)
  # ============================================================================

  type CommunityReport {
    id: ID!
    patientId: String!
    reportType: String!
    consentScope: String!
    structuredData: JSON!
    narrative: String
    moderationStatus: String!
    verified: Boolean!
    relatedDrug: String
    relatedTrialNctId: String
    relatedItemId: String
    createdAt: String!
  }

  type CommunityInsight {
    drugName: String!
    totalReports: Int!
    averageRating: Float
    commonSideEffects: [CommunityInsightSideEffect!]!
    trialSummary: CommunityTrialSummary
  }

  type CommunityInsightSideEffect {
    effect: String!
    reportedByPercent: Float!
    averageSeverity: Float!
    averageOnset: String
    resolvedPercent: Float!
    topManagementTips: [String!]!
  }

  type CommunityTrialSummary {
    totalReports: Int!
    averageRating: Float!
    commonPros: [String!]!
    commonCons: [String!]!
  }

  type DigestPreview {
    urgent: [DigestItem!]!
    personallyRelevant: [DigestItem!]!
    landscapeHighlights: [DigestItem!]!
    communityHighlights: [DigestItem!]!
    trialUpdates: [DigestItem!]!
    totalNewItems: Int!
  }

  type DigestItem {
    itemId: String!
    headline: String!
    summary: String!
    maturityBadge: String!
    relevanceReason: String
    viewUrl: String!
  }

  input SubmitCommunityReportInput {
    reportType: String!
    consentScope: String!
    structuredData: JSON!
    narrative: String
    relatedDrug: String
    relatedTrialNctId: String
    relatedItemId: String
  }

  # ============================================================================
  # Intel — Landscape Views (I6)
  # ============================================================================

  type LandscapeOverview {
    totalItems: Int!
    maturityDistribution: JSON!
    domainDistribution: JSON!
    subtypeDistribution: JSON!
    treatmentClassDistribution: JSON!
    recentHighlights: [ResearchItem!]!
    lastUpdated: String!
  }

  type SubtypeLandscape {
    subtype: String!
    subtypeLabel: String!
    totalItems: Int!
    maturityDistribution: JSON!
    domainDistribution: JSON!
    standardOfCare: StandardOfCareSummary
    availableNow: [ResearchItem!]!
    expectedSoon: [ResearchItem!]!
    inTrials: [ResearchItem!]!
    earlyResearch: [ResearchItem!]!
    topDrugs: [TreatmentPipelineEntry!]!
  }

  type StandardOfCareSummary {
    subtype: String!
    currentSOC: String!
    whatsChanging: String!
    whatsComing: String!
    whatsBeingExplored: String!
    generatedAt: String!
  }

  type TreatmentPipelineEntry {
    drugName: String!
    maturityTier: String!
    treatmentClass: String!
    itemCount: Int!
    latestItemId: String!
    latestItemTitle: String!
    latestPublishedAt: String
  }

  type TranslatorUpdateCheck {
    hasUpdates: Boolean!
    items: [ResearchItem!]!
    count: Int!
    since: String!
  }

  type FinancialUpdateCheck {
    newApprovals: [ResearchItem!]!
    hasPAPOpportunities: Boolean!
  }

  type SurvivorshipUpdateCheck {
    lateEffectsItems: [ResearchItem!]!
    ctdnaItems: [ResearchItem!]!
    hasUpdates: Boolean!
  }

  input ResearchItemFilters {
    maturityTiers: [String!]
    domains: [String!]
    treatmentClasses: [String!]
    practiceImpact: String
    cancerTypes: [String!]
    breastSubtypes: [String!]
    dateFrom: String
    dateTo: String
    limit: Int
    offset: Int
  }

  # ============================================================================
  # Preventive Trial Matcher (PTM)
  # ============================================================================

  type PreventiveTrial {
    id: ID!
    nctId: String!
    title: String!
    trialCategory: String!
    phase: String
    status: String
    sponsor: String
    briefSummary: String
    curatedSummary: String
    targetPopulation: String
    vaccineTarget: String
    mechanism: String
    keyResults: String
    editorNote: String
    matchingCriteria: JSON
  }

  type PreventiveTrialMatch {
    trial: PreventiveTrial!
    matchStrength: String!
    matchReason: String!
    nextSteps: String!
  }

  type PreventivePrescreenResult {
    matchedTrials: [PreventiveTrialMatch!]!
    totalPreventiveTrials: Int!
    noMatchMessage: String
    riskAssessmentCTA: Boolean!
  }

  type FamilyReferralLink {
    referralCode: String!
    url: String!
    textMessage: String!
    emailSubject: String!
    emailBody: String!
  }

  type ReferralStats {
    totalSent: Int!
    totalRedeemed: Int!
  }

  type ReferralRedemption {
    success: Boolean!
    prefillFamilyHistory: Boolean!
  }

  input PreventivePrescreenInput {
    age: Int!
    hasCancerHistory: Boolean!
    cancerSubtype: String
    treatmentStatus: String
    hasBrca: String!
    hasOtherHighRisk: String!
    hasFamilyHistory: Boolean!
    estimatedLifetimeRisk: Float
    zipCode: String
  }

  # ============================================================================
  # Palliative Care
  # ============================================================================

  type PalliativeAssessment {
    id: ID!
    patientId: String!
    esasScores: JSON!
    triageLevel: String!
    triageRationale: String!
    recommendations: [String!]!
    palliativeReferralRecommended: Boolean!
    providerId: String
    trends: JSON
    createdAt: DateTime!
  }

  type PalliativeCareProvider {
    id: ID!
    name: String!
    type: String!
    setting: String!
    affiliatedHospital: String
    servicesOffered: [String!]!
    acceptsInsurance: [String!]!
    acceptsMedicare: Boolean!
    offersTelehealth: Boolean!
    averageWaitDays: Int
    referralRequired: Boolean!
    address: String
    city: String
    state: String
    zipCode: String
    phone: String
    website: String
    distance: Float
  }

  type AdvanceCarePlan {
    id: ID!
    patientId: String!
    hasLivingWill: Boolean!
    hasHealthcareProxy: Boolean!
    healthcareProxyName: String
    hasPolst: Boolean!
    goalsOfCareDocumented: Boolean!
    goalsOfCareSummary: String
    documentsUploaded: [String!]!
    lastReviewedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type GoalsOfCareGuide {
    introduction: String!
    questions: [GoalsOfCareQuestion!]!
    talkingPoints: [String!]!
    documentChecklist: [String!]!
    generatedAt: String!
  }

  type GoalsOfCareQuestion {
    question: String!
    why: String!
  }

  type ReferralLetter {
    content: String!
    generatedAt: String!
  }

  type PalliativeRecommendation {
    recommended: Boolean!
    reasons: [String!]!
  }

  input SubmitAssessmentInput {
    pain: Int!
    tiredness: Int!
    nausea: Int!
    depression: Int!
    anxiety: Int!
    drowsiness: Int!
    appetite: Int!
    wellbeing: Int!
    shortnessOfBreath: Int!
    other: [OtherSymptomInput!]
  }

  input OtherSymptomInput {
    symptom: String!
    severity: Int!
  }

  input UpdateAdvanceCarePlanInput {
    hasLivingWill: Boolean
    hasHealthcareProxy: Boolean
    healthcareProxyName: String
    hasPolst: Boolean
    goalsOfCareDocumented: Boolean
    goalsOfCareSummary: String
    documentsUploaded: [String!]
    lastReviewedAt: String
  }

  input PalliativeProviderFilters {
    type: String
    setting: String
    telehealth: Boolean
    insurance: String
    maxDistance: Float
  }

  # ============================================================================
  # PREVENT — Pre-Diagnosis Risk Intelligence
  # ============================================================================

  type PreventProfile {
    id: ID!
    patientId: String!
    onboardingCompletedAt: DateTime
    onboardingTier: String
    ageAtMenarche: Int
    pregnancies: Int
    ageAtFirstLiveBirth: Int
    breastfeedingMonths: Int
    menopausalStatus: String
    ageAtMenopause: Int
    ocEver: Boolean
    ocCurrent: Boolean
    ocTotalYears: Float
    hrtEver: Boolean
    hrtCurrent: Boolean
    hrtType: String
    hrtTotalYears: Float
    previousBiopsies: Int
    atypicalHyperplasia: Boolean
    lcis: Boolean
    chestRadiation: Boolean
    breastDensity: String
    bmi: Float
    alcoholDrinksPerWeek: Float
    exerciseMinutesPerWeek: Int
    smokingStatus: String
    familyHistory: JSON
    ethnicity: String
    createdAt: DateTime!
  }

  type RiskAssessment {
    id: ID!
    patientId: String!
    assessmentDate: DateTime!
    modelVersion: String!
    gailInputs: JSON
    lifetimeRiskEstimate: Float!
    lifetimeRiskCiLow: Float
    lifetimeRiskCiHigh: Float
    fiveYearRiskEstimate: Float
    tenYearRiskEstimate: Float
    riskCategory: String!
    riskTrajectory: [RiskTrajectoryPoint!]
    modifiableFactors: [ModifiableFactor!]
    fullAssessment: JSON
    createdAt: DateTime!
  }

  type RiskTrajectoryPoint {
    age: Int!
    risk: Float!
    populationAverage: Float
  }

  type ModifiableFactor {
    factor: String!
    currentValue: String!
    impact: String!
    recommendation: String!
    evidenceStrength: String!
    potentialReduction: Float
  }

  type LocationHistoryEntry {
    id: ID!
    patientId: String!
    zipCode: String!
    state: String
    moveInDate: DateTime
    moveOutDate: DateTime
    residenceType: String
    waterSource: String
    nearbyIndustry: [String!]
    agriculturalProximity: Boolean
    lifeStages: [String!]
    durationMonths: Int
    consentResearchUse: Boolean!
    createdAt: DateTime!
  }

  type DataConsentInfo {
    id: ID!
    patientId: String!
    consentLevel: Int!
    consentedAt: DateTime!
    withdrawnAt: DateTime
  }

  type ScreeningScheduleInfo {
    id: ID!
    patientId: String!
    guidelineSource: String!
    riskCategory: String!
    schedule: JSON!
    nextScreeningDate: DateTime
    nextScreeningType: String
    lastUpdatedAt: DateTime!
  }

  type ChemopreventionEligibility {
    eligible: Boolean!
    fiveYearRisk: Float!
    riskThreshold: Float!
    medications: [ChemopreventionMedication!]!
    contraindications: [String!]!
  }

  type ChemopreventionMedication {
    name: String!
    type: String!
    eligiblePopulation: String!
    riskReduction: String!
    duration: String!
    sideEffects: [String!]!
    contraindications: [String!]!
    keyTrials: [String!]!
  }

  type ChemopreventionGuide {
    overview: String!
    medications: [ChemopreventionMedicationGuide!]!
    questionsForDoctor: [String!]!
    generatedAt: String!
  }

  type ChemopreventionMedicationGuide {
    name: String!
    howItWorks: String!
    benefits: String!
    risks: String!
    patientProfile: String!
  }

  type PreventGenomicProfile {
    id: ID!
    patientId: String!
    dataSource: String
    pathogenicVariants: JSON
    vusVariants: JSON
    genesTested: [String!]!
    prsValue: Float
    prsPercentile: Float
    prsModelVersion: String
    prsAncestryCalibration: String
    prsConfidence: String
    prsRiskMultiplier: Float
    rawFileS3Key: String
    parsingStatus: String!
    snpCount: Int
    prsSnpCount: Int
    extractedAt: DateTime
    createdAt: DateTime!
  }

  input RequestGenotypeUploadInput {
    filename: String!
    contentType: String!
    fileSize: Int!
  }

  type GenotypeUploadResult {
    uploadUrl: String!
    s3Key: String!
    documentUploadId: String!
  }

  type TestingRecommendation {
    recommended: Boolean!
    urgency: String!
    rationale: String!
    recommendedTests: [String!]!
    criteria: [String!]!
    resources: [TestingResource!]!
  }

  type TestingResource {
    name: String!
    url: String!
    description: String!
  }

  input CreatePreventProfileInput {
    ageAtMenarche: Int
    pregnancies: Int
    ageAtFirstLiveBirth: Int
    breastfeedingMonths: Int
    menopausalStatus: String
    ageAtMenopause: Int
    ocEver: Boolean
    ocCurrent: Boolean
    ocTotalYears: Float
    hrtEver: Boolean
    hrtCurrent: Boolean
    hrtType: String
    hrtTotalYears: Float
    previousBiopsies: Int
    atypicalHyperplasia: Boolean
    lcis: Boolean
    chestRadiation: Boolean
    breastDensity: String
    bmi: Float
    alcoholDrinksPerWeek: Float
    exerciseMinutesPerWeek: Int
    smokingStatus: String
    familyHistory: JSON
    ethnicity: String
  }

  input UpdatePreventProfileInput {
    ageAtMenarche: Int
    pregnancies: Int
    ageAtFirstLiveBirth: Int
    breastfeedingMonths: Int
    menopausalStatus: String
    ageAtMenopause: Int
    ocEver: Boolean
    ocCurrent: Boolean
    ocTotalYears: Float
    hrtEver: Boolean
    hrtCurrent: Boolean
    hrtType: String
    hrtTotalYears: Float
    previousBiopsies: Int
    atypicalHyperplasia: Boolean
    lcis: Boolean
    chestRadiation: Boolean
    breastDensity: String
    bmi: Float
    alcoholDrinksPerWeek: Float
    exerciseMinutesPerWeek: Int
    smokingStatus: String
    familyHistory: JSON
    ethnicity: String
  }

  input LocationHistoryInput {
    zipCode: String!
    state: String
    moveInDate: String
    moveOutDate: String
    residenceType: String
    waterSource: String
    nearbyIndustry: [String!]
    agriculturalProximity: Boolean
    lifeStages: [String!]
    durationMonths: Int
    consentResearchUse: Boolean
  }

  # ============================================================================
  # PEERS — Peer Matching & Support
  # ============================================================================

  type PeerMentorProfile {
    id: String!
    patientId: String!
    status: String!
    isTrained: Boolean!
    bio: String
    maxMentees: Int!
    availableHours: String
    communicationPreference: String
    comfortableDiscussing: [String!]!
    notComfortableWith: [String!]!
    totalMenteesSupported: Int!
    averageRating: Float
    verifiedAt: String
    createdAt: String!
  }

  type PeerConnection {
    id: String!
    mentorProfileId: String!
    menteePatientId: String!
    matchScore: Float!
    matchReasons: [String!]!
    status: String!
    role: String
    safetyFlag: Boolean!
    mentorRating: Float
    menteeRating: Float
    feedbackComment: String
    pausedAt: String
    completedAt: String
    endedAt: String
    createdAt: String!
    mentorProfile: PeerMentorProfile
    menteePatient: Patient
  }

  type PeerMatchResult {
    mentorProfileId: String!
    matchScore: Float!
    matchReasons: [String!]!
    summary: PeerMentorSummary!
  }

  type PeerMentorSummary {
    displayName: String!
    ageRange: String!
    diagnosisType: String!
    treatmentPhase: String!
    bio: String
    comfortableDiscussing: [String!]!
    totalMenteesSupported: Int!
    averageRating: Float
  }

  type MentorTrainingModule {
    id: String!
    title: String!
    description: String!
    estimatedMinutes: Int!
    completed: Boolean!
    completedAt: String
  }

  type TrainingModuleResult {
    moduleId: String!
    completed: Boolean!
    allComplete: Boolean!
  }

  type PeerMessage {
    id: String!
    connectionId: String!
    senderPatientId: String!
    content: String!
    sentAt: String!
    readAt: String
    isOwnMessage: Boolean!
    flagged: Boolean
  }

  type SendMessageResult {
    message: PeerMessage!
    crisisAlert: CrisisAlert
  }

  type CrisisAlert {
    detected: Boolean!
    message: String!
    resources: [CrisisResource!]!
  }

  type CrisisResource {
    name: String!
    phone: String!
    description: String!
    available: String!
  }

  type MentorStats {
    totalMenteesSupported: Int!
    activeConnections: Int!
    averageRating: Float
    totalMessages: Int!
    modulesCompleted: Int!
  }

  type PeerSafetyReport {
    id: String!
    status: String!
    safetyFlag: Boolean!
    concernType: String
    concernDescription: String
    safetyNotes: String
  }

  input EnrollMentorInput {
    bio: String
    maxMentees: Int
    availableHours: String
    communicationPreference: String
    comfortableDiscussing: [String!]
    notComfortableWith: [String!]
  }

  input UpdateMentorProfileInput {
    bio: String
    maxMentees: Int
    availableHours: String
    communicationPreference: String
    comfortableDiscussing: [String!]
    notComfortableWith: [String!]
  }

  input SendPeerMessageInput {
    connectionId: String!
    content: String!
  }

  # ============================================================================
  # Queries
  # ============================================================================

  type Query {
    # Auth
    me: SessionData

    # Report (inline preview)
    generateReport(pipelineJobId: String!, reportType: String!): JSON

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

    # Survivorship
    survivorshipPlan: SurvivorshipPlan
    surveillanceSchedule: [SurveillanceEvent!]!
    journalEntries(limit: Int): [JournalEntry!]!
    journalTrends(days: Int!): JournalTrends!
    lifestyleRecommendations: LifestyleRecommendations
    careTeam: [CareTeamMember!]!
    routeSymptom(symptom: String!): SymptomRouting!
    appointmentPrep(eventId: String!): AppointmentPrep
    ctdnaHistory: [CtdnaResult!]!

    # Notifications + Feedback
    notificationPreferences: NotificationPreference
    notificationHistory(limit: Int): [NotificationLogEntry!]!
    survivorshipFeedback: [SurvivorshipFeedback!]!

    # Recurrence
    recurrenceEvent: RecurrenceEvent
    recurrenceEvents: [RecurrenceEvent!]!
    genomicComparison(recurrenceEventId: String!): GenomicComparison!
    secondOpinionResources: [SecondOpinionResource!]!

    # FHIR
    healthSystems(search: String): [HealthSystem!]!
    fhirConnections: [FhirConnection!]!

    # Fertility
    fertilityAssessment: FertilityAssessment
    preservationOptions: [PreservationOption!]!
    fertilityProviders(filters: String): [FertilityProvider!]!
    fertilityFinancialPrograms: [FertilityFinancialProgram!]!

    # Insurance Advocate
    insuranceDenials: [InsuranceDenial!]!
    insuranceDenial(id: String!): InsuranceDenial
    appealLetter(id: String!): AppealLetter
    appealStrategy(denialCategory: String!): AppealStrategy!
    appealRights(state: String): AppealRights!

    # Logistics
    trialLogisticsAssessment(matchId: String!): TrialLogisticsAssessment
    trialLogisticsAssessments: [TrialLogisticsAssessment!]!
    assistancePrograms: [AssistanceProgramMatch!]!
    assistanceApplications: [LogisticsAssistanceApplication!]!

    # Second Opinion
    secondOpinionEvaluation: SecondOpinionEvaluation!
    secondOpinionRequest: SecondOpinionRequest
    secondOpinionCenters(virtual: Boolean, subspecialty: String): [SecondOpinionCenter!]!

    # Learn (public — no auth required)
    article(slug: String!): Article
    articles(filters: ArticleFilters): [Article!]!
    articlesByCategory(category: String!): ArticleCategoryResult!
    searchArticles(query: String!, filters: ArticleFilters): [Article!]!
    glossaryTerms(category: String): [GlossaryTerm!]!
    glossaryTerm(slug: String!): GlossaryTerm

    # Learn (public — INTEL cross-links)
    relatedResearch(slug: String!, limit: Int): [RelatedResearchItem!]!
    articlesForResearchItem(itemId: String!, limit: Int): [RelatedArticle!]!

    # Learn (authenticated)
    readingPlan: ReadingPlan
    articlesAdmin(filters: ArticleAdminFilters): [Article!]!
    articleRefreshStatus(articleId: String!): ArticleRefreshStatus!
    articleEngagement: [ArticleEngagement!]!

    # Intel — Research Intelligence (public)
    researchItems(filters: ResearchItemFilters): [ResearchItem!]!
    researchItem(id: String!): ResearchItem
    searchResearch(query: String!, filters: ResearchItemFilters): [ResearchItem!]!

    # Intel — Landscape Views (I6, public)
    landscapeOverview: LandscapeOverview!
    subtypeLandscape(subtype: String!): SubtypeLandscape!
    treatmentPipeline(subtype: String): [TreatmentPipelineEntry!]!
    recentDevelopments(subtype: String, days: Int): [ResearchItem!]!

    # Intel — Landscape Integration (I6, authenticated)
    translatorUpdates: TranslatorUpdateCheck!
    financialUpdates: FinancialUpdateCheck!
    survivorshipUpdates: SurvivorshipUpdateCheck!

    # Intel — Research Intelligence (authenticated)
    ingestionSyncStates: [IngestionSyncState!]!
    personalizedFeed(filters: PersonalizedFeedFilters): PersonalizedFeedResponse!
    personalizedNote(itemId: String!): PersonalizedNote!
    feedConfig: UserFeedConfig!

    # Intel — Community Intelligence (I5, authenticated)
    communityReports: [CommunityReport!]!
    communityInsights(drugName: String!): CommunityInsight
    communityInsightsForItem(itemId: String!): CommunityInsight
    digestPreview: DigestPreview!

    # Preventive Trial Matcher (public)
    preventiveTrials(category: String): [PreventiveTrial!]!
    preventivePrescreen(input: PreventivePrescreenInput!): PreventivePrescreenResult!

    # Preventive Trial Matcher (authenticated)
    preventiveTrialsForFamily: [PreventiveTrialMatch!]!
    recurrencePreventionTrials: [PreventiveTrialMatch!]!
    referralStats: ReferralStats!

    # Palliative Care
    latestPalliativeAssessment: PalliativeAssessment
    symptomAssessmentHistory(limit: Int): [PalliativeAssessment!]!
    palliativeCareProviders(filters: PalliativeProviderFilters): [PalliativeCareProvider!]!
    advanceCarePlan: AdvanceCarePlan!
    shouldRecommendPalliative: PalliativeRecommendation!

    # PREVENT — Pre-Diagnosis Risk
    preventProfile: PreventProfile
    latestRisk: RiskAssessment
    riskAssessments: [RiskAssessment!]!
    locationHistory: [LocationHistoryEntry!]!
    dataConsent: DataConsentInfo
    screeningSchedule: ScreeningScheduleInfo
    chemopreventionEligibility: ChemopreventionEligibility
    chemopreventionGuide: ChemopreventionGuide
    testingRecommendations: TestingRecommendation
    preventGenomicProfile: PreventGenomicProfile
    preventionLifestyle: JSON

    # PEERS — Peer Support
    peerMentorProfile: PeerMentorProfile
    peerMatches: [PeerMatchResult!]!
    peerConnections: [PeerConnection!]!
    peerConnection(connectionId: String!): PeerConnection
    mentorTrainingModules: [MentorTrainingModule!]!
    peerMessages(connectionId: String!, limit: Int, before: String): [PeerMessage!]!
    mentorStats: MentorStats
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

  input TreatmentCompletionInput {
    completionDate: String!
    completionType: String!
    ongoingTherapies: [String!]!
    newSymptoms: String
    wantsReminders: Boolean!
  }

  input MarkEventCompleteInput {
    eventId: String!
    completedDate: String!
    resultSummary: String
    resultDocumentId: String
  }

  input SkipEventInput {
    eventId: String!
    reason: String!
  }

  input RescheduleEventInput {
    eventId: String!
    newDueDate: String!
  }

  input UploadEventResultInput {
    eventId: String!
    documentId: String!
  }

  input SubmitJournalEntryInput {
    entryDate: String!
    energy: Int!
    pain: Int!
    mood: Int!
    sleepQuality: Int!
    hotFlashes: Int
    jointPain: Int
    newSymptoms: [String!]
    exerciseType: String
    exerciseMinutes: Int
    notes: String
  }

  input AddCtdnaResultInput {
    testDate: String!
    provider: String!
    result: String!
    ctdnaLevel: Float
    documentId: String
  }

  input AddCareTeamMemberInput {
    name: String!
    role: String!
    practice: String
    phone: String
    contactFor: [String!]
  }

  input UpdateCareTeamMemberInput {
    memberId: String!
    name: String
    role: String
    practice: String
    phone: String
    contactFor: [String!]
  }

  input UpdateNotificationPreferenceInput {
    surveillanceReminders: Boolean
    journalReminders: Boolean
    weeklySummary: Boolean
    appointmentPrep: Boolean
    ctdnaResults: Boolean
    scpAnnualReview: Boolean
    lifestyleCheckIn: Boolean
    phaseTransitions: Boolean
    quietHoursStart: String
    quietHoursEnd: String
    timezone: String
  }

  input SubmitFeedbackInput {
    feedbackType: String!
    rating: Int
    comment: String
    context: JSON
  }

  input ReportRecurrenceInput {
    detectedDate: String!
    detectionMethod: String!
    recurrenceType: String
    recurrenceSites: [String!]
    confirmedByBiopsy: Boolean
    newStage: String
    documentUploadId: String
  }

  input UpdateCascadeStepInput {
    recurrenceEventId: String!
    step: String!
    value: Boolean!
  }

  input RequestFertilityReferralInput {
    assessmentId: String!
    providerId: String!
  }

  input UpdateFertilityOutcomeInput {
    assessmentId: String!
    preservationPursued: Boolean
    preservationMethod: String
    preservationCompleted: Boolean
  }

  input CreateDenialInput {
    deniedService: String!
    serviceCategory: String!
    denialDate: String!
    insurerName: String!
    planType: String
    claimNumber: String
    denialReason: String!
    denialReasonCode: String
    denialCategory: String!
  }

  input UpdateAppealOutcomeInput {
    appealId: String!
    outcome: String!
    outcomeDate: String
    outcomeDetails: String
  }

  input UpdateDenialStatusInput {
    denialId: String!
    status: String!
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
    requestMagicLink(email: String!, redirect: String): Boolean!

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

    # Survivorship
    completeTreatment(input: TreatmentCompletionInput!): SurvivorshipPlan!
    refreshSCP: SurvivorshipPlan!
    markEventComplete(input: MarkEventCompleteInput!): SurveillanceEvent!
    skipEvent(input: SkipEventInput!): SurveillanceEvent!
    rescheduleEvent(input: RescheduleEventInput!): SurveillanceEvent!
    uploadEventResult(input: UploadEventResultInput!): SurveillanceEvent!
    submitJournalEntry(input: SubmitJournalEntryInput!): JournalEntry!
    deleteJournalEntry(entryId: String!): Boolean!
    generateLifestyleRecommendations: LifestyleRecommendations!
    addCareTeamMember(input: AddCareTeamMemberInput!): CareTeamMember!
    updateCareTeamMember(input: UpdateCareTeamMemberInput!): CareTeamMember!
    removeCareTeamMember(memberId: String!): Boolean!
    generateAppointmentPrep(eventId: String!): AppointmentPrep!
    addCtdnaResult(input: AddCtdnaResultInput!): CtdnaResult!

    # Notifications + Feedback
    updateNotificationPreferences(input: UpdateNotificationPreferenceInput!): NotificationPreference!
    submitFeedback(input: SubmitFeedbackInput!): SurvivorshipFeedback!
    annualRefreshSCP: AnnualRefreshResult!

    # Recurrence
    reportRecurrence(input: ReportRecurrenceInput!): RecurrenceEvent!
    acknowledgeRecurrence(recurrenceEventId: String!): RecurrenceEvent!
    updateCascadeStep(input: UpdateCascadeStepInput!): RecurrenceEvent!
    regenerateTranslator(recurrenceEventId: String!): RecurrenceEvent!
    archiveSurvivorshipPlan: Boolean!

    # Fertility
    assessFertilityRisk: FertilityAssessment!
    generateFertilityDiscussionGuide: FertilityDiscussionGuide!
    requestFertilityReferral(input: RequestFertilityReferralInput!): FertilityAssessment!
    updateFertilityOutcome(input: UpdateFertilityOutcomeInput!): FertilityAssessment!

    # Insurance Advocate
    createInsuranceDenial(input: CreateDenialInput!): InsuranceDenial!
    generateAppealLetter(denialId: String!): AppealLetter!
    updateAppealOutcome(input: UpdateAppealOutcomeInput!): AppealLetter!
    updateDenialStatus(input: UpdateDenialStatusInput!): InsuranceDenial!
    generatePeerReviewPrep(denialId: String!): PeerReviewPrep!

    # Uploads
    requestGeneralUploadUrl(filename: String!, contentType: String!, bucket: String): UploadUrlResult!

    # Logistics
    assessTrialLogistics(matchId: String!): TrialLogisticsAssessment!
    generateLogisticsPlan(matchId: String!): JSON!
    updateAssistanceApplication(input: UpdateAssistanceApplicationInput!): LogisticsAssistanceApplication!

    # Second Opinion
    createSecondOpinionRequest: SecondOpinionRequest!
    generateRecordPacket: JSON!
    generateCommunicationGuide: CommunicationGuide!
    selectSecondOpinionCenter(input: SelectCenterInput!): SecondOpinionRequest!
    recordSecondOpinionOutcome(input: RecordSecondOpinionOutcomeInput!): SecondOpinionRequest!

    # Learn
    generateArticle(input: GenerateArticleInput!): Article!
    publishArticle(articleId: String!): Article!
    generatePersonalizedContext(slug: String!): ArticlePersonalizedContext!
    generateReadingPlan: ReadingPlan!
    updateArticleStatus(articleId: String!, status: String!, notes: String): Article!
    checkArticleQuality(articleId: String!): QualityCheckResult!
    runArticleQualityChecks: JSON!
    insertPlatformLinks(articleId: String!): Article!
    generateRefreshSuggestion(articleId: String!, triggerItemIds: [String!]!): RefreshSuggestion!
    runRefreshCheckCycle: JSON!

    # Intel — Research Intelligence
    markItemViewed(itemId: String!): Boolean!
    markItemSaved(itemId: String!, saved: Boolean!): Boolean!
    markItemDismissed(itemId: String!): Boolean!
    updateFeedConfig(input: UpdateFeedConfigInput!): UserFeedConfig!
    computeRelevanceScores: Int!
    triggerIngestion(sourceId: String!): IngestionCycleResult!
    reclassifyItem(itemId: String!): ResearchItem!
    runQCPipeline(batchSize: Int): QCResult!
    migrateOldTaxonomy: TaxonomyMigrationResult!

    # Intel — Landscape Views (I6)
    generateStandardOfCare(subtype: String!): StandardOfCareSummary!

    # Intel — Community Intelligence (I5)
    submitCommunityReport(input: SubmitCommunityReportInput!): CommunityReport!
    moderateCommunityReport(reportId: String!, status: String!): CommunityReport!
    updateDigestPreferences(frequency: String): UserFeedConfig!

    # Preventive Trial Matcher
    redeemReferralCode(code: String!): ReferralRedemption!
    generateFamilyReferralLink: FamilyReferralLink!

    # Palliative Care
    submitSymptomAssessment(input: SubmitAssessmentInput!): PalliativeAssessment!
    updateAdvanceCarePlan(input: UpdateAdvanceCarePlanInput!): AdvanceCarePlan!
    generateGoalsOfCareGuide: GoalsOfCareGuide!
    generateReferralLetter: ReferralLetter!
    selectPalliativeProvider(assessmentId: String!, providerId: String!): PalliativeAssessment!

    # PREVENT
    createPreventProfile(input: CreatePreventProfileInput!): PreventProfile!
    updatePreventProfile(input: UpdatePreventProfileInput!): PreventProfile!
    saveLocationHistory(locations: [LocationHistoryInput!]!): [LocationHistoryEntry!]!
    updateDataConsent(level: Int!): DataConsentInfo!
    generateScreeningSchedule: ScreeningScheduleInfo!
    generateChemopreventionGuide: ChemopreventionGuide!
    updateFamilyHistory(familyHistory: JSON!): PreventProfile!
    generatePreventionLifestyle: JSON!
    requestGenotypeUpload(input: RequestGenotypeUploadInput!): GenotypeUploadResult!
    parseGenotypeFile(s3Key: String!, documentUploadId: String!): PreventGenomicProfile!
    calculatePrs(ancestryOverride: String): PreventGenomicProfile!
    recalculateRisk: RiskAssessment!

    # PEERS — Peer Support
    enrollAsMentor(input: EnrollMentorInput!): PeerMentorProfile!
    updateMentorProfile(input: UpdateMentorProfileInput!): PeerMentorProfile!
    proposeConnection(mentorProfileId: String!): PeerConnection!
    respondToConnection(connectionId: String!, accept: Boolean!): PeerConnection!
    completeTrainingModule(moduleId: String!): TrainingModuleResult!
    sendPeerMessage(input: SendPeerMessageInput!): SendMessageResult!
    markPeerMessagesRead(connectionId: String!): Boolean!
    pauseConnection(connectionId: String!, reason: String): PeerConnection!
    resumeConnection(connectionId: String!): PeerConnection!
    completeConnection(connectionId: String!): PeerConnection!
    endConnection(connectionId: String!, reason: String): PeerConnection!
    submitConnectionFeedback(connectionId: String!, rating: Float!, comment: String): PeerConnection!
    reportPeerConcern(connectionId: String!, concernType: String!, description: String!): PeerConnection!
  }
`;
