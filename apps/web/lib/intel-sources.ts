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
