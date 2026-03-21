import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import type { PatientProfile } from '@iish/shared';

// ============================================================================
// Types
// ============================================================================

export interface LogisticsAssistanceProgram {
  key: string;
  name: string;
  provider: string;
  category: 'flights' | 'lodging' | 'ground' | 'trial_specific' | 'childcare' | 'other';
  description: string;
  coverage: string;
  phone: string;
  url: string;
  eligibility: string;
}

export interface AnnotatedAssistanceProgram extends LogisticsAssistanceProgram {
  eligible: boolean;
  eligibleReason: string | null;
}

export interface CostEstimate {
  transportation: number;
  lodging: number;
  meals: number;
  parking: number;
  perVisit: number;
  totalEstimated: number;
  visitCount: number;
}

export interface LogisticsAssessmentResult {
  id: string;
  patientId: string;
  matchId: string;
  siteId: string | null;
  distanceMiles: number | null;
  estimatedCosts: CostEstimate;
  matchedPrograms: AnnotatedAssistanceProgram[];
  estimatedOutOfPocket: number;
  feasibilityScore: string;
  barriers: string[];
  travelMode: string;
}

export interface LogisticsPlanSection {
  title: string;
  content: string;
  tips: string[];
}

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
// Inline Constants — Assistance Programs (14 programs, 6 categories)
// ============================================================================

