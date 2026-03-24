/**
 * PREVENT Screening — Schedule Generation + Chemoprevention Eligibility
 *
 * Implements NCCN/ACS screening guidelines and USPSTF chemoprevention rules.
 */

import { prisma } from './db';
import { redis } from './redis';
import { anthropic } from './ai';

// ============================================================================
// Types
// ============================================================================

interface ScreeningModality {
  modality: string;
  frequency: string;
  startAge: number;
  rationale: string;
}

interface ChemoMed {
  name: string;
  type: string;
  eligiblePopulation: string;
  riskReduction: string;
  duration: string;
  sideEffects: string[];
  contraindications: string[];
  keyTrials: string[];
}

// ============================================================================
// Screening Schedule Generation
// ============================================================================

/**
 * Generate a personalized screening schedule based on NCCN/ACS guidelines.
 */
export async function generateScreeningSchedule(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  const profile = await prisma.preventProfile.findUnique({ where: { patientId: patient.id } });
  if (!profile) throw new Error('Prevention profile not found — complete onboarding first');

  const latestRisk = await prisma.riskAssessment.findFirst({
    where: { patientId: patient.id },
    orderBy: { assessmentDate: 'desc' },
  });

  const riskCategory = latestRisk?.riskCategory ?? 'average';
  const familyHistory = typeof profile.familyHistory === 'string'
    ? JSON.parse(profile.familyHistory)
    : profile.familyHistory ?? {};

  const dob = patient.dateOfBirth;
  const currentAge = dob
    ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 50;

  const hasKnownMutation = familyHistory.knownBrcaMutation === true;
  const firstDegreeCount = familyHistory.firstDegreeCount ?? 0;
  const isDense = profile.breastDensity === 'heterogeneously_dense' || profile.breastDensity === 'extremely_dense';
  const hadChestRadiation = profile.chestRadiation === true;

  // Determine schedule based on risk
  const schedule: ScreeningModality[] = buildSchedule({
    riskCategory,
    currentAge,
    hasKnownMutation,
    firstDegreeCount,
    isDense,
    hadChestRadiation,
    familyHistory,
  });

  // Calculate next screening
  const now = new Date();
  const nextScreeningType = schedule[0]?.modality ?? 'mammogram';
  const monthsUntilNext = riskCategory === 'average' ? 12 : 6;
  const nextScreeningDate = new Date(now.getTime() + monthsUntilNext * 30.44 * 24 * 60 * 60 * 1000);

  return prisma.screeningSchedule.upsert({
    where: { patientId: patient.id },
    update: {
      guidelineSource: 'NCCN',
      riskCategory,
      schedule: schedule as any,
      nextScreeningDate,
      nextScreeningType,
      lastUpdatedAt: new Date(),
    },
    create: {
      patientId: patient.id,
      guidelineSource: 'NCCN',
      riskCategory,
      schedule: schedule as any,
      nextScreeningDate,
      nextScreeningType,
    },
  });
}

