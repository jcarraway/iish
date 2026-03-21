import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from apps/web/.env
config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '@iish/db/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

import { generateArticle, publishArticle } from '../apps/web/lib/learn-manager';

// ============================================================================
// Article Specs — Batch 2 (50 articles)
// ============================================================================

interface ArticleSpec {
  type: string;
  topic: string;
  primaryKeyword: string;
  cancerType: string;
  category: string;
}

const ARTICLE_SPECS: ArticleSpec[] = [
  // --- treatment (8) ---
  {
    type: 'treatment_profile',
    topic: 'PARP Inhibitors: Olaparib and Talazoparib for BRCA-mutated breast cancer',
    primaryKeyword: 'PARP inhibitor breast cancer',
    cancerType: 'breast',
    category: 'treatment',
  },
  {
    type: 'treatment_profile',
    topic: 'CDK4/6 Inhibitors: Palbociclib, Ribociclib, and Abemaciclib',
    primaryKeyword: 'CDK4/6 inhibitor breast cancer',
    cancerType: 'breast',
    category: 'treatment',
  },
  {
    type: 'treatment_profile',
    topic: 'Enhertu (Trastuzumab Deruxtecan): The ADC changing HER2 treatment',
    primaryKeyword: 'Enhertu trastuzumab deruxtecan',
    cancerType: 'breast',
    category: 'treatment',
  },
  {
    type: 'guide',
    topic: 'Neoadjuvant chemotherapy: What to know before treatment starts',
    primaryKeyword: 'neoadjuvant chemotherapy breast cancer',
    cancerType: 'breast',
    category: 'treatment',
  },
  {
    type: 'explainer',
    topic: 'Endocrine resistance: When hormone therapy stops working',
    primaryKeyword: 'endocrine resistance breast cancer',
    cancerType: 'breast',
    category: 'treatment',
  },
  {
    type: 'treatment_profile',
    topic: 'Platinum chemotherapy in triple-negative breast cancer',
    primaryKeyword: 'platinum chemotherapy TNBC',
    cancerType: 'breast',
    category: 'treatment',
  },
  {
    type: 'guide',
    topic: 'Radiation planning: What to expect and how to prepare',
    primaryKeyword: 'radiation therapy planning breast cancer',
    cancerType: 'breast',
    category: 'treatment',
  },
  {
    type: 'guide',
    topic: 'Clinical trial participation: Benefits, risks, and how to decide',
    primaryKeyword: 'clinical trial participation cancer',
    cancerType: 'breast',
    category: 'treatment',
  },

  // --- decisions (7) ---
  {
    type: 'decision',
    topic: 'When should you get genomic testing? Timing and decision factors',
    primaryKeyword: 'genomic testing timing breast cancer',
    cancerType: 'breast',
    category: 'decisions',
  },
  {
    type: 'decision',
    topic: 'How to choose the right clinical trial for you',
    primaryKeyword: 'choosing clinical trials',
    cancerType: 'breast',
    category: 'decisions',
  },
  {
    type: 'comparison',
    topic: 'Port vs PICC line: Comparing venous access options',
    primaryKeyword: 'port vs PICC line chemotherapy',
    cancerType: 'breast',
    category: 'decisions',
  },
  {
    type: 'decision',
    topic: 'Fertility preservation timing: What to do before treatment',
    primaryKeyword: 'fertility preservation before cancer treatment',
    cancerType: 'breast',
    category: 'decisions',
  },
  {
    type: 'decision',
    topic: 'Reconstruction timing: Immediate vs delayed breast reconstruction',
    primaryKeyword: 'breast reconstruction timing',
    cancerType: 'breast',
    category: 'decisions',
  },
  {
    type: 'guide',
    topic: 'Integrative approaches: Evidence-based complementary therapies during cancer treatment',
    primaryKeyword: 'integrative oncology complementary therapy',
    cancerType: 'breast',
    category: 'decisions',
  },
  {
    type: 'explainer',
    topic: 'Understanding palliative care: It is not just for end of life',
    primaryKeyword: 'palliative care cancer',
    cancerType: 'breast',
    category: 'decisions',
  },

  // --- side-effects (8) ---
  {
    type: 'guide',
    topic: 'Managing cancer-related fatigue: Evidence-based strategies',
    primaryKeyword: 'cancer fatigue management',
    cancerType: 'breast',
    category: 'side-effects',
  },
  {
    type: 'explainer',
    topic: 'Chemo brain: Understanding and coping with cognitive changes',
    primaryKeyword: 'chemo brain cognitive changes',
    cancerType: 'breast',
    category: 'side-effects',
  },
  {
    type: 'guide',
    topic: 'Bone health during and after breast cancer treatment',
    primaryKeyword: 'bone health breast cancer treatment',
    cancerType: 'breast',
    category: 'side-effects',
  },
  {
    type: 'guide',
    topic: 'Weight changes during cancer treatment: What is normal and what to do',
    primaryKeyword: 'weight changes cancer treatment',
    cancerType: 'breast',
    category: 'side-effects',
  },
  {
    type: 'guide',
    topic: 'Skin and nail changes from chemotherapy and targeted therapy',
    primaryKeyword: 'skin changes chemotherapy',
    cancerType: 'breast',
    category: 'side-effects',
  },
  {
    type: 'guide',
    topic: 'Emotional well-being during cancer treatment: What to expect',
    primaryKeyword: 'emotional health cancer treatment',
    cancerType: 'breast',
    category: 'side-effects',
  },
  {
    type: 'guide',
    topic: 'Sleep problems during and after cancer treatment',
    primaryKeyword: 'sleep problems cancer treatment',
    cancerType: 'breast',
    category: 'side-effects',
  },
  {
    type: 'guide',
    topic: 'Sexual health after breast cancer: An honest conversation',
    primaryKeyword: 'sexual health breast cancer',
    cancerType: 'breast',
    category: 'side-effects',
  },

  // --- survivorship (5) ---
  {
    type: 'guide',
    topic: 'Returning to work after cancer treatment: Practical guide',
    primaryKeyword: 'returning to work after cancer',
    cancerType: 'breast',
    category: 'survivorship',
  },
  {
    type: 'guide',
    topic: 'Cardiac monitoring after breast cancer treatment: What you need',
    primaryKeyword: 'cardiac monitoring breast cancer',
    cancerType: 'breast',
    category: 'survivorship',
  },
  {
    type: 'guide',
    topic: 'Bone density monitoring and prevention of osteoporosis after treatment',
    primaryKeyword: 'bone density breast cancer survivor',
    cancerType: 'breast',
    category: 'survivorship',
  },
  {
    type: 'explainer',
    topic: 'Scanxiety: Understanding and managing imaging anxiety',
    primaryKeyword: 'scanxiety imaging anxiety cancer',
    cancerType: 'breast',
    category: 'survivorship',
  },
  {
    type: 'guide',
    topic: 'Financial recovery after cancer: Insurance, debt, and benefits',
    primaryKeyword: 'financial recovery after cancer treatment',
    cancerType: 'breast',
    category: 'survivorship',
  },

  // --- innovation (5) ---
  {
    type: 'landscape',
    topic: 'mRNA cancer vaccines: From COVID to personalized oncology',
    primaryKeyword: 'mRNA cancer vaccine breast cancer',
    cancerType: 'breast',
    category: 'innovation',
  },
  {
    type: 'explainer',
    topic: 'ctDNA-guided therapy: How blood tests are changing treatment decisions',
    primaryKeyword: 'ctDNA guided therapy',
    cancerType: 'breast',
    category: 'innovation',
  },
  {
    type: 'explainer',
    topic: 'HER2-ultralow: A new classification expanding treatment options',
    primaryKeyword: 'HER2 ultralow breast cancer',
    cancerType: 'breast',
    category: 'innovation',
  },
  {
    type: 'landscape',
    topic: 'AI in pathology: How machine learning is improving cancer diagnosis',
    primaryKeyword: 'AI pathology cancer diagnosis',
    cancerType: 'breast',
    category: 'innovation',
  },
  {
    type: 'explainer',
    topic: 'KRAS targeting: New approaches to an undruggable target',
    primaryKeyword: 'KRAS targeted therapy cancer',
    cancerType: 'breast',
    category: 'innovation',
  },

  // --- testing (1) ---
  {
    type: 'biomarker_profile',
    topic: 'ESR1 mutations: What they mean for endocrine therapy resistance',
    primaryKeyword: 'ESR1 mutation breast cancer',
    cancerType: 'breast',
    category: 'testing',
  },

  // --- biomarkers (1) ---
  {
    type: 'biomarker_profile',
    topic: 'PALB2 mutations: The third major breast cancer gene',
    primaryKeyword: 'PALB2 mutation breast cancer',
    cancerType: 'breast',
    category: 'biomarkers',
  },

  // --- diagnosis (5 fill) ---
  {
    type: 'explainer',
    topic: 'Lobular breast cancer: How it differs from ductal',
    primaryKeyword: 'lobular breast cancer',
    cancerType: 'breast',
    category: 'diagnosis',
  },
  {
    type: 'guide',
    topic: 'Inflammatory breast cancer: Rapid diagnosis is critical',
    primaryKeyword: 'inflammatory breast cancer',
    cancerType: 'breast',
    category: 'diagnosis',
  },
  {
    type: 'explainer',
    topic: 'DCIS explained: When is it cancer and when is it not?',
    primaryKeyword: 'DCIS ductal carcinoma in situ',
    cancerType: 'breast',
    category: 'diagnosis',
  },
  {
    type: 'explainer',
    topic: 'Understanding your molecular subtype: Luminal A, Luminal B, HER2-enriched, Basal-like',
    primaryKeyword: 'breast cancer molecular subtypes',
    cancerType: 'breast',
    category: 'diagnosis',
  },
  {
    type: 'guide',
    topic: 'Male breast cancer: Diagnosis, treatment, and unique challenges',
    primaryKeyword: 'male breast cancer',
    cancerType: 'breast',
    category: 'diagnosis',
  },
];