const LOGISTICS_ASSISTANCE_PROGRAMS: LogisticsAssistanceProgram[] = [
  // --- Flights ---
  {
    key: 'corporate_angel_network',
    name: 'Corporate Angel Network',
    provider: 'Corporate Angel Network',
    category: 'flights',
    description: 'Free flights on corporate jets for cancer patients traveling to treatment',
    coverage: 'Free seats on corporate aircraft — no financial need requirement',
    phone: '1-866-328-1313',
    url: 'https://www.corpangelnetwork.org',
    eligibility: 'Cancer patient traveling to recognized treatment center; can walk unassisted',
  },
  {
    key: 'angel_flight',
    name: 'Angel Flight America',
    provider: 'Angel Flight',
    category: 'flights',
    description: 'Volunteer pilots providing free air transportation for patients with financial need',
    coverage: 'Free flights via volunteer pilots for trips up to 1,000 miles',
    phone: '1-877-621-7177',
    url: 'https://www.angelflightamerica.org',
    eligibility: 'Demonstrated financial need; ambulatory; travel for medical treatment',
  },
  {
    key: 'mercy_medical_airlift',
    name: 'Mercy Medical Airlift',
    provider: 'Mercy Medical Airlift',
    category: 'flights',
    description: 'Commercial airline tickets for patients with financial need traveling for treatment',
    coverage: 'Discounted or free commercial airline tickets',
    phone: '1-800-296-1217',
    url: 'https://www.mercymedical.org',
    eligibility: 'Financial need; referral from medical professional or social worker',
  },

  // --- Lodging ---
  {
    key: 'hope_lodge',
    name: 'ACS Hope Lodge',
    provider: 'American Cancer Society',
    category: 'lodging',
    description: 'Free lodging for cancer patients and caregivers near treatment centers — 31 locations nationwide',
    coverage: 'Free private room and shared common areas — no income requirements',
    phone: '1-800-227-2345',
    url: 'https://www.cancer.org/treatment/support-programs-and-services/patient-lodging/hope-lodge.html',
    eligibility: 'Cancer patient in active treatment; treatment facility 40+ miles from home',
  },
  {
    key: 'ronald_mcdonald',
    name: 'Ronald McDonald House',
    provider: 'Ronald McDonald House Charities',
    category: 'lodging',
    description: 'Free or low-cost lodging near hospitals — primarily for pediatric and young adult patients',
    coverage: 'Free or suggested donation of $10-25/night',
    phone: '1-630-623-7048',
    url: 'https://www.rmhc.org',
    eligibility: 'Pediatric or young adult cancer patient (typically under 21); family housing',
  },
  {
    key: 'joes_house',
    name: "Joe's House",
    provider: "Joe's House",
    category: 'lodging',
    description: 'Online directory of discounted lodging near major treatment centers',
    coverage: 'Discounted hotel rates near cancer centers — typically 30-50% off',
    phone: '1-877-563-7468',
    url: 'https://www.joeshouse.org',
    eligibility: 'Any cancer patient traveling for treatment',
  },

  // --- Ground ---
  {
    key: 'road_to_recovery',
    name: 'ACS Road to Recovery',
    provider: 'American Cancer Society',
    category: 'ground',
    description: 'Volunteer drivers provide free rides to and from treatment appointments',
    coverage: 'Free transportation to/from treatment — volunteer drivers',
    phone: '1-800-227-2345',
    url: 'https://www.cancer.org/treatment/support-programs-and-services/road-to-recovery.html',
    eligibility: 'Cancer patient needing rides to treatment; availability varies by location',
  },
  {
    key: 'gas_card',
    name: 'Gas Card Assistance',
    provider: 'CancerCare / Patient Advocate Foundation',
    category: 'ground',
    description: 'Gas cards and fuel assistance for patients driving to treatment',
    coverage: 'Gas cards typically $25-$100 per cycle; may reapply',
    phone: '1-800-813-4673',
    url: 'https://www.cancercare.org/financial_assistance',
    eligibility: 'Cancer patient with financial need; diagnosis-specific funds available',
  },

  // --- Trial-specific ---
  {
    key: 'lazarex',
    name: 'Lazarex Cancer Foundation',
    provider: 'Lazarex Cancer Foundation',
    category: 'trial_specific',
    description: 'Financial assistance specifically for clinical trial travel — up to $1,500/month',
    coverage: 'Up to $1,500/month for travel, lodging, and meals related to clinical trial participation',
    phone: '1-925-820-4517',
    url: 'https://www.lazarex.org',
    eligibility: 'Enrolled in or actively screening for a clinical trial; financial need',
  },
  {
    key: 'trial_stipend',
    name: 'Trial Sponsor Stipend',
    provider: 'Trial Sponsor',
    category: 'trial_specific',
    description: 'Many trial sponsors offer per-visit stipends to offset travel costs — ask your trial coordinator',
    coverage: 'Typically $50-500 per visit depending on sponsor and visit complexity',
    phone: 'N/A — contact trial coordinator',
    url: 'https://clinicaltrials.gov',
    eligibility: 'Enrolled in a clinical trial that offers participant stipends',
  },

  // --- Childcare ---
  {
    key: 'family_reach',
    name: 'Family Reach',
    provider: 'Family Reach Foundation',
    category: 'childcare',
    description: 'Grants to cover childcare costs during cancer treatment',
    coverage: 'Financial grants for childcare, housing, and other non-medical costs',
    phone: '1-973-394-1411',
    url: 'https://familyreach.org',
    eligibility: 'Cancer patient with children; demonstrated financial hardship',
  },

  // --- Other ---
  {
    key: 'patient_access_network',
    name: 'Patient Access Network',
    provider: 'Patient Access Network Foundation',
    category: 'other',
    description: 'Co-pay assistance for underinsured cancer patients',
    coverage: 'Assistance with out-of-pocket costs for treatment — disease-specific funds',
    phone: '1-866-316-7263',
    url: 'https://www.panfoundation.org',
    eligibility: 'Underinsured; income below 400% FPL; specific diagnosis fund must be open',
  },
  {
    key: 'cancercare_copay',
    name: 'CancerCare Co-Pay Assistance',
    provider: 'CancerCare',
    category: 'other',
    description: 'Financial assistance for treatment co-pays and related costs',
    coverage: 'Co-pay assistance grants — amounts vary by diagnosis and fund availability',
    phone: '1-800-813-4673',
    url: 'https://www.cancercare.org/copayfoundation',
    eligibility: 'Cancer diagnosis; underinsured; income qualifications vary by fund',
  },
  {
    key: 'needymeds',
    name: 'NeedyMeds',
    provider: 'NeedyMeds',
    category: 'other',
    description: 'Comprehensive database of patient assistance programs, coupons, and resources',
    coverage: 'Database and referral resource — connects patients to 5,000+ assistance programs',
    phone: '1-800-503-6897',
    url: 'https://www.needymeds.org',
    eligibility: 'Any patient seeking financial assistance — free to search',
  },
];

// ============================================================================
// Helper — Estimate visit count from trial phase
// ============================================================================

