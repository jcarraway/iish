/**
 * PREVENT Risk Engine — Gail Model Implementation
 *
 * Implements the NCI Breast Cancer Risk Assessment Tool (BCRAT/Gail model)
 * for lifetime, 5-year, and 10-year risk estimation.
 *
 * Reference: Gail MH, et al. J Natl Cancer Inst. 1989;81(24):1879-1886.
 * Updated: Gail MH, et al. J Natl Cancer Inst. 1999;91(18):1541-1548.
 */

// ============================================================================
// Types
// ============================================================================

export interface GailInputs {
  currentAge: number;
  ageAtMenarche: number | null;      // age at first period
  ageAtFirstLiveBirth: number | null; // null if nulliparous
  previousBiopsies: number;           // number of breast biopsies
  atypicalHyperplasia: boolean;
  firstDegreeRelatives: number;       // mother, sisters, daughters with breast cancer
  ethnicity: string;                  // white, black, hispanic, asian, other
}

export interface RiskResult {
  lifetimeRiskEstimate: number;   // percent, to age 90
  lifetimeRiskCiLow: number;
  lifetimeRiskCiHigh: number;
  fiveYearRiskEstimate: number;
  tenYearRiskEstimate: number;
  riskCategory: string;
  gailInputs: GailInputs;
}

export interface TrajectoryPoint {
  age: number;
  risk: number;         // cumulative risk to that age, percent
  populationAverage: number;
}

export interface ModifiableFactorResult {
  factor: string;
  currentValue: string;
  impact: string;
  recommendation: string;
  evidenceStrength: string;
  potentialReduction: number | null;  // percent reduction
}

// ============================================================================
// SEER Baseline Hazard Data (per NCI BCRAT)
//
// Age-specific composite breast cancer incidence and competing mortality rates
// Simplified lookup table based on NCI published data.
// h1 = age-specific breast cancer hazard
// h2 = age-specific competing mortality hazard
// ============================================================================

const BASELINE_HAZARDS: Record<string, { h1: number; h2: number }[]> = {
  white: [
    { h1: 0.00004378, h2: 0.00053487 }, // 20-24
    { h1: 0.00013104, h2: 0.00063310 }, // 25-29
    { h1: 0.00039312, h2: 0.00083272 }, // 30-34
    { h1: 0.00097383, h2: 0.00119759 }, // 35-39
    { h1: 0.00148288, h2: 0.00169960 }, // 40-44
    { h1: 0.00198143, h2: 0.00260448 }, // 45-49
    { h1: 0.00259544, h2: 0.00394739 }, // 50-54
    { h1: 0.00307419, h2: 0.00578519 }, // 55-59
    { h1: 0.00351197, h2: 0.00886766 }, // 60-64
    { h1: 0.00378282, h2: 0.01358785 }, // 65-69
    { h1: 0.00415995, h2: 0.02128240 }, // 70-74
    { h1: 0.00433686, h2: 0.03465853 }, // 75-79
    { h1: 0.00393791, h2: 0.05765033 }, // 80-84
    { h1: 0.00346622, h2: 0.09589594 }, // 85-90
  ],
  black: [
    { h1: 0.00004378, h2: 0.00076684 },
    { h1: 0.00013104, h2: 0.00094485 },
    { h1: 0.00039312, h2: 0.00124700 },
    { h1: 0.00097383, h2: 0.00187832 },
    { h1: 0.00169281, h2: 0.00286578 },
    { h1: 0.00211989, h2: 0.00427681 },
    { h1: 0.00274471, h2: 0.00608993 },
    { h1: 0.00315303, h2: 0.00871983 },
    { h1: 0.00371039, h2: 0.01268246 },
    { h1: 0.00390147, h2: 0.01800001 },
    { h1: 0.00412222, h2: 0.02637281 },
    { h1: 0.00407890, h2: 0.03973700 },
    { h1: 0.00370880, h2: 0.06222888 },
    { h1: 0.00317720, h2: 0.09834683 },
  ],
};

