import { redis } from './redis';
import { generatePresignedDownloadUrl } from './s3';
import { analyzeMultipleImages } from './ai';
import {
  pathologyExtractionSchema,
  labExtractionSchema,
  treatmentExtractionSchema,
  DOCUMENT_TYPES,
} from '@iish/shared';
import type {
  PatientProfile,
  DocumentExtractionResult,
  PathologyExtraction,
  LabExtraction,
  TreatmentExtraction,
  ExtractionPipelineResult,
} from '@iish/shared';

// --- Cost estimation ---
// Approximate pricing per token (Claude Opus)
const INPUT_COST_PER_TOKEN = 0.000015;
const OUTPUT_COST_PER_TOKEN = 0.000075;

function estimateCost(inputTokens: number, outputTokens: number): number {
  return inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;
}

// --- Document type detection ---

const DETECT_TYPE_SYSTEM = `You are an expert medical document classifier. Given an image of a medical document, classify it as one of:
- pathology_report: Pathology/biopsy reports with cancer diagnosis, staging, histology
- lab_report: Laboratory test results, blood work, biomarker panels
- treatment_summary: Treatment plans, chemotherapy records, clinical notes about therapy
- unknown: Cannot determine document type

Respond ONLY with a JSON object: {"documentType": "...", "confidence": 0.0-1.0}`;

export async function detectDocumentType(
  imageUrls: string[]
): Promise<{ documentType: string; confidence: number }> {
  const result = await analyzeMultipleImages(
    [imageUrls[0]], // Only need first page for classification
    DETECT_TYPE_SYSTEM,
    'Classify this medical document. Return JSON only.'
  );
  const clean = result.text.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(clean);
}

// --- Pathology extractor ---

const PATHOLOGY_SYSTEM = `You are an expert oncology pathology report reader. Extract structured clinical data from this pathology report image(s).

RULES:
- Extract ONLY what is explicitly stated in the document
- NEVER guess or infer values not present in the text
- For each field, assign a confidence score (0.0-1.0) based on how clearly the value is stated
- If a field is not found, omit it from the extraction (do not include null values)
- Normalize cancer types to standard terms (e.g., "Invasive ductal carcinoma" → "breast")
- Stage should use AJCC format if available (e.g., "IIA", "IIIB")

Return a JSON object with two keys:
1. "extraction": matching this schema:
{
  "cancerType": "string - as stated in document",
  "cancerTypeNormalized": "string - normalized: breast, lung, melanoma, colorectal, pancreatic, ovarian, prostate, etc.",
  "stage": "string - AJCC stage",
  "histologicalGrade": "string - e.g., Grade 2, Well differentiated",
  "receptorStatus": {
    "er": {"status": "positive/negative", "percentage": number},
    "pr": {"status": "positive/negative", "percentage": number},
    "her2": {"status": "positive/negative/equivocal", "method": "IHC/FISH"}
  },
  "biomarkers": {"name": "value"},
  "specimenDate": "YYYY-MM-DD",
  "facility": "string"
}
2. "fieldConfidence": {"fieldName": 0.0-1.0} for each extracted field

EXAMPLE:
{"extraction": {"cancerType": "Invasive ductal carcinoma", "cancerTypeNormalized": "breast", "stage": "IIA", "receptorStatus": {"er": {"status": "positive", "percentage": 95}, "pr": {"status": "positive", "percentage": 80}, "her2": {"status": "negative", "method": "IHC"}}}, "fieldConfidence": {"cancerType": 0.95, "cancerTypeNormalized": 0.95, "stage": 0.9, "receptorStatus": 0.85}}`;

export async function extractPathologyReport(
  imageUrls: string[]
): Promise<{ extraction: PathologyExtraction; fieldConfidence: Record<string, number>; cost: number }> {
  const result = await analyzeMultipleImages(
    imageUrls,
    PATHOLOGY_SYSTEM,
    'Extract all pathology data from these document page(s). Return JSON only.'
  );
  const clean = result.text.replace(/```json\n?|```\n?/g, '').trim();
  const parsed = JSON.parse(clean);
  const extraction = pathologyExtractionSchema.parse(parsed.extraction);
  return {
    extraction,
    fieldConfidence: parsed.fieldConfidence ?? {},
    cost: estimateCost(result.inputTokens, result.outputTokens),
  };
}

// --- Lab report extractor ---

