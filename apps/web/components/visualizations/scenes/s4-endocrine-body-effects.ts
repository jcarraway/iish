// ============================================================================
// S4 — Endocrine Therapy Body Effects: Explorable Body Diagram
// Clickable regions showing estrogen-deprivation side effects:
// Joints (arthralgia), Bones (osteoporosis), Brain (hot flashes/cognition),
// Heart (cardiovascular risk), Mood (depression/anxiety)
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawGlow, drawMolecule,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawWrappedText, drawBadge } from '../framework/text';
import type { ParticleSystem } from '../framework/particles';

// ---------------------------------------------------------------------------
// Body region data
// ---------------------------------------------------------------------------

interface BodyRegion {
  id: string;
  label: string;
  symptom: string;
  mechanism: string;
  management: string;
  frequency: string;
  // Position relative to body center (fractions of body height)
  offsetX: number;
  offsetY: number;
  // Hit radius as fraction of body height
  hitRadius: number;
  color: string;
  icon: 'circle' | 'diamond' | 'triangle' | 'hexagon';
}

const REGIONS: BodyRegion[] = [
  {
    id: 'brain',
    label: 'Brain & Thermoregulation',
    symptom: 'Hot flashes & cognitive changes',
    mechanism: 'Estrogen helps regulate the hypothalamus (body thermostat). Without it, the brain misreads body temperature, triggering sudden heat surges, sweating, and flushing. Estrogen also supports neurotransmitter function, so some patients notice "chemo brain" or word-finding difficulty.',
    management: 'Cooling pillows, layered clothing, venlafaxine or gabapentin for severe flashes. Cognitive exercises and routines help with brain fog.',
    frequency: '60-80% of patients',
    offsetX: 0,
    offsetY: -0.38,
    hitRadius: 0.07,
    color: 'rgba(255,180,100,0.5)',
    icon: 'circle',
  },
  {
    id: 'mood',
    label: 'Mood & Mental Health',
    symptom: 'Depression, anxiety, irritability',
    mechanism: 'Estrogen modulates serotonin and dopamine — neurotransmitters that regulate mood. Blocking estrogen can cause mood swings, increased anxiety, and depression. These are biological, not a sign of weakness.',
    management: 'Therapy (CBT), support groups, SSRIs if needed. Exercise is evidence-based for mood improvement. Tell your oncologist — dose or medication adjustments may help.',
    frequency: '30-50% of patients',
    offsetX: 0.18,
    offsetY: -0.32,
    hitRadius: 0.06,
    color: 'rgba(180,140,220,0.5)',
    icon: 'diamond',
  },
  {
    id: 'heart',
    label: 'Cardiovascular System',
    symptom: 'Increased cardiovascular risk',
    mechanism: 'Estrogen has a protective effect on blood vessels — it helps maintain elasticity, supports healthy cholesterol ratios, and reduces inflammation. Aromatase inhibitors remove this protection, gradually increasing cardiovascular risk.',
    management: 'Regular cardiovascular screening, heart-healthy diet, exercise. Statins if indicated by lipid panel. Monitor blood pressure.',
    frequency: 'Gradual increase over years',
    offsetX: -0.12,
    offsetY: -0.12,
    hitRadius: 0.07,
    color: 'rgba(220,90,90,0.5)',
    icon: 'circle',
  },
  {
    id: 'joints',
    label: 'Joints & Muscles',
    symptom: 'Arthralgia (joint pain & stiffness)',
    mechanism: 'Estrogen acts as a natural anti-inflammatory in joints and helps maintain synovial fluid. Without estrogen, joint inflammation increases, leading to morning stiffness, aching fingers/wrists/knees, and reduced grip strength. This is the #1 reason patients stop endocrine therapy.',
    management: 'Gentle exercise (yoga, swimming), omega-3 fatty acids, NSAIDs. Acupuncture has evidence. Switching from anastrozole to letrozole (or vice versa) sometimes helps.',
    frequency: '40-50% of patients',
    offsetX: -0.2,
    offsetY: 0.08,
    hitRadius: 0.06,
    color: 'rgba(100,180,220,0.5)',
    icon: 'hexagon',
  },
  {
    id: 'bones',
    label: 'Bones',
    symptom: 'Osteoporosis & fracture risk',
    mechanism: 'Estrogen is essential for maintaining bone density — it slows down osteoclasts (cells that break down bone). Without estrogen, bones lose mineral content 2-3x faster than normal aging, especially in the spine, hips, and wrists.',
    management: 'DEXA scans every 1-2 years, calcium + vitamin D supplementation, weight-bearing exercise. Bisphosphonates (zoledronic acid) if bone density drops. Denosumab for high risk.',
    frequency: 'Measurable loss in 60-70%',
    offsetX: 0.15,
    offsetY: 0.18,
    hitRadius: 0.07,
    color: 'rgba(200,200,140,0.5)',
    icon: 'triangle',
  },
];

