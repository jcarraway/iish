# OncoVax — Project Knowledge Base

## What This Is

Personalized cancer vaccine intelligence platform. Monorepo covering the full patient journey: risk assessment → diagnosis → trial matching → treatment translation → genomic sequencing → neoantigen prediction → vaccine design → manufacturing coordination → survivorship care → recurrence detection.

## Architecture (As-Built)

```
oncovax/
├── apps/
│   ├── web/                    # Next.js 15.0.0, React 19.0.0, Tailwind CSS 3.4
│   │   ├── app/                # App Router — pages + 89 API route files + 2 cron endpoints
│   │   ├── components/         # 3 web-only components (DocumentUploader, AdministrationSiteCard, AdministrationSiteMap)
│   │   └── lib/                # 56 library files (see below)
│   └── mobile/                 # Expo SDK 54, React Native 0.76.9, Dripsy + Solito
│       ├── app/                # Expo Router — 106 route files across 27 directories
│       └── lib/                # apollo.ts (GraphQL client), auth.ts (SecureStore guard)
├── docker-compose.yml          # Local dev: postgres:15-alpine + redis:7-alpine
├── packages/
│   ├── ui/                     # Thin RN + Solito re-exports (@oncovax/ui)
│   ├── app/                    # 101 shared screens, 24 Dripsy components, theme, 170+ generated hooks (@oncovax/app)
│   │   └── src/{screens[96],components[24],providers,theme,graphql,generated,utils,index}.ts
│   ├── api/                    # Apollo Server schema (141+ types, 87Q, 86M) + 26 resolver files (@oncovax/api)
│   │   └── src/{schema,resolvers[24 files],context,index}.ts
│   ├── db/                     # Prisma 7 + PostgreSQL (48 models)
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
└── scripts/                    # 13 seed/sync scripts
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
- **Shared screens:** 101 screens in `packages/app/src/screens/` — 46 migratable (D3-D6) + 4 survivorship (S1) + 2 surveillance (S2) + 3 journal/effects (S3) + 1 lifestyle (S4) + 2 care team (S5) + 2 ctDNA (S6) + 1 notifications (S7) + 8 recurrence (S8) + 5 fertility + 5 advocate + 5 logistics + 5 second opinion + 6 learn (L1) + 4 intel (I1) + 2 community (I5) + 1 intel landscape (I6)
- **Web pages:** Most pages are thin re-exports: `'use client'; export { XxxScreen as default } from '@oncovax/app';`. Exception: `/learn/[category]/[slug]/page.tsx` is a server component with `generateMetadata` + `generateStaticParams` + JSON-LD that renders a client component wrapper.
- **Mobile routes:** All 101 screens wired via Expo Router — 108 route files across 27 directories
- **Mobile tabs:** 5-tab layout (Home, Matches, Sequencing, Pipeline, More) with Ionicons
- **Mobile auth:** `useProtectedRoute()` hook — SecureStore token check + redirect to `/auth` modal
- **Web-only components (3):** `DocumentUploader` (File API), `AdministrationSiteCard`, `AdministrationSiteMap` (Mapbox) — kept in `apps/web/components/`
- Shared components use Dripsy `sx` prop with theme tokens, Solito `Link` for navigation
- Custom `Picker` component replaces `<select>` cross-platform (web: native select, native: Modal list)
- All shared code uses GraphQL hooks exclusively (zero `fetch('/api/...')` calls after D8)

### Prisma 7 (Critical Differences from Prisma 5/6)
- No `url` in `datasource` block — use `prisma.config.ts` with `defineConfig`
- Generator: `prisma-client` (not `prisma-client-js`), `output` field required
- Client needs driver adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`
- All models use `@map("snake_case")` columns and `@@map("table_names")`
- 48 models total (45 + FeedRelevance, UserFeedConfig from INTEL I4 + CommunityReport from INTEL I5)

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
- Used for: document extraction, eligibility parsing, trial matching, treatment translation, genomic interpretation, report generation, regulatory document drafting, SCP generation, surveillance result extraction, lifestyle recommendation generation, symptom routing, appointment prep, ctDNA interpretation, fertility discussion guides, appeal letter generation, peer review prep, logistics plan generation, record packet assembly, communication guide generation, article generation, personalized article context, reading plan generation, research classification (maturity/evidence/impact), research summarization (patient + clinician)

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

