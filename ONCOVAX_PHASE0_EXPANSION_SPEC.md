# Phase 0 Expansion: Women's Endocrine Health Risk Intelligence Platform

## Technical Specification v2.0

**Author:** Rett (Happy Medium)  
**Date:** March 2026  
**Supersedes:** ONCOVAX_PHASE0_PREVENT_SPEC.md (breast-cancer-only scope)  
**Depends on:** P0-1 through P0-7 (complete), Phase 5 SURVIVE lifestyle engine, Phase 1 MATCH trial matching  
**Purpose:** Expand the PREVENT module from breast-cancer-specific prevention to a comprehensive women's endocrine health risk intelligence platform. The environmental exposure infrastructure, location history dataset, and genomic risk layer are condition-agnostic — the same PFAS contamination that elevates breast cancer risk drives PCOS in younger women, disrupts thyroid function, and exacerbates endometriosis. This document specs the expansion and provides Claude Code session prompts for the remaining P0-8 through P0-25 sessions.

---

## Table of Contents

1. [Strategic Expansion Rationale](#1-strategic-expansion-rationale)
2. [What's Already Built (P0-1 through P0-7)](#2-whats-already-built)
3. [Platform Rename & Information Architecture](#3-platform-rename--information-architecture)
4. [Condition Expansion: Data Models](#4-condition-expansion-data-models)
5. [Expanded Risk Engine Architecture](#5-expanded-risk-engine-architecture)
6. [Environmental Intelligence (Condition-Agnostic)](#6-environmental-intelligence-condition-agnostic)
7. [Location History & Population Health Mapping](#7-location-history--population-health-mapping)
8. [Condition-Specific Modules](#8-condition-specific-modules)
9. [Unified Roadmap](#9-unified-roadmap)
10. [Claude Code Session Prompts (P0-8 through P0-25)](#10-claude-code-session-prompts)

---

## 1. Strategic Expansion Rationale

### 1.1 The Shared Environmental Thread

The same class of endocrine-disrupting chemicals (EDCs) — PFAS, BPA, phthalates, parabens, organochlorine pesticides — is implicated across multiple women's health conditions:

| Condition | Prevalence | Rising? | EDC Evidence |
|-----------|-----------|---------|-------------|
| Breast cancer | ~13% lifetime risk | +1%/year incidence | Strong: PFAS, BPA, DDT, parabens linked to ER+ disease |
| PCOS | 11-13% of reproductive-age women | +56% cases since 1990 | Strong: BPA associated with hyperandrogenism; PFAS linked to PCOS risk; phthalates correlated with increased likelihood |
| Endometriosis | ~10% of reproductive-age women | Rising (detection + true increase) | Moderate: Dioxins, PCBs, phthalates linked to endometrial lesions |
| Thyroid dysfunction | ~5% of women (overt), ~10% subclinical | Rising, especially Hashimoto's | Strong: PFAS disrupts thyroid function; BPA interferes with thyroid hormone signaling |
| Infertility | ~12-15% of couples | Rising, especially in younger women | Strong: PFAS correlates with lower fecundability; EDCs linked to diminished ovarian reserve |
| Early puberty | Median menarche now ~12.0 years | Declining steadily | Moderate: EDCs implicated in pubertal timing acceleration |

Key insight: **A woman exposed to PFAS-contaminated water during puberty has elevated risk for ALL of the above conditions, not just one.** Tracking that exposure once and correlating it across conditions is dramatically more valuable than disease-specific siloes.

### 1.2 Market Expansion

| Metric | Breast Cancer Only | Women's Endocrine Health |
|--------|-------------------|--------------------------|
| Addressable population | Women 40+ (screening age) + high-risk younger | All women 15-55 (reproductive age) |
| US addressable | ~60M women | ~120M women |
| Entry age | 35-40 (risk assessment) | 15-25 (PCOS/endo symptoms, early tracking) |
| Lifetime platform value | 30-40 years | 40-60 years |
| Data value | Single-condition longitudinal | Multi-condition longitudinal (unprecedented) |

### 1.3 What Changes, What Doesn't

**Doesn't change (already condition-agnostic):**
- Environmental exposure intelligence (water quality, product scanner, biomarker panels)
- Location history & population aggregation pipeline
- Data contribution consent architecture
- Genomic raw file upload + parsing infrastructure

**Needs expansion:**
- Risk engine (currently Gail model for breast cancer only → add PCOS risk scoring, endometriosis risk factors, thyroid risk assessment)
- Onboarding questionnaire (add symptom screening for PCOS/endo/thyroid alongside breast cancer risk)
- Screening planner (add PCOS/thyroid screening recommendations)
- Trial matcher (add PCOS, endometriosis, fertility treatment trials)
- Lifestyle engine (add condition-specific guidance for PCOS insulin resistance, endometriosis inflammation)

**Truly new:**
- PCOS risk assessment + symptom tracker
- Endometriosis symptom tracker + intervention navigator
- Thyroid health dashboard
- Cross-condition correlation engine (the novel contribution)

---

## 2. What's Already Built

### P0-1 through P0-6 (Complete)

| Component | Status | Key Files |
|-----------|--------|-----------|
| PreventProfile model | ✅ | `schema.prisma` — reproductive/hormonal/lifestyle/family history fields |
| RiskAssessment model | ✅ | Full Gail model inputs/outputs + trajectory + modifiable factors |
| GenomicProfile model | ✅ | Pathogenic/VUS variants + PRS placeholders |
| LocationHistory model | ✅ | Zip code + environmental exposure fields + life stages |
| ScreeningSchedule model | ✅ | NCCN guideline-based plan |
| DataConsent model | ✅ | Tiered consent levels |
| prevent-manager.ts | ✅ | Profile CRUD + onboarding orchestration |
| prevent-risk-engine.ts | ✅ | Full Gail model with SEER baselines + modifiable factor analysis |
| prevent-screening.ts | ✅ | NCCN screening planner with risk stratification |
| prevent-lifestyle.ts | ✅ | Claude-generated prevention lifestyle recommendations |
| Onboarding wizard (5-step) | ✅ | 11 shared screens (~5,900 lines) |
| Risk dashboard | ✅ | Risk gauge + trajectory + modifiable factors |
| Screening planner UI | ✅ | Modality schedule + dense breast guidance |
| Chemoprevention navigator | ✅ | USPSTF eligibility + medication comparison |

### P0-7 (Complete)

| Component | Status | Key Files |
|-----------|--------|-----------|
| Genotype parser | ✅ | `genotype-parser.ts` — 23andMe/AncestryDNA/VCF parsing |
| Pathogenic variant extraction | ✅ | ClinVar-derived ~45 entries (BRCA1/2, PALB2, CHEK2, ATM, etc.) |
| PRS SNP dosage extraction | ✅ | Mavaddat 2019 313-SNP reference (~80 representative high-weight SNPs) |
| S3 upload flow | ✅ | Presigned upload + GenomicProfile upsert |
| Upload UI | ✅ | File picker + parsing state + data source badge |

### Remaining P0 Work (Not Built)

- **P0-8:** PRS calculation from extracted SNP dosages
- **P0-9:** PRS integration into composite risk model
- **P0-10:** Ancestry confidence UI + partner testing referral
- **P0-11 to P0-16:** Environmental intelligence (EPA/EWG APIs, product scanner, biomarker panels)
- **P0-17 to P0-21:** Population aggregation (k-anonymity, heatmaps, location exposure scoring)
- **P0-22 to P0-25:** Lifestyle engine port + preventive trial matching

---

## 3. Platform Rename & Information Architecture

### 3.1 Route Restructure

The `/prevent` route currently serves breast cancer prevention. Expand it to house all women's endocrine health conditions, with breast cancer as the most developed track.

```
/prevent                                Prevention home — multi-condition dashboard
/prevent/onboarding                     Expanded intake (screens for breast, PCOS, endo, thyroid)
/prevent/breast                         Breast cancer risk track (existing P0-1 to P0-7 screens)
/prevent/breast/risk                    Breast cancer risk dashboard (existing)
/prevent/breast/screening               Screening planner (existing)
/prevent/breast/chemoprevention         Chemoprevention navigator (existing)
/prevent/breast/genomic                 Genomic risk layer (existing)
/prevent/pcos                           PCOS risk track (NEW)
/prevent/pcos/risk                      PCOS risk assessment
/prevent/pcos/symptoms                  Symptom tracker (cycle, acne, hair, weight)
/prevent/pcos/metabolic                 Metabolic health dashboard (insulin, glucose, lipids)
/prevent/pcos/interventions             Treatment & lifestyle interventions
/prevent/endo                           Endometriosis track (NEW)
/prevent/endo/risk                      Risk assessment
/prevent/endo/symptoms                  Pain & symptom tracker
/prevent/endo/interventions             Treatment navigator
/prevent/thyroid                        Thyroid health track (NEW)
/prevent/thyroid/risk                   Thyroid risk assessment
/prevent/thyroid/monitoring             Lab tracking (TSH, T3, T4, antibodies)
/prevent/exposures                      Environmental exposure intelligence (SHARED)
/prevent/exposures/water                Water quality by location
/prevent/exposures/products             Product scanner
/prevent/exposures/home                 Home environment checklist
/prevent/exposures/testing              Biomarker panel guide + results
/prevent/location                       Location history (SHARED)
/prevent/location/map                   Risk heatmap
/prevent/lifestyle                      Lifestyle engine (SHARED, condition-contextualized)
/prevent/contribute                     Data contribution dashboard (SHARED)
/prevent/trials                         Preventive trial matching (expanded beyond breast)
/prevent/correlations                   Cross-condition risk correlation (NEW, flagship)
```

### 3.2 Dashboard Redesign

The `/prevent` home page transitions from a breast-cancer-only risk dashboard to a multi-condition overview:

```typescript
interface PreventDashboard {
  // Condition tracks — show only relevant ones based on onboarding
  conditionTracks: {
    breastCancer: {
      show: boolean;                    // True for all users (universal risk)
      riskSummary: string;              // "Your lifetime risk: 18.3%"
      nextAction: string;               // "Mammogram due in 3 months"
      status: "low" | "moderate" | "elevated" | "high";
    };
    pcos: {
      show: boolean;                    // True if symptoms flagged or user opted in
      riskSummary: string;              // "3 of 5 risk factors present"
      nextAction: string;               // "Schedule metabolic panel"
      status: "screening" | "suspected" | "diagnosed" | "managed";
    };
    endometriosis: {
      show: boolean;                    // True if symptoms flagged or user opted in
      riskSummary: string;
      nextAction: string;
      status: "screening" | "suspected" | "diagnosed" | "managed";
    };
    thyroid: {
      show: boolean;                    // True if risk factors present
      riskSummary: string;
      nextAction: string;
      status: "normal" | "monitor" | "subclinical" | "clinical";
    };
  };

  // Shared modules — always visible
  environmentalExposure: {
    overallScore: number;               // 0-100 composite exposure score
    topConcerns: string[];              // "Elevated PFAS in your water district"
    lastUpdated: string;
  };

  locationRisk: {
    currentZipScore: number;
    historicalExposure: string;         // "3 high-risk zip codes during developmental windows"
  };

  lifestyle: {
    adherenceScore: number;             // How well user is following recommendations
    topRecommendation: string;
  };

  researchContribution: {
    consentLevel: number;
    contributionImpact: string;         // "Your data has helped 47 researchers"
  };
}
```

---

## 4. Condition Expansion: Data Models

### 4.1 New Prisma Models

```prisma
// PCOS Risk Profile
model PcosProfile {
  id                    String    @id @default(uuid()) @db.Uuid
  patientId             String    @unique @map("patient_id") @db.Uuid
  
  // Rotterdam criteria screening
  menstrualPattern      String?   @map("menstrual_pattern") @db.VarChar(30)
  // "regular" | "irregular" | "absent" | "oligomenorrhea"
  cycleLength           Int?      @map("cycle_length")          // Days, if known
  clinicalHyperandrogenism  Boolean?  @map("clinical_hyperandrogenism")
  // Acne, hirsutism, alopecia
  hirsutismScore        Int?      @map("hirsutism_score")       // Modified Ferriman-Gallwey
  acneSeverity          String?   @map("acne_severity") @db.VarChar(20)
  alopeciaPresent       Boolean?  @map("alopecia_present")
  
  // Biochemical markers
  totalTestosterone     Float?    @map("total_testosterone")
  freeTestosterone      Float?    @map("free_testosterone")
  dheas                 Float?    @map("dheas")
  shbg                  Float?    @map("shbg")
  amh                   Float?    @map("amh")
  
  // Metabolic markers
  fastingInsulin        Float?    @map("fasting_insulin")
  fastingGlucose        Float?    @map("fasting_glucose")
  homaIr                Float?    @map("homa_ir")
  hba1c                 Float?    @map("hba1c")
  totalCholesterol      Float?    @map("total_cholesterol")
  ldl                   Float?    @map("ldl")
  hdl                   Float?    @map("hdl")
  triglycerides         Float?    @map("triglycerides")
  
  // Imaging
  ultrasoundDone        Boolean?  @map("ultrasound_done")
  polycysticMorphology  Boolean?  @map("polycystic_morphology")
  antralFollicleCount   Int?      @map("antral_follicle_count")
  
  // Diagnosis status
  diagnosisStatus       String    @default("screening") @map("diagnosis_status") @db.VarChar(30)
  // "screening" | "suspected" | "diagnosed" | "managed"
  diagnosedBy           String?   @map("diagnosed_by") @db.VarChar(200)
  diagnosisDate         DateTime? @map("diagnosis_date")
  phenotype             String?   @map("phenotype") @db.VarChar(5)
  // Rotterdam phenotype: A (full), B (hyperandrogenism + ovulatory dysfunction),
  // C (hyperandrogenism + polycystic morphology), D (ovulatory dysfunction + morphology)
  
  bmi                   Float?    @map("bmi")
  waistCircumference    Float?    @map("waist_circumference")
  
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  
  patient               Patient   @relation(fields: [patientId], references: [id])
  symptomLogs           PcosSymptomLog[]
  
  @@map("pcos_profiles")
}

model PcosSymptomLog {
  id              String    @id @default(uuid()) @db.Uuid
  pcosProfileId   String    @map("pcos_profile_id") @db.Uuid
  logDate         DateTime  @default(now()) @map("log_date")
  
  // Cycle tracking
  cycleDay        Int?      @map("cycle_day")
  bleeding        Boolean?  @map("bleeding")
  bleedingIntensity String? @map("bleeding_intensity") @db.VarChar(20)
  
  // Symptoms (0-10 scale)
  acneSeverity    Int?      @map("acne_severity")
  hairGrowth      Int?      @map("hair_growth")        // Unwanted facial/body hair
  hairLoss        Int?      @map("hair_loss")           // Scalp
  bloating        Int?      @map("bloating")
  fatigue         Int?      @map("fatigue")
  moodScore       Int?      @map("mood_score")
  cravings        Int?      @map("cravings")
  weight          Float?    @map("weight")
  
  notes           String?   @map("notes")
  
  pcosProfile     PcosProfile @relation(fields: [pcosProfileId], references: [id], onDelete: Cascade)
  
  @@index([pcosProfileId, logDate(sort: Desc)])
  @@map("pcos_symptom_logs")
}

// Endometriosis Profile
model EndoProfile {
  id                    String    @id @default(uuid()) @db.Uuid
  patientId             String    @unique @map("patient_id") @db.Uuid
  
  // Symptom screening
  pelvicPainSeverity    Int?      @map("pelvic_pain_severity")      // 0-10
  dysmenorrhea          Boolean?  @map("dysmenorrhea")
  dyspareunia           Boolean?  @map("dyspareunia")
  dyschezia             Boolean?  @map("dyschezia")
  dysuria               Boolean?  @map("dysuria")
  chronicFatigue        Boolean?  @map("chronic_fatigue")
  infertility           Boolean?  @map("infertility")
  
  // Diagnosis
  diagnosisStatus       String    @default("screening") @map("diagnosis_status") @db.VarChar(30)
  diagnosisMethod       String?   @map("diagnosis_method") @db.VarChar(50)
  // "laparoscopy" | "imaging" | "clinical" | "unconfirmed"
  stage                 String?   @map("stage") @db.VarChar(10)
  // rASRM: "I" | "II" | "III" | "IV"
  
  // Treatment history
  currentTreatments     String[]  @default([]) @map("current_treatments")
  previousSurgeries     Int       @default(0) @map("previous_surgeries")
  
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  
  patient               Patient   @relation(fields: [patientId], references: [id])
  painLogs              EndoPainLog[]
  
  @@map("endo_profiles")
}

model EndoPainLog {
  id              String    @id @default(uuid()) @db.Uuid
  endoProfileId   String    @map("endo_profile_id") @db.Uuid
  logDate         DateTime  @default(now()) @map("log_date")
  
  cycleDay        Int?      @map("cycle_day")
  overallPain     Int?      @map("overall_pain")         // 0-10
  pelvicPain      Int?      @map("pelvic_pain")
  backPain        Int?      @map("back_pain")
  bowelPain       Int?      @map("bowel_pain")
  fatigue         Int?      @map("fatigue")
  bloating        Int?      @map("bloating")
  nausea          Int?      @map("nausea")
  
  medicationTaken String[]  @default([]) @map("medication_taken")
  activityImpact  Int?      @map("activity_impact")      // 0-10 how much pain affected daily life
  notes           String?   @map("notes")
  
  endoProfile     EndoProfile @relation(fields: [endoProfileId], references: [id], onDelete: Cascade)
  
  @@index([endoProfileId, logDate(sort: Desc)])
  @@map("endo_pain_logs")
}

// Thyroid Health Profile
model ThyroidProfile {
  id                    String    @id @default(uuid()) @db.Uuid
  patientId             String    @unique @map("patient_id") @db.Uuid
  
  // Risk factors
  familyHistoryThyroid  Boolean?  @map("family_history_thyroid")
  autoimmuneFamilyHistory Boolean? @map("autoimmune_family_history")
  previousRadiation     Boolean?  @map("previous_radiation")
  
  // Lab results (most recent)
  tsh                   Float?    @map("tsh")
  freeT4                Float?    @map("free_t4")
  freeT3                Float?    @map("free_t3")
  tpoAntibodies         Float?    @map("tpo_antibodies")
  tgAntibodies          Float?    @map("tg_antibodies")
  lastLabDate           DateTime? @map("last_lab_date")
  
  // Diagnosis
  diagnosisStatus       String    @default("screening") @map("diagnosis_status") @db.VarChar(30)
  // "normal" | "subclinical_hypo" | "clinical_hypo" | "subclinical_hyper" | "clinical_hyper" | "hashimotos" | "graves"
  currentMedication     String?   @map("current_medication") @db.VarChar(100)
  currentDose           String?   @map("current_dose") @db.VarChar(50)
  
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  
  patient               Patient   @relation(fields: [patientId], references: [id])
  labHistory            ThyroidLabResult[]
  
  @@map("thyroid_profiles")
}

model ThyroidLabResult {
  id                String    @id @default(uuid()) @db.Uuid
  thyroidProfileId  String    @map("thyroid_profile_id") @db.Uuid
  labDate           DateTime  @map("lab_date")
  
  tsh               Float?    @map("tsh")
  freeT4            Float?    @map("free_t4")
  freeT3            Float?    @map("free_t3")
  tpoAntibodies     Float?    @map("tpo_antibodies")
  tgAntibodies      Float?    @map("tg_antibodies")
  
  source            String?   @map("source") @db.VarChar(50)
  // "manual_entry" | "lab_upload" | "fhir_sync"
  
  thyroidProfile    ThyroidProfile @relation(fields: [thyroidProfileId], references: [id], onDelete: Cascade)
  
  @@index([thyroidProfileId, labDate(sort: Desc)])
  @@map("thyroid_lab_results")
}

// Cross-Condition Environmental Exposure Biomarkers
model BiomarkerResult {
  id                String    @id @default(uuid()) @db.Uuid
  patientId         String    @map("patient_id") @db.Uuid
  testDate          DateTime  @map("test_date")
  labProvider       String?   @map("lab_provider") @db.VarChar(100)
  
  pfasResults       Json?     @map("pfas_results")
  bisphenolResults  Json?     @map("bisphenol_results")
  phthalateResults  Json?     @map("phthalate_results")
  parabenResults    Json?     @map("paraben_results")
  pesticideResults  Json?     @map("pesticide_results")
  heavyMetalResults Json?     @map("heavy_metal_results")
  
  overallExposureScore  Float?  @map("overall_exposure_score")
  percentileVsNhanes   Float?  @map("percentile_vs_nhanes")
  
  consentResearchUse   Boolean @default(false) @map("consent_research_use")
  createdAt            DateTime @default(now()) @map("created_at")
  
  patient              Patient  @relation(fields: [patientId], references: [id])
  
  @@map("biomarker_results")
}

// Product Scans (shared across conditions)
model ProductScan {
  id                String    @id @default(uuid()) @db.Uuid
  patientId         String    @map("patient_id") @db.Uuid
  scanDate          DateTime  @default(now()) @map("scan_date")
  barcode           String?   @map("barcode")
  productName       String?   @map("product_name")
  brand             String?   @map("brand")
  category          String?   @map("category") @db.VarChar(50)
  ingredients       Json?     @map("ingredients")
  flaggedIngredients Int?     @map("flagged_ingredients")
  overallRating     String?   @map("overall_rating") @db.VarChar(2)
  createdAt         DateTime  @default(now()) @map("created_at")
  
  patient           Patient   @relation(fields: [patientId], references: [id])
  
  @@map("product_scans")
}

// Zip Code Aggregates (population-level, cross-condition)
model ZipCodeAggregate {
  zipCode               String    @id @map("zip_code") @db.VarChar(10)
  userCount             Int       @default(0) @map("user_count")
  ageDistribution       Json?     @map("age_distribution")
  ethnicityDistribution Json?     @map("ethnicity_distribution")
  
  // Cross-condition risk aggregates
  meanBreastCancerRisk  Float?    @map("mean_breast_cancer_risk")
  pcosPrevalence        Float?    @map("pcos_prevalence")
  endoPrevalence        Float?    @map("endo_prevalence")
  thyroidPrevalence     Float?    @map("thyroid_prevalence")
  
  // Environmental (public data sources)
  environmentalProfile  Json?     @map("environmental_profile")
  
  // Biomarker aggregates (from consenting users who tested)
  meanPfasLevels        Json?     @map("mean_pfas_levels")
  meanBpaLevel          Float?    @map("mean_bpa_level")
  biomarkerSampleSize   Int?      @map("biomarker_sample_size")
  
  lastUpdated           DateTime  @default(now()) @map("last_updated")
  
  @@map("zip_code_aggregates")
}
```

### 4.2 Patient Model Extensions

```prisma
// Add to existing Patient model relations:
model Patient {
  // ... existing relations ...
  pcosProfile           PcosProfile?
  endoProfile           EndoProfile?
  thyroidProfile        ThyroidProfile?
  biomarkerResults      BiomarkerResult[]
  productScans          ProductScan[]
}
```

---

## 5. Expanded Risk Engine Architecture

### 5.1 Multi-Condition Risk Assessment

```typescript
interface MultiConditionRiskAssessment {
  patientId: string;
  assessmentDate: string;

  // Per-condition risk summaries
  breastCancer: {
    lifetimeRisk: number;
    fiveYearRisk: number;
    riskCategory: string;
    modelUsed: "gail" | "tyrer_cuzick" | "canrisk";
    // Existing P0-1 to P0-6 output
  };

  pcos: {
    screeningScore: number;               // Based on symptom screening + metabolic markers
    rotterdamCriteriaMet: number;          // 0, 1, 2, or 3
    suspectedPhenotype: string | null;
    metabolicRiskScore: number;            // Insulin resistance, cardiovascular risk
    actionRequired: "none" | "screening_labs" | "specialist_referral" | "already_diagnosed";
  };

  endometriosis: {
    symptomBurdenScore: number;            // 0-50 composite from pain diary
    riskFactors: number;                   // Count of present risk factors
    screeningRecommendation: string;
    actionRequired: "none" | "symptom_tracking" | "specialist_referral" | "already_diagnosed";
  };

  thyroid: {
    riskFactorCount: number;
    lastLabStatus: string;                 // "normal" | "borderline" | "abnormal" | "untested"
    screeningRecommendation: string;
    actionRequired: "none" | "screening_labs" | "follow_up" | "already_managed";
  };

  // Cross-condition environmental exposure (shared)
  environmentalExposure: {
    overallScore: number;
    locationScore: number;
    productScore: number;
    biomarkerScore: number | null;
    topConcerns: string[];
    // This score affects ALL condition-specific risk assessments
  };

  // The novel insight: cross-condition correlation
  crossConditionInsights: {
    sharedRiskFactors: {
      factor: string;                     // "Elevated PFAS exposure"
      affectedConditions: string[];       // ["breast_cancer", "pcos", "thyroid"]
      intervention: string;               // "Filter drinking water; reduce food packaging exposure"
    }[];
    
    // Flag when multiple conditions share environmental driver
    environmentalClusterAlert: boolean;   // True when ≥3 conditions show elevated env risk
    clusterMessage: string | null;        // "Your environmental exposure profile is contributing to 
                                          //  elevated risk across multiple conditions. The most 
                                          //  impactful single action is..."
  };
}
```

---

## 6. Environmental Intelligence (Condition-Agnostic)

This section is unchanged from the original Phase 0 spec (Sections 5.1-5.4). The water quality dashboard, product scanner, biomarker panel integration, and home environment checklist are inherently condition-agnostic. The only change is that the risk contribution of each exposure is now mapped to multiple conditions:

```typescript
interface EDCHealthImpact {
  chemical: string;                       // "PFOA"
  
  conditionImpacts: {
    breastCancer: {
      evidenceStrength: "strong" | "moderate" | "emerging";
      mechanism: string;                  // "Estrogen mimicry, ER+ disease promotion"
      riskIncrease: string;               // "Associated with up to 13x risk at highest exposures"
    };
    pcos: {
      evidenceStrength: "strong" | "moderate" | "emerging";
      mechanism: string;                  // "Disrupts androgen metabolism, insulin signaling"
      riskIncrease: string;
    };
    thyroid: {
      evidenceStrength: "strong" | "moderate" | "emerging";
      mechanism: string;                  // "Inhibits iodide accumulation, disrupts thyroid hormone"
      riskIncrease: string;
    };
    endometriosis: {
      evidenceStrength: "strong" | "moderate" | "emerging";
      mechanism: string;
      riskIncrease: string;
    };
    fertility: {
      evidenceStrength: "strong" | "moderate" | "emerging";
      mechanism: string;                  // "Reduces fecundability, earlier menopause"
      riskIncrease: string;
    };
  };
}
```

---

## 7. Location History & Population Health Mapping

### 7.1 Expansion from Breast Cancer to Multi-Condition

The ZipCodeAggregate model now tracks prevalence across all conditions, enabling the platform's flagship feature: **geographic hotspot detection across multiple endocrine conditions simultaneously.**

A zip code that shows elevated breast cancer risk AND elevated PCOS prevalence AND elevated thyroid dysfunction is much stronger evidence of environmental causation than any single-condition signal. This cross-condition correlation at the geographic level is the dataset that doesn't exist anywhere else.

```typescript
interface CrossConditionHotspot {
  zipCode: string;
  conditions: {
    condition: string;
    deviationFromExpected: number;        // Percentage above/below national average
    sampleSize: number;
    confidence: "high" | "moderate" | "low";
  }[];
  
  // If ≥2 conditions elevated AND environmental risk score is high
  environmentalCorrelation: {
    isHotspot: boolean;
    correlatedExposures: string[];        // "PFAS in water", "Industrial TRI facility within 5 miles"
    confidenceLevel: "suggestive" | "moderate" | "strong";
  };
}
```

---

## 8. Condition-Specific Modules

### 8.1 PCOS Module

```typescript
// New lib file: pcos-manager.ts

interface PcosManager {
  // Screening
  rotterdamScreening(profile: PcosProfile): {
    criteriaMet: number;
    criteria: {
      oligo_anovulation: boolean | "unknown";
      hyperandrogenism: boolean | "unknown";
      polycystic_morphology: boolean | "unknown";
    };
    recommendation: string;
  };
  
  // Metabolic risk
  calculateHomaIR(fastingInsulin: number, fastingGlucose: number): number;
  metabolicRiskAssessment(profile: PcosProfile): {
    insulinResistance: "normal" | "borderline" | "elevated";
    cardiovascularRisk: "low" | "moderate" | "elevated";
    type2DiabetesRisk: "low" | "moderate" | "elevated";
    recommendations: string[];
  };
  
  // Symptom tracking
  logSymptoms(profileId: string, log: PcosSymptomLog): Promise<void>;
  getSymptomTrends(profileId: string, months: number): SymptomTrend[];
  
  // Lifestyle (PCOS-specific — extends shared lifestyle engine)
  pcosLifestyleRecommendations(profile: PcosProfile): {
    // Insulin-resistance-focused nutrition
    nutrition: {
      headline: string;                   // "Low glycemic index eating reduces androgen levels"
      recommendations: string[];
      evidenceStrength: "strong";
    };
    // Exercise for insulin sensitivity
    exercise: {
      headline: string;                   // "Both aerobic and resistance training improve insulin sensitivity"
      recommendations: string[];
      evidenceStrength: "strong";
    };
    // Weight management
    weight: {
      headline: string;                   // "5-10% weight loss can restore ovulation in many women"
      recommendations: string[];
      evidenceStrength: "strong";
    };
    // Supplement evidence
    supplements: {
      inositol: { evidence: "strong"; dose: string; mechanism: string };
      vitaminD: { evidence: "moderate"; dose: string; mechanism: string };
      berberine: { evidence: "moderate"; dose: string; mechanism: string };
      // No unproven supplements — evidence-graded only
    };
  };
}
```

### 8.2 Endometriosis Module

```typescript
// New lib file: endo-manager.ts

interface EndoManager {
  // Symptom screening
  symptomScreening(profile: EndoProfile): {
    symptomBurdenScore: number;           // 0-50
    suspectedEndo: boolean;               // Based on symptom pattern
    recommendation: string;
    // "Your symptom pattern is consistent with endometriosis. 
    //  We recommend discussing this with a gynecologist."
  };
  
  // Pain diary
  logPain(profileId: string, log: EndoPainLog): Promise<void>;
  getPainTrends(profileId: string, months: number): PainTrend[];
  
  // Generate pain report for provider (PDF)
  generateProviderReport(profileId: string): Promise<string>; // S3 key
  // Structured pain diary summary that patient can bring to appointment
  // Solves the "my doctor didn't believe me" problem
  
  // Specialist directory (extends existing provider patterns)
  findEndoSpecialists(zipCode: string, radius: number): Provider[];
  
  // Treatment navigator
  treatmentOptions(profile: EndoProfile): {
    medical: { option: string; evidence: string; sideEffects: string }[];
    surgical: { option: string; evidence: string; considerations: string }[];
    complementary: { option: string; evidence: string; caveat: string }[];
  };
}
```

### 8.3 Thyroid Health Module

```typescript
// New lib file: thyroid-manager.ts

interface ThyroidManager {
  // Risk screening
  thyroidRiskScreen(profile: ThyroidProfile): {
    riskLevel: "low" | "moderate" | "elevated";
    riskFactors: string[];
    screeningRecommendation: string;
  };
  
  // Lab tracking + interpretation
  addLabResult(profileId: string, result: ThyroidLabResult): Promise<void>;
  interpretLabs(result: ThyroidLabResult): {
    tshStatus: "low" | "normal" | "borderline_high" | "high";
    t4Status: "low" | "normal" | "high";
    antibodyStatus: "negative" | "borderline" | "positive";
    overallAssessment: string;
    recommendation: string;
  };
  getLabTrends(profileId: string): LabTrend[];
  
  // Environmental connection
  thyroidEdcRisk(exposureProfile: EnvironmentalExposure): {
    relevantExposures: string[];          // "PFAS disrupts thyroid hormone synthesis"
    recommendations: string[];
  };
}
```

---

## 9. Unified Roadmap

### 9.1 Build Priority (remaining sessions)

| Priority | Sessions | Scope | Rationale |
|----------|----------|-------|-----------|
| **1** | P0-8, P0-9, P0-10 | PRS calculation + composite risk model + ancestry UI | Completes breast cancer genomic layer, highest clinical value |
| **2** | P0-11, P0-12, P0-13 | Water quality API, product scanner, home environment | Condition-agnostic environmental intelligence — serves all users |
| **3** | P0-14, P0-15, P0-16 | Biomarker panels, longitudinal tracking, env risk integration | Highest-fidelity exposure data, completes environmental layer |
| **4** | P0-EX1, P0-EX2 | PCOS module (risk screening + symptom tracker + metabolic dashboard) | Largest new addressable market, shares env infrastructure |
| **5** | P0-EX3 | Endometriosis module (symptom tracker + pain diary + provider report) | High need, relatively lightweight build |
| **6** | P0-EX4 | Thyroid module (risk screening + lab tracking + EDC connection) | Completes endocrine health picture |
| **7** | P0-17, P0-18, P0-19 | Location exposure scoring + EPA/EWG enrichment per zip | Builds the novel population dataset |
| **8** | P0-20, P0-21 | Population aggregation + cross-condition heatmap | Flagship feature, needs user data to be meaningful |
| **9** | P0-EX5 | Cross-condition correlation engine + dashboard redesign | Ties everything together |
| **10** | P0-EX6 | Expanded onboarding + multi-condition trial matcher | Growth/acquisition optimization |

### 9.2 Architecture Updates for CLAUDE.md

Add to "What's NOT Built Yet" section:

```
**Phase 0 — PREVENT expansion to Women's Endocrine Health (P0-8 to P0-EX6):**
PRS calculation (P0-8 to P0-10), environmental intelligence (P0-11 to P0-16),
PCOS module with Rotterdam screening + metabolic dashboard + symptom tracker (P0-EX1 to P0-EX2),
endometriosis module with pain diary + provider report generation (P0-EX3),
thyroid health module with lab tracking + EDC risk connection (P0-EX4),
population aggregation + cross-condition geographic heatmap (P0-17 to P0-21),
cross-condition correlation engine (P0-EX5),
expanded onboarding + multi-condition trial matching (P0-EX6).
```

Add new models to model count: +8 models (PcosProfile, PcosSymptomLog, EndoProfile, EndoPainLog, ThyroidProfile, ThyroidLabResult, BiomarkerResult, ProductScan, ZipCodeAggregate) = 73+ total.

---

## 10. Claude Code Session Prompts (P0-8 through P0-EX6)

### SESSION P0-8: PRS Calculation Engine

---START---

# OncoVax — P0-8: PRS Calculation from Extracted SNP Dosages

## Context
P0-7 built the genotype parser that extracts SNP dosages from raw 23andMe/AncestryDNA/VCF files and stores them in `GenomicProfile.prsSnpDosages` (JSON object: `{ "rs12345": 1, "rs67890": 2, ... }`). This session builds the actual PRS calculation pipeline.

Reference: `ONCOVAX_PHASE0_PREVENT_SPEC.md` Section 4 (Genomic Risk Layer), and the existing `genotype-parser.ts` for the SNP reference table with log-OR weights from Mavaddat et al. 2019.

## What to build

### 1. PRS Calculation Library (`apps/web/lib/prs-calculator.ts`)

Build a PRS calculation function that:

1. Takes the `prsSnpDosages` JSON from GenomicProfile
2. Multiplies each SNP dosage by its log-OR weight (from the reference table in `genotype-parser.ts`)
3. Sums all weighted dosages to produce a raw PRS
4. Standardizes the raw PRS to a population distribution:
   - Use published European-ancestry mean and SD for the 313-SNP model
   - For non-European ancestry, apply ancestry-specific calibration factors (published in Mavaddat 2019 supplementary data)
   - Store the calibration population used
5. Convert standardized PRS to a percentile (using normal CDF approximation)
6. Calculate the odds ratio per SD (1.61 for overall breast cancer per the 313-SNP validation)
7. Flag confidence level based on SNP coverage:
   - ≥80% of model SNPs available: "high"
   - 60-80%: "moderate"  
   - <60%: "low" (warn user, recommend clinical testing)

```typescript
interface PrsCalculationResult {
  rawScore: number;
  standardizedScore: number;
  percentile: number;
  oddsRatioPerSD: number;
  snpsUsed: number;
  snpsTotal: number;
  coverage: number;
  confidence: "high" | "moderate" | "low";
  ancestryCalibration: string;
  // Risk multiplier for integration into Gail model
  riskMultiplier: number;               // e.g., percentile 95 → ~2.5x, percentile 5 → ~0.5x
}
```

### 2. Integration into prevent-risk-engine.ts

Extend the Gail model calculation in `prevent-risk-engine.ts` to incorporate the PRS as a multiplicative risk modifier. When a GenomicProfile has a calculated PRS:
- Multiply the Gail model's relative risk by the PRS risk multiplier
- Recalculate lifetime, 5-year, and 10-year risk estimates
- Update the risk trajectory curve
- Add PRS to the modifiable factors analysis (it's not modifiable, but it contextualizes other factors)

### 3. Auto-trigger on genotype parsing completion

When `genotype-parser.ts` completes parsing (status → "parsed"), automatically trigger PRS calculation and update the GenomicProfile with:
- `prsValue` (standardized score)
- `prsPercentile`
- `prsSnpCount` (how many model SNPs were available)
- `prsModelVersion` ("mavaddat_2019_313")
- `prsAncestryCalibration` (based on self-reported ethnicity from PreventProfile)

### 4. Update GraphQL + Screens

- Add `calculatePrs` mutation that can be triggered manually (re-run with different ancestry calibration)
- Update PreventGenomicScreen to show PRS results: percentile gauge, population distribution chart, risk multiplier, confidence badge
- Update RiskDashboard to incorporate PRS into the risk gauge when available

### 5. Ancestry Disclosure

When PRS is calculated for a non-European-ancestry user, display a clear disclosure:
"PRS models are most accurate for women of European ancestry. Your score has been calibrated for [self-reported ethnicity] using the best available data, but the confidence interval is wider. We display this uncertainty clearly in your risk estimate."

---END---

### SESSION P0-9: PRS Integration into Composite Risk Model

---START---

# OncoVax — P0-9: PRS Integration into Composite Risk Model

## Context
P0-8 built the PRS calculator. This session integrates PRS into the existing Gail model to create a true composite risk model. Also integrates monogenic variant findings (BRCA1/2, CHEK2, PALB2, ATM) from genotype parsing into separate risk pathways.

Reference: `prevent-risk-engine.ts` (Gail model), `prs-calculator.ts` (P0-8), `genotype-parser.ts` (pathogenic variants).

## What to build

### 1. Composite Risk Engine (`apps/web/lib/composite-risk-engine.ts`)

Create a new composite engine that wraps the Gail model and layers on genomic data:

1. **Base risk:** Gail model output (existing)
2. **PRS adjustment:** Multiply base relative risk by PRS risk multiplier
3. **Monogenic variant override:** If pathogenic variant found in BRCA1/2 → use penetrance estimates from published data (BRCA1: up to 72% lifetime, BRCA2: up to 69%) instead of Gail model. If CHEK2/PALB2/ATM → use gene-specific penetrance adjusted by PRS and epidemiologic factors (per CARRIERS consortium model)
4. **Confidence bands:** Widen CI based on PRS confidence level and ancestry match
5. **Output:** Updated `RiskAssessment` record with `modelVersion: "composite_v1"` distinguishing it from pure Gail assessments

### 2. Update RiskAssessment model

Add field: `modelVersion String @map("model_version") @db.VarChar(30)` to track which model produced the assessment. Historical Gail-only assessments get `"gail_v1"`, new composite assessments get `"composite_v1"`.

### 3. Risk recalculation trigger

When PRS calculation completes OR when a pathogenic variant is identified, automatically generate a new RiskAssessment with the composite model. Show the user their updated risk alongside their previous Gail-only estimate so they can see how genomic data changed their profile.

### 4. Update all risk-facing screens

- RiskDashboard: show model version badge ("Based on Gail model" vs "Based on Gail model + your genetic profile")
- RiskFactors: add genomic section showing PRS percentile + any pathogenic variants as non-modifiable risk factors
- Risk trajectory: recalculate with composite model, show both curves if user wants to compare

---END---

### SESSION P0-10: Ancestry Confidence UI + Partner Testing Referral

---START---

# OncoVax — P0-10: Ancestry Confidence UI + Partner Testing Referral

## Context
P0-8 and P0-9 built PRS calculation and composite risk integration. This session adds the UX layer for communicating ancestry-based confidence and directing users without genomic data to testing options.

## What to build

### 1. Ancestry confidence visualization
On the PreventGenomic screen, add a confidence indicator that clearly shows how well the PRS model is calibrated for the user's self-reported ethnicity. Use a simple visual scale (e.g., signal bars) with plain-language explanation.

### 2. Partner testing referral
For users who don't have existing genomic data:
- Comparison table of consumer genomic options (23andMe, AncestryDNA, Color Health, Invitae)
- Estimated cost, turnaround time, what's included
- Which options provide raw data usable by our PRS calculator
- Insurance coverage information (BRCA testing covered for high-risk under ACA)
- "Get tested" CTAs with affiliate/partner links where applicable

### 3. Clinical genetic counselor referral
For users identified as high-risk (>20% lifetime risk) or with pathogenic variants:
- FindAGeneticCounselor.com integration
- NSGC directory search by zip code
- Pre-visit preparation guide (what to bring, what to ask)
- Insurance coverage navigator for genetic counseling

---END---

### SESSION P0-11: Water Quality Dashboard (EPA/EWG Integration)

---START---

# OncoVax — P0-11: Water Quality Dashboard

## Context
This begins the environmental intelligence layer — the condition-agnostic infrastructure that serves breast cancer prevention, PCOS, thyroid health, and endometriosis risk assessment equally.

Reference: `ONCOVAX_PHASE0_PREVENT_SPEC.md` Section 5.2 (Water Quality Intelligence). The LocationHistory model already exists with `environmentalData` JSON field.

## What to build

### 1. EWG Tap Water Database Integration (`apps/web/lib/water-quality.ts`)

The EWG (Environmental Working Group) maintains a public tap water database searchable by zip code. Build a library that:
- Takes a zip code → looks up the water utility serving that area
- Fetches contaminant data (PFAS, heavy metals, disinfection byproducts, pesticides)
- Compares levels to EPA MCLs (Maximum Contaminant Levels) and EWG health guidelines (which are often stricter)
- Flags PFAS compounds specifically (PFOA, PFOS, PFNA, PFHxS, PFDA, GenX)
- Generates a water quality score (0-100) with condition-specific risk annotations
- Caches results (water quality data changes infrequently — cache for 30 days per zip code)

Note: EWG may not have a public API — check if they do. If not, their data is available at ewg.org/tapwater. You may need to scrape the summary data or use the EPA SDWIS (Safe Drinking Water Information System) federal API instead: `https://data.epa.gov/efservice/WATER_SYSTEM/STATE_CODE/{state}/JSON`

### 2. Water quality page (`/prevent/exposures/water`)
- Search by zip code (pre-filled from user's current zip and location history)
- Show water utility name, source, and contaminant summary
- PFAS-specific callout with health risk explanation linking to breast cancer, PCOS, thyroid
- Filtration recommendations (NSF-certified filters by contaminant type)
- Historical view showing water quality for each zip code in user's location history

### 3. Auto-enrich LocationHistory
When a user adds a zip code to their location history, automatically fetch and store water quality data in the `environmentalData` JSON field. This enrichment runs on a background job (or inline if fast enough).

### 4. GraphQL + API
- `waterQuality(zipCode: String!): WaterQualityReport` query
- `enrichLocationEnvironmental(locationHistoryId: String!): LocationHistory` mutation

---END---

### SESSION P0-12: Product Scanner

---START---

# OncoVax — P0-12: Product Scanner (EDC Detection in Personal Care Products)

## Context
Builds the consumer product scanning feature. Users scan barcodes or search product names to identify endocrine-disrupting chemicals in their personal care products, household items, and food packaging.

Reference: `ONCOVAX_PHASE0_PREVENT_SPEC.md` Section 5.3 (Product Scanner).

## What to build

### 1. Product database + EDC flagging (`apps/web/lib/product-scanner.ts`)

Build a product lookup and EDC flagging library:
- Barcode lookup via Open Food Facts API (free, open source, covers many personal care products)
- Ingredient parsing: extract INCI (International Nomenclature of Cosmetic Ingredients) names
- EDC reference table: map ~50-100 common EDC ingredients to their category and health concern:
  - Parabens (methylparaben, propylparaben, butylparaben) → estrogen mimicry
  - Phthalates (DEP, DBP, DEHP — often listed as "fragrance") → androgen disruption
  - BPA/BPS/BPF → estrogen mimicry
  - Triclosan → thyroid disruption
  - Oxybenzone → estrogen mimicry
  - Formaldehyde releasers (DMDM hydantoin, quaternium-15) → carcinogen
- For each flagged ingredient, annotate which conditions it affects (breast cancer, PCOS, thyroid, fertility)
- Generate an overall product rating (A through F based on flagged ingredient count and severity)
- Suggest safer alternatives (store in a curated alternatives table or use EWG Skin Deep database)

### 2. New Prisma model: ProductScan
Already defined in the expansion spec. Add to schema, migrate, generate.

### 3. Product scanner page (`/prevent/exposures/products`)
- Barcode scanner (use device camera on mobile, manual barcode entry on web)
- Text search for product name
- Results: product name, brand, ingredient list with EDC flags highlighted, overall rating
- "Swap this" section with safer alternatives
- Scan history (ProductScan records) — track how many products user has scanned and swapped

### 4. Contextual framing
For each flagged ingredient, show which conditions it's relevant to:
"Methylparaben is an estrogen-mimicking compound linked to breast cancer risk and may affect hormone balance in PCOS. Found in: your moisturizer, your shampoo."

Important: include the dose-response context. Single product exposure is usually low. Cumulative exposure across 10+ products is where risk accumulates. Don't alarm users over a single product — show the portfolio view.

---END---

### SESSION P0-13: Home Environment Checklist

---START---

# OncoVax — P0-13: Home Environment Checklist

## Context
Builds a guided checklist that helps users identify and reduce EDC sources in their home environment — cookware, food storage, cleaning products, and building materials.

## What to build

### 1. Home assessment engine (`apps/web/lib/home-environment.ts`)
Structured questionnaire covering:
- **Cookware**: Non-stick (PFAS), aluminum, cast iron, stainless steel, ceramic
- **Food storage**: Plastic containers (BPA/BPS), glass, stainless steel, silicone
- **Water filtration**: None, pitcher filter, faucet mount, under-sink, whole-house, reverse osmosis
- **Cleaning products**: Conventional vs. fragrance-free/EDC-conscious
- **Air quality**: Proximity to busy road, gas stove, air purifier
- **Building materials**: Age of home (lead paint risk), recent renovations (VOCs)

For each category, score the current state and generate specific, actionable, cost-ranked swap recommendations. Tag evidence strength and cost: "Switching from non-stick to cast iron cookware is a low-cost, high-impact change that eliminates PFAS exposure from cooking."

### 2. Home assessment page (`/prevent/exposures/home`)
Interactive checklist with progress tracking. Each category expandable with education + swap recommendations. Track which swaps user has completed. Show estimated exposure reduction.

### 3. Scoring
Generate a home environment score (0-100) that feeds into the composite environmental exposure score. Weight categories by evidence strength and exposure frequency.

---END---

### SESSION P0-14: Biomarker Panel Integration

---START---

# OncoVax — P0-14: EDC Biomarker Panel Guide + Results Tracking

## Context
The highest-fidelity layer of environmental exposure intelligence. Users can get blood/urine panels measuring actual body burden of PFAS, BPA, phthalates, and parabens. This session builds the guide for getting tested and the results tracking system.

## What to build

### 1. New Prisma model: BiomarkerResult
Already defined in expansion spec. Add to schema, migrate.

### 2. Testing guide page (`/prevent/exposures/testing`)
- What the test measures and why it matters
- How to get tested: partner lab integration (or direct-order lab like Quest/LabCorp if they offer EDC panels), clinical order through PCP
- Estimated cost ($200-400 out-of-pocket, NOT covered by insurance currently)
- What to expect: sample collection, turnaround time (2-4 weeks typical)
- Important: manage expectations about what results mean and don't mean

### 3. Results upload + interpretation (`apps/web/lib/biomarker-interpreter.ts`)
- Manual result entry form (structured: analyte, value, unit)
- NHANES comparison: for each analyte, show where the user falls in the US population distribution (25th, 50th, 75th, 90th, 95th percentile reference ranges from NHANES 2017-2020)
- Condition-specific risk annotation: "Your PFOA level is at the 82nd percentile. Levels in this range have been associated with [breast cancer risk / thyroid disruption / PCOS exacerbation] in epidemiological studies."
- Source-reduction recommendations: for each elevated analyte, specific steps to reduce exposure

### 4. GraphQL: mutations for adding results, queries for results + trends

---END---

### SESSION P0-15: Longitudinal Exposure Tracking + Composite Score

---START---

# OncoVax — P0-15: Longitudinal Exposure Tracking + Environmental Risk Integration

## Context
Ties together water quality (P0-11), product scans (P0-12), home environment (P0-13), and biomarker results (P0-14) into a single composite environmental exposure score that feeds into the multi-condition risk engine.

## What to build

### 1. Composite environmental exposure engine (`apps/web/lib/environmental-score.ts`)
Calculate a weighted composite score (0-100) from:
- Location-based exposure (water quality + air quality + Superfund/TRI proximity): 30% weight
- Product exposure (product scan portfolio): 20% weight  
- Home environment (checklist score): 15% weight
- Biomarker results (actual body burden — gold standard): 35% weight if available, redistribute if not

Output feeds into the multi-condition risk assessment (Section 5 of this spec).

### 2. Trend visualization
Show how environmental exposure score changes over time:
- Before/after water filter installation
- Product swap tracking (flagged products replaced)
- Biomarker re-test comparison (annual)
- Location move impact

### 3. Environmental exposure dashboard (`/prevent/exposures`)
Overview page that synthesizes all four data sources into a single view. Top concerns, trending direction, recommended next actions. Link to condition-specific risk impact.

### 4. Integration with risk engine
Add environmental exposure score as a component in the `MultiConditionRiskAssessment`. For breast cancer, adjust the Gail model's relative risk based on environmental score (using published effect sizes where available, or precautionary estimates where evidence is emerging).

---END---

### SESSION P0-16: PCOS Risk Screening + Profile

---START---

# OncoVax — P0-EX1: PCOS Risk Screening + Profile

## Context
First condition expansion beyond breast cancer. PCOS affects 11-13% of reproductive-age women and shares environmental risk factors (PFAS, BPA, phthalates) with breast cancer. This session builds the PCOS risk screening, profile management, and Rotterdam criteria assessment.

Reference: Expansion spec Section 8.1 (PCOS Module), Section 4.1 (PcosProfile + PcosSymptomLog models).

## What to build

### 1. New Prisma models: PcosProfile + PcosSymptomLog
As defined in the expansion spec. Add to schema, add relation to Patient. Migrate.

### 2. PCOS manager (`apps/web/lib/pcos-manager.ts`)
Functions:
- `createPcosProfile`: Initialize from onboarding symptom screen
- `rotterdamScreening`: Assess Rotterdam criteria from profile data
- `calculateHomaIR`: HOMA-IR from fasting insulin + glucose
- `metabolicRiskAssessment`: Insulin resistance, cardiovascular, T2D risk categorization
- `pcosLifestyleRecommendations`: Evidence-based lifestyle guidance (low-GI nutrition, exercise for insulin sensitivity, inositol/vitamin D supplement evidence, weight management)
- `logSymptom`: Create PcosSymptomLog entry
- `getSymptomTrends`: Aggregate symptom logs into trend data (cycle regularity, acne trend, hair growth trend, weight trend)

### 3. GraphQL schema extension
Types: PcosProfile, PcosSymptomLog, PcosScreeningResult, PcosMetabolicAssessment, PcosLifestyleRecommendation
Queries: pcosProfile, pcosSymptomTrends, pcosScreeningResult
Mutations: createPcosProfile, updatePcosProfile, logPcosSymptom, runPcosScreening

### 4. Screens (shared package)
- PcosDashboard: Rotterdam status + metabolic summary + recent symptoms + quick log
- PcosRiskScreen: Rotterdam criteria checklist + lab result entry + assessment display
- PcosSymptomTracker: Daily/weekly symptom logging (cycle, acne, hair, weight, mood, fatigue) — 60-second entry like survivorship journal
- PcosMetabolic: Insulin/glucose/lipid tracking with HOMA-IR calculation
- PcosLifestyle: Evidence-based recommendations (extends shared lifestyle engine with PCOS-specific content)

### 5. Route structure
Web: `/prevent/pcos/`, `/prevent/pcos/risk`, `/prevent/pcos/symptoms`, `/prevent/pcos/metabolic`, `/prevent/pcos/interventions`
Mobile: `/prevent/pcos/` + 5 sub-routes

### 6. Onboarding extension
Add a PCOS symptom screening step to the prevent onboarding wizard (after Step 2: Reproductive History). 3-4 quick questions:
- Menstrual regularity (regular / irregular / absent / don't know)
- Acne severity (none / mild / moderate / severe)
- Unwanted hair growth (none / mild / moderate / severe)
- History of difficulty conceiving (yes / no / not applicable)
If ≥2 flagged → auto-create PcosProfile and show PCOS track on dashboard.

---END---

### SESSION P0-17: PCOS Symptom Tracker + Metabolic Dashboard

---START---

# OncoVax — P0-EX2: PCOS Symptom Tracker + Metabolic Dashboard

## Context
P0-EX1 built the PCOS profile and risk screening. This session builds the daily symptom tracking experience and the metabolic health monitoring dashboard.

## What to build

### 1. Symptom tracker UX
Design the daily PCOS symptom entry to match the survivorship journal pattern — 60-second entry, minimal friction. Include:
- Cycle day tracker (auto-calculated from last period start date)
- Symptom sliders (0-10): acne, unwanted hair growth, scalp hair loss, bloating, fatigue, mood, cravings
- Weight entry (optional, with trend visualization — avoid making this anxiety-inducing)
- Notes field
- Quick-entry mode: just tap affected symptoms, skip unaffected

### 2. Trend visualizations
- Cycle calendar view: color-coded by symptom severity, bleeding days highlighted
- Symptom trend charts: 30/90/180-day rolling averages per symptom
- Cycle length tracking: show regularity over time (huge metric for PCOS management)
- Weight trend with 7-day moving average (reduces daily fluctuation anxiety)
- Correlation view: overlay symptoms with cycle day to identify patterns

### 3. Metabolic dashboard (`/prevent/pcos/metabolic`)
- Lab result entry for: fasting insulin, fasting glucose, HbA1c, total cholesterol, LDL, HDL, triglycerides, testosterone, DHEA-S, SHBG, AMH
- HOMA-IR auto-calculation with traffic-light interpretation
- Metabolic health score combining all markers
- Comparison to reference ranges with PCOS-specific context (not just "normal" ranges — PCOS-specific thresholds)
- "Bring to your appointment" summary: formatted lab history + symptom summary that patient can share with their endocrinologist/gynecologist

### 4. Environmental connection
On the PCOS dashboard, show a card linking environmental exposure data to PCOS risk:
"Your environmental exposure profile shows elevated PFAS. Studies associate PFAS exposure with increased PCOS risk, particularly in overweight women. See your environmental exposure dashboard for details."

---END---

### SESSION P0-18: Endometriosis Module

---START---

# OncoVax — P0-EX3: Endometriosis Symptom Tracker + Intervention Navigator

## Context
Builds the endometriosis track. Key differentiator: structured pain diary that generates a provider-ready report, solving the "my doctor didn't believe my pain" problem.

Reference: Expansion spec Section 8.2, Section 4.1 (EndoProfile + EndoPainLog models).

## What to build

### 1. New Prisma models: EndoProfile + EndoPainLog
As defined. Add relations, migrate.

### 2. Endo manager (`apps/web/lib/endo-manager.ts`)
Functions:
- `createEndoProfile`: From onboarding symptom screen
- `symptomScreening`: Score symptoms, flag suspected endo, recommend specialist
- `logPain`: Create EndoPainLog entry
- `getPainTrends`: Aggregate logs into trends (pain severity by cycle phase, medication effectiveness, activity impact)
- `generateProviderReport`: Claude-generated PDF summarizing 3-6 months of pain diary data in clinical format. Includes: pain pattern analysis, cycle correlation, medication usage, functional impact score, symptom burden trend. This is the killer feature — gives patients evidence-based documentation of their experience.
- `treatmentOptions`: Evidence-based treatment navigator (hormonal, surgical, complementary)
- `findEndoSpecialists`: Directory search (use existing provider infrastructure from SURVIVE)

### 3. Screens
- EndoDashboard: Pain summary + symptom burden trend + next tracking reminder
- EndoPainTracker: Daily pain logging with body map (pelvic, back, bowel, bladder), intensity scale, medication tracking, activity impact — 60-second entry
- EndoProviderReport: View + download the generated provider summary (PDF)
- EndoInterventions: Treatment navigator with evidence grades
- EndoSpecialists: Provider directory filtered for endo expertise

### 4. Onboarding extension
Add endometriosis screening to prevent onboarding (after PCOS screen):
- Pelvic pain severity during periods (none / mild / moderate / severe / debilitating)
- Pain during intercourse (yes / no / not applicable)  
- Bowel/bladder symptoms during periods (yes / no)
- Chronic fatigue (yes / no)
- Difficulty conceiving (yes / no / not applicable)
If ≥2 flagged → auto-create EndoProfile and show endo track.

### 5. Environmental connection
Link environmental exposure profile to endometriosis risk (dioxins, PCBs, phthalates).

---END---

### SESSION P0-19: Thyroid Health Module

---START---

# OncoVax — P0-EX4: Thyroid Health Module

## Context
Thyroid dysfunction is strongly linked to PFAS/BPA exposure and affects ~5-10% of women. This module provides risk screening, lab tracking with trend visualization, and EDC risk connection.

Reference: Expansion spec Section 8.3, Section 4.1 (ThyroidProfile + ThyroidLabResult models).

## What to build

### 1. New Prisma models: ThyroidProfile + ThyroidLabResult
As defined. Add relations, migrate.

### 2. Thyroid manager (`apps/web/lib/thyroid-manager.ts`)
Functions:
- `createThyroidProfile`: From onboarding risk screen
- `thyroidRiskScreen`: Assess risk factors (family history, autoimmune history, radiation, EDC exposure)
- `addLabResult`: Store TSH, free T4, free T3, TPO antibodies, TG antibodies
- `interpretLabs`: Reference range comparison with clinical interpretation (subclinical hypo vs overt hypo vs Hashimoto's etc.)
- `getLabTrends`: Longitudinal lab visualization
- `thyroidEdcRisk`: Map user's environmental exposure profile to thyroid-specific EDC risks (PFAS disrupts thyroid at very low levels)

### 3. Screens
- ThyroidDashboard: Current status + last labs + trend sparkline + screening recommendation
- ThyroidRiskScreen: Risk factor checklist + screening recommendation + lab order guide
- ThyroidLabTracker: Lab result entry + interpretation + trend chart + reference ranges with clinical context
- ThyroidEdcConnection: Show how environmental exposures specifically affect thyroid (PFAS inhibits iodide uptake, BPA interferes with thyroid hormone receptor)

### 4. Onboarding extension
Brief thyroid risk screen in onboarding:
- Family history of thyroid disease (yes / no)
- Family history of autoimmune conditions (yes / no)
- History of radiation to head/neck (yes / no)
- Current symptoms: fatigue, weight changes, hair thinning, cold sensitivity, anxiety, heart palpitations
If ≥2 risk factors → create ThyroidProfile, recommend TSH screening.

---END---

### SESSION P0-20: Location Exposure Scoring + EPA Enrichment

---START---

# OncoVax — P0-17: Location Exposure Scoring per Zip Code

## Context
LocationHistory model already exists and users can submit residential zip code history with life stage annotations. This session builds the automated environmental data enrichment and vulnerability-weighted scoring.

Reference: `ONCOVAX_PHASE0_PREVENT_SPEC.md` Section 6.2-6.3.

## What to build

### 1. EPA data enrichment (`apps/web/lib/location-enrichment.ts`)
For each zip code in a user's location history, fetch and store:
- Water quality data (from P0-11 water-quality.ts — reuse)
- Air quality: EPA AQI API for PM2.5 annual average
- Superfund sites: EPA Superfund API — count within 1 mile, 5 miles
- TRI (Toxics Release Inventory): EPA TRI API — industrial chemical releases within 5 miles, chemical categories
- Military base proximity: DoD PFAS contamination database (known PFAS sites)
- Agricultural activity: USDA Census of Agriculture data if available per county

Store enriched data in `LocationHistory.environmentalData` JSON field.

### 2. Vulnerability-weighted scoring
Calculate `locationExposureScore` (0-100) for each location entry. Weight exposure by life stage during residence:
- Childhood (0-12): 2.0x weight (highest vulnerability to EDCs)
- Puberty (10-16): 2.5x weight (breast development window — critical for breast cancer; hormone establishment — critical for PCOS)
- Young adult (17-25): 1.5x weight
- Reproductive (25-40): 1.5x weight (pregnancy/lactation windows)
- Perimenopause (40-55): 1.0x weight
- Postmenopause (55+): 0.8x weight

Composite score = sum of (location_score × duration_months × vulnerability_weight) / total_months

### 3. Update LocationHistory screen
Show environmental data per location: water quality, air quality, Superfund proximity, TRI sites. Vulnerability weighting visualization (highlight high-exposure + high-vulnerability periods).

### 4. Batch enrichment job
Create a script/cron that enriches un-enriched LocationHistory entries. New entries get enriched on creation; existing entries re-enriched monthly.

---END---

### SESSION P0-21: Population Aggregation + Cross-Condition Heatmap

---START---

# OncoVax — P0-20/P0-21: Population Aggregation + Cross-Condition Heatmap

## Context
The flagship data layer. Aggregates anonymized, consented user data into zip-code-level population statistics, enabling geographic risk pattern detection across multiple endocrine conditions simultaneously.

Reference: `ONCOVAX_PHASE0_PREVENT_SPEC.md` Section 6.3-6.4. New: cross-condition aggregation from expansion spec.

## What to build

### 1. New Prisma model: ZipCodeAggregate
As defined in expansion spec. Add to schema, migrate.

### 2. Aggregation pipeline (`apps/web/lib/population-aggregation.ts`)
- Scheduled job (daily or weekly) that:
  1. Queries all users with DataConsent level ≥ 1 and LocationHistory entries
  2. Groups by zip code
  3. For zip codes with ≥ 10 users (k-anonymity threshold): calculates aggregated demographics, mean risk scores (breast cancer, PCOS prevalence, endo prevalence, thyroid prevalence), environmental profiles, biomarker means (if ≥5 biomarker results in that zip)
  4. Upserts ZipCodeAggregate records
- CRITICAL: never store individual user data in aggregates. Only statistical summaries.

### 3. Cross-condition hotspot detection
Flag zip codes where ≥ 2 endocrine conditions show elevated prevalence/risk AND environmental score is elevated. These are the "signal" zip codes that suggest environmental causation rather than confounders.

### 4. Heatmap visualization (`/prevent/location/map`)
Interactive map (Mapbox — already in stack) with toggleable layers:
- Water quality (PFAS concentration by zip)
- Air quality (PM2.5)
- Superfund sites (point markers)
- TRI sites (point markers)
- Platform risk data (mean composite risk by zip — only where ≥10 users)
- Cross-condition hotspots (highlighted zip codes)
- User's personal location history overlay

### 5. Privacy controls
- Only show aggregated data for zip codes with ≥10 users
- Never show individual user data on the map
- Consent level 1 = included in aggregates. Consent level 2+ = included in research datasets.
- User can see their own location history overlay on the map (private to them)

---END---

### SESSION P0-22: Cross-Condition Correlation Engine + Dashboard Redesign

---START---

# OncoVax — P0-EX5: Cross-Condition Correlation Engine + Dashboard Redesign

## Context
Ties all condition-specific modules and environmental intelligence into a unified multi-condition dashboard. Builds the cross-condition correlation analysis that is the platform's novel contribution.

## What to build

### 1. Cross-condition correlation engine (`apps/web/lib/cross-condition-engine.ts`)
For each user, analyze:
- Which risk factors are shared across their active condition tracks
- Which environmental exposures affect multiple conditions simultaneously
- Generate the "shared risk factor" insight: "Your elevated PFAS exposure is contributing to risk across breast cancer, PCOS, and thyroid dysfunction. The single most impactful action is..."
- Prioritize interventions by cross-condition benefit (reducing PFAS helps ALL three → higher priority than a breast-cancer-only intervention)

### 2. Redesigned `/prevent` dashboard
Transform from breast-cancer-only to multi-condition overview (per Section 3.2 of this spec):
- Condition track cards (breast, PCOS, endo, thyroid — show only user-relevant ones)
- Environmental exposure summary card
- Location risk card
- Lifestyle adherence card  
- Cross-condition insight card (the "aha" moment — "These 3 conditions share an environmental driver")
- Research contribution card

### 3. Mobile dashboard update
Mirror the web dashboard redesign in the mobile app under `/prevent/`.

---END---

### SESSION P0-23: Expanded Onboarding + Multi-Condition Trial Matcher

---START---

# OncoVax — P0-EX6: Expanded Onboarding + Multi-Condition Trial Matching

## Context
Final expansion session. Updates the onboarding wizard to screen for all conditions and expands the preventive trial matcher to include PCOS, endometriosis, and thyroid clinical trials.

## What to build

### 1. Expanded onboarding wizard
Current 5-step wizard → 7-step wizard:
1. Demographics (existing)
2. Reproductive History (existing)
3. **PCOS Screening** (NEW — 4 quick questions)
4. **Endometriosis Screening** (NEW — 5 quick questions)
5. Family + Personal History (existing, expanded with thyroid/autoimmune family history)
6. Lifestyle (existing)
7. **Environmental Baseline** (NEW — water source, cookware types, product concerns)

Auto-create condition-specific profiles based on screening responses. Show only relevant condition tracks on dashboard.

### 2. Expanded trial matcher
Extend `preventive-matcher.ts` (from Preventive Trial Matcher spec) to search for:
- PCOS clinical trials (treatment, lifestyle intervention, medication)
- Endometriosis clinical trials (treatment, surgical, hormonal)
- Thyroid clinical trials (autoimmune thyroid, treatment optimization)
- Multi-condition studies (EDC exposure + health outcomes)

Update the `/prevent/trials` public landing page to include all condition categories with condition-specific filters.

### 3. ClinicalTrials.gov query expansion
Add new ingestion queries for PCOS, endometriosis, and thyroid trials to the trial-sync worker. Classify with expanded `trial_category` values.

---END---

---

## Summary: Total Remaining Sessions

| Session ID | Name | Sessions | Status |
|-----------|------|----------|--------|
| P0-8 | PRS Calculation Engine | 1 | Not built |
| P0-9 | PRS → Composite Risk Integration | 1 | Not built |
| P0-10 | Ancestry UI + Partner Testing | 1 | Not built |
| P0-11 | Water Quality Dashboard | 1 | Not built |
| P0-12 | Product Scanner | 1 | Not built |
| P0-13 | Home Environment Checklist | 1 | Not built |
| P0-14 | Biomarker Panel Integration | 1 | Not built |
| P0-15 | Longitudinal Exposure Tracking + Composite Score | 1 | Not built |
| P0-EX1 | PCOS Risk Screening + Profile | 1 | Not built |
| P0-EX2 | PCOS Symptom Tracker + Metabolic Dashboard | 1 | Not built |
| P0-EX3 | Endometriosis Module | 1 | Not built |
| P0-EX4 | Thyroid Health Module | 1 | Not built |
| P0-17 | Location Exposure Scoring | 1 | Not built |
| P0-20/21 | Population Aggregation + Heatmap | 1 | Not built |
| P0-EX5 | Cross-Condition Correlation + Dashboard Redesign | 1 | Not built |
| P0-EX6 | Expanded Onboarding + Multi-Condition Trials | 1 | Not built |
| **Total** | | **16 sessions** | |

Combined with the 7 completed P0 sessions, the full Phase 0 is **23 sessions** — a comprehensive women's endocrine health risk intelligence platform built on top of a fully functional cancer care platform.
