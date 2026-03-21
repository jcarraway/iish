// ============================================================================
// Visualization Registry — vizId → scene module + article placement
// ============================================================================

export interface VizEntry {
  id: string;
  load: () => Promise<any>;
  articleSlug: string;
  placement: string; // e.g. 'after-section-0', 'after-section-1'
  title: string;
  description: string;
  category: 'biology' | 'treatments' | 'diagnostics' | 'pipeline' | 'side-effects' | 'screening';
}

export const VISUALIZATION_REGISTRY: Record<string, VizEntry> = {
  'b5-immune-recognition': {
    id: 'b5-immune-recognition',
    load: () => import('./scenes/b5-immune-recognition'),
    articleSlug: 'immune-system-cancer',
    placement: 'after-section-1',
    title: 'The Immune System vs Cancer',
    description: 'Step through how the immune system recognizes cancer cells, how tumors evade detection, and how vaccines restore immunity.',
    category: 'biology',
  },
  'b6-breast-subtypes': {
    id: 'b6-breast-subtypes',
    load: () => import('./scenes/b6-breast-subtypes'),
    articleSlug: 'breast-cancer-subtypes',
    placement: 'after-section-0',
    title: 'Breast Cancer Subtypes',
    description: 'Toggle between ER+/HER2-, HER2+, HER2-low, and TNBC to see how receptor configurations differ.',
    category: 'biology',
  },
  't1-adc-mechanism': {
    id: 't1-adc-mechanism',
    load: () => import('./scenes/t1-adc-mechanism'),
    articleSlug: 'antibody-drug-conjugates',
    placement: 'after-section-0',
    title: 'How ADCs Deliver Targeted Therapy',
    description: 'Watch an antibody-drug conjugate bind to a cancer cell, get internalized, release its payload, and destroy the cell from within.',
    category: 'treatments',
  },
  't2-checkpoint-inhibitor': {
    id: 't2-checkpoint-inhibitor',
    load: () => import('./scenes/t2-checkpoint-inhibitor'),
    articleSlug: 'immunotherapy-breast-cancer',
    placement: 'after-section-1',
    title: 'How Checkpoint Inhibitors Work',
    description: 'Toggle immunotherapy on and off to see how PD-1/PD-L1 blockade unleashes T-cells against cancer.',
    category: 'treatments',
  },
  't3-chemotherapy': {
    id: 't3-chemotherapy',
    load: () => import('./scenes/t3-chemotherapy'),
    articleSlug: 'chemotherapy-how-it-works',
    placement: 'after-section-0',
    title: 'How Chemotherapy Works',
    description: 'Animation showing chemotherapy drugs disrupting cell division and why certain side effects occur.',
    category: 'treatments',
  },
  't10-mrna-vaccine': {
    id: 't10-mrna-vaccine',
    load: () => import('./scenes/t10-mrna-vaccine'),
    articleSlug: 'personalized-cancer-vaccines',
    placement: 'after-section-2',
    title: 'How mRNA Cancer Vaccines Work',
    description: 'Step through the full pipeline: from tumor biopsy to neoantigen prediction to vaccine manufacturing to immune training.',
    category: 'treatments',
  },
  'd2-her2-scoring': {
    id: 'd2-her2-scoring',
    load: () => import('./scenes/d2-her2-scoring'),
    articleSlug: 'her2-testing-explained',
    placement: 'after-section-0',
    title: 'HER2 Scoring: From 0 to 3+',
    description: 'Slide through IHC scores to see receptor density change and what treatments become available at each level.',
    category: 'diagnostics',
  },
  'd3-pathology-report': {
    id: 'd3-pathology-report',
    load: () => import('./scenes/d3-pathology-report'),
    articleSlug: 'understanding-pathology-report',
    placement: 'after-section-0',
    title: 'Understanding Your Pathology Report',
    description: 'Click each field of a pathology report to learn what it means and why it matters for your treatment.',
    category: 'diagnostics',
  },

  // ---- VZ2: Tier-2 Scenes ----

  't4-endocrine-therapy': {
    id: 't4-endocrine-therapy',
    load: () => import('./scenes/t4-endocrine-therapy'),
    articleSlug: 'endocrine-therapy-breast-cancer',
    placement: 'after-section-1',
    title: 'How Endocrine Therapy Works',
    description: 'Toggle between tamoxifen, aromatase inhibitors, and SERDs to see how each blocks estrogen-driven cancer growth.',
    category: 'treatments',
  },
  't7-cold-capping': {
    id: 't7-cold-capping',
    load: () => import('./scenes/t7-cold-capping'),
    articleSlug: 'scalp-cooling-hair-loss',
    placement: 'after-section-0',
    title: 'How Cold Capping Prevents Hair Loss',
    description: 'Toggle to compare blood flow and follicle damage with and without scalp cooling during chemotherapy.',
    category: 'treatments',
  },
  't6-radiation-dna': {
    id: 't6-radiation-dna',
    load: () => import('./scenes/t6-radiation-dna'),
    articleSlug: 'radiation-therapy-explained',
    placement: 'after-section-1',
    title: 'How Radiation Damages Cancer DNA',
    description: 'Step through how photon beams cause double-strand DNA breaks and why cancer cells are worse at repair.',
    category: 'treatments',
  },
  't8-cdk-inhibitor': {
    id: 't8-cdk-inhibitor',
    load: () => import('./scenes/t8-cdk-inhibitor'),
    articleSlug: 'cdk-inhibitors-breast-cancer',
    placement: 'after-section-0',
    title: 'How CDK4/6 Inhibitors Arrest Cell Growth',
    description: 'Step through the cell cycle to see how CDK inhibitors block the G1/S checkpoint and stop cancer cells from dividing.',
    category: 'treatments',
  },
  'd1-tumor-sequencing': {
    id: 'd1-tumor-sequencing',
    load: () => import('./scenes/d1-tumor-sequencing'),
    articleSlug: 'tumor-sequencing-explained',
    placement: 'after-section-0',
    title: 'How Tumor Sequencing Works',
    description: 'Step through the sequencing pipeline from biopsy to report, seeing how DNA is extracted, fragmented, sequenced, and analyzed.',
    category: 'diagnostics',
  },
  'd4-oncotype-score': {
    id: 'd4-oncotype-score',
    load: () => import('./scenes/d4-oncotype-score'),
    articleSlug: 'oncotype-dx-explained',
    placement: 'after-section-0',
    title: 'Understanding Your Oncotype Score',
    description: 'Slide through Oncotype DX scores 0-100 to see risk categories, gene group activity, and chemo benefit thresholds.',
    category: 'diagnostics',
  },
  's1-chemo-side-effects': {
    id: 's1-chemo-side-effects',
    load: () => import('./scenes/s1-chemo-side-effects'),
    articleSlug: 'chemotherapy-side-effects',
    placement: 'after-section-0',
    title: 'Why Chemotherapy Causes Side Effects',
    description: 'Click different body regions to learn why chemo affects hair, mouth, gut, bone marrow, and nails — all fast-dividing tissues.',
    category: 'side-effects',
  },

  // ---- VZ3: Tier-3 Scenes ----

  'b1-mutations-cause-cancer': {
    id: 'b1-mutations-cause-cancer',
    load: () => import('./scenes/b1-mutations-cause-cancer'),
    articleSlug: 'how-cancer-starts',
    placement: 'after-section-0',
    title: 'How a Single Mutation Starts Cancer',
    description: 'Step through how a single DNA letter change leads to a broken protein, uncontrolled division, and tumor formation.',
    category: 'biology',
  },
  'b3-metastasis': {
    id: 'b3-metastasis',
    load: () => import('./scenes/b3-metastasis'),
    articleSlug: 'metastasis-explained',
    placement: 'after-section-0',
    title: 'How Cancer Spreads: Metastasis',
    description: 'Step through the metastatic cascade: detachment, invasion, bloodstream travel, and colonization at a distant site.',
    category: 'biology',
  },
  't5-protac-degraders': {
    id: 't5-protac-degraders',
    load: () => import('./scenes/t5-protac-degraders'),
    articleSlug: 'protac-targeted-degradation',
    placement: 'after-section-0',
    title: 'How PROTACs Destroy Cancer Proteins',
    description: 'Step through the PROTAC mechanism: recruit, tag, destroy, and recycle. Unlike inhibitors that block, PROTACs remove.',
    category: 'treatments',
  },
  'p1-neoantigen-pipeline': {
    id: 'p1-neoantigen-pipeline',
    load: () => import('./scenes/p1-neoantigen-pipeline'),
    articleSlug: 'neoantigen-prediction',
    placement: 'after-section-0',
    title: 'The Neoantigen Prediction Pipeline',
    description: 'Step through the full pipeline from raw sequencing data to vaccine design: alignment, variant calling, HLA typing, peptide prediction, and ranking.',
    category: 'pipeline',
  },
  'd5-ctdna-monitoring': {
    id: 'd5-ctdna-monitoring',
    load: () => import('./scenes/d5-ctdna-monitoring'),
    articleSlug: 'ctdna-liquid-biopsy',
    placement: 'after-section-0',
    title: 'How Liquid Biopsy Detects Cancer DNA',
    description: 'Step through ctDNA monitoring: tumor shedding, blood draw, cfDNA isolation, sequencing, and early recurrence detection.',
    category: 'diagnostics',
  },
  's2-neuropathy': {
    id: 's2-neuropathy',
    load: () => import('./scenes/s2-neuropathy'),
    articleSlug: 'chemotherapy-neuropathy',
    placement: 'after-section-0',
    title: 'How Chemotherapy Causes Neuropathy',
    description: 'Step through how taxane drugs stabilize microtubules, block transport in nerve fibers, and cause numbness in hands and feet.',
    category: 'side-effects',
  },
  'p2-mhc-presentation': {
    id: 'p2-mhc-presentation',
    load: () => import('./scenes/p2-mhc-presentation'),
    articleSlug: 'antigen-presentation',
    placement: 'after-section-0',
    title: 'How Cells Present Antigens to Immune System',
    description: 'Step through MHC-I antigen presentation: proteasome cutting, TAP transport, MHC loading, surface display, and T-cell recognition.',
    category: 'pipeline',
  },

  // ---- VZ4: Tier-4 Scenes ----

  'b2-cancer-vs-normal': {
    id: 'b2-cancer-vs-normal',
    load: () => import('./scenes/b2-cancer-vs-normal'),
    articleSlug: 'cancer-vs-normal-cells',
    placement: 'after-section-0',
    title: 'Cancer vs Normal Cells: 5 Key Differences',
    description: 'Toggle through five hallmarks of cancer: uncontrolled division, death signal evasion, immune evasion, blood vessel growth, and tissue invasion.',
    category: 'biology',
  },
  'b4-tumor-microenvironment': {
    id: 'b4-tumor-microenvironment',
    load: () => import('./scenes/b4-tumor-microenvironment'),
    articleSlug: 'tumor-microenvironment',
    placement: 'after-section-0',
    title: 'The Tumor Microenvironment',
    description: 'Click to explore the ecosystem around a cancer cell: T-cells, fibroblasts, blood vessels, suppressive molecules, and extracellular matrix.',
    category: 'biology',
  },
  't9-lumpectomy-vs-mastectomy': {
    id: 't9-lumpectomy-vs-mastectomy',
    load: () => import('./scenes/t9-lumpectomy-vs-mastectomy'),
    articleSlug: 'surgery-options-breast-cancer',
    placement: 'after-section-0',
    title: 'Lumpectomy vs Mastectomy',
    description: 'Toggle between lumpectomy and mastectomy to see the tissue removed, margin concept, and reconstruction considerations.',
    category: 'treatments',
  },
  's3-radiation-skin': {
    id: 's3-radiation-skin',
    load: () => import('./scenes/s3-radiation-skin'),
    articleSlug: 'radiation-skin-effects',
    placement: 'after-section-0',
    title: 'Radiation Skin Effects Over Time',
    description: 'Step through weeks 1-4 of radiation skin changes: redness, peak reaction, desquamation, and recovery.',
    category: 'side-effects',
  },
  's4-endocrine-body-effects': {
    id: 's4-endocrine-body-effects',
    load: () => import('./scenes/s4-endocrine-body-effects'),
    articleSlug: 'endocrine-therapy-side-effects',
    placement: 'after-section-0',
    title: 'Endocrine Therapy: Body-Wide Effects',
    description: 'Click body regions to learn how estrogen deprivation affects joints, bones, brain, heart, and mood.',
    category: 'side-effects',
  },
  'v1-ai-mammogram': {
    id: 'v1-ai-mammogram',
    load: () => import('./scenes/v1-ai-mammogram'),
    articleSlug: 'ai-breast-cancer-screening',
    placement: 'after-section-1',
    title: 'AI-Assisted Mammogram Reading',
    description: 'Toggle AI overlay on a mammogram to see attention mapping, confidence scores, and how AI improves detection rates.',
    category: 'screening',
  },
  'v2-risk-factors': {
    id: 'v2-risk-factors',
    load: () => import('./scenes/v2-risk-factors'),
    articleSlug: 'breast-cancer-risk-factors',
    placement: 'after-section-0',
    title: 'How Risk Factors Compound',
    description: 'Toggle risk factors on and off to see how genetics, age, hormones, lifestyle, and breast density compound your relative risk.',
    category: 'screening',
  },
  'p3-mrna-translation': {
    id: 'p3-mrna-translation',
    load: () => import('./scenes/p3-mrna-translation'),
    articleSlug: 'mrna-to-protein',
    placement: 'after-section-0',
    title: 'From mRNA to Protein',
    description: 'Step through mRNA translation: ribosome scanning, codon reading, tRNA matching, peptide bond formation, and protein folding.',
    category: 'pipeline',
  },
  'p4-binding-prediction': {
    id: 'p4-binding-prediction',
    load: () => import('./scenes/p4-binding-prediction'),
    articleSlug: 'mhc-binding-prediction',
    placement: 'after-section-0',
    title: 'MHC Binding Prediction',
    description: 'Slide through peptide sequences to see binding affinity change, shape complementarity, and the 500nM threshold for vaccine candidate selection.',
    category: 'pipeline',
  },
};

/** Get all visualizations mapped to a given article slug */
export function getVisualizationsForArticle(slug: string): VizEntry[] {
  return Object.values(VISUALIZATION_REGISTRY).filter(v => v.articleSlug === slug);
}
