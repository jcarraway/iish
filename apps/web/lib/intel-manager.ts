import { prisma } from './db';
import { redis } from './redis';
import Anthropic from '@anthropic-ai/sdk';
import {
  searchPubMed,
  fetchPubMedBatch,
  fetchPubMedSingle,
  calculateContentHash,
  getJournalCredibility,
  PUBMED_SEARCH_TERMS,
  fetchFDADrugApprovals,
  fetchFDASafetyAlerts,
  fetchPreprints,
  fetchTrialUpdates,
  fetchInstitutionNews,
  fetchNIHGrants,
  type PubMedArticle,
  type FDAItem,
  type PreprintArticle,
  type TrialUpdate,
  type NewsItem,
  type NIHGrant,
} from './intel-sources';

let _anthropic: Anthropic;
function getAnthropicClient() {
  if (!_anthropic) _anthropic = new Anthropic();
  return _anthropic;
}
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
// 3b. ingestFDAItems — FDA drug approvals + safety alerts
// ============================================================================

export async function ingestFDAItems(sinceDate?: Date) {
  const syncState = await prisma.ingestionSyncState.findUnique({
    where: { sourceId: 'fda' },
  });

  let effectiveDate: Date;
  if (sinceDate) {
    effectiveDate = sinceDate;
  } else if (syncState?.lastItemDate) {
    effectiveDate = new Date(syncState.lastItemDate.getTime() - 24 * 60 * 60 * 1000);
  } else {
    effectiveDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  }

  const approvals = await fetchFDADrugApprovals(effectiveDate);
  const safetyAlerts = await fetchFDASafetyAlerts();
  const allItems = [...approvals, ...safetyAlerts];

  let ingested = 0;
  let skipped = 0;
  let errors = 0;
  let latestDate: Date | null = null;

  for (const item of allItems) {
    try {
      const rawContent = item.type === 'safety'
        ? `[FDA SAFETY ALERT] ${item.content}`
        : item.content;
      const hash = calculateContentHash(item.title, rawContent);

      const existing = await prisma.researchItem.findFirst({
        where: { OR: [{ contentHash: hash }, { sourceType: 'fda', sourceItemId: item.id }] },
      });
      if (existing) { skipped++; continue; }

      const pubDate = item.effectiveDate
        ? new Date(item.effectiveDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
        : null;

      await prisma.researchItem.create({
        data: {
          sourceType: 'fda',
          sourceItemId: item.id,
          sourceUrl: `https://api.fda.gov/drug/label.json?search=openfda.application_number:"${item.id}"`,
          sourceCredibility: 'institutional',
          title: item.title,
          rawContent,
          authors: [],
          institutions: ['U.S. Food and Drug Administration'],
          journalName: item.type === 'safety' ? 'FDA Safety Report' : 'FDA Drug Label',
          doi: null,
          publishedAt: pubDate && !isNaN(pubDate.getTime()) ? pubDate : null,
          contentHash: hash,
          classificationStatus: 'pending',
          drugNames: [item.drugName, item.genericName].filter(Boolean),
        },
      });
      ingested++;

      if (pubDate && !isNaN(pubDate.getTime())) {
        if (!latestDate || pubDate > latestDate) latestDate = pubDate;
      }
    } catch (err) {
      console.error(`Error ingesting FDA item ${item.id}:`, err);
      errors++;
    }
  }

  await prisma.ingestionSyncState.upsert({
    where: { sourceId: 'fda' },
    create: { sourceId: 'fda', lastSyncAt: new Date(), lastItemDate: latestDate ?? effectiveDate, itemsIngestedTotal: ingested, itemsIngestedLastRun: ingested },
    update: { lastSyncAt: new Date(), lastItemDate: latestDate ?? undefined, itemsIngestedTotal: { increment: ingested }, itemsIngestedLastRun: ingested },
  });

  return { ingested, skipped, errors };
}

// ============================================================================
// 3c. ingestPreprints — bioRxiv + medRxiv preprints
// ============================================================================

export async function ingestPreprints(sinceDate?: Date) {
  const syncState = await prisma.ingestionSyncState.findUnique({
    where: { sourceId: 'preprints' },
  });

  let effectiveDate: Date;
  if (sinceDate) {
    effectiveDate = sinceDate;
  } else if (syncState?.lastItemDate) {
    effectiveDate = new Date(syncState.lastItemDate.getTime() - 24 * 60 * 60 * 1000);
  } else {
    effectiveDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  const articles = await fetchPreprints(effectiveDate);

  let ingested = 0;
  let skipped = 0;
  let errors = 0;
  let latestDate: Date | null = null;

  for (const article of articles) {
    try {
      const hash = calculateContentHash(article.title, article.abstract);

      const existing = await prisma.researchItem.findFirst({
        where: { OR: [{ contentHash: hash }, { sourceType: 'preprint', sourceItemId: article.doi }] },
      });
      if (existing) { skipped++; continue; }

      const pubDate = article.date ? new Date(article.date) : null;

      await prisma.researchItem.create({
        data: {
          sourceType: 'preprint',
          sourceItemId: article.doi,
          sourceUrl: `https://doi.org/${article.doi}`,
          sourceCredibility: 'preprint',
          title: article.title,
          rawContent: article.abstract,
          authors: article.authors,
          institutions: [],
          journalName: article.server === 'biorxiv' ? 'bioRxiv' : 'medRxiv',
          doi: article.doi,
          publishedAt: pubDate && !isNaN(pubDate.getTime()) ? pubDate : null,
          contentHash: hash,
          classificationStatus: 'pending',
        },
      });
      ingested++;

      if (pubDate && !isNaN(pubDate.getTime())) {
        if (!latestDate || pubDate > latestDate) latestDate = pubDate;
      }
    } catch (err) {
      console.error(`Error ingesting preprint ${article.doi}:`, err);
      errors++;
    }
  }

  await prisma.ingestionSyncState.upsert({
    where: { sourceId: 'preprints' },
    create: { sourceId: 'preprints', lastSyncAt: new Date(), lastItemDate: latestDate ?? effectiveDate, itemsIngestedTotal: ingested, itemsIngestedLastRun: ingested },
    update: { lastSyncAt: new Date(), lastItemDate: latestDate ?? undefined, itemsIngestedTotal: { increment: ingested }, itemsIngestedLastRun: ingested },
  });

  return { ingested, skipped, errors };
}

// ============================================================================
// 3d. ingestTrialUpdates — ClinicalTrials.gov v2
// ============================================================================

export async function ingestTrialUpdates(sinceDate?: Date) {
  const syncState = await prisma.ingestionSyncState.findUnique({
    where: { sourceId: 'clinicaltrials' },
  });

  let effectiveDate: Date;
  if (sinceDate) {
    effectiveDate = sinceDate;
  } else if (syncState?.lastItemDate) {
    effectiveDate = new Date(syncState.lastItemDate.getTime() - 24 * 60 * 60 * 1000);
  } else {
    effectiveDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  const updates = await fetchTrialUpdates(effectiveDate);

  let ingested = 0;
  let skipped = 0;
  let errors = 0;
  let latestDate: Date | null = null;

  for (const trial of updates) {
    try {
      const content = `${trial.briefSummary}\n\n${trial.detailedDescription}`.trim();
      const hash = calculateContentHash(trial.briefTitle, content);

      const existing = await prisma.researchItem.findFirst({
        where: { OR: [{ contentHash: hash }, { sourceType: 'clinicaltrials', sourceItemId: trial.nctId }] },
      });
      if (existing) { skipped++; continue; }

      const pubDate = trial.lastUpdateDate ? new Date(trial.lastUpdateDate) : null;

      await prisma.researchItem.create({
        data: {
          sourceType: 'clinicaltrials',
          sourceItemId: trial.nctId,
          sourceUrl: `https://clinicaltrials.gov/study/${trial.nctId}`,
          sourceCredibility: 'institutional',
          title: `${trial.hasResults ? '[RESULTS] ' : ''}${trial.briefTitle}`,
          rawContent: content,
          authors: [],
          institutions: trial.sponsor ? [trial.sponsor] : [],
          journalName: 'ClinicalTrials.gov',
          doi: null,
          publishedAt: pubDate && !isNaN(pubDate.getTime()) ? pubDate : null,
          contentHash: hash,
          classificationStatus: 'pending',
          trialNctIds: [trial.nctId],
        },
      });
      ingested++;

      if (pubDate && !isNaN(pubDate.getTime())) {
        if (!latestDate || pubDate > latestDate) latestDate = pubDate;
      }
    } catch (err) {
      console.error(`Error ingesting trial ${trial.nctId}:`, err);
      errors++;
    }
  }

  await prisma.ingestionSyncState.upsert({
    where: { sourceId: 'clinicaltrials' },
    create: { sourceId: 'clinicaltrials', lastSyncAt: new Date(), lastItemDate: latestDate ?? effectiveDate, itemsIngestedTotal: ingested, itemsIngestedLastRun: ingested },
    update: { lastSyncAt: new Date(), lastItemDate: latestDate ?? undefined, itemsIngestedTotal: { increment: ingested }, itemsIngestedLastRun: ingested },
  });

  return { ingested, skipped, errors };
}

// ============================================================================
// 3e. ingestInstitutionNews — Institutional newsroom RSS
// ============================================================================

export async function ingestInstitutionNews(sinceDate?: Date) {
  const syncState = await prisma.ingestionSyncState.findUnique({
    where: { sourceId: 'institutions' },
  });

  let effectiveDate: Date;
  if (sinceDate) {
    effectiveDate = sinceDate;
  } else if (syncState?.lastItemDate) {
    effectiveDate = new Date(syncState.lastItemDate.getTime() - 24 * 60 * 60 * 1000);
  } else {
    effectiveDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  const newsItems = await fetchInstitutionNews(effectiveDate);

  let ingested = 0;
  let skipped = 0;
  let errors = 0;
  let latestDate: Date | null = null;

  for (const item of newsItems) {
    try {
      const hash = calculateContentHash(item.title, item.description);

      const existing = await prisma.researchItem.findFirst({
        where: { OR: [{ contentHash: hash }, { sourceType: 'institution', sourceItemId: item.guid }] },
      });
      if (existing) { skipped++; continue; }

      const pubDate = item.pubDate ? new Date(item.pubDate) : null;

      await prisma.researchItem.create({
        data: {
          sourceType: 'institution',
          sourceItemId: item.guid,
          sourceUrl: item.link,
          sourceCredibility: 'institutional',
          title: item.title,
          rawContent: item.description,
          authors: [],
          institutions: [item.institution],
          journalName: `${item.institution} News`,
          doi: null,
          publishedAt: pubDate && !isNaN(pubDate.getTime()) ? pubDate : null,
          contentHash: hash,
          classificationStatus: 'pending',
        },
      });
      ingested++;

      if (pubDate && !isNaN(pubDate.getTime())) {
        if (!latestDate || pubDate > latestDate) latestDate = pubDate;
      }
    } catch (err) {
      console.error(`Error ingesting news item ${item.guid}:`, err);
      errors++;
    }
  }

  await prisma.ingestionSyncState.upsert({
    where: { sourceId: 'institutions' },
    create: { sourceId: 'institutions', lastSyncAt: new Date(), lastItemDate: latestDate ?? effectiveDate, itemsIngestedTotal: ingested, itemsIngestedLastRun: ingested },
    update: { lastSyncAt: new Date(), lastItemDate: latestDate ?? undefined, itemsIngestedTotal: { increment: ingested }, itemsIngestedLastRun: ingested },
  });

  return { ingested, skipped, errors };
}

// ============================================================================
// 3f. ingestNIHGrants — NIH Reporter grants
// ============================================================================

export async function ingestNIHGrants(sinceDate?: Date) {
  const syncState = await prisma.ingestionSyncState.findUnique({
    where: { sourceId: 'nih_reporter' },
  });

  let effectiveDate: Date;
  if (sinceDate) {
    effectiveDate = sinceDate;
  } else if (syncState?.lastItemDate) {
    effectiveDate = new Date(syncState.lastItemDate.getTime() - 24 * 60 * 60 * 1000);
  } else {
    effectiveDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  }

  const grants = await fetchNIHGrants(effectiveDate);

  let ingested = 0;
  let skipped = 0;
  let errors = 0;
  let latestDate: Date | null = null;

  for (const grant of grants) {
    try {
      const hash = calculateContentHash(grant.projectTitle, grant.abstractText);

      const existing = await prisma.researchItem.findFirst({
        where: { OR: [{ contentHash: hash }, { sourceType: 'nih_reporter', sourceItemId: grant.projectNum }] },
      });
      if (existing) { skipped++; continue; }

      await prisma.researchItem.create({
        data: {
          sourceType: 'nih_reporter',
          sourceItemId: grant.projectNum,
          sourceUrl: `https://reporter.nih.gov/project-details/${grant.projectNum}`,
          sourceCredibility: 'institutional',
          title: grant.projectTitle,
          rawContent: `PI: ${grant.piName}. Institution: ${grant.orgName}. Award: $${grant.awardAmount.toLocaleString()} (FY${grant.fiscalYear}).\n\n${grant.abstractText}`,
          authors: grant.piName ? [grant.piName] : [],
          institutions: grant.orgName ? [grant.orgName] : [],
          journalName: 'NIH Reporter',
          doi: null,
          publishedAt: null,
          contentHash: hash,
          classificationStatus: 'pending',
        },
      });
      ingested++;
    } catch (err) {
      console.error(`Error ingesting NIH grant ${grant.projectNum}:`, err);
      errors++;
    }
  }

  await prisma.ingestionSyncState.upsert({
    where: { sourceId: 'nih_reporter' },
    create: { sourceId: 'nih_reporter', lastSyncAt: new Date(), lastItemDate: latestDate ?? effectiveDate, itemsIngestedTotal: ingested, itemsIngestedLastRun: ingested },
    update: { lastSyncAt: new Date(), lastItemDate: latestDate ?? undefined, itemsIngestedTotal: { increment: ingested }, itemsIngestedLastRun: ingested },
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

  const response = await getAnthropicClient().messages.create({
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
  "classificationConfidence": 0.0,
  "drugNames": ["string"],
  "trialNctIds": ["string"],
  "industrySponsored": null,
  "sponsorName": null,
  "authorCOI": null,
  "hypeScore": 0.0,
  "hypeFlags": ["string"]
}

ALLOWED VALUES:
- cancerTypes: breast, lung, colorectal, pancreatic, melanoma, ovarian, cervical, endometrial, prostate, glioblastoma, multiple, pan_cancer, general_oncology
- breastSubtypes: er_positive_her2_negative, her2_positive, her2_low, her2_ultralow, triple_negative, inflammatory, dcis, lobular, all_subtypes, not_specified
- maturityTier: T1 (FDA approved/guideline change), T2 (phase 3 positive), T3 (phase 2 promising), T4 (preclinical/mouse), T5 (hypothesis/review)
- domains: treatment, detection, prevention, survivorship, quality_of_life, genetics, ai_technology, epidemiology, basic_science
- treatmentClasses: immunotherapy, chemotherapy, adc, checkpoint_inhibitor, cancer_vaccine, CAR_T, targeted_small_molecule, monoclonal_antibody, serd, protac, cdk_inhibitor, pi3k_inhibitor, parp_inhibitor, her2_targeted, endocrine_therapy, radiation, surgery, cell_therapy, bispecific, molecular_glue, photodynamic, ctdna_monitoring, ai_screening, lifestyle, other
- treatmentStages: screening, diagnosis, neoadjuvant, adjuvant, first_line_metastatic, second_line_plus, metastatic, maintenance, prevention, survivorship, recurrence, palliative
- evidenceLevel: L1 (systematic review/meta-analysis), L2 (RCT), L3 (controlled study), L4 (case series), L5 (expert opinion), L6 (preclinical)
- practiceImpact: practice_changing, practice_informing, incremental, hypothesis_generating, negative, safety_alert
- classificationConfidence: 0.0-1.0 (your confidence in the classification)
- hypeScore: 0.0-1.0 (0=pure substance, 1=pure hype)
- hypeFlags: overstated_conclusions, small_sample, no_control_group, conflicts_of_interest, press_release_language, surrogate_endpoints_only, industry_practice_changing
- industrySponsored: true, false, or null if cannot determine
- sponsorName: string name of the sponsor/funder if identifiable, or null
- authorCOI: string describing author conflicts of interest if mentioned (e.g. "consulting fees from Pfizer"), or null
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
      classificationConfidence: 0.3,
      drugNames: [],
      trialNctIds: [],
      industrySponsored: null,
      sponsorName: null,
      authorCOI: null,
      hypeScore: 0.5,
      hypeFlags: [],
    };
  }

  // ========================================================================
  // Apply conservative classification rules post-hoc (8 rules)
  // ========================================================================
  const contentLower = ((item.rawContent ?? '') + ' ' + item.title).toLowerCase();

  // Rule 1: Mouse/murine → T4 minimum
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

  // Rule 2: Preprint → L5 minimum
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

  // Rule 3: T1 requires explicit FDA or guideline mention
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

  // Rule 4: T2 requires "phase 3" or "phase iii" mention
  if (classification.maturityTier === 'T2') {
    const hasPhase3 =
      contentLower.includes('phase 3') ||
      contentLower.includes('phase iii') ||
      contentLower.includes('phase-3') ||
      contentLower.includes('phase-iii');
    if (!hasPhase3) {
      classification.maturityTier = 'T3';
    }
  }

  // Rule 5: Negative result signals → flag if not marked negative
  const negativeSignals = [
    'did not meet', 'no significant difference', 'failed to demonstrate',
    'no benefit', 'not superior', 'negative trial', 'did not improve',
    'no improvement', 'futility', 'terminated for futility',
  ];
  const hasNegativeSignal = negativeSignals.some(s => contentLower.includes(s));
  if (hasNegativeSignal && classification.practiceImpact !== 'negative') {
    classification.practiceImpact = 'negative';
  }

  // Rule 6: Safety alert signals → force safety_alert
  const safetySignals = [
    'black box warning', 'boxed warning', 'fda safety', 'safety alert',
    'fda warning', 'withdrawn from market', 'suspended enrollment',
    'serious adverse event', 'fatal adverse event',
  ];
  const hasSafetySignal = safetySignals.some(s => contentLower.includes(s));
  if (hasSafetySignal) {
    classification.practiceImpact = 'safety_alert';
  }

  // Rule 7: Small sample size (N<30) → add small_sample hype flag
  const sampleMatch = contentLower.match(/\bn\s*=\s*(\d+)/);
  if (sampleMatch) {
    const n = parseInt(sampleMatch[1], 10);
    if (n < 30) {
      const flags: string[] = classification.hypeFlags ?? [];
      if (!flags.includes('small_sample')) {
        flags.push('small_sample');
        classification.hypeFlags = flags;
      }
    }
  }

  // Rule 8: Industry-sponsored + practice_changing → boost hype + flag
  if (classification.industrySponsored && classification.practiceImpact === 'practice_changing') {
    const flags: string[] = classification.hypeFlags ?? [];
    if (!flags.includes('industry_practice_changing')) {
      flags.push('industry_practice_changing');
      classification.hypeFlags = flags;
    }
    if ((classification.hypeScore ?? 0) < 0.4) {
      classification.hypeScore = 0.4;
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
      classificationConfidence: classification.classificationConfidence ?? null,
      drugNames: classification.drugNames ?? [],
      trialNctIds: classification.trialNctIds ?? [],
      industrySponsored: classification.industrySponsored ?? null,
      sponsorName: classification.sponsorName ?? null,
      authorCOI: classification.authorCOI ?? null,
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
  const patientResponse = await getAnthropicClient().messages.create({
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
  const clinicianResponse = await getAnthropicClient().messages.create({
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

  // Extract structured key endpoints from clinician summary
  const keyEndpoints = extractKeyEndpoints(clinicianSummary.keyEndpoints ?? []);

  // Update item with summaries
  const updated = await prisma.researchItem.update({
    where: { id: itemId },
    data: {
      patientSummary,
      clinicianSummary,
      keyEndpoints: keyEndpoints.length > 0 ? keyEndpoints : undefined,
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
  const pubmed = await ingestPubMedArticles();
  const fda = await ingestFDAItems();
  const preprints = await ingestPreprints();
  const clinicaltrials = await ingestTrialUpdates();
  const institutions = await ingestInstitutionNews();
  const nih_reporter = await ingestNIHGrants();

  const classification = await processClassificationQueue();
  const summarization = await processSummarizationQueue();
  const qc = await processQCQueue();

  return {
    ingestion: { pubmed, fda, preprints, clinicaltrials, institutions, nih_reporter },
    classification,
    summarization,
    qc,
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
  switch (sourceId) {
    case 'pubmed': return ingestPubMedArticles();
    case 'fda': return ingestFDAItems();
    case 'preprints': return ingestPreprints();
    case 'clinicaltrials': return ingestTrialUpdates();
    case 'institutions': return ingestInstitutionNews();
    case 'nih_reporter': return ingestNIHGrants();
    default:
      throw new Error(`Unknown source: ${sourceId}. Supported: pubmed, fda, preprints, clinicaltrials, institutions, nih_reporter`);
  }
}

// ============================================================================
// 14. extractKeyEndpoints — Parse HR/CI/p-value from endpoint strings
// ============================================================================

function extractKeyEndpoints(endpoints: string[]): Array<{
  endpoint: string;
  hr?: string;
  ci?: string;
  pValue?: string;
  result?: string;
}> {
  return endpoints.map(ep => {
    const parsed: { endpoint: string; hr?: string; ci?: string; pValue?: string; result?: string } = {
      endpoint: ep,
    };

    // HR extraction: HR 0.72, HR=0.72, hazard ratio 0.72
    const hrMatch = ep.match(/(?:HR|hazard ratio)[=:\s]*(\d+\.?\d*)/i);
    if (hrMatch) parsed.hr = hrMatch[1];

    // CI extraction: 95% CI 0.58-0.89, CI: 0.58 to 0.89
    const ciMatch = ep.match(/(?:95%?\s*CI|confidence interval)[=:\s]*([\d.]+[\s-–]+[\d.]+)/i);
    if (ciMatch) parsed.ci = ciMatch[1].replace(/\s+/g, '');

    // p-value extraction: p=0.001, p<0.05, P value 0.03
    const pMatch = ep.match(/p[\s-]*(?:value)?[=<:\s]*([\d.]+(?:e-?\d+)?)/i);
    if (pMatch) parsed.pValue = pMatch[1];

    // Result direction
    if (/significant|positive|improved|superior|benefit/i.test(ep)) {
      parsed.result = 'positive';
    } else if (/no.?significant|negative|inferior|no.?benefit|failed/i.test(ep)) {
      parsed.result = 'negative';
    }

    return parsed;
  });
}

// ============================================================================
// 15. checkRetractionStatus — PubMed + CrossRef retraction check
// ============================================================================

export async function checkRetractionStatus(itemId: string) {
  const item = await prisma.researchItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Research item not found');

  let retractionStatus: 'none' | 'retracted' | 'expression_of_concern' | 'correction' = 'none';

  // Check PubMed if sourceType is pubmed
  if (item.sourceType === 'pubmed' && item.sourceItemId) {
    try {
      const article = await fetchPubMedSingle(item.sourceItemId);
      if (article) {
        const pubTypesLower = article.publicationType.map(t => t.toLowerCase());
        if (pubTypesLower.some(t => t.includes('retracted publication'))) {
          retractionStatus = 'retracted';
        } else if (pubTypesLower.some(t => t.includes('expression of concern'))) {
          retractionStatus = 'expression_of_concern';
        } else if (pubTypesLower.some(t => t.includes('published erratum') || t.includes('correction'))) {
          retractionStatus = 'correction';
        }
      }
    } catch (err) {
      console.error(`Error checking PubMed retraction for ${itemId}:`, err);
    }
  }

  // Check CrossRef if DOI available and PubMed didn't flag it
  if (retractionStatus === 'none' && item.doi) {
    try {
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(item.doi)}`, {
        headers: { 'User-Agent': 'IISH/1.0 (mailto:support@iish.com)' },
      });
      if (res.ok) {
        const data = await res.json();
        const updates = data?.message?.['update-to'];
        if (Array.isArray(updates) && updates.length > 0) {
          const hasRetraction = updates.some((u: any) =>
            u.label?.toLowerCase().includes('retraction') ||
            u.type?.toLowerCase().includes('retraction')
          );
          if (hasRetraction) {
            retractionStatus = 'retracted';
          } else {
            retractionStatus = 'correction';
          }
        }
      }
    } catch (err) {
      console.error(`Error checking CrossRef for ${itemId}:`, err);
    }
  }

  await prisma.researchItem.update({
    where: { id: itemId },
    data: { retractionStatus },
  });

  return retractionStatus;
}

// ============================================================================
// 16. detectContradictions — Find conflicting items sharing drugs/trials
// ============================================================================

export async function detectContradictions(itemId: string) {
  const item = await prisma.researchItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Research item not found');

  // Only check completed items with drug names or trial NCT IDs
  if (item.drugNames.length === 0 && item.trialNctIds.length === 0) return [];

  const orConditions: any[] = [];
  if (item.drugNames.length > 0) {
    orConditions.push({ drugNames: { hasSome: item.drugNames } });
  }
  if (item.trialNctIds.length > 0) {
    orConditions.push({ trialNctIds: { hasSome: item.trialNctIds } });
  }

  const related = await prisma.researchItem.findMany({
    where: {
      id: { not: itemId },
      classificationStatus: 'complete',
      OR: orConditions,
    },
  });

  const contradictions: string[] = [];

  for (const other of related) {
    // Check for contradicting practice impact
    const isContradiction =
      (item.practiceImpact === 'practice_changing' && other.practiceImpact === 'negative') ||
      (item.practiceImpact === 'negative' && other.practiceImpact === 'practice_changing') ||
      (item.practiceImpact === 'safety_alert' && other.practiceImpact === 'practice_changing');

    if (isContradiction) {
      contradictions.push(other.id);

      // Update the other item's contradictedBy too
      const otherContradictions = [...new Set([...(other.contradictedBy || []), itemId])];
      await prisma.researchItem.update({
        where: { id: other.id },
        data: { contradictedBy: otherContradictions },
      });
    }

    // Always add as related if sharing drug/trial
    const otherRelated = [...new Set([...(other.relatedItemIds || []), itemId])];
    await prisma.researchItem.update({
      where: { id: other.id },
      data: { relatedItemIds: otherRelated },
    });
  }

  // Update this item
  const relatedIds = related.map(r => r.id);
  const uniqueRelated = [...new Set([...(item.relatedItemIds || []), ...relatedIds])];
  const uniqueContradictions = [...new Set([...(item.contradictedBy || []), ...contradictions])];

  await prisma.researchItem.update({
    where: { id: itemId },
    data: {
      relatedItemIds: uniqueRelated,
      contradictedBy: uniqueContradictions,
    },
  });

  return contradictions;
}

// ============================================================================
// 17. processQCQueue — Batch QC for completed items
// ============================================================================

export async function processQCQueue(batchSize = 10) {
  const items = await prisma.researchItem.findMany({
    where: {
      classificationStatus: 'complete',
      retractionStatus: null,
    },
    orderBy: { createdAt: 'asc' },
    take: batchSize,
  });

  let checked = 0;
  let retracted = 0;
  let contradictions = 0;
  let errors = 0;

  for (const item of items) {
    try {
      const status = await checkRetractionStatus(item.id);
      if (status !== 'none') retracted++;

      const contras = await detectContradictions(item.id);
      contradictions += contras.length;

      checked++;
    } catch (err) {
      console.error(`Error in QC for item ${item.id}:`, err);
      errors++;
    }
  }

  return { checked, retracted, contradictions, errors };
}

// ============================================================================
// 18. migrateOldTaxonomy — One-time idempotent migration of I1 values
// ============================================================================

export async function migrateOldTaxonomy() {
  const results = {
    practiceImpactUpdated: 0,
    breastSubtypesUpdated: 0,
  };

  // practiceImpact: 'informative' → 'practice_informing'
  const r1 = await prisma.researchItem.updateMany({
    where: { practiceImpact: 'informative' },
    data: { practiceImpact: 'practice_informing' },
  });
  results.practiceImpactUpdated += r1.count;

  // practiceImpact: 'confirmatory' → 'incremental'
  const r2 = await prisma.researchItem.updateMany({
    where: { practiceImpact: 'confirmatory' },
    data: { practiceImpact: 'incremental' },
  });
  results.practiceImpactUpdated += r2.count;

  // Breast subtype renames — update array values
  // HER2+ → her2_positive
  const her2Items = await prisma.researchItem.findMany({
    where: { breastSubtypes: { has: 'HER2+' } },
  });
  for (const item of her2Items) {
    const updated = item.breastSubtypes.map((s: string) => s === 'HER2+' ? 'her2_positive' : s);
    await prisma.researchItem.update({ where: { id: item.id }, data: { breastSubtypes: updated } });
    results.breastSubtypesUpdated++;
  }

  // ER+/PR+ → er_positive_her2_negative
  const erItems = await prisma.researchItem.findMany({
    where: { breastSubtypes: { has: 'ER+/PR+' } },
  });
  for (const item of erItems) {
    const updated = item.breastSubtypes.map((s: string) => s === 'ER+/PR+' ? 'er_positive_her2_negative' : s);
    await prisma.researchItem.update({ where: { id: item.id }, data: { breastSubtypes: updated } });
    results.breastSubtypesUpdated++;
  }

  // TNBC → triple_negative
  const tnbcItems = await prisma.researchItem.findMany({
    where: { breastSubtypes: { has: 'TNBC' } },
  });
  for (const item of tnbcItems) {
    const updated = item.breastSubtypes.map((s: string) => s === 'TNBC' ? 'triple_negative' : s);
    await prisma.researchItem.update({ where: { id: item.id }, data: { breastSubtypes: updated } });
    results.breastSubtypesUpdated++;
  }

  // HR+/HER2- → er_positive_her2_negative
  const hrItems = await prisma.researchItem.findMany({
    where: { breastSubtypes: { has: 'HR+/HER2-' } },
  });
  for (const item of hrItems) {
    const updated = item.breastSubtypes.map((s: string) => s === 'HR+/HER2-' ? 'er_positive_her2_negative' : s);
    await prisma.researchItem.update({ where: { id: item.id }, data: { breastSubtypes: updated } });
    results.breastSubtypesUpdated++;
  }

  return results;
}

// ============================================================================
// 19. reclassifyItem — Clear caches and re-process
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
