# Access Gap Modules — Technical Specification v1.0

## Six Modules That Close the Gaps Where Patients Fall Through

**Author:** Rett (Happy Medium)
**Date:** March 2026
**Purpose:** Six standalone but interconnected modules, each targeting a specific system failure where patients die, suffer, or lose irreversible opportunities because the healthcare system fails to act. Each module leverages data the platform already collects to intervene at the moment it matters.

---

## Table of Contents

### Module 1: Fertility Preservation Navigator (FERTILITY)
### Module 2: Second Opinion Facilitation Engine (SECOND)
### Module 3: Trial Logistics Navigator (LOGISTICS)
### Module 4: Early Palliative Care Integration (PALLIATIVE)
### Module 5: Insurance Advocate (ADVOCATE)
### Module 6: Structured Peer Matching (PEERS)

---

# MODULE 1: FERTILITY PRESERVATION NAVIGATOR

## The Problem

A 32-year-old woman gets diagnosed with breast cancer. Within 48 hours she's making decisions about surgery. Within 2 weeks she's starting chemotherapy. Nobody mentions that:

- AC chemotherapy causes permanent ovarian failure in 40-70% of premenopausal women (higher rates with increasing age)
- The window for egg freezing or embryo cryopreservation is BEFORE chemo starts — typically 10-14 days for one ovarian stimulation cycle
- GnRH agonists (like Lupron) given during chemo can partially protect ovarian function, but the oncologist must prescribe this before cycle 1
- Ovarian tissue cryopreservation is available at select centers for patients who don't have time for egg retrieval
- Some breast cancer subtypes (ER+) have unique considerations — ovarian stimulation protocols must use letrozole to keep estrogen levels safe
- Fertility preservation is increasingly covered by insurance — many states now mandate coverage, and Livestrong's Fertility Fund covers costs for qualifying patients

Oncologists are focused on the cancer. Reproductive endocrinologists aren't in the treatment planning conversation. Nobody coordinates between them. The window closes permanently. The patient learns about this 6 months later when chemo is done and someone finally asks "do you want children?"

This is the cold-capping problem at a much higher stakes level. The platform knows the patient's age, diagnosis, and chemo regimen. It has everything needed to flag this on day one.

## Who This Affects

- All premenopausal women diagnosed with cancer requiring gonadotoxic treatment
- Men receiving gonadotoxic chemotherapy (sperm banking is simpler but equally overlooked)
- Adolescents and young adults (AYA) with cancer — the demographic most affected and least likely to receive counseling
- Trans and non-binary patients — specific considerations for fertility preservation that oncologists are even less likely to address

## Feature Set

### 1.1 Gonadotoxicity Risk Assessment

Triggered automatically when the platform has age + treatment plan:

```typescript
interface FertilityRiskAssessment {
  patientId: string;
  assessedAt: string;
  
  // Input data
  age: number;
  biologicalSex: "female" | "male";
  treatmentPlan: {
    chemotherapy?: { regimen: string; agentClasses: string[] };
    radiation?: { field: string; dose: string };
    surgery?: { type: string };
    endocrine?: { drug: string; duration: string };
  };
  
  // Risk calculation
  gonadotoxicityRisk: "high" | "moderate" | "low" | "unknown";
  riskFactors: {
    factor: string;                     // "Alkylating agent (cyclophosphamide) in AC regimen"
    contribution: string;               // "Cyclophosphamide is the most gonadotoxic agent in this regimen"
    evidenceBase: string;               // Citation
  }[];
  
  // Timing
  timeToTreatmentStart: number | null;  // Days until chemo starts
  preservationWindowDays: number;       // How many days they have to act
  isUrgent: boolean;                    // <14 days to treatment start
  windowStatus: "open" | "closing" | "closed";
  
  // Treatment-specific considerations
  specialConsiderations: string[];      // "ER+ cancer — stimulation protocol must include letrozole"
  
  // Recommendation
  recommendation: "strongly_recommended" | "recommended" | "consider" | "not_indicated";
  recommendationRationale: string;
}
```

#### Gonadotoxicity Classification

```typescript
const GONADOTOXICITY_BY_AGENT: Record<string, string> = {
  // HIGH RISK (>80% amenorrhea in women >30)
  "cyclophosphamide": "high",           // In AC, CMF, TC
  "ifosfamide": "high",
  "busulfan": "high",
  "melphalan": "high",
  "procarbazine": "high",
  "chlorambucil": "high",
  
  // MODERATE RISK
  "doxorubicin": "moderate",           // In AC
  "cisplatin": "moderate",
  "carboplatin": "moderate",           // In carboplatin-taxol
  
  // LOW RISK
  "paclitaxel": "low",                 // In AC-T, carboplatin-taxol
  "docetaxel": "low",                  // In TC, TCHP
  "5-fluorouracil": "low",
  "methotrexate": "low",
  "vincristine": "low",
  
  // MINIMAL/NO RISK
  "trastuzumab": "minimal",            // Herceptin
  "pertuzumab": "minimal",             // Perjeta
  "pembrolizumab": "minimal",          // Keytruda
  
  // Endocrine (indirect — delays childbearing by 5-10 years)
  "tamoxifen": "indirect_delay",       // 5-10 year course delays pregnancy
  "anastrozole": "indirect_delay",     // Postmenopausal only, but relevant for discussion
  "letrozole": "indirect_delay",
};

// Regimen-level risk (accounts for agent combination + cumulative dose)
const REGIMEN_GONADOTOXICITY: Record<string, { risk: string; amenorrheaRate: string }> = {
  "AC-T": { risk: "high", amenorrheaRate: "40-70% depending on age" },
  "dose-dense AC-T": { risk: "high", amenorrheaRate: "50-70%" },
  "TC": { risk: "high", amenorrheaRate: "30-60%" },
  "TCHP": { risk: "high", amenorrheaRate: "30-60%" },
  "CMF": { risk: "high", amenorrheaRate: "60-80%" },
  "carboplatin-taxol": { risk: "moderate", amenorrheaRate: "20-40%" },
  "pembrolizumab-chemo": { risk: "moderate_to_high", amenorrheaRate: "Varies by chemo backbone" },
};
```

### 1.2 Preservation Options Navigator

```typescript
interface PreservationOption {
  method: string;
  applicableTo: "female" | "male" | "both";
  timeRequired: string;                 // "10-14 days for one cycle"
  estimatedCost: string;                // "$6,000-15,000 for egg freezing + storage"
  insuranceCoverage: string;            // "Mandated in 12 states, Medicare does not cover"
  successRates: string;                 // "60-80% egg survival post-thaw, ~50% live birth rate per transfer"
  specialConsiderations: string[];
  urgencyLevel: string;                 // "Must complete BEFORE chemo starts"
  providerType: string;                 // "Reproductive endocrinologist"
}

const FEMALE_OPTIONS: PreservationOption[] = [
  {
    method: "Egg freezing (oocyte cryopreservation)",
    applicableTo: "female",
    timeRequired: "10-14 days for ovarian stimulation + retrieval",
    estimatedCost: "$6,000-15,000 per cycle + $500-1,000/year storage",
    insuranceCoverage: "Mandated for iatrogenic infertility in 12+ states. Many commercial plans now cover. Livestrong Fertility provides financial assistance.",
    successRates: "15-20 eggs typically retrieved per cycle. 60-80% egg survival rate post-thaw. ~50% live birth rate per transfer cycle for women under 35.",
    specialConsiderations: [
      "ER+ breast cancer: stimulation protocol MUST include letrozole to keep estrogen levels safe",
      "Can sometimes be done in the 2-3 week gap between diagnosis and chemo start",
      "Random-start protocols allow beginning at any point in menstrual cycle (no waiting)",
    ],
    urgencyLevel: "CRITICAL — must complete before first chemo dose",
    providerType: "Reproductive endocrinologist (REI)",
  },
  {
    method: "Embryo cryopreservation",
    applicableTo: "female",
    timeRequired: "10-14 days (same stimulation as egg freezing) + partner/donor sperm",
    estimatedCost: "$12,000-20,000 + storage",
    insuranceCoverage: "Similar to egg freezing. May have better coverage as established IVF procedure.",
    successRates: "Slightly higher per-embryo success rate than frozen eggs (~55-65% live birth rate per transfer for women under 35)",
    specialConsiderations: [
      "Requires partner or donor sperm at time of retrieval",
      "Legal considerations: embryos have more complex legal status than eggs in some jurisdictions",
      "Same ER+ protocol considerations as egg freezing",
    ],
    urgencyLevel: "CRITICAL — must complete before first chemo dose",
    providerType: "Reproductive endocrinologist (REI)",
  },
  {
    method: "GnRH agonist ovarian suppression (Lupron)",
    applicableTo: "female",
    timeRequired: "Injection 1-2 weeks before chemo, then monthly during chemo",
    estimatedCost: "$500-1,500/month (often covered by insurance as cancer supportive care)",
    insuranceCoverage: "Generally covered when prescribed by oncologist. ASCO endorses this approach.",
    successRates: "Reduces premature ovarian failure risk by ~50% based on POEMS and PROMISE trials. NOT a replacement for egg/embryo freezing — use in ADDITION to, not instead of.",
    specialConsiderations: [
      "Can be combined with egg freezing for maximum protection",
      "The oncologist must prescribe this — it's part of the chemo protocol",
      "Induces temporary menopause during treatment (hot flashes, etc.)",
      "ASCO 2018 guideline: should be offered to all premenopausal women receiving gonadotoxic chemo",
    ],
    urgencyLevel: "HIGH — must start before or with first chemo cycle",
    providerType: "Medical oncologist (prescribes directly)",
  },
  {
    method: "Ovarian tissue cryopreservation",
    applicableTo: "female",
    timeRequired: "Laparoscopic surgery — can be done in 1-2 days, no stimulation needed",
    estimatedCost: "$10,000-15,000 + storage",
    insuranceCoverage: "Limited — still considered experimental by some insurers",
    successRates: "Over 200 live births reported worldwide. No longer considered experimental as of ASRM 2019.",
    specialConsiderations: [
      "Best option when there's NO time for ovarian stimulation",
      "Only available at specialized centers",
      "Requires general anesthesia (surgical risk)",
      "Cannot be used for ER+ cancer — reimplantation could reintroduce hormone-responsive tissue",
    ],
    urgencyLevel: "EMERGENCY OPTION — when no time for stimulation",
    providerType: "Reproductive surgeon at specialized center",
  },
];

const MALE_OPTIONS: PreservationOption[] = [
  {
    method: "Sperm banking (semen cryopreservation)",
    applicableTo: "male",
    timeRequired: "1-3 visits over 1-2 weeks (ideally 2-3 samples)",
    estimatedCost: "$500-1,500 for banking + $200-500/year storage",
    insuranceCoverage: "Increasingly covered. Livestrong Fertility provides assistance.",
    successRates: "Sperm survive freezing well — 50-75% motility recovery post-thaw. Very high success rates with IVF/ICSI.",
    specialConsiderations: [
      "Simpler and faster than female options — should always be done before gonadotoxic treatment",
      "Can sometimes be done same-day or next-day if treatment is urgent",
      "Adolescent patients may require special counseling and support",
    ],
    urgencyLevel: "HIGH — complete before first chemo dose, but logistically straightforward",
    providerType: "Sperm bank / andrology lab (referral from oncologist)",
  },
];
```

