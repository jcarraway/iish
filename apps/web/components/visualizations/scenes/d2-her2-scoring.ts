// ============================================================================
// D2 — HER2 Scoring: IHC 0 → 1+ → 2+ → 3+ with Treatment Availability
// Slider interaction — receptor density changes with score
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawReceptor, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawSlider, hitTest,
  lerp, clamp, mapRange, getAnimationSpeed,
} from '../framework';
import { drawText, drawBadge } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

interface ScoreLevel {
  label: string;
  receptorCount: number;
  status: string;
  treatments: string[];
  isNew?: boolean;
  color: string;
}

const SCORE_LEVELS: ScoreLevel[] = [
  {
    label: 'IHC 0',
    receptorCount: 0,
    status: 'HER2-Negative',
    treatments: ['No HER2-targeted therapy'],
    color: 'rgba(150,150,150,0.5)',
  },
  {
    label: 'IHC 1+',
    receptorCount: 4,
    status: 'HER2-Low',
    treatments: ['Enhertu (T-DXd)'],
    isNew: true,
    color: 'rgba(200,170,80,0.6)',
  },
  {
    label: 'IHC 2+',
    receptorCount: 10,
    status: 'HER2-Low / Equivocal',
    treatments: ['Enhertu eligible', 'FISH test recommended'],
    isNew: true,
    color: 'rgba(240,160,60,0.6)',
  },
  {
    label: 'IHC 3+',
    receptorCount: 20,
    status: 'HER2-Positive',
    treatments: ['Trastuzumab', 'Pertuzumab', 'T-DM1', 'Enhertu'],
    color: 'rgba(255,130,50,0.7)',
  },
];

interface State {
  sliderValue: number; // 0-3 (continuous)
  displayValue: number; // smoothed
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  sliderArea: ControlHitArea | null;
  dragging: boolean;
  cellX: number;
  cellY: number;
  // Receptor animation
  receptors: { angle: number; opacity: number; targetOpacity: number }[];
}

