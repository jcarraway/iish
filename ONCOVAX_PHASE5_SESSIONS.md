# OncoVax — Phase 5 Claude Code Session Prompts

## Survivorship Module (SURVIVE)

These sessions transform the platform from a crisis tool (used for ~6 months around diagnosis) into a lifelong health companion (used for 5-20+ years post-treatment). The module generates personalized survivorship care plans, tracks surveillance schedules, monitors late effects, provides evidence-based lifestyle guidance, coordinates ongoing care, and — critically — detects recurrence and re-activates the entire platform when it happens.

**Prerequisites:**
- Phase 1 stable with real users (patient profiles, Treatment Translator, document ingestion, Financial Assistance Finder)
- MyChart FHIR integration working (for automatic treatment completion detection)
- Claude API patterns established from Phases 1-3

**Architecture:**
- TypeScript/Next.js for all survivorship features
- Prisma schema extensions for survivorship plans, surveillance, journal, effects, ctDNA results
- Claude API for care plan generation (same two-step grounding + translation pipeline as Treatment Translator)
- Notification system extended with phase-appropriate cadence (not as urgent as active treatment)
- The full spec is in ONCOVAX_SURVIVORSHIP_SPEC.md — reference it for all data models, interfaces, and design decisions

**Critical design principle:** The survivorship module serves people who've been through cancer treatment and are now living with its aftermath. The tone is warm, steady, and empowering — not clinical, not urgent. Fear of recurrence is the #1 reported burden. Every touchpoint should reduce anxiety, not create it. The platform NEVER announces recurrence — it only responds to what the patient or their doctor reports.

---

## SESSION S1: Survivorship Foundation + Care Plan Generation

---START---

# OncoVax — Survivorship Foundation + Care Plan Generation

This is Session S1, the first Phase 5 session. Active treatment phases are live. Now we're extending the platform for life after treatment — the phase that can last 5, 10, 20+ years. Only 46% of oncologists provide survivorship care plans. Ours is personalized to the patient's exact diagnosis, treatment history, and risk profile.

## Context

The survivorship module activates when a patient's treatment status transitions from active to post-treatment. The foundation is the Survivorship Care Plan (SCP) — a Claude-generated, personalized guide covering everything the patient needs to know about life after cancer treatment. Same two-step architecture as the Treatment Translator: clinical grounding → patient-facing translation.

The full spec is in ONCOVAX_SURVIVORSHIP_SPEC.md Sections 2-3. Reference it for all interfaces.

## What to build

### 1. Prisma Schema

Add all models from ONCOVAX_SURVIVORSHIP_SPEC.md Section 10. This is the full survivorship data model:

- `SurvivorshipPlan` — one per patient, refreshed annually. Stores treatment completion date, treatment summary, generated plan content, risk category, current survivorship phase (early/mid/late).
- `SurveillanceEvent` — individual surveillance appointments/tests with scheduling, status tracking, result storage.
- `JournalEntry` — daily symptom logging with quick-tap ratings (energy, pain, mood, sleep, hot flashes, joint pain) plus optional detail fields.
- `TrackedEffect` — late effects the patient is experiencing, with severity history for trend tracking.
- `EffectHistory` — severity snapshots over time for each tracked effect (enables trend visualization).
- `CtdnaResult` — ctDNA test results with interpretation and trial re-match trigger flag.
- `WeeklySummary` — AI-generated weekly analysis of journal data with trends, flags, and suggestions.

Convert the SQL in the spec to Prisma models. Key details:
- Journal entries have a unique constraint on `(patientId, entryDate)` — one entry per day
- SurvivorshipPlan has a unique constraint on `patientId` — one active plan per patient
- Add appropriate relations: Patient → SurvivorshipPlan, Patient → SurveillanceEvent[], Patient → JournalEntry[], etc.
- Index surveillance events by `(patientId, dueDate)` and by `(status, dueDate)` for the overdue query

Run `npx prisma migrate dev --name add_survivorship_module`.

### 2. Treatment Completion Transition

Build the entry point that transitions a patient into survivorship mode.

**Detection methods (implement in priority order):**
1. **Patient self-report:** Add a "My treatment is complete" action to the patient dashboard. Opens a guided flow that captures completion date, completion type (curative intent, ongoing maintenance, palliative), and any ongoing therapies (hormonal therapy, targeted therapy).
2. **Document upload:** Patient uploads a treatment summary or discharge letter → Claude Vision extraction detects treatment completion language → confirms with patient before transitioning.
3. **MyChart FHIR sync:** When connected, detect treatment plan status changes in FHIR resources. (Implementation detail: look for CarePlan resources with `status: completed` or `Encounter` resources indicating final treatment visit.)

**Transition flow:**

```
Patient triggers completion (any method)
       │
       ▼
Guided questionnaire:
  - Treatment completion date (or approximate)
  - Completion type: curative intent / ongoing maintenance / palliative
  - What ongoing therapies? (checkboxes: tamoxifen, letrozole, anastrozole, trastuzumab, other)
  - Any new symptoms since completing treatment?
  - Would you like to set up monitoring reminders?
       │
       ▼
Generate SCP (async — takes 15-30 seconds via Claude)
       │
       ▼
SCP reading experience (/survive/plan)
       │
       ▼
Survivorship dashboard activated (/survive)
```

### 3. SCP Generation Pipeline

Two-step Claude pipeline, same pattern as Treatment Translator:

**Step 1 — Clinical grounding:** Use the `SCP_GROUNDING_PROMPT` from spec Section 3.2. Input is the full patient profile + treatment summary. Output is a structured clinical document covering: recurrence risk assessment, surveillance schedule, late effects profile, lifestyle evidence, ongoing therapy management, and second primary cancer screening.

**Step 2 — Patient-facing translation:** Same principles as Treatment Translator. 8th-grade reading level. Magazine-style output with collapsible sections. The SCP should feel like a thoughtful, personalized guidebook — not a clinical discharge form.

**Generation implementation:**

```typescript
// packages/survivorship/src/scp-generator.ts

async function generateSCP(patientId: string): Promise<SurvivorshipCarePlan> {
  // 1. Gather all patient data
  const patient = await getPatientWithFullHistory(patientId);
  const treatmentSummary = await getTreatmentSummary(patientId);
  const genomicData = await getGenomicData(patientId); // If available from Phase 2/3
  
  // 2. Step 1: Clinical grounding
  const clinicalFoundation = await claude.generate({
    model: 'claude-sonnet-4-20250514',
    prompt: SCP_GROUNDING_PROMPT
      .replace('{fullPatientProfile}', JSON.stringify(patient.profile))
      .replace('{treatmentSummary}', JSON.stringify(treatmentSummary)),
    maxTokens: 4000,
  });
  
  // 3. Step 2: Patient-facing translation
  const patientPlan = await claude.generate({
    model: 'claude-sonnet-4-20250514',
    prompt: SCP_TRANSLATION_PROMPT
      .replace('{clinicalFoundation}', clinicalFoundation)
      .replace('{patientName}', patient.name || 'there'),
    maxTokens: 6000,
  });
  
  // 4. Parse structured output into SurvivorshipCarePlan interface
  // 5. Generate surveillance schedule from clinical foundation
  // 6. Store in SurvivorshipPlan table
  // 7. Create initial SurveillanceEvent records from schedule
  
  return plan;
}
```

