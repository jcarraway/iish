import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from apps/web/.env
config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '../packages/db/src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

import { generateArticle, publishArticle } from '../apps/web/lib/learn-manager';

// ============================================================================
// Batch 3: 10 new articles + 3 retries from batch 2 connection failures
// ============================================================================

interface ArticleSpec {
  type: string;
  topic: string;
  primaryKeyword: string;
  cancerType: string;
  category: string;
}

const ARTICLE_SPECS: ArticleSpec[] = [
  // --- 3 retries from batch 2 ---
  {
    type: 'treatment_profile',
    topic: 'PARP Inhibitors: Olaparib and Talazoparib for BRCA-mutated breast cancer',
    primaryKeyword: 'PARP inhibitor breast cancer',
    cancerType: 'breast',
    category: 'treatment',
  },
  {
    type: 'treatment_profile',
    topic: 'CDK4/6 Inhibitors: Palbociclib, Ribociclib, and Abemaciclib',
    primaryKeyword: 'CDK4/6 inhibitor breast cancer',
    cancerType: 'breast',
    category: 'treatment',
  },
  {
    type: 'treatment_profile',
    topic: 'Enhertu (Trastuzumab Deruxtecan): The ADC changing HER2 treatment',
    primaryKeyword: 'Enhertu trastuzumab deruxtecan',
    cancerType: 'breast',
    category: 'treatment',
  },

  // --- 1 retry from batch 1 ---
  {
    type: 'treatment_profile',
    topic: 'Immunotherapy in breast cancer',
    primaryKeyword: 'immunotherapy breast cancer',
    cancerType: 'breast',
    category: 'treatment',
  },

  // --- 10 new articles ---
  {
    type: 'test_profile',
    topic: 'Signatera and MRD testing: Monitoring after treatment',
    primaryKeyword: 'Signatera MRD testing cancer',
    cancerType: 'breast',
    category: 'testing',
  },
  {
    type: 'comparison',
    topic: 'MammaPrint vs Oncotype DX: Comparing genomic tests',
    primaryKeyword: 'MammaPrint vs Oncotype DX',
    cancerType: 'breast',
    category: 'testing',
  },
  {
    type: 'guide',
    topic: 'Genetic counseling: What to expect and who should go',
    primaryKeyword: 'genetic counseling breast cancer',
    cancerType: 'breast',
    category: 'testing',
  },
  {
    type: 'biomarker_profile',
    topic: 'Tumor-infiltrating lymphocytes (TILs): What they mean for your prognosis',
    primaryKeyword: 'tumor infiltrating lymphocytes TILs',
    cancerType: 'breast',
    category: 'biomarkers',
  },
  {
    type: 'biomarker_profile',
    topic: 'PD-L1 testing in breast cancer: Who benefits from immunotherapy',
    primaryKeyword: 'PD-L1 testing breast cancer immunotherapy',
    cancerType: 'breast',
    category: 'biomarkers',
  },
  {
    type: 'landscape',
    topic: 'Bispecific antibodies: The next generation of targeted therapy',
    primaryKeyword: 'bispecific antibody cancer therapy',
    cancerType: 'breast',
    category: 'innovation',
  },
  {
    type: 'guide',
    topic: 'Lymphedema after breast cancer surgery: Prevention and management',
    primaryKeyword: 'lymphedema breast cancer prevention',
    cancerType: 'breast',
    category: 'side-effects',
  },
  {
    type: 'guide',
    topic: 'Nutrition during chemotherapy: What the evidence actually says',
    primaryKeyword: 'nutrition during chemotherapy cancer',
    cancerType: 'breast',
    category: 'side-effects',
  },
  {
    type: 'guide',
    topic: 'Talking to children about your cancer diagnosis',
    primaryKeyword: 'talking to children about cancer',
    cancerType: 'breast',
    category: 'survivorship',
  },
  {
    type: 'guide',
    topic: 'Insurance appeals for denied cancer treatments: A step-by-step guide',
    primaryKeyword: 'insurance appeal denied cancer treatment',
    cancerType: 'breast',
    category: 'decisions',
  },
];

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log(`=== Seeding LEARN: Batch 3 (${ARTICLE_SPECS.length} articles) ===\n`);

  const created: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < ARTICLE_SPECS.length; i++) {
    const spec = ARTICLE_SPECS[i];
    const label = `[${i + 1}/${ARTICLE_SPECS.length}]`;
    console.log(`  ${label} Generating: "${spec.topic}" (${spec.type}, ${spec.category})...`);

    try {
      const article = await generateArticle({
        title: spec.topic,
        type: spec.type,
        primaryKeyword: spec.primaryKeyword,
        cancerType: spec.cancerType,
        category: spec.category,
      });

      if (article) {
        created.push(article.slug);
        console.log(`          -> Created: ${article.slug}`);
      } else {
        failed.push(spec.topic);
        console.log(`          -> FAILED: null result`);
      }
    } catch (err: any) {
      failed.push(spec.topic);
      console.log(`          -> FAILED: ${err.message?.substring(0, 120) || err}`);
    }
  }

  console.log(`\nGenerated ${created.length} of ${ARTICLE_SPECS.length} articles.\n`);

  // Publish all created articles
  console.log('Publishing articles...');
  for (let i = 0; i < created.length; i++) {
    try {
      await publishArticle(created[i]);
      console.log(`  [${i + 1}/${created.length}] Published: ${created[i]}`);
    } catch (err: any) {
      console.log(`  [${i + 1}/${created.length}] Publish failed: ${created[i]} — ${err.message}`);
    }
  }

  console.log(`\n=== Batch 3 Complete ===`);
  console.log(`  Articles generated: ${created.length}`);
  console.log(`  Articles published: ${created.length}`);
  console.log(`  Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log(`  Failed topics: ${failed.join(', ')}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