// Hispanic, Asian, Other — use white baseline with slight adjustments
BASELINE_HAZARDS.hispanic = BASELINE_HAZARDS.white.map(h => ({
  h1: h.h1 * 0.74, h2: h.h2 * 0.95,
}));
BASELINE_HAZARDS.asian = BASELINE_HAZARDS.white.map(h => ({
  h1: h.h1 * 0.55, h2: h.h2 * 0.80,
}));
BASELINE_HAZARDS.other = BASELINE_HAZARDS.white;

// ============================================================================
// Relative Risk Factors (Gail model coefficients)
// ============================================================================

function getAgeMenarcheRR(ageAtMenarche: number | null): number {
  if (ageAtMenarche == null) return 1.0;
  if (ageAtMenarche >= 14) return 1.0;
  if (ageAtMenarche >= 12) return 1.099;
  return 1.207; // < 12
}

function getAgeFirstBirthRR(ageAtFirstLiveBirth: number | null, biopsies: number): number {
  // Interaction term between age at first birth and number of biopsies
  if (biopsies === 0) {
    if (ageAtFirstLiveBirth == null) return 1.0; // nulliparous, no biopsies
    return 1.0;
  }

  // With biopsies, age at first birth modifies risk
  if (ageAtFirstLiveBirth == null) return 1.0;
  if (ageAtFirstLiveBirth < 20) return 1.0;
  if (ageAtFirstLiveBirth < 25) return 1.079;
  if (ageAtFirstLiveBirth < 30) return 1.157;
  return 1.235; // >= 30
}

function getBiopsyRR(biopsies: number, atypicalHyperplasia: boolean): number {
  if (biopsies === 0) return 1.0;
  if (atypicalHyperplasia) {
    return biopsies === 1 ? 1.82 : 2.36;
  }
  return biopsies === 1 ? 1.27 : 1.62;
}

function getFirstDegreeRelativeRR(count: number): number {
  if (count === 0) return 1.0;
  if (count === 1) return 2.61;
  return 6.08; // 2+
}

// ============================================================================
// Core Gail Calculation
// ============================================================================

function ageToIndex(age: number): number {
  return Math.max(0, Math.min(13, Math.floor((age - 20) / 5)));
}

/**
 * Calculate absolute risk over an interval [startAge, endAge]
 * using the Gail model composite risk formula.
 */
