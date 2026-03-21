import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import type { PatientProfile } from '@iish/shared';

// ============================================================================
// Types
// ============================================================================

interface CreateDenialInput {
  deniedService: string;
  serviceCategory: string;
  denialDate: string;
  insurerName: string;
  planType?: string;
  claimNumber?: string;
  denialReason: string;
  denialReasonCode?: string;
  denialCategory: string;
}

interface AppealStrategy {
  name: string;
  levels: string[];
  successRates: Record<string, string>;
  supportingEvidence: string[];
}

interface StateProtection {
  fertilityMandate: boolean;
  clinicalTrialCoverage: boolean;
  stepTherapyProtection: boolean;
  cancerSpecific: string;
}

export interface PeerReviewPrep {
  keyPoints: string[];
  anticipatedArguments: { argument: string; rebuttal: string }[];
  guidelines: string[];
  reviewerQuestions: string[];
  tips: string[];
}

// ============================================================================
// Constants
// ============================================================================

const APPEAL_STRATEGIES: Record<string, AppealStrategy> = {
  medical_necessity: {
    name: 'Medical Necessity Appeal',
    levels: ['internal_first', 'internal_final', 'external_review', 'state_insurance_dept'],
    successRates: {
      internal_first: '40-50%',
      internal_final: '30-40%',
      external_review: '40-60%',
    },
    supportingEvidence: [
      'NCCN guidelines',
      'Peer-reviewed literature',
      'Treating physician letter',
      'Prior authorization documentation',
    ],
  },
  experimental: {
    name: 'Experimental/Investigational Appeal',
    levels: ['internal_first', 'internal_final', 'external_review', 'clinical_trial_exception'],
    successRates: {
      internal_first: '20-30%',
      internal_final: '25-35%',
      external_review: '35-50%',
    },
    supportingEvidence: [
      'Clinical trial data',
      'FDA breakthrough designations',
      'Compendia listings',
      'Case reports',
      'Expert opinion letters',
    ],
  },
  not_covered: {
    name: 'Coverage Exception Appeal',
    levels: ['internal_first', 'formulary_exception', 'external_review'],
    successRates: {
      internal_first: '30-40%',
      formulary_exception: '40-50%',
      external_review: '30-45%',
    },
    supportingEvidence: [
      'Standard of care documentation',
      'Failed formulary alternatives',
      'Specialist recommendation',
    ],
  },
};

const ACA_RIGHTS = {
  internalAppealDays: 30,
  urgentInternalHours: 72,
  externalReviewAvailable: true,
  externalReviewDays: 45,
  continuationOfCoverage: true,
  noRetaliation: true,
};

const STATE_PROTECTIONS: Record<string, StateProtection> = {
  CT: {
    fertilityMandate: true,
    clinicalTrialCoverage: true,
    stepTherapyProtection: false,
    cancerSpecific: 'Coverage for fertility preservation prior to cancer treatment',
  },
  IL: {
    fertilityMandate: true,
    clinicalTrialCoverage: true,
    stepTherapyProtection: true,
    cancerSpecific: 'Comprehensive cancer trial coverage',
  },
  NY: {
    fertilityMandate: true,
    clinicalTrialCoverage: true,
    stepTherapyProtection: true,
    cancerSpecific: 'Fertility preservation + trial coverage mandates',
  },
  NJ: {
    fertilityMandate: true,
    clinicalTrialCoverage: true,
    stepTherapyProtection: false,
    cancerSpecific: 'Fertility preservation mandate',
  },
  MD: {
    fertilityMandate: true,
    clinicalTrialCoverage: true,
    stepTherapyProtection: true,
    cancerSpecific: 'Step therapy protections for cancer patients',
  },
  DE: {
    fertilityMandate: true,
    clinicalTrialCoverage: false,
    stepTherapyProtection: false,
    cancerSpecific: 'Fertility preservation mandate',
  },
  RI: {
    fertilityMandate: true,
    clinicalTrialCoverage: true,
    stepTherapyProtection: false,
    cancerSpecific: 'Fertility preservation + trial mandate',
  },
  CO: {
    fertilityMandate: true,
    clinicalTrialCoverage: true,
    stepTherapyProtection: true,
    cancerSpecific: 'Comprehensive cancer coverage protections',
  },
  CA: {
    fertilityMandate: false,
    clinicalTrialCoverage: true,
    stepTherapyProtection: true,
    cancerSpecific: 'Clinical trial routine costs coverage',
  },
  TX: {
    fertilityMandate: false,
    clinicalTrialCoverage: true,
    stepTherapyProtection: false,
    cancerSpecific: 'Cancer clinical trial coverage',
  },
  FL: {
    fertilityMandate: false,
    clinicalTrialCoverage: false,
    stepTherapyProtection: false,
    cancerSpecific: 'Limited state protections',
  },
};

