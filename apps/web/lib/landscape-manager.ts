import { prisma } from './db';
import { redis } from './redis';
import { anthropic, CLAUDE_MODEL } from './ai';
import { profileToSubtype, getCurrentDrugs } from './feed-personalization';
import type { PatientProfile } from '@oncovax/shared';

// ============================================================================
// Constants
// ============================================================================

const MATURITY_TIERS = ['T1', 'T2', 'T3', 'T4', 'T5'] as const;

const DOMAINS = [
  'treatment', 'detection', 'prevention', 'survivorship',
  'quality_of_life', 'genetics', 'ai_technology', 'epidemiology', 'basic_science',
] as const;

const BREAST_SUBTYPES = [
  'er_positive_her2_negative', 'her2_positive', 'her2_low', 'her2_ultralow',
  'triple_negative', 'inflammatory', 'dcis', 'lobular', 'all_subtypes', 'not_specified',
] as const;

const TREATMENT_CLASSES_TOP = [
  'immunotherapy', 'adc', 'checkpoint_inhibitor', 'cancer_vaccine', 'targeted_small_molecule',
  'cdk_inhibitor', 'parp_inhibitor', 'her2_targeted', 'endocrine_therapy', 'chemotherapy',
] as const;

const SUBTYPE_LABELS: Record<string, string> = {
  er_positive_her2_negative: 'ER+/HER2- (Luminal A/B)',
  her2_positive: 'HER2-Positive',
  her2_low: 'HER2-Low',
  her2_ultralow: 'HER2-Ultralow',
  triple_negative: 'Triple-Negative (TNBC)',
  inflammatory: 'Inflammatory',
  dcis: 'DCIS (Non-Invasive)',
  lobular: 'Lobular',
  all_subtypes: 'All Subtypes',
  not_specified: 'Not Specified',
};

// ============================================================================
// 1a. getLandscapeOverview — Aggregate counts across all dimensions
// ============================================================================

export async function getLandscapeOverview() {
  const baseWhere = { classificationStatus: 'complete' as const };

  // Count total
  const totalItems = await prisma.researchItem.count({ where: baseWhere });

  // Count per maturity tier
  const maturityDistribution: Record<string, number> = {};
  for (const tier of MATURITY_TIERS) {
    maturityDistribution[tier] = await prisma.researchItem.count({
      where: { ...baseWhere, maturityTier: tier },
    });
  }

  // Count per domain
  const domainDistribution: Record<string, number> = {};
  for (const d of DOMAINS) {
    domainDistribution[d] = await prisma.researchItem.count({
      where: { ...baseWhere, domains: { hasSome: [d] } },
    });
  }

  // Count per subtype
  const subtypeDistribution: Record<string, number> = {};
  for (const s of BREAST_SUBTYPES) {
    subtypeDistribution[s] = await prisma.researchItem.count({
      where: { ...baseWhere, breastSubtypes: { hasSome: [s] } },
    });
  }

  // Count per treatment class (top 10)
  const treatmentClassDistribution: Record<string, number> = {};
  for (const c of TREATMENT_CLASSES_TOP) {
    treatmentClassDistribution[c] = await prisma.researchItem.count({
      where: { ...baseWhere, treatmentClasses: { hasSome: [c] } },
    });
  }

  // Recent T1/T2 highlights
  const recentHighlights = await prisma.researchItem.findMany({
    where: { ...baseWhere, maturityTier: { in: ['T1', 'T2'] } },
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });

  return {
    totalItems,
    maturityDistribution,
    domainDistribution,
    subtypeDistribution,
    treatmentClassDistribution,
    recentHighlights,
    lastUpdated: new Date().toISOString(),
  };
}

// ============================================================================
// 1b. getSubtypeLandscape — Focused landscape for a single breast subtype
// ============================================================================

