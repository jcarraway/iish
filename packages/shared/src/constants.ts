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