// ============================================================================
// Glossary Terms — Batch 2 (50 terms — anatomy, procedures, general oncology)
// ============================================================================

interface GlossaryTermSeed {
  term: string;
  slug: string;
  shortDefinition: string;
  fullDefinition: string | null;
  fullArticleSlug: string | null;
  aliases: string[];
  category: string;
}

const GLOSSARY_TERMS: GlossaryTermSeed[] = [
  // --- anatomy (10) ---
  {
    term: 'Ductal',
    slug: 'ductal',
    shortDefinition: 'Relating to the milk ducts of the breast. Most breast cancers are ductal carcinomas, starting in the cells lining the milk ducts.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['ductal carcinoma', 'invasive ductal carcinoma', 'IDC'],
    category: 'anatomy',
  },
  {
    term: 'Lobular',
    slug: 'lobular',
    shortDefinition: 'Relating to the milk-producing lobules of the breast. Lobular carcinoma is the second most common type of breast cancer.',
    fullDefinition: null,
    fullArticleSlug: 'lobular-breast-cancer-how-it-differs-from-ductal',
    aliases: ['lobular carcinoma', 'invasive lobular carcinoma', 'ILC'],
    category: 'anatomy',
  },
  {
    term: 'Axilla',
    slug: 'axilla',
    shortDefinition: 'The armpit area. Axillary lymph nodes are the most common first site of breast cancer spread and are evaluated during surgery.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['armpit', 'axillary', 'axillary region'],
    category: 'anatomy',
  },
  {
    term: 'Stroma',
    slug: 'stroma',
    shortDefinition: 'The supportive tissue surrounding cancer cells, including blood vessels, immune cells, and connective tissue. The tumor microenvironment affects treatment response.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['tumor stroma', 'tumor microenvironment', 'TME'],
    category: 'anatomy',
  },
  {
    term: 'Pleura',
    slug: 'pleura',
    shortDefinition: 'The thin tissue lining the lungs and chest wall. Breast cancer can spread to the pleura causing fluid buildup (pleural effusion).',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['pleural', 'pleural membrane', 'pleural space'],
    category: 'anatomy',
  },
  {
    term: 'Peritoneum',
    slug: 'peritoneum',
    shortDefinition: 'The membrane lining the abdominal cavity. Lobular breast cancer in particular can spread to the peritoneum.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['peritoneal', 'peritoneal cavity'],
    category: 'anatomy',
  },
  {
    term: 'Fascia',
    slug: 'fascia',
    shortDefinition: 'Connective tissue that surrounds muscles, organs, and other structures. In breast surgery, the pectoral fascia forms an important surgical plane.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['pectoral fascia', 'muscle fascia'],
    category: 'anatomy',
  },
  {
    term: 'Nipple-Areolar Complex',
    slug: 'nipple-areolar-complex',
    shortDefinition: 'The nipple and surrounding darker skin. Preservation of this area during nipple-sparing mastectomy is an important cosmetic and quality-of-life consideration.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['NAC', 'nipple areola'],
    category: 'anatomy',
  },
  {
    term: 'Pectoralis Muscle',
    slug: 'pectoralis-muscle',
    shortDefinition: 'The chest wall muscle behind the breast. Breast implants for reconstruction may be placed under this muscle.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['pectoralis major', 'pec muscle', 'chest muscle'],
    category: 'anatomy',
  },
  {
    term: 'Lymphatic System',
    slug: 'lymphatic-system',
    shortDefinition: 'A network of vessels and nodes that drains fluid from tissues and plays a key role in immunity. Cancer can spread through the lymphatic system.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['lymphatics', 'lymph system'],
    category: 'anatomy',
  },

  // --- procedures (10) ---
  {
    term: 'DIEP Flap',
    slug: 'diep-flap',
    shortDefinition: 'A breast reconstruction technique using skin, fat, and blood vessels from the lower abdomen to create a new breast mound without sacrificing muscle.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['deep inferior epigastric perforator flap', 'DIEP reconstruction', 'autologous reconstruction'],
    category: 'procedures',
  },
  {
    term: 'Tissue Expander',
    slug: 'tissue-expander',
    shortDefinition: 'A temporary implant placed during mastectomy that is gradually filled with saline to stretch the skin and muscle before a permanent implant is placed.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['breast expander', 'expander implant'],
    category: 'procedures',
  },
  {
    term: 'Oncoplastic Surgery',
    slug: 'oncoplastic-surgery',
    shortDefinition: 'A surgical approach that combines cancer removal with plastic surgery techniques to achieve better cosmetic outcomes while maintaining oncologic safety.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['oncoplastic', 'oncoplastic breast surgery'],
    category: 'procedures',
  },
  {
    term: 'Bone Scan',
    slug: 'bone-scan',
    shortDefinition: 'A nuclear imaging test that detects areas of increased bone activity, which may indicate cancer spread to bones or bone damage from treatment.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['bone scintigraphy', 'skeletal scintigraphy'],
    category: 'procedures',
  },
  {
    term: 'Echocardiogram',
    slug: 'echocardiogram',
    shortDefinition: 'An ultrasound of the heart used to monitor cardiac function during treatment with drugs like trastuzumab and doxorubicin that can affect the heart.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['echo', 'cardiac ultrasound', 'MUGA scan'],
    category: 'procedures',
  },
  {
    term: 'DEXA Scan',
    slug: 'dexa-scan',
    shortDefinition: 'A bone density test that measures bone mineral density. Important for monitoring bone health during aromatase inhibitor therapy.',
    fullDefinition: null,
    fullArticleSlug: 'bone-density-breast-cancer-survivor',
    aliases: ['DXA scan', 'bone density scan', 'bone mineral density test'],
    category: 'procedures',
  },
  {
    term: 'Lymphedema Therapy',
    slug: 'lymphedema-therapy',
    shortDefinition: 'Specialized treatment for swelling caused by lymph node removal or radiation. Includes manual lymph drainage, compression garments, and exercise.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['CDT', 'complete decongestive therapy', 'lymphedema management'],
    category: 'procedures',
  },
  {
    term: 'Radiation Boost',
    slug: 'radiation-boost',
    shortDefinition: 'An extra dose of radiation delivered to the tumor bed area after whole breast radiation. A boost reduces local recurrence risk.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['boost radiation', 'tumor bed boost'],
    category: 'procedures',
  },
  {
    term: 'Proton Therapy',
    slug: 'proton-therapy',
    shortDefinition: 'A type of radiation therapy using proton beams instead of X-rays. May reduce radiation to the heart and lungs for left-sided breast cancer.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['proton beam therapy', 'proton radiation'],
    category: 'procedures',
  },
  {
    term: 'Intraoperative Radiation',
    slug: 'intraoperative-radiation',
    shortDefinition: 'A single dose of radiation delivered directly to the tumor bed during lumpectomy surgery. May replace weeks of external radiation for select patients.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['IORT', 'intraoperative radiotherapy'],
    category: 'procedures',
  },

  // --- general oncology (15) ---
  {
    term: 'Pathologic Complete Response',
    slug: 'pathologic-complete-response',
    shortDefinition: 'No cancer found in breast tissue or lymph nodes after neoadjuvant therapy. pCR is a strong predictor of favorable long-term outcomes.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['pCR', 'complete pathological response'],
    category: 'general',
  },
  {
    term: 'Minimal Residual Disease',
    slug: 'minimal-residual-disease',
    shortDefinition: 'Tiny amounts of cancer remaining after treatment that are undetectable by standard tests. ctDNA can detect MRD months before clinical recurrence.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['MRD', 'residual disease', 'molecular residual disease'],
    category: 'general',
  },
  {
    term: 'Biomarker',
    slug: 'biomarker-general',
    shortDefinition: 'A measurable indicator of a biological state. In cancer, biomarkers include proteins, genes, and other molecules that guide diagnosis and treatment.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['biological marker', 'tumor marker'],
    category: 'general',
  },
  {
    term: 'Overall Survival',
    slug: 'overall-survival',
    shortDefinition: 'The length of time from diagnosis or start of treatment that patients are still alive. OS is the gold standard endpoint in cancer clinical trials.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['OS', 'survival rate', 'median survival'],
    category: 'general',
  },
  {
    term: 'Progression-Free Survival',
    slug: 'progression-free-survival',
    shortDefinition: 'The length of time during and after treatment that cancer does not grow or spread. PFS is commonly used to evaluate treatment effectiveness.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['PFS', 'time to progression'],
    category: 'general',
  },
  {
    term: 'Hazard Ratio',
    slug: 'hazard-ratio',
    shortDefinition: 'A statistical measure comparing the rate of an event (like death or progression) between two groups. HR < 1.0 means the treatment group has lower risk.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['HR', 'risk ratio'],
    category: 'general',
  },
  {
    term: 'Confidence Interval',
    slug: 'confidence-interval',
    shortDefinition: 'A range of values that likely contains the true effect of a treatment. A 95% CI means there is 95% confidence the true value falls within this range.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['CI', '95% CI'],
    category: 'general',
  },
  {
    term: 'NCCN Guidelines',
    slug: 'nccn-guidelines',
    shortDefinition: 'Evidence-based treatment recommendations developed by the National Comprehensive Cancer Network. NCCN guidelines are the standard of care reference in the US.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['NCCN', 'National Comprehensive Cancer Network', 'treatment guidelines'],
    category: 'general',
  },
  {
    term: 'Compassionate Use',
    slug: 'compassionate-use',
    shortDefinition: 'Access to an unapproved drug outside of a clinical trial for patients with serious conditions who have no other treatment options.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['expanded access', 'right to try', 'pre-approval access'],
    category: 'general',
  },
  {
    term: 'Informed Consent',
    slug: 'informed-consent',
    shortDefinition: 'The process of learning about a treatment, test, or clinical trial and agreeing to participate based on understanding the benefits, risks, and alternatives.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['consent form', 'patient consent'],
    category: 'general',
  },
  {
    term: 'Tumor Board',
    slug: 'tumor-board',
    shortDefinition: 'A meeting where doctors from different specialties discuss a patient\'s diagnosis and treatment options together. Also called a multidisciplinary team review.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['MDT', 'multidisciplinary team', 'cancer board'],
    category: 'general',
  },
  {
    term: 'Second Line Therapy',
    slug: 'second-line-therapy',
    shortDefinition: 'Treatment given after the first treatment (first-line) stops working or causes too many side effects. Each subsequent line uses different drugs or combinations.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['2L', 'second-line treatment', 'subsequent therapy'],
    category: 'general',
  },
  {
    term: 'Drug Resistance',
    slug: 'drug-resistance',
    shortDefinition: 'When cancer cells no longer respond to a drug that previously worked. Resistance can develop through genetic mutations or other mechanisms.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['treatment resistance', 'acquired resistance', 'primary resistance'],
    category: 'general',
  },
  {
    term: 'Dose Reduction',
    slug: 'dose-reduction',
    shortDefinition: 'Lowering the amount of a drug given due to side effects. Dose reductions help patients continue treatment while managing toxicity.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['dose modification', 'dose adjustment'],
    category: 'general',
  },
  {
    term: 'Performance Status',
    slug: 'performance-status',
    shortDefinition: 'A measure of how well a patient can carry out daily activities. Performance status helps determine whether a patient can tolerate specific treatments.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['ECOG', 'ECOG performance status', 'Karnofsky score', 'PS'],
    category: 'general',
  },

  // --- treatments (5) ---
  {
    term: 'Aromatase Inhibitor',
    slug: 'aromatase-inhibitor',
    shortDefinition: 'A class of hormone therapy drugs that lower estrogen levels by blocking the aromatase enzyme. Used in postmenopausal ER-positive breast cancer.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['AI', 'letrozole', 'anastrozole', 'exemestane'],
    category: 'treatments',
  },
  {
    term: 'GnRH Agonist',
    slug: 'gnrh-agonist',
    shortDefinition: 'A drug that suppresses ovarian function in premenopausal women. Used for ovarian suppression in ER-positive breast cancer or fertility preservation.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['goserelin', 'leuprolide', 'Zoladex', 'Lupron', 'LHRH agonist'],
    category: 'treatments',
  },
  {
    term: 'Bisphosphonate',
    slug: 'bisphosphonate',
    shortDefinition: 'A drug that strengthens bones and prevents bone loss. Used to treat bone metastases and prevent osteoporosis from aromatase inhibitors.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['zoledronic acid', 'Zometa', 'denosumab', 'Xgeva'],
    category: 'treatments',
  },
  {
    term: 'PI3K Inhibitor',
    slug: 'pi3k-inhibitor',
    shortDefinition: 'A targeted therapy that blocks the PI3K pathway, commonly mutated in ER-positive breast cancer. Alpelisib and inavolisib target PIK3CA mutations.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['alpelisib', 'Piqray', 'inavolisib', 'PI3K pathway inhibitor'],
    category: 'treatments',
  },
  {
    term: 'Sacituzumab Govitecan',
    slug: 'sacituzumab-govitecan',
    shortDefinition: 'An ADC targeting Trop-2 approved for triple-negative and ER-positive metastatic breast cancer that has not responded to other treatments.',
    fullDefinition: null,
    fullArticleSlug: null,
    aliases: ['Trodelvy', 'SG', 'Trop-2 ADC'],
    category: 'treatments',
  },
];

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('=== Seeding LEARN Batch 2: 50 Articles + 50 Glossary Terms ===\n');

  // --- Step 1: Upsert 50 glossary terms ---
  console.log(`Seeding ${GLOSSARY_TERMS.length} glossary terms...`);
  let glossaryCount = 0;
  for (const term of GLOSSARY_TERMS) {
    await prisma.glossaryTerm.upsert({
      where: { term: term.term },
      create: term,
      update: {
        slug: term.slug,
        shortDefinition: term.shortDefinition,
        fullDefinition: term.fullDefinition,
        fullArticleSlug: term.fullArticleSlug,
        aliases: term.aliases,
        category: term.category,
      },
    });
    glossaryCount++;
    console.log(`  [${glossaryCount}/${GLOSSARY_TERMS.length}] ${term.term}`);
  }
  console.log(`\nSeeded ${glossaryCount} glossary terms.\n`);

  // --- Step 2: Generate 50 articles via Claude AI ---
  console.log('Generating 50 articles via Claude AI (this will take a while)...\n');
  const generatedArticles: { id: string; slug: string; title: string }[] = [];

  for (let i = 0; i < ARTICLE_SPECS.length; i++) {
    const spec = ARTICLE_SPECS[i];
    console.log(`  [${i + 1}/${ARTICLE_SPECS.length}] Generating: "${spec.topic}" (${spec.type}, ${spec.category})...`);
    try {
      const article = await generateArticle(spec);
      generatedArticles.push({ id: article.id, slug: article.slug, title: article.title });
      console.log(`          -> Created: ${article.slug}`);
    } catch (err) {
      console.error(`          -> FAILED: ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`\nGenerated ${generatedArticles.length} of ${ARTICLE_SPECS.length} articles.\n`);

  // --- Step 3: Publish all generated articles ---
  console.log('Publishing articles...');
  let publishedCount = 0;
  for (const article of generatedArticles) {
    try {
      await publishArticle(article.id);
      publishedCount++;
      console.log(`  [${publishedCount}/${generatedArticles.length}] Published: ${article.slug}`);
    } catch (err) {
      console.error(`  FAILED to publish ${article.slug}: ${err instanceof Error ? err.message : err}`);
    }
  }

  // --- Summary ---
  console.log('\n=== Seed Batch 2 Complete ===');
  console.log(`  Glossary terms: ${glossaryCount}`);
  console.log(`  Articles generated: ${generatedArticles.length}`);
  console.log(`  Articles published: ${publishedCount}`);
  console.log(`  Categories: ${[...new Set(ARTICLE_SPECS.map((s) => s.category))].join(', ')}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
