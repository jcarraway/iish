import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from apps/web/.env
config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '@oncovax/db/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

import {
  ingestPubMedArticles,
  processClassificationQueue,
  processSummarizationQueue,
} from '../apps/web/lib/intel-manager';

async function main() {
  console.log('=== INTEL I1: PubMed Seed ===\n');

  // 1. Create initial sync state
  console.log('1. Creating IngestionSyncState for pubmed...');
  await prisma.ingestionSyncState.upsert({
    where: { sourceId: 'pubmed' },
    create: {
      sourceId: 'pubmed',
      itemsIngestedTotal: 0,
      itemsIngestedLastRun: 0,
    },
    update: {},
  });
  console.log('   ✓ Sync state ready\n');

  // 2. Ingest last 90 days
  console.log('2. Ingesting PubMed articles (last 90 days)...');
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - 90);

  const ingestResult = await ingestPubMedArticles(sinceDate);
  console.log(`   ✓ Ingested: ${ingestResult.ingested}, Skipped: ${ingestResult.skipped}, Errors: ${ingestResult.errors}\n`);

  // 3. Classify queue (loop until empty)
  console.log('3. Classifying items...');
  let totalClassified = 0;
  let classifyBatch;
  do {
    classifyBatch = await processClassificationQueue(20);
    totalClassified += classifyBatch.classified;
    if (classifyBatch.classified > 0) {
      console.log(`   Classified ${classifyBatch.classified} items (${classifyBatch.errors} errors)`);
    }
  } while (classifyBatch.classified > 0);
  console.log(`   ✓ Total classified: ${totalClassified}\n`);

  // 4. Summarize queue (loop until empty)
  console.log('4. Summarizing items...');
  let totalSummarized = 0;
  let summarizeBatch;
  do {
    summarizeBatch = await processSummarizationQueue(10);
    totalSummarized += summarizeBatch.summarized;
    if (summarizeBatch.summarized > 0) {
      console.log(`   Summarized ${summarizeBatch.summarized} items (${summarizeBatch.errors} errors)`);
    }
  } while (summarizeBatch.summarized > 0);
  console.log(`   ✓ Total summarized: ${totalSummarized}\n`);

  // 5. Summary
  const totalItems = await prisma.researchItem.count();
  const completeItems = await prisma.researchItem.count({ where: { classificationStatus: 'complete' } });
  console.log('=== Seed Complete ===');
  console.log(`Total research items: ${totalItems}`);
  console.log(`Fully processed: ${completeItems}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
