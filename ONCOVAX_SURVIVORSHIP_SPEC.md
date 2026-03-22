# Survivorship Module — Technical Specification v1.0

## Phase 5: Long-Term Care, Recurrence Detection & Prevention (SURVIVE)

**Author:** Rett (Happy Medium)
**Date:** March 2026
**Depends on:** Phase 1 (MATCH) patient profiles, document ingestion, Treatment Translator, Financial Assistance Finder
**Purpose:** Standalone spec for Claude Code. Extends the existing platform from a crisis tool (6 months around diagnosis) into a lifelong health companion (5-20+ years post-treatment). Designed to be built after Phase 1 is stable with real users providing feedback.

---

## Table of Contents

1. [Strategic Context](#1-strategic-context)
2. [Module Architecture](#2-module-architecture)
3. [Personalized Survivorship Care Plan](#3-personalized-survivorship-care-plan)
4. [Recurrence Monitoring Intelligence](#4-recurrence-monitoring-intelligence)
5. [Late Effects Tracker](#5-late-effects-tracker)
6. [Evidence-Based Lifestyle Engine](#6-evidence-based-lifestyle-engine)
7. [Psychosocial Support Layer](#7-psychosocial-support-layer)
8. [Care Coordination Hub](#8-care-coordination-hub)
9. [Recurrence Pathway](#9-recurrence-pathway)
10. [Data Model Extensions](#10-data-model-extensions)
11. [Integration Points with Existing Phases](#11-integration-points-with-existing-phases)
12. [Build Sequence](#12-build-sequence)

---

## 1. Strategic Context

### 1.1 The Problem

Active cancer treatment creates a paradox: patients receive maximum support during the most clinically structured phase, then get released into a vacuum when they need different but equally critical support.

The post-treatment phase involves:
- Recurrence surveillance (highest risk: years 1-5, ongoing risk for ER+ subtypes to 20+ years)
- Managing late/long-term treatment effects (some permanent, some emerging months or years later)
- Lifestyle modifications with strong evidence for recurrence reduction
- Psychological adaptation (fear of recurrence is the #1 reported burden)
- Care coordination between oncology and primary care (routinely fails)
- Ongoing financial burden (hormonal therapy for 5-10 years, monitoring, symptom management)

Only 46% of oncologists provide survivorship care plans. Only 34% assess psychosocial long-term effects. Only 34% screen for subsequent cancers. Primary care providers often lack actionable information about the patient's cancer treatment history and what to monitor.

### 1.2 The Opportunity

The patient is already in the platform. We have their clinical profile, treatment history, subtype, biomarkers, and extracted medical documents. The survivorship module is the Treatment Translator extended forward in time — the same architecture (Claude-powered personalization from clinical data), applied to the post-treatment phase.

This transforms the platform from:
- **Crisis tool** (used for ~6 months) → **Lifelong companion** (used for 5-20+ years)
- **One-time value** → **Compounding value** (the longer someone uses it, the more personalized it becomes)
- **Trial matcher** → **Full-cycle cancer intelligence** (diagnosis → treatment → survivorship → recurrence detection → re-entry into trial matching if needed)

### 1.3 The Flywheel Back to Phase 3

Survivors at high risk of recurrence are the exact population most likely to benefit from personalized cancer vaccines. The vaccines work best in the adjuvant setting — targeting minimal residual disease after surgery. The survivorship module identifies these patients, monitors them with ctDNA, and connects them to vaccine trials at the optimal moment. This is the killer loop: survivorship monitoring → molecular relapse detected → immediate re-entry into trial matching → vaccine trial enrollment.

---

## 2. Module Architecture

### 2.1 Entry Point: Treatment Completion Transition

The survivorship module activates when a patient's treatment status transitions from "active treatment" to "post-treatment surveillance." This can be triggered by:
- Patient self-reports treatment completion
- MyChart FHIR sync detects treatment plan completion
- Document upload of treatment summary / discharge letter
- Manual oncologist or care team input via provider portal

```typescript
interface TreatmentCompletionEvent {
  patientId: string;
  completionDate: string;
  completionType: "curative_intent" | "ongoing_maintenance" | "palliative";

  // Treatment summary (extracted or entered)
  treatmentSummary: {
    surgeries: Surgery[];
    chemotherapyRegimens: ChemoRegimen[];
    radiationDetails: RadiationDetails | null;
    hormonalTherapy: HormonalTherapy | null;    // May be ongoing for 5-10 years
    targetedTherapy: TargetedTherapy | null;
    immunotherapy: Immunotherapy | null;
  };

  // Residual risk profile
  residualRisk: {
    recurrenceRiskCategory: "low" | "intermediate" | "high";
    estimatedRecurrenceRisk5yr: number | null;    // Percentage, if available
    riskFactors: string[];                         // From genomic assays like Oncotype DX
    ongoingTherapy: string[];                      // e.g., "tamoxifen for 5 years"
  };

  // Surveillance plan from oncologist (if provided)
  oncologistSurveillancePlan: string | null;        // Often a brief paragraph or nothing
}
```

### 2.2 New Routes

```
/survive                            Survivorship home — dashboard overview
/survive/plan                       Personalized survivorship care plan
/survive/monitoring                 Recurrence monitoring — schedule, reminders, results
/survive/monitoring/ctdna           ctDNA testing guide and results tracking
/survive/effects                    Late effects tracker — symptoms, management, alerts
/survive/lifestyle                  Evidence-based lifestyle recommendations
/survive/lifestyle/exercise         Exercise programming
/survive/lifestyle/nutrition        Nutrition guidance
/survive/lifestyle/environment      Environmental exposure reduction
/survive/mental-health              Psychosocial support and resources
/survive/care-team                  Care coordination hub
/survive/appointments               Appointment calendar + prep
/survive/journal                    Symptom and wellness journal
```

### 2.3 Notification Cadence

Post-treatment engagement requires a different rhythm than active treatment. Too frequent = anxiety-inducing. Too infrequent = abandonment.

```typescript
interface SurvivorshipNotificationSchedule {
  // Year 1-2 post-treatment (highest recurrence risk, most adjustment)
  earlyPhase: {
    wellnessCheckIn: "weekly";          // "How are you feeling this week?"
    appointmentReminders: "2_weeks_before";
    lifestyleNudges: "2x_per_week";     // Evidence-based tips, not spam
    symptomReview: "monthly";           // "Any new symptoms to log?"
    ctdnaReminder: "per_schedule";      // If enrolled in monitoring
  };

  // Year 3-5 (settling into "new normal")
  midPhase: {
    wellnessCheckIn: "biweekly";
    appointmentReminders: "2_weeks_before";
    lifestyleNudges: "weekly";
    symptomReview: "quarterly";
    annualSurvivorshipReview: "yearly"; // Comprehensive check-in
  };

  // Year 5+ (long-term survivorship)
  latePhase: {
    wellnessCheckIn: "monthly";
    appointmentReminders: "2_weeks_before";
    lifestyleNudges: "weekly";
    symptomReview: "biannually";
    annualSurvivorshipReview: "yearly";
  };
}
```

---

## 3. Personalized Survivorship Care Plan

### 3.1 Overview

The survivorship care plan (SCP) is the foundational document of the module. It's a Claude-generated, personalized guide that covers everything the patient needs to know about life after treatment. Less than half of patients receive one from their oncologist — and when they do, it's typically a generic template. Ours is personalized to their exact diagnosis, treatment, and risk profile.

### 3.2 Generation Pipeline

Two-step Claude pipeline, same architecture as the Treatment Translator:

**Step 1 — Clinical grounding:**
```typescript
const SCP_GROUNDING_PROMPT = `
You are generating the clinical foundation for a personalized breast cancer
survivorship care plan. Given the patient's complete treatment history and
clinical profile, produce a structured clinical document covering:

1. RECURRENCE RISK ASSESSMENT
   - Estimated 5-year and 10-year recurrence risk based on subtype, stage,
     grade, and treatment response
   - Which years carry the highest risk for this subtype
   - Risk modifiers (genomic assay scores if available, treatment completion)

2. SURVEILLANCE SCHEDULE
   - ASCO/NCCN guideline-recommended follow-up for this specific subtype/stage
   - Clinical exam frequency
   - Imaging schedule (mammography, MRI if applicable)
   - Blood work if indicated
   - ctDNA monitoring eligibility and recommendation

3. LATE EFFECTS PROFILE
   - For EACH drug/treatment the patient received, list:
     - Known late effects with onset timing
     - Monitoring recommendations
     - When to seek medical attention
   - Specific drug-drug interactions with ongoing therapies

4. LIFESTYLE EVIDENCE
   - Exercise: meta-analysis effect sizes for recurrence reduction
     specific to this subtype
   - Weight management: risk per unit BMI change for this subtype
   - Alcohol: quantified risk for this receptor status
   - Dietary patterns: strongest evidence for this cancer type
   - Sleep/circadian: relevant evidence

5. ONGOING THERAPY MANAGEMENT
   - If on hormonal therapy: expected duration, side effects, management
   - If on maintenance targeted therapy: monitoring schedule
   - Drug interaction warnings with common OTC medications

6. SECOND PRIMARY CANCER SCREENING
   - Elevated risks based on treatment received
     (e.g., endometrial cancer screening if on tamoxifen)
   - Additional screening beyond standard age-based recommendations

Patient Profile:
{fullPatientProfile}

Treatment History:
{treatmentSummary}
`;
```

**Step 2 — Patient-facing translation:**
Same 8th-grade reading level principles as Treatment Translator. Magazine-style output with collapsible sections, timeline visualizations, and printable format.

### 3.3 SCP Structure

```typescript
interface SurvivorshipCarePlan {
  generatedDate: string;
  basedOn: {
    diagnosis: string;
    stage: string;
    subtype: string;
    treatmentsReceived: string[];
    completionDate: string;
  };

  // Section 1: "Your road ahead"
  overview: {
    plainLanguageSummary: string;         // "You completed treatment for Stage IIB ER+ breast cancer..."
    whatToExpect: string;                  // "The first year after treatment is a period of adjustment..."
    keyDates: {                           // Visual timeline
      date: string;
      event: string;
      description: string;
    }[];
  };

  // Section 2: "Watching for recurrence"
  surveillance: {
    schedule: SurveillanceEvent[];         // See below
    whatWeWatch: string;                   // Plain-language explanation of surveillance rationale
    whenToCallDoctor: string[];           // Symptoms that warrant immediate contact
    ctdnaGuidance: CtdnaGuidance | null;  // If applicable
  };

  // Section 3: "Your body after treatment"
  lateEffects: {
    byTreatment: {
      treatmentName: string;
      possibleEffects: {
        effect: string;
        likelihood: "common" | "less_common" | "rare";
        typicalOnset: string;             // "Months 3-12 after treatment"
        duration: string;                  // "Usually resolves within 1 year" or "May be permanent"
        management: string;                // What to do about it
        whenToWorry: string;               // When this needs medical attention
      }[];
    }[];
  };

  // Section 4: "What you can do" (lifestyle)
  lifestyle: LifestyleRecommendations;     // See Section 6

  // Section 5: "Your ongoing medications"
  ongoingTherapy: {
    medications: {
      name: string;
      purpose: string;
      duration: string;
      commonSideEffects: string[];
      management: string;
      interactions: string[];             // "Avoid grapefruit" / "Tell your doctor before any new Rx"
      financialAssistance: string[];      // Links to existing financial module matches
    }[];
  };

  // Section 6: "Your care team going forward"
  careTeam: CareTeamPlan;                 // See Section 8

  // Section 7: "Other screenings to stay on top of"
  additionalScreening: {
    screening: string;
    reason: string;                       // "Tamoxifen slightly increases endometrial cancer risk"
    frequency: string;
    startingWhen: string;
  }[];

  // Section 8: "Clinical trials for you"
  relevantTrials: string[];               // IDs from existing trial matcher — adjuvant/maintenance trials

  // Metadata
  disclaimer: string;
  version: string;
  nextReviewDate: string;                 // SCP should be refreshed annually
}
```

### 3.4 Surveillance Schedule Engine

```typescript
interface SurveillanceEvent {
  id: string;
  type: "clinical_exam" | "mammogram" | "breast_mri" | "blood_work" | "ctdna" | "bone_density" | "cardiac" | "other";
  title: string;                          // "Clinical breast exam"
  description: string;                    // Why this matters
  frequency: string;                      // "Every 6 months for years 1-3, then annually"
  nextDue: string;                        // Calculated from treatment completion date
  reminderDays: number;                   // Days before to send reminder
  guidelineSource: string;               // "ASCO 2024", "NCCN v3.2025"

  // Status tracking
  status: "upcoming" | "overdue" | "completed" | "skipped";
  lastCompleted: string | null;
  result: string | null;                  // "Normal" / uploaded result
  notes: string | null;
}

// Generate surveillance schedule based on subtype and treatment
function generateSurveillanceSchedule(
  profile: PatientProfile,
  treatmentSummary: TreatmentSummary,
  completionDate: string
): SurveillanceEvent[] {
  // Rules engine based on ASCO/NCCN guidelines:

  // ALL breast cancer survivors:
  // - Clinical breast exam: q3-6mo years 1-3, q6-12mo years 4-5, then annually
  // - Mammogram: annually (first 6-12mo post-treatment)
  // - NO routine tumor markers (CA 15-3, CA 27.29) — guideline says don't
  // - NO routine CT/PET/bone scans without symptoms

  // IF received anthracyclines (doxorubicin):
  // - Cardiac monitoring: echocardiogram at 1yr, then per cardiology

  // IF on aromatase inhibitor:
  // - Bone density (DEXA): baseline, then q1-2 years

  // IF on tamoxifen:
  // - Gynecologic exam annually (endometrial cancer screening)

  // IF BRCA1/2 positive:
  // - Breast MRI alternating with mammogram (q6 months total)
  // - Consider risk-reducing strategies

  // IF eligible for ctDNA monitoring:
  // - Per ctDNA protocol (see Section 4)

  // IF received radiation:
  // - Thyroid function if neck/chest field
  // - Secondary cancer screening per radiation field
}
```

---

## 4. Recurrence Monitoring Intelligence

### 4.1 ctDNA Monitoring Guide

Circulating tumor DNA (ctDNA) testing is emerging as the most sensitive method for detecting molecular recurrence — often months before clinical or imaging detection. This is one of the highest-value features of the survivorship module because it connects directly to early intervention and vaccine trial eligibility.

```typescript
interface CtdnaGuidance {
  eligible: boolean;
  eligibilityReason: string;             // "Based on your Stage IIB diagnosis and subtype..."

  // Testing options
  tests: {
    name: string;                         // "Signatera (Natera)", "GuardantReveal", etc.
    type: "tumor_informed" | "tumor_naive";
    description: string;                  // Plain language: what it does
    sensitivity: string;                  // "Detects recurrence ~8 months before imaging"
    cost: {
      listPrice: number;
      insuranceCoverage: string;          // "Medicare covers for Stage II-III CRC; breast cancer varies"
      financialAssistance: string | null;
    };
    orderingProcess: string;             // "Your oncologist orders the test"
    sampleType: string;                   // "Blood draw"
    turnaround: string;                  // "7-14 days"
  }[];

  // Recommended schedule
  monitoringSchedule: {
    frequency: string;                    // "Every 3-6 months for years 1-3"
    duration: string;                     // "Recommended for at least 3-5 years"
    guidelineStatus: string;             // "Not yet in standard guidelines but supported by Phase III data"
  };

  // If ctDNA detected
  ifPositive: {
    whatItMeans: string;                  // "A positive result means tumor DNA is detectable..."
    nextSteps: string;                    // "Your oncologist will order confirmatory testing..."
    trialOpportunities: string;          // "This is exactly when adjuvant vaccine trials may be relevant"
    // → Auto-trigger re-run of trial matcher with "molecular relapse" flag
  };

  // If ctDNA not detected
  ifNegative: {
    whatItMeans: string;                  // "A negative result is reassuring but doesn't guarantee..."
    nextTest: string;                     // "Your next test is scheduled for..."
  };
}
```

### 4.2 Symptom Awareness Engine

Not every ache is recurrence. But some symptoms warrant investigation. This engine helps patients distinguish between normal post-treatment recovery and potential warning signs — without either dismissing everything or creating panic.

```typescript
interface SymptomAssessment {
  symptom: string;
  reportedDate: string;
  duration: string;
  severity: 1 | 2 | 3 | 4 | 5;

  // AI-powered contextual assessment
  assessment: {
    urgency: "routine" | "mention_at_next_visit" | "schedule_appointment" | "call_today" | "emergency";
    reasoning: string;                    // "Bone pain in a breast cancer survivor warrants evaluation..."
    context: string;                      // "This could be a side effect of your letrozole, which commonly causes joint/bone pain"
    differentialConsiderations: string[];  // Common vs concerning explanations
    recommendedAction: string;            // Specific next step
    questionsForDoctor: string[];         // If they should call/visit
  };

  // Pattern detection
  patterns: {
    isNewSinceLastReport: boolean;
    isWorsening: boolean;
    correlatesWithMedication: boolean;    // Timing matches known side effects
    multipleRelatedSymptoms: boolean;     // Cluster that could indicate something
  };
}

// CRITICAL: This is NOT diagnostic. Every output includes:
// - "This assessment is for informational purposes only"
// - "When in doubt, contact your oncologist"
// - Clear escalation paths for concerning symptom clusters
// The system errs heavily toward "call your doctor" for ambiguous cases
```

### 4.3 Results Tracking

When patients get surveillance results (mammogram, blood work, ctDNA), they can upload or connect them. The system:
1. Extracts structured data (Claude Vision or FHIR)
2. Compares to previous results (trending)
3. Translates into plain language
4. Flags anything that warrants follow-up
5. Updates the surveillance schedule (mark completed, schedule next)

```typescript
interface SurveillanceResult {
  eventId: string;                        // Links to SurveillanceEvent
  date: string;
  resultSource: "document_upload" | "fhir" | "manual_entry";

  // Extracted data
  extractedResult: {
    overallAssessment: string;            // "Normal" / "Abnormal — needs follow-up"
    details: Record<string, string>;      // Specific values
    comparison: string | null;            // "Compared to prior study from 6 months ago..."
  };

  // Patient-facing interpretation
  interpretation: {
    plainLanguage: string;                // "Your mammogram looks normal. No signs of recurrence."
    whatThisMeans: string;                // "This is reassuring and consistent with expected recovery."
    nextSteps: string;                    // "Your next mammogram is scheduled for September 2027."
    questionsYouMightHave: string[];
  };
}
```

---

## 5. Late Effects Tracker

### 5.1 Treatment-Specific Effect Profiles

The system pre-loads a late effects profile based on exactly which treatments the patient received. This is not a generic list — it's personalized to their regimen.

```typescript
interface LateEffectsProfile {
  // Generated from treatment summary
  treatmentsReceived: {
    name: string;
    category: string;
    knownLateEffects: LateEffect[];
  }[];

  // Active tracking
  activeEffects: TrackedEffect[];         // Effects the patient is currently experiencing
  resolvedEffects: TrackedEffect[];       // Effects that have resolved
  watchList: LateEffect[];               // Effects not yet reported but worth monitoring
}

interface LateEffect {
  name: string;                           // "Peripheral neuropathy"
  description: string;                    // Plain language
  causedBy: string[];                     // ["Paclitaxel (Taxol)"]
  prevalence: string;                     // "Affects 30-40% of patients who received taxanes"
  typicalOnset: string;                   // "During treatment, may persist 6-24 months"
  typicalDuration: string;               // "Improves over 6-12 months for most; permanent in ~10%"
  severity: "mild" | "moderate" | "severe" | "variable";
  management: {
    selfCare: string[];                   // Things patient can do
    medical: string[];                    // When to seek treatment
    medications: string[];                // Commonly prescribed
    specialists: string[];                // Who to see (e.g., "neurologist if severe")
  };
  whenToWorry: string;                    // "If numbness is worsening rather than improving after 6 months"
  evidenceQuality: "strong" | "moderate" | "emerging";
}

interface TrackedEffect {
  effectId: string;
  firstReported: string;
  lastReported: string;
  currentSeverity: number;               // 1-10 scale
  trend: "improving" | "stable" | "worsening";
  managementNotes: string;               // What the patient is doing about it
  history: {
    date: string;
    severity: number;
    notes: string;
  }[];
}
```

### 5.2 Symptom Journal

Lightweight daily/weekly logging — not a burden, but enough data to spot trends.

```typescript
interface JournalEntry {
  date: string;
  // Quick-tap ratings (< 30 seconds to complete)
  energy: 1 | 2 | 3 | 4 | 5;
  pain: 0 | 1 | 2 | 3 | 4 | 5;          // 0 = none
  mood: 1 | 2 | 3 | 4 | 5;
  sleep: 1 | 2 | 3 | 4 | 5;
  hotFlashes: 0 | 1 | 2 | 3;            // If on hormonal therapy
  jointPain: 0 | 1 | 2 | 3;             // Common on aromatase inhibitors

  // Optional detail
  newSymptoms: string[];                  // Free text
  medications: {
    name: string;
    taken: boolean;
    sideEffects: string | null;
  }[];
  exercise: {
    type: string;
    durationMinutes: number;
  } | null;
  notes: string | null;
}

// Weekly AI summary (generated from journal entries)
interface WeeklySummary {
  weekOf: string;
  trends: {
    dimension: string;                    // "Energy", "Pain", etc.
    trend: "improving" | "stable" | "declining";
    averageScore: number;
    comparedToLastWeek: number;           // Delta
    comparedToMonthAgo: number;           // Longer trend
  }[];
  flags: string[];                        // "Joint pain has been increasing over the past 3 weeks"
  suggestions: string[];                  // "Your energy scores are higher on days you exercise"
  encouragement: string;                  // Data-driven positive observation
}
```

### 5.3 UX: Low Friction or It Fails

The journal must be completable in under 60 seconds or patients will stop using it. Design:

```
┌─────────────────────────────────────────────┐
│  How are you today? (March 15)              │
│                                             │
│  Energy    😴 · · ● · 💪                   │
│  Pain      ✨ · ● · · 🔥                   │
│  Mood      😔 · · · ● 😊                   │
│  Sleep     😵 · · ● · 😴                   │
│                                             │
│  Hot flashes today?    None ● 1-2 · 3+ ·   │
│  Joint stiffness?      None · Mild ● Bad ·  │
│                                             │
│  [Done ✓]                                   │
│                                             │
│  ── or add more detail ──                   │
│  + New symptom    + Exercise    + Note      │
└─────────────────────────────────────────────┘
```

Push notification at a consistent time the patient chooses. One tap opens the journal. Five slider taps and done. Optional expansion for detail.

---

## 6. Evidence-Based Lifestyle Engine

### 6.1 Design Philosophy

This is NOT generic wellness advice. Every recommendation is:
1. Grounded in peer-reviewed evidence specific to breast cancer survivorship
2. Quantified where data exists (effect sizes, relative risk reductions)
3. Personalized to their subtype and treatment history
4. Actionable with specific programming, not vague suggestions
5. Honest about what has strong vs. emerging vs. no evidence

```typescript
interface LifestyleRecommendations {
  // Generated from patient profile + treatment history
  personalizedFor: {
    cancerType: string;
    subtype: string;
    receptorStatus: string;
    treatmentsReceived: string[];
    currentMedications: string[];
    age: number;
    bmi: number | null;
  };

  exercise: ExerciseRecommendation;
  nutrition: NutritionRecommendation;
  weight: WeightRecommendation;
  alcohol: AlcoholRecommendation;
  sleep: SleepRecommendation;
  environmentalExposure: EnvironmentalRecommendation;
  supplements: SupplementRecommendation;
}
```

### 6.2 Exercise Programming

The strongest evidence-backed lifestyle intervention. 150+ minutes/week of moderate exercise reduces breast cancer recurrence by 25-40%.

```typescript
interface ExerciseRecommendation {
  evidenceSummary: {
    headline: string;                     // "Exercise reduces breast cancer recurrence by 25-40%"
    effectSize: string;                   // "Multiple large studies (LACE, WHEL, NHS) show..."
    mechanism: string;                    // "Reduces insulin, estrogen, inflammation markers"
    qualityOfEvidence: "strong";
  };

  // Personalized target
  target: {
    minutesPerWeek: number;               // 150-300 min/week
    intensity: string;                    // "Moderate — you should be able to talk but not sing"
    frequencyPerWeek: number;             // 4-5 days
    strengthTrainingDays: number;         // 2-3 days (especially important for bone density on AIs)
  };

  // Considerations based on treatment
  precautions: {
    issue: string;                        // "Lymphedema risk from lymph node removal"
    guidance: string;                     // "Start upper body exercise gradually. Consider compression..."
  }[];

  // Progressive programming
  program: {
    currentLevel: "sedentary" | "light" | "moderate" | "active";
    weeklyPlan: {
      week: number;
      totalMinutes: number;
      sessions: {
        day: string;
        type: "cardio" | "strength" | "flexibility" | "rest";
        duration: number;
        description: string;
        intensity: string;
      }[];
    }[];
    progression: string;                  // How to advance over 8-12 weeks
  };

  // Integration with late effects
  exerciseForSymptoms: {
    symptom: string;                      // "Joint stiffness from aromatase inhibitor"
    exerciseType: string;                 // "Morning stretching + moderate walking"
    evidence: string;                     // "Shown to reduce AI-related arthralgia by 30%"
  }[];
}
```

### 6.3 Nutrition Guidance

```typescript
interface NutritionRecommendation {
  evidenceSummary: {
    headline: string;                     // "Mediterranean-style dietary patterns show consistent association..."
    strongEvidence: string[];             // Specific findings with citations
    limitedEvidence: string[];            // Things that are promising but not proven
    noEvidence: string[];                 // Common claims with no scientific support
  };

  // Personalized based on treatment and medications
  specific: {
    // If on aromatase inhibitor → calcium + vitamin D for bone health
    // If on tamoxifen → avoid grapefruit (CYP2D6 interaction)
    // If experienced weight gain during treatment → caloric guidance
    medication: string;
    nutritionConsiderations: string[];
    foodsToEmphasize: string[];
    foodsToLimit: string[];
    supplementsToDiscuss: string[];       // "Ask your oncologist about vitamin D testing"
  }[];

  // What NOT to do (debunking)
  mythBusting: {
    myth: string;                         // "Sugar feeds cancer"
    reality: string;                      // "No evidence that sugar intake affects recurrence..."
    nuance: string;                       // "However, high sugar diets contribute to obesity, which IS a risk factor"
  }[];
}
```

### 6.4 Environmental Exposure Reduction

Connects to the root cause research on EDCs. Practical, non-alarmist, evidence-based.

```typescript
interface EnvironmentalRecommendation {
  approach: string;                       // "Practical steps to reduce exposure to endocrine-disrupting chemicals"
  tone: string;                           // "Not about fear. About reasonable precautions supported by evidence."

  actionableSteps: {
    category: string;                     // "Food storage", "Personal care", "Water"
    action: string;                       // "Replace plastic food containers with glass or stainless steel"
    why: string;                          // "Plastics can leach BPA/BPS, which mimic estrogen"
    difficulty: "easy" | "moderate" | "involved";
    cost: "free" | "low" | "moderate";
    evidence: "strong" | "moderate" | "precautionary";
    alternatives: string[];               // Specific product swaps
  }[];

  // Water quality
  waterGuidance: {
    checkYourWater: string;               // "Check your local water quality at ewg.org/tapwater"
    pfasRisk: string;                     // Based on zip code if available
    filtrationOptions: string[];          // Evidence-based, not sales pitch
  };

  // What NOT to worry about
  overblownConcerns: {
    claim: string;
    reality: string;
  }[];
}
```

### 6.5 Alcohol Guidance

```typescript
interface AlcoholRecommendation {
  evidenceSummary: {
    headline: string;                     // "Even moderate alcohol increases breast cancer recurrence risk"
    quantified: string;                   // "3-6 drinks/week associated with ~15% increased risk for ER+ subtypes"
    mechanism: string;                    // "Alcohol increases estrogen levels and damages DNA repair"
  };

  personalizedGuidance: string;           // Based on subtype — ER+ is more sensitive to alcohol than TNBC
  recommendation: string;                 // "ASCO recommends limiting to <1 drink/day or eliminating alcohol"
  reductionTips: string[];               // Practical suggestions, not judgment
}
```

---

## 7. Psychosocial Support Layer

### 7.1 Fear of Recurrence Management

The #1 reported psychological burden. Not something we "fix" — something we help manage.

```typescript
interface FearOfRecurrenceSupport {
  // Normalization
  whatToKnow: string;                     // "Fear of recurrence is the most common concern among survivors..."
  whenItsPeaking: string[];               // "Before surveillance appointments", "Anniversaries of diagnosis"

  // Evidence-based coping
  strategies: {
    strategy: string;                     // "Cognitive behavioral techniques"
    description: string;
    evidence: string;
    resources: string[];                  // Apps, workbooks, programs
  }[];

  // Professional support finder
  specialistDirectory: {
    type: string;                         // "Oncology psychologist", "Cancer-specific support group"
    findNearMe: boolean;                  // Geocoded search
    virtualOptions: boolean;
    financialAssistance: string[];        // Many covered by insurance; some nonprofit-provided
  };

  // Before surveillance appointments
  preAppointmentSupport: {
    whatToExpect: string;
    copingStrategies: string[];
    questionsToAsk: string[];
    bringAFriend: string;                 // "Consider bringing someone for support"
  };
}
```

### 7.2 Resource Matching

```typescript
interface PsychosocialResources {
  // Matched to patient profile
  supportGroups: {
    name: string;
    focus: string;                        // "Young women with breast cancer", "Triple-negative survivors"
    format: "in_person" | "virtual" | "both";
    location: string | null;
    website: string;
    cost: string;
  }[];

  counseling: {
    type: string;                         // "Individual therapy", "Couples counseling"
    specialty: string;                    // "Oncology-focused", "CBT for cancer-related anxiety"
    findProvider: string;                 // Link to filtered directory
    insurance: string;                    // Coverage guidance
    financialAssistance: string[];
  }[];

  // Self-directed resources
  apps: { name: string; purpose: string; cost: string; evidence: string }[];
  books: { title: string; author: string; why: string }[];
  podcasts: { name: string; focus: string }[];
}
```

---

## 8. Care Coordination Hub

### 8.1 Care Team Directory

```typescript
interface CareTeam {
  providers: {
    role: string;                         // "Medical oncologist", "Primary care physician", "Physical therapist"
    name: string;
    practice: string;
    phone: string;
    portal: string | null;                // MyChart or other portal link
    nextAppointment: string | null;
    responsibility: string;               // "Cancer surveillance", "General health", "Lymphedema management"
  }[];

  // Clear accountability
  whoToCallFor: {
    concern: string;                      // "New lump or mass"
    contact: string;                      // "Oncologist — call immediately"
    urgency: string;
  }[];
}
```

### 8.2 Appointment Prep Generator

Before each oncology appointment, generate a personalized prep doc:

```typescript
interface AppointmentPrep {
  appointmentDate: string;
  provider: string;
  type: string;                           // "6-month surveillance visit"

  // From journal data
  symptomSummary: string;                 // "Since your last visit, you've reported..."
  trendHighlights: string[];             // "Energy levels have improved", "Joint pain is stable"
  newConcerns: string[];                  // Symptoms flagged for discussion

  // From surveillance schedule
  testsDue: string[];                     // "Mammogram is overdue by 2 weeks"
  resultsPending: string[];               // "Your March ctDNA results should be available"

  // Medication review
  medicationQuestions: string[];          // "You reported difficulty with letrozole side effects"

  // Generated questions
  questionsToAsk: {
    question: string;
    context: string;                      // Why this question matters for them
  }[];

  // Output: printable 1-page PDF
}
```

---

## 9. Recurrence Pathway

### 9.1 Overview

Recurrence is not a new module — it's a state transition that re-activates the entire platform with updated context. Every module already built (trial matching, Treatment Translator, Financial Assistance Finder, sequencing navigator, survivorship monitoring) already knows how to operate on a patient profile. Recurrence changes the profile and triggers a coordinated cascade across all modules simultaneously.

This section defines the recurrence event model, the orchestrated response sequence, and the recurrence-specific adaptations each module makes.

### 9.2 Why Recurrence Is Architecturally Different

The recurring tumor is biologically different from the original. Cancer that returns after treatment is, by definition, treatment-resistant. It may have:
- Acquired resistance mutations to prior therapies (e.g., ESR1 mutations after aromatase inhibitors)
- Lost or gained biomarker expression (ER+ can become ER-, HER2- can gain HER2 amplification)
- New driver mutations enabling immune evasion
- Changed TMB or MSI status
- Metastasized to new anatomic sites with different treatment implications

This means:
- The initial genomic profile may be partially or fully obsolete
- The treatment landscape shifts entirely (second-line and beyond)
- Clinical trials become the best available option more often than at initial diagnosis
- Compassionate use / Right to Try pathways become clearly applicable
- Personalized vaccine approaches (Phase 3) are most compelling here
- NCI-designated cancer center evaluation becomes more strongly recommended

### 9.3 Recurrence Detection Entry Points

Recurrence can enter the platform through multiple paths:

```typescript
interface RecurrenceEvent {
  id: string;
  patientId: string;
  detectedDate: string;
  
  // How recurrence was identified
  detectionMethod: 
    | "ctdna_positive"          // Survivorship module ctDNA monitoring
    | "imaging"                  // Mammogram, CT, PET, MRI
    | "clinical_exam"           // Physical exam finding
    | "symptoms"                // Patient-reported symptoms
    | "pathology"               // Biopsy-confirmed
    | "lab_abnormality";        // Rising tumor markers or other labs
  
  // Clinical details
  recurrenceType: "local" | "regional" | "distant" | "contralateral";
  recurrenceSites: string[];    // "bone", "liver", "lung", "brain", "chest_wall", "lymph_nodes"
  confirmedByBiopsy: boolean;
  newPathologyAvailable: boolean;
  
  // Staging update
  newStage: string | null;      // Often Stage IV at distant recurrence
  newBiomarkers: Record<string, string> | null;  // If re-biopsy shows changed markers
  
  // Context from survivorship module
  timeSinceInitialDiagnosis: number;   // Months
  timeSinceTreatmentCompletion: number; // Months
  ctdnaResultId: string | null;         // If detected via ctDNA monitoring
  priorTreatments: string[];            // What has already been tried
  
  // Source document (if available)
  documentUploadId: string | null;      // Uploaded imaging report, biopsy, etc.
  
  createdAt: string;
}
```

**Platform entry points for triggering a RecurrenceEvent:**

1. **ctDNA positive result** (automatic): The survivorship module's ctDNA tracking detects a positive result → auto-creates a RecurrenceEvent with `detectionMethod: "ctdna_positive"`. This is the earliest possible detection, often months before imaging confirmation.

2. **Patient self-report** (manual): Patient logs concerning symptoms in the journal or explicitly reports "my cancer has come back" → guided flow to create RecurrenceEvent with supporting details.

3. **Document upload** (semi-automatic): Patient uploads a scan report, biopsy result, or oncologist letter confirming recurrence → Claude Vision extraction identifies recurrence language → creates RecurrenceEvent.

4. **MyChart FHIR sync** (automatic if connected): New `Condition` resource with recurrence/metastatic coding, or new `DiagnosticReport` confirming recurrence → auto-creates RecurrenceEvent.

5. **Provider portal** (if built): Oncologist or care team member records recurrence directly.

### 9.4 Orchestrated Response Sequence

When a RecurrenceEvent is created, the platform triggers the following cascade. The order matters — emotional support first, then clinical action, then logistics.

#### Step 1: Acknowledge and Stabilize (immediate)

**This happens within seconds of recurrence being recorded.**

The patient sees a dedicated screen, not a generic notification:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  We're here with you.                           │
│                                                 │
│  Your situation has changed, and we know how     │
│  hard this moment is. We're updating everything  │
│  to reflect where you are now.                   │
│                                                 │
│  Here's what we're doing for you right now:      │
│                                                 │
│  ✓ Finding new clinical trials for your          │
│    updated situation                             │
│  ✓ Updating your treatment information           │
│  ✓ Checking financial assistance options          │
│  ✓ Connecting you to support resources            │
│                                                 │
│  This will be ready within a few minutes.        │
│                                                 │
│  ── Right now ──                                 │
│                                                 │
│  📞 Talk to someone                              │
│     Cancer Support Community: 888-793-9355       │
│     (24/7, free, no appointment needed)          │
│                                                 │
│  💬 Connect with others who've been here         │
│     [Recurrence support resources →]             │
│                                                 │
│  📋 Questions for your oncologist                │
│     [Recurrence appointment prep →]              │
│                                                 │
└─────────────────────────────────────────────────┘
```

Psychosocial resources activate with recurrence-specific content:
- Crisis support hotlines
- Recurrence-specific support groups (different from initial diagnosis groups)
- Peer connections with others who've experienced recurrence
- "What to expect" guide for the recurrence treatment process
- Resources for telling family and friends

**Tone is critical.** Not clinical. Not falsely optimistic. Honest and warm: "This is hard, and we're going to help you navigate it."

#### Step 2: Re-Sequencing Recommendation (within hours)

The sequencing navigator (Phase 2) re-activates with recurrence-specific context:

```typescript
interface ResequencingRecommendation {
  recommended: true;  // Almost always true at recurrence
  urgency: "before_starting_new_treatment";
  reasoning: string;  // "Your cancer may have developed new mutations..."
  
  recommendedTest: {
    // Tissue biopsy + sequencing if accessible recurrence site
    tissue: {
      recommended: boolean;
      testName: string;          // "FoundationOne CDx"
      rationale: string;         // "Gold standard — shows full mutation profile of recurrent tumor"
      feasibility: string;       // "Depends on location of recurrence"
    };
    // Liquid biopsy as supplement or alternative
    liquid: {
      recommended: boolean;
      testName: string;          // "Guardant360 CDx" or "FoundationOne Liquid CDx"
      rationale: string;         // "Non-invasive, can be done immediately, catches shedding mutations"
      limitations: string;       // "May miss some mutations detectable in tissue"
    };
  };
  
  insuranceCoverage: string;     // "Most insurers cover repeat genomic testing at recurrence"
  questionsForOncologist: string[];
}
```

Key message to patient: "Before starting new treatment, getting your recurring tumor sequenced tells us exactly what we're dealing with now — your cancer may have changed since the first time."

#### Step 3: Genomic Comparison (when new results available)

If the patient has both initial sequencing (Phase 2) and new recurrence sequencing:

```typescript
interface GenomicComparison {
  initialProfile: {
    date: string;
    provider: string;
    keyAlterations: GenomicAlteration[];
  };
  recurrenceProfile: {
    date: string;
    provider: string;
    keyAlterations: GenomicAlteration[];
  };
  
  comparison: {
    // Mutations present in both
    persistent: {
      alteration: GenomicAlteration;
      interpretation: string;   // "This driver mutation was present from the start"
    }[];
    
    // New mutations in recurrence (not in original)
    acquired: {
      alteration: GenomicAlteration;
      interpretation: string;   // "This ESR1 mutation likely emerged as resistance to letrozole"
      clinicalImplication: string; // "May benefit from fulvestrant or elacestrant instead"
      trialOpportunities: string; // "3 trials specifically targeting ESR1-mutant breast cancer"
    }[];
    
    // Mutations in original but not in recurrence (lost)
    lost: {
      alteration: GenomicAlteration;
      interpretation: string;   // "No longer detectable — may indicate clonal evolution"
    }[];
    
    // Changed biomarkers
    biomarkerChanges: {
      biomarker: string;        // "ER status"
      original: string;         // "Positive (95%)"
      recurrence: string;       // "Negative"
      implication: string;      // "Treatment strategy changes — hormonal therapy unlikely effective"
    }[];
  };
  
  // Overall clinical interpretation
  summary: {
    keyTakeaway: string;        // "Your tumor acquired an ESR1 resistance mutation and lost ER expression"
    treatmentImplications: string[];
    trialImplications: string[];
    questionsForOncologist: string[];
  };
  
  // Plain language version
  patientExplanation: string;   // Claude-generated, same 8th-grade reading level
}
```

This comparison is generated via Claude with clinical grounding:

```typescript
const GENOMIC_COMPARISON_PROMPT = `
You are comparing the genomic profiles of a breast cancer patient's original
tumor and their recurrent tumor. This comparison is critical for guiding
treatment decisions at recurrence.

Original sequencing ({originalDate}):
{originalAlterations}

Recurrence sequencing ({recurrenceDate}):
{recurrenceAlterations}

Treatment received between these tests:
{treatmentHistory}

For each comparison category (persistent, acquired, lost, changed biomarkers):
1. Identify what changed and what stayed the same
2. Explain WHY the change likely occurred (resistance mechanism? Clonal evolution?)
3. What are the CLINICAL IMPLICATIONS for treatment selection
4. What TRIALS specifically target these changes
5. What questions should the patient ask their oncologist

Generate both a clinical-grade analysis and a patient-facing plain-language explanation.
`;
```

#### Step 4: Trial Re-Matching (automatic, within minutes)

The Phase 1 trial matcher re-runs with updated context:

```typescript
interface RecurrenceTrialMatchContext {
  // Updated patient profile
  currentStage: string;            // Usually Stage IV for distant recurrence
  recurrenceSites: string[];
  priorTreatments: string[];       // CRITICAL — trials filter by prior therapy
  linesOfPriorTherapy: number;
  
  // Updated genomic profile (if re-sequenced)
  currentGenomicProfile: GenomicReportExtraction | null;
  acquiredMutations: string[];     // New targets
  resistanceMutations: string[];   // Drugs to avoid
  
  // Recurrence-specific filters
  trialFilters: {
    acceptsRecurrent: true;
    acceptsPriorTherapy: string[];        // Must accept patients who've had these drugs
    excludesPriorTherapy: string[];       // Exclude trials requiring treatment-naive patients
    targetsSite: string[] | null;         // Trials specific to metastatic site (brain mets, bone mets)
    includesVaccineTrials: true;          // Prioritize personalized vaccine trials
    includesCompassionateUse: true;       // Flag expanded access programs
    includesRightToTry: true;
  };
}
```

**The match results presentation changes at recurrence:**

- Clinical trials are presented as **primary options**, not supplementary — at recurrence, trials are often the best available path
- Compassionate use and Right to Try pathways are surfaced alongside trials
- Personalized vaccine trials get a dedicated section: "Based on your tumor's new mutation profile, these vaccine trials may be able to design a treatment targeting YOUR specific cancer"
- Results are flagged with prior-treatment awareness: "This trial accepts patients who previously received [drugs you had]"

#### Step 5: Treatment Translator Regeneration (automatic)

The Treatment Translator generates a completely new document:

```typescript
interface RecurrenceTreatmentTranslation {
  // Reframed for recurrence context
  context: {
    whatHappened: string;           // "Your breast cancer has returned in [location]"
    whyItCameBack: string;         // Honest but not devastating explanation of resistance
    howThisIsDifferent: string;    // "Treatment for recurrent cancer is different from first-time treatment..."
  };
  
  // Updated treatment landscape
  treatmentOptions: {
    standardOfCare: string;        // What guidelines recommend for this recurrence scenario
    targetedOptions: string[];     // Based on new genomic profile
    immunotherapyEligibility: string; // Based on TMB, MSI, PD-L1
    trialOptions: string;          // Why trials are particularly important now
    compassionateUse: string;      // When/how to pursue
  };
  
  // What's different from first time
  comparedToFirstTime: {
    whatChanged: string[];
    whatsSimilar: string[];
    newConsiderations: string[];   // Palliative care intro, advance directives, etc.
  };
  
  // Second opinion escalation (more aggressive at recurrence)
  secondOpinionGuidance: SecondOpinionEscalation;
  
  // Updated questions for oncologist
  questionsToAsk: {
    question: string;
    whyItMatters: string;
    context: string;               // Recurrence-specific context for each question
  }[];
}
```

#### Step 6: Second Opinion Escalation (heightened at recurrence)

At initial diagnosis, the second opinion trigger is gentle. At recurrence, it's more assertive:

```typescript
interface SecondOpinionEscalation {
  recommendationLevel: "strongly_recommended" | "recommended" | "consider";
  
  // Almost always "strongly_recommended" at recurrence unless already at NCI center
  reasoning: string;
  
  triggers: {
    // Always triggered at recurrence:
    notAtNCICenter: {
      triggered: boolean;
      message: string;            // "For recurrent/metastatic cancer, evaluation at an NCI-designated 
                                  //  comprehensive cancer center can provide access to the newest 
                                  //  treatments and clinical trials. This doesn't mean leaving your 
                                  //  current doctor — many patients get a consultation and continue 
                                  //  treatment locally with guidance from the specialist."
      nearestNCICenters: {
        name: string;
        distance: string;
        specialties: string[];    // "Breast cancer, immunotherapy, clinical trials"
        virtualConsultOption: boolean;
      }[];
    };
    
    // If new genomic profile shows complex mutations
    complexGenomicProfile: {
      triggered: boolean;
      message: string;            // "Your tumor's mutation profile is complex — a molecular tumor board
                                  //  at a specialized center can help determine the optimal treatment sequence"
    };
    
    // If community oncologist hasn't mentioned trials
    noTrialDiscussion: {
      triggered: boolean;
      message: string;            // "Clinical trials are particularly important at recurrence and may 
                                  //  offer access to the newest treatments. If your oncologist hasn't 
                                  //  discussed trial options, consider asking — or seeking a consultation 
                                  //  at a center with an active trial program."
    };
  };
  
  // Practical guidance
  howToSeekSecondOpinion: {
    steps: string[];
    whatToBring: string[];        // "All medical records, imaging, pathology reports, genomic results"
    insurance: string;            // "Most insurance covers second opinions. Some require a referral."
    virtualOptions: string;       // "Many NCI centers offer virtual consultations for recurrence cases"
    talkingToCurrentDoctor: string; // "Your oncologist expects this — it's standard practice"
  };
}
```

#### Step 7: Financial Assistance Re-Match (automatic)

The Financial Assistance Finder re-runs:

```typescript
interface RecurrenceFinancialContext {
  // New treatment drugs → new pharma PAP eligibility
  newMedications: string[];
  
  // Many copay foundations allow re-enrollment for new treatment lines
  reEnrollmentEligible: string[];
  
  // Recurrence-specific programs
  recurrenceSpecificPrograms: FinancialAssistanceProgram[];
  
  // Updated cost projection
  estimatedNewCosts: {
    category: string;
    estimated: string;
    assistanceAvailable: string;
  }[];
  
  // Disability / leave considerations
  employmentSupport: {
    fmlaGuidance: string;         // If they've used FMLA before, what's left
    disabilityOptions: string;     // SSI/SSDI, short-term disability
    legalAid: string;             // Employment rights during cancer treatment
  };
}
```

#### Step 8: Phase 3 Pipeline Activation (if built)

This is the full flywheel:

```typescript
interface RecurrencePipelineActivation {
  // If Phase 3 (neoantigen prediction) is operational:
  pipelineRecommendation: {
    recommended: boolean;
    reasoning: string;             // "Your recurrent tumor can be analyzed for personalized vaccine targets"
    
    dataAvailability: {
      normalSequencing: boolean;   // From Phase 2 (can reuse)
      tumorSequencing: boolean;    // Need NEW sequencing of recurrent tumor
      rnaSequencing: boolean;      // Optional but improves predictions
    };
    
    nextSteps: string[];           // "1. Get recurrent tumor biopsied and sequenced..."
    
    // If pipeline can run:
    estimatedTimeline: string;     // "Neoantigen report in 2-3 weeks after sequencing data uploaded"
    vaccineDesignTimeline: string; // "Draft vaccine blueprint 1 week after neoantigen report"
    
    // Trial matching for vaccine trials specifically
    vaccineTrialMatches: MatchResult[];
    compassionateUseOption: boolean;
  };
}
```

The message to the patient: "Your recurrent tumor has unique mutations that could be targeted by a personalized vaccine. We can analyze your tumor's DNA to design a vaccine blueprint specific to YOUR cancer's current mutations — not the original tumor, but the one you're fighting now."

#### Step 9: Care Team Re-Coordination

```typescript
interface RecurrenceCareTeamUpdate {
  existingTeam: CareTeamMember[];   // From survivorship module
  
  suggestedAdditions: {
    role: string;
    reason: string;
    findNearMe: boolean;
  }[];
  
  // Common additions at recurrence:
  // - Medical oncologist specializing in metastatic disease (if different from initial)
  // - Radiation oncologist (if local recurrence or symptomatic mets)
  // - Palliative care specialist (reframed: "quality of life optimization", NOT end-of-life)
  // - Interventional radiologist (for liver/bone mets treatment options)
  // - Neurosurgeon or radiation oncologist (if brain mets)
  // - Pain management specialist
  // - Genetic counselor (if germline implications from re-sequencing)
  
  palliativeCareReframe: {
    message: string;               // "Palliative care is about living better, not giving up. 
                                   //  Studies show patients with metastatic cancer who receive 
                                   //  palliative care alongside treatment actually live LONGER 
                                   //  and with better quality of life than those who don't."
    evidence: string;              // Temel et al., NEJM 2010
    findSpecialist: boolean;
  };
  
  // Updated "who to call for what"
  updatedContactGuide: {
    concern: string;
    contact: string;
    urgency: string;
  }[];
}
```

#### Step 10: Survivorship Module Reset

The survivorship plan resets to accommodate the new treatment phase:

```typescript
interface SurvivorshipReset {
  // Current survivorship plan → archived
  archivedPlanId: string;
  
  // New phase: "active_recurrence_treatment"
  // Surveillance schedule pauses (patient is back in active treatment)
  // Journal continues but adds recurrence-specific tracking dimensions
  // Late effects tracker adds new treatment's effects
  // Lifestyle recommendations adapt (exercise during treatment vs. after)
  
  journalAdditions: {
    // Track new treatment side effects
    newDimensions: string[];      // Specific to new treatment regimen
  };
  
  // When recurrence treatment completes → new survivorship plan generates
  // covering: post-recurrence surveillance, second-line late effects, etc.
  postRecurrenceSurvivorshipTrigger: string; // "When treatment status changes to complete"
}
```

### 9.5 Recurrence-Specific Routes

```
/recurrence                         Recurrence hub — orchestrated response dashboard
/recurrence/support                 Immediate support resources + crisis contacts
/recurrence/resequencing            Re-sequencing recommendation + navigator
/recurrence/comparison              Genomic comparison (original vs. recurrent)
/recurrence/trials                  Recurrence-specific trial matches + compassionate use
/recurrence/treatment               Updated Treatment Translator for recurrence
/recurrence/second-opinion          NCI center finder + consultation guide
/recurrence/financial               Updated financial assistance matches
/recurrence/care-team               Updated care team + new specialist recommendations
```

These routes are not entirely new pages — several are filtered/contextualized views of existing modules. The trial matches page at `/recurrence/trials` is the same matching engine with recurrence filters applied. The financial page is the same finder with recurrence-specific programs surfaced.

### 9.6 Recurrence Notification Flow

When a RecurrenceEvent is created, the notification system sends a carefully sequenced set of communications:

```typescript
interface RecurrenceNotificationSequence {
  // Immediate (within minutes)
  immediate: {
    inApp: "Recurrence acknowledged — we're updating your information";
    email: null;  // Do NOT email immediately — too jarring. Let them engage in-app first.
  };
  
  // Within 1 hour (only if patient has engaged with the in-app acknowledgment)
  firstHour: {
    inApp: "Your updated trial matches are ready";
    email: "We've updated your information — here's what's available to you now";
    // Email includes: support resources, NOT clinical details (those stay in-app)
  };
  
  // Within 24 hours
  firstDay: {
    inApp: "Your updated Treatment Guide is ready + appointment prep for your oncologist";
    email: null;  // Don't flood inbox
  };
  
  // Within 1 week
  firstWeek: {
    inApp: "Financial assistance options updated for your new treatment";
    email: "Preparing for your next steps — resources and assistance available";
  };
  
  // Ongoing (only if patient is engaging)
  ongoing: {
    resequencingReminder: "If not yet re-sequenced within 2 weeks";
    secondOpinionNudge: "If not at NCI center and hasn't indicated consultation within 3 weeks";
    trialUpdateAlerts: "When new recurrence-relevant trials appear";
  };
}
```

**Critical UX rule:** The platform must NEVER send a notification that announces recurrence to the patient. The patient or their clinical team reports recurrence to us — we don't detect it and announce it. Even ctDNA-positive results should be framed as "your recent test result needs discussion with your oncologist" not "your cancer is back."

### 9.7 Data Model

```sql
-- Recurrence events
CREATE TABLE recurrence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  detected_date DATE NOT NULL,
  detection_method TEXT NOT NULL,       -- ctdna_positive, imaging, clinical_exam, symptoms, pathology, lab_abnormality
  recurrence_type TEXT,                 -- local, regional, distant, contralateral
  recurrence_sites TEXT[],              -- bone, liver, lung, brain, chest_wall, lymph_nodes
  confirmed_by_biopsy BOOLEAN DEFAULT FALSE,
  new_pathology_available BOOLEAN DEFAULT FALSE,
  
  -- Staging update
  new_stage TEXT,
  new_biomarkers JSONB,
  
  -- Context
  months_since_initial_diagnosis INTEGER,
  months_since_treatment_completion INTEGER,
  prior_treatments TEXT[],
  ctdna_result_id UUID REFERENCES ctdna_results(id),
  
  -- Source document
  document_upload_id UUID,
  
  -- Orchestration tracking
  resequencing_recommended BOOLEAN DEFAULT TRUE,
  resequencing_ordered BOOLEAN DEFAULT FALSE,
  trial_rematch_triggered BOOLEAN DEFAULT FALSE,
  trial_rematch_completed_at TIMESTAMPTZ,
  translator_regenerated BOOLEAN DEFAULT FALSE,
  financial_rematch_triggered BOOLEAN DEFAULT FALSE,
  care_team_updated BOOLEAN DEFAULT FALSE,
  survivorship_plan_archived BOOLEAN DEFAULT FALSE,
  second_opinion_recommended BOOLEAN DEFAULT FALSE,
  pipeline_activation_recommended BOOLEAN DEFAULT FALSE,
  
  -- Genomic comparison (when both profiles available)
  genomic_comparison JSONB,            -- GenomicComparison structure
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track which orchestration steps have completed
CREATE TABLE recurrence_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurrence_event_id UUID REFERENCES recurrence_events(id),
  step_name TEXT NOT NULL,              -- acknowledge, resequence, compare, rematch, translate, financial, care_team, etc.
  status TEXT DEFAULT 'pending',        -- pending, in_progress, completed, skipped
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recurrence_patient ON recurrence_events(patient_id, detected_date DESC);
CREATE INDEX idx_recurrence_workflow ON recurrence_workflow_steps(recurrence_event_id, step_name);
```

### 9.8 Build Sequence Additions

The recurrence pathway adds one dedicated Claude Code session to the survivorship build:

```
SESSION S8: Recurrence Pathway
  1. RecurrenceEvent data model + Prisma migration
  2. Recurrence detection entry points (manual report, document upload, ctDNA trigger, FHIR sync)
  3. Orchestration engine — trigger cascade across existing modules
  4. Recurrence acknowledgment + support UI (/recurrence, /recurrence/support)
  5. Re-sequencing recommendation engine with recurrence context
  6. Genomic comparison pipeline (original vs. recurrent profiles)
  7. Trial re-matching with recurrence-specific filters
  8. Treatment Translator regeneration with recurrence context
  9. Second opinion escalation logic (NCI center finder)
  10. Financial Assistance re-matching with recurrence context
  11. Care team update recommendations (palliative care reframe)
  12. Survivorship plan archive + reset
  13. Notification sequence (carefully timed, never diagnostic)
  14. Phase 3 pipeline activation trigger (if Phase 3 built)
  15. End-to-end test: simulate recurrence from ctDNA detection through full cascade
```

---

## 10. Data Model Extensions

```sql
-- Survivorship plan (one per patient, refreshed annually)
CREATE TABLE survivorship_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) UNIQUE,
  treatment_completion_date DATE NOT NULL,
  completion_type TEXT NOT NULL,          -- curative_intent, ongoing_maintenance, palliative
  treatment_summary JSONB NOT NULL,      -- Full treatment history
  plan_content JSONB NOT NULL,           -- Generated SurvivorshipCarePlan
  risk_category TEXT,                    -- low, intermediate, high
  current_phase TEXT DEFAULT 'early',    -- early (yr1-2), mid (yr3-5), late (yr5+)
  last_generated TIMESTAMPTZ NOT NULL,
  next_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Surveillance schedule and tracking
CREATE TABLE surveillance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  plan_id UUID REFERENCES survivorship_plans(id),
  type TEXT NOT NULL,                    -- clinical_exam, mammogram, ctdna, etc.
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT,
  due_date DATE,
  status TEXT DEFAULT 'upcoming',        -- upcoming, overdue, completed, skipped
  completed_date DATE,
  result_summary TEXT,
  result_document_id UUID,              -- Reference to uploaded result document
  next_due_date DATE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symptom journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  entry_date DATE NOT NULL,
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  pain INTEGER CHECK (pain BETWEEN 0 AND 5),
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  hot_flashes INTEGER CHECK (hot_flashes BETWEEN 0 AND 3),
  joint_pain INTEGER CHECK (joint_pain BETWEEN 0 AND 3),
  new_symptoms TEXT[],
  exercise_type TEXT,
  exercise_minutes INTEGER,
  medications_taken JSONB,               -- [{name, taken, sideEffects}]
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, entry_date)
);

-- Late effects tracking
CREATE TABLE tracked_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  effect_name TEXT NOT NULL,
  caused_by TEXT[],                      -- Treatments that caused this
  first_reported DATE NOT NULL,
  current_severity INTEGER CHECK (current_severity BETWEEN 1 AND 10),
  trend TEXT DEFAULT 'stable',           -- improving, stable, worsening
  management_notes TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Late effect severity history (for trend tracking)
CREATE TABLE effect_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  effect_id UUID REFERENCES tracked_effects(id),
  date DATE NOT NULL,
  severity INTEGER CHECK (severity BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ctDNA test results
CREATE TABLE ctdna_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  test_date DATE NOT NULL,
  provider TEXT,                         -- "Natera Signatera", "Guardant Reveal"
  result TEXT NOT NULL,                  -- "not_detected", "detected", "indeterminate"
  ctdna_level FLOAT,                    -- Mean tumor molecules per mL if available
  interpretation JSONB,                  -- Claude-generated plain-language interpretation
  document_upload_id UUID,              -- Uploaded result document
  triggered_trial_rematch BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly AI summaries
CREATE TABLE weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  week_start DATE NOT NULL,
  summary JSONB NOT NULL,                -- WeeklySummary structure
  flags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, week_start)
);

-- Indexes
CREATE INDEX idx_surveillance_patient ON surveillance_events(patient_id, due_date);
CREATE INDEX idx_surveillance_overdue ON surveillance_events(status, due_date) WHERE status = 'upcoming';
CREATE INDEX idx_journal_patient_date ON journal_entries(patient_id, entry_date DESC);
CREATE INDEX idx_effects_patient ON tracked_effects(patient_id, resolved);
CREATE INDEX idx_ctdna_patient ON ctdna_results(patient_id, test_date DESC);
CREATE INDEX idx_summaries_patient ON weekly_summaries(patient_id, week_start DESC);
```

---

## 11. Integration Points with Existing Phases

### 11.1 Phase 1 (MATCH) → Survivorship

- **Trial re-matching on recurrence signal**: When ctDNA is detected or symptoms suggest recurrence, auto-run the trial matcher with updated filters (adjuvant/maintenance trials, recurrence-specific trials)
- **Ongoing trial monitoring**: Continue notifying survivors of relevant new trials (adjuvant vaccine trials, maintenance therapy trials)
- **Financial Assistance Finder**: Extends into survivorship — hormonal therapy copays for 5-10 years, physical therapy for lymphedema, mental health counseling

### 11.2 Phase 2 (SEQUENCE) → Survivorship

- **ctDNA monitoring pathway**: Phase 2's sequencing navigation directly feeds survivorship monitoring. If the patient already has tumor sequencing from Phase 2, tumor-informed ctDNA tests (like Signatera) can be ordered without re-sequencing.
- **Insurance navigation**: Extends to cover survivorship care costs — many patients don't know ctDNA monitoring or lymphedema therapy is covered.

### 11.3 Phase 3 (PREDICT) → Survivorship

- **The critical flywheel**: Patient completes treatment → enters survivorship module → ctDNA monitoring detects molecular relapse → neoantigen prediction pipeline runs on original sequencing data → vaccine blueprint generated → patient matched to vaccine trial or compassionate use pathway
- This is the complete closed loop from diagnosis to long-term survival

### 11.4 Treatment Translator → Survivorship

- The Treatment Translator naturally extends to the SCP. Same Claude pipeline architecture, same plain-language principles, applied to the post-treatment phase.
- The "side effect timeline" from the Translator becomes the "late effects profile" in survivorship.

### 11.5 Document Ingestion → Survivorship

- Same upload flow for surveillance results (mammograms, blood work, ctDNA reports)
- Claude Vision extraction of follow-up test results
- MyChart FHIR sync continues pulling new data automatically

### 11.6 Recurrence Pathway → All Phases

The recurrence pathway (Section 9) is the most cross-cutting integration in the platform:
- **Phase 1 (MATCH)**: Trial re-matching with recurrence-specific filters, compassionate use, Right to Try pathways
- **Phase 2 (SEQUENCE)**: Re-sequencing recommendation, genomic comparison (original vs. recurrent tumor)
- **Phase 3 (PREDICT)**: Neoantigen pipeline activation on recurrent tumor — personalized vaccine design targeting evolved mutations
- **Phase 4 (MANUFACTURE)**: If vaccine blueprint generated, connect to manufacturing pathway
- **Treatment Translator**: Complete regeneration for recurrence treatment landscape
- **Financial Assistance Finder**: Re-matching for new treatment line, recurrence-specific programs
- **Survivorship Module**: Plan archive, journal adaptation, care team update, surveillance reset

---

## 12. Build Sequence

### 12.1 Prerequisites

- Phase 1 stable with real users
- Patient profiles with treatment history data
- Treatment Translator functional
- Document ingestion and MyChart working

### 12.2 Claude Code Sessions

```
SESSION S1: Survivorship foundation
  1. Prisma schema additions (all tables from Section 10)
  2. Treatment completion detection + transition flow
  3. Survivorship care plan generation pipeline (grounding + translation)
  4. SCP reading experience UI (/survive/plan)
  5. Route stubs for all survivorship pages

SESSION S2: Surveillance engine
  1. Surveillance schedule generator (guideline rules engine)
  2. Surveillance event tracking + status management
  3. Appointment reminders (email + push notification)
  4. Overdue alert system
  5. Surveillance dashboard UI (/survive/monitoring)
  6. Result upload + interpretation (reuse doc ingestion for surveillance reports)

SESSION S3: Symptom journal + late effects tracker
  1. Journal entry UI (60-second mobile-first design)
  2. Push notification + daily reminder system
  3. Weekly AI summary generator
  4. Late effects profile generation from treatment history
  5. Effect severity tracking + trend visualization
  6. Symptom assessment engine (contextual urgency evaluation)
  7. Journal dashboard with trend charts (/survive/journal, /survive/effects)

SESSION S4: Lifestyle engine
  1. Exercise recommendation generator (personalized to treatment + late effects)
  2. Progressive exercise programming (week-by-week plans)
  3. Nutrition guidance generator (medication-aware)
  4. Alcohol guidance (subtype-specific risk quantification)
  5. Environmental exposure guide (practical, evidence-based)
  6. Supplement/myth-busting section
  7. Lifestyle dashboard UI (/survive/lifestyle)

SESSION S5: Psychosocial + care coordination
  1. Fear of recurrence resource library
  2. Psychosocial resource matching (support groups, counseling)
  3. Care team directory + "who to call for what"
  4. Appointment prep generator
  5. Pre-appointment notification with prep doc
  6. Care coordination UI (/survive/mental-health, /survive/care-team)

SESSION S6: ctDNA monitoring + recurrence loop
  1. ctDNA testing guide and provider directory
  2. ctDNA result tracking + interpretation
  3. Positive ctDNA → trial re-matching trigger
  4. Integration with Phase 3 pipeline (if built)
  5. ctDNA dashboard UI (/survive/monitoring/ctdna)

SESSION S7: Notifications + polish
  1. Full notification cadence system (phase-appropriate frequency)
  2. Annual SCP refresh pipeline
  3. Survivorship phase transitions (early → mid → late)
  4. End-to-end testing
  5. User feedback integration points

SESSION S8: Recurrence Pathway (Section 9)
  1. RecurrenceEvent data model + Prisma migration
  2. Recurrence detection entry points:
     - Manual patient report flow
     - Document upload trigger (Claude Vision detects recurrence language)
     - ctDNA positive auto-trigger (from Session S6)
     - MyChart FHIR sync trigger (new Condition resource with recurrence coding)
  3. Orchestration engine — RecurrenceEvent triggers cascade across all modules
  4. Recurrence acknowledgment + immediate support UI (/recurrence, /recurrence/support)
     - Crisis support resources, recurrence-specific peer connections
     - Carefully worded — warm and honest, not clinical
  5. Re-sequencing recommendation engine with recurrence context
     - Tissue re-biopsy + liquid biopsy recommendations
     - Insurance coverage for repeat genomic testing
  6. Genomic comparison pipeline (original vs. recurrent tumor profiles)
     - Claude-powered comparison analysis
     - Resistance mutation identification
     - Biomarker change detection
     - Patient-facing plain-language explanation
  7. Trial re-matching with recurrence-specific filters
     - Filter for trials accepting recurrent/progressive disease
     - Prior-treatment awareness (exclude drugs already tried)
     - Prioritize personalized vaccine trials
     - Surface compassionate use + Right to Try pathways
  8. Treatment Translator regeneration for recurrence context
     - Completely new document, not an update
     - Second-line treatment landscape
     - Honest but supportive prognosis framing
  9. Second opinion escalation (heightened at recurrence)
     - NCI-designated cancer center finder with distance
     - Virtual consultation options
     - "How to seek a second opinion" practical guide
     - Palliative care reframe ("living better, not giving up")
  10. Financial Assistance re-matching
      - New drug PAP eligibility
      - Copay foundation re-enrollment
      - Employment/disability guidance (FMLA, SSI/SSDI)
  11. Care team update recommendations
      - Suggest new specialists based on recurrence type/site
      - Updated "who to call for what"
  12. Survivorship plan archive + reset
      - Archive current plan
      - Journal adapts with new tracking dimensions
      - Surveillance pauses during active treatment
  13. Phase 3 pipeline activation trigger (if Phase 3 built)
      - Recommend re-sequencing → pipeline input
      - Generate new neoantigen report from recurrent tumor
  14. Recurrence notification sequence
      - Carefully timed (support first, clinical details second)
      - NEVER announces recurrence — only responds to patient/doctor report
  15. End-to-end test: full recurrence cascade from detection through all modules
```

### 12.3 Timeline Estimate

```
Sessions S1-S2:  Weeks 1-3   (core plan + surveillance — usable MVP)
Sessions S3-S4:  Weeks 3-6   (journal + lifestyle — daily engagement)
Sessions S5-S6:  Weeks 6-9   (psychosocial + ctDNA — full depth)
Session S7:      Weeks 9-10  (polish + notifications)
Session S8:      Weeks 10-12 (recurrence pathway — full cascade)

Total: ~12 weeks from start, assuming Phase 1 is stable
```

---

## Appendix A: Evidence References for Lifestyle Recommendations

Key studies to ground the lifestyle engine:

**Exercise and recurrence:**
- LACE study (After Breast Cancer Pooling Project): 150+ min/week moderate exercise → 27% reduced recurrence
- NHS (Nurses' Health Study): Walking 3-5 hrs/week → 50% reduced mortality
- HEAL study: Exercise reduces insulin, estrogen, and inflammatory biomarkers

**Weight and recurrence:**
- Multiple meta-analyses: Obesity at diagnosis → 35-40% increased mortality
- Post-treatment weight gain of >5kg → increased recurrence, especially ER+

**Alcohol and breast cancer:**
- Million Women Study: Each additional drink/day → 12% increased risk
- ASCO statement (2017): Even light drinking increases breast cancer risk
- Mechanism: alcohol increases estrogen, acetaldehyde damages DNA

**Diet:**
- PREDIMED trial: Mediterranean diet → reduced breast cancer incidence
- WHEL study: High vegetable/low fat diet → no significant recurrence reduction (debunks a common claim)
- Evidence strongest for anti-inflammatory dietary patterns, not specific foods

**Environmental exposures:**
- Lancet 2020 EDC review: Comprehensive evidence summary
- PFAS → breast cancer association in multiple cohort studies
- BPA/phthalates → estrogen receptor activation, endometriosis, PCOS

## Appendix B: Regulatory Note

The survivorship module provides information and decision support — it does not diagnose, prescribe, or replace medical care. All clinical content includes disclaimers and directs patients to their care team for medical decisions.

The symptom assessment engine specifically avoids diagnostic language:
- "This warrants discussion with your oncologist" (NOT "this may be recurrence")
- "Schedule an appointment to discuss" (NOT "you need imaging")
- Always provides the "call your doctor" pathway prominently

Legal review recommended before launch, particularly for:
- Symptom assessment engine (medical device classification risk)
- ctDNA result interpretation (could be considered diagnostic decision support)
- Exercise programming (liability for injury)
