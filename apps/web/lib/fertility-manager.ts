import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import type { PatientProfile } from '@oncovax/shared';

// ============================================================================
// Types
// ============================================================================

export interface FertilityRiskAssessment {
  gonadotoxicityRisk: string;
  riskFactors: { agent: string; risk: string; amenorrheaRate?: string }[];
  regimenMatch: { regimen: string; risk: string; amenorrheaRate: string } | null;
  preservationWindowDays: number | null;
  windowStatus: string;
  recommendation: string;
  recommendationRationale: string;
}

export interface PreservationOption {
  key: string;
  label: string;
  timing: string;
  cost: string;
  successRate: string;
  contraindications: string[];
  erPositiveNote: string | null;
  available: boolean;
  unavailableReason?: string;
}

export interface FertilityFinancialProgram {
  name: string;
  org: string;
  url: string;
  description: string;
  eligibility: string;
  maxBenefit: string;
  eligible: boolean;
  eligibleReason: string | null;
}

export interface DiscussionGuide {
  openingStatement: string;
  questions: { question: string; why: string }[];
  keyFacts: string[];
  timelineNotes: string[];
}

// ============================================================================
// Inline Constants — Gonadotoxicity Risk by Agent
// ============================================================================

const GONADOTOXICITY_AGENTS: Record<string, string> = {
  cyclophosphamide: 'high',
  ifosfamide: 'high',
  busulfan: 'high',
  melphalan: 'high',
  chlorambucil: 'high',
  procarbazine: 'high',
  cisplatin: 'moderate',
  carboplatin: 'moderate',
  doxorubicin: 'moderate',
  epirubicin: 'moderate',
  methotrexate: 'low',
  '5-fluorouracil': 'low',
  vincristine: 'low',
  bleomycin: 'low',
  trastuzumab: 'minimal',
  pertuzumab: 'minimal',
  tamoxifen: 'minimal',
};

// ============================================================================
// Inline Constants — Regimen Risk Map
// ============================================================================

const REGIMEN_RISK_MAP: { pattern: RegExp; risk: string; amenorrheaRate: string }[] = [
  { pattern: /ac[\s-]*t/i, risk: 'high', amenorrheaRate: '50-70%' },
  { pattern: /abvd/i, risk: 'moderate', amenorrheaRate: '10-30%' },
  { pattern: /chop/i, risk: 'high', amenorrheaRate: '40-60%' },
  { pattern: /\btc\b/i, risk: 'moderate', amenorrheaRate: '30-50%' },
  { pattern: /cmf/i, risk: 'high', amenorrheaRate: '60-80%' },
  { pattern: /bep/i, risk: 'moderate', amenorrheaRate: '20-40%' },
  { pattern: /folfox/i, risk: 'low', amenorrheaRate: '10-20%' },
];

// ============================================================================
// Inline Constants — Preservation Options
// ============================================================================

const PRESERVATION_OPTIONS_FEMALE: Record<
  string,
  {
    label: string;
    timing: string;
    cost: string;
    successRate: string;
    contraindications: string[];
    erPositiveNote: string | null;
  }
> = {
  egg_freezing: {
    label: 'Egg Freezing (Oocyte Cryopreservation)',
    timing: '10-14 days',
    cost: '$6,000-$15,000 + annual storage',
    successRate: '30-60% live birth per cycle (age dependent)',
    contraindications: [],
    erPositiveNote: 'Requires letrozole protocol to minimize estrogen exposure',
  },
  embryo_freezing: {
    label: 'Embryo Freezing',
    timing: '10-14 days',
    cost: '$6,000-$15,000 + annual storage',
    successRate: '40-65% live birth per transfer',
    contraindications: ['No partner or sperm donor available'],
    erPositiveNote: 'Requires letrozole protocol',
  },
  ovarian_tissue: {
    label: 'Ovarian Tissue Cryopreservation',
    timing: '1-2 days (surgery)',
    cost: '$10,000-$20,000',
    successRate: 'Emerging — growing evidence',
    contraindications: ['ER-positive cancer — risk of reimplanting cancer cells'],
    erPositiveNote: null,
  },
  gnrh_agonist: {
    label: 'GnRH Agonist (Ovarian Suppression)',
    timing: 'Can start with chemo',
    cost: '$500-$2,000/month',
    successRate: '50-70% menstrual recovery',
    contraindications: [],
    erPositiveNote: 'May be used alongside endocrine therapy',
  },
};

