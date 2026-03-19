import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from apps/web/.env
config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '@oncovax/db/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Will be created as part of the LEARN module
import { generateArticle, publishArticle, ARTICLE_CATEGORIES } from '../apps/web/lib/learn-manager';

// ============================================================================
// Article Specs (25 articles across 8 categories)
// ============================================================================

interface ArticleSpec {
  type: string;
  topic: string;
  primaryKeyword: string;
  cancerType: string;
  category: string;
}

const ARTICLE_SPECS: ArticleSpec[] = [
  // --- diagnosis (4) ---
  {
    type: 'explainer',
    topic: 'What is HER2-low breast cancer?',
    primaryKeyword: 'HER2-low breast cancer',
    cancerType: 'breast',
    category: 'diagnosis',
  },
  {
    type: 'guide',
    topic: 'How to read your pathology report',
    primaryKeyword: 'pathology report',
    cancerType: 'breast',
    category: 'diagnosis',
  },
  {
    type: 'explainer',
    topic: 'Understanding breast cancer staging',
    primaryKeyword: 'breast cancer staging',
    cancerType: 'breast',
    category: 'diagnosis',
  },
  {
    type: 'explainer',
    topic: 'Triple-negative breast cancer explained',
    primaryKeyword: 'triple-negative breast cancer',
    cancerType: 'breast',
    category: 'diagnosis',
  },

  // --- biomarkers (3) ---
  {
    type: 'biomarker_profile',
    topic: 'PIK3CA mutations in breast cancer',
    primaryKeyword: 'PIK3CA mutation',
    cancerType: 'breast',
    category: 'biomarkers',
  },
  {
    type: 'biomarker_profile',
    topic: 'BRCA1 and BRCA2: What you need to know',
    primaryKeyword: 'BRCA mutation',
    cancerType: 'breast',
    category: 'biomarkers',
  },
  {
    type: 'biomarker_profile',
    topic: 'Understanding HER2 status',
    primaryKeyword: 'HER2 status',
    cancerType: 'breast',
    category: 'biomarkers',
  },

  // --- treatment (4) ---
  {
    type: 'treatment_profile',
    topic: 'AC-T chemotherapy: What to expect',
    primaryKeyword: 'AC-T chemotherapy',
    cancerType: 'breast',
    category: 'treatment',
  },
  {
    type: 'treatment_profile',
    topic: 'Hormone therapy for ER-positive breast cancer',
    primaryKeyword: 'hormone therapy breast cancer',
    cancerType: 'breast',
    category: 'treatment',
  },
  {
    type: 'treatment_profile',
    topic: 'Immunotherapy in breast cancer',
    primaryKeyword: 'immunotherapy breast cancer',
    cancerType: 'breast',
    category: 'treatment',
  },
  {
    type: 'guide',
    topic: 'Understanding radiation therapy',
    primaryKeyword: 'radiation therapy',
    cancerType: 'breast',
    category: 'treatment',
  },

  // --- testing (3) ---
  {
    type: 'test_profile',
    topic: 'Oncotype DX: Is genomic testing right for you?',
    primaryKeyword: 'Oncotype DX',
    cancerType: 'breast',
    category: 'testing',
  },
  {
    type: 'test_profile',
    topic: 'FoundationOne CDx explained',
    primaryKeyword: 'FoundationOne CDx',
    cancerType: 'breast',
    category: 'testing',
  },
  {
    type: 'explainer',
    topic: 'What is liquid biopsy?',
    primaryKeyword: 'liquid biopsy',
    cancerType: 'breast',
    category: 'testing',
  },

  // --- decisions (3) ---
  {
    type: 'decision',
    topic: 'Lumpectomy vs mastectomy',
    primaryKeyword: 'lumpectomy vs mastectomy',
    cancerType: 'breast',
    category: 'decisions',
  },
  {
    type: 'questions',
    topic: 'Should I get a second opinion?',
    primaryKeyword: 'cancer second opinion',
    cancerType: 'breast',
    category: 'decisions',
  },
  {
    type: 'questions',
    topic: 'Questions to ask your oncologist at every visit',
    primaryKeyword: 'oncologist questions',
    cancerType: 'breast',
    category: 'decisions',
  },

  // --- side-effects (3) ---
  {
    type: 'guide',
    topic: 'Managing chemotherapy side effects',
    primaryKeyword: 'chemotherapy side effects',
    cancerType: 'breast',
    category: 'side-effects',
  },
  {
    type: 'guide',
    topic: 'Cold capping to prevent hair loss',
    primaryKeyword: 'cold capping',
    cancerType: 'breast',
    category: 'side-effects',
  },
  {
    type: 'guide',
    topic: 'Neuropathy during cancer treatment',
    primaryKeyword: 'neuropathy cancer treatment',
    cancerType: 'breast',
    category: 'side-effects',
  },

  // --- survivorship (3) ---
  {
    type: 'explainer',
    topic: 'Your survivorship care plan explained',
    primaryKeyword: 'survivorship care plan',
    cancerType: 'breast',
    category: 'survivorship',
  },
  {
    type: 'guide',
    topic: 'Fear of recurrence: What is normal',
    primaryKeyword: 'fear of recurrence',
    cancerType: 'breast',
    category: 'survivorship',
  },
  {
    type: 'guide',
    topic: 'Exercise after cancer treatment',
    primaryKeyword: 'exercise after cancer',
    cancerType: 'breast',
    category: 'survivorship',
  },

  // --- innovation (2) ---
  {
    type: 'landscape',
    topic: 'Personalized cancer vaccines: The science',
    primaryKeyword: 'personalized cancer vaccine',
    cancerType: 'breast',
    category: 'innovation',
  },
  {
    type: 'landscape',
    topic: 'ADC therapies: A new class of treatment',
    primaryKeyword: 'ADC therapy',
    cancerType: 'breast',
    category: 'innovation',
  },
];