function estimateVisitCount(phase: string | null | undefined): number {
  if (!phase) return 8;
  const phaseLower = phase.toLowerCase();
  if (phaseLower.includes('1') || phaseLower.includes('i')) return 12;
  if (phaseLower.includes('2') || phaseLower.includes('ii')) return 8;
  if (phaseLower.includes('3') || phaseLower.includes('iii')) return 6;
  return 8;
}

// ============================================================================
// 1. Assess Trial Logistics
// ============================================================================

export async function assessTrialLogistics(patientId: string, matchId: string) {
  // Load patient
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');

  // Load match with trial and sites
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { trial: { include: { sites: true } } },
  });
  if (!match) throw new Error('Match not found');

  const patientLat = patient.lat;
  const patientLng = patient.lng;

  // Find nearest site via Haversine distance
  let nearestSite: (typeof match.trial.sites)[number] | null = null;
  let distanceMiles: number | null = null;

  if (patientLat != null && patientLng != null && match.trial.sites.length > 0) {
    for (const site of match.trial.sites) {
      if (site.lat != null && site.lng != null) {
        const dist = haversineDistance(patientLat, patientLng, site.lat, site.lng);
        if (distanceMiles === null || dist < distanceMiles) {
          distanceMiles = Math.round(dist * 10) / 10;
          nearestSite = site;
        }
      }
    }
  }

  // Drive/fly threshold
  const effectiveDistance = distanceMiles ?? 0;
  const travelMode = effectiveDistance < 300 ? 'drive' : 'fly';

  // Cost estimates per visit
  const transportationCost =
    travelMode === 'drive'
      ? Math.round(((effectiveDistance * 2) / 25) * 3.5 + 25) // round trip / 25 MPG * $3.50/gal + tolls
      : 300; // flat fly cost

  // Hope Lodge eligible if > 40 miles
  const hopeLodgeEligible = effectiveDistance > 40;
  const lodgingCost = hopeLodgeEligible ? 0 : 175; // $175/night, free if Hope Lodge eligible
  const mealsCost = 20; // $20/day
  const parkingCost = 20; // $20/day

  const perVisitCost = transportationCost + lodgingCost + mealsCost + parkingCost;
  const visitCount = estimateVisitCount(match.trial.phase);
  const totalEstimated = perVisitCost * visitCount;

  const estimatedCosts: CostEstimate = {
    transportation: transportationCost,
    lodging: lodgingCost,
    meals: mealsCost,
    parking: parkingCost,
    perVisit: perVisitCost,
    totalEstimated,
    visitCount,
  };

  // Match assistance programs with eligibility
  const matchedPrograms: AnnotatedAssistanceProgram[] = LOGISTICS_ASSISTANCE_PROGRAMS.map(
    (program) => {
      let eligible = true;
      let eligibleReason: string | null = null;

      switch (program.key) {
        case 'hope_lodge':
          if (hopeLodgeEligible) {
            eligibleReason = `Treatment site is ${effectiveDistance} miles from home (>40 mile threshold)`;
          } else {
            eligible = false;
            eligibleReason = `Treatment site is ${effectiveDistance} miles from home (requires 40+ miles)`;
          }
          break;

        case 'corporate_angel_network':
        case 'angel_flight':
        case 'mercy_medical_airlift':
          if (effectiveDistance >= 300) {
            eligibleReason = 'Air travel recommended based on distance';
          } else {
            eligible = false;
            eligibleReason = `Distance is ${effectiveDistance} miles — driving is more practical`;
          }
          break;

        case 'road_to_recovery':
        case 'gas_card':
          if (effectiveDistance > 0 && effectiveDistance < 300) {
            eligibleReason = 'Ground transportation assistance applicable for driving distance';
          } else if (effectiveDistance >= 300) {
            eligible = false;
            eligibleReason = 'Air travel recommended — ground programs less applicable';
          } else {
            eligibleReason = 'Available if driving to treatment';
          }
          break;

        case 'lazarex':
          eligibleReason = 'You are being matched to a clinical trial — Lazarex specifically supports trial travel';
          break;

        case 'trial_stipend':
          eligibleReason = 'Ask your trial coordinator if the sponsor offers travel stipends';
          break;

        case 'ronald_mcdonald': {
          const profile = (patient.profile as PatientProfile | null) ?? {};
          const age: number | null = (profile as any)?.age ?? null;
          if (age !== null && age > 21) {
            eligible = false;
            eligibleReason = 'Primarily for pediatric/young adult patients (typically under 21)';
          } else if (age !== null) {
            eligibleReason = 'Age-eligible for Ronald McDonald House';
          } else {
            eligibleReason = 'Primarily for pediatric/young adult patients — check local availability';
          }
          break;
        }

        case 'family_reach': {
          eligibleReason = 'Available if you have children and face financial hardship from treatment';
          break;
        }

        default:
          eligibleReason = null;
          break;
      }

      return { ...program, eligible, eligibleReason };
    },
  );

  // Estimate out-of-pocket after eligible programs
  let estimatedOutOfPocket = totalEstimated;

  // If Hope Lodge eligible, lodging savings already reflected (lodgingCost = 0)
  // If Lazarex eligible, subtract up to $1,500/month (approximate across visit schedule)
  const lazarexEligible = matchedPrograms.find((p) => p.key === 'lazarex')?.eligible ?? false;
  if (lazarexEligible) {
    // Assume trial lasts ~6 months, Lazarex covers up to $1,500/month
    const lazarexSavings = Math.min(totalEstimated, 6 * 1500);
    estimatedOutOfPocket = Math.max(0, estimatedOutOfPocket - lazarexSavings);
  }

  // Flight programs — if eligible, subtract flight costs
  const flightProgramEligible = matchedPrograms.some(
    (p) => p.category === 'flights' && p.eligible,
  );
  if (flightProgramEligible && travelMode === 'fly') {
    estimatedOutOfPocket = Math.max(
      0,
      estimatedOutOfPocket - transportationCost * visitCount,
    );
  }

  // Ground programs — if eligible, subtract gas costs
  const groundProgramEligible = matchedPrograms.some(
    (p) => p.category === 'ground' && p.eligible,
  );
  if (groundProgramEligible && travelMode === 'drive') {
    const gasSavings = Math.min(transportationCost * visitCount, visitCount * 75);
    estimatedOutOfPocket = Math.max(0, estimatedOutOfPocket - gasSavings);
  }

  estimatedOutOfPocket = Math.round(estimatedOutOfPocket);

  // Score feasibility
  let feasibilityScore: string;
  if (effectiveDistance < 50) {
    feasibilityScore = 'straightforward';
  } else if (effectiveDistance < 200) {
    feasibilityScore = 'manageable';
  } else if (effectiveDistance < 500) {
    feasibilityScore = 'challenging';
  } else {
    feasibilityScore = 'very_challenging';
  }

  // Identify barriers
  const barriers: string[] = [];
  if (effectiveDistance >= 300) {
    barriers.push('Distance exceeds 300 miles — air travel required');
  }
  if (!hopeLodgeEligible && effectiveDistance > 0) {
    barriers.push('No Hope Lodge eligibility — lodging costs apply (under 40-mile threshold)');
  }
  if (effectiveDistance >= 500) {
    barriers.push('Significant distance may limit visit frequency — discuss remote monitoring options');
  }
  if (distanceMiles === null) {
    barriers.push('Patient location unknown — unable to calculate distance and travel costs');
  }
  if (match.trial.sites.length === 0) {
    barriers.push('No trial sites with known coordinates — contact trial sponsor for site information');
  }
  if (nearestSite && nearestSite.lat == null) {
    barriers.push('Nearest site coordinates unavailable — distance is estimated');
  }
  if (visitCount >= 10) {
    barriers.push(`Phase ${match.trial.phase || 'unknown'} trial requires approximately ${visitCount} visits — higher cumulative travel burden`);
  }

  // Upsert TrialLogisticsAssessment
  const assessment = await prisma.trialLogisticsAssessment.upsert({
    where: { patientId_matchId: { patientId, matchId } },
    create: {
      patientId,
      matchId,
      siteId: nearestSite?.id ?? null,
      distanceMiles,
      estimatedCosts: estimatedCosts as any,
      matchedPrograms: matchedPrograms as any,
      estimatedOutOfPocket,
      feasibilityScore,
      barriers,
    },
    update: {
      siteId: nearestSite?.id ?? null,
      distanceMiles,
      estimatedCosts: estimatedCosts as any,
      matchedPrograms: matchedPrograms as any,
      estimatedOutOfPocket,
      feasibilityScore,
      barriers,
    },
  });

  return assessment;
}

