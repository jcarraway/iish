# OncoVax — Phase 4 Claude Code Session Prompts

## Manufacturing Network Connector (MANUFACTURE)

These sessions build the final leg of the pipeline: connecting patients who have a vaccine blueprint (from Phase 3) to contract manufacturing organizations (CDMOs) that can produce it, navigating regulatory pathways for administration, and coordinating with oncologists who can administer the vaccine. This is the bridge between a computational design and a physical product that gets injected into a patient.

**Prerequisites:**
- Phase 1 stable (patient profiles, trial matching, oncologist brief generator)
- Phase 3 stable (neoantigen pipeline producing vaccine blueprints)
- Legal review of regulatory guidance templates initiated (does not need to be complete — templates will carry disclaimers)

**Architecture:**
- TypeScript/Next.js for all Phase 4 features (no Rust or heavy compute — this is directory, workflow, and document generation)
- Prisma schema extensions for manufacturing partners, regulatory pathways, orders, and provider network
- Claude API for regulatory document generation (FDA forms, informed consent, IND applications)
- tRPC routers for all Phase 4 API endpoints
- Same notification patterns as Phases 1-3
- The full spec is in ONCOVAX_PLATFORM_SPEC.md Section 5 — reference it for data models

**Important context:**
- The platform does NOT manufacture vaccines. It connects patients to manufacturers and helps navigate regulatory pathways.
- All regulatory document templates carry prominent disclaimers: "This is an AI-generated draft. It must be reviewed by a licensed physician and legal counsel before submission to any regulatory agency."
- The platform does NOT provide legal or medical advice. It provides information and tools to support decision-making by licensed professionals.
- Manufacturing is the longest-lead-time phase. Most patients who reach Phase 4 will be directed back to clinical trial enrollment (Phase 1) as the faster path. Phase 4 exists for patients who have exhausted trial options or whose specific neoantigen profile isn't covered by any enrolling trial.

---

## SESSION M1: Manufacturing Directory + Regulatory Pathway Advisor

---START---

# OncoVax — Manufacturing Directory + Regulatory Pathway Advisor

This is Session M1, the first Phase 4 session. Phases 1-3 are live. Patients can now go from diagnosis → trial matching → sequencing → neoantigen prediction → vaccine blueprint. This session builds the next step: connecting that blueprint to manufacturers who can produce it, and navigating the regulatory pathways that allow administration.

## Context

Phase 4 serves patients in two scenarios:
1. **No matching trial exists** — the patient's neoantigen profile doesn't match any enrolling personalized vaccine trial. They need a custom manufacturing path.
2. **Patient has exhausted trial options** — they've progressed through available treatments and want to explore a personalized vaccine outside the trial system.

Both scenarios require: (a) finding a manufacturer capable of producing the vaccine, (b) identifying the regulatory pathway that allows it, and (c) generating the required documentation. This session builds the first two.

## What to build

### 1. Prisma Schema — Manufacturing & Regulatory Models

