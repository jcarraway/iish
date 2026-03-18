import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import type { SurvivorshipCarePlan, SurveillanceScheduleItem, TreatmentCompletionInput, PatientProfile } from '@oncovax/shared';

const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days

// ============================================================================
// Step 1: Clinical grounding — evidence-based survivorship data
// ============================================================================

const CLINICAL_GROUNDING_SYSTEM = `You are an expert oncology survivorship specialist. Given a patient's cancer history, treatments received, and completion status, provide structured clinical survivorship data based on current NCCN Survivorship Guidelines and published literature.

Be factual and evidence-based. Include:
- Recurrence risk category (low/moderate/high) based on stage, subtype, and treatment response
- Surveillance schedule per NCCN guidelines for this specific cancer type and stage
- Late and long-term effects specific to the treatments this patient received
- Evidence-based lifestyle recommendations (exercise, nutrition, alcohol) with cancer-specific citations
- Ongoing therapy management if applicable
- Additional screening recommendations (e.g., cardiac monitoring after anthracyclines)

Respond ONLY with valid JSON matching the requested schema.`;

// ============================================================================
// Step 2: Patient-facing translation — warm, magazine-style
// ============================================================================

const SCP_TRANSLATION_SYSTEM = `You are a survivorship care plan writer who transforms clinical survivorship data into a warm, clear, empowering document for a cancer survivor.

Rules:
- Write at an 8th-grade reading level
- Tone: warm, steady, empowering — like a knowledgeable friend, not a clinical report
- Use "you" and "your" throughout — this is deeply personal
- Frame everything through hope and agency: "Here's what you can do" not "Here are your risks"
- For surveillance, emphasize "these are routine check-ins" not "watching for recurrence"
- For late effects, always pair the possibility with what to do about it
- Never use the word "terminal" or "death"
- Fear of recurrence is the #1 burden — every section should reduce anxiety, not increase it
- Include specific, actionable next steps with dates
- Present statistics as ranges with context, never predict individual outcomes
- All AI-generated content carries a disclaimer that it must be physician-reviewed

Respond ONLY with valid JSON matching the requested schema.`;

interface ClinicalGrounding {
  riskCategory: 'low' | 'moderate' | 'high';
  riskFactors: string[];
  surveillanceSchedule: {
    type: string;
    title: string;
    description: string;
    frequency: string;
    guidelineSource: string;
    firstDueMonths: number;
  }[];
  lateEffects: {
    treatmentName: string;
    possibleEffects: {
      effect: string;
      likelihood: 'common' | 'less_common' | 'rare';
      typicalOnset: string;
      duration: string;
      management: string;
      whenToWorry: string;
    }[];
  }[];
  lifestyle: {
    exerciseTarget: string;
    exercisePrecautions: string[];
    nutritionRecommendations: string[];
    alcoholGuideline: string;
  };
  ongoingMedications: {
    name: string;
    purpose: string;
    duration: string;
    commonSideEffects: string[];
    management: string;
  }[];
  additionalScreening: {
    screening: string;
    reason: string;
    frequency: string;
    startingMonths: number;
  }[];
}