### 1.3 Provider Directory

```typescript
interface FertilityProvider {
  id: string;
  name: string;
  type: "rei_clinic" | "sperm_bank" | "oncofertility_center";
  
  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  
  // Capabilities
  servicesOffered: string[];            // "egg_freezing", "embryo_freezing", "ovarian_tissue", etc.
  oncologyExperience: boolean;          // Has experience with cancer patients specifically
  randomStartProtocol: boolean;         // Can start stimulation at any point in cycle (critical for urgency)
  letrozoleProtocol: boolean;           // Has experience with letrozole co-treatment for ER+ patients
  weekendAvailability: boolean;         // Retrieval timing can't always wait for Monday
  
  // Financial
  acceptsInsurance: string[];
  offersFinancialAssistance: boolean;
  livestrongPartner: boolean;           // Livestrong Fertility discount partner
  avgCostEggFreezing: number | null;
  avgCostEmbryoFreezing: number | null;
  
  // Contact
  phone: string;
  urgentPhone: string | null;           // For time-critical referrals
  website: string;
  oncofertilityCoordinator: string | null;  // Name of person who handles cancer cases
}
```

Seed with oncofertility-experienced clinics from:
- Livestrong Fertility network (largest network)
- ASRM member clinics with oncofertility programs
- Major academic center REI departments (many have dedicated oncofertility tracks)

### 1.4 Financial Assistance for Fertility Preservation

```typescript
const FERTILITY_FINANCIAL_PROGRAMS = [
  {
    name: "Livestrong Fertility (Livestrong Foundation)",
    type: "discount_program",
    coverage: "Discounted rates at partner fertility clinics + free medication for qualifying patients",
    eligibility: "Any reproductive-age cancer patient",
    applicationProcess: "Online application, typically processed within 48 hours",
    url: "https://www.livestrong.org/what-we-do/program/fertility",
  },
  {
    name: "Team Maggie",
    type: "grant",
    coverage: "Up to $3,000 for fertility preservation costs",
    eligibility: "Women diagnosed with cancer, financial need",
    applicationProcess: "Online application",
    url: "https://teammaggie.org",
  },
  {
    name: "The SAMFund",
    type: "grant",
    coverage: "Grants for young adult cancer survivors including fertility preservation",
    eligibility: "Ages 17-39, cancer survivor",
    applicationProcess: "Annual grant cycle",
    url: "https://thesamfund.org",
  },
  {
    name: "Heartbeat Program (Ferring Pharmaceuticals)",
    type: "medication_assistance",
    coverage: "Free fertility medications for cancer patients",
    eligibility: "Cancer patients needing ovarian stimulation medications",
    applicationProcess: "Through participating fertility clinic",
    url: "https://www.heartbeatprogram.com",
  },
  {
    name: "State Insurance Mandates",
    type: "insurance_mandate",
    coverage: "Varies by state — full or partial coverage of fertility preservation for iatrogenic infertility",
    eligibility: "Residents of mandate states with qualifying insurance",
    states: ["CA", "CT", "CO", "DE", "IL", "MD", "NH", "NJ", "NY", "RI", "UT"],
    // NOTE: List is growing — check current status via RESOLVE.org
  },
];
```

### 1.5 Oncologist Communication Generator

The patient needs to have a conversation with their oncologist about fertility — and many don't know how to bring it up or what to ask. Claude generates a personalized discussion guide:

```typescript
const ONCOLOGIST_FERTILITY_DISCUSSION_PROMPT = `
Generate a personalized fertility preservation discussion guide for a cancer patient
to bring to their next oncology appointment.

Patient profile:
- Age: {age}
- Diagnosis: {diagnosis}
- Planned treatment: {treatmentPlan}
- Fertility risk level: {riskLevel}
- Time to treatment start: {daysToStart} days
- Relationship status: {relationshipStatus} (if provided)
- Existing children: {existingChildren} (if provided)

Generate:
1. A brief opening statement the patient can use: "I'd like to discuss how my treatment
   might affect my fertility and what preservation options are available."
2. 3-5 specific questions to ask, tailored to their regimen:
   - "What is the expected impact of [specific regimen] on my fertility?"
   - "Is there time for egg freezing before we start treatment?"
   - "Would you recommend GnRH agonist ovarian suppression during chemo?"
   - "Can you refer me to a reproductive endocrinologist with oncofertility experience?"
3. Key facts the patient should know going in (so they can advocate for themselves)
4. Timeline awareness: "I understand we have approximately [X] days before treatment starts"

TONE: Empowering, not adversarial. The oncologist is an ally who may simply be focused
on the cancer and hasn't brought this up yet. Frame as collaborative, not confrontational.
`;
```

### 1.6 Integration Points

**Trigger:** When a premenopausal patient's profile includes a gonadotoxic treatment plan, the fertility navigator activates automatically. This should appear as a prominent, time-sensitive alert — not buried in a settings menu.

**Treatment Translator:** Add fertility impact section to every treatment translation for premenopausal patients receiving gonadotoxic therapy.

**Care Packages (CARE):** When fertility preservation is indicated, the platform can include fertility-specific informational materials in the pre-treatment care kit.

**Financial Assistance Finder:** Cross-reference fertility preservation financial programs alongside treatment financial programs.

**Timeline:** The fertility preservation window is displayed on the same treatment timeline that drives care kit delivery scheduling.

### 1.7 Data Model Additions

```sql
CREATE TABLE fertility_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  gonadotoxicity_risk TEXT NOT NULL,
  risk_factors JSONB NOT NULL,
  preservation_window_days INTEGER,
  window_status TEXT NOT NULL,           -- open, closing, closed
  recommendation TEXT NOT NULL,
  recommendation_rationale TEXT,
  
  -- Options presented
  options_presented JSONB,
  
  -- Patient actions
  referral_requested BOOLEAN DEFAULT FALSE,
  referral_requested_at TIMESTAMPTZ,
  provider_id UUID,
  
  -- Outcome tracking
  preservation_pursued BOOLEAN,
  preservation_method TEXT,
  preservation_completed BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fertility_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  services_offered TEXT[],
  oncology_experience BOOLEAN DEFAULT FALSE,
  random_start_protocol BOOLEAN DEFAULT FALSE,
  letrozole_protocol BOOLEAN DEFAULT FALSE,
  weekend_availability BOOLEAN DEFAULT FALSE,
  accepts_insurance TEXT[],
  livestrong_partner BOOLEAN DEFAULT FALSE,
  phone TEXT,
  urgent_phone TEXT,
  website TEXT,
  oncofertility_coordinator TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.8 Claude Code Sessions

```
SESSION F1: Risk assessment + options navigator (Week 1-2)
  1. Prisma schema (fertility_assessments, fertility_providers)
  2. Gonadotoxicity risk calculation engine
     - Agent-level toxicity database
     - Regimen-level risk aggregation
     - Age-adjusted risk scoring
  3. Preservation options navigator
     - Female options with ER+ special considerations
     - Male options
     - Option comparison view
  4. Time-sensitivity alert system
     - Automatic trigger when premenopausal patient has gonadotoxic treatment plan
     - Prominent UI alert — NOT dismissable without acknowledgment
     - Countdown to treatment start
  5. Routes: /fertility, /fertility/assessment, /fertility/options

SESSION F2: Provider directory + financial + communications (Week 2-4)
  1. Provider directory with geographic search
     - Seed 50+ oncofertility providers from Livestrong network
     - Distance calculation from patient location
     - Filter by capabilities (random-start, letrozole, weekend)
  2. Financial assistance matching
     - Seed programs (Livestrong, Team Maggie, SAMFund, Heartbeat, state mandates)
     - Eligibility matching from patient profile
  3. Oncologist discussion guide generator (Claude)
  4. Integration with Treatment Translator (add fertility section)
  5. Integration with Care Packages (fertility info in pre-treatment kit)
  6. Integration with treatment timeline (fertility window visualization)
