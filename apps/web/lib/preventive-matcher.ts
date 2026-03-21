import { type PrismaClient } from '@iish/db/generated/prisma';
import { randomBytes } from 'crypto';

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function generateShortCode(length = 8): string {
  const bytes = randomBytes(length);
  return Array.from(bytes).map(b => BASE62[b % 62]).join('');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PreventiveTrialMatch {
  trial: any;
  matchStrength: 'strong' | 'possible' | 'worth_discussing' | 'no_match';
  matchReason: string;
  nextSteps: string;
}

interface PrescreenInput {
  age: number;
  hasCancerHistory: boolean;
  cancerSubtype?: string | null;
  treatmentStatus?: string | null;
  hasBrca: string; // 'yes' | 'no' | 'unsure' | 'unknown'
  hasOtherHighRisk: string;
  hasFamilyHistory: boolean;
  estimatedLifetimeRisk?: number | null;
  zipCode?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mergeCuratedData(trial: any, curated: any | null): any {
  if (!curated) return { ...trial, curatedSummary: null, targetPopulation: null, vaccineTarget: null, mechanism: null, keyResults: null, editorNote: null, matchingCriteria: null };
  return {
    ...trial,
    curatedSummary: curated.curatedSummary,
    targetPopulation: curated.targetPopulation,
    vaccineTarget: curated.vaccineTarget,
    mechanism: curated.mechanism,
    keyResults: curated.keyResults,
    editorNote: curated.editorNote,
    matchingCriteria: curated.matchingCriteria,
  };
}

// ---------------------------------------------------------------------------
// 1. getPreventiveTrials
// ---------------------------------------------------------------------------

export async function getPreventiveTrials(
  prisma: PrismaClient,
  filters?: { category?: string },
): Promise<{ trials: any[]; curated: any[]; total: number }> {
  const where: any = { isPreventive: true };
  if (filters?.category) where.trialCategory = filters.category;

  const [trials, curated] = await Promise.all([
    prisma.trial.findMany({ where, include: { sites: true }, orderBy: { updatedAt: 'desc' } }),
    prisma.curatedPreventiveTrial.findMany({ where: { isActive: true } }),
  ]);

  // Merge: curated overrides automated by nctId
  const curatedMap = new Map(curated.map(c => [c.nctId, c]));
  const merged = trials.map(t => mergeCuratedData(t, curatedMap.get(t.nctId)));

  // Add curated-only trials (nctId not yet in Trial table)
  const trialNctIds = new Set(trials.map(t => t.nctId));
  for (const c of curated) {
    if (!trialNctIds.has(c.nctId)) {
      merged.push({
        id: c.id,
        nctId: c.nctId,
        title: c.curatedSummary.split('.')[0],
        trialCategory: c.trialCategory,
        isPreventive: true,
        phase: null,
        status: 'RECRUITING',
        sponsor: null,
        briefSummary: c.curatedSummary,
        sites: [],
        curatedSummary: c.curatedSummary,
        targetPopulation: c.targetPopulation,
        vaccineTarget: c.vaccineTarget,
        mechanism: c.mechanism,
        keyResults: c.keyResults,
        editorNote: c.editorNote,
        matchingCriteria: c.matchingCriteria,
      });
    }
  }

  return { trials: merged, curated, total: merged.length };
}

// ---------------------------------------------------------------------------
// 2. getRecurrencePreventionTrials
// ---------------------------------------------------------------------------

export async function getRecurrencePreventionTrials(
  prisma: PrismaClient,
  patientId: string,
): Promise<PreventiveTrialMatch[]> {
  const [patient, trials, curated] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: patientId },
      include: { genomicResults: true, pipelineJobs: true },
    }),
    prisma.trial.findMany({
      where: { trialCategory: 'recurrence_prevention', isPreventive: true },
      include: { sites: true },
    }),
    prisma.curatedPreventiveTrial.findMany({
      where: { isActive: true, trialCategory: 'recurrence_prevention' },
    }),
  ]);

  if (!patient) return [];

  const profile = patient.profile as any ?? {};
  const hasGenomics = patient.pipelineJobs.length > 0 || patient.genomicResults.length > 0;

  const curatedMap = new Map(curated.map(c => [c.nctId, c]));
  const allTrials = trials.map(t => mergeCuratedData(t, curatedMap.get(t.nctId)));

  return allTrials.map(trial => {
    const criteria = trial.matchingCriteria as any ?? {};
    let strength: PreventiveTrialMatch['matchStrength'] = 'possible';
    const reasons: string[] = [];

    // Subtype match
    if (criteria.specificSubtype && profile.cancerSubtype) {
      if (profile.cancerSubtype.toLowerCase().includes(criteria.specificSubtype.toLowerCase())) {
        strength = 'strong';
        reasons.push(`Matches your ${profile.cancerSubtype} subtype`);
      }
    }

    // Genomics boost
    if (hasGenomics && trial.trialCategory === 'recurrence_prevention') {
      reasons.push('Your tumor genomic profile is available — personalized vaccine trials may be especially relevant');
      if (strength === 'possible') strength = 'strong';
    }

    if (reasons.length === 0) {
      reasons.push('This trial is investigating recurrence prevention for breast cancer survivors');
    }

    return {
      trial,
      matchStrength: strength,
      matchReason: reasons.join('. '),
      nextSteps: 'Discuss with your oncologist. They can help determine if this trial is right for you.',
    };
  });
}

