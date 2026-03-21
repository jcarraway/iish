import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '@iish/db/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface ProviderSeed {
  name: string;
  type: string;
  testTypes: string[];
  details: {
    testNames: string[];
    geneCount: number;
    sampleTypes: string[];
    turnaroundDays: { min: number; max: number };
    costRange: { min: number; max: number };
    fdaApproved: boolean;
    fdaClearance?: string;
    orderingProcess: string;
    reportFormat: string;
    contactPhone?: string;
    contactEmail?: string;
    contactUrl?: string;
    clinicalUtility: string;
    limitations?: string;
  };
}

const providers: ProviderSeed[] = [
  // === Tier 1: Commercial ===
  {
    name: 'Foundation Medicine',
    type: 'commercial',
    testTypes: ['comprehensive_genomic_profiling', 'liquid_biopsy'],
    details: {
      testNames: ['FoundationOne CDx', 'FoundationOne Liquid CDx'],
      geneCount: 324,
      sampleTypes: ['FFPE tissue', 'blood (liquid biopsy)'],
      turnaroundDays: { min: 10, max: 14 },
      costRange: { min: 3500, max: 5800 },
      fdaApproved: true,
      fdaClearance: 'FDA-approved companion diagnostic for multiple therapies',
      orderingProcess: 'Physician orders through FMI portal or fax. Kit shipped to facility for sample collection.',
      reportFormat: 'Interactive digital report with therapy associations and clinical trial matches',
      contactPhone: '1-888-988-3639',
      contactUrl: 'https://www.foundationmedicine.com',
      clinicalUtility: 'Identifies genomic alterations across 324 genes plus MSI, TMB, and LOH. FDA-approved CDx for pembrolizumab (TMB-H), multiple targeted therapies.',
      limitations: 'Requires minimum 20% tumor content. FFPE block preferred over slides.',
    },
  },
  {
    name: 'Tempus',
    type: 'commercial',
    testTypes: ['comprehensive_genomic_profiling', 'rna_sequencing', 'whole_exome_sequencing'],
    details: {
      testNames: ['Tempus xT', 'Tempus xR', 'Tempus xE'],
      geneCount: 648,
      sampleTypes: ['FFPE tissue', 'blood'],
      turnaroundDays: { min: 10, max: 14 },
      costRange: { min: 3000, max: 6000 },
      fdaApproved: false,
      orderingProcess: 'Physician orders through Tempus portal. Kit and shipping materials provided.',
      reportFormat: 'Interactive report with matched clinical trials and therapy options',
      contactPhone: '1-312-877-7016',
      contactUrl: 'https://www.tempus.com',
      clinicalUtility: 'DNA sequencing of 648 genes plus RNA sequencing for gene fusions. Integrates clinical and molecular data with AI-driven insights.',
      limitations: 'RNA sequencing requires fresh frozen or high-quality FFPE tissue.',
    },
  },
  {
    name: 'Guardant Health',
    type: 'commercial',
    testTypes: ['liquid_biopsy', 'comprehensive_genomic_profiling'],
    details: {
      testNames: ['Guardant360 CDx', 'Guardant360 TissueNext'],
      geneCount: 74,
      sampleTypes: ['blood (liquid biopsy)', 'FFPE tissue'],
      turnaroundDays: { min: 7, max: 10 },
      costRange: { min: 3500, max: 5500 },
      fdaApproved: true,
      fdaClearance: 'FDA-approved CDx for osimertinib, amivantamab, and other targeted therapies',
      orderingProcess: 'Physician orders through portal or fax. Blood draw kit shipped to any lab.',
      reportFormat: 'Digital report with variant allele frequencies and treatment options',
      contactPhone: '1-855-698-8887',
      contactUrl: 'https://www.guardanthealth.com',
      clinicalUtility: 'Liquid biopsy analyzing ctDNA across 74 genes. Ideal for patients where tissue biopsy is difficult or insufficient. Tracks treatment response over time.',
      limitations: 'Liquid biopsy may miss some alterations present in tissue. Low tumor shedding cancers may have lower sensitivity.',
    },
  },
  {
    name: 'Caris Life Sciences',
    type: 'commercial',
    testTypes: ['comprehensive_genomic_profiling', 'rna_sequencing'],
    details: {
      testNames: ['Caris Molecular Intelligence', 'MI Profile'],
      geneCount: 592,
      sampleTypes: ['FFPE tissue'],
      turnaroundDays: { min: 10, max: 16 },
      costRange: { min: 3200, max: 5500 },
      fdaApproved: false,
      orderingProcess: 'Physician orders through Caris portal. Specimen shipping kit provided.',
      reportFormat: 'Comprehensive report with drug associations and clinical trial matches',
      contactPhone: '1-888-979-8669',
      contactUrl: 'https://www.carislifesciences.com',
      clinicalUtility: 'Multi-platform molecular profiling including DNA, RNA, and protein analysis. Covers 592 genes with IHC, ISH, and NGS methods.',
      limitations: 'Requires FFPE tissue block. Turnaround may be longer for multi-platform analysis.',
    },
  },
  {
    name: 'NeoGenomics',
    type: 'commercial',
    testTypes: ['comprehensive_genomic_profiling', 'targeted_panel'],
    details: {
      testNames: ['NeoTYPE Discovery Profile', 'NeoTYPE Cancer Panel'],
      geneCount: 323,
      sampleTypes: ['FFPE tissue', 'bone marrow', 'blood'],
      turnaroundDays: { min: 7, max: 14 },
      costRange: { min: 2800, max: 5000 },
      fdaApproved: false,
      orderingProcess: 'Physician orders via portal, fax, or EMR integration. Specimen pickup available.',
      reportFormat: 'Clinical report with treatment recommendations and clinical trial suggestions',
      contactPhone: '1-866-776-5907',
      contactUrl: 'https://www.neogenomics.com',
      clinicalUtility: 'Comprehensive tumor profiling with 323-gene panel. Strong in hematologic malignancies and solid tumors.',
      limitations: 'Some specialized panels require specific specimen types.',
    },
  },
  // === Tier 2: Academic ===
  {
    name: 'MSK-IMPACT',
    type: 'academic',
    testTypes: ['comprehensive_genomic_profiling'],
    details: {
      testNames: ['MSK-IMPACT'],
      geneCount: 505,
      sampleTypes: ['FFPE tissue', 'blood (matched normal)'],
      turnaroundDays: { min: 14, max: 21 },
      costRange: { min: 0, max: 0 },
      fdaApproved: true,
      fdaClearance: 'FDA-authorized for tumor profiling across solid tumors',
      orderingProcess: 'Available to MSK patients. Ordered by treating oncologist at Memorial Sloan Kettering.',
      reportFormat: 'Integrated genomic report with MSK clinical annotations',
      contactPhone: '1-212-639-2000',
      contactUrl: 'https://www.mskcc.org',
      clinicalUtility: 'FDA-authorized 505-gene panel with matched tumor-normal sequencing. Deep institutional expertise in variant interpretation. Integrated with MSK clinical trial portfolio.',
      limitations: 'Generally available only to MSK patients. Requires matched blood sample.',
    },
  },
  {
    name: 'MD Anderson Oncology Panel',
    type: 'academic',
    testTypes: ['comprehensive_genomic_profiling', 'targeted_panel'],
    details: {
      testNames: ['MD Anderson T200.2 Panel', 'OncoKB Annotated Report'],
      geneCount: 200,
      sampleTypes: ['FFPE tissue', 'blood'],
      turnaroundDays: { min: 14, max: 21 },
      costRange: { min: 0, max: 3500 },
      fdaApproved: false,
      orderingProcess: 'Available to MD Anderson patients and select referring institutions.',
      reportFormat: 'Clinical genomics report with OncoKB annotations',
      contactUrl: 'https://www.mdanderson.org',
      clinicalUtility: 'Focused panel targeting the most clinically actionable genes in solid tumors. Backed by MD Anderson expertise in cancer genomics.',
      limitations: 'Primarily available to MD Anderson patients. Fewer genes than some commercial panels.',
    },
  },
  {
    name: 'UCSF500 Cancer Gene Panel',
    type: 'academic',
    testTypes: ['comprehensive_genomic_profiling'],
    details: {
      testNames: ['UCSF500 Cancer Gene Panel'],
      geneCount: 500,
      sampleTypes: ['FFPE tissue', 'fresh tissue', 'blood (matched normal)'],
      turnaroundDays: { min: 14, max: 28 },
      costRange: { min: 0, max: 4000 },
      fdaApproved: false,
      orderingProcess: 'Available to UCSF patients and referring physicians through UCSF Clinical Cancer Genomics Laboratory.',
      reportFormat: 'Detailed clinical report with variant classification and therapy implications',
      contactUrl: 'https://www.ucsf.edu',
      clinicalUtility: 'Comprehensive 500-gene panel with tumor-normal matching. Strong expertise in rare tumors and CNS malignancies.',
      limitations: 'Longer turnaround than commercial labs. Primarily serves UCSF patient population.',
    },
  },
  // === Tier 3: Emerging ===
  {
    name: 'Invitae',
    type: 'emerging',
    testTypes: ['targeted_panel', 'comprehensive_genomic_profiling'],
    details: {
      testNames: ['Invitae Comprehensive Tumor Profiling', 'Invitae Multi-Cancer Panel'],
      geneCount: 407,
      sampleTypes: ['FFPE tissue', 'blood'],
      turnaroundDays: { min: 10, max: 21 },
      costRange: { min: 1500, max: 3500 },
      fdaApproved: false,
      orderingProcess: 'Physician orders through Invitae portal. Kit and return shipping provided.',
      reportFormat: 'Digital report with variant classification and therapy associations',
      contactPhone: '1-800-436-3037',
      contactUrl: 'https://www.invitae.com',
      clinicalUtility: 'Broad tumor profiling at a lower price point. Strong in hereditary cancer risk assessment combined with somatic profiling.',
      limitations: 'Newer entrant in somatic tumor profiling. Smaller clinical evidence database than established players.',
    },
  },
  {
    name: 'Color Health',
    type: 'emerging',
    testTypes: ['targeted_panel', 'comprehensive_genomic_profiling'],
    details: {
      testNames: ['Color Extended Tumor Panel', 'Color Complete Genomics'],
      geneCount: 300,
      sampleTypes: ['FFPE tissue', 'saliva', 'blood'],
      turnaroundDays: { min: 14, max: 21 },
      costRange: { min: 1200, max: 3000 },
      fdaApproved: false,
      orderingProcess: 'Physician or employer-sponsored ordering. Kit shipped directly.',
      reportFormat: 'Patient-friendly digital report with clinical annotations',
      contactUrl: 'https://www.color.com',
      clinicalUtility: 'Accessible genomic profiling with patient-friendly reporting. Combines somatic and germline analysis. Lower cost option.',
      limitations: 'Smaller gene panel. Less established in oncology-specific profiling compared to dedicated cancer genomics labs.',
    },
  },
];

async function seed() {
  console.log('Seeding sequencing providers...\n');

  for (const provider of providers) {
    const existing = await prisma.sequencingProvider.findFirst({
      where: { name: provider.name },
    });

    if (existing) {
      console.log(`  [skip] ${provider.name} (already exists)`);
      continue;
    }

    await prisma.sequencingProvider.create({
      data: {
        name: provider.name,
        type: provider.type,
        testTypes: provider.testTypes,
        details: provider.details,
      },
    });

    console.log(`  [created] ${provider.name} (${provider.type})`);
  }

  console.log(`\nDone. ${providers.length} providers processed.`);
}

seed()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
