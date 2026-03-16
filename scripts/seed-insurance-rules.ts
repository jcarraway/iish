import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '@oncovax/db/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface RuleSeed {
  insurer: string;
  testType: string;
  cancerType: string | null;
  stage: string | null;
  coverageStatus: string;
  conditions: string[];
  cptCodes: string[];
  sourceUrl: string | null;
}

const rules: RuleSeed[] = [
  // === Medicare NCD 90.2 ===
  {
    insurer: 'Medicare',
    testType: 'comprehensive_genomic_profiling',
    cancerType: null,
    stage: 'III',
    coverageStatus: 'covered',
    conditions: [
      'Patient has recurrent, relapsed, refractory, metastatic, or advanced stage III/IV cancer',
      'FDA-approved or FDA-cleared CGP test',
      'Ordered by treating physician',
      'Results used to guide treatment decisions',
    ],
    cptCodes: ['81455'],
    sourceUrl: 'https://www.cms.gov/medicare-coverage-database/view/ncd.aspx?ncdid=372',
  },
  {
    insurer: 'Medicare',
    testType: 'comprehensive_genomic_profiling',
    cancerType: null,
    stage: 'IV',
    coverageStatus: 'covered',
    conditions: [
      'Patient has recurrent, relapsed, refractory, metastatic, or advanced stage III/IV cancer',
      'FDA-approved or FDA-cleared CGP test',
      'Ordered by treating physician',
      'Results used to guide treatment decisions',
    ],
    cptCodes: ['81455'],
    sourceUrl: 'https://www.cms.gov/medicare-coverage-database/view/ncd.aspx?ncdid=372',
  },
  {
    insurer: 'Medicare',
    testType: 'comprehensive_genomic_profiling',
    cancerType: null,
    stage: null,
    coverageStatus: 'prior_auth_required',
    conditions: [
      'Early-stage cancer may require MAC LCD review',
      'Must demonstrate clinical utility for treatment decisions',
      'FDA-approved or FDA-cleared test preferred',
    ],
    cptCodes: ['81455'],
    sourceUrl: 'https://www.cms.gov/medicare-coverage-database/view/ncd.aspx?ncdid=372',
  },
  {
    insurer: 'Medicare',
    testType: 'liquid_biopsy',
    cancerType: null,
    stage: null,
    coverageStatus: 'covered',
    conditions: [
      'Patient has advanced or metastatic cancer',
      'Tissue biopsy is not feasible or insufficient',
      'FDA-approved liquid biopsy test (e.g., Guardant360 CDx, FoundationOne Liquid CDx)',
    ],
    cptCodes: ['81479'],
    sourceUrl: 'https://www.cms.gov/medicare-coverage-database/view/ncd.aspx?ncdid=372',
  },
  // === UnitedHealthcare ===
  {
    insurer: 'UnitedHealthcare',
    testType: 'comprehensive_genomic_profiling',
    cancerType: null,
    stage: null,
    coverageStatus: 'prior_auth_required',
    conditions: [
      'Prior authorization required',
      'Patient has advanced or metastatic solid tumor',
      'Test results expected to guide FDA-approved therapy selection',
      'Single CGP test per cancer diagnosis unless disease progression',
    ],
    cptCodes: ['81455', '81456'],
    sourceUrl: null,
  },
  {
    insurer: 'UnitedHealthcare',
    testType: 'liquid_biopsy',
    cancerType: null,
    stage: null,
    coverageStatus: 'prior_auth_required',
    conditions: [
      'Prior authorization required',
      'Tissue biopsy insufficient or contraindicated',
      'FDA-approved liquid biopsy test',
      'Advanced or metastatic cancer',
    ],
    cptCodes: ['81479'],
    sourceUrl: null,
  },
  {
    insurer: 'UnitedHealthcare',
    testType: 'targeted_panel',
    cancerType: 'non-small cell lung cancer',
    stage: null,
    coverageStatus: 'covered',
    conditions: [
      'NSCLC with actionable mutation testing (EGFR, ALK, ROS1, BRAF, KRAS, MET, RET, NTRK)',
      'Guideline-recommended testing at diagnosis',
    ],
    cptCodes: ['81445'],
    sourceUrl: null,
  },
  // === Aetna ===
  {
    insurer: 'Aetna',
    testType: 'comprehensive_genomic_profiling',
    cancerType: null,
    stage: null,
    coverageStatus: 'prior_auth_required',
    conditions: [
      'Prior authorization required',
      'Advanced or metastatic solid tumor or hematologic malignancy',
      'CGP results will be used to identify FDA-approved targeted therapy',
      'Patient is a candidate for systemic therapy',
    ],
    cptCodes: ['81455', '81456'],
    sourceUrl: null,
  },
  {
    insurer: 'Aetna',
    testType: 'liquid_biopsy',
    cancerType: null,
    stage: null,
    coverageStatus: 'prior_auth_required',
    conditions: [
      'Prior authorization required',
      'Tissue biopsy not feasible',
      'FDA-approved ctDNA test',
    ],
    cptCodes: ['81479'],
    sourceUrl: null,
  },
  {
    insurer: 'Aetna',
    testType: 'targeted_panel',
    cancerType: null,
    stage: null,
    coverageStatus: 'likely_covered',
    conditions: [
      'Targeted panels for specific actionable mutations (e.g., EGFR, ALK) generally covered',
      'Must be medically necessary per NCCN guidelines',
    ],
    cptCodes: ['81445'],
    sourceUrl: null,
  },
  // === Cigna ===
  {
    insurer: 'Cigna',
    testType: 'comprehensive_genomic_profiling',
    cancerType: null,
    stage: null,
    coverageStatus: 'prior_auth_required',
    conditions: [
      'Prior authorization required via eviCore',
      'Advanced, recurrent, or metastatic cancer',
      'FDA-approved CGP test',
      'No prior CGP for current cancer diagnosis (one test per diagnosis)',
    ],
    cptCodes: ['81455', '81456'],
    sourceUrl: null,
  },
  {
    insurer: 'Cigna',
    testType: 'liquid_biopsy',
    cancerType: null,
    stage: null,
    coverageStatus: 'prior_auth_required',
    conditions: [
      'Prior authorization via eviCore',
      'Tissue biopsy contraindicated or insufficient',
      'FDA-approved test',
    ],
    cptCodes: ['81479'],
    sourceUrl: null,
  },
  // === BCBS ===
  {
    insurer: 'BCBS',
    testType: 'comprehensive_genomic_profiling',
    cancerType: null,
    stage: null,
    coverageStatus: 'prior_auth_required',
    conditions: [
      'Coverage varies by BCBS plan (local vs. federal)',
      'Generally requires prior authorization',
      'Advanced or metastatic solid tumors',
      'Results expected to direct FDA-approved therapy',
    ],
    cptCodes: ['81455', '81456'],
    sourceUrl: null,
  },
  {
    insurer: 'BCBS',
    testType: 'liquid_biopsy',
    cancerType: null,
    stage: null,
    coverageStatus: 'prior_auth_required',
    conditions: [
      'Coverage varies by plan',
      'Tissue not available or insufficient',
      'FDA-approved test required',
    ],
    cptCodes: ['81479'],
    sourceUrl: null,
  },
  {
    insurer: 'BCBS',
    testType: 'targeted_panel',
    cancerType: 'non-small cell lung cancer',
    stage: null,
    coverageStatus: 'covered',
    conditions: [
      'NSCLC biomarker testing per NCCN guidelines',
      'Includes EGFR, ALK, ROS1, BRAF, KRAS G12C, MET, RET, NTRK',
    ],
    cptCodes: ['81445'],
    sourceUrl: null,
  },
  // === Humana ===
  {
    insurer: 'Humana',
    testType: 'comprehensive_genomic_profiling',
    cancerType: null,
    stage: null,
    coverageStatus: 'prior_auth_required',
    conditions: [
      'Prior authorization required',
      'Advanced or metastatic cancer',
      'FDA-approved CGP test (FoundationOne CDx or equivalent)',
      'Patient is being considered for systemic therapy',
    ],
    cptCodes: ['81455'],
    sourceUrl: null,
  },
  {
    insurer: 'Humana',
    testType: 'liquid_biopsy',
    cancerType: null,
    stage: null,
    coverageStatus: 'prior_auth_required',
    conditions: [
      'Prior authorization required',
      'Tissue biopsy not obtainable',
      'FDA-approved liquid biopsy test',
    ],
    cptCodes: ['81479'],
    sourceUrl: null,
  },
  // === Medicaid ===
  {
    insurer: 'Medicaid',
    testType: 'comprehensive_genomic_profiling',
    cancerType: null,
    stage: null,
    coverageStatus: 'unknown',
    conditions: [
      'Coverage varies significantly by state',
      'Some states cover CGP for advanced cancer under fee-for-service',
      'Managed care plans may have different coverage criteria',
      'Prior authorization typically required',
      'Contact your state Medicaid program for specific coverage details',
    ],
    cptCodes: ['81455'],
    sourceUrl: null,
  },
  {
    insurer: 'Medicaid',
    testType: 'liquid_biopsy',
    cancerType: null,
    stage: null,
    coverageStatus: 'unknown',
    conditions: [
      'Coverage varies by state',
      'Limited coverage data available',
      'Contact state Medicaid office for specific policy',
    ],
    cptCodes: ['81479'],
    sourceUrl: null,
  },
  {
    insurer: 'Medicaid',
    testType: 'targeted_panel',
    cancerType: null,
    stage: null,
    coverageStatus: 'likely_covered',
    conditions: [
      'Single-gene or small panel tests more commonly covered',
      'Must be medically necessary',
      'Coverage varies by state',
    ],
    cptCodes: ['81445'],
    sourceUrl: null,
  },
];

