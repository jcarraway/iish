# OncoVax — Phase 2 Claude Code Session Prompts

## Sequencing Navigator (SEQUENCE)

These sessions build the sequencing navigation layer — guiding patients from "I have cancer" to "I have my tumor's genomic data in hand." This unlocks genomically-informed trial matching (much more precise than Phase 1's clinical-only matching) and feeds directly into Phase 3's neoantigen prediction pipeline.

**Prerequisites:** Phase 1 must be stable — patient profiles, document ingestion, trial matching, Treatment Translator, and Financial Assistance Finder all functional.

---

## SESSION 7: Sequencing Provider Directory + Insurance Coverage Engine — COMPLETED ✓

---START---

# OncoVax — Sequencing Provider Directory + Insurance Coverage Engine

This is Session 7, the first Phase 2 session. Phase 1 is live with patient profiles, document ingestion, trial matching, Treatment Translator, Financial Assistance Finder, and MyChart integration. Now we're building the layer that helps patients get their tumor genomically sequenced — a prerequisite for personalized vaccine design and the most precise trial matching.

## Context

Most cancer patients don't know they can get their tumor's DNA sequenced, don't know what it costs, don't know insurance often covers it, and don't know how to ask their oncologist for it. This session builds the information infrastructure — who offers sequencing, what it costs, and will insurance pay for it.

## What to build

### 1. Prisma Schema Additions

Add these models to your existing Prisma schema:

```prisma
model SequencingProvider {
  id              String   @id @default(uuid())
  name            String                           // "Foundation Medicine"
  type            String                           // commercial, academic, direct_to_consumer
  testTypes       String[]                         // whole_exome_sequencing, targeted_panel, etc.
  details         Json                             // Full SequencingProvider structure (see below)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  orders          SequencingOrder[]
}

model SequencingOrder {
  id                    String   @id @default(uuid())
  patientId             String
  patient               Patient  @relation(fields: [patientId], references: [id])
  providerId            String
  provider              SequencingProvider @relation(fields: [providerId], references: [id])
  testType              String
  status                String   @default("initiated")  // initiated, sample_collected, processing, complete
  orderedDate           DateTime?
  expectedCompletion    DateTime?
  actualCompletion      DateTime?

  // Insurance
  insuranceStatus       String?   // covered, denied, pending_prior_auth, self_pay
  priorAuthSubmitted    Boolean   @default(false)
  estimatedCost         Float?

  // Results
  resultsAvailable      Boolean   @default(false)
  resultsFormat         String?   // pdf, vcf, bam, fastq
  resultsStoragePath    String?   // S3 path

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model InsuranceCoverageRule {
  id              String   @id @default(uuid())
  insurer         String                           // "UnitedHealthcare", "Medicare", etc.
  testType        String                           // whole_exome_sequencing, targeted_panel, etc.
  cancerType      String?                          // null = all cancers
  stage           String?                          // null = all stages
  coverageStatus  String                           // covered, not_covered, prior_auth_required
  conditions      String?                          // Additional conditions
  cptCodes        String[]
  sourceUrl       String?                          // CMS NCD, insurer policy URL
  effectiveDate   DateTime?
  updatedAt       DateTime @updatedAt
}
```

Don't forget to add the `orders SequencingOrder[]` relation to the existing `Patient` model. Run the migration.

### 2. Sequencing Provider Seed Data

Create `packages/db/prisma/seed-sequencing.ts`

Research and seed the following providers with accurate, current data. For each provider, the `details` JSON field should contain the full structure:

```typescript
interface SequencingProviderDetails {
  description: string;                    // 1-2 sentence description
  testOfferings: {
    testType: string;                     // "whole_exome_sequencing", "targeted_panel", etc.
    testName: string;                     // "FoundationOne CDx", "Tempus xT", etc.
    geneCount: number | null;             // 324 genes, 648 genes, etc.
    description: string;                  // What this test covers
    turnaroundDays: { min: number; max: number };
    listPrice: number;
    typicalInsuranceCopay: number | null;
    sampleType: string;                   // "FFPE tissue", "blood draw", etc.
    sampleRequirements: string;           // "10 unstained slides, 4-5μm thickness"
  }[];
  outputFormat: {
    reportType: string;                   // "PDF clinical report + interactive portal"
    rawDataAvailable: boolean;
    rawDataProcess: string;               // How to request FASTQ/BAM/VCF
    apiAccess: boolean;
    portalUrl: string | null;
  };
  financialAssistance: {
    available: boolean;
    programName: string | null;
    url: string | null;
    description: string | null;           // "Patient financial assistance for qualifying patients"
  };
  orderingProcess: string;                // "Physician must order; patient cannot self-order"
  insuranceAccepted: string[];
  website: string;
  phone: string;
  contactEmail: string | null;
}
```

**Providers to seed (research each thoroughly):**

**Tier 1 — Major commercial labs (most patients will use one of these):**

1. **Foundation Medicine** (Roche)
   - FoundationOne CDx (324 genes, FDA-approved companion diagnostic)
   - FoundationOne Liquid CDx (liquid biopsy)
   - Foundation Medicine patient portal for results
   - Financial assistance: Foundation Medicine Patient Support

2. **Tempus**
   - Tempus xT (648 genes, one of the largest panels)
   - Tempus xF (liquid biopsy)
   - Known for integrated AI-powered insights alongside results
   - Tempus TIME trial matching integration

3. **Guardant Health**
   - Guardant360 CDx (73 genes, FDA-approved, blood-based)
   - Guardant360 TissueNext (tissue-based)
   - GuardantReveal (MRD/ctDNA monitoring — connects to survivorship module)
   - Strong liquid biopsy focus

4. **Caris Life Sciences**
   - Caris Molecular Intelligence (whole exome + whole transcriptome)
   - One of the most comprehensive panels available
   - MI Tumor Seek, MI Exome

5. **NeoGenomics**
   - NeoTYPE Discovery Profile
   - Strong in hematologic malignancies

**Tier 2 — Academic/institutional (often accessed through the treating hospital):**

6. **Memorial Sloan Kettering (MSK-IMPACT)**
   - 505-gene panel, FDA-authorized
   - Primarily for MSK patients but results are gold standard

7. **MD Anderson (OncoKB)**
   - Precision oncology knowledge base + sequencing

8. **UCSF 500 Cancer Gene Panel**

**Tier 3 — Direct-to-consumer / emerging:**

9. **Invitae** (oncology panel testing)
10. **Color Health** (hereditary cancer risk)

For each provider, also include:
- Which cancer types they specialize in
- Whether they provide raw data (FASTQ/BAM/VCF) — this matters for Phase 3
- Turn-around time
- Whether they ship sample collection kits

### 3. Provider Directory UI

Build the following pages:

**`app/sequencing/page.tsx`** — Sequencing hub landing page
- Hero: "Understanding your tumor's DNA can unlock better treatment options"
- Plain-language explainer: What is genomic sequencing? Why does it matter for you?
- Three paths:
  - "I already have sequencing results" → upload flow
  - "I want to get sequenced" → provider directory
  - "I'm not sure if I need this" → decision helper (see Session 8)

**`app/sequencing/providers/page.tsx`** — Provider comparison directory
- Filterable list/grid of sequencing providers
- Filter by: test type, cancer type, sample type (tissue vs blood), insurance accepted, raw data availability
- Sort by: cost, turnaround time, gene count
- Each provider card shows: name, primary test, gene count, turnaround, price range, insurance status
- Comparison view: select 2-3 providers to compare side-by-side

**`app/sequencing/providers/[providerId]/page.tsx`** — Provider detail page
- Full provider information
- Each test they offer with details
- Ordering process step-by-step
- Sample requirements
- Insurance + financial assistance info
- Link to provider website
- "Ask your oncologist about this test" button → generates communication template

### 4. Insurance Coverage Engine

Create `packages/sequencing-nav/src/coverage.ts`

#### Coverage Rules Database

Seed `InsuranceCoverageRule` with the following rules:

**Medicare:**
- CMS National Coverage Determination (NCD) for Next-Generation Sequencing (NGS) effective 2020:
  - Covers FDA-approved NGS companion diagnostics (FoundationOne CDx, Guardant360 CDx, MSK-IMPACT)
  - For patients with advanced cancer (recurrent, relapsed, refractory, or metastatic Stage III/IV)
  - Must have not been previously tested with the same test for the same diagnosis
  - CPT codes: 81455 (targeted genomic sequence analysis panel, 51+ genes), 0037U (FoundationOne CDx), etc.
- Medicare also covers some liquid biopsy under specific conditions

**Commercial insurers (seed top 5):**
- UnitedHealthcare, Anthem/Elevance, Aetna/CVS, Cigna, Humana
- Most cover FDA-approved companion diagnostics with prior authorization
- Coverage varies significantly for comprehensive panels vs. targeted panels
- Research each insurer's current medical policy for molecular/genomic testing

**Medicaid:**
- Varies by state — note this as requiring state-specific lookup
- Generally covers FDA-approved companion diagnostics

#### Coverage Determination Logic

```typescript
async function determineCoverage(
  patientProfile: PatientProfile,
  testType: string,
  providerTest: string,           // Specific test name (e.g., "FoundationOne CDx")
  insuranceInfo: {
    type: "commercial" | "medicare" | "medicaid" | "uninsured";
    provider?: string;            // "UnitedHealthcare"
    state?: string;               // For Medicaid
  }
): Promise<InsuranceCoverageResult> {
  // 1. Look up matching rules in InsuranceCoverageRule table
  // 2. Check cancer type + stage against rule conditions
  // 3. Determine if prior auth is required
  // 4. Generate estimated out-of-pocket cost
  // 5. List applicable CPT and ICD-10 codes
  // 6. If not covered or denied, find financial assistance alternatives
}
```

#### Letter of Medical Necessity Generator

When coverage requires prior authorization or has been denied, generate a Letter of Medical Necessity (LOMN) that the oncologist can submit:

```typescript
async function generateLetterOfMedicalNecessity(
  patientProfile: PatientProfile,
  test: SequencingProviderTest,
  coverageResult: InsuranceCoverageResult
): Promise<{
  letterText: string;              // Full LOMN text
  cptCodes: string[];
  icd10Codes: string[];
  supportingEvidence: string[];    // Clinical guidelines supporting the test
  instructions: string;            // How to submit (fax number, online portal, etc.)
}> {
  // Claude-powered generation
  // Prompt includes:
  // - Patient diagnosis, stage, subtype, treatment history
  // - Specific test being requested and why
  // - NCCN guideline recommendations for genomic testing in this context
  // - Relevant CPT and ICD-10 codes
  // - Prior auth requirements for the specific insurer
  // Output: Professional medical letter ready for oncologist signature
}
```

The LOMN should be:
- Formatted as a professional medical letter
- Include patient demographics (name, DOB, insurance ID)
- State the clinical indication clearly
- Reference NCCN guidelines
- List specific genes/biomarkers relevant to the patient's cancer
- Include CPT and ICD-10 codes
- Be downloadable as PDF and copiable as text

### 5. Insurance Coverage UI

**`app/sequencing/insurance/page.tsx`** — Insurance coverage checker

Flow:
```
Step 1: What type of insurance do you have?
  → Commercial (which provider?)
  → Medicare
  → Medicaid (which state?)
  → Uninsured / self-pay

Step 2: Which test are you considering?
  → Pre-populated from provider directory, or "I'm not sure yet"

Step 3: Coverage result
  ┌──────────────────────────────────────────────┐
  │  ✅ Likely covered                           │
  │                                              │
  │  UnitedHealthcare typically covers            │
  │  FoundationOne CDx for advanced breast        │
  │  cancer with prior authorization.             │
  │                                              │
  │  Estimated out-of-pocket: $0-250 (copay)     │
  │  Prior authorization: Required                │
  │                                              │
  │  Billing codes:                               │
  │  CPT: 81455, 0037U                           │
  │  ICD-10: C50.9 (breast cancer)               │
  │                                              │
  │  Next steps:                                  │
  │  1. Ask your oncologist to order the test     │
  │  2. The lab will handle prior auth in most    │
  │     cases (Foundation Medicine does this      │
  │     automatically)                            │
  │  3. If denied, we can generate a Letter of    │
  │     Medical Necessity                         │
  │                                              │
  │  [Generate Letter of Medical Necessity]       │
  │  [Talk to your doctor about this →]           │
  └──────────────────────────────────────────────┘
```

If coverage is unlikely or patient is uninsured, show:
- Self-pay pricing
- Financial assistance programs (link to existing Financial Assistance Finder with sequencing-specific programs filtered)
- Foundation Medicine's patient financial assistance program
- Tempus Financial Assistance Program
- State-specific programs

### 6. "Talk to Your Doctor" Communication Generator

Similar to the oncologist brief from Phase 1, but focused on sequencing:

```typescript
interface SequencingOncologistBrief {
  patientName: string;
  diagnosis: string;
  recommendedTest: string;
  testProvider: string;
  rationale: string;                // "Based on your diagnosis, genomic sequencing may identify..."
  guidelineSupport: string;         // "NCCN guidelines recommend genomic profiling for..."
  insuranceCoverage: string;        // "Your insurance is likely to cover this test"
  orderingInstructions: string;     // How the oncologist orders this specific test
  questionsToAsk: string[];         // Specific questions for the appointment
  disclaimer: string;
}
```

Output as: copy-to-clipboard, email draft, or printable PDF.

### 7. tRPC Procedures

```typescript
// sequencing.listProviders — filterable provider list
// sequencing.getProvider — full provider detail
// sequencing.compareProviders — side-by-side comparison data
// sequencing.checkCoverage — insurance coverage determination
// sequencing.generateLOMN — Letter of Medical Necessity
// sequencing.generateOncologistBrief — "talk to your doctor" communication
// sequencing.createOrder — initiate tracking of a sequencing order
// sequencing.updateOrderStatus — update order progress
```

### 8. New routes to add

```
app/sequencing/
├── page.tsx                        # Sequencing hub landing
├── providers/
│   ├── page.tsx                    # Provider directory + comparison
│   └── [providerId]/page.tsx       # Provider detail
├── insurance/
│   └── page.tsx                    # Coverage checker + LOMN generator
├── upload/
│   └── page.tsx                    # Upload existing results (Session 9)
└── results/
    └── page.tsx                    # Results interpretation (Session 9)
```

Stub the upload and results pages — we'll build those in Session 9.

### 9. Connect to existing navigation

- Add "Get your tumor sequenced" card to the patient dashboard
- Add sequencing CTA to the Treatment Translator ("Your treatment plan may benefit from genomic profiling — learn more")
- Add sequencing-related financial programs to the Financial Assistance Finder (Foundation Medicine assistance, Tempus assistance, etc.)

---END---

**Session 7 Implementation Notes:**
- Schema simplified: SequencingOrder uses `status` varchar + `insuranceCoverage` JSON instead of separate boolean/float fields
- `conditions` on InsuranceCoverageRule stored as `String[]` not `String`
- No `effectiveDate` on coverage rules (not needed for initial rule set)
- Sequencing hub page has 3 pathway cards: "I have results" / "I want sequencing" / "I'm not sure"
- Dashboard card for sequencing (linked to /sequencing) added in Session 7
- Treatment Translator already had sequencing CTA (added in Session 5)
- 10 providers seeded, 30+ insurance coverage rules seeded
- 3 new Prisma models (SequencingProvider, SequencingOrder, InsuranceCoverageRule) — 14 total

---

## SESSION 8: Sequencing Journey Wizard + Test Recommendation Engine — COMPLETED ✓

---START---

# OncoVax — Sequencing Journey Wizard + Test Recommendation Engine

This is Session 8. The provider directory and insurance coverage engine from Session 7 are in place. Now we're building the patient-facing journey — guiding someone who has never heard of genomic sequencing through understanding what it is, whether they need it, which test is right for them, and how to get it ordered.

## Design Principle

This wizard needs to take someone from "I have no idea what genomic sequencing is" to "I've asked my oncologist to order FoundationOne CDx and I know my insurance covers it" in about 10 minutes. No jargon until they're ready for it. Lead with "why this matters for you" not "how the technology works."

## What to build

### 1. Sequencing Education + Decision Helper

Build `app/sequencing/guide/page.tsx` — an interactive, personalized guide.

This is NOT a static information page. It's a Claude-powered conversational flow that uses the patient's existing profile to personalize every explanation.

**Step 1: "Should I get my tumor sequenced?"**

Use the patient's existing profile (cancer type, stage, subtype, treatment status) to generate a personalized recommendation:

```typescript
interface SequencingRecommendation {
  recommended: "strongly_recommended" | "recommended" | "optional" | "not_typically_indicated";
  reasoning: string;                      // Personalized: "For Stage IIB ER+ breast cancer, genomic..."
  whatItCouldReveal: string[];            // Specific to their cancer: "Targetable mutations like PIK3CA"
  howItHelpsRightNow: string[];           // "May qualify you for targeted therapy trials"
  howItHelpsLater: string[];              // "Enables personalized vaccine design if you recur"
  guidelineRecommendation: string;        // "NCCN recommends genomic profiling for..."
  patientStorySummary: string | null;     // Brief anonymized example of how sequencing helped
}

// Recommendation rules:
// Strongly recommended:
//   - Advanced/metastatic cancer (Stage IV)
//   - TNBC at any stage (may reveal immunotherapy targets)
//   - Any cancer that has progressed on standard therapy
//   - Patient is interested in clinical trial matching (already on platform)
// Recommended:
//   - Stage II-III breast cancer (may affect treatment decisions)
//   - Young patient (<50) with any breast cancer (higher mutation rate)
//   - Family history suggesting hereditary cancer
// Optional:
//   - Early-stage hormone-positive breast cancer with good prognosis
//   - Already completed treatment with no current disease
// Not typically indicated:
//   - DCIS (Stage 0) without invasive component
```

**Step 2: "What is genomic sequencing, in plain language?"**

Claude-generated, personalized to their education level and what they've already learned through the platform. NOT a biology lecture. More like:

"Your cancer started because some of the DNA in your cells changed — mutated — in ways that made them grow out of control. Genomic sequencing reads the DNA of your tumor to find exactly WHICH mutations are driving your cancer. This matters because some mutations have specific drugs that target them. For example, about 40% of ER+ breast cancers have a mutation called PIK3CA. If yours does, there's a targeted drug called alpelisib that's specifically designed for it."

Key UX: use the patient's OWN subtype and stage to make the explanation concrete, not abstract.

**Step 3: "Which test is right for you?"**

Personalized test recommendation engine:

```typescript
interface TestRecommendation {
  primaryRecommendation: {
    testName: string;                     // "FoundationOne CDx"
    provider: string;                     // "Foundation Medicine"
    whyThisTest: string;                  // "It's the most widely used FDA-approved panel..."
    genesCovered: number;
    relevantGenes: string[];              // Specific to their cancer: "PIK3CA, ESR1, BRCA1/2"
    turnaround: string;
    estimatedCost: string;                // From insurance check if available
    sampleRequired: string;              // "Your oncologist will need tumor tissue..."
  };
  alternatives: {
    testName: string;
    provider: string;
    whyConsider: string;                  // "Broader panel", "Blood-based (no tissue needed)", etc.
    tradeoff: string;                     // "More comprehensive but longer turnaround"
  }[];
  // If patient already has tissue available vs needs new biopsy
  tissueConsideration: {
    tissueAvailable: boolean | "unknown";
    guidance: string;                     // "If you had surgery, your hospital likely has tissue stored..."
  };
  // If liquid biopsy might be appropriate
  liquidBiopsyOption: {
    appropriate: boolean;
    reasoning: string;
    limitations: string;                  // "May miss some mutations detectable in tissue"
  };
}

// Recommendation logic:
// Default: FoundationOne CDx (broadest insurance coverage, FDA-approved, 324 genes)
// If tissue unavailable: Guardant360 CDx (liquid biopsy)
// If maximum comprehensiveness needed: Tempus xT (648 genes) or Caris MI
// If hereditary risk is the question: Invitae/Color (germline, not somatic)
// If patient wants raw data for Phase 3: Flag providers that release FASTQ/BAM
```

**Step 4: "How to talk to your oncologist"**

Generate a personalized conversation guide:
- What to say: "I'd like to discuss genomic profiling for my cancer. Based on my diagnosis, [specific test] is recommended by NCCN guidelines."
- What to expect: Their oncologist may have already ordered this, may recommend a different test, or may not think it's necessary. All are valid responses.
- If the oncologist hasn't considered it: Not a red flag — community oncologists handle many cancer types and may not routinely order genomic testing for earlier-stage breast cancer.
- Questions to ask: "Has my tumor been sent for genomic profiling?" / "Would the results change my treatment options?" / "Are there clinical trials I might qualify for based on my mutations?"

Generate both:
- A script/talking points for an in-person conversation
- An email/MyChart message template they can send before their appointment

**Step 5: "What happens next"**

Provider-specific ordering instructions:
- If FoundationOne CDx: "Your oncologist orders through Foundation Medicine's portal. They'll need your tumor tissue — if you had surgery, the pathology lab has it stored. Foundation Medicine handles insurance prior authorization automatically."
- Timeline expectations: "Results typically take 2-3 weeks"
- What to do while waiting

### 2. Sequencing Order Tracker

Once a patient has initiated sequencing (either through the wizard or by telling us they've already ordered it), provide order tracking:

**`app/sequencing/orders/page.tsx`**

```
┌─────────────────────────────────────────────────┐
│  Your sequencing order                          │
│                                                 │
│  FoundationOne CDx via Foundation Medicine      │
│  Ordered: March 20, 2026                        │
│  Expected results: April 3-10, 2026             │
│                                                 │
│  ● Ordered ─── ● Sample received ─── ○ Processing ─── ○ Complete
│                     ↑ You are here                     │
│                                                 │
│  Insurance status: ✅ Covered (prior auth approved)│
│  Estimated cost: $50 copay                      │
│                                                 │
│  While you wait:                                │
│  📋 Review your trial matches (some require     │
│     genomic results to confirm eligibility)     │
│  📖 Learn about common breast cancer mutations  │
│     and what they mean                          │
│                                                 │
│  [Update status]  [I got my results →]          │
└─────────────────────────────────────────────────┘
```

Status updates:
- Patient can manually update (since we don't have API access to most lab systems)
- If MyChart is connected, some results may flow through FHIR (DiagnosticReport resource)
- Send email reminders at expected completion date: "Your sequencing results should be available soon. Upload them when you receive them to unlock genomic trial matching."

### 3. "While You Wait" Content

While waiting for results (2-4 weeks), keep the patient engaged with relevant education:

- "Common mutations in [their cancer type] and what they mean"
- "Clinical trials that require genomic data" (preview of what matching will look like)
- "Questions to prepare for your results appointment"
- Link to Treatment Translator if they haven't used it

Generate this content via Claude, personalized to their cancer type. Store as cached content — don't regenerate every time since the base educational content for a given cancer type is the same.

### 4. Routes

```
app/sequencing/
├── guide/
│   └── page.tsx                    # Full wizard (Steps 1-5)
├── orders/
│   ├── page.tsx                    # Order list
│   └── [orderId]/page.tsx          # Order detail + tracker
└── learn/
    └── [topic]/page.tsx            # Educational content (while waiting)
```

### 5. tRPC Procedures

```typescript
// sequencing.getRecommendation — personalized sequencing recommendation
// sequencing.getTestRecommendation — which specific test for this patient
// sequencing.generateConversationGuide — "talk to your doctor" guide
// sequencing.generateEmailTemplate — email to send oncologist
// sequencing.createOrder — start tracking
// sequencing.updateOrder — status updates
// sequencing.getOrder — order details
// sequencing.getEducationalContent — personalized waiting content
```

### 6. Integration with Existing Platform

- Add "Genomic Sequencing" section to the dashboard
- Treatment Translator: add a section "Could genomic testing reveal additional treatment options?" that links to the sequencing guide
- Trial matcher: flag trials that require genomic data with "Unlock this match — get your tumor sequenced"
- Financial Assistance Finder: include sequencing-specific financial programs in matches

---END---

**Session 8 Implementation Notes:**
- Wizard is 5-step lazy-loaded (separate API call per step, avoids wasted Claude calls if user exits early)
- All Claude outputs cached in Redis (24h TTL): `seq-rec:{patientId}`, `seq-explain:{patientId}`, `conv-guide:{patientId}`, `waiting-content:{normalized_cancer_type}`
- `determineRecommendationLevel()` is a pure deterministic function (exported separately for fast use without Claude)
- Test recommendation is fully deterministic (no Claude) — queries SequencingProvider table, selects from Foundation/Guardant/Tempus triad
- Conversation guide includes ready-to-send email template with [YOUR NAME] / [DATE] placeholders
- Waiting content cached by normalized cancer type (not patient ID) since educational content is the same per cancer type
- No Prisma schema changes needed — existing SequencingOrder model has all required fields
- Dashboard updated: Sequencing card shows order count + latest status when orders exist, links to /sequencing/orders
- Sequencing hub "I'm not sure" card updated: links to /sequencing/guide instead of /sequencing/results
- Middleware updated: /sequencing/guide/:path* added to auth matcher
- No separate /learn/[topic] pages — educational content embedded directly in order tracker ("While You Wait" sections)
- 5 shared types added: SequencingRecommendation, SequencingExplanation, TestRecommendation, ConversationGuide, WaitingContent
- **New files (13):** 4 lib files, 5 API routes, 3 UI pages, 1 component
- **Modified files (5):** shared types + index, sequencing hub, dashboard, middleware
- Build verified: 0 type errors

---

## SESSION 9: Genomic Results Interpretation + Genomically-Informed Trial Matching

---START---

# OncoVax — Genomic Results Interpretation + Genomically-Informed Trial Matching

This is Session 9, the final Phase 2 session. Patients can now find sequencing providers, understand insurance coverage, and track their orders (Sessions 7-8). Now we're building the most impactful part: when results come back, we interpret them in plain language and dramatically improve trial matching precision.

## What this session unlocks

Phase 1 trial matching used clinical data only (cancer type, stage, subtype). Phase 2 matching adds genomic data (specific mutations, biomarkers, TMB, MSI status). This is the difference between "here are breast cancer vaccine trials" and "here are trials specifically for ER+/PIK3CA-mutant breast cancer with high TMB — you're likely eligible for pembrolizumab + mRNA-4157."

## What to build

### 1. Genomic Results Upload + Extraction

Build `app/sequencing/upload/page.tsx` and `app/sequencing/results/page.tsx`

**Two upload paths:**

**Path A: PDF report upload (most common)**
Foundation Medicine, Tempus, Guardant, etc. all produce PDF reports. Use the existing document ingestion pipeline (Claude Vision) with a genomics-specific extraction prompt.

```typescript
interface GenomicReportExtraction {
  // Report metadata
  provider: string;                       // "Foundation Medicine"
  testName: string;                       // "FoundationOne CDx"
  reportDate: string;
  specimenDate: string;
  specimenType: string;                   // "FFPE tissue", "Blood"

  // Mutations found
  genomicAlterations: {
    gene: string;                         // "PIK3CA"
    alteration: string;                   // "H1047R"
    alterationType: string;               // "missense_mutation", "amplification", "deletion", "fusion", "rearrangement"
    variantAlleleFrequency: number | null; // VAF %
    clinicalSignificance: string;         // "Pathogenic", "Likely pathogenic", "VUS"
    therapyImplications: {
      approvedTherapies: string[];        // FDA-approved drugs for this mutation
      clinicalTrials: string[];           // Trial-related annotations from the report
      resistanceMutations: string[];      // If this mutation confers resistance
    };
    confidence: number;                   // Extraction confidence
  }[];

  // Biomarkers
  biomarkers: {
    tmb: { value: number; unit: string; status: string } | null;        // Tumor Mutational Burden
    msi: { status: string; score: number | null } | null;               // Microsatellite Instability
    pdl1: { tps: number | null; cps: number | null } | null;           // PD-L1 expression
    loh: { status: string } | null;                                     // Loss of Heterozygosity
    hrd: { score: number | null; status: string } | null;              // Homologous Recombination Deficiency
  };

  // Germline findings (if included)
  germlineFindings: {
    gene: string;
    variant: string;
    significance: string;
  }[] | null;

  // Report-provided therapy matches (if included)
  reportTherapyMatches: {
    therapy: string;
    evidence: string;                     // "FDA-approved", "NCCN-recommended", "Clinical trial"
    gene: string;
  }[];

  // Raw text for reference
  rawText: string;
  extractionConfidence: number;
}
```

**Claude Vision extraction prompt for genomic reports:**

```typescript
const GENOMIC_REPORT_EXTRACTION_PROMPT = `
You are extracting structured genomic data from a cancer sequencing report
(e.g., Foundation Medicine, Tempus, Guardant Health).

These reports follow a consistent format:
- Header with patient info, specimen info, report date
- "Genomic Findings" or "Biomarker Findings" section listing mutations
- Each mutation shows: gene name, specific alteration, variant type
- Biomarker results: TMB, MSI, PD-L1 (not always included)
- Therapy implications: FDA-approved drugs, clinical trials
- Sometimes: germline findings

CRITICAL RULES:
- Extract EVERY genomic alteration listed, including VUS (variants of uncertain significance)
- Preserve exact notation (e.g., "PIK3CA H1047R" not "PIK3CA mutation")
- For TMB, extract the exact number AND the unit (mut/Mb)
- For MSI, extract the status (MSS, MSI-H, MSI-L)
- If the report lists therapy matches, extract those too
- Flag confidence: genomic reports are structured, so most fields should be high confidence
- If a section is not present in the report, return null — don't guess

Return JSON matching this schema: {schema}
`;
```

**Path B: Raw data upload (power users / Phase 3 pipeline)**
For patients who have VCF, BAM, or FASTQ files from their sequencing provider. This is less common but needed for Phase 3.

- Accept: .vcf, .vcf.gz, .bam, .fastq, .fastq.gz
- Upload directly to S3 via presigned URLs (files can be 1-50GB)
- Show upload progress with estimated time
- Store paths in SequencingOrder record
- Flag these files for Phase 3 pipeline when it's built

**Path C: MyChart FHIR sync (if connected)**
Some sequencing providers report results through the EHR. If the patient has MyChart connected:
- Check for new `DiagnosticReport` resources with category `genomics`
- Extract structured data from FHIR resources
- May be less detailed than the PDF report — use as supplement, not replacement

### 2. "Confirm Your Results" Flow

Same "extract and confirm" pattern as the pathology report ingestion in Phase 1:

```
┌─────────────────────────────────────────────────┐
│  We found the following from your genomic report │
│                                                 │
│  Mutations found:                      3 total  │
│                                                 │
│  PIK3CA H1047R                  ✅ confident    │
│  Missense mutation · Pathogenic                 │
│  "This mutation is found in ~40% of ER+         │
│   breast cancers. The targeted drug alpelisib    │
│   is FDA-approved for this mutation."            │
│                                                 │
│  ESR1 Y537S                     ✅ confident    │
│  Missense mutation · Pathogenic                 │
│  "This estrogen receptor mutation can cause      │
│   resistance to aromatase inhibitors."           │
│                                                 │
│  TP53 R248W                     ✅ confident    │
│  Missense mutation · Pathogenic                 │
│  "Found in many cancer types. May affect         │
│   response to certain therapies."                │
│                                                 │
│  Biomarkers:                                    │
│  TMB: 8.2 mut/Mb (Intermediate) ✅             │
│  MSI: Stable (MSS)              ✅             │
│  PD-L1: Not tested              ❌ not in report│
│                                                 │
│  [Looks right — update my matches →]            │
└─────────────────────────────────────────────────┘
```

Each mutation gets a plain-language explanation generated by Claude — what the mutation is, why it matters for their specific cancer type, and whether any approved therapies or active trials target it.

### 3. Genomic Results Interpretation Page

Build `app/sequencing/results/page.tsx` — the full interpretation experience.

This is a Treatment Translator-grade deep dive into their genomic results. Use the same two-step Claude pipeline:

**Step 1 — Clinical grounding:** Given the patient's cancer profile AND their genomic results, generate a clinical context document covering:
- Which mutations are "driver" vs "passenger" vs "VUS"
- Which mutations have FDA-approved targeted therapies
- Which mutations affect prognosis (better or worse)
- Which mutations create clinical trial eligibility
- How their mutation profile compares to typical for their subtype
- Whether any mutations suggest resistance to their current/planned treatment
- Germline implications (BRCA1/2 → cascade family testing)

**Step 2 — Patient-facing translation:** Same plain-language principles.

**Sections:**

1. **"What your results mean"** — Overview summary: "Your tumor has 3 mutations that may affect your treatment options. The most important finding is PIK3CA H1047R, which has an FDA-approved targeted therapy."

2. **"Your mutations explained"** — Each mutation with:
   - Plain-language explanation
   - Clinical significance (actionable vs. informational)
   - Available therapies
   - Relevant clinical trials (from existing trial matcher)
   - Prognosis impact if known

3. **"Your biomarker profile"** — TMB, MSI, PD-L1 with explanations of what each means for immunotherapy eligibility

4. **"What to discuss with your oncologist"** — Personalized questions based on specific findings. If PIK3CA mutant: "Ask about alpelisib (Piqray)." If high TMB: "Ask about immunotherapy options."

5. **"Updated trial matches"** — Direct link to genomically-refined trial results (see below)

### 4. Genomically-Informed Trial Matching

This is the payoff. Update the matching engine from Session 4 to incorporate genomic data.

**Update `packages/eligibility-engine/src/matcher.ts`:**

Add a new matching dimension for genomic criteria:

```typescript
interface GenomicMatchDimension {
  // New Tier 2 scoring dimension
  genomicMatch: {
    score: number;
    weight: 0.25;                         // Genomic data gets significant weight when available
    status: "match" | "unknown" | "mismatch";
    details: {
      matchedBiomarkers: {
        biomarker: string;                // "PIK3CA H1047R"
        trialRequirement: string;         // "PIK3CA mutation required"
        match: boolean;
      }[];
      matchedGenomicCriteria: {
        criterion: string;                // "TMB ≥ 10 mut/Mb"
        patientValue: string;             // "TMB: 8.2 mut/Mb"
        match: boolean;
      }[];
    };
  };
}
```

**Update eligibility parsing to capture genomic criteria:**

Many trials have genomic eligibility requirements:
- "Must have PIK3CA mutation" or "Must NOT have ESR1 mutation"
- "TMB ≥ 10 mutations/Mb"
- "MSI-High status"
- "PD-L1 CPS ≥ 10"
- "HER2 amplification"
- "BRCA1/2 germline mutation"

The Claude eligibility parser from Session 2 should already be capturing some of these in the `biomarkers` field of `ParsedEligibility`. Audit the parsed eligibility data and update the prompt if genomic criteria aren't being captured reliably.

**Matching logic:**
```typescript
function matchGenomicCriteria(
  patientGenomics: GenomicReportExtraction,
  trialEligibility: ParsedEligibility
): GenomicMatchDimension {
  // For each trial biomarker requirement:
  //   1. Check if patient has the required mutation/biomarker
  //   2. Check if patient LACKS an excluded mutation
  //   3. Check if quantitative biomarkers (TMB, PD-L1) meet thresholds
  //   4. Score accordingly

  // If patient has genomic data:
  //   - Precise matching on specific mutations and biomarkers
  //   - Much higher confidence in match scores
  //   - Can definitively rule OUT trials that require mutations the patient doesn't have

  // If patient doesn't have genomic data:
  //   - Fall back to Phase 1 behavior (score as "unknown")
  //   - Show CTA: "Get sequenced to improve your match precision"
}
```

**Re-run matching after genomic upload:**

When a patient uploads genomic results and confirms them:
1. Store the genomic data in the patient's profile
2. Re-run the full matching pipeline with genomic data included
3. Show the patient how their matches changed:
   - "3 new trials you now qualify for based on your PIK3CA mutation"
   - "2 trials ruled out — they require mutations you don't have"
   - "5 existing matches now have higher confidence scores"

### 5. Updated Oncologist Brief

Update the oncologist brief generator to include genomic context:

```typescript
interface GenomicOncologistBrief extends OncologistBrief {
  genomicSummary: {
    testPerformed: string;
    keyFindings: string[];                // "PIK3CA H1047R (actionable)", "TMB 8.2 mut/Mb"
    therapeuticImplications: string[];     // "Eligible for alpelisib", "Consider immunotherapy"
    trialMatches: {
      nctId: string;
      title: string;
      genomicBasis: string;              // "Matches because of PIK3CA mutation"
    }[];
  };
}
```

### 6. Store Genomic Data in Patient Profile

Update the Patient profile to include genomic data:

```typescript
// Add to PatientProfile
interface PatientProfile {
  // ... existing fields ...

  // Genomic data (from Phase 2)
  genomicData?: {
    testProvider: string;
    testName: string;
    testDate: string;
    alterations: GenomicAlteration[];
    biomarkers: GenomicBiomarkers;
    germlineFindings: GermlineFinding[] | null;
    rawDataAvailable: boolean;
    rawDataPath: string | null;           // S3 path for VCF/BAM if uploaded
  };
}
```

### 7. Prisma Schema Additions

```prisma
model GenomicResult {
  id                  String   @id @default(uuid())
  patientId           String
  patient             Patient  @relation(fields: [patientId], references: [id])
  orderId             String?
  order               SequencingOrder? @relation(fields: [orderId], references: [id])

  // Source
  source              String                 // document_upload, fhir, manual_entry
  documentUploadId    String?                // Reference to uploaded report
  provider            String                 // "Foundation Medicine"
  testName            String                 // "FoundationOne CDx"
  reportDate          DateTime?
  specimenDate        DateTime?

  // Extracted data
  alterations         Json                   // GenomicAlteration[]
  biomarkers          Json                   // GenomicBiomarkers
  germlineFindings    Json?                  // GermlineFinding[]
  reportTherapyMatches Json?                 // Therapy matches from the report itself

  // Raw data
  rawDataAvailable    Boolean  @default(false)
  rawDataPaths        String[]               // S3 paths for VCF/BAM/FASTQ

  // Interpretation
  interpretation      Json?                  // Claude-generated interpretation
  interpretationGeneratedAt DateTime?

  // Matching
  trialMatchingTriggered Boolean @default(false)
  matchingCompletedAt DateTime?

  // Patient confirmation
  patientConfirmed    Boolean  @default(false)
  extractionConfidence Float?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

### 8. tRPC Procedures

```typescript
// genomics.uploadReport — trigger extraction from uploaded PDF
// genomics.getExtractionResult — poll for extraction completion
// genomics.confirmResults — patient confirms extracted data
// genomics.getInterpretation — full plain-language interpretation
// genomics.generateInterpretation — trigger Claude interpretation pipeline
// genomics.triggerRematch — re-run trial matching with genomic data
// genomics.getMatchDelta — show what changed after genomic matching
// genomics.generateOncologistBrief — updated brief with genomic context
// genomics.uploadRawData — presigned URL for VCF/BAM upload
```

### 9. End-to-End Test

Test the full Phase 2 flow:
1. Patient goes through sequencing guide wizard
2. Gets test recommendation for their cancer type
3. Checks insurance coverage → sees it's likely covered
4. Downloads "talk to your doctor" communication
5. Creates a sequencing order and tracks it
6. Uploads their genomic report PDF when results arrive
7. Reviews extracted mutations with plain-language explanations
8. Confirms results
9. Sees updated trial matches with genomic precision
10. Generates an updated oncologist brief with genomic context

→ PHASE 2 IS COMPLETE

The patient now has: clinical profile (Phase 1) + genomic profile (Phase 2) + precise trial matching + treatment translation + financial assistance. They're ready for Phase 3 (neoantigen prediction pipeline) when it's built.

---END---

---

## What comes next

After Sessions 7-9, Phase 2 is complete. The platform now covers the full journey from diagnosis through genomic profiling, with increasingly precise trial matching at each step.

**Phase 3 sessions (neoantigen prediction pipeline) — when ready:**
- Session 10: Compute infrastructure + alignment pipeline (Rust)
- Session 11: Variant calling + HLA typing (Rust wrappers)
- Session 12: Neoantigen prediction + ranking (Python)
- Session 13: AlphaFold integration + mRNA designer (Python)
- Session 14: Report generation + pipeline UI
- Session 15: NATS JetStream orchestration + end-to-end testing

Let me know when you want Phase 3 session prompts generated.
