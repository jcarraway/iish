import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from apps/web/.env
config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '@oncovax/db/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { runTrialSync } from '../apps/web/lib/trial-sync';
import { parseAllUnparsedTrials } from '../apps/web/lib/eligibility-parser';

const args = process.argv.slice(2);
const skipParse = args.includes('--skip-parse');
const parseOnly = args.includes('--parse-only');

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const db = new PrismaClient({ adapter });

  try {
    if (!parseOnly) {
      console.log('=== Trial Sync ===');
      const syncResult = await runTrialSync(db);
      console.log(JSON.stringify(syncResult, null, 2));
    }

    if (!skipParse) {
      console.log('\n=== Eligibility Parsing ===');
      const parseResult = await parseAllUnparsedTrials(db);
      console.log(JSON.stringify(parseResult, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
