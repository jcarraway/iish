# IISH / OncoVax — Unified Platform Roadmap

**Last Updated:** March 29, 2026

---

## Platform Overview

Women's cancer care + endocrine health risk intelligence platform. Full patient journey from pre-diagnosis prevention through survivorship, plus expanding into PCOS, endometriosis, and thyroid health via shared environmental exposure infrastructure.

---

## Build Status Summary

| Phase | Module | Sessions | Status |
|-------|--------|----------|--------|
| **Phase 1** | MATCH (trial matching, intake, translator, financial) | S1-S6 | ✅ Complete |
| **Phase 2** | SEQUENCE (sequencing navigator) | S7-S9 | ✅ Complete |
| **Phase 3** | PREDICT (neoantigen pipeline, Rust) | S10-S15 | ✅ Complete |
| **Phase 4** | MANUFACTURE (manufacturing network) | M1-M2 | ✅ Complete |
| **Phase 5** | SURVIVE (survivorship, recurrence, lifestyle) | S1-S8 | ✅ Complete |
| **Access Gaps** | FERTILITY, SECOND, LOGISTICS, PALLIATIVE, ADVOCATE, PEERS | 12 sessions | ✅ Complete |
| **Content** | LEARN (educational), INTEL (research intelligence) | Multiple | ✅ Complete |
| **Prevention** | PREVENT foundation (P0-1 to P0-7) | 7 sessions | ✅ Complete |
| **Prevention** | PREVENT PRS engine (P0-8) | 1 session | ✅ Complete |
| **Prevention** | PREVENT composite risk model (P0-9) | 1 session | ✅ Complete |
| **Prevention** | PREVENT expansion (P0-10 to P0-EX6) | 14 sessions | 🔲 Not started |
| **Cross-cutting** | CARE, COOL, ENGINE | TBD | 🔲 Not started |

**Total built:** ~52+ sessions, 64 Prisma models (+2 fields), 65 lib files, 85 API routes, 122 shared screens, web + mobile
**Total remaining:** 14 PREVENT expansion sessions + CARE/COOL/ENGINE

---

## What's Built — Detailed

### Core Cancer Platform (Phases 1-5)

```
✅ Phase 1 — MATCH
   ├── 3 intake paths (document upload, MyChart FHIR, manual entry)
   ├── ClinicalTrials.gov sync + eligibility parser
   ├── AI trial matching engine
   ├── Treatment Translator (Claude-powered, 8th grade reading level)
   ├── Financial Assistance Finder (program directory + matching)
   ├── Oncologist Brief Generator
   └── Preventive Trial Matcher + family referral flow

✅ Phase 2 — SEQUENCE
   ├── Sequencing provider directory + insurance coverage engine
   ├── Sequencing journey wizard
   └── Results interpretation + genomic trial matching

✅ Phase 3 — PREDICT
   ├── Rust neoantigen pipeline (3 crates)
   ├── Variant calling + HLA typing
   ├── Neoantigen prediction + ranking (Python ML)
   ├── AlphaFold integration + mRNA designer
   ├── Report generation + pipeline UI
   └── NATS JetStream orchestration

✅ Phase 4 — MANUFACTURE
   ├── Manufacturing partner directory
   ├── Regulatory pathway navigator
   └── Order workflow + tracking

✅ Phase 5 — SURVIVE
   ├── Personalized survivorship care plan (Claude-generated)
   ├── Recurrence monitoring + ctDNA tracking
   ├── Late effects tracker
   ├── Evidence-based lifestyle engine (exercise, nutrition, alcohol, environment, sleep)
   ├── Psychosocial support + fear-of-recurrence management
   ├── Care team coordination hub
   ├── Symptom/wellness journal (60-second entry)
   ├── Notification system (email)
   └── Recurrence pathway (state machine across all modules)
```

### Access Gap Modules (All Complete)

```
✅ FERTILITY — Assessment + preservation options + provider directory
✅ SECOND OPINION — Trigger system + center directory + record assembly
✅ LOGISTICS — Trial logistics assessment + assistance matching + tracking
✅ PALLIATIVE — ESAS assessment + provider directory + advance care planning
✅ ADVOCATE — Insurance denial tracking + appeal generator + rights education
✅ PEERS — Deterministic peer matching + 6-module training + messaging + safety
```

### Content & Intelligence

```
✅ LEARN — Educational content engine + SEO + article personalization
✅ INTEL — Research intelligence stream + landscape monitoring
✅ VISUAL — Canvas 2D visualization framework + 31 interactive science scenes
```

### Prevention Foundation (P0-1 through P0-7)