function calculateAbsoluteRisk(
  inputs: GailInputs,
  startAge: number,
  endAge: number,
): number {
  const eth = inputs.ethnicity?.toLowerCase() || 'white';
  const hazards = BASELINE_HAZARDS[eth] || BASELINE_HAZARDS.white;

  // Compute composite relative risk
  const rr =
    getAgeMenarcheRR(inputs.ageAtMenarche) *
    getAgeFirstBirthRR(inputs.ageAtFirstLiveBirth, inputs.previousBiopsies) *
    getBiopsyRR(inputs.previousBiopsies, inputs.atypicalHyperplasia) *
    getFirstDegreeRelativeRR(inputs.firstDegreeRelatives);

  // Numerical integration over 5-year age intervals
  let survivalProb = 1.0;
  let cumulativeRisk = 0.0;

  const startIdx = ageToIndex(startAge);
  const endIdx = ageToIndex(endAge);

  for (let i = startIdx; i <= endIdx && i < hazards.length; i++) {
    const intervalStart = 20 + i * 5;
    const intervalEnd = intervalStart + 5;

    // Clamp to [startAge, endAge]
    const t0 = Math.max(intervalStart, startAge);
    const t1 = Math.min(intervalEnd, endAge);
    if (t1 <= t0) continue;

    const dt = t1 - t0;
    const h1 = hazards[i].h1 * rr; // adjusted breast cancer hazard
    const h2 = hazards[i].h2;      // competing mortality

    // Probability of developing breast cancer in this interval
    const totalHazard = h1 + h2;
    const intervalSurvival = Math.exp(-totalHazard * dt);
    const breastCancerProb = (h1 / totalHazard) * (1 - intervalSurvival);

    cumulativeRisk += survivalProb * breastCancerProb;
    survivalProb *= intervalSurvival;
  }

  return cumulativeRisk * 100; // convert to percentage
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Calculate Gail model risk estimates.
 */
export function calculateGailRisk(inputs: GailInputs): RiskResult {
  const age = inputs.currentAge;

  const lifetimeRisk = calculateAbsoluteRisk(inputs, age, 90);
  const fiveYearRisk = calculateAbsoluteRisk(inputs, age, Math.min(age + 5, 90));
  const tenYearRisk = calculateAbsoluteRisk(inputs, age, Math.min(age + 10, 90));

  // Bootstrap-style CI approximation (±20% for simplified model)
  const ciMargin = lifetimeRisk * 0.20;

  return {
    lifetimeRiskEstimate: Math.round(lifetimeRisk * 100) / 100,
    lifetimeRiskCiLow: Math.round(Math.max(0, lifetimeRisk - ciMargin) * 100) / 100,
    lifetimeRiskCiHigh: Math.round(Math.min(100, lifetimeRisk + ciMargin) * 100) / 100,
    fiveYearRiskEstimate: Math.round(fiveYearRisk * 100) / 100,
    tenYearRiskEstimate: Math.round(tenYearRisk * 100) / 100,
    riskCategory: categorizeRisk(lifetimeRisk),
    gailInputs: inputs,
  };
}

/**
 * Categorize lifetime risk.
 */
export function categorizeRisk(lifetimeRisk: number): string {
  if (lifetimeRisk < 15) return 'average';
  if (lifetimeRisk < 20) return 'slightly_elevated';
  if (lifetimeRisk < 25) return 'moderate';
  if (lifetimeRisk < 35) return 'high';
  return 'very_high';
}

/**
 * Project risk trajectory at 5-year age points from current age to 80+.
 */
export function projectTrajectory(
  inputs: GailInputs,
  currentAge: number,
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  const ages = [];

  for (let a = currentAge; a <= 80; a += 5) {
    ages.push(a);
  }
  if (ages[ages.length - 1] < 80) ages.push(80);

  for (const targetAge of ages) {
    const risk = calculateAbsoluteRisk(inputs, currentAge, targetAge);
    const avgInputs: GailInputs = {
      currentAge,
      ageAtMenarche: 13,
      ageAtFirstLiveBirth: 25,
      previousBiopsies: 0,
      atypicalHyperplasia: false,
      firstDegreeRelatives: 0,
      ethnicity: inputs.ethnicity || 'white',
    };
    const popAvg = calculateAbsoluteRisk(avgInputs, currentAge, targetAge);

    points.push({
      age: targetAge,
      risk: Math.round(risk * 100) / 100,
      populationAverage: Math.round(popAvg * 100) / 100,
    });
  }

  return points;
}

/**
 * Analyze modifiable risk factors and return reduction estimates.
 */
export function analyzeModifiableFactors(profile: {
  bmi?: number | null;
  alcoholDrinksPerWeek?: number | null;
  exerciseMinutesPerWeek?: number | null;
  smokingStatus?: string | null;
  hrtCurrent?: boolean | null;
  hrtType?: string | null;
}): ModifiableFactorResult[] {
  const factors: ModifiableFactorResult[] = [];

  // BMI
  if (profile.bmi != null) {
    if (profile.bmi >= 30) {
      factors.push({
        factor: 'Weight',
        currentValue: `BMI ${profile.bmi.toFixed(1)}`,
        impact: 'Postmenopausal breast cancer risk increases ~12% per 5 BMI points above 25.',
        recommendation: 'Achieving a healthy weight (BMI 18.5-24.9) through diet and exercise.',
        evidenceStrength: 'strong',
        potentialReduction: 10,
      });
    } else if (profile.bmi >= 25) {
      factors.push({
        factor: 'Weight',
        currentValue: `BMI ${profile.bmi.toFixed(1)}`,
        impact: 'Slightly elevated BMI modestly increases postmenopausal risk.',
        recommendation: 'Maintaining current weight or modest weight loss of 5-10%.',
        evidenceStrength: 'strong',
        potentialReduction: 5,
      });
    }
  }

  // Alcohol
  if (profile.alcoholDrinksPerWeek != null && profile.alcoholDrinksPerWeek > 0) {
    const drinks = profile.alcoholDrinksPerWeek;
    factors.push({
      factor: 'Alcohol',
      currentValue: `${drinks} drinks/week`,
      impact: drinks > 7
        ? 'More than 1 drink per day increases risk by ~30-50%.'
        : 'Each drink per day increases risk by approximately 7-10%.',
      recommendation: drinks > 7
        ? 'Reducing to fewer than 7 drinks per week, or eliminating alcohol.'
        : 'Reducing intake or eliminating alcohol entirely.',
      evidenceStrength: 'strong',
      potentialReduction: drinks > 7 ? 15 : 7,
    });
  }

  // Exercise
  if (profile.exerciseMinutesPerWeek != null) {
    if (profile.exerciseMinutesPerWeek < 150) {
      factors.push({
        factor: 'Physical Activity',
        currentValue: `${profile.exerciseMinutesPerWeek} min/week`,
        impact: 'Regular physical activity reduces breast cancer risk by 10-25%.',
        recommendation: 'At least 150 minutes of moderate or 75 minutes of vigorous activity per week.',
        evidenceStrength: 'strong',
        potentialReduction: 15,
      });
    }
  }

  // Smoking
  if (profile.smokingStatus === 'current') {
    factors.push({
      factor: 'Smoking',
      currentValue: 'Current smoker',
      impact: 'Smoking increases breast cancer risk, especially if started before first pregnancy.',
      recommendation: 'Smoking cessation — risk begins to decrease after quitting.',
      evidenceStrength: 'moderate',
      potentialReduction: 8,
    });
  }

  // HRT
  if (profile.hrtCurrent) {
    factors.push({
      factor: 'Hormone Replacement Therapy',
      currentValue: `Currently using ${profile.hrtType || 'HRT'}`,
      impact: 'Combined estrogen-progestin HRT increases risk; risk declines after stopping.',
      recommendation: 'Discuss with your doctor whether HRT benefits outweigh risks for you.',
      evidenceStrength: 'strong',
      potentialReduction: 10,
    });
  }

  return factors;
}

/**
 * Get population average risk for a given age and ethnicity.
 */
export function getPopulationAverage(age: number, ethnicity: string): number {
  const avgInputs: GailInputs = {
    currentAge: age,
    ageAtMenarche: 13,
    ageAtFirstLiveBirth: 25,
    previousBiopsies: 0,
    atypicalHyperplasia: false,
    firstDegreeRelatives: 0,
    ethnicity,
  };
  return calculateAbsoluteRisk(avgInputs, age, 90);
}

/**
 * Validate inputs and return missing/invalid fields.
 */
export function validateInputs(inputs: Partial<GailInputs>): string[] {
  const missing: string[] = [];
  if (inputs.currentAge == null || inputs.currentAge < 20 || inputs.currentAge > 90) {
    missing.push('currentAge (must be 20-90)');
  }
  if (inputs.ageAtMenarche == null) missing.push('ageAtMenarche');
  if (inputs.previousBiopsies == null) missing.push('previousBiopsies');
  if (inputs.firstDegreeRelatives == null) missing.push('firstDegreeRelatives');
  if (!inputs.ethnicity) missing.push('ethnicity');
  return missing;
}
