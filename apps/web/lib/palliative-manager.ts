import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';

// ============================================================================
// Types
// ============================================================================

export interface EsasScores {
  pain: number;
  tiredness: number;
  nausea: number;
  depression: number;
  anxiety: number;
  drowsiness: number;
  appetite: number;
  wellbeing: number;
  shortnessOfBreath: number;
  other?: { symptom: string; severity: number }[];
}

export interface TriageResult {
  level: 'emergency' | 'urgent' | 'monitor' | 'routine';
  rationale: string;
  recommendations: string[];
  referralRecommended: boolean;
}

export interface GoalsOfCareGuide {
  introduction: string;
  questions: { question: string; why: string }[];
  talkingPoints: string[];
  documentChecklist: string[];
  generatedAt: string;
}

export interface ReferralLetter {
  content: string;
  generatedAt: string;
}

// ============================================================================
// Triage — Deterministic Symptom Classification
// ============================================================================

export function triageSymptoms(
  scores: EsasScores,
  previousScores?: EsasScores | null,
): TriageResult {
  const recommendations: string[] = [];
  const coreSymptoms = [
    { name: 'pain', value: scores.pain },
    { name: 'tiredness', value: scores.tiredness },
    { name: 'nausea', value: scores.nausea },
    { name: 'depression', value: scores.depression },
    { name: 'anxiety', value: scores.anxiety },
    { name: 'drowsiness', value: scores.drowsiness },
    { name: 'appetite', value: scores.appetite },
    { name: 'wellbeing', value: scores.wellbeing },
    { name: 'shortness of breath', value: scores.shortnessOfBreath },
  ];

  // Emergency: any symptom >=8 OR pain >=7 new onset
  const severeSymptoms = coreSymptoms.filter(s => s.value >= 8);
  const painNewOnset = scores.pain >= 7 && (!previousScores || previousScores.pain < 4);

  if (severeSymptoms.length > 0 || painNewOnset) {
    const triggerNames = severeSymptoms.map(s => `${s.name} (${s.value}/10)`);
    if (painNewOnset && !severeSymptoms.find(s => s.name === 'pain')) {
      triggerNames.push(`pain new onset (${scores.pain}/10)`);
    }
    recommendations.push('Contact your oncology team immediately');
    recommendations.push('If after hours, call the on-call number or go to the emergency department');
    recommendations.push('A palliative care referral is strongly recommended');
    return {
      level: 'emergency',
      rationale: `Severe symptoms detected: ${triggerNames.join(', ')}. Immediate medical attention recommended.`,
      recommendations,
      referralRecommended: true,
    };
  }

  // Urgent: 2+ symptoms >=6 OR any delta >=3 from previous
  const moderateSevere = coreSymptoms.filter(s => s.value >= 6);
  let largeDeltas: string[] = [];
  if (previousScores) {
    const prevMap: Record<string, number> = {
      pain: previousScores.pain,
      tiredness: previousScores.tiredness,
      nausea: previousScores.nausea,
      depression: previousScores.depression,
      anxiety: previousScores.anxiety,
      drowsiness: previousScores.drowsiness,
      appetite: previousScores.appetite,
      wellbeing: previousScores.wellbeing,
      'shortness of breath': previousScores.shortnessOfBreath,
    };
    largeDeltas = coreSymptoms
      .filter(s => s.value - (prevMap[s.name] ?? 0) >= 3)
      .map(s => `${s.name} (+${s.value - (prevMap[s.name] ?? 0)})`);
  }

  if (moderateSevere.length >= 2 || largeDeltas.length > 0) {
    const reasons: string[] = [];
    if (moderateSevere.length >= 2) {
      reasons.push(`${moderateSevere.length} symptoms at 6+/10`);
    }
    if (largeDeltas.length > 0) {
      reasons.push(`rapid worsening: ${largeDeltas.join(', ')}`);
    }
    recommendations.push('Schedule an appointment within 24-48 hours');
    recommendations.push('Discuss symptom management changes with your care team');
    recommendations.push('Consider palliative care consultation');
    return {
      level: 'urgent',
      rationale: `Urgent attention needed: ${reasons.join('; ')}.`,
      recommendations,
      referralRecommended: moderateSevere.length >= 3,
    };
  }

  // Monitor: any symptom >=4
  const elevated = coreSymptoms.filter(s => s.value >= 4);
  if (elevated.length > 0) {
    recommendations.push('Continue monitoring symptoms daily');
    recommendations.push('Discuss elevated symptoms at your next appointment');
    if (elevated.some(s => s.name === 'depression' || s.name === 'anxiety')) {
      recommendations.push('Consider speaking with a counselor or social worker');
    }
    return {
      level: 'monitor',
      rationale: `Elevated symptoms: ${elevated.map(s => `${s.name} (${s.value}/10)`).join(', ')}. Continue monitoring.`,
      recommendations,
      referralRecommended: false,
    };
  }

  // Routine: all <=3
  recommendations.push('Continue current symptom management');
  recommendations.push('Complete your next ESAS assessment at your scheduled time');
  return {
    level: 'routine',
    rationale: 'All symptoms are well-controlled. Continue current approach.',
    recommendations,
    referralRecommended: false,
  };
}

