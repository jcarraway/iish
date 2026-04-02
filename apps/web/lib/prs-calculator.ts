/**
 * PRS Calculator — Polygenic Risk Score from SNP Dosages
 *
 * Takes extracted SNP dosages (from genotype-parser.ts) and calculates
 * a standardized polygenic risk score with ancestry calibration.
 *
 * Reference: Mavaddat N, et al. Am J Hum Genet. 2019;104(1):21-34.
 * Model: 313-SNP breast cancer PRS (we use the high-weight subset).
 * OR per SD: 1.61 for overall breast cancer risk.
 */

import { PRS_SNPS, type PrsSnpRef } from './genotype-parser';

// ============================================================================
// Types
// ============================================================================

export interface PrsCalculationResult {
  rawScore: number;
  standardizedScore: number;     // z-score
  percentile: number;            // 0-100
  oddsRatioPerSD: number;        // 1.61 (published)
  snpsUsed: number;
  snpsTotal: number;
  coverage: number;              // 0-1
  confidence: 'high' | 'moderate' | 'low';
  ancestryCalibration: string;
  riskMultiplier: number;        // multiplicative factor for Gail integration
}

// ============================================================================
// Population Parameters
//
// Pre-computed from published European allele frequencies for the SNPs in
// our reference panel. These are constants derived from:
//   mean = Σ (2 × freq_i × weight_i)
//   var  = Σ (2 × freq_i × (1 - freq_i) × weight_i²)
//   sd   = sqrt(var)
//
// European allele frequencies sourced from gnomAD v3 / 1000 Genomes EUR.
// ============================================================================

// Approximate European allele frequencies for PRS SNPs (effect allele freq)
// Used to compute population mean and SD for standardization
const EUR_ALLELE_FREQS: Record<string, number> = {
  rs2981582: 0.38, rs3803662: 0.25, rs889312: 0.28, rs13281615: 0.40,
  rs3817198: 0.30, rs13387042: 0.50, rs4973768: 0.46, rs10941679: 0.26,
  rs6504950: 0.27, rs11249433: 0.40, rs999737: 0.23, rs2046210: 0.35,
  rs2823093: 0.26, rs10995190: 0.16, rs704010: 0.39, rs614367: 0.14,
  rs1292011: 0.41, rs10771399: 0.12, rs865686: 0.38, rs17356907: 0.30,
  rs1011970: 0.17, rs2380205: 0.43, rs16857609: 0.26, rs2588809: 0.22,
  rs941764: 0.34, rs17817449: 0.42, rs6472903: 0.14, rs2943559: 0.08,
  rs6762644: 0.33, rs12493607: 0.34, rs11814448: 0.03, rs4849887: 0.10,
  rs2236007: 0.22, rs17529111: 0.22, rs12422552: 0.27, rs6828523: 0.17,
  rs11242675: 0.40, rs1550623: 0.16, rs4808801: 0.35, rs720475: 0.21,
  rs9693444: 0.32, rs6001930: 0.10, rs11571833: 0.01, rs1436904: 0.42,
  rs4245739: 0.26, rs132390: 0.28, rs11571836: 0.10, rs75915166: 0.01,
  rs616488: 0.33, rs6678914: 0.41, rs12710696: 0.37, rs11552449: 0.14,
  rs4849882: 0.10, rs1353747: 0.08, rs6796502: 0.06, rs2012709: 0.39,
  rs10069690: 0.26, rs7726159: 0.34, rs2363956: 0.47, rs6757320: 0.12,
  rs12710707: 0.36, rs2016394: 0.46, rs17350191: 0.24, rs34005590: 0.08,
  rs6569648: 0.38, rs3757318: 0.07, rs851984: 0.49, rs4548337: 0.18,
  rs4236605: 0.28, rs2943560: 0.10, rs10816625: 0.05, rs13294895: 0.21,
  rs7904519: 0.45, rs11199914: 0.42, rs7072776: 0.29, rs11813268: 0.15,
  rs554219: 0.12, rs75023414: 0.05, rs78540526: 0.03, rs3903072: 0.47,
  rs11820646: 0.41, rs12505080: 0.28,
};

// Compute population mean and SD from allele frequencies + weights
function computePopulationParams(): { mean: number; sd: number } {
  let mean = 0;
  let variance = 0;

  for (const [rsId, snpRef] of PRS_SNPS) {
    const freq = EUR_ALLELE_FREQS[rsId];
    if (freq == null) continue;
    mean += 2 * freq * snpRef.weight;
    variance += 2 * freq * (1 - freq) * snpRef.weight * snpRef.weight;
  }

  return { mean, sd: Math.sqrt(variance) };
}