async function seed() {
  console.log('Seeding insurance coverage rules...\n');

  for (const rule of rules) {
    const existing = await prisma.insuranceCoverageRule.findFirst({
      where: {
        insurer: rule.insurer,
        testType: rule.testType,
        cancerType: rule.cancerType ?? undefined,
        stage: rule.stage ?? undefined,
      },
    });

    if (existing) {
      console.log(`  [skip] ${rule.insurer} / ${rule.testType}${rule.cancerType ? ` / ${rule.cancerType}` : ''}${rule.stage ? ` / stage ${rule.stage}` : ''} (already exists)`);
      continue;
    }

    await prisma.insuranceCoverageRule.create({
      data: {
        insurer: rule.insurer,
        testType: rule.testType,
        cancerType: rule.cancerType,
        stage: rule.stage,
        coverageStatus: rule.coverageStatus,
        conditions: rule.conditions,
        cptCodes: rule.cptCodes,
        sourceUrl: rule.sourceUrl,
      },
    });

    console.log(`  [created] ${rule.insurer} / ${rule.testType}${rule.cancerType ? ` / ${rule.cancerType}` : ''}${rule.stage ? ` / stage ${rule.stage}` : ''}`);
  }

  console.log(`\nDone. ${rules.length} rules processed.`);
}

seed()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