// ============================================================================
// Submit Symptom Assessment
// ============================================================================

export async function submitSymptomAssessment(
  patientId: string,
  esasScores: EsasScores,
) {
  // Get previous assessment for delta calculation
  const previous = await prisma.palliativeAssessment.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });

  const previousScores = previous?.esasScores as EsasScores | null;
  const triage = triageSymptoms(esasScores, previousScores);

  const assessment = await prisma.palliativeAssessment.create({
    data: {
      patientId,
      esasScores: esasScores as any,
      triageLevel: triage.level,
      triageRationale: triage.rationale,
      recommendations: triage.recommendations as any,
      palliativeReferralRecommended: triage.referralRecommended,
    },
  });

  return assessment;
}

// ============================================================================
// Get Assessments
// ============================================================================

export async function getSymptomAssessments(patientId: string, limit = 20) {
  const assessments = await prisma.palliativeAssessment.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // Compute trend deltas (latest vs previous)
  return assessments.map((a, i) => {
    const scores = a.esasScores as EsasScores;
    const prev = i + 1 < assessments.length
      ? (assessments[i + 1].esasScores as EsasScores)
      : null;

    const trends: Record<string, number> = {};
    if (prev) {
      const keys: (keyof Omit<EsasScores, 'other'>)[] = [
        'pain', 'tiredness', 'nausea', 'depression', 'anxiety',
        'drowsiness', 'appetite', 'wellbeing', 'shortnessOfBreath',
      ];
      for (const key of keys) {
        trends[key] = (scores[key] as number) - (prev[key] as number);
      }
    }

    return { ...a, trends };
  });
}

export async function getLatestAssessment(patientId: string) {
  return prisma.palliativeAssessment.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================================================
// Palliative Care Providers
// ============================================================================

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getPalliativeCareProviders(
  patientId: string,
  filters?: {
    type?: string;
    setting?: string;
    telehealth?: boolean;
    insurance?: string;
    maxDistance?: number;
  },
) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  const patientLat = patient?.lat;
  const patientLng = patient?.lng;

  const where: any = { isActive: true };
  if (filters?.type) where.type = filters.type;
  if (filters?.setting) where.setting = filters.setting;
  if (filters?.telehealth) where.offersTelehealth = true;
  if (filters?.insurance) {
    where.OR = [
      { acceptsInsurance: { has: filters.insurance } },
      { acceptsMedicare: true },
    ];
  }

  const providers = await prisma.palliativeCareProvider.findMany({ where });

  const withDistance = providers.map((p: any) => {
    const distance =
      patientLat != null && patientLng != null && p.lat != null && p.lng != null
        ? haversineDistance(patientLat, patientLng, p.lat, p.lng)
        : null;
    return { ...p, distance };
  });

  // Filter by max distance if specified
  const filtered = filters?.maxDistance
    ? withDistance.filter(p => p.distance === null || p.distance <= filters.maxDistance!)
    : withDistance;

  // Sort: telehealth first if requested, then by distance
  return filtered.sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });
}

// ============================================================================
// Advance Care Plan
// ============================================================================

export async function getAdvanceCarePlan(patientId: string) {
  let plan = await prisma.advanceCarePlan.findUnique({
    where: { patientId },
  });

  if (!plan) {
    plan = await prisma.advanceCarePlan.create({
      data: { patientId },
    });
  }

  return plan;
}

export async function updateAdvanceCarePlan(
  patientId: string,
  updates: {
    hasLivingWill?: boolean;
    hasHealthcareProxy?: boolean;
    healthcareProxyName?: string;
    hasPolst?: boolean;
    goalsOfCareDocumented?: boolean;
    goalsOfCareSummary?: string;
    documentsUploaded?: string[];
    lastReviewedAt?: string;
  },
) {
  const data: any = { ...updates };
  if (updates.lastReviewedAt) {
    data.lastReviewedAt = new Date(updates.lastReviewedAt);
  }

  return prisma.advanceCarePlan.upsert({
    where: { patientId },
    update: data,
    create: { patientId, ...data },
  });
}

