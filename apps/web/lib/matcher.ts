import { prisma } from './db';
import { anthropic, CLAUDE_MODEL } from './ai';
import type {
  PatientProfile,
  ParsedEligibility,
  MatchBreakdownItem,
  LLMAssessment,
  MatchDelta,
} from '@iish/shared';
import { TRIAL_STATUSES } from '@iish/shared';

// ---------------------------------------------------------------------------
// Cancer type fuzzy matching
// ---------------------------------------------------------------------------

// Canonical cancer type aliases for fuzzy matching.
// Key = normalized canonical name, values = common aliases / subtypes.
const CANCER_TYPE_ALIASES: Record<string, string[]> = {
  breast: [
    'breast', 'breast cancer', 'invasive ductal carcinoma', 'invasive lobular carcinoma',
    'ductal carcinoma in situ', 'dcis', 'idc', 'ilc', 'tnbc', 'triple negative breast',
    'her2 positive breast', 'er positive breast', 'inflammatory breast',
  ],
  lung: [
    'lung', 'lung cancer', 'nsclc', 'non-small cell lung', 'non small cell lung',
    'sclc', 'small cell lung', 'adenocarcinoma of lung', 'squamous cell lung',
    'lung adenocarcinoma', 'lung squamous',
  ],
  melanoma: [
    'melanoma', 'cutaneous melanoma', 'uveal melanoma', 'acral melanoma',
    'mucosal melanoma', 'skin melanoma',
  ],
  colorectal: [
    'colorectal', 'colorectal cancer', 'colon cancer', 'rectal cancer', 'crc',
    'colon', 'rectum', 'sigmoid',
  ],
  pancreatic: [
    'pancreatic', 'pancreatic cancer', 'pancreas', 'pancreatic adenocarcinoma',
    'pdac', 'pancreatic ductal',
  ],
  ovarian: [
    'ovarian', 'ovarian cancer', 'ovary', 'epithelial ovarian',
    'high grade serous ovarian', 'hgsoc',
  ],
  prostate: [
    'prostate', 'prostate cancer', 'prostate adenocarcinoma', 'crpc',
    'castration resistant prostate',
  ],
  bladder: [
    'bladder', 'bladder cancer', 'urothelial', 'urothelial carcinoma',
    'transitional cell carcinoma',
  ],
  kidney: [
    'kidney', 'kidney cancer', 'renal cell', 'renal cell carcinoma', 'rcc',
    'clear cell renal',
  ],
  head_neck: [
    'head and neck', 'head neck', 'hnscc', 'squamous cell carcinoma of head',
    'oropharyngeal', 'laryngeal', 'nasopharyngeal', 'oral cavity',
  ],
  liver: [
    'liver', 'liver cancer', 'hepatocellular', 'hepatocellular carcinoma', 'hcc',
  ],
  gastric: [
    'gastric', 'gastric cancer', 'stomach', 'stomach cancer', 'esophageal',
    'gastroesophageal', 'gej',
  ],
  endometrial: [
    'endometrial', 'endometrial cancer', 'uterine', 'uterine cancer',
  ],
  cervical: [
    'cervical', 'cervical cancer',
  ],
  glioblastoma: [
    'glioblastoma', 'gbm', 'glioma', 'brain cancer', 'brain tumor',
  ],
};

/**
 * Normalize a cancer type string for comparison:
 * lowercase, strip trailing "cancer", collapse whitespace.
 */
