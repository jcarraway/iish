import { prisma } from './db';
import { anthropic, CLAUDE_MODEL } from './ai';
import type { PatientProfile, InsuranceCoverageResult, LetterOfMedicalNecessity } from '@oncovax/shared';

export async function checkSequencingCoverage(
  patientId: string,
  testType: string,
  insurerOverride?: string,
): Promise<InsuranceCoverageResult> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { profile: true },
  });

  if (!patient?.profile) {
    return {
      status: 'unknown',
      insurer: insurerOverride ?? 'Unknown',
      testType,
      reasoning: 'No patient profile available. Complete your profile to check coverage.',
      conditions: [],
      cptCodes: [],
      priorAuthRequired: false,
      missingInfo: ['Patient profile'],
    };
  }

  const profile = patient.profile as PatientProfile & { financialProfile?: { insuranceType?: string } };
  const insurer = insurerOverride ?? profile.financialProfile?.insuranceType ?? null;

  if (!insurer) {
    return {
      status: 'unknown',
      insurer: 'Unknown',
      testType,
      reasoning: 'No insurance information available. Add your insurance type to check coverage.',
      conditions: [],
      cptCodes: [],
      priorAuthRequired: false,
      missingInfo: ['Insurance type'],
    };
  }

  // Find matching rules — most specific first
  const rules = await prisma.insuranceCoverageRule.findMany({
    where: {
      insurer: { equals: insurer, mode: 'insensitive' },
      testType,
    },
  });

  if (rules.length === 0) {
    return {
      status: 'unknown',
      insurer,
      testType,
      reasoning: `No specific coverage policy found for ${insurer} and ${testType}. Contact your insurance for details.`,
      conditions: [],
      cptCodes: [],
      priorAuthRequired: false,
      missingInfo: [],
    };
  }

  // Try to find stage-specific rule first
  const patientStage = profile.stage?.toUpperCase().replace('STAGE ', '') ?? null;
  const cancerType = (profile.cancerTypeNormalized ?? profile.cancerType ?? '').toLowerCase();

  // Score and sort rules by specificity
  const scored = rules.map(rule => {
    let specificity = 0;
    let matches = true;

    // Cancer type match
    if (rule.cancerType) {
      if (cancerType && cancerType.includes(rule.cancerType.toLowerCase())) {
        specificity += 2;
      } else if (cancerType) {
        matches = false;
      }
    }

    // Stage match
    if (rule.stage) {
      if (patientStage && patientStage.includes(rule.stage)) {
        specificity += 2;
      } else if (patientStage) {
        // Stage mismatch — don't disqualify, just lower priority
        specificity -= 1;
      }
    }

    return { rule, specificity, matches };
  });

  // Filter to matching rules, sort by specificity descending
  const matchingRules = scored
    .filter(s => s.matches)
    .sort((a, b) => b.specificity - a.specificity);

  const bestMatch = matchingRules[0] ?? scored.sort((a, b) => b.specificity - a.specificity)[0];
  const rule = bestMatch.rule;

  const missingInfo: string[] = [];
  if (!profile.stage) missingInfo.push('Cancer stage');
  if (!cancerType) missingInfo.push('Cancer type');

  const priorAuthRequired = rule.coverageStatus === 'prior_auth_required';

  return {
    status: rule.coverageStatus as InsuranceCoverageResult['status'],
    insurer,
    testType,
    reasoning: buildCoverageReasoning(rule.coverageStatus, insurer, testType, rule.conditions, patientStage, cancerType),
    conditions: rule.conditions,
    cptCodes: rule.cptCodes,
    priorAuthRequired,
    policyReference: rule.sourceUrl ? `Reference: ${rule.sourceUrl}` : undefined,
    sourceUrl: rule.sourceUrl ?? undefined,
    missingInfo,
  };
}

function buildCoverageReasoning(
  status: string,
  insurer: string,
  testType: string,
  conditions: string[],
  stage: string | null,
  cancerType: string,
): string {
  const testLabel = testType.replace(/_/g, ' ');

  switch (status) {
    case 'covered':
      return `${insurer} covers ${testLabel} based on current policy.${stage ? ` Your stage (${stage}) meets coverage criteria.` : ''} ${conditions.length > 0 ? `Key requirements: ${conditions[0]}.` : ''}`;
    case 'likely_covered':
      return `${insurer} is likely to cover ${testLabel} based on policy guidelines.${cancerType ? ` Your cancer type (${cancerType}) is typically eligible.` : ''} Confirm with your insurance for final determination.`;
    case 'prior_auth_required':
      return `${insurer} requires prior authorization for ${testLabel}. Your oncologist will need to submit documentation demonstrating medical necessity.${stage ? ` Stage ${stage} cases generally qualify.` : ''}`;
    case 'not_covered':
      return `${insurer} does not currently cover ${testLabel} under standard policy. Contact your insurance to discuss exceptions or appeal options.`;
    default:
      return `Coverage for ${testLabel} under ${insurer} is uncertain. Contact your insurance plan for specific policy details.`;
  }
}

