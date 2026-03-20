import crypto from 'crypto';

// --- Constants ---

const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export const PUBMED_SEARCH_TERMS = [
  'breast cancer immunotherapy',
  'breast cancer vaccine',
  'breast cancer neoantigen',
  'breast cancer checkpoint inhibitor',
  'HER2 positive breast cancer treatment',
  'triple negative breast cancer',
  'breast cancer ctDNA monitoring',
  'breast cancer genomic profiling',
  'breast cancer survivorship outcomes',
  'mRNA cancer vaccine',
  'personalized cancer vaccine',
];

export const JOURNAL_CREDIBILITY: Record<
  string,
  'tier1_journal' | 'peer_reviewed'
> = {
  // tier1_journal (16)
  'N Engl J Med': 'tier1_journal',
  Lancet: 'tier1_journal',
  'Lancet Oncol': 'tier1_journal',
  Nature: 'tier1_journal',
  'Nature Med': 'tier1_journal',
  'Nature Rev Cancer': 'tier1_journal',
  'J Clin Oncol': 'tier1_journal',
  JAMA: 'tier1_journal',
  'JAMA Oncol': 'tier1_journal',
  'Ann Oncol': 'tier1_journal',
  Cell: 'tier1_journal',
  Science: 'tier1_journal',
  'Cancer Discov': 'tier1_journal',
  'Clin Cancer Res': 'tier1_journal',
  'J Natl Cancer Inst': 'tier1_journal',
  'Cancer Cell': 'tier1_journal',

  // peer_reviewed (14)
  'Cancer Res': 'peer_reviewed',
  'Breast Cancer Res': 'peer_reviewed',
  'Breast Cancer Res Treat': 'peer_reviewed',
  'Eur J Cancer': 'peer_reviewed',
  'BMC Cancer': 'peer_reviewed',
  'Int J Cancer': 'peer_reviewed',
  'Mol Cancer': 'peer_reviewed',
  Oncogene: 'peer_reviewed',
  'PLoS Med': 'peer_reviewed',
  BMJ: 'peer_reviewed',
  Cancer: 'peer_reviewed',
  Oncologist: 'peer_reviewed',
  'NPJ Breast Cancer': 'peer_reviewed',
  'Front Oncol': 'peer_reviewed',
};

// --- Types ---

export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  institutions: string[];
  journalAbbrev: string;
  journalFull: string;
  doi: string | null;
  publishedDate: string | null;
  publicationType: string[];
}

// --- Helpers ---

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripTags(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

const MONTH_MAP: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

// --- Exported Functions ---

export function parsePubMedDate(
  yearStr: string,
  monthStr?: string,
  dayStr?: string,
): string | null {
  if (!yearStr) return null;

  const year = yearStr.trim();
  if (!/^\d{4}$/.test(year)) return null;

  if (!monthStr) return `${year}-01-01`;

  const month = MONTH_MAP[monthStr.trim()] ?? monthStr.trim().padStart(2, '0');

  if (!dayStr) return `${year}-${month}-01`;

  const day = dayStr.trim().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateContentHash(title: string, abstract: string): string {
  return crypto
    .createHash('sha256')
    .update((title + abstract).toLowerCase().trim())
    .digest('hex');
}

export function getJournalCredibility(
  journalAbbrev: string,
): 'tier1_journal' | 'peer_reviewed' | 'preprint' {
  // Exact match first
  if (JOURNAL_CREDIBILITY[journalAbbrev]) {
    return JOURNAL_CREDIBILITY[journalAbbrev];
  }

  // Case-insensitive fallback
  const lower = journalAbbrev.toLowerCase();
  for (const [key, value] of Object.entries(JOURNAL_CREDIBILITY)) {
    if (key.toLowerCase() === lower) {
      return value;
    }
  }

  return 'peer_reviewed';
}

export async function searchPubMed(
  query: string,
  sinceDate?: Date,
): Promise<string[]> {
  const apiKey = process.env.NCBI_API_KEY;

  const params = new URLSearchParams({
    db: 'pubmed',
    retmode: 'json',
    retmax: '500',
    term: query,
  });

  if (apiKey) {
    params.set('api_key', apiKey);
  }

  if (sinceDate) {
    const y = sinceDate.getFullYear();
    const m = String(sinceDate.getMonth() + 1).padStart(2, '0');
    const d = String(sinceDate.getDate()).padStart(2, '0');
    params.set('mindate', `${y}/${m}/${d}`);
    params.set('datetype', 'pdat');
  }

  const url = `${PUBMED_BASE_URL}/esearch.fcgi?${params}`;

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    await sleep(apiKey ? 100 : 334);

    const res = await fetch(url);

    if (res.status === 429 || res.status >= 500) {
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`PubMed esearch ${res.status}, retrying in ${delay}ms...`);
      await sleep(delay);
      continue;
    }

    if (!res.ok) {
      throw new Error(
        `PubMed esearch error: ${res.status} ${res.statusText}`,
      );
    }

    const data = (await res.json()) as {
      esearchresult: { idlist: string[] };
    };
    return data.esearchresult.idlist;
  }

  throw new Error('PubMed esearch: max retries exceeded');
}