export async function getSubtypeLandscape(subtype: string) {
  const baseWhere = {
    classificationStatus: 'complete' as const,
    breastSubtypes: { hasSome: [subtype] },
  };

  const totalItems = await prisma.researchItem.count({ where: baseWhere });

  // Maturity distribution for this subtype
  const maturityDistribution: Record<string, number> = {};
  for (const tier of MATURITY_TIERS) {
    maturityDistribution[tier] = await prisma.researchItem.count({
      where: { ...baseWhere, maturityTier: tier },
    });
  }

  // Domain distribution for this subtype
  const domainDistribution: Record<string, number> = {};
  for (const d of DOMAINS) {
    domainDistribution[d] = await prisma.researchItem.count({
      where: { ...baseWhere, domains: { hasSome: [d] } },
    });
  }

  // Tier buckets
  const availableNow = await prisma.researchItem.findMany({
    where: { ...baseWhere, maturityTier: 'T1' },
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });
  const expectedSoon = await prisma.researchItem.findMany({
    where: { ...baseWhere, maturityTier: 'T2' },
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });
  const inTrials = await prisma.researchItem.findMany({
    where: { ...baseWhere, maturityTier: 'T3' },
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });
  const earlyResearch = await prisma.researchItem.findMany({
    where: { ...baseWhere, maturityTier: { in: ['T4', 'T5'] } },
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });

  // Treatment pipeline for this subtype
  const topDrugs = await getTreatmentPipeline(subtype);

  // Cached standard of care summary
  const socCacheKey = `landscape:soc:${subtype}`;
  const cachedSoc = await redis.get(socCacheKey);
  const standardOfCare = cachedSoc ? JSON.parse(cachedSoc) : null;

  return {
    subtype,
    subtypeLabel: SUBTYPE_LABELS[subtype] ?? subtype,
    totalItems,
    maturityDistribution,
    domainDistribution,
    standardOfCare,
    availableNow,
    expectedSoon,
    inTrials,
    earlyResearch,
    topDrugs,
  };
}

// ============================================================================
// 1c. getTreatmentPipeline — Drugs grouped by most advanced maturity tier
// ============================================================================

export async function getTreatmentPipeline(subtype?: string) {
  const where: any = { classificationStatus: 'complete' };
  if (subtype) {
    where.breastSubtypes = { hasSome: [subtype] };
  }

  // Fetch items that have drug names
  const items = await prisma.researchItem.findMany({
    where: { ...where, drugNames: { isEmpty: false } },
    select: {
      id: true,
      title: true,
      drugNames: true,
      maturityTier: true,
      treatmentClasses: true,
      publishedAt: true,
    },
  });

  // Group by drug name
  const drugMap = new Map<string, {
    drugName: string;
    maturityTier: string;
    treatmentClass: string;
    itemCount: number;
    latestItemId: string;
    latestItemTitle: string;
    latestPublishedAt: string | null;
  }>();

  const tierRank: Record<string, number> = { T1: 1, T2: 2, T3: 3, T4: 4, T5: 5 };

  for (const item of items) {
    for (const drug of item.drugNames) {
      const existing = drugMap.get(drug);
      const tier = item.maturityTier ?? 'T5';
      const pubDate = item.publishedAt?.toISOString() ?? null;

      if (!existing) {
        drugMap.set(drug, {
          drugName: drug,
          maturityTier: tier,
          treatmentClass: item.treatmentClasses[0] ?? 'other',
          itemCount: 1,
          latestItemId: item.id,
          latestItemTitle: item.title,
          latestPublishedAt: pubDate,
        });
      } else {
        existing.itemCount++;
        // Keep most advanced tier
        if ((tierRank[tier] ?? 5) < (tierRank[existing.maturityTier] ?? 5)) {
          existing.maturityTier = tier;
        }
        // Keep latest published item
        if (pubDate && (!existing.latestPublishedAt || pubDate > existing.latestPublishedAt)) {
          existing.latestItemId = item.id;
          existing.latestItemTitle = item.title;
          existing.latestPublishedAt = pubDate;
        }
      }
    }
  }

  // Sort by tier (T1 first) then item count DESC
  return Array.from(drugMap.values())
    .sort((a, b) => {
      const tierDiff = (tierRank[a.maturityTier] ?? 5) - (tierRank[b.maturityTier] ?? 5);
      return tierDiff !== 0 ? tierDiff : b.itemCount - a.itemCount;
    })
    .slice(0, 20);
}

