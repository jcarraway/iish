import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';

// ============================================================================
// Types
// ============================================================================

interface RelatedResearchItem {
  id: string;
  title: string;
  maturityTier: string | null;
  patientSummary: string | null;
  publishedAt: string | null;
  sourceType: string;
  practiceImpact: string | null;
}

interface RelatedArticle {
  slug: string;
  title: string;
  category: string;
  patientSummary: string;
  viewCount: number;
}

interface RefreshTriggerItem {
  id: string;
  title: string;
  maturityTier: string | null;
  practiceImpact: string | null;
  publishedAt: string | null;
}

interface RefreshTrigger {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  urgency: 'urgent' | 'suggested';
  triggerItems: RefreshTriggerItem[];
}

interface RefreshSuggestion {
  sectionsToUpdate: string[];
  newDataToIncorporate: string[];
  referencesToAdd: string[];
  summary: string;
}

interface ArticleEngagement {
  id: string;
  slug: string;
  title: string;
  category: string;
  viewCount: number;
  publishedAt: string | null;
}

// ============================================================================
// Category-to-domain mapping for reverse cross-links
// ============================================================================

const CATEGORY_TO_DOMAINS: Record<string, string[]> = {
  treatment: ['treatment', 'drug_development'],
  decisions: ['treatment', 'clinical_practice'],
  testing: ['diagnostics', 'biomarkers'],
  biomarkers: ['biomarkers', 'diagnostics'],
  'side-effects': ['quality_of_life', 'treatment'],
  survivorship: ['survivorship', 'quality_of_life'],
  diagnosis: ['diagnostics', 'clinical_practice'],
  innovation: ['drug_development', 'basic_science'],
};

// ============================================================================
// 1. Get Related Research (Article → ResearchItems)
// ============================================================================

export async function getRelatedResearch(slug: string, limit = 5): Promise<RelatedResearchItem[]> {
  const cacheKey = `learn:related-research:${slug}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      cancerTypes: true,
      breastSubtypes: true,
      biomarkers: true,
      treatmentClasses: true,
    },
  });

  if (!article) return [];

  // Build OR conditions for taxonomy overlap
  const orConditions: any[] = [];

  if (article.cancerTypes.length > 0) {
    orConditions.push({ cancerTypes: { hasSome: article.cancerTypes } });
  }
  if (article.breastSubtypes.length > 0) {
    orConditions.push({ breastSubtypes: { hasSome: article.breastSubtypes } });
  }
  if (article.biomarkers.length > 0) {
    orConditions.push({ biomarkerRelevance: { hasSome: article.biomarkers } });
  }
  if (article.treatmentClasses.length > 0) {
    orConditions.push({ treatmentClasses: { hasSome: article.treatmentClasses } });
  }

  if (orConditions.length === 0) return [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 180);

  const items = await prisma.researchItem.findMany({
    where: {
      classificationStatus: 'complete',
      maturityTier: { in: ['T1', 'T2', 'T3'] },
      publishedAt: { gte: cutoffDate },
      OR: orConditions,
    },
    select: {
      id: true,
      title: true,
      maturityTier: true,
      patientSummary: true,
      publishedAt: true,
      sourceType: true,
      practiceImpact: true,
    },
    orderBy: [
      { maturityTier: 'asc' },
      { publishedAt: 'desc' },
    ],
    take: limit,
  });

  const result: RelatedResearchItem[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    maturityTier: item.maturityTier,
    patientSummary: item.patientSummary ? (item.patientSummary as string).slice(0, 200) : null,
    publishedAt: item.publishedAt?.toISOString() ?? null,
    sourceType: item.sourceType,
    practiceImpact: item.practiceImpact,
  }));

  // Cache 24 hours
  await redis.set(cacheKey, JSON.stringify(result), 'EX', 24 * 60 * 60);

  return result;
}

// ============================================================================
// 2. Get Articles for Research Item (ResearchItem → Articles)
// ============================================================================

export async function getArticlesForResearchItem(itemId: string, limit = 3): Promise<RelatedArticle[]> {
  const cacheKey = `learn:articles-for-item:${itemId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const item = await prisma.researchItem.findUnique({
    where: { id: itemId },
    select: {
      cancerTypes: true,
      breastSubtypes: true,
      biomarkerRelevance: true,
      treatmentClasses: true,
      domains: true,
    },
  });

  if (!item) return [];

  const orConditions: any[] = [];

  if (item.cancerTypes.length > 0) {
    orConditions.push({ cancerTypes: { hasSome: item.cancerTypes } });
  }
  if (item.breastSubtypes.length > 0) {
    orConditions.push({ breastSubtypes: { hasSome: item.breastSubtypes } });
  }
  if (item.biomarkerRelevance.length > 0) {
    orConditions.push({ biomarkers: { hasSome: item.biomarkerRelevance } });
  }
  if (item.treatmentClasses.length > 0) {
    orConditions.push({ treatmentClasses: { hasSome: item.treatmentClasses } });
  }

  // Map domains back to categories
  const relevantCategories: string[] = [];
  for (const [cat, domains] of Object.entries(CATEGORY_TO_DOMAINS)) {
    if (item.domains.some((d: string) => domains.includes(d))) {
      relevantCategories.push(cat);
    }
  }
  if (relevantCategories.length > 0) {
    orConditions.push({ category: { in: relevantCategories } });
  }

  if (orConditions.length === 0) return [];

  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      OR: orConditions,
    },
    select: {
      slug: true,
      title: true,
      category: true,
      patientSummary: true,
      viewCount: true,
    },
    orderBy: { viewCount: 'desc' },
    take: limit,
  });

  const result: RelatedArticle[] = articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    patientSummary: a.patientSummary.slice(0, 200),
    viewCount: a.viewCount,
  }));

  // Cache 24 hours
  await redis.set(cacheKey, JSON.stringify(result), 'EX', 24 * 60 * 60);

  return result;
}