```

---

# MODULE 2: SECOND OPINION FACILITATION ENGINE

## The Problem

The Treatment Translator already flags cases where a second opinion may be warranted — TNBC without immunotherapy discussion, HER2+ without pertuzumab, outdated radiation approaches. But flagging without facilitating is like diagnosing without treating. The patient sees "you may want a second opinion" and then faces:

- Not knowing WHERE to go (which center specializes in their subtype?)
- Not knowing HOW to get their records transferred
- Fear of insulting their current oncologist
- Insurance uncertainty (is a second opinion covered?)
- Logistics (travel, scheduling, time off work)
- Not knowing what to bring or what to ask

10-20% of cancer diagnoses have clinically meaningful discrepancies on second pathology review. For rare subtypes the rate is higher. A second opinion isn't a luxury — it's a quality control mechanism that the healthcare system leaves entirely to the patient to figure out.

## Feature Set

### 2.1 Second Opinion Trigger System

Extends the Treatment Translator's existing trigger logic with a comprehensive rule engine:

```typescript
interface SecondOpinionTrigger {
  id: string;
  name: string;
  condition: string;                     // Machine-evaluable condition
  severity: "strongly_recommended" | "recommended" | "consider";
  rationale: string;                     // Why this triggers a second opinion recommendation
  evidenceBase: string;
}

const SECOND_OPINION_TRIGGERS: SecondOpinionTrigger[] = [
  // Guideline deviation triggers
  {
    id: "tnbc_no_immunotherapy",
    name: "TNBC without immunotherapy discussion",
    condition: "subtype === 'triple_negative' && stage >= 'II' && !treatmentPlan.includes('pembrolizumab')",
    severity: "strongly_recommended",
    rationale: "KEYNOTE-522 established pembrolizumab + chemo as standard of care for early-stage TNBC. Omission may indicate the treating facility lacks immunotherapy experience.",
    evidenceBase: "KEYNOTE-522 Phase 3 — pCR 63% vs 56%, EFS HR 0.63",
  },
  {
    id: "her2_no_pertuzumab",
    name: "HER2+ without pertuzumab in eligible patient",
    condition: "subtype === 'her2_positive' && stage >= 'II' && !treatmentPlan.includes('pertuzumab')",
    severity: "strongly_recommended",
    rationale: "CLEOPATRA and APHINITY established pertuzumab as standard of care. Omission reduces survival benefit.",
    evidenceBase: "CLEOPATRA — OS benefit of 15.7 months; APHINITY — iDFS HR 0.81",
  },
  {
    id: "no_genomic_testing_eligible",
    name: "ER+ early-stage without genomic test (Oncotype/MammaPrint)",
    condition: "subtype === 'er_positive_her2_negative' && stage <= 'II' && nodeStatus <= 3 && !genomicTestOrdered",
    severity: "recommended",
    rationale: "TAILORx and RxPONDER established that genomic testing identifies patients who can safely skip chemotherapy. Omission may result in unnecessary chemo or missed benefit.",
    evidenceBase: "TAILORx, RxPONDER Phase 3 trials",
  },
  
  // Pathology complexity triggers
  {
    id: "rare_subtype",
    name: "Rare histologic subtype",
    condition: "histology in ['metaplastic', 'micropapillary', 'apocrine', 'adenoid_cystic', 'secretory']",
    severity: "strongly_recommended",
    rationale: "Rare subtypes require specialized pathology review. Community pathologists may have limited experience. Treatment approaches may differ from standard protocols.",
    evidenceBase: "NCCN recommendations for rare histologies",
  },
  {
    id: "borderline_biomarkers",
    name: "Borderline biomarker results",
    condition: "her2_ihc === '2+' || er_percent <= 10 || ki67_borderline",
    severity: "recommended",
    rationale: "Borderline results (HER2 IHC 2+, low ER 1-10%, borderline Ki-67) have the highest inter-pathologist disagreement rate. Retesting or second pathology review can change subtype classification and treatment plan.",
    evidenceBase: "Multiple studies showing 10-20% reclassification rate on second pathology review",
  },
  {
    id: "discordant_biopsy_imaging",
    name: "Pathology-imaging discordance",
    condition: "imagingSuggests !== pathologyResult",
    severity: "strongly_recommended",
    rationale: "When imaging suggests one finding but pathology shows another, re-review is essential. This is a known source of diagnostic error.",
    evidenceBase: "ACR practice guidelines on discordance management",
  },
  
  // Treatment facility triggers
  {
    id: "community_hospital_advanced_stage",
    name: "Advanced stage at community hospital without NCI designation",
    condition: "stage >= 'III' && !treatingFacility.isNCIDesignated && !treatingFacility.isAcademic",
    severity: "recommended",
    rationale: "Advanced-stage breast cancer benefits from multidisciplinary tumor board review at experienced centers. Community hospitals may not have full subspecialty coverage.",
    evidenceBase: "Studies showing improved outcomes at high-volume cancer centers for complex cases",
  },
  {
    id: "young_patient",
    name: "Patient under 40 at diagnosis",
    condition: "age < 40",
    severity: "recommended",
    rationale: "Young women with breast cancer face unique considerations: fertility, genetic testing, more aggressive biology, psychosocial needs. Centers with young adult oncology programs provide specialized care.",
    evidenceBase: "Young Survival Coalition / NCCN AYA guidelines",
  },
  
  // Treatment plan complexity triggers
  {
    id: "neoadjuvant_consideration",
    name: "Potentially eligible for neoadjuvant therapy but not offered",
    condition: "subtype in ['triple_negative', 'her2_positive'] && stage >= 'II' && treatmentSequence === 'surgery_first'",
    severity: "recommended",
    rationale: "TNBC and HER2+ patients often benefit from neoadjuvant (pre-surgery) treatment, which allows response assessment and may enable less extensive surgery. Some community oncologists default to surgery-first.",
    evidenceBase: "NCCN guidelines — neoadjuvant preferred for TNBC and HER2+ Stage II+",
  },
];
```

### 2.2 Record Assembly Engine

The platform already has the patient's documents and clinical data. The Record Assembly Engine packages everything needed for a second opinion into a transmissible format:

```typescript
interface SecondOpinionPacket {
  patientId: string;
  generatedAt: string;
  
  // Clinical summary (Claude-generated from platform data)
  clinicalSummary: {
    diagnosis: string;
    stage: string;
    biomarkers: Record<string, string>;
    pathologyFindings: string;
    imagingFindings: string;
    genomicResults: string | null;
    currentTreatmentPlan: string;
    treatmentHistory: string;
    relevantComorbidities: string;
  };
  
  // Documents (already in the platform)
  documents: {
    documentId: string;
    documentType: string;               // "pathology_report", "imaging_report", "treatment_plan"
    uploadedAt: string;
    source: string;                     // "patient_upload", "fhir_sync"
  }[];
  
  // Specific questions for the second opinion
  questionsForReview: string[];         // Claude-generated based on trigger reasons
  
  // Trigger context
  triggerReasons: {
    triggerId: string;
    triggerName: string;
    rationale: string;
  }[];
  
  // Format options
  availableFormats: ("pdf" | "fhir_bundle" | "epic_care_everywhere" | "print")[];
}
```

### 2.3 Center Matching Engine

Match patients to the right second opinion destination based on their specific case:

```typescript
interface SecondOpinionCenter {
  id: string;
  name: string;
  nciDesignation: "comprehensive" | "designated" | "none";
  
  // Specialization
  breastCenterOfExcellence: boolean;
  subspecialties: string[];             // "TNBC", "inflammatory", "male breast cancer", "AYA"
  tumorBoardFrequency: string;          // "Weekly", "Daily"
  clinicalTrialCount: number;           // Active breast cancer trials
  
  // Second opinion services
  offersVirtualSecondOpinion: boolean;  // Telemedicine option (critical for access)
  virtualPlatform: string | null;       // "MyChart video", "Zoom", "proprietary"
  averageWaitDays: number | null;       // Typical wait time for appointment
  pathologyReReviewIncluded: boolean;   // Do they re-review the slides?
  
  // Logistics
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  
  // Financial
  acceptsInsurance: string[];
  estimatedCostWithInsurance: string;
  estimatedCostWithoutInsurance: string;
  financialAssistanceAvailable: boolean;
  
  // Contact
  secondOpinionCoordinator: string | null;
  phone: string;
  website: string;
  intakeFormUrl: string | null;
}

// Seed with:
// - All 71 NCI-Designated Cancer Centers
// - Major academic breast cancer programs
// - Centers offering virtual second opinions (expanding list)
```

### 2.4 Virtual Second Opinion Facilitation

Many major centers now offer telemedicine second opinions. This removes the geographic barrier entirely:

```typescript
const VIRTUAL_SECOND_OPINION_CENTERS = [
  {
    name: "Memorial Sloan Kettering — Expert Online",
    url: "https://www.mskcc.org/experience/become-patient/international-patients/second-opinion",
    turnaroundDays: "5-7 business days",
    cost: "Varies — often covered by insurance",
    includesPathologyReview: true,
    recordsRequired: ["pathology report", "imaging", "treatment plan"],
  },
  {
    name: "Cleveland Clinic — MyConsult Second Opinion",
    url: "https://my.clevelandclinic.org/online-services/myconsult",
    turnaroundDays: "3-5 business days",
    cost: "$565-750 (may be covered by insurance)",
    includesPathologyReview: true,
    recordsRequired: ["pathology report", "imaging", "treatment plan", "lab results"],
  },
  {
    name: "Mass General / Dana-Farber — eConsult",
    turnaroundDays: "5-10 business days",
    cost: "Varies by insurance",
    includesPathologyReview: true,
    recordsRequired: ["pathology report", "imaging", "treatment plan"],
  },
  // Additional centers offering virtual second opinions
];
```

### 2.5 Patient Communication Templates

```typescript
// Template for telling your oncologist you want a second opinion
const ONCOLOGIST_COMMUNICATION_PROMPT = `
Generate a respectful, honest communication for a patient to share with their
current oncologist about seeking a second opinion.

Context: {triggerContext}
Current oncologist relationship: {relationship}

TONE: This is NOT adversarial. Most oncologists encourage second opinions.
The message should frame it as:
- "I want to make sure I'm exploring every option"
- "A second opinion helps me feel confident in our plan"
- "I value your care and want to make sure we're not missing anything"

Generate:
1. A short message to send before the appointment (email or patient portal)
2. What to say in person
3. Request for records to be sent (most offices have a release form)
4. Reassurance that they're continuing care with the current oncologist
`;
```

### 2.6 Data Model Additions

```sql
CREATE TABLE second_opinion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  
  -- Triggers
  trigger_ids TEXT[] NOT NULL,
  trigger_severity TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'recommended',     -- recommended, exploring, packet_prepared, sent, completed
  
  -- Packet
  packet_generated_at TIMESTAMPTZ,
  packet_format TEXT,
  packet_document_ids UUID[],
  questions_for_review TEXT[],
  
  -- Destination
  center_id UUID,
  center_name TEXT,
  is_virtual BOOLEAN,
  appointment_date DATE,
  
  -- Outcome
  outcome TEXT,                          -- "confirmed_plan", "modified_plan", "changed_treatment", "changed_diagnosis"
  outcome_summary TEXT,
  clinically_significant_change BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE second_opinion_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nci_designation TEXT,
  breast_center_of_excellence BOOLEAN DEFAULT FALSE,
  subspecialties TEXT[],
  offers_virtual BOOLEAN DEFAULT FALSE,
  virtual_platform TEXT,
  average_wait_days INTEGER,
  pathology_rereview BOOLEAN DEFAULT FALSE,
  address TEXT,
  city TEXT,
  state TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  accepts_insurance TEXT[],
  second_opinion_coordinator TEXT,
  phone TEXT,
  website TEXT,
  intake_form_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.7 Claude Code Sessions