export async function generateSCP(
  patientId: string,
  input: TreatmentCompletionInput,
): Promise<SurvivorshipCarePlan> {
  // Check cache first
  const cached = await redis.get(`scp:${patientId}`);
  if (cached) {
    return JSON.parse(cached) as SurvivorshipCarePlan;
  }

  // Load patient data
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { user: { select: { name: true } } },
  });
  if (!patient) throw new Error('Patient not found');

  const profile = patient.profile as PatientProfile | null;
  const patientName = (patient as any).user?.name || 'Patient';

  // Load existing plan for phase context
  const existingPlan = await prisma.survivorshipPlan.findUnique({
    where: { patientId },
    select: { currentPhase: true },
  });

  // Build treatment summary from profile
  const completionDate = new Date(input.completionDate);
  const yearsSinceCompletion = Math.max(0,
    (Date.now() - completionDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );

  const treatmentSummary = {
    diagnosis: profile?.cancerType || 'cancer',
    stage: profile?.stage || 'unknown',
    subtype: buildSubtypeString(profile),
    treatmentsReceived: (profile?.priorTreatments || []).map(t => t.name),
    completionDate: input.completionDate,
    completionType: input.completionType,
    ongoingTherapies: input.ongoingTherapies,
    yearsSinceCompletion: Math.round(yearsSinceCompletion * 10) / 10,
    currentPhase: existingPlan?.currentPhase || 'early',
  };

  // Step 1: Clinical grounding
  const groundingResult = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: CLINICAL_GROUNDING_SYSTEM,
    messages: [{
      role: 'user',
      content: `Patient profile:
${JSON.stringify(profile, null, 2)}

Treatment completion info:
${JSON.stringify(treatmentSummary, null, 2)}

Years since treatment completion: ${treatmentSummary.yearsSinceCompletion}
Current survivorship phase: ${treatmentSummary.currentPhase}
Adjust surveillance frequency and risk assessment based on time elapsed.

Provide clinical survivorship grounding JSON with this schema:
{
  "riskCategory": "low | moderate | high",
  "riskFactors": ["string"],
  "surveillanceSchedule": [{
    "type": "string - e.g. mammogram, physical_exam, blood_work, imaging",
    "title": "string - display title",
    "description": "string - what this test checks for",
    "frequency": "string - e.g. every 6 months, annually",
    "guidelineSource": "string - e.g. NCCN Breast Cancer Survivorship v2.2024",
    "firstDueMonths": "number - months after treatment completion for first check"
  }],
  "lateEffects": [{
    "treatmentName": "string",
    "possibleEffects": [{
      "effect": "string",
      "likelihood": "common | less_common | rare",
      "typicalOnset": "string",
      "duration": "string",
      "management": "string",
      "whenToWorry": "string"
    }]
  }],
  "lifestyle": {
    "exerciseTarget": "string",
    "exercisePrecautions": ["string"],
    "nutritionRecommendations": ["string"],
    "alcoholGuideline": "string"
  },
  "ongoingMedications": [{
    "name": "string",
    "purpose": "string",
    "duration": "string",
    "commonSideEffects": ["string"],
    "management": "string"
  }],
  "additionalScreening": [{
    "screening": "string",
    "reason": "string",
    "frequency": "string",
    "startingMonths": "number"
  }]
}`,
    }],
  });

  const groundingText = (groundingResult.content[0] as { type: 'text'; text: string }).text;
  const grounding: ClinicalGrounding = JSON.parse(
    groundingText.replace(/```json\n?|```\n?/g, '').trim()
  );

  // Step 2: Patient-facing SCP
  const nextReviewDate = new Date(completionDate);
  nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 1);

  const translationResult = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: SCP_TRANSLATION_SYSTEM,
    messages: [{
      role: 'user',
      content: `Clinical grounding:
${JSON.stringify(grounding, null, 2)}

Patient name: ${patientName}
Treatment summary:
${JSON.stringify(treatmentSummary, null, 2)}

Next annual review date: ${nextReviewDate.toISOString().split('T')[0]}

Create a patient-facing survivorship care plan as JSON with this exact schema:
{
  "generatedDate": "${new Date().toISOString().split('T')[0]}",
  "basedOn": {
    "diagnosis": "string",
    "stage": "string",
    "subtype": "string",
    "treatmentsReceived": ["string"],
    "completionDate": "${input.completionDate}"
  },
  "overview": {
    "plainLanguageSummary": "string - 3-4 warm sentences about where they are now and what comes next",
    "whatToExpect": "string - what the first year of survivorship typically looks like",
    "keyDates": [{ "date": "YYYY-MM-DD", "event": "string", "description": "string" }]
  },
  "surveillance": {
    "schedule": [{
      "type": "string",
      "title": "string",
      "description": "string - patient-friendly description",
      "frequency": "string",
      "nextDue": "YYYY-MM-DD",
      "guidelineSource": "string"
    }],
    "whatWeWatch": "string - reassuring explanation of why we do follow-up",
    "whenToCallDoctor": ["string - specific symptoms that warrant a call"]
  },
  "lateEffects": {
    "byTreatment": [{
      "treatmentName": "string",
      "possibleEffects": [{
        "effect": "string",
        "likelihood": "common | less_common | rare",
        "typicalOnset": "string",
        "duration": "string",
        "management": "string - what to do about it",
        "whenToWorry": "string - when to call the doctor"
      }]
    }]
  },
  "lifestyle": {
    "exercise": { "headline": "string", "target": "string", "precautions": ["string"] },
    "nutrition": { "headline": "string", "recommendations": ["string"] },
    "alcohol": { "headline": "string", "detail": "string" }
  },
  "ongoingTherapy": {
    "medications": [{
      "name": "string",
      "purpose": "string",
      "duration": "string",
      "commonSideEffects": ["string"],
      "management": "string"
    }]
  },
  "careTeam": {
    "whoToCallFor": [{ "concern": "string", "contact": "string", "urgency": "string" }]
  },
  "additionalScreening": [{
    "screening": "string",
    "reason": "string",
    "frequency": "string",
    "startingWhen": "string"
  }],
  "disclaimer": "This survivorship care plan was generated by AI based on current clinical guidelines and your medical history. It must be reviewed and approved by your oncology team before being used for medical decisions. This is not a substitute for professional medical advice.",
  "nextReviewDate": "${nextReviewDate.toISOString().split('T')[0]}"
}`,
    }],
  });

  const scpText = (translationResult.content[0] as { type: 'text'; text: string }).text;
  const scp: SurvivorshipCarePlan = JSON.parse(
    scpText.replace(/```json\n?|```\n?/g, '').trim()
  );

  // Save to DB: create or update SurvivorshipPlan
  const plan = await prisma.survivorshipPlan.upsert({
    where: { patientId },
    create: {
      patientId,
      treatmentCompletionDate: completionDate,
      completionType: input.completionType,
      ongoingTherapies: input.ongoingTherapies,
      treatmentSummary: treatmentSummary as any,
      planContent: scp as any,
      riskCategory: grounding.riskCategory,
      currentPhase: 'early',
      lastGeneratedAt: new Date(),
      nextReviewDate,
    },
    update: {
      treatmentCompletionDate: completionDate,
      completionType: input.completionType,
      ongoingTherapies: input.ongoingTherapies,
      treatmentSummary: treatmentSummary as any,
      planContent: scp as any,
      riskCategory: grounding.riskCategory,
      lastGeneratedAt: new Date(),
      nextReviewDate,
    },
  });

  // Create surveillance events from the schedule
  await createSurveillanceEvents(patientId, plan.id, scp.surveillance.schedule, completionDate);

  // Cache the SCP
  await redis.set(`scp:${patientId}`, JSON.stringify(scp), 'EX', CACHE_TTL);

  return scp;
}

