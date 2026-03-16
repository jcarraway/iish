# OncoVax — Phase 3 Claude Code Session Prompts

## Neoantigen Prediction Pipeline (PREDICT)

These sessions build the computational core of the platform: a pipeline that takes tumor + normal sequencing data and outputs a ranked neoantigen report with structural predictions and a draft mRNA vaccine blueprint. This is what Paul Conyngham built manually for his dog — productized into an automated, reproducible pipeline.

**Prerequisites:**
- Phase 1 stable (patient profiles, document ingestion, trial matching)
- Phase 2 stable (sequencing navigator, genomic results interpretation)
- AWS account with HIPAA BAA signed
- NCBI API key (for reference genome + annotation downloads)

**Architecture:**
- Rust for compute-heavy bioinformatics wrappers (alignment, variant calling, HLA typing)
- Python for ML/prediction (MHCflurry, immunogenicity scoring, AlphaFold, mRNA design)
- NATS JetStream for pipeline orchestration (reuse AEGIS event-driven patterns)
- AWS Batch/ECS for containerized compute jobs
- S3 for genomic data storage (HIPAA-compliant)
- The full spec is in ONCOVAX_PLATFORM_SPEC.md Section 4 — reference it for data models and architecture details

---

## SESSION 10: Compute Infrastructure + Pipeline Orchestration

---START---

# OncoVax — Compute Infrastructure + Pipeline Orchestration

This is Session 10, the first Phase 3 session. Phases 1-2 are live. Now we're building the computational pipeline that takes tumor + normal sequencing data and predicts neoantigens for personalized vaccine design.

This session sets up the compute infrastructure, pipeline orchestration layer, data storage, and the schema that tracks pipeline jobs through every step. No bioinformatics yet — just the plumbing that everything else runs on.

## Context

- The pipeline has 7 steps: Alignment → Variant Calling → HLA Typing → Neoantigen Prediction → Structure Prediction → Neoantigen Ranking → mRNA Design
- Each step is a containerized service that reads from an input stream and publishes to an output stream
- We're using NATS JetStream for orchestration (same pattern as AEGIS)
- Compute runs on AWS Batch (for CPU-intensive alignment/variant calling) and ECS (for lighter Python steps)
- All genomic data lives in S3 with HIPAA-compliant encryption
- The full pipeline spec is in ONCOVAX_PLATFORM_SPEC.md Section 4

## What to build

### 1. Prisma Schema Additions

Add these models to the existing schema:

```prisma
model PipelineJob {
  id                  String   @id @default(uuid())
  patientId           String
  patient             Patient  @relation(fields: [patientId], references: [id])
  sequencingOrderId   String?
  sequencingOrder     SequencingOrder? @relation(fields: [sequencingOrderId], references: [id])

  // Input data
  tumorDataPath       String            // S3 path to tumor FASTQ/BAM
  normalDataPath      String            // S3 path to normal FASTQ/BAM
  rnaDataPath         String?           // Optional RNA-seq data path
  inputFormat         String            // "fastq" or "bam"
  referenceGenome     String   @default("GRCh38")

  // Pipeline state
  status              String   @default("queued")  // queued, running, complete, failed, cancelled
  currentStep         String?           // alignment, variant_calling, hla_typing, neoantigen_prediction, structure_prediction, ranking, mrna_design
  stepsCompleted      String[]          // Steps finished successfully
  stepErrors          Json?             // { step: errorMessage } for any failures
  retryCount          Int      @default(0)
  maxRetries          Int      @default(3)

  // Step outputs (S3 paths)
  alignedBamPath      String?
  vcfPath             String?
  annotatedVcfPath    String?

  // Results
  variantCount        Int?
  codingVariants      Int?
  nonsynonymousVariants Int?
  tmb                 Float?            // Tumor mutational burden (mutations/Mb)
  hlaGenotype         Json?             // Full HLA typing result
  neoantigenCount     Int?
  topNeoantigens      Json?             // Top 20 ranked neoantigens
  vaccineBlueprint    Json?             // Draft mRNA vaccine design

  // Output files (S3 paths)
  neoantigenReportPath   String?
  vaccineBlueprintPath   String?
  fullReportPdfPath      String?
  patientSummaryPath     String?

  // Compute tracking
  totalComputeSeconds    Int?
  estimatedCostUsd       Float?

  // Timing
  startedAt           DateTime?
  completedAt         DateTime?
  estimatedCompletion DateTime?

  // Relations
  neoantigens         NeoantigenCandidate[]

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model NeoantigenCandidate {
  id                  String   @id @default(uuid())
  jobId               String
  job                 PipelineJob @relation(fields: [jobId], references: [id])

  // Mutation info
  gene                String            // Gene name (e.g., "KRAS")
  mutation            String            // e.g., "G12D"
  chromosome          String
  position            Int
  refAllele           String
  altAllele           String
  variantType         String            // "SNV", "insertion", "deletion"
  variantAlleleFraction Float           // VAF — clonality indicator

  // Peptide info
  wildtypePeptide     String
  mutantPeptide       String
  peptideLength       Int               // 8-11 for MHC-I, 13-25 for MHC-II

  // Binding prediction
  hlaAllele           String            // Which HLA allele this binds
  bindingAffinityNm   Float             // IC50 in nM (lower = stronger)
  bindingRankPercentile Float           // Percentile rank (lower = stronger)
  wildtypeBindingNm   Float             // WT peptide binding
  bindingClass        String            // "strong_binder" (<50nM), "weak_binder" (<500nM), "non_binder"

  // Scoring components
  immunogenicityScore Float             // 0-1
  agretopicity        Float             // Mutant/WT binding ratio
  expressionLevel     Float?            // TPM from RNA-seq if available
  clonality           Float             // VAF-based estimate

  // Structure prediction
  structurePdbPath    String?           // S3 path to PDB file
  structuralExposure  Float?            // Surface accessibility score

  // Final scoring
  compositeScore      Float
  rank                Int
  confidence          String            // "high", "medium", "low"

  // Full details
  details             Json              // Complete Neoantigen data structure

  createdAt           DateTime @default(now())
}
```

Add the relation to the existing Patient model:
```prisma
// In the Patient model, add:
pipelineJobs        PipelineJob[]
```

And to SequencingOrder if it exists:
```prisma
// In SequencingOrder, add:
pipelineJobs        PipelineJob[]
```

Run the migration.

### 2. S3 Bucket Configuration

Create a utility module for HIPAA-compliant S3 operations:

```
packages/pipeline-storage/
├── src/
│   ├── index.ts                 # S3 client wrapper
│   ├── upload.ts                # Chunked upload for large FASTQ/BAM files
│   ├── download.ts              # Signed URL generation for downloads
│   └── paths.ts                 # S3 path conventions
└── package.json
```

S3 path convention:
```
s3://oncovax-pipeline-{env}/
├── input/
│   └── {patientId}/{jobId}/
│       ├── tumor_R1.fastq.gz
│       ├── tumor_R2.fastq.gz
│       ├── normal_R1.fastq.gz
│       └── normal_R2.fastq.gz
├── intermediate/
│   └── {patientId}/{jobId}/
│       ├── aligned_tumor.bam
│       ├── aligned_normal.bam
│       ├── somatic_variants.vcf
│       └── annotated_variants.vcf
├── results/
│   └── {patientId}/{jobId}/
│       ├── neoantigen_report.json
│       ├── vaccine_blueprint.json
│       ├── hla_genotype.json
│       ├── structures/
│       │   └── *.pdb
│       └── reports/
│           ├── patient_summary.pdf
│           ├── clinical_report.pdf
│           └── manufacturer_blueprint.pdf
└── reference/
    ├── GRCh38/
    │   ├── genome.fa
    │   ├── genome.fa.fai
    │   └── genome.dict
    └── annotations/
        └── vep_cache/
```

Requirements:
- AES-256 server-side encryption (SSE-S3 or SSE-KMS)
- Bucket policy restricting access to pipeline services only
- Lifecycle rules: move intermediate files to Glacier after 90 days
- Multipart upload support for FASTQ files (can be 20-50GB each)
- Pre-signed URLs for patient data upload (time-limited, single-use)

### 3. NATS JetStream Pipeline Streams

Set up NATS streams for pipeline orchestration. Create the stream definitions:

```
packages/pipeline-orchestrator/
├── src/
│   ├── streams.ts               # JetStream stream definitions
│   ├── orchestrator.ts          # Main orchestrator service
│   ├── job-manager.ts           # Job lifecycle management
│   ├── step-runner.ts           # Step dispatch + monitoring
│   └── retry.ts                 # Retry logic with exponential backoff
└── package.json
```

Stream definitions:

```typescript
const PIPELINE_STREAMS = {
  // Job lifecycle
  "PIPELINE.job.submitted": {
    description: "New pipeline job submitted",
    payload: { jobId: string; patientId: string; inputPaths: object }
  },
  "PIPELINE.job.started": {
    description: "Pipeline job started processing",
    payload: { jobId: string; estimatedMinutes: number }
  },
  "PIPELINE.job.completed": {
    description: "Pipeline job completed successfully",
    payload: { jobId: string; resultPaths: object; summary: object }
  },
  "PIPELINE.job.failed": {
    description: "Pipeline job failed permanently (after retries)",
    payload: { jobId: string; step: string; error: string }
  },

  // Step completion events
  "PIPELINE.step.alignment.complete": {
    payload: { jobId: string; bamPath: string; stats: AlignmentStats }
  },
  "PIPELINE.step.variants.complete": {
    payload: { jobId: string; vcfPath: string; annotatedVcfPath: string; stats: VariantStats }
  },
  "PIPELINE.step.hla.complete": {
    payload: { jobId: string; hlaGenotype: HlaTypingResult }
  },
  "PIPELINE.step.neoantigens.complete": {
    payload: { jobId: string; neoantigenCount: number; topCandidates: object[] }
  },
  "PIPELINE.step.structure.complete": {
    payload: { jobId: string; pdbPaths: string[]; updatedScores: object[] }
  },
  "PIPELINE.step.ranking.complete": {
    payload: { jobId: string; rankedNeoantigens: object[]; reportPath: string }
  },
  "PIPELINE.step.mrna_design.complete": {
    payload: { jobId: string; blueprintPath: string; blueprint: object }
  },

  // Step failure events (individual step — may be retried)
  "PIPELINE.step.failed": {
    payload: { jobId: string; step: string; error: string; retryable: boolean; retryCount: number }
  },

  // Progress tracking (for UI updates)
  "PIPELINE.progress": {
    payload: { jobId: string; step: string; percentComplete: number; message: string }
  }
};
```

### 4. Pipeline Orchestrator Service

Build the orchestrator that manages job lifecycle:

```typescript
// Orchestrator responsibilities:
// 1. Consume "job.submitted" → validate inputs → dispatch to alignment step
// 2. Consume each "step.*.complete" → dispatch next step in sequence
// 3. Handle "step.failed" → retry or fail the job
// 4. Update PipelineJob record in Postgres at each transition
// 5. Emit "progress" events for UI updates
// 6. Calculate estimated completion time based on step durations
// 7. Send patient notification on job.completed or job.failed

// Step dependency graph (linear for now):
// alignment → variant_calling → hla_typing → neoantigen_prediction → structure_prediction → ranking → mrna_design

// Each step is dispatched as an AWS Batch job or ECS task
// The orchestrator doesn't run the compute — it dispatches and monitors
```

Implement:
- Job submission validation (check S3 paths exist, file sizes reasonable, format correct)
- Step dispatch (create AWS Batch job definition for each step type)
- Step monitoring (poll for completion or listen for NATS events from running containers)
- Retry logic (exponential backoff, max 3 retries per step, step-specific retry policies)
- Job cancellation support
- Estimated completion calculation (based on input size and historical step durations)
- Failure notification (alert patient and admin when job fails permanently)

### 5. Data Upload Endpoint

Create a secure upload flow for patients submitting sequencing data:

```typescript
// tRPC procedures to add to the pipeline router:

const pipelineRouter = router({
  // Get upload URL (pre-signed S3 URL for direct upload)
  getUploadUrl: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileSize: z.number(),              // Bytes — validate max size
      fileType: z.enum(["fastq", "fastq_gz", "bam", "vcf"]),
      sampleType: z.enum(["tumor", "normal", "rna"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate file size (max 50GB per file)
      // Generate pre-signed S3 upload URL (1 hour expiry)
      // Return { uploadUrl, s3Path, expiresAt }
    }),

  // Submit pipeline job
  submitJob: protectedProcedure
    .input(z.object({
      tumorDataPath: z.string(),         // S3 path from upload
      normalDataPath: z.string(),
      rnaDataPath: z.string().optional(),
      inputFormat: z.enum(["fastq", "bam"]),
      sequencingOrderId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate S3 paths exist and are accessible
      // Create PipelineJob record
      // Publish to PIPELINE.job.submitted
      // Return { jobId, estimatedCompletion }
    }),

  // Get job status
  getJobStatus: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Return full job status with current step, progress, estimates
    }),

  // List patient's jobs
  getMyJobs: protectedProcedure
    .query(async ({ ctx }) => {
      // Return all pipeline jobs for this patient
    }),

  // Cancel a running job
  cancelJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Cancel running AWS Batch jobs
      // Update status to "cancelled"
    }),
});
```

### 6. Reference Genome Setup

Create a setup script that downloads and indexes the reference genome:

```bash
# This runs once during infrastructure setup, not per-job

# Download GRCh38 reference genome (NCBI)
# Download genome annotation (Ensembl VEP cache for variant annotation)
# Index with BWA-MEM2 (creates .bwt, .pac, .ann, .amb, .sa files)
# Index with samtools faidx (creates .fai file)
# Create sequence dictionary (creates .dict file)
# Upload all to S3 reference/ prefix

# Reference files are ~15GB total
# BWA index takes ~1 hour to build
# VEP cache is ~15GB for GRCh38
```

Create `scripts/setup-reference-genome.sh` that automates this entire process.

### 7. AWS Batch Job Definitions

Create Terraform or AWS CDK definitions for:
- A compute environment (EC2 or Fargate, memory-optimized for alignment/variant calling)
- Job queues (one for CPU-intensive jobs, one for lighter Python jobs)
- Job definition templates for each pipeline step (container image, resource requirements, environment variables)

Resource estimates per step:
```
Alignment:           8 vCPUs, 32GB RAM, ~1-2 hours for 30x WES
Variant Calling:     4 vCPUs, 16GB RAM, ~1-2 hours
HLA Typing:          2 vCPUs, 8GB RAM, ~15-30 minutes
Neoantigen Predict:  4 vCPUs, 16GB RAM, ~30-60 minutes
Structure Predict:   2 vCPUs, 8GB RAM, ~30-60 minutes (API calls, not local compute)
Ranking:             2 vCPUs, 8GB RAM, ~5-10 minutes
mRNA Design:         2 vCPUs, 8GB RAM, ~5-10 minutes
```

Total estimated runtime per job: 4-6 hours
Total estimated cost per job: $2-5 (AWS Batch spot instances)

### 8. Pipeline Status Page

Create basic web UI for pipeline status tracking:

```
app/pipeline/
├── page.tsx                     # Pipeline home — upload data or view jobs
├── upload/page.tsx              # Data upload flow (chunked upload to S3)
├── jobs/page.tsx                # List of pipeline jobs
└── jobs/[jobId]/page.tsx        # Individual job status + progress
```

The job detail page should show:
- Current step with progress bar
- Steps completed with timestamps and durations
- Estimated time remaining
- Visual pipeline diagram showing which steps are done/in-progress/pending
- Error details if any step failed
- When complete: link to results

### 9. Verify everything works

- NATS JetStream streams create successfully
- S3 bucket is accessible with proper encryption
- Pre-signed upload URLs generate and work
- Pipeline job can be submitted (goes to "queued" status)
- Orchestrator consumes job.submitted event
- AWS Batch job definitions are registered
- Pipeline status page renders with job tracking

---END---

### SESSION 10 IMPLEMENTATION NOTES — COMPLETED ✓

**What was built (36 new files, 9 modified):**

**Prisma Schema (Step 1):**
- `PipelineJob` model: 30+ fields covering input data, pipeline state, step outputs, results, output files, compute tracking, timing. Relations to Patient (cascade) and SequencingOrder (optional). Indexes on `[patientId, createdAt desc]` and `[status]`.
- `NeoantigenCandidate` model: 30+ fields covering mutation info, peptide info, binding prediction, scoring components, structure prediction, final scoring. Relation to PipelineJob (cascade). Indexes on `[jobId, rank]` and `[gene]`.
- Updated Patient and SequencingOrder with `pipelineJobs` relation. Total: 17 Prisma models.

**Shared Package (Step 2):**
- 6 new constants: `PIPELINE_STATUSES`, `PIPELINE_STEPS`, `PIPELINE_STEP_ORDER`, `PIPELINE_INPUT_FORMATS`, `NEOANTIGEN_CONFIDENCE`, `NEOANTIGEN_BINDING_CLASS`
- 4 new types: `PipelineJobSummary`, `PipelineJobDetail`, `PipelineProgressEvent`, `NeoantigenCandidateSummary`
- 2 new Zod schemas: `pipelineUploadUrlSchema`, `pipelineSubmitJobSchema`

**Pipeline Storage Package (Step 3) — `packages/pipeline-storage/`:**
- S3 client singleton (reads `AWS_S3_PIPELINE_BUCKET`, same pattern as `apps/web/lib/s3.ts`)
- Path convention helpers: `inputPath()`, `intermediatePath()`, `resultsPath()`, `referencePath()`
- Presigned upload URLs (1hr expiry, AES-256 SSE), multipart upload via `@aws-sdk/lib-storage`
- Presigned download URLs (1hr), `objectExists()` via HeadObject

**Pipeline Orchestrator Package (Step 4) — `packages/pipeline-orchestrator/`:**
- NATS connection + JetStream stream `PIPELINE` with subject wildcard `PIPELINE.>`
- Event subjects + Zod schemas for `job.submitted`, `step.{step}.complete`, `step.failed`, `progress`
- 3 durable consumers: `job-submitted`, `step-complete`, `step-failed`
- AWS Batch dispatcher: 7 job definitions mapped to cpu-intensive/standard queues
- Exponential backoff retry (5s base, 5min max, 20% jitter)
- Prisma job manager: `markJobStarted`, `markStepComplete` (maps step outputs to columns), `markJobComplete`, `markJobFailed`, `incrementRetry`
- Standalone entry point (`tsx src/index.ts`) with graceful SIGINT/SIGTERM shutdown

**NATS Client for Web App (Step 5) — `apps/web/lib/nats.ts`:**
- globalThis singleton pattern, lazy-connecting, `getJetStream()` + `publishEvent()` helpers

**API Routes (Step 6):**
- `POST /api/pipeline/upload-url` — validates with `pipelineUploadUrlSchema`, returns presigned PUT URL
- `POST /api/pipeline/submit` — validates S3 objects exist (HeadObject), creates PipelineJob record, publishes `PIPELINE.job.submitted`
- `GET /api/pipeline/jobs` — lists patient's jobs with summary select, ordered by createdAt desc
- `GET/DELETE /api/pipeline/jobs/[jobId]` — GET returns full detail + top 20 neoantigens; DELETE cancels queued/running jobs
- `GET /api/pipeline/jobs/[jobId]/results` — generates presigned download URLs for all output files

**Terraform (Step 7) — `infrastructure/terraform/`:**
- VPC: public + private subnets across 2 AZs, internet gateway, NAT gateway, route tables, security groups for Batch and NATS
- S3: Pipeline bucket with versioning, AES-256 encryption, Glacier lifecycle at 90 days, public access blocked
- IAM: Batch execution role, job role (S3 + CloudWatch), service role, NATS execution role
- Batch: 2 compute environments (EC2 spot, r6i instances, 64/32 max vCPUs), 2 job queues, 7 placeholder job definitions (alpine:latest)
- NATS: ECS Fargate service, EFS filesystem for JetStream persistence, internal NLB on port 4222, CloudWatch logging

**Reference Genome Script (Step 8) — `scripts/setup-reference-genome.sh`:**
- Downloads GRCh38 from NCBI (~3GB) + Ensembl VEP cache (~15GB)
- Indexes with BWA-MEM2 + samtools faidx + samtools dict
- Uploads to S3 `reference/GRCh38/` with AES-256 encryption
- Verifies all uploads, checks prerequisites

**Pipeline Pages (Step 9):**
- `/pipeline` — Home page: job summary cards or upload CTA
- `/pipeline/upload` — Dual drop-zone upload (tumor + normal), XHR PUT with progress, auto-submit
- `/pipeline/jobs` — Job list with status badges, progress bars, variant/neoantigen counts
- `/pipeline/jobs/[jobId]` — Job detail: PipelineProgressBar (7-step visual), error display, stats grid (variants/TMB/neoantigens), neoantigen table, download links, 10s polling while active
- `PipelineProgressBar` component: animated pulse for current step, checkmarks for completed, X for failed

**Configuration (Step 10):**
- `.env.example`: added `NATS_URL`, `AWS_S3_PIPELINE_BUCKET`, `AWS_BATCH_JOB_QUEUE_CPU`, `AWS_BATCH_JOB_QUEUE_STANDARD`
- `turbo.json`: added `orchestrator:dev` task (persistent, no cache)
- Root `package.json`: added `orchestrator:dev` script

