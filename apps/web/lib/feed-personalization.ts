import { prisma } from './db';
import { redis } from './redis';
import { anthropic, CLAUDE_MODEL } from './ai';
import type { PatientProfile } from '@iish/shared';

// ============================================================================
// Profile extraction helpers
// ============================================================================

/**
 * Maps receptor status to I2 snake_case breast subtype.
 */
export function profileToSubtype(profile: PatientProfile): string | null {
  const er = profile.receptorStatus?.er?.status?.toLowerCase();
  const pr = profile.receptorStatus?.pr?.status?.toLowerCase();
  const her2 = profile.receptorStatus?.her2?.status?.toLowerCase();

  if (!er && !pr && !her2) return null;

  const erPos = er === 'positive';
  const prPos = pr === 'positive';
  const her2Pos = her2 === 'positive';
  const erNeg = er === 'negative';
  const prNeg = pr === 'negative';
  const her2Neg = her2 === 'negative';

  // Triple-negative
  if (erNeg && prNeg && (her2Neg || !her2Pos)) return 'tnbc';
  // HR+/HER2-
  if ((erPos || prPos) && her2Neg) return 'hr_positive_her2_negative';
  // HR-/HER2+
  if (erNeg && prNeg && her2Pos) return 'hr_negative_her2_positive';
  // HER2+
  if (her2Pos) return 'her2_positive';
  // HR+
  if (erPos || prPos) return 'hr_positive';

  return null;
}

/**
 * Extracts all known biomarker names from profile.
 */
export function extractPatientBiomarkers(profile: PatientProfile): string[] {
  const markers: string[] = [];

  // Explicit biomarkers
  if (profile.biomarkers) {
    markers.push(...Object.keys(profile.biomarkers));
  }

  // Receptor status as biomarkers
  if (profile.receptorStatus?.er) markers.push('ER');
  if (profile.receptorStatus?.pr) markers.push('PR');
  if (profile.receptorStatus?.her2) markers.push('HER2');

  // Genomic alterations
  if (profile.genomicData?.alterations) {
    for (const alt of profile.genomicData.alterations) {
      if (alt.gene && !markers.includes(alt.gene)) markers.push(alt.gene);
    }
  }

  // Genomic biomarkers
  if (profile.genomicData?.biomarkers) {
    const gb = profile.genomicData.biomarkers;
    if (gb.tmb) markers.push('TMB');
    if (gb.msi) markers.push('MSI');
    if (gb.pdl1) markers.push('PD-L1');
    if (gb.hrd) markers.push('HRD');
  }

  return markers;
}

/**
 * Extracts current drug names from active treatments.
 */
export function getCurrentDrugs(profile: PatientProfile): string[] {
  if (!profile.priorTreatments) return [];
  const now = new Date();
  const drugs: string[] = [];

  for (const tx of profile.priorTreatments) {
    const isActive = !tx.endDate || new Date(tx.endDate) > now;
    if (isActive) {
      // Split multi-drug regimens
      const names = tx.name.split(/\s*\+\s*/);
      for (const n of names) {
        const trimmed = n.trim();
        if (trimmed && !drugs.includes(trimmed)) drugs.push(trimmed);
      }
    }
  }

  return drugs;
}

/**
 * Maps AJCC stage to I2 treatment stage enum values.
 */
export function mapStageToTreatmentStage(stage: string | undefined): string[] {
  if (!stage) return [];
  const s = stage.toUpperCase().replace(/\s+/g, '');

  if (s.startsWith('IV') || s === '4') return ['metastatic', 'palliative', 'post_progression'];
  if (s.startsWith('III') || s === '3') return ['adjuvant', 'neoadjuvant', 'post_progression'];
  if (s.startsWith('II') || s.startsWith('I') || s === '1' || s === '2') return ['adjuvant', 'neoadjuvant'];

  return [];
}

// ============================================================================
// Relevance scoring
// ============================================================================

/**
 * Calculates 0-100 relevance score for an item against a patient profile.
 */