const PRESERVATION_OPTIONS_MALE: Record<
  string,
  {
    label: string;
    timing: string;
    cost: string;
    successRate: string;
    contraindications: string[];
  }
> = {
  sperm_banking: {
    label: 'Sperm Banking (Cryopreservation)',
    timing: '1-2 days',
    cost: '$500-$1,500 + annual storage',
    successRate: '95%+ with IVF',
    contraindications: [],
  },
};

// ============================================================================
// Inline Constants — Financial Programs
// ============================================================================

const FERTILITY_FINANCIAL_PROGRAMS: {
  name: string;
  org: string;
  url: string;
  description: string;
  eligibility: string;
  maxBenefit: string;
}[] = [
  {
    name: 'Livestrong Fertility',
    org: 'LIVESTRONG Foundation',
    url: 'https://www.livestrong.org/what-we-do/program/fertility',
    description: 'Discounted fertility preservation for cancer patients',
    eligibility: 'Cancer diagnosis, financial need',
    maxBenefit: 'Varies by partner clinic',
  },
  {
    name: 'Team Maggie',
    org: 'Team Maggie Foundation',
    url: 'https://teammaggie.org',
    description: 'Grants for fertility preservation',
    eligibility: 'Under 40, cancer diagnosis',
    maxBenefit: 'Up to $3,000',
  },
  {
    name: 'The SAMFund',
    org: 'The SAMFund',
    url: 'https://thesamfund.org',
    description: 'Financial assistance for young adult cancer survivors',
    eligibility: 'Ages 17-39, post-treatment',
    maxBenefit: 'Up to $5,000 grant',
  },
  {
    name: 'Heartbeat Program',
    org: 'Fertile Hope / LIVESTRONG',
    url: 'https://www.livestrong.org/what-we-do/program/fertility',
    description: 'Discounted/free fertility drugs',
    eligibility: 'Cancer diagnosis, limited income',
    maxBenefit: 'Free fertility medications',
  },
  {
    name: 'State Fertility Mandates',
    org: 'Various states',
    url: 'https://resolve.org/learn/financial-resources-for-family-building/insurance-coverage/state-fertility-insurance-laws/',
    description: 'State laws requiring insurance coverage of fertility preservation for iatrogenic infertility',
    eligibility: 'Varies by state — CT, DE, IL, MD, NY, NJ, RI, CO, UT, NH, CA, OR',
    maxBenefit: 'Full insurance coverage',
  },
];

const STATE_FERTILITY_MANDATE_STATES = [
  'CT', 'DE', 'IL', 'MD', 'NY', 'NJ', 'RI', 'CO', 'UT', 'NH', 'CA', 'OR',
];

// ============================================================================
// Haversine Distance (inline — same pattern as administration sites)
// ============================================================================

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ============================================================================
// 1. Assess Fertility Risk
// ============================================================================

