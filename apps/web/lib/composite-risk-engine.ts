/**
 * Composite Risk Engine — Gail Model + Genomic Data
 *
 * Wraps the Gail model and layers on PRS (polygenic risk score) and
 * monogenic variant data to produce a composite breast cancer risk estimate.
 *
 * Decision tree:
 *   1. No genomic data → return Gail as-is (gail_v1)
 *   2. PRS only → multiply Gail RR by PRS riskMultiplier (composite_v1)
 *   3. High-penetrance variant (BRCA1/2, TP53) → override with gene penetrance
 *   4. Moderate-penetrance variant (CHEK2/PALB2/ATM) → gene OR as additional RR multiplier
 *   5. Clamp lifetime risk at 95% ceiling
 */

import {
  calculateGailRisk,
  calculateAbsoluteRisk,
  categorizeRisk,
  analyzeModifiableFactors,
  type GailInputs,
  type RiskResult,
  type TrajectoryPoint,
  type ModifiableFactorResult,
} from './prevent-risk-engine';

// ============================================================================
// Types
// ============================================================================

export interface GenomicComponents {
  prsApplied: boolean;
  prsRiskMultiplier?: number;
  prsPercentile?: number;
  prsConfidence?: string;
  pathogenicVariantOverride?: {
    gene: string;
    variant: string;
    penetranceLow: number;
    penetranceHigh: number;
  };
  effectiveMultiplier: number;
  adjustmentMethod: 'prs_multiply' | 'gene_penetrance_override' | 'gene_prs_combined' | 'gail_only';
}

export interface CompositeRiskResult extends RiskResult {
  modelVersion: string;
  baseGailRisk: RiskResult;
  genomicComponents?: GenomicComponents;
}

// ============================================================================
// Gene Penetrance Constants
//
// Published lifetime breast cancer penetrance estimates for pathogenic variants.
// High-penetrance genes OVERRIDE Gail (Gail is not calibrated for carriers).
// Moderate-penetrance genes multiply Gail RR by gene-specific OR.
// ============================================================================

const GENE_PENETRANCE: Record<string, {
  lifetimeLow: number;
  lifetimeHigh: number;
  or: number;
  riskLevel: 'high' | 'moderate';
}> = {
  BRCA1:  { lifetimeLow: 55, lifetimeHigh: 72, or: 10.0, riskLevel: 'high' },
  BRCA2:  { lifetimeLow: 45, lifetimeHigh: 69, or: 6.0,  riskLevel: 'high' },
  TP53:   { lifetimeLow: 60, lifetimeHigh: 80, or: 12.0, riskLevel: 'high' },
  PALB2:  { lifetimeLow: 33, lifetimeHigh: 58, or: 3.5,  riskLevel: 'moderate' },
  CHEK2:  { lifetimeLow: 15, lifetimeHigh: 30, or: 2.5,  riskLevel: 'moderate' },
  ATM:    { lifetimeLow: 15, lifetimeHigh: 40, or: 2.0,  riskLevel: 'moderate' },
  RAD51C: { lifetimeLow: 15, lifetimeHigh: 30, or: 1.9,  riskLevel: 'moderate' },
  RAD51D: { lifetimeLow: 15, lifetimeHigh: 30, or: 1.8,  riskLevel: 'moderate' },
};

// ============================================================================
// Helpers
// ============================================================================

interface PathogenicVariantInfo {
  gene: string;
  rsId: string;
  variant: string;
  significance: string;
  riskLevel: 'high' | 'moderate';
}

function findHighestImpactVariant(
  pathogenicVariants: PathogenicVariantInfo[],
): { gene: string; variant: string; penetrance: typeof GENE_PENETRANCE[string] } | null {
  if (!pathogenicVariants?.length) return null;

  // Prioritize high-penetrance genes, then highest OR among moderate
  let best: { gene: string; variant: string; penetrance: typeof GENE_PENETRANCE[string] } | null = null;

  for (const v of pathogenicVariants) {
    const pen = GENE_PENETRANCE[v.gene];
    if (!pen) continue;
    if (!best || pen.riskLevel === 'high' && best.penetrance.riskLevel !== 'high' || pen.or > best.penetrance.or) {
      best = { gene: v.gene, variant: v.variant, penetrance: pen };
    }
  }

  return best;
}