```
SESSION SO1: Trigger system + center directory (Week 1-2)
  1. Prisma schema
  2. Second opinion trigger engine (extend Treatment Translator)
     - Implement all trigger rules
     - Severity scoring
     - UI alert for triggered patients
  3. Center directory
     - Seed 71 NCI-designated centers
     - Subspecialty tagging
     - Virtual second opinion capability flags
  4. Center matching engine (match patient to best centers by subtype, geography, virtual)
  5. Routes: /second-opinion, /second-opinion/centers, /second-opinion/prepare

SESSION SO2: Record assembly + communication (Week 2-4)
  1. Record assembly engine
     - Pull all patient documents into second opinion packet
     - Claude-generated clinical summary
     - Claude-generated questions for review
     - PDF export for mailing / portal upload
  2. Virtual second opinion facilitation
     - Link to center intake forms
     - Instructions for each center's process
  3. Oncologist communication generator
  4. Insurance coverage check (most plans cover second opinions — generate confirmation)
  5. Outcome tracking (did the second opinion change anything?)
  6. Integration with Treatment Translator (second opinion alert prominent in translation)
```

---

# MODULE 3: TRIAL LOGISTICS NAVIGATOR

## The Problem

MATCH finds clinical trials. But matching is meaningless without logistics. The #1 reason cancer patients don't enroll in matched trials is NOT eligibility — it's logistics:

- Trial site is 200+ miles away
- No way to afford travel and housing for repeated visits
- Can't take time off work
- No childcare coverage during visits
- Don't know that free travel and housing programs exist
- Don't understand the visit schedule (how often, how long, can some visits be local?)

Programs exist to solve every one of these problems. But nobody connects the dots between the patient, the trial, and the support resources. The platform has the geographic data, the financial profile, and the trial site information. It can present a trial match with a complete logistics plan.

## Feature Set

### 3.1 Logistics Assessment

For every trial match from the MATCH module, generate a logistics profile:

```typescript
interface TrialLogisticsAssessment {
  trialId: string;
  patientId: string;
  siteId: string;
  
  // Distance and travel
  distanceMiles: number;
  estimatedDriveTime: string;
  flightRequired: boolean;              // >300 miles or no reasonable driving route
  nearestAirport: string | null;
  
  // Visit burden
  estimatedVisitSchedule: {
    phase: string;                       // "screening", "treatment", "follow-up"
    visitsPerMonth: number;
    typicalVisitDuration: string;       // "4-6 hours", "2 days", "inpatient 3 days"
    canAnyBeVirtual: boolean;           // Some trials allow telehealth follow-ups
  }[];
  totalEstimatedVisits: number;
  trialDurationMonths: number;
  
  // Cost estimate (without assistance)
  estimatedCosts: {
    travelPerVisit: number;             // Flight or gas + tolls
    lodgingPerVisit: number;            // If overnight needed
    mealsPerVisit: number;
    parkingPerVisit: number;
    totalEstimatedCost: number;         // For full trial participation
  };
  
  // Available assistance
  availableAssistance: LogisticsAssistanceProgram[];
  estimatedOutOfPocket: number;         // After all assistance applied
  
  // Feasibility score
  logisticsFeasibility: "straightforward" | "manageable" | "challenging" | "very_challenging";
  barriers: string[];
  mitigations: string[];
}
```

### 3.2 Travel & Lodging Assistance Programs

```typescript
interface LogisticsAssistanceProgram {
  id: string;
  name: string;
  type: "travel_flight" | "travel_ground" | "lodging" | "gas_card" | "meals" | "childcare" | "stipend" | "copay";
  
  provider: string;
  description: string;
  coverage: string;
  eligibility: string;
  applicationProcess: string;
  applicationUrl: string | null;
  phone: string | null;
  
  // Matching
  geographicRestrictions: string | null;
  incomeRestrictions: string | null;
  diagnosisRestrictions: string | null;
  
  // Availability
  currentlyAccepting: boolean;
  waitlistAvailable: boolean;
  averageProcessingDays: number;
}

const LOGISTICS_ASSISTANCE_PROGRAMS = [
  // FLIGHTS
  {
    name: "Corporate Angel Network",
    type: "travel_flight",
    provider: "Corporate Angel Network",
    description: "Free seats on corporate jets for cancer patients traveling to treatment. Matches patients with companies flying to/from their treatment city.",
    coverage: "Free round-trip flight on corporate aircraft",
    eligibility: "Any cancer patient traveling to/from recognized treatment center. Must be ambulatory.",
    applicationProcess: "Call or apply online 3+ days before needed travel date",
    averageProcessingDays: 3,
  },
  {
    name: "Angel Flight America",
    type: "travel_flight",
    provider: "Angel Flight (network of volunteer pilot organizations)",
    description: "Free flights on small private aircraft piloted by volunteer pilots. Network covers most of the US.",
    coverage: "Free flights for medical treatment. Typically for distances of 300-1000 miles.",
    eligibility: "Financial need, medical need for travel. Must be ambulatory and weigh under 300 lbs.",
    applicationProcess: "Apply through regional Angel Flight organization",
    averageProcessingDays: 5,
  },
  {
    name: "Mercy Medical Airlift",
    type: "travel_flight",
    provider: "Mercy Medical Airlift",
    description: "Coordinates free air transportation for patients who cannot afford commercial flights",
    coverage: "Free commercial or charitable flights",
    eligibility: "Financial need, medical need",
    applicationProcess: "Phone application",
    averageProcessingDays: 5,
  },
  
  // LODGING
  {
    name: "American Cancer Society Hope Lodge",
    type: "lodging",
    provider: "American Cancer Society",
    description: "Free lodging near major cancer treatment centers. Private rooms, shared kitchen. 31 locations across the US.",
    coverage: "Free room for patient + one caregiver. No time limit during treatment.",
    eligibility: "Cancer patient receiving treatment at a center near a Hope Lodge location. Must live 40+ miles from treatment center.",
    applicationProcess: "Referral from treatment center social worker, or self-referral via ACS",
    averageProcessingDays: 7,
  },
  {
    name: "Ronald McDonald House (for pediatric/AYA patients)",
    type: "lodging",
    provider: "Ronald McDonald House Charities",
    description: "Free or low-cost lodging near children's hospitals. Some houses serve young adults up to age 21.",
    coverage: "Free or $5-25/night lodging for families",
    eligibility: "Pediatric and young adult patients",
    applicationProcess: "Through hospital social worker",
    averageProcessingDays: 3,
  },
  {
    name: "Joe's House",
    type: "lodging",
    provider: "Joe's House (directory)",
    description: "Online directory of lodging options near cancer treatment centers — hotels, apartments, hospitality houses at discounted rates.",
    coverage: "Discounted rates, varies by listing",
    eligibility: "Any cancer patient",
    applicationProcess: "Search directory, book directly",
    averageProcessingDays: 0,
  },
  
  // GAS/GROUND TRANSPORTATION
  {
    name: "Road to Recovery (ACS)",
    type: "travel_ground",
    provider: "American Cancer Society",
    description: "Free rides to and from cancer treatment provided by trained volunteer drivers.",
    coverage: "Free rides to/from treatment appointments",
    eligibility: "Cancer patients who need transportation to treatment. Local/regional only.",
    applicationProcess: "Call ACS or request through cancer center",
    averageProcessingDays: 2,
  },
  {
    name: "Gas Card Assistance",
    type: "gas_card",
    provider: "Various — CancerCare, Patient Advocate Foundation, local nonprofits",
    description: "Gas gift cards for patients traveling to treatment",
    coverage: "$25-100 per month in gas cards",
    eligibility: "Financial need, cancer patient",
    applicationProcess: "Apply through respective organization",
    averageProcessingDays: 7,
  },
  
  // TRIAL-SPECIFIC
  {
    name: "Lazarex Cancer Foundation",
    type: "stipend",
    provider: "Lazarex Cancer Foundation",
    description: "Financial assistance specifically for clinical trial participation — covers travel, lodging, and out-of-pocket costs.",
    coverage: "Up to $1,500/month for trial-related expenses",
    eligibility: "Cancer patients enrolled in or seeking to enroll in clinical trials. Financial need.",
    applicationProcess: "Online application, reviewed within 2 weeks",
    averageProcessingDays: 14,
  },
  {
    name: "Trial sponsor travel stipend",
    type: "stipend",
    provider: "Pharmaceutical company running the trial",
    description: "Many Phase 2-3 trials offer travel stipends or reimbursement. Amount varies by trial.",
    coverage: "Varies — $50-500 per visit for travel reimbursement",
    eligibility: "Enrolled in the specific trial",
    applicationProcess: "Ask the trial coordinator at enrollment",
    averageProcessingDays: 0,
  },
  
  // CHILDCARE
  {
    name: "Family Reach",
    type: "childcare",
    provider: "Family Reach",
    description: "Financial assistance for non-medical costs of cancer treatment including childcare.",
    coverage: "Grants for childcare, housing, transportation, food",
    eligibility: "Cancer patients with financial need",
    applicationProcess: "Online application through partnering hospital or direct",
    averageProcessingDays: 10,
  },
];
```