export async function assessFertilityRisk(patientId: string) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');

  const profile = (patient.profile as PatientProfile | null) ?? {};
  const age = (profile as any)?.age ?? null;
  const sex: string = (profile as any)?.sex ?? 'female';
  const treatmentPlan: string =
    (profile as any)?.priorTreatments
      ?.map((t: any) => t.name || t.type || String(t))
      .join(', ') ??
    (profile as any)?.treatmentPlan ??
    '';

  // Classify agents
  const riskFactors: { agent: string; risk: string; amenorrheaRate?: string }[] = [];
  const treatmentLower = treatmentPlan.toLowerCase();

  for (const [agent, risk] of Object.entries(GONADOTOXICITY_AGENTS)) {
    if (treatmentLower.includes(agent.toLowerCase())) {
      riskFactors.push({ agent, risk });
    }
  }

  // Overall risk: highest of any matched agent
  const riskLevels = riskFactors.map((rf) => rf.risk);
  let gonadotoxicityRisk = 'low';
  if (riskLevels.includes('high')) {
    gonadotoxicityRisk = 'high';
  } else if (riskLevels.includes('moderate')) {
    gonadotoxicityRisk = 'moderate';
  } else if (riskLevels.includes('minimal')) {
    gonadotoxicityRisk = 'minimal';
  }

  // Check regimen patterns
  let regimenMatch: { regimen: string; risk: string; amenorrheaRate: string } | null = null;
  for (const entry of REGIMEN_RISK_MAP) {
    if (entry.pattern.test(treatmentPlan)) {
      regimenMatch = {
        regimen: entry.pattern.source,
        risk: entry.risk,
        amenorrheaRate: entry.amenorrheaRate,
      };
      // If regimen risk is higher, upgrade overall risk
      if (
        entry.risk === 'high' ||
        (entry.risk === 'moderate' && gonadotoxicityRisk !== 'high')
      ) {
        gonadotoxicityRisk = entry.risk;
      }
      // Annotate matching risk factors with amenorrhea rate
      riskFactors.forEach((rf) => {
        if (!rf.amenorrheaRate) rf.amenorrheaRate = entry.amenorrheaRate;
      });
      break;
    }
  }

  // Calculate preservation window
  let preservationWindowDays: number | null = null;
  const treatmentStartDate = (profile as any)?.treatmentStartDate;
  if (treatmentStartDate) {
    const start = new Date(treatmentStartDate);
    const now = new Date();
    preservationWindowDays = Math.round(
      (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  // Window status
  let windowStatus: string;
  if (preservationWindowDays === null) {
    windowStatus = 'unknown';
  } else if (preservationWindowDays > 14) {
    windowStatus = 'open';
  } else if (preservationWindowDays >= 1) {
    windowStatus = 'closing';
  } else {
    windowStatus = 'closed';
  }

  // Recommendation
  let recommendation: string;
  let recommendationRationale: string;

  if (gonadotoxicityRisk === 'minimal') {
    recommendation = 'not_indicated';
    recommendationRationale =
      'Your planned treatment has minimal gonadotoxicity risk. Fertility preservation is generally not indicated, but you can discuss options with your oncologist if family building is important to you.';
  } else if (gonadotoxicityRisk === 'low') {
    recommendation = 'discuss_options';
    recommendationRationale =
      'Your planned treatment carries a low but real risk to fertility. We recommend discussing preservation options with your oncologist, especially if having biological children is a priority.';
  } else if (
    (gonadotoxicityRisk === 'high' || gonadotoxicityRisk === 'moderate') &&
    windowStatus === 'closing'
  ) {
    recommendation = 'urgent_referral';
    recommendationRationale =
      'Your treatment window is narrowing and your regimen carries significant fertility risk. An urgent fertility preservation referral is strongly recommended.';
  } else if (
    (gonadotoxicityRisk === 'high' || gonadotoxicityRisk === 'moderate') &&
    (windowStatus === 'open' || windowStatus === 'unknown')
  ) {
    recommendation = 'recommended';
    recommendationRationale =
      'Your treatment regimen carries meaningful fertility risk. Fertility preservation is recommended before starting treatment. There is time to explore options.';
  } else {
    recommendation = 'discuss_options';
    recommendationRationale =
      'We recommend discussing fertility preservation options with your care team before beginning treatment.';
  }

  // Upsert FertilityAssessment
  const existing = await prisma.fertilityAssessment.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });

  const assessmentData = {
    gonadotoxicityRisk,
    riskFactors: riskFactors as any,
    preservationWindowDays,
    windowStatus,
    recommendation,
    recommendationRationale,
  };

  let assessment;
  if (existing) {
    assessment = await prisma.fertilityAssessment.update({
      where: { id: existing.id },
      data: assessmentData,
    });
  } else {
    assessment = await prisma.fertilityAssessment.create({
      data: {
        patientId,
        ...assessmentData,
      },
    });
  }

  return assessment;
}

