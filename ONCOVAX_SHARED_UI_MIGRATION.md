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

## Session D2: GraphQL Schema + Resolvers

Build out `packages/api/` with full schema covering existing functionality.

### Schema types (mapped from `packages/shared/src/types.ts`):
- `Patient`, `PatientProfile`, `SessionData`
- `Trial`, `Match`, `MatchBreakdown`, `LLMAssessment`
- `Document`, `DocumentExtraction`
- `FinancialProgram`, `FinancialEligibility`
- `SequencingProvider`, `SequencingOrder`, `InsuranceCoverage`
- `GenomicResult`, `GenomicInterpretation`
- `PipelineJob`, `NeoantigenCandidate`
- `ManufacturingPartner`, `ManufacturingOrder`, `RegulatoryDocument`
- `AdministrationSite`, `MonitoringReport`

### Resolvers wrap existing lib/ functions:

| Resolver file | Wraps existing lib/ | Key queries/mutations |
|---|---|---|
| `auth.ts` | `lib/session.ts`, `lib/redis.ts` | `requestMagicLink`, `verifyToken`, `logout`, `me` |
| `patients.ts` | `lib/db.ts` (prisma) | `patient`, `updatePatient`, `createPatient` |
| `matches.ts` | `lib/matcher.ts`, `lib/eligibility-parser.ts` | `matches`, `match`, `generateMatches`, `updateMatchStatus` |
| `trials.ts` | `lib/clinicaltrials.ts`, `lib/trial-sync.ts` | `trials`, `trial`, `syncTrials` |
| `documents.ts` | `lib/extraction.ts`, `lib/s3.ts` | `documents`, `requestUploadUrl`, `extractDocument` |
| `financial.ts` | `lib/financial-matcher.ts` | `financialPrograms`, `matchFinancialPrograms` |
| `sequencing.ts` | `lib/sequencing-recommendation.ts`, `lib/coverage.ts` | `sequencingProviders`, `sequencingOrders`, `checkCoverage` |
| `genomics.ts` | `lib/genomic-extraction.ts`, `lib/genomic-interpreter.ts` | `genomicResults`, `extractGenomics`, `interpretGenomics` |
| `pipeline.ts` | `lib/nats.ts`, `lib/report-generator.ts` | `pipelineJobs`, `pipelineJob`, `submitPipelineJob`, `generateReport` |
| `manufacturing.ts` | `lib/manufacturing-orders.ts`, `lib/pathway-advisor.ts`, `lib/regulatory-documents.ts` | `partners`, `orders`, `createOrder`, `assessPathway`, `generateDocument` |
| `monitoring.ts` | `lib/monitoring.ts`, `lib/providers.ts` | `administrationSites`, `monitoringReports`, `submitReport` |

### Apollo Client setup

**`packages/app/src/lib/apollo.ts`** — shared cache config, type policies

**`apps/web/lib/apollo.ts`** — web client with `http://localhost:3000/api/graphql` link

**`apps/mobile/lib/apollo.ts`** — mobile client with `BASE_URL/api/graphql` link + auth header from expo-secure-store

### Codegen

**`packages/app/codegen.ts`** — generates types + hooks into `packages/app/src/generated/`

Run: `pnpm --filter @oncovax/app codegen`

### D2 Verification
- GraphQL Playground at `localhost:3000/api/graphql` works
- Sample queries return real data from database
- Codegen produces typed hooks

---

## Sessions D3-D6: Screen Migration (56 pages → shared screens)

### Pattern for each page:

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
import { useMatchesQuery, useUpdateMatchStatusMutation } from '../generated/graphql';
import { MatchCard } from '../components';

export function MatchesScreen() {
  const { data, loading, refetch } = useMatchesQuery();
  const [updateStatus] = useUpdateMatchStatusMutation();
  // ... render with Dripsy
}
```

**After — web page** (`apps/web/app/matches/page.tsx`):
```tsx
'use client';
export { MatchesScreen as default } from '@oncovax/app';
```

### D3: Simple + List screens (9 screens)

| Page | Lines | Screen name |
|---|---|---|
| `app/page.tsx` | 29 | `HomeScreen` |
| `app/auth/page.tsx` | 79 | `AuthScreen` |
| `app/learn/page.tsx` | ~50 | `LearnScreen` |
| `app/start/page.tsx` | 41 | `StartScreen` |
| `app/start/confirm/page.tsx` | ~60 | `ConfirmProfileScreen` |
| `app/matches/page.tsx` | 191 | `MatchesScreen` |
| `app/financial/page.tsx` | ~150 | `FinancialScreen` |
| `app/sequencing/page.tsx` | ~80 | `SequencingHubScreen` |
| `app/sequencing/providers/page.tsx` | ~120 | `SequencingProvidersScreen` |

### D4: Detail + complex screens (10 screens)

| Page | Screen name |
|---|---|
| `app/dashboard/page.tsx` | `DashboardScreen` |
| `app/matches/[trialId]/page.tsx` | `TrialDetailScreen` |
| `app/matches/[trialId]/contact/page.tsx` | `OncologistBriefScreen` |
| `app/translate/page.tsx` | `TranslateScreen` |
| `app/financial/[programId]/page.tsx` | `FinancialDetailScreen` |
| `app/start/manual/page.tsx` | `ManualIntakeScreen` |
| `app/start/mychart/page.tsx` | `MyChartScreen` |
| `app/sequencing/guide/page.tsx` | `SequencingGuideScreen` |
| `app/sequencing/insurance/page.tsx` | `InsuranceCoverageScreen` |
| `app/sequencing/results/page.tsx` | `GenomicResultsScreen` |

### D5: Manufacturing + monitoring screens (15 screens)

All pages under `app/manufacture/` and `app/provider/`.

### D6: Pipeline + sequencing + remaining screens (13 screens)

All pages under `app/pipeline/`, remaining `app/sequencing/`, `app/dashboard/records/`, `app/admin/`.

**Web-only pages** (NOT migrated, stay as Tailwind):
- `app/start/upload/page.tsx` — wraps DocumentUploader (web file APIs)
- `app/admin/*` — admin tools, web-only
- `app/provider/*` — provider portal, web-only for now

### Screen export pattern

All screens exported from `packages/app/src/screens/index.ts`:
```tsx
export { HomeScreen } from './home';
export { AuthScreen } from './auth';
export { MatchesScreen } from './matches';
// ... etc
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
