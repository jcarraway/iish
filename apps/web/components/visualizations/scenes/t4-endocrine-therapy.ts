// ============================================================================
// T4 — Endocrine Therapy: Tamoxifen / Aromatase Inhibitor / SERD
// Toggle between 4 states showing how each blocks estrogen signaling
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawReceptor, drawMolecule, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawButton, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawWrappedText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

interface ModeConfig {
  name: string;
  label: string;
  caption: string;
  erVisible: boolean;
  estrogenVisible: boolean;
  drugVisible: boolean;
  divisionGlow: boolean;
  drugColor: string;
  drugType: 'circle' | 'hexagon' | 'triangle' | 'diamond';
  mechanism: string;
}

const MODES: ModeConfig[] = [
  {
    name: 'Normal',
    label: 'No Treatment',
    caption: 'Estrogen binds to estrogen receptors (ER) on the cancer cell, triggering growth signals and cell division.',
    erVisible: true,
    estrogenVisible: true,
    drugVisible: false,
    divisionGlow: true,
    drugColor: '',
    drugType: 'circle',
    mechanism: 'Estrogen + ER = Growth',
  },
  {
    name: 'Tamoxifen',
    label: 'ER Blocker',
    caption: 'Tamoxifen sits in the estrogen receptor, blocking estrogen from binding. The receptor is there but occupied.',
    erVisible: true,
    estrogenVisible: true,
    drugVisible: true,
    divisionGlow: false,
    drugColor: 'rgba(100,170,255,0.7)',
    drugType: 'diamond',
    mechanism: 'Drug blocks receptor',
  },
  {
    name: 'AI',
    label: 'Aromatase Inhibitor',
    caption: 'Aromatase inhibitors stop estrogen production at the source. Receptors remain but have nothing to bind.',
    erVisible: true,
    estrogenVisible: false,
    drugVisible: true,
    divisionGlow: false,
    drugColor: 'rgba(180,140,255,0.7)',
    drugType: 'hexagon',
    mechanism: 'Estrogen production stopped',
  },
  {
    name: 'SERD',
    label: 'Receptor Degrader',
    caption: 'SERDs like fulvestrant cause the estrogen receptor itself to be destroyed. No receptor, no signaling.',
    erVisible: false,
    estrogenVisible: true,
    drugVisible: true,
    divisionGlow: false,
    drugColor: 'rgba(255,140,100,0.7)',
    drugType: 'triangle',
    mechanism: 'Receptors degraded',
  },
];

interface State {
  current: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  buttonAreas: ControlHitArea[];
  cellX: number;
  cellY: number;
  erOpacity: number;
  estrogenOpacity: number;
  drugOpacity: number;
  glowIntensity: number;
}

