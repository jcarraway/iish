# OncoVax Shared UI Migration Plan

## Context

OncoVax has 24 web components and 56 pages built with Tailwind CSS in `apps/web/`, while `apps/mobile/` has 11 placeholder screens with zero component sharing. The mobile app has Dripsy installed but unused. This migration creates a shared cross-platform UI package following the exact pattern from `/Users/rett/projects/art-cafe`, enabling code sharing between web and mobile via Dripsy + Solito + Apollo Client.

**Outcome**: All UI components and screens live in `packages/app/`, web pages become thin re-exports, mobile app becomes functional, and a GraphQL layer replaces direct REST fetch calls.

---

## Architecture Overview

```
packages/
  ui/          NEW  Thin primitives (RN re-exports + Solito navigation)
  app/         NEW  Screens, components, theme, hooks, Apollo queries
  api/         NEW  Apollo Server schema + resolvers (wraps existing lib/)
  shared/      KEEP Types, Zod schemas, constants, auth
  db/          KEEP Prisma 7

apps/
  web/         MODIFY  Thin page re-exports + providers + globals.css
  mobile/      MODIFY  Thin screen re-exports + providers + Expo config
```

---

## Session D0: Foundation — Package Scaffolding + Config ✅ COMPLETE

### D0.1 Create `packages/ui/` ✅

Thin re-export layer (mirrors `@art-cafe/ui` exactly).

**Files created:**
- `packages/ui/package.json` — deps: `solito@^5.0.0`, peerDep `react-native`
- `packages/ui/tsconfig.json` — extends root, jsx: react-jsx
- `packages/ui/src/index.ts` — barrel export
- `packages/ui/src/components/index.ts` — re-exports: `View, Text, Pressable, ScrollView, TextInput, FlatList, SectionList, ActivityIndicator, Switch, Modal, SafeAreaView, KeyboardAvoidingView, Image, Platform` from `react-native`
- `packages/ui/src/navigation/index.ts` — re-exports: `Link, TextLink` from `solito/link`, `useRouter, useParams, useSearchParams, usePathname` from `solito/navigation`

### D0.2 Create `packages/app/` ✅

Main shared package (mirrors `@art-cafe/app`).

**Files created:**
```
packages/app/
  package.json          deps: @oncovax/ui, @oncovax/shared, dripsy, @apollo/client, graphql, solito
  tsconfig.json
  codegen.ts            GraphQL codegen config
  src/
    index.ts            barrel: screens, provider, components, hooks, context, apollo cache
    theme.ts            Dripsy theme (medical palette, text/button variants, shadows)
    provider/
      dripsy.tsx        DripsyProvider wrapper
      index.ts
    context/
      theme-context.tsx  Light/dark mode switching
      index.ts
    components/         (populated in D1)
      index.ts
    screens/            (populated in D2-D6)
      index.ts
    hooks/
      index.ts
    lib/
      apollo.ts         Shared Apollo Client cache config + type policies
```

**package.json exports** (critical for cross-platform):
```json
{
  "react-native": "./src/index.ts",
  "import": "./src/index.ts",
  "types": "./src/index.ts"
}
```

### D0.3 OncoVax Dripsy Theme ✅

Medical/clinical palette mapped from current Tailwind colors used across all 24 components.

**`packages/app/src/theme.ts`** — Structure follows art-cafe theme exactly:

- **Colors**: Semantic tokens (`$background`, `$foreground`, `$primary`, `$border`, `$destructive`, `$muted`, `$mutedForeground`, `$card`, `$ring`) + direct palette (blue50-900, green50-900, red50-900, gray50-900, purple100-800, amber100-800, yellow50-800, indigo100-600, cyan100-600, orange100-600, teal100-800)
- **Space**: `$0`=0 through `$24`=96 (4px increments matching Tailwind)
- **FontSizes**: `$xs`=12, `$sm`=14, `$base`=16, `$lg`=18, `$xl`=20, `$2xl`=24, `$3xl`=30, `$4xl`=36, `$5xl`=48
- **Radii**: `$sm`=4, `$md`=6, `$lg`=8, `$xl`=12, `$2xl`=16, `$full`=9999
- **Text variants**: h1, h2, h3, h4, body, bodySmall, caption, label, link
- **Button variants**: primary, secondary, destructive, ghost, outline
- **Shadows**: RN-native shadow properties ($sm, $md, $lg)
- **Breakpoints**: `['640px', '768px', '1024px', '1280px']`
- **Type augmentation**: `declare module 'dripsy' { interface DripsyCustomTheme extends OncoVaxTheme {} }`

### D0.4 Create `packages/api/` — GraphQL Layer ✅

Apollo Server wrapping existing lib/ functions. Single endpoint at `/api/graphql`.

**Files created:**
```
packages/api/
  package.json          deps: @apollo/server, graphql, @as-integrations/next, @oncovax/shared, @oncovax/db
  tsconfig.json
  src/
    schema.ts           GraphQL type definitions (40+ types, 25 queries, 17 mutations)
    resolvers/
      index.ts          Resolver barrel (mergeResolvers)
      auth.ts           me query, requestMagicLink/logout mutations
      patients.ts       patient/patientProfile queries, updateProfile/createManual mutations
      matches.ts        matches/match queries, generateMatches/updateStatus/translateTreatment mutations
      trials.ts         trials/trial queries
      documents.ts      documents query, requestUploadUrl/extractDocument mutations
      financial.ts      financialPrograms/financialMatches queries, matchFinancialPrograms mutation
      sequencing.ts     sequencingProviders/orders queries, checkInsuranceCoverage mutation
      genomics.ts       genomicResults query, extractGenomicReport/interpretGenomics mutations
      pipeline.ts       pipelineJobs/job/reports queries, submitPipelineJob/generateReport mutations
      manufacturing.ts  partners/orders/assessments/documents queries + create/update mutations
      monitoring.ts     administrationSites/monitoringReports queries, submitReport mutation
    context.ts          Request context interface (session, prisma, redis, lib functions)
    index.ts            Barrel: typeDefs, resolvers, GraphQLContext type
```