// ---------------------------------------------------------------------------
// Layout for each region in screen coordinates
// ---------------------------------------------------------------------------

interface RegionLayout {
  id: string;
  cx: number;
  cy: number;
  hitR: number;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface State {
  selected: number | null;
  hovered: number | null;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  layouts: RegionLayout[];
  selectedGlow: number;
  bodyCX: number;
  bodyCY: number;
  bodyH: number;
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

export function init(
  _canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SceneAPI {
  const state: State = {
    selected: null,
    hovered: null,
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(30, { width, height }),
    layouts: [],
    selectedGlow: 0,
    bodyCX: width * 0.35,
    bodyCY: height * 0.46,
    bodyH: height * 0.7,
  };

  function computeLayouts() {
    const { w, h, selected } = state;
    const bodyCX = selected !== null ? w * 0.25 : w * 0.38;
    const bodyCY = h * 0.46;
    const bodyH = h * 0.65;
    state.bodyCX = bodyCX;
    state.bodyCY = bodyCY;
    state.bodyH = bodyH;

    state.layouts = REGIONS.map(region => ({
      id: region.id,
      cx: bodyCX + region.offsetX * bodyH,
      cy: bodyCY + region.offsetY * bodyH,
      hitR: region.hitRadius * bodyH,
    }));
  }

  computeLayouts();

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);

    const targetGlow = state.selected !== null ? 1 : 0;
    state.selectedGlow = lerp(state.selectedGlow, targetGlow, dt * 4);

    render();
  }

  function render() {
    const { w, h, time, selected, hovered } = state;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    computeLayouts();

    const { bodyCX, bodyCY, bodyH } = state;

    // ---- Body outline ----
    drawBodyOutline(bodyCX, bodyCY, bodyH);

    // ---- Estrogen molecule indicators (floating, fading out) ----
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + time * 0.3;
      const dist = bodyH * 0.35 + Math.sin(time + i * 1.3) * 10;
      const mx = bodyCX + Math.cos(angle) * dist;
      const my = bodyCY + Math.sin(angle) * dist;
      ctx.globalAlpha = 0.15 + Math.sin(time * 0.5 + i) * 0.05;
      drawMolecule(ctx, mx, my, 3, PALETTE.receptor.er, 'hexagon');
      ctx.globalAlpha = 1;

      // Strike-through to indicate blocked estrogen
      ctx.strokeStyle = 'rgba(255,80,60,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mx - 4, my - 4);
      ctx.lineTo(mx + 4, my + 4);
      ctx.stroke();
    }

    // ---- Clickable regions ----
    for (let i = 0; i < REGIONS.length; i++) {
      const region = REGIONS[i];
      const layout = state.layouts[i];
      const isSelected = selected === i;
      const isHovered = hovered === i;

      // Pulse glow
      const pulseIntensity = isSelected ? 0.7 : isHovered ? 0.4 : 0.15;
      drawGlow(ctx, layout.cx, layout.cy, layout.hitR * 2, region.color, pulseIntensity, time);

      // Icon
      const iconSize = isSelected ? 7 : isHovered ? 6 : 5;
      drawMolecule(ctx, layout.cx, layout.cy, iconSize, region.color, region.icon);

      // Connection line to body center
      ctx.strokeStyle = isSelected
        ? 'rgba(110,180,255,0.2)'
        : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(layout.cx, layout.cy);
      ctx.lineTo(bodyCX, bodyCY + REGIONS[i].offsetY * bodyH * 0.3);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      const labelX = layout.cx + (region.offsetX >= 0 ? layout.hitR + 6 : -layout.hitR - 6);
      const labelAlign: CanvasTextAlign = region.offsetX >= 0 ? 'left' : 'right';
      drawText(ctx, region.symptom.split('&')[0].trim(), labelX, layout.cy, {
        fontSize: 10,
        color: isSelected ? PALETTE.text.accent : isHovered ? PALETTE.text.secondary : PALETTE.text.tertiary,
        align: labelAlign,
      });
    }

    // ---- Title ----
    drawText(ctx, 'Endocrine Therapy Effects', bodyCX, bodyCY - bodyH * 0.48, {
      fontSize: 13, fontWeight: '600', color: PALETTE.text.secondary, align: 'center',
    });
    drawText(ctx, 'Estrogen deprivation impacts throughout the body', bodyCX, bodyCY - bodyH * 0.44, {
      fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
    });

    // ---- Detail panel ----
    if (selected !== null && state.selectedGlow > 0.1) {
      const region = REGIONS[selected];
      const panelX = w * 0.52;
      const panelY = h * 0.04;
      const panelW = w * 0.44;
      const panelH = h * 0.90;

      ctx.globalAlpha = clamp(state.selectedGlow, 0, 1);

      // Background
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelW, panelH, 10);
      ctx.fillStyle = 'rgba(15,20,30,0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(110,180,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawGlow(ctx, panelX + panelW / 2, panelY + 30, 40, 'rgba(110,180,255,0.12)', 0.3, time);

      let py = panelY + 18;
      const px = panelX + 16;
      const maxW = panelW - 32;

      // Title
      drawText(ctx, region.label, px, py, {
        fontSize: 15, fontWeight: 'bold', color: PALETTE.text.primary, baseline: 'top',
      });
      py += 22;

      // Symptom badge
      drawBadge(ctx, region.symptom, px, py, 'rgba(230,100,80,0.1)', PALETTE.cancer.label, 10);
      py += 26;

      // Frequency badge
      drawBadge(ctx, region.frequency, px, py, 'rgba(110,180,255,0.1)', PALETTE.text.accent, 10);
      py += 28;

      // Mechanism
      drawText(ctx, 'Why this happens', px, py, {
        fontSize: 11, fontWeight: '600', color: PALETTE.text.accent, baseline: 'top',
      });
      py += 16;
      py += drawWrappedText(ctx, region.mechanism, px, py, maxW, 16, {
        fontSize: 11, color: PALETTE.text.secondary,
      });
      py += 14;

      // Management
      ctx.beginPath();
      ctx.roundRect(px, py, maxW, 80, 6);
      ctx.fillStyle = 'rgba(80,200,140,0.05)';
      ctx.fill();

      drawText(ctx, 'What helps', px + 10, py + 10, {
        fontSize: 10, fontWeight: '600', color: 'rgba(80,200,140,0.7)', baseline: 'top',
      });
      drawWrappedText(ctx, region.management, px + 10, py + 26, maxW - 20, 15, {
        fontSize: 11, color: 'rgba(80,200,140,0.6)',
      });

      ctx.globalAlpha = 1;
    }

