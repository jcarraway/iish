import { analyzeMultipleImages } from './ai';
import { genomicReportExtractionSchema } from '@oncovax/shared';
import type { GenomicReportExtraction } from '@oncovax/shared';

const INPUT_COST_PER_TOKEN = 0.000015;
const OUTPUT_COST_PER_TOKEN = 0.000075;

function estimateCost(inputTokens: number, outputTokens: number): number {
  return inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;
}

const GENOMIC_EXTRACTION_SYSTEM = `You are an expert genomic report reader specializing in comprehensive genomic profiling (CGP) reports from Foundation Medicine, Tempus, Guardant Health, Caris Life Sciences, and similar providers.

Given images of a genomic test report, extract ALL structured data with high precision.

RULES:
- Extract EVERY genomic alteration listed, including Variants of Unknown Significance (VUS)
- Preserve exact notation (e.g., "PIK3CA H1047R", "EGFR L858R", "BRAF V600E")
- Extract TMB value WITH unit (e.g., "8.2 mut/Mb")
- Extract MSI status (MSS, MSI-Low, MSI-High) and score if available
- Extract PD-L1 scores: TPS (Tumor Proportion Score) and CPS (Combined Positive Score) if present
- Extract LOH and HRD status/scores if present
- Extract ALL germline findings if a germline section exists
- Extract report-provided therapy matches (FDA-approved therapies, clinical trials mentioned)
- For each alteration, classify the type: missense_mutation, amplification, deletion, fusion, rearrangement, frameshift, splice_site, truncation, or loss
- For clinical significance: Pathogenic, Likely pathogenic, VUS, Likely benign, Benign
- Assign a confidence score (0.0-1.0) for the overall extraction based on report clarity
- If a field is not present in the report, use null

Respond ONLY with valid JSON matching the requested schema.`;

export async function extractGenomicReport(
  imageUrls: string[]
): Promise<{ extraction: GenomicReportExtraction; cost: number }> {
  const result = await analyzeMultipleImages(
    imageUrls,
    GENOMIC_EXTRACTION_SYSTEM,
    `Extract all genomic data from this report. Return JSON matching this schema:
{
  "provider": "string - e.g., Foundation Medicine, Tempus, Guardant Health",
  "testName": "string - e.g., FoundationOne CDx, xT, Guardant360",
  "reportDate": "string YYYY-MM-DD or null",
  "specimenDate": "string YYYY-MM-DD or null",
  "specimenType": "string - e.g., Tissue biopsy, Liquid biopsy, or null",
  "genomicAlterations": [{
    "gene": "string - gene symbol",
    "alteration": "string - specific alteration",
    "alterationType": "string - missense_mutation|amplification|deletion|fusion|rearrangement|frameshift|splice_site|truncation|loss",
    "variantAlleleFrequency": "number 0-1 or null",
    "clinicalSignificance": "string - Pathogenic|Likely pathogenic|VUS|Likely benign|Benign",
    "therapyImplications": {
      "approvedTherapies": ["string - FDA-approved targeted therapies"],
      "clinicalTrials": ["string - relevant clinical trials mentioned"],
      "resistanceMutations": ["string - known resistance implications"]
    },
    "confidence": "number 0-1"
  }],
  "biomarkers": {
    "tmb": {"value": "number", "unit": "string", "status": "string - Low|Intermediate|High"} or null,
    "msi": {"status": "string - MSS|MSI-Low|MSI-High", "score": "number or null"} or null,
    "pdl1": {"tps": "number 0-100 or null", "cps": "number or null"} or null,
    "loh": {"status": "string"} or null,
    "hrd": {"score": "number or null", "status": "string"} or null
  },
  "germlineFindings": [{"gene": "string", "variant": "string", "significance": "string"}] or null,
  "reportTherapyMatches": [{"therapy": "string", "evidence": "string", "gene": "string"}],
  "extractionConfidence": "number 0-1"
}`
  );

  const clean = result.text.replace(/```json\n?|```\n?/g, '').trim();
  const parsed = JSON.parse(clean);
  const extraction = genomicReportExtractionSchema.parse(parsed);

  return {
    extraction,
    cost: estimateCost(result.inputTokens, result.outputTokens),
  };
}
