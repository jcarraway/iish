import { prisma } from './db';
import type { PatientProfile, FinancialProfile, FinancialProgramEligibility, FinancialMatchResult } from '@iish/shared';

// FPL 2024 guideline for 48 contiguous states
const FPL_BASE = 15060;
const FPL_PER_PERSON = 5380;

function getFPLForHousehold(size: number): number {
  return FPL_BASE + FPL_PER_PERSON * (size - 1);
}

function incomeRangeToMidpoint(range: string): number | null {
  if (range === 'Prefer not to say') return null;
  const match = range.match(/\$?([\d,]+)/g);
  if (!match) return null;
  const nums = match.map(s => parseInt(s.replace(/[$,]/g, ''), 10));
  if (nums.length === 1) return nums[0]; // e.g., "$100,000+"
  return (nums[0] + nums[1]) / 2;
}

type CheckResult = 'pass' | 'fail' | 'unknown';

function checkCancerType(eligibility: FinancialProgramEligibility, profile: PatientProfile): CheckResult {
  if (eligibility.cancerTypes === 'all') return 'pass';
  if (!profile.cancerType && !profile.cancerTypeNormalized) return 'unknown';
  const patientType = (profile.cancerTypeNormalized ?? profile.cancerType ?? '').toLowerCase();
  return eligibility.cancerTypes.some(t => patientType.includes(t.toLowerCase())) ? 'pass' : 'fail';
}

function checkInsurance(eligibility: FinancialProgramEligibility, financial: FinancialProfile | null): CheckResult {
  if (eligibility.insuranceRequired === null && eligibility.insuranceTypes.length === 0) return 'pass';
  if (!financial?.insuranceType) return 'unknown';

  if (eligibility.insuranceRequired === false && financial.insuranceType !== 'Uninsured') return 'fail';
  if (eligibility.insuranceRequired === true && financial.insuranceType === 'Uninsured') return 'fail';

  if (eligibility.insuranceTypes.length > 0) {
    return eligibility.insuranceTypes.includes(financial.insuranceType) ? 'pass' : 'fail';
  }

  return 'pass';
}

function checkIncome(eligibility: FinancialProgramEligibility, financial: FinancialProfile | null): CheckResult {
  if (eligibility.incomeLimit.fplPercentage === null) return 'pass';
  if (!financial?.householdIncome || !financial.householdSize) return 'unknown';

  const income = incomeRangeToMidpoint(financial.householdIncome);
  if (income === null) return 'unknown';

  const fpl = getFPLForHousehold(financial.householdSize);
  const threshold = fpl * (eligibility.incomeLimit.fplPercentage / 100);

  return income <= threshold ? 'pass' : 'fail';
}

function checkAge(eligibility: FinancialProgramEligibility, profile: PatientProfile): CheckResult {
  if (eligibility.ageRange.min === null && eligibility.ageRange.max === null) return 'pass';
  if (profile.age == null) return 'unknown';

  if (eligibility.ageRange.min !== null && profile.age < eligibility.ageRange.min) return 'fail';
  if (eligibility.ageRange.max !== null && profile.age > eligibility.ageRange.max) return 'fail';
  return 'pass';
}

function checkTreatment(eligibility: FinancialProgramEligibility, profile: PatientProfile): CheckResult {
  if (eligibility.treatmentTypes === 'all') return 'pass';
  if (!profile.priorTreatments || profile.priorTreatments.length === 0) return 'unknown';

  const patientDrugs = profile.priorTreatments.map(t => t.name.toLowerCase());
  return eligibility.treatmentTypes.some(t =>
    patientDrugs.some(d => d.includes(t.toLowerCase()))
  ) ? 'pass' : 'fail';
}

function checkGeographic(eligibility: FinancialProgramEligibility, profile: PatientProfile): CheckResult {
  if (eligibility.geographicRestrictions.length === 0) return 'pass';
  if (!profile.zipCode) return 'unknown';
  // Simplified: we can't fully verify state from zip without a lookup table
  return 'unknown';
}

interface EligibilityResult {
  matchStatus: 'eligible' | 'likely_eligible' | 'check_eligibility' | 'ineligible';
  reasoning: string;
  missingInfo: string[];
}