function normalizeCancerString(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Resolve a cancer string to its canonical key using the alias table.
 * Returns the canonical key or the normalized input if no alias found.
 */
function toCanonicalCancerType(input: string): string {
  const norm = normalizeCancerString(input);
  for (const [canonical, aliases] of Object.entries(CANCER_TYPE_ALIASES)) {
    if (canonical === norm) return canonical;
    for (const alias of aliases) {
      if (norm === alias || norm.includes(alias) || alias.includes(norm)) {
        return canonical;
      }
    }
  }
  return norm;
}

/**
 * Fuzzy-match a patient cancer type against a trial's cancer types.
 * Returns true if any trial cancer type maps to the same canonical key.
 */
function cancerTypeFuzzyMatch(
  patientType: string | undefined,
  trialTypes: { name: string; normalized: string }[],
): 'match' | 'unknown' | 'mismatch' {
  if (!patientType || trialTypes.length === 0) return 'unknown';

  const patientCanonical = toCanonicalCancerType(patientType);

  for (const tt of trialTypes) {
    const trialCanonical = toCanonicalCancerType(tt.normalized || tt.name);
    if (patientCanonical === trialCanonical) return 'match';
  }

  // Also try substring matching as a fallback (e.g., "solid tumor" trials)
  const patientNorm = normalizeCancerString(patientType);
  for (const tt of trialTypes) {
    const trialNorm = normalizeCancerString(tt.normalized || tt.name);
    if (trialNorm.includes('solid tumor') || trialNorm.includes('advanced solid')) {
      return 'match'; // Generic solid tumor trial accepts most cancer types
    }
    if (patientNorm.includes(trialNorm) || trialNorm.includes(patientNorm)) {
      return 'match';
    }
  }

  return 'mismatch';
}

// ---------------------------------------------------------------------------
// Stage comparison matching
// ---------------------------------------------------------------------------

/**
 * Parse a stage string into a numeric order for comparison.
 * Handles: I, IA, IB, II, IIA, IIB, III, IIIA, IIIB, IIIC, IV, IVA, IVB
 * Also handles "Stage I", "Stage IIB", "locally advanced", "metastatic", etc.
 */
const STAGE_ORDER: Record<string, number> = {
  '0': 0,
  'i': 1, 'ia': 1.1, 'ib': 1.2, 'ic': 1.3,
  'ii': 2, 'iia': 2.1, 'iib': 2.2, 'iic': 2.3,
  'iii': 3, 'iiia': 3.1, 'iiib': 3.2, 'iiic': 3.3,
  'iv': 4, 'iva': 4.1, 'ivb': 4.2, 'ivc': 4.3,
};

// Keywords that map to approximate stage values
const STAGE_KEYWORDS: Record<string, number> = {
  'early': 1.5,          // ~Stage I-II
  'early stage': 1.5,
  'locally advanced': 3, // ~Stage III
  'advanced': 3.5,       // Stage III-IV
  'metastatic': 4,       // Stage IV
  'unresectable': 3.5,   // Usually Stage III-IV
};

function parseStageNumeric(stage: string): number | null {
  const cleaned = stage
    .toLowerCase()
    .replace(/^stage\s*/i, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

  if (STAGE_ORDER[cleaned] != null) return STAGE_ORDER[cleaned];

  // Try keyword matching on original string
  const lower = stage.toLowerCase();
  for (const [keyword, value] of Object.entries(STAGE_KEYWORDS)) {
    if (lower.includes(keyword)) return value;
  }

  return null;
}

/**
 * Check if a patient's stage matches a trial's allowed stages.
 * Trial stages may include: "Stage II", "III", "locally advanced", "metastatic", etc.
 */
function stageMatch(
  patientStage: string | undefined,
  trialStages: string[],
): 'match' | 'unknown' | 'mismatch' {
  if (!patientStage) return 'unknown';
  if (trialStages.length === 0) return 'unknown'; // Trial doesn't specify stages

  const patientNum = parseStageNumeric(patientStage);
  if (patientNum === null) return 'unknown';

  // Parse all trial stages to numeric ranges
  const trialNums = trialStages.map(parseStageNumeric).filter((n): n is number => n !== null);
  if (trialNums.length === 0) return 'unknown';

  // If the trial lists specific stages, check if patient's stage major number is in range
  const trialMin = Math.floor(Math.min(...trialNums));
  const trialMax = Math.ceil(Math.max(...trialNums));
  const patientMajor = Math.floor(patientNum);

  // Check exact substage match first
  for (const tn of trialNums) {
    if (Math.abs(patientNum - tn) < 0.01) return 'match';
  }

  // Check if patient's major stage is within the trial's range
  if (patientMajor >= trialMin && patientMajor <= trialMax) return 'match';

  return 'mismatch';
}

// ---------------------------------------------------------------------------
// Biomarker matching
// ---------------------------------------------------------------------------

function biomarkerMatch(
  profile: PatientProfile,
  eligibility: ParsedEligibility,
): { status: 'match' | 'unknown' | 'mismatch'; reason: string } {
  const required = eligibility.biomarkers.required;
  const excluded = eligibility.biomarkers.excluded;

  if (required.length === 0 && excluded.length === 0) {
    return { status: 'unknown', reason: 'No biomarker requirements specified' };
  }

  const patientBiomarkers = { ...profile.biomarkers };
  // Also check receptor status as biomarkers
  if (profile.receptorStatus?.er) {
    patientBiomarkers['ER'] = profile.receptorStatus.er.status;
    patientBiomarkers['estrogen receptor'] = profile.receptorStatus.er.status;
  }
  if (profile.receptorStatus?.pr) {
    patientBiomarkers['PR'] = profile.receptorStatus.pr.status;
    patientBiomarkers['progesterone receptor'] = profile.receptorStatus.pr.status;
  }
  if (profile.receptorStatus?.her2) {
    patientBiomarkers['HER2'] = profile.receptorStatus.her2.status;
  }

  const patientKeys = Object.keys(patientBiomarkers).map((k) => k.toLowerCase());
  const patientMap = new Map<string, string>();
  for (const [k, v] of Object.entries(patientBiomarkers)) {
    patientMap.set(k.toLowerCase(), v.toLowerCase());
  }

  // Check excluded biomarkers (any match = mismatch)
  for (const exc of excluded) {
    const excName = exc.name.toLowerCase();
    for (const pk of patientKeys) {
      if (pk.includes(excName) || excName.includes(pk)) {
        const val = patientMap.get(pk) ?? '';
        if (val.includes('positive') || val.includes('mutant') || val.includes('high')) {
          return { status: 'mismatch', reason: `Trial excludes ${exc.name} positive patients` };
        }
      }
    }
  }

  // Check required biomarkers
  let hasUnknown = false;
  for (const req of required) {
    const reqName = req.name.toLowerCase();
    let found = false;
    for (const pk of patientKeys) {
      if (pk.includes(reqName) || reqName.includes(pk)) {
        found = true;
        const val = patientMap.get(pk) ?? '';
        const condLower = req.condition.toLowerCase();
        // Check if patient's value matches the required condition
        if (condLower.includes('positive') || condLower.includes('mutation')) {
          if (val.includes('negative')) {
            return { status: 'mismatch', reason: `Trial requires ${req.name} ${req.condition}, you have negative` };
          }
        }
        break;
      }
    }
    if (!found) hasUnknown = true;
  }

  if (hasUnknown) {
    return { status: 'unknown', reason: 'Some required biomarker data not available' };
  }

  return { status: 'match', reason: 'Biomarker requirements appear compatible' };
}

// ---------------------------------------------------------------------------
// Treatment history matching
// ---------------------------------------------------------------------------

function treatmentMatch(
  profile: PatientProfile,
  eligibility: ParsedEligibility,
): { status: 'match' | 'unknown' | 'mismatch'; reason: string } {
  const required = eligibility.priorTreatments.required;
  const excluded = eligibility.priorTreatments.excluded;

  if (required.length === 0 && excluded.length === 0) {
    return { status: 'unknown', reason: 'No treatment requirements specified' };
  }

  const patientTreatments = (profile.priorTreatments ?? []).map((t) => ({
    name: t.name.toLowerCase(),
    type: t.type.toLowerCase(),
  }));

  // Check excluded treatments
  for (const exc of excluded) {
    const excName = exc.name.toLowerCase();
    const excType = exc.type.toLowerCase();
    for (const pt of patientTreatments) {
      if (pt.name.includes(excName) || excName.includes(pt.name) || pt.type.includes(excType)) {
        return { status: 'mismatch', reason: `Trial excludes patients with prior ${exc.name}` };
      }
    }
  }

  // Check required treatments
  if (patientTreatments.length === 0 && required.length > 0) {
    return { status: 'unknown', reason: 'Treatment history not available to check requirements' };
  }

  for (const req of required) {
    const reqName = req.name.toLowerCase();
    const reqType = req.type.toLowerCase();
    const found = patientTreatments.some(
      (pt) => pt.name.includes(reqName) || reqName.includes(pt.name) || pt.type.includes(reqType)
    );
    if (!found) {
      return { status: 'unknown', reason: `Trial requires prior ${req.name} — not confirmed in your records` };
    }
  }

  return { status: 'match', reason: 'Treatment history compatible' };
}

// ---------------------------------------------------------------------------
// ECOG matching
// ---------------------------------------------------------------------------

function ecogMatch(
  patientEcog: number | undefined,
  eligibility: ParsedEligibility,
): { status: 'match' | 'unknown' | 'mismatch'; reason: string } {
  const { min, max } = eligibility.ecogRange;
  if (min === null && max === null) return { status: 'unknown', reason: 'No ECOG requirement' };
  if (patientEcog == null) return { status: 'unknown', reason: 'ECOG status not provided' };

  if (min !== null && patientEcog < min) {
    return { status: 'mismatch', reason: `Trial requires ECOG ≥ ${min}, yours is ${patientEcog}` };
  }
  if (max !== null && patientEcog > max) {
    return { status: 'mismatch', reason: `Trial requires ECOG ≤ ${max}, yours is ${patientEcog}` };
  }
  return { status: 'match', reason: `ECOG ${patientEcog} within required range` };
}

// ---------------------------------------------------------------------------
// Age matching
// ---------------------------------------------------------------------------

function ageMatch(
  patientAge: number | undefined,
  eligibility: ParsedEligibility,
): { status: 'match' | 'unknown' | 'mismatch'; reason: string } {
  const { min, max } = eligibility.ageRange;
  if (min === null && max === null) return { status: 'unknown', reason: 'No age requirement' };
  if (patientAge == null) return { status: 'unknown', reason: 'Age not provided' };

  if (min !== null && patientAge < min) {
    return { status: 'mismatch', reason: `Trial requires age ≥ ${min}, yours is ${patientAge}` };
  }
  if (max !== null && patientAge > max) {
    return { status: 'mismatch', reason: `Trial requires age ≤ ${max}, yours is ${patientAge}` };
  }
  return { status: 'match', reason: `Age ${patientAge} within required range` };
}

// ---------------------------------------------------------------------------
// Genomic matching
// ---------------------------------------------------------------------------

function genomicMatch(
  profile: PatientProfile,
  eligibility: ParsedEligibility,
): { status: 'match' | 'unknown' | 'mismatch'; reason: string; details: { matchedBiomarkers: string[]; matchedGenomicCriteria: string[] } } {
  const genomic = profile.genomicData;
  if (!genomic) {
    return { status: 'unknown', reason: 'No genomic data available', details: { matchedBiomarkers: [], matchedGenomicCriteria: [] } };
  }

  const matchedBiomarkers: string[] = [];
  const matchedGenomicCriteria: string[] = [];
  let hasMismatch = false;
  let mismatchReason = '';

  const alterationGenes = genomic.alterations.map(a => a.gene.toLowerCase());
  const alterationMap = new Map(genomic.alterations.map(a => [a.gene.toLowerCase(), a]));

  // Check required biomarkers against genomic data
  for (const req of eligibility.biomarkers.required) {
    const reqName = req.name.toLowerCase();
    const reqCondition = req.condition.toLowerCase();

    // Check TMB threshold
    if (reqName.includes('tmb') || reqName.includes('tumor mutational burden')) {
      if (genomic.biomarkers.tmb) {
        const thresholdMatch = reqCondition.match(/(?:>=?|≥)\s*(\d+)/);
        if (thresholdMatch) {
          const threshold = parseFloat(thresholdMatch[1]);
          if (genomic.biomarkers.tmb.value >= threshold) {
            matchedBiomarkers.push(`TMB ${genomic.biomarkers.tmb.value} ${genomic.biomarkers.tmb.unit} meets threshold ≥${threshold}`);
          } else {
            hasMismatch = true;
            mismatchReason = `TMB ${genomic.biomarkers.tmb.value} below required ≥${threshold}`;
          }
        } else if (reqCondition.includes('high')) {
          if (genomic.biomarkers.tmb.status.toLowerCase() === 'high') {
            matchedBiomarkers.push(`TMB-High (${genomic.biomarkers.tmb.value} ${genomic.biomarkers.tmb.unit})`);
          } else {
            hasMismatch = true;
            mismatchReason = `Trial requires TMB-High, yours is ${genomic.biomarkers.tmb.status}`;
          }
        }
      }
      continue;
    }

    // Check MSI status
    if (reqName.includes('msi') || reqName.includes('microsatellite')) {
      if (genomic.biomarkers.msi) {
        if (reqCondition.includes('high') || reqCondition.includes('msi-h')) {
          if (genomic.biomarkers.msi.status.toLowerCase().includes('high') || genomic.biomarkers.msi.status.toLowerCase() === 'msi-h') {
            matchedBiomarkers.push(`MSI-High status matches`);
          } else {
            hasMismatch = true;
            mismatchReason = `Trial requires MSI-High, yours is ${genomic.biomarkers.msi.status}`;
          }
        }
      }
      continue;
    }

    // Check PD-L1
    if (reqName.includes('pd-l1') || reqName.includes('pdl1')) {
      if (genomic.biomarkers.pdl1) {
        const cpsMatch = reqCondition.match(/cps\s*(?:>=?|≥)\s*(\d+)/i);
        const tpsMatch = reqCondition.match(/tps\s*(?:>=?|≥)\s*(\d+)/i);
        if (cpsMatch && genomic.biomarkers.pdl1.cps !== null) {
          const threshold = parseFloat(cpsMatch[1]);
          if (genomic.biomarkers.pdl1.cps >= threshold) {
            matchedBiomarkers.push(`PD-L1 CPS ${genomic.biomarkers.pdl1.cps} meets threshold ≥${threshold}`);
          }
        } else if (tpsMatch && genomic.biomarkers.pdl1.tps !== null) {
          const threshold = parseFloat(tpsMatch[1]);
          if (genomic.biomarkers.pdl1.tps >= threshold) {
            matchedBiomarkers.push(`PD-L1 TPS ${genomic.biomarkers.pdl1.tps}% meets threshold ≥${threshold}`);
          }
        }
      }
      continue;
    }

    // Check specific gene mutations
    for (const gene of alterationGenes) {
      if (reqName.includes(gene) || gene.includes(reqName)) {
        const alt = alterationMap.get(gene)!;
        if (reqCondition.includes('mutation') || reqCondition.includes('positive') || reqCondition.includes('alteration')) {
          matchedGenomicCriteria.push(`${alt.gene} ${alt.alteration} matches required ${req.name}`);
        }
      }
    }
  }

  // Check excluded biomarkers against genomic data
  for (const exc of eligibility.biomarkers.excluded) {
    const excName = exc.name.toLowerCase();
    for (const gene of alterationGenes) {
      if (excName.includes(gene) || gene.includes(excName)) {
        const alt = alterationMap.get(gene)!;
        hasMismatch = true;
        mismatchReason = `Trial excludes ${exc.name}, found ${alt.gene} ${alt.alteration}`;
        break;
      }
    }
  }

  if (hasMismatch) {
    return { status: 'mismatch', reason: mismatchReason, details: { matchedBiomarkers, matchedGenomicCriteria } };
  }

  if (matchedBiomarkers.length > 0 || matchedGenomicCriteria.length > 0) {
    return {
      status: 'match',
      reason: `Genomic profile matches: ${[...matchedBiomarkers, ...matchedGenomicCriteria].join('; ')}`,
      details: { matchedBiomarkers, matchedGenomicCriteria },
    };
  }

  return { status: 'unknown', reason: 'No specific genomic criteria to match against', details: { matchedBiomarkers: [], matchedGenomicCriteria: [] } };
}

// ---------------------------------------------------------------------------
// Dynamic weight function
// ---------------------------------------------------------------------------

function getWeights(hasGenomicData: boolean) {
  if (!hasGenomicData) return WEIGHTS;
  return {
    cancerType: 0.25 * 0.75,
    stage: 0.20 * 0.75,
    biomarkers: 0.20 * 0.75,
    priorTreatments: 0.15 * 0.75,
    ecog: 0.10 * 0.75,
    age: 0.10 * 0.75,
    genomics: 0.25,
  };
}

// ---------------------------------------------------------------------------
// Tier 2: Soft scoring
// ---------------------------------------------------------------------------

interface ScoredTrial {
  trialId: string;
  nctId: string;
  title: string;
  sponsor: string | null;
  phase: string | null;
  status: string;
  briefSummary: string | null;
  interventionName: string | null;
  interventionType: string | null;
  rawEligibilityText: string | null;
  parsedEligibility: ParsedEligibility;
  matchScore: number;
  breakdown: MatchBreakdownItem[];
  potentialBlockers: string[];
}

const WEIGHTS = {
  cancerType: 0.25,
  stage: 0.20,
  biomarkers: 0.20,
  priorTreatments: 0.15,
  ecog: 0.10,
  age: 0.10,
} as const;

function scoreStatus(status: 'match' | 'unknown' | 'mismatch'): number {
  if (status === 'match') return 100;
  if (status === 'unknown') return 50;
  return 0;
}

function scoreTrial(profile: PatientProfile, trial: { parsedEligibility: ParsedEligibility }): {
  score: number;
  breakdown: MatchBreakdownItem[];
  potentialBlockers: string[];
} {
  const elig = trial.parsedEligibility;
  const breakdown: MatchBreakdownItem[] = [];
  const blockers: string[] = [];
  const hasGenomic = !!profile.genomicData;
  const weights = getWeights(hasGenomic);

  // Cancer type (fuzzy)
  const ctStatus = cancerTypeFuzzyMatch(
    profile.cancerTypeNormalized ?? profile.cancerType,
    elig.cancerTypes,
  );
  breakdown.push({
    category: 'cancerType',
    score: scoreStatus(ctStatus),
    weight: weights.cancerType,
    status: ctStatus,
    reason: ctStatus === 'match'
      ? 'Cancer type matches'
      : ctStatus === 'mismatch'
        ? `Trial is for ${elig.cancerTypes.map((c) => c.name).join(', ')}`
        : 'Cancer type compatibility not confirmed',
  });
  if (ctStatus === 'mismatch') blockers.push('Cancer type does not match this trial');

  // Stage (structured comparison)
  const stStatus = stageMatch(profile.stage, elig.stages);
  breakdown.push({
    category: 'stage',
    score: scoreStatus(stStatus),
    weight: weights.stage,
    status: stStatus,
    reason: stStatus === 'match'
      ? `Stage ${profile.stage} matches trial requirement`
      : stStatus === 'mismatch'
        ? `Trial requires ${elig.stages.join(', ')}, your stage is ${profile.stage}`
        : profile.stage
          ? `Stage ${profile.stage} — compatibility uncertain`
          : 'Stage not provided',
  });
  if (stStatus === 'mismatch') blockers.push(`Stage ${profile.stage} may not meet trial requirements`);

  // Biomarkers
  const bmResult = biomarkerMatch(profile, elig);
  breakdown.push({
    category: 'biomarkers',
    score: scoreStatus(bmResult.status),
    weight: weights.biomarkers,
    status: bmResult.status,
    reason: bmResult.reason,
  });
  if (bmResult.status === 'mismatch') blockers.push(bmResult.reason);

  // Prior treatments
  const txResult = treatmentMatch(profile, elig);
  breakdown.push({
    category: 'priorTreatments',
    score: scoreStatus(txResult.status),
    weight: weights.priorTreatments,
    status: txResult.status,
    reason: txResult.reason,
  });
  if (txResult.status === 'mismatch') blockers.push(txResult.reason);

  // ECOG
  const ecResult = ecogMatch(profile.ecogStatus, elig);
  breakdown.push({
    category: 'ecog',
    score: scoreStatus(ecResult.status),
    weight: weights.ecog,
    status: ecResult.status,
    reason: ecResult.reason,
  });
  if (ecResult.status === 'mismatch') blockers.push(ecResult.reason);

  // Age
  const ageResult = ageMatch(profile.age, elig);
  breakdown.push({
    category: 'age',
    score: scoreStatus(ageResult.status),
    weight: weights.age,
    status: ageResult.status,
    reason: ageResult.reason,
  });
  if (ageResult.status === 'mismatch') blockers.push(ageResult.reason);

  // Genomics (only if genomic data present)
  if (hasGenomic) {
    const gmResult = genomicMatch(profile, elig);
    breakdown.push({
      category: 'genomics',
      score: scoreStatus(gmResult.status),
      weight: (weights as { genomics: number }).genomics,
      status: gmResult.status,
      reason: gmResult.reason,
    });
    if (gmResult.status === 'mismatch') blockers.push(gmResult.reason);
  }

  // Weighted sum
  const score = breakdown.reduce((sum, item) => sum + item.score * item.weight, 0);

  return { score: Math.round(score * 10) / 10, breakdown, potentialBlockers: blockers };
}

// ---------------------------------------------------------------------------
// Tier 3: LLM-assisted assessment (top N trials)
// ---------------------------------------------------------------------------

const LLM_ASSESSMENT_SYSTEM = `You are an expert oncology clinical trial eligibility assessor. Given a patient's clinical profile and a trial's eligibility criteria, provide a nuanced assessment of whether the patient is likely eligible.

Respond ONLY with a JSON object matching this exact schema:
{
  "overallAssessment": "likely_eligible" | "possibly_eligible" | "likely_ineligible",
  "reasoning": "2-3 sentence explanation",
  "potentialBlockers": ["specific things that might disqualify"],
  "missingInfo": ["information needed to confirm eligibility"],
  "actionItems": ["concrete steps like 'Get PD-L1 tested', 'Ask about ECOG status'"]
}

RULES:
- Be conservative: when uncertain, lean toward "possibly_eligible" rather than "likely_eligible"
- potentialBlockers should be specific, not generic
- actionItems should be things the patient or their oncologist can actually do
- If there isn't enough patient data to assess, say so in reasoning`;

async function llmAssessment(
  profile: PatientProfile,
  rawEligibilityText: string,
): Promise<LLMAssessment> {
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: LLM_ASSESSMENT_SYSTEM,
    messages: [{
      role: 'user',
      content: `PATIENT PROFILE:\n${JSON.stringify(profile, null, 2)}\n\nTRIAL ELIGIBILITY CRITERIA:\n${rawEligibilityText}`,
    }],
  });

  const text = (message.content[0] as { type: 'text'; text: string }).text;
  const clean = text.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(clean) as LLMAssessment;
}

