import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  JSON: { input: Record<string, unknown>; output: Record<string, unknown>; }
};

export type AddCareTeamMemberInput = {
  contactFor?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  practice?: InputMaybe<Scalars['String']['input']>;
  role: Scalars['String']['input'];
};

export type AddCtdnaResultInput = {
  ctdnaLevel?: InputMaybe<Scalars['Float']['input']>;
  documentId?: InputMaybe<Scalars['String']['input']>;
  provider: Scalars['String']['input'];
  result: Scalars['String']['input'];
  testDate: Scalars['String']['input'];
};

export type AdministrationSite = {
  __typename?: 'AdministrationSite';
  address?: Maybe<Scalars['String']['output']>;
  canAdministerMrna: Scalars['Boolean']['output'];
  city?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  distance?: Maybe<Scalars['Float']['output']>;
  hasEmergencyResponse: Scalars['Boolean']['output'];
  hasInfusionCenter: Scalars['Boolean']['output'];
  hasMonitoringCapacity: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  investigationalExp: Scalars['Boolean']['output'];
  irbAffiliation?: Maybe<Scalars['String']['output']>;
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  state?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  verified: Scalars['Boolean']['output'];
  website?: Maybe<Scalars['String']['output']>;
  willingToAdminister?: Maybe<Scalars['Boolean']['output']>;
  zip?: Maybe<Scalars['String']['output']>;
};

export type AdverseEvent = {
  __typename?: 'AdverseEvent';
  duration?: Maybe<Scalars['String']['output']>;
  event: Scalars['String']['output'];
  onset: Scalars['String']['output'];
  resolved: Scalars['Boolean']['output'];
  severity: Scalars['String']['output'];
  treatment?: Maybe<Scalars['String']['output']>;
};

export type AdverseEventInput = {
  duration?: InputMaybe<Scalars['String']['input']>;
  event: Scalars['String']['input'];
  onset: Scalars['String']['input'];
  resolved: Scalars['Boolean']['input'];
  severity: Scalars['String']['input'];
  treatment?: InputMaybe<Scalars['String']['input']>;
};

export type AlcoholRecommendation = {
  __typename?: 'AlcoholRecommendation';
  evidenceStrength: Scalars['String']['output'];
  headline: Scalars['String']['output'];
  honestFraming: Scalars['String']['output'];
  quantifiedRisk: Scalars['String']['output'];
  recommendation: Scalars['String']['output'];
  subtypeContext: Scalars['String']['output'];
};

export type AnnualRefreshResult = {
  __typename?: 'AnnualRefreshResult';
  diff: ScpDiff;
  newPlan: SurvivorshipPlan;
};

export type AppointmentPrep = {
  __typename?: 'AppointmentPrep';
  appointmentDate?: Maybe<Scalars['String']['output']>;
  appointmentType: Scalars['String']['output'];
  completedSince: Array<Scalars['String']['output']>;
  eventId: Scalars['String']['output'];
  generatedAt: Scalars['String']['output'];
  medicationNotes: Array<Scalars['String']['output']>;
  overdueItems: Array<Scalars['String']['output']>;
  questionsToAsk: Array<PrepQuestion>;
  symptomSummary: Array<SymptomTrendItem>;
  upcomingTests: Array<Scalars['String']['output']>;
};

export type CareTeamMember = {
  __typename?: 'CareTeamMember';
  contactFor: Array<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  practice?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
};

export type CommonConcern = {
  __typename?: 'CommonConcern';
  answer: Scalars['String']['output'];
  concern: Scalars['String']['output'];
};

export type CommonMutation = {
  __typename?: 'CommonMutation';
  drugs: Array<Scalars['String']['output']>;
  frequency: Scalars['String']['output'];
  name: Scalars['String']['output'];
  significance: Scalars['String']['output'];
};

export type ConversationGuide = {
  __typename?: 'ConversationGuide';
  emailTemplate: Scalars['String']['output'];
  generatedAt: Scalars['String']['output'];
  orderingInstructions: Scalars['String']['output'];
  questionsToAsk: Array<DoctorQuestion>;
  talkingPoints: Array<TalkingPoint>;
};

export type CtdnaInterpretation = {
  __typename?: 'CtdnaInterpretation';
  nextSteps: Scalars['String']['output'];
  summary: Scalars['String']['output'];
  trendContext?: Maybe<Scalars['String']['output']>;
  whatThisMeans: Scalars['String']['output'];
};

export type CtdnaResult = {
  __typename?: 'CtdnaResult';
  createdAt: Scalars['String']['output'];
  ctdnaLevel?: Maybe<Scalars['Float']['output']>;
  documentUploadId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  interpretation?: Maybe<CtdnaInterpretation>;
  provider?: Maybe<Scalars['String']['output']>;
  result: Scalars['String']['output'];
  testDate: Scalars['String']['output'];
  triggeredTrialRematch: Scalars['Boolean']['output'];
};

export type DoctorQuestion = {
  __typename?: 'DoctorQuestion';
  question: Scalars['String']['output'];
  whyItMatters: Scalars['String']['output'];
};