export async function fetchPubMedBatch(
  pmids: string[],
): Promise<PubMedArticle[]> {
  const apiKey = process.env.NCBI_API_KEY;
  const articles: PubMedArticle[] = [];
  const batchSize = 200;

  for (let i = 0; i < pmids.length; i += batchSize) {
    const batch = pmids.slice(i, i + batchSize);

    const params = new URLSearchParams({
      db: 'pubmed',
      retmode: 'xml',
      rettype: 'abstract',
      id: batch.join(','),
    });

    if (apiKey) {
      params.set('api_key', apiKey);
    }

    const url = `${PUBMED_BASE_URL}/efetch.fcgi?${params}`;

    const maxRetries = 3;
    let xml = '';

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      await sleep(apiKey ? 100 : 334);

      const res = await fetch(url);

      if (res.status === 429 || res.status >= 500) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(
          `PubMed efetch ${res.status}, retrying in ${delay}ms...`,
        );
        await sleep(delay);
        continue;
      }

      if (!res.ok) {
        throw new Error(
          `PubMed efetch error: ${res.status} ${res.statusText}`,
        );
      }

      xml = await res.text();
      break;
    }

    if (!xml) {
      throw new Error('PubMed efetch: max retries exceeded');
    }

    // Parse individual <PubmedArticle> blocks with regex
    const articleBlocks = xml.match(
      /<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g,
    );
    if (!articleBlocks) continue;

    for (const block of articleBlocks) {
      const pmid = extractFirst(block, /<PMID[^>]*>(\d+)<\/PMID>/);
      if (!pmid) continue;

      const title = stripTags(
        extractFirst(block, /<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/) ?? '',
      );

      // Concatenate all AbstractText elements
      const abstractTexts = extractAll(
        block,
        /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g,
      );
      const abstract = abstractTexts.map(stripTags).join(' ');

      // Authors: LastName + ForeName pairs
      const authors: string[] = [];
      const authorBlocks = block.match(
        /<Author[^>]*>[\s\S]*?<\/Author>/g,
      );
      if (authorBlocks) {
        for (const authorBlock of authorBlocks) {
          const lastName = extractFirst(
            authorBlock,
            /<LastName>([\s\S]*?)<\/LastName>/,
          );
          const foreName = extractFirst(
            authorBlock,
            /<ForeName>([\s\S]*?)<\/ForeName>/,
          );
          if (lastName) {
            authors.push(foreName ? `${lastName} ${foreName}` : lastName);
          }
        }
      }

      // Institutions from AffiliationInfo
      const institutions = extractAll(
        block,
        /<AffiliationInfo>\s*<Affiliation>([\s\S]*?)<\/Affiliation>\s*<\/AffiliationInfo>/g,
      ).map(stripTags);

      // Journal fields
      const journalAbbrev =
        extractFirst(block, /<ISOAbbreviation>([\s\S]*?)<\/ISOAbbreviation>/) ??
        '';
      const journalFull =
        extractFirst(
          block,
          /<Journal>[\s\S]*?<Title>([\s\S]*?)<\/Title>[\s\S]*?<\/Journal>/,
        ) ?? '';

      // DOI
      const doi =
        extractFirst(
          block,
          /<ArticleId IdType="doi">([\s\S]*?)<\/ArticleId>/,
        ) ?? null;

      // Publish date
      const pubDateBlock = extractFirst(
        block,
        /<PubDate>([\s\S]*?)<\/PubDate>/,
      );
      let publishedDate: string | null = null;
      if (pubDateBlock) {
        const year = extractFirst(pubDateBlock, /<Year>(\d{4})<\/Year>/);
        const month = extractFirst(pubDateBlock, /<Month>([\s\S]*?)<\/Month>/);
        const day = extractFirst(pubDateBlock, /<Day>(\d+)<\/Day>/);
        if (year) {
          publishedDate = parsePubMedDate(
            year,
            month ?? undefined,
            day ?? undefined,
          );
        }
      }

      // Publication types
      const publicationType = extractAll(
        block,
        /<PublicationType[^>]*>([\s\S]*?)<\/PublicationType>/g,
      ).map(stripTags);

      articles.push({
        pmid,
        title,
        abstract,
        authors,
        institutions: [...new Set(institutions)],
        journalAbbrev: stripTags(journalAbbrev),
        journalFull: stripTags(journalFull),
        doi,
        publishedDate,
        publicationType,
      });
    }
  }

  return articles;
}

