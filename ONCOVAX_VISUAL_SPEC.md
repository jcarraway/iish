# Visual Science Library — Technical Specification v1.0

## Interactive Visualizations for Cancer Education (VISUAL)

**Author:** Rett (Happy Medium)
**Date:** March 2026
**Depends on:** LEARN module (articles host the visualizations)
**Purpose:** A library of interactive, animated visualizations that explain cancer biology, treatment mechanisms, diagnostic processes, and the platform's own pipeline — embedded within LEARN articles. Studio-quality visual science communication that makes the platform's educational content categorically better than anything else online.

---

## Table of Contents

1. [Why This Matters](#1-why-this-matters)
2. [Interaction Patterns](#2-interaction-patterns)
3. [Visualization Catalog](#3-visualization-catalog)
4. [Technical Architecture](#4-technical-architecture)
5. [Design System](#5-design-system)
6. [Build Sequence](#6-build-sequence)

---

## 1. Why This Matters

Cancer education online is text and stock photography. The actual science — how mutations cause cancer, how drugs find their targets, how the immune system recognizes threats, how DNA gets sequenced — is inherently spatial, mechanical, and temporal. These concepts have moving parts. They have cause and effect. They have before-and-after states. Text is the wrong medium.

The platform has three proof-of-concept visualizations:

1. **Neoantigen immune recognition** — a 6-stage stepper walking through normal cell → mutation → immune recognition → immune evasion → vaccine training → cancer cell destruction
2. **ADC mechanism** — a scrubable timeline animation showing an antibody-drug conjugate finding, binding, internalizing, releasing payload, and killing cancer cells (with bystander effect)
3. **Checkpoint inhibitor** — an interactive toggle demonstrating PD-1/PD-L1 blockade, where the user turns on the drug and watches T-cells reactivate

Each of these takes a concept that patients struggle with for weeks and makes it intuitively clear in 30 seconds. That's the value proposition. A patient who watches the ADC animation understands why Enhertu works for HER2-low cancer in a way that no paragraph of text achieves.

The strategic value is threefold:

**SEO:** Interactive content increases time-on-page (a ranking signal), reduces bounce rate (a ranking signal), and generates backlinks (other sites embed or reference the visualizations). Google increasingly rewards pages with rich interactive content over text-only pages.

**Conversion:** A patient who interacts with a visualization is emotionally engaged with the content. The step from "this is fascinating" to "let me check if I qualify for a trial with this drug" is much shorter than from a wall of text.

**Differentiation:** Nobody else has this. ACS has text. WebMD has text with stock photos. BreastCancer.org has text with basic diagrams. Nature Reviews has beautiful static figures behind a paywall. Interactive, animated, studio-quality science visualization embedded in patient-accessible educational content is an entirely unoccupied category.

---

## 2. Interaction Patterns

Every visualization uses one of four interaction patterns. The pattern is chosen based on the concept being explained.

### 2.1 Stage Stepper

**When to use:** Concepts that are sequential — one thing happens, then the next, then the next. The user needs to understand each stage before the next makes sense.

**Interaction:** Dots/pills showing position. Next/Previous buttons. Click any dot to jump. Auto-play optional.

**Examples:** Immune recognition cascade, metastasis process, vaccine manufacturing pipeline, how sequencing works, the cell cycle.

**UX pattern:**
```
[● ○ ○ ○ ○ ○]  Stage 1 of 6

[SVG scene — changes completely between stages]

Caption text explaining this stage.

[Previous] [Next]
```

### 2.2 Timeline Animation

**When to use:** Continuous processes where the interesting thing is the flow of motion — a molecule traveling, a cell dividing, a drug being absorbed. The user benefits from seeing the full motion, not just discrete snapshots.

**Interaction:** Play/Pause button. Scrubable progress bar (click to seek). Phase labels update as animation progresses. Captions change at phase transitions.

**Examples:** ADC mechanism (built), how chemotherapy kills dividing cells, how radiation damages DNA, blood flow and drug distribution, tumor growth over time.

**UX pattern:**
```
[16:9 animation canvas]

[▶/❚❚] [━━━━━━━━━━━━━━━] Phase label
Caption text for current phase.
```

### 2.3 Interactive Toggle/Slider

**When to use:** Concepts where the insight is a before/after comparison or a parameter that changes behavior. The user learns by toggling a state and seeing the consequence.

**Interaction:** Toggle switch, slider, or button group that changes the visualization state. Smooth transitions between states. Status indicator shows current state.

**Examples:** Checkpoint inhibitor on/off (built), estrogen receptor blocking (tamoxifen on/off), HER2 expression levels (slider: 0 → 1+ → 2+ → 3+), tumor mutational burden spectrum, drug dose-response.

**UX pattern:**
```
[SVG scene — transitions smoothly between states]

[Toggle/Slider] Label          [Status badge]
Caption explaining current state.
```

### 2.4 Explorable Diagram

**When to use:** Complex systems where the user wants to understand the whole and then zoom into parts. Click a component to learn more about it. The overview stays visible while details expand.

**Interaction:** Clickable components within a diagram. Clicking a component highlights it and shows a detail panel (or sends a prompt for deeper explanation). Hover states indicate clickability.

**Examples:** Cell anatomy with organelles, tumor microenvironment, the immune system's components, a pathology report walkthrough (click each field), the neoantigen prediction pipeline.

**UX pattern:**
```
[SVG diagram with clickable components — hover shows cursor:pointer]

Click any component to learn more.
[Detail panel or sendPrompt for deeper explanation]
```

---

## 3. Visualization Catalog

### 3.1 Cancer Biology Fundamentals

These visualizations explain the basic science that every other concept builds on.

| # | Visualization | Type | LEARN article | Description |
|---|--------------|------|---------------|-------------|
| B1 | How mutations cause cancer | Stepper | breast-cancer-basics | Normal DNA replication → mutation occurs → protein changes → cell divides uncontrollably → tumor forms. Show the single-letter change that starts everything. |
| B2 | Cancer cell vs normal cell | Toggle | what-makes-cancer-different | Side-by-side comparison. Toggle highlights: uncontrolled division, ignore death signals, evade immune system, grow blood vessels, invade tissue. |
| B3 | How cancer spreads (metastasis) | Timeline | metastasis-explained | Cell detaches → enters bloodstream → travels → exits at distant site → colonizes. Show the "seed and soil" concept. |
| B4 | Tumor microenvironment | Explorable | tumor-microenvironment | Cancer cells surrounded by immune cells, blood vessels, fibroblasts, signaling molecules. Click each component to learn its role. The tumor is an ecosystem, not just bad cells. |
| B5 | The immune system vs cancer | Stepper | immune-system-cancer | Built (proof of concept). Neoantigen presentation → T-cell recognition → immune evasion → vaccine solution. |
| B6 | Breast cancer subtypes | Toggle | breast-cancer-subtypes | Same cell, different receptors. Toggle between ER+/HER2-, HER2+, HER2-low, TNBC. Show receptor density on cell surface, explain why subtype determines treatment. |

### 3.2 Treatment Mechanisms

The most important category — patients need to understand how their specific treatment works.

| # | Visualization | Type | LEARN article | Description |
|---|--------------|------|---------------|-------------|
| T1 | How ADCs work | Timeline | what-are-antibody-drug-conjugates | Built. Antibody finds target → binds → internalizes → payload releases → DNA damage → cell death → bystander effect. |
| T2 | How checkpoint inhibitors work | Toggle | immunotherapy-breast-cancer | Built. PD-1/PD-L1 blockade, T-cell reactivation. |
| T3 | How chemotherapy kills cancer cells | Timeline | chemotherapy-explained | Drug enters bloodstream → reaches dividing cell → interrupts DNA replication (show DNA helix being disrupted) → cell can't divide → cell death. Also show why it affects hair/gut (fast-dividing normal cells). |
| T4 | How endocrine therapy works | Toggle | endocrine-therapy-long-term | Three modes: (a) tamoxifen blocks estrogen receptor, (b) aromatase inhibitor stops estrogen production, (c) SERD degrades the receptor entirely. Toggle between each to see the different mechanisms. |
| T5 | How PROTAC degraders work | Timeline | what-are-protac-degraders | Revolutionary mechanism: PROTAC grabs the target protein AND the cell's garbage disposal system → brings them together → protein gets tagged for destruction → recycled. Different from blocking — the protein is physically removed. |
| T6 | How radiation damages cancer DNA | Timeline | radiation-therapy-breast-cancer | Photon beam → enters tissue → hits DNA → double-strand break → cell tries to repair → repair fails → cell death. Show why cancer cells are worse at repair than normal cells. |
| T7 | How cold capping preserves hair | Toggle | cold-capping-during-chemo | Side-by-side: scalp with and without cold cap. Cold constricts blood vessels → less chemo reaches hair follicles → follicles survive. Show temperature and blood flow difference. |
| T8 | How CDK4/6 inhibitors work | Timeline | cdk-inhibitors-breast-cancer | Cell cycle diagram (G1 → S → G2 → M). CDK4/6 is the "green light" for entering S phase. Inhibitor = red light. Cell stuck in G1, can't replicate. |
| T9 | Surgery: lumpectomy vs mastectomy | Toggle | lumpectomy-vs-mastectomy | Cross-section of breast. Toggle between: lumpectomy (remove tumor + margin) vs mastectomy (remove entire breast tissue). Show margin concept — why clean margins matter. |
| T10 | How mRNA cancer vaccines work | Stepper | personalized-cancer-vaccines | Full pipeline: sequence tumor → find neoantigens → design mRNA → LNP encapsulation → injection → muscle cell uptake → neoantigen production → T-cell training → cancer cell killing. This is the platform's signature visualization. |

### 3.3 Diagnostics & Testing

Help patients understand what happens to their samples and what results mean.

| # | Visualization | Type | LEARN article | Description |
|---|--------------|------|---------------|-------------|
| D1 | How tumor sequencing works | Timeline | should-i-get-genomic-testing | Biopsy → DNA extraction → fragmentation → library prep → sequencing machine (flow cell with fluorescent bases) → raw data → alignment → variant calling → report. Demystify the black box. |
| D2 | HER2 scoring explained | Slider | her2-testing-explained | Interactive slider: IHC 0 → 1+ → 2+ → 3+. Show increasing density of HER2 receptors on cell surface. At each level, show which treatments are available. Highlight the HER2-low zone (1+ and 2+/FISH-). |
| D3 | Reading your pathology report | Explorable | how-to-read-pathology-report | Visual mock pathology report. Click each field (grade, stage, ER/PR/HER2, margins, Ki-67, lymph nodes) → field highlights and explanation panel shows what it means and why it matters. |
| D4 | What Oncotype DX measures | Slider | oncotype-dx-score-meaning | 21-gene panel visualized as a heat map. Slider moves score from 0-100. Show risk zones (low/intermediate/high), show the decision boundary for chemotherapy benefit. Explain what the score actually predicts. |
| D5 | How ctDNA monitoring works | Timeline | ctdna-liquid-biopsy-monitoring | Tumor sheds DNA fragments into blood → blood draw → isolate cell-free DNA → sequence → detect tumor mutations → track over time. Show how levels correlate with tumor burden. |
| D6 | Liquid biopsy vs tissue biopsy | Toggle | genetic-vs-genomic-testing | Side-by-side: needle biopsy of tumor (invasive, one snapshot, one location) vs blood draw (non-invasive, captures heterogeneity, repeatable). Toggle to compare pros/cons of each. |

### 3.4 The Platform Pipeline

Visualizations that explain what the platform's own technology does — directly supporting Phase 2 and Phase 3.

| # | Visualization | Type | LEARN article | Description |
|---|--------------|------|---------------|-------------|
| P1 | The neoantigen prediction pipeline | Stepper | personalized-cancer-vaccines | FASTQ → alignment → variant calling → HLA typing → peptide generation → binding prediction → ranking → vaccine design. Each step shows what data goes in and comes out, mapped to the platform's actual Phase 3 pipeline. |
| P2 | How MHC presents peptides | Stepper | (embedded in vaccine article) | Protein gets chopped by proteasome → peptide loaded onto MHC in ER → MHC-peptide complex travels to cell surface → T-cell receptor checks it. The molecular basis of immune recognition. |
| P3 | How mRNA gets translated | Timeline | (embedded in vaccine article) | mRNA enters cell → ribosome reads codons → amino acids assembled → protein folds → protein gets processed → peptides displayed. Show why codon optimization matters (faster translation = more protein). |
| P4 | Binding prediction explained | Toggle | (embedded in pipeline article) | Peptide in the MHC groove. Slider changes the peptide sequence → binding score changes → color shifts from red (no binding) to green (strong binding). Show why shape complementarity matters. |

### 3.5 Side Effects & Supportive Care

Visual explanations of why side effects happen — helps patients understand and manage them.

| # | Visualization | Type | LEARN article | Description |
|---|--------------|------|---------------|-------------|
| S1 | Why chemo causes these specific side effects | Explorable | managing-chemo-side-effects | Body diagram. Click each area: hair (fast-dividing follicles), mouth (fast-dividing mucosa), gut (fast-dividing lining), bone marrow (blood cell production), nails. Each click explains why chemo affects this tissue and what to do about it. |
| S2 | How neuropathy develops | Stepper | neuropathy-during-taxol | Nerve cell anatomy → taxol stabilizes microtubules → nerve can't transport signals → numbness/tingling → potential recovery over time. Show the axonal transport disruption. |
| S3 | How radiation affects skin | Timeline | radiation-therapy-breast-cancer | Week 1 (mild redness) → Week 2 (increasing) → Week 3 (peak) → Week 4 (desquamation possible) → Post-treatment (recovery). Show cumulative effect and why skin care timing matters. |
| S4 | How endocrine therapy affects the body | Explorable | aromatase-inhibitor-joint-pain | Body diagram for endocrine therapy side effects. Click joints (stiffness — why?), bones (density loss — why?), brain (hot flashes — why?), mood. Connect each to the estrogen deprivation mechanism. |

### 3.6 Screening & Prevention

| # | Visualization | Type | LEARN article | Description |
|---|--------------|------|---------------|-------------|
| V1 | How AI reads mammograms | Toggle | ai-in-breast-cancer-screening | Side-by-side: standard mammogram vs AI-highlighted mammogram. Toggle AI overlay showing attention map — where the algorithm found suspicious areas. Show sensitivity/specificity comparison. |
| V2 | Breast cancer risk factors | Explorable | breast-cancer-risk-factors | Interactive risk landscape. Toggle risk factors on/off (genetics, age, hormones, lifestyle, environmental) and see relative risk change. Not a calculator — a conceptual map of how risks compound. |

---

## 4. Technical Architecture

### 4.1 Component Structure

Each visualization is a self-contained component:

```typescript
interface Visualization {
  id: string;                            // "adc-mechanism"
  title: string;                         // "How antibody-drug conjugates work"
  type: "stepper" | "timeline" | "toggle" | "explorable";
  articleSlug: string;                   // Which LEARN article hosts this
  
  // Content
  stages?: Stage[];                      // For stepper type
  phases?: Phase[];                      // For timeline type
  states?: State[];                      // For toggle type
  components?: Component[];              // For explorable type
  
  // Technical
  viewBox: { width: number; height: number };
  aspectRatio: string;                   // "16/9", "16/10", "4/3"
  animationDuration?: number;            // For timeline type, in ms
  supportsReducedMotion: boolean;        // Always true
  
  // Metadata
  scientificAccuracy: {
    lastReviewed: string;
    reviewer: string;
    references: string[];
  };
}
```

### 4.2 Rendering Approach

All visualizations use HTML5 Canvas for rendering, with HTML overlays for controls and captions. Canvas gives per-pixel control over glows, particle systems, gradient compositing, and smooth interpolation that SVG cannot achieve at this quality level.

- **Canvas for the science:** All biological illustrations, molecular structures, cell diagrams, and treatment mechanisms are rendered via `<canvas>` with `getContext('2d')`. Canvas handles radial gradients, alpha compositing, procedural shape generation (membrane wobble, organic curves), and particle systems natively. Every visualization runs a `requestAnimationFrame` loop for continuous ambient animation (floating cells, drifting particles, membrane fluidity) even when not being actively interacted with — the scene should always feel alive.
- **HTML overlay for controls + captions:** Play/pause buttons, toggles, sliders, phase labels, and caption text sit in an absolutely-positioned overlay on top of the canvas. The overlay uses a gradient fade from transparent to the scene background color (`rgba(8,11,16,0.95)`) so controls feel integrated into the scene, not bolted on top.
- **JavaScript for everything:** Each visualization is a self-contained JS module (300-600 lines) that manages its own render loop, state machine, and interaction handlers. No frameworks. The canvas is redrawn every frame — state changes are interpolated smoothly (e.g., `drug += (drugTarget - drug) * 0.04`) rather than snapped.
- **DPI awareness:** All canvas rendering accounts for `devicePixelRatio` — canvas dimensions are multiplied by DPR, then scaled back via `setTransform`, producing crisp output on Retina/HiDPI displays without blurring.
- **Static fallback:** For SEO and no-JS environments, each visualization has a pre-rendered PNG key frame (exported from the canvas at a significant moment) that serves as the `<noscript>` fallback and the Open Graph image.

### 4.3 File Organization

```
packages/visualizations/
├── src/
│   ├── biology/
│   │   ├── B1-mutations-cause-cancer.html
│   │   ├── B2-cancer-vs-normal.html
│   │   ├── B3-metastasis.html
│   │   ├── B4-tumor-microenvironment.html
│   │   ├── B5-immune-recognition.html
│   │   └── B6-breast-cancer-subtypes.html
│   ├── treatments/
│   │   ├── T1-adc-mechanism.html
│   │   ├── T2-checkpoint-inhibitor.html
│   │   ├── T3-chemotherapy.html
│   │   ├── T4-endocrine-therapy.html
│   │   ├── T5-protac-degrader.html
│   │   ├── T6-radiation-dna-damage.html
│   │   ├── T7-cold-capping.html
│   │   ├── T8-cdk-inhibitor.html
│   │   ├── T9-lumpectomy-vs-mastectomy.html
│   │   └── T10-mrna-vaccine-full.html
│   ├── diagnostics/
│   │   ├── D1-tumor-sequencing.html
│   │   ├── D2-her2-scoring.html
│   │   ├── D3-pathology-report.html
│   │   ├── D4-oncotype-dx.html
│   │   ├── D5-ctdna-monitoring.html
│   │   └── D6-liquid-vs-tissue-biopsy.html
│   ├── pipeline/
│   │   ├── P1-neoantigen-pipeline.html
│   │   ├── P2-mhc-presentation.html
│   │   ├── P3-mrna-translation.html
│   │   └── P4-binding-prediction.html
│   ├── side-effects/
│   │   ├── S1-chemo-side-effects-body.html
│   │   ├── S2-neuropathy.html
│   │   ├── S3-radiation-skin.html
│   │   └── S4-endocrine-side-effects.html
│   └── screening/
│       ├── V1-ai-mammogram.html
│       └── V2-risk-factors.html
├── shared/
│   ├── controls.css                     # Shared control styles
│   ├── biology-palette.css              # Color system for biological entities
│   └── animation-utils.js              # Shared animation helpers
└── package.json
```

### 4.4 Embedding in LEARN Articles

Visualizations are embedded in LEARN articles via a React component:

```typescript
// In a LEARN article page:
<ArticleVisualization 
  vizId="T1-adc-mechanism"
  placement="after-section-2"           // Where in the article to place it
  fallback="static-diagram.svg"         // Static fallback for SSR/no-JS
/>

// The component:
// 1. Server-renders a static preview image (for SEO — crawlers see the SVG)
// 2. Client-side hydrates into the interactive version
// 3. Lazy-loads — only loads the JS when the visualization scrolls into viewport
// 4. Falls back gracefully if JS is disabled (shows static SVG)
```

### 4.5 Accessibility

Every visualization must be accessible:

- **Reduced motion:** All animations wrapped in `@media (prefers-reduced-motion: no-preference)`. When reduced motion is preferred, show static state with all labels visible.
- **Screen readers:** Each visualization has an `aria-label` describing the overall concept, and each stage/state has descriptive `aria-live` captions that update as the visualization changes.
- **Keyboard navigation:** Steppers can be advanced with arrow keys. Toggles are focusable and space-bar activated. Timeline can be scrubbed with arrow keys.
- **Color independence:** No information conveyed by color alone. Labels, shapes, and positions carry the meaning. Color reinforces but doesn't replace.
- **Fallback:** Static SVG version renders for no-JS environments.

---

## 5. Design System

### 5.1 Visual Register: Cinema Biology

The target aesthetic is Kurzgesagt meets high-end pharma investor deck — luminous, organic, alive. Not textbook diagrams. Not infographics. Cinematic science visualization where biological entities glow, membranes breathe, particles drift, and every interaction feels like watching something happen inside the body.

**Reference touchstones:**
- Kurzgesagt (YouTube) — luminous entities on dark backgrounds, organic shapes, radial glows
- HHMI BioInteractive — scientifically rigorous molecular animation
- Nucleus Medical Media — cinematic 3D medical animation (our target in 2D)
- High-end pharma MOA (mechanism of action) videos — the $50K animations pharma companies commission for investor decks

**What we are NOT:**
- Textbook diagrams (flat shapes, labeled arrows, white backgrounds)
- Infographics (cute icons, pastel palettes, decorative elements)
- Medical clip art (stock illustration style, generic body outlines)
- Dashboard UI (cards, badges, metric displays — that's for the platform, not the visualizations)

### 5.2 The Dark Canvas

All visualizations render on a dark background (#080B10 to #0B0E14 range). This is a deliberate, non-negotiable choice:

- Dark backgrounds make luminous biological entities pop — a glowing T-cell on black reads as "alive" in a way that a purple circle on white reads as "diagram"
- Radial glow effects (the primary visual tool for signaling, recognition, and energy) only work on dark backgrounds — on white they're invisible
- The dark environment creates a sense of looking through a microscope or into the body — immersive rather than analytical
- Controls and captions sit on a gradient overlay that fades from transparent to the dark background, integrating UI into the scene

```css
/* Scene backgrounds — always in this range */
--scene-bg-deep: #080B10;        /* For timeline animations — deepest immersion */
--scene-bg-mid: #0B0E14;         /* For toggle/slider interactions */
--scene-bg-soft: #0E1118;        /* For explorable diagrams — slightly lifted */

/* Overlay gradient for controls */
--overlay-gradient: linear-gradient(transparent, rgba(8,11,16,0.95) 50%);
```

### 5.3 Biology Color Language

Consistent luminous color mapping across all visualizations. These are canvas fill colors (rgba), not CSS variables — they exist in the canvas rendering context only.

```javascript
const BIOLOGY_PALETTE = {
  // === CELLULAR ENTITIES ===
  // Each entity has: fill (radial gradient center), edge (membrane stroke),
  // glow (ambient radial glow), label (text)
  
  cancer: {
    fill: 'rgba(230, 100, 80, 0.2)',        // Warm coral interior
    edge: 'rgba(230, 100, 80, 0.35)',        // Membrane stroke
    glow: 'rgba(230, 100, 80, 0.12)',        // Ambient glow
    label: 'rgba(230, 100, 80, 0.6)',        // Cell name text
    accent: 'rgba(255, 130, 100, 0.5)',      // Receptor heads, surface markers
  },
  immune: {
    fill: 'rgba(140, 130, 230, 0.2)',        // Cool purple interior
    edge: 'rgba(140, 130, 230, 0.35)',
    glow: 'rgba(140, 130, 230, 0.12)',
    label: 'rgba(140, 130, 230, 0.6)',
    accent: 'rgba(160, 150, 240, 0.5)',
    activated: {                              // When immune cell is activated
      fill: 'rgba(140, 130, 230, 0.35)',     // Brighter interior
      edge: 'rgba(160, 150, 255, 0.5)',
      glow: 'rgba(140, 130, 230, 0.25)',     // Stronger glow
      label: 'rgba(180, 170, 255, 0.9)',
    },
  },
  healthy: {
    fill: 'rgba(80, 200, 140, 0.15)',        // Teal-green interior
    edge: 'rgba(80, 200, 140, 0.3)',
    glow: 'rgba(80, 200, 140, 0.08)',
    label: 'rgba(80, 200, 140, 0.5)',
  },
  
  // === MOLECULAR ENTITIES ===
  drug: {
    fill: 'rgba(100, 170, 255, 0.3)',        // Blue — therapeutic agents
    edge: 'rgba(100, 170, 255, 0.5)',
    glow: 'rgba(100, 170, 255, 0.15)',
    label: 'rgba(200, 230, 255, 0.9)',       // Bright label for drug names
  },
  payload: {
    fill: 'rgba(240, 90, 70, 0.7)',          // Hot red — cytotoxic warheads
    glow: 'rgba(240, 90, 70, 0.15)',
  },
  dna: {
    fill: 'rgba(100, 180, 255, 0.4)',        // Blue strands
    damaged: 'rgba(255, 80, 60, 0.7)',       // Red when damaged
  },
  receptor: {
    fill: 'rgba(255, 160, 130, 0.5)',        // Warm — surface receptors (HER2, PD-L1)
    label: 'rgba(255, 200, 180, 0.8)',
  },
  protein_normal: {
    fill: 'rgba(130, 210, 160, 0.5)',        // Green — normal peptides
  },
  protein_mutant: {
    fill: 'rgba(240, 100, 90, 0.6)',         // Red — neoantigens
  },
  
  // === SIGNALING ===
  signal: {
    activation: 'rgba(255, 200, 80, 0.5)',   // Gold — recognition, binding events
    suppression: 'rgba(255, 80, 80, 0.5)',   // Red — inhibition, "stop" signals
    attack: 'rgba(160, 140, 255, 0.8)',      // Purple — immune attack
    death: 'rgba(255, 60, 40, 0.5)',         // Deep red — apoptosis
  },
  
  // === ENVIRONMENT ===
  particle: {
    fill: 'rgba(255, 255, 255, 0.08)',
    opacityRange: [0.02, 0.15],
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.9)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    tertiary: 'rgba(255, 255, 255, 0.35)',
    accent: 'rgba(110, 180, 255, 0.8)',
  },
};
```

### 5.4 Organic Shape Rendering

No perfect circles, no sharp rectangles. Every biological entity uses procedural organic shape with membrane wobble:

```javascript
function drawOrganicCell(ctx, cx, cy, radius, time, color) {
  const points = 36;
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wobble = 
      Math.sin(time * 0.4 + angle * 5) * radius * 0.025 +
      Math.sin(time * 0.7 + angle * 3) * radius * 0.015 +
      Math.sin(time * 0.2 + angle * 7) * radius * 0.008;
    const r = radius + wobble;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  
  // Interior: radial gradient with off-center light source
  const gradient = ctx.createRadialGradient(
    cx - radius * 0.15, cy - radius * 0.15, 0,
    cx, cy, radius
  );
  gradient.addColorStop(0, color.fill.replace('0.2', '0.25'));
  gradient.addColorStop(0.7, color.fill.replace('0.2', '0.06'));
  gradient.addColorStop(1, color.fill.replace('0.2', '0.12'));
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = color.edge;
  ctx.lineWidth = 1.2;
  ctx.stroke();
}
```

**Shape rules:**
- Cell membranes: always 3+ sine wave components for organic wobble
- Molecules: rounded forms with soft radial gradient fills, never flat color
- Receptors: short stems with rounded heads, slight ambient sway
- DNA: curved paths with gentle undulation, never straight
- Particles: simple circles with varying opacity

### 5.5 Glow & Radiance System

Glows are the primary visual language for energy, signaling, and state change:

**Glow types:**
- **Ambient entity glow** — always present, subtle. Radial gradient from entity center outward, opacity 0.08-0.15. Creates the "luminous in darkness" look.
- **Recognition/binding glow** — pulsing gold at the contact point when two entities interact. Sine-modulated radius and opacity.
- **Suppression glow** — pulsing red around immune suppression signals.
- **Activation glow** — expanding purple when immune cells activate.
- **Death glow** — expanding red particle rings from dying cells.
- **Drug aura** — cool blue halo around therapeutic molecules.

**Rule: glow intensity is always animated** (sine wave modulation) — never static. Even "constant" ambient glows have a barely-perceptible slow pulse.

### 5.6 Ambient Particle System

Every scene has 50-80 background particles:
- Opacity range: 0.02-0.15 (most barely visible)
- Size: 0.3-1.8px radius
- Movement: extremely slow constant drift (Brownian motion)
- Wrap at edges (infinite space illusion)
- White only — particles are environmental, not color-coded
- Creates depth and biological atmosphere without distraction

### 5.7 State Interpolation

State changes are never instant. Every transition smoothly interpolates:

```javascript
// Exponential ease-out — runs every frame
currentState += (targetState - currentState) * 0.04;
```

- Toggle states: exponential ease-out (factor 0.03-0.05), ~1-2s to settle
- Timeline scrubbing: linear (frame is a direct function of progress)
- Cascading changes: stagger by 200-400ms (drug appears → bond breaks → T-cell activates → attack → death)
- **No property ever snaps** — if it changes, it interpolates

### 5.8 Control UI Design

Controls sit on a gradient overlay (`linear-gradient(transparent, rgba(8,11,16,0.95) 50%)`) and use the following visual tokens:

- **Play/pause:** 34px circle, 1.5px border `rgba(255,255,255,0.15)`, bg `rgba(255,255,255,0.04)`. Hover brightens both.
- **Toggle:** 48x26px pill, border `rgba(255,255,255,0.2)`. When on: border `rgba(110,180,255,0.5)`, bg `rgba(110,180,255,0.15)`, thumb glows `box-shadow: 0 0 12px rgba(110,180,255,0.5)`.
- **Timeline:** 3px bar, fill `rgba(110,180,255,0.5)`, bg `rgba(255,255,255,0.08)`. Click to seek.
- **Phase label:** 11px, `rgba(110,180,255,0.8)`, font-weight 500.
- **Status badge:** 11px in a pill. Suppressed = `rgba(255,80,80,0.12)` bg / `rgba(255,120,120,0.9)` text. Activated = `rgba(80,200,140,0.12)` bg / `rgba(80,220,140,0.9)` text.
- **Caption:** 13px, `rgba(255,255,255,0.6)`, bold keywords at `rgba(255,255,255,0.9)`.

### 5.9 Canvas Text Rules

- **Entity names:** 500 weight, size ~18-22% of entity radius. Color from palette `label` value.
- **Signal labels:** 500 weight, 9-11px fixed, positioned at signal source or midpoint.
- **State descriptions:** 500 weight, 10-11px, near bottom of scene above overlay.
- **All canvas text uses `var(--font-sans)`.**
- **Minimum 8px.** If entity is too small for label, label goes outside with a thin dashed leader line.

### 5.10 Performance

- Target: 60fps modern hardware, 30fps minimum older devices.
- Batch draw operations: all particles → all cells → all effects → all text.
- `requestAnimationFrame` for all loops.
- Complex scenes (>20 entities): reduce particle count before dropping frame rate.
- **`prefers-reduced-motion`:** Stop all ambient animation, show static scene at most informative state, animate only on explicit user interaction.

---

## 6. Build Sequence

### 6.1 Priority Order

Build based on which articles get the most traffic and which concepts benefit most from visualization:

**Tier 1 — Build first (highest traffic articles, hardest concepts):**
- T1: ADC mechanism (done)
- T2: Checkpoint inhibitor (done)
- B5: Immune recognition stepper (done)
- T3: How chemotherapy works
- D3: Pathology report explorer
- T10: mRNA vaccine full pipeline
- D2: HER2 scoring slider
- B6: Breast cancer subtypes

**Tier 2 — Build second (treatment mechanisms, diagnostic explainers):**
- T4: Endocrine therapy
- T7: Cold capping
- D1: Tumor sequencing pipeline
- S1: Chemo side effects body map
- T6: Radiation DNA damage
- D4: Oncotype DX
- T8: CDK4/6 inhibitors

**Tier 3 — Build third (deeper science, pipeline-specific):**
- B1: Mutations cause cancer
- B3: Metastasis
- T5: PROTAC degraders
- P1: Neoantigen prediction pipeline
- D5: ctDNA monitoring
- S2: Neuropathy
- P2: MHC presentation

**Tier 4 — Build as capacity allows:**
- B2: Cancer vs normal cell
- B4: Tumor microenvironment
- T9: Lumpectomy vs mastectomy
- S3: Radiation skin timeline
- S4: Endocrine side effects body map
- V1: AI mammogram reading
- V2: Risk factors
- D6: Liquid vs tissue biopsy
- P3: mRNA translation
- P4: Binding prediction

### 6.2 Claude Code Sessions

```
SESSION VZ1: Core library + Tier 1 visualizations (Week 1-3)
  1. Visualization component framework
     - Shared CSS (controls, biology palette, animation utilities)
     - React wrapper component for embedding in LEARN articles
     - Lazy loading with Intersection Observer
     - Static SVG fallback generation for SSR
     - Accessibility infrastructure (aria-labels, keyboard nav, reduced motion)
  2. Build Tier 1 visualizations (8 visualizations):
     - T3: How chemotherapy works (timeline animation)
     - D3: Pathology report explorer (explorable diagram)
     - T10: mRNA vaccine full pipeline (stepper — the flagship)
     - D2: HER2 scoring slider (interactive slider)
     - B6: Breast cancer subtypes (toggle)
     - Integrate existing 3 (B5, T1, T2) into the component system
  3. Embed into corresponding LEARN articles
  4. Test accessibility: screen reader, keyboard, reduced motion

SESSION VZ2: Tier 2 visualizations (Week 3-5)
  1. Build Tier 2 visualizations (7 visualizations):
     - T4: Endocrine therapy (toggle — three mechanisms)
     - T7: Cold capping (toggle — blood flow with/without)
     - D1: Tumor sequencing pipeline (stepper)
     - S1: Chemo side effects body map (explorable)
     - T6: Radiation DNA damage (timeline)
     - D4: Oncotype DX (slider)
     - T8: CDK4/6 inhibitors (timeline — cell cycle)
  2. Embed into LEARN articles
  3. Analytics: track visualization interaction rates (play, toggle, click)

SESSION VZ3: Tier 3 visualizations + polish (Week 5-7)
  1. Build Tier 3 visualizations (7 visualizations):
     - B1: Mutations cause cancer (stepper)
     - B3: Metastasis (timeline)
     - T5: PROTAC degraders (timeline)
     - P1: Neoantigen prediction pipeline (stepper)
     - D5: ctDNA monitoring (timeline)
     - S2: Neuropathy (stepper)
     - P2: MHC presentation (stepper)
  2. Polish pass on all Tier 1-2 visualizations
     - Smooth animation timing
     - Color consistency audit
     - Label placement audit
     - Mobile responsiveness check
  3. Performance optimization
     - Lazy load all visualizations
     - Minimize JS bundle per visualization
     - Optimize SVG path complexity

SESSION VZ4: Tier 4 + GIF/video export (Week 7-9)
  1. Build remaining Tier 4 visualizations (8 visualizations)
  2. GIF/video export pipeline
     - Headless browser recording of timeline animations
     - Export as GIF (for social sharing, email embeds)
     - Export as MP4 (for higher quality sharing)
     - Auto-generate social media preview images from key frames
  3. Social sharing integration
     - "Share this visualization" button on each
     - OG image generation from key frame
     - Embeddable widget code (for other sites to embed with attribution)
  4. Analytics dashboard
     - Most-interacted visualizations
     - Average interaction time per visualization
     - Correlation: visualization interaction → signup conversion
```

### 6.3 Timeline

```
Session VZ1:  Week 1-3   (framework + 8 Tier 1 — the essentials)
Session VZ2:  Week 3-5   (7 Tier 2 — treatment + diagnostics)
Session VZ3:  Week 5-7   (7 Tier 3 — deeper science + pipeline)
Session VZ4:  Week 7-9   (8 Tier 4 + export + sharing)

Total: ~9 weeks, 30 visualizations
MVP (VZ1): 3 weeks — 8 key visualizations embedded in highest-traffic articles
Full library (VZ1-VZ4): 9 weeks — 30 visualizations covering all major concepts
```

### 6.4 GIF/Video Export (Session VZ4)

For social media, email campaigns, and sharing:

```typescript
interface VisualizationExport {
  // Automated recording
  recordingMethod: "puppeteer";          // Headless Chrome recording of the animation
  outputFormats: ["gif", "mp4", "webm", "png_sequence"];
  
  // GIF settings
  gif: {
    width: 800;                          // px
    fps: 15;                             // Balance quality vs file size
    maxDuration: 15;                     // seconds
    maxFileSize: "5MB";
    optimization: "lossy";               // Color quantization for smaller files
  };
  
  // MP4 settings
  mp4: {
    width: 1920;                         // Full HD
    fps: 30;
    codec: "h264";
    quality: "high";
  };
  
  // Social media crops
  socialCrops: {
    twitter: { width: 1200, height: 675 };
    instagram: { width: 1080, height: 1080 };
    linkedin: { width: 1200, height: 628 };
    ogImage: { width: 1200, height: 630 };
  };
  
  // Each visualization auto-generates:
  // 1. Full animation as GIF + MP4
  // 2. Key frame as static PNG (for OG images, email embeds)
  // 3. Social media crops of the key frame
  // 4. Thumbnail (300x200) for article cards
}
```

This enables the content team (or automated social pipeline) to share visualization clips on social media — a newly diagnosed patient scrolling Instagram sees a 10-second GIF of how Enhertu works, taps through, and lands on the LEARN article. That's a conversion path that text-only content can never create.