### 3.3 Trial Logistics Plan Generator

```typescript
const TRIAL_LOGISTICS_PLAN_PROMPT = `
Generate a complete logistics plan for a cancer patient considering clinical trial enrollment.

Patient location: {patientLocation}
Trial site: {trialSite} ({distanceMiles} miles away)
Visit schedule: {visitSchedule}
Patient financial profile: {financialProfile}
Available assistance programs: {matchedPrograms}

Generate a CONCRETE, actionable logistics plan:

1. GETTING THERE
   - Recommended travel method (drive vs fly)
   - If flying: nearest airports, airline suggestions, Corporate Angel Network eligibility
   - If driving: estimated drive time, gas cost estimate
   - Local transportation at destination (does the center have a shuttle? Uber estimate?)

2. STAYING THERE
   - Hope Lodge availability near this center (check distance)
   - Hotel alternatives with rates
   - ACS or Joe's House resources
   - For multi-day visits: what to pack, what to expect

3. PAYING FOR IT
   - List every applicable financial assistance program with application steps
   - Estimated total cost WITHOUT assistance
   - Estimated total cost WITH all assistance applied
   - Step-by-step application plan: "Apply to X first (fastest processing), then Y"

4. MANAGING LIFE DURING THE TRIAL
   - Work considerations (FMLA rights if applicable)
   - Childcare resources if applicable
   - Caregiver logistics (can a companion fly free? Stay at Hope Lodge?)

5. VISIT-BY-VISIT CALENDAR
   - Map out the first 3 months of visits
   - Flag which visits might be done locally (some trials allow local labs/imaging)
   - Flag which visits absolutely require being at the trial site

Present this as a clear, step-by-step plan, not a wall of information.
The patient should finish reading this and feel like "I can actually do this."
`;
```

### 3.4 Data Model Additions

```sql
CREATE TABLE trial_logistics_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  trial_id UUID REFERENCES trials(id),
  site_id UUID,
  
  distance_miles DECIMAL(8,1),
  estimated_costs JSONB,
  matched_assistance_programs JSONB,
  estimated_out_of_pocket DECIMAL(10,2),
  feasibility_score TEXT,
  barriers TEXT[],
  
  logistics_plan TEXT,                   -- Claude-generated comprehensive plan
  logistics_plan_generated_at TIMESTAMPTZ,
  
  -- Assistance application tracking
  assistance_applications JSONB,         -- Which programs applied to, status
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE logistics_assistance_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  description TEXT NOT NULL,
  coverage TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  application_process TEXT NOT NULL,
  application_url TEXT,
  phone TEXT,
  geographic_restrictions TEXT,
  income_restrictions TEXT,
  currently_accepting BOOLEAN DEFAULT TRUE,
  average_processing_days INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 Claude Code Sessions

```
SESSION TL1: Logistics assessment + assistance matching (Week 1-2)
  1. Prisma schema
  2. Distance calculation engine (patient location → trial site)
  3. Visit burden estimation (parse trial protocol for visit schedule)
  4. Cost estimation engine (travel + lodging + meals + parking)
  5. Assistance program database (seed 20+ programs)
  6. Assistance matching (patient profile → eligible programs)
  7. Integration with MATCH module — logistics assessment generated for every trial match

SESSION TL2: Logistics plan generator + tracking (Week 2-4)
  1. Claude-powered logistics plan generator
  2. Logistics plan UI (displayed alongside trial match card)
  3. Assistance application tracker
     - Track which programs patient has applied to
     - Status tracking (applied, approved, denied)
     - Reminder notifications for pending applications
  4. Visit calendar integration
  5. "Estimated out-of-pocket: $X" badge on every trial match card
  6. Filter trial matches by logistics feasibility
```

---

# MODULE 4: EARLY PALLIATIVE CARE INTEGRATION

## The Problem

The word "palliative" kills patients. Not the care itself — palliative care extends survival by months while improving quality of life. The NEJM Temel study (2010) showed metastatic lung cancer patients randomized to early palliative care lived 2.7 months longer AND had better quality of life AND less depression than patients receiving standard oncology alone. Similar results have been replicated across cancer types.

But patients and many oncologists equate "palliative care" with "giving up" or "hospice." They refuse referrals. They wait until the last weeks of life. By then, the survival benefit is gone — early palliative care works precisely because it starts early, when there's still time to optimize symptom management, treatment tolerability, and decision-making.

The platform serves metastatic patients (Stage IV) through trial matching and some survivorship features. But it doesn't address the gap between "fighting the cancer" and "managing everything else that comes with having incurable cancer" — which is exactly what palliative care does.

## Feature Set

### 4.1 Palliative Care Education & Reframing

Before any referral, the platform must reframe what palliative care IS:

```typescript
interface PalliativeCareEducation {
  // Core reframing message
  reframingMessage: `
    Palliative care is NOT hospice. It's NOT giving up. 
    
    It's aggressive symptom management — pain, nausea, fatigue, anxiety — 
    delivered alongside your cancer treatment by specialists whose entire 
    job is making you feel better while your oncologist fights the cancer.
    
    Patients who receive palliative care early actually live LONGER on average,
    because when your symptoms are managed, you can tolerate treatment better, 
    make clearer decisions, and maintain your strength.
    
    Think of it this way: your oncologist is the general fighting the war.
    Your palliative care team is the medic keeping you strong enough to fight.
  `;
  
  // Evidence
  keyEvidence: {
    study: string;
    finding: string;
    citation: string;
  }[];
  
  // Common misconceptions
  misconceptions: {
    myth: string;
    reality: string;
  }[];
}

const PALLIATIVE_MISCONCEPTIONS = [
  {
    myth: "Palliative care means I'm dying",
    reality: "Palliative care is for any stage of serious illness. It works alongside curative treatment, not instead of it. Many patients receive palliative care for years while actively treating their cancer.",
  },
  {
    myth: "If I accept palliative care, my oncologist will stop treating me",
    reality: "Your oncologist continues your cancer treatment exactly the same. Palliative care is an additional team that focuses on your comfort, symptoms, and quality of life. They coordinate with your oncologist.",
  },
  {
    myth: "Palliative care is the same as hospice",
    reality: "Hospice is for end of life (typically last 6 months). Palliative care can start at ANY point after diagnosis and can continue for years. Many palliative care patients also receive active cancer treatment.",
  },
  {
    myth: "I'm not sick enough for palliative care",
    reality: "Research shows the EARLIER you start palliative care, the better the outcomes. You don't need to wait until symptoms are severe. The best time to start is soon after a serious diagnosis.",
  },
  {
    myth: "It will cost more",
    reality: "Most insurance covers palliative care consultations. Studies show palliative care often REDUCES total healthcare costs by preventing emergency visits and hospitalizations.",
  },
];
```

### 4.2 Symptom Assessment & Triage

For patients with advanced cancer, regular symptom assessment with intelligent triage:

```typescript
interface SymptomAssessment {
  patientId: string;
  assessedAt: string;
  
  // Edmonton Symptom Assessment Scale (ESAS) — validated cancer symptom tool
  esas: {
    pain: number;                        // 0-10
    tiredness: number;
    drowsiness: number;
    nausea: number;
    appetite: number;
    shortnessOfBreath: number;
    depression: number;
    anxiety: number;
    wellbeing: number;
    other: { symptom: string; severity: number }[];
  };
  
  // Triage
  triageLevel: "routine" | "monitor" | "urgent" | "emergency";
  triageRationale: string;
  
  // Actionable recommendations
  recommendations: {
    selfCare: string[];                  // Things the patient can do now
    discussWithOncologist: string[];     // Bring up at next appointment
    palliativeCareReferral: boolean;     // Recommend palliative care consult
    urgentContact: boolean;              // Contact care team today
  };
}

// Triage rules
const TRIAGE_RULES = {
  emergency: "Any single symptom ≥8, or pain ≥7 with new onset",
  urgent: "Two or more symptoms ≥6, or significant worsening (increase ≥3 from last assessment)",
  monitor: "Any symptom ≥4, or new symptom not previously reported",
  routine: "All symptoms ≤3 and stable/improving",
};
```

### 4.3 Palliative Care Provider Directory

```typescript
interface PalliativeCareProvider {
  id: string;
  name: string;
  type: "palliative_team" | "individual_physician" | "nurse_practitioner" | "social_worker";
  
  // Setting
  setting: "hospital_based" | "outpatient_clinic" | "home_based" | "telehealth";
  affiliatedHospital: string | null;
  
  // Services
  servicesOffered: string[];             // "pain_management", "symptom_control", "advance_care_planning",
                                         // "goals_of_care", "psychosocial", "spiritual", "caregiver_support"
  
  // Access
  acceptsInsurance: string[];
  acceptsMedicare: boolean;
  acceptsMedicaid: boolean;
  offersTelehealth: boolean;
  averageWaitDays: number | null;
  referralRequired: boolean;            // Does the patient need an oncologist referral?
  