// ---------------------------------------------------------------------------
// 3. preScreenEligibility
// ---------------------------------------------------------------------------

export function preScreenEligibility(
  input: PrescreenInput,
  trial: any,
): { matchStrength: PreventiveTrialMatch['matchStrength']; matchReason: string; nextSteps: string } {
  const criteria = (trial.matchingCriteria ?? {}) as any;
  const reasons: string[] = [];
  let score = 0;

  // Age range check
  if (criteria.ageRange) {
    const [minAge, maxAge] = criteria.ageRange;
    if (input.age >= minAge && input.age <= maxAge) {
      score += 2;
      reasons.push(`Age ${input.age} is within the eligible range (${minAge}-${maxAge})`);
    } else {
      return {
        matchStrength: 'no_match',
        matchReason: `This trial requires ages ${minAge}-${maxAge}`,
        nextSteps: 'Check back as new trials open with different age criteria.',
      };
    }
  }

  // BRCA status
  if (criteria.requiresBRCA) {
    if (input.hasBrca === 'yes') {
      score += 3;
      reasons.push('You carry a BRCA mutation, which this trial is specifically studying');
    } else if (input.hasBrca === 'unsure') {
      score += 1;
      reasons.push('This trial requires BRCA mutation — genetic testing could determine eligibility');
    } else {
      return {
        matchStrength: 'no_match',
        matchReason: 'This trial requires a known BRCA1 or BRCA2 mutation',
        nextSteps: 'If you haven\'t been tested, consider genetic counseling to learn your status.',
      };
    }
  }

  // Family history
  if (criteria.requiresFamilyHistory && input.hasFamilyHistory) {
    score += 2;
    reasons.push('Your family history of breast cancer aligns with this trial\'s focus');
  } else if (criteria.requiresFamilyHistory && !input.hasFamilyHistory) {
    score -= 1;
  }

  // Cancer history
  if (criteria.priorCancerAllowed === false && input.hasCancerHistory) {
    return {
      matchStrength: 'no_match',
      matchReason: 'This trial is for people without a prior cancer diagnosis',
      nextSteps: 'Look at recurrence prevention trials instead — they may be a better fit.',
    };
  }
  if (criteria.priorCancerAllowed === true && input.hasCancerHistory) {
    score += 1;
    reasons.push('Prior cancer history is accepted');
  }

  // High risk factor
  if (criteria.requiresHighRisk) {
    if (input.hasBrca === 'yes' || input.hasFamilyHistory || input.hasOtherHighRisk === 'yes') {
      score += 2;
      reasons.push('Your risk profile matches this trial\'s high-risk criteria');
    } else {
      score -= 1;
    }
  }

  // Subtype match
  if (criteria.specificSubtype && input.cancerSubtype) {
    if (input.cancerSubtype.toLowerCase().includes(criteria.specificSubtype.toLowerCase())) {
      score += 2;
      reasons.push(`Your ${input.cancerSubtype} subtype matches this trial`);
    }
  }

  // Determine strength
  let matchStrength: PreventiveTrialMatch['matchStrength'];
  if (score >= 5) matchStrength = 'strong';
  else if (score >= 3) matchStrength = 'possible';
  else if (score >= 1) matchStrength = 'worth_discussing';
  else matchStrength = 'no_match';

  if (reasons.length === 0) {
    reasons.push('Based on the information provided, this trial may be worth exploring');
  }

  const nextSteps = matchStrength === 'strong'
    ? 'This looks like a strong match. Talk to your doctor about enrollment.'
    : matchStrength === 'possible'
      ? 'You may be eligible. Contact the trial site for a full screening.'
      : matchStrength === 'worth_discussing'
        ? 'Worth discussing with your doctor to explore eligibility.'
        : 'This trial doesn\'t appear to match your profile.';

  return { matchStrength, matchReason: reasons.join('. '), nextSteps };
}