export function init(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SceneAPI {
  const state: State = {
    sliderValue: 0,
    displayValue: 0,
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(40, { width, height }),
    sliderArea: null,
    dragging: false,
    cellX: width * 0.38,
    cellY: height * 0.4,
    receptors: [],
  };

  function layout() {
    state.cellX = state.w * 0.38;
    state.cellY = state.h * 0.4;
  }

  // Build receptors for max count, toggle opacity based on current score
  function initReceptors() {
    state.receptors = [];
    const maxCount = SCORE_LEVELS[3].receptorCount;
    for (let i = 0; i < maxCount; i++) {
      state.receptors.push({
        angle: (i / maxCount) * Math.PI * 2 + Math.PI * 0.1,
        opacity: 0,
        targetOpacity: 0,
      });
    }
  }

  layout();
  initReceptors();

  function updateReceptorTargets() {
    const rounded = Math.round(state.sliderValue);
    const targetCount = SCORE_LEVELS[rounded]?.receptorCount ?? 0;
    for (let i = 0; i < state.receptors.length; i++) {
      state.receptors[i].targetOpacity = i < targetCount ? 1 : 0;
    }
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;

    state.displayValue = lerp(state.displayValue, state.sliderValue, dt * 5);
    updateReceptorTargets();

    for (const r of state.receptors) {
      r.opacity = lerp(r.opacity, r.targetOpacity, dt * 4);
    }

    updateParticles(state.particles, dt * speed);
    render();
  }

  function render() {
    const { w, h, time, displayValue } = state;
    const cellRadius = Math.min(w, h) * 0.14;
    const rounded = Math.round(displayValue);
    const level = SCORE_LEVELS[clamp(rounded, 0, 3)];

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // ---- Cell ----
    const cellGlow = level.receptorCount > 0 ? level.color.replace(/[\d.]+\)$/, '0.08)') : undefined;
    drawCell(ctx, state.cellX, state.cellY, cellRadius, {
      fill: 'rgba(200,180,160,0.1)',
      edge: 'rgba(200,180,160,0.25)',
      glow: cellGlow,
    }, time, 2);
    drawNucleus(ctx, state.cellX, state.cellY, cellRadius * 0.3, 'rgba(200,180,160,0.2)');

    // ---- Receptors ----
    for (const r of state.receptors) {
      if (r.opacity < 0.01) continue;
      ctx.globalAlpha = clamp(r.opacity, 0, 1);
      const rx = state.cellX + Math.cos(r.angle) * (cellRadius + 3);
      const ry = state.cellY + Math.sin(r.angle) * (cellRadius + 3);
      drawReceptor(ctx, rx, ry, r.angle + Math.PI / 2, level.color, 'antibody', 9);
    }
    ctx.globalAlpha = 1;

    // Dense glow for 3+
    if (rounded === 3) {
      drawGlow(ctx, state.cellX, state.cellY, cellRadius * 2, level.color.replace(/[\d.]+\)$/, '0.12)'), 0.5, time);
    }

    // ---- Cell label ----
    drawText(ctx, 'Breast cancer cell', state.cellX, state.cellY + cellRadius + 18, {
      fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
    });

    // ---- Right Info Panel ----
    const infoX = w * 0.63;
    let infoY = h * 0.15;

    // Score badge
    drawBadge(ctx, level.label, infoX, infoY, level.color, 'rgba(0,0,0,0.8)', 14);
    infoY += 35;

    // Status
    drawText(ctx, level.status, infoX, infoY, {
      fontSize: 18, fontWeight: 'bold', color: PALETTE.text.primary,
    });
    infoY += 28;

    // "NEW" badge for HER2-low
    if (level.isNew) {
      drawBadge(ctx, 'NEW CATEGORY', infoX, infoY, 'rgba(100,200,150,0.2)', 'rgba(100,200,150,0.9)', 10);
      infoY += 25;
    }

    // Receptor density description
    const densityDesc = rounded === 0 ? 'No HER2 receptors detected on cell surface'
      : rounded === 1 ? 'Sparse HER2 receptors — previously considered negative'
      : rounded === 2 ? 'Moderate HER2 receptors — borderline result'
      : 'Dense HER2 receptor overexpression';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = PALETTE.text.secondary;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const descMaxW = w * 0.32;
    const words = densityDesc.split(' ');
    let line = '';
    let ly = infoY;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > descMaxW && line) {
        ctx.fillText(line, infoX, ly);
        line = word;
        ly += 18;
      } else {
        line = test;
      }
    }
    if (line) { ctx.fillText(line, infoX, ly); ly += 18; }

    // Treatment availability
    ly += 12;
    drawText(ctx, 'Treatment options:', infoX, ly, {
      fontSize: 12, fontWeight: '600', color: PALETTE.text.secondary, baseline: 'top',
    });
    ly += 20;

    for (const tx of level.treatments) {
      drawText(ctx, `\u2022 ${tx}`, infoX + 4, ly, {
        fontSize: 12, color: PALETTE.text.accent, baseline: 'top',
      });
      ly += 18;
    }

    // ---- Slider ----
    const sliderY = h - 55;
    const sliderX = w * 0.15;
    const sliderW = w * 0.7;
    state.sliderArea = drawSlider(
      ctx,
      state.sliderValue,
      0, 3,
      sliderX, sliderY, sliderW,
      ['0', '1+', '2+', '3+']
    );

    // Score label above slider
    drawText(ctx, 'IHC Score', w / 2, sliderY - 20, {
      fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
    });
  }

  function onPointerDown(x: number, y: number) {
    if (state.sliderArea && hitTest(x, y, state.sliderArea)) {
      state.dragging = true;
      updateSliderFromPointer(x);
    }
  }

  function onPointerMove(x: number, _y: number) {
    if (state.dragging) {
      updateSliderFromPointer(x);
    }
  }

  function onPointerUp() {
    if (state.dragging) {
      state.dragging = false;
      // Snap to nearest integer
      state.sliderValue = Math.round(state.sliderValue);
    }
  }

  function updateSliderFromPointer(x: number) {
    if (!state.sliderArea) return;
    const normalized = clamp(
      (x - state.sliderArea.x) / state.sliderArea.width,
      0, 1
    );
    state.sliderValue = normalized * 3;
  }

  return {
    update,
    destroy: () => {},
    resize: (w, h) => {
      state.w = w;
      state.h = h;
      resizeParticleSystem(state.particles, w, h);
      layout();
    },
    onPointerDown,
    onPointerMove,
    onPointerUp,
    nextStage: () => { state.sliderValue = clamp(Math.round(state.sliderValue) + 1, 0, 3); },
    prevStage: () => { state.sliderValue = clamp(Math.round(state.sliderValue) - 1, 0, 3); },
    getStage: () => Math.round(state.sliderValue),
  };
}
