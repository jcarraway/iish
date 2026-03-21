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

export type AcaRights = {
  __typename?: 'AcaRights';
  continuationOfCoverage: Scalars['Boolean']['output'];
  externalReviewAvailable: Scalars['Boolean']['output'];
  externalReviewDays: Scalars['Int']['output'];
  internalAppealDays: Scalars['Int']['output'];
  urgentInternalHours: Scalars['Int']['output'];
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

export type AppealLetter = {
  __typename?: 'AppealLetter';
  appealLevel: Scalars['String']['output'];
  denialId: Scalars['String']['output'];
  generatedAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  letterContent: Scalars['String']['output'];
  outcome?: Maybe<Scalars['String']['output']>;
  outcomeDate?: Maybe<Scalars['String']['output']>;
  outcomeDetails?: Maybe<Scalars['String']['output']>;
  patientSummary?: Maybe<Scalars['String']['output']>;
  submittedAt?: Maybe<Scalars['String']['output']>;
  supportingDocuments: Array<Scalars['String']['output']>;
};

export type AppealRights = {
  __typename?: 'AppealRights';
  acaRights: AcaRights;
  stateProtections?: Maybe<StateProtection>;
};

export type AppealStrategy = {
  __typename?: 'AppealStrategy';
  levels: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  successRates: Scalars['JSON']['output'];
  supportingEvidence: Array<Scalars['String']['output']>;
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

export type Article = {
  __typename?: 'Article';
  actionItems?: Maybe<Array<ArticleActionItem>>;
  audienceLevel: Scalars['String']['output'];
  biomarkers: Array<Scalars['String']['output']>;
  breastSubtypes: Array<Scalars['String']['output']>;
  cancerTypes: Array<Scalars['String']['output']>;
  category: Scalars['String']['output'];
  clinicalContent?: Maybe<Array<ArticleSection>>;
  createdAt: Scalars['DateTime']['output'];
  glossaryTerms: Array<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  journeyStages: Array<Scalars['String']['output']>;
  keyStatistics?: Maybe<Array<KeyStatistic>>;
  keyTakeaways: Array<Scalars['String']['output']>;
  metaDescription: Scalars['String']['output'];
  metaTitle: Scalars['String']['output'];
  patientContent: Array<ArticleSection>;
  patientSummary: Scalars['String']['output'];
  primaryKeyword: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['String']['output']>;
  references?: Maybe<Scalars['JSON']['output']>;
  relatedArticleSlugs: Array<Scalars['String']['output']>;
  secondaryKeywords: Array<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
  treatmentClasses: Array<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  viewCount: Scalars['Int']['output'];
};

export type ArticleActionItem = {
  __typename?: 'ArticleActionItem';
  link?: Maybe<Scalars['String']['output']>;
  text: Scalars['String']['output'];
};

export type ArticleAdminFilters = {
  category?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type ArticleCategoryResult = {
  __typename?: 'ArticleCategoryResult';
  articles: Array<Article>;
  description: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

export type ArticleEngagement = {
  __typename?: 'ArticleEngagement';
  category: Scalars['String']['output'];
  id: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  viewCount: Scalars['Int']['output'];
};

export type ArticleFilters = {
  audienceLevel?: InputMaybe<Scalars['String']['input']>;
  breastSubtypes?: InputMaybe<Array<Scalars['String']['input']>>;
  cancerTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  category?: InputMaybe<Scalars['String']['input']>;
  journeyStages?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ArticlePersonalizedContext = {
  __typename?: 'ArticlePersonalizedContext';
  content: Scalars['String']['output'];
  generatedAt: Scalars['String']['output'];
};

export type ArticleRefreshStatus = {
  __typename?: 'ArticleRefreshStatus';
  needsRefresh: Scalars['Boolean']['output'];
  suggestion?: Maybe<RefreshSuggestion>;
  triggers: Array<RefreshTriggerItem>;
  urgency?: Maybe<Scalars['String']['output']>;
};

export type ArticleSection = {
  __typename?: 'ArticleSection';
  body: Scalars['String']['output'];
  heading: Scalars['String']['output'];
};

export type AssistanceProgramMatch = {
  __typename?: 'AssistanceProgramMatch';
  category: Scalars['String']['output'];
  coverage: Scalars['String']['output'];
  description: Scalars['String']['output'];
  eligibility: Scalars['String']['output'];
  eligible: Scalars['Boolean']['output'];
  eligibleReason?: Maybe<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
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

export type CascadeStatus = {
  __typename?: 'CascadeStatus';
  acknowledged: Scalars['Boolean']['output'];
  careTeamUpdated: Scalars['Boolean']['output'];
  financialRematched: Scalars['Boolean']['output'];
  genomicComparisonReady: Scalars['Boolean']['output'];
  pipelineActivated: Scalars['Boolean']['output'];
  planArchived: Scalars['Boolean']['output'];
  resequencingRecommended: Scalars['Boolean']['output'];
  secondOpinionOffered: Scalars['Boolean']['output'];
  supportOffered: Scalars['Boolean']['output'];
  translatorRegenerated: Scalars['Boolean']['output'];
  trialRematched: Scalars['Boolean']['output'];
};

export type ClinicianSummary = {
  __typename?: 'ClinicianSummary';
  context: Scalars['String']['output'];
  grade: Scalars['String']['output'];
  headline: Scalars['String']['output'];
  keyEndpoints: Array<Scalars['String']['output']>;
  limitations: Array<Scalars['String']['output']>;
  practiceImplication: Scalars['String']['output'];
  studyDesign: Scalars['String']['output'];
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

export type CommunicationGuide = {
  __typename?: 'CommunicationGuide';
  inPersonScript: Scalars['String']['output'];
  portalMessage: Scalars['String']['output'];
  reassurance: Scalars['String']['output'];
  recordsRequest: Scalars['String']['output'];
};

export type CommunityInsight = {
  __typename?: 'CommunityInsight';
  averageRating?: Maybe<Scalars['Float']['output']>;
  commonSideEffects: Array<CommunityInsightSideEffect>;
  drugName: Scalars['String']['output'];
  totalReports: Scalars['Int']['output'];
  trialSummary?: Maybe<CommunityTrialSummary>;
};

export type CommunityInsightSideEffect = {
  __typename?: 'CommunityInsightSideEffect';
  averageOnset?: Maybe<Scalars['String']['output']>;
  averageSeverity: Scalars['Float']['output'];
  effect: Scalars['String']['output'];
  reportedByPercent: Scalars['Float']['output'];
  resolvedPercent: Scalars['Float']['output'];
  topManagementTips: Array<Scalars['String']['output']>;
};

export type CommunityReport = {
  __typename?: 'CommunityReport';
  consentScope: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  moderationStatus: Scalars['String']['output'];
  narrative?: Maybe<Scalars['String']['output']>;
  patientId: Scalars['String']['output'];
  relatedDrug?: Maybe<Scalars['String']['output']>;
  relatedItemId?: Maybe<Scalars['String']['output']>;
  relatedTrialNctId?: Maybe<Scalars['String']['output']>;
  reportType: Scalars['String']['output'];
  structuredData: Scalars['JSON']['output'];
  verified: Scalars['Boolean']['output'];
};

export type CommunityTrialSummary = {
  __typename?: 'CommunityTrialSummary';
  averageRating: Scalars['Float']['output'];
  commonCons: Array<Scalars['String']['output']>;
  commonPros: Array<Scalars['String']['output']>;
  totalReports: Scalars['Int']['output'];
};

export type ConversationGuide = {
  __typename?: 'ConversationGuide';
  emailTemplate: Scalars['String']['output'];
  generatedAt: Scalars['String']['output'];
  orderingInstructions: Scalars['String']['output'];
  questionsToAsk: Array<DoctorQuestion>;
  talkingPoints: Array<TalkingPoint>;
};

export type CreateDenialInput = {
  claimNumber?: InputMaybe<Scalars['String']['input']>;
  denialCategory: Scalars['String']['input'];
  denialDate: Scalars['String']['input'];
  denialReason: Scalars['String']['input'];
  denialReasonCode?: InputMaybe<Scalars['String']['input']>;
  deniedService: Scalars['String']['input'];
  insurerName: Scalars['String']['input'];
  planType?: InputMaybe<Scalars['String']['input']>;
  serviceCategory: Scalars['String']['input'];
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

export type DigestItem = {
  __typename?: 'DigestItem';
  headline: Scalars['String']['output'];
  itemId: Scalars['String']['output'];
  maturityBadge: Scalars['String']['output'];
  relevanceReason?: Maybe<Scalars['String']['output']>;
  summary: Scalars['String']['output'];
  viewUrl: Scalars['String']['output'];
};

export type DigestPreview = {
  __typename?: 'DigestPreview';
  communityHighlights: Array<DigestItem>;
  landscapeHighlights: Array<DigestItem>;
  personallyRelevant: Array<DigestItem>;
  totalNewItems: Scalars['Int']['output'];
  trialUpdates: Array<DigestItem>;
  urgent: Array<DigestItem>;
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

export type FamilyReferralLink = {
  __typename?: 'FamilyReferralLink';
  emailBody: Scalars['String']['output'];
  emailSubject: Scalars['String']['output'];
  referralCode: Scalars['String']['output'];
  textMessage: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type FeedRelevanceItem = {
  __typename?: 'FeedRelevanceItem';
  dismissed: Scalars['Boolean']['output'];
  item: ResearchItem;
  personalizedNote?: Maybe<Scalars['String']['output']>;
  relevanceScore: Scalars['Int']['output'];
  saved: Scalars['Boolean']['output'];
  viewed: Scalars['Boolean']['output'];
};

export type FertilityAssessment = {
  __typename?: 'FertilityAssessment';
  createdAt: Scalars['DateTime']['output'];
  gonadotoxicityRisk: Scalars['String']['output'];
  id: Scalars['String']['output'];
  optionsPresented?: Maybe<Scalars['JSON']['output']>;
  patientId: Scalars['String']['output'];
  preservationCompleted?: Maybe<Scalars['Boolean']['output']>;
  preservationMethod?: Maybe<Scalars['String']['output']>;
  preservationPursued?: Maybe<Scalars['Boolean']['output']>;
  preservationWindowDays?: Maybe<Scalars['Int']['output']>;
  providerId?: Maybe<Scalars['String']['output']>;
  recommendation: Scalars['String']['output'];
  recommendationRationale?: Maybe<Scalars['String']['output']>;
  referralRequested: Scalars['Boolean']['output'];
  referralRequestedAt?: Maybe<Scalars['String']['output']>;
  riskFactors: Array<FertilityRiskFactor>;
  windowStatus: Scalars['String']['output'];
};

export type FertilityDiscussionGuide = {
  __typename?: 'FertilityDiscussionGuide';
  generatedAt: Scalars['String']['output'];
  keyFacts: Array<Scalars['String']['output']>;
  openingStatement: Scalars['String']['output'];
  questions: Array<Scalars['String']['output']>;
  timelineNotes: Array<Scalars['String']['output']>;
};

export type FertilityFinancialProgram = {
  __typename?: 'FertilityFinancialProgram';
  description: Scalars['String']['output'];
  eligibility: Scalars['String']['output'];
  eligible: Scalars['Boolean']['output'];
  maxBenefit: Scalars['String']['output'];
  name: Scalars['String']['output'];
  organization: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type FertilityProvider = {
  __typename?: 'FertilityProvider';
  address: Scalars['String']['output'];
  city: Scalars['String']['output'];
  distance?: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  letrozoleProtocol: Scalars['Boolean']['output'];
  livestrongPartner: Scalars['Boolean']['output'];
  longitude?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  oncofertilityCoordinator?: Maybe<Scalars['String']['output']>;
  oncologyExperience: Scalars['Boolean']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  randomStartProtocol: Scalars['Boolean']['output'];
  servicesOffered: Array<Scalars['String']['output']>;
  state: Scalars['String']['output'];
  type: Scalars['String']['output'];
  urgentPhone?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
  weekendAvailability: Scalars['Boolean']['output'];
  zipCode: Scalars['String']['output'];
};

export type FertilityRiskFactor = {
  __typename?: 'FertilityRiskFactor';
  agent: Scalars['String']['output'];
  amenorrheaRate?: Maybe<Scalars['String']['output']>;
  risk: Scalars['String']['output'];
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

export type FinancialUpdateCheck = {
  __typename?: 'FinancialUpdateCheck';
  hasPAPOpportunities: Scalars['Boolean']['output'];
  newApprovals: Array<ResearchItem>;
};

export type GenerateArticleInput = {
  cancerType?: InputMaybe<Scalars['String']['input']>;
  category: Scalars['String']['input'];
  primaryKeyword: Scalars['String']['input'];
  topic: Scalars['String']['input'];
  type: Scalars['String']['input'];
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

export type GenomicComparison = {
  __typename?: 'GenomicComparison';
  actionableChanges: Array<Scalars['String']['output']>;
  biomarkerChanges: Array<Scalars['String']['output']>;
  generatedAt: Scalars['String']['output'];
  hasNewData: Scalars['Boolean']['output'];
  patientSummary: Scalars['String']['output'];
  resistanceMutations: Array<Scalars['String']['output']>;
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

export type GlossaryTerm = {
  __typename?: 'GlossaryTerm';
  aliases: Array<Scalars['String']['output']>;
  category: Scalars['String']['output'];
  fullArticleSlug?: Maybe<Scalars['String']['output']>;
  fullDefinition?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  shortDefinition: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  term: Scalars['String']['output'];
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

export type IngestionBreakdown = {
  __typename?: 'IngestionBreakdown';
  clinicaltrials: SourceIngestionResult;
  fda: SourceIngestionResult;
  institutions: SourceIngestionResult;
  nih_reporter: SourceIngestionResult;
  preprints: SourceIngestionResult;
  pubmed: SourceIngestionResult;
};

export type IngestionCycleResult = {
  __typename?: 'IngestionCycleResult';
  classified: Scalars['Int']['output'];
  errors: Scalars['Int']['output'];
  ingested: Scalars['Int']['output'];
  skipped: Scalars['Int']['output'];
  summarized: Scalars['Int']['output'];
};

export type IngestionSyncState = {
  __typename?: 'IngestionSyncState';
  itemsIngestedLastRun: Scalars['Int']['output'];
  itemsIngestedTotal: Scalars['Int']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  lastItemDate?: Maybe<Scalars['String']['output']>;
  lastSyncAt?: Maybe<Scalars['String']['output']>;
  sourceId: Scalars['String']['output'];
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

export type InsuranceDenial = {
  __typename?: 'InsuranceDenial';
  appealDeadline?: Maybe<Scalars['String']['output']>;
  appealLetters: Array<AppealLetter>;
  claimNumber?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  denialCategory: Scalars['String']['output'];
  denialDate: Scalars['String']['output'];
  denialReason: Scalars['String']['output'];
  denialReasonCode?: Maybe<Scalars['String']['output']>;
  deniedService: Scalars['String']['output'];
  id: Scalars['String']['output'];
  insurerName: Scalars['String']['output'];
  patientId: Scalars['String']['output'];
  planType?: Maybe<Scalars['String']['output']>;
  serviceCategory: Scalars['String']['output'];
  status: Scalars['String']['output'];
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

export type KeyStatistic = {
  __typename?: 'KeyStatistic';
  label: Scalars['String']['output'];
  source?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
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

export type LandscapeOverview = {
  __typename?: 'LandscapeOverview';
  domainDistribution: Scalars['JSON']['output'];
  lastUpdated: Scalars['String']['output'];
  maturityDistribution: Scalars['JSON']['output'];
  recentHighlights: Array<ResearchItem>;
  subtypeDistribution: Scalars['JSON']['output'];
  totalItems: Scalars['Int']['output'];
  treatmentClassDistribution: Scalars['JSON']['output'];
};

export type LifestyleRecommendations = {
  __typename?: 'LifestyleRecommendations';
  alcohol: AlcoholRecommendation;
  environment: EnvironmentalRecommendation;
  exercise: ExerciseRecommendation;
  generatedAt: Scalars['String']['output'];
  nutrition: NutritionRecommendation;
};

export type LogisticsAssistanceApplication = {
  __typename?: 'LogisticsAssistanceApplication';
  appliedAt?: Maybe<Scalars['String']['output']>;
  assessmentId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  patientId: Scalars['String']['output'];
  programKey: Scalars['String']['output'];
  programName: Scalars['String']['output'];
  status: Scalars['String']['output'];
  statusUpdatedAt?: Maybe<Scalars['String']['output']>;
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
  acknowledgeRecurrence: RecurrenceEvent;
  addCareTeamMember: CareTeamMember;
  addCtdnaResult: CtdnaResult;
  addOrderNote: ManufacturingOrder;
  annualRefreshSCP: AnnualRefreshResult;
  archiveSurvivorshipPlan: Scalars['Boolean']['output'];
  assessFertilityRisk: FertilityAssessment;
  assessRegulatoryPathway: RegulatoryPathwayAssessment;
  assessTrialLogistics: TrialLogisticsAssessment;
  authorizeFhir: FhirAuthorizeResult;
  cancelPipelineJob: PipelineJob;
  checkArticleQuality: QualityCheckResult;
  checkInsuranceCoverage: InsuranceCoverage;
  completeTreatment: SurvivorshipPlan;
  computeRelevanceScores: Scalars['Int']['output'];
  confirmGenomics: GenomicResult;
  connectSite: ManufacturingOrder;
  createInsuranceDenial: InsuranceDenial;
  createManufacturingOrder: ManufacturingOrder;
  createPatientManual: Patient;
  createSecondOpinionRequest: SecondOpinionRequest;
  createSequencingOrder: SequencingOrder;
  deleteJournalEntry: Scalars['Boolean']['output'];
  extractDocument: Document;
  extractDocuments: ExtractionResult;
  extractFhir: Scalars['JSON']['output'];
  extractGenomicReport: GenomicResult;
  generateAppealLetter: AppealLetter;
  generateAppointmentPrep: AppointmentPrep;
  generateArticle: Article;
  generateCommunicationGuide: CommunicationGuide;
  generateFamilyReferralLink: FamilyReferralLink;
  generateFertilityDiscussionGuide: FertilityDiscussionGuide;
  generateLOMN: Lomn;
  generateLifestyleRecommendations: LifestyleRecommendations;
  generateLogisticsPlan: Scalars['JSON']['output'];
  generateMatches: Array<Match>;
  generatePeerReviewPrep: PeerReviewPrep;
  generatePersonalizedContext: ArticlePersonalizedContext;
  generateReadingPlan: ReadingPlan;
  generateRecordPacket: Scalars['JSON']['output'];
  generateRefreshSuggestion: RefreshSuggestion;
  generateRegulatoryDocument: RegulatoryDocument;
  generateReportPdf: ReportPdfResult;
  generateSequencingRecommendation: SequencingRecommendation;
  generateStandardOfCare: StandardOfCareSummary;
  insertPlatformLinks: Article;
  interpretGenomics: GenomicInterpretation;
  logout: Scalars['Boolean']['output'];
  markEventComplete: SurveillanceEvent;
  markItemDismissed: Scalars['Boolean']['output'];
  markItemSaved: Scalars['Boolean']['output'];
  markItemViewed: Scalars['Boolean']['output'];
  matchFinancialPrograms: Array<FinancialMatch>;
  migrateOldTaxonomy: TaxonomyMigrationResult;
  moderateCommunityReport: CommunityReport;
  publishArticle: Article;
  reclassifyItem: ResearchItem;
  recordSecondOpinionOutcome: SecondOpinionRequest;
  redeemReferralCode: ReferralRedemption;
  refreshSCP: SurvivorshipPlan;
  regenerateTranslator: RecurrenceEvent;
  rematch: MatchDelta;
  removeCareTeamMember: Scalars['Boolean']['output'];
  reportRecurrence: RecurrenceEvent;
  requestFertilityReferral: FertilityAssessment;
  requestGeneralUploadUrl: UploadUrlResult;
  requestMagicLink: Scalars['Boolean']['output'];
  requestUploadUrl: UploadUrl;
  rescheduleEvent: SurveillanceEvent;
  resyncFhirConnection: Scalars['JSON']['output'];
  revokeFhirConnection: Scalars['Boolean']['output'];
  runArticleQualityChecks: Scalars['JSON']['output'];
  runQCPipeline: QcResult;
  runRefreshCheckCycle: Scalars['JSON']['output'];
  savePatientIntake: Patient;
  selectSecondOpinionCenter: SecondOpinionRequest;
  skipEvent: SurveillanceEvent;
  submitCommunityReport: CommunityReport;
  submitFeedback: SurvivorshipFeedback;
  submitJournalEntry: JournalEntry;
  submitMonitoringReport: MonitoringReport;
  submitPipelineJob: PipelineJob;
  subscribeFinancialProgram: Scalars['Boolean']['output'];
  translateTreatment: TreatmentTranslation;
  triggerIngestion: IngestionCycleResult;
  updateAppealOutcome: AppealLetter;
  updateArticleStatus: Article;
  updateAssistanceApplication: LogisticsAssistanceApplication;
  updateCareTeamMember: CareTeamMember;
  updateCascadeStep: RecurrenceEvent;
  updateDenialStatus: InsuranceDenial;
  updateDigestPreferences: UserFeedConfig;
  updateFeedConfig: UserFeedConfig;
  updateFertilityOutcome: FertilityAssessment;
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


export type MutationAcknowledgeRecurrenceArgs = {
  recurrenceEventId: Scalars['String']['input'];
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


export type MutationAssessTrialLogisticsArgs = {
  matchId: Scalars['String']['input'];
};


export type MutationAuthorizeFhirArgs = {
  healthSystemId: Scalars['String']['input'];
};


export type MutationCancelPipelineJobArgs = {
  jobId: Scalars['String']['input'];
};


export type MutationCheckArticleQualityArgs = {
  articleId: Scalars['String']['input'];
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


export type MutationCreateInsuranceDenialArgs = {
  input: CreateDenialInput;
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


export type MutationGenerateAppealLetterArgs = {
  denialId: Scalars['String']['input'];
};


export type MutationGenerateAppointmentPrepArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationGenerateArticleArgs = {
  input: GenerateArticleInput;
};


export type MutationGenerateLomnArgs = {
  insurer?: InputMaybe<Scalars['String']['input']>;
  testType: Scalars['String']['input'];
};


export type MutationGenerateLogisticsPlanArgs = {
  matchId: Scalars['String']['input'];
};


export type MutationGeneratePeerReviewPrepArgs = {
  denialId: Scalars['String']['input'];
};


export type MutationGeneratePersonalizedContextArgs = {
  slug: Scalars['String']['input'];
};


export type MutationGenerateRefreshSuggestionArgs = {
  articleId: Scalars['String']['input'];
  triggerItemIds: Array<Scalars['String']['input']>;
};


export type MutationGenerateRegulatoryDocumentArgs = {
  assessmentId: Scalars['String']['input'];
  documentType: Scalars['String']['input'];
};


export type MutationGenerateReportPdfArgs = {
  pipelineJobId: Scalars['String']['input'];
  reportType: Scalars['String']['input'];
};


export type MutationGenerateStandardOfCareArgs = {
  subtype: Scalars['String']['input'];
};


export type MutationInsertPlatformLinksArgs = {
  articleId: Scalars['String']['input'];
};


export type MutationMarkEventCompleteArgs = {
  input: MarkEventCompleteInput;
};


export type MutationMarkItemDismissedArgs = {
  itemId: Scalars['String']['input'];
};


export type MutationMarkItemSavedArgs = {
  itemId: Scalars['String']['input'];
  saved: Scalars['Boolean']['input'];
};


export type MutationMarkItemViewedArgs = {
  itemId: Scalars['String']['input'];
};


export type MutationMatchFinancialProgramsArgs = {
  input: FinancialProfileInput;
};


export type MutationModerateCommunityReportArgs = {
  reportId: Scalars['String']['input'];
  status: Scalars['String']['input'];
};


export type MutationPublishArticleArgs = {
  articleId: Scalars['String']['input'];
};


export type MutationReclassifyItemArgs = {
  itemId: Scalars['String']['input'];
};


export type MutationRecordSecondOpinionOutcomeArgs = {
  input: RecordSecondOpinionOutcomeInput;
};


export type MutationRedeemReferralCodeArgs = {
  code: Scalars['String']['input'];
};


export type MutationRegenerateTranslatorArgs = {
  recurrenceEventId: Scalars['String']['input'];
};


export type MutationRemoveCareTeamMemberArgs = {
  memberId: Scalars['String']['input'];
};


export type MutationReportRecurrenceArgs = {
  input: ReportRecurrenceInput;
};


export type MutationRequestFertilityReferralArgs = {
  input: RequestFertilityReferralInput;
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


export type MutationRunQcPipelineArgs = {
  batchSize?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationSavePatientIntakeArgs = {
  input: PatientIntakeInput;
};


export type MutationSelectSecondOpinionCenterArgs = {
  input: SelectCenterInput;
};


export type MutationSkipEventArgs = {
  input: SkipEventInput;
};


export type MutationSubmitCommunityReportArgs = {
  input: SubmitCommunityReportInput;
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


export type MutationTriggerIngestionArgs = {
  sourceId: Scalars['String']['input'];
};


export type MutationUpdateAppealOutcomeArgs = {
  input: UpdateAppealOutcomeInput;
};


export type MutationUpdateArticleStatusArgs = {
  articleId: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
};


export type MutationUpdateAssistanceApplicationArgs = {
  input: UpdateAssistanceApplicationInput;
};


export type MutationUpdateCareTeamMemberArgs = {
  input: UpdateCareTeamMemberInput;
};


export type MutationUpdateCascadeStepArgs = {
  input: UpdateCascadeStepInput;
};


export type MutationUpdateDenialStatusArgs = {
  input: UpdateDenialStatusInput;
};


export type MutationUpdateDigestPreferencesArgs = {
  frequency?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateFeedConfigArgs = {
  input: UpdateFeedConfigInput;
};


export type MutationUpdateFertilityOutcomeArgs = {
  input: UpdateFertilityOutcomeInput;
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
  researchAlerts: Scalars['Boolean']['output'];
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

export type PeerReviewArgument = {
  __typename?: 'PeerReviewArgument';
  argument: Scalars['String']['output'];
  rebuttal: Scalars['String']['output'];
};

export type PeerReviewPrep = {
  __typename?: 'PeerReviewPrep';
  anticipatedArguments: Array<PeerReviewArgument>;
  generatedAt: Scalars['String']['output'];
  guidelines: Array<Scalars['String']['output']>;
  keyPoints: Array<Scalars['String']['output']>;
  reviewerQuestions: Array<Scalars['String']['output']>;
  tips: Array<Scalars['String']['output']>;
};

export type PersonalizedFeedFilters = {
  domains?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maturityTiers?: InputMaybe<Array<Scalars['String']['input']>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  practiceImpact?: InputMaybe<Scalars['String']['input']>;
  treatmentClasses?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type PersonalizedFeedResponse = {
  __typename?: 'PersonalizedFeedResponse';
  hasMore: Scalars['Boolean']['output'];
  items: Array<FeedRelevanceItem>;
  total: Scalars['Int']['output'];
};

export type PersonalizedNote = {
  __typename?: 'PersonalizedNote';
  itemId: Scalars['String']['output'];
  note: Scalars['String']['output'];
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

export type PreservationOption = {
  __typename?: 'PreservationOption';
  available: Scalars['Boolean']['output'];
  contraindications: Array<Scalars['String']['output']>;
  cost: Scalars['String']['output'];
  erPositiveNote?: Maybe<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  successRate: Scalars['String']['output'];
  timing: Scalars['String']['output'];
};

export type PreventivePrescreenInput = {
  age: Scalars['Int']['input'];
  cancerSubtype?: InputMaybe<Scalars['String']['input']>;
  estimatedLifetimeRisk?: InputMaybe<Scalars['Float']['input']>;
  hasBrca: Scalars['String']['input'];
  hasCancerHistory: Scalars['Boolean']['input'];
  hasFamilyHistory: Scalars['Boolean']['input'];
  hasOtherHighRisk: Scalars['String']['input'];
  treatmentStatus?: InputMaybe<Scalars['String']['input']>;
  zipCode?: InputMaybe<Scalars['String']['input']>;
};

export type PreventivePrescreenResult = {
  __typename?: 'PreventivePrescreenResult';
  matchedTrials: Array<PreventiveTrialMatch>;
  noMatchMessage?: Maybe<Scalars['String']['output']>;
  riskAssessmentCTA: Scalars['Boolean']['output'];
  totalPreventiveTrials: Scalars['Int']['output'];
};

export type PreventiveTrial = {
  __typename?: 'PreventiveTrial';
  briefSummary?: Maybe<Scalars['String']['output']>;
  curatedSummary?: Maybe<Scalars['String']['output']>;
  editorNote?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  keyResults?: Maybe<Scalars['String']['output']>;
  matchingCriteria?: Maybe<Scalars['JSON']['output']>;
  mechanism?: Maybe<Scalars['String']['output']>;
  nctId: Scalars['String']['output'];
  phase?: Maybe<Scalars['String']['output']>;
  sponsor?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  targetPopulation?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  trialCategory: Scalars['String']['output'];
  vaccineTarget?: Maybe<Scalars['String']['output']>;
};

export type PreventiveTrialMatch = {
  __typename?: 'PreventiveTrialMatch';
  matchReason: Scalars['String']['output'];
  matchStrength: Scalars['String']['output'];
  nextSteps: Scalars['String']['output'];
  trial: PreventiveTrial;
};

export type PriorTreatment = {
  __typename?: 'PriorTreatment';
  endDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  response?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type QcResult = {
  __typename?: 'QCResult';
  checked: Scalars['Int']['output'];
  contradictions: Scalars['Int']['output'];
  errors: Scalars['Int']['output'];
  retracted: Scalars['Int']['output'];
};

export type QualityCheckResult = {
  __typename?: 'QualityCheckResult';
  checkedAt: Scalars['String']['output'];
  issues: Array<QualityIssue>;
  score: Scalars['Int']['output'];
};

export type QualityIssue = {
  __typename?: 'QualityIssue';
  description: Scalars['String']['output'];
  section?: Maybe<Scalars['String']['output']>;
  severity: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  administrationSite?: Maybe<AdministrationSite>;
  administrationSites: Array<AdministrationSite>;
  appealLetter?: Maybe<AppealLetter>;
  appealRights: AppealRights;
  appealStrategy: AppealStrategy;
  appointmentPrep?: Maybe<AppointmentPrep>;
  article?: Maybe<Article>;
  articleEngagement: Array<ArticleEngagement>;
  articleRefreshStatus: ArticleRefreshStatus;
  articles: Array<Article>;
  articlesAdmin: Array<Article>;
  articlesByCategory: ArticleCategoryResult;
  articlesForResearchItem: Array<RelatedArticle>;
  assistanceApplications: Array<LogisticsAssistanceApplication>;
  assistancePrograms: Array<AssistanceProgramMatch>;
  careTeam: Array<CareTeamMember>;
  communityInsights?: Maybe<CommunityInsight>;
  communityInsightsForItem?: Maybe<CommunityInsight>;
  communityReports: Array<CommunityReport>;
  conversationGuide: ConversationGuide;
  ctdnaHistory: Array<CtdnaResult>;
  digestPreview: DigestPreview;
  documents: Array<Document>;
  feedConfig: UserFeedConfig;
  fertilityAssessment?: Maybe<FertilityAssessment>;
  fertilityFinancialPrograms: Array<FertilityFinancialProgram>;
  fertilityProviders: Array<FertilityProvider>;
  fhirConnections: Array<FhirConnection>;
  financialMatches: Array<FinancialMatch>;
  financialProgram?: Maybe<FinancialProgram>;
  financialPrograms: Array<FinancialProgram>;
  financialUpdates: FinancialUpdateCheck;
  generateReport?: Maybe<Scalars['JSON']['output']>;
  genomicComparison: GenomicComparison;
  genomicResult?: Maybe<GenomicResult>;
  genomicResults: Array<GenomicResult>;
  glossaryTerm?: Maybe<GlossaryTerm>;
  glossaryTerms: Array<GlossaryTerm>;
  healthSystems: Array<HealthSystem>;
  ingestionSyncStates: Array<IngestionSyncState>;
  insuranceDenial?: Maybe<InsuranceDenial>;
  insuranceDenials: Array<InsuranceDenial>;
  journalEntries: Array<JournalEntry>;
  journalTrends: JournalTrends;
  landscapeOverview: LandscapeOverview;
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
  personalizedFeed: PersonalizedFeedResponse;
  personalizedNote: PersonalizedNote;
  pipelineJob?: Maybe<PipelineJob>;
  pipelineJobs: Array<PipelineJob>;
  pipelineResults: PipelineResultDownloads;
  preservationOptions: Array<PreservationOption>;
  preventivePrescreen: PreventivePrescreenResult;
  preventiveTrials: Array<PreventiveTrial>;
  preventiveTrialsForFamily: Array<PreventiveTrialMatch>;
  readingPlan?: Maybe<ReadingPlan>;
  recentDevelopments: Array<ResearchItem>;
  recommendedPartners: Array<PartnerRecommendation>;
  recurrenceEvent?: Maybe<RecurrenceEvent>;
  recurrenceEvents: Array<RecurrenceEvent>;
  recurrencePreventionTrials: Array<PreventiveTrialMatch>;
  referralStats: ReferralStats;
  regulatoryAssessment?: Maybe<RegulatoryPathwayAssessment>;
  regulatoryAssessments: Array<RegulatoryPathwayAssessment>;
  regulatoryDocument?: Maybe<RegulatoryDocument>;
  regulatoryDocuments: Array<RegulatoryDocument>;
  relatedResearch: Array<RelatedResearchItem>;
  reportPdf: ReportPdfResult;
  researchItem?: Maybe<ResearchItem>;
  researchItems: Array<ResearchItem>;
  routeSymptom: SymptomRouting;
  searchArticles: Array<Article>;
  searchResearch: Array<ResearchItem>;
  secondOpinionCenters: Array<SecondOpinionCenter>;
  secondOpinionEvaluation: SecondOpinionEvaluation;
  secondOpinionRequest?: Maybe<SecondOpinionRequest>;
  secondOpinionResources: Array<SecondOpinionResource>;
  sequencingBrief: Scalars['String']['output'];
  sequencingExplanation: SequencingExplanation;
  sequencingOrder?: Maybe<SequencingOrder>;
  sequencingOrders: Array<SequencingOrder>;
  sequencingProviders: Array<SequencingProvider>;
  sequencingRecommendation: SequencingRecommendation;
  subtypeLandscape: SubtypeLandscape;
  surveillanceSchedule: Array<SurveillanceEvent>;
  survivorshipFeedback: Array<SurvivorshipFeedback>;
  survivorshipPlan?: Maybe<SurvivorshipPlan>;
  survivorshipUpdates: SurvivorshipUpdateCheck;
  testRecommendation: TestRecommendation;
  translatorUpdates: TranslatorUpdateCheck;
  treatmentPipeline: Array<TreatmentPipelineEntry>;
  trial?: Maybe<Trial>;
  trialLogisticsAssessment?: Maybe<TrialLogisticsAssessment>;
  trialLogisticsAssessments: Array<TrialLogisticsAssessment>;
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


export type QueryAppealLetterArgs = {
  id: Scalars['String']['input'];
};


export type QueryAppealRightsArgs = {
  state?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAppealStrategyArgs = {
  denialCategory: Scalars['String']['input'];
};


export type QueryAppointmentPrepArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryArticleArgs = {
  slug: Scalars['String']['input'];
};


export type QueryArticleRefreshStatusArgs = {
  articleId: Scalars['String']['input'];
};


export type QueryArticlesArgs = {
  filters?: InputMaybe<ArticleFilters>;
};


export type QueryArticlesAdminArgs = {
  filters?: InputMaybe<ArticleAdminFilters>;
};


export type QueryArticlesByCategoryArgs = {
  category: Scalars['String']['input'];
};


export type QueryArticlesForResearchItemArgs = {
  itemId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCommunityInsightsArgs = {
  drugName: Scalars['String']['input'];
};


export type QueryCommunityInsightsForItemArgs = {
  itemId: Scalars['String']['input'];
};


export type QueryFertilityProvidersArgs = {
  filters?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFinancialProgramArgs = {
  programId: Scalars['String']['input'];
};


export type QueryGenerateReportArgs = {
  pipelineJobId: Scalars['String']['input'];
  reportType: Scalars['String']['input'];
};


export type QueryGenomicComparisonArgs = {
  recurrenceEventId: Scalars['String']['input'];
};


export type QueryGenomicResultArgs = {
  id: Scalars['String']['input'];
};


export type QueryGlossaryTermArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGlossaryTermsArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
};


export type QueryHealthSystemsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryInsuranceDenialArgs = {
  id: Scalars['String']['input'];
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


export type QueryPersonalizedFeedArgs = {
  filters?: InputMaybe<PersonalizedFeedFilters>;
};


export type QueryPersonalizedNoteArgs = {
  itemId: Scalars['String']['input'];
};


export type QueryPipelineJobArgs = {
  id: Scalars['String']['input'];
};


export type QueryPipelineResultsArgs = {
  pipelineJobId: Scalars['String']['input'];
};


export type QueryPreventivePrescreenArgs = {
  input: PreventivePrescreenInput;
};


export type QueryPreventiveTrialsArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRecentDevelopmentsArgs = {
  days?: InputMaybe<Scalars['Int']['input']>;
  subtype?: InputMaybe<Scalars['String']['input']>;
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


export type QueryRelatedResearchArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  slug: Scalars['String']['input'];
};


export type QueryReportPdfArgs = {
  pipelineJobId: Scalars['String']['input'];
  reportType: Scalars['String']['input'];
};


export type QueryResearchItemArgs = {
  id: Scalars['String']['input'];
};


export type QueryResearchItemsArgs = {
  filters?: InputMaybe<ResearchItemFilters>;
};


export type QueryRouteSymptomArgs = {
  symptom: Scalars['String']['input'];
};


export type QuerySearchArticlesArgs = {
  filters?: InputMaybe<ArticleFilters>;
  query: Scalars['String']['input'];
};


export type QuerySearchResearchArgs = {
  filters?: InputMaybe<ResearchItemFilters>;
  query: Scalars['String']['input'];
};


export type QuerySecondOpinionCentersArgs = {
  subspecialty?: InputMaybe<Scalars['String']['input']>;
  virtual?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QuerySequencingBriefArgs = {
  insurer?: InputMaybe<Scalars['String']['input']>;
  providerIds: Array<Scalars['String']['input']>;
  testType: Scalars['String']['input'];
};


export type QuerySequencingOrderArgs = {
  id: Scalars['String']['input'];
};


export type QuerySubtypeLandscapeArgs = {
  subtype: Scalars['String']['input'];
};


export type QueryTestRecommendationArgs = {
  preferComprehensive?: InputMaybe<Scalars['Boolean']['input']>;
  tissueAvailable?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryTreatmentPipelineArgs = {
  subtype?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTrialArgs = {
  id: Scalars['String']['input'];
};


export type QueryTrialLogisticsAssessmentArgs = {
  matchId: Scalars['String']['input'];
};


export type QueryTrialsArgs = {
  cancerType?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  phase?: InputMaybe<Scalars['String']['input']>;
};

export type ReadingPlan = {
  __typename?: 'ReadingPlan';
  readNow: Array<ReadingPlanItem>;
  readSoon: Array<ReadingPlanItem>;
  whenReady: Array<ReadingPlanItem>;
};

export type ReadingPlanItem = {
  __typename?: 'ReadingPlanItem';
  articleSlug: Scalars['String']['output'];
  articleTitle: Scalars['String']['output'];
  priority: Scalars['String']['output'];
  reason: Scalars['String']['output'];
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

export type RecordSecondOpinionOutcomeInput = {
  outcome: Scalars['String']['input'];
  outcomeSummary?: InputMaybe<Scalars['String']['input']>;
};

export type RecurrenceEvent = {
  __typename?: 'RecurrenceEvent';
  acknowledgedAt?: Maybe<Scalars['String']['output']>;
  cascadeStatus: CascadeStatus;
  confirmedByBiopsy: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  ctdnaResultId?: Maybe<Scalars['String']['output']>;
  detectedDate: Scalars['String']['output'];
  detectionMethod: Scalars['String']['output'];
  documentUploadId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  newBiomarkers?: Maybe<Scalars['JSON']['output']>;
  newPathologyAvailable: Scalars['Boolean']['output'];
  newStage?: Maybe<Scalars['String']['output']>;
  patientId: Scalars['String']['output'];
  priorTreatments: Array<Scalars['String']['output']>;
  recurrenceSites: Array<Scalars['String']['output']>;
  recurrenceType?: Maybe<Scalars['String']['output']>;
  timeSinceCompletion?: Maybe<Scalars['Int']['output']>;
  timeSinceInitialDx?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ReferralRedemption = {
  __typename?: 'ReferralRedemption';
  prefillFamilyHistory: Scalars['Boolean']['output'];
  success: Scalars['Boolean']['output'];
};

export type ReferralStats = {
  __typename?: 'ReferralStats';
  totalRedeemed: Scalars['Int']['output'];
  totalSent: Scalars['Int']['output'];
};

export type RefreshSuggestion = {
  __typename?: 'RefreshSuggestion';
  newDataToIncorporate: Array<Scalars['String']['output']>;
  referencesToAdd: Array<Scalars['String']['output']>;
  sectionsToUpdate: Array<Scalars['String']['output']>;
  summary: Scalars['String']['output'];
};

export type RefreshTrigger = {
  __typename?: 'RefreshTrigger';
  articleId: Scalars['String']['output'];
  articleSlug: Scalars['String']['output'];
  articleTitle: Scalars['String']['output'];
  triggerItems: Array<RefreshTriggerItem>;
  urgency: Scalars['String']['output'];
};

export type RefreshTriggerItem = {
  __typename?: 'RefreshTriggerItem';
  id: Scalars['String']['output'];
  maturityTier?: Maybe<Scalars['String']['output']>;
  practiceImpact?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
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

export type RelatedArticle = {
  __typename?: 'RelatedArticle';
  category: Scalars['String']['output'];
  patientSummary: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  viewCount: Scalars['Int']['output'];
};

export type RelatedResearchItem = {
  __typename?: 'RelatedResearchItem';
  id: Scalars['String']['output'];
  maturityTier?: Maybe<Scalars['String']['output']>;
  patientSummary?: Maybe<Scalars['String']['output']>;
  practiceImpact?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['String']['output']>;
  sourceType: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ReportPdfResult = {
  __typename?: 'ReportPdfResult';
  cached: Scalars['Boolean']['output'];
  url: Scalars['String']['output'];
};

export type ReportRecurrenceInput = {
  confirmedByBiopsy?: InputMaybe<Scalars['Boolean']['input']>;
  detectedDate: Scalars['String']['input'];
  detectionMethod: Scalars['String']['input'];
  documentUploadId?: InputMaybe<Scalars['String']['input']>;
  newStage?: InputMaybe<Scalars['String']['input']>;
  recurrenceSites?: InputMaybe<Array<Scalars['String']['input']>>;
  recurrenceType?: InputMaybe<Scalars['String']['input']>;
};

export type RequestFertilityReferralInput = {
  assessmentId: Scalars['String']['input'];
  providerId: Scalars['String']['input'];
};

export type RescheduleEventInput = {
  eventId: Scalars['String']['input'];
  newDueDate: Scalars['String']['input'];
};

export type ResearchItem = {
  __typename?: 'ResearchItem';
  authorCOI?: Maybe<Scalars['String']['output']>;
  authors: Array<Scalars['String']['output']>;
  biomarkerRelevance: Array<Scalars['String']['output']>;
  breastSubtypes: Array<Scalars['String']['output']>;
  cancerTypes: Array<Scalars['String']['output']>;
  classificationConfidence?: Maybe<Scalars['Float']['output']>;
  classificationStatus: Scalars['String']['output'];
  clinicianSummary?: Maybe<ClinicianSummary>;
  contradictedBy: Array<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  doi?: Maybe<Scalars['String']['output']>;
  domains: Array<Scalars['String']['output']>;
  drugNames: Array<Scalars['String']['output']>;
  evidenceLevel?: Maybe<Scalars['String']['output']>;
  hypeFlags: Array<Scalars['String']['output']>;
  hypeScore?: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  industrySponsored?: Maybe<Scalars['Boolean']['output']>;
  institutions: Array<Scalars['String']['output']>;
  journalName?: Maybe<Scalars['String']['output']>;
  keyEndpoints?: Maybe<Scalars['JSON']['output']>;
  maturityTier?: Maybe<Scalars['String']['output']>;
  patientSummary?: Maybe<Scalars['String']['output']>;
  practiceImpact?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['String']['output']>;
  rawContent?: Maybe<Scalars['String']['output']>;
  relatedItemIds: Array<Scalars['String']['output']>;
  retractionStatus?: Maybe<Scalars['String']['output']>;
  sourceCredibility: Scalars['String']['output'];
  sourceItemId?: Maybe<Scalars['String']['output']>;
  sourceType: Scalars['String']['output'];
  sourceUrl?: Maybe<Scalars['String']['output']>;
  sponsorName?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  treatmentClasses: Array<Scalars['String']['output']>;
  treatmentStages: Array<Scalars['String']['output']>;
  trialNctIds: Array<Scalars['String']['output']>;
};

export type ResearchItemFilters = {
  breastSubtypes?: InputMaybe<Array<Scalars['String']['input']>>;
  cancerTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  domains?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maturityTiers?: InputMaybe<Array<Scalars['String']['input']>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  practiceImpact?: InputMaybe<Scalars['String']['input']>;
  treatmentClasses?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ScpDiff = {
  __typename?: 'SCPDiff';
  addedItems: Array<Scalars['String']['output']>;
  changedSections: Array<Scalars['String']['output']>;
  removedItems: Array<Scalars['String']['output']>;
  summary: Scalars['String']['output'];
};

export type SecondOpinionCenter = {
  __typename?: 'SecondOpinionCenter';
  acceptsInsurance: Array<Scalars['String']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  averageWaitDays?: Maybe<Scalars['Int']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  coordinator?: Maybe<Scalars['String']['output']>;
  distance?: Maybe<Scalars['Float']['output']>;
  estimatedCostInsured?: Maybe<Scalars['String']['output']>;
  estimatedCostUninsured?: Maybe<Scalars['String']['output']>;
  financialAssistance: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  intakeFormUrl?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  nciDesignation?: Maybe<Scalars['String']['output']>;
  offersVirtual: Scalars['Boolean']['output'];
  pathologyReReview: Scalars['Boolean']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  subspecialties: Array<Scalars['String']['output']>;
  virtualPlatform?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type SecondOpinionEvaluation = {
  __typename?: 'SecondOpinionEvaluation';
  overallSeverity: Scalars['String']['output'];
  recommended: Scalars['Boolean']['output'];
  triggers: Array<SecondOpinionTriggerResult>;
};

export type SecondOpinionRequest = {
  __typename?: 'SecondOpinionRequest';
  appointmentDate?: Maybe<Scalars['String']['output']>;
  centerId?: Maybe<Scalars['String']['output']>;
  centerName?: Maybe<Scalars['String']['output']>;
  clinicalSummary?: Maybe<Scalars['String']['output']>;
  communicationGuide?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isVirtual?: Maybe<Scalars['Boolean']['output']>;
  outcome?: Maybe<Scalars['String']['output']>;
  outcomeSummary?: Maybe<Scalars['String']['output']>;
  patientId: Scalars['String']['output'];
  questionsForReview: Array<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  triggerReasons: Scalars['JSON']['output'];
  triggerSeverity: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SecondOpinionResource = {
  __typename?: 'SecondOpinionResource';
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  url: Scalars['String']['output'];
  virtual: Scalars['Boolean']['output'];
};

export type SecondOpinionTrigger = {
  __typename?: 'SecondOpinionTrigger';
  level: Scalars['String']['output'];
  reason: Scalars['String']['output'];
};

export type SecondOpinionTriggerResult = {
  __typename?: 'SecondOpinionTriggerResult';
  evidenceBase: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  rationale: Scalars['String']['output'];
  severity: Scalars['String']['output'];
};

export type SelectCenterInput = {
  appointmentDate?: InputMaybe<Scalars['String']['input']>;
  centerId: Scalars['String']['input'];
  isVirtual: Scalars['Boolean']['input'];
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

export type SourceIngestionResult = {
  __typename?: 'SourceIngestionResult';
  errors: Scalars['Int']['output'];
  ingested: Scalars['Int']['output'];
  skipped: Scalars['Int']['output'];
};

export type StandardOfCareSummary = {
  __typename?: 'StandardOfCareSummary';
  currentSOC: Scalars['String']['output'];
  generatedAt: Scalars['String']['output'];
  subtype: Scalars['String']['output'];
  whatsBeingExplored: Scalars['String']['output'];
  whatsChanging: Scalars['String']['output'];
  whatsComing: Scalars['String']['output'];
};

export type StateProtection = {
  __typename?: 'StateProtection';
  cancerSpecific: Scalars['String']['output'];
  clinicalTrialCoverage: Scalars['Boolean']['output'];
  fertilityMandate: Scalars['Boolean']['output'];
  stepTherapyProtection: Scalars['Boolean']['output'];
};

export type SubmitCommunityReportInput = {
  consentScope: Scalars['String']['input'];
  narrative?: InputMaybe<Scalars['String']['input']>;
  relatedDrug?: InputMaybe<Scalars['String']['input']>;
  relatedItemId?: InputMaybe<Scalars['String']['input']>;
  relatedTrialNctId?: InputMaybe<Scalars['String']['input']>;
  reportType: Scalars['String']['input'];
  structuredData: Scalars['JSON']['input'];
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

export type SubtypeLandscape = {
  __typename?: 'SubtypeLandscape';
  availableNow: Array<ResearchItem>;
  domainDistribution: Scalars['JSON']['output'];
  earlyResearch: Array<ResearchItem>;
  expectedSoon: Array<ResearchItem>;
  inTrials: Array<ResearchItem>;
  maturityDistribution: Scalars['JSON']['output'];
  standardOfCare?: Maybe<StandardOfCareSummary>;
  subtype: Scalars['String']['output'];
  subtypeLabel: Scalars['String']['output'];
  topDrugs: Array<TreatmentPipelineEntry>;
  totalItems: Scalars['Int']['output'];
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

export type SurvivorshipUpdateCheck = {
  __typename?: 'SurvivorshipUpdateCheck';
  ctdnaItems: Array<ResearchItem>;
  hasUpdates: Scalars['Boolean']['output'];
  lateEffectsItems: Array<ResearchItem>;
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

export type TaxonomyMigrationResult = {
  __typename?: 'TaxonomyMigrationResult';
  breastSubtypesUpdated: Scalars['Int']['output'];
  practiceImpactUpdated: Scalars['Int']['output'];
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

export type TranslatorUpdateCheck = {
  __typename?: 'TranslatorUpdateCheck';
  count: Scalars['Int']['output'];
  hasUpdates: Scalars['Boolean']['output'];
  items: Array<ResearchItem>;
  since: Scalars['String']['output'];
};

export type TreatmentCompletionInput = {
  completionDate: Scalars['String']['input'];
  completionType: Scalars['String']['input'];
  newSymptoms?: InputMaybe<Scalars['String']['input']>;
  ongoingTherapies: Array<Scalars['String']['input']>;
  wantsReminders: Scalars['Boolean']['input'];
};

export type TreatmentPipelineEntry = {
  __typename?: 'TreatmentPipelineEntry';
  drugName: Scalars['String']['output'];
  itemCount: Scalars['Int']['output'];
  latestItemId: Scalars['String']['output'];
  latestItemTitle: Scalars['String']['output'];
  latestPublishedAt?: Maybe<Scalars['String']['output']>;
  maturityTier: Scalars['String']['output'];
  treatmentClass: Scalars['String']['output'];
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

export type TrialLogisticsAssessment = {
  __typename?: 'TrialLogisticsAssessment';
  barriers: Array<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  distanceMiles?: Maybe<Scalars['Float']['output']>;
  estimatedCosts?: Maybe<Scalars['JSON']['output']>;
  estimatedOutOfPocket?: Maybe<Scalars['Float']['output']>;
  feasibilityScore: Scalars['String']['output'];
  id: Scalars['String']['output'];
  logisticsPlan?: Maybe<Scalars['String']['output']>;
  logisticsPlanGeneratedAt?: Maybe<Scalars['String']['output']>;
  matchId: Scalars['String']['output'];
  matchedPrograms?: Maybe<Scalars['JSON']['output']>;
  patientId: Scalars['String']['output'];
  siteId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type UpdateAppealOutcomeInput = {
  appealId: Scalars['String']['input'];
  outcome: Scalars['String']['input'];
  outcomeDate?: InputMaybe<Scalars['String']['input']>;
  outcomeDetails?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateAssistanceApplicationInput = {
  assessmentId: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  programKey: Scalars['String']['input'];
  status: Scalars['String']['input'];
};

export type UpdateCareTeamMemberInput = {
  contactFor?: InputMaybe<Array<Scalars['String']['input']>>;
  memberId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  practice?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCascadeStepInput = {
  recurrenceEventId: Scalars['String']['input'];
  step: Scalars['String']['input'];
  value: Scalars['Boolean']['input'];
};

export type UpdateDenialStatusInput = {
  denialId: Scalars['String']['input'];
  status: Scalars['String']['input'];
};

export type UpdateFeedConfigInput = {
  audienceType?: InputMaybe<Scalars['String']['input']>;
  contentDepth?: InputMaybe<Scalars['String']['input']>;
  digestFrequency?: InputMaybe<Scalars['String']['input']>;
  showNegativeResults?: InputMaybe<Scalars['Boolean']['input']>;
  showPreclinical?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateFertilityOutcomeInput = {
  assessmentId: Scalars['String']['input'];
  preservationCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  preservationMethod?: InputMaybe<Scalars['String']['input']>;
  preservationPursued?: InputMaybe<Scalars['Boolean']['input']>;
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

export type UserFeedConfig = {
  __typename?: 'UserFeedConfig';
  audienceType: Scalars['String']['output'];
  contentDepth: Scalars['String']['output'];
  digestFrequency?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  showNegativeResults: Scalars['Boolean']['output'];
  showPreclinical: Scalars['Boolean']['output'];
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

export type GetInsuranceDenialsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetInsuranceDenialsQuery = { __typename?: 'Query', insuranceDenials: Array<{ __typename?: 'InsuranceDenial', id: string, patientId: string, deniedService: string, serviceCategory: string, denialDate: string, insurerName: string, planType?: string | null, claimNumber?: string | null, denialReason: string, denialCategory: string, appealDeadline?: string | null, status: string, createdAt: string, appealLetters: Array<{ __typename?: 'AppealLetter', id: string, appealLevel: string, generatedAt: string, submittedAt?: string | null, outcome?: string | null }> }> };

export type GetInsuranceDenialQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetInsuranceDenialQuery = { __typename?: 'Query', insuranceDenial?: { __typename?: 'InsuranceDenial', id: string, patientId: string, deniedService: string, serviceCategory: string, denialDate: string, insurerName: string, planType?: string | null, claimNumber?: string | null, denialReason: string, denialReasonCode?: string | null, denialCategory: string, appealDeadline?: string | null, status: string, createdAt: string, appealLetters: Array<{ __typename?: 'AppealLetter', id: string, denialId: string, appealLevel: string, letterContent: string, supportingDocuments: Array<string>, patientSummary?: string | null, generatedAt: string, submittedAt?: string | null, outcome?: string | null, outcomeDate?: string | null, outcomeDetails?: string | null }> } | null };

export type GetAppealLetterQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetAppealLetterQuery = { __typename?: 'Query', appealLetter?: { __typename?: 'AppealLetter', id: string, denialId: string, appealLevel: string, letterContent: string, supportingDocuments: Array<string>, patientSummary?: string | null, generatedAt: string, submittedAt?: string | null, outcome?: string | null, outcomeDate?: string | null, outcomeDetails?: string | null } | null };

export type GetAppealStrategyQueryVariables = Exact<{
  denialCategory: Scalars['String']['input'];
}>;


export type GetAppealStrategyQuery = { __typename?: 'Query', appealStrategy: { __typename?: 'AppealStrategy', name: string, levels: Array<string>, successRates: Record<string, unknown>, supportingEvidence: Array<string> } };

export type GetAppealRightsQueryVariables = Exact<{
  state?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAppealRightsQuery = { __typename?: 'Query', appealRights: { __typename?: 'AppealRights', acaRights: { __typename?: 'AcaRights', internalAppealDays: number, urgentInternalHours: number, externalReviewAvailable: boolean, externalReviewDays: number, continuationOfCoverage: boolean }, stateProtections?: { __typename?: 'StateProtection', fertilityMandate: boolean, clinicalTrialCoverage: boolean, stepTherapyProtection: boolean, cancerSpecific: string } | null } };

export type CreateInsuranceDenialMutationVariables = Exact<{
  input: CreateDenialInput;
}>;


export type CreateInsuranceDenialMutation = { __typename?: 'Mutation', createInsuranceDenial: { __typename?: 'InsuranceDenial', id: string, deniedService: string, serviceCategory: string, denialDate: string, insurerName: string, denialReason: string, denialCategory: string, appealDeadline?: string | null, status: string, createdAt: string } };

export type GenerateAppealLetterMutationVariables = Exact<{
  denialId: Scalars['String']['input'];
}>;


export type GenerateAppealLetterMutation = { __typename?: 'Mutation', generateAppealLetter: { __typename?: 'AppealLetter', id: string, denialId: string, appealLevel: string, letterContent: string, supportingDocuments: Array<string>, patientSummary?: string | null, generatedAt: string } };

export type UpdateAppealOutcomeMutationVariables = Exact<{
  input: UpdateAppealOutcomeInput;
}>;


export type UpdateAppealOutcomeMutation = { __typename?: 'Mutation', updateAppealOutcome: { __typename?: 'AppealLetter', id: string, outcome?: string | null, outcomeDate?: string | null, outcomeDetails?: string | null } };

export type UpdateDenialStatusMutationVariables = Exact<{
  input: UpdateDenialStatusInput;
}>;


export type UpdateDenialStatusMutation = { __typename?: 'Mutation', updateDenialStatus: { __typename?: 'InsuranceDenial', id: string, status: string } };

export type GeneratePeerReviewPrepMutationVariables = Exact<{
  denialId: Scalars['String']['input'];
}>;


export type GeneratePeerReviewPrepMutation = { __typename?: 'Mutation', generatePeerReviewPrep: { __typename?: 'PeerReviewPrep', keyPoints: Array<string>, guidelines: Array<string>, reviewerQuestions: Array<string>, tips: Array<string>, generatedAt: string, anticipatedArguments: Array<{ __typename?: 'PeerReviewArgument', argument: string, rebuttal: string }> } };

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

export type GetFertilityAssessmentQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFertilityAssessmentQuery = { __typename?: 'Query', fertilityAssessment?: { __typename?: 'FertilityAssessment', id: string, patientId: string, gonadotoxicityRisk: string, preservationWindowDays?: number | null, windowStatus: string, recommendation: string, recommendationRationale?: string | null, optionsPresented?: Record<string, unknown> | null, referralRequested: boolean, referralRequestedAt?: string | null, providerId?: string | null, preservationPursued?: boolean | null, preservationMethod?: string | null, preservationCompleted?: boolean | null, createdAt: string, riskFactors: Array<{ __typename?: 'FertilityRiskFactor', agent: string, risk: string, amenorrheaRate?: string | null }> } | null };

export type GetPreservationOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPreservationOptionsQuery = { __typename?: 'Query', preservationOptions: Array<{ __typename?: 'PreservationOption', key: string, label: string, timing: string, cost: string, successRate: string, contraindications: Array<string>, erPositiveNote?: string | null, available: boolean }> };

export type GetFertilityProvidersQueryVariables = Exact<{
  filters?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetFertilityProvidersQuery = { __typename?: 'Query', fertilityProviders: Array<{ __typename?: 'FertilityProvider', id: string, name: string, type: string, address: string, city: string, state: string, zipCode: string, distance?: number | null, servicesOffered: Array<string>, oncologyExperience: boolean, randomStartProtocol: boolean, letrozoleProtocol: boolean, weekendAvailability: boolean, livestrongPartner: boolean, phone?: string | null, urgentPhone?: string | null, website?: string | null, oncofertilityCoordinator?: string | null }> };

export type GetFertilityFinancialProgramsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFertilityFinancialProgramsQuery = { __typename?: 'Query', fertilityFinancialPrograms: Array<{ __typename?: 'FertilityFinancialProgram', name: string, organization: string, url: string, description: string, eligibility: string, maxBenefit: string, eligible: boolean }> };

export type AssessFertilityRiskMutationVariables = Exact<{ [key: string]: never; }>;


export type AssessFertilityRiskMutation = { __typename?: 'Mutation', assessFertilityRisk: { __typename?: 'FertilityAssessment', id: string, patientId: string, gonadotoxicityRisk: string, preservationWindowDays?: number | null, windowStatus: string, recommendation: string, recommendationRationale?: string | null, createdAt: string, riskFactors: Array<{ __typename?: 'FertilityRiskFactor', agent: string, risk: string, amenorrheaRate?: string | null }> } };

export type GenerateFertilityDiscussionGuideMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateFertilityDiscussionGuideMutation = { __typename?: 'Mutation', generateFertilityDiscussionGuide: { __typename?: 'FertilityDiscussionGuide', openingStatement: string, questions: Array<string>, keyFacts: Array<string>, timelineNotes: Array<string>, generatedAt: string } };

export type RequestFertilityReferralMutationVariables = Exact<{
  input: RequestFertilityReferralInput;
}>;


export type RequestFertilityReferralMutation = { __typename?: 'Mutation', requestFertilityReferral: { __typename?: 'FertilityAssessment', id: string, referralRequested: boolean, referralRequestedAt?: string | null, providerId?: string | null } };

export type UpdateFertilityOutcomeMutationVariables = Exact<{
  input: UpdateFertilityOutcomeInput;
}>;


export type UpdateFertilityOutcomeMutation = { __typename?: 'Mutation', updateFertilityOutcome: { __typename?: 'FertilityAssessment', id: string, preservationPursued?: boolean | null, preservationMethod?: string | null, preservationCompleted?: boolean | null } };

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

export type GetResearchItemsQueryVariables = Exact<{
  filters?: InputMaybe<ResearchItemFilters>;
}>;


export type GetResearchItemsQuery = { __typename?: 'Query', researchItems: Array<{ __typename?: 'ResearchItem', id: string, sourceType: string, sourceUrl?: string | null, sourceCredibility: string, title: string, journalName?: string | null, doi?: string | null, publishedAt?: string | null, cancerTypes: Array<string>, breastSubtypes: Array<string>, maturityTier?: string | null, domains: Array<string>, treatmentClasses: Array<string>, biomarkerRelevance: Array<string>, evidenceLevel?: string | null, practiceImpact?: string | null, patientSummary?: string | null, drugNames: Array<string>, hypeScore?: number | null, hypeFlags: Array<string>, retractionStatus?: string | null, classificationStatus: string, createdAt: string }> };

export type GetResearchItemQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetResearchItemQuery = { __typename?: 'Query', researchItem?: { __typename?: 'ResearchItem', id: string, sourceType: string, sourceItemId?: string | null, sourceUrl?: string | null, sourceCredibility: string, title: string, rawContent?: string | null, authors: Array<string>, institutions: Array<string>, journalName?: string | null, doi?: string | null, publishedAt?: string | null, cancerTypes: Array<string>, breastSubtypes: Array<string>, maturityTier?: string | null, domains: Array<string>, treatmentClasses: Array<string>, biomarkerRelevance: Array<string>, treatmentStages: Array<string>, evidenceLevel?: string | null, practiceImpact?: string | null, classificationConfidence?: number | null, patientSummary?: string | null, keyEndpoints?: Record<string, unknown> | null, drugNames: Array<string>, trialNctIds: Array<string>, retractionStatus?: string | null, industrySponsored?: boolean | null, sponsorName?: string | null, authorCOI?: string | null, hypeScore?: number | null, hypeFlags: Array<string>, relatedItemIds: Array<string>, contradictedBy: Array<string>, classificationStatus: string, createdAt: string, clinicianSummary?: { __typename?: 'ClinicianSummary', headline: string, keyEndpoints: Array<string>, studyDesign: string, context: string, practiceImplication: string, limitations: Array<string>, grade: string } | null } | null };

export type SearchResearchQueryVariables = Exact<{
  query: Scalars['String']['input'];
  filters?: InputMaybe<ResearchItemFilters>;
}>;


export type SearchResearchQuery = { __typename?: 'Query', searchResearch: Array<{ __typename?: 'ResearchItem', id: string, sourceType: string, sourceUrl?: string | null, sourceCredibility: string, title: string, journalName?: string | null, doi?: string | null, publishedAt?: string | null, cancerTypes: Array<string>, breastSubtypes: Array<string>, maturityTier?: string | null, domains: Array<string>, treatmentClasses: Array<string>, evidenceLevel?: string | null, practiceImpact?: string | null, patientSummary?: string | null, drugNames: Array<string>, hypeFlags: Array<string>, retractionStatus?: string | null, classificationStatus: string, createdAt: string }> };

export type GetIngestionSyncStatesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetIngestionSyncStatesQuery = { __typename?: 'Query', ingestionSyncStates: Array<{ __typename?: 'IngestionSyncState', sourceId: string, lastSyncAt?: string | null, lastItemDate?: string | null, itemsIngestedTotal: number, itemsIngestedLastRun: number, lastError?: string | null }> };

export type TriggerIngestionMutationVariables = Exact<{
  sourceId: Scalars['String']['input'];
}>;


export type TriggerIngestionMutation = { __typename?: 'Mutation', triggerIngestion: { __typename?: 'IngestionCycleResult', ingested: number, classified: number, summarized: number, skipped: number, errors: number } };

export type ReclassifyItemMutationVariables = Exact<{
  itemId: Scalars['String']['input'];
}>;


export type ReclassifyItemMutation = { __typename?: 'Mutation', reclassifyItem: { __typename?: 'ResearchItem', id: string, maturityTier?: string | null, domains: Array<string>, evidenceLevel?: string | null, practiceImpact?: string | null, patientSummary?: string | null, classificationStatus: string } };

export type RunQcPipelineMutationVariables = Exact<{
  batchSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type RunQcPipelineMutation = { __typename?: 'Mutation', runQCPipeline: { __typename?: 'QCResult', checked: number, retracted: number, contradictions: number, errors: number } };

export type MigrateOldTaxonomyMutationVariables = Exact<{ [key: string]: never; }>;


export type MigrateOldTaxonomyMutation = { __typename?: 'Mutation', migrateOldTaxonomy: { __typename?: 'TaxonomyMigrationResult', practiceImpactUpdated: number, breastSubtypesUpdated: number } };

export type GetPersonalizedFeedQueryVariables = Exact<{
  filters?: InputMaybe<PersonalizedFeedFilters>;
}>;


export type GetPersonalizedFeedQuery = { __typename?: 'Query', personalizedFeed: { __typename?: 'PersonalizedFeedResponse', total: number, hasMore: boolean, items: Array<{ __typename?: 'FeedRelevanceItem', relevanceScore: number, personalizedNote?: string | null, viewed: boolean, saved: boolean, dismissed: boolean, item: { __typename?: 'ResearchItem', id: string, sourceType: string, sourceUrl?: string | null, sourceCredibility: string, title: string, journalName?: string | null, doi?: string | null, publishedAt?: string | null, cancerTypes: Array<string>, breastSubtypes: Array<string>, maturityTier?: string | null, domains: Array<string>, treatmentClasses: Array<string>, biomarkerRelevance: Array<string>, evidenceLevel?: string | null, practiceImpact?: string | null, patientSummary?: string | null, drugNames: Array<string>, hypeScore?: number | null, hypeFlags: Array<string>, retractionStatus?: string | null, classificationStatus: string, createdAt: string } }> } };

export type GetPersonalizedNoteQueryVariables = Exact<{
  itemId: Scalars['String']['input'];
}>;


export type GetPersonalizedNoteQuery = { __typename?: 'Query', personalizedNote: { __typename?: 'PersonalizedNote', itemId: string, note: string } };

export type GetFeedConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFeedConfigQuery = { __typename?: 'Query', feedConfig: { __typename?: 'UserFeedConfig', id: string, audienceType: string, contentDepth: string, showPreclinical: boolean, showNegativeResults: boolean, digestFrequency?: string | null } };

export type MarkItemViewedMutationVariables = Exact<{
  itemId: Scalars['String']['input'];
}>;


export type MarkItemViewedMutation = { __typename?: 'Mutation', markItemViewed: boolean };

export type MarkItemSavedMutationVariables = Exact<{
  itemId: Scalars['String']['input'];
  saved: Scalars['Boolean']['input'];
}>;


export type MarkItemSavedMutation = { __typename?: 'Mutation', markItemSaved: boolean };

export type MarkItemDismissedMutationVariables = Exact<{
  itemId: Scalars['String']['input'];
}>;


export type MarkItemDismissedMutation = { __typename?: 'Mutation', markItemDismissed: boolean };

export type UpdateFeedConfigMutationVariables = Exact<{
  input: UpdateFeedConfigInput;
}>;


export type UpdateFeedConfigMutation = { __typename?: 'Mutation', updateFeedConfig: { __typename?: 'UserFeedConfig', id: string, audienceType: string, contentDepth: string, showPreclinical: boolean, showNegativeResults: boolean, digestFrequency?: string | null } };

export type ComputeRelevanceScoresMutationVariables = Exact<{ [key: string]: never; }>;


export type ComputeRelevanceScoresMutation = { __typename?: 'Mutation', computeRelevanceScores: number };

export type GetCommunityReportsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCommunityReportsQuery = { __typename?: 'Query', communityReports: Array<{ __typename?: 'CommunityReport', id: string, patientId: string, reportType: string, consentScope: string, structuredData: Record<string, unknown>, narrative?: string | null, moderationStatus: string, verified: boolean, relatedDrug?: string | null, relatedTrialNctId?: string | null, relatedItemId?: string | null, createdAt: string }> };

export type GetCommunityInsightsQueryVariables = Exact<{
  drugName: Scalars['String']['input'];
}>;


export type GetCommunityInsightsQuery = { __typename?: 'Query', communityInsights?: { __typename?: 'CommunityInsight', drugName: string, totalReports: number, averageRating?: number | null, commonSideEffects: Array<{ __typename?: 'CommunityInsightSideEffect', effect: string, reportedByPercent: number, averageSeverity: number, averageOnset?: string | null, resolvedPercent: number, topManagementTips: Array<string> }>, trialSummary?: { __typename?: 'CommunityTrialSummary', totalReports: number, averageRating: number, commonPros: Array<string>, commonCons: Array<string> } | null } | null };

export type GetCommunityInsightsForItemQueryVariables = Exact<{
  itemId: Scalars['String']['input'];
}>;


export type GetCommunityInsightsForItemQuery = { __typename?: 'Query', communityInsightsForItem?: { __typename?: 'CommunityInsight', drugName: string, totalReports: number, averageRating?: number | null, commonSideEffects: Array<{ __typename?: 'CommunityInsightSideEffect', effect: string, reportedByPercent: number, averageSeverity: number, averageOnset?: string | null, resolvedPercent: number, topManagementTips: Array<string> }>, trialSummary?: { __typename?: 'CommunityTrialSummary', totalReports: number, averageRating: number, commonPros: Array<string>, commonCons: Array<string> } | null } | null };

export type GetDigestPreviewQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDigestPreviewQuery = { __typename?: 'Query', digestPreview: { __typename?: 'DigestPreview', totalNewItems: number, urgent: Array<{ __typename?: 'DigestItem', itemId: string, headline: string, summary: string, maturityBadge: string, relevanceReason?: string | null, viewUrl: string }>, personallyRelevant: Array<{ __typename?: 'DigestItem', itemId: string, headline: string, summary: string, maturityBadge: string, relevanceReason?: string | null, viewUrl: string }>, landscapeHighlights: Array<{ __typename?: 'DigestItem', itemId: string, headline: string, summary: string, maturityBadge: string, relevanceReason?: string | null, viewUrl: string }>, communityHighlights: Array<{ __typename?: 'DigestItem', itemId: string, headline: string, summary: string, maturityBadge: string, relevanceReason?: string | null, viewUrl: string }>, trialUpdates: Array<{ __typename?: 'DigestItem', itemId: string, headline: string, summary: string, maturityBadge: string, relevanceReason?: string | null, viewUrl: string }> } };

export type SubmitCommunityReportMutationVariables = Exact<{
  input: SubmitCommunityReportInput;
}>;


export type SubmitCommunityReportMutation = { __typename?: 'Mutation', submitCommunityReport: { __typename?: 'CommunityReport', id: string, reportType: string, consentScope: string, structuredData: Record<string, unknown>, narrative?: string | null, moderationStatus: string, verified: boolean, relatedDrug?: string | null, relatedTrialNctId?: string | null, createdAt: string } };

export type ModerateCommunityReportMutationVariables = Exact<{
  reportId: Scalars['String']['input'];
  status: Scalars['String']['input'];
}>;


export type ModerateCommunityReportMutation = { __typename?: 'Mutation', moderateCommunityReport: { __typename?: 'CommunityReport', id: string, moderationStatus: string } };

export type UpdateDigestPreferencesMutationVariables = Exact<{
  frequency?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateDigestPreferencesMutation = { __typename?: 'Mutation', updateDigestPreferences: { __typename?: 'UserFeedConfig', id: string, audienceType: string, contentDepth: string, showPreclinical: boolean, showNegativeResults: boolean, digestFrequency?: string | null } };

export type GetLandscapeOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLandscapeOverviewQuery = { __typename?: 'Query', landscapeOverview: { __typename?: 'LandscapeOverview', totalItems: number, maturityDistribution: Record<string, unknown>, domainDistribution: Record<string, unknown>, subtypeDistribution: Record<string, unknown>, treatmentClassDistribution: Record<string, unknown>, lastUpdated: string, recentHighlights: Array<{ __typename?: 'ResearchItem', id: string, sourceType: string, title: string, maturityTier?: string | null, practiceImpact?: string | null, patientSummary?: string | null, drugNames: Array<string>, publishedAt?: string | null }> } };

export type GetSubtypeLandscapeQueryVariables = Exact<{
  subtype: Scalars['String']['input'];
}>;


export type GetSubtypeLandscapeQuery = { __typename?: 'Query', subtypeLandscape: { __typename?: 'SubtypeLandscape', subtype: string, subtypeLabel: string, totalItems: number, maturityDistribution: Record<string, unknown>, domainDistribution: Record<string, unknown>, standardOfCare?: { __typename?: 'StandardOfCareSummary', subtype: string, currentSOC: string, whatsChanging: string, whatsComing: string, whatsBeingExplored: string, generatedAt: string } | null, availableNow: Array<{ __typename?: 'ResearchItem', id: string, title: string, maturityTier?: string | null, practiceImpact?: string | null, patientSummary?: string | null, drugNames: Array<string>, publishedAt?: string | null }>, expectedSoon: Array<{ __typename?: 'ResearchItem', id: string, title: string, maturityTier?: string | null, practiceImpact?: string | null, patientSummary?: string | null, drugNames: Array<string>, publishedAt?: string | null }>, inTrials: Array<{ __typename?: 'ResearchItem', id: string, title: string, maturityTier?: string | null, practiceImpact?: string | null, patientSummary?: string | null, drugNames: Array<string>, publishedAt?: string | null }>, earlyResearch: Array<{ __typename?: 'ResearchItem', id: string, title: string, maturityTier?: string | null, practiceImpact?: string | null, patientSummary?: string | null, drugNames: Array<string>, publishedAt?: string | null }>, topDrugs: Array<{ __typename?: 'TreatmentPipelineEntry', drugName: string, maturityTier: string, treatmentClass: string, itemCount: number, latestItemId: string, latestItemTitle: string, latestPublishedAt?: string | null }> } };

export type GetTreatmentPipelineQueryVariables = Exact<{
  subtype?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetTreatmentPipelineQuery = { __typename?: 'Query', treatmentPipeline: Array<{ __typename?: 'TreatmentPipelineEntry', drugName: string, maturityTier: string, treatmentClass: string, itemCount: number, latestItemId: string, latestItemTitle: string, latestPublishedAt?: string | null }> };

export type GetRecentDevelopmentsQueryVariables = Exact<{
  subtype?: InputMaybe<Scalars['String']['input']>;
  days?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRecentDevelopmentsQuery = { __typename?: 'Query', recentDevelopments: Array<{ __typename?: 'ResearchItem', id: string, sourceType: string, title: string, maturityTier?: string | null, practiceImpact?: string | null, patientSummary?: string | null, drugNames: Array<string>, publishedAt?: string | null }> };

export type GetTranslatorUpdatesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTranslatorUpdatesQuery = { __typename?: 'Query', translatorUpdates: { __typename?: 'TranslatorUpdateCheck', hasUpdates: boolean, count: number, since: string, items: Array<{ __typename?: 'ResearchItem', id: string, title: string, maturityTier?: string | null, practiceImpact?: string | null, drugNames: Array<string>, publishedAt?: string | null }> } };

export type GetFinancialUpdatesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFinancialUpdatesQuery = { __typename?: 'Query', financialUpdates: { __typename?: 'FinancialUpdateCheck', hasPAPOpportunities: boolean, newApprovals: Array<{ __typename?: 'ResearchItem', id: string, title: string, maturityTier?: string | null, practiceImpact?: string | null, drugNames: Array<string>, publishedAt?: string | null }> } };

export type GetSurvivorshipUpdatesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSurvivorshipUpdatesQuery = { __typename?: 'Query', survivorshipUpdates: { __typename?: 'SurvivorshipUpdateCheck', hasUpdates: boolean, lateEffectsItems: Array<{ __typename?: 'ResearchItem', id: string, title: string, maturityTier?: string | null, domains: Array<string>, patientSummary?: string | null, publishedAt?: string | null }>, ctdnaItems: Array<{ __typename?: 'ResearchItem', id: string, title: string, maturityTier?: string | null, treatmentClasses: Array<string>, patientSummary?: string | null, publishedAt?: string | null }> } };

export type GenerateStandardOfCareMutationVariables = Exact<{
  subtype: Scalars['String']['input'];
}>;


export type GenerateStandardOfCareMutation = { __typename?: 'Mutation', generateStandardOfCare: { __typename?: 'StandardOfCareSummary', subtype: string, currentSOC: string, whatsChanging: string, whatsComing: string, whatsBeingExplored: string, generatedAt: string } };

export type GetArticleQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetArticleQuery = { __typename?: 'Query', article?: { __typename?: 'Article', id: string, slug: string, type: string, title: string, metaTitle: string, metaDescription: string, patientSummary: string, keyTakeaways: Array<string>, references?: Record<string, unknown> | null, cancerTypes: Array<string>, breastSubtypes: Array<string>, biomarkers: Array<string>, treatmentClasses: Array<string>, journeyStages: Array<string>, audienceLevel: string, category: string, primaryKeyword: string, secondaryKeywords: Array<string>, relatedArticleSlugs: Array<string>, glossaryTerms: Array<string>, viewCount: number, publishedAt?: string | null, createdAt: string, patientContent: Array<{ __typename?: 'ArticleSection', heading: string, body: string }>, clinicalContent?: Array<{ __typename?: 'ArticleSection', heading: string, body: string }> | null, actionItems?: Array<{ __typename?: 'ArticleActionItem', text: string, link?: string | null }> | null, keyStatistics?: Array<{ __typename?: 'KeyStatistic', label: string, value: string, source?: string | null }> | null } | null };

export type GetArticlesQueryVariables = Exact<{
  filters?: InputMaybe<ArticleFilters>;
}>;


export type GetArticlesQuery = { __typename?: 'Query', articles: Array<{ __typename?: 'Article', id: string, slug: string, type: string, title: string, patientSummary: string, keyTakeaways: Array<string>, cancerTypes: Array<string>, breastSubtypes: Array<string>, journeyStages: Array<string>, audienceLevel: string, category: string, viewCount: number, publishedAt?: string | null }> };

export type GetArticlesByCategoryQueryVariables = Exact<{
  category: Scalars['String']['input'];
}>;


export type GetArticlesByCategoryQuery = { __typename?: 'Query', articlesByCategory: { __typename?: 'ArticleCategoryResult', label: string, description: string, articles: Array<{ __typename?: 'Article', id: string, slug: string, type: string, title: string, patientSummary: string, keyTakeaways: Array<string>, journeyStages: Array<string>, audienceLevel: string, viewCount: number, publishedAt?: string | null }> } };

export type SearchArticlesQueryVariables = Exact<{
  query: Scalars['String']['input'];
  filters?: InputMaybe<ArticleFilters>;
}>;


export type SearchArticlesQuery = { __typename?: 'Query', searchArticles: Array<{ __typename?: 'Article', id: string, slug: string, type: string, title: string, patientSummary: string, category: string, publishedAt?: string | null }> };

export type GetGlossaryTermsQueryVariables = Exact<{
  category?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetGlossaryTermsQuery = { __typename?: 'Query', glossaryTerms: Array<{ __typename?: 'GlossaryTerm', id: string, term: string, slug: string, shortDefinition: string, fullDefinition?: string | null, fullArticleSlug?: string | null, aliases: Array<string>, category: string }> };

export type GetGlossaryTermQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetGlossaryTermQuery = { __typename?: 'Query', glossaryTerm?: { __typename?: 'GlossaryTerm', id: string, term: string, slug: string, shortDefinition: string, fullDefinition?: string | null, fullArticleSlug?: string | null, aliases: Array<string>, category: string } | null };

export type GetReadingPlanQueryVariables = Exact<{ [key: string]: never; }>;


export type GetReadingPlanQuery = { __typename?: 'Query', readingPlan?: { __typename?: 'ReadingPlan', readNow: Array<{ __typename?: 'ReadingPlanItem', articleSlug: string, articleTitle: string, reason: string, priority: string }>, readSoon: Array<{ __typename?: 'ReadingPlanItem', articleSlug: string, articleTitle: string, reason: string, priority: string }>, whenReady: Array<{ __typename?: 'ReadingPlanItem', articleSlug: string, articleTitle: string, reason: string, priority: string }> } | null };

export type GetArticlesAdminQueryVariables = Exact<{
  filters?: InputMaybe<ArticleAdminFilters>;
}>;


export type GetArticlesAdminQuery = { __typename?: 'Query', articlesAdmin: Array<{ __typename?: 'Article', id: string, slug: string, type: string, title: string, patientSummary: string, category: string, status: string, viewCount: number, publishedAt?: string | null, createdAt: string }> };

export type GenerateArticleMutationVariables = Exact<{
  input: GenerateArticleInput;
}>;


export type GenerateArticleMutation = { __typename?: 'Mutation', generateArticle: { __typename?: 'Article', id: string, slug: string, title: string, status: string, category: string, createdAt: string } };

export type PublishArticleMutationVariables = Exact<{
  articleId: Scalars['String']['input'];
}>;


export type PublishArticleMutation = { __typename?: 'Mutation', publishArticle: { __typename?: 'Article', id: string, slug: string, status: string, publishedAt?: string | null } };

export type GeneratePersonalizedContextMutationVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GeneratePersonalizedContextMutation = { __typename?: 'Mutation', generatePersonalizedContext: { __typename?: 'ArticlePersonalizedContext', content: string, generatedAt: string } };

export type GenerateReadingPlanMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateReadingPlanMutation = { __typename?: 'Mutation', generateReadingPlan: { __typename?: 'ReadingPlan', readNow: Array<{ __typename?: 'ReadingPlanItem', articleSlug: string, articleTitle: string, reason: string, priority: string }>, readSoon: Array<{ __typename?: 'ReadingPlanItem', articleSlug: string, articleTitle: string, reason: string, priority: string }>, whenReady: Array<{ __typename?: 'ReadingPlanItem', articleSlug: string, articleTitle: string, reason: string, priority: string }> } };

export type UpdateArticleStatusMutationVariables = Exact<{
  articleId: Scalars['String']['input'];
  status: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateArticleStatusMutation = { __typename?: 'Mutation', updateArticleStatus: { __typename?: 'Article', id: string, slug: string, status: string, publishedAt?: string | null } };

export type CheckArticleQualityMutationVariables = Exact<{
  articleId: Scalars['String']['input'];
}>;


export type CheckArticleQualityMutation = { __typename?: 'Mutation', checkArticleQuality: { __typename?: 'QualityCheckResult', score: number, checkedAt: string, issues: Array<{ __typename?: 'QualityIssue', type: string, severity: string, description: string, section?: string | null }> } };

export type RunArticleQualityChecksMutationVariables = Exact<{ [key: string]: never; }>;


export type RunArticleQualityChecksMutation = { __typename?: 'Mutation', runArticleQualityChecks: Record<string, unknown> };

export type InsertPlatformLinksMutationVariables = Exact<{
  articleId: Scalars['String']['input'];
}>;


export type InsertPlatformLinksMutation = { __typename?: 'Mutation', insertPlatformLinks: { __typename?: 'Article', id: string, slug: string, actionItems?: Array<{ __typename?: 'ArticleActionItem', text: string, link?: string | null }> | null } };

export type GetRelatedResearchQueryVariables = Exact<{
  slug: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRelatedResearchQuery = { __typename?: 'Query', relatedResearch: Array<{ __typename?: 'RelatedResearchItem', id: string, title: string, maturityTier?: string | null, patientSummary?: string | null, publishedAt?: string | null, sourceType: string, practiceImpact?: string | null }> };

export type GetArticlesForResearchItemQueryVariables = Exact<{
  itemId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetArticlesForResearchItemQuery = { __typename?: 'Query', articlesForResearchItem: Array<{ __typename?: 'RelatedArticle', slug: string, title: string, category: string, patientSummary: string, viewCount: number }> };

export type GetArticleRefreshStatusQueryVariables = Exact<{
  articleId: Scalars['String']['input'];
}>;


export type GetArticleRefreshStatusQuery = { __typename?: 'Query', articleRefreshStatus: { __typename?: 'ArticleRefreshStatus', needsRefresh: boolean, urgency?: string | null, triggers: Array<{ __typename?: 'RefreshTriggerItem', id: string, title: string, maturityTier?: string | null, practiceImpact?: string | null, publishedAt?: string | null }>, suggestion?: { __typename?: 'RefreshSuggestion', sectionsToUpdate: Array<string>, newDataToIncorporate: Array<string>, referencesToAdd: Array<string>, summary: string } | null } };

export type GetArticleEngagementQueryVariables = Exact<{ [key: string]: never; }>;


export type GetArticleEngagementQuery = { __typename?: 'Query', articleEngagement: Array<{ __typename?: 'ArticleEngagement', id: string, slug: string, title: string, category: string, viewCount: number, publishedAt?: string | null }> };

export type GenerateRefreshSuggestionMutationVariables = Exact<{
  articleId: Scalars['String']['input'];
  triggerItemIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GenerateRefreshSuggestionMutation = { __typename?: 'Mutation', generateRefreshSuggestion: { __typename?: 'RefreshSuggestion', sectionsToUpdate: Array<string>, newDataToIncorporate: Array<string>, referencesToAdd: Array<string>, summary: string } };

export type RunRefreshCheckCycleMutationVariables = Exact<{ [key: string]: never; }>;


export type RunRefreshCheckCycleMutation = { __typename?: 'Mutation', runRefreshCheckCycle: Record<string, unknown> };

export type GetTrialLogisticsAssessmentQueryVariables = Exact<{
  matchId: Scalars['String']['input'];
}>;


export type GetTrialLogisticsAssessmentQuery = { __typename?: 'Query', trialLogisticsAssessment?: { __typename?: 'TrialLogisticsAssessment', id: string, patientId: string, matchId: string, siteId?: string | null, distanceMiles?: number | null, estimatedCosts?: Record<string, unknown> | null, matchedPrograms?: Record<string, unknown> | null, estimatedOutOfPocket?: number | null, feasibilityScore: string, barriers: Array<string>, logisticsPlan?: string | null, logisticsPlanGeneratedAt?: string | null, createdAt: string, updatedAt: string } | null };

export type GetTrialLogisticsAssessmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTrialLogisticsAssessmentsQuery = { __typename?: 'Query', trialLogisticsAssessments: Array<{ __typename?: 'TrialLogisticsAssessment', id: string, patientId: string, matchId: string, distanceMiles?: number | null, estimatedOutOfPocket?: number | null, feasibilityScore: string, barriers: Array<string>, logisticsPlan?: string | null, createdAt: string }> };

export type GetAssistanceProgramsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAssistanceProgramsQuery = { __typename?: 'Query', assistancePrograms: Array<{ __typename?: 'AssistanceProgramMatch', key: string, name: string, provider: string, category: string, description: string, coverage: string, phone?: string | null, url?: string | null, eligibility: string, eligible: boolean, eligibleReason?: string | null }> };

export type GetAssistanceApplicationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAssistanceApplicationsQuery = { __typename?: 'Query', assistanceApplications: Array<{ __typename?: 'LogisticsAssistanceApplication', id: string, patientId: string, assessmentId: string, programKey: string, programName: string, status: string, appliedAt?: string | null, statusUpdatedAt?: string | null, notes?: string | null, createdAt: string }> };

export type AssessTrialLogisticsMutationVariables = Exact<{
  matchId: Scalars['String']['input'];
}>;


export type AssessTrialLogisticsMutation = { __typename?: 'Mutation', assessTrialLogistics: { __typename?: 'TrialLogisticsAssessment', id: string, patientId: string, matchId: string, siteId?: string | null, distanceMiles?: number | null, estimatedCosts?: Record<string, unknown> | null, matchedPrograms?: Record<string, unknown> | null, estimatedOutOfPocket?: number | null, feasibilityScore: string, barriers: Array<string>, createdAt: string } };

export type GenerateLogisticsPlanMutationVariables = Exact<{
  matchId: Scalars['String']['input'];
}>;


export type GenerateLogisticsPlanMutation = { __typename?: 'Mutation', generateLogisticsPlan: Record<string, unknown> };

export type UpdateAssistanceApplicationMutationVariables = Exact<{
  input: UpdateAssistanceApplicationInput;
}>;


export type UpdateAssistanceApplicationMutation = { __typename?: 'Mutation', updateAssistanceApplication: { __typename?: 'LogisticsAssistanceApplication', id: string, programKey: string, programName: string, status: string, appliedAt?: string | null, statusUpdatedAt?: string | null, notes?: string | null } };

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

export type GetPreventiveTrialsQueryVariables = Exact<{
  category?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetPreventiveTrialsQuery = { __typename?: 'Query', preventiveTrials: Array<{ __typename?: 'PreventiveTrial', id: string, nctId: string, title: string, trialCategory: string, phase?: string | null, status?: string | null, sponsor?: string | null, briefSummary?: string | null, curatedSummary?: string | null, targetPopulation?: string | null, vaccineTarget?: string | null, mechanism?: string | null, keyResults?: string | null, editorNote?: string | null, matchingCriteria?: Record<string, unknown> | null }> };

export type RunPreventivePrescreenQueryVariables = Exact<{
  input: PreventivePrescreenInput;
}>;


export type RunPreventivePrescreenQuery = { __typename?: 'Query', preventivePrescreen: { __typename?: 'PreventivePrescreenResult', totalPreventiveTrials: number, noMatchMessage?: string | null, riskAssessmentCTA: boolean, matchedTrials: Array<{ __typename?: 'PreventiveTrialMatch', matchStrength: string, matchReason: string, nextSteps: string, trial: { __typename?: 'PreventiveTrial', id: string, nctId: string, title: string, trialCategory: string, phase?: string | null, status?: string | null, sponsor?: string | null, briefSummary?: string | null, curatedSummary?: string | null, targetPopulation?: string | null, vaccineTarget?: string | null, mechanism?: string | null, keyResults?: string | null, editorNote?: string | null } }> } };

export type GetPreventiveTrialsForFamilyQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPreventiveTrialsForFamilyQuery = { __typename?: 'Query', preventiveTrialsForFamily: Array<{ __typename?: 'PreventiveTrialMatch', matchStrength: string, matchReason: string, nextSteps: string, trial: { __typename?: 'PreventiveTrial', id: string, nctId: string, title: string, trialCategory: string, phase?: string | null, status?: string | null, sponsor?: string | null, briefSummary?: string | null, curatedSummary?: string | null, targetPopulation?: string | null, vaccineTarget?: string | null, mechanism?: string | null, keyResults?: string | null, editorNote?: string | null } }> };

export type GetRecurrencePreventionTrialsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRecurrencePreventionTrialsQuery = { __typename?: 'Query', recurrencePreventionTrials: Array<{ __typename?: 'PreventiveTrialMatch', matchStrength: string, matchReason: string, nextSteps: string, trial: { __typename?: 'PreventiveTrial', id: string, nctId: string, title: string, trialCategory: string, phase?: string | null, status?: string | null, sponsor?: string | null, briefSummary?: string | null, curatedSummary?: string | null, targetPopulation?: string | null, vaccineTarget?: string | null, mechanism?: string | null, keyResults?: string | null, editorNote?: string | null } }> };

export type GetReferralStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetReferralStatsQuery = { __typename?: 'Query', referralStats: { __typename?: 'ReferralStats', totalSent: number, totalRedeemed: number } };

export type GenerateFamilyReferralLinkMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateFamilyReferralLinkMutation = { __typename?: 'Mutation', generateFamilyReferralLink: { __typename?: 'FamilyReferralLink', referralCode: string, url: string, textMessage: string, emailSubject: string, emailBody: string } };

export type RedeemReferralCodeMutationVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type RedeemReferralCodeMutation = { __typename?: 'Mutation', redeemReferralCode: { __typename?: 'ReferralRedemption', success: boolean, prefillFamilyHistory: boolean } };

export type GetSecondOpinionEvaluationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSecondOpinionEvaluationQuery = { __typename?: 'Query', secondOpinionEvaluation: { __typename?: 'SecondOpinionEvaluation', overallSeverity: string, recommended: boolean, triggers: Array<{ __typename?: 'SecondOpinionTriggerResult', id: string, name: string, severity: string, rationale: string, evidenceBase: string }> } };

export type GetSecondOpinionRequestQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSecondOpinionRequestQuery = { __typename?: 'Query', secondOpinionRequest?: { __typename?: 'SecondOpinionRequest', id: string, patientId: string, triggerReasons: Record<string, unknown>, triggerSeverity: string, status: string, centerId?: string | null, centerName?: string | null, isVirtual?: boolean | null, appointmentDate?: string | null, clinicalSummary?: string | null, questionsForReview: Array<string>, communicationGuide?: Record<string, unknown> | null, outcome?: string | null, outcomeSummary?: string | null, createdAt: string, updatedAt: string } | null };

export type GetSecondOpinionCentersQueryVariables = Exact<{
  virtual?: InputMaybe<Scalars['Boolean']['input']>;
  subspecialty?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetSecondOpinionCentersQuery = { __typename?: 'Query', secondOpinionCenters: Array<{ __typename?: 'SecondOpinionCenter', id: string, name: string, nciDesignation?: string | null, subspecialties: Array<string>, offersVirtual: boolean, virtualPlatform?: string | null, averageWaitDays?: number | null, pathologyReReview: boolean, address?: string | null, city?: string | null, state?: string | null, distance?: number | null, acceptsInsurance: Array<string>, estimatedCostInsured?: string | null, estimatedCostUninsured?: string | null, financialAssistance: boolean, coordinator?: string | null, phone?: string | null, website?: string | null, intakeFormUrl?: string | null }> };

export type CreateSecondOpinionRequestMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateSecondOpinionRequestMutation = { __typename?: 'Mutation', createSecondOpinionRequest: { __typename?: 'SecondOpinionRequest', id: string, patientId: string, triggerReasons: Record<string, unknown>, triggerSeverity: string, status: string, createdAt: string } };

export type GenerateRecordPacketMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateRecordPacketMutation = { __typename?: 'Mutation', generateRecordPacket: Record<string, unknown> };

export type GenerateCommunicationGuideMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateCommunicationGuideMutation = { __typename?: 'Mutation', generateCommunicationGuide: { __typename?: 'CommunicationGuide', portalMessage: string, inPersonScript: string, recordsRequest: string, reassurance: string } };

export type SelectSecondOpinionCenterMutationVariables = Exact<{
  input: SelectCenterInput;
}>;


export type SelectSecondOpinionCenterMutation = { __typename?: 'Mutation', selectSecondOpinionCenter: { __typename?: 'SecondOpinionRequest', id: string, centerId?: string | null, centerName?: string | null, isVirtual?: boolean | null, appointmentDate?: string | null, status: string } };

export type RecordSecondOpinionOutcomeMutationVariables = Exact<{
  input: RecordSecondOpinionOutcomeInput;
}>;


export type RecordSecondOpinionOutcomeMutation = { __typename?: 'Mutation', recordSecondOpinionOutcome: { __typename?: 'SecondOpinionRequest', id: string, outcome?: string | null, outcomeSummary?: string | null, status: string } };

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

export type GetRecurrenceEventQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRecurrenceEventQuery = { __typename?: 'Query', recurrenceEvent?: { __typename?: 'RecurrenceEvent', id: string, patientId: string, detectedDate: string, detectionMethod: string, recurrenceType?: string | null, recurrenceSites: Array<string>, confirmedByBiopsy: boolean, newPathologyAvailable: boolean, newStage?: string | null, timeSinceInitialDx?: number | null, timeSinceCompletion?: number | null, ctdnaResultId?: string | null, priorTreatments: Array<string>, documentUploadId?: string | null, acknowledgedAt?: string | null, createdAt: string, updatedAt: string, cascadeStatus: { __typename?: 'CascadeStatus', acknowledged: boolean, supportOffered: boolean, resequencingRecommended: boolean, trialRematched: boolean, financialRematched: boolean, secondOpinionOffered: boolean, careTeamUpdated: boolean, translatorRegenerated: boolean, planArchived: boolean, pipelineActivated: boolean, genomicComparisonReady: boolean } } | null };

export type GetRecurrenceEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRecurrenceEventsQuery = { __typename?: 'Query', recurrenceEvents: Array<{ __typename?: 'RecurrenceEvent', id: string, detectedDate: string, detectionMethod: string, recurrenceType?: string | null, confirmedByBiopsy: boolean, acknowledgedAt?: string | null, createdAt: string }> };

export type GetGenomicComparisonQueryVariables = Exact<{
  recurrenceEventId: Scalars['String']['input'];
}>;


export type GetGenomicComparisonQuery = { __typename?: 'Query', genomicComparison: { __typename?: 'GenomicComparison', hasNewData: boolean, resistanceMutations: Array<string>, biomarkerChanges: Array<string>, actionableChanges: Array<string>, patientSummary: string, generatedAt: string } };

export type GetSecondOpinionResourcesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSecondOpinionResourcesQuery = { __typename?: 'Query', secondOpinionResources: Array<{ __typename?: 'SecondOpinionResource', name: string, type: string, description: string, url: string, virtual: boolean }> };

export type ReportRecurrenceMutationVariables = Exact<{
  input: ReportRecurrenceInput;
}>;


export type ReportRecurrenceMutation = { __typename?: 'Mutation', reportRecurrence: { __typename?: 'RecurrenceEvent', id: string, patientId: string, detectedDate: string, detectionMethod: string, recurrenceType?: string | null, recurrenceSites: Array<string>, confirmedByBiopsy: boolean, createdAt: string, cascadeStatus: { __typename?: 'CascadeStatus', acknowledged: boolean, supportOffered: boolean, resequencingRecommended: boolean, trialRematched: boolean, financialRematched: boolean, secondOpinionOffered: boolean, careTeamUpdated: boolean, translatorRegenerated: boolean, planArchived: boolean, pipelineActivated: boolean, genomicComparisonReady: boolean } } };

export type AcknowledgeRecurrenceMutationVariables = Exact<{
  recurrenceEventId: Scalars['String']['input'];
}>;


export type AcknowledgeRecurrenceMutation = { __typename?: 'Mutation', acknowledgeRecurrence: { __typename?: 'RecurrenceEvent', id: string, acknowledgedAt?: string | null, cascadeStatus: { __typename?: 'CascadeStatus', acknowledged: boolean, supportOffered: boolean, resequencingRecommended: boolean, trialRematched: boolean, financialRematched: boolean, secondOpinionOffered: boolean, careTeamUpdated: boolean, translatorRegenerated: boolean, planArchived: boolean, pipelineActivated: boolean, genomicComparisonReady: boolean } } };

export type UpdateCascadeStepMutationVariables = Exact<{
  input: UpdateCascadeStepInput;
}>;


export type UpdateCascadeStepMutation = { __typename?: 'Mutation', updateCascadeStep: { __typename?: 'RecurrenceEvent', id: string, cascadeStatus: { __typename?: 'CascadeStatus', acknowledged: boolean, supportOffered: boolean, resequencingRecommended: boolean, trialRematched: boolean, financialRematched: boolean, secondOpinionOffered: boolean, careTeamUpdated: boolean, translatorRegenerated: boolean, planArchived: boolean, pipelineActivated: boolean, genomicComparisonReady: boolean } } };

export type RegenerateTranslatorMutationVariables = Exact<{
  recurrenceEventId: Scalars['String']['input'];
}>;


export type RegenerateTranslatorMutation = { __typename?: 'Mutation', regenerateTranslator: { __typename?: 'RecurrenceEvent', id: string, cascadeStatus: { __typename?: 'CascadeStatus', acknowledged: boolean, supportOffered: boolean, resequencingRecommended: boolean, trialRematched: boolean, financialRematched: boolean, secondOpinionOffered: boolean, careTeamUpdated: boolean, translatorRegenerated: boolean, planArchived: boolean, pipelineActivated: boolean, genomicComparisonReady: boolean } } };

export type ArchiveSurvivorshipPlanMutationVariables = Exact<{ [key: string]: never; }>;


export type ArchiveSurvivorshipPlanMutation = { __typename?: 'Mutation', archiveSurvivorshipPlan: boolean };

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


export const GetInsuranceDenialsDocument = gql`
    query GetInsuranceDenials {
  insuranceDenials {
    id
    patientId
    deniedService
    serviceCategory
    denialDate
    insurerName
    planType
    claimNumber
    denialReason
    denialCategory
    appealDeadline
    status
    appealLetters {
      id
      appealLevel
      generatedAt
      submittedAt
      outcome
    }
    createdAt
  }
}
    `;

/**
 * __useGetInsuranceDenialsQuery__
 *
 * To run a query within a React component, call `useGetInsuranceDenialsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInsuranceDenialsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInsuranceDenialsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetInsuranceDenialsQuery(baseOptions?: Apollo.QueryHookOptions<GetInsuranceDenialsQuery, GetInsuranceDenialsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetInsuranceDenialsQuery, GetInsuranceDenialsQueryVariables>(GetInsuranceDenialsDocument, options);
      }
export function useGetInsuranceDenialsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetInsuranceDenialsQuery, GetInsuranceDenialsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetInsuranceDenialsQuery, GetInsuranceDenialsQueryVariables>(GetInsuranceDenialsDocument, options);
        }
// @ts-ignore
export function useGetInsuranceDenialsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetInsuranceDenialsQuery, GetInsuranceDenialsQueryVariables>): Apollo.UseSuspenseQueryResult<GetInsuranceDenialsQuery, GetInsuranceDenialsQueryVariables>;
export function useGetInsuranceDenialsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetInsuranceDenialsQuery, GetInsuranceDenialsQueryVariables>): Apollo.UseSuspenseQueryResult<GetInsuranceDenialsQuery | undefined, GetInsuranceDenialsQueryVariables>;
export function useGetInsuranceDenialsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetInsuranceDenialsQuery, GetInsuranceDenialsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetInsuranceDenialsQuery, GetInsuranceDenialsQueryVariables>(GetInsuranceDenialsDocument, options);
        }
export type GetInsuranceDenialsQueryHookResult = ReturnType<typeof useGetInsuranceDenialsQuery>;
export type GetInsuranceDenialsLazyQueryHookResult = ReturnType<typeof useGetInsuranceDenialsLazyQuery>;
export type GetInsuranceDenialsSuspenseQueryHookResult = ReturnType<typeof useGetInsuranceDenialsSuspenseQuery>;
export type GetInsuranceDenialsQueryResult = Apollo.QueryResult<GetInsuranceDenialsQuery, GetInsuranceDenialsQueryVariables>;
export const GetInsuranceDenialDocument = gql`
    query GetInsuranceDenial($id: String!) {
  insuranceDenial(id: $id) {
    id
    patientId
    deniedService
    serviceCategory
    denialDate
    insurerName
    planType
    claimNumber
    denialReason
    denialReasonCode
    denialCategory
    appealDeadline
    status
    appealLetters {
      id
      denialId
      appealLevel
      letterContent
      supportingDocuments
      patientSummary
      generatedAt
      submittedAt
      outcome
      outcomeDate
      outcomeDetails
    }
    createdAt
  }
}
    `;

/**
 * __useGetInsuranceDenialQuery__
 *
 * To run a query within a React component, call `useGetInsuranceDenialQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInsuranceDenialQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInsuranceDenialQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetInsuranceDenialQuery(baseOptions: Apollo.QueryHookOptions<GetInsuranceDenialQuery, GetInsuranceDenialQueryVariables> & ({ variables: GetInsuranceDenialQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetInsuranceDenialQuery, GetInsuranceDenialQueryVariables>(GetInsuranceDenialDocument, options);
      }
export function useGetInsuranceDenialLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetInsuranceDenialQuery, GetInsuranceDenialQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetInsuranceDenialQuery, GetInsuranceDenialQueryVariables>(GetInsuranceDenialDocument, options);
        }
// @ts-ignore
export function useGetInsuranceDenialSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetInsuranceDenialQuery, GetInsuranceDenialQueryVariables>): Apollo.UseSuspenseQueryResult<GetInsuranceDenialQuery, GetInsuranceDenialQueryVariables>;
export function useGetInsuranceDenialSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetInsuranceDenialQuery, GetInsuranceDenialQueryVariables>): Apollo.UseSuspenseQueryResult<GetInsuranceDenialQuery | undefined, GetInsuranceDenialQueryVariables>;
export function useGetInsuranceDenialSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetInsuranceDenialQuery, GetInsuranceDenialQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetInsuranceDenialQuery, GetInsuranceDenialQueryVariables>(GetInsuranceDenialDocument, options);
        }
export type GetInsuranceDenialQueryHookResult = ReturnType<typeof useGetInsuranceDenialQuery>;
export type GetInsuranceDenialLazyQueryHookResult = ReturnType<typeof useGetInsuranceDenialLazyQuery>;
export type GetInsuranceDenialSuspenseQueryHookResult = ReturnType<typeof useGetInsuranceDenialSuspenseQuery>;
export type GetInsuranceDenialQueryResult = Apollo.QueryResult<GetInsuranceDenialQuery, GetInsuranceDenialQueryVariables>;
export const GetAppealLetterDocument = gql`
    query GetAppealLetter($id: String!) {
  appealLetter(id: $id) {
    id
    denialId
    appealLevel
    letterContent
    supportingDocuments
    patientSummary
    generatedAt
    submittedAt
    outcome
    outcomeDate
    outcomeDetails
  }
}
    `;

/**
 * __useGetAppealLetterQuery__
 *
 * To run a query within a React component, call `useGetAppealLetterQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppealLetterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppealLetterQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetAppealLetterQuery(baseOptions: Apollo.QueryHookOptions<GetAppealLetterQuery, GetAppealLetterQueryVariables> & ({ variables: GetAppealLetterQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAppealLetterQuery, GetAppealLetterQueryVariables>(GetAppealLetterDocument, options);
      }
export function useGetAppealLetterLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAppealLetterQuery, GetAppealLetterQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAppealLetterQuery, GetAppealLetterQueryVariables>(GetAppealLetterDocument, options);
        }
// @ts-ignore
export function useGetAppealLetterSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAppealLetterQuery, GetAppealLetterQueryVariables>): Apollo.UseSuspenseQueryResult<GetAppealLetterQuery, GetAppealLetterQueryVariables>;
export function useGetAppealLetterSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppealLetterQuery, GetAppealLetterQueryVariables>): Apollo.UseSuspenseQueryResult<GetAppealLetterQuery | undefined, GetAppealLetterQueryVariables>;
export function useGetAppealLetterSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppealLetterQuery, GetAppealLetterQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAppealLetterQuery, GetAppealLetterQueryVariables>(GetAppealLetterDocument, options);
        }
export type GetAppealLetterQueryHookResult = ReturnType<typeof useGetAppealLetterQuery>;
export type GetAppealLetterLazyQueryHookResult = ReturnType<typeof useGetAppealLetterLazyQuery>;
export type GetAppealLetterSuspenseQueryHookResult = ReturnType<typeof useGetAppealLetterSuspenseQuery>;
export type GetAppealLetterQueryResult = Apollo.QueryResult<GetAppealLetterQuery, GetAppealLetterQueryVariables>;
export const GetAppealStrategyDocument = gql`
    query GetAppealStrategy($denialCategory: String!) {
  appealStrategy(denialCategory: $denialCategory) {
    name
    levels
    successRates
    supportingEvidence
  }
}
    `;

/**
 * __useGetAppealStrategyQuery__
 *
 * To run a query within a React component, call `useGetAppealStrategyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppealStrategyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppealStrategyQuery({
 *   variables: {
 *      denialCategory: // value for 'denialCategory'
 *   },
 * });
 */
export function useGetAppealStrategyQuery(baseOptions: Apollo.QueryHookOptions<GetAppealStrategyQuery, GetAppealStrategyQueryVariables> & ({ variables: GetAppealStrategyQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAppealStrategyQuery, GetAppealStrategyQueryVariables>(GetAppealStrategyDocument, options);
      }
export function useGetAppealStrategyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAppealStrategyQuery, GetAppealStrategyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAppealStrategyQuery, GetAppealStrategyQueryVariables>(GetAppealStrategyDocument, options);
        }
// @ts-ignore
export function useGetAppealStrategySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAppealStrategyQuery, GetAppealStrategyQueryVariables>): Apollo.UseSuspenseQueryResult<GetAppealStrategyQuery, GetAppealStrategyQueryVariables>;
export function useGetAppealStrategySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppealStrategyQuery, GetAppealStrategyQueryVariables>): Apollo.UseSuspenseQueryResult<GetAppealStrategyQuery | undefined, GetAppealStrategyQueryVariables>;
export function useGetAppealStrategySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppealStrategyQuery, GetAppealStrategyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAppealStrategyQuery, GetAppealStrategyQueryVariables>(GetAppealStrategyDocument, options);
        }
export type GetAppealStrategyQueryHookResult = ReturnType<typeof useGetAppealStrategyQuery>;
export type GetAppealStrategyLazyQueryHookResult = ReturnType<typeof useGetAppealStrategyLazyQuery>;
export type GetAppealStrategySuspenseQueryHookResult = ReturnType<typeof useGetAppealStrategySuspenseQuery>;
export type GetAppealStrategyQueryResult = Apollo.QueryResult<GetAppealStrategyQuery, GetAppealStrategyQueryVariables>;
export const GetAppealRightsDocument = gql`
    query GetAppealRights($state: String) {
  appealRights(state: $state) {
    acaRights {
      internalAppealDays
      urgentInternalHours
      externalReviewAvailable
      externalReviewDays
      continuationOfCoverage
    }
    stateProtections {
      fertilityMandate
      clinicalTrialCoverage
      stepTherapyProtection
      cancerSpecific
    }
  }
}
    `;

/**
 * __useGetAppealRightsQuery__
 *
 * To run a query within a React component, call `useGetAppealRightsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppealRightsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppealRightsQuery({
 *   variables: {
 *      state: // value for 'state'
 *   },
 * });
 */
export function useGetAppealRightsQuery(baseOptions?: Apollo.QueryHookOptions<GetAppealRightsQuery, GetAppealRightsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAppealRightsQuery, GetAppealRightsQueryVariables>(GetAppealRightsDocument, options);
      }
export function useGetAppealRightsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAppealRightsQuery, GetAppealRightsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAppealRightsQuery, GetAppealRightsQueryVariables>(GetAppealRightsDocument, options);
        }
// @ts-ignore
export function useGetAppealRightsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAppealRightsQuery, GetAppealRightsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAppealRightsQuery, GetAppealRightsQueryVariables>;
export function useGetAppealRightsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppealRightsQuery, GetAppealRightsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAppealRightsQuery | undefined, GetAppealRightsQueryVariables>;
export function useGetAppealRightsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppealRightsQuery, GetAppealRightsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAppealRightsQuery, GetAppealRightsQueryVariables>(GetAppealRightsDocument, options);
        }
export type GetAppealRightsQueryHookResult = ReturnType<typeof useGetAppealRightsQuery>;
export type GetAppealRightsLazyQueryHookResult = ReturnType<typeof useGetAppealRightsLazyQuery>;
export type GetAppealRightsSuspenseQueryHookResult = ReturnType<typeof useGetAppealRightsSuspenseQuery>;
export type GetAppealRightsQueryResult = Apollo.QueryResult<GetAppealRightsQuery, GetAppealRightsQueryVariables>;
export const CreateInsuranceDenialDocument = gql`
    mutation CreateInsuranceDenial($input: CreateDenialInput!) {
  createInsuranceDenial(input: $input) {
    id
    deniedService
    serviceCategory
    denialDate
    insurerName
    denialReason
    denialCategory
    appealDeadline
    status
    createdAt
  }
}
    `;
export type CreateInsuranceDenialMutationFn = Apollo.MutationFunction<CreateInsuranceDenialMutation, CreateInsuranceDenialMutationVariables>;

/**
 * __useCreateInsuranceDenialMutation__
 *
 * To run a mutation, you first call `useCreateInsuranceDenialMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateInsuranceDenialMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createInsuranceDenialMutation, { data, loading, error }] = useCreateInsuranceDenialMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateInsuranceDenialMutation(baseOptions?: Apollo.MutationHookOptions<CreateInsuranceDenialMutation, CreateInsuranceDenialMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateInsuranceDenialMutation, CreateInsuranceDenialMutationVariables>(CreateInsuranceDenialDocument, options);
      }
export type CreateInsuranceDenialMutationHookResult = ReturnType<typeof useCreateInsuranceDenialMutation>;
export type CreateInsuranceDenialMutationResult = Apollo.MutationResult<CreateInsuranceDenialMutation>;
export type CreateInsuranceDenialMutationOptions = Apollo.BaseMutationOptions<CreateInsuranceDenialMutation, CreateInsuranceDenialMutationVariables>;
export const GenerateAppealLetterDocument = gql`
    mutation GenerateAppealLetter($denialId: String!) {
  generateAppealLetter(denialId: $denialId) {
    id
    denialId
    appealLevel
    letterContent
    supportingDocuments
    patientSummary
    generatedAt
  }
}
    `;
export type GenerateAppealLetterMutationFn = Apollo.MutationFunction<GenerateAppealLetterMutation, GenerateAppealLetterMutationVariables>;

/**
 * __useGenerateAppealLetterMutation__
 *
 * To run a mutation, you first call `useGenerateAppealLetterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateAppealLetterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateAppealLetterMutation, { data, loading, error }] = useGenerateAppealLetterMutation({
 *   variables: {
 *      denialId: // value for 'denialId'
 *   },
 * });
 */
export function useGenerateAppealLetterMutation(baseOptions?: Apollo.MutationHookOptions<GenerateAppealLetterMutation, GenerateAppealLetterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateAppealLetterMutation, GenerateAppealLetterMutationVariables>(GenerateAppealLetterDocument, options);
      }
export type GenerateAppealLetterMutationHookResult = ReturnType<typeof useGenerateAppealLetterMutation>;
export type GenerateAppealLetterMutationResult = Apollo.MutationResult<GenerateAppealLetterMutation>;
export type GenerateAppealLetterMutationOptions = Apollo.BaseMutationOptions<GenerateAppealLetterMutation, GenerateAppealLetterMutationVariables>;
export const UpdateAppealOutcomeDocument = gql`
    mutation UpdateAppealOutcome($input: UpdateAppealOutcomeInput!) {
  updateAppealOutcome(input: $input) {
    id
    outcome
    outcomeDate
    outcomeDetails
  }
}
    `;
export type UpdateAppealOutcomeMutationFn = Apollo.MutationFunction<UpdateAppealOutcomeMutation, UpdateAppealOutcomeMutationVariables>;

/**
 * __useUpdateAppealOutcomeMutation__
 *
 * To run a mutation, you first call `useUpdateAppealOutcomeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAppealOutcomeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAppealOutcomeMutation, { data, loading, error }] = useUpdateAppealOutcomeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateAppealOutcomeMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAppealOutcomeMutation, UpdateAppealOutcomeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAppealOutcomeMutation, UpdateAppealOutcomeMutationVariables>(UpdateAppealOutcomeDocument, options);
      }
export type UpdateAppealOutcomeMutationHookResult = ReturnType<typeof useUpdateAppealOutcomeMutation>;
export type UpdateAppealOutcomeMutationResult = Apollo.MutationResult<UpdateAppealOutcomeMutation>;
export type UpdateAppealOutcomeMutationOptions = Apollo.BaseMutationOptions<UpdateAppealOutcomeMutation, UpdateAppealOutcomeMutationVariables>;
export const UpdateDenialStatusDocument = gql`
    mutation UpdateDenialStatus($input: UpdateDenialStatusInput!) {
  updateDenialStatus(input: $input) {
    id
    status
  }
}
    `;
export type UpdateDenialStatusMutationFn = Apollo.MutationFunction<UpdateDenialStatusMutation, UpdateDenialStatusMutationVariables>;

/**
 * __useUpdateDenialStatusMutation__
 *
 * To run a mutation, you first call `useUpdateDenialStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDenialStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDenialStatusMutation, { data, loading, error }] = useUpdateDenialStatusMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateDenialStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDenialStatusMutation, UpdateDenialStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateDenialStatusMutation, UpdateDenialStatusMutationVariables>(UpdateDenialStatusDocument, options);
      }
export type UpdateDenialStatusMutationHookResult = ReturnType<typeof useUpdateDenialStatusMutation>;
export type UpdateDenialStatusMutationResult = Apollo.MutationResult<UpdateDenialStatusMutation>;
export type UpdateDenialStatusMutationOptions = Apollo.BaseMutationOptions<UpdateDenialStatusMutation, UpdateDenialStatusMutationVariables>;
export const GeneratePeerReviewPrepDocument = gql`
    mutation GeneratePeerReviewPrep($denialId: String!) {
  generatePeerReviewPrep(denialId: $denialId) {
    keyPoints
    anticipatedArguments {
      argument
      rebuttal
    }
    guidelines
    reviewerQuestions
    tips
    generatedAt
  }
}
    `;
export type GeneratePeerReviewPrepMutationFn = Apollo.MutationFunction<GeneratePeerReviewPrepMutation, GeneratePeerReviewPrepMutationVariables>;

/**
 * __useGeneratePeerReviewPrepMutation__
 *
 * To run a mutation, you first call `useGeneratePeerReviewPrepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGeneratePeerReviewPrepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generatePeerReviewPrepMutation, { data, loading, error }] = useGeneratePeerReviewPrepMutation({
 *   variables: {
 *      denialId: // value for 'denialId'
 *   },
 * });
 */
export function useGeneratePeerReviewPrepMutation(baseOptions?: Apollo.MutationHookOptions<GeneratePeerReviewPrepMutation, GeneratePeerReviewPrepMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GeneratePeerReviewPrepMutation, GeneratePeerReviewPrepMutationVariables>(GeneratePeerReviewPrepDocument, options);
      }
export type GeneratePeerReviewPrepMutationHookResult = ReturnType<typeof useGeneratePeerReviewPrepMutation>;
export type GeneratePeerReviewPrepMutationResult = Apollo.MutationResult<GeneratePeerReviewPrepMutation>;
export type GeneratePeerReviewPrepMutationOptions = Apollo.BaseMutationOptions<GeneratePeerReviewPrepMutation, GeneratePeerReviewPrepMutationVariables>;
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
export const GetFertilityAssessmentDocument = gql`
    query GetFertilityAssessment {
  fertilityAssessment {
    id
    patientId
    gonadotoxicityRisk
    riskFactors {
      agent
      risk
      amenorrheaRate
    }
    preservationWindowDays
    windowStatus
    recommendation
    recommendationRationale
    optionsPresented
    referralRequested
    referralRequestedAt
    providerId
    preservationPursued
    preservationMethod
    preservationCompleted
    createdAt
  }
}
    `;

/**
 * __useGetFertilityAssessmentQuery__
 *
 * To run a query within a React component, call `useGetFertilityAssessmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFertilityAssessmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFertilityAssessmentQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFertilityAssessmentQuery(baseOptions?: Apollo.QueryHookOptions<GetFertilityAssessmentQuery, GetFertilityAssessmentQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFertilityAssessmentQuery, GetFertilityAssessmentQueryVariables>(GetFertilityAssessmentDocument, options);
      }
export function useGetFertilityAssessmentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFertilityAssessmentQuery, GetFertilityAssessmentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFertilityAssessmentQuery, GetFertilityAssessmentQueryVariables>(GetFertilityAssessmentDocument, options);
        }
// @ts-ignore
export function useGetFertilityAssessmentSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFertilityAssessmentQuery, GetFertilityAssessmentQueryVariables>): Apollo.UseSuspenseQueryResult<GetFertilityAssessmentQuery, GetFertilityAssessmentQueryVariables>;
export function useGetFertilityAssessmentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFertilityAssessmentQuery, GetFertilityAssessmentQueryVariables>): Apollo.UseSuspenseQueryResult<GetFertilityAssessmentQuery | undefined, GetFertilityAssessmentQueryVariables>;
export function useGetFertilityAssessmentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFertilityAssessmentQuery, GetFertilityAssessmentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFertilityAssessmentQuery, GetFertilityAssessmentQueryVariables>(GetFertilityAssessmentDocument, options);
        }
export type GetFertilityAssessmentQueryHookResult = ReturnType<typeof useGetFertilityAssessmentQuery>;
export type GetFertilityAssessmentLazyQueryHookResult = ReturnType<typeof useGetFertilityAssessmentLazyQuery>;
export type GetFertilityAssessmentSuspenseQueryHookResult = ReturnType<typeof useGetFertilityAssessmentSuspenseQuery>;
export type GetFertilityAssessmentQueryResult = Apollo.QueryResult<GetFertilityAssessmentQuery, GetFertilityAssessmentQueryVariables>;
export const GetPreservationOptionsDocument = gql`
    query GetPreservationOptions {
  preservationOptions {
    key
    label
    timing
    cost
    successRate
    contraindications
    erPositiveNote
    available
  }
}
    `;

/**
 * __useGetPreservationOptionsQuery__
 *
 * To run a query within a React component, call `useGetPreservationOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPreservationOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPreservationOptionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPreservationOptionsQuery(baseOptions?: Apollo.QueryHookOptions<GetPreservationOptionsQuery, GetPreservationOptionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPreservationOptionsQuery, GetPreservationOptionsQueryVariables>(GetPreservationOptionsDocument, options);
      }
export function useGetPreservationOptionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPreservationOptionsQuery, GetPreservationOptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPreservationOptionsQuery, GetPreservationOptionsQueryVariables>(GetPreservationOptionsDocument, options);
        }
// @ts-ignore
export function useGetPreservationOptionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPreservationOptionsQuery, GetPreservationOptionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetPreservationOptionsQuery, GetPreservationOptionsQueryVariables>;
export function useGetPreservationOptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPreservationOptionsQuery, GetPreservationOptionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetPreservationOptionsQuery | undefined, GetPreservationOptionsQueryVariables>;
export function useGetPreservationOptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPreservationOptionsQuery, GetPreservationOptionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPreservationOptionsQuery, GetPreservationOptionsQueryVariables>(GetPreservationOptionsDocument, options);
        }
export type GetPreservationOptionsQueryHookResult = ReturnType<typeof useGetPreservationOptionsQuery>;
export type GetPreservationOptionsLazyQueryHookResult = ReturnType<typeof useGetPreservationOptionsLazyQuery>;
export type GetPreservationOptionsSuspenseQueryHookResult = ReturnType<typeof useGetPreservationOptionsSuspenseQuery>;
export type GetPreservationOptionsQueryResult = Apollo.QueryResult<GetPreservationOptionsQuery, GetPreservationOptionsQueryVariables>;
export const GetFertilityProvidersDocument = gql`
    query GetFertilityProviders($filters: String) {
  fertilityProviders(filters: $filters) {
    id
    name
    type
    address
    city
    state
    zipCode
    distance
    servicesOffered
    oncologyExperience
    randomStartProtocol
    letrozoleProtocol
    weekendAvailability
    livestrongPartner
    phone
    urgentPhone
    website
    oncofertilityCoordinator
  }
}
    `;

/**
 * __useGetFertilityProvidersQuery__
 *
 * To run a query within a React component, call `useGetFertilityProvidersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFertilityProvidersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFertilityProvidersQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetFertilityProvidersQuery(baseOptions?: Apollo.QueryHookOptions<GetFertilityProvidersQuery, GetFertilityProvidersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFertilityProvidersQuery, GetFertilityProvidersQueryVariables>(GetFertilityProvidersDocument, options);
      }
export function useGetFertilityProvidersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFertilityProvidersQuery, GetFertilityProvidersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFertilityProvidersQuery, GetFertilityProvidersQueryVariables>(GetFertilityProvidersDocument, options);
        }
// @ts-ignore
export function useGetFertilityProvidersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFertilityProvidersQuery, GetFertilityProvidersQueryVariables>): Apollo.UseSuspenseQueryResult<GetFertilityProvidersQuery, GetFertilityProvidersQueryVariables>;
export function useGetFertilityProvidersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFertilityProvidersQuery, GetFertilityProvidersQueryVariables>): Apollo.UseSuspenseQueryResult<GetFertilityProvidersQuery | undefined, GetFertilityProvidersQueryVariables>;
export function useGetFertilityProvidersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFertilityProvidersQuery, GetFertilityProvidersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFertilityProvidersQuery, GetFertilityProvidersQueryVariables>(GetFertilityProvidersDocument, options);
        }
export type GetFertilityProvidersQueryHookResult = ReturnType<typeof useGetFertilityProvidersQuery>;
export type GetFertilityProvidersLazyQueryHookResult = ReturnType<typeof useGetFertilityProvidersLazyQuery>;
export type GetFertilityProvidersSuspenseQueryHookResult = ReturnType<typeof useGetFertilityProvidersSuspenseQuery>;
export type GetFertilityProvidersQueryResult = Apollo.QueryResult<GetFertilityProvidersQuery, GetFertilityProvidersQueryVariables>;
export const GetFertilityFinancialProgramsDocument = gql`
    query GetFertilityFinancialPrograms {
  fertilityFinancialPrograms {
    name
    organization
    url
    description
    eligibility
    maxBenefit
    eligible
  }
}
    `;

/**
 * __useGetFertilityFinancialProgramsQuery__
 *
 * To run a query within a React component, call `useGetFertilityFinancialProgramsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFertilityFinancialProgramsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFertilityFinancialProgramsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFertilityFinancialProgramsQuery(baseOptions?: Apollo.QueryHookOptions<GetFertilityFinancialProgramsQuery, GetFertilityFinancialProgramsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFertilityFinancialProgramsQuery, GetFertilityFinancialProgramsQueryVariables>(GetFertilityFinancialProgramsDocument, options);
      }
export function useGetFertilityFinancialProgramsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFertilityFinancialProgramsQuery, GetFertilityFinancialProgramsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFertilityFinancialProgramsQuery, GetFertilityFinancialProgramsQueryVariables>(GetFertilityFinancialProgramsDocument, options);
        }
// @ts-ignore
export function useGetFertilityFinancialProgramsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFertilityFinancialProgramsQuery, GetFertilityFinancialProgramsQueryVariables>): Apollo.UseSuspenseQueryResult<GetFertilityFinancialProgramsQuery, GetFertilityFinancialProgramsQueryVariables>;
export function useGetFertilityFinancialProgramsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFertilityFinancialProgramsQuery, GetFertilityFinancialProgramsQueryVariables>): Apollo.UseSuspenseQueryResult<GetFertilityFinancialProgramsQuery | undefined, GetFertilityFinancialProgramsQueryVariables>;
export function useGetFertilityFinancialProgramsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFertilityFinancialProgramsQuery, GetFertilityFinancialProgramsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFertilityFinancialProgramsQuery, GetFertilityFinancialProgramsQueryVariables>(GetFertilityFinancialProgramsDocument, options);
        }
export type GetFertilityFinancialProgramsQueryHookResult = ReturnType<typeof useGetFertilityFinancialProgramsQuery>;
export type GetFertilityFinancialProgramsLazyQueryHookResult = ReturnType<typeof useGetFertilityFinancialProgramsLazyQuery>;
export type GetFertilityFinancialProgramsSuspenseQueryHookResult = ReturnType<typeof useGetFertilityFinancialProgramsSuspenseQuery>;
export type GetFertilityFinancialProgramsQueryResult = Apollo.QueryResult<GetFertilityFinancialProgramsQuery, GetFertilityFinancialProgramsQueryVariables>;
export const AssessFertilityRiskDocument = gql`
    mutation AssessFertilityRisk {
  assessFertilityRisk {
    id
    patientId
    gonadotoxicityRisk
    riskFactors {
      agent
      risk
      amenorrheaRate
    }
    preservationWindowDays
    windowStatus
    recommendation
    recommendationRationale
    createdAt
  }
}
    `;
export type AssessFertilityRiskMutationFn = Apollo.MutationFunction<AssessFertilityRiskMutation, AssessFertilityRiskMutationVariables>;

/**
 * __useAssessFertilityRiskMutation__
 *
 * To run a mutation, you first call `useAssessFertilityRiskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssessFertilityRiskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assessFertilityRiskMutation, { data, loading, error }] = useAssessFertilityRiskMutation({
 *   variables: {
 *   },
 * });
 */
export function useAssessFertilityRiskMutation(baseOptions?: Apollo.MutationHookOptions<AssessFertilityRiskMutation, AssessFertilityRiskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AssessFertilityRiskMutation, AssessFertilityRiskMutationVariables>(AssessFertilityRiskDocument, options);
      }
export type AssessFertilityRiskMutationHookResult = ReturnType<typeof useAssessFertilityRiskMutation>;
export type AssessFertilityRiskMutationResult = Apollo.MutationResult<AssessFertilityRiskMutation>;
export type AssessFertilityRiskMutationOptions = Apollo.BaseMutationOptions<AssessFertilityRiskMutation, AssessFertilityRiskMutationVariables>;
export const GenerateFertilityDiscussionGuideDocument = gql`
    mutation GenerateFertilityDiscussionGuide {
  generateFertilityDiscussionGuide {
    openingStatement
    questions
    keyFacts
    timelineNotes
    generatedAt
  }
}
    `;
export type GenerateFertilityDiscussionGuideMutationFn = Apollo.MutationFunction<GenerateFertilityDiscussionGuideMutation, GenerateFertilityDiscussionGuideMutationVariables>;

/**
 * __useGenerateFertilityDiscussionGuideMutation__
 *
 * To run a mutation, you first call `useGenerateFertilityDiscussionGuideMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateFertilityDiscussionGuideMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateFertilityDiscussionGuideMutation, { data, loading, error }] = useGenerateFertilityDiscussionGuideMutation({
 *   variables: {
 *   },
 * });
 */
export function useGenerateFertilityDiscussionGuideMutation(baseOptions?: Apollo.MutationHookOptions<GenerateFertilityDiscussionGuideMutation, GenerateFertilityDiscussionGuideMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateFertilityDiscussionGuideMutation, GenerateFertilityDiscussionGuideMutationVariables>(GenerateFertilityDiscussionGuideDocument, options);
      }
export type GenerateFertilityDiscussionGuideMutationHookResult = ReturnType<typeof useGenerateFertilityDiscussionGuideMutation>;
export type GenerateFertilityDiscussionGuideMutationResult = Apollo.MutationResult<GenerateFertilityDiscussionGuideMutation>;
export type GenerateFertilityDiscussionGuideMutationOptions = Apollo.BaseMutationOptions<GenerateFertilityDiscussionGuideMutation, GenerateFertilityDiscussionGuideMutationVariables>;
export const RequestFertilityReferralDocument = gql`
    mutation RequestFertilityReferral($input: RequestFertilityReferralInput!) {
  requestFertilityReferral(input: $input) {
    id
    referralRequested
    referralRequestedAt
    providerId
  }
}
    `;
export type RequestFertilityReferralMutationFn = Apollo.MutationFunction<RequestFertilityReferralMutation, RequestFertilityReferralMutationVariables>;

/**
 * __useRequestFertilityReferralMutation__
 *
 * To run a mutation, you first call `useRequestFertilityReferralMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestFertilityReferralMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestFertilityReferralMutation, { data, loading, error }] = useRequestFertilityReferralMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRequestFertilityReferralMutation(baseOptions?: Apollo.MutationHookOptions<RequestFertilityReferralMutation, RequestFertilityReferralMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestFertilityReferralMutation, RequestFertilityReferralMutationVariables>(RequestFertilityReferralDocument, options);
      }
export type RequestFertilityReferralMutationHookResult = ReturnType<typeof useRequestFertilityReferralMutation>;
export type RequestFertilityReferralMutationResult = Apollo.MutationResult<RequestFertilityReferralMutation>;
export type RequestFertilityReferralMutationOptions = Apollo.BaseMutationOptions<RequestFertilityReferralMutation, RequestFertilityReferralMutationVariables>;
export const UpdateFertilityOutcomeDocument = gql`
    mutation UpdateFertilityOutcome($input: UpdateFertilityOutcomeInput!) {
  updateFertilityOutcome(input: $input) {
    id
    preservationPursued
    preservationMethod
    preservationCompleted
  }
}
    `;
export type UpdateFertilityOutcomeMutationFn = Apollo.MutationFunction<UpdateFertilityOutcomeMutation, UpdateFertilityOutcomeMutationVariables>;

/**
 * __useUpdateFertilityOutcomeMutation__
 *
 * To run a mutation, you first call `useUpdateFertilityOutcomeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFertilityOutcomeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFertilityOutcomeMutation, { data, loading, error }] = useUpdateFertilityOutcomeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateFertilityOutcomeMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFertilityOutcomeMutation, UpdateFertilityOutcomeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFertilityOutcomeMutation, UpdateFertilityOutcomeMutationVariables>(UpdateFertilityOutcomeDocument, options);
      }
export type UpdateFertilityOutcomeMutationHookResult = ReturnType<typeof useUpdateFertilityOutcomeMutation>;
export type UpdateFertilityOutcomeMutationResult = Apollo.MutationResult<UpdateFertilityOutcomeMutation>;
export type UpdateFertilityOutcomeMutationOptions = Apollo.BaseMutationOptions<UpdateFertilityOutcomeMutation, UpdateFertilityOutcomeMutationVariables>;
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
export const GetResearchItemsDocument = gql`
    query GetResearchItems($filters: ResearchItemFilters) {
  researchItems(filters: $filters) {
    id
    sourceType
    sourceUrl
    sourceCredibility
    title
    journalName
    doi
    publishedAt
    cancerTypes
    breastSubtypes
    maturityTier
    domains
    treatmentClasses
    biomarkerRelevance
    evidenceLevel
    practiceImpact
    patientSummary
    drugNames
    hypeScore
    hypeFlags
    retractionStatus
    classificationStatus
    createdAt
  }
}
    `;

/**
 * __useGetResearchItemsQuery__
 *
 * To run a query within a React component, call `useGetResearchItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetResearchItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetResearchItemsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetResearchItemsQuery(baseOptions?: Apollo.QueryHookOptions<GetResearchItemsQuery, GetResearchItemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetResearchItemsQuery, GetResearchItemsQueryVariables>(GetResearchItemsDocument, options);
      }
export function useGetResearchItemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetResearchItemsQuery, GetResearchItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetResearchItemsQuery, GetResearchItemsQueryVariables>(GetResearchItemsDocument, options);
        }
// @ts-ignore
export function useGetResearchItemsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetResearchItemsQuery, GetResearchItemsQueryVariables>): Apollo.UseSuspenseQueryResult<GetResearchItemsQuery, GetResearchItemsQueryVariables>;
export function useGetResearchItemsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetResearchItemsQuery, GetResearchItemsQueryVariables>): Apollo.UseSuspenseQueryResult<GetResearchItemsQuery | undefined, GetResearchItemsQueryVariables>;
export function useGetResearchItemsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetResearchItemsQuery, GetResearchItemsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetResearchItemsQuery, GetResearchItemsQueryVariables>(GetResearchItemsDocument, options);
        }
export type GetResearchItemsQueryHookResult = ReturnType<typeof useGetResearchItemsQuery>;
export type GetResearchItemsLazyQueryHookResult = ReturnType<typeof useGetResearchItemsLazyQuery>;
export type GetResearchItemsSuspenseQueryHookResult = ReturnType<typeof useGetResearchItemsSuspenseQuery>;
export type GetResearchItemsQueryResult = Apollo.QueryResult<GetResearchItemsQuery, GetResearchItemsQueryVariables>;
export const GetResearchItemDocument = gql`
    query GetResearchItem($id: String!) {
  researchItem(id: $id) {
    id
    sourceType
    sourceItemId
    sourceUrl
    sourceCredibility
    title
    rawContent
    authors
    institutions
    journalName
    doi
    publishedAt
    cancerTypes
    breastSubtypes
    maturityTier
    domains
    treatmentClasses
    biomarkerRelevance
    treatmentStages
    evidenceLevel
    practiceImpact
    classificationConfidence
    patientSummary
    clinicianSummary {
      headline
      keyEndpoints
      studyDesign
      context
      practiceImplication
      limitations
      grade
    }
    keyEndpoints
    drugNames
    trialNctIds
    retractionStatus
    industrySponsored
    sponsorName
    authorCOI
    hypeScore
    hypeFlags
    relatedItemIds
    contradictedBy
    classificationStatus
    createdAt
  }
}
    `;

/**
 * __useGetResearchItemQuery__
 *
 * To run a query within a React component, call `useGetResearchItemQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetResearchItemQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetResearchItemQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetResearchItemQuery(baseOptions: Apollo.QueryHookOptions<GetResearchItemQuery, GetResearchItemQueryVariables> & ({ variables: GetResearchItemQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetResearchItemQuery, GetResearchItemQueryVariables>(GetResearchItemDocument, options);
      }
export function useGetResearchItemLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetResearchItemQuery, GetResearchItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetResearchItemQuery, GetResearchItemQueryVariables>(GetResearchItemDocument, options);
        }
// @ts-ignore
export function useGetResearchItemSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetResearchItemQuery, GetResearchItemQueryVariables>): Apollo.UseSuspenseQueryResult<GetResearchItemQuery, GetResearchItemQueryVariables>;
export function useGetResearchItemSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetResearchItemQuery, GetResearchItemQueryVariables>): Apollo.UseSuspenseQueryResult<GetResearchItemQuery | undefined, GetResearchItemQueryVariables>;
export function useGetResearchItemSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetResearchItemQuery, GetResearchItemQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetResearchItemQuery, GetResearchItemQueryVariables>(GetResearchItemDocument, options);
        }
export type GetResearchItemQueryHookResult = ReturnType<typeof useGetResearchItemQuery>;
export type GetResearchItemLazyQueryHookResult = ReturnType<typeof useGetResearchItemLazyQuery>;
export type GetResearchItemSuspenseQueryHookResult = ReturnType<typeof useGetResearchItemSuspenseQuery>;
export type GetResearchItemQueryResult = Apollo.QueryResult<GetResearchItemQuery, GetResearchItemQueryVariables>;
export const SearchResearchDocument = gql`
    query SearchResearch($query: String!, $filters: ResearchItemFilters) {
  searchResearch(query: $query, filters: $filters) {
    id
    sourceType
    sourceUrl
    sourceCredibility
    title
    journalName
    doi
    publishedAt
    cancerTypes
    breastSubtypes
    maturityTier
    domains
    treatmentClasses
    evidenceLevel
    practiceImpact
    patientSummary
    drugNames
    hypeFlags
    retractionStatus
    classificationStatus
    createdAt
  }
}
    `;

/**
 * __useSearchResearchQuery__
 *
 * To run a query within a React component, call `useSearchResearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchResearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchResearchQuery({
 *   variables: {
 *      query: // value for 'query'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useSearchResearchQuery(baseOptions: Apollo.QueryHookOptions<SearchResearchQuery, SearchResearchQueryVariables> & ({ variables: SearchResearchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchResearchQuery, SearchResearchQueryVariables>(SearchResearchDocument, options);
      }
export function useSearchResearchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchResearchQuery, SearchResearchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchResearchQuery, SearchResearchQueryVariables>(SearchResearchDocument, options);
        }
// @ts-ignore
export function useSearchResearchSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SearchResearchQuery, SearchResearchQueryVariables>): Apollo.UseSuspenseQueryResult<SearchResearchQuery, SearchResearchQueryVariables>;
export function useSearchResearchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchResearchQuery, SearchResearchQueryVariables>): Apollo.UseSuspenseQueryResult<SearchResearchQuery | undefined, SearchResearchQueryVariables>;
export function useSearchResearchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchResearchQuery, SearchResearchQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchResearchQuery, SearchResearchQueryVariables>(SearchResearchDocument, options);
        }
export type SearchResearchQueryHookResult = ReturnType<typeof useSearchResearchQuery>;
export type SearchResearchLazyQueryHookResult = ReturnType<typeof useSearchResearchLazyQuery>;
export type SearchResearchSuspenseQueryHookResult = ReturnType<typeof useSearchResearchSuspenseQuery>;
export type SearchResearchQueryResult = Apollo.QueryResult<SearchResearchQuery, SearchResearchQueryVariables>;
export const GetIngestionSyncStatesDocument = gql`
    query GetIngestionSyncStates {
  ingestionSyncStates {
    sourceId
    lastSyncAt
    lastItemDate
    itemsIngestedTotal
    itemsIngestedLastRun
    lastError
  }
}
    `;

/**
 * __useGetIngestionSyncStatesQuery__
 *
 * To run a query within a React component, call `useGetIngestionSyncStatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetIngestionSyncStatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetIngestionSyncStatesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetIngestionSyncStatesQuery(baseOptions?: Apollo.QueryHookOptions<GetIngestionSyncStatesQuery, GetIngestionSyncStatesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetIngestionSyncStatesQuery, GetIngestionSyncStatesQueryVariables>(GetIngestionSyncStatesDocument, options);
      }
export function useGetIngestionSyncStatesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetIngestionSyncStatesQuery, GetIngestionSyncStatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetIngestionSyncStatesQuery, GetIngestionSyncStatesQueryVariables>(GetIngestionSyncStatesDocument, options);
        }
// @ts-ignore
export function useGetIngestionSyncStatesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetIngestionSyncStatesQuery, GetIngestionSyncStatesQueryVariables>): Apollo.UseSuspenseQueryResult<GetIngestionSyncStatesQuery, GetIngestionSyncStatesQueryVariables>;
export function useGetIngestionSyncStatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetIngestionSyncStatesQuery, GetIngestionSyncStatesQueryVariables>): Apollo.UseSuspenseQueryResult<GetIngestionSyncStatesQuery | undefined, GetIngestionSyncStatesQueryVariables>;
export function useGetIngestionSyncStatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetIngestionSyncStatesQuery, GetIngestionSyncStatesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetIngestionSyncStatesQuery, GetIngestionSyncStatesQueryVariables>(GetIngestionSyncStatesDocument, options);
        }
export type GetIngestionSyncStatesQueryHookResult = ReturnType<typeof useGetIngestionSyncStatesQuery>;
export type GetIngestionSyncStatesLazyQueryHookResult = ReturnType<typeof useGetIngestionSyncStatesLazyQuery>;
export type GetIngestionSyncStatesSuspenseQueryHookResult = ReturnType<typeof useGetIngestionSyncStatesSuspenseQuery>;
export type GetIngestionSyncStatesQueryResult = Apollo.QueryResult<GetIngestionSyncStatesQuery, GetIngestionSyncStatesQueryVariables>;
export const TriggerIngestionDocument = gql`
    mutation TriggerIngestion($sourceId: String!) {
  triggerIngestion(sourceId: $sourceId) {
    ingested
    classified
    summarized
    skipped
    errors
  }
}
    `;
export type TriggerIngestionMutationFn = Apollo.MutationFunction<TriggerIngestionMutation, TriggerIngestionMutationVariables>;

/**
 * __useTriggerIngestionMutation__
 *
 * To run a mutation, you first call `useTriggerIngestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTriggerIngestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [triggerIngestionMutation, { data, loading, error }] = useTriggerIngestionMutation({
 *   variables: {
 *      sourceId: // value for 'sourceId'
 *   },
 * });
 */
export function useTriggerIngestionMutation(baseOptions?: Apollo.MutationHookOptions<TriggerIngestionMutation, TriggerIngestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TriggerIngestionMutation, TriggerIngestionMutationVariables>(TriggerIngestionDocument, options);
      }
export type TriggerIngestionMutationHookResult = ReturnType<typeof useTriggerIngestionMutation>;
export type TriggerIngestionMutationResult = Apollo.MutationResult<TriggerIngestionMutation>;
export type TriggerIngestionMutationOptions = Apollo.BaseMutationOptions<TriggerIngestionMutation, TriggerIngestionMutationVariables>;
export const ReclassifyItemDocument = gql`
    mutation ReclassifyItem($itemId: String!) {
  reclassifyItem(itemId: $itemId) {
    id
    maturityTier
    domains
    evidenceLevel
    practiceImpact
    patientSummary
    classificationStatus
  }
}
    `;
export type ReclassifyItemMutationFn = Apollo.MutationFunction<ReclassifyItemMutation, ReclassifyItemMutationVariables>;

/**
 * __useReclassifyItemMutation__
 *
 * To run a mutation, you first call `useReclassifyItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReclassifyItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reclassifyItemMutation, { data, loading, error }] = useReclassifyItemMutation({
 *   variables: {
 *      itemId: // value for 'itemId'
 *   },
 * });
 */
export function useReclassifyItemMutation(baseOptions?: Apollo.MutationHookOptions<ReclassifyItemMutation, ReclassifyItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReclassifyItemMutation, ReclassifyItemMutationVariables>(ReclassifyItemDocument, options);
      }
export type ReclassifyItemMutationHookResult = ReturnType<typeof useReclassifyItemMutation>;
export type ReclassifyItemMutationResult = Apollo.MutationResult<ReclassifyItemMutation>;
export type ReclassifyItemMutationOptions = Apollo.BaseMutationOptions<ReclassifyItemMutation, ReclassifyItemMutationVariables>;
export const RunQcPipelineDocument = gql`
    mutation RunQCPipeline($batchSize: Int) {
  runQCPipeline(batchSize: $batchSize) {
    checked
    retracted
    contradictions
    errors
  }
}
    `;
export type RunQcPipelineMutationFn = Apollo.MutationFunction<RunQcPipelineMutation, RunQcPipelineMutationVariables>;

/**
 * __useRunQcPipelineMutation__
 *
 * To run a mutation, you first call `useRunQcPipelineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRunQcPipelineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [runQcPipelineMutation, { data, loading, error }] = useRunQcPipelineMutation({
 *   variables: {
 *      batchSize: // value for 'batchSize'
 *   },
 * });
 */
export function useRunQcPipelineMutation(baseOptions?: Apollo.MutationHookOptions<RunQcPipelineMutation, RunQcPipelineMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RunQcPipelineMutation, RunQcPipelineMutationVariables>(RunQcPipelineDocument, options);
      }
export type RunQcPipelineMutationHookResult = ReturnType<typeof useRunQcPipelineMutation>;
export type RunQcPipelineMutationResult = Apollo.MutationResult<RunQcPipelineMutation>;
export type RunQcPipelineMutationOptions = Apollo.BaseMutationOptions<RunQcPipelineMutation, RunQcPipelineMutationVariables>;
export const MigrateOldTaxonomyDocument = gql`
    mutation MigrateOldTaxonomy {
  migrateOldTaxonomy {
    practiceImpactUpdated
    breastSubtypesUpdated
  }
}
    `;
export type MigrateOldTaxonomyMutationFn = Apollo.MutationFunction<MigrateOldTaxonomyMutation, MigrateOldTaxonomyMutationVariables>;

/**
 * __useMigrateOldTaxonomyMutation__
 *
 * To run a mutation, you first call `useMigrateOldTaxonomyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMigrateOldTaxonomyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [migrateOldTaxonomyMutation, { data, loading, error }] = useMigrateOldTaxonomyMutation({
 *   variables: {
 *   },
 * });
 */
export function useMigrateOldTaxonomyMutation(baseOptions?: Apollo.MutationHookOptions<MigrateOldTaxonomyMutation, MigrateOldTaxonomyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MigrateOldTaxonomyMutation, MigrateOldTaxonomyMutationVariables>(MigrateOldTaxonomyDocument, options);
      }
export type MigrateOldTaxonomyMutationHookResult = ReturnType<typeof useMigrateOldTaxonomyMutation>;
export type MigrateOldTaxonomyMutationResult = Apollo.MutationResult<MigrateOldTaxonomyMutation>;
export type MigrateOldTaxonomyMutationOptions = Apollo.BaseMutationOptions<MigrateOldTaxonomyMutation, MigrateOldTaxonomyMutationVariables>;
export const GetPersonalizedFeedDocument = gql`
    query GetPersonalizedFeed($filters: PersonalizedFeedFilters) {
  personalizedFeed(filters: $filters) {
    items {
      item {
        id
        sourceType
        sourceUrl
        sourceCredibility
        title
        journalName
        doi
        publishedAt
        cancerTypes
        breastSubtypes
        maturityTier
        domains
        treatmentClasses
        biomarkerRelevance
        evidenceLevel
        practiceImpact
        patientSummary
        drugNames
        hypeScore
        hypeFlags
        retractionStatus
        classificationStatus
        createdAt
      }
      relevanceScore
      personalizedNote
      viewed
      saved
      dismissed
    }
    total
    hasMore
  }
}
    `;

/**
 * __useGetPersonalizedFeedQuery__
 *
 * To run a query within a React component, call `useGetPersonalizedFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPersonalizedFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPersonalizedFeedQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetPersonalizedFeedQuery(baseOptions?: Apollo.QueryHookOptions<GetPersonalizedFeedQuery, GetPersonalizedFeedQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPersonalizedFeedQuery, GetPersonalizedFeedQueryVariables>(GetPersonalizedFeedDocument, options);
      }
export function useGetPersonalizedFeedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPersonalizedFeedQuery, GetPersonalizedFeedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPersonalizedFeedQuery, GetPersonalizedFeedQueryVariables>(GetPersonalizedFeedDocument, options);
        }
// @ts-ignore
export function useGetPersonalizedFeedSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPersonalizedFeedQuery, GetPersonalizedFeedQueryVariables>): Apollo.UseSuspenseQueryResult<GetPersonalizedFeedQuery, GetPersonalizedFeedQueryVariables>;
export function useGetPersonalizedFeedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPersonalizedFeedQuery, GetPersonalizedFeedQueryVariables>): Apollo.UseSuspenseQueryResult<GetPersonalizedFeedQuery | undefined, GetPersonalizedFeedQueryVariables>;
export function useGetPersonalizedFeedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPersonalizedFeedQuery, GetPersonalizedFeedQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPersonalizedFeedQuery, GetPersonalizedFeedQueryVariables>(GetPersonalizedFeedDocument, options);
        }
export type GetPersonalizedFeedQueryHookResult = ReturnType<typeof useGetPersonalizedFeedQuery>;
export type GetPersonalizedFeedLazyQueryHookResult = ReturnType<typeof useGetPersonalizedFeedLazyQuery>;
export type GetPersonalizedFeedSuspenseQueryHookResult = ReturnType<typeof useGetPersonalizedFeedSuspenseQuery>;
export type GetPersonalizedFeedQueryResult = Apollo.QueryResult<GetPersonalizedFeedQuery, GetPersonalizedFeedQueryVariables>;
export const GetPersonalizedNoteDocument = gql`
    query GetPersonalizedNote($itemId: String!) {
  personalizedNote(itemId: $itemId) {
    itemId
    note
  }
}
    `;

/**
 * __useGetPersonalizedNoteQuery__
 *
 * To run a query within a React component, call `useGetPersonalizedNoteQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPersonalizedNoteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPersonalizedNoteQuery({
 *   variables: {
 *      itemId: // value for 'itemId'
 *   },
 * });
 */
export function useGetPersonalizedNoteQuery(baseOptions: Apollo.QueryHookOptions<GetPersonalizedNoteQuery, GetPersonalizedNoteQueryVariables> & ({ variables: GetPersonalizedNoteQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPersonalizedNoteQuery, GetPersonalizedNoteQueryVariables>(GetPersonalizedNoteDocument, options);
      }
export function useGetPersonalizedNoteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPersonalizedNoteQuery, GetPersonalizedNoteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPersonalizedNoteQuery, GetPersonalizedNoteQueryVariables>(GetPersonalizedNoteDocument, options);
        }
// @ts-ignore
export function useGetPersonalizedNoteSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPersonalizedNoteQuery, GetPersonalizedNoteQueryVariables>): Apollo.UseSuspenseQueryResult<GetPersonalizedNoteQuery, GetPersonalizedNoteQueryVariables>;
export function useGetPersonalizedNoteSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPersonalizedNoteQuery, GetPersonalizedNoteQueryVariables>): Apollo.UseSuspenseQueryResult<GetPersonalizedNoteQuery | undefined, GetPersonalizedNoteQueryVariables>;
export function useGetPersonalizedNoteSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPersonalizedNoteQuery, GetPersonalizedNoteQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPersonalizedNoteQuery, GetPersonalizedNoteQueryVariables>(GetPersonalizedNoteDocument, options);
        }
export type GetPersonalizedNoteQueryHookResult = ReturnType<typeof useGetPersonalizedNoteQuery>;
export type GetPersonalizedNoteLazyQueryHookResult = ReturnType<typeof useGetPersonalizedNoteLazyQuery>;
export type GetPersonalizedNoteSuspenseQueryHookResult = ReturnType<typeof useGetPersonalizedNoteSuspenseQuery>;
export type GetPersonalizedNoteQueryResult = Apollo.QueryResult<GetPersonalizedNoteQuery, GetPersonalizedNoteQueryVariables>;
export const GetFeedConfigDocument = gql`
    query GetFeedConfig {
  feedConfig {
    id
    audienceType
    contentDepth
    showPreclinical
    showNegativeResults
    digestFrequency
  }
}
    `;

/**
 * __useGetFeedConfigQuery__
 *
 * To run a query within a React component, call `useGetFeedConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFeedConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFeedConfigQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFeedConfigQuery(baseOptions?: Apollo.QueryHookOptions<GetFeedConfigQuery, GetFeedConfigQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFeedConfigQuery, GetFeedConfigQueryVariables>(GetFeedConfigDocument, options);
      }
export function useGetFeedConfigLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFeedConfigQuery, GetFeedConfigQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFeedConfigQuery, GetFeedConfigQueryVariables>(GetFeedConfigDocument, options);
        }
// @ts-ignore
export function useGetFeedConfigSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFeedConfigQuery, GetFeedConfigQueryVariables>): Apollo.UseSuspenseQueryResult<GetFeedConfigQuery, GetFeedConfigQueryVariables>;
export function useGetFeedConfigSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFeedConfigQuery, GetFeedConfigQueryVariables>): Apollo.UseSuspenseQueryResult<GetFeedConfigQuery | undefined, GetFeedConfigQueryVariables>;
export function useGetFeedConfigSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFeedConfigQuery, GetFeedConfigQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFeedConfigQuery, GetFeedConfigQueryVariables>(GetFeedConfigDocument, options);
        }
export type GetFeedConfigQueryHookResult = ReturnType<typeof useGetFeedConfigQuery>;
export type GetFeedConfigLazyQueryHookResult = ReturnType<typeof useGetFeedConfigLazyQuery>;
export type GetFeedConfigSuspenseQueryHookResult = ReturnType<typeof useGetFeedConfigSuspenseQuery>;
export type GetFeedConfigQueryResult = Apollo.QueryResult<GetFeedConfigQuery, GetFeedConfigQueryVariables>;
export const MarkItemViewedDocument = gql`
    mutation MarkItemViewed($itemId: String!) {
  markItemViewed(itemId: $itemId)
}
    `;
export type MarkItemViewedMutationFn = Apollo.MutationFunction<MarkItemViewedMutation, MarkItemViewedMutationVariables>;

/**
 * __useMarkItemViewedMutation__
 *
 * To run a mutation, you first call `useMarkItemViewedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkItemViewedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markItemViewedMutation, { data, loading, error }] = useMarkItemViewedMutation({
 *   variables: {
 *      itemId: // value for 'itemId'
 *   },
 * });
 */
export function useMarkItemViewedMutation(baseOptions?: Apollo.MutationHookOptions<MarkItemViewedMutation, MarkItemViewedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MarkItemViewedMutation, MarkItemViewedMutationVariables>(MarkItemViewedDocument, options);
      }
export type MarkItemViewedMutationHookResult = ReturnType<typeof useMarkItemViewedMutation>;
export type MarkItemViewedMutationResult = Apollo.MutationResult<MarkItemViewedMutation>;
export type MarkItemViewedMutationOptions = Apollo.BaseMutationOptions<MarkItemViewedMutation, MarkItemViewedMutationVariables>;
export const MarkItemSavedDocument = gql`
    mutation MarkItemSaved($itemId: String!, $saved: Boolean!) {
  markItemSaved(itemId: $itemId, saved: $saved)
}
    `;
export type MarkItemSavedMutationFn = Apollo.MutationFunction<MarkItemSavedMutation, MarkItemSavedMutationVariables>;

/**
 * __useMarkItemSavedMutation__
 *
 * To run a mutation, you first call `useMarkItemSavedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkItemSavedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markItemSavedMutation, { data, loading, error }] = useMarkItemSavedMutation({
 *   variables: {
 *      itemId: // value for 'itemId'
 *      saved: // value for 'saved'
 *   },
 * });
 */
export function useMarkItemSavedMutation(baseOptions?: Apollo.MutationHookOptions<MarkItemSavedMutation, MarkItemSavedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MarkItemSavedMutation, MarkItemSavedMutationVariables>(MarkItemSavedDocument, options);
      }
export type MarkItemSavedMutationHookResult = ReturnType<typeof useMarkItemSavedMutation>;
export type MarkItemSavedMutationResult = Apollo.MutationResult<MarkItemSavedMutation>;
export type MarkItemSavedMutationOptions = Apollo.BaseMutationOptions<MarkItemSavedMutation, MarkItemSavedMutationVariables>;
export const MarkItemDismissedDocument = gql`
    mutation MarkItemDismissed($itemId: String!) {
  markItemDismissed(itemId: $itemId)
}
    `;
export type MarkItemDismissedMutationFn = Apollo.MutationFunction<MarkItemDismissedMutation, MarkItemDismissedMutationVariables>;

/**
 * __useMarkItemDismissedMutation__
 *
 * To run a mutation, you first call `useMarkItemDismissedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkItemDismissedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markItemDismissedMutation, { data, loading, error }] = useMarkItemDismissedMutation({
 *   variables: {
 *      itemId: // value for 'itemId'
 *   },
 * });
 */
export function useMarkItemDismissedMutation(baseOptions?: Apollo.MutationHookOptions<MarkItemDismissedMutation, MarkItemDismissedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MarkItemDismissedMutation, MarkItemDismissedMutationVariables>(MarkItemDismissedDocument, options);
      }
export type MarkItemDismissedMutationHookResult = ReturnType<typeof useMarkItemDismissedMutation>;
export type MarkItemDismissedMutationResult = Apollo.MutationResult<MarkItemDismissedMutation>;
export type MarkItemDismissedMutationOptions = Apollo.BaseMutationOptions<MarkItemDismissedMutation, MarkItemDismissedMutationVariables>;
export const UpdateFeedConfigDocument = gql`
    mutation UpdateFeedConfig($input: UpdateFeedConfigInput!) {
  updateFeedConfig(input: $input) {
    id
    audienceType
    contentDepth
    showPreclinical
    showNegativeResults
    digestFrequency
  }
}
    `;
export type UpdateFeedConfigMutationFn = Apollo.MutationFunction<UpdateFeedConfigMutation, UpdateFeedConfigMutationVariables>;

/**
 * __useUpdateFeedConfigMutation__
 *
 * To run a mutation, you first call `useUpdateFeedConfigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFeedConfigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFeedConfigMutation, { data, loading, error }] = useUpdateFeedConfigMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateFeedConfigMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFeedConfigMutation, UpdateFeedConfigMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFeedConfigMutation, UpdateFeedConfigMutationVariables>(UpdateFeedConfigDocument, options);
      }
export type UpdateFeedConfigMutationHookResult = ReturnType<typeof useUpdateFeedConfigMutation>;
export type UpdateFeedConfigMutationResult = Apollo.MutationResult<UpdateFeedConfigMutation>;
export type UpdateFeedConfigMutationOptions = Apollo.BaseMutationOptions<UpdateFeedConfigMutation, UpdateFeedConfigMutationVariables>;
export const ComputeRelevanceScoresDocument = gql`
    mutation ComputeRelevanceScores {
  computeRelevanceScores
}
    `;
export type ComputeRelevanceScoresMutationFn = Apollo.MutationFunction<ComputeRelevanceScoresMutation, ComputeRelevanceScoresMutationVariables>;

/**
 * __useComputeRelevanceScoresMutation__
 *
 * To run a mutation, you first call `useComputeRelevanceScoresMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useComputeRelevanceScoresMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [computeRelevanceScoresMutation, { data, loading, error }] = useComputeRelevanceScoresMutation({
 *   variables: {
 *   },
 * });
 */
export function useComputeRelevanceScoresMutation(baseOptions?: Apollo.MutationHookOptions<ComputeRelevanceScoresMutation, ComputeRelevanceScoresMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ComputeRelevanceScoresMutation, ComputeRelevanceScoresMutationVariables>(ComputeRelevanceScoresDocument, options);
      }
export type ComputeRelevanceScoresMutationHookResult = ReturnType<typeof useComputeRelevanceScoresMutation>;
export type ComputeRelevanceScoresMutationResult = Apollo.MutationResult<ComputeRelevanceScoresMutation>;
export type ComputeRelevanceScoresMutationOptions = Apollo.BaseMutationOptions<ComputeRelevanceScoresMutation, ComputeRelevanceScoresMutationVariables>;
export const GetCommunityReportsDocument = gql`
    query GetCommunityReports {
  communityReports {
    id
    patientId
    reportType
    consentScope
    structuredData
    narrative
    moderationStatus
    verified
    relatedDrug
    relatedTrialNctId
    relatedItemId
    createdAt
  }
}
    `;

/**
 * __useGetCommunityReportsQuery__
 *
 * To run a query within a React component, call `useGetCommunityReportsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommunityReportsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommunityReportsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCommunityReportsQuery(baseOptions?: Apollo.QueryHookOptions<GetCommunityReportsQuery, GetCommunityReportsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCommunityReportsQuery, GetCommunityReportsQueryVariables>(GetCommunityReportsDocument, options);
      }
export function useGetCommunityReportsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCommunityReportsQuery, GetCommunityReportsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCommunityReportsQuery, GetCommunityReportsQueryVariables>(GetCommunityReportsDocument, options);
        }
// @ts-ignore
export function useGetCommunityReportsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCommunityReportsQuery, GetCommunityReportsQueryVariables>): Apollo.UseSuspenseQueryResult<GetCommunityReportsQuery, GetCommunityReportsQueryVariables>;
export function useGetCommunityReportsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCommunityReportsQuery, GetCommunityReportsQueryVariables>): Apollo.UseSuspenseQueryResult<GetCommunityReportsQuery | undefined, GetCommunityReportsQueryVariables>;
export function useGetCommunityReportsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCommunityReportsQuery, GetCommunityReportsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCommunityReportsQuery, GetCommunityReportsQueryVariables>(GetCommunityReportsDocument, options);
        }
export type GetCommunityReportsQueryHookResult = ReturnType<typeof useGetCommunityReportsQuery>;
export type GetCommunityReportsLazyQueryHookResult = ReturnType<typeof useGetCommunityReportsLazyQuery>;
export type GetCommunityReportsSuspenseQueryHookResult = ReturnType<typeof useGetCommunityReportsSuspenseQuery>;
export type GetCommunityReportsQueryResult = Apollo.QueryResult<GetCommunityReportsQuery, GetCommunityReportsQueryVariables>;
export const GetCommunityInsightsDocument = gql`
    query GetCommunityInsights($drugName: String!) {
  communityInsights(drugName: $drugName) {
    drugName
    totalReports
    averageRating
    commonSideEffects {
      effect
      reportedByPercent
      averageSeverity
      averageOnset
      resolvedPercent
      topManagementTips
    }
    trialSummary {
      totalReports
      averageRating
      commonPros
      commonCons
    }
  }
}
    `;

/**
 * __useGetCommunityInsightsQuery__
 *
 * To run a query within a React component, call `useGetCommunityInsightsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommunityInsightsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommunityInsightsQuery({
 *   variables: {
 *      drugName: // value for 'drugName'
 *   },
 * });
 */
export function useGetCommunityInsightsQuery(baseOptions: Apollo.QueryHookOptions<GetCommunityInsightsQuery, GetCommunityInsightsQueryVariables> & ({ variables: GetCommunityInsightsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCommunityInsightsQuery, GetCommunityInsightsQueryVariables>(GetCommunityInsightsDocument, options);
      }
export function useGetCommunityInsightsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCommunityInsightsQuery, GetCommunityInsightsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCommunityInsightsQuery, GetCommunityInsightsQueryVariables>(GetCommunityInsightsDocument, options);
        }
// @ts-ignore
export function useGetCommunityInsightsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCommunityInsightsQuery, GetCommunityInsightsQueryVariables>): Apollo.UseSuspenseQueryResult<GetCommunityInsightsQuery, GetCommunityInsightsQueryVariables>;
export function useGetCommunityInsightsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCommunityInsightsQuery, GetCommunityInsightsQueryVariables>): Apollo.UseSuspenseQueryResult<GetCommunityInsightsQuery | undefined, GetCommunityInsightsQueryVariables>;
export function useGetCommunityInsightsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCommunityInsightsQuery, GetCommunityInsightsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCommunityInsightsQuery, GetCommunityInsightsQueryVariables>(GetCommunityInsightsDocument, options);
        }
export type GetCommunityInsightsQueryHookResult = ReturnType<typeof useGetCommunityInsightsQuery>;
export type GetCommunityInsightsLazyQueryHookResult = ReturnType<typeof useGetCommunityInsightsLazyQuery>;
export type GetCommunityInsightsSuspenseQueryHookResult = ReturnType<typeof useGetCommunityInsightsSuspenseQuery>;
export type GetCommunityInsightsQueryResult = Apollo.QueryResult<GetCommunityInsightsQuery, GetCommunityInsightsQueryVariables>;
export const GetCommunityInsightsForItemDocument = gql`
    query GetCommunityInsightsForItem($itemId: String!) {
  communityInsightsForItem(itemId: $itemId) {
    drugName
    totalReports
    averageRating
    commonSideEffects {
      effect
      reportedByPercent
      averageSeverity
      averageOnset
      resolvedPercent
      topManagementTips
    }
    trialSummary {
      totalReports
      averageRating
      commonPros
      commonCons
    }
  }
}
    `;

/**
 * __useGetCommunityInsightsForItemQuery__
 *
 * To run a query within a React component, call `useGetCommunityInsightsForItemQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommunityInsightsForItemQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommunityInsightsForItemQuery({
 *   variables: {
 *      itemId: // value for 'itemId'
 *   },
 * });
 */
export function useGetCommunityInsightsForItemQuery(baseOptions: Apollo.QueryHookOptions<GetCommunityInsightsForItemQuery, GetCommunityInsightsForItemQueryVariables> & ({ variables: GetCommunityInsightsForItemQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCommunityInsightsForItemQuery, GetCommunityInsightsForItemQueryVariables>(GetCommunityInsightsForItemDocument, options);
      }
export function useGetCommunityInsightsForItemLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCommunityInsightsForItemQuery, GetCommunityInsightsForItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCommunityInsightsForItemQuery, GetCommunityInsightsForItemQueryVariables>(GetCommunityInsightsForItemDocument, options);
        }
// @ts-ignore
export function useGetCommunityInsightsForItemSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCommunityInsightsForItemQuery, GetCommunityInsightsForItemQueryVariables>): Apollo.UseSuspenseQueryResult<GetCommunityInsightsForItemQuery, GetCommunityInsightsForItemQueryVariables>;
export function useGetCommunityInsightsForItemSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCommunityInsightsForItemQuery, GetCommunityInsightsForItemQueryVariables>): Apollo.UseSuspenseQueryResult<GetCommunityInsightsForItemQuery | undefined, GetCommunityInsightsForItemQueryVariables>;
export function useGetCommunityInsightsForItemSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCommunityInsightsForItemQuery, GetCommunityInsightsForItemQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCommunityInsightsForItemQuery, GetCommunityInsightsForItemQueryVariables>(GetCommunityInsightsForItemDocument, options);
        }
export type GetCommunityInsightsForItemQueryHookResult = ReturnType<typeof useGetCommunityInsightsForItemQuery>;
export type GetCommunityInsightsForItemLazyQueryHookResult = ReturnType<typeof useGetCommunityInsightsForItemLazyQuery>;
export type GetCommunityInsightsForItemSuspenseQueryHookResult = ReturnType<typeof useGetCommunityInsightsForItemSuspenseQuery>;
export type GetCommunityInsightsForItemQueryResult = Apollo.QueryResult<GetCommunityInsightsForItemQuery, GetCommunityInsightsForItemQueryVariables>;
export const GetDigestPreviewDocument = gql`
    query GetDigestPreview {
  digestPreview {
    urgent {
      itemId
      headline
      summary
      maturityBadge
      relevanceReason
      viewUrl
    }
    personallyRelevant {
      itemId
      headline
      summary
      maturityBadge
      relevanceReason
      viewUrl
    }
    landscapeHighlights {
      itemId
      headline
      summary
      maturityBadge
      relevanceReason
      viewUrl
    }
    communityHighlights {
      itemId
      headline
      summary
      maturityBadge
      relevanceReason
      viewUrl
    }
    trialUpdates {
      itemId
      headline
      summary
      maturityBadge
      relevanceReason
      viewUrl
    }
    totalNewItems
  }
}
    `;

/**
 * __useGetDigestPreviewQuery__
 *
 * To run a query within a React component, call `useGetDigestPreviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDigestPreviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDigestPreviewQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDigestPreviewQuery(baseOptions?: Apollo.QueryHookOptions<GetDigestPreviewQuery, GetDigestPreviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDigestPreviewQuery, GetDigestPreviewQueryVariables>(GetDigestPreviewDocument, options);
      }
export function useGetDigestPreviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDigestPreviewQuery, GetDigestPreviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDigestPreviewQuery, GetDigestPreviewQueryVariables>(GetDigestPreviewDocument, options);
        }
// @ts-ignore
export function useGetDigestPreviewSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetDigestPreviewQuery, GetDigestPreviewQueryVariables>): Apollo.UseSuspenseQueryResult<GetDigestPreviewQuery, GetDigestPreviewQueryVariables>;
export function useGetDigestPreviewSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDigestPreviewQuery, GetDigestPreviewQueryVariables>): Apollo.UseSuspenseQueryResult<GetDigestPreviewQuery | undefined, GetDigestPreviewQueryVariables>;
export function useGetDigestPreviewSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDigestPreviewQuery, GetDigestPreviewQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDigestPreviewQuery, GetDigestPreviewQueryVariables>(GetDigestPreviewDocument, options);
        }
export type GetDigestPreviewQueryHookResult = ReturnType<typeof useGetDigestPreviewQuery>;
export type GetDigestPreviewLazyQueryHookResult = ReturnType<typeof useGetDigestPreviewLazyQuery>;
export type GetDigestPreviewSuspenseQueryHookResult = ReturnType<typeof useGetDigestPreviewSuspenseQuery>;
export type GetDigestPreviewQueryResult = Apollo.QueryResult<GetDigestPreviewQuery, GetDigestPreviewQueryVariables>;
export const SubmitCommunityReportDocument = gql`
    mutation SubmitCommunityReport($input: SubmitCommunityReportInput!) {
  submitCommunityReport(input: $input) {
    id
    reportType
    consentScope
    structuredData
    narrative
    moderationStatus
    verified
    relatedDrug
    relatedTrialNctId
    createdAt
  }
}
    `;
export type SubmitCommunityReportMutationFn = Apollo.MutationFunction<SubmitCommunityReportMutation, SubmitCommunityReportMutationVariables>;

/**
 * __useSubmitCommunityReportMutation__
 *
 * To run a mutation, you first call `useSubmitCommunityReportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitCommunityReportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitCommunityReportMutation, { data, loading, error }] = useSubmitCommunityReportMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitCommunityReportMutation(baseOptions?: Apollo.MutationHookOptions<SubmitCommunityReportMutation, SubmitCommunityReportMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitCommunityReportMutation, SubmitCommunityReportMutationVariables>(SubmitCommunityReportDocument, options);
      }
export type SubmitCommunityReportMutationHookResult = ReturnType<typeof useSubmitCommunityReportMutation>;
export type SubmitCommunityReportMutationResult = Apollo.MutationResult<SubmitCommunityReportMutation>;
export type SubmitCommunityReportMutationOptions = Apollo.BaseMutationOptions<SubmitCommunityReportMutation, SubmitCommunityReportMutationVariables>;
export const ModerateCommunityReportDocument = gql`
    mutation ModerateCommunityReport($reportId: String!, $status: String!) {
  moderateCommunityReport(reportId: $reportId, status: $status) {
    id
    moderationStatus
  }
}
    `;
export type ModerateCommunityReportMutationFn = Apollo.MutationFunction<ModerateCommunityReportMutation, ModerateCommunityReportMutationVariables>;

/**
 * __useModerateCommunityReportMutation__
 *
 * To run a mutation, you first call `useModerateCommunityReportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useModerateCommunityReportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moderateCommunityReportMutation, { data, loading, error }] = useModerateCommunityReportMutation({
 *   variables: {
 *      reportId: // value for 'reportId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useModerateCommunityReportMutation(baseOptions?: Apollo.MutationHookOptions<ModerateCommunityReportMutation, ModerateCommunityReportMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ModerateCommunityReportMutation, ModerateCommunityReportMutationVariables>(ModerateCommunityReportDocument, options);
      }
export type ModerateCommunityReportMutationHookResult = ReturnType<typeof useModerateCommunityReportMutation>;
export type ModerateCommunityReportMutationResult = Apollo.MutationResult<ModerateCommunityReportMutation>;
export type ModerateCommunityReportMutationOptions = Apollo.BaseMutationOptions<ModerateCommunityReportMutation, ModerateCommunityReportMutationVariables>;
export const UpdateDigestPreferencesDocument = gql`
    mutation UpdateDigestPreferences($frequency: String) {
  updateDigestPreferences(frequency: $frequency) {
    id
    audienceType
    contentDepth
    showPreclinical
    showNegativeResults
    digestFrequency
  }
}
    `;
export type UpdateDigestPreferencesMutationFn = Apollo.MutationFunction<UpdateDigestPreferencesMutation, UpdateDigestPreferencesMutationVariables>;

/**
 * __useUpdateDigestPreferencesMutation__
 *
 * To run a mutation, you first call `useUpdateDigestPreferencesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDigestPreferencesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDigestPreferencesMutation, { data, loading, error }] = useUpdateDigestPreferencesMutation({
 *   variables: {
 *      frequency: // value for 'frequency'
 *   },
 * });
 */
export function useUpdateDigestPreferencesMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDigestPreferencesMutation, UpdateDigestPreferencesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateDigestPreferencesMutation, UpdateDigestPreferencesMutationVariables>(UpdateDigestPreferencesDocument, options);
      }
export type UpdateDigestPreferencesMutationHookResult = ReturnType<typeof useUpdateDigestPreferencesMutation>;
export type UpdateDigestPreferencesMutationResult = Apollo.MutationResult<UpdateDigestPreferencesMutation>;
export type UpdateDigestPreferencesMutationOptions = Apollo.BaseMutationOptions<UpdateDigestPreferencesMutation, UpdateDigestPreferencesMutationVariables>;
export const GetLandscapeOverviewDocument = gql`
    query GetLandscapeOverview {
  landscapeOverview {
    totalItems
    maturityDistribution
    domainDistribution
    subtypeDistribution
    treatmentClassDistribution
    recentHighlights {
      id
      sourceType
      title
      maturityTier
      practiceImpact
      patientSummary
      drugNames
      publishedAt
    }
    lastUpdated
  }
}
    `;

/**
 * __useGetLandscapeOverviewQuery__
 *
 * To run a query within a React component, call `useGetLandscapeOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLandscapeOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLandscapeOverviewQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLandscapeOverviewQuery(baseOptions?: Apollo.QueryHookOptions<GetLandscapeOverviewQuery, GetLandscapeOverviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLandscapeOverviewQuery, GetLandscapeOverviewQueryVariables>(GetLandscapeOverviewDocument, options);
      }
export function useGetLandscapeOverviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLandscapeOverviewQuery, GetLandscapeOverviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLandscapeOverviewQuery, GetLandscapeOverviewQueryVariables>(GetLandscapeOverviewDocument, options);
        }
// @ts-ignore
export function useGetLandscapeOverviewSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetLandscapeOverviewQuery, GetLandscapeOverviewQueryVariables>): Apollo.UseSuspenseQueryResult<GetLandscapeOverviewQuery, GetLandscapeOverviewQueryVariables>;
export function useGetLandscapeOverviewSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLandscapeOverviewQuery, GetLandscapeOverviewQueryVariables>): Apollo.UseSuspenseQueryResult<GetLandscapeOverviewQuery | undefined, GetLandscapeOverviewQueryVariables>;
export function useGetLandscapeOverviewSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLandscapeOverviewQuery, GetLandscapeOverviewQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLandscapeOverviewQuery, GetLandscapeOverviewQueryVariables>(GetLandscapeOverviewDocument, options);
        }
export type GetLandscapeOverviewQueryHookResult = ReturnType<typeof useGetLandscapeOverviewQuery>;
export type GetLandscapeOverviewLazyQueryHookResult = ReturnType<typeof useGetLandscapeOverviewLazyQuery>;
export type GetLandscapeOverviewSuspenseQueryHookResult = ReturnType<typeof useGetLandscapeOverviewSuspenseQuery>;
export type GetLandscapeOverviewQueryResult = Apollo.QueryResult<GetLandscapeOverviewQuery, GetLandscapeOverviewQueryVariables>;
export const GetSubtypeLandscapeDocument = gql`
    query GetSubtypeLandscape($subtype: String!) {
  subtypeLandscape(subtype: $subtype) {
    subtype
    subtypeLabel
    totalItems
    maturityDistribution
    domainDistribution
    standardOfCare {
      subtype
      currentSOC
      whatsChanging
      whatsComing
      whatsBeingExplored
      generatedAt
    }
    availableNow {
      id
      title
      maturityTier
      practiceImpact
      patientSummary
      drugNames
      publishedAt
    }
    expectedSoon {
      id
      title
      maturityTier
      practiceImpact
      patientSummary
      drugNames
      publishedAt
    }
    inTrials {
      id
      title
      maturityTier
      practiceImpact
      patientSummary
      drugNames
      publishedAt
    }
    earlyResearch {
      id
      title
      maturityTier
      practiceImpact
      patientSummary
      drugNames
      publishedAt
    }
    topDrugs {
      drugName
      maturityTier
      treatmentClass
      itemCount
      latestItemId
      latestItemTitle
      latestPublishedAt
    }
  }
}
    `;

/**
 * __useGetSubtypeLandscapeQuery__
 *
 * To run a query within a React component, call `useGetSubtypeLandscapeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSubtypeLandscapeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSubtypeLandscapeQuery({
 *   variables: {
 *      subtype: // value for 'subtype'
 *   },
 * });
 */
export function useGetSubtypeLandscapeQuery(baseOptions: Apollo.QueryHookOptions<GetSubtypeLandscapeQuery, GetSubtypeLandscapeQueryVariables> & ({ variables: GetSubtypeLandscapeQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSubtypeLandscapeQuery, GetSubtypeLandscapeQueryVariables>(GetSubtypeLandscapeDocument, options);
      }
export function useGetSubtypeLandscapeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSubtypeLandscapeQuery, GetSubtypeLandscapeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSubtypeLandscapeQuery, GetSubtypeLandscapeQueryVariables>(GetSubtypeLandscapeDocument, options);
        }
// @ts-ignore
export function useGetSubtypeLandscapeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSubtypeLandscapeQuery, GetSubtypeLandscapeQueryVariables>): Apollo.UseSuspenseQueryResult<GetSubtypeLandscapeQuery, GetSubtypeLandscapeQueryVariables>;
export function useGetSubtypeLandscapeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSubtypeLandscapeQuery, GetSubtypeLandscapeQueryVariables>): Apollo.UseSuspenseQueryResult<GetSubtypeLandscapeQuery | undefined, GetSubtypeLandscapeQueryVariables>;
export function useGetSubtypeLandscapeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSubtypeLandscapeQuery, GetSubtypeLandscapeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSubtypeLandscapeQuery, GetSubtypeLandscapeQueryVariables>(GetSubtypeLandscapeDocument, options);
        }
export type GetSubtypeLandscapeQueryHookResult = ReturnType<typeof useGetSubtypeLandscapeQuery>;
export type GetSubtypeLandscapeLazyQueryHookResult = ReturnType<typeof useGetSubtypeLandscapeLazyQuery>;
export type GetSubtypeLandscapeSuspenseQueryHookResult = ReturnType<typeof useGetSubtypeLandscapeSuspenseQuery>;
export type GetSubtypeLandscapeQueryResult = Apollo.QueryResult<GetSubtypeLandscapeQuery, GetSubtypeLandscapeQueryVariables>;
export const GetTreatmentPipelineDocument = gql`
    query GetTreatmentPipeline($subtype: String) {
  treatmentPipeline(subtype: $subtype) {
    drugName
    maturityTier
    treatmentClass
    itemCount
    latestItemId
    latestItemTitle
    latestPublishedAt
  }
}
    `;

/**
 * __useGetTreatmentPipelineQuery__
 *
 * To run a query within a React component, call `useGetTreatmentPipelineQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTreatmentPipelineQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTreatmentPipelineQuery({
 *   variables: {
 *      subtype: // value for 'subtype'
 *   },
 * });
 */
export function useGetTreatmentPipelineQuery(baseOptions?: Apollo.QueryHookOptions<GetTreatmentPipelineQuery, GetTreatmentPipelineQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTreatmentPipelineQuery, GetTreatmentPipelineQueryVariables>(GetTreatmentPipelineDocument, options);
      }
export function useGetTreatmentPipelineLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTreatmentPipelineQuery, GetTreatmentPipelineQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTreatmentPipelineQuery, GetTreatmentPipelineQueryVariables>(GetTreatmentPipelineDocument, options);
        }
// @ts-ignore
export function useGetTreatmentPipelineSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTreatmentPipelineQuery, GetTreatmentPipelineQueryVariables>): Apollo.UseSuspenseQueryResult<GetTreatmentPipelineQuery, GetTreatmentPipelineQueryVariables>;
export function useGetTreatmentPipelineSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTreatmentPipelineQuery, GetTreatmentPipelineQueryVariables>): Apollo.UseSuspenseQueryResult<GetTreatmentPipelineQuery | undefined, GetTreatmentPipelineQueryVariables>;
export function useGetTreatmentPipelineSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTreatmentPipelineQuery, GetTreatmentPipelineQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTreatmentPipelineQuery, GetTreatmentPipelineQueryVariables>(GetTreatmentPipelineDocument, options);
        }
export type GetTreatmentPipelineQueryHookResult = ReturnType<typeof useGetTreatmentPipelineQuery>;
export type GetTreatmentPipelineLazyQueryHookResult = ReturnType<typeof useGetTreatmentPipelineLazyQuery>;
export type GetTreatmentPipelineSuspenseQueryHookResult = ReturnType<typeof useGetTreatmentPipelineSuspenseQuery>;
export type GetTreatmentPipelineQueryResult = Apollo.QueryResult<GetTreatmentPipelineQuery, GetTreatmentPipelineQueryVariables>;
export const GetRecentDevelopmentsDocument = gql`
    query GetRecentDevelopments($subtype: String, $days: Int) {
  recentDevelopments(subtype: $subtype, days: $days) {
    id
    sourceType
    title
    maturityTier
    practiceImpact
    patientSummary
    drugNames
    publishedAt
  }
}
    `;

/**
 * __useGetRecentDevelopmentsQuery__
 *
 * To run a query within a React component, call `useGetRecentDevelopmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecentDevelopmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecentDevelopmentsQuery({
 *   variables: {
 *      subtype: // value for 'subtype'
 *      days: // value for 'days'
 *   },
 * });
 */
export function useGetRecentDevelopmentsQuery(baseOptions?: Apollo.QueryHookOptions<GetRecentDevelopmentsQuery, GetRecentDevelopmentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecentDevelopmentsQuery, GetRecentDevelopmentsQueryVariables>(GetRecentDevelopmentsDocument, options);
      }
export function useGetRecentDevelopmentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecentDevelopmentsQuery, GetRecentDevelopmentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecentDevelopmentsQuery, GetRecentDevelopmentsQueryVariables>(GetRecentDevelopmentsDocument, options);
        }
// @ts-ignore
export function useGetRecentDevelopmentsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecentDevelopmentsQuery, GetRecentDevelopmentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecentDevelopmentsQuery, GetRecentDevelopmentsQueryVariables>;
export function useGetRecentDevelopmentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecentDevelopmentsQuery, GetRecentDevelopmentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecentDevelopmentsQuery | undefined, GetRecentDevelopmentsQueryVariables>;
export function useGetRecentDevelopmentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecentDevelopmentsQuery, GetRecentDevelopmentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecentDevelopmentsQuery, GetRecentDevelopmentsQueryVariables>(GetRecentDevelopmentsDocument, options);
        }
export type GetRecentDevelopmentsQueryHookResult = ReturnType<typeof useGetRecentDevelopmentsQuery>;
export type GetRecentDevelopmentsLazyQueryHookResult = ReturnType<typeof useGetRecentDevelopmentsLazyQuery>;
export type GetRecentDevelopmentsSuspenseQueryHookResult = ReturnType<typeof useGetRecentDevelopmentsSuspenseQuery>;
export type GetRecentDevelopmentsQueryResult = Apollo.QueryResult<GetRecentDevelopmentsQuery, GetRecentDevelopmentsQueryVariables>;
export const GetTranslatorUpdatesDocument = gql`
    query GetTranslatorUpdates {
  translatorUpdates {
    hasUpdates
    items {
      id
      title
      maturityTier
      practiceImpact
      drugNames
      publishedAt
    }
    count
    since
  }
}
    `;

/**
 * __useGetTranslatorUpdatesQuery__
 *
 * To run a query within a React component, call `useGetTranslatorUpdatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTranslatorUpdatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTranslatorUpdatesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTranslatorUpdatesQuery(baseOptions?: Apollo.QueryHookOptions<GetTranslatorUpdatesQuery, GetTranslatorUpdatesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTranslatorUpdatesQuery, GetTranslatorUpdatesQueryVariables>(GetTranslatorUpdatesDocument, options);
      }
export function useGetTranslatorUpdatesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTranslatorUpdatesQuery, GetTranslatorUpdatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTranslatorUpdatesQuery, GetTranslatorUpdatesQueryVariables>(GetTranslatorUpdatesDocument, options);
        }
// @ts-ignore
export function useGetTranslatorUpdatesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTranslatorUpdatesQuery, GetTranslatorUpdatesQueryVariables>): Apollo.UseSuspenseQueryResult<GetTranslatorUpdatesQuery, GetTranslatorUpdatesQueryVariables>;
export function useGetTranslatorUpdatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTranslatorUpdatesQuery, GetTranslatorUpdatesQueryVariables>): Apollo.UseSuspenseQueryResult<GetTranslatorUpdatesQuery | undefined, GetTranslatorUpdatesQueryVariables>;
export function useGetTranslatorUpdatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTranslatorUpdatesQuery, GetTranslatorUpdatesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTranslatorUpdatesQuery, GetTranslatorUpdatesQueryVariables>(GetTranslatorUpdatesDocument, options);
        }
export type GetTranslatorUpdatesQueryHookResult = ReturnType<typeof useGetTranslatorUpdatesQuery>;
export type GetTranslatorUpdatesLazyQueryHookResult = ReturnType<typeof useGetTranslatorUpdatesLazyQuery>;
export type GetTranslatorUpdatesSuspenseQueryHookResult = ReturnType<typeof useGetTranslatorUpdatesSuspenseQuery>;
export type GetTranslatorUpdatesQueryResult = Apollo.QueryResult<GetTranslatorUpdatesQuery, GetTranslatorUpdatesQueryVariables>;
export const GetFinancialUpdatesDocument = gql`
    query GetFinancialUpdates {
  financialUpdates {
    newApprovals {
      id
      title
      maturityTier
      practiceImpact
      drugNames
      publishedAt
    }
    hasPAPOpportunities
  }
}
    `;

/**
 * __useGetFinancialUpdatesQuery__
 *
 * To run a query within a React component, call `useGetFinancialUpdatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFinancialUpdatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFinancialUpdatesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFinancialUpdatesQuery(baseOptions?: Apollo.QueryHookOptions<GetFinancialUpdatesQuery, GetFinancialUpdatesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFinancialUpdatesQuery, GetFinancialUpdatesQueryVariables>(GetFinancialUpdatesDocument, options);
      }
export function useGetFinancialUpdatesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFinancialUpdatesQuery, GetFinancialUpdatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFinancialUpdatesQuery, GetFinancialUpdatesQueryVariables>(GetFinancialUpdatesDocument, options);
        }
// @ts-ignore
export function useGetFinancialUpdatesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFinancialUpdatesQuery, GetFinancialUpdatesQueryVariables>): Apollo.UseSuspenseQueryResult<GetFinancialUpdatesQuery, GetFinancialUpdatesQueryVariables>;
export function useGetFinancialUpdatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFinancialUpdatesQuery, GetFinancialUpdatesQueryVariables>): Apollo.UseSuspenseQueryResult<GetFinancialUpdatesQuery | undefined, GetFinancialUpdatesQueryVariables>;
export function useGetFinancialUpdatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFinancialUpdatesQuery, GetFinancialUpdatesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFinancialUpdatesQuery, GetFinancialUpdatesQueryVariables>(GetFinancialUpdatesDocument, options);
        }
export type GetFinancialUpdatesQueryHookResult = ReturnType<typeof useGetFinancialUpdatesQuery>;
export type GetFinancialUpdatesLazyQueryHookResult = ReturnType<typeof useGetFinancialUpdatesLazyQuery>;
export type GetFinancialUpdatesSuspenseQueryHookResult = ReturnType<typeof useGetFinancialUpdatesSuspenseQuery>;
export type GetFinancialUpdatesQueryResult = Apollo.QueryResult<GetFinancialUpdatesQuery, GetFinancialUpdatesQueryVariables>;
export const GetSurvivorshipUpdatesDocument = gql`
    query GetSurvivorshipUpdates {
  survivorshipUpdates {
    lateEffectsItems {
      id
      title
      maturityTier
      domains
      patientSummary
      publishedAt
    }
    ctdnaItems {
      id
      title
      maturityTier
      treatmentClasses
      patientSummary
      publishedAt
    }
    hasUpdates
  }
}
    `;

/**
 * __useGetSurvivorshipUpdatesQuery__
 *
 * To run a query within a React component, call `useGetSurvivorshipUpdatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSurvivorshipUpdatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSurvivorshipUpdatesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSurvivorshipUpdatesQuery(baseOptions?: Apollo.QueryHookOptions<GetSurvivorshipUpdatesQuery, GetSurvivorshipUpdatesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSurvivorshipUpdatesQuery, GetSurvivorshipUpdatesQueryVariables>(GetSurvivorshipUpdatesDocument, options);
      }
export function useGetSurvivorshipUpdatesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSurvivorshipUpdatesQuery, GetSurvivorshipUpdatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSurvivorshipUpdatesQuery, GetSurvivorshipUpdatesQueryVariables>(GetSurvivorshipUpdatesDocument, options);
        }
// @ts-ignore
export function useGetSurvivorshipUpdatesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSurvivorshipUpdatesQuery, GetSurvivorshipUpdatesQueryVariables>): Apollo.UseSuspenseQueryResult<GetSurvivorshipUpdatesQuery, GetSurvivorshipUpdatesQueryVariables>;
export function useGetSurvivorshipUpdatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSurvivorshipUpdatesQuery, GetSurvivorshipUpdatesQueryVariables>): Apollo.UseSuspenseQueryResult<GetSurvivorshipUpdatesQuery | undefined, GetSurvivorshipUpdatesQueryVariables>;
export function useGetSurvivorshipUpdatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSurvivorshipUpdatesQuery, GetSurvivorshipUpdatesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSurvivorshipUpdatesQuery, GetSurvivorshipUpdatesQueryVariables>(GetSurvivorshipUpdatesDocument, options);
        }
export type GetSurvivorshipUpdatesQueryHookResult = ReturnType<typeof useGetSurvivorshipUpdatesQuery>;
export type GetSurvivorshipUpdatesLazyQueryHookResult = ReturnType<typeof useGetSurvivorshipUpdatesLazyQuery>;
export type GetSurvivorshipUpdatesSuspenseQueryHookResult = ReturnType<typeof useGetSurvivorshipUpdatesSuspenseQuery>;
export type GetSurvivorshipUpdatesQueryResult = Apollo.QueryResult<GetSurvivorshipUpdatesQuery, GetSurvivorshipUpdatesQueryVariables>;
export const GenerateStandardOfCareDocument = gql`
    mutation GenerateStandardOfCare($subtype: String!) {
  generateStandardOfCare(subtype: $subtype) {
    subtype
    currentSOC
    whatsChanging
    whatsComing
    whatsBeingExplored
    generatedAt
  }
}
    `;
export type GenerateStandardOfCareMutationFn = Apollo.MutationFunction<GenerateStandardOfCareMutation, GenerateStandardOfCareMutationVariables>;

/**
 * __useGenerateStandardOfCareMutation__
 *
 * To run a mutation, you first call `useGenerateStandardOfCareMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateStandardOfCareMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateStandardOfCareMutation, { data, loading, error }] = useGenerateStandardOfCareMutation({
 *   variables: {
 *      subtype: // value for 'subtype'
 *   },
 * });
 */
export function useGenerateStandardOfCareMutation(baseOptions?: Apollo.MutationHookOptions<GenerateStandardOfCareMutation, GenerateStandardOfCareMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateStandardOfCareMutation, GenerateStandardOfCareMutationVariables>(GenerateStandardOfCareDocument, options);
      }
export type GenerateStandardOfCareMutationHookResult = ReturnType<typeof useGenerateStandardOfCareMutation>;
export type GenerateStandardOfCareMutationResult = Apollo.MutationResult<GenerateStandardOfCareMutation>;
export type GenerateStandardOfCareMutationOptions = Apollo.BaseMutationOptions<GenerateStandardOfCareMutation, GenerateStandardOfCareMutationVariables>;
export const GetArticleDocument = gql`
    query GetArticle($slug: String!) {
  article(slug: $slug) {
    id
    slug
    type
    title
    metaTitle
    metaDescription
    patientSummary
    keyTakeaways
    patientContent {
      heading
      body
    }
    clinicalContent {
      heading
      body
    }
    actionItems {
      text
      link
    }
    keyStatistics {
      label
      value
      source
    }
    references
    cancerTypes
    breastSubtypes
    biomarkers
    treatmentClasses
    journeyStages
    audienceLevel
    category
    primaryKeyword
    secondaryKeywords
    relatedArticleSlugs
    glossaryTerms
    viewCount
    publishedAt
    createdAt
  }
}
    `;

/**
 * __useGetArticleQuery__
 *
 * To run a query within a React component, call `useGetArticleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArticleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArticleQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetArticleQuery(baseOptions: Apollo.QueryHookOptions<GetArticleQuery, GetArticleQueryVariables> & ({ variables: GetArticleQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArticleQuery, GetArticleQueryVariables>(GetArticleDocument, options);
      }
export function useGetArticleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArticleQuery, GetArticleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArticleQuery, GetArticleQueryVariables>(GetArticleDocument, options);
        }
// @ts-ignore
export function useGetArticleSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetArticleQuery, GetArticleQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticleQuery, GetArticleQueryVariables>;
export function useGetArticleSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticleQuery, GetArticleQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticleQuery | undefined, GetArticleQueryVariables>;
export function useGetArticleSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticleQuery, GetArticleQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetArticleQuery, GetArticleQueryVariables>(GetArticleDocument, options);
        }
export type GetArticleQueryHookResult = ReturnType<typeof useGetArticleQuery>;
export type GetArticleLazyQueryHookResult = ReturnType<typeof useGetArticleLazyQuery>;
export type GetArticleSuspenseQueryHookResult = ReturnType<typeof useGetArticleSuspenseQuery>;
export type GetArticleQueryResult = Apollo.QueryResult<GetArticleQuery, GetArticleQueryVariables>;
export const GetArticlesDocument = gql`
    query GetArticles($filters: ArticleFilters) {
  articles(filters: $filters) {
    id
    slug
    type
    title
    patientSummary
    keyTakeaways
    cancerTypes
    breastSubtypes
    journeyStages
    audienceLevel
    category
    viewCount
    publishedAt
  }
}
    `;

/**
 * __useGetArticlesQuery__
 *
 * To run a query within a React component, call `useGetArticlesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArticlesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArticlesQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetArticlesQuery(baseOptions?: Apollo.QueryHookOptions<GetArticlesQuery, GetArticlesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArticlesQuery, GetArticlesQueryVariables>(GetArticlesDocument, options);
      }
export function useGetArticlesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArticlesQuery, GetArticlesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArticlesQuery, GetArticlesQueryVariables>(GetArticlesDocument, options);
        }
// @ts-ignore
export function useGetArticlesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetArticlesQuery, GetArticlesQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticlesQuery, GetArticlesQueryVariables>;
export function useGetArticlesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticlesQuery, GetArticlesQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticlesQuery | undefined, GetArticlesQueryVariables>;
export function useGetArticlesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticlesQuery, GetArticlesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetArticlesQuery, GetArticlesQueryVariables>(GetArticlesDocument, options);
        }
export type GetArticlesQueryHookResult = ReturnType<typeof useGetArticlesQuery>;
export type GetArticlesLazyQueryHookResult = ReturnType<typeof useGetArticlesLazyQuery>;
export type GetArticlesSuspenseQueryHookResult = ReturnType<typeof useGetArticlesSuspenseQuery>;
export type GetArticlesQueryResult = Apollo.QueryResult<GetArticlesQuery, GetArticlesQueryVariables>;
export const GetArticlesByCategoryDocument = gql`
    query GetArticlesByCategory($category: String!) {
  articlesByCategory(category: $category) {
    label
    description
    articles {
      id
      slug
      type
      title
      patientSummary
      keyTakeaways
      journeyStages
      audienceLevel
      viewCount
      publishedAt
    }
  }
}
    `;

/**
 * __useGetArticlesByCategoryQuery__
 *
 * To run a query within a React component, call `useGetArticlesByCategoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArticlesByCategoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArticlesByCategoryQuery({
 *   variables: {
 *      category: // value for 'category'
 *   },
 * });
 */
export function useGetArticlesByCategoryQuery(baseOptions: Apollo.QueryHookOptions<GetArticlesByCategoryQuery, GetArticlesByCategoryQueryVariables> & ({ variables: GetArticlesByCategoryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArticlesByCategoryQuery, GetArticlesByCategoryQueryVariables>(GetArticlesByCategoryDocument, options);
      }
export function useGetArticlesByCategoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArticlesByCategoryQuery, GetArticlesByCategoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArticlesByCategoryQuery, GetArticlesByCategoryQueryVariables>(GetArticlesByCategoryDocument, options);
        }
// @ts-ignore
export function useGetArticlesByCategorySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetArticlesByCategoryQuery, GetArticlesByCategoryQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticlesByCategoryQuery, GetArticlesByCategoryQueryVariables>;
export function useGetArticlesByCategorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticlesByCategoryQuery, GetArticlesByCategoryQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticlesByCategoryQuery | undefined, GetArticlesByCategoryQueryVariables>;
export function useGetArticlesByCategorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticlesByCategoryQuery, GetArticlesByCategoryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetArticlesByCategoryQuery, GetArticlesByCategoryQueryVariables>(GetArticlesByCategoryDocument, options);
        }
export type GetArticlesByCategoryQueryHookResult = ReturnType<typeof useGetArticlesByCategoryQuery>;
export type GetArticlesByCategoryLazyQueryHookResult = ReturnType<typeof useGetArticlesByCategoryLazyQuery>;
export type GetArticlesByCategorySuspenseQueryHookResult = ReturnType<typeof useGetArticlesByCategorySuspenseQuery>;
export type GetArticlesByCategoryQueryResult = Apollo.QueryResult<GetArticlesByCategoryQuery, GetArticlesByCategoryQueryVariables>;
export const SearchArticlesDocument = gql`
    query SearchArticles($query: String!, $filters: ArticleFilters) {
  searchArticles(query: $query, filters: $filters) {
    id
    slug
    type
    title
    patientSummary
    category
    publishedAt
  }
}
    `;

/**
 * __useSearchArticlesQuery__
 *
 * To run a query within a React component, call `useSearchArticlesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchArticlesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchArticlesQuery({
 *   variables: {
 *      query: // value for 'query'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useSearchArticlesQuery(baseOptions: Apollo.QueryHookOptions<SearchArticlesQuery, SearchArticlesQueryVariables> & ({ variables: SearchArticlesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchArticlesQuery, SearchArticlesQueryVariables>(SearchArticlesDocument, options);
      }
export function useSearchArticlesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchArticlesQuery, SearchArticlesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchArticlesQuery, SearchArticlesQueryVariables>(SearchArticlesDocument, options);
        }
// @ts-ignore
export function useSearchArticlesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SearchArticlesQuery, SearchArticlesQueryVariables>): Apollo.UseSuspenseQueryResult<SearchArticlesQuery, SearchArticlesQueryVariables>;
export function useSearchArticlesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchArticlesQuery, SearchArticlesQueryVariables>): Apollo.UseSuspenseQueryResult<SearchArticlesQuery | undefined, SearchArticlesQueryVariables>;
export function useSearchArticlesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchArticlesQuery, SearchArticlesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchArticlesQuery, SearchArticlesQueryVariables>(SearchArticlesDocument, options);
        }
export type SearchArticlesQueryHookResult = ReturnType<typeof useSearchArticlesQuery>;
export type SearchArticlesLazyQueryHookResult = ReturnType<typeof useSearchArticlesLazyQuery>;
export type SearchArticlesSuspenseQueryHookResult = ReturnType<typeof useSearchArticlesSuspenseQuery>;
export type SearchArticlesQueryResult = Apollo.QueryResult<SearchArticlesQuery, SearchArticlesQueryVariables>;
export const GetGlossaryTermsDocument = gql`
    query GetGlossaryTerms($category: String) {
  glossaryTerms(category: $category) {
    id
    term
    slug
    shortDefinition
    fullDefinition
    fullArticleSlug
    aliases
    category
  }
}
    `;

/**
 * __useGetGlossaryTermsQuery__
 *
 * To run a query within a React component, call `useGetGlossaryTermsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlossaryTermsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlossaryTermsQuery({
 *   variables: {
 *      category: // value for 'category'
 *   },
 * });
 */
export function useGetGlossaryTermsQuery(baseOptions?: Apollo.QueryHookOptions<GetGlossaryTermsQuery, GetGlossaryTermsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGlossaryTermsQuery, GetGlossaryTermsQueryVariables>(GetGlossaryTermsDocument, options);
      }
export function useGetGlossaryTermsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGlossaryTermsQuery, GetGlossaryTermsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGlossaryTermsQuery, GetGlossaryTermsQueryVariables>(GetGlossaryTermsDocument, options);
        }
// @ts-ignore
export function useGetGlossaryTermsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetGlossaryTermsQuery, GetGlossaryTermsQueryVariables>): Apollo.UseSuspenseQueryResult<GetGlossaryTermsQuery, GetGlossaryTermsQueryVariables>;
export function useGetGlossaryTermsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGlossaryTermsQuery, GetGlossaryTermsQueryVariables>): Apollo.UseSuspenseQueryResult<GetGlossaryTermsQuery | undefined, GetGlossaryTermsQueryVariables>;
export function useGetGlossaryTermsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGlossaryTermsQuery, GetGlossaryTermsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGlossaryTermsQuery, GetGlossaryTermsQueryVariables>(GetGlossaryTermsDocument, options);
        }
export type GetGlossaryTermsQueryHookResult = ReturnType<typeof useGetGlossaryTermsQuery>;
export type GetGlossaryTermsLazyQueryHookResult = ReturnType<typeof useGetGlossaryTermsLazyQuery>;
export type GetGlossaryTermsSuspenseQueryHookResult = ReturnType<typeof useGetGlossaryTermsSuspenseQuery>;
export type GetGlossaryTermsQueryResult = Apollo.QueryResult<GetGlossaryTermsQuery, GetGlossaryTermsQueryVariables>;
export const GetGlossaryTermDocument = gql`
    query GetGlossaryTerm($slug: String!) {
  glossaryTerm(slug: $slug) {
    id
    term
    slug
    shortDefinition
    fullDefinition
    fullArticleSlug
    aliases
    category
  }
}
    `;

/**
 * __useGetGlossaryTermQuery__
 *
 * To run a query within a React component, call `useGetGlossaryTermQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlossaryTermQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlossaryTermQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetGlossaryTermQuery(baseOptions: Apollo.QueryHookOptions<GetGlossaryTermQuery, GetGlossaryTermQueryVariables> & ({ variables: GetGlossaryTermQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGlossaryTermQuery, GetGlossaryTermQueryVariables>(GetGlossaryTermDocument, options);
      }
export function useGetGlossaryTermLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGlossaryTermQuery, GetGlossaryTermQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGlossaryTermQuery, GetGlossaryTermQueryVariables>(GetGlossaryTermDocument, options);
        }
// @ts-ignore
export function useGetGlossaryTermSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetGlossaryTermQuery, GetGlossaryTermQueryVariables>): Apollo.UseSuspenseQueryResult<GetGlossaryTermQuery, GetGlossaryTermQueryVariables>;
export function useGetGlossaryTermSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGlossaryTermQuery, GetGlossaryTermQueryVariables>): Apollo.UseSuspenseQueryResult<GetGlossaryTermQuery | undefined, GetGlossaryTermQueryVariables>;
export function useGetGlossaryTermSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGlossaryTermQuery, GetGlossaryTermQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGlossaryTermQuery, GetGlossaryTermQueryVariables>(GetGlossaryTermDocument, options);
        }
export type GetGlossaryTermQueryHookResult = ReturnType<typeof useGetGlossaryTermQuery>;
export type GetGlossaryTermLazyQueryHookResult = ReturnType<typeof useGetGlossaryTermLazyQuery>;
export type GetGlossaryTermSuspenseQueryHookResult = ReturnType<typeof useGetGlossaryTermSuspenseQuery>;
export type GetGlossaryTermQueryResult = Apollo.QueryResult<GetGlossaryTermQuery, GetGlossaryTermQueryVariables>;
export const GetReadingPlanDocument = gql`
    query GetReadingPlan {
  readingPlan {
    readNow {
      articleSlug
      articleTitle
      reason
      priority
    }
    readSoon {
      articleSlug
      articleTitle
      reason
      priority
    }
    whenReady {
      articleSlug
      articleTitle
      reason
      priority
    }
  }
}
    `;

/**
 * __useGetReadingPlanQuery__
 *
 * To run a query within a React component, call `useGetReadingPlanQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetReadingPlanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetReadingPlanQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetReadingPlanQuery(baseOptions?: Apollo.QueryHookOptions<GetReadingPlanQuery, GetReadingPlanQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetReadingPlanQuery, GetReadingPlanQueryVariables>(GetReadingPlanDocument, options);
      }
export function useGetReadingPlanLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetReadingPlanQuery, GetReadingPlanQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetReadingPlanQuery, GetReadingPlanQueryVariables>(GetReadingPlanDocument, options);
        }
// @ts-ignore
export function useGetReadingPlanSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetReadingPlanQuery, GetReadingPlanQueryVariables>): Apollo.UseSuspenseQueryResult<GetReadingPlanQuery, GetReadingPlanQueryVariables>;
export function useGetReadingPlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetReadingPlanQuery, GetReadingPlanQueryVariables>): Apollo.UseSuspenseQueryResult<GetReadingPlanQuery | undefined, GetReadingPlanQueryVariables>;
export function useGetReadingPlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetReadingPlanQuery, GetReadingPlanQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetReadingPlanQuery, GetReadingPlanQueryVariables>(GetReadingPlanDocument, options);
        }
export type GetReadingPlanQueryHookResult = ReturnType<typeof useGetReadingPlanQuery>;
export type GetReadingPlanLazyQueryHookResult = ReturnType<typeof useGetReadingPlanLazyQuery>;
export type GetReadingPlanSuspenseQueryHookResult = ReturnType<typeof useGetReadingPlanSuspenseQuery>;
export type GetReadingPlanQueryResult = Apollo.QueryResult<GetReadingPlanQuery, GetReadingPlanQueryVariables>;
export const GetArticlesAdminDocument = gql`
    query GetArticlesAdmin($filters: ArticleAdminFilters) {
  articlesAdmin(filters: $filters) {
    id
    slug
    type
    title
    patientSummary
    category
    status
    viewCount
    publishedAt
    createdAt
  }
}
    `;

/**
 * __useGetArticlesAdminQuery__
 *
 * To run a query within a React component, call `useGetArticlesAdminQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArticlesAdminQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArticlesAdminQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetArticlesAdminQuery(baseOptions?: Apollo.QueryHookOptions<GetArticlesAdminQuery, GetArticlesAdminQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArticlesAdminQuery, GetArticlesAdminQueryVariables>(GetArticlesAdminDocument, options);
      }
export function useGetArticlesAdminLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArticlesAdminQuery, GetArticlesAdminQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArticlesAdminQuery, GetArticlesAdminQueryVariables>(GetArticlesAdminDocument, options);
        }
// @ts-ignore
export function useGetArticlesAdminSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetArticlesAdminQuery, GetArticlesAdminQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticlesAdminQuery, GetArticlesAdminQueryVariables>;
export function useGetArticlesAdminSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticlesAdminQuery, GetArticlesAdminQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticlesAdminQuery | undefined, GetArticlesAdminQueryVariables>;
export function useGetArticlesAdminSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticlesAdminQuery, GetArticlesAdminQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetArticlesAdminQuery, GetArticlesAdminQueryVariables>(GetArticlesAdminDocument, options);
        }
export type GetArticlesAdminQueryHookResult = ReturnType<typeof useGetArticlesAdminQuery>;
export type GetArticlesAdminLazyQueryHookResult = ReturnType<typeof useGetArticlesAdminLazyQuery>;
export type GetArticlesAdminSuspenseQueryHookResult = ReturnType<typeof useGetArticlesAdminSuspenseQuery>;
export type GetArticlesAdminQueryResult = Apollo.QueryResult<GetArticlesAdminQuery, GetArticlesAdminQueryVariables>;
export const GenerateArticleDocument = gql`
    mutation GenerateArticle($input: GenerateArticleInput!) {
  generateArticle(input: $input) {
    id
    slug
    title
    status
    category
    createdAt
  }
}
    `;
export type GenerateArticleMutationFn = Apollo.MutationFunction<GenerateArticleMutation, GenerateArticleMutationVariables>;

/**
 * __useGenerateArticleMutation__
 *
 * To run a mutation, you first call `useGenerateArticleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateArticleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateArticleMutation, { data, loading, error }] = useGenerateArticleMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGenerateArticleMutation(baseOptions?: Apollo.MutationHookOptions<GenerateArticleMutation, GenerateArticleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateArticleMutation, GenerateArticleMutationVariables>(GenerateArticleDocument, options);
      }
export type GenerateArticleMutationHookResult = ReturnType<typeof useGenerateArticleMutation>;
export type GenerateArticleMutationResult = Apollo.MutationResult<GenerateArticleMutation>;
export type GenerateArticleMutationOptions = Apollo.BaseMutationOptions<GenerateArticleMutation, GenerateArticleMutationVariables>;
export const PublishArticleDocument = gql`
    mutation PublishArticle($articleId: String!) {
  publishArticle(articleId: $articleId) {
    id
    slug
    status
    publishedAt
  }
}
    `;
export type PublishArticleMutationFn = Apollo.MutationFunction<PublishArticleMutation, PublishArticleMutationVariables>;

/**
 * __usePublishArticleMutation__
 *
 * To run a mutation, you first call `usePublishArticleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishArticleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishArticleMutation, { data, loading, error }] = usePublishArticleMutation({
 *   variables: {
 *      articleId: // value for 'articleId'
 *   },
 * });
 */
export function usePublishArticleMutation(baseOptions?: Apollo.MutationHookOptions<PublishArticleMutation, PublishArticleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PublishArticleMutation, PublishArticleMutationVariables>(PublishArticleDocument, options);
      }
export type PublishArticleMutationHookResult = ReturnType<typeof usePublishArticleMutation>;
export type PublishArticleMutationResult = Apollo.MutationResult<PublishArticleMutation>;
export type PublishArticleMutationOptions = Apollo.BaseMutationOptions<PublishArticleMutation, PublishArticleMutationVariables>;
export const GeneratePersonalizedContextDocument = gql`
    mutation GeneratePersonalizedContext($slug: String!) {
  generatePersonalizedContext(slug: $slug) {
    content
    generatedAt
  }
}
    `;
export type GeneratePersonalizedContextMutationFn = Apollo.MutationFunction<GeneratePersonalizedContextMutation, GeneratePersonalizedContextMutationVariables>;

/**
 * __useGeneratePersonalizedContextMutation__
 *
 * To run a mutation, you first call `useGeneratePersonalizedContextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGeneratePersonalizedContextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generatePersonalizedContextMutation, { data, loading, error }] = useGeneratePersonalizedContextMutation({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGeneratePersonalizedContextMutation(baseOptions?: Apollo.MutationHookOptions<GeneratePersonalizedContextMutation, GeneratePersonalizedContextMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GeneratePersonalizedContextMutation, GeneratePersonalizedContextMutationVariables>(GeneratePersonalizedContextDocument, options);
      }
export type GeneratePersonalizedContextMutationHookResult = ReturnType<typeof useGeneratePersonalizedContextMutation>;
export type GeneratePersonalizedContextMutationResult = Apollo.MutationResult<GeneratePersonalizedContextMutation>;
export type GeneratePersonalizedContextMutationOptions = Apollo.BaseMutationOptions<GeneratePersonalizedContextMutation, GeneratePersonalizedContextMutationVariables>;
export const GenerateReadingPlanDocument = gql`
    mutation GenerateReadingPlan {
  generateReadingPlan {
    readNow {
      articleSlug
      articleTitle
      reason
      priority
    }
    readSoon {
      articleSlug
      articleTitle
      reason
      priority
    }
    whenReady {
      articleSlug
      articleTitle
      reason
      priority
    }
  }
}
    `;
export type GenerateReadingPlanMutationFn = Apollo.MutationFunction<GenerateReadingPlanMutation, GenerateReadingPlanMutationVariables>;

/**
 * __useGenerateReadingPlanMutation__
 *
 * To run a mutation, you first call `useGenerateReadingPlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateReadingPlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateReadingPlanMutation, { data, loading, error }] = useGenerateReadingPlanMutation({
 *   variables: {
 *   },
 * });
 */
export function useGenerateReadingPlanMutation(baseOptions?: Apollo.MutationHookOptions<GenerateReadingPlanMutation, GenerateReadingPlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateReadingPlanMutation, GenerateReadingPlanMutationVariables>(GenerateReadingPlanDocument, options);
      }
export type GenerateReadingPlanMutationHookResult = ReturnType<typeof useGenerateReadingPlanMutation>;
export type GenerateReadingPlanMutationResult = Apollo.MutationResult<GenerateReadingPlanMutation>;
export type GenerateReadingPlanMutationOptions = Apollo.BaseMutationOptions<GenerateReadingPlanMutation, GenerateReadingPlanMutationVariables>;
export const UpdateArticleStatusDocument = gql`
    mutation UpdateArticleStatus($articleId: String!, $status: String!, $notes: String) {
  updateArticleStatus(articleId: $articleId, status: $status, notes: $notes) {
    id
    slug
    status
    publishedAt
  }
}
    `;
export type UpdateArticleStatusMutationFn = Apollo.MutationFunction<UpdateArticleStatusMutation, UpdateArticleStatusMutationVariables>;

/**
 * __useUpdateArticleStatusMutation__
 *
 * To run a mutation, you first call `useUpdateArticleStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateArticleStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateArticleStatusMutation, { data, loading, error }] = useUpdateArticleStatusMutation({
 *   variables: {
 *      articleId: // value for 'articleId'
 *      status: // value for 'status'
 *      notes: // value for 'notes'
 *   },
 * });
 */
export function useUpdateArticleStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateArticleStatusMutation, UpdateArticleStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateArticleStatusMutation, UpdateArticleStatusMutationVariables>(UpdateArticleStatusDocument, options);
      }
export type UpdateArticleStatusMutationHookResult = ReturnType<typeof useUpdateArticleStatusMutation>;
export type UpdateArticleStatusMutationResult = Apollo.MutationResult<UpdateArticleStatusMutation>;
export type UpdateArticleStatusMutationOptions = Apollo.BaseMutationOptions<UpdateArticleStatusMutation, UpdateArticleStatusMutationVariables>;
export const CheckArticleQualityDocument = gql`
    mutation CheckArticleQuality($articleId: String!) {
  checkArticleQuality(articleId: $articleId) {
    issues {
      type
      severity
      description
      section
    }
    score
    checkedAt
  }
}
    `;
export type CheckArticleQualityMutationFn = Apollo.MutationFunction<CheckArticleQualityMutation, CheckArticleQualityMutationVariables>;

/**
 * __useCheckArticleQualityMutation__
 *
 * To run a mutation, you first call `useCheckArticleQualityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCheckArticleQualityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [checkArticleQualityMutation, { data, loading, error }] = useCheckArticleQualityMutation({
 *   variables: {
 *      articleId: // value for 'articleId'
 *   },
 * });
 */
export function useCheckArticleQualityMutation(baseOptions?: Apollo.MutationHookOptions<CheckArticleQualityMutation, CheckArticleQualityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CheckArticleQualityMutation, CheckArticleQualityMutationVariables>(CheckArticleQualityDocument, options);
      }
export type CheckArticleQualityMutationHookResult = ReturnType<typeof useCheckArticleQualityMutation>;
export type CheckArticleQualityMutationResult = Apollo.MutationResult<CheckArticleQualityMutation>;
export type CheckArticleQualityMutationOptions = Apollo.BaseMutationOptions<CheckArticleQualityMutation, CheckArticleQualityMutationVariables>;
export const RunArticleQualityChecksDocument = gql`
    mutation RunArticleQualityChecks {
  runArticleQualityChecks
}
    `;
export type RunArticleQualityChecksMutationFn = Apollo.MutationFunction<RunArticleQualityChecksMutation, RunArticleQualityChecksMutationVariables>;

/**
 * __useRunArticleQualityChecksMutation__
 *
 * To run a mutation, you first call `useRunArticleQualityChecksMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRunArticleQualityChecksMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [runArticleQualityChecksMutation, { data, loading, error }] = useRunArticleQualityChecksMutation({
 *   variables: {
 *   },
 * });
 */
export function useRunArticleQualityChecksMutation(baseOptions?: Apollo.MutationHookOptions<RunArticleQualityChecksMutation, RunArticleQualityChecksMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RunArticleQualityChecksMutation, RunArticleQualityChecksMutationVariables>(RunArticleQualityChecksDocument, options);
      }
export type RunArticleQualityChecksMutationHookResult = ReturnType<typeof useRunArticleQualityChecksMutation>;
export type RunArticleQualityChecksMutationResult = Apollo.MutationResult<RunArticleQualityChecksMutation>;
export type RunArticleQualityChecksMutationOptions = Apollo.BaseMutationOptions<RunArticleQualityChecksMutation, RunArticleQualityChecksMutationVariables>;
export const InsertPlatformLinksDocument = gql`
    mutation InsertPlatformLinks($articleId: String!) {
  insertPlatformLinks(articleId: $articleId) {
    id
    slug
    actionItems {
      text
      link
    }
  }
}
    `;
export type InsertPlatformLinksMutationFn = Apollo.MutationFunction<InsertPlatformLinksMutation, InsertPlatformLinksMutationVariables>;

/**
 * __useInsertPlatformLinksMutation__
 *
 * To run a mutation, you first call `useInsertPlatformLinksMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertPlatformLinksMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertPlatformLinksMutation, { data, loading, error }] = useInsertPlatformLinksMutation({
 *   variables: {
 *      articleId: // value for 'articleId'
 *   },
 * });
 */
export function useInsertPlatformLinksMutation(baseOptions?: Apollo.MutationHookOptions<InsertPlatformLinksMutation, InsertPlatformLinksMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertPlatformLinksMutation, InsertPlatformLinksMutationVariables>(InsertPlatformLinksDocument, options);
      }
export type InsertPlatformLinksMutationHookResult = ReturnType<typeof useInsertPlatformLinksMutation>;
export type InsertPlatformLinksMutationResult = Apollo.MutationResult<InsertPlatformLinksMutation>;
export type InsertPlatformLinksMutationOptions = Apollo.BaseMutationOptions<InsertPlatformLinksMutation, InsertPlatformLinksMutationVariables>;
export const GetRelatedResearchDocument = gql`
    query GetRelatedResearch($slug: String!, $limit: Int) {
  relatedResearch(slug: $slug, limit: $limit) {
    id
    title
    maturityTier
    patientSummary
    publishedAt
    sourceType
    practiceImpact
  }
}
    `;

/**
 * __useGetRelatedResearchQuery__
 *
 * To run a query within a React component, call `useGetRelatedResearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRelatedResearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRelatedResearchQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetRelatedResearchQuery(baseOptions: Apollo.QueryHookOptions<GetRelatedResearchQuery, GetRelatedResearchQueryVariables> & ({ variables: GetRelatedResearchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRelatedResearchQuery, GetRelatedResearchQueryVariables>(GetRelatedResearchDocument, options);
      }
export function useGetRelatedResearchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRelatedResearchQuery, GetRelatedResearchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRelatedResearchQuery, GetRelatedResearchQueryVariables>(GetRelatedResearchDocument, options);
        }
// @ts-ignore
export function useGetRelatedResearchSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRelatedResearchQuery, GetRelatedResearchQueryVariables>): Apollo.UseSuspenseQueryResult<GetRelatedResearchQuery, GetRelatedResearchQueryVariables>;
export function useGetRelatedResearchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRelatedResearchQuery, GetRelatedResearchQueryVariables>): Apollo.UseSuspenseQueryResult<GetRelatedResearchQuery | undefined, GetRelatedResearchQueryVariables>;
export function useGetRelatedResearchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRelatedResearchQuery, GetRelatedResearchQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRelatedResearchQuery, GetRelatedResearchQueryVariables>(GetRelatedResearchDocument, options);
        }
export type GetRelatedResearchQueryHookResult = ReturnType<typeof useGetRelatedResearchQuery>;
export type GetRelatedResearchLazyQueryHookResult = ReturnType<typeof useGetRelatedResearchLazyQuery>;
export type GetRelatedResearchSuspenseQueryHookResult = ReturnType<typeof useGetRelatedResearchSuspenseQuery>;
export type GetRelatedResearchQueryResult = Apollo.QueryResult<GetRelatedResearchQuery, GetRelatedResearchQueryVariables>;
export const GetArticlesForResearchItemDocument = gql`
    query GetArticlesForResearchItem($itemId: String!, $limit: Int) {
  articlesForResearchItem(itemId: $itemId, limit: $limit) {
    slug
    title
    category
    patientSummary
    viewCount
  }
}
    `;

/**
 * __useGetArticlesForResearchItemQuery__
 *
 * To run a query within a React component, call `useGetArticlesForResearchItemQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArticlesForResearchItemQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArticlesForResearchItemQuery({
 *   variables: {
 *      itemId: // value for 'itemId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetArticlesForResearchItemQuery(baseOptions: Apollo.QueryHookOptions<GetArticlesForResearchItemQuery, GetArticlesForResearchItemQueryVariables> & ({ variables: GetArticlesForResearchItemQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArticlesForResearchItemQuery, GetArticlesForResearchItemQueryVariables>(GetArticlesForResearchItemDocument, options);
      }
export function useGetArticlesForResearchItemLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArticlesForResearchItemQuery, GetArticlesForResearchItemQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArticlesForResearchItemQuery, GetArticlesForResearchItemQueryVariables>(GetArticlesForResearchItemDocument, options);
        }
// @ts-ignore
export function useGetArticlesForResearchItemSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetArticlesForResearchItemQuery, GetArticlesForResearchItemQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticlesForResearchItemQuery, GetArticlesForResearchItemQueryVariables>;
export function useGetArticlesForResearchItemSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticlesForResearchItemQuery, GetArticlesForResearchItemQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticlesForResearchItemQuery | undefined, GetArticlesForResearchItemQueryVariables>;
export function useGetArticlesForResearchItemSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticlesForResearchItemQuery, GetArticlesForResearchItemQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetArticlesForResearchItemQuery, GetArticlesForResearchItemQueryVariables>(GetArticlesForResearchItemDocument, options);
        }
export type GetArticlesForResearchItemQueryHookResult = ReturnType<typeof useGetArticlesForResearchItemQuery>;
export type GetArticlesForResearchItemLazyQueryHookResult = ReturnType<typeof useGetArticlesForResearchItemLazyQuery>;
export type GetArticlesForResearchItemSuspenseQueryHookResult = ReturnType<typeof useGetArticlesForResearchItemSuspenseQuery>;
export type GetArticlesForResearchItemQueryResult = Apollo.QueryResult<GetArticlesForResearchItemQuery, GetArticlesForResearchItemQueryVariables>;
export const GetArticleRefreshStatusDocument = gql`
    query GetArticleRefreshStatus($articleId: String!) {
  articleRefreshStatus(articleId: $articleId) {
    needsRefresh
    urgency
    triggers {
      id
      title
      maturityTier
      practiceImpact
      publishedAt
    }
    suggestion {
      sectionsToUpdate
      newDataToIncorporate
      referencesToAdd
      summary
    }
  }
}
    `;

/**
 * __useGetArticleRefreshStatusQuery__
 *
 * To run a query within a React component, call `useGetArticleRefreshStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArticleRefreshStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArticleRefreshStatusQuery({
 *   variables: {
 *      articleId: // value for 'articleId'
 *   },
 * });
 */
export function useGetArticleRefreshStatusQuery(baseOptions: Apollo.QueryHookOptions<GetArticleRefreshStatusQuery, GetArticleRefreshStatusQueryVariables> & ({ variables: GetArticleRefreshStatusQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArticleRefreshStatusQuery, GetArticleRefreshStatusQueryVariables>(GetArticleRefreshStatusDocument, options);
      }
export function useGetArticleRefreshStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArticleRefreshStatusQuery, GetArticleRefreshStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArticleRefreshStatusQuery, GetArticleRefreshStatusQueryVariables>(GetArticleRefreshStatusDocument, options);
        }
// @ts-ignore
export function useGetArticleRefreshStatusSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetArticleRefreshStatusQuery, GetArticleRefreshStatusQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticleRefreshStatusQuery, GetArticleRefreshStatusQueryVariables>;
export function useGetArticleRefreshStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticleRefreshStatusQuery, GetArticleRefreshStatusQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticleRefreshStatusQuery | undefined, GetArticleRefreshStatusQueryVariables>;
export function useGetArticleRefreshStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticleRefreshStatusQuery, GetArticleRefreshStatusQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetArticleRefreshStatusQuery, GetArticleRefreshStatusQueryVariables>(GetArticleRefreshStatusDocument, options);
        }
export type GetArticleRefreshStatusQueryHookResult = ReturnType<typeof useGetArticleRefreshStatusQuery>;
export type GetArticleRefreshStatusLazyQueryHookResult = ReturnType<typeof useGetArticleRefreshStatusLazyQuery>;
export type GetArticleRefreshStatusSuspenseQueryHookResult = ReturnType<typeof useGetArticleRefreshStatusSuspenseQuery>;
export type GetArticleRefreshStatusQueryResult = Apollo.QueryResult<GetArticleRefreshStatusQuery, GetArticleRefreshStatusQueryVariables>;
export const GetArticleEngagementDocument = gql`
    query GetArticleEngagement {
  articleEngagement {
    id
    slug
    title
    category
    viewCount
    publishedAt
  }
}
    `;

/**
 * __useGetArticleEngagementQuery__
 *
 * To run a query within a React component, call `useGetArticleEngagementQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetArticleEngagementQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetArticleEngagementQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetArticleEngagementQuery(baseOptions?: Apollo.QueryHookOptions<GetArticleEngagementQuery, GetArticleEngagementQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetArticleEngagementQuery, GetArticleEngagementQueryVariables>(GetArticleEngagementDocument, options);
      }
export function useGetArticleEngagementLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetArticleEngagementQuery, GetArticleEngagementQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetArticleEngagementQuery, GetArticleEngagementQueryVariables>(GetArticleEngagementDocument, options);
        }
// @ts-ignore
export function useGetArticleEngagementSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetArticleEngagementQuery, GetArticleEngagementQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticleEngagementQuery, GetArticleEngagementQueryVariables>;
export function useGetArticleEngagementSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticleEngagementQuery, GetArticleEngagementQueryVariables>): Apollo.UseSuspenseQueryResult<GetArticleEngagementQuery | undefined, GetArticleEngagementQueryVariables>;
export function useGetArticleEngagementSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetArticleEngagementQuery, GetArticleEngagementQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetArticleEngagementQuery, GetArticleEngagementQueryVariables>(GetArticleEngagementDocument, options);
        }
export type GetArticleEngagementQueryHookResult = ReturnType<typeof useGetArticleEngagementQuery>;
export type GetArticleEngagementLazyQueryHookResult = ReturnType<typeof useGetArticleEngagementLazyQuery>;
export type GetArticleEngagementSuspenseQueryHookResult = ReturnType<typeof useGetArticleEngagementSuspenseQuery>;
export type GetArticleEngagementQueryResult = Apollo.QueryResult<GetArticleEngagementQuery, GetArticleEngagementQueryVariables>;
export const GenerateRefreshSuggestionDocument = gql`
    mutation GenerateRefreshSuggestion($articleId: String!, $triggerItemIds: [String!]!) {
  generateRefreshSuggestion(
    articleId: $articleId
    triggerItemIds: $triggerItemIds
  ) {
    sectionsToUpdate
    newDataToIncorporate
    referencesToAdd
    summary
  }
}
    `;
export type GenerateRefreshSuggestionMutationFn = Apollo.MutationFunction<GenerateRefreshSuggestionMutation, GenerateRefreshSuggestionMutationVariables>;

/**
 * __useGenerateRefreshSuggestionMutation__
 *
 * To run a mutation, you first call `useGenerateRefreshSuggestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateRefreshSuggestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateRefreshSuggestionMutation, { data, loading, error }] = useGenerateRefreshSuggestionMutation({
 *   variables: {
 *      articleId: // value for 'articleId'
 *      triggerItemIds: // value for 'triggerItemIds'
 *   },
 * });
 */
export function useGenerateRefreshSuggestionMutation(baseOptions?: Apollo.MutationHookOptions<GenerateRefreshSuggestionMutation, GenerateRefreshSuggestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateRefreshSuggestionMutation, GenerateRefreshSuggestionMutationVariables>(GenerateRefreshSuggestionDocument, options);
      }
export type GenerateRefreshSuggestionMutationHookResult = ReturnType<typeof useGenerateRefreshSuggestionMutation>;
export type GenerateRefreshSuggestionMutationResult = Apollo.MutationResult<GenerateRefreshSuggestionMutation>;
export type GenerateRefreshSuggestionMutationOptions = Apollo.BaseMutationOptions<GenerateRefreshSuggestionMutation, GenerateRefreshSuggestionMutationVariables>;
export const RunRefreshCheckCycleDocument = gql`
    mutation RunRefreshCheckCycle {
  runRefreshCheckCycle
}
    `;
export type RunRefreshCheckCycleMutationFn = Apollo.MutationFunction<RunRefreshCheckCycleMutation, RunRefreshCheckCycleMutationVariables>;

/**
 * __useRunRefreshCheckCycleMutation__
 *
 * To run a mutation, you first call `useRunRefreshCheckCycleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRunRefreshCheckCycleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [runRefreshCheckCycleMutation, { data, loading, error }] = useRunRefreshCheckCycleMutation({
 *   variables: {
 *   },
 * });
 */
export function useRunRefreshCheckCycleMutation(baseOptions?: Apollo.MutationHookOptions<RunRefreshCheckCycleMutation, RunRefreshCheckCycleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RunRefreshCheckCycleMutation, RunRefreshCheckCycleMutationVariables>(RunRefreshCheckCycleDocument, options);
      }
export type RunRefreshCheckCycleMutationHookResult = ReturnType<typeof useRunRefreshCheckCycleMutation>;
export type RunRefreshCheckCycleMutationResult = Apollo.MutationResult<RunRefreshCheckCycleMutation>;
export type RunRefreshCheckCycleMutationOptions = Apollo.BaseMutationOptions<RunRefreshCheckCycleMutation, RunRefreshCheckCycleMutationVariables>;
export const GetTrialLogisticsAssessmentDocument = gql`
    query GetTrialLogisticsAssessment($matchId: String!) {
  trialLogisticsAssessment(matchId: $matchId) {
    id
    patientId
    matchId
    siteId
    distanceMiles
    estimatedCosts
    matchedPrograms
    estimatedOutOfPocket
    feasibilityScore
    barriers
    logisticsPlan
    logisticsPlanGeneratedAt
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetTrialLogisticsAssessmentQuery__
 *
 * To run a query within a React component, call `useGetTrialLogisticsAssessmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTrialLogisticsAssessmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTrialLogisticsAssessmentQuery({
 *   variables: {
 *      matchId: // value for 'matchId'
 *   },
 * });
 */
export function useGetTrialLogisticsAssessmentQuery(baseOptions: Apollo.QueryHookOptions<GetTrialLogisticsAssessmentQuery, GetTrialLogisticsAssessmentQueryVariables> & ({ variables: GetTrialLogisticsAssessmentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTrialLogisticsAssessmentQuery, GetTrialLogisticsAssessmentQueryVariables>(GetTrialLogisticsAssessmentDocument, options);
      }
export function useGetTrialLogisticsAssessmentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTrialLogisticsAssessmentQuery, GetTrialLogisticsAssessmentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTrialLogisticsAssessmentQuery, GetTrialLogisticsAssessmentQueryVariables>(GetTrialLogisticsAssessmentDocument, options);
        }
// @ts-ignore
export function useGetTrialLogisticsAssessmentSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTrialLogisticsAssessmentQuery, GetTrialLogisticsAssessmentQueryVariables>): Apollo.UseSuspenseQueryResult<GetTrialLogisticsAssessmentQuery, GetTrialLogisticsAssessmentQueryVariables>;
export function useGetTrialLogisticsAssessmentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTrialLogisticsAssessmentQuery, GetTrialLogisticsAssessmentQueryVariables>): Apollo.UseSuspenseQueryResult<GetTrialLogisticsAssessmentQuery | undefined, GetTrialLogisticsAssessmentQueryVariables>;
export function useGetTrialLogisticsAssessmentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTrialLogisticsAssessmentQuery, GetTrialLogisticsAssessmentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTrialLogisticsAssessmentQuery, GetTrialLogisticsAssessmentQueryVariables>(GetTrialLogisticsAssessmentDocument, options);
        }
export type GetTrialLogisticsAssessmentQueryHookResult = ReturnType<typeof useGetTrialLogisticsAssessmentQuery>;
export type GetTrialLogisticsAssessmentLazyQueryHookResult = ReturnType<typeof useGetTrialLogisticsAssessmentLazyQuery>;
export type GetTrialLogisticsAssessmentSuspenseQueryHookResult = ReturnType<typeof useGetTrialLogisticsAssessmentSuspenseQuery>;
export type GetTrialLogisticsAssessmentQueryResult = Apollo.QueryResult<GetTrialLogisticsAssessmentQuery, GetTrialLogisticsAssessmentQueryVariables>;
export const GetTrialLogisticsAssessmentsDocument = gql`
    query GetTrialLogisticsAssessments {
  trialLogisticsAssessments {
    id
    patientId
    matchId
    distanceMiles
    estimatedOutOfPocket
    feasibilityScore
    barriers
    logisticsPlan
    createdAt
  }
}
    `;

/**
 * __useGetTrialLogisticsAssessmentsQuery__
 *
 * To run a query within a React component, call `useGetTrialLogisticsAssessmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTrialLogisticsAssessmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTrialLogisticsAssessmentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTrialLogisticsAssessmentsQuery(baseOptions?: Apollo.QueryHookOptions<GetTrialLogisticsAssessmentsQuery, GetTrialLogisticsAssessmentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTrialLogisticsAssessmentsQuery, GetTrialLogisticsAssessmentsQueryVariables>(GetTrialLogisticsAssessmentsDocument, options);
      }
export function useGetTrialLogisticsAssessmentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTrialLogisticsAssessmentsQuery, GetTrialLogisticsAssessmentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTrialLogisticsAssessmentsQuery, GetTrialLogisticsAssessmentsQueryVariables>(GetTrialLogisticsAssessmentsDocument, options);
        }
// @ts-ignore
export function useGetTrialLogisticsAssessmentsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTrialLogisticsAssessmentsQuery, GetTrialLogisticsAssessmentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetTrialLogisticsAssessmentsQuery, GetTrialLogisticsAssessmentsQueryVariables>;
export function useGetTrialLogisticsAssessmentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTrialLogisticsAssessmentsQuery, GetTrialLogisticsAssessmentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetTrialLogisticsAssessmentsQuery | undefined, GetTrialLogisticsAssessmentsQueryVariables>;
export function useGetTrialLogisticsAssessmentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTrialLogisticsAssessmentsQuery, GetTrialLogisticsAssessmentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTrialLogisticsAssessmentsQuery, GetTrialLogisticsAssessmentsQueryVariables>(GetTrialLogisticsAssessmentsDocument, options);
        }
export type GetTrialLogisticsAssessmentsQueryHookResult = ReturnType<typeof useGetTrialLogisticsAssessmentsQuery>;
export type GetTrialLogisticsAssessmentsLazyQueryHookResult = ReturnType<typeof useGetTrialLogisticsAssessmentsLazyQuery>;
export type GetTrialLogisticsAssessmentsSuspenseQueryHookResult = ReturnType<typeof useGetTrialLogisticsAssessmentsSuspenseQuery>;
export type GetTrialLogisticsAssessmentsQueryResult = Apollo.QueryResult<GetTrialLogisticsAssessmentsQuery, GetTrialLogisticsAssessmentsQueryVariables>;
export const GetAssistanceProgramsDocument = gql`
    query GetAssistancePrograms {
  assistancePrograms {
    key
    name
    provider
    category
    description
    coverage
    phone
    url
    eligibility
    eligible
    eligibleReason
  }
}
    `;

/**
 * __useGetAssistanceProgramsQuery__
 *
 * To run a query within a React component, call `useGetAssistanceProgramsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssistanceProgramsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssistanceProgramsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAssistanceProgramsQuery(baseOptions?: Apollo.QueryHookOptions<GetAssistanceProgramsQuery, GetAssistanceProgramsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAssistanceProgramsQuery, GetAssistanceProgramsQueryVariables>(GetAssistanceProgramsDocument, options);
      }
export function useGetAssistanceProgramsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAssistanceProgramsQuery, GetAssistanceProgramsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAssistanceProgramsQuery, GetAssistanceProgramsQueryVariables>(GetAssistanceProgramsDocument, options);
        }
// @ts-ignore
export function useGetAssistanceProgramsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAssistanceProgramsQuery, GetAssistanceProgramsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAssistanceProgramsQuery, GetAssistanceProgramsQueryVariables>;
export function useGetAssistanceProgramsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAssistanceProgramsQuery, GetAssistanceProgramsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAssistanceProgramsQuery | undefined, GetAssistanceProgramsQueryVariables>;
export function useGetAssistanceProgramsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAssistanceProgramsQuery, GetAssistanceProgramsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAssistanceProgramsQuery, GetAssistanceProgramsQueryVariables>(GetAssistanceProgramsDocument, options);
        }
export type GetAssistanceProgramsQueryHookResult = ReturnType<typeof useGetAssistanceProgramsQuery>;
export type GetAssistanceProgramsLazyQueryHookResult = ReturnType<typeof useGetAssistanceProgramsLazyQuery>;
export type GetAssistanceProgramsSuspenseQueryHookResult = ReturnType<typeof useGetAssistanceProgramsSuspenseQuery>;
export type GetAssistanceProgramsQueryResult = Apollo.QueryResult<GetAssistanceProgramsQuery, GetAssistanceProgramsQueryVariables>;
export const GetAssistanceApplicationsDocument = gql`
    query GetAssistanceApplications {
  assistanceApplications {
    id
    patientId
    assessmentId
    programKey
    programName
    status
    appliedAt
    statusUpdatedAt
    notes
    createdAt
  }
}
    `;

/**
 * __useGetAssistanceApplicationsQuery__
 *
 * To run a query within a React component, call `useGetAssistanceApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAssistanceApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAssistanceApplicationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAssistanceApplicationsQuery(baseOptions?: Apollo.QueryHookOptions<GetAssistanceApplicationsQuery, GetAssistanceApplicationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAssistanceApplicationsQuery, GetAssistanceApplicationsQueryVariables>(GetAssistanceApplicationsDocument, options);
      }
export function useGetAssistanceApplicationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAssistanceApplicationsQuery, GetAssistanceApplicationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAssistanceApplicationsQuery, GetAssistanceApplicationsQueryVariables>(GetAssistanceApplicationsDocument, options);
        }
// @ts-ignore
export function useGetAssistanceApplicationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAssistanceApplicationsQuery, GetAssistanceApplicationsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAssistanceApplicationsQuery, GetAssistanceApplicationsQueryVariables>;
export function useGetAssistanceApplicationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAssistanceApplicationsQuery, GetAssistanceApplicationsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAssistanceApplicationsQuery | undefined, GetAssistanceApplicationsQueryVariables>;
export function useGetAssistanceApplicationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAssistanceApplicationsQuery, GetAssistanceApplicationsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAssistanceApplicationsQuery, GetAssistanceApplicationsQueryVariables>(GetAssistanceApplicationsDocument, options);
        }
export type GetAssistanceApplicationsQueryHookResult = ReturnType<typeof useGetAssistanceApplicationsQuery>;
export type GetAssistanceApplicationsLazyQueryHookResult = ReturnType<typeof useGetAssistanceApplicationsLazyQuery>;
export type GetAssistanceApplicationsSuspenseQueryHookResult = ReturnType<typeof useGetAssistanceApplicationsSuspenseQuery>;
export type GetAssistanceApplicationsQueryResult = Apollo.QueryResult<GetAssistanceApplicationsQuery, GetAssistanceApplicationsQueryVariables>;
export const AssessTrialLogisticsDocument = gql`
    mutation AssessTrialLogistics($matchId: String!) {
  assessTrialLogistics(matchId: $matchId) {
    id
    patientId
    matchId
    siteId
    distanceMiles
    estimatedCosts
    matchedPrograms
    estimatedOutOfPocket
    feasibilityScore
    barriers
    createdAt
  }
}
    `;
export type AssessTrialLogisticsMutationFn = Apollo.MutationFunction<AssessTrialLogisticsMutation, AssessTrialLogisticsMutationVariables>;

/**
 * __useAssessTrialLogisticsMutation__
 *
 * To run a mutation, you first call `useAssessTrialLogisticsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssessTrialLogisticsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assessTrialLogisticsMutation, { data, loading, error }] = useAssessTrialLogisticsMutation({
 *   variables: {
 *      matchId: // value for 'matchId'
 *   },
 * });
 */
export function useAssessTrialLogisticsMutation(baseOptions?: Apollo.MutationHookOptions<AssessTrialLogisticsMutation, AssessTrialLogisticsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AssessTrialLogisticsMutation, AssessTrialLogisticsMutationVariables>(AssessTrialLogisticsDocument, options);
      }
export type AssessTrialLogisticsMutationHookResult = ReturnType<typeof useAssessTrialLogisticsMutation>;
export type AssessTrialLogisticsMutationResult = Apollo.MutationResult<AssessTrialLogisticsMutation>;
export type AssessTrialLogisticsMutationOptions = Apollo.BaseMutationOptions<AssessTrialLogisticsMutation, AssessTrialLogisticsMutationVariables>;
export const GenerateLogisticsPlanDocument = gql`
    mutation GenerateLogisticsPlan($matchId: String!) {
  generateLogisticsPlan(matchId: $matchId)
}
    `;
export type GenerateLogisticsPlanMutationFn = Apollo.MutationFunction<GenerateLogisticsPlanMutation, GenerateLogisticsPlanMutationVariables>;

/**
 * __useGenerateLogisticsPlanMutation__
 *
 * To run a mutation, you first call `useGenerateLogisticsPlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateLogisticsPlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateLogisticsPlanMutation, { data, loading, error }] = useGenerateLogisticsPlanMutation({
 *   variables: {
 *      matchId: // value for 'matchId'
 *   },
 * });
 */
export function useGenerateLogisticsPlanMutation(baseOptions?: Apollo.MutationHookOptions<GenerateLogisticsPlanMutation, GenerateLogisticsPlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateLogisticsPlanMutation, GenerateLogisticsPlanMutationVariables>(GenerateLogisticsPlanDocument, options);
      }
export type GenerateLogisticsPlanMutationHookResult = ReturnType<typeof useGenerateLogisticsPlanMutation>;
export type GenerateLogisticsPlanMutationResult = Apollo.MutationResult<GenerateLogisticsPlanMutation>;
export type GenerateLogisticsPlanMutationOptions = Apollo.BaseMutationOptions<GenerateLogisticsPlanMutation, GenerateLogisticsPlanMutationVariables>;
export const UpdateAssistanceApplicationDocument = gql`
    mutation UpdateAssistanceApplication($input: UpdateAssistanceApplicationInput!) {
  updateAssistanceApplication(input: $input) {
    id
    programKey
    programName
    status
    appliedAt
    statusUpdatedAt
    notes
  }
}
    `;
export type UpdateAssistanceApplicationMutationFn = Apollo.MutationFunction<UpdateAssistanceApplicationMutation, UpdateAssistanceApplicationMutationVariables>;

/**
 * __useUpdateAssistanceApplicationMutation__
 *
 * To run a mutation, you first call `useUpdateAssistanceApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAssistanceApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAssistanceApplicationMutation, { data, loading, error }] = useUpdateAssistanceApplicationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateAssistanceApplicationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAssistanceApplicationMutation, UpdateAssistanceApplicationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAssistanceApplicationMutation, UpdateAssistanceApplicationMutationVariables>(UpdateAssistanceApplicationDocument, options);
      }
export type UpdateAssistanceApplicationMutationHookResult = ReturnType<typeof useUpdateAssistanceApplicationMutation>;
export type UpdateAssistanceApplicationMutationResult = Apollo.MutationResult<UpdateAssistanceApplicationMutation>;
export type UpdateAssistanceApplicationMutationOptions = Apollo.BaseMutationOptions<UpdateAssistanceApplicationMutation, UpdateAssistanceApplicationMutationVariables>;
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
export const GetPreventiveTrialsDocument = gql`
    query GetPreventiveTrials($category: String) {
  preventiveTrials(category: $category) {
    id
    nctId
    title
    trialCategory
    phase
    status
    sponsor
    briefSummary
    curatedSummary
    targetPopulation
    vaccineTarget
    mechanism
    keyResults
    editorNote
    matchingCriteria
  }
}
    `;

/**
 * __useGetPreventiveTrialsQuery__
 *
 * To run a query within a React component, call `useGetPreventiveTrialsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPreventiveTrialsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPreventiveTrialsQuery({
 *   variables: {
 *      category: // value for 'category'
 *   },
 * });
 */
export function useGetPreventiveTrialsQuery(baseOptions?: Apollo.QueryHookOptions<GetPreventiveTrialsQuery, GetPreventiveTrialsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPreventiveTrialsQuery, GetPreventiveTrialsQueryVariables>(GetPreventiveTrialsDocument, options);
      }
export function useGetPreventiveTrialsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPreventiveTrialsQuery, GetPreventiveTrialsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPreventiveTrialsQuery, GetPreventiveTrialsQueryVariables>(GetPreventiveTrialsDocument, options);
        }
// @ts-ignore
export function useGetPreventiveTrialsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPreventiveTrialsQuery, GetPreventiveTrialsQueryVariables>): Apollo.UseSuspenseQueryResult<GetPreventiveTrialsQuery, GetPreventiveTrialsQueryVariables>;
export function useGetPreventiveTrialsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPreventiveTrialsQuery, GetPreventiveTrialsQueryVariables>): Apollo.UseSuspenseQueryResult<GetPreventiveTrialsQuery | undefined, GetPreventiveTrialsQueryVariables>;
export function useGetPreventiveTrialsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPreventiveTrialsQuery, GetPreventiveTrialsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPreventiveTrialsQuery, GetPreventiveTrialsQueryVariables>(GetPreventiveTrialsDocument, options);
        }
export type GetPreventiveTrialsQueryHookResult = ReturnType<typeof useGetPreventiveTrialsQuery>;
export type GetPreventiveTrialsLazyQueryHookResult = ReturnType<typeof useGetPreventiveTrialsLazyQuery>;
export type GetPreventiveTrialsSuspenseQueryHookResult = ReturnType<typeof useGetPreventiveTrialsSuspenseQuery>;
export type GetPreventiveTrialsQueryResult = Apollo.QueryResult<GetPreventiveTrialsQuery, GetPreventiveTrialsQueryVariables>;
export const RunPreventivePrescreenDocument = gql`
    query RunPreventivePrescreen($input: PreventivePrescreenInput!) {
  preventivePrescreen(input: $input) {
    matchedTrials {
      trial {
        id
        nctId
        title
        trialCategory
        phase
        status
        sponsor
        briefSummary
        curatedSummary
        targetPopulation
        vaccineTarget
        mechanism
        keyResults
        editorNote
      }
      matchStrength
      matchReason
      nextSteps
    }
    totalPreventiveTrials
    noMatchMessage
    riskAssessmentCTA
  }
}
    `;

/**
 * __useRunPreventivePrescreenQuery__
 *
 * To run a query within a React component, call `useRunPreventivePrescreenQuery` and pass it any options that fit your needs.
 * When your component renders, `useRunPreventivePrescreenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRunPreventivePrescreenQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRunPreventivePrescreenQuery(baseOptions: Apollo.QueryHookOptions<RunPreventivePrescreenQuery, RunPreventivePrescreenQueryVariables> & ({ variables: RunPreventivePrescreenQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RunPreventivePrescreenQuery, RunPreventivePrescreenQueryVariables>(RunPreventivePrescreenDocument, options);
      }
export function useRunPreventivePrescreenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RunPreventivePrescreenQuery, RunPreventivePrescreenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RunPreventivePrescreenQuery, RunPreventivePrescreenQueryVariables>(RunPreventivePrescreenDocument, options);
        }
// @ts-ignore
export function useRunPreventivePrescreenSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<RunPreventivePrescreenQuery, RunPreventivePrescreenQueryVariables>): Apollo.UseSuspenseQueryResult<RunPreventivePrescreenQuery, RunPreventivePrescreenQueryVariables>;
export function useRunPreventivePrescreenSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RunPreventivePrescreenQuery, RunPreventivePrescreenQueryVariables>): Apollo.UseSuspenseQueryResult<RunPreventivePrescreenQuery | undefined, RunPreventivePrescreenQueryVariables>;
export function useRunPreventivePrescreenSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RunPreventivePrescreenQuery, RunPreventivePrescreenQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RunPreventivePrescreenQuery, RunPreventivePrescreenQueryVariables>(RunPreventivePrescreenDocument, options);
        }
export type RunPreventivePrescreenQueryHookResult = ReturnType<typeof useRunPreventivePrescreenQuery>;
export type RunPreventivePrescreenLazyQueryHookResult = ReturnType<typeof useRunPreventivePrescreenLazyQuery>;
export type RunPreventivePrescreenSuspenseQueryHookResult = ReturnType<typeof useRunPreventivePrescreenSuspenseQuery>;
export type RunPreventivePrescreenQueryResult = Apollo.QueryResult<RunPreventivePrescreenQuery, RunPreventivePrescreenQueryVariables>;
export const GetPreventiveTrialsForFamilyDocument = gql`
    query GetPreventiveTrialsForFamily {
  preventiveTrialsForFamily {
    trial {
      id
      nctId
      title
      trialCategory
      phase
      status
      sponsor
      briefSummary
      curatedSummary
      targetPopulation
      vaccineTarget
      mechanism
      keyResults
      editorNote
    }
    matchStrength
    matchReason
    nextSteps
  }
}
    `;

/**
 * __useGetPreventiveTrialsForFamilyQuery__
 *
 * To run a query within a React component, call `useGetPreventiveTrialsForFamilyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPreventiveTrialsForFamilyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPreventiveTrialsForFamilyQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPreventiveTrialsForFamilyQuery(baseOptions?: Apollo.QueryHookOptions<GetPreventiveTrialsForFamilyQuery, GetPreventiveTrialsForFamilyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPreventiveTrialsForFamilyQuery, GetPreventiveTrialsForFamilyQueryVariables>(GetPreventiveTrialsForFamilyDocument, options);
      }
export function useGetPreventiveTrialsForFamilyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPreventiveTrialsForFamilyQuery, GetPreventiveTrialsForFamilyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPreventiveTrialsForFamilyQuery, GetPreventiveTrialsForFamilyQueryVariables>(GetPreventiveTrialsForFamilyDocument, options);
        }
// @ts-ignore
export function useGetPreventiveTrialsForFamilySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPreventiveTrialsForFamilyQuery, GetPreventiveTrialsForFamilyQueryVariables>): Apollo.UseSuspenseQueryResult<GetPreventiveTrialsForFamilyQuery, GetPreventiveTrialsForFamilyQueryVariables>;
export function useGetPreventiveTrialsForFamilySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPreventiveTrialsForFamilyQuery, GetPreventiveTrialsForFamilyQueryVariables>): Apollo.UseSuspenseQueryResult<GetPreventiveTrialsForFamilyQuery | undefined, GetPreventiveTrialsForFamilyQueryVariables>;
export function useGetPreventiveTrialsForFamilySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPreventiveTrialsForFamilyQuery, GetPreventiveTrialsForFamilyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPreventiveTrialsForFamilyQuery, GetPreventiveTrialsForFamilyQueryVariables>(GetPreventiveTrialsForFamilyDocument, options);
        }
export type GetPreventiveTrialsForFamilyQueryHookResult = ReturnType<typeof useGetPreventiveTrialsForFamilyQuery>;
export type GetPreventiveTrialsForFamilyLazyQueryHookResult = ReturnType<typeof useGetPreventiveTrialsForFamilyLazyQuery>;
export type GetPreventiveTrialsForFamilySuspenseQueryHookResult = ReturnType<typeof useGetPreventiveTrialsForFamilySuspenseQuery>;
export type GetPreventiveTrialsForFamilyQueryResult = Apollo.QueryResult<GetPreventiveTrialsForFamilyQuery, GetPreventiveTrialsForFamilyQueryVariables>;
export const GetRecurrencePreventionTrialsDocument = gql`
    query GetRecurrencePreventionTrials {
  recurrencePreventionTrials {
    trial {
      id
      nctId
      title
      trialCategory
      phase
      status
      sponsor
      briefSummary
      curatedSummary
      targetPopulation
      vaccineTarget
      mechanism
      keyResults
      editorNote
    }
    matchStrength
    matchReason
    nextSteps
  }
}
    `;

/**
 * __useGetRecurrencePreventionTrialsQuery__
 *
 * To run a query within a React component, call `useGetRecurrencePreventionTrialsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecurrencePreventionTrialsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecurrencePreventionTrialsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRecurrencePreventionTrialsQuery(baseOptions?: Apollo.QueryHookOptions<GetRecurrencePreventionTrialsQuery, GetRecurrencePreventionTrialsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecurrencePreventionTrialsQuery, GetRecurrencePreventionTrialsQueryVariables>(GetRecurrencePreventionTrialsDocument, options);
      }
export function useGetRecurrencePreventionTrialsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecurrencePreventionTrialsQuery, GetRecurrencePreventionTrialsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecurrencePreventionTrialsQuery, GetRecurrencePreventionTrialsQueryVariables>(GetRecurrencePreventionTrialsDocument, options);
        }
// @ts-ignore
export function useGetRecurrencePreventionTrialsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecurrencePreventionTrialsQuery, GetRecurrencePreventionTrialsQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecurrencePreventionTrialsQuery, GetRecurrencePreventionTrialsQueryVariables>;
export function useGetRecurrencePreventionTrialsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecurrencePreventionTrialsQuery, GetRecurrencePreventionTrialsQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecurrencePreventionTrialsQuery | undefined, GetRecurrencePreventionTrialsQueryVariables>;
export function useGetRecurrencePreventionTrialsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecurrencePreventionTrialsQuery, GetRecurrencePreventionTrialsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecurrencePreventionTrialsQuery, GetRecurrencePreventionTrialsQueryVariables>(GetRecurrencePreventionTrialsDocument, options);
        }
export type GetRecurrencePreventionTrialsQueryHookResult = ReturnType<typeof useGetRecurrencePreventionTrialsQuery>;
export type GetRecurrencePreventionTrialsLazyQueryHookResult = ReturnType<typeof useGetRecurrencePreventionTrialsLazyQuery>;
export type GetRecurrencePreventionTrialsSuspenseQueryHookResult = ReturnType<typeof useGetRecurrencePreventionTrialsSuspenseQuery>;
export type GetRecurrencePreventionTrialsQueryResult = Apollo.QueryResult<GetRecurrencePreventionTrialsQuery, GetRecurrencePreventionTrialsQueryVariables>;
export const GetReferralStatsDocument = gql`
    query GetReferralStats {
  referralStats {
    totalSent
    totalRedeemed
  }
}
    `;

/**
 * __useGetReferralStatsQuery__
 *
 * To run a query within a React component, call `useGetReferralStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetReferralStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetReferralStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetReferralStatsQuery(baseOptions?: Apollo.QueryHookOptions<GetReferralStatsQuery, GetReferralStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetReferralStatsQuery, GetReferralStatsQueryVariables>(GetReferralStatsDocument, options);
      }
export function useGetReferralStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetReferralStatsQuery, GetReferralStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetReferralStatsQuery, GetReferralStatsQueryVariables>(GetReferralStatsDocument, options);
        }
// @ts-ignore
export function useGetReferralStatsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetReferralStatsQuery, GetReferralStatsQueryVariables>): Apollo.UseSuspenseQueryResult<GetReferralStatsQuery, GetReferralStatsQueryVariables>;
export function useGetReferralStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetReferralStatsQuery, GetReferralStatsQueryVariables>): Apollo.UseSuspenseQueryResult<GetReferralStatsQuery | undefined, GetReferralStatsQueryVariables>;
export function useGetReferralStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetReferralStatsQuery, GetReferralStatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetReferralStatsQuery, GetReferralStatsQueryVariables>(GetReferralStatsDocument, options);
        }
export type GetReferralStatsQueryHookResult = ReturnType<typeof useGetReferralStatsQuery>;
export type GetReferralStatsLazyQueryHookResult = ReturnType<typeof useGetReferralStatsLazyQuery>;
export type GetReferralStatsSuspenseQueryHookResult = ReturnType<typeof useGetReferralStatsSuspenseQuery>;
export type GetReferralStatsQueryResult = Apollo.QueryResult<GetReferralStatsQuery, GetReferralStatsQueryVariables>;
export const GenerateFamilyReferralLinkDocument = gql`
    mutation GenerateFamilyReferralLink {
  generateFamilyReferralLink {
    referralCode
    url
    textMessage
    emailSubject
    emailBody
  }
}
    `;
export type GenerateFamilyReferralLinkMutationFn = Apollo.MutationFunction<GenerateFamilyReferralLinkMutation, GenerateFamilyReferralLinkMutationVariables>;

/**
 * __useGenerateFamilyReferralLinkMutation__
 *
 * To run a mutation, you first call `useGenerateFamilyReferralLinkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateFamilyReferralLinkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateFamilyReferralLinkMutation, { data, loading, error }] = useGenerateFamilyReferralLinkMutation({
 *   variables: {
 *   },
 * });
 */
export function useGenerateFamilyReferralLinkMutation(baseOptions?: Apollo.MutationHookOptions<GenerateFamilyReferralLinkMutation, GenerateFamilyReferralLinkMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateFamilyReferralLinkMutation, GenerateFamilyReferralLinkMutationVariables>(GenerateFamilyReferralLinkDocument, options);
      }
export type GenerateFamilyReferralLinkMutationHookResult = ReturnType<typeof useGenerateFamilyReferralLinkMutation>;
export type GenerateFamilyReferralLinkMutationResult = Apollo.MutationResult<GenerateFamilyReferralLinkMutation>;
export type GenerateFamilyReferralLinkMutationOptions = Apollo.BaseMutationOptions<GenerateFamilyReferralLinkMutation, GenerateFamilyReferralLinkMutationVariables>;
export const RedeemReferralCodeDocument = gql`
    mutation RedeemReferralCode($code: String!) {
  redeemReferralCode(code: $code) {
    success
    prefillFamilyHistory
  }
}
    `;
export type RedeemReferralCodeMutationFn = Apollo.MutationFunction<RedeemReferralCodeMutation, RedeemReferralCodeMutationVariables>;

/**
 * __useRedeemReferralCodeMutation__
 *
 * To run a mutation, you first call `useRedeemReferralCodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRedeemReferralCodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [redeemReferralCodeMutation, { data, loading, error }] = useRedeemReferralCodeMutation({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useRedeemReferralCodeMutation(baseOptions?: Apollo.MutationHookOptions<RedeemReferralCodeMutation, RedeemReferralCodeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RedeemReferralCodeMutation, RedeemReferralCodeMutationVariables>(RedeemReferralCodeDocument, options);
      }
export type RedeemReferralCodeMutationHookResult = ReturnType<typeof useRedeemReferralCodeMutation>;
export type RedeemReferralCodeMutationResult = Apollo.MutationResult<RedeemReferralCodeMutation>;
export type RedeemReferralCodeMutationOptions = Apollo.BaseMutationOptions<RedeemReferralCodeMutation, RedeemReferralCodeMutationVariables>;
export const GetSecondOpinionEvaluationDocument = gql`
    query GetSecondOpinionEvaluation {
  secondOpinionEvaluation {
    triggers {
      id
      name
      severity
      rationale
      evidenceBase
    }
    overallSeverity
    recommended
  }
}
    `;

/**
 * __useGetSecondOpinionEvaluationQuery__
 *
 * To run a query within a React component, call `useGetSecondOpinionEvaluationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSecondOpinionEvaluationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSecondOpinionEvaluationQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSecondOpinionEvaluationQuery(baseOptions?: Apollo.QueryHookOptions<GetSecondOpinionEvaluationQuery, GetSecondOpinionEvaluationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSecondOpinionEvaluationQuery, GetSecondOpinionEvaluationQueryVariables>(GetSecondOpinionEvaluationDocument, options);
      }
export function useGetSecondOpinionEvaluationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSecondOpinionEvaluationQuery, GetSecondOpinionEvaluationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSecondOpinionEvaluationQuery, GetSecondOpinionEvaluationQueryVariables>(GetSecondOpinionEvaluationDocument, options);
        }
// @ts-ignore
export function useGetSecondOpinionEvaluationSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSecondOpinionEvaluationQuery, GetSecondOpinionEvaluationQueryVariables>): Apollo.UseSuspenseQueryResult<GetSecondOpinionEvaluationQuery, GetSecondOpinionEvaluationQueryVariables>;
export function useGetSecondOpinionEvaluationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSecondOpinionEvaluationQuery, GetSecondOpinionEvaluationQueryVariables>): Apollo.UseSuspenseQueryResult<GetSecondOpinionEvaluationQuery | undefined, GetSecondOpinionEvaluationQueryVariables>;
export function useGetSecondOpinionEvaluationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSecondOpinionEvaluationQuery, GetSecondOpinionEvaluationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSecondOpinionEvaluationQuery, GetSecondOpinionEvaluationQueryVariables>(GetSecondOpinionEvaluationDocument, options);
        }
export type GetSecondOpinionEvaluationQueryHookResult = ReturnType<typeof useGetSecondOpinionEvaluationQuery>;
export type GetSecondOpinionEvaluationLazyQueryHookResult = ReturnType<typeof useGetSecondOpinionEvaluationLazyQuery>;
export type GetSecondOpinionEvaluationSuspenseQueryHookResult = ReturnType<typeof useGetSecondOpinionEvaluationSuspenseQuery>;
export type GetSecondOpinionEvaluationQueryResult = Apollo.QueryResult<GetSecondOpinionEvaluationQuery, GetSecondOpinionEvaluationQueryVariables>;
export const GetSecondOpinionRequestDocument = gql`
    query GetSecondOpinionRequest {
  secondOpinionRequest {
    id
    patientId
    triggerReasons
    triggerSeverity
    status
    centerId
    centerName
    isVirtual
    appointmentDate
    clinicalSummary
    questionsForReview
    communicationGuide
    outcome
    outcomeSummary
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetSecondOpinionRequestQuery__
 *
 * To run a query within a React component, call `useGetSecondOpinionRequestQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSecondOpinionRequestQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSecondOpinionRequestQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSecondOpinionRequestQuery(baseOptions?: Apollo.QueryHookOptions<GetSecondOpinionRequestQuery, GetSecondOpinionRequestQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSecondOpinionRequestQuery, GetSecondOpinionRequestQueryVariables>(GetSecondOpinionRequestDocument, options);
      }
export function useGetSecondOpinionRequestLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSecondOpinionRequestQuery, GetSecondOpinionRequestQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSecondOpinionRequestQuery, GetSecondOpinionRequestQueryVariables>(GetSecondOpinionRequestDocument, options);
        }
// @ts-ignore
export function useGetSecondOpinionRequestSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSecondOpinionRequestQuery, GetSecondOpinionRequestQueryVariables>): Apollo.UseSuspenseQueryResult<GetSecondOpinionRequestQuery, GetSecondOpinionRequestQueryVariables>;
export function useGetSecondOpinionRequestSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSecondOpinionRequestQuery, GetSecondOpinionRequestQueryVariables>): Apollo.UseSuspenseQueryResult<GetSecondOpinionRequestQuery | undefined, GetSecondOpinionRequestQueryVariables>;
export function useGetSecondOpinionRequestSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSecondOpinionRequestQuery, GetSecondOpinionRequestQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSecondOpinionRequestQuery, GetSecondOpinionRequestQueryVariables>(GetSecondOpinionRequestDocument, options);
        }
export type GetSecondOpinionRequestQueryHookResult = ReturnType<typeof useGetSecondOpinionRequestQuery>;
export type GetSecondOpinionRequestLazyQueryHookResult = ReturnType<typeof useGetSecondOpinionRequestLazyQuery>;
export type GetSecondOpinionRequestSuspenseQueryHookResult = ReturnType<typeof useGetSecondOpinionRequestSuspenseQuery>;
export type GetSecondOpinionRequestQueryResult = Apollo.QueryResult<GetSecondOpinionRequestQuery, GetSecondOpinionRequestQueryVariables>;
export const GetSecondOpinionCentersDocument = gql`
    query GetSecondOpinionCenters($virtual: Boolean, $subspecialty: String) {
  secondOpinionCenters(virtual: $virtual, subspecialty: $subspecialty) {
    id
    name
    nciDesignation
    subspecialties
    offersVirtual
    virtualPlatform
    averageWaitDays
    pathologyReReview
    address
    city
    state
    distance
    acceptsInsurance
    estimatedCostInsured
    estimatedCostUninsured
    financialAssistance
    coordinator
    phone
    website
    intakeFormUrl
  }
}
    `;

/**
 * __useGetSecondOpinionCentersQuery__
 *
 * To run a query within a React component, call `useGetSecondOpinionCentersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSecondOpinionCentersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSecondOpinionCentersQuery({
 *   variables: {
 *      virtual: // value for 'virtual'
 *      subspecialty: // value for 'subspecialty'
 *   },
 * });
 */
export function useGetSecondOpinionCentersQuery(baseOptions?: Apollo.QueryHookOptions<GetSecondOpinionCentersQuery, GetSecondOpinionCentersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSecondOpinionCentersQuery, GetSecondOpinionCentersQueryVariables>(GetSecondOpinionCentersDocument, options);
      }
export function useGetSecondOpinionCentersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSecondOpinionCentersQuery, GetSecondOpinionCentersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSecondOpinionCentersQuery, GetSecondOpinionCentersQueryVariables>(GetSecondOpinionCentersDocument, options);
        }
// @ts-ignore
export function useGetSecondOpinionCentersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSecondOpinionCentersQuery, GetSecondOpinionCentersQueryVariables>): Apollo.UseSuspenseQueryResult<GetSecondOpinionCentersQuery, GetSecondOpinionCentersQueryVariables>;
export function useGetSecondOpinionCentersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSecondOpinionCentersQuery, GetSecondOpinionCentersQueryVariables>): Apollo.UseSuspenseQueryResult<GetSecondOpinionCentersQuery | undefined, GetSecondOpinionCentersQueryVariables>;
export function useGetSecondOpinionCentersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSecondOpinionCentersQuery, GetSecondOpinionCentersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSecondOpinionCentersQuery, GetSecondOpinionCentersQueryVariables>(GetSecondOpinionCentersDocument, options);
        }
export type GetSecondOpinionCentersQueryHookResult = ReturnType<typeof useGetSecondOpinionCentersQuery>;
export type GetSecondOpinionCentersLazyQueryHookResult = ReturnType<typeof useGetSecondOpinionCentersLazyQuery>;
export type GetSecondOpinionCentersSuspenseQueryHookResult = ReturnType<typeof useGetSecondOpinionCentersSuspenseQuery>;
export type GetSecondOpinionCentersQueryResult = Apollo.QueryResult<GetSecondOpinionCentersQuery, GetSecondOpinionCentersQueryVariables>;
export const CreateSecondOpinionRequestDocument = gql`
    mutation CreateSecondOpinionRequest {
  createSecondOpinionRequest {
    id
    patientId
    triggerReasons
    triggerSeverity
    status
    createdAt
  }
}
    `;
export type CreateSecondOpinionRequestMutationFn = Apollo.MutationFunction<CreateSecondOpinionRequestMutation, CreateSecondOpinionRequestMutationVariables>;

/**
 * __useCreateSecondOpinionRequestMutation__
 *
 * To run a mutation, you first call `useCreateSecondOpinionRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSecondOpinionRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSecondOpinionRequestMutation, { data, loading, error }] = useCreateSecondOpinionRequestMutation({
 *   variables: {
 *   },
 * });
 */
export function useCreateSecondOpinionRequestMutation(baseOptions?: Apollo.MutationHookOptions<CreateSecondOpinionRequestMutation, CreateSecondOpinionRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSecondOpinionRequestMutation, CreateSecondOpinionRequestMutationVariables>(CreateSecondOpinionRequestDocument, options);
      }
export type CreateSecondOpinionRequestMutationHookResult = ReturnType<typeof useCreateSecondOpinionRequestMutation>;
export type CreateSecondOpinionRequestMutationResult = Apollo.MutationResult<CreateSecondOpinionRequestMutation>;
export type CreateSecondOpinionRequestMutationOptions = Apollo.BaseMutationOptions<CreateSecondOpinionRequestMutation, CreateSecondOpinionRequestMutationVariables>;
export const GenerateRecordPacketDocument = gql`
    mutation GenerateRecordPacket {
  generateRecordPacket
}
    `;
export type GenerateRecordPacketMutationFn = Apollo.MutationFunction<GenerateRecordPacketMutation, GenerateRecordPacketMutationVariables>;

/**
 * __useGenerateRecordPacketMutation__
 *
 * To run a mutation, you first call `useGenerateRecordPacketMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateRecordPacketMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateRecordPacketMutation, { data, loading, error }] = useGenerateRecordPacketMutation({
 *   variables: {
 *   },
 * });
 */
export function useGenerateRecordPacketMutation(baseOptions?: Apollo.MutationHookOptions<GenerateRecordPacketMutation, GenerateRecordPacketMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateRecordPacketMutation, GenerateRecordPacketMutationVariables>(GenerateRecordPacketDocument, options);
      }
export type GenerateRecordPacketMutationHookResult = ReturnType<typeof useGenerateRecordPacketMutation>;
export type GenerateRecordPacketMutationResult = Apollo.MutationResult<GenerateRecordPacketMutation>;
export type GenerateRecordPacketMutationOptions = Apollo.BaseMutationOptions<GenerateRecordPacketMutation, GenerateRecordPacketMutationVariables>;
export const GenerateCommunicationGuideDocument = gql`
    mutation GenerateCommunicationGuide {
  generateCommunicationGuide {
    portalMessage
    inPersonScript
    recordsRequest
    reassurance
  }
}
    `;
export type GenerateCommunicationGuideMutationFn = Apollo.MutationFunction<GenerateCommunicationGuideMutation, GenerateCommunicationGuideMutationVariables>;

/**
 * __useGenerateCommunicationGuideMutation__
 *
 * To run a mutation, you first call `useGenerateCommunicationGuideMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateCommunicationGuideMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateCommunicationGuideMutation, { data, loading, error }] = useGenerateCommunicationGuideMutation({
 *   variables: {
 *   },
 * });
 */
export function useGenerateCommunicationGuideMutation(baseOptions?: Apollo.MutationHookOptions<GenerateCommunicationGuideMutation, GenerateCommunicationGuideMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateCommunicationGuideMutation, GenerateCommunicationGuideMutationVariables>(GenerateCommunicationGuideDocument, options);
      }
export type GenerateCommunicationGuideMutationHookResult = ReturnType<typeof useGenerateCommunicationGuideMutation>;
export type GenerateCommunicationGuideMutationResult = Apollo.MutationResult<GenerateCommunicationGuideMutation>;
export type GenerateCommunicationGuideMutationOptions = Apollo.BaseMutationOptions<GenerateCommunicationGuideMutation, GenerateCommunicationGuideMutationVariables>;
export const SelectSecondOpinionCenterDocument = gql`
    mutation SelectSecondOpinionCenter($input: SelectCenterInput!) {
  selectSecondOpinionCenter(input: $input) {
    id
    centerId
    centerName
    isVirtual
    appointmentDate
    status
  }
}
    `;
export type SelectSecondOpinionCenterMutationFn = Apollo.MutationFunction<SelectSecondOpinionCenterMutation, SelectSecondOpinionCenterMutationVariables>;

/**
 * __useSelectSecondOpinionCenterMutation__
 *
 * To run a mutation, you first call `useSelectSecondOpinionCenterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSelectSecondOpinionCenterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [selectSecondOpinionCenterMutation, { data, loading, error }] = useSelectSecondOpinionCenterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSelectSecondOpinionCenterMutation(baseOptions?: Apollo.MutationHookOptions<SelectSecondOpinionCenterMutation, SelectSecondOpinionCenterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SelectSecondOpinionCenterMutation, SelectSecondOpinionCenterMutationVariables>(SelectSecondOpinionCenterDocument, options);
      }
export type SelectSecondOpinionCenterMutationHookResult = ReturnType<typeof useSelectSecondOpinionCenterMutation>;
export type SelectSecondOpinionCenterMutationResult = Apollo.MutationResult<SelectSecondOpinionCenterMutation>;
export type SelectSecondOpinionCenterMutationOptions = Apollo.BaseMutationOptions<SelectSecondOpinionCenterMutation, SelectSecondOpinionCenterMutationVariables>;
export const RecordSecondOpinionOutcomeDocument = gql`
    mutation RecordSecondOpinionOutcome($input: RecordSecondOpinionOutcomeInput!) {
  recordSecondOpinionOutcome(input: $input) {
    id
    outcome
    outcomeSummary
    status
  }
}
    `;
export type RecordSecondOpinionOutcomeMutationFn = Apollo.MutationFunction<RecordSecondOpinionOutcomeMutation, RecordSecondOpinionOutcomeMutationVariables>;

/**
 * __useRecordSecondOpinionOutcomeMutation__
 *
 * To run a mutation, you first call `useRecordSecondOpinionOutcomeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRecordSecondOpinionOutcomeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [recordSecondOpinionOutcomeMutation, { data, loading, error }] = useRecordSecondOpinionOutcomeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRecordSecondOpinionOutcomeMutation(baseOptions?: Apollo.MutationHookOptions<RecordSecondOpinionOutcomeMutation, RecordSecondOpinionOutcomeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RecordSecondOpinionOutcomeMutation, RecordSecondOpinionOutcomeMutationVariables>(RecordSecondOpinionOutcomeDocument, options);
      }
export type RecordSecondOpinionOutcomeMutationHookResult = ReturnType<typeof useRecordSecondOpinionOutcomeMutation>;
export type RecordSecondOpinionOutcomeMutationResult = Apollo.MutationResult<RecordSecondOpinionOutcomeMutation>;
export type RecordSecondOpinionOutcomeMutationOptions = Apollo.BaseMutationOptions<RecordSecondOpinionOutcomeMutation, RecordSecondOpinionOutcomeMutationVariables>;
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
export const GetRecurrenceEventDocument = gql`
    query GetRecurrenceEvent {
  recurrenceEvent {
    id
    patientId
    detectedDate
    detectionMethod
    recurrenceType
    recurrenceSites
    confirmedByBiopsy
    newPathologyAvailable
    newStage
    timeSinceInitialDx
    timeSinceCompletion
    ctdnaResultId
    priorTreatments
    documentUploadId
    cascadeStatus {
      acknowledged
      supportOffered
      resequencingRecommended
      trialRematched
      financialRematched
      secondOpinionOffered
      careTeamUpdated
      translatorRegenerated
      planArchived
      pipelineActivated
      genomicComparisonReady
    }
    acknowledgedAt
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetRecurrenceEventQuery__
 *
 * To run a query within a React component, call `useGetRecurrenceEventQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecurrenceEventQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecurrenceEventQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRecurrenceEventQuery(baseOptions?: Apollo.QueryHookOptions<GetRecurrenceEventQuery, GetRecurrenceEventQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecurrenceEventQuery, GetRecurrenceEventQueryVariables>(GetRecurrenceEventDocument, options);
      }
export function useGetRecurrenceEventLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecurrenceEventQuery, GetRecurrenceEventQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecurrenceEventQuery, GetRecurrenceEventQueryVariables>(GetRecurrenceEventDocument, options);
        }
// @ts-ignore
export function useGetRecurrenceEventSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecurrenceEventQuery, GetRecurrenceEventQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecurrenceEventQuery, GetRecurrenceEventQueryVariables>;
export function useGetRecurrenceEventSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecurrenceEventQuery, GetRecurrenceEventQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecurrenceEventQuery | undefined, GetRecurrenceEventQueryVariables>;
export function useGetRecurrenceEventSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecurrenceEventQuery, GetRecurrenceEventQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecurrenceEventQuery, GetRecurrenceEventQueryVariables>(GetRecurrenceEventDocument, options);
        }
export type GetRecurrenceEventQueryHookResult = ReturnType<typeof useGetRecurrenceEventQuery>;
export type GetRecurrenceEventLazyQueryHookResult = ReturnType<typeof useGetRecurrenceEventLazyQuery>;
export type GetRecurrenceEventSuspenseQueryHookResult = ReturnType<typeof useGetRecurrenceEventSuspenseQuery>;
export type GetRecurrenceEventQueryResult = Apollo.QueryResult<GetRecurrenceEventQuery, GetRecurrenceEventQueryVariables>;
export const GetRecurrenceEventsDocument = gql`
    query GetRecurrenceEvents {
  recurrenceEvents {
    id
    detectedDate
    detectionMethod
    recurrenceType
    confirmedByBiopsy
    acknowledgedAt
    createdAt
  }
}
    `;

/**
 * __useGetRecurrenceEventsQuery__
 *
 * To run a query within a React component, call `useGetRecurrenceEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecurrenceEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecurrenceEventsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRecurrenceEventsQuery(baseOptions?: Apollo.QueryHookOptions<GetRecurrenceEventsQuery, GetRecurrenceEventsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecurrenceEventsQuery, GetRecurrenceEventsQueryVariables>(GetRecurrenceEventsDocument, options);
      }
export function useGetRecurrenceEventsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecurrenceEventsQuery, GetRecurrenceEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecurrenceEventsQuery, GetRecurrenceEventsQueryVariables>(GetRecurrenceEventsDocument, options);
        }
// @ts-ignore
export function useGetRecurrenceEventsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRecurrenceEventsQuery, GetRecurrenceEventsQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecurrenceEventsQuery, GetRecurrenceEventsQueryVariables>;
export function useGetRecurrenceEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecurrenceEventsQuery, GetRecurrenceEventsQueryVariables>): Apollo.UseSuspenseQueryResult<GetRecurrenceEventsQuery | undefined, GetRecurrenceEventsQueryVariables>;
export function useGetRecurrenceEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecurrenceEventsQuery, GetRecurrenceEventsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecurrenceEventsQuery, GetRecurrenceEventsQueryVariables>(GetRecurrenceEventsDocument, options);
        }
export type GetRecurrenceEventsQueryHookResult = ReturnType<typeof useGetRecurrenceEventsQuery>;
export type GetRecurrenceEventsLazyQueryHookResult = ReturnType<typeof useGetRecurrenceEventsLazyQuery>;
export type GetRecurrenceEventsSuspenseQueryHookResult = ReturnType<typeof useGetRecurrenceEventsSuspenseQuery>;
export type GetRecurrenceEventsQueryResult = Apollo.QueryResult<GetRecurrenceEventsQuery, GetRecurrenceEventsQueryVariables>;
export const GetGenomicComparisonDocument = gql`
    query GetGenomicComparison($recurrenceEventId: String!) {
  genomicComparison(recurrenceEventId: $recurrenceEventId) {
    hasNewData
    resistanceMutations
    biomarkerChanges
    actionableChanges
    patientSummary
    generatedAt
  }
}
    `;

/**
 * __useGetGenomicComparisonQuery__
 *
 * To run a query within a React component, call `useGetGenomicComparisonQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGenomicComparisonQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGenomicComparisonQuery({
 *   variables: {
 *      recurrenceEventId: // value for 'recurrenceEventId'
 *   },
 * });
 */
export function useGetGenomicComparisonQuery(baseOptions: Apollo.QueryHookOptions<GetGenomicComparisonQuery, GetGenomicComparisonQueryVariables> & ({ variables: GetGenomicComparisonQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGenomicComparisonQuery, GetGenomicComparisonQueryVariables>(GetGenomicComparisonDocument, options);
      }
export function useGetGenomicComparisonLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGenomicComparisonQuery, GetGenomicComparisonQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGenomicComparisonQuery, GetGenomicComparisonQueryVariables>(GetGenomicComparisonDocument, options);
        }
// @ts-ignore
export function useGetGenomicComparisonSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetGenomicComparisonQuery, GetGenomicComparisonQueryVariables>): Apollo.UseSuspenseQueryResult<GetGenomicComparisonQuery, GetGenomicComparisonQueryVariables>;
export function useGetGenomicComparisonSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGenomicComparisonQuery, GetGenomicComparisonQueryVariables>): Apollo.UseSuspenseQueryResult<GetGenomicComparisonQuery | undefined, GetGenomicComparisonQueryVariables>;
export function useGetGenomicComparisonSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGenomicComparisonQuery, GetGenomicComparisonQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGenomicComparisonQuery, GetGenomicComparisonQueryVariables>(GetGenomicComparisonDocument, options);
        }
export type GetGenomicComparisonQueryHookResult = ReturnType<typeof useGetGenomicComparisonQuery>;
export type GetGenomicComparisonLazyQueryHookResult = ReturnType<typeof useGetGenomicComparisonLazyQuery>;
export type GetGenomicComparisonSuspenseQueryHookResult = ReturnType<typeof useGetGenomicComparisonSuspenseQuery>;
export type GetGenomicComparisonQueryResult = Apollo.QueryResult<GetGenomicComparisonQuery, GetGenomicComparisonQueryVariables>;
export const GetSecondOpinionResourcesDocument = gql`
    query GetSecondOpinionResources {
  secondOpinionResources {
    name
    type
    description
    url
    virtual
  }
}
    `;

/**
 * __useGetSecondOpinionResourcesQuery__
 *
 * To run a query within a React component, call `useGetSecondOpinionResourcesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSecondOpinionResourcesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSecondOpinionResourcesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSecondOpinionResourcesQuery(baseOptions?: Apollo.QueryHookOptions<GetSecondOpinionResourcesQuery, GetSecondOpinionResourcesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSecondOpinionResourcesQuery, GetSecondOpinionResourcesQueryVariables>(GetSecondOpinionResourcesDocument, options);
      }
export function useGetSecondOpinionResourcesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSecondOpinionResourcesQuery, GetSecondOpinionResourcesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSecondOpinionResourcesQuery, GetSecondOpinionResourcesQueryVariables>(GetSecondOpinionResourcesDocument, options);
        }
// @ts-ignore
export function useGetSecondOpinionResourcesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSecondOpinionResourcesQuery, GetSecondOpinionResourcesQueryVariables>): Apollo.UseSuspenseQueryResult<GetSecondOpinionResourcesQuery, GetSecondOpinionResourcesQueryVariables>;
export function useGetSecondOpinionResourcesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSecondOpinionResourcesQuery, GetSecondOpinionResourcesQueryVariables>): Apollo.UseSuspenseQueryResult<GetSecondOpinionResourcesQuery | undefined, GetSecondOpinionResourcesQueryVariables>;
export function useGetSecondOpinionResourcesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSecondOpinionResourcesQuery, GetSecondOpinionResourcesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSecondOpinionResourcesQuery, GetSecondOpinionResourcesQueryVariables>(GetSecondOpinionResourcesDocument, options);
        }
export type GetSecondOpinionResourcesQueryHookResult = ReturnType<typeof useGetSecondOpinionResourcesQuery>;
export type GetSecondOpinionResourcesLazyQueryHookResult = ReturnType<typeof useGetSecondOpinionResourcesLazyQuery>;
export type GetSecondOpinionResourcesSuspenseQueryHookResult = ReturnType<typeof useGetSecondOpinionResourcesSuspenseQuery>;
export type GetSecondOpinionResourcesQueryResult = Apollo.QueryResult<GetSecondOpinionResourcesQuery, GetSecondOpinionResourcesQueryVariables>;
export const ReportRecurrenceDocument = gql`
    mutation ReportRecurrence($input: ReportRecurrenceInput!) {
  reportRecurrence(input: $input) {
    id
    patientId
    detectedDate
    detectionMethod
    recurrenceType
    recurrenceSites
    confirmedByBiopsy
    cascadeStatus {
      acknowledged
      supportOffered
      resequencingRecommended
      trialRematched
      financialRematched
      secondOpinionOffered
      careTeamUpdated
      translatorRegenerated
      planArchived
      pipelineActivated
      genomicComparisonReady
    }
    createdAt
  }
}
    `;
export type ReportRecurrenceMutationFn = Apollo.MutationFunction<ReportRecurrenceMutation, ReportRecurrenceMutationVariables>;

/**
 * __useReportRecurrenceMutation__
 *
 * To run a mutation, you first call `useReportRecurrenceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReportRecurrenceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reportRecurrenceMutation, { data, loading, error }] = useReportRecurrenceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useReportRecurrenceMutation(baseOptions?: Apollo.MutationHookOptions<ReportRecurrenceMutation, ReportRecurrenceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReportRecurrenceMutation, ReportRecurrenceMutationVariables>(ReportRecurrenceDocument, options);
      }
export type ReportRecurrenceMutationHookResult = ReturnType<typeof useReportRecurrenceMutation>;
export type ReportRecurrenceMutationResult = Apollo.MutationResult<ReportRecurrenceMutation>;
export type ReportRecurrenceMutationOptions = Apollo.BaseMutationOptions<ReportRecurrenceMutation, ReportRecurrenceMutationVariables>;
export const AcknowledgeRecurrenceDocument = gql`
    mutation AcknowledgeRecurrence($recurrenceEventId: String!) {
  acknowledgeRecurrence(recurrenceEventId: $recurrenceEventId) {
    id
    acknowledgedAt
    cascadeStatus {
      acknowledged
      supportOffered
      resequencingRecommended
      trialRematched
      financialRematched
      secondOpinionOffered
      careTeamUpdated
      translatorRegenerated
      planArchived
      pipelineActivated
      genomicComparisonReady
    }
  }
}
    `;
export type AcknowledgeRecurrenceMutationFn = Apollo.MutationFunction<AcknowledgeRecurrenceMutation, AcknowledgeRecurrenceMutationVariables>;

/**
 * __useAcknowledgeRecurrenceMutation__
 *
 * To run a mutation, you first call `useAcknowledgeRecurrenceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAcknowledgeRecurrenceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [acknowledgeRecurrenceMutation, { data, loading, error }] = useAcknowledgeRecurrenceMutation({
 *   variables: {
 *      recurrenceEventId: // value for 'recurrenceEventId'
 *   },
 * });
 */
export function useAcknowledgeRecurrenceMutation(baseOptions?: Apollo.MutationHookOptions<AcknowledgeRecurrenceMutation, AcknowledgeRecurrenceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AcknowledgeRecurrenceMutation, AcknowledgeRecurrenceMutationVariables>(AcknowledgeRecurrenceDocument, options);
      }
export type AcknowledgeRecurrenceMutationHookResult = ReturnType<typeof useAcknowledgeRecurrenceMutation>;
export type AcknowledgeRecurrenceMutationResult = Apollo.MutationResult<AcknowledgeRecurrenceMutation>;
export type AcknowledgeRecurrenceMutationOptions = Apollo.BaseMutationOptions<AcknowledgeRecurrenceMutation, AcknowledgeRecurrenceMutationVariables>;
export const UpdateCascadeStepDocument = gql`
    mutation UpdateCascadeStep($input: UpdateCascadeStepInput!) {
  updateCascadeStep(input: $input) {
    id
    cascadeStatus {
      acknowledged
      supportOffered
      resequencingRecommended
      trialRematched
      financialRematched
      secondOpinionOffered
      careTeamUpdated
      translatorRegenerated
      planArchived
      pipelineActivated
      genomicComparisonReady
    }
  }
}
    `;
export type UpdateCascadeStepMutationFn = Apollo.MutationFunction<UpdateCascadeStepMutation, UpdateCascadeStepMutationVariables>;

/**
 * __useUpdateCascadeStepMutation__
 *
 * To run a mutation, you first call `useUpdateCascadeStepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCascadeStepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCascadeStepMutation, { data, loading, error }] = useUpdateCascadeStepMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCascadeStepMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCascadeStepMutation, UpdateCascadeStepMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCascadeStepMutation, UpdateCascadeStepMutationVariables>(UpdateCascadeStepDocument, options);
      }
export type UpdateCascadeStepMutationHookResult = ReturnType<typeof useUpdateCascadeStepMutation>;
export type UpdateCascadeStepMutationResult = Apollo.MutationResult<UpdateCascadeStepMutation>;
export type UpdateCascadeStepMutationOptions = Apollo.BaseMutationOptions<UpdateCascadeStepMutation, UpdateCascadeStepMutationVariables>;
export const RegenerateTranslatorDocument = gql`
    mutation RegenerateTranslator($recurrenceEventId: String!) {
  regenerateTranslator(recurrenceEventId: $recurrenceEventId) {
    id
    cascadeStatus {
      acknowledged
      supportOffered
      resequencingRecommended
      trialRematched
      financialRematched
      secondOpinionOffered
      careTeamUpdated
      translatorRegenerated
      planArchived
      pipelineActivated
      genomicComparisonReady
    }
  }
}
    `;
export type RegenerateTranslatorMutationFn = Apollo.MutationFunction<RegenerateTranslatorMutation, RegenerateTranslatorMutationVariables>;

/**
 * __useRegenerateTranslatorMutation__
 *
 * To run a mutation, you first call `useRegenerateTranslatorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegenerateTranslatorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [regenerateTranslatorMutation, { data, loading, error }] = useRegenerateTranslatorMutation({
 *   variables: {
 *      recurrenceEventId: // value for 'recurrenceEventId'
 *   },
 * });
 */
export function useRegenerateTranslatorMutation(baseOptions?: Apollo.MutationHookOptions<RegenerateTranslatorMutation, RegenerateTranslatorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegenerateTranslatorMutation, RegenerateTranslatorMutationVariables>(RegenerateTranslatorDocument, options);
      }
export type RegenerateTranslatorMutationHookResult = ReturnType<typeof useRegenerateTranslatorMutation>;
export type RegenerateTranslatorMutationResult = Apollo.MutationResult<RegenerateTranslatorMutation>;
export type RegenerateTranslatorMutationOptions = Apollo.BaseMutationOptions<RegenerateTranslatorMutation, RegenerateTranslatorMutationVariables>;
export const ArchiveSurvivorshipPlanDocument = gql`
    mutation ArchiveSurvivorshipPlan {
  archiveSurvivorshipPlan
}
    `;
export type ArchiveSurvivorshipPlanMutationFn = Apollo.MutationFunction<ArchiveSurvivorshipPlanMutation, ArchiveSurvivorshipPlanMutationVariables>;

/**
 * __useArchiveSurvivorshipPlanMutation__
 *
 * To run a mutation, you first call `useArchiveSurvivorshipPlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveSurvivorshipPlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveSurvivorshipPlanMutation, { data, loading, error }] = useArchiveSurvivorshipPlanMutation({
 *   variables: {
 *   },
 * });
 */
export function useArchiveSurvivorshipPlanMutation(baseOptions?: Apollo.MutationHookOptions<ArchiveSurvivorshipPlanMutation, ArchiveSurvivorshipPlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ArchiveSurvivorshipPlanMutation, ArchiveSurvivorshipPlanMutationVariables>(ArchiveSurvivorshipPlanDocument, options);
      }
export type ArchiveSurvivorshipPlanMutationHookResult = ReturnType<typeof useArchiveSurvivorshipPlanMutation>;
export type ArchiveSurvivorshipPlanMutationResult = Apollo.MutationResult<ArchiveSurvivorshipPlanMutation>;
export type ArchiveSurvivorshipPlanMutationOptions = Apollo.BaseMutationOptions<ArchiveSurvivorshipPlanMutation, ArchiveSurvivorshipPlanMutationVariables>;
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