// ---------------------------------------------------------------------------
// 4. runPreventivePrescreen
// ---------------------------------------------------------------------------

export async function runPreventivePrescreen(
  prisma: PrismaClient,
  input: PrescreenInput,
  userId?: string | null,
): Promise<{ matchedTrials: PreventiveTrialMatch[]; noMatchMessage: string | null; riskAssessmentCTA: boolean }> {
  const { trials } = await getPreventiveTrials(prisma);

  const matches: PreventiveTrialMatch[] = [];
  for (const trial of trials) {
    const result = preScreenEligibility(input, trial);
    if (result.matchStrength !== 'no_match') {
      matches.push({ trial, ...result });
    }
  }

  // Sort: strong > possible > worth_discussing
  const ORDER = { strong: 0, possible: 1, worth_discussing: 2, no_match: 3 };
  matches.sort((a, b) => ORDER[a.matchStrength] - ORDER[b.matchStrength]);

  // Save prescreen record
  if (userId || matches.length > 0) {
    await prisma.preventivePrescreen.create({
      data: {
        userId: userId ?? null,
        age: input.age,
        hasCancerHistory: input.hasCancerHistory,
        cancerSubtype: input.cancerSubtype ?? null,
        treatmentStatus: input.treatmentStatus ?? null,
        hasBrca: input.hasBrca,
        hasOtherHighRisk: input.hasOtherHighRisk,
        hasFamilyHistory: input.hasFamilyHistory,
        estimatedLifetimeRisk: input.estimatedLifetimeRisk ?? null,
        zipCode: input.zipCode ?? null,
        matchResults: matches.map(m => ({
          nctId: m.trial.nctId,
          matchStrength: m.matchStrength,
          matchReason: m.matchReason,
        })),
      },
    });
  }

  const riskAssessmentCTA = input.hasFamilyHistory || input.hasBrca === 'yes' || input.hasOtherHighRisk === 'yes';

  return {
    matchedTrials: matches,
    noMatchMessage: matches.length === 0
      ? 'No preventive trials match your current profile. New trials open regularly — create a free account to get notified.'
      : null,
    riskAssessmentCTA,
  };
}

// ---------------------------------------------------------------------------
// 5. getPreventiveTrialsForFamily
// ---------------------------------------------------------------------------