// ---------------------------------------------------------------------------
// Main matching pipeline
// ---------------------------------------------------------------------------

export async function generateMatchesForPatient(patientId: string): Promise<number> {
  // Load patient
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, profile: true },
  });
  if (!patient?.profile) return 0;

  const profile = patient.profile as unknown as PatientProfile;

  // Tier 1: Load trials with parsedEligibility that are actively recruiting
  const trials = await prisma.trial.findMany({
    where: {
      status: { in: [TRIAL_STATUSES.RECRUITING, TRIAL_STATUSES.NOT_YET_RECRUITING, TRIAL_STATUSES.ENROLLING_BY_INVITATION] },
      parsedEligibility: { not: { equals: null } },
    },
    select: {
      id: true,
      nctId: true,
      title: true,
      sponsor: true,
      phase: true,
      status: true,
      briefSummary: true,
      interventionName: true,
      interventionType: true,
      rawEligibilityText: true,
      parsedEligibility: true,
    },
  });

  // Tier 1: Hard filter — cancer type must not be a definite mismatch
  // (we keep "unknown" matches since we give benefit of the doubt)
  const patientCancerType = profile.cancerTypeNormalized ?? profile.cancerType;
  const tier1 = trials.filter((trial) => {
    const elig = trial.parsedEligibility as unknown as ParsedEligibility;
    if (!elig?.cancerTypes) return false;

    // Skip trials that definitely don't match cancer type
    if (patientCancerType && elig.cancerTypes.length > 0) {
      const ctResult = cancerTypeFuzzyMatch(patientCancerType, elig.cancerTypes);
      if (ctResult === 'mismatch') return false;
    }

    // Skip trials where age is a definite mismatch
    if (profile.age != null) {
      const { min, max } = elig.ageRange;
      if (min !== null && profile.age < min) return false;
      if (max !== null && profile.age > max) return false;
    }

    return true;
  });

  // Tier 2: Score remaining trials
  const scored: ScoredTrial[] = tier1.map((trial) => {
    const elig = trial.parsedEligibility as unknown as ParsedEligibility;
    const { score, breakdown, potentialBlockers } = scoreTrial(profile, { parsedEligibility: elig });
    return {
      trialId: trial.id,
      nctId: trial.nctId,
      title: trial.title,
      sponsor: trial.sponsor,
      phase: trial.phase,
      status: trial.status,
      briefSummary: trial.briefSummary,
      interventionName: trial.interventionName,
      interventionType: trial.interventionType,
      rawEligibilityText: trial.rawEligibilityText,
      parsedEligibility: elig,
      matchScore: score,
      breakdown,
      potentialBlockers,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Tier 3: LLM assessment for top 10
  const top10 = scored.slice(0, 10);
  const assessments = new Map<string, LLMAssessment>();

  for (const trial of top10) {
    if (!trial.rawEligibilityText) continue;
    try {
      const assessment = await llmAssessment(profile, trial.rawEligibilityText);
      assessments.set(trial.trialId, assessment);

      // Merge LLM blockers into potentialBlockers
      if (assessment.potentialBlockers.length > 0) {
        trial.potentialBlockers = [
          ...new Set([...trial.potentialBlockers, ...assessment.potentialBlockers]),
        ];
      }

      // Adjust score based on LLM assessment
      if (assessment.overallAssessment === 'likely_ineligible') {
        trial.matchScore = Math.min(trial.matchScore, 30);
      }
    } catch (err) {
      console.error(`LLM assessment failed for trial ${trial.nctId}:`, err);
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Re-sort after LLM adjustments
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Upsert Match records (keep all scored trials, not just top 10)
  for (const trial of scored) {
    const llm = assessments.get(trial.trialId);
    const matchBreakdown = trial.breakdown.map((b) => ({
      category: b.category,
      score: b.score,
      weight: b.weight,
      status: b.status,
      reason: b.reason,
    }));

    const data = {
      matchScore: trial.matchScore,
      matchBreakdown: JSON.parse(JSON.stringify({
        items: matchBreakdown,
        ...(llm ? { llmAssessment: llm } : {}),
      })),
      potentialBlockers: JSON.parse(JSON.stringify(trial.potentialBlockers)),
      status: 'new',
    };

    await prisma.match.upsert({
      where: {
        patientId_trialId: { patientId, trialId: trial.trialId },
      },
      create: { patientId, trialId: trial.trialId, ...data },
      update: data,
    });
  }

  return scored.length;
}

// ---------------------------------------------------------------------------
// Compute match delta (before vs after genomic data)
// ---------------------------------------------------------------------------

export async function computeMatchDelta(patientId: string): Promise<MatchDelta> {
  // Load existing matches (before scores)
  const existingMatches = await prisma.match.findMany({
    where: { patientId },
    select: { trialId: true, matchScore: true, trial: { select: { nctId: true, title: true } } },
  });
  const beforeMap = new Map(existingMatches.map(m => [m.trialId, { score: m.matchScore, nctId: m.trial.nctId, title: m.trial.title }]));
  const totalBefore = existingMatches.length;

  // Re-run matching (now includes genomic data in profile)
  await generateMatchesForPatient(patientId);

  // Load new matches
  const newMatches = await prisma.match.findMany({
    where: { patientId },
    select: { trialId: true, matchScore: true, matchBreakdown: true, trial: { select: { nctId: true, title: true } } },
  });

  const delta: MatchDelta = {
    newMatches: [],
    improvedMatches: [],
    removedMatches: [],
    totalBefore,
    totalAfter: newMatches.length,
  };

  const afterTrialIds = new Set<string>();

  for (const match of newMatches) {
    afterTrialIds.add(match.trialId);
    const before = beforeMap.get(match.trialId);

    // Determine genomic basis from breakdown
    const breakdown = match.matchBreakdown as { items?: { category: string; reason: string }[] } | null;
    const genomicsItem = breakdown?.items?.find(i => i.category === 'genomics');
    const genomicBasis = genomicsItem?.reason ?? '';

    if (!before) {
      delta.newMatches.push({
        trialId: match.trialId,
        nctId: match.trial.nctId,
        title: match.trial.title,
        matchScore: match.matchScore,
        genomicBasis,
      });
    } else if (match.matchScore > before.score + 1) {
      delta.improvedMatches.push({
        trialId: match.trialId,
        nctId: match.trial.nctId,
        title: match.trial.title,
        oldScore: before.score,
        newScore: match.matchScore,
        genomicBasis,
      });
    }
  }

  // Find removed matches
  for (const [trialId, before] of beforeMap) {
    if (!afterTrialIds.has(trialId)) {
      delta.removedMatches.push({
        trialId,
        nctId: before.nctId,
        title: before.title,
        reason: 'Genomic data revealed incompatibility',
      });
    }
  }

  return delta;
}

// Exported for testing/reuse
export {
  cancerTypeFuzzyMatch,
  stageMatch,
  biomarkerMatch,
  treatmentMatch,
  toCanonicalCancerType,
  parseStageNumeric,
  scoreTrial,
  genomicMatch,
};