// ============================================================================
// 3. Check Refresh Triggers
// ============================================================================

export async function checkRefreshTriggers(): Promise<RefreshTrigger[]> {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: {
      id: true,
      title: true,
      slug: true,
      cancerTypes: true,
      breastSubtypes: true,
      biomarkers: true,
      treatmentClasses: true,
    },
  });

  const triggers: RefreshTrigger[] = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  for (const article of articles) {
    // Check if already flagged
    const flagKey = `learn:refresh-flagged:${article.id}`;
    const alreadyFlagged = await redis.get(flagKey);
    if (alreadyFlagged) continue;

    // Find T1/T2 items with overlapping taxonomy from last 30 days
    const orConditions: any[] = [];
    if (article.cancerTypes.length > 0) {
      orConditions.push({ cancerTypes: { hasSome: article.cancerTypes } });
    }
    if (article.breastSubtypes.length > 0) {
      orConditions.push({ breastSubtypes: { hasSome: article.breastSubtypes } });
    }
    if (article.biomarkers.length > 0) {
      orConditions.push({ biomarkerRelevance: { hasSome: article.biomarkers } });
    }
    if (article.treatmentClasses.length > 0) {
      orConditions.push({ treatmentClasses: { hasSome: article.treatmentClasses } });
    }

    if (orConditions.length === 0) continue;

    const matchingItems = await prisma.researchItem.findMany({
      where: {
        classificationStatus: 'complete',
        maturityTier: { in: ['T1', 'T2'] },
        publishedAt: { gte: cutoffDate },
        OR: orConditions,
      },
      select: {
        id: true,
        title: true,
        maturityTier: true,
        practiceImpact: true,
        publishedAt: true,
      },
      take: 10,
    });

    if (matchingItems.length === 0) continue;

    const hasT1 = matchingItems.some((i) => i.maturityTier === 'T1');

    triggers.push({
      articleId: article.id,
      articleTitle: article.title,
      articleSlug: article.slug,
      urgency: hasT1 ? 'urgent' : 'suggested',
      triggerItems: matchingItems.map((i) => ({
        id: i.id,
        title: i.title,
        maturityTier: i.maturityTier,
        practiceImpact: i.practiceImpact,
        publishedAt: i.publishedAt?.toISOString() ?? null,
      })),
    });
  }

  return triggers;
}

// ============================================================================
// 4. Generate Refresh Suggestion
// ============================================================================

export async function generateRefreshSuggestion(
  articleId: string,
  triggerItemIds: string[],
): Promise<RefreshSuggestion> {
  const cacheKey = `learn:refresh-suggestion:${articleId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const [article, triggerItems] = await Promise.all([
    prisma.article.findUnique({ where: { id: articleId } }),
    prisma.researchItem.findMany({
      where: { id: { in: triggerItemIds } },
      select: {
        title: true,
        patientSummary: true,
        clinicianSummary: true,
        maturityTier: true,
        practiceImpact: true,
      },
    }),
  ]);

  if (!article) throw new Error('Article not found');
  if (triggerItems.length === 0) throw new Error('No trigger items found');

  const patientContent = Array.isArray(article.patientContent)
    ? (article.patientContent as any[]).map((s: any) => `## ${s.heading}\n${s.body}`).join('\n\n')
    : '';

  const researchSummaries = triggerItems
    .map((item) => {
      const summary = item.clinicianSummary
        ? (item.clinicianSummary as any).keyFindings || item.patientSummary
        : item.patientSummary;
      return `- [${item.maturityTier}] ${item.title}: ${summary}`;
    })
    .join('\n');

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: `You are a medical content editor reviewing whether an educational article needs updating based on new research. Compare the article content with the new research findings and recommend specific updates.

Return ONLY valid JSON:
{
  "sectionsToUpdate": ["string — section headings that need revision"],
  "newDataToIncorporate": ["string — specific new findings to add"],
  "referencesToAdd": ["string — new references to include"],
  "summary": "string — 2-3 sentence summary of what needs to change and why"
}`,
    messages: [
      {
        role: 'user',
        content: `ARTICLE: "${article.title}"

ARTICLE CONTENT:
${patientContent.slice(0, 4000)}

NEW RESEARCH FINDINGS:
${researchSummaries.slice(0, 3000)}

What sections need updating based on this new research?`,
      },
    ],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;

  let suggestion: RefreshSuggestion;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    suggestion = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    suggestion = {
      sectionsToUpdate: [],
      newDataToIncorporate: [],
      referencesToAdd: [],
      summary: 'Unable to generate specific suggestions. Please review the article manually.',
    };
  }

  // Cache 7 days
  await redis.set(cacheKey, JSON.stringify(suggestion), 'EX', 7 * 24 * 60 * 60);

  return suggestion;
}

