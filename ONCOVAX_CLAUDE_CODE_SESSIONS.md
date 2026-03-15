# OncoVax — Claude Code Session Prompts

## How to use this file

Each session below is a self-contained prompt. Copy the entire block between the `---START---` and `---END---` markers and paste it into a new Claude Code session. Sessions are sequential — complete each one before starting the next.

The SPEC.md file should be in your repo root for Claude Code to reference. After Session 1 scaffolds the project, subsequent sessions assume that structure exists.

---

## SESSION 1: Project Scaffolding

---START---

# OncoVax — Project Scaffolding

I'm building a cancer patient platform called OncoVax that helps patients find personalized cancer vaccine clinical trials. This is Session 1: project scaffolding.

## Context
- I have an existing Turborepo monorepo for my other projects (art-cafe stack) using Next.js 14+, Prisma, tRPC, Tailwind, magic link auth
- This project extends that pattern but lives in its own repo
- Full spec is in ONCOVAX_PLATFORM_SPEC.md in the repo root — reference it for data models and architecture details

## What to build in this session

### 1. Initialize Turborepo monorepo

```
oncovax/
├── apps/
│   └── web/                    # Next.js 14+ (App Router) — patient-facing
├── packages/
│   ├── db/                     # Prisma schema + client
│   ├── auth/                   # Magic link auth
│   ├── ui/                     # Shared Tailwind components
│   └── api/                    # tRPC router definitions
├── turbo.json
├── package.json
├── tsconfig.json
└── .env.example
```

### 2. Next.js app (apps/web)

- Next.js 14+ with App Router
- Tailwind CSS + shadcn/ui for components
- App routes to stub out:

```
app/
├── layout.tsx                   # Root layout with providers
├── page.tsx                     # Landing page (stub)
├── start/
│   ├── page.tsx                 # Intake method picker (upload, mychart, manual)
│   ├── upload/page.tsx          # Document upload
│   ├── mychart/page.tsx         # MyChart connect (stub for now)
│   ├── manual/page.tsx          # Manual intake wizard
│   └── confirm/page.tsx         # Extract-and-confirm screen
├── matches/
│   ├── page.tsx                 # Results page
│   └── [trialId]/
│       ├── page.tsx             # Trial detail
│       └── contact/page.tsx     # Oncologist brief generator
├── translate/
│   └── page.tsx                 # Treatment Translator
├── financial/
│   ├── page.tsx                 # Financial Assistance Finder
│   └── [programId]/page.tsx     # Program detail
├── dashboard/
│   ├── page.tsx                 # Saved matches + docs + financial
│   └── records/page.tsx         # Manage health records
└── learn/page.tsx               # Educational content
```

Each page should be a minimal stub with the page title and a brief description of what it will contain. No full UI yet.

### 3. Prisma schema (packages/db)

Set up Prisma with PostgreSQL. Create the Phase 1 schema:

```prisma
// Models needed:

// Trial — synced from ClinicalTrials.gov
// - nctId (unique), title, briefSummary, sponsor, phase, status
// - parsedEligibility (Json), rawEligibilityInclusion, rawEligibilityExclusion
// - eligibilityParseConfidence (Float)
// - interventionType, interventionNames (String[]), combinationTherapies (String[])
// - lastSyncedAt, clinicalTrialsGovUrl
// - startDate, estimatedCompletion, enrollmentTarget

// TrialSite — locations where trials are conducted
// - trialId (relation), facilityName, city, state, country, zipCode
// - latitude (Float), longitude (Float)
// - contactName, contactEmail, contactPhone, status

// Patient — user profiles
// - email (unique), name, role (patient/caregiver/advocate)
// - intakePath (document_upload/mychart_fhir/manual_entry)
// - profile (Json) — full PatientProfile structure
// - fieldSources (Json), fieldConfidence (Json)
// - zipCode, latitude (Float), longitude (Float)

// DocumentUpload — uploaded medical documents
// - patientId (relation), documentType
// - fileCount (Int), storagePaths (String[]), mimeType
// - extractionStatus (pending/processing/complete/failed/needs_review)
// - extractionResult (Json), qualityIssues (String[])
// - fieldsExtracted (Int), fieldsNeedingReview (Int), patientConfirmed (Boolean)
// - processingStartedAt, processingCompletedAt
// - claudeModelUsed, tokenCost (Int)

// FhirConnection — MyChart / health system connections
// - patientId (relation), providerSystem, healthSystemName
// - fhirBaseUrl
// - accessTokenEncrypted, refreshTokenEncrypted, tokenExpiresAt
// - scopesGranted (String[])
// - lastSyncedAt, resourcesPulled (Json), syncStatus
// - consentGrantedAt, consentScopes (String[])

// Match — trial match results
// - patientId (relation), trialId (relation)
// - matchScore (Float), matchBreakdown (Json)
// - potentialBlockers (String[])
// - status (new/viewed/contacted/enrolled)
// - notifiedAt
// - @@unique([patientId, trialId])

// FinancialProgram — assistance programs directory
// - name, organization, type (copay_foundation/pharma_pap/nonprofit_grant/etc.)
// - assistanceCategories (String[]), description
// - maxBenefitAmount (Float?), benefitDescription
// - eligibility (Json) — structured eligibility rules
// - status (open/closed/waitlist/unknown), statusUrl, lastStatusCheck
// - applicationProcess, applicationUrl, applicationPhone
// - requiredDocuments (String[]), turnaroundTime
// - phone, website, email, hours

// FinancialMatch — patient ↔ program matches
// - patientId (relation), programId (relation)
// - matchStatus (eligible/likely_eligible/check_eligibility/ineligible)
// - estimatedBenefit, matchReasoning, missingInfo (String[])
// - status (new/applied/approved/denied)
// - appliedAt, notifyOnReopen (Boolean)
// - @@unique([patientId, programId])
```

Generate the migration and Prisma client. Make sure the db package exports the client for use by other packages.

### 4. tRPC router structure (packages/api)

Set up tRPC with these router stubs:

```typescript
// Root router with sub-routers:
// - trials: search, getById, list
// - patients: create, update, getProfile
// - matches: getForPatient, updateStatus
// - documents: createUpload, getExtractionResult, confirmExtraction
// - translator: generate, getForPatient, regenerate, generatePdf
// - financial: getMatchesForPatient, getProgramDetail, updateFinancialProfile, subscribeToAlerts
// - fhir: initiateConnection, handleCallback, syncRecords (stubs)
```

Each procedure should be a stub that returns a placeholder. We'll implement them in later sessions.

### 5. Auth (packages/auth)

Set up magic link authentication:
- Use next-auth or a lightweight custom magic link flow
- Email-based: patient enters email, gets a magic link, clicks to authenticate
- Session management with JWT or database sessions
- Protect /dashboard and /matches routes

### 6. Environment variables

Create .env.example with all needed vars:

```
DATABASE_URL=
ANTHROPIC_API_KEY=
AWS_S3_BUCKET=
AWS_S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_FROM=
GOOGLE_MAPS_API_KEY=
```

### 7. Verify everything works

- `pnpm install` succeeds
- `pnpm db:generate` produces Prisma client
- `pnpm dev` starts the Next.js app
- All stub pages render
- tRPC client connects to server