// ============================================================================
// 2. Get Fertility Assessment
// ============================================================================

export async function getFertilityAssessment(patientId: string) {
  return prisma.fertilityAssessment.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================================================
// 3. Get Preservation Options
// ============================================================================

export async function getPreservationOptions(
  patientId: string,
): Promise<PreservationOption[]> {
  const assessment = await prisma.fertilityAssessment.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');

  const profile = (patient.profile as PatientProfile | null) ?? {};
  const sex: string = (profile as any)?.sex ?? 'female';

  // Male path
  if (sex === 'male') {
    return Object.entries(PRESERVATION_OPTIONS_MALE).map(([key, opt]) => ({
      key,
      label: opt.label,
      timing: opt.timing,
      cost: opt.cost,
      successRate: opt.successRate,
      contraindications: opt.contraindications,
      erPositiveNote: null,
      available: true,
    }));
  }

  // Female path
  const windowDays = assessment?.preservationWindowDays ?? null;

  // Determine ER+ status
  const cancerSubtype: string = (profile as any)?.cancerSubtype ?? '';
  const receptorStatus = (profile as any)?.receptorStatus;
  const erStatus: string = receptorStatus?.er?.status ?? '';
  const isERPositive =
    erStatus.toLowerCase() === 'positive' ||
    cancerSubtype.toLowerCase().includes('er+') ||
    cancerSubtype.toLowerCase().includes('er positive') ||
    cancerSubtype.toLowerCase().includes('luminal');

  const options: PreservationOption[] = [];

  for (const [key, opt] of Object.entries(PRESERVATION_OPTIONS_FEMALE)) {
    let available = true;
    let unavailableReason: string | undefined;
    let erNote = opt.erPositiveNote;

    // Time-based filtering for egg/embryo freezing
    if ((key === 'egg_freezing' || key === 'embryo_freezing') && windowDays !== null && windowDays < 10) {
      available = false;
      unavailableReason = `Requires 10-14 days — your treatment window is ${windowDays} days. Discuss with your fertility specialist if random-start protocol could shorten this.`;
    }

    // ER+ filtering
    if (isERPositive) {
      // Exclude ovarian tissue for ER+ patients
      if (key === 'ovarian_tissue') {
        available = false;
        unavailableReason =
          'Not recommended for ER-positive cancers due to risk of reimplanting hormone-sensitive cancer cells.';
      }

      // Keep erPositiveNote for egg/embryo freezing (letrozole protocol)
      // Already set from constant
    } else {
      // Non-ER+: clear the ER note
      erNote = null;
    }

    options.push({
      key,
      label: opt.label,
      timing: opt.timing,
      cost: opt.cost,
      successRate: opt.successRate,
      contraindications: opt.contraindications,
      erPositiveNote: erNote,
      available,
      unavailableReason,
    });
  }

  return options;
}

// ============================================================================
// 4. Get Fertility Providers
// ============================================================================

export async function getFertilityProviders(
  patientId: string,
  filters?: {
    oncologyExperience?: boolean;
    randomStart?: boolean;
    letrozole?: boolean;
    weekend?: boolean;
    livestrong?: boolean;
  },
) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');

  // Build where clause
  const where: any = { isActive: true };
  if (filters?.oncologyExperience) where.oncologyExperience = true;
  if (filters?.randomStart) where.randomStartProtocol = true;
  if (filters?.letrozole) where.letrozoleProtocol = true;
  if (filters?.weekend) where.weekendAvailability = true;
  if (filters?.livestrong) where.livestrongPartner = true;

  const providers = await prisma.fertilityProvider.findMany({ where });

  // Compute distance if patient has lat/lng
  const patientLat = patient.lat;
  const patientLng = patient.lng;

  const withDistance = providers.map((p) => {
    let distance: number | null = null;
    if (patientLat != null && patientLng != null && p.latitude != null && p.longitude != null) {
      distance = Math.round(haversineDistance(patientLat, patientLng, p.latitude, p.longitude) * 10) / 10;
    }
    return { ...p, distance };
  });

  // Sort by distance if available, otherwise by name
  withDistance.sort((a, b) => {
    if (a.distance != null && b.distance != null) return a.distance - b.distance;
    if (a.distance != null) return -1;
    if (b.distance != null) return 1;
    return a.name.localeCompare(b.name);
  });

  return withDistance;
}