```prisma
model ManufacturingPartner {
  id                    String   @id @default(uuid())
  name                  String
  type                  String   // "cmo", "academic_lab", "modular_hub"
  
  // Capabilities
  mrnaProduction        Boolean  @default(false)
  lnpEncapsulation      Boolean  @default(false)
  fillFinish            Boolean  @default(false)   // Sterile vial filling
  qualityControl        Boolean  @default(false)
  analyticalTesting     Boolean  @default(false)
  
  // Certifications
  certifications        String[]    // ["GMP", "FDA-registered", "ISO 13485"]
  fdaRegistrationNumber String?
  
  // Capacity
  batchSizeMin          Int?
  batchSizeMax          Int?
  turnaroundDaysMin     Int?
  turnaroundDaysMax     Int?
  currentAvailability   String   @default("unknown") // "accepting", "waitlist", "full", "unknown"
  
  // Pricing
  estimatedCostMin      Decimal?    // Per-patient minimum
  estimatedCostMax      Decimal?    // Per-patient maximum
  includesQC            Boolean  @default(false)
  includesAnalytics     Boolean  @default(false)
  pricingNotes          String?
  
  // Geography
  country               String
  state                 String?
  city                  String?
  canShipTo             String[]    // Countries
  
  // Regulatory support
  ibbApproval           Boolean  @default(false) // Institutional biosafety board
  indSupport            Boolean  @default(false) // Help with IND application
  compassionateUseExp   Boolean  @default(false) // Experience with compassionate use
  
  // Contact
  contactName           String?
  contactEmail          String?
  contactPhone          String?
  website               String?
  inquiryUrl            String?     // Direct link to inquiry form
  
  // Specializations
  specializations       String[]    // ["personalized_cancer_vaccine", "rare_disease", "cell_therapy"]
  technologyPlatform    String?     // "IVT_mRNA", "saRNA", "modular_BioNTainer", "Quantoom_Ntensify"
  
  // Content
  description           String?
  notesInternal         String?     // Internal notes (not shown to patients)
  
  // Status
  verified              Boolean  @default(false)  // Has the platform verified this info?
  verifiedAt            DateTime?
  partnershipStatus     String   @default("listed") // "listed", "contacted", "partner", "preferred"
  
  // Relations
  orders                ManufacturingOrder[]
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model RegulatoryPathwayAssessment {
  id                    String   @id @default(uuid())
  patientId             String
  patient               Patient  @relation(fields: [patientId], references: [id])
  pipelineJobId         String?
  pipelineJob           PipelineJob? @relation(fields: [pipelineJobId], references: [id])
  
  // Assessment inputs
  hasExhaustedApproved  Boolean     // Required for Right to Try
  isLifeThreatening     Boolean     // Required for Expanded Access
  existingIndAvailable  Boolean     // Drug has an existing IND (for Expanded Access)
  completedPhaseI       Boolean     // Drug completed Phase I (for Right to Try)
  willingToFileInd      Boolean     // Physician willing to file own IND
  matchingTrialExists   Boolean     // Is there a trial they could enroll in instead?
  
  // Recommended pathway
  recommendedPathway    String      // "clinical_trial", "expanded_access", "right_to_try", "physician_ind"
  pathwayRationale      String      // Claude-generated explanation
  alternativePathways   Json?       // Other options with pros/cons
  
  // Document generation status
  documentsGenerated    Json?       // { formType: status } tracking
  
  // Status
  status                String   @default("assessed") // "assessed", "documents_generating", "documents_ready", "submitted", "approved", "denied"
  
  // Physician involvement
  physicianName         String?
  physicianEmail        String?
  physicianAcknowledged Boolean  @default(false) // Physician has reviewed the assessment
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model RegulatoryDocument {
  id                    String   @id @default(uuid())
  assessmentId          String
  assessment            RegulatoryPathwayAssessment @relation(fields: [assessmentId], references: [id])
  
  documentType          String      // "fda_form_3926", "right_to_try_checklist", "ind_application", "informed_consent", "irb_protocol", "physician_letter"
  title                 String
  
  // Generated content
  content               String      // The generated document text
  templateVersion       String      // Track which template version was used
  generatedByModel      String      // Claude model version
  
  // Patient-specific data used
  patientDataSnapshot   Json        // Snapshot of patient data at time of generation (for audit trail)
  blueprintSnapshot     Json?       // Vaccine blueprint data if applicable
  
  // Review status
  status                String   @default("draft") // "draft", "physician_reviewed", "patient_signed", "submitted"
  reviewedBy            String?
  reviewedAt            DateTime?
  reviewNotes           String?
  
  // File
  pdfPath               String?     // S3 path to generated PDF
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

Run `npx prisma migrate dev --name add_manufacturing_regulatory` after adding these models.

### 2. Manufacturing Partner Directory

Build a searchable, filterable directory of CDMOs with mRNA vaccine manufacturing capability.

**Seed data — research and add these 15 manufacturers:**

Tier 1 — Large CDMOs with established mRNA capability:
1. Thermo Fisher Scientific (Patheon) — Monza, Italy. End-to-end mRNA service. FDA-registered. GMP.
2. Lonza — multiple sites. mRNA + LNP encapsulation. Major Moderna partner.
3. Catalent — multiple sites. Fill-finish + analytical. FDA-registered.
4. Samsung Biologics — South Korea. Large-scale mRNA. GMP.
5. Wuxi Biologics — China + Ireland. mRNA manufacturing. GMP.

Tier 2 — Specialized mRNA CDMOs:
6. Aldevron (Danaher) — Fargo, ND. Plasmid DNA + mRNA. GMP for clinical and commercial.
7. TriLink BioTechnologies (Maravai) — San Diego. mRNA synthesis specialist. CleanCap technology.
8. Arcturus Therapeutics — San Diego. STARR self-amplifying mRNA platform.
9. CureVac — Tübingen, Germany. mRNA technology + manufacturing.
10. Acuitas Therapeutics — Vancouver. LNP formulation specialist (critical for encapsulation step).

Tier 3 — Academic and modular hubs (lower cost, research-grade):
11. UNSW RNA Institute — Sydney. The lab that produced Conyngham's dog vaccine. Research-grade.
12. Afrigen Biologics — Cape Town. WHO mRNA hub. Training + production.
13. BioNTech BioNTainer — containerized modular GMP facility. Deployed in Rwanda, Senegal.
14. Quantoom Biosciences — Belgium. Ntensify microfluidic continuous mRNA production.
15. National Resilience (Resilience) — multiple US sites. US-based resilient manufacturing.

For each partner, create a detail page with:
- Capability matrix (checkboxes: mRNA production, LNP encapsulation, fill-finish, QC, analytics)
- Certification badges (GMP, FDA-registered, ISO)
- Estimated cost range and turnaround
- Geographic location with shipping capabilities
- Regulatory support offered
- Contact/inquiry pathway
- Whether they have experience with personalized/batch-of-one manufacturing (critical — most CDMOs are set up for large batches, not individual patient vaccines)

**API routes:**

```
GET  /api/trpc/manufacturing.list         — All partners with filters
GET  /api/trpc/manufacturing.getById      — Single partner detail
GET  /api/trpc/manufacturing.search       — Search by capability, geography, cost
POST /api/trpc/manufacturing.inquire      — Submit inquiry to partner (with patient consent)
```

**tRPC router:**

```typescript
// packages/api/src/routers/manufacturing.ts

