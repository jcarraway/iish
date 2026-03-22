# Knowledge Base & Educational Content Library — Technical Specification v1.0

## Top-of-Funnel Acquisition + Deep Educational Layer (LEARN)

**Author:** Rett (Happy Medium)
**Date:** March 2026
**Depends on:** None (can launch before any other module — this IS the front door)
**Integrates with:** INTEL (cross-linking), Treatment Translator (inline references), Sequencing Navigator (concept explainers), all patient-facing modules
**Purpose:** A dual-layer educational content library that serves as both the primary organic acquisition channel (SEO) and the in-platform reference system. Static, crawlable articles for search engines + personalized deep-dives for logged-in users. Claude-generated corpus with lightweight medical review.

---

## Table of Contents

1. [Strategic Context](#1-strategic-context)
2. [Content Architecture](#2-content-architecture)
3. [Content Taxonomy](#3-content-taxonomy)
4. [Dual-Layer Rendering](#4-dual-layer-rendering)
5. [Content Generation Pipeline](#5-content-generation-pipeline)
6. [SEO Architecture](#6-seo-architecture)
7. [Personalization Layer](#7-personalization-layer)
8. [INTEL Cross-Linking](#8-intel-cross-linking)
9. [Internal Reference System](#9-internal-reference-system)
10. [Medical Review Process](#10-medical-review-process)
11. [Content Corpus Plan](#11-content-corpus-plan)
12. [Data Model](#12-data-model)
13. [API & tRPC Router Definitions](#13-api--trpc-router-definitions)
14. [Build Sequence](#14-build-sequence)

---

## 1. Strategic Context

### 1.1 The Acquisition Problem

The platform has no top-of-funnel. Every module built so far assumes the patient has already found the platform and created a profile. But how do they find it?

Right now: word of mouth, direct referral, maybe social media. That's a slow-growth channel for a product that needs to reach patients during a narrow decision window. A woman diagnosed with breast cancer has ~2-4 weeks before treatment starts. If she doesn't find the platform in that window, the highest-value features (cold capping timing, fertility preservation, pre-treatment care kit) lose their impact.

The acquisition channel that matches the decision window is search. A newly diagnosed patient Googles obsessively in the first 48-72 hours. She searches for her specific diagnosis, her specific treatment, her specific biomarkers. If the platform owns those searches, it captures her at the exact moment she needs it most.

### 1.2 The Content Gap

The current landscape:

**Tier 1 — Institutional (ACS, NCI, Mayo Clinic):**
- Broad, general, sanitized
- Answers "what is breast cancer" but not "what does my specific pathology report mean"
- Rarely updated to reflect recent approvals or trial results
- Zero personalization
- Excellent SEO authority — hard to outrank on head terms

**Tier 2 — Pharma-sponsored (BreastCancer.org, patient advocacy sites):**
- Better depth on specific topics
- Potential conflicts of interest (funded by drug manufacturers)
- Good SEO on mid-tail queries
- Some personalization (subtype selectors)

**Tier 3 — User-generated (Reddit, patient forums, Facebook groups):**
- Deeply personal, authentic experiences
- Unreliable medical information
- Unmoderated, variable quality
- Zero SEO structure

**Tier 4 — Medical literature (PubMed, UpToDate):**
- Highly accurate, comprehensive
- Impenetrable to patients
- Behind paywalls (UpToDate)
- Not written for decision-making, written for clinicians

**The gap:** Nothing exists in the space between Tier 2 and Tier 4 — content that is medically rigorous AND patient-accessible AND specific to clinical decision points AND current with 2026 treatment landscape AND connected to actionable next steps. That's the gap. The platform fills it with content that says: "You have ER+/HER2- breast cancer with a PIK3CA mutation. Here's what that means, here's how it affects your treatment options, here's what inavolisib is and why your oncologist might or might not recommend it, here's the data, and here's what to ask at your next appointment."

### 1.3 The SEO Strategy

Don't compete on head terms. Compete on long-tail clinical decision queries:

**Head terms (don't compete — ACS/NCI own these):**
- "breast cancer" — 1.2M monthly searches
- "breast cancer symptoms" — 450K
- "breast cancer treatment" — 200K

**Long-tail clinical decision queries (wide open):**
- "what does HER2-low mean" — 5K/mo, growing fast (new classification)
- "AC-T chemotherapy side effects week by week" — 3K/mo
- "Oncotype DX score 18 what does it mean" — 2K/mo
- "should I get tumor genomic testing" — 1.5K/mo
- "cold capping during chemo does it work" — 4K/mo
- "PIK3CA mutation breast cancer treatment options" — 1K/mo
- "tumor mutational burden what is it" — 2K/mo
- "ctDNA monitoring after breast cancer" — 800/mo
- "difference between lumpectomy and mastectomy outcomes" — 3K/mo
- "what is neoadjuvant chemotherapy" — 2.5K/mo
- "Enhertu vs Kadcyla" — 1.5K/mo
- "how to read a pathology report breast cancer" — 2K/mo
- "what questions to ask oncologist first appointment" — 4K/mo
- "breast cancer clinical trials near me" — 3K/mo
- "endocrine therapy side effects management" — 2K/mo

Each of these queries represents a person at a decision point. The article that answers their question converts them to a platform user. Collectively, these long-tail queries represent 50K-100K monthly searches — and the current content serving them is mediocre.

### 1.4 The Internal Reference System

Beyond SEO, the content library solves an internal problem: every module in the platform references concepts the patient may not understand.

- Treatment Translator says "Your tumor is HER2-low" → patient needs to know what that means
- Sequencing Navigator recommends FoundationOne CDx → patient needs to know what genomic sequencing is
- INTEL surfaces a paper about ctDNA → patient needs to know what ctDNA monitoring is
- Care Packages include a cold capping guide → patient needs foundational knowledge
- Financial Finder mentions a PAP program for pembrolizumab → patient needs to know what pembrolizumab is

Right now, each module either explains inline (bloating the UI) or links to external sites (losing the user). The knowledge base means every module can link to `[learn more →]` and the destination is an excellent, platform-owned article.

---

## 2. Content Architecture

### 2.1 Article Types

```typescript
type ArticleType =
  | "explainer"          // "What is HER2-low breast cancer?" — foundational concept
  | "guide"              // "How to read your pathology report" — step-by-step practical
  | "decision"           // "Should I get genomic testing?" — decision support (not advice)
  | "comparison"         // "AC-T vs TC chemotherapy" — side-by-side comparison
  | "treatment_profile"  // "Enhertu (trastuzumab deruxtecan)" — drug/treatment deep dive
  | "biomarker_profile"  // "PIK3CA mutations in breast cancer" — biomarker deep dive
  | "procedure_guide"    // "What to expect during your first infusion" — procedure walkthrough
  | "test_profile"       // "FoundationOne CDx" — diagnostic test deep dive
  | "questions"          // "Questions to ask your oncologist about..." — question lists
  | "glossary"           // "Cancer treatment glossary" — term definitions (internal linking hub)
  | "landscape"          // "Breast cancer treatment landscape 2026" — current state overview
  | "myth_fact"          // "Common misconceptions about..." — myth-busting
```

### 2.2 Article Structure

Every article follows a consistent structure:

```typescript
interface Article {
  // Identity
  id: string;
  slug: string;                          // URL-safe: "what-is-her2-low-breast-cancer"
  type: ArticleType;
  
  // Content (dual-layer)
  title: string;                         // SEO-optimized: "What is HER2-low breast cancer?"
  metaTitle: string;                     // Browser tab / search result title (60 chars max)
  metaDescription: string;               // Search result snippet (155 chars max)
  
  // Patient layer (always visible)
  patientSummary: string;                // 2-3 sentence plain-language summary (featured snippet target)
  patientContent: ArticleSection[];      // Full patient-accessible content
  keyTakeaways: string[];                // 3-5 bullet takeaways (above the fold)
  actionItems: ActionItem[];             // "Ask your oncologist about...", "Check if you qualify for..."
  
  // Clinical layer (expandable)
  clinicalContent: ArticleSection[];     // Detailed clinical information
  keyStatistics: KeyStatistic[];         // HRs, ORRs, survival data
  references: Reference[];              // Citations (PubMed IDs, trial IDs)
  
  // Taxonomy (shared with INTEL)
  cancerTypes: string[];
  breastSubtypes: string[];
  biomarkers: string[];
  treatmentClasses: string[];
  treatmentStages: string[];
  domains: string[];
  
  // SEO
  primaryKeyword: string;
  secondaryKeywords: string[];
  structuredData: object;                // Schema.org MedicalWebPage / FAQPage
  canonicalUrl: string;
  
  // Cross-linking
  relatedArticles: string[];             // Slugs of related articles
  intelTags: string[];                   // Taxonomy tags for INTEL cross-referencing
  glossaryTerms: string[];               // Terms that link to glossary entries
  platformLinks: PlatformLink[];         // Links to platform features
  
  // Lifecycle
  status: "draft" | "review" | "published" | "needs_refresh";
  createdAt: string;
  publishedAt: string;
  lastReviewedAt: string;
  lastRefreshedAt: string;
  refreshTrigger: string | null;         // What would cause this to need updating
  medicalReviewStatus: "pending" | "approved" | "flagged";
  reviewerNotes: string | null;
  
  // Personalization hooks
  personalizationEnabled: boolean;
  personalizationConditions: PersonalizationCondition[];
}

interface ArticleSection {
  heading: string;
  content: string;                       // Markdown with platform link syntax
  level: 2 | 3;                          // h2 or h3
  isExpandable: boolean;                 // For clinical detail sections
  expandLabel: string | null;            // "Show clinical detail"
}

interface ActionItem {
  text: string;                          // "Ask your oncologist if genomic testing is right for you"
  type: "ask_doctor" | "check_eligibility" | "explore_platform" | "learn_more" | "download";
  platformLink: string | null;           // Link to platform feature if applicable
  urgency: "informational" | "time_sensitive" | "important";
}

interface KeyStatistic {
  label: string;                         // "Progression-free survival improvement"
  value: string;                         // "HR 0.63 (95% CI 0.53-0.75)"
  context: string;                       // "Enhertu vs standard chemotherapy in DESTINY-Breast04"
  source: string;                        // Trial name + publication
}

interface PlatformLink {
  text: string;                          // "Find clinical trials for HER2-low breast cancer"
  destination: string;                   // "/matches?subtype=her2_low"
  context: string;                       // Where in the article this appears
}

interface PersonalizationCondition {
  field: string;                         // "subtype", "stage", "biomarker", "treatmentPhase"
  value: string;
  additionalContent: string;             // Extra content shown when condition matches
  replacementContent: string | null;     // Content that replaces default when condition matches
}
```

---

## 3. Content Taxonomy

Uses the same taxonomy dimensions as INTEL — this is what enables cross-linking:

```typescript
interface ContentTaxonomy {
  // Primary dimensions (shared with INTEL)
  cancerType: string[];
  breastSubtype: string[];
  biomarker: string[];
  treatmentClass: string[];
  treatmentStage: string[];
  domain: string[];                      // treatment, detection, prevention, survivorship, etc.
  
  // Content-specific dimensions
  audienceLevel: "beginner" | "informed" | "advanced";
  contentFreshness: "evergreen" | "semi_evergreen" | "current";
  decisionRelevance: "background" | "active_decision" | "reference";
  
  // Journey mapping
  journeyStage: (
    | "just_diagnosed"                   // First 48 hours
    | "understanding_diagnosis"          // First 1-2 weeks
    | "treatment_planning"              // Before treatment starts
    | "active_treatment"                // During chemo/radiation/surgery
    | "between_treatments"              // Between phases (e.g., surgery → chemo)
    | "end_of_treatment"                // Transitioning to survivorship
    | "survivorship"                    // Post-treatment monitoring
    | "recurrence"                      // If cancer returns
    | "ongoing_therapy"                 // Long-term endocrine therapy, etc.
    | "caregiver"                       // For caregivers/family
    | "prevention"                      // Risk reduction, screening
  )[];
}
```

The shared taxonomy is what makes INTEL cross-linking automatic: an article tagged `biomarker: PIK3CA` automatically pulls recent INTEL items also tagged `biomarker: PIK3CA`.

---

## 4. Dual-Layer Rendering

### 4.1 Patient Layer (Default)

Always visible. Optimized for an 8th-grade reading level. This is what search engines index and what most visitors see.

```
┌─────────────────────────────────────────────────┐
│ What is HER2-low breast cancer?                  │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ Key takeaways                                 │ │
│ │ • HER2-low is a newer classification...       │ │
│ │ • About 55% of breast cancers are HER2-low   │ │
│ │ • New treatments like Enhertu now work for... │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ [Patient-accessible content sections]            │
│                                                  │
│ What does HER2-low mean?                         │
│ [Plain-language explanation...]                   │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ ▸ Clinical detail: HER2 IHC scoring system    │ │
│ │   [Collapsed — click to expand]               │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ How is HER2-low tested?                          │
│ [Plain-language explanation...]                   │
│                                                  │
│ Treatment options for HER2-low                   │
│ [Explanation of Enhertu, other ADCs...]           │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ ▸ Clinical detail: DESTINY-Breast04 results   │ │
│ │   [Collapsed — click to expand]               │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ What to ask your oncologist                      │
│ [Specific questions...]                           │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ What to do next                               │ │
│ │ → Find HER2-low clinical trials               │ │
│ │ → Understand your pathology report             │ │
│ │ → Talk to others with HER2-low BC             │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Latest research on HER2-low [from INTEL]         │
│ [3 most recent INTEL items tagged HER2-low]      │
│                                                  │
│ Related articles                                 │
│ [3-4 related knowledge base articles]            │
│                                                  │
│ Sources                                          │
│ [PubMed citations, trial references]             │
└─────────────────────────────────────────────────┘
```

### 4.2 Clinical Detail Layer (Expandable)

Nested inside patient content. Click to expand. Contains the clinical depth a more informed patient or caregiver wants.

```typescript
interface ClinicalExpansion {
  trigger: string;                       // "Clinical detail: HER2 IHC scoring"
  content: {
    text: string;                        // Technical explanation
    statistics: KeyStatistic[];          // HRs, CIs, p-values
    trialReferences: string[];           // NCT IDs
    guidelines: string[];                // "NCCN v2.2026, page 47"
    figures: string[];                   // Data visualization references
  };
}
```

### 4.3 Personalized Layer (Logged-In Users)

When a logged-in user views an article, additional personalized content appears:

```
┌──────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────┐│
│ │ ★ What this means for you                      ││
│ │                                                 ││
│ │ Your pathology report shows HER2 IHC 1+, which  ││
│ │ classifies your tumor as HER2-low. This means   ││
│ │ you may be eligible for Enhertu, which was       ││
│ │ recently approved for HER2-low breast cancer.    ││
│ │                                                 ││
│ │ We found 3 clinical trials for HER2-low         ││
│ │ breast cancer within 50 miles of you.            ││
│ │ → View your trial matches                       ││
│ └────────────────────────────────────────────────┘│
│                                                    │
│ [Rest of article continues normally]               │
└──────────────────────────────────────────────────┘
```

This personalized block is NOT indexed by search engines (rendered client-side for logged-in users only). It uses the same Claude personalization pattern as INTEL's "what this means for you."

---

## 5. Content Generation Pipeline

### 5.1 Claude Article Generation

Each article is generated by Claude with a structured prompt:

```typescript
const ARTICLE_GENERATION_PROMPT = `
You are writing an educational article for a cancer patient platform. 
The article must be medically accurate, genuinely helpful, and optimized 
for search engines.

ARTICLE SPEC:
Type: {articleType}
Topic: {topic}
Primary keyword: {primaryKeyword}
Secondary keywords: {secondaryKeywords}
Cancer type: {cancerType}
Target audience: Patients and caregivers, 8th-grade reading level for patient layer

STRUCTURE:
1. metaTitle (max 60 characters, include primary keyword)
2. metaDescription (max 155 characters, compelling search snippet)
3. patientSummary (2-3 sentences, direct answer to the implied question — 
   this is the featured snippet target)
4. keyTakeaways (3-5 bullet points — the "if you read nothing else" section)
5. patientContent sections:
   - Use h2 headings that match common search queries
   - Each section should answer a specific question a patient would ask
   - Plain language, no jargon without immediate definition
   - Use analogies and concrete examples
   - Include specific numbers when helpful (percentages, timelines)
   - DO NOT hedge everything — patients need clear, useful information
   - DO NOT use "consult your doctor" as a replacement for explanation
6. clinicalContent sections (expandable):
   - Keyed to specific patient sections (each clinical expansion maps to a patient section)
   - Include trial names, HRs, CIs, p-values
   - Reference specific NCCN guideline pages
   - Use proper medical terminology
7. actionItems:
   - Specific questions to ask oncologist (not generic "talk to your doctor")
   - Platform features that help (trial matching, sequencing navigator, etc.)
   - Time-sensitive actions if applicable
8. references:
   - PubMed IDs for all clinical claims
   - NCT IDs for referenced trials
   - NCCN guideline version and page numbers
   - FDA approval references

RULES:
- NEVER give treatment recommendations. Explain options and evidence, don't prescribe.
- DO give specific, useful information. "HER2-low means IHC 1+ or IHC 2+/FISH-negative" 
  is helpful. "HER2 status affects treatment" without explaining HOW is useless.
- Frame all content as informational, not advisory.
- Include a disclaimer at the bottom: educational information, not medical advice.
- The article should be GENUINELY USEFUL — if a patient reads this, they should 
  understand the topic well enough to have an informed conversation with their oncologist.
- Make it better than what's currently online. Check yourself: would a newly 
  diagnosed patient prefer this article or the current WebMD version? 
  If WebMD wins, rewrite.
- Include the primary keyword in: title, first paragraph, at least one h2, 
  meta description, and naturally throughout (~1-2% density).
- Use secondary keywords naturally in h2/h3 headings and body text.
- Write content that answers "People also ask" style questions.

Output format: JSON matching the Article interface.
`;
```

### 5.2 Batch Generation Process

```typescript
interface ContentGenerationPlan {
  // Phase 1: Launch corpus (50-75 articles, covers core topics)
  phase1Articles: ArticleSpec[];
  
  // Phase 2: Long-tail expansion (100-150 articles, specific decision points)
  phase2Articles: ArticleSpec[];
  
  // Phase 3: Treatment-specific deep dives (50-75 articles, every drug/regimen)
  phase3Articles: ArticleSpec[];
  
  // Ongoing: INTEL-triggered articles (when research changes landscape)
  ongoingTriggers: RefreshTrigger[];
}

interface ArticleSpec {
  topic: string;
  type: ArticleType;
  primaryKeyword: string;
  secondaryKeywords: string[];
  taxonomyTags: ContentTaxonomy;
  priority: "launch" | "month1" | "month3" | "quarter2";
  estimatedSearchVolume: number;         // Monthly searches for primary keyword
  currentCompetition: "low" | "medium" | "high";
  refreshFrequency: "quarterly" | "biannual" | "annual" | "when_triggered";
}
```

### 5.3 Content Refresh Pipeline

Articles don't stay accurate forever. The refresh pipeline:

```typescript
interface RefreshTrigger {
  type: "fda_approval" | "guideline_update" | "trial_result" | "new_classification" | "scheduled";
  description: string;
  affectedArticles: string[];            // Article slugs that need updating
  source: "intel_stream" | "manual" | "scheduled";
}

// Automatic refresh triggers from INTEL:
// 1. New T1 item (FDA approval) → refresh all articles mentioning the drug/indication
// 2. NCCN guideline update → refresh all articles referencing those guidelines
// 3. New drug class → may need entirely new articles
// 4. Classification change (e.g., HER2-ultralow) → refresh subtype articles

// Scheduled refreshes:
// 1. All articles audited annually for accuracy
// 2. Treatment landscape articles refreshed quarterly
// 3. Drug profile articles refreshed when new data emerges
// 4. Statistics updated when new SEER/ACS data published
```

---

## 6. SEO Architecture

### 6.1 Technical SEO

```typescript
interface SEOConfig {
  // URL structure
  urlPattern: "/learn/{category}/{slug}";
  // /learn/diagnosis/what-is-her2-low-breast-cancer
  // /learn/treatment/ac-t-chemotherapy-what-to-expect
  // /learn/testing/should-i-get-genomic-testing
  // /learn/biomarkers/pik3ca-mutation-treatment-options
  // /learn/survivorship/ctdna-monitoring-after-breast-cancer
  
  // Rendering
  rendering: "static_generation";        // Next.js SSG — pre-rendered HTML for crawlers
  revalidation: "on_demand";             // ISR with on-demand revalidation when content refreshes
  
  // Structured data (Schema.org)
  schemaTypes: [
    "MedicalWebPage",                    // Primary schema type
    "FAQPage",                           // For question-formatted articles
    "HowTo",                             // For procedure/guide articles
    "MedicalCondition",                  // For condition explainers
    "Drug",                              // For drug profiles
  ];
  
  // Sitemap
  sitemapEnabled: true;
  sitemapUpdateFrequency: "daily";
  
  // Internal linking
  minInternalLinks: 3;                   // Every article links to ≥3 other articles
  glossaryAutoLink: true;                // Auto-link glossary terms on first use
  breadcrumbs: true;                     // /learn > diagnosis > What is HER2-low...
}
```

### 6.2 Page Structure for SEO

```html
<!-- Server-rendered HTML structure for each article -->

<!-- Structured data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "What is HER2-low breast cancer?",
  "description": "...",
  "about": {
    "@type": "MedicalCondition",
    "name": "HER2-low breast cancer"
  },
  "audience": {
    "@type": "PeopleAudience",
    "audienceType": "Patient"
  },
  "lastReviewed": "2026-03-15",
  "reviewedBy": {
    "@type": "Person",
    "name": "...",
    "jobTitle": "Oncology nurse practitioner"
  },
  "datePublished": "2026-03-15",
  "dateModified": "2026-03-15",
  "mainEntityOfPage": true
}
</script>

<!-- Breadcrumbs (also structured data) -->
<nav aria-label="Breadcrumb">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/learn"><span itemprop="name">Learn</span></a>
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/learn/diagnosis"><span itemprop="name">Diagnosis</span></a>
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name">What is HER2-low breast cancer?</span>
    </li>
  </ol>
</nav>

<!-- Article content (pre-rendered, crawlable) -->
<article>
  <h1>What is HER2-low breast cancer?</h1>
  
  <!-- Featured snippet target -->
  <div class="summary">
    HER2-low breast cancer means your tumor has low levels of the HER2 protein — 
    specifically, an IHC score of 1+ or 2+ with a negative FISH test. About 55% 
    of all breast cancers are HER2-low. This classification matters because 
    newer treatments like Enhertu can now target these tumors.
  </div>
  
  <!-- Key takeaways (above the fold) -->
  <div class="takeaways">...</div>
  
  <!-- Content sections with h2s matching search queries -->
  <section>
    <h2>What does HER2-low mean?</h2>
    ...
  </section>
  
  <section>
    <h2>How is HER2 status tested?</h2>
    ...
  </section>
  
  <!-- etc. -->
</article>
```

### 6.3 URL Category Structure

```
/learn/
├── diagnosis/                       # Understanding your diagnosis
│   ├── what-is-her2-low-breast-cancer
│   ├── how-to-read-pathology-report
│   ├── breast-cancer-staging-explained
│   ├── triple-negative-breast-cancer
│   ├── inflammatory-breast-cancer
│   └── ...
├── biomarkers/                      # Biomarker deep dives
│   ├── pik3ca-mutation-treatment-options
│   ├── brca1-brca2-what-to-know
│   ├── tumor-mutational-burden-explained
│   ├── pd-l1-expression-breast-cancer
│   ├── esr1-mutations-endocrine-resistance
│   └── ...
├── treatment/                       # Treatment information
│   ├── ac-t-chemotherapy-what-to-expect
│   ├── enhertu-trastuzumab-deruxtecan
│   ├── neoadjuvant-vs-adjuvant-chemotherapy
│   ├── cold-capping-during-chemo
│   ├── endocrine-therapy-long-term
│   ├── radiation-therapy-breast-cancer
│   └── ...
├── testing/                         # Diagnostic & genomic testing
│   ├── should-i-get-genomic-testing
│   ├── oncotype-dx-score-meaning
│   ├── foundationone-cdx-what-to-expect
│   ├── ctdna-liquid-biopsy-monitoring
│   └── ...
├── decisions/                       # Decision support
│   ├── lumpectomy-vs-mastectomy
│   ├── questions-to-ask-oncologist-first-appointment
│   ├── clinical-trials-should-i-participate
│   ├── when-to-get-second-opinion
│   └── ...
├── side-effects/                    # Side effect management
│   ├── managing-chemo-nausea
│   ├── neuropathy-during-taxol
│   ├── aromatase-inhibitor-joint-pain
│   ├── chemo-brain-cognitive-changes
│   └── ...
├── survivorship/                    # Post-treatment
│   ├── what-to-expect-after-treatment-ends
│   ├── fear-of-recurrence
│   ├── ctdna-monitoring-after-breast-cancer
│   ├── fertility-after-cancer-treatment
│   └── ...
├── innovation/                      # Emerging science (feeds from INTEL)
│   ├── personalized-cancer-vaccines-explained
│   ├── what-are-antibody-drug-conjugates
│   ├── ai-in-breast-cancer-screening
│   ├── breast-cancer-treatment-landscape-2026
│   └── ...
└── glossary/                        # Term definitions (linking hub)
    ├── a-c/                         # Alphabetical sub-sections
    ├── d-g/
    ├── h-l/
    ├── m-p/
    └── q-z/
```

### 6.4 Internal Linking Strategy

Every article targets a minimum of 3 internal links plus auto-linked glossary terms:

```typescript
interface InternalLinkingRules {
  // Minimum links per article
  minRelatedArticles: 3;
  maxRelatedArticles: 6;
  
  // Auto-linking
  glossaryAutoLink: {
    enabled: true;
    linkFirstOccurrenceOnly: true;       // Don't over-link
    style: "dotted_underline";           // Subtle, not distracting
    hoverPreview: true;                  // Show definition on hover
  };
  
  // Platform feature links
  platformLinks: {
    trialMatching: {
      trigger: "any article mentioning clinical trials or specific drugs in trials",
      destination: "/matches",
      text: "Find clinical trials that match your profile →",
    },
    sequencingNav: {
      trigger: "any article about genomic testing, mutations, or biomarkers",
      destination: "/sequencing",
      text: "Learn about getting your tumor sequenced →",
    },
    treatmentTranslator: {
      trigger: "any article about treatment options or pathology results",
      destination: "/translate",
      text: "Get a personalized explanation of your treatment plan →",
    },
    carePackages: {
      trigger: "any article about side effect management or treatment preparation",
      destination: "/care",
      text: "Get a treatment-specific care kit →",
    },
  };
  
  // Cross-article linking patterns
  topicalClusters: {
    description: "Group related articles into clusters with a pillar page",
    example: {
      pillar: "/learn/diagnosis/breast-cancer-subtypes-explained",
      cluster: [
        "/learn/diagnosis/what-is-her2-low-breast-cancer",
        "/learn/diagnosis/triple-negative-breast-cancer",
        "/learn/diagnosis/er-positive-breast-cancer",
        "/learn/diagnosis/inflammatory-breast-cancer",
        "/learn/biomarkers/her2-testing-explained",
      ],
    },
  };
}
```

---

## 7. Personalization Layer

### 7.1 Personalization Architecture

For logged-in users with a patient profile, articles gain a personalized context block:

```typescript
const PERSONALIZATION_PROMPT = `
The user is reading an educational article about {articleTopic}.
Generate a short (2-4 sentence) personalized context block connecting 
this article to their specific situation.

User profile:
- Cancer type: {cancerType}
- Subtype: {subtype}
- Stage: {stage}
- Biomarkers: {biomarkers}
- Current treatment: {currentTreatment}
- Treatment phase: {treatmentPhase}

Article topic: {articleTopic}
Article taxonomy: {taxonomyTags}

RULES:
- If the article IS directly relevant to their situation, explain specifically why
- If the article is NOT relevant, say so clearly and briefly
- Connect to platform features where appropriate
- NEVER make treatment recommendations
- NEVER speculate about prognosis
- Use "your" language — this is personal
`;
```

### 7.2 Contextual Reading Recommendations

Based on the user's profile and journey stage, suggest articles in a reading order:

```typescript
interface ReadingPlan {
  journeyStage: string;
  recommendedArticles: {
    article: string;                     // Article slug
    reason: string;                      // Why this article matters now
    priority: "read_now" | "read_soon" | "when_ready";
  }[];
}

// Example for a newly diagnosed ER+/HER2- Stage II patient:
const EXAMPLE_PLAN: ReadingPlan = {
  journeyStage: "just_diagnosed",
  recommendedArticles: [
    {
      article: "how-to-read-pathology-report",
      reason: "Understanding your pathology report is the first step",
      priority: "read_now",
    },
    {
      article: "er-positive-breast-cancer",
      reason: "Your cancer is ER-positive — here's what that means for treatment",
      priority: "read_now",
    },
    {
      article: "questions-to-ask-oncologist-first-appointment",
      reason: "Prepare for your next oncology appointment",
      priority: "read_now",
    },
    {
      article: "should-i-get-genomic-testing",
      reason: "Genomic testing may determine whether you need chemotherapy",
      priority: "read_soon",
    },
    {
      article: "lumpectomy-vs-mastectomy",
      reason: "You may be asked to choose between surgical options",
      priority: "read_soon",
    },
    {
      article: "cold-capping-during-chemo",
      reason: "If chemo is recommended, cold capping decisions must be made before infusion #1",
      priority: "read_soon",
    },
  ],
};
```

---

## 8. INTEL Cross-Linking

### 8.1 How It Works

The knowledge base and INTEL share the same taxonomy. This enables automatic cross-referencing:

```typescript
interface INTELCrossLink {
  // On every knowledge base article page:
  latestResearch: {
    description: "Pull the 3 most recent INTEL items matching this article's taxonomy tags";
    displayAs: "Latest research" section at the bottom of the article;
    matchingLogic: "Match on ANY overlapping taxonomy tag (biomarker, treatment_class, subtype)";
    freshness: "Only show items published within the last 90 days";
    maturityFilter: "Show T1-T3 only (no preclinical for article context)";
  };
  
  // On every INTEL research item page:
  foundationalArticles: {
    description: "Link to knowledge base articles that provide background for this research item";
    displayAs: "Background reading" section on the INTEL item page;
    matchingLogic: "Match on primary taxonomy tags";
    label: "Need context? Read our guide to {topic}";
  };
}
```

### 8.2 INTEL-Triggered Article Creation

When INTEL identifies a significant new development that doesn't have a corresponding knowledge base article:

```typescript
interface ArticleCreationTrigger {
  trigger: "New T1 item (FDA approval) with no matching knowledge base article";
  action: "Generate new treatment_profile or biomarker_profile article";
  example: "Dato-DXd (Datroway) approved → generate 'Dato-DXd (Datroway) for HR+/HER2- breast cancer'";
  approval: "Draft generated automatically, queued for medical review before publishing";
}
```

### 8.3 INTEL-Triggered Article Refresh

When INTEL content contradicts or updates a knowledge base article:

```typescript
interface ArticleRefreshTrigger {
  trigger: "T1 or T2 INTEL item changes the standard of care referenced in a knowledge base article";
  action: "Flag article for refresh, generate suggested updates";
  example: "New NCCN guideline changes sequencing recommendation → flag 'should I get genomic testing' for refresh";
  approval: "Suggested updates queued for review, article gets 'needs_refresh' status badge";
}
```

---

## 9. Internal Reference System

### 9.1 Platform-Wide Deep Linking

Every module in the platform can link to knowledge base articles using a consistent syntax:

```typescript
// In Treatment Translator output:
"Your tumor is **HER2-low** [learn more →](/learn/diagnosis/what-is-her2-low-breast-cancer)"

// In Sequencing Navigator:
"We recommend **FoundationOne CDx** [what is this? →](/learn/testing/foundationone-cdx-what-to-expect)"

// In INTEL stream item:
"This study involved a **PROTAC degrader** [learn about PROTACs →](/learn/innovation/what-are-protac-degraders)"

// In Care Package descriptions:
"**Cold capping** can preserve your hair [learn more →](/learn/treatment/cold-capping-during-chemo)"

// In Financial Assistance Finder:
"Patient Assistance Program for **pembrolizumab** [what is pembrolizumab? →](/learn/treatment/pembrolizumab-keytruda)"
```

### 9.2 Glossary Tooltip System

Terms that appear across the platform get glossary tooltips:

```typescript
interface GlossaryTerm {
  term: string;                          // "HER2-low"
  slug: string;                          // "her2-low"
  shortDefinition: string;               // Shown in tooltip (1-2 sentences)
  fullArticleSlug: string | null;        // Link to full article if one exists
  aliases: string[];                     // ["HER2 low", "HER-2 low"]
  category: string;                      // "biomarker", "treatment", "test", etc.
}

// Auto-linking: when rendering any patient-facing content,
// scan for glossary terms and wrap first occurrence in a tooltip
// Don't auto-link inside headings or if already linked
```

---

## 10. Medical Review Process

### 10.1 Review Framework

Not a full medical advisory board — a lightweight, practical review process:

```typescript
interface MedicalReviewProcess {
  // Reviewer
  reviewer: {
    role: "Oncology NP or retired oncologist";
    commitment: "10-15 hours per quarter";
    compensation: "Part-time contractor";
  };
  
  // Initial corpus review
  initialReview: {
    scope: "All launch articles (50-75)";
    timeline: "2-3 weeks, batch review";
    checklist: [
      "Factual accuracy of all clinical claims",
      "Appropriate scope (educational, not advisory)",
      "Correct dosing/regimen information where mentioned",
      "Up-to-date with current NCCN guidelines",
      "No misleading framing or false hope",
      "Appropriate disclaimer language",
      "Sensitive topics handled well (prognosis, palliative, end of life)",
    ];
    output: "Approved / Approved with edits / Flagged for revision";
  };
  
  // Ongoing review
  ongoingReview: {
    frequency: "Quarterly",
    scope: "New articles since last review + flagged refreshes",
    spotCheck: "Random audit of 5 existing articles for currency",
  };
  
  // Automated quality layer (pre-review filter)
  automatedChecks: {
    treatmentRecommendationDetector: {
      description: "Claude scans for language that could be read as treatment recommendations rather than education",
      action: "Flag for manual review before publishing",
      examples: [
        "You should ask for..." → OK (recommending a conversation, not a treatment),
        "Enhertu is the best option for..." → FLAGGED (treatment recommendation),
        "Studies show that..." → OK (reporting evidence),
        "You need to switch to..." → FLAGGED (directive medical advice),
      ],
    },
    outdatedInformationDetector: {
      description: "Cross-reference article claims against INTEL stream for contradictions",
      action: "Flag article as needs_refresh if contradiction found",
    },
    dosageAndRegimenValidator: {
      description: "If article mentions specific dosages or regimen details, flag for review",
      action: "All dosage mentions require medical review approval",
    },
  };
}
```

### 10.2 Content Status Badges

Published articles show their review and freshness status:

```typescript
interface ContentStatusBadges {
  medicalReview: {
    display: "Medically reviewed [date]";
    visible: true;
    updatedWhen: "After each medical review";
  };
  lastUpdated: {
    display: "Last updated [date]";
    visible: true;
    updatedWhen: "After each content refresh";
  };
  needsRefresh: {
    display: "This article is being updated with new information";
    visible: true;
    condition: "When INTEL-triggered refresh is pending but not yet published";
  };
}
```

---

## 11. Content Corpus Plan

### 11.1 Launch Corpus (50-75 Articles)

Priority articles for launch, ordered by estimated search volume and conversion potential:

**Diagnosis & Understanding (15 articles):**

| Article | Primary keyword | Est. monthly searches | Priority |
|---------|----------------|----------------------|----------|
| How to read your breast cancer pathology report | pathology report breast cancer | 2,000 | Launch |
| Breast cancer staging explained | breast cancer stages | 8,000 | Launch |
| What is HER2-low breast cancer? | HER2-low breast cancer | 5,000 | Launch |
| Triple-negative breast cancer explained | triple negative breast cancer | 12,000 | Launch |
| ER-positive breast cancer: what you need to know | ER positive breast cancer | 6,000 | Launch |
| HER2-positive breast cancer explained | HER2 positive breast cancer | 8,000 | Launch |
| Inflammatory breast cancer: a rare but aggressive subtype | inflammatory breast cancer | 3,000 | Launch |
| Invasive ductal carcinoma explained | invasive ductal carcinoma | 4,000 | Launch |
| DCIS (Stage 0): what it means and what to do | DCIS breast cancer | 5,000 | Launch |
| Invasive lobular carcinoma | invasive lobular carcinoma | 2,500 | Launch |
| Breast cancer grades: what 1, 2, and 3 mean | breast cancer grade | 3,000 | Launch |
| Ki-67 score: what it means for your treatment | Ki-67 breast cancer | 2,000 | Launch |
| What is lymph node involvement? | lymph node positive breast cancer | 2,500 | Launch |
| Breast cancer recurrence: types, risk, and monitoring | breast cancer recurrence risk | 3,000 | Launch |
| Male breast cancer | male breast cancer | 1,500 | Launch |

**Treatment (15 articles):**

| Article | Primary keyword | Est. monthly searches | Priority |
|---------|----------------|----------------------|----------|
| AC-T chemotherapy: what to expect week by week | AC-T chemo side effects | 3,000 | Launch |
| Neoadjuvant vs adjuvant chemotherapy | neoadjuvant chemotherapy | 2,500 | Launch |
| Cold capping during chemotherapy: does it work? | cold capping chemo | 4,000 | Launch |
| Lumpectomy vs mastectomy: comparing your options | lumpectomy vs mastectomy | 3,000 | Launch |
| Radiation therapy for breast cancer: what to expect | breast cancer radiation | 4,000 | Launch |
| Endocrine therapy: tamoxifen, aromatase inhibitors, and beyond | endocrine therapy breast cancer | 2,000 | Launch |
| Enhertu (trastuzumab deruxtecan): what you need to know | Enhertu breast cancer | 1,500 | Launch |
| Herceptin (trastuzumab): a guide for patients | Herceptin | 3,000 | Launch |
| Keytruda (pembrolizumab) for breast cancer | Keytruda breast cancer | 2,000 | Launch |
| CDK4/6 inhibitors: Ibrance, Verzenio, Kisqali | CDK4/6 inhibitors breast cancer | 2,000 | Launch |
| What are antibody-drug conjugates (ADCs)? | antibody drug conjugate | 1,500 | Launch |
| What is immunotherapy for breast cancer? | immunotherapy breast cancer | 2,500 | Launch |
| Managing chemotherapy nausea | chemo nausea management | 3,000 | Launch |
| Chemo brain: cognitive changes during treatment | chemo brain | 2,500 | Launch |
| Aromatase inhibitor joint pain: why it happens and what helps | aromatase inhibitor joint pain | 2,000 | Launch |

**Testing & Biomarkers (10 articles):**

| Article | Primary keyword | Est. monthly searches | Priority |
|---------|----------------|----------------------|----------|
| Should I get my tumor genomically sequenced? | tumor genomic testing | 1,500 | Launch |
| Oncotype DX score: what your number means | Oncotype DX score meaning | 2,000 | Launch |
| BRCA1 and BRCA2 mutations: what to know | BRCA mutation breast cancer | 4,000 | Launch |
| PIK3CA mutations: treatment implications | PIK3CA mutation breast cancer | 1,000 | Launch |
| Tumor mutational burden (TMB) explained | tumor mutational burden | 2,000 | Launch |
| ctDNA and liquid biopsy: monitoring for recurrence | ctDNA breast cancer | 800 | Launch |
| PD-L1 testing: who needs it and why | PD-L1 breast cancer | 1,000 | Launch |
| FoundationOne CDx: what to expect | FoundationOne CDx | 1,500 | Launch |
| Genetic testing vs genomic testing: what's the difference | genetic vs genomic testing cancer | 1,000 | Launch |
| ESR1 mutations and endocrine resistance | ESR1 mutation breast cancer | 500 | Launch |

**Decisions & Practical (10 articles):**

| Article | Primary keyword | Est. monthly searches | Priority |
|---------|----------------|----------------------|----------|
| Questions to ask your oncologist at your first appointment | questions for oncologist | 4,000 | Launch |
| Should I participate in a clinical trial? | cancer clinical trials | 3,000 | Launch |
| When to get a second opinion | cancer second opinion when | 1,500 | Launch |
| How to prepare for your first chemo infusion | first chemo infusion | 2,000 | Launch |
| Fertility preservation before cancer treatment | fertility preservation cancer | 1,500 | Launch |
| Understanding your cancer insurance coverage | cancer treatment insurance coverage | 1,500 | Launch |
| What to expect at your first radiation appointment | first radiation treatment | 1,500 | Launch |
| Port placement: what to expect and how to care for it | chemo port placement | 2,500 | Launch |
| Navigating cancer treatment while working | working during cancer treatment | 1,000 | Launch |
| What happens after treatment ends | life after cancer treatment | 2,000 | Launch |

**Innovation & Emerging (5 articles):**

| Article | Primary keyword | Est. monthly searches | Priority |
|---------|----------------|----------------------|----------|
| Personalized cancer vaccines explained | personalized cancer vaccine | 2,000 | Launch |
| Breast cancer treatment landscape 2026 | breast cancer new treatments 2026 | 3,000 | Launch |
| AI in breast cancer screening: what's real and what's hype | AI breast cancer screening | 1,500 | Launch |
| What are PROTAC degraders? | PROTAC cancer treatment | 500 | Launch |
| The future of breast cancer detection | early breast cancer detection | 1,000 | Launch |

### 11.2 Estimated Search Capture

Launch corpus targets ~120K-150K monthly searches across all articles. At a 3-5% CTR (typical for position 3-5 results) and 15-20% signup conversion rate for a highly relevant tool:

```
Monthly searches:     ~130,000
CTR (position 3-5):   ~4%
Monthly visitors:      ~5,200
Signup conversion:     ~17%
Monthly new users:     ~880

Year 1 (as SEO authority builds and more articles publish):
Month 1:   ~200 new users (SEO takes 2-3 months to ramp)
Month 3:   ~500
Month 6:   ~900
Month 12:  ~1,500-2,000
Year 1 total: ~8,000-12,000 organic users
```

These are conservative estimates. The compound effect of 200+ articles, internal linking, and domain authority building means Month 12 traffic is significantly higher than Month 6.

---

## 12. Data Model

```sql
-- Knowledge base articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,                     -- ArticleType enum
  
  -- Content
  title TEXT NOT NULL,
  meta_title TEXT NOT NULL,              -- Max 60 chars
  meta_description TEXT NOT NULL,        -- Max 155 chars
  patient_summary TEXT NOT NULL,
  key_takeaways TEXT[] NOT NULL,
  patient_content JSONB NOT NULL,        -- ArticleSection[]
  clinical_content JSONB,               -- ArticleSection[] (expandable)
  action_items JSONB,                   -- ActionItem[]
  key_statistics JSONB,                 -- KeyStatistic[]
  references JSONB,                     -- Reference[]
  
  -- Taxonomy (shared with INTEL)
  cancer_types TEXT[],
  breast_subtypes TEXT[],
  biomarkers TEXT[],
  treatment_classes TEXT[],
  treatment_stages TEXT[],
  domains TEXT[],
  journey_stages TEXT[],
  audience_level TEXT DEFAULT 'beginner',
  content_freshness TEXT DEFAULT 'evergreen',
  
  -- SEO
  primary_keyword TEXT NOT NULL,
  secondary_keywords TEXT[],
  structured_data JSONB,
  canonical_url TEXT,
  category TEXT NOT NULL,                -- URL category (diagnosis, treatment, etc.)
  
  -- Cross-linking
  related_article_slugs TEXT[],
  intel_tags TEXT[],                     -- Tags for INTEL cross-reference
  glossary_terms TEXT[],
  platform_links JSONB,                 -- PlatformLink[]
  
  -- Personalization
  personalization_enabled BOOLEAN DEFAULT TRUE,
  personalization_conditions JSONB,     -- PersonalizationCondition[]
  
  -- Lifecycle
  status TEXT DEFAULT 'draft',           -- draft, review, published, needs_refresh
  medical_review_status TEXT DEFAULT 'pending',
  reviewer_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  
  -- Refresh tracking
  refresh_trigger TEXT,
  last_refreshed_at TIMESTAMPTZ,
  refresh_frequency TEXT DEFAULT 'annual',
  next_refresh_due DATE,
  
  -- Metrics
  view_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page INTEGER,              -- Seconds
  bounce_rate FLOAT,
  signup_conversions INTEGER DEFAULT 0,
  
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Glossary terms
CREATE TABLE glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_definition TEXT NOT NULL,        -- Tooltip text (1-2 sentences)
  full_definition TEXT,                  -- Longer explanation
  full_article_slug TEXT,                -- Link to full article if exists
  aliases TEXT[],
  category TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content refresh log
CREATE TABLE content_refresh_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id),
  
  trigger_type TEXT NOT NULL,            -- intel_triggered, scheduled, manual
  trigger_source TEXT,                   -- INTEL item ID or description
  
  changes_made TEXT,
  refreshed_by TEXT,                     -- "claude_auto" or reviewer name
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personalization cache (per user per article)
CREATE TABLE article_personalization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES patients(id),
  article_id UUID REFERENCES articles(id),
  
  personalized_content TEXT,             -- Claude-generated "what this means for you"
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, article_id)
);

-- Article analytics (daily aggregate)
CREATE TABLE article_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id),
  date DATE NOT NULL,
  
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_seconds INTEGER,
  bounce_rate FLOAT,
  scroll_depth_avg FLOAT,               -- Average scroll depth (0-100%)
  
  -- Conversion tracking
  signup_clicks INTEGER DEFAULT 0,       -- Clicked "sign up" from article
  trial_match_clicks INTEGER DEFAULT 0,  -- Clicked through to trial matcher
  feature_clicks JSONB,                  -- Clicks to each platform feature
  
  -- SEO metrics (from Search Console API, if integrated)
  search_impressions INTEGER,
  search_clicks INTEGER,
  avg_position FLOAT,
  top_queries TEXT[],                    -- Top 5 search queries driving traffic
  
  UNIQUE(article_id, date)
);

-- Indexes
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_cancer ON articles USING GIN(cancer_types);
CREATE INDEX idx_articles_subtypes ON articles USING GIN(breast_subtypes);
CREATE INDEX idx_articles_biomarkers ON articles USING GIN(biomarkers);
CREATE INDEX idx_articles_keywords ON articles(primary_keyword);
CREATE INDEX idx_articles_journey ON articles USING GIN(journey_stages);
CREATE INDEX idx_glossary_term ON glossary_terms(term);
CREATE INDEX idx_glossary_slug ON glossary_terms(slug);
CREATE INDEX idx_analytics_article_date ON article_analytics(article_id, date DESC);
```

---

## 13. API & tRPC Router Definitions

```typescript
const learnRouter = router({
  // Public article access (no auth — SEO pages)
  getArticle: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      // Return full article for SSG rendering
    }),

  getArticlesByCategory: publicProcedure
    .input(z.object({
      category: z.string(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ input }) => { }),

  searchArticles: publicProcedure
    .input(z.object({
      query: z.string(),
      filters: z.object({
        cancerTypes: z.array(z.string()).optional(),
        subtypes: z.array(z.string()).optional(),
        journeyStages: z.array(z.string()).optional(),
        categories: z.array(z.string()).optional(),
      }).optional(),
    }))
    .query(async ({ input }) => { }),

  // Glossary
  getGlossaryTerm: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => { }),

  getGlossaryByCategory: publicProcedure
    .input(z.object({ category: z.string().optional() }))
    .query(async ({ input }) => { }),

  // Personalization (auth required)
  getPersonalizedContext: protectedProcedure
    .input(z.object({ articleSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      // Generate "what this means for you" for logged-in user
    }),

  getReadingPlan: protectedProcedure
    .query(async ({ ctx }) => {
      // Generate journey-stage-appropriate reading recommendations
    }),

  // INTEL cross-reference
  getRelatedResearch: publicProcedure
    .input(z.object({ articleSlug: z.string(), limit: z.number().default(3) }))
    .query(async ({ input }) => {
      // Pull recent INTEL items matching article's taxonomy tags
    }),

  // Analytics tracking
  trackView: publicProcedure
    .input(z.object({
      articleSlug: z.string(),
      referrer: z.string().optional(),
      scrollDepth: z.number().optional(),
      timeOnPage: z.number().optional(),
    }))
    .mutation(async ({ input }) => { }),

  trackConversion: publicProcedure
    .input(z.object({
      articleSlug: z.string(),
      conversionType: z.string(),        // "signup", "trial_match_click", etc.
    }))
    .mutation(async ({ input }) => { }),

  // Admin
  listArticles: adminProcedure
    .input(z.object({
      status: z.string().optional(),
      reviewStatus: z.string().optional(),
      needsRefresh: z.boolean().optional(),
    }))
    .query(async ({ input }) => { }),

  updateArticleStatus: adminProcedure
    .input(z.object({
      articleId: z.string(),
      status: z.string(),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => { }),

  triggerRefresh: adminProcedure
    .input(z.object({
      articleId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Re-generate article content, set status to review
    }),

  regenerateArticle: adminProcedure
    .input(z.object({
      articleId: z.string(),
      updateSpec: z.string().optional(),  // Additional context for regeneration
    }))
    .mutation(async ({ input }) => {
      // Full re-generation via Claude
    }),

  // Batch generation
  generateArticleBatch: adminProcedure
    .input(z.object({
      articleSpecs: z.array(z.object({
        topic: z.string(),
        type: z.string(),
        primaryKeyword: z.string(),
        secondaryKeywords: z.array(z.string()),
        category: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      // Generate multiple articles in batch, all set to "draft" status
    }),

  // Sitemap
  getSitemapData: publicProcedure
    .query(async () => {
      // Return all published article URLs for sitemap.xml
    }),
});
```

---

## 14. Build Sequence

### 14.1 Prerequisites

- Next.js SSG/ISR configured in the web app
- Claude API integration operational
- Medical reviewer identified and contracted (can happen in parallel with build)

### 14.2 Claude Code Sessions

```
SESSION L1: Article system + glossary + admin (Week 1-2)
  1. Prisma schema (articles, glossary_terms, content_refresh_log, article_personalization, article_analytics)
  2. Article rendering system
     - SSG page template with dual-layer rendering
     - Patient layer (default view)
     - Clinical expansion layer (collapsible sections)
     - Key takeaways component
     - Action items component
     - References section
     - "What this means for you" personalization slot (client-side, auth-gated)
  3. Glossary system
     - Tooltip component (hover to show short definition)
     - Auto-linker utility (scan content, wrap first occurrence of glossary terms)
     - Glossary index page (/learn/glossary)
  4. Admin article management page
     - Article list with status filters
     - Article editor (view/edit JSON content)
     - Status management (draft → review → published → needs_refresh)
     - Medical review status tracking
  5. Routes:
     /learn (hub page)
     /learn/[category] (category listing)
     /learn/[category]/[slug] (article page)
     /learn/glossary (glossary index)
     /learn/glossary/[slug] (glossary term page)
  6. URL structure + breadcrumbs

SESSION L2: Content generation pipeline + SEO (Week 2-4)
  1. Article generation pipeline
     - Claude prompt template system
     - Batch generation endpoint (generate multiple articles)
     - Article spec → Claude prompt → Article JSON → database
  2. SEO infrastructure
     - Schema.org structured data generation (MedicalWebPage, FAQPage)
     - Dynamic sitemap.xml generation from published articles
     - Meta tags (title, description, OG tags, Twitter cards)
     - Canonical URLs
     - robots.txt configuration
  3. Internal linking engine
     - Related articles algorithm (shared taxonomy tags)
     - Platform feature links (auto-insert based on article taxonomy)
     - Cross-article link suggestions (admin view)
     - Topical cluster visualization
  4. Automated quality checks
     - Treatment recommendation detector (Claude-based scan)
     - Outdated information detector (cross-reference against INTEL if available)
     - Dosage mention flagger
     - Quality check results displayed in admin
  5. Generate and publish launch corpus — batch 1 (25 articles)
     - Diagnosis category (15 articles)
     - Testing & biomarkers category (10 articles)
     - Run automated quality checks
     - Set status to "review" for medical reviewer

SESSION L3: Launch corpus completion + personalization (Week 4-6)
  1. Generate and publish launch corpus — batch 2 (25-30 articles)
     - Treatment category (15 articles)
     - Decisions & practical category (10 articles)
     - Set status to "review"
  2. Generate and publish launch corpus — batch 3 (15-20 articles)
     - Side effects category (5 articles)
     - Survivorship category (5 articles)
     - Innovation category (5 articles)
  3. Glossary term seeding (100+ terms)
     - Extract key terms from all published articles
     - Generate short definitions
     - Link to full articles where they exist
  4. Personalization layer
     - "What this means for you" generation (Claude, per user per article)
     - Caching layer (don't regenerate if profile hasn't changed)
     - Reading plan generator (journey-stage-appropriate recommendations)
     - Personalized reading plan page (/learn/my-reading-plan)
  5. Article search (full-text search across articles)
  6. Category hub pages with featured articles and browse-by-topic

SESSION L4: INTEL integration + analytics + refresh pipeline (Week 6-8)
  1. INTEL cross-linking (requires INTEL module sessions I1-I2 minimum)
     - "Latest research" section on article pages
     - Pull recent INTEL items matching article taxonomy
     - "Background reading" links on INTEL item pages
     - Shared taxonomy validation (ensure tags align)
  2. INTEL-triggered refresh pipeline
     - Monitor INTEL for T1/T2 items that affect article content
     - Auto-flag articles as needs_refresh
     - Generate suggested updates
     - Queue for medical review
  3. INTEL-triggered article creation
     - When new drug/biomarker has no article, auto-generate draft
     - Queue for review
  4. Analytics system
     - Page view tracking
     - Scroll depth tracking
     - Time on page tracking
     - Conversion tracking (signup clicks, feature clicks)
     - Search Console API integration (optional — track search performance)
     - Analytics dashboard in admin
  5. Content refresh pipeline
     - Scheduled refresh checks (annual for evergreen, quarterly for treatment landscape)
     - Refresh log tracking
     - Diff view (what changed in each refresh)
  6. Internal reference system
     - Deep link components for other modules (Treatment Translator, Sequencing Nav, etc.)
     - "Learn more" link generator utility
     - Verify all cross-module links work
```

### 14.3 Timeline Estimate

```
Session L1:  Week 1-2   (article system + glossary + admin — structure ready)
Session L2:  Week 2-4   (generation pipeline + SEO + first 25 articles)
Session L3:  Week 4-6   (complete corpus + personalization — 55-75 articles live)
Session L4:  Week 6-8   (INTEL integration + analytics + refresh pipeline)

Total: ~8 weeks
MVP (L1-L2): 4 weeks — 25 articles live, SEO indexing started
Launch (L1-L3): 6 weeks — full corpus, personalization, search
Complete (L1-L4): 8 weeks — INTEL cross-linking, analytics, refresh pipeline

CRITICAL: SEO takes 2-3 months to ramp.
- Publish articles as early as possible (even before full corpus is done)
- Submit sitemap to Google Search Console immediately after L2
- First organic traffic expected ~6-8 weeks after initial publish
- Meaningful traffic (~1,000+ monthly visitors) expected ~12-16 weeks after launch
```

### 14.4 Medical Review Timeline (Parallel Track)

```
Week 1:    Contract medical reviewer (oncology NP or retired oncologist)
Week 3-4:  Reviewer receives first batch of 25 articles
Week 4-5:  Review + feedback cycle on batch 1
Week 5-6:  Reviewer receives batch 2 + 3
Week 6-7:  Review + feedback cycle on remaining articles
Week 7-8:  Final publish of all reviewed articles
Ongoing:   Quarterly review of new + refreshed content (10-15 hours/quarter)

Estimated cost: $5,000-8,000 for initial corpus review + $1,500-2,500/quarter ongoing
```

---

## Appendix A: Sample Article Output

### Article: "What is HER2-low breast cancer?"

**Patient summary (featured snippet target):**
HER2-low breast cancer means your tumor has low levels of the HER2 protein — specifically, an IHC score of 1+ or 2+ with a negative FISH test. About 55% of all breast cancers fall into this category. This classification matters because newer treatments like Enhertu can now target tumors that were previously considered HER2-negative.

**Key takeaways:**
- HER2-low is a newer way of classifying breast cancer, recognized since 2022
- It means your tumor has some HER2 protein, but not enough to be called HER2-positive
- About 55% of all breast cancers are HER2-low — it's very common
- New drugs called antibody-drug conjugates (ADCs) can now target HER2-low tumors
- If your pathology report says IHC 1+ or IHC 2+/FISH-, your cancer is HER2-low
- This may open up treatment options that weren't available before 2022

**Patient content sections:**
- What does HER2-low mean? (with expandable: HER2 IHC scoring system)
- How is HER2 status tested? (with expandable: IHC vs FISH methodology)
- Why does HER2-low matter for treatment? (with expandable: DESTINY-Breast04 trial data)
- What treatments work for HER2-low breast cancer? (with expandable: ADC mechanism of action)
- Is HER2-low the same as HER2-negative? (common confusion)
- What to ask your oncologist about HER2-low
- What about HER2-ultralow? (emerging classification)

**Action items:**
- "Ask your oncologist whether your tumor is HER2-low — if your IHC was reported as 1+ or 2+/FISH-, it is"
- "Find clinical trials for HER2-low breast cancer → [trial matcher link]"
- "Get your pathology report explained in plain language → [Treatment Translator link]"

**Platform links:**
- "Find clinical trials for HER2-low breast cancer" → /matches?subtype=her2_low
- "Understand your pathology report" → /learn/diagnosis/how-to-read-pathology-report
- "Learn about Enhertu" → /learn/treatment/enhertu-trastuzumab-deruxtecan
- "Get a personalized treatment summary" → /translate

**Related articles:**
- How to read your breast cancer pathology report
- What are antibody-drug conjugates (ADCs)?
- Enhertu (trastuzumab deruxtecan): what you need to know
- HER2-positive breast cancer explained

**INTEL cross-reference (live, from INTEL stream):**
- [Most recent T1-T3 items tagged HER2, HER2-low, ADC]