**Verification:**
- `pnpm db:push` — PipelineJob and NeoantigenCandidate tables created in PostgreSQL ✓
- `pnpm build` — 0 type errors, 73 pages generated including all new pipeline routes and pages ✓
- Terraform files syntactically complete (terraform not installed locally for `plan`)

**Deviations from prompt:**
- Used Next.js API routes (not tRPC), consistent with Sessions 1-9
- `intermediate/` paths use `{jobId}/` only (not `{patientId}/{jobId}/`) for simpler cleanup
- NATS stream retention: `workqueue` (not `limits`) for automatic message cleanup after consumption
- Merged spec Tasks 1 + 9 + 10 into single session (orchestrator + UI are infrastructure plumbing)
- Omitted `codingVariants` and `nonsynonymousVariants` columns from PipelineJob (redundant with `variantCount`; specific counts come from the VCF step)

---

## SESSION 11: Alignment + Variant Calling (Rust)

---START---

# OncoVax — Alignment + Variant Calling

This is Session 11. The pipeline infrastructure from Session 10 is running — NATS JetStream, S3 storage, AWS Batch, orchestrator, and upload flow. Now we build the first two compute-intensive steps: sequence alignment and somatic variant calling. Both are Rust services that wrap established bioinformatics tools.

## Context

- Input: paired-end FASTQ files (tumor + normal) from whole-exome sequencing (WES)
- Step 1 (Alignment): FASTQ → sorted BAM using BWA-MEM2
- Step 2 (Variant Calling): tumor BAM + normal BAM → somatic VCF using Strelka2 + Mutect2
- Both steps run as containerized jobs on AWS Batch
- Each step publishes a completion event to NATS JetStream for the orchestrator
- Reference genome (GRCh38) is pre-indexed on S3 (set up in Session 10)
- Target: process a 30x WES sample in <4 hours total for both steps

## What to build

### 1. Alignment Service (Rust)

Create the alignment service:

```
services/neoantigen-pipeline/
├── alignment/
│   ├── Cargo.toml
│   ├── Dockerfile                # BWA-MEM2 + samtools + Rust binary
│   ├── src/
│   │   ├── main.rs               # Entry point — consume NATS event, run alignment, publish result
│   │   ├── config.rs             # Configuration from environment variables
│   │   ├── aligner.rs            # BWA-MEM2 wrapper
│   │   ├── postprocess.rs        # Sort, mark duplicates, index BAM
│   │   ├── quality.rs            # Alignment quality metrics
│   │   └── s3.rs                 # S3 upload/download helpers
│   └── tests/
│       └── integration.rs
```

The alignment step:

1. **Download inputs from S3:**
   - Tumor FASTQ files (R1 + R2 for paired-end)
   - Normal FASTQ files (R1 + R2)
   - Reference genome index files (BWA index, .fai, .dict) — cache these locally if possible

2. **Run BWA-MEM2 alignment:**
   ```
   bwa-mem2 mem -t {threads} -R "@RG\tID:{sample}\tSM:{sample}\tPL:ILLUMINA" \
     {reference.fa} {R1.fastq.gz} {R2.fastq.gz} | \
     samtools sort -@ {threads} -o {output.bam}
   ```
   - Run separately for tumor and normal
   - Use all available CPU threads
   - Pipe directly to samtools sort (avoid writing unsorted SAM)

3. **Post-processing:**
   - Mark duplicates with `samtools markdup` or Picard MarkDuplicates
   - Index BAM with `samtools index`
   - Calculate alignment stats with `samtools flagstat`

4. **Quality metrics to extract:**
   ```rust
   pub struct AlignmentStats {
       pub total_reads: u64,
       pub mapped_reads: u64,
       pub mapping_rate: f64,              // Should be >95%
       pub duplicate_rate: f64,            // Should be <30% for WES
       pub mean_coverage: f64,             // Target: 30x+ for tumor, 30x+ for normal
       pub on_target_rate: f64,            // % reads in exome capture regions
       pub insert_size_mean: f64,
       pub insert_size_std: f64,
       pub tumor_contamination_estimate: f64,  // From VerifyBamID or similar
   }
   ```

5. **Quality gates:** If alignment fails quality checks, publish a failure event with the specific issue. Quality gates:
   - Mapping rate < 80% → FAIL (likely wrong reference or severely degraded sample)
   - Mean coverage < 15x → WARN (low coverage, variant calling may be unreliable)
   - Mean coverage < 5x → FAIL (insufficient for reliable variant calling)
   - Duplicate rate > 50% → WARN (possible library quality issue)

6. **Upload results to S3** (intermediate/ prefix)

7. **Publish completion event** to `PIPELINE.step.alignment.complete` with:
   - Aligned tumor BAM path
   - Aligned normal BAM path
   - AlignmentStats for both tumor and normal
   - Step duration

8. **Publish progress events** during alignment (large files take time — update UI):
   - "Downloading reference genome..."
   - "Aligning tumor sample (X% complete)..."
   - "Aligning normal sample..."
   - "Post-processing: marking duplicates..."
   - "Uploading results..."

### 2. Variant Calling Service (Rust)

Create the variant calling service:

```
services/neoantigen-pipeline/
├── variant-caller/
│   ├── Cargo.toml
│   ├── Dockerfile                # Strelka2 + Mutect2 (GATK) + bcftools + Rust binary
│   ├── src/
│   │   ├── main.rs               # Entry point
│   │   ├── config.rs
│   │   ├── strelka.rs            # Strelka2 wrapper
│   │   ├── mutect.rs             # Mutect2 (GATK) wrapper
│   │   ├── consensus.rs          # Merge results from both callers
│   │   ├── annotate.rs           # VEP annotation wrapper
│   │   ├── quality.rs            # Variant quality metrics
│   │   └── s3.rs
│   └── tests/
│       └── integration.rs
```

The variant calling step:

1. **Download inputs from S3:**
   - Aligned tumor BAM + index (from alignment step)
   - Aligned normal BAM + index
   - Reference genome

2. **Run Strelka2:**
   ```
   # Configure
   configureStrelkaSomaticWorkflow.py \
     --normalBam {normal.bam} \
     --tumorBam {tumor.bam} \
     --ref {reference.fa} \
     --runDir {strelka_output}

   # Execute
   {strelka_output}/runWorkflow.py -m local -j {threads}
   ```
   - Strelka2 outputs: somatic.snvs.vcf.gz and somatic.indels.vcf.gz

3. **Run Mutect2 (GATK):**
   ```
   gatk Mutect2 \
     -R {reference.fa} \
     -I {tumor.bam} \
     -I {normal.bam} \
     -normal {normal_sample_name} \
     --f1r2-tar-gz {f1r2.tar.gz} \
     -O {mutect2_output.vcf.gz}

   gatk FilterMutectCalls \
     -R {reference.fa} \
     -V {mutect2_output.vcf.gz} \
     -O {mutect2_filtered.vcf.gz}
   ```

4. **Consensus calling:**
   - Variants called by BOTH Strelka2 and Mutect2 → HIGH confidence
   - Variants called by only one caller → MEDIUM confidence (include but flag)
   - Track caller agreement rate as a quality metric
   - Use `bcftools isec` for intersection

5. **Variant annotation with VEP (Variant Effect Predictor):**
   ```
   vep --input_file {consensus.vcf} \
     --output_file {annotated.vcf} \
     --cache --dir_cache {vep_cache_path} \
     --assembly GRCh38 \
     --offline \
     --vcf \
     --symbol --terms SO \
     --af_gnomad --max_af \
     --plugin Frameshift \
     --plugin Wildtype \
     --pick
   ```
   - Annotation adds: gene name, consequence type (missense, frameshift, etc.), protein change, allele frequencies
   - Filter to CODING variants only for neoantigen prediction (nonsynonymous SNVs + frameshifts + in-frame indels)

6. **Quality metrics:**
   ```rust
   pub struct VariantCallingStats {
       pub total_somatic_variants: u64,
       pub snvs: u64,
       pub indels: u64,
       pub coding_variants: u64,
       pub nonsynonymous: u64,
       pub frameshift: u64,
       pub stop_gain: u64,
       pub tmb: f64,                       // Mutations per megabase of coding region
       pub caller_agreement_rate: f64,      // % variants called by both callers
       pub ti_tv_ratio: f64,               // Transition/transversion ratio (should be ~2.0-3.0 for WES)
       pub gnomad_filter_rate: f64,         // % filtered as likely germline by gnomAD AF
   }
   ```

7. **Tumor mutational burden (TMB) calculation:**
   - TMB = nonsynonymous coding mutations / size of coding region captured (in Mb)
   - Report as mutations/Mb
   - Classify: low (<5), medium (5-20), high (>20)
   - TMB is relevant for immunotherapy response prediction

8. **Upload annotated VCF to S3, publish completion event:**
   ```
   PIPELINE.step.variants.complete: {
     jobId, vcfPath, annotatedVcfPath, stats: VariantCallingStats
   }
   ```

### 3. Docker Images

Build Dockerfiles for both services. Each container needs:

**Alignment container:**
- BWA-MEM2 (latest)
- samtools (>= 1.17)
- Rust binary (the orchestration/wrapper code)
- AWS CLI (for S3 operations) or use Rust AWS SDK
- ~4GB image size

**Variant calling container:**
- Strelka2 (>= 2.9.10)
- GATK (>= 4.4) with Mutect2
- bcftools (>= 1.17)
- Ensembl VEP (>= 110)
- Rust binary
- AWS CLI or Rust AWS SDK
- ~8GB image size

Both containers should:
- Accept configuration via environment variables (S3 paths, NATS connection, job ID)
- Log structured JSON to stdout
- Emit NATS progress events during processing
- Handle SIGTERM gracefully (clean up temp files)
- Exit with appropriate codes (0 = success, 1 = retryable failure, 2 = permanent failure)

### 4. Integration Test with Sample Data

Download a small test dataset to validate the pipeline:
- Use TCGA or GIAB (Genome in a Bottle) samples for testing
- Create a downsampled version (1% of reads) for fast integration tests
- Full-size test should complete in <30 minutes on appropriate hardware

Create an integration test script that:
1. Uploads test FASTQ files to S3
2. Submits a pipeline job
3. Monitors progress via NATS events
4. Validates output:
   - BAM files are valid and indexed
   - VCF contains expected variant calls
   - AlignmentStats are within expected ranges
   - VariantCallingStats are reasonable
5. Cleans up test data

### 5. Update Orchestrator

Update the orchestrator from Session 10 to:
- Handle `PIPELINE.step.alignment.complete` → dispatch variant calling step
- Handle `PIPELINE.step.variants.complete` → dispatch HLA typing step (Session 12)
- Track step durations for estimated completion calculation
- Update PipelineJob record after each step

### 6. Verify

