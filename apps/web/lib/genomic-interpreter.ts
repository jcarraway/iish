import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import type { PatientProfile, GenomicReportExtraction, GenomicInterpretation } from '@iish/shared';

const CACHE_TTL = 24 * 60 * 60; // 24 hours

interface ClinicalGenomicGrounding {
  driverMutations: { gene: string; alteration: string; classification: 'driver' | 'passenger' | 'VUS'; reasoning: string }[];
  fdaApprovedTherapies: { gene: string; therapy: string; indication: string; evidenceLevel: string }[];
  prognosisImpact: { gene: string; impact: string }[];
  trialEligibilityImplications: { gene: string; implication: string }[];
  resistanceImplications: { gene: string; implication: string }[];
  germlineImplications: { gene: string; implication: string }[];
  biomarkerContext: { name: string; value: string; clinicalMeaning: string; immunotherapyRelevance: string }[];
}

const CLINICAL_GROUNDING_SYSTEM = `You are an expert molecular oncologist and genomics specialist. Given a patient's clinical profile and their genomic test results, provide a structured clinical grounding.

Be factual and evidence-based. For each genomic alteration:
- Classify as driver mutation, passenger mutation, or VUS
- List FDA-approved targeted therapies (with indication and evidence level)
- Assess prognosis impact
- Identify clinical trial eligibility implications
- Note resistance implications for current/planned treatment
- For germline findings, note hereditary syndrome and family testing implications

For biomarkers (TMB, MSI, PD-L1):
- Provide clinical context (what the value means)
- Immunotherapy relevance (checkpoint inhibitor eligibility)

Respond ONLY with valid JSON matching the requested schema.`;

const PATIENT_TRANSLATION_SYSTEM = `You are a medical translator who converts complex genomic test results into clear, honest explanations for an intelligent adult with no medical or genetics background.

Rules:
- Write at an 8th-grade reading level
- Be honest but not terrifying
- Use "you" and "your" — this is personal
- Never use the word "terminal" or "death"
- Explain what each mutation means in plain language (what the gene does, what the mutation changes)
- For actionable mutations, emphasize the positive: "this mutation means there are targeted drugs designed specifically for your cancer"
- For VUS, explain honestly: "we don't yet know if this change matters, but researchers are studying it"
- Frame biomarker values in practical terms (what it means for treatment, not just the number)
- Generate specific, practical questions for their oncologist visit
- Each question should include "why it matters" so the patient feels empowered

Respond ONLY with valid JSON matching the requested schema.`;

export async function generateGenomicInterpretation(
  profile: PatientProfile,
  genomicData: GenomicReportExtraction,
  patientId: string,
): Promise<GenomicInterpretation> {
  const cacheKey = `genomic-interp:${patientId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as GenomicInterpretation;
  }

  // Step 1: Clinical grounding
  const groundingResult = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: CLINICAL_GROUNDING_SYSTEM,
    messages: [{
      role: 'user',
      content: `Patient profile:
${JSON.stringify(profile, null, 2)}

Genomic test results:
${JSON.stringify(genomicData, null, 2)}

Provide clinical genomic grounding JSON with this schema:
{
  "driverMutations": [{"gene": "string", "alteration": "string", "classification": "driver|passenger|VUS", "reasoning": "string"}],
  "fdaApprovedTherapies": [{"gene": "string", "therapy": "string", "indication": "string", "evidenceLevel": "string"}],
  "prognosisImpact": [{"gene": "string", "impact": "string"}],
  "trialEligibilityImplications": [{"gene": "string", "implication": "string"}],
  "resistanceImplications": [{"gene": "string", "implication": "string"}],
  "germlineImplications": [{"gene": "string", "implication": "string"}],
  "biomarkerContext": [{"name": "string", "value": "string", "clinicalMeaning": "string", "immunotherapyRelevance": "string"}]
}`,
    }],
  });

  const groundingText = (groundingResult.content[0] as { type: 'text'; text: string }).text;
  const grounding: ClinicalGenomicGrounding = JSON.parse(
    groundingText.replace(/```json\n?|```\n?/g, '').trim()
  );

  // Step 2: Patient-facing translation
  const translationResult = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: PATIENT_TRANSLATION_SYSTEM,
    messages: [{
      role: 'user',
      content: `Clinical genomic grounding:
${JSON.stringify(grounding, null, 2)}

Patient profile:
${JSON.stringify(profile, null, 2)}

Genomic test results:
${JSON.stringify(genomicData, null, 2)}

Create a patient-facing genomic interpretation as JSON with this exact schema:
{
  "summary": "string - 2-3 sentence plain-language summary of their genomic results",
  "mutations": [{
    "gene": "string",
    "alteration": "string",
    "explanation": "string - what this gene does and what this mutation means, in plain language",
    "significance": "actionable|informational|uncertain",
    "availableTherapies": ["string - FDA-approved drugs for this mutation"],
    "relevantTrials": ["string - types of clinical trials this mutation qualifies for"],
    "prognosisImpact": "string or null - how this affects outlook"
  }],
  "biomarkerProfile": [{
    "name": "string - TMB, MSI, PD-L1, etc.",
    "value": "string - the actual value with units",
    "explanation": "string - what this number means in plain language",
    "immunotherapyRelevance": "string - what this means for immunotherapy options"
  }],
  "questionsForOncologist": [{
    "question": "string - specific question to ask",
    "whyItMatters": "string - why this question is important for their care"
  }],
  "generatedAt": "${new Date().toISOString()}"
}`,
    }],
  });

  const translationText = (translationResult.content[0] as { type: 'text'; text: string }).text;
  const interpretation: GenomicInterpretation = JSON.parse(
    translationText.replace(/```json\n?|```\n?/g, '').trim()
  );

  await redis.set(cacheKey, JSON.stringify(interpretation), 'EX', CACHE_TTL);

  return interpretation;
}
