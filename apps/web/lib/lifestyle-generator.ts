import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import type { PatientProfile } from '@iish/shared';

const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days
const CACHE_KEY_PREFIX = 'lifestyle:';

// ============================================================================
// Types
// ============================================================================

export interface LifestyleRecommendations {
  exercise: ExerciseRecommendation;
  nutrition: NutritionRecommendation;
  alcohol: AlcoholRecommendation;
  environment: EnvironmentalRecommendation;
  generatedAt: string;
}

interface ExerciseRecommendation {
  headline: string;
  effectSize: string;
  weeklyTargetMinutes: number;
  intensity: string;
  strengthDaysPerWeek: number;
  precautions: { issue: string; guidance: string }[];
  starterPlan: {
    week: number;
    totalMinutes: number;
    sessions: { day: string; type: string; duration: number; description: string }[];
  }[];
  symptomExercises: { symptom: string; exerciseType: string; evidence: string }[];
}

interface NutritionRecommendation {
  headline: string;
  strongEvidence: string[];
  medicationGuidance: {
    medication: string;
    considerations: string[];
    emphasize: string[];
    limit: string[];
  }[];
  mythBusting: { myth: string; reality: string; nuance: string }[];
}

interface AlcoholRecommendation {
  headline: string;
  quantifiedRisk: string;
  subtypeContext: string;
  recommendation: string;
  evidenceStrength: string;
  honestFraming: string;
}

interface EnvironmentalRecommendation {
  approach: string;
  steps: {
    category: string;
    action: string;
    why: string;
    difficulty: string;
    cost: string;
    evidence: string;
  }[];
  overblownConcerns: { claim: string; reality: string }[];
}

// ============================================================================
// Claude prompt — single comprehensive call
// ============================================================================

const LIFESTYLE_SYSTEM = `You are an expert oncology survivorship specialist focused on evidence-based lifestyle medicine. Given a patient's cancer type, subtype, stage, treatment history, ongoing medications, and any existing SCP lifestyle headlines, produce detailed, personalized lifestyle recommendations.

KEY PRINCIPLES:
- NOT generic wellness advice. Everything must be subtype-specific and treatment-aware.
- ER+ breast cancer patients have different alcohol risk than TNBC patients.
- Patients on aromatase inhibitors need bone density emphasis.
- Patients with neuropathy need modified exercise programs.
- Cite specific studies (LACE, WHEL, NHS, CALGB 89803, etc.) where relevant.
- Evidence grades: strong (meta-analyses/RCTs), moderate (observational cohorts), emerging (pilot data), precautionary (biologically plausible).
- Tone: empowering and honest, not preachy or patronizing.
- Respect patient autonomy — present evidence, not mandates.

Respond ONLY with valid JSON matching the requested schema.`;

// ============================================================================
// Generate lifestyle recommendations
// ============================================================================