**INTEL — I1: Research Intelligence Foundation + PubMed Ingestion (complete):**
- 2 Prisma models (ResearchItem with ~40 fields including source tracking/classification/summaries/QC/dedup/processing, IngestionSyncState), 2 lib files (intel-sources.ts: PubMed E-utilities client with esearch/efetch + regex XML parsing + SHA-256 dedup + 30-journal credibility map + rate limiting with exponential backoff; intel-manager.ts: 14 functions — normalizeItem, findDuplicates, ingestPubMedArticles with sync state + 11 search terms + batch dedup, classifyItem via Claude with conservative rules (mouse→T4, preprint→L5, T1 requires FDA mention) + Redis 30-day cache, summarizeItem with patient 6th-grade + clinician structured JSON summaries, processClassificationQueue, processSummarizationQueue, runIngestionCycle, getSyncStates, getResearchItems with taxonomy filters + hasSome + pagination, getResearchItem, searchResearchItems with ILIKE, triggerIngestion, reclassifyItem). Cron endpoint (apps/web/app/api/cron/intel/route.ts). GraphQL: 4 types (ResearchItem, ClinicianSummary, IngestionSyncState, IngestionCycleResult) + 1 input (ResearchItemFilters) + 4 queries (3 public + 1 authenticated) + 2 mutations, 1 resolver file (intel.ts), 6 context signatures, 6 route handler imports. 6 operations in intel.graphql. 4 shared screens (IntelFeedScreen with search + maturity tier filter pills + domain filter pills + practice impact filter + research cards, IntelItemDetailScreen with badges + patient summary + collapsible clinician summary + drug/biomarker chips + hype check + source links, IntelSettingsScreen stub, IntelLandscapeScreen stub). 4 web pages + 4 mobile routes under `/intel/`. Dashboard + MoreScreen integration. 1 seed script (seed-intel-pubmed.ts). **First external API ingestion pipeline (PubMed E-utilities). First Claude classification pipeline (maturity tier + evidence level + practice impact). Conservative classification with post-hoc rule enforcement.**

**INTEL — I2: Classification Pipeline Refinement + QC Expansion (complete):**
- 2 new fields on ResearchItem (sponsorName, authorCOI — no new models). intel-manager.ts expanded ~300 lines net (19 functions, up from 14): expanded classification prompt taxonomy (13 cancer types up from 6, 10 breast subtypes in snake_case, 9 spec domains, 22+ treatment classes, 11 treatment stages, 6 practice impacts including negative + safety_alert), COI extraction (sponsorName + authorCOI in Claude prompt), classificationConfidence stored, keyEndpoints extraction (regex-based HR/CI/p-value parsing from clinician summary), 8 post-hoc classification rules (up from 3: +T2 requires phase 3, +negative result detection, +safety alert forcing, +small sample N<30 flag, +industry practice_changing flag), checkRetractionStatus (PubMed PublicationType + CrossRef update-to), detectContradictions (drug/trial overlap + conflicting practiceImpact → mutual contradictedBy + relatedItemIds), processQCQueue (batch retraction + contradiction checks for complete items), migrateOldTaxonomy (idempotent rename: informative→practice_informing, confirmatory→incremental, HER2+/ER+/PR+/TNBC/HR+/HER2- → snake_case). intel-sources.ts: +fetchPubMedSingle helper. Pipeline flow: ingest → classify → summarize → QC. GraphQL: +2 types (QCResult, TaxonomyMigrationResult) + 4 new fields on ResearchItem (sponsorName, authorCOI, relatedItemIds, contradictedBy) + 2 mutations (runQCPipeline, migrateOldTaxonomy), 8 context signatures (up from 6), 8 route handler imports. 8 operations in intel.graphql (up from 6). 2 screens updated: IntelFeedScreen (9 spec domains, 6 impact options, retraction badge, safety_alert red border), IntelItemDetailScreen (retraction banner, confidence % badge, sponsor display, collapsible COI section, structured keyEndpoints with HR/CI/p-value chips, contradicting research links, related research links, renamed impact labels). **Full spec taxonomy, retraction checking via PubMed+CrossRef, contradiction detection, COI extraction, 8 post-hoc rules.**

