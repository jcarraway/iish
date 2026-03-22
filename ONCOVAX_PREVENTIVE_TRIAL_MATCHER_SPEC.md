# Preventive Trial Matcher — Phase 1 Extension Spec

## Quick-Add: Surface Preventive Trials in the MATCH Engine

**Author:** Rett (Happy Medium)
**Date:** March 2026
**Depends on:** Phase 1 (MATCH) trial ingestion pipeline, eligibility engine, patient profiles
**Purpose:** Minimal extension to the existing Phase 1 MATCH engine that surfaces preventive breast cancer trials (vaccines, chemoprevention studies, risk reduction interventions) to both diagnosed patients (for family referral) and undiagnosed high-risk users. This is a 2-3 session addition, not a new module. It extends the platform's addressable market immediately while the full Phase 0 PREVENT module is built.

---

## Table of Contents

1. [Rationale](#1-rationale)
2. [Implementation: Trial Ingestion Extension](#2-implementation-trial-ingestion-extension)
3. [Implementation: Eligibility Engine Extension](#3-implementation-eligibility-engine-extension)
4. [Implementation: UI Extensions](#4-implementation-ui-extensions)
5. [Implementation: Family Referral Flow](#5-implementation-family-referral-flow)
6. [Data Model Changes](#6-data-model-changes)
7. [Build Sequence](#7-build-sequence)

---

## 1. Rationale

### 1.1 Why Now (Before Phase 0)

The preventive vaccine landscape is moving fast:

- Cleveland Clinic / Anixa: alpha-lactalbumin vaccine Phase 2 opening late 2026, targeting TNBC prevention in high-risk women
- Washington University: personalized neoantigen vaccine for TNBC — Phase 1 results show 14/18 immune response, 16/18 cancer-free at 3 years
- BioNTech: multiple mRNA vaccine programs in breast cancer (BNT116, individualized neoantigen vaccines)
- Moderna: mRNA-4157 (V940) Phase 3 expansion — primarily therapeutic but implications for prevention
- Over 120 RNA cancer vaccine trials currently active, with 15+ specifically focused on breast cancer

Women at high risk of breast cancer — especially BRCA carriers — are actively seeking alternatives to prophylactic mastectomy. The platform can connect them to these trials immediately with minimal new code.

Additionally, every diagnosed patient on the platform has family members who may benefit from preventive trials. The family referral flow is a natural growth vector.

### 1.2 Scope Constraint

This spec does NOT build the full Phase 0 risk assessment engine. It adds:
1. Preventive trial ingestion to the existing ClinicalTrials.gov sync
2. A lightweight eligibility pre-screen for preventive trials
3. A "For Your Family" section in the patient dashboard
4. A standalone landing page for undiagnosed visitors

That's it. Full risk scoring, environmental tracking, and genomic integration come in Phase 0.

---

## 2. Implementation: Trial Ingestion Extension

### 2.1 ClinicalTrials.gov Query Extension

The existing trial-ingestion worker syncs therapeutic breast cancer trials. Extend the query to also capture preventive and risk-reduction studies.

```typescript
// Existing query (therapeutic)
const THERAPEUTIC_QUERY = {
  condition: "Breast Cancer",
  status: ["RECRUITING", "NOT_YET_RECRUITING", "ACTIVE_NOT_RECRUITING"],
  studyType: "INTERVENTIONAL",
};

// New: Preventive/risk-reduction query
const PREVENTIVE_QUERIES = [
  {
    // Preventive vaccine trials
    condition: "Breast Cancer",
    intervention: "Vaccine",
    status: ["RECRUITING", "NOT_YET_RECRUITING", "ACTIVE_NOT_RECRUITING"],
    studyType: "INTERVENTIONAL",
    phase: ["PHASE1", "PHASE2", "PHASE3"],
  },
  {
    // Chemoprevention studies
    condition: "Breast Cancer Prevention",
    status: ["RECRUITING", "NOT_YET_RECRUITING"],
    studyType: "INTERVENTIONAL",
  },
  {
    // Risk reduction studies (broader net)
    terms: "breast cancer risk reduction",
    status: ["RECRUITING", "NOT_YET_RECRUITING"],
    studyType: "INTERVENTIONAL",
  },
  {
    // BRCA carrier prevention studies
    condition: "BRCA1 Mutation Carrier OR BRCA2 Mutation Carrier",
    terms: "prevention OR vaccine OR risk reduction",
    status: ["RECRUITING", "NOT_YET_RECRUITING"],
    studyType: "INTERVENTIONAL",
  },
];
```

### 2.2 Trial Classification

Add a `trial_category` field to the existing trial data model to distinguish therapeutic from preventive trials.

```typescript
type TrialCategory =
  | "therapeutic"           // Existing: treating diagnosed cancer
  | "adjuvant"              // Existing: post-surgery to prevent recurrence
  | "preventive_vaccine"    // New: vaccine to prevent cancer in high-risk individuals
  | "chemoprevention"       // New: drug-based risk reduction (tamoxifen, AI studies)
  | "risk_reduction"        // New: lifestyle, screening, or other interventions
  | "biomarker"             // New: studies collecting data on risk biomarkers
  | "recurrence_prevention" // Bridges SURVIVE and PREVENT — post-treatment vaccines
  ;

// Classification logic (applied during ingestion)
function classifyTrial(trial: ClinicalTrialRaw): TrialCategory {
  const title = trial.officialTitle.toLowerCase();
  const conditions = trial.conditions.map(c => c.toLowerCase());
  const interventions = trial.interventions.map(i => i.toLowerCase());
  const eligibility = trial.eligibilityCriteria.toLowerCase();

  // Preventive vaccine
  if (interventions.some(i => i.includes("vaccine")) &&
      (eligibility.includes("no prior cancer") || 
       eligibility.includes("cancer-free") ||
       eligibility.includes("high risk") ||
       eligibility.includes("brca") ||
       title.includes("prevent"))) {
    return "preventive_vaccine";
  }

  // Chemoprevention
  if (title.includes("prevention") || title.includes("chemoprevention") ||
      conditions.some(c => c.includes("prevention")) ||
      (eligibility.includes("risk reduction") && !eligibility.includes("diagnosed"))) {
    return "chemoprevention";
  }

  // Recurrence prevention (vaccines for survivors)
  if (interventions.some(i => i.includes("vaccine")) &&
      eligibility.includes("completed treatment")) {
    return "recurrence_prevention";
  }

  // Risk reduction
  if (title.includes("risk reduction") || title.includes("risk-adapted screening")) {
    return "risk_reduction";
  }

  // Biomarker / observational
  if (trial.studyType === "OBSERVATIONAL" && 
      conditions.some(c => c.includes("breast cancer risk"))) {
    return "biomarker";
  }

  return "therapeutic";
}
```

### 2.3 Manual Trial Curation Layer

For high-priority preventive trials, supplement automated ingestion with curated entries. The preventive trial landscape is small enough (~50-100 active trials globally) that manual curation adds significant value.

```typescript
interface CuratedPreventiveTrial {
  clinicalTrialsGovId: string;
  trialCategory: TrialCategory;
  
  // Curated fields (override/supplement ClinicalTrials.gov data)
  curatedSummary: string;                 // Plain-language summary (8th grade reading level)
  targetPopulation: string;               // "Women with BRCA1/2 mutations who are cancer-free"
  vaccineTarget: string | null;           // "alpha-lactalbumin", "personalized neoantigens", etc.
  mechanism: string;                      // Brief MOA explanation
  keyResults: string | null;              // Phase 1/2 results if available
  
  // Matching hints
  matchingCriteria: {
    requiresBRCA: boolean;
    requiresFamilyHistory: boolean;
    requiresHighRisk: boolean;            // Defined as >20% lifetime risk
    ageRange: [number, number];
    genderRequirement: "female" | "any";
    priorCancerAllowed: boolean;
    specificSubtype: string | null;       // "TNBC high-risk", "ER+ prevention", etc.
  };

  // Editorial
  editorNote: string | null;              // Why this trial is notable
  lastReviewedDate: string;
  reviewedBy: string;
}

// Seed data: known high-priority preventive trials as of March 2026
const CURATED_PREVENTIVE_TRIALS: CuratedPreventiveTrial[] = [
  {
    clinicalTrialsGovId: "NCT04674306",   // Cleveland Clinic aLA vaccine
    trialCategory: "preventive_vaccine",
    curatedSummary: "A vaccine targeting alpha-lactalbumin, a protein found in most triple-negative breast cancers but not in healthy adult breast tissue. Phase 1 showed immune response in 74% of participants. Phase 2 will test whether the vaccine reduces cancer risk in high-risk women.",
    targetPopulation: "Women with BRCA1/2 mutations or prior TNBC, currently cancer-free",
    vaccineTarget: "alpha-lactalbumin",
    mechanism: "Trains immune system to recognize alpha-lactalbumin, which is expressed in TNBC tumors but absent in healthy adult breast tissue. May prevent TNBC development by eliminating cells that begin expressing this protein.",
    keyResults: "Phase 1: 74% immune response rate, well-tolerated, safe dose identified",
    matchingCriteria: {
      requiresBRCA: false,
      requiresFamilyHistory: false,
      requiresHighRisk: true,
      ageRange: [25, 75],
      genderRequirement: "female",
      priorCancerAllowed: true,           // TNBC survivors in remission eligible
      specificSubtype: "TNBC_risk",
    },
    editorNote: "One of the most advanced true preventive breast cancer vaccines. Phase 2 opening late 2026.",
    lastReviewedDate: "2026-03-15",
    reviewedBy: "oncovax_team",
  },
  // Additional curated trials added as identified
];
```

---

## 3. Implementation: Eligibility Engine Extension

### 3.1 Preventive Trial Eligibility Pre-Screen

The existing eligibility engine parses therapeutic trial criteria against diagnosed patient profiles. For preventive trials, the target user may NOT have a cancer diagnosis. Need a simplified pre-screen.

```typescript
interface PreventiveEligibilityPreScreen {
  // Lightweight eligibility check for users without a cancer diagnosis
  // Does NOT replace full eligibility — just identifies likely matches
  
  input: {
    // Minimal data needed (can be collected without full onboarding)
    age: number;
    biologicalSex: "female";
    hasBreastCancerHistory: boolean;
    breastCancerSubtype: string | null;     // If survivor
    treatmentStatus: string | null;          // "completed", "in_remission"
    hasBRCAMutation: boolean | "unknown";
    hasOtherHighRiskMutation: boolean | "unknown";
    hasFamilyHistory: boolean;
    estimatedLifetimeRisk: number | null;    // If they've been assessed
    currentZipCode: string;                  // For trial proximity
  };

  output: {
    matchedTrials: {
      trial: CuratedPreventiveTrial;
      matchStrength: "strong" | "possible" | "worth_discussing";
      matchReason: string;                  // "You have a BRCA1 mutation and are cancer-free"
      distanceToSite: string | null;
      nextSteps: string;                    // "Ask your genetic counselor about this trial"
    }[];

    // If no matches
    noMatchMessage: string;                 // "No matching preventive trials currently recruiting 
                                            //  near you. We'll notify you when new trials open."
    
    // Encourage full risk assessment
    riskAssessmentCTA: boolean;             // "Want a full risk assessment? Complete your profile."
  };
}
```

### 3.2 Integration with Existing MATCH Engine

```typescript
// In the existing trial matching router, add preventive trial handling

// apps/web/src/app/api/trpc/routers/trials.ts (conceptual)

const trialRouter = router({
  // Existing: match diagnosed patient to therapeutic trials
  matchTherapeutic: protectedProcedure
    .input(therapeuticMatchInput)
    .query(async ({ input }) => {
      // ... existing logic
    }),

  // New: match undiagnosed/high-risk user to preventive trials
  matchPreventive: protectedProcedure
    .input(preventiveMatchInput)
    .query(async ({ input }) => {
      const allPreventiveTrials = await db.query.trials.findMany({
        where: inArray(trials.trialCategory, [
          "preventive_vaccine",
          "chemoprevention", 
          "risk_reduction",
        ]),
      });

      const curatedTrials = await db.query.curatedPreventiveTrials.findMany({});

      // Merge automated + curated, deduplicate by NCT ID
      const merged = mergeTrials(allPreventiveTrials, curatedTrials);

      // Pre-screen eligibility
      const matches = merged
        .map(trial => ({
          trial,
          eligibility: preScreenEligibility(input, trial),
        }))
        .filter(m => m.eligibility.matchStrength !== "no_match")
        .sort((a, b) => matchStrengthOrder(a.eligibility) - matchStrengthOrder(b.eligibility));

      return {
        matches,
        totalPreventiveTrials: merged.length,
      };
    }),

  // New: match survivor to recurrence prevention trials (bridges SURVIVE)
  matchRecurrencePrevention: protectedProcedure
    .input(recurrencePreventionInput)
    .query(async ({ input }) => {
      const trials = await db.query.trials.findMany({
        where: eq(trials.trialCategory, "recurrence_prevention"),
      });
      // ... matching logic using treatment history from SURVIVE profile
    }),
});
```

---

## 4. Implementation: UI Extensions

### 4.1 "For Your Family" Section (Existing Patient Dashboard)

Add a section to the diagnosed patient's dashboard that surfaces preventive resources for their family members.

```typescript
interface ForYourFamilySection {
  // Displayed on the main patient dashboard after treatment plan is loaded
  
  sectionTitle: "For Your Family";
  subtitle: "Your diagnosis may affect your family members' risk. Here's how they can take action.";

  content: {
    familyRiskOverview: {
      // Based on patient's diagnosis
      firstDegreeRisk: string;            // "First-degree relatives (sisters, daughters, mother) 
                                          //  may have elevated breast cancer risk"
      geneticTestingRecommendation: string;
      actionableSteps: string[];
    };

    preventiveTrialsForFamily: {
      headline: "Preventive Trials Your Family Members May Qualify For";
      trials: PreventiveTrialMatch[];     // Pre-filtered based on patient's diagnosis
      // e.g., if patient has TNBC → show alpha-lactalbumin vaccine trial
      // e.g., if patient has BRCA → show BRCA-specific prevention trials
    };

    shareableLink: {
      // Generate a unique referral link for family members
      url: string;                        // oncovax.com/prevent?ref={patientId_hash}
      message: string;                    // Pre-written text to share with family
      channels: ["email", "text", "copy_link"];
    };

    riskAssessmentReferral: {
      headline: "Free Risk Assessment for Your Family";
      description: "Your family members can use OncoVax to understand their personal 
                    breast cancer risk and find preventive options.";
      cta: "Share Risk Assessment Link";
    };
  };
}
```

### 4.2 Preventive Trial Landing Page (Public, No Auth)

A standalone page accessible without login that surfaces preventive trials and drives sign-up.

```
Route: /prevent/trials (public)
```

```typescript
interface PreventiveTrialLandingPage {
  // No auth required — public page for organic/referral traffic
  
  hero: {
    headline: "Breast Cancer Prevention Trials Are Recruiting Now";
    subheadline: "New vaccines and treatments are being tested that could prevent 
                  breast cancer before it starts. See if you qualify.";
  };

  // Quick eligibility quiz (5 questions, no login required)
  quickQuiz: {
    questions: [
      { q: "Have you been diagnosed with breast cancer?", type: "yes_no" },
      { q: "What is your age?", type: "number" },
      { q: "Do you have a known BRCA1, BRCA2, or other genetic mutation?", type: "yes_no_unsure" },
      { q: "Do you have a family history of breast cancer?", type: "yes_no" },
      { q: "What is your zip code?", type: "text" },
    ];
    
    onComplete: {
      showMatchedTrials: true;
      showGenericTrialList: true;         // If no matches, show all open preventive trials
      signUpCTA: "Create a free account to get notified when new preventive trials open";
    };
  };

  // Featured trials (curated)
  featuredTrials: CuratedPreventiveTrial[];

  // Educational content
  education: {
    whatIsPreventiveVaccine: string;       // Brief explainer
    howTrialsWork: string;                 // Demystify clinical trials
    whoShouldConsider: string;             // Risk categories that benefit most
  };

  // SEO-optimized for:
  // "breast cancer prevention vaccine"
  // "breast cancer vaccine clinical trial"
  // "BRCA cancer prevention options"
  // "alternatives to prophylactic mastectomy"
};
```

### 4.3 Survivor Dashboard: Preventive Trial Bridge

For survivors in the SURVIVE module, add a bridge to recurrence-prevention vaccine trials.

```typescript
interface SurvivorPreventiveTrialBridge {
  // In SURVIVE dashboard → Recurrence Monitoring section
  
  section: {
    headline: "Vaccine Trials for Recurrence Prevention";
    description: "New vaccines are being tested that train your immune system to 
                  prevent your specific type of breast cancer from returning.";
    
    matchedTrials: PreventiveTrialMatch[];   // Filtered by treatment history + subtype
    
    // Highlight personalized neoantigen vaccines for survivors with sequencing data
    personalizedVaccineNote: {
      show: boolean;                        // True if patient has tumor sequencing on file
      message: "Because we have your tumor's genetic profile, you may be eligible 
                for personalized vaccine trials that target your specific cancer mutations.";
    };
  };
}
```

---

## 5. Implementation: Family Referral Flow

### 5.1 Referral Link Generation

```typescript
interface FamilyReferralSystem {
  generateReferralLink(patientId: string): {
    // Hash patient ID — referral link should not expose patient identity
    referralCode: string;                   // Short, shareable code
    url: string;                            // oncovax.com/prevent?ref={code}
    
    // Pre-populated context for the family member
    context: {
      // "A family member of yours is being treated for breast cancer on our platform.
      //  This means you may have elevated risk. Take our free risk assessment to learn more."
      welcomeMessage: string;
      
      // Auto-flag that this user has family history
      prefillFamilyHistory: true;
      
      // If patient consented to share diagnosis type (not details)
      familyMemberCancerType: string | null;  // "triple-negative breast cancer" (if consented)
    };
  };

  // Tracking (for platform growth metrics)
  trackReferral(referralCode: string, newUserId: string): void;
  
  // Privacy: patient never sees who signed up via their link
  // Family member never sees patient's details
  privacyWall: {
    patientSeesReferralCount: true;         // "3 family members have signed up"
    patientSeesNames: false;
    familyMemberSeesPatientDetails: false;
    familyMemberKnowsReferralSource: true;  // "Referred by a family member"
  };
}
```

### 5.2 Shareable Messages

```typescript
const SHAREABLE_MESSAGES = {
  text: {
    template: "Hey — I've been using an app called OncoVax for my breast cancer care. They have a free tool that helps you understand your personal breast cancer risk and find prevention options, including new vaccine trials. Given our family history, it might be worth checking out: {url}",
    channels: ["sms", "whatsapp"],
  },
  
  email: {
    subject: "Something I want you to look into — breast cancer risk assessment",
    body: "I've been using a platform called OncoVax during my treatment, and they have a free risk assessment tool for family members of cancer patients. Given our family history, I think you should check it out.\n\nYou can find preventive options — there are actually vaccine trials now that might prevent breast cancer before it starts.\n\nHere's the link: {url}\n\nLove you.",
  },

  // Patient can customize before sending
  editable: true,
};
```

---

## 6. Data Model Changes

### 6.1 Trial Table Extension

```sql
-- Add to existing trials table
ALTER TABLE trials ADD COLUMN trial_category TEXT DEFAULT 'therapeutic';
ALTER TABLE trials ADD COLUMN is_preventive BOOLEAN DEFAULT FALSE;

-- Index for preventive trial queries
CREATE INDEX idx_trials_category ON trials(trial_category);
CREATE INDEX idx_trials_preventive ON trials(is_preventive) WHERE is_preventive = TRUE;

-- Curated preventive trials (supplement automated ingestion)
CREATE TABLE curated_preventive_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nct_id TEXT NOT NULL UNIQUE,
  trial_category TEXT NOT NULL,
  curated_summary TEXT,
  target_population TEXT,
  vaccine_target TEXT,
  mechanism TEXT,
  key_results TEXT,
  matching_criteria JSONB NOT NULL,
  editor_note TEXT,
  last_reviewed_date DATE,
  reviewed_by TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preventive trial pre-screen profiles (lightweight, for users without full diagnosis)
CREATE TABLE preventive_prescreens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  age INTEGER,
  has_cancer_history BOOLEAN DEFAULT FALSE,
  cancer_subtype TEXT,
  treatment_status TEXT,
  has_brca BOOLEAN,
  has_other_high_risk_mutation BOOLEAN,
  has_family_history BOOLEAN,
  estimated_lifetime_risk NUMERIC,
  zip_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family referral tracking
CREATE TABLE family_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referring_patient_id UUID REFERENCES patients(id),
  referral_code TEXT NOT NULL UNIQUE,
  referred_patient_id UUID REFERENCES patients(id),  -- NULL until signup
  created_at TIMESTAMPTZ DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ
);
```

---

## 7. Build Sequence

### Total: 2-3 Claude Code Sessions

| Session | Scope | Time Estimate |
|---------|-------|---------------|
| PTM-1 | Trial ingestion extension: add preventive queries to ClinicalTrials.gov sync worker, add `trial_category` classification logic, seed curated preventive trials table. Run sync and verify preventive trials are captured. | 2-3 hours |
| PTM-2 | Preventive matching: add `matchPreventive` tRPC route, build pre-screen eligibility logic, build "For Your Family" dashboard section, build preventive trial landing page (`/prevent/trials`), generate referral links. | 3-4 hours |
| PTM-3 | Polish + bridge: add preventive trial bridge to SURVIVE dashboard, shareable message templates, referral tracking, SEO optimization on landing page. | 2-3 hours |

### Dependencies

- Phase 1 MATCH engine must be functional (trial ingestion, eligibility parsing, patient profiles)
- Phase 5 SURVIVE dashboard should exist (for the survivor → prevention bridge)
- No dependency on Phase 0 PREVENT — this is the lightweight precursor

### Output

After these 3 sessions, the platform can:
1. Ingest and classify preventive breast cancer trials from ClinicalTrials.gov
2. Show preventive trials to diagnosed patients for family referral
3. Match undiagnosed high-risk users to preventive trials via a public landing page
4. Bridge survivors to recurrence-prevention vaccine trials
5. Generate referral links that drive family member sign-ups
6. Serve as the foundation for the full Phase 0 PREVENT module