// ============================================================================
// 1d. getRecentDevelopments — T1/T2 items from last N days
// ============================================================================

export async function getRecentDevelopments(subtype?: string, days?: number) {
  const effectiveDays = days ?? 30;
  const since = new Date(Date.now() - effectiveDays * 24 * 60 * 60 * 1000);

  const where: any = {
    classificationStatus: 'complete',
    maturityTier: { in: ['T1', 'T2'] },
    publishedAt: { gte: since },
  };
  if (subtype) {
    where.breastSubtypes = { hasSome: [subtype] };
  }

  return prisma.researchItem.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    take: 10,
  });
}

// ============================================================================
// 1e. generateStandardOfCareSummary — Claude SOC summary for a subtype
// ============================================================================

export async function generateStandardOfCareSummary(subtype: string) {
  // Check Redis cache
  const cacheKey = `landscape:soc:${subtype}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Get T1/T2 items for this subtype for context
  const items = await prisma.researchItem.findMany({
    where: {
      classificationStatus: 'complete',
      breastSubtypes: { hasSome: [subtype] },
      maturityTier: { in: ['T1', 'T2'] },
    },
    orderBy: { publishedAt: 'desc' },
    take: 15,
    select: { title: true, maturityTier: true, drugNames: true, patientSummary: true },
  });

  const subtypeLabel = SUBTYPE_LABELS[subtype] ?? subtype;
  const itemContext = items
    .map(i => `- [${i.maturityTier}] ${i.title}${i.drugNames.length > 0 ? ` (${i.drugNames.join(', ')})` : ''}`)
    .join('\n');

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: `You are a clinical oncology expert summarizing the standard of care and research pipeline for a specific breast cancer subtype. Be accurate, evidence-based, and write for a patient audience (6th-grade reading level) with clinical precision.

Return ONLY valid JSON with this exact structure:
{
  "currentSOC": "string — current standard of care treatment(s), written clearly",
  "whatsChanging": "string — what's actively changing in practice based on recent T1 data",
  "whatsComing": "string — what's expected soon based on late-stage T2 trials",
  "whatsBeingExplored": "string — promising early research directions"
}`,
    messages: [{
      role: 'user',
      content: `Subtype: ${subtypeLabel}

Recent T1/T2 research items:
${itemContext || '(No recent T1/T2 items found for this subtype.)'}

Generate a standard of care summary for this breast cancer subtype.`,
    }],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;
  let summary: any;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    summary = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    summary = {
      currentSOC: 'Unable to generate summary automatically.',
      whatsChanging: '',
      whatsComing: '',
      whatsBeingExplored: '',
    };
  }

  const result = {
    subtype,
    ...summary,
    generatedAt: new Date().toISOString(),
  };

  // Cache for 14 days
  await redis.set(cacheKey, JSON.stringify(result), 'EX', 14 * 24 * 60 * 60);

  return result;
}

// ============================================================================
// 1f. checkTranslatorUpdates — New T1/T2 items since translation was generated
// ============================================================================

export async function checkTranslatorUpdates(patientId: string) {
  // Estimate when translation was last generated by checking Redis TTL
  const translationKey = `translation:${patientId}`;
  const ttl = await redis.ttl(translationKey);

  // If no cache exists or expired, no updates to report
  if (ttl <= 0) {
    return { hasUpdates: false, items: [], count: 0, since: '' };
  }

  // Original TTL is 24h (86400s). Age = 86400 - remaining
  const ageSeconds = 86400 - ttl;
  const sinceDate = new Date(Date.now() - ageSeconds * 1000);

  // Load patient profile
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { profile: true },
  });
  if (!patient?.profile) {
    return { hasUpdates: false, items: [], count: 0, since: '' };
  }

  const profile = patient.profile as unknown as PatientProfile;
  const subtype = profileToSubtype(profile);
  const drugs = getCurrentDrugs(profile);

  // Build query: T1/T2 items published after translation date, matching subtype or drugs
  const orConditions: any[] = [];
  if (subtype) {
    orConditions.push({ breastSubtypes: { hasSome: [subtype] } });
  }
  if (drugs.length > 0) {
    orConditions.push({ drugNames: { hasSome: drugs } });
  }

  if (orConditions.length === 0) {
    return { hasUpdates: false, items: [], count: 0, since: sinceDate.toISOString() };
  }

  const items = await prisma.researchItem.findMany({
    where: {
      classificationStatus: 'complete',
      maturityTier: { in: ['T1', 'T2'] },
      publishedAt: { gte: sinceDate },
      OR: orConditions,
    },
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });

  const count = await prisma.researchItem.count({
    where: {
      classificationStatus: 'complete',
      maturityTier: { in: ['T1', 'T2'] },
      publishedAt: { gte: sinceDate },
      OR: orConditions,
    },
  });

  return {
    hasUpdates: count > 0,
    items,
    count,
    since: sinceDate.toISOString(),
  };
}

// ============================================================================
// 1g. checkFinancialUpdates — New FDA approvals that may create PAP opportunities
// ============================================================================

export async function checkFinancialUpdates(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { profile: true },
  });
  if (!patient?.profile) {
    return { newApprovals: [], hasPAPOpportunities: false };
  }

  const profile = patient.profile as unknown as PatientProfile;
  const drugs = getCurrentDrugs(profile);

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const where: any = {
    classificationStatus: 'complete',
    sourceType: 'fda',
    maturityTier: 'T1',
    practiceImpact: 'practice_changing',
    publishedAt: { gte: since },
  };

  // Cross-reference with patient's current drugs
  if (drugs.length > 0) {
    where.drugNames = { hasSome: drugs };
  }

  const newApprovals = await prisma.researchItem.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });

  return {
    newApprovals,
    hasPAPOpportunities: newApprovals.length > 0,
  };
}

// ============================================================================
// 1h. checkSurvivorshipUpdates — Survivorship + ctDNA research for patient
// ============================================================================

export async function checkSurvivorshipUpdates(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { profile: true },
  });
  if (!patient?.profile) {
    return { lateEffectsItems: [], ctdnaItems: [], hasUpdates: false };
  }

  const profile = patient.profile as unknown as PatientProfile;
  const subtype = profileToSubtype(profile);
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // Late effects / survivorship items
  const lateEffectsWhere: any = {
    classificationStatus: 'complete',
    domains: { hasSome: ['survivorship', 'quality_of_life'] },
    maturityTier: { in: ['T1', 'T2'] },
    publishedAt: { gte: since },
  };
  if (subtype) {
    lateEffectsWhere.breastSubtypes = { hasSome: [subtype] };
  }

  const lateEffectsItems = await prisma.researchItem.findMany({
    where: lateEffectsWhere,
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });

  // ctDNA monitoring items
  const ctdnaWhere: any = {
    classificationStatus: 'complete',
    treatmentClasses: { hasSome: ['ctdna_monitoring'] },
    maturityTier: { in: ['T1', 'T2'] },
    publishedAt: { gte: since },
  };

  const ctdnaItems = await prisma.researchItem.findMany({
    where: ctdnaWhere,
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });

  return {
    lateEffectsItems,
    ctdnaItems,
    hasUpdates: lateEffectsItems.length > 0 || ctdnaItems.length > 0,
  };
}

// ============================================================================
// 1i. getLandscapeHighlights — Quick T1/T2 highlights
// ============================================================================

export async function getLandscapeHighlights(limit?: number) {
  return prisma.researchItem.findMany({
    where: {
      classificationStatus: 'complete',
      maturityTier: { in: ['T1', 'T2'] },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit ?? 5,
  });
}

// ============================================================================
// 1j. getSubtypeLabel — Display label for snake_case subtype
// ============================================================================

export function getSubtypeLabel(subtype: string): string {
  return SUBTYPE_LABELS[subtype] ?? subtype;
}