export type Document = {
  __typename?: 'Document';
  createdAt: Scalars['DateTime']['output'];
  extraction?: Maybe<Scalars['JSON']['output']>;
  filename: Scalars['String']['output'];
  id: Scalars['String']['output'];
  patientId: Scalars['String']['output'];
  s3Key?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type DocumentMetaInput = {
  fileSize: Scalars['Int']['input'];
  filename: Scalars['String']['input'];
  mimeType: Scalars['String']['input'];
  s3Key: Scalars['String']['input'];
};

export type DrugCard = {
  __typename?: 'DrugCard';
  commonSideEffects: Array<SideEffect>;
  genericName?: Maybe<Scalars['String']['output']>;
  mechanism: Scalars['String']['output'];
  name: Scalars['String']['output'];
  seriousSideEffects: Array<Scalars['String']['output']>;
  tips: Array<Scalars['String']['output']>;
  whyThisDrug: Scalars['String']['output'];
};

export type EnvironmentalRecommendation = {
  __typename?: 'EnvironmentalRecommendation';
  approach: Scalars['String']['output'];
  overblownConcerns: Array<OverblownConcern>;
  steps: Array<EnvironmentalStep>;
};

export type EnvironmentalStep = {
  __typename?: 'EnvironmentalStep';
  action: Scalars['String']['output'];
  category: Scalars['String']['output'];
  cost: Scalars['String']['output'];
  difficulty: Scalars['String']['output'];
  evidence: Scalars['String']['output'];
  why: Scalars['String']['output'];
};

export type ExercisePrecaution = {
  __typename?: 'ExercisePrecaution';
  guidance: Scalars['String']['output'];
  issue: Scalars['String']['output'];
};

export type ExerciseRecommendation = {
  __typename?: 'ExerciseRecommendation';
  effectSize: Scalars['String']['output'];
  headline: Scalars['String']['output'];
  intensity: Scalars['String']['output'];
  precautions: Array<ExercisePrecaution>;
  starterPlan: Array<ExerciseWeek>;
  strengthDaysPerWeek: Scalars['Int']['output'];
  symptomExercises: Array<SymptomExercise>;
  weeklyTargetMinutes: Scalars['Int']['output'];
};

export type ExerciseSession = {
  __typename?: 'ExerciseSession';
  day: Scalars['String']['output'];
  description: Scalars['String']['output'];
  duration: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type ExerciseWeek = {
  __typename?: 'ExerciseWeek';
  sessions: Array<ExerciseSession>;
  totalMinutes: Scalars['Int']['output'];
  week: Scalars['Int']['output'];
};

export type ExtractionResult = {
  __typename?: 'ExtractionResult';
  claudeApiCost?: Maybe<Scalars['Float']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  extractions?: Maybe<Scalars['JSON']['output']>;
  fieldConfidence?: Maybe<Scalars['JSON']['output']>;
  fieldSources?: Maybe<Scalars['JSON']['output']>;
  profile?: Maybe<Scalars['JSON']['output']>;
  status: Scalars['String']['output'];
};

export type FhirAuthorizeResult = {
  __typename?: 'FhirAuthorizeResult';
  authorizeUrl: Scalars['String']['output'];
};

export type FhirConnection = {
  __typename?: 'FhirConnection';
  healthSystemName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastSyncedAt?: Maybe<Scalars['DateTime']['output']>;
  resourcesPulled?: Maybe<Scalars['JSON']['output']>;
  scopesGranted?: Maybe<Array<Scalars['String']['output']>>;
  syncStatus?: Maybe<Scalars['String']['output']>;
};

export type FinancialMatch = {
  __typename?: 'FinancialMatch';
  applicationUrl?: Maybe<Scalars['String']['output']>;
  assistanceCategories: Array<Scalars['String']['output']>;
  estimatedBenefit?: Maybe<Scalars['String']['output']>;
  matchReasoning: Scalars['String']['output'];
  matchStatus: Scalars['String']['output'];
  maxBenefitAmount?: Maybe<Scalars['Float']['output']>;
  missingInfo: Array<Scalars['String']['output']>;
  organization: Scalars['String']['output'];
  programId: Scalars['String']['output'];
  programName: Scalars['String']['output'];
  type: Scalars['String']['output'];
  website: Scalars['String']['output'];
};

export type FinancialProfileInput = {
  financialConcerns?: InputMaybe<Array<Scalars['String']['input']>>;
  householdIncome?: InputMaybe<Scalars['String']['input']>;
  householdSize?: InputMaybe<Scalars['Int']['input']>;
  insuranceType?: InputMaybe<Scalars['String']['input']>;
};

export type FinancialProgram = {
  __typename?: 'FinancialProgram';
  applicationUrl?: Maybe<Scalars['String']['output']>;
  assistanceCategories: Array<Scalars['String']['output']>;
  benefitDescription?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  maxBenefitAmount?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  organization: Scalars['String']['output'];
  type: Scalars['String']['output'];
  website: Scalars['String']['output'];
};

export type GenomicAlteration = {
  __typename?: 'GenomicAlteration';
  alteration: Scalars['String']['output'];
  alterationType: Scalars['String']['output'];
  clinicalSignificance: Scalars['String']['output'];
  confidence: Scalars['Float']['output'];
  gene: Scalars['String']['output'];
  therapyImplications: TherapyImplications;
  variantAlleleFrequency?: Maybe<Scalars['Float']['output']>;
};

export type GenomicBiomarkers = {
  __typename?: 'GenomicBiomarkers';
  hrd?: Maybe<HrdBiomarker>;
  loh?: Maybe<LohBiomarker>;
  msi?: Maybe<MsiBiomarker>;
  pdl1?: Maybe<Pdl1Biomarker>;
  tmb?: Maybe<TmbBiomarker>;
};

export type GenomicData = {
  __typename?: 'GenomicData';
  alterations: Array<GenomicAlteration>;
  biomarkers: GenomicBiomarkers;
  germlineFindings?: Maybe<Array<GermlineFinding>>;
  testDate?: Maybe<Scalars['String']['output']>;
  testName: Scalars['String']['output'];
  testProvider: Scalars['String']['output'];
};

export type GenomicInterpretation = {
  __typename?: 'GenomicInterpretation';
  biomarkerProfile: Scalars['JSON']['output'];
  generatedAt: Scalars['String']['output'];
  mutations: Scalars['JSON']['output'];
  questionsForOncologist: Array<DoctorQuestion>;
  summary: Scalars['String']['output'];
};

export type GenomicResult = {
  __typename?: 'GenomicResult';
  alterations: Array<GenomicAlteration>;
  biomarkers?: Maybe<GenomicBiomarkers>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  interpretation?: Maybe<Scalars['JSON']['output']>;
  patientId: Scalars['String']['output'];
  provider: Scalars['String']['output'];
  reportDate?: Maybe<Scalars['String']['output']>;
  testName: Scalars['String']['output'];
};

export type GermlineFinding = {
  __typename?: 'GermlineFinding';
  gene: Scalars['String']['output'];
  significance: Scalars['String']['output'];
  variant: Scalars['String']['output'];
};

export type HealthSystem = {
  __typename?: 'HealthSystem';
  brand?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  ehrVendor: Scalars['String']['output'];
  fhirBaseUrl: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isCancerCenter: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  state?: Maybe<Scalars['String']['output']>;
};

export type HrdBiomarker = {
  __typename?: 'HrdBiomarker';
  score?: Maybe<Scalars['Float']['output']>;
  status: Scalars['String']['output'];
};

export type InsuranceCoverage = {
  __typename?: 'InsuranceCoverage';
  conditions: Array<Scalars['String']['output']>;
  cptCodes: Array<Scalars['String']['output']>;
  estimatedOutOfPocket?: Maybe<Scalars['String']['output']>;
  insurer: Scalars['String']['output'];
  missingInfo: Array<Scalars['String']['output']>;
  priorAuthRequired: Scalars['Boolean']['output'];
  reasoning: Scalars['String']['output'];
  status: Scalars['String']['output'];
  testType: Scalars['String']['output'];
};

export type JournalEntry = {
  __typename?: 'JournalEntry';
  createdAt: Scalars['DateTime']['output'];
  energy?: Maybe<Scalars['Int']['output']>;
  entryDate: Scalars['String']['output'];
  exerciseMinutes?: Maybe<Scalars['Int']['output']>;
  exerciseType?: Maybe<Scalars['String']['output']>;
  hotFlashes?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  jointPain?: Maybe<Scalars['Int']['output']>;
  medicationsTaken?: Maybe<Scalars['JSON']['output']>;
  mood?: Maybe<Scalars['Int']['output']>;
  newSymptoms?: Maybe<Array<Scalars['String']['output']>>;
  notes?: Maybe<Scalars['String']['output']>;
  pain?: Maybe<Scalars['Int']['output']>;
  patientId: Scalars['String']['output'];
  sleepQuality?: Maybe<Scalars['Int']['output']>;
};

export type JournalTrends = {
  __typename?: 'JournalTrends';
  averageEnergy?: Maybe<Scalars['Float']['output']>;
  averageMood?: Maybe<Scalars['Float']['output']>;
  averagePain?: Maybe<Scalars['Float']['output']>;
  averageSleep?: Maybe<Scalars['Float']['output']>;
  energyDelta?: Maybe<Scalars['Float']['output']>;
  entries: Array<JournalEntry>;
  moodDelta?: Maybe<Scalars['Float']['output']>;
  painDelta?: Maybe<Scalars['Float']['output']>;
  sleepDelta?: Maybe<Scalars['Float']['output']>;
  streak: Scalars['Int']['output'];
  totalEntries: Scalars['Int']['output'];
};

export type LlmAssessment = {
  __typename?: 'LLMAssessment';
  actionItems: Array<Scalars['String']['output']>;
  missingInfo: Array<Scalars['String']['output']>;
  overallAssessment: Scalars['String']['output'];
  potentialBlockers: Array<Scalars['String']['output']>;
  reasoning: Scalars['String']['output'];
};

export type Lomn = {
  __typename?: 'LOMN';
  content: Scalars['String']['output'];
  cptCodes: Array<Scalars['String']['output']>;
  generatedAt: Scalars['String']['output'];
  icdCodes: Array<Scalars['String']['output']>;
  testType: Scalars['String']['output'];
};

export type LifestyleRecommendations = {
  __typename?: 'LifestyleRecommendations';
  alcohol: AlcoholRecommendation;
  environment: EnvironmentalRecommendation;
  exercise: ExerciseRecommendation;
  generatedAt: Scalars['String']['output'];
  nutrition: NutritionRecommendation;
};

export type LohBiomarker = {
  __typename?: 'LohBiomarker';
  status: Scalars['String']['output'];
};

export type ManualIntakeInput = {
  age?: InputMaybe<Scalars['Int']['input']>;
  cancerType: Scalars['String']['input'];
  name: Scalars['String']['input'];
  priorTreatments?: InputMaybe<Array<Scalars['String']['input']>>;
  stage?: InputMaybe<Scalars['String']['input']>;
  zipCode?: InputMaybe<Scalars['String']['input']>;
};

export type ManufacturingOrder = {
  __typename?: 'ManufacturingOrder';
  administeredAt?: Maybe<Scalars['String']['output']>;
  administeredBy?: Maybe<Scalars['String']['output']>;
  administrationSite?: Maybe<AdministrationSite>;
  administrationSiteId?: Maybe<Scalars['String']['output']>;
  assessment?: Maybe<RegulatoryPathwayAssessment>;
  assessmentId?: Maybe<Scalars['String']['output']>;
  batchNumber?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deliveredAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['JSON']['output']>;
  partner?: Maybe<ManufacturingPartner>;
  partnerId: Scalars['String']['output'];
  partnerName?: Maybe<Scalars['String']['output']>;
  patientId: Scalars['String']['output'];
  paymentStatus?: Maybe<Scalars['String']['output']>;
  pipelineJobId: Scalars['String']['output'];
  productionEstimatedCompletion?: Maybe<Scalars['String']['output']>;
  productionStartedAt?: Maybe<Scalars['String']['output']>;
  qcCompletedAt?: Maybe<Scalars['String']['output']>;
  qcNotes?: Maybe<Scalars['String']['output']>;
  qcPassed?: Maybe<Scalars['Boolean']['output']>;
  qcStartedAt?: Maybe<Scalars['String']['output']>;
  quoteCurrency?: Maybe<Scalars['String']['output']>;
  quoteExpiresAt?: Maybe<Scalars['String']['output']>;
  quotePrice?: Maybe<Scalars['Float']['output']>;
  quoteTurnaroundWeeks?: Maybe<Scalars['Int']['output']>;
  reports: Array<MonitoringReport>;
  shippedAt?: Maybe<Scalars['String']['output']>;
  shippingCarrier?: Maybe<Scalars['String']['output']>;
  shippingConditions?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  totalCost?: Maybe<Scalars['Float']['output']>;
  trackingNumber?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ManufacturingPartner = {
  __typename?: 'ManufacturingPartner';
  capabilities: Array<Scalars['String']['output']>;
  capacityTier: Scalars['String']['output'];
  certifications: Array<Scalars['String']['output']>;
  contactUrl?: Maybe<Scalars['String']['output']>;
  costRangeMax?: Maybe<Scalars['Float']['output']>;
  costRangeMin?: Maybe<Scalars['Float']['output']>;
  country: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  regulatorySupport: Array<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
  turnaroundWeeksMax?: Maybe<Scalars['Int']['output']>;
  turnaroundWeeksMin?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
};

export type MarkEventCompleteInput = {
  completedDate: Scalars['String']['input'];
  eventId: Scalars['String']['input'];
  resultDocumentId?: InputMaybe<Scalars['String']['input']>;
  resultSummary?: InputMaybe<Scalars['String']['input']>;
};

export type Match = {
  __typename?: 'Match';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  llmAssessment?: Maybe<LlmAssessment>;
  matchBreakdown: Array<MatchBreakdownItem>;
  matchScore: Scalars['Float']['output'];
  patientId: Scalars['String']['output'];
  potentialBlockers: Array<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  trial?: Maybe<Trial>;
  trialId: Scalars['String']['output'];
};

export type MatchBreakdownItem = {
  __typename?: 'MatchBreakdownItem';
  category: Scalars['String']['output'];
  reason: Scalars['String']['output'];
  score: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  weight: Scalars['Float']['output'];
};

export type MatchDelta = {
  __typename?: 'MatchDelta';
  improvedMatches: Array<MatchDeltaEntry>;
  newMatches: Array<MatchDeltaEntry>;
  removedMatches: Array<MatchDeltaEntry>;
  totalAfter: Scalars['Int']['output'];
  totalBefore: Scalars['Int']['output'];
};

export type MatchDeltaEntry = {
  __typename?: 'MatchDeltaEntry';
  genomicBasis?: Maybe<Scalars['String']['output']>;
  nctId: Scalars['String']['output'];
  newScore?: Maybe<Scalars['Float']['output']>;
  oldScore?: Maybe<Scalars['Float']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  trialId: Scalars['String']['output'];
};

export type MedicationNutrition = {
  __typename?: 'MedicationNutrition';
  considerations: Array<Scalars['String']['output']>;
  emphasize: Array<Scalars['String']['output']>;
  limit: Array<Scalars['String']['output']>;
  medication: Scalars['String']['output'];
};

export type MonitoringReport = {
  __typename?: 'MonitoringReport';
  adverseEvents?: Maybe<Array<AdverseEvent>>;
  bloodPressure?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  daysPostAdministration: Scalars['Int']['output'];
  hasAdverseEvents: Scalars['Boolean']['output'];
  heartRate?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  narrative?: Maybe<Scalars['String']['output']>;
  orderId: Scalars['String']['output'];
  qualityOfLifeScore?: Maybe<Scalars['Int']['output']>;
  reportType: Scalars['String']['output'];
  status: Scalars['String']['output'];
  temperature?: Maybe<Scalars['Float']['output']>;
  tumorResponse?: Maybe<Scalars['String']['output']>;
};

export type MonitoringReportInput = {
  adverseEvents?: InputMaybe<Array<AdverseEventInput>>;
  bloodPressure?: InputMaybe<Scalars['String']['input']>;
  daysPostAdministration: Scalars['Int']['input'];
  heartRate?: InputMaybe<Scalars['Int']['input']>;
  narrative?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['String']['input'];
  qualityOfLifeScore?: InputMaybe<Scalars['Int']['input']>;
  reportType: Scalars['String']['input'];
  temperature?: InputMaybe<Scalars['Float']['input']>;
  tumorResponse?: InputMaybe<Scalars['String']['input']>;
};

export type MonitoringScheduleEntry = {
  __typename?: 'MonitoringScheduleEntry';
  daysAfter: Scalars['Int']['output'];
  description: Scalars['String']['output'];
  dueDate?: Maybe<Scalars['String']['output']>;
  reportType: Scalars['String']['output'];
  required: Scalars['Boolean']['output'];
  status: Scalars['String']['output'];
  submittedAt?: Maybe<Scalars['String']['output']>;
};

export type MsiBiomarker = {
  __typename?: 'MsiBiomarker';
  score?: Maybe<Scalars['Float']['output']>;
  status: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptQuote: ManufacturingOrder;
  addCareTeamMember: CareTeamMember;
  addCtdnaResult: CtdnaResult;
  addOrderNote: ManufacturingOrder;
  annualRefreshSCP: AnnualRefreshResult;
  assessRegulatoryPathway: RegulatoryPathwayAssessment;
  authorizeFhir: FhirAuthorizeResult;
  cancelPipelineJob: PipelineJob;
  checkInsuranceCoverage: InsuranceCoverage;
  completeTreatment: SurvivorshipPlan;
  confirmGenomics: GenomicResult;
  connectSite: ManufacturingOrder;
  createManufacturingOrder: ManufacturingOrder;
  createPatientManual: Patient;
  createSequencingOrder: SequencingOrder;
  deleteJournalEntry: Scalars['Boolean']['output'];
  extractDocument: Document;
  extractDocuments: ExtractionResult;
  extractFhir: Scalars['JSON']['output'];
  extractGenomicReport: GenomicResult;
  generateAppointmentPrep: AppointmentPrep;
  generateLOMN: Lomn;
  generateLifestyleRecommendations: LifestyleRecommendations;
  generateMatches: Array<Match>;
  generateRegulatoryDocument: RegulatoryDocument;
  generateReportPdf: ReportPdfResult;
  generateSequencingRecommendation: SequencingRecommendation;
  interpretGenomics: GenomicInterpretation;
  logout: Scalars['Boolean']['output'];
  markEventComplete: SurveillanceEvent;
  matchFinancialPrograms: Array<FinancialMatch>;
  refreshSCP: SurvivorshipPlan;
  rematch: MatchDelta;
  removeCareTeamMember: Scalars['Boolean']['output'];
  requestGeneralUploadUrl: UploadUrlResult;
  requestMagicLink: Scalars['Boolean']['output'];
  requestUploadUrl: UploadUrl;
  rescheduleEvent: SurveillanceEvent;
  resyncFhirConnection: Scalars['JSON']['output'];
  revokeFhirConnection: Scalars['Boolean']['output'];
  savePatientIntake: Patient;
  skipEvent: SurveillanceEvent;
  submitFeedback: SurvivorshipFeedback;
  submitJournalEntry: JournalEntry;
  submitMonitoringReport: MonitoringReport;
  submitPipelineJob: PipelineJob;
  subscribeFinancialProgram: Scalars['Boolean']['output'];
  translateTreatment: TreatmentTranslation;
  updateCareTeamMember: CareTeamMember;
  updateManufacturingOrderStatus: ManufacturingOrder;
  updateMatchStatus: Match;
  updateNotificationPreferences: NotificationPreference;
  updatePatientProfile: Patient;
  updateRegulatoryDocumentStatus: RegulatoryDocument;
  updateSequencingOrderStatus: SequencingOrder;
  uploadEventResult: SurveillanceEvent;
};


export type MutationAcceptQuoteArgs = {
  orderId: Scalars['String']['input'];
};


export type MutationAddCareTeamMemberArgs = {
  input: AddCareTeamMemberInput;
};


export type MutationAddCtdnaResultArgs = {
  input: AddCtdnaResultInput;
};


export type MutationAddOrderNoteArgs = {
  note: Scalars['String']['input'];
  orderId: Scalars['String']['input'];
};


export type MutationAssessRegulatoryPathwayArgs = {
  input: PathwayAssessmentInput;
};


export type MutationAuthorizeFhirArgs = {
  healthSystemId: Scalars['String']['input'];
};


export type MutationCancelPipelineJobArgs = {
  jobId: Scalars['String']['input'];
};


export type MutationCheckInsuranceCoverageArgs = {
  insurer: Scalars['String']['input'];
  testType: Scalars['String']['input'];
};


export type MutationCompleteTreatmentArgs = {
  input: TreatmentCompletionInput;
};


export type MutationConfirmGenomicsArgs = {
  edits?: InputMaybe<Scalars['JSON']['input']>;
  genomicResultId: Scalars['String']['input'];
};


export type MutationConnectSiteArgs = {
  orderId: Scalars['String']['input'];
  siteId: Scalars['String']['input'];
};


export type MutationCreateManufacturingOrderArgs = {
  partnerId: Scalars['String']['input'];
  pipelineJobId: Scalars['String']['input'];
};


export type MutationCreatePatientManualArgs = {
  input: ManualIntakeInput;
};


export type MutationCreateSequencingOrderArgs = {
  providerId: Scalars['String']['input'];
  testType: Scalars['String']['input'];
};


export type MutationDeleteJournalEntryArgs = {
  entryId: Scalars['String']['input'];
};


export type MutationExtractDocumentArgs = {
  documentId: Scalars['String']['input'];
};


export type MutationExtractDocumentsArgs = {
  mimeTypes: Array<Scalars['String']['input']>;
  s3Keys: Array<Scalars['String']['input']>;
};


export type MutationExtractFhirArgs = {
  connectionId: Scalars['String']['input'];
};


export type MutationExtractGenomicReportArgs = {
  documentId: Scalars['String']['input'];
};


export type MutationGenerateAppointmentPrepArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationGenerateLomnArgs = {
  insurer?: InputMaybe<Scalars['String']['input']>;
  testType: Scalars['String']['input'];
};


export type MutationGenerateRegulatoryDocumentArgs = {
  assessmentId: Scalars['String']['input'];
  documentType: Scalars['String']['input'];
};


export type MutationGenerateReportPdfArgs = {
  pipelineJobId: Scalars['String']['input'];
  reportType: Scalars['String']['input'];
};


export type MutationMarkEventCompleteArgs = {
  input: MarkEventCompleteInput;
};


export type MutationMatchFinancialProgramsArgs = {
  input: FinancialProfileInput;
};


export type MutationRemoveCareTeamMemberArgs = {
  memberId: Scalars['String']['input'];
};


export type MutationRequestGeneralUploadUrlArgs = {
  bucket?: InputMaybe<Scalars['String']['input']>;
  contentType: Scalars['String']['input'];
  filename: Scalars['String']['input'];
};


export type MutationRequestMagicLinkArgs = {
  email: Scalars['String']['input'];
  redirect?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRequestUploadUrlArgs = {
  contentType: Scalars['String']['input'];
  filename: Scalars['String']['input'];
};


export type MutationRescheduleEventArgs = {
  input: RescheduleEventInput;
};


export type MutationResyncFhirConnectionArgs = {
  connectionId: Scalars['String']['input'];
};


export type MutationRevokeFhirConnectionArgs = {
  connectionId: Scalars['String']['input'];
};


export type MutationSavePatientIntakeArgs = {
  input: PatientIntakeInput;
};


export type MutationSkipEventArgs = {
  input: SkipEventInput;
};


export type MutationSubmitFeedbackArgs = {
  input: SubmitFeedbackInput;
};


export type MutationSubmitJournalEntryArgs = {
  input: SubmitJournalEntryInput;
};


export type MutationSubmitMonitoringReportArgs = {
  input: MonitoringReportInput;
};


export type MutationSubmitPipelineJobArgs = {
  inputFormat: Scalars['String']['input'];
  normalDataPath: Scalars['String']['input'];
  referenceGenome: Scalars['String']['input'];
  rnaDataPath?: InputMaybe<Scalars['String']['input']>;
  tumorDataPath: Scalars['String']['input'];
};


export type MutationSubscribeFinancialProgramArgs = {
  programId: Scalars['String']['input'];
};


export type MutationTranslateTreatmentArgs = {
  matchId: Scalars['String']['input'];
};


export type MutationUpdateCareTeamMemberArgs = {
  input: UpdateCareTeamMemberInput;
};


export type MutationUpdateManufacturingOrderStatusArgs = {
  notes?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['String']['input'];
  status: Scalars['String']['input'];
};


export type MutationUpdateMatchStatusArgs = {
  matchId: Scalars['String']['input'];
  status: Scalars['String']['input'];
};


export type MutationUpdateNotificationPreferencesArgs = {
  input: UpdateNotificationPreferenceInput;
};


export type MutationUpdatePatientProfileArgs = {
  input: PatientProfileInput;
};


export type MutationUpdateRegulatoryDocumentStatusArgs = {
  id: Scalars['String']['input'];
  reviewNotes?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
};


export type MutationUpdateSequencingOrderStatusArgs = {
  orderId: Scalars['String']['input'];
  status: Scalars['String']['input'];
};


export type MutationUploadEventResultArgs = {
  input: UploadEventResultInput;
};

export type NeoantigenCandidate = {
  __typename?: 'NeoantigenCandidate';
  bindingAffinityNm: Scalars['Float']['output'];
  clonality?: Maybe<Scalars['String']['output']>;
  compositeScore: Scalars['Float']['output'];
  confidence: Scalars['String']['output'];
  gene: Scalars['String']['output'];
  hlaAllele: Scalars['String']['output'];
  id: Scalars['String']['output'];
  immunogenicityScore: Scalars['Float']['output'];
  jobId: Scalars['String']['output'];
  mutantPeptide: Scalars['String']['output'];
  mutation: Scalars['String']['output'];
  rank: Scalars['Int']['output'];
  vaf?: Maybe<Scalars['Float']['output']>;
  wildtypePeptide?: Maybe<Scalars['String']['output']>;
};

export type NeoantigenPage = {
  __typename?: 'NeoantigenPage';
  neoantigens: Array<NeoantigenCandidate>;
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type NeoantigenTrialMatch = {
  __typename?: 'NeoantigenTrialMatch';
  matchedNeoantigens: Array<Scalars['String']['output']>;
  nctId: Scalars['String']['output'];
  phase?: Maybe<Scalars['String']['output']>;
  relevanceExplanation: Scalars['String']['output'];
  relevanceScore: Scalars['Float']['output'];
  title: Scalars['String']['output'];
  trialId: Scalars['String']['output'];
};

export type NotificationLogEntry = {
  __typename?: 'NotificationLogEntry';
  category: Scalars['String']['output'];
  channel: Scalars['String']['output'];
  id: Scalars['String']['output'];
  patientId: Scalars['String']['output'];
  referenceId?: Maybe<Scalars['String']['output']>;
  referenceType?: Maybe<Scalars['String']['output']>;
  sentAt: Scalars['DateTime']['output'];
  subject?: Maybe<Scalars['String']['output']>;
};

export type NotificationPreference = {
  __typename?: 'NotificationPreference';
  appointmentPrep: Scalars['Boolean']['output'];
  ctdnaResults: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  journalReminders: Scalars['Boolean']['output'];
  lifestyleCheckIn: Scalars['Boolean']['output'];
  patientId: Scalars['String']['output'];
  phaseTransitions: Scalars['Boolean']['output'];
  quietHoursEnd?: Maybe<Scalars['String']['output']>;
  quietHoursStart?: Maybe<Scalars['String']['output']>;
  scpAnnualReview: Scalars['Boolean']['output'];
  surveillanceReminders: Scalars['Boolean']['output'];
  timezone: Scalars['String']['output'];
  weeklySummary: Scalars['Boolean']['output'];
};

export type NutritionMyth = {
  __typename?: 'NutritionMyth';
  myth: Scalars['String']['output'];
  nuance: Scalars['String']['output'];
  reality: Scalars['String']['output'];
};

export type NutritionRecommendation = {
  __typename?: 'NutritionRecommendation';
  headline: Scalars['String']['output'];
  medicationGuidance: Array<MedicationNutrition>;
  mythBusting: Array<NutritionMyth>;
  strongEvidence: Array<Scalars['String']['output']>;
};

export type OncologistBrief = {
  __typename?: 'OncologistBrief';
  content: Scalars['String']['output'];
  generatedAt: Scalars['String']['output'];
  matchId: Scalars['String']['output'];
};

export type OverblownConcern = {
  __typename?: 'OverblownConcern';
  claim: Scalars['String']['output'];
  reality: Scalars['String']['output'];
};

export type PartnerRecommendation = {
  __typename?: 'PartnerRecommendation';
  capabilities: Array<Scalars['String']['output']>;
  certifications: Array<Scalars['String']['output']>;
  costRangeMax?: Maybe<Scalars['Float']['output']>;
  costRangeMin?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  partnerId: Scalars['String']['output'];
  reasons: Array<Scalars['String']['output']>;
  score: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  turnaroundWeeksMax?: Maybe<Scalars['Int']['output']>;
  turnaroundWeeksMin?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
};

export type PathwayAssessmentInput = {
  cancerStage: Scalars['String']['input'];
  cancerType: Scalars['String']['input'];
  hasExhaustedOptions: Scalars['Boolean']['input'];
  hasPhysician: Scalars['Boolean']['input'];
  isLifeThreatening: Scalars['Boolean']['input'];
  physicianEmail?: InputMaybe<Scalars['String']['input']>;
  physicianInstitution?: InputMaybe<Scalars['String']['input']>;
  physicianName?: InputMaybe<Scalars['String']['input']>;
  pipelineJobId?: InputMaybe<Scalars['String']['input']>;
  priorTreatmentsFailed: Scalars['Int']['input'];
  stateOfResidence: Scalars['String']['input'];
};

export type Patient = {
  __typename?: 'Patient';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  intakeMethod?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<PatientProfile>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PatientIntakeInput = {
  claudeApiCost?: InputMaybe<Scalars['Float']['input']>;
  documents?: InputMaybe<Array<DocumentMetaInput>>;
  fieldConfidence?: InputMaybe<Scalars['JSON']['input']>;
  fieldSources?: InputMaybe<Scalars['JSON']['input']>;
  intakePath: Scalars['String']['input'];
  profile: Scalars['JSON']['input'];
};

export type PatientProfile = {
  __typename?: 'PatientProfile';
  age?: Maybe<Scalars['Int']['output']>;
  biomarkers?: Maybe<Scalars['JSON']['output']>;
  cancerType?: Maybe<Scalars['String']['output']>;
  cancerTypeNormalized?: Maybe<Scalars['String']['output']>;
  ecogStatus?: Maybe<Scalars['Int']['output']>;
  genomicData?: Maybe<GenomicData>;
  histologicalGrade?: Maybe<Scalars['String']['output']>;
  priorTreatments?: Maybe<Array<PriorTreatment>>;
  receptorStatus?: Maybe<ReceptorStatus>;
  stage?: Maybe<Scalars['String']['output']>;
  zipCode?: Maybe<Scalars['String']['output']>;
};

export type PatientProfileInput = {
  age?: InputMaybe<Scalars['Int']['input']>;
  cancerType?: InputMaybe<Scalars['String']['input']>;
  ecogStatus?: InputMaybe<Scalars['Int']['input']>;
  histologicalGrade?: InputMaybe<Scalars['String']['input']>;
  stage?: InputMaybe<Scalars['String']['input']>;
  zipCode?: InputMaybe<Scalars['String']['input']>;
};

export type Pdl1Biomarker = {
  __typename?: 'Pdl1Biomarker';
  cps?: Maybe<Scalars['Float']['output']>;
  tps?: Maybe<Scalars['Float']['output']>;
};

export type PipelineJob = {
  __typename?: 'PipelineJob';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentStep?: Maybe<Scalars['String']['output']>;
  estimatedCompletion?: Maybe<Scalars['String']['output']>;
  estimatedCostUsd?: Maybe<Scalars['Float']['output']>;
  hlaGenotype?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['String']['output'];
  inputFormat: Scalars['String']['output'];
  neoantigenCount?: Maybe<Scalars['Int']['output']>;
  patientId: Scalars['String']['output'];
  referenceGenome: Scalars['String']['output'];
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
  stepErrors?: Maybe<Scalars['JSON']['output']>;
  stepsCompleted: Array<Scalars['String']['output']>;
  tmb?: Maybe<Scalars['Float']['output']>;
  topNeoantigens?: Maybe<Scalars['JSON']['output']>;
  totalComputeSeconds?: Maybe<Scalars['Float']['output']>;
  vaccineBlueprint?: Maybe<Scalars['JSON']['output']>;
  variantCount?: Maybe<Scalars['Int']['output']>;
};

export type PipelineResultDownloads = {
  __typename?: 'PipelineResultDownloads';
  fullReportPdf?: Maybe<Scalars['String']['output']>;
  jobId: Scalars['String']['output'];
  neoantigenReport?: Maybe<Scalars['String']['output']>;
  patientSummary?: Maybe<Scalars['String']['output']>;
  vaccineBlueprint?: Maybe<Scalars['String']['output']>;
};

export type PrepQuestion = {
  __typename?: 'PrepQuestion';
  context: Scalars['String']['output'];
  question: Scalars['String']['output'];
};

export type PriorTreatment = {
  __typename?: 'PriorTreatment';
  endDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  response?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  administrationSite?: Maybe<AdministrationSite>;
  administrationSites: Array<AdministrationSite>;
  appointmentPrep?: Maybe<AppointmentPrep>;
  careTeam: Array<CareTeamMember>;
  conversationGuide: ConversationGuide;
  ctdnaHistory: Array<CtdnaResult>;
  documents: Array<Document>;
  fhirConnections: Array<FhirConnection>;
  financialMatches: Array<FinancialMatch>;
  financialProgram?: Maybe<FinancialProgram>;
  financialPrograms: Array<FinancialProgram>;
  generateReport?: Maybe<Scalars['JSON']['output']>;
  genomicResult?: Maybe<GenomicResult>;
  genomicResults: Array<GenomicResult>;
  healthSystems: Array<HealthSystem>;
  journalEntries: Array<JournalEntry>;
  journalTrends: JournalTrends;
  lifestyleRecommendations?: Maybe<LifestyleRecommendations>;
  manufacturingOrder?: Maybe<ManufacturingOrder>;
  manufacturingOrders: Array<ManufacturingOrder>;
  manufacturingPartner?: Maybe<ManufacturingPartner>;
  manufacturingPartners: Array<ManufacturingPartner>;
  match?: Maybe<Match>;
  matchDelta?: Maybe<MatchDelta>;
  matches: Array<Match>;
  me?: Maybe<SessionData>;
  monitoringReports: Array<MonitoringReport>;
  monitoringSchedule: Array<MonitoringScheduleEntry>;
  neoantigenTrials: Array<NeoantigenTrialMatch>;
  neoantigens: NeoantigenPage;
  notificationHistory: Array<NotificationLogEntry>;
  notificationPreferences?: Maybe<NotificationPreference>;
  oncologistBrief: OncologistBrief;
  patient?: Maybe<Patient>;
  patientProfile?: Maybe<PatientProfile>;
  pipelineJob?: Maybe<PipelineJob>;
  pipelineJobs: Array<PipelineJob>;
  pipelineResults: PipelineResultDownloads;
  recommendedPartners: Array<PartnerRecommendation>;
  regulatoryAssessment?: Maybe<RegulatoryPathwayAssessment>;
  regulatoryAssessments: Array<RegulatoryPathwayAssessment>;
  regulatoryDocument?: Maybe<RegulatoryDocument>;
  regulatoryDocuments: Array<RegulatoryDocument>;
  reportPdf: ReportPdfResult;
  routeSymptom: SymptomRouting;
  sequencingBrief: Scalars['String']['output'];
  sequencingExplanation: SequencingExplanation;
  sequencingOrder?: Maybe<SequencingOrder>;
  sequencingOrders: Array<SequencingOrder>;
  sequencingProviders: Array<SequencingProvider>;
  sequencingRecommendation: SequencingRecommendation;
  surveillanceSchedule: Array<SurveillanceEvent>;
  survivorshipFeedback: Array<SurvivorshipFeedback>;
  survivorshipPlan?: Maybe<SurvivorshipPlan>;
  testRecommendation: TestRecommendation;
  trial?: Maybe<Trial>;
  trials: Array<Trial>;
  waitingContent: WaitingContent;
};


export type QueryAdministrationSiteArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdministrationSitesArgs = {
  lat?: InputMaybe<Scalars['Float']['input']>;
  lng?: InputMaybe<Scalars['Float']['input']>;
  radiusMiles?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryAppointmentPrepArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryFinancialProgramArgs = {
  programId: Scalars['String']['input'];
};


export type QueryGenerateReportArgs = {
  pipelineJobId: Scalars['String']['input'];
  reportType: Scalars['String']['input'];
};


export type QueryGenomicResultArgs = {
  id: Scalars['String']['input'];
};


export type QueryHealthSystemsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryJournalEntriesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryJournalTrendsArgs = {
  days: Scalars['Int']['input'];
};


export type QueryManufacturingOrderArgs = {
  id: Scalars['String']['input'];
};


export type QueryManufacturingPartnerArgs = {
  id: Scalars['String']['input'];
};


export type QueryManufacturingPartnersArgs = {
  capability?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMatchArgs = {
  id: Scalars['String']['input'];
};


export type QueryMonitoringReportsArgs = {
  orderId: Scalars['String']['input'];
};


export type QueryMonitoringScheduleArgs = {
  orderId: Scalars['String']['input'];
};


export type QueryNeoantigenTrialsArgs = {
  pipelineJobId: Scalars['String']['input'];
};


export type QueryNeoantigensArgs = {
  confidence?: InputMaybe<Scalars['String']['input']>;
  gene?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pipelineJobId: Scalars['String']['input'];
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryNotificationHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOncologistBriefArgs = {
  matchId: Scalars['String']['input'];
};


export type QueryPipelineJobArgs = {
  id: Scalars['String']['input'];
};


export type QueryPipelineResultsArgs = {
  pipelineJobId: Scalars['String']['input'];
};


export type QueryRecommendedPartnersArgs = {
  pipelineJobId: Scalars['String']['input'];
};


export type QueryRegulatoryAssessmentArgs = {
  id: Scalars['String']['input'];
};


export type QueryRegulatoryDocumentArgs = {
  id: Scalars['String']['input'];
};


export type QueryRegulatoryDocumentsArgs = {
  assessmentId: Scalars['String']['input'];
};


export type QueryReportPdfArgs = {
  pipelineJobId: Scalars['String']['input'];
  reportType: Scalars['String']['input'];
};


export type QueryRouteSymptomArgs = {
  symptom: Scalars['String']['input'];
};


export type QuerySequencingBriefArgs = {
  insurer?: InputMaybe<Scalars['String']['input']>;
  providerIds: Array<Scalars['String']['input']>;
  testType: Scalars['String']['input'];
};


export type QuerySequencingOrderArgs = {
  id: Scalars['String']['input'];
};


export type QueryTestRecommendationArgs = {
  preferComprehensive?: InputMaybe<Scalars['Boolean']['input']>;
  tissueAvailable?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryTrialArgs = {
  id: Scalars['String']['input'];
};


export type QueryTrialsArgs = {
  cancerType?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  phase?: InputMaybe<Scalars['String']['input']>;
};

export type ReceptorDetail = {
  __typename?: 'ReceptorDetail';
  method?: Maybe<Scalars['String']['output']>;
  percentage?: Maybe<Scalars['Float']['output']>;
  status: Scalars['String']['output'];
};

export type ReceptorStatus = {
  __typename?: 'ReceptorStatus';
  er?: Maybe<ReceptorDetail>;
  her2?: Maybe<ReceptorDetail>;
  pr?: Maybe<ReceptorDetail>;
};

export type RegulatoryDocument = {
  __typename?: 'RegulatoryDocument';
  assessmentId: Scalars['String']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  documentType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  reviewNotes?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['String']['output']>;
  reviewedBy?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type RegulatoryPathwayAssessment = {
  __typename?: 'RegulatoryPathwayAssessment';
  alternatives?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  estimatedCostMax: Scalars['Float']['output'];
  estimatedCostMin: Scalars['Float']['output'];
  estimatedTimelineWeeks: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  patientId: Scalars['String']['output'];
  rationale: Scalars['String']['output'];
  recommended: Scalars['String']['output'];
  requiredDocuments: Array<Scalars['String']['output']>;
};

export type ReportPdfResult = {
  __typename?: 'ReportPdfResult';
  cached: Scalars['Boolean']['output'];
  url: Scalars['String']['output'];
};

export type RescheduleEventInput = {
  eventId: Scalars['String']['input'];
  newDueDate: Scalars['String']['input'];
};

export type ScpDiff = {
  __typename?: 'SCPDiff';
  addedItems: Array<Scalars['String']['output']>;
  changedSections: Array<Scalars['String']['output']>;
  removedItems: Array<Scalars['String']['output']>;
  summary: Scalars['String']['output'];
};

export type SecondOpinionTrigger = {
  __typename?: 'SecondOpinionTrigger';
  level: Scalars['String']['output'];
  reason: Scalars['String']['output'];
};

export type SequencingExplanation = {
  __typename?: 'SequencingExplanation';
  commonConcerns: Array<CommonConcern>;
  generatedAt: Scalars['String']['output'];
  howItWorks: Scalars['String']['output'];
  personalRelevance: Scalars['String']['output'];
  whatIsIt: Scalars['String']['output'];
  whatItFinds: Scalars['String']['output'];
};

export type SequencingOrder = {
  __typename?: 'SequencingOrder';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  insuranceCoverage?: Maybe<Scalars['JSON']['output']>;
  lomnContent?: Maybe<Scalars['String']['output']>;
  patientId: Scalars['String']['output'];
  provider?: Maybe<SequencingProvider>;
  providerId: Scalars['String']['output'];
  status: Scalars['String']['output'];
  testType: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type SequencingProvider = {
  __typename?: 'SequencingProvider';
  costRangeMax: Scalars['Float']['output'];
  costRangeMin: Scalars['Float']['output'];
  fdaApproved: Scalars['Boolean']['output'];
  geneCount: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  orderingProcess?: Maybe<Scalars['String']['output']>;
  reportFormat?: Maybe<Scalars['String']['output']>;
  sampleTypes: Array<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  testNames: Array<Scalars['String']['output']>;
  turnaroundDaysMax: Scalars['Int']['output'];
  turnaroundDaysMin: Scalars['Int']['output'];
  type: Scalars['String']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type SequencingRecommendation = {
  __typename?: 'SequencingRecommendation';
  generatedAt: Scalars['String']['output'];
  guidelineRecommendation: Scalars['String']['output'];
  headline: Scalars['String']['output'];
  howItHelpsLater: Scalars['String']['output'];
  howItHelpsRightNow: Scalars['String']['output'];
  level: Scalars['String']['output'];
  personalizedReasoning: Scalars['String']['output'];
  whatItCouldReveal: Array<Scalars['String']['output']>;
};

export type SessionData = {
  __typename?: 'SessionData';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type SideEffect = {
  __typename?: 'SideEffect';
  effect: Scalars['String']['output'];
  management: Scalars['String']['output'];
  timing: Scalars['String']['output'];
};

export type SkipEventInput = {
  eventId: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};

export type SubmitFeedbackInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  context?: InputMaybe<Scalars['JSON']['input']>;
  feedbackType: Scalars['String']['input'];
  rating?: InputMaybe<Scalars['Int']['input']>;
};

export type SubmitJournalEntryInput = {
  energy: Scalars['Int']['input'];
  entryDate: Scalars['String']['input'];
  exerciseMinutes?: InputMaybe<Scalars['Int']['input']>;
  exerciseType?: InputMaybe<Scalars['String']['input']>;
  hotFlashes?: InputMaybe<Scalars['Int']['input']>;
  jointPain?: InputMaybe<Scalars['Int']['input']>;
  mood: Scalars['Int']['input'];
  newSymptoms?: InputMaybe<Array<Scalars['String']['input']>>;
  notes?: InputMaybe<Scalars['String']['input']>;
  pain: Scalars['Int']['input'];
  sleepQuality: Scalars['Int']['input'];
};

export type SurveillanceEvent = {
  __typename?: 'SurveillanceEvent';
  completedDate?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['String']['output']>;
  frequency?: Maybe<Scalars['String']['output']>;
  guidelineSource?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  nextDueDate?: Maybe<Scalars['String']['output']>;
  patientId: Scalars['String']['output'];
  planId: Scalars['String']['output'];
  resultSummary?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type SurvivorshipFeedback = {
  __typename?: 'SurvivorshipFeedback';
  comment?: Maybe<Scalars['String']['output']>;
  context?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  feedbackType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  patientId: Scalars['String']['output'];
  rating?: Maybe<Scalars['Int']['output']>;
};

export type SurvivorshipPlan = {
  __typename?: 'SurvivorshipPlan';
  completionType: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentPhase: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastGeneratedAt: Scalars['DateTime']['output'];
  nextReviewDate?: Maybe<Scalars['String']['output']>;
  ongoingTherapies: Array<Scalars['String']['output']>;
  patientId: Scalars['String']['output'];
  planContent: Scalars['JSON']['output'];
  riskCategory?: Maybe<Scalars['String']['output']>;
  treatmentCompletionDate: Scalars['String']['output'];
};

export type SymptomExercise = {
  __typename?: 'SymptomExercise';
  evidence: Scalars['String']['output'];
  exerciseType: Scalars['String']['output'];
  symptom: Scalars['String']['output'];
};

export type SymptomRouting = {
  __typename?: 'SymptomRouting';
  immediateAction?: Maybe<Scalars['String']['output']>;
  providerName?: Maybe<Scalars['String']['output']>;
  providerPhone?: Maybe<Scalars['String']['output']>;
  providerRole?: Maybe<Scalars['String']['output']>;
  reasoning: Scalars['String']['output'];
  urgency: Scalars['String']['output'];
};

export type SymptomTrendItem = {
  __typename?: 'SymptomTrendItem';
  average?: Maybe<Scalars['Float']['output']>;
  dimension: Scalars['String']['output'];
  notableChanges?: Maybe<Scalars['String']['output']>;
  trend: Scalars['String']['output'];
};

export type TalkingPoint = {
  __typename?: 'TalkingPoint';
  detail: Scalars['String']['output'];
  point: Scalars['String']['output'];
};

export type TestRecommendation = {
  __typename?: 'TestRecommendation';
  alternatives: Array<TestRecommendationAlternative>;
  generatedAt: Scalars['String']['output'];
  primary: TestRecommendationPrimary;
  reasoning: Scalars['String']['output'];
};

export type TestRecommendationAlternative = {
  __typename?: 'TestRecommendationAlternative';
  geneCount: Scalars['Int']['output'];
  providerId: Scalars['String']['output'];
  providerName: Scalars['String']['output'];
  testName: Scalars['String']['output'];
  tradeoff: Scalars['String']['output'];
};

export type TestRecommendationPrimary = {
  __typename?: 'TestRecommendationPrimary';
  fdaApproved: Scalars['Boolean']['output'];
  geneCount: Scalars['Int']['output'];
  providerId: Scalars['String']['output'];
  providerName: Scalars['String']['output'];
  sampleType: Scalars['String']['output'];
  testName: Scalars['String']['output'];
  testType: Scalars['String']['output'];
  turnaroundDays: Scalars['Int']['output'];
  whyThisTest: Scalars['String']['output'];
};

export type TherapyImplications = {
  __typename?: 'TherapyImplications';
  approvedTherapies: Array<Scalars['String']['output']>;
  clinicalTrials: Array<Scalars['String']['output']>;
  resistanceMutations: Array<Scalars['String']['output']>;
};

export type TimelinePhase = {
  __typename?: 'TimelinePhase';
  description: Scalars['String']['output'];
  duration: Scalars['String']['output'];
  phase: Scalars['String']['output'];
  whatToExpect: Array<Scalars['String']['output']>;
};

export type TmbBiomarker = {
  __typename?: 'TmbBiomarker';
  status: Scalars['String']['output'];
  unit: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export type TreatmentCompletionInput = {
  completionDate: Scalars['String']['input'];
  completionType: Scalars['String']['input'];
  newSymptoms?: InputMaybe<Scalars['String']['input']>;
  ongoingTherapies: Array<Scalars['String']['input']>;
  wantsReminders: Scalars['Boolean']['input'];
};

export type TreatmentTranslation = {
  __typename?: 'TreatmentTranslation';
  additionalConsiderations?: Maybe<Scalars['JSON']['output']>;
  diagnosis: Scalars['JSON']['output'];
  generatedAt: Scalars['String']['output'];
  questionsForDoctor: Array<DoctorQuestion>;
  secondOpinionTriggers: Array<SecondOpinionTrigger>;
  timeline: Scalars['JSON']['output'];
  treatmentPlan: Scalars['JSON']['output'];
};

export type Trial = {
  __typename?: 'Trial';
  briefSummary?: Maybe<Scalars['String']['output']>;
  conditions: Array<Scalars['String']['output']>;
  eligibilityCriteria?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  interventions: Array<Scalars['String']['output']>;
  lastUpdated?: Maybe<Scalars['String']['output']>;
  locations?: Maybe<Scalars['JSON']['output']>;
  nctId: Scalars['String']['output'];
  parsedEligibility?: Maybe<Scalars['JSON']['output']>;
  phase?: Maybe<Scalars['String']['output']>;
  sponsor?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type UpdateCareTeamMemberInput = {
  contactFor?: InputMaybe<Array<Scalars['String']['input']>>;
  memberId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  practice?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateNotificationPreferenceInput = {
  appointmentPrep?: InputMaybe<Scalars['Boolean']['input']>;
  ctdnaResults?: InputMaybe<Scalars['Boolean']['input']>;
  journalReminders?: InputMaybe<Scalars['Boolean']['input']>;
  lifestyleCheckIn?: InputMaybe<Scalars['Boolean']['input']>;
  phaseTransitions?: InputMaybe<Scalars['Boolean']['input']>;
  quietHoursEnd?: InputMaybe<Scalars['String']['input']>;
  quietHoursStart?: InputMaybe<Scalars['String']['input']>;
  scpAnnualReview?: InputMaybe<Scalars['Boolean']['input']>;
  surveillanceReminders?: InputMaybe<Scalars['Boolean']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  weeklySummary?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UploadEventResultInput = {
  documentId: Scalars['String']['input'];
  eventId: Scalars['String']['input'];
};

export type UploadUrl = {
  __typename?: 'UploadUrl';
  s3Key: Scalars['String']['output'];
  uploadUrl: Scalars['String']['output'];
};

export type UploadUrlResult = {
  __typename?: 'UploadUrlResult';
  bucket?: Maybe<Scalars['String']['output']>;
  expiresAt?: Maybe<Scalars['String']['output']>;
  s3Key: Scalars['String']['output'];
  uploadUrl: Scalars['String']['output'];
};

export type WaitingContent = {
  __typename?: 'WaitingContent';
  cancerType: Scalars['String']['output'];
  clinicalTrialContext: Scalars['String']['output'];
  commonMutations: Array<CommonMutation>;
  generatedAt: Scalars['String']['output'];
  timelineExpectations: Scalars['String']['output'];
  whatMutationsMean: Scalars['String']['output'];
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'SessionData', userId: string, email: string, createdAt: string, expiresAt: string } | null };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type RequestMagicLinkMutationVariables = Exact<{
  email: Scalars['String']['input'];
  redirect?: InputMaybe<Scalars['String']['input']>;
}>;


export type RequestMagicLinkMutation = { __typename?: 'Mutation', requestMagicLink: boolean };

export type GetDocumentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDocumentsQuery = { __typename?: 'Query', documents: Array<{ __typename?: 'Document', id: string, patientId: string, type: string, filename: string, s3Key?: string | null, status: string, extraction?: Record<string, unknown> | null, createdAt: string }> };

export type RequestUploadUrlMutationVariables = Exact<{
  filename: Scalars['String']['input'];
  contentType: Scalars['String']['input'];
}>;


export type RequestUploadUrlMutation = { __typename?: 'Mutation', requestUploadUrl: { __typename?: 'UploadUrl', uploadUrl: string, s3Key: string } };

export type ExtractDocumentMutationVariables = Exact<{
  documentId: Scalars['String']['input'];
}>;


export type ExtractDocumentMutation = { __typename?: 'Mutation', extractDocument: { __typename?: 'Document', id: string, status: string, extraction?: Record<string, unknown> | null } };

export type GetHealthSystemsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetHealthSystemsQuery = { __typename?: 'Query', healthSystems: Array<{ __typename?: 'HealthSystem', id: string, name: string, fhirBaseUrl: string, brand?: string | null, city?: string | null, state?: string | null, ehrVendor: string, isCancerCenter: boolean }> };

export type GetFhirConnectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFhirConnectionsQuery = { __typename?: 'Query', fhirConnections: Array<{ __typename?: 'FhirConnection', id: string, healthSystemName?: string | null, syncStatus?: string | null, lastSyncedAt?: string | null, scopesGranted?: Array<string> | null, resourcesPulled?: Record<string, unknown> | null }> };

export type AuthorizeFhirMutationVariables = Exact<{
  healthSystemId: Scalars['String']['input'];
}>;


export type AuthorizeFhirMutation = { __typename?: 'Mutation', authorizeFhir: { __typename?: 'FhirAuthorizeResult', authorizeUrl: string } };

export type ExtractFhirMutationVariables = Exact<{
  connectionId: Scalars['String']['input'];
}>;


export type ExtractFhirMutation = { __typename?: 'Mutation', extractFhir: Record<string, unknown> };

export type RevokeFhirConnectionMutationVariables = Exact<{
  connectionId: Scalars['String']['input'];
}>;


export type RevokeFhirConnectionMutation = { __typename?: 'Mutation', revokeFhirConnection: boolean };

export type ResyncFhirConnectionMutationVariables = Exact<{
  connectionId: Scalars['String']['input'];
}>;


export type ResyncFhirConnectionMutation = { __typename?: 'Mutation', resyncFhirConnection: Record<string, unknown> };

export type GetFinancialProgramsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFinancialProgramsQuery = { __typename?: 'Query', financialPrograms: Array<{ __typename?: 'FinancialProgram', id: string, name: string, organization: string, type: string, description?: string | null, website: string, applicationUrl?: string | null, maxBenefitAmount?: number | null, benefitDescription?: string | null, assistanceCategories: Array<string> }> };

export type GetFinancialMatchesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFinancialMatchesQuery = { __typename?: 'Query', financialMatches: Array<{ __typename?: 'FinancialMatch', programId: string, programName: string, organization: string, type: string, matchStatus: string, estimatedBenefit?: string | null, matchReasoning: string, missingInfo: Array<string>, maxBenefitAmount?: number | null, applicationUrl?: string | null, website: string, assistanceCategories: Array<string> }> };

export type GetFinancialProgramQueryVariables = Exact<{
  programId: Scalars['String']['input'];
}>;


export type GetFinancialProgramQuery = { __typename?: 'Query', financialProgram?: { __typename?: 'FinancialProgram', id: string, name: string, organization: string, type: string, description?: string | null, website: string, applicationUrl?: string | null, maxBenefitAmount?: number | null, benefitDescription?: string | null, assistanceCategories: Array<string> } | null };

export type MatchFinancialProgramsMutationVariables = Exact<{
  input: FinancialProfileInput;
}>;


export type MatchFinancialProgramsMutation = { __typename?: 'Mutation', matchFinancialPrograms: Array<{ __typename?: 'FinancialMatch', programId: string, programName: string, organization: string, type: string, matchStatus: string, estimatedBenefit?: string | null, matchReasoning: string, missingInfo: Array<string>, maxBenefitAmount?: number | null, applicationUrl?: string | null, website: string, assistanceCategories: Array<string> }> };

export type SubscribeFinancialProgramMutationVariables = Exact<{
  programId: Scalars['String']['input'];
}>;


export type SubscribeFinancialProgramMutation = { __typename?: 'Mutation', subscribeFinancialProgram: boolean };

export type GetGenomicResultsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGenomicResultsQuery = { __typename?: 'Query', genomicResults: Array<{ __typename?: 'GenomicResult', id: string, patientId: string, provider: string, testName: string, reportDate?: string | null, interpretation?: Record<string, unknown> | null, createdAt: string, alterations: Array<{ __typename?: 'GenomicAlteration', gene: string, alteration: string, alterationType: string, variantAlleleFrequency?: number | null, clinicalSignificance: string, confidence: number, therapyImplications: { __typename?: 'TherapyImplications', approvedTherapies: Array<string>, clinicalTrials: Array<string>, resistanceMutations: Array<string> } }>, biomarkers?: { __typename?: 'GenomicBiomarkers', tmb?: { __typename?: 'TmbBiomarker', value: number, unit: string, status: string } | null, msi?: { __typename?: 'MsiBiomarker', status: string, score?: number | null } | null, pdl1?: { __typename?: 'Pdl1Biomarker', tps?: number | null, cps?: number | null } | null, loh?: { __typename?: 'LohBiomarker', status: string } | null, hrd?: { __typename?: 'HrdBiomarker', score?: number | null, status: string } | null } | null }> };

export type GetGenomicResultQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetGenomicResultQuery = { __typename?: 'Query', genomicResult?: { __typename?: 'GenomicResult', id: string, patientId: string, provider: string, testName: string, reportDate?: string | null, interpretation?: Record<string, unknown> | null, createdAt: string, alterations: Array<{ __typename?: 'GenomicAlteration', gene: string, alteration: string, alterationType: string, variantAlleleFrequency?: number | null, clinicalSignificance: string, confidence: number, therapyImplications: { __typename?: 'TherapyImplications', approvedTherapies: Array<string>, clinicalTrials: Array<string>, resistanceMutations: Array<string> } }>, biomarkers?: { __typename?: 'GenomicBiomarkers', tmb?: { __typename?: 'TmbBiomarker', value: number, unit: string, status: string } | null, msi?: { __typename?: 'MsiBiomarker', status: string, score?: number | null } | null, pdl1?: { __typename?: 'Pdl1Biomarker', tps?: number | null, cps?: number | null } | null, loh?: { __typename?: 'LohBiomarker', status: string } | null, hrd?: { __typename?: 'HrdBiomarker', score?: number | null, status: string } | null } | null } | null };

export type GetMatchDeltaQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMatchDeltaQuery = { __typename?: 'Query', matchDelta?: { __typename?: 'MatchDelta', totalBefore: number, totalAfter: number, newMatches: Array<{ __typename?: 'MatchDeltaEntry', trialId: string, nctId: string, title: string, oldScore?: number | null, newScore?: number | null, genomicBasis?: string | null, reason?: string | null }>, improvedMatches: Array<{ __typename?: 'MatchDeltaEntry', trialId: string, nctId: string, title: string, oldScore?: number | null, newScore?: number | null, genomicBasis?: string | null, reason?: string | null }>, removedMatches: Array<{ __typename?: 'MatchDeltaEntry', trialId: string, nctId: string, title: string, oldScore?: number | null, newScore?: number | null, genomicBasis?: string | null, reason?: string | null }> } | null };

export type ExtractGenomicReportMutationVariables = Exact<{
  documentId: Scalars['String']['input'];
}>;


export type ExtractGenomicReportMutation = { __typename?: 'Mutation', extractGenomicReport: { __typename?: 'GenomicResult', id: string, provider: string, testName: string, alterations: Array<{ __typename?: 'GenomicAlteration', gene: string, alteration: string, alterationType: string, clinicalSignificance: string }>, biomarkers?: { __typename?: 'GenomicBiomarkers', tmb?: { __typename?: 'TmbBiomarker', value: number, unit: string, status: string } | null, msi?: { __typename?: 'MsiBiomarker', status: string, score?: number | null } | null } | null } };

export type InterpretGenomicsMutationVariables = Exact<{ [key: string]: never; }>;


export type InterpretGenomicsMutation = { __typename?: 'Mutation', interpretGenomics: { __typename?: 'GenomicInterpretation', summary: string, mutations: Record<string, unknown>, biomarkerProfile: Record<string, unknown>, generatedAt: string, questionsForOncologist: Array<{ __typename?: 'DoctorQuestion', question: string, whyItMatters: string }> } };

export type ConfirmGenomicsMutationVariables = Exact<{
  genomicResultId: Scalars['String']['input'];
  edits?: InputMaybe<Scalars['JSON']['input']>;
}>;


export type ConfirmGenomicsMutation = { __typename?: 'Mutation', confirmGenomics: { __typename?: 'GenomicResult', id: string, patientId: string, provider: string, testName: string, alterations: Array<{ __typename?: 'GenomicAlteration', gene: string, alteration: string, alterationType: string, clinicalSignificance: string }> } };

export type RematchMutationVariables = Exact<{ [key: string]: never; }>;


export type RematchMutation = { __typename?: 'Mutation', rematch: { __typename?: 'MatchDelta', totalBefore: number, totalAfter: number, newMatches: Array<{ __typename?: 'MatchDeltaEntry', trialId: string, nctId: string, title: string, newScore?: number | null, genomicBasis?: string | null }>, improvedMatches: Array<{ __typename?: 'MatchDeltaEntry', trialId: string, nctId: string, title: string, oldScore?: number | null, newScore?: number | null, genomicBasis?: string | null }>, removedMatches: Array<{ __typename?: 'MatchDeltaEntry', trialId: string, nctId: string, title: string, oldScore?: number | null, reason?: string | null }> } };

export type GetManufacturingPartnersQueryVariables = Exact<{
  type?: InputMaybe<Scalars['String']['input']>;
  capability?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetManufacturingPartnersQuery = { __typename?: 'Query', manufacturingPartners: Array<{ __typename?: 'ManufacturingPartner', id: string, name: string, slug: string, type: string, capabilities: Array<string>, certifications: Array<string>, capacityTier: string, costRangeMin?: number | null, costRangeMax?: number | null, turnaroundWeeksMin?: number | null, turnaroundWeeksMax?: number | null, country: string, regulatorySupport: Array<string>, description?: string | null, contactUrl?: string | null, status: string }> };

export type GetManufacturingPartnerQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetManufacturingPartnerQuery = { __typename?: 'Query', manufacturingPartner?: { __typename?: 'ManufacturingPartner', id: string, name: string, slug: string, type: string, capabilities: Array<string>, certifications: Array<string>, capacityTier: string, costRangeMin?: number | null, costRangeMax?: number | null, turnaroundWeeksMin?: number | null, turnaroundWeeksMax?: number | null, country: string, regulatorySupport: Array<string>, description?: string | null, contactUrl?: string | null, status: string } | null };

export type GetManufacturingOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetManufacturingOrdersQuery = { __typename?: 'Query', manufacturingOrders: Array<{ __typename?: 'ManufacturingOrder', id: string, patientId: string, partnerId: string, pipelineJobId: string, status: string, quotePrice?: number | null, quoteCurrency?: string | null, quoteTurnaroundWeeks?: number | null, totalCost?: number | null, batchNumber?: string | null, trackingNumber?: string | null, partnerName?: string | null, message?: string | null, administeredAt?: string | null, createdAt: string, updatedAt: string }> };

export type GetManufacturingOrderQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetManufacturingOrderQuery = { __typename?: 'Query', manufacturingOrder?: { __typename?: 'ManufacturingOrder', id: string, patientId: string, partnerId: string, pipelineJobId: string, status: string, quotePrice?: number | null, quoteCurrency?: string | null, quoteTurnaroundWeeks?: number | null, totalCost?: number | null, batchNumber?: string | null, trackingNumber?: string | null, partnerName?: string | null, message?: string | null, quoteExpiresAt?: string | null, productionStartedAt?: string | null, productionEstimatedCompletion?: string | null, qcStartedAt?: string | null, qcCompletedAt?: string | null, qcPassed?: boolean | null, qcNotes?: string | null, shippedAt?: string | null, shippingCarrier?: string | null, shippingConditions?: string | null, deliveredAt?: string | null, administeredAt?: string | null, administeredBy?: string | null, paymentStatus?: string | null, assessmentId?: string | null, administrationSiteId?: string | null, notes?: Record<string, unknown> | null, createdAt: string, updatedAt: string, partner?: { __typename?: 'ManufacturingPartner', id: string, name: string, slug: string, type: string, contactUrl?: string | null } | null, administrationSite?: { __typename?: 'AdministrationSite', id: string, name: string, city?: string | null, state?: string | null } | null, assessment?: { __typename?: 'RegulatoryPathwayAssessment', id: string, recommended: string, rationale: string } | null, reports: Array<{ __typename?: 'MonitoringReport', id: string, reportType: string, daysPostAdministration: number, hasAdverseEvents: boolean, status: string, createdAt: string }> } | null };

export type GetRecommendedPartnersQueryVariables = Exact<{
  pipelineJobId: Scalars['String']['input'];
}>;


export type GetRecommendedPartnersQuery = { __typename?: 'Query', recommendedPartners: Array<{ __typename?: 'PartnerRecommendation', partnerId: string, name: string, slug: string, type: string, score: number, reasons: Array<string>, costRangeMin?: number | null, costRangeMax?: number | null, turnaroundWeeksMin?: number | null, turnaroundWeeksMax?: number | null, capabilities: Array<string>, certifications: Array<string> }> };

export type GetRegulatoryAssessmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRegulatoryAssessmentsQuery = { __typename?: 'Query', regulatoryAssessments: Array<{ __typename?: 'RegulatoryPathwayAssessment', id: string, patientId: string, recommended: string, rationale: string, alternatives?: Record<string, unknown> | null, requiredDocuments: Array<string>, estimatedCostMin: number, estimatedCostMax: number, estimatedTimelineWeeks: number, createdAt: string }> };

export type GetRegulatoryAssessmentQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetRegulatoryAssessmentQuery = { __typename?: 'Query', regulatoryAssessment?: { __typename?: 'RegulatoryPathwayAssessment', id: string, patientId: string, recommended: string, rationale: string, alternatives?: Record<string, unknown> | null, requiredDocuments: Array<string>, estimatedCostMin: number, estimatedCostMax: number, estimatedTimelineWeeks: number, createdAt: string } | null };

export type GetRegulatoryDocumentsQueryVariables = Exact<{
  assessmentId: Scalars['String']['input'];
}>;


export type GetRegulatoryDocumentsQuery = { __typename?: 'Query', regulatoryDocuments: Array<{ __typename?: 'RegulatoryDocument', id: string, assessmentId: string, documentType: string, content: string, status: string, reviewNotes?: string | null, reviewedAt?: string | null, reviewedBy?: string | null, createdAt: string }> };

export type GetRegulatoryDocumentQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetRegulatoryDocumentQuery = { __typename?: 'Query', regulatoryDocument?: { __typename?: 'RegulatoryDocument', id: string, assessmentId: string, documentType: string, content: string, status: string, reviewNotes?: string | null, reviewedAt?: string | null, reviewedBy?: string | null, createdAt: string } | null };

export type CreateManufacturingOrderMutationVariables = Exact<{
  partnerId: Scalars['String']['input'];
  pipelineJobId: Scalars['String']['input'];
}>;


export type CreateManufacturingOrderMutation = { __typename?: 'Mutation', createManufacturingOrder: { __typename?: 'ManufacturingOrder', id: string, status: string, createdAt: string } };

export type UpdateManufacturingOrderStatusMutationVariables = Exact<{
  orderId: Scalars['String']['input'];
  status: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateManufacturingOrderStatusMutation = { __typename?: 'Mutation', updateManufacturingOrderStatus: { __typename?: 'ManufacturingOrder', id: string, status: string, updatedAt: string } };

export type AcceptQuoteMutationVariables = Exact<{
  orderId: Scalars['String']['input'];
}>;


export type AcceptQuoteMutation = { __typename?: 'Mutation', acceptQuote: { __typename?: 'ManufacturingOrder', id: string, status: string, updatedAt: string } };

export type ConnectSiteMutationVariables = Exact<{
  orderId: Scalars['String']['input'];
  siteId: Scalars['String']['input'];
}>;


export type ConnectSiteMutation = { __typename?: 'Mutation', connectSite: { __typename?: 'ManufacturingOrder', id: string, status: string, updatedAt: string } };

export type AddOrderNoteMutationVariables = Exact<{
  orderId: Scalars['String']['input'];
  note: Scalars['String']['input'];
}>;


export type AddOrderNoteMutation = { __typename?: 'Mutation', addOrderNote: { __typename?: 'ManufacturingOrder', id: string, updatedAt: string } };

export type AssessRegulatoryPathwayMutationVariables = Exact<{
  input: PathwayAssessmentInput;
}>;


export type AssessRegulatoryPathwayMutation = { __typename?: 'Mutation', assessRegulatoryPathway: { __typename?: 'RegulatoryPathwayAssessment', id: string, recommended: string, rationale: string, alternatives?: Record<string, unknown> | null, requiredDocuments: Array<string>, estimatedCostMin: number, estimatedCostMax: number, estimatedTimelineWeeks: number } };

export type GenerateRegulatoryDocumentMutationVariables = Exact<{
  assessmentId: Scalars['String']['input'];
  documentType: Scalars['String']['input'];
}>;


export type GenerateRegulatoryDocumentMutation = { __typename?: 'Mutation', generateRegulatoryDocument: { __typename?: 'RegulatoryDocument', id: string, documentType: string, content: string, status: string } };

export type UpdateRegulatoryDocumentStatusMutationVariables = Exact<{
  id: Scalars['String']['input'];
  status: Scalars['String']['input'];
  reviewNotes?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateRegulatoryDocumentStatusMutation = { __typename?: 'Mutation', updateRegulatoryDocumentStatus: { __typename?: 'RegulatoryDocument', id: string, status: string, reviewNotes?: string | null, reviewedAt?: string | null } };

export type GetMatchesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMatchesQuery = { __typename?: 'Query', matches: Array<{ __typename?: 'Match', id: string, patientId: string, trialId: string, matchScore: number, potentialBlockers: Array<string>, status: string, createdAt: string, matchBreakdown: Array<{ __typename?: 'MatchBreakdownItem', category: string, score: number, weight: number, status: string, reason: string }>, llmAssessment?: { __typename?: 'LLMAssessment', overallAssessment: string, reasoning: string, potentialBlockers: Array<string>, missingInfo: Array<string>, actionItems: Array<string> } | null, trial?: { __typename?: 'Trial', id: string, nctId: string, title: string, phase?: string | null, status?: string | null, sponsor?: string | null, briefSummary?: string | null } | null }> };

export type GetMatchQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetMatchQuery = { __typename?: 'Query', match?: { __typename?: 'Match', id: string, patientId: string, trialId: string, matchScore: number, potentialBlockers: Array<string>, status: string, createdAt: string, matchBreakdown: Array<{ __typename?: 'MatchBreakdownItem', category: string, score: number, weight: number, status: string, reason: string }>, llmAssessment?: { __typename?: 'LLMAssessment', overallAssessment: string, reasoning: string, potentialBlockers: Array<string>, missingInfo: Array<string>, actionItems: Array<string> } | null, trial?: { __typename?: 'Trial', id: string, nctId: string, title: string, phase?: string | null, status?: string | null, conditions: Array<string>, interventions: Array<string>, sponsor?: string | null, locations?: Record<string, unknown> | null, eligibilityCriteria?: string | null, parsedEligibility?: Record<string, unknown> | null, briefSummary?: string | null } | null } | null };

export type GetOncologistBriefQueryVariables = Exact<{
  matchId: Scalars['String']['input'];
}>;


export type GetOncologistBriefQuery = { __typename?: 'Query', oncologistBrief: { __typename?: 'OncologistBrief', content: string, matchId: string, generatedAt: string } };

export type GenerateMatchesMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateMatchesMutation = { __typename?: 'Mutation', generateMatches: Array<{ __typename?: 'Match', id: string, matchScore: number, status: string, trial?: { __typename?: 'Trial', id: string, nctId: string, title: string, phase?: string | null } | null }> };

export type UpdateMatchStatusMutationVariables = Exact<{
  matchId: Scalars['String']['input'];
  status: Scalars['String']['input'];
}>;


export type UpdateMatchStatusMutation = { __typename?: 'Mutation', updateMatchStatus: { __typename?: 'Match', id: string, status: string } };

export type TranslateTreatmentMutationVariables = Exact<{
  matchId: Scalars['String']['input'];
}>;


export type TranslateTreatmentMutation = { __typename?: 'Mutation', translateTreatment: { __typename?: 'TreatmentTranslation', diagnosis: Record<string, unknown>, treatmentPlan: Record<string, unknown>, timeline: Record<string, unknown>, additionalConsiderations?: Record<string, unknown> | null, generatedAt: string, questionsForDoctor: Array<{ __typename?: 'DoctorQuestion', question: string, whyItMatters: string }>, secondOpinionTriggers: Array<{ __typename?: 'SecondOpinionTrigger', reason: string, level: string }> } };

export type GetAdministrationSitesQueryVariables = Exact<{
  lat?: InputMaybe<Scalars['Float']['input']>;
  lng?: InputMaybe<Scalars['Float']['input']>;
  radiusMiles?: InputMaybe<Scalars['Float']['input']>;
}>;


export type GetAdministrationSitesQuery = { __typename?: 'Query', administrationSites: Array<{ __typename?: 'AdministrationSite', id: string, name: string, type: string, city?: string | null, state?: string | null, distance?: number | null, canAdministerMrna: boolean, hasInfusionCenter: boolean, hasEmergencyResponse: boolean, hasMonitoringCapacity: boolean, investigationalExp: boolean, irbAffiliation?: string | null, verified: boolean, contactPhone?: string | null, website?: string | null }> };

export type GetAdministrationSiteQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetAdministrationSiteQuery = { __typename?: 'Query', administrationSite?: { __typename?: 'AdministrationSite', id: string, name: string, type: string, city?: string | null, state?: string | null, address?: string | null, zip?: string | null, country?: string | null, lat?: number | null, lng?: number | null, canAdministerMrna: boolean, hasInfusionCenter: boolean, hasEmergencyResponse: boolean, hasMonitoringCapacity: boolean, investigationalExp: boolean, irbAffiliation?: string | null, verified: boolean, contactName?: string | null, contactEmail?: string | null, contactPhone?: string | null, willingToAdminister?: boolean | null, website?: string | null } | null };

export type GetMonitoringReportsQueryVariables = Exact<{
  orderId: Scalars['String']['input'];
}>;


export type GetMonitoringReportsQuery = { __typename?: 'Query', monitoringReports: Array<{ __typename?: 'MonitoringReport', id: string, orderId: string, reportType: string, daysPostAdministration: number, hasAdverseEvents: boolean, temperature?: number | null, bloodPressure?: string | null, heartRate?: number | null, qualityOfLifeScore?: number | null, tumorResponse?: string | null, narrative?: string | null, status: string, createdAt: string, adverseEvents?: Array<{ __typename?: 'AdverseEvent', event: string, severity: string, onset: string, duration?: string | null, resolved: boolean, treatment?: string | null }> | null }> };

export type GetMonitoringScheduleQueryVariables = Exact<{
  orderId: Scalars['String']['input'];
}>;


export type GetMonitoringScheduleQuery = { __typename?: 'Query', monitoringSchedule: Array<{ __typename?: 'MonitoringScheduleEntry', reportType: string, daysAfter: number, required: boolean, description: string, dueDate?: string | null, status: string, submittedAt?: string | null }> };

export type SubmitMonitoringReportMutationVariables = Exact<{
  input: MonitoringReportInput;
}>;


export type SubmitMonitoringReportMutation = { __typename?: 'Mutation', submitMonitoringReport: { __typename?: 'MonitoringReport', id: string, orderId: string, reportType: string, daysPostAdministration: number, hasAdverseEvents: boolean, status: string, createdAt: string } };

export type GetPatientQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPatientQuery = { __typename?: 'Query', patient?: { __typename?: 'Patient', id: string, email: string, name?: string | null, intakeMethod?: string | null, createdAt: string, updatedAt: string, profile?: { __typename?: 'PatientProfile', cancerType?: string | null, cancerTypeNormalized?: string | null, stage?: string | null, histologicalGrade?: string | null, biomarkers?: Record<string, unknown> | null, ecogStatus?: number | null, age?: number | null, zipCode?: string | null, receptorStatus?: { __typename?: 'ReceptorStatus', er?: { __typename?: 'ReceptorDetail', status: string, percentage?: number | null, method?: string | null } | null, pr?: { __typename?: 'ReceptorDetail', status: string, percentage?: number | null, method?: string | null } | null, her2?: { __typename?: 'ReceptorDetail', status: string, percentage?: number | null, method?: string | null } | null } | null, priorTreatments?: Array<{ __typename?: 'PriorTreatment', name: string, type: string, startDate?: string | null, endDate?: string | null, response?: string | null }> | null, genomicData?: { __typename?: 'GenomicData', testProvider: string, testName: string, testDate?: string | null, alterations: Array<{ __typename?: 'GenomicAlteration', gene: string, alteration: string, alterationType: string, variantAlleleFrequency?: number | null, clinicalSignificance: string, confidence: number, therapyImplications: { __typename?: 'TherapyImplications', approvedTherapies: Array<string>, clinicalTrials: Array<string>, resistanceMutations: Array<string> } }>, biomarkers: { __typename?: 'GenomicBiomarkers', tmb?: { __typename?: 'TmbBiomarker', value: number, unit: string, status: string } | null, msi?: { __typename?: 'MsiBiomarker', status: string, score?: number | null } | null, pdl1?: { __typename?: 'Pdl1Biomarker', tps?: number | null, cps?: number | null } | null, loh?: { __typename?: 'LohBiomarker', status: string } | null, hrd?: { __typename?: 'HrdBiomarker', score?: number | null, status: string } | null }, germlineFindings?: Array<{ __typename?: 'GermlineFinding', gene: string, variant: string, significance: string }> | null } | null } | null } | null };

export type GetPatientProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPatientProfileQuery = { __typename?: 'Query', patientProfile?: { __typename?: 'PatientProfile', cancerType?: string | null, cancerTypeNormalized?: string | null, stage?: string | null, histologicalGrade?: string | null, ecogStatus?: number | null, age?: number | null, zipCode?: string | null } | null };

export type UpdateProfileMutationVariables = Exact<{
  input: PatientProfileInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updatePatientProfile: { __typename?: 'Patient', id: string, profile?: { __typename?: 'PatientProfile', cancerType?: string | null, stage?: string | null, histologicalGrade?: string | null, ecogStatus?: number | null, age?: number | null, zipCode?: string | null } | null } };

export type CreatePatientManualMutationVariables = Exact<{
  input: ManualIntakeInput;
}>;


export type CreatePatientManualMutation = { __typename?: 'Mutation', createPatientManual: { __typename?: 'Patient', id: string, name?: string | null, intakeMethod?: string | null, profile?: { __typename?: 'PatientProfile', cancerType?: string | null, stage?: string | null, age?: number | null, zipCode?: string | null } | null } };

export type SavePatientIntakeMutationVariables = Exact<{
  input: PatientIntakeInput;
}>;


export type SavePatientIntakeMutation = { __typename?: 'Mutation', savePatientIntake: { __typename?: 'Patient', id: string, intakeMethod?: string | null, profile?: { __typename?: 'PatientProfile', cancerType?: string | null, stage?: string | null } | null } };

export type ExtractDocumentsMutationVariables = Exact<{
  s3Keys: Array<Scalars['String']['input']> | Scalars['String']['input'];
  mimeTypes: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type ExtractDocumentsMutation = { __typename?: 'Mutation', extractDocuments: { __typename?: 'ExtractionResult', status: string, profile?: Record<string, unknown> | null, fieldSources?: Record<string, unknown> | null, fieldConfidence?: Record<string, unknown> | null, extractions?: Record<string, unknown> | null, claudeApiCost?: number | null, error?: string | null } };

export type GetPipelineJobsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPipelineJobsQuery = { __typename?: 'Query', pipelineJobs: Array<{ __typename?: 'PipelineJob', id: string, patientId: string, status: string, currentStep?: string | null, stepsCompleted: Array<string>, inputFormat: string, referenceGenome: string, startedAt?: string | null, completedAt?: string | null, estimatedCompletion?: string | null, variantCount?: number | null, tmb?: number | null, neoantigenCount?: number | null, createdAt: string }> };

export type GetPipelineJobQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetPipelineJobQuery = { __typename?: 'Query', pipelineJob?: { __typename?: 'PipelineJob', id: string, patientId: string, status: string, currentStep?: string | null, stepsCompleted: Array<string>, inputFormat: string, referenceGenome: string, startedAt?: string | null, completedAt?: string | null, estimatedCompletion?: string | null, variantCount?: number | null, tmb?: number | null, hlaGenotype?: Record<string, unknown> | null, neoantigenCount?: number | null, topNeoantigens?: Record<string, unknown> | null, vaccineBlueprint?: Record<string, unknown> | null, stepErrors?: Record<string, unknown> | null, totalComputeSeconds?: number | null, estimatedCostUsd?: number | null, createdAt: string } | null };

export type GetNeoantigensQueryVariables = Exact<{
  pipelineJobId: Scalars['String']['input'];
  sort?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['String']['input']>;
  confidence?: InputMaybe<Scalars['String']['input']>;
  gene?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetNeoantigensQuery = { __typename?: 'Query', neoantigens: { __typename?: 'NeoantigenPage', total: number, page: number, totalPages: number, neoantigens: Array<{ __typename?: 'NeoantigenCandidate', id: string, jobId: string, gene: string, mutation: string, mutantPeptide: string, wildtypePeptide?: string | null, hlaAllele: string, bindingAffinityNm: number, immunogenicityScore: number, compositeScore: number, rank: number, vaf?: number | null, clonality?: string | null, confidence: string }> } };

export type GetPipelineResultsQueryVariables = Exact<{
  pipelineJobId: Scalars['String']['input'];
}>;


export type GetPipelineResultsQuery = { __typename?: 'Query', pipelineResults: { __typename?: 'PipelineResultDownloads', jobId: string, patientSummary?: string | null, fullReportPdf?: string | null, vaccineBlueprint?: string | null, neoantigenReport?: string | null } };

export type GetReportPdfQueryVariables = Exact<{
  pipelineJobId: Scalars['String']['input'];
  reportType: Scalars['String']['input'];
}>;


export type GetReportPdfQuery = { __typename?: 'Query', reportPdf: { __typename?: 'ReportPdfResult', url: string, cached: boolean } };

export type GetNeoantigenTrialsQueryVariables = Exact<{
  pipelineJobId: Scalars['String']['input'];
}>;


export type GetNeoantigenTrialsQuery = { __typename?: 'Query', neoantigenTrials: Array<{ __typename?: 'NeoantigenTrialMatch', trialId: string, nctId: string, title: string, phase?: string | null, relevanceScore: number, relevanceExplanation: string, matchedNeoantigens: Array<string> }> };

export type SubmitPipelineJobMutationVariables = Exact<{
  tumorDataPath: Scalars['String']['input'];
  normalDataPath: Scalars['String']['input'];
  rnaDataPath?: InputMaybe<Scalars['String']['input']>;
  inputFormat: Scalars['String']['input'];
  referenceGenome: Scalars['String']['input'];
}>;


export type SubmitPipelineJobMutation = { __typename?: 'Mutation', submitPipelineJob: { __typename?: 'PipelineJob', id: string, status: string, createdAt: string } };

export type CancelPipelineJobMutationVariables = Exact<{
  jobId: Scalars['String']['input'];
}>;


export type CancelPipelineJobMutation = { __typename?: 'Mutation', cancelPipelineJob: { __typename?: 'PipelineJob', id: string, status: string } };

export type GenerateReportPdfMutationVariables = Exact<{
  pipelineJobId: Scalars['String']['input'];
  reportType: Scalars['String']['input'];
}>;


export type GenerateReportPdfMutation = { __typename?: 'Mutation', generateReportPdf: { __typename?: 'ReportPdfResult', url: string, cached: boolean } };

export type GenerateReportQueryVariables = Exact<{
  pipelineJobId: Scalars['String']['input'];
  reportType: Scalars['String']['input'];
}>;


export type GenerateReportQuery = { __typename?: 'Query', generateReport?: Record<string, unknown> | null };

export type GetProvidersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProvidersQuery = { __typename?: 'Query', sequencingProviders: Array<{ __typename?: 'SequencingProvider', id: string, name: string, type: string, slug: string, website?: string | null, testNames: Array<string>, geneCount: number, sampleTypes: Array<string>, turnaroundDaysMin: number, turnaroundDaysMax: number, costRangeMin: number, costRangeMax: number, fdaApproved: boolean, orderingProcess?: string | null, reportFormat?: string | null }> };

export type GetSequencingOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSequencingOrdersQuery = { __typename?: 'Query', sequencingOrders: Array<{ __typename?: 'SequencingOrder', id: string, patientId: string, providerId: string, testType: string, status: string, createdAt: string, provider?: { __typename?: 'SequencingProvider', id: string, name: string, slug: string } | null }> };

export type GetSequencingOrderQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetSequencingOrderQuery = { __typename?: 'Query', sequencingOrder?: { __typename?: 'SequencingOrder', id: string, patientId: string, providerId: string, testType: string, status: string, insuranceCoverage?: Record<string, unknown> | null, lomnContent?: string | null, createdAt: string, updatedAt?: string | null, provider?: { __typename?: 'SequencingProvider', id: string, name: string, slug: string, type: string } | null } | null };

export type GetSequencingRecommendationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSequencingRecommendationQuery = { __typename?: 'Query', sequencingRecommendation: { __typename?: 'SequencingRecommendation', level: string, headline: string, personalizedReasoning: string, whatItCouldReveal: Array<string>, howItHelpsRightNow: string, howItHelpsLater: string, guidelineRecommendation: string, generatedAt: string } };

export type GetSequencingExplanationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSequencingExplanationQuery = { __typename?: 'Query', sequencingExplanation: { __typename?: 'SequencingExplanation', whatIsIt: string, howItWorks: string, whatItFinds: string, personalRelevance: string, generatedAt: string, commonConcerns: Array<{ __typename?: 'CommonConcern', concern: string, answer: string }> } };

export type GetTestRecommendationQueryVariables = Exact<{
  tissueAvailable?: InputMaybe<Scalars['Boolean']['input']>;
  preferComprehensive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetTestRecommendationQuery = { __typename?: 'Query', testRecommendation: { __typename?: 'TestRecommendation', reasoning: string, generatedAt: string, primary: { __typename?: 'TestRecommendationPrimary', providerId: string, providerName: string, testName: string, testType: string, geneCount: number, whyThisTest: string, sampleType: string, turnaroundDays: number, fdaApproved: boolean }, alternatives: Array<{ __typename?: 'TestRecommendationAlternative', providerId: string, providerName: string, testName: string, geneCount: number, tradeoff: string }> } };

export type GetConversationGuideQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConversationGuideQuery = { __typename?: 'Query', conversationGuide: { __typename?: 'ConversationGuide', emailTemplate: string, orderingInstructions: string, generatedAt: string, talkingPoints: Array<{ __typename?: 'TalkingPoint', point: string, detail: string }>, questionsToAsk: Array<{ __typename?: 'DoctorQuestion', question: string, whyItMatters: string }> } };

export type GetWaitingContentQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWaitingContentQuery = { __typename?: 'Query', waitingContent: { __typename?: 'WaitingContent', cancerType: string, whatMutationsMean: string, clinicalTrialContext: string, timelineExpectations: string, generatedAt: string, commonMutations: Array<{ __typename?: 'CommonMutation', name: string, frequency: string, significance: string, drugs: Array<string> }> } };

export type GetSequencingBriefQueryVariables = Exact<{
  testType: Scalars['String']['input'];
  providerIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
  insurer?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetSequencingBriefQuery = { __typename?: 'Query', sequencingBrief: string };

export type CheckCoverageMutationVariables = Exact<{
  insurer: Scalars['String']['input'];
  testType: Scalars['String']['input'];
}>;


export type CheckCoverageMutation = { __typename?: 'Mutation', checkInsuranceCoverage: { __typename?: 'InsuranceCoverage', status: string, insurer: string, testType: string, reasoning: string, conditions: Array<string>, cptCodes: Array<string>, priorAuthRequired: boolean, estimatedOutOfPocket?: string | null, missingInfo: Array<string> } };

export type GenerateLomnMutationVariables = Exact<{
  testType: Scalars['String']['input'];
  insurer?: InputMaybe<Scalars['String']['input']>;
}>;


export type GenerateLomnMutation = { __typename?: 'Mutation', generateLOMN: { __typename?: 'LOMN', content: string, testType: string, cptCodes: Array<string>, icdCodes: Array<string>, generatedAt: string } };

export type GenerateSequencingRecommendationMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateSequencingRecommendationMutation = { __typename?: 'Mutation', generateSequencingRecommendation: { __typename?: 'SequencingRecommendation', level: string, headline: string, personalizedReasoning: string, whatItCouldReveal: Array<string>, howItHelpsRightNow: string, howItHelpsLater: string, guidelineRecommendation: string, generatedAt: string } };

export type UpdateSequencingOrderStatusMutationVariables = Exact<{
  orderId: Scalars['String']['input'];
  status: Scalars['String']['input'];
}>;


export type UpdateSequencingOrderStatusMutation = { __typename?: 'Mutation', updateSequencingOrderStatus: { __typename?: 'SequencingOrder', id: string, status: string, updatedAt?: string | null } };

export type CreateSequencingOrderMutationVariables = Exact<{
  providerId: Scalars['String']['input'];
  testType: Scalars['String']['input'];
}>;


export type CreateSequencingOrderMutation = { __typename?: 'Mutation', createSequencingOrder: { __typename?: 'SequencingOrder', id: string, status: string, provider?: { __typename?: 'SequencingProvider', id: string, name: string } | null } };

export type GetSurvivorshipPlanQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSurvivorshipPlanQuery = { __typename?: 'Query', survivorshipPlan?: { __typename?: 'SurvivorshipPlan', id: string, patientId: string, treatmentCompletionDate: string, completionType: string, ongoingTherapies: Array<string>, planContent: Record<string, unknown>, riskCategory?: string | null, currentPhase: string, lastGeneratedAt: string, nextReviewDate?: string | null, createdAt: string } | null };

export type GetSurveillanceScheduleQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSurveillanceScheduleQuery = { __typename?: 'Query', surveillanceSchedule: Array<{ __typename?: 'SurveillanceEvent', id: string, patientId: string, planId: string, type: string, title: string, description?: string | null, frequency?: string | null, guidelineSource?: string | null, dueDate?: string | null, status: string, completedDate?: string | null, resultSummary?: string | null, nextDueDate?: string | null, createdAt: string }> };

export type GetJournalEntriesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetJournalEntriesQuery = { __typename?: 'Query', journalEntries: Array<{ __typename?: 'JournalEntry', id: string, patientId: string, entryDate: string, energy?: number | null, pain?: number | null, mood?: number | null, sleepQuality?: number | null, hotFlashes?: number | null, jointPain?: number | null, newSymptoms?: Array<string> | null, exerciseType?: string | null, exerciseMinutes?: number | null, medicationsTaken?: Record<string, unknown> | null, notes?: string | null, createdAt: string }> };

export type GetJournalTrendsQueryVariables = Exact<{
  days: Scalars['Int']['input'];
}>;


export type GetJournalTrendsQuery = { __typename?: 'Query', journalTrends: { __typename?: 'JournalTrends', averageEnergy?: number | null, averagePain?: number | null, averageMood?: number | null, averageSleep?: number | null, energyDelta?: number | null, painDelta?: number | null, moodDelta?: number | null, sleepDelta?: number | null, streak: number, totalEntries: number, entries: Array<{ __typename?: 'JournalEntry', id: string, patientId: string, entryDate: string, energy?: number | null, pain?: number | null, mood?: number | null, sleepQuality?: number | null, hotFlashes?: number | null, jointPain?: number | null, newSymptoms?: Array<string> | null, exerciseType?: string | null, exerciseMinutes?: number | null, notes?: string | null, createdAt: string }> } };

export type SubmitJournalEntryMutationVariables = Exact<{
  input: SubmitJournalEntryInput;
}>;


export type SubmitJournalEntryMutation = { __typename?: 'Mutation', submitJournalEntry: { __typename?: 'JournalEntry', id: string, patientId: string, entryDate: string, energy?: number | null, pain?: number | null, mood?: number | null, sleepQuality?: number | null, hotFlashes?: number | null, jointPain?: number | null, newSymptoms?: Array<string> | null, exerciseType?: string | null, exerciseMinutes?: number | null, notes?: string | null, createdAt: string } };

export type DeleteJournalEntryMutationVariables = Exact<{
  entryId: Scalars['String']['input'];
}>;


export type DeleteJournalEntryMutation = { __typename?: 'Mutation', deleteJournalEntry: boolean };

export type CompleteTreatmentMutationVariables = Exact<{
  input: TreatmentCompletionInput;
}>;


export type CompleteTreatmentMutation = { __typename?: 'Mutation', completeTreatment: { __typename?: 'SurvivorshipPlan', id: string, patientId: string, treatmentCompletionDate: string, completionType: string, ongoingTherapies: Array<string>, planContent: Record<string, unknown>, riskCategory?: string | null, currentPhase: string, lastGeneratedAt: string, nextReviewDate?: string | null, createdAt: string } };

export type RefreshScpMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshScpMutation = { __typename?: 'Mutation', refreshSCP: { __typename?: 'SurvivorshipPlan', id: string, patientId: string, treatmentCompletionDate: string, completionType: string, ongoingTherapies: Array<string>, planContent: Record<string, unknown>, riskCategory?: string | null, currentPhase: string, lastGeneratedAt: string, nextReviewDate?: string | null, createdAt: string } };

export type MarkEventCompleteMutationVariables = Exact<{
  input: MarkEventCompleteInput;
}>;


export type MarkEventCompleteMutation = { __typename?: 'Mutation', markEventComplete: { __typename?: 'SurveillanceEvent', id: string, patientId: string, planId: string, type: string, title: string, description?: string | null, frequency?: string | null, guidelineSource?: string | null, dueDate?: string | null, status: string, completedDate?: string | null, resultSummary?: string | null, nextDueDate?: string | null, createdAt: string } };

export type SkipEventMutationVariables = Exact<{
  input: SkipEventInput;
}>;


export type SkipEventMutation = { __typename?: 'Mutation', skipEvent: { __typename?: 'SurveillanceEvent', id: string, patientId: string, planId: string, type: string, title: string, description?: string | null, frequency?: string | null, guidelineSource?: string | null, dueDate?: string | null, status: string, completedDate?: string | null, resultSummary?: string | null, nextDueDate?: string | null, createdAt: string } };

export type RescheduleEventMutationVariables = Exact<{
  input: RescheduleEventInput;
}>;


export type RescheduleEventMutation = { __typename?: 'Mutation', rescheduleEvent: { __typename?: 'SurveillanceEvent', id: string, patientId: string, planId: string, type: string, title: string, description?: string | null, frequency?: string | null, guidelineSource?: string | null, dueDate?: string | null, status: string, completedDate?: string | null, resultSummary?: string | null, nextDueDate?: string | null, createdAt: string } };

export type UploadEventResultMutationVariables = Exact<{
  input: UploadEventResultInput;
}>;


export type UploadEventResultMutation = { __typename?: 'Mutation', uploadEventResult: { __typename?: 'SurveillanceEvent', id: string, patientId: string, planId: string, type: string, title: string, description?: string | null, frequency?: string | null, guidelineSource?: string | null, dueDate?: string | null, status: string, completedDate?: string | null, resultSummary?: string | null, nextDueDate?: string | null, createdAt: string } };

export type GetLifestyleRecommendationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLifestyleRecommendationsQuery = { __typename?: 'Query', lifestyleRecommendations?: { __typename?: 'LifestyleRecommendations', generatedAt: string, exercise: { __typename?: 'ExerciseRecommendation', headline: string, effectSize: string, weeklyTargetMinutes: number, intensity: string, strengthDaysPerWeek: number, precautions: Array<{ __typename?: 'ExercisePrecaution', issue: string, guidance: string }>, starterPlan: Array<{ __typename?: 'ExerciseWeek', week: number, totalMinutes: number, sessions: Array<{ __typename?: 'ExerciseSession', day: string, type: string, duration: number, description: string }> }>, symptomExercises: Array<{ __typename?: 'SymptomExercise', symptom: string, exerciseType: string, evidence: string }> }, nutrition: { __typename?: 'NutritionRecommendation', headline: string, strongEvidence: Array<string>, medicationGuidance: Array<{ __typename?: 'MedicationNutrition', medication: string, considerations: Array<string>, emphasize: Array<string>, limit: Array<string> }>, mythBusting: Array<{ __typename?: 'NutritionMyth', myth: string, reality: string, nuance: string }> }, alcohol: { __typename?: 'AlcoholRecommendation', headline: string, quantifiedRisk: string, subtypeContext: string, recommendation: string, evidenceStrength: string, honestFraming: string }, environment: { __typename?: 'EnvironmentalRecommendation', approach: string, steps: Array<{ __typename?: 'EnvironmentalStep', category: string, action: string, why: string, difficulty: string, cost: string, evidence: string }>, overblownConcerns: Array<{ __typename?: 'OverblownConcern', claim: string, reality: string }> } } | null };

export type GetCareTeamQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCareTeamQuery = { __typename?: 'Query', careTeam: Array<{ __typename?: 'CareTeamMember', id: string, name: string, role: string, practice?: string | null, phone?: string | null, contactFor: Array<string> }> };

export type RouteSymptomQueryVariables = Exact<{
  symptom: Scalars['String']['input'];
}>;


export type RouteSymptomQuery = { __typename?: 'Query', routeSymptom: { __typename?: 'SymptomRouting', urgency: string, providerName?: string | null, providerRole?: string | null, providerPhone?: string | null, reasoning: string, immediateAction?: string | null } };

export type GetAppointmentPrepQueryVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type GetAppointmentPrepQuery = { __typename?: 'Query', appointmentPrep?: { __typename?: 'AppointmentPrep', eventId: string, appointmentType: string, appointmentDate?: string | null, completedSince: Array<string>, upcomingTests: Array<string>, overdueItems: Array<string>, medicationNotes: Array<string>, generatedAt: string, symptomSummary: Array<{ __typename?: 'SymptomTrendItem', dimension: string, average?: number | null, trend: string, notableChanges?: string | null }>, questionsToAsk: Array<{ __typename?: 'PrepQuestion', question: string, context: string }> } | null };

export type AddCareTeamMemberMutationVariables = Exact<{
  input: AddCareTeamMemberInput;
}>;


export type AddCareTeamMemberMutation = { __typename?: 'Mutation', addCareTeamMember: { __typename?: 'CareTeamMember', id: string, name: string, role: string, practice?: string | null, phone?: string | null, contactFor: Array<string> } };

export type UpdateCareTeamMemberMutationVariables = Exact<{
  input: UpdateCareTeamMemberInput;
}>;


export type UpdateCareTeamMemberMutation = { __typename?: 'Mutation', updateCareTeamMember: { __typename?: 'CareTeamMember', id: string, name: string, role: string, practice?: string | null, phone?: string | null, contactFor: Array<string> } };

export type RemoveCareTeamMemberMutationVariables = Exact<{
  memberId: Scalars['String']['input'];
}>;


export type RemoveCareTeamMemberMutation = { __typename?: 'Mutation', removeCareTeamMember: boolean };

export type GenerateAppointmentPrepMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type GenerateAppointmentPrepMutation = { __typename?: 'Mutation', generateAppointmentPrep: { __typename?: 'AppointmentPrep', eventId: string, appointmentType: string, appointmentDate?: string | null, completedSince: Array<string>, upcomingTests: Array<string>, overdueItems: Array<string>, medicationNotes: Array<string>, generatedAt: string, symptomSummary: Array<{ __typename?: 'SymptomTrendItem', dimension: string, average?: number | null, trend: string, notableChanges?: string | null }>, questionsToAsk: Array<{ __typename?: 'PrepQuestion', question: string, context: string }> } };

export type GetCtdnaHistoryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCtdnaHistoryQuery = { __typename?: 'Query', ctdnaHistory: Array<{ __typename?: 'CtdnaResult', id: string, testDate: string, provider?: string | null, result: string, ctdnaLevel?: number | null, documentUploadId?: string | null, triggeredTrialRematch: boolean, createdAt: string, interpretation?: { __typename?: 'CtdnaInterpretation', summary: string, whatThisMeans: string, nextSteps: string, trendContext?: string | null } | null }> };

export type AddCtdnaResultMutationVariables = Exact<{
  input: AddCtdnaResultInput;
}>;


export type AddCtdnaResultMutation = { __typename?: 'Mutation', addCtdnaResult: { __typename?: 'CtdnaResult', id: string, testDate: string, provider?: string | null, result: string, ctdnaLevel?: number | null, triggeredTrialRematch: boolean, createdAt: string, interpretation?: { __typename?: 'CtdnaInterpretation', summary: string, whatThisMeans: string, nextSteps: string, trendContext?: string | null } | null } };

export type GetNotificationPreferencesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetNotificationPreferencesQuery = { __typename?: 'Query', notificationPreferences?: { __typename?: 'NotificationPreference', id: string, patientId: string, surveillanceReminders: boolean, journalReminders: boolean, weeklySummary: boolean, appointmentPrep: boolean, ctdnaResults: boolean, scpAnnualReview: boolean, lifestyleCheckIn: boolean, phaseTransitions: boolean, quietHoursStart?: string | null, quietHoursEnd?: string | null, timezone: string } | null };

export type GetNotificationHistoryQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetNotificationHistoryQuery = { __typename?: 'Query', notificationHistory: Array<{ __typename?: 'NotificationLogEntry', id: string, patientId: string, category: string, channel: string, subject?: string | null, referenceId?: string | null, referenceType?: string | null, sentAt: string }> };

export type UpdateNotificationPreferencesMutationVariables = Exact<{
  input: UpdateNotificationPreferenceInput;
}>;


export type UpdateNotificationPreferencesMutation = { __typename?: 'Mutation', updateNotificationPreferences: { __typename?: 'NotificationPreference', id: string, patientId: string, surveillanceReminders: boolean, journalReminders: boolean, weeklySummary: boolean, appointmentPrep: boolean, ctdnaResults: boolean, scpAnnualReview: boolean, lifestyleCheckIn: boolean, phaseTransitions: boolean, quietHoursStart?: string | null, quietHoursEnd?: string | null, timezone: string } };

export type SubmitFeedbackMutationVariables = Exact<{
  input: SubmitFeedbackInput;
}>;


export type SubmitFeedbackMutation = { __typename?: 'Mutation', submitFeedback: { __typename?: 'SurvivorshipFeedback', id: string, feedbackType: string, rating?: number | null, comment?: string | null, createdAt: string } };

export type GetSurvivorshipFeedbackQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSurvivorshipFeedbackQuery = { __typename?: 'Query', survivorshipFeedback: Array<{ __typename?: 'SurvivorshipFeedback', id: string, feedbackType: string, rating?: number | null, comment?: string | null, context?: Record<string, unknown> | null, createdAt: string }> };

export type AnnualRefreshScpMutationVariables = Exact<{ [key: string]: never; }>;


export type AnnualRefreshScpMutation = { __typename?: 'Mutation', annualRefreshSCP: { __typename?: 'AnnualRefreshResult', newPlan: { __typename?: 'SurvivorshipPlan', id: string, patientId: string, treatmentCompletionDate: string, completionType: string, ongoingTherapies: Array<string>, planContent: Record<string, unknown>, riskCategory?: string | null, currentPhase: string, lastGeneratedAt: string, nextReviewDate?: string | null, createdAt: string }, diff: { __typename?: 'SCPDiff', changedSections: Array<string>, addedItems: Array<string>, removedItems: Array<string>, summary: string } } };

export type GenerateLifestyleRecommendationsMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateLifestyleRecommendationsMutation = { __typename?: 'Mutation', generateLifestyleRecommendations: { __typename?: 'LifestyleRecommendations', generatedAt: string, exercise: { __typename?: 'ExerciseRecommendation', headline: string, effectSize: string, weeklyTargetMinutes: number, intensity: string, strengthDaysPerWeek: number, precautions: Array<{ __typename?: 'ExercisePrecaution', issue: string, guidance: string }>, starterPlan: Array<{ __typename?: 'ExerciseWeek', week: number, totalMinutes: number, sessions: Array<{ __typename?: 'ExerciseSession', day: string, type: string, duration: number, description: string }> }>, symptomExercises: Array<{ __typename?: 'SymptomExercise', symptom: string, exerciseType: string, evidence: string }> }, nutrition: { __typename?: 'NutritionRecommendation', headline: string, strongEvidence: Array<string>, medicationGuidance: Array<{ __typename?: 'MedicationNutrition', medication: string, considerations: Array<string>, emphasize: Array<string>, limit: Array<string> }>, mythBusting: Array<{ __typename?: 'NutritionMyth', myth: string, reality: string, nuance: string }> }, alcohol: { __typename?: 'AlcoholRecommendation', headline: string, quantifiedRisk: string, subtypeContext: string, recommendation: string, evidenceStrength: string, honestFraming: string }, environment: { __typename?: 'EnvironmentalRecommendation', approach: string, steps: Array<{ __typename?: 'EnvironmentalStep', category: string, action: string, why: string, difficulty: string, cost: string, evidence: string }>, overblownConcerns: Array<{ __typename?: 'OverblownConcern', claim: string, reality: string }> } } };

export type GetTrialsQueryVariables = Exact<{
  cancerType?: InputMaybe<Scalars['String']['input']>;
  phase?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetTrialsQuery = { __typename?: 'Query', trials: Array<{ __typename?: 'Trial', id: string, nctId: string, title: string, phase?: string | null, status?: string | null, conditions: Array<string>, interventions: Array<string>, sponsor?: string | null, briefSummary?: string | null, startDate?: string | null, lastUpdated?: string | null }> };

export type GetTrialQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetTrialQuery = { __typename?: 'Query', trial?: { __typename?: 'Trial', id: string, nctId: string, title: string, phase?: string | null, status?: string | null, conditions: Array<string>, interventions: Array<string>, sponsor?: string | null, locations?: Record<string, unknown> | null, eligibilityCriteria?: string | null, parsedEligibility?: Record<string, unknown> | null, briefSummary?: string | null, startDate?: string | null, lastUpdated?: string | null } | null };

export type RequestGeneralUploadUrlMutationVariables = Exact<{
  filename: Scalars['String']['input'];
  contentType: Scalars['String']['input'];
  bucket?: InputMaybe<Scalars['String']['input']>;
}>;


export type RequestGeneralUploadUrlMutation = { __typename?: 'Mutation', requestGeneralUploadUrl: { __typename?: 'UploadUrlResult', uploadUrl: string, s3Key: string, bucket?: string | null, expiresAt?: string | null } };


export const MeDocument = gql`
    query Me {
  me {
    userId
    email
    createdAt
    expiresAt
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
// @ts-ignore
export function useMeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery | undefined, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const RequestMagicLinkDocument = gql`
    mutation RequestMagicLink($email: String!, $redirect: String) {
  requestMagicLink(email: $email, redirect: $redirect)
}
    `;
export type RequestMagicLinkMutationFn = Apollo.MutationFunction<RequestMagicLinkMutation, RequestMagicLinkMutationVariables>;

/**
 * __useRequestMagicLinkMutation__
 *
 * To run a mutation, you first call `useRequestMagicLinkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestMagicLinkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestMagicLinkMutation, { data, loading, error }] = useRequestMagicLinkMutation({
 *   variables: {
 *      email: // value for 'email'
 *      redirect: // value for 'redirect'
 *   },
 * });
 */
export function useRequestMagicLinkMutation(baseOptions?: Apollo.MutationHookOptions<RequestMagicLinkMutation, RequestMagicLinkMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestMagicLinkMutation, RequestMagicLinkMutationVariables>(RequestMagicLinkDocument, options);
      }
export type RequestMagicLinkMutationHookResult = ReturnType<typeof useRequestMagicLinkMutation>;
export type RequestMagicLinkMutationResult = Apollo.MutationResult<RequestMagicLinkMutation>;
export type RequestMagicLinkMutationOptions = Apollo.BaseMutationOptions<RequestMagicLinkMutation, RequestMagicLinkMutationVariables>;
export const GetDocumentsDocument = gql`
    query GetDocuments {
  documents {
    id
    patientId
    type
    filename
    s3Key
    status
    extraction
    createdAt
  }
}
    `;

/**
 * __useGetDocumentsQuery__
 *
 * To run a query within a React component, call `useGetDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDocumentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDocumentsQuery(baseOptions?: Apollo.QueryHookOptions<GetDocumentsQuery, GetDocumentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDocumentsQuery, GetDocumentsQueryVariables>(GetDocumentsDocument, options);
      }
export function useGetDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDocumentsQuery, GetDocumentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDocumentsQuery, GetDocumentsQueryVariables>(GetDocumentsDocument, options);
        }
// @ts-ignore
export function useGetDocumentsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetDocumentsQuery, GetDocumentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetDocumentsQuery, GetDocumentsQueryVariables>;
export function useGetDocumentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDocumentsQuery, GetDocumentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetDocumentsQuery | undefined, GetDocumentsQueryVariables>;
export function useGetDocumentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDocumentsQuery, GetDocumentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDocumentsQuery, GetDocumentsQueryVariables>(GetDocumentsDocument, options);
        }
export type GetDocumentsQueryHookResult = ReturnType<typeof useGetDocumentsQuery>;
export type GetDocumentsLazyQueryHookResult = ReturnType<typeof useGetDocumentsLazyQuery>;
export type GetDocumentsSuspenseQueryHookResult = ReturnType<typeof useGetDocumentsSuspenseQuery>;
export type GetDocumentsQueryResult = Apollo.QueryResult<GetDocumentsQuery, GetDocumentsQueryVariables>;
export const RequestUploadUrlDocument = gql`
    mutation RequestUploadUrl($filename: String!, $contentType: String!) {
  requestUploadUrl(filename: $filename, contentType: $contentType) {
    uploadUrl
    s3Key
  }
}
    `;
export type RequestUploadUrlMutationFn = Apollo.MutationFunction<RequestUploadUrlMutation, RequestUploadUrlMutationVariables>;

/**
 * __useRequestUploadUrlMutation__
 *
 * To run a mutation, you first call `useRequestUploadUrlMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestUploadUrlMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestUploadUrlMutation, { data, loading, error }] = useRequestUploadUrlMutation({
 *   variables: {
 *      filename: // value for 'filename'
 *      contentType: // value for 'contentType'
 *   },
 * });
 */
export function useRequestUploadUrlMutation(baseOptions?: Apollo.MutationHookOptions<RequestUploadUrlMutation, RequestUploadUrlMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestUploadUrlMutation, RequestUploadUrlMutationVariables>(RequestUploadUrlDocument, options);
      }
export type RequestUploadUrlMutationHookResult = ReturnType<typeof useRequestUploadUrlMutation>;
export type RequestUploadUrlMutationResult = Apollo.MutationResult<RequestUploadUrlMutation>;
export type RequestUploadUrlMutationOptions = Apollo.BaseMutationOptions<RequestUploadUrlMutation, RequestUploadUrlMutationVariables>;
export const ExtractDocumentDocument = gql`
    mutation ExtractDocument($documentId: String!) {
  extractDocument(documentId: $documentId) {
    id
    status
    extraction
  }
}
    `;
export type ExtractDocumentMutationFn = Apollo.MutationFunction<ExtractDocumentMutation, ExtractDocumentMutationVariables>;

/**
 * __useExtractDocumentMutation__
 *
 * To run a mutation, you first call `useExtractDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExtractDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [extractDocumentMutation, { data, loading, error }] = useExtractDocumentMutation({
 *   variables: {
 *      documentId: // value for 'documentId'
 *   },
 * });
 */
export function useExtractDocumentMutation(baseOptions?: Apollo.MutationHookOptions<ExtractDocumentMutation, ExtractDocumentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ExtractDocumentMutation, ExtractDocumentMutationVariables>(ExtractDocumentDocument, options);
      }
export type ExtractDocumentMutationHookResult = ReturnType<typeof useExtractDocumentMutation>;
export type ExtractDocumentMutationResult = Apollo.MutationResult<ExtractDocumentMutation>;
export type ExtractDocumentMutationOptions = Apollo.BaseMutationOptions<ExtractDocumentMutation, ExtractDocumentMutationVariables>;
export const GetHealthSystemsDocument = gql`
    query GetHealthSystems($search: String) {
  healthSystems(search: $search) {
    id
    name
    fhirBaseUrl
    brand
    city
    state
    ehrVendor
    isCancerCenter
  }
}
    `;

/**
 * __useGetHealthSystemsQuery__
 *
 * To run a query within a React component, call `useGetHealthSystemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHealthSystemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHealthSystemsQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useGetHealthSystemsQuery(baseOptions?: Apollo.QueryHookOptions<GetHealthSystemsQuery, GetHealthSystemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHealthSystemsQuery, GetHealthSystemsQueryVariables>(GetHealthSystemsDocument, options);
      }
export function useGetHealthSystemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHealthSystemsQuery, GetHealthSystemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHealthSystemsQuery, GetHealthSystemsQueryVariables>(GetHealthSystemsDocument, options);
        }
// @ts-ignore
export function useGetHealthSystemsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetHealthSystemsQuery, GetHealthSystemsQueryVariables>): Apollo.UseSuspenseQueryResult<GetHealthSystemsQuery, GetHealthSystemsQueryVariables>;
export function useGetHealthSystemsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHealthSystemsQuery, GetHealthSystemsQueryVariables>): Apollo.UseSuspenseQueryResult<GetHealthSystemsQuery | undefined, GetHealthSystemsQueryVariables>;
export function useGetHealthSystemsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHealthSystemsQuery, GetHealthSystemsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetHealthSystemsQuery, GetHealthSystemsQueryVariables>(GetHealthSystemsDocument, options);
        }
export type GetHealthSystemsQueryHookResult = ReturnType<typeof useGetHealthSystemsQuery>;
export type GetHealthSystemsLazyQueryHookResult = ReturnType<typeof useGetHealthSystemsLazyQuery>;
export type GetHealthSystemsSuspenseQueryHookResult = ReturnType<typeof useGetHealthSystemsSuspenseQuery>;
export type GetHealthSystemsQueryResult = Apollo.QueryResult<GetHealthSystemsQuery, GetHealthSystemsQueryVariables>;
export const GetFhirConnectionsDocument = gql`
    query GetFhirConnections {
  fhirConnections {
    id
    healthSystemName
    syncStatus
    lastSyncedAt
    scopesGranted
    resourcesPulled
  }
}
    `;

/**
 * __useGetFhirConnectionsQuery__
 *
 * To run a query within a React component, call `useGetFhirConnectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFhirConnectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFhirConnectionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFhirConnectionsQuery(baseOptions?: Apollo.QueryHookOptions<GetFhirConnectionsQuery, GetFhirConnectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFhirConnectionsQuery, GetFhirConnectionsQueryVariables>(GetFhirConnectionsDocument, options);
      }
export function useGetFhirConnectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFhirConnectionsQuery, GetFhirConnectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFhirConnectionsQuery, GetFhirConnectionsQueryVariables>(GetFhirConnectionsDocument, options);
        }
// @ts-ignore
export function useGetFhirConnectionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFhirConnectionsQuery, GetFhirConnectionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetFhirConnectionsQuery, GetFhirConnectionsQueryVariables>;
export function useGetFhirConnectionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFhirConnectionsQuery, GetFhirConnectionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetFhirConnectionsQuery | undefined, GetFhirConnectionsQueryVariables>;
export function useGetFhirConnectionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFhirConnectionsQuery, GetFhirConnectionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFhirConnectionsQuery, GetFhirConnectionsQueryVariables>(GetFhirConnectionsDocument, options);
        }
export type GetFhirConnectionsQueryHookResult = ReturnType<typeof useGetFhirConnectionsQuery>;
export type GetFhirConnectionsLazyQueryHookResult = ReturnType<typeof useGetFhirConnectionsLazyQuery>;
export type GetFhirConnectionsSuspenseQueryHookResult = ReturnType<typeof useGetFhirConnectionsSuspenseQuery>;
export type GetFhirConnectionsQueryResult = Apollo.QueryResult<GetFhirConnectionsQuery, GetFhirConnectionsQueryVariables>;
export const AuthorizeFhirDocument = gql`
    mutation AuthorizeFhir($healthSystemId: String!) {
  authorizeFhir(healthSystemId: $healthSystemId) {
    authorizeUrl
  }
}
    `;
export type AuthorizeFhirMutationFn = Apollo.MutationFunction<AuthorizeFhirMutation, AuthorizeFhirMutationVariables>;

/**
 * __useAuthorizeFhirMutation__
 *
 * To run a mutation, you first call `useAuthorizeFhirMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAuthorizeFhirMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [authorizeFhirMutation, { data, loading, error }] = useAuthorizeFhirMutation({
 *   variables: {
 *      healthSystemId: // value for 'healthSystemId'
 *   },
 * });
 */
export function useAuthorizeFhirMutation(baseOptions?: Apollo.MutationHookOptions<AuthorizeFhirMutation, AuthorizeFhirMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AuthorizeFhirMutation, AuthorizeFhirMutationVariables>(AuthorizeFhirDocument, options);
      }
export type AuthorizeFhirMutationHookResult = ReturnType<typeof useAuthorizeFhirMutation>;
export type AuthorizeFhirMutationResult = Apollo.MutationResult<AuthorizeFhirMutation>;
export type AuthorizeFhirMutationOptions = Apollo.BaseMutationOptions<AuthorizeFhirMutation, AuthorizeFhirMutationVariables>;
export const ExtractFhirDocument = gql`
    mutation ExtractFhir($connectionId: String!) {
  extractFhir(connectionId: $connectionId)
}
    `;
export type ExtractFhirMutationFn = Apollo.MutationFunction<ExtractFhirMutation, ExtractFhirMutationVariables>;

/**
 * __useExtractFhirMutation__
 *
 * To run a mutation, you first call `useExtractFhirMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExtractFhirMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [extractFhirMutation, { data, loading, error }] = useExtractFhirMutation({
 *   variables: {
 *      connectionId: // value for 'connectionId'
 *   },
 * });
 */
export function useExtractFhirMutation(baseOptions?: Apollo.MutationHookOptions<ExtractFhirMutation, ExtractFhirMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ExtractFhirMutation, ExtractFhirMutationVariables>(ExtractFhirDocument, options);
      }
export type ExtractFhirMutationHookResult = ReturnType<typeof useExtractFhirMutation>;
export type ExtractFhirMutationResult = Apollo.MutationResult<ExtractFhirMutation>;
export type ExtractFhirMutationOptions = Apollo.BaseMutationOptions<ExtractFhirMutation, ExtractFhirMutationVariables>;
export const RevokeFhirConnectionDocument = gql`
    mutation RevokeFhirConnection($connectionId: String!) {
  revokeFhirConnection(connectionId: $connectionId)
}
    `;
export type RevokeFhirConnectionMutationFn = Apollo.MutationFunction<RevokeFhirConnectionMutation, RevokeFhirConnectionMutationVariables>;

/**
 * __useRevokeFhirConnectionMutation__
 *
 * To run a mutation, you first call `useRevokeFhirConnectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevokeFhirConnectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revokeFhirConnectionMutation, { data, loading, error }] = useRevokeFhirConnectionMutation({
 *   variables: {
 *      connectionId: // value for 'connectionId'
 *   },
 * });
 */
export function useRevokeFhirConnectionMutation(baseOptions?: Apollo.MutationHookOptions<RevokeFhirConnectionMutation, RevokeFhirConnectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RevokeFhirConnectionMutation, RevokeFhirConnectionMutationVariables>(RevokeFhirConnectionDocument, options);
      }
export type RevokeFhirConnectionMutationHookResult = ReturnType<typeof useRevokeFhirConnectionMutation>;
export type RevokeFhirConnectionMutationResult = Apollo.MutationResult<RevokeFhirConnectionMutation>;
export type RevokeFhirConnectionMutationOptions = Apollo.BaseMutationOptions<RevokeFhirConnectionMutation, RevokeFhirConnectionMutationVariables>;
export const ResyncFhirConnectionDocument = gql`
    mutation ResyncFhirConnection($connectionId: String!) {
  resyncFhirConnection(connectionId: $connectionId)
}
    `;
export type ResyncFhirConnectionMutationFn = Apollo.MutationFunction<ResyncFhirConnectionMutation, ResyncFhirConnectionMutationVariables>;

/**
 * __useResyncFhirConnectionMutation__
 *
 * To run a mutation, you first call `useResyncFhirConnectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResyncFhirConnectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resyncFhirConnectionMutation, { data, loading, error }] = useResyncFhirConnectionMutation({
 *   variables: {
 *      connectionId: // value for 'connectionId'
 *   },
 * });
 */
export function useResyncFhirConnectionMutation(baseOptions?: Apollo.MutationHookOptions<ResyncFhirConnectionMutation, ResyncFhirConnectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResyncFhirConnectionMutation, ResyncFhirConnectionMutationVariables>(ResyncFhirConnectionDocument, options);
      }
export type ResyncFhirConnectionMutationHookResult = ReturnType<typeof useResyncFhirConnectionMutation>;
export type ResyncFhirConnectionMutationResult = Apollo.MutationResult<ResyncFhirConnectionMutation>;
export type ResyncFhirConnectionMutationOptions = Apollo.BaseMutationOptions<ResyncFhirConnectionMutation, ResyncFhirConnectionMutationVariables>;
export const GetFinancialProgramsDocument = gql`
    query GetFinancialPrograms {
  financialPrograms {
    id
    name
    organization
    type
    description
    website
    applicationUrl
    maxBenefitAmount
    benefitDescription
    assistanceCategories
  }
}
    `;

/**
 * __useGetFinancialProgramsQuery__
 *
 * To run a query within a React component, call `useGetFinancialProgramsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFinancialProgramsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFinancialProgramsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFinancialProgramsQuery(baseOptions?: Apollo.QueryHookOptions<GetFinancialProgramsQuery, GetFinancialProgramsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFinancialProgramsQuery, GetFinancialProgramsQueryVariables>(GetFinancialProgramsDocument, options);
      }
export function useGetFinancialProgramsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFinancialProgramsQuery, GetFinancialProgramsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFinancialProgramsQuery, GetFinancialProgramsQueryVariables>(GetFinancialProgramsDocument, options);
        }
// @ts-ignore
export function useGetFinancialProgramsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFinancialProgramsQuery, GetFinancialProgramsQueryVariables>): Apollo.UseSuspenseQueryResult<GetFinancialProgramsQuery, GetFinancialProgramsQueryVariables>;
export function useGetFinancialProgramsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFinancialProgramsQuery, GetFinancialProgramsQueryVariables>): Apollo.UseSuspenseQueryResult<GetFinancialProgramsQuery | undefined, GetFinancialProgramsQueryVariables>;
export function useGetFinancialProgramsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFinancialProgramsQuery, GetFinancialProgramsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFinancialProgramsQuery, GetFinancialProgramsQueryVariables>(GetFinancialProgramsDocument, options);
        }
export type GetFinancialProgramsQueryHookResult = ReturnType<typeof useGetFinancialProgramsQuery>;
export type GetFinancialProgramsLazyQueryHookResult = ReturnType<typeof useGetFinancialProgramsLazyQuery>;
export type GetFinancialProgramsSuspenseQueryHookResult = ReturnType<typeof useGetFinancialProgramsSuspenseQuery>;
export type GetFinancialProgramsQueryResult = Apollo.QueryResult<GetFinancialProgramsQuery, GetFinancialProgramsQueryVariables>;
export const GetFinancialMatchesDocument = gql`
    query GetFinancialMatches {
  financialMatches {
    programId
    programName
    organization
    type
    matchStatus
    estimatedBenefit
    matchReasoning
    missingInfo
    maxBenefitAmount
    applicationUrl
    website
    assistanceCategories
  }
}
    `;

/**
 * __useGetFinancialMatchesQuery__
 *
 * To run a query within a React component, call `useGetFinancialMatchesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFinancialMatchesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFinancialMatchesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFinancialMatchesQuery(baseOptions?: Apollo.QueryHookOptions<GetFinancialMatchesQuery, GetFinancialMatchesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFinancialMatchesQuery, GetFinancialMatchesQueryVariables>(GetFinancialMatchesDocument, options);
      }
export function useGetFinancialMatchesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFinancialMatchesQuery, GetFinancialMatchesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFinancialMatchesQuery, GetFinancialMatchesQueryVariables>(GetFinancialMatchesDocument, options);
        }
// @ts-ignore
export function useGetFinancialMatchesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFinancialMatchesQuery, GetFinancialMatchesQueryVariables>): Apollo.UseSuspenseQueryResult<GetFinancialMatchesQuery, GetFinancialMatchesQueryVariables>;
export function useGetFinancialMatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFinancialMatchesQuery, GetFinancialMatchesQueryVariables>): Apollo.UseSuspenseQueryResult<GetFinancialMatchesQuery | undefined, GetFinancialMatchesQueryVariables>;
export function useGetFinancialMatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFinancialMatchesQuery, GetFinancialMatchesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFinancialMatchesQuery, GetFinancialMatchesQueryVariables>(GetFinancialMatchesDocument, options);
        }
export type GetFinancialMatchesQueryHookResult = ReturnType<typeof useGetFinancialMatchesQuery>;
export type GetFinancialMatchesLazyQueryHookResult = ReturnType<typeof useGetFinancialMatchesLazyQuery>;
export type GetFinancialMatchesSuspenseQueryHookResult = ReturnType<typeof useGetFinancialMatchesSuspenseQuery>;
export type GetFinancialMatchesQueryResult = Apollo.QueryResult<GetFinancialMatchesQuery, GetFinancialMatchesQueryVariables>;
export const GetFinancialProgramDocument = gql`
    query GetFinancialProgram($programId: String!) {
  financialProgram(programId: $programId) {
    id
    name
    organization
    type
    description
    website
    applicationUrl
    maxBenefitAmount
    benefitDescription
    assistanceCategories
  }
}
    `;

/**
 * __useGetFinancialProgramQuery__
 *
 * To run a query within a React component, call `useGetFinancialProgramQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFinancialProgramQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFinancialProgramQuery({
 *   variables: {
 *      programId: // value for 'programId'
 *   },
 * });
 */
export function useGetFinancialProgramQuery(baseOptions: Apollo.QueryHookOptions<GetFinancialProgramQuery, GetFinancialProgramQueryVariables> & ({ variables: GetFinancialProgramQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFinancialProgramQuery, GetFinancialProgramQueryVariables>(GetFinancialProgramDocument, options);
      }
export function useGetFinancialProgramLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFinancialProgramQuery, GetFinancialProgramQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFinancialProgramQuery, GetFinancialProgramQueryVariables>(GetFinancialProgramDocument, options);
        }
// @ts-ignore
export function useGetFinancialProgramSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFinancialProgramQuery, GetFinancialProgramQueryVariables>): Apollo.UseSuspenseQueryResult<GetFinancialProgramQuery, GetFinancialProgramQueryVariables>;
export function useGetFinancialProgramSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFinancialProgramQuery, GetFinancialProgramQueryVariables>): Apollo.UseSuspenseQueryResult<GetFinancialProgramQuery | undefined, GetFinancialProgramQueryVariables>;
export function useGetFinancialProgramSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFinancialProgramQuery, GetFinancialProgramQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFinancialProgramQuery, GetFinancialProgramQueryVariables>(GetFinancialProgramDocument, options);
        }
export type GetFinancialProgramQueryHookResult = ReturnType<typeof useGetFinancialProgramQuery>;
export type GetFinancialProgramLazyQueryHookResult = ReturnType<typeof useGetFinancialProgramLazyQuery>;
export type GetFinancialProgramSuspenseQueryHookResult = ReturnType<typeof useGetFinancialProgramSuspenseQuery>;
export type GetFinancialProgramQueryResult = Apollo.QueryResult<GetFinancialProgramQuery, GetFinancialProgramQueryVariables>;
export const MatchFinancialProgramsDocument = gql`
    mutation MatchFinancialPrograms($input: FinancialProfileInput!) {
  matchFinancialPrograms(input: $input) {
    programId
    programName
    organization
    type
    matchStatus
    estimatedBenefit
    matchReasoning
    missingInfo
    maxBenefitAmount
    applicationUrl
    website
    assistanceCategories
  }
}
    `;
export type MatchFinancialProgramsMutationFn = Apollo.MutationFunction<MatchFinancialProgramsMutation, MatchFinancialProgramsMutationVariables>;

/**
 * __useMatchFinancialProgramsMutation__
 *
 * To run a mutation, you first call `useMatchFinancialProgramsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMatchFinancialProgramsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [matchFinancialProgramsMutation, { data, loading, error }] = useMatchFinancialProgramsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMatchFinancialProgramsMutation(baseOptions?: Apollo.MutationHookOptions<MatchFinancialProgramsMutation, MatchFinancialProgramsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MatchFinancialProgramsMutation, MatchFinancialProgramsMutationVariables>(MatchFinancialProgramsDocument, options);
      }
export type MatchFinancialProgramsMutationHookResult = ReturnType<typeof useMatchFinancialProgramsMutation>;
export type MatchFinancialProgramsMutationResult = Apollo.MutationResult<MatchFinancialProgramsMutation>;
export type MatchFinancialProgramsMutationOptions = Apollo.BaseMutationOptions<MatchFinancialProgramsMutation, MatchFinancialProgramsMutationVariables>;
export const SubscribeFinancialProgramDocument = gql`
    mutation SubscribeFinancialProgram($programId: String!) {
  subscribeFinancialProgram(programId: $programId)
}
    `;
export type SubscribeFinancialProgramMutationFn = Apollo.MutationFunction<SubscribeFinancialProgramMutation, SubscribeFinancialProgramMutationVariables>;

/**
 * __useSubscribeFinancialProgramMutation__
 *
 * To run a mutation, you first call `useSubscribeFinancialProgramMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubscribeFinancialProgramMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [subscribeFinancialProgramMutation, { data, loading, error }] = useSubscribeFinancialProgramMutation({
 *   variables: {
 *      programId: // value for 'programId'
 *   },
 * });
 */
export function useSubscribeFinancialProgramMutation(baseOptions?: Apollo.MutationHookOptions<SubscribeFinancialProgramMutation, SubscribeFinancialProgramMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubscribeFinancialProgramMutation, SubscribeFinancialProgramMutationVariables>(SubscribeFinancialProgramDocument, options);
      }
export type SubscribeFinancialProgramMutationHookResult = ReturnType<typeof useSubscribeFinancialProgramMutation>;
export type SubscribeFinancialProgramMutationResult = Apollo.MutationResult<SubscribeFinancialProgramMutation>;
export type SubscribeFinancialProgramMutationOptions = Apollo.BaseMutationOptions<SubscribeFinancialProgramMutation, SubscribeFinancialProgramMutationVariables>;
export const GetGenomicResultsDocument = gql`
    query GetGenomicResults {
  genomicResults {
    id
    patientId
    provider
    testName
    reportDate
    alterations {
      gene
      alteration
      alterationType
      variantAlleleFrequency
      clinicalSignificance
      therapyImplications {
        approvedTherapies
        clinicalTrials
        resistanceMutations
      }
      confidence
    }
    biomarkers {
      tmb {
        value
        unit
        status
      }
      msi {
        status
        score
      }
      pdl1 {
        tps
        cps
      }
      loh {
        status
      }
      hrd {
        score
        status
      }
    }
    interpretation
    createdAt
  }
}
    `;

/**
 * __useGetGenomicResultsQuery__
 *
 * To run a query within a React component, call `useGetGenomicResultsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGenomicResultsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGenomicResultsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetGenomicResultsQuery(baseOptions?: Apollo.QueryHookOptions<GetGenomicResultsQuery, GetGenomicResultsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGenomicResultsQuery, GetGenomicResultsQueryVariables>(GetGenomicResultsDocument, options);
      }
export function useGetGenomicResultsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGenomicResultsQuery, GetGenomicResultsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGenomicResultsQuery, GetGenomicResultsQueryVariables>(GetGenomicResultsDocument, options);
        }
// @ts-ignore
export function useGetGenomicResultsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetGenomicResultsQuery, GetGenomicResultsQueryVariables>): Apollo.UseSuspenseQueryResult<GetGenomicResultsQuery, GetGenomicResultsQueryVariables>;
export function useGetGenomicResultsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGenomicResultsQuery, GetGenomicResultsQueryVariables>): Apollo.UseSuspenseQueryResult<GetGenomicResultsQuery | undefined, GetGenomicResultsQueryVariables>;
export function useGetGenomicResultsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGenomicResultsQuery, GetGenomicResultsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGenomicResultsQuery, GetGenomicResultsQueryVariables>(GetGenomicResultsDocument, options);
        }
export type GetGenomicResultsQueryHookResult = ReturnType<typeof useGetGenomicResultsQuery>;
export type GetGenomicResultsLazyQueryHookResult = ReturnType<typeof useGetGenomicResultsLazyQuery>;
export type GetGenomicResultsSuspenseQueryHookResult = ReturnType<typeof useGetGenomicResultsSuspenseQuery>;
export type GetGenomicResultsQueryResult = Apollo.QueryResult<GetGenomicResultsQuery, GetGenomicResultsQueryVariables>;
export const GetGenomicResultDocument = gql`
    query GetGenomicResult($id: String!) {
  genomicResult(id: $id) {
    id
    patientId
    provider
    testName
    reportDate
    alterations {
      gene
      alteration
      alterationType
      variantAlleleFrequency
      clinicalSignificance
      therapyImplications {
        approvedTherapies
        clinicalTrials
        resistanceMutations
      }
      confidence
    }
    biomarkers {
      tmb {
        value
        unit
        status
      }
      msi {
        status
        score
      }
      pdl1 {
        tps
        cps
      }
      loh {
        status
      }
      hrd {
        score
        status
      }
    }
    interpretation
    createdAt
  }
}
    `;

/**
 * __useGetGenomicResultQuery__
 *
 * To run a query within a React component, call `useGetGenomicResultQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGenomicResultQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGenomicResultQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetGenomicResultQuery(baseOptions: Apollo.QueryHookOptions<GetGenomicResultQuery, GetGenomicResultQueryVariables> & ({ variables: GetGenomicResultQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGenomicResultQuery, GetGenomicResultQueryVariables>(GetGenomicResultDocument, options);
      }
export function useGetGenomicResultLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGenomicResultQuery, GetGenomicResultQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGenomicResultQuery, GetGenomicResultQueryVariables>(GetGenomicResultDocument, options);
        }
// @ts-ignore
export function useGetGenomicResultSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetGenomicResultQuery, GetGenomicResultQueryVariables>): Apollo.UseSuspenseQueryResult<GetGenomicResultQuery, GetGenomicResultQueryVariables>;
export function useGetGenomicResultSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGenomicResultQuery, GetGenomicResultQueryVariables>): Apollo.UseSuspenseQueryResult<GetGenomicResultQuery | undefined, GetGenomicResultQueryVariables>;
export function useGetGenomicResultSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGenomicResultQuery, GetGenomicResultQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGenomicResultQuery, GetGenomicResultQueryVariables>(GetGenomicResultDocument, options);
        }
export type GetGenomicResultQueryHookResult = ReturnType<typeof useGetGenomicResultQuery>;
export type GetGenomicResultLazyQueryHookResult = ReturnType<typeof useGetGenomicResultLazyQuery>;
export type GetGenomicResultSuspenseQueryHookResult = ReturnType<typeof useGetGenomicResultSuspenseQuery>;
export type GetGenomicResultQueryResult = Apollo.QueryResult<GetGenomicResultQuery, GetGenomicResultQueryVariables>;
export const GetMatchDeltaDocument = gql`
    query GetMatchDelta {
  matchDelta {
    newMatches {
      trialId
      nctId
      title
      oldScore
      newScore
      genomicBasis
      reason
    }
    improvedMatches {
      trialId
      nctId
      title
      oldScore
      newScore
      genomicBasis
      reason
    }
    removedMatches {
      trialId
      nctId
      title
      oldScore
      newScore
      genomicBasis
      reason
    }
    totalBefore
    totalAfter
  }
}
    `;

/**
 * __useGetMatchDeltaQuery__
 *
 * To run a query within a React component, call `useGetMatchDeltaQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMatchDeltaQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMatchDeltaQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMatchDeltaQuery(baseOptions?: Apollo.QueryHookOptions<GetMatchDeltaQuery, GetMatchDeltaQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMatchDeltaQuery, GetMatchDeltaQueryVariables>(GetMatchDeltaDocument, options);
      }
export function useGetMatchDeltaLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMatchDeltaQuery, GetMatchDeltaQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMatchDeltaQuery, GetMatchDeltaQueryVariables>(GetMatchDeltaDocument, options);
        }
// @ts-ignore
export function useGetMatchDeltaSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetMatchDeltaQuery, GetMatchDeltaQueryVariables>): Apollo.UseSuspenseQueryResult<GetMatchDeltaQuery, GetMatchDeltaQueryVariables>;
export function useGetMatchDeltaSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMatchDeltaQuery, GetMatchDeltaQueryVariables>): Apollo.UseSuspenseQueryResult<GetMatchDeltaQuery | undefined, GetMatchDeltaQueryVariables>;
export function useGetMatchDeltaSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMatchDeltaQuery, GetMatchDeltaQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMatchDeltaQuery, GetMatchDeltaQueryVariables>(GetMatchDeltaDocument, options);
        }
export type GetMatchDeltaQueryHookResult = ReturnType<typeof useGetMatchDeltaQuery>;
export type GetMatchDeltaLazyQueryHookResult = ReturnType<typeof useGetMatchDeltaLazyQuery>;
export type GetMatchDeltaSuspenseQueryHookResult = ReturnType<typeof useGetMatchDeltaSuspenseQuery>;
export type GetMatchDeltaQueryResult = Apollo.QueryResult<GetMatchDeltaQuery, GetMatchDeltaQueryVariables>;
export const ExtractGenomicReportDocument = gql`
    mutation ExtractGenomicReport($documentId: String!) {
  extractGenomicReport(documentId: $documentId) {
    id
    provider
    testName
    alterations {
      gene
      alteration
      alterationType
      clinicalSignificance
    }
    biomarkers {
      tmb {
        value
        unit
        status
      }
      msi {
        status
        score
      }
    }
  }
}
    `;
export type ExtractGenomicReportMutationFn = Apollo.MutationFunction<ExtractGenomicReportMutation, ExtractGenomicReportMutationVariables>;

/**
 * __useExtractGenomicReportMutation__
 *
 * To run a mutation, you first call `useExtractGenomicReportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExtractGenomicReportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [extractGenomicReportMutation, { data, loading, error }] = useExtractGenomicReportMutation({
 *   variables: {
 *      documentId: // value for 'documentId'
 *   },
 * });
 */
export function useExtractGenomicReportMutation(baseOptions?: Apollo.MutationHookOptions<ExtractGenomicReportMutation, ExtractGenomicReportMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ExtractGenomicReportMutation, ExtractGenomicReportMutationVariables>(ExtractGenomicReportDocument, options);
      }
export type ExtractGenomicReportMutationHookResult = ReturnType<typeof useExtractGenomicReportMutation>;
export type ExtractGenomicReportMutationResult = Apollo.MutationResult<ExtractGenomicReportMutation>;
export type ExtractGenomicReportMutationOptions = Apollo.BaseMutationOptions<ExtractGenomicReportMutation, ExtractGenomicReportMutationVariables>;
export const InterpretGenomicsDocument = gql`
    mutation InterpretGenomics {
  interpretGenomics {
    summary
    mutations
    biomarkerProfile
    questionsForOncologist {
      question
      whyItMatters
    }
    generatedAt
  }
}
    `;
export type InterpretGenomicsMutationFn = Apollo.MutationFunction<InterpretGenomicsMutation, InterpretGenomicsMutationVariables>;

/**
 * __useInterpretGenomicsMutation__
 *
 * To run a mutation, you first call `useInterpretGenomicsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInterpretGenomicsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [interpretGenomicsMutation, { data, loading, error }] = useInterpretGenomicsMutation({
 *   variables: {
 *   },
 * });
 */
export function useInterpretGenomicsMutation(baseOptions?: Apollo.MutationHookOptions<InterpretGenomicsMutation, InterpretGenomicsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InterpretGenomicsMutation, InterpretGenomicsMutationVariables>(InterpretGenomicsDocument, options);
      }
export type InterpretGenomicsMutationHookResult = ReturnType<typeof useInterpretGenomicsMutation>;
export type InterpretGenomicsMutationResult = Apollo.MutationResult<InterpretGenomicsMutation>;
export type InterpretGenomicsMutationOptions = Apollo.BaseMutationOptions<InterpretGenomicsMutation, InterpretGenomicsMutationVariables>;
export const ConfirmGenomicsDocument = gql`
    mutation ConfirmGenomics($genomicResultId: String!, $edits: JSON) {
  confirmGenomics(genomicResultId: $genomicResultId, edits: $edits) {
    id
    patientId
    provider
    testName
    alterations {
      gene
      alteration
      alterationType
      clinicalSignificance
    }
  }
}
    `;
export type ConfirmGenomicsMutationFn = Apollo.MutationFunction<ConfirmGenomicsMutation, ConfirmGenomicsMutationVariables>;

/**
 * __useConfirmGenomicsMutation__
 *
 * To run a mutation, you first call `useConfirmGenomicsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfirmGenomicsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [confirmGenomicsMutation, { data, loading, error }] = useConfirmGenomicsMutation({
 *   variables: {
 *      genomicResultId: // value for 'genomicResultId'
 *      edits: // value for 'edits'
 *   },
 * });
 */
export function useConfirmGenomicsMutation(baseOptions?: Apollo.MutationHookOptions<ConfirmGenomicsMutation, ConfirmGenomicsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfirmGenomicsMutation, ConfirmGenomicsMutationVariables>(ConfirmGenomicsDocument, options);
      }
export type ConfirmGenomicsMutationHookResult = ReturnType<typeof useConfirmGenomicsMutation>;
export type ConfirmGenomicsMutationResult = Apollo.MutationResult<ConfirmGenomicsMutation>;
export type ConfirmGenomicsMutationOptions = Apollo.BaseMutationOptions<ConfirmGenomicsMutation, ConfirmGenomicsMutationVariables>;
export const RematchDocument = gql`
    mutation Rematch {
  rematch {
    newMatches {
      trialId
      nctId
      title
      newScore
      genomicBasis
    }
    improvedMatches {
      trialId
      nctId
      title
      oldScore
      newScore
      genomicBasis
    }
    removedMatches {
      trialId
      nctId
      title
      oldScore
      reason
    }
    totalBefore
    totalAfter
  }
}
    `;
export type RematchMutationFn = Apollo.MutationFunction<RematchMutation, RematchMutationVariables>;

/**
 * __useRematchMutation__
 *
 * To run a mutation, you first call `useRematchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRematchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rematchMutation, { data, loading, error }] = useRematchMutation({
 *   variables: {
 *   },
 * });
 */
export function useRematchMutation(baseOptions?: Apollo.MutationHookOptions<RematchMutation, RematchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RematchMutation, RematchMutationVariables>(RematchDocument, options);
      }
export type RematchMutationHookResult = ReturnType<typeof useRematchMutation>;
export type RematchMutationResult = Apollo.MutationResult<RematchMutation>;
export type RematchMutationOptions = Apollo.BaseMutationOptions<RematchMutation, RematchMutationVariables>;
export const GetManufacturingPartnersDocument = gql`
    query GetManufacturingPartners($type: String, $capability: String) {
  manufacturingPartners(type: $type, capability: $capability) {
    id
    name
    slug
    type
    capabilities
    certifications
    capacityTier
    costRangeMin
    costRangeMax
    turnaroundWeeksMin
    turnaroundWeeksMax
    country
    regulatorySupport
    description
    contactUrl
    status
  }
}
    `;

/**
 * __useGetManufacturingPartnersQuery__
 *
 * To run a query within a React component, call `useGetManufacturingPartnersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetManufacturingPartnersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetManufacturingPartnersQuery({
 *   variables: {
 *      type: // value for 'type'
 *      capability: // value for 'capability'
 *   },
 * });
 */
export function useGetManufacturingPartnersQuery(baseOptions?: Apollo.QueryHookOptions<GetManufacturingPartnersQuery, GetManufacturingPartnersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetManufacturingPartnersQuery, GetManufacturingPartnersQueryVariables>(GetManufacturingPartnersDocument, options);
      }
export function useGetManufacturingPartnersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetManufacturingPartnersQuery, GetManufacturingPartnersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetManufacturingPartnersQuery, GetManufacturingPartnersQueryVariables>(GetManufacturingPartnersDocument, options);
        }
// @ts-ignore
export function useGetManufacturingPartnersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetManufacturingPartnersQuery, GetManufacturingPartnersQueryVariables>): Apollo.UseSuspenseQueryResult<GetManufacturingPartnersQuery, GetManufacturingPartnersQueryVariables>;
export function useGetManufacturingPartnersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetManufacturingPartnersQuery, GetManufacturingPartnersQueryVariables>): Apollo.UseSuspenseQueryResult<GetManufacturingPartnersQuery | undefined, GetManufacturingPartnersQueryVariables>;
export function useGetManufacturingPartnersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetManufacturingPartnersQuery, GetManufacturingPartnersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetManufacturingPartnersQuery, GetManufacturingPartnersQueryVariables>(GetManufacturingPartnersDocument, options);
        }
export type GetManufacturingPartnersQueryHookResult = ReturnType<typeof useGetManufacturingPartnersQuery>;
export type GetManufacturingPartnersLazyQueryHookResult = ReturnType<typeof useGetManufacturingPartnersLazyQuery>;
export type GetManufacturingPartnersSuspenseQueryHookResult = ReturnType<typeof useGetManufacturingPartnersSuspenseQuery>;
export type GetManufacturingPartnersQueryResult = Apollo.QueryResult<GetManufacturingPartnersQuery, GetManufacturingPartnersQueryVariables>;
export const GetManufacturingPartnerDocument = gql`
    query GetManufacturingPartner($id: String!) {
  manufacturingPartner(id: $id) {
    id
    name
    slug
    type
    capabilities
    certifications
    capacityTier
    costRangeMin
    costRangeMax
    turnaroundWeeksMin
    turnaroundWeeksMax
    country
    regulatorySupport
    description
    contactUrl
    status
  }
}
    `;

/**
 * __useGetManufacturingPartnerQuery__
 *
 * To run a query within a React component, call `useGetManufacturingPartnerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetManufacturingPartnerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetManufacturingPartnerQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetManufacturingPartnerQuery(baseOptions: Apollo.QueryHookOptions<GetManufacturingPartnerQuery, GetManufacturingPartnerQueryVariables> & ({ variables: GetManufacturingPartnerQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetManufacturingPartnerQuery, GetManufacturingPartnerQueryVariables>(GetManufacturingPartnerDocument, options);
      }
export function useGetManufacturingPartnerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetManufacturingPartnerQuery, GetManufacturingPartnerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetManufacturingPartnerQuery, GetManufacturingPartnerQueryVariables>(GetManufacturingPartnerDocument, options);
        }
// @ts-ignore
export function useGetManufacturingPartnerSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetManufacturingPartnerQuery, GetManufacturingPartnerQueryVariables>): Apollo.UseSuspenseQueryResult<GetManufacturingPartnerQuery, GetManufacturingPartnerQueryVariables>;
export function useGetManufacturingPartnerSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetManufacturingPartnerQuery, GetManufacturingPartnerQueryVariables>): Apollo.UseSuspenseQueryResult<GetManufacturingPartnerQuery | undefined, GetManufacturingPartnerQueryVariables>;
export function useGetManufacturingPartnerSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetManufacturingPartnerQuery, GetManufacturingPartnerQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetManufacturingPartnerQuery, GetManufacturingPartnerQueryVariables>(GetManufacturingPartnerDocument, options);
        }
export type GetManufacturingPartnerQueryHookResult = ReturnType<typeof useGetManufacturingPartnerQuery>;
export type GetManufacturingPartnerLazyQueryHookResult = ReturnType<typeof useGetManufacturingPartnerLazyQuery>;
export type GetManufacturingPartnerSuspenseQueryHookResult = ReturnType<typeof useGetManufacturingPartnerSuspenseQuery>;
export type GetManufacturingPartnerQueryResult = Apollo.QueryResult<GetManufacturingPartnerQuery, GetManufacturingPartnerQueryVariables>;
export const GetManufacturingOrdersDocument = gql`
    query GetManufacturingOrders {
  manufacturingOrders {
    id
    patientId
    partnerId
    pipelineJobId
    status
    quotePrice
    quoteCurrency
    quoteTurnaroundWeeks
    totalCost
    batchNumber
    trackingNumber
    partnerName
    message
    administeredAt
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetManufacturingOrdersQuery__
 *
 * To run a query within a React component, call `useGetManufacturingOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetManufacturingOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetManufacturingOrdersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetManufacturingOrdersQuery(baseOptions?: Apollo.QueryHookOptions<GetManufacturingOrdersQuery, GetManufacturingOrdersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetManufacturingOrdersQuery, GetManufacturingOrdersQueryVariables>(GetManufacturingOrdersDocument, options);
      }
export function useGetManufacturingOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetManufacturingOrdersQuery, GetManufacturingOrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetManufacturingOrdersQuery, GetManufacturingOrdersQueryVariables>(GetManufacturingOrdersDocument, options);
        }
// @ts-ignore
export function useGetManufacturingOrdersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetManufacturingOrdersQuery, GetManufacturingOrdersQueryVariables>): Apollo.UseSuspenseQueryResult<GetManufacturingOrdersQuery, GetManufacturingOrdersQueryVariables>;
export function useGetManufacturingOrdersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetManufacturingOrdersQuery, GetManufacturingOrdersQueryVariables>): Apollo.UseSuspenseQueryResult<GetManufacturingOrdersQuery | undefined, GetManufacturingOrdersQueryVariables>;
export function useGetManufacturingOrdersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetManufacturingOrdersQuery, GetManufacturingOrdersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetManufacturingOrdersQuery, GetManufacturingOrdersQueryVariables>(GetManufacturingOrdersDocument, options);
        }
export type GetManufacturingOrdersQueryHookResult = ReturnType<typeof useGetManufacturingOrdersQuery>;
export type GetManufacturingOrdersLazyQueryHookResult = ReturnType<typeof useGetManufacturingOrdersLazyQuery>;
export type GetManufacturingOrdersSuspenseQueryHookResult = ReturnType<typeof useGetManufacturingOrdersSuspenseQuery>;
export type GetManufacturingOrdersQueryResult = Apollo.QueryResult<GetManufacturingOrdersQuery, GetManufacturingOrdersQueryVariables>;
export const GetManufacturingOrderDocument = gql`
    query GetManufacturingOrder($id: String!) {
  manufacturingOrder(id: $id) {
    id
    patientId
    partnerId
    pipelineJobId
    status
    quotePrice
    quoteCurrency
    quoteTurnaroundWeeks
    totalCost
    batchNumber
    trackingNumber
    partnerName
    message
    quoteExpiresAt
    productionStartedAt
    productionEstimatedCompletion
    qcStartedAt
    qcCompletedAt
    qcPassed
    qcNotes
    shippedAt
    shippingCarrier
    shippingConditions
    deliveredAt
    administeredAt
    administeredBy
    paymentStatus
    assessmentId
    administrationSiteId
    notes
    partner {
      id
      name
      slug
      type
      contactUrl
    }
    administrationSite {
      id
      name
      city
      state
    }
    assessment {
      id
      recommended
      rationale
    }
    reports {
      id
      reportType
      daysPostAdministration
      hasAdverseEvents
      status
      createdAt
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetManufacturingOrderQuery__
 *
 * To run a query within a React component, call `useGetManufacturingOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetManufacturingOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetManufacturingOrderQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetManufacturingOrderQuery(baseOptions: Apollo.QueryHookOptions<GetManufacturingOrderQuery, GetManufacturingOrderQueryVariables> & ({ variables: GetManufacturingOrderQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetManufacturingOrderQuery, GetManufacturingOrderQueryVariables>(GetManufacturingOrderDocument, options);
      }
export function useGetManufacturingOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetManufacturingOrderQuery, GetManufacturingOrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetManufacturingOrderQuery, GetManufacturingOrderQueryVariables>(GetManufacturingOrderDocument, options);
        }
// @ts-ignore
export function useGetManufacturingOrderSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetManufacturingOrderQuery, GetManufacturingOrderQueryVariables>): Apollo.UseSuspenseQueryResult<GetManufacturingOrderQuery, GetManufacturingOrderQueryVariables>;
export function useGetManufacturingOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetManufacturingOrderQuery, GetManufacturingOrderQueryVariables>): Apollo.UseSuspenseQueryResult<GetManufacturingOrderQuery | undefined, GetManufacturingOrderQueryVariables>;
export function useGetManufacturingOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetManufacturingOrderQuery, GetManufacturingOrderQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetManufacturingOrderQuery, GetManufacturingOrderQueryVariables>(GetManufacturingOrderDocument, options);
        }
export type GetManufacturingOrderQueryHookResult = ReturnType<typeof useGetManufacturingOrderQuery>;
export type GetManufacturingOrderLazyQueryHookResult = ReturnType<typeof useGetManufacturingOrderLazyQuery>;
export type GetManufacturingOrderSuspenseQueryHookResult = ReturnType<typeof useGetManufacturingOrderSuspenseQuery>;
export type GetManufacturingOrderQueryResult = Apollo.QueryResult<GetManufacturingOrderQuery, GetManufacturingOrderQueryVariables>;
export const GetRecommendedPartnersDocument = gql`
    query GetRecommendedPartners($pipelineJobId: String!) {
  recommendedPartners(pipelineJobId: $pipelineJobId) {
    partnerId
    name
    slug
    type
    score
    reasons
    costRangeMin
    costRangeMax
    turnaroundWeeksMin
    turnaroundWeeksMax
    capabilities
    certifications
  }
}
    `;

/**
 * __useGetRecommendedPartnersQuery__
 *
 * To run a query within a React component, call `useGetRecommendedPartnersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecommendedPartnersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecommendedPartnersQuery({
 *   variables: {
 *      pipelineJobId: // value for 'pipelineJobId'
 *   },
 * });
 */
export function useGetRecommendedPartnersQuery(baseOptions: Apollo.QueryHookOptions<GetRecommendedPartnersQuery, GetRecommendedPartnersQueryVariables> & ({ variables: GetRecommendedPartnersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecommendedPartnersQuery, GetRecommendedPartnersQueryVariables>(GetRecommendedPartnersDocument, options);
      }
export function useGetRecommendedPartnersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecommendedPartnersQuery, GetRecommendedPartnersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecommendedPartnersQuery, GetRecommendedPartnersQueryVariables>(GetRecommendedPartnersDocument, options);
        }
// @ts-ignore
export function useGetRecommendedPartnersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecommendedPartnersQuery, GetRecommendedPartnersQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecommendedPartnersQuery, GetRecommendedPartnersQueryVariables>;
export function useGetRecommendedPartnersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecommendedPartnersQuery, GetRecommendedPartnersQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecommendedPartnersQuery | undefined, GetRecommendedPartnersQueryVariables>;
export function useGetRecommendedPartnersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecommendedPartnersQuery, GetRecommendedPartnersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecommendedPartnersQuery, GetRecommendedPartnersQueryVariables>(GetRecommendedPartnersDocument, options);
        }
export type GetRecommendedPartnersQueryHookResult = ReturnType<typeof useGetRecommendedPartnersQuery>;
export type GetRecommendedPartnersLazyQueryHookResult = ReturnType<typeof useGetRecommendedPartnersLazyQuery>;
export type GetRecommendedPartnersSuspenseQueryHookResult = ReturnType<typeof useGetRecommendedPartnersSuspenseQuery>;
export type GetRecommendedPartnersQueryResult = Apollo.QueryResult<GetRecommendedPartnersQuery, GetRecommendedPartnersQueryVariables>;
export const GetRegulatoryAssessmentsDocument = gql`
    query GetRegulatoryAssessments {
  regulatoryAssessments {
    id
    patientId
    recommended
    rationale
    alternatives
    requiredDocuments
    estimatedCostMin
    estimatedCostMax
    estimatedTimelineWeeks
    createdAt
  }
}
    `;

/**
 * __useGetRegulatoryAssessmentsQuery__
 *
 * To run a query within a React component, call `useGetRegulatoryAssessmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegulatoryAssessmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegulatoryAssessmentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRegulatoryAssessmentsQuery(baseOptions?: Apollo.QueryHookOptions<GetRegulatoryAssessmentsQuery, GetRegulatoryAssessmentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegulatoryAssessmentsQuery, GetRegulatoryAssessmentsQueryVariables>(GetRegulatoryAssessmentsDocument, options);
      }
export function useGetRegulatoryAssessmentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegulatoryAssessmentsQuery, GetRegulatoryAssessmentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegulatoryAssessmentsQuery, GetRegulatoryAssessmentsQueryVariables>(GetRegulatoryAssessmentsDocument, options);
        }
// @ts-ignore
export function useGetRegulatoryAssessmentsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRegulatoryAssessmentsQuery, GetRegulatoryAssessmentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetRegulatoryAssessmentsQuery, GetRegulatoryAssessmentsQueryVariables>;
export function useGetRegulatoryAssessmentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRegulatoryAssessmentsQuery, GetRegulatoryAssessmentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetRegulatoryAssessmentsQuery | undefined, GetRegulatoryAssessmentsQueryVariables>;
export function useGetRegulatoryAssessmentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRegulatoryAssessmentsQuery, GetRegulatoryAssessmentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRegulatoryAssessmentsQuery, GetRegulatoryAssessmentsQueryVariables>(GetRegulatoryAssessmentsDocument, options);
        }
export type GetRegulatoryAssessmentsQueryHookResult = ReturnType<typeof useGetRegulatoryAssessmentsQuery>;
export type GetRegulatoryAssessmentsLazyQueryHookResult = ReturnType<typeof useGetRegulatoryAssessmentsLazyQuery>;
export type GetRegulatoryAssessmentsSuspenseQueryHookResult = ReturnType<typeof useGetRegulatoryAssessmentsSuspenseQuery>;
export type GetRegulatoryAssessmentsQueryResult = Apollo.QueryResult<GetRegulatoryAssessmentsQuery, GetRegulatoryAssessmentsQueryVariables>;
export const GetRegulatoryAssessmentDocument = gql`
    query GetRegulatoryAssessment($id: String!) {
  regulatoryAssessment(id: $id) {
    id
    patientId
    recommended
    rationale
    alternatives
    requiredDocuments
    estimatedCostMin
    estimatedCostMax
    estimatedTimelineWeeks
    createdAt
  }
}
    `;

/**
 * __useGetRegulatoryAssessmentQuery__
 *
 * To run a query within a React component, call `useGetRegulatoryAssessmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegulatoryAssessmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegulatoryAssessmentQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetRegulatoryAssessmentQuery(baseOptions: Apollo.QueryHookOptions<GetRegulatoryAssessmentQuery, GetRegulatoryAssessmentQueryVariables> & ({ variables: GetRegulatoryAssessmentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegulatoryAssessmentQuery, GetRegulatoryAssessmentQueryVariables>(GetRegulatoryAssessmentDocument, options);
      }
export function useGetRegulatoryAssessmentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegulatoryAssessmentQuery, GetRegulatoryAssessmentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegulatoryAssessmentQuery, GetRegulatoryAssessmentQueryVariables>(GetRegulatoryAssessmentDocument, options);
        }
// @ts-ignore
export function useGetRegulatoryAssessmentSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRegulatoryAssessmentQuery, GetRegulatoryAssessmentQueryVariables>): Apollo.UseSuspenseQueryResult<GetRegulatoryAssessmentQuery, GetRegulatoryAssessmentQueryVariables>;
export function useGetRegulatoryAssessmentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRegulatoryAssessmentQuery, GetRegulatoryAssessmentQueryVariables>): Apollo.UseSuspenseQueryResult<GetRegulatoryAssessmentQuery | undefined, GetRegulatoryAssessmentQueryVariables>;
export function useGetRegulatoryAssessmentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRegulatoryAssessmentQuery, GetRegulatoryAssessmentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRegulatoryAssessmentQuery, GetRegulatoryAssessmentQueryVariables>(GetRegulatoryAssessmentDocument, options);
        }
export type GetRegulatoryAssessmentQueryHookResult = ReturnType<typeof useGetRegulatoryAssessmentQuery>;
export type GetRegulatoryAssessmentLazyQueryHookResult = ReturnType<typeof useGetRegulatoryAssessmentLazyQuery>;
export type GetRegulatoryAssessmentSuspenseQueryHookResult = ReturnType<typeof useGetRegulatoryAssessmentSuspenseQuery>;
export type GetRegulatoryAssessmentQueryResult = Apollo.QueryResult<GetRegulatoryAssessmentQuery, GetRegulatoryAssessmentQueryVariables>;
export const GetRegulatoryDocumentsDocument = gql`
    query GetRegulatoryDocuments($assessmentId: String!) {
  regulatoryDocuments(assessmentId: $assessmentId) {
    id
    assessmentId
    documentType
    content
    status
    reviewNotes
    reviewedAt
    reviewedBy
    createdAt
  }
}
    `;

/**
 * __useGetRegulatoryDocumentsQuery__
 *
 * To run a query within a React component, call `useGetRegulatoryDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegulatoryDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegulatoryDocumentsQuery({
 *   variables: {
 *      assessmentId: // value for 'assessmentId'
 *   },
 * });
 */
export function useGetRegulatoryDocumentsQuery(baseOptions: Apollo.QueryHookOptions<GetRegulatoryDocumentsQuery, GetRegulatoryDocumentsQueryVariables> & ({ variables: GetRegulatoryDocumentsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegulatoryDocumentsQuery, GetRegulatoryDocumentsQueryVariables>(GetRegulatoryDocumentsDocument, options);
      }
export function useGetRegulatoryDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegulatoryDocumentsQuery, GetRegulatoryDocumentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegulatoryDocumentsQuery, GetRegulatoryDocumentsQueryVariables>(GetRegulatoryDocumentsDocument, options);
        }
// @ts-ignore
export function useGetRegulatoryDocumentsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRegulatoryDocumentsQuery, GetRegulatoryDocumentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetRegulatoryDocumentsQuery, GetRegulatoryDocumentsQueryVariables>;
export function useGetRegulatoryDocumentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRegulatoryDocumentsQuery, GetRegulatoryDocumentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetRegulatoryDocumentsQuery | undefined, GetRegulatoryDocumentsQueryVariables>;
export function useGetRegulatoryDocumentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRegulatoryDocumentsQuery, GetRegulatoryDocumentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRegulatoryDocumentsQuery, GetRegulatoryDocumentsQueryVariables>(GetRegulatoryDocumentsDocument, options);
        }
export type GetRegulatoryDocumentsQueryHookResult = ReturnType<typeof useGetRegulatoryDocumentsQuery>;
export type GetRegulatoryDocumentsLazyQueryHookResult = ReturnType<typeof useGetRegulatoryDocumentsLazyQuery>;
export type GetRegulatoryDocumentsSuspenseQueryHookResult = ReturnType<typeof useGetRegulatoryDocumentsSuspenseQuery>;
export type GetRegulatoryDocumentsQueryResult = Apollo.QueryResult<GetRegulatoryDocumentsQuery, GetRegulatoryDocumentsQueryVariables>;
export const GetRegulatoryDocumentDocument = gql`
    query GetRegulatoryDocument($id: String!) {
  regulatoryDocument(id: $id) {
    id
    assessmentId
    documentType
    content
    status
    reviewNotes
    reviewedAt
    reviewedBy
    createdAt
  }
}
    `;

/**
 * __useGetRegulatoryDocumentQuery__
 *
 * To run a query within a React component, call `useGetRegulatoryDocumentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegulatoryDocumentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegulatoryDocumentQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetRegulatoryDocumentQuery(baseOptions: Apollo.QueryHookOptions<GetRegulatoryDocumentQuery, GetRegulatoryDocumentQueryVariables> & ({ variables: GetRegulatoryDocumentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegulatoryDocumentQuery, GetRegulatoryDocumentQueryVariables>(GetRegulatoryDocumentDocument, options);
      }
export function useGetRegulatoryDocumentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegulatoryDocumentQuery, GetRegulatoryDocumentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegulatoryDocumentQuery, GetRegulatoryDocumentQueryVariables>(GetRegulatoryDocumentDocument, options);
        }
// @ts-ignore
export function useGetRegulatoryDocumentSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRegulatoryDocumentQuery, GetRegulatoryDocumentQueryVariables>): Apollo.UseSuspenseQueryResult<GetRegulatoryDocumentQuery, GetRegulatoryDocumentQueryVariables>;
export function useGetRegulatoryDocumentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRegulatoryDocumentQuery, GetRegulatoryDocumentQueryVariables>): Apollo.UseSuspenseQueryResult<GetRegulatoryDocumentQuery | undefined, GetRegulatoryDocumentQueryVariables>;
export function useGetRegulatoryDocumentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRegulatoryDocumentQuery, GetRegulatoryDocumentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRegulatoryDocumentQuery, GetRegulatoryDocumentQueryVariables>(GetRegulatoryDocumentDocument, options);
        }
export type GetRegulatoryDocumentQueryHookResult = ReturnType<typeof useGetRegulatoryDocumentQuery>;
export type GetRegulatoryDocumentLazyQueryHookResult = ReturnType<typeof useGetRegulatoryDocumentLazyQuery>;
export type GetRegulatoryDocumentSuspenseQueryHookResult = ReturnType<typeof useGetRegulatoryDocumentSuspenseQuery>;
export type GetRegulatoryDocumentQueryResult = Apollo.QueryResult<GetRegulatoryDocumentQuery, GetRegulatoryDocumentQueryVariables>;
export const CreateManufacturingOrderDocument = gql`
    mutation CreateManufacturingOrder($partnerId: String!, $pipelineJobId: String!) {
  createManufacturingOrder(partnerId: $partnerId, pipelineJobId: $pipelineJobId) {
    id
    status
    createdAt
  }
}
    `;
export type CreateManufacturingOrderMutationFn = Apollo.MutationFunction<CreateManufacturingOrderMutation, CreateManufacturingOrderMutationVariables>;

/**
 * __useCreateManufacturingOrderMutation__
 *
 * To run a mutation, you first call `useCreateManufacturingOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateManufacturingOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createManufacturingOrderMutation, { data, loading, error }] = useCreateManufacturingOrderMutation({
 *   variables: {
 *      partnerId: // value for 'partnerId'
 *      pipelineJobId: // value for 'pipelineJobId'
 *   },
 * });
 */
export function useCreateManufacturingOrderMutation(baseOptions?: Apollo.MutationHookOptions<CreateManufacturingOrderMutation, CreateManufacturingOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateManufacturingOrderMutation, CreateManufacturingOrderMutationVariables>(CreateManufacturingOrderDocument, options);
      }
export type CreateManufacturingOrderMutationHookResult = ReturnType<typeof useCreateManufacturingOrderMutation>;
export type CreateManufacturingOrderMutationResult = Apollo.MutationResult<CreateManufacturingOrderMutation>;
export type CreateManufacturingOrderMutationOptions = Apollo.BaseMutationOptions<CreateManufacturingOrderMutation, CreateManufacturingOrderMutationVariables>;
export const UpdateManufacturingOrderStatusDocument = gql`
    mutation UpdateManufacturingOrderStatus($orderId: String!, $status: String!, $notes: String) {
  updateManufacturingOrderStatus(
    orderId: $orderId
    status: $status
    notes: $notes
  ) {
    id
    status
    updatedAt
  }
}
    `;
export type UpdateManufacturingOrderStatusMutationFn = Apollo.MutationFunction<UpdateManufacturingOrderStatusMutation, UpdateManufacturingOrderStatusMutationVariables>;

/**
 * __useUpdateManufacturingOrderStatusMutation__
 *
 * To run a mutation, you first call `useUpdateManufacturingOrderStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateManufacturingOrderStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateManufacturingOrderStatusMutation, { data, loading, error }] = useUpdateManufacturingOrderStatusMutation({
 *   variables: {
 *      orderId: // value for 'orderId'
 *      status: // value for 'status'
 *      notes: // value for 'notes'
 *   },
 * });
 */
export function useUpdateManufacturingOrderStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateManufacturingOrderStatusMutation, UpdateManufacturingOrderStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateManufacturingOrderStatusMutation, UpdateManufacturingOrderStatusMutationVariables>(UpdateManufacturingOrderStatusDocument, options);
      }
export type UpdateManufacturingOrderStatusMutationHookResult = ReturnType<typeof useUpdateManufacturingOrderStatusMutation>;
export type UpdateManufacturingOrderStatusMutationResult = Apollo.MutationResult<UpdateManufacturingOrderStatusMutation>;
export type UpdateManufacturingOrderStatusMutationOptions = Apollo.BaseMutationOptions<UpdateManufacturingOrderStatusMutation, UpdateManufacturingOrderStatusMutationVariables>;
export const AcceptQuoteDocument = gql`
    mutation AcceptQuote($orderId: String!) {
  acceptQuote(orderId: $orderId) {
    id
    status
    updatedAt
  }
}
    `;
export type AcceptQuoteMutationFn = Apollo.MutationFunction<AcceptQuoteMutation, AcceptQuoteMutationVariables>;

/**
 * __useAcceptQuoteMutation__
 *
 * To run a mutation, you first call `useAcceptQuoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAcceptQuoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [acceptQuoteMutation, { data, loading, error }] = useAcceptQuoteMutation({
 *   variables: {
 *      orderId: // value for 'orderId'
 *   },
 * });
 */
export function useAcceptQuoteMutation(baseOptions?: Apollo.MutationHookOptions<AcceptQuoteMutation, AcceptQuoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AcceptQuoteMutation, AcceptQuoteMutationVariables>(AcceptQuoteDocument, options);
      }
export type AcceptQuoteMutationHookResult = ReturnType<typeof useAcceptQuoteMutation>;
export type AcceptQuoteMutationResult = Apollo.MutationResult<AcceptQuoteMutation>;
export type AcceptQuoteMutationOptions = Apollo.BaseMutationOptions<AcceptQuoteMutation, AcceptQuoteMutationVariables>;
export const ConnectSiteDocument = gql`
    mutation ConnectSite($orderId: String!, $siteId: String!) {
  connectSite(orderId: $orderId, siteId: $siteId) {
    id
    status
    updatedAt
  }
}
    `;
export type ConnectSiteMutationFn = Apollo.MutationFunction<ConnectSiteMutation, ConnectSiteMutationVariables>;

/**
 * __useConnectSiteMutation__
 *
 * To run a mutation, you first call `useConnectSiteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConnectSiteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [connectSiteMutation, { data, loading, error }] = useConnectSiteMutation({
 *   variables: {
 *      orderId: // value for 'orderId'
 *      siteId: // value for 'siteId'
 *   },
 * });
 */
export function useConnectSiteMutation(baseOptions?: Apollo.MutationHookOptions<ConnectSiteMutation, ConnectSiteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConnectSiteMutation, ConnectSiteMutationVariables>(ConnectSiteDocument, options);
      }
export type ConnectSiteMutationHookResult = ReturnType<typeof useConnectSiteMutation>;
export type ConnectSiteMutationResult = Apollo.MutationResult<ConnectSiteMutation>;
export type ConnectSiteMutationOptions = Apollo.BaseMutationOptions<ConnectSiteMutation, ConnectSiteMutationVariables>;
export const AddOrderNoteDocument = gql`
    mutation AddOrderNote($orderId: String!, $note: String!) {
  addOrderNote(orderId: $orderId, note: $note) {
    id
    updatedAt
  }
}
    `;
export type AddOrderNoteMutationFn = Apollo.MutationFunction<AddOrderNoteMutation, AddOrderNoteMutationVariables>;

/**
 * __useAddOrderNoteMutation__
 *
 * To run a mutation, you first call `useAddOrderNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddOrderNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addOrderNoteMutation, { data, loading, error }] = useAddOrderNoteMutation({
 *   variables: {
 *      orderId: // value for 'orderId'
 *      note: // value for 'note'
 *   },
 * });
 */
export function useAddOrderNoteMutation(baseOptions?: Apollo.MutationHookOptions<AddOrderNoteMutation, AddOrderNoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddOrderNoteMutation, AddOrderNoteMutationVariables>(AddOrderNoteDocument, options);
      }
export type AddOrderNoteMutationHookResult = ReturnType<typeof useAddOrderNoteMutation>;
export type AddOrderNoteMutationResult = Apollo.MutationResult<AddOrderNoteMutation>;
export type AddOrderNoteMutationOptions = Apollo.BaseMutationOptions<AddOrderNoteMutation, AddOrderNoteMutationVariables>;
export const AssessRegulatoryPathwayDocument = gql`
    mutation AssessRegulatoryPathway($input: PathwayAssessmentInput!) {
  assessRegulatoryPathway(input: $input) {
    id
    recommended
    rationale
    alternatives
    requiredDocuments
    estimatedCostMin
    estimatedCostMax
    estimatedTimelineWeeks
  }
}
    `;
export type AssessRegulatoryPathwayMutationFn = Apollo.MutationFunction<AssessRegulatoryPathwayMutation, AssessRegulatoryPathwayMutationVariables>;

/**
 * __useAssessRegulatoryPathwayMutation__
 *
 * To run a mutation, you first call `useAssessRegulatoryPathwayMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssessRegulatoryPathwayMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assessRegulatoryPathwayMutation, { data, loading, error }] = useAssessRegulatoryPathwayMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssessRegulatoryPathwayMutation(baseOptions?: Apollo.MutationHookOptions<AssessRegulatoryPathwayMutation, AssessRegulatoryPathwayMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AssessRegulatoryPathwayMutation, AssessRegulatoryPathwayMutationVariables>(AssessRegulatoryPathwayDocument, options);
      }
export type AssessRegulatoryPathwayMutationHookResult = ReturnType<typeof useAssessRegulatoryPathwayMutation>;
export type AssessRegulatoryPathwayMutationResult = Apollo.MutationResult<AssessRegulatoryPathwayMutation>;
export type AssessRegulatoryPathwayMutationOptions = Apollo.BaseMutationOptions<AssessRegulatoryPathwayMutation, AssessRegulatoryPathwayMutationVariables>;
export const GenerateRegulatoryDocumentDocument = gql`
    mutation GenerateRegulatoryDocument($assessmentId: String!, $documentType: String!) {
  generateRegulatoryDocument(
    assessmentId: $assessmentId
    documentType: $documentType
  ) {
    id
    documentType
    content
    status
  }
}
    `;
export type GenerateRegulatoryDocumentMutationFn = Apollo.MutationFunction<GenerateRegulatoryDocumentMutation, GenerateRegulatoryDocumentMutationVariables>;

/**
 * __useGenerateRegulatoryDocumentMutation__
 *
 * To run a mutation, you first call `useGenerateRegulatoryDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateRegulatoryDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateRegulatoryDocumentMutation, { data, loading, error }] = useGenerateRegulatoryDocumentMutation({
 *   variables: {
 *      assessmentId: // value for 'assessmentId'
 *      documentType: // value for 'documentType'
 *   },
 * });
 */
export function useGenerateRegulatoryDocumentMutation(baseOptions?: Apollo.MutationHookOptions<GenerateRegulatoryDocumentMutation, GenerateRegulatoryDocumentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateRegulatoryDocumentMutation, GenerateRegulatoryDocumentMutationVariables>(GenerateRegulatoryDocumentDocument, options);
      }
export type GenerateRegulatoryDocumentMutationHookResult = ReturnType<typeof useGenerateRegulatoryDocumentMutation>;
export type GenerateRegulatoryDocumentMutationResult = Apollo.MutationResult<GenerateRegulatoryDocumentMutation>;
export type GenerateRegulatoryDocumentMutationOptions = Apollo.BaseMutationOptions<GenerateRegulatoryDocumentMutation, GenerateRegulatoryDocumentMutationVariables>;
export const UpdateRegulatoryDocumentStatusDocument = gql`
    mutation UpdateRegulatoryDocumentStatus($id: String!, $status: String!, $reviewNotes: String) {
  updateRegulatoryDocumentStatus(
    id: $id
    status: $status
    reviewNotes: $reviewNotes
  ) {
    id
    status
    reviewNotes
    reviewedAt
  }
}
    `;
export type UpdateRegulatoryDocumentStatusMutationFn = Apollo.MutationFunction<UpdateRegulatoryDocumentStatusMutation, UpdateRegulatoryDocumentStatusMutationVariables>;

/**
 * __useUpdateRegulatoryDocumentStatusMutation__
 *
 * To run a mutation, you first call `useUpdateRegulatoryDocumentStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRegulatoryDocumentStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRegulatoryDocumentStatusMutation, { data, loading, error }] = useUpdateRegulatoryDocumentStatusMutation({
 *   variables: {
 *      id: // value for 'id'
 *      status: // value for 'status'
 *      reviewNotes: // value for 'reviewNotes'
 *   },
 * });
 */
export function useUpdateRegulatoryDocumentStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateRegulatoryDocumentStatusMutation, UpdateRegulatoryDocumentStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateRegulatoryDocumentStatusMutation, UpdateRegulatoryDocumentStatusMutationVariables>(UpdateRegulatoryDocumentStatusDocument, options);
      }
export type UpdateRegulatoryDocumentStatusMutationHookResult = ReturnType<typeof useUpdateRegulatoryDocumentStatusMutation>;
export type UpdateRegulatoryDocumentStatusMutationResult = Apollo.MutationResult<UpdateRegulatoryDocumentStatusMutation>;
export type UpdateRegulatoryDocumentStatusMutationOptions = Apollo.BaseMutationOptions<UpdateRegulatoryDocumentStatusMutation, UpdateRegulatoryDocumentStatusMutationVariables>;
export const GetMatchesDocument = gql`
    query GetMatches {
  matches {
    id
    patientId
    trialId
    matchScore
    matchBreakdown {
      category
      score
      weight
      status
      reason
    }
    potentialBlockers
    llmAssessment {
      overallAssessment
      reasoning
      potentialBlockers
      missingInfo
      actionItems
    }
    status
    trial {
      id
      nctId
      title
      phase
      status
      sponsor
      briefSummary
    }
    createdAt
  }
}
    `;

/**
 * __useGetMatchesQuery__
 *
 * To run a query within a React component, call `useGetMatchesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMatchesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMatchesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMatchesQuery(baseOptions?: Apollo.QueryHookOptions<GetMatchesQuery, GetMatchesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMatchesQuery, GetMatchesQueryVariables>(GetMatchesDocument, options);
      }
export function useGetMatchesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMatchesQuery, GetMatchesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMatchesQuery, GetMatchesQueryVariables>(GetMatchesDocument, options);
        }
// @ts-ignore
export function useGetMatchesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetMatchesQuery, GetMatchesQueryVariables>): Apollo.UseSuspenseQueryResult<GetMatchesQuery, GetMatchesQueryVariables>;
export function useGetMatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMatchesQuery, GetMatchesQueryVariables>): Apollo.UseSuspenseQueryResult<GetMatchesQuery | undefined, GetMatchesQueryVariables>;
export function useGetMatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMatchesQuery, GetMatchesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMatchesQuery, GetMatchesQueryVariables>(GetMatchesDocument, options);
        }
export type GetMatchesQueryHookResult = ReturnType<typeof useGetMatchesQuery>;
export type GetMatchesLazyQueryHookResult = ReturnType<typeof useGetMatchesLazyQuery>;
export type GetMatchesSuspenseQueryHookResult = ReturnType<typeof useGetMatchesSuspenseQuery>;
export type GetMatchesQueryResult = Apollo.QueryResult<GetMatchesQuery, GetMatchesQueryVariables>;
export const GetMatchDocument = gql`
    query GetMatch($id: String!) {
  match(id: $id) {
    id
    patientId
    trialId
    matchScore
    matchBreakdown {
      category
      score
      weight
      status
      reason
    }
    potentialBlockers
    llmAssessment {
      overallAssessment
      reasoning
      potentialBlockers
      missingInfo
      actionItems
    }
    status
    trial {
      id
      nctId
      title
      phase
      status
      conditions
      interventions
      sponsor
      locations
      eligibilityCriteria
      parsedEligibility
      briefSummary
    }
    createdAt
  }
}
    `;

/**
 * __useGetMatchQuery__
 *
 * To run a query within a React component, call `useGetMatchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMatchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMatchQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetMatchQuery(baseOptions: Apollo.QueryHookOptions<GetMatchQuery, GetMatchQueryVariables> & ({ variables: GetMatchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMatchQuery, GetMatchQueryVariables>(GetMatchDocument, options);
      }
export function useGetMatchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMatchQuery, GetMatchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMatchQuery, GetMatchQueryVariables>(GetMatchDocument, options);
        }
// @ts-ignore
export function useGetMatchSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetMatchQuery, GetMatchQueryVariables>): Apollo.UseSuspenseQueryResult<GetMatchQuery, GetMatchQueryVariables>;
export function useGetMatchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMatchQuery, GetMatchQueryVariables>): Apollo.UseSuspenseQueryResult<GetMatchQuery | undefined, GetMatchQueryVariables>;
export function useGetMatchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMatchQuery, GetMatchQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMatchQuery, GetMatchQueryVariables>(GetMatchDocument, options);
        }
export type GetMatchQueryHookResult = ReturnType<typeof useGetMatchQuery>;
export type GetMatchLazyQueryHookResult = ReturnType<typeof useGetMatchLazyQuery>;
export type GetMatchSuspenseQueryHookResult = ReturnType<typeof useGetMatchSuspenseQuery>;
export type GetMatchQueryResult = Apollo.QueryResult<GetMatchQuery, GetMatchQueryVariables>;
export const GetOncologistBriefDocument = gql`
    query GetOncologistBrief($matchId: String!) {
  oncologistBrief(matchId: $matchId) {
    content
    matchId
    generatedAt
  }
}
    `;

/**
 * __useGetOncologistBriefQuery__
 *
 * To run a query within a React component, call `useGetOncologistBriefQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOncologistBriefQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOncologistBriefQuery({
 *   variables: {
 *      matchId: // value for 'matchId'
 *   },
 * });
 */
export function useGetOncologistBriefQuery(baseOptions: Apollo.QueryHookOptions<GetOncologistBriefQuery, GetOncologistBriefQueryVariables> & ({ variables: GetOncologistBriefQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOncologistBriefQuery, GetOncologistBriefQueryVariables>(GetOncologistBriefDocument, options);
      }
export function useGetOncologistBriefLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOncologistBriefQuery, GetOncologistBriefQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOncologistBriefQuery, GetOncologistBriefQueryVariables>(GetOncologistBriefDocument, options);
        }
// @ts-ignore
export function useGetOncologistBriefSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetOncologistBriefQuery, GetOncologistBriefQueryVariables>): Apollo.UseSuspenseQueryResult<GetOncologistBriefQuery, GetOncologistBriefQueryVariables>;
export function useGetOncologistBriefSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOncologistBriefQuery, GetOncologistBriefQueryVariables>): Apollo.UseSuspenseQueryResult<GetOncologistBriefQuery | undefined, GetOncologistBriefQueryVariables>;
export function useGetOncologistBriefSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOncologistBriefQuery, GetOncologistBriefQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOncologistBriefQuery, GetOncologistBriefQueryVariables>(GetOncologistBriefDocument, options);
        }
export type GetOncologistBriefQueryHookResult = ReturnType<typeof useGetOncologistBriefQuery>;
export type GetOncologistBriefLazyQueryHookResult = ReturnType<typeof useGetOncologistBriefLazyQuery>;
export type GetOncologistBriefSuspenseQueryHookResult = ReturnType<typeof useGetOncologistBriefSuspenseQuery>;
export type GetOncologistBriefQueryResult = Apollo.QueryResult<GetOncologistBriefQuery, GetOncologistBriefQueryVariables>;
export const GenerateMatchesDocument = gql`
    mutation GenerateMatches {
  generateMatches {
    id
    matchScore
    status
    trial {
      id
      nctId
      title
      phase
    }
  }
}
    `;
export type GenerateMatchesMutationFn = Apollo.MutationFunction<GenerateMatchesMutation, GenerateMatchesMutationVariables>;

/**
 * __useGenerateMatchesMutation__
 *
 * To run a mutation, you first call `useGenerateMatchesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateMatchesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateMatchesMutation, { data, loading, error }] = useGenerateMatchesMutation({
 *   variables: {
 *   },
 * });
 */
export function useGenerateMatchesMutation(baseOptions?: Apollo.MutationHookOptions<GenerateMatchesMutation, GenerateMatchesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateMatchesMutation, GenerateMatchesMutationVariables>(GenerateMatchesDocument, options);
      }
export type GenerateMatchesMutationHookResult = ReturnType<typeof useGenerateMatchesMutation>;
export type GenerateMatchesMutationResult = Apollo.MutationResult<GenerateMatchesMutation>;
export type GenerateMatchesMutationOptions = Apollo.BaseMutationOptions<GenerateMatchesMutation, GenerateMatchesMutationVariables>;
export const UpdateMatchStatusDocument = gql`
    mutation UpdateMatchStatus($matchId: String!, $status: String!) {
  updateMatchStatus(matchId: $matchId, status: $status) {
    id
    status
  }
}
    `;
export type UpdateMatchStatusMutationFn = Apollo.MutationFunction<UpdateMatchStatusMutation, UpdateMatchStatusMutationVariables>;

/**
 * __useUpdateMatchStatusMutation__
 *
 * To run a mutation, you first call `useUpdateMatchStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMatchStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMatchStatusMutation, { data, loading, error }] = useUpdateMatchStatusMutation({
 *   variables: {
 *      matchId: // value for 'matchId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdateMatchStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMatchStatusMutation, UpdateMatchStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMatchStatusMutation, UpdateMatchStatusMutationVariables>(UpdateMatchStatusDocument, options);
      }
export type UpdateMatchStatusMutationHookResult = ReturnType<typeof useUpdateMatchStatusMutation>;
export type UpdateMatchStatusMutationResult = Apollo.MutationResult<UpdateMatchStatusMutation>;
export type UpdateMatchStatusMutationOptions = Apollo.BaseMutationOptions<UpdateMatchStatusMutation, UpdateMatchStatusMutationVariables>;
export const TranslateTreatmentDocument = gql`
    mutation TranslateTreatment($matchId: String!) {
  translateTreatment(matchId: $matchId) {
    diagnosis
    treatmentPlan
    timeline
    questionsForDoctor {
      question
      whyItMatters
    }
    additionalConsiderations
    secondOpinionTriggers {
      reason
      level
    }
    generatedAt
  }
}
    `;
export type TranslateTreatmentMutationFn = Apollo.MutationFunction<TranslateTreatmentMutation, TranslateTreatmentMutationVariables>;

/**
 * __useTranslateTreatmentMutation__
 *
 * To run a mutation, you first call `useTranslateTreatmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTranslateTreatmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [translateTreatmentMutation, { data, loading, error }] = useTranslateTreatmentMutation({
 *   variables: {
 *      matchId: // value for 'matchId'
 *   },
 * });
 */
export function useTranslateTreatmentMutation(baseOptions?: Apollo.MutationHookOptions<TranslateTreatmentMutation, TranslateTreatmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TranslateTreatmentMutation, TranslateTreatmentMutationVariables>(TranslateTreatmentDocument, options);
      }
export type TranslateTreatmentMutationHookResult = ReturnType<typeof useTranslateTreatmentMutation>;
export type TranslateTreatmentMutationResult = Apollo.MutationResult<TranslateTreatmentMutation>;
export type TranslateTreatmentMutationOptions = Apollo.BaseMutationOptions<TranslateTreatmentMutation, TranslateTreatmentMutationVariables>;
export const GetAdministrationSitesDocument = gql`
    query GetAdministrationSites($lat: Float, $lng: Float, $radiusMiles: Float) {
  administrationSites(lat: $lat, lng: $lng, radiusMiles: $radiusMiles) {
    id
    name
    type
    city
    state
    distance
    canAdministerMrna
    hasInfusionCenter
    hasEmergencyResponse
    hasMonitoringCapacity
    investigationalExp
    irbAffiliation
    verified
    contactPhone
    website
  }
}
    `;

/**
 * __useGetAdministrationSitesQuery__
 *
 * To run a query within a React component, call `useGetAdministrationSitesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAdministrationSitesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAdministrationSitesQuery({
 *   variables: {
 *      lat: // value for 'lat'
 *      lng: // value for 'lng'
 *      radiusMiles: // value for 'radiusMiles'
 *   },
 * });
 */
export function useGetAdministrationSitesQuery(baseOptions?: Apollo.QueryHookOptions<GetAdministrationSitesQuery, GetAdministrationSitesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAdministrationSitesQuery, GetAdministrationSitesQueryVariables>(GetAdministrationSitesDocument, options);
      }
export function useGetAdministrationSitesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAdministrationSitesQuery, GetAdministrationSitesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAdministrationSitesQuery, GetAdministrationSitesQueryVariables>(GetAdministrationSitesDocument, options);
        }
// @ts-ignore
export function useGetAdministrationSitesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAdministrationSitesQuery, GetAdministrationSitesQueryVariables>): Apollo.UseSuspenseQueryResult<GetAdministrationSitesQuery, GetAdministrationSitesQueryVariables>;
export function useGetAdministrationSitesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAdministrationSitesQuery, GetAdministrationSitesQueryVariables>): Apollo.UseSuspenseQueryResult<GetAdministrationSitesQuery | undefined, GetAdministrationSitesQueryVariables>;
export function useGetAdministrationSitesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAdministrationSitesQuery, GetAdministrationSitesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAdministrationSitesQuery, GetAdministrationSitesQueryVariables>(GetAdministrationSitesDocument, options);
        }
export type GetAdministrationSitesQueryHookResult = ReturnType<typeof useGetAdministrationSitesQuery>;
export type GetAdministrationSitesLazyQueryHookResult = ReturnType<typeof useGetAdministrationSitesLazyQuery>;
export type GetAdministrationSitesSuspenseQueryHookResult = ReturnType<typeof useGetAdministrationSitesSuspenseQuery>;
export type GetAdministrationSitesQueryResult = Apollo.QueryResult<GetAdministrationSitesQuery, GetAdministrationSitesQueryVariables>;
export const GetAdministrationSiteDocument = gql`
    query GetAdministrationSite($id: String!) {
  administrationSite(id: $id) {
    id
    name
    type
    city
    state
    address
    zip
    country
    lat
    lng
    canAdministerMrna
    hasInfusionCenter
    hasEmergencyResponse
    hasMonitoringCapacity
    investigationalExp
    irbAffiliation
    verified
    contactName
    contactEmail
    contactPhone
    willingToAdminister
    website
  }
}
    `;

/**
 * __useGetAdministrationSiteQuery__
 *
 * To run a query within a React component, call `useGetAdministrationSiteQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAdministrationSiteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAdministrationSiteQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetAdministrationSiteQuery(baseOptions: Apollo.QueryHookOptions<GetAdministrationSiteQuery, GetAdministrationSiteQueryVariables> & ({ variables: GetAdministrationSiteQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAdministrationSiteQuery, GetAdministrationSiteQueryVariables>(GetAdministrationSiteDocument, options);
      }
export function useGetAdministrationSiteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAdministrationSiteQuery, GetAdministrationSiteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAdministrationSiteQuery, GetAdministrationSiteQueryVariables>(GetAdministrationSiteDocument, options);
        }
// @ts-ignore
export function useGetAdministrationSiteSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAdministrationSiteQuery, GetAdministrationSiteQueryVariables>): Apollo.UseSuspenseQueryResult<GetAdministrationSiteQuery, GetAdministrationSiteQueryVariables>;
export function useGetAdministrationSiteSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAdministrationSiteQuery, GetAdministrationSiteQueryVariables>): Apollo.UseSuspenseQueryResult<GetAdministrationSiteQuery | undefined, GetAdministrationSiteQueryVariables>;
export function useGetAdministrationSiteSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAdministrationSiteQuery, GetAdministrationSiteQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAdministrationSiteQuery, GetAdministrationSiteQueryVariables>(GetAdministrationSiteDocument, options);
        }
export type GetAdministrationSiteQueryHookResult = ReturnType<typeof useGetAdministrationSiteQuery>;
export type GetAdministrationSiteLazyQueryHookResult = ReturnType<typeof useGetAdministrationSiteLazyQuery>;
export type GetAdministrationSiteSuspenseQueryHookResult = ReturnType<typeof useGetAdministrationSiteSuspenseQuery>;
export type GetAdministrationSiteQueryResult = Apollo.QueryResult<GetAdministrationSiteQuery, GetAdministrationSiteQueryVariables>;
export const GetMonitoringReportsDocument = gql`
    query GetMonitoringReports($orderId: String!) {
  monitoringReports(orderId: $orderId) {
    id
    orderId
    reportType
    daysPostAdministration
    hasAdverseEvents
    adverseEvents {
      event
      severity
      onset
      duration
      resolved
      treatment
    }
    temperature
    bloodPressure
    heartRate
    qualityOfLifeScore
    tumorResponse
    narrative
    status
    createdAt
  }
}
    `;

/**
 * __useGetMonitoringReportsQuery__
 *
 * To run a query within a React component, call `useGetMonitoringReportsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMonitoringReportsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMonitoringReportsQuery({
 *   variables: {
 *      orderId: // value for 'orderId'
 *   },
 * });
 */
export function useGetMonitoringReportsQuery(baseOptions: Apollo.QueryHookOptions<GetMonitoringReportsQuery, GetMonitoringReportsQueryVariables> & ({ variables: GetMonitoringReportsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMonitoringReportsQuery, GetMonitoringReportsQueryVariables>(GetMonitoringReportsDocument, options);
      }
export function useGetMonitoringReportsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMonitoringReportsQuery, GetMonitoringReportsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMonitoringReportsQuery, GetMonitoringReportsQueryVariables>(GetMonitoringReportsDocument, options);
        }
// @ts-ignore
export function useGetMonitoringReportsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetMonitoringReportsQuery, GetMonitoringReportsQueryVariables>): Apollo.UseSuspenseQueryResult<GetMonitoringReportsQuery, GetMonitoringReportsQueryVariables>;
export function useGetMonitoringReportsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMonitoringReportsQuery, GetMonitoringReportsQueryVariables>): Apollo.UseSuspenseQueryResult<GetMonitoringReportsQuery | undefined, GetMonitoringReportsQueryVariables>;
export function useGetMonitoringReportsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMonitoringReportsQuery, GetMonitoringReportsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMonitoringReportsQuery, GetMonitoringReportsQueryVariables>(GetMonitoringReportsDocument, options);
        }
export type GetMonitoringReportsQueryHookResult = ReturnType<typeof useGetMonitoringReportsQuery>;
export type GetMonitoringReportsLazyQueryHookResult = ReturnType<typeof useGetMonitoringReportsLazyQuery>;
export type GetMonitoringReportsSuspenseQueryHookResult = ReturnType<typeof useGetMonitoringReportsSuspenseQuery>;
export type GetMonitoringReportsQueryResult = Apollo.QueryResult<GetMonitoringReportsQuery, GetMonitoringReportsQueryVariables>;
export const GetMonitoringScheduleDocument = gql`
    query GetMonitoringSchedule($orderId: String!) {
  monitoringSchedule(orderId: $orderId) {
    reportType
    daysAfter
    required
    description
    dueDate
    status
    submittedAt
  }
}
    `;

/**
 * __useGetMonitoringScheduleQuery__
 *
 * To run a query within a React component, call `useGetMonitoringScheduleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMonitoringScheduleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMonitoringScheduleQuery({
 *   variables: {
 *      orderId: // value for 'orderId'
 *   },
 * });
 */
export function useGetMonitoringScheduleQuery(baseOptions: Apollo.QueryHookOptions<GetMonitoringScheduleQuery, GetMonitoringScheduleQueryVariables> & ({ variables: GetMonitoringScheduleQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMonitoringScheduleQuery, GetMonitoringScheduleQueryVariables>(GetMonitoringScheduleDocument, options);
      }
export function useGetMonitoringScheduleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMonitoringScheduleQuery, GetMonitoringScheduleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMonitoringScheduleQuery, GetMonitoringScheduleQueryVariables>(GetMonitoringScheduleDocument, options);
        }
// @ts-ignore
export function useGetMonitoringScheduleSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetMonitoringScheduleQuery, GetMonitoringScheduleQueryVariables>): Apollo.UseSuspenseQueryResult<GetMonitoringScheduleQuery, GetMonitoringScheduleQueryVariables>;
export function useGetMonitoringScheduleSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMonitoringScheduleQuery, GetMonitoringScheduleQueryVariables>): Apollo.UseSuspenseQueryResult<GetMonitoringScheduleQuery | undefined, GetMonitoringScheduleQueryVariables>;
export function useGetMonitoringScheduleSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMonitoringScheduleQuery, GetMonitoringScheduleQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMonitoringScheduleQuery, GetMonitoringScheduleQueryVariables>(GetMonitoringScheduleDocument, options);
        }
export type GetMonitoringScheduleQueryHookResult = ReturnType<typeof useGetMonitoringScheduleQuery>;
export type GetMonitoringScheduleLazyQueryHookResult = ReturnType<typeof useGetMonitoringScheduleLazyQuery>;
export type GetMonitoringScheduleSuspenseQueryHookResult = ReturnType<typeof useGetMonitoringScheduleSuspenseQuery>;
export type GetMonitoringScheduleQueryResult = Apollo.QueryResult<GetMonitoringScheduleQuery, GetMonitoringScheduleQueryVariables>;
export const SubmitMonitoringReportDocument = gql`
    mutation SubmitMonitoringReport($input: MonitoringReportInput!) {
  submitMonitoringReport(input: $input) {
    id
    orderId
    reportType
    daysPostAdministration
    hasAdverseEvents
    status
    createdAt
  }
}
    `;
export type SubmitMonitoringReportMutationFn = Apollo.MutationFunction<SubmitMonitoringReportMutation, SubmitMonitoringReportMutationVariables>;

/**
 * __useSubmitMonitoringReportMutation__
 *
 * To run a mutation, you first call `useSubmitMonitoringReportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitMonitoringReportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitMonitoringReportMutation, { data, loading, error }] = useSubmitMonitoringReportMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitMonitoringReportMutation(baseOptions?: Apollo.MutationHookOptions<SubmitMonitoringReportMutation, SubmitMonitoringReportMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitMonitoringReportMutation, SubmitMonitoringReportMutationVariables>(SubmitMonitoringReportDocument, options);
      }
export type SubmitMonitoringReportMutationHookResult = ReturnType<typeof useSubmitMonitoringReportMutation>;
export type SubmitMonitoringReportMutationResult = Apollo.MutationResult<SubmitMonitoringReportMutation>;
export type SubmitMonitoringReportMutationOptions = Apollo.BaseMutationOptions<SubmitMonitoringReportMutation, SubmitMonitoringReportMutationVariables>;
export const GetPatientDocument = gql`
    query GetPatient {
  patient {
    id
    email
    name
    profile {
      cancerType
      cancerTypeNormalized
      stage
      histologicalGrade
      receptorStatus {
        er {
          status
          percentage
          method
        }
        pr {
          status
          percentage
          method
        }
        her2 {
          status
          percentage
          method
        }
      }
      biomarkers
      priorTreatments {
        name
        type
        startDate
        endDate
        response
      }
      ecogStatus
      age
      zipCode
      genomicData {
        testProvider
        testName
        testDate
        alterations {
          gene
          alteration
          alterationType
          variantAlleleFrequency
          clinicalSignificance
          therapyImplications {
            approvedTherapies
            clinicalTrials
            resistanceMutations
          }
          confidence
        }
        biomarkers {
          tmb {
            value
            unit
            status
          }
          msi {
            status
            score
          }
          pdl1 {
            tps
            cps
          }
          loh {
            status
          }
          hrd {
            score
            status
          }
        }
        germlineFindings {
          gene
          variant
          significance
        }
      }
    }
    intakeMethod
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetPatientQuery__
 *
 * To run a query within a React component, call `useGetPatientQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPatientQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPatientQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPatientQuery(baseOptions?: Apollo.QueryHookOptions<GetPatientQuery, GetPatientQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPatientQuery, GetPatientQueryVariables>(GetPatientDocument, options);
      }
export function useGetPatientLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPatientQuery, GetPatientQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPatientQuery, GetPatientQueryVariables>(GetPatientDocument, options);
        }
// @ts-ignore
export function useGetPatientSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPatientQuery, GetPatientQueryVariables>): Apollo.UseSuspenseQueryResult<GetPatientQuery, GetPatientQueryVariables>;
export function useGetPatientSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPatientQuery, GetPatientQueryVariables>): Apollo.UseSuspenseQueryResult<GetPatientQuery | undefined, GetPatientQueryVariables>;
export function useGetPatientSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPatientQuery, GetPatientQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPatientQuery, GetPatientQueryVariables>(GetPatientDocument, options);
        }
export type GetPatientQueryHookResult = ReturnType<typeof useGetPatientQuery>;
export type GetPatientLazyQueryHookResult = ReturnType<typeof useGetPatientLazyQuery>;
export type GetPatientSuspenseQueryHookResult = ReturnType<typeof useGetPatientSuspenseQuery>;
export type GetPatientQueryResult = Apollo.QueryResult<GetPatientQuery, GetPatientQueryVariables>;
export const GetPatientProfileDocument = gql`
    query GetPatientProfile {
  patientProfile {
    cancerType
    cancerTypeNormalized
    stage
    histologicalGrade
    ecogStatus
    age
    zipCode
  }
}
    `;

/**
 * __useGetPatientProfileQuery__
 *
 * To run a query within a React component, call `useGetPatientProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPatientProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPatientProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPatientProfileQuery(baseOptions?: Apollo.QueryHookOptions<GetPatientProfileQuery, GetPatientProfileQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPatientProfileQuery, GetPatientProfileQueryVariables>(GetPatientProfileDocument, options);
      }
export function useGetPatientProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPatientProfileQuery, GetPatientProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPatientProfileQuery, GetPatientProfileQueryVariables>(GetPatientProfileDocument, options);
        }
// @ts-ignore
export function useGetPatientProfileSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPatientProfileQuery, GetPatientProfileQueryVariables>): Apollo.UseSuspenseQueryResult<GetPatientProfileQuery, GetPatientProfileQueryVariables>;
export function useGetPatientProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPatientProfileQuery, GetPatientProfileQueryVariables>): Apollo.UseSuspenseQueryResult<GetPatientProfileQuery | undefined, GetPatientProfileQueryVariables>;
export function useGetPatientProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPatientProfileQuery, GetPatientProfileQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPatientProfileQuery, GetPatientProfileQueryVariables>(GetPatientProfileDocument, options);
        }
export type GetPatientProfileQueryHookResult = ReturnType<typeof useGetPatientProfileQuery>;
export type GetPatientProfileLazyQueryHookResult = ReturnType<typeof useGetPatientProfileLazyQuery>;
export type GetPatientProfileSuspenseQueryHookResult = ReturnType<typeof useGetPatientProfileSuspenseQuery>;
export type GetPatientProfileQueryResult = Apollo.QueryResult<GetPatientProfileQuery, GetPatientProfileQueryVariables>;
export const UpdateProfileDocument = gql`
    mutation UpdateProfile($input: PatientProfileInput!) {
  updatePatientProfile(input: $input) {
    id
    profile {
      cancerType
      stage
      histologicalGrade
      ecogStatus
      age
      zipCode
    }
  }
}
    `;
export type UpdateProfileMutationFn = Apollo.MutationFunction<UpdateProfileMutation, UpdateProfileMutationVariables>;

/**
 * __useUpdateProfileMutation__
 *
 * To run a mutation, you first call `useUpdateProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProfileMutation, { data, loading, error }] = useUpdateProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProfileMutation, UpdateProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(UpdateProfileDocument, options);
      }
export type UpdateProfileMutationHookResult = ReturnType<typeof useUpdateProfileMutation>;
export type UpdateProfileMutationResult = Apollo.MutationResult<UpdateProfileMutation>;
export type UpdateProfileMutationOptions = Apollo.BaseMutationOptions<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const CreatePatientManualDocument = gql`
    mutation CreatePatientManual($input: ManualIntakeInput!) {
  createPatientManual(input: $input) {
    id
    name
    profile {
      cancerType
      stage
      age
      zipCode
    }
    intakeMethod
  }
}
    `;
export type CreatePatientManualMutationFn = Apollo.MutationFunction<CreatePatientManualMutation, CreatePatientManualMutationVariables>;

/**
 * __useCreatePatientManualMutation__
 *
 * To run a mutation, you first call `useCreatePatientManualMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePatientManualMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPatientManualMutation, { data, loading, error }] = useCreatePatientManualMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreatePatientManualMutation(baseOptions?: Apollo.MutationHookOptions<CreatePatientManualMutation, CreatePatientManualMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePatientManualMutation, CreatePatientManualMutationVariables>(CreatePatientManualDocument, options);
      }
export type CreatePatientManualMutationHookResult = ReturnType<typeof useCreatePatientManualMutation>;
export type CreatePatientManualMutationResult = Apollo.MutationResult<CreatePatientManualMutation>;
export type CreatePatientManualMutationOptions = Apollo.BaseMutationOptions<CreatePatientManualMutation, CreatePatientManualMutationVariables>;
export const SavePatientIntakeDocument = gql`
    mutation SavePatientIntake($input: PatientIntakeInput!) {
  savePatientIntake(input: $input) {
    id
    profile {
      cancerType
      stage
    }
    intakeMethod
  }
}
    `;
export type SavePatientIntakeMutationFn = Apollo.MutationFunction<SavePatientIntakeMutation, SavePatientIntakeMutationVariables>;

/**
 * __useSavePatientIntakeMutation__
 *
 * To run a mutation, you first call `useSavePatientIntakeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSavePatientIntakeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [savePatientIntakeMutation, { data, loading, error }] = useSavePatientIntakeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSavePatientIntakeMutation(baseOptions?: Apollo.MutationHookOptions<SavePatientIntakeMutation, SavePatientIntakeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SavePatientIntakeMutation, SavePatientIntakeMutationVariables>(SavePatientIntakeDocument, options);
      }
export type SavePatientIntakeMutationHookResult = ReturnType<typeof useSavePatientIntakeMutation>;
export type SavePatientIntakeMutationResult = Apollo.MutationResult<SavePatientIntakeMutation>;
export type SavePatientIntakeMutationOptions = Apollo.BaseMutationOptions<SavePatientIntakeMutation, SavePatientIntakeMutationVariables>;
export const ExtractDocumentsDocument = gql`
    mutation ExtractDocuments($s3Keys: [String!]!, $mimeTypes: [String!]!) {
  extractDocuments(s3Keys: $s3Keys, mimeTypes: $mimeTypes) {
    status
    profile
    fieldSources
    fieldConfidence
    extractions
    claudeApiCost
    error
  }
}
    `;
export type ExtractDocumentsMutationFn = Apollo.MutationFunction<ExtractDocumentsMutation, ExtractDocumentsMutationVariables>;

/**
 * __useExtractDocumentsMutation__
 *
 * To run a mutation, you first call `useExtractDocumentsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExtractDocumentsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [extractDocumentsMutation, { data, loading, error }] = useExtractDocumentsMutation({
 *   variables: {
 *      s3Keys: // value for 's3Keys'
 *      mimeTypes: // value for 'mimeTypes'
 *   },
 * });
 */
export function useExtractDocumentsMutation(baseOptions?: Apollo.MutationHookOptions<ExtractDocumentsMutation, ExtractDocumentsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ExtractDocumentsMutation, ExtractDocumentsMutationVariables>(ExtractDocumentsDocument, options);
      }
export type ExtractDocumentsMutationHookResult = ReturnType<typeof useExtractDocumentsMutation>;
export type ExtractDocumentsMutationResult = Apollo.MutationResult<ExtractDocumentsMutation>;
export type ExtractDocumentsMutationOptions = Apollo.BaseMutationOptions<ExtractDocumentsMutation, ExtractDocumentsMutationVariables>;
export const GetPipelineJobsDocument = gql`
    query GetPipelineJobs {
  pipelineJobs {
    id
    patientId
    status
    currentStep
    stepsCompleted
    inputFormat
    referenceGenome
    startedAt
    completedAt
    estimatedCompletion
    variantCount
    tmb
    neoantigenCount
    createdAt
  }
}
    `;

/**
 * __useGetPipelineJobsQuery__
 *
 * To run a query within a React component, call `useGetPipelineJobsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPipelineJobsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPipelineJobsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPipelineJobsQuery(baseOptions?: Apollo.QueryHookOptions<GetPipelineJobsQuery, GetPipelineJobsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPipelineJobsQuery, GetPipelineJobsQueryVariables>(GetPipelineJobsDocument, options);
      }
export function useGetPipelineJobsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPipelineJobsQuery, GetPipelineJobsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPipelineJobsQuery, GetPipelineJobsQueryVariables>(GetPipelineJobsDocument, options);
        }
// @ts-ignore
export function useGetPipelineJobsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPipelineJobsQuery, GetPipelineJobsQueryVariables>): Apollo.UseSuspenseQueryResult<GetPipelineJobsQuery, GetPipelineJobsQueryVariables>;
export function useGetPipelineJobsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPipelineJobsQuery, GetPipelineJobsQueryVariables>): Apollo.UseSuspenseQueryResult<GetPipelineJobsQuery | undefined, GetPipelineJobsQueryVariables>;
export function useGetPipelineJobsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPipelineJobsQuery, GetPipelineJobsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPipelineJobsQuery, GetPipelineJobsQueryVariables>(GetPipelineJobsDocument, options);
        }
export type GetPipelineJobsQueryHookResult = ReturnType<typeof useGetPipelineJobsQuery>;
export type GetPipelineJobsLazyQueryHookResult = ReturnType<typeof useGetPipelineJobsLazyQuery>;
export type GetPipelineJobsSuspenseQueryHookResult = ReturnType<typeof useGetPipelineJobsSuspenseQuery>;
export type GetPipelineJobsQueryResult = Apollo.QueryResult<GetPipelineJobsQuery, GetPipelineJobsQueryVariables>;
export const GetPipelineJobDocument = gql`
    query GetPipelineJob($id: String!) {
  pipelineJob(id: $id) {
    id
    patientId
    status
    currentStep
    stepsCompleted
    inputFormat
    referenceGenome
    startedAt
    completedAt
    estimatedCompletion
    variantCount
    tmb
    hlaGenotype
    neoantigenCount
    topNeoantigens
    vaccineBlueprint
    stepErrors
    totalComputeSeconds
    estimatedCostUsd
    createdAt
  }
}
    `;

/**
 * __useGetPipelineJobQuery__
 *
 * To run a query within a React component, call `useGetPipelineJobQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPipelineJobQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPipelineJobQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPipelineJobQuery(baseOptions: Apollo.QueryHookOptions<GetPipelineJobQuery, GetPipelineJobQueryVariables> & ({ variables: GetPipelineJobQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPipelineJobQuery, GetPipelineJobQueryVariables>(GetPipelineJobDocument, options);
      }
export function useGetPipelineJobLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPipelineJobQuery, GetPipelineJobQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPipelineJobQuery, GetPipelineJobQueryVariables>(GetPipelineJobDocument, options);
        }
// @ts-ignore
export function useGetPipelineJobSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPipelineJobQuery, GetPipelineJobQueryVariables>): Apollo.UseSuspenseQueryResult<GetPipelineJobQuery, GetPipelineJobQueryVariables>;
export function useGetPipelineJobSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPipelineJobQuery, GetPipelineJobQueryVariables>): Apollo.UseSuspenseQueryResult<GetPipelineJobQuery | undefined, GetPipelineJobQueryVariables>;
export function useGetPipelineJobSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPipelineJobQuery, GetPipelineJobQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPipelineJobQuery, GetPipelineJobQueryVariables>(GetPipelineJobDocument, options);
        }
export type GetPipelineJobQueryHookResult = ReturnType<typeof useGetPipelineJobQuery>;
export type GetPipelineJobLazyQueryHookResult = ReturnType<typeof useGetPipelineJobLazyQuery>;
export type GetPipelineJobSuspenseQueryHookResult = ReturnType<typeof useGetPipelineJobSuspenseQuery>;
export type GetPipelineJobQueryResult = Apollo.QueryResult<GetPipelineJobQuery, GetPipelineJobQueryVariables>;
export const GetNeoantigensDocument = gql`
    query GetNeoantigens($pipelineJobId: String!, $sort: String, $order: String, $confidence: String, $gene: String, $page: Int, $limit: Int) {
  neoantigens(
    pipelineJobId: $pipelineJobId
    sort: $sort
    order: $order
    confidence: $confidence
    gene: $gene
    page: $page
    limit: $limit
  ) {
    neoantigens {
      id
      jobId
      gene
      mutation
      mutantPeptide
      wildtypePeptide
      hlaAllele
      bindingAffinityNm
      immunogenicityScore
      compositeScore
      rank
      vaf
      clonality
      confidence
    }
    total
    page
    totalPages
  }
}
    `;

/**
 * __useGetNeoantigensQuery__
 *
 * To run a query within a React component, call `useGetNeoantigensQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNeoantigensQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNeoantigensQuery({
 *   variables: {
 *      pipelineJobId: // value for 'pipelineJobId'
 *      sort: // value for 'sort'
 *      order: // value for 'order'
 *      confidence: // value for 'confidence'
 *      gene: // value for 'gene'
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetNeoantigensQuery(baseOptions: Apollo.QueryHookOptions<GetNeoantigensQuery, GetNeoantigensQueryVariables> & ({ variables: GetNeoantigensQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNeoantigensQuery, GetNeoantigensQueryVariables>(GetNeoantigensDocument, options);
      }
export function useGetNeoantigensLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNeoantigensQuery, GetNeoantigensQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNeoantigensQuery, GetNeoantigensQueryVariables>(GetNeoantigensDocument, options);
        }
// @ts-ignore
export function useGetNeoantigensSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetNeoantigensQuery, GetNeoantigensQueryVariables>): Apollo.UseSuspenseQueryResult<GetNeoantigensQuery, GetNeoantigensQueryVariables>;
export function useGetNeoantigensSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNeoantigensQuery, GetNeoantigensQueryVariables>): Apollo.UseSuspenseQueryResult<GetNeoantigensQuery | undefined, GetNeoantigensQueryVariables>;
export function useGetNeoantigensSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNeoantigensQuery, GetNeoantigensQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetNeoantigensQuery, GetNeoantigensQueryVariables>(GetNeoantigensDocument, options);
        }
export type GetNeoantigensQueryHookResult = ReturnType<typeof useGetNeoantigensQuery>;
export type GetNeoantigensLazyQueryHookResult = ReturnType<typeof useGetNeoantigensLazyQuery>;
export type GetNeoantigensSuspenseQueryHookResult = ReturnType<typeof useGetNeoantigensSuspenseQuery>;
export type GetNeoantigensQueryResult = Apollo.QueryResult<GetNeoantigensQuery, GetNeoantigensQueryVariables>;
export const GetPipelineResultsDocument = gql`
    query GetPipelineResults($pipelineJobId: String!) {
  pipelineResults(pipelineJobId: $pipelineJobId) {
    jobId
    patientSummary
    fullReportPdf
    vaccineBlueprint
    neoantigenReport
  }
}
    `;

/**
 * __useGetPipelineResultsQuery__
 *
 * To run a query within a React component, call `useGetPipelineResultsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPipelineResultsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPipelineResultsQuery({
 *   variables: {
 *      pipelineJobId: // value for 'pipelineJobId'
 *   },
 * });
 */
export function useGetPipelineResultsQuery(baseOptions: Apollo.QueryHookOptions<GetPipelineResultsQuery, GetPipelineResultsQueryVariables> & ({ variables: GetPipelineResultsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPipelineResultsQuery, GetPipelineResultsQueryVariables>(GetPipelineResultsDocument, options);
      }
export function useGetPipelineResultsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPipelineResultsQuery, GetPipelineResultsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPipelineResultsQuery, GetPipelineResultsQueryVariables>(GetPipelineResultsDocument, options);
        }
// @ts-ignore
export function useGetPipelineResultsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPipelineResultsQuery, GetPipelineResultsQueryVariables>): Apollo.UseSuspenseQueryResult<GetPipelineResultsQuery, GetPipelineResultsQueryVariables>;
export function useGetPipelineResultsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPipelineResultsQuery, GetPipelineResultsQueryVariables>): Apollo.UseSuspenseQueryResult<GetPipelineResultsQuery | undefined, GetPipelineResultsQueryVariables>;
export function useGetPipelineResultsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPipelineResultsQuery, GetPipelineResultsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPipelineResultsQuery, GetPipelineResultsQueryVariables>(GetPipelineResultsDocument, options);
        }
export type GetPipelineResultsQueryHookResult = ReturnType<typeof useGetPipelineResultsQuery>;
export type GetPipelineResultsLazyQueryHookResult = ReturnType<typeof useGetPipelineResultsLazyQuery>;
export type GetPipelineResultsSuspenseQueryHookResult = ReturnType<typeof useGetPipelineResultsSuspenseQuery>;
export type GetPipelineResultsQueryResult = Apollo.QueryResult<GetPipelineResultsQuery, GetPipelineResultsQueryVariables>;
export const GetReportPdfDocument = gql`
    query GetReportPdf($pipelineJobId: String!, $reportType: String!) {
  reportPdf(pipelineJobId: $pipelineJobId, reportType: $reportType) {
    url
    cached
  }
}
    `;

/**
 * __useGetReportPdfQuery__
 *
 * To run a query within a React component, call `useGetReportPdfQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetReportPdfQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetReportPdfQuery({
 *   variables: {
 *      pipelineJobId: // value for 'pipelineJobId'
 *      reportType: // value for 'reportType'
 *   },
 * });
 */
export function useGetReportPdfQuery(baseOptions: Apollo.QueryHookOptions<GetReportPdfQuery, GetReportPdfQueryVariables> & ({ variables: GetReportPdfQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetReportPdfQuery, GetReportPdfQueryVariables>(GetReportPdfDocument, options);
      }
export function useGetReportPdfLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetReportPdfQuery, GetReportPdfQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetReportPdfQuery, GetReportPdfQueryVariables>(GetReportPdfDocument, options);
        }
// @ts-ignore
export function useGetReportPdfSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetReportPdfQuery, GetReportPdfQueryVariables>): Apollo.UseSuspenseQueryResult<GetReportPdfQuery, GetReportPdfQueryVariables>;
export function useGetReportPdfSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetReportPdfQuery, GetReportPdfQueryVariables>): Apollo.UseSuspenseQueryResult<GetReportPdfQuery | undefined, GetReportPdfQueryVariables>;
export function useGetReportPdfSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetReportPdfQuery, GetReportPdfQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetReportPdfQuery, GetReportPdfQueryVariables>(GetReportPdfDocument, options);
        }
export type GetReportPdfQueryHookResult = ReturnType<typeof useGetReportPdfQuery>;
export type GetReportPdfLazyQueryHookResult = ReturnType<typeof useGetReportPdfLazyQuery>;
export type GetReportPdfSuspenseQueryHookResult = ReturnType<typeof useGetReportPdfSuspenseQuery>;
export type GetReportPdfQueryResult = Apollo.QueryResult<GetReportPdfQuery, GetReportPdfQueryVariables>;
export const GetNeoantigenTrialsDocument = gql`
    query GetNeoantigenTrials($pipelineJobId: String!) {
  neoantigenTrials(pipelineJobId: $pipelineJobId) {
    trialId
    nctId
    title
    phase
    relevanceScore
    relevanceExplanation
    matchedNeoantigens
  }
}
    `;

/**
 * __useGetNeoantigenTrialsQuery__
 *
 * To run a query within a React component, call `useGetNeoantigenTrialsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNeoantigenTrialsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNeoantigenTrialsQuery({
 *   variables: {
 *      pipelineJobId: // value for 'pipelineJobId'
 *   },
 * });
 */
export function useGetNeoantigenTrialsQuery(baseOptions: Apollo.QueryHookOptions<GetNeoantigenTrialsQuery, GetNeoantigenTrialsQueryVariables> & ({ variables: GetNeoantigenTrialsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNeoantigenTrialsQuery, GetNeoantigenTrialsQueryVariables>(GetNeoantigenTrialsDocument, options);
      }
export function useGetNeoantigenTrialsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNeoantigenTrialsQuery, GetNeoantigenTrialsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNeoantigenTrialsQuery, GetNeoantigenTrialsQueryVariables>(GetNeoantigenTrialsDocument, options);
        }
// @ts-ignore
export function useGetNeoantigenTrialsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetNeoantigenTrialsQuery, GetNeoantigenTrialsQueryVariables>): Apollo.UseSuspenseQueryResult<GetNeoantigenTrialsQuery, GetNeoantigenTrialsQueryVariables>;
export function useGetNeoantigenTrialsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNeoantigenTrialsQuery, GetNeoantigenTrialsQueryVariables>): Apollo.UseSuspenseQueryResult<GetNeoantigenTrialsQuery | undefined, GetNeoantigenTrialsQueryVariables>;
export function useGetNeoantigenTrialsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNeoantigenTrialsQuery, GetNeoantigenTrialsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetNeoantigenTrialsQuery, GetNeoantigenTrialsQueryVariables>(GetNeoantigenTrialsDocument, options);
        }