const EUR_PARAMS = computePopulationParams();

// Ancestry-specific calibration offsets relative to European parameters
// Based on published multi-ancestry PRS performance data
const ANCESTRY_CALIBRATION: Record<string, { meanOffset: number; sdMultiplier: number }> = {
  european: { meanOffset: 0, sdMultiplier: 1.0 },
  white: { meanOffset: 0, sdMultiplier: 1.0 },
  african: { meanOffset: 0.15, sdMultiplier: 1.05 },
  black: { meanOffset: 0.15, sdMultiplier: 1.05 },
  hispanic: { meanOffset: 0.05, sdMultiplier: 1.02 },
  asian: { meanOffset: -0.10, sdMultiplier: 1.03 },
  other: { meanOffset: 0, sdMultiplier: 1.0 },
};

// Published OR per SD from Mavaddat 2019 validation
const OR_PER_SD = 1.61;

// ============================================================================
// Normal CDF Approximation (Abramowitz & Stegun)
// ============================================================================

function normalCdf(z: number): number {
  if (z < -8) return 0;
  if (z > 8) return 1;

  const absZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989422804014327; // 1 / sqrt(2*pi)
  const p = d * Math.exp(-0.5 * z * z);
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const cdf = 1 - p * poly;

  return z >= 0 ? cdf : 1 - cdf;
}

// ============================================================================
// PRS Calculation
// ============================================================================

/**
 * Calculate a polygenic risk score from extracted SNP dosages.
 *
 * @param prsSnpDosages - Map of rsID → effect allele dosage (0, 1, or 2)
 * @param ethnicity - Self-reported ethnicity for ancestry calibration
 * @returns PRS calculation result with percentile, confidence, and risk multiplier
 */
export function calculatePrs(
  prsSnpDosages: Record<string, number>,
  ethnicity?: string,
): PrsCalculationResult {
  const snpsTotal = PRS_SNPS.size;
  let rawScore = 0;
  let snpsUsed = 0;

  // Sum weighted dosages for all available SNPs
  for (const [rsId, snpRef] of PRS_SNPS) {
    const dosage = prsSnpDosages[rsId];
    if (dosage != null) {
      rawScore += dosage * snpRef.weight;
      snpsUsed++;
    }
  }

  const coverage = snpsTotal > 0 ? snpsUsed / snpsTotal : 0;

  // Determine ancestry calibration
  const ethnicityKey = (ethnicity ?? 'european').toLowerCase();
  const calibration = ANCESTRY_CALIBRATION[ethnicityKey] ?? ANCESTRY_CALIBRATION.european;
  const ancestryCalibration = ethnicityKey in ANCESTRY_CALIBRATION ? ethnicityKey : 'european';

  // Standardize: z = (rawScore - adjustedMean) / adjustedSD
  const adjustedMean = EUR_PARAMS.mean + calibration.meanOffset;
  const adjustedSD = EUR_PARAMS.sd * calibration.sdMultiplier;

  // Scale raw score for missing SNPs: assume population-average dosage for missing
  // This avoids penalizing users with lower coverage
  let missingContribution = 0;
  for (const [rsId, snpRef] of PRS_SNPS) {
    if (prsSnpDosages[rsId] == null) {
      const freq = EUR_ALLELE_FREQS[rsId] ?? 0.3;
      missingContribution += 2 * freq * snpRef.weight;
    }
  }
  const adjustedRawScore = rawScore + missingContribution;

  const standardizedScore = adjustedSD > 0
    ? (adjustedRawScore - adjustedMean) / adjustedSD
    : 0;

  // Percentile via normal CDF
  const percentile = Math.round(normalCdf(standardizedScore) * 100 * 10) / 10;

  // Risk multiplier: exp(z * ln(OR_per_SD))
  const riskMultiplier = Math.round(Math.exp(standardizedScore * Math.log(OR_PER_SD)) * 100) / 100;

  // Confidence based on SNP coverage
  let confidence: 'high' | 'moderate' | 'low';
  if (coverage >= 0.80) {
    confidence = 'high';
  } else if (coverage >= 0.60) {
    confidence = 'moderate';
  } else {
    confidence = 'low';
  }

  return {
    rawScore: Math.round(rawScore * 10000) / 10000,
    standardizedScore: Math.round(standardizedScore * 100) / 100,
    percentile,
    oddsRatioPerSD: OR_PER_SD,
    snpsUsed,
    snpsTotal,
    coverage: Math.round(coverage * 1000) / 1000,
    confidence,
    ancestryCalibration,
    riskMultiplier,
  };
}