const LAB_SYSTEM = `You are an expert at reading laboratory test results. Extract structured data from this lab report image(s).

RULES:
- Extract ONLY values explicitly shown in the document
- Include units with biomarker values where shown (e.g., "WBC": "5.2 x10^3/uL")
- For each field, assign a confidence score (0.0-1.0)

Return a JSON object with:
1. "extraction": {"biomarkers": {"testName": "value with units"}, "testDate": "YYYY-MM-DD", "labName": "string"}
2. "fieldConfidence": {"fieldName": 0.0-1.0}`;

export async function extractLabReport(
  imageUrls: string[]
): Promise<{ extraction: LabExtraction; fieldConfidence: Record<string, number>; cost: number }> {
  const result = await analyzeMultipleImages(
    imageUrls,
    LAB_SYSTEM,
    'Extract all lab values from these document page(s). Return JSON only.'
  );
  const clean = result.text.replace(/```json\n?|```\n?/g, '').trim();
  const parsed = JSON.parse(clean);
  const extraction = labExtractionSchema.parse(parsed.extraction);
  return {
    extraction,
    fieldConfidence: parsed.fieldConfidence ?? {},
    cost: estimateCost(result.inputTokens, result.outputTokens),
  };
}

// --- Treatment summary extractor ---

const TREATMENT_SYSTEM = `You are an expert at reading oncology treatment summaries and clinical notes. Extract structured treatment data from this document image(s).

RULES:
- Extract ONLY treatments explicitly mentioned
- Classify treatment type as: chemotherapy, immunotherapy, radiation, surgery, targeted_therapy, hormone_therapy, other
- Response values: complete_response, partial_response, stable_disease, progressive_disease, unknown
- ECOG performance status if mentioned (0-5 scale)

Return a JSON object with:
1. "extraction": {"treatments": [{"name": "string", "type": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "response": "string"}], "ecogStatus": number}
2. "fieldConfidence": {"fieldName": 0.0-1.0}`;

export async function extractTreatmentSummary(
  imageUrls: string[]
): Promise<{ extraction: TreatmentExtraction; fieldConfidence: Record<string, number>; cost: number }> {
  const result = await analyzeMultipleImages(
    imageUrls,
    TREATMENT_SYSTEM,
    'Extract all treatment information from these document page(s). Return JSON only.'
  );
  const clean = result.text.replace(/```json\n?|```\n?/g, '').trim();
  const parsed = JSON.parse(clean);
  const extraction = treatmentExtractionSchema.parse(parsed.extraction);
  return {
    extraction,
    fieldConfidence: parsed.fieldConfidence ?? {},
    cost: estimateCost(result.inputTokens, result.outputTokens),
  };
}

// --- Merge extractions into a PatientProfile ---

export function mergeExtractionsIntoProfile(
  extractions: DocumentExtractionResult[]
): {
  profile: PatientProfile;
  fieldSources: Record<string, string>;
  fieldConfidence: Record<string, number>;
} {
  const profile: PatientProfile = {};
  const fieldSources: Record<string, string> = {};
  const fieldConfidence: Record<string, number> = {};

  for (const ext of extractions) {
    const docType = ext.documentType;
    const conf = ext.fieldConfidence;

    if (docType === DOCUMENT_TYPES.PATHOLOGY_REPORT) {
      const data = ext.extraction as PathologyExtraction;
      if (data.cancerType && (!profile.cancerType || (conf.cancerType ?? 0) > (fieldConfidence.cancerType ?? 0))) {
        profile.cancerType = data.cancerType;
        fieldSources.cancerType = docType;
        fieldConfidence.cancerType = conf.cancerType ?? 0;
      }
      if (data.cancerTypeNormalized) {
        profile.cancerTypeNormalized = data.cancerTypeNormalized;
        fieldSources.cancerTypeNormalized = docType;
        fieldConfidence.cancerTypeNormalized = conf.cancerTypeNormalized ?? 0;
      }
      if (data.stage && (!profile.stage || (conf.stage ?? 0) > (fieldConfidence.stage ?? 0))) {
        profile.stage = data.stage;
        fieldSources.stage = docType;
        fieldConfidence.stage = conf.stage ?? 0;
      }
      if (data.histologicalGrade) {
        profile.histologicalGrade = data.histologicalGrade;
        fieldSources.histologicalGrade = docType;
        fieldConfidence.histologicalGrade = conf.histologicalGrade ?? 0;
      }
      if (data.receptorStatus) {
        profile.receptorStatus = data.receptorStatus;
        fieldSources.receptorStatus = docType;
        fieldConfidence.receptorStatus = conf.receptorStatus ?? 0;
      }
      if (data.biomarkers) {
        profile.biomarkers = { ...profile.biomarkers, ...data.biomarkers };
        fieldSources.biomarkers = docType;
        fieldConfidence.biomarkers = conf.biomarkers ?? 0;
      }
    }

    if (docType === DOCUMENT_TYPES.LAB_REPORT) {
      const data = ext.extraction as LabExtraction;
      if (data.biomarkers) {
        profile.biomarkers = { ...profile.biomarkers, ...data.biomarkers };
        fieldSources.biomarkers = fieldSources.biomarkers
          ? `${fieldSources.biomarkers},${docType}`
          : docType;
      }
    }

    if (docType === DOCUMENT_TYPES.TREATMENT_SUMMARY) {
      const data = ext.extraction as TreatmentExtraction;
      if (data.treatments?.length) {
        profile.priorTreatments = [
          ...(profile.priorTreatments ?? []),
          ...data.treatments,
        ];
        fieldSources.priorTreatments = docType;
        fieldConfidence.priorTreatments = conf.treatments ?? 0;
      }
      if (data.ecogStatus != null) {
        profile.ecogStatus = data.ecogStatus;
        fieldSources.ecogStatus = docType;
        fieldConfidence.ecogStatus = conf.ecogStatus ?? 0;
      }
    }
  }

  return { profile, fieldSources, fieldConfidence };
}

