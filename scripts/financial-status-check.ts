import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from apps/web/.env
config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '@oncovax/db/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/**
 * CLI script to check financial program fund statuses.
 * In production, this would be wired to a cron job that:
 * 1. Checks statusUrl for each program
 * 2. Updates fund open/closed status
 * 3. Triggers notifications for patients with notifyOnReopen = true
 *
 * For now, this is a manual tool to update statuses.
 *
 * Usage:
 *   npx tsx scripts/financial-status-check.ts                  # List all programs with status
 *   npx tsx scripts/financial-status-check.ts --update <id> <status>  # Update a program's status
 */

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--update' && args[1] && args[2]) {
    const id = args[1];
    const status = args[2];
    if (!['open', 'closed', 'waitlist', 'unknown'].includes(status)) {
      console.error('Status must be: open, closed, waitlist, or unknown');
      process.exit(1);
    }
    await prisma.financialProgram.update({
      where: { id },
      data: { status, lastStatusCheck: new Date() },
    });
    console.log(`Updated program ${id} status to: ${status}`);

    // Check for patients waiting on reopen notification
    if (status === 'open') {
      const waitingMatches = await prisma.financialMatch.findMany({
        where: { programId: id, notifyOnReopen: true },
        include: { patient: { include: { user: { select: { email: true } } } } },
      });
      if (waitingMatches.length > 0) {
        console.log(`\n${waitingMatches.length} patient(s) waiting for reopen notification:`);
        for (const match of waitingMatches) {
          console.log(`  - ${match.patient.user.email}`);
        }
        console.log('\nNote: Email notifications are not yet implemented. These patients should be contacted manually.');
      }
    }
  } else {
    // List all programs
    const programs = await prisma.financialProgram.findMany({
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, status: true, lastStatusCheck: true, type: true },
    });

    console.log(`\nFinancial Programs Status Report (${programs.length} programs)\n`);
    console.log('Status    | Type                  | Last Check  | Name');
    console.log('----------|-----------------------|-------------|-----');
    for (const p of programs) {
      const status = p.status.padEnd(9);
      const type = p.type.padEnd(21);
      const lastCheck = p.lastStatusCheck
        ? p.lastStatusCheck.toISOString().slice(0, 10)
        : 'never      ';
      console.log(`${status} | ${type} | ${lastCheck} | ${p.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
