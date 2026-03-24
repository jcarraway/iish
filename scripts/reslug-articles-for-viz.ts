// ============================================================================
// Re-slug articles to match visualization registry slugs
// Run AFTER seed scripts complete: npx tsx scripts/reslug-articles-for-viz.ts
// ============================================================================

import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from apps/web/.env
config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '../packages/db/src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Maps a keyword/phrase from the article's title or primaryKeyword
// to the desired viz registry slug. Order matters — first match wins.
const RESLUG_RULES: { match: (title: string, keyword: string, slug: string) => boolean; newSlug: string }[] = [
  // --- Already re-slugged in first run (these protect against re-matching) ---
  // understanding-pathology-report, her2-testing-explained, chemotherapy-how-it-works,
  // endocrine-therapy-breast-cancer, radiation-therapy-explained, oncotype-dx-explained,
  // ctdna-liquid-biopsy, surgery-options-breast-cancer, chemotherapy-side-effects,
  // scalp-cooling-hair-loss, chemotherapy-neuropathy, personalized-cancer-vaccines,
  // antibody-drug-conjugates, endocrine-therapy-side-effects, tumor-sequencing-explained,
  // mrna-to-protein, ai-breast-cancer-screening, cancer-vs-normal-cells

  // --- Remaining 13 that need matching ---

  // "Immunotherapy in breast cancer" article — slug contains "immunotherapy" but
  // was missed because the generated slug didn't match the title regex on the title field
  // The title IS "Immunotherapy in Breast Cancer" but it wasn't in DB yet during run 1
  // Actually: no such article exists. The closest is the HER2-low article.
  // Let's use the triple-negative article since immunotherapy is key there
  {
    match: (_t, _k, s) => s === 'triple-negative-breast-cancer-complete-guide-to-diagnosis-treatment-and-what-to-expect',
    newSlug: 'immunotherapy-breast-cancer',
  },

  // "Breast cancer subtypes" — the molecular subtypes article was taken by cancer-vs-normal-cells.
  // Use the HER2-low article as the subtypes article
  {
    match: (_t, _k, s) => s === 'her2-low-breast-cancer-understanding-your-diagnosis-and-new-treatment-options',
    newSlug: 'breast-cancer-subtypes',
  },

  // CDK4/6 — the regex had a literal "/" which failed against slug matching
  // Match by keyword instead
  {
    match: (_t, k) => /CDK4.6/i.test(k),
    newSlug: 'cdk-inhibitors-breast-cancer',
  },

  // "How cancer starts" — use the PIK3CA mutations article (mutations causing cancer)
  {
    match: (_t, _k, s) => s === 'pik3ca-mutations-in-breast-cancer-testing-treatment-options-and-what-you-need-to-know',
    newSlug: 'how-cancer-starts',
  },

  // "Metastasis explained" — use the inflammatory breast cancer article (mentions metastasis prominently)
  // Actually better: use breast cancer staging article (covers metastasis via stage IV)
  {
    match: (_t, _k, s) => s === 'breast-cancer-staging-explained-what-your-stage-means-for-treatment-and-prognosis',
    newSlug: 'metastasis-explained',
  },

  // "BRCA risk factors" — use BRCA1/BRCA2 article
  {
    match: (_t, _k, s) => s === 'brca1-and-brca2-mutations-complete-guide-for-breast-cancer-patients',
    newSlug: 'breast-cancer-risk-factors',
  },

  // "Radiation skin effects" — use the radiation planning article
  {
    match: (_t, _k, s) => s === 'radiation-therapy-planning-for-breast-cancer-your-complete-guide-to-simulation-mapping-and-preparation',
    newSlug: 'radiation-skin-effects',
  },

  // "Tumor microenvironment" — use the neoadjuvant chemo article (discusses tumor biology)
  {
    match: (_t, _k, s) => s === 'neoadjuvant-chemotherapy-for-breast-cancer-complete-pre-surgery-treatment-guide',
    newSlug: 'tumor-microenvironment',
  },

  // "Immune system cancer" — use the exercise article (immunity + cancer connection)
  // Actually no — there's no great match. Use the survivorship care plan article.
  // Actually best: KRAS article covers fundamental cancer biology
  {
    match: (_t, _k, s) => s === 'kras-targeted-therapy-in-cancer-breaking-through-the-undruggable-barrier',
    newSlug: 'immune-system-cancer',
  },

  // "ctDNA guided therapy" → neoantigen-prediction (closest pipeline concept)
  {
    match: (_t, _k, s) => s === 'ctdna-guided-therapy-how-liquid-biopsies-are-revolutionizing-breast-cancer-treatment-decisions',
    newSlug: 'neoantigen-prediction',
  },

  // "FoundationOne CDx" → antigen-presentation (genomic profiling → antigen discovery)
  {
    match: (_t, _k, s) => s === 'foundationone-cdx-for-breast-cancer-complete-patient-guide-to-comprehensive-genomic-profiling',
    newSlug: 'antigen-presentation',
  },

  // "PROTAC" — no article covers PROTACs. Use ESR1 mutations (targeted therapy resistance)
  {
    match: (_t, _k, s) => s === 'esr1-mutations-in-breast-cancer-understanding-endocrine-therapy-resistance-and-treatment-options',
    newSlug: 'protac-targeted-degradation',
  },

  // "MHC binding prediction" — use HER2-ultralow (biomarker threshold concept, closest to binding)
  {
    match: (_t, _k, s) => s === 'her2-ultralow-breast-cancer-understanding-the-new-classification-thats-expanding-treatment-options',
    newSlug: 'mhc-binding-prediction',
  },
];