export type GetNeoantigenTrialsQueryHookResult = ReturnType<typeof useGetNeoantigenTrialsQuery>;
export type GetNeoantigenTrialsLazyQueryHookResult = ReturnType<typeof useGetNeoantigenTrialsLazyQuery>;
export type GetNeoantigenTrialsSuspenseQueryHookResult = ReturnType<typeof useGetNeoantigenTrialsSuspenseQuery>;
export type GetNeoantigenTrialsQueryResult = Apollo.QueryResult<GetNeoantigenTrialsQuery, GetNeoantigenTrialsQueryVariables>;
export const SubmitPipelineJobDocument = gql`
    mutation SubmitPipelineJob($tumorDataPath: String!, $normalDataPath: String!, $rnaDataPath: String, $inputFormat: String!, $referenceGenome: String!) {
  submitPipelineJob(
    tumorDataPath: $tumorDataPath
    normalDataPath: $normalDataPath
    rnaDataPath: $rnaDataPath
    inputFormat: $inputFormat
    referenceGenome: $referenceGenome
  ) {
    id
    status
    createdAt
  }
}
    `;
export type SubmitPipelineJobMutationFn = Apollo.MutationFunction<SubmitPipelineJobMutation, SubmitPipelineJobMutationVariables>;

/**
 * __useSubmitPipelineJobMutation__
 *
 * To run a mutation, you first call `useSubmitPipelineJobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitPipelineJobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitPipelineJobMutation, { data, loading, error }] = useSubmitPipelineJobMutation({
 *   variables: {
 *      tumorDataPath: // value for 'tumorDataPath'
 *      normalDataPath: // value for 'normalDataPath'
 *      rnaDataPath: // value for 'rnaDataPath'
 *      inputFormat: // value for 'inputFormat'
 *      referenceGenome: // value for 'referenceGenome'
 *   },
 * });
 */