export async function fetchPubMedSingle(pmid: string): Promise<PubMedArticle | null> {
  const batch = await fetchPubMedBatch([pmid]);
  return batch.length > 0 ? batch[0] : null;
}

// --- Regex helpers ---

function extractFirst(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match ? match[1] : null;
}

function extractAll(text: string, pattern: RegExp): string[] {
  const results: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    results.push(match[1]);
  }
  return results;
}

// ============================================================================
// FDA openFDA Client
// ============================================================================

export interface FDAItem {
  id: string;
  title: string;
  content: string;
  drugName: string;
  genericName: string;
  effectiveDate: string;
  type: 'approval' | 'safety';
  boxedWarning?: string;
}

const BREAST_CANCER_DRUGS = [
  'trastuzumab', 'pertuzumab', 'ado-trastuzumab', 'fam-trastuzumab',
  'palbociclib', 'ribociclib', 'abemaciclib', 'tamoxifen', 'letrozole',
  'anastrozole', 'exemestane', 'fulvestrant', 'capecitabine', 'doxorubicin',
  'cyclophosphamide', 'paclitaxel', 'docetaxel', 'carboplatin',
  'pembrolizumab', 'atezolizumab', 'olaparib', 'talazoparib',
  'sacituzumab', 'tucatinib', 'neratinib', 'alpelisib', 'everolimus',
  'eribulin', 'vinorelbine', 'elacestrant', 'capivasertib',
];

