export const INTAKE_PATHS = {
  UPLOAD: 'upload',
  MYCHART: 'mychart',
  MANUAL: 'manual',
} as const;

export const DOCUMENT_TYPES = {
  PATHOLOGY_REPORT: 'pathology_report',
  LAB_REPORT: 'lab_report',
  TREATMENT_SUMMARY: 'treatment_summary',
  IMAGING_REPORT: 'imaging_report',
  UNKNOWN: 'unknown',
} as const;

export const EXTRACTION_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const MATCH_STATUSES = {
  NEW: 'new',
  SAVED: 'saved',
  CONTACTED: 'contacted',
  APPLIED: 'applied',
  DISMISSED: 'dismissed',
} as const;

export const TRIAL_STATUSES = {
  RECRUITING: 'RECRUITING',
  NOT_YET_RECRUITING: 'NOT_YET_RECRUITING',
  ENROLLING_BY_INVITATION: 'ENROLLING_BY_INVITATION',
  ACTIVE_NOT_RECRUITING: 'ACTIVE_NOT_RECRUITING',
  COMPLETED: 'COMPLETED',
  WITHDRAWN: 'WITHDRAWN',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
} as const;

export const EVENT_NAMES = {
  APP_OPENED: 'app_opened',
  ANALYSIS_COMPLETED: 'analysis_completed',
  PAYWALL_SHOWN: 'paywall_shown',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  DAY1_RETAINED: 'day1_retained',
  DAY7_RETAINED: 'day7_retained',
  DAY30_RETAINED: 'day30_retained',
} as const;

export const TRIAL_SEARCH_TERMS = [
  'personalized cancer vaccine',
  'neoantigen vaccine',
  'mRNA cancer vaccine',
  'individualized cancer vaccine',
  'autogene cevumeran',
  'mRNA-4157',
  'personalized immunotherapy',
  'cancer mRNA',
  'neoantigen immunotherapy',
] as const;

export const TRIAL_SYNC_STATUSES = {
  PRIMARY: ['RECRUITING', 'NOT_YET_RECRUITING', 'ENROLLING_BY_INVITATION'] as const,
  HISTORICAL: ['ACTIVE_NOT_RECRUITING', 'COMPLETED'] as const,
} as const;

export const FINANCIAL_PROGRAM_TYPES = {
  COPAY_FOUNDATION: 'copay_foundation',
  PHARMA_PAP: 'pharma_pap',
  NONPROFIT_GRANT: 'nonprofit_grant',
  GOVERNMENT_PROGRAM: 'government_program',
  LODGING_PROGRAM: 'lodging_program',
  TRANSPORTATION_PROGRAM: 'transportation_program',
  GENERAL_ASSISTANCE: 'general_assistance',
} as const;

export const ASSISTANCE_CATEGORIES = {
  COPAY_TREATMENT: 'copay_treatment',
  COPAY_DIAGNOSTICS: 'copay_diagnostics',
  TRANSPORTATION: 'transportation',
  LODGING: 'lodging',
  LIVING_EXPENSES: 'living_expenses',
  FOOD: 'food',
  CHILDCARE: 'childcare',
  FREE_MEDICATION: 'free_medication',
  FERTILITY_PRESERVATION: 'fertility_preservation',
  MENTAL_HEALTH: 'mental_health',
  GENERAL_FINANCIAL: 'general_financial',
} as const;

export const FINANCIAL_MATCH_STATUSES = {
  ELIGIBLE: 'eligible',
  LIKELY_ELIGIBLE: 'likely_eligible',
  CHECK_ELIGIBILITY: 'check_eligibility',
  INELIGIBLE: 'ineligible',
} as const;

export const FINANCIAL_APPLICATION_STATUSES = {
  NEW: 'new',
  APPLIED: 'applied',
  APPROVED: 'approved',
  DENIED: 'denied',
} as const;

export const INSURANCE_TYPES = [
  'Commercial',
  'Medicare',
  'Medicaid',
  'Uninsured',
  'Other',
] as const;

export const INCOME_RANGES = [
  '$0 – $30,000',
  '$30,000 – $50,000',
  '$50,000 – $75,000',
  '$75,000 – $100,000',
  '$100,000+',
  'Prefer not to say',
] as const;
