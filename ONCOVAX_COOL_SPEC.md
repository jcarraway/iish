# Cold Capping Access Service — Technical Specification v1.0

## Scalp Cooling Coordination & Optimization Layer (COOL)

**Author:** Rett (Happy Medium)
**Date:** March 2026
**Depends on:** CARE module (kit fulfillment), Phase 1 (patient profiles, treatment plans, insurance data), Financial Assistance Finder
**Business model:** Service + curated product layer. Manufacture nothing. Coordinate everything.
**Purpose:** An end-to-end cold capping coordination service that matches patients to the right scalp cooling system, optimizes their preparation protocol for their specific hair type, handles insurance navigation with the new 2026 CPT codes, delivers curated prep kits, provides fitting guidance, and tracks outcomes — all triggered automatically when the platform detects an alopecia-inducing chemotherapy regimen in the patient's treatment plan.

---

## Table of Contents

1. [Strategic Position](#1-strategic-position)
2. [Service Architecture](#2-service-architecture)
3. [System Matching Engine](#3-system-matching-engine)
4. [Hair-Type-Specific Prep Protocols](#4-hair-type-specific-prep-protocols)
5. [Insurance Navigation](#5-insurance-navigation)
6. [Curated Product Kits](#6-curated-product-kits)
7. [Fitting Intelligence](#7-fitting-intelligence)
8. [Outcome Tracking](#8-outcome-tracking)
9. [3D Scanning Infrastructure (Future)](#9-3d-scanning-infrastructure-future)
10. [Topical Adjunct Product (Future)](#10-topical-adjunct-product-future)
11. [Partnership Strategy](#11-partnership-strategy)
12. [Data Model](#12-data-model)
13. [Build Sequence](#13-build-sequence)

---

## 1. Strategic Position

### 1.1 The Coordination Gap

Cold capping today is a patient-assembled jigsaw puzzle:

| Piece | Current state | Who provides it |
|-------|--------------|-----------------|
| Which system to use | Patient Googles, asks Facebook group | Nobody — patient figures it out |
| Is it available at my infusion center | Call the center and ask | Infusion center (if they know) |
| Does my insurance cover it | Call insurer, navigate new CPT codes | Nobody — patient and billing dept guess |
| How do I prepare my specific hair type | Buried in Paxman PDF, UCSF web page | Fragmented — no unified guidance |
| What products do I need | Random Amazon purchases | Nobody curates this |
| How should the cap fit | Varies by nurse experience | Infusion center nurse (quality varies wildly) |
| What should I expect during treatment | Word of mouth, forums | Patient community (unstructured) |
| Did it work? What can I improve? | No systematic tracking | Nobody tracks outcomes |

The platform fills every cell in that table. Not by manufacturing caps — by orchestrating the entire experience.

### 1.2 Why Service Layer Wins

**Paxman, DigniCap, and Cooler Heads are device companies.** They build hardware and sell/lease it to infusion centers. They are incentivized to promote their own system over competitors. They are not incentivized to help patients navigate insurance, optimize for their hair type, or track outcomes across systems. They don't know what chemo regimen the patient is on, what their insurance covers, or when their first infusion is.

**The platform knows all of that.** The treatment plan tells us the regimen (which determines expected hair loss severity and cold capping success rate). The insurance data tells us coverage. The location tells us which infusion centers are nearby and what systems they have. The patient profile tells us hair type. The treatment start date tells us the deadline. The Financial Assistance Finder tells us which programs can help if insurance doesn't cover it.

The platform becomes the patient's cold capping concierge — system-agnostic, hair-type-aware, insurance-optimized, and timed to the treatment calendar.

### 1.3 Revenue Model

This service operates at cost or low margin, consistent with the platform's mission. Revenue comes from:

- **Curated prep kits:** Assembled from existing products, sold through CARE module at cost + fulfillment
- **Referral partnerships:** Commission from cold cap rental companies when patients book through the platform (Penguin, Arctic charge $150-500/month — standard affiliate commission 10-15%)
- **Data licensing (future):** Anonymized outcome data across systems, hair types, and regimens is extremely valuable to device manufacturers and researchers. This is the long-term data asset.
- **3D scanning service (future):** When custom caps reach market, scanning fees

Primary value is user acquisition and retention, not direct revenue. A patient who gets cold capping help from the platform is a patient who stays on the platform through their entire treatment journey and beyond.

---

## 2. Service Architecture

### 2.1 Trigger: Alopecia-Risk Detection

The service activates automatically when the platform detects a treatment plan with significant alopecia risk:

```typescript
interface AlopeciaRiskAssessment {
  patientId: string;
  regimen: string;
  alopeciaRisk: "high" | "moderate" | "low" | "minimal";
  expectedOnset: string;                 // "Day 14-21 after first infusion"
  coldCappingEfficacy: string;           // "50-70% hair preservation" for this regimen
  timeToFirstInfusion: number | null;    // Days — the decision window
  windowStatus: "open" | "closing" | "closed";
}

const ALOPECIA_BY_REGIMEN: Record<string, AlopeciaRiskProfile> = {
  "AC-T": {
    risk: "high",
    expectedRate: "95% without intervention",
    coldCappingEfficacy: "50-65% hair preservation",
    onset: "Day 14-21 of cycle 1",
    notes: "Anthracycline phase (AC) most damaging. Taxol phase less so.",
  },
  "dose-dense AC-T": {
    risk: "high",
    expectedRate: "95%",
    coldCappingEfficacy: "45-60%",
    onset: "Day 14-21",
    notes: "Slightly lower cold capping success than standard AC-T due to dose intensity",
  },
  "TC": {
    risk: "high",
    expectedRate: "60-80%",
    coldCappingEfficacy: "55-70%",
    onset: "Day 14-21",
    notes: "Better cold capping outcomes than AC-T (no anthracycline)",
  },
  "TCHP": {
    risk: "high",
    expectedRate: "60-80%",
    coldCappingEfficacy: "55-70%",
    onset: "Day 14-21",
    notes: "Similar to TC. Herceptin/Perjeta don't cause additional hair loss.",
  },
  "carboplatin-taxol": {
    risk: "high",
    expectedRate: "70-90% (weekly taxol)",
    coldCappingEfficacy: "60-75%",
    onset: "Gradual over weeks 2-6",
    notes: "Weekly taxol has better cold capping outcomes than dose-dense. Best results among high-risk regimens.",
  },
  "CMF": {
    risk: "moderate",
    expectedRate: "50-60%",
    coldCappingEfficacy: "65-80%",
    onset: "Gradual, less dramatic than AC-T",
    notes: "Lower alopecia rate and better cold capping response.",
  },
  "pembrolizumab_chemo": {
    risk: "high",
    expectedRate: "Depends on chemo backbone",
    coldCappingEfficacy: "Varies by backbone regimen",
    onset: "Follows chemo backbone pattern",
    notes: "Pembrolizumab itself doesn't cause hair loss. Risk depends on the chemotherapy it's combined with.",
  },
  "tamoxifen": { risk: "minimal", expectedRate: "<5% (thinning only)", coldCappingEfficacy: "Not indicated", onset: "N/A", notes: "Mild thinning possible, not alopecia" },
  "anastrozole": { risk: "minimal", expectedRate: "<10% (thinning)", coldCappingEfficacy: "Not indicated", onset: "N/A", notes: "Thinning, not loss" },
  "letrozole": { risk: "minimal", expectedRate: "<10%", coldCappingEfficacy: "Not indicated", onset: "N/A", notes: "Thinning" },
  "trastuzumab": { risk: "minimal", expectedRate: "<5%", coldCappingEfficacy: "Not indicated", onset: "N/A", notes: "Targeted therapy — minimal hair impact" },
};
```

### 2.2 Service Flow

```
Patient profile created with treatment plan
       │
       ▼
Alopecia risk assessment (automatic)
       │
       ├── Risk: minimal/low → Inform only (LEARN article link)
       │
       ├── Risk: moderate/high → Activate cold capping service
       │         │
       │         ▼
       │   TIME-SENSITIVE ALERT
       │   "Cold capping must start at infusion #1"
       │   "You have {X} days to decide and prepare"
       │         │
       │         ▼
       │   ┌─────────────────────────────────────┐
       │   │ Step 1: System matching              │
       │   │ Which system is right for you?       │
       │   │ What's available at your center?     │
       │   ├─────────────────────────────────────┤
       │   │ Step 2: Insurance navigation         │
       │   │ Check coverage with new CPT codes    │
       │   │ State mandate check                  │
       │   │ Financial assistance if needed       │
       │   ├─────────────────────────────────────┤
       │   │ Step 3: Hair-type-specific prep      │
       │   │ Protocol for YOUR hair type          │
       │   │ Product recommendations              │
       │   │ Curated prep kit delivery            │
       │   ├─────────────────────────────────────┤
       │   │ Step 4: Fitting guidance             │
       │   │ Pre-appointment fitting video        │
       │   │ What to tell your nurse              │
       │   │ Checklist for infusion day           │
       │   ├─────────────────────────────────────┤
       │   │ Step 5: Ongoing support              │
       │   │ Cycle-by-cycle expectations          │
       │   │ When to worry vs. normal shedding    │
       │   │ Hair care between infusions          │
       │   ├─────────────────────────────────────┤
       │   │ Step 6: Outcome tracking             │
       │   │ Photo-based progress (opt-in)        │
       │   │ What worked, what to adjust          │
       │   │ Community data contribution          │
       │   └─────────────────────────────────────┘
       │
       └── Risk: not assessed → Prompt to add treatment plan
```

---

## 3. System Matching Engine

Match patients to the right scalp cooling option based on their infusion center, insurance, regimen, and preferences.

```typescript
interface ScalpCoolingSystem {
  id: string;
  name: string;
  manufacturer: string;
  type: "automated_refrigerated" | "manual_frozen";
  fdaCleared: boolean;
  
  // Coverage
  coveredByMedicareCPT: boolean;         // Automated only — manual excluded
  coveredByStateMandates: string[];      // States with coverage mandates
  
  // Logistics
  requiresInfusionCenterInstallation: boolean;
  portable: boolean;
  rentalAvailable: boolean;
  rentalCostPerMonth: number | null;
  
  // Efficacy
  averageHairPreservation: string;       // "50-70% depending on regimen"
  
  // Post-infusion
  postCoolingDuration: string;           // "90 min for taxanes, up to 3 hours for anthracyclines"
  portablePostCooling: boolean;          // Can patient leave chair during post-cooling?
  
  // Contact
  patientHotline: string | null;
  website: string;
  rentalUrl: string | null;
}

const COOLING_SYSTEMS: ScalpCoolingSystem[] = [
  {
    id: "paxman",
    name: "Paxman Scalp Cooling System",
    manufacturer: "Paxman",
    type: "automated_refrigerated",
    fdaCleared: true,
    coveredByMedicareCPT: true,
    coveredByStateMandates: ["NY", "LA"],
    requiresInfusionCenterInstallation: true,
    portable: false,
    rentalAvailable: false,
    rentalCostPerMonth: null,
    averageHairPreservation: "Up to 70% for some regimens",
    postCoolingDuration: "90 min (taxanes) to 3 hours (anthracyclines)",
    portablePostCooling: false,
    patientHotline: null,
    website: "https://paxmanscalpcooling.com",
    rentalUrl: null,
  },
  {
    id: "dignicap_delta",
    name: "DigniCap Delta",
    manufacturer: "Dignitana (merged with Paxman)",
    type: "automated_refrigerated",
    fdaCleared: true,
    coveredByMedicareCPT: true,
    coveredByStateMandates: ["NY", "LA"],
    requiresInfusionCenterInstallation: true,
    portable: false,
    rentalAvailable: false,
    rentalCostPerMonth: null,
    averageHairPreservation: "Up to 66% (pivotal trial)",
    postCoolingDuration: "90 min to 3 hours",
    portablePostCooling: false,
    patientHotline: null,
    website: "https://dignicap.com",
    rentalUrl: null,
  },
  {
    id: "amma",
    name: "Amma Portable Scalp Cooling",
    manufacturer: "Cooler Heads",
    type: "automated_refrigerated",
    fdaCleared: true,
    coveredByMedicareCPT: true,
    coveredByStateMandates: ["NY", "LA"],
    requiresInfusionCenterInstallation: true,
    portable: true,
    rentalAvailable: false,
    rentalCostPerMonth: null,
    averageHairPreservation: "Limits hair loss to approximately 50%",
    postCoolingDuration: "Same protocols, but portable during post-cooling",
    portablePostCooling: true,
    patientHotline: null,
    website: "https://coolerheads.com",
    rentalUrl: null,
  },
  {
    id: "penguin",
    name: "Penguin Cold Caps",
    manufacturer: "Penguin Cold Caps",
    type: "manual_frozen",
    fdaCleared: false,
    coveredByMedicareCPT: false,
    coveredByStateMandates: ["NY", "LA"],
    requiresInfusionCenterInstallation: false,
    portable: true,
    rentalAvailable: true,
    rentalCostPerMonth: 250,
    averageHairPreservation: "61% in published study",
    postCoolingDuration: "Caps swapped every 25-30 min",
    portablePostCooling: true,
    patientHotline: "1-877-726-4673",
    website: "https://penguincoldcaps.com",
    rentalUrl: "https://penguincoldcaps.com/rent-cold-caps/",
  },
  {
    id: "arctic",
    name: "Arctic Cold Caps",
    manufacturer: "Arctic Cold Caps",
    type: "manual_frozen",
    fdaCleared: false,
    coveredByMedicareCPT: false,
    coveredByStateMandates: ["NY", "LA"],
    requiresInfusionCenterInstallation: false,
    portable: true,
    rentalAvailable: true,
    rentalCostPerMonth: 200,
    averageHairPreservation: "Varies by regimen",
    postCoolingDuration: "Caps swapped every 25-30 min",
    portablePostCooling: true,
    patientHotline: null,
    website: "https://arcticcoldcaps.com",
    rentalUrl: "https://arcticcoldcaps.com/order/",
  },
];
```

### 3.1 Matching Logic

```typescript
function matchCoolingSystem(
  patient: PatientProfile,
  infusionCenter: InfusionCenterProfile,
): CoolingSystemRecommendation[] {
  const recommendations: CoolingSystemRecommendation[] = [];
  
  // 1. What does the infusion center have?
  const centerSystems = infusionCenter.availableCoolingSystems;
  
  // 2. Insurance check
  const insuranceCoverage = checkCoolingCoverage(patient.insurance, patient.state);
  
  // 3. If center has automated system AND insurance covers it → recommend that first
  // 4. If center has no system → recommend manual rental (Penguin/Arctic)
  // 5. If center has system but insurance doesn't cover → check financial assistance
  // 6. If patient needs portability (long post-cooling, wants to leave chair) → recommend Amma if available
  // 7. If no automated options available → manual caps with helper guidance
  
  // Each recommendation includes:
  // - System name and type
  // - Estimated cost (out of pocket after insurance)
  // - Setup steps (how to arrange)
  // - Pros and cons for their specific situation
  // - Financial assistance options if cost is a barrier
  
  return recommendations;
}
```

---

## 4. Hair-Type-Specific Prep Protocols

The biggest immediate value-add. Nobody has consolidated this guidance into a clear, actionable system.

```typescript
type HairType = "1" | "2" | "3a" | "3b" | "3c" | "4a" | "4b" | "4c";

interface HairPrepProtocol {
  hairType: HairType;
  description: string;
  
  // Before first infusion (days ahead)
  advancePrep: {
    timeline: string;
    steps: string[];
  };
  
  // Day of infusion
  dayOfPrep: {
    steps: string[];
    productsNeeded: string[];           // Specific product IDs from prep kit
    timeRequired: string;               // "30 minutes before arrival"
  };
  
  // During cooling
  duringCooling: {
    tips: string[];
    troubleshooting: string[];
  };
  
  // Between infusions
  betweenInfusions: {
    hairCareRoutine: string[];
    productsForMaintenance: string[];
    whatToAvoid: string[];
  };
  
  // Specific considerations
  specialConsiderations: string[];
}

const HAIR_PREP_PROTOCOLS: Record<string, HairPrepProtocol> = {
  "type_1_2": {
    hairType: "1",
    description: "Straight to wavy hair (Type 1-2)",
    advancePrep: {
      timeline: "No advance prep required beyond standard hair care",
      steps: [
        "Trim split ends and remove damaged hair (makes hair more manageable)",
        "No special cut required — do not cut hair short unless you want to",
        "Avoid coloring or chemical treatments in the 2 weeks before first infusion",
      ],
    },
    dayOfPrep: {
      steps: [
        "Wash hair with gentle, sulfate-free shampoo — clean hair cools more evenly",
        "Do not use any styling products (gel, mousse, hairspray)",
        "Dampen hair with spray bottle — just enough to slick it back",
        "Apply a thin layer of conditioner over the hair surface (helps cap slide on and prevents sticking)",
        "For thick hair: create a center parting to eliminate dense sections that could insulate against the cap",
        "Hair length will hang below the cap — this is normal, only the roots need to be cooled",
      ],
      productsNeeded: ["gentle_shampoo", "silicone_free_conditioner", "spray_bottle"],
      timeRequired: "15-20 minutes before cap fitting",
    },
    duringCooling: {
      tips: [
        "The cap will feel intensely cold for the first 10-15 minutes — this is normal and subsides",
        "Take OTC pain relief (Tylenol/Advil) 30 minutes before the cap goes on",
        "Use the provided headband to protect your forehead from direct cap contact",
      ],
      troubleshooting: [
        "If you feel a warm spot, it may be an air pocket — mention it to your nurse",
        "If the chin strap feels too tight, ask the nurse to adjust — snug but not painful",
      ],
    },
    betweenInfusions: {
      hairCareRoutine: [
        "Wash hair no more than 2-3 times per week",
        "Use lukewarm water only — no hot water",
        "Gentle, sulfate-free shampoo and conditioner",
        "Pat dry with soft towel — do not rub",
        "Air dry only — no blow dryer, curling iron, or flat iron",
        "Use a wide-tooth comb or soft-bristle brush — start from ends, work up gently",
      ],
      productsForMaintenance: ["gentle_shampoo", "silicone_free_conditioner", "wide_tooth_comb", "silk_pillowcase"],
      whatToAvoid: [
        "Heat styling tools (blow dryer, flat iron, curling iron)",
        "Hair coloring or chemical treatments during treatment",
        "Tight hairstyles that pull on roots (ponytails, braids, clips)",
        "Rubbing or vigorous toweling",
        "Scratching the scalp (even if itchy)",
      ],
    },
    specialConsiderations: [
      "Thick hair may need extended pre-cooling time (ask nurse about 15-minute extension option on Paxman)",
      "Very fine hair may cool faster — report any numbness beyond the scalp to your nurse",
    ],
  },

  "type_3": {
    hairType: "3a",
    description: "Curly hair (Type 3a-3c)",
    advancePrep: {
      timeline: "Start preparing 3-5 days before first infusion",
      steps: [
        "Deep condition hair 2-3 days before treatment — well-moisturized hair is more manageable",
        "Do NOT straighten hair with heat unless you regularly do so (heat adds damage)",
        "If you want to straighten for better cap contact, do so 1-2 days before (not day-of)",
        "Remove any extensions, weaves, or clip-ins",
        "Avoid coloring or chemical treatments for 2+ weeks before first infusion",
        "Practice a few hairstyle options that keep hair flat and close to the scalp",
      ],
    },
    dayOfPrep: {
      steps: [
        "Wash hair thoroughly with hydrating shampoo (not the standard one that comes with some systems)",
        "Condition generously with a silicone-free moisturizing conditioner",
        "Thoroughly wet hair — much more water than you'd use for straight hair",
        "Your hair needs to be wet enough to reduce volume and allow the cap to sit against your scalp",
        "A spray bottle alone may not be sufficient — run hair under a tap or shower if needed",
        "Apply conditioner over the hair surface to help the cap slide on",
        "Section hair into flat sections, smoothing each against the scalp",
        "Small twists or flat braids (without extensions) are fine — keep them thin and close to the scalp",
        "Do not use gel or products that add volume or texture",
      ],
      productsNeeded: ["hydrating_shampoo_curly", "moisturizing_conditioner_curly", "water_access", "wide_tooth_comb", "hair_clips_for_sectioning"],
      timeRequired: "25-35 minutes before cap fitting — allow extra time",
    },
    duringCooling: {
      tips: [
        "If curly hair starts to dry and expand under the cap, this can create air pockets",
        "Ask your nurse if the cap can be briefly adjusted mid-session if you feel warm spots developing",
        "The outer cover should be pulled snug — don't hesitate to ask for it to be tightened",
      ],
      troubleshooting: [
        "Warm spots on the sides or back of the head are most common with curly hair — these are the areas where volume tends to lift the cap",
        "If you notice consistent warm spots, mention to your nurse for next session adjustments",
      ],
    },
    betweenInfusions: {
      hairCareRoutine: [
        "Wash once a week maximum — co-wash (conditioner only) between washes",
        "Use a moisturizing, sulfate-free shampoo designed for curly hair",
        "Deep condition weekly",
        "Finger-comb only — no brushes, no fine-tooth combs",
        "Apply oil (argan, jojoba, or coconut) to scalp and ends for moisture",
        "Sleep on a silk or satin pillowcase",
        "Wear hair in loose protective styles (twists, braids without tension) between infusions",
      ],
      productsForMaintenance: ["hydrating_shampoo_curly", "deep_conditioner_curly", "hair_oil_natural", "silk_pillowcase", "satin_bonnet"],
      whatToAvoid: [
        "Heat styling tools — no blow dryer, flat iron, or curling iron",
        "Chemical relaxers or treatments during chemo",
        "Tight hairstyles or styles that create tension on the hairline",
        "Extensions, weaves, or wigs with adhesive (pulls on weakened follicles)",
        "Hard water without a filter (can dry out already fragile hair)",
        "Brushing dry curly hair — only detangle when wet with conditioner",
      ],
    },
    specialConsiderations: [
      "Request extended pre-cooling time (15 min extra) if available on your system",
      "If using manual cold caps, have your helper practice swapping on your hair before first infusion",
      "The published data on cold capping with curly hair is limited — you may be pioneering this",
      "Document what works for you — this information helps future patients with similar hair",
    ],
  },

  "type_4": {
    hairType: "4a",
    description: "Coily/kinky hair (Type 4a-4c)",
    advancePrep: {
      timeline: "Start preparing 5-7 days before first infusion — this requires the most preparation",
      steps: [
        "Deep condition hair 3-4 days before treatment",
        "Remove ALL extensions, weaves, braids with extensions, crochets, and lace-front wigs",
        "If your hair is chemically relaxed, proceed normally with wetting the scalp",
        "If wearing hair naturally (not relaxed): consider thermally straightening 1-2 days before for best cap contact",
        "If you prefer not to straighten: wash and thoroughly wet hair, apply heavy conditioner, and section into very small twists or flat braids (no extensions)",
        "Practice the prep routine before infusion day — it takes longer with Type 4 hair and you don't want to feel rushed",
        "Consider cutting hair shorter if comfortable — shorter hair allows better cap-to-scalp contact",
        "Do NOT feel pressured to change your hair — modifications improve cold capping results but are your choice",
      ],
    },
    dayOfPrep: {
      steps: [
        "Wash with a hydrating shampoo formulated specifically for Type 4 hair — do NOT use standard cold cap shampoo",
        "Apply generous moisturizing conditioner",
        "Thoroughly saturate hair with water — this is the single most important step for Type 4 hair",
        "Type 4 hair is more porous and needs significantly more water than other hair types",
        "Run hair under a tap or shower — a spray bottle is insufficient",
        "The goal is to reduce hair volume enough that the cap sits directly against your scalp",
        "Apply oil to the ENDS only — not the scalp (oil on scalp can insulate against the cold)",
        "Section hair flat against the scalp in very thin sections",
        "Very small twists or cornrows (without any extensions) are ideal",
        "The smaller the sections, the flatter the hair sits, the better the cap contact",
      ],
      productsNeeded: [
        "hydrating_shampoo_type4",
        "heavy_moisturizing_conditioner_type4",
        "water_access_required",
        "hair_oil_for_ends",
        "wide_tooth_comb_seamless",
        "hair_clips_large",
        "headband_cotton",
      ],
      timeRequired: "35-45 minutes before cap fitting — arrive early",
    },
    duringCooling: {
      tips: [
        "The cap may not feel as cold on your scalp as it does for patients with straight hair — this is due to the insulating properties of Type 4 hair, not a problem with the system",
        "If you feel warm spots, tell your nurse — adjustments may help",
        "The outer cover should be as tight as comfortably possible",
      ],
      troubleshooting: [
        "The greatest risk area for Type 4 hair is the crown and sides where hair volume is highest",
        "If hair loss occurs primarily in patches (not evenly), the issue is almost certainly cap contact, not regimen",
        "For subsequent sessions: adjust prep to focus more water/flattening on the areas that lost hair",
        "Consider discussing with your nurse whether cotton rounds or gauze between the cap and scalp at gap areas could improve contact",
      ],
    },
    betweenInfusions: {
      hairCareRoutine: [
        "Wash once a week maximum with hydrating shampoo for Type 4 hair",
        "Deep condition after every wash",
        "Finger-comb only — never brush Type 4 hair during treatment",
        "Apply oil to scalp and hair for moisture (scalp may be dry and irritated from the cap)",
        "Sleep on satin pillowcase and/or wear a satin bonnet",
        "Keep hair in loose protective styles — small twists, finger coils, or Bantu knots without tension",
        "Do not re-braid tightly between sessions — loose is key",
      ],
      productsForMaintenance: [
        "hydrating_shampoo_type4",
        "deep_conditioner_type4",
        "leave_in_conditioner_type4",
        "hair_oil_natural_heavy",
        "satin_bonnet",
        "silk_pillowcase",
      ],
      whatToAvoid: [
        "Chemical relaxers during treatment — absolutely not",
        "Heat styling during treatment",
        "Extensions, weaves, crochets, or any added hair",
        "Tight braids, cornrows with tension, or edge-pulling styles",
        "Edge control products or gels that create stiff hold",
        "Hard brushing or combing when dry",
        "Standard (non-moisturizing) shampoo — it strips essential moisture from Type 4 hair",
      ],
    },
    specialConsiderations: [
      "The honest truth: cold capping has been poorly studied in women with Type 4 hair. One small study was stopped early because results were poor. But the failure was likely cap design and protocol, not biology.",
      "A case report showed successful cold capping in a Black woman using modified protocols — hydrating shampoo for ethnic hair, weekly washing, oil application, small twists without extensions.",
      "You are advocating for yourself by choosing to try cold capping. If the results aren't what you hoped, it's not your fault — the technology needs to improve for all hair types.",
      "Track and report your results through the platform — your data helps future patients and pushes manufacturers to design better caps.",
      "Financial assistance is available if cost is a barrier: Rapunzel Project, Hair to Stay, and Sharsheret offer help regardless of hair type.",
      "Request the longest pre-cooling time available on your system (standard 30 min + 15 min extension if offered)",
    ],
  },
};
```

---

## 5. Insurance Navigation

```typescript
interface CoolingInsuranceCoverage {
  // Medicare
  medicareCoverage: {
    covered: boolean;                    // true as of Jan 2026
    systemTypes: string[];               // "automated_refrigerated" only
    cptCodes: {
      initialFitting: { code: "97007"; reimbursement: 1696.77 };
      preInfusion: { code: "97008"; reimbursement: 10.00 };
      postInfusion30min: { code: "97009"; reimbursement: 6.35 };
    };
    manualCapsIncluded: false;
    effectiveDate: "2026-01-01";
  };
  
  // State mandates
  stateMandates: {
    state: string;
    effective: string;
    scope: string;                       // "large group plans" / "all plans"
    manualCapsIncluded: boolean;
    status: "active" | "pending" | "proposed";
  }[];
  
  // Private insurance (non-mandate states)
  privateInsuranceGuidance: string;      // How to check and appeal
}

const STATE_MANDATES = [
  { state: "NY", effective: "2026-01-01", scope: "Large group insurers", manualCapsIncluded: true, status: "active" },
  { state: "LA", effective: "2026-01-01", scope: "Large group insurers", manualCapsIncluded: true, status: "active" },
  { state: "MD", effective: "pending", scope: "TBD", manualCapsIncluded: true, status: "proposed" },
  { state: "MA", effective: "pending", scope: "TBD", manualCapsIncluded: true, status: "proposed" },
  { state: "NJ", effective: "pending", scope: "TBD", manualCapsIncluded: true, status: "proposed" },
  { state: "WV", effective: "pending", scope: "TBD", manualCapsIncluded: true, status: "proposed" },
];

// Financial assistance programs for cold capping
const COOLING_FINANCIAL_ASSISTANCE = [
  {
    name: "The Rapunzel Project",
    type: "financial_assistance",
    coverage: "Help with cold cap costs for patients with financial need",
    url: "https://www.rapunzelproject.org",
  },
  {
    name: "Hair to Stay",
    type: "financial_assistance",
    coverage: "Financial assistance for scalp cooling",
    url: "https://hairtostay.org",
  },
  {
    name: "Sharsheret",
    type: "financial_assistance",
    coverage: "Support for Jewish women and families facing breast cancer, including cold cap assistance",
    url: "https://sharsheret.org",
  },
];
```

The platform generates a personalized insurance navigation guide:

```typescript
const INSURANCE_NAVIGATION_PROMPT = `
Generate a personalized cold capping insurance guide for this patient.

Patient insurance: {insuranceType} ({insurerName})
Patient state: {state}
Infusion center system: {systemType} ({systemName})

Include:
1. Does their specific insurance cover scalp cooling? (Check state mandate, Medicare status, known insurer policies)
2. If covered: exact steps to ensure the infusion center bills correctly (CPT codes, prior auth if needed)
3. If not covered: appeal strategy (the Insurance Advocate module can generate an appeal letter)
4. If appeal fails or not covered: financial assistance programs they qualify for
5. Estimated out-of-pocket cost after all options exhausted

Present as a clear, step-by-step action plan with specific phone numbers and deadlines.
`;
```

---

## 6. Curated Product Kits

Not manufactured — assembled from existing products, sourced from established brands, packaged and fulfilled through the CARE module's existing infrastructure.

### 6.1 Kit Variants by Hair Type

```typescript
const COLD_CAP_PREP_KITS = {
  type_1_2: {
    name: "Scalp cooling prep kit — Straight/wavy hair",
    contents: [
      { product: "Gentle sulfate-free shampoo", brand: "Free & Clear or similar", qty: 1 },
      { product: "Silicone-free lightweight conditioner", brand: "Free & Clear or similar", qty: 1 },
      { product: "Fine mist spray bottle (for dampening)", qty: 1 },
      { product: "Wide-tooth comb (seamless)", qty: 1 },
      { product: "Soft cotton headband (forehead protection)", qty: 2 },
      { product: "Silk pillowcase", qty: 1 },
      { product: "Printed hair-type-specific prep guide with photos", qty: 1 },
    ],
    estimatedCost: 35,
    margin: "at cost + fulfillment",
  },
  
  type_3: {
    name: "Scalp cooling prep kit — Curly hair",
    contents: [
      { product: "Hydrating shampoo for curly hair", brand: "Carol's Daughter, SheaMoisture, or similar", qty: 1 },
      { product: "Moisturizing deep conditioner for curly hair", qty: 1 },
      { product: "Leave-in conditioner", qty: 1 },
      { product: "Natural hair oil (argan or jojoba blend)", qty: 1 },
      { product: "Wide-tooth comb (seamless, large)", qty: 1 },
      { product: "Sectioning clips (large, no-crease)", qty: 4 },
      { product: "Soft cotton headband", qty: 2 },
      { product: "Silk pillowcase", qty: 1 },
      { product: "Satin bonnet", qty: 1 },
      { product: "Printed hair-type-specific prep guide with photos", qty: 1 },
    ],
    estimatedCost: 48,
    margin: "at cost + fulfillment",
  },
  
  type_4: {
    name: "Scalp cooling prep kit — Coily/kinky hair",
    contents: [
      { product: "Hydrating shampoo for Type 4 hair", brand: "TGIN, Mielle, Camille Rose, or similar", qty: 1 },
      { product: "Heavy moisturizing deep conditioner for Type 4 hair", qty: 1 },
      { product: "Leave-in conditioner for Type 4 hair", qty: 1 },
      { product: "Natural hair oil (heavier — castor/shea blend)", qty: 1 },
      { product: "Seamless wide-tooth comb", qty: 1 },
      { product: "Large sectioning clips (no-crease)", qty: 6 },
      { product: "Soft cotton headband", qty: 2 },
      { product: "Cotton rounds (for gap filling between cap and scalp)", qty: 1 },
      { product: "Silk pillowcase", qty: 1 },
      { product: "Satin bonnet", qty: 1 },
      { product: "Printed hair-type-specific prep guide with photos and video QR code", qty: 1 },
    ],
    estimatedCost: 55,
    margin: "at cost + fulfillment",
  },
};
```

### 6.2 Sourcing Strategy

Partner with existing hair care brands rather than white-labeling:

- **Type 1-2 products:** Free & Clear, Vanicream, or similar dermatologist-recommended gentle brands
- **Type 3 products:** Carol's Daughter, SheaMoisture, Ouidad, or similar established curly-hair brands
- **Type 4 products:** TGIN, Mielle Organics, Camille Rose, As I Am, or similar Black-founded hair care brands

**Why partner rather than white-label:** These brands have the formulation expertise and the community trust that a platform-branded product wouldn't have. A Type 4 patient receiving a kit with Mielle products knows those products work for her hair. A kit with an unknown private-label brand creates doubt. And partnering with Black-founded brands for the Type 4 kit is the right thing to do.

---

## 7. Fitting Intelligence

### 7.1 Pre-Appointment Fitting Guide

Video + written guide specific to the patient's system and hair type:

```typescript
interface FittingGuide {
  system: string;                        // "paxman", "dignicap_delta", "amma", "penguin"
  hairType: HairType;
  
  // Video content (hosted on platform)
  videoGuide: {
    url: string;
    duration: string;
    chapters: {
      title: string;
      timestamp: string;
    }[];
  };
  
  // Written checklist
  infusionDayChecklist: {
    bringWith: string[];                 // What to bring to infusion
    arriveEarly: string;                 // "Arrive 45 minutes before scheduled infusion"
    prepSteps: string[];                 // Day-of prep steps (from hair type protocol)
    duringFitting: string[];             // What to tell your nurse / what to check
    duringCooling: string[];             // What to expect, what to report
    afterInfusion: string[];             // Post-cooling care
  };
  
  // Nurse communication
  nurseTalkingPoints: string[];          // "Ask your nurse to..." / "Tell your nurse..."
}
```

### 7.2 Nurse Education Materials

For infusion centers where nurses have limited cold capping experience (common outside major cancer centers):

```typescript
interface NurseQuickReference {
  system: string;
  hairType: HairType;
  
  fittingSteps: string[];
  commonMistakes: string[];
  troubleshooting: { issue: string; solution: string }[];
  
  // Platform can generate a printable one-page reference card
  // Patient brings this to infusion, shares with nurse
  printableGuideUrl: string;
}
```

---

## 8. Outcome Tracking

### 8.1 Patient-Reported Outcomes

```typescript
interface ColdCappingOutcome {
  patientId: string;
  system: string;
  hairType: HairType;
  regimen: string;
  
  // Per-cycle tracking
  cycleReports: {
    cycleNumber: number;
    sheddingLevel: 1 | 2 | 3 | 4 | 5;  // 1=minimal, 5=severe
    sheddingPattern: "even" | "patchy" | "hairline" | "crown" | "sides";
    capFitRating: 1 | 2 | 3 | 4 | 5;
    discomfortLevel: 1 | 2 | 3 | 4 | 5;
    adjustmentsMade: string[];
    photos: string[];                    // Optional photo tracking (encrypted, consent required)
  }[];
  
  // End-of-treatment summary
  overallPreservation: "excellent" | "good" | "moderate" | "poor" | "minimal";
  deanScore: 0 | 1 | 2 | 3 | 4;       // Standard alopecia grading (0=no loss, 4=complete)
  wouldRecommend: boolean;
  tipsForOthers: string;
  biggestChallenge: string;
}
```

### 8.2 Aggregate Analytics

Outcome data aggregated across patients creates the most valuable dataset in cold capping — outcomes by system × hair type × regimen × preparation protocol:

```typescript
interface AggregateOutcomeData {
  // This data doesn't exist anywhere else
  outcomeByHairType: Record<HairType, {
    totalPatients: number;
    averageDeanScore: number;
    preservationRate: number;            // % achieving Dean 0-2
    bestProtocolVariant: string;
    commonFailurePattern: string;
  }>;
  
  outcomeByRegimen: Record<string, {
    totalPatients: number;
    averageDeanScore: number;
    preservationRate: number;
    bestSystem: string;
  }>;
  
  outcomeBySystem: Record<string, {
    totalPatients: number;
    averageDeanScore: number;
    preservationRate: number;
    patientSatisfaction: number;
  }>;
}
```

This aggregate data is the long-term strategic asset. It allows the platform to tell patients: "For your specific hair type, regimen, and system, patients who used [specific prep protocol] had 72% hair preservation — vs 45% for the standard protocol." No other source can provide this.

---

## 9. 3D Scanning Infrastructure (Future — 18-24 Month Horizon)

When custom-fit caps reach commercial availability (Paxman/Huddersfield research or new entrants):

```typescript
interface ScanningServiceModel {
  // Phase 1: Partner scanning locations
  phase1: {
    model: "Partner with existing 3D scanning services (dental offices, prosthetics labs) for head scanning";
    patientExperience: "Book appointment through platform → visit scanning location → 2-minute scan → data sent to cap manufacturer";
    platformRole: "Coordination and data routing — own the patient relationship and the scan data";
    revenue: "Scanning fee ($50-100) or bundled into cap rental cost";
    timeline: "When first custom cap product reaches market";
  };
  
  // Phase 2: At-home scanning
  phase2: {
    model: "iPhone/iPad LiDAR-based head scanning (iPhone 12 Pro and later have LiDAR)";
    patientExperience: "Open platform app → follow guided scan instructions → scan takes 60 seconds → data processed in cloud";
    platformRole: "App development + scan processing pipeline + manufacturer integration";
    revenue: "Included in platform";
    timeline: "12-18 months after Phase 1, when smartphone scan accuracy is validated";
    technicalNote: "iPhone LiDAR has ~1cm accuracy — may be sufficient for cap sizing but not for the 1mm precision the Huddersfield research uses. Needs validation study.";
  };
}
```

The strategic play: by the time custom caps are commercially available, the platform has the largest patient scanning dataset — which makes it the natural distribution channel for any manufacturer entering the custom cap market.

---

## 10. Topical Adjunct Product (Future — 12-18 Month Horizon)

Based on the January 2026 Frontiers in Pharmacology research showing antioxidants synergize with sub-optimal cooling:

```typescript
interface TopicalAdjunctStrategy {
  // Phase 1: Curated existing products
  phase1: {
    approach: "Recommend existing cosmetic-grade antioxidant products that contain the studied compounds";
    compounds: [
      { name: "NAC (N-Acetyl Cysteine)", cosmetic_availability: "Available as topical serum ingredient" },
      { name: "Resveratrol", cosmetic_availability: "Widely available in skincare serums" },
      { name: "Vitamin E (Trolox analog)", cosmetic_availability: "Ubiquitous in skincare" },
    ];
    claims: "Scalp conditioning treatment — NO medical claims";
    timeline: "Immediate — add to prep kits as 'scalp conditioning' step";
    regulatory: "Cosmetic — no FDA clearance needed if no medical claims";
  };
  
  // Phase 2: Formulated product
  phase2: {
    approach: "Partner with cosmetic chemist to formulate an optimized scalp prep serum";
    formulation: "NAC + Resveratrol + Vitamin E in a lightweight scalp serum vehicle";
    positioning: "Pre-cooling scalp conditioning treatment";
    claims: "Carefully worded cosmetic claims only — 'conditions and protects the scalp' not 'prevents hair loss'";
    manufacturing: "Contract with existing cosmetic manufacturer (not HM in-house)";
    timeline: "6-12 months for formulation, stability testing, and small-batch production";
    regulatory: "Cosmetic product — FDA registration but not clearance. Must avoid any drug claims.";
    pricing: "At cost — $12-18 per bottle, included in cold cap prep kits";
  };
  
  // Phase 3: Clinical validation
  phase3: {
    approach: "Partner with academic center to run a pilot study of the topical + cooling combination";
    design: "Single-arm pilot: patients using standard cooling + topical adjunct vs published cooling-only outcomes";
    endpoint: "Dean score comparison at end of treatment";
    purpose: "Generate evidence to support product, inform future claims, contribute to the science";
    timeline: "18-24 months (study design + enrollment + treatment + follow-up)";
    note: "This study benefits the entire cold capping community, not just the platform's product";
  };
}
```

---

## 11. Partnership Strategy

### 11.1 Device Manufacturer Partnerships

```
Paxman:
  - Data sharing: aggregate outcome data by regimen × hair type (anonymized)
  - Referral: platform directs patients to Paxman-equipped infusion centers
  - In return: Paxman promotes platform to infusion centers as patient support resource
  - Custom cap research: platform provides scanning data when custom caps reach market

Cooler Heads (Amma):
  - Same data sharing model
  - Portability advantage highlighted for patients who need it
  - Platform tracks Amma-specific outcomes for their clinical evidence base

Penguin / Arctic Cold Caps (manual):
  - Rental referral partnership (affiliate commission)
  - Platform provides fitting guidance and prep protocols (manual caps need more patient/helper skill)
  - Track manual vs automated outcomes for the research base
```

### 11.2 Hair Care Brand Partnerships

```
For Type 3/4 kits:
  - Partner with Black-founded hair care brands (TGIN, Mielle, Camille Rose, As I Am)
  - Products sourced at wholesale for kit assembly
  - Brand gets exposure to an underserved audience; platform gets trusted products
  - Co-develop cold-cap-specific hair care guidance with brand's trichologists
```

### 11.3 Financial Assistance Partners

```
  - Rapunzel Project: integrate their assistance application into the platform's Financial Finder
  - Hair to Stay: same integration
  - Sharsheret: same integration + culturally specific support referral
```

---

## 12. Data Model

```sql
CREATE TABLE cooling_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  
  regimen TEXT NOT NULL,
  alopecia_risk TEXT NOT NULL,
  cold_capping_efficacy TEXT,
  time_to_first_infusion INTEGER,
  window_status TEXT NOT NULL,
  
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cooling_system_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  
  recommended_system TEXT NOT NULL,
  system_type TEXT NOT NULL,
  available_at_center BOOLEAN,
  insurance_coverage TEXT,
  estimated_oop_cost DECIMAL(10,2),
  financial_assistance_matched TEXT[],
  
  patient_decision TEXT,                 -- chose, declined, considering
  decision_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cooling_prep_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  
  hair_type TEXT NOT NULL,
  protocol_version TEXT NOT NULL,
  customizations JSONB,                  -- patient-specific modifications
  prep_kit_ordered BOOLEAN DEFAULT FALSE,
  prep_kit_order_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cooling_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  
  system TEXT NOT NULL,
  hair_type TEXT NOT NULL,
  regimen TEXT NOT NULL,
  prep_protocol_id UUID REFERENCES cooling_prep_protocols(id),
  
  cycle_reports JSONB,
  overall_preservation TEXT,
  dean_score INTEGER,
  would_recommend BOOLEAN,
  tips_for_others TEXT,
  biggest_challenge TEXT,
  
  consent_scope TEXT DEFAULT 'platform_only',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cooling_outcomes_system ON cooling_outcomes(system, regimen);
CREATE INDEX idx_cooling_outcomes_hair ON cooling_outcomes(hair_type, regimen);
CREATE INDEX idx_cooling_assessments_patient ON cooling_assessments(patient_id);
```

---

## 13. Build Sequence

```
SESSION CL1: Assessment + system matching + insurance navigation (Week 1-2)
  1. Prisma schema
  2. Alopecia risk assessment engine (regimen → risk profile)
  3. Time-sensitive alert system (same pattern as fertility preservation)
  4. Cooling system database (seed 5 systems)
  5. System matching engine (center availability × insurance × preferences)
  6. Insurance navigation module
     - Medicare CPT code checker
     - State mandate checker
     - Private insurance guidance generator (Claude)
     - Financial assistance matching (Rapunzel Project, Hair to Stay, Sharsheret)
  7. Integration with Financial Assistance Finder
  8. Routes: /care/cold-capping, /care/cold-capping/systems, /care/cold-capping/insurance

SESSION CL2: Hair-type protocols + prep kits + fitting guidance (Week 2-4)
  1. Hair type assessment (self-reported with visual guide)
  2. Hair-type-specific prep protocol engine
     - Type 1-2, Type 3, Type 4 protocols
     - Day-of checklist generator
     - Between-infusion care guide
  3. Curated prep kit integration with CARE module
     - Three kit variants by hair type
     - Sourcing from partner brands
     - Kit delivery timed to treatment calendar
  4. Fitting guidance module
     - System-specific + hair-type-specific video/written guides
     - Nurse quick reference card (printable PDF)
     - Infusion day checklist
  5. Nurse communication generator (Claude — talking points for the patient)
  6. Integration with CARE module timeline (prep kit delivery before first infusion)

SESSION CL3: Outcome tracking + community data + LEARN integration (Week 4-6)
  1. Per-cycle outcome reporting UI
     - Shedding level, pattern, fit rating, adjustments
     - Optional photo tracking (encrypted, consent-gated)
  2. End-of-treatment summary
  3. Aggregate outcome analytics
     - By system × hair type × regimen
     - Visualization of outcomes (for internal use initially)
  4. Community intelligence contribution
     - Feed cold capping outcomes into INTEL community layer
     - Anonymized tips and protocol modifications shared with future patients
  5. LEARN article integration
     - Cold capping article updated with platform-specific guidance
     - Hair type selector that personalizes the article content
     - T7 visualization (cold capping mechanism) embedded
  6. Cold capping visualization for VISUAL module (T7)
     - Interactive toggle: blood flow with/without cooling
     - Hair type selector showing cap contact differences
```

### Timeline

```
Session CL1:  Week 1-2   (assessment + matching + insurance — patients can find their path)
Session CL2:  Week 2-4   (protocols + kits + fitting — patients can prepare properly)
Session CL3:  Week 4-6   (outcomes + community — data flywheel starts)

Total: ~6 weeks
MVP (CL1): 2 weeks — system matching + insurance navigation
Usable (CL1-CL2): 4 weeks — full service with prep kits
Complete (CL1-CL3): 6 weeks — outcome tracking + community data

Future phases (12-24 month horizon):
  - Topical antioxidant scalp prep (curated → formulated → clinically validated)
  - 3D scanning partnership infrastructure
  - Expanded outcome dataset → research partnerships → published evidence
```