export function useSubmitPipelineJobMutation(baseOptions?: Apollo.MutationHookOptions<SubmitPipelineJobMutation, SubmitPipelineJobMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitPipelineJobMutation, SubmitPipelineJobMutationVariables>(SubmitPipelineJobDocument, options);
      }
export type SubmitPipelineJobMutationHookResult = ReturnType<typeof useSubmitPipelineJobMutation>;
export type SubmitPipelineJobMutationResult = Apollo.MutationResult<SubmitPipelineJobMutation>;
export type SubmitPipelineJobMutationOptions = Apollo.BaseMutationOptions<SubmitPipelineJobMutation, SubmitPipelineJobMutationVariables>;
export const CancelPipelineJobDocument = gql`
    mutation CancelPipelineJob($jobId: String!) {
  cancelPipelineJob(jobId: $jobId) {
    id
    status
  }
}
    `;
export type CancelPipelineJobMutationFn = Apollo.MutationFunction<CancelPipelineJobMutation, CancelPipelineJobMutationVariables>;

/**
 * __useCancelPipelineJobMutation__
 *
 * To run a mutation, you first call `useCancelPipelineJobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelPipelineJobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelPipelineJobMutation, { data, loading, error }] = useCancelPipelineJobMutation({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useCancelPipelineJobMutation(baseOptions?: Apollo.MutationHookOptions<CancelPipelineJobMutation, CancelPipelineJobMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CancelPipelineJobMutation, CancelPipelineJobMutationVariables>(CancelPipelineJobDocument, options);
      }
export type CancelPipelineJobMutationHookResult = ReturnType<typeof useCancelPipelineJobMutation>;
export type CancelPipelineJobMutationResult = Apollo.MutationResult<CancelPipelineJobMutation>;
export type CancelPipelineJobMutationOptions = Apollo.BaseMutationOptions<CancelPipelineJobMutation, CancelPipelineJobMutationVariables>;
export const GenerateReportPdfDocument = gql`
    mutation GenerateReportPdf($pipelineJobId: String!, $reportType: String!) {
  generateReportPdf(pipelineJobId: $pipelineJobId, reportType: $reportType) {
    url
    cached
  }
}
    `;
export type GenerateReportPdfMutationFn = Apollo.MutationFunction<GenerateReportPdfMutation, GenerateReportPdfMutationVariables>;

/**
 * __useGenerateReportPdfMutation__
 *
 * To run a mutation, you first call `useGenerateReportPdfMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateReportPdfMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateReportPdfMutation, { data, loading, error }] = useGenerateReportPdfMutation({
 *   variables: {
 *      pipelineJobId: // value for 'pipelineJobId'
 *      reportType: // value for 'reportType'
 *   },
 * });
 */