const APPEAL_LEVEL_ORDER = ['internal_first', 'internal_final', 'external_review'];

const DEFAULT_STRATEGY: AppealStrategy = {
  name: 'General Appeal',
  levels: ['internal_first', 'internal_final', 'external_review'],
  successRates: {
    internal_first: '30-40%',
    internal_final: '25-35%',
    external_review: '35-50%',
  },
  supportingEvidence: [
    'Medical records',
    'Treating physician letter',
    'Standard of care documentation',
  ],
};

// ============================================================================
// Denial CRUD
// ============================================================================

export async function createDenial(patientId: string, input: CreateDenialInput) {
  const denialDate = new Date(input.denialDate);
  const appealDeadline = new Date(denialDate);
  appealDeadline.setDate(appealDeadline.getDate() + 180);

  const denial = await prisma.insuranceDenial.create({
    data: {
      patientId,
      deniedService: input.deniedService,
      serviceCategory: input.serviceCategory,
      denialDate,
      insurerName: input.insurerName,
      planType: input.planType ?? null,
      claimNumber: input.claimNumber ?? null,
      denialReason: input.denialReason,
      denialReasonCode: input.denialReasonCode ?? null,
      denialCategory: input.denialCategory,
      appealDeadline,
    },
  });

  return denial;
}

