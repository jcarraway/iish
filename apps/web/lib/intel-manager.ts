import { prisma } from './db';
import { redis } from './redis';
import Anthropic from '@anthropic-ai/sdk';
import {
  searchPubMed,
  fetchPubMedBatch,
  calculateContentHash,
  getJournalCredibility,
  PUBMED_SEARCH_TERMS,
  type PubMedArticle,
} from './intel-sources';

const anthropic = new Anthropic();
const MODEL = 'claude-opus-4-20250514';

// ============================================================================
// 1. normalizeItem — Convert PubMedArticle to Prisma-compatible create data
// ============================================================================

function normalizeItem(article: PubMedArticle) {
  return {
    sourceType: 'pubmed' as const,
    sourceItemId: article.pmid,
    sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
    sourceCredibility: getJournalCredibility(article.journalAbbrev),
    title: article.title,
    rawContent: article.abstract,
    authors: article.authors,
    institutions: article.institutions,
    journalName: article.journalFull || article.journalAbbrev,
    doi: article.doi,
    publishedAt: article.publishedDate ? new Date(article.publishedDate) : null,
    contentHash: calculateContentHash(article.title, article.abstract),
    classificationStatus: 'pending',
  };
}

// ============================================================================
// 2. findDuplicates — Check contentHash, DOI, then sourceItemId
// ============================================================================

async function findDuplicates(hash: string, doi?: string | null, pmid?: string) {
  const orConditions: any[] = [{ contentHash: hash }];

  if (doi) {
    orConditions.push({ doi });
  }

  if (pmid) {
    orConditions.push({ sourceType: 'pubmed', sourceItemId: pmid });
  }

  return prisma.researchItem.findFirst({
    where: { OR: orConditions },
  });
}

// ============================================================================
// 3. ingestPubMedArticles — Full ingestion pipeline
// ============================================================================

export async function ingestPubMedArticles(sinceDate?: Date) {
  // Read sync state
  const syncState = await prisma.ingestionSyncState.findUnique({
    where: { sourceId: 'pubmed' },
  });

  // Determine date window
  let effectiveDate: Date;
  if (sinceDate) {
    effectiveDate = sinceDate;
  } else if (syncState?.lastItemDate) {
    // Go back 1 day as buffer to catch late-indexed articles
    effectiveDate = new Date(syncState.lastItemDate.getTime() - 24 * 60 * 60 * 1000);
  } else {
    // Default to 90 days ago
    effectiveDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  }

  // Collect unique PMIDs across all search terms
  const allPmids = new Set<string>();

  for (const term of PUBMED_SEARCH_TERMS) {
    try {
      const pmids = await searchPubMed(term, effectiveDate);
      for (const pmid of pmids) {
        allPmids.add(pmid);
      }
    } catch (err) {
      console.error(`Error searching PubMed for "${term}":`, err);
    }
  }

  if (allPmids.size === 0) {
    // Update sync state even if nothing found
    await prisma.ingestionSyncState.upsert({
      where: { sourceId: 'pubmed' },
      create: {
        sourceId: 'pubmed',
        lastSyncAt: new Date(),
        lastItemDate: effectiveDate,
        itemsIngestedTotal: syncState?.itemsIngestedTotal ?? 0,
        itemsIngestedLastRun: 0,
      },
      update: {
        lastSyncAt: new Date(),
        itemsIngestedLastRun: 0,
      },
    });

    return { ingested: 0, skipped: 0, errors: 0 };
  }

  // Batch fetch all articles
  const articles = await fetchPubMedBatch(Array.from(allPmids));

  let ingested = 0;
  let skipped = 0;
  let errors = 0;
  let latestDate: Date | null = null;

  for (const article of articles) {
    try {
      const normalized = normalizeItem(article);

      // Check for duplicates
      const existing = await findDuplicates(normalized.contentHash, normalized.doi, article.pmid);
      if (existing) {
        skipped++;
        continue;
      }

      await prisma.researchItem.create({ data: normalized });
      ingested++;

      // Track latest published date for sync state
      if (normalized.publishedAt) {
        if (!latestDate || normalized.publishedAt > latestDate) {
          latestDate = normalized.publishedAt;
        }
      }
    } catch (err) {
      console.error(`Error ingesting PMID ${article.pmid}:`, err);
      errors++;
    }
  }

  // Update sync state
  await prisma.ingestionSyncState.upsert({
    where: { sourceId: 'pubmed' },
    create: {
      sourceId: 'pubmed',
      lastSyncAt: new Date(),
      lastItemDate: latestDate ?? effectiveDate,
      itemsIngestedTotal: ingested,
      itemsIngestedLastRun: ingested,
    },
    update: {
      lastSyncAt: new Date(),
      lastItemDate: latestDate ?? undefined,
      itemsIngestedTotal: { increment: ingested },
      itemsIngestedLastRun: ingested,
    },
  });

  return { ingested, skipped, errors };
}