function getCiMarginForConfidence(confidence?: string): number {
  switch (confidence) {
    case 'high': return 0.20;
    case 'moderate': return 0.30;
    case 'low': return 0.40;
    default: return 0.20;
  }
}

// ============================================================================
// Composite Risk Calculation
// ============================================================================

/**
 * Calculate composite breast cancer risk integrating Gail model with genomic data.
 *
 * @param gailInputs - Standard Gail model inputs
 * @param genomicProfile - Prisma GenomicProfile record (optional)
 * @param preventProfile - Prisma PreventProfile record (optional, for modifiable factors)
 */
export function calculateCompositeRisk(
  gailInputs: GailInputs,
  genomicProfile?: any,
  preventProfile?: any,
): CompositeRiskResult {
  // Step 1: Base Gail risk
  const baseGailRisk = calculateGailRisk(gailInputs);

  // No genomic data → return Gail as-is
  if (!genomicProfile) {
    return {
      ...baseGailRisk,
      modelVersion: 'gail_v1',
      baseGailRisk,
    };
  }

  const prsRiskMultiplier = genomicProfile.prsRiskMultiplier as number | null;
  const prsPercentile = genomicProfile.prsPercentile as number | null;
  const prsConfidence = genomicProfile.prsConfidence as string | null;
  const pathogenicVariants = (genomicProfile.pathogenicVariants as PathogenicVariantInfo[]) ?? [];

  const hasPrs = prsRiskMultiplier != null && prsRiskMultiplier > 0;
  const highestVariant = findHighestImpactVariant(pathogenicVariants);

  // No usable genomic data
  if (!hasPrs && !highestVariant) {
    return {
      ...baseGailRisk,
      modelVersion: 'gail_v1',
      baseGailRisk,
    };
  }

  const age = gailInputs.currentAge;
  let lifetimeRisk: number;
  let fiveYearRisk: number;
  let tenYearRisk: number;
  let ciMargin: number;
  let genomicComponents: GenomicComponents;

  if (highestVariant && highestVariant.penetrance.riskLevel === 'high') {
    // HIGH-PENETRANCE VARIANT (BRCA1/2, TP53): Override Gail
    const pen = highestVariant.penetrance;
    const midpoint = (pen.lifetimeLow + pen.lifetimeHigh) / 2;

    // If PRS available, modulate within penetrance range
    // Low PRS → lower end, high PRS → upper end (Kuchenbaecker 2017)
    if (hasPrs && prsPercentile != null) {
      const prsPosition = prsPercentile / 100; // 0-1
      lifetimeRisk = pen.lifetimeLow + prsPosition * (pen.lifetimeHigh - pen.lifetimeLow);
    } else {
      lifetimeRisk = midpoint;
    }

    // Approximate 5-year and 10-year from lifetime using age-proportional scaling
    const yearsRemaining = Math.max(90 - age, 1);
    fiveYearRisk = lifetimeRisk * Math.min(5 / yearsRemaining, 1);
    tenYearRisk = lifetimeRisk * Math.min(10 / yearsRemaining, 1);
    ciMargin = (pen.lifetimeHigh - pen.lifetimeLow) / 2 / lifetimeRisk;

    genomicComponents = {
      prsApplied: hasPrs,
      prsRiskMultiplier: hasPrs ? prsRiskMultiplier! : undefined,
      prsPercentile: prsPercentile ?? undefined,
      prsConfidence: prsConfidence ?? undefined,
      pathogenicVariantOverride: {
        gene: highestVariant.gene,
        variant: highestVariant.variant,
        penetranceLow: pen.lifetimeLow,
        penetranceHigh: pen.lifetimeHigh,
      },
      effectiveMultiplier: pen.or,
      adjustmentMethod: hasPrs ? 'gene_prs_combined' : 'gene_penetrance_override',
    };
  } else if (highestVariant && highestVariant.penetrance.riskLevel === 'moderate') {
    // MODERATE-PENETRANCE VARIANT: Gene OR × PRS multiplier on Gail
    const geneOR = highestVariant.penetrance.or;
    const combinedMultiplier = hasPrs ? geneOR * prsRiskMultiplier! : geneOR;

    lifetimeRisk = calculateAbsoluteRisk(gailInputs, age, 90, combinedMultiplier);
    fiveYearRisk = calculateAbsoluteRisk(gailInputs, age, Math.min(age + 5, 90), combinedMultiplier);
    tenYearRisk = calculateAbsoluteRisk(gailInputs, age, Math.min(age + 10, 90), combinedMultiplier);
    ciMargin = getCiMarginForConfidence(prsConfidence ?? undefined);

    genomicComponents = {
      prsApplied: hasPrs,
      prsRiskMultiplier: hasPrs ? prsRiskMultiplier! : undefined,
      prsPercentile: prsPercentile ?? undefined,
      prsConfidence: prsConfidence ?? undefined,
      pathogenicVariantOverride: {
        gene: highestVariant.gene,
        variant: highestVariant.variant,
        penetranceLow: highestVariant.penetrance.lifetimeLow,
        penetranceHigh: highestVariant.penetrance.lifetimeHigh,
      },
      effectiveMultiplier: combinedMultiplier,
      adjustmentMethod: hasPrs ? 'gene_prs_combined' : 'gene_penetrance_override',
    };
  } else {
    // PRS ONLY: Multiply Gail RR by PRS risk multiplier
    lifetimeRisk = calculateAbsoluteRisk(gailInputs, age, 90, prsRiskMultiplier!);
    fiveYearRisk = calculateAbsoluteRisk(gailInputs, age, Math.min(age + 5, 90), prsRiskMultiplier!);
    tenYearRisk = calculateAbsoluteRisk(gailInputs, age, Math.min(age + 10, 90), prsRiskMultiplier!);
    ciMargin = getCiMarginForConfidence(prsConfidence ?? undefined);

    genomicComponents = {
      prsApplied: true,
      prsRiskMultiplier: prsRiskMultiplier!,
      prsPercentile: prsPercentile ?? undefined,
      prsConfidence: prsConfidence ?? undefined,
      effectiveMultiplier: prsRiskMultiplier!,
      adjustmentMethod: 'prs_multiply',
    };
  }

  // Clamp at 95% ceiling
  lifetimeRisk = Math.min(lifetimeRisk, 95);
  fiveYearRisk = Math.min(fiveYearRisk, 95);
  tenYearRisk = Math.min(tenYearRisk, 95);

  const ciLow = Math.max(0, lifetimeRisk * (1 - ciMargin));
  const ciHigh = Math.min(95, lifetimeRisk * (1 + ciMargin));

  return {
    lifetimeRiskEstimate: Math.round(lifetimeRisk * 100) / 100,
    lifetimeRiskCiLow: Math.round(ciLow * 100) / 100,
    lifetimeRiskCiHigh: Math.round(ciHigh * 100) / 100,
    fiveYearRiskEstimate: Math.round(fiveYearRisk * 100) / 100,
    tenYearRiskEstimate: Math.round(tenYearRisk * 100) / 100,
    riskCategory: categorizeRisk(lifetimeRisk),
    gailInputs,
    modelVersion: 'composite_v1',
    baseGailRisk,
    genomicComponents,
  };
}

// ============================================================================
// Composite Trajectory
// ============================================================================

/**
 * Project risk trajectory using the composite model (Gail × effective multiplier).
 */
export function projectCompositeTrajectory(
  gailInputs: GailInputs,
  currentAge: number,
  effectiveMultiplier: number,
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  const ages: number[] = [];

  for (let a = currentAge; a <= 80; a += 5) {
    ages.push(a);
  }
  if (ages[ages.length - 1] < 80) ages.push(80);

  for (const targetAge of ages) {
    const risk = calculateAbsoluteRisk(gailInputs, currentAge, targetAge, effectiveMultiplier);
    const popAvg = calculateAbsoluteRisk(
      { ...gailInputs, ageAtMenarche: 13, ageAtFirstLiveBirth: 25, previousBiopsies: 0, atypicalHyperplasia: false, firstDegreeRelatives: 0 },
      currentAge,
      targetAge,
    );

    points.push({
      age: targetAge,
      risk: Math.round(Math.min(risk, 95) * 100) / 100,
      populationAverage: Math.round(popAvg * 100) / 100,
    });
  }

  return points;
}
