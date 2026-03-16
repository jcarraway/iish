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

export const FHIR_SCOPES = [
  'patient/Patient.read',
  'patient/Condition.read',
  'patient/DiagnosticReport.read',
  'patient/Observation.read',
  'patient/MedicationRequest.read',
  'patient/Procedure.read',
  'launch/patient',
  'openid',
  'fhirUser',
] as const;

export const FHIR_SYNC_STATUSES = {
  PENDING: 'pending',
  CONNECTED: 'connected',
  SYNCED: 'synced',
  TOKEN_EXPIRED: 'token_expired',
  REVOKED: 'revoked',
  ERROR: 'error',
} as const;

export const BIOMARKER_LOINCS: Record<string, string> = {
  '85337-4': 'erStatus',
  '85339-0': 'prStatus',
  '85319-2': 'her2Ihc',
  '85318-4': 'her2Fish',
  '85329-1': 'ki67',
  '85147-7': 'pdl1',
  '94076-7': 'tmb',
  '81695-9': 'msi',
} as const;

export const LAB_LOINCS: Record<string, string> = {
  '751-8': 'anc',
  '777-3': 'platelets',
  '718-7': 'hemoglobin',
  '2160-0': 'creatinine',
  '1920-8': 'ast',
  '1742-6': 'alt',
  '1975-2': 'bilirubin',
  '1751-7': 'albumin',
} as const;

export const SEQUENCING_TEST_TYPES = {
  CGP: 'comprehensive_genomic_profiling',
  TARGETED_PANEL: 'targeted_panel',
  WES: 'whole_exome_sequencing',
  WGS: 'whole_genome_sequencing',
  LIQUID_BIOPSY: 'liquid_biopsy',
  RNA_SEQ: 'rna_sequencing',
  MSI_TMB: 'msi_tmb_testing',
} as const;

export const SEQUENCING_PROVIDER_TYPES = {
  COMMERCIAL: 'commercial',
  ACADEMIC: 'academic',
  EMERGING: 'emerging',
} as const;

export const SEQUENCING_ORDER_STATUSES = {
  PENDING: 'pending',
  INSURANCE_CHECK: 'insurance_check',
  PRIOR_AUTH: 'prior_auth',
  SAMPLE_NEEDED: 'sample_needed',
  SAMPLE_RECEIVED: 'sample_received',
  PROCESSING: 'processing',
  RESULTS_READY: 'results_ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const INSURANCE_COVERAGE_STATUSES = {
  COVERED: 'covered',
  LIKELY_COVERED: 'likely_covered',
  PRIOR_AUTH_REQUIRED: 'prior_auth_required',
  NOT_COVERED: 'not_covered',
  UNKNOWN: 'unknown',
} as const;

export const CPT_CODES: Record<string, { code: string; description: string }> = {
  CGP_SOLID: { code: '81455', description: 'Comprehensive genomic profiling, solid tumor' },
  CGP_HEME: { code: '81456', description: 'Comprehensive genomic profiling, hematologic' },
  TARGETED_PANEL: { code: '81445', description: 'Targeted genomic sequence analysis panel, solid organ neoplasm, 5-50 genes' },
  LIQUID_BIOPSY: { code: '81479', description: 'Unlisted molecular pathology procedure (liquid biopsy)' },
  MSI: { code: '81301', description: 'Microsatellite instability analysis' },
  TMB: { code: '81479', description: 'Tumor mutational burden' },
  PD_L1: { code: '88360', description: 'PD-L1 immunohistochemistry' },
} as const;

export const NGS_INSURERS = [
  'Medicare',
  'UnitedHealthcare',
  'Aetna',
  'Cigna',
  'BCBS',
  'Humana',
  'Medicaid',
] as const;