    // ---- Instruction ----
    const instrText = selected === null
      ? 'Click any region to learn about side effects'
      : 'Click another region or click again to close';
    drawText(ctx, instrText, w * (selected !== null ? 0.25 : 0.38), h - 16, {
      fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
    });
  }

  // ---- Body outline renderer ----

  function drawBodyOutline(cx: number, cy: number, bh: number) {
    const scale = bh / 300; // normalize to 300px body

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Head
    ctx.beginPath();
    ctx.arc(cx, cy - 120 * scale, 18 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Neck
    ctx.beginPath();
    ctx.moveTo(cx - 5 * scale, cy - 102 * scale);
    ctx.lineTo(cx - 5 * scale, cy - 90 * scale);
    ctx.moveTo(cx + 5 * scale, cy - 102 * scale);
    ctx.lineTo(cx + 5 * scale, cy - 90 * scale);
    ctx.stroke();

    // Torso
    ctx.beginPath();
    ctx.moveTo(cx - 30 * scale, cy - 90 * scale);
    ctx.quadraticCurveTo(cx - 35 * scale, cy - 50 * scale, cx - 28 * scale, cy - 10 * scale);
    ctx.quadraticCurveTo(cx - 25 * scale, cy + 10 * scale, cx - 20 * scale, cy + 30 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 30 * scale, cy - 90 * scale);
    ctx.quadraticCurveTo(cx + 35 * scale, cy - 50 * scale, cx + 28 * scale, cy - 10 * scale);
    ctx.quadraticCurveTo(cx + 25 * scale, cy + 10 * scale, cx + 20 * scale, cy + 30 * scale);
    ctx.stroke();

    // Shoulders
    ctx.beginPath();
    ctx.moveTo(cx - 30 * scale, cy - 90 * scale);
    ctx.lineTo(cx - 50 * scale, cy - 78 * scale);
    ctx.moveTo(cx + 30 * scale, cy - 90 * scale);
    ctx.lineTo(cx + 50 * scale, cy - 78 * scale);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(cx - 50 * scale, cy - 78 * scale);
    ctx.quadraticCurveTo(cx - 52 * scale, cy - 40 * scale, cx - 48 * scale, cy + 5 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 50 * scale, cy - 78 * scale);
    ctx.quadraticCurveTo(cx + 52 * scale, cy - 40 * scale, cx + 48 * scale, cy + 5 * scale);
    ctx.stroke();

    // Hips
    ctx.beginPath();
    ctx.moveTo(cx - 20 * scale, cy + 30 * scale);
    ctx.quadraticCurveTo(cx - 30 * scale, cy + 40 * scale, cx - 25 * scale, cy + 50 * scale);
    ctx.moveTo(cx + 20 * scale, cy + 30 * scale);
    ctx.quadraticCurveTo(cx + 30 * scale, cy + 40 * scale, cx + 25 * scale, cy + 50 * scale);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(cx - 25 * scale, cy + 50 * scale);
    ctx.quadraticCurveTo(cx - 22 * scale, cy + 90 * scale, cx - 18 * scale, cy + 130 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 25 * scale, cy + 50 * scale);
    ctx.quadraticCurveTo(cx + 22 * scale, cy + 90 * scale, cx + 18 * scale, cy + 130 * scale);
    ctx.stroke();

    // Soft glow on the whole body
    drawGlow(ctx, cx, cy - 20 * scale, 80 * scale, 'rgba(100,180,220,0.05)', 0.2, state.time);
  }

  // ---- Pointer events ----

  function onPointerDown(x: number, y: number) {
    for (let i = 0; i < state.layouts.length; i++) {
      const layout = state.layouts[i];
      const dx = x - layout.cx;
      const dy = y - layout.cy;
      if (dx * dx + dy * dy <= (layout.hitR * 1.5) ** 2) {
        state.selected = state.selected === i ? null : i;
        return;
      }
    }
    if (state.selected !== null) {
      state.selected = null;
    }
  }

  function onPointerMove(x: number, y: number) {
    let found = false;
    for (let i = 0; i < state.layouts.length; i++) {
      const layout = state.layouts[i];
      const dx = x - layout.cx;
      const dy = y - layout.cy;
      if (dx * dx + dy * dy <= (layout.hitR * 1.5) ** 2) {
        state.hovered = i;
        found = true;
        break;
      }
    }
    if (!found) state.hovered = null;
  }

  return {
    update,
    destroy: () => {},
    resize: (w, h) => {
      state.w = w;
      state.h = h;
      resizeParticleSystem(state.particles, w, h);
      computeLayouts();
    },
    onPointerDown,
    onPointerMove,
    nextStage: () => {
      const next = state.selected === null ? 0 : (state.selected + 1) % REGIONS.length;
      state.selected = next;
    },
    prevStage: () => {
      const prev = state.selected === null
        ? REGIONS.length - 1
        : (state.selected - 1 + REGIONS.length) % REGIONS.length;
      state.selected = prev;
    },
    getStage: () => state.selected ?? -1,
  };
}