// --- Pipeline orchestrator ---

export async function runExtractionPipeline(
  extractionId: string,
  s3Keys: string[],
  mimeTypes: string[]
): Promise<ExtractionPipelineResult> {
  const redisKey = `extraction:${extractionId}`;

  try {
    await redis.setex(redisKey, 3600, JSON.stringify({ status: 'processing' }));

    // Generate presigned download URLs
    const imageUrls = await Promise.all(s3Keys.map((key) => generatePresignedDownloadUrl(key)));

    // Detect document type
    const { documentType } = await detectDocumentType(imageUrls);

    // Run appropriate extractor
    let extraction: PathologyExtraction | LabExtraction | TreatmentExtraction;
    let fieldConfidence: Record<string, number>;
    let totalCost = 0;
    let needsReview: string[] = [];
    let couldNotExtract: string[] = [];

    const resolvedType =
      documentType === DOCUMENT_TYPES.PATHOLOGY_REPORT
        ? DOCUMENT_TYPES.PATHOLOGY_REPORT
        : documentType === DOCUMENT_TYPES.LAB_REPORT
          ? DOCUMENT_TYPES.LAB_REPORT
          : documentType === DOCUMENT_TYPES.TREATMENT_SUMMARY
            ? DOCUMENT_TYPES.TREATMENT_SUMMARY
            : DOCUMENT_TYPES.PATHOLOGY_REPORT; // default to pathology

    if (resolvedType === DOCUMENT_TYPES.PATHOLOGY_REPORT) {
      const result = await extractPathologyReport(imageUrls);
      extraction = result.extraction;
      fieldConfidence = result.fieldConfidence;
      totalCost += result.cost;

      // Determine fields needing review (confidence < 0.8)
      for (const [field, conf] of Object.entries(fieldConfidence)) {
        if (conf < 0.5) couldNotExtract.push(field);
        else if (conf < 0.8) needsReview.push(field);
      }
    } else if (resolvedType === DOCUMENT_TYPES.LAB_REPORT) {
      const result = await extractLabReport(imageUrls);
      extraction = result.extraction;
      fieldConfidence = result.fieldConfidence;
      totalCost += result.cost;
    } else {
      const result = await extractTreatmentSummary(imageUrls);
      extraction = result.extraction;
      fieldConfidence = result.fieldConfidence;
      totalCost += result.cost;
    }

    const extractionResult: DocumentExtractionResult = {
      documentType: resolvedType,
      extraction,
      fieldConfidence,
      needsReview,
      couldNotExtract,
      rawText: '',
      qualityIssues: [],
    };

    // Merge into a PatientProfile
    const merged = mergeExtractionsIntoProfile([extractionResult]);

    const completed: ExtractionPipelineResult = {
      status: 'completed',
      profile: merged.profile,
      fieldSources: merged.fieldSources,
      fieldConfidence: merged.fieldConfidence,
      extractions: [extractionResult],
      claudeApiCost: totalCost,
    };

    await redis.setex(redisKey, 3600, JSON.stringify(completed));
    return completed;
  } catch (err) {
    const failed: ExtractionPipelineResult = {
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown extraction error',
    };
    await redis.setex(redisKey, 3600, JSON.stringify(failed));
    return failed;
  }
}