The translation prompt should produce output matching the `SurvivorshipCarePlan` interface from spec Section 3.3. Key sections: "Your road ahead" (overview), "Watching for recurrence" (surveillance), "Your body after treatment" (late effects), "What you can do" (lifestyle), "Your ongoing medications," "Your care team going forward," "Other screenings."

### 4. SCP Reading Experience

Build `/survive/plan` — the reading experience for the survivorship care plan.

**Design principles:**
- Long-form reading layout, not a dashboard. This is a document the patient reads once carefully, then references sections as needed.
- Collapsible sections — open by default on first read, collapsed on return visits.
- Print-friendly version (PDF export) — patients bring this to their PCP.
- "Share with my doctor" function — generates a clinical-language version and emails it.
- Each section has a "Last updated" timestamp and "What changed" indicator when the SCP is refreshed.
- Anchor links in a sticky sidebar for section navigation.
- Key dates from the surveillance schedule rendered as a visual timeline component.

### 5. Survivorship Dashboard

Build `/survive` — the landing page for the survivorship experience.

**Dashboard cards:**
- **Your plan:** Link to SCP with "Last reviewed: [date]" and "Next review: [date]"
- **Next appointment:** The next upcoming surveillance event with countdown
- **Overdue items:** Alert card if any surveillance events are past due (red accent)
- **Journal streak:** Current logging streak and last entry date
- **This week:** Mini summary of journal trends (from weekly AI summary)
- **Quick journal:** One-tap "How are you today?" entry point

### 6. Route Stubs

Create route stubs for all survivorship pages (detailed UI built in subsequent sessions):

```
/survive                          — Dashboard (build in this session)
/survive/plan                     — SCP reading experience (build in this session)
/survive/monitoring               — Surveillance schedule + tracking (Session S2)
/survive/monitoring/ctdna         — ctDNA monitoring dashboard (Session S6)
/survive/journal                  — Symptom journal (Session S3)
/survive/effects                  — Late effects tracker (Session S3)
/survive/lifestyle                — Lifestyle recommendations (Session S4)
/survive/mental-health            — Psychosocial support (Session S5)
/survive/care-team                — Care coordination (Session S5)
```

### 7. Testing

- Test treatment completion transition from all three detection methods (self-report, document upload, FHIR sync)
- Test SCP generation for three patient profiles: ER+ early stage on tamoxifen, TNBC post-AC-T, HER2+ post-TCHP
- Verify SCP contains all 8 sections with appropriate personalization
- Test SCP print/PDF export
- Test "Share with my doctor" email generation
- Verify surveillance events are auto-created from the SCP surveillance schedule
- Test survivorship dashboard rendering with all card types

---END---

---

## SESSION S2: Surveillance Schedule Engine

---START---

# OncoVax — Surveillance Schedule Engine

This is Session S2. Session S1 established the survivorship foundation and SCP. Now we build the surveillance scheduling system — the engine that reminds patients when their follow-up appointments, mammograms, blood work, and monitoring tests are due, tracks results, and alerts when things are overdue.

## Context

Post-treatment surveillance is guideline-driven but varies by subtype, treatment received, and risk level. ASCO/NCCN guidelines specify different schedules for different patients. Most patients don't know their surveillance schedule, and many miss critical follow-ups because no one is tracking for them.

The surveillance engine was initialized in S1 (events created from SCP generation). This session builds the full management experience.

Reference: ONCOVAX_SURVIVORSHIP_SPEC.md Section 3.4 (surveillance schedule rules) and Section 4 (recurrence monitoring).

## What to build

### 1. Surveillance Schedule Generator

Implement the rules engine from spec Section 3.4 as a function that generates the surveillance schedule based on patient profile + treatment summary.

**Core rules (encode these — they come from ASCO/NCCN guidelines):**

ALL breast cancer survivors:
- Clinical breast exam: every 3-6 months years 1-3, every 6-12 months years 4-5, then annually
- Mammogram: annually starting 6-12 months post-treatment (or post-radiation)
- Do NOT recommend routine tumor markers (CA 15-3, CA 27.29) — guidelines say no
- Do NOT recommend routine CT/PET/bone scans without symptoms — guidelines say no

Conditional rules:
- IF received anthracyclines (doxorubicin): echocardiogram at 1 year, then per cardio-oncology
- IF on aromatase inhibitor (letrozole, anastrozole, exemestane): DEXA bone density at baseline, then every 1-2 years
- IF on tamoxifen: annual gynecologic exam (endometrial cancer screening)
- IF BRCA1/2 positive: breast MRI alternating with mammogram every 6 months
- IF received chest wall radiation: consider breast MRI annually (especially if treated before age 30)
- IF eligible for ctDNA monitoring: per ctDNA protocol (built in Session S6)

The generator takes `(profile, treatmentSummary, completionDate)` and outputs `SurveillanceEvent[]` with calculated due dates. Each event includes the guideline source (e.g., "ASCO 2024 Breast Cancer Survivorship Guidelines") for transparency.

### 2. Surveillance Dashboard UI

Build `/survive/monitoring` — the main surveillance tracking interface.

**Layout:**
- **Timeline view:** Visual timeline showing upcoming events, completed events, and overdue events on a 12-month rolling window
- **List view:** All events sorted by due date, with status badges (upcoming: blue, overdue: red, completed: green, skipped: gray)
- **Filter by type:** Clinical exam, imaging, blood work, ctDNA, bone density, cardiac, other
- **Each event card shows:** Title, description, due date, days until due (or days overdue), frequency, guideline source, action buttons (mark complete, reschedule, skip with reason)

### 3. Event Status Management

When a patient marks an event complete:
- Record completion date
- Prompt for result upload (reuse document ingestion — photo of report, PDF, or manual entry)
- If result uploaded → Claude extracts key findings and stores as `resultSummary`
- Auto-calculate next due date based on frequency rules
- Create the next occurrence as a new `SurveillanceEvent`

When an event becomes overdue (due date passes without completion):
- Status transitions to "overdue"
- Overdue notification sent to patient
- Overdue card appears on survivorship dashboard
- After 30 days overdue: escalation notification ("You have an overdue [mammogram]. Would you like help scheduling?")

### 4. Appointment Reminder System

Extend the notification system with surveillance-specific reminders:

```typescript
const SURVEILLANCE_REMINDERS = {
  // Standard reminder cadence
  reminders: [
    { daysBefore: 30, channel: 'email', message: 'Your {eventTitle} is due in about a month' },
    { daysBefore: 7, channel: 'email', message: 'Your {eventTitle} is due next week' },
    { daysBefore: 1, channel: 'email', message: 'Your {eventTitle} is due tomorrow' },
  ],
  
  // Overdue escalation
  overdue: [
    { daysAfter: 3, channel: 'email', message: 'Your {eventTitle} was due {daysOverdue} days ago' },
    { daysAfter: 14, channel: 'email', message: 'Reminder: your {eventTitle} is now 2 weeks overdue' },
    { daysAfter: 30, channel: 'email', message: 'Your {eventTitle} is a month overdue. Need help scheduling?' },
  ],
};
```

### 5. Result Upload + Interpretation

When a patient uploads a surveillance result (mammogram report, blood work, etc.):
- Reuse the document ingestion pipeline from Phase 1 (Claude Vision extraction)
- Extract key findings: normal/abnormal, BIRADS score (for mammograms), specific values (for blood work)
- Store extracted summary in `resultSummary` on the surveillance event
- If result is abnormal: flag for patient attention with guidance ("Your mammogram showed a finding that needs follow-up. This is very common and usually not cancer. Here's what typically happens next...")
- If result shows anything concerning for recurrence: DO NOT announce recurrence. Instead: "Your result includes findings that your oncologist should review. We recommend scheduling a follow-up appointment soon."

