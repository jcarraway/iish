// Minimal FHIR R4 resource types — only the fields we actually read

export interface FhirBundle<T = FhirResource> {
  resourceType: 'Bundle';
  type: string;
  total?: number;
  entry?: { resource: T; fullUrl?: string }[];
  link?: { relation: string; url: string }[];
}

export interface FhirResource {
  resourceType: string;
  id?: string;
}

export interface FhirCoding {
  system?: string;
  code?: string;
  display?: string;
}

export interface FhirCodeableConcept {
  coding?: FhirCoding[];
  text?: string;
}

export interface FhirReference {
  reference?: string;
  display?: string;
}

export interface FhirPeriod {
  start?: string;
  end?: string;
}

export interface FhirQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

// Condition (cancer diagnosis)
export interface FhirCondition extends FhirResource {
  resourceType: 'Condition';
  clinicalStatus?: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  code?: FhirCodeableConcept;
  bodySite?: FhirCodeableConcept[];
  subject?: FhirReference;
  onsetDateTime?: string;
  stage?: {
    summary?: FhirCodeableConcept;
    type?: FhirCodeableConcept;
  }[];
}

// Observation (biomarkers + labs)
export interface FhirObservation extends FhirResource {
  resourceType: 'Observation';
  status?: string;
  category?: FhirCodeableConcept[];
  code?: FhirCodeableConcept;
  subject?: FhirReference;
  effectiveDateTime?: string;
  valueQuantity?: FhirQuantity;
  valueCodeableConcept?: FhirCodeableConcept;
  valueString?: string;
  interpretation?: FhirCodeableConcept[];
}

// MedicationRequest (treatments)
export interface FhirMedicationRequest extends FhirResource {
  resourceType: 'MedicationRequest';
  status?: string;
  intent?: string;
  medicationCodeableConcept?: FhirCodeableConcept;
  medicationReference?: FhirReference;
  subject?: FhirReference;
  authoredOn?: string;
  dosageInstruction?: {
    text?: string;
    timing?: { repeat?: { boundsPeriod?: FhirPeriod } };
  }[];
}

// Procedure (surgeries)
export interface FhirProcedure extends FhirResource {
  resourceType: 'Procedure';
  status?: string;
  code?: FhirCodeableConcept;
  subject?: FhirReference;
  performedDateTime?: string;
  performedPeriod?: FhirPeriod;
  outcome?: FhirCodeableConcept;
  bodySite?: FhirCodeableConcept[];
}

// CapabilityStatement (for SMART discovery)
export interface FhirCapabilityStatement extends FhirResource {
  resourceType: 'CapabilityStatement';
  rest?: {
    mode: string;
    security?: {
      extension?: {
        url: string;
        extension?: { url: string; valueUri?: string }[];
      }[];
      service?: FhirCodeableConcept[];
    };
  }[];
}