- Alignment container builds and runs locally with test data
- Variant calling container builds and runs locally with test BAM
- NATS events flow correctly: job.submitted → alignment.complete → variants.complete
- Quality metrics calculate correctly
- S3 paths are correct and files are accessible
- PipelineJob record updates at each step transition

---END---

### Session 11 — COMPLETED

**What was built:**

Cargo workspace at `services/neoantigen-pipeline/` with 3 crates and 2 Dockerfiles:

**pipeline-common** (shared crate, 8 modules):
- `config.rs` — Parse all env vars from orchestrator dispatcher (`PIPELINE_JOB_ID`, `PIPELINE_STEP`, `NATS_URL`, `AWS_S3_PIPELINE_BUCKET`, `TUMOR_DATA_PATH`, `NORMAL_DATA_PATH`, `INPUT_FORMAT`, `REFERENCE_GENOME`)
- `error.rs` — `PipelineError` enum: retryable (S3 timeout, OOM, NATS) vs permanent (bad input, quality gate, tool crash). Exit codes: 0=ok, 1=retry, 2=permanent
- `paths.rs` — S3 path conventions mirroring `packages/pipeline-storage/src/paths.ts` (`intermediate/{jobId}/{file}`, `reference/{genome}/{file}`)
- `s3.rs` — Download/upload with multipart support for large BAMs (50MB parts, AES256 encryption)
- `nats.rs` — JetStream publish to `PIPELINE.step.{step}.complete`, `PIPELINE.step.failed`, `PIPELINE.progress`
- `events.rs` — `StepCompleteEvent`, `StepFailedEvent`, `ProgressEvent` with camelCase serialization matching Zod schemas
- `process.rs` — Subprocess runner with piped execution (`bwa-mem2 | samtools sort`), OOM detection (signal 9)
- `logging.rs` — Structured JSON logging via tracing-subscriber

**alignment** service:
- `aligner.rs` — `bwa-mem2 mem -t {threads} -R "@RG\tID:{sample}\tSM:{sample}\tPL:ILLUMINA" {ref} {R1} {R2} | samtools sort -@ {threads} -o {out.bam}`
- `postprocess.rs` — `samtools markdup` → `samtools index` → `samtools flagstat` with output parsing into `AlignmentStats`
- `quality.rs` — Gates: mapping rate <80% = FAIL, coverage <5x = FAIL, <15x = WARN, dup rate >50% = WARN
- `main.rs` — Download ref + FASTQs → align tumor → align normal → postprocess both → quality gates → upload BAMs + indices → publish `PIPELINE.step.alignment.complete` with `{alignedBamPath, normalBamPath, tumorStats, normalStats}`
- `Dockerfile` — Multi-stage: Rust builder → runtime with BWA-MEM2 v2.2.1 + samtools v1.20

**variant-caller** service:
- `strelka.rs` — Strelka2 `configureStrelkaSomaticWorkflow.py` → `runWorkflow.py -m local -j {threads}`
- `mutect.rs` — `gatk Mutect2` → `gatk FilterMutectCalls`
- `consensus.rs` — `bcftools concat` Strelka SNVs+indels → `bcftools isec` with Mutect2 → merge with HIGH/MEDIUM confidence tags
- `annotate.rs` — VEP v112 `--cache --offline --assembly GRCh38 --vcf --symbol --terms SO --af_gnomad --plugin Frameshift,Wildtype --pick`
- `quality.rs` — Parse annotated VCF for stats (SNVs, indels, coding, nonsynonymous, frameshift). TMB = nonsynonymous/33Mb. Classification: low (<5), medium (5-20), high (>20). Ti/Tv ratio, caller agreement rate.
- `main.rs` — Download BAMs from `intermediate/{jobId}/aligned_tumor.bam` → Strelka2 + Mutect2 → consensus → VEP → stats → upload VCFs → publish `PIPELINE.step.variant_calling.complete` with `{vcfPath, annotatedVcfPath, variantCount, tmb}`
- `Dockerfile` — Multi-stage: Rust builder → samtools + bcftools v1.20, Strelka2 v2.9.10, GATK v4.5 + JDK 17, VEP v112

**Terraform updates:**
- New `ecr.tf` — ECR repos for `oncovax/alignment` and `oncovax/variant-caller` with keep-last-5 lifecycle policies
- Updated `batch.tf` — Replaced `alpine:latest` placeholders with ECR image URLs, added `/scratch` volume mounts
- Updated `iam.tf` — ECR pull permissions on batch execution role
- Updated `outputs.tf` — `ecr_alignment_url`, `ecr_variant_caller_url`

**Verification:** `cargo build --release` — 0 errors, 0 warnings. `cargo test` — 28 tests passing (9 alignment + 12 pipeline-common + 7 variant-caller). All NATS event payloads match orchestrator Zod schemas. Metadata keys match job-manager.ts mappings. S3 paths follow pipeline-storage conventions.

**Files:** 20 new files, 4 modified files (batch.tf, iam.tf, outputs.tf, .gitignore)

**Deviations from plan:**
- Rust toolchain pinned to `stable` instead of 1.82 (aws-sdk-s3 requires Rust 1.91+)
- Used shared pipeline-common crate instead of per-service config/s3 modules (reduces duplication)
- Separated `events.rs` from `nats.rs` for cleaner dependency structure

---

## SESSION 12: HLA Typing + Mutant Peptide Generation

---START---

# OncoVax — HLA Typing + Mutant Peptide Generation

This is Session 12. Alignment and variant calling are working (Session 11). We have a somatic VCF with annotated coding variants. Now we need two things before neoantigen prediction: (1) the patient's HLA type (which determines which peptides their immune system can recognize) and (2) the mutant peptide sequences derived from the somatic variants.

## Context

- HLA alleles are the "locks" on the cell surface. Neoantigens are the "keys." Predicting which mutant peptides bind to which HLA alleles is the core of neoantigen prediction.
- HLA typing from sequencing data is a solved problem — OptiType is the gold standard for Class I (HLA-A, -B, -C). HLA-HD handles both Class I and Class II.
- Mutant peptide generation takes the annotated VCF and generates all possible mutant peptide windows (8-11 amino acids for MHC-I, 13-25 for MHC-II) centered on each mutation.

## What to build

### 1. HLA Typing Service (Rust wrapper)

```
services/neoantigen-pipeline/
├── hla-typer/
│   ├── Cargo.toml
│   ├── Dockerfile                # OptiType + HLA-HD + Rust binary
│   ├── src/
│   │   ├── main.rs
│   │   ├── config.rs
│   │   ├── optitype.rs           # OptiType wrapper (Class I)
│   │   ├── hla_hd.rs             # HLA-HD wrapper (Class I + II)
│   │   ├── consensus.rs          # Compare results between tools
│   │   └── s3.rs
│   └── tests/
│       └── integration.rs
```

The HLA typing step:

1. **Download normal BAM from S3** (use normal, not tumor — HLA type is germline)

2. **Extract HLA reads:**
   ```bash
   # Extract reads mapping to HLA region (chr6:28,477,797-33,448,354 in GRCh38)
   samtools view -b {normal.bam} chr6:28477797-33448354 > hla_reads.bam
   # Also extract unmapped reads (some HLA reads don't map well to standard reference)
   samtools view -b -f 4 {normal.bam} > unmapped.bam
   # Merge and convert to FASTQ
   samtools merge merged.bam hla_reads.bam unmapped.bam
   samtools fastq -1 hla_R1.fastq -2 hla_R2.fastq merged.bam
   ```

3. **Run OptiType (Class I — HLA-A, -B, -C):**
   ```bash
   OptiTypePipeline.py -i hla_R1.fastq hla_R2.fastq \
     --dna -v -o {optitype_output} -p {sample_name}
   ```
   - Parse output TSV for 6 alleles (2 each for HLA-A, -B, -C)

4. **Run HLA-HD (Class I + Class II — optional but valuable):**
   ```bash
   hlahd.sh -t {threads} -m 100 -c 0.95 \
     -f {freq_data_dir} \
     hla_R1.fastq hla_R2.fastq \
     {gene_split_dir} {dictionary_dir} \
     {sample_name} {output_dir}
   ```
   - Provides Class II alleles (HLA-DRB1, -DQB1, -DPB1) needed for MHC-II binding prediction
   - Also gives Class I — compare with OptiType as validation