export async function getPreventiveTrialsForFamily(
  prisma: PrismaClient,
  patientId: string,
): Promise<PreventiveTrialMatch[]> {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return [];

  const profile = patient.profile as any ?? {};
  const { trials } = await getPreventiveTrials(prisma);

  // For family context: filter to trials where priorCancerAllowed is false or undefined
  // (these are for undiagnosed family members)
  const familyTrials = trials.filter(t => {
    const criteria = (t.matchingCriteria ?? {}) as any;
    return criteria.priorCancerAllowed !== true; // include undefined + false
  });

  return familyTrials.map(trial => {
    const criteria = (trial.matchingCriteria ?? {}) as any;
    const reasons: string[] = [];
    let strength: PreventiveTrialMatch['matchStrength'] = 'worth_discussing';

    // TNBC patient → alpha-lactalbumin and similar
    const subtype = (profile.cancerSubtype ?? '').toLowerCase();
    if (subtype.includes('triple negative') || subtype.includes('tnbc')) {
      if (criteria.specificSubtype?.toLowerCase().includes('tnbc') || trial.vaccineTarget?.toLowerCase().includes('alpha-lactalbumin')) {
        strength = 'strong';
        reasons.push('Your triple-negative diagnosis means family members may benefit from TNBC-specific prevention research');
      }
    }

    // BRCA implications
    if (profile.brcaStatus === 'positive' || criteria.requiresBRCA) {
      strength = strength === 'strong' ? 'strong' : 'possible';
      reasons.push('Family members who carry BRCA mutations may be eligible');
    }

    if (reasons.length === 0) {
      reasons.push('This prevention trial may be relevant for family members with elevated breast cancer risk');
    }

    return {
      trial,
      matchStrength: strength,
      matchReason: reasons.join('. '),
      nextSteps: 'Share this information with family members. They should discuss with their own doctor.',
    };
  });
}

// ---------------------------------------------------------------------------
// 6. generateReferralLink
// ---------------------------------------------------------------------------

export async function generateReferralLink(
  prisma: PrismaClient,
  patientId: string,
): Promise<{ referralCode: string; url: string; textMessage: string; emailSubject: string; emailBody: string }> {
  // Reuse existing referral if one exists
  const existing = await prisma.familyReferral.findFirst({
    where: { referringPatientId: patientId, redeemedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  const referralCode = existing?.referralCode ?? generateShortCode(8);

  if (!existing) {
    await prisma.familyReferral.create({
      data: { referringPatientId: patientId, referralCode },
    });
  }

  const url = `/prevent?ref=${referralCode}`;

  return {
    referralCode,
    url,
    textMessage: `I wanted to share this with you — there are clinical trials studying breast cancer prevention vaccines. Because of our family history, you might be eligible. Check it out: ${url}`,
    emailSubject: 'Breast cancer prevention trials — for our family',
    emailBody: `Hi,\n\nI've been learning about breast cancer prevention vaccine trials through IISH. Given our family history, I thought you might want to take a look.\n\nYou can take a quick eligibility quiz here: ${url}\n\nIt only takes a minute, and it's completely free. No diagnosis needed — these trials are specifically for people who haven't been diagnosed but may be at higher risk.\n\nLove`,
  };
}

// ---------------------------------------------------------------------------
// 7. redeemReferralCode
// ---------------------------------------------------------------------------

export async function redeemReferralCode(
  prisma: PrismaClient,
  code: string,
  userId?: string | null,
): Promise<{ success: boolean; prefillFamilyHistory: boolean }> {
  const referral = await prisma.familyReferral.findUnique({ where: { referralCode: code } });
  if (!referral) return { success: false, prefillFamilyHistory: false };

  if (!referral.redeemedAt && userId) {
    await prisma.familyReferral.update({
      where: { referralCode: code },
      data: { referredUserId: userId, redeemedAt: new Date() },
    });
  }

  return { success: true, prefillFamilyHistory: true };
}

// ---------------------------------------------------------------------------
// 8. getReferralStats
// ---------------------------------------------------------------------------

export async function getReferralStats(
  prisma: PrismaClient,
  patientId: string,
): Promise<{ totalSent: number; totalRedeemed: number }> {
  const [totalSent, totalRedeemed] = await Promise.all([
    prisma.familyReferral.count({ where: { referringPatientId: patientId } }),
    prisma.familyReferral.count({ where: { referringPatientId: patientId, redeemedAt: { not: null } } }),
  ]);
  return { totalSent, totalRedeemed };
}