export const manufacturingRouter = router({
  list: publicProcedure
    .input(z.object({
      capabilities: z.array(z.enum([
        'mrnaProduction', 'lnpEncapsulation', 'fillFinish', 'qualityControl', 'analyticalTesting'
      ])).optional(),
      type: z.enum(['cmo', 'academic_lab', 'modular_hub']).optional(),
      country: z.string().optional(),
      maxCost: z.number().optional(),
      certifications: z.array(z.string()).optional(),
      personalizedCapable: z.boolean().optional(), // Can do batch-of-one
    }).optional())
    .query(async ({ ctx, input }) => {
      // Filter manufacturing partners by criteria
      // Sort: preferred partners first, then verified, then unverified
      // Include capability match score (how many required capabilities does this partner have?)
    }),

  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // Full partner detail with all fields
    }),

  recommend: protectedProcedure
    .input(z.object({
      pipelineJobId: z.string(),  // Which vaccine blueprint this is for
    }))
    .query(async ({ ctx, input }) => {
      // Given a vaccine blueprint, recommend the best-fit manufacturers
      // Consider: required capabilities, geography, cost, turnaround, personalized capability
      // Return ranked list with match rationale
    }),

  inquire: protectedProcedure
    .input(z.object({
      partnerId: z.string(),
      pipelineJobId: z.string(),
      message: z.string().optional(),
      includeBlueprint: z.boolean(), // Patient consents to share blueprint with manufacturer
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate and send inquiry to manufacturer
      // Include: anonymized vaccine blueprint (if consented), required capabilities, timeline
      // Log inquiry for tracking
      // Notification to patient: "Your inquiry has been sent to [manufacturer]"
    }),
});
```

### 3. Regulatory Pathway Advisor

Build a decision-tree-based advisor that determines which regulatory pathway fits the patient's situation, then generates the required documentation.

**Decision tree logic:**

```typescript
// packages/regulatory-nav/src/pathway-advisor.ts

interface PathwayAssessmentInput {
  // Patient situation
  hasExhaustedApprovedTreatments: boolean;
  conditionIsLifeThreatening: boolean;
  
  // Trial availability (from Phase 1 matching)
  matchingTrialExists: boolean;
  trialEnrollmentPossible: boolean; // Patient meets eligibility AND trial is recruiting at accessible site
  
  // Drug/product status
  productHasExistingIND: boolean;       // Is there an IND on file for this type of product?
  productCompletedPhaseI: boolean;      // Has this type of product completed Phase I anywhere?
  
  // Physician
  hasWillingPhysician: boolean;         // Oncologist willing to file/supervise
  physicianWillFileIND: boolean;        // Oncologist willing to be IND sponsor
}

function assessPathway(input: PathwayAssessmentInput): PathwayRecommendation {
  // Priority 1: Clinical trial enrollment (always preferred if available)
  if (input.matchingTrialExists && input.trialEnrollmentPossible) {
    return {
      recommended: 'clinical_trial',
      rationale: 'A matching clinical trial is currently enrolling and you appear eligible. Trial enrollment is the fastest path — the investigational product is provided at no cost, you receive close monitoring, and you contribute to the evidence base that helps future patients.',
      alternatives: ['expanded_access', 'physician_ind'],
    };
  }
  
  // Priority 2: FDA Expanded Access (Compassionate Use)
  if (input.conditionIsLifeThreatening && input.productHasExistingIND) {
    return {
      recommended: 'expanded_access',
      rationale: 'Your condition qualifies as serious/life-threatening and there is an existing IND for this type of product. FDA Expanded Access (also called compassionate use) allows your physician to request individual patient access. The FDA approizes over 99% of expanded access requests — it can be authorized within 24 hours for emergencies.',
      alternatives: ['right_to_try', 'physician_ind'],
      documents: ['fda_form_3926', 'irb_protocol', 'informed_consent', 'physician_letter'],
    };
  }
  
  // Priority 3: Right to Try
  if (input.hasExhaustedApprovedTreatments && input.productCompletedPhaseI) {
    return {
      recommended: 'right_to_try',
      rationale: 'You have exhausted approved treatment options and this type of product has completed Phase I clinical testing. The Right to Try Act (2018) allows access without FDA authorization. However, the manufacturer must agree to provide the product, and your physician must be willing to supervise administration.',
      alternatives: ['expanded_access', 'physician_ind'],
      documents: ['right_to_try_checklist', 'informed_consent', 'physician_letter', 'manufacturer_request'],
    };
  }
  
  // Priority 4: Physician-Sponsored IND
  if (input.hasWillingPhysician && input.physicianWillFileIND) {
    return {
      recommended: 'physician_ind',
      rationale: 'Your physician is willing to file an Investigational New Drug (IND) application with the FDA. This gives the most control over the process but requires more paperwork. Your physician becomes the IND sponsor and takes responsibility for the investigation.',
      alternatives: ['expanded_access'],
      documents: ['ind_application', 'irb_protocol', 'informed_consent', 'investigators_brochure', 'manufacturing_info'],
    };
  }
  
  // Fallback: No clear pathway
  return {
    recommended: 'consultation_needed',
    rationale: 'Based on the information provided, a clear regulatory pathway is not immediately available. This may mean: (a) a clinical trial exists but you don\'t yet meet eligibility — revisit after treatment changes, (b) no IND or Phase I data exists for this product type — a physician-sponsored IND may be needed, or (c) additional medical context would change the assessment. We recommend discussing with your oncologist and a regulatory affairs consultant.',
    alternatives: [],
    documents: ['physician_discussion_guide'],
  };
}
```

**Regulatory pathway assessment UI flow:**

```
Step 1: "Let's find the right pathway for your situation"
  → Questions about treatment history, condition severity, physician involvement
  → Pre-filled from patient profile where possible

Step 2: "Here's what we recommend"
  → Recommended pathway with clear explanation
  → Alternative pathways with pros/cons
  → Estimated timeline and cost
  → Required documents listed

Step 3: "Let's prepare the documentation"
  → Generate required documents (Claude-powered)
  → Each document is a draft requiring physician review
  → Track document status (draft → reviewed → signed → submitted)

Step 4: "Next steps"
  → Specific action items for patient and physician
  → Contact information for relevant agencies
  → Timeline expectations