**INTEL — I3: Additional Sources + FDA Alerts (complete):**
- No new Prisma models. 5 new source fetchers in intel-sources.ts (~400 lines): fetchFDADrugApprovals + fetchFDASafetyAlerts (openFDA drug labels + adverse events, 500ms rate limit, optional OPENFDA_API_KEY), fetchPreprints (bioRxiv + medRxiv API with breast cancer keyword filter, 200ms rate limit), fetchTrialUpdates (ClinicalTrials.gov v2 API — new registrations + results postings, 350ms rate limit), fetchInstitutionNews (7 RSS feeds — NCI, MSK, MD Anderson, Dana-Farber, Mayo, Hopkins, Cleveland Clinic — regex XML parsing, 500ms between feeds), fetchNIHGrants (NIH Reporter POST API, 6s rate limit). Normalized interfaces: FDAItem, PreprintArticle, TrialUpdate, NewsItem, NIHGrant. 5 new ingest functions in intel-manager.ts (~350 lines, 24 functions total up from 19): ingestFDAItems (sourceType fda, 180-day default lookback, safety items prefixed [FDA SAFETY ALERT]), ingestPreprints (sourceType preprint, sourceCredibility preprint, 30-day lookback), ingestTrialUpdates (sourceType clinicaltrials, 30-day lookback, NCT ID tracking), ingestInstitutionNews (sourceType institution, 30-day lookback), ingestNIHGrants (sourceType nih_reporter, 90-day lookback). runIngestionCycle expanded: 6 sequential sources → classify → summarize → QC. triggerIngestion: switch for all 6 sources. GraphQL: +2 types (SourceIngestionResult, IngestionBreakdown). IntelSettingsScreen rewritten from stub to real source management UI (~150 lines): sync state display per source (relative time, total ingested, last run count, errors), Sync Now button with loading state, source descriptions + badges (Academic/Federal/Preprint/News). IntelFeedScreen: source type badge pills (PubMed/FDA/Preprint/Trial/News/NIH), NOT PEER-REVIEWED amber badge for preprints, FDA ALERT red badge for FDA safety items. IntelItemDetailScreen: source-specific banners (preprint disclaimer, FDA regulatory, ClinicalTrials.gov NCT, NIH funding details), source-aware external links. **6 ingestion sources (up from 1): PubMed, FDA, bioRxiv/medRxiv, ClinicalTrials.gov, Institutional News, NIH Reporter. All feed through existing classify→summarize→QC pipeline.**

**INTEL — I4: Personalization Engine + Feed UI (complete):**
- 2 Prisma models (FeedRelevance with per-user per-item relevance score + interaction tracking + cached personalized note, UserFeedConfig with audience/depth/preclinical/negative toggles). 1 new lib file (feed-personalization.ts: 13 functions — profileToSubtype maps receptor status to I2 snake_case, extractPatientBiomarkers aggregates from profile/receptors/genomics, getCurrentDrugs filters active treatments, mapStageToTreatmentStage maps AJCC to I2 stages, calculateRelevanceScore 0-100 weighted algorithm with safety alert force-100, computeRelevanceScores batch upsert, getPersonalizedFeed relevance-ranked with config filtering, generatePersonalizedNote lazy Claude + Redis 7-day cache + DB cache, markItemViewed/Saved/Dismissed/Shared interaction upserts, getUserFeedConfig/updateUserFeedConfig). GraphQL: +6 types (FeedRelevanceItem, PersonalizedFeedResponse, UserFeedConfig, PersonalizedNote, PersonalizedFeedFilters input, UpdateFeedConfigInput input) + 3 queries (personalizedFeed, personalizedNote, feedConfig) + 5 mutations (markItemViewed, markItemSaved, markItemDismissed, updateFeedConfig, computeRelevanceScores), 8 resolver operations in intel.ts, 8 context signatures, 8 route handler adapters. 8 operations in intel.graphql (16 total, up from 8). 3 screens updated: IntelFeedScreen (dual-mode: auth uses personalizedFeed ranked by relevance with score pills + For You badge + save/dismiss buttons, unauth uses chronological researchItems unchanged), IntelItemDetailScreen (personalized note section with purple card + lazy Claude generation, mark viewed on mount, save button), IntelSettingsScreen (feed preferences section with audience/depth pills + preclinical/negative toggles, auto-save on change). **Personalized relevance-ranked feed for authenticated users. Safety alerts for current drugs force score to 100. Public browsing unchanged.**

**INTEL — I5: Community Intelligence + Email Digests (complete):**
- 1 Prisma model (CommunityReport with reportType/consentScope/structuredData JSON/narrative/moderationStatus/verified/relatedDrug, 3 indexes). 2 field extensions (UserFeedConfig.digestFrequency, NotificationPreference.researchAlerts). 1 new lib file (community-manager.ts: 10 functions — submitCommunityReport with auto-verify + moderation, getCommunityReports, getCommunityReportsByDrug, moderateReport, getDrugInsights aggregation with ratings/sideEffects/tips, getTrialInsights, getCommunityInsightsForItem, compileDigest 5-section builder, sendDigest with Resend + dedup, updateDigestPreferences). notification-manager.ts extended with processResearchDigests (day-of-week/month gating). GraphQL: +7 types (CommunityReport, CommunityInsight, CommunityInsightSideEffect, CommunityTrialSummary, DigestPreview, DigestItem, SubmitCommunityReportInput) + 4 queries + 3 mutations, 7 resolver operations in intel.ts, 7 context signatures, 7 route handler adapters. 7 operations in intel.graphql (23 total). 2 new screens: CommunityFeedScreen (report type filter pills + drug filter + report cards + drug insights), CommunitySubmitScreen (4-step form: type → structured data → narrative → consent). 3 screens updated: IntelItemDetailScreen (community insights section), IntelSettingsScreen (digest frequency selector), IntelFeedScreen (community + settings links). 2 web pages + 2 mobile routes under `/intel/community/`. **Community data always labeled "Based on reports from X patients on this platform." Configurable email digests (daily/weekly/monthly) with 5 personalized sections.**