### 6. tRPC Routes

```typescript
export const surveillanceRouter = router({
  getSchedule: protectedProcedure
    .query(async ({ ctx }) => {
      // All surveillance events for this patient
      // Sorted by due date
      // Include overdue, upcoming, and recently completed
    }),

  markComplete: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      completedDate: z.string(),
      resultSummary: z.string().optional(),
      resultDocumentId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Mark event complete
      // Auto-generate next occurrence
      // Update surveillance dashboard
    }),

  skip: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Mark as skipped with reason
      // Still generate next occurrence
      // Log for care coordination
    }),

  reschedule: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      newDueDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update due date
      // Recalculate reminders
    }),

  uploadResult: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      documentId: z.string(), // From document ingestion
    }))
    .mutation(async ({ ctx, input }) => {
      // Link uploaded document to surveillance event
      // Trigger Claude extraction for key findings
      // Store result summary
      // Flag if abnormal
    }),
});
```

### 7. Testing

- Test schedule generation for: ER+ on anastrozole (needs DEXA + annual gyn), TNBC post-AC-T (needs cardiac echo), BRCA+ (needs alternating MRI), HER2+ post-TCHP (needs cardiac monitoring)
- Test event lifecycle: upcoming → reminder → complete → result upload → next occurrence created
- Test overdue flow: due date passes → status change → overdue notifications fire on schedule
- Test result interpretation: normal mammogram, abnormal mammogram (BIRADS 4), normal blood work

---END---

---

## SESSION S3: Symptom Journal + Late Effects Tracker

---START---

# OncoVax — Symptom Journal + Late Effects Tracker

This is Session S3. We're building the daily engagement layer — the symptom journal that patients use every day, and the late effects tracker that monitors treatment side effects over months and years. The journal must be completable in under 60 seconds or patients will stop using it.

## Context

Reference: ONCOVAX_SURVIVORSHIP_SPEC.md Section 5 (Late Effects) and the journal interface in Section 5.2-5.3.

Post-treatment symptoms are the daily reality of survivorship. Joint pain from aromatase inhibitors. Neuropathy from taxanes. Hot flashes from endocrine therapy. Fatigue that persists months after chemo ends. Patients manage these largely alone. The journal creates a data trail that: (a) spots worsening trends before they become crises, (b) generates weekly AI summaries with actionable insights, (c) feeds the care coordination module with data for appointment prep, and (d) gives the patient evidence when they talk to their doctor ("My joint pain has been trending up for 3 weeks" vs "I've been having some joint pain").

## What to build

### 1. Journal Entry UI

Build the 60-second mobile-first journal interface. This must be the lowest-friction data entry in the entire platform.

**Design exactly as spec Section 5.3:** Quick-tap sliders for energy (1-5), pain (0-5), mood (1-5), sleep quality (1-5). Conditional fields based on treatment: hot flashes (0-3) if on endocrine therapy, joint pain (0-3) if on aromatase inhibitor. One-tap "Done" that saves immediately. Optional expansion for: new symptoms (free text), exercise (type + minutes), medication tracking (taken Y/N + side effects), notes.

**Implementation:**
- `POST /api/trpc/journal.create` — upserts entry for today (unique on patient + date)
- Pre-fill conditional fields based on the patient's ongoing therapy (from SCP data)
- Save on every slider change (auto-save, no submit button needed for quick entry)
- "Done" button dismisses the journal and updates the dashboard streak counter
- Accessible from: survivorship dashboard quick-entry card, push notification deep link, `/survive/journal` direct

### 2. Push Notification + Daily Reminder

- Patient picks their preferred journal time during survivorship onboarding (default: 8 PM)
- Daily notification at chosen time: "How was your day? Quick check-in (30 sec)" → deep links to journal entry
- Track notification → open → complete funnel for engagement metrics
- Streak tracking: consecutive days with journal entries. Display on dashboard. No gamification pressure — just a quiet counter.
- If patient misses 3+ days: gentler reminder. If misses 7+: "We noticed you haven't checked in — everything okay?" (not guilt-inducing)

### 3. Weekly AI Summary Generator

Every Monday morning, generate a `WeeklySummary` from the previous week's journal entries.

```typescript
async function generateWeeklySummary(patientId: string, weekStart: Date): Promise<WeeklySummary> {
  const entries = await getJournalEntries(patientId, weekStart, addDays(weekStart, 6));
  
  if (entries.length < 3) {
    // Not enough data for a meaningful summary
    return { insufficient_data: true, message: "Log at least 3 days this week for a summary" };
  }
  
  // Calculate trends for each dimension
  const trends = calculateTrends(entries, previousWeekEntries, monthAgoEntries);
  
  // Generate Claude summary
  const summary = await claude.generate({
    prompt: `
    Analyze this week's symptom journal for a breast cancer survivor.
    Generate a warm, supportive weekly summary.
    
    This week's entries: ${JSON.stringify(entries)}
    Previous week's averages: ${JSON.stringify(prevWeekAvg)}
    Month ago averages: ${JSON.stringify(monthAgoAvg)}
    Patient's ongoing therapy: ${JSON.stringify(ongoingTherapy)}
    Patient's tracked late effects: ${JSON.stringify(trackedEffects)}
    
    Produce:
    1. Trend analysis for each dimension (improving/stable/declining + delta)
    2. Flags: any concerning patterns (3+ days of worsening, new symptoms, declining trend over 3 weeks)
    3. Suggestions: data-driven observations (e.g., "Your energy scores are higher on days you exercise")
    4. Encouragement: one genuine, data-backed positive observation
    
    Tone: warm, steady, empowering. Not clinical. Not cheerful-at-all-costs.
    If there are concerning trends, be honest but not alarming.
    `,
  });
  
  return parsedSummary;
}
```

- Store in `WeeklySummary` table
- Show on survivorship dashboard as "This week" card
- Email the summary Monday morning with the journal reminder
- If flags are present: highlight them in the summary but do NOT escalate automatically. The patient decides whether to discuss with their doctor.

### 4. Late Effects Profile Generator

When the SCP is generated (S1), auto-create the late effects profile based on treatments received.

**Use the treatment-to-effect mapping from spec Section 5.1:**

For each treatment the patient received, look up known late effects and create `TrackedEffect` records for effects that are "common" or "less common" (skip "rare" unless patient reports them). Set initial status to "watch list" — they become "active" when the patient reports experiencing them.

Common mappings to encode:
- Taxanes (paclitaxel, docetaxel) → peripheral neuropathy, nail changes, bone/joint pain
- Anthracyclines (doxorubicin) → cardiotoxicity, fatigue, cognitive changes ("chemo brain")
- Cyclophosphamide → premature menopause, fertility impact, bladder irritation
- Aromatase inhibitors → joint stiffness/pain, bone density loss, hot flashes, mood changes
- Tamoxifen → hot flashes, endometrial changes, blood clot risk, mood changes
- Radiation → skin changes (long-term), fatigue, lymphedema risk, rib/lung effects
- Trastuzumab → cardiotoxicity (usually reversible)

### 5. Effect Severity Tracking + Trends

When a patient reports a late effect (through journal or direct entry):
- Create/update `TrackedEffect` record
- Add severity snapshot to `EffectHistory`
- Calculate trend: compare current severity to 2 weeks ago and 2 months ago → improving/stable/worsening
- Display trend visualization (simple line chart of severity over time)