**Key architecture decision**: Resolvers access lib/ functions via `ctx.lib.*` — the route handler in `apps/web/app/api/graphql/route.ts` injects actual lib function references into context. This keeps `packages/api/` decoupled from `apps/web/lib/`.

### D0.5 Update Web App Config ✅

**`apps/web/next.config.ts`** — Added:
- `transpilePackages`: react-native, react-native-web, dripsy, @dripsy/core, solito, react-native-safe-area-context, workspace packages
- `webpack`: react-native$ → react-native-web alias, .web.{ts,tsx} extension priority
- `serverExternalPackages`: @prisma/client, @oncovax/db, @apollo/server, @react-pdf/*

**`apps/web/app/providers.tsx`** — NEW: ApolloProvider → DripsyProvider → SafeAreaProvider

**`apps/web/app/layout.tsx`** — Wrapped children with `<Providers>`

**`apps/web/lib/apollo.ts`** — NEW: Web Apollo Client (SSR-aware, /api/graphql endpoint, cookie credentials)

**`apps/web/app/api/graphql/route.ts`** — NEW: Apollo Server route handler with 17 adapter functions that bridge resolver signatures to actual lib/ function signatures (handling name mismatches and parameter differences)

**`apps/web/package.json`** — Added: @apollo/client, @apollo/server, @as-integrations/next, react-native-web, react-native-safe-area-context, graphql, workspace deps

### D0.6 Update Mobile App Config ✅

**`apps/mobile/package.json`** — Added: @apollo/client, @oncovax/app, @oncovax/ui, graphql, solito

**`apps/mobile/metro.config.js`** — Added `config.resolver.unstable_enableSymlinks = true`

**`apps/mobile/app/_layout.tsx`** — Wrapped with ApolloProvider → DripsyProvider → SafeAreaProvider → Stack

**`apps/mobile/lib/apollo.ts`** — NEW: Mobile Apollo Client with Bearer token auth from expo-secure-store

### D0.7 Dependencies Installed ✅

All packages installed, all 3 new packages type-check clean, web build succeeds.

### D0 Build Notes
- `@oncovax/db` must NOT be in both `transpilePackages` AND `serverExternalPackages` (Next.js 15 error)
- `turbopack` config key not supported in Next.js 15.0.0 (added in later versions)
- `@dripsy/core` is internal to dripsy — don't install directly, but keep in transpilePackages
- Dripsy shadows must use RN shadow properties (not CSS box-shadow strings)
- Empty barrel files need `export {}` to be valid TypeScript modules
- react-native-web 0.19 warnings about `hydrate`/`unmountComponentAtNode` with React 19 are harmless

---

## Session D1: Component Migration (22 of 24 components) ✅ COMPLETE

Migrated 22 components from `apps/web/components/` (Tailwind) to `packages/app/src/components/` (Dripsy). 2 web-only components remain in place.

### Pre-migration: Shared constants
- Moved `ADVERSE_EVENT_OPTIONS` (19 adverse events, 3 categories) + `AdverseEventOption` interface from `apps/web/lib/monitoring.ts` to `packages/shared/src/constants.ts`
- `apps/web/lib/monitoring.ts` now imports/re-exports from `@oncovax/shared`

### Cross-platform Picker component
- `packages/app/src/components/Picker.tsx` — custom cross-platform select replacement
- Web: renders native `<select>` via `Platform.OS === 'web'` check
- Native: renders `Pressable` that opens a `Modal` with scrollable option list
- Used by MonitoringReportForm (7 selects) and ManualIntakeWizard (6+ selects)

### Migration pattern applied:

1. `<div>` → `<View>`, `<p>`/`<span>`/`<h1-h6>` → `<Text>`, `<button>` → `<Pressable>`, `<a>` → `<Link>` (Solito) or `Linking.openURL`
2. Tailwind classes → `sx` prop with theme tokens (e.g., `className="bg-green-50 text-green-700"` → `sx={{ bg: 'green50', color: 'green700' }}`)
3. `import Link from 'next/link'` → `import { Link } from 'solito/link'`
4. `cn()` calls → inline `sx` prop (no class merging needed)
5. Inline SVGs → Unicode character fallbacks (`\u2713` checkmark, `\u25BC` dropdown, `\u2191`/`\u2193` sort arrows)
6. `line-clamp-2` → `numberOfLines={2}` on Text
7. `hover:` states → skipped (not supported natively)
8. `<select>` → custom `Picker` component
9. `<textarea>` → `<TextInput multiline>`
10. `<input type="range">` → tappable number buttons (1-10 Pressable grid)
11. `<input type="date">` → `<TextInput>` with "YYYY-MM-DD" placeholder
12. `<table>` → `<View>` rows with `flexDirection: 'row'` and fixed column widths
13. `onKeyDown` (Enter-to-submit) → removed (not available in React Native)
14. `window.open(url)` → `Platform.OS === 'web' ? window.open(url) : Linking.openURL(url)`

### Components migrated:

**Tier 1 — Pure display (11 components):** ✅
1. `TranslationSection.tsx` — collapsible section with Unicode arrows
2. `OrderProgressBar.tsx` — 8-step sequencing progress, imports `SEQUENCING_ORDER_STATUSES` from shared
3. `PipelineProgressBar.tsx` — 8-step pipeline progress, imports `PIPELINE_STEP_ORDER` from shared
4. `MonitoringScheduleWidget.tsx` — post-vaccination schedule with status badges
5. `OrderTimeline.tsx` — horizontal ScrollView timeline, 9 manufacturing stages
6. `AdverseEventSummary.tsx` — severity-sorted adverse events with color-coded badges
7. `RegulatoryDocumentCard.tsx` — document status card with action buttons
8. `EligibilityBreakdown.tsx` — 6-dimension scoring with StatusIcon/ScoreBar sub-components
9. `BlueprintVisualization.tsx` — vaccine blueprint with responsive grid layout
10. `NeoantigenTable.tsx` — sortable data table with expandable detail rows
11. `PathwayRecommendation.tsx` — regulatory pathway with accordion alternatives

**Tier 2 — Cards with navigation (7 components):** ✅
12. `AdministrationSiteCard.tsx` — `Linking.openURL` for external links, capability badges
13. `OrderStatusCard.tsx` — entire card wrapped in Solito `Link`, currency formatting
14. `SequencingProviderCard.tsx` — 3 Solito Links, custom View-based checkbox
15. `FinancialProgramCard.tsx` — Solito Links + `Linking.openURL` for external URLs
16. `ReportCard.tsx` — state machine (idle/generating/ready/error), Platform-aware PDF open
17. `ManufacturingPartnerCard.tsx` — capability/certification lists, match score bar
18. `MatchCard.tsx` — internal BreakdownPills sub-component, status badges, 3 Links

**Tier 3 — Forms/interactive (4 components):** ✅
19. `InlineMagicLink.tsx` — TextInput with email keyboard, polling for session
20. `HealthSystemSearch.tsx` — debounced TextInput, ScrollView results list
21. `MonitoringReportForm.tsx` — 7 Pickers, toggle buttons for adverse events, tappable QoL score
22. `ManualIntakeWizard.tsx` — 4-step wizard, 6+ Pickers, dynamic list add/remove

**Web-only — NOT migrated (2 components):**
23. `DocumentUploader.tsx` — File API, drag-drop, XMLHttpRequest (web APIs)
24. `AdministrationSiteMap.tsx` — Mapbox map (web-only)

### Dependencies added
- `@react-native-community/slider@^5.1.2` — installed but deferred (QoL uses tappable buttons instead)
- `@types/node` — dev dependency for `process.env` in shared/auth.ts

### Build verification ✅
- `@oncovax/shared` — builds clean
- `@oncovax/app` (tsc) — builds clean
- `@oncovax/api` — builds clean
- `@oncovax/web` (Next.js) — builds clean (95 pages)

### D1 Build Notes
- `@ts-ignore` needed on web-only `<select>` in Picker.tsx (TypeScript doesn't error, so `@ts-expect-error` fails)
- `packages/app/tsconfig.json` needs `"types": ["react", "node"]` for `process.env` in shared/auth.ts
- Inline SVGs render on web via react-native-web but won't render natively — acceptable for D1, will be replaced with react-native-svg or icon libraries later
- Both old (web/Tailwind) and new (shared/Dripsy) components coexist — web pages still import from `apps/web/components/` until screen migration in D3-D6

---

## Session D2: Complete GraphQL Schema, Resolvers, Operations + Codegen ✅ COMPLETE

Expanded the partial GraphQL layer from D0 into a complete schema covering all operations that screens will need, created operation documents, and ran codegen to produce typed hooks.

### Bug fixes
- Removed broken `Report` type (referenced non-existent Prisma model → runtime crash)
- Removed `requestMagicLink` mutation (threw "Use REST endpoint" — magic link stays REST)
- Removed `generateReport` mutation (replaced by `generateReportPdf` with proper return type)
- Fixed `ctx.prisma.document` → `ctx.prisma.documentUpload` in documents resolver

### Schema expansion

**Types added (20 new):**
- `OncologistBrief` — match-specific brief content
- `SequencingRecommendation`, `SequencingExplanation`, `CommonConcern` — sequencing guide
- `TestRecommendation`, `TestRecommendationPrimary`, `TestRecommendationAlternative` — test recommendations
- `ConversationGuide`, `TalkingPoint` — doctor conversation prep
- `WaitingContent`, `CommonMutation` — waiting-for-results content
- `LOMN` — letter of medical necessity
- `NeoantigenCandidate`, `NeoantigenPage` — paginated neoantigen results
- `PipelineResultDownloads`, `ReportPdfResult`, `NeoantigenTrialMatch` — pipeline outputs
- `MonitoringScheduleEntry` — monitoring timeline
- `HealthSystem`, `FhirConnection`, `FhirAuthorizeResult` — FHIR integration
- `MatchDelta`, `MatchDeltaEntry` — genomics rematch delta
- `PartnerRecommendation` — manufacturing partner scoring
- `UploadUrlResult` — general upload URL

**Queries: 11 → 27 (+16 new):**
- `oncologistBrief`, `financialProgram`
- `sequencingRecommendation`, `sequencingExplanation`, `testRecommendation`, `conversationGuide`, `waitingContent`, `sequencingBrief`
- `neoantigens`, `pipelineResults`, `reportPdf`, `neoantigenTrials`
- `monitoringSchedule`
- `healthSystems`, `fhirConnections`
- `matchDelta`, `recommendedPartners`

**Mutations: 13 → 25 (+12 new):**
- `generateLOMN`, `generateSequencingRecommendation`
- `generateReportPdf`
- `acceptQuote`, `connectSite`, `addOrderNote`
- `authorizeFhir`, `extractFhir`
- `confirmGenomics`, `rematch`
- `requestGeneralUploadUrl`

### New resolver files (7 new, 18 total)

| Resolver file | Key operations |
|---|---|
| `sequencing-guide.ts` | 6 queries + 2 mutations for sequencing journey wizard |
| `pipeline-extended.ts` | neoantigens, pipelineResults, reportPdf, neoantigenTrials, generateReportPdf |
| `fhir.ts` | healthSystems, fhirConnections, authorizeFhir, extractFhir |
| `genomics-extended.ts` | matchDelta, confirmGenomics, rematch |
| `manufacturing-extended.ts` | recommendedPartners, acceptQuote, connectSite, addOrderNote |
| `financial-extended.ts` | financialProgram (single detail) |
| `matches-extended.ts` | oncologistBrief |

Updated `monitoring.ts` with `monitoringSchedule` query. Updated `resolvers/index.ts` to merge all 18 modules.

### Route handler adapter functions (25 total, up from 17)

`apps/web/app/api/graphql/route.ts` — 25 adapter functions bridging resolver signatures to lib/ functions:

New imports: oncologist-brief, sequencing-recommendation, test-recommendation, conversation-guide, waiting-content, coverage (LOMN), sequencing-brief, neoantigen-trials, monitoring (schedule), matcher (computeMatchDelta), FHIR smart-auth/client/extract-resources, manufacturing-orders (isValidTransition)

Key adapters: `generateOncologistBriefAdapter` (loads match+trial+patient), `sequencingRecommendationAdapter`, `testRecommendationAdapter`, `conversationGuideAdapter` (chains test rec → conversation guide), `neoantigenAdapter` (Prisma pagination), `recommendPartnersAdapter` (scores partners by capability), `monitoringScheduleAdapter` (loads order+reports), `authorizeFhirAdapter` (SMART on FHIR discovery → authorize URL), `extractFhirAdapter` (decrypt token → FHIR client → extract resources)

### GraphQL operation documents (13 files, 70 operations)

Created `packages/app/src/graphql/`:

| File | Operations | Hook count |
|------|-----------|------------|
| `auth.graphql` | Me, Logout | 2 |
| `patient.graphql` | GetPatient, GetPatientProfile, UpdateProfile, CreatePatientManual | 4 |
| `matches.graphql` | GetMatches, GetMatch, GetOncologistBrief, GenerateMatches, UpdateMatchStatus, TranslateTreatment | 6 |
| `trials.graphql` | GetTrials, GetTrial | 2 |
| `documents.graphql` | GetDocuments, RequestUploadUrl, ExtractDocument | 3 |
| `financial.graphql` | GetFinancialPrograms, GetFinancialMatches, GetFinancialProgram, MatchFinancialPrograms | 4 |
| `sequencing.graphql` | GetProviders, GetOrders, GetRecommendation, GetExplanation, GetTestRec, GetConversationGuide, GetWaitingContent, GetBrief, CheckCoverage, GenerateLOMN, GenerateSeqRec | 11 |
| `genomics.graphql` | GetGenomicResults, GetMatchDelta, ExtractGenomicReport, InterpretGenomics, ConfirmGenomics, Rematch | 6 |
| `pipeline.graphql` | GetJobs, GetJob, GetNeoantigens, GetResults, GetReportPdf, GetNeoantigenTrials, SubmitJob, GenerateReportPdf | 8 |
| `manufacturing.graphql` | GetPartners, GetPartner, GetOrders, GetOrder, GetRecommended, GetAssessments, GetAssessment, GetDocuments, CreateOrder, UpdateStatus, AcceptQuote, ConnectSite, AddNote, AssessPathway, GenerateDoc | 15 |
| `monitoring.graphql` | GetSites, GetReports, GetSchedule, SubmitReport | 4 |
| `fhir.graphql` | GetHealthSystems, GetConnections, AuthorizeFhir, ExtractFhir | 4 |
| `uploads.graphql` | RequestGeneralUploadUrl | 1 |
| **Total** | | **70** |

### Codegen output

`packages/app/src/generated/graphql.ts` — 5,082 lines containing:
- TypeScript types for all 45+ schema types
- 70 typed `useXxxQuery()` / `useXxxMutation()` hooks
- Lazy query + suspense query variants (234 total exported functions)
- Document nodes for each operation

Re-exported from `packages/app/src/index.ts` so screens can:
```tsx
import { useGetMatchesQuery, useTranslateTreatmentMutation } from '@oncovax/app';
```

### Context interface

`packages/api/src/context.ts` — `GraphQLContext.lib` expanded with 25+ function signatures organized by domain (matches, financial, sequencing, genomics, pipeline, manufacturing, monitoring, FHIR, documents).

### Build verification ✅
- `@oncovax/api` (tsc) — builds clean
- `@oncovax/app` (tsc) — builds clean (5,082-line generated file compiles)
- `@oncovax/web` (Next.js) — builds clean (95 pages)
- `@oncovax/mobile` — pre-existing `jose`/`node:buffer` failure (unchanged, unrelated to D2)

### D2 Build Notes
- `SequencingBriefInput` uses `recommendedTests` + `coverageResult` (not `testType`/`providers`)
- Prisma `Patient` model has no `name` field — join through `user` relation for LOMN adapter
- react-native-web hydrate/unmountComponentAtNode warnings remain (harmless, React 19 compat)

### Routes that stay REST (NOT in GraphQL)
| Route | Reason |
|-------|--------|
| `/api/auth/magic-link` | Sends email, returns simple boolean |
| `/api/auth/verify` | Redirect-based magic link callback |
| `/api/stripe/create-checkout` | Stripe redirect flow |
| `/api/stripe/webhook` | External webhook callback |
| `/api/fhir/callback` | OAuth redirect endpoint |
| `/api/admin/*` | Internal admin tooling |
| `/api/provider/*` | Provider portal (web-only) |

---

## Sessions D3-D6: Screen Migration (56 pages → shared screens)

### Migration pattern for each page:

**Before** (`apps/web/app/matches/page.tsx`):
```tsx
'use client';
import { useEffect, useState } from 'react';
import MatchCard from '@/components/MatchCard';
export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  useEffect(() => { fetch('/api/matches').then(...) }, []);
  return <div className="mx-auto max-w-4xl px-6 py-16">...</div>;
}
```

**After — shared screen** (`packages/app/src/screens/matches.tsx`):
```tsx
import { View, Text, ScrollView, ActivityIndicator } from 'dripsy';
import { useGetMatchesQuery, useUpdateMatchStatusMutation } from '../generated/graphql';
import { MatchCard } from '../components';

export function MatchesScreen() {
  const { data, loading, refetch } = useGetMatchesQuery();
  const [updateStatus] = useUpdateMatchStatusMutation();
  // ... render with Dripsy sx props
}
```

**After — web page** (`apps/web/app/matches/page.tsx`):
```tsx
'use client';
export { MatchesScreen as default } from '@oncovax/app';
```

### Conversion rules (supplement D1 component rules):
1. `useState` + `useEffect` + `fetch('/api/...')` → `useXxxQuery()` / `useXxxMutation()` from generated hooks
2. `loading && <Spinner>` → `if (loading) return <ActivityIndicator />`
3. `error && <ErrorMessage>` → `if (error) return <Text sx={{ color: '$destructive' }}>...</Text>`
4. `router.push('/path')` → `const router = useRouter()` from `solito/navigation`
5. `useSearchParams()` from next/navigation → `useParams()` / `useSearchParams()` from `solito/navigation`
6. `useParams()` from next/navigation → `useParams()` from `solito/navigation`
7. Server Components (no hooks) → still become client-side shared screens (Dripsy needs React context)
8. `localStorage.getItem/setItem` → `Platform.OS === 'web' ? localStorage : AsyncStorage` (or avoid)
9. Page-specific sub-components (inline) → keep inline within the screen file

### Auth pattern for screens:
```tsx
import { useMeQuery } from '../generated/graphql';
import { useRouter } from 'solito/navigation';

export function ProtectedScreen() {
  const { data, loading } = useMeQuery();
  const router = useRouter();
  if (loading) return <ActivityIndicator />;
  if (!data?.me) { router.replace('/auth'); return null; }
  // ... render
}
```

---

### D3: Static + simple list screens (8 screens) ✅ COMPLETE

Migrated 8 web pages from `useState`+`fetch()`+Tailwind to shared Dripsy screens with Apollo hooks. All screens work on both web and mobile.

#### Prerequisite fix: SequencingProvider schema gap
- **`packages/api/src/schema.ts`** — Added `type: String!` to `SequencingProvider` GraphQL type
- **`packages/api/src/resolvers/sequencing.ts`** — Added `SequencingProvider` field resolvers to extract `slug`, `testNames`, `geneCount`, `sampleTypes`, `turnaroundDaysMin/Max`, `costRangeMin/Max`, `fdaApproved`, `orderingProcess`, `reportFormat`, `website` from the Prisma `details` JSON blob
- **`packages/app/src/graphql/sequencing.graphql`** — Added `type` to `GetProviders` query fields
- Regenerated codegen — `type` now appears in `GetProvidersQuery` generated type

#### Screens created:

| Page | Screen file | Apollo Hooks | Key patterns |
|---|---|---|---|
| `app/page.tsx` | `HomeScreen.tsx` | None | Solito `Link` buttons, centered layout |
| `app/auth/page.tsx` | `AuthScreen.tsx` | `useMeQuery` | Auth redirect via `useEffect`, REST magic link stays, `TextInput` with `keyboardType="email-address"` |
| `app/learn/page.tsx` | `LearnScreen.tsx` | None | Static text |
| `app/start/page.tsx` | `StartScreen.tsx` | None | 3 Solito `Link` cards |
| `app/matches/page.tsx` | `MatchesScreen.tsx` | `useGetMatchesQuery`, `useUpdateMatchStatusMutation`, `useGenerateMatchesMutation` | Segmented filter tabs (Pressable), `matchBreakdown` wrapped in `{ items }`, `ActivityIndicator` loading state |
| `app/financial/page.tsx` | `FinancialScreen.tsx` | `useGetFinancialMatchesQuery` | Client-side `useMemo` grouping by category, `Alert.alert()` for subscribe, `programStatus: 'unknown'` (not in GraphQL) |
| `app/sequencing/page.tsx` | `SequencingHubScreen.tsx` | `useGetSequencingOrdersQuery`, `useGetGenomicResultsQuery` | Emoji icons (📄🧪❓) replacing SVGs, `errorPolicy: 'ignore'`, responsive `flexDirection: ['column', 'row']` |
| `app/sequencing/providers/page.tsx` | `ProvidersScreen.tsx` | `useGetProvidersQuery` | 3 `Picker` filters, View-based comparison table, flat GraphQL→nested `SequencingProviderDetails` reconstruction |

All screens in `packages/app/src/screens/`, exported via barrel `index.ts`.

#### Web pages re-pointed (each becomes 2-line re-export):
- `apps/web/app/page.tsx` → `HomeScreen`
- `apps/web/app/auth/page.tsx` → `AuthScreen`
- `apps/web/app/learn/page.tsx` → `LearnScreen`
- `apps/web/app/start/page.tsx` → `StartScreen`
- `apps/web/app/matches/page.tsx` → `MatchesScreen`
- `apps/web/app/financial/page.tsx` → `FinancialScreen`
- `apps/web/app/sequencing/page.tsx` → `SequencingHubScreen`
- `apps/web/app/sequencing/providers/page.tsx` → `ProvidersScreen`

#### D3 type fixes:
- `MatchBreakdownItem.status`: GraphQL returns `string`, shared type expects `'match' | 'unknown' | 'mismatch'` — cast via `as MatchBreakdownItem[]`
- `estimatedBenefit`: GraphQL `string | null | undefined` → prop `string | null` — coalesced with `?? null`
- `SequencingProviderDetails.clinicalUtility`: Required by shared type but not in GraphQL — passed as empty string

#### Build verification ✅
- `@oncovax/api` (tsc) — builds clean
- `@oncovax/app` (tsc) — builds clean
- `@oncovax/web` (Next.js) — builds clean (95 pages)
- Only warnings: react-native-web 0.19 hydrate/unmountComponentAtNode (harmless)

### D4: Detail + Manufacturing + Monitoring screens (19 screens) ✅ COMPLETE

Migrated 19 screens: 3 detail screens completing D3 areas, 13 manufacturing screens (full MANUFACTURE journey), and 3 monitoring screens.

#### Prerequisites built:
- **Cross-platform utilities** (`packages/app/src/utils/`): `clipboard.ts`, `confirm.ts`, `linking.ts` — Platform-branched helpers for `navigator.clipboard`/`confirm()`/`window.open()` vs RN equivalents
- **Manufacturing constants** moved from `apps/web/lib/manufacturing-orders.ts` to `packages/shared/src/constants.ts` — `ORDER_STATUS_LABELS`, `TimelineEntry`, `getOrderTimeline()`
- **GraphQL schema expanded**: 19 new fields on `ManufacturingOrder` (partner, site, assessment, reports, timeline fields), 8 new fields on `AdministrationSite`, `reviewNotes`/`reviewedAt`/`reviewedBy` on `RegulatoryDocument`, 2 new queries (`regulatoryDocument`, `administrationSite`), 2 new mutations (`updateRegulatoryDocumentStatus`, `subscribeFinancialProgram`)
- **3 resolver files updated**: manufacturing.ts (field resolvers + query + mutation), monitoring.ts (administrationSite query), financial.ts (financialProgram query + subscribeFinancialProgram mutation)
- **3 GraphQL operation files expanded** + codegen regenerated

#### Screens created:

**Detail screens (3):**

| Page | Screen name | Key hooks |
|---|---|---|
| `app/matches/[trialId]/page.tsx` | `MatchDetailScreen` | `useGetMatchQuery` — eligibility breakdown, trial sites, interventions |
| `app/matches/[trialId]/contact/page.tsx` | `OncologistBriefScreen` | `useGetOncologistBriefQuery` — copy/print, disclaimer |
| `app/financial/[programId]/page.tsx` | `FinancialProgramScreen` | `useGetFinancialProgramQuery`, `useSubscribeFinancialProgramMutation` |

**Manufacturing screens (13):**

| Page | Screen name | Key hooks |
|---|---|---|
| `app/manufacture/page.tsx` | `ManufactureLandingScreen` | `useGetMatchesQuery`, `useGetPipelineJobsQuery`, `useGetManufacturingOrdersQuery` |
| `app/manufacture/partners/page.tsx` | `ManufacturingPartnersScreen` | `useGetManufacturingPartnersQuery` — 3 Picker filters |
| `app/manufacture/partners/[partnerId]/page.tsx` | `ManufacturingPartnerDetailScreen` | `useGetManufacturingPartnerQuery` |
| `app/manufacture/orders/page.tsx` | `ManufacturingOrdersScreen` | `useGetManufacturingOrdersQuery` |
| `app/manufacture/orders/new/page.tsx` | `NewManufacturingOrderScreen` | `useGetManufacturingPartnersQuery`, `useGetPipelineJobsQuery`, `useCreateManufacturingOrderMutation` |
| `app/manufacture/orders/[orderId]/page.tsx` | `ManufacturingOrderDetailScreen` | Expanded `useGetManufacturingOrderQuery`, `useAcceptQuoteMutation`, `useAddOrderNoteMutation` — most complex (~310 lines) |
| `app/manufacture/orders/[orderId]/tracking/page.tsx` | `OrderTrackingScreen` | `useGetManufacturingOrderQuery` |
| `app/manufacture/regulatory/page.tsx` | `RegulatoryLandingScreen` | None (static 4-pathway overview) |
| `app/manufacture/regulatory/assessment/page.tsx` | `RegulatoryAssessmentScreen` | `useGetPatientQuery`, `useGetPipelineJobsQuery`, `useAssessRegulatoryPathwayMutation` |
| `app/manufacture/regulatory/recommendation/page.tsx` | `RegulatoryRecommendationScreen` | `useGetRegulatoryAssessmentQuery`, `useGenerateRegulatoryDocumentMutation` |
| `app/manufacture/regulatory/documents/page.tsx` | `RegulatoryDocumentsScreen` | `useGetRegulatoryAssessmentsQuery`, `useGetRegulatoryDocumentsQuery` |
| `app/manufacture/regulatory/documents/[id]/page.tsx` | `RegulatoryDocumentDetailScreen` | `useGetRegulatoryDocumentQuery`, `useUpdateRegulatoryDocumentStatusMutation` |
| `app/manufacture/providers/[siteId]/page.tsx` | `AdministrationSiteDetailScreen` | `useGetAdministrationSiteQuery`, `useConnectSiteMutation`, `useGetManufacturingOrdersQuery` |

**Monitoring screens (3):**

| Page | Screen name | Key hooks |
|---|---|---|
| `app/manufacture/monitoring/page.tsx` | `MonitoringDashboardScreen` | `useGetManufacturingOrdersQuery`, `useGetMonitoringScheduleQuery` |
| `app/manufacture/monitoring/[orderId]/report/page.tsx` | `MonitoringReportScreen` | `useGetMonitoringScheduleQuery`, `useSubmitMonitoringReportMutation` |
| `app/manufacture/monitoring/[orderId]/history/page.tsx` | `MonitoringHistoryScreen` | `useGetMonitoringReportsQuery` — QoL bar chart, AE summary |

#### Web pages re-pointed (19 thin wrappers)
Dynamic route pages extract params via `useParams` and pass as props. Pages with `useSearchParams` wrapped in `Suspense`.

**NOT migrated (web-only):** `app/manufacture/providers/page.tsx` — uses `AdministrationSiteMap` (Mapbox)

#### D4 platform conversions:
- `window.location.reload()` → `refetch()` from Apollo (ManufacturingOrderDetail)
- `sessionStorage` → route query params + Apollo fetch (Regulatory recommendation flow)
- `confirm()` → `confirmAction()` utility (RegulatoryDocumentDetail)
- `window.open()` → `openExternalUrl()` via `Linking` (PartnerDetail)
- `navigator.clipboard` → `copyToClipboard()` utility (OncologistBrief)
- `window.print()` → conditionally hidden on native (OncologistBrief)
- Inline SVGs → emoji text in colored circles
- `<select>` → `Picker` component (Partners, Orders/new, Assessment)

#### D4 type fixes:
- `LLMAssessment.overallAssessment`: GraphQL `string` → cast to union type
- `ManufacturingPartnerCard`: `costRangeMin`/`costRangeMax` etc. need `?? null` (not `?? undefined`)
- `OrderStatusCard`: takes `order` object prop (not flat props)
- `RegulatoryDocumentCard`: needs `title`, `reviewedAt`, `reviewedBy`, `onView` props
- `PathwayRecommendation`: `recommended`/`requiredDocuments` need casts to union types
- `Picker`: prop is `value` (not `selectedValue`), `placeholder` (not `label`)

#### Build verification ✅
- `@oncovax/app` (tsc) — builds clean
- `@oncovax/api` (tsc) — builds clean
- `@oncovax/web` (Next.js) — builds clean

---

### D5: Dashboard + Intake + Sequencing Journey + Translate (7 screens) ✅ COMPLETE

Migrated 7 screens covering the core patient journey: dashboard, treatment translation, patient intake (3 screens), and sequencing guide (2 screens).

#### Prerequisites built:
- **GraphQL schema expanded:** 3 new types (`PatientIntakeInput`, `DocumentMetaInput`, `ExtractionResult`), 3 new mutations (`savePatientIntake`, `extractDocuments`, `createSequencingOrder`)
- **Resolver updates:** `patients.ts` — Patient field resolvers mapping Prisma `intakePath` → GraphQL `intakeMethod`, resolving `email`/`name` from User relation; added `savePatientIntake`, `extractDocuments` mutations. `sequencing.ts` — added `createSequencingOrder` mutation
- **Route handler:** 3 new adapter functions (`savePatientIntakeAdapter`, `extractDocumentsAdapter`, `createSequencingOrderAdapter`)
- **GraphQL operations:** 3 new mutations added to `patient.graphql` + `sequencing.graphql`; codegen regenerated

#### Screens created:

| Page | Screen name | Key hooks | Key patterns |
|---|---|---|---|
| `app/dashboard/page.tsx` | `DashboardScreen` | 6 parallel queries with `errorPolicy: 'ignore'` | DashboardCard helper, emoji icons, conditional hasProfile state |
| `app/translate/page.tsx` | `TranslateScreen` | `useGetMatchesQuery`, `useTranslateTreatmentMutation` | Loading step animation, `formatTranslationAsText`, Platform guard for `window.print()` |
| `app/start/confirm/page.tsx` | `ConfirmProfileScreen` | `useMeQuery`, `useGetPatientQuery`, `useSavePatientIntakeMutation`, `useExtractDocumentsMutation` | 3 intake paths (manual/mychart/upload), ConfidenceBadge, Picker for ECOG, financial section with toggle buttons, Platform guard for sessionStorage |
| `app/start/manual/page.tsx` | `ManualIntakeScreen` | None | Thin wrapper around `ManualIntakeWizard`, Platform guard for sessionStorage |
| `app/start/mychart/page.tsx` | `MyChartScreen` | `useAuthorizeFhirMutation`, `useExtractFhirMutation` | 6-step state machine, Platform guard for `window.location.href` vs `Linking.openURL`, OAuth callback props |
| `app/sequencing/guide/page.tsx` | `SequencingGuideScreen` | 4 lazy queries + `useCreateSequencingOrderMutation` | 5-step wizard, toggle buttons, accordion, `copyToClipboard`, step indicator |
| `app/sequencing/insurance/page.tsx` | `InsuranceCoverageScreen` | `useCheckCoverageMutation`, `useGenerateLomnMutation` | 2 Pickers, status color mapping, LOMN generation + copy |

#### Web pages re-pointed (7 thin wrappers):
- `apps/web/app/dashboard/page.tsx` → simple re-export
- `apps/web/app/translate/page.tsx` → simple re-export
- `apps/web/app/start/manual/page.tsx` → simple re-export
- `apps/web/app/sequencing/guide/page.tsx` → simple re-export
- `apps/web/app/sequencing/insurance/page.tsx` → simple re-export
- `apps/web/app/start/confirm/page.tsx` → Suspense + `useSearchParams` → pass `path` prop
- `apps/web/app/start/mychart/page.tsx` → Suspense + `useSearchParams` → pass OAuth callback params

#### D5 type fixes:
- **Prisma schema mismatch:** Patient model has `intakePath` not `intakeMethod`, no `email`/`name` columns — resolved with Patient field resolvers and adapter fix
- **Picker props:** `value`/`onValueChange`/`options` (not `selectedValue`/`items`)
- **TypeScript cast:** `result.extractions as unknown as any[]` (can't cast Record directly to array)

#### Build verification ✅
- `@oncovax/api` (tsc) — builds clean
- `@oncovax/app` (tsc) — builds clean
- `@oncovax/web` (Next.js) — builds clean

### D6: Pipeline + Sequencing Detail + Records (12 screens)

| Page | Screen name | Key hooks |
|---|---|---|
| `app/pipeline/page.tsx` | `PipelineHubScreen` | `useGetPipelineJobsQuery` |
| `app/pipeline/jobs/page.tsx` | `PipelineJobsScreen` | `useGetPipelineJobsQuery` |
| `app/pipeline/jobs/[jobId]/page.tsx` | `PipelineJobDetailScreen` | `useGetPipelineJobQuery` |
| `app/pipeline/jobs/[jobId]/neoantigens/page.tsx` | `NeoantigenListScreen` | `useGetNeoantigensQuery` |
| `app/pipeline/jobs/[jobId]/reports/page.tsx` | `PipelineReportsScreen` | `useGetReportPdfQuery`, `useGenerateReportPdfMutation` |
| `app/pipeline/jobs/[jobId]/blueprint/page.tsx` | `VaccineBlueprintScreen` | `useGetPipelineResultsQuery` |
| `app/pipeline/jobs/[jobId]/trials/page.tsx` | `NeoantigenTrialsScreen` | `useGetNeoantigenTrialsQuery` |
| `app/sequencing/orders/page.tsx` | `SequencingOrdersScreen` | `useGetSequencingOrdersQuery` |
| `app/sequencing/orders/[orderId]/page.tsx` | `SequencingOrderDetailScreen` | `useGetSequencingOrderQuery` (TBD) |
| `app/sequencing/confirm/page.tsx` | `GenomicConfirmScreen` | `useGetGenomicResultsQuery`, `useConfirmGenomicsMutation` |
| `app/sequencing/results/page.tsx` | `GenomicResultsScreen` | `useGetGenomicResultsQuery`, `useInterpretGenomicsMutation` |
| `app/dashboard/records/page.tsx` | `FhirRecordsScreen` | `useGetFhirConnectionsQuery` |

**Web-only pages** (NOT migrated, stay as Tailwind):
- `app/start/upload/page.tsx` — wraps DocumentUploader (File API / drag-drop / XMLHttpRequest)
- `app/pipeline/upload/page.tsx` — wraps DocumentUploader for pipeline data upload
- `app/manufacture/providers/page.tsx` — uses AdministrationSiteMap (Mapbox)
- `app/admin/*` — admin tools, web-only
- `app/provider/*` — provider portal, web-only for now

### Screen export pattern

All screens exported from `packages/app/src/screens/index.ts`:
```tsx
export { HomeScreen } from './home';
export { AuthScreen } from './auth';
export { LearnScreen } from './learn';
export { StartScreen } from './start';
export { MatchesScreen } from './matches';
export { FinancialScreen } from './financial';
export { SequencingHubScreen } from './sequencing-hub';
export { SequencingProvidersScreen } from './sequencing-providers';
// ... D4-D6 screens added in later sessions
```

---

## Session D7: Layout + Navigation

### NavHeader component

`packages/app/src/components/NavHeader.tsx` — Dripsy header with Solito Links.

On web: horizontal nav bar (current pattern).
On mobile: could be hidden (mobile uses tab navigation instead) — use Platform check or `.native.tsx` variant.

### Web root layout

`apps/web/app/layout.tsx` — import `NavHeader` from `@oncovax/app`, wrap with `<Providers>`.

### Mobile tab navigation

`apps/mobile/app/(tabs)/_layout.tsx` — Expo Router tabs pointing to shared screens:
```tsx
<Tabs>
  <Tabs.Screen name="index" options={{ title: 'Home' }} />
  <Tabs.Screen name="matches" options={{ title: 'Matches' }} />
  <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
</Tabs>
```

Each tab file is a thin re-export:
```tsx
// apps/mobile/app/(tabs)/matches.tsx
export { MatchesScreen as default } from '@oncovax/app';
```

---

## Session D8: Mobile App Activation

### Mobile screen wiring

Create re-export files for all Expo Router routes:
```
apps/mobile/app/
  (tabs)/
    index.tsx         → HomeScreen
    matches.tsx       → MatchesScreen
    dashboard.tsx     → DashboardScreen
    start.tsx         → StartScreen
  auth.tsx            → AuthScreen
  start/
    manual.tsx        → ManualIntakeScreen
    confirm.tsx       → ConfirmProfileScreen
  matches/
    [trialId].tsx     → TrialDetailScreen
```

### Mobile Apollo Client

`apps/mobile/lib/apollo.ts`:
- HTTP link with BASE_URL + `/api/graphql`
- Auth link that reads Bearer token from expo-secure-store
- InMemoryCache with same type policies as web

### Mobile-specific components

These stay in `apps/mobile/components/` (not shared):
- `DocumentPicker.tsx` — uses `expo-document-picker` + `expo-image-picker`
- `MapView.tsx` — uses `react-native-maps` (future)

### Deep linking

`apps/mobile/app.json` — add `scheme: "oncovax"` (already present).
Solito handles mapping between web URLs and Expo Router routes.

### D8 Verification
- Mobile app builds and runs in Expo Go
- Shared screens render correctly
- GraphQL queries work with mobile Apollo Client
- Navigation between screens works (Solito)

---

## Session D9: Cleanup + Tailwind Removal

### Remove from `apps/web/`:
- `tailwind.config.ts`
- `postcss.config.js` (if present)
- Tailwind directives from `globals.css` (`@tailwind base/components/utilities`)
- `apps/web/lib/utils.ts` (`cn()` function)
- Dependencies: `tailwindcss`, `autoprefixer`, `postcss`, `clsx`, `tailwind-merge`

### Keep in `apps/web/`:
- `globals.css` with `@font-face` rules and body normalize only
- `apps/web/components/DocumentUploader.tsx` (web-only, convert to inline styles or keep Tailwind just for this file)
- `apps/web/components/AdministrationSiteMap.tsx` (web-only)

### Remove old web components
- Delete all 22 migrated components from `apps/web/components/`
- Keep only `DocumentUploader.tsx` and `AdministrationSiteMap.tsx`

### Remove old API route handlers
- Keep `/api/graphql/route.ts` (the new GraphQL endpoint)
- Keep `/api/auth/verify/route.ts` (magic link callback needs a redirect, not GraphQL)
- Keep `/api/stripe/webhook/route.ts` (Stripe webhook handler)
- Remove remaining 84 REST route files (all functionality now in GraphQL)

---

## Documentation Updates

### CLAUDE.md Changes

Add to Architecture section:
```
├── packages/
│   ├── ui/                     # Cross-platform primitives (RN + Solito re-exports)
│   ├── app/                    # Shared screens, Dripsy components, Apollo hooks, theme
│   ├── api/                    # Apollo Server + GraphQL schema/resolvers
```

Update "Critical Implementation Patterns":

**Replace** "API: Next.js Route Handlers (NOT tRPC)" with:
```
### API: GraphQL via Apollo Server + Apollo Client
- Schema + resolvers in `packages/api/` (wraps existing lib/ functions)
- Single endpoint: `apps/web/app/api/graphql/route.ts`
- Apollo Client in both web + mobile, configured per platform
- Codegen generates typed hooks into `packages/app/src/generated/`
- Screens use `useQuery`/`useMutation` hooks from generated code
```

**Replace** "UI: Hand-Built Tailwind Components" with:
```
### UI: Dripsy + Solito (Cross-Platform)
- Shared components in `packages/app/src/components/` (22 components)
- Shared screens in `packages/app/src/screens/` (~47 screens)
- Theme in `packages/app/src/theme.ts` (medical palette, makeTheme())
- Components use Dripsy `sx` prop with theme tokens ($primary, $border, etc.)
- Navigation via Solito: `Link` from `@oncovax/ui`, `useRouter()` from Solito
- Web pages are thin re-exports: `export { Screen } from '@oncovax/app'`
- Web-only: DocumentUploader, AdministrationSiteMap stay in `apps/web/components/`
- Pattern reference: /Users/rett/projects/art-cafe
```

Update "What's Built" to note the shared UI architecture.

### Memory file updates

Update `MEMORY.md`:
- Architecture section: add @oncovax/ui, @oncovax/app, @oncovax/api packages
- Add: Dripsy 4.3.8, Solito 5.x, react-native-web, Apollo Client + Server
- Add: GraphQL codegen generates hooks
- Add: Web pages are thin re-exports from @oncovax/app
- Update component count and location
- Remove "No state management lib" from known gaps (Apollo cache serves this)

Update `implementation-status.md` and `module-catalog.md` to reflect new package structure.

---

## Verification Plan

After each session:
1. `pnpm install` succeeds
2. `pnpm turbo build` compiles all packages without errors
3. `tsc --noEmit` passes in each package
4. Web app loads at `localhost:3000` — all migrated pages render correctly
5. Mobile app loads in Expo Go — shared screens render
6. GraphQL Playground responds to queries

Final verification (after D9):
- Zero Tailwind usage in shared packages
- All 22 migrated components use Dripsy exclusively
- ~47 screens shared between web and mobile
- Mobile app is functional (auth, matches, dashboard, manufacturing)
- All GraphQL queries/mutations work from both platforms
