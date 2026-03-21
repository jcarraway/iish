// ============================================================================
// Accessibility: Reduced Motion + Screen Reader + Keyboard Navigation
// ============================================================================

/** Check if user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Scale animation speed based on reduced motion preference */
export function getAnimationSpeed(baseSpeed: number): number {
  return prefersReducedMotion() ? 0 : baseSpeed;
}

/** Scene descriptions for screen readers */
const SCENE_DESCRIPTIONS: Record<string, string | ((stage?: number) => string)> = {
  'b5-immune-recognition': (stage?: number) => {
    const stages = [
      'A cancer cell with mutated proteins visible on its surface.',
      'A dendritic cell captures a neoantigen fragment from the cancer cell.',
      'The dendritic cell presents the neoantigen to a T-cell via MHC-peptide-TCR interaction.',
      'The T-cell activates, glowing brightly and beginning to multiply.',
      'The cancer cell displays PD-L1, causing the T-cell to become exhausted and dim.',
      'A vaccine trains the immune system to overcome evasion, T-cells reactivate and destroy the cancer cell.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  'b6-breast-subtypes': 'Interactive visualization showing different breast cancer subtypes (ER+/HER2-, HER2+, HER2-low, TNBC) and their receptor configurations on cell surfaces.',
  't1-adc-mechanism': 'Animation showing how antibody-drug conjugates work: the antibody binds to a cancer cell receptor, gets internalized, releases its payload drug, and destroys the cancer cell.',
  't2-checkpoint-inhibitor': 'Toggle visualization showing how checkpoint inhibitors work: without treatment, cancer cells suppress T-cells via PD-1/PD-L1; with treatment, the drug blocks this interaction, allowing T-cells to attack.',
  't3-chemotherapy': 'Animation showing how chemotherapy drugs enter the bloodstream, reach dividing cells, disrupt their DNA, and cause cell death. Also explains why fast-dividing normal cells are affected.',
  't10-mrna-vaccine': (stage?: number) => {
    const stages = [
      'A tumor biopsy is taken and DNA is extracted.',
      'The DNA is sequenced and mutations are identified.',
      'Neoantigens are predicted and ranked by binding affinity.',
      'mRNA is designed with optimized codons.',
      'The mRNA is encapsulated in a lipid nanoparticle.',
      'The vaccine is injected and enters a muscle cell.',
      'The ribosome reads the mRNA and produces neoantigen proteins.',
      'Trained T-cells seek out and destroy cancer cells with matching neoantigens.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  'd2-her2-scoring': 'Interactive slider showing HER2 receptor density on cancer cells, from IHC score 0 (none) through 1+ (HER2-low), 2+ (borderline), to 3+ (HER2-positive), with corresponding treatment options.',
  'd3-pathology-report': 'An explorable pathology report where clicking each field (grade, stage, receptor status, Ki-67, margins, lymph nodes) reveals a plain-language explanation of what it means and why it matters.',

  // VZ2 scenes
  't4-endocrine-therapy': 'Toggle visualization comparing four endocrine therapy modes: normal estrogen-driven growth, tamoxifen receptor blocking, aromatase inhibitor estrogen reduction, and SERD receptor degradation.',
  't7-cold-capping': 'Toggle visualization comparing scalp during chemotherapy with and without cold capping. Without: full blood flow damages follicles. With: constricted vessels protect follicles.',
  't6-radiation-dna': (stage?: number) => {
    const stages = [
      'A photon beam approaches a cancer cell.',
      'The beam enters tissue and reaches the cell nucleus.',
      'The photon hits a DNA double helix.',
      'A double-strand break forms in the DNA.',
      'The cell attempts to repair the break using repair enzymes.',
      'Repair fails — cancer cells have defective repair machinery.',
      'The cell dies through apoptosis, fragmenting into pieces.',
      'A normal cell with the same damage successfully repairs itself.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  't8-cdk-inhibitor': (stage?: number) => {
    const stages = [
      'The cell cycle wheel showing G1, S, G2, and M phases.',
      'CDK4/6 acts as a green light at the G1/S checkpoint.',
      'The cell passes through the checkpoint and enters S phase.',
      'Cancer cells cycle rapidly, dividing uncontrollably.',
      'A CDK4/6 inhibitor drug approaches the checkpoint.',
      'The drug blocks CDK4/6, turning the green light red.',
      'The cell is arrested in G1, unable to replicate its DNA.',
      'Comparison: arrested cancer cell vs still-dividing cell without drug.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  'd1-tumor-sequencing': (stage?: number) => {
    const stages = [
      'A tissue biopsy sample is collected.',
      'DNA is extracted from the tumor tissue.',
      'The DNA is fragmented into short pieces.',
      'Adapters are ligated for library preparation.',
      'Fluorescent bases are incorporated during sequencing.',
      'Raw sequencing data (FASTQ) is generated.',
      'Short reads are aligned to the reference genome.',
      'Variants are called by comparing tumor to normal.',
      'A clinical sequencing report summarizes the findings.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  'd4-oncotype-score': 'Interactive slider showing Oncotype DX recurrence score from 0-100 with a 21-gene heat map, risk categories (low, intermediate, high), and chemo benefit threshold.',
  's1-chemo-side-effects': 'Explorable body diagram with clickable regions: hair, mouth, gut, bone marrow, and nails. Each reveals why chemotherapy affects that fast-dividing tissue.',

  // VZ3 scenes
  'b1-mutations-cause-cancer': (stage?: number) => {
    const stages = [
      'Normal DNA double helix in a healthy cell.',
      'A single base mutation occurs — one letter changes.',
      'The mutated DNA produces an altered protein.',
      'The protein loses its tumor suppressor function (like p53).',
      'Without growth brakes, the cell divides uncontrollably.',
      'Multiple divisions form a cluster of abnormal cells.',
      'A visible tumor mass has formed from the original mutation.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  'b3-metastasis': (stage?: number) => {
    const stages = [
      'A primary tumor in breast tissue.',
      'A cancer cell detaches from the primary tumor.',
      'The cell invades through the basement membrane.',
      'The cell enters a blood vessel (intravasation).',
      'The cell travels through the bloodstream.',
      'The cell exits the vessel at a distant site (extravasation).',
      'The cell begins to colonize the new tissue.',
      'A secondary tumor (metastasis) forms at the distant site.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  't5-protac-degraders': (stage?: number) => {
    const stages = [
      'A disease-driving target protein (oncogene product) is overactive.',
      'A traditional inhibitor blocks the active site, but the protein remains.',
      'PROTAC molecule: two arms connected by a linker — one binds target, one binds E3 ligase.',
      'PROTAC brings target protein and E3 ligase together in a ternary complex.',
      'E3 ligase attaches ubiquitin "destroy me" tags to the target protein.',
      'The proteasome recognizes the ubiquitin chain and pulls the protein in.',
      'The proteasome destroys the target protein into fragments.',
      'The PROTAC is released intact, ready to find another target.',
      'Comparison: inhibitors block one protein each; PROTACs catalytically destroy many.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  'p1-neoantigen-pipeline': (stage?: number) => {
    const stages = [
      'Raw FASTQ sequencing data with millions of short reads.',
      'Short reads are aligned to their positions on the reference genome.',
      'Somatic variants — mutations only in tumor — are identified.',
      'HLA typing determines which peptides your immune system can see.',
      'Candidate neopeptides (8-11 amino acids) are generated spanning each mutation.',
      'NetMHCpan predicts binding affinity of each peptide to your HLA alleles.',
      'Candidates are ranked by binding, expression, and clonality. Top 20 selected.',
      'Selected neoantigens are encoded into an mRNA vaccine construct.',
      'A comprehensive report shows selected neoantigens and the vaccine design.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  'd5-ctdna-monitoring': (stage?: number) => {
    const stages = [
      'A tumor sheds small fragments of DNA into the bloodstream.',
      'A blood draw collects a sample containing both normal and tumor DNA.',
      'Cell-free DNA is isolated from the blood sample.',
      'The cfDNA is sequenced to detect tumor-specific mutations.',
      'Known tumor mutations are searched for in the cfDNA.',
      'The fraction of tumor DNA (variant allele frequency) is quantified.',
      'Multiple time points show ctDNA levels rising or falling.',
      'Rising levels can detect recurrence months before imaging.',
      'Clinical interpretation guides treatment decisions.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  's2-neuropathy': (stage?: number) => {
    const stages = [
      'A healthy nerve fiber with normal microtubules and vesicle transport.',
      'Taxane chemotherapy drug enters the nerve cell.',
      'The drug stabilizes microtubules so they cannot flex or disassemble.',
      'Axonal transport of vesicles and nutrients is blocked.',
      'Signals can no longer travel along the nerve properly.',
      'The distal axon (furthest from cell body) begins to degenerate.',
      'Numbness and tingling develop in hands and feet (stocking-glove pattern).',
      'After treatment ends, slow recovery may occur as nerves regenerate.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  'p2-mhc-presentation': (stage?: number) => {
    const stages = [
      'A protein inside the cell, containing a potential neoantigen.',
      'The proteasome cuts the protein into short peptide fragments.',
      'Peptides are transported to the ER by the TAP transporter.',
      'An empty MHC class I molecule waits in the ER membrane.',
      'The peptide is loaded into the MHC groove.',
      'The MHC-peptide complex undergoes a conformational change.',
      'The complex travels from ER through Golgi to the cell surface.',
      'The peptide is displayed on the cell surface in the MHC groove.',
      'A T-cell receptor checks the displayed peptide.',
      'Recognition triggers T-cell activation and immune response.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },

  // VZ4 scenes
  'b2-cancer-vs-normal': 'Toggle visualization comparing normal and cancer cells across five hallmarks: division rate, death signal response, immune evasion, blood vessel recruitment, and tissue invasion.',
  'b4-tumor-microenvironment': 'Explorable ecosystem around a cancer cell. Click to learn about T-cells, fibroblasts, blood vessels, suppressive molecules, and extracellular matrix.',
  't9-lumpectomy-vs-mastectomy': 'Toggle visualization comparing lumpectomy (tumor plus margin removal) and mastectomy (complete tissue removal), showing tissue cross-sections and surgical margins.',
  's3-radiation-skin': (stage?: number) => {
    const stages = [
      'Normal skin before radiation treatment begins.',
      'Week 1: mild redness (erythema) appears in the treatment area.',
      'Week 2-3: peak redness with dry desquamation (peeling).',
      'Week 3-4: moist desquamation may occur in skin folds.',
      'Recovery: skin gradually heals over weeks after treatment ends.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  's4-endocrine-body-effects': 'Explorable body diagram showing how estrogen deprivation from endocrine therapy affects joints (arthralgia), bones (osteoporosis), brain (hot flashes), heart (cardiovascular risk), and mood.',
  'v1-ai-mammogram': 'Toggle visualization comparing a standard mammogram view with AI-assisted reading showing attention heat map overlay, confidence scores, and sensitivity/specificity improvements.',
  'v2-risk-factors': 'Interactive risk factor landscape where toggling genetics, age, hormones, lifestyle, and breast density on and off shows how risk multipliers compound.',
  'p3-mrna-translation': (stage?: number) => {
    const stages = [
      'An mRNA molecule enters the cell cytoplasm.',
      'The small ribosomal subunit binds to the mRNA.',
      'The ribosome scans for the AUG start codon.',
      'The large subunit joins, forming the complete ribosome.',
      'A tRNA molecule carries the matching amino acid.',
      'The anticodon matches the mRNA codon in the A site.',
      'A peptide bond forms between amino acids.',
      'The ribosome moves one codon forward (translocation).',
      'The growing polypeptide chain elongates.',
      'The ribosome encounters a stop codon.',
      'The completed protein is released and begins folding.',
      'Comparison of natural vs codon-optimized mRNA translation speed.',
    ];
    return stages[stage ?? 0] ?? stages[0];
  },
  'p4-binding-prediction': 'Interactive slider showing peptide sequences fitting into an MHC-I groove. Binding affinity changes with each peptide, from very weak (50μM) to very strong (5nM). The 500nM threshold determines vaccine candidate selection.',
};

/** Get screen reader description for current scene state */
export function createAriaDescription(vizId: string, stage?: number): string {
  const desc = SCENE_DESCRIPTIONS[vizId];
  if (!desc) return 'Interactive science visualization';
  if (typeof desc === 'function') return desc(stage);
  return desc;
}

/** Set up keyboard navigation for canvas interactions */
export function setupKeyboardNav(
  canvas: HTMLCanvasElement,
  handlers: {
    onNext?: () => void;
    onPrev?: () => void;
    onToggle?: () => void;
    onIncrease?: () => void;
    onDecrease?: () => void;
  }
): () => void {
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        handlers.onNext?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handlers.onPrev?.();
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        handlers.onToggle?.();
        break;
      case 'ArrowUp':
        e.preventDefault();
        handlers.onIncrease?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        handlers.onDecrease?.();
        break;
    }
  };

  canvas.addEventListener('keydown', handleKeyDown);
  return () => canvas.removeEventListener('keydown', handleKeyDown);
}