```
✅ P0-1 — Route structure + onboarding questionnaire + PreventProfile model
✅ P0-2 — Risk assessment model + Gail model implementation + basic risk display
✅ P0-3 — Risk communication UI (risk gauge, trajectory chart, modifiable factors)
✅ P0-4 — Family history deep-dive + monogenic variant display + genetic counselor referral
✅ P0-5 — NCCN screening planner + calendar integration
✅ P0-6 — Chemoprevention navigator (USPSTF eligibility, medication comparison)
✅ P0-7 — Genotype parser (23andMe/AncestryDNA/VCF) + pathogenic variant extraction + PRS SNP dosage extraction
✅ P0-8 — PRS calculation engine (raw score → standardized → percentile → risk multiplier, ancestry calibration, confidence scoring)
✅ P0-9 — Composite risk model (Gail × PRS × monogenic variants, BRCA penetrance override, auto-trigger, model versioning)
```

---

## What's Next — PREVENT Expansion to Women's Endocrine Health

### Priority 1: Complete Genomic Layer (1 session remaining)

| ID | Session | Input | Output | Est. Time |
|----|---------|-------|--------|-----------|
| P0-10 | Ancestry Confidence + Partner Testing | Composite risk engine | Ancestry disclosure UI, partner testing comparison table, genetic counselor directory integration | 2 hrs |

### Priority 2: Environmental Intelligence — Condition Agnostic (5 sessions)

| ID | Session | Input | Output | Est. Time |
|----|---------|-------|--------|-----------|
| P0-11 | Water Quality Dashboard | Zip code | `water-quality.ts`: EWG/EPA API integration, PFAS flagging, filtration recommendations. `/prevent/exposures/water` page. Auto-enrich LocationHistory. | 3-4 hrs |
| P0-12 | Product Scanner | Barcode / product name | `product-scanner.ts`: Open Food Facts API + EDC reference table (~100 compounds), condition-specific risk annotation, alternatives. `ProductScan` model. `/prevent/exposures/products` page. | 3-4 hrs |
| P0-13 | Home Environment Checklist | User questionnaire | `home-environment.ts`: cookware/storage/filtration/cleaning assessment, scored + actionable swaps. `/prevent/exposures/home` page. | 2-3 hrs |
| P0-14 | Biomarker Panel Integration | Lab results (manual entry) | `biomarker-interpreter.ts`: NHANES percentile comparison, condition-specific annotation, source-reduction recs. `BiomarkerResult` model. `/prevent/exposures/testing` page. | 3 hrs |
| P0-15 | Composite Environmental Score | Water + products + home + biomarkers | `environmental-score.ts`: weighted composite (0-100), trend visualization, integration into multi-condition risk engine. `/prevent/exposures` dashboard. | 2-3 hrs |

### Priority 3: Condition Expansion (4 sessions)

| ID | Session | Scope | New Models | Est. Time |
|----|---------|-------|-----------|-----------|
| P0-EX1 | PCOS Risk Screening + Profile | Rotterdam criteria, HOMA-IR, lifestyle recs, onboarding extension | PcosProfile, PcosSymptomLog | 3-4 hrs |
| P0-EX2 | PCOS Symptom Tracker + Metabolic Dashboard | Daily logging, cycle tracking, metabolic lab entry, trend visualization | (uses P0-EX1 models) | 3-4 hrs |
| P0-EX3 | Endometriosis Module | Pain diary, symptom screening, Claude provider report PDF, specialist directory | EndoProfile, EndoPainLog | 3-4 hrs |
| P0-EX4 | Thyroid Health Module | Risk screening, lab tracking (TSH/T4/T3/antibodies), EDC connection | ThyroidProfile, ThyroidLabResult | 2-3 hrs |

### Priority 4: Population Health Layer (2 sessions)

| ID | Session | Scope | New Models | Est. Time |
|----|---------|-------|-----------|-----------|
| P0-17 | Location Exposure Scoring | EPA data enrichment per zip, vulnerability-weighted scoring (puberty/pregnancy 2-2.5x weight) | (extends LocationHistory) | 3-4 hrs |
| P0-20/21 | Population Aggregation + Heatmap | k-anonymity aggregation, cross-condition geographic hotspot detection, Mapbox heatmap | ZipCodeAggregate | 4-5 hrs |

### Priority 5: Integration (2 sessions)

| ID | Session | Scope | Est. Time |
|----|---------|-------|-----------|
| P0-EX5 | Cross-Condition Correlation + Dashboard Redesign | Shared risk factor analysis, multi-condition `/prevent` dashboard, mobile mirror | 3-4 hrs |
| P0-EX6 | Expanded Onboarding + Multi-Condition Trials | 7-step onboarding with PCOS/endo/thyroid screening, expanded trial sync | 3-4 hrs |

### Total Remaining: 16 sessions (~45-55 hours)

---

## Recommended Build Order

