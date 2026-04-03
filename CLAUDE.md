# IISH — Project Knowledge Base

## What This Is

Women's cancer care + endocrine health risk intelligence platform. Monorepo covering the full patient journey: pre-diagnosis risk assessment (breast cancer, PCOS, endometriosis, thyroid) → environmental exposure tracking → diagnosis → trial matching → treatment translation → genomic sequencing → neoantigen prediction → vaccine design → manufacturing coordination → survivorship care → recurrence detection. The environmental exposure infrastructure (water quality, product scanning, biomarker panels, location history) is condition-agnostic — the same EDCs (PFAS, BPA, phthalates) drive risk across all tracked conditions.

## Architecture (As-Built)

```
iish/
├── apps/
│   ├── web/                    # Next.js 15.0.0, React 19.0.0, Tailwind CSS 3.4
│   │   ├── app/                # App Router — pages + 85 API route files + 3 cron endpoints
│   │   │   ├── prevent/        # Prevention + endocrine health
│   │   │   │   ├── breast/     # Breast cancer risk track (planned restructure)
│   │   │   │   ├── pcos/       # PCOS risk + symptoms (planned: P0-EX1/EX2)
│   │   │   │   ├── endo/       # Endometriosis pain diary (planned: P0-EX3)
│   │   │   │   ├── thyroid/    # Thyroid health + labs (planned: P0-EX4)
│   │   │   │   ├── exposures/  # Environmental intelligence (planned: P0-11 to P0-15)
│   │   │   │   │   ├── water/
│   │   │   │   │   ├── products/
│   │   │   │   │   ├── home/
│   │   │   │   │   └── testing/
│   │   │   │   ├── location/   # Location history + heatmap (planned: P0-17, P0-20/21)
│   │   │   │   │   └── map/
│   │   │   │   ├── correlations/ # Cross-condition analysis (planned: P0-EX5)
│   │   │   │   ├── education/  # (existing)
│   │   │   │   ├── onboarding/ # 5-step → 7-step expansion (planned: P0-EX6)
│   │   │   │   ├── risk/       # (existing breast cancer screens)
│   │   │   │   ├── family/     # (existing)
│   │   │   │   ├── recurrence/ # (existing)
│   │   │   │   └── trials/     # Multi-condition preventive trials
│   │   ├── components/         # 4 web-only components (DocumentUploader, AdministrationSiteCard, AdministrationSiteMap, visualizations/)
│   │   │   └── visualizations/ # Canvas 2D viz framework + 31 interactive scenes (VZ1-VZ4)
│   │   └── lib/                # 63 library files (see below)
│   └── mobile/                 # Expo SDK 54, React Native 0.76.9, Dripsy + Solito
│       ├── app/                # Expo Router — 142 route files across 32 directories
│       └── lib/                # apollo.ts (GraphQL client), auth.ts (SecureStore guard)
├── docker-compose.yml          # Local dev: postgres:15-alpine + redis:7-alpine
├── packages/
│   ├── ui/                     # Thin RN + Solito re-exports (@iish/ui)
│   ├── app/                    # 122 shared screens, 24 Dripsy components, theme, 200+ generated hooks (@iish/app)
│   │   └── src/{screens[122],components[24],providers,theme,graphql,generated,utils,index}.ts
│   ├── api/                    # Apollo Server schema (180+ types, 113Q, 102M) + 30 resolver files (@iish/api)
│   │   └── src/{schema,resolvers[30 files],context,index}.ts
│   ├── db/                     # Prisma 7 + PostgreSQL (64 models, expanding to ~73)
│   │   ├── prisma/schema.prisma
│   │   └── prisma.config.ts    # defineConfig — url goes HERE, not in schema
│   ├── shared/                 # Types (720+ lines), Zod schemas, constants, auth
│   │   └── src/{types,schemas,constants,auth,index}.ts
│   ├── pipeline-orchestrator/  # TypeScript NATS JetStream DAG executor
│   └── pipeline-storage/       # S3 helpers for pipeline data
├── services/
│   └── neoantigen-pipeline/    # Rust workspace (3 crates + common)
├── infrastructure/
│   └── terraform/              # AWS VPC, S3, NATS, ECR, Batch
└── scripts/                    # 18 seed/sync/utility scripts
```

### Planned New Models (Phase 0 Expansion)

```
PcosProfile           — Rotterdam criteria, metabolic markers, diagnosis status
PcosSymptomLog        — Daily: cycle, acne, hair, bloating, fatigue, mood, weight
EndoProfile           — Pain patterns, diagnosis, treatment history
EndoPainLog           — Daily: multi-site pain, medication, activity impact
ThyroidProfile        — Risk factors, current labs, medication
ThyroidLabResult      — Longitudinal: TSH, T4, T3, antibodies
BiomarkerResult       — Cross-condition: PFAS, BPA, phthalates, parabens, metals
ProductScan           — Barcode lookup + EDC flagging history
ZipCodeAggregate      — Population: multi-condition prevalence + env profile per zip
```

### Planned New Lib Files (Phase 0 Expansion)

```
prs-calculator.ts            — PRS from SNP dosages (P0-8)
composite-risk-engine.ts     — Multi-factor risk model wrapping Gail (P0-9)
water-quality.ts             — EPA/EWG API integration (P0-11)
product-scanner.ts           — Barcode → ingredient → EDC flagging (P0-12)
home-environment.ts          — Home EDC assessment (P0-13)
biomarker-interpreter.ts     — NHANES comparison + condition mapping (P0-14)
environmental-score.ts       — Composite exposure scoring (P0-15)
location-enrichment.ts       — EPA data per zip code (P0-17)
population-aggregation.ts    — k-anonymity aggregation pipeline (P0-20/21)
cross-condition-engine.ts    — Shared risk factor analysis (P0-EX5)
pcos-manager.ts              — Rotterdam screening, metabolic risk, symptoms (P0-EX1/EX2)
endo-manager.ts              — Symptom screening, pain diary, provider report (P0-EX3)
thyroid-manager.ts           — Risk screen, lab interpretation, EDC connection (P0-EX4)
```

## Critical Implementation Patterns

### API: Next.js Route Handlers (NOT tRPC)
All spec documents reference tRPC routers. The actual implementation uses plain Next.js API Route Handlers. When building from specs:

```typescript
// Standard pattern: apps/web/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(); // throws 'UNAUTHORIZED' if no session
    const body = await req.json();
    const data = someSchema.parse(body);
    const result = await prisma.model.create({ data });
    return NextResponse.json({ result });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (err instanceof z.ZodError)
      return NextResponse.json({ error: 'Invalid data', details: err.issues }, { status: 400 });
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
```

| Spec reference | Translate to |
|---|---|
| `tRPC router.list.query()` | `export async function GET()` |
| `tRPC router.create.mutation()` | `export async function POST()` |
| `protectedProcedure` | `await requireSession()` |
| `publicProcedure` | No session check |
| `packages/api/src/routers/X.ts` | `apps/web/app/api/X/route.ts` |

### UI: Dripsy + Solito (Cross-Platform, Screen Migration Complete)
- **Shared components:** 22 Dripsy components in `packages/app/src/components/` — cross-platform ready
- **Shared screens:** 130 screens in `packages/app/src/screens/` — 46 migratable (D3-D6) + 4 survivorship (S1) + 2 surveillance (S2) + 3 journal/effects (S3) + 1 lifestyle (S4) + 2 care team (S5) + 2 ctDNA (S6) + 1 notifications (S7) + 8 recurrence (S8) + 5 fertility + 5 advocate + 5 logistics + 5 second opinion + 8 learn (L1-L4) + 4 intel (I1) + 2 community (I5) + 1 intel landscape (I6) + 3 preventive (PTM) + 5 palliative + 11 prevent + 8 peers (PM1-PM2)
- **Web pages:** Most pages are thin re-exports: `'use client'; export { XxxScreen as default } from '@iish/app';`. Exception: `/learn/[category]/[slug]/page.tsx` is a server component with `generateMetadata` + `generateStaticParams` + JSON-LD that renders a client component wrapper.
- **Mobile routes:** All 130 screens wired via Expo Router — 142 route files across 32 directories
- **Mobile tabs:** 5-tab layout (Home, Matches, Sequencing, Pipeline, More) with Ionicons
- **Mobile auth:** `useProtectedRoute()` hook — SecureStore token check + redirect to `/auth` modal
- **Web-only components (4):** `DocumentUploader` (File API), `AdministrationSiteCard`, `AdministrationSiteMap` (Mapbox), `visualizations/` (Canvas 2D framework + 31 interactive scenes) — kept in `apps/web/components/`
- Shared components use Dripsy `sx` prop with theme tokens, Solito `Link` for navigation
- Custom `Picker` component replaces `<select>` cross-platform (web: native select, native: Modal list)
- All shared code uses GraphQL hooks exclusively (zero `fetch('/api/...')` calls after D8)