export async function generateLifestyleRecommendations(
  patientId: string,
): Promise<LifestyleRecommendations> {
  // Load patient data + SCP
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });
  if (!patient) throw new Error('Patient not found');

  const profile = patient.profile as PatientProfile | null;

  // Load existing SCP if available
  const plan = await prisma.survivorshipPlan.findUnique({
    where: { patientId },
  });
  const planContent = plan?.planContent as Record<string, unknown> | null;
  const existingLifestyle = planContent?.lifestyle ?? null;
  const lateEffects = planContent?.lateEffects ?? null;
  const ongoingTherapy = planContent?.ongoingTherapy ?? null;

  const result = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: LIFESTYLE_SYSTEM,
    messages: [{
      role: 'user',
      content: `Patient profile:
${JSON.stringify(profile, null, 2)}

Existing SCP lifestyle headlines (expand on these):
${JSON.stringify(existingLifestyle, null, 2)}

Late effects from treatment:
${JSON.stringify(lateEffects, null, 2)}

Ongoing therapy/medications:
${JSON.stringify(ongoingTherapy, null, 2)}

Treatment history: ${JSON.stringify(profile?.priorTreatments ?? [], null, 2)}

Produce detailed lifestyle recommendations as JSON with this exact schema:
{
  "exercise": {
    "headline": "string - one-line empowering summary",
    "effectSize": "string - e.g. '150+ min/week aerobic exercise associated with 27-40% reduced recurrence risk (LACE/WHEL/NHS)'",
    "weeklyTargetMinutes": "number - personalized target (usually 150-300)",
    "intensity": "string - e.g. 'moderate (brisk walking, cycling)' — adjusted for this patient's treatment history",
    "strengthDaysPerWeek": "number - usually 2-3",
    "precautions": [{
      "issue": "string - e.g. 'Peripheral neuropathy from taxane therapy'",
      "guidance": "string - specific modification"
    }],
    "starterPlan": [{
      "week": "number - 1 through 4",
      "totalMinutes": "number - gradual build",
      "sessions": [{
        "day": "string - e.g. 'Monday'",
        "type": "string - e.g. 'Walking', 'Strength', 'Yoga'",
        "duration": "number - minutes",
        "description": "string - brief description of what to do"
      }]
    }],
    "symptomExercises": [{
      "symptom": "string - e.g. 'Joint pain from aromatase inhibitors'",
      "exerciseType": "string - e.g. 'Yoga + gentle stretching'",
      "evidence": "string - e.g. 'RCT showed 30% reduction in arthralgia (Irwin 2015)'"
    }]
  },
  "nutrition": {
    "headline": "string - one-line summary",
    "strongEvidence": ["string - evidence-based recommendation with citation"],
    "medicationGuidance": [{
      "medication": "string - name of medication patient is on",
      "considerations": ["string - what to know"],
      "emphasize": ["string - foods/nutrients to prioritize"],
      "limit": ["string - foods/nutrients to limit or avoid"]
    }],
    "mythBusting": [{
      "myth": "string - common belief, e.g. 'Sugar feeds cancer'",
      "reality": "string - evidence-based truth",
      "nuance": "string - honest middle ground"
    }]
  },
  "alcohol": {
    "headline": "string - one-line summary tailored to subtype",
    "quantifiedRisk": "string - e.g. 'Each standard drink/day associated with 10-12% increased breast cancer risk (pooled analysis)'",
    "subtypeContext": "string - how this applies to THIS patient's specific subtype",
    "recommendation": "string - clear guidance",
    "evidenceStrength": "string - strong/moderate/emerging",
    "honestFraming": "string - non-judgmental, respects autonomy, acknowledges the social/emotional role of alcohol"
  },
  "environment": {
    "approach": "string - overall philosophy (focus on actionable, not anxious)",
    "steps": [{
      "category": "string - e.g. 'Home', 'Personal care', 'Food'",
      "action": "string - specific swap or change",
      "why": "string - brief explanation",
      "difficulty": "string - easy/moderate/involved",
      "cost": "string - free/low/moderate",
      "evidence": "string - strong/moderate/emerging/precautionary"
    }],
    "overblownConcerns": [{
      "claim": "string - common fear, e.g. 'Microwaving food causes cancer'",
      "reality": "string - evidence-based debunk"
    }]
  }
}`,
    }],
  });

  const text = (result.content[0] as { type: 'text'; text: string }).text;
  const recommendations: LifestyleRecommendations = {
    ...JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim()),
    generatedAt: new Date().toISOString(),
  };

  // Store on SurvivorshipPlan as lifestyle_extended in planContent
  if (plan) {
    const updatedContent = { ...(planContent ?? {}), lifestyle_extended: recommendations };
    await prisma.survivorshipPlan.update({
      where: { id: plan.id },
      data: { planContent: updatedContent as any },
    });
  }

  // Cache in Redis
  await redis.set(
    `${CACHE_KEY_PREFIX}${patientId}`,
    JSON.stringify(recommendations),
    'EX',
    CACHE_TTL,
  );

  return recommendations;
}

// ============================================================================
// Get cached/stored lifestyle recommendations
// ============================================================================

export async function getLifestyleRecommendations(
  patientId: string,
): Promise<LifestyleRecommendations | null> {
  // Check Redis cache
  const cached = await redis.get(`${CACHE_KEY_PREFIX}${patientId}`);
  if (cached) {
    return JSON.parse(cached) as LifestyleRecommendations;
  }

  // Check DB (stored on SurvivorshipPlan.planContent.lifestyle_extended)
  const plan = await prisma.survivorshipPlan.findUnique({
    where: { patientId },
  });
  if (!plan) return null;

  const planContent = plan.planContent as Record<string, unknown> | null;
  const stored = planContent?.lifestyle_extended as LifestyleRecommendations | undefined;
  if (!stored) return null;

  // Re-cache
  await redis.set(
    `${CACHE_KEY_PREFIX}${patientId}`,
    JSON.stringify(stored),
    'EX',
    CACHE_TTL,
  );

  return stored;
}
