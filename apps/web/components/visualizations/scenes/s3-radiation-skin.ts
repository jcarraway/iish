// ============================================================================
// S3 — Radiation Skin Effects: 5-Stage Progression
// Week 1 mild redness → Week 2 increasing → Week 3 peak → Week 4 desquamation
// → Recovery. Progressive skin color change with dose accumulation bar.
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, drawGlow, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawWrappedText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------

const STAGES = [
  {
    label: 'Week 1 — Mild redness',
    caption: 'Skin begins to react with faint pinkness in the treatment area. Similar to a mild sunburn. Most patients barely notice.',
    skinColor: { r: 255, g: 218, b: 195 },
    redness: 0.15,
    flaking: false,
    dosePct: 0.2,
    tips: 'Moisturize gently. Avoid sun exposure.',
  },
  {
    label: 'Week 2 — Increasing irritation',
    caption: 'Redness deepens and skin feels warm or tender to the touch. Itching may begin. The radiation is accumulating in tissue.',
    skinColor: { r: 245, g: 185, b: 160 },
    redness: 0.35,
    flaking: false,
    dosePct: 0.4,
    tips: 'Use fragrance-free moisturizer. Wear loose cotton.',
  },
  {
    label: 'Week 3 — Peak reaction',
    caption: 'Skin is noticeably red and may feel tight or swollen. This is the typical peak for most radiation schedules. Discomfort is common.',
    skinColor: { r: 230, g: 145, b: 120 },
    redness: 0.65,
    flaking: false,
    dosePct: 0.65,
    tips: 'Cool compresses help. Report blistering to your team.',
  },
  {
    label: 'Week 4 — Dry desquamation',
    caption: 'Outer skin layers begin to peel — dry flaking (desquamation). The skin is repairing itself beneath. This looks worse than it is.',
    skinColor: { r: 215, g: 130, b: 110 },
    redness: 0.8,
    flaking: true,
    dosePct: 0.85,
    tips: 'Do not peel flaking skin. Apply prescribed cream.',
  },
  {
    label: 'Recovery — Healing begins',
    caption: 'After treatment ends, skin recovers over 2-4 weeks. Color gradually normalizes. Some darkening or texture change may remain.',
    skinColor: { r: 240, g: 200, b: 180 },
    redness: 0.1,
    flaking: false,
    dosePct: 1.0,
    tips: 'Healing takes time. Skin may remain sensitive.',
  },
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface State {
  stage: number;
  stageProgress: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
  // Flake particles for desquamation stage
  flakes: { x: number; y: number; vx: number; vy: number; r: number; a: number; rot: number }[];
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
    stage: 0,
    stageProgress: 0,
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(25, { width, height }),
    stepperAreas: [],
    flakes: [],
  };

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, STAGES.length - 1);
    state.stageProgress = 0;
    if (!STAGES[state.stage].flaking) {
      state.flakes = [];
    }
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    state.stageProgress = clamp(state.stageProgress + dt * 0.3, 0, 1);

    updateParticles(state.particles, dt * speed);

    // Flake animation for desquamation stage
    const cfg = STAGES[state.stage];
    if (cfg.flaking && state.stageProgress > 0.2 && state.flakes.length < 15) {
      const skinCX = state.w * 0.38;
      const skinCY = state.h * 0.36;
      const skinR = Math.min(state.w, state.h) * 0.18;
      state.flakes.push({
        x: skinCX + (Math.random() - 0.5) * skinR * 1.6,
        y: skinCY + (Math.random() - 0.5) * skinR * 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.3 + Math.random() * 0.3,
        r: 2 + Math.random() * 3,
        a: 0.5 + Math.random() * 0.3,
        rot: Math.random() * Math.PI * 2,
      });
    }

    for (const f of state.flakes) {
      f.x += f.vx * dt * 60;
      f.y += f.vy * dt * 60;
      f.rot += dt * 0.5;
      f.a -= dt * 0.15;
    }
    state.flakes = state.flakes.filter(f => f.a > 0);

    render();
  }

  function render() {
    const { w, h, time, stage, stageProgress } = state;
    const cfg = STAGES[stage];

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // ---- Skin cross-section ----
    const skinCX = w * 0.38;
    const skinCY = h * 0.36;
    const skinW = Math.min(w, h) * 0.42;
    const skinH = Math.min(w, h) * 0.32;

    // Multiple skin layers
    const layers = [
      { name: 'Epidermis', yFrac: 0, hFrac: 0.25, baseColor: cfg.skinColor },
      { name: 'Dermis', yFrac: 0.25, hFrac: 0.45, baseColor: { r: 230, g: 180, b: 160 } },
      { name: 'Subcutaneous', yFrac: 0.70, hFrac: 0.30, baseColor: { r: 200, g: 170, b: 150 } },
    ];

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const lx = skinCX - skinW / 2;
      const ly = skinCY - skinH / 2 + layer.yFrac * skinH;
      const lh = layer.hFrac * skinH;

      // Apply redness to top layer, diminishing with depth
      const rednessInfluence = i === 0 ? cfg.redness : cfg.redness * (0.3 / (i + 1));
      const r = Math.round(lerp(layer.baseColor.r, 230, rednessInfluence));
      const g = Math.round(lerp(layer.baseColor.g, 80, rednessInfluence));
      const b = Math.round(lerp(layer.baseColor.b, 70, rednessInfluence));

      const grad = ctx.createLinearGradient(lx, ly, lx, ly + lh);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.25)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0.15)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(lx, ly, skinW, lh, i === 0 ? [6, 6, 0, 0] : i === 2 ? [0, 0, 6, 6] : 0);
      ctx.fill();

      // Layer boundary
      if (i > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + skinW, ly);
        ctx.stroke();
      }

      // Layer label (right side)
      drawText(ctx, layer.name, lx + skinW + 8, ly + lh / 2, {
        fontSize: 9, color: PALETTE.text.tertiary,
      });
    }

    // Redness glow on skin surface
    if (cfg.redness > 0.1) {
      const glowIntensity = cfg.redness * 0.4;
      drawGlow(ctx, skinCX, skinCY - skinH * 0.2, skinW * 0.6,
        `rgba(230,80,60,${glowIntensity.toFixed(2)})`, glowIntensity, time);
    }

    // Radiation beam indicator (subtle lines from top)
    if (stage < 4) { // Not shown during recovery
      const beamAlpha = 0.15 * (1 - (stage === 4 ? 1 : 0));
      ctx.strokeStyle = `rgba(100,170,255,${beamAlpha.toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      for (let i = 0; i < 5; i++) {
        const bx = skinCX - skinW * 0.3 + (i / 4) * skinW * 0.6;
        ctx.beginPath();
        ctx.moveTo(bx, skinCY - skinH / 2 - 25);
        ctx.lineTo(bx, skinCY - skinH / 2 + 5);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      drawText(ctx, 'Radiation beam', skinCX, skinCY - skinH / 2 - 32, {
        fontSize: 9, color: 'rgba(100,170,255,0.4)', align: 'center',
      });
    }

    // ---- Flakes (desquamation) ----
    for (const f of state.flakes) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.globalAlpha = clamp(f.a, 0, 1);
      ctx.beginPath();
      ctx.ellipse(0, 0, f.r, f.r * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cfg.skinColor.r},${cfg.skinColor.g},${cfg.skinColor.b},0.4)`;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ---- Dose accumulation bar ----
    const barX = w * 0.08;
    const barY = h * 0.72;
    const barW = w * 0.50;
    const barH = 10;
    const dose = cfg.dosePct;

    drawText(ctx, 'Cumulative radiation dose', barX, barY - 12, {
      fontSize: 10, color: PALETTE.text.tertiary, baseline: 'bottom',
    });

    // Track
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();

    // Fill
    const doseGrad = ctx.createLinearGradient(barX, barY, barX + barW * dose, barY);
    doseGrad.addColorStop(0, 'rgba(80,200,140,0.3)');
    doseGrad.addColorStop(0.5, 'rgba(255,200,80,0.3)');
    doseGrad.addColorStop(1, 'rgba(230,100,80,0.3)');
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * dose, barH, 5);
    ctx.fillStyle = doseGrad;
    ctx.fill();

    drawText(ctx, `${Math.round(dose * 100)}%`, barX + barW * dose + 8, barY + barH / 2, {
      fontSize: 10, color: PALETTE.text.secondary,
    });

    // ---- Tip box ----
    const tipX = w * 0.63;
    const tipY = h * 0.15;
    const tipW = w * 0.32;
    const tipH = 60;

    ctx.beginPath();
    ctx.roundRect(tipX, tipY, tipW, tipH, 8);
    ctx.fillStyle = 'rgba(80,200,140,0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,200,140,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    drawText(ctx, 'Self-care tip', tipX + 12, tipY + 14, {
      fontSize: 10, fontWeight: '600', color: 'rgba(80,200,140,0.6)', baseline: 'top',
    });
    drawWrappedText(ctx, cfg.tips, tipX + 12, tipY + 30, tipW - 24, 16, {
      fontSize: 11, color: 'rgba(80,200,140,0.5)',
    });

    // ---- Severity indicator ----
    const sevX = w * 0.63;
    const sevY = h * 0.42;
    const sevLabels = ['None', 'Mild', 'Moderate', 'Severe'];
    const sevIndex = stage === 0 ? 1 : stage === 1 ? 1 : stage === 2 ? 2 : stage === 3 ? 3 : 0;

    drawText(ctx, 'Skin reaction severity', sevX, sevY, {
      fontSize: 10, color: PALETTE.text.tertiary,
    });

    for (let i = 0; i < sevLabels.length; i++) {
      const dotX = sevX + i * 28;
      const dotY = sevY + 20;
      const isActive = i <= sevIndex;
      const isCurrent = i === sevIndex;

      ctx.beginPath();
      ctx.arc(dotX + 6, dotY, isCurrent ? 5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = !isActive
        ? 'rgba(255,255,255,0.1)'
        : i === 0 ? 'rgba(80,200,140,0.4)'
        : i === 1 ? 'rgba(200,200,80,0.4)'
        : i === 2 ? 'rgba(230,160,80,0.4)'
        : 'rgba(230,80,60,0.4)';
      ctx.fill();

      drawText(ctx, sevLabels[i], dotX + 6, dotY + 14, {
        fontSize: 8, color: isCurrent ? PALETTE.text.secondary : PALETTE.text.tertiary, align: 'center', baseline: 'top',
      });
    }

    // ---- Timeline note ----
    if (stage === 4) {
      drawText(ctx, 'Skin recovers 2-4 weeks after treatment ends', w * 0.63, h * 0.55, {
        fontSize: 11, color: 'rgba(80,200,140,0.5)',
      });
    }

    // ---- Controls ----
    const controlY = h - 42;
    state.stepperAreas = drawStepperDots(ctx, stage, STAGES.length, w / 2, controlY);
    drawPhaseLabel(ctx, STAGES[stage].label, w / 2, controlY - 28);
    drawCaption(ctx, STAGES[stage].caption, w / 2, controlY + 14, w * 0.72);
  }

  function onPointerDown(x: number, y: number) {
    for (const area of state.stepperAreas) {
      if (hitTest(x, y, area) && area.index !== undefined) {
        goToStage(area.index);
        return;
      }
    }
  }

  return {
    update,
    destroy: () => {},
    resize: (w, h) => {
      state.w = w;
      state.h = h;
      resizeParticleSystem(state.particles, w, h);
    },
    onPointerDown,
    nextStage: () => goToStage(state.stage + 1),
    prevStage: () => goToStage(state.stage - 1),
    getStage: () => state.stage,
  };
}