### Prisma 7 (Critical Differences from Prisma 5/6)
- No `url` in `datasource` block — use `prisma.config.ts` with `defineConfig`
- Generator: `prisma-client` (not `prisma-client-js`), `output` field required
- Client needs driver adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`
- All models use `@map("snake_case")` columns and `@@map("table_names")`
- 64 models total (60 prior + PeerMentorProfile, PeerConnection, PeerMessage, MentorTrainingProgress from PEERS). Expanding to ~73 with Phase 0 condition expansion.

### Auth: Custom Magic Link (NOT NextAuth)
- `jose` HS256 for JWT tokens with 15min expiry
- Redis for session storage (7-day TTL, sliding window refresh)
- `Resend` for email delivery
- Routes: `/api/auth/magic-link` → `/api/auth/verify` → cookie set → `/api/auth/logout`
- Web: httpOnly cookie (`session_id`) + Redis
- Mobile: expo-secure-store with Bearer token (different auth flow, not fully wired)

### AI: Anthropic Claude
- Model: `claude-opus-4-20250514` (hardcoded in `apps/web/lib/ai.ts`)
- Package: `@anthropic-ai/sdk@0.39.0`
- Used for: document extraction, eligibility parsing, trial matching, treatment translation, genomic interpretation, report generation, regulatory document drafting, SCP generation, surveillance result extraction, lifestyle recommendation generation, symptom routing, appointment prep, ctDNA interpretation, fertility discussion guides, appeal letter generation, peer review prep, logistics plan generation, record packet assembly, communication guide generation, article generation, personalized article context, reading plan generation, article quality checking, article refresh suggestions, research classification (maturity/evidence/impact), research summarization (patient + clinician), palliative goals-of-care guides, palliative referral letters, chemoprevention discussion guides, prevention lifestyle recommendations

## What's Built (Phases 1-4)

**Phase 1 — MATCH:** Auth, patient profiles (3 intake paths), document ingestion (Claude Vision), trial matching (ClinicalTrials.gov sync + eligibility parsing + multi-dimension scoring), Treatment Translator (two-step Claude pipeline), Oncologist Brief, Financial Assistance Finder, MyChart/FHIR (SMART on FHIR OAuth), Stripe billing.

**Phase 2 — SEQUENCE:** Sequencing provider directory, test/sequencing recommendation engine, insurance coverage checking (CPT codes), LOMN generation, sequencing journey wizard (5 steps), genomic results extraction + interpretation.

**Phase 3 — PREDICT:** 8-step neoantigen pipeline with DAG orchestration via NATS JetStream. Rust services (alignment, variant-caller, hla-typer) + TypeScript (remaining 5 steps). AWS Batch dispatch with 2 compute tiers. PDF report generation (@react-pdf/renderer) + interactive UI.

**Phase 4 — MANUFACTURE (complete):**
- *M1:* Manufacturing partner directory (15 CDMOs seeded across 3 tiers), regulatory pathway advisor (decision tree + 8 Claude-powered document templates), 3 Prisma models (ManufacturingPartner, RegulatoryPathwayAssessment, RegulatoryDocument), 10 API routes (4 manufacturing + 6 regulatory), 3 components, 8 pages under `/manufacture/`.
- *M2:* Order workflow (9-stage lifecycle: inquiry → quote → production → QC → shipping → administration), provider network (12 administration sites seeded, proximity search with Haversine distance), post-administration monitoring (8-timepoint schedule, AE escalation checking), provider portal. 3 Prisma models (ManufacturingOrder, AdministrationSite, PostAdministrationReport), 11 API routes, 7 components, 12 pages, 3 lib files. Dashboard + nav integration.

**Cross-Platform Migration (D0-D8, complete):**
- *D0:* `packages/ui/` (RN + Solito re-exports), `packages/app/` (Dripsy theme, providers, Apollo cache config), `packages/api/` (Apollo Server schema + resolvers wrapping lib/). Web + mobile configured with Apollo Client, DripsyProvider, react-native-web.
- *D1:* 22 of 24 components migrated from Tailwind to Dripsy in `packages/app/src/components/`. Custom cross-platform Picker. `ADVERSE_EVENT_OPTIONS` moved to shared constants. Web-only: DocumentUploader, AdministrationSiteMap.
- *D2:* Complete GraphQL layer — schema expanded to 45+ types, 27 queries, 25 mutations. 7 new resolver files (18 total). 25 adapter functions in route handler. 13 `.graphql` operation documents (70 operations). Codegen produces 5082-line generated file with 70 typed React hooks.
- *D3:* 8 screens migrated to shared Dripsy + Apollo (Home, Auth, Learn, Start, Matches, Financial, SequencingHub, Providers). SequencingProvider schema gap fixed (type field + detail field resolvers). 8 web pages re-pointed as thin `'use client'` re-exports.
- *D4+D5:* 26 more screens (detail, manufacturing, monitoring, dashboard, intake, sequencing journey, translate). Schema expanded with intake/extract/order mutations. 26 web pages re-pointed.
- *D6:* Final 12 screens (pipeline 7 + sequencing detail 4 + records 1). Schema expanded to 29 queries, 29 mutations. 4 new resolver operations, 2 complex FHIR adapters. 12 web pages re-pointed. **All 46 migratable screens now shared.**
- *D7:* Mobile app routing — 52 route files wired to all 46 shared screens via Expo Router. Auth guard (`useProtectedRoute`), 5-tab layout (Home/Matches/Sequencing/Pipeline/More), MoreScreen navigation grid, 3 upload placeholders. **Mobile app functionally complete.**
- *D8:* Dead code cleanup + REST→GraphQL migration. Deleted 21 dead Tailwind components + `utils.ts`. Added `requestMagicLink` mutation + `generateReport` query + `isCancerCenter` field. Migrated 5 shared files from `fetch('/api/...')` to GraphQL hooks. **All shared code now uses GraphQL exclusively — mobile-compatible.**

**Phase 5 — SURVIVE (S1-S8, complete):**
- *S1:* Survivorship foundation + care plan generation. 3 Prisma models (SurvivorshipPlan, SurveillanceEvent, JournalEntry), 2-step Claude pipeline SCP generator (clinical grounding → patient-facing translation), GraphQL layer (3 queries, 2 mutations, 1 input, 1 resolver file), 4 shared Dripsy screens (SurviveDashboard, TreatmentComplete, SCPReading, SurviveStub), 9 web pages under `/survive/`, 9 mobile routes, MoreScreen + Dashboard integration. **Treatment completion → SCP generation → reading experience → survivorship dashboard.**
- *S2:* Surveillance schedule engine. 1 new lib file (surveillance-manager.ts: 4 event lifecycle functions with auto-generate next occurrence + frequency parsing + Claude result extraction), 4 GraphQL mutations (markEventComplete, skipEvent, rescheduleEvent, uploadEventResult) with 4 inputs, 2 shared Dripsy screens (SurveillanceCalendar with filter pills + inline action forms, SurveillanceEventDetail), web + mobile routing for `/survive/monitoring` + `/survive/monitoring/[eventId]`. **Full event lifecycle: complete → auto-generate next, skip, reschedule, result upload with Claude extraction.**
- *S3:* Symptom journal + late effects tracker. 1 new lib file (journal-manager.ts: submitJournalEntry with daily upsert, deleteJournalEntry, getJournalTrends with averages/deltas/streak), GraphQL updates (4 new JournalEntry fields, JournalTrends type, SubmitJournalEntryInput, 2 mutations, 1 query), 3 shared Dripsy screens (JournalEntry with tappable number buttons + optional expansion, JournalHistory with trend cards + streak + colored chips, LateEffects rendering from SCP planContent), web + mobile routing for `/survive/journal`, `/survive/journal/entry`, `/survive/effects`. **60-second journal entry → trends dashboard → late effects from SCP.**
- *S4:* Evidence-based lifestyle engine. 1 new lib file (lifestyle-generator.ts: single Claude call producing structured exercise/nutrition/alcohol/environment recommendations, Redis caching 7-day TTL, stored on SurvivorshipPlan.planContent.lifestyle_extended), 15 new GraphQL types (LifestyleRecommendations, ExerciseRecommendation, ExerciseWeek, NutritionMyth, AlcoholRecommendation, EnvironmentalStep, etc.), 1 query (lifestyleRecommendations) + 1 mutation (generateLifestyleRecommendations), 1 shared Dripsy screen (LifestyleScreen with 4 collapsible sections: exercise with starter plan + precautions + symptom exercises, nutrition with medication guidance + myth-busting, alcohol with subtype risk quantification + honest framing, environment with actionable steps + overblown concerns), web + mobile routing updated from stubs. **Personalized evidence-based lifestyle guidance — subtype-specific, treatment-aware, evidence-cited.**
- *S5:* Psychosocial support + care coordination. 1 Prisma model (CareTeamMember), 1 new lib file (care-team-manager.ts: 4 CRUD functions + Claude-powered symptom routing with emergency safety override + appointment prep aggregating journal/surveillance/SCP data), 5 new GraphQL types (CareTeamMember, SymptomRouting, AppointmentPrep, SymptomTrendItem, PrepQuestion) + 2 inputs + 3 queries + 4 mutations, 7 resolver operations, 2 shared Dripsy screens (MentalHealthScreen with FCR normalization + evidence-based strategies + 15 support resources + crisis resources + scanxiety tips, CareTeamScreen with provider CRUD + symptom routing + SCP care plan display + appointment prep generation), web + mobile routing updated from stubs. **Mental health resource hub + care team directory + intelligent symptom routing + appointment prep.**
- *S6:* ctDNA monitoring + recurrence detection loop. 1 Prisma model (CtdnaResult), 1 new lib file (ctdna-manager.ts: addCtdnaResult with Claude interpretation + trial re-match trigger on detected + auto-complete surveillance event, getCtdnaHistory, getCtdnaInterpretation, private generateInterpretation with Redis 30-day cache), 2 new GraphQL types (CtdnaResult, CtdnaInterpretation) + 1 input (AddCtdnaResultInput) + 1 query (ctdnaHistory) + 1 mutation (addCtdnaResult), 2 resolver operations, 2 shared Dripsy screens (CtdnaGuideScreen with provider comparison + evidence + result meanings, CtdnaDashboardScreen with result form + timeline + detected alert banner + next scheduled test), SurviveDashboard updated with ctDNA card + quick link, web + mobile routing for `/survive/monitoring/ctdna` + `/survive/monitoring/ctdna/guide`. **ctDNA result tracking + Claude interpretation + trial re-match trigger + educational guide. Platform NEVER announces recurrence.**
- *S7:* Notifications + polish + phase transitions. 3 Prisma models (NotificationLog, NotificationPreference, SurvivorshipFeedback) + archivedPlans field on SurvivorshipPlan. 1 new lib file (notification-manager.ts: 8 notification processors — surveillance reminders/overdue, journal reminders phase-adjusted, weekly summary, appointment prep, SCP annual review, lifestyle monthly, phase transitions — plus feedback CRUD, SCP annual refresh with diff, computePhase). scp-generator.ts updated with temporal context. Cron endpoint (apps/web/app/api/cron/survivorship/route.ts). 5 new GraphQL types + 2 inputs + 3 queries + 3 mutations, 6 resolvers, 6 route handler adapters. 1 shared component (FeedbackPrompt: 5-star rating + comment), 1 shared screen (NotificationSettingsScreen: 8 category toggles + quiet hours + timezone + history). Existing screens updated: SurviveDashboard (Notifications quick link), SCPReadingScreen (FeedbackPrompt), JournalHistoryScreen (conditional FeedbackPrompt ≥90 entries). **Proactive notification system + annual SCP refresh + phase transitions + user feedback collection.**
- *S8:* Recurrence pathway — full cascade. 1 Prisma model (RecurrenceEvent with 18 fields including cascadeStatus JSON, patient relation, composite index). 1 new lib file (recurrence-manager.ts: 10 exported functions — reportRecurrence, createPreliminaryRecurrenceEvent, acknowledgeRecurrence, updateCascadeStep, regenerateTranslator, archiveSurvivorshipPlan, getRecurrenceEvent, getRecurrenceEvents, generateGenomicComparison, getSecondOpinionResources — plus 2 internal orchestrators: runRecurrenceCascade 11-step, runPartialCascade for ctDNA-triggered). ctdna-manager.ts modified to trigger preliminary recurrence event on detected result. 4 new GraphQL types (RecurrenceEvent, CascadeStatus, GenomicComparison, SecondOpinionResource) + 2 inputs + 4 queries + 5 mutations, 9 resolvers (recurrence.ts), 9 context signatures, 9 route handler adapters. 9 GraphQL operations in survivorship.graphql, codegen regenerated. 8 shared Dripsy screens (RecurrenceReport multi-step self-report, RecurrenceAcknowledge emotional landing, RecurrenceSupport crisis resources, RecurrenceSequencing re-sequencing education, RecurrenceComparison genomic comparison, RecurrenceTrials updated matches, RecurrenceTreatment translator regeneration, RecurrenceCascade 11-step timeline hub). SurviveDashboard updated with recurrence card + "Report a change" quick link. notification-manager.ts updated with recurrence notification processor (4 timed emails: 2h support, 4h trials, 24h sequencing, 48h financial). 8 web pages + 8 mobile routes under `/survive/recurrence/`. **Platform NEVER announces recurrence — only responds to what patient/doctor reports. Emotional support first, then clinical cascade.**

**Access Gap — FERTILITY (complete):**
- 2 Prisma models (FertilityAssessment, FertilityProvider), 1 lib file (fertility-manager.ts: 8 functions — assessFertilityRisk with deterministic agent classification + window calculation, getPreservationOptions filtered by sex/ER+/time, getFertilityProviders with Haversine sort + capability filters, getFertilityFinancialPrograms with eligibility matching, generateDiscussionGuide via Claude + Redis cache, requestFertilityReferral, updateFertilityOutcome), 1 seed script (30 oncofertility providers — 6 academic + 12 Livestrong + 12 independent). GraphQL: 5 types + 2 inputs + 4 queries + 4 mutations, 1 resolver file (fertility.ts), 8 context signatures, 8 route handler adapters. 8 operations in fertility.graphql. 5 shared screens (FertilityDashboard with risk alert + window countdown + quick actions + outcome tracking, FertilityAssessment with risk factors + ER+ considerations, FertilityOptions with comparison cards + GnRH note, FertilityProviders with filter pills + referral request, FertilityGuide with Claude discussion guide). 5 web pages + 5 mobile routes under `/fertility/`. Dashboard + MoreScreen integration. **Auto-assesses gonadotoxicity risk from treatment plan, countdown to preservation window, ER+ protocol awareness, oncofertility provider finder.**

**Access Gap — ADVOCATE (complete):**
- 2 Prisma models (InsuranceDenial, AppealLetter), 1 lib file (insurance-advocate.ts: 10 functions — createDenial, getDenials, getDenial, updateDenialStatus, generateAppealLetter via Claude with NCCN citations + [PHYSICIAN SIGNATURE REQUIRED], getAppealLetter, updateAppealOutcome with cascading status, getAppealStrategy with 3 strategy constants, getAppealRights with ACA + 11 state protections, generatePeerReviewPrep via Claude). GraphQL: 5 types + 3 inputs + 5 queries + 5 mutations, 1 resolver file (advocate.ts), 10 context signatures, 10 route handler adapters. 10 operations in advocate.graphql. 5 shared screens (AdvocateDashboard with active denials + deadline alerts + quick links, NewDenial structured form with auto-deadline, AppealDetail with letter display + status timeline + peer review prep, AppealRights with ACA + state protections + ERISA explanation, EscalationGuide with 3 strategy paths + success rates). 5 web pages + 5 mobile routes under `/advocate/`. Dashboard + MoreScreen integration. **AI-powered appeal letters citing NCCN guidelines, deadline tracking, escalation paths with success rates, state-specific protections.**

**Access Gap — LOGISTICS (complete):**
- 2 Prisma models (TrialLogisticsAssessment, LogisticsAssistanceApplication), 1 lib file (logistics-manager.ts: 7 functions — assessTrialLogistics with Haversine distance + cost estimation + feasibility scoring, getLogisticsAssessment/s, getAssistancePrograms with 14 programs across 6 categories, generateLogisticsPlan via Claude + Redis cache, updateAssistanceApplication, getAssistanceApplications). GraphQL: 3 types + 1 input + 4 queries + 3 mutations, 1 resolver file (logistics.ts), 7 context signatures, 7 route handler adapters. 7 operations in logistics.graphql. 5 shared screens (LogisticsDashboard with feasibility badges + OOP estimates, LogisticsAssessment with distance/cost/barriers + plan generation, LogisticsAssistancePrograms grouped by category with eligibility matching, LogisticsApplications with status tracking, LogisticsPlan with Claude-generated sections). 5 web pages + 5 mobile routes under `/logistics/`. MoreScreen integration. **Distance/cost assessment, 14 assistance programs, Claude logistics plans, application tracking.**

**Access Gap — SECOND (complete):**
- 2 Prisma models (SecondOpinionCenter, SecondOpinionRequest), 1 lib file (second-opinion-manager.ts: 8 functions — evaluateSecondOpinionTriggers with 8 deterministic rules, createSecondOpinionRequest, getSecondOpinionRequest, getSecondOpinionCenters with Haversine + filters, generateRecordPacket + generateCommunicationGuide via Claude + Redis cache, selectCenter, recordSecondOpinionOutcome), 1 seed script (30 NCI centers — 14 comprehensive + 16 designated). GraphQL: 5 types + 2 inputs + 3 queries + 5 mutations, 1 resolver file (second-opinion.ts), 8 context signatures, 8 route handler adapters. 8 operations in second-opinion.graphql. 5 shared screens (SecondOpinionDashboard with trigger cards + status timeline, SecondOpinionCenters with NCI badges + virtual filters, SecondOpinionPacket with Claude clinical summary + questions, SecondOpinionCommunication with 4 template sections, SecondOpinionOutcome with empowering messaging). 5 web pages + 5 mobile routes under `/second-opinion/`. MoreScreen integration. recurrence-manager.ts updated to query DB. **8 deterministic trigger rules, 30 NCI center directory, Claude record packets + communication guides, collaborative tone.**

**LEARN — L1: Foundation + Launch Corpus (complete):**
- 3 Prisma models (Article with ~30 fields including SEO/taxonomy/cross-linking, GlossaryTerm, ArticlePersonalization), 1 lib file (learn-manager.ts: 14 functions — getArticle with view count increment, getArticles with taxonomy filters, getArticlesByCategory, searchArticles with PostgreSQL ILIKE, getRelatedArticles, getGlossaryTerms/Term, generateArticle via Claude structured JSON, generateArticleBatch, publishArticle, generatePersonalizedContext via Claude + Redis 7-day cache, generateReadingPlan via Claude + Redis 7-day cache, getArticleForSeo, getAllPublishedSlugs), 1 seed script (25 articles across 8 categories + 50 glossary terms via Claude). GraphQL: 9 types (Article, ArticleSection, ArticleActionItem, KeyStatistic, GlossaryTerm, ArticlePersonalizedContext, ReadingPlanItem, ReadingPlan, ArticleCategoryResult) + 2 inputs + 7 queries (5 public + 2 authenticated) + 4 mutations, 1 resolver file (learn.ts), 14 context signatures, 14 route handler adapters. 11 operations in learn.graphql. 6 shared screens (LearnHubScreen with search + featured carousel + category grid + personalized reading plan, LearnCategoryScreen with audience filter, LearnArticleScreen with patient summary + content sections + collapsible clinical detail + action items + statistics + references + personalized context + glossary tooltips, LearnSearchScreen with debounced search + category filter, LearnGlossaryScreen with alphabetical sections + category filter, LearnGlossaryTermScreen). 7 web pages + sitemap route + 6 mobile routes under `/learn/`. **First public (unauthenticated) queries. First SSR/SSG page with generateMetadata + generateStaticParams + JSON-LD structured data. First XML sitemap route. SEO-optimized article reader with personalization for logged-in users.**

**INTEL — I1 through I6 (complete):**
- Full research intelligence pipeline: 6 ingestion sources (PubMed, FDA, bioRxiv/medRxiv, ClinicalTrials.gov, Institutional News, NIH Reporter), Claude classification pipeline (maturity tier + evidence level + practice impact), personalized relevance-ranked feed, community intelligence + email digests, landscape views with cross-module integration (Translator, Financial, Survivorship). See detailed I1-I6 session notes for full implementation details.

**VISUAL — VZ1-VZ4 (complete):**
- 31 interactive Canvas 2D visualizations across 4 batches. ~14,300 total lines. No external dependencies — vanilla Canvas 2D API only.

**Access Gap — PALLIATIVE (complete):**
- 3 Prisma models (PalliativeAssessment, PalliativeCareProvider, AdvanceCarePlan), 1 lib file (palliative-manager.ts: 10 functions — ESAS symptom assessment with deterministic triage scoring, palliative referral recommendation triggers based on symptom burden/treatment phase/diagnosis, provider search with Haversine distance + specialty filters, advance care plan CRUD, Claude goals-of-care discussion guide + referral letter generation, assessment trending), 1 seed script (30 palliative care providers — hospice + outpatient + hospital-based + telehealth). GraphQL: 5 types (PalliativeAssessment, PalliativeCareProvider, AdvanceCarePlan, PalliativeRecommendation, GoalsOfCareGuide) + 2 inputs + 5 queries + 5 mutations, 1 resolver file (palliative.ts). 10 operations in palliative.graphql. 5 shared screens (PalliativeDashboard with recommendation alert + latest assessment summary + quick links, PalliativeAssessment with 9-symptom ESAS form + triage display + trending, PalliativeEducation with evidence-based content citing Temel et al. NEJM 2010, PalliativeProviders with Haversine-sorted directory + specialty filters, AdvanceCare with goals/preferences/proxy CRUD). 5 web pages under `/palliative/` + 6 mobile routes. Dashboard + MoreScreen integration. **Deterministic ESAS triage (emergency/urgent/moderate/mild). Early palliative care framing — not end-of-life. Evidence-based education. Warm, supportive tone.**

**PREVENT Phase 0 Foundation (P0-1 through P0-6, complete):**
- 6 Prisma models (PreventProfile with reproductive/hormonal/lifestyle/family history fields, RiskAssessment with Gail model inputs/outputs + trajectory + modifiable factors, GenomicProfile with pathogenic/VUS variants + PRS placeholders, LocationHistory with environmental exposure fields, ScreeningSchedule with NCCN guideline-based plan, DataConsent with tiered consent levels). 4 lib files (prevent-manager.ts: profile CRUD + onboarding orchestration + family history management + genomic profile ingestion, prevent-risk-engine.ts: full Gail model implementation with SEER age-specific baselines + competing mortality + attributable risk coefficients + 5-year/10-year/lifetime projections + modifiable factor analysis + risk trajectory curves, prevent-screening.ts: NCCN screening guideline engine with risk-stratified modality selection + interval calculation + dense breast supplemental imaging + insurance coverage mapping, prevent-lifestyle.ts: Claude-generated prevention lifestyle recommendations with exercise/nutrition/alcohol/environment sections). 1 seed script (seed-palliative-providers.ts). GraphQL: 11 types + 3 inputs + 11 queries + 8 mutations, 1 resolver file (prevent.ts). 19 operations in prevent-risk.graphql. 11 shared screens (~5,900 lines — PreventOnboarding 5-step wizard, RiskDashboard with risk gauge + trajectory chart + modifiable factors, RiskFactors with detailed factor breakdown + evidence cards, PreventFamilyHistory with first/second-degree relative form + BRCA assessment + cascade testing info, PreventGenomic with testing recommendations + variant display + counselor resources, ScreeningPlanner with modality schedule + next appointment + dense breast guidance + insurance, Chemoprevention with USPSTF eligibility check + medication comparison + discussion guide, PreventEducation with structured evidence-based content, PreventLifestyle with exercise/nutrition/alcohol/environment sections, LocationHistory for environmental exposure tracking, DataContribution with tiered consent). 3 web page directories (education, onboarding, risk) + 14 mobile routes under `/prevent/`. Dashboard + HomeScreen integration. **Full Gail model with SEER baselines. NCCN screening planner. USPSTF chemoprevention thresholds. 5-step onboarding. ~40% of full spec — PRS calculation, environmental intelligence (EPA/EWG APIs), population aggregation deferred.**

**PREVENT Phase 0b — Genomic Layer (P0-7, complete):**
- 5 new fields on GenomicProfile (rawFileS3Key, parsingStatus, snpCount, extractedAt, prsSnpDosages). 1 new lib file (genotype-parser.ts: ~500 lines — format detection for 23andMe/AncestryDNA/VCF, line-by-line TSV/VCF parsing, ClinVar-derived pathogenic variant reference table ~45 entries across BRCA1/BRCA2/PALB2/CHEK2/ATM/RAD51C/RAD51D/TP53, VUS reference table ~12 entries, Mavaddat 2019 313-SNP PRS reference table ~80 representative high-weight SNPs with effect alleles + log-OR weights, gene region map for tested-gene tracking, effect allele dosage counting). s3.ts extended with downloadS3AsText. prevent-lifestyle.ts extended with requestGenotypeUploadUrl (presigned S3 upload + DocumentUpload record + GenomicProfile upsert) + processGenotypeFile (S3 download → parse → populate GenomicProfile with variants/genes/PRS dosages). GraphQL: +2 types (RequestGenotypeUploadInput, GenotypeUploadResult) + 5 new fields on PreventGenomicProfile + 2 mutations (requestGenotypeUpload, parseGenotypeFile), 2 resolver operations, 2 context signatures, 2 route handler adapters. 2 new operations in prevent-risk.graphql (21 total). PreventGenomicScreen updated with upload section: web file picker with progress tracking + parsing state + data source badge + mobile "web required" placeholder. **Raw genotype file upload → server-side parsing → pathogenic/VUS variant extraction → PRS SNP dosage extraction for P0-8. No new dependencies — pure text parsing.**

**PREVENT Phase 0c — PRS Calculation Engine (P0-8, complete):**
- 2 new fields on GenomicProfile (prsConfidence, prsRiskMultiplier). 1 new lib file (prs-calculator.ts: ~170 lines — calculatePrs function taking SNP dosages + optional ethnicity, European allele frequency reference table for 84 SNPs, population mean/SD computation from published frequencies, ancestry-specific calibration for 5 populations, Abramowitz & Stegun normal CDF approximation, risk multiplier via exp(z×ln(1.61)), confidence classification by SNP coverage ≥80%/≥60%/<60%). genotype-parser.ts updated to export PRS_SNPS Map + PrsSnpRef type. prevent-lifestyle.ts extended with auto-trigger PRS after genotype parsing + calculatePrsForUser for manual recalculation with ancestry override. GraphQL: +4 fields on PreventGenomicProfile (prsModelVersion, prsAncestryCalibration, prsConfidence, prsRiskMultiplier) + 1 mutation (calculatePrs with optional ancestryOverride), 1 resolver operation, 1 context signature, 1 route handler adapter. 1 new operation in prevent-risk.graphql (24 total). PreventGenomicScreen updated: percentile display with confidence badge (green/amber/red), SNP coverage indicator, risk multiplier card, elevated risk warning (≥80th percentile), low confidence warning (<60% coverage), ancestry disclosure for non-European calibration, recalculate button, model citation. **PRS auto-calculated on genotype upload. Ancestry-calibrated. Produces risk multiplier for P0-9 Gail integration.**

**PREVENT Phase 0d — Composite Risk Model (P0-9, complete):**
- No new Prisma models (uses existing RiskAssessment with modelVersion discrimination). 1 new lib file (composite-risk-engine.ts: ~230 lines — calculateCompositeRisk with 4-path decision tree: Gail-only/PRS-multiply/gene-penetrance-override/gene-PRS-combined, gene penetrance constants for BRCA1/BRCA2/TP53/PALB2/CHEK2/ATM/RAD51C/RAD51D, CI widening by PRS confidence, 95% risk ceiling, projectCompositeTrajectory with external RR multiplier). prevent-risk-engine.ts updated: exported calculateAbsoluteRisk with externalRRMultiplier param (default 1.0). prevent-manager.ts extended with runCompositeRiskAssessment (fetches PreventProfile + GenomicProfile, dispatches to composite engine, stores with modelVersion composite_v1) + recalculateRisk (manual trigger). prevent-lifestyle.ts: auto-triggers composite recalculation after PRS in both processGenotypeFile and calculatePrsForUser. GraphQL: +1 field on RiskAssessment (fullAssessment: JSON) + 1 mutation (recalculateRisk), 1 resolver operation, 1 context signature, 1 route handler adapter. 2 new operations in prevent-risk.graphql (26 total). RiskDashboardScreen updated: model badge (GAIL MODEL vs GAIL + GENOMIC purple), genomic adjustment card with method explanation + effective multiplier + Gail-only comparison, conditional disclaimer, recalculate button. RiskFactorsScreen updated: new Genomic Risk Factors section with PRS percentile/confidence/multiplier display, pathogenic variant cards with penetrance badges, VUS informational section. **Gail × PRS multiplication for polygenic risk. BRCA1/2 penetrance override (Gail not calibrated for carriers). Auto-triggers on genotype upload. No schema migration needed.**

**PREVENT Phase 0e — Ancestry Confidence + Partner Testing (P0-10, complete):**
- No new models, no new lib files, no new GraphQL operations. PreventGenomicScreen expanded (~340 lines net): partner testing comparison section (4 providers — 23andMe, AncestryDNA, Color Health, Invitae — with cost, turnaround, PRS compatibility badges, insurance coverage notes, ACA callout), ancestry confidence signal-bars visualization (5-bar scale per ancestry with plain-language explanation), enhanced genetic counselor referral (high-risk conditional alert for >20% lifetime or pathogenic variants, clickable resource URLs via openExternalUrl, pre-visit preparation guide with what-to-bring + questions-to-ask, genetic counseling insurance coverage info). **Genomic layer complete (P0-7 through P0-10). Next: environmental intelligence (P0-11).**

**MATCH Extension — Preventive Trial Matcher (PTM, complete):**
- 3 Prisma models (CuratedPreventiveTrial, PreventivePrescreen, FamilyReferral) + 2 new fields on Trial (trialCategory, isPreventive). 1 new lib file (preventive-matcher.ts: 8 functions — getPreventiveTrials with curated merge, getRecurrencePreventionTrials with patient profile cross-reference + genomics boost, preScreenEligibility deterministic scoring, runPreventivePrescreen batch match + save, getPreventiveTrialsForFamily filtered for family context, generateReferralLink with crypto short codes + shareable messages, redeemReferralCode, getReferralStats privacy-preserving counts). trial-sync.ts extended with classifyTrial keyword-based classifier (6 categories: preventive_vaccine, chemoprevention, recurrence_prevention, risk_reduction, biomarker, therapeutic). Seed script: 5 curated preventive trials (Cleveland Clinic alpha-lactalbumin, WashU neoantigen, BioNTech BNT116, Moderna mRNA-4157, BRCA-carrier vaccine). GraphQL: 6 types + 1 input + 5 queries (2 public + 3 auth) + 2 mutations, 1 resolver file (preventive.ts), 7 context signatures, 7 route handler adapters. 7 operations in preventive.graphql. 3 shared screens (PreventiveTrialsScreen with 5-question inline quiz + match results + featured curated trials + educational section + referral code handling, ForYourFamilyScreen with family risk overview + filtered trials + shareable referral link generation + stats, RecurrencePreventionScreen with genomic profile advantage note + matched trials + link to full matches). Dashboard + SurviveDashboard + HomeScreen integrations. 3 web pages + 3 mobile routes under `/prevent/`. **Public prevention trial quiz (no auth needed). Family referral system. Recurrence prevention bridge for survivors. First public prescreening feature.**

**Access Gap — PEERS (PM1 + PM2, complete):**
- 4 Prisma models (PeerMentorProfile with enrollment/training/preferences/boundaries/track record, PeerConnection with match score/reasons/status lifecycle/safety flags/feedback, PeerMessage with connection-scoped messaging/read receipts/crisis flagging, MentorTrainingProgress with module completion tracking). 1 lib file (peer-manager.ts: 20 functions — enrollAsMentor with treatment-completion verification, getMentorProfile, updateMentorProfile, findMatches with deterministic multi-factor scoring algorithm, calculatePeerMatchScore 0-120+ weighted (cancer type required, subtype +30, stage +20, regimen +25, age +15, phase +20, comfort topics), generateMatchSummary privacy-preserving (age→decade range, name→first+initial), proposeConnection, respondToConnection, getConnections dual-role, getConnection with auth check, getTrainingModules 6-module curriculum, completeTrainingModule with isTrained auto-flip, sendMessage with crisis keyword detection, getMessages paginated with isOwnMessage, markMessagesRead bulk, updateConnectionStatus state machine (active→paused/completed/ended, paused→active/ended), reportConcern, submitConnectionFeedback with averageRating recomputation, getMentorStats). No AI/Claude calls — matching is deterministic, training is static, messaging is human-to-human. GraphQL: 13 types (PeerMentorProfile, PeerConnection, PeerMatchResult, PeerMentorSummary, MentorTrainingModule, TrainingModuleResult, PeerMessage, SendMessageResult, CrisisAlert, CrisisResource, MentorStats, PeerSafetyReport, ConnectionFeedback) + 3 inputs + 7 queries + 13 mutations, 1 resolver file (peers.ts), 17 context signatures, 17 route handler adapters. 20 operations in peers.graphql. 8 shared screens (PeersDashboard with mentor profile card + active/pending/past connections + quick actions, BecomeMentor with bio/preferences/boundaries/comfort topic chips, FindMatch with scored results + privacy summaries + propose button, PeerConnection with status display + accept/decline + action buttons, MentorTraining with 6-module accordion + progress bar + completion tracking, PeerMessages with 10s polling + own/partner bubble alignment + crisis modal, PeerFeedback with 5-star rating + comment, PeerSafety with crisis resources + guidelines + concern reporting form). 8 web pages under `/peers/` + 12 mobile route files. MoreScreen + SurviveDashboard integration. **No AI calls. Deterministic matching. 6-module training requirement. 10s message polling. Crisis keyword detection with resource display. Privacy-preserving match summaries. All access gap modules now complete.**

## What's NOT Built Yet

**Cross-cutting:** CARE (care commerce), COOL (cold capping), ENGINE (opportunity detection).

**Phase 0 — PREVENT expansion to Women's Endocrine Health (P0-11 to P0-EX6, 13 sessions remaining):**
- Genomic layer complete (P0-7 through P0-10)
- Environmental intelligence (condition-agnostic): water quality dashboard with EPA/EWG APIs (P0-11), product barcode scanner with EDC flagging (P0-12), home environment checklist (P0-13), EDC biomarker panel integration (P0-14), longitudinal exposure tracking + composite environmental score (P0-15)
- Condition expansion: PCOS module with Rotterdam screening + symptom tracker + metabolic dashboard (P0-EX1, P0-EX2), endometriosis module with pain diary + provider report generation (P0-EX3), thyroid health module with lab tracking + EDC risk connection (P0-EX4)
- Population health: location exposure scoring with EPA enrichment per zip code (P0-17), population aggregation with k-anonymity + cross-condition geographic heatmap (P0-20/21)
- Platform integration: cross-condition correlation engine + multi-condition dashboard redesign (P0-EX5), expanded onboarding with PCOS/endo/thyroid screening + multi-condition trial matching (P0-EX6)
- Foundation (P0-1 to P0-7) + PRS calculation (P0-8) complete.

## Spec Documents

| Spec | Module | Sessions |
|------|--------|----------|
| `ONCOVAX_PHASE4_SESSIONS.md` | MANUFACTURE | M1-M2 |
| `ONCOVAX_PHASE5_SESSIONS.md` | SURVIVE | S1-S8 |
| `ONCOVAX_SURVIVORSHIP_SPEC.md` | SURVIVE | Data models + interfaces |
| `ONCOVAX_INTEL_SPEC.md` | INTEL | Research intelligence |
| `ONCOVAX_LEARN_SPEC.md` | LEARN | Educational content + SEO |
| `ONCOVAX_VISUAL_SPEC.md` | VISUAL | 30 interactive visualizations |
| `ONCOVAX_CARE_SPEC.md` | CARE | Care commerce |
| `ONCOVAX_COOL_SPEC.md` | COOL | Cold capping coordination |
| `ONCOVAX_ENGINE_SPEC.md` | ENGINE | Strategic opportunity detection |
| `ONCOVAX_ACCESS_GAP_MODULES.md` | 6 modules | FERTILITY, SECOND, LOGISTICS, PALLIATIVE, ADVOCATE, PEERS |
| `ONCOVAX_PHASE0_PREVENT_SPEC.md` | PREVENT v1 | Pre-diagnosis risk (breast-cancer-only, superseded by v2) |
| `ONCOVAX_PREVENTIVE_TRIAL_MATCHER_SPEC.md` | MATCH extension | Preventive trials + family referral |
| `ONCOVAX_PHASE0_EXPANSION_SPEC.md` | PREVENT v2 | Women's endocrine health expansion + 16 Claude Code session prompts (P0-8 to P0-EX6) |
| `ONCOVAX_UNIFIED_ROADMAP.md` | All | Full platform state + remaining build order |

## Key Design Principles

1. **Platform NEVER announces recurrence** — only responds to what patient/doctor reports
2. **Clinical trials always recommended first** before manufacturing pathways
3. **All AI-generated documents carry prominent disclaimers** — must be physician-reviewed
4. **Survivorship tone: warm, steady, empowering** — not clinical, not urgent
5. **Fear of recurrence is #1 burden** — every touchpoint should reduce anxiety
6. **Evidence-graded recommendations** — strong/moderate/emerging/precautionary
7. **60-second journal entry** — lowest friction possible for daily engagement
8. **No generic wellness advice** — everything is subtype-specific and evidence-cited
9. **Condition-agnostic environmental infrastructure** — water quality, product scanner, biomarker panels, location history serve ALL conditions equally. Build once, contextualize per condition.
10. **Cross-condition correlation is the flagship insight** — shared environmental drivers across breast cancer, PCOS, endometriosis, and thyroid dysfunction are more actionable than single-condition risk factors.
11. **PCOS/endo/thyroid modules inherit survivorship patterns** — 60-second symptom logging, evidence-graded recommendations, provider-ready reports, warm empowering tone.
12. **Environmental framing: empowerment not alarm** — dose-response context, actionable swaps, portfolio view (cumulative exposure matters, not single products). Never present precautionary advice with same weight as strong evidence.

## Tooling & Infrastructure

- `pnpm 9.14.2` for package management
- `npx` for global tooling (not corepack)
- Turborepo for monorepo orchestration
- Docker Compose for local dev (postgres:15-alpine + redis:7-alpine)
- Railway for PostgreSQL + Redis (production)
- AWS S3 (2 buckets: `iish-documents`, `iish-pipeline`)
- AWS Batch + ECR (8 pipeline step containers)
- NATS JetStream (pipeline event bus)
- Terraform for infrastructure
- Resend for email, Mapbox for geocoding + heatmaps, Cloudinary for images
- EPA/EWG APIs (planned for P0-11), Open Food Facts API (planned for P0-12)

## Known Gaps

- **No tests** — zero test files in web/mobile (only Rust unit tests)
- **No error monitoring** — no Sentry, no error boundaries
- **Mobile auth flow incomplete** — `useProtectedRoute` checks token existence but magic link → token storage not wired end-to-end
- **Mobile upload screens** — 3 placeholder pages ("requires web browser") for document/sequencing/pipeline upload
- **No push notifications** — email notifications built (S7), but no mobile push (no expo-notifications)