// ============================================================================
// 5. Run Refresh Check Cycle (cron)
// ============================================================================

export async function runRefreshCheckCycle(): Promise<{
  articlesChecked: number;
  refreshTriggersFound: number;
  suggestions: number;
}> {
  console.log('[LEARN REFRESH] Starting refresh check cycle...');

  const triggers = await checkRefreshTriggers();
  let suggestionsGenerated = 0;

  // Auto-generate suggestions for urgent items
  for (const trigger of triggers) {
    if (trigger.urgency === 'urgent') {
      try {
        await generateRefreshSuggestion(
          trigger.articleId,
          trigger.triggerItems.map((t) => t.id),
        );
        suggestionsGenerated++;
        console.log(`[LEARN REFRESH] Generated suggestion for "${trigger.articleTitle}"`);
      } catch (err) {
        console.error(`[LEARN REFRESH] Failed to generate suggestion for "${trigger.articleTitle}":`, err);
      }
    }

    // Flag article so it's not re-checked for 7 days
    const flagKey = `learn:refresh-flagged:${trigger.articleId}`;
    await redis.set(flagKey, JSON.stringify({
      urgency: trigger.urgency,
      triggerCount: trigger.triggerItems.length,
      flaggedAt: new Date().toISOString(),
    }), 'EX', 7 * 24 * 60 * 60);
  }

  const publishedCount = await prisma.article.count({ where: { status: 'published' } });

  console.log(`[LEARN REFRESH] Cycle complete: ${publishedCount} checked, ${triggers.length} triggers, ${suggestionsGenerated} suggestions`);

  return {
    articlesChecked: publishedCount,
    refreshTriggersFound: triggers.length,
    suggestions: suggestionsGenerated,
  };
}

// ============================================================================
// 6. Get Article Refresh Status
// ============================================================================

export async function getArticleRefreshStatus(articleId: string): Promise<{
  needsRefresh: boolean;
  urgency: string | null;
  triggers: RefreshTriggerItem[];
  suggestion: RefreshSuggestion | null;
}> {
  // Check flag
  const flagKey = `learn:refresh-flagged:${articleId}`;
  const flagData = await redis.get(flagKey);

  if (!flagData) {
    return { needsRefresh: false, urgency: null, triggers: [], suggestion: null };
  }

  const flag = JSON.parse(flagData);

  // Check for cached suggestion
  const suggestionKey = `learn:refresh-suggestion:${articleId}`;
  const suggestionData = await redis.get(suggestionKey);
  const suggestion = suggestionData ? JSON.parse(suggestionData) : null;

  // Get trigger items from the most recent check
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      cancerTypes: true,
      breastSubtypes: true,
      biomarkers: true,
      treatmentClasses: true,
    },
  });

  let triggers: RefreshTriggerItem[] = [];

  if (article) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const orConditions: any[] = [];
    if (article.cancerTypes.length > 0) orConditions.push({ cancerTypes: { hasSome: article.cancerTypes } });
    if (article.breastSubtypes.length > 0) orConditions.push({ breastSubtypes: { hasSome: article.breastSubtypes } });
    if (article.biomarkers.length > 0) orConditions.push({ biomarkerRelevance: { hasSome: article.biomarkers } });
    if (article.treatmentClasses.length > 0) orConditions.push({ treatmentClasses: { hasSome: article.treatmentClasses } });

    if (orConditions.length > 0) {
      const items = await prisma.researchItem.findMany({
        where: {
          classificationStatus: 'complete',
          maturityTier: { in: ['T1', 'T2'] },
          publishedAt: { gte: cutoffDate },
          OR: orConditions,
        },
        select: { id: true, title: true, maturityTier: true, practiceImpact: true, publishedAt: true },
        take: 5,
      });

      triggers = items.map((i) => ({
        id: i.id,
        title: i.title,
        maturityTier: i.maturityTier,
        practiceImpact: i.practiceImpact,
        publishedAt: i.publishedAt?.toISOString() ?? null,
      }));
    }
  }

  return {
    needsRefresh: true,
    urgency: flag.urgency ?? 'suggested',
    triggers,
    suggestion,
  };
}

// ============================================================================
// 7. Get Article Engagement
// ============================================================================

export async function getArticleEngagement(): Promise<ArticleEngagement[]> {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      viewCount: true,
      publishedAt: true,
    },
    orderBy: { viewCount: 'desc' },
  });

  return articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    category: a.category,
    viewCount: a.viewCount,
    publishedAt: a.publishedAt?.toISOString() ?? null,
  }));
}