  // Location
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string;
  website: string;
}
```

### 4.4 Advance Care Planning Support

For all patients, but especially those with advanced disease — facilitated advance care planning:

```typescript
interface AdvanceCarePlanningSupport {
  // Education about advance directives
  whatIsAnAdvanceDirective: string;
  whyItMatters: string;
  
  // Document preparation support
  documents: {
    type: "living_will" | "healthcare_proxy" | "polst" | "five_wishes";
    description: string;
    stateSpecificFormUrl: string;        // Advance directive forms are state-specific
    completionGuide: string;            // Step-by-step guide
  }[];
  
  // Goals of care conversation prep
  goalsOfCarePrep: {
    questionsToConsider: string[];       // "What matters most to you right now?"
    conversationGuide: string;          // How to have the conversation with family
    oncologistDiscussionGuide: string;  // How to talk to your oncologist about goals
  };
  
  // NOT end-of-life planning — frame as making YOUR wishes known while YOU can express them
}
```

### 4.5 Integration Points

**Trigger:** When patient profile indicates Stage IV / metastatic disease, OR when symptom journal data (from survivorship module) shows persistent high-severity symptoms, OR when treatment plan includes palliative intent.

**Treatment Translator:** For metastatic patients, include section on palliative care alongside active treatment discussion.

**Survivorship Module:** Late effects tracker and symptom journal data feed into symptom assessment and triage.

**Care Packages:** Palliative care-specific comfort items (pain management aids, comfort positioning, aromatherapy for nausea).

### 4.6 Data Model Additions

```sql
CREATE TABLE palliative_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  esas_scores JSONB NOT NULL,
  triage_level TEXT NOT NULL,
  triage_rationale TEXT,
  recommendations JSONB,
  
  palliative_referral_recommended BOOLEAN DEFAULT FALSE,
  palliative_referral_accepted BOOLEAN,
  provider_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE palliative_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  setting TEXT NOT NULL,
  affiliated_hospital TEXT,
  services_offered TEXT[],
  accepts_insurance TEXT[],
  accepts_medicare BOOLEAN DEFAULT TRUE,
  offers_telehealth BOOLEAN DEFAULT FALSE,
  average_wait_days INTEGER,
  referral_required BOOLEAN DEFAULT FALSE,
  address TEXT,
  city TEXT,
  state TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  phone TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE advance_care_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  
  has_living_will BOOLEAN DEFAULT FALSE,
  has_healthcare_proxy BOOLEAN DEFAULT FALSE,
  healthcare_proxy_name TEXT,
  has_polst BOOLEAN DEFAULT FALSE,
  goals_of_care_documented BOOLEAN DEFAULT FALSE,
  goals_of_care_summary TEXT,
  
  documents_uploaded UUID[],            -- References to uploaded advance directive documents
  last_reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.7 Claude Code Sessions

```
SESSION PC1: Education + symptom assessment (Week 1-2)
  1. Prisma schema
  2. Palliative care education module
     - Reframing content
     - Misconception addressing
     - Evidence presentation
  3. ESAS-based symptom assessment tool
     - Clean, fast UI (under 2 minutes to complete)
     - Triage engine with alert routing
     - Trend tracking over time (visualize symptom trends)
  4. Auto-trigger for metastatic patients
  5. Routes: /palliative, /palliative/assess, /palliative/learn

SESSION PC2: Provider directory + advance care planning (Week 2-4)
  1. Provider directory with geographic search
     - Seed from GetPalliativeCare.org directory
     - Telehealth filter (critical for access)
     - Insurance filter
  2. Advance care planning module
     - State-specific advance directive forms
     - Completion guides
     - Goals of care conversation prep (Claude-generated, personalized)
  3. Oncologist communication generator (requesting palliative referral)
  4. Integration with Treatment Translator
  5. Integration with Survivorship symptom journal
  6. Caregiver resources for palliative care support
```

---

# MODULE 5: INSURANCE ADVOCATE

## The Problem

Insurance denials delay and prevent care. The pattern is predictable and infuriating:

1. Oncologist orders genomic testing, advanced imaging, or a new targeted therapy
2. Insurance company denies prior authorization
3. Patient or oncologist's office files an appeal (a paper-based, fax-heavy, weeks-long process)
4. During the appeal, the patient waits — not receiving the ordered care
5. Many patients give up. Many oncologist offices are too overwhelmed to appeal aggressively
6. The appeal, when filed, often fails because it doesn't cite the right clinical evidence

The platform has the clinical profile, the documents, and access to Claude — which can generate a medically-grounded, NCCN-citing appeal letter in minutes that would take a case manager hours.

## Feature Set

### 5.1 Denial Tracking

```typescript
interface InsuranceDenial {
  id: string;
  patientId: string;
  
  // What was denied
  deniedService: string;                 // "Genomic sequencing (FoundationOne CDx)"
  serviceCategory: "genomic_testing" | "imaging" | "medication" | "procedure" | "second_opinion" | "clinical_trial_costs";
  denialDate: string;
  
  // Insurer info
  insurerName: string;
  planType: string;
  policyNumber: string | null;
  claimNumber: string | null;
  
  // Denial details
  denialReason: string;                  // As stated by insurer
  denialReasonCode: string | null;       // Standardized code if available
  denialCategory: "medical_necessity" | "not_covered" | "experimental" | "out_of_network" | "prior_auth_missing" | "other";
  
  // Appeal rights
  appealDeadline: string;               // Usually 180 days for internal, 60 for external
  appealLevel: "internal_first" | "internal_second" | "external" | "state_regulator";
  
  // Status
  status: "denied" | "appeal_drafting" | "appeal_submitted" | "appeal_won" | "appeal_lost" | "external_review";
}
```

### 5.2 Appeal Letter Generator

The crown jewel of this module:

```typescript
const APPEAL_LETTER_PROMPT = `
Generate a medical necessity appeal letter for an insurance denial.

CONTEXT:
Patient profile: {patientProfile}
Denied service: {deniedService}
Denial reason: {denialReason}
Insurer: {insurerName}

LETTER STRUCTURE:
1. Header with patient info, claim number, denial reference
2. Opening: Clear statement that this is a formal appeal of the denial
3. Clinical justification:
   - Patient's specific diagnosis, stage, biomarkers, and treatment history
   - Why this specific service is medically necessary for THIS patient
   - Cite NCCN guidelines (include specific guideline version and page)
   - Cite relevant clinical trials and peer-reviewed evidence
   - Address the specific denial reason directly
4. Standard of care argument:
   - Explain that this service is the accepted standard of care
   - Reference FDA approvals, compendia listings, or clinical consensus
5. Patient harm statement:
   - What happens to the patient if this service is not provided
   - Be specific: "Without genomic testing, the patient may receive unnecessary
     chemotherapy or miss a targeted therapy that could extend their life"
6. Request: Clear request for reversal of denial and authorization

RULES:
- Professional, factual tone — not emotional or adversarial
- Cite specific NCCN guideline categories and recommendations
- Include ICD-10 and CPT codes when relevant
- Reference the patient's specific clinical situation, not generic arguments
- Address the denial reason DIRECTLY — don't ignore it
- Include supporting literature citations with PubMed IDs when possible
- Note if the denied service is FDA-approved for this indication

Generate the letter in a format ready to be sent (after physician signature).
Mark clearly: "[PHYSICIAN SIGNATURE REQUIRED]" — the patient's oncologist should
co-sign this for maximum effectiveness.

Also generate:
- A 2-sentence summary for the patient explaining what the letter says
- A checklist of supporting documents to include with the appeal
- Recommended next steps if this appeal is denied
`;
```

### 5.3 Appeal Strategy Engine

Different denial types need different strategies:

```typescript
interface AppealStrategy {
  denialCategory: string;
  primaryStrategy: string;
  supportingEvidence: string[];
  escalationPath: string[];
  estimatedSuccessRate: string;
  timelineEstimate: string;
}

const APPEAL_STRATEGIES: Record<string, AppealStrategy> = {
  medical_necessity: {
    denialCategory: "medical_necessity",
    primaryStrategy: "NCCN guideline citation + peer-reviewed evidence + physician letter of medical necessity",
    supportingEvidence: [
      "NCCN guidelines (specific category and recommendation)",
      "FDA approval or compendia listing",
      "Published Phase 3 trial results",
      "Letter from treating oncologist explaining medical necessity",
      "Pathology and biomarker results demonstrating eligibility",
    ],
    escalationPath: [
      "Internal appeal with full clinical documentation",
      "Peer-to-peer review (request that the insurer's reviewing physician speak with treating oncologist)",
      "External independent review (required by ACA for all plans)",
      "State insurance commissioner complaint",
      "CMS complaint (if Medicare/Medicaid)",
    ],
    estimatedSuccessRate: "50-70% on first internal appeal with strong documentation",
    timelineEstimate: "30-60 days for internal appeal decision",
  },
  
  experimental: {
    denialCategory: "experimental_investigational",
    primaryStrategy: "Demonstrate that the service is NO LONGER experimental — cite FDA approval, NCCN category, or compendia listing",
    supportingEvidence: [
      "FDA approval documentation with specific indication",
      "NCCN compendium listing (drugs listed in NCCN compendium must be covered by Medicare and most commercial plans)",
      "CMS National Coverage Determination if applicable",
      "Published Phase 3 trial results",
      "Expert opinion letters from 2+ oncologists at NCI-designated centers",
    ],
    escalationPath: [
      "Internal appeal emphasizing FDA/NCCN status",
      "Peer-to-peer review",
      "State mandate review (many states mandate coverage of NCCN-listed drugs)",
      "External review",
      "Legal action (for clearly covered services being denied as 'experimental')",
    ],
    estimatedSuccessRate: "60-80% for FDA-approved, NCCN-listed services",
    timelineEstimate: "30-90 days",
  },
  
  not_covered: {
    denialCategory: "not_covered",
    primaryStrategy: "Review plan documents for coverage gaps, explore alternative coverage pathways",
    supportingEvidence: [
      "Plan benefits document (exact coverage language)",
      "State mandate laws (many states mandate cancer screening/treatment coverage)",
      "ACA essential health benefits requirements",
      "Parity requirements for employer plans",
    ],
    escalationPath: [
      "Internal appeal citing plan language and state mandates",
      "State insurance commissioner complaint (if state-regulated plan)",
      "Department of Labor complaint (if ERISA plan)",
      "Manufacturer patient assistance program (if drug coverage denied)",
      "Foundation copay assistance",
    ],
    estimatedSuccessRate: "30-50% (depends on plan type and state laws)",
    timelineEstimate: "60-120 days",
  },
};
```