// ============================================================================
// 2. Get Logistics Assessment
// ============================================================================

export async function getLogisticsAssessment(patientId: string, matchId: string) {
  return prisma.trialLogisticsAssessment.findUnique({
    where: { patientId_matchId: { patientId, matchId } },
  });
}

// ============================================================================
// 3. Get Logistics Assessments (all for patient)
// ============================================================================

export async function getLogisticsAssessments(patientId: string) {
  return prisma.trialLogisticsAssessment.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================================================
// 4. Get Assistance Programs
// ============================================================================

export async function getAssistancePrograms(
  patientId: string,
): Promise<AnnotatedAssistanceProgram[]> {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');

  const profile = (patient.profile as PatientProfile | null) ?? {};
  const age: number | null = (profile as any)?.age ?? null;

  // Check if patient has any logistics assessments (for distance-based eligibility)
  const assessments = await prisma.trialLogisticsAssessment.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });

  const hasAssessment = assessments.length > 0;
  const latestDistance = hasAssessment ? (assessments[0].distanceMiles ?? 0) : 0;
  const hopeLodgeEligible = latestDistance > 40;

  // Check if patient has any matches (for trial-specific programs)
  const matchCount = await prisma.match.count({ where: { patientId } });
  const hasMatches = matchCount > 0;

  return LOGISTICS_ASSISTANCE_PROGRAMS.map((program) => {
    let eligible = true;
    let eligibleReason: string | null = null;

    switch (program.key) {
      case 'hope_lodge':
        if (hasAssessment) {
          if (hopeLodgeEligible) {
            eligibleReason = `Nearest trial site is ${latestDistance} miles away (>40 mile threshold)`;
          } else {
            eligible = false;
            eligibleReason = `Nearest trial site is ${latestDistance} miles away (requires 40+ miles)`;
          }
        } else {
          eligibleReason = 'Run a logistics assessment to check distance eligibility';
        }
        break;

      case 'lazarex':
        if (hasMatches) {
          eligibleReason = 'You have clinical trial matches — Lazarex specifically supports trial participation travel';
        } else {
          eligible = false;
          eligibleReason = 'Requires enrollment in or screening for a clinical trial';
        }
        break;

      case 'trial_stipend':
        if (hasMatches) {
          eligibleReason = 'Ask your trial coordinator about available participant stipends';
        } else {
          eligible = false;
          eligibleReason = 'Requires enrollment in a clinical trial with sponsor stipend program';
        }
        break;

      case 'ronald_mcdonald':
        if (age !== null && age > 21) {
          eligible = false;
          eligibleReason = 'Primarily for pediatric/young adult patients (typically under 21)';
        } else if (age !== null) {
          eligibleReason = 'Age-eligible for Ronald McDonald House';
        } else {
          eligibleReason = 'Primarily for pediatric/young adult patients — check local availability';
        }
        break;

      case 'family_reach':
        eligibleReason = 'Available for cancer patients with children facing financial hardship';
        break;

      case 'corporate_angel_network':
        eligibleReason = 'Available for ambulatory cancer patients traveling to treatment — no financial need required';
        break;

      case 'angel_flight':
        eligibleReason = 'Free flights for patients with financial need — trips up to 1,000 miles';
        break;

      case 'mercy_medical_airlift':
        eligibleReason = 'Commercial airline assistance for patients with financial need';
        break;

      case 'road_to_recovery':
        eligibleReason = 'Free volunteer driver rides — availability varies by location';
        break;

      case 'gas_card':
        eligibleReason = 'Gas card assistance available based on diagnosis and financial need';
        break;

      case 'patient_access_network':
        eligibleReason = 'Co-pay assistance for underinsured patients — check if your diagnosis fund is open';
        break;

      case 'cancercare_copay':
        eligibleReason = 'Co-pay assistance available — amounts vary by diagnosis and fund availability';
        break;

      case 'needymeds':
        eligibleReason = 'Free database of 5,000+ assistance programs — always available';
        break;

      default:
        eligibleReason = null;
        break;
    }

    return { ...program, eligible, eligibleReason };
  });
}