export async function fetchFDADrugApprovals(sinceDate?: Date): Promise<FDAItem[]> {
  const apiKey = process.env.OPENFDA_API_KEY;
  const dateStr = sinceDate
    ? `${sinceDate.getFullYear()}${String(sinceDate.getMonth() + 1).padStart(2, '0')}${String(sinceDate.getDate()).padStart(2, '0')}`
    : '20200101';

  const params = new URLSearchParams({
    search: `indications_and_usage:"breast+cancer"+AND+effective_time:[${dateStr}+TO+*]`,
    sort: 'effective_time:desc',
    limit: '50',
  });
  if (apiKey) params.set('api_key', apiKey);

  await sleep(500);

  try {
    const res = await fetch(`https://api.fda.gov/drug/label.json?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    const results: FDAItem[] = [];

    for (const result of data.results ?? []) {
      const brandName = result.openfda?.brand_name?.[0] ?? 'Unknown';
      const genericName = result.openfda?.generic_name?.[0] ?? '';
      const indications = Array.isArray(result.indications_and_usage)
        ? result.indications_and_usage.join(' ')
        : (result.indications_and_usage ?? '');
      const effectiveTime = result.effective_time ?? '';
      const boxedWarning = Array.isArray(result.boxed_warning)
        ? result.boxed_warning.join(' ')
        : (result.boxed_warning ?? undefined);
      const appNumber = result.openfda?.application_number?.[0] ?? result.id ?? `fda-${Date.now()}`;

      results.push({
        id: appNumber,
        title: `FDA: ${brandName} (${genericName}) — Label Update`,
        content: indications.slice(0, 5000),
        drugName: brandName,
        genericName,
        effectiveDate: effectiveTime,
        type: boxedWarning ? 'safety' : 'approval',
        boxedWarning: boxedWarning || undefined,
      });
    }

    return results;
  } catch (err) {
    console.error('FDA drug approvals fetch error:', err);
    return [];
  }
}

export async function fetchFDASafetyAlerts(drugNames?: string[]): Promise<FDAItem[]> {
  const apiKey = process.env.OPENFDA_API_KEY;
  const drugs = drugNames ?? BREAST_CANCER_DRUGS.slice(0, 10);
  const results: FDAItem[] = [];

  for (const drug of drugs) {
    await sleep(500);

    try {
      const params = new URLSearchParams({
        search: `patient.drug.openfda.brand_name:"${drug}"`,
        sort: 'receivedate:desc',
        limit: '5',
      });
      if (apiKey) params.set('api_key', apiKey);

      const res = await fetch(`https://api.fda.gov/drug/event.json?${params}`);
      if (!res.ok) continue;

      const data = await res.json();

      for (const event of (data.results ?? []).slice(0, 2)) {
        const safetyId = event.safetyreportid ?? `fda-event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const reactions = (event.patient?.reaction ?? [])
          .map((r: any) => r.reactionmeddrapt)
          .filter(Boolean)
          .join(', ');
        const serious = event.serious === '1' ? '[SERIOUS] ' : '';

        results.push({
          id: safetyId,
          title: `${serious}FDA Safety: ${drug} — Adverse Event Report`,
          content: `Drug: ${drug}. Reactions: ${reactions || 'Not specified'}. Received: ${event.receivedate || 'Unknown'}.`,
          drugName: drug,
          genericName: drug,
          effectiveDate: event.receivedate ?? '',
          type: 'safety',
        });
      }
    } catch (err) {
      console.error(`FDA safety fetch error for ${drug}:`, err);
    }
  }

  return results;
}

// ============================================================================
// bioRxiv / medRxiv Client
// ============================================================================

export interface PreprintArticle {
  doi: string;
  title: string;
  abstract: string;
  authors: string[];
  date: string;
  server: 'biorxiv' | 'medrxiv';
  category: string;
}

const BREAST_CANCER_KEYWORDS = [
  'breast cancer', 'breast tumor', 'breast tumour', 'mammary',
  'triple negative', 'her2', 'brca', 'trastuzumab', 'mastectomy',
  'ductal carcinoma', 'lobular carcinoma', 'breast oncology',
];

function matchesBreastCancer(text: string): boolean {
  const lower = text.toLowerCase();
  return BREAST_CANCER_KEYWORDS.some(kw => lower.includes(kw));
}

export async function fetchPreprints(sinceDate: Date): Promise<PreprintArticle[]> {
  const results: PreprintArticle[] = [];
  const startDate = formatDateYMD(sinceDate);
  const endDate = formatDateYMD(new Date());

  for (const server of ['biorxiv', 'medrxiv'] as const) {
    await sleep(200);

    try {
      const url = `https://api.biorxiv.org/details/${server}/${startDate}/${endDate}/0/100`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      const collection = data.collection ?? [];

      for (const item of collection) {
        const title = item.title ?? '';
        const abstract = item.abstract ?? '';

        if (!matchesBreastCancer(title + ' ' + abstract)) continue;

        const authorStr = item.authors ?? '';
        const authors = authorStr
          .split(';')
          .map((a: string) => a.trim())
          .filter(Boolean);

        results.push({
          doi: item.doi ?? '',
          title,
          abstract,
          authors,
          date: item.date ?? '',
          server,
          category: item.category ?? '',
        });
      }
    } catch (err) {
      console.error(`Preprint fetch error (${server}):`, err);
    }
  }

  return results;
}

// ============================================================================
// ClinicalTrials.gov v2 Client
// ============================================================================

export interface TrialUpdate {
  nctId: string;
  briefTitle: string;
  briefSummary: string;
  detailedDescription: string;
  status: string;
  phase: string;
  hasResults: boolean;
  lastUpdateDate: string;
  sponsor: string;
  conditions: string[];
}

export async function fetchTrialUpdates(sinceDate: Date): Promise<TrialUpdate[]> {
  const dateStr = formatDateYMD(sinceDate);
  const results: TrialUpdate[] = [];

  await sleep(350);

  try {
    const params = new URLSearchParams({
      'query.cond': 'breast cancer',
      'filter.advanced': `AREA[LastUpdatePostDate]RANGE[${dateStr},MAX]`,
      pageSize: '100',
      format: 'json',
    });

    const res = await fetch(`https://clinicaltrials.gov/api/v2/studies?${params}`);
    if (!res.ok) return [];

    const data = await res.json();

    for (const study of data.studies ?? []) {
      const proto = study.protocolSection ?? {};
      const ident = proto.identificationModule ?? {};
      const status = proto.statusModule ?? {};
      const design = proto.designModule ?? {};
      const desc = proto.descriptionModule ?? {};
      const sponsor = proto.sponsorCollaboratorsModule?.leadSponsor?.name ?? '';
      const conditions = proto.conditionsModule?.conditions ?? [];
      const hasResults = study.hasResults ?? false;
      const lastUpdate = status.lastUpdatePostDateStruct?.date ?? '';

      // Only include new registrations or results postings
      const overallStatus = status.overallStatus ?? '';
      const isNew = overallStatus === 'Not yet recruiting' || overallStatus === 'Recruiting';
      if (!isNew && !hasResults) continue;

      results.push({
        nctId: ident.nctId ?? '',
        briefTitle: ident.briefTitle ?? '',
        briefSummary: desc.briefSummary ?? '',
        detailedDescription: desc.detailedDescription ?? '',
        status: overallStatus,
        phase: (design.phases ?? []).join('/') || 'N/A',
        hasResults,
        lastUpdateDate: lastUpdate,
        sponsor,
        conditions,
      });
    }
  } catch (err) {
    console.error('ClinicalTrials.gov fetch error:', err);
  }

  return results;
}

// ============================================================================
// Institutional Newsroom RSS Client
// ============================================================================

export interface NewsItem {
  guid: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  institution: string;
}

const INSTITUTION_FEEDS: Array<{ name: string; url: string }> = [
  { name: 'NCI', url: 'https://www.cancer.gov/news-events/cancer-currents/rss.xml' },
  { name: 'MSK', url: 'https://www.mskcc.org/news/news-releases/rss.xml' },
  { name: 'MD Anderson', url: 'https://www.mdanderson.org/newsroom.xml' },
  { name: 'Dana-Farber', url: 'https://blog.dana-farber.org/insight/feed/' },
  { name: 'Mayo Clinic', url: 'https://newsnetwork.mayoclinic.org/feed/' },
  { name: 'Johns Hopkins', url: 'https://www.hopkinsmedicine.org/news/media/releases/rss' },
  { name: 'Cleveland Clinic', url: 'https://newsroom.clevelandclinic.org/feed/' },
];

export async function fetchInstitutionNews(sinceDate: Date): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  const sinceMs = sinceDate.getTime();

  for (const feed of INSTITUTION_FEEDS) {
    await sleep(500);

    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'OncoVax/1.0 (research-aggregator)' },
      });
      if (!res.ok) continue;

      const xml = await res.text();

      // Parse RSS <item> blocks
      const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

      for (const block of itemBlocks) {
        const title = stripTags(extractFirst(block, /<title>([\s\S]*?)<\/title>/) ?? '');
        const description = stripTags(extractFirst(block, /<description>([\s\S]*?)<\/description>/) ?? '');
        const link = extractFirst(block, /<link>([\s\S]*?)<\/link>/) ?? '';
        const pubDateStr = extractFirst(block, /<pubDate>([\s\S]*?)<\/pubDate>/) ?? '';
        const guid = extractFirst(block, /<guid[^>]*>([\s\S]*?)<\/guid>/) ?? link;

        // Filter by date
        if (pubDateStr) {
          const pubDate = new Date(pubDateStr);
          if (!isNaN(pubDate.getTime()) && pubDate.getTime() < sinceMs) continue;
        }

        // Filter by breast/cancer keywords
        if (!matchesBreastCancer(title + ' ' + description)) continue;

        results.push({
          guid: guid || link || `${feed.name}-${Date.now()}`,
          title,
          description,
          link,
          pubDate: pubDateStr,
          institution: feed.name,
        });
      }
    } catch (err) {
      console.error(`Institution news fetch error (${feed.name}):`, err);
    }
  }

  return results;
}

