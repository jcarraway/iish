// ============================================================================
// B6 — Breast Cancer Subtypes: Receptor Configuration Toggle
// Toggle between ER+/HER2-, HER2+, HER2-low, TNBC
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawReceptor, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawButton, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

interface SubtypeConfig {
  name: string;
  label: string;
  description: string;
  erCount: number;
  prCount: number;
  her2Count: number;
  cellColor: { fill: string; edge: string; glow: string };
  treatments: string[];
}

const SUBTYPES: SubtypeConfig[] = [
  {
    name: 'ER+/HER2-',
    label: 'Hormone Receptor Positive',
    description: 'Most common subtype (~70%). Fueled by estrogen. Responds to hormone-blocking therapy.',
    erCount: 12,
    prCount: 6,
    her2Count: 1,
    cellColor: { fill: 'rgba(80,200,140,0.18)', edge: 'rgba(80,200,140,0.35)', glow: 'rgba(80,200,140,0.1)' },
    treatments: ['Tamoxifen', 'Aromatase inhibitors', 'CDK4/6 inhibitors'],
  },
  {
    name: 'HER2+',
    label: 'HER2 Positive',
    description: 'About 15-20% of breast cancers. HER2 receptors drive growth. Targeted therapies are very effective.',
    erCount: 2,
    prCount: 1,
    her2Count: 16,
    cellColor: { fill: 'rgba(255,160,80,0.18)', edge: 'rgba(255,160,80,0.35)', glow: 'rgba(255,160,80,0.1)' },
    treatments: ['Trastuzumab', 'Pertuzumab', 'T-DM1', 'Tucatinib'],
  },
  {
    name: 'HER2-low',
    label: 'HER2-Low',
    description: 'Newly recognized category. Some HER2 (IHC 1+ or 2+) — enough for new ADC therapies like Enhertu.',
    erCount: 6,
    prCount: 3,
    her2Count: 4,
    cellColor: { fill: 'rgba(200,170,100,0.18)', edge: 'rgba(200,170,100,0.35)', glow: 'rgba(200,170,100,0.1)' },
    treatments: ['Enhertu (T-DXd)', 'Hormone therapy (if HR+)'],
  },
  {
    name: 'TNBC',
    label: 'Triple-Negative',
    description: 'About 10-15%. No ER, PR, or HER2. More aggressive, but responds to immunotherapy + chemo.',
    erCount: 0,
    prCount: 0,
    her2Count: 0,
    cellColor: { fill: 'rgba(180,100,120,0.18)', edge: 'rgba(180,100,120,0.35)', glow: 'rgba(180,100,120,0.12)' },
    treatments: ['Immunotherapy', 'Chemotherapy', 'PARP inhibitors (BRCA)'],
  },
];

interface State {
  current: number;
  targetReceptors: { type: 'er' | 'pr' | 'her2'; angle: number; opacity: number; targetOpacity: number }[];
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  buttonAreas: ControlHitArea[];
  cellX: number;
  cellY: number;
}

