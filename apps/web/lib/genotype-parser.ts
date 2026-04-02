/**
 * Genotype File Parser — 23andMe, AncestryDNA, VCF
 *
 * Pure parsing logic with no database access. Extracts pathogenic/VUS
 * variants and PRS-relevant SNP dosages from raw genotype files.
 */

// ============================================================================
// Types
// ============================================================================

export interface ParsedGenotype {
  format: GenotypeFormat;
  totalSnpCount: number;
  pathogenicVariants: PathogenicVariant[];
  vusVariants: VusVariant[];
  genesTested: string[];
  prsSnpDosages: Record<string, number>; // rsID → effect allele dosage (0, 1, 2)
  prsSnpCount: number;
}

export type GenotypeFormat = '23andme' | 'ancestry' | 'vcf' | 'unknown';

export interface PathogenicVariant {
  gene: string;
  rsId: string;
  variant: string;
  significance: string;
  riskLevel: 'high' | 'moderate';
  genotype: string;
}

export interface VusVariant {
  gene: string;
  rsId: string;
  variant: string;
  significance: string;
  genotype: string;
}

interface VariantRef {
  gene: string;
  variant: string;
  significance: string;
  riskLevel: 'high' | 'moderate';
  riskAllele: string;
}

interface VusRef {
  gene: string;
  variant: string;
  significance: string;
  riskAllele: string;
}

interface PrsSnpRef {
  effectAllele: string;
  weight: number; // log-OR
}

// ============================================================================
// Known Pathogenic Variants (ClinVar-derived)
// ============================================================================