### 5.4 Rights Education

Patients need to know their appeal rights — most don't:

```typescript
const APPEAL_RIGHTS_EDUCATION = {
  aca_protections: {
    title: "Your Rights Under the Affordable Care Act",
    rights: [
      "You have the right to appeal ANY denial of coverage",
      "Internal appeals must be decided within 30 days (72 hours for urgent cases)",
      "If the internal appeal fails, you have the right to an EXTERNAL independent review",
      "The external reviewer is independent — they don't work for your insurance company",
      "If your case is urgent, you can request an expedited external review (72 hours)",
      "Your insurance company cannot retaliate against you for filing an appeal",
    ],
  },
  
  peer_to_peer_review: {
    title: "Peer-to-Peer Review — A Powerful Tool",
    description: "Your oncologist can request to speak directly with the insurance company's reviewing physician. This is often the most effective step — when a board-certified oncologist explains the medical necessity to another physician, denials frequently get overturned.",
    howToRequest: "Ask your oncologist's office to request a peer-to-peer review. They call the insurer and schedule a phone conversation.",
  },
  
  state_protections: {
    title: "State-Specific Protections",
    description: "Many states have additional protections beyond federal law, including cancer treatment mandates, clinical trial coverage requirements, and step therapy protections.",
    // State-specific — loaded dynamically based on patient location
  },
};
```

### 5.5 Data Model Additions

```sql
CREATE TABLE insurance_denials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  
  denied_service TEXT NOT NULL,
  service_category TEXT NOT NULL,
  denial_date DATE NOT NULL,
  
  insurer_name TEXT NOT NULL,
  plan_type TEXT,
  claim_number TEXT,
  
  denial_reason TEXT NOT NULL,
  denial_reason_code TEXT,
  denial_category TEXT NOT NULL,
  
  appeal_deadline DATE,
  
  status TEXT DEFAULT 'denied',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appeal_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  denial_id UUID REFERENCES insurance_denials(id),
  
  appeal_level TEXT NOT NULL,            -- internal_first, internal_second, external
  letter_content TEXT NOT NULL,
  supporting_documents TEXT[],
  
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  
  outcome TEXT,                          -- approved, denied, partial
  outcome_date DATE,
  outcome_details TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.6 Claude Code Sessions

```
SESSION IA1: Denial tracking + appeal generator (Week 1-3)
  1. Prisma schema
  2. Denial intake form (structured: service, reason, insurer, dates)
  3. Appeal strategy engine (match denial type → strategy)
  4. Claude-powered appeal letter generator
     - NCCN guideline citation engine
     - FDA approval lookup
     - Patient-specific clinical justification
     - Denial-reason-specific rebuttal
  5. Letter output (PDF, downloadable, physician signature line)
  6. Supporting document checklist generator
  7. Routes: /advocate, /advocate/new-denial, /advocate/appeal/[id]

SESSION IA2: Rights education + tracking + escalation (Week 3-4)
  1. Appeal rights education module (ACA, state-specific)
  2. Peer-to-peer review facilitation (generate prep guide for oncologist)
  3. Appeal status tracking
     - Timeline visualization
     - Deadline alerts
     - Outcome recording
  4. Escalation guidance (when and how to go to external review, state regulator)
  5. Integration with Financial Assistance Finder (if appeal fails, find alternatives)
  6. Integration with Sequencing Navigator (insurance coverage denial → appeal)
  7. Aggregate denial pattern tracking (which insurers deny what, success rates)
```

---

# MODULE 6: STRUCTURED PEER MATCHING

## The Problem

Cancer is lonely in a specific way. You're surrounded by people who love you, but none of them know what it feels like. Support groups help, but they're generic — a 65-year-old with ER+ Stage I and a 35-year-old with Stage IV TNBC are in the same room. Their experiences are so different that neither feels fully understood.

What patients consistently say they want is: someone who's been through EXACTLY what I'm going through. Same diagnosis, same treatment, similar age, a few months ahead of me, who can tell me what to expect and how they handled it.

The platform has the matching data to do this with precision that no other system can approach.

## Feature Set

### 6.1 Matching Algorithm

```typescript
interface PeerMatchingCriteria {
  // Required matches (must overlap)
  cancerType: string;                    // Must be same cancer type
  
  // Strong match factors (weighted)
  subtype: string;                       // Same subtype = strongest match
  stage: string;                         // Similar stage (I-II together, III-IV together)
  treatmentRegimen: string;              // Same chemo regimen = very strong match
  
  // Demographic match factors
  ageRange: number;                      // Within 10 years preferred
  
  // Experience match factors
  treatmentPhaseOffset: number;          // Mentor should be 3-12 months ahead in journey
  
  // Optional affinity factors (boost but don't require)
  parentStatus: boolean | null;          // Both are parents
  workStatus: string | null;             // Both working through treatment
  geographicProximity: number | null;    // Same metro area (for potential in-person)
  sharedConcerns: string[];             // Fertility, body image, young kids, caregiving
}

function calculatePeerMatchScore(
  seeker: PatientProfile,
  mentor: PeerMentorProfile,
): number {
  let score = 0;
  
  // Cancer type (required)
  if (seeker.cancerType !== mentor.cancerType) return 0;
  score += 10;
  
  // Subtype match (strongest factor)
  if (seeker.subtype === mentor.subtype) score += 30;
  else if (subtypeGroup(seeker.subtype) === subtypeGroup(mentor.subtype)) score += 15;
  
  // Stage similarity
  const stageDiff = Math.abs(stageToNumber(seeker.stage) - stageToNumber(mentor.stage));
  if (stageDiff === 0) score += 20;
  else if (stageDiff === 1) score += 10;
  
  // Treatment regimen match
  if (seeker.treatmentRegimen === mentor.treatmentRegimen) score += 25;
  else if (treatmentFamily(seeker.treatmentRegimen) === treatmentFamily(mentor.treatmentRegimen)) score += 10;
  
  // Age proximity (within 10 years)
  const ageDiff = Math.abs(seeker.age - mentor.age);
  if (ageDiff <= 5) score += 15;
  else if (ageDiff <= 10) score += 10;
  else if (ageDiff <= 15) score += 5;
  
  // Treatment phase offset (mentor should be 3-12 months ahead)
  const monthsAhead = calculateMonthsAhead(seeker.treatmentPhase, mentor.treatmentPhase);
  if (monthsAhead >= 3 && monthsAhead <= 12) score += 20;
  else if (monthsAhead >= 1 && monthsAhead <= 18) score += 10;
  else if (monthsAhead <= 0) score -= 20; // Mentor should be AHEAD, not behind
  
  // Affinity factors (bonus)
  if (seeker.isParent && mentor.isParent) score += 5;
  if (seeker.workingDuringTreatment && mentor.workingDuringTreatment) score += 5;
  
  const sharedConcerns = seeker.concerns.filter(c => mentor.concerns.includes(c));
  score += sharedConcerns.length * 3;
  
  return score;
}
```

### 6.2 Mentor Program

Not just matching — a structured program:

```typescript
interface PeerMentorProfile {
  userId: string;
  patientId: string;
  
  // Matching data (from patient profile)
  cancerType: string;
  subtype: string;
  stage: string;
  treatmentRegimen: string;
  treatmentPhase: string;               // "completed_treatment", "in_survivorship", "in_treatment"
  diagnosisDate: string;
  treatmentCompletionDate: string | null;
  age: number;
  
  // Mentor-specific
  enrolledAsMentor: boolean;
  mentorSince: string;
  isTrainedMentor: boolean;             // Completed mentor training module
  
  // Preferences
  maxMentees: number;                   // How many people they can support (1-3 recommended)
  currentMenteeCount: number;
  availableHours: string;               // "Weekday evenings", "Weekend mornings"
  communicationPreference: "in_app_messaging" | "video_call" | "phone" | "in_person";
  
  // Boundaries
  comfortableDiscussing: string[];      // Topics they're willing to discuss
  notComfortableWith: string[];         // Topics they prefer to avoid
  
  // Verification
  profileVerified: boolean;             // Cross-checked against platform medical data
  mentorTrainingComplete: boolean;
  
  // Track record
  totalMenteesSupported: number;
  averageRating: number | null;
  feedbackHighlights: string[];
}
```

### 6.3 Mentor Training Module

Self-paced training before someone can be matched as a mentor:

```typescript
interface MentorTrainingModule {
  modules: {
    id: string;
    title: string;
    content: string;                     // Educational content
    completionRequired: boolean;
  }[];
}

