import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import type { PatientProfile } from '@iish/shared';

// ============================================================================
// Constants — Article Categories
// ============================================================================

export const ARTICLE_CATEGORIES: Record<string, { label: string; description: string }> = {
  diagnosis: {
    label: 'Understanding Your Diagnosis',
    description: 'Making sense of pathology reports, staging, biomarkers, and what your diagnosis means for treatment decisions.',
  },
  biomarkers: {
    label: 'Biomarker Deep Dives',
    description: 'Detailed explanations of specific biomarkers, their clinical significance, and how they guide treatment selection.',
  },
  treatment: {
    label: 'Treatment Information',
    description: 'Evidence-based guides to chemotherapy regimens, targeted therapies, immunotherapy, surgery, and radiation.',
  },
  testing: {
    label: 'Diagnostic & Genomic Testing',
    description: 'Understanding the tests your oncologist orders — from Oncotype DX to whole exome sequencing to ctDNA monitoring.',
  },
  decisions: {
    label: 'Decision Support',
    description: 'Frameworks for navigating treatment decisions, comparing options, and preparing for conversations with your care team.',
  },
  'side-effects': {
    label: 'Side Effect Management',
    description: 'Practical guidance for managing treatment side effects, from neuropathy to fatigue to cognitive changes.',
  },
  survivorship: {
    label: 'Life After Treatment',
    description: 'Navigating surveillance schedules, managing late effects, returning to work, and building your new normal.',
  },
  innovation: {
    label: 'Emerging Science',
    description: 'Accessible explanations of new research, drug approvals, clinical trial results, and where the field is heading.',
  },
};

// ============================================================================
// Constants — Article Types
// ============================================================================

export const ARTICLE_TYPES: string[] = [
  'explainer',
  'guide',
  'decision',
  'comparison',
  'treatment_profile',
  'biomarker_profile',
  'procedure_guide',
  'test_profile',
  'questions',
  'glossary',
  'landscape',
  'myth_fact',
];

// ============================================================================
// Constants — Journey Stages
// ============================================================================

export const JOURNEY_STAGES: string[] = [
  'just_diagnosed',
  'awaiting_pathology',
  'treatment_planning',
  'active_treatment',
  'post_surgery',
  'radiation',
  'sequencing',
  'clinical_trial_search',
  'post_treatment',
  'survivorship',
  'prevention',
];

// ============================================================================
// Helper — Slug Generation
// ============================================================================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200);
}

// ============================================================================
// 1. Get Article
// ============================================================================

export async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { personalizations: true },
  });

  if (!article) return null;
  if (article.status !== 'published') return null;

  // Increment view count (fire-and-forget)
  prisma.article
    .update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {
      // Silently ignore view count increment failures
    });

  return article;
}

// ============================================================================
// 2. Get Articles (Filtered List)
// ============================================================================

export async function getArticles(filters?: {
  category?: string;
  cancerTypes?: string[];
  breastSubtypes?: string[];
  journeyStages?: string[];
  audienceLevel?: string;
}) {
  const where: any = { status: 'published' };

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.cancerTypes && filters.cancerTypes.length > 0) {
    where.cancerTypes = { hasSome: filters.cancerTypes };
  }

  if (filters?.breastSubtypes && filters.breastSubtypes.length > 0) {
    where.breastSubtypes = { hasSome: filters.breastSubtypes };
  }

  if (filters?.journeyStages && filters.journeyStages.length > 0) {
    where.journeyStages = { hasSome: filters.journeyStages };
  }

  if (filters?.audienceLevel) {
    where.audienceLevel = filters.audienceLevel;
  }

  return prisma.article.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
  });
}

// ============================================================================
// 3. Get Articles by Category
// ============================================================================

export async function getArticlesByCategory(category: string) {
  const articles = await getArticles({ category });
  const categoryMeta = ARTICLE_CATEGORIES[category] ?? {
    label: category,
    description: '',
  };

  return {
    articles,
    category: categoryMeta,
  };
}