// ============================================================================
// 4. classifyItem — Claude-powered research classification
// ============================================================================

export async function classifyItem(itemId: string) {
  // Check Redis cache
  const cacheKey = `intel:classify:${itemId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch item from DB
  const item = await prisma.researchItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Research item not found');

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `You are an oncology research classifier. Given a research article title and abstract, classify it along multiple dimensions.

CONSERVATIVE CLASSIFICATION RULES:
- If the text contains "mouse", "murine", or "xenograft", maturityTier MUST be T4 or T5 (never higher).
- T1 requires EXPLICIT mention of FDA approval, guideline change, or guideline update. Do not infer T1.
- T2 requires explicit mention of phase 3 trial with positive primary endpoint.
- If the source is a preprint (bioRxiv, medRxiv, SSRN), evidenceLevel MUST be L5 or L6.

Return ONLY valid JSON with this exact structure:
{
  "cancerTypes": ["string"],
  "breastSubtypes": ["string"],
  "maturityTier": "string",
  "domains": ["string"],
  "treatmentClasses": ["string"],
  "biomarkerRelevance": ["string"],
  "treatmentStages": ["string"],
  "evidenceLevel": "string",
  "practiceImpact": "string",
  "drugNames": ["string"],
  "trialNctIds": ["string"],
  "industrySponsored": null,
  "hypeScore": 0.0,
  "hypeFlags": ["string"]
}

ALLOWED VALUES:
- cancerTypes: breast, lung, colorectal, pancreatic, melanoma, general_oncology
- breastSubtypes: HER2+, ER+/PR+, TNBC, HR+/HER2-
- maturityTier: T1 (FDA approved/guideline change), T2 (phase 3 positive), T3 (phase 2 promising), T4 (preclinical/mouse), T5 (hypothesis/review)
- domains: immunotherapy, targeted_therapy, chemotherapy, screening, biomarkers, survivorship, surgery, radiation, prevention, genomics
- treatmentClasses: checkpoint_inhibitor, cancer_vaccine, CAR-T, ADC, targeted_small_molecule, hormone_therapy, monoclonal_antibody
- treatmentStages: neoadjuvant, adjuvant, metastatic, maintenance, prevention
- evidenceLevel: L1 (systematic review/meta-analysis), L2 (RCT), L3 (controlled study), L4 (case series), L5 (expert opinion), L6 (preclinical)
- practiceImpact: practice_changing, informative, hypothesis_generating, confirmatory, incremental
- hypeScore: 0.0-1.0 (0=pure substance, 1=pure hype)
- hypeFlags: overstated_conclusions, small_sample, no_control_group, conflicts_of_interest, press_release_language, surrogate_endpoints_only
- industrySponsored: true, false, or null if cannot determine
- drugNames: extract any drug names mentioned
- trialNctIds: extract any NCT numbers mentioned`,
    messages: [
      {
        role: 'user',
        content: `Title: ${item.title}

Abstract: ${item.rawContent || 'No abstract available.'}

Journal: ${item.journalName || 'Unknown'}
Source credibility: ${item.sourceCredibility}

Classify this research article.`,
      },
    ],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;
  let classification: any;

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    classification = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    // Fallback classification
    classification = {
      cancerTypes: ['general_oncology'],
      breastSubtypes: [],
      maturityTier: 'T5',
      domains: [],
      treatmentClasses: [],
      biomarkerRelevance: [],
      treatmentStages: [],
      evidenceLevel: 'L5',
      practiceImpact: 'incremental',
      drugNames: [],
      trialNctIds: [],
      industrySponsored: null,
      hypeScore: 0.5,
      hypeFlags: [],
    };
  }

  // Apply conservative classification rules post-hoc
  const contentLower = ((item.rawContent ?? '') + ' ' + item.title).toLowerCase();

  if (
    contentLower.includes('mouse') ||
    contentLower.includes('murine') ||
    contentLower.includes('xenograft')
  ) {
    const tierNum = parseInt(classification.maturityTier?.replace('T', '') ?? '5', 10);
    if (tierNum < 4) {
      classification.maturityTier = 'T4';
    }
  }

  if (
    item.sourceCredibility === 'preprint' ||
    contentLower.includes('biorxiv') ||
    contentLower.includes('medrxiv')
  ) {
    const levelNum = parseInt(classification.evidenceLevel?.replace('L', '') ?? '5', 10);
    if (levelNum < 5) {
      classification.evidenceLevel = 'L5';
    }
  }

  // T1 requires explicit FDA or guideline mention
  if (classification.maturityTier === 'T1') {
    const hasFdaMention =
      contentLower.includes('fda approv') ||
      contentLower.includes('guideline change') ||
      contentLower.includes('guideline update') ||
      contentLower.includes('nccn update') ||
      contentLower.includes('approved by the fda');
    if (!hasFdaMention) {
      classification.maturityTier = 'T2';
    }
  }

  // Update the item in DB
  const updated = await prisma.researchItem.update({
    where: { id: itemId },
    data: {
      cancerTypes: classification.cancerTypes ?? [],
      breastSubtypes: classification.breastSubtypes ?? [],
      maturityTier: classification.maturityTier ?? 'T5',
      domains: classification.domains ?? [],
      treatmentClasses: classification.treatmentClasses ?? [],
      biomarkerRelevance: classification.biomarkerRelevance ?? [],
      treatmentStages: classification.treatmentStages ?? [],
      evidenceLevel: classification.evidenceLevel ?? 'L5',
      practiceImpact: classification.practiceImpact ?? 'incremental',
      drugNames: classification.drugNames ?? [],
      trialNctIds: classification.trialNctIds ?? [],
      industrySponsored: classification.industrySponsored ?? null,
      hypeScore: classification.hypeScore ?? null,
      hypeFlags: classification.hypeFlags ?? [],
      classificationStatus: 'classified',
      lastProcessedAt: new Date(),
    },
  });

  // Cache for 30 days
  await redis.set(cacheKey, JSON.stringify(updated), 'EX', 30 * 24 * 60 * 60);

  return updated;
}

// ============================================================================
// 5. summarizeItem — Two Claude calls: patient + clinician summaries
// ============================================================================

export async function summarizeItem(itemId: string) {
  // Check Redis cache
  const cacheKey = `intel:summary:${itemId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch item from DB
  const item = await prisma.researchItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Research item not found');

  const maturityContext: Record<string, string> = {
    T1: 'This research has led to FDA approval or a guideline change.',
    T2: 'This is from a large phase 3 clinical trial with positive results.',
    T3: 'This is from a phase 2 clinical trial showing promising results.',
    T4: 'This is early research conducted in laboratory animals (mice), not yet tested in humans.',
    T5: 'This is a hypothesis, review, or very early-stage research.',
  };

  const tierContext = maturityContext[item.maturityTier ?? 'T5'] ?? maturityContext.T5;

  // Patient summary
  const patientResponse = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `You are a patient educator for cancer patients. Write a clear, warm, empowering summary of a research article at a 6th grade reading level. 3-5 sentences.

CRITICAL RULES:
- Use simple language — no jargon
- Include maturity context so patients understand how close this is to helping them
- Do NOT overstate findings — be honest about limitations
- If the research is in mice/preclinical, say so clearly
- If the research is a review or hypothesis, say so clearly
- End with what this means for patients right now

Return ONLY the summary text, no JSON.`,
    messages: [
      {
        role: 'user',
        content: `Title: ${item.title}
Abstract: ${item.rawContent || 'No abstract available.'}
Maturity: ${item.maturityTier ?? 'T5'} — ${tierContext}
Cancer types: ${item.cancerTypes.join(', ') || 'general oncology'}

Write a patient-friendly summary.`,
      },
    ],
  });

  const patientSummary = (patientResponse.content[0] as { type: 'text'; text: string }).text;

  // Clinician summary
  const clinicianResponse = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `You are a clinical oncology research analyst. Produce a structured clinician summary of a research article.

Return ONLY valid JSON with this exact structure:
{
  "headline": "string — 1 line clinical headline",
  "keyEndpoints": ["string — primary and secondary endpoints with results"],
  "studyDesign": "string — study type, size, phase, randomization",
  "context": "string — how this fits into the current treatment landscape",
  "practiceImplication": "string — what this means for clinical practice",
  "limitations": ["string — methodological limitations"],
  "grade": "string — evidence level (L1-L6)"
}`,
    messages: [
      {
        role: 'user',
        content: `Title: ${item.title}
Abstract: ${item.rawContent || 'No abstract available.'}
Journal: ${item.journalName || 'Unknown'}
Evidence level: ${item.evidenceLevel || 'unknown'}
Practice impact: ${item.practiceImpact || 'unknown'}

Produce a structured clinician summary.`,
      },
    ],
  });

  const clinicianText = (clinicianResponse.content[0] as { type: 'text'; text: string }).text;
  let clinicianSummary: any;

  try {
    const jsonMatch = clinicianText.match(/\{[\s\S]*\}/);
    clinicianSummary = JSON.parse(jsonMatch ? jsonMatch[0] : clinicianText);
  } catch {
    clinicianSummary = {
      headline: item.title,
      keyEndpoints: [],
      studyDesign: 'Unable to extract study design automatically.',
      context: '',
      practiceImplication: 'Review the full text for clinical implications.',
      limitations: ['Automated summary generation failed — manual review recommended.'],
      grade: item.evidenceLevel || 'L5',
    };
  }

  // Update item with summaries
  const updated = await prisma.researchItem.update({
    where: { id: itemId },
    data: {
      patientSummary,
      clinicianSummary,
      classificationStatus: 'complete',
      lastProcessedAt: new Date(),
    },
  });

  // Cache for 30 days
  await redis.set(cacheKey, JSON.stringify(updated), 'EX', 30 * 24 * 60 * 60);

  return updated;
}