function buildSchedule(params: {
  riskCategory: string;
  currentAge: number;
  hasKnownMutation: boolean;
  firstDegreeCount: number;
  isDense: boolean;
  hadChestRadiation: boolean;
  familyHistory: any;
}): ScreeningModality[] {
  const { riskCategory, currentAge, hasKnownMutation, firstDegreeCount, isDense, hadChestRadiation } = params;

  const schedule: ScreeningModality[] = [];

  // High risk (>20% lifetime or pathogenic variant or chest radiation)
  if (riskCategory === 'high' || riskCategory === 'very_high' || hasKnownMutation || hadChestRadiation) {
    const startAge = hasKnownMutation ? 25 : hadChestRadiation ? 25 : 30;
    const mriStart = hasKnownMutation ? 25 : 30;

    if (currentAge >= startAge || currentAge >= 25) {
      schedule.push({
        modality: 'mammogram',
        frequency: 'annually',
        startAge,
        rationale: hasKnownMutation
          ? 'NCCN recommends annual mammography starting at age 25 for BRCA carriers.'
          : hadChestRadiation
            ? 'NCCN recommends annual mammography starting 8 years after radiation or age 25.'
            : 'NCCN recommends annual mammography for women with >20% lifetime risk.',
      });
    }

    schedule.push({
      modality: 'breast MRI',
      frequency: 'annually',
      startAge: mriStart,
      rationale: 'NCCN recommends annual contrast-enhanced MRI for high-risk women, alternating with mammography every 6 months.',
    });

    if (hasKnownMutation) {
      schedule.push({
        modality: 'clinical breast exam',
        frequency: 'every 6-12 months',
        startAge: 25,
        rationale: 'Regular clinical breast exams complement imaging for BRCA carriers.',
      });
    }
  }
  // Moderate risk (15-20%)
  else if (riskCategory === 'moderate' || riskCategory === 'slightly_elevated') {
    schedule.push({
      modality: 'mammogram',
      frequency: 'annually',
      startAge: 40,
      rationale: 'ACS/NCCN recommend annual mammography starting at 40 for women at moderate risk.',
    });

    if (riskCategory === 'moderate' || isDense) {
      schedule.push({
        modality: 'breast MRI',
        frequency: 'consider annually',
        startAge: 40,
        rationale: isDense
          ? 'NCCN considers MRI for women with dense breast tissue (categories C or D).'
          : 'MRI may be considered for women with 15-20% lifetime risk based on shared decision-making.',
      });
    }
  }
  // Average risk
  else {
    schedule.push({
      modality: 'mammogram',
      frequency: 'annually',
      startAge: 40,
      rationale: 'ACS recommends annual mammography beginning at age 40.',
    });
  }

  // Dense breasts — add supplemental screening regardless of risk
  if (isDense && !schedule.some(s => s.modality === 'breast MRI')) {
    schedule.push({
      modality: 'breast ultrasound',
      frequency: 'annually',
      startAge: 40,
      rationale: 'Supplemental screening with ultrasound is recommended for women with dense breast tissue who are not getting MRI.',
    });
  }

  // Breast awareness for all
  schedule.push({
    modality: 'breast self-awareness',
    frequency: 'ongoing',
    startAge: 20,
    rationale: 'Be familiar with how your breasts normally look and feel. Report any changes to your provider promptly.',
  });

  return schedule;
}

/**
 * Get existing screening schedule.
 */
export async function getScreeningSchedule(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;
  return prisma.screeningSchedule.findUnique({ where: { patientId: patient.id } });
}

// ============================================================================
// Chemoprevention Eligibility
// ============================================================================

const CHEMO_MEDICATIONS: ChemoMed[] = [
  {
    name: 'Tamoxifen',
    type: 'SERM',
    eligiblePopulation: 'Pre- or postmenopausal women age 35+',
    riskReduction: '~49% reduction in invasive ER+ breast cancer',
    duration: '5 years',
    sideEffects: ['Hot flashes', 'Blood clots (DVT/PE)', 'Endometrial cancer risk', 'Cataracts', 'Mood changes'],
    contraindications: ['History of DVT/PE', 'Pregnancy', 'Current anticoagulant use'],
    keyTrials: ['NSABP P-1 (Fisher 1998)', 'IBIS-I (Cuzick 2002)'],
  },
  {
    name: 'Raloxifene',
    type: 'SERM',
    eligiblePopulation: 'Postmenopausal women only',
    riskReduction: '~38% reduction in invasive breast cancer',
    duration: '5 years',
    sideEffects: ['Hot flashes', 'Blood clots (lower risk than tamoxifen)', 'Leg cramps'],
    contraindications: ['Premenopausal', 'History of DVT/PE'],
    keyTrials: ['STAR trial (Vogel 2006)'],
  },
  {
    name: 'Exemestane',
    type: 'Aromatase Inhibitor',
    eligiblePopulation: 'Postmenopausal women only',
    riskReduction: '~65% reduction in invasive breast cancer',
    duration: '5 years',
    sideEffects: ['Joint pain/stiffness', 'Hot flashes', 'Bone density loss', 'Fatigue'],
    contraindications: ['Premenopausal', 'Severe osteoporosis'],
    keyTrials: ['MAP.3 (Goss 2011)'],
  },
  {
    name: 'Anastrozole',
    type: 'Aromatase Inhibitor',
    eligiblePopulation: 'Postmenopausal women only',
    riskReduction: '~53% reduction in invasive breast cancer',
    duration: '5 years',
    sideEffects: ['Joint pain/stiffness', 'Hot flashes', 'Bone density loss', 'Musculoskeletal pain'],
    contraindications: ['Premenopausal', 'Severe osteoporosis'],
    keyTrials: ['IBIS-II (Cuzick 2014)'],
  },
];

