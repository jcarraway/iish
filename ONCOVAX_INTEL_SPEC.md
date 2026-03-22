# Research Intelligence Stream — Technical Specification v1.0

## Cross-Cutting Module: Real-Time Research Intelligence (INTEL)

**Author:** Rett (Happy Medium)
**Date:** March 2026
**Depends on:** Phase 1 (MATCH) patient profiles, document ingestion, trial matching infrastructure
**Integrates with:** All phases (MATCH, SEQUENCE, PREDICT, MANUFACTURE, SURVIVE)
**Purpose:** Standalone spec for Claude Code. A continuously-updating research intelligence layer that ingests, classifies, summarizes, and personalizes cancer research for both patients and clinicians. Not a sequential phase — a data substrate that makes every other module smarter over time.

---

## Table of Contents

1. [Strategic Context](#1-strategic-context)
2. [System Architecture](#2-system-architecture)
3. [Multi-Source Ingestion Pipeline](#3-multi-source-ingestion-pipeline)
4. [Content Taxonomy & Classification](#4-content-taxonomy--classification)
5. [AI Summarization & Curation Pipeline](#5-ai-summarization--curation-pipeline)
6. [Dual-Audience Rendering Layer](#6-dual-audience-rendering-layer)
7. [Personalization Engine](#7-personalization-engine)
8. [Community Intelligence Layer](#8-community-intelligence-layer)
9. [Notification & Delivery System](#9-notification--delivery-system)
10. [Integration Points with Existing Phases](#10-integration-points-with-existing-phases)
11. [Data Model](#11-data-model)
12. [API & tRPC Router Definitions](#12-api--trpc-router-definitions)
13. [Build Sequence](#13-build-sequence)
14. [Open Questions & Risk Register](#14-open-questions--risk-register)

---

## 1. Strategic Context

### 1.1 The Problem

The breast cancer research landscape is moving faster than any individual — patient or clinician — can track. In the last 18 months alone: multiple new ADCs approved, the first oral PROTAC degrader showed Phase 3 results, AI mammography screening was validated at national scale, ctDNA monitoring moved toward clinical standard, and personalized mRNA cancer vaccines entered late-stage trials. A community oncologist managing 200+ patients across multiple cancer types cannot stay current on all of this. A patient Googling their diagnosis gets noise, not signal.

The current information ecosystem fails both audiences:
- **Patients** get either oversimplified awareness content ("eat your vegetables") or impenetrable journal abstracts. Nothing connects research developments to *their specific situation*.
- **Clinicians** rely on conference attendance, email alerts from journals they subscribe to, and word-of-mouth. There's no unified feed that filters by relevance to their patient panel and flags practice-changing vs. incremental findings.
- **Neither audience** gets maturity calibration — the same breathless headline covers an FDA approval and a mouse study. Patients can't tell what's real from what's hype. This causes real harm: false hope from preclinical results, missed opportunities from not knowing about newly approved options.

### 1.2 The Opportunity

The platform already has the two things needed to solve this:

1. **Rich patient profiles** — cancer type, subtype, stage, biomarkers, mutations, treatment history, treatment phase. This is the personalization key that makes a generic research feed into a "what matters for YOU right now" intelligence stream.

2. **Claude API integration** — already used for eligibility parsing, document extraction, treatment translation. The same architecture handles research summarization, classification, and dual-audience rendering.

The Research Intelligence Stream transforms the platform from a tool you use at decision points (diagnosis, treatment selection, recurrence) into a companion you check regularly because it consistently tells you something you didn't know that matters for your situation.

### 1.3 Defensibility

This module is the long-term moat. Trial matching and document ingestion are replicable features. A continuously-curated, AI-classified, personally-relevant research intelligence stream with community data — indexed against structured patient profiles — is extremely hard to replicate because it requires both the data infrastructure and the user base generating profile data and community intelligence. The compound effect is the moat: every user who joins makes the personalization better, every community report enriches the feed, and the classification taxonomy becomes more precise with each item processed.

---

## 2. System Architecture

### 2.1 High-Level Data Flow

```
External Sources                    Ingestion Workers              Classification
─────────────────                   ─────────────────              ──────────────
PubMed API          ──┐
ClinicalTrials.gov  ──┤
FDA openFDA API     ──┤           NATS JetStream
bioRxiv/medRxiv     ──┼────────►  Ingestion Queue  ────────►  Claude Classification
ASCO/ESMO RSS       ──┤           (per-source        │         Pipeline
Cancer center news  ──┤            workers)           │         ├─ Taxonomy tagging
NIH Reporter        ──┤                               │         ├─ Maturity tier
Community reports   ──┘                               │         ├─ Evidence level
                                                      │         ├─ Practice impact
                                                      │         └─ Biomarker relevance
                                                      │
                                                      ▼
                                               Postgres (research_items)
                                                      │
                                                      ▼
                                              Summarization Pipeline
                                              ├─ Patient summary (Claude)
                                              ├─ Clinician summary (Claude)
                                              └─ "What this means for you" (per-profile)
                                                      │
                                                      ▼
                                              Personalization Engine
                                              ├─ Profile matching
                                              ├─ Relevance scoring
                                              ├─ Feed ranking
                                              └─ Notification routing
                                                      │
                                              ┌───────┼───────┐
                                              ▼       ▼       ▼
                                          In-App    Email    Push
                                           Feed    Digest   Alert
```

### 2.2 Monorepo Additions

```
packages/
├── intel-ingestion/              # Source-specific ingestion workers
│   ├── src/
│   │   ├── sources/
│   │   │   ├── pubmed.ts         # PubMed E-utilities API client
│   │   │   ├── clinicaltrials.ts # ClinicalTrials.gov v2 (extends Phase 1)
│   │   │   ├── fda.ts            # openFDA API client
│   │   │   ├── preprints.ts      # bioRxiv/medRxiv API client
│   │   │   ├── conferences.ts    # ASCO/ESMO/SABCS RSS + scraping
│   │   │   ├── institutions.ts   # Cancer center newsroom scraping
│   │   │   └── nih-reporter.ts   # NIH Reporter API client
│   │   ├── normalize.ts          # Raw → normalized ResearchItem
│   │   └── dedup.ts              # Cross-source deduplication
│   └── package.json
├── intel-classify/               # Claude-powered classification
│   ├── src/
│   │   ├── classifier.ts         # Taxonomy classification pipeline
│   │   ├── summarizer.ts         # Dual-audience summary generation
│   │   ├── impact-scorer.ts      # Practice-changing vs. incremental
│   │   ├── credibility.ts        # Source credibility + conflict of interest
│   │   └── prompts/
│   │       ├── classify.ts       # Classification prompt templates
│   │       ├── patient-summary.ts
│   │       ├── clinician-summary.ts
│   │       └── personalize.ts    # "What this means for you" prompt
│   └── package.json
├── intel-feed/                   # Personalization + feed generation
│   ├── src/
│   │   ├── personalize.ts        # Profile-based relevance scoring
│   │   ├── feed-builder.ts       # Ranked feed generation
│   │   ├── digest-builder.ts     # Email digest composition
│   │   └── alerts.ts             # Urgent notification routing
│   └── package.json
```

### 2.3 NATS JetStream Streams

Reuse the AEGIS event-driven pattern:

```typescript
const INTEL_STREAMS = {
  // Ingestion
  "INTEL.source.raw": {
    description: "Raw items from external sources",
    payload: { sourceType: string; rawContent: string; sourceUrl: string; metadata: object }
  },
  "INTEL.item.normalized": {
    description: "Normalized research items ready for classification",
    payload: { itemId: string; normalizedContent: NormalizedItem }
  },

  // Classification
  "INTEL.item.classified": {
    description: "Items with taxonomy tags, maturity tier, evidence level",
    payload: { itemId: string; classification: Classification }
  },

  // Summarization
  "INTEL.item.summarized": {
    description: "Items with patient + clinician summaries generated",
    payload: { itemId: string; patientSummary: string; clinicianSummary: string }
  },

  // Feed events
  "INTEL.feed.new_item": {
    description: "New item ready for feed — triggers personalization",
    payload: { itemId: string; classification: Classification }
  },
  "INTEL.alert.urgent": {
    description: "Urgent item — FDA safety alert, drug interaction, etc.",
    payload: { itemId: string; affectedUsers: string[]; alertType: string }
  },

  // Community
  "INTEL.community.report_submitted": {
    description: "New community report from a patient",
    payload: { reportId: string; reportType: string; userId: string }
  }
};
```

---

## 3. Multi-Source Ingestion Pipeline

### 3.1 Source Configuration

Each source has its own worker with source-specific API logic, rate limits, and parsing.

```typescript
interface SourceConfig {
  id: string;
  name: string;
  type: "api" | "rss" | "scrape";
  enabled: boolean;
  syncFrequency: string;              // cron expression
  rateLimitPerMinute: number;
  credibilityTier: "tier1_journal" | "peer_reviewed" | "preprint" | "institutional" | "media" | "community";
  
  // Source-specific config
  apiConfig?: {
    baseUrl: string;
    authType: "none" | "api_key" | "oauth";
    apiKey?: string;
  };
  rssConfig?: {
    feedUrls: string[];
  };
  scrapeConfig?: {
    urls: string[];
    selectors: Record<string, string>;  // CSS selectors for title, abstract, date, etc.
  };
  
  // Filtering
  searchTerms: string[];               // Cancer-relevant terms
  meshTerms?: string[];                // MeSH terms for PubMed
  excludeTerms?: string[];             // Filter out irrelevant results
}
```

### 3.2 Source Implementations

#### PubMed / PMC (Primary — highest volume, highest quality)

```typescript
// packages/intel-ingestion/src/sources/pubmed.ts

const PUBMED_CONFIG: SourceConfig = {
  id: "pubmed",
  name: "PubMed / PMC",
  type: "api",
  enabled: true,
  syncFrequency: "0 */6 * * *",       // Every 6 hours
  rateLimitPerMinute: 3,               // NCBI rate limit (10/sec with API key, but be conservative)
  credibilityTier: "peer_reviewed",    // Varies by journal — classified per-item
  apiConfig: {
    baseUrl: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/",
    authType: "api_key",               // NCBI API key (free, higher rate limit)
  },
  searchTerms: [
    "breast cancer treatment",
    "breast neoplasms therapy",
    "breast cancer immunotherapy",
    "breast cancer vaccine",
    "antibody drug conjugate breast",
    "TNBC treatment",
    "HER2 breast cancer",
    "endocrine therapy breast cancer",
    "ctDNA breast cancer",
    "breast cancer screening AI",
    "breast cancer survivorship",
  ],
  meshTerms: [
    "Breast Neoplasms/therapy",
    "Breast Neoplasms/drug therapy",
    "Breast Neoplasms/immunology",
    "Cancer Vaccines",
    "Antibody-Drug Conjugates",
    "Circulating Tumor DNA",
  ],
};

// E-utilities workflow:
// 1. esearch — search PubMed with terms, get PMIDs
// 2. efetch — fetch full records for new PMIDs
// 3. Normalize into ResearchItem
// 4. Publish to INTEL.source.raw stream

interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: { lastName: string; foreName: string; affiliation: string }[];
  journal: string;
  journalIssn: string;
  publicationDate: string;
  doi: string | null;
  pmcId: string | null;               // Full-text available in PMC
  meshTerms: string[];
  publicationTypes: string[];          // "Clinical Trial", "Meta-Analysis", etc.
  grantIds: string[];                  // NIH grants — tracks funding sources
}

// Journal credibility mapping (seed with top oncology journals)
const JOURNAL_CREDIBILITY: Record<string, string> = {
  "N Engl J Med": "tier1_journal",
  "Lancet": "tier1_journal",
  "Lancet Oncol": "tier1_journal",
  "J Clin Oncol": "tier1_journal",
  "Nature": "tier1_journal",
  "Nature Medicine": "tier1_journal",
  "Nature Cancer": "tier1_journal",
  "JAMA": "tier1_journal",
  "JAMA Oncol": "tier1_journal",
  "Ann Oncol": "tier1_journal",
  "J Clin Invest": "tier1_journal",
  "Cancer Discov": "tier1_journal",
  "Cancer Cell": "tier1_journal",
  "Clin Cancer Res": "peer_reviewed",
  "Breast Cancer Res Treat": "peer_reviewed",
  "npj Breast Cancer": "peer_reviewed",
  // ... extend as needed
};
```

#### FDA (Critical — drug approvals and safety alerts)

```typescript
// packages/intel-ingestion/src/sources/fda.ts

const FDA_CONFIG: SourceConfig = {
  id: "fda",
  name: "FDA",
  type: "api",
  enabled: true,
  syncFrequency: "0 */2 * * *",       // Every 2 hours (safety alerts need fast pickup)
  rateLimitPerMinute: 40,              // openFDA limit: 240/min with key
  credibilityTier: "institutional",
  apiConfig: {
    baseUrl: "https://api.fda.gov/",
    authType: "api_key",
  },
  searchTerms: ["breast cancer", "breast neoplasm"],
};

// Three FDA data sources to monitor:

// 1. Drug approvals (openFDA drug/label endpoint)
//    - New drug approvals for breast cancer indications
//    - Supplemental approvals (new indications for existing drugs)
//    - Accelerated/fast track/breakthrough designations
//    Query: /drug/label.json?search=indications_and_usage:"breast+cancer"

// 2. Safety communications (openFDA drug/event endpoint)
//    - Adverse event reports for drugs our users are taking
//    - Safety label changes, boxed warnings
//    - Drug recalls
//    CRITICAL: If a safety alert involves a drug a user is currently on,
//    this triggers an URGENT notification (INTEL.alert.urgent)
//    Query: /drug/event.json?search=patient.drug.openfda.brand_name:"[drug]"

// 3. Press releases (FDA.gov newsroom — RSS)
//    - Approval announcements
//    - Advisory committee meetings
//    - Guidance documents
```

#### ClinicalTrials.gov (Extends Phase 1 MATCH)

```typescript
// packages/intel-ingestion/src/sources/clinicaltrials.ts
// NOTE: This extends the existing Phase 1 trial sync worker

// For INTEL, we additionally track:
// 1. NEW trial registrations (not just status changes)
// 2. Results postings (when completed trials publish results)
// 3. Protocol amendments (changes to eligibility, endpoints)
// These generate INTEL stream items in addition to updating the MATCH trial database

interface TrialIntelItem {
  nctId: string;
  eventType: "new_registration" | "results_posted" | "status_change" | "protocol_amendment";
  // For results_posted:
  primaryOutcome?: {
    measure: string;
    result: string;
    statisticalAnalysis: string;
  };
  // For status_change:
  previousStatus?: string;
  newStatus?: string;
}
```

#### bioRxiv / medRxiv (Preprints — early signal, lower evidence)

```typescript
// packages/intel-ingestion/src/sources/preprints.ts

const PREPRINT_CONFIG: SourceConfig = {
  id: "preprints",
  name: "bioRxiv / medRxiv",
  type: "api",
  enabled: true,
  syncFrequency: "0 8 * * *",         // Daily at 8am
  rateLimitPerMinute: 30,
  credibilityTier: "preprint",        // ALWAYS tagged as preprint — not peer reviewed
  apiConfig: {
    baseUrl: "https://api.biorxiv.org/",
    authType: "none",
  },
  searchTerms: [
    "breast cancer",
    "breast neoplasm",
    "triple negative breast",
    "HER2",
    "cancer vaccine mRNA",
    "neoantigen",
    "antibody drug conjugate",
  ],
};

// bioRxiv API: GET /details/biorxiv/{interval}
// medRxiv API: GET /details/medrxiv/{interval}
// interval = "2026-03-14/2026-03-15" for daily sync

// CRITICAL: Every preprint item MUST be tagged with:
// - credibilityTier: "preprint"
// - Patient summary MUST include: "This research has NOT been peer-reviewed yet"
// - Track if the preprint is later published (update item when DOI appears)
```

#### Conference Abstracts (ASCO, ESMO, SABCS)

```typescript
// packages/intel-ingestion/src/sources/conferences.ts

// Major breast cancer conferences to monitor:
const CONFERENCES = [
  {
    name: "ASCO Annual Meeting",
    typicalDate: "May-June",
    abstractSource: "https://meetings.asco.org/abstracts-presentations",
    rssUrl: null,                       // No RSS — scrape abstract listings
    credibilityTier: "peer_reviewed",   // Abstracts are peer-reviewed for selection
  },
  {
    name: "San Antonio Breast Cancer Symposium (SABCS)",
    typicalDate: "December",
    abstractSource: "https://www.sabcs.org/",
    rssUrl: null,
    credibilityTier: "peer_reviewed",
  },
  {
    name: "ESMO Congress",
    typicalDate: "September-October",
    abstractSource: "https://www.esmo.org/meeting-calendar",
    rssUrl: null,
    credibilityTier: "peer_reviewed",
  },
  {
    name: "AACR Annual Meeting",
    typicalDate: "April",
    abstractSource: "https://www.aacr.org/",
    rssUrl: null,
    credibilityTier: "peer_reviewed",
  },
];

// Conference ingestion is event-driven — ramp up sync frequency during conference weeks
// Pre-conference: abstracts released 1-2 weeks before
// During conference: multiple sessions per day with new data
// Post-conference: press coverage, expert commentary
```

#### Institutional Newsrooms

```typescript
// packages/intel-ingestion/src/sources/institutions.ts

const INSTITUTION_NEWSROOMS = [
  { name: "Memorial Sloan Kettering", rssUrl: "https://www.mskcc.org/news/news-releases/rss.xml" },
  { name: "MD Anderson Cancer Center", rssUrl: "https://www.mdanderson.org/newsroom/rss.xml" },
  { name: "Dana-Farber Cancer Institute", url: "https://www.dana-farber.org/newsroom/" },
  { name: "Mayo Clinic", rssUrl: "https://newsnetwork.mayoclinic.org/feed/" },
  { name: "Cleveland Clinic", url: "https://newsroom.clevelandclinic.org/" },
  { name: "Johns Hopkins Medicine", rssUrl: "https://www.hopkinsmedicine.org/news/media/rss" },
  { name: "NCI (National Cancer Institute)", rssUrl: "https://www.cancer.gov/news-events/rss" },
];

// Filter for breast cancer / oncology relevant items
// These often break news before journal publication
// Lower credibility than journal articles but higher than general media
```

#### NIH Reporter (Research Funding — leading indicator)

```typescript
// packages/intel-ingestion/src/sources/nih-reporter.ts

// NIH Reporter API: https://api.reporter.nih.gov/
// Tracks funded research grants — signals what's being invested in BEFORE results exist
// This is a leading indicator: a $5M NCI grant for "personalized mRNA vaccines in TNBC"
// tells us something is coming in 3-5 years

const NIH_REPORTER_CONFIG: SourceConfig = {
  id: "nih_reporter",
  name: "NIH Reporter",
  type: "api",
  enabled: true,
  syncFrequency: "0 6 * * 1",         // Weekly on Monday
  rateLimitPerMinute: 10,
  credibilityTier: "institutional",
  apiConfig: {
    baseUrl: "https://api.reporter.nih.gov/v2/",
    authType: "none",
  },
  searchTerms: [
    "breast cancer",
    "breast neoplasm",
    "cancer vaccine",
    "neoantigen",
    "immunotherapy breast",
  ],
};

// Track: project number, PI, institution, funding amount, abstract, start/end dates
// Classify as T5 (theoretical/early) unless the grant title indicates clinical work
```

### 3.3 Normalization

All sources normalize to a common intermediate format before classification:

```typescript
interface NormalizedItem {
  // Source tracking
  sourceId: string;                     // e.g., "pubmed"
  sourceItemId: string;                 // e.g., PMID, NCT ID, FDA approval number
  sourceUrl: string;
  sourceCredibility: string;

  // Content
  title: string;
  rawContent: string;                   // Full abstract, press release text, etc.
  authors: string[];
  institutions: string[];
  publishedAt: string;
  ingestedAt: string;

  // Pre-classification hints (from source metadata)
  publicationType: string | null;       // "Clinical Trial", "Meta-Analysis", etc. (from PubMed)
  meshTerms: string[];                  // MeSH terms if from PubMed
  drugNames: string[];                  // Extracted drug names
  trialPhase: string | null;           // If from ClinicalTrials.gov
  journalName: string | null;
  doi: string | null;

  // Dedup
  contentHash: string;                  // SHA-256 of title + abstract for dedup
  relatedItemIds: string[];            // Cross-source references (same study in PubMed + conference)
}
```

### 3.4 Deduplication

The same study often appears across multiple sources (PubMed article, conference abstract, press release, preprint). The dedup engine:

1. **Content hash match** — identical titles/abstracts
2. **DOI match** — same DOI across sources
3. **NCT ID match** — same trial referenced in multiple articles
4. **Fuzzy title match** — Levenshtein distance < threshold
5. **Author + date match** — same first/last author within ±30 days

When duplicates are found, merge into a single `ResearchItem` with multiple source references. The highest-credibility source becomes the primary.

---

## 4. Content Taxonomy & Classification

### 4.1 Taxonomy Dimensions

Every research item is classified along six dimensions. These are stored as structured fields, not free text, enabling precise filtering and personalization.

```typescript
interface Classification {
  // What cancer(s) does this apply to?
  cancerTypes: CancerType[];
  breastSubtypes: BreastSubtype[];      // Only if cancerTypes includes "breast"

  // How close is this to helping a patient TODAY?
  maturityTier: MaturityTier;

  // What aspect of the cancer journey does this address?
  domains: ResearchDomain[];

  // What treatment approach is involved?
  treatmentClasses: TreatmentClass[];

  // Which biomarkers/mutations are relevant?
  biomarkerRelevance: string[];         // ESR1, PIK3CA, BRCA1, HER2, PD-L1, etc.

  // What stage of treatment is this relevant to?
  treatmentStages: TreatmentStage[];

  // How strong is the evidence?
  evidenceLevel: EvidenceLevel;

  // How much does this change clinical practice?
  practiceImpact: PracticeImpact;

  // Confidence in this classification
  classificationConfidence: number;     // 0-1
}

type CancerType =
  | "breast" | "lung" | "colorectal" | "pancreatic" | "melanoma"
  | "ovarian" | "cervical" | "endometrial" | "prostate"
  | "glioblastoma" | "multiple" | "pan_cancer" | "other";

type BreastSubtype =
  | "er_positive_her2_negative"     // ER+/HER2- (most common)
  | "her2_positive"                 // HER2+
  | "her2_low"                      // HER2-low (IHC 1+ or 2+/FISH-)
  | "her2_ultralow"                 // Emerging category
  | "triple_negative"               // TNBC
  | "inflammatory"
  | "dcis"                          // Stage 0
  | "lobular"                       // ILC
  | "all_subtypes"
  | "not_specified";

type MaturityTier =
  | "T1_AVAILABLE_NOW"              // FDA-approved, in clinical practice
  | "T2_LATE_TRIALS"               // Phase 3 positive, approval expected
  | "T3_ACTIVE_TRIALS"             // Phase 1-2, enrolling, early data
  | "T4_PRECLINICAL"               // Animal models, in vitro
  | "T5_THEORETICAL";              // Computational, hypothesis-stage

type ResearchDomain =
  | "treatment"                     // Drugs, surgery, radiation
  | "detection"                     // Screening, early detection, diagnostics
  | "prevention"                    // Risk reduction, prophylactic measures
  | "survivorship"                  // Quality of life, late effects, recurrence monitoring
  | "quality_of_life"               // Supportive care, symptom management
  | "genetics"                      // Hereditary risk, germline testing
  | "ai_technology"                 // AI/ML applications in oncology
  | "epidemiology"                  // Incidence, prevalence, risk factors
  | "basic_science";                // Mechanisms, biology, pathways

type TreatmentClass =
  | "adc"                           // Antibody-drug conjugates
  | "immunotherapy"                 // Broad category
  | "checkpoint_inhibitor"          // PD-1/PD-L1/CTLA-4
  | "cancer_vaccine"                // Personalized, neoantigen, shared antigen
  | "serd"                          // Selective estrogen receptor degraders
  | "protac"                        // Proteolysis-targeting chimeras
  | "cdk_inhibitor"                 // CDK4/6 inhibitors
  | "pi3k_inhibitor"                // PI3K pathway
  | "parp_inhibitor"                // PARP inhibitors
  | "her2_targeted"                 // Trastuzumab, pertuzumab, etc.
  | "endocrine_therapy"             // Tamoxifen, aromatase inhibitors
  | "chemotherapy"                  // Traditional cytotoxic chemo
  | "radiation"                     // External beam, proton, brachytherapy
  | "surgery"                       // Surgical approaches
  | "cell_therapy"                  // CAR-T, TIL therapy
  | "bispecific"                    // Bispecific antibodies
  | "molecular_glue"               // CELMoDs, molecular glue degraders
  | "photodynamic"                  // PDT
  | "ctdna_monitoring"              // Liquid biopsy, MRD detection
  | "ai_screening"                  // AI-assisted imaging/screening
  | "lifestyle"                     // Exercise, nutrition, behavioral
  | "other";

type TreatmentStage =
  | "screening"                     // Before diagnosis
  | "diagnosis"                     // Diagnostic workup
  | "neoadjuvant"                   // Before surgery
  | "adjuvant"                      // After surgery
  | "first_line_metastatic"         // First treatment for metastatic disease
  | "second_line_plus"              // Second-line and beyond
  | "maintenance"                   // Ongoing maintenance therapy
  | "survivorship"                  // Post-treatment surveillance
  | "recurrence"                    // Treatment at recurrence
  | "palliative"                    // Symptom management, quality of life
  | "prevention";                   // Risk reduction (including vaccines for carriers)

type EvidenceLevel =
  | "L1_META_ANALYSIS"             // Systematic reviews, meta-analyses
  | "L2_RANDOMIZED_CONTROLLED"     // Phase 3 RCTs
  | "L3_PROSPECTIVE_COHORT"        // Phase 1-2, prospective observational
  | "L4_RETROSPECTIVE"             // Retrospective analyses, case series
  | "L5_EXPERT_OPINION"            // Reviews, editorials, conference talks
  | "L6_PRECLINICAL";              // Animal/in vitro only

type PracticeImpact =
  | "practice_changing"             // Directly changes treatment decisions NOW
  | "practice_informing"            // Informs but doesn't change standard of care
  | "incremental"                   // Small advancement, builds on existing knowledge
  | "hypothesis_generating"         // Interesting but needs confirmation
  | "negative"                      // Null result, failed trial — important to know
  | "safety_alert";                 // Urgent safety information
```

### 4.2 Maturity Tier Explainers

Each maturity tier has a patient-facing explainer that's prominently displayed on every item:

```typescript
const MATURITY_EXPLAINERS: Record<MaturityTier, { badge: string; color: string; patientExplainer: string }> = {
  T1_AVAILABLE_NOW: {
    badge: "Available now",
    color: "green",
    patientExplainer: "This treatment is FDA-approved and being used by oncologists today. Ask your doctor if it's right for your situation."
  },
  T2_LATE_TRIALS: {
    badge: "Expected soon",
    color: "teal",
    patientExplainer: "This treatment showed strong results in large clinical trials and may receive FDA approval within 1-2 years. Some patients can access it through clinical trials right now."
  },
  T3_ACTIVE_TRIALS: {
    badge: "In clinical trials",
    color: "blue",
    patientExplainer: "This is being tested in patients through clinical trials. Early results are promising, but we don't yet know if it works better than current treatments. You may be able to participate in a trial."
  },
  T4_PRECLINICAL: {
    badge: "Lab research",
    color: "amber",
    patientExplainer: "This has only been tested in labs or animal models, NOT in people yet. It's an interesting scientific direction, but it could be 5-10+ years before patients might benefit — and many lab findings don't translate to human treatments."
  },
  T5_THEORETICAL: {
    badge: "Early science",
    color: "gray",
    patientExplainer: "This is very early-stage research — an idea or computer model that hasn't been tested yet. It's part of the scientific process, but it's too early to know if it will lead to a treatment."
  },
};
```

---

## 5. AI Summarization & Curation Pipeline

### 5.1 Classification Pipeline

Every normalized item runs through Claude for structured classification:

```typescript
const CLASSIFICATION_PROMPT = `
You are classifying a cancer research item for a patient-facing intelligence platform.
Your classifications MUST be accurate — patients make decisions based on this information.

RULES:
- Be CONSERVATIVE with maturity tier. If in doubt, tier DOWN. A Phase 2 trial is T3, not T2.
- T1 (Available Now) requires FDA approval OR inclusion in NCCN guidelines
- T2 requires Phase 3 positive results AND regulatory submission filed or expected within 18 months
- Mouse/cell line studies are ALWAYS T4, regardless of how dramatic the results
- Preprints are capped at L5 evidence level regardless of study design
- Flag industry sponsorship and potential conflicts of interest
- If the item reports NEGATIVE results (failed trial, no benefit), mark practice_impact as "negative"
  — these are IMPORTANT, not uninteresting
- For biomarker_relevance, list ONLY biomarkers explicitly discussed, not inferred

Research item:
Source: {source}
Title: {title}
Content: {content}
Publication type: {publicationType}
Journal: {journalName}

Return JSON matching this Classification schema. Include a classificationConfidence score.
Every field is required — use "not_specified" or empty arrays if truly not determinable.
`;
```

### 5.2 Dual Summary Generation

After classification, generate both patient and clinician summaries:

```typescript
const PATIENT_SUMMARY_PROMPT = `
You are writing a plain-language summary of a cancer research finding for a patient
or caregiver. The reader may be scared, may not have a science background, and
needs to understand what this means for them personally.

TARGET: 6th-grade reading level. 3-5 sentences. No jargon without explanation.

RULES:
- Lead with what matters: what was found, and does it help patients?
- Include the maturity tier context: {maturityExplainer}
- If T4/T5: explicitly state "This has NOT been tested in people"
- If negative result: explain why knowing something DOESN'T work is valuable
- Never use: "breakthrough", "miracle", "cure" (unless literally FDA-approved cure)
- Never create false hope — frame early results honestly
- End with an actionable step when possible ("Ask your oncologist about...")
- If this involves a drug the reader might be taking, note that

Research item:
{classifiedItem}

Write a patient_summary (plain language) and a what_this_means section
(personalization placeholder — will be customized per user profile later).
`;

const CLINICIAN_SUMMARY_PROMPT = `
You are writing a clinical summary of a research finding for an oncologist.
Be precise, include key statistics, and frame relative to current standard of care.

FORMAT:
- 1 sentence headline finding
- Key endpoints: HR, CI, p-value, ORR, PFS, OS — as reported
- Study design: N, phase, arms, randomization, primary endpoint
- Context: How does this compare to current SOC?
- Practice implication: Does this change management? For which patients?
- Limitations: Key caveats, follow-up duration, subgroup concerns
- Grade: practice_changing / practice_informing / incremental / hypothesis_generating / negative

Research item:
{classifiedItem}

Return structured JSON with: headline, key_endpoints (object), study_design, 
context, practice_implication, limitations, grade.
`;
```

### 5.3 "What This Means for You" Personalization

When a user views a research item, generate a personalized interpretation:

```typescript
const PERSONALIZATION_PROMPT = `
You are writing a 2-3 sentence personalized note explaining what a research finding
means for a SPECIFIC patient based on their profile.

Patient profile:
- Cancer type: {cancerType}
- Subtype: {subtype} (ER: {er}, PR: {pr}, HER2: {her2})
- Stage: {stage}
- Mutations: {mutations}
- Current treatment: {currentTreatment}
- Treatment phase: {treatmentPhase}

Research finding:
{patientSummary}
Classification: {classification}

Write "what_this_means_for_you" — connecting this finding to their specific situation.
If it's NOT relevant to them: say so clearly ("This research applies to HER2+ breast 
cancer. Since your cancer is HER2-negative, it doesn't directly affect your treatment, 
but it's an example of how targeted therapies are advancing.")
If it IS relevant: be specific about why and what to do.
If it involves a drug they're taking or a mutation they have: highlight that explicitly.

NEVER speculate about their prognosis. Stick to factual connections between
the research and their profile.
`;
```

### 5.4 Quality Control Pipeline

```typescript
interface QualityChecks {
  // Run after classification + summarization
  
  // 1. Retraction check
  retractionStatus: "none" | "retracted" | "expression_of_concern" | "correction";
  // Cross-reference against Retraction Watch database
  
  // 2. Contradiction check
  contradicts: string[];              // IDs of items this contradicts
  contradictedBy: string[];           // IDs of items contradicting this
  // When contradictions found, both items get flagged with context
  
  // 3. Hype detection
  hypeScore: number;                  // 0-1, how much the coverage overstates the evidence
  hypeFlags: string[];                // "Press release overstates significance", "Mouse study framed as cure"
  // High hype score triggers additional editorial context in patient summary
  
  // 4. Conflict of interest
  industrySponsored: boolean;
  sponsorName: string | null;
  authorCOI: string | null;           // Extracted from disclosures
  
  // 5. Reproducibility tracking
  hasBeenReplicated: boolean | null;
  replicationStudies: string[];       // IDs of confirming/contradicting studies
}
```

---

## 6. Dual-Audience Rendering Layer

### 6.1 Patient View

```typescript
interface PatientResearchCard {
  // Header
  maturityBadge: { label: string; color: string };
  headline: string;                     // 1-line plain-language headline
  publishedDate: string;
  source: string;                       // "Published in The New England Journal of Medicine"

  // Content
  patientSummary: string;               // 3-5 sentence plain-language summary
  whatThisMeansForYou: string | null;    // Personalized interpretation (if user has profile)
  
  // Context badges
  evidenceBadge: string;                // "Large clinical trial (Phase 3)" / "Lab study only"
  practiceBadge: string | null;         // "May change treatment recommendations" (only for practice_changing)
  previewWarning: string | null;        // "Not yet peer-reviewed" (for preprints)
  
  // Actions
  actions: {
    relatedTrials: { count: number; link: string } | null;    // "3 related trials you may qualify for"
    askYourDoctor: string | null;                               // Generated question for oncologist
    shareWithDoctor: boolean;                                   // Can share this item
    saveForLater: boolean;
  };
  
  // Related content
  relatedItems: string[];               // IDs of related research items
  communityReports: number;             // Number of community reports related to this topic
}
```

### 6.2 Clinician View

```typescript
interface ClinicianResearchCard {
  // Header
  maturityTier: MaturityTier;
  evidenceLevel: EvidenceLevel;
  practiceImpact: PracticeImpact;
  headline: string;                     // Clinical headline

  // Structured abstract
  clinicianSummary: {
    headline: string;
    keyEndpoints: Record<string, string>;  // { "mPFS": "7.2 vs 5.4 mo, HR 0.63", ... }
    studyDesign: string;
    context: string;                    // vs current SOC
    practiceImplication: string;
    limitations: string;
  };

  // Quick-reference
  trialId: string | null;              // NCT ID if applicable
  drugNames: string[];
  biomarkers: string[];
  patientPopulation: string;           // "HR+/HER2- mBC, post-CDK4/6i"

  // Source
  journal: string;
  doi: string | null;
  fullTextUrl: string | null;
  authors: string;                     // "Smith et al."

  // Actions
  actions: {
    matchToPatientPanel: boolean;       // "Find patients in your panel who may benefit"
    shareWithPatient: boolean;          // Generate patient-friendly version
    addToWatchlist: boolean;
  };
}
```

### 6.3 Routes

```
/intel                              Research feed home (personalized stream)
/intel/item/[itemId]                Individual research item (dual rendering)
/intel/digest                       Current digest view
/intel/landscape                    Visual landscape map by subtype/domain
/intel/landscape/[subtype]          Subtype-specific research landscape
/intel/community                    Community reports feed
/intel/community/submit             Submit a community report
/intel/settings                     Feed preferences, notification settings, audience toggle
```

---

## 7. Personalization Engine

### 7.1 Relevance Scoring

Every research item gets a relevance score per user profile:

```typescript
function calculateRelevanceScore(
  item: ClassifiedResearchItem,
  profile: PatientProfile
): number {
  let score = 0;
  const weights = {
    cancerTypeMatch: 30,              // Same cancer type
    subtypeMatch: 25,                 // Same subtype (ER+/HER2-, TNBC, etc.)
    biomarkerMatch: 20,               // Involves a mutation/biomarker the patient has
    treatmentStageMatch: 15,          // Same treatment phase the patient is in
    currentDrugMatch: 10,             // Involves a drug the patient is currently taking
    maturityBoost: 0,                 // T1/T2 get boosted, T4/T5 get no penalty but no boost
  };

  // Cancer type match
  if (item.classification.cancerTypes.includes(profile.cancerTypeNormalized)) {
    score += weights.cancerTypeMatch;
  } else if (item.classification.cancerTypes.includes("pan_cancer")) {
    score += weights.cancerTypeMatch * 0.5;
  }

  // Subtype match
  if (item.classification.breastSubtypes.includes(profileToSubtype(profile))) {
    score += weights.subtypeMatch;
  } else if (item.classification.breastSubtypes.includes("all_subtypes")) {
    score += weights.subtypeMatch * 0.5;
  }

  // Biomarker match
  const patientBiomarkers = extractBiomarkers(profile);
  const overlap = item.classification.biomarkerRelevance
    .filter(b => patientBiomarkers.includes(b));
  if (overlap.length > 0) {
    score += weights.biomarkerMatch * Math.min(1, overlap.length / 2);
  }

  // Treatment stage match
  const patientStage = getCurrentTreatmentStage(profile);
  if (item.classification.treatmentStages.includes(patientStage)) {
    score += weights.treatmentStageMatch;
  }

  // Current drug match (HIGHEST urgency for safety alerts)
  const patientDrugs = getCurrentDrugs(profile);
  const drugOverlap = item.relatedDrugs.filter(d => patientDrugs.includes(d));
  if (drugOverlap.length > 0) {
    score += weights.currentDrugMatch;
    // If this is a safety alert for a drug they're ON, override to max urgency
    if (item.classification.practiceImpact === "safety_alert") {
      score = 100; // Force to top of feed
    }
  }

  // Maturity boost (prefer actionable items)
  if (item.classification.maturityTier === "T1_AVAILABLE_NOW") score += 10;
  if (item.classification.maturityTier === "T2_LATE_TRIALS") score += 5;

  // Negative results for their treatment = important
  if (item.classification.practiceImpact === "negative" && drugOverlap.length > 0) {
    score += 15; // Boost — they need to know
  }

  return Math.min(100, score);
}
```

### 7.2 Feed Building

```typescript
interface FeedConfig {
  userId: string;
  audienceType: "patient" | "clinician";
  
  // Content preferences
  contentDepth: "simplified" | "standard" | "detailed";
  showPreclinical: boolean;            // Whether to show T4/T5 items
  showNegativeResults: boolean;        // Default: true (important info)
  
  // Pagination
  pageSize: number;                    // Default: 20
  cursor: string | null;
  
  // Filters (optional, for browse/search)
  filters?: {
    maturityTiers?: MaturityTier[];
    domains?: ResearchDomain[];
    treatmentClasses?: TreatmentClass[];
    dateRange?: { from: string; to: string };
  };
}

async function buildFeed(config: FeedConfig): Promise<{
  items: (PatientResearchCard | ClinicianResearchCard)[];
  nextCursor: string | null;
  totalRelevant: number;
  lastUpdated: string;
}> {
  // 1. Get user profile
  // 2. Query research_items with base filters
  // 3. Calculate relevance score for each item
  // 4. Sort by: relevance score (primary), publishedAt (secondary)
  // 5. Apply audience-specific rendering
  // 6. Generate "what this means for you" for top items (lazy — on view, not on load)
  // 7. Return paginated results
}
```

---

## 8. Community Intelligence Layer

### 8.1 Community Reports

```typescript
interface CommunityReport {
  id: string;
  userId: string;
  reportType: CommunityReportType;
  createdAt: string;
  
  // Consent
  consentScope: "platform_only" | "research_anonymized" | "public";
  
  // Content varies by type
  content: TreatmentExperienceReport | TrialParticipationReport | SideEffectReport | QualityOfLifeReport | ResourceReport;
  
  // Verification
  verified: boolean;                    // Cross-referenced against profile data
  moderationStatus: "pending" | "approved" | "flagged" | "removed";
}

type CommunityReportType =
  | "treatment_experience"              // What it was like to be on a specific drug
  | "trial_participation"               // Experience participating in a clinical trial
  | "side_effect"                       // Specific side effect report
  | "quality_of_life"                   // General QoL during/after treatment
  | "resource"                          // Helpful resource recommendation
  | "question";                         // Question they wish they'd asked their oncologist

interface TreatmentExperienceReport {
  drugName: string;
  drugGenericName: string;
  duration: string;                     // "6 months", "ongoing"
  sideEffects: {
    effect: string;
    severity: 1 | 2 | 3 | 4 | 5;
    onset: string;                      // "Week 1", "Month 3"
    resolved: boolean;
    management: string;                 // What helped
  }[];
  effectiveness: string | null;         // Patient's perception
  overallExperience: 1 | 2 | 3 | 4 | 5;
  wouldRecommend: boolean | null;
  narrative: string;                    // Free-text experience
  tipsForOthers: string[];
}

interface TrialParticipationReport {
  trialNctId: string | null;
  trialName: string;
  participationDuration: string;
  experienceRating: 1 | 2 | 3 | 4 | 5;
  pros: string[];
  cons: string[];
  logisticsNotes: string;              // Travel, time commitment, etc.
  wouldParticipateAgain: boolean;
  narrative: string;
  adviceForOthers: string;
}
```

### 8.2 Community Data Aggregation

Aggregate community reports into useful insights:

```typescript
interface CommunityInsight {
  drugName: string;
  totalReports: number;
  averageRating: number;
  commonSideEffects: {
    effect: string;
    reportedByPercent: number;
    averageSeverity: number;
    averageOnset: string;
    resolvedPercent: number;
    topManagementTips: string[];
  }[];
  trialParticipationSummary: {
    averageRating: number;
    totalReports: number;
    commonPros: string[];
    commonCons: string[];
  } | null;
}

// CRITICAL: Community data is NOT medical evidence.
// Always label it: "Based on reports from X patients on this platform"
// Never present aggregate community data as clinical evidence
// Never use community reports to recommend or discourage treatments
```

---

## 9. Notification & Delivery System

### 9.1 Notification Routing

```typescript
interface NotificationConfig {
  userId: string;
  
  // Delivery preferences
  inAppFeed: boolean;                   // Always true
  emailDigest: "daily" | "weekly" | "monthly" | "practice_changing_only" | "off";
  pushNotifications: {
    safetyAlerts: boolean;              // FDA safety for drugs you're on (default: true)
    practiceChanging: boolean;          // Major new approvals/results (default: true)
    trialMatches: boolean;              // New trial matches from research (default: true)
    communityActivity: boolean;         // Responses to your reports (default: false)
  };
  
  // Quiet hours
  quietHoursStart: string | null;       // "22:00"
  quietHoursEnd: string | null;         // "08:00"
  timezone: string;
}
```

### 9.2 Email Digest Builder

```typescript
interface EmailDigest {
  userId: string;
  period: "daily" | "weekly" | "monthly";
  generatedAt: string;
  
  sections: {
    // Section 1: Urgent (if any)
    urgent: DigestItem[];               // Safety alerts, practice-changing for their drugs
    
    // Section 2: Most relevant to you
    personallyRelevant: DigestItem[];   // Top 3-5 by relevance score
    
    // Section 3: Landscape highlights
    landscapeHighlights: DigestItem[];  // Top items across all breast cancer
    
    // Section 4: Community
    communityHighlights: DigestItem[];  // New reports for drugs/trials they care about
    
    // Section 5: Trial updates
    trialUpdates: DigestItem[];         // Status changes for matched trials
  };
  
  // Footer
  totalNewItems: number;
  viewFullFeedUrl: string;
  updatePreferencesUrl: string;
}

interface DigestItem {
  itemId: string;
  headline: string;
  summary: string;                      // 1-2 sentences
  maturityBadge: string;
  relevanceReason: string;              // "Relevant to your ER+ breast cancer"
  viewUrl: string;
}
```

---

## 10. Integration Points with Existing Phases

### 10.1 MATCH (Phase 1) ← → INTEL

**INTEL feeds MATCH:**
- New trial registrations detected in INTEL → auto-sync to trial database → re-run matching for affected patient profiles
- Trial results posted → update trial status and inform matched patients

**MATCH feeds INTEL:**
- When a patient matches a trial, related research items for that trial get boosted in their feed
- Trial enrollment data enriches community intelligence

### 10.2 SEQUENCE (Phase 2) ← → INTEL

**INTEL feeds SEQUENCE:**
- New biomarker-drug associations discovered → update sequencing recommendations ("New evidence suggests testing for [mutation] — relevant to your subtype")
- New FDA companion diagnostic approvals → update insurance coverage justification

**SEQUENCE feeds INTEL:**
- Patient's genomic data enables more precise personalization of research feed
- New mutations found → automatically boost research involving those mutations

### 10.3 PREDICT (Phase 3) ← → INTEL

**INTEL feeds PREDICT:**
- New neoantigen prediction methods → update pipeline algorithms
- New vaccine platform data → inform mRNA design parameters
- Published immunogenicity validation data → improve ranking model weights

**PREDICT feeds INTEL:**
- Platform-generated vaccine blueprints (anonymized, with consent) contribute to the knowledge base
- Pipeline results validate or contradict published prediction methods

### 10.4 MANUFACTURE (Phase 4) ← → INTEL

**INTEL feeds MANUFACTURE:**
- New CDMO partnerships, manufacturing methods, regulatory pathways → update manufacturer directory
- New modular manufacturing technology (BioNTainer updates, Quantoom advances) → inform cost/timeline estimates

### 10.5 SURVIVE (Phase 5) ← → INTEL

**INTEL feeds SURVIVE:**
- New late-effects data → update survivorship care plan recommendations
- New ctDNA monitoring evidence → update surveillance recommendations
- New lifestyle intervention evidence → update lifestyle engine
- New recurrence risk factors → update risk assessment

**SURVIVE feeds INTEL:**
- Journal data (aggregated, anonymized) → community intelligence on treatment tolerability
- Recurrence events → validate/contradict published recurrence risk models

### 10.6 Treatment Translator ← → INTEL

**INTEL feeds Translator:**
- When new drugs are approved or guidelines change, the Treatment Translator's clinical grounding prompt is updated automatically
- Second opinion trigger logic updates when new standard-of-care data emerges
- Drug interaction warnings update in real-time from FDA safety communications

### 10.7 Financial Assistance Finder ← → INTEL

**INTEL feeds Financial:**
- New pharma PAP announcements → update financial assistance database
- New copay foundation fund openings → trigger notifications for waiting patients
- Drug pricing changes → update cost estimates

---

## 11. Data Model

```sql
-- Core research items
CREATE TABLE research_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source tracking
  source_type TEXT NOT NULL,             -- journal, trial_registry, fda, conference, preprint, press_release, community
  source_item_id TEXT,                   -- PMID, NCT ID, FDA number, etc.
  source_url TEXT NOT NULL,
  source_credibility TEXT NOT NULL,      -- tier1_journal, peer_reviewed, preprint, institutional, media, community
  
  -- Content
  title TEXT NOT NULL,
  raw_content TEXT NOT NULL,
  authors TEXT[],
  institutions TEXT[],
  journal_name TEXT,
  doi TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Classification (structured)
  cancer_types TEXT[] NOT NULL,
  breast_subtypes TEXT[],
  maturity_tier TEXT NOT NULL,           -- T1..T5
  domains TEXT[] NOT NULL,
  treatment_classes TEXT[],
  biomarker_relevance TEXT[],
  treatment_stages TEXT[],
  evidence_level TEXT NOT NULL,          -- L1..L6
  practice_impact TEXT NOT NULL,         -- practice_changing, incremental, etc.
  classification_confidence FLOAT,
  
  -- Generated summaries
  patient_summary TEXT,
  clinician_summary JSONB,              -- Structured: headline, endpoints, design, implications
  
  -- Key data points (for search and comparison)
  key_endpoints JSONB,                  -- HRs, CIs, ORRs, PFS, OS values
  drug_names TEXT[],
  trial_nct_ids TEXT[],
  
  -- Quality control
  retraction_status TEXT DEFAULT 'none', -- none, retracted, expression_of_concern, correction
  industry_sponsored BOOLEAN,
  sponsor_name TEXT,
  hype_score FLOAT,                     -- 0-1
  hype_flags TEXT[],
  
  -- Relationships
  related_item_ids UUID[],             -- Cross-references
  supersedes UUID[],                    -- Items this updates/replaces
  contradicted_by UUID[],
  
  -- Dedup
  content_hash TEXT NOT NULL,           -- For dedup
  merged_source_ids TEXT[],             -- If this item was merged from multiple sources
  
  -- Processing state
  classification_status TEXT DEFAULT 'pending',    -- pending, classified, summarized, complete
  last_processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User feed configuration
CREATE TABLE user_feed_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES patients(id) UNIQUE,
  audience_type TEXT NOT NULL DEFAULT 'patient',  -- patient, clinician, researcher, advocate
  content_depth TEXT DEFAULT 'standard',          -- simplified, standard, detailed
  show_preclinical BOOLEAN DEFAULT TRUE,
  show_negative_results BOOLEAN DEFAULT TRUE,
  
  -- Notification preferences
  email_digest_frequency TEXT DEFAULT 'weekly',   -- daily, weekly, monthly, practice_changing_only, off
  push_safety_alerts BOOLEAN DEFAULT TRUE,
  push_practice_changing BOOLEAN DEFAULT TRUE,
  push_trial_matches BOOLEAN DEFAULT TRUE,
  push_community BOOLEAN DEFAULT FALSE,
  
  quiet_hours_start TEXT,
  quiet_hours_end TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personalized relevance scores (cached per user per item)
CREATE TABLE feed_relevance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES patients(id),
  item_id UUID REFERENCES research_items(id),
  relevance_score FLOAT NOT NULL,
  relevance_reasons TEXT[],             -- Why this is relevant to this user
  personalized_note TEXT,               -- "What this means for you" (generated lazily)
  
  -- Interaction tracking
  viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ,
  saved BOOLEAN DEFAULT FALSE,
  shared BOOLEAN DEFAULT FALSE,
  dismissed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Community reports
CREATE TABLE community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES patients(id),
  report_type TEXT NOT NULL,            -- treatment_experience, trial_participation, side_effect, etc.
  
  -- Consent
  consent_scope TEXT NOT NULL,          -- platform_only, research_anonymized, public
  
  -- Content
  structured_data JSONB NOT NULL,       -- Type-specific structured report
  narrative TEXT,
  
  -- Moderation
  moderation_status TEXT DEFAULT 'pending',  -- pending, approved, flagged, removed
  verified BOOLEAN DEFAULT FALSE,       -- Cross-checked against profile data
  
  -- Relationships
  related_drug TEXT,                    -- Drug name (for aggregation)
  related_trial_nct_id TEXT,            -- Trial NCT ID (for aggregation)
  related_research_item_id UUID REFERENCES research_items(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email digests (track what was sent)
CREATE TABLE email_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES patients(id),
  period TEXT NOT NULL,                 -- daily, weekly, monthly
  digest_content JSONB NOT NULL,        -- EmailDigest structure
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_items UUID[],                 -- Which items were clicked
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingestion sync state (per source)
CREATE TABLE ingestion_sync_state (
  source_id TEXT PRIMARY KEY,
  last_sync_at TIMESTAMPTZ NOT NULL,
  last_item_date TIMESTAMPTZ,          -- Most recent item date from this source
  items_ingested_total INTEGER DEFAULT 0,
  items_ingested_last_run INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_research_items_cancer ON research_items USING GIN(cancer_types);
CREATE INDEX idx_research_items_subtypes ON research_items USING GIN(breast_subtypes);
CREATE INDEX idx_research_items_maturity ON research_items(maturity_tier);
CREATE INDEX idx_research_items_published ON research_items(published_at DESC);
CREATE INDEX idx_research_items_impact ON research_items(practice_impact);
CREATE INDEX idx_research_items_drugs ON research_items USING GIN(drug_names);
CREATE INDEX idx_research_items_biomarkers ON research_items USING GIN(biomarker_relevance);
CREATE INDEX idx_research_items_hash ON research_items(content_hash);
CREATE INDEX idx_research_items_status ON research_items(classification_status);
CREATE INDEX idx_feed_relevance_user ON feed_relevance(user_id, relevance_score DESC);
CREATE INDEX idx_feed_relevance_item ON feed_relevance(item_id);
CREATE INDEX idx_community_reports_drug ON community_reports(related_drug);
CREATE INDEX idx_community_reports_user ON community_reports(user_id, created_at DESC);
```

---

## 12. API & tRPC Router Definitions

```typescript
// packages/api/src/routers/intel.ts

const intelRouter = router({
  // Feed
  getFeed: protectedProcedure
    .input(z.object({
      pageSize: z.number().default(20),
      cursor: z.string().optional(),
      filters: z.object({
        maturityTiers: z.array(z.string()).optional(),
        domains: z.array(z.string()).optional(),
        treatmentClasses: z.array(z.string()).optional(),
        dateRange: z.object({ from: z.string(), to: z.string() }).optional(),
      }).optional(),
    }))
    .query(async ({ ctx, input }) => { /* build personalized feed */ }),

  // Individual item
  getItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => { /* return item with audience-appropriate rendering */ }),

  // Personalization
  getPersonalizedNote: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => { /* generate "what this means for you" */ }),

  // Interaction tracking
  markViewed: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => { /* track view */ }),

  markSaved: protectedProcedure
    .input(z.object({ itemId: z.string(), saved: z.boolean() }))
    .mutation(async ({ ctx, input }) => { /* toggle save */ }),

  markDismissed: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => { /* dismiss from feed */ }),

  shareWithDoctor: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => { /* generate shareable summary */ }),

  // Digests
  getDigest: protectedProcedure
    .input(z.object({ period: z.enum(["daily", "weekly", "monthly"]) }))
    .query(async ({ ctx, input }) => { /* return current digest */ }),

  // Landscape
  getLandscape: protectedProcedure
    .input(z.object({
      cancerType: z.string().default("breast"),
      subtype: z.string().optional(),
      domain: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => { /* return landscape summary */ }),

  // Community
  submitReport: protectedProcedure
    .input(z.object({
      reportType: z.string(),
      structuredData: z.any(),
      narrative: z.string().optional(),
      consentScope: z.enum(["platform_only", "research_anonymized", "public"]),
    }))
    .mutation(async ({ ctx, input }) => { /* create community report */ }),

  getCommunityInsights: protectedProcedure
    .input(z.object({
      drugName: z.string().optional(),
      trialNctId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => { /* return aggregated community data */ }),

  // Settings
  getFeedConfig: protectedProcedure
    .query(async ({ ctx }) => { /* return user's feed config */ }),

  updateFeedConfig: protectedProcedure
    .input(z.object({
      contentDepth: z.enum(["simplified", "standard", "detailed"]).optional(),
      showPreclinical: z.boolean().optional(),
      emailDigestFrequency: z.string().optional(),
      pushSafetyAlerts: z.boolean().optional(),
      pushPracticeChanging: z.boolean().optional(),
      pushTrialMatches: z.boolean().optional(),
      pushCommunity: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => { /* update feed config */ }),

  // Search
  search: protectedProcedure
    .input(z.object({
      query: z.string(),
      filters: z.any().optional(),
    }))
    .query(async ({ ctx, input }) => { /* full-text search across research items */ }),

  // Admin (for content management)
  triggerIngestion: adminProcedure
    .input(z.object({ sourceId: z.string() }))
    .mutation(async ({ ctx, input }) => { /* manually trigger source sync */ }),

  reclassifyItem: adminProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => { /* re-run classification pipeline */ }),
});
```

---

## 13. Build Sequence

### 13.1 Prerequisites

- Phase 1 stable with real users and patient profiles
- NATS JetStream operational (reuse from AEGIS / Phase 3 if built)
- Claude API integration mature (already used across platform)
- NCBI API key obtained (free, register at NCBI)

### 13.2 Claude Code Sessions

```
SESSION I1: Foundation + PubMed ingestion
  1. Prisma schema additions (research_items, user_feed_configs, feed_relevance, community_reports, ingestion_sync_state)
  2. NATS JetStream stream definitions for INTEL
  3. Normalized item interface + dedup engine
  4. PubMed E-utilities ingestion worker
     - Search with breast cancer MeSH terms
     - Fetch new articles since last sync
     - Normalize into ResearchItem
     - Journal credibility mapping (seed top 30 oncology journals)
  5. Initial sync: ingest last 90 days of breast cancer PubMed articles
  6. Admin page to view ingested items and sync state
  7. Route stubs for all /intel pages

SESSION I2: Classification + summarization pipeline
  1. Claude classification pipeline
     - Taxonomy classification prompt engineering
     - Maturity tier assignment (conservative — test against known items)
     - Evidence level classification
     - Practice impact assessment
     - Biomarker relevance extraction
  2. Claude patient summary generation
     - 6th-grade reading level, 3-5 sentences
     - Maturity tier explainer inclusion
     - Hype calibration (never say "breakthrough")
  3. Claude clinician summary generation
     - Structured abstract with endpoints, design, implications
     - Practice-changing vs. incremental classification
  4. Quality control pipeline
     - Conflict of interest extraction
     - Hype score calculation
     - Preprint warning injection
  5. Test classification against the seed content from this spec
     - Verify maturity tier assignment for known items (Enhertu = T1, molecular jackhammers = T4)
     - Iterate prompts until classification is reliable

SESSION I3: Additional sources + FDA alerts
  1. FDA openFDA ingestion worker
     - Drug approvals (new + supplemental)
     - Safety communications
     - URGENT alert routing for safety events affecting user drugs
  2. ClinicalTrials.gov integration (extend Phase 1 worker)
     - New registrations → INTEL stream items
     - Results postings → INTEL stream items
  3. bioRxiv/medRxiv ingestion worker
     - Preprint-specific handling (always flag as not peer-reviewed)
     - Track publication status (preprint → published paper matching)
  4. Conference abstract ingestion
     - ASCO / SABCS / ESMO RSS + structured scraping
     - Conference-season frequency ramping
  5. Institutional newsroom ingestion
     - Cancer center RSS feeds
     - Relevance filtering
  6. NIH Reporter ingestion
     - New funded grants in breast cancer
     - Leading indicator tagging

SESSION I4: Personalization engine + feed UI
  1. Relevance scoring engine
     - Profile-to-item matching across all taxonomy dimensions
     - Safety alert override (max urgency for drugs patient is taking)
     - Negative result boosting for relevant treatments
  2. Feed builder
     - Ranked feed generation with pagination
     - Maturity tier filter UI
     - Domain filter UI
     - Search integration
  3. Patient research feed UI (/intel)
     - Research cards with maturity badges
     - "What this means for you" personalized notes (lazy-generated on view)
     - Save / share / dismiss actions
     - Maturity tier explainer tooltips
  4. Individual item detail page (/intel/item/[id])
     - Full patient summary OR clinician summary (audience toggle)
     - Related trials (link to trial matcher)
     - Related community reports
     - Source attribution + credibility indicator
  5. Clinician view toggle
     - Switch between patient and clinician rendering
     - Clinician-specific structured abstract

SESSION I5: Community intelligence + digests
  1. Community report submission UI (/intel/community/submit)
     - Treatment experience form (structured + narrative)
     - Trial participation form
     - Side effect report form
     - Consent scope selector with clear explanation
  2. Community report moderation pipeline
     - Auto-verification against profile data
     - Basic content moderation (flag inappropriate content)
  3. Community insights aggregation
     - Per-drug side effect aggregation
     - Per-trial experience aggregation
     - Display on research item pages and drug profiles
  4. Email digest builder
     - Template for daily / weekly / monthly digests
     - Section composition (urgent, personal, landscape, community, trials)
     - Send pipeline (Resend/Postmark integration)
  5. Push notification routing
     - Safety alert pipeline (urgent)
     - Practice-changing notification
     - New trial match from research

SESSION I6: Landscape views + integration
  1. Research landscape visualization (/intel/landscape)
     - Visual map of active research by subtype and domain
     - Maturity tier distribution (how much is T1 vs T3 vs T4)
     - Timeline view (what's expected when)
     - Treatment pipeline view (drugs in development, by phase)
  2. Subtype-specific landscape pages (/intel/landscape/[subtype])
     - Deep dive into research for ER+, TNBC, HER2+, etc.
     - Current standard of care summary
     - What's changing (T1/T2 items)
     - What's coming (T3 items)
     - What's being explored (T4/T5 items)
  3. Integration with Treatment Translator
     - When new T1/T2 items are relevant to a patient, flag in Translator
     - "Since your Treatment Guide was generated, there's been a new development..."
  4. Integration with Financial Assistance Finder
     - New drug approvals → check for new PAP programs
     - New copay foundation openings → trigger from INTEL
  5. Integration with Survivorship module
     - New late-effects evidence → flag for care plan refresh
     - New ctDNA monitoring evidence → update surveillance recommendations
  6. Seed stream with structured landscape content from this spec
     - Input the Tier 1-5 research landscape data as initial items
     - Classify and summarize each
     - Verify feed rendering
```

### 13.3 Timeline Estimate

```
Session I1:  Week 1-2   (foundation + PubMed — items flowing into DB)
Session I2:  Week 2-4   (classification + summaries — items become readable)
Session I3:  Week 4-6   (additional sources + FDA alerts — comprehensive coverage)
Session I4:  Week 6-8   (personalization + feed UI — users can consume)
Session I5:  Week 8-10  (community + digests — engagement flywheel)
Session I6:  Week 10-12 (landscape + integrations — full value realized)

Total: ~12 weeks
MVP (I1-I2): 4 weeks — basic feed of classified PubMed articles with summaries
Usable (I1-I4): 8 weeks — personalized feed with multiple sources
Complete (I1-I6): 12 weeks — full module with community and integrations
```

---

## 14. Open Questions & Risk Register

### 14.1 Content Liability

**Risk:** If the platform surfaces research that influences a patient's treatment decision (e.g., they ask for a drug based on a research item and have a bad outcome), is there liability exposure?

**Mitigation:**
- Every item includes disclaimer: "This is research information, not medical advice"
- Maturity tier system explicitly labels what's available vs. experimental
- "Ask your oncologist" framing — never "you should take this drug"
- No algorithmic treatment recommendations — only information and questions
- Legal review needed before launch (same timeline as Phase 3 FDA classification question)

### 14.2 Community Data Ethics

**Risk:** Patient-contributed data (treatment experiences, side effects) needs ethical handling beyond standard privacy.

**Mitigation:**
- Explicit consent scope at time of contribution (platform_only / research_anonymized / public)
- IRB consultation before enabling "research_anonymized" scope
- Right to withdraw contributions at any time
- Never identify individual patients in aggregated insights
- Community reports are subjective experiences, not medical evidence — always label accordingly

### 14.3 Information Overload

**Risk:** Too much content overwhelms patients who are already stressed.

**Mitigation:**
- Strong personalization — most items never surface to a given user
- Configurable feed density (simplified/standard/detailed)
- Default email digest is weekly, not daily
- Maturity tier filtering — patients can hide T4/T5 items
- "Most relevant to you" section always at top
- Dismiss/save functionality to train relevance

### 14.4 Classification Accuracy

**Risk:** Misclassifying maturity tier (tagging a mouse study as T2) creates false hope or misplaced urgency.

**Mitigation:**
- Conservative classification prompts (when in doubt, tier DOWN)
- Human review queue for items classified as T1 or practice_changing
- Confidence scoring — low-confidence items get held for review
- Feedback loop: users can report misclassification
- Regular audit of classification accuracy against gold-standard labels

### 14.5 Source Freshness vs. Quality Tradeoff

**Risk:** Faster ingestion means more preprints and press releases before peer review.

**Mitigation:**
- Preprints ALWAYS tagged prominently as non-peer-reviewed
- Source credibility scoring is mandatory and visible
- When a preprint is later published, the item updates automatically
- When a preprint is retracted or contradicted, the item is flagged
- Default feed ranking penalizes lower-credibility sources (they appear but lower)

### 14.6 API Rate Limits and Costs

**Risk:** PubMed, FDA, and other APIs have rate limits. Claude API calls for classification/summarization add cost per item.

**Mitigation:**
- PubMed: NCBI API key increases rate limit to 10 req/sec (sufficient for batch sync)
- FDA: openFDA API key allows 240 req/min
- Claude costs: estimate ~$0.02-0.05 per item (classification + two summaries). At 100 items/day = ~$5/day = ~$150/month. Manageable.
- Cache aggressively — classification and summaries only need to run once per item
- "What this means for you" personalization is the expensive call — generate lazily (on view, not on ingest) and cache per user-item pair

---

## Appendix A: Seed Content Classification Validation

Use the research landscape data from the prompt to validate the classification pipeline. Each item below should be classified correctly by the system:

| Item | Expected Tier | Expected Impact | Expected Evidence |
|------|--------------|-----------------|-------------------|
| Enhertu + pertuzumab FDA approval (DESTINY-Breast09) | T1 | practice_changing | L2 |
| Dato-DXd (Datroway) FDA approval | T1 | practice_changing | L2 |
| Vepdegestrant Phase 3 results (NEJM) | T2 | practice_changing | L2 |
| GP2 vaccine Phase 3 enrolling (FLAMINGO-01) | T3 | hypothesis_generating | L3 |
| Cleveland Clinic alpha-lactalbumin vaccine Phase 1 | T3 | hypothesis_generating | L3 |
| Molecular jackhammers (Rice/Texas A&M) | T4 | hypothesis_generating | L6 |
| Cyanine-carborane PDT (mouse model) | T4 | hypothesis_generating | L6 |
| TriOx multi-cancer detection (Oxford) | T5 | hypothesis_generating | L4 |
| AI mammography Germany study (Nature Medicine) | T1 | practice_informing | L2 |
| DARE trial ctDNA results (ASCO 2025) | T3 | practice_informing | L3 |
| NSABP B-51 radiation de-escalation | T1 | practice_changing | L2 |
| Inavolisib OS benefit (ASCO 2025) | T1 | practice_changing | L2 |

If the classification pipeline doesn't match these expected values, iterate on the prompts until it does.