// ============================================================================
// 6. processClassificationQueue — Batch classify pending items
// ============================================================================

export async function processClassificationQueue(batchSize = 20) {
  const pending = await prisma.researchItem.findMany({
    where: { classificationStatus: 'pending' },
    orderBy: { createdAt: 'asc' },
    take: batchSize,
  });

  let classified = 0;
  let errors = 0;

  for (const item of pending) {
    try {
      await classifyItem(item.id);
      classified++;
    } catch (err) {
      console.error(`Error classifying item ${item.id}:`, err);
      errors++;
    }
  }

  return { classified, errors };
}

// ============================================================================
// 7. processSummarizationQueue — Batch summarize classified items
// ============================================================================

export async function processSummarizationQueue(batchSize = 10) {
  const classified = await prisma.researchItem.findMany({
    where: { classificationStatus: 'classified' },
    orderBy: { createdAt: 'asc' },
    take: batchSize,
  });

  let summarized = 0;
  let errors = 0;

  for (const item of classified) {
    try {
      await summarizeItem(item.id);
      summarized++;
    } catch (err) {
      console.error(`Error summarizing item ${item.id}:`, err);
      errors++;
    }
  }

  return { summarized, errors };
}

// ============================================================================
// 8. runIngestionCycle — Full cron cycle
// ============================================================================

