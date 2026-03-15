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
  cancerTypes: string[];
  stages: string[];
  priorTreatments: {
    required: string[];
    excluded: string[];
  };
  biomarkers: {
    required: string[];
    excluded: string[];
  };
  ageRange: { min: number; max: number };
  ecogRange: { min: number; max: number };
  surgicalStatus: 'pre_surgery' | 'post_surgery' | 'either';
  priorLines: { min: number; max: number };
  organFunction: {
    liver: string[];
    kidney: string[];
    blood: string[];
  };
  geographicRestrictions: string[];
  exclusionConditions: string[];
  rawCriteria: string;
  confidenceScore: number;
}

export interface MatchResult {
  trialId: string;
  matchScore: number;
  matchBreakdown: {
    category: string;
    score: number;
    reason: string;
  }[];
  potentialBlockers: string[];
  status: string;
}

export interface DocumentExtractionResult {
  documentType: string;
  extraction: Record<string, unknown>;
  fieldConfidence: Record<string, number>;
  needsReview: string[];
  couldNotExtract: string[];
  rawText: string;
  qualityIssues: string[];
}
