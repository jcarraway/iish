import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import type { PatientProfile, SequencingRecommendation, SequencingExplanation } from '@oncovax/shared';

const CACHE_TTL = 24 * 60 * 60; // 24 hours

export function determineRecommendationLevel(
  profile: PatientProfile,
): SequencingRecommendation['level'] {
  const stage = (profile.stage ?? '').toUpperCase().replace('STAGE ', '');
  const cancerType = (profile.cancerType ?? profile.cancerTypeNormalized ?? '').toLowerCase();
  const receptors = profile.receptorStatus;
  const treatments = profile.priorTreatments ?? [];
  const age = profile.age;

  // Stage IV / metastatic
  if (stage === 'IV' || stage === 'IVA' || stage === 'IVB' || cancerType.includes('metastatic')) {
    return 'strongly_recommended';
  }

  // TNBC (ER-/PR-/HER2-)
  if (
    receptors?.er?.status?.toLowerCase() === 'negative' &&
    receptors?.pr?.status?.toLowerCase() === 'negative' &&
    receptors?.her2?.status?.toLowerCase() === 'negative'
  ) {
    return 'strongly_recommended';
  }

  // Progressed on standard therapy
  const hasProgression = treatments.some(
    t => t.response?.toLowerCase() === 'progression' || t.response?.toLowerCase() === 'progressed',
  );
  if (hasProgression) {
    return 'strongly_recommended';
  }

  // DCIS / stage 0
  if (stage === '0' || cancerType.includes('dcis') || cancerType.includes('carcinoma in situ')) {
    return 'not_typically_indicated';
  }

  // Early-stage ER+ good prognosis
  if (
    (stage === 'I' || stage === 'IA' || stage === 'IB') &&
    receptors?.er?.status?.toLowerCase() === 'positive' &&
    receptors?.her2?.status?.toLowerCase() !== 'positive'
  ) {
    return 'optional';
  }

  // Stage II-III
  if (stage.startsWith('II') || stage.startsWith('III')) {
    return 'recommended';
  }

  // Young (<50) with any cancer
  if (age && age < 50) {
    return 'recommended';
  }

  return 'recommended';
}

const RECOMMENDATION_SYSTEM = `You are an expert oncology genomics advisor. Given a patient profile and a pre-determined recommendation level, generate personalized reasoning for why genomic sequencing is or isn't recommended for this specific patient.

Be honest, specific, and personalized. Use the patient's actual cancer type, stage, and treatment history. Write at an 8th-grade reading level using "you" and "your".

Respond ONLY with valid JSON matching the requested schema.`;

export async function generateSequencingRecommendation(
  profile: PatientProfile,
  patientId: string,
): Promise<SequencingRecommendation> {
  const cached = await redis.get(`seq-rec:${patientId}`);
  if (cached) {
    return JSON.parse(cached) as SequencingRecommendation;
  }

  const level = determineRecommendationLevel(profile);

  const result = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: RECOMMENDATION_SYSTEM,
    messages: [{
      role: 'user',
      content: `Patient profile:
${JSON.stringify(profile, null, 2)}

Recommendation level: ${level}

Generate a personalized sequencing recommendation as JSON:
{
  "headline": "string - one sentence headline like 'Genomic sequencing is strongly recommended for your situation'",
  "personalizedReasoning": "string - 2-3 sentences explaining WHY, specific to their cancer type/stage/treatment history",
  "whatItCouldReveal": ["string - 3-5 specific things sequencing might find for their cancer type, e.g. 'BRCA mutations that respond to PARP inhibitors'"],
  "howItHelpsRightNow": "string - how results could change their current treatment decisions",
  "howItHelpsLater": "string - long-term value like monitoring, trial eligibility, family implications",
  "guidelineRecommendation": "string - what NCCN guidelines say about sequencing for their specific cancer type and stage"
}`,
    }],
  });

  const text = (result.content[0] as { type: 'text'; text: string }).text;
  const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

  const recommendation: SequencingRecommendation = {
    level,
    headline: parsed.headline,
    personalizedReasoning: parsed.personalizedReasoning,
    whatItCouldReveal: parsed.whatItCouldReveal,
    howItHelpsRightNow: parsed.howItHelpsRightNow,
    howItHelpsLater: parsed.howItHelpsLater,
    guidelineRecommendation: parsed.guidelineRecommendation,
    generatedAt: new Date().toISOString(),
  };

  await redis.set(`seq-rec:${patientId}`, JSON.stringify(recommendation), 'EX', CACHE_TTL);

  return recommendation;
}

const EXPLANATION_SYSTEM = `You are a patient educator who explains genomic sequencing in clear, simple language. Personalize the explanation to the patient's specific cancer type and situation.

Write at an 8th-grade reading level. Use "you" and "your". Be honest and reassuring. Address common fears directly.

Respond ONLY with valid JSON matching the requested schema.`;

export async function generateSequencingExplanation(
  profile: PatientProfile,
  patientId: string,
): Promise<SequencingExplanation> {
  const cached = await redis.get(`seq-explain:${patientId}`);
  if (cached) {
    return JSON.parse(cached) as SequencingExplanation;
  }

  const result = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: EXPLANATION_SYSTEM,
    messages: [{
      role: 'user',
      content: `Patient profile:
${JSON.stringify(profile, null, 2)}

Generate a personalized genomic sequencing explanation as JSON:
{
  "whatIsIt": "string - 2-3 sentences explaining what genomic sequencing is, using their cancer type as the example",
  "howItWorks": "string - 2-3 sentences on the process (sample collection, lab analysis, results)",
  "whatItFinds": "string - what kinds of mutations/alterations it looks for, specific to their cancer type",
  "personalRelevance": "string - why this matters specifically for THEM given their diagnosis",
  "commonConcerns": [
    { "concern": "string - a common worry like 'Will it hurt?'", "answer": "string - reassuring, honest answer" }
  ]
}

Include 4-5 common concerns. Common ones: pain/discomfort, cost/insurance, wait time, what if results are bad, privacy.`,
    }],
  });

  const text = (result.content[0] as { type: 'text'; text: string }).text;
  const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

  const explanation: SequencingExplanation = {
    ...parsed,
    generatedAt: new Date().toISOString(),
  };

  await redis.set(`seq-explain:${patientId}`, JSON.stringify(explanation), 'EX', CACHE_TTL);

  return explanation;
}