// ============================================================================
// Goals of Care Guide — Claude-powered
// ============================================================================

export async function generateGoalsOfCareGuide(
  patientId: string,
): Promise<GoalsOfCareGuide> {
  const cacheKey = `palliative:goals:${patientId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');
  const profile = (patient.profile as any) || {};

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Generate a goals of care conversation preparation guide for a cancer patient.

Patient context:
- Cancer type: ${profile.cancerType || 'breast cancer'}
- Stage: ${profile.stage || 'unknown'}
- Treatment status: ${profile.treatmentStatus || 'unknown'}

Return JSON with this structure:
{
  "introduction": "A warm paragraph explaining what goals of care conversations are and why they matter",
  "questions": [
    {"question": "Question to ask their doctor", "why": "Why this question matters"}
  ],
  "talkingPoints": ["Key points to discuss with family/caregivers"],
  "documentChecklist": ["Documents to prepare or update"]
}

Generate 6-8 questions, 4-5 talking points, and 4-5 checklist items.
Tone: warm, empowering, non-clinical. Focus on the patient's values and preferences.`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const guide: GoalsOfCareGuide = {
    ...(jsonMatch ? JSON.parse(jsonMatch[0]) : {
      introduction: 'Goals of care conversations help ensure your treatment aligns with what matters most to you.',
      questions: [],
      talkingPoints: [],
      documentChecklist: [],
    }),
    generatedAt: new Date().toISOString(),
  };

  await redis.set(cacheKey, JSON.stringify(guide), 'EX', 7 * 24 * 60 * 60);
  return guide;
}

// ============================================================================
// Referral Letter — Claude-powered
// ============================================================================

export async function generateReferralLetter(
  patientId: string,
): Promise<ReferralLetter> {
  const cacheKey = `palliative:referral:${patientId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');
  const profile = (patient.profile as any) || {};

  const latestAssessment = await prisma.palliativeAssessment.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });

  const scores = latestAssessment?.esasScores as EsasScores | null;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Draft a letter requesting a palliative care consultation for a cancer patient to share with their oncologist.

Patient context:
- Cancer type: ${profile.cancerType || 'breast cancer'}
- Stage: ${profile.stage || 'unknown'}
- Current symptoms: ${scores ? `pain ${scores.pain}/10, tiredness ${scores.tiredness}/10, nausea ${scores.nausea}/10, depression ${scores.depression}/10, anxiety ${scores.anxiety}/10` : 'not recently assessed'}
- Triage level: ${latestAssessment?.triageLevel || 'not assessed'}

Write a warm, professional letter the patient can bring to their oncologist. Include:
1. A clear request for palliative care consultation
2. The patient's symptom burden
3. Evidence that early palliative care improves quality of life AND survival (cite Temel et al., NEJM 2010)
4. Emphasis that palliative care is complementary to cancer treatment, not a replacement

Mark "[PATIENT NAME]" and "[ONCOLOGIST NAME]" as placeholders.
Return only the letter text, no JSON wrapper.`,
    }],
  });

  const content = response.content[0].type === 'text' ? response.content[0].text : '';
  const result: ReferralLetter = {
    content,
    generatedAt: new Date().toISOString(),
  };

  await redis.set(cacheKey, JSON.stringify(result), 'EX', 7 * 24 * 60 * 60);
  return result;
}

// ============================================================================
// Should Recommend Palliative
// ============================================================================

export async function shouldRecommendPalliative(patientId: string): Promise<{
  recommended: boolean;
  reasons: string[];
}> {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return { recommended: false, reasons: [] };

  const profile = (patient.profile as any) || {};
  const reasons: string[] = [];

  // Stage IV / metastatic
  const stage = (profile.stage || '').toLowerCase();
  if (stage.includes('iv') || stage.includes('4') || stage.includes('metastatic')) {
    reasons.push('Stage IV / metastatic disease — early palliative care recommended by NCCN guidelines');
  }

  // Check recent high ESAS scores
  const recentAssessments = await prisma.palliativeAssessment.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const highTriageCount = recentAssessments.filter(
    a => a.triageLevel === 'emergency' || a.triageLevel === 'urgent',
  ).length;

  if (highTriageCount >= 2) {
    reasons.push('Persistent high symptom burden across multiple assessments');
  }

  if (recentAssessments.length > 0 && recentAssessments[0].palliativeReferralRecommended) {
    reasons.push('Most recent symptom assessment triggered referral recommendation');
  }

  return {
    recommended: reasons.length > 0,
    reasons,
  };
}
