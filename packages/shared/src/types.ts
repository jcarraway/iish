export interface SessionData {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

export interface PatientProfile {
  cancerType?: string;
  cancerTypeNormalized?: string;
  stage?: string;
  histologicalGrade?: string;
  receptorStatus?: {
    er?: { status: string; percentage?: number };
    pr?: { status: string; percentage?: number };
    her2?: { status: string; method?: string };
  };
  biomarkers?: Record<string, string>;
  priorTreatments?: {
    name: string;
    type: string;
    startDate?: string;
    endDate?: string;
    response?: string;
  }[];
  ecogStatus?: number;
  age?: number;
  zipCode?: string;
  genomicData?: {
    testProvider: string;
    testName: string;
    testDate: string | null;
    alterations: GenomicAlteration[];
    biomarkers: GenomicBiomarkers;
    germlineFindings: GermlineFinding[] | null;
  };
}

export interface ParsedEligibility {
  cancerTypes: { name: string; normalized: string }[];
  stages: string[];
  priorTreatments: {
    required: { name: string; type: string }[];
    excluded: { name: string; type: string }[];
  };
  biomarkers: {
    required: { name: string; condition: string }[];
    excluded: { name: string; condition: string }[];
  };
  ageRange: { min: number | null; max: number | null };
  ecogRange: { min: number | null; max: number | null };
  surgicalStatus: 'pre_surgery' | 'post_surgery' | 'either' | 'unknown';
  priorLinesOfTherapy: { min: number | null; max: number | null };
  organFunction: {
    requirements: { organ: string; metric: string; condition: string }[];
  };
  geographicRestrictions: string[];
  exclusionConditions: string[];
  otherKeyRequirements: string[];
  confidenceScore: number;
}

export interface MatchBreakdownItem {
  category: string;
  score: number;
  weight: number;
  status: 'match' | 'unknown' | 'mismatch';
  reason: string;
}

export interface LLMAssessment {
  overallAssessment: 'likely_eligible' | 'possibly_eligible' | 'likely_ineligible';
  reasoning: string;
  potentialBlockers: string[];
  missingInfo: string[];
  actionItems: string[];
}

export interface MatchResult {
  trialId: string;
  matchScore: number;
  matchBreakdown: MatchBreakdownItem[];
  potentialBlockers: string[];
  llmAssessment?: LLMAssessment;
  status: string;
}

export interface DocumentExtractionResult {
  documentType: string;
  extraction: PathologyExtraction | LabExtraction | TreatmentExtraction;
  fieldConfidence: Record<string, number>;
  needsReview: string[];
  couldNotExtract: string[];
  rawText: string;
  qualityIssues: string[];
}

export interface PathologyExtraction {
  cancerType?: string;
  cancerTypeNormalized?: string;
  stage?: string;
  histologicalGrade?: string;
  receptorStatus?: {
    er?: { status: string; percentage?: number };
    pr?: { status: string; percentage?: number };
    her2?: { status: string; method?: string };
  };
  biomarkers?: Record<string, string>;
  specimenDate?: string;
  facility?: string;
}

export interface LabExtraction {
  biomarkers: Record<string, string>;
  testDate?: string;
  labName?: string;
}

export interface TreatmentExtraction {
  treatments: {
    name: string;
    type: string;
    startDate?: string;
    endDate?: string;
    response?: string;
  }[];
  ecogStatus?: number;
}

export interface DrugCard {
  name: string;
  genericName?: string;
  mechanism: string;
  whyThisDrug: string;
  commonSideEffects: { effect: string; timing: string; management: string }[];
  seriousSideEffects: string[];
  tips: string[];
}

export interface TimelinePhase {
  phase: string;
  duration: string;
  description: string;
  whatToExpect: string[];
}

export interface DoctorQuestion {
  question: string;
  whyItMatters: string;
}

export interface SecondOpinionTrigger {
  reason: string;
  level: 'worth_discussing' | 'informational';
}

export interface TreatmentTranslation {
  diagnosis: {
    summary: string;
    stageExplainer: string;
    subtypeExplainer: string;
    whatThisMeans: string;
  };
  treatmentPlan: {
    overview: string;
    drugs: DrugCard[];
    guidelineAlignment: string;
  };
  timeline: {
    overview: string;
    phases: TimelinePhase[];
  };
  questionsForDoctor: DoctorQuestion[];
  additionalConsiderations: {
    geneticTesting?: string;
    fertilityPreservation?: string;
    clinicalTrials?: string;
    mentalHealth?: string;
  };
  secondOpinionTriggers: SecondOpinionTrigger[];
  generatedAt: string;
}

export interface FinancialProfile {
  insuranceType?: string;
  householdSize?: number;
  householdIncome?: string;
  financialConcerns?: string[];
}

export interface FinancialProgramEligibility {
  cancerTypes: string[] | 'all';
  insuranceRequired: boolean | null;
  insuranceTypes: string[];
  incomeLimit: { fplPercentage: number | null };
  ageRange: { min: number | null; max: number | null };
  treatmentTypes: string[] | 'all';
  geographicRestrictions: string[];
  citizenshipRequired: boolean;
}

export interface FinancialMatchResult {
  programId: string;
  programName: string;
  organization: string;
  type: string;
  matchStatus: 'eligible' | 'likely_eligible' | 'check_eligibility' | 'ineligible';
  estimatedBenefit: string | null;
  matchReasoning: string;
  missingInfo: string[];
  status: string;
  maxBenefitAmount: number | null;
  benefitDescription: string | null;
  applicationProcess: string | null;
  applicationUrl: string | null;
  website: string;
  assistanceCategories: string[];
}

export interface ExtractionPipelineResult {
  status: 'processing' | 'completed' | 'failed';
  profile?: PatientProfile;
  fieldSources?: Record<string, string>;
  fieldConfidence?: Record<string, number>;
  extractions?: DocumentExtractionResult[];
  claudeApiCost?: number;
  error?: string;
}

// FHIR Integration Types

export interface FhirResourceSummary {
  resourceType: string;
  count: number;
  description: string;
  dateRange?: { earliest?: string; latest?: string };
}

export interface FhirExtractionResult {
  profile: Partial<PatientProfile>;
  fieldSources: Record<string, 'fhir'>;
  completeness: number;
  missingFields: string[];
  resourceSummary: FhirResourceSummary[];
  healthSystemName?: string;
  extractedAt: string;
}

export interface HealthSystemResult {
  id: string;
  name: string;
  fhirBaseUrl: string;
  brand?: string;
  logoUrl?: string;
  city?: string;
  state?: string;
  isCancerCenter: boolean;
  ehrVendor: string;
}

export interface FhirTokenPair {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
  tokenType: string;
}

export interface SmartEndpoints {
  authorizeUrl: string;
  tokenUrl: string;
  fhirBaseUrl: string;
}

// Sequencing Provider Directory Types

export interface SequencingProviderDetails {
  testNames: string[];
  geneCount: number;
  sampleTypes: string[];
  turnaroundDays: { min: number; max: number };
  costRange: { min: number; max: number };
  fdaApproved: boolean;
  fdaClearance?: string;
  orderingProcess: string;
  reportFormat: string;
  contactPhone?: string;
  contactEmail?: string;
  contactUrl?: string;
  clinicalUtility: string;
  limitations?: string;
}

export interface InsuranceCoverageResult {
  status: 'covered' | 'likely_covered' | 'prior_auth_required' | 'not_covered' | 'unknown';
  insurer: string;
  testType: string;
  reasoning: string;
  conditions: string[];
  cptCodes: string[];
  icdCodes?: string[];
  priorAuthRequired: boolean;
  estimatedOutOfPocket?: string;
  policyReference?: string;
  sourceUrl?: string;
  missingInfo: string[];
}

export interface LetterOfMedicalNecessity {
  content: string;
  patientName?: string;
  testType: string;
  providerName: string;
  cptCodes: string[];
  icdCodes: string[];
  nccnGuidelines: string;
  generatedAt: string;
}

export interface SequencingOncologistBrief {
  content: string;
  patientSummary: string;
  recommendedTests: string[];
  coverageSummary: string;
  generatedAt: string;
}

// Sequencing Journey Wizard Types

export interface SequencingRecommendation {
  level: 'strongly_recommended' | 'recommended' | 'optional' | 'not_typically_indicated';
  headline: string;
  personalizedReasoning: string;
  whatItCouldReveal: string[];
  howItHelpsRightNow: string;
  howItHelpsLater: string;
  guidelineRecommendation: string;
  generatedAt: string;
}

export interface SequencingExplanation {
  whatIsIt: string;
  howItWorks: string;
  whatItFinds: string;
  personalRelevance: string;
  commonConcerns: { concern: string; answer: string }[];
  generatedAt: string;
}

export interface TestRecommendation {
  primary: {
    providerId: string;
    providerName: string;
    testName: string;
    testType: string;
    geneCount: number;
    whyThisTest: string;
    sampleType: string;
    turnaroundDays: number;
    fdaApproved: boolean;
  };
  alternatives: {
    providerId: string;
    providerName: string;
    testName: string;
    geneCount: number;
    tradeoff: string;
  }[];
  reasoning: string;
  generatedAt: string;
}

export interface ConversationGuide {
  talkingPoints: { point: string; detail: string }[];
  questionsToAsk: { question: string; whyItMatters: string }[];
  emailTemplate: string;
  orderingInstructions: string;
  generatedAt: string;
}

export interface WaitingContent {
  cancerType: string;
  commonMutations: { name: string; frequency: string; significance: string; drugs: string[] }[];
  whatMutationsMean: string;
  clinicalTrialContext: string;
  timelineExpectations: string;
  generatedAt: string;
}

// --- Genomic Results Types ---

export interface GenomicAlteration {
  gene: string;
  alteration: string;
  alterationType: string;
  variantAlleleFrequency: number | null;
  clinicalSignificance: string;
  therapyImplications: {
    approvedTherapies: string[];
    clinicalTrials: string[];
    resistanceMutations: string[];
  };
  confidence: number;
}

export interface GenomicBiomarkers {
  tmb: { value: number; unit: string; status: string } | null;
  msi: { status: string; score: number | null } | null;
  pdl1: { tps: number | null; cps: number | null } | null;
  loh: { status: string } | null;
  hrd: { score: number | null; status: string } | null;
}

export interface GermlineFinding {
  gene: string;
  variant: string;
  significance: string;
}

export interface GenomicReportExtraction {
  provider: string;
  testName: string;
  reportDate: string | null;
  specimenDate: string | null;
  specimenType: string | null;
  genomicAlterations: GenomicAlteration[];
  biomarkers: GenomicBiomarkers;
  germlineFindings: GermlineFinding[] | null;
  reportTherapyMatches: { therapy: string; evidence: string; gene: string }[];
  extractionConfidence: number;
}

export interface GenomicInterpretation {
  summary: string;
  mutations: {
    gene: string;
    alteration: string;
    explanation: string;
    significance: 'actionable' | 'informational' | 'uncertain';
    availableTherapies: string[];
    relevantTrials: string[];
    prognosisImpact: string | null;
  }[];
  biomarkerProfile: {
    name: string;
    value: string;
    explanation: string;
    immunotherapyRelevance: string;
  }[];
  questionsForOncologist: { question: string; whyItMatters: string }[];
  generatedAt: string;
}

export interface MatchDelta {
  newMatches: { trialId: string; nctId: string; title: string; matchScore: number; genomicBasis: string }[];
  improvedMatches: { trialId: string; nctId: string; title: string; oldScore: number; newScore: number; genomicBasis: string }[];
  removedMatches: { trialId: string; nctId: string; title: string; reason: string }[];
  totalBefore: number;
  totalAfter: number;
}

// --- Pipeline Types ---

export interface PipelineJobSummary {
  id: string;
  status: string;
  currentStep: string | null;
  stepsCompleted: string[];
  inputFormat: string;
  referenceGenome: string;
  startedAt: string | null;
  completedAt: string | null;
  estimatedCompletion: string | null;
  createdAt: string;
}

export interface PipelineJobDetail extends PipelineJobSummary {
  tumorDataPath: string;
  normalDataPath: string;
  rnaDataPath: string | null;
  stepErrors: Record<string, string> | null;
  retryCount: number;
  maxRetries: number;
  alignedBamPath: string | null;
  vcfPath: string | null;
  annotatedVcfPath: string | null;
  peptideFilePath: string | null;
  variantCount: number | null;
  tmb: number | null;
  hlaGenotype: Record<string, string[]> | null;
  neoantigenCount: number | null;
  topNeoantigens: NeoantigenCandidateSummary[] | null;
  vaccineBlueprint: Record<string, unknown> | null;
  neoantigenReportPath: string | null;
  vaccineBlueprintPath: string | null;
  fullReportPdfPath: string | null;
  patientSummaryPath: string | null;
  totalComputeSeconds: number | null;
  estimatedCostUsd: number | null;
}

export interface PipelineProgressEvent {
  jobId: string;
  step: string;
  percentComplete: number;
  message: string;
}

export interface NeoantigenCandidateSummary {
  gene: string;
  mutation: string;
  mutantPeptide: string;
  hlaAllele: string;
  compositeScore: number;
  rank: number;
  confidence: string;
}
