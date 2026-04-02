# CLAUDE.md — Updates for Phase 0 Expansion

## Instructions: Merge these changes into your existing CLAUDE.md

---

### 1. REPLACE the "What's NOT Built Yet" section (line ~199-203) with:

## What's NOT Built Yet

**Cross-cutting:** CARE (care commerce), COOL (cold capping), ENGINE (opportunity detection).

**Phase 0 — PREVENT expansion to Women's Endocrine Health (P0-8 to P0-EX6):**
- PRS calculation from extracted SNP dosages (P0-8), PRS → composite risk model integration (P0-9), ancestry confidence UI + partner testing referral (P0-10)
- Environmental intelligence: water quality dashboard with EPA/EWG APIs (P0-11), product barcode scanner with EDC flagging (P0-12), home environment checklist (P0-13), EDC biomarker panel integration (P0-14), longitudinal exposure tracking + composite environmental score (P0-15)
- Condition expansion: PCOS module with Rotterdam screening + symptom tracker + metabolic dashboard (P0-EX1, P0-EX2), endometriosis module with pain diary + provider report generation (P0-EX3), thyroid health module with lab tracking + EDC risk connection (P0-EX4)
- Population health: location exposure scoring with EPA enrichment per zip code (P0-17), population aggregation with k-anonymity + cross-condition geographic heatmap (P0-20/21)
- Platform integration: cross-condition correlation engine + multi-condition dashboard redesign (P0-EX5), expanded onboarding with PCOS/endo/thyroid screening + multi-condition trial matching (P0-EX6)
- Foundation (P0-1 to P0-6) + genomic layer (P0-7) complete. 16 remaining sessions.

---

### 2. ADD to the Spec Documents table:

| `ONCOVAX_PHASE0_EXPANSION_SPEC.md` | PREVENT v2 | Women's endocrine health expansion + 16 Claude Code session prompts (P0-8 to P0-EX6) |

---

### 3. ADD these new design principles (after existing #8):

9. **Condition-agnostic environmental infrastructure** — water quality, product scanner, biomarker panels, location history serve ALL conditions equally. Build once, contextualize per condition.
10. **Cross-condition correlation is the flagship insight** — shared environmental drivers across breast cancer, PCOS, endometriosis, and thyroid dysfunction are more actionable than single-condition risk factors.
11. **PCOS/endo/thyroid modules inherit survivorship patterns** — 60-second symptom logging, evidence-graded recommendations, provider-ready reports, warm empowering tone.
12. **Environmental framing: empowerment not alarm** — dose-response context, actionable swaps, portfolio view (cumulative exposure matters, not single products). Never present precautionary advice with same weight as strong evidence.

---

### 4. ADD to Architecture section under "packages/db" description:

New models for condition expansion (not yet built):
- PcosProfile, PcosSymptomLog (PCOS risk + symptom tracking)
- EndoProfile, EndoPainLog (endometriosis pain diary)  
- ThyroidProfile, ThyroidLabResult (thyroid lab tracking)
- BiomarkerResult (cross-condition EDC body burden)
- ProductScan (personal care product EDC detection)
- ZipCodeAggregate (population-level cross-condition geographic data)

Planned lib files:
- prs-calculator.ts (PRS from SNP dosages)
- composite-risk-engine.ts (multi-factor risk model wrapping Gail)
- water-quality.ts (EPA/EWG API integration)
- product-scanner.ts (barcode → ingredient → EDC flagging)
- home-environment.ts (home EDC assessment)
- biomarker-interpreter.ts (NHANES comparison + condition mapping)
- environmental-score.ts (composite exposure scoring)
- location-enrichment.ts (EPA data per zip code)
- population-aggregation.ts (k-anonymity aggregation pipeline)
- cross-condition-engine.ts (shared risk factor analysis)
- pcos-manager.ts (Rotterdam screening, metabolic risk, symptoms)
- endo-manager.ts (symptom screening, pain diary, provider report)
- thyroid-manager.ts (risk screen, lab interpretation, EDC connection)

---

### 5. UPDATE the route listing in Architecture section — add under apps/web/app/:

```
├── prevent/
│   ├── breast/              # Breast cancer risk track (existing screens restructured)
│   ├── pcos/                # PCOS risk + symptom tracking (NEW)
│   │   ├── risk/
│   │   ├── symptoms/
│   │   ├── metabolic/
│   │   └── interventions/
│   ├── endo/                # Endometriosis pain diary + interventions (NEW)
│   │   ├── risk/
│   │   ├── symptoms/
│   │   ├── report/
│   │   └── interventions/
│   ├── thyroid/             # Thyroid health + lab tracking (NEW)
│   │   ├── risk/
│   │   ├── labs/
│   │   └── edc-connection/
│   ├── exposures/           # Environmental intelligence (NEW)
│   │   ├── water/
│   │   ├── products/
│   │   ├── home/
│   │   └── testing/
│   ├── location/            # Location history + heatmap (NEW)
│   │   └── map/
│   ├── correlations/        # Cross-condition risk analysis (NEW)
│   ├── trials/              # Multi-condition preventive trials
│   ├── education/           # (existing)
│   ├── onboarding/          # Expanded to 7-step with condition screening
│   ├── risk/                # (existing breast cancer screens, to be nested under /breast)
│   └── family/              # (existing)
```