// ============================================================================
// 4. Search Articles
// ============================================================================

export async function searchArticles(
  query: string,
  filters?: { category?: string; cancerTypes?: string[] },
) {
  const orConditions: any[] = [
    { title: { contains: query, mode: 'insensitive' } },
    { patientSummary: { contains: query, mode: 'insensitive' } },
    { keyTakeaways: { hasSome: [query] } },
  ];

  // Also search with the raw query as a partial match in keyTakeaways
  // Since keyTakeaways is a String[] array, we use hasSome for exact element match
  // and also search across title and patientSummary with ILIKE via contains

  const where: any = {
    status: 'published',
    OR: orConditions,
  };

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.cancerTypes && filters.cancerTypes.length > 0) {
    where.cancerTypes = { hasSome: filters.cancerTypes };
  }

  return prisma.article.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
  });
}

// ============================================================================
// 5. Get Related Articles
// ============================================================================

export async function getRelatedArticles(slug: string, limit = 3) {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return [];

  // Find articles with overlapping category, cancerTypes, or breastSubtypes
  const orConditions: any[] = [];

  // Same category
  orConditions.push({ category: article.category });

  // Overlapping cancer types
  if (article.cancerTypes.length > 0) {
    orConditions.push({ cancerTypes: { hasSome: article.cancerTypes } });
  }

  // Overlapping breast subtypes
  if (article.breastSubtypes.length > 0) {
    orConditions.push({ breastSubtypes: { hasSome: article.breastSubtypes } });
  }

  // Overlapping biomarkers
  if (article.biomarkers.length > 0) {
    orConditions.push({ biomarkers: { hasSome: article.biomarkers } });
  }

  // Overlapping journey stages
  if (article.journeyStages.length > 0) {
    orConditions.push({ journeyStages: { hasSome: article.journeyStages } });
  }

  return prisma.article.findMany({
    where: {
      status: 'published',
      slug: { not: slug },
      OR: orConditions,
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}

// ============================================================================
// 6. Get Glossary Terms
// ============================================================================

export async function getGlossaryTerms(category?: string) {
  const where: any = {};

  if (category) {
    where.category = category;
  }

  return prisma.glossaryTerm.findMany({
    where,
    orderBy: { term: 'asc' },
  });
}

// ============================================================================
// 7. Get Glossary Term
// ============================================================================

export async function getGlossaryTerm(slug: string) {
  return prisma.glossaryTerm.findUnique({
    where: { slug },
  });
}

// ============================================================================
// 8. Generate Article (Claude-powered)
// ============================================================================

export async function generateArticle(spec: {
  type: string;
  topic: string;
  primaryKeyword: string;
  cancerType?: string;
  category: string;
}) {
  // Check Redis cache for this exact spec
  const specKey = `learn:article:${spec.category}:${spec.primaryKeyword}`;
  const cached = await redis.get(specKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    return parsed;
  }

  const categoryMeta = ARTICLE_CATEGORIES[spec.category] ?? {
    label: spec.category,
    description: '',
  };

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: `You are a medical content specialist creating educational articles for cancer patients. Your content sits between institutional sources (ACS, NCI) and medical literature (PubMed) — medically rigorous but patient-accessible.

KEY REQUIREMENTS:
- Write at a health literacy level appropriate for motivated patients (not clinicians, not children)
- Cite specific data: survival rates, response rates, study names, approval dates
- Be honest about uncertainty — say "the data is limited" when it is
- Include actionable next steps — not just information, but what to DO with it
- Every statistic needs a source
- Patient summary should be 2-3 sentences a newly diagnosed person can understand in 10 seconds
- Key takeaways should be the 5-7 things someone remembers after reading
- Patient content sections should be thorough (3-6 paragraphs per section)
- Clinical content sections provide deeper detail for patients who want the science
- Action items are specific things the patient can do (ask questions, request tests, etc.)

ARTICLE TYPE: ${spec.type}
CATEGORY: ${categoryMeta.label} — ${categoryMeta.description}
${spec.cancerType ? `CANCER TYPE FOCUS: ${spec.cancerType}` : 'CANCER TYPE FOCUS: General oncology'}

Return ONLY valid JSON with this exact structure:
{
  "title": "string — compelling, specific, SEO-friendly title",
  "metaTitle": "string — max 70 chars, includes primary keyword",
  "metaDescription": "string — max 160 chars, compelling search snippet with primary keyword",
  "patientSummary": "string — 2-3 sentence plain-language summary",
  "keyTakeaways": ["string — 5-7 memorable takeaways"],
  "patientContent": [{"heading": "string", "body": "string — 3-6 paragraphs of patient-friendly content"}],
  "clinicalContent": [{"heading": "string", "body": "string — clinical detail for deeper readers"}],
  "actionItems": [{"text": "string — specific action", "link": "string or null — optional URL"}],
  "keyStatistics": [{"label": "string", "value": "string", "source": "string — study/org name + year"}],
  "references": [{"title": "string — study/article title", "url": "string — DOI or URL", "year": "number"}],
  "cancerTypes": ["string — applicable cancer types"],
  "breastSubtypes": ["string — applicable breast subtypes if relevant, empty array if not"],
  "biomarkers": ["string — relevant biomarkers"],
  "treatmentClasses": ["string — relevant treatment classes"],
  "journeyStages": ["string — applicable journey stages from: just_diagnosed, awaiting_pathology, treatment_planning, active_treatment, post_surgery, radiation, sequencing, clinical_trial_search, post_treatment, survivorship, prevention"],
  "audienceLevel": "string — beginner | intermediate | advanced",
  "secondaryKeywords": ["string — 5-10 related search terms"],
  "relatedArticleSlugs": ["string — suggested slugs for related articles that should exist"],
  "glossaryTerms": ["string — medical terms used that should have glossary entries"]
}`,
    messages: [
      {
        role: 'user',
        content: `Generate a comprehensive ${spec.type} article about: ${spec.topic}

Primary SEO keyword: ${spec.primaryKeyword}
${spec.cancerType ? `Cancer type focus: ${spec.cancerType}` : ''}
Category: ${spec.category}

Make the content thorough, evidence-based, and actionable. This article should be the best resource on the internet for a cancer patient searching for "${spec.primaryKeyword}".`,
      },
    ],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;

  let articleData: any;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    articleData = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    throw new Error('Failed to parse article content from Claude response');
  }

  // Generate slug from title
  const slug = generateSlug(articleData.title);

  // Build structured data for SEO (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: articleData.title,
    description: articleData.metaDescription,
    datePublished: null,
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'IISH',
    },
    publisher: {
      '@type': 'Organization',
      name: 'IISH',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://iish.com/learn/${spec.category}/${slug}`,
    },
    about: articleData.cancerTypes?.map((ct: string) => ({
      '@type': 'MedicalCondition',
      name: ct,
    })),
  };

  // Upsert article as draft
  const article = await prisma.article.upsert({
    where: { slug },
    update: {
      type: spec.type,
      title: articleData.title,
      metaTitle: (articleData.metaTitle || articleData.title).slice(0, 70),
      metaDescription: (articleData.metaDescription || articleData.patientSummary).slice(0, 160),
      patientSummary: articleData.patientSummary,
      keyTakeaways: articleData.keyTakeaways || [],
      patientContent: articleData.patientContent || [],
      clinicalContent: articleData.clinicalContent || [],
      actionItems: articleData.actionItems || [],
      keyStatistics: articleData.keyStatistics || [],
      references: articleData.references || [],
      cancerTypes: articleData.cancerTypes || [],
      breastSubtypes: articleData.breastSubtypes || [],
      biomarkers: articleData.biomarkers || [],
      treatmentClasses: articleData.treatmentClasses || [],
      journeyStages: articleData.journeyStages || [],
      audienceLevel: articleData.audienceLevel || 'beginner',
      category: spec.category,
      primaryKeyword: spec.primaryKeyword,
      secondaryKeywords: articleData.secondaryKeywords || [],
      structuredData,
      relatedArticleSlugs: articleData.relatedArticleSlugs || [],
      glossaryTerms: articleData.glossaryTerms || [],
    },
    create: {
      slug,
      type: spec.type,
      title: articleData.title,
      metaTitle: (articleData.metaTitle || articleData.title).slice(0, 70),
      metaDescription: (articleData.metaDescription || articleData.patientSummary).slice(0, 160),
      patientSummary: articleData.patientSummary,
      keyTakeaways: articleData.keyTakeaways || [],
      patientContent: articleData.patientContent || [],
      clinicalContent: articleData.clinicalContent || [],
      actionItems: articleData.actionItems || [],
      keyStatistics: articleData.keyStatistics || [],
      references: articleData.references || [],
      cancerTypes: articleData.cancerTypes || [],
      breastSubtypes: articleData.breastSubtypes || [],
      biomarkers: articleData.biomarkers || [],
      treatmentClasses: articleData.treatmentClasses || [],
      journeyStages: articleData.journeyStages || [],
      audienceLevel: articleData.audienceLevel || 'beginner',
      category: spec.category,
      primaryKeyword: spec.primaryKeyword,
      secondaryKeywords: articleData.secondaryKeywords || [],
      structuredData,
      relatedArticleSlugs: articleData.relatedArticleSlugs || [],
      glossaryTerms: articleData.glossaryTerms || [],
      status: 'draft',
    },
  });

  // Cache the spec/response for 1 day
  await redis.set(specKey, JSON.stringify(article), 'EX', 24 * 60 * 60);

  return article;
}