```

**Document generation with Claude:**

For each document type, create a prompt template that takes patient data + vaccine blueprint and generates a professional draft. Key documents:

```typescript
const DOCUMENT_TEMPLATES = {
  fda_form_3926: {
    name: 'FDA Form 3926 — Individual Patient Expanded Access IND',
    description: 'The primary form for requesting individual patient expanded access from the FDA',
    requiredData: ['patientDiagnosis', 'treatmentHistory', 'productDescription', 'manufacturerInfo', 'physicianInfo'],
    claudePrompt: `
You are generating a draft FDA Form 3926 (Individual Patient Expanded Access Investigational New Drug Application) for physician review.

This is a DRAFT that MUST be reviewed by a licensed physician and regulatory affairs professional before submission.

Patient information:
{patientData}

Product information (from vaccine blueprint):
{blueprintData}

Manufacturer information:
{manufacturerData}

Treating physician:
{physicianData}

Generate the form content section by section. For each section:
1. Fill in what can be determined from the provided data
2. Mark fields that require physician input with [PHYSICIAN TO COMPLETE]
3. Mark fields that require manufacturer input with [MANUFACTURER TO COMPLETE]
4. Include the required safety justification based on the product type and patient's condition

Format as a structured document that maps to FDA Form 3926 fields.
Include the disclaimer at the top: "AI-GENERATED DRAFT — Must be reviewed by treating physician and regulatory counsel before submission to FDA."
    `,
  },

  right_to_try_checklist: {
    name: 'Right to Try Act Compliance Checklist',
    description: 'Checklist ensuring all Right to Try Act (2018) requirements are met',
    requiredData: ['patientDiagnosis', 'treatmentHistory', 'productInfo'],
    claudePrompt: `
Generate a Right to Try Act compliance checklist for this patient's situation.

The Right to Try Act (21 USC §360bbb-0a) requires:
1. The patient has been diagnosed with a life-threatening disease or condition
2. The patient has exhausted approved treatment options
3. The patient is unable to participate in a clinical trial (not enrolling, not eligible, not accessible)
4. The eligible investigational drug has completed Phase I clinical trial
5. The drug is being actively developed or produced (active IND)
6. The manufacturer has agreed to provide the drug
7. The patient has provided written informed consent
8. The treating physician has recommended the treatment

Patient data:
{patientData}

For each requirement:
- Assess whether it appears to be met based on available data
- If met: explain what evidence supports this
- If not met or unclear: explain what additional information or action is needed
- Mark each as: [MET], [NOT MET], [NEEDS VERIFICATION]

Include prominent disclaimer: "This checklist is an AI-generated assessment tool. Compliance with the Right to Try Act must be verified by legal counsel."
    `,
  },

  informed_consent: {
    name: 'Informed Consent Document',
    description: 'Patient informed consent for receiving a personalized investigational vaccine',
    requiredData: ['patientName', 'productDescription', 'knownRisks', 'manufacturerInfo', 'physicianInfo'],
    claudePrompt: `
Generate a draft informed consent document for a patient receiving a personalized mRNA cancer vaccine outside of a clinical trial.

This document must clearly communicate:
1. What the product is (personalized mRNA vaccine designed from the patient's own tumor data)
2. That this is investigational — not FDA-approved
3. The regulatory pathway being used (expanded access / right to try / physician IND)
4. Known risks of mRNA vaccines generally (injection site reactions, fever, fatigue, rare allergic reactions)
5. Unknown risks (this is a personalized product — long-term effects are not established)
6. That the patient may not receive any benefit
7. That the patient can withdraw consent at any time
8. Alternative treatment options
9. Who to contact with questions or adverse events
10. That this consent is voluntary

Patient data:
{patientData}

Product data:
{productData}

Physician data:
{physicianData}

Write in clear, 8th-grade reading level language. Avoid jargon. Use short paragraphs.
Include signature lines for: Patient, Witness, Treating Physician.
Include prominent disclaimer: "AI-GENERATED DRAFT — Must be reviewed and customized by treating physician and institutional legal counsel."
    `,
  },

  physician_letter: {
    name: 'Physician Support Letter',
    description: 'Letter from treating physician supporting the regulatory request',
    requiredData: ['patientDiagnosis', 'treatmentHistory', 'productRationale', 'physicianCredentials'],
    claudePrompt: `
Generate a draft physician letter supporting a request for personalized cancer vaccine access via {pathway}.

The letter should:
1. Establish the physician's credentials and relationship to the patient
2. Describe the patient's diagnosis and treatment history
3. Explain why approved treatments are insufficient or exhausted
4. Describe the proposed investigational product (personalized mRNA cancer vaccine)
5. Provide clinical rationale for why this product may benefit this patient
6. Reference relevant published evidence for personalized cancer vaccines (cite Moderna/Merck mRNA-4157 trial data, BioNTech autogene cevumeran data)
7. Acknowledge the investigational nature and state willingness to monitor the patient
8. Request approval for the specific regulatory pathway

Patient data:
{patientData}

Product data:
{productData}

Pathway: {pathway}

Write in formal medical/professional tone. This is a physician-to-regulatory-agency communication.
Include prominent disclaimer: "AI-GENERATED DRAFT — Must be reviewed, edited, and signed by the treating physician."
    `,
  },
};
```

### 4. Routes and Pages

```
/manufacture                           — Phase 4 landing: "From blueprint to vaccine"
/manufacture/partners                  — Manufacturing partner directory (searchable, filterable)
/manufacture/partners/[partnerId]      — Partner detail page
/manufacture/regulatory                — Regulatory pathway advisor (decision tree entry point)
/manufacture/regulatory/assessment     — Assessment questionnaire
/manufacture/regulatory/recommendation — Recommended pathway + alternatives
/manufacture/regulatory/documents      — Document generation + tracking
/manufacture/regulatory/documents/[id] — Individual document view/edit/download
```

### 5. API Routers

Create these tRPC routers:

```typescript
// packages/api/src/routers/regulatory.ts

