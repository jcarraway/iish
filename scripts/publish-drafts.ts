import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '../packages/db/src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const drafts = await prisma.article.findMany({ where: { status: 'draft' }, select: { id: true, slug: true } });
  console.log(`Found ${drafts.length} draft articles. Publishing...`);

  for (const d of drafts) {
    await prisma.article.update({ where: { id: d.id }, data: { status: 'published', publishedAt: new Date() } });
    console.log(`  Published: ${d.slug}`);
  }

  console.log(`\nDone. ${drafts.length} articles published.`);
  await prisma.$disconnect();
}

main().catch(console.error);