const MENTOR_TRAINING_MODULES = [
  {
    id: "boundaries",
    title: "Healthy Boundaries in Peer Support",
    content: "You are NOT a therapist, counselor, or medical professional. Your role is to share YOUR experience, listen, and be present. Setting boundaries protects both you and your mentee.",
    completionRequired: true,
  },
  {
    id: "active_listening",
    title: "Listening Without Fixing",
    content: "The most valuable thing you can do is listen. You don't need to solve their problems. You don't need to have answers. Sometimes 'I felt that way too' is the most powerful thing you can say.",
    completionRequired: true,
  },
  {
    id: "medical_advice",
    title: "Never Give Medical Advice",
    content: "Share what YOUR experience was. Never say 'you should' about medical decisions. If they ask about specific treatments, encourage them to discuss with their oncologist. You can say 'I asked my doctor about X' but never 'you should ask about X.'",
    completionRequired: true,
  },
  {
    id: "emotional_safety",
    title: "When to Escalate",
    content: "If your mentee expresses suicidal thoughts, describes abuse or unsafe situations, or shares something that seriously concerns you, here's what to do. You're not alone — the platform has a support team.",
    completionRequired: true,
  },
  {
    id: "self_care",
    title: "Taking Care of Yourself as a Mentor",
    content: "Being a peer mentor can trigger your own emotions about your cancer experience. This is normal. Here are signs you need a break, and here's how to step back without guilt.",
    completionRequired: true,
  },
  {
    id: "diversity",
    title: "Supporting People Different From You",
    content: "Your mentee may have different cultural backgrounds, family structures, spiritual beliefs, or communication styles. Here's how to be a supportive mentor across differences.",
    completionRequired: true,
  },
];
```

### 6.4 Structured Connection Protocol

Not a free-form chat — a structured program with guardrails:

```typescript
interface PeerConnection {
  id: string;
  mentorId: string;
  menteeId: string;
  
  // Match quality
  matchScore: number;
  matchReasons: string[];                // "Same subtype (TNBC)", "Similar age (±3 years)", etc.
  
  // Status
  status: "proposed" | "mentor_accepted" | "mentee_accepted" | "active" | "paused" | "completed" | "ended";
  
  // Communication
  communicationChannel: "in_app_messaging" | "scheduled_video" | "phone";
  
  // Structure
  program: {
    introductionSent: boolean;           // Platform sends a warm introduction
    firstCheckInScheduled: boolean;
    weeklyCheckInEnabled: boolean;
    monthlyReflectionEnabled: boolean;
  };
  
  // Safety
  lastActivity: string;
  mentorWellbeingCheck: string | null;   // Monthly check: "How are YOU doing?"
  flagged: boolean;                      // Safety concern raised
  flagReason: string | null;
  
  // Duration
  startedAt: string;
  estimatedDuration: string;             // "3-6 months" — not indefinite
  endedAt: string | null;
  endReason: string | null;
}
```

### 6.5 Matching UI

```typescript
// For the mentee seeking a match
interface PeerMatchResult {
  mentorDisplayName: string;            // First name + last initial
  matchScore: number;
  matchReasons: string[];               // "She had the same chemo regimen (AC-T) and is 8 months ahead of you"
  
  // Profile summary (what the mentee sees before accepting)
  mentorSummary: {
    age: string;                        // "mid-30s" (not exact)
    diagnosis: string;                  // "Stage IIA TNBC"
    treatment: string;                  // "Completed AC-T chemo + lumpectomy"
    currentPhase: string;               // "6 months post-treatment, in active surveillance"
    sharedExperiences: string[];        // "Also a parent of young kids", "Worked through treatment"
    mentorNote: string;                 // Short note from the mentor: "I remember how scary the beginning was..."
  };
  
  // Privacy: Mentor's full name, specific age, location, and medical details
  // are NOT shared until both parties accept the match
}
```

### 6.6 Safety & Moderation

```typescript
interface PeerSafety {
  // Automated monitoring
  messageSentimentMonitoring: boolean;   // Flag messages with crisis language
  inactivityAlert: number;               // Days of no contact before check-in
  
  // Manual escalation
  reportConcern: {
    reportedBy: "mentor" | "mentee" | "system";
    concernType: "safety" | "boundaries" | "medical_advice" | "harassment" | "inactivity";
    description: string;
    action: "review" | "pause_connection" | "end_connection" | "crisis_referral";
  };
  
  // Crisis protocol
  crisisProtocol: {
    triggerWords: string[];              // Monitored for in messages (with consent)
    action: "immediate_resource_display";  // Show crisis resources immediately
    resources: {
      name: string;
      phone: string;
      text: string;
      available: string;
    }[];
  };
}
```

### 6.7 Data Model Additions

```sql
CREATE TABLE peer_mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) UNIQUE,
  
  enrolled_as_mentor BOOLEAN DEFAULT FALSE,
  mentor_since TIMESTAMPTZ,
  is_trained BOOLEAN DEFAULT FALSE,
  training_completed_at TIMESTAMPTZ,
  
  max_mentees INTEGER DEFAULT 2,
  current_mentee_count INTEGER DEFAULT 0,
  available_hours TEXT,
  communication_preference TEXT DEFAULT 'in_app_messaging',
  
  comfortable_discussing TEXT[],
  not_comfortable_with TEXT[],
  mentor_bio TEXT,                       -- Short intro they write
  
  profile_verified BOOLEAN DEFAULT FALSE,
  total_mentees_supported INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE peer_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES peer_mentor_profiles(id),
  mentee_patient_id UUID REFERENCES patients(id),
  
  match_score FLOAT,
  match_reasons TEXT[],
  
  status TEXT DEFAULT 'proposed',
  communication_channel TEXT DEFAULT 'in_app_messaging',
  
  started_at TIMESTAMPTZ,
  estimated_duration TEXT DEFAULT '3-6 months',
  ended_at TIMESTAMPTZ,
  end_reason TEXT,
  
  last_activity TIMESTAMPTZ,
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE peer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES peer_connections(id),
  sender_patient_id UUID REFERENCES patients(id),
  
  content TEXT NOT NULL,                 -- Encrypted at rest
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT
);

CREATE TABLE mentor_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES peer_mentor_profiles(id),
  module_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  
  UNIQUE(mentor_id, module_id)
);
```

### 6.8 Claude Code Sessions

```
SESSION PM1: Matching algorithm + mentor profiles (Week 1-2)
  1. Prisma schema
  2. Peer mentor enrollment flow
     - Opt-in from survivorship dashboard
     - Profile creation (bio, availability, comfort zones)
     - Verification against patient profile data
  3. Matching algorithm implementation
     - Multi-factor scoring
     - Treatment phase offset calculation
     - Affinity factor matching
  4. Match result UI (for mentees)
     - Privacy-preserving mentor summaries
     - Accept/decline flow
     - Match reasons display
  5. Routes: /peers, /peers/become-mentor, /peers/find-match, /peers/connection/[id]

SESSION PM2: Training + messaging + safety (Week 2-4)
  1. Mentor training module
     - 6 self-paced training modules
     - Completion tracking
     - Must complete before first match
  2. In-app messaging system
     - Encrypted messaging between matched peers
     - Read receipts
     - Image sharing (for practical things like "this is what the port looks like")
  3. Structured connection protocol
     - Platform-generated introduction message
     - Suggested first conversation topics
     - Weekly/monthly check-in prompts
  4. Safety system
     - Message monitoring for crisis language (with consent disclosure)
     - Crisis resource display
     - Report concern flow
     - Inactivity alerts
  5. Mentor wellbeing check (monthly: "How are you doing? Need a break?")
  6. Connection lifecycle management (pause, resume, complete, end)
  7. Feedback system (post-connection rating, highlights, improvement suggestions)
```

---

# COMBINED BUILD PLAN

## Session Summary

| Module | Sessions | Weeks | MVP |
|--------|----------|-------|-----|
| Fertility Preservation | F1-F2 | 4 | Risk assessment + options + providers |
| Second Opinion | SO1-SO2 | 4 | Triggers + center matching + record assembly |
| Trial Logistics | TL1-TL2 | 4 | Logistics assessment + assistance matching |
| Early Palliative Care | PC1-PC2 | 4 | Education + symptom assessment + providers |
| Insurance Advocate | IA1-IA2 | 4 | Denial tracking + appeal letter generator |
| Peer Matching | PM1-PM2 | 4 | Matching algorithm + messaging + training |
| **Total** | **12 sessions** | **~24 weeks** | |

## Recommended Build Order

Build based on **time-sensitivity of patient impact** — the modules where delay costs the most go first:

```
Priority 1 (Build first — delay costs irreversible harm):
  - Fertility Preservation (window closes permanently)
  - Insurance Advocate (delays are cumulative — every week of denied care matters)

Priority 2 (Build second — significant impact on survival):
  - Second Opinion Facilitation (catches diagnostic/treatment errors)
  - Trial Logistics (unlocks trial enrollment — potential life-extending)

Priority 3 (Build third — major quality of life impact):
  - Early Palliative Care (survival benefit + quality of life)
  - Peer Matching (psychosocial — can build while users accumulate)
```

## Cross-Module Integration Map

```
FERTILITY ← → Treatment Translator (add fertility section)
          ← → Care Packages (fertility info in pre-treatment kit)
          ← → Financial Finder (fertility financial programs)
          ← → Timeline (fertility window on treatment timeline)

SECOND    ← → Treatment Translator (triggers second opinion recommendation)
          ← → Document Ingestion (records already in platform → packet)
          ← → Trial Matcher (second opinion center may have different trial options)

LOGISTICS ← → Trial Matcher (logistics assessment for every match)
          ← → Financial Finder (travel assistance programs)
          ← → Care Packages (travel comfort kit for trial visits)

PALLIATIVE ← → Survivorship (symptom journal → symptom assessment)
           ← → Treatment Translator (palliative care section for Stage IV)
           ← → Care Packages (palliative comfort items)
           ← → INTEL (new palliative care research)

ADVOCATE  ← → Sequencing Navigator (genomic testing denials)
          ← → Financial Finder (alternative funding if appeal fails)
          ← → Treatment Translator (flag if treatment plan may face coverage issues)
          ← → INTEL (new coverage mandates, policy changes)

PEERS     ← → Survivorship (mentor enrollment from survivorship dashboard)
          ← → Community Intelligence (peer experiences feed community data)
          ← → Care Packages (peer mentor welcome kit)
```