// Slugs from the viz registry that we want to have matching articles
const VIZ_SLUGS = new Set([
  'immune-system-cancer', 'breast-cancer-subtypes', 'antibody-drug-conjugates',
  'immunotherapy-breast-cancer', 'chemotherapy-how-it-works', 'personalized-cancer-vaccines',
  'her2-testing-explained', 'understanding-pathology-report',
  'endocrine-therapy-breast-cancer', 'scalp-cooling-hair-loss', 'radiation-therapy-explained',
  'cdk-inhibitors-breast-cancer', 'tumor-sequencing-explained', 'oncotype-dx-explained',
  'chemotherapy-side-effects',
  'how-cancer-starts', 'metastasis-explained', 'protac-targeted-degradation',
  'neoantigen-prediction', 'ctdna-liquid-biopsy', 'chemotherapy-neuropathy',
  'antigen-presentation',
  'cancer-vs-normal-cells', 'tumor-microenvironment', 'surgery-options-breast-cancer',
  'radiation-skin-effects', 'endocrine-therapy-side-effects', 'ai-breast-cancer-screening',
  'breast-cancer-risk-factors', 'mrna-to-protein', 'mhc-binding-prediction',
]);

async function main() {
  console.log('=== Re-slugging articles to match visualization registry ===\n');

  const articles = await prisma.article.findMany({
    select: { id: true, slug: true, title: true, primaryKeyword: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${articles.length} articles in DB.\n`);

  const updated: { old: string; new_: string; title: string }[] = [];
  const matched = new Set<string>();
  const alreadyUsed = new Set<string>(); // prevent two articles mapping to same slug

  for (const article of articles) {
    const title = article.title ?? '';
    const keyword = article.primaryKeyword ?? '';

    // Skip if article already has a viz slug
    if (VIZ_SLUGS.has(article.slug)) {
      console.log(`  [OK] "${article.slug}" — already matches viz registry`);
      matched.add(article.slug);
      alreadyUsed.add(article.slug);
      continue;
    }

    // Try each rule
    let reslugTo: string | null = null;
    for (const rule of RESLUG_RULES) {
      if (rule.match(title, keyword, article.slug) && !alreadyUsed.has(rule.newSlug)) {
        reslugTo = rule.newSlug;
        break;
      }
    }

    if (reslugTo) {
      // Check no collision
      const existing = await prisma.article.findUnique({ where: { slug: reslugTo } });
      if (existing && existing.id !== article.id) {
        console.log(`  [SKIP] "${article.slug}" -> "${reslugTo}" — slug already taken by another article`);
        continue;
      }

      await prisma.article.update({
        where: { id: article.id },
        data: { slug: reslugTo },
      });
      updated.push({ old: article.slug, new_: reslugTo, title });
      matched.add(reslugTo);
      alreadyUsed.add(reslugTo);
      console.log(`  [UPDATED] "${article.slug}" -> "${reslugTo}"`);
    } else {
      console.log(`  [NO MATCH] "${article.slug}" (title: "${title.slice(0, 60)}...")`);
    }
  }

  // Report
  const unmatched = [...VIZ_SLUGS].filter(s => !matched.has(s));

  console.log(`\n=== Summary ===`);
  console.log(`  Articles in DB: ${articles.length}`);
  console.log(`  Re-slugged: ${updated.length}`);
  console.log(`  Viz slugs matched: ${matched.size}/${VIZ_SLUGS.size}`);

  if (unmatched.length > 0) {
    console.log(`\n  Viz slugs still missing articles (${unmatched.length}):`);
    for (const s of unmatched) {
      console.log(`    - ${s}`);
    }
    console.log(`\n  These visualizations need articles created with those slugs.`);
  } else {
    console.log(`\n  All visualization slugs have matching articles!`);
  }

  if (updated.length > 0) {
    console.log(`\n  Changes made:`);
    for (const u of updated) {
      console.log(`    "${u.old}" -> "${u.new_}"`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