export function init(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SceneAPI {
  const state: State = {
    current: 0,
    targetReceptors: [],
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(50, { width, height }),
    buttonAreas: [],
    cellX: width * 0.4,
    cellY: height * 0.42,
  };

  function layout() {
    state.cellX = state.w * 0.4;
    state.cellY = state.h * 0.42;
  }

  function buildReceptors(subtypeIdx: number) {
    const config = SUBTYPES[subtypeIdx];
    const receptors: State['targetReceptors'] = [];
    const total = config.erCount + config.prCount + config.her2Count;
    let idx = 0;

    // Distribute receptors around the cell
    for (let i = 0; i < config.erCount; i++) {
      receptors.push({
        type: 'er',
        angle: (idx / Math.max(total, 1)) * Math.PI * 2,
        opacity: 0,
        targetOpacity: 1,
      });
      idx++;
    }
    for (let i = 0; i < config.prCount; i++) {
      receptors.push({
        type: 'pr',
        angle: (idx / Math.max(total, 1)) * Math.PI * 2,
        opacity: 0,
        targetOpacity: 1,
      });
      idx++;
    }
    for (let i = 0; i < config.her2Count; i++) {
      receptors.push({
        type: 'her2',
        angle: (idx / Math.max(total, 1)) * Math.PI * 2,
        opacity: 0,
        targetOpacity: 1,
      });
      idx++;
    }

    state.targetReceptors = receptors;
  }

  layout();
  buildReceptors(0);

  function switchSubtype(idx: number) {
    if (idx === state.current) return;
    // Fade out current receptors
    for (const r of state.targetReceptors) {
      r.targetOpacity = 0;
    }
    // After a short delay, build new receptors
    setTimeout(() => {
      state.current = idx;
      buildReceptors(idx);
    }, 200);
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;

    updateParticles(state.particles, dt * speed);

    // Animate receptor opacity
    for (const r of state.targetReceptors) {
      r.opacity = lerp(r.opacity, r.targetOpacity, dt * 5);
    }

    render();
  }

  function render() {
    const { w, h, time, current } = state;
    const config = SUBTYPES[current];
    const cellRadius = Math.min(w, h) * 0.15;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);

    drawParticles(ctx, state.particles);

    // Cell
    drawCell(ctx, state.cellX, state.cellY, cellRadius, config.cellColor, time, 3);
    drawNucleus(ctx, state.cellX, state.cellY, cellRadius * 0.3, config.cellColor.edge);

    // Cell glow
    drawGlow(ctx, state.cellX, state.cellY, cellRadius * 2, config.cellColor.glow, 0.4, time);

    // Receptors
    for (const r of state.targetReceptors) {
      if (r.opacity < 0.01) continue;
      ctx.globalAlpha = clamp(r.opacity, 0, 1);

      const rx = state.cellX + Math.cos(r.angle) * (cellRadius + 2);
      const ry = state.cellY + Math.sin(r.angle) * (cellRadius + 2);

      let color: string;
      let type: 'circle' | 'antibody' | 'diamond';
      if (r.type === 'er') {
        color = PALETTE.receptor.er;
        type = 'circle';
      } else if (r.type === 'pr') {
        color = PALETTE.receptor.pr;
        type = 'diamond';
      } else {
        color = PALETTE.receptor.her2;
        type = 'antibody';
      }

      drawReceptor(ctx, rx, ry, r.angle + Math.PI / 2, color, type, 10);
      ctx.globalAlpha = 1;
    }

    // TNBC label on cell
    if (current === 3) {
      drawText(ctx, 'No receptors', state.cellX, state.cellY + cellRadius + 20, {
        fontSize: 11,
        color: PALETTE.text.tertiary,
        align: 'center',
      });
    }

    // ---- Right Panel: Info ----
    const infoX = state.w * 0.68;
    const infoY = state.h * 0.18;

    drawText(ctx, config.name, infoX, infoY, {
      fontSize: 22,
      fontWeight: 'bold',
      color: PALETTE.text.primary,
    });

    drawText(ctx, config.label, infoX, infoY + 28, {
      fontSize: 13,
      color: PALETTE.text.accent,
    });

    // Description
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = PALETTE.text.secondary;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const descMaxW = w * 0.28;
    const words = config.description.split(' ');
    let line = '';
    let ly = infoY + 55;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > descMaxW && line) {
        ctx.fillText(line, infoX, ly);
        line = word;
        ly += 20;
      } else {
        line = test;
      }
    }
    if (line) { ctx.fillText(line, infoX, ly); ly += 20; }

    // Receptor legend
    ly += 12;
    const legend: [string, string][] = [];
    if (config.erCount > 0) legend.push([PALETTE.receptor.er, 'ER (Estrogen)']);
    if (config.prCount > 0) legend.push([PALETTE.receptor.pr, 'PR (Progesterone)']);
    if (config.her2Count > 0) legend.push([PALETTE.receptor.her2, 'HER2']);

    for (const [color, label] of legend) {
      ctx.beginPath();
      ctx.arc(infoX + 5, ly + 5, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      drawText(ctx, label, infoX + 16, ly + 5, {
        fontSize: 11,
        color: PALETTE.text.secondary,
      });
      ly += 20;
    }

    // Treatments
    ly += 8;
    drawText(ctx, 'Key treatments:', infoX, ly, {
      fontSize: 11,
      fontWeight: '600',
      color: PALETTE.text.secondary,
      baseline: 'top',
    });
    ly += 18;
    for (const tx of config.treatments) {
      drawText(ctx, `\u2022 ${tx}`, infoX + 4, ly, {
        fontSize: 11,
        color: PALETTE.text.tertiary,
        baseline: 'top',
      });
      ly += 16;
    }

    // ---- Subtype Buttons ----
    const buttonY = h - 45;
    const buttonGap = w * 0.18;
    const startX = w / 2 - (SUBTYPES.length - 1) * buttonGap / 2;
    state.buttonAreas = [];

    for (let i = 0; i < SUBTYPES.length; i++) {
      const bx = startX + i * buttonGap;
      const area = drawButton(ctx, SUBTYPES[i].name, bx, buttonY, i === current);
      state.buttonAreas.push(area);
    }
  }

  function onPointerDown(x: number, y: number) {
    for (let i = 0; i < state.buttonAreas.length; i++) {
      if (hitTest(x, y, state.buttonAreas[i])) {
        switchSubtype(i);
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
      layout();
    },
    onPointerDown,
    toggle: () => switchSubtype((state.current + 1) % SUBTYPES.length),
    nextStage: () => switchSubtype(Math.min(state.current + 1, SUBTYPES.length - 1)),
    prevStage: () => switchSubtype(Math.max(state.current - 1, 0)),
    getStage: () => state.current,
  };
}