// ============================================================================
// Glossary Terms (50 terms across 6 categories)
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
  // --- biomarkers (10) ---
  {
    term: 'HER2',
    slug: 'her2',
    shortDefinition: 'Human epidermal growth factor receptor 2, a protein that promotes cell growth. When overexpressed, it drives certain breast cancers to grow more aggressively.',
    fullDefinition: 'HER2 (human epidermal growth factor receptor 2) is a protein encoded by the ERBB2 gene. In normal cells, HER2 helps regulate cell growth and repair. In about 15-20% of breast cancers, the HER2 gene is amplified, producing excess HER2 protein that drives aggressive tumor growth. HER2 status is determined by IHC (immunohistochemistry) and FISH (fluorescence in situ hybridization) testing. HER2-positive cancers are treated with targeted therapies like trastuzumab (Herceptin). A newer classification, HER2-low (IHC 1+ or IHC 2+/FISH-negative), has opened the door to treatments like trastuzumab deruxtecan (Enhertu).',
    fullArticleSlug: 'understanding-her2-status',
    aliases: ['HER2/neu', 'ERBB2', 'human epidermal growth factor receptor 2'],
    category: 'biomarkers',
  },
  {
    term: 'ER (Estrogen Receptor)',
    slug: 'estrogen-receptor',
    shortDefinition: 'A protein on breast cancer cells that binds to estrogen. ER-positive cancers use estrogen to grow and can be treated with hormone-blocking therapies.',
    fullDefinition: 'Estrogen receptors (ER) are proteins found inside cells that are activated by the hormone estrogen. When breast cancer cells have estrogen receptors (ER-positive), estrogen promotes their growth. About 70-80% of breast cancers are ER-positive. These cancers are treated with endocrine (hormone) therapy such as tamoxifen or aromatase inhibitors, which either block estrogen from reaching cancer cells or reduce estrogen production. ER status is determined by IHC staining of biopsy tissue, with 1% or greater staining considered ER-positive per ASCO/CAP guidelines.',
    fullArticleSlug: null,
    aliases: ['estrogen receptor', 'ER-positive', 'ER+', 'ER-negative', 'ER-'],
    category: 'biomarkers',
  },
  {
    term: 'PR (Progesterone Receptor)',
    slug: 'progesterone-receptor',
    shortDefinition: 'A protein on breast cancer cells that binds to progesterone. PR status is usually reported alongside ER status and helps guide hormone therapy decisions.',
    fullDefinition: 'Progesterone receptors (PR) are proteins activated by the hormone progesterone. PR-positive breast cancers respond to progesterone signaling. PR status is typically reported alongside ER status because both inform endocrine therapy decisions. About 65% of breast cancers are PR-positive. While ER status is the primary driver of hormone therapy decisions, PR status provides additional prognostic information — ER+/PR- cancers may have a slightly worse prognosis than ER+/PR+ cancers.',
    fullArticleSlug: null,
    aliases: ['progesterone receptor', 'PR-positive', 'PR+', 'PR-negative', 'PR-'],
    category: 'biomarkers',
  },
  {
    term: 'BRCA1',
    slug: 'brca1',
    shortDefinition: 'A gene that helps repair DNA damage. Inherited mutations in BRCA1 significantly increase the risk of breast and ovarian cancer.',
    fullDefinition: 'BRCA1 (BReast CAncer gene 1) is a tumor suppressor gene located on chromosome 17. It produces a protein involved in repairing double-strand DNA breaks through homologous recombination. When BRCA1 is mutated, this repair mechanism fails, leading to genomic instability and increased cancer risk. Women with inherited BRCA1 mutations have a 55-72% lifetime risk of breast cancer and a 39-44% risk of ovarian cancer. BRCA1-associated breast cancers are more likely to be triple-negative. Treatment implications include eligibility for PARP inhibitors (olaparib, talazoparib) and platinum-based chemotherapy.',
    fullArticleSlug: 'brca1-brca2-what-to-know',
    aliases: ['BRCA1 gene', 'breast cancer gene 1'],
    category: 'biomarkers',
  },
  {
    term: 'BRCA2',
    slug: 'brca2',
    shortDefinition: 'A gene that helps repair DNA damage. Inherited mutations in BRCA2 increase the risk of breast, ovarian, prostate, and pancreatic cancers.',
    fullDefinition: 'BRCA2 (BReast CAncer gene 2) is a tumor suppressor gene located on chromosome 13. Like BRCA1, it plays a critical role in DNA repair through homologous recombination. Women with inherited BRCA2 mutations have a 45-69% lifetime risk of breast cancer. Unlike BRCA1 mutations, BRCA2-associated breast cancers can be any subtype, including ER-positive. BRCA2 mutations also increase risk for ovarian cancer (11-17%), male breast cancer, prostate cancer, and pancreatic cancer. PARP inhibitors are effective in BRCA2-mutated cancers because they exploit the DNA repair deficiency.',
    fullArticleSlug: 'brca1-brca2-what-to-know',
    aliases: ['BRCA2 gene', 'breast cancer gene 2'],
    category: 'biomarkers',
  },
  {
    term: 'PIK3CA',
    slug: 'pik3ca',
    shortDefinition: 'A gene commonly mutated in ER-positive breast cancer. PIK3CA mutations can be targeted with specific drugs like alpelisib or inavolisib.',
    fullDefinition: 'PIK3CA encodes the p110-alpha catalytic subunit of PI3-kinase, an enzyme in the PI3K/AKT/mTOR signaling pathway that regulates cell growth, survival, and metabolism. PIK3CA mutations occur in approximately 40% of ER-positive breast cancers, making it one of the most commonly mutated genes in this subtype. The most frequent hotspot mutations are H1047R, E545K, and E542K. PIK3CA-mutated ER+ breast cancers can be treated with PI3K inhibitors such as alpelisib (Piqray) combined with fulvestrant, or the newer inavolisib. Testing for PIK3CA mutations is now recommended in metastatic ER+/HER2- breast cancer.',
    fullArticleSlug: 'pik3ca-mutation-treatment-options',
    aliases: ['PIK3CA mutation', 'PI3K mutation', 'PI3KCA'],
    category: 'biomarkers',
  },
  {
    term: 'TMB (Tumor Mutational Burden)',
    slug: 'tumor-mutational-burden',
    shortDefinition: 'A measure of how many mutations a tumor has. High TMB may indicate that immunotherapy is more likely to be effective.',
    fullDefinition: 'Tumor mutational burden (TMB) quantifies the total number of somatic mutations per megabase of DNA in a tumor. TMB is measured through comprehensive genomic profiling (CGP) such as FoundationOne CDx. High TMB (typically defined as >=10 mutations/Mb) is associated with increased neoantigen production, which may make tumors more visible to the immune system. The FDA approved pembrolizumab for TMB-high solid tumors regardless of cancer type. In breast cancer, TMB is generally low compared to melanoma or lung cancer, but a subset of triple-negative breast cancers have elevated TMB.',
    fullArticleSlug: null,
    aliases: ['tumor mutational burden', 'TMB-high', 'TMB-H', 'mutation burden'],
    category: 'biomarkers',
  },
  {
    term: 'MSI (Microsatellite Instability)',
    slug: 'microsatellite-instability',
    shortDefinition: 'A condition where DNA repair errors cause changes in short repeated DNA sequences. MSI-high tumors often respond well to immunotherapy.',
    fullDefinition: 'Microsatellite instability (MSI) occurs when the mismatch repair (MMR) system fails to correct errors during DNA replication, leading to changes in the length of short tandem repeat sequences (microsatellites). MSI is classified as MSI-high (MSI-H), MSI-low (MSI-L), or microsatellite stable (MSS). MSI-H tumors accumulate many mutations, producing neoantigens that attract immune cells. The FDA approved pembrolizumab for MSI-H/dMMR solid tumors. MSI-H is relatively rare in breast cancer (1-2%) but is important to test for because it indicates immunotherapy eligibility.',
    fullArticleSlug: null,
    aliases: ['microsatellite instability', 'MSI-high', 'MSI-H', 'MSS', 'dMMR'],
    category: 'biomarkers',
  },
  {
    term: 'PD-L1',
    slug: 'pd-l1',
    shortDefinition: 'A protein on some cancer cells that helps them hide from the immune system. PD-L1-positive tumors may respond to checkpoint inhibitor immunotherapy.',
    fullDefinition: 'Programmed death-ligand 1 (PD-L1) is a protein expressed on the surface of some cancer cells and immune cells. PD-L1 binds to PD-1 receptors on T cells, sending an "off" signal that prevents T cells from attacking. Cancer cells can exploit this mechanism to evade immune detection. In breast cancer, PD-L1 expression is most relevant for triple-negative breast cancer (TNBC), where PD-L1-positive tumors can be treated with the checkpoint inhibitor pembrolizumab (Keytruda) combined with chemotherapy. PD-L1 is measured by immunohistochemistry using the Combined Positive Score (CPS).',
    fullArticleSlug: null,
    aliases: ['PD-L1 expression', 'programmed death-ligand 1', 'PD-L1 positive'],
    category: 'biomarkers',
  },
  {
    term: 'Ki-67',
    slug: 'ki-67',
    shortDefinition: 'A protein marker that shows how quickly cancer cells are dividing. Higher Ki-67 levels generally indicate faster-growing, more aggressive tumors.',
    fullDefinition: 'Ki-67 is a nuclear protein present in cells that are actively dividing but absent in resting (G0) cells. The Ki-67 index, measured by IHC staining, represents the percentage of tumor cells that are actively proliferating. In breast cancer, Ki-67 helps distinguish between Luminal A-like (low Ki-67, typically <20%) and Luminal B-like (high Ki-67, typically >=20%) subtypes. High Ki-67 is associated with more aggressive disease but also greater sensitivity to chemotherapy. Ki-67 is sometimes used alongside genomic tests like Oncotype DX to guide chemotherapy decisions in ER+/HER2- early breast cancer.',
    fullArticleSlug: null,
    aliases: ['Ki-67 index', 'Ki67', 'proliferation marker', 'MIB-1'],
    category: 'biomarkers',
  },

  // --- treatments (10) ---
  {
    term: 'Chemotherapy',
    slug: 'chemotherapy',
    shortDefinition: 'Drug treatment that kills rapidly dividing cells throughout the body. Chemotherapy is a cornerstone of cancer treatment, often used before or after surgery.',
    fullDefinition: 'Chemotherapy uses cytotoxic drugs to kill cancer cells or stop them from growing. Unlike targeted therapy, chemotherapy affects all rapidly dividing cells, which is why it causes side effects like hair loss, nausea, and low blood counts. Common breast cancer chemotherapy regimens include AC-T (doxorubicin + cyclophosphamide followed by a taxane), TC (docetaxel + cyclophosphamide), and CMF (cyclophosphamide + methotrexate + fluorouracil). Chemotherapy can be given before surgery (neoadjuvant) to shrink tumors, or after surgery (adjuvant) to kill remaining cancer cells. The decision to use chemotherapy depends on cancer stage, subtype, and genomic test results.',
    fullArticleSlug: null,
    aliases: ['chemo', 'cytotoxic therapy', 'systemic chemotherapy'],
    category: 'treatments',
  },
  {
    term: 'Immunotherapy',
    slug: 'immunotherapy',
    shortDefinition: 'Treatment that helps your immune system recognize and fight cancer cells. In breast cancer, immunotherapy is primarily used for triple-negative subtypes.',
    fullDefinition: 'Immunotherapy harnesses the body\'s own immune system to detect and destroy cancer cells. The most common type in breast cancer is immune checkpoint inhibitors, which remove "brakes" on T cells. Pembrolizumab (Keytruda) is FDA-approved for PD-L1-positive triple-negative breast cancer in combination with chemotherapy, both in metastatic and early-stage settings (KEYNOTE-355, KEYNOTE-522). Immunotherapy is not currently standard for ER-positive or HER2-positive breast cancer, though clinical trials are investigating combinations. Side effects differ from chemotherapy — immune-related adverse events can affect any organ system.',
    fullArticleSlug: 'immunotherapy-breast-cancer',
    aliases: ['immune therapy', 'checkpoint inhibitor therapy', 'IO therapy'],
    category: 'treatments',
  },
  {
    term: 'Hormone Therapy',
    slug: 'hormone-therapy',
    shortDefinition: 'Treatment that blocks or lowers hormones to slow or stop the growth of hormone receptor-positive cancers. Usually taken for 5-10 years after primary treatment.',
    fullDefinition: 'Hormone therapy (also called endocrine therapy) treats hormone receptor-positive breast cancers by reducing estrogen\'s ability to fuel cancer growth. There are several types: tamoxifen blocks estrogen receptors on cancer cells; aromatase inhibitors (anastrozole, letrozole, exemestane) block estrogen production in postmenopausal women; ovarian suppression (goserelin/leuprolide) stops the ovaries from making estrogen in premenopausal women. Hormone therapy is typically taken for 5-10 years and significantly reduces recurrence risk. Side effects include hot flashes, joint pain, bone density loss, and mood changes.',
    fullArticleSlug: 'hormone-therapy-er-positive-breast-cancer',
    aliases: ['endocrine therapy', 'anti-estrogen therapy', 'hormonal therapy'],
    category: 'treatments',
  },
  {
    term: 'Radiation Therapy',
    slug: 'radiation-therapy',
    shortDefinition: 'Treatment that uses high-energy beams to destroy cancer cells in a targeted area. Most commonly used after lumpectomy to reduce the risk of local recurrence.',
    fullDefinition: 'Radiation therapy (radiotherapy) uses ionizing radiation to damage the DNA of cancer cells, causing them to die. External beam radiation is the most common type for breast cancer, typically delivered daily over 3-6 weeks. Newer approaches include hypofractionated radiation (fewer sessions with higher doses per session) and partial breast irradiation (targeting only the tumor bed). Radiation is standard after lumpectomy and sometimes recommended after mastectomy for larger tumors or positive lymph nodes. Side effects include skin changes, fatigue, and rarely, long-term heart or lung effects depending on the treatment area.',
    fullArticleSlug: 'understanding-radiation-therapy',
    aliases: ['radiotherapy', 'radiation', 'XRT', 'RT'],
    category: 'treatments',
  },
  {
    term: 'Targeted Therapy',
    slug: 'targeted-therapy',
    shortDefinition: 'Drugs that target specific proteins or genes that help cancer cells grow, with less damage to normal cells than traditional chemotherapy.',
    fullDefinition: 'Targeted therapy identifies and attacks specific molecular targets on cancer cells while sparing most normal cells. In breast cancer, major targeted therapies include: HER2-targeted agents (trastuzumab, pertuzumab, T-DM1, trastuzumab deruxtecan), CDK4/6 inhibitors (palbociclib, ribociclib, abemaciclib) for ER+ disease, PI3K inhibitors (alpelisib, inavolisib) for PIK3CA-mutated cancers, PARP inhibitors (olaparib, talazoparib) for BRCA-mutated cancers, and mTOR inhibitors (everolimus). These drugs are often combined with hormone therapy or chemotherapy. Side effects are generally different from chemotherapy and depend on the specific target.',
    fullArticleSlug: null,
    aliases: ['molecularly targeted therapy', 'precision therapy'],
    category: 'treatments',
  },
  {
    term: 'ADC (Antibody-Drug Conjugate)',
    slug: 'antibody-drug-conjugate',
    shortDefinition: 'A type of targeted therapy that combines an antibody (which finds the cancer cell) with a chemotherapy drug (which kills it). ADCs deliver chemo directly to cancer cells.',
    fullDefinition: 'Antibody-drug conjugates (ADCs) are engineered molecules that combine a monoclonal antibody targeting a cancer cell surface protein with a potent cytotoxic drug (payload), connected by a chemical linker. The antibody guides the drug directly to cancer cells, where the linker is cleaved and the payload is released inside the cell. In breast cancer, key ADCs include trastuzumab deruxtecan (Enhertu) for HER2-positive and HER2-low disease, trastuzumab emtansine (Kadcyla/T-DM1) for HER2-positive disease, and sacituzumab govitecan (Trodelvy) for triple-negative and ER+/HER2- disease. ADCs represent one of the most significant recent advances in breast cancer treatment.',
    fullArticleSlug: 'adc-therapy-new-class-of-treatment',
    aliases: ['antibody-drug conjugate', 'ADC therapy', 'antibody drug conjugate'],
    category: 'treatments',
  },
  {
    term: 'CAR-T Cell Therapy',
    slug: 'car-t-cell-therapy',
    shortDefinition: 'A treatment that engineers a patient\'s own immune cells to recognize and attack cancer. CAR-T is approved for blood cancers and being investigated for solid tumors including breast cancer.',
    fullDefinition: 'Chimeric antigen receptor T-cell (CAR-T) therapy is a form of immunotherapy where a patient\'s T cells are collected, genetically modified in a lab to express a receptor targeting a specific cancer antigen, expanded in number, and infused back into the patient. CAR-T has transformed treatment for certain blood cancers (B-cell lymphomas, ALL). For breast cancer and other solid tumors, CAR-T remains investigational, with clinical trials targeting HER2, mesothelin, and other antigens. Challenges in solid tumors include the immunosuppressive tumor microenvironment and identifying targets that are on cancer cells but not on essential normal tissues.',
    fullArticleSlug: null,
    aliases: ['CAR-T', 'chimeric antigen receptor T-cell therapy', 'CAR T-cell therapy'],
    category: 'treatments',
  },
  {
    term: 'Checkpoint Inhibitor',
    slug: 'checkpoint-inhibitor',
    shortDefinition: 'A type of immunotherapy drug that removes "brakes" on the immune system, allowing T cells to attack cancer cells. Used in triple-negative breast cancer.',
    fullDefinition: 'Immune checkpoint inhibitors are drugs that block proteins used by cancer cells to evade the immune system. Key checkpoint proteins include PD-1 (on T cells), PD-L1 (on cancer cells), and CTLA-4 (on T cells). By blocking these proteins, checkpoint inhibitors release the "brakes" on the immune system. In breast cancer, pembrolizumab (Keytruda, anti-PD-1) is approved for PD-L1-positive triple-negative breast cancer. Atezolizumab (Tecentriq, anti-PD-L1) was previously approved but has been withdrawn from the breast cancer indication. Checkpoint inhibitors can cause immune-related adverse events affecting skin, gut, liver, lungs, thyroid, and other organs.',
    fullArticleSlug: null,
    aliases: ['immune checkpoint inhibitor', 'ICI', 'checkpoint blockade'],
    category: 'treatments',
  },
  {
    term: 'Monoclonal Antibody',
    slug: 'monoclonal-antibody',
    shortDefinition: 'A lab-made protein designed to bind to a specific target on cancer cells. Monoclonal antibodies can block cancer growth signals or mark cancer cells for immune destruction.',
    fullDefinition: 'Monoclonal antibodies are laboratory-made proteins that mimic the immune system\'s ability to target specific antigens. In cancer treatment, they work through several mechanisms: blocking growth signals (trastuzumab blocks HER2), recruiting immune cells to kill cancer cells (antibody-dependent cellular cytotoxicity), delivering drugs directly to cancer cells (ADCs), or removing immune checkpoints (pembrolizumab). Key monoclonal antibodies in breast cancer include trastuzumab (Herceptin), pertuzumab (Perjeta), and margetuximab (Margenza) for HER2-positive disease. They are typically given intravenously, though subcutaneous formulations exist for some.',
    fullArticleSlug: null,
    aliases: ['mAb', 'monoclonal antibodies', 'biologic therapy'],
    category: 'treatments',
  },
  {
    term: 'Endocrine Therapy',
    slug: 'endocrine-therapy',
    shortDefinition: 'Another name for hormone therapy. Endocrine therapy blocks or reduces hormones that fuel hormone receptor-positive breast cancer growth.',
    fullDefinition: 'Endocrine therapy is the clinical term for hormone therapy in breast cancer. It encompasses several drug classes: selective estrogen receptor modulators (SERMs) like tamoxifen, aromatase inhibitors (AIs) like letrozole, anastrozole, and exemestane, selective estrogen receptor degraders (SERDs) like fulvestrant and elacestrant, and GnRH agonists like goserelin for ovarian suppression. In early-stage ER+ breast cancer, endocrine therapy is typically taken for 5-10 years and reduces recurrence risk by approximately 50%. In metastatic ER+ disease, endocrine therapy is often combined with CDK4/6 inhibitors as first-line treatment.',
    fullArticleSlug: 'hormone-therapy-er-positive-breast-cancer',
    aliases: ['hormone therapy', 'anti-hormone therapy', 'ET'],
    category: 'treatments',
  },

  // --- tests (10) ---
  {
    term: 'Pathology Report',
    slug: 'pathology-report',
    shortDefinition: 'A detailed medical document describing the characteristics of your cancer based on examination of tissue samples. It is the foundation for all treatment decisions.',
    fullDefinition: 'A pathology report is produced by a pathologist who examines tissue from a biopsy or surgery under a microscope. For breast cancer, the report includes: tumor type (ductal, lobular, etc.), grade (1-3, how abnormal cells look), hormone receptor status (ER, PR), HER2 status, Ki-67 proliferation index, tumor size, margin status (whether cancer reaches the edge of removed tissue), lymph node involvement, and lymphovascular invasion. The report may also include genomic test results. Understanding your pathology report is essential because it determines your cancer subtype, stage, and treatment options.',
    fullArticleSlug: 'how-to-read-your-pathology-report',
    aliases: ['pathology results', 'biopsy report', 'surgical pathology report'],
    category: 'tests',
  },
  {
    term: 'Oncotype DX',
    slug: 'oncotype-dx',
    shortDefinition: 'A genomic test that analyzes 21 genes in early-stage ER-positive breast cancer to predict recurrence risk and whether chemotherapy will be beneficial.',
    fullDefinition: 'Oncotype DX is a 21-gene recurrence score assay developed by Exact Sciences. It analyzes RNA from tumor tissue to produce a recurrence score (RS) from 0-100. For women 50 and younger with ER+/HER2-/node-negative breast cancer, RS <16 suggests endocrine therapy alone, RS 16-25 may have uncertain chemotherapy benefit, and RS >=26 suggests chemotherapy benefit (TAILORx trial). For node-positive (1-3 nodes) disease, the RxPONDER trial showed chemotherapy benefit for premenopausal women with RS >=26. Oncotype DX is NCCN-recommended for most early-stage ER+/HER2- breast cancers and is covered by most insurance.',
    fullArticleSlug: 'oncotype-dx-genomic-testing',
    aliases: ['Oncotype', '21-gene assay', 'recurrence score', 'Oncotype DX test'],
    category: 'tests',
  },
  {
    term: 'FoundationOne CDx',
    slug: 'foundationone-cdx',
    shortDefinition: 'A comprehensive genomic profiling test that analyzes 324 genes to identify mutations that may match you to targeted therapies or clinical trials.',
    fullDefinition: 'FoundationOne CDx is an FDA-approved comprehensive genomic profiling (CGP) test by Foundation Medicine. It sequences 324 genes plus genomic signatures including TMB and MSI from formalin-fixed paraffin-embedded (FFPE) tumor tissue. In breast cancer, it can identify actionable mutations such as PIK3CA, BRCA1/2, ESR1, AKT1, PTEN, and HER2 amplification. The test is FDA-approved as a companion diagnostic for multiple targeted therapies. Results typically take 2-3 weeks and are reported through an interactive portal. FoundationOne CDx is most commonly ordered for metastatic breast cancer or when standard treatments have been exhausted.',
    fullArticleSlug: 'foundationone-cdx-explained',
    aliases: ['Foundation Medicine', 'FoundationOne', 'F1CDx', 'comprehensive genomic profiling'],
    category: 'tests',
  },
  {
    term: 'Liquid Biopsy',
    slug: 'liquid-biopsy',
    shortDefinition: 'A blood test that detects cancer DNA or cells circulating in the bloodstream. Liquid biopsies can identify mutations, monitor treatment response, and detect recurrence earlier than imaging.',
    fullDefinition: 'A liquid biopsy analyzes blood (or other body fluids) for circulating tumor DNA (ctDNA), circulating tumor cells (CTCs), or other tumor-derived biomarkers. Unlike tissue biopsies, liquid biopsies are minimally invasive and can be repeated over time. In breast cancer, liquid biopsies are used for: genomic profiling when tissue is unavailable (Guardant360, FoundationOne Liquid CDx), ESR1 mutation detection in metastatic ER+ disease, monitoring treatment response through ctDNA dynamics, and emerging MRD (minimal residual disease) detection for recurrence surveillance. The technology is evolving rapidly, with new applications in early detection and treatment monitoring.',
    fullArticleSlug: 'what-is-liquid-biopsy',
    aliases: ['blood biopsy', 'circulating tumor DNA test', 'ctDNA test'],
    category: 'tests',
  },
  {
    term: 'FISH Test',
    slug: 'fish-test',
    shortDefinition: 'A laboratory test that uses fluorescent probes to detect gene amplification. In breast cancer, FISH is primarily used to confirm HER2 status when IHC results are borderline.',
    fullDefinition: 'Fluorescence in situ hybridization (FISH) is a molecular cytogenetic technique that uses fluorescent-labeled DNA probes to detect specific gene sequences on chromosomes. In breast cancer, FISH is most commonly used to assess HER2 gene amplification. When IHC results are equivocal (2+), FISH is performed to determine whether the HER2 gene is amplified (HER2-positive) or not amplified (HER2-negative/HER2-low). A HER2/CEP17 ratio of >=2.0 or average HER2 copy number >=6.0 indicates amplification. FISH results are critical for treatment decisions, particularly eligibility for HER2-targeted therapies.',
    fullArticleSlug: null,
    aliases: ['fluorescence in situ hybridization', 'FISH', 'HER2 FISH'],
    category: 'tests',
  },
  {
    term: 'IHC (Immunohistochemistry)',
    slug: 'immunohistochemistry',
    shortDefinition: 'A lab test that uses antibodies to detect specific proteins in tissue samples. IHC is routinely used to determine ER, PR, HER2, and Ki-67 status in breast cancer.',
    fullDefinition: 'Immunohistochemistry (IHC) is a technique that uses labeled antibodies to detect specific protein antigens in tissue sections. In breast cancer, IHC is performed on biopsy or surgical tissue to determine: ER status (percentage of cells staining positive), PR status, HER2 protein overexpression (scored 0, 1+, 2+, or 3+), and Ki-67 proliferation index. IHC is a first-line test for HER2, with scores of 0 or 1+ considered HER2-negative (but now potentially HER2-low), 2+ requiring FISH confirmation, and 3+ considered HER2-positive. These IHC results are fundamental to breast cancer subtype classification and treatment planning.',
    fullArticleSlug: null,
    aliases: ['immunohistochemistry', 'IHC staining', 'IHC test'],
    category: 'tests',
  },
  {
    term: 'NGS (Next-Generation Sequencing)',
    slug: 'next-generation-sequencing',
    shortDefinition: 'Advanced DNA sequencing technology that reads millions of DNA fragments simultaneously. NGS enables comprehensive genomic profiling of tumors to find actionable mutations.',
    fullDefinition: 'Next-generation sequencing (NGS) is a high-throughput DNA sequencing technology that can analyze multiple genes simultaneously (panel testing), the whole exome, or the whole genome. In oncology, NGS panels like FoundationOne CDx (324 genes) and MSK-IMPACT (505 genes) identify somatic mutations, copy number alterations, gene fusions, and genomic signatures (TMB, MSI). NGS has transformed precision oncology by enabling identification of targetable mutations that would be missed by single-gene tests. For breast cancer, NGS is recommended for metastatic disease and increasingly for high-risk early-stage disease to identify actionable alterations and clinical trial eligibility.',
    fullArticleSlug: null,
    aliases: ['next-generation sequencing', 'genomic sequencing', 'tumor sequencing', 'NGS panel'],
    category: 'tests',
  },
  {
    term: 'ctDNA',
    slug: 'ctdna',
    shortDefinition: 'Circulating tumor DNA — fragments of tumor DNA found in the bloodstream. ctDNA can be used to monitor cancer, detect recurrence early, and track treatment response.',
    fullDefinition: 'Circulating tumor DNA (ctDNA) consists of small fragments of DNA shed by tumor cells into the bloodstream. ctDNA carries the same mutations as the tumor and can be detected through specialized blood tests (liquid biopsies). In breast cancer, ctDNA applications include: monitoring treatment response in metastatic disease, detecting minimal residual disease (MRD) after curative treatment, early recurrence detection (ctDNA can become detectable months before clinical or imaging evidence of recurrence), and identifying resistance mutations (particularly ESR1 mutations in ER+ disease). Commercial ctDNA tests include Signatera (personalized MRD), Guardant360, and FoundationOne Liquid CDx.',
    fullArticleSlug: null,
    aliases: ['circulating tumor DNA', 'cell-free tumor DNA', 'cfDNA'],
    category: 'tests',
  },
  {
    term: 'Germline Testing',
    slug: 'germline-testing',
    shortDefinition: 'Genetic testing of your normal (inherited) DNA to check for inherited mutations that increase cancer risk. Germline mutations like BRCA1/2 can be passed to children.',
    fullDefinition: 'Germline testing analyzes DNA from normal cells (typically blood or saliva) to identify inherited genetic variants that increase cancer risk. In breast cancer, germline testing most commonly assesses BRCA1, BRCA2, PALB2, TP53, CHEK2, ATM, and other cancer predisposition genes. Germline testing is recommended for all patients diagnosed with breast cancer at age <=50, triple-negative breast cancer at any age, male breast cancer, Ashkenazi Jewish heritage, or family history suggesting hereditary cancer. Results affect treatment decisions (PARP inhibitor eligibility), surgical planning (risk-reducing surgery), surveillance recommendations, and family screening. Germline testing is distinct from somatic (tumor) testing.',
    fullArticleSlug: null,
    aliases: ['genetic testing', 'hereditary cancer testing', 'inherited mutation testing'],
    category: 'tests',
  },
  {
    term: 'Somatic Testing',
    slug: 'somatic-testing',
    shortDefinition: 'Genetic testing of tumor DNA to identify mutations acquired by the cancer itself. These mutations are not inherited and cannot be passed to children.',
    fullDefinition: 'Somatic testing (also called tumor genomic profiling) analyzes DNA from cancer cells to identify mutations that have been acquired during the development and progression of the tumor. Unlike germline mutations, somatic mutations are not inherited and are not present in normal cells. In breast cancer, somatic testing can identify actionable mutations such as PIK3CA (eligible for alpelisib/inavolisib), ESR1 (endocrine resistance), HER2 mutations (distinct from amplification), and AKT1. Somatic testing is typically performed using NGS panels on tumor tissue (FoundationOne CDx) or liquid biopsy (Guardant360). It is most commonly ordered in the metastatic setting to identify targeted therapy options.',
    fullArticleSlug: null,
    aliases: ['tumor genomic profiling', 'somatic mutation testing', 'tumor sequencing'],
    category: 'tests',
  },

  // --- procedures (10) ---
  {
    term: 'Biopsy',
    slug: 'biopsy',
    shortDefinition: 'A procedure that removes a small sample of tissue for examination under a microscope. A biopsy is required to diagnose breast cancer and determine its characteristics.',
    fullDefinition: 'A biopsy is a diagnostic procedure where tissue is removed for pathological examination. In breast cancer, common biopsy types include: core needle biopsy (most common, uses a hollow needle to remove tissue cylinders), fine needle aspiration (uses a thin needle, less tissue obtained), vacuum-assisted biopsy (uses suction for larger samples), and surgical/excisional biopsy (removes the entire lump). The biopsy tissue is analyzed for cancer type, grade, receptor status (ER, PR, HER2), Ki-67, and other markers. Biopsies are typically image-guided (ultrasound or mammogram-guided) to ensure accurate sampling.',
    fullArticleSlug: null,
    aliases: ['core biopsy', 'needle biopsy', 'tissue biopsy', 'breast biopsy'],
    category: 'procedures',
  },
  {
    term: 'Lumpectomy',
    slug: 'lumpectomy',
    shortDefinition: 'Surgery that removes the cancer and a small margin of surrounding normal tissue while preserving the rest of the breast. Also called breast-conserving surgery.',
    fullDefinition: 'A lumpectomy (breast-conserving surgery or partial mastectomy) removes the tumor along with a margin of normal tissue surrounding it. The goal is to achieve clear margins (no cancer cells at the edge of the removed tissue) while preserving the breast. Lumpectomy plus radiation therapy has been shown to have equivalent survival outcomes to mastectomy for most early-stage breast cancers. Factors favoring lumpectomy include small tumor-to-breast ratio, single tumor site, and patient preference. Lumpectomy is typically followed by radiation therapy. If margins are positive (cancer at the edge), re-excision or conversion to mastectomy may be needed.',
    fullArticleSlug: 'lumpectomy-vs-mastectomy',
    aliases: ['breast-conserving surgery', 'partial mastectomy', 'wide local excision'],
    category: 'procedures',
  },
  {
    term: 'Mastectomy',
    slug: 'mastectomy',
    shortDefinition: 'Surgery that removes the entire breast. May be recommended for larger tumors, multiple tumor sites, BRCA mutations, or by patient preference.',
    fullDefinition: 'Mastectomy is surgical removal of the entire breast. Types include: simple/total mastectomy (removes breast tissue, nipple, and areola), skin-sparing mastectomy (preserves skin envelope for immediate reconstruction), nipple-sparing mastectomy (preserves skin and nipple-areola complex), and modified radical mastectomy (includes axillary lymph node dissection). Mastectomy may be recommended when: the tumor is large relative to breast size, there are multiple tumors in different quadrants, the patient has a BRCA mutation, radiation is contraindicated, or by patient choice. Bilateral mastectomy removes both breasts and may be chosen for risk reduction in high-risk patients.',
    fullArticleSlug: 'lumpectomy-vs-mastectomy',
    aliases: ['breast removal surgery', 'total mastectomy', 'bilateral mastectomy'],
    category: 'procedures',
  },
  {
    term: 'Sentinel Node Biopsy',
    slug: 'sentinel-node-biopsy',
    shortDefinition: 'A surgical procedure that removes the first lymph node(s) where cancer would likely spread. If the sentinel node is cancer-free, further lymph node removal may be avoided.',
    fullDefinition: 'Sentinel lymph node biopsy (SLNB) identifies and removes the first lymph node(s) in the drainage pathway from the tumor (the sentinel node). During surgery, a radioactive tracer and/or blue dye is injected near the tumor. The surgeon follows the tracer to find the sentinel node(s), which are removed and examined by a pathologist. If sentinel nodes are negative (no cancer), no further lymph node surgery is needed, reducing the risk of lymphedema. If positive, axillary lymph node dissection may be recommended, though recent studies (AMAROS, Z0011) show radiation can sometimes replace further surgery for limited sentinel node involvement.',
    fullArticleSlug: null,
    aliases: ['SLNB', 'sentinel lymph node biopsy', 'sentinel node procedure'],
    category: 'procedures',
  },
  {
    term: 'Port Placement',
    slug: 'port-placement',
    shortDefinition: 'A minor surgical procedure to implant a small device under the skin that provides easy access for IV chemotherapy, blood draws, and other treatments.',
    fullDefinition: 'A port (portacath or implantable venous access device) is a small medical device placed under the skin, usually in the upper chest, connected to a catheter threaded into a large vein. It is implanted in a short outpatient procedure under local anesthesia. Ports provide reliable venous access for chemotherapy infusions, blood draws, and IV contrast for scans, avoiding repeated needle sticks in arm veins. This is especially important for vesicant chemotherapy drugs (like doxorubicin) that can damage small veins. The port can remain in place for months to years and is accessed using a special needle (Huber needle). Port removal is another minor procedure performed when treatment is complete.',
    fullArticleSlug: null,
    aliases: ['portacath', 'chemo port', 'implantable port', 'venous access device', 'mediport'],
    category: 'procedures',
  },
  {
    term: 'Bone Marrow Biopsy',
    slug: 'bone-marrow-biopsy',
    shortDefinition: 'A procedure that removes a small sample of bone marrow to check whether cancer has spread to the bone marrow or to evaluate blood cell production during treatment.',
    fullDefinition: 'A bone marrow biopsy involves inserting a needle into a bone (usually the back of the hip bone/iliac crest) to remove a small sample of bone marrow tissue and liquid. In breast cancer, bone marrow biopsy is not routine but may be performed when: there is suspicion of bone marrow metastasis, unexplained blood count abnormalities occur during treatment, or as part of certain clinical trial protocols. The procedure takes about 15-30 minutes and is done under local anesthesia (sometimes with sedation). Patients may experience pressure and brief pain during the aspiration. Results typically take a few days.',
    fullArticleSlug: null,
    aliases: ['bone marrow aspiration', 'BMA', 'marrow biopsy'],
    category: 'procedures',
  },
  {
    term: 'PET Scan',
    slug: 'pet-scan',
    shortDefinition: 'An imaging test that uses a small amount of radioactive sugar to detect cancer cells throughout the body. Cancer cells absorb more sugar than normal cells and light up on the scan.',
    fullDefinition: 'Positron emission tomography (PET) scanning uses a radioactive glucose tracer (FDG) injected intravenously. Cancer cells, which have higher metabolic rates than normal cells, absorb more FDG and appear as bright spots ("hot spots") on the scan. PET is usually combined with CT (PET/CT) for anatomical localization. In breast cancer, PET/CT is used for staging (detecting distant metastases), restaging (checking for recurrence), and monitoring treatment response. It is most useful for detecting bone, liver, and lung metastases. PET/CT is not recommended for early-stage breast cancer staging (stages I-II) due to high false-positive rates and low pretest probability of metastatic disease.',
    fullArticleSlug: null,
    aliases: ['PET/CT', 'PET-CT', 'positron emission tomography', 'FDG-PET'],
    category: 'procedures',
  },
  {
    term: 'MRI',
    slug: 'mri',
    shortDefinition: 'An imaging test that uses magnetic fields and radio waves to create detailed pictures of the breast. MRI is more sensitive than mammography and is used for high-risk screening and treatment planning.',
    fullDefinition: 'Magnetic resonance imaging (MRI) of the breast uses a strong magnetic field, radio waves, and a contrast agent (gadolinium) to produce detailed images. Breast MRI is more sensitive than mammography (detecting ~95% vs ~85% of cancers) but less specific (more false positives). It is recommended for: high-risk screening (BRCA carriers, strong family history, prior chest radiation), evaluating extent of disease before surgery, monitoring neoadjuvant chemotherapy response, screening the opposite breast after cancer diagnosis, and evaluating breast implant integrity. MRI is not recommended for routine screening in average-risk women due to high false-positive rates and cost.',
    fullArticleSlug: null,
    aliases: ['magnetic resonance imaging', 'breast MRI', 'MRI scan'],
    category: 'procedures',
  },
  {
    term: 'CT Scan',
    slug: 'ct-scan',
    shortDefinition: 'An imaging test that uses X-rays from multiple angles to create cross-sectional images of the body. Used in breast cancer to check for spread to lungs, liver, and other organs.',
    fullDefinition: 'Computed tomography (CT) scanning uses X-rays taken from multiple angles, processed by a computer to create cross-sectional images. In breast cancer, CT scans are used for staging and surveillance, particularly to detect metastases in the lungs, liver, and lymph nodes. CT scans are faster and more widely available than MRI and are often the first imaging study ordered when metastatic disease is suspected. CT is commonly combined with PET (PET/CT) for more comprehensive staging. Contrast-enhanced CT uses an IV iodine-based dye to improve visualization. CT involves radiation exposure, which is a consideration for repeated surveillance imaging.',
    fullArticleSlug: null,
    aliases: ['CAT scan', 'computed tomography', 'CT imaging'],
    category: 'procedures',
  },
  {
    term: 'Mammogram',
    slug: 'mammogram',
    shortDefinition: 'An X-ray of the breast used for cancer screening and diagnosis. Mammograms can detect tumors before they can be felt and are recommended annually starting at age 40.',
    fullDefinition: 'Mammography is the primary screening tool for breast cancer, using low-dose X-rays to image breast tissue. Digital breast tomosynthesis (3D mammography) takes multiple images from different angles, improving detection in dense breasts. Screening mammograms are performed on women without symptoms; diagnostic mammograms investigate specific concerns (lumps, changes, abnormal screening results). Current guidelines (USPSTF 2024) recommend biennial screening starting at age 40. Dense breast tissue, present in about 40% of women, reduces mammography sensitivity and may warrant supplemental screening with ultrasound or MRI. Mammography has reduced breast cancer mortality by approximately 20-30% in screened populations.',
    fullArticleSlug: null,
    aliases: ['mammography', 'breast X-ray', '3D mammogram', 'tomosynthesis'],
    category: 'procedures',
  },

  // --- anatomy (5) ---
  {
    term: 'Lymph Node',
    slug: 'lymph-node',
    shortDefinition: 'Small bean-shaped organs that filter fluid and trap harmful substances including cancer cells. Lymph node involvement is a key factor in breast cancer staging.',
    fullDefinition: 'Lymph nodes are small, oval-shaped organs of the immune system distributed throughout the body. They filter lymphatic fluid and contain immune cells that fight infection. In breast cancer, the axillary (armpit) lymph nodes are the most common first site of spread. The number of involved lymph nodes is a critical prognostic factor: node-negative (N0) has the best prognosis, 1-3 positive nodes (N1) is intermediate, and 4+ positive nodes (N2-N3) indicates higher risk. Lymph node status determines staging, informs treatment intensity, and guides decisions about radiation fields. Sentinel node biopsy is used to assess lymph node involvement with minimal morbidity.',
    fullArticleSlug: null,
    aliases: ['lymph nodes', 'axillary lymph node', 'lymph gland'],
    category: 'anatomy',
  },
  {
    term: 'Tumor',
    slug: 'tumor',
    shortDefinition: 'An abnormal mass of tissue that forms when cells grow and divide more than they should. Tumors can be benign (not cancer) or malignant (cancer).',
    fullDefinition: 'A tumor is an abnormal growth of cells that forms a mass. In the context of breast cancer, tumors are malignant (cancerous), meaning they can invade surrounding tissues and metastasize (spread) to distant organs. Key tumor characteristics include size (measured in centimeters), grade (1-3, based on how abnormal cells appear under a microscope), type (ductal, lobular, etc.), and molecular subtype (determined by receptor status). Tumor size is a component of the TNM staging system — T1 (<=2cm), T2 (2-5cm), T3 (>5cm), T4 (any size with chest wall or skin involvement). Neoadjuvant treatment may shrink tumors before surgical removal.',
    fullArticleSlug: null,
    aliases: ['mass', 'neoplasm', 'lesion', 'growth'],
    category: 'anatomy',
  },
  {
    term: 'Metastasis',
    slug: 'metastasis',
    shortDefinition: 'The spread of cancer from its original site to other parts of the body. In breast cancer, common sites of metastasis include bones, liver, lungs, and brain.',
    fullDefinition: 'Metastasis is the process by which cancer cells break away from the primary tumor, travel through the blood or lymphatic system, and form new tumors in distant organs. Breast cancer most commonly metastasizes to bones (most frequent), liver, lungs, and brain. Metastatic breast cancer (also called stage IV) is considered incurable with current treatments but can often be controlled for months to years. Different subtypes have different metastatic patterns: ER+ cancers favor bone, HER2+ cancers have higher rates of brain metastasis, and triple-negative cancers tend to spread to visceral organs. Treatment of metastatic disease focuses on controlling growth and maintaining quality of life.',
    fullArticleSlug: null,
    aliases: ['metastatic disease', 'mets', 'metastases', 'stage IV', 'advanced cancer'],
    category: 'anatomy',
  },
  {
    term: 'Margin',
    slug: 'margin',
    shortDefinition: 'The rim of normal tissue surrounding a surgically removed tumor. Clear (negative) margins mean no cancer cells were found at the edge, indicating the entire tumor was removed.',
    fullDefinition: 'In surgical oncology, a margin refers to the border of normal tissue surrounding a removed tumor specimen. After lumpectomy or mastectomy, the pathologist examines the edges of the removed tissue. Negative (clear) margins mean no cancer cells are at the inked edge of the specimen — "no ink on tumor" is the current standard for invasive breast cancer. Positive margins (cancer cells at the edge) may require re-excision surgery to remove additional tissue. Close margins (cancer cells near but not at the edge) are sometimes monitored with radiation. Margin status is a critical surgical outcome because positive margins increase the risk of local recurrence.',
    fullArticleSlug: null,
    aliases: ['surgical margin', 'margin status', 'clear margin', 'positive margin', 'negative margin'],
    category: 'anatomy',
  },
  {
    term: 'Sentinel Node',
    slug: 'sentinel-node',
    shortDefinition: 'The first lymph node(s) to which cancer cells are most likely to spread from the primary tumor. Testing the sentinel node can reveal whether cancer has reached the lymphatic system.',
    fullDefinition: 'The sentinel lymph node is the first node in the lymphatic drainage pathway from a tumor. It acts as a "gatekeeper" — if cancer has spread to the lymph nodes, the sentinel node is almost always the first one affected. During sentinel node biopsy, a radioactive tracer and/or blue dye injected near the tumor travels through lymphatic channels to the sentinel node, allowing the surgeon to identify and remove it. If the sentinel node is negative (cancer-free), the remaining lymph nodes are very likely also negative, sparing the patient from full axillary dissection and its associated risks (lymphedema, numbness, reduced arm mobility).',
    fullArticleSlug: null,
    aliases: ['sentinel lymph node', 'SLN', 'guard node'],
    category: 'anatomy',
  },

  // --- general (5) ---
  {
    term: 'Staging',
    slug: 'staging',
    shortDefinition: 'The process of determining how far cancer has spread in the body. Staging uses the TNM system (Tumor size, Node involvement, Metastasis) and ranges from stage 0 to stage IV.',
    fullDefinition: 'Cancer staging describes the extent of disease at diagnosis. Breast cancer uses the AJCC TNM staging system (8th edition): T describes tumor size (T1-T4), N describes lymph node involvement (N0-N3), and M describes distant metastasis (M0 or M1). Breast cancer uniquely incorporates biological factors into staging — tumor grade, ER/PR status, HER2 status, and Oncotype DX score can modify the stage (prognostic staging). For example, a small ER+/HER2- tumor with favorable biology may be downstaged from IIA to IA. Staging determines prognosis and guides treatment intensity. Stage 0 is non-invasive (DCIS), stages I-III are potentially curable with treatment, and stage IV is metastatic.',
    fullArticleSlug: 'understanding-breast-cancer-staging',
    aliases: ['cancer staging', 'TNM staging', 'stage', 'cancer stage'],
    category: 'general',
  },
  {
    term: 'Grading',
    slug: 'grading',
    shortDefinition: 'A measure of how abnormal cancer cells look under a microscope. Grade 1 cells look most like normal cells; grade 3 cells look most abnormal and tend to grow faster.',
    fullDefinition: 'Tumor grading describes how differentiated (normal-looking) cancer cells are under a microscope. Breast cancer is graded 1-3 using the Nottingham grading system, which evaluates three features: tubule formation, nuclear pleomorphism (variation in cell nuclei), and mitotic count (rate of cell division). Grade 1 (low grade/well differentiated) cells resemble normal breast cells and tend to grow slowly. Grade 2 (intermediate) is moderately differentiated. Grade 3 (high grade/poorly differentiated) cells look very abnormal and tend to grow and spread more quickly. Grade is an independent prognostic factor and is incorporated into the AJCC prognostic staging system.',
    fullArticleSlug: null,
    aliases: ['tumor grade', 'cancer grade', 'Nottingham grade', 'histologic grade'],
    category: 'general',
  },
  {
    term: 'Prognosis',
    slug: 'prognosis',
    shortDefinition: 'The likely course and outcome of a disease. Prognosis in breast cancer depends on stage, subtype, grade, and response to treatment.',
    fullDefinition: 'Prognosis is the expected course of a disease, including the chance of recovery or recurrence. In breast cancer, prognosis depends on multiple factors: stage at diagnosis (strongest factor), tumor grade, hormone receptor and HER2 status, lymph node involvement, tumor size, patient age, and genomic test results (e.g., Oncotype DX score). Prognosis is typically expressed as survival rates — the percentage of patients alive after a certain time period. Breast cancer prognosis has improved significantly: the 5-year survival rate for localized breast cancer is 99%, regional is 86%, and distant (metastatic) is 31% (SEER data). Individual prognosis can vary greatly from population averages.',
    fullArticleSlug: null,
    aliases: ['outcome', 'outlook', 'survival rate', 'expected outcome'],
    category: 'general',
  },
  {
    term: 'Remission',
    slug: 'remission',
    shortDefinition: 'A decrease in or disappearance of signs and symptoms of cancer. Complete remission means no detectable cancer; partial remission means the cancer has shrunk significantly.',
    fullDefinition: 'Remission describes a reduction or disappearance of cancer signs and symptoms. Complete remission (CR) means no detectable evidence of cancer on physical exam, blood tests, and imaging — though microscopic disease may still exist. Partial remission (PR) means the tumor has shrunk by at least 30% (per RECIST criteria). Remission is not the same as cure — cancer can recur after remission. In breast cancer, the term "no evidence of disease" (NED) is often used after completion of treatment. Pathologic complete response (pCR), where no cancer is found in surgical tissue after neoadjuvant therapy, is an important milestone associated with better long-term outcomes.',
    fullArticleSlug: null,
    aliases: ['complete remission', 'partial remission', 'NED', 'no evidence of disease', 'cancer-free'],
    category: 'general',
  },
  {
    term: 'Recurrence',
    slug: 'recurrence',
    shortDefinition: 'Cancer that has come back after a period of remission. Recurrence can be local (same breast), regional (nearby lymph nodes), or distant (other organs).',
    fullDefinition: 'Cancer recurrence means the cancer has returned after treatment and a period where it was undetectable. Breast cancer recurrence is classified as: local (in the treated breast or chest wall), regional (in nearby lymph nodes), or distant/metastatic (in other organs). Local and regional recurrences may still be curable. Distant recurrence (metastatic) is treatable but generally not curable. Recurrence risk depends on original stage, subtype, and treatment received. ER-positive cancers have a steady long-term recurrence risk extending 20+ years, while triple-negative cancers tend to recur within the first 3-5 years if they are going to recur. Surveillance after treatment aims to detect recurrence early.',
    fullArticleSlug: 'fear-of-recurrence-what-is-normal',
    aliases: ['cancer recurrence', 'relapse', 'cancer coming back', 'cancer return'],
    category: 'general',
  },
  {
    term: 'Survivorship Care Plan',
    slug: 'survivorship-care-plan',
    shortDefinition: 'A personalized document created at the end of active treatment that summarizes your cancer history, treatment received, follow-up schedule, and long-term health recommendations.',
    fullDefinition: 'A survivorship care plan (SCP) is a comprehensive document provided to patients completing active cancer treatment. It typically includes: a summary of diagnosis and treatments received, a schedule for follow-up visits and surveillance tests, information about potential late and long-term effects of treatment, recommendations for healthy living, psychosocial support resources, and when to contact the care team. The Commission on Cancer requires accredited cancer centers to provide SCPs. In the OncoVax platform, SCPs are generated using a two-step Claude AI pipeline that grounds clinical information and then translates it into patient-accessible language.',
    fullArticleSlug: 'survivorship-care-plan-explained',
    aliases: ['SCP', 'survivorship plan', 'care plan', 'treatment summary'],
    category: 'general',
  },
  {
    term: 'Clinical Trial',
    slug: 'clinical-trial',
    shortDefinition: 'A research study that tests new treatments, drugs, or procedures in people. Clinical trials are how all new cancer treatments are proven to work and gain FDA approval.',
    fullDefinition: 'Clinical trials are research studies conducted with human participants to evaluate new medical interventions. They proceed through phases: Phase I tests safety and dosing in a small group, Phase II tests effectiveness and side effects, Phase III compares the new treatment to current standard of care in a large group, and Phase IV monitors long-term effects after approval. In breast cancer, clinical trials have led to every treatment advance — trastuzumab, CDK4/6 inhibitors, checkpoint inhibitors, and ADCs were all proven effective through trials. Participating in a clinical trial provides access to cutting-edge treatments and contributes to scientific knowledge. The OncoVax platform helps match patients to eligible trials based on their specific diagnosis.',
    fullArticleSlug: null,
    aliases: ['trial', 'research study', 'clinical study', 'cancer trial'],
    category: 'general',
  },
  {
    term: 'Neoantigen',
    slug: 'neoantigen',
    shortDefinition: 'A new protein fragment created by mutations in cancer cells that the immune system can recognize as foreign. Neoantigens are the basis for personalized cancer vaccines.',
    fullDefinition: 'Neoantigens are novel peptide sequences produced by somatic mutations in tumor cells. Because these sequences do not exist in normal cells, the immune system can potentially recognize them as foreign and mount an immune response. Neoantigen identification involves: whole-exome sequencing of tumor and normal tissue to find somatic mutations, HLA typing to determine which mutant peptides can be presented by the patient\'s immune system, and computational prediction of peptide-MHC binding affinity. Personalized cancer vaccines use a patient\'s specific neoantigens to train their immune system to target their cancer. This approach is being tested in clinical trials for breast cancer and other solid tumors, including mRNA-based vaccines.',
    fullArticleSlug: 'personalized-cancer-vaccines-the-science',
    aliases: ['neoantigen peptide', 'tumor neoantigen', 'cancer neoantigen'],
    category: 'general',
  },
  {
    term: 'Adjuvant Therapy',
    slug: 'adjuvant-therapy',
    shortDefinition: 'Treatment given after the primary treatment (usually surgery) to lower the risk of cancer coming back. Adjuvant therapy may include chemotherapy, radiation, hormone therapy, or targeted therapy.',
    fullDefinition: 'Adjuvant therapy is systemic treatment given after primary surgery to eliminate any microscopic cancer cells that may remain in the body, reducing the risk of recurrence. In breast cancer, adjuvant options include: chemotherapy (AC-T, TC), radiation therapy (after lumpectomy or high-risk mastectomy), hormone/endocrine therapy (tamoxifen, aromatase inhibitors for ER+ disease), targeted therapy (trastuzumab for HER2+ disease, olaparib for BRCA-mutated), and immunotherapy (pembrolizumab for high-risk TNBC after neoadjuvant therapy). The decision to use adjuvant therapy and which agents to include depends on cancer stage, subtype, and genomic risk scores.',
    fullArticleSlug: null,
    aliases: ['adjuvant treatment', 'adjuvant chemo', 'post-surgical treatment'],
    category: 'general',
  },
  {
    term: 'Neoadjuvant Therapy',
    slug: 'neoadjuvant-therapy',
    shortDefinition: 'Treatment given before the primary treatment (usually surgery) to shrink the tumor. Neoadjuvant therapy can make surgery less extensive and shows how the cancer responds to treatment.',
    fullDefinition: 'Neoadjuvant therapy is systemic treatment given before surgery. In breast cancer, it is used to: shrink large tumors to enable breast-conserving surgery instead of mastectomy, treat locally advanced or inflammatory breast cancer, and assess in-vivo tumor response to treatment. Achieving a pathologic complete response (pCR — no residual invasive cancer in breast or lymph nodes) after neoadjuvant therapy is a strong predictor of favorable long-term outcomes, particularly in HER2-positive and triple-negative subtypes. If pCR is not achieved, additional adjuvant therapy may be offered (T-DM1 for HER2+, capecitabine for TNBC). Neoadjuvant regimens mirror adjuvant protocols but are given pre-operatively.',
    fullArticleSlug: null,
    aliases: ['neoadjuvant treatment', 'pre-surgical treatment', 'preoperative therapy', 'NAT'],
    category: 'general',
  },
];

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('=== Seeding LEARN module: Glossary Terms + Articles ===\n');

  // --- Step 1: Upsert all 50 glossary terms ---
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

  // --- Step 2: Generate 25 articles via Claude AI ---
  console.log('Generating 25 articles via Claude AI (this will take a while)...\n');
  const generatedArticles: { id: string; slug: string; title: string }[] = [];

  for (let i = 0; i < ARTICLE_SPECS.length; i++) {
    const spec = ARTICLE_SPECS[i];
    console.log(`  [${i + 1}/25] Generating: "${spec.topic}" (${spec.type}, ${spec.category})...`);
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
  console.log('\n=== Seed Complete ===');
  console.log(`  Glossary terms: ${glossaryCount}`);
  console.log(`  Articles generated: ${generatedArticles.length}`);
  console.log(`  Articles published: ${publishedCount}`);
  console.log(`  Categories: ${[...new Set(ARTICLE_SPECS.map((s) => s.category))].join(', ')}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