export async function getDenials(patientId: string) {
  return prisma.insuranceDenial.findMany({
    where: { patientId },
    include: { appealLetters: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDenial(denialId: string) {
  return prisma.insuranceDenial.findUnique({
    where: { id: denialId },
    include: { appealLetters: true },
  });
}

export async function updateDenialStatus(denialId: string, status: string) {
  return prisma.insuranceDenial.update({
    where: { id: denialId },
    data: { status },
  });
}

// ============================================================================
// Appeal Letter Generation — Crown Jewel
// ============================================================================

export async function generateAppealLetter(denialId: string) {
  // Load denial with patient + profile + documents
  const denial = await prisma.insuranceDenial.findUnique({
    where: { id: denialId },
    include: {
      patient: {
        include: {
          documents: true,
        },
      },
      appealLetters: true,
    },
  });

  if (!denial) throw new Error('Denial not found');

  const profile = (denial.patient.profile as PatientProfile | null) ?? {};
  const cancerType = (profile as any)?.cancerType || 'Not specified';
  const stage = (profile as any)?.stage || 'Not specified';
  const biomarkers = (profile as any)?.biomarkers
    ? JSON.stringify((profile as any).biomarkers)
    : 'Not available';
  const priorTreatments = ((profile as any)?.priorTreatments as any[])
    ?.map((t: any) => t.name || t.type || String(t))
    .join(', ') || 'Not specified';

  // Determine appeal level based on existing letters
  const existingCount = denial.appealLetters.length;
  const appealLevel = APPEAL_LEVEL_ORDER[existingCount] ?? 'external_review';

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: `You are a medical insurance appeal specialist with deep expertise in cancer treatment coverage. Generate formal, compelling appeal letters that maximize the chance of overturning insurance denials for cancer patients.

Your letters must be professional, evidence-based, and persuasive. Always include clinical justification and cite medical guidelines where applicable.

IMPORTANT: Every letter must end with [PHYSICIAN SIGNATURE REQUIRED] — these letters must be reviewed and signed by the treating physician before submission.

Return valid JSON with this exact structure:
{
  "letterContent": "The full appeal letter text",
  "patientSummary": "A brief 2-3 sentence summary of the patient's clinical situation for reference",
  "supportingDocuments": ["List of documents that should be gathered and attached to strengthen this appeal"]
}`,
    messages: [
      {
        role: 'user',
        content: `Generate a formal insurance appeal letter for a cancer patient.

DENIAL DETAILS:
- Service denied: ${denial.deniedService}
- Denial reason: ${denial.denialReason}
${denial.denialReasonCode ? `- Denial reason code: ${denial.denialReasonCode}` : ''}
- Insurer: ${denial.insurerName}
${denial.planType ? `- Plan type: ${denial.planType}` : ''}
${denial.claimNumber ? `- Claim number: ${denial.claimNumber}` : ''}
- Denial category: ${denial.denialCategory}
- Appeal level: ${appealLevel} (appeal #${existingCount + 1})

PATIENT CLINICAL INFORMATION:
- Diagnosis: ${cancerType} ${stage}
- Treatment history: ${priorTreatments}
- Biomarkers: ${biomarkers}

REQUIREMENTS:
1. Professional medical letter format
2. Address the denial reason DIRECTLY with clinical justification
3. Cite NCCN guidelines where applicable
4. Include standard of care argument
5. Patient harm statement explaining impact of denial
6. Request for reversal with specific requested action
7. End with [PHYSICIAN SIGNATURE REQUIRED] — this letter must be reviewed and signed by the treating physician

Respond with JSON: { letterContent: string, patientSummary: string, supportingDocuments: string[] }`,
      },
    ],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;

  let parsed: {
    letterContent: string;
    patientSummary: string;
    supportingDocuments: string[];
  };
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    parsed = {
      letterContent: text,
      patientSummary: `Appeal for ${denial.deniedService} denial for a ${cancerType} patient.`,
      supportingDocuments: [
        'Medical records',
        'Treating physician letter of medical necessity',
        'NCCN guideline printout',
      ],
    };
  }

  // Create appeal letter record
  const appealLetter = await prisma.appealLetter.create({
    data: {
      denialId,
      appealLevel,
      letterContent: parsed.letterContent,
      patientSummary: parsed.patientSummary,
      supportingDocuments: parsed.supportingDocuments,
    },
  });

  // Update denial status to reflect active appeal
  await prisma.insuranceDenial.update({
    where: { id: denialId },
    data: { status: 'appealing' },
  });

  return appealLetter;
}

// ============================================================================
// Appeal Letter Queries & Updates
// ============================================================================

export async function getAppealLetter(appealId: string) {
  return prisma.appealLetter.findUnique({
    where: { id: appealId },
    include: { denial: true },
  });
}

export async function updateAppealOutcome(
  appealId: string,
  input: { outcome: string; outcomeDate?: string; outcomeDetails?: string },
) {
  const letter = await prisma.appealLetter.update({
    where: { id: appealId },
    data: {
      outcome: input.outcome,
      outcomeDate: input.outcomeDate ? new Date(input.outcomeDate) : null,
      outcomeDetails: input.outcomeDetails ?? null,
    },
    include: { denial: true },
  });

  // Update parent denial status based on outcome
  const newDenialStatus =
    input.outcome === 'approved' || input.outcome === 'overturned'
      ? 'appeal_won'
      : input.outcome === 'denied' || input.outcome === 'upheld'
        ? 'appeal_lost'
        : letter.denial.status;

  if (newDenialStatus !== letter.denial.status) {
    await prisma.insuranceDenial.update({
      where: { id: letter.denialId },
      data: { status: newDenialStatus },
    });
  }

  return letter;
}

// ============================================================================
// Strategy & Rights
// ============================================================================

export function getAppealStrategy(denialCategory: string): AppealStrategy {
  return APPEAL_STRATEGIES[denialCategory] ?? DEFAULT_STRATEGY;
}

export function getAppealRights(state?: string) {
  return {
    acaRights: ACA_RIGHTS,
    stateProtections: state ? STATE_PROTECTIONS[state] ?? null : null,
  };
}

// ============================================================================
// Peer-to-Peer Review Preparation
// ============================================================================

export async function generatePeerReviewPrep(denialId: string): Promise<PeerReviewPrep> {
  // Check Redis cache
  const cacheKey = `advocate:peer-review:${denialId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Load denial + patient profile
  const denial = await prisma.insuranceDenial.findUnique({
    where: { id: denialId },
    include: {
      patient: true,
    },
  });

  if (!denial) throw new Error('Denial not found');

  const profile = (denial.patient.profile as PatientProfile | null) ?? {};
  const cancerType = (profile as any)?.cancerType || 'Not specified';
  const stage = (profile as any)?.stage || 'Not specified';
  const biomarkers = (profile as any)?.biomarkers
    ? JSON.stringify((profile as any).biomarkers)
    : 'Not available';
  const priorTreatments = ((profile as any)?.priorTreatments as any[])
    ?.map((t: any) => t.name || t.type || String(t))
    .join(', ') || 'Not specified';

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: `You are an experienced oncologist helping a colleague prepare for a peer-to-peer review call with an insurance company medical director. Provide practical, evidence-based preparation guidance.

Return valid JSON with this exact structure:
{
  "keyPoints": ["List of 5-8 key clinical points to emphasize during the call"],
  "anticipatedArguments": [
    { "argument": "What the insurance reviewer may argue", "rebuttal": "How to counter this argument with evidence" }
  ],
  "guidelines": ["List of specific NCCN or other guideline references to cite"],
  "reviewerQuestions": ["List of 5-8 questions the reviewer is likely to ask"],
  "tips": ["List of 4-6 practical tips for the conversation"]
}`,
    messages: [
      {
        role: 'user',
        content: `Generate a peer-to-peer review preparation guide for the following denied cancer treatment.

DENIAL DETAILS:
- Service denied: ${denial.deniedService}
- Denial reason: ${denial.denialReason}
${denial.denialReasonCode ? `- Denial reason code: ${denial.denialReasonCode}` : ''}
- Insurer: ${denial.insurerName}
- Denial category: ${denial.denialCategory}

PATIENT CLINICAL INFORMATION:
- Diagnosis: ${cancerType} ${stage}
- Treatment history: ${priorTreatments}
- Biomarkers: ${biomarkers}

Include:
- Key clinical points to emphasize
- Anticipated insurer arguments and rebuttals
- NCCN guideline references
- Questions the reviewer may ask
- Tips for the conversation`,
      },
    ],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;

  let prep: PeerReviewPrep;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    prep = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    prep = {
      keyPoints: [
        'Review the specific NCCN guideline category and recommendation level for this treatment',
        'Prepare a timeline showing disease progression and prior treatment failures',
        'Have peer-reviewed literature supporting this treatment approach readily accessible',
      ],
      anticipatedArguments: [
        {
          argument: 'The requested treatment is not standard of care',
          rebuttal: 'Cite the specific NCCN guideline and category of evidence supporting this treatment for this patient population',
        },
      ],
      guidelines: [
        'NCCN Clinical Practice Guidelines in Oncology',
      ],
      reviewerQuestions: [
        'What alternatives have been tried and why did they fail?',
        'What is the specific clinical evidence supporting this treatment?',
        'What is the expected clinical benefit for this patient?',
      ],
      tips: [
        'Be professional and collegial — this is a physician-to-physician conversation',
        'Lead with the clinical evidence, not the emotional appeal',
        'Have the patient chart open during the call for quick reference',
      ],
    };
  }

  // Cache for 7 days
  await redis.set(cacheKey, JSON.stringify(prep), 'EX', 7 * 24 * 60 * 60);

  return prep;
}
