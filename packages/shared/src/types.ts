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

export interface ExtractionPipelineResult {
  status: 'processing' | 'completed' | 'failed';
  profile?: PatientProfile;
  fieldSources?: Record<string, string>;
  fieldConfidence?: Record<string, number>;
  extractions?: DocumentExtractionResult[];
  claudeApiCost?: number;
  error?: string;
}