export function useGenerateReportPdfMutation(baseOptions?: Apollo.MutationHookOptions<GenerateReportPdfMutation, GenerateReportPdfMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateReportPdfMutation, GenerateReportPdfMutationVariables>(GenerateReportPdfDocument, options);
      }
export type GenerateReportPdfMutationHookResult = ReturnType<typeof useGenerateReportPdfMutation>;
export type GenerateReportPdfMutationResult = Apollo.MutationResult<GenerateReportPdfMutation>;
export type GenerateReportPdfMutationOptions = Apollo.BaseMutationOptions<GenerateReportPdfMutation, GenerateReportPdfMutationVariables>;
export const GenerateReportDocument = gql`
    query GenerateReport($pipelineJobId: String!, $reportType: String!) {
  generateReport(pipelineJobId: $pipelineJobId, reportType: $reportType)
}
    `;

/**
 * __useGenerateReportQuery__
 *
 * To run a query within a React component, call `useGenerateReportQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerateReportQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerateReportQuery({
 *   variables: {
 *      pipelineJobId: // value for 'pipelineJobId'
 *      reportType: // value for 'reportType'
 *   },
 * });
 */
export function useGenerateReportQuery(baseOptions: Apollo.QueryHookOptions<GenerateReportQuery, GenerateReportQueryVariables> & ({ variables: GenerateReportQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GenerateReportQuery, GenerateReportQueryVariables>(GenerateReportDocument, options);
      }
export function useGenerateReportLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GenerateReportQuery, GenerateReportQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GenerateReportQuery, GenerateReportQueryVariables>(GenerateReportDocument, options);
        }
// @ts-ignore
export function useGenerateReportSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GenerateReportQuery, GenerateReportQueryVariables>): Apollo.UseSuspenseQueryResult<GenerateReportQuery, GenerateReportQueryVariables>;
export function useGenerateReportSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GenerateReportQuery, GenerateReportQueryVariables>): Apollo.UseSuspenseQueryResult<GenerateReportQuery | undefined, GenerateReportQueryVariables>;
export function useGenerateReportSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GenerateReportQuery, GenerateReportQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GenerateReportQuery, GenerateReportQueryVariables>(GenerateReportDocument, options);
        }