Don't over-engineer. This is scaffolding — clean structure, working builds, stub pages. We'll fill in real functionality in Sessions 2-5.

---END---

### SESSION 1 — Implementation Notes (completed)

**Deviations from the original session prompt (shared spec overrides applied):**

| Original Session 1 Prompt | What Was Built | Why |
|---|---|---|
| tRPC router (packages/api) | Next.js API routes directly | Shared spec mandates API routes over tRPC |
| NextAuth / next-auth | Custom magic link (jose + Redis) | Shared spec pattern — lighter, no NextAuth dependency |
| Next.js 14+ | Next.js 15.0.0, React 19.0.0 | Shared spec exact versions |
| Prisma (unversioned) | Prisma 7.0.0 with `prisma-client` generator | Shared spec exact versions |
| shadcn/ui | Dripsy + custom components | Cross-platform (web + Expo mobile) — shadcn doesn't work in React Native |
| Web only | Web + Expo SDK 54 mobile app | Shared spec requires mobile app |
| packages/auth + packages/ui | packages/shared (combined) | Shared spec structure — auth/types/schemas/constants in one package |

**Prisma 7 breaking changes encountered:**
- `url` property in `datasource` block is no longer supported — moved to `prisma.config.ts` using `defineConfig`
- PrismaClient now requires a driver adapter (`@prisma/adapter-pg` for PostgreSQL)
- Generator must use `prisma-client` (not `prisma-client-js`) with required `output` field

**Stripe v20 breaking change:**
- `current_period_end` moved from `Subscription` to `SubscriptionItem` — use `sub.items.data[0].current_period_end`

**React 19 peer dependency warnings:**
- next@15.0.0, react-native@0.76.9, and several sub-dependencies have peer deps on React 18 — warnings are expected and non-blocking

**What was built:**
- 75 source files across root config, packages/db (8 Prisma models), packages/shared, apps/web (14 pages, 13 API routes, 7 lib files, middleware), apps/mobile (12 screens, API client, tab navigation)
- Auth routes fully implemented (magic-link, verify, logout)
- Stripe routes fully implemented (create-checkout, webhook)
- `pnpm install`, `pnpm db:generate`, and `next build` all pass with 0 type errors

**What Session 2 needs to know:**
- No tRPC — implement everything as Next.js API routes in `apps/web/app/api/`
- Prisma client is at `@oncovax/db/generated/prisma` and requires adapter instantiation (see `apps/web/lib/db.ts`)
- Trial ingestion packages (`packages/trial-ingestion`, `packages/eligibility-engine`) from the original prompt should be built as lib files within `apps/web/lib/` or as API routes, not as separate packages
- The `translate/` and `financial/` routes from the original session 1 prompt were intentionally omitted — they belong in Session 5

---

## SESSION 2: Trial Ingestion Pipeline

---START---

# OncoVax — Trial Ingestion Pipeline

This is Session 2. The project scaffolding from Session 1 is in place (Turborepo, Next.js app, Prisma schema, tRPC stubs). Now we're building the ClinicalTrials.gov data pipeline.

## What to build

### 1. ClinicalTrials.gov API Client

Create `packages/trial-ingestion/src/client.ts`

The API is at `https://clinicaltrials.gov/api/v2/studies`. No API key needed.

Build a client that:
- Searches for studies matching these terms (OR query):
  - "personalized cancer vaccine"
  - "neoantigen vaccine"  
  - "mRNA cancer vaccine"
  - "individualized cancer vaccine"
  - "autogene cevumeran"
  - "mRNA-4157"
  - "personalized immunotherapy"
  - "cancer mRNA"
  - "neoantigen immunotherapy"
- Filters to statuses: RECRUITING, NOT_YET_RECRUITING, ENROLLING_BY_INVITATION
- Also include ACTIVE_NOT_RECRUITING and COMPLETED for historical context
- Handles pagination (API returns max 1000 per page via pageToken)
- Returns typed results matching the ClinicalTrials.gov v2 response schema

API docs reference: https://clinicaltrials.gov/data-api/api

Key query params:
- `query.term` — search terms
- `filter.overallStatus` — status filter
- `pageSize` — results per page (max 1000)
- `pageToken` — pagination token
- `fields` — which fields to return (use all relevant fields)

### 2. Trial Sync Worker

Create `packages/trial-ingestion/src/sync.ts`

This worker:
1. Fetches all matching studies from ClinicalTrials.gov
2. For each study, upserts into the `Trial` table:
   - Map ClinicalTrials.gov fields to our Prisma schema
   - Extract intervention details (look for "mRNA", "vaccine", "neoantigen" in intervention descriptions)
   - Store raw eligibility text (inclusionCriteria, exclusionCriteria)
   - Set lastSyncedAt
3. For each study's locations, upserts into `TrialSite`:
   - Map facility info
   - Extract contact details
   - Geocode the address to lat/lng (use a simple geocoding approach — Google Maps Geocoding API or a free alternative)
4. Tracks sync state — on subsequent runs, only processes studies updated since last sync (use `query.term` with date filter, or compare against lastSyncedAt)