// ============================================================================
// 5. Get Fertility Financial Programs
// ============================================================================

export async function getFertilityFinancialPrograms(
  patientId: string,
): Promise<FertilityFinancialProgram[]> {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');

  const profile = (patient.profile as PatientProfile | null) ?? {};
  const age: number | null = (profile as any)?.age ?? null;
  const state: string | null =
    (profile as any)?.state ?? (profile as any)?.stateOfResidence ?? null;

  return FERTILITY_FINANCIAL_PROGRAMS.map((program) => {
    let eligible = true;
    let eligibleReason: string | null = null;

    // Team Maggie: under 40
    if (program.name === 'Team Maggie') {
      if (age !== null && age >= 40) {
        eligible = false;
        eligibleReason = 'Requires age under 40';
      } else if (age !== null) {
        eligibleReason = 'Age requirement met';
      }
    }

    // The SAMFund: ages 17-39
    if (program.name === 'The SAMFund') {
      if (age !== null && (age < 17 || age > 39)) {
        eligible = false;
        eligibleReason = 'Requires ages 17-39';
      } else if (age !== null) {
        eligibleReason = 'Age requirement met';
      }
    }

    // State Fertility Mandates: check patient state
    if (program.name === 'State Fertility Mandates') {
      if (state) {
        const stateUpper = state.toUpperCase().trim();
        if (STATE_FERTILITY_MANDATE_STATES.includes(stateUpper)) {
          eligible = true;
          eligibleReason = `${stateUpper} has a fertility preservation insurance mandate`;
        } else {
          eligible = false;
          eligibleReason = `${stateUpper} does not currently have a fertility preservation mandate`;
        }
      } else {
        eligible = false;
        eligibleReason = 'State of residence not on file — update your profile to check eligibility';
      }
    }

    return {
      name: program.name,
      org: program.org,
      url: program.url,
      description: program.description,
      eligibility: program.eligibility,
      maxBenefit: program.maxBenefit,
      eligible,
      eligibleReason,
    };
  });
}

// ============================================================================
// 6. Generate Discussion Guide (Claude-powered)
// ============================================================================