export type GenerateReportQueryHookResult = ReturnType<typeof useGenerateReportQuery>;
export type GenerateReportLazyQueryHookResult = ReturnType<typeof useGenerateReportLazyQuery>;
export type GenerateReportSuspenseQueryHookResult = ReturnType<typeof useGenerateReportSuspenseQuery>;
export type GenerateReportQueryResult = Apollo.QueryResult<GenerateReportQuery, GenerateReportQueryVariables>;
export const GetProvidersDocument = gql`
    query GetProviders {
  sequencingProviders {
    id
    name
    type
    slug
    website
    testNames
    geneCount
    sampleTypes
    turnaroundDaysMin
    turnaroundDaysMax
    costRangeMin
    costRangeMax
    fdaApproved
    orderingProcess
    reportFormat
  }
}
    `;

/**
 * __useGetProvidersQuery__
 *
 * To run a query within a React component, call `useGetProvidersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProvidersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProvidersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetProvidersQuery(baseOptions?: Apollo.QueryHookOptions<GetProvidersQuery, GetProvidersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProvidersQuery, GetProvidersQueryVariables>(GetProvidersDocument, options);
      }
export function useGetProvidersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProvidersQuery, GetProvidersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProvidersQuery, GetProvidersQueryVariables>(GetProvidersDocument, options);
        }
// @ts-ignore
export function useGetProvidersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetProvidersQuery, GetProvidersQueryVariables>): Apollo.UseSuspenseQueryResult<GetProvidersQuery, GetProvidersQueryVariables>;
export function useGetProvidersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProvidersQuery, GetProvidersQueryVariables>): Apollo.UseSuspenseQueryResult<GetProvidersQuery | undefined, GetProvidersQueryVariables>;
export function useGetProvidersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProvidersQuery, GetProvidersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProvidersQuery, GetProvidersQueryVariables>(GetProvidersDocument, options);
        }
export type GetProvidersQueryHookResult = ReturnType<typeof useGetProvidersQuery>;
export type GetProvidersLazyQueryHookResult = ReturnType<typeof useGetProvidersLazyQuery>;
export type GetProvidersSuspenseQueryHookResult = ReturnType<typeof useGetProvidersSuspenseQuery>;
export type GetProvidersQueryResult = Apollo.QueryResult<GetProvidersQuery, GetProvidersQueryVariables>;
export const GetSequencingOrdersDocument = gql`
    query GetSequencingOrders {
  sequencingOrders {
    id
    patientId
    providerId
    testType
    status
    provider {
      id
      name
      slug
    }
    createdAt
  }
}
    `;

/**
 * __useGetSequencingOrdersQuery__
 *
 * To run a query within a React component, call `useGetSequencingOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSequencingOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSequencingOrdersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSequencingOrdersQuery(baseOptions?: Apollo.QueryHookOptions<GetSequencingOrdersQuery, GetSequencingOrdersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSequencingOrdersQuery, GetSequencingOrdersQueryVariables>(GetSequencingOrdersDocument, options);
      }
export function useGetSequencingOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSequencingOrdersQuery, GetSequencingOrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSequencingOrdersQuery, GetSequencingOrdersQueryVariables>(GetSequencingOrdersDocument, options);
        }
// @ts-ignore
export function useGetSequencingOrdersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSequencingOrdersQuery, GetSequencingOrdersQueryVariables>): Apollo.UseSuspenseQueryResult<GetSequencingOrdersQuery, GetSequencingOrdersQueryVariables>;
export function useGetSequencingOrdersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSequencingOrdersQuery, GetSequencingOrdersQueryVariables>): Apollo.UseSuspenseQueryResult<GetSequencingOrdersQuery | undefined, GetSequencingOrdersQueryVariables>;
export function useGetSequencingOrdersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSequencingOrdersQuery, GetSequencingOrdersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSequencingOrdersQuery, GetSequencingOrdersQueryVariables>(GetSequencingOrdersDocument, options);
        }
export type GetSequencingOrdersQueryHookResult = ReturnType<typeof useGetSequencingOrdersQuery>;
export type GetSequencingOrdersLazyQueryHookResult = ReturnType<typeof useGetSequencingOrdersLazyQuery>;
export type GetSequencingOrdersSuspenseQueryHookResult = ReturnType<typeof useGetSequencingOrdersSuspenseQuery>;
export type GetSequencingOrdersQueryResult = Apollo.QueryResult<GetSequencingOrdersQuery, GetSequencingOrdersQueryVariables>;
export const GetSequencingOrderDocument = gql`
    query GetSequencingOrder($id: String!) {
  sequencingOrder(id: $id) {
    id
    patientId
    providerId
    testType
    status
    provider {
      id
      name
      slug
      type
    }
    insuranceCoverage
    lomnContent
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetSequencingOrderQuery__
 *
 * To run a query within a React component, call `useGetSequencingOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSequencingOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSequencingOrderQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetSequencingOrderQuery(baseOptions: Apollo.QueryHookOptions<GetSequencingOrderQuery, GetSequencingOrderQueryVariables> & ({ variables: GetSequencingOrderQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSequencingOrderQuery, GetSequencingOrderQueryVariables>(GetSequencingOrderDocument, options);
      }
export function useGetSequencingOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSequencingOrderQuery, GetSequencingOrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSequencingOrderQuery, GetSequencingOrderQueryVariables>(GetSequencingOrderDocument, options);
        }
// @ts-ignore
export function useGetSequencingOrderSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSequencingOrderQuery, GetSequencingOrderQueryVariables>): Apollo.UseSuspenseQueryResult<GetSequencingOrderQuery, GetSequencingOrderQueryVariables>;
export function useGetSequencingOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSequencingOrderQuery, GetSequencingOrderQueryVariables>): Apollo.UseSuspenseQueryResult<GetSequencingOrderQuery | undefined, GetSequencingOrderQueryVariables>;
export function useGetSequencingOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSequencingOrderQuery, GetSequencingOrderQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSequencingOrderQuery, GetSequencingOrderQueryVariables>(GetSequencingOrderDocument, options);
        }
export type GetSequencingOrderQueryHookResult = ReturnType<typeof useGetSequencingOrderQuery>;
export type GetSequencingOrderLazyQueryHookResult = ReturnType<typeof useGetSequencingOrderLazyQuery>;
export type GetSequencingOrderSuspenseQueryHookResult = ReturnType<typeof useGetSequencingOrderSuspenseQuery>;
export type GetSequencingOrderQueryResult = Apollo.QueryResult<GetSequencingOrderQuery, GetSequencingOrderQueryVariables>;
export const GetSequencingRecommendationDocument = gql`
    query GetSequencingRecommendation {
  sequencingRecommendation {
    level
    headline
    personalizedReasoning
    whatItCouldReveal
    howItHelpsRightNow
    howItHelpsLater
    guidelineRecommendation
    generatedAt
  }
}
    `;

/**
 * __useGetSequencingRecommendationQuery__
 *
 * To run a query within a React component, call `useGetSequencingRecommendationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSequencingRecommendationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSequencingRecommendationQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSequencingRecommendationQuery(baseOptions?: Apollo.QueryHookOptions<GetSequencingRecommendationQuery, GetSequencingRecommendationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSequencingRecommendationQuery, GetSequencingRecommendationQueryVariables>(GetSequencingRecommendationDocument, options);
      }
export function useGetSequencingRecommendationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSequencingRecommendationQuery, GetSequencingRecommendationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSequencingRecommendationQuery, GetSequencingRecommendationQueryVariables>(GetSequencingRecommendationDocument, options);
        }
// @ts-ignore
export function useGetSequencingRecommendationSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSequencingRecommendationQuery, GetSequencingRecommendationQueryVariables>): Apollo.UseSuspenseQueryResult<GetSequencingRecommendationQuery, GetSequencingRecommendationQueryVariables>;
export function useGetSequencingRecommendationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSequencingRecommendationQuery, GetSequencingRecommendationQueryVariables>): Apollo.UseSuspenseQueryResult<GetSequencingRecommendationQuery | undefined, GetSequencingRecommendationQueryVariables>;
export function useGetSequencingRecommendationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSequencingRecommendationQuery, GetSequencingRecommendationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSequencingRecommendationQuery, GetSequencingRecommendationQueryVariables>(GetSequencingRecommendationDocument, options);
        }
export type GetSequencingRecommendationQueryHookResult = ReturnType<typeof useGetSequencingRecommendationQuery>;
export type GetSequencingRecommendationLazyQueryHookResult = ReturnType<typeof useGetSequencingRecommendationLazyQuery>;
export type GetSequencingRecommendationSuspenseQueryHookResult = ReturnType<typeof useGetSequencingRecommendationSuspenseQuery>;
export type GetSequencingRecommendationQueryResult = Apollo.QueryResult<GetSequencingRecommendationQuery, GetSequencingRecommendationQueryVariables>;
export const GetSequencingExplanationDocument = gql`
    query GetSequencingExplanation {
  sequencingExplanation {
    whatIsIt
    howItWorks
    whatItFinds
    personalRelevance
    commonConcerns {
      concern
      answer
    }
    generatedAt
  }
}
    `;

/**
 * __useGetSequencingExplanationQuery__
 *
 * To run a query within a React component, call `useGetSequencingExplanationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSequencingExplanationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSequencingExplanationQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSequencingExplanationQuery(baseOptions?: Apollo.QueryHookOptions<GetSequencingExplanationQuery, GetSequencingExplanationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSequencingExplanationQuery, GetSequencingExplanationQueryVariables>(GetSequencingExplanationDocument, options);
      }
export function useGetSequencingExplanationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSequencingExplanationQuery, GetSequencingExplanationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSequencingExplanationQuery, GetSequencingExplanationQueryVariables>(GetSequencingExplanationDocument, options);
        }
// @ts-ignore
export function useGetSequencingExplanationSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSequencingExplanationQuery, GetSequencingExplanationQueryVariables>): Apollo.UseSuspenseQueryResult<GetSequencingExplanationQuery, GetSequencingExplanationQueryVariables>;
export function useGetSequencingExplanationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSequencingExplanationQuery, GetSequencingExplanationQueryVariables>): Apollo.UseSuspenseQueryResult<GetSequencingExplanationQuery | undefined, GetSequencingExplanationQueryVariables>;
export function useGetSequencingExplanationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSequencingExplanationQuery, GetSequencingExplanationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSequencingExplanationQuery, GetSequencingExplanationQueryVariables>(GetSequencingExplanationDocument, options);
        }
export type GetSequencingExplanationQueryHookResult = ReturnType<typeof useGetSequencingExplanationQuery>;
export type GetSequencingExplanationLazyQueryHookResult = ReturnType<typeof useGetSequencingExplanationLazyQuery>;
export type GetSequencingExplanationSuspenseQueryHookResult = ReturnType<typeof useGetSequencingExplanationSuspenseQuery>;
export type GetSequencingExplanationQueryResult = Apollo.QueryResult<GetSequencingExplanationQuery, GetSequencingExplanationQueryVariables>;
export const GetTestRecommendationDocument = gql`
    query GetTestRecommendation($tissueAvailable: Boolean, $preferComprehensive: Boolean) {
  testRecommendation(
    tissueAvailable: $tissueAvailable
    preferComprehensive: $preferComprehensive
  ) {
    primary {
      providerId
      providerName
      testName
      testType
      geneCount
      whyThisTest
      sampleType
      turnaroundDays
      fdaApproved
    }
    alternatives {
      providerId
      providerName
      testName
      geneCount
      tradeoff
    }
    reasoning
    generatedAt
  }
}
    `;

/**
 * __useGetTestRecommendationQuery__
 *
 * To run a query within a React component, call `useGetTestRecommendationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestRecommendationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestRecommendationQuery({
 *   variables: {
 *      tissueAvailable: // value for 'tissueAvailable'
 *      preferComprehensive: // value for 'preferComprehensive'
 *   },
 * });
 */
