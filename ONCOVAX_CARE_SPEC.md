# Care Packages & Kits — Technical Specification v1.0

## Treatment-Protocol-Aware Care Commerce (CARE)

**Author:** Rett (Happy Medium)
**Date:** March 2026
**Depends on:** Phase 1 (MATCH) patient profiles + Treatment Translator clinical data
**Happy Medium connection:** HM manufacturing for hero products, CPG fulfillment expertise, art therapy integration
**Purpose:** Deeply integrated care commerce that uses treatment plan data to generate personalized, time-sensitive care packages — combining HM-branded hero products with partner-fulfilled clinical essentials. Four revenue channels: direct patient purchase, gift/registry, corporate wellness, nonprofit subsidy.

---

## Table of Contents

1. [Strategic Context](#1-strategic-context)
2. [Product Architecture](#2-product-architecture)
3. [Treatment Protocol Intelligence](#3-treatment-protocol-intelligence)
4. [Kit Builder Engine](#4-kit-builder-engine)
5. [Gift & Registry System](#5-gift--registry-system)
6. [Corporate Wellness Channel](#6-corporate-wellness-channel)
7. [Nonprofit Subsidy Channel](#7-nonprofit-subsidy-channel)
8. [Fulfillment Architecture](#8-fulfillment-architecture)
9. [E-Commerce Platform](#9-e-commerce-platform)
10. [Data Model](#10-data-model)
11. [API & tRPC Router Definitions](#11-api--trpc-router-definitions)
12. [Content & Item Database](#12-content--item-database)
13. [Build Sequence](#13-build-sequence)

---

## 1. Strategic Context

### 1.1 The Problem

A person gets diagnosed with cancer. Within days, they're drowning in medical information, emotional distress, and logistical chaos. At the same time, there are dozens of practical items — oral care products, anti-nausea aids, comfort items, cold capping supplies, port care kits — that will dramatically improve their quality of life through treatment. But:

- **They don't know what they need** until it's too late. Cold capping has to start at infusion #1 — if no one tells you before then, the window is closed. Mucositis prevention is far more effective than treatment. The right anti-nausea protocol varies by chemo regimen.
- **Generic care packages miss the mark.** Amazon's "chemo care package" is ginger candy and fuzzy socks regardless of whether you're getting AC-T or carboplatin/taxol or immunotherapy. A TNBC patient getting dose-dense AC has completely different needs than an ER+ patient on aromatase inhibitors.
- **Friends and family are desperate to help** but don't know what to buy. They send flowers that die, food the patient can't eat, and books they're too exhausted to read. What they want is: "tell me the exact right thing to send that will actually help."
- **Timing is everything and nobody manages it.** The port care kit needs to arrive before port placement surgery. The nausea kit needs to be on hand before the first infusion. The radiation burn care products need to arrive before external beam starts. The survivorship transition kit should arrive as active treatment ends. Nobody coordinates this.

### 1.2 The Opportunity

The platform already knows:
- Exact cancer type and subtype
- Treatment plan (surgery type, chemo regimen, radiation plan)
- Treatment timeline (start dates, cycle schedule)
- Biomarker status (which informs treatment selection)
- Patient's geographic location (for shipping)
- Patient's financial situation (from Financial Assistance Finder data)

This means the platform can do what no generic retailer can: **generate a treatment-protocol-specific kit sequence, timed to the treatment calendar, with items selected because the clinical evidence says they help for THIS specific regimen.** That's not a care package. That's a clinical support system with a shipping label.

### 1.3 The Happy Medium Advantage

This is where the platform operator's actual business becomes a superpower:

- **Manufacturing capability**: HM already produces physical goods. Art therapy kits, ceramics kits, custom branded items — these become hero products that no competitor can replicate.
- **CPG experience**: HM already manages a product line with the German paintbrushes. Supply chain, packaging, branding — this is existing muscle.
- **The art therapy angle**: An "Infusion Companion Kit" with high-quality art supplies designed for the 2-4 hours you're sitting in a chair? That's a product only HM would think to build. The clinical evidence for art therapy in cancer treatment is strong — anxiety reduction, pain perception reduction, and quality of life improvement are all well-documented. This isn't woo-woo; it's evidence-based supportive care with beautiful packaging.
- **B2B relationships**: HM already works with blue-chip corporate clients. The corporate wellness channel is a natural extension.

### 1.4 Competitive Landscape

**What exists today:**
- Generic Amazon care packages ($30-60) — no personalization, no timing, wrong items
- Pinch of Color, Cancer Care Parcel, Chemo Kits — better curated but still one-size-fits-all, not treatment-specific
- Hospital gift shops — limited selection, no protocol awareness
- Individual product brands (Healios, Biotene, etc.) — patient has to discover and buy each item separately

**What doesn't exist:**
- Treatment-protocol-specific kits generated from actual clinical data
- Timed delivery sequences coordinated with the treatment calendar
- Gift registry where friends/family buy specific, clinically-appropriate items
- Art therapy products designed specifically for infusion sessions
- Corporate wellness benefit packages for employees facing cancer treatment

That gap is the product.

---

## 2. Product Architecture

### 2.1 Product Categories

```typescript
type ProductCategory =
  | "clinical_essential"      // OTC meds, oral care, skin care — partner-fulfilled commodity items
  | "comfort"                 // Blankets, pillows, socks, water bottles — partner-fulfilled
  | "nutrition"               // Ginger products, protein supplements, hydration — partner-fulfilled
  | "art_therapy"             // HM-branded creative kits designed for treatment sessions
  | "journaling"              // HM-branded journals, reflection prompts, milestone markers
  | "cold_capping"            // Cold cap rental information, scalp care products, accessories
  | "port_care"               // Port access clothing, care supplies, comfort items
  | "radiation_care"          // Skin care for radiation, comfort items
  | "surgical_recovery"       // Post-op essentials, pillow positioning, drain management
  | "hair_transition"         // Wig resources, headwear, scalp care, regrowth care
  | "survivorship_transition" // "What now?" kits for the end of active treatment
  | "caregiver"               // Items specifically for the caregiver, not the patient
  | "information"             // Not a physical product — guides, checklists, resource directories
  | "digital"                 // Platform feature unlocks, premium content, consultation credits
```

### 2.2 Product Sourcing Model

```
┌─────────────────────────────────────────────────────────┐
│                    Product Sources                        │
├────────────────────┬────────────────────┬────────────────┤
│  HM-BRANDED        │  CURATED PARTNER   │  INFORMATION   │
│  (Hero Products)   │  (Commodity)       │  (Digital)     │
│                    │                    │                │
│  Art therapy kits  │  Biotene           │  Cold cap guide│
│  Infusion journals │  Healios           │  Wig directory │
│  Ceramics kits     │  Aquaphor          │  Checklists    │
│  Reflection decks  │  Benadryl/Tylenol  │  Resource PDFs │
│  Milestone markers │  Ginger chews      │  Video guides  │
│  Creative tools    │  Protein shakes    │  Prep guides   │
│  Comfort blankets  │  Water bottles     │                │
│  (HM-designed)     │  Port pillows      │                │
│                    │  Compression socks │                │
│  MARGIN: 60-75%    │  MARGIN: 25-40%    │  MARGIN: 100%  │
│  SOURCE: HM mfg    │  SOURCE: 3PL/drop  │  SOURCE: Claude│
│  MOAT: High        │  MOAT: Low         │  MOAT: High    │
└────────────────────┴────────────────────┴────────────────┘
```

### 2.3 Kit vs. Individual Item

Products are sold both as curated kits and as individual items:

**Kits** — the primary product. Treatment-specific bundles assembled from the protocol intelligence engine. Higher AOV, better margins (bundle pricing), and the "someone figured this out for me" value proposition.

**Individual items** — available for patients who already have some items or want to customize. Also enables the gift registry model where friends/family can buy specific items from the patient's recommended list.

---

## 3. Treatment Protocol Intelligence

This is the core differentiator — the engine that maps treatment plans to specific product needs.

### 3.1 Protocol-to-Product Mapping

```typescript
interface ProtocolMapping {
  // Treatment identifier
  regimenCode: string;                   // "AC-T", "TC", "TCHP", "carboplatin-taxol", etc.
  regimenName: string;
  treatmentType: "chemotherapy" | "radiation" | "surgery" | "immunotherapy" | "endocrine" | "targeted";
  
  // Side effect profile (drives product selection)
  sideEffectProfile: {
    effect: string;                      // "nausea", "mucositis", "alopecia", "skin_reaction", etc.
    incidence: number;                   // % of patients who experience this
    typicalOnset: string;               // "Day 2-4 of each cycle", "Week 2 of radiation"
    severity: "mild" | "moderate" | "severe";
    preventionWindow: string | null;     // When to start prevention (BEFORE symptoms)
    peakDuration: string;
  }[];
  
  // Product recommendations
  productRecommendations: {
    productId: string;
    category: ProductCategory;
    timing: "before_treatment_starts" | "cycle_1" | "ongoing" | "mid_treatment" | "end_of_treatment";
    priority: "essential" | "recommended" | "nice_to_have";
    clinicalRationale: string;           // WHY this product for this regimen
    evidenceBase: string;                // Citation or evidence level
  }[];
  
  // Timing constraints
  timingConstraints: {
    constraint: string;
    deadline: string;                    // "Must be in hand before first infusion"
    consequence: string;                 // "Window for cold capping closes permanently"
  }[];
}
```

### 3.2 Protocol Database (Seed — Breast Cancer)

```typescript
const BREAST_CANCER_PROTOCOLS: ProtocolMapping[] = [
  {
    regimenCode: "AC-T",
    regimenName: "Doxorubicin + Cyclophosphamide → Paclitaxel (Dose-Dense AC-T)",
    treatmentType: "chemotherapy",
    sideEffectProfile: [
      {
        effect: "nausea_vomiting",
        incidence: 70,
        typicalOnset: "Day 1-3 of AC cycles (less with taxol phase)",
        severity: "severe",
        preventionWindow: "Day of infusion — have anti-nausea protocol ready",
        peakDuration: "48-72 hours post-AC infusion",
      },
      {
        effect: "mucositis",
        incidence: 40,
        typicalOnset: "Day 5-10 of each AC cycle",
        severity: "moderate",
        preventionWindow: "Start oral care protocol BEFORE first infusion",
        peakDuration: "5-7 days per cycle",
      },
      {
        effect: "alopecia",
        incidence: 95,
        typicalOnset: "Day 14-21 after first AC infusion",
        severity: "severe",
        preventionWindow: "Cold capping must begin at infusion #1 — NO later",
        peakDuration: "Complete by cycle 2-3, regrowth 3-6 months after last chemo",
      },
      {
        effect: "fatigue",
        incidence: 80,
        typicalOnset: "Cumulative, worsens with each cycle",
        severity: "moderate",
        preventionWindow: null,
        peakDuration: "Throughout treatment, 2-4 weeks after completion",
      },
      {
        effect: "neuropathy",
        incidence: 60,
        typicalOnset: "During taxol phase (cycles 5-8)",
        severity: "moderate",
        preventionWindow: "Ice mitts/booties during taxol infusion may reduce",
        peakDuration: "Can persist months after treatment",
      },
      {
        effect: "neutropenia",
        incidence: 50,
        typicalOnset: "Day 7-14 of each cycle",
        severity: "severe",
        preventionWindow: "Neulasta/Neupogen prescribed by oncologist",
        peakDuration: "5-7 days per cycle",
      },
      {
        effect: "constipation",
        incidence: 60,
        typicalOnset: "Day 2-5 post-infusion (from anti-nausea meds)",
        severity: "moderate",
        preventionWindow: "Start stool softener day of infusion",
        peakDuration: "3-5 days",
      },
    ],
    productRecommendations: [
      // ESSENTIAL — before treatment starts
      { productId: "biotene_mouthwash", category: "clinical_essential", timing: "before_treatment_starts",
        priority: "essential", clinicalRationale: "Alcohol-free mouthwash prevents worsening of mucositis. Standard mouthwash with alcohol causes extreme pain on compromised mucosa.",
        evidenceBase: "MASCC/ISOO clinical practice guidelines for mucositis management" },
      { productId: "biotene_toothpaste", category: "clinical_essential", timing: "before_treatment_starts",
        priority: "essential", clinicalRationale: "Gentle toothpaste for sensitive oral tissue during chemo.",
        evidenceBase: "MASCC/ISOO guidelines" },
      { productId: "healios_oral_rinse", category: "clinical_essential", timing: "before_treatment_starts",
        priority: "essential", clinicalRationale: "Glutamine-based oral rinse clinically shown to reduce mucositis severity and duration.",
        evidenceBase: "Multiple RCTs — glutamine reduces mucositis grade in chemo patients" },
      { productId: "soft_toothbrush", category: "clinical_essential", timing: "before_treatment_starts",
        priority: "essential", clinicalRationale: "Regular toothbrush causes bleeding on compromised gums. Extra-soft bristles required.",
        evidenceBase: "ACS oral care guidelines during treatment" },
      { productId: "benadryl_liquid", category: "clinical_essential", timing: "before_treatment_starts",
        priority: "recommended", clinicalRationale: "Diphenhydramine used in 'magic mouthwash' compounding for mucositis pain. Also pre-med for taxol infusion reactions.",
        evidenceBase: "Standard pre-medication protocol for taxane infusion" },
      { productId: "tylenol", category: "clinical_essential", timing: "before_treatment_starts",
        priority: "essential", clinicalRationale: "Acetaminophen for fever monitoring during neutropenic periods. CRITICAL: Oncologist will say to call if temp >100.4°F — need thermometer and tylenol on hand.",
        evidenceBase: "NCCN fever and neutropenia guidelines" },
      { productId: "digital_thermometer", category: "clinical_essential", timing: "before_treatment_starts",
        priority: "essential", clinicalRationale: "Daily temperature monitoring during neutropenic window. Fever >100.4°F requires immediate ER visit.",
        evidenceBase: "NCCN fever and neutropenia guidelines" },
      { productId: "stool_softener", category: "clinical_essential", timing: "before_treatment_starts",
        priority: "essential", clinicalRationale: "Anti-nausea medications (especially ondansetron/Zofran) cause severe constipation. Start docusate sodium day of infusion, don't wait for symptoms.",
        evidenceBase: "ONS constipation management guidelines" },
      { productId: "anti_nausea_bands", category: "clinical_essential", timing: "before_treatment_starts",
        priority: "recommended", clinicalRationale: "Acupressure wristbands as adjunct anti-nausea measure. Low-risk complementary approach.",
        evidenceBase: "Cochrane review — modest benefit as adjunct to antiemetics" },
      { productId: "ginger_chews", category: "nutrition", timing: "before_treatment_starts",
        priority: "recommended", clinicalRationale: "Ginger has evidence for chemotherapy-induced nausea reduction as adjunct to prescribed antiemetics.",
        evidenceBase: "Multiple RCTs — ginger as adjunct antiemetic in CINV" },
      { productId: "electrolyte_packets", category: "nutrition", timing: "before_treatment_starts",
        priority: "recommended", clinicalRationale: "Hydration critical during chemo. Electrolyte packets encourage fluid intake and replace what's lost to nausea/diarrhea.",
        evidenceBase: "ACS hydration guidelines during treatment" },

      // COLD CAPPING — MUST be before infusion #1
      { productId: "cold_cap_guide", category: "information", timing: "before_treatment_starts",
        priority: "essential", clinicalRationale: "Comprehensive guide to cold capping options (Paxman, Penguin, DigniCap), rental process, what to expect, success rates by regimen. AC-T has ~50-65% hair preservation rate with cold capping.",
        evidenceBase: "JAMA Dermatology systematic review — scalp cooling reduces CIA" },
      { productId: "scalp_care_kit", category: "cold_capping", timing: "before_treatment_starts",
        priority: "recommended", clinicalRationale: "If cold capping: gentle shampoo, wide-tooth comb, silk pillowcase. Scalp is fragile during capping — wrong products cause breakage.",
        evidenceBase: "Cold capping manufacturer guidelines" },

      // INFUSION DAY — cycle 1
      { productId: "infusion_art_kit", category: "art_therapy", timing: "cycle_1",
        priority: "recommended", clinicalRationale: "Art therapy during infusion reduces anxiety and perceived pain. AC infusion takes 2-3 hours — creative activity provides positive focus and time management.",
        evidenceBase: "Cochrane review — arts interventions reduce anxiety in cancer patients" },
      { productId: "infusion_comfort_kit", category: "comfort", timing: "cycle_1",
        priority: "recommended", clinicalRationale: "Warm blanket (infusion rooms are cold), lip balm (chemo causes dry lips), hard candies (metallic taste), snacks (2-3 hour session).",
        evidenceBase: "Oncology nurse association patient comfort guidelines" },
      { productId: "port_comfort_pillow", category: "port_care", timing: "cycle_1",
        priority: "recommended", clinicalRationale: "Seatbelt guard and sleep pillow for port site. Port is accessed via needle through chest wall — seatbelt pressure is painful.",
        evidenceBase: "Patient-reported quality of life data" },
      { productId: "ice_mitts_booties", category: "clinical_essential", timing: "cycle_1",
        priority: "recommended", clinicalRationale: "Frozen gloves/socks during taxol infusion may reduce peripheral neuropathy risk. Start during taxol phase (cycles 5-8 in dose-dense AC-T).",
        evidenceBase: "Phase 3 RCT — frozen glove reduces taxane neuropathy severity" },

      // ONGOING — throughout treatment
      { productId: "protein_supplement", category: "nutrition", timing: "ongoing",
        priority: "recommended", clinicalRationale: "Maintaining protein intake during chemo prevents muscle wasting and supports immune recovery between cycles.",
        evidenceBase: "ESPEN nutrition guidelines in cancer" },
      { productId: "water_bottle_marked", category: "nutrition", timing: "ongoing",
        priority: "nice_to_have", clinicalRationale: "Time-marked water bottle encourages adequate hydration throughout the day. Dehydration is the #1 preventable ER visit during chemo.",
        evidenceBase: "Oncology nursing hydration protocols" },

      // HAIR TRANSITION — when alopecia begins
      { productId: "hair_transition_guide", category: "information", timing: "ongoing",
        priority: "essential", clinicalRationale: "Comprehensive guide: when to expect hair loss, shaving decision, wig fitting timeline (get fitted BEFORE hair falls out for best color/texture match), headwear options, scalp care during hairless period, regrowth timeline.",
        evidenceBase: "ACS hair loss during treatment resources" },
      { productId: "wig_resource_directory", category: "hair_transition", timing: "before_treatment_starts",
        priority: "recommended", clinicalRationale: "Directory of wig providers, insurance coverage information (many plans cover 'cranial prosthesis' with Rx), nonprofit wig banks, fitting tips. TIMING: Get fitted while you still have hair.",
        evidenceBase: "ACS, CancerCare wig assistance programs" },
      { productId: "silk_pillowcase", category: "comfort", timing: "ongoing",
        priority: "recommended", clinicalRationale: "Reduces friction on sensitive scalp (with or without cold capping), also helps with skin sensitivity from chemo.",
        evidenceBase: "Dermatology recommendations for chemo skin care" },

      // END OF TREATMENT — survivorship transition
      { productId: "survivorship_transition_kit", category: "survivorship_transition", timing: "end_of_treatment",
        priority: "recommended", clinicalRationale: "End of active treatment is paradoxically one of the hardest emotional transitions. Kit includes: milestone journal, reflection prompts, 'what to expect in survivorship' guide, self-care items for the post-treatment phase.",
        evidenceBase: "Psycho-oncology literature on end-of-treatment distress" },
    ],
    timingConstraints: [
      {
        constraint: "Cold capping decision",
        deadline: "Must decide and have cap rental arranged BEFORE infusion #1",
        consequence: "If cold capping doesn't start at cycle 1, hair preservation rate drops dramatically. Most oncologists don't proactively discuss this — patients need to ask.",
      },
      {
        constraint: "Oral care protocol",
        deadline: "Start before first infusion, not after symptoms appear",
        consequence: "Mucositis prevention is far more effective than treatment. Once mucosa is compromised, even water is painful.",
      },
      {
        constraint: "Wig fitting",
        deadline: "Get fitted while you still have hair (before Day 14-21 of cycle 1)",
        consequence: "Hair sample needed for best color and texture match. Once hair falls out, matching is much harder.",
      },
      {
        constraint: "Port comfort items",
        deadline: "Before port placement surgery (usually 1-2 weeks before chemo start)",
        consequence: "First car ride home after port placement is painful without seatbelt guard.",
      },
      {
        constraint: "Anti-constipation protocol",
        deadline: "Day of first infusion",
        consequence: "Ondansetron-induced constipation can become severe enough to require ER visit if not proactively managed.",
      },
    ],
  },
  // Additional protocols to seed:
  // "TCHP" — Docetaxel + Carboplatin + Herceptin + Perjeta (HER2+)
  //   - Similar to AC-T but with cardiac monitoring needs (herceptin)
  //   - Less nausea than AC, more diarrhea from pertuzumab
  //   - Same alopecia profile
  //   - Add: heart health monitoring info, diarrhea management kit

  // "CMF" — Cyclophosphamide + Methotrexate + 5-FU
  //   - Lower alopecia risk (~50%)
  //   - Significant mucositis risk from methotrexate + 5-FU
  //   - Heavier oral care kit

  // "Carboplatin-Taxol" — (often for TNBC)
  //   - Weekly taxol = different nausea pattern than dose-dense
  //   - Higher neuropathy risk (cumulative taxol)
  //   - Ice mitts/booties MORE important here

  // "Pembrolizumab + chemo" — (TNBC immunotherapy)
  //   - Unique immunotherapy side effects (immune-mediated)
  //   - Thyroid monitoring, skin reactions
  //   - Add: skin care kit, thyroid awareness guide

  // "Aromatase Inhibitor" — (adjuvant endocrine, ER+)
  //   - Joint pain/stiffness (most common reason for discontinuation!)
  //   - Bone density concerns
  //   - Hot flashes, vaginal dryness
  //   - Add: joint comfort kit, bone health guide, menopause symptom management

  // "Tamoxifen" — (adjuvant endocrine, ER+, pre-menopausal)
  //   - Hot flashes, mood changes
  //   - Blood clot risk awareness
  //   - Add: hot flash management kit

  // "External beam radiation" — (breast/chest wall)
  //   - Skin burn pattern depends on dose and field
  //   - Fatigue (cumulative, peaks week 3-4)
  //   - Add: radiation skin care kit (Aquaphor, aloe, calendula, loose cotton clothing)

  // "Bilateral mastectomy" — (surgical)
  //   - Drain management supplies
  //   - Post-surgical pillow (can't sleep flat)
  //   - Button-front clothing (can't raise arms)
  //   - Scar care (after healing)
  //   - Add: surgical recovery kit

  // "Lumpectomy + sentinel node biopsy" — (surgical)
  //   - Less intensive than mastectomy recovery
  //   - Lymphedema awareness if nodes removed
  //   - Add: lymphedema awareness guide, compression sleeve info
];
```

### 3.3 Kit Generation Engine

```typescript
interface KitGenerationInput {
  // From patient profile (Phase 1 intake)
  patientId: string;
  cancerType: string;
  subtype: string;
  stage: string;
  
  // From treatment plan (extracted via document ingestion or FHIR)
  treatmentPlan: {
    surgery?: {
      type: string;                     // "bilateral mastectomy", "lumpectomy", etc.
      scheduledDate: string | null;
    };
    chemotherapy?: {
      regimen: string;                  // "AC-T", "TCHP", etc.
      startDate: string | null;
      cycleCount: number;
      cycleLengthDays: number;
      dose: string;
    };
    radiation?: {
      type: string;                     // "external beam", "brachytherapy"
      startDate: string | null;
      fractionCount: number;
      field: string;                    // "whole breast", "chest wall", "regional nodes"
    };
    endocrine?: {
      drug: string;                     // "anastrozole", "tamoxifen", "letrozole"
      startDate: string | null;
      duration: string;                 // "5 years", "10 years"
    };
    immunotherapy?: {
      drug: string;
      startDate: string | null;
    };
    targetedTherapy?: {
      drug: string;
      startDate: string | null;
    };
  };
  
  // Patient preferences
  preferences?: {
    interestedInColdCapping: boolean | null;
    interestedInArtTherapy: boolean | null;
    dietaryRestrictions: string[];
    hasPortPlacement: boolean | null;
    budget: "essential_only" | "standard" | "comprehensive";
  };
}

interface GeneratedKitSequence {
  patientId: string;
  generatedAt: string;
  
  kits: {
    kitId: string;
    kitName: string;                     // "Pre-Treatment Essentials"
    kitDescription: string;
    treatmentPhase: string;              // "pre_surgery", "pre_chemo_cycle_1", "radiation_week_1", etc.
    
    // Timing
    idealDeliveryDate: string;           // When this kit should arrive
    latestAcceptableDate: string;        // Last date where items are still useful
    deliveryUrgency: "flexible" | "time_sensitive" | "critical";
    
    // Contents
    items: {
      productId: string;
      productName: string;
      category: ProductCategory;
      priority: "essential" | "recommended" | "nice_to_have";
      quantity: number;
      unitPrice: number;
      clinicalRationale: string;         // Why THIS item for THIS patient
      timing_note: string | null;        // "Start using day of first infusion"
    }[];
    
    // Pricing
    kitPrice: number;                    // Bundle price (< sum of individual items)
    savingsVsIndividual: number;
    
    // Personalization
    personalNote: string;               // Claude-generated note specific to their situation
    includesGuide: boolean;             // Printed guide with usage instructions
  }[];
  
  // Timeline visualization data
  timeline: {
    date: string;
    event: string;                       // "Surgery", "Chemo Cycle 1", "Radiation Start"
    kitDelivery: string | null;          // Which kit arrives
  }[];
}
```

### 3.4 Claude-Powered Kit Personalization

```typescript
const KIT_PERSONALIZATION_PROMPT = `
You are generating a personalized care package recommendation for a cancer patient.
The patient's treatment plan has been mapped to specific product recommendations
by our protocol intelligence engine. Your job is to:

1. Write a warm, personal note for each kit explaining why these specific items
   were selected for their specific treatment regimen
2. Add timing notes ("Start using this the night before your first infusion")
3. Flag critical timing constraints in plain language
4. If the patient has expressed interest in cold capping, add relevant context
5. Adjust language for the kit's audience:
   - If purchased by the patient: "you" language, practical and empowering
   - If purchased as a gift: include a card message for the giver to personalize
   - If subsidized by nonprofit: warm, dignified, no "charity" framing

Patient profile:
{patientProfile}

Treatment plan:
{treatmentPlan}

Protocol-recommended items:
{protocolRecommendations}

Purchase context: {purchaseContext} (self / gift / corporate / nonprofit)

Generate:
1. Kit name (warm, not clinical — e.g., "Your First Week Essentials" not "Cycle 1 Pre-Treatment Bundle")
2. Kit description (2-3 sentences, empathetic and practical)
3. Per-item timing notes
4. Personalized note to include in the kit
5. If gift: suggested card message for the sender
`;
```

---

## 4. Kit Builder Engine

### 4.1 Kit Tiers

Three pricing tiers per kit — same core clinical essentials, different levels of comfort and HM hero products:

```typescript
type KitTier = "essentials" | "comfort" | "complete";

interface KitTierDefinition {
  tier: KitTier;
  name: string;
  description: string;
  includes: string;
  priceRange: string;
  margin: string;
}

const KIT_TIERS: KitTierDefinition[] = [
  {
    tier: "essentials",
    name: "Essentials",
    description: "The clinical must-haves — everything your oncology nurse would tell you to get",
    includes: "Clinical essentials + printed timing guide + digital resources",
    priceRange: "$45-65",
    margin: "30-40% (mostly commodity partner items)",
  },
  {
    tier: "comfort",
    name: "Comfort",
    description: "Essentials plus comfort items and one HM creative kit",
    includes: "Everything in Essentials + comfort items + HM infusion art kit + premium packaging",
    priceRange: "$85-120",
    margin: "45-55% (HM hero products pull margin up)",
  },
  {
    tier: "complete",
    name: "Complete Care",
    description: "The full treatment companion — every item you'll need, beautifully packaged",
    includes: "Everything in Comfort + full creative kit series + silk pillowcase + premium comfort items + caregiver kit",
    priceRange: "$150-220",
    margin: "55-65% (HM products dominate at this tier)",
  },
];
```

### 4.2 Kit Types by Treatment Phase

```typescript
const KIT_TYPES = {
  // Pre-treatment kits (ship 5-7 days before treatment starts)
  PRE_SURGERY: {
    name: "Surgery Prep & Recovery Kit",
    trigger: "Surgery scheduled",
    shipBefore: "5 days before surgery date",
    essentialItems: [
      "button_front_shirts",           // Can't raise arms post-mastectomy
      "post_surgical_pillow",          // Mastectomy pillow for sleeping/seatbelt
      "drain_management_belt",         // For JP drains
      "gentle_body_wash",
      "scar_care_starter",             // For after incisions heal
      "surgical_prep_guide",           // What to expect, what to bring, questions to ask
    ],
  },
  
  PRE_CHEMO: {
    name: "Treatment Essentials Kit",
    trigger: "Chemotherapy start date set",
    shipBefore: "7 days before first infusion",
    essentialItems: [
      "biotene_mouthwash",
      "biotene_toothpaste",
      "healios_oral_rinse",
      "soft_toothbrush",
      "digital_thermometer",
      "tylenol",
      "stool_softener",
      "ginger_chews",
      "electrolyte_packets",
      "anti_nausea_bands",
      "treatment_guide",               // Regimen-specific: what to expect cycle by cycle
    ],
  },
  
  INFUSION_COMPANION: {
    name: "Infusion Day Companion",
    trigger: "First infusion approaching",
    shipBefore: "3 days before first infusion",
    essentialItems: [
      "infusion_art_kit",              // HM hero product
      "infusion_blanket",
      "lip_balm",
      "hard_candies",                  // For metallic taste
      "snack_pack",
      "port_comfort_pillow",
      "headphones_or_earplugs",
      "infusion_journal",              // HM hero product
    ],
  },
  
  COLD_CAP_STARTER: {
    name: "Cold Capping Guide & Scalp Care",
    trigger: "Patient indicates interest in cold capping",
    shipBefore: "10 days before first infusion (needs time to arrange rental)",
    essentialItems: [
      "cold_cap_comprehensive_guide",  // Rental options, process, success rates by regimen
      "gentle_shampoo",
      "wide_tooth_comb",
      "silk_pillowcase",
      "scalp_moisturizer",
      "soft_headband",                 // For during capping sessions
    ],
  },
  
  RADIATION_CARE: {
    name: "Radiation Skin Care Kit",
    trigger: "Radiation treatment start date set",
    shipBefore: "3 days before first fraction",
    essentialItems: [
      "aquaphor",
      "aloe_vera_pure",
      "calendula_cream",
      "gentle_unscented_soap",
      "soft_cotton_bras",              // No underwire during radiation
      "radiation_skin_guide",          // When to apply what, what to avoid
    ],
  },
  
  ENDOCRINE_STARTER: {
    name: "Long-Term Therapy Companion",
    trigger: "Endocrine therapy prescribed",
    shipBefore: "Before start date",
    essentialItems: [
      "joint_comfort_guide",           // Exercise, stretching, supplements for AI joint pain
      "bone_health_guide",
      "hot_flash_management_kit",
      "menopause_symptom_guide",
      "pill_organizer",
      "long_term_therapy_journal",     // HM hero product — 5-year treatment journal
    ],
  },
  
  HAIR_TRANSITION: {
    name: "Hair Transition Kit",
    trigger: "Day 10 of first chemo cycle (for high-alopecia regimens)",
    shipBefore: "Day 10 of cycle 1",
    essentialItems: [
      "wig_resource_directory",
      "headwear_starter_set",          // 2-3 comfortable head coverings
      "scalp_care_products",
      "gentle_shaving_guide",          // If they choose to shave
      "hair_donation_info",            // If they want to donate before it falls out
      "regrowth_timeline_guide",       // What to expect: when, texture, color
    ],
  },
  
  SURVIVORSHIP_TRANSITION: {
    name: "Next Chapter Kit",
    trigger: "Last active treatment session completed",
    shipBefore: "1-3 days after final treatment",
    essentialItems: [
      "survivorship_journal",          // HM hero product — reflection + forward-looking
      "milestone_marker",              // HM hero product — ceramic or art piece marking completion
      "self_care_essentials",          // Treats for the post-treatment phase
      "survivorship_guide",            // What to expect: scanxiety, new normal, follow-up schedule
      "regrowth_care_kit",            // Hair, skin, nail recovery products
      "celebration_card",              // Beautiful card they can frame or share
    ],
  },
  
  CAREGIVER_KIT: {
    name: "Caregiver Support Kit",
    trigger: "Can be added to any patient kit",
    shipBefore: "Same timing as patient kit",
    essentialItems: [
      "caregiver_journal",             // HM hero product
      "caregiver_resource_guide",      // Support groups, respite care, self-care
      "comfort_items",                 // Tea, candle, stress relief
      "meal_planning_guide",           // Easy recipes for chemo-friendly meals
      "caregiver_affirmation_deck",    // HM hero product
    ],
  },
};
```

---

## 5. Gift & Registry System

### 5.1 The Gift Problem

When someone you love gets diagnosed, you want to DO something. But you don't know what they need, when they need it, or whether they already have it. You end up sending flowers (that need care they don't have energy for), food (that they may not be able to eat during chemo), or gift cards (that feel impersonal).

The platform solves this with a **treatment-aware gift registry**.

### 5.2 How It Works

```
Patient gets diagnosed → Platform generates recommended kit sequence
       ↓
Patient enables gift registry (opt-in)
       ↓
Patient gets a shareable registry link
       ↓
Friends/family visit registry → See exactly what's needed and when
       ↓
Friends/family purchase specific items or contribute to a kit
       ↓
Items ship at the right time in the treatment calendar
       ↓
Patient receives care from the people who love them, perfectly timed
```

### 5.3 Registry Design

```typescript
interface PatientRegistry {
  registryId: string;
  patientId: string;
  
  // Privacy
  shareableUrl: string;                 // Unique, unguessable URL
  patientDisplayName: string;           // Can use first name only or pseudonym
  privacyLevel: "name_and_diagnosis" | "name_only" | "anonymous";
  // CRITICAL: Registry NEVER reveals specific diagnosis details unless patient explicitly opts in
  // Default: shows kit names and item categories, not treatment specifics
  // "Sarah's Treatment Essentials Kit" not "Sarah's AC-T Chemotherapy Kit"
  
  // Status
  isActive: boolean;
  activatedAt: string;
  
  // Items
  registryItems: {
    itemId: string;
    productId: string;
    productName: string;
    category: ProductCategory;
    price: number;
    
    // Status
    status: "needed" | "purchased" | "shipped" | "delivered";
    purchasedBy: string | null;         // Giver's name
    purchasedAt: string | null;
    
    // Timing
    idealDeliveryDate: string;
    urgencyNote: string | null;          // "Needed before Dec 15th" (patient's chemo start)
    
    // Grouping
    kitId: string | null;               // Which kit this belongs to
    canPurchaseIndividually: boolean;
    
    // Patient customization
    patientNote: string | null;          // "I already have a blanket, but could really use this"
    priorityOverride: string | null;     // Patient can deprioritize items they already have
  }[];
  
  // Contribution option
  allowMonetaryContributions: boolean;   // "Contribute to Sarah's care fund"
  contributionBalance: number;           // Applied to kits the patient selects
  
  // Messages
  giftMessages: {
    senderId: string;
    senderName: string;
    message: string;
    sentAt: string;
    attachedToItemId: string | null;
  }[];
}
```

### 5.4 Gift UX Flow

**For the giver:**
1. Receive registry link from patient (or from someone who shared it)
2. See a warm, well-designed page: patient's name, a note from them (optional), and a list of items/kits organized by treatment phase
3. Each item shows: name, description (patient-friendly, not clinical), price, and whether it's been purchased
4. Can buy individual items, whole kits, or contribute to the care fund
5. Can add a personal message
6. Payment processed → item added to next fulfillment batch → ships at the right time
7. Patient receives notification: "[Name] sent you [item] with a note: [message]"

**For the patient:**
1. After kit sequence is generated, see option: "Would you like to create a gift registry so friends and family can help?"
2. Choose privacy level
3. Review and customize recommended items (remove what you have, add notes)
4. Get shareable link
5. Track what's been purchased, read messages
6. Optional: share on social media, text to friends, or send directly from platform

### 5.5 Gift Card Option

For givers who don't want to pick specific items:

```typescript
interface CareGiftCard {
  amount: number;                       // $25, $50, $100, $150, custom
  recipientEmail: string;               // Or delivered via platform if recipient has account
  senderName: string;
  personalMessage: string;
  designTemplate: string;               // Warm, tasteful design options
  deliveryDate: string;                 // Can schedule for a specific date
  
  // Redemption
  redeemableFor: "any_kit_or_item";     // Can be applied to any purchase
  expiresAt: string;                    // 12 months
}
```

---

## 6. Corporate Wellness Channel

### 6.1 The Value Proposition

When an employee is diagnosed with cancer, their employer's HR team wants to support them but often doesn't know how. Most corporate wellness programs cover mental health and gym memberships but have zero cancer-specific support. This is a gap — and one that HR teams will pay to fill.

### 6.2 Corporate Product

```typescript
interface CorporateWellnessPackage {
  companyId: string;
  companyName: string;
  
  // Package tier
  tier: "basic" | "standard" | "premium";
  
  // What's included
  basic: {
    // Per-employee diagnosed
    careKitBudget: number;              // $100 credit toward care kits
    platformAccess: boolean;            // Full platform access for employee
    description: "Care kit credit + platform access for diagnosed employees";
  };
  standard: {
    careKitBudget: number;              // $200 credit
    platformAccess: boolean;
    caregiverKitIncluded: boolean;      // Kit for spouse/partner too
    quarterlyWellnessCheckin: boolean;  // Platform sends quarterly care package during treatment
    description: "Enhanced care kits + caregiver support + ongoing care";
  };
  premium: {
    careKitBudget: number;              // $500 credit
    platformAccess: boolean;
    caregiverKitIncluded: boolean;
    quarterlyWellnessCheckin: boolean;
    familyAccess: boolean;              // Platform access for immediate family
    returnToWorkKit: boolean;           // Transition kit for returning to work
    artTherapySubscription: boolean;    // Monthly HM art therapy kit during treatment
    description: "Comprehensive care + family support + return-to-work transition";
  };
  
  // Billing
  billingModel: "per_employee_diagnosed" | "annual_subscription" | "per_use";
  annualBudget: number | null;
  perEmployeeCap: number | null;
  
  // Privacy
  // CRITICAL: Employer NEVER learns diagnosis details
  // Employer sees: "1 employee activated wellness benefit" — no names, no diagnosis
  employeePrivacyGuarantee: true;
  
  // Admin
  hrAdminPortal: boolean;               // HR can see aggregate usage (not individual)
  invoicing: "monthly" | "quarterly";
}
```

### 6.3 Sales Motion

This is a B2B sale — straight from HM's existing playbook with Jane Street, Google, Meta:

1. **Entry point:** HR/People team at companies HM already serves for corporate events
2. **Pitch:** "Your benefits package covers gym memberships but not cancer treatment support. 1 in 8 women will be diagnosed with breast cancer. Here's what your employees go through — and here's what a $200/employee benefit looks like."
3. **Proof point:** Testimonials from platform patients (with consent), clinical evidence for care kit items, comparison to cost of employee turnover during cancer treatment ($50K+ to replace an employee vs. $200 benefit)
4. **Expansion:** Start with cancer → expand to other serious illness support packages

---

## 7. Nonprofit Subsidy Channel

### 7.1 The Equity Imperative

Care packages shouldn't only be available to patients who can afford them. The platform's Financial Assistance Finder already identifies patients facing financial hardship. This channel provides subsidized or free kits to those patients.

### 7.2 Subsidy Model

```typescript
interface SubsidyProgram {
  // Funding sources
  fundingSources: {
    type: "nonprofit_grant" | "corporate_sponsor" | "community_donation" | "platform_revenue";
    organizationName: string;
    annualBudget: number;
    eligibilityCriteria: string;         // "Patients at or below 200% FPL"
  }[];
  
  // Eligibility (derived from Financial Assistance Finder data)
  eligibilityCriteria: {
    incomeThreshold: number | null;      // % of Federal Poverty Level
    insuranceStatus: string[] | null;    // "uninsured", "medicaid", "underinsured"
    geographicRestriction: string | null;
    diagnosisRestriction: string | null;
  };
  
  // What's subsidized
  subsidyLevel: "full" | "partial";
  partialSubsidyPercent: number | null;  // e.g., 75% — patient pays 25%
  maxKitValue: number;                   // Maximum kit value covered
  
  // Dignity-preserving design
  // CRITICAL: Subsidized kits are IDENTICAL in packaging and quality to purchased kits
  // No "charity" branding. No cheaper products. The patient should not feel lesser.
  // The only difference: payment source is the subsidy fund, not the patient.
  identicalPackaging: true;
  identicalProducts: true;
  noDifferentiation: true;
}
```

### 7.3 Nonprofit Partnerships

Target partnerships with organizations that already fund patient support:

- **Cancer Care** — already funds patient support services
- **BCRF (Breast Cancer Research Foundation)** — research + patient support
- **Living Beyond Breast Cancer** — survivorship support
- **Susan G. Komen** — largest breast cancer nonprofit
- **Young Survival Coalition** — young women with breast cancer
- **Metavivor** — metastatic breast cancer (most underfunded)
- **Patient Advocate Foundation** — financial assistance navigation
- **Corporate sponsors** — pharma companies with patient assistance programs (Genentech, Pfizer, Lilly)

**Revenue model:** Platform handles fulfillment and curation; nonprofit provides funding. Platform charges cost + modest markup (15-20%) — enough to sustain operations but not extractive. Nonprofits get impact reporting: "Your grant funded 340 care kits reaching 340 patients in Q1, with a 94% 'this made treatment easier' rating."

---

## 8. Fulfillment Architecture

### 8.1 Hybrid Model

```
┌──────────────────────────────────────────────────────────────┐
│                      Order Received                           │
│                           │                                   │
│              ┌────────────┼────────────┐                      │
│              ▼            ▼            ▼                      │
│         HM Items     Partner Items   Digital Items            │
│              │            │            │                      │
│     ┌────────┘      ┌─────┘            └──────┐              │
│     ▼               ▼                         ▼              │
│  HM Warehouse   3PL Partner              Platform             │
│  (NYC / NJ)     (ShipBob or              Delivery             │
│                  similar)                (email/app)           │
│     │               │                         │              │
│     └───────┬───────┘                         │              │
│             ▼                                 │              │
│     Assembly Point                            │              │
│     (3PL or HM)                              │              │
│             │                                 │              │
│             ▼                                 │              │
│     Kit Assembled                             │              │
│     + Branded Packaging                       │              │
│     + Personal Note                           │              │
│     + Printed Guide                           │              │
│             │                                 │              │
│             ▼                                 ▼              │
│        ┌────┴────┐                    Digital Delivery        │
│        ▼         ▼                    (immediate)            │
│    Standard    Expedited                                     │
│    (3-5 day)   (1-2 day)                                    │
│                (for time-                                    │
│                 critical)                                    │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Fulfillment Partners

```typescript
interface FulfillmentConfig {
  // HM-manufactured hero products
  hmProducts: {
    warehouseLocation: string;           // NYC area — same as HM operations
    inventoryManagement: "in_house";
    leadTime: string;                    // "1-2 days to 3PL assembly point"
    minimumStock: Record<string, number>; // Per-product minimum inventory levels
  };
  
  // Partner/commodity products
  partnerProducts: {
    fulfillmentPartner: "shipbob" | "shopify_fulfillment" | "amazon_mcf";
    warehouseLocations: string[];
    inventoryManagement: "3pl_managed";
    leadTime: string;                    // "Same-day pick and pack"
    minimumStock: Record<string, number>;
  };
  
  // Assembly
  assembly: {
    assemblyPoint: string;               // 3PL location where kits are assembled
    packagingSupplier: string;           // Custom branded boxes, tissue, cards
    assemblyTime: string;                // "2-4 hours for standard kit"
    qualityCheck: boolean;               // Every kit inspected before ship
  };
  
  // Shipping
  shipping: {
    carriers: string[];                  // USPS, UPS, FedEx
    standardShipping: string;            // "3-5 business days"
    expeditedShipping: string;           // "1-2 business days"
    freeShippingThreshold: number;       // $75+ orders ship free
    // Time-critical orders auto-upgrade to expedited at no extra charge
    autoExpediteForTimeCritical: boolean;
  };
}
```

### 8.3 Inventory Strategy

```typescript
// Start lean — pre-stock top-selling items, drop-ship or JIT for long-tail

interface InventoryTier {
  tier: "always_in_stock" | "replenish_weekly" | "made_to_order" | "drop_ship";
  products: string[];
  rationale: string;
}

const INVENTORY_TIERS: InventoryTier[] = [
  {
    tier: "always_in_stock",
    products: [
      // HM hero products (high margin, unique)
      "infusion_art_kit",
      "infusion_journal",
      "survivorship_journal",
      "caregiver_journal",
      "milestone_marker",
      // Top commodity essentials (high volume)
      "biotene_mouthwash",
      "biotene_toothpaste",
      "healios_oral_rinse",
      "ginger_chews",
      "electrolyte_packets",
    ],
    rationale: "Core items that appear in >50% of kits. Must never be out of stock.",
  },
  {
    tier: "replenish_weekly",
    products: [
      "soft_toothbrush",
      "aquaphor",
      "stool_softener",
      "anti_nausea_bands",
      "silk_pillowcase",
      "port_comfort_pillow",
    ],
    rationale: "Common items but lower velocity. Weekly restock from distributor.",
  },
  {
    tier: "made_to_order",
    products: [
      // Personalized items
      "custom_reflection_deck",         // HM product with personalized prompts
      "personalized_milestone_piece",   // Custom ceramics piece
    ],
    rationale: "HM-manufactured items with personalization. 3-5 day lead time.",
  },
  {
    tier: "drop_ship",
    products: [
      "button_front_shirts",
      "compression_socks",
      "ice_mitts_booties",
      "post_surgical_pillow",
      "drain_management_belt",
    ],
    rationale: "Specialty items — ship direct from supplier. Add 1-2 days.",
  },
];
```

---

## 9. E-Commerce Platform

### 9.1 Technology Stack

Build on the existing platform stack — not a separate Shopify store:

```typescript
// Integrated into existing Next.js app
// Use Stripe for payments (already industry standard, HIPAA-compliant with BAA)
// Use Stripe Connect for split payments (HM vs partner fulfillment)

interface CommerceStack {
  payments: "stripe";                    // Stripe Checkout + Stripe Elements
  taxCalculation: "stripe_tax";         // Automatic tax calculation
  shippingRates: "shippo" | "easypost"; // Real-time shipping rate calculation
  subscriptions: "stripe_billing";      // For corporate wellness recurring billing
  giftCards: "stripe";                  // Gift card issuance and redemption
  analytics: "posthog" | "mixpanel";    // Commerce-specific event tracking
  email: "resend" | "postmark";         // Transactional emails (order confirmation, shipping, etc.)
  inventory: "custom";                  // Simple inventory tracking in Postgres
}
```

### 9.2 Routes

```
/care                              Care hub home — personalized kit recommendations
/care/kits                         Browse all kit types
/care/kits/[kitId]                 Individual kit detail page
/care/items                        Browse individual items
/care/items/[itemId]               Individual item detail page
/care/builder                      Custom kit builder (mix and match)
/care/cart                         Shopping cart
/care/checkout                     Stripe Checkout integration
/care/orders                       Order history and tracking
/care/orders/[orderId]             Individual order detail + tracking

/care/registry                     Patient's own registry management
/care/registry/setup               Create/configure registry
/care/registry/[registryUrl]       Public registry page (for givers)
/care/gift-card                    Purchase a care gift card

/care/corporate                    Corporate wellness landing page
/care/corporate/dashboard          Corporate admin dashboard
/care/corporate/setup              Corporate plan setup

/admin/care                        Internal care commerce admin
/admin/care/products               Product catalog management
/admin/care/inventory              Inventory levels and alerts
/admin/care/orders                 Order management
/admin/care/fulfillment            Fulfillment pipeline
/admin/care/protocols              Protocol-to-product mapping editor
/admin/care/subsidies              Subsidy program management
```

---

## 10. Data Model

```sql
-- Product catalog
CREATE TABLE care_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,               -- ProductCategory enum
  
  -- Sourcing
  source_type TEXT NOT NULL,            -- "hm_manufactured", "partner", "digital"
  supplier_name TEXT,
  supplier_sku TEXT,
  cost_per_unit DECIMAL(10,2),
  
  -- Pricing
  retail_price DECIMAL(10,2) NOT NULL,
  bundle_price DECIMAL(10,2),           -- Discounted price when in a kit
  
  -- Inventory
  fulfillment_tier TEXT NOT NULL,       -- "always_in_stock", "replenish_weekly", etc.
  current_stock INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  
  -- Content
  image_urls TEXT[],
  clinical_rationale TEXT,              -- Why this product helps (used in kit descriptions)
  usage_instructions TEXT,
  
  -- Metadata
  weight_oz DECIMAL(6,2),              -- For shipping calculation
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protocol-to-product mappings
CREATE TABLE protocol_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_code TEXT NOT NULL,           -- "AC-T", "TCHP", etc.
  product_id UUID REFERENCES care_products(id),
  category TEXT NOT NULL,
  timing TEXT NOT NULL,                  -- "before_treatment_starts", "cycle_1", etc.
  priority TEXT NOT NULL,                -- "essential", "recommended", "nice_to_have"
  clinical_rationale TEXT NOT NULL,
  evidence_base TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kit templates
CREATE TABLE care_kit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_type TEXT NOT NULL,                -- "PRE_CHEMO", "INFUSION_COMPANION", etc.
  tier TEXT NOT NULL,                    -- "essentials", "comfort", "complete"
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  
  -- Contents
  product_ids UUID[] NOT NULL,
  
  -- Timing
  trigger_condition TEXT NOT NULL,       -- When this kit should be recommended
  ship_before_rule TEXT NOT NULL,        -- "7 days before chemo start"
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated kit sequences (per patient)
CREATE TABLE patient_kit_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Treatment plan snapshot (at time of generation)
  treatment_plan JSONB NOT NULL,
  
  -- Generated sequence
  kit_sequence JSONB NOT NULL,           -- GeneratedKitSequence structure
  
  -- Status
  status TEXT DEFAULT 'generated',       -- generated, reviewed, active, completed
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE care_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,     -- Human-readable order number
  
  -- Customer
  customer_type TEXT NOT NULL,           -- "patient", "gift", "corporate", "nonprofit"
  patient_id UUID REFERENCES patients(id),
  purchaser_email TEXT NOT NULL,
  purchaser_name TEXT NOT NULL,
  
  -- Shipping
  shipping_address JSONB NOT NULL,
  shipping_method TEXT NOT NULL,         -- "standard", "expedited"
  shipping_cost DECIMAL(10,2),
  estimated_delivery DATE,
  
  -- Items
  items JSONB NOT NULL,                  -- Array of {productId, quantity, unitPrice, isKitItem}
  kit_id UUID REFERENCES care_kit_templates(id),
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Payment
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded, failed
  
  -- Subsidy (if applicable)
  subsidy_program_id UUID,
  subsidy_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Gift (if applicable)
  is_gift BOOLEAN DEFAULT FALSE,
  gift_message TEXT,
  gift_sender_name TEXT,
  registry_id UUID,
  
  -- Fulfillment
  fulfillment_status TEXT DEFAULT 'pending',  -- pending, processing, assembled, shipped, delivered
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Personalization
  personal_note TEXT,                    -- Claude-generated note included in kit
  includes_printed_guide BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift registries
CREATE TABLE care_registries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) UNIQUE,
  
  -- Access
  shareable_url TEXT UNIQUE NOT NULL,
  privacy_level TEXT NOT NULL,           -- "name_and_diagnosis", "name_only", "anonymous"
  patient_display_name TEXT NOT NULL,
  
  -- Preferences
  allow_monetary_contributions BOOLEAN DEFAULT TRUE,
  contribution_balance DECIMAL(10,2) DEFAULT 0,
  patient_note TEXT,                     -- Note displayed on registry page
  
  is_active BOOLEAN DEFAULT TRUE,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registry items
CREATE TABLE registry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_id UUID REFERENCES care_registries(id),
  product_id UUID REFERENCES care_products(id),
  kit_template_id UUID REFERENCES care_kit_templates(id),
  
  -- Status
  status TEXT DEFAULT 'needed',          -- needed, purchased, shipped, delivered
  priority TEXT DEFAULT 'recommended',
  patient_note TEXT,                     -- Patient's note about this item
  
  -- Purchase tracking
  purchased_by_name TEXT,
  purchased_by_email TEXT,
  purchased_at TIMESTAMPTZ,
  order_id UUID REFERENCES care_orders(id),
  gift_message TEXT,
  
  -- Timing
  ideal_delivery_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift card balance tracking
CREATE TABLE care_gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  
  -- Value
  original_amount DECIMAL(10,2) NOT NULL,
  remaining_balance DECIMAL(10,2) NOT NULL,
  
  -- Parties
  purchaser_email TEXT NOT NULL,
  purchaser_name TEXT NOT NULL,
  recipient_email TEXT,
  recipient_patient_id UUID REFERENCES patients(id),
  personal_message TEXT,
  
  -- Status
  status TEXT DEFAULT 'active',          -- active, redeemed, expired
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  redeemed_at TIMESTAMPTZ,
  
  -- Payment
  stripe_payment_intent_id TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Corporate wellness accounts
CREATE TABLE corporate_wellness_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  
  -- Plan
  tier TEXT NOT NULL,                    -- "basic", "standard", "premium"
  per_employee_budget DECIMAL(10,2),
  annual_budget DECIMAL(10,2),
  billing_model TEXT NOT NULL,
  
  -- Admin
  admin_email TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  
  -- Privacy
  employee_privacy_guarantee BOOLEAN DEFAULT TRUE,
  
  -- Usage (aggregate only — never individual)
  total_activations INTEGER DEFAULT 0,
  total_kits_sent INTEGER DEFAULT 0,
  total_spend DECIMAL(10,2) DEFAULT 0,
  
  -- Billing
  stripe_customer_id TEXT,
  billing_frequency TEXT DEFAULT 'monthly',
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subsidy programs
CREATE TABLE subsidy_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  funding_organization TEXT NOT NULL,
  
  -- Budget
  total_budget DECIMAL(10,2) NOT NULL,
  remaining_budget DECIMAL(10,2) NOT NULL,
  per_patient_max DECIMAL(10,2),
  
  -- Eligibility
  eligibility_criteria JSONB NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  
  -- Impact tracking
  patients_served INTEGER DEFAULT 0,
  kits_funded INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_care_orders_patient ON care_orders(patient_id, created_at DESC);
CREATE INDEX idx_care_orders_status ON care_orders(fulfillment_status);
CREATE INDEX idx_care_orders_number ON care_orders(order_number);
CREATE INDEX idx_registry_items_registry ON registry_items(registry_id, status);
CREATE INDEX idx_protocol_mappings_protocol ON protocol_product_mappings(protocol_code);
CREATE INDEX idx_kit_sequences_patient ON patient_kit_sequences(patient_id);
CREATE INDEX idx_care_products_category ON care_products(category, is_active);
CREATE INDEX idx_care_products_sku ON care_products(sku);
```

---

## 11. API & tRPC Router Definitions

```typescript
const careRouter = router({
  // Kit recommendations (from treatment plan)
  getRecommendedKits: protectedProcedure
    .query(async ({ ctx }) => {
      // Uses patient's treatment plan to generate personalized kit sequence
      // Returns GeneratedKitSequence
    }),

  regenerateKits: protectedProcedure
    .input(z.object({ treatmentPlanOverrides: z.any().optional() }))
    .mutation(async ({ ctx, input }) => {
      // Re-generate if treatment plan changed
    }),

  // Browsing
  getKitTemplates: publicProcedure
    .input(z.object({ kitType: z.string().optional(), tier: z.string().optional() }))
    .query(async ({ input }) => { }),

  getKitDetail: publicProcedure
    .input(z.object({ kitId: z.string() }))
    .query(async ({ input }) => { }),

  getProducts: publicProcedure
    .input(z.object({ category: z.string().optional(), search: z.string().optional() }))
    .query(async ({ input }) => { }),

  getProductDetail: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => { }),

  // Cart
  getCart: protectedProcedure
    .query(async ({ ctx }) => { }),

  addToCart: protectedProcedure
    .input(z.object({
      productId: z.string().optional(),
      kitId: z.string().optional(),
      quantity: z.number().default(1),
      isGift: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => { }),

  updateCartItem: protectedProcedure
    .input(z.object({ cartItemId: z.string(), quantity: z.number() }))
    .mutation(async ({ ctx, input }) => { }),

  removeFromCart: protectedProcedure
    .input(z.object({ cartItemId: z.string() }))
    .mutation(async ({ ctx, input }) => { }),

  // Checkout
  createCheckoutSession: protectedProcedure
    .input(z.object({
      shippingAddress: z.any(),
      shippingMethod: z.enum(["standard", "expedited"]),
      giftMessage: z.string().optional(),
      giftCardCode: z.string().optional(),
      subsidyProgramId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Creates Stripe Checkout Session
    }),

  // Orders
  getOrders: protectedProcedure
    .query(async ({ ctx }) => { }),

  getOrderDetail: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => { }),

  // Registry
  createRegistry: protectedProcedure
    .input(z.object({
      privacyLevel: z.enum(["name_and_diagnosis", "name_only", "anonymous"]),
      displayName: z.string(),
      patientNote: z.string().optional(),
      allowContributions: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => { }),

  getRegistry: protectedProcedure
    .query(async ({ ctx }) => { }),

  updateRegistryItem: protectedProcedure
    .input(z.object({
      itemId: z.string(),
      patientNote: z.string().optional(),
      priorityOverride: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => { }),

  // Public registry (for givers — no auth required)
  getPublicRegistry: publicProcedure
    .input(z.object({ registryUrl: z.string() }))
    .query(async ({ input }) => { }),

  purchaseRegistryItem: publicProcedure
    .input(z.object({
      registryUrl: z.string(),
      itemId: z.string(),
      purchaserEmail: z.string(),
      purchaserName: z.string(),
      giftMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => { }),

  contributeToRegistry: publicProcedure
    .input(z.object({
      registryUrl: z.string(),
      amount: z.number(),
      contributorEmail: z.string(),
      contributorName: z.string(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => { }),

  // Gift cards
  purchaseGiftCard: publicProcedure
    .input(z.object({
      amount: z.number(),
      purchaserEmail: z.string(),
      purchaserName: z.string(),
      recipientEmail: z.string().optional(),
      personalMessage: z.string().optional(),
      deliveryDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => { }),

  redeemGiftCard: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => { }),

  // Corporate
  getCorporateAccount: protectedProcedure
    .query(async ({ ctx }) => { }),

  activateCorporateBenefit: protectedProcedure
    .input(z.object({ companyCode: z.string() }))
    .mutation(async ({ ctx, input }) => { }),

  // Admin
  updateProduct: adminProcedure
    .input(z.object({ productId: z.string(), updates: z.any() }))
    .mutation(async ({ input }) => { }),

  updateInventory: adminProcedure
    .input(z.object({ productId: z.string(), adjustment: z.number(), reason: z.string() }))
    .mutation(async ({ input }) => { }),

  updateFulfillmentStatus: adminProcedure
    .input(z.object({
      orderId: z.string(),
      status: z.string(),
      trackingNumber: z.string().optional(),
      trackingUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => { }),

  getInventoryAlerts: adminProcedure
    .query(async () => { }),

  getSubsidyDashboard: adminProcedure
    .query(async () => { }),
});
```

---

## 12. Content & Item Database

### 12.1 Seed Product Catalog (Top 50 Items)

**Clinical Essentials:**
| SKU | Product | Approx Cost | Retail | Margin | Source |
|-----|---------|-------------|--------|--------|--------|
| CE-001 | Biotene Dry Mouth Mouthwash (16oz) | $5.50 | $8.99 | 39% | Partner |
| CE-002 | Biotene Gentle Toothpaste | $4.00 | $6.99 | 43% | Partner |
| CE-003 | Healios Oral Health Rinse (8oz) | $8.00 | $14.99 | 47% | Partner |
| CE-004 | Extra-Soft Toothbrush (2-pack) | $2.00 | $4.99 | 60% | Partner |
| CE-005 | Digital Thermometer (medical grade) | $4.00 | $9.99 | 60% | Partner |
| CE-006 | Benadryl Liquid (8oz) | $5.00 | $8.99 | 44% | Partner |
| CE-007 | Tylenol Extra Strength (100ct) | $6.00 | $10.99 | 45% | Partner |
| CE-008 | Docusate Sodium Stool Softener (60ct) | $3.00 | $6.99 | 57% | Partner |
| CE-009 | Sea-Band Anti-Nausea Wristbands | $4.50 | $9.99 | 55% | Partner |
| CE-010 | Aquaphor Healing Ointment (14oz) | $8.00 | $13.99 | 43% | Partner |
| CE-011 | Medical-Grade Ice Mitts (pair) | $12.00 | $24.99 | 52% | Partner |
| CE-012 | Medical-Grade Ice Booties (pair) | $12.00 | $24.99 | 52% | Partner |

**Nutrition:**
| SKU | Product | Approx Cost | Retail | Margin | Source |
|-----|---------|-------------|--------|--------|--------|
| NU-001 | Ginger Chews Variety Pack | $4.00 | $8.99 | 56% | Partner |
| NU-002 | Electrolyte Packets (24-pack) | $8.00 | $15.99 | 50% | Partner |
| NU-003 | Protein Shake Sampler (8-pack) | $12.00 | $22.99 | 48% | Partner |
| NU-004 | Hard Candy Variety (for metallic taste) | $3.00 | $6.99 | 57% | Partner |
| NU-005 | Time-Marked Water Bottle (32oz) | $6.00 | $14.99 | 60% | Partner |

**Comfort:**
| SKU | Product | Approx Cost | Retail | Margin | Source |
|-----|---------|-------------|--------|--------|--------|
| CO-001 | Infusion Blanket (soft, machine-washable) | $10.00 | $24.99 | 60% | Partner |
| CO-002 | Silk Pillowcase | $8.00 | $19.99 | 60% | Partner |
| CO-003 | Port Comfort Pillow + Seatbelt Guard | $8.00 | $18.99 | 58% | Partner |
| CO-004 | Organic Lip Balm Set (3-pack) | $3.00 | $7.99 | 62% | Partner |
| CO-005 | Compression Socks (2-pair) | $8.00 | $16.99 | 53% | Partner |

**HM Hero Products (the moat):**
| SKU | Product | Approx Cost | Retail | Margin | Source |
|-----|---------|-------------|--------|--------|--------|
| HM-001 | Infusion Art Kit — Watercolor Set | $8.00 | $29.99 | 73% | HM Manufactured |
| HM-002 | Infusion Art Kit — Sketching Set | $6.00 | $24.99 | 76% | HM Manufactured |
| HM-003 | Infusion Art Kit — Mini Ceramics (air-dry) | $7.00 | $29.99 | 77% | HM Manufactured |
| HM-004 | Treatment Journal (guided prompts) | $5.00 | $22.99 | 78% | HM Manufactured |
| HM-005 | Survivorship Journal | $5.00 | $22.99 | 78% | HM Manufactured |
| HM-006 | Caregiver Journal | $5.00 | $22.99 | 78% | HM Manufactured |
| HM-007 | Milestone Marker (ceramic, hand-finished) | $8.00 | $34.99 | 77% | HM Manufactured |
| HM-008 | Reflection Prompt Deck (52 cards) | $4.00 | $18.99 | 79% | HM Manufactured |
| HM-009 | Caregiver Affirmation Deck | $4.00 | $18.99 | 79% | HM Manufactured |
| HM-010 | Long-Term Therapy Journal (5-year) | $7.00 | $29.99 | 77% | HM Manufactured |
| HM-011 | Art Therapy Subscription Box (monthly) | $10.00/mo | $34.99/mo | 71% | HM Manufactured |
| HM-012 | German Paintbrush Set (premium) | $4.00 | $14.99 | 73% | HM Manufactured |

**Digital/Information Products:**
| SKU | Product | Cost | Price | Source |
|-----|---------|------|-------|--------|
| DG-001 | Cold Capping Comprehensive Guide | $0 | Included | Platform |
| DG-002 | Hair Transition Guide | $0 | Included | Platform |
| DG-003 | Regimen-Specific Treatment Guide | $0 | Included | Platform (Claude) |
| DG-004 | Wig Resource Directory | $0 | Included | Platform |
| DG-005 | Survivorship Transition Guide | $0 | Included | Platform |
| DG-006 | Caregiver Resource Guide | $0 | Included | Platform |
| DG-007 | Meal Planning Guide (chemo-friendly) | $0 | Included | Platform (Claude) |

### 12.2 Blended Margin Analysis

```
Kit Tier          Avg Items   HM Items   Partner Items   Blended Margin
─────────────────────────────────────────────────────────────────────────
Essentials        8-10        1-2        6-8             35-42%
Comfort           12-15       3-4        8-11            48-55%
Complete Care     18-22       6-8        10-14           55-62%

Gift Cards        N/A         N/A        N/A             100% (redeemed against kits)
Corporate         Varies      Varies     Varies          50-60% (premium pricing)
Subsidy           Same items  Same items Same items      15-20% (cost + modest markup)

Target blended margin across all channels: 45-55%
```

---

## 13. Build Sequence

### 13.1 Prerequisites

- Phase 1 stable with patient profiles and treatment plan data
- Stripe account with HIPAA BAA signed
- 3PL partner selected and onboarded (ShipBob recommended — Shopify integration, API, good for hybrid fulfillment)
- Initial product inventory sourced (top 20 items for soft launch)
- HM hero products designed and initial batch manufactured

### 13.2 Claude Code Sessions

```
SESSION C1: Product catalog + protocol mapping
  1. Prisma schema (care_products, protocol_product_mappings, care_kit_templates)
  2. Admin UI for product catalog management
  3. Seed product catalog (50 items from Section 12)
  4. Protocol-to-product mapping engine
     - Seed AC-T protocol mapping (most common, best-documented)
     - Seed 3 additional protocols (TCHP, radiation, mastectomy)
  5. Kit template system (essentials / comfort / complete tiers)
  6. Admin UI for protocol mapping editor
  7. Route stubs for /care/* pages

SESSION C2: Kit generation engine + patient UI
  1. Kit generation engine
     - Takes patient profile + treatment plan → generates kit sequence
     - Timing engine (calculate delivery dates from treatment calendar)
     - Time-criticality assessment (auto-expedite for critical timing)
  2. Claude-powered kit personalization
     - Personal notes for each kit
     - Per-item timing notes
     - Audience-aware language (self-purchase vs. gift)
  3. Patient care hub UI (/care)
     - "Your recommended kits" — timeline visualization
     - Kit detail pages with rationale
     - Individual item browsing
  4. Treatment plan integration
     - Pull treatment data from Phase 1 profile
     - "Treatment plan changed" → regenerate kit recommendations
  5. Custom kit builder (/care/builder)
     - Start from recommended kit, add/remove items
     - Show clinical rationale for each recommendation

SESSION C3: E-commerce + checkout
  1. Shopping cart (Postgres-backed, supports both kits and individual items)
  2. Stripe Checkout integration
     - Payment processing
     - Tax calculation (Stripe Tax)
     - Shipping rate calculation (Shippo/EasyPost API)
  3. Order management
     - Order creation from checkout
     - Order confirmation emails
     - Order status tracking
  4. Patient order history (/care/orders)
  5. Gift purchase flow
     - Gift message input
     - Ship-to-patient address
     - Gift notification to patient
  6. Gift card system
     - Purchase gift cards
     - Redemption at checkout
     - Balance tracking

SESSION C4: Gift registry
  1. Registry creation flow (/care/registry/setup)
     - Privacy level selection
     - Display name configuration
     - Auto-populate from recommended kits
     - Patient customization (notes, priority overrides)
  2. Public registry page (/care/registry/[url])
     - Beautiful, warm design (NOT a standard wedding registry feel)
     - Items organized by treatment phase
     - Purchase flow for givers (no account required)
     - Monetary contribution option
     - Gift message attachment
  3. Registry management for patient
     - Track purchased vs. needed items
     - Read gift messages
     - Share registry link
  4. Notification system
     - Patient notified when gift purchased
     - Giver notified when item ships/delivers
     - Registry reminder emails (for shared-but-not-acted-on links)

SESSION C5: Fulfillment pipeline + operations
  1. Fulfillment pipeline
     - Order → pick list generation (split by source: HM vs. partner)
     - Assembly instructions for 3PL (kit composition, personal note, guide)
     - Shipping label generation (Shippo/EasyPost)
     - Tracking number ingestion and status updates
  2. Inventory management
     - Stock level tracking per product
     - Reorder point alerts
     - Low stock notifications
     - Inventory adjustment logging
  3. Admin fulfillment dashboard (/admin/care)
     - Pending orders queue
     - Fulfillment pipeline visualization
     - Shipping status tracking
     - Returns/issues management
  4. 3PL API integration
     - ShipBob API for partner-fulfilled items
     - Inventory sync
     - Order routing
  5. Transactional emails
     - Order confirmation
     - Shipping notification with tracking
     - Delivery confirmation
     - "How was your kit?" feedback request (7 days post-delivery)

SESSION C6: Corporate + nonprofit channels
  1. Corporate wellness system
     - Corporate account management
     - Tier configuration (basic/standard/premium)
     - Employee activation flow (company code → benefit unlocked)
     - Privacy-preserving aggregate reporting for HR
     - Stripe billing (recurring for subscriptions)
  2. Corporate landing page and sales collateral (/care/corporate)
  3. Nonprofit subsidy system
     - Subsidy program management
     - Eligibility checking (from Financial Assistance Finder data)
     - Budget tracking and drawdown
     - Impact reporting for funders
  4. Subsidy application flow for patients
     - Dignity-preserving: identical packaging, no "charity" branding
     - Seamless checkout (subsidy applied automatically if eligible)
  5. Additional protocol mappings
     - Seed remaining breast cancer protocols (6-8 more regimens)
     - Begin framework for expansion to other cancer types

SESSION C7: Analytics + optimization
  1. Commerce analytics
     - Revenue by channel (direct, gift, corporate, nonprofit)
     - Kit tier distribution
     - Product-level performance (which items sell, which get removed from kits)
     - Cart abandonment tracking
     - Registry conversion rate
  2. Patient feedback integration
     - Post-delivery survey (5 questions, 60 seconds)
     - Per-item rating ("Was this helpful?")
     - Feed ratings back to protocol mapping (items that get poor ratings → review)
  3. Recommendation optimization
     - Track which items patients add vs. remove in custom builder
     - A/B test kit compositions
     - Community intelligence integration (INTEL community reports about product effectiveness)
  4. Inventory optimization
     - Demand forecasting from patient intake velocity
     - Seasonal patterns (if any)
     - Lead time optimization
```

### 13.3 Timeline Estimate

```
Session C1:  Week 1-2   (catalog + protocol mapping — products in system)
Session C2:  Week 2-4   (kit generation + patient UI — patients see recommendations)
Session C3:  Week 4-6   (e-commerce + checkout — patients can buy)
Session C4:  Week 6-8   (gift registry — friends/family can help)
Session C5:  Week 8-10  (fulfillment — kits actually ship)
Session C6:  Week 10-12 (corporate + nonprofit — all channels live)
Session C7:  Week 12-14 (analytics + optimization — data-driven improvement)

Total: ~14 weeks
MVP (C1-C3): 6 weeks — patients can buy personalized kits
Gift-ready (C1-C4): 8 weeks — registry live for friends/family
Full commerce (C1-C5): 10 weeks — end-to-end fulfillment
All channels (C1-C6): 12 weeks — corporate + nonprofit
Optimized (C1-C7): 14 weeks — data-driven refinement

SOFT LAUNCH: After C3 (week 6) — sell directly to platform beta users
PUBLIC LAUNCH: After C5 (week 10) — full e-commerce with fulfillment
```

### 13.4 HM Product Development Timeline (Parallel Track)

```
Week 1-2:   Design infusion art kits (3 variants: watercolor, sketch, mini ceramics)
Week 2-4:   Design treatment journal + survivorship journal
Week 3-5:   Source packaging — custom branded boxes, tissue, card stock
Week 4-6:   Prototype and test hero products with 5-10 beta patients
Week 5-7:   Iterate based on feedback
Week 6-8:   First production run (50-100 units of each hero product)
Week 8-10:  Production ramp based on demand signals

The art kits are the MOST IMPORTANT hero product to get right.
Nobody else can make them. They should be beautiful enough to photograph,
practical enough to use in an infusion chair with one hand tethered to an IV,
and emotionally resonant enough to make someone feel like a person, not a patient.
```