Build `/survive/effects` — late effects dashboard showing:
- Active effects sorted by severity (highest first)
- Each effect: name, caused by, current severity (1-10 bar), trend indicator, management tips
- Resolved effects (collapsed section)
- Watch list (effects to be aware of but not yet reported)
- "Report a new effect" button → guided flow

### 6. Symptom Assessment Engine

When journal data or effect tracking reveals concerning patterns, generate contextual assessment:

```typescript
function assessSymptomUrgency(
  symptom: string,
  severity: number,
  trend: string,
  patientContext: { treatments: string[], ongoingTherapy: string[], riskCategory: string }
): SymptomAssessment {
  // Rules:
  // - New bone pain in a patient with history of breast cancer → could be bone metastasis
  //   → "This symptom is worth discussing with your oncologist at your next visit"
  // - Worsening joint pain on aromatase inhibitor → expected side effect, manageable
  //   → "Joint pain is common with [drug]. Here are management strategies..."
  // - Sudden severe headache in a patient with known brain met risk → urgent
  //   → "Severe new headaches should be reported to your oncologist promptly"
  // - Gradually improving neuropathy → positive trajectory
  //   → "Your neuropathy is showing improvement — this is the expected pattern"
  
  // CRITICAL: Never diagnose. Never say "this might be recurrence."
  // Guide toward appropriate medical follow-up when warranted.
}
```

### 7. Journal Dashboard

Build `/survive/journal` — the journal history and trends view.

- Calendar view showing logged days (green dots) and missed days
- Weekly summary cards (expandable)
- Trend charts for each dimension (4 weeks rolling average)
- Correlation insights ("You tend to sleep better on days you exercise")
- Export to PDF (for doctor appointments)

### 8. Testing

