# ONCOVAX — Personalized Cancer Vaccine Access Platform

## Technical Specification v1.0

**Author:** Rett (Happy Medium)
**Date:** March 2026
**Purpose:** Sequenced build spec for Claude Code. Each phase is independently deployable but feeds into the next. Architecture extends existing art-cafe Turborepo stack (TypeScript/Next.js/Postgres) with Rust for compute-intensive pipeline work and Python for ML/bioinformatics.

---

## Table of Contents

1. [Platform Overview & Architecture](#1-platform-overview--architecture)
2. [Phase 1: Clinical Trial Matcher (MATCH)](#2-phase-1-clinical-trial-matcher-match)
3. [Phase 2: Sequencing Navigator (SEQUENCE)](#3-phase-2-sequencing-navigator-sequence)
4. [Phase 3: Neoantigen Prediction Platform (PREDICT)](#4-phase-3-neoantigen-prediction-platform-predict)
5. [Phase 4: Manufacturing Network Connector (MANUFACTURE)](#5-phase-4-manufacturing-network-connector-manufacture)
6. [Cross-Cutting Concerns](#6-cross-cutting-concerns)
7. [Build Order & Dependencies](#7-build-order--dependencies)

---

## 1. Platform Overview & Architecture

### 1.1 Mission

Reduce the time from cancer diagnosis to personalized vaccine access from months/never to weeks, by building the software layer that connects patients to sequencing, computational neoantigen prediction, clinical trials, and manufacturing — without requiring them to be at an elite academic medical center.

### 1.2 Monorepo Structure

Extends existing Turborepo. New packages live alongside art-cafe apps.

```
oncovax/                                 # As built (Sessions 1-8)
├── apps/
│   ├── web/                             # Next.js 15 patient-facing app (App Router)
│   │   ├── app/
│   │   │   ├── admin/trials/            # Admin QA page (Session 2)
│   │   │   ├── api/
│   │   │   │   ├── admin/               # Admin-only API routes (Session 2)
│   │   │   │   │   ├── trial-sync/      # POST: trigger sync + parse
│   │   │   │   │   └── trials/          # GET: list, POST: reparse
│   │   │   │   ├── auth/                # Magic link auth (Session 1) + session check (Session 3)
│   │   │   │   ├── documents/           # Upload URL, extraction pipeline (Session 3)
│   │   │   │   │   ├── upload-url/      # POST: presigned S3 PUT URL
│   │   │   │   │   └── extract/         # POST: trigger extraction, GET: re-fetch by ID
│   │   │   │   ├── fhir/               # FHIR/MyChart integration (Session 6)
│   │   │   │   │   ├── authorize/       # GET: initiate SMART on FHIR OAuth
│   │   │   │   │   ├── callback/        # GET: handle OAuth callback, store encrypted tokens
│   │   │   │   │   ├── connections/     # GET: list patient's FHIR connections
│   │   │   │   │   ├── extract/         # POST: pull FHIR resources, map to PatientProfile
│   │   │   │   │   ├── health-systems/  # GET: searchable health system directory
│   │   │   │   │   ├── resync/          # POST: re-pull with token refresh
│   │   │   │   │   └── revoke/          # POST: revoke access, clear FHIR data
│   │   │   │   ├── financial/           # Financial assistance matching (Session 5)
│   │   │   │   │   ├── route.ts         # GET: matched programs grouped by category
│   │   │   │   │   ├── [programId]/     # GET: program detail + patient match
│   │   │   │   │   └── subscribe/       # POST: notify on fund reopen
│   │   │   │   ├── matches/             # Match listing, detail, status, generation, brief (Session 4)
│   │   │   │   │   ├── generate/        # POST: trigger match generation
│   │   │   │   │   └── [matchId]/       # GET: detail, PATCH: status
│   │   │   │   │       └── brief/       # GET: generate oncologist brief
│   │   │   │   ├── patients/            # Create + get patient profile (Session 3)
│   │   │   │   ├── stripe/              # Checkout + webhook (Session 1)
│   │   │   │   ├── genomics/              # Genomic results (Session 9)
│   │   │   │   │   ├── upload-url/      # POST: presigned S3 URL for genomic report
│   │   │   │   │   ├── extract/         # POST: Claude Vision extraction of genomic report
│   │   │   │   │   ├── confirm/         # POST: patient confirms extracted results → merge into profile
│   │   │   │   │   ├── interpretation/  # POST: generate/get Claude interpretation (cached)
│   │   │   │   │   ├── rematch/         # POST: re-run trial matching with genomic data
│   │   │   │   │   └── results/         # GET: list results; [resultId]: GET detail
│   │   │   │   ├── pipeline/             # Neoantigen pipeline (Session 10)
│   │   │   │   │   ├── upload-url/      # POST: presigned S3 URL for FASTQ/BAM upload
│   │   │   │   │   ├── submit/          # POST: submit pipeline job (validate S3 → create job → publish NATS)
│   │   │   │   │   └── jobs/            # GET: list patient's pipeline jobs
│   │   │   │   │       └── [jobId]/     # GET: job detail + top 20 neoantigens, DELETE: cancel
│   │   │   │   │           └── results/ # GET: presigned download URLs for completed job outputs
│   │   │   │   ├── sequencing/           # Sequencing navigation (Sessions 7-8)
│   │   │   │   │   ├── brief/           # POST: generate oncologist sequencing brief (Session 7)
│   │   │   │   │   ├── coverage/        # POST: check insurance coverage (Session 7)
│   │   │   │   │   ├── guide/           # Sequencing journey wizard APIs (Session 8)
│   │   │   │   │   │   ├── recommendation/    # POST: personalized sequencing recommendation
│   │   │   │   │   │   ├── explanation/       # POST: personalized "what is sequencing" content
│   │   │   │   │   │   ├── test-recommendation/ # POST: which test for this patient
│   │   │   │   │   │   └── conversation/      # POST: conversation guide + email template
│   │   │   │   │   ├── lomn/           # POST: letter of medical necessity (Session 7)
│   │   │   │   │   ├── orders/         # GET: list, POST: create (Session 7)
│   │   │   │   │   │   └── [orderId]/  # GET: detail, PATCH: update status (Session 7)
│   │   │   │   │   ├── providers/      # GET: list, detail (Session 7)
│   │   │   │   │   └── waiting-content/ # POST: educational content while waiting (Session 8)
│   │   │   │   ├── translator/          # Treatment translation pipeline (Session 5)
│   │   │   │   │   └── route.ts         # GET: cached, POST: generate via 2-step Claude pipeline
│   │   │   │   └── trials/              # Public trial search + detail (Session 2)
│   │   │   ├── dashboard/               # Dashboard hub (Sessions 5-6, 8)
│   │   │   │   ├── page.tsx             # 5-card layout: trials, treatment guide, financial, sequencing, records
│   │   │   │   └── records/page.tsx     # Data access transparency — what FHIR accessed, revoke, re-sync
│   │   │   ├── financial/               # Financial assistance finder (Session 5)
│   │   │   │   ├── page.tsx             # Programs grouped by category, hero savings banner
│   │   │   │   └── [programId]/page.tsx # Program detail + eligibility + how to apply
│   │   │   ├── matches/                 # Match results flow (Session 4)
│   │   │   │   ├── page.tsx             # Ranked match list with filter tabs
│   │   │   │   └── [trialId]/
│   │   │   │       ├── page.tsx         # Trial detail + eligibility breakdown
│   │   │   │       └── contact/page.tsx # Oncologist brief generator
│   │   │   ├── start/                   # Patient intake flow (Sessions 3, 5, 6)
│   │   │   │   ├── upload/              # Document upload page
│   │   │   │   ├── mychart/             # MyChart connect — health system search + OAuth + extraction (Session 6)
│   │   │   │   ├── manual/              # Manual intake wizard
│   │   │   │   └── confirm/             # Review + auth + save + FHIR badges + financial profile
│   │   │   ├── pipeline/                  # Neoantigen pipeline (Session 10)
│   │   │   │   ├── page.tsx             # Pipeline home — job list or upload CTA
│   │   │   │   ├── upload/page.tsx      # Dual drop-zone upload (tumor + normal) with XHR progress
│   │   │   │   └── jobs/
│   │   │   │       ├── page.tsx         # Job list with status badges + progress bars
│   │   │   │       └── [jobId]/page.tsx # Job detail: 8-step progress bar, neoantigen table, downloads
│   │   │   ├── sequencing/               # Sequencing navigation (Sessions 7-9)
│   │   │   │   ├── page.tsx             # Sequencing hub — 3 pathway cards, dynamic state (Sessions 7, 9)
│   │   │   │   ├── confirm/page.tsx     # Genomic report confirm — review mutations + biomarkers (Session 9)
│   │   │   │   ├── guide/page.tsx       # 5-step sequencing journey wizard (Session 8)
│   │   │   │   ├── insurance/page.tsx   # Insurance coverage checker (Session 7)
│   │   │   │   ├── orders/              # Order tracking (Session 8)
│   │   │   │   │   ├── page.tsx         # Order list with progress bars + waiting content
│   │   │   │   │   └── [orderId]/page.tsx # Order detail + status timeline + upload CTA (Sessions 8, 9)
│   │   │   │   ├── providers/           # Provider directory (Session 7)
│   │   │   │   │   ├── page.tsx         # Filterable provider list + comparison
│   │   │   │   │   └── [providerId]/page.tsx # Provider detail
│   │   │   │   ├── results/page.tsx     # Genomic results interpretation — 5 sections + match delta (Session 9)
│   │   │   │   └── upload/page.tsx      # Genomic report upload — drag-drop + extraction pipeline (Session 9)
│   │   │   ├── translate/               # Treatment translator (Session 5)
│   │   │   │   └── page.tsx             # Magazine-style treatment guide with drug cards + timeline
│   │   │   └── ...                      # Other pages (Session 1 stubs)
│   │   ├── components/                  # Client components (Sessions 3-8)
│   │   │   ├── DocumentUploader.tsx     # Mobile-first S3 upload with quality checks
│   │   │   ├── ManualIntakeWizard.tsx   # 4-step clinical data wizard
│   │   │   ├── InlineMagicLink.tsx      # Inline auth with session polling
│   │   │   ├── MatchCard.tsx            # Match card with score badge + breakdown pills (Session 4)
│   │   │   ├── EligibilityBreakdown.tsx # 6-dimension breakdown + LLM assessment (Session 4)
│   │   │   ├── TranslationSection.tsx   # Collapsible section for treatment guide (Session 5)
│   │   │   ├── FinancialProgramCard.tsx # Program card with status badge + apply button (Session 5)
│   │   │   ├── HealthSystemSearch.tsx   # Searchable health system directory with debounce (Session 6)
│   │   │   ├── SequencingProviderCard.tsx # Provider card with details + compare toggle (Session 7)
│   │   │   ├── OrderProgressBar.tsx     # Horizontal order status progress bar (Session 8)
│   │   │   └── PipelineProgressBar.tsx # 8-step pipeline progress visualization (Sessions 10, 12)
│   │   └── lib/
│   │       ├── ai.ts                    # Claude Opus client + multi-image + PDF support
│   │       ├── clinicaltrials.ts        # CTG v2 API client (Session 2)
│   │       ├── eligibility-parser.ts    # Claude eligibility parser (Session 2)
│   │       ├── extraction.ts            # Claude Vision extraction pipeline (Session 3)
│   │       ├── fhir/                    # FHIR integration library (Session 6)
│   │       │   ├── types.ts             # FHIR R4 resource type definitions (Condition, Observation, etc.)
│   │       │   ├── code-maps.ts         # ICD-10, LOINC, RxNorm, SNOMED lookup tables
│   │       │   ├── client.ts            # Authenticated FHIR HTTP client with pagination
│   │       │   ├── smart-auth.ts        # SMART on FHIR OAuth (discovery, token exchange, encryption)
│   │       │   ├── extract-resources.ts # Pull FHIR resources in parallel (4 resource types)
│   │       │   └── mapper.ts            # Map FHIR → PatientProfile (completeness tracking)
│   │       ├── financial-matcher.ts     # Financial program matching engine (Session 5)
│   │       ├── image-quality.ts         # Client-side quality checks + HEIC (Session 3)
│   │       ├── matcher.ts              # 3-tier matching engine with fuzzy + stage matching (Session 4)
│   │       ├── oncologist-brief.ts     # Claude-powered oncologist brief generator (Session 4)
│   │       ├── s3.ts                    # S3 presigned URL generation (Session 3)
│   │       ├── translator.ts           # Two-step Claude translation pipeline (Session 5)
│   │       ├── coverage.ts             # Insurance coverage determination engine (Session 7)
│   │       ├── sequencing-brief.ts     # Claude-powered sequencing oncologist brief (Session 7)
│   │       ├── sequencing-recommendation.ts # Deterministic recommendation level + Claude personalization (Session 8)
│   │       ├── test-recommendation.ts  # Deterministic test selection (Foundation/Guardant/Tempus) (Session 8)
│   │       ├── conversation-guide.ts   # Claude-powered doctor conversation guide + email template (Session 8)
│   │       ├── waiting-content.ts      # Claude-powered educational content by cancer type (Session 8)
│   │       ├── genomic-extraction.ts  # Claude Vision genomic report extraction pipeline (Session 9)
│   │       ├── genomic-interpreter.ts # Two-step Claude genomic interpretation (clinical grounding → patient translation) (Session 9)
│   │       ├── nats.ts                # NATS JetStream client singleton for pipeline events (Session 10)
│   │       ├── mapbox.ts                # Geocoding fallback (Session 2)
│   │       ├── trial-sync.ts            # Sync worker (Session 2)
│   │       ├── db.ts, redis.ts, session.ts, events.ts, stripe.ts, cloudinary.ts
│   │       └── ...
│   └── mobile/                          # Expo SDK 54 (Session 1 scaffold)
├── packages/
│   ├── db/                              # Prisma 7 + PostgreSQL (17 models)
│   ├── shared/                          # Types, schemas, constants, auth
│   ├── pipeline-storage/                # S3 client for pipeline data (Session 10)
│   │   └── src/{client,paths,upload,download}.ts
│   └── pipeline-orchestrator/           # NATS JetStream orchestrator (Session 10)
│       └── src/{index,nats,events,consumers,dispatcher,retry,job-manager}.ts
├── scripts/
│   ├── trial-sync.ts                    # CLI: pnpm trial-sync (Session 2)
│   ├── seed-financial-programs.ts       # Seed 30 financial programs (Session 5)
│   ├── financial-status-check.ts        # CLI: check/update fund statuses (Session 5)
│   ├── seed-health-systems.ts           # Seed 30 health systems with FHIR URLs (Session 6)
│   ├── seed-sequencing-providers.ts    # Seed 10 sequencing providers (Session 7)
│   ├── seed-insurance-rules.ts         # Seed insurance coverage rules (Session 7)
│   └── setup-reference-genome.sh       # Download + index GRCh38, upload to S3 (Session 10)
├── infrastructure/
│   └── terraform/                       # AWS infra: VPC, S3, IAM, Batch, NATS ECS (Session 10)
│       ├── main.tf, variables.tf, outputs.tf
│       ├── vpc.tf                       # VPC, subnets, NAT gateway, security groups
│       ├── s3.tf                        # Pipeline bucket (AES-256, versioning, Glacier lifecycle)
│       ├── iam.tf                       # Batch execution/job roles, NATS execution role
│       ├── ecr.tf                       # ECR repos: alignment, variant-caller, hla-typer, peptide-generator (Sessions 11-12)
│       ├── batch.tf                     # 2 compute envs (spot), 2 queues, 8 job definitions
│       └── nats.tf                      # ECS Fargate NATS service + EFS + NLB
└── services/neoantigen-pipeline/           # Compute services: Rust + Python (Sessions 11-12+)
    ├── Cargo.toml                         # Workspace root (4 members: pipeline-common, alignment, variant-caller, hla-typer)
    ├── rust-toolchain.toml                # Pin stable Rust
    ├── pipeline-common/                   # Shared Rust crate: config, S3, NATS, process runner, error types
    │   ├── Cargo.toml
    │   └── src/
    │       ├── lib.rs
    │       ├── config.rs                  # PipelineConfig from env vars (PIPELINE_JOB_ID, NATS_URL, etc.)
    │       ├── s3.rs                      # S3 download/upload with multipart (50MB parts, AES256)
    │       ├── nats.rs                    # JetStream publish (step.complete, step.failed, progress)
    │       ├── events.rs                  # Event structs matching orchestrator Zod schemas
    │       ├── process.rs                 # Subprocess runner with piped execution + OOM detection
    │       ├── error.rs                   # PipelineError: retryable vs permanent, exit codes (0/1/2)
    │       ├── logging.rs                 # Structured JSON logging (tracing-subscriber)
    │       └── paths.rs                   # S3 path conventions (mirrors paths.ts)
    ├── alignment/                         # Step 1: BWA-MEM2 alignment (Session 11)
    │   ├── Cargo.toml
    │   ├── Dockerfile                     # Multi-stage: Rust builder → BWA-MEM2 v2.2.1 + samtools v1.20
    │   └── src/
    │       ├── main.rs                    # Download → align tumor/normal → postprocess → quality gates → upload → publish
    │       ├── aligner.rs                 # bwa-mem2 mem | samtools sort (piped)
    │       ├── postprocess.rs             # samtools markdup + index + flagstat parsing
    │       └── quality.rs                 # Gates: mapping <80%=FAIL, coverage <5x=FAIL, <15x=WARN, dups >50%=WARN
    ├── variant-caller/                    # Step 2: Somatic variant calling (Session 11)
    │   ├── Cargo.toml
    │   ├── Dockerfile                     # Multi-stage: Rust builder → samtools + bcftools v1.20, Strelka2 v2.9.10, GATK v4.5, VEP v112
    │   └── src/
    │       ├── main.rs                    # Download BAMs → Strelka2 + Mutect2 → consensus → VEP → stats → upload → publish
    │       ├── strelka.rs                 # Strelka2 configure + run workflow
    │       ├── mutect.rs                  # GATK Mutect2 + FilterMutectCalls
    │       ├── consensus.rs               # bcftools isec merge + HIGH/MEDIUM confidence tagging
    │       ├── annotate.rs                # Ensembl VEP annotation (cache from S3)
    │       └── quality.rs                 # VariantCallingStats, TMB calculation (nonsynonymous/33Mb)
    ├── hla-typer/                          # Step 3a: HLA typing (Session 12)
    │   ├── Cargo.toml
    │   ├── Dockerfile                     # Multi-stage: Rust builder → samtools v1.20, OptiType v1.3.5, HLA-HD
    │   └── src/
    │       ├── main.rs                    # Download normal BAM → extract HLA reads → OptiType + HLA-HD → consensus → upload → publish
    │       ├── optitype.rs                # OptiType wrapper: run + parse TSV (Class I: HLA-A, -B, -C)
    │       ├── hlahd.rs                   # HLA-HD wrapper: run + parse result.txt (Class I + II), 2-field normalization
    │       ├── consensus.rs               # Consensus genotype: OptiType primary for Class I, HLA-HD for Class II
    │       └── quality.rs                 # Allele validation regex, 6 Class I required, max 3 discrepancies
    └── peptide-generator/                  # Step 3b: Peptide generation — Python (Session 12)
        ├── requirements.txt               # boto3, nats-py, biopython, pysam
        ├── Dockerfile                     # python:3.12-slim with pip deps
        ├── src/
        │   ├── main.py                    # Download VCF → parse → generate peptides → quality → upload → publish NATS
        │   ├── vcf_parser.py              # VEP CSQ parsing, protein-altering variant extraction, VAF/pseudogene filtering
        │   ├── peptide_generator.py        # Sliding window: 8/9/10/11-mer (MHC-I) + 15-mer (MHC-II), PeptideWindow dataclass
        │   ├── quality.py                 # Quality gates: zero peptides=fail, zero MHC-I=fail, >50K=warn
        │   └── pipeline_common/           # Python equivalent of Rust pipeline-common
        │       ├── config.py              # PipelineConfig.from_env()
        │       ├── s3.py                  # boto3 download/upload (AES256)
        │       ├── nats_client.py         # nats-py JetStream publish
        │       ├── events.py              # StepCompleteEvent, StepFailedEvent, ProgressEvent (camelCase)
        │       └── paths.py               # S3 path conventions matching Rust paths.rs
        └── tests/                         # 28 Python tests
            ├── test_vcf_parser.py         # CSQ parsing, VAF extraction, filtering (11 tests)
            ├── test_peptide_generator.py   # KRAS G12D windows, boundary mutations, serialization (13 tests)
            └── test_quality.py            # Quality gate pass/fail/warn (4 tests)
```

> **Architecture note:** Sessions 1-9 established that all server logic lives as lib files in `apps/web/lib/`, not as separate packages. Client components live in `apps/web/components/`. Phase 1 libs: `{clinicaltrials,trial-sync,eligibility-parser,extraction,matcher,oncologist-brief,translator,financial-matcher,s3,image-quality}.ts`. FHIR integration: `apps/web/lib/fhir/` (6 files). Phase 2 libs (Sessions 7-9): `{coverage,sequencing-brief,sequencing-recommendation,test-recommendation,conversation-guide,waiting-content,genomic-extraction,genomic-interpreter}.ts`. All Claude calls use Redis caching (24h TTL). Test recommendation is fully deterministic (no Claude). Matcher dynamically weights 7 dimensions when genomic data is present (6 original × 0.75 + genomics at 0.25). Session 10 introduced the first separate packages (`pipeline-storage`, `pipeline-orchestrator`) since pipeline orchestration runs as a standalone process and S3 storage is shared across the orchestrator and web app. NATS JetStream client also added to `apps/web/lib/nats.ts` for publishing events from API routes.

### 1.3 Core Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 15.0.0 (App Router), React 19, Tailwind | Shared spec exact versions |
| Mobile | Expo SDK 54, React Native 0.76.9, Dripsy | Cross-platform UI (not shadcn) |
| API | Next.js API routes | Direct, no tRPC overhead |
| ORM | Prisma 7.0.0 | `prisma-client` generator, driver adapter required |
| Database | PostgreSQL (Railway) | JSONB for flexible clinical data |
| Cache/Sessions | Redis (Railway) | Session storage, sliding expiration |
| Auth | Custom magic link (jose + Redis) | Low friction for patients, no NextAuth |
| Geocoding | Mapbox (fallback only) | CTG API provides geoPoint for most sites |
| Doc Ingestion | Claude Vision API | Extract structured clinical data from photos/PDFs |
| Patient Portal | Epic MyChart FHIR R4 API | Direct structured data pull (Session 6) |
| Background Jobs | NATS JetStream | Reuse AEGIS infra for pipeline orchestration (Phase 3+) |
| Compute Pipeline | Rust (core) + Python (ML) | Genomic data processing (Phase 3) |
| AI/LLM | Claude Opus (`claude-opus-4-20250514`) | Eligibility parsing, doc extraction, patient guidance |
| File Storage | S3 (medical documents) | HIPAA-eligible, presigned URLs |
| Search | Prisma queries (contains, mode: insensitive) | Good enough for ~200 trial dataset |
| Hosting | Vercel (web) + AWS (compute services) | Split: edge for web, GPU/compute for pipeline |

### 1.4 Data Flow Overview

```
Patient Intake → Trial Matching (Phase 1)
                → Sequencing Navigation (Phase 2)
                     → Genomic Data Upload
                          → Neoantigen Prediction Pipeline (Phase 3)
                               → Vaccine Blueprint Output
                                    → Manufacturing Network (Phase 4)
                                    → Regulatory Navigation (Phase 1/2)
                                    → Oncologist Report (all phases)
```

---

## 2. Phase 1: Clinical Trial Matcher (MATCH)

**Timeline:** 2–4 weeks to MVP
**Goal:** Patient or advocate inputs diagnosis info, gets matched to enrolling personalized cancer vaccine trials.

### 2.1 Data Source: ClinicalTrials.gov

The primary data source is ClinicalTrials.gov's API (v2). This is public, free, no API key required, and updated daily.

#### 2.1.1 Trial Ingestion Worker — IMPLEMENTED

**Status:** Completed (Session 2). Code lives in `apps/web/lib/`, not separate packages.

**Implementation files:**
- `apps/web/lib/clinicaltrials.ts` — CTG v2 API client with TypeScript types, auto-pagination (AsyncGenerator), retry with exponential backoff
- `apps/web/lib/trial-sync.ts` — Sync worker: fetch → upsert Trial + TrialSite → geocode missing coordinates
- `apps/web/lib/mapbox.ts` — Geocoding fallback (most sites have coordinates from CTG API `geoPoint`)
- `scripts/trial-sync.ts` — CLI: `pnpm trial-sync` (supports `--skip-parse`, `--parse-only`)

**Search terms** (defined in `packages/shared/src/constants.ts` as `TRIAL_SEARCH_TERMS`):
```
"personalized cancer vaccine", "neoantigen vaccine", "mRNA cancer vaccine",
"individualized cancer vaccine", "autogene cevumeran", "mRNA-4157",
"personalized immunotherapy", "cancer mRNA", "neoantigen immunotherapy"
```

**Status filter** (`TRIAL_SYNC_STATUSES`):
- Primary: `RECRUITING`, `NOT_YET_RECRUITING`, `ENROLLING_BY_INVITATION`
- Historical: `ACTIVE_NOT_RECRUITING`, `COMPLETED`

**API endpoint:** `https://clinicaltrials.gov/api/v2/studies`

**Sync strategy (as built):**
1. Full re-fetch + upsert on `nctId` every run (dataset is small: ~100-200 trials)
2. Raw JSON stored in `Trial.rawJson` field
3. Sites deleted and recreated from fresh API data each sync (no natural unique key)
4. `parsedEligibility` preserved if `rawEligibilityText` unchanged, cleared if changed
5. Vaccine-relevant intervention extracted by keyword matching (mrna, vaccine, neoantigen)
6. Mapbox geocoding only for sites missing CTG `geoPoint` coordinates

#### 2.1.2 Eligibility Parsing with Claude — IMPLEMENTED

**Status:** Completed (Session 2). Uses Claude Opus for accuracy over cost.

**Implementation files:**
- `apps/web/lib/eligibility-parser.ts` — Parser with few-shot examples, Zod validation, batch processing
- `packages/shared/src/types.ts` — `ParsedEligibility` interface (source of truth)
- `packages/shared/src/schemas.ts` — `parsedEligibilitySchema` Zod schema

**Model:** `claude-opus-4-20250514` (constant `CLAUDE_MODEL` in `apps/web/lib/ai.ts`)

**ParsedEligibility interface (as implemented):**
```typescript
interface ParsedEligibility {
  cancerTypes: { name: string; normalized: string }[];
  stages: string[];
  priorTreatments: {
    required: { name: string; type: string }[];
    excluded: { name: string; type: string }[];
  };
  biomarkers: {
    required: { name: string; condition: string }[];
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
  confidenceScore: number;  // 0-1
}
```

**Key implementation details:**
- System prompt includes 2 few-shot examples (melanoma + colorectal cancer)
- Confidence scoring rubric: 0.9-1.0 clear, 0.7-0.89 mostly clear, 0.5-0.69 ambiguous, <0.5 very unclear
- Sequential processing with 1s delay between requests (Opus rate limits)
- Each trial parsed independently; failures don't stop batch
- Zod validation catches malformed Claude output before DB write
- Raw eligibility text stored in `Trial.rawEligibilityText` (not in ParsedEligibility)

**Admin API routes for QA:**
- `POST /api/admin/trial-sync` — trigger sync + optional parse
- `GET /api/admin/trials` — list trials with filters (unparsed, low_confidence)
- `POST /api/admin/trials/[trialId]/reparse` — re-parse single trial
- Admin QA page at `/admin/trials` with table, confidence color-coding, expandable eligibility

#### 2.1.3 Patient Intake — Document-First Design — IMPLEMENTED

**Status:** Completed (Session 3). Document upload + manual intake paths fully functional. Pre-auth flow: upload/extract works without login, auth required only at confirm/save.

**Implementation files:**
- `apps/web/lib/s3.ts` — S3 presigned PUT (15min) / GET (1hr) URL generation
- `apps/web/lib/extraction.ts` — Claude Vision extraction pipeline: type detection → pathology/lab/treatment extractors → merge into PatientProfile → Redis state
- `apps/web/lib/image-quality.ts` — Client-side canvas quality checks (resolution ≥800px, brightness 40-240, file size 50KB-20MB), thumbnails, HEIC→JPEG conversion
- `apps/web/lib/ai.ts` — `analyzeMultipleImages()` for multi-page documents, PDF `document` content block support
- `apps/web/components/DocumentUploader.tsx` — Mobile-first upload (camera capture + file picker), S3 presigned upload with XHR progress, thumbnail grid
- `apps/web/components/ManualIntakeWizard.tsx` — 4-step wizard (cancer basics, biomarkers, treatments, demographics)
- `apps/web/components/InlineMagicLink.tsx` — Inline auth with session polling (3s interval)
- `apps/web/app/api/documents/upload-url/route.ts` — POST: presigned S3 PUT URL (no auth)
- `apps/web/app/api/documents/extract/route.ts` — POST: await full Claude Vision pipeline, return profile
- `apps/web/app/api/documents/extract/[extractionId]/route.ts` — GET: re-fetch from Redis
- `apps/web/app/api/auth/session/route.ts` — GET: session check for InlineMagicLink polling
- `apps/web/app/api/patients/route.ts` — POST: create Patient + DocumentUpload in transaction
- `apps/web/app/api/patients/me/route.ts` — GET: return patient with profile + documents
- `/start/upload`, `/start/manual`, `/start/confirm` — Full page implementations

**Key implementation details:**
- Extraction uses Claude Opus (not Sonnet) for accuracy on medical documents
- `POST /api/documents/extract` awaits the full pipeline (10-30s) — no polling needed
- Redis stores results (1hr TTL) as backup re-fetch mechanism
- S3 keys stored in `sessionStorage` pre-auth, DB records created only at confirm
- Auth redirect: magic-link route forwards `?redirect=` param → verify route redirects back
- Confirm page wraps `useSearchParams()` in Suspense boundary (Next.js 15 requirement)
- HEIC conversion uses `heic2any` (WebAssembly, dynamically imported)
- Confidence badges: green ≥0.8, yellow 0.5-0.79, red <0.5, gray for manual/no data

**Design principle:** Cancer patients are drowning in paperwork. The primary intake path is document upload (photo/PDF of pathology report), NOT manual form entry. Claude Vision extracts structured clinical data, patient confirms or corrects in a pre-filled form. Three taps instead of twenty form fields.

**Intake priority order:**
1. **MyChart Connect** (highest fidelity — see 2.1.3a)
2. **Document upload** (photo/screenshot/PDF of pathology report)
3. **Manual entry** (fallback only)

```typescript
// packages/doc-ingestion/src/types.ts  (spec reference — implemented in apps/web/lib/)

// Supported input types
type DocumentInput = {
  type: "image" | "pdf";
  mimeType: "image/jpeg" | "image/png" | "image/heic" | "image/webp" | "application/pdf";
  source: "camera" | "photo_library" | "file_picker" | "screenshot";
  files: File[];                        // Support multi-page (3-5 page pathology reports)
};

// What we extract from each document type
interface PathologyReportExtraction {
  cancerType: string;                   // "Invasive ductal carcinoma"
  cancerTypeNormalized: string;         // "breast_idc" — our internal taxonomy
  histologicalGrade: string;            // "Grade 2 (moderately differentiated)"
  stage: {
    clinical: string;                   // "cT2N1M0"
    pathological?: string;              // "pT2N1aM0"
    summary: string;                    // "Stage IIB"
  };
  receptorStatus: {                     // Critical for breast cancer matching
    er: { status: "positive" | "negative" | "unknown"; percentage?: number };
    pr: { status: "positive" | "negative" | "unknown"; percentage?: number };
    her2: { status: "positive" | "negative" | "equivocal" | "unknown"; method?: string };
  };
  ki67?: { percentage: number };
  margins: string;                      // "Negative (closest margin 3mm)"
  lymphNodes: {
    examined: number;
    positive: number;
    details?: string;
  };
  biomarkers: Record<string, string>;   // PD-L1, BRCA1/2, PIK3CA, etc.
  specimenDate: string;
  facility: string;                     // Pathology lab name
}

interface LabReportExtraction {
  values: {
    name: string;                       // "Absolute Neutrophil Count"
    value: number;
    unit: string;
    referenceRange: string;
    date: string;
    inRange: boolean;
  }[];
}

interface TreatmentSummaryExtraction {
  treatments: {
    name: string;                       // "Doxorubicin/Cyclophosphamide (AC)"
    type: "chemotherapy" | "radiation" | "surgery" | "immunotherapy" | "targeted" | "hormonal";
    startDate: string;
    endDate?: string;
    cycles?: number;
    response?: string;                  // "Partial response", "Stable disease", etc.
    discontinued?: boolean;
    discontinuationReason?: string;
  }[];
}

// Unified extraction result with per-field confidence
interface DocumentExtractionResult {
  documentType: "pathology_report" | "lab_report" | "treatment_summary" | "imaging_report" | "unknown";
  extraction: PathologyReportExtraction | LabReportExtraction | TreatmentSummaryExtraction;
  fieldConfidence: Record<string, number>;    // 0-1 per extracted field
  needsReview: string[];                       // Fields below 0.8 confidence threshold
  couldNotExtract: string[];                   // Fields we looked for but couldn't find
  rawText: string;                             // Full OCR text for reference
  qualityIssues: string[];                     // "Image blurry", "Page partially cut off", etc.
}
```

**Claude Vision extraction prompt pattern:**

```typescript
// packages/doc-ingestion/src/extract.ts

const PATHOLOGY_EXTRACTION_PROMPT = `
You are extracting structured clinical data from a cancer pathology report.
This data will be used to match the patient to clinical trials.

CRITICAL RULES:
- Extract ONLY what is explicitly stated in the document
- If a field is not mentioned, return "not_found" — never guess
- For receptor status, extract both the status AND the percentage if given
- Preserve exact staging notation (TNM format)
- Flag any field where the text is ambiguous or partially illegible

For each extracted field, provide a confidence score (0.0 to 1.0):
- 1.0 = clearly stated, unambiguous
- 0.7-0.9 = stated but requires interpretation
- 0.5-0.7 = partially legible or implied
- Below 0.5 = uncertain, flag for patient review

Return JSON matching this schema: {schema}

IMPORTANT: This is a medical context. Accuracy matters more than completeness.
It is better to leave a field empty than to extract it incorrectly.
`;

// Multi-image handling for multi-page documents
async function extractFromDocuments(
  files: File[],
  documentType?: string
): Promise<DocumentExtractionResult> {
  // Convert all files to base64
  const images = await Promise.all(files.map(fileToBase64));
  
  // Single Claude Vision call with all pages
  // Claude handles multi-page context natively
  const response = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: [
        ...images.map(img => ({
          type: "image" as const,
          source: { type: "base64" as const, media_type: img.mimeType, data: img.data }
        })),
        {
          type: "text",
          text: documentType 
            ? EXTRACTION_PROMPTS[documentType]
            : AUTO_DETECT_AND_EXTRACT_PROMPT
        }
      ]
    }]
  });
  
  return parseExtractionResponse(response);
}
```

**UX flow — "Extract and Confirm" pattern:**

```
SCREEN 1: "Let's get your cancer details"
  ┌─────────────────────────────────────────┐
  │  📄 Upload your pathology report        │  ← PRIMARY action
  │     Take a photo or upload PDF          │
  │                                         │
  │  🏥 Connect MyChart                     │  ← SECONDARY (when available)
  │     Pull records automatically          │
  │                                         │
  │  ✏️  I'll enter details manually        │  ← FALLBACK
  │     (takes about 5 minutes)             │
  └─────────────────────────────────────────┘

SCREEN 2 (after upload): Processing indicator
  "Reading your pathology report..."
  "Extracting cancer type and staging..."
  "Identifying biomarker results..."
  (2-5 seconds for Claude Vision processing)

SCREEN 3: "Confirm your details"
  Pre-filled form with extracted data.
  Each field shows:
  ┌─────────────────────────────────────────┐
  │  Cancer Type         ✅ high confidence │
  │  Invasive ductal carcinoma (breast)     │
  │                                         │
  │  Stage               ✅ high confidence │
  │  Stage IIB (T2N1M0)                     │
  │                                         │
  │  ER Status           ✅ high confidence │
  │  Positive (95%)                         │
  │                                         │
  │  HER2 Status         ⚠️ needs review   │
  │  Equivocal (IHC 2+)  [Edit]            │
  │  "We found 'HER2 2+' — confirm if      │
  │   FISH testing was done"                │
  │                                         │
  │  PD-L1               ❌ not found      │
  │  Not in this report  [Add manually]     │
  │  "PD-L1 is often in a separate report   │
  │   — upload it here if you have it"      │
  └─────────────────────────────────────────┘

  [Looks good — find my matches →]
```

**Photo quality handling:**

```typescript
interface QualityCheck {
  readable: boolean;
  issues: QualityIssue[];
  suggestions: string[];
}

type QualityIssue = 
  | "too_blurry"           // → "Try holding your phone steady, or place the document on a flat surface"
  | "too_dark"             // → "Move to a well-lit area or turn on your flash"
  | "partially_cropped"    // → "Make sure the entire page is visible in the photo"
  | "glare"                // → "Tilt the document to reduce glare from overhead lights"
  | "wrong_document"       // → "This looks like an insurance form, not a pathology report"
  | "handwritten"          // → "Handwritten notes are hard to read — try uploading the typed report"
  | "low_resolution";      // → "Try moving your camera closer to the document"

// Run quality check BEFORE sending to Claude Vision (saves API cost)
// Use client-side image analysis: resolution check, blur detection, brightness
```

#### 2.1.3a MyChart / FHIR Integration (High-Priority Follow-Up) — IMPLEMENTED (Session 6)

> **Implementation files:** `apps/web/lib/fhir/{types,code-maps,client,smart-auth,extract-resources,mapper}.ts`, `apps/web/app/api/fhir/{authorize,callback,connections,extract,health-systems,resync,revoke}/route.ts`, `apps/web/app/start/mychart/page.tsx`, `apps/web/app/dashboard/records/page.tsx`, `apps/web/components/HealthSystemSearch.tsx`, `scripts/seed-health-systems.ts`

**Priority:** Ship immediately after Phase 1 MVP launch. This is the highest-fidelity intake path and eliminates both manual entry errors AND document photo quality issues.

**Architecture:** Epic MyChart exposes patient data via FHIR R4 APIs. Patient authorizes OncoVax to read their records via OAuth 2.0. We pull structured clinical data directly — no OCR, no extraction, no ambiguity.

```typescript
// packages/doc-ingestion/src/fhir/mychart.ts

interface MyChartIntegration {
  // OAuth 2.0 SMART on FHIR flow
  auth: {
    authorizationEndpoint: string;      // Per health system
    tokenEndpoint: string;
    scopes: [
      "patient/Patient.read",
      "patient/Condition.read",          // Cancer diagnosis
      "patient/DiagnosticReport.read",   // Pathology + lab reports
      "patient/Observation.read",        // Lab values, vitals
      "patient/MedicationRequest.read",  // Current/past treatments
      "patient/Procedure.read",          // Surgeries
      "patient/DocumentReference.read",  // Clinical documents
    ];
  };

  // FHIR resources we extract
  extractionTargets: {
    // Condition resource → cancer type, stage
    conditions: {
      filter: "category=encounter-diagnosis&code:below=C00-D49"; // ICD-10 neoplasm range
      extract: ["code", "stage", "bodySite", "onsetDateTime"];
    };

    // DiagnosticReport → pathology reports, genomic tests
    diagnosticReports: {
      filter: "category=pathology,genomics";
      extract: ["result", "conclusion", "effectiveDateTime", "performer"];
    };

    // Observation → biomarkers (ER, PR, HER2, PD-L1), lab values
    observations: {
      // LOINC codes for key cancer biomarkers
      biomarkerCodes: {
        er_status: "85337-4",
        pr_status: "85339-0",
        her2_status: "85319-2",
        her2_fish: "85318-4",
        ki67: "85329-1",
        pdl1: "85147-7",
        brca1: "BRCA1_LOINC",
        brca2: "BRCA2_LOINC",
        tmb: "94076-7",
        msi: "81695-9",
      };
      // Standard lab panels for trial eligibility
      labCodes: {
        anc: "751-8",                    // Absolute neutrophil count
        platelets: "777-3",
        hemoglobin: "718-7",
        creatinine: "2160-0",
        ast: "1920-8",
        alt: "1742-6",
        bilirubin: "1975-2",
        albumin: "1751-7",
      };
    };

    // MedicationRequest → prior therapies
    medications: {
      filter: "status=active,completed";
      // Map RxNorm codes to treatment categories
      categoryMapping: Record<string, TreatmentCategory>;
    };

    // Procedure → surgeries
    procedures: {
      filter: "category=surgical-procedure";
      extract: ["code", "performedDateTime", "outcome"];
    };
  };
}

// FHIR → PatientProfile mapping
async function fhirToPatientProfile(
  fhirBundle: FhirBundle
): Promise<{
  profile: PatientProfile;
  fieldSources: Record<string, string>;  // Which FHIR resource each field came from
  completeness: number;                   // 0-1, how complete the profile is
  missingFields: string[];                // Fields we couldn't find in FHIR data
}> {
  // Direct structured mapping — no LLM needed for this path
  // FHIR data is already coded (ICD-10, LOINC, RxNorm, SNOMED)
}
```

**Epic App Orchard registration required.** This is the main lead time — Epic's approval process takes 4-8 weeks. Start the application during Phase 1 MVP development so it's ready when Phase 1 ships.

**Multi-system support roadmap:**

```
Priority 1: Epic MyChart (covers ~38% of US hospital market)
  - FHIR R4 via App Orchard
  - OAuth 2.0 SMART on FHIR
  - Launch: 4-8 weeks after application

Priority 2: Cerner/Oracle Health (covers ~25% of US hospital market)
  - FHIR R4 via Oracle Health Marketplace
  - Similar OAuth flow
  - Launch: 8-12 weeks after Epic

Priority 3: SMART Health Links
  - Patient-mediated sharing (no institutional agreement needed)
  - Patient generates a link from their portal, pastes into OncoVax
  - Lower fidelity but works across any FHIR-enabled system
  - Launch: can build in parallel with Priority 1

Priority 4: Apple Health / CommonHealth
  - iPhone Health app already aggregates FHIR data from connected providers
  - HealthKit API on iOS, CommonHealth on Android
  - Patient-controlled, no provider agreement needed
  - Lower completeness but zero-friction import
```

**21st Century Cures Act tailwind:** As of 2024, all certified EHR systems MUST support patient-facing FHIR APIs. This isn't optional — health systems that block API access face penalties. The regulatory environment is on our side here.

```typescript
// Patient-facing UX for MyChart connect

// SCREEN: "Connect your medical records"
//
//  ┌────────────────────────────────────────────┐
//  │  🏥 Connect MyChart                        │
//  │                                            │
//  │  Search your hospital or health system:    │
//  │  ┌──────────────────────────────────┐      │
//  │  │ Memorial Sloan Kettering_        │      │
//  │  └──────────────────────────────────┘      │
//  │                                            │
//  │  Results:                                  │
//  │  ☑ Memorial Sloan Kettering Cancer Center  │
//  │    MyChart via Epic                        │
//  │                                            │
//  │  [Connect →]                               │
//  │                                            │
//  │  This will open MyChart to authorize       │
//  │  OncoVax to read your cancer records.      │
//  │  We access ONLY diagnosis, lab, and        │
//  │  treatment data. We never modify your      │
//  │  records.                                  │
//  └────────────────────────────────────────────┘
//
//  → OAuth redirect to MyChart
//  → Patient logs in + approves scopes
//  → Redirect back with authorization code
//  → Pull FHIR resources, map to PatientProfile
//  → Show pre-filled "Confirm your details" screen (same as doc upload path)
```

**Privacy and trust UX considerations:**

```typescript
interface DataAccessTransparency {
  // Show patient exactly what we accessed
  accessLog: {
    resourceType: string;      // "Condition", "Observation", etc.
    description: string;       // "Your breast cancer diagnosis"
    accessed: boolean;         // Did we actually read this?
    usedFor: string;           // "Trial matching — cancer type filter"
  }[];

  // Patient controls
  canRevoke: boolean;          // Always true — revoke OAuth token
  canDelete: boolean;          // Always true — delete all pulled data
  dataRetention: string;       // "We keep your data only while your account is active"
  
  // What we DON'T access
  excluded: [
    "Mental health notes",
    "Substance use records", 
    "HIV/STI status",
    "Reproductive health",
    "Financial/billing records"
  ];
}
```

Now continuing with the original intake schema, updated to reflect document-first as the primary path:

```typescript
// Patient profile — populated by ANY intake path (doc upload, MyChart, or manual)
interface PatientProfile {
  // Source tracking
  intakePath: "document_upload" | "mychart_fhir" | "manual_entry";
  documentsUploaded: string[];           // S3 paths to uploaded docs
  fhirConnectionId?: string;             // If connected via MyChart

  // Core clinical data (extracted or entered)
  cancerType: string;                    // "breast cancer" — we normalize
  cancerTypeIcd10?: string;              // ICD-10 code if from FHIR
  dateOfDiagnosis: string;
  currentlyInTreatment: boolean;

  // Clinical details
  stage?: string;
  subtype?: string;                      // "Triple negative", "HER2+", etc.
  receptorStatus?: {                     // Breast cancer specific
    er?: string;
    pr?: string;
    her2?: string;
  };
  biomarkers?: Record<string, string>;
  hadSurgery?: boolean;
  priorTreatments?: {
    name: string;
    type: string;
    dates?: string;
  }[];
  ecogStatus?: number;

  // Lab values (for trial eligibility checking)
  labValues?: {
    name: string;
    value: number;
    unit: string;
    date: string;
  }[];

  // Logistics
  zipCode: string;
  willingToTravel: boolean;
  travelRadiusMiles?: number;
  hasOncologist: boolean;

  // Contact
  email: string;
  name?: string;
  role: "patient" | "caregiver" | "advocate";

  // Field-level metadata
  fieldSources: Record<string, "extracted" | "fhir" | "manual">;
  fieldConfidence: Record<string, number>;
}
```

#### 2.1.4 Matching Algorithm — IMPLEMENTED

**Status:** Completed (Session 4). 3-tier matching engine with cancer type fuzzy matching, stage comparison, and LLM-assisted assessment.

**Implementation files:**
- `apps/web/lib/matcher.ts` — Full 3-tier matching pipeline
- `apps/web/lib/oncologist-brief.ts` — Claude-powered oncologist brief generator
- `apps/web/app/api/matches/route.ts` — GET: list patient matches sorted by score
- `apps/web/app/api/matches/[matchId]/route.ts` — GET: match detail + trial + sites, PATCH: update status
- `apps/web/app/api/matches/generate/route.ts` — POST: trigger match generation
- `apps/web/app/api/matches/[matchId]/brief/route.ts` — GET: generate oncologist brief
- `apps/web/components/MatchCard.tsx` — Match card with score badge + breakdown pills
- `apps/web/components/EligibilityBreakdown.tsx` — 6-dimension breakdown + LLM assessment panel
- `/matches`, `/matches/[trialId]`, `/matches/[trialId]/contact` — Full page implementations

**MatchResult interface (as implemented in `packages/shared/src/types.ts`):**
```typescript
interface MatchBreakdownItem {
  category: string;      // cancerType, stage, biomarkers, priorTreatments, ecog, age
  score: number;         // 0-100
  weight: number;        // 0-1 (sum = 1.0)
  status: 'match' | 'unknown' | 'mismatch';
  reason: string;        // Human-readable explanation
}

interface LLMAssessment {
  overallAssessment: 'likely_eligible' | 'possibly_eligible' | 'likely_ineligible';
  reasoning: string;
  potentialBlockers: string[];
  missingInfo: string[];
  actionItems: string[];
}

interface MatchResult {
  trialId: string;
  matchScore: number;
  matchBreakdown: MatchBreakdownItem[];
  potentialBlockers: string[];
  llmAssessment?: LLMAssessment;
  status: string;
}
```

**Matching architecture (as built):**

**Tier 1 — Hard Filters:**
- Cancer type mismatch (fuzzy matching with 15-type alias table including subtypes like TNBC, IDC, NSCLC)
- Age out of range
- Trial not recruiting / missing parsedEligibility
- "Unknown" matches are kept (benefit of the doubt)

**Tier 2 — Soft Scoring (6 weighted dimensions):**
| Dimension | Weight | Matching Logic |
|---|---|---|
| Cancer Type | 0.25 | Alias table fuzzy match + "solid tumor" basket trial detection |
| Stage | 0.20 | Roman numeral parsing (I→1, IIA→2.1, etc.) + keyword mapping ("metastatic"→4, "locally advanced"→3) |
| Biomarkers | 0.20 | Required/excluded check against patient biomarkers + receptor status (ER/PR/HER2) |
| Prior Treatments | 0.15 | Required/excluded treatment matching with substring comparison |
| ECOG | 0.10 | Range-based comparison against trial's ecogRange |
| Age | 0.10 | Range-based comparison against trial's ageRange |

Scoring: match=100, unknown=50, mismatch=0. Final score = weighted sum.

**Tier 3 — LLM Assessment (top 10 only):**
- Claude Opus evaluates patient profile vs. raw eligibility text
- Returns structured JSON: overallAssessment, reasoning, blockers, missing info, action items
- Can cap score to 30 if "likely_ineligible"
- 1s rate limit between requests

**Match generation trigger:** Fire-and-forget on patient create (`POST /api/patients`). Also available via `POST /api/matches/generate` for manual re-generation.

**Match status workflow:** `new` → `saved` / `dismissed` / `contacted` / `applied`

### 2.2 Database Schema (Phase 1)

```sql
-- Core trial data (normalized from ClinicalTrials.gov)
CREATE TABLE trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nct_id TEXT UNIQUE NOT NULL,           -- e.g., "NCT06295809"
  title TEXT NOT NULL,
  brief_summary TEXT,
  sponsor TEXT,
  phase TEXT,                             -- "Phase I", "Phase II", etc.
  status TEXT NOT NULL,                   -- "RECRUITING", etc.
  start_date DATE,
  estimated_completion DATE,
  enrollment_target INTEGER,

  -- Parsed eligibility (JSONB for flexibility during iteration)
  parsed_eligibility JSONB,              -- ParsedEligibility structure
  raw_eligibility_inclusion TEXT,
  raw_eligibility_exclusion TEXT,
  eligibility_parse_confidence FLOAT,

  -- Intervention details
  intervention_type TEXT,                 -- "mRNA vaccine", "peptide vaccine", etc.
  intervention_names TEXT[],
  combination_therapies TEXT[],           -- e.g., ["pembrolizumab"]

  -- Search and sync metadata
  last_synced_at TIMESTAMPTZ NOT NULL,
  clinicaltrials_gov_url TEXT,
  search_vector TSVECTOR,                -- Full-text search

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trial sites with geocoding
CREATE TABLE trial_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID REFERENCES trials(id),
  facility_name TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  zip_code TEXT,
  latitude FLOAT,
  longitude FLOAT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT                             -- "RECRUITING" at this specific site
);

-- Patient profiles
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'patient',   -- patient, caregiver, advocate
  intake_path TEXT NOT NULL,              -- document_upload, mychart_fhir, manual_entry
  profile JSONB NOT NULL,                 -- PatientProfile structure
  field_sources JSONB,                    -- Which field came from which source
  field_confidence JSONB,                 -- Per-field confidence scores
  zip_code TEXT,
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploaded medical documents (photos, PDFs)
CREATE TABLE document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  document_type TEXT,                     -- pathology_report, lab_report, treatment_summary, imaging_report
  file_count INTEGER NOT NULL DEFAULT 1,  -- Number of pages/images
  storage_paths TEXT[] NOT NULL,           -- S3 paths to uploaded files
  mime_type TEXT NOT NULL,
  
  -- Extraction results
  extraction_status TEXT DEFAULT 'pending', -- pending, processing, complete, failed, needs_review
  extraction_result JSONB,                 -- DocumentExtractionResult structure
  quality_issues TEXT[],                   -- Photo quality problems detected
  fields_extracted INTEGER,                -- How many fields we got
  fields_needing_review INTEGER,           -- How many below confidence threshold
  patient_confirmed BOOLEAN DEFAULT FALSE, -- Patient reviewed and confirmed
  
  -- Processing metadata
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  claude_model_used TEXT,                  -- Track which model version
  token_cost INTEGER,                      -- Track API cost per extraction
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FHIR / MyChart connections
CREATE TABLE fhir_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  provider_system TEXT NOT NULL,           -- "epic_mychart", "cerner", "apple_health"
  health_system_name TEXT,                 -- "Memorial Sloan Kettering", etc.
  fhir_base_url TEXT NOT NULL,
  
  -- OAuth tokens (encrypted at rest)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes_granted TEXT[],
  
  -- Sync state
  last_synced_at TIMESTAMPTZ,
  resources_pulled JSONB,                  -- Which FHIR resources we accessed
  sync_status TEXT DEFAULT 'connected',    -- connected, token_expired, revoked, error
  
  -- Patient consent
  consent_granted_at TIMESTAMPTZ NOT NULL,
  consent_scopes TEXT[],                   -- What the patient agreed to share
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match results (stored for re-notification when new trials appear)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  trial_id UUID REFERENCES trials(id),
  match_score FLOAT NOT NULL,
  match_breakdown JSONB NOT NULL,
  potential_blockers TEXT[],
  status TEXT DEFAULT 'new',              -- new, viewed, contacted, enrolled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  UNIQUE(patient_id, trial_id)
);

-- Indexes
CREATE INDEX idx_trials_search ON trials USING GIN(search_vector);
CREATE INDEX idx_trials_status ON trials(status);
CREATE INDEX idx_trial_sites_geo ON trial_sites(latitude, longitude);
CREATE INDEX idx_matches_patient ON matches(patient_id, match_score DESC);
CREATE INDEX idx_doc_uploads_patient ON document_uploads(patient_id, created_at DESC);
CREATE INDEX idx_fhir_connections_patient ON fhir_connections(patient_id);
```

**Note on Prisma schema:** The above SQL is the logical schema. For implementation, this translates to a Prisma schema file (`packages/db/prisma/schema.prisma`). JSONB columns map to Prisma's `Json` type. Encrypted fields use application-level encryption before Prisma write — Prisma stores them as `String`. The Prisma schema should be the single source of truth; use `prisma migrate` for all DDL.

### 2.3 Key Pages / Routes

```
/                           Landing page — "Find personalized cancer vaccine trials"
/start                      Intake method picker (upload doc, connect MyChart, or manual)
/start/upload               Document upload — camera/photo/PDF with processing status
/start/mychart              MyChart OAuth flow — health system search + connect
/start/manual               Manual intake wizard (fallback)
/start/confirm              Extract-and-confirm screen (pre-filled from any intake path)
/matches                    Results page — ranked trial matches with map
/matches/[trialId]          Trial detail — eligibility breakdown, sites, how to enroll
/matches/[trialId]/contact  Generate email to oncologist about this trial
/translate                  Treatment Translator — personalized diagnosis + treatment explainer
/financial                  Financial Assistance Finder — matched programs + application help
/financial/[programId]      Program detail — eligibility, how to apply, status
/dashboard                  Saved matches, uploaded docs, financial matches, notification prefs
/dashboard/records          Manage connected health records + uploaded documents
/learn                      Educational content: what is a personalized vaccine, etc.
```

### 2.4 Oncologist Communication Generator

Critical feature: patients need to bring this information to their doctor. Generate a clear, professional summary the patient can email or print.

```typescript
// Generate oncologist-facing summary
interface OncologistBrief {
  patientName: string;
  diagnosis: string;
  matchedTrials: {
    nctId: string;
    title: string;
    phase: string;
    nearestSite: string;
    keyEligibility: string;    // 2-3 sentence summary
    enrollmentUrl: string;
  }[];
  generatedDate: string;
  disclaimer: string;          // "This is an AI-generated summary..."
}
```

### 2.5 Treatment Translator — IMPLEMENTED

**Status:** Completed (Session 5). Two-step Claude pipeline with Redis caching and magazine-style UI.

**Implementation files:**
- `apps/web/lib/translator.ts` — Two-step Claude pipeline (clinical grounding → patient translation), second opinion trigger detection (4 rules)
- `apps/web/app/api/translator/route.ts` — GET: cached translation from Redis. POST: generate fresh via pipeline.
- `apps/web/app/translate/page.tsx` — Magazine-style reading experience with collapsible sections
- `apps/web/components/TranslationSection.tsx` — Reusable collapsible section component

**Purpose:** When a patient gets diagnosed, their oncologist communicates in clinical shorthand that's incomprehensible to most people. The Treatment Translator takes the patient's extracted clinical profile and generates a personalized, plain-language explainer of their diagnosis, treatment plan, and what to expect.

**This requires zero new data collection** — it runs entirely on the profile already extracted via document upload, MyChart, or manual entry. It's a Claude-powered feature that transforms clinical data into human understanding.

```typescript
// packages/api/src/routers/translator.ts

interface TreatmentTranslation {
  // Section 1: "What you have"
  diagnosisExplainer: {
    plainLanguage: string;           // "You have a type of breast cancer called invasive ductal carcinoma..."
    whatItMeans: string;             // "Ductal means it started in the milk ducts. Invasive means..."
    stageExplainer: string;          // "Stage IIB means the tumor is between 2-5cm and has spread to 1-3 lymph nodes..."
    subtypeExplainer: string;        // "Your cancer is ER+/PR+/HER2-. This means..."
    prognosisContext: string;        // "The 5-year survival rate for Stage IIB ER+ breast cancer is approximately..."
    // NOTE: prognosis framing is delicate — present as population statistics, not individual predictions
  };

  // Section 2: "Why this treatment was chosen"
  treatmentRationale: {
    overview: string;                // "Based on your specific cancer type and stage, the standard approach is..."
    whyTheseDrugs: {
      name: string;                  // "Doxorubicin (Adriamycin)"
      brandName: string;             // Often patients hear the brand name
      plainDescription: string;      // "This is a chemotherapy drug that works by..."
      whyForYou: string;             // "It's recommended for your subtype because..."
      commonSideEffects: string[];   // Most common, not exhaustive
      rareButSerious: string[];      // Things to watch for
    }[];
    treatmentSequence: string;       // "First you'll receive 4 cycles of AC (every 2 weeks), then..."
    expectedDuration: string;        // "The full treatment typically takes 4-6 months"
    evidenceBasis: string;           // "This approach is based on [KEYNOTE-522 trial / NSABP B-31]..."
  };

  // Section 3: "What to expect"
  timeline: {
    phases: {
      name: string;                  // "Neoadjuvant chemotherapy"
      duration: string;              // "8-12 weeks"
      whatHappens: string;           // "You'll receive infusions every 2 weeks..."
      sideEffectTimeline: string;    // "Days 1-3: nausea most common. Days 7-14: fatigue peaks..."
      practicalTips: string[];       // "Eat light meals before infusion", "Plan for 2-3 rest days after"
    }[];
  };

  // Section 4: "Questions to ask your oncologist"
  questionsToAsk: {
    question: string;
    whyItMatters: string;
    whatToListenFor: string;
  }[];

  // Section 5: "What else you should know"
  additionalConsiderations: {
    geneticTesting: string | null;   // If applicable: "Given your age/family history, ask about BRCA testing"
    fertilityPreservation: string | null;  // If premenopausal: "Chemo can affect fertility. Ask about egg freezing BEFORE starting treatment"
    clinicalTrials: string;          // "Based on your profile, there may be clinical trials available" → links to matches
    secondOpinion: string;           // When/why to consider
  };

  // Metadata
  basedOn: {
    cancerType: string;
    stage: string;
    subtype: string;
    treatments: string[];
    dataSource: "extracted" | "fhir" | "manual";
  };
  generatedAt: string;
  disclaimer: string;                // "This is an AI-generated educational summary, not medical advice..."
}
```

**Claude prompt architecture:**

The Treatment Translator uses a two-step Claude pipeline:

1. **Clinical grounding call**: Given the patient's profile, query Claude with a system prompt that includes current NCCN guideline summaries for their specific cancer type + subtype + stage. This grounds the translation in evidence-based recommendations rather than generic information. The system prompt includes:
   - Current standard-of-care protocols for the specific diagnosis
   - Published survival statistics (from NCI SEER database)
   - Known clinical trials for this profile (from our trial database)
   - Drug mechanism of action summaries

2. **Patient-facing translation call**: Takes the clinical grounding output and translates it into plain language at approximately an 8th-grade reading level. Explicitly instructed to:
   - Never minimize the seriousness of cancer
   - Never give false reassurance
   - Present statistics as ranges, not certainties
   - Flag when a patient's treatment plan deviates from standard guidelines (potential second opinion trigger)
   - Always recommend discussing questions with their oncologist
   - Note if the patient's specific subtype has active immunotherapy/vaccine trials

**Second Opinion Trigger Logic:**

The translator includes a lightweight second opinion assessment. Flag for second opinion consideration when:
- Treatment plan doesn't align with current NCCN guidelines for their subtype/stage
- Patient is at a community practice and their cancer type has specialized treatment centers
- Specific situations with active clinical debate (e.g., de-escalation vs. standard dose for low-risk subtypes)
- Patient's biomarker profile suggests eligibility for targeted therapies not mentioned in their treatment plan
- Triple-negative breast cancer without mention of immunotherapy (pembrolizumab + chemo is now standard for early-stage TNBC)

This is NOT about undermining their oncologist — it's about ensuring patients at lower-resourced settings get the same quality of information as patients at MSK or Dana-Farber.

**Route:** `app/translate/page.tsx` — accessible from dashboard after intake is complete

**UX:** Magazine-style reading experience, not a data dump. Collapsible sections. "Save as PDF" for bringing to appointments. "Share with family" option (generates a simplified version for caregivers). Interactive drug timeline visualization.

### 2.6 Financial Assistance Finder — IMPLEMENTED

**Status:** Completed (Session 5). 30 programs seeded, deterministic matching engine, financial results UI.

**Implementation files:**
- `apps/web/lib/financial-matcher.ts` — Deterministic matching engine (6 dimensions: cancer type, insurance, income/FPL, age, treatment drugs, geography)
- `apps/web/app/api/financial/route.ts` — GET: matched programs grouped by category
- `apps/web/app/api/financial/[programId]/route.ts` — GET: program detail + patient match
- `apps/web/app/api/financial/subscribe/route.ts` — POST: subscribe to fund reopen alerts
- `apps/web/app/financial/page.tsx` — Hero banner with estimated savings, programs by category
- `apps/web/app/financial/[programId]/page.tsx` — Program detail with eligibility, how to apply, contact
- `apps/web/components/FinancialProgramCard.tsx` — Card with status badge + match badge + apply button
- `scripts/seed-financial-programs.ts` — Seeds 30 programs (6 copay foundations, 5 breast cancer nonprofits, 8 pharma PAPs, 6 practical assistance, 5 government programs)
- `scripts/financial-status-check.ts` — CLI to check/update fund statuses
- `apps/web/app/start/confirm/page.tsx` — Extended with optional financial profile section (insurance, household, income, concerns)

**Purpose:** Cancer is the #1 cause of medical bankruptcy in the US. There are 200+ financial assistance programs available to cancer patients — copay assistance, living expense grants, free medications, transportation help, lodging, childcare support — but most patients don't know they exist or can't navigate the eligibility requirements. This module matches patients to every program they qualify for, pre-fills applications, and tracks open/closed fund status.

**Architecturally identical to the trial matcher:** A database of programs with structured eligibility rules, matched against the patient's profile. The difference is the matching dimensions are financial/logistic rather than clinical.

```typescript
// packages/api/src/routers/financial.ts

interface FinancialAssistanceProgram {
  id: string;
  name: string;                         // "CancerCare Co-Payment Assistance Foundation"
  organization: string;                 // "CancerCare"
  type: FinancialAssistanceType;
  description: string;
  
  // What they help with
  assistanceCategories: AssistanceCategory[];
  maxBenefitAmount: number | null;      // Dollar amount if known
  benefitDescription: string;           // "Up to $10,000 per year for copays"
  
  // Eligibility rules (structured for matching)
  eligibility: {
    cancerTypes: string[] | "all";      // Which cancers qualify
    insuranceRequired: boolean | null;   // Some require insurance, some require NO insurance
    insuranceTypes: string[];            // "commercial", "medicare", "medicaid", "uninsured"
    incomeLimit: {                       // Federal Poverty Level multiples
      individual: number | null;         // e.g., 4.0 = 400% FPL
      household: number | null;
    };
    ageRange: { min: number | null; max: number | null };
    treatmentTypes: string[] | "all";    // Specific drugs or treatment categories
    geographicRestrictions: string[];    // "US only", specific states, etc.
    otherRequirements: string[];         // Free text for complex rules
    citizenshipRequired: boolean;
  };
  
  // Program status (funds open/close frequently)
  status: "open" | "closed" | "waitlist" | "unknown";
  lastStatusCheck: string;
  statusUrl: string;                    // Where to check current status
  
  // Application
  applicationProcess: "phone" | "online" | "mail" | "fax";
  applicationUrl: string | null;
  applicationPhone: string | null;
  requiredDocuments: string[];          // "Proof of income", "Insurance card", etc.
  turnaroundTime: string;              // "Same day", "2-4 weeks", etc.
  
  // Contact
  phone: string;
  website: string;
  email: string | null;
  hours: string;
}

type AssistanceCategory = 
  | "copay_treatment"           // Drug copays (biggest $$ impact)
  | "copay_diagnostics"         // Testing/imaging copays
  | "insurance_premium"         // Help paying insurance premiums
  | "transportation"            // Gas cards, ride vouchers, flights
  | "lodging"                   // Housing during treatment
  | "living_expenses"           // Rent, mortgage, utilities
  | "food"                      // Groceries, meal delivery
  | "childcare"                 // Childcare during treatment
  | "free_medication"           // Pharma patient assistance (free drugs)
  | "fertility_preservation"    // Egg/embryo freezing
  | "mental_health"             // Counseling/therapy
  | "genetic_testing"           // Genetic counseling/testing
  | "home_care"                 // In-home care assistance
  | "wigs_prosthetics"          // Appearance-related
  | "legal"                     // Legal aid for insurance disputes, employment
  | "disability"                // SSI/SSDI application help
  | "clinical_trial_travel";    // Travel costs for clinical trial participation

type FinancialAssistanceType =
  | "copay_foundation"          // CancerCare, HealthWell, PAN Foundation, Good Days
  | "pharma_pap"                // Manufacturer patient assistance programs
  | "nonprofit_grant"           // Susan G. Komen, Pink Fund, etc.
  | "government_program"        // Medicaid, Medicare Extra Help, SSI
  | "hospital_charity"          // Hospital financial assistance / charity care
  | "lodging_program"           // Hope Lodge, Ronald McDonald House
  | "transportation_program"    // Road to Recovery, Angel Flight
  | "general_assistance";       // United Way, local charities
```

**Matching against patient profile:**

```typescript
interface FinancialMatchResult {
  program: FinancialAssistanceProgram;
  matchStatus: "eligible" | "likely_eligible" | "check_eligibility" | "ineligible";
  estimatedBenefit: string;             // "$5,000-10,000/year in copay relief"
  matchReasoning: string;               // "Your breast cancer diagnosis and commercial insurance qualify you..."
  missingInfo: string[];                // "We need your household income to confirm eligibility"
  applicationSteps: string[];           // Ordered steps to apply
  urgency: "apply_now" | "plan_ahead" | "if_needed";
  // "apply_now" = funds are open and patient likely qualifies now
  // "plan_ahead" = fund closed but will reopen; sign up for alerts
  // "if_needed" = available if patient hits financial difficulty
}

// Financial profile additions to PatientProfile
interface FinancialProfile {
  insuranceType: "commercial" | "medicare" | "medicaid" | "uninsured" | "other";
  insuranceProvider?: string;
  householdSize: number;
  householdIncome?: {
    annual: number;
    fplPercentage: number;              // Auto-calculated from income + household size
  };
  currentTreatmentDrugs?: string[];     // For matching pharma PAPs
  financialConcerns: AssistanceCategory[];  // What they need help with
  state: string;                        // For state-specific programs
}
```

**Program database seeding — priority order:**

1. **Copay foundations** (biggest dollar impact per patient):
   - CancerCare Co-Payment Assistance Foundation
   - HealthWell Foundation
   - Patient Access Network (PAN) Foundation
   - Good Days
   - Patient Advocate Foundation Co-Pay Relief
   - The Assistance Fund
   
2. **Breast cancer-specific grants:**
   - Susan G. Komen Financial Assistance
   - The Pink Fund (living expenses during treatment)
   - Sisters Network Breast Cancer Assistance
   - Genevieve's Helping Hands (patients under 40)
   - Young Survival Coalition

3. **Pharma patient assistance programs** (free drugs):
   - Every drug the patient is prescribed has a manufacturer PAP
   - Map common breast cancer drugs → manufacturer programs
   - Pfizer, Genentech/Roche, AstraZeneca, Novartis, Lilly PAPs

4. **Practical assistance:**
   - American Cancer Society Hope Lodge (free lodging)
   - ACS Road to Recovery (free rides to treatment)
   - Angel Flight (free flights for distant treatment)
   - Meals on Wheels
   - Family Reach (families with children)

5. **Government programs:**
   - Medicaid (many patients don't know they qualify)
   - Medicare Extra Help / Low-Income Subsidy
   - SSI/SSDI disability
   - State pharmaceutical assistance programs

**Fund status monitoring:**

Many copay foundations open and close their funds as money comes in and runs out. Build a status monitoring worker that:
- Checks each program's status page daily
- Updates open/closed/waitlist status in the database
- Notifies patients when a previously-closed fund reopens for their cancer type
- "Sign me up for alerts" for closed funds

**Route:** `app/financial/page.tsx` — accessible from dashboard, also surfaced in treatment translator ("Your treatment may cost $X out-of-pocket — here are programs that can help")

**UX:**
- Ranked list of programs the patient qualifies for, sorted by estimated benefit
- Total potential savings displayed prominently ("You may qualify for up to $XX,XXX in assistance")
- One-click application links with pre-filled info where possible
- Checklist of required documents for each program
- Status indicators: 🟢 Open — Apply Now / 🟡 Waitlist / 🔴 Closed — Get Notified
- "What you'll need" section: documents to gather before applying (income verification, insurance card, diagnosis letter)

```sql
-- Financial assistance programs directory
CREATE TABLE financial_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  type TEXT NOT NULL,                    -- copay_foundation, pharma_pap, nonprofit_grant, etc.
  assistance_categories TEXT[] NOT NULL,
  description TEXT,
  max_benefit_amount FLOAT,
  benefit_description TEXT,
  
  -- Structured eligibility
  eligibility JSONB NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'unknown',         -- open, closed, waitlist, unknown
  status_url TEXT,
  last_status_check TIMESTAMPTZ,
  
  -- Application info
  application_process TEXT,
  application_url TEXT,
  application_phone TEXT,
  required_documents TEXT[],
  turnaround_time TEXT,
  
  -- Contact
  phone TEXT,
  website TEXT NOT NULL,
  email TEXT,
  hours TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient financial matches
CREATE TABLE financial_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  program_id UUID REFERENCES financial_programs(id),
  match_status TEXT NOT NULL,            -- eligible, likely_eligible, check_eligibility, ineligible
  estimated_benefit TEXT,
  match_reasoning TEXT,
  missing_info TEXT[],
  status TEXT DEFAULT 'new',             -- new, applied, approved, denied
  applied_at TIMESTAMPTZ,
  notify_on_reopen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, program_id)
);

CREATE INDEX idx_financial_programs_type ON financial_programs(type);
CREATE INDEX idx_financial_programs_status ON financial_programs(status);
CREATE INDEX idx_financial_matches_patient ON financial_matches(patient_id, match_status);
```

### 2.7 Phase 1 Build Sequence (for Claude Code)

```
TASK 1: Set up Turborepo package structure + Prisma schema + DB migrations
TASK 2: Build ClinicalTrials.gov API sync worker
  - Fetch studies matching search terms
  - Store raw JSON
  - Parse into trials table
  - Geocode trial sites
TASK 3: Build Claude eligibility parser
  - Prompt engineering for reliable structured extraction
  - Test against 20+ real trial eligibility texts
  - Store parsed results
TASK 4: Build document ingestion engine (PRIMARY INTAKE PATH)
  - Multi-file upload component (camera, photo library, PDF)
  - Client-side quality checks (blur, brightness, resolution)
  - Claude Vision extraction pipeline
  - Extraction prompt engineering + testing against real pathology reports
  - "Extract and confirm" UI with per-field confidence indicators
  - Support for pathology reports, lab reports, treatment summaries
TASK 5: Build manual intake form (FALLBACK)
  - Simplified wizard for patients without documents
  - Plain language cancer type → clinical mapping
TASK 6: Build matching engine
  - Tier 1 hard filters
  - Tier 2 soft scoring (leverage extracted biomarker data for precision)
  - Geographic distance calculation
TASK 7: Build results page
  - Ranked match cards with score breakdown
  - Map view of trial sites
  - "What you'd need to qualify" checklist per trial
  - Flag where extracted data improved match confidence
TASK 8: Build oncologist brief generator
  - PDF/email output
  - Include extracted clinical data with source attribution
  - Professional formatting
TASK 9: Build Treatment Translator
  - Two-step Claude pipeline (clinical grounding → patient translation)
  - Diagnosis explainer from patient's extracted profile
  - Treatment rationale section (why these drugs for your subtype)
  - Side effect timeline personalized to their specific regimen
  - Questions to ask oncologist generator
  - Second opinion trigger logic (flag deviations from NCCN guidelines)
  - Magazine-style reading UX with collapsible sections
  - Save as PDF / share with family
TASK 10: Build Financial Assistance Finder
  - Seed financial_programs table (start with top 30 programs)
    - 6 copay foundations (CancerCare, HealthWell, PAN, Good Days, PAF, TAF)
    - 5 breast cancer-specific nonprofits (Komen, Pink Fund, Sisters Network, etc.)
    - 10 pharma patient assistance programs (map to common breast cancer drugs)
    - 5 practical assistance (Hope Lodge, Road to Recovery, Angel Flight, etc.)
    - 4 government programs (Medicaid, Medicare Extra Help, SSI/SSDI)
  - Build financial profile addition to intake (insurance type, household income)
  - Build matching engine (patient profile → eligible programs)
  - Build results page with estimated total savings
  - Build program detail pages with application steps
  - Build fund status monitoring worker (daily status checks)
  - Build "notify me when fund reopens" alerts
TASK 11: Build notification system
  - Email when new matching trials appear
  - Email when closed financial assistance funds reopen
  - Daily sync + re-match pipeline
TASK 12: [POST-MVP] MyChart / FHIR integration
  - Epic App Orchard registration (START DURING TASK 1 — 4-8 week lead time)
  - OAuth 2.0 SMART on FHIR flow
  - FHIR resource extraction + PatientProfile mapping
  - Health system search/directory
  - Data access transparency UI
  - Cerner/Oracle Health follow-up
```

---

## 3. Phase 2: Sequencing Navigator (SEQUENCE)

**Timeline:** 4–6 weeks after Phase 1
**Goal:** Guide patients from "I have cancer" to "I have my tumor's genomic data in hand" — covering provider selection, insurance navigation, and data retrieval.

### 3.1 Sequencing Provider Directory

```typescript
interface SequencingProvider {
  id: string;
  name: string;                         // "Foundation Medicine", "Tempus", "UCSF Clinical Labs"
  type: "commercial" | "academic" | "direct_to_consumer";
  testTypes: TestType[];                // See below
  tumorTypes: string[];                 // Which cancers they handle
  turnaroundDays: { min: number; max: number };
  cost: {
    listPrice: number;
    typicalInsuranceCopay?: number;
    financialAssistance: boolean;
    financialAssistanceUrl?: string;
  };
  sampleRequirements: {
    type: "tissue" | "blood" | "both";
    minimumSize?: string;               // "10 unstained slides" etc.
    shippingKit: boolean;               // Do they send a kit?
  };
  outputFormat: {
    reportType: string;                 // "PDF report", "VCF + BAM files", etc.
    rawDataAvailable: boolean;          // Can patient get FASTQ/BAM?
    rawDataProcess: string;             // How to request raw data
    apiAccess: boolean;                 // Programmatic access to results
  };
  insuranceAccepted: string[];          // Major insurers
  locations: Location[];
  website: string;
  orderingProcess: string;             // "Doctor must order" vs "patient can initiate"
}

type TestType =
  | "whole_exome_sequencing"            // WES — $500–3000, most common
  | "whole_genome_sequencing"           // WGS — $1000–5000, most comprehensive
  | "targeted_panel"                    // 300-500 genes — $300–1500
  | "rna_sequencing"                    // Gene expression — $500–2000
  | "liquid_biopsy";                    // ctDNA from blood — $500–3000
```

### 3.2 Insurance Navigation Engine

```typescript
interface InsuranceCoverageResult {
  covered: boolean | "likely" | "unlikely" | "requires_prior_auth";
  basis: string;                        // "CMS National Coverage Determination"
  priorAuthRequired: boolean;
  priorAuthTemplate?: string;           // Pre-filled prior auth request
  estimatedOutOfPocket: number;
  financialAssistanceOptions: {
    program: string;
    eligibility: string;
    url: string;
  }[];
  cptCodes: string[];                   // Billing codes for the test
  icd10Codes: string[];                 // Diagnosis codes that support coverage
  letterOfMedicalNecessity: string;     // AI-generated template for oncologist
}

// Key coverage rules to encode:
// - Medicare covers FDA-approved companion diagnostics
// - Most commercial insurers cover Foundation Medicine CDx for advanced cancer
// - CMS National Coverage Determination for NGS in advanced cancer (2020)
// - State-specific mandates (e.g., CA SB 912)
// - Financial assistance programs (Foundation Medicine, Tempus, etc.)
```

### 3.3 Patient Journey Flow

```
Step 1: "Do you have sequencing results already?"
  → Yes: Upload/connect results → Skip to Phase 3
  → No: Continue to Step 2

Step 2: "What type of cancer and stage?"
  → Determines which test types are recommended
  → Explains WHY sequencing matters in plain language

Step 3: "Do you have insurance?"
  → Yes: Insurance lookup → coverage determination → prior auth template
  → No: Financial assistance programs + self-pay pricing

Step 4: "How to talk to your oncologist about this"
  → Generated script/email template
  → Letter of medical necessity template
  → Specific test recommendation with rationale

Step 5: "Ordering and sample collection"
  → Provider-specific instructions
  → What to expect timeline
  → Tracking / status updates

Step 6: "Your results are ready"
  → Plain-language interpretation of sequencing report
  → Actionable next steps → feeds into Phase 3
  → "Here are trials that match your genomic profile" (back to Phase 1)
```

### 3.4 Database Schema Additions (Phase 2)

```sql
-- Sequencing providers directory
CREATE TABLE sequencing_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,                    -- commercial, academic, dtc
  test_types TEXT[] NOT NULL,
  details JSONB NOT NULL,                -- Full SequencingProvider structure
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient sequencing orders/tracking
CREATE TABLE sequencing_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  provider_id UUID REFERENCES sequencing_providers(id),
  test_type TEXT NOT NULL,
  status TEXT DEFAULT 'initiated',       -- initiated, sample_collected, processing, complete
  ordered_date DATE,
  expected_completion DATE,
  actual_completion DATE,

  -- Insurance
  insurance_status TEXT,                 -- covered, denied, pending_prior_auth, self_pay
  prior_auth_submitted BOOLEAN DEFAULT FALSE,
  estimated_cost FLOAT,

  -- Results
  results_available BOOLEAN DEFAULT FALSE,
  results_format TEXT,                   -- pdf, vcf, bam, fastq
  results_storage_path TEXT,             -- S3 path for uploaded genomic data

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance coverage rules (editable knowledge base)
CREATE TABLE insurance_coverage_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurer TEXT NOT NULL,
  test_type TEXT NOT NULL,
  cancer_type TEXT,                      -- NULL = all cancers
  stage TEXT,                            -- NULL = all stages
  coverage_status TEXT NOT NULL,         -- covered, not_covered, prior_auth_required
  conditions TEXT,                       -- Additional conditions for coverage
  cpt_codes TEXT[],
  source_url TEXT,                       -- CMS NCD, insurer policy, etc.
  effective_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 Phase 2 Build Sequence

```
TASK 1: Build sequencing provider directory — COMPLETED (Session 7) ✓
  - Seeded 10 providers (Foundation Medicine, Tempus, Guardant, Caris, etc.)
  - Provider detail pages with ordering instructions
  - Comparison view (select up to 3, side-by-side table)
  - Filter by type, test type, sample type
TASK 2: Build insurance coverage engine — COMPLETED (Session 7) ✓
  - Seeded Medicare + top 5 commercial insurer rules
  - Coverage determination logic (specificity scoring)
  - Letter of medical necessity generator (Claude-powered)
  - Sequencing oncologist brief generator (Claude-powered)
TASK 3: Build patient sequencing journey wizard — COMPLETED (Session 8) ✓
  - 5-step lazy-loaded wizard (recommendation → explanation → test → conversation → next steps)
  - Deterministic recommendation engine (strongly_recommended/recommended/optional/not_typically_indicated)
  - Claude-personalized explanation content with common concerns accordion
  - Deterministic test recommendation (Foundation/Guardant/Tempus triad)
  - Claude-generated conversation guide + email template + ordering instructions
  - Order creation from wizard → order tracker
  - "While you wait" educational content (Claude, cached per cancer type)
  - Dashboard integration (order count + latest status)
  - All Claude outputs cached in Redis (24h TTL)
TASK 4: Build genomic data upload + storage — COMPLETED (Session 9) ✓
  - PDF report upload via S3 presigned URLs with Claude Vision extraction
  - GenomicResult Prisma model (15th model) with alterations, biomarkers, germline findings
  - Drag-and-drop upload page with 4-step extraction progress
  - Confirm page: review mutations + biomarkers before committing to profile
  - Skipped raw data upload (VCF/BAM) — deferred to Phase 3
TASK 5: Build results interpretation layer — COMPLETED (Session 9) ✓
  - Two-step Claude pipeline: clinical grounding → patient translation (8th-grade reading level)
  - 5-section results page: summary, mutations explained, biomarker profile,
    oncologist questions, updated trial matches
  - Redis-cached interpretation (24h TTL)
  - Mutation cards with significance badges (actionable/informational/uncertain)
TASK 6: Connect to Phase 1 — COMPLETED (Session 9) ✓
  - Matcher updated with genomicMatch() function + dynamic 7-dimension weights
  - computeMatchDelta() shows new/improved/removed matches after genomic data added
  - Genomic biomarkers merged into profile.biomarkers for backward compatibility
  - Rematch API endpoint with match delta storage and display
```

---

## 4. Phase 3: Neoantigen Prediction Platform (PREDICT)

**Timeline:** 3–6 months
**Goal:** Take patient genomic data (tumor + normal sequencing) and output a ranked neoantigen report with structural predictions and draft mRNA vaccine sequence — the computational pipeline Conyngham built manually, productized.

### 4.1 Pipeline Architecture

This is the compute-intensive core. Uses NATS JetStream for pipeline orchestration (reusing AEGIS patterns). Each step is an independent service that consumes from an input stream and publishes to an output stream.

```
Input: Tumor FASTQ/BAM + Normal FASTQ/BAM
  │
  ├── Step 1: Alignment (Rust)
  │   └── BWA-MEM2 alignment to reference genome
  │
  ├── Step 2: Variant Calling (Rust wrapper)
  │   ├── Strelka2 (somatic SNVs + indels)
  │   └── Mutect2 (secondary caller for validation)
  │
  ├── Step 3a: HLA Typing (Rust wrapper)  ──┐  [PARALLEL — fan-out from variant calling]
  │   ├── OptiType (Class I: HLA-A, -B, -C) │
  │   └── HLA-HD (Class I + II validation)   │
  │                                           ├── Both must complete before Step 4
  ├── Step 3b: Peptide Generation (Python) ──┘  [PARALLEL — fan-out from variant calling]
  │   ├── VEP-annotated VCF parsing
  │   └── Sliding window peptides (8-11mer MHC-I, 15mer MHC-II)
  │
  ├── Step 4: Neoantigen Prediction (Python)  [fan-in: requires 3a + 3b]
  │   ├── MHC-I binding prediction (MHCflurry / NetMHCpan)
  │   ├── MHC-II binding prediction
  │   ├── Immunogenicity scoring
  │   ├── Expression filtering (if RNA-seq available)
  │   └── Clonality estimation
  │
  ├── Step 5: Structure Prediction (Python)
  │   └── AlphaFold API for top neoantigen candidates
  │
  ├── Step 6: Neoantigen Ranking (Python + Claude)
  │   ├── Multi-factor scoring: binding affinity × immunogenicity × expression × clonality
  │   ├── Claude-assisted interpretation of structural predictions
  │   └── Final ranked list with confidence scores
  │
  └── Step 7: mRNA Sequence Design (Python)
      ├── Codon optimization for human expression
      ├── 5' UTR + 3' UTR design
      ├── Poly(A) tail specification
      └── Output: mRNA sequence + LNP formulation notes

Output: Neoantigen Report + Draft Vaccine Blueprint

> **Orchestration note (Session 12):** Steps 3a and 3b run in parallel after variant calling completes (fan-out). The orchestrator uses a DAG-based step graph (`PIPELINE_STEP_GRAPH` / `PIPELINE_STEP_PREREQUISITES` in `packages/shared/src/constants.ts`) instead of linear progression. Neoantigen prediction (Step 4) only dispatches when BOTH parallel steps have completed (fan-in). Prisma `$transaction` with Serializable isolation prevents the race condition where both parallel steps complete simultaneously.
```

### 4.2 Service Definitions

#### 4.2.1 Variant Caller (Rust)

```rust
// services/neoantigen-pipeline/variant-caller/src/main.rs

/// Pipeline step: somatic variant calling
/// Input: Aligned tumor BAM + normal BAM
/// Output: VCF file with somatic variants

pub struct VariantCallerConfig {
    pub reference_genome: PathBuf,       // GRCh38
    pub tumor_bam: PathBuf,
    pub normal_bam: PathBuf,
    pub output_dir: PathBuf,
    pub min_variant_quality: f64,        // Default: 30.0
    pub min_allele_frequency: f64,       // Default: 0.05
    pub callers: Vec<VariantCaller>,     // Strelka2, Mutect2
}

pub enum VariantCaller {
    Strelka2,
    Mutect2,
}

/// Output structure
pub struct VariantCallingResult {
    pub vcf_path: PathBuf,
    pub total_variants: usize,
    pub coding_variants: usize,         // Variants in coding regions
    pub nonsynonymous: usize,           // Amino acid-changing variants
    pub tumor_mutational_burden: f64,   // Mutations per megabase
    pub caller_agreement: f64,          // % variants called by both callers
}
```

#### 4.2.2 HLA Typer (Rust wrapper)

```rust
// services/neoantigen-pipeline/hla-typer/src/main.rs

/// Pipeline step: HLA allele identification
/// Input: Normal BAM (or tumor BAM)
/// Output: HLA genotype (Class I and Class II)

pub struct HlaTypingResult {
    pub class_i: HlaClassI,
    pub class_ii: Option<HlaClassII>,
    pub confidence: f64,
}

pub struct HlaClassI {
    pub hla_a: [String; 2],  // e.g., ["A*02:01", "A*11:01"]
    pub hla_b: [String; 2],
    pub hla_c: [String; 2],
}

pub struct HlaClassII {
    pub hla_drb1: [String; 2],
    pub hla_dqb1: [String; 2],
    pub hla_dpb1: [String; 2],
}
```

#### 4.2.3 Neoantigen Ranker (Python)

```python
# services/neoantigen-pipeline/neoantigen-ranker/src/ranker.py

from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Neoantigen:
    """Single predicted neoantigen candidate."""
    gene: str                          # Gene name (e.g., "KRAS")
    mutation: str                      # e.g., "G12D"
    chromosome: str
    position: int
    ref_allele: str
    alt_allele: str

    # Peptide info
    wildtype_peptide: str              # Normal peptide sequence
    mutant_peptide: str                # Mutated peptide sequence
    peptide_length: int                # 8-11 for MHC-I, 13-25 for MHC-II

    # Binding predictions
    hla_allele: str                    # Which HLA allele this binds
    binding_affinity_nm: float         # IC50 in nM (lower = stronger)
    binding_rank_percentile: float     # Percentile rank (lower = stronger)
    wildtype_binding_nm: float         # WT peptide binding (for agretopicity)

    # Scoring components
    immunogenicity_score: float        # 0-1, predicted T-cell recognition
    expression_level: Optional[float]  # TPM from RNA-seq, if available
    clonality: float                   # Variant allele frequency
    agretopicity: float                # Ratio of mutant/WT binding (differential)

    # Structural info (filled by AlphaFold step)
    structure_pdb_path: Optional[str]
    structural_exposure: Optional[float]  # Surface accessibility

    # Final composite score
    composite_score: float             # Weighted combination of all factors
    rank: int                          # Final ranking position
    confidence: str                    # "high", "medium", "low"


@dataclass
class NeoantigenReport:
    """Full pipeline output."""
    patient_id: str
    analysis_date: str
    reference_genome: str              # "GRCh38"

    # Summary stats
    total_somatic_variants: int
    coding_variants: int
    tumor_mutational_burden: float     # Mutations/Mb

    # HLA typing
    hla_genotype: dict                 # Full HLA typing result

    # Ranked neoantigens
    neoantigens: List[Neoantigen]      # Sorted by composite_score DESC
    top_candidates: List[Neoantigen]   # Top 10–20 for vaccine design

    # Vaccine blueprint (filled by mRNA designer step)
    vaccine_blueprint: Optional[dict]

    # Quality metrics
    sequencing_depth: float
    variant_caller_agreement: float
    pipeline_version: str


def score_neoantigen(neo: Neoantigen) -> float:
    """
    Multi-factor scoring function.
    Weights calibrated against published immunogenic neoantigen datasets.
    """
    weights = {
        'binding_affinity': 0.25,      # Strong MHC binding
        'agretopicity': 0.20,          # Differential vs wildtype
        'immunogenicity': 0.20,        # Predicted T-cell recognition
        'expression': 0.15,            # Is the gene expressed?
        'clonality': 0.10,             # Is it in most tumor cells?
        'structural_exposure': 0.10,   # Is the epitope surface-accessible?
    }

    # Normalize each component to 0-1 scale
    binding_score = max(0, 1 - (neo.binding_affinity_nm / 500))  # <50nM = strong
    agretopicity_score = min(1, neo.agretopicity / 10)
    expression_score = min(1, (neo.expression_level or 1) / 100)  # TPM
    clonality_score = min(1, neo.clonality / 0.5)  # VAF

    composite = (
        weights['binding_affinity'] * binding_score +
        weights['agretopicity'] * agretopicity_score +
        weights['immunogenicity'] * neo.immunogenicity_score +
        weights['expression'] * expression_score +
        weights['clonality'] * clonality_score +
        weights['structural_exposure'] * (neo.structural_exposure or 0.5)
    )

    return composite
```

#### 4.2.4 mRNA Sequence Designer (Python)

```python
# services/neoantigen-pipeline/mrna-designer/src/designer.py

@dataclass
class VaccineBlueprint:
    """Draft mRNA vaccine sequence specification."""

    # Core sequence
    mrna_sequence: str                  # Full mRNA sequence (5'UTR + ORF + 3'UTR + polyA)
    orf_sequence: str                   # Coding sequence only
    protein_sequence: str               # Translated protein

    # Design parameters
    neoantigens_included: List[str]     # Which neoantigens are encoded
    linker_sequences: List[str]         # Peptide linkers between epitopes
    signal_peptide: str                 # Secretion signal
    codon_optimization_method: str      # "GC-rich", "codon_usage_table", etc.
    gc_content: float                   # Target 50-60%

    # UTR design
    five_prime_utr: str                 # Kozak consensus + stability elements
    three_prime_utr: str                # Stability elements (e.g., beta-globin)
    poly_a_length: int                  # Typically 100-120nt

    # Formulation notes (not a recipe — guidance for manufacturer)
    lnp_formulation_notes: str          # Ionizable lipid, cholesterol, etc.
    recommended_dose_range: str         # Based on similar clinical trials
    storage_requirements: str           # Temperature, stability

    # Metadata
    design_rationale: str               # LLM-generated explanation of choices
    confidence_notes: str               # Caveats and limitations
    references: List[str]               # Published trials with similar designs


def design_polyepitope_mrna(
    top_neoantigens: List[Neoantigen],
    max_epitopes: int = 20,
    linker: str = "EAAAK",             # Flexible linker
) -> VaccineBlueprint:
    """
    Design a polyepitope mRNA vaccine encoding multiple neoantigens.
    This is a DRAFT design — requires expert review and GMP manufacturing.
    """
    pass  # Implementation follows established protocols from
          # BioNTech (BNT122) and Moderna (mRNA-4157) published designs
```

### 4.3 NATS JetStream Pipeline Orchestration

Reuse AEGIS event-driven patterns:

```typescript
// infrastructure/nats/pipeline-streams.ts

const PIPELINE_STREAMS = {
  // Each step publishes completion events
  "PIPELINE.alignment.complete": {
    payload: { jobId: string; bamPath: string; stats: AlignmentStats }
  },
  "PIPELINE.variants.complete": {
    payload: { jobId: string; vcfPath: string; stats: VariantStats }
  },
  "PIPELINE.hla.complete": {
    payload: { jobId: string; hlaGenotype: HlaTypingResult }
  },
  "PIPELINE.neoantigens.complete": {
    payload: { jobId: string; reportPath: string; topCount: number }
  },
  "PIPELINE.structure.complete": {
    payload: { jobId: string; pdbPaths: string[] }
  },
  "PIPELINE.vaccine.complete": {
    payload: { jobId: string; blueprintPath: string }
  },
  // Error handling
  "PIPELINE.step.failed": {
    payload: { jobId: string; step: string; error: string; retryable: boolean }
  }
};
```

### 4.4 Database Schema Additions (Phase 3)

```sql
-- Pipeline jobs
CREATE TABLE pipeline_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  sequencing_order_id UUID REFERENCES sequencing_orders(id),

  -- Input data
  tumor_data_path TEXT NOT NULL,         -- S3 path to tumor FASTQ/BAM
  normal_data_path TEXT NOT NULL,        -- S3 path to normal FASTQ/BAM
  rna_data_path TEXT,                    -- Optional RNA-seq data

  -- Pipeline state
  status TEXT DEFAULT 'queued',          -- queued, running, complete, failed
  current_step TEXT,                     -- Which step is currently running
  steps_completed TEXT[],                -- Steps that have finished

  -- Results
  variant_count INTEGER,
  tmb FLOAT,                            -- Tumor mutational burden
  hla_genotype JSONB,
  neoantigen_count INTEGER,
  top_neoantigens JSONB,                -- Top 20 ranked neoantigens
  vaccine_blueprint JSONB,              -- Draft mRNA vaccine design

  -- Output files
  vcf_path TEXT,
  neoantigen_report_path TEXT,
  vaccine_blueprint_path TEXT,
  full_report_pdf_path TEXT,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_completion TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual neoantigen candidates (for querying/filtering)
CREATE TABLE neoantigen_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES pipeline_jobs(id),
  gene TEXT NOT NULL,
  mutation TEXT NOT NULL,
  mutant_peptide TEXT NOT NULL,
  hla_allele TEXT NOT NULL,
  binding_affinity_nm FLOAT,
  immunogenicity_score FLOAT,
  composite_score FLOAT NOT NULL,
  rank INTEGER NOT NULL,
  confidence TEXT,
  details JSONB,                         -- Full Neoantigen structure
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_neoantigens_job ON neoantigen_candidates(job_id, rank);
CREATE INDEX idx_neoantigens_gene ON neoantigen_candidates(gene);
```

### 4.5 Phase 3 Build Sequence

```
TASK 1: Set up compute infrastructure — COMPLETED (Session 10) ✓
  - PipelineJob + NeoantigenCandidate Prisma models (17 models total)
  - pipeline-storage package: S3 client, presigned upload/download URLs, multipart upload, path conventions
  - pipeline-orchestrator package: NATS JetStream stream + consumers, AWS Batch dispatcher (8 job defs),
    exponential backoff retry, Prisma job manager (status transitions, DAG-based step resolution)
  - Terraform infrastructure: VPC (public/private subnets, NAT gateway), S3 bucket (AES-256,
    versioning, Glacier lifecycle), IAM roles, Batch compute envs (EC2 spot r6i), 2 queues,
    8 job definitions, NATS ECS Fargate service with EFS persistence + NLB
  - Reference genome setup script (GRCh38 download + BWA-MEM2/samtools indexing + S3 upload)
  - 5 API routes: upload-url, submit, jobs, jobs/[jobId], jobs/[jobId]/results
  - 4 pipeline pages: home, upload (dual drop-zone), job list, job detail (8-step progress bar)
  - PipelineProgressBar component, NATS client for web app, pipeline constants/types/schemas in shared
  - 36 new files, 9 modified files, 0 type errors

TASK 2: Build alignment step (Rust wrapper around BWA-MEM2) — COMPLETED (Session 11) ✓
  - Cargo workspace (pipeline-common shared crate + alignment + variant-caller)
  - pipeline-common: config, error (retryable vs permanent), S3 (multipart upload), NATS (JetStream publish),
    process runner (piped execution, OOM detection), structured JSON logging, S3 path conventions
  - alignment service: BWA-MEM2 | samtools sort (piped), samtools markdup + index + flagstat parsing,
    quality gates (mapping <80%=FAIL, coverage <5x=FAIL/<15x=WARN, dups >50%=WARN)
  - Multi-stage Dockerfile: Rust builder → BWA-MEM2 v2.2.1 + samtools v1.20
  - NATS events match orchestrator Zod schemas, metadata keys match job-manager.ts
  - 28 unit tests passing (flagstat parsing, quality gates, TMB calculation, event serialization, path generation)

TASK 3: Build variant calling step (Rust wrapper) — COMPLETED (Session 11) ✓
  - Strelka2 v2.9.10 + GATK Mutect2 v4.5 dual-caller with consensus merging
  - bcftools isec for caller agreement, HIGH/MEDIUM confidence tagging
  - Ensembl VEP v112 annotation (cache downloaded from S3 at runtime)
  - VariantCallingStats: SNVs, indels, coding, nonsynonymous, frameshift, TMB (nonsynonymous/33Mb),
    Ti/Tv ratio, caller agreement rate. TMB classification: low (<5), medium (5-20), high (>20)
  - Multi-stage Dockerfile: Rust builder → samtools + bcftools v1.20, Strelka2, GATK + JDK 17, VEP
  - Terraform: ECR repos (oncovax/alignment, oncovax/variant-caller) with keep-last-5 lifecycle,
    batch.tf updated from alpine:latest to ECR images with /scratch volume mounts,
    ECR pull permissions on batch execution role, ECR URL outputs

TASK 4: Build HLA typing step (Rust wrapper around OptiType + HLA-HD) — COMPLETED (Session 12) ✓
  - hla-typer Rust service: download normal BAM → extract HLA reads (chr6 + unmapped) → OptiType (Class I)
    + HLA-HD (Class I + II) → consensus genotype → quality gates → upload hla_genotype.json
  - OptiType primary for Class I, HLA-HD primary for Class II, discrepancy detection
  - Quality gates: allele nomenclature regex, all 6 Class I alleles required, max 3 discrepancies
  - Multi-stage Dockerfile: Rust builder → samtools v1.20, OptiType v1.3.5, HLA-HD
  - 8 unit tests (TSV/output parsing, allele normalization, consensus logic, quality gates)

TASK 4b: Build peptide generation step (Python) — COMPLETED (Session 12) ✓
  - peptide-generator Python service (first Python service in pipeline)
  - VCF parser: VEP CSQ annotation extraction, protein-altering variant filtering (VAF, pseudogenes)
  - Peptide generator: sliding window 8/9/10/11-mer (MHC-I) + 15-mer (MHC-II) with wildtype pairs
  - Python pipeline-common package (config, S3, NATS, events, paths) matching Rust equivalent
  - Quality gates: zero peptides = fail, zero MHC-I = fail, >50K = warn
  - 28 Python tests (VCF parsing, KRAS G12D peptide windows, boundary mutations, quality gates)
  - DAG-based orchestrator refactoring: fan-out after variant_calling, fan-in before neoantigen_prediction
  - Serializable transaction isolation for parallel step completion race condition

TASK 5: Build neoantigen prediction step (Python) — COMPLETED (Session 13) ✓
  - MHCflurry 2.0 Class I binding predictions (batch mode), Class II placeholder
  - BLOSUM62 dissimilarity + hydrophobicity immunogenicity scoring with TCR position weighting
  - 6-factor composite scoring (binding 0.25, agretopicity 0.20, immunogenicity 0.20, expression 0.15, clonality 0.10, structural 0.10)
  - Confidence classification (high/medium/low), cancer cell fraction from VAF, quality gates
  - Job manager extended with S3 report download + NeoantigenCandidate bulk insert
  - 27 Python tests passing

TASK 6: Build AlphaFold integration (Python)
  - API calls for top 20 neoantigen structures
  - Surface accessibility calculation
  - Feed structural features back into ranking

TASK 7: Build mRNA sequence designer (Python)
  - Polyepitope construct design
  - Codon optimization
  - UTR selection
  - Output vaccine blueprint document

TASK 8: Build report generator
  - Patient-facing summary (plain language)
  - Oncologist-facing report (clinical detail)
  - Manufacturer-facing blueprint (technical spec)
  - PDF generation

TASK 9: Build pipeline orchestrator — COMPLETED (Session 10, merged into Task 1) ✓
  - Merged with infra setup since orchestrator is infrastructure, not bioinformatics logic

TASK 10: Build web interface for pipeline — COMPLETED (Session 10, merged into Task 1) ✓
  - Merged with infra setup: upload flow, job tracking UI, progress bar, results download
```

---

## 5. Phase 4: Manufacturing Network Connector (MANUFACTURE)

**Timeline:** 6–12 months (requires partnerships)
**Goal:** Connect patients who have a vaccine blueprint to contract manufacturing organizations (CMOs) that can produce it, and navigate the regulatory pathway for administration.

### 5.1 Manufacturing Partner Directory

```typescript
interface ManufacturingPartner {
  id: string;
  name: string;
  type: "cmo" | "academic_lab" | "modular_hub";
  capabilities: {
    mrnaProduction: boolean;
    lnpEncapsulation: boolean;
    fillFinish: boolean;               // Sterile vial filling
    qualityControl: boolean;
    analyticalTesting: boolean;
  };
  certifications: string[];            // "GMP", "FDA-registered", etc.
  capacity: {
    batchSizeRange: string;            // "1-100 doses per batch"
    turnaroundDays: { min: number; max: number };
    currentAvailability: string;       // "accepting orders", "waitlist", etc.
  };
  pricing: {
    estimatedPerPatient: { min: number; max: number };
    includesQC: boolean;
    includesAnalytics: boolean;
  };
  geography: {
    country: string;
    state?: string;
    canShipTo: string[];               // Countries they can ship finished product
  };
  regulatorySupport: {
    ibbApproval: boolean;              // Institutional biosafety board
    indSupport: boolean;               // Help with IND application
    compassionateUseExperience: boolean;
  };
  contactInfo: ContactInfo;
  website: string;
}
```

### 5.2 Regulatory Navigation Engine

```typescript
interface RegulatoryPathway {
  pathway: "clinical_trial" | "compassionate_use" | "right_to_try" | "physician_sponsored_ind";
  applicability: string;               // When this pathway applies
  timeline: string;                    // Expected timeline
  requirements: string[];
  documents: {
    name: string;
    template?: string;                 // Pre-filled template if available
    guidance: string;                  // How to fill it out
  }[];
  agencies: {
    name: string;                      // "FDA", "IRB", etc.
    role: string;
    contactInfo?: string;
  }[];
  estimatedCost: { min: number; max: number };
  successRate?: string;                // Published approval rates
}

// Key pathways to encode:

// 1. FDA Expanded Access (Compassionate Use)
//    - For serious/life-threatening conditions
//    - Drug must have existing IND
//    - Requires FDA Form 3926 (individual patient)
//    - Can be authorized within 24 hours for emergencies
//    - IRB review required (can be concurrent)

// 2. Right to Try Act (2018)
//    - Must have exhausted approved treatment options
//    - Drug must have completed Phase I trial
//    - No FDA authorization required
//    - Patient informed consent required
//    - Manufacturer must agree to provide

// 3. Physician-Sponsored IND
//    - Physician files own IND with FDA
//    - More control but more paperwork
//    - Requires IND application (FDA Form 1571)
//    - Annual reports required

// 4. Clinical Trial Enrollment
//    - Fastest if a matching trial exists
//    - No cost to patient for investigational product
//    - Connects back to Phase 1 (MATCH)
```

### 5.3 Phase 4 Build Sequence

```
TASK 1: Build manufacturing partner directory
  - Research and seed top 15 CDMOs with mRNA capability
  - Partner detail pages with capability matrix
  - Contact/inquiry forms

TASK 2: Build regulatory pathway advisor
  - Decision tree: which pathway fits the patient's situation?
  - Document template generator (Claude-powered)
  - FDA Form 3926 pre-filler for expanded access
  - Right to Try checklist generator

TASK 3: Build order workflow
  - Patient selects manufacturer from directory
  - Vaccine blueprint auto-sent (with patient consent)
  - Quote request system
  - Order tracking

TASK 4: Build provider network
  - Oncologist/infusion center directory for administration
  - Connect patient to local oncologist willing to administer
  - Post-administration monitoring protocol

TASK 5: Build partnerships
  - Outreach to CDMOs for preferred pricing
  - Academic lab partnerships for research-use production
  - Modular hub operators (BioNTainer, Quantoom deployments)
```

---

## 6. Cross-Cutting Concerns

### 6.1 HIPAA Compliance

```
REQUIRED FOR ALL PHASES:
- Encryption at rest (AES-256) for all patient data
- Encryption in transit (TLS 1.3)
- Access logging for all PHI access
- BAA (Business Associate Agreement) with all vendors
- Minimum necessary access principle
- Patient data deletion on request
- Breach notification procedures

IMPLEMENTATION:
- Postgres: pgcrypto for column-level encryption of PHI
- S3: SSE-S3 or SSE-KMS for genomic data
- Application: field-level encryption for PII before DB write
- Logging: separate audit log table, immutable
- Auth: magic link + session management, no password storage
```

### 6.2 AI/LLM Usage Patterns

```typescript
// Consistent Claude integration pattern across all phases

interface ClaudeTask {
  // Phase 1 — Trial Matching
  PARSE_ELIGIBILITY: "Parse trial eligibility criteria into structured data";
  GENERATE_ONCOLOGIST_BRIEF: "Generate professional summary for oncologist";
  MATCH_COMPLEX_CRITERIA: "Evaluate patient against ambiguous eligibility";

  // Phase 1 — Document Ingestion (Claude Vision)
  EXTRACT_PATHOLOGY_REPORT: "Extract structured clinical data from pathology report photo/PDF";
  EXTRACT_LAB_REPORT: "Extract lab values from lab report photo/PDF";
  EXTRACT_TREATMENT_SUMMARY: "Extract treatment history from treatment summary photo/PDF";
  AUTO_DETECT_DOCUMENT_TYPE: "Identify document type from photo before targeted extraction";
  QUALITY_ASSESSMENT: "Assess document image quality and suggest improvements";

  // Phase 1 — Treatment Translator
  CLINICAL_GROUNDING: "Generate evidence-based clinical context for patient's specific diagnosis";
  PATIENT_TRANSLATION: "Translate clinical grounding into plain-language patient explainer";
  SECOND_OPINION_ASSESSMENT: "Flag deviations from standard guidelines for patient awareness";
  QUESTION_GENERATION: "Generate personalized questions for oncologist based on patient profile";

  // Phase 1 — Financial Assistance
  FUND_STATUS_EXTRACTION: "Extract open/closed/waitlist status from program status pages";
  ELIGIBILITY_INTERPRETATION: "Interpret complex eligibility rules against patient profile";

  // Phase 2
  INTERPRET_SEQUENCING_REPORT: "Plain-language summary of genomic findings";
  GENERATE_LOA: "Generate letter of medical necessity for insurance";
  EXPLAIN_MUTATIONS: "Explain specific mutations in patient-friendly language";

  // Phase 3
  INTERPRET_NEOANTIGENS: "Explain neoantigen ranking rationale";
  REVIEW_VACCINE_DESIGN: "Sanity-check mRNA design against published literature";
  GENERATE_REPORTS: "Generate patient/oncologist/manufacturer reports";

  // Phase 4
  NAVIGATE_REGULATORY: "Guide through regulatory pathway selection";
  GENERATE_FDA_FORMS: "Pre-fill FDA expanded access forms";
  DRAFT_CONSENT: "Draft informed consent documents";
}

// All Claude calls go through a central service with:
// - Rate limiting
// - Cost tracking
// - Response caching (for identical inputs)
// - Audit logging
// - Fallback handling
```

### 6.3 Notification System

```typescript
// Unified notification system across all phases

type NotificationEvent =
  // Phase 1
  | { type: "new_trial_match"; trialId: string; matchScore: number }
  | { type: "trial_status_change"; trialId: string; newStatus: string }
  // Phase 2
  | { type: "sequencing_complete"; orderId: string }
  | { type: "insurance_decision"; orderId: string; covered: boolean }
  // Phase 3
  | { type: "pipeline_step_complete"; jobId: string; step: string }
  | { type: "pipeline_complete"; jobId: string }
  | { type: "pipeline_failed"; jobId: string; error: string }
  // Phase 4
  | { type: "manufacturer_quote_received"; orderId: string }
  | { type: "vaccine_production_update"; orderId: string; status: string }

// Delivery channels
// - Email (primary, always)
// - SMS (optional, for urgent updates)
// - In-app notifications
```

### 6.4 Analytics & Impact Tracking

```sql
-- Track actual impact (anonymized)
CREATE TABLE impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  -- Phase 1
  -- "trial_match_generated", "trial_contact_initiated", "trial_enrolled"
  -- Phase 2
  -- "sequencing_initiated", "sequencing_completed", "insurance_approved"
  -- Phase 3
  -- "pipeline_completed", "blueprint_generated"
  -- Phase 4
  -- "manufacturer_contacted", "vaccine_produced", "vaccine_administered"
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NO patient PII in this table — aggregate metrics only
```

---

## 7. Build Order & Dependencies

### 7.1 Critical Path

```
Week 1-2:   Turborepo setup, Prisma schema, auth, shared UI components
            START Epic App Orchard registration (4-8 week lead time)
Week 2-3:   ClinicalTrials.gov sync worker + eligibility parser
Week 3-4:   Document ingestion engine (Claude Vision extraction pipeline)
Week 4-5:   Matching engine + results page + oncologist brief
Week 5-6:   Treatment Translator + Financial Assistance Finder
Week 6:     Notifications + polish → PHASE 1 LAUNCH (doc upload + manual intake)

Week 7-8:   MyChart FHIR integration (Epic approval should land around now)
Week 8-9:   Sequencing provider directory + insurance engine
Week 10-11: Sequencing journey wizard + data upload
Week 11-13: Results interpretation + genomic trial matching → PHASE 2 LAUNCH

Week 13-17: Compute infrastructure + alignment/variant calling
Week 17-21: Neoantigen prediction + ranking
Week 21-25: AlphaFold integration + mRNA designer
Week 25-29: Report generation + pipeline UI → PHASE 3 LAUNCH

Week 29+:   Manufacturing directory + regulatory navigator → PHASE 4 LAUNCH
```

### 7.2 Dependencies Between Phases

```
Phase 1 (MATCH) — standalone, no dependencies
  ↓
Phase 2 (SEQUENCE) — enhances Phase 1 with genomic matching
  ↓
Phase 3 (PREDICT) — requires Phase 2 genomic data as input
  ↓
Phase 4 (MANUFACTURE) — requires Phase 3 vaccine blueprint as input
                       — requires Phase 1 regulatory navigation (shared)
```

### 7.3 External Dependencies to Resolve

```
PHASE 1:
  □ ClinicalTrials.gov API access (public, no key needed)
  □ Geocoding service (Google Maps or Mapbox)
  □ Claude API key for eligibility parsing + Vision document extraction
  □ Email service (Resend, Postmark, etc.)
  □ S3 bucket for document uploads (HIPAA BAA — needed from Phase 1 for medical docs)
  □ Epic App Orchard registration for MyChart FHIR access (START WEEK 1 — 4-8 week approval)
  □ Test pathology reports for extraction prompt engineering (anonymized/synthetic)

PHASE 1.5 (MyChart):
  □ Epic App Orchard approval
  □ SMART on FHIR client library (fhirclient.js or similar)
  □ FHIR R4 LOINC/ICD-10/RxNorm mapping tables
  □ Test health system FHIR sandbox (Epic provides test environments)
  □ Cerner/Oracle Health Marketplace registration (start after Epic live)

PHASE 2:
  □ Sequencing provider partnerships (start with 3-5)
  □ Insurance coverage data (CMS NCD database, insurer policies)

PHASE 3:
  □ AWS compute (Batch/ECS) for pipeline jobs
  □ Reference genome data (GRCh38 — ~3GB download)
  □ Bioinformatics tools (BWA-MEM2, Strelka2, Mutect2, OptiType)
  □ MHCflurry / NetMHCpan license (free for non-commercial)
  □ AlphaFold API access (free via Google DeepMind)
  □ NATS JetStream deployment

PHASE 4:
  □ CDMO partnerships (outreach required)
  □ Legal review of regulatory guidance templates
  □ Oncologist network partnerships
```

### 7.4 Claude Code Sessions — Progress Tracker

```
SESSION 1: Project scaffolding — COMPLETED ✓
  Built: Turborepo monorepo, Next.js 15 + React 19, Prisma 7 (8 models),
         custom magic link auth (jose + Redis), Stripe integration,
         Expo SDK 54 mobile scaffold, 14 pages, 13 API routes, 7 lib files
  Deviations: No tRPC (API routes), no NextAuth (custom), Dripsy not shadcn

SESSION 2: Trial ingestion pipeline — COMPLETED ✓
  Built: CTG v2 API client, sync worker, Claude Opus eligibility parser,
         admin QA page, CLI (pnpm trial-sync --skip-parse/--parse-only)
  Deviations: Lib files not packages, Opus not Sonnet, Mapbox fallback only

SESSION 3: Document ingestion engine — COMPLETED ✓
  Built: S3 presigned URLs, Claude Vision extraction pipeline (pathology/lab/treatment),
         client-side quality checks + HEIC conversion, DocumentUploader component,
         ManualIntakeWizard (4-step), InlineMagicLink with session polling,
         extraction API routes, patient create/get API routes,
         full /start/upload, /start/manual, /start/confirm pages
  Deviations: Sync extraction (not async polling), pre-auth flow,
              Opus not Sonnet, all in apps/web/ not packages/

SESSION 4: Matching engine + results — COMPLETED ✓
  Built: 3-tier matching engine (fuzzy cancer type + stage comparison + LLM assessment),
         oncologist brief generator (Claude-powered), match API routes (list, detail,
         status update, generation trigger, brief generation),
         MatchCard + EligibilityBreakdown components,
         full /matches, /matches/[trialId], /matches/[trialId]/contact pages
  Deviations: ECOG/age weights replace surgical/geographic, no map view yet,
              no PDF download yet, fire-and-forget match gen (not re-match on sync)

→ PHASE 1 MVP IS LIVE (Sessions 1-4: document upload + manual intake + matching + results)

SESSION 5: Treatment Translator + Financial Assistance Finder — COMPLETED
  Built: Two-step Claude pipeline (clinical grounding → patient-facing translation),
         30-program financial assistance database with deterministic matching engine,
         magazine-style treatment guide UI, financial results + program detail pages,
         confirm page financial profile section, dashboard 3-card layout
  Deviations: No PDF export for translation yet, no email notifications for fund
              reopening yet (flag stored), status check is manual CLI (not cron)

SESSION 6: MyChart FHIR integration — COMPLETED
  Built: SMART on FHIR OAuth 2.0 flow (discovery, authorize, token exchange, refresh),
         30-system health system directory (15 cancer centers + 15 health systems),
         FHIR resource extraction (Condition, Observation, MedicationRequest, Procedure),
         code mapping tables (ICD-10 → cancer type, LOINC → biomarker, RxNorm → treatment,
         SNOMED → surgery), PatientProfile mapper with completeness tracking,
         encrypted token storage (jose A256GCM), data access transparency page,
         revoke/re-sync flows, confirm page "from MyChart" badges, dashboard 4-card layout
  Deviations: FHIR code lives in apps/web/lib/fhir/ (not packages/doc-ingestion/),
              HealthSystem is a separate Prisma model (not just string fields),
              all FHIR endpoints use Epic sandbox URL (production switch is env config)

→ PHASE 1.5 COMPLETE (all intake paths + full feature set)

SESSION 7: Sequencing Provider Directory + Insurance Coverage Engine — COMPLETED ✓
  Built: 10-provider sequencing directory (Foundation Medicine, Tempus, Guardant, Caris,
         NeoGenomics, Myriad, Invitae, Color, UCSF, MSK-IMPACT), insurance coverage
         engine with specificity scoring, coverage rules seed data (Medicare + 5 commercial),
         LOMN generator (Claude-powered), sequencing oncologist brief generator,
         provider comparison view (up to 3), SequencingProviderCard component,
         sequencing hub page (3 pathway cards), insurance checker page,
         order CRUD API routes, 3 new Prisma models (SequencingProvider,
         SequencingOrder, InsuranceCoverageRule — now 14 models total)
  Deviations: Schema simplified vs spec (status as string, insuranceCoverage as JSON
              on order instead of separate fields), no effectiveDate on coverage rules,
              conditions stored as string[] not string

SESSION 8: Sequencing Journey Wizard + Test Recommendation Engine — COMPLETED ✓
  Built: 5-step lazy-loaded wizard (recommendation → explanation → test → conversation → next steps),
         deterministic recommendation engine (stage/TNBC/progression rules),
         Claude-personalized recommendation reasoning + sequencing explanation,
         deterministic test recommendation (Foundation/Guardant/Tempus triad based on
         tissue availability and comprehensiveness preference),
         Claude conversation guide with talking points + email template + ordering instructions,
         Claude "while you wait" educational content (cached per cancer type, not patient),
         OrderProgressBar component (8-status horizontal tracker),
         order list page with progress bars + waiting content,
         order detail page with status timeline + advance/cancel buttons,
         dashboard updated (5-card layout, shows order count + latest status),
         sequencing hub "I'm not sure" card → /sequencing/guide,
         middleware updated for /sequencing/guide auth
  New files: 4 lib, 5 API routes, 3 pages, 1 component (13 new, 5 modified)
  Deviations: No tRPC (API routes as planned), no /learn/[topic] pages
              (educational content embedded in order tracker instead),
              5 shared types not 6 (WizardState managed client-side, not shared)

→ PHASE 2 SESSIONS 7-8 COMPLETE (provider directory + insurance + journey wizard + order tracking)

SESSION 9: Genomic Results Interpretation + Genomically-Informed Trial Matching — COMPLETED ✓
  Built: GenomicResult Prisma model (15th model), Claude Vision genomic report extraction
         (gene alterations, biomarkers, germline findings, therapy matches),
         two-step Claude interpretation pipeline (clinical grounding → patient-facing
         plain-language at 8th-grade reading level), genomicMatch() dimension in matcher
         with dynamic 7-dimension weighting (existing 6 × 0.75 + genomics at 0.25),
         computeMatchDelta() before/after comparison, drag-drop upload page with 4-step
         extraction progress, confirm page (mutation + biomarker review), 5-section
         results interpretation page (summary, mutations explained, biomarker profile,
         oncologist questions, match delta), 7 new API routes under /api/genomics/,
         genomic biomarkers merged into profile.biomarkers for backward compatibility,
         dashboard updated with genomic result indicator, sequencing hub dynamically
         highlights when results are ready or genomic data exists
  New files: 2 lib, 7 API routes, 3 pages (12 new, 8 modified)
  Deviations: Skipped raw data upload (VCF/BAM) — deferred to Phase 3,
              skipped FHIR genomics sync — deferred to Phase 3,
              skipped oncologist brief genomic context update — simple extension later,
              6 shared types not 8 (fewer intermediate types needed)

→ PHASE 2 COMPLETE (all 9 sessions: intake → matching → translation → financial → FHIR → sequencing → genomics)

SESSION 10: Compute Infrastructure + Pipeline Orchestration — COMPLETED ✓
  Built: PipelineJob + NeoantigenCandidate Prisma models (30+ fields each, 17 models total),
         pipeline-storage package (S3 client singleton, path conventions, presigned upload/download
         URLs with 1hr expiry, multipart upload via @aws-sdk/lib-storage), pipeline-orchestrator
         package (NATS JetStream stream "PIPELINE" with wildcard subjects, 3 durable consumers
         for job.submitted/step.*.complete/step.failed, AWS Batch dispatcher with 7 job definitions
         split across cpu-intensive and standard queues, exponential backoff retry with jitter,
         Prisma job manager for status transitions and step output mapping), NATS client for web app
         (globalThis singleton), 5 pipeline API routes (upload-url, submit with S3 validation,
         jobs list, job detail with top 20 neoantigens, results with presigned download URLs),
         Terraform infrastructure (VPC with public/private subnets + NAT gateway, S3 bucket with
         AES-256 + versioning + Glacier lifecycle at 90 days, IAM roles for Batch + NATS, 2 Batch
         compute envs on EC2 spot r6i instances, 2 job queues, 8 job definitions with
         resource specs from 2-8 vCPU / 4-32GB RAM, ECS Fargate NATS service with EFS persistence
         + internal NLB), reference genome setup script (GRCh38 + VEP cache download, BWA-MEM2 +
         samtools indexing, S3 upload with verification), 4 pipeline pages (home with job cards,
         dual drop-zone upload with XHR progress tracking, job list, job detail with 8-step
         PipelineProgressBar + neoantigen table + download links + 10s polling), pipeline constants
         + types + Zod schemas in shared package
  New files: 36 (2 packages × ~6 files each, 5 API routes, 4 pages, 1 component, 7 Terraform, 1 script)
  Modified files: 9 (schema.prisma, 4 shared files, web package.json, .env.example, turbo.json, root package.json)
  Deviations: Merged spec Tasks 1+9+10 into single session (orchestrator + UI are infrastructure,
              not separate from compute setup), used Next.js API routes (not tRPC, consistent with
              Sessions 1-9), intermediate/ paths use jobId only (not patientId/jobId) for simpler
              structure, NATS retention set to workqueue (not limits-based) for automatic cleanup

→ PHASE 3 SESSION 10 COMPLETE (infrastructure ready — no bioinformatics logic yet, Sessions 11-15 build the pipeline steps)

SESSION 11: Alignment + Variant Calling — COMPLETED ✓
  Built: Cargo workspace with pipeline-common shared crate + alignment + variant-caller services.
         pipeline-common (8 modules): config, error classification (retryable vs permanent), S3 multipart,
         NATS JetStream publish, process runner (piped execution, OOM detection), structured logging, paths.
         alignment: BWA-MEM2 | samtools sort (piped), markdup, flagstat parsing, quality gates.
         variant-caller: Strelka2 + Mutect2 dual-caller, bcftools consensus (HIGH/MEDIUM tags),
         VEP v112 annotation, TMB calculation. Multi-stage Dockerfiles for both services.
         ECR repos (oncovax/alignment, oncovax/variant-caller), Batch job defs updated from placeholders.
  Tests: 28 unit tests (9 alignment + 12 pipeline-common + 7 variant-caller)
  Files: 20 new, 4 modified

SESSION 12: HLA Typing + Peptide Generation — COMPLETED ✓
  Built: hla-typer Rust service (OptiType + HLA-HD with consensus genotype, quality gates),
         peptide-generator Python service (first Python service — VCF parsing, sliding window
         8/9/10/11-mer MHC-I + 15-mer MHC-II peptide generation, Python pipeline-common package).
         DAG-based orchestrator refactoring: replaced linear step progression with PIPELINE_STEP_GRAPH
         + PIPELINE_STEP_PREREQUISITES for fan-out (variant_calling → [hla_typing, peptide_generation])
         and fan-in ([hla_typing, peptide_generation] → neoantigen_prediction). Serializable transaction
         isolation for parallel completion race condition. ECR repos, Batch job defs, 8-step progress bar.
  Tests: 36 Rust tests (8 new hla-typer), 28 Python tests (VCF parsing, KRAS G12D, quality gates)
  Files: ~25 new, ~10 modified

→ PHASE 3 SESSION 12 COMPLETE (alignment → variant calling → [HLA typing ∥ peptide generation] working, Session 13 builds binding prediction)

SESSION 13: Neoantigen Prediction + Binding + Immunogenicity Scoring — COMPLETED ✓
  Scope: MHCflurry binding prediction, immunogenicity scoring, composite ranking, NeoantigenCandidate DB records
  Deliverables: neoantigen-predictor Python service (binding.py, immunogenicity.py, scoring.py, clonality.py,
         expression.py, quality.py, main.py + pipeline_common package), Dockerfile with tensorflow-cpu + mhcflurry
         model download. Job manager extended: neoantigen_prediction metadata extraction (neoantigenCount,
         neoantigenReportPath, topNeoantigens) + post-transaction S3 download + NeoantigenCandidate bulk insert
         via createMany. Terraform: ECR repo oncovax/neoantigen-predictor, replaced alpine placeholder with real
         image + scratch volume, IAM ECR pull permission, output URL.
  Tests: 27 Python tests (8 binding classification, 16 scoring/composite/confidence/ranking, 3 quality gates)
  Files: 20 new, 5 modified

→ PHASE 3 SESSION 13 COMPLETE (alignment → variant calling → [HLA typing ∥ peptide generation] → neoantigen prediction working, Session 14 builds structure prediction + mRNA designer)

SESSION 14: Structure Prediction + Ranking + mRNA Vaccine Designer — COMPLETED ✓
  Scope: Template-based structure prediction, re-ranking with structural exposure, full mRNA vaccine design
  Deliverables: Three new Python services completing the pipeline:
    structure-predictor: Template PDB mapping for ~25 common HLA-A/B/C alleles, Biopython threading
         (mutant peptide onto MHC backbone), AlphaFold Server API fallback for rare alleles, biotite SASA
         calculation (Shrake-Rupley, normalized per-AA max SASA table), uploads PDB files + structure_report.json.
    ranking: Lightweight re-ranker that patches real structural_exposure values from structure_report into
         neoantigen candidates, re-runs score_and_rank() with actual exposure data (replacing default 0.5),
         outputs ranked_neoantigens.json.
    mrna-designer: Full vaccine design pipeline — epitope selection (top 20, min score 0.3, HLA diversity,
         clonality preference, deduplication), polyepitope construct (tPA signal peptide MFVFLVLLPLVSSQ +
         EAAAK rigid linkers + PADRE universal CD4+ epitope AKFVAAWTLKAAA), human codon optimization
         (weighted random + GC targeting 50-60% + homopolymer/restriction site removal), alpha-globin 5'UTR
         + Kozak + doubled beta-globin 3'UTR + 120nt poly(A), sequence quality checks (GC%, internal stops,
         homopolymers, back-translation, length), LNP formulation guidance (with research disclaimer),
         Claude-powered design rationale (claude-sonnet-4-5-20250929, graceful fallback template), VaccineBlueprint
         JSON output.
  Orchestrator updates: job-manager.ts extended with structure_prediction output handling (topNeoantigens
         update) + two new post-transaction blocks: (1) structure_prediction downloads structure_report.json,
         updates NeoantigenCandidate records with structuralExposure + structurePdbPath; (2) ranking downloads
         ranked_neoantigens.json, updates NeoantigenCandidate records with re-ranked compositeScore, rank,
         confidence. dispatcher.ts passes ANTHROPIC_API_KEY env var for mrna_design step.
  Terraform: 3 ECR repos (oncovax/structure-predictor, oncovax/ranking, oncovax/mrna-designer) with
         keep-last-5 lifecycle policies. 3 Batch job defs updated from alpine:latest placeholders to real
         ECR images with scratch volumes (structure_prediction: 2 vCPU/8GB, ranking: 2 vCPU/4GB,
         mrna_design: 2 vCPU/8GB).
  Tests: 42 Python tests (11 structure-predictor + 6 ranking + 25 mrna-designer)
  Files: ~43 new, 4 modified

→ PHASE 3 SESSION 14 COMPLETE (full pipeline operational: alignment → variant calling → [HLA typing ∥ peptide generation] → neoantigen prediction → structure prediction → ranking → mRNA design. Session 15 builds report generation + pipeline UI)

Session 15 — Report Generation + Pipeline UI:
  report-generator.ts: Three Claude-powered report generators (two-step: clinical grounding → audience
       translation). generatePatientReport (8th-grade reading level, warm tone, questions for oncologist),
       generateClinicianReport (8-section formal clinical report with full binding data),
       generateManufacturerBlueprint (technical manufacturing spec from vaccineBlueprint JSON).
       All cached in Redis (report:{type}:{jobId}, 24hr TTL). Data: top 30 neoantigens + patient profile.
  neoantigen-trials.ts: crossReferenceTrials(jobId) — queries Trial table for vaccine/neoantigen/immunotherapy
       trials, Claude relevance assessment against patient mutations + HLA type, returns NeoantigenTrialMatch[]
       sorted by relevanceScore. Redis cached (neoantigen-trials:{jobId}, 24hr).
  report-pdf.ts: Three @react-pdf/renderer PDF generators using React.createElement + renderToBuffer().
       Patient (large fonts, purple branding, disclaimer), Clinician (2-page clinical layout, 9-column data
       tables, page numbers), Manufacturer (2-page technical spec, blue branding, epitope + QC tables, LNP specs).
  API routes: 4 new — reports/ (GET ?type= → report JSON), reports/pdf/ (GET ?type= → generate PDF → S3 upload
       → presigned URL, caches on PipelineJob path fields), neoantigens/ (GET with sort/order/confidence/gene/
       page/limit → paginated NeoantigenCandidate records), trials/ (GET → NeoantigenTrialMatch[]).
  Components: NeoantigenTable (sortable 10-column table, expandable row detail, confidence/binding badges),
       ReportCard (state machine: idle→generating→ready→downloading→error, Preview + Download PDF),
       BlueprintVisualization (construct diagram, mRNA sequence with color-coded regions, HLA coverage grid,
       delivery specs).
  Pages: 4 new sub-routes under /pipeline/jobs/[jobId]/: neoantigens/ (full explorer with filter bar +
       pagination), blueprint/ (construct visualization + download), trials/ (AI-scored trial cards with
       NCT links), reports/ (3 ReportCard grid + inline preview). Modified job detail page with 4-card
       results navigation when status === 'complete'.
  Types: PatientReportData, ClinicianReportData, ManufacturerBlueprintData, NeoantigenTrialMatch in shared pkg.
  Files: 14 new, 4 modified

→ PHASE 3 SESSION 15 COMPLETE — PHASE 3 COMPLETE (full neoantigen vaccine platform: raw sequencing → 8-step compute pipeline → 3 audience-specific reports with PDF export → neoantigen explorer → vaccine blueprint viewer → clinical trial cross-reference)
```

---

## Appendix A: Key External Resources

**Trial Data:**
- ClinicalTrials.gov API v2: https://clinicaltrials.gov/data-api/api

**MyChart / FHIR Integration:**
- Epic App Orchard: https://appmarket.epic.com/
- SMART on FHIR Authorization: https://hl7.org/fhir/smart-app-launch/
- Epic FHIR R4 API docs: https://fhir.epic.com/
- Epic Sandbox (testing): https://fhir.epic.com/Developer/Apps
- Cerner FHIR API: https://fhir.cerner.com/
- SMART Health Links spec: https://docs.smarthealthit.org/smart-health-links/
- Apple HealthKit FHIR: https://developer.apple.com/documentation/healthkit/samples/accessing_health_records
- 21st Century Cures Act (patient API access mandate): https://www.healthit.gov/topic/oncs-cures-act-final-rule
- LOINC codes (lab/biomarker mapping): https://loinc.org/
- ICD-10-CM (diagnosis codes): https://www.cms.gov/medicare/coding-billing/icd-10-codes

**Bioinformatics Pipeline:**
- OpenVax pipeline (reference): https://github.com/openvax/neoantigen-vaccine-pipeline
- MHCflurry: https://github.com/openvax/mhcflurry
- AlphaFold: https://alphafold.ebi.ac.uk/ (API) / https://github.com/google-deepmind/alphafold
- BWA-MEM2: https://github.com/bwa-mem2/bwa-mem2
- Strelka2: https://github.com/Illumina/strelka
- GATK Mutect2: https://gatk.broadinstitute.org/
- OptiType: https://github.com/FRED-2/OptiType
- VEP (Variant Effect Predictor): https://useast.ensembl.org/info/docs/tools/vep/

**Regulatory:**
- FDA Expanded Access: https://www.fda.gov/news-events/public-health-focus/expanded-access
- Right to Try: https://www.fda.gov/patients/learn-about-expanded-access-and-other-treatment-options/right-try

## Appendix B: Naming Conventions

- Product name: **OncoVax** (working title — check trademarks before public launch)
- Internal project codenames: MATCH, SEQUENCE, PREDICT, MANUFACTURE
- Database tables: snake_case
- TypeScript: camelCase variables, PascalCase types
- Rust: snake_case per Rust conventions
- Python: snake_case per PEP 8
- API routes: kebab-case
- Environment variables: SCREAMING_SNAKE_CASE

## Appendix C: Open Questions (Resolve Before Phase 3)

1. **Build vs. wrap for variant calling?** Rust wrappers around Strelka2/Mutect2 vs. pure Rust variant caller. Wrappers are faster to ship, pure Rust is faster to run and more maintainable long-term. Recommendation: wrappers for v1, evaluate pure Rust for v2.

2. **MHCflurry vs. NetMHCpan?** MHCflurry is fully open source. NetMHCpan is free for non-commercial use but has a restrictive license. MHCflurry's pan-allele predictor is competitive. Recommendation: MHCflurry for v1.

3. **Self-host vs. cloud AlphaFold?** Self-hosting requires GPU infrastructure. Google's AlphaFold API is free but rate-limited. For v1 throughput (dozens of patients/month), API is fine. At scale (thousands), need self-hosted. Recommendation: API for v1.

4. **Regulatory classification of the platform itself?** Is a neoantigen prediction report a "medical device" requiring FDA clearance? Likely not if positioned as decision support (not diagnostic). Needs legal review before Phase 3 launch. The platform does NOT claim to diagnose, treat, or cure — it provides computational analysis to support clinical decision-making by licensed physicians.

5. **Open source strategy?** Open-sourcing the prediction pipeline drives adoption and trust. Charge for managed service (hosting, support, oncologist reports). Similar to GitLab model. Recommendation: open-source core pipeline, proprietary managed service + web app.