**INTEL — I6: Landscape Views + Cross-Module Integration (complete):**
- No new Prisma models. 1 new lib file (landscape-manager.ts: 10 functions — getLandscapeOverview with maturity/domain/subtype/treatmentClass distribution counts, getSubtypeLandscape with tier-bucketed items + pipeline + cached SOC, getTreatmentPipeline grouped by drugName with most advanced tier, getRecentDevelopments T1/T2 last N days, generateStandardOfCareSummary via Claude + Redis 14-day cache, checkTranslatorUpdates cross-referencing T1/T2 items vs patient subtype/drugs since translation generated, checkFinancialUpdates FDA T1 practice_changing items vs patient drugs last 90 days, checkSurvivorshipUpdates survivorship/QoL + ctDNA research vs patient subtype last 90 days, getLandscapeHighlights, getSubtypeLabel). GraphQL: +7 types (LandscapeOverview, SubtypeLandscape, StandardOfCareSummary, TreatmentPipelineEntry, TranslatorUpdateCheck, FinancialUpdateCheck, SurvivorshipUpdateCheck) + 4 public queries (landscapeOverview, subtypeLandscape, treatmentPipeline, recentDevelopments) + 3 authenticated queries (translatorUpdates, financialUpdates, survivorshipUpdates) + 1 mutation (generateStandardOfCare), 8 resolver operations in intel.ts, 8 context signatures, 8 route handler adapters. 8 operations in intel.graphql (31 total). IntelLandscapeScreen rewritten (~380 lines, dual-mode: overview with maturity distribution bar + subtype grid cards + treatment pipeline table + recent highlights, subtype detail with SOC card + tier sections + pipeline + browse link). 1 new screen: IntelSubtypeLandscapeScreen (thin wrapper). 3 screens updated with integration badges: TranslateScreen (amber "New Research Since Your Guide" card), FinancialScreen (green "New Drug Approvals" card), SurviveDashboardScreen (blue research updates card). 1 web page + 2 mobile routes added for `/intel/landscape/[subtype]`. Mobile landscape route restructured from flat file to directory. **Aggregated research landscape by subtype and domain. Cross-module integration surfaces new research in Translator, Financial, and Survivorship. INTEL module complete (I1-I6).**

## What's NOT Built Yet

**Cross-cutting:** VISUAL (30 visualizations), CARE (care commerce), COOL (cold capping), ENGINE (opportunity detection).

**Access gap:** PALLIATIVE, PEERS.

**Phase 0 — PREVENT:** Pre-diagnosis risk intelligence + prevention.

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
| `ONCOVAX_PHASE0_PREVENT_SPEC.md` | PREVENT | Pre-diagnosis risk |
| `ONCOVAX_PREVENTIVE_TRIAL_MATCHER_SPEC.md` | MATCH extension | Preventive trials + family referral |

## Key Design Principles

1. **Platform NEVER announces recurrence** — only responds to what patient/doctor reports
2. **Clinical trials always recommended first** before manufacturing pathways
3. **All AI-generated documents carry prominent disclaimers** — must be physician-reviewed
4. **Survivorship tone: warm, steady, empowering** — not clinical, not urgent
5. **Fear of recurrence is #1 burden** — every touchpoint should reduce anxiety
6. **Evidence-graded recommendations** — strong/moderate/emerging/precautionary
7. **60-second journal entry** — lowest friction possible for daily engagement
8. **No generic wellness advice** — everything is subtype-specific and evidence-cited

## Tooling & Infrastructure

- `pnpm 9.14.2` for package management
- `npx` for global tooling (not corepack)
- Turborepo for monorepo orchestration
- Docker Compose for local dev (postgres:15-alpine + redis:7-alpine)
- Railway for PostgreSQL + Redis (production)
- AWS S3 (2 buckets: `oncovax-documents`, `oncovax-pipeline`)
- AWS Batch + ECR (8 pipeline step containers)
- NATS JetStream (pipeline event bus)
- Terraform for infrastructure
- Resend for email, Mapbox for geocoding, Cloudinary for images

## Known Gaps

- **No tests** — zero test files in web/mobile (only Rust unit tests)
- **No error monitoring** — no Sentry, no error boundaries
- **Mobile auth flow incomplete** — `useProtectedRoute` checks token existence but magic link → token storage not wired end-to-end
- **Mobile upload screens** — 3 placeholder pages ("requires web browser") for document/sequencing/pipeline upload
- **No push notifications** — email notifications built (S7), but no mobile push (no expo-notifications)