export async function generateDiscussionGuide(
  patientId: string,
): Promise<DiscussionGuide> {
  // Check Redis cache
  const cacheKey = `fertility:guide:${patientId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as DiscussionGuide;

  // Load patient + assessment
  const [patient, assessment] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.fertilityAssessment.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!patient) throw new Error('Patient not found');

  const profile = (patient.profile as PatientProfile | null) ?? {};
  const riskFactors = (assessment?.riskFactors as any[]) ?? [];
  const windowStatus = assessment?.windowStatus ?? 'unknown';
  const windowDays = assessment?.preservationWindowDays;
  const risk = assessment?.gonadotoxicityRisk ?? 'unknown';

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: `You are a compassionate oncofertility counselor. Generate a fertility discussion guide for a cancer patient to bring to their oncologist appointment.

KEY TONE RULES:
- The oncologist is an ally, not an adversary
- Empowering, not confrontational
- Warm and supportive, not clinical or cold
- Acknowledge that fertility conversations can be emotional
- Focus on shared decision-making

Return ONLY valid JSON with this exact structure:
{
  "openingStatement": "string — a warm, prepared opening the patient can use to raise the topic with their oncologist",
  "questions": [{ "question": "string — specific question to ask", "why": "string — brief explanation of why this question matters" }],
  "keyFacts": ["string — important facts about their specific fertility risk to be aware of"],
  "timelineNotes": ["string — time-sensitive considerations for their situation"]
}`,
    messages: [
      {
        role: 'user',
        content: `Patient context:
- Cancer type: ${(profile as any)?.cancerType || 'not specified'}
- Cancer subtype: ${(profile as any)?.cancerSubtype || 'not specified'}
- Stage: ${(profile as any)?.stage || 'not specified'}
- Age: ${(profile as any)?.age || 'not specified'}
- Sex: ${(profile as any)?.sex || 'not specified'}
- Treatment plan: ${(profile as any)?.priorTreatments?.map((t: any) => t.name || t.type || String(t)).join(', ') || (profile as any)?.treatmentPlan || 'not specified'}

Fertility risk assessment:
- Overall gonadotoxicity risk: ${risk}
- Risk factors: ${JSON.stringify(riskFactors)}
- Preservation window: ${windowDays != null ? `${windowDays} days` : 'unknown'}
- Window status: ${windowStatus}

Generate 5-8 specific, personalized questions for this patient. Include their treatment agents and timeline in the questions where relevant.`,
      },
    ],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;
  let guide: DiscussionGuide;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    guide = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    guide = {
      openingStatement:
        'I would like to discuss how my treatment plan might affect my fertility, and what preservation options might be available to me before we begin.',
      questions: [
        {
          question: 'How might my specific treatment regimen affect my fertility?',
          why: 'Understanding the specific risk from your planned agents helps inform preservation decisions.',
        },
        {
          question: 'Is there time to pursue fertility preservation before we start treatment?',
          why: 'Many preservation methods require 10-14 days, so timing is critical.',
        },
        {
          question: 'Can you refer me to a fertility specialist with oncology experience?',
          why: 'Oncofertility specialists understand how to coordinate preservation with cancer treatment timelines.',
        },
      ],
      keyFacts: [
        'Fertility preservation is most effective when done before treatment begins.',
        'Your oncologist can coordinate with a fertility specialist to avoid treatment delays.',
      ],
      timelineNotes: [
        'Discuss fertility preservation at your next oncology appointment — ideally before finalizing your treatment start date.',
      ],
    };
  }

  // Cache for 7 days
  await redis.set(cacheKey, JSON.stringify(guide), 'EX', 7 * 24 * 60 * 60);

  return guide;
}

// ============================================================================
// 7. Request Fertility Referral
// ============================================================================

export async function requestFertilityReferral(
  assessmentId: string,
  providerId: string,
) {
  return prisma.fertilityAssessment.update({
    where: { id: assessmentId },
    data: {
      referralRequested: true,
      providerId,
      referralRequestedAt: new Date(),
    },
  });
}

// ============================================================================
// 8. Update Fertility Outcome
// ============================================================================

export async function updateFertilityOutcome(
  assessmentId: string,
  input: {
    preservationPursued?: boolean;
    preservationMethod?: string;
    preservationCompleted?: boolean;
  },
) {
  const data: any = {};
  if (input.preservationPursued !== undefined) data.preservationPursued = input.preservationPursued;
  if (input.preservationMethod !== undefined) data.preservationMethod = input.preservationMethod;
  if (input.preservationCompleted !== undefined) data.preservationCompleted = input.preservationCompleted;

  return prisma.fertilityAssessment.update({
    where: { id: assessmentId },
    data,
  });
}