/**
 * Check chemoprevention eligibility based on USPSTF guidelines.
 */
export async function getChemopreventionEligibility(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  const profile = await prisma.preventProfile.findUnique({ where: { patientId: patient.id } });
  if (!profile) throw new Error('Prevention profile not found');

  const latestRisk = await prisma.riskAssessment.findFirst({
    where: { patientId: patient.id },
    orderBy: { assessmentDate: 'desc' },
  });

  const fiveYearRisk = latestRisk?.fiveYearRiskEstimate ?? 0;
  const riskThreshold = 3.0; // USPSTF: 5-year risk >= 3%
  const eligible = fiveYearRisk >= riskThreshold;

  const isPostmenopausal = profile.menopausalStatus === 'postmenopausal';

  // Filter medications by eligibility
  const medications = CHEMO_MEDICATIONS.filter((med) => {
    if (!isPostmenopausal && (med.type === 'Aromatase Inhibitor' || med.name === 'Raloxifene')) {
      return false;
    }
    return true;
  });

  const contraindications: string[] = [];
  if (profile.hrtCurrent) {
    contraindications.push('Current HRT use may interact with chemoprevention agents');
  }

  return {
    eligible,
    fiveYearRisk,
    riskThreshold,
    medications,
    contraindications,
  };
}

/**
 * Get cached chemoprevention guide or return null.
 */
export async function getChemopreventionGuide(userId: string) {
  const cacheKey = `prevent:chemo-guide:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  return null;
}

/**
 * Generate Claude-powered chemoprevention discussion guide.
 */
export async function generateChemopreventionGuide(userId: string) {
  const cacheKey = `prevent:chemo-guide:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  const profile = await prisma.preventProfile.findUnique({ where: { patientId: patient.id } });
  const eligibility = await getChemopreventionEligibility(userId);

  const msg = await anthropic.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Generate a chemoprevention discussion guide for a patient considering breast cancer risk-reduction medication.

Patient context:
- 5-year Gail risk: ${eligibility.fiveYearRisk.toFixed(1)}%
- Menopausal status: ${profile?.menopausalStatus ?? 'unknown'}
- Eligible medications: ${eligibility.medications.map(m => m.name).join(', ')}
- Risk threshold for eligibility: ${eligibility.riskThreshold}%

Return JSON:
{
  "overview": "Brief 2-3 sentence overview of chemoprevention for this patient",
  "medications": [
    {
      "name": "Drug name",
      "howItWorks": "Plain language mechanism",
      "benefits": "Key benefits for this patient",
      "risks": "Key risks to discuss",
      "patientProfile": "Who this drug is best suited for"
    }
  ],
  "questionsForDoctor": ["5-7 specific questions the patient should ask their oncologist"]
}`,
    }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const guide = jsonMatch ? JSON.parse(jsonMatch[0]) : { overview: text, medications: [], questionsForDoctor: [] };
  guide.generatedAt = new Date().toISOString();

  await redis.set(cacheKey, JSON.stringify(guide), 'EX', 7 * 24 * 60 * 60);
  return guide;
}