export async function generateLetterOfMedicalNecessity(
  patient: { name?: string; profile: PatientProfile },
  providerName: string,
  testType: string,
  coverageResult: InsuranceCoverageResult,
): Promise<LetterOfMedicalNecessity> {
  const profile = patient.profile;
  const testLabel = testType.replace(/_/g, ' ');

  const systemPrompt = `You are a medical documentation specialist generating a Letter of Medical Necessity (LOMN) for genomic sequencing. Write in a professional, clinical tone suitable for insurance submission.

The letter must:
1. Be addressed to the medical director of the insurance company
2. Include patient clinical details (cancer type, stage, relevant biomarkers)
3. Reference NCCN Clinical Practice Guidelines supporting the test
4. Include relevant CPT and ICD-10 codes
5. Explain how results will guide treatment decisions
6. Reference FDA approvals or clearances where applicable
7. Be approximately 400-500 words
8. Follow standard LOMN format with clear sections

Do NOT fabricate clinical details — use only what is provided. If information is missing, note it should be filled in by the ordering physician.`;

  const userPrompt = `Generate a Letter of Medical Necessity for the following:

PATIENT INFORMATION:
- Name: ${patient.name ?? '[PATIENT NAME]'}
- Cancer type: ${profile.cancerType ?? profile.cancerTypeNormalized ?? '[TO BE COMPLETED BY PHYSICIAN]'}
- Stage: ${profile.stage ?? '[TO BE COMPLETED BY PHYSICIAN]'}
- Biomarkers: ${profile.biomarkers ? JSON.stringify(profile.biomarkers) : 'Not yet tested'}
- Prior treatments: ${profile.priorTreatments?.map(t => t.name).join(', ') || 'None documented'}

TEST REQUESTED:
- Type: ${testLabel}
- Provider: ${providerName}
- CPT Codes: ${coverageResult.cptCodes.join(', ') || '81455'}

INSURANCE:
- Insurer: ${coverageResult.insurer}
- Coverage status: ${coverageResult.status}
- Prior auth required: ${coverageResult.priorAuthRequired ? 'Yes' : 'No'}
- Policy conditions: ${coverageResult.conditions.join('; ')}

CLINICAL JUSTIFICATION:
Based on NCCN guidelines, ${testLabel} is recommended for patients with ${profile.cancerType ?? 'this cancer type'}${profile.stage ? ` at stage ${profile.stage}` : ''} to identify actionable genomic alterations that may guide targeted therapy selection.`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = (message.content[0] as { type: 'text'; text: string }).text;

  // Determine ICD-10 codes based on cancer type
  const icdCodes = getIcdCodes(profile.cancerType ?? profile.cancerTypeNormalized ?? '');

  return {
    content,
    patientName: patient.name,
    testType,
    providerName,
    cptCodes: coverageResult.cptCodes.length > 0 ? coverageResult.cptCodes : ['81455'],
    icdCodes,
    nccnGuidelines: `NCCN recommends genomic profiling for ${profile.cancerType ?? 'solid tumors'} to identify actionable alterations`,
    generatedAt: new Date().toISOString(),
  };
}

function getIcdCodes(cancerType: string): string[] {
  const type = cancerType.toLowerCase();
  if (type.includes('breast')) return ['C50.9'];
  if (type.includes('lung') || type.includes('nsclc')) return ['C34.9'];
  if (type.includes('colon') || type.includes('colorectal')) return ['C18.9'];
  if (type.includes('melanoma')) return ['C43.9'];
  if (type.includes('prostate')) return ['C61'];
  if (type.includes('pancrea')) return ['C25.9'];
  if (type.includes('ovarian') || type.includes('ovary')) return ['C56.9'];
  if (type.includes('bladder') || type.includes('urothelial')) return ['C67.9'];
  if (type.includes('renal') || type.includes('kidney')) return ['C64.9'];
  if (type.includes('glioblastoma') || type.includes('brain')) return ['C71.9'];
  return ['C80.1']; // Malignant neoplasm, unspecified
}
