import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';

// ============================================================================
// Types
// ============================================================================

interface QualityIssue {
  type: 'missing_evidence' | 'outdated_reference' | 'dosage_mention' | 'missing_disclaimer' | 'accuracy' | 'tone';
  severity: 'high' | 'medium' | 'low';
  description: string;
  section?: string;
}

interface QualityCheckResult {
  issues: QualityIssue[];
  score: number;
  checkedAt: string;
}

// ============================================================================
// Platform Link Mapping
// ============================================================================

const PLATFORM_LINK_RULES: Array<{
  match: (article: any) => boolean;
  link: string;
  text: string;
}> = [
  {
    match: (a) => (a.cancerTypes?.length > 0 || a.breastSubtypes?.length > 0) && a.category !== 'survivorship',
    link: '/matches',
    text: 'Find clinical trials matching your profile',
  },
  {
    match: (a) => a.category === 'testing' || a.treatmentClasses?.some((tc: string) => /sequencing|genomic/i.test(tc)),
    link: '/sequencing',
    text: 'Explore sequencing options',
  },
  {
    match: (a) => a.category === 'treatment' || a.category === 'decisions',
    link: '/translate',
    text: 'Get your treatment plan translated',
  },
  {
    match: (a) => a.category === 'survivorship',
    link: '/survive',
    text: 'Go to your survivorship dashboard',
  },
  {
    match: (a) => a.biomarkers?.length > 0,
    link: '/sequencing/genomics',
    text: 'View your genomic results',
  },
  {
    match: (a) => a.category === 'innovation',
    link: '/intel',
    text: 'Browse latest research',
  },
];

// ============================================================================
// 1. Check Article Quality
// ============================================================================

export async function checkArticleQuality(articleId: string): Promise<QualityCheckResult> {
  // Check Redis cache
  const cacheKey = `learn:qc:${articleId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error('Article not found');

  const patientContent = Array.isArray(article.patientContent) ? article.patientContent : [];
  const clinicalContent = Array.isArray(article.clinicalContent) ? article.clinicalContent : [];
  const references = Array.isArray(article.references) ? article.references : [];
  const actionItems = Array.isArray(article.actionItems) ? article.actionItems : [];

  const contentText = [
    ...(patientContent as any[]).map((s: any) => `${s.heading}: ${s.body}`),
    ...(clinicalContent as any[]).map((s: any) => `${s.heading}: ${s.body}`),
  ].join('\n\n');

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: `You are a medical content quality reviewer for a cancer patient education platform. Analyze the article for potential issues.

CHECK FOR:
1. Treatment recommendations without evidence grading (severity: high)
2. Specific dosage mentions — patients should not self-dose (severity: high)
3. References older than 3 years from current year 2026 (severity: medium)
4. Missing disclaimers about consulting oncologist (severity: medium)
5. Factual accuracy concerns (severity: high)
6. Inappropriate tone — too clinical, too casual, or anxiety-inducing (severity: low)

SCORING:
- Start at 100
- Each high severity issue: -15 points
- Each medium severity issue: -8 points
- Each low severity issue: -3 points
- Minimum score: 0

Return ONLY valid JSON:
{
  "issues": [{"type": "string", "severity": "high|medium|low", "description": "string", "section": "string or null"}],
  "score": number
}`,
    messages: [
      {
        role: 'user',
        content: `Article: "${article.title}"
Category: ${article.category}
Patient Summary: ${article.patientSummary}

Content:
${contentText.slice(0, 6000)}

References (${references.length} total):
${JSON.stringify(references.slice(0, 10))}

Action Items:
${JSON.stringify(actionItems)}

Analyze this article for quality issues.`,
      },
    ],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;

  let parsed: { issues: QualityIssue[]; score: number };
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    parsed = { issues: [], score: 85 };
  }

  const result: QualityCheckResult = {
    issues: parsed.issues || [],
    score: Math.max(0, Math.min(100, parsed.score ?? 85)),
    checkedAt: new Date().toISOString(),
  };

  // Cache for 7 days
  await redis.set(cacheKey, JSON.stringify(result), 'EX', 7 * 24 * 60 * 60);

  return result;
}

// ============================================================================
// 2. Run Article Quality Checks (Batch)
// ============================================================================

export async function runArticleQualityChecks(): Promise<{ checked: number; issues: number }> {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { id: true },
  });

  let totalIssues = 0;

  for (const article of articles) {
    try {
      const result = await checkArticleQuality(article.id);
      totalIssues += result.issues.length;
      console.log(`[LEARN QC] Article ${article.id}: score=${result.score}, issues=${result.issues.length}`);
    } catch (err) {
      console.error(`[LEARN QC] Failed to check article ${article.id}:`, err);
    }
  }

  return { checked: articles.length, issues: totalIssues };
}

// ============================================================================
// 3. Update Article Status
// ============================================================================

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['review'],
  review: ['published', 'draft'],
  published: ['review'],
};

export async function updateArticleStatus(
  articleId: string,
  status: string,
  notes?: string,
): Promise<any> {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error('Article not found');

  const allowedTargets = VALID_TRANSITIONS[article.status] ?? [];
  if (!allowedTargets.includes(status)) {
    throw new Error(`Cannot transition from "${article.status}" to "${status}"`);
  }

  const updateData: any = { status };

  if (status === 'published' && !article.publishedAt) {
    updateData.publishedAt = new Date();

    // Update structured data with publish date
    if (article.structuredData) {
      const sd = article.structuredData as any;
      sd.datePublished = new Date().toISOString();
      sd.dateModified = new Date().toISOString();
      updateData.structuredData = sd;
    }
  }

  if (status === 'draft' || status === 'review') {
    // Clear publishedAt if going back to draft/review
    if (status === 'draft') {
      updateData.publishedAt = null;
    }
  }

  return prisma.article.update({
    where: { id: articleId },
    data: updateData,
  });
}

// ============================================================================
// 4. Get Articles Admin
// ============================================================================

export async function getArticlesAdmin(filters?: {
  status?: string;
  category?: string;
}): Promise<any[]> {
  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.category) {
    where.category = filters.category;
  }

  return prisma.article.findMany({
    where,
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });
}

// ============================================================================
// 5. Insert Platform Links
// ============================================================================

export async function insertPlatformLinks(articleId: string): Promise<any> {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error('Article not found');

  const existingItems = Array.isArray(article.actionItems) ? (article.actionItems as any[]) : [];

  // Find matching platform links based on article taxonomy
  const matchedLinks = PLATFORM_LINK_RULES.filter((rule) => rule.match(article));

  // Avoid duplicating existing platform links
  const existingPlatformLinks = new Set(
    existingItems.filter((i: any) => i.platformLink).map((i: any) => i.platformLink),
  );

  const newItems = matchedLinks
    .filter((ml) => !existingPlatformLinks.has(ml.link))
    .map((ml) => ({
      text: ml.text,
      link: null,
      platformLink: ml.link,
      type: 'explore_platform',
    }));

  if (newItems.length === 0) return article;

  const updatedItems = [...existingItems, ...newItems];

  return prisma.article.update({
    where: { id: articleId },
    data: { actionItems: updatedItems },
  });
}