// ============================================================================
// 9. Generate Article Batch
// ============================================================================

export async function generateArticleBatch(
  specs: Array<{
    type: string;
    topic: string;
    primaryKeyword: string;
    cancerType?: string;
    category: string;
  }>,
) {
  const results: any[] = [];

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    console.log(
      `[LEARN] Generating article ${i + 1}/${specs.length}: "${spec.topic}" (${spec.category})`,
    );

    try {
      const article = await generateArticle(spec);
      results.push({ success: true, article });
      console.log(
        `[LEARN] Article ${i + 1}/${specs.length} generated: ${article.slug}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[LEARN] Article ${i + 1}/${specs.length} failed: ${message}`,
      );
      results.push({ success: false, error: message, spec });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  console.log(
    `[LEARN] Batch complete: ${succeeded} succeeded, ${failed} failed out of ${specs.length} total`,
  );

  return results;
}

// ============================================================================
// 10. Publish Article
// ============================================================================

export async function publishArticle(id: string) {
  const article = await prisma.article.update({
    where: { id },
    data: {
      status: 'published',
      publishedAt: new Date(),
    },
  });

  // Update structured data with publish date
  if (article.structuredData) {
    const sd = article.structuredData as any;
    sd.datePublished = article.publishedAt?.toISOString();
    sd.dateModified = article.publishedAt?.toISOString();

    await prisma.article.update({
      where: { id },
      data: { structuredData: sd },
    });
  }

  // Invalidate any cached article data
  const specKey = `learn:article:${article.category}:${article.primaryKeyword}`;
  await redis.del(specKey);

  return article;
}

// ============================================================================
// 11. Generate Personalized Context (Claude-powered)
// ============================================================================

export async function generatePersonalizedContext(
  patientId: string,
  slug: string,
) {
  // Check Redis cache
  const cacheKey = `learn:personal:${patientId}:${slug}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Load article + patient
  const [article, patient] = await Promise.all([
    prisma.article.findUnique({ where: { slug } }),
    prisma.patient.findUnique({ where: { id: patientId } }),
  ]);

  if (!article) throw new Error('Article not found');
  if (!patient) throw new Error('Patient not found');

  const profile = (patient.profile as PatientProfile | null) ?? {};

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: `You are a compassionate oncology educator. Generate a brief personalized context paragraph (2-4 sentences) that connects an educational article to a specific patient's situation.

KEY RULES:
- Be warm and supportive, not clinical
- Reference the patient's specific diagnosis, treatment, or stage when relevant
- Explain WHY this article matters for them specifically
- Do not repeat the article content — just bridge it to their situation
- If the article is not particularly relevant to the patient, say so gently and explain what parts might still be useful
- NEVER announce or speculate about recurrence
- Use phrases like "Based on your [specific thing]..." or "Given that you're [stage/treatment]..."

Return ONLY a plain text paragraph (2-4 sentences). No JSON, no markdown, no quotes.`,
    messages: [
      {
        role: 'user',
        content: `Article: "${article.title}"
Article summary: ${article.patientSummary}
Article category: ${article.category}
Article cancer types: ${article.cancerTypes.join(', ') || 'general'}
Article biomarkers: ${article.biomarkers.join(', ') || 'none specific'}
Article journey stages: ${article.journeyStages.join(', ') || 'all stages'}

Patient context:
- Cancer type: ${(profile as any)?.cancerType || 'not specified'}
- Cancer subtype: ${(profile as any)?.cancerSubtype || 'not specified'}
- Stage: ${(profile as any)?.stage || 'not specified'}
- Treatment plan: ${(profile as any)?.priorTreatments?.map((t: any) => t.name || t.type || String(t)).join(', ') || (profile as any)?.treatmentPlan || 'not specified'}
- Biomarkers: ${JSON.stringify((profile as any)?.receptorStatus || {})}

Generate 2-4 sentences connecting this article to the patient's specific situation.`,
      },
    ],
  });

  const personalizedContent = (
    response.content[0] as { type: 'text'; text: string }
  ).text.trim();

  // Upsert ArticlePersonalization
  const personalization = await prisma.articlePersonalization.upsert({
    where: {
      patientId_articleId: {
        patientId,
        articleId: article.id,
      },
    },
    update: {
      personalizedContent,
      generatedAt: new Date(),
    },
    create: {
      patientId,
      articleId: article.id,
      personalizedContent,
      generatedAt: new Date(),
    },
  });

  const result = {
    personalizedContent,
    personalizationId: personalization.id,
    articleId: article.id,
    generatedAt: personalization.generatedAt,
  };

  // Cache for 7 days
  await redis.set(cacheKey, JSON.stringify(result), 'EX', 7 * 24 * 60 * 60);

  return result;
}

