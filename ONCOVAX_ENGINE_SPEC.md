# Opportunity Engine — Technical Specification v1.0

## Meta-Intelligence Layer: Bottleneck Detection & Platform Capability Deployment (ENGINE)

**Author:** Rett (Happy Medium)
**Date:** March 2026
**Depends on:** Phase 1 (MATCH) + Research Intelligence Stream (INTEL) minimum; value compounds with every additional module
**Purpose:** A self-directing strategic intelligence system that continuously identifies where the platform's capabilities can be deployed against healthcare system failures, access bottlenecks, and survival-rate gaps — then generates actionable, spec-ready opportunity briefs.

---

## Table of Contents

1. [What This Is (And Isn't)](#1-what-this-is-and-isnt)
2. [Four Input Streams](#2-four-input-streams)
3. [Opportunity Detection Pipeline](#3-opportunity-detection-pipeline)
4. [Impact & Feasibility Scoring](#4-impact--feasibility-scoring)
5. [Opportunity Brief Generation](#5-opportunity-brief-generation)
6. [Platform Capability Registry](#6-platform-capability-registry)
7. [Continuous Monitoring Agents](#7-continuous-monitoring-agents)
8. [Operator Dashboard](#8-operator-dashboard)
9. [Data Model](#9-data-model)
10. [Example Opportunities (Validation Cases)](#10-example-opportunities-validation-cases)
11. [Build Sequence](#11-build-sequence)

---

## 1. What This Is (And Isn't)

### 1.1 What It Is

An internal strategic intelligence system that:
- Watches four data streams continuously (user behavior, research landscape, system failures, technology advances)
- Detects patterns that indicate an addressable bottleneck, access gap, or survival-rate opportunity
- Assesses whether the platform's existing capabilities can address it
- Generates ranked opportunity briefs with impact estimates, feasibility scores, and draft spec outlines
- Surfaces these to you (the operator) as a prioritized backlog — ready for review and execution

Think of it as a product strategist that never sleeps, has access to every data stream in the platform, reads every paper in the INTEL stream, notices every pattern in user behavior, and produces weekly briefs of "here's what we should build next and why."

### 1.2 What It Isn't

- **Not a user-facing feature** — patients and clinicians never see this. It's an internal tool that generates the next user-facing features.
- **Not autonomous** — it recommends, you decide. No opportunity gets built without your greenlight.
- **Not a generic "AI idea generator"** — every opportunity is grounded in observed data, scored against specific impact metrics, and assessed against real platform capabilities. An opportunity without data backing it doesn't enter the pipeline.
- **Not a replacement for talking to users** — it's a supplement. The engine identifies patterns at scale that individual conversations miss, but user feedback and your own judgment remain the final filter.

### 1.3 Why This Matters

Without this engine, platform evolution is reactive: a user complains, you build a fix. A competitor launches a feature, you match it. You read a paper and have an idea, you build it when you have time.

With this engine, platform evolution is proactive and data-driven: the system identifies that 23% of TNBC patients in the southeast are matching to zero trials because there are no enrolling sites within their travel radius, cross-references that three academic centers in that region have FHIR APIs you could integrate, estimates that a "virtual trial pre-screening" feature could unlock 400+ patient-trial connections per year, and presents this to you with a draft spec and effort estimate. You decide in 10 minutes whether to build it. That's the difference.

---

## 2. Four Input Streams

### 2.1 Stream A: Platform Behavioral Intelligence

What users are actually doing (and failing to do) on the platform.

```typescript
interface BehavioralSignals {
  // Funnel analysis
  intakeFunnel: {
    startedIntake: number;
    completedDocUpload: number;
    completedConfirmation: number;
    reachedMatches: number;
    viewedTrialDetail: number;
    generatedOncologistBrief: number;
    // WHERE do they drop off? Which steps have the highest abandonment?
    dropoffRates: Record<string, number>;
    dropoffByDemographic: Record<string, Record<string, number>>;
  };

  // Search & match gaps
  matchGaps: {
    zeroMatchPatients: {
      count: number;
      commonProfiles: PatientProfileSummary[];   // What do zero-match patients look like?
      commonReasons: string[];                    // "No trials in their area", "Subtype underserved"
      geographicClusters: GeoCluster[];           // Where are zero-match patients concentrated?
    };
    lowConfidenceMatches: {
      count: number;
      commonUnknownFields: string[];             // Which profile fields are most often missing?
      // If patients had [X field], how many more matches would they get?
      fieldImpactEstimates: Record<string, number>;
    };
  };

  // Feature usage patterns
  featureUsage: {
    treatmentTranslator: {
      generationCount: number;
      regenerationCount: number;                  // How often do people regenerate? → dissatisfaction signal
      unansweredQuestions: string[];               // Questions asked that the translator couldn't address
      secondOpinionTriggerRate: number;            // How often does the trigger fire?
      secondOpinionActionRate: number;             // How often do patients ACT on the suggestion?
    };
    financialFinder: {
      totalMatches: number;
      applicationRate: number;                     // What % actually apply?
      denialRate: number;                          // What % get denied after applying?
      commonDenialReasons: string[];
      unservedNeedCategories: string[];            // Financial needs with no matching programs
    };
    sequencingNavigator: {
      recommendationRate: number;                  // What % get recommended for sequencing?
      conversionRate: number;                      // What % actually get sequenced?
      insuranceDenialRate: number;
      commonBlockers: string[];                    // "Doctor didn't order", "Cost too high", etc.
    };
    survivorship: {
      journalCompletionRate: number;               // Daily journal compliance
      journalDropoffWeek: number;                  // When do people stop journaling?
      symptomEscalationRate: number;               // How often do logged symptoms get flagged as urgent?
      ctdnaAdoptionRate: number;                   // What % pursue ctDNA monitoring?
    };
  };

  // Community intelligence signals
  communitySignals: {
    topUnmetNeeds: string[];                       // From community reports
    frequentQuestions: string[];                    // Questions the platform can't answer
    featureRequests: string[];                      // Explicit user requests
    frustrationPatterns: string[];                  // Inferred from behavior (rage clicks, abandonment, repeated attempts)
  };

  // Error and failure patterns
  failures: {
    documentExtractionFailures: {
      count: number;
      documentTypes: Record<string, number>;       // Which doc types fail most?
      commonIssues: string[];                       // "Handwritten", "Foreign language", "Non-standard format"
    };
    fhirSyncFailures: {
      count: number;
      healthSystems: Record<string, number>;       // Which systems fail most?
      failureTypes: string[];
    };
    matchingEdgeCases: {
      eligibilityCriteriaUnparseable: number;      // Trials with criteria Claude can't parse
      ambiguousMatches: number;                     // Matches with low confidence
    };
  };
}
```

**Collection:** Platform analytics (PostHog, Mixpanel, or custom), error logs, tRPC procedure analytics, community report aggregation. Runs as a weekly aggregation job.

### 2.2 Stream B: Research & Technology Landscape

What's newly possible — from the Research Intelligence Stream and technology monitoring.

```typescript
interface LandscapeSignals {
  // From INTEL module
  researchBreakthroughs: {
    newT1Items: ResearchItemSummary[];              // Newly available treatments
    newT2Items: ResearchItemSummary[];              // Approaching approval
    practiceChangingItems: ResearchItemSummary[];   // Items that change SOC
    newBiomarkerAssociations: {                     // New mutation → drug connections
      biomarker: string;
      drug: string;
      evidence: string;
      implication: string;                          // "Patients with [X] mutation may benefit from [Y]"
    }[];
    newScreeningTechnology: ResearchItemSummary[];  // AI screening, liquid biopsy advances
    newMonitoringTechnology: ResearchItemSummary[]; // ctDNA, imaging advances
  };

  // Regulatory changes
  regulatoryChanges: {
    newDrugApprovals: { drug: string; indication: string; date: string }[];
    newFastTrackDesignations: { drug: string; indication: string }[];
    newCompanionDiagnosticApprovals: { test: string; drug: string }[];
    guidelineUpdates: { organization: string; guideline: string; change: string }[];
    insurancePolicyChanges: { insurer: string; change: string; impact: string }[];
    stateLawChanges: { state: string; law: string; impact: string }[];
  };

  // Technology capabilities
  technologyAdvances: {
    newAPIsAvailable: { provider: string; api: string; capability: string }[];      // New FHIR endpoints, lab APIs
    aiCapabilityAdvances: { capability: string; implication: string }[];             // New Claude features, vision improvements
    costReductions: { technology: string; previousCost: string; newCost: string }[]; // Sequencing cost drops, compute cost drops
    newOpenSourceTools: { tool: string; purpose: string; url: string }[];           // New bioinformatics tools, datasets
    newDataSources: { source: string; content: string; access: string }[];          // New public health datasets, registries
  };
}
```

**Collection:** INTEL module feed (automated), regulatory monitoring agents (see Section 7), technology RSS/monitoring (manual + automated).

### 2.3 Stream C: Healthcare System Failure Mapping

Where the system is failing patients — from public health data, platform observations, and external datasets.

```typescript
interface SystemFailureSignals {
  // Geographic access gaps
  geographicGaps: {
    trialDeserts: {
      region: string;
      population: number;
      nearestTrialSiteDistance: number;              // Average miles to nearest enrolling site
      cancerIncidence: number;                       // Cases per 100K
      affectedSubtypes: string[];
    }[];
    specialistDeserts: {
      region: string;
      specialistType: string;                        // "Breast surgical oncologist", "Genetic counselor"
      nearestSpecialistDistance: number;
      populationServed: number;
    }[];
    sequencingDeserts: {
      region: string;
      nearestSequencingLabDistance: number;
      populationServed: number;
    }[];
  };

  // Demographic disparities
  disparities: {
    diagnosisDelayByDemographic: Record<string, number>;     // Average months to diagnosis by race, income, insurance
    treatmentAccessByDemographic: Record<string, number>;     // % receiving guideline-concordant treatment
    trialEnrollmentByDemographic: Record<string, number>;     // % enrolled in trials
    survivalByDemographic: Record<string, number>;            // 5-year survival rate
    screeningRatesByDemographic: Record<string, number>;
  };

  // Insurance & financial barriers
  financialBarriers: {
    denialRatesByInsurer: Record<string, number>;             // Sequencing, treatment, etc.
    outOfPocketByTreatment: Record<string, number>;           // Average OOP cost
    financialToxicityRate: number;                             // % reporting financial hardship
    bankruptcyRate: number;                                    // % filing bankruptcy within 2 years
    underinsuredRate: number;                                   // % with insurance but can't afford copays
  };

  // Care quality gaps
  careQualityGaps: {
    guidelineAdherenceByPracticeType: Record<string, number>; // Academic vs community
    survivorshipPlanRate: number;                               // % receiving SCP
    geneticTestingRate: number;                                 // % who should be tested but aren't
    biomarkerTestingRate: number;                               // % with advanced cancer getting genomic testing
    secondOpinionRate: number;                                  // % who seek second opinion
  };

  // Subtype-specific gaps
  subtypeGaps: {
    subtype: string;
    activeTrialCount: number;
    enrollingSiteCount: number;
    approvedTargetedTherapies: number;
    averageSurvival: number;
    researchFundingLevel: string;                              // NIH Reporter data
    unmetNeedDescription: string;
  }[];
}
```

**Collection:** SEER database (NCI), CDC WONDER, ACS Cancer Statistics, ClinicalTrials.gov (trial site distribution), Census data (demographics), platform's own geographic data, published health disparities research. Updated quarterly.

### 2.4 Stream D: Platform Capability Inventory

What the platform CAN do — its existing tools, data assets, technical capabilities, and user base.

```typescript
interface PlatformCapabilities {
  // Data assets
  dataAssets: {
    patientProfileCount: number;
    profilesWithGenomicData: number;
    profilesWithFHIRConnection: number;
    trialDatabaseSize: number;
    financialProgramCount: number;
    researchItemCount: number;
    communityReportCount: number;
    geographicCoverage: string[];                  // States/regions with significant user base
  };

  // Technical capabilities
  technicalCapabilities: {
    documentIngestion: {
      supportedFormats: string[];
      extractionAccuracy: number;
      averageProcessingTime: number;
    };
    claudeIntegration: {
      availableModels: string[];
      currentMonthlySpend: number;
      capacityHeadroom: number;                    // How much more can we process?
    };
    fhirConnections: {
      connectedSystems: string[];
      pendingApprovals: string[];
      apiCapabilities: string[];
    };
    computePipeline: {                             // Phase 3 if built
      neoantigenPipelineOperational: boolean;
      processingCapacity: string;
    };
    notificationSystem: {
      emailDeliveryRate: number;
      pushCapability: boolean;
      smsCapability: boolean;
    };
  };

  // User base characteristics
  userBase: {
    totalUsers: number;
    activeMonthlyUsers: number;
    cancerTypeDistribution: Record<string, number>;
    subtypeDistribution: Record<string, number>;
    stageDistribution: Record<string, number>;
    treatmentPhaseDistribution: Record<string, number>;
    geographicDistribution: Record<string, number>;  // By state/region
    demographicDistribution: Record<string, number>;
  };

  // Existing module capabilities (what can each module DO?)
  moduleCapabilities: {
    trialMatcher: string[];         // "Match patients to trials by clinical + genomic profile"
    documentIngestion: string[];    // "Extract structured data from medical documents via Claude Vision"
    treatmentTranslator: string[];  // "Generate plain-language treatment explainers from clinical data"
    financialFinder: string[];      // "Match patients to financial assistance programs"
    sequencingNav: string[];        // "Guide patients through tumor sequencing process"
    survivorship: string[];         // "Personalized surveillance schedules, symptom tracking, lifestyle"
    intelStream: string[];          // "Classify, summarize, personalize cancer research"
    fhirIntegration: string[];      // "Pull structured clinical data from Epic MyChart"
    oncologistBrief: string[];      // "Generate professional communications for oncologists"
  };

  // Development capacity
  devCapacity: {
    estimatedWeeklyHours: number;
    currentActiveProjects: string[];
    techStackCapabilities: string[];  // "TypeScript, Next.js, Prisma, Rust, Python, NATS JetStream"
  };
}
```

**Collection:** Platform analytics (automated), capability registry (maintained manually, updated when modules ship).

---

## 3. Opportunity Detection Pipeline

### 3.1 Detection Patterns

The engine looks for specific patterns across the four input streams that indicate an addressable opportunity. Each pattern is a detection rule that, when triggered, generates a candidate opportunity.

```typescript
interface DetectionPattern {
  id: string;
  name: string;
  description: string;
  inputStreams: ("behavioral" | "landscape" | "system_failure" | "capability")[];
  
  // The condition that triggers this pattern
  triggerCondition: string;           // Human-readable description of what triggers it
  
  // How to evaluate the opportunity
  impactDimensions: string[];         // Which impact metrics to estimate
  feasibilityChecks: string[];        // Which capability checks to run
  
  // How often to check
  evaluationFrequency: "realtime" | "daily" | "weekly" | "monthly";
}
```

**Category 1: Unserved Patient Segments**

```typescript
const UNSERVED_SEGMENT_PATTERNS: DetectionPattern[] = [
  {
    id: "zero_match_cluster",
    name: "Zero-match patient cluster",
    description: "A demographic, geographic, or clinical segment consistently matching to zero trials",
    inputStreams: ["behavioral", "system_failure"],
    triggerCondition: "≥20 patients with same subtype/stage/region matching zero trials over 30 days",
    impactDimensions: ["patients_affected", "trial_availability_gap", "geographic_barrier"],
    feasibilityChecks: ["can_expand_trial_search", "can_add_trial_sites", "can_enable_virtual_screening"],
    evaluationFrequency: "weekly",
  },
  {
    id: "demographic_dropout",
    name: "Demographic-specific platform abandonment",
    description: "A demographic group dropping off the platform at significantly higher rates",
    inputStreams: ["behavioral"],
    triggerCondition: "Abandonment rate for a demographic segment >2x platform average",
    impactDimensions: ["equity_gap", "patients_lost", "barrier_type"],
    feasibilityChecks: ["can_add_language", "can_simplify_ux", "can_add_culturally_specific_content"],
    evaluationFrequency: "monthly",
  },
  {
    id: "subtype_research_desert",
    name: "Cancer subtype with minimal research activity",
    description: "A subtype where INTEL stream shows disproportionately few T1-T3 items",
    inputStreams: ["landscape", "system_failure"],
    triggerCondition: "Subtype has <10% of expected research items relative to patient population",
    impactDimensions: ["patients_affected", "research_gap_severity", "advocacy_opportunity"],
    feasibilityChecks: ["can_connect_to_advocacy_orgs", "can_highlight_gap_to_researchers"],
    evaluationFrequency: "monthly",
  },
];
```

**Category 2: Newly Addressable Bottlenecks**

```typescript
const NEWLY_ADDRESSABLE_PATTERNS: DetectionPattern[] = [
  {
    id: "new_api_unlocks_feature",
    name: "New API or data source enables previously impossible feature",
    description: "A health system, lab, or platform opens an API that the platform could integrate",
    inputStreams: ["landscape", "capability"],
    triggerCondition: "New FHIR endpoint, lab API, or data source becomes available for a system used by ≥100 platform users",
    impactDimensions: ["users_affected", "data_quality_improvement", "friction_reduction"],
    feasibilityChecks: ["can_integrate_api", "development_effort", "partnership_required"],
    evaluationFrequency: "weekly",
  },
  {
    id: "cost_reduction_enables_access",
    name: "Technology cost reduction makes feature viable",
    description: "A cost drop (sequencing, compute, testing) makes a previously too-expensive feature viable",
    inputStreams: ["landscape"],
    triggerCondition: "Cost of a key technology drops >30% or crosses a viability threshold",
    impactDimensions: ["patients_priced_out_before", "new_access_enabled", "cost_savings"],
    feasibilityChecks: ["can_integrate_cheaper_option", "pricing_model_change_needed"],
    evaluationFrequency: "monthly",
  },
  {
    id: "regulatory_pathway_opens",
    name: "New regulatory pathway creates patient access opportunity",
    description: "A new FDA approval, state law, insurance mandate, or CMS decision creates access",
    inputStreams: ["landscape", "system_failure"],
    triggerCondition: "Regulatory change directly affects a platform user population segment",
    impactDimensions: ["patients_newly_eligible", "cost_reduction", "access_expansion"],
    feasibilityChecks: ["can_update_coverage_rules", "can_notify_affected_users", "can_generate_documentation"],
    evaluationFrequency: "daily",
  },
  {
    id: "ai_capability_advance",
    name: "New AI capability enables better platform feature",
    description: "An advance in Claude or other AI models enables a feature that wasn't previously possible",
    inputStreams: ["landscape", "capability"],
    triggerCondition: "New model capability (vision, reasoning, tool use) maps to an identified user need",
    impactDimensions: ["feature_quality_improvement", "new_feature_enabled", "cost_reduction"],
    feasibilityChecks: ["can_integrate_new_capability", "accuracy_sufficient", "cost_acceptable"],
    evaluationFrequency: "monthly",
  },
];
```

**Category 3: Survival Rate Impact Opportunities**

```typescript
const SURVIVAL_IMPACT_PATTERNS: DetectionPattern[] = [
  {
    id: "guideline_treatment_gap",
    name: "Patients not receiving guideline-concordant treatment",
    description: "Platform data suggests patients aren't getting treatments that guidelines recommend",
    inputStreams: ["behavioral", "system_failure"],
    triggerCondition: "Treatment Translator second-opinion trigger fires for >15% of a subtype segment",
    impactDimensions: ["survival_impact", "patients_undertreated", "intervention_type"],
    feasibilityChecks: ["can_strengthen_second_opinion", "can_connect_to_specialist", "can_generate_referral"],
    evaluationFrequency: "monthly",
  },
  {
    id: "screening_gap",
    name: "High-risk patients not getting recommended screening",
    description: "Platform users with risk factors aren't being screened per guidelines",
    inputStreams: ["behavioral", "landscape"],
    triggerCondition: "BRCA+ patients without risk-reducing strategy documented, or high-risk patients without enhanced screening",
    impactDimensions: ["early_detection_potential", "patients_at_risk", "survival_improvement_estimate"],
    feasibilityChecks: ["can_generate_screening_recommendation", "can_connect_to_screening_facility"],
    evaluationFrequency: "monthly",
  },
  {
    id: "trial_enrollment_failure",
    name: "Matched patients not enrolling in trials",
    description: "Patients match to trials but don't enroll — identifying and removing the barrier could save lives",
    inputStreams: ["behavioral"],
    triggerCondition: "Match → enrollment conversion rate <5% for a trial type or patient segment",
    impactDimensions: ["trial_enrollment_potential", "barrier_type", "survival_impact_of_trial"],
    feasibilityChecks: ["can_reduce_logistic_barrier", "can_improve_communication", "can_connect_to_navigator"],
    evaluationFrequency: "monthly",
  },
  {
    id: "recurrence_detection_gap",
    name: "Patients missing early recurrence detection opportunities",
    description: "Survivors who could benefit from ctDNA monitoring aren't getting it",
    inputStreams: ["behavioral", "landscape"],
    triggerCondition: "High-risk survivors without ctDNA monitoring AND new evidence supports monitoring for their subtype",
    impactDimensions: ["patients_at_risk", "early_detection_lead_time", "treatment_options_if_detected_early"],
    feasibilityChecks: ["can_recommend_monitoring", "insurance_coverage_status", "can_connect_to_provider"],
    evaluationFrequency: "monthly",
  },
  {
    id: "new_treatment_awareness_gap",
    name: "Newly approved treatment not reaching eligible patients",
    description: "FDA approves a new drug, but platform data shows eligible patients aren't aware or accessing it",
    inputStreams: ["landscape", "behavioral"],
    triggerCondition: "T1 item in INTEL for a treatment + ≥50 platform users with matching profile + low Treatment Translator mention rate",
    impactDimensions: ["eligible_patients", "survival_benefit_of_treatment", "awareness_gap"],
    feasibilityChecks: ["can_update_translator", "can_notify_patients", "can_generate_oncologist_communication"],
    evaluationFrequency: "weekly",
  },
];
```

**Category 4: Platform Efficiency & Scale Opportunities**

```typescript
const EFFICIENCY_PATTERNS: DetectionPattern[] = [
  {
    id: "manual_process_automatable",
    name: "Manual platform process that could be automated",
    description: "An internal process (data seeding, classification review, program status checking) consuming significant time",
    inputStreams: ["capability"],
    triggerCondition: "Internal process takes >5 hours/week and has a viable automation path",
    impactDimensions: ["time_saved_weekly", "error_reduction", "scale_enabled"],
    feasibilityChecks: ["automation_approach", "accuracy_requirement", "development_effort"],
    evaluationFrequency: "monthly",
  },
  {
    id: "data_asset_underleveraged",
    name: "Platform data asset not being fully utilized",
    description: "The platform has data that could power a feature or insight but isn't using it",
    inputStreams: ["capability", "behavioral"],
    triggerCondition: "Data exists in the platform (profiles, genomics, community reports) that isn't powering any active feature",
    impactDimensions: ["potential_feature_value", "data_uniqueness", "competitive_advantage"],
    feasibilityChecks: ["privacy_compliance", "data_quality", "feature_development_effort"],
    evaluationFrequency: "quarterly",
  },
  {
    id: "partnership_opportunity",
    name: "External partnership could multiply platform impact",
    description: "An organization, health system, or company aligns with platform mission and could amplify reach",
    inputStreams: ["landscape", "system_failure"],
    triggerCondition: "Organization publishes goals aligned with platform mission + gap the platform could fill",
    impactDimensions: ["user_base_expansion", "data_access", "credibility_boost", "revenue_potential"],
    feasibilityChecks: ["alignment_check", "integration_effort", "partnership_structure"],
    evaluationFrequency: "monthly",
  },
];
```

### 3.2 Pattern Evaluation Engine

```typescript
async function evaluatePatterns(): Promise<CandidateOpportunity[]> {
  // 1. Gather current state of all four input streams
  const behavioral = await collectBehavioralSignals();
  const landscape = await collectLandscapeSignals();
  const systemFailures = await collectSystemFailureSignals();
  const capabilities = await collectCapabilityInventory();
  
  const context = { behavioral, landscape, systemFailures, capabilities };
  
  // 2. Evaluate each detection pattern against current data
  const allPatterns = [
    ...UNSERVED_SEGMENT_PATTERNS,
    ...NEWLY_ADDRESSABLE_PATTERNS,
    ...SURVIVAL_IMPACT_PATTERNS,
    ...EFFICIENCY_PATTERNS,
  ];
  
  const candidates: CandidateOpportunity[] = [];
  
  for (const pattern of allPatterns) {
    const evaluation = await evaluatePattern(pattern, context);
    if (evaluation.triggered) {
      candidates.push({
        patternId: pattern.id,
        patternName: pattern.name,
        triggeredAt: new Date().toISOString(),
        triggerData: evaluation.evidence,
        rawImpactEstimate: evaluation.rawImpact,
        rawFeasibilityEstimate: evaluation.rawFeasibility,
      });
    }
  }
  
  // 3. Deduplicate (same underlying issue can trigger multiple patterns)
  const deduped = deduplicateOpportunities(candidates);
  
  // 4. Send to Claude for synthesis and scoring
  return deduped;
}
```

---

## 4. Impact & Feasibility Scoring

### 4.1 Impact Scoring Framework

Every candidate opportunity is scored across five impact dimensions:

```typescript
interface ImpactScore {
  // How many people does this affect?
  populationReach: {
    score: number;                    // 1-10
    patientsAffected: number;         // Estimated number
    growthRate: string;               // Is this population growing?
  };

  // How much does this improve survival or quality of life?
  outcomeImprovement: {
    score: number;                    // 1-10
    survivalImpact: "direct" | "indirect" | "quality_of_life_only";
    mechanismOfImpact: string;        // HOW does this improve outcomes?
    evidenceStrength: string;         // How confident are we in the impact estimate?
  };

  // How severe is the current gap?
  gapSeverity: {
    score: number;                    // 1-10
    currentState: string;             // What happens to patients WITHOUT this?
    alternativesExist: boolean;       // Are there other solutions available?
    equityDimension: boolean;         // Does this disproportionately affect underserved populations?
  };

  // How urgent is this?
  urgency: {
    score: number;                    // 1-10
    timeConstraint: string | null;    // "Regulatory window closing", "Trial enrollment ending"
    worsening: boolean;               // Is the problem getting worse over time?
  };

  // How defensible is this for the platform?
  strategicValue: {
    score: number;                    // 1-10
    moatContribution: string;         // Does this make the platform harder to replicate?
    dataFlywheel: boolean;            // Does this generate data that improves other features?
    userRetention: string;            // Does this increase engagement/retention?
  };

  // Composite
  compositeImpactScore: number;       // Weighted combination (0-100)
}
```

### 4.2 Feasibility Scoring Framework

```typescript
interface FeasibilityScore {
  // Can we build this with existing technical capabilities?
  technicalFeasibility: {
    score: number;                    // 1-10
    existingCapabilitiesUsed: string[];   // Which platform capabilities does this leverage?
    newCapabilitiesRequired: string[];    // What needs to be built from scratch?
    integrationComplexity: "low" | "medium" | "high";
    estimatedDevWeeks: number;
  };

  // Do we have the data we need?
  dataAvailability: {
    score: number;                    // 1-10
    dataSourcesNeeded: string[];
    dataSourcesAvailable: string[];
    dataGaps: string[];               // What data is missing?
    acquisitionPath: string | null;   // How to get missing data
  };

  // Are there regulatory, legal, or ethical constraints?
  complianceRisk: {
    score: number;                    // 1-10 (10 = no issues)
    hipaaImplications: string;
    fdaClassificationRisk: string;
    liabilityExposure: string;
    legalReviewRequired: boolean;
  };

  // Does this require external partnerships or approvals?
  externalDependencies: {
    score: number;                    // 1-10 (10 = no dependencies)
    partnershipsRequired: string[];
    approvalTimelines: string[];
    costDependencies: string[];
  };

  // What's the cost to build and maintain?
  costEfficiency: {
    score: number;                    // 1-10
    buildCost: string;                // One-time development cost estimate
    runningCost: string;              // Monthly operational cost
    revenueImpact: string | null;     // Does this generate revenue or save costs?
  };

  // Composite
  compositeFeasibilityScore: number;  // Weighted combination (0-100)
}
```

### 4.3 Priority Matrix

```typescript
interface OpportunityPriority {
  quadrant: 
    | "DO_NOW"             // High impact + high feasibility — build immediately
    | "PLAN_NEXT"          // High impact + medium feasibility — start planning
    | "QUICK_WIN"          // Medium impact + high feasibility — build when capacity allows
    | "STRATEGIC_BET"      // High impact + low feasibility — invest in enabling capabilities
    | "MONITOR"            // Low impact currently but may grow — keep watching
    | "SKIP";              // Low impact + low feasibility — not worth pursuing

  priorityScore: number;   // compositeImpact × compositeFeasibility (0-10000)
  recommendation: string;  // 1-sentence recommendation
}
```

---

## 5. Opportunity Brief Generation

When an opportunity scores above threshold (or is in the DO_NOW / PLAN_NEXT quadrants), Claude generates a full opportunity brief.

```typescript
interface OpportunityBrief {
  id: string;
  generatedAt: string;
  
  // Header
  title: string;                        // "Virtual Trial Pre-Screening for Southeast TNBC Patients"
  oneLineSummary: string;               // "23% of TNBC patients in the Southeast match zero trials..."
  priority: OpportunityPriority;
  
  // The problem
  problem: {
    description: string;                // What's happening
    evidence: string[];                 // Data points that triggered this
    affectedPopulation: string;         // Who's affected
    currentImpact: string;              // What's the cost of inaction
    trendDirection: string;             // Getting better or worse?
  };
  
  // The opportunity
  opportunity: {
    description: string;                // What we could build
    mechanism: string;                  // HOW it would help
    impactEstimate: string;             // Quantified expected impact
    timeToImpact: string;              // How quickly would patients benefit?
  };
  
  // Scoring
  impactScore: ImpactScore;
  feasibilityScore: FeasibilityScore;
  
  // Proposed solution
  proposedSolution: {
    description: string;                // 2-3 paragraph solution description
    existingModulesLeveraged: string[]; // Which platform capabilities this uses
    newBuildRequired: string[];         // What needs to be built
    estimatedEffort: string;            // "2-3 Claude Code sessions, ~2 weeks"
    technicalApproach: string;          // High-level architecture
    draftSpecOutline: string[];         // Section headings for a full spec
  };
  
  // Risks and mitigations
  risks: {
    risk: string;
    likelihood: "low" | "medium" | "high";
    mitigation: string;
  }[];
  
  // Decision
  recommendation: "BUILD_NOW" | "SPEC_OUT" | "INVESTIGATE" | "MONITOR" | "DEFER";
  nextSteps: string[];                  // Specific actions to take
  
  // Connections
  relatedOpportunities: string[];       // IDs of related opportunities
  supersedes: string[];                 // Previous opportunities this replaces
}
```

### 5.1 Claude Prompt for Brief Generation

```typescript
const OPPORTUNITY_BRIEF_PROMPT = `
You are a strategic product intelligence engine for a cancer patient platform.
You've identified an opportunity based on observed data patterns.
Generate a comprehensive opportunity brief.

RULES:
- Ground every claim in the trigger data provided — no speculation
- Impact estimates must be conservative and clearly stated as estimates
- Proposed solutions must use EXISTING platform capabilities where possible
- Effort estimates should be realistic — reference the platform's actual tech stack
- Risks must include regulatory, ethical, and technical dimensions
- If this opportunity requires partnerships, name specific potential partners
- If this has survival rate implications, quantify them with citations

Context:
Platform capabilities: {capabilityInventory}
Trigger data: {triggerEvidence}
Pattern: {patternDescription}

Generate the OpportunityBrief JSON structure.
`;
```

---

## 6. Platform Capability Registry

A living document of what the platform can do, maintained automatically as modules ship.

```typescript
interface CapabilityRegistry {
  capabilities: {
    id: string;
    name: string;
    description: string;
    module: string;                     // Which module provides this
    inputTypes: string[];               // What data it can consume
    outputTypes: string[];              // What it produces
    limitations: string[];              // Known constraints
    costPerUse: string;                 // API cost, compute cost
    scaleLimitations: string;           // Throughput constraints
    addedDate: string;
    lastUpdated: string;
  }[];
}

// Example capabilities:
// - "Extract structured clinical data from photographed medical documents"
// - "Match patient profiles against clinical trial eligibility criteria"
// - "Generate plain-language treatment explanations from clinical data"
// - "Match patients to financial assistance programs"
// - "Pull structured patient data from Epic MyChart via FHIR"
// - "Classify and summarize cancer research publications"
// - "Track drug side effects through patient symptom journals"
// - "Generate personalized surveillance schedules from treatment history"
// - "Compare genomic profiles between original and recurrent tumors"
// - "Route urgent safety alerts to patients taking affected drugs"
```

The engine uses this registry to answer: "Can the platform address this opportunity with existing capabilities, or does it require new build?"

---

## 7. Continuous Monitoring Agents

Lightweight background processes that watch for specific triggers:

```typescript
interface MonitoringAgent {
  id: string;
  name: string;
  description: string;
  monitoredSource: string;              // What it watches
  triggerCondition: string;             // When to fire
  action: "create_opportunity" | "update_opportunity" | "send_alert";
  frequency: string;                    // Cron schedule
}

const MONITORING_AGENTS: MonitoringAgent[] = [
  {
    id: "fda_approval_monitor",
    name: "FDA Approval Monitor",
    description: "Watches for new FDA approvals relevant to platform user base",
    monitoredSource: "fda_openfda_api",
    triggerCondition: "New drug approval for a cancer type with ≥100 platform users",
    action: "create_opportunity",       // "Update Treatment Translator + notify eligible patients"
    frequency: "0 */4 * * *",           // Every 4 hours
  },
  {
    id: "trial_desert_monitor",
    name: "Trial Desert Monitor",
    description: "Watches for geographic areas where users consistently match zero trials",
    monitoredSource: "platform_match_data",
    triggerCondition: "≥20 users in a region with zero trial matches over 30 days",
    action: "create_opportunity",
    frequency: "0 6 * * 1",            // Weekly Monday
  },
  {
    id: "insurance_policy_monitor",
    name: "Insurance Policy Change Monitor",
    description: "Watches for insurer coverage policy changes affecting sequencing or treatment",
    monitoredSource: "insurer_policy_pages",
    triggerCondition: "Coverage status change for a test/drug used by platform patients",
    action: "create_opportunity",       // "Update coverage rules + notify affected patients"
    frequency: "0 6 * * *",            // Daily
  },
  {
    id: "guideline_update_monitor",
    name: "Clinical Guideline Update Monitor",
    description: "Watches for NCCN/ASCO guideline updates",
    monitoredSource: "nccn_updates_rss",
    triggerCondition: "Guideline update for a cancer type served by the platform",
    action: "create_opportunity",       // "Update Treatment Translator clinical grounding"
    frequency: "0 6 * * *",
  },
  {
    id: "community_need_surge_monitor",
    name: "Community Need Surge Monitor",
    description: "Watches for sudden increases in a specific unmet need reported by community",
    monitoredSource: "community_reports",
    triggerCondition: "≥10 community reports about the same unmet need in 14 days",
    action: "create_opportunity",
    frequency: "0 6 * * 1",            // Weekly
  },
  {
    id: "platform_error_pattern_monitor",
    name: "Platform Error Pattern Monitor",
    description: "Watches for recurring errors that indicate a systemic issue or missing feature",
    monitoredSource: "error_logs",
    triggerCondition: "Same error type >50 times in 7 days OR >10 users affected",
    action: "send_alert",
    frequency: "0 */6 * * *",          // Every 6 hours
  },
];
```

---

## 8. Operator Dashboard

Internal dashboard (not patient-facing) where you review opportunities, make decisions, and track execution.

### 8.1 Routes

```
/admin/engine                       Opportunity Engine dashboard
/admin/engine/opportunities         Ranked opportunity backlog
/admin/engine/opportunities/[id]    Individual opportunity brief
/admin/engine/streams               Input stream health + latest signals
/admin/engine/agents                Monitoring agent status
/admin/engine/capabilities          Platform capability registry
/admin/engine/history               Decision history + impact tracking
```

### 8.2 Dashboard Views

**Opportunity Backlog** — the primary view:
- Ranked list of opportunities by priority score
- Priority quadrant visualization (DO_NOW / PLAN_NEXT / QUICK_WIN / STRATEGIC_BET)
- Filters by category, module affected, impact dimension
- One-click to view full brief
- Decision actions: "Build Now" / "Spec Out" / "Investigate" / "Monitor" / "Defer"
- When "Build Now" is selected, generate Claude Code session prompt automatically

**Input Stream Health:**
- Each of the four streams with latest update time, item count, and key signals
- Anomaly alerts (stream hasn't updated, data quality issues)

**Agent Dashboard:**
- Each monitoring agent with status, last run, last trigger, error count
- Enable/disable agents
- Manual trigger for any agent

**Impact Tracking:**
- After an opportunity is built, track whether the expected impact materialized
- Before/after metrics for each executed opportunity
- Running tally of estimated lives impacted, money saved, trials connected

---

## 9. Data Model

```sql
-- Candidate opportunities detected by the engine
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Detection
  pattern_id TEXT NOT NULL,              -- Which detection pattern triggered this
  pattern_name TEXT NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL,
  trigger_data JSONB NOT NULL,           -- Evidence that triggered the detection
  
  -- Scoring
  impact_score JSONB NOT NULL,           -- Full ImpactScore structure
  feasibility_score JSONB NOT NULL,      -- Full FeasibilityScore structure
  composite_impact FLOAT NOT NULL,
  composite_feasibility FLOAT NOT NULL,
  priority_score FLOAT NOT NULL,         -- impact × feasibility
  priority_quadrant TEXT NOT NULL,       -- DO_NOW, PLAN_NEXT, etc.
  
  -- Brief
  brief JSONB,                           -- Full OpportunityBrief (generated by Claude)
  brief_generated_at TIMESTAMPTZ,
  
  -- Decision
  status TEXT DEFAULT 'pending',         -- pending, under_review, approved, building, completed, deferred, rejected
  decision TEXT,                         -- BUILD_NOW, SPEC_OUT, INVESTIGATE, MONITOR, DEFER
  decision_date TIMESTAMPTZ,
  decision_notes TEXT,
  
  -- Execution tracking
  spec_document_path TEXT,               -- Path to generated spec
  claude_code_sessions TEXT[],           -- Session IDs if built
  estimated_completion DATE,
  actual_completion DATE,
  
  -- Impact tracking (post-execution)
  expected_impact JSONB,                 -- What we thought would happen
  actual_impact JSONB,                   -- What actually happened (filled retrospectively)
  impact_measurement_date DATE,
  
  -- Relationships
  related_opportunity_ids UUID[],
  supersedes UUID[],
  superseded_by UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monitoring agent state
CREATE TABLE monitoring_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  frequency TEXT NOT NULL,               -- Cron expression
  last_run_at TIMESTAMPTZ,
  last_trigger_at TIMESTAMPTZ,
  last_error TEXT,
  run_count INTEGER DEFAULT 0,
  trigger_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  config JSONB,                          -- Agent-specific configuration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Input stream snapshots (for trend analysis)
CREATE TABLE stream_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_type TEXT NOT NULL,             -- behavioral, landscape, system_failure, capability
  snapshot_date DATE NOT NULL,
  data JSONB NOT NULL,                   -- Full stream data at this point in time
  key_signals TEXT[],                    -- Highlighted signals from this snapshot
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stream_type, snapshot_date)
);

-- Platform capability registry
CREATE TABLE platform_capabilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  module TEXT NOT NULL,
  input_types TEXT[],
  output_types TEXT[],
  limitations TEXT[],
  cost_per_use TEXT,
  scale_limitations TEXT,
  added_date DATE NOT NULL,
  last_updated DATE NOT NULL
);

CREATE INDEX idx_opportunities_status ON opportunities(status, priority_score DESC);
CREATE INDEX idx_opportunities_quadrant ON opportunities(priority_quadrant, priority_score DESC);
CREATE INDEX idx_opportunities_pattern ON opportunities(pattern_id);
CREATE INDEX idx_stream_snapshots_type ON stream_snapshots(stream_type, snapshot_date DESC);
```

---

## 10. Example Opportunities (Validation Cases)

These are real opportunities the engine should detect based on current data. Use them to validate the detection patterns and scoring.

### Example 1: Southeast TNBC Trial Desert

**Detection pattern:** `zero_match_cluster`
**Trigger data:** 47 TNBC patients in Alabama, Mississippi, Georgia with zero trial matches. Nearest enrolling mRNA vaccine trial is 400+ miles away at MD Anderson.
**Impact:** High — TNBC has worst prognosis, most to gain from novel therapies, and these patients have zero access.
**Feasibility:** Medium — could build virtual pre-screening (patient completes eligibility check remotely, only travels for treatment if accepted), or partner with a regional academic center to open a trial site.
**Proposed solution:** "Virtual Trial Pre-Screening Hub" — patients complete full eligibility workup through the platform, matched trial site receives the complete profile, site conducts remote eligibility confirmation via telemedicine, patient only travels for actual treatment. Reduces the geographic barrier from "must visit for screening AND treatment" to "must visit for treatment only."
**Priority quadrant:** PLAN_NEXT

### Example 2: Newly Approved ADC Not Reaching Eligible Patients

**Detection pattern:** `new_treatment_awareness_gap`
**Trigger data:** Dato-DXd (Datroway) FDA-approved Jan 2025 for HR+/HER2- metastatic BC. 340 platform users have this exact profile. Treatment Translator mention rate: 12% (only recently approved, many translators generated before approval). Community reports: 3 patients say their oncologist hasn't mentioned it.
**Impact:** High — FDA-approved treatment for their exact diagnosis that they may not be receiving.
**Feasibility:** High — update Treatment Translator clinical grounding to include Dato-DXd, regenerate for affected patients, send notification: "A new treatment option was approved for your type of breast cancer. Here's what to discuss with your oncologist."
**Proposed solution:** Automatic Treatment Translator refresh when T1 items in INTEL match user profiles. Proactive notification with oncologist communication template.
**Priority quadrant:** DO_NOW

### Example 3: Journal Abandonment After Week 3

**Detection pattern:** `manual_process_automatable` / behavioral signal
**Trigger data:** Survivorship journal completion rate drops from 78% (week 1) to 31% (week 3) to 12% (week 6). Users who stop journaling have 40% lower engagement with the rest of the platform.
**Impact:** Medium — journal data feeds symptom detection, late effects tracking, and weekly summaries. Losing this data stream reduces platform value for these patients.
**Feasibility:** High — multiple approaches: simplify to 3 taps instead of 5, move to passive data collection (Apple Health / wearable integration), gamification, or shift to weekly instead of daily.
**Proposed solution:** Apple Health / Google Health Connect integration for passive activity, sleep, and heart rate data. Reduce journal to 2 mandatory taps (energy + pain) with optional expansion. Weekly reflection instead of daily for users in late survivorship phase.
**Priority quadrant:** QUICK_WIN

### Example 4: Aggregate Genomic Data Could Power Research

**Detection pattern:** `data_asset_underleveraged`
**Trigger data:** Platform has 2,400 patient profiles with genomic data (mutations, TMB, biomarkers) linked to treatment outcomes (from community reports and survivorship journals). This is a dataset that cancer researchers would find extremely valuable for studying mutation-treatment response patterns.
**Impact:** High strategic value — positions platform as a research partner, attracts academic partnerships, contributes to the science that feeds back into better patient outcomes.
**Feasibility:** Medium — requires IRB approval, anonymization infrastructure, data use agreements, research partnership framework. Legal review required.
**Proposed solution:** "Research Data Collaborative" — anonymized, consented patient data contributed to academic research partners studying treatment-mutation response patterns. Patient opts in with clear consent. Research findings feed back into the INTEL stream and improve Treatment Translator grounding.
**Priority quadrant:** STRATEGIC_BET

### Example 5: Spanish-Language Platform Gap

**Detection pattern:** `demographic_dropout`
**Trigger data:** Hispanic/Latino users have 3.2x the intake abandonment rate of non-Hispanic users. 89% of document uploads from Hispanic users are in English, suggesting the documents are readable but the platform UX is the barrier. Hispanic women have 20% higher breast cancer mortality than non-Hispanic white women.
**Impact:** High — equity dimension, large affected population, survival rate gap.
**Feasibility:** Medium — Next.js i18n is straightforward, Claude handles Spanish fluently for summaries and translation, but all prompt templates need Spanish variants, legal disclaimers need translation, and cultural adaptation goes beyond language.
**Proposed solution:** Full Spanish-language platform with culturally adapted content, Spanish-language document extraction, and Spanish-language Treatment Translator. Partner with organizations like the National Alliance for Hispanic Health.
**Priority quadrant:** PLAN_NEXT

---

## 11. Build Sequence

### 11.1 Prerequisites

- Platform analytics operational (PostHog, Mixpanel, or custom)
- INTEL module at least partially operational (Sessions I1-I2 minimum)
- Sufficient user base to generate meaningful behavioral signals (~500+ users)

### 11.2 Claude Code Sessions

```
SESSION E1: Foundation + data collection
  1. Prisma schema for opportunities, monitoring_agents, stream_snapshots, platform_capabilities
  2. Platform capability registry — seed with all current module capabilities
  3. Behavioral signal collection pipeline
     - Funnel analytics aggregation
     - Match gap analysis
     - Feature usage tracking
     - Error pattern collection
  4. Stream snapshot job (weekly snapshot of all four streams)
  5. Admin route stubs (/admin/engine/*)

SESSION E2: Detection patterns + monitoring agents
  1. Detection pattern framework
     - Pattern definition interface
     - Pattern evaluation engine
     - Trigger condition checking
  2. Implement Category 1 patterns (Unserved Patient Segments)
     - Zero-match cluster detection
     - Demographic dropout detection
     - Subtype research desert detection
  3. Implement Category 3 patterns (Survival Rate Impact)
     - Guideline treatment gap detection
     - Trial enrollment failure detection
     - New treatment awareness gap detection
  4. Monitoring agents
     - FDA approval monitor
     - Trial desert monitor
     - Community need surge monitor
     - Platform error pattern monitor
  5. Agent scheduling (NATS or cron)

SESSION E3: Scoring + brief generation
  1. Impact scoring framework implementation
     - All five impact dimensions
     - Composite score calculation
     - Calibrate weights against example opportunities
  2. Feasibility scoring framework
     - Technical feasibility assessment (cross-reference capability registry)
     - Data availability check
     - Compliance risk assessment
     - External dependency mapping
     - Cost estimation
  3. Priority matrix assignment
  4. Claude-powered opportunity brief generation
     - Prompt engineering for comprehensive briefs
     - Test against the 5 example opportunities in Section 10
     - Iterate until briefs are actionable and well-grounded
  5. Auto-generate Claude Code session prompts for "BUILD_NOW" opportunities

SESSION E4: Dashboard + decision workflow
  1. Operator dashboard UI (/admin/engine)
     - Opportunity backlog (ranked, filterable)
     - Priority quadrant visualization
     - Input stream health view
     - Agent status dashboard
  2. Individual opportunity brief view (/admin/engine/opportunities/[id])
     - Full brief rendering
     - Decision buttons (Build Now / Spec Out / Investigate / Monitor / Defer)
     - Notes field for decision rationale
  3. Decision workflow
     - Status transitions
     - "Build Now" → auto-generate Claude Code session prompt
     - "Spec Out" → create draft spec document from brief
  4. Impact tracking
     - Before/after metric capture
     - Running impact dashboard
  5. Notification to operator (email/Slack) when DO_NOW opportunity detected

SESSION E5: Advanced patterns + landscape integration
  1. Implement Category 2 patterns (Newly Addressable Bottlenecks)
     - New API availability detection
     - Cost reduction monitoring
     - Regulatory pathway opening detection
     - AI capability advance detection
  2. Implement Category 4 patterns (Platform Efficiency)
     - Manual process automation detection
     - Data asset underleverage detection
     - Partnership opportunity detection
  3. System failure data integration
     - SEER database integration for disparity data
     - Geographic access gap calculation from trial + user data
     - Insurance denial rate tracking from platform data
  4. Landscape signal integration
     - Connect INTEL stream events to opportunity detection
     - Regulatory change monitoring integration
     - Technology advance monitoring
  5. Cross-stream pattern detection
     - Patterns that require signals from 3+ streams simultaneously
     - Complex trigger conditions
```

### 11.3 Timeline Estimate

```
Session E1:  Week 1-2   (foundation — data flowing into engine)
Session E2:  Week 2-4   (detection patterns — opportunities being identified)
Session E3:  Week 4-6   (scoring + briefs — opportunities are actionable)
Session E4:  Week 6-8   (dashboard — you can review and decide)
Session E5:  Week 8-10  (advanced patterns + integrations — full coverage)

Total: ~10 weeks
MVP (E1-E3): 6 weeks — engine identifies and scores opportunities, generates briefs
Usable (E1-E4): 8 weeks — full dashboard for review and decision-making
Complete (E1-E5): 10 weeks — all pattern categories, cross-stream detection
```

### 11.4 Operating Rhythm

Once built, the engine operates on a weekly cycle:

```
Monday:     Monitoring agents run full evaluation cycle
Tuesday:    New opportunities scored and briefs generated
Wednesday:  Operator reviews opportunity backlog (30 min)
            - Approve DO_NOW items for immediate build
            - Mark PLAN_NEXT items for spec-out
            - Defer or reject low-priority items
Thursday:   Approved opportunities → Claude Code session prompts generated
Friday:     Impact review of previously-executed opportunities
```

This creates a continuous improvement cycle: detect → score → decide → build → measure → detect again. The platform gets smarter and more impactful every week, driven by data rather than intuition.