// ============================================================================
// NIH Reporter Client
// ============================================================================

export interface NIHGrant {
  projectNum: string;
  piName: string;
  orgName: string;
  projectTitle: string;
  abstractText: string;
  awardAmount: number;
  fiscalYear: number;
}

export async function fetchNIHGrants(sinceDate?: Date): Promise<NIHGrant[]> {
  await sleep(6000);

  const fromDate = sinceDate
    ? `${String(sinceDate.getMonth() + 1).padStart(2, '0')}/${String(sinceDate.getDate()).padStart(2, '0')}/${sinceDate.getFullYear()}`
    : undefined;

  try {
    const body: any = {
      criteria: {
        advanced_text: 'breast cancer',
        ...(fromDate ? { award_notice_date: { from_date: fromDate } } : {}),
      },
      limit: 50,
      offset: 0,
    };

    const res = await fetch('https://api.reporter.nih.gov/v2/projects/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const results: NIHGrant[] = [];

    for (const project of data.results ?? []) {
      const abstractText = project.abstract_text ?? project.phr_text ?? '';
      if (!matchesBreastCancer(project.project_title + ' ' + abstractText)) continue;

      const piNames = (project.principal_investigators ?? [])
        .map((pi: any) => `${pi.first_name ?? ''} ${pi.last_name ?? ''}`.trim())
        .filter(Boolean);

      results.push({
        projectNum: project.project_num ?? '',
        piName: piNames.join(', ') || 'Unknown',
        orgName: project.organization?.org_name ?? '',
        projectTitle: project.project_title ?? '',
        abstractText,
        awardAmount: project.award_amount ?? 0,
        fiscalYear: project.fiscal_year ?? new Date().getFullYear(),
      });
    }

    return results;
  } catch (err) {
    console.error('NIH Reporter fetch error:', err);
    return [];
  }
}

// ============================================================================
// Shared Date Helper
// ============================================================================

function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