5. **Consensus:**
   - If OptiType and HLA-HD agree on Class I → HIGH confidence
   - If they disagree on any allele → flag for review, use OptiType as primary (more validated for Class I)
   - Class II alleles from HLA-HD only (OptiType doesn't do Class II)

6. **Output structure:**
   ```rust
   pub struct HlaTypingResult {
       pub class_i: HlaClassI,
       pub class_ii: Option<HlaClassII>,
       pub confidence: f64,
       pub tool_agreement: bool,
       
       // Per-allele details
       pub allele_details: Vec<HlaAlleleDetail>,
   }

   pub struct HlaClassI {
       pub hla_a: [String; 2],   // e.g., ["A*02:01", "A*11:01"]
       pub hla_b: [String; 2],   // e.g., ["B*07:02", "B*44:02"]
       pub hla_c: [String; 2],   // e.g., ["C*05:01", "C*07:02"]
   }

   pub struct HlaClassII {
       pub hla_drb1: [String; 2],
       pub hla_dqb1: [String; 2],
       pub hla_dpb1: [String; 2],
   }

   pub struct HlaAlleleDetail {
       pub locus: String,          // "A", "B", "C", "DRB1", etc.
       pub allele: String,         // "A*02:01"
       pub reads_supporting: u32,
       pub confidence: f64,
       pub tool_source: String,    // "optitype", "hla_hd", "consensus"
   }
   ```

7. **Store HLA genotype in PipelineJob.hlaGenotype and publish:**
   ```
   PIPELINE.step.hla.complete: { jobId, hlaGenotype: HlaTypingResult }
   ```

### 2. Mutant Peptide Generator (Python)

This is the bridge between variant calling and neoantigen prediction. Create:

```
services/neoantigen-pipeline/
├── peptide-generator/
│   ├── requirements.txt           # pyvcf3, pysam, biopython
│   ├── Dockerfile
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py               # Entry point
│   │   ├── vcf_parser.py         # Parse annotated VCF
│   │   ├── peptide_generator.py  # Generate mutant + wildtype peptide windows
│   │   ├── fasta_lookup.py       # Look up reference protein sequences
│   │   └── output.py             # Output peptide list for binding prediction
│   └── tests/
│       ├── test_peptide_gen.py
│       └── test_data/
│           └── sample.vcf
```

For each nonsynonymous coding variant in the annotated VCF:

1. **Extract mutation context:**
   - Gene name, transcript ID
   - Protein position and amino acid change (e.g., G12D in KRAS)
   - Variant type (missense, frameshift, in-frame indel, stop-loss)

2. **Retrieve wildtype protein sequence:**
   - From Ensembl protein FASTA (pre-downloaded) based on transcript ID
   - Or from VEP Wildtype plugin output

3. **Generate mutant protein sequence:**
   - For missense: substitute single amino acid
   - For frameshift: generate novel amino acid sequence from frameshift point until next stop codon
   - For in-frame insertion/deletion: insert or remove amino acids

4. **Generate peptide windows:**
   - For MHC-I binding: generate all 8-mer, 9-mer, 10-mer, and 11-mer peptide windows that contain the mutant residue(s)
   - For MHC-II binding: generate all 15-mer windows
   - Also generate corresponding wildtype peptide windows (needed for agretopicity calculation)
   - For a single missense mutation, this produces: ~4 peptides × 4 lengths = ~16 MHC-I candidates + ~4 MHC-II candidates

5. **Output format:**
   ```python
   @dataclass
   class PeptideCandidate:
       gene: str
       mutation: str                  # "G12D"
       chromosome: str
       position: int
       ref_allele: str
       alt_allele: str
       variant_type: str              # "missense", "frameshift", "inframe_indel"
       variant_allele_fraction: float  # VAF from VCF

       mutant_peptide: str            # "VVVGADGVGK"
       wildtype_peptide: str          # "VVVGAGGVGK"
       peptide_length: int
       mutation_position_in_peptide: int  # 0-indexed

       # For MHC-II
       is_class_ii_candidate: bool    # True if length >= 13

   # Output: list of all PeptideCandidate objects as JSON
   # Typically 500-5,000 candidates per patient (depending on TMB)
   ```

6. **Filter out:**
   - Peptides from genes not expressed (if RNA-seq data available — check expression)
   - Variants with VAF < 0.05 (likely subclonal noise or artifact)
   - Variants in pseudogenes or non-protein-coding transcripts
   - Variants in highly polymorphic regions (may be germline leakage)

7. **Publish output to S3 and emit event:**
   ```
   PIPELINE.step.peptides.complete: {
     jobId,
     totalCandidates: number,
     mhcICandidates: number,
     mhcIICandidates: number,
     genesAffected: string[],
     peptideFilePath: string  // S3 path to JSON
   }
   ```

### 3. Update Orchestrator

- Handle `PIPELINE.step.hla.complete` and `PIPELINE.step.peptides.complete`
- HLA typing and peptide generation can run IN PARALLEL (both depend on variant calling output, neither depends on the other)
- When BOTH are complete → dispatch neoantigen prediction step (Session 13)
- Update the step dependency graph:
  ```
  alignment → variant_calling → [hla_typing, peptide_generation] → neoantigen_prediction → ...
  ```

### 4. Test with Sample Data

- Use a sample VCF with known mutations (TCGA breast cancer sample recommended)
- Verify HLA typing produces reasonable alleles (validate against TCGA HLA calls if available)
- Verify peptide generator produces expected peptides for known mutations (e.g., KRAS G12D should produce specific 9-mer peptides)
- Verify parallel step execution works correctly

### 5. Verify

- HLA typing container runs and produces valid genotypes
- Peptide generator produces correct mutant + wildtype peptide sequences
- Parallel execution of HLA + peptides works
- Orchestrator correctly waits for both before dispatching next step
- Output formats match what Session 13's binding prediction expects

---END---

### Session 12 — COMPLETED

**What was built:**

HLA Typer (Rust) + Peptide Generator (first Python service) + DAG-based orchestrator refactoring for parallel fan-out/fan-in:

**Orchestrator refactoring (highest-risk change):**
- Replaced linear `indexOf(step) + 1` progression with DAG-based resolution using new `PIPELINE_STEP_GRAPH` and `PIPELINE_STEP_PREREQUISITES` constants
- `markStepComplete` return type changed from `{ isLastStep, nextStep }` to `{ isLastStep, nextSteps[] }`
- Wrapped in Prisma `$transaction` with `isolationLevel: 'Serializable'` to prevent race condition on fan-in (two parallel steps completing simultaneously)
- `consumers.ts` dispatches multiple steps via `Promise.all(nextSteps.map(...))` for fan-out
- Handles empty `nextSteps` (waiting for parallel sibling to finish — no dispatch, no error)
- `dispatcher.ts` adds `peptide_generation` job definition on standard queue

**Shared constants/types:**
- `PIPELINE_STEP_GRAPH`: DAG defining `variant_calling → [hla_typing, peptide_generation] → neoantigen_prediction`
- `PIPELINE_STEP_PREREQUISITES`: inverse lookup for fan-in prerequisite checking
- `peptideFilePath: string | null` added to `PipelineJobDetail`
- `peptideFilePath String?` added to PipelineJob Prisma model

**hla-typer** service (Rust, 6 source files):
- `main.rs` — Download normal BAM → extract HLA reads (chr6:28477797-33448354 + unmapped) → name-sort → BAM-to-FASTQ → OptiType → HLA-HD → consensus → quality gates → upload `hla_genotype.json` → publish NATS
- `optitype.rs` — Run `OptiTypePipeline.py`, parse TSV output for Class I alleles (HLA-A, -B, -C)
- `hlahd.rs` — Run `hlahd.sh`, parse result.txt, normalize alleles to 2-field resolution (e.g., `HLA-A*02:01:01:01` → `HLA-A*02:01`)
- `consensus.rs` — OptiType primary for Class I, HLA-HD primary for Class II, discrepancy detection
- `quality.rs` — Allele nomenclature validation via regex, all 6 Class I alleles required, max 3 discrepancies
- `Dockerfile` — Multi-stage: Rust builder → runtime with samtools v1.20, OptiType v1.3.5, HLA-HD

**peptide-generator** service (Python, first Python service in pipeline):
- `main.py` — Entry point: download annotated VCF → parse → generate peptides → quality gates → upload `peptide_windows.json` → publish NATS
- `vcf_parser.py` — Parse VEP-annotated VCF, extract protein-altering variants (missense, frameshift, inframe_insertion/deletion, stop_gained). Filters: VAF < 0.05, pseudogenes. Prefers CANONICAL transcript.
- `peptide_generator.py` — Sliding window generation: 8/9/10/11-mer (MHC-I) + 15-mer (MHC-II) peptide windows containing each mutation, with corresponding wildtype peptides. `PeptideWindow` dataclass, `_sliding_windows()` core logic.
- `quality.py` — Zero peptides = fail, zero MHC-I = fail, >50K = warn
- `pipeline_common/` — Python equivalent of Rust pipeline-common: `config.py` (env parsing), `s3.py` (boto3), `nats_client.py` (nats-py JetStream), `events.py` (camelCase serialization), `paths.py` (S3 conventions)

**Tests:**
- 8 new hla-typer Rust tests (OptiType TSV parsing, HLA-HD output parsing, allele normalization, concordant/discordant consensus, quality gate pass/fail)
- 28 Python tests: 11 VCF parser (CSQ parsing, VAF extraction, filtering), 13 peptide generator (KRAS G12D windows, boundary mutations, JSON serialization), 4 quality gates

**Terraform updates:**
- ECR repos for `oncovax/hla-typer` and `oncovax/peptide-generator` with keep-last-5 lifecycle
- `batch.tf` — Replaced hla_typing `alpine:latest` placeholder with real ECR image (4 vCPU, 16GB), added `peptide_generation` job definition (2 vCPU, 4GB)
- ECR pull permissions and URL outputs added

**UI:** Added "Peptide Generation" to `PipelineProgressBar` step labels (now 8 steps)

**Verification:** `cargo build --release` — 0 errors. `cargo test` — 36 tests (8 new hla-typer). `python -m pytest` — 28 tests passing. `pnpm build` — 0 TypeScript errors, 73 pages.

**Files:** ~25 new files (6 hla-typer src + Cargo.toml + Dockerfile, 11 peptide-generator src + requirements.txt + Dockerfile + 3 test files), ~10 modified files (constants.ts, types.ts, index.ts, schema.prisma, job-manager.ts, consumers.ts, dispatcher.ts, batch.tf, ecr.tf, outputs.tf, iam.tf, PipelineProgressBar.tsx, Cargo.toml workspace)

**Deviations from plan:**
- Peptide generator uses 15-mer only for MHC-II (not 13-25 range) — 15-mer is standard for MHCflurry/NetMHCpan binding prediction
- Python uses `Union[str, Path]` syntax (not `str | Path`) for Python 3.9 compatibility
- HLA-HD install is placeholder in Dockerfile (requires institutional license download)

---

## SESSION 13: Neoantigen Prediction + Binding + Immunogenicity Scoring

---START---

# OncoVax — Neoantigen Prediction + Binding + Immunogenicity

This is Session 13 — the most scientifically critical step. We have HLA alleles and mutant peptide candidates. Now we predict which peptides will bind the patient's specific HLA molecules (MHC binding prediction), score them for immunogenicity (T-cell recognition), and produce a ranked list of neoantigen candidates.

## Context

- MHCflurry 2.0 is the primary binding prediction tool (open source, GPU-optional, well-validated)
- Immunogenicity scoring combines binding affinity, agretopicity (differential binding vs wildtype), predicted T-cell recognition, expression level, and clonality
- This step takes ~500-5,000 peptide candidates and reduces them to a ranked top 20-50 for vaccine design consideration
- The scoring weights are calibrated against published immunogenic neoantigen datasets (TESLA, Gartner et al.)
- Full spec in ONCOVAX_PLATFORM_SPEC.md Section 4.2.3 — the Neoantigen dataclass and scoring function

## What to build

### 1. MHC Binding Prediction Service (Python)

```
services/neoantigen-pipeline/
├── neoantigen-predictor/
│   ├── requirements.txt           # mhcflurry, numpy, pandas, scikit-learn
│   ├── Dockerfile
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py               # Entry point
│   │   ├── binding.py            # MHCflurry binding prediction
│   │   ├── immunogenicity.py     # T-cell recognition prediction
│   │   ├── scoring.py            # Multi-factor neoantigen scoring
│   │   ├── expression.py         # Expression filtering (if RNA-seq available)
│   │   ├── clonality.py          # Clonality estimation from VAF
│   │   └── output.py             # Ranked neoantigen list
│   └── tests/
│       ├── test_binding.py
│       ├── test_scoring.py
│       └── test_data/
│           ├── sample_peptides.json
│           └── expected_rankings.json
```

2. **MHC-I Binding Prediction (MHCflurry 2.0):**

```python
import mhcflurry

# Load models (download on first run, ~2GB)
predictor = mhcflurry.Class1PresentationPredictor.load()

# For each peptide candidate × each patient HLA-I allele:
# Predict binding affinity (IC50 in nM) and presentation score

def predict_mhc_i_binding(
    peptides: List[PeptideCandidate],
    hla_class_i: HlaClassI,
) -> List[BindingPrediction]:
    """
    Predict MHC-I binding for all peptide-HLA combinations.
    
    For a patient with 6 HLA-I alleles and 2,000 peptide candidates,
    this produces 12,000 predictions. MHCflurry handles this in ~1-2 minutes.
    """
    alleles = [
        *hla_class_i.hla_a,
        *hla_class_i.hla_b,
        *hla_class_i.hla_c,
    ]
    
    results = []
    for allele in alleles:
        predictions = predictor.predict(
            peptides=[p.mutant_peptide for p in peptides],
            alleles=[allele] * len(peptides),
            verbose=0,
        )
        # predictions contains: affinity (IC50 nM), percentile_rank, presentation_score
        
        # Also predict binding for wildtype peptides (for agretopicity calculation)
        wt_predictions = predictor.predict(
            peptides=[p.wildtype_peptide for p in peptides],
            alleles=[allele] * len(peptides),
            verbose=0,
        )
        
        for i, peptide in enumerate(peptides):
            mut_affinity = predictions.iloc[i]['mhcflurry_affinity']
            wt_affinity = wt_predictions.iloc[i]['mhcflurry_affinity']
            
            results.append(BindingPrediction(
                peptide=peptide,
                hla_allele=allele,
                binding_affinity_nm=mut_affinity,
                binding_rank_percentile=predictions.iloc[i]['mhcflurry_affinity_percentile'],
                wildtype_binding_nm=wt_affinity,
                presentation_score=predictions.iloc[i]['mhcflurry_presentation_score'],
                agretopicity=wt_affinity / max(mut_affinity, 0.1),  # Higher = more differential
            ))
    
    return results
```

Classification:
- Strong binder: IC50 < 50 nM (or percentile rank < 0.5%)
- Weak binder: IC50 < 500 nM (or percentile rank < 2%)
- Non-binder: IC50 >= 500 nM

3. **MHC-II Binding Prediction:**

For MHC-II (relevant for CD4+ T-cell help, which enhances vaccine response):
- Use MHCflurry's Class II predictor if available, or NetMHCIIpan
- Less critical than Class I for vaccine design but adds value
- Only predict for 15-mer peptides
- Use HLA-DRB1 alleles (most polymorphic and best characterized)

4. **Immunogenicity Scoring:**

Beyond binding affinity, predict whether the immune system will actually recognize the peptide:

```python
def score_immunogenicity(
    binding: BindingPrediction,
    expression_tpm: Optional[float],
    clonality_vaf: float,
) -> float:
    """
    Multi-factor immunogenicity scoring.
    
    Factors:
    1. Binding affinity (strong binders more likely to be presented)
    2. Agretopicity (differential binding — immune system reacts to NOVEL peptides)
    3. Expression level (gene must be expressed for peptide to be presented)
    4. Clonality (peptide should be present in most tumor cells)
    5. Peptide features (hydrophobicity, charge — empirical T-cell recognition predictors)
    """
    # See ONCOVAX_PLATFORM_SPEC.md Section 4.2.3 for the scoring function
    # Implement the score_neoantigen function as specified
    
    # Weight calibration source:
    # TESLA Consortium (Cell, 2020) — validated neoantigen prediction methods
    # Gartner et al. (Nature, 2021) — immunogenic neoantigen features
    
    weights = {
        'binding_affinity': 0.25,
        'agretopicity': 0.20,
        'immunogenicity': 0.20,
        'expression': 0.15,
        'clonality': 0.10,
        'structural_exposure': 0.10,  # Filled later by AlphaFold step
    }
    
    # ... (implement as specified in the platform spec)
```

5. **Expression Filtering (if RNA-seq available):**

```python
def filter_by_expression(
    candidates: List[Neoantigen],
    rna_expression: Dict[str, float],  # Gene → TPM
    min_tpm: float = 1.0,
) -> List[Neoantigen]:
    """
    Filter out neoantigens from genes that aren't expressed.
    If RNA-seq is not available, skip this filter (expression_level = None).
    """
    filtered = []
    for candidate in candidates:
        tpm = rna_expression.get(candidate.gene)
        candidate.expression_level = tpm
        if tpm is None:
            # No RNA data — keep the candidate, score without expression
            filtered.append(candidate)
        elif tpm >= min_tpm:
            filtered.append(candidate)
        # else: gene not expressed → neoantigen can't be presented → remove
    return filtered
```

6. **Clonality Estimation:**

```python
def estimate_clonality(vaf: float, tumor_purity: float = 0.5) -> float:
    """
    Estimate whether a mutation is clonal (present in all tumor cells)
    or subclonal (present in a fraction).
    
    Clonal mutations are preferred vaccine targets because they're in ALL tumor cells.
    
    Simple model: if adjusted VAF ≈ 0.5 (heterozygous in all cells) → clonal
    If adjusted VAF << 0.5 → subclonal
    """
    adjusted_vaf = vaf / tumor_purity  # Normalize for tumor purity
    clonality = min(1.0, adjusted_vaf / 0.5)  # 1.0 = fully clonal
    return clonality
```

7. **Output: Ranked Neoantigen List**

After scoring, sort by composite_score DESC and output the full list:

```python
@dataclass
class NeoantigenReport:
    patient_id: str
    analysis_date: str
    reference_genome: str
    
    total_somatic_variants: int
    coding_variants: int
    tumor_mutational_burden: float
    
    hla_genotype: dict
    
    neoantigens: List[Neoantigen]     # ALL scored candidates, sorted by composite_score
    top_candidates: List[Neoantigen]  # Top 20-50 for vaccine consideration
    
    quality_metrics: dict
    pipeline_version: str
```

Save the top 20 to `PipelineJob.topNeoantigens` and the full list to S3.

8. **Publish completion event:**
   ```
   PIPELINE.step.neoantigens.complete: {
     jobId,
     neoantigenCount,
     topCandidates: [top 20 as JSON],
     reportPath: string  // S3 path to full report
   }
   ```

### 2. Validation Against Published Datasets

Critical: test the scoring against known immunogenic neoantigens:

- Use TESLA Consortium data (Cell, 2020) — provides validated immunogenic and non-immunogenic neoantigens
- The scoring function should rank known immunogenic neoantigens higher than non-immunogenic ones
- Calculate AUC-ROC for the composite score as a classifier of immunogenicity
- Target: AUC > 0.7 (published methods achieve 0.65-0.75)

Create a validation script that:
1. Loads published neoantigen validation data
2. Runs the scoring function on each
3. Calculates AUC-ROC, precision-recall curves
4. Outputs a comparison report
5. If AUC < 0.65, iterate on scoring weights

### 3. Store Neoantigen Candidates in Database

Write each scored neoantigen to the `NeoantigenCandidate` table:
- Enables querying across patients ("show me all patients with KRAS G12D neoantigens")
- Enables genomically-informed trial matching ("patient has neoantigen matching this vaccine trial's target")
- Enables aggregate analysis for INTEL stream

### 4. Verify

- MHCflurry loads and predicts binding for test peptides
- Scoring function produces reasonable rankings for known mutations
- Validation against TESLA dataset achieves AUC > 0.65
- All neoantigen candidates stored correctly in database
- Output format matches what Session 14 (AlphaFold) expects

---END---

---

## SESSION 14: Structure Prediction + mRNA Vaccine Designer

---START---

# OncoVax — Structure Prediction + mRNA Vaccine Designer

This is Session 14. We have a ranked list of neoantigen candidates with binding affinity, immunogenicity scores, and composite rankings. Now we add structural insight via AlphaFold (confirming that top candidates are surface-accessible when bound to MHC) and then design the actual mRNA vaccine sequence.

## Context

- AlphaFold API (Google DeepMind) is free for academic/research use — predicts 3D protein structure from amino acid sequence
- We run structure prediction on the top 20 neoantigen candidates only (not thousands — too expensive)
- The structural data feeds back into ranking: surface-accessible epitopes score higher
- mRNA vaccine design follows published approaches from BioNTech (BNT122) and Moderna (mRNA-4157/V940)
- The output is a DRAFT blueprint — it requires expert review and GMP manufacturing, not direct clinical use
- This is the step that produces what Conyngham created manually for his dog

## What to build

### 1. AlphaFold Structure Prediction Service (Python)

```
services/neoantigen-pipeline/
├── structure-predictor/
│   ├── requirements.txt           # requests, biopython, mdtraj or biotite
│   ├── Dockerfile
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py               # Entry point
│   │   ├── alphafold_client.py   # AlphaFold API client
│   │   ├── mhc_complex.py        # Model peptide-MHC complex
│   │   ├── accessibility.py      # Surface accessibility calculation
│   │   └── output.py
│   └── tests/
│       └── test_structure.py
```

The structure prediction step:

1. **Select top candidates:** Only run structure prediction on the top 20 candidates by composite score (API calls are rate-limited and structures for low-ranking candidates don't affect decisions).

2. **Model peptide-MHC complex:**
   - For each top candidate, model the complex of the mutant peptide bound to the patient's HLA allele
   - Option A: Use AlphaFold Server API (`https://alphafoldserver.com/api/`) to predict the peptide-MHC complex structure
   - Option B: Use existing solved MHC structures from PDB (many HLA allotypes have crystal structures) and model the peptide into the binding groove using template-based modeling
   - Start with Option B (faster, cheaper), fall back to Option A for unusual alleles

3. **AlphaFold API integration:**

```python
import requests

ALPHAFOLD_API_URL = "https://alphafoldserver.com/api/predict"

async def predict_structure(
    peptide_sequence: str,
    hla_allele: str,
) -> StructurePrediction:
    """
    Predict the 3D structure of a peptide-MHC complex.
    
    Returns a PDB file with the predicted structure
    and confidence metrics (pLDDT scores).
    """
    # Submit prediction job
    response = requests.post(ALPHAFOLD_API_URL, json={
        "sequence": peptide_sequence,
        "model_type": "monomer",  # or "multimer" for peptide-MHC complex
    })
    
    # Poll for results (AlphaFold predictions can take minutes)
    job_id = response.json()["job_id"]
    result = await poll_for_result(job_id, timeout_minutes=30)
    
    # Extract PDB and confidence scores
    pdb_content = result["pdb"]
    plddt_scores = result["plddt"]  # Per-residue confidence
    
    return StructurePrediction(
        pdb_content=pdb_content,
        plddt_mean=sum(plddt_scores) / len(plddt_scores),
        plddt_per_residue=plddt_scores,
    )
```

4. **Surface accessibility calculation:**

```python
from biotite.structure import sasa  # Solvent-accessible surface area

def calculate_surface_accessibility(
    pdb_path: str,
    mutation_residue_index: int,
) -> float:
    """
    Calculate the solvent-accessible surface area of the mutated residue
    when the peptide is bound to MHC.
    
    Higher accessibility = immune system can "see" the mutation = better vaccine target.
    Buried mutations are poor targets because T-cell receptors can't access them.
    """
    structure = load_pdb(pdb_path)
    
    # Calculate SASA for each residue
    residue_sasa = sasa(structure)
    
    # Get SASA for the mutated residue
    mutation_sasa = residue_sasa[mutation_residue_index]
    
    # Normalize to 0-1 scale (relative to max possible SASA for that amino acid)
    max_sasa = MAX_SASA_BY_AA[structure.res_name[mutation_residue_index]]
    relative_sasa = mutation_sasa / max_sasa
    
    return relative_sasa  # 0 = fully buried, 1 = fully exposed
```

5. **Update neoantigen rankings:**
   - After structural prediction, update `structural_exposure` field for top 20 candidates
   - Re-calculate composite scores with the structural component now filled in
   - Re-rank the top candidates
   - Candidates with low surface accessibility get penalized in final ranking

6. **Save PDB files to S3 and update database:**
   - PDB files go to `results/{patientId}/{jobId}/structures/{gene}_{mutation}.pdb`
   - Update NeoantigenCandidate records with structural scores
   - Update PipelineJob.topNeoantigens with re-ranked list

7. **Publish completion event:**
   ```
   PIPELINE.step.structure.complete: {
     jobId,
     structuresGenerated: number,
     updatedRankings: top 20 re-ranked,
     pdbPaths: string[]
   }
   ```

### 2. mRNA Vaccine Sequence Designer (Python)

```
services/neoantigen-pipeline/
├── mrna-designer/
│   ├── requirements.txt           # biopython, codon-optimize or custom
│   ├── Dockerfile
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── epitope_selector.py    # Select which neoantigens to include
│   │   ├── construct_designer.py  # Design polyepitope construct
│   │   ├── codon_optimizer.py     # Codon optimization for human expression
│   │   ├── utr_designer.py       # 5' and 3' UTR selection
│   │   ├── sequence_checks.py    # Quality checks on designed sequence
│   │   ├── formulation.py        # LNP formulation guidance notes
│   │   └── output.py             # VaccineBlueprint output
│   └── tests/
│       └── test_designer.py
```

The mRNA design step:

1. **Epitope selection:**
   ```python
   def select_epitopes(
       ranked_neoantigens: List[Neoantigen],
       max_epitopes: int = 20,
       min_composite_score: float = 0.3,
       require_high_confidence: bool = False,
   ) -> List[Neoantigen]:
       """
       Select neoantigens for inclusion in the vaccine.
       
       Selection criteria:
       - Top-ranked by composite score
       - Include mix of strong and weak binders (diversity)
       - Prefer clonal over subclonal mutations
       - Cover multiple HLA alleles if possible (don't put all eggs in one allele)
       - Limit max 20 epitopes (standard for polyepitope constructs)
       """
   ```

2. **Polyepitope construct design:**
   ```python
   def design_polyepitope_construct(
       selected_epitopes: List[Neoantigen],
       linker: str = "EAAAK",           # Flexible alpha-helical linker
       signal_peptide: str = "MFVFLVLLPLVSSQ",  # Human tissue plasminogen activator signal
       include_padre: bool = True,       # PADRE universal helper epitope for CD4+ help
   ) -> str:
       """
       Design a polyepitope protein construct.
       
       Structure:
       [Signal peptide] - [Epitope 1] - [Linker] - [Epitope 2] - [Linker] - ... - [Epitope N]
       
       Linker options:
       - "EAAAK" — rigid alpha-helical (prevents epitope junction artifacts)
       - "GGGGS" — flexible (allows epitopes to fold independently)
       - "AAY" — short, used in some clinical vaccine designs
       - Furin cleavage sites ("RVRR") — enables intracellular processing
       
       The PADRE sequence (AKFVAAWTLKAAA) is a universal MHC-II epitope
       that recruits CD4+ T-cell help regardless of HLA type.
       """
       construct_parts = [signal_peptide]
       
       for i, epitope in enumerate(selected_epitopes):
           # Use 25-mer peptides centered on mutation for MHC-I and MHC-II coverage
           long_peptide = get_extended_context(epitope, context_length=12)
           construct_parts.append(long_peptide)
           if i < len(selected_epitopes) - 1:
               construct_parts.append(linker)
       
       if include_padre:
           construct_parts.append(linker)
           construct_parts.append("AKFVAAWTLKAAA")
       
       protein_sequence = "".join(construct_parts)
       return protein_sequence
   ```

3. **Codon optimization:**
   ```python
   def codon_optimize(
       protein_sequence: str,
       target_organism: str = "human",
       gc_target: float = 0.55,         # Target 50-60% GC content
       avoid_motifs: List[str] = None,   # Restriction sites, poly-U runs, etc.
   ) -> str:
       """
       Optimize the mRNA coding sequence for high expression in human cells.
       
       Approaches:
       1. Codon usage table optimization (use most frequent human codons)
       2. GC content optimization (50-60% for mRNA stability and translation)
       3. Avoid internal Shine-Dalgarno-like sequences
       4. Avoid homo-polymer runs (>4 consecutive identical bases)
       5. Avoid restriction enzyme sites used in cloning
       6. Avoid AU-rich elements (cause mRNA instability)
       
       Based on approaches used in:
       - BioNTech BNT162b2 (COVID-19 vaccine)
       - Moderna mRNA-1273 (COVID-19 vaccine)
       """
   ```

4. **UTR design:**
   ```python
   def design_utrs() -> Tuple[str, str]:
       """
       Design 5' and 3' UTRs for mRNA stability and translation efficiency.
       
       5' UTR:
       - Kozak consensus sequence for translation initiation
       - Based on human beta-globin 5' UTR (high translation efficiency)
       - Or alpha-globin 5' UTR (used in BioNTech vaccines)
       
       3' UTR:
       - Based on human beta-globin 3' UTR (high mRNA stability)
       - Doubled (2x beta-globin 3'UTR) as used in BioNTech mRNA vaccine design
       - Followed by poly(A) tail (100-120 nucleotides)
       """
       five_prime_utr = "..."  # Defined sequence from published vaccine designs
       three_prime_utr = "..."  # Doubled beta-globin 3' UTR
       return five_prime_utr, three_prime_utr
   ```

5. **Assemble full mRNA sequence:**
   ```
   5' Cap — 5' UTR — Kozak — START codon — [Codon-optimized ORF] — STOP codon — 3' UTR — Poly(A) tail
   ```

6. **Quality checks:**
   ```python
   def validate_mrna_design(sequence: str, blueprint: VaccineBlueprint) -> List[str]:
       """
       Run quality checks on the designed mRNA sequence.
       
       Checks:
       - GC content is 50-60%
       - No internal stop codons in the ORF
       - No homo-polymer runs > 6nt
       - No known restriction sites in critical regions
       - ORF translates back to the intended protein sequence
       - Total mRNA length is reasonable (typically 2,000-5,000 nt for polyepitope)
       - Poly(A) tail length is correct
       """
   ```

7. **LNP formulation notes (informational, not prescriptive):**
   ```python
   def generate_formulation_notes(mrna_length: int) -> str:
       """
       Generate formulation guidance notes for the manufacturer.
       NOT a manufacturing recipe — general guidance based on published approaches.
       
       Include:
       - Recommended LNP composition (ionizable lipid : DSPC : cholesterol : PEG-lipid)
       - mRNA:lipid ratio guidance
       - Storage and stability considerations
       - References to published manufacturing protocols
       - Clear disclaimer: requires GMP manufacturing expertise
       """
   ```

8. **Output VaccineBlueprint structure:**
   ```python
   # As specified in ONCOVAX_PLATFORM_SPEC.md Section 4.2.4
   blueprint = VaccineBlueprint(
       mrna_sequence=full_mrna_sequence,
       orf_sequence=orf_only,
       protein_sequence=protein_sequence,
       neoantigens_included=[neo.mutation for neo in selected],
       linker_sequences=linker_info,
       signal_peptide=signal_peptide,
       codon_optimization_method="gc_optimized_human_codon_usage",
       gc_content=calculated_gc,
       five_prime_utr=five_utr,
       three_prime_utr=three_utr,
       poly_a_length=120,
       lnp_formulation_notes=formulation_notes,
       recommended_dose_range="Based on mRNA-4157 Phase 3: 1mg per dose",
       storage_requirements="-20°C for long-term, 2-8°C for up to 30 days",
       design_rationale=design_rationale,  # Claude-generated explanation
       confidence_notes=confidence_notes,
       references=references,
   )
   ```

9. **Save blueprint to S3 and database, publish completion:**
   ```
   PIPELINE.step.mrna_design.complete: {
     jobId,
     blueprintPath: string,
     blueprint: VaccineBlueprint summary,
     epitopeCount: number,
     mRNALength: number
   }
   ```

### 3. Claude-Powered Design Rationale

Use Claude to generate a human-readable explanation of the vaccine design choices:

```python
DESIGN_RATIONALE_PROMPT = """
You are explaining the design choices for a personalized mRNA cancer vaccine blueprint.
This explanation will be reviewed by physicians and potentially by manufacturing scientists.

Vaccine design summary:
- Patient HLA type: {hla_genotype}
- Neoantigens included: {neoantigen_list}
- Construct design: {construct_description}
- Codon optimization: {optimization_method}

For each included neoantigen, explain:
1. Why it was selected (binding affinity, immunogenicity score, clonality)
2. Which HLA allele(s) it's predicted to bind
3. The confidence level and any caveats

For the overall design, explain:
1. Why these specific neoantigens were chosen over others
2. The linker strategy and its purpose
3. Why PADRE was included (if applicable)
4. Key limitations and areas requiring experimental validation

CRITICAL DISCLAIMERS to include:
- This is a computational prediction, not a validated vaccine
- Binding prediction accuracy is ~70-80% — some predictions will be wrong
- In vitro and in vivo validation required before clinical use
- Manufacturing requires GMP facility and regulatory approval
- This design does NOT constitute medical advice
"""
```

### 4. Verify

- AlphaFold API integration works (or fallback template modeling)
- Surface accessibility scores produce reasonable values
- Re-ranking after structural data moves some candidates
- mRNA designer produces valid sequences (correct GC content, no internal stops)
- Codon optimization improves GC content from naive translation
- Quality checks pass on generated sequences
- VaccineBlueprint JSON is complete and well-formed
- Claude-generated design rationale is accurate and appropriately caveated
- Full pipeline runs end-to-end with test data: FASTQ → VaccineBlueprint

---END---

---

## SESSION 15: Report Generation + Patient/Clinician UI

---START---

# OncoVax — Report Generation + Pipeline UI

This is Session 15, the final Phase 3 session. The entire computational pipeline works: FASTQ in, neoantigen report + vaccine blueprint out. Now we build the three audience-specific reports (patient, clinician, manufacturer) and the web interface that makes all of this accessible and understandable.

## Context

- The pipeline produces raw data (VCF, neoantigen rankings, PDB files, mRNA sequence). Reports translate this into actionable information for three audiences.
- The patient has never seen a neoantigen report. They need plain-language understanding of what was found and what it means.
- The oncologist needs clinical-grade detail to make treatment decisions.
- A manufacturer needs a technical specification to produce the vaccine.
- This session also builds the complete pipeline web UI — upload, status tracking, results dashboard, and report download.

## What to build

### 1. Report Generation Service

```
packages/pipeline-reports/
├── src/
│   ├── index.ts
│   ├── patient-report.ts         # Plain-language patient summary
│   ├── clinician-report.ts       # Clinical-grade oncologist report
│   ├── manufacturer-report.ts    # Technical vaccine specification
│   ├── pdf-generator.ts          # Generate PDF reports
│   └── prompts/
│       ├── patient-summary.ts    # Claude prompt for patient report
│       ├── clinical-summary.ts   # Claude prompt for clinician report
│       └── manufacturer-spec.ts  # Claude prompt for manufacturer report
└── package.json
```

### 2. Patient Report (Plain Language)

Claude generates a patient-facing summary:

```typescript
const PATIENT_REPORT_PROMPT = `
You are writing a report for a cancer patient explaining the results of their
personalized neoantigen analysis. The patient may have no science background.
Write at an 8th-grade reading level.

Patient info:
- Name: {patientName}
- Diagnosis: {diagnosis}
- Treatment: {treatmentPlan}

Pipeline results:
- Total mutations found: {variantCount}
- Tumor mutational burden: {tmb} mutations/Mb ({tmbClassification})
- HLA type: {hlaGenotype}
- Neoantigens identified: {neoantigenCount} total, {topCount} high-quality candidates
- Top candidates: {topCandidatesSummary}
- Vaccine blueprint: {blueprintStatus}

REPORT STRUCTURE:

1. WHAT WE DID
   - "We analyzed your tumor's DNA and compared it to your normal DNA to find
     mutations unique to your cancer."
   - Explain the process in simple terms: found mutations → predicted which ones
     your immune system might recognize → ranked them → designed a potential vaccine sequence

2. WHAT WE FOUND
   - How many mutations were found (is this high or low for their cancer type?)
   - How many potential vaccine targets were identified
   - The top candidates — which genes, what confidence level
   - Do NOT list specific peptide sequences (meaningless to patients)

3. WHAT THIS MEANS
   - This is a COMPUTATIONAL PREDICTION — not a finished vaccine
   - The blueprint would need to be manufactured and tested
   - This information can be shared with their oncologist
   - Some of these neoantigens may already be targeted by existing clinical trials

4. NEXT STEPS
   - Share this report with your oncologist
   - Check if any clinical trials target your specific neoantigens (link to MATCH)
   - If interested in pursuing manufacturing: link to Phase 4 (MANUFACTURE) when available
   - Continue your current treatment plan — this does not change your existing care

5. IMPORTANT CAVEATS
   - Binding predictions are ~70-80% accurate
   - Not all predicted neoantigens will generate immune responses in practice
   - This is research-grade output — not FDA-approved diagnostic or therapeutic
   - Manufacturing a personalized vaccine requires regulatory approval (compassionate use, IND, or clinical trial)

TONE: Warm, hopeful but honest. This is exciting science, but set appropriate expectations.
Do NOT use words like "cure", "breakthrough", or "guaranteed". Do NOT promise outcomes.
`;
```

### 3. Clinician Report (Clinical Grade)

Structured clinical report for the oncologist:

```typescript
const CLINICIAN_REPORT_PROMPT = `
Generate a clinical-grade neoantigen analysis report for an oncologist.

REPORT SECTIONS:

1. PATIENT & SAMPLE INFORMATION
   - Patient identifier, diagnosis, staging
   - Sample type, sequencing method, sequencing depth
   - Reference genome, pipeline version

2. SOMATIC MUTATION LANDSCAPE
   - Total somatic variants (SNVs, indels)
   - Coding variants, nonsynonymous variants
   - TMB with classification (low/medium/high) and context vs. cancer type median
   - Key driver mutations identified (clinically actionable, if any)
   - Mutation signature analysis (if sufficient variants)

3. HLA GENOTYPE
   - Class I alleles with confidence
   - Class II alleles with confidence
   - Tool agreement (OptiType vs HLA-HD)

4. NEOANTIGEN CANDIDATES
   Table format — top 20 candidates:
   | Rank | Gene | Mutation | Peptide | HLA Allele | Binding (nM) | Rank% | Immunogenicity | VAF | Expression | Composite | Confidence |
   
   - Highlight any candidates targeting known cancer driver genes
   - Note any candidates with existing clinical trial targeting the same neoantigen

5. VACCINE BLUEPRINT SUMMARY
   - Number of epitopes included
   - HLA coverage (which patient alleles are covered)
   - Construct design approach
   - Key design choices and rationale

6. CLINICAL IMPLICATIONS
   - TMB context (implications for immunotherapy response)
   - Neoantigen load context (implications for vaccine approach viability)
   - Relevant clinical trials targeting identified neoantigens (cross-reference MATCH)
   - Potential for combination with checkpoint inhibitors

7. LIMITATIONS
   - Computational prediction accuracy benchmarks
   - Factors not captured (tumor heterogeneity, immune evasion mechanisms)
   - Requirement for experimental validation

8. REFERENCES
   - Methods citations
   - Scoring calibration data sources
`;
```

### 4. Manufacturer Report (Technical Specification)

Technical spec for a CDMO to produce the vaccine:

```typescript
const MANUFACTURER_REPORT_PROMPT = `
Generate a technical specification document for mRNA vaccine manufacturing.
This is a DRAFT specification — requires GMP review and adaptation.

Include:

1. SEQUENCE SPECIFICATION
   - Full mRNA sequence (5' to 3')
   - ORF sequence
   - Translated protein sequence
   - GC content analysis
   - Secondary structure prediction notes

2. CONSTRUCT DESIGN
   - 5' cap structure specification (Cap1)
   - 5' UTR sequence and source
   - Signal peptide sequence and purpose
   - Epitope sequences with linkers
   - 3' UTR sequence and source
   - Poly(A) tail length
   - Total mRNA length

3. CODON OPTIMIZATION
   - Method used
   - Codon adaptation index (CAI)
   - GC content optimization details
   - Motifs avoided

4. FORMULATION GUIDANCE
   - LNP composition reference (based on published clinical formulations)
   - mRNA:lipid ratio guidance
   - Buffer and excipient suggestions
   - Target particle size range

5. QUALITY SPECIFICATIONS
   - Purity targets (RNA integrity, dsRNA content)
   - Endotoxin limits
   - Sterility requirements
   - Identity testing approach

6. STORAGE AND STABILITY
   - Recommended storage conditions
   - Expected stability window
   - Shipping requirements

7. REFERENCES
   - Published mRNA vaccine manufacturing protocols cited
   - Similar clinical-stage vaccine designs referenced

DISCLAIMER: This specification is computationally generated and requires 
expert review by qualified manufacturing scientists before use.
`;
```

### 5. PDF Generation

Generate professional PDF reports for each audience. Use a PDF generation library (puppeteer for HTML→PDF, or a dedicated PDF library).

Each report should include:
- Header with platform branding + report type
- Patient identifier (name for patient report, MRN for clinical)
- Date of analysis
- Pipeline version
- Page numbers
- Footer with disclaimer
- Professional formatting (not a raw data dump)

### 6. Pipeline Web UI

Build the complete pipeline interface:

```
app/pipeline/
├── page.tsx                     # Pipeline home — overview + actions
├── upload/
│   ├── page.tsx                 # Step 1: Upload sequencing data
│   └── confirm/page.tsx         # Step 2: Confirm upload + submit job
├── jobs/
│   ├── page.tsx                 # List all pipeline jobs with status
│   └── [jobId]/
│       ├── page.tsx             # Job detail — status + progress
│       └── results/
│           ├── page.tsx         # Results dashboard
│           ├── neoantigens/page.tsx   # Neoantigen explorer (sortable, filterable table)
│           ├── blueprint/page.tsx     # Vaccine blueprint viewer
│           └── reports/page.tsx       # Download reports (patient, clinician, manufacturer)
```

**Upload page:**
- Chunked file upload with progress bar (FASTQ files can be 20-50GB)
- File type validation (FASTQ, BAM only)
- File pair matching (tumor R1 + R2, normal R1 + R2)
- Upload directly to S3 via pre-signed URL (don't route through server)
- Clear instructions: what files are needed, where to get them from sequencing provider

**Job status page:**
- Visual pipeline diagram showing 7 steps
- Current step highlighted with progress percentage
- Completed steps with checkmarks and duration
- Estimated time remaining
- Real-time updates via polling or WebSocket
- Error display with plain-language explanation if a step fails

**Results dashboard:**
- Summary cards: variant count, TMB (with classification), neoantigen count, top candidate
- TMB context chart: where does this patient fall relative to cancer type distribution?
- Maturity badge: "Research-grade computational prediction" — prominent disclaimer

**Neoantigen explorer:**
- Sortable, filterable table of all scored candidates
- Columns: rank, gene, mutation, HLA allele, binding affinity, immunogenicity, composite score, confidence
- Click to expand: full details, structural visualization (if PDB available), clinical trial matches
- Export as CSV for researchers

**Vaccine blueprint viewer:**
- Visual representation of the polyepitope construct
- Each epitope labeled with gene, mutation, and score
- mRNA sequence with annotations (UTRs, linkers, signal peptide highlighted)
- Download full blueprint as JSON
- "Share with oncologist" button — generates a shareable link to the clinician report

**Report download page:**
- Three report types clearly labeled
- Download as PDF
- "Share with oncologist" — generates an email with the clinician report attached
- "Share with manufacturer" — generates the technical specification

### 7. Integration with Platform

- When pipeline completes, update patient profile with neoantigen data
- Cross-reference top neoantigens with clinical trial database (MATCH) — find trials targeting the same mutations
- Feed neoantigen data into the INTEL stream for research context
- Update Treatment Translator with neoantigen analysis results
- Notify patient via email and push notification when results are ready
- Add pipeline results to the survivorship module (genomic data for recurrence monitoring)

### 8. Verify End-to-End

Run the complete pipeline with test data and verify:
- Upload flow works for large FASTQ files
- Pipeline processes through all 7 steps without errors
- All three reports generate correctly (patient, clinician, manufacturer)
- PDFs render with proper formatting
- Neoantigen explorer displays and filters correctly
- Blueprint viewer renders the construct visualization
- Trial cross-reference identifies matching trials
- Patient notification fires on completion
- Everything is accessible from the web UI

This completes Phase 3 — the platform can now take raw sequencing data and produce a ranked neoantigen report with structural predictions and a draft mRNA vaccine blueprint, with professional reports for patients, clinicians, and manufacturers.

---END---
