import { BIOMARKER_LOINCS, LAB_LOINCS } from '@iish/shared';
import { FhirClient, FhirError } from './client';
import type {
  FhirCondition,
  FhirObservation,
  FhirMedicationRequest,
  FhirProcedure,
} from './types';

export interface RawFhirData {
  conditions: FhirCondition[];
  biomarkerObservations: FhirObservation[];
  labObservations: FhirObservation[];
  medicationRequests: FhirMedicationRequest[];
  procedures: FhirProcedure[];
  errors: { resourceType: string; error: string }[];
}

// Pull all relevant FHIR resources in parallel
export async function extractFhirResources(client: FhirClient, patientId: string): Promise<RawFhirData> {
  const errors: { resourceType: string; error: string }[] = [];

  const safeSearch = async <T>(
    resourceType: string,
    fn: () => Promise<T[]>,
  ): Promise<T[]> => {
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof FhirError
        ? `${err.statusCode}: ${err.message}`
        : err instanceof Error ? err.message : 'Unknown error';
      errors.push({ resourceType, error: message });
      return [];
    }
  };

  // Run all extractions in parallel
  const [conditions, biomarkerObs, labObs, medicationRequests, procedures] = await Promise.all([
    // 1. Conditions — filter for neoplasm ICD-10 codes
    safeSearch('Condition', () =>
      client.searchResources<FhirCondition>('Condition', {
        patient: patientId,
        category: 'encounter-diagnosis',
      }),
    ),

    // 2. Biomarker observations — one query per LOINC code (most recent)
    safeSearch('Observation (biomarkers)', async () => {
      const loincCodes = Object.keys(BIOMARKER_LOINCS);
      const results = await Promise.allSettled(
        loincCodes.map(code =>
          client.searchResources<FhirObservation>('Observation', {
            patient: patientId,
            code: code,
            _sort: '-date',
            _count: '1',
          }),
        ),
      );
      return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
    }),

    // 3. Lab observations
    safeSearch('Observation (labs)', async () => {
      const loincCodes = Object.keys(LAB_LOINCS);
      const results = await Promise.allSettled(
        loincCodes.map(code =>
          client.searchResources<FhirObservation>('Observation', {
            patient: patientId,
            code: code,
            _sort: '-date',
            _count: '1',
          }),
        ),
      );
      return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
    }),

    // 4. Medication requests
    safeSearch('MedicationRequest', () =>
      client.searchResources<FhirMedicationRequest>('MedicationRequest', {
        patient: patientId,
        status: 'active,completed',
      }),
    ),

    // 5. Procedures
    safeSearch('Procedure', () =>
      client.searchResources<FhirProcedure>('Procedure', {
        patient: patientId,
        status: 'completed',
      }),
    ),
  ]);

  // Filter conditions to neoplasm range (ICD-10 C00-D49)
  const oncologyConditions = conditions.filter(c => {
    const icd10 = c.code?.coding?.find(
      coding => coding.system?.includes('icd-10') || coding.system?.includes('icd10'),
    );
    if (!icd10?.code) return false;
    const prefix = icd10.code.charAt(0);
    return prefix === 'C' || (prefix === 'D' && parseInt(icd10.code.substring(1, 3)) <= 49);
  });

  return {
    conditions: oncologyConditions,
    biomarkerObservations: biomarkerObs,
    labObservations: labObs,
    medicationRequests,
    procedures,
    errors,
  };
}