function evaluateEligibility(
  eligibility: FinancialProgramEligibility,
  profile: PatientProfile,
  financial: FinancialProfile | null,
): EligibilityResult {
  const checks = {
    cancerType: checkCancerType(eligibility, profile),
    insurance: checkInsurance(eligibility, financial),
    income: checkIncome(eligibility, financial),
    age: checkAge(eligibility, profile),
    treatment: checkTreatment(eligibility, profile),
    geographic: checkGeographic(eligibility, profile),
  };

  const results = Object.values(checks);
  const missingInfo: string[] = [];

  // Map unknown checks to missing info descriptions
  if (checks.cancerType === 'unknown') missingInfo.push('Cancer type');
  if (checks.insurance === 'unknown') missingInfo.push('Insurance type');
  if (checks.income === 'unknown') missingInfo.push('Household income and size');
  if (checks.age === 'unknown') missingInfo.push('Age');
  if (checks.treatment === 'unknown') missingInfo.push('Treatment history');
  if (checks.geographic === 'unknown') missingInfo.push('Location');

  // Any hard fail → ineligible
  if (results.some(r => r === 'fail')) {
    const failReasons: string[] = [];
    if (checks.cancerType === 'fail') failReasons.push('cancer type does not match');
    if (checks.insurance === 'fail') failReasons.push('insurance type does not match requirements');
    if (checks.income === 'fail') failReasons.push('income exceeds program limit');
    if (checks.age === 'fail') failReasons.push('age outside eligible range');
    if (checks.treatment === 'fail') failReasons.push('not currently on a covered medication');
    if (checks.geographic === 'fail') failReasons.push('outside service area');

    return {
      matchStatus: 'ineligible',
      reasoning: `Not eligible: ${failReasons.join('; ')}.`,
      missingInfo,
    };
  }

  const unknowns = results.filter(r => r === 'unknown').length;

  // All pass → eligible
  if (unknowns === 0) {
    return {
      matchStatus: 'eligible',
      reasoning: 'Based on your profile, you meet all known eligibility criteria.',
      missingInfo,
    };
  }

  // All pass except income unknown → likely eligible
  if (unknowns === 1 && checks.income === 'unknown') {
    return {
      matchStatus: 'likely_eligible',
      reasoning: 'You appear to meet most criteria. Provide income information to confirm full eligibility.',
      missingInfo,
    };
  }

  // Some unknown → check eligibility
  return {
    matchStatus: 'check_eligibility',
    reasoning: `You may qualify. Complete your profile to confirm eligibility (missing: ${missingInfo.join(', ')}).`,
    missingInfo,
  };
}

export async function matchFinancialPrograms(patientId: string): Promise<FinancialMatchResult[]> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { profile: true },
  });

  if (!patient?.profile) return [];

  const profile = patient.profile as PatientProfile & { financialProfile?: FinancialProfile };
  const financial = profile.financialProfile ?? null;

  // Fetch all non-closed programs
  const programs = await prisma.financialProgram.findMany({
    where: { status: { not: 'closed' } },
  });

  const results: FinancialMatchResult[] = [];

  for (const program of programs) {
    const eligibility = program.eligibility as unknown as FinancialProgramEligibility;
    const evaluation = evaluateEligibility(eligibility, profile, financial);

    // Skip ineligible programs
    if (evaluation.matchStatus === 'ineligible') continue;

    // Upsert match record
    await prisma.financialMatch.upsert({
      where: {
        patientId_programId: { patientId, programId: program.id },
      },
      create: {
        patientId,
        programId: program.id,
        matchStatus: evaluation.matchStatus,
        estimatedBenefit: program.maxBenefitAmount ? `Up to $${program.maxBenefitAmount.toLocaleString()}` : program.benefitDescription,
        matchReasoning: evaluation.reasoning,
        missingInfo: evaluation.missingInfo,
      },
      update: {
        matchStatus: evaluation.matchStatus,
        estimatedBenefit: program.maxBenefitAmount ? `Up to $${program.maxBenefitAmount.toLocaleString()}` : program.benefitDescription,
        matchReasoning: evaluation.reasoning,
        missingInfo: evaluation.missingInfo,
      },
    });

    results.push({
      programId: program.id,
      programName: program.name,
      organization: program.organization,
      type: program.type,
      matchStatus: evaluation.matchStatus,
      estimatedBenefit: program.maxBenefitAmount ? `Up to $${program.maxBenefitAmount.toLocaleString()}` : program.benefitDescription,
      matchReasoning: evaluation.reasoning,
      missingInfo: evaluation.missingInfo,
      status: program.status,
      maxBenefitAmount: program.maxBenefitAmount,
      benefitDescription: program.benefitDescription,
      applicationProcess: program.applicationProcess,
      applicationUrl: program.applicationUrl,
      website: program.website,
      assistanceCategories: program.assistanceCategories,
    });
  }

  // Sort: eligible first, then likely_eligible, then check_eligibility
  const statusOrder = { eligible: 0, likely_eligible: 1, check_eligibility: 2, ineligible: 3 };
  results.sort((a, b) => {
    const statusDiff = statusOrder[a.matchStatus] - statusOrder[b.matchStatus];
    if (statusDiff !== 0) return statusDiff;
    // Within same status, sort by benefit amount descending
    return (b.maxBenefitAmount ?? 0) - (a.maxBenefitAmount ?? 0);
  });

  return results;
}
