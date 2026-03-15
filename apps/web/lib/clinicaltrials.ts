import { TRIAL_SEARCH_TERMS, TRIAL_SYNC_STATUSES } from '@oncovax/shared';

const BASE_URL = 'https://clinicaltrials.gov/api/v2/studies';

// --- Types for CTG v2 response (only fields we use) ---

export interface CTGStudy {
  protocolSection: {
    identificationModule: {
      nctId: string;
      briefTitle: string;
      officialTitle?: string;
    };
    statusModule: {
      overallStatus: string;
      startDateStruct?: { date: string };
      completionDateStruct?: { date: string };
    };
    descriptionModule?: {
      briefSummary?: string;
      detailedDescription?: string;
    };
    eligibilityModule?: {
      eligibilityCriteria?: string;
      sex?: string;
      minimumAge?: string;
      maximumAge?: string;
    };
    armsInterventionsModule?: {
      interventions?: {
        type: string;
        name: string;
        description?: string;
      }[];
    };
    contactsLocationsModule?: {
      locations?: CTGLocation[];
    };
    sponsorCollaboratorsModule?: {
      leadSponsor?: {
        name: string;
        class?: string;
      };
    };
    designModule?: {
      phases?: string[];
      studyType?: string;
    };
  };
}

export interface CTGLocation {
  facility?: string;
  city?: string;
  state?: string;
  country?: string;
  geoPoint?: {
    lat: number;
    lon: number;
  };
  contacts?: {
    name?: string;
    email?: string;
    phone?: string;
  }[];
}

interface CTGResponse {
  studies: CTGStudy[];
  nextPageToken?: string;
  totalCount?: number;
}

const FIELDS = [
  'protocolSection.identificationModule',
  'protocolSection.statusModule',
  'protocolSection.descriptionModule',
  'protocolSection.eligibilityModule',
  'protocolSection.armsInterventionsModule',
  'protocolSection.contactsLocationsModule',
  'protocolSection.sponsorCollaboratorsModule',
  'protocolSection.designModule',
].join('|');

function buildSearchQuery(): string {
  return TRIAL_SEARCH_TERMS.map((term) => `"${term}"`).join(' OR ');
}

function buildStatusFilter(): string {
  const allStatuses = [
    ...TRIAL_SYNC_STATUSES.PRIMARY,
    ...TRIAL_SYNC_STATUSES.HISTORICAL,
  ];
  return allStatuses.join(',');
}

async function fetchPage(options: {
  pageToken?: string;
  pageSize?: number;
}): Promise<CTGResponse> {
  const { pageToken, pageSize = 50 } = options;

  const params = new URLSearchParams({
    'query.term': buildSearchQuery(),
    'filter.overallStatus': buildStatusFilter(),
    fields: FIELDS,
    pageSize: String(pageSize),
    format: 'json',
  });

  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(`${BASE_URL}?${params}`);

    if (res.status === 429 || res.status >= 500) {
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`CTG API ${res.status}, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    if (!res.ok) {
      throw new Error(`ClinicalTrials.gov API error: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as CTGResponse;
  }

  throw new Error('ClinicalTrials.gov API: max retries exceeded');
}

export async function* fetchAllStudies(
  pageSize = 50,
): AsyncGenerator<CTGStudy[], void, unknown> {
  let pageToken: string | undefined;

  do {
    const response = await fetchPage({ pageToken, pageSize });
    if (response.studies.length > 0) {
      yield response.studies;
    }
    pageToken = response.nextPageToken;
  } while (pageToken);
}

export async function fetchAllStudiesFlat(pageSize = 50): Promise<CTGStudy[]> {
  const all: CTGStudy[] = [];
  for await (const page of fetchAllStudies(pageSize)) {
    all.push(...page);
  }
  return all;
}