// ============================================================================
// 12. Generate Reading Plan (Claude-powered)
// ============================================================================

export async function generateReadingPlan(patientId: string) {
  // Check Redis cache
  const cacheKey = `learn:plan:${patientId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Load patient + all published articles
  const [patient, articles] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.article.findMany({
      where: { status: 'published' },
      select: {
        slug: true,
        title: true,
        category: true,
        cancerTypes: true,
        breastSubtypes: true,
        biomarkers: true,
        journeyStages: true,
        audienceLevel: true,
        patientSummary: true,
      },
      orderBy: { publishedAt: 'desc' },
    }),
  ]);

  if (!patient) throw new Error('Patient not found');

  if (articles.length === 0) {
    return { readNow: [], readSoon: [], whenReady: [] };
  }

  const profile = (patient.profile as PatientProfile | null) ?? {};

  // Build a compact article list for the prompt
  const articleSummaries = articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    cancerTypes: a.cancerTypes,
    breastSubtypes: a.breastSubtypes,
    biomarkers: a.biomarkers,
    journeyStages: a.journeyStages,
    audienceLevel: a.audienceLevel,
    summary: a.patientSummary.slice(0, 150),
  }));

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: `You are a compassionate oncology educator creating a personalized reading plan for a cancer patient. Organize the available articles into three priority tiers based on the patient's current situation.

KEY RULES:
- "readNow" = immediately relevant to their current situation (diagnosis, active treatment, upcoming decisions)
- "readSoon" = will be relevant in the next few weeks or is good background knowledge
- "whenReady" = less urgent but valuable for future stages or deeper understanding
- Each item needs a brief, personalized reason (1 sentence) explaining why it's recommended
- Priority within each tier: 1 = most important
- Maximum 5 articles in readNow, 8 in readSoon, rest in whenReady
- Skip articles that are clearly irrelevant (e.g., prostate cancer articles for a breast cancer patient)
- Be thoughtful about emotional timing — don't put recurrence-related articles in "readNow" for a newly diagnosed patient

Return ONLY valid JSON with this exact structure:
{
  "readNow": [{"articleSlug": "string", "articleTitle": "string", "reason": "string", "priority": number}],
  "readSoon": [{"articleSlug": "string", "articleTitle": "string", "reason": "string", "priority": number}],
  "whenReady": [{"articleSlug": "string", "articleTitle": "string", "reason": "string", "priority": number}]
}`,
    messages: [
      {
        role: 'user',
        content: `Patient context:
- Cancer type: ${(profile as any)?.cancerType || 'not specified'}
- Cancer subtype: ${(profile as any)?.cancerSubtype || 'not specified'}
- Stage: ${(profile as any)?.stage || 'not specified'}
- Age: ${(profile as any)?.age || 'not specified'}
- Treatment plan: ${(profile as any)?.priorTreatments?.map((t: any) => t.name || t.type || String(t)).join(', ') || (profile as any)?.treatmentPlan || 'not specified'}
- Biomarkers: ${JSON.stringify((profile as any)?.receptorStatus || {})}

Available articles (${articleSummaries.length} total):
${JSON.stringify(articleSummaries, null, 1)}

Create a personalized reading plan for this patient. Prioritize articles that match their cancer type, stage, current treatment decisions, and biomarkers.`,
      },
    ],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;

  let plan: {
    readNow: { articleSlug: string; articleTitle: string; reason: string; priority: number }[];
    readSoon: { articleSlug: string; articleTitle: string; reason: string; priority: number }[];
    whenReady: { articleSlug: string; articleTitle: string; reason: string; priority: number }[];
  };

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    plan = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    // Fallback: return all articles in readSoon, sorted by category relevance
    plan = {
      readNow: [],
      readSoon: articles.slice(0, 8).map((a, i) => ({
        articleSlug: a.slug,
        articleTitle: a.title,
        reason: 'Recommended based on your profile.',
        priority: i + 1,
      })),
      whenReady: articles.slice(8).map((a, i) => ({
        articleSlug: a.slug,
        articleTitle: a.title,
        reason: 'Additional reading when you are ready.',
        priority: i + 1,
      })),
    };
  }

  // Sort each tier by priority
  plan.readNow.sort((a, b) => a.priority - b.priority);
  plan.readSoon.sort((a, b) => a.priority - b.priority);
  plan.whenReady.sort((a, b) => a.priority - b.priority);

  // Cache for 7 days
  await redis.set(cacheKey, JSON.stringify(plan), 'EX', 7 * 24 * 60 * 60);

  return plan;
}

// ============================================================================
// 13. Get Article for SEO
// ============================================================================

export async function getArticleForSeo(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      metaTitle: true,
      metaDescription: true,
      structuredData: true,
      publishedAt: true,
      slug: true,
      title: true,
      category: true,
    },
  });

  if (!article) return null;

  return article;
}

// ============================================================================
// 14. Get All Published Slugs
// ============================================================================

export async function getAllPublishedSlugs() {
  return prisma.article.findMany({
    where: { status: 'published' },
    select: {
      slug: true,
      category: true,
    },
    orderBy: { publishedAt: 'desc' },
  });
}
