# Phase 0: PREVENT — Pre-Diagnosis Risk Intelligence & Primary Prevention

## Technical Specification v1.0

**Author:** Rett (Happy Medium)
**Date:** March 2026
**Depends on:** Phase 1 (MATCH) patient profiles, auth, document ingestion; Phase 5 (SURVIVE) lifestyle engine, environmental tracker
**Purpose:** Standalone spec for Claude Code. Extends the OncoVax platform upstream from diagnosis into primary prevention — the software layer that helps women understand, track, and actively reduce their breast cancer risk before a single malignant cell exists. Designed to reuse maximum architecture from SURVIVE module while serving a fundamentally different user: a healthy woman managing risk, not a survivor managing recurrence.

---

## Table of Contents

1. [Strategic Context](#1-strategic-context)
2. [Module Architecture](#2-module-architecture)
3. [Composite Risk Engine](#3-composite-risk-engine)
4. [Genomic Risk Layer](#4-genomic-risk-layer)
5. [Environmental Exposure Intelligence](#5-environmental-exposure-intelligence)
6. [Location History & Population Risk Mapping](#6-location-history--population-risk-mapping)
7. [Lifestyle Risk Optimizer](#7-lifestyle-risk-optimizer)
8. [Preventive Intervention Navigator](#8-preventive-intervention-navigator)
9. [Risk-Adapted Screening Planner](#9-risk-adapted-screening-planner)
10. [Data Contribution & Research Flywheel](#10-data-contribution--research-flywheel)
11. [Data Model Extensions](#11-data-model-extensions)
12. [Integration Points with Existing Phases](#12-integration-points-with-existing-phases)
13. [Build Sequence](#13-build-sequence)
14. [Open Questions](#14-open-questions)

---

## 1. Strategic Context

### 1.1 The Problem

Breast cancer primary prevention is the most underdeveloped layer of the cancer care continuum relative to the scale of the disease. The numbers tell the story:

- ~322,000 women will be diagnosed with invasive breast cancer in the US in 2026
- 85% of those women have no family history — their cancer arises from somatic mutations accumulated over a lifetime, amplified by hormonal exposure and environmental factors
- The entire clinical prevention apparatus targets the ~15% with known high-risk mutations (BRCA1/2, CHEK2, PALB2, ATM)
- For the remaining 85%, prevention consists of lifestyle advice (exercise, limit alcohol, maintain healthy weight) that has not meaningfully bent the incidence curve
- Incidence continues rising at 1% annually, with steeper increases in women under 50 (1.4%/year)

The gap: **no product exists that gives a woman a dynamic, personalized, longitudinal risk trajectory combining her genetics, environmental exposures, hormonal history, lifestyle, and breast tissue characteristics — and then connects that risk assessment to concrete, evidence-based interventions.**

### 1.2 Why Now

Three convergences make this buildable today:

1. **Polygenic risk scores are clinically validated and commercially available.** The 313-SNP PRS from the Breast Cancer Association Consortium is well-calibrated, explains >30% of breast cancer heritability, and can stratify women into risk groups with 4.37-fold differences between top and bottom percentiles. Consumer genomic panels can generate this data for ~$100-200.

2. **Environmental exposure testing is entering the consumer market.** PFAS, BPA, phthalate, and paraben levels can be measured from blood/urine panels. Companies are beginning to offer consumer EDC panels. The evidence linking EDCs to breast cancer is strengthening rapidly — PFAS found in 98% of US population, with studies showing dose-response relationships.

3. **The mRNA vaccine pipeline is creating a prevention endpoint.** Cleveland Clinic's alpha-lactalbumin vaccine (Phase 2 starting late 2026) is designed as a true preventive vaccine for high-risk women. Multiple other preventive vaccine trials are recruiting. For the first time, there's a *thing to do* for high-risk women beyond surgery and chemoprevention drugs.

### 1.3 User Personas

**Primary: The Informed Preventer**
Woman aged 25-55 who is aware of breast cancer risk (family history, personal concern, or general health consciousness) and wants to actively manage it. May have had genetic testing or is considering it. Motivated, health-literate, willing to invest time and modest money in risk reduction.

**Secondary: The Family Connector**
Daughter, sister, or niece of a current OncoVax user (survivor using SURVIVE module). Enters the platform because her family member's diagnosis made her aware of her own risk. This is the organic growth flywheel — every survivor on the platform is a potential referral source for 2-5 family members who should be in PREVENT.

**Tertiary: The Clinical Referral**
Woman referred by her OB/GYN, primary care provider, or genetic counselor after a risk assessment or genetic test result. May have elevated PRS, CHEK2 variant, dense breast tissue, or other moderate-risk factors that don't reach the BRCA threshold but warrant active management.

### 1.4 Design Principles

1. **Empowerment, not anxiety.** Every risk communication must be paired with an actionable intervention. Never show a risk number without showing what can be done about it.
2. **Dynamic, not static.** Risk is not a single number — it's a trajectory that changes with age, hormonal status, environmental exposure, and lifestyle. The platform updates continuously.
3. **Evidence-graded, not alarmist.** Every recommendation is tagged with evidence strength (strong/moderate/emerging/precautionary). Never present precautionary advice with the same weight as meta-analysis-backed guidance.
4. **Longitudinal by design.** Value compounds over time. A 5-year user has a dramatically more useful risk profile than a new user. Build for retention.
5. **Research-generative.** Every consenting user contributes to the dataset that makes the risk models better for everyone. The platform is both a product and a research instrument.

---

## 2. Module Architecture

### 2.1 Entry Points

```typescript
type PreventEntryPoint =
  | "direct"              // Organic / paid acquisition
  | "survivor_referral"   // Family member of SURVIVE user
  | "clinical_referral"   // Provider-initiated
  | "genomic_result"      // User uploads existing genetic test
  | "screening_result"    // User uploads mammogram / density report
  | "trial_interest";     // User found a preventive trial via MATCH
```

### 2.2 Route Structure

```
/prevent                              Prevention home — risk dashboard
/prevent/onboarding                   Guided intake questionnaire
/prevent/risk                         Composite risk score + trajectory
/prevent/risk/genomic                 Genomic risk detail (PRS + monogenic)
/prevent/risk/hormonal                Hormonal/reproductive risk factors
/prevent/risk/environmental           Environmental exposure dashboard
/prevent/risk/lifestyle               Lifestyle risk factors
/prevent/risk/tissue                  Breast density + tissue characteristics
/prevent/risk/history                 Location history + population-level data
/prevent/exposures                    Environmental exposure tracker
/prevent/exposures/water              Water quality by location
/prevent/exposures/products           Personal care product scanner
/prevent/exposures/home               Home environment checklist
/prevent/exposures/testing            EDC blood/urine panel guide + results
/prevent/lifestyle                    Evidence-based lifestyle engine (reuse SURVIVE)
/prevent/lifestyle/exercise           Exercise programming
/prevent/lifestyle/nutrition          Nutrition guidance
/prevent/lifestyle/alcohol            Alcohol risk calculator
/prevent/lifestyle/sleep              Sleep/circadian guidance
/prevent/screening                    Risk-adapted screening planner
/prevent/interventions                Preventive intervention navigator
/prevent/interventions/chemoprevention  Tamoxifen/AI decision support
/prevent/interventions/vaccines       Preventive vaccine trial matching
/prevent/interventions/surgery        Prophylactic surgery information (high-risk only)
/prevent/contribute                   Data contribution dashboard
/prevent/contribute/history           Location history submission
/prevent/contribute/research          Research study matching
/prevent/journal                      Symptom and wellness journal (shared with SURVIVE)
```

### 2.3 Onboarding Flow

The onboarding questionnaire is the critical conversion event. It needs to collect enough data to generate a meaningful initial risk estimate while being completable in 10-15 minutes. Additional data deepens the model over time.

```typescript
interface PreventOnboarding {
  // Tier 1: Required for initial risk estimate (10 min)
  demographics: {
    dateOfBirth: string;
    biologicalSex: "female";            // Platform is breast cancer focused
    selfReportedEthnicity: Ethnicity;   // Critical for PRS calibration
    currentZipCode: string;
  };

  reproductiveHistory: {
    ageAtMenarche: number | null;
    pregnancies: number;
    ageAtFirstLiveBirth: number | null;
    breastfeedingMonths: number;
    currentMenopausalStatus: "premenopausal" | "perimenopausal" | "postmenopausal";
    ageAtMenopause: number | null;
    oralContraceptiveUse: {
      ever: boolean;
      currentlyUsing: boolean;
      totalYears: number | null;
    };
    hrtUse: {
      ever: boolean;
      currentlyUsing: boolean;
      type: "estrogen_only" | "combined" | "unknown" | null;
      totalYears: number | null;
    };
  };

  familyHistory: {
    firstDegreeRelativesWithBreastCancer: number;
    secondDegreeRelativesWithBreastCancer: number;
    anyRelativeWithOvarianCancer: boolean;
    anyMaleRelativeWithBreastCancer: boolean;
    youngestAgeAtDiagnosisInFamily: number | null;
    knownGeneticMutationsInFamily: string[];   // BRCA1, BRCA2, CHEK2, etc.
  };

  personalHistory: {
    previousBreastBiopsies: number;
    atypicalHyperplasia: boolean;
    lobularCarcinomaInSitu: boolean;
    previousChestRadiation: boolean;       // e.g., for Hodgkin lymphoma
    denseBreastTissue: boolean | "unknown";
  };

  lifestyle: {
    currentBMI: number | null;
    alcoholDrinksPerWeek: number;
    exerciseMinutesPerWeek: number;
    exerciseType: ("aerobic" | "strength" | "both" | "none");
    smokingStatus: "never" | "former" | "current";
  };

  // Tier 2: Optional, deepens model (collected over time)
  genomicData?: {
    hasExistingGenomicTest: boolean;
    provider?: string;                    // 23andMe, AncestryDNA, Color, Myriad, etc.
    willingToUploadRawData?: boolean;
    knownVariants?: GeneticVariant[];
  };

  environmentalBaseline?: {
    currentWaterSource: "municipal" | "well" | "bottled" | "filtered" | "unknown";
    cookwareTypes: string[];
    personalCareProductConcerns: boolean;
    occupationalExposures: string[];
    previousEDCTesting: boolean;
  };

  locationHistory?: ZipCodeHistoryEntry[];  // See Section 6

  breastImagingHistory?: {
    lastMammogramDate: string | null;
    mammogramFrequency: string | null;
    lastBreastMRIDate: string | null;
    breastDensityCategory: "A" | "B" | "C" | "D" | null;  // BI-RADS density
  };
}
```

### 2.4 Notification Cadence

Prevention users require a very different engagement model than active treatment or survivorship users. The risk of over-notifying is health anxiety. The risk of under-notifying is abandonment.

```typescript
const PREVENT_NOTIFICATION_CADENCE = {
  // Onboarding week: daily micro-engagements to build habit
  week1: {
    frequency: "daily",
    content: "onboarding_completion_nudges",  // Complete your profile to improve your risk estimate
  },

  // Month 1: weekly insights to demonstrate value
  month1: {
    frequency: "weekly",
    content: "risk_factor_deep_dives",        // Each week explores one risk factor in depth
  },

  // Ongoing: monthly check-ins + triggered alerts
  ongoing: {
    baseFrequency: "monthly",
    content: "monthly_risk_update",           // Your risk trajectory this month
    triggered: [
      "screening_reminder",                   // Upcoming mammogram based on risk-adapted schedule
      "new_preventive_trial",                 // New trial matched to your profile
      "exposure_alert",                       // PFAS contamination detected in your water district
      "research_finding",                     // New study relevant to your risk profile
      "product_recall",                       // EDC-related product recall
      "location_risk_update",                 // Updated risk data for your zip code
    ],
  },

  // Lifecycle triggers
  transitions: [
    "approaching_40",                         // Screening guideline trigger
    "perimenopause_detected",                 // Risk profile shift
    "family_member_diagnosed",                // Significant risk recalculation
    "moved_zip_code",                         // Environmental exposure recalculation
    "annual_risk_review",                     // Comprehensive annual assessment
  ],
};
```

---

## 3. Composite Risk Engine

### 3.1 Architecture

The risk engine is the core of Phase 0. It combines multiple independent risk signals into a single composite risk estimate with uncertainty bounds, then maps that estimate to a risk category that drives screening and intervention recommendations.

```typescript
interface CompositeRiskAssessment {
  patientId: string;
  assessmentDate: string;
  modelVersion: string;

  // Individual risk components
  components: {
    polygenicRisk: {
      score: number | null;               // PRS value
      percentile: number | null;          // Population percentile
      snpCount: number | null;            // Number of SNPs in model
      ancestry: string;                   // Calibration population
      source: "uploaded" | "imputed" | "unavailable";
      confidence: "high" | "moderate" | "low";
    };

    monogenicRisk: {
      testedGenes: string[];
      pathogenicVariants: GeneticVariant[];
      vusVariants: GeneticVariant[];      // Variants of uncertain significance
      source: "clinical_test" | "consumer_panel" | "family_history_inferred" | "untested";
    };

    epidemiologicRisk: {
      score: number;                      // ERS from Gail/Tyrer-Cuzick/CanRisk model
      factors: {
        name: string;
        value: string | number;
        riskContribution: "increases" | "decreases" | "neutral";
        modifiable: boolean;
        evidenceStrength: "strong" | "moderate" | "emerging";
      }[];
    };

    environmentalRisk: {
      estimatedExposureScore: number | null;
      measuredExposures: EDCMeasurement[];
      locationBasedRisk: LocationRiskEstimate | null;
      confidence: "measured" | "estimated" | "unknown";
    };

    tissueRisk: {
      breastDensity: "A" | "B" | "C" | "D" | null;
      previousBiopsyFindings: string[];
      source: "mammogram_report" | "self_reported" | "unavailable";
    };
  };

  // Composite outputs
  composite: {
    lifetimeRisk: {
      estimate: number;                   // Percentage (e.g., 23.4)
      confidenceInterval: [number, number];
      comparedToPopulationAverage: number; // 12.9% for average US woman
      percentileInPlatformCohort: number | null;
    };

    fiveYearRisk: {
      estimate: number;
      confidenceInterval: [number, number];
    };

    tenYearRisk: {
      estimate: number;
      confidenceInterval: [number, number];
    };

    riskTrajectory: {
      agePoints: number[];                // e.g., [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]
      cumulativeRisk: number[];           // Risk at each age point
      populationComparison: number[];     // Average population risk at same ages
    };

    riskCategory: "population_average" | "slightly_elevated" | "moderate" | "high" | "very_high";
    // population_average: <15% lifetime
    // slightly_elevated: 15-20%
    // moderate: 20-25%
    // high: 25-35%
    // very_high: >35% (or BRCA carrier)
  };

  // What can change
  modifiableFactors: {
    factor: string;
    currentContribution: string;          // e.g., "Adds ~2% lifetime risk"
    potentialReduction: string;           // e.g., "Could reduce lifetime risk by ~1.5%"
    intervention: string;                 // e.g., "Reduce alcohol to <3 drinks/week"
    evidenceStrength: "strong" | "moderate" | "emerging";
    difficulty: "easy" | "moderate" | "challenging";
  }[];

  // Recommended actions based on risk category
  recommendedActions: RecommendedAction[];
}
```

### 3.2 Risk Model Integration

For v1, we use published, validated risk prediction models rather than building our own. The platform's value is in *assembling the inputs* and *presenting the outputs*, not in inventing new risk mathematics.

```typescript
// Primary model: Tyrer-Cuzick (IBIS) — most comprehensive for clinical use
// Integrates: family history, reproductive factors, BMI, breast density, HRT,
// atypical hyperplasia, LCIS, and (optionally) PRS
// Limitation: validated primarily in European-descent populations

// Secondary model: BOADICEA/CanRisk — best for genetic risk integration
// Integrates: monogenic variants (BRCA1/2, PALB2, CHEK2, ATM, RAD51C/D),
// PRS (313-SNP), family history, reproductive factors, mammographic density
// Limitation: requires more detailed family history input

// Supplementary: Gail Model — simplest, fastest initial estimate
// Integrates: age, age at menarche, age at first birth, biopsy history, 
// first-degree relatives, race/ethnicity
// Limitation: underestimates risk for women with strong family history

interface RiskModelConfig {
  primaryModel: "tyrer_cuzick_v8" | "canrisk_v2";
  fallbackModel: "gail";
  prsIntegration: "canrisk_native" | "tyrer_cuzick_addon" | "standalone";
  
  // Model selection logic
  selectModel(profile: PreventOnboarding): string {
    // If monogenic variants known → CanRisk (best genetic integration)
    // If PRS available + family history detailed → CanRisk
    // If standard risk factors only → Tyrer-Cuzick
    // If minimal data (onboarding incomplete) → Gail for initial estimate
  }
}
```

### 3.3 Risk Communication Design

This is the highest-stakes UX in the entire platform. How you communicate risk determines whether you empower or terrify.

```typescript
interface RiskCommunication {
  // NEVER show a bare percentage
  // ALWAYS show: your risk, average risk, what you can do

  primaryDisplay: {
    format: "comparison";
    example: "Your estimated lifetime risk is 22%. The average woman's is 13%. Here's what affects your number and what you can change.";
  };

  // Visual: risk thermometer showing population distribution
  // User's position highlighted with confidence band
  // Modifiable factors shown as "sliders" that move the position

  contextualization: {
    // Always include the flip side
    example: "22% lifetime risk means there's a 78% chance you won't develop breast cancer, even without any changes.";
  };

  uncertaintyDisplay: {
    // Show confidence intervals, not false precision
    example: "Your risk estimate ranges from 18% to 27% based on available data. Adding genetic testing would narrow this range.";
  };

  actionOrientation: {
    // Immediately follow risk with actions
    example: "Based on your profile, the three highest-impact actions are...";
  };

  // Anxiety management
  anxietyGuardrails: {
    noRawNumbersWithoutContext: true;
    alwaysShowModifiableFactors: true;
    includePopulationComparison: true;
    limitNotificationFrequency: true;
    offerAnxietyManagementResources: true;  // Link to SURVIVE psychosocial module
    neverUseWordsCertainOrGuarantee: true;
  };
}
```

---

## 4. Genomic Risk Layer

### 4.1 PRS Integration

```typescript
interface PRSIntegration {
  // Supported data sources for PRS calculation
  dataSources: {
    // Tier 1: Clinical genetic testing (gold standard)
    clinicalPanels: {
      providers: ["Color", "Myriad", "Invitae", "Ambry", "GeneDx"];
      dataFormat: "clinical_report" | "vcf";
      prsAvailable: boolean;  // Some clinical panels now include PRS
    };

    // Tier 2: Consumer genomic data (requires reprocessing)
    consumerPanels: {
      providers: ["23andMe", "AncestryDNA"];
      dataFormat: "raw_genotype_file";
      processing: "extract_breast_cancer_snps_and_calculate_prs";
      // Use published 313-SNP PRS weights from Mavaddat et al. 2019
      // Intersect with available SNPs on consumer array
      // Impute missing SNPs where possible
      // Flag confidence level based on SNP coverage
    };

    // Tier 3: Platform-facilitated testing
    partnerTesting: {
      // Partner with consumer genomic testing provider
      // Offer subsidized breast cancer-focused panel
      // Includes PRS + monogenic variant screening
      estimatedCost: "$99-199";
      turnaround: "2-4 weeks";
    };
  };

  // PRS calculation pipeline
  pipeline: {
    step1_extractSNPs: {
      // Extract breast cancer-associated SNPs from raw genotype data
      // Reference: Mavaddat et al. 2019 (313-SNP model)
      // Also extract SNPs for ER+/ER- subtype-specific PRS
      input: "raw_genotype_file";
      output: "extracted_snp_dosages";
    };

    step2_qualityControl: {
      // Check SNP call rates, identify missing SNPs
      // Flag if <80% of model SNPs are available
      // Estimate imputation accuracy for missing SNPs
      minSNPCoverage: 0.80;
      imputationMethod: "population_frequency_based";
    };

    step3_calculatePRS: {
      // Sum of (effect_allele_dosage × log_OR) for each SNP
      // Standardize to population mean and SD
      // Calibrate to self-reported ethnicity
      // CRITICAL: PRS must be calibrated to the correct ancestral population
      // Models trained on European data perform worse for other ancestries
      ancestryCalibration: {
        european: "full_313_snp_model";
        african: "162_variant_tnbc_model";      // Li et al. 2026
        asian: "separate_calibration_required";
        hispanic: "separate_calibration_required";
        mixed: "weighted_average_with_uncertainty";
      };
    };

    step4_integrateIntoRiskModel: {
      // Feed PRS percentile into CanRisk or Tyrer-Cuzick
      // PRS adjusts baseline risk multiplicatively
      // Top 1% PRS → ~4.4x risk of ER+ disease
      // Bottom 1% PRS → ~0.16x risk of ER+ disease
    };
  };

  // Ancestry limitations — must be transparent
  ancestryDisclosure: {
    message: string;  // "PRS models are most accurate for women of European ancestry. 
                      //  If you are of African, Asian, Hispanic, or mixed ancestry, your 
                      //  PRS estimate has wider uncertainty. We use the best available 
                      //  ancestry-specific models and clearly flag confidence levels."
    showConfidenceDegradation: boolean;  // Visual indicator of model confidence by ancestry
  };
}
```

### 4.2 Monogenic Variant Handling

```typescript
interface MonogenicVariantDisplay {
  // For users who upload clinical genetic test results
  
  highRiskGenes: {
    genes: ["BRCA1", "BRCA2"];
    action: "immediate_genetic_counseling_referral";
    riskLevel: "very_high";               // 50-72% lifetime risk
    interventionOptions: [
      "enhanced_screening",               // Annual MRI + mammography from age 25
      "chemoprevention",                  // Tamoxifen or aromatase inhibitor
      "prophylactic_surgery",             // Risk-reducing mastectomy discussion
      "preventive_vaccine_trials",        // Cleveland Clinic, BioNTech programs
      "oophorectomy_discussion",          // Reduces breast + ovarian cancer risk
    ];
  };

  moderateRiskGenes: {
    genes: ["CHEK2", "PALB2", "ATM", "RAD51C", "RAD51D"];
    action: "genetic_counseling_recommended";
    riskLevel: "moderate_to_high";        // 20-40% lifetime risk depending on variant
    interventionOptions: [
      "enhanced_screening",
      "chemoprevention_discussion",
      "preventive_vaccine_trials",
    ];
  };

  variantsOfUncertainSignificance: {
    action: "acknowledge_and_monitor";
    message: "This variant hasn't been definitively linked to increased risk. 
              We'll update your profile as new research clarifies its significance.";
    autoUpdateOnReclassification: true;   // ClinVar monitoring
  };
}
```

---

## 5. Environmental Exposure Intelligence

### 5.1 Architecture

Extends SURVIVE Section 6.4 (Environmental Exposure Reduction) into a full tracking and intelligence system.

```typescript
interface EnvironmentalExposureSystem {
  // Three layers of environmental risk assessment

  layer1_locationBased: {
    // Automatic, based on current zip code
    waterQuality: WaterQualityReport;
    airQuality: AirQualityReport;
    superfundProximity: SuperfundReport;
    industrialFacilities: TRIFacilityReport;
    source: "epa_apis" | "ewg_database" | "state_health_dept";
  };

  layer2_productBased: {
    // User-initiated, via product scanner
    personalCareProducts: ProductScan[];
    householdProducts: ProductScan[];
    foodPackaging: FoodPackagingAssessment;
    cookware: CookwareAssessment;
    source: "ewg_skin_deep" | "inci_database" | "product_barcode_lookup";
  };

  layer3_biomarkerBased: {
    // Highest fidelity, requires blood/urine testing
    pfasPanel: PFASMeasurement[];
    bpaAndAnalogs: BPAMeasurement[];
    phthalates: PhthalateMeasurement[];
    parabens: ParabenMeasurement[];
    pesticideMetabolites: PesticideMeasurement[];
    heavyMetals: HeavyMetalMeasurement[];
    source: "partner_lab" | "user_uploaded_results";
    retestCadence: "annual";
  };
}
```

### 5.2 Water Quality Intelligence

```typescript
interface WaterQualityReport {
  zipCode: string;
  waterSystem: string;                    // Name of water utility
  dataSource: string;                     // EWG Tap Water Database, EPA SDWIS
  lastUpdated: string;

  pfasDetection: {
    detected: boolean;
    compounds: {
      name: string;                       // PFOA, PFOS, PFNA, PFHxS, etc.
      level: number;                      // ppt (parts per trillion)
      epaLimit: number | null;            // EPA MCL if established
      healthAdvisory: number | null;      // EPA health advisory level
      exceedsLimit: boolean;
    }[];
    overallRisk: "low" | "moderate" | "elevated" | "high";
  };

  otherContaminants: {
    name: string;
    level: number;
    unit: string;
    exceedsGuideline: boolean;
    breastCancerRelevance: "direct" | "indirect" | "none";
  }[];

  filtrationRecommendation: {
    needed: boolean;
    type: string;                         // "Activated carbon", "Reverse osmosis", etc.
    targetContaminants: string[];
    estimatedCost: string;
    // Evidence-based, not sales pitch
    source: "NSF_certified_filters";
  };
}
```

### 5.3 Product Scanner

```typescript
interface ProductScanner {
  // Barcode scan → ingredient lookup → EDC flagging
  
  scanProduct(barcode: string): Promise<ProductScan>;
  searchProduct(name: string): Promise<ProductScan[]>;

  interface ProductScan {
    productName: string;
    brand: string;
    category: "skincare" | "haircare" | "cosmetics" | "cleaning" | "food_packaging" | "cookware";
    
    ingredients: {
      name: string;
      inciName: string;                   // International Nomenclature of Cosmetic Ingredients
      isEDC: boolean;
      edcCategory: "estrogen_mimic" | "androgen_disruptor" | "thyroid_disruptor" | "none";
      breastCancerEvidence: "strong" | "moderate" | "emerging" | "precautionary" | "none";
      specificConcern: string | null;     // e.g., "Paraben — mimics estrogen at receptor level"
    }[];

    overallRating: "A" | "B" | "C" | "D" | "F";
    flaggedIngredients: number;
    
    alternatives: {
      productName: string;
      brand: string;
      rating: "A" | "B";
      priceComparison: "cheaper" | "similar" | "more_expensive";
    }[];

    // Important: don't be alarmist about trace exposures
    contextNote: string;                  // "The dose makes the poison. Single product exposure 
                                          //  is typically low-risk. Cumulative exposure across 
                                          //  many products is where risk accumulates."
  };
}
```

### 5.4 Biomarker Testing Integration

```typescript
interface EDCBiomarkerPanel {
  // Partner lab integration for actual body burden measurement
  
  panelDefinition: {
    name: "OncoVax Environmental Exposure Panel";
    sampleType: "blood_and_urine";
    analytes: {
      pfas: ["PFOA", "PFOS", "PFNA", "PFHxS", "PFDA", "PFUnDA", "PFDoDA", "PFBS"];
      bisphenols: ["BPA", "BPS", "BPF"];
      phthalates: ["DEHP", "DBP", "BBP", "DEP", "DMP"];  // Measured as metabolites
      parabens: ["methylparaben", "ethylparaben", "propylparaben", "butylparaben"];
      pesticides: ["DDT_metabolites", "atrazine_metabolites"];
    };
    estimatedCost: "$200-400";
    partnerLabs: string[];                // To be determined — Quest, LabCorp, specialty labs
  };

  resultInterpretation: {
    // Compare to NHANES population reference ranges
    // Flag values above 75th, 90th, 95th percentile
    // Provide specific source-reduction recommendations for elevated analytes
    referencePopulation: "NHANES_2017_2020";
    
    interpretationTemplate: {
      elevated: "Your {analyte} level ({value} {unit}) is above the {percentile}th 
                percentile of the US population. The most common sources of {analyte} 
                exposure are {sources}. Here are specific steps to reduce your exposure: {steps}";
      normal: "Your {analyte} level ({value} {unit}) is within typical range. 
              Continue your current exposure reduction practices.";
    };
  };

  longitudinalTracking: {
    // Track biomarker trends over time
    retestInterval: "12_months";
    trendVisualization: true;             // Show improvement after exposure reduction
    correlationWithRiskScore: true;       // How biomarker changes affect composite risk
  };
}
```

---

## 6. Location History & Population Risk Mapping

### 6.1 Concept

This is the novel data layer that doesn't exist anywhere else. By collecting residential zip code history from consenting users, the platform can build a population-scale dataset correlating geographic exposure patterns with cancer outcomes. Over time, this becomes one of the most valuable epidemiological datasets in existence.

### 6.2 Data Model

```typescript
interface ZipCodeHistoryEntry {
  zipCode: string;
  state: string;
  moveInDate: string;                     // Month/year (not exact day — privacy)
  moveOutDate: string | "current";
  residenceType: "house" | "apartment" | "condo" | "other";
  waterSource: "municipal" | "well" | "bottled" | "filtered" | "unknown";
  
  // Optional enrichment (user-provided)
  nearbyIndustry: string[];               // "Manufacturing plant", "Military base", etc.
  knownContamination: boolean;            // "Was there known contamination in your area?"
  agriculturalProximity: boolean;         // Within 1 mile of agricultural operations
  
  // Duration calculated
  durationMonths: number;
  
  // Life stage during residence (critical for windows of vulnerability)
  lifeStagesDuringResidence: LifeStage[];
}

type LifeStage = 
  | "childhood"           // 0-12 — highest vulnerability to EDCs
  | "puberty"             // 10-16 — breast development window
  | "young_adult"         // 17-25 — breast maturation
  | "reproductive"        // 25-40 — pregnancy/lactation windows
  | "perimenopause"       // 40-55 — hormonal transition
  | "postmenopause";      // 55+ — continued but lower vulnerability

interface LocationRiskEstimate {
  // For each zip code in history, estimate exposure risk
  
  zipCode: string;
  duration: number;
  lifeStages: LifeStage[];
  
  // Environmental data (pulled from EPA, state databases)
  waterContaminants: {
    pfasDetected: boolean;
    pfasLevel: number | null;
    otherContaminants: string[];
  };
  
  airQuality: {
    pm25Average: number | null;
    industrialEmissions: boolean;
    trafficDensity: "low" | "moderate" | "high";
  };

  superfundSites: {
    withinOneMile: number;
    withinFiveMiles: number;
    contaminantTypes: string[];
  };

  triReleaseSites: {
    // Toxics Release Inventory — industrial chemical releases
    withinFiveMiles: number;
    chemicalCategories: string[];
  };

  militaryBases: {
    withinTenMiles: boolean;
    knownPFASContamination: boolean;
  };

  agriculturalActivity: {
    croplandPercentage: number | null;    // Within 5 miles
    pesticideApplicationData: boolean;    // Available from state ag departments
  };

  // Composite location risk score
  locationExposureScore: number;          // 0-100 scale
  confidenceLevel: "high" | "moderate" | "low";
  
  // Window of vulnerability weighting
  vulnerabilityWeightedScore: number;     // Same exposure during puberty weighted higher 
                                          // than during adulthood
}
```

### 6.3 Population Aggregation Pipeline

```typescript
interface PopulationAggregation {
  // Anonymized, aggregated data from consenting users
  
  consentModel: {
    type: "opt_in";
    granularity: "zip_code_level";        // Never more specific than zip code
    deidentification: "k_anonymity_threshold_10";  // Suppress cells with <10 users
    purpose: "Research to identify geographic patterns in breast cancer risk";
    withdrawalPolicy: "Users can withdraw at any time; data removed within 30 days";
  };

  aggregatedDataset: {
    // Per zip code, where sufficient users exist
    zipCode: string;
    userCount: number;                    // Must be ≥10 for any data release
    
    // Demographics (aggregated)
    ageDistribution: number[];
    ethnicityDistribution: Record<string, number>;
    
    // Risk factors (aggregated means/distributions)
    meanCompositeRisk: number;
    riskDistribution: number[];
    
    // Environmental data (public, not user-contributed)
    environmentalProfile: LocationRiskEstimate;
    
    // Outcomes (for users who transition from PREVENT to diagnosed)
    diagnosisRate: number | null;         // Only with significant longitudinal data
    
    // Biomarker data (aggregated from users who tested)
    meanPFASLevels: Record<string, number> | null;
    meanBPALevel: number | null;
  };

  // Research output
  researchApplications: {
    // Geographic hotspot identification
    hotspotDetection: {
      method: "spatial_clustering";
      output: "zip_codes_with_statistically_elevated_risk_after_controlling_for_demographics";
    };

    // Exposure-outcome correlation
    correlationAnalysis: {
      method: "longitudinal_cohort";
      output: "associations_between_location_based_exposures_and_risk_scores";
      // Eventually: associations with actual diagnosis if enough longitudinal data
    };

    // Environmental justice mapping
    disparityAnalysis: {
      method: "stratified_by_ethnicity_and_ses";
      output: "identification_of_disproportionate_exposure_burden_by_community";
    };
  };

  // Data sharing
  openDataPolicy: {
    aggregatedZipCodeData: "publicly_available_after_k_anonymity";
    researchCollaborations: "irb_approved_researchers_via_data_use_agreement";
    rawIndividualData: "never_shared_externally";
    // Users can browse aggregated zip code risk maps in the app
  };
}
```

### 6.4 Heatmap Visualization

```typescript
interface RiskHeatmap {
  // User-facing visualization of population-level geographic risk patterns
  
  mapLayers: {
    waterQuality: {
      source: "ewg_tap_water_database";
      colorScale: "pfas_concentration";
      toggleable: true;
    };
    
    airQuality: {
      source: "epa_aqi_data";
      colorScale: "pm25_annual_average";
      toggleable: true;
    };
    
    superfundSites: {
      source: "epa_superfund_database";
      display: "point_markers_with_radius";
      toggleable: true;
    };
    
    triSites: {
      source: "epa_tri_database";
      display: "point_markers";
      toggleable: true;
    };
    
    platformRiskData: {
      source: "aggregated_user_data";
      colorScale: "mean_composite_risk_by_zip";
      minimumUsers: 10;
      toggleable: true;
      label: "Community Risk Insights (from OncoVax users)";
    };
    
    cancerRegistry: {
      source: "seer_state_cancer_profiles";
      colorScale: "breast_cancer_incidence_rate";
      toggleable: true;
    };
  };

  userOverlay: {
    // User's personal location history as a timeline on the map
    showResidentialHistory: true;
    highlightVulnerablePeriods: true;      // Puberty, pregnancy highlighted differently
    showExposureEstimatesPerLocation: true;
  };
}
```

---

## 7. Lifestyle Risk Optimizer

### 7.1 Reuse Strategy

This section directly reuses the SURVIVE Phase 5 lifestyle engine (Sections 6.1-6.5) with re-contextualized framing for prevention rather than recurrence reduction.

```typescript
interface LifestyleReuse {
  // Components reused from SURVIVE
  exerciseEngine: "SURVIVE.Section6.1";      // Same exercise programming
  nutritionEngine: "SURVIVE.Section6.2";     // Same nutrition guidance
  weightManagement: "SURVIVE.Section6.3";    // Same BMI/weight tracking
  environmentalReduction: "SURVIVE.Section6.4";  // Extended in Section 5 above
  alcoholGuidance: "SURVIVE.Section6.5";     // Same evidence, prevention framing

  // Framing differences for prevention context
  framingOverrides: {
    exerciseHeadline: {
      survive: "Exercise reduces your recurrence risk by 24-67% depending on subtype";
      prevent: "Regular exercise reduces breast cancer risk by 20-25% — the effect size rivals some medications";
    };
    alcoholHeadline: {
      survive: "Even moderate alcohol increases recurrence risk for ER+ breast cancer";
      prevent: "Each drink per day increases breast cancer risk by ~7-10%. This is one of the most modifiable risk factors.";
    };
    weightHeadline: {
      survive: "Post-treatment weight gain increases recurrence risk, especially for ER+ subtypes";
      prevent: "Maintaining healthy weight after menopause is one of the most impactful prevention strategies — fat tissue produces estrogen";
    };
  };

  // Additional prevention-specific content
  preventionSpecific: {
    breastfeedingGuidance: {
      message: "Breastfeeding reduces breast cancer risk, with longer duration providing greater protection. The mechanism involves reduced cumulative estrogen exposure during lactation.";
      evidenceStrength: "strong";
      applicableTo: "women considering or currently pregnant";
    };

    oralContraceptiveGuidance: {
      message: "Current or recent oral contraceptive use modestly increases breast cancer risk (~20-30% while using). Risk returns to baseline within ~10 years of stopping. The absolute risk increase for young women is small. Discuss with your provider in context of your complete risk profile.";
      evidenceStrength: "strong";
      tone: "balanced — OCs also reduce ovarian and endometrial cancer risk";
    };

    hrtGuidance: {
      message: "Combined estrogen-progesterone HRT increases breast cancer risk. Estrogen-only HRT (for women without a uterus) has a more nuanced risk profile. Duration matters — risk increases with use beyond 5 years.";
      evidenceStrength: "strong";
      action: "discuss with provider using your complete risk profile as context";
    };
  };
}
```

---

## 8. Preventive Intervention Navigator

### 8.1 Decision Support for Chemoprevention

```typescript
interface ChemopreventionNavigator {
  // For women with ≥3% five-year risk or ≥20% lifetime risk
  // USPSTF recommends discussion of risk-reducing medications

  eligibilityCheck(riskProfile: CompositeRiskAssessment): ChemopreventionEligibility;

  interface ChemopreventionEligibility {
    eligible: boolean;
    basis: string;                        // "5-year risk of 3.2% exceeds USPSTF threshold of 3%"
    
    options: {
      medication: "tamoxifen" | "raloxifene" | "exemestane" | "anastrozole";
      applicableTo: string;               // "Premenopausal women" or "Postmenopausal women"
      riskReduction: string;              // "Reduces ER+ breast cancer risk by ~30-50%"
      duration: string;                   // "5 years"
      sideEffects: {
        common: string[];
        serious: string[];
        frequency: string;
      };
      tradeoffSummary: string;            // Plain-language benefit/risk summary
    }[];

    // NOT a recommendation — decision support for discussion with provider
    disclaimer: "This information is for discussion with your healthcare provider. 
                 OncoVax does not prescribe medications or make treatment recommendations. 
                 Your provider will consider your complete medical history, preferences, 
                 and other factors in any medication decision.";
  };
}
```

### 8.2 Preventive Vaccine Trial Matching

```typescript
interface PreventiveVaccineTrialMatcher {
  // Reuses Phase 1 MATCH engine with prevention-specific filters
  
  trialFilters: {
    trialType: "preventive";
    cancerType: "breast";
    targetPopulation: "high_risk_undiagnosed" | "brca_carriers" | "general_prevention";
  };

  // Known active/upcoming preventive vaccine trials (as of March 2026)
  knownTrials: {
    clevelandClinicALA: {
      target: "alpha-lactalbumin";
      phase: "2";
      population: "High-risk women, BRCA carriers, TNBC survivors";
      sponsor: "Anixa Biosciences / Cleveland Clinic";
      status: "opening_late_2026";
    };
    // Additional trials populated from ClinicalTrials.gov sync
  };

  matchingLogic(profile: CompositeRiskAssessment): PreventiveTrialMatch[];
  
  interface PreventiveTrialMatch {
    trialId: string;
    trialName: string;
    targetAntigen: string;
    phase: string;
    eligibilitySummary: string;
    matchConfidence: "strong" | "possible" | "worth_discussing";
    locationProximity: string;
    enrollmentStatus: string;
    contactInfo: string;
  };
}
```

### 8.3 Prophylactic Surgery Information (High-Risk Only)

```typescript
interface ProphylacticSurgeryInfo {
  // Only displayed for women with very high lifetime risk (>35%) 
  // or known BRCA1/2 carriers
  
  showCondition: "lifetime_risk > 35% OR brca_carrier";
  
  content: {
    bilateralMastectomy: {
      riskReduction: "~90-95% reduction in breast cancer risk";
      considerations: string[];           // Reconstructive options, recovery, psychological impact
      guidelineSource: "NCCN";
    };
    oophorectomy: {
      riskReduction: "~50% reduction in breast cancer risk for BRCA carriers (before age 50)";
      additionalBenefit: "Also reduces ovarian cancer risk by ~80-90%";
      considerations: string[];           // Surgical menopause, bone health, cardiovascular
      guidelineSource: "NCCN";
    };
    
    tone: "informational_not_directive";
    alwaysIncludeVaccineTrialAlternative: true;  // "Before considering surgery, ask about preventive vaccine trials"
    geneticCounselorReferral: true;
  };
}
```

---

## 9. Risk-Adapted Screening Planner

### 9.1 Personalized Screening Schedule

```typescript
interface ScreeningPlanner {
  generateSchedule(profile: CompositeRiskAssessment): ScreeningSchedule;

  interface ScreeningSchedule {
    guidelineSource: "NCCN" | "ACS" | "USPSTF";
    riskCategory: string;
    
    schedule: {
      modality: "mammogram" | "breast_mri" | "clinical_breast_exam" | "breast_ultrasound";
      frequency: string;                  // "Annual", "Every 6 months", "Biennial"
      startAge: number;
      rationale: string;
      covered_by_insurance: string;       // ACA mandate info
    }[];

    // Risk-adapted adjustments
    adjustments: {
      if_dense_breasts: "Add breast MRI or ultrasound to mammography";
      if_brca_carrier: "Annual MRI + mammography starting age 25-30";
      if_chest_radiation_history: "Annual MRI + mammography starting 8 years post-radiation or age 25";
      if_high_prs: "Consider starting mammography at 40 regardless of other factors";
    };

    // Calendar integration
    calendarEvents: {
      nextScreening: string;
      reminderDays: number[];             // [30, 7, 1]
    };

    // Insurance navigation
    insuranceCoverage: {
      mammographyMandate: "ACA requires coverage with no cost-sharing for women 40+";
      mriCoverage: "Typically covered for high-risk women; may require prior auth";
      geneticTestingCoverage: "BRCA testing covered for high-risk individuals under ACA";
      additionalResources: string[];      // Link to Financial Assistance Finder from Phase 1
    };
  };
}
```

---

## 10. Data Contribution & Research Flywheel

### 10.1 Consent Architecture

```typescript
interface DataContributionConsent {
  // Granular, informed, revocable consent
  
  consentLevels: {
    level1_anonymous_aggregation: {
      description: "Your data contributes to anonymized zip-code-level statistics. 
                    No individual data is ever shared. This helps identify geographic 
                    patterns in breast cancer risk.";
      dataIncluded: ["zip_code", "risk_score", "age_bracket", "ethnicity_bracket"];
      defaultOpted: "in";                 // Opt-out with explanation
    };

    level2_research_cohort: {
      description: "Your de-identified profile may be included in research datasets 
                    shared with IRB-approved researchers. This accelerates discovery 
                    of new risk factors and prevention strategies.";
      dataIncluded: ["all_risk_factors", "exposure_data", "biomarker_data", "outcomes"];
      deidentificationMethod: "safe_harbor_plus_expert_determination";
      defaultOpted: "out";                // Opt-in with clear explanation
    };

    level3_longitudinal_study: {
      description: "You agree to periodic follow-up surveys and data updates to 
                    contribute to long-term studies of breast cancer prevention. 
                    You may be contacted about specific research studies.";
      dataIncluded: ["level2 + longitudinal_updates + contact_for_studies"];
      defaultOpted: "out";
      incentive: "Priority access to new platform features and research findings";
    };

    level4_biospecimen_consent: {
      description: "You consent to your biomarker test results being included in 
                    research datasets. This helps establish population reference 
                    ranges and exposure-risk correlations.";
      dataIncluded: ["edc_biomarker_results"];
      defaultOpted: "out";
    };
  };

  withdrawalPolicy: {
    method: "one_click_in_settings";
    timeline: "Data removed from active datasets within 30 days";
    aggregatedDataNote: "Previously contributed data that has been aggregated and 
                         anonymized cannot be individually removed, as it is no 
                         longer linked to your identity.";
  };
}
```

### 10.2 Research Partnership Model

```typescript
interface ResearchPartnerships {
  // The platform generates a unique dataset: large-scale, longitudinal, 
  // multi-dimensional risk factor data with environmental exposure tracking.
  
  dataAssetDescription: {
    uniqueValue: [
      "Residential zip code history with life-stage annotations",
      "Longitudinal environmental exposure biomarker data",
      "Consumer product exposure profiles",
      "Composite risk scores with all input components",
      "Prospective cohort with long-term outcome tracking",
    ];
    
    comparableDatasets: {
      nhanes: "Cross-sectional, no longitudinal exposure tracking";
      nurseHealthStudy: "Rich but limited enrollment, historical";
      sisterStudy: "NIEHS study of women with sister with BC — excellent but closed";
      ukBiobank: "Large but UK-specific, limited environmental exposure data";
      oncoVaxAdvantage: "Continuous digital enrollment, real-time exposure tracking, 
                         zip code history with life-stage data, product-level exposure 
                         data — none of the above have this combination";
    };
  };

  partnershipTypes: {
    academicCollaborations: {
      model: "Data use agreement, IRB approval required";
      access: "De-identified research dataset";
      cost: "Free for non-profit academic research";
      requirement: "Publish findings openly, acknowledge platform";
    };

    epidemiologicStudies: {
      model: "Active collaboration with platform data science team";
      focus: "Geographic hotspot identification, exposure-risk correlation";
      partners: ["NIEHS", "state health departments", "academic cancer centers"];
    };

    clinicalTrialRecruitment: {
      model: "Consenting users matched to prevention trials";
      benefit: "Dramatically faster enrollment for prevention trials";
      existingConnection: "Phase 1 MATCH engine";
    };
  };
}
```

---

## 11. Data Model Extensions

### 11.1 New Tables

```sql
-- Prevention user profile (extends existing patient profile)
CREATE TABLE prevent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  onboarding_completed_at TIMESTAMPTZ,
  onboarding_tier INTEGER DEFAULT 1,           -- 1 = basic, 2 = genomic, 3 = full
  
  -- Reproductive history
  age_at_menarche INTEGER,
  pregnancies INTEGER DEFAULT 0,
  age_at_first_live_birth INTEGER,
  breastfeeding_months INTEGER DEFAULT 0,
  menopausal_status TEXT,
  age_at_menopause INTEGER,
  oc_ever BOOLEAN,
  oc_current BOOLEAN,
  oc_total_years NUMERIC,
  hrt_ever BOOLEAN,
  hrt_current BOOLEAN,
  hrt_type TEXT,
  hrt_total_years NUMERIC,
  
  -- Personal history
  previous_biopsies INTEGER DEFAULT 0,
  atypical_hyperplasia BOOLEAN DEFAULT FALSE,
  lcis BOOLEAN DEFAULT FALSE,
  chest_radiation BOOLEAN DEFAULT FALSE,
  breast_density TEXT,                          -- BI-RADS: A, B, C, D
  
  -- Lifestyle baseline
  bmi NUMERIC,
  alcohol_drinks_per_week NUMERIC,
  exercise_minutes_per_week INTEGER,
  smoking_status TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk assessments (longitudinal)
CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  assessment_date TIMESTAMPTZ DEFAULT NOW(),
  model_version TEXT NOT NULL,
  
  -- Component scores
  prs_percentile NUMERIC,
  prs_ancestry TEXT,
  prs_confidence TEXT,
  epidemiologic_risk_score NUMERIC,
  environmental_risk_score NUMERIC,
  tissue_risk_score NUMERIC,
  
  -- Composite outputs
  lifetime_risk_estimate NUMERIC,
  lifetime_risk_ci_low NUMERIC,
  lifetime_risk_ci_high NUMERIC,
  five_year_risk_estimate NUMERIC,
  ten_year_risk_estimate NUMERIC,
  risk_category TEXT,
  
  -- Full assessment JSON (for trajectory tracking)
  full_assessment JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Genomic data
CREATE TABLE genomic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  data_source TEXT,                              -- '23andMe', 'Color', 'Myriad', etc.
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- PRS
  prs_value NUMERIC,
  prs_percentile NUMERIC,
  prs_snp_count INTEGER,
  prs_model_version TEXT,
  prs_ancestry_calibration TEXT,
  
  -- Monogenic variants
  pathogenic_variants JSONB DEFAULT '[]',
  vus_variants JSONB DEFAULT '[]',
  genes_tested TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Location history
CREATE TABLE location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  zip_code TEXT NOT NULL,
  state TEXT,
  move_in_date DATE,
  move_out_date DATE,                            -- NULL = current
  residence_type TEXT,
  water_source TEXT,
  nearby_industry TEXT[],
  agricultural_proximity BOOLEAN,
  life_stages TEXT[],                            -- Computed from dates + DOB
  duration_months INTEGER,                       -- Computed
  
  -- Enriched environmental data (from EPA/EWG APIs)
  environmental_data JSONB,
  environmental_data_fetched_at TIMESTAMPTZ,
  location_exposure_score NUMERIC,
  vulnerability_weighted_score NUMERIC,
  
  consent_research_use BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Environmental exposure biomarker results
CREATE TABLE biomarker_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  test_date DATE NOT NULL,
  lab_provider TEXT,
  
  -- Results stored as JSONB for flexibility
  -- Structure: { "PFOA": { "value": 3.2, "unit": "ng/mL", "percentile": 72 }, ... }
  pfas_results JSONB,
  bisphenol_results JSONB,
  phthalate_results JSONB,
  paraben_results JSONB,
  pesticide_results JSONB,
  
  -- Composite
  overall_exposure_score NUMERIC,
  percentile_vs_nhanes NUMERIC,
  
  consent_research_use BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product scans
CREATE TABLE product_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  scan_date TIMESTAMPTZ DEFAULT NOW(),
  barcode TEXT,
  product_name TEXT,
  brand TEXT,
  category TEXT,
  ingredients JSONB,
  flagged_ingredients INTEGER,
  overall_rating TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated zip code data (for research/heatmap)
CREATE TABLE zip_code_aggregates (
  zip_code TEXT PRIMARY KEY,
  user_count INTEGER DEFAULT 0,
  
  -- Demographics (aggregated)
  age_distribution JSONB,
  ethnicity_distribution JSONB,
  
  -- Risk (aggregated)
  mean_composite_risk NUMERIC,
  risk_distribution JSONB,
  
  -- Environmental (from public sources)
  environmental_profile JSONB,
  
  -- Biomarkers (aggregated from users who tested + consented)
  mean_pfas_levels JSONB,
  mean_bpa_level NUMERIC,
  biomarker_sample_size INTEGER,
  
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Data contribution consent tracking
CREATE TABLE data_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  consent_level INTEGER,                         -- 1-4
  consented_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 12. Integration Points with Existing Phases

### 12.1 Phase 1 (MATCH) Integration

```typescript
const phase1Integration = {
  // Auth: Shared magic link auth system
  auth: "shared",
  
  // Patient profiles: PREVENT extends the existing patient model
  patientModel: "extend_with_prevent_profiles_table",
  
  // Trial matching: Reuse MATCH engine with preventive trial filter
  trialMatching: {
    reuseEngine: true,
    additionalFilter: "trial_type = 'preventive' OR trial_type = 'risk_reduction'",
    additionalDataSource: "ClinicalTrials.gov prevention studies",
  },
  
  // Document ingestion: Reuse for genetic test results, mammogram reports
  documentIngestion: "reuse_with_new_document_types",
  
  // Financial Assistance: Reuse for genetic testing coverage, screening coverage
  financialAssistance: "reuse",
};
```

### 12.2 Phase 5 (SURVIVE) Integration

```typescript
const phase5Integration = {
  // Lifestyle engine: Direct reuse with framing overrides
  lifestyleEngine: "reuse_sections_6.1_through_6.5",
  
  // Environmental tracker: Phase 0 extends this significantly
  environmentalTracker: "extend_with_biomarkers_location_history_product_scanner",
  
  // Journal: Shared symptom/wellness journal
  journal: "shared",
  
  // Psychosocial: Anxiety management resources reusable for risk anxiety
  psychosocial: "partial_reuse_for_risk_anxiety_management",
  
  // Care coordination: Risk-adapted screening uses same appointment system
  careCoordination: "reuse_appointment_system",
};
```

### 12.3 The Full Platform Flywheel

```
PREVENT user (high-risk) → Preventive vaccine trial enrollment via MATCH
PREVENT user (diagnosed) → Seamless transition to full platform (MATCH → SEQUENCE → PREDICT → MANUFACTURE)
SURVIVE user (in remission) → Refers family members to PREVENT
SURVIVE user (recurrence) → Re-enters MATCH with updated profile
PREVENT data (aggregated) → Improves risk models for all users
PREVENT data (research) → Informs new prevention strategies and vaccine targets
```

---

## 13. Build Sequence

### 13.1 Phase 0a: Foundation (4-6 sessions)

| Session | Scope | Depends On |
|---------|-------|------------|
| P0-1 | Prevent route structure, onboarding questionnaire UI, prevent_profiles table | Phase 1 auth + patient model |
| P0-2 | Risk assessment data model, Gail model integration (simplest first), basic risk display | P0-1 |
| P0-3 | Risk communication UI — comparison display, trajectory chart, modifiable factors | P0-2 |
| P0-4 | Family history deep-dive, monogenic variant display, genetic counselor referral flow | P0-2 |
| P0-5 | Screening planner — risk-adapted schedule generation, calendar integration | P0-3 |
| P0-6 | Chemoprevention navigator — eligibility check, medication comparison, provider discussion guide | P0-3 |

### 13.2 Phase 0b: Genomic Layer (3-4 sessions)

| Session | Scope | Depends On |
|---------|-------|------------|
| P0-7 | Genomic profile data model, raw genotype file upload, 23andMe/Ancestry parsing | P0-1 |
| P0-8 | PRS calculation pipeline — SNP extraction, QC, scoring, ancestry calibration | P0-7 |
| P0-9 | PRS integration into risk model — CanRisk API or Tyrer-Cuzick addon | P0-8, P0-2 |
| P0-10 | Ancestry limitation disclosure, confidence visualization, partner testing referral | P0-9 |

### 13.3 Phase 0c: Environmental Intelligence (5-6 sessions)

| Session | Scope | Depends On |
|---------|-------|------------|
| P0-11 | Water quality dashboard — EWG API integration, zip code lookup, PFAS flagging | P0-1 |
| P0-12 | Product scanner — barcode lookup, ingredient parsing, EDC flagging, alternatives | P0-1 |
| P0-13 | Home environment checklist — cookware, food storage, cleaning products assessment | P0-1 |
| P0-14 | Biomarker panel guide — partner lab integration, result upload, NHANES comparison | P0-1 |
| P0-15 | Longitudinal exposure tracking — trend visualization, correlation with risk score | P0-14, P0-2 |
| P0-16 | Environmental risk integration into composite model | P0-11 through P0-15, P0-2 |

### 13.4 Phase 0d: Location History & Population Layer (4-5 sessions)

| Session | Scope | Depends On |
|---------|-------|------------|
| P0-17 | Location history data model, intake UI, life-stage annotation | P0-1 |
| P0-18 | EPA/EWG data enrichment per zip code — water, air, Superfund, TRI, military bases | P0-17 |
| P0-19 | Location exposure scoring — per-location and vulnerability-weighted composite | P0-18 |
| P0-20 | Population aggregation pipeline — k-anonymity, zip code aggregates, consent tracking | P0-17 |
| P0-21 | Risk heatmap visualization — multi-layer map, user overlay, population data | P0-20 |

### 13.5 Phase 0e: Lifestyle Engine & Preventive Trials (3-4 sessions)

| Session | Scope | Depends On |
|---------|-------|------------|
| P0-22 | Lifestyle engine port from SURVIVE — exercise, nutrition, alcohol, sleep | Phase 5 lifestyle engine |
| P0-23 | Prevention-specific framing overrides, breastfeeding/OC/HRT guidance | P0-22 |
| P0-24 | Preventive vaccine trial matcher — filter on Phase 1 MATCH engine | Phase 1 MATCH |
| P0-25 | Research flywheel dashboard — consent management, contribution tracking, study matching | P0-20 |

### 13.6 Total: ~25 Claude Code sessions

---

## 14. Open Questions

### 14.1 Regulatory

1. **Is a risk calculator a medical device?** If the platform generates a breast cancer risk estimate, does it require FDA clearance as a Software as a Medical Device (SaMD)? Likely not if positioned as educational/informational and based on published models — but needs legal review. Precedent: multiple consumer PRS products operate without FDA clearance.

2. **PRS as a clinical test vs. wellness product.** If we calculate PRS from consumer genomic data, are we performing a clinical laboratory test? Distinction matters for CLIA certification requirements. If we use a partner lab's validated PRS, we're displaying results, not generating them.

3. **State-level genetic testing regulations.** Some states (notably New York) restrict direct-to-consumer genetic testing. Need state-by-state compliance review.

### 14.2 Data & Privacy

4. **HIPAA applicability.** If we're collecting health information and connecting users to clinical trials, are we a covered entity or business associate? Likely business associate if partnering with labs/providers. Architecture must be HIPAA-compliant from day one.

5. **Biomarker data sensitivity.** PFAS/BPA levels could be used against individuals by insurers or employers. Need strong de-identification and data protection. Consider whether to store raw results or only processed scores.

6. **Location history sensitivity.** Residential history is sensitive data. Need clear consent, strong encryption, and ability to delete. K-anonymity threshold of 10 for any aggregated release.

### 14.3 Scientific

7. **PRS model selection.** The 313-SNP model (Mavaddat 2019) is the most validated, but newer models with more SNPs are emerging. Need a model versioning strategy that allows updates without invalidating historical assessments.

8. **Environmental risk quantification.** No validated model exists for integrating EDC exposure into breast cancer risk prediction. This is a scientific frontier, not a solved problem. The platform should be transparent that environmental risk scores are estimates based on emerging evidence, not validated clinical tools.

9. **Causal vs. correlational framing.** Many environmental associations are correlational, not proven causal. The platform must carefully distinguish "associated with increased risk" from "causes cancer." Regulatory and legal implications of getting this wrong.

### 14.4 Business

10. **Monetization.** Free tier (basic risk assessment) vs. paid tier (genomic integration, biomarker tracking, product scanner)? Or fully free with research data as the monetization layer? The answer affects user trust, adoption, and data quality.

11. **Partner lab economics.** If we refer users to EDC biomarker testing, do we take a referral fee? Does that create a conflict of interest? Better model may be to negotiate group pricing.

12. **Insurance coverage for prevention.** Most preventive services are covered under ACA. Genetic testing for high-risk individuals is covered. EDC biomarker testing is NOT covered. This affects the addressable market for the biomarker layer.