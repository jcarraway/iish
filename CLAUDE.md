# OncoVax — Project Knowledge Base

## What This Is

Personalized cancer vaccine intelligence platform. Monorepo covering the full patient journey: risk assessment → diagnosis → trial matching → treatment translation → genomic sequencing → neoantigen prediction → vaccine design → manufacturing coordination → survivorship care → recurrence detection.

## Architecture (As-Built)

```
oncovax/
├── apps/
│   ├── web/                    # Next.js 15.0.0, React 19.0.0, Tailwind CSS 3.4
│   │   ├── app/                # App Router — pages + 87 API route files
│   │   ├── components/         # 24 React components (web-only, Tailwind)
│   │   └── lib/                # 40 library files (see below)
│   └── mobile/                 # Expo SDK 54, React Native 0.76.9, Dripsy + Solito
│       └── lib/apollo.ts       # Apollo Client with expo-secure-store auth
├── docker-compose.yml          # Local dev: postgres:15-alpine + redis:7-alpine
├── packages/
│   ├── ui/                     # Thin RN + Solito re-exports (@oncovax/ui)
│   ├── app/                    # Shared screens, 22 Dripsy components, theme (@oncovax/app)
│   │   └── src/{components,providers,theme,index}.ts
│   ├── api/                    # Apollo Server schema + resolvers (@oncovax/api)
│   │   └── src/{schema,resolvers,context,index}.ts
│   ├── db/                     # Prisma 7 + PostgreSQL (23 models)
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
└── scripts/                    # 8 seed/sync scripts
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

### UI: Dual Component Sets (Migration in Progress)
- **Web (original):** 24 Tailwind components in `apps/web/components/` — still used by web pages
- **Shared (new):** 22 Dripsy components in `packages/app/src/components/` — cross-platform ready
- Both sets coexist until screen migration (D3-D6) re-points web pages to shared components
- Shared components use Dripsy `sx` prop with theme tokens, Solito `Link` for navigation
- Web-only components (not shared): `DocumentUploader` (File API), `AdministrationSiteMap` (Mapbox)
- Custom `Picker` component replaces `<select>` cross-platform (web: native select, native: Modal list)
- Has `cn()` utility (clsx + tailwind-merge) in `apps/web/lib/utils.ts` (used by web components only)

### Prisma 7 (Critical Differences from Prisma 5/6)
- No `url` in `datasource` block — use `prisma.config.ts` with `defineConfig`
- Generator: `prisma-client` (not `prisma-client-js`), `output` field required
- Client needs driver adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`
- All models use `@map("snake_case")` columns and `@@map("table_names")`

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
- Used for: document extraction, eligibility parsing, trial matching, treatment translation, genomic interpretation, report generation, regulatory document drafting

## What's Built (Phases 1-4)

**Phase 1 — MATCH:** Auth, patient profiles (3 intake paths), document ingestion (Claude Vision), trial matching (ClinicalTrials.gov sync + eligibility parsing + multi-dimension scoring), Treatment Translator (two-step Claude pipeline), Oncologist Brief, Financial Assistance Finder, MyChart/FHIR (SMART on FHIR OAuth), Stripe billing.

**Phase 2 — SEQUENCE:** Sequencing provider directory, test/sequencing recommendation engine, insurance coverage checking (CPT codes), LOMN generation, sequencing journey wizard (5 steps), genomic results extraction + interpretation.

**Phase 3 — PREDICT:** 8-step neoantigen pipeline with DAG orchestration via NATS JetStream. Rust services (alignment, variant-caller, hla-typer) + TypeScript (remaining 5 steps). AWS Batch dispatch with 2 compute tiers. PDF report generation (@react-pdf/renderer) + interactive UI.

**Phase 4 — MANUFACTURE (complete):**
- *M1:* Manufacturing partner directory (15 CDMOs seeded across 3 tiers), regulatory pathway advisor (decision tree + 8 Claude-powered document templates), 3 Prisma models (ManufacturingPartner, RegulatoryPathwayAssessment, RegulatoryDocument), 10 API routes (4 manufacturing + 6 regulatory), 3 components, 8 pages under `/manufacture/`.
- *M2:* Order workflow (9-stage lifecycle: inquiry → quote → production → QC → shipping → administration), provider network (12 administration sites seeded, proximity search with Haversine distance), post-administration monitoring (8-timepoint schedule, AE escalation checking), provider portal. 3 Prisma models (ManufacturingOrder, AdministrationSite, PostAdministrationReport), 11 API routes, 7 components, 12 pages, 3 lib files. Dashboard + nav integration.

**Cross-Platform Foundation (D0-D1):**
- *D0:* `packages/ui/` (RN + Solito re-exports), `packages/app/` (Dripsy theme, providers, Apollo cache config), `packages/api/` (Apollo Server schema + resolvers wrapping lib/). Web + mobile configured with Apollo Client, DripsyProvider, react-native-web.
- *D1:* 22 of 24 components migrated from Tailwind to Dripsy in `packages/app/src/components/`. Custom cross-platform Picker. `ADVERSE_EVENT_OPTIONS` moved to shared constants. Web-only: DocumentUploader, AdministrationSiteMap. Both old (web) and new (shared) components coexist until D3-D6 screen migration.

## What's NOT Built Yet

**Phase 5 — SURVIVE** (Sessions S1-S8): Survivorship care plans, surveillance scheduling, symptom journal, lifestyle engine, psychosocial support, ctDNA monitoring, recurrence cascade.

**Cross-cutting:** INTEL (research intelligence), LEARN (educational content/SEO), VISUAL (30 visualizations), CARE (care commerce), COOL (cold capping), ENGINE (opportunity detection).

**Access gap:** FERTILITY, SECOND, LOGISTICS, PALLIATIVE, ADVOCATE, PEERS.

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
- **No state management lib** — web uses local useState + useEffect + fetch (Apollo Client available but screens not yet migrated)
- **Mobile is skeleton** — providers configured but screens are placeholders (shared components ready, screen migration pending D3-D6)
- **No notification system** — only magic link email via Resend