export function useGetTestRecommendationQuery(baseOptions?: Apollo.QueryHookOptions<GetTestRecommendationQuery, GetTestRecommendationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTestRecommendationQuery, GetTestRecommendationQueryVariables>(GetTestRecommendationDocument, options);
      }
export function useGetTestRecommendationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTestRecommendationQuery, GetTestRecommendationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTestRecommendationQuery, GetTestRecommendationQueryVariables>(GetTestRecommendationDocument, options);
        }
// @ts-ignore
export function useGetTestRecommendationSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTestRecommendationQuery, GetTestRecommendationQueryVariables>): Apollo.UseSuspenseQueryResult<GetTestRecommendationQuery, GetTestRecommendationQueryVariables>;
export function useGetTestRecommendationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTestRecommendationQuery, GetTestRecommendationQueryVariables>): Apollo.UseSuspenseQueryResult<GetTestRecommendationQuery | undefined, GetTestRecommendationQueryVariables>;
export function useGetTestRecommendationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTestRecommendationQuery, GetTestRecommendationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTestRecommendationQuery, GetTestRecommendationQueryVariables>(GetTestRecommendationDocument, options);
        }
export type GetTestRecommendationQueryHookResult = ReturnType<typeof useGetTestRecommendationQuery>;
export type GetTestRecommendationLazyQueryHookResult = ReturnType<typeof useGetTestRecommendationLazyQuery>;
export type GetTestRecommendationSuspenseQueryHookResult = ReturnType<typeof useGetTestRecommendationSuspenseQuery>;
export type GetTestRecommendationQueryResult = Apollo.QueryResult<GetTestRecommendationQuery, GetTestRecommendationQueryVariables>;
export const GetConversationGuideDocument = gql`
    query GetConversationGuide {
  conversationGuide {
    talkingPoints {
      point
      detail
    }
    questionsToAsk {
      question
      whyItMatters
    }
    emailTemplate
    orderingInstructions
    generatedAt
  }
}
    `;

/**
 * __useGetConversationGuideQuery__
 *
 * To run a query within a React component, call `useGetConversationGuideQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConversationGuideQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConversationGuideQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetConversationGuideQuery(baseOptions?: Apollo.QueryHookOptions<GetConversationGuideQuery, GetConversationGuideQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetConversationGuideQuery, GetConversationGuideQueryVariables>(GetConversationGuideDocument, options);
      }
export function useGetConversationGuideLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetConversationGuideQuery, GetConversationGuideQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetConversationGuideQuery, GetConversationGuideQueryVariables>(GetConversationGuideDocument, options);
        }
// @ts-ignore
export function useGetConversationGuideSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetConversationGuideQuery, GetConversationGuideQueryVariables>): Apollo.UseSuspenseQueryResult<GetConversationGuideQuery, GetConversationGuideQueryVariables>;
export function useGetConversationGuideSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetConversationGuideQuery, GetConversationGuideQueryVariables>): Apollo.UseSuspenseQueryResult<GetConversationGuideQuery | undefined, GetConversationGuideQueryVariables>;
export function useGetConversationGuideSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetConversationGuideQuery, GetConversationGuideQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetConversationGuideQuery, GetConversationGuideQueryVariables>(GetConversationGuideDocument, options);
        }
export type GetConversationGuideQueryHookResult = ReturnType<typeof useGetConversationGuideQuery>;
export type GetConversationGuideLazyQueryHookResult = ReturnType<typeof useGetConversationGuideLazyQuery>;
export type GetConversationGuideSuspenseQueryHookResult = ReturnType<typeof useGetConversationGuideSuspenseQuery>;
export type GetConversationGuideQueryResult = Apollo.QueryResult<GetConversationGuideQuery, GetConversationGuideQueryVariables>;
export const GetWaitingContentDocument = gql`
    query GetWaitingContent {
  waitingContent {
    cancerType
    commonMutations {
      name
      frequency
      significance
      drugs
    }
    whatMutationsMean
    clinicalTrialContext
    timelineExpectations
    generatedAt
  }
}
    `;

/**
 * __useGetWaitingContentQuery__
 *
 * To run a query within a React component, call `useGetWaitingContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWaitingContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWaitingContentQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetWaitingContentQuery(baseOptions?: Apollo.QueryHookOptions<GetWaitingContentQuery, GetWaitingContentQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWaitingContentQuery, GetWaitingContentQueryVariables>(GetWaitingContentDocument, options);
      }
export function useGetWaitingContentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWaitingContentQuery, GetWaitingContentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWaitingContentQuery, GetWaitingContentQueryVariables>(GetWaitingContentDocument, options);
        }
// @ts-ignore
export function useGetWaitingContentSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetWaitingContentQuery, GetWaitingContentQueryVariables>): Apollo.UseSuspenseQueryResult<GetWaitingContentQuery, GetWaitingContentQueryVariables>;
export function useGetWaitingContentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWaitingContentQuery, GetWaitingContentQueryVariables>): Apollo.UseSuspenseQueryResult<GetWaitingContentQuery | undefined, GetWaitingContentQueryVariables>;
export function useGetWaitingContentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWaitingContentQuery, GetWaitingContentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWaitingContentQuery, GetWaitingContentQueryVariables>(GetWaitingContentDocument, options);
        }
export type GetWaitingContentQueryHookResult = ReturnType<typeof useGetWaitingContentQuery>;
export type GetWaitingContentLazyQueryHookResult = ReturnType<typeof useGetWaitingContentLazyQuery>;
export type GetWaitingContentSuspenseQueryHookResult = ReturnType<typeof useGetWaitingContentSuspenseQuery>;
export type GetWaitingContentQueryResult = Apollo.QueryResult<GetWaitingContentQuery, GetWaitingContentQueryVariables>;
export const GetSequencingBriefDocument = gql`
    query GetSequencingBrief($testType: String!, $providerIds: [String!]!, $insurer: String) {
  sequencingBrief(
    testType: $testType
    providerIds: $providerIds
    insurer: $insurer
  )
}
    `;

/**
 * __useGetSequencingBriefQuery__
 *
 * To run a query within a React component, call `useGetSequencingBriefQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSequencingBriefQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSequencingBriefQuery({
 *   variables: {
 *      testType: // value for 'testType'
 *      providerIds: // value for 'providerIds'
 *      insurer: // value for 'insurer'
 *   },
 * });
 */
export function useGetSequencingBriefQuery(baseOptions: Apollo.QueryHookOptions<GetSequencingBriefQuery, GetSequencingBriefQueryVariables> & ({ variables: GetSequencingBriefQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSequencingBriefQuery, GetSequencingBriefQueryVariables>(GetSequencingBriefDocument, options);
      }
export function useGetSequencingBriefLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSequencingBriefQuery, GetSequencingBriefQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSequencingBriefQuery, GetSequencingBriefQueryVariables>(GetSequencingBriefDocument, options);
        }
// @ts-ignore
export function useGetSequencingBriefSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSequencingBriefQuery, GetSequencingBriefQueryVariables>): Apollo.UseSuspenseQueryResult<GetSequencingBriefQuery, GetSequencingBriefQueryVariables>;
export function useGetSequencingBriefSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSequencingBriefQuery, GetSequencingBriefQueryVariables>): Apollo.UseSuspenseQueryResult<GetSequencingBriefQuery | undefined, GetSequencingBriefQueryVariables>;
export function useGetSequencingBriefSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSequencingBriefQuery, GetSequencingBriefQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSequencingBriefQuery, GetSequencingBriefQueryVariables>(GetSequencingBriefDocument, options);
        }
export type GetSequencingBriefQueryHookResult = ReturnType<typeof useGetSequencingBriefQuery>;
export type GetSequencingBriefLazyQueryHookResult = ReturnType<typeof useGetSequencingBriefLazyQuery>;
export type GetSequencingBriefSuspenseQueryHookResult = ReturnType<typeof useGetSequencingBriefSuspenseQuery>;
export type GetSequencingBriefQueryResult = Apollo.QueryResult<GetSequencingBriefQuery, GetSequencingBriefQueryVariables>;
export const CheckCoverageDocument = gql`
    mutation CheckCoverage($insurer: String!, $testType: String!) {
  checkInsuranceCoverage(insurer: $insurer, testType: $testType) {
    status
    insurer
    testType
    reasoning
    conditions
    cptCodes
    priorAuthRequired
    estimatedOutOfPocket
    missingInfo
  }
}
    `;
export type CheckCoverageMutationFn = Apollo.MutationFunction<CheckCoverageMutation, CheckCoverageMutationVariables>;

/**
 * __useCheckCoverageMutation__
 *
 * To run a mutation, you first call `useCheckCoverageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCheckCoverageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [checkCoverageMutation, { data, loading, error }] = useCheckCoverageMutation({
 *   variables: {
 *      insurer: // value for 'insurer'
 *      testType: // value for 'testType'
 *   },
 * });
 */
export function useCheckCoverageMutation(baseOptions?: Apollo.MutationHookOptions<CheckCoverageMutation, CheckCoverageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CheckCoverageMutation, CheckCoverageMutationVariables>(CheckCoverageDocument, options);
      }
export type CheckCoverageMutationHookResult = ReturnType<typeof useCheckCoverageMutation>;
export type CheckCoverageMutationResult = Apollo.MutationResult<CheckCoverageMutation>;
export type CheckCoverageMutationOptions = Apollo.BaseMutationOptions<CheckCoverageMutation, CheckCoverageMutationVariables>;
export const GenerateLomnDocument = gql`
    mutation GenerateLOMN($testType: String!, $insurer: String) {
  generateLOMN(testType: $testType, insurer: $insurer) {
    content
    testType
    cptCodes
    icdCodes
    generatedAt
  }
}
    `;
export type GenerateLomnMutationFn = Apollo.MutationFunction<GenerateLomnMutation, GenerateLomnMutationVariables>;

/**
 * __useGenerateLomnMutation__
 *
 * To run a mutation, you first call `useGenerateLomnMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateLomnMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateLomnMutation, { data, loading, error }] = useGenerateLomnMutation({
 *   variables: {
 *      testType: // value for 'testType'
 *      insurer: // value for 'insurer'
 *   },
 * });
 */
export function useGenerateLomnMutation(baseOptions?: Apollo.MutationHookOptions<GenerateLomnMutation, GenerateLomnMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateLomnMutation, GenerateLomnMutationVariables>(GenerateLomnDocument, options);
      }
export type GenerateLomnMutationHookResult = ReturnType<typeof useGenerateLomnMutation>;
export type GenerateLomnMutationResult = Apollo.MutationResult<GenerateLomnMutation>;
export type GenerateLomnMutationOptions = Apollo.BaseMutationOptions<GenerateLomnMutation, GenerateLomnMutationVariables>;
export const GenerateSequencingRecommendationDocument = gql`
    mutation GenerateSequencingRecommendation {
  generateSequencingRecommendation {
    level
    headline
    personalizedReasoning
    whatItCouldReveal
    howItHelpsRightNow
    howItHelpsLater
    guidelineRecommendation
    generatedAt
  }
}
    `;
export type GenerateSequencingRecommendationMutationFn = Apollo.MutationFunction<GenerateSequencingRecommendationMutation, GenerateSequencingRecommendationMutationVariables>;

/**
 * __useGenerateSequencingRecommendationMutation__
 *
 * To run a mutation, you first call `useGenerateSequencingRecommendationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateSequencingRecommendationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateSequencingRecommendationMutation, { data, loading, error }] = useGenerateSequencingRecommendationMutation({
 *   variables: {
 *   },
 * });
 */
export function useGenerateSequencingRecommendationMutation(baseOptions?: Apollo.MutationHookOptions<GenerateSequencingRecommendationMutation, GenerateSequencingRecommendationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateSequencingRecommendationMutation, GenerateSequencingRecommendationMutationVariables>(GenerateSequencingRecommendationDocument, options);
      }
export type GenerateSequencingRecommendationMutationHookResult = ReturnType<typeof useGenerateSequencingRecommendationMutation>;
export type GenerateSequencingRecommendationMutationResult = Apollo.MutationResult<GenerateSequencingRecommendationMutation>;
export type GenerateSequencingRecommendationMutationOptions = Apollo.BaseMutationOptions<GenerateSequencingRecommendationMutation, GenerateSequencingRecommendationMutationVariables>;
export const UpdateSequencingOrderStatusDocument = gql`
    mutation UpdateSequencingOrderStatus($orderId: String!, $status: String!) {
  updateSequencingOrderStatus(orderId: $orderId, status: $status) {
    id
    status
    updatedAt
  }
}
    `;
export type UpdateSequencingOrderStatusMutationFn = Apollo.MutationFunction<UpdateSequencingOrderStatusMutation, UpdateSequencingOrderStatusMutationVariables>;

/**
 * __useUpdateSequencingOrderStatusMutation__
 *
 * To run a mutation, you first call `useUpdateSequencingOrderStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSequencingOrderStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSequencingOrderStatusMutation, { data, loading, error }] = useUpdateSequencingOrderStatusMutation({
 *   variables: {
 *      orderId: // value for 'orderId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdateSequencingOrderStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSequencingOrderStatusMutation, UpdateSequencingOrderStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSequencingOrderStatusMutation, UpdateSequencingOrderStatusMutationVariables>(UpdateSequencingOrderStatusDocument, options);
      }
export type UpdateSequencingOrderStatusMutationHookResult = ReturnType<typeof useUpdateSequencingOrderStatusMutation>;
export type UpdateSequencingOrderStatusMutationResult = Apollo.MutationResult<UpdateSequencingOrderStatusMutation>;
export type UpdateSequencingOrderStatusMutationOptions = Apollo.BaseMutationOptions<UpdateSequencingOrderStatusMutation, UpdateSequencingOrderStatusMutationVariables>;
export const CreateSequencingOrderDocument = gql`
    mutation CreateSequencingOrder($providerId: String!, $testType: String!) {
  createSequencingOrder(providerId: $providerId, testType: $testType) {
    id
    status
    provider {
      id
      name
    }
  }
}
    `;
export type CreateSequencingOrderMutationFn = Apollo.MutationFunction<CreateSequencingOrderMutation, CreateSequencingOrderMutationVariables>;

/**
 * __useCreateSequencingOrderMutation__
 *
 * To run a mutation, you first call `useCreateSequencingOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSequencingOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSequencingOrderMutation, { data, loading, error }] = useCreateSequencingOrderMutation({
 *   variables: {
 *      providerId: // value for 'providerId'
 *      testType: // value for 'testType'
 *   },
 * });
 */
export function useCreateSequencingOrderMutation(baseOptions?: Apollo.MutationHookOptions<CreateSequencingOrderMutation, CreateSequencingOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSequencingOrderMutation, CreateSequencingOrderMutationVariables>(CreateSequencingOrderDocument, options);
      }
export type CreateSequencingOrderMutationHookResult = ReturnType<typeof useCreateSequencingOrderMutation>;
export type CreateSequencingOrderMutationResult = Apollo.MutationResult<CreateSequencingOrderMutation>;
export type CreateSequencingOrderMutationOptions = Apollo.BaseMutationOptions<CreateSequencingOrderMutation, CreateSequencingOrderMutationVariables>;
export const GetSurvivorshipPlanDocument = gql`
    query GetSurvivorshipPlan {
  survivorshipPlan {
    id
    patientId
    treatmentCompletionDate
    completionType
    ongoingTherapies
    planContent
    riskCategory
    currentPhase
    lastGeneratedAt
    nextReviewDate
    createdAt
  }
}
    `;

/**
 * __useGetSurvivorshipPlanQuery__
 *
 * To run a query within a React component, call `useGetSurvivorshipPlanQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSurvivorshipPlanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSurvivorshipPlanQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSurvivorshipPlanQuery(baseOptions?: Apollo.QueryHookOptions<GetSurvivorshipPlanQuery, GetSurvivorshipPlanQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSurvivorshipPlanQuery, GetSurvivorshipPlanQueryVariables>(GetSurvivorshipPlanDocument, options);
      }
export function useGetSurvivorshipPlanLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSurvivorshipPlanQuery, GetSurvivorshipPlanQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSurvivorshipPlanQuery, GetSurvivorshipPlanQueryVariables>(GetSurvivorshipPlanDocument, options);
        }
// @ts-ignore
export function useGetSurvivorshipPlanSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSurvivorshipPlanQuery, GetSurvivorshipPlanQueryVariables>): Apollo.UseSuspenseQueryResult<GetSurvivorshipPlanQuery, GetSurvivorshipPlanQueryVariables>;
export function useGetSurvivorshipPlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSurvivorshipPlanQuery, GetSurvivorshipPlanQueryVariables>): Apollo.UseSuspenseQueryResult<GetSurvivorshipPlanQuery | undefined, GetSurvivorshipPlanQueryVariables>;
export function useGetSurvivorshipPlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSurvivorshipPlanQuery, GetSurvivorshipPlanQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSurvivorshipPlanQuery, GetSurvivorshipPlanQueryVariables>(GetSurvivorshipPlanDocument, options);
        }
export type GetSurvivorshipPlanQueryHookResult = ReturnType<typeof useGetSurvivorshipPlanQuery>;
export type GetSurvivorshipPlanLazyQueryHookResult = ReturnType<typeof useGetSurvivorshipPlanLazyQuery>;
export type GetSurvivorshipPlanSuspenseQueryHookResult = ReturnType<typeof useGetSurvivorshipPlanSuspenseQuery>;
export type GetSurvivorshipPlanQueryResult = Apollo.QueryResult<GetSurvivorshipPlanQuery, GetSurvivorshipPlanQueryVariables>;
export const GetSurveillanceScheduleDocument = gql`
    query GetSurveillanceSchedule {
  surveillanceSchedule {
    id
    patientId
    planId
    type
    title
    description
    frequency
    guidelineSource
    dueDate
    status
    completedDate
    resultSummary
    nextDueDate
    createdAt
  }
}
    `;

/**
 * __useGetSurveillanceScheduleQuery__
 *
 * To run a query within a React component, call `useGetSurveillanceScheduleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSurveillanceScheduleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSurveillanceScheduleQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSurveillanceScheduleQuery(baseOptions?: Apollo.QueryHookOptions<GetSurveillanceScheduleQuery, GetSurveillanceScheduleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSurveillanceScheduleQuery, GetSurveillanceScheduleQueryVariables>(GetSurveillanceScheduleDocument, options);
      }
export function useGetSurveillanceScheduleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSurveillanceScheduleQuery, GetSurveillanceScheduleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSurveillanceScheduleQuery, GetSurveillanceScheduleQueryVariables>(GetSurveillanceScheduleDocument, options);
        }
// @ts-ignore
export function useGetSurveillanceScheduleSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSurveillanceScheduleQuery, GetSurveillanceScheduleQueryVariables>): Apollo.UseSuspenseQueryResult<GetSurveillanceScheduleQuery, GetSurveillanceScheduleQueryVariables>;
export function useGetSurveillanceScheduleSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSurveillanceScheduleQuery, GetSurveillanceScheduleQueryVariables>): Apollo.UseSuspenseQueryResult<GetSurveillanceScheduleQuery | undefined, GetSurveillanceScheduleQueryVariables>;
export function useGetSurveillanceScheduleSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSurveillanceScheduleQuery, GetSurveillanceScheduleQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSurveillanceScheduleQuery, GetSurveillanceScheduleQueryVariables>(GetSurveillanceScheduleDocument, options);
        }
export type GetSurveillanceScheduleQueryHookResult = ReturnType<typeof useGetSurveillanceScheduleQuery>;
export type GetSurveillanceScheduleLazyQueryHookResult = ReturnType<typeof useGetSurveillanceScheduleLazyQuery>;
export type GetSurveillanceScheduleSuspenseQueryHookResult = ReturnType<typeof useGetSurveillanceScheduleSuspenseQuery>;
export type GetSurveillanceScheduleQueryResult = Apollo.QueryResult<GetSurveillanceScheduleQuery, GetSurveillanceScheduleQueryVariables>;
export const GetJournalEntriesDocument = gql`
    query GetJournalEntries($limit: Int) {
  journalEntries(limit: $limit) {
    id
    patientId
    entryDate
    energy
    pain
    mood
    sleepQuality
    hotFlashes
    jointPain
    newSymptoms
    exerciseType
    exerciseMinutes
    medicationsTaken
    notes
    createdAt
  }
}
    `;

/**
 * __useGetJournalEntriesQuery__
 *
 * To run a query within a React component, call `useGetJournalEntriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetJournalEntriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetJournalEntriesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetJournalEntriesQuery(baseOptions?: Apollo.QueryHookOptions<GetJournalEntriesQuery, GetJournalEntriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetJournalEntriesQuery, GetJournalEntriesQueryVariables>(GetJournalEntriesDocument, options);
      }
export function useGetJournalEntriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetJournalEntriesQuery, GetJournalEntriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetJournalEntriesQuery, GetJournalEntriesQueryVariables>(GetJournalEntriesDocument, options);
        }
// @ts-ignore
export function useGetJournalEntriesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetJournalEntriesQuery, GetJournalEntriesQueryVariables>): Apollo.UseSuspenseQueryResult<GetJournalEntriesQuery, GetJournalEntriesQueryVariables>;
export function useGetJournalEntriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetJournalEntriesQuery, GetJournalEntriesQueryVariables>): Apollo.UseSuspenseQueryResult<GetJournalEntriesQuery | undefined, GetJournalEntriesQueryVariables>;
export function useGetJournalEntriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetJournalEntriesQuery, GetJournalEntriesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetJournalEntriesQuery, GetJournalEntriesQueryVariables>(GetJournalEntriesDocument, options);
        }
export type GetJournalEntriesQueryHookResult = ReturnType<typeof useGetJournalEntriesQuery>;
export type GetJournalEntriesLazyQueryHookResult = ReturnType<typeof useGetJournalEntriesLazyQuery>;
export type GetJournalEntriesSuspenseQueryHookResult = ReturnType<typeof useGetJournalEntriesSuspenseQuery>;
export type GetJournalEntriesQueryResult = Apollo.QueryResult<GetJournalEntriesQuery, GetJournalEntriesQueryVariables>;
export const GetJournalTrendsDocument = gql`
    query GetJournalTrends($days: Int!) {
  journalTrends(days: $days) {
    averageEnergy
    averagePain
    averageMood
    averageSleep
    energyDelta
    painDelta
    moodDelta
    sleepDelta
    streak
    totalEntries
    entries {
      id
      patientId
      entryDate
      energy
      pain
      mood
      sleepQuality
      hotFlashes
      jointPain
      newSymptoms
      exerciseType
      exerciseMinutes
      notes
      createdAt
    }
  }
}
    `;

/**
 * __useGetJournalTrendsQuery__
 *
 * To run a query within a React component, call `useGetJournalTrendsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetJournalTrendsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetJournalTrendsQuery({
 *   variables: {
 *      days: // value for 'days'
 *   },
 * });
 */
export function useGetJournalTrendsQuery(baseOptions: Apollo.QueryHookOptions<GetJournalTrendsQuery, GetJournalTrendsQueryVariables> & ({ variables: GetJournalTrendsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetJournalTrendsQuery, GetJournalTrendsQueryVariables>(GetJournalTrendsDocument, options);
      }
export function useGetJournalTrendsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetJournalTrendsQuery, GetJournalTrendsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetJournalTrendsQuery, GetJournalTrendsQueryVariables>(GetJournalTrendsDocument, options);
        }
// @ts-ignore
export function useGetJournalTrendsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetJournalTrendsQuery, GetJournalTrendsQueryVariables>): Apollo.UseSuspenseQueryResult<GetJournalTrendsQuery, GetJournalTrendsQueryVariables>;
export function useGetJournalTrendsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetJournalTrendsQuery, GetJournalTrendsQueryVariables>): Apollo.UseSuspenseQueryResult<GetJournalTrendsQuery | undefined, GetJournalTrendsQueryVariables>;
export function useGetJournalTrendsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetJournalTrendsQuery, GetJournalTrendsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetJournalTrendsQuery, GetJournalTrendsQueryVariables>(GetJournalTrendsDocument, options);
        }
export type GetJournalTrendsQueryHookResult = ReturnType<typeof useGetJournalTrendsQuery>;
export type GetJournalTrendsLazyQueryHookResult = ReturnType<typeof useGetJournalTrendsLazyQuery>;
export type GetJournalTrendsSuspenseQueryHookResult = ReturnType<typeof useGetJournalTrendsSuspenseQuery>;
export type GetJournalTrendsQueryResult = Apollo.QueryResult<GetJournalTrendsQuery, GetJournalTrendsQueryVariables>;
export const SubmitJournalEntryDocument = gql`
    mutation SubmitJournalEntry($input: SubmitJournalEntryInput!) {
  submitJournalEntry(input: $input) {
    id
    patientId
    entryDate
    energy
    pain
    mood
    sleepQuality
    hotFlashes
    jointPain
    newSymptoms
    exerciseType
    exerciseMinutes
    notes
    createdAt
  }
}
    `;
export type SubmitJournalEntryMutationFn = Apollo.MutationFunction<SubmitJournalEntryMutation, SubmitJournalEntryMutationVariables>;

/**
 * __useSubmitJournalEntryMutation__
 *
 * To run a mutation, you first call `useSubmitJournalEntryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitJournalEntryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitJournalEntryMutation, { data, loading, error }] = useSubmitJournalEntryMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitJournalEntryMutation(baseOptions?: Apollo.MutationHookOptions<SubmitJournalEntryMutation, SubmitJournalEntryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitJournalEntryMutation, SubmitJournalEntryMutationVariables>(SubmitJournalEntryDocument, options);
      }
export type SubmitJournalEntryMutationHookResult = ReturnType<typeof useSubmitJournalEntryMutation>;
export type SubmitJournalEntryMutationResult = Apollo.MutationResult<SubmitJournalEntryMutation>;
export type SubmitJournalEntryMutationOptions = Apollo.BaseMutationOptions<SubmitJournalEntryMutation, SubmitJournalEntryMutationVariables>;
export const DeleteJournalEntryDocument = gql`
    mutation DeleteJournalEntry($entryId: String!) {
  deleteJournalEntry(entryId: $entryId)
}
    `;
export type DeleteJournalEntryMutationFn = Apollo.MutationFunction<DeleteJournalEntryMutation, DeleteJournalEntryMutationVariables>;

/**
 * __useDeleteJournalEntryMutation__
 *
 * To run a mutation, you first call `useDeleteJournalEntryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteJournalEntryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteJournalEntryMutation, { data, loading, error }] = useDeleteJournalEntryMutation({
 *   variables: {
 *      entryId: // value for 'entryId'
 *   },
 * });
 */
export function useDeleteJournalEntryMutation(baseOptions?: Apollo.MutationHookOptions<DeleteJournalEntryMutation, DeleteJournalEntryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteJournalEntryMutation, DeleteJournalEntryMutationVariables>(DeleteJournalEntryDocument, options);
      }
export type DeleteJournalEntryMutationHookResult = ReturnType<typeof useDeleteJournalEntryMutation>;
export type DeleteJournalEntryMutationResult = Apollo.MutationResult<DeleteJournalEntryMutation>;
export type DeleteJournalEntryMutationOptions = Apollo.BaseMutationOptions<DeleteJournalEntryMutation, DeleteJournalEntryMutationVariables>;
export const CompleteTreatmentDocument = gql`
    mutation CompleteTreatment($input: TreatmentCompletionInput!) {
  completeTreatment(input: $input) {
    id
    patientId
    treatmentCompletionDate
    completionType
    ongoingTherapies
    planContent
    riskCategory
    currentPhase
    lastGeneratedAt
    nextReviewDate
    createdAt
  }
}
    `;
export type CompleteTreatmentMutationFn = Apollo.MutationFunction<CompleteTreatmentMutation, CompleteTreatmentMutationVariables>;

/**
 * __useCompleteTreatmentMutation__
 *
 * To run a mutation, you first call `useCompleteTreatmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCompleteTreatmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [completeTreatmentMutation, { data, loading, error }] = useCompleteTreatmentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCompleteTreatmentMutation(baseOptions?: Apollo.MutationHookOptions<CompleteTreatmentMutation, CompleteTreatmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CompleteTreatmentMutation, CompleteTreatmentMutationVariables>(CompleteTreatmentDocument, options);
      }
export type CompleteTreatmentMutationHookResult = ReturnType<typeof useCompleteTreatmentMutation>;
export type CompleteTreatmentMutationResult = Apollo.MutationResult<CompleteTreatmentMutation>;
export type CompleteTreatmentMutationOptions = Apollo.BaseMutationOptions<CompleteTreatmentMutation, CompleteTreatmentMutationVariables>;
export const RefreshScpDocument = gql`
    mutation RefreshSCP {
  refreshSCP {
    id
    patientId
    treatmentCompletionDate
    completionType
    ongoingTherapies
    planContent
    riskCategory
    currentPhase
    lastGeneratedAt
    nextReviewDate
    createdAt
  }
}
    `;
export type RefreshScpMutationFn = Apollo.MutationFunction<RefreshScpMutation, RefreshScpMutationVariables>;

/**
 * __useRefreshScpMutation__
 *
 * To run a mutation, you first call `useRefreshScpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshScpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshScpMutation, { data, loading, error }] = useRefreshScpMutation({
 *   variables: {
 *   },
 * });
 */
export function useRefreshScpMutation(baseOptions?: Apollo.MutationHookOptions<RefreshScpMutation, RefreshScpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefreshScpMutation, RefreshScpMutationVariables>(RefreshScpDocument, options);
      }
export type RefreshScpMutationHookResult = ReturnType<typeof useRefreshScpMutation>;
export type RefreshScpMutationResult = Apollo.MutationResult<RefreshScpMutation>;
export type RefreshScpMutationOptions = Apollo.BaseMutationOptions<RefreshScpMutation, RefreshScpMutationVariables>;
export const MarkEventCompleteDocument = gql`
    mutation MarkEventComplete($input: MarkEventCompleteInput!) {
  markEventComplete(input: $input) {
    id
    patientId
    planId
    type
    title
    description
    frequency
    guidelineSource
    dueDate
    status
    completedDate
    resultSummary
    nextDueDate
    createdAt
  }
}
    `;
export type MarkEventCompleteMutationFn = Apollo.MutationFunction<MarkEventCompleteMutation, MarkEventCompleteMutationVariables>;

