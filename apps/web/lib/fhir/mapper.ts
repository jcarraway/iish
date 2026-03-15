import type { PatientProfile, FhirExtractionResult, FhirResourceSummary } from '@oncovax/shared';
import { BIOMARKER_LOINCS, LAB_LOINCS } from '@oncovax/shared';
import type { RawFhirData } from './extract-resources';
import {
  icd10ToCancerType,
  normalizeStage,
  rxnormToTreatment,
  snomedToSurgery,
  getCoding,
} from './code-maps';

// All fields we try to populate for trial matching
const TRIAL_MATCHING_FIELDS = [
  'cancerType', 'stage', 'histologicalGrade',
  'erStatus', 'prStatus', 'her2Status',
  'priorTreatments', 'ecogStatus', 'age',
] as const;

export function mapFhirToPatientProfile(
  rawData: RawFhirData,
  healthSystemName?: string,
): FhirExtractionResult {
  const profile: Partial<PatientProfile> = {};
  const fieldSources: Record<string, 'fhir'> = {};
  const resourceSummary: FhirResourceSummary[] = [];

  // 1. Map conditions → cancer diagnosis
  if (rawData.conditions.length > 0) {
    const primary = rawData.conditions[0]; // Most relevant condition
    const icd10 = getCoding(primary.code, 'icd-10') ?? getCoding(primary.code, 'icd10');

    if (icd10) {
      const cancerType = icd10ToCancerType(icd10.code);
      if (cancerType) {
        profile.cancerType = icd10.display ?? cancerType;
        profile.cancerTypeNormalized = cancerType;
        fieldSources.cancerType = 'fhir';
      }
    } else if (primary.code?.text) {
      profile.cancerType = primary.code.text;
      fieldSources.cancerType = 'fhir';
    }

    // Stage
    if (primary.stage?.[0]?.summary) {
      const stageText = primary.stage[0].summary.text
        ?? primary.stage[0].summary.coding?.[0]?.display
        ?? '';
      const normalized = normalizeStage(stageText);
      if (normalized) {
        profile.stage = normalized;
        fieldSources.stage = 'fhir';
      }
    }

    // Onset date
    if (primary.onsetDateTime) {
      fieldSources.dateOfDiagnosis = 'fhir';
    }

    resourceSummary.push({
      resourceType: 'Condition',
      count: rawData.conditions.length,
      description: `Your ${profile.cancerType ?? 'cancer'} diagnosis`,
      dateRange: primary.onsetDateTime ? { earliest: primary.onsetDateTime } : undefined,
    });
  }

  // 2. Map biomarker observations → receptor status + biomarkers
  if (rawData.biomarkerObservations.length > 0) {
    const biomarkers: Record<string, string> = {};
    const receptorStatus: PatientProfile['receptorStatus'] = {};
    const dates: string[] = [];

    for (const obs of rawData.biomarkerObservations) {
      const loincCode = obs.code?.coding?.find(c => c.system?.includes('loinc'))?.code;
      if (!loincCode) continue;

      const fieldName = BIOMARKER_LOINCS[loincCode];
      if (!fieldName) continue;

      if (obs.effectiveDateTime) dates.push(obs.effectiveDateTime);

      const value = extractObservationValue(obs);
      if (!value) continue;

      biomarkers[fieldName] = value;
      fieldSources[fieldName] = 'fhir';

      // Map to structured receptor status
      if (fieldName === 'erStatus') {
        receptorStatus.er = parseReceptorValue(value);
      } else if (fieldName === 'prStatus') {
        receptorStatus.pr = parseReceptorValue(value);
      } else if (fieldName === 'her2Ihc' || fieldName === 'her2Fish') {
        receptorStatus.her2 = {
          status: value.toLowerCase().includes('positive') ? 'positive' : 'negative',
          method: fieldName === 'her2Ihc' ? 'IHC' : 'FISH',
        };
      }
    }

    if (Object.keys(receptorStatus).length > 0) {
      profile.receptorStatus = receptorStatus;
      fieldSources.receptorStatus = 'fhir';
    }
    if (Object.keys(biomarkers).length > 0) {
      profile.biomarkers = biomarkers;
    }

    resourceSummary.push({
      resourceType: 'Observation',
      count: rawData.biomarkerObservations.length,
      description: 'Your biomarker test results (ER/PR/HER2, etc.)',
      dateRange: dates.length > 0
        ? { earliest: dates.sort()[0], latest: dates.sort().pop() }
        : undefined,
    });
  }

  // 3. Map lab observations → recent labs
  if (rawData.labObservations.length > 0) {
    const labBiomarkers = profile.biomarkers ?? {};
    const dates: string[] = [];

    for (const obs of rawData.labObservations) {
      const loincCode = obs.code?.coding?.find(c => c.system?.includes('loinc'))?.code;
      if (!loincCode) continue;

      const fieldName = LAB_LOINCS[loincCode];
      if (!fieldName) continue;

      if (obs.effectiveDateTime) dates.push(obs.effectiveDateTime);

      const value = extractObservationValue(obs);
      if (value) {
        labBiomarkers[fieldName] = value;
        fieldSources[`lab_${fieldName}`] = 'fhir';
      }
    }

    if (Object.keys(labBiomarkers).length > 0) {
      profile.biomarkers = labBiomarkers;
    }

    resourceSummary.push({
      resourceType: 'Observation (labs)',
      count: rawData.labObservations.length,
      description: 'Your recent lab values (CBC, metabolic panel)',
      dateRange: dates.length > 0
        ? { earliest: dates.sort()[0], latest: dates.sort().pop() }
        : undefined,
    });
  }

  // 4. Map medication requests → prior treatments
  if (rawData.medicationRequests.length > 0) {
    const treatments: NonNullable<PatientProfile['priorTreatments']> = [];
    const dates: string[] = [];

    for (const med of rawData.medicationRequests) {
      const rxnorm = getCoding(med.medicationCodeableConcept, 'rxnorm');
      const displayName = rxnorm?.display
        ?? med.medicationCodeableConcept?.text
        ?? med.medicationReference?.display;

      if (!displayName) continue;

      if (med.authoredOn) dates.push(med.authoredOn);

      const mapped = rxnorm ? rxnormToTreatment(rxnorm.code) : undefined;
      treatments.push({
        name: mapped?.name ?? displayName,
        type: mapped?.category ?? 'unknown',
        startDate: med.authoredOn,
      });
    }

    if (treatments.length > 0) {
      profile.priorTreatments = treatments;
      fieldSources.priorTreatments = 'fhir';
    }

    resourceSummary.push({
      resourceType: 'MedicationRequest',
      count: rawData.medicationRequests.length,
      description: 'Your cancer treatment medications',
      dateRange: dates.length > 0
        ? { earliest: dates.sort()[0], latest: dates.sort().pop() }
        : undefined,
    });
  }

  // 5. Map procedures → surgeries (stored in biomarkers for now)
  if (rawData.procedures.length > 0) {
    const dates: string[] = [];

    for (const proc of rawData.procedures) {
      const snomed = getCoding(proc.code, 'snomed');
      const surgeryType = snomed ? snomedToSurgery(snomed.code) : undefined;
      const name = surgeryType ?? proc.code?.text ?? snomed?.display;

      if (name && proc.performedDateTime) {
        dates.push(proc.performedDateTime);
        // Store surgeries as treatments with type "surgery"
        const surgeries = profile.priorTreatments ?? [];
        surgeries.push({
          name,
          type: 'surgery',
          startDate: proc.performedDateTime,
        });
        profile.priorTreatments = surgeries;
        fieldSources.priorTreatments = 'fhir';
      }
    }

    resourceSummary.push({
      resourceType: 'Procedure',
      count: rawData.procedures.length,
      description: 'Your surgical procedures',
      dateRange: dates.length > 0
        ? { earliest: dates.sort()[0], latest: dates.sort().pop() }
        : undefined,
    });
  }

  // Calculate completeness
  const filledFields = TRIAL_MATCHING_FIELDS.filter(f => {
    if (f === 'erStatus') return !!profile.receptorStatus?.er;
    if (f === 'prStatus') return !!profile.receptorStatus?.pr;
    if (f === 'her2Status') return !!profile.receptorStatus?.her2;
    return profile[f as keyof PatientProfile] !== undefined;
  });

  const completeness = filledFields.length / TRIAL_MATCHING_FIELDS.length;
  const missingFields = TRIAL_MATCHING_FIELDS.filter(f => !filledFields.includes(f));

  return {
    profile,
    fieldSources,
    completeness,
    missingFields: missingFields as string[],
    resourceSummary,
    healthSystemName,
    extractedAt: new Date().toISOString(),
  };
}

// Extract value from an Observation
function extractObservationValue(obs: {
  valueQuantity?: { value?: number; unit?: string };
  valueCodeableConcept?: { text?: string; coding?: { display?: string }[] };
  valueString?: string;
}): string | undefined {
  if (obs.valueQuantity?.value !== undefined) {
    return `${obs.valueQuantity.value}${obs.valueQuantity.unit ? ` ${obs.valueQuantity.unit}` : ''}`;
  }
  if (obs.valueCodeableConcept) {
    return obs.valueCodeableConcept.text ?? obs.valueCodeableConcept.coding?.[0]?.display;
  }
  return obs.valueString;
}

// Parse a receptor value string into structured form
function parseReceptorValue(value: string): { status: string; percentage?: number } {
  const isPositive = /positive|pos|\+/i.test(value);
  const percentMatch = value.match(/(\d+)\s*%/);
  return {
    status: isPositive ? 'positive' : 'negative',
    percentage: percentMatch ? parseInt(percentMatch[1]) : undefined,
  };
}
