// ICD-10 prefix → normalized cancer type
export const ICD10_CANCER_MAP: Record<string, string> = {
  'C50': 'breast cancer',
  'C34': 'lung cancer',
  'C18': 'colon cancer',
  'C19': 'colorectal cancer',
  'C20': 'rectal cancer',
  'C61': 'prostate cancer',
  'C43': 'melanoma',
  'C56': 'ovarian cancer',
  'C25': 'pancreatic cancer',
  'C22': 'liver cancer',
  'C67': 'bladder cancer',
  'C64': 'kidney cancer',
  'C73': 'thyroid cancer',
  'C71': 'brain cancer',
  'C16': 'stomach cancer',
  'C15': 'esophageal cancer',
  'C53': 'cervical cancer',
  'C54': 'uterine cancer',
  'C55': 'uterine cancer',
  'C62': 'testicular cancer',
  'C81': 'hodgkin lymphoma',
  'C82': 'non-hodgkin lymphoma',
  'C83': 'non-hodgkin lymphoma',
  'C84': 'non-hodgkin lymphoma',
  'C85': 'non-hodgkin lymphoma',
  'C90': 'multiple myeloma',
  'C91': 'leukemia',
  'C92': 'leukemia',
  'C93': 'leukemia',
  'C94': 'leukemia',
  'C95': 'leukemia',
};

// Stage mapping from FHIR stage text to normalized stage
export function normalizeStage(stageText: string): string | undefined {
  const text = stageText.toUpperCase().trim();

  // Roman numeral patterns
  if (/\bIV\b|STAGE\s*4/.test(text)) return 'IV';
  if (/\bIIIC?\b|STAGE\s*3/.test(text)) return 'III';
  if (/\bIIC?\b|STAGE\s*2/.test(text)) return 'II';
  if (/\bIC?\b|STAGE\s*1/.test(text)) return 'I';
  if (/\b0\b|IN\s*SITU|DCIS|LCIS/.test(text)) return '0';

  // Sub-stages
  const subMatch = text.match(/\b(I{1,3}V?[ABC]?)\b/);
  if (subMatch) return subMatch[1];

  return undefined;
}

// RxNorm code → { name, category } for common oncology drugs
export const RXNORM_TREATMENT_MAP: Record<string, { name: string; category: string }> = {
  // Chemotherapy
  '3002': { name: 'Cyclophosphamide', category: 'chemotherapy' },
  '56946': { name: 'Doxorubicin', category: 'chemotherapy' },
  '51499': { name: 'Paclitaxel', category: 'chemotherapy' },
  '224905': { name: 'Docetaxel', category: 'chemotherapy' },
  '194000': { name: 'Carboplatin', category: 'chemotherapy' },
  '253337': { name: 'Cisplatin', category: 'chemotherapy' },
  '1740692': { name: 'Capecitabine', category: 'chemotherapy' },
  '72962': { name: '5-Fluorouracil', category: 'chemotherapy' },
  '596722': { name: 'Gemcitabine', category: 'chemotherapy' },
  '1918221': { name: 'Eribulin', category: 'chemotherapy' },
  // Immunotherapy
  '1657976': { name: 'Pembrolizumab', category: 'immunotherapy' },
  '1597860': { name: 'Nivolumab', category: 'immunotherapy' },
  '1876380': { name: 'Atezolizumab', category: 'immunotherapy' },
  '1943274': { name: 'Durvalumab', category: 'immunotherapy' },
  '1597856': { name: 'Ipilimumab', category: 'immunotherapy' },
  // Targeted therapy
  '224906': { name: 'Trastuzumab', category: 'targeted' },
  '1298944': { name: 'Pertuzumab', category: 'targeted' },
  '1946825': { name: 'T-DM1', category: 'targeted' },
  '2361270': { name: 'Trastuzumab Deruxtecan', category: 'targeted' },
  '1660014': { name: 'Palbociclib', category: 'targeted' },
  '1873983': { name: 'Ribociclib', category: 'targeted' },
  '1946832': { name: 'Abemaciclib', category: 'targeted' },
  '1723160': { name: 'Olaparib', category: 'targeted' },
  '1861463': { name: 'Talazoparib', category: 'targeted' },
  '1545103': { name: 'Lapatinib', category: 'targeted' },
  '1735465': { name: 'Neratinib', category: 'targeted' },
  '1946840': { name: 'Tucatinib', category: 'targeted' },
  '1665466': { name: 'Everolimus', category: 'targeted' },
  // Hormonal therapy
  '10324': { name: 'Tamoxifen', category: 'hormonal' },
  '258494': { name: 'Letrozole', category: 'hormonal' },
  '84857': { name: 'Anastrozole', category: 'hormonal' },
  '337527': { name: 'Exemestane', category: 'hormonal' },
  '72968': { name: 'Fulvestrant', category: 'hormonal' },
  '285136': { name: 'Goserelin', category: 'hormonal' },
  '203523': { name: 'Leuprolide', category: 'hormonal' },
};

// SNOMED procedure codes → surgery type
export const SNOMED_PROCEDURE_MAP: Record<string, string> = {
  '172043006': 'mastectomy',
  '274024004': 'mastectomy',
  '384723003': 'lumpectomy',
  '64368001': 'lumpectomy',
  '236888003': 'sentinel lymph node biopsy',
  '79632003': 'axillary lymph node dissection',
  '392021009': 'lumpectomy',
  '27737000': 'colectomy',
  '26925002': 'lobectomy',
  '15257006': 'prostatectomy',
  '116028008': 'oophorectomy',
  '608009': 'hysterectomy',
  '90470006': 'nephrectomy',
  '173422009': 'thyroidectomy',
  '387867001': 'cystectomy',
  '77465005': 'gastrectomy',
  '44337006': 'pancreatectomy',
};

// Resolve ICD-10 code to cancer type. Handles full codes like "C50.911"
export function icd10ToCancerType(code: string): string | undefined {
  const prefix = code.substring(0, 3).toUpperCase();
  return ICD10_CANCER_MAP[prefix];
}

// Resolve RxNorm code to treatment
export function rxnormToTreatment(code: string): { name: string; category: string } | undefined {
  return RXNORM_TREATMENT_MAP[code];
}

// Resolve SNOMED code to surgery type
export function snomedToSurgery(code: string): string | undefined {
  return SNOMED_PROCEDURE_MAP[code];
}

// Extract a specific coding system value from a CodeableConcept
export function getCoding(concept: { coding?: { system?: string; code?: string; display?: string }[] } | undefined, system: string): { code: string; display?: string } | undefined {
  if (!concept?.coding) return undefined;
  const match = concept.coding.find(c => c.system?.includes(system));
  if (match?.code) return { code: match.code, display: match.display };
  return undefined;
}