// ============================================================================
// 5. Generate Logistics Plan (Claude-powered)
// ============================================================================

export async function generateLogisticsPlan(
  patientId: string,
  matchId: string,
): Promise<LogisticsPlanSection[]> {
  // Check Redis cache
  const cacheKey = `logistics:plan:${patientId}:${matchId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as LogisticsPlanSection[];

  // Load patient + assessment + match
  const [patient, assessment, match] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.trialLogisticsAssessment.findUnique({
      where: { patientId_matchId: { patientId, matchId } },
    }),
    prisma.match.findUnique({
      where: { id: matchId },
      include: { trial: { include: { sites: true } } },
    }),
  ]);

  if (!patient) throw new Error('Patient not found');
  if (!assessment) throw new Error('Logistics assessment not found — run assessTrialLogistics first');
  if (!match) throw new Error('Match not found');

  const profile = (patient.profile as PatientProfile | null) ?? {};
  const costs = assessment.estimatedCosts as CostEstimate | null;
  const programs = assessment.matchedPrograms as AnnotatedAssistanceProgram[] | null;
  const eligiblePrograms = (programs ?? []).filter((p) => p.eligible);

  const nearestSite = match.trial.sites.find((s) => s.id === assessment.siteId) ?? null;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 3072,
    system: `You are a clinical trial logistics coordinator helping a cancer patient plan travel to a clinical trial site. Generate a practical, actionable logistics plan.

KEY TONE RULES:
- Warm and empowering — clinical trials are hard enough without logistics stress
- Specific and actionable — not generic advice
- Cost-conscious — always mention free/low-cost options first
- Realistic — acknowledge challenges but frame them as solvable
- Safety-aware — mention medical considerations for travel during treatment

Return ONLY valid JSON with this exact structure:
{
  "sections": [
    {
      "title": "Getting There",
      "content": "string — detailed transportation plan including mode, specific options, booking tips",
      "tips": ["string — practical tip"]
    },
    {
      "title": "Staying There",
      "content": "string — lodging plan including free options, backup options, what to pack",
      "tips": ["string — practical tip"]
    },
    {
      "title": "Paying For It",
      "content": "string — financial plan including eligible programs, application order, cost reduction strategies",
      "tips": ["string — practical tip"]
    },
    {
      "title": "Managing Life at Home",
      "content": "string — practical advice for work, childcare, pets, household management during travel",
      "tips": ["string — practical tip"]
    }
  ]
}`,
    messages: [
      {
        role: 'user',
        content: `Patient context:
- Cancer type: ${(profile as any)?.cancerType || 'not specified'}
- Age: ${(profile as any)?.age || 'not specified'}
- Location: ${patient.zipCode || 'not specified'}

Trial information:
- Trial: ${match.trial.title}
- Phase: ${match.trial.phase || 'not specified'}
- Site: ${nearestSite ? `${nearestSite.facility || 'Unknown facility'}, ${nearestSite.city || ''} ${nearestSite.state || ''}` : 'not specified'}
- Distance: ${assessment.distanceMiles ? `${assessment.distanceMiles} miles` : 'unknown'}
- Travel mode: ${assessment.distanceMiles && assessment.distanceMiles >= 300 ? 'fly' : 'drive'}

Cost estimates:
- Per visit: $${costs?.perVisit ?? 'unknown'}
- Total estimated (${costs?.visitCount ?? '?'} visits): $${costs?.totalEstimated ?? 'unknown'}
- Transportation per visit: $${costs?.transportation ?? 'unknown'}
- Lodging per visit: $${costs?.lodging ?? 'unknown'}

Eligible assistance programs:
${eligiblePrograms.map((p) => `- ${p.name} (${p.category}): ${p.coverage}`).join('\n') || 'None identified'}

Feasibility: ${assessment.feasibilityScore}
Barriers: ${assessment.barriers.length > 0 ? assessment.barriers.join('; ') : 'None identified'}

Generate a comprehensive, personalized logistics plan with 3-5 specific tips per section. Reference the eligible programs by name.`,
      },
    ],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;
  let sections: LogisticsPlanSection[];

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    sections = parsed.sections;
  } catch {
    // Fallback plan
    sections = [
      {
        title: 'Getting There',
        content:
          assessment.distanceMiles && assessment.distanceMiles >= 300
            ? 'Air travel is recommended for your distance. Contact Corporate Angel Network (1-866-328-1313) for free corporate jet seats, or Angel Flight America (1-877-621-7177) for volunteer pilot flights.'
            : 'Driving is the most practical option for your distance. Contact ACS Road to Recovery (1-800-227-2345) for volunteer driver assistance, or apply for gas card assistance through CancerCare.',
        tips: [
          'Book travel 2-3 weeks in advance when possible',
          'Keep all receipts — some costs may be tax-deductible',
          'Ask your trial coordinator about scheduling visits to minimize trips',
        ],
      },
      {
        title: 'Staying There',
        content:
          assessment.distanceMiles && assessment.distanceMiles > 40
            ? 'You may qualify for ACS Hope Lodge (free, 1-800-227-2345). Apply early as rooms fill quickly. Joe\'s House (joeshouse.org) lists discounted lodging near treatment centers as a backup option.'
            : 'Same-day travel appears feasible for your distance. If you need to stay overnight for early appointments or multi-day visits, check Joe\'s House for discounted rates.',
        tips: [
          'Apply to Hope Lodge as soon as you confirm your trial enrollment',
          'Pack a go-bag with medications, insurance cards, and comfort items',
          'Ask the trial site about patient lounges for rest between appointments',
        ],
      },
      {
        title: 'Paying For It',
        content:
          'Apply to Lazarex Cancer Foundation (lazarex.org) for up to $1,500/month in trial travel assistance. Ask your trial coordinator about sponsor stipends. CancerCare and Patient Access Network may cover additional costs.',
        tips: [
          'Apply to multiple programs simultaneously — they can be combined',
          'Keep a spreadsheet of applications, deadlines, and status',
          'Ask your trial site social worker for additional local resources',
        ],
      },
      {
        title: 'Managing Life at Home',
        content:
          'Coordinate with your employer about flexible scheduling or FMLA leave for trial visits. If you have children, contact Family Reach (familyreach.org) for childcare grants. Build a support network of friends and family who can help with household tasks during travel days.',
        tips: [
          'Prepare meals in advance or set up a meal train with friends',
          'Arrange pet care backup for travel days',
          'Keep your employer informed — FMLA protects your job during medical leave',
        ],
      },
    ];
  }

  // Update assessment with logistics plan
  await prisma.trialLogisticsAssessment.update({
    where: { patientId_matchId: { patientId, matchId } },
    data: {
      logisticsPlan: JSON.stringify(sections),
      logisticsPlanGeneratedAt: new Date(),
    },
  });

  // Cache for 7 days
  await redis.set(cacheKey, JSON.stringify(sections), 'EX', 7 * 24 * 60 * 60);

  return sections;
}

// ============================================================================
// 6. Update Assistance Application
// ============================================================================

export async function updateAssistanceApplication(
  patientId: string,
  assessmentId: string,
  programKey: string,
  status: string,
  notes?: string,
) {
  // Find the matching program
  const program = LOGISTICS_ASSISTANCE_PROGRAMS.find((p) => p.key === programKey);
  if (!program) throw new Error(`Unknown program key: ${programKey}`);

  // Build data for upsert
  const now = new Date();
  const data: any = {
    status,
    statusUpdatedAt: now,
  };

  // Set appliedAt when status transitions to "applied"
  if (status === 'applied') {
    data.appliedAt = now;
  }

  if (notes !== undefined) {
    data.notes = notes;
  }

  const application = await prisma.logisticsAssistanceApplication.upsert({
    where: {
      assessmentId_programKey: { assessmentId, programKey },
    },
    create: {
      patientId,
      assessmentId,
      programKey,
      programName: program.name,
      status,
      appliedAt: status === 'applied' ? now : null,
      statusUpdatedAt: now,
      notes: notes ?? null,
    },
    update: data,
  });

  return application;
}

// ============================================================================
// 7. Get Assistance Applications
// ============================================================================

export async function getAssistanceApplications(patientId: string) {
  return prisma.logisticsAssistanceApplication.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}
