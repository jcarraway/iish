import { Prisma, type PrismaClient } from '@oncovax/db/generated/prisma';
import type { ParsedEligibility } from '@oncovax/shared';
import { parsedEligibilitySchema } from '@oncovax/shared';
import { anthropic, CLAUDE_MODEL } from './ai';

const SYSTEM_PROMPT = `You are an expert oncology clinical trial eligibility criteria parser. Your task is to extract structured data from raw eligibility text.

Rules:
- Extract ONLY what is explicitly stated. Do not infer or assume criteria that aren't written.
- Normalize cancer type names to standard terms (e.g., "NSCLC" → "non-small cell lung cancer").
- For biomarkers and treatments, classify them as "required" (must have) or "excluded" (must NOT have).
- For ranges (age, ECOG, prior lines), use null for unspecified bounds.
- Set surgicalStatus to "unknown" if not mentioned.
- Confidence scoring rubric:
  - 0.9-1.0: Clear, well-structured criteria with standard medical terminology
  - 0.7-0.89: Mostly clear but some ambiguous or unusual phrasing
  - 0.5-0.69: Significant ambiguity, non-standard terms, or missing sections
  - 0.0-0.49: Very unclear, incomplete, or contradictory criteria

Examples:

INPUT: """
Inclusion Criteria:
- Histologically confirmed unresectable or metastatic melanoma (Stage III or IV)
- Age ≥ 18 years
- ECOG performance status 0-1
- Must have received prior anti-PD-1 therapy
- BRAF V600E/K mutation positive
- Adequate organ function: AST/ALT ≤ 2.5x ULN, creatinine ≤ 1.5x ULN

Exclusion Criteria:
- Prior treatment with any cancer vaccine
- Active autoimmune disease requiring systemic treatment
- Known brain metastases
"""

OUTPUT:
{
  "cancerTypes": [{"name": "melanoma", "normalized": "melanoma"}],
  "stages": ["Stage III", "Stage IV"],
  "priorTreatments": {
    "required": [{"name": "anti-PD-1 therapy", "type": "immunotherapy"}],
    "excluded": [{"name": "cancer vaccine", "type": "vaccine"}]
  },
  "biomarkers": {
    "required": [{"name": "BRAF V600E/K", "condition": "mutation positive"}],
    "excluded": []
  },
  "ageRange": {"min": 18, "max": null},
  "ecogRange": {"min": 0, "max": 1},
  "surgicalStatus": "unknown",
  "priorLinesOfTherapy": {"min": null, "max": null},
  "organFunction": {
    "requirements": [
      {"organ": "liver", "metric": "AST/ALT", "condition": "≤ 2.5x ULN"},
      {"organ": "kidney", "metric": "creatinine", "condition": "≤ 1.5x ULN"}
    ]
  },
  "geographicRestrictions": [],
  "exclusionConditions": ["active autoimmune disease requiring systemic treatment", "known brain metastases"],
  "otherKeyRequirements": ["histologically confirmed", "unresectable or metastatic"],
  "confidenceScore": 0.95
}

INPUT: """
Eligible patients must have histologically or cytologically confirmed diagnosis of locally advanced or metastatic colorectal cancer (CRC). Patients must have microsatellite instability-high (MSI-H) or mismatch repair deficient (dMMR) tumors. Must have completed at least 2 prior lines of systemic therapy. Age 18-75. ECOG 0-2. No prior mRNA-based therapies. Adequate hepatic function (bilirubin ≤ 1.5x ULN). No active infections.
"""

OUTPUT:
{
  "cancerTypes": [{"name": "colorectal cancer", "normalized": "colorectal cancer"}],
  "stages": ["locally advanced", "metastatic"],
  "priorTreatments": {
    "required": [],
    "excluded": [{"name": "mRNA-based therapies", "type": "other"}]
  },
  "biomarkers": {
    "required": [
      {"name": "MSI-H", "condition": "microsatellite instability-high"},
      {"name": "dMMR", "condition": "mismatch repair deficient"}
    ],
    "excluded": []
  },
  "ageRange": {"min": 18, "max": 75},
  "ecogRange": {"min": 0, "max": 2},
  "surgicalStatus": "unknown",
  "priorLinesOfTherapy": {"min": 2, "max": null},
  "organFunction": {
    "requirements": [
      {"organ": "liver", "metric": "bilirubin", "condition": "≤ 1.5x ULN"}
    ]
  },
  "geographicRestrictions": [],
  "exclusionConditions": ["active infections"],
  "otherKeyRequirements": ["histologically or cytologically confirmed"],
  "confidenceScore": 0.92
}

Respond ONLY with a valid JSON object. No markdown fences, no commentary.`;

export async function parseEligibility(rawText: string): Promise<ParsedEligibility> {
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    messages: [
      { role: 'user', content: `Parse the following clinical trial eligibility criteria:\n\n"""${rawText}"""` },
    ],
    system: SYSTEM_PROMPT,
  });

  const text = (message.content[0] as { type: 'text'; text: string }).text;
  const clean = text.replace(/```json\n?|```\n?/g, '').trim();
  const parsed = JSON.parse(clean);
  return parsedEligibilitySchema.parse(parsed);
}

export async function parseTrialEligibility(
  trialId: string,
  db: PrismaClient,
): Promise<ParsedEligibility | null> {
  const trial = await db.trial.findUnique({
    where: { id: trialId },
    select: { rawEligibilityText: true },
  });

  if (!trial?.rawEligibilityText) return null;

  const parsed = await parseEligibility(trial.rawEligibilityText);

  await db.trial.update({
    where: { id: trialId },
    data: { parsedEligibility: JSON.parse(JSON.stringify(parsed)) },
  });

  return parsed;
}

export interface ParseBatchResult {
  parsed: number;
  failed: number;
  errors: { trialId: string; nctId: string; error: string }[];
}

export async function parseAllUnparsedTrials(
  db: PrismaClient,
  options?: { delayMs?: number; onProgress?: (msg: string) => void },
): Promise<ParseBatchResult> {
  const delayMs = options?.delayMs ?? 1000;
  const log = options?.onProgress ?? console.log;

  const trials = await db.trial.findMany({
    where: {
      parsedEligibility: { equals: Prisma.DbNull },
      rawEligibilityText: { not: '' },
    },
    select: { id: true, nctId: true, rawEligibilityText: true },
  });

  log(`Found ${trials.length} trials to parse`);

  const result: ParseBatchResult = { parsed: 0, failed: 0, errors: [] };

  for (const trial of trials) {
    try {
      log(`Parsing ${trial.nctId} (${result.parsed + result.failed + 1}/${trials.length})...`);

      const parsed = await parseEligibility(trial.rawEligibilityText!);

      await db.trial.update({
        where: { id: trial.id },
        data: { parsedEligibility: JSON.parse(JSON.stringify(parsed)) },
      });

      result.parsed++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push({ trialId: trial.id, nctId: trial.nctId, error: message });
      result.failed++;
      log(`Failed to parse ${trial.nctId}: ${message}`);
    }

    // Rate limiting delay between requests
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  log(`Parse complete: ${result.parsed} parsed, ${result.failed} failed`);
  return result;
}