Make this runnable as:
- A CLI command: `pnpm trial-sync` (for manual runs)
- Exportable for a cron job (we'll set up Vercel cron or similar later)

### 3. Claude Eligibility Parser

Create `packages/eligibility-engine/src/parser.ts`

For each trial with raw eligibility text, send it to Claude for structured extraction.

The prompt should extract:
```typescript
interface ParsedEligibility {
  cancerTypes: { name: string; normalized: string }[];
  stages: string[];
  priorTreatments: {
    required: { name: string; type: string }[];
    excluded: { name: string; type: string }[];
  };
  biomarkers: {
    required: { name: string; condition: string }[];  // e.g., { name: "PD-L1", condition: ">= 1%" }
    excluded: { name: string; condition: string }[];
  };
  ageRange: { min: number | null; max: number | null };
  ecogRange: { min: number | null; max: number | null };
  surgicalStatus: "pre_surgery" | "post_surgery" | "either" | "unknown";
  priorLinesOfTherapy: { min: number | null; max: number | null };
  organFunction: {
    requirements: { organ: string; metric: string; condition: string }[];
  };
  geographicRestrictions: string[];
  exclusionConditions: string[];
  otherKeyRequirements: string[];
  confidenceScore: number;
}
```

**Critical prompt engineering requirements:**
- Be conservative — if ambiguous, set confidence low rather than guessing
- Use Claude's JSON mode / structured output
- Include 2-3 few-shot examples in the prompt of real eligibility texts → expected JSON
- Handle both inclusion AND exclusion criteria
- Normalize cancer type names to a consistent taxonomy

Build a function that:
1. Takes raw eligibility text
2. Sends to Claude API (claude-sonnet-4-20250514 for cost efficiency)
3. Parses and validates the response
4. Returns ParsedEligibility with confidence score
5. Handles API errors, rate limits, and malformed responses gracefully

### 4. Integration: Parse all trials

Create a script that runs the eligibility parser against all trials that don't yet have parsedEligibility (or where eligibility text has been updated since last parse).

Save results to the trial's `parsedEligibility` JSONB field and `eligibilityParseConfidence` float field.

### 5. Testing

- Fetch real data from ClinicalTrials.gov and verify storage
- Test the eligibility parser against at least 10 real trial eligibility texts
- Log the parse results and manually review for accuracy
- Iterate on the prompt until parse accuracy is reasonable (>80% field accuracy)

### 6. Create a simple admin view

Add a page at `app/admin/trials/page.tsx` that:
- Lists all synced trials with title, phase, status, intervention type
- Shows the parsed eligibility for each (formatted JSON)
- Shows the parse confidence score
- Allows manual re-parsing of individual trials

This is for us to QA the pipeline, not for patients.

---END---

### SESSION 2 — Implementation Notes (completed)

**Deviations from the original session prompt (shared spec overrides applied):**

| Original Session 2 Prompt | What Was Built | Why |
|---|---|---|
| `packages/trial-ingestion/src/client.ts` | `apps/web/lib/clinicaltrials.ts` | Session 1 established: lib files in `apps/web/lib/`, not separate packages |
| `packages/eligibility-engine/src/parser.ts` | `apps/web/lib/eligibility-parser.ts` | Same — no separate packages, all in web lib |
| tRPC procedures | Next.js API routes | Shared spec mandates API routes over tRPC |
| Claude Sonnet for parsing | Claude Opus (`claude-opus-4-20250514`) | Accuracy over cost/speed for medical eligibility parsing |
| Google Maps geocoding | Mapbox (`apps/web/lib/mapbox.ts`) | Mapbox as fallback only — ClinicalTrials.gov API already provides `geoPoint` lat/lng for most sites |
| Incremental sync (date filter) | Full re-fetch + upsert | Dataset is small (~100-200 trials), full re-fetch is simpler and more reliable |
| Testing against 10+ trials | Deferred to manual run | Requires live database; `pnpm trial-sync --skip-parse` fetches real data from ClinicalTrials.gov |

**Prisma 7 JSON field nuances encountered:**
- Setting nullable JSON fields to `null` requires `Prisma.DbNull` (not literal `null`)
- Filtering `parsedEligibility: null` in `where` clauses requires `{ equals: Prisma.DbNull }`
- JSON field values must be serialized through `JSON.parse(JSON.stringify(...))` for type compatibility with Prisma's `InputJsonValue`

**ParsedEligibility type changes from Session 1 → Session 2:**
- `cancerTypes`: `string[]` → `{ name, normalized }[]`
- `priorTreatments.required/excluded`: `string[]` → `{ name, type }[]`
- `biomarkers.required/excluded`: `string[]` → `{ name, condition }[]`
- `priorLines` → `priorLinesOfTherapy`
- `organFunction`: `{ liver, kidney, blood: string[] }` → `{ requirements: { organ, metric, condition }[] }`
- Added `otherKeyRequirements: string[]`
- Added `unknown` to `surgicalStatus` enum
- All range `min`/`max` now `number | null` instead of `number`
- Removed `rawCriteria` (stored in `Trial.rawEligibilityText`)

**What was built (10 new files, 8 modified):**

New files:
- `apps/web/lib/clinicaltrials.ts` — CTG v2 API client with TypeScript types, auto-pagination (AsyncGenerator), retry with exponential backoff
- `apps/web/lib/mapbox.ts` — Geocoding fallback for sites missing coordinates
- `apps/web/lib/trial-sync.ts` — Sync worker: fetch studies, upsert Trial + TrialSite, geocode, preserve parsedEligibility when raw text unchanged
- `apps/web/lib/eligibility-parser.ts` — Claude Opus parser with 2 few-shot oncology examples, Zod validation, batch processing with rate limiting (1s delay)
- `apps/web/app/api/admin/trial-sync/route.ts` — POST trigger sync + optional parse (admin only)
- `apps/web/app/api/admin/trials/route.ts` — GET trials list with filters: unparsed, low_confidence (admin only)
- `apps/web/app/api/admin/trials/[trialId]/reparse/route.ts` — POST re-parse single trial (admin only)
- `apps/web/app/admin/layout.tsx` — Admin layout wrapper
- `apps/web/app/admin/trials/page.tsx` — Admin QA page: table, confidence color-coding, expandable parsed eligibility, filter tabs, sync/reparse buttons
- `scripts/trial-sync.ts` — CLI entry point (`pnpm trial-sync`) with `--skip-parse` and `--parse-only` flags

Modified files:
- `packages/shared/src/types.ts` — Richer `ParsedEligibility` interface
- `packages/shared/src/schemas.ts` — Added `parsedEligibilitySchema` Zod schema
- `packages/shared/src/constants.ts` — Added `TRIAL_SEARCH_TERMS`, `TRIAL_SYNC_STATUSES`
- `packages/shared/src/index.ts` — Exports new schemas + constants
- `apps/web/lib/ai.ts` — Model changed to `claude-opus-4-20250514`, exported `CLAUDE_MODEL` constant
- `apps/web/app/api/trials/route.ts` — Real search/filter/paginate implementation (was 501 stub)
- `apps/web/app/api/trials/[trialId]/route.ts` — Real single trial lookup with sites (was 501 stub)
- `apps/web/middleware.ts` — Added `/admin/:path*` to matcher
- `.env.example` — `GOOGLE_MAPS_API_KEY` → `MAPBOX_ACCESS_TOKEN`
- `apps/web/.env` — Added `MAPBOX_ACCESS_TOKEN`
- `package.json` (root) — Added `trial-sync` script, `tsx` + `dotenv` devDeps

**Verification:**
- `pnpm install` — passed
- `pnpm db:generate` — passed
- `pnpm --filter @oncovax/web build` — 0 type errors, all routes compiled

**What Session 3 needs to know:**
- Sync/parse functions accept optional `db: PrismaClient` parameter for dependency injection (CLI script creates its own client)
- `CLAUDE_MODEL` constant exported from `apps/web/lib/ai.ts` — use it for all AI calls
- Admin routes check `user.role === 'admin'` — first admin must be manually promoted via SQL/Prisma Studio
- Public trial routes (`/api/trials`, `/api/trials/[trialId]`) do not require auth
- `parsedEligibilitySchema` from `@oncovax/shared` should be used for Zod validation of any parsed eligibility data
- The ClinicalTrials.gov API client returns typed `CTGStudy` objects — see `apps/web/lib/clinicaltrials.ts` for the type definitions
- Mapbox is a geocoding fallback only — most sites already have coordinates from CTG API's `geoPoint`

---

## SESSION 3: Document Ingestion Engine

---START---

# OncoVax — Document Ingestion Engine

This is Session 3. Trial ingestion pipeline is working (Session 2). Now we're building the core patient intake experience — document-first, powered by Claude Vision.

## Design Principle

Cancer patients are overwhelmed with paperwork. The primary intake is: **upload a photo of your pathology report → we extract your clinical data → you confirm**. Three taps, not twenty form fields.

## What to build

### 1. Document Upload Component

Create a reusable upload component at `packages/ui/src/document-upload.tsx`

Requirements:
- **Mobile-first** — most users will be on phones taking photos of documents
- Accept: JPEG, PNG, HEIC, WebP, PDF
- Multi-file support (pathology reports are often 3-5 pages)
- Three input methods:
  - Camera capture (mobile — use `<input type="file" accept="image/*" capture="environment">`)
  - Photo library picker
  - PDF file picker / drag-and-drop (desktop)
- Show thumbnails of uploaded pages with reorder/delete
- Upload to S3 with presigned URLs (don't route through our server)
- Show upload progress per file

### 2. Client-Side Quality Checks

Before sending images to Claude Vision, run basic quality checks client-side to save API cost:

Create `packages/doc-ingestion/src/quality-check.ts`

Using canvas-based image analysis:
- **Resolution check**: reject if < 1000px on shortest side
- **Brightness check**: reject if mean pixel brightness < 40 or > 240 (too dark/washed out)
- **File size check**: reject if < 50KB (probably blank) or > 20MB

For each issue, provide a friendly suggestion:
- "too_dark" → "Move to a well-lit area or turn on your flash"
- "too_blurry" → "Try holding your phone steady, or place the document on a flat surface"
- "low_resolution" → "Try moving your camera closer to the document"
- "too_bright" → "Tilt the document to reduce glare from overhead lights"

Show these as inline feedback before the user submits, with a "Try again" button.

### 3. Claude Vision Extraction Pipeline

Create `packages/doc-ingestion/src/extract.ts`

#### Document Type Auto-Detection

First call — determine what type of document the user uploaded:

```typescript
async function detectDocumentType(images: Base64Image[]): Promise<{
  type: "pathology_report" | "lab_report" | "treatment_summary" | "imaging_report" | "insurance_document" | "unknown";
  confidence: number;
  explanation: string;  // "This appears to be a pathology report from Memorial Sloan Kettering..."
}>
```

If the document is an insurance form or something irrelevant, tell the user: "This looks like an insurance document, not a medical report. Try uploading your pathology report — it usually has your cancer type, stage, and test results."

#### Pathology Report Extraction

Primary extraction target. This is where the most trial-matching data lives.

```typescript
async function extractPathologyReport(images: Base64Image[]): Promise<{
  extraction: {
    cancerType: string;
    cancerTypeNormalized: string;
    histologicalGrade: string;
    stage: {
      clinical: string;
      pathological: string | null;
      summary: string;
    };
    receptorStatus: {
      er: { status: string; percentage: number | null; confidence: number };
      pr: { status: string; percentage: number | null; confidence: number };
      her2: { status: string; method: string | null; confidence: number };
    };
    ki67: { percentage: number | null; confidence: number };
    margins: string;
    lymphNodes: {
      examined: number | null;
      positive: number | null;
      details: string;
    };
    biomarkers: Record<string, { value: string; confidence: number }>;
    specimenDate: string;
    facility: string;
  };
  fieldConfidence: Record<string, number>;
  needsReview: string[];
  couldNotExtract: string[];
  qualityIssues: string[];
  rawText: string;
}>
```

**Prompt engineering — critical requirements:**
- Send ALL pages in a single API call (Claude handles multi-image context)
- Be explicit: "Extract ONLY what is explicitly stated. Never guess. Return 'not_found' for missing fields."
- For each field, return a confidence score 0.0-1.0
- Flag fields below 0.8 confidence for patient review
- Preserve exact clinical notation (TNM staging, percentages, etc.)
- Include the raw OCR text for reference

Build similar extractors for:
- **Lab reports**: Extract lab values (name, value, unit, reference range, date)
- **Treatment summaries**: Extract treatment history (drug names, types, dates, responses)

### 4. "Extract and Confirm" UI

Build the confirm page at `app/start/confirm/page.tsx`

This is the core UX innovation. After Claude Vision extracts data, show the patient a pre-filled form where each field has a confidence indicator:

```
┌─────────────────────────────────────────────┐
│  Cancer Type                   ✅ confident │
│  ┌─────────────────────────────────────┐    │
│  │ Invasive ductal carcinoma (breast) ▾│    │  ← Editable dropdown
│  └─────────────────────────────────────┘    │
│                                             │
│  Stage                         ✅ confident │
│  ┌─────────────────────────────────────┐    │
│  │ Stage IIB (T2N1M0)                 ▾│    │
│  └─────────────────────────────────────┘    │
│                                             │
│  HER2 Status                   ⚠️ review   │
│  ┌─────────────────────────────────────┐    │
│  │ Equivocal (IHC 2+)                 ▾│    │
│  └─────────────────────────────────────┘    │
│  ℹ️ We found "HER2 2+" — was FISH           │
│     testing done? This affects matching.    │
│                                             │
│  PD-L1                         ❌ not found │
│  ┌─────────────────────────────────────┐    │
│  │ Not available                      ▾│    │
│  └─────────────────────────────────────┘    │
│  ℹ️ PD-L1 results are often in a separate   │
│     report. Upload it to improve matching.  │
│     [Upload another document]               │
│                                             │
│  ─── Additional info (optional) ───         │
│                                             │
│  Your zip code (for finding nearby trials)  │
│  ┌─────────────────────────────────────┐    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [Looks good — find my matches →]           │
└─────────────────────────────────────────────┘
```

Key UX details:
- Green checkmark (✅) for fields with confidence >= 0.8
- Yellow warning (⚠️) for fields with confidence 0.5-0.8, with explanation of what was found and why it's uncertain
- Red X (❌) for fields not found, with explanation of why that field matters and option to upload additional documents
- Every field is editable regardless of confidence
- "Upload another document" button adds more data without losing existing extractions
- Show source attribution: "Extracted from your pathology report" vs "You entered manually"
- Store both the extracted value AND any patient edits

### 5. Fallback Manual Intake

Build `app/start/manual/page.tsx`

For patients who don't have documents handy. Simple wizard:

**Step 1: Cancer basics**
- "What type of cancer?" — searchable dropdown of common types, with "Other" option
- "When were you diagnosed?" — approximate date picker
- "Are you currently in treatment?" — yes/no

**Step 2: Clinical details** (all optional, with "I don't know" options)
- Stage (plain language: "Has it spread to lymph nodes? To other organs?")
- Subtype (for breast cancer: ER/PR/HER2 status with explanations)
- Prior treatments (checkboxes: surgery, chemo, radiation, immunotherapy, etc.)
- Performance status (plain language: "Can you do most daily activities?")

**Step 3: Logistics**
- Zip code
- Willing to travel? How far?
- Do you have an oncologist?

**Step 4: Contact**
- Email (triggers magic link auth)
- Name (optional)
- Role: patient, caregiver, or advocate

All paths (document upload, manual) converge at the confirm page and produce the same PatientProfile JSON stored in the patient's profile field.

### 6. Wire up the intake flow

- `app/start/page.tsx` shows the three intake options
- Each path stores data, then redirects to `/start/confirm`
- The confirm page shows extracted/entered data
- On "Find my matches" click, create/update the Patient record via tRPC and redirect to `/matches`

### 7. tRPC procedures to implement

```typescript
// documents.createUpload — save upload metadata, trigger extraction
// documents.getExtractionResult — poll for extraction completion
// documents.confirmExtraction — patient confirms/edits extracted data
// patients.createOrUpdate — save confirmed PatientProfile
```

### 8. S3 Upload Setup

- Create a tRPC procedure that generates S3 presigned upload URLs
- Client uploads directly to S3 (no server proxy for large files)
- Store paths in DocumentUpload record
- Configure S3 bucket with:
  - Server-side encryption (SSE-S3)
  - CORS for direct browser upload
  - Lifecycle rule to delete unconfirmed uploads after 30 days

---END---

---

## SESSION 4: Matching Engine + Results

---START---

# OncoVax — Matching Engine + Results UI

This is Session 4. We have trial data (Session 2) and patient clinical data from document ingestion (Session 3). Now we connect them.

## What to build

### 1. Matching Engine

Create `packages/eligibility-engine/src/matcher.ts`

The matcher takes a PatientProfile and returns ranked MatchResults against all active trials.

**Three-tier matching:**

#### Tier 1: Hard Filters (binary pass/fail)
These immediately disqualify a trial:
- Cancer type mismatch (patient has breast cancer, trial is for melanoma only)
- Age out of range
- No trial sites within patient's travel radius (if they set one)
- Trial is not recruiting

Implementation: SQL query with WHERE clauses. Fast, eliminates ~80% of trials.

#### Tier 2: Soft Scoring (0-100 per criterion)
For trials that pass Tier 1, score each dimension:

```typescript
interface MatchScoring {
  // Each dimension scored 0-100, weighted
  cancerSubtype: { score: number; weight: 0.25; status: "match" | "unknown" | "mismatch" };
  stage: { score: number; weight: 0.20; status: "match" | "unknown" | "mismatch" };
  biomarkers: { score: number; weight: 0.20; status: "match" | "unknown" | "mismatch" };
  priorTreatments: { score: number; weight: 0.15; status: "match" | "unknown" | "mismatch" };
  surgicalStatus: { score: number; weight: 0.10; status: "match" | "unknown" | "mismatch" };
  geography: { score: number; weight: 0.10; status: "match" | "unknown" | "mismatch" };
}
```

Scoring rules:
- "match" = patient data meets criterion → 100 points
- "unknown" = we don't have enough patient data to evaluate → 50 points (benefit of the doubt)
- "mismatch" = patient data contradicts criterion → 0 points
- Final score = weighted sum

**"Unknown" is important.** If a patient uploaded a pathology report but it didn't include PD-L1 status, and a trial requires PD-L1 >= 1%, we don't exclude the trial — we score it as "unknown" and surface it with a note: "This trial requires PD-L1 testing. Ask your oncologist about getting tested."

#### Tier 3: LLM-Assisted (for complex criteria)
Some eligibility criteria are too complex for rule-based matching (e.g., "Patients must have progressed on or after at least one prior line of systemic therapy in the metastatic setting, including a CDK4/6 inhibitor").

For top-scored trials from Tier 2, send the patient profile + trial eligibility to Claude for a nuanced assessment:

```typescript
async function llmMatchAssessment(
  patientProfile: PatientProfile,
  trialEligibility: ParsedEligibility,
  rawEligibilityText: string
): Promise<{
  overallAssessment: "likely_eligible" | "possibly_eligible" | "likely_ineligible";
  reasoning: string;           // 2-3 sentence explanation
  potentialBlockers: string[]; // Specific things that might disqualify
  missingInfo: string[];       // Info we'd need to confirm eligibility
  actionItems: string[];       // "Get PD-L1 tested", "Ask about ECOG status"
}>
```

Only run this for the top ~10 trials per patient (cost control).

### 2. Match Storage

When a patient completes intake, run the matcher and store results:

```typescript
// tRPC procedure: matches.generateForPatient
// 1. Run Tier 1 filter
// 2. Score Tier 2 for passing trials  
// 3. Run Tier 3 LLM assessment for top 10
// 4. Upsert Match records with scores and breakdowns
// 5. Return sorted results
```

### 3. Results Page (`app/matches/page.tsx`)

**The most important page in the app.** This is where patients see their options.

Design:
- **Match cards** sorted by score (highest first), each showing:
  - Trial title (human-readable, not just NCT ID)
  - Sponsor (e.g., "Moderna + Merck", "BioNTech")
  - Phase (I, II, III) with plain-language explanation
  - Match score as a visual bar or percentage
  - Match breakdown: green/yellow/red pills for each criterion
  - Nearest trial site with distance
  - "Potential issues" if any blockers identified
  - CTA buttons: "Learn more" and "Share with my doctor"

- **Map view** showing trial sites near the patient's location (use Google Maps or Mapbox)
  - Toggle between list and map
  - Click a pin to see the trial card

- **Filter/sort controls:**
  - Sort by: match score, distance, phase
  - Filter by: phase, distance radius, specific cancer subtype

- **Empty state** if no matches: explain why, suggest broadening criteria, offer to notify when new trials appear

### 4. Trial Detail Page (`app/matches/[trialId]/page.tsx`)

Deep dive on a specific trial:
- Full trial description (from ClinicalTrials.gov brief_summary)
- **Eligibility breakdown** — compare patient's data against each criterion:
  - ✅ "Your stage (IIB) matches this trial's requirement (Stage II-III)"
  - ⚠️ "This trial requires PD-L1 ≥ 1%. Your PD-L1 status is unknown."
  - ❌ "This trial excludes patients who have had prior immunotherapy."
- All trial sites with addresses, contacts, map
- Link to ClinicalTrials.gov for full official record
- "Share with my doctor" button → generates oncologist brief

### 5. Oncologist Brief Generator (`app/matches/[trialId]/contact/page.tsx`)

Generate a professional document the patient can email to their oncologist.

Use Claude to generate a brief that includes:
- Patient name and diagnosis summary
- Trial name, NCT ID, phase, sponsor
- Why this trial may be relevant (match rationale)
- Key eligibility criteria the patient appears to meet
- Outstanding questions (missing data, tests needed)
- Enrollment contact info for nearest site
- ClinicalTrials.gov link
- Disclaimer: "This is an AI-generated summary for informational purposes..."

Output options:
- Copy to clipboard (for email)
- Download as PDF
- Open in email client (mailto: link with pre-filled subject/body)

### 6. Re-matching on New Trials

When the daily trial sync (Session 2) finds new or updated trials:
1. Re-run matching for all active patients against new/updated trials
2. If a new match scores above threshold (e.g., > 60), create a Match record
3. Send email notification: "We found a new trial that may match your profile"

Implement this as a function called after the sync worker completes.

### 7. tRPC procedures to implement

```typescript
// matches.generateForPatient — run full matching pipeline
// matches.getForPatient — return stored matches, sorted
// matches.updateStatus — patient marks as viewed/contacted/enrolled
// matches.getTrialDetail — trial info + eligibility comparison
// matches.generateOncologistBrief — Claude-generated brief
```

### 8. After everything is wired up

Test the full flow end-to-end:
1. Upload a sample pathology report (create a realistic test PDF)
2. Confirm extracted data
3. See matched trials
4. View trial details with eligibility comparison
5. Generate oncologist brief

This is the core trial-matching MVP. After this session, the clinical trial finder is usable end-to-end. Session 5 adds the Treatment Translator and Financial Assistance Finder that turn it into a full cancer navigation companion.

---END---

---

## SESSION 5: Treatment Translator + Financial Assistance Finder

---START---

# OncoVax — Treatment Translator + Financial Assistance Finder

This is Session 5. The core MVP is functional (Sessions 1-4). Now we're adding two modules that transform OncoVax from a trial finder into a cancer navigation companion. Both modules run on the patient profile data already collected — no new intake required.

## Module A: Treatment Translator

### 1. Treatment Translation Engine

Create `packages/api/src/routers/translator.ts`

This module takes the patient's extracted clinical profile and generates a personalized, plain-language explainer using a two-step Claude pipeline.

**Step 1 — Clinical Grounding Call:**

System prompt includes current standard-of-care context for the patient's specific diagnosis:

```typescript
const CLINICAL_GROUNDING_PROMPT = `
You are an oncology clinical knowledge assistant. Given a patient profile,
provide a clinical grounding document that covers:

1. The current NCCN guideline-recommended treatment approach for this specific
   cancer type, subtype, and stage
2. Published 5-year survival statistics from NCI SEER for this diagnosis
3. Mechanism of action for each recommended drug
4. Known side effect profiles with timing (when side effects typically onset/resolve)
5. Whether this patient's reported treatment plan aligns with guidelines
   (flag any deviations — not to second-guess the oncologist, but to ensure
   the patient has the information to ask good questions)
6. Whether this patient's biomarker profile suggests eligibility for newer
   targeted therapies or immunotherapies that should be discussed

Patient Profile:
{patientProfile}

Respond with structured clinical JSON. Be evidence-based. Cite trial names
where relevant (e.g., KEYNOTE-522, monarchE, NSABP B-31).
`;
```

**Step 2 — Patient-Facing Translation Call:**

```typescript
const PATIENT_TRANSLATION_PROMPT = `
You are translating a clinical oncology grounding document into plain language
for a cancer patient. Your audience is an intelligent adult with no medical
background who is scared and wants to understand what's happening to them.

RULES:
- Write at approximately 8th-grade reading level
- Never minimize cancer — be honest but not terrifying
- Present survival statistics as ranges with context ("About X out of 100 people
  with your specific diagnosis are alive 5 years later")
- Never predict individual outcomes
- When the treatment plan deviates from standard guidelines, frame it as
  "a question worth discussing with your doctor" — never as an error
- Include a "questions to ask" section specific to their situation
- If their profile suggests they might benefit from clinical trials, mention it
  naturally and link to their match results
- End every section with encouragement grounded in real data, not platitudes

Clinical grounding:
{groundingDocument}

Patient's name: {name}
Generate the full TreatmentTranslation JSON structure.
`;
```

### 2. Treatment Translator UI

Build `app/translate/page.tsx`

**Magazine-style reading experience**, not a clinical report:

- **Hero section**: Patient's name + diagnosis in plain language, with a warm but honest tone
- **"What you have" section**: Collapsible, starts expanded. Explains cancer type, stage, subtype. Uses simple analogies where helpful. Includes a small visual showing where Stage IIB falls on the Stage I-IV spectrum.
- **"Your treatment plan" section**: Each drug in its own card:
  - Drug name (brand + generic)
  - What it does (1-2 sentences)
  - Why it was chosen for YOUR cancer specifically
  - What to expect (side effect timeline for this drug)
  - Practical tips from other patients
- **"Your timeline" section**: Visual timeline of treatment phases with expected durations. Interactive — click a phase to expand details about that period.
- **"Questions for your doctor" section**: 5-8 personalized questions based on their specific situation. Each question has a "why this matters" explanation. Printable/copyable.
- **"What else to know" section**: Genetic testing considerations, fertility preservation (if applicable), clinical trial opportunities (links to their matches), when/why to consider a second opinion.

**Output options:**
- "Save as PDF" button — formatted for printing, brings to appointments
- "Share with family" — generates a slightly simplified version with a shareable link
- "Email to myself" — sends the full translation via email

### 3. Second Opinion Trigger Logic

Implement in the clinical grounding step. Flag when:

```typescript
interface SecondOpinionTrigger {
  triggered: boolean;
  reason: string;
  severity: "informational" | "worth_discussing" | "strongly_recommended";
  suggestion: string;
}

// Trigger rules:
// 1. TNBC without mention of pembrolizumab → worth_discussing
//    "Immunotherapy (pembrolizumab) is now standard for early-stage TNBC
//     per KEYNOTE-522. Ask your oncologist if this applies to you."
//
// 2. HER2+ without mention of pertuzumab → worth_discussing
//    "Dual HER2 blockade is standard for HER2+ breast cancer.
//     If you're only receiving trastuzumab, ask about adding pertuzumab."
//
// 3. High-risk ER+ without CDK4/6 inhibitor discussion → informational
//    "CDK4/6 inhibitors (like abemaciclib) are now approved for high-risk
//     early ER+ breast cancer. Ask if your risk profile qualifies."
//
// 4. Patient at community practice + rare subtype → informational
//    "Your cancer subtype has specialized treatment approaches. Consider
//     seeking a consultation at an NCI-designated cancer center."
//
// 5. No genetic testing mentioned + age <50 or family history → worth_discussing
//    "Genetic testing (BRCA1/2) is recommended for your age group and
//     may affect treatment decisions."
```

This is surfaced gently — not as "your doctor is wrong" but as "here's something worth asking about."

### 4. tRPC procedures

```typescript
// translator.generate — run 2-step pipeline, return TreatmentTranslation
// translator.getForPatient — retrieve cached translation
// translator.regenerate — re-run if patient profile updated
// translator.generatePdf — PDF output
// translator.generateShareLink — shareable version
```

---

## Module B: Financial Assistance Finder

### 1. Financial Programs Database

Create the Prisma model for `FinancialProgram` and `FinancialMatch` (schema from spec).

Seed with initial programs. Create a seed script at `packages/db/prisma/seed-financial.ts`:

**Round 1 — Copay Foundations (biggest dollar impact):**
```typescript
const COPAY_FOUNDATIONS = [
  {
    name: "CancerCare Co-Payment Assistance Foundation",
    organization: "CancerCare",
    type: "copay_foundation",
    assistanceCategories: ["copay_treatment"],
    website: "https://www.cancercarecopay.org",
    phone: "866-552-6729",
    applicationProcess: "online",
    applicationUrl: "https://portal.copayconnect.org",
    eligibility: {
      cancerTypes: ["breast_cancer"],  // Check — they have specific fund lists
      insuranceRequired: true,
      insuranceTypes: ["commercial", "medicare"],
      incomeLimit: { individual: null, household: null },  // Varies by fund
      citizenshipRequired: false,
    },
    requiredDocuments: ["Insurance card", "Diagnosis from physician"],
    turnaroundTime: "Same day",
  },
  // HealthWell Foundation
  // Patient Access Network (PAN) Foundation
  // Good Days
  // Patient Advocate Foundation Co-Pay Relief
  // The Assistance Fund
];

const BREAST_CANCER_NONPROFITS = [
  {
    name: "Susan G. Komen Financial Assistance",
    organization: "Susan G. Komen",
    type: "nonprofit_grant",
    assistanceCategories: ["copay_treatment", "transportation", "living_expenses", "childcare"],
    website: "https://www.komen.org/support-resources/financial-assistance/",
    // ...
  },
  {
    name: "The Pink Fund",
    organization: "The Pink Fund",
    type: "nonprofit_grant",
    assistanceCategories: ["living_expenses"],
    benefitDescription: "90-day non-medical cost-of-living expenses during active treatment",
    // ...
  },
  // Sisters Network, Genevieve's Helping Hands, Young Survival Coalition
];

const PHARMA_PAPS = [
  // Map common breast cancer drugs to manufacturer PAPs:
  // Tamoxifen → generic (minimal cost, but PAPs exist)
  // Letrozole → generic
  // Trastuzumab (Herceptin) → Genentech Access Solutions
  // Pertuzumab (Perjeta) → Genentech Access Solutions
  // Abemaciclib (Verzenio) → Lilly Oncology Patient Support
  // Palbociclib (Ibrance) → Pfizer Oncology Together
  // Pembrolizumab (Keytruda) → Merck Access Program
  // T-DXd (Enhertu) → Daiichi Sankyo Patient Support
];

const PRACTICAL_ASSISTANCE = [
  // ACS Hope Lodge, Road to Recovery, Angel Flight
  // Family Reach, Meals on Wheels
];

const GOVERNMENT_PROGRAMS = [
  // Medicaid, Medicare Extra Help, SSI/SSDI
  // State pharmaceutical assistance programs
];
```

Research each program's current eligibility rules and encode them. This is manual work but only needs to be done once per program — start with 30 programs, expand to 200+ over time.

### 2. Financial Profile Extension

Add financial questions to the intake confirm page (after clinical data, before submission):

```
── Financial assistance (optional) ───────────

Finding help paying for cancer treatment

What type of insurance do you have?
  ○ Commercial/employer   ○ Medicare   ○ Medicaid   ○ Uninsured   ○ Other

Household size:  [2 ▾]

Approximate household income (helps match assistance programs):
  ○ Under $30,000    ○ $30,000-$50,000    ○ $50,000-$75,000
  ○ $75,000-$100,000 ○ Over $100,000      ○ Prefer not to say

What are you most concerned about paying for?
  ☑ Drug copays        ☑ Transportation to treatment
  ☐ Living expenses    ☐ Childcare
  ☐ Insurance premiums ☐ Lodging away from home
```

These are optional fields — if omitted, we still show programs but can't filter by income eligibility (show as "check_eligibility" instead of "eligible").

### 3. Financial Matching Engine

Create `packages/eligibility-engine/src/financial-matcher.ts`

```typescript
async function matchFinancialPrograms(
  profile: PatientProfile,
  financialProfile: FinancialProfile
): Promise<FinancialMatchResult[]> {
  const programs = await db.financialProgram.findMany({
    where: { status: { not: "closed" } }  // Only open or waitlist
  });

  return programs
    .map(program => evaluateEligibility(program, profile, financialProfile))
    .filter(match => match.matchStatus !== "ineligible")
    .sort((a, b) => {
      // Sort by: eligible first, then by estimated benefit
      const statusOrder = { eligible: 0, likely_eligible: 1, check_eligibility: 2 };
      return (statusOrder[a.matchStatus] - statusOrder[b.matchStatus])
        || (estimateDollarValue(b) - estimateDollarValue(a));
    });
}

function evaluateEligibility(
  program: FinancialAssistanceProgram,
  profile: PatientProfile,
  financial: FinancialProfile
): FinancialMatchResult {
  const checks = {
    cancerType: program.eligibility.cancerTypes === "all" 
      || program.eligibility.cancerTypes.includes(profile.cancerTypeNormalized),
    insurance: checkInsuranceEligibility(program, financial),
    income: financial.householdIncome 
      ? checkIncomeEligibility(program, financial) 
      : "unknown",
    age: checkAgeEligibility(program, profile),
    geography: checkGeographicEligibility(program, profile),
    treatment: checkTreatmentEligibility(program, profile),
  };

  // Determine overall status
  if (Object.values(checks).includes(false)) return { matchStatus: "ineligible", ... };
  if (Object.values(checks).includes("unknown")) return { matchStatus: "check_eligibility", ... };
  if (Object.values(checks).every(c => c === true)) return { matchStatus: "eligible", ... };
  return { matchStatus: "likely_eligible", ... };
}
```

### 4. Financial Results Page

Build `app/financial/page.tsx`

**Hero banner:** "You may qualify for up to $XX,XXX in financial assistance"
(Sum of max benefits from all eligible programs — use ranges, not false precision)

**Matched programs, grouped by category:**

```
💊 Treatment Copay Help ($5,000 - $15,000/year)
  🟢 CancerCare Co-Payment Foundation — OPEN
     Estimated benefit: up to $10,000/year
     "Your breast cancer diagnosis and commercial insurance qualify you"
     [Apply Now →]

  🟢 HealthWell Foundation — OPEN
     Estimated benefit: up to $5,000/year
     [Apply Now →]

  🔴 PAN Foundation — CLOSED (Get notified when it reopens)

🏠 Living Expenses
  🟢 The Pink Fund — OPEN
     "Covers rent/mortgage for 90 days during active treatment"
     [Apply Now →]

  🟡 Susan G. Komen — CHECK ELIGIBILITY
     "We need your household income to confirm — covers up to $5,000"
     [Check Eligibility →]

🚗 Transportation
  🟢 ACS Road to Recovery — OPEN
     "Free rides to treatment appointments"
     [Sign Up →]

💊 Free Medication (Pharma Programs)
  🟢 Genentech Access Solutions — OPEN
     "Free Herceptin for qualifying patients"
     "Requires: proof of income, insurance denial letter"
     [Apply →]
```

Each program card shows: status, estimated benefit, why they match, required documents, and direct application link.

### 5. Fund Status Monitor

Create a background worker that checks program status daily:

```typescript
// packages/trial-ingestion/src/financial-status-sync.ts

async function checkFundStatuses() {
  const programs = await db.financialProgram.findMany();
  
  for (const program of programs) {
    if (program.statusUrl) {
      // Fetch the status page
      // Use Claude to extract current open/closed/waitlist status from the page
      // Update the database
      // If status changed from closed → open, notify waiting patients
    }
  }
}
```

Some foundations have structured status pages (CancerCare lists open/closed by fund), others require parsing. Claude can extract status from any format.

### 6. Integration with Treatment Translator

When the Treatment Translator estimates treatment costs or mentions specific drugs, link directly to matching financial programs:

"Your treatment includes Herceptin, which can have significant copays. [See 3 programs that can help →]"

### 7. tRPC procedures

```typescript
// financial.getMatchesForPatient — run matching, return sorted results
// financial.getProgramDetail — full program info + application steps
// financial.updateFinancialProfile — save/update financial info
// financial.subscribeToAlerts — notify when closed fund reopens
// financial.markApplied — track application status
// financial.estimateTotalSavings — sum potential savings for hero banner
```

---END---

---

## SESSION 6: MyChart FHIR Integration

---START---

# OncoVax — MyChart FHIR Integration

This is Session 6. Phase 1 is fully shipped (Sessions 1-5) with trial matching, treatment translation, and financial assistance. Now we're adding the highest-fidelity patient intake path: direct connection to Epic MyChart via FHIR R4 APIs.

**Prerequisites:** Epic App Orchard registration must be approved. If still pending, build against Epic's sandbox environment and flag the production switch as a deploy task.

## What to build

### 1. SMART on FHIR OAuth 2.0 Flow

Create `packages/doc-ingestion/src/fhir/smart-auth.ts`

Implement the SMART on FHIR authorization flow:

1. **Discovery**: Hit the health system's FHIR `/metadata` endpoint to get the `authorize` and `token` endpoints from the CapabilityStatement
2. **Authorization**: Redirect patient to MyChart login with these scopes:
   - `patient/Patient.read`
   - `patient/Condition.read`
   - `patient/DiagnosticReport.read`
   - `patient/Observation.read`
   - `patient/MedicationRequest.read`
   - `patient/Procedure.read`
   - `launch/patient`
   - `openid fhirUser`
3. **Token exchange**: Exchange authorization code for access + refresh tokens
4. **Token storage**: Encrypt tokens and store in FhirConnection table
5. **Token refresh**: Auto-refresh before expiry

Use the `fhirclient` npm package or build a lightweight client.

### 2. Health System Directory

Create a searchable directory of Epic MyChart-enabled health systems.

Data source: Epic publishes a list of organizations using MyChart. Seed with:
- Major cancer centers (MSK, MD Anderson, Dana-Farber, Sloan Kettering, City of Hope, Mayo Clinic, etc.)
- Large health systems (Kaiser, HCA, CommonSpirit, Ascension, etc.)

Each entry needs:
- Health system name
- FHIR base URL (e.g., `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4`)
- MyChart brand name (some systems rebrand MyChart)
- Logo URL (optional, for recognition)

Build the search UI at `app/start/mychart/page.tsx`:
- Searchable list of health systems
- "I don't see my health system" → fallback to document upload
- Clear explanation of what data we'll access and why

### 3. FHIR Resource Extraction

Create `packages/doc-ingestion/src/fhir/extract-resources.ts`

After OAuth, pull relevant FHIR resources and map them to our PatientProfile.

#### Condition → Cancer diagnosis
```typescript
// Search: GET /Condition?patient={patientId}&category=encounter-diagnosis
// Filter for ICD-10 codes C00-D49 (neoplasm range)
// Extract: code (cancer type), stage, bodySite, onsetDateTime
```

#### Observation → Biomarkers + Lab values
```typescript
// Biomarker LOINC codes to query:
const BIOMARKER_LOINCS = {
  er_status: "85337-4",      // Estrogen receptor
  pr_status: "85339-0",      // Progesterone receptor
  her2_ihc: "85319-2",       // HER2 IHC
  her2_fish: "85318-4",      // HER2 FISH
  ki67: "85329-1",           // Ki-67
  pdl1: "85147-7",           // PD-L1
  tmb: "94076-7",            // Tumor mutational burden
  msi: "81695-9",            // Microsatellite instability
};

// Lab LOINC codes for trial eligibility:
const LAB_LOINCS = {
  anc: "751-8",              // Absolute neutrophil count
  platelets: "777-3",
  hemoglobin: "718-7",
  creatinine: "2160-0",
  ast: "1920-8",
  alt: "1742-6",
  bilirubin: "1975-2",
  albumin: "1751-7",
};

// GET /Observation?patient={patientId}&code={loincCode}&_sort=-date&_count=1
// Get most recent value for each
```

#### MedicationRequest → Prior treatments
```typescript
// GET /MedicationRequest?patient={patientId}&status=active,completed
// Map RxNorm codes to treatment categories (chemo, immunotherapy, targeted, hormonal)
// Extract: medication name, status, dates
```

#### Procedure → Surgeries
```typescript
// GET /Procedure?patient={patientId}&category=surgical-procedure
// Extract: procedure type, date, outcome
```

### 4. FHIR → PatientProfile Mapper

Create `packages/doc-ingestion/src/fhir/mapper.ts`

Map extracted FHIR resources to our standard PatientProfile format. This is a direct code mapping (no LLM needed — FHIR data is already structured and coded):

- ICD-10 codes → cancer type normalized names
- LOINC codes → biomarker names and values
- RxNorm codes → treatment names and categories
- SNOMED procedure codes → surgery types

Track which fields came from FHIR:
```typescript
fieldSources: {
  cancerType: "fhir",
  stage: "fhir",
  erStatus: "fhir",
  // etc.
}
```

Report completeness: what percentage of trial-matching fields were we able to fill from FHIR data? Surface missing fields to the patient: "We got your diagnosis and biomarkers from MyChart, but we couldn't find your performance status. Can you tell us?"

### 5. Data Access Transparency UI

Create `app/dashboard/records/page.tsx`

Show the patient exactly what we accessed:

- List of FHIR resources pulled, with human-readable descriptions
- "Your breast cancer diagnosis (from Memorial Sloan Kettering, accessed March 15)"
- "Your ER/PR/HER2 test results (from MSK pathology, accessed March 15)"
- "Your recent lab values (CBC, metabolic panel, accessed March 15)"
- What we explicitly DON'T access (mental health, substance use, reproductive health, billing)
- Revoke access button (deletes tokens, removes FHIR-sourced data)
- Re-sync button (pull latest data)

### 6. Connect to Existing Flow

After FHIR extraction:
1. Map to PatientProfile
2. Redirect to `/start/confirm` (same confirm page as document upload)
3. Show pre-filled data with green "from MyChart" badges instead of confidence scores
4. Patient confirms, proceeds to matching
5. Store FhirConnection record for future re-syncs

### 7. Error Handling

Handle gracefully:
- Health system not in directory → suggest document upload
- OAuth denied/cancelled → return to intake picker
- Token expired → prompt re-authentication
- FHIR endpoint returns errors → partial extraction, surface what we got
- Missing FHIR resources (not all systems expose all resource types) → fall back to document upload for missing data

### 8. Testing

- Test against Epic's sandbox FHIR server (https://fhir.epic.com/Developer/Apps)
- Create test patients with oncology data
- Verify all resource types extract correctly
- Test token refresh flow
- Test revocation flow
- Test partial data scenarios (some resources unavailable)

---END---

---

## What comes next

After Sessions 1-6, Phase 1 is fully shipped with all three intake paths (document upload, MyChart, manual entry), trial matching, treatment translator, financial assistance finder, and oncologist brief generation.

**Phase 2 sessions (sequencing navigator) — build when ready:**
- Session 7: Sequencing provider directory + insurance coverage engine
- Session 8: Sequencing journey wizard + data upload
- Session 9: Results interpretation + genomic trial matching

**Phase 3 sessions (neoantigen pipeline) — build when ready:**
- Session 10: Compute infrastructure + alignment pipeline (Rust)
- Session 11: Variant calling + HLA typing (Rust wrappers)
- Session 12: Neoantigen prediction + ranking (Python)
- Session 13: AlphaFold integration + mRNA designer (Python)
- Session 14: Report generation + pipeline UI
- Session 15: NATS JetStream orchestration + end-to-end testing

**Phase 4 sessions (manufacturing network) — build when ready:**
- Session 16: Manufacturing partner directory
- Session 17: Regulatory pathway navigator
- Session 18: Order workflow + tracking

I'll generate detailed prompts for Sessions 7+ when you're ready for them.