export async function refreshSCP(patientId: string): Promise<SurvivorshipCarePlan> {
  // Load existing plan to get completion input
  const existingPlan = await prisma.survivorshipPlan.findUnique({
    where: { patientId },
  });
  if (!existingPlan) throw new Error('No existing survivorship plan found');

  // Invalidate cache
  await redis.del(`scp:${patientId}`);

  // Re-generate with same completion info
  const input: TreatmentCompletionInput = {
    completionDate: existingPlan.treatmentCompletionDate.toISOString().split('T')[0],
    completionType: existingPlan.completionType as TreatmentCompletionInput['completionType'],
    ongoingTherapies: existingPlan.ongoingTherapies,
    wantsReminders: true,
  };

  return generateSCP(patientId, input);
}

async function createSurveillanceEvents(
  patientId: string,
  planId: string,
  schedule: SurveillanceScheduleItem[],
  completionDate: Date,
): Promise<void> {
  // Delete existing events for this plan (regeneration scenario)
  await prisma.surveillanceEvent.deleteMany({ where: { planId } });

  const events = schedule.map(item => {
    const dueDate = item.nextDue ? new Date(item.nextDue) : null;
    return {
      patientId,
      planId,
      type: item.type,
      title: item.title,
      description: item.description,
      frequency: item.frequency,
      guidelineSource: item.guidelineSource,
      dueDate,
      status: 'upcoming',
    };
  });

  if (events.length > 0) {
    await prisma.surveillanceEvent.createMany({ data: events });
  }
}

function buildSubtypeString(profile: PatientProfile | null): string {
  if (!profile) return 'unknown';
  const parts: string[] = [];
  const rs = profile.receptorStatus;
  if (rs) {
    if (rs.er?.status) parts.push(`ER ${rs.er.status}`);
    if (rs.pr?.status) parts.push(`PR ${rs.pr.status}`);
    if (rs.her2?.status) parts.push(`HER2 ${rs.her2.status}`);
  }
  if (parts.length === 0 && profile.cancerType) {
    return profile.cancerType;
  }
  return parts.join(', ') || profile.cancerType || 'unknown';
}