export function calculateRelevanceScore(
  item: {
    cancerTypes: string[];
    breastSubtypes: string[];
    biomarkerRelevance: string[];
    treatmentStages: string[];
    drugNames: string[];
    maturityTier: string | null;
    practiceImpact: string | null;
  },
  profile: PatientProfile,
): number {
  let score = 0;

  // 1. Cancer type match (30 pts)
  const patientCancer = profile.cancerTypeNormalized?.toLowerCase();
  if (patientCancer && item.cancerTypes?.length > 0) {
    const itemCancers = item.cancerTypes.map(c => c.toLowerCase());
    if (itemCancers.includes(patientCancer)) {
      score += 30;
    } else if (itemCancers.includes('pan_cancer') || itemCancers.includes('solid_tumors')) {
      score += 15;
    }
  }

  // 2. Subtype match (25 pts)
  const subtype = profileToSubtype(profile);
  if (subtype && item.breastSubtypes?.length > 0) {
    const itemSubtypes = item.breastSubtypes.map(s => s.toLowerCase());
    if (itemSubtypes.includes(subtype)) {
      score += 25;
    } else if (itemSubtypes.includes('all_subtypes')) {
      score += 12;
    }
  }

  // 3. Biomarker match (20 pts, proportional, capped at 2 matches)
  const patientBiomarkers = extractPatientBiomarkers(profile).map(b => b.toLowerCase());
  if (patientBiomarkers.length > 0 && item.biomarkerRelevance?.length > 0) {
    const itemBiomarkers = item.biomarkerRelevance.map(b => b.toLowerCase());
    const matches = patientBiomarkers.filter(b => itemBiomarkers.includes(b)).length;
    score += Math.min(matches, 2) * 10; // 10 pts per match, max 20
  }

  // 4. Treatment stage match (15 pts)
  const patientStages = mapStageToTreatmentStage(profile.stage);
  if (patientStages.length > 0 && item.treatmentStages?.length > 0) {
    const itemStages = item.treatmentStages.map(s => s.toLowerCase());
    if (patientStages.some(s => itemStages.includes(s))) {
      score += 15;
    }
  }

  // 5. Current drug match (10 pts)
  const currentDrugs = getCurrentDrugs(profile).map(d => d.toLowerCase());
  const itemDrugs = (item.drugNames ?? []).map(d => d.toLowerCase());
  const drugMatch = currentDrugs.some(d => itemDrugs.includes(d));
  if (drugMatch) {
    score += 10;
  }

  // 6. Maturity boost
  if (item.maturityTier === 'T1') score += 10;
  else if (item.maturityTier === 'T2') score += 5;

  // 7. Safety alert for current drug → force 100
  if (item.practiceImpact === 'safety_alert' && drugMatch) {
    return 100;
  }

  // 8. Negative result for current drug → +15
  if (item.practiceImpact === 'negative' && drugMatch) {
    score += 15;
  }

  return Math.min(score, 100);
}

// ============================================================================
// Batch computation
// ============================================================================

/**
 * Compute relevance scores for all classified items for a user.
 */
export async function computeRelevanceScores(
  userId: string,
): Promise<{ computed: number; skipped: number }> {
  // Load patient profile
  const patient = await prisma.patient.findFirst({
    where: { userId },
    select: { profile: true },
  });
  if (!patient?.profile) return { computed: 0, skipped: 0 };
  const profile = patient.profile as unknown as PatientProfile;

  // Get all classified items
  const items = await prisma.researchItem.findMany({
    where: { classificationStatus: 'complete' },
    select: {
      id: true,
      cancerTypes: true,
      breastSubtypes: true,
      biomarkerRelevance: true,
      treatmentStages: true,
      drugNames: true,
      maturityTier: true,
      practiceImpact: true,
    },
  });

  // Get existing scores
  const existing = await prisma.feedRelevance.findMany({
    where: { userId },
    select: { itemId: true },
  });
  const scored = new Set(existing.map(e => e.itemId));

  let computed = 0;
  const toCreate: { userId: string; itemId: string; relevanceScore: number }[] = [];

  for (const item of items) {
    if (scored.has(item.id)) continue;
    const score = calculateRelevanceScore(item, profile);
    toCreate.push({ userId, itemId: item.id, relevanceScore: score });
    computed++;
  }

  // Batch upsert in chunks
  if (toCreate.length > 0) {
    const CHUNK = 100;
    for (let i = 0; i < toCreate.length; i += CHUNK) {
      const chunk = toCreate.slice(i, i + CHUNK);
      await Promise.all(
        chunk.map(c =>
          prisma.feedRelevance.upsert({
            where: { userId_itemId: { userId: c.userId, itemId: c.itemId } },
            create: c,
            update: { relevanceScore: c.relevanceScore },
          }),
        ),
      );
    }
  }

  return { computed, skipped: items.length - computed };
}