export async function runIngestionCycle() {
  const ingestionResult = await ingestPubMedArticles();
  const classificationResult = await processClassificationQueue();
  const summarizationResult = await processSummarizationQueue();

  return {
    ingestion: ingestionResult,
    classification: classificationResult,
    summarization: summarizationResult,
  };
}

// ============================================================================
// 9. getSyncStates — Return all IngestionSyncState records
// ============================================================================

export async function getSyncStates() {
  return prisma.ingestionSyncState.findMany({
    orderBy: { sourceId: 'asc' },
  });
}

// ============================================================================
// 10. getResearchItems — Filtered + paginated query
// ============================================================================

export async function getResearchItems(filters?: {
  maturityTiers?: string[];
  domains?: string[];
  treatmentClasses?: string[];
  practiceImpact?: string;
  cancerTypes?: string[];
  breastSubtypes?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = {
    classificationStatus: 'complete',
  };

  if (filters?.maturityTiers && filters.maturityTiers.length > 0) {
    where.maturityTier = { in: filters.maturityTiers };
  }

  if (filters?.domains && filters.domains.length > 0) {
    where.domains = { hasSome: filters.domains };
  }

  if (filters?.treatmentClasses && filters.treatmentClasses.length > 0) {
    where.treatmentClasses = { hasSome: filters.treatmentClasses };
  }

  if (filters?.practiceImpact) {
    where.practiceImpact = filters.practiceImpact;
  }

  if (filters?.cancerTypes && filters.cancerTypes.length > 0) {
    where.cancerTypes = { hasSome: filters.cancerTypes };
  }

  if (filters?.breastSubtypes && filters.breastSubtypes.length > 0) {
    where.breastSubtypes = { hasSome: filters.breastSubtypes };
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.publishedAt = {};
    if (filters?.dateFrom) {
      where.publishedAt.gte = new Date(filters.dateFrom);
    }
    if (filters?.dateTo) {
      where.publishedAt.lte = new Date(filters.dateTo);
    }
  }

  const limit = Math.min(filters?.limit ?? 20, 100);
  const offset = filters?.offset ?? 0;

  const [items, total] = await Promise.all([
    prisma.researchItem.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.researchItem.count({ where }),
  ]);

  return { items, total, limit, offset };
}

// ============================================================================
// 11. getResearchItem — Single item by ID
// ============================================================================

export async function getResearchItem(id: string) {
  return prisma.researchItem.findUnique({ where: { id } });
}

// ============================================================================
// 12. searchResearchItems — ILIKE search on title + rawContent + drugNames
// ============================================================================

export async function searchResearchItems(
  query: string,
  filters?: {
    maturityTiers?: string[];
    domains?: string[];
    treatmentClasses?: string[];
    practiceImpact?: string;
    cancerTypes?: string[];
    breastSubtypes?: string[];
    limit?: number;
    offset?: number;
  },
) {
  // Build taxonomy filters (same logic as getResearchItems)
  const taxonomyWhere: any = {
    classificationStatus: 'complete',
  };

  if (filters?.maturityTiers && filters.maturityTiers.length > 0) {
    taxonomyWhere.maturityTier = { in: filters.maturityTiers };
  }

  if (filters?.domains && filters.domains.length > 0) {
    taxonomyWhere.domains = { hasSome: filters.domains };
  }

  if (filters?.treatmentClasses && filters.treatmentClasses.length > 0) {
    taxonomyWhere.treatmentClasses = { hasSome: filters.treatmentClasses };
  }

  if (filters?.practiceImpact) {
    taxonomyWhere.practiceImpact = filters.practiceImpact;
  }

  if (filters?.cancerTypes && filters.cancerTypes.length > 0) {
    taxonomyWhere.cancerTypes = { hasSome: filters.cancerTypes };
  }

  if (filters?.breastSubtypes && filters.breastSubtypes.length > 0) {
    taxonomyWhere.breastSubtypes = { hasSome: filters.breastSubtypes };
  }

  const where: any = {
    ...taxonomyWhere,
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { rawContent: { contains: query, mode: 'insensitive' } },
      { drugNames: { has: query } },
    ],
  };

  const limit = Math.min(filters?.limit ?? 20, 100);
  const offset = filters?.offset ?? 0;

  const [items, total] = await Promise.all([
    prisma.researchItem.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.researchItem.count({ where }),
  ]);

  return { items, total, limit, offset };
}

// ============================================================================
// 13. triggerIngestion — Manual ingestion trigger by source
// ============================================================================

export async function triggerIngestion(sourceId: string) {
  if (sourceId === 'pubmed') {
    return ingestPubMedArticles();
  }

  throw new Error(`Unknown source: ${sourceId}. Currently supported: pubmed`);
}

// ============================================================================
// 14. reclassifyItem — Clear caches and re-process
// ============================================================================

export async function reclassifyItem(itemId: string) {
  // Clear Redis caches for this item
  await Promise.all([
    redis.del(`intel:classify:${itemId}`),
    redis.del(`intel:summary:${itemId}`),
  ]);

  // Reset classification status
  await prisma.researchItem.update({
    where: { id: itemId },
    data: {
      classificationStatus: 'pending',
      lastProcessedAt: null,
    },
  });

  // Re-classify and re-summarize
  await classifyItem(itemId);
  const updated = await summarizeItem(itemId);

  return updated;
}