- Test journal entry creation (quick-tap path: 5 sliders → done → saved)
- Test upsert behavior (editing today's entry updates rather than creates new)
- Test weekly summary generation with 3, 5, and 7 entries
- Test late effects profile generation for AC-T, TC, TCHP regimens
- Test effect severity trending (add 8 data points over 4 weeks, verify trend calculation)
- Test symptom assessment for: worsening joint pain on AI (expected), new bone pain (flag for doctor), improving neuropathy (positive reinforcement)
- Test journal export to PDF

---END---

---

## SESSION S4: Evidence-Based Lifestyle Engine

---START---

# OncoVax — Evidence-Based Lifestyle Engine

This is Session S4. We're building the lifestyle recommendation system — personalized exercise programming, nutrition guidance, alcohol risk quantification, and environmental exposure reduction. Every recommendation is grounded in published evidence specific to breast cancer survivorship, quantified where data exists, and personalized to the patient's subtype and treatment history.

## Context

Reference: ONCOVAX_SURVIVORSHIP_SPEC.md Section 6 (full spec).

This is NOT generic wellness advice. The evidence base for lifestyle interventions in breast cancer survivorship is strong and specific. 150 min/week of moderate exercise reduces recurrence by 40-50% in ER+ breast cancer (LACE study, WHEL study). Alcohol increases breast cancer recurrence risk by ~10% per drink/week for ER+ subtypes. Every recommendation carries its evidence citation and is adapted to the patient's physical limitations (late effects from treatment).

## What to build

### 1. Exercise Recommendation Generator

Generate personalized exercise programming based on:
- Treatment received (identifies physical limitations — neuropathy from taxanes limits balance activities, cardiotoxicity from anthracyclines requires cardiac clearance, lymphedema risk from surgery/radiation affects upper body work)
- Current fitness level (self-reported: sedentary / lightly active / moderately active / very active)
- Late effects being experienced (from S3 tracker)
- Subtype-specific evidence (ER+ has strongest exercise-recurrence data)

**Output:** A progressive 12-week exercise plan, updated as the patient progresses. Week 1 starts gentle (even for previously active patients — post-treatment deconditioning is real). Builds by 10-15% per week. Includes specific activities, duration, intensity targets, and "stop if" safety guidelines.

```typescript
interface ExercisePlan {
  currentWeek: number;
  totalWeeks: number;
  weeklyTarget: { minutes: number; sessions: number };
  activities: {
    name: string;           // "Brisk walking", "Swimming", "Yoga", "Light resistance training"
    frequency: string;      // "3x per week"
    duration: string;       // "20 minutes, building to 30 by week 4"
    intensity: string;      // "Moderate — you can talk but not sing"
    modifications: string[]; // Treatment-specific modifications
  }[];
  safetyNotes: string[];   // "Stop if you experience chest pain, severe shortness of breath..."
  evidenceSummary: string; // "150 minutes/week of moderate exercise is associated with a 40-50% reduction..."
}
```

### 2. Nutrition Guidance Generator

Personalized nutrition guidance based on:
- Ongoing therapy (medication-food interactions — e.g., grapefruit with tamoxifen is debated but worth noting; calcium/vitamin D importance on aromatase inhibitors for bone health)
- Subtype (ER+ patients have specific evidence around soy, phytoestrogens — current evidence says moderate soy intake is safe and may be protective)
- Weight management context (weight gain during treatment is common; evidence links higher BMI to increased recurrence risk for ER+ specifically)
- Treatment-related dietary needs (post-radiation mouth/throat sensitivity, chemo-related taste changes that may persist)

**Important: evidence-based ONLY.** Do not recommend supplements without evidence. Explicitly address common myths:
- Turmeric/curcumin: insufficient evidence for cancer prevention despite popularity
- Alkaline diet: no evidence
- Sugar "feeds" cancer: misleading oversimplification
- Soy: safe in moderate dietary amounts for breast cancer survivors (ACS position)

### 3. Alcohol Guidance (Subtype-Specific Risk Quantification)

Build a personalized alcohol risk calculator:

```typescript
interface AlcoholRiskAssessment {
  currentIntake: { drinksPerWeek: number };
  subtypeRisk: string;           // "ER+ breast cancer has the strongest evidence linking alcohol to recurrence"
  quantifiedRisk: string;        // "Each drink per day is associated with a ~10% increase in breast cancer recurrence risk"
  recommendation: string;        // "Based on your ER+ subtype, limiting alcohol to 3 or fewer drinks per week is recommended"
  evidenceStrength: string;      // "Strong — multiple large cohort studies"
  whatOneDrinkMeans: string;     // "5 oz wine, 12 oz beer, 1.5 oz spirits"
  honestFraming: string;         // "This is a risk reduction choice, not a guarantee. Some survivors choose to abstain, others choose moderation."
}
```

Do NOT moralize. Present the data, quantify the risk, and respect the patient's autonomy. The platform's job is to give them the information to make an informed decision.

### 4. Environmental Exposure Reduction

Practical, evidence-based guidance on reducing environmental exposures linked to breast cancer risk. Focus on actionable items, not anxiety-inducing lists:
- Endocrine disruptors: specific product swaps (fragrance-free, BPA-free, PFAS-free)
- Occupational exposures: relevant if applicable
- Air quality: practical guidance for high-pollution areas
- Evidence level for each recommendation: strong / moderate / precautionary

### 5. Lifestyle Dashboard

Build `/survive/lifestyle` with sections for each area.

**Design:** Magazine-style layout, not a clinical document. Each section:
- Key stat/headline ("150 min/week of exercise reduces your recurrence risk by 40-50%")
- Personalized recommendation with evidence citation
- Expandable clinical detail for patients who want the studies
- Practical "start here" action
- Connection to journal tracking (exercise minutes, alcohol intake logged in journal contribute to lifestyle metrics)

### 6. Testing

- Test exercise plan generation for: patient with neuropathy (modified balance/lower body), patient with lymphedema risk (modified upper body), previously sedentary patient (very gradual start), previously athletic patient (faster progression)
- Test nutrition guidance for: patient on anastrozole (bone health emphasis), patient on tamoxifen (soy discussion), patient with treatment-related weight gain
- Test alcohol risk for ER+ vs TNBC (different evidence strength)
- Test that no supplement recommendations are made without evidence
- Test myth-busting content: verify turmeric, alkaline diet, sugar/cancer myths are addressed accurately

---END---

---

## SESSION S5: Psychosocial Support + Care Coordination

---START---

# OncoVax — Psychosocial Support + Care Coordination

This is Session S5. We're building the emotional support layer and the care coordination hub. Fear of recurrence is the #1 reported burden of survivorship. And the handoff from oncology to primary care — where critical monitoring often falls through the cracks — is routinely broken.

## Context

Reference: ONCOVAX_SURVIVORSHIP_SPEC.md Sections 7 (Psychosocial) and 8 (Care Coordination).

## What to build

### 1. Fear of Recurrence Resource Library

Build `/survive/mental-health` — a curated resource hub for the psychological aspects of survivorship.

**Content structure:**
- **"What you're feeling is normal"** — normalize the fear of recurrence. 70% of survivors report it as their #1 concern. It doesn't mean something is wrong with you. It tends to spike around surveillance appointments ("scanxiety"), anniversaries of diagnosis, and when hearing about others' recurrences.
- **Evidence-based management strategies** — NOT generic coping tips. Specifically reference:
  - ConquerFear program (CBT-based, clinically validated for FCR)
  - AFTER intervention (attention training, metacognitive therapy)
  - Mindfulness-based stress reduction (MBSR) — clinically studied in breast cancer survivors
- **When fear becomes clinical** — signs that FCR has crossed from normal worry into something that needs professional help (avoidance of follow-up, constant body scanning, inability to plan for the future, significant daily impairment)
- **Professional resources** — link to psycho-oncology directories, cancer-specific therapists

### 2. Psychosocial Resource Matching

Match patients to appropriate support resources based on their profile:

```typescript
interface PsychosocialMatch {
  category: string;             // "support_group", "individual_therapy", "peer_mentoring", "online_community", "financial_counseling", "couples_counseling", "career_reentry"
  resourceName: string;
  description: string;
  format: string;               // "in_person", "virtual", "phone", "app"
  cost: string;                 // "Free", "$20/session", "Insurance accepted"
  specializations: string[];    // "breast_cancer", "young_survivors", "TNBC", "metastatic"
  location: string | null;      // For in-person
  url: string;
  notes: string;                // Personalized note: "This group is specifically for ER+ survivors on long-term endocrine therapy"
}
```

**Key resources to seed:**
- Cancer Support Community (free support groups, nationwide)
- SHARE (breast cancer specific)
- Young Survival Coalition (under 40)
- Living Beyond Breast Cancer
- Breastcancer.org community forums
- Imerman Angels (1-on-1 peer support — connects to PEERS module)
- Psycho-oncology directories (APOS, IPOS)
- Crisis resources: Crisis Text Line (text HOME to 741741), 988 Suicide & Crisis Lifeline

### 3. Care Team Directory

Build `/survive/care-team` — "Who to call for what."

Post-treatment, patients often don't know whether to call their oncologist, their PCP, a specialist, or urgent care for a given concern. Build a care team directory that:
- Lists all the patient's known providers (oncologist, PCP, surgeon, radiation oncologist, genetic counselor, etc.)
- For each provider: name, role, phone, what to contact them for
- Decision tree: "I'm having [symptom]. Who should I call?" → routes to the right provider based on symptom type and urgency
- Editable by patient (add/remove providers)

### 4. Appointment Prep Generator

When a surveillance event is approaching, generate a personalized appointment preparation document:

```typescript
interface AppointmentPrep {
  appointmentType: string;         // "6-month oncology follow-up"
  preparedFor: string;             // Patient name
  
  // From journal data
  symptomSummary: {
    dimension: string;
    trend: string;
    averageScore: number;
    notableChanges: string;
  }[];
  
  // From surveillance tracking
  completedSince: string[];        // "Mammogram (normal, Jan 2027)"
  upcomingTests: string[];
  overdueItems: string[];
  
  // From effects tracker
  activeEffects: {
    effect: string;
    severity: number;
    trend: string;
  }[];
  
  // Suggested questions
  questionsToAsk: string[];        // Personalized to their situation
  
  // From lifestyle data
  exerciseAverage: string;         // "Averaging 120 min/week (target: 150)"
  
  // Medication check
  medications: {
    name: string;
    sideEffects: string[];         // Reported through journal
    adherenceRate: number;         // % of days taken (from journal tracking)
  }[];
}
```

- Auto-generate 2-3 days before the appointment
- Send via email notification: "Your oncology appointment is in 3 days. Here's your prep doc."
- Print-friendly format (patients bring this to appointments)
- One-page summary with option to expand detail

### 5. tRPC Routes

```typescript
export const psychosocialRouter = router({
  getResources: protectedProcedure
    .input(z.object({
      categories: z.array(z.string()).optional(),
      format: z.string().optional(),
    }))
    .query(/* matched resources for this patient */),
});

export const careTeamRouter = router({
  getTeam: protectedProcedure.query(/* patient's care team */),
  addProvider: protectedProcedure.input(/* provider details */).mutation(/* add to team */),
  removeProvider: protectedProcedure.input(z.string()).mutation(/* remove */),
  routeSymptom: protectedProcedure
    .input(z.object({ symptom: z.string(), urgency: z.string() }))
    .query(/* which provider to call for this symptom */),
  generateAppointmentPrep: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(/* generate prep doc from journal + effects + surveillance data */),
});
```

### 6. Testing

- Test resource matching for: young survivor (under 40 — should match YSC), TNBC patient (TNBC-specific groups), patient reporting high fear of recurrence (should surface professional therapy resources)
- Test care team CRUD operations
- Test symptom routing: "new bone pain" → oncologist, "bad cold" → PCP, "chest pain" → ER
- Test appointment prep generation with 4 weeks of journal data
- Test appointment prep with no journal data (should still generate from surveillance + effects)
- Test pre-appointment notification timing (3 days before)

---END---

---

## SESSION S6: ctDNA Monitoring + Recurrence Detection Loop

---START---

# OncoVax — ctDNA Monitoring + Recurrence Detection Loop

This is Session S6. We're building the most clinically significant surveillance feature: ctDNA (circulating tumor DNA) monitoring. ctDNA can detect molecular relapse months before imaging shows recurrence. A positive ctDNA result triggers re-entry into the trial matching pipeline — potentially catching recurrence at a stage where personalized vaccine intervention is most effective.

## Context

Reference: ONCOVAX_SURVIVORSHIP_SPEC.md Section 4.

ctDNA monitoring is the bridge between survivorship and the Phase 1-3 pipeline. It's the earliest possible recurrence signal. When ctDNA is detected, the patient needs: (a) clinical confirmation and context, (b) re-sequencing to characterize the recurrent tumor, and (c) immediate trial re-matching. This session builds the ctDNA tracking and the trigger mechanism that cascades into recurrence response (fully built in Session S8).

Key providers: Natera Signatera (tumor-informed, personalized), Guardant Reveal (tumor-naive, standardized panel). Signatera requires initial tumor tissue for custom panel design; Reveal works from blood draw alone.

## What to build

### 1. ctDNA Testing Guide

Build `/survive/monitoring/ctdna` with:

- **Plain-language explanation:** What ctDNA is, how it works, what the results mean. Use the LEARN module visualization (D5) if built. Key message: ctDNA can detect cancer returning months before a scan would show it — but a positive result doesn't mean cancer is definitely back. It means closer monitoring is warranted.
- **Provider comparison:** Signatera vs Reveal vs other options. Capabilities, requirements, cost, insurance coverage.
- **Eligibility assessment:** Not every survivor benefits equally from ctDNA monitoring. Strongest evidence for: high-risk stage II/III, post-neoadjuvant with residual disease, TNBC. Discuss with oncologist.
- **Insurance navigation:** Use the Financial Assistance Finder patterns. ctDNA monitoring coverage is evolving rapidly. Seed known coverage rules.

### 2. ctDNA Result Tracking

```typescript
export const ctdnaRouter = router({
  addResult: protectedProcedure
    .input(z.object({
      testDate: z.string(),
      provider: z.string(),            // "Natera Signatera", "Guardant Reveal"
      result: z.enum(['not_detected', 'detected', 'indeterminate']),
      ctdnaLevel: z.number().optional(), // Mean tumor molecules per mL
      documentId: z.string().optional(), // Uploaded result document
    }))
    .mutation(async ({ ctx, input }) => {
      // Store result
      // Generate Claude interpretation (plain language)
      // If result === 'detected':
      //   - DO NOT announce recurrence
      //   - Flag for oncologist discussion
      //   - Offer to re-run trial matching with updated context
      //   - Set triggeredTrialRematch = true
      //   - Queue notification: "Your ctDNA result needs discussion with your oncologist"
      // If result === 'not_detected':
      //   - Positive reinforcement: "No cancer DNA detected in your blood"
      //   - Schedule next test per protocol
      // If result === 'indeterminate':
      //   - Explain what this means
      //   - Recommend repeat testing
    }),

  getHistory: protectedProcedure
    .query(async ({ ctx }) => {
      // All ctDNA results for this patient, chronological
      // Include trend visualization data (detected levels over time)
    }),

  getInterpretation: protectedProcedure
    .input(z.string()) // result ID
    .query(async ({ ctx, input }) => {
      // Claude-generated interpretation of this specific result
      // In context of all prior results (trend)
    }),
});
```

### 3. Result Interpretation with Claude

For each ctDNA result, generate a personalized interpretation:

```typescript
const CTDNA_INTERPRETATION_PROMPT = `
You are explaining a ctDNA (circulating tumor DNA) test result to a breast cancer survivor.

Result: {result} (detected / not_detected / indeterminate)
Level: {level} mean tumor molecules per mL (if available)
Provider: {provider}
Test date: {testDate}
Prior results: {priorResults}

Patient context:
- Original diagnosis: {diagnosis}
- Treatment completed: {completionDate}
- Risk category: {riskCategory}
- Time since treatment: {monthsSinceCompletion} months

Generate a warm, clear, honest interpretation that:
1. Explains what this result means in plain language
2. Puts it in context of prior results (if any)
3. Suggests next steps
4. If DETECTED: do NOT say "your cancer is back." Say: "ctDNA was detected in your blood. This finding should be discussed with your oncologist promptly. It can indicate residual or returning disease, but it requires clinical confirmation with imaging and possibly biopsy. Many patients with detected ctDNA benefit from early intervention."
5. If NOT DETECTED: celebrate this appropriately. "No cancer DNA was detected. This is reassuring and consistent with your treatment having been effective."
6. If INDETERMINATE: explain that the test was inconclusive and recommend repeat testing.

Tone: calm, clear, supportive. Not falsely reassuring. Not alarming.
`;
```

### 4. Trial Re-Match Trigger

When ctDNA is detected:
- Automatically re-run the Phase 1 trial matching engine with updated context:
  - Add `ctdna_positive: true` to the patient profile
  - Filter for trials that accept patients with molecular relapse / minimal residual disease
  - Prioritize personalized vaccine trials (the platform's core value proposition — vaccines work best against minimal residual disease)
- Present results to patient: "Based on your ctDNA result, we've found {N} trials that specifically study early intervention for molecular relapse."
- Connect to Phase 3 pipeline: if the patient has prior sequencing data, recommend re-sequencing to characterize any evolved mutations, then feed into the neoantigen prediction pipeline for an updated vaccine blueprint.

### 5. ctDNA Dashboard

On `/survive/monitoring/ctdna`:
- Timeline of all ctDNA results with visual indicators (green = not detected, red = detected, yellow = indeterminate)
- Trend chart if multiple results (level over time)
- Next scheduled test with countdown
- "Upload new result" button
- Links to ctDNA education content
- If any positive result: prominent "Discuss with your oncologist" guidance + link to trial matches

### 6. Testing

- Test result entry for all three outcomes (not_detected, detected, indeterminate)
- Test interpretation generation for: first-ever not_detected, third consecutive not_detected (context should note consistency), first detected after prior negatives (should be careful and supportive), indeterminate
- Test trial re-matching trigger on positive result
- Test ctDNA trend visualization with 6 results over 18 months
- Verify that positive results NEVER use the word "recurrence" in patient-facing text

---END---

---

## SESSION S7: Notifications + Polish + Phase Transitions

---START---

# OncoVax — Notifications + Polish + Phase Transitions

This is Session S7. We're polishing the survivorship module: implementing the full notification cadence, building the annual SCP refresh pipeline, handling survivorship phase transitions (early → mid → late), and doing end-to-end testing.

## What to build

### 1. Full Notification Cadence

Survivorship notifications are different from active treatment notifications. They're less frequent, less urgent, and should feel like a steady companion rather than an alert system.

```typescript
const SURVIVORSHIP_NOTIFICATION_SCHEDULE = {
  // Daily
  journalReminder: { time: 'patient_preferred', channel: 'push', frequency: 'daily' },
  
  // Weekly
  weeklySummary: { day: 'monday', time: '9:00', channel: 'email', frequency: 'weekly' },
  
  // Event-driven
  surveillanceReminder: { triggers: [30, 7, 1], unit: 'days_before', channel: 'email' },
  surveillanceOverdue: { triggers: [3, 14, 30], unit: 'days_after', channel: 'email' },
  appointmentPrep: { trigger: 3, unit: 'days_before', channel: 'email' },
  ctdnaResult: { trigger: 'on_entry', channel: 'email', priority: 'high' },
  
  // Periodic
  scpAnnualReview: { trigger: 'anniversary', channel: 'email' },
  lifestyleCheckIn: { frequency: 'monthly', channel: 'email' },
  
  // Phase transitions
  phaseTransition: { trigger: 'on_transition', channel: 'email' },
};
```

Implement the notification orchestrator that manages all these triggers and respects patient notification preferences (opt-out per category, quiet hours, channel preferences).

### 2. Annual SCP Refresh Pipeline

The SCP should be refreshed annually to account for:
- New guideline updates (ASCO/NCCN publish updates annually)
- Changed risk profile (risk decreases over time for most subtypes)
- Completed surveillance milestones
- New evidence in lifestyle recommendations
- Phase transitions (surveillance schedule changes as years pass)

Implementation:
- On the anniversary of treatment completion, trigger SCP regeneration
- Run the same two-step Claude pipeline from S1, but with updated temporal context
- Diff the new SCP against the old one to highlight "What changed this year"
- Store the old version as an archived snapshot
- Notify patient: "Your annual care plan update is ready — here's what changed"

### 3. Survivorship Phase Transitions

The survivorship experience changes over time:

```typescript
const SURVIVORSHIP_PHASES = {
  early: {
    years: '0-2',
    surveillanceIntensity: 'high',      // Appointments every 3-6 months
    journalFrequency: 'daily',
    riskLevel: 'highest',
    notificationCadence: 'frequent',
    lateEffectsFocus: 'acute_management',
  },
  mid: {
    years: '3-5',
    surveillanceIntensity: 'moderate',   // Appointments every 6-12 months
    journalFrequency: 'few_times_weekly',
    riskLevel: 'elevated',
    notificationCadence: 'moderate',
    lateEffectsFocus: 'chronic_management',
  },
  late: {
    years: '5+',
    surveillanceIntensity: 'standard',   // Annual appointments
    journalFrequency: 'weekly_or_as_needed',
    riskLevel: 'baseline_elevated',     // Still elevated for ER+ (risk continues to 20+ years)
    notificationCadence: 'light',
    lateEffectsFocus: 'long_term_monitoring',
  },
};
```

When a patient transitions between phases:
- Update `currentPhase` on `SurvivorshipPlan`
- Adjust surveillance schedule (frequency changes)
- Adjust notification cadence (less frequent as years pass)
- Adjust journal prompting (daily → few times weekly → weekly)
- Notify patient: "You've reached a new milestone in your survivorship journey" with explanation of what changes

### 4. End-to-End Testing

Test the complete survivorship journey for three patient archetypes:

**Patient A: ER+ early stage on anastrozole**
- Treatment completion → SCP generated with 10-year endocrine therapy plan
- Surveillance: mammogram + clinical exam + DEXA + annual gyn
- Journal: hot flashes + joint pain prominent
- Lifestyle: strong exercise-recurrence evidence, alcohol risk quantified
- Phase transition at year 2: surveillance frequency decreases
- ctDNA: not recommended for low-risk early stage (verify this is reflected)

**Patient B: TNBC post-AC-T, high risk**
- Treatment completion → SCP with high recurrence risk warning (years 1-3)
- Surveillance: mammogram + clinical exam + cardiac echo (anthracycline)
- Journal: neuropathy + fatigue + chemo brain
- ctDNA: recommended, results tracked
- Simulated positive ctDNA at month 14 → trial re-matching triggered

**Patient C: HER2+ post-TCHP + trastuzumab maintenance**
- Completion type: "ongoing maintenance" (trastuzumab continues)
- SCP reflects ongoing therapy
- Surveillance: cardiac monitoring prominent
- Transition to full survivorship when trastuzumab completes

### 5. User Feedback Integration

Add feedback collection points:
- After SCP reading: "Was this plan helpful? What's missing?"
- After weekly summary: "Was this summary accurate?"
- After appointment prep: "Did you use this with your doctor? Was it helpful?"
- After 3 months of journal use: "How is the journal working for you?"

Store feedback for future iteration.

---END---

---

## SESSION S8: Recurrence Pathway — Full Cascade

---START---

# OncoVax — Recurrence Pathway (Full Cascade)

This is Session S8, the most architecturally significant session in Phase 5. Recurrence is not a new module — it's a state transition that re-activates the entire platform with updated context. Every module already built (trial matching, Treatment Translator, Financial Assistance Finder, sequencing navigator, survivorship monitoring) already knows how to operate on a patient profile. Recurrence changes the profile and triggers a coordinated cascade across all modules simultaneously.

**CRITICAL DESIGN RULE:** The platform NEVER announces recurrence. It ONLY responds to what the patient or their doctor reports. If ctDNA is positive, the platform says "discuss with your oncologist." If the patient uploads a scan showing progression, the platform responds supportively. It never says "you have recurrence" before the patient knows.

## Context

Reference: ONCOVAX_SURVIVORSHIP_SPEC.md Section 9 (full recurrence pathway — the largest section in the spec at ~500 lines).

The recurring tumor is biologically different from the original. It may have acquired resistance mutations, changed biomarker expression, or metastasized to new sites. This means the original treatment plan is obsolete, the genomic profile may need updating, and clinical trials become the best available option more often than at initial diagnosis.

## What to build

### 1. Prisma Schema — Recurrence Event Model

```prisma
model RecurrenceEvent {
  id                    String   @id @default(uuid())
  patientId             String
  patient               Patient  @relation(fields: [patientId], references: [id])
  
  detectedDate          DateTime
  detectionMethod       String    // "ctdna_positive", "imaging", "clinical_exam", "symptoms", "pathology", "lab_abnormality"
  
  recurrenceType        String    // "local", "regional", "distant", "contralateral"
  recurrenceSites       String[]  // "bone", "liver", "lung", "brain", "chest_wall", "lymph_nodes"
  confirmedByBiopsy     Boolean   @default(false)
  newPathologyAvailable Boolean   @default(false)
  
  newStage              String?
  newBiomarkers         Json?     // If re-biopsy shows changed markers
  
  timeSinceInitialDx    Int       // Months
  timeSinceCompletion   Int       // Months
  ctdnaResultId         String?   // If detected via ctDNA
  priorTreatments       String[]
  
  documentUploadId      String?
  
  // Cascade tracking
  cascadeStatus         Json      // Track which cascade steps have been completed
  // { acknowledged: bool, supportOffered: bool, trialRematched: bool, 
  //   translatorRegenerated: bool, sequencingRecommended: bool, 
  //   financialRematched: bool, careTeamUpdated: bool }
  
  acknowledgedAt        DateTime?
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### 2. Recurrence Detection Entry Points

Build four entry paths that create a `RecurrenceEvent`:

**a) Patient self-report** — Add to survivorship dashboard: "My cancer has come back" or "I have new concerning results." Opens a guided flow:
- What happened? (doctor told me / scan showed something / I have new symptoms / ctDNA positive)
- When? (date picker)
- Where? (body location if known)
- Do you have any documents to upload? (scan report, biopsy, letter)
- Creates `RecurrenceEvent` → triggers cascade

**b) Document upload trigger** — When a patient uploads a document during survivorship, Claude Vision scans for recurrence-indicating language ("progression," "recurrent," "new metastatic lesion," "increase in tumor size"). If detected:
- Do NOT announce recurrence
- Flag the document: "This document appears to contain information about a change in your cancer status. Would you like to update your profile?"
- If patient confirms → create `RecurrenceEvent` → trigger cascade

**c) ctDNA positive auto-trigger** — From Session S6: when a ctDNA result is entered as "detected," auto-create a preliminary `RecurrenceEvent` with `detectionMethod: "ctdna_positive"` and `confirmedByBiopsy: false`. This is a molecular signal, not confirmed recurrence. The cascade is modified — it triggers trial re-matching and sequencing recommendation but NOT Treatment Translator regeneration (wait for clinical confirmation).

**d) MyChart FHIR sync** — When connected, detect new `Condition` resources with recurrence/metastatic coding (ICD-10 codes containing secondary neoplasm diagnoses C77-C79, or recurrence qualifiers). Auto-create `RecurrenceEvent` → trigger cascade.

### 3. Orchestrated Response Cascade

When a `RecurrenceEvent` is created, the platform triggers a 10-step cascade. THE ORDER MATTERS — emotional support first, clinical action second, logistics third.

**Step 1: Acknowledge + Stabilize (immediate)**
Show a dedicated screen — not a notification, not a dashboard card. A full-screen, warm, carefully worded response:

```
We're here with you.

A recurrence diagnosis is devastating — there's no way around that.
But here's what's also true: you've navigated this before, and the
treatment landscape has likely changed since your first diagnosis.

We're already working to find your options.

[See what we're doing for you]    [I need to talk to someone now]
```

The "I need to talk to someone now" button surfaces: Crisis Text Line (741741), Cancer Support Community helpline, and the patient's oncologist contact from their care team.

**Step 2: Re-sequencing Recommendation (within hours)**
The recurrent tumor is biologically different. Recommend re-biopsy and genomic testing:
- Tissue re-biopsy recommendation with explanation of why
- Liquid biopsy option (ctDNA panel) as faster/less invasive alternative
- Insurance coverage check for repeat genomic testing (use Financial Assistance Finder)
- If Phase 2 sequencing navigator is built: route directly to sequencing journey with recurrence context

**Step 3: Genomic Comparison (when new data available)**
If the patient gets re-sequenced, compare new genomic profile to original:
- Resistance mutations identified (e.g., ESR1 mutations after aromatase inhibitor exposure)
- Biomarker changes (ER/PR/HER2 status changes occur in ~20% of recurrences)
- TMB/MSI changes
- Claude-generated comparison report in patient-friendly language
- Flag clinically actionable changes

**Step 4: Trial Re-Matching (immediate with available data)**
Re-run Phase 1 matching engine with recurrence context:
- Filter for trials accepting recurrent/progressive disease
- Prior-treatment awareness (exclude drugs already tried — they failed)
- Prioritize: personalized vaccine trials, new mechanism of action trials, combination immunotherapy
- Surface compassionate use + Right to Try pathways (from Phase 4)
- Present results: "We found {N} trials for your updated situation"

**Step 5: Treatment Translator Regeneration (after clinical confirmation)**
Generate a completely new Treatment Translator document — not an update to the original. The treatment landscape for recurrent cancer is entirely different:
- Second-line and beyond treatment options
- Honest but supportive prognosis framing
- New financial landscape (different drugs, potentially different coverage)
- New side effect profiles

**Step 6: Second Opinion Escalation**
Recurrence heightens the importance of expert review:
- NCI-designated cancer center finder (71 centers) with distance
- Virtual second opinion options (MSK, Cleveland Clinic, Dana-Farber)
- "How to seek a second opinion" practical guide
- If SECOND module is built: auto-trigger second opinion recommendation

**Step 7: Financial Assistance Re-Matching**
Re-run Financial Assistance Finder with recurrence context:
- New drug PAP eligibility (different drugs = different programs)
- Copay foundation re-enrollment
- Employment/disability guidance (FMLA rights, SSI/SSDI if applicable)
- Travel assistance for new treatment or trial site

**Step 8: Care Team Update**
Suggest new specialists based on recurrence type:
- Distant recurrence to bone → orthopedic oncology
- Brain metastasis → neuro-oncology + radiation oncology
- Liver metastasis → interventional radiology
- Recommend palliative care integration (reframe: "living better, not giving up" — per the PALLIATIVE module)

**Step 9: Survivorship Plan Archive + Reset**
- Archive the current survivorship plan (it's now history)
- Pause surveillance schedule (patient is back in active treatment)
- Journal adapts: add new tracking dimensions for recurrence treatment
- Platform mode transitions from "survivorship" back to "active treatment"

**Step 10: Phase 3 Pipeline Activation (if built)**
If Phase 3 (PREDICT) is live and the patient has new sequencing data:
- Recommend running the neoantigen pipeline on the recurrent tumor
- Generate new vaccine blueprint targeting evolved neoantigens
- This is the killer loop: survivorship → molecular relapse → new blueprint → trial/manufacturing

### 4. Cascade Status Tracking

Track which cascade steps have been completed for each recurrence event. Show progress to the patient: "Here's what we've done for you so far, and what's coming next."

```typescript
interface CascadeStatus {
  acknowledged: boolean;
  supportOffered: boolean;
  resequencingRecommended: boolean;
  genomicComparisonReady: boolean;
  trialRematched: boolean;
  translatorRegenerated: boolean;
  secondOpinionOffered: boolean;
  financialRematched: boolean;
  careTeamUpdated: boolean;
  planArchived: boolean;
  pipelineActivated: boolean;
}
```

### 5. Recurrence-Specific Routes

```
/recurrence                     — Acknowledgment + support landing
/recurrence/support             — Crisis resources + peer connections
/recurrence/sequencing          — Re-sequencing recommendation + journey
/recurrence/comparison          — Genomic comparison (original vs recurrent)
/recurrence/trials              — Updated trial matches for recurrent disease
/recurrence/treatment           — Regenerated Treatment Translator
/recurrence/second-opinion      — Second opinion guidance
/recurrence/financial           — Updated financial assistance
/recurrence/team                — Care team update recommendations
```

### 6. Notification Sequence

Recurrence notifications are carefully timed — support first, clinical second:

```typescript
const RECURRENCE_NOTIFICATIONS = [
  // Immediate (within minutes)
  { type: 'acknowledgment', message: "We're here with you", channel: 'in_app', priority: 'critical' },
  
  // Within hours
  { type: 'support_resources', message: "Support resources available", channel: 'email', delay: '2h' },
  { type: 'trial_results', message: "We've found options for you", channel: 'email', delay: '4h' },
  
  // Within days (only after patient has engaged)
  { type: 'sequencing_recommendation', message: "Re-testing can reveal new options", channel: 'email', delay: '24h', requiresPriorEngagement: true },
  { type: 'financial_update', message: "Updated financial assistance", channel: 'email', delay: '48h', requiresPriorEngagement: true },
  
  // NEVER send these without patient engagement:
  // - Treatment landscape details
  // - Prognosis information
  // - Second opinion push
  // These wait for the patient to open the recurrence dashboard
];
```

### 7. End-to-End Testing

Test the complete recurrence cascade for three scenarios:

**Scenario A: ctDNA-detected molecular relapse**
- Patient in survivorship → ctDNA result entered as "detected"
- Preliminary RecurrenceEvent created
- Trial re-matching triggered (molecular relapse trials)
- Re-sequencing recommended
- Treatment Translator NOT regenerated (awaiting clinical confirmation)
- Patient confirms with imaging → full cascade activates

**Scenario B: Patient reports distant recurrence**
- Patient clicks "My cancer has come back" → guided flow
- Reports bone metastasis confirmed by PET scan
- Full cascade triggers immediately
- Acknowledgment screen → support → trials → translator → financial → care team → plan archived
- Verify cascade status tracking shows all steps completed

**Scenario C: Document upload triggers detection**
- Patient uploads PET scan report → Claude detects "new osseous metastatic disease"
- Platform asks: "This document appears to contain information about a change in your cancer status. Would you like to update your profile?"
- Patient confirms → RecurrenceEvent created → cascade triggers
- Verify the platform NEVER said "you have recurrence" — only responded to what the patient confirmed

**For all scenarios:** Verify the platform NEVER announces recurrence before the patient knows. Verify support/crisis resources are always the first thing presented. Verify clinical details are gated behind patient engagement (they have to choose to see them).

---END---