// ============================================================================
// Personalized feed
// ============================================================================

interface FeedOptions {
  maturityTiers?: string[];
  domains?: string[];
  treatmentClasses?: string[];
  practiceImpact?: string;
  limit?: number;
  offset?: number;
}

/**
 * Returns a personalized, relevance-ranked feed for a user.
 */
export async function getPersonalizedFeed(
  userId: string,
  options?: FeedOptions,
): Promise<{ items: any[]; total: number; hasMore: boolean }> {
  // Ensure scores exist
  const existing = await prisma.feedRelevance.count({ where: { userId } });
  if (existing === 0) {
    await computeRelevanceScores(userId);
  }

  // Load feed config
  const config = await getUserFeedConfig(userId);

  const limit = options?.limit ?? 30;
  const offset = options?.offset ?? 0;

  // Build item-level where clause
  const itemWhere: any = {
    classificationStatus: 'complete',
    OR: [
      { retractionStatus: null },
      { retractionStatus: { not: 'retracted' } },
    ],
  };

  if (options?.maturityTiers?.length) itemWhere.maturityTier = { in: options.maturityTiers };
  if (options?.domains?.length) itemWhere.domains = { hasSome: options.domains };
  if (options?.treatmentClasses?.length) itemWhere.treatmentClasses = { hasSome: options.treatmentClasses };
  if (options?.practiceImpact) itemWhere.practiceImpact = options.practiceImpact;
  if (!config.showPreclinical) itemWhere.maturityTier = { notIn: ['T4', 'T5'] };
  if (!config.showNegativeResults) {
    if (itemWhere.practiceImpact) {
      // User already filtering by impact — respect that
    } else {
      itemWhere.practiceImpact = { not: 'negative' };
    }
  }

  // Query with join
  const [relevances, total] = await Promise.all([
    prisma.feedRelevance.findMany({
      where: {
        userId,
        dismissed: false,
        item: itemWhere,
      },
      include: {
        item: true,
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { item: { publishedAt: 'desc' } },
      ],
      skip: offset,
      take: limit,
    }),
    prisma.feedRelevance.count({
      where: {
        userId,
        dismissed: false,
        item: itemWhere,
      },
    }),
  ]);

  return {
    items: relevances.map(r => ({
      item: r.item,
      relevanceScore: r.relevanceScore,
      personalizedNote: r.personalizedNote,
      viewed: r.viewed,
      saved: r.saved,
      dismissed: r.dismissed,
    })),
    total,
    hasMore: offset + limit < total,
  };
}

// ============================================================================
// Personalized note (lazy Claude generation)
// ============================================================================

/**
 * Generates a personalized note for a research item for a specific user.
 * Returns cached note if available.
 */