export const regulatoryRouter = router({
  assess: protectedProcedure
    .input(z.object({
      pipelineJobId: z.string().optional(),
      hasExhaustedApproved: z.boolean(),
      isLifeThreatening: z.boolean(),
      existingIndAvailable: z.boolean(),
      completedPhaseI: z.boolean(),
      willingToFileInd: z.boolean(),
      matchingTrialExists: z.boolean(),
      physicianName: z.string().optional(),
      physicianEmail: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Run pathway assessment logic
      // Store result in RegulatoryPathwayAssessment table
      // Return recommendation with rationale
    }),

  getAssessment: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // Get assessment by ID with all related documents
    }),

  generateDocument: protectedProcedure
    .input(z.object({
      assessmentId: z.string(),
      documentType: z.enum([
        'fda_form_3926',
        'right_to_try_checklist',
        'informed_consent',
        'physician_letter',
        'ind_application',
        'irb_protocol',
        'manufacturer_request',
        'physician_discussion_guide',
      ]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Gather patient data, blueprint data, physician data
      // Select appropriate Claude prompt template
      // Call Claude API to generate document
      // Store in RegulatoryDocument table
      // Generate PDF version (store in S3)
      // Return document with download link
    }),

  updateDocumentStatus: protectedProcedure
    .input(z.object({
      documentId: z.string(),
      status: z.enum(['draft', 'physician_reviewed', 'patient_signed', 'submitted']),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update document status
      // Notify relevant parties
    }),

  listDocuments: protectedProcedure
    .input(z.object({
      assessmentId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // List all documents for an assessment with status
    }),
});
```

### 6. Key UX Decisions

- **Always recommend clinical trials first.** If Phase 1 has active matches, the regulatory advisor should say: "Before exploring manufacturing, you have {N} matching trials. Clinical trials provide the investigational product at no cost, with close monitoring." Only proceed to manufacturing pathways if the patient confirms they've considered trial enrollment.

- **Physician gate.** No regulatory document can be marked as "ready for submission" without a physician reviewing it. The platform generates drafts; physicians finalize them.

- **Cost transparency.** Manufacturing a personalized mRNA vaccine currently costs $50,000-$300,000+. The platform must be upfront about this. Don't bury the cost — present it clearly at the pathway recommendation stage so patients can make informed decisions. Financial assistance options should be presented alongside costs.

- **Prominent disclaimers.** Every generated document must carry: "AI-GENERATED DRAFT — Must be reviewed by a licensed physician and legal counsel before submission." This is both ethical and protective.

### 7. Testing

- Test pathway advisor decision tree against 10 patient scenarios covering all 4 pathways + the "consultation needed" fallback
- Test document generation for each template type against patient data from Phase 3 test pipeline runs
- Verify that all generated documents include the required disclaimers
- Test manufacturer search with filters (capability, geography, cost, certification)
- Test inquiry workflow end-to-end (patient selects manufacturer → inquiry generated → notification sent)

---END---

### M1 Implementation Notes — COMPLETED ✓

**Implemented:** 2026-03-16

**Key adaptations from spec:**
- Used Next.js API Route Handlers (not tRPC routers) — consistent with all prior sessions
- Simplified ManufacturingPartner schema: `capabilities` as String[] array and `certifications` as String[] instead of individual boolean fields per capability. Added `slug` (unique), `capacityTier`, `costMin`/`costMax` (Int, not Decimal), `turnaroundWeeksMin`/`turnaroundWeeksMax`, `regulatorySupport` as String[]
- RegulatoryPathwayAssessment: added `cancerType`, `cancerStage`, `state` (for Right to Try state law check), `hasPhysician` boolean, `costEstimate`/`timelineEstimate` fields
- RegulatoryDocument: added `modelUsed`, `patientDataSnapshot` (Json), `templateVersion` fields
- Pathway advisor uses all 50 US states in RIGHT_TO_TRY_STATES set for state-level validation
- Document templates: 8 types (fda_form_3926, right_to_try_checklist, informed_consent, physician_letter, ind_application, irb_protocol, manufacturer_request, physician_discussion_guide)
- All generated documents include AI_DISCLAIMER constant prepended to content

**Files created (~25 new, 6 modified):**
- `packages/db/prisma/migrations/20260316000000_add_manufacturing_regulatory/migration.sql`
- `scripts/seed-manufacturing-partners.ts` — 15 CDMOs (Thermo Fisher, Lonza, Catalent, Samsung Biologics, WuXi, Aldevron, TriLink, Arcturus, CureVac, Acuitas, UNSW RNA Institute, Afrigen, BioNTech BioNTainer, Quantoom, National Resilience)
- `apps/web/lib/pathway-advisor.ts` — Decision tree: clinical_trial → expanded_access → right_to_try → physician_ind → consultation_needed
- `apps/web/lib/regulatory-documents.ts` — 8 template configs + Claude-powered generation with AI disclaimer
- 4 API routes under `apps/web/app/api/manufacturing/` (list, detail, recommend, inquire)
- 6 API routes under `apps/web/app/api/regulatory/` (assess, assessment detail, document generate, document list, document detail + status update)
- 3 components: ManufacturingPartnerCard, PathwayRecommendation, RegulatoryDocumentCard
- 8 pages under `apps/web/app/manufacture/` (landing, partners list/detail, regulatory landing, assessment, recommendation, documents list/detail)
- Modified: schema.prisma (3 models + reverse relations), shared types + exports, dashboard (manufacturing card), layout (nav link)

**Infrastructure change:** Switched local dev from Homebrew PostgreSQL to Docker Compose (`docker-compose.yml` at project root with postgres:15-alpine + redis:7-alpine). DATABASE_URL updated to include password (`rett:rett`).

→ SESSION M1 COMPLETE (manufacturing directory + regulatory pathway advisor + full UI — 20 Prisma models total)

---

## SESSION M2: Order Workflow + Provider Network + Administration

---START---

# OncoVax — Order Workflow + Provider Network + Administration Coordination

This is Session M2, the second and final Phase 4 session. Session M1 built the manufacturing directory and regulatory pathway advisor. This session builds the operational workflow: ordering a vaccine from a manufacturer, tracking production, finding an oncologist to administer it, and post-administration monitoring.

## Context

At this point in the platform journey:
1. Patient has a vaccine blueprint (from Phase 3 pipeline)
2. Patient has identified a manufacturer (from M1 directory)
3. Patient has a regulatory pathway and documentation (from M1 advisor)

Now they need to: place an order, track production, find a physician to administer, and set up monitoring. This session also builds the provider network — a directory of oncologists and infusion centers willing to administer investigational vaccines.

## What to build

### 1. Prisma Schema — Orders + Provider Network

```prisma
model ManufacturingOrder {
  id                    String   @id @default(uuid())
  patientId             String
  patient               Patient  @relation(fields: [patientId], references: [id])
  partnerId             String
  partner               ManufacturingPartner @relation(fields: [partnerId], references: [id])
  pipelineJobId         String
  pipelineJob           PipelineJob @relation(fields: [pipelineJobId], references: [id])
  assessmentId          String?
  assessment            RegulatoryPathwayAssessment? @relation(fields: [assessmentId], references: [id])
  
  // Blueprint transfer
  blueprintSentAt       DateTime?
  blueprintFormat       String?     // "json", "pdf", "both"
  blueprintVersion      String?     // Pipeline version that produced it
  
  // Order status
  status                String   @default("inquiry_sent")
  // Lifecycle: inquiry_sent → quote_received → quote_accepted → production_started →
  //            qc_in_progress → qc_passed → shipped → delivered → ready_for_administration
  
  // Quote
  quotedPrice           Decimal?
  quotedCurrency        String?  @default("USD")
  quotedTurnaroundDays  Int?
  quoteReceivedAt       DateTime?
  quoteExpiresAt        DateTime?
  quoteAcceptedAt       DateTime?
  quoteDocument         String?     // S3 path to quote PDF
  
  // Production tracking
  productionStartedAt   DateTime?
  estimatedCompletionAt DateTime?
  batchNumber           String?
  
  // Quality control
  qcStartedAt           DateTime?
  qcCompletedAt         DateTime?
  qcPassed              Boolean?
  qcReportPath          String?     // S3 path to QC report
  qcNotes               String?
  
  // Shipping
  shippedAt             DateTime?
  trackingNumber        String?
  shippingCarrier       String?
  shippingConditions    String?     // "dry ice", "2-8°C", etc.
  deliveredAt           DateTime?
  
  // Administration
  administrationSiteId  String?
  administrationSite    AdministrationSite? @relation(fields: [administrationSiteId], references: [id])
  administeredAt        DateTime?
  administeredBy        String?     // Physician name
  
  // Cost tracking
  totalCost             Decimal?
  paymentStatus         String?     // "pending", "partial", "paid", "financial_assistance"
  financialAssistance   Json?       // Programs used, amounts covered
  
  // Notes
  notes                 Json?       // Array of timestamped notes
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model AdministrationSite {
  id                    String   @id @default(uuid())
  
  // Facility info
  facilityName          String
  facilityType          String      // "academic_medical_center", "community_oncology", "infusion_center", "hospital"
  
  // Contact
  primaryContact        String?     // Physician or coordinator name
  contactEmail          String?
  contactPhone          String?
  website               String?
  
  // Address
  address               String?
  city                  String
  state                 String
  zipCode               String
  country               String   @default("US")
  latitude              Float?
  longitude             Float?
  
  // Capabilities
  canAdministerMrna     Boolean  @default(false)  // Has experience with mRNA therapeutics
  hasInfusionCenter     Boolean  @default(true)
  hasEmergencyResponse  Boolean  @default(false)  // Can handle anaphylaxis
  hasMonitoringCapacity Boolean  @default(false)  // Can do post-admin monitoring (30-60 min observation)
  investigationalExp    Boolean  @default(false)  // Experience with investigational products
  irbAffiliation        String?     // Affiliated IRB for protocol review
  
  // Status
  verified              Boolean  @default(false)
  willingToAdminister   Boolean  @default(false)  // Has confirmed willingness to administer investigational vaccines
  verifiedAt            DateTime?
  
  // Relations
  orders                ManufacturingOrder[]
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model PostAdministrationReport {
  id                    String   @id @default(uuid())
  orderId               String
  order                 ManufacturingOrder @relation(fields: [orderId], references: [id])
  
  // Timing
  reportType            String      // "immediate" (0-2hr), "24hr", "48hr", "7day", "14day", "28day", "3month", "6month"
  reportedAt            DateTime @default(now())
  daysPostAdministration Int
  
  // Adverse events
  hasAdverseEvents      Boolean  @default(false)
  adverseEvents         Json?       // Structured AE reporting
  // Common: injection site pain/redness, fever, fatigue, headache, myalgia
  // Serious: anaphylaxis, severe allergic reaction, autoimmune flare
  
  // Vital signs
  temperature           Float?
  bloodPressure         String?
  heartRate             Int?
  
  // Immune response markers (if available)
  labResults            Json?       // T-cell response assays, ctDNA levels, etc.
  
  // Tumor response (later timepoints)
  imagingResults        String?
  tumorResponse         String?     // "complete_response", "partial_response", "stable", "progression", "not_assessed"
  
  // Patient-reported
  patientNarrative      String?
  qualityOfLifeScore    Int?        // 1-10 self-reported
  
  // Physician assessment
  physicianNotes        String?
  physicianReportedAE   Boolean  @default(false)
  
  // Status
  status                String   @default("submitted") // "submitted", "reviewed", "flagged"
  reviewedBy            String?
  
  createdAt             DateTime @default(now())
}
```

Run `npx prisma migrate dev --name add_orders_providers_monitoring` after adding.

### 2. Order Workflow

Build the complete order lifecycle from inquiry to administration.

**tRPC router:**

```typescript
// packages/api/src/routers/orders.ts

export const ordersRouter = router({
  create: protectedProcedure
    .input(z.object({
      partnerId: z.string(),
      pipelineJobId: z.string(),
      assessmentId: z.string().optional(),
      includeBlueprint: z.boolean(),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create order record
      // If includeBlueprint: package the vaccine blueprint for transfer
      //   - Sanitize: remove patient PII, keep only molecular data
      //   - Include: mRNA sequence, neoantigen list, formulation notes, QC specs
      //   - Format: structured JSON + human-readable PDF
      // Send inquiry notification to manufacturer (email or via their inquiry system)
      // Send confirmation to patient
      // Set status to "inquiry_sent"
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      status: z.string(),
      notes: z.string().optional(),
      // Status-specific fields
      quotedPrice: z.number().optional(),
      quotedTurnaroundDays: z.number().optional(),
      batchNumber: z.string().optional(),
      trackingNumber: z.string().optional(),
      qcPassed: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update order status
      // Add timestamped note to order notes array
      // Trigger appropriate notifications based on status transition:
      //   inquiry_sent → quote_received: "You've received a quote from [manufacturer]"
      //   quote_accepted → production_started: "Your vaccine is now in production"
      //   qc_passed → shipped: "Your vaccine has shipped"
      //   delivered → ready_for_administration: "Your vaccine is ready — schedule with your physician"
    }),

  getByPatient: protectedProcedure
    .query(async ({ ctx }) => {
      // Get all orders for the authenticated patient
      // Include partner details, status timeline, documents
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // Full order detail with complete timeline and all related records
    }),

  acceptQuote: protectedProcedure
    .input(z.object({
      orderId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Patient accepts the manufacturer's quote
      // Update status to "quote_accepted"
      // Notify manufacturer that the patient has accepted
      // Trigger next step: production scheduling
    }),

  addNote: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      note: z.string(),
      noteType: z.enum(['patient', 'physician', 'system']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Add a timestamped note to the order
    }),
});
```

**Order tracking UI:**

Build a visual timeline component showing the order lifecycle. Each step shows:
- Status (complete, in progress, upcoming)
- Date completed (or estimated date)
- Duration at each step
- Any notes or documents associated

```
[✓ Inquiry sent] → [✓ Quote received] → [✓ Quote accepted] → [● In production] → [ QC ] → [ Ship ] → [ Deliver ] → [ Administer ]
    Mar 15           Mar 18              Mar 19              Started Mar 22        Est. Apr 15
                     $85,000                                 Batch #MFG-2026-0412
                     45-60 days
```

### 3. Provider Network (Administration Sites)

Build a directory of oncologists and infusion centers willing to administer investigational vaccines.

**Seed strategy:**

Unlike the manufacturing directory (which can be researched from public data), the provider network requires outreach. For MVP:

1. Start with NCI-designated cancer centers (71 in the US) — these all have IRBs and experience with investigational products
2. Add major academic medical centers with oncology programs
3. Allow physicians to self-register through the provider portal
4. Track which physicians from Phase 1 trial matching are at centers that could also administer

**tRPC router:**

```typescript
// packages/api/src/routers/providers.ts

export const providersRouter = router({
  searchAdministrationSites: protectedProcedure
    .input(z.object({
      zipCode: z.string().optional(),
      radiusMiles: z.number().optional().default(100),
      requiresMrnaExperience: z.boolean().optional(),
      requiresIRB: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Search administration sites by geography
      // Sort by: distance, then verified status, then capability match
      // Return with distance from patient
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // Full site detail
    }),

  // Provider self-registration (from provider portal)
  register: publicProcedure
    .input(z.object({
      facilityName: z.string(),
      facilityType: z.string(),
      contactName: z.string(),
      contactEmail: z.string(),
      address: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      capabilities: z.object({
        canAdministerMrna: z.boolean(),
        hasInfusionCenter: z.boolean(),
        hasEmergencyResponse: z.boolean(),
        investigationalExp: z.boolean(),
      }),
      irbAffiliation: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create unverified administration site
      // Geocode the address
      // Notify admin for verification
    }),

  connectToOrder: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      siteId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Connect an administration site to a manufacturing order
      // The vaccine will be shipped to this site for administration
      // Notify the site that a delivery is expected
    }),
});
```

### 4. Post-Administration Monitoring

Build a structured reporting system for tracking outcomes after vaccine administration.

**Monitoring schedule:**

```typescript
const MONITORING_SCHEDULE = [
  { type: 'immediate', label: 'Immediate (0-2 hours post-injection)', daysAfter: 0, required: true },
  { type: '24hr', label: '24-hour check-in', daysAfter: 1, required: true },
  { type: '48hr', label: '48-hour check-in', daysAfter: 2, required: true },
  { type: '7day', label: '1-week follow-up', daysAfter: 7, required: true },
  { type: '14day', label: '2-week follow-up', daysAfter: 14, required: true },
  { type: '28day', label: '4-week follow-up', daysAfter: 28, required: true },
  { type: '3month', label: '3-month assessment', daysAfter: 90, required: true },
  { type: '6month', label: '6-month assessment', daysAfter: 180, required: false },
  { type: '12month', label: '1-year assessment', daysAfter: 365, required: false },
];

// Schedule notifications for each monitoring check-in
// Patient receives: "Time for your {label} check-in. How are you feeling?"
// If adverse event reported: escalate notification to treating physician
// If no response within 24 hours of scheduled check-in: reminder notification
```

**tRPC router:**

```typescript
// packages/api/src/routers/monitoring.ts

export const monitoringRouter = router({
  submitReport: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      reportType: z.string(),
      
      // Adverse events
      hasAdverseEvents: z.boolean(),
      adverseEvents: z.array(z.object({
        event: z.string(),
        severity: z.enum(['mild', 'moderate', 'severe', 'life_threatening']),
        onset: z.string(),         // "2 hours after injection"
        duration: z.string().optional(),
        resolved: z.boolean(),
        treatment: z.string().optional(), // "Took acetaminophen"
      })).optional(),
      
      // Vital signs
      temperature: z.number().optional(),
      
      // Patient-reported
      overallFeeling: z.enum(['great', 'good', 'okay', 'poor', 'terrible']),
      narrative: z.string().optional(),
      qualityOfLifeScore: z.number().min(1).max(10).optional(),
      
      // Tumor response (later timepoints only)
      tumorResponse: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Store post-administration report
      // If severe adverse event: immediate notification to physician + admin
      // If any adverse event: notification to physician within 24 hours
      // Calculate days post-administration automatically
      // Schedule next monitoring check-in notification
    }),

  getSchedule: protectedProcedure
    .input(z.object({
      orderId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // Return monitoring schedule with:
      // - Which reports have been submitted
      // - Which are upcoming
      // - Which are overdue
    }),

  getReportHistory: protectedProcedure
    .input(z.object({
      orderId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // All reports for an order, chronological
      // Include adverse event summary
      // Include trend data (how symptoms are evolving)
    }),
});
```

### 5. Routes and Pages

```
/manufacture/orders                     — All orders for this patient
/manufacture/orders/new                 — Create new order (select manufacturer from M1 directory)
/manufacture/orders/[orderId]           — Order detail with status timeline
/manufacture/orders/[orderId]/tracking  — Production tracking detail
/manufacture/providers                  — Administration site directory
/manufacture/providers/[siteId]         — Site detail
/manufacture/monitoring                 — Monitoring dashboard (upcoming check-ins, submitted reports)
/manufacture/monitoring/[orderId]/report — Submit a monitoring report
/manufacture/monitoring/[orderId]/history — View all reports for this order

# Provider portal routes (separate app)
/provider/register                      — Self-registration for administration sites
/provider/orders                        — Incoming orders assigned to this site
/provider/monitoring/[orderId]          — View patient monitoring reports (physician access)
```

### 6. Notification Events

Add these to the unified notification system:

```typescript
type Phase4NotificationEvent =
  | { type: 'quote_received'; orderId: string; manufacturer: string; price: number }
  | { type: 'production_started'; orderId: string; estimatedCompletion: string }
  | { type: 'qc_complete'; orderId: string; passed: boolean }
  | { type: 'vaccine_shipped'; orderId: string; tracking: string }
  | { type: 'vaccine_delivered'; orderId: string }
  | { type: 'monitoring_due'; orderId: string; reportType: string }
  | { type: 'monitoring_overdue'; orderId: string; reportType: string; daysPastDue: number }
  | { type: 'adverse_event_reported'; orderId: string; severity: string } // → physician
  | { type: 'regulatory_document_ready'; assessmentId: string; documentType: string }
  | { type: 'regulatory_status_update'; assessmentId: string; newStatus: string }
```

### 7. Integration Points

- **Phase 1 (MATCH):** The regulatory advisor checks Phase 1 match results before recommending manufacturing pathways. If a matching trial exists, it recommends trial enrollment first.

- **Phase 3 (PREDICT):** Manufacturing orders reference a pipeline job. The vaccine blueprint from Phase 3 is the input to the manufacturing order. Blueprint data is packaged (PII stripped) for manufacturer transfer.

- **SURVIVE module:** Post-administration monitoring data feeds into the survivorship module. Long-term monitoring (3-month, 6-month, 12-month) connects to the recurrence monitoring system and ctDNA tracking in SURVIVE.

- **INTEL module:** Aggregate anonymized outcome data from post-administration reports feeds into INTEL's community intelligence layer. Outcomes by neoantigen type, regimen, manufacturer, and patient demographics contribute to the research base.

### 8. Testing

- Test the complete order workflow: create → quote → accept → production → QC → ship → deliver → administer
- Test all status transitions and verify notifications fire correctly
- Test provider search with geographic filtering (use 5 test sites at known coordinates)
- Test monitoring report submission for each report type in the schedule
- Test adverse event escalation (severe AE → immediate physician notification)
- Test blueprint packaging (verify PII is stripped, molecular data is intact)
- Test integration with Phase 1 (regulatory advisor should surface matching trials)
- Test integration with Phase 3 (order should correctly reference pipeline job and blueprint)

### 9. Admin Dashboard Additions

Add to the existing admin dashboard:

- **Manufacturing overview:** Active orders by status, average turnaround, manufacturer performance
- **Provider network:** Map of administration sites, verification queue, coverage gaps
- **Monitoring compliance:** Which patients are current on monitoring, which are overdue
- **Regulatory tracking:** Assessment status across all patients, document generation stats
- **Adverse events:** Summary of all reported AEs, severity distribution, flagged cases

---END---