```
✅ Done:  P0-8, P0-9                   (PRS calculation engine + composite risk model)
Week 1:  P0-10                       (ancestry UI — completes genomic layer)
Week 2:  P0-11, P0-12, P0-13        (environmental intelligence — water, products, home)
Week 3:  P0-14, P0-15               (biomarkers + composite score)
Week 3:  P0-EX1, P0-EX2             (PCOS module — biggest new market)
Week 4:  P0-EX3, P0-EX4             (endo + thyroid modules)
Week 4:  P0-17                       (location scoring)
Week 5:  P0-20/21                    (population aggregation + heatmap)
Week 5:  P0-EX5, P0-EX6             (correlation engine + expanded onboarding)
```

---

## Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| PostgreSQL (Railway) | ✅ Production | 64 models, adding ~9 more |
| Redis (Railway) | ✅ Production | Session cache, FHIR state |
| AWS S3 | ✅ Production | 2 buckets (documents, pipeline) |
| AWS Batch + ECR | ✅ Production | 8 pipeline step containers |
| NATS JetStream | ✅ Production | Pipeline event bus |
| Terraform | ✅ Configured | VPC, S3, NATS, ECR, Batch |
| Vercel (web) | ✅ Deployed | Next.js 15 |
| Expo (mobile) | ✅ Configured | SDK 54, 142 routes |
| Mapbox | ✅ Integrated | Geocoding — will use for heatmap |
| EPA/EWG APIs | 🔲 Not integrated | Needed for P0-11 |
| Open Food Facts API | 🔲 Not integrated | Needed for P0-12 |

---

## New Prisma Models (Planned)

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

All models add `patientId` FK to existing Patient model. Total models after expansion: ~73.

---

## Spec Documents (Complete Reference)

| Spec File | Module | Content |
|-----------|--------|---------|
| `ONCOVAX_PLATFORM_SPEC.md` | Core platform | Phase 1-4 architecture + data models |
| `ONCOVAX_CLAUDE_CODE_SESSIONS.md` | Phase 1 | Session prompts S1-S6 |
| `ONCOVAX_PHASE2_SESSIONS.md` | SEQUENCE | Session prompts S7-S9 |
| `ONCOVAX_PHASE3_SESSIONS.md` | PREDICT | Session prompts S10-S15 |
| `ONCOVAX_PHASE4_SESSIONS.md` | MANUFACTURE | Session prompts M1-M2 |
| `ONCOVAX_PHASE5_SESSIONS.md` | SURVIVE | Session prompts S1-S8 |
| `ONCOVAX_SURVIVORSHIP_SPEC.md` | SURVIVE | Detailed data models + interfaces |
| `ONCOVAX_ACCESS_GAP_MODULES.md` | 6 modules | FERTILITY, SECOND, LOGISTICS, PALLIATIVE, ADVOCATE, PEERS |
| `ONCOVAX_INTEL_SPEC.md` | INTEL | Research intelligence stream |
| `ONCOVAX_LEARN_SPEC.md` | LEARN | Educational content + SEO |
| `ONCOVAX_VISUAL_SPEC.md` | VISUAL | 31 interactive visualizations |
| `ONCOVAX_CARE_SPEC.md` | CARE | Care commerce (not built) |
| `ONCOVAX_COOL_SPEC.md` | COOL | Cold capping (not built) |
| `ONCOVAX_ENGINE_SPEC.md` | ENGINE | Opportunity detection (not built) |
| `ONCOVAX_PHASE0_PREVENT_SPEC.md` | PREVENT v1 | Breast-cancer-only prevention (superseded by v2) |
| `ONCOVAX_PREVENTIVE_TRIAL_MATCHER_SPEC.md` | MATCH ext | Preventive trials + family referral |
| **`ONCOVAX_PHASE0_EXPANSION_SPEC.md`** | **PREVENT v2** | **Women's endocrine health expansion + 16 session prompts** |
| `ONCOVAX_SHARED_UI_MIGRATION.md` | Cross-cutting | Shared UI component migration |

---

## Key Architecture Decisions

1. **Next.js Route Handlers, NOT tRPC** — specs reference tRPC, implementation uses plain route handlers
2. **GraphQL (Apollo Server)** — 180+ types, 113 queries, 102 mutations, 30 resolver files
3. **Shared screens in `packages/app`** — 122 screens, cross-platform (web + mobile via Solito)
4. **Prisma 7 + PostgreSQL** — all data models in single schema.prisma
5. **Condition-agnostic environmental infrastructure** — water, products, biomarkers, location history serve all conditions
6. **Cross-condition correlation at zip code level** — novel dataset, k-anonymity threshold of 10
7. **60-second daily logging pattern** — used by survivorship journal, PCOS symptoms, endo pain diary
8. **Evidence-graded recommendations** — strong/moderate/emerging/precautionary for all guidance