export async function generatePersonalizedNote(
  itemId: string,
  userId: string,
): Promise<{ itemId: string; note: string }> {
  // Check DB cache
  const existing = await prisma.feedRelevance.findUnique({
    where: { userId_itemId: { userId, itemId } },
    select: { personalizedNote: true },
  });
  if (existing?.personalizedNote) {
    return { itemId, note: existing.personalizedNote };
  }

  // Check Redis cache
  const cacheKey = `intel:personalize:${userId}:${itemId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    // Store in DB too
    await prisma.feedRelevance.upsert({
      where: { userId_itemId: { userId, itemId } },
      create: { userId, itemId, personalizedNote: cached },
      update: { personalizedNote: cached },
    });
    return { itemId, note: cached };
  }

  // Load item + profile
  const [item, patient] = await Promise.all([
    prisma.researchItem.findUnique({ where: { id: itemId } }),
    prisma.patient.findFirst({ where: { userId }, select: { profile: true } }),
  ]);

  if (!item) throw new Error('Research item not found');
  if (!patient?.profile) throw new Error('Patient profile not found');

  const profile = patient.profile as unknown as PatientProfile;
  const subtype = profileToSubtype(profile);
  const drugs = getCurrentDrugs(profile);

  const prompt = `You are an oncology research advisor personalizing a research finding for a specific patient.

PATIENT PROFILE:
- Cancer type: ${profile.cancerTypeNormalized || profile.cancerType || 'Unknown'}
- Subtype: ${subtype || 'Unknown'}
- Stage: ${profile.stage || 'Unknown'}
- Current drugs: ${drugs.length > 0 ? drugs.join(', ') : 'None specified'}
- Biomarkers: ${extractPatientBiomarkers(profile).join(', ') || 'None specified'}

RESEARCH ITEM:
- Title: ${item.title}
- Cancer types: ${(item.cancerTypes as string[]).join(', ')}
- Subtypes: ${(item.breastSubtypes as string[]).join(', ')}
- Drugs: ${(item.drugNames as string[]).join(', ')}
- Maturity: ${item.maturityTier}
- Patient summary: ${item.patientSummary || 'Not available'}

Write 2-3 sentences explaining what this research means specifically for THIS patient:
- If the research applies to their cancer type/subtype/biomarkers: be specific about why it's relevant
- If it involves a drug they're currently taking: highlight that explicitly
- If it involves a mutation they carry: note the connection
- If it does NOT apply to them: say so clearly (e.g., "This research applies to HER2+ breast cancer. Since your cancer is HER2-negative, this finding doesn't directly apply to your situation.")
- NEVER speculate about prognosis or survival
- Write at a 6th-grade reading level
- Be honest and direct`;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const note = (response.content[0] as any).text?.trim() || 'Unable to generate personalized note.';

  // Cache in Redis (7-day TTL) + DB
  await redis.set(cacheKey, note, 'EX', 7 * 24 * 60 * 60);
  await prisma.feedRelevance.upsert({
    where: { userId_itemId: { userId, itemId } },
    create: { userId, itemId, personalizedNote: note },
    update: { personalizedNote: note },
  });

  return { itemId, note };
}

// ============================================================================
// Interaction tracking
// ============================================================================

export async function markItemViewed(userId: string, itemId: string): Promise<boolean> {
  await prisma.feedRelevance.upsert({
    where: { userId_itemId: { userId, itemId } },
    create: { userId, itemId, viewed: true, viewedAt: new Date() },
    update: { viewed: true, viewedAt: new Date() },
  });
  return true;
}

export async function markItemSaved(userId: string, itemId: string, saved: boolean): Promise<boolean> {
  await prisma.feedRelevance.upsert({
    where: { userId_itemId: { userId, itemId } },
    create: { userId, itemId, saved },
    update: { saved },
  });
  return true;
}

export async function markItemDismissed(userId: string, itemId: string): Promise<boolean> {
  await prisma.feedRelevance.upsert({
    where: { userId_itemId: { userId, itemId } },
    create: { userId, itemId, dismissed: true },
    update: { dismissed: true },
  });
  return true;
}

export async function markItemShared(userId: string, itemId: string): Promise<boolean> {
  await prisma.feedRelevance.upsert({
    where: { userId_itemId: { userId, itemId } },
    create: { userId, itemId, shared: true },
    update: { shared: true },
  });
  return true;
}

// ============================================================================
// Feed config
// ============================================================================

export async function getUserFeedConfig(userId: string): Promise<{
  id: string;
  audienceType: string;
  contentDepth: string;
  showPreclinical: boolean;
  showNegativeResults: boolean;
}> {
  const config = await prisma.userFeedConfig.findUnique({ where: { userId } });
  if (config) return config;

  // Create with defaults
  return prisma.userFeedConfig.create({
    data: { userId },
  });
}

export async function updateUserFeedConfig(
  userId: string,
  updates: {
    audienceType?: string;
    contentDepth?: string;
    showPreclinical?: boolean;
    showNegativeResults?: boolean;
  },
): Promise<{
  id: string;
  audienceType: string;
  contentDepth: string;
  showPreclinical: boolean;
  showNegativeResults: boolean;
}> {
  return prisma.userFeedConfig.upsert({
    where: { userId },
    create: { userId, ...updates },
    update: updates,
  });
}
