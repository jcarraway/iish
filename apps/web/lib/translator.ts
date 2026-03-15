import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import type { PatientProfile, TreatmentTranslation } from '@oncovax/shared';

const CACHE_TTL = 24 * 60 * 60; // 24 hours

interface ClinicalGrounding {
  guidelineApproach: string;
  survivalContext: string;
  drugMechanisms: { drug: string; mechanism: string; sideEffectProfile: string; onsetTiming: string }[];
  guidelineAlignment: string;
  deviations: string[];
  biomarkerSuggestions: string[];
}

const CLINICAL_GROUNDING_SYSTEM = `You are an expert oncology knowledge assistant. Given a patient profile, provide a structured clinical grounding based on current NCCN guidelines and published literature.

Be factual and evidence-based. Include:
- Current guideline-recommended approach for this specific diagnosis
- Published survival statistics context (ranges, not point estimates)
- Mechanism of action for each drug in the patient's treatment plan
- Known side effect profiles with onset/resolution timing
- Whether the patient's plan aligns with guidelines (flag deviations)
- Biomarker-informed targeted therapy suggestions

Respond ONLY with valid JSON matching the requested schema.`;

const TRANSLATION_SYSTEM = `You are a medical translator who converts clinical oncology data into clear, honest explanations for an intelligent adult with no medical background.

Rules:
- Write at an 8th-grade reading level
- Be honest but not terrifying
- Present survival statistics as ranges with context, never predict individual outcomes
- Frame guideline deviations as "worth discussing with your doctor" not "your doctor is wrong"
- Include personalized questions the patient should ask
- Use "you" and "your" — this is personal
- Never use the word "terminal" or "death" — use "prognosis" and "outcomes"
- For side effects, always pair the risk with management strategies

Respond ONLY with valid JSON matching the requested schema.`;