const KNOWN_PATHOGENIC_VARIANTS = new Map<string, VariantRef>([
  // BRCA1 — high-penetrance (55-72% lifetime risk)
  ['rs80357914', { gene: 'BRCA1', variant: '5382insC', significance: 'Ashkenazi Jewish founder mutation. 55-72% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'A' }],
  ['rs80357906', { gene: 'BRCA1', variant: '185delAG', significance: 'Ashkenazi Jewish founder mutation. 55-72% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'T' }],
  ['rs28897672', { gene: 'BRCA1', variant: 'C61G', significance: 'Pathogenic missense variant in RING domain. 55-72% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'G' }],
  ['rs28897696', { gene: 'BRCA1', variant: 'R1699W', significance: 'Pathogenic missense variant. Associated with high breast and ovarian cancer risk.', riskLevel: 'high', riskAllele: 'T' }],
  ['rs80357711', { gene: 'BRCA1', variant: 'E1250X', significance: 'Nonsense mutation causing truncated protein. 55-72% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'T' }],
  ['rs80357508', { gene: 'BRCA1', variant: 'Q1756fs', significance: 'Frameshift mutation. 55-72% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'A' }],
  ['rs80357065', { gene: 'BRCA1', variant: '4154delA', significance: 'Frameshift mutation in BRCT domain. 55-72% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'T' }],
  ['rs80356860', { gene: 'BRCA1', variant: 'A1708E', significance: 'Pathogenic missense in BRCT domain. High breast cancer risk.', riskLevel: 'high', riskAllele: 'A' }],
  ['rs80357382', { gene: 'BRCA1', variant: 'R1443X', significance: 'Nonsense mutation. 55-72% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'A' }],
  ['rs80357018', { gene: 'BRCA1', variant: '3819del5', significance: 'Frameshift deletion. 55-72% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'T' }],
  ['rs80357477', { gene: 'BRCA1', variant: 'L1786P', significance: 'Pathogenic missense in BRCT domain. High breast cancer risk.', riskLevel: 'high', riskAllele: 'C' }],
  ['rs80356898', { gene: 'BRCA1', variant: 'M1775R', significance: 'Pathogenic missense in BRCT domain. High breast cancer risk.', riskLevel: 'high', riskAllele: 'G' }],

  // BRCA2 — high-penetrance (45-69% lifetime risk)
  ['rs80359550', { gene: 'BRCA2', variant: '6174delT', significance: 'Ashkenazi Jewish founder mutation. 45-69% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'A' }],
  ['rs11571833', { gene: 'BRCA2', variant: 'K3326X', significance: 'Stop-gain variant. Moderate increase in breast cancer risk.', riskLevel: 'high', riskAllele: 'A' }],
  ['rs276174790', { gene: 'BRCA2', variant: '3036del4', significance: 'Frameshift deletion. 45-69% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'T' }],
  ['rs80359065', { gene: 'BRCA2', variant: 'R2336H', significance: 'Pathogenic missense variant. 45-69% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'A' }],
  ['rs80359076', { gene: 'BRCA2', variant: 'W2619C', significance: 'Pathogenic missense variant in DNA binding domain.', riskLevel: 'high', riskAllele: 'T' }],
  ['rs80359088', { gene: 'BRCA2', variant: 'E2856X', significance: 'Nonsense mutation. 45-69% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'T' }],
  ['rs80358981', { gene: 'BRCA2', variant: 'Y42C', significance: 'Pathogenic missense. 45-69% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'G' }],
  ['rs80359175', { gene: 'BRCA2', variant: '9254del5', significance: 'Frameshift deletion. 45-69% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'T' }],
  ['rs80359035', { gene: 'BRCA2', variant: 'R2108H', significance: 'Pathogenic missense variant. Associated with breast and ovarian cancer.', riskLevel: 'high', riskAllele: 'A' }],
  ['rs80359006', { gene: 'BRCA2', variant: 'S1882X', significance: 'Nonsense mutation. 45-69% lifetime breast cancer risk.', riskLevel: 'high', riskAllele: 'A' }],

  // PALB2 — moderate-to-high penetrance (33-58% lifetime risk)
  ['rs180177102', { gene: 'PALB2', variant: '509_510delGA', significance: 'Frameshift mutation. 33-58% lifetime breast cancer risk.', riskLevel: 'moderate', riskAllele: 'T' }],
  ['rs515726205', { gene: 'PALB2', variant: 'Y551X', significance: 'Nonsense mutation. 33-58% lifetime breast cancer risk.', riskLevel: 'moderate', riskAllele: 'A' }],
  ['rs180177100', { gene: 'PALB2', variant: 'L939W', significance: 'Pathogenic missense. 33-58% lifetime breast cancer risk.', riskLevel: 'moderate', riskAllele: 'G' }],
  ['rs45532440', { gene: 'PALB2', variant: 'c.3113G>A', significance: 'Pathogenic variant. Increased breast cancer risk.', riskLevel: 'moderate', riskAllele: 'A' }],
  ['rs118203998', { gene: 'PALB2', variant: 'c.172_175delTTGT', significance: 'Finnish founder mutation. 33-58% lifetime risk.', riskLevel: 'moderate', riskAllele: 'T' }],

  // CHEK2 — moderate penetrance (15-30% lifetime risk)
  ['rs555607708', { gene: 'CHEK2', variant: '1100delC', significance: 'Most common CHEK2 founder mutation. 15-30% lifetime breast cancer risk.', riskLevel: 'moderate', riskAllele: 'A' }],
  ['rs17879961', { gene: 'CHEK2', variant: 'I157T', significance: 'Low-penetrance missense. Modest increase in breast cancer risk (OR ~1.4).', riskLevel: 'moderate', riskAllele: 'G' }],
  ['rs28909982', { gene: 'CHEK2', variant: 'S428F', significance: 'Pathogenic missense. Moderate breast cancer risk.', riskLevel: 'moderate', riskAllele: 'T' }],
  ['rs121908698', { gene: 'CHEK2', variant: 'T367fs', significance: 'Frameshift mutation. 15-30% lifetime breast cancer risk.', riskLevel: 'moderate', riskAllele: 'A' }],
  ['rs137853007', { gene: 'CHEK2', variant: 'R180C', significance: 'Pathogenic missense variant. Moderate breast cancer risk.', riskLevel: 'moderate', riskAllele: 'T' }],

  // ATM — moderate penetrance (15-40% lifetime risk)
  ['rs28904921', { gene: 'ATM', variant: 'V2424G', significance: 'Pathogenic missense. 15-40% lifetime breast cancer risk.', riskLevel: 'moderate', riskAllele: 'G' }],
  ['rs587779317', { gene: 'ATM', variant: 'c.7271T>G', significance: 'Pathogenic variant associated with increased breast cancer risk.', riskLevel: 'moderate', riskAllele: 'G' }],
  ['rs28904919', { gene: 'ATM', variant: 'S49C', significance: 'Pathogenic missense. Moderate breast cancer risk.', riskLevel: 'moderate', riskAllele: 'G' }],
  ['rs730881344', { gene: 'ATM', variant: 'c.1564_1565delGA', significance: 'Frameshift mutation. 15-40% lifetime breast cancer risk.', riskLevel: 'moderate', riskAllele: 'T' }],

  // RAD51C — moderate penetrance
  ['rs587782749', { gene: 'RAD51C', variant: 'c.774delT', significance: 'Frameshift mutation. Associated with increased breast and ovarian cancer risk.', riskLevel: 'moderate', riskAllele: 'T' }],
  ['rs587782644', { gene: 'RAD51C', variant: 'L138X', significance: 'Nonsense mutation. Moderate breast cancer risk.', riskLevel: 'moderate', riskAllele: 'A' }],

  // RAD51D — moderate penetrance
  ['rs587782786', { gene: 'RAD51D', variant: 'c.694C>T', significance: 'Pathogenic variant. Associated with breast and ovarian cancer risk.', riskLevel: 'moderate', riskAllele: 'T' }],
  ['rs587782767', { gene: 'RAD51D', variant: 'c.270_271delTC', significance: 'Frameshift mutation. Moderate breast cancer risk.', riskLevel: 'moderate', riskAllele: 'T' }],

  // TP53 — Li-Fraumeni syndrome
  ['rs28934578', { gene: 'TP53', variant: 'R175H', significance: 'Most common TP53 hotspot mutation. Li-Fraumeni syndrome — very high lifetime cancer risk.', riskLevel: 'high', riskAllele: 'A' }],
  ['rs28934576', { gene: 'TP53', variant: 'R248W', significance: 'TP53 hotspot mutation. Li-Fraumeni syndrome.', riskLevel: 'high', riskAllele: 'T' }],
  ['rs121912651', { gene: 'TP53', variant: 'R273H', significance: 'TP53 hotspot mutation. Li-Fraumeni syndrome.', riskLevel: 'high', riskAllele: 'A' }],
]);

// ============================================================================
// Known VUS Variants
// ============================================================================

const KNOWN_VUS_VARIANTS = new Map<string, VusRef>([
  // BRCA1 VUS
  ['rs80357153', { gene: 'BRCA1', variant: 'R1699Q', significance: 'Variant of uncertain significance in BRCT domain. Not definitively classified.', riskAllele: 'A' }],
  ['rs80357328', { gene: 'BRCA1', variant: 'S1613G', significance: 'Variant of uncertain significance. May be reclassified as more data accumulates.', riskAllele: 'G' }],
  ['rs80357459', { gene: 'BRCA1', variant: 'M1652I', significance: 'Variant of uncertain significance in the BRCT domain.', riskAllele: 'A' }],

  // BRCA2 VUS
  ['rs80358580', { gene: 'BRCA2', variant: 'Y3035C', significance: 'Variant of uncertain significance in DNA-binding domain.', riskAllele: 'G' }],
  ['rs80359168', { gene: 'BRCA2', variant: 'D2723H', significance: 'Variant of uncertain significance. Conflicting interpretations.', riskAllele: 'C' }],
  ['rs80358414', { gene: 'BRCA2', variant: 'T2722R', significance: 'Variant of uncertain significance. Limited evidence.', riskAllele: 'G' }],

  // PALB2 VUS
  ['rs152451', { gene: 'PALB2', variant: 'Q559R', significance: 'Variant of uncertain significance in PALB2.', riskAllele: 'G' }],
  ['rs45478192', { gene: 'PALB2', variant: 'L939W', significance: 'Variant of uncertain significance. Being studied for reclassification.', riskAllele: 'T' }],

  // CHEK2 VUS
  ['rs200928781', { gene: 'CHEK2', variant: 'E239K', significance: 'Variant of uncertain significance. Limited population data.', riskAllele: 'A' }],
  ['rs77130927', { gene: 'CHEK2', variant: 'R117G', significance: 'Variant of uncertain significance.', riskAllele: 'G' }],

  // ATM VUS
  ['rs1800054', { gene: 'ATM', variant: 'P1054R', significance: 'Variant of uncertain significance. Conflicting interpretations of pathogenicity.', riskAllele: 'G' }],
  ['rs3218695', { gene: 'ATM', variant: 'D1853N', significance: 'Variant of uncertain significance. May modify breast cancer risk.', riskAllele: 'A' }],
]);

// ============================================================================
// Gene Region Map — rsIDs to gene names for "genes tested" tracking
// ============================================================================

const GENE_REGION_RSIDS = new Map<string, string>([
  // BRCA1 region (chr17:43,044,295-43,125,364) — common tagging SNPs
  ['rs8176318', 'BRCA1'], ['rs1799966', 'BRCA1'], ['rs16942', 'BRCA1'],
  ['rs799917', 'BRCA1'], ['rs1060915', 'BRCA1'], ['rs3737559', 'BRCA1'],
  ['rs2070833', 'BRCA1'], ['rs8176305', 'BRCA1'], ['rs12516', 'BRCA1'],
  ['rs3092994', 'BRCA1'],
  // BRCA2 region (chr13:32,315,086-32,400,266)
  ['rs144848', 'BRCA2'], ['rs766173', 'BRCA2'], ['rs1801426', 'BRCA2'],
  ['rs206075', 'BRCA2'], ['rs206076', 'BRCA2'], ['rs1801406', 'BRCA2'],
  ['rs543304', 'BRCA2'], ['rs169547', 'BRCA2'], ['rs1799944', 'BRCA2'],
  ['rs1799943', 'BRCA2'],
  // PALB2 region (chr16:23,603,160-23,641,310)
  ['rs249954', 'PALB2'], ['rs152451', 'PALB2'], ['rs420259', 'PALB2'],
  ['rs447639', 'PALB2'],
  // CHEK2 region (chr22:28,687,743-28,742,422)
  ['rs17879961', 'CHEK2'], ['rs555607708', 'CHEK2'], ['rs2236142', 'CHEK2'],
  ['rs738722', 'CHEK2'],
  // ATM region (chr11:108,222,484-108,369,102)
  ['rs1801516', 'ATM'], ['rs664677', 'ATM'], ['rs611646', 'ATM'],
  ['rs227060', 'ATM'], ['rs189037', 'ATM'],
  // RAD51C (chr17:56,769,934-56,811,703)
  ['rs28363317', 'RAD51C'], ['rs12946397', 'RAD51C'],
  // RAD51D (chr17:33,427,955-33,447,059)
  ['rs4252596', 'RAD51D'], ['rs10483813', 'RAD51D'],
  // TP53 (chr17:7,661,779-7,687,550)
  ['rs1042522', 'TP53'], ['rs1625895', 'TP53'], ['rs12947788', 'TP53'],
]);

// Also add all pathogenic + VUS rsIDs to gene region map
for (const [rsId, ref] of KNOWN_PATHOGENIC_VARIANTS) {
  GENE_REGION_RSIDS.set(rsId, ref.gene);
}
for (const [rsId, ref] of KNOWN_VUS_VARIANTS) {
  GENE_REGION_RSIDS.set(rsId, ref.gene);
}

// ============================================================================
// PRS SNPs — Mavaddat et al. 2019 (313-SNP breast cancer PRS)
// Representative subset of the 313-SNP model with published effect alleles
// and log-OR weights. Full model has 313 SNPs; we include the highest-weight
// SNPs here. Effect alleles are on the forward strand.
// ============================================================================

const PRS_SNPS = new Map<string, PrsSnpRef>([
  // Top-weight SNPs from Mavaddat et al. 2019 (Nature Genetics)
  // Format: [rsID, { effectAllele, weight (log-OR) }]
  ['rs2981582', { effectAllele: 'G', weight: 0.263 }],   // FGFR2
  ['rs3803662', { effectAllele: 'A', weight: 0.201 }],   // TOX3/TNRC9
  ['rs889312', { effectAllele: 'C', weight: 0.131 }],    // MAP3K1
  ['rs13281615', { effectAllele: 'G', weight: 0.087 }],  // 8q24
  ['rs3817198', { effectAllele: 'C', weight: 0.075 }],   // LSP1
  ['rs13387042', { effectAllele: 'A', weight: 0.120 }],  // 2q35
  ['rs4973768', { effectAllele: 'T', weight: 0.112 }],   // SLC4A7/NEK10
  ['rs10941679', { effectAllele: 'G', weight: 0.125 }],  // 5p12
  ['rs6504950', { effectAllele: 'G', weight: -0.062 }],  // STXBP4 (protective)
  ['rs11249433', { effectAllele: 'G', weight: 0.098 }],  // 1p11.2
  ['rs999737', { effectAllele: 'C', weight: -0.082 }],   // RAD51L1 (protective)
  ['rs2046210', { effectAllele: 'A', weight: 0.090 }],   // ESR1
  ['rs2823093', { effectAllele: 'G', weight: -0.071 }],  // 21q21
  ['rs10995190', { effectAllele: 'G', weight: -0.156 }],  // ZNF365
  ['rs704010', { effectAllele: 'T', weight: 0.072 }],    // ZMIZ1
  ['rs614367', { effectAllele: 'T', weight: 0.159 }],    // 11q13
  ['rs1292011', { effectAllele: 'A', weight: -0.095 }],  // 12q24
  ['rs10771399', { effectAllele: 'A', weight: -0.158 }],  // PTHLH
  ['rs865686', { effectAllele: 'T', weight: -0.088 }],   // 2q33
  ['rs17356907', { effectAllele: 'A', weight: -0.072 }],  // NTN4
  ['rs1011970', { effectAllele: 'T', weight: 0.074 }],   // CDKN2A/B
  ['rs2380205', { effectAllele: 'C', weight: -0.046 }],  // 10p15
  ['rs16857609', { effectAllele: 'T', weight: 0.088 }],  // 2q33
  ['rs2588809', { effectAllele: 'T', weight: 0.068 }],   // 14q24
  ['rs941764', { effectAllele: 'G', weight: 0.080 }],    // 14q32
  ['rs17817449', { effectAllele: 'T', weight: 0.066 }],  // FTO
  ['rs6472903', { effectAllele: 'T', weight: -0.060 }],  // 8q21
  ['rs2943559', { effectAllele: 'G', weight: 0.117 }],   // 8q21
  ['rs6762644', { effectAllele: 'A', weight: 0.057 }],   // 3p26
  ['rs12493607', { effectAllele: 'G', weight: 0.064 }],  // TGFBR2
  ['rs11814448', { effectAllele: 'A', weight: 0.168 }],  // 10q26
  ['rs4849887', { effectAllele: 'T', weight: -0.094 }],  // 2q14
  ['rs2236007', { effectAllele: 'G', weight: -0.065 }],  // PAX9
  ['rs17529111', { effectAllele: 'A', weight: 0.056 }],  // 6q14
  ['rs12422552', { effectAllele: 'G', weight: 0.053 }],  // 12p13
  ['rs6828523', { effectAllele: 'C', weight: -0.062 }],  // 4p14
  ['rs11242675', { effectAllele: 'T', weight: 0.058 }],  // FOXQ1
  ['rs1550623', { effectAllele: 'A', weight: -0.054 }],  // 2q31
  ['rs4808801', { effectAllele: 'A', weight: 0.070 }],   // EBF1
  ['rs720475', { effectAllele: 'G', weight: -0.056 }],   // 7q35
  ['rs9693444', { effectAllele: 'C', weight: 0.060 }],   // 8p12
  ['rs6001930', { effectAllele: 'T', weight: 0.099 }],   // 22q13
  ['rs11571833', { effectAllele: 'T', weight: 0.257 }],  // BRCA2 (also in pathogenic table)
  ['rs1436904', { effectAllele: 'T', weight: 0.052 }],   // 18q11
  ['rs4245739', { effectAllele: 'C', weight: 0.070 }],   // MDM4
  ['rs132390', { effectAllele: 'C', weight: 0.051 }],    // 22q12
  ['rs11571836', { effectAllele: 'T', weight: -0.046 }],  // BRCA2
  ['rs75915166', { effectAllele: 'A', weight: 0.172 }],  // CASP8
  ['rs616488', { effectAllele: 'A', weight: -0.060 }],   // PEX14
  ['rs6678914', { effectAllele: 'G', weight: -0.046 }],  // 1q32
  ['rs12710696', { effectAllele: 'T', weight: 0.051 }],  // 2p24
  ['rs11552449', { effectAllele: 'T', weight: 0.058 }],  // DCLRE1B
  ['rs4849882', { effectAllele: 'C', weight: -0.052 }],  // 2q14
  ['rs1353747', { effectAllele: 'T', weight: -0.060 }],  // 5q11
  ['rs6796502', { effectAllele: 'T', weight: -0.070 }],  // 3p21
  ['rs2012709', { effectAllele: 'G', weight: 0.046 }],   // 5q33
  ['rs10069690', { effectAllele: 'T', weight: 0.053 }],  // TERT
  ['rs7726159', { effectAllele: 'C', weight: 0.056 }],   // TERT
  ['rs2363956', { effectAllele: 'T', weight: 0.043 }],   // 19p13
  ['rs6757320', { effectAllele: 'A', weight: 0.050 }],   // 2q34
  ['rs12710707', { effectAllele: 'T', weight: 0.047 }],  // 2p24
  ['rs2016394', { effectAllele: 'G', weight: -0.046 }],  // 2q34
  ['rs17350191', { effectAllele: 'C', weight: -0.055 }],  // CCDC88C
  ['rs34005590', { effectAllele: 'T', weight: -0.052 }],  // 6q25
  ['rs6569648', { effectAllele: 'G', weight: -0.043 }],  // 6q25
  ['rs3757318', { effectAllele: 'G', weight: 0.095 }],   // ESR1
  ['rs851984', { effectAllele: 'G', weight: 0.048 }],    // 6q25
  ['rs4548337', { effectAllele: 'T', weight: -0.050 }],  // 8q22
  ['rs4236605', { effectAllele: 'T', weight: 0.044 }],   // 8q22
  ['rs2943560', { effectAllele: 'A', weight: 0.071 }],   // 8q21
  ['rs10816625', { effectAllele: 'G', weight: 0.101 }],  // 9q31
  ['rs13294895', { effectAllele: 'T', weight: 0.065 }],  // 9q31
  ['rs7904519', { effectAllele: 'G', weight: 0.045 }],   // 10q22
  ['rs11199914', { effectAllele: 'C', weight: -0.042 }],  // 10q25
  ['rs7072776', { effectAllele: 'A', weight: 0.059 }],   // 10p12
  ['rs11813268', { effectAllele: 'T', weight: -0.056 }],  // 10q21
  ['rs554219', { effectAllele: 'C', weight: 0.166 }],    // 11q13
  ['rs75023414', { effectAllele: 'T', weight: 0.130 }],  // 11q13
  ['rs78540526', { effectAllele: 'T', weight: 0.254 }],  // 11q13
  ['rs3903072', { effectAllele: 'G', weight: -0.048 }],  // 11q13
  ['rs11820646', { effectAllele: 'T', weight: -0.046 }],  // 11q24
  ['rs12505080', { effectAllele: 'T', weight: 0.046 }],  // 4q24
  ['rs17356907', { effectAllele: 'A', weight: -0.072 }],  // NTN4
]);

// ============================================================================
// Format Detection
// ============================================================================

export function detectFormat(text: string): GenotypeFormat {
  const firstLines = text.slice(0, 2000).split(/\r?\n/).filter(l => l.length > 0);

  for (const line of firstLines) {
    if (line.startsWith('##fileformat=VCF')) return 'vcf';
    if (line.startsWith('#CHROM') && line.includes('POS') && line.includes('REF') && line.includes('ALT')) return 'vcf';
    if (/^#\s*rsid\s+chromosome\s+position\s+genotype/i.test(line)) return '23andme';
    if (/^rsid\s+chromosome\s+position\s+allele1\s+allele2/i.test(line)) return 'ancestry';
  }

  // Heuristic: check data line patterns
  for (const line of firstLines) {
    if (line.startsWith('#') || line.startsWith('AncestryDNA')) continue;
    const parts = line.split('\t');
    if (parts.length === 4 && parts[0].startsWith('rs') && parts[3].length <= 2) return '23andme';
    if (parts.length === 5 && parts[0].startsWith('rs') && parts[3].length === 1 && parts[4].length === 1) return 'ancestry';
    break;
  }

  return 'unknown';
}

// ============================================================================
// Core Parsing
// ============================================================================

function createEmptyResult(format: GenotypeFormat): ParsedGenotype {
  return {
    format,
    totalSnpCount: 0,
    pathogenicVariants: [],
    vusVariants: [],
    genesTested: [],
    prsSnpDosages: {},
    prsSnpCount: 0,
  };
}

function normalizeText(text: string): string {
  // Strip UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  return text;
}

function countEffectAlleleDosage(genotype: string, effectAllele: string): number {
  // genotype is 2 chars like "AG", "AA", "GG" or allele pair
  let count = 0;
  for (const ch of genotype.toUpperCase()) {
    if (ch === effectAllele.toUpperCase()) count++;
  }
  return Math.min(count, 2);
}

function processSnp(
  rsId: string,
  genotype: string,
  result: ParsedGenotype,
  genesFound: Set<string>
): void {
  if (!genotype || genotype === '--' || genotype === '00' || genotype === '..') return;

  result.totalSnpCount++;

  // Check pathogenic variants
  const pathogenic = KNOWN_PATHOGENIC_VARIANTS.get(rsId);
  if (pathogenic) {
    const hasRiskAllele = genotype.toUpperCase().includes(pathogenic.riskAllele.toUpperCase());
    if (hasRiskAllele) {
      result.pathogenicVariants.push({
        gene: pathogenic.gene,
        rsId,
        variant: pathogenic.variant,
        significance: pathogenic.significance,
        riskLevel: pathogenic.riskLevel,
        genotype,
      });
    }
    genesFound.add(pathogenic.gene);
  }

  // Check VUS variants
  const vus = KNOWN_VUS_VARIANTS.get(rsId);
  if (vus) {
    const hasRiskAllele = genotype.toUpperCase().includes(vus.riskAllele.toUpperCase());
    if (hasRiskAllele) {
      result.vusVariants.push({
        gene: vus.gene,
        rsId,
        variant: vus.variant,
        significance: vus.significance,
        genotype,
      });
    }
    genesFound.add(vus.gene);
  }

  // Check gene region SNPs (for "genes tested" tracking)
  const geneRegion = GENE_REGION_RSIDS.get(rsId);
  if (geneRegion) {
    genesFound.add(geneRegion);
  }

  // Check PRS SNPs
  const prsSnp = PRS_SNPS.get(rsId);
  if (prsSnp) {
    const dosage = countEffectAlleleDosage(genotype, prsSnp.effectAllele);
    result.prsSnpDosages[rsId] = dosage;
  }
}

// ============================================================================
// Format-Specific Parsers
// ============================================================================

export function parse23andMe(text: string): ParsedGenotype {
  text = normalizeText(text);
  const result = createEmptyResult('23andme');
  const genesFound = new Set<string>();
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const parts = line.split('\t');
    if (parts.length < 4) continue;

    const rsId = parts[0].trim();
    const genotype = parts[3].trim();

    if (!rsId.startsWith('rs')) continue;
    processSnp(rsId, genotype, result, genesFound);
  }

  result.genesTested = Array.from(genesFound).sort();
  result.prsSnpCount = Object.keys(result.prsSnpDosages).length;
  return result;
}

export function parseAncestry(text: string): ParsedGenotype {
  text = normalizeText(text);
  const result = createEmptyResult('ancestry');
  const genesFound = new Set<string>();
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.startsWith('#') || line.startsWith('rsid') || line.startsWith('AncestryDNA')) continue;
    const parts = line.split('\t');
    if (parts.length < 5) continue;

    const rsId = parts[0].trim();
    const allele1 = parts[3].trim();
    const allele2 = parts[4].trim();

    if (!rsId.startsWith('rs')) continue;
    if (allele1 === '0' || allele2 === '0') continue; // no-call

    const genotype = allele1 + allele2;
    processSnp(rsId, genotype, result, genesFound);
  }

  result.genesTested = Array.from(genesFound).sort();
  result.prsSnpCount = Object.keys(result.prsSnpDosages).length;
  return result;
}

export function parseVcf(text: string): ParsedGenotype {
  text = normalizeText(text);
  const result = createEmptyResult('vcf');
  const genesFound = new Set<string>();
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const parts = line.split('\t');
    if (parts.length < 8) continue;

    // VCF columns: CHROM, POS, ID, REF, ALT, QUAL, FILTER, INFO, [FORMAT, SAMPLE...]
    const id = parts[2].trim();
    const ref = parts[3].trim();
    const alt = parts[4].trim();

    if (!id.startsWith('rs')) continue;

    // Extract genotype from first sample (if FORMAT/SAMPLE columns exist)
    let genotype = '';
    if (parts.length >= 10 && parts[8].includes('GT')) {
      const formatFields = parts[8].split(':');
      const gtIndex = formatFields.indexOf('GT');
      if (gtIndex >= 0) {
        const sampleFields = parts[9].split(':');
        const gt = sampleFields[gtIndex] ?? '';
        // GT format: 0/0, 0/1, 1/1, 0|1, etc.
        const alleles = gt.split(/[/|]/);
        const alleleMap = [ref, ...alt.split(',')];
        genotype = alleles
          .map(a => alleleMap[parseInt(a, 10)] ?? '.')
          .join('');
      }
    }

    if (!genotype || genotype.includes('.')) {
      // If no sample genotype, check if ALT is present (assume het)
      if (alt && alt !== '.') {
        genotype = ref + alt.split(',')[0];
      } else {
        genotype = ref + ref;
      }
    }

    processSnp(id, genotype, result, genesFound);
  }

  result.genesTested = Array.from(genesFound).sort();
  result.prsSnpCount = Object.keys(result.prsSnpDosages).length;
  return result;
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Parse a raw genotype file (23andMe, AncestryDNA, or VCF) and extract
 * breast cancer-relevant variants and PRS SNP dosages.
 */
export function parseGenotypeFile(text: string): ParsedGenotype {
  const format = detectFormat(text);

  switch (format) {
    case '23andme':
      return parse23andMe(text);
    case 'ancestry':
      return parseAncestry(text);
    case 'vcf':
      return parseVcf(text);
    default:
      return { ...createEmptyResult('unknown'), format: 'unknown' };
  }
}