export function init(
  _canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SceneAPI {
  const state: State = {
    current: 0,
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(45, { width, height }),
    buttonAreas: [],
    cellX: width * 0.38,
    cellY: height * 0.42,
    erOpacity: 1,
    estrogenOpacity: 1,
    drugOpacity: 0,
    glowIntensity: 1,
  };

  function layout() {
    state.cellX = state.w * 0.38;
    state.cellY = state.h * 0.42;
  }

  layout();

  function switchMode(idx: number) {
    if (idx === state.current) return;
    state.current = clamp(idx, 0, MODES.length - 1);
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);

    const mode = MODES[state.current];
    state.erOpacity = lerp(state.erOpacity, mode.erVisible ? 1 : 0, dt * 4);
    state.estrogenOpacity = lerp(state.estrogenOpacity, mode.estrogenVisible ? 1 : 0, dt * 4);
    state.drugOpacity = lerp(state.drugOpacity, mode.drugVisible ? 1 : 0, dt * 4);
    state.glowIntensity = lerp(state.glowIntensity, mode.divisionGlow ? 1 : 0, dt * 3);

    render();
  }

  function render() {
    const { w, h, time, current } = state;
    const mode = MODES[current];
    const cellRadius = Math.min(w, h) * 0.15;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // Cell
    const cellGlow = state.glowIntensity > 0.1
      ? `rgba(80,200,140,${(0.1 * state.glowIntensity).toFixed(3)})`
      : undefined;
    drawCell(ctx, state.cellX, state.cellY, cellRadius, {
      fill: PALETTE.cancer.fill,
      edge: PALETTE.cancer.edge,
      glow: cellGlow,
    }, time, 3);
    drawNucleus(ctx, state.cellX, state.cellY, cellRadius * 0.3, PALETTE.cancer.edge);

    // Division glow
    if (state.glowIntensity > 0.05) {
      drawGlow(ctx, state.cellX, state.cellY, cellRadius * 2,
        'rgba(80,200,140,0.15)', state.glowIntensity * 0.5, time);
    }

    // Estrogen receptors on cell surface
    if (state.erOpacity > 0.01) {
      ctx.globalAlpha = clamp(state.erOpacity, 0, 1);
      const erCount = 8;
      for (let i = 0; i < erCount; i++) {
        const angle = (i / erCount) * Math.PI * 2;
        const rx = state.cellX + Math.cos(angle) * (cellRadius + 2);
        const ry = state.cellY + Math.sin(angle) * (cellRadius + 2);
        drawReceptor(ctx, rx, ry, angle + Math.PI / 2, PALETTE.receptor.er, 'circle', 10);

        // Tamoxifen blocks: draw drug on receptor
        if (current === 1 && state.drugOpacity > 0.01) {
          ctx.globalAlpha = clamp(state.drugOpacity * state.erOpacity, 0, 1);
          drawMolecule(ctx, rx + Math.cos(angle) * 8, ry + Math.sin(angle) * 8, 4, mode.drugColor, 'diamond');
          // Red X
          ctx.strokeStyle = 'rgba(255,80,80,0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(rx - 4, ry - 4);
          ctx.lineTo(rx + 4, ry + 4);
          ctx.moveTo(rx + 4, ry - 4);
          ctx.lineTo(rx - 4, ry + 4);
          ctx.stroke();
          ctx.globalAlpha = clamp(state.erOpacity, 0, 1);
        }
      }
      ctx.globalAlpha = 1;
    }

    // Floating estrogen molecules
    if (state.estrogenOpacity > 0.01) {
      ctx.globalAlpha = clamp(state.estrogenOpacity, 0, 1);
      for (let i = 0; i < 6; i++) {
        const angle = time * 0.3 + (i / 6) * Math.PI * 2;
        const dist = cellRadius * 2.2 + Math.sin(time + i) * 15;
        const ex = state.cellX + Math.cos(angle) * dist;
        const ey = state.cellY + Math.sin(angle) * dist;
        drawMolecule(ctx, ex, ey, 5, PALETTE.receptor.er, 'circle');
      }
      ctx.globalAlpha = 1;

      // Label
      drawText(ctx, 'Estrogen', state.cellX, state.cellY - cellRadius * 2.8, {
        fontSize: 10, color: PALETTE.receptor.er, align: 'center',
      });
    }

    // AI mode: show blocked production
    if (current === 2 && state.drugOpacity > 0.01) {
      ctx.globalAlpha = clamp(state.drugOpacity, 0, 1);
      // "Source" indicator
      const srcX = w * 0.12;
      const srcY = state.cellY - cellRadius;
      drawMolecule(ctx, srcX, srcY, 10, 'rgba(180,140,255,0.15)', 'hexagon');
      drawMolecule(ctx, srcX, srcY, 6, mode.drugColor, 'hexagon');
      ctx.strokeStyle = 'rgba(255,80,80,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(srcX - 8, srcY - 8);
      ctx.lineTo(srcX + 8, srcY + 8);
      ctx.moveTo(srcX + 8, srcY - 8);
      ctx.lineTo(srcX - 8, srcY + 8);
      ctx.stroke();
      drawText(ctx, 'Aromatase', srcX, srcY + 18, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
      drawText(ctx, 'Blocked', srcX, srcY + 30, {
        fontSize: 10, color: 'rgba(255,80,80,0.7)', align: 'center',
      });
      ctx.globalAlpha = 1;
    }

    // SERD mode: degradation particles around where receptors were
    if (current === 3 && state.drugOpacity > 0.01) {
      ctx.globalAlpha = clamp(state.drugOpacity * 0.6, 0, 1);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + time * 0.5;
        const dist = cellRadius + 10 + Math.sin(time * 2 + i) * 5;
        const px = state.cellX + Math.cos(angle) * dist;
        const py = state.cellY + Math.sin(angle) * dist;
        drawMolecule(ctx, px, py, 2, mode.drugColor, 'triangle');
      }
      ctx.globalAlpha = 1;
    }

    // Right info panel
    const infoX = w * 0.65;
    let infoY = h * 0.15;

    drawText(ctx, mode.name, infoX, infoY, {
      fontSize: 20, fontWeight: 'bold', color: PALETTE.text.primary,
    });
    infoY += 24;

    drawText(ctx, mode.label, infoX, infoY, {
      fontSize: 13, color: PALETTE.text.accent,
    });
    infoY += 28;

    drawText(ctx, 'Mechanism:', infoX, infoY, {
      fontSize: 11, fontWeight: '600', color: PALETTE.text.secondary, baseline: 'top',
    });
    infoY += 18;
    drawText(ctx, mode.mechanism, infoX, infoY, {
      fontSize: 12, color: PALETTE.text.accent, baseline: 'top',
    });
    infoY += 28;

    drawWrappedText(ctx, mode.caption, infoX, infoY, w * 0.3, 18, {
      fontSize: 12, color: PALETTE.text.secondary,
    });

    // Buttons
    const buttonY = h - 45;
    const buttonGap = w * 0.18;
    const startX = w / 2 - (MODES.length - 1) * buttonGap / 2;
    state.buttonAreas = [];

    for (let i = 0; i < MODES.length; i++) {
      const bx = startX + i * buttonGap;
      const area = drawButton(ctx, MODES[i].name, bx, buttonY, i === current);
      state.buttonAreas.push(area);
    }
  }

  function onPointerDown(x: number, y: number) {
    for (let i = 0; i < state.buttonAreas.length; i++) {
      if (hitTest(x, y, state.buttonAreas[i])) {
        switchMode(i);
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
    toggle: () => switchMode((state.current + 1) % MODES.length),
    nextStage: () => switchMode(Math.min(state.current + 1, MODES.length - 1)),
    prevStage: () => switchMode(Math.max(state.current - 1, 0)),
    getStage: () => state.current,
  };
}