export async function generateTranslation(
  profile: PatientProfile,
  patientId: string,
): Promise<TreatmentTranslation> {
  // Check cache first
  const cached = await redis.get(`translation:${patientId}`);
  if (cached) {
    return JSON.parse(cached) as TreatmentTranslation;
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

Provide clinical grounding JSON with this schema:
{
  "guidelineApproach": "string - recommended approach for this diagnosis per NCCN",
  "survivalContext": "string - published survival statistics context",
  "drugMechanisms": [{ "drug": "string", "mechanism": "string", "sideEffectProfile": "string", "onsetTiming": "string" }],
  "guidelineAlignment": "string - how patient's plan aligns with guidelines",
  "deviations": ["string - any deviations from standard of care"],
  "biomarkerSuggestions": ["string - biomarker-informed suggestions"]
}`,
    }],
  });

  const groundingText = (groundingResult.content[0] as { type: 'text'; text: string }).text;
  const grounding: ClinicalGrounding = JSON.parse(
    groundingText.replace(/```json\n?|```\n?/g, '').trim()
  );

  // Step 2: Patient-facing translation
  const secondOpinionTriggers = detectSecondOpinionTriggers(profile);

  const translationResult = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: TRANSLATION_SYSTEM,
    messages: [{
      role: 'user',
      content: `Clinical grounding data:
${JSON.stringify(grounding, null, 2)}

Patient profile:
${JSON.stringify(profile, null, 2)}

Second opinion triggers detected: ${JSON.stringify(secondOpinionTriggers)}

Create a patient-facing treatment translation as JSON with this exact schema:
{
  "diagnosis": {
    "summary": "string - 2-3 sentence plain-language summary of their diagnosis",
    "stageExplainer": "string - what their stage means in plain language",
    "subtypeExplainer": "string - what their cancer subtype means and why it matters for treatment",
    "whatThisMeans": "string - honest, reassuring overview of what this all means for them"
  },
  "treatmentPlan": {
    "overview": "string - 2-3 sentence overview of the treatment approach and rationale",
    "drugs": [{
      "name": "string - brand name",
      "genericName": "string - generic name if applicable",
      "mechanism": "string - how this drug works in simple terms",
      "whyThisDrug": "string - why this specific drug was chosen for their case",
      "commonSideEffects": [{ "effect": "string", "timing": "string - when it typically starts/resolves", "management": "string - how to manage it" }],
      "seriousSideEffects": ["string - rare but serious effects to watch for"],
      "tips": ["string - practical tips for this drug"]
    }],
    "guidelineAlignment": "string - how this plan compares to standard guidelines, in reassuring terms"
  },
  "timeline": {
    "overview": "string - what the overall treatment timeline looks like",
    "phases": [{
      "phase": "string - phase name",
      "duration": "string - expected duration",
      "description": "string - what happens in this phase",
      "whatToExpect": ["string - what to expect during this phase"]
    }]
  },
  "questionsForDoctor": [{
    "question": "string - a specific question to ask their oncologist",
    "whyItMatters": "string - why this question is important"
  }],
  "additionalConsiderations": {
    "geneticTesting": "string or null - info about genetic testing if relevant",
    "fertilityPreservation": "string or null - info if age-relevant",
    "clinicalTrials": "string or null - brief note about clinical trials",
    "mentalHealth": "string or null - mental health resources note"
  },
  "secondOpinionTriggers": ${JSON.stringify(secondOpinionTriggers)},
  "generatedAt": "${new Date().toISOString()}"
}`,
    }],
  });

  const translationText = (translationResult.content[0] as { type: 'text'; text: string }).text;
  const translation: TreatmentTranslation = JSON.parse(
    translationText.replace(/```json\n?|```\n?/g, '').trim()
  );

  // Cache result
  await redis.set(`translation:${patientId}`, JSON.stringify(translation), 'EX', CACHE_TTL);

  return translation;
}

function detectSecondOpinionTriggers(profile: PatientProfile): { reason: string; level: 'worth_discussing' | 'informational' }[] {
  const triggers: { reason: string; level: 'worth_discussing' | 'informational' }[] = [];
  const treatments = profile.priorTreatments ?? [];
  const treatmentNames = treatments.map(t => t.name.toLowerCase());
  const receptors = profile.receptorStatus;

  // TNBC without pembrolizumab
  if (
    receptors?.er?.status?.toLowerCase() === 'negative' &&
    receptors?.pr?.status?.toLowerCase() === 'negative' &&
    receptors?.her2?.status?.toLowerCase() === 'negative' &&
    !treatmentNames.some(n => n.includes('pembrolizumab') || n.includes('keytruda'))
  ) {
    triggers.push({
      reason: 'Triple-negative breast cancer may benefit from immunotherapy (pembrolizumab/Keytruda), which is now standard of care in many cases.',
      level: 'worth_discussing',
    });
  }

  // HER2+ without pertuzumab
  if (
    receptors?.her2?.status?.toLowerCase() === 'positive' &&
    !treatmentNames.some(n => n.includes('pertuzumab') || n.includes('perjeta'))
  ) {
    triggers.push({
      reason: 'HER2-positive breast cancer guidelines recommend pertuzumab (Perjeta) in combination with trastuzumab for many patients.',
      level: 'worth_discussing',
    });
  }

  // High-risk ER+ without CDK4/6 inhibitor
  if (
    receptors?.er?.status?.toLowerCase() === 'positive' &&
    (profile.stage === 'III' || profile.stage === 'IIIA' || profile.stage === 'IIIB' || profile.stage === 'IIIC' || profile.stage === 'IV') &&
    !treatmentNames.some(n =>
      n.includes('palbociclib') || n.includes('ibrance') ||
      n.includes('ribociclib') || n.includes('kisqali') ||
      n.includes('abemaciclib') || n.includes('verzenio')
    )
  ) {
    triggers.push({
      reason: 'High-risk ER-positive breast cancer often benefits from CDK4/6 inhibitor therapy (e.g., Ibrance, Kisqali, or Verzenio).',
      level: 'informational',
    });
  }

  // No genetic testing + age < 50
  const biomarkers = profile.biomarkers ?? {};
  const hasBRCA = Object.keys(biomarkers).some(k => k.toLowerCase().includes('brca'));
  if (!hasBRCA && profile.age && profile.age < 50) {
    triggers.push({
      reason: 'Genetic testing (BRCA1/BRCA2 and other genes) is recommended for patients diagnosed under age 50, as results may affect treatment options.',
      level: 'worth_discussing',
    });
  }

  return triggers;
}