/**
 * __useMarkEventCompleteMutation__
 *
 * To run a mutation, you first call `useMarkEventCompleteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkEventCompleteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markEventCompleteMutation, { data, loading, error }] = useMarkEventCompleteMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMarkEventCompleteMutation(baseOptions?: Apollo.MutationHookOptions<MarkEventCompleteMutation, MarkEventCompleteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MarkEventCompleteMutation, MarkEventCompleteMutationVariables>(MarkEventCompleteDocument, options);
      }
export type MarkEventCompleteMutationHookResult = ReturnType<typeof useMarkEventCompleteMutation>;
export type MarkEventCompleteMutationResult = Apollo.MutationResult<MarkEventCompleteMutation>;
export type MarkEventCompleteMutationOptions = Apollo.BaseMutationOptions<MarkEventCompleteMutation, MarkEventCompleteMutationVariables>;
export const SkipEventDocument = gql`
    mutation SkipEvent($input: SkipEventInput!) {
  skipEvent(input: $input) {
    id
    patientId
    planId
    type
    title
    description
    frequency
    guidelineSource
    dueDate
    status
    completedDate
    resultSummary
    nextDueDate
    createdAt
  }
}
    `;
export type SkipEventMutationFn = Apollo.MutationFunction<SkipEventMutation, SkipEventMutationVariables>;

/**
 * __useSkipEventMutation__
 *
 * To run a mutation, you first call `useSkipEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSkipEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [skipEventMutation, { data, loading, error }] = useSkipEventMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSkipEventMutation(baseOptions?: Apollo.MutationHookOptions<SkipEventMutation, SkipEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SkipEventMutation, SkipEventMutationVariables>(SkipEventDocument, options);
      }
export type SkipEventMutationHookResult = ReturnType<typeof useSkipEventMutation>;
export type SkipEventMutationResult = Apollo.MutationResult<SkipEventMutation>;
export type SkipEventMutationOptions = Apollo.BaseMutationOptions<SkipEventMutation, SkipEventMutationVariables>;
export const RescheduleEventDocument = gql`
    mutation RescheduleEvent($input: RescheduleEventInput!) {
  rescheduleEvent(input: $input) {
    id
    patientId
    planId
    type
    title
    description
    frequency
    guidelineSource
    dueDate
    status
    completedDate
    resultSummary
    nextDueDate
    createdAt
  }
}
    `;
export type RescheduleEventMutationFn = Apollo.MutationFunction<RescheduleEventMutation, RescheduleEventMutationVariables>;

/**
 * __useRescheduleEventMutation__
 *
 * To run a mutation, you first call `useRescheduleEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRescheduleEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rescheduleEventMutation, { data, loading, error }] = useRescheduleEventMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRescheduleEventMutation(baseOptions?: Apollo.MutationHookOptions<RescheduleEventMutation, RescheduleEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RescheduleEventMutation, RescheduleEventMutationVariables>(RescheduleEventDocument, options);
      }
export type RescheduleEventMutationHookResult = ReturnType<typeof useRescheduleEventMutation>;
export type RescheduleEventMutationResult = Apollo.MutationResult<RescheduleEventMutation>;
export type RescheduleEventMutationOptions = Apollo.BaseMutationOptions<RescheduleEventMutation, RescheduleEventMutationVariables>;
export const UploadEventResultDocument = gql`
    mutation UploadEventResult($input: UploadEventResultInput!) {
  uploadEventResult(input: $input) {
    id
    patientId
    planId
    type
    title
    description
    frequency
    guidelineSource
    dueDate
    status
    completedDate
    resultSummary
    nextDueDate
    createdAt
  }
}
    `;
export type UploadEventResultMutationFn = Apollo.MutationFunction<UploadEventResultMutation, UploadEventResultMutationVariables>;

/**
 * __useUploadEventResultMutation__
 *
 * To run a mutation, you first call `useUploadEventResultMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadEventResultMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadEventResultMutation, { data, loading, error }] = useUploadEventResultMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUploadEventResultMutation(baseOptions?: Apollo.MutationHookOptions<UploadEventResultMutation, UploadEventResultMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadEventResultMutation, UploadEventResultMutationVariables>(UploadEventResultDocument, options);
      }
export type UploadEventResultMutationHookResult = ReturnType<typeof useUploadEventResultMutation>;
export type UploadEventResultMutationResult = Apollo.MutationResult<UploadEventResultMutation>;
export type UploadEventResultMutationOptions = Apollo.BaseMutationOptions<UploadEventResultMutation, UploadEventResultMutationVariables>;
export const GetLifestyleRecommendationsDocument = gql`
    query GetLifestyleRecommendations {
  lifestyleRecommendations {
    exercise {
      headline
      effectSize
      weeklyTargetMinutes
      intensity
      strengthDaysPerWeek
      precautions {
        issue
        guidance
      }
      starterPlan {
        week
        totalMinutes
        sessions {
          day
          type
          duration
          description
        }
      }
      symptomExercises {
        symptom
        exerciseType
        evidence
      }
    }
    nutrition {
      headline
      strongEvidence
      medicationGuidance {
        medication
        considerations
        emphasize
        limit
      }
      mythBusting {
        myth
        reality
        nuance
      }
    }
    alcohol {
      headline
      quantifiedRisk
      subtypeContext
      recommendation
      evidenceStrength
      honestFraming
    }
    environment {
      approach
      steps {
        category
        action
        why
        difficulty
        cost
        evidence
      }
      overblownConcerns {
        claim
        reality
      }
    }
    generatedAt
  }
}
    `;

/**
 * __useGetLifestyleRecommendationsQuery__
 *
 * To run a query within a React component, call `useGetLifestyleRecommendationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLifestyleRecommendationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLifestyleRecommendationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLifestyleRecommendationsQuery(baseOptions?: Apollo.QueryHookOptions<GetLifestyleRecommendationsQuery, GetLifestyleRecommendationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLifestyleRecommendationsQuery, GetLifestyleRecommendationsQueryVariables>(GetLifestyleRecommendationsDocument, options);
      }
export function useGetLifestyleRecommendationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLifestyleRecommendationsQuery, GetLifestyleRecommendationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLifestyleRecommendationsQuery, GetLifestyleRecommendationsQueryVariables>(GetLifestyleRecommendationsDocument, options);
        }
// @ts-ignore
export function useGetLifestyleRecommendationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLifestyleRecommendationsQuery, GetLifestyleRecommendationsQueryVariables>): Apollo.UseSuspenseQueryResult<GetLifestyleRecommendationsQuery, GetLifestyleRecommendationsQueryVariables>;
export function useGetLifestyleRecommendationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLifestyleRecommendationsQuery, GetLifestyleRecommendationsQueryVariables>): Apollo.UseSuspenseQueryResult<GetLifestyleRecommendationsQuery | undefined, GetLifestyleRecommendationsQueryVariables>;
export function useGetLifestyleRecommendationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLifestyleRecommendationsQuery, GetLifestyleRecommendationsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLifestyleRecommendationsQuery, GetLifestyleRecommendationsQueryVariables>(GetLifestyleRecommendationsDocument, options);
        }
export type GetLifestyleRecommendationsQueryHookResult = ReturnType<typeof useGetLifestyleRecommendationsQuery>;
export type GetLifestyleRecommendationsLazyQueryHookResult = ReturnType<typeof useGetLifestyleRecommendationsLazyQuery>;
export type GetLifestyleRecommendationsSuspenseQueryHookResult = ReturnType<typeof useGetLifestyleRecommendationsSuspenseQuery>;
export type GetLifestyleRecommendationsQueryResult = Apollo.QueryResult<GetLifestyleRecommendationsQuery, GetLifestyleRecommendationsQueryVariables>;
export const GetCareTeamDocument = gql`
    query GetCareTeam {
  careTeam {
    id
    name
    role
    practice
    phone
    contactFor
  }
}
    `;

/**
 * __useGetCareTeamQuery__
 *
 * To run a query within a React component, call `useGetCareTeamQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCareTeamQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCareTeamQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCareTeamQuery(baseOptions?: Apollo.QueryHookOptions<GetCareTeamQuery, GetCareTeamQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCareTeamQuery, GetCareTeamQueryVariables>(GetCareTeamDocument, options);
      }
export function useGetCareTeamLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCareTeamQuery, GetCareTeamQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCareTeamQuery, GetCareTeamQueryVariables>(GetCareTeamDocument, options);
        }
// @ts-ignore
export function useGetCareTeamSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCareTeamQuery, GetCareTeamQueryVariables>): Apollo.UseSuspenseQueryResult<GetCareTeamQuery, GetCareTeamQueryVariables>;
export function useGetCareTeamSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCareTeamQuery, GetCareTeamQueryVariables>): Apollo.UseSuspenseQueryResult<GetCareTeamQuery | undefined, GetCareTeamQueryVariables>;
export function useGetCareTeamSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCareTeamQuery, GetCareTeamQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCareTeamQuery, GetCareTeamQueryVariables>(GetCareTeamDocument, options);
        }
export type GetCareTeamQueryHookResult = ReturnType<typeof useGetCareTeamQuery>;
export type GetCareTeamLazyQueryHookResult = ReturnType<typeof useGetCareTeamLazyQuery>;
export type GetCareTeamSuspenseQueryHookResult = ReturnType<typeof useGetCareTeamSuspenseQuery>;
export type GetCareTeamQueryResult = Apollo.QueryResult<GetCareTeamQuery, GetCareTeamQueryVariables>;
export const RouteSymptomDocument = gql`
    query RouteSymptom($symptom: String!) {
  routeSymptom(symptom: $symptom) {
    urgency
    providerName
    providerRole
    providerPhone
    reasoning
    immediateAction
  }
}
    `;

/**
 * __useRouteSymptomQuery__
 *
 * To run a query within a React component, call `useRouteSymptomQuery` and pass it any options that fit your needs.
 * When your component renders, `useRouteSymptomQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRouteSymptomQuery({
 *   variables: {
 *      symptom: // value for 'symptom'
 *   },
 * });
 */
export function useRouteSymptomQuery(baseOptions: Apollo.QueryHookOptions<RouteSymptomQuery, RouteSymptomQueryVariables> & ({ variables: RouteSymptomQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RouteSymptomQuery, RouteSymptomQueryVariables>(RouteSymptomDocument, options);
      }
export function useRouteSymptomLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RouteSymptomQuery, RouteSymptomQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RouteSymptomQuery, RouteSymptomQueryVariables>(RouteSymptomDocument, options);
        }
// @ts-ignore
export function useRouteSymptomSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<RouteSymptomQuery, RouteSymptomQueryVariables>): Apollo.UseSuspenseQueryResult<RouteSymptomQuery, RouteSymptomQueryVariables>;
export function useRouteSymptomSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RouteSymptomQuery, RouteSymptomQueryVariables>): Apollo.UseSuspenseQueryResult<RouteSymptomQuery | undefined, RouteSymptomQueryVariables>;
export function useRouteSymptomSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RouteSymptomQuery, RouteSymptomQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RouteSymptomQuery, RouteSymptomQueryVariables>(RouteSymptomDocument, options);
        }
export type RouteSymptomQueryHookResult = ReturnType<typeof useRouteSymptomQuery>;
export type RouteSymptomLazyQueryHookResult = ReturnType<typeof useRouteSymptomLazyQuery>;
export type RouteSymptomSuspenseQueryHookResult = ReturnType<typeof useRouteSymptomSuspenseQuery>;
export type RouteSymptomQueryResult = Apollo.QueryResult<RouteSymptomQuery, RouteSymptomQueryVariables>;
export const GetAppointmentPrepDocument = gql`
    query GetAppointmentPrep($eventId: String!) {
  appointmentPrep(eventId: $eventId) {
    eventId
    appointmentType
    appointmentDate
    symptomSummary {
      dimension
      average
      trend
      notableChanges
    }
    completedSince
    upcomingTests
    overdueItems
    questionsToAsk {
      question
      context
    }
    medicationNotes
    generatedAt
  }
}
    `;

/**
 * __useGetAppointmentPrepQuery__
 *
 * To run a query within a React component, call `useGetAppointmentPrepQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppointmentPrepQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppointmentPrepQuery({
 *   variables: {
 *      eventId: // value for 'eventId'
 *   },
 * });
 */
export function useGetAppointmentPrepQuery(baseOptions: Apollo.QueryHookOptions<GetAppointmentPrepQuery, GetAppointmentPrepQueryVariables> & ({ variables: GetAppointmentPrepQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAppointmentPrepQuery, GetAppointmentPrepQueryVariables>(GetAppointmentPrepDocument, options);
      }
export function useGetAppointmentPrepLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAppointmentPrepQuery, GetAppointmentPrepQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAppointmentPrepQuery, GetAppointmentPrepQueryVariables>(GetAppointmentPrepDocument, options);
        }
// @ts-ignore
export function useGetAppointmentPrepSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAppointmentPrepQuery, GetAppointmentPrepQueryVariables>): Apollo.UseSuspenseQueryResult<GetAppointmentPrepQuery, GetAppointmentPrepQueryVariables>;
export function useGetAppointmentPrepSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppointmentPrepQuery, GetAppointmentPrepQueryVariables>): Apollo.UseSuspenseQueryResult<GetAppointmentPrepQuery | undefined, GetAppointmentPrepQueryVariables>;
export function useGetAppointmentPrepSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppointmentPrepQuery, GetAppointmentPrepQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAppointmentPrepQuery, GetAppointmentPrepQueryVariables>(GetAppointmentPrepDocument, options);
        }
export type GetAppointmentPrepQueryHookResult = ReturnType<typeof useGetAppointmentPrepQuery>;
export type GetAppointmentPrepLazyQueryHookResult = ReturnType<typeof useGetAppointmentPrepLazyQuery>;
export type GetAppointmentPrepSuspenseQueryHookResult = ReturnType<typeof useGetAppointmentPrepSuspenseQuery>;
export type GetAppointmentPrepQueryResult = Apollo.QueryResult<GetAppointmentPrepQuery, GetAppointmentPrepQueryVariables>;
export const AddCareTeamMemberDocument = gql`
    mutation AddCareTeamMember($input: AddCareTeamMemberInput!) {
  addCareTeamMember(input: $input) {
    id
    name
    role
    practice
    phone
    contactFor
  }
}
    `;
export type AddCareTeamMemberMutationFn = Apollo.MutationFunction<AddCareTeamMemberMutation, AddCareTeamMemberMutationVariables>;

/**
 * __useAddCareTeamMemberMutation__
 *
 * To run a mutation, you first call `useAddCareTeamMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCareTeamMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCareTeamMemberMutation, { data, loading, error }] = useAddCareTeamMemberMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddCareTeamMemberMutation(baseOptions?: Apollo.MutationHookOptions<AddCareTeamMemberMutation, AddCareTeamMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddCareTeamMemberMutation, AddCareTeamMemberMutationVariables>(AddCareTeamMemberDocument, options);
      }
export type AddCareTeamMemberMutationHookResult = ReturnType<typeof useAddCareTeamMemberMutation>;
export type AddCareTeamMemberMutationResult = Apollo.MutationResult<AddCareTeamMemberMutation>;
export type AddCareTeamMemberMutationOptions = Apollo.BaseMutationOptions<AddCareTeamMemberMutation, AddCareTeamMemberMutationVariables>;
export const UpdateCareTeamMemberDocument = gql`
    mutation UpdateCareTeamMember($input: UpdateCareTeamMemberInput!) {
  updateCareTeamMember(input: $input) {
    id
    name
    role
    practice
    phone
    contactFor
  }
}
    `;
export type UpdateCareTeamMemberMutationFn = Apollo.MutationFunction<UpdateCareTeamMemberMutation, UpdateCareTeamMemberMutationVariables>;

/**
 * __useUpdateCareTeamMemberMutation__
 *
 * To run a mutation, you first call `useUpdateCareTeamMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCareTeamMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCareTeamMemberMutation, { data, loading, error }] = useUpdateCareTeamMemberMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCareTeamMemberMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCareTeamMemberMutation, UpdateCareTeamMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCareTeamMemberMutation, UpdateCareTeamMemberMutationVariables>(UpdateCareTeamMemberDocument, options);
      }
export type UpdateCareTeamMemberMutationHookResult = ReturnType<typeof useUpdateCareTeamMemberMutation>;
export type UpdateCareTeamMemberMutationResult = Apollo.MutationResult<UpdateCareTeamMemberMutation>;
export type UpdateCareTeamMemberMutationOptions = Apollo.BaseMutationOptions<UpdateCareTeamMemberMutation, UpdateCareTeamMemberMutationVariables>;
export const RemoveCareTeamMemberDocument = gql`
    mutation RemoveCareTeamMember($memberId: String!) {
  removeCareTeamMember(memberId: $memberId)
}
    `;
export type RemoveCareTeamMemberMutationFn = Apollo.MutationFunction<RemoveCareTeamMemberMutation, RemoveCareTeamMemberMutationVariables>;

/**
 * __useRemoveCareTeamMemberMutation__
 *
 * To run a mutation, you first call `useRemoveCareTeamMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveCareTeamMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeCareTeamMemberMutation, { data, loading, error }] = useRemoveCareTeamMemberMutation({
 *   variables: {
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useRemoveCareTeamMemberMutation(baseOptions?: Apollo.MutationHookOptions<RemoveCareTeamMemberMutation, RemoveCareTeamMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveCareTeamMemberMutation, RemoveCareTeamMemberMutationVariables>(RemoveCareTeamMemberDocument, options);
      }
export type RemoveCareTeamMemberMutationHookResult = ReturnType<typeof useRemoveCareTeamMemberMutation>;
export type RemoveCareTeamMemberMutationResult = Apollo.MutationResult<RemoveCareTeamMemberMutation>;
export type RemoveCareTeamMemberMutationOptions = Apollo.BaseMutationOptions<RemoveCareTeamMemberMutation, RemoveCareTeamMemberMutationVariables>;
export const GenerateAppointmentPrepDocument = gql`
    mutation GenerateAppointmentPrep($eventId: String!) {
  generateAppointmentPrep(eventId: $eventId) {
    eventId
    appointmentType
    appointmentDate
    symptomSummary {
      dimension
      average
      trend
      notableChanges
    }
    completedSince
    upcomingTests
    overdueItems
    questionsToAsk {
      question
      context
    }
    medicationNotes
    generatedAt
  }
}
    `;
export type GenerateAppointmentPrepMutationFn = Apollo.MutationFunction<GenerateAppointmentPrepMutation, GenerateAppointmentPrepMutationVariables>;

/**
 * __useGenerateAppointmentPrepMutation__
 *
 * To run a mutation, you first call `useGenerateAppointmentPrepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateAppointmentPrepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateAppointmentPrepMutation, { data, loading, error }] = useGenerateAppointmentPrepMutation({
 *   variables: {
 *      eventId: // value for 'eventId'
 *   },
 * });
 */
export function useGenerateAppointmentPrepMutation(baseOptions?: Apollo.MutationHookOptions<GenerateAppointmentPrepMutation, GenerateAppointmentPrepMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateAppointmentPrepMutation, GenerateAppointmentPrepMutationVariables>(GenerateAppointmentPrepDocument, options);
      }
export type GenerateAppointmentPrepMutationHookResult = ReturnType<typeof useGenerateAppointmentPrepMutation>;
export type GenerateAppointmentPrepMutationResult = Apollo.MutationResult<GenerateAppointmentPrepMutation>;
export type GenerateAppointmentPrepMutationOptions = Apollo.BaseMutationOptions<GenerateAppointmentPrepMutation, GenerateAppointmentPrepMutationVariables>;
export const GetCtdnaHistoryDocument = gql`
    query GetCtdnaHistory {
  ctdnaHistory {
    id
    testDate
    provider
    result
    ctdnaLevel
    interpretation {
      summary
      whatThisMeans
      nextSteps
      trendContext
    }
    documentUploadId
    triggeredTrialRematch
    createdAt
  }
}
    `;

/**
 * __useGetCtdnaHistoryQuery__
 *
 * To run a query within a React component, call `useGetCtdnaHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCtdnaHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCtdnaHistoryQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCtdnaHistoryQuery(baseOptions?: Apollo.QueryHookOptions<GetCtdnaHistoryQuery, GetCtdnaHistoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCtdnaHistoryQuery, GetCtdnaHistoryQueryVariables>(GetCtdnaHistoryDocument, options);
      }
export function useGetCtdnaHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCtdnaHistoryQuery, GetCtdnaHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCtdnaHistoryQuery, GetCtdnaHistoryQueryVariables>(GetCtdnaHistoryDocument, options);
        }
// @ts-ignore
export function useGetCtdnaHistorySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCtdnaHistoryQuery, GetCtdnaHistoryQueryVariables>): Apollo.UseSuspenseQueryResult<GetCtdnaHistoryQuery, GetCtdnaHistoryQueryVariables>;
export function useGetCtdnaHistorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCtdnaHistoryQuery, GetCtdnaHistoryQueryVariables>): Apollo.UseSuspenseQueryResult<GetCtdnaHistoryQuery | undefined, GetCtdnaHistoryQueryVariables>;
export function useGetCtdnaHistorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCtdnaHistoryQuery, GetCtdnaHistoryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCtdnaHistoryQuery, GetCtdnaHistoryQueryVariables>(GetCtdnaHistoryDocument, options);
        }
export type GetCtdnaHistoryQueryHookResult = ReturnType<typeof useGetCtdnaHistoryQuery>;
export type GetCtdnaHistoryLazyQueryHookResult = ReturnType<typeof useGetCtdnaHistoryLazyQuery>;
export type GetCtdnaHistorySuspenseQueryHookResult = ReturnType<typeof useGetCtdnaHistorySuspenseQuery>;
export type GetCtdnaHistoryQueryResult = Apollo.QueryResult<GetCtdnaHistoryQuery, GetCtdnaHistoryQueryVariables>;
export const AddCtdnaResultDocument = gql`
    mutation AddCtdnaResult($input: AddCtdnaResultInput!) {
  addCtdnaResult(input: $input) {
    id
    testDate
    provider
    result
    ctdnaLevel
    interpretation {
      summary
      whatThisMeans
      nextSteps
      trendContext
    }
    triggeredTrialRematch
    createdAt
  }
}
    `;
export type AddCtdnaResultMutationFn = Apollo.MutationFunction<AddCtdnaResultMutation, AddCtdnaResultMutationVariables>;

/**
 * __useAddCtdnaResultMutation__
 *
 * To run a mutation, you first call `useAddCtdnaResultMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCtdnaResultMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCtdnaResultMutation, { data, loading, error }] = useAddCtdnaResultMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddCtdnaResultMutation(baseOptions?: Apollo.MutationHookOptions<AddCtdnaResultMutation, AddCtdnaResultMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddCtdnaResultMutation, AddCtdnaResultMutationVariables>(AddCtdnaResultDocument, options);
      }
export type AddCtdnaResultMutationHookResult = ReturnType<typeof useAddCtdnaResultMutation>;
export type AddCtdnaResultMutationResult = Apollo.MutationResult<AddCtdnaResultMutation>;
export type AddCtdnaResultMutationOptions = Apollo.BaseMutationOptions<AddCtdnaResultMutation, AddCtdnaResultMutationVariables>;
export const GetNotificationPreferencesDocument = gql`
    query GetNotificationPreferences {
  notificationPreferences {
    id
    patientId
    surveillanceReminders
    journalReminders
    weeklySummary
    appointmentPrep
    ctdnaResults
    scpAnnualReview
    lifestyleCheckIn
    phaseTransitions
    quietHoursStart
    quietHoursEnd
    timezone
  }
}
    `;

/**
 * __useGetNotificationPreferencesQuery__
 *
 * To run a query within a React component, call `useGetNotificationPreferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNotificationPreferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNotificationPreferencesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetNotificationPreferencesQuery(baseOptions?: Apollo.QueryHookOptions<GetNotificationPreferencesQuery, GetNotificationPreferencesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNotificationPreferencesQuery, GetNotificationPreferencesQueryVariables>(GetNotificationPreferencesDocument, options);
      }
export function useGetNotificationPreferencesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNotificationPreferencesQuery, GetNotificationPreferencesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNotificationPreferencesQuery, GetNotificationPreferencesQueryVariables>(GetNotificationPreferencesDocument, options);
        }
// @ts-ignore
export function useGetNotificationPreferencesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetNotificationPreferencesQuery, GetNotificationPreferencesQueryVariables>): Apollo.UseSuspenseQueryResult<GetNotificationPreferencesQuery, GetNotificationPreferencesQueryVariables>;
export function useGetNotificationPreferencesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNotificationPreferencesQuery, GetNotificationPreferencesQueryVariables>): Apollo.UseSuspenseQueryResult<GetNotificationPreferencesQuery | undefined, GetNotificationPreferencesQueryVariables>;
export function useGetNotificationPreferencesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNotificationPreferencesQuery, GetNotificationPreferencesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetNotificationPreferencesQuery, GetNotificationPreferencesQueryVariables>(GetNotificationPreferencesDocument, options);
        }
export type GetNotificationPreferencesQueryHookResult = ReturnType<typeof useGetNotificationPreferencesQuery>;
export type GetNotificationPreferencesLazyQueryHookResult = ReturnType<typeof useGetNotificationPreferencesLazyQuery>;
export type GetNotificationPreferencesSuspenseQueryHookResult = ReturnType<typeof useGetNotificationPreferencesSuspenseQuery>;
export type GetNotificationPreferencesQueryResult = Apollo.QueryResult<GetNotificationPreferencesQuery, GetNotificationPreferencesQueryVariables>;
export const GetNotificationHistoryDocument = gql`
    query GetNotificationHistory($limit: Int) {
  notificationHistory(limit: $limit) {
    id
    patientId
    category
    channel
    subject
    referenceId
    referenceType
    sentAt
  }
}
    `;

/**
 * __useGetNotificationHistoryQuery__
 *
 * To run a query within a React component, call `useGetNotificationHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNotificationHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNotificationHistoryQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetNotificationHistoryQuery(baseOptions?: Apollo.QueryHookOptions<GetNotificationHistoryQuery, GetNotificationHistoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNotificationHistoryQuery, GetNotificationHistoryQueryVariables>(GetNotificationHistoryDocument, options);
      }
export function useGetNotificationHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNotificationHistoryQuery, GetNotificationHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNotificationHistoryQuery, GetNotificationHistoryQueryVariables>(GetNotificationHistoryDocument, options);
        }
// @ts-ignore
export function useGetNotificationHistorySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetNotificationHistoryQuery, GetNotificationHistoryQueryVariables>): Apollo.UseSuspenseQueryResult<GetNotificationHistoryQuery, GetNotificationHistoryQueryVariables>;
export function useGetNotificationHistorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNotificationHistoryQuery, GetNotificationHistoryQueryVariables>): Apollo.UseSuspenseQueryResult<GetNotificationHistoryQuery | undefined, GetNotificationHistoryQueryVariables>;
export function useGetNotificationHistorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNotificationHistoryQuery, GetNotificationHistoryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetNotificationHistoryQuery, GetNotificationHistoryQueryVariables>(GetNotificationHistoryDocument, options);
        }
export type GetNotificationHistoryQueryHookResult = ReturnType<typeof useGetNotificationHistoryQuery>;
export type GetNotificationHistoryLazyQueryHookResult = ReturnType<typeof useGetNotificationHistoryLazyQuery>;
export type GetNotificationHistorySuspenseQueryHookResult = ReturnType<typeof useGetNotificationHistorySuspenseQuery>;
export type GetNotificationHistoryQueryResult = Apollo.QueryResult<GetNotificationHistoryQuery, GetNotificationHistoryQueryVariables>;
export const UpdateNotificationPreferencesDocument = gql`
    mutation UpdateNotificationPreferences($input: UpdateNotificationPreferenceInput!) {
  updateNotificationPreferences(input: $input) {
    id
    patientId
    surveillanceReminders
    journalReminders
    weeklySummary
    appointmentPrep
    ctdnaResults
    scpAnnualReview
    lifestyleCheckIn
    phaseTransitions
    quietHoursStart
    quietHoursEnd
    timezone
  }
}
    `;
export type UpdateNotificationPreferencesMutationFn = Apollo.MutationFunction<UpdateNotificationPreferencesMutation, UpdateNotificationPreferencesMutationVariables>;

/**
 * __useUpdateNotificationPreferencesMutation__
 *
 * To run a mutation, you first call `useUpdateNotificationPreferencesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNotificationPreferencesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNotificationPreferencesMutation, { data, loading, error }] = useUpdateNotificationPreferencesMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateNotificationPreferencesMutation(baseOptions?: Apollo.MutationHookOptions<UpdateNotificationPreferencesMutation, UpdateNotificationPreferencesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateNotificationPreferencesMutation, UpdateNotificationPreferencesMutationVariables>(UpdateNotificationPreferencesDocument, options);
      }
export type UpdateNotificationPreferencesMutationHookResult = ReturnType<typeof useUpdateNotificationPreferencesMutation>;
export type UpdateNotificationPreferencesMutationResult = Apollo.MutationResult<UpdateNotificationPreferencesMutation>;
export type UpdateNotificationPreferencesMutationOptions = Apollo.BaseMutationOptions<UpdateNotificationPreferencesMutation, UpdateNotificationPreferencesMutationVariables>;
export const SubmitFeedbackDocument = gql`
    mutation SubmitFeedback($input: SubmitFeedbackInput!) {
  submitFeedback(input: $input) {
    id
    feedbackType
    rating
    comment
    createdAt
  }
}
    `;
export type SubmitFeedbackMutationFn = Apollo.MutationFunction<SubmitFeedbackMutation, SubmitFeedbackMutationVariables>;

/**
 * __useSubmitFeedbackMutation__
 *
 * To run a mutation, you first call `useSubmitFeedbackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitFeedbackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitFeedbackMutation, { data, loading, error }] = useSubmitFeedbackMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitFeedbackMutation(baseOptions?: Apollo.MutationHookOptions<SubmitFeedbackMutation, SubmitFeedbackMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitFeedbackMutation, SubmitFeedbackMutationVariables>(SubmitFeedbackDocument, options);
      }
export type SubmitFeedbackMutationHookResult = ReturnType<typeof useSubmitFeedbackMutation>;
export type SubmitFeedbackMutationResult = Apollo.MutationResult<SubmitFeedbackMutation>;
export type SubmitFeedbackMutationOptions = Apollo.BaseMutationOptions<SubmitFeedbackMutation, SubmitFeedbackMutationVariables>;
export const GetSurvivorshipFeedbackDocument = gql`
    query GetSurvivorshipFeedback {
  survivorshipFeedback {
    id
    feedbackType
    rating
    comment
    context
    createdAt
  }
}
    `;

/**
 * __useGetSurvivorshipFeedbackQuery__
 *
 * To run a query within a React component, call `useGetSurvivorshipFeedbackQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSurvivorshipFeedbackQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSurvivorshipFeedbackQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSurvivorshipFeedbackQuery(baseOptions?: Apollo.QueryHookOptions<GetSurvivorshipFeedbackQuery, GetSurvivorshipFeedbackQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSurvivorshipFeedbackQuery, GetSurvivorshipFeedbackQueryVariables>(GetSurvivorshipFeedbackDocument, options);
      }
export function useGetSurvivorshipFeedbackLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSurvivorshipFeedbackQuery, GetSurvivorshipFeedbackQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSurvivorshipFeedbackQuery, GetSurvivorshipFeedbackQueryVariables>(GetSurvivorshipFeedbackDocument, options);
        }
// @ts-ignore
export function useGetSurvivorshipFeedbackSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSurvivorshipFeedbackQuery, GetSurvivorshipFeedbackQueryVariables>): Apollo.UseSuspenseQueryResult<GetSurvivorshipFeedbackQuery, GetSurvivorshipFeedbackQueryVariables>;
export function useGetSurvivorshipFeedbackSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSurvivorshipFeedbackQuery, GetSurvivorshipFeedbackQueryVariables>): Apollo.UseSuspenseQueryResult<GetSurvivorshipFeedbackQuery | undefined, GetSurvivorshipFeedbackQueryVariables>;
export function useGetSurvivorshipFeedbackSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSurvivorshipFeedbackQuery, GetSurvivorshipFeedbackQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSurvivorshipFeedbackQuery, GetSurvivorshipFeedbackQueryVariables>(GetSurvivorshipFeedbackDocument, options);
        }
export type GetSurvivorshipFeedbackQueryHookResult = ReturnType<typeof useGetSurvivorshipFeedbackQuery>;
export type GetSurvivorshipFeedbackLazyQueryHookResult = ReturnType<typeof useGetSurvivorshipFeedbackLazyQuery>;
export type GetSurvivorshipFeedbackSuspenseQueryHookResult = ReturnType<typeof useGetSurvivorshipFeedbackSuspenseQuery>;
export type GetSurvivorshipFeedbackQueryResult = Apollo.QueryResult<GetSurvivorshipFeedbackQuery, GetSurvivorshipFeedbackQueryVariables>;
export const AnnualRefreshScpDocument = gql`
    mutation AnnualRefreshSCP {
  annualRefreshSCP {
    newPlan {
      id
      patientId
      treatmentCompletionDate
      completionType
      ongoingTherapies
      planContent
      riskCategory
      currentPhase
      lastGeneratedAt
      nextReviewDate
      createdAt
    }
    diff {
      changedSections
      addedItems
      removedItems
      summary
    }
  }
}
    `;
export type AnnualRefreshScpMutationFn = Apollo.MutationFunction<AnnualRefreshScpMutation, AnnualRefreshScpMutationVariables>;

/**
 * __useAnnualRefreshScpMutation__
 *
 * To run a mutation, you first call `useAnnualRefreshScpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAnnualRefreshScpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [annualRefreshScpMutation, { data, loading, error }] = useAnnualRefreshScpMutation({
 *   variables: {
 *   },
 * });
 */
export function useAnnualRefreshScpMutation(baseOptions?: Apollo.MutationHookOptions<AnnualRefreshScpMutation, AnnualRefreshScpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AnnualRefreshScpMutation, AnnualRefreshScpMutationVariables>(AnnualRefreshScpDocument, options);
      }
export type AnnualRefreshScpMutationHookResult = ReturnType<typeof useAnnualRefreshScpMutation>;
export type AnnualRefreshScpMutationResult = Apollo.MutationResult<AnnualRefreshScpMutation>;
export type AnnualRefreshScpMutationOptions = Apollo.BaseMutationOptions<AnnualRefreshScpMutation, AnnualRefreshScpMutationVariables>;
export const GenerateLifestyleRecommendationsDocument = gql`
    mutation GenerateLifestyleRecommendations {
  generateLifestyleRecommendations {
    exercise {
      headline
      effectSize
      weeklyTargetMinutes
      intensity
      strengthDaysPerWeek
      precautions {
        issue
        guidance
      }
      starterPlan {
        week
        totalMinutes
        sessions {
          day
          type
          duration
          description
        }
      }
      symptomExercises {
        symptom
        exerciseType
        evidence
      }
    }
    nutrition {
      headline
      strongEvidence
      medicationGuidance {
        medication
        considerations
        emphasize
        limit
      }
      mythBusting {
        myth
        reality
        nuance
      }
    }
    alcohol {
      headline
      quantifiedRisk
      subtypeContext
      recommendation
      evidenceStrength
      honestFraming
    }
    environment {
      approach
      steps {
        category
        action
        why
        difficulty
        cost
        evidence
      }
      overblownConcerns {
        claim
        reality
      }
    }
    generatedAt
  }
}
    `;
export type GenerateLifestyleRecommendationsMutationFn = Apollo.MutationFunction<GenerateLifestyleRecommendationsMutation, GenerateLifestyleRecommendationsMutationVariables>;

/**
 * __useGenerateLifestyleRecommendationsMutation__
 *
 * To run a mutation, you first call `useGenerateLifestyleRecommendationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateLifestyleRecommendationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateLifestyleRecommendationsMutation, { data, loading, error }] = useGenerateLifestyleRecommendationsMutation({
 *   variables: {
 *   },
 * });
 */
export function useGenerateLifestyleRecommendationsMutation(baseOptions?: Apollo.MutationHookOptions<GenerateLifestyleRecommendationsMutation, GenerateLifestyleRecommendationsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateLifestyleRecommendationsMutation, GenerateLifestyleRecommendationsMutationVariables>(GenerateLifestyleRecommendationsDocument, options);
      }
export type GenerateLifestyleRecommendationsMutationHookResult = ReturnType<typeof useGenerateLifestyleRecommendationsMutation>;
export type GenerateLifestyleRecommendationsMutationResult = Apollo.MutationResult<GenerateLifestyleRecommendationsMutation>;
export type GenerateLifestyleRecommendationsMutationOptions = Apollo.BaseMutationOptions<GenerateLifestyleRecommendationsMutation, GenerateLifestyleRecommendationsMutationVariables>;
export const GetTrialsDocument = gql`
    query GetTrials($cancerType: String, $phase: String, $limit: Int) {
  trials(cancerType: $cancerType, phase: $phase, limit: $limit) {
    id
    nctId
    title
    phase
    status
    conditions
    interventions
    sponsor
    briefSummary
    startDate
    lastUpdated
  }
}
    `;

/**
 * __useGetTrialsQuery__
 *
 * To run a query within a React component, call `useGetTrialsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTrialsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTrialsQuery({
 *   variables: {
 *      cancerType: // value for 'cancerType'
 *      phase: // value for 'phase'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetTrialsQuery(baseOptions?: Apollo.QueryHookOptions<GetTrialsQuery, GetTrialsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTrialsQuery, GetTrialsQueryVariables>(GetTrialsDocument, options);
      }
export function useGetTrialsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTrialsQuery, GetTrialsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTrialsQuery, GetTrialsQueryVariables>(GetTrialsDocument, options);
        }
// @ts-ignore
export function useGetTrialsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTrialsQuery, GetTrialsQueryVariables>): Apollo.UseSuspenseQueryResult<GetTrialsQuery, GetTrialsQueryVariables>;
export function useGetTrialsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTrialsQuery, GetTrialsQueryVariables>): Apollo.UseSuspenseQueryResult<GetTrialsQuery | undefined, GetTrialsQueryVariables>;
export function useGetTrialsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTrialsQuery, GetTrialsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTrialsQuery, GetTrialsQueryVariables>(GetTrialsDocument, options);
        }
export type GetTrialsQueryHookResult = ReturnType<typeof useGetTrialsQuery>;
export type GetTrialsLazyQueryHookResult = ReturnType<typeof useGetTrialsLazyQuery>;
export type GetTrialsSuspenseQueryHookResult = ReturnType<typeof useGetTrialsSuspenseQuery>;
export type GetTrialsQueryResult = Apollo.QueryResult<GetTrialsQuery, GetTrialsQueryVariables>;
export const GetTrialDocument = gql`
    query GetTrial($id: String!) {
  trial(id: $id) {
    id
    nctId
    title
    phase
    status
    conditions
    interventions
    sponsor
    locations
    eligibilityCriteria
    parsedEligibility
    briefSummary
    startDate
    lastUpdated
  }
}
    `;

/**
 * __useGetTrialQuery__
 *
 * To run a query within a React component, call `useGetTrialQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTrialQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTrialQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTrialQuery(baseOptions: Apollo.QueryHookOptions<GetTrialQuery, GetTrialQueryVariables> & ({ variables: GetTrialQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTrialQuery, GetTrialQueryVariables>(GetTrialDocument, options);
      }
export function useGetTrialLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTrialQuery, GetTrialQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTrialQuery, GetTrialQueryVariables>(GetTrialDocument, options);
        }
// @ts-ignore
export function useGetTrialSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTrialQuery, GetTrialQueryVariables>): Apollo.UseSuspenseQueryResult<GetTrialQuery, GetTrialQueryVariables>;
export function useGetTrialSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTrialQuery, GetTrialQueryVariables>): Apollo.UseSuspenseQueryResult<GetTrialQuery | undefined, GetTrialQueryVariables>;
export function useGetTrialSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTrialQuery, GetTrialQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTrialQuery, GetTrialQueryVariables>(GetTrialDocument, options);
        }
export type GetTrialQueryHookResult = ReturnType<typeof useGetTrialQuery>;
export type GetTrialLazyQueryHookResult = ReturnType<typeof useGetTrialLazyQuery>;
export type GetTrialSuspenseQueryHookResult = ReturnType<typeof useGetTrialSuspenseQuery>;
export type GetTrialQueryResult = Apollo.QueryResult<GetTrialQuery, GetTrialQueryVariables>;
export const RequestGeneralUploadUrlDocument = gql`
    mutation RequestGeneralUploadUrl($filename: String!, $contentType: String!, $bucket: String) {
  requestGeneralUploadUrl(
    filename: $filename
    contentType: $contentType
    bucket: $bucket
  ) {
    uploadUrl
    s3Key
    bucket
    expiresAt
  }
}
    `;
export type RequestGeneralUploadUrlMutationFn = Apollo.MutationFunction<RequestGeneralUploadUrlMutation, RequestGeneralUploadUrlMutationVariables>;

/**
 * __useRequestGeneralUploadUrlMutation__
 *
 * To run a mutation, you first call `useRequestGeneralUploadUrlMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestGeneralUploadUrlMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestGeneralUploadUrlMutation, { data, loading, error }] = useRequestGeneralUploadUrlMutation({
 *   variables: {
 *      filename: // value for 'filename'
 *      contentType: // value for 'contentType'
 *      bucket: // value for 'bucket'
 *   },
 * });
 */
export function useRequestGeneralUploadUrlMutation(baseOptions?: Apollo.MutationHookOptions<RequestGeneralUploadUrlMutation, RequestGeneralUploadUrlMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestGeneralUploadUrlMutation, RequestGeneralUploadUrlMutationVariables>(RequestGeneralUploadUrlDocument, options);
      }
export type RequestGeneralUploadUrlMutationHookResult = ReturnType<typeof useRequestGeneralUploadUrlMutation>;
export type RequestGeneralUploadUrlMutationResult = Apollo.MutationResult<RequestGeneralUploadUrlMutation>;
export type RequestGeneralUploadUrlMutationOptions = Apollo.BaseMutationOptions<RequestGeneralUploadUrlMutation, RequestGeneralUploadUrlMutationVariables>;