// ============================================================================
// P4 — Binding Prediction: MHC Groove + Peptide Fit Visualization
// Slider — peptide sequence changes → binding score shifts → color feedback
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawMolecule, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawSlider, hitTest,
  lerp, clamp, mapRange, getAnimationSpeed,
} from '../framework';
import { drawText, drawBadge } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

interface PeptideConfig {
  sequence: string;
  bindingScore: number; // IC50 in nM (lower = stronger)
  label: string;
  color: string;
}

const PEPTIDES: PeptideConfig[] = [
  { sequence: 'ALWGPDPAA', bindingScore: 50000, label: 'Very weak binder', color: 'rgba(255,80,60,0.7)' },
  { sequence: 'KQMVDLFL', bindingScore: 5000, label: 'Weak binder', color: 'rgba(255,160,60,0.7)' },
  { sequence: 'GILGFVFTL', bindingScore: 500, label: 'Moderate binder', color: 'rgba(255,200,80,0.7)' },
  { sequence: 'YLQLVFGIEV', bindingScore: 50, label: 'Strong binder', color: 'rgba(100,200,140,0.7)' },
  { sequence: 'SIINFEKL', bindingScore: 5, label: 'Very strong binder', color: 'rgba(80,200,160,0.8)' },
];

interface State {
  sliderValue: number; // 0-4
  displayValue: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  sliderArea: ControlHitArea | null;
  dragging: boolean;
  fitAnimation: number;
}

export function init(
  _canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SceneAPI {
  const state: State = {
    sliderValue: 2,
    displayValue: 2,
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(30, { width, height }),
    sliderArea: null,
    dragging: false,
    fitAnimation: 0,
  };

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);
    state.displayValue = lerp(state.displayValue, state.sliderValue, dt * 5);
    state.fitAnimation = clamp(state.fitAnimation + dt * 2, 0, 1);
    render();
  }

  function drawMHCGroove(x: number, y: number, grooveW: number, grooveH: number, peptideIdx: number) {
    const config = PEPTIDES[clamp(Math.round(peptideIdx), 0, PEPTIDES.length - 1)];
    const fitQuality = clamp(1 - config.bindingScore / 50000, 0, 1); // 0 = worst, 1 = best

    // MHC alpha helices (groove walls)
    const wallH = grooveH;
    const wallW = 8;

    // Left helix
    ctx.beginPath();
    ctx.roundRect(x - grooveW / 2 - wallW / 2, y - wallH / 2, wallW, wallH, wallW / 2);
    ctx.fillStyle = 'rgba(140,130,230,0.25)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(140,130,230,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right helix
    ctx.beginPath();
    ctx.roundRect(x + grooveW / 2 - wallW / 2, y - wallH / 2, wallW, wallH, wallW / 2);
    ctx.fillStyle = 'rgba(140,130,230,0.25)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(140,130,230,0.4)';
    ctx.stroke();

    // Floor of groove
    ctx.fillStyle = 'rgba(140,130,230,0.08)';
    ctx.fillRect(x - grooveW / 2 + wallW / 2, y - wallH / 2, grooveW - wallW, wallH);

    // Label
    drawText(ctx, 'MHC-I groove', x, y + wallH / 2 + 15, {
      fontSize: 10, color: 'rgba(140,130,230,0.6)', align: 'center',
    });

    // Peptide in groove
    const seq = config.sequence;
    const residueSpacing = (grooveW - wallW - 4) / seq.length;
    const startX = x - grooveW / 2 + wallW / 2 + 4 + residueSpacing / 2;

    for (let i = 0; i < seq.length; i++) {
      const rx = startX + i * residueSpacing;
      const ry = y;
      // Residue wobble — worse fit = more wobble
      const wobble = (1 - fitQuality) * Math.sin(state.time * 3 + i) * 4;

      drawMolecule(ctx, rx, ry + wobble, 4, config.color, 'circle');
      drawText(ctx, seq[i], rx, ry + wobble - 10, {
        fontSize: 7, color: config.color, align: 'center',
        fontFamily: 'monospace',
      });
    }

    // Fit glow
    if (fitQuality > 0.5) {
      drawGlow(ctx, x, y, grooveW, config.color.replace(/[\d.]+\)$/, '0.1)'), fitQuality * 0.3, state.time);
    }

    // Binding contacts — only for good binders
    if (fitQuality > 0.3) {
      ctx.strokeStyle = config.color.replace(/[\d.]+\)$/, (fitQuality * 0.3).toFixed(2) + ')');
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 2]);
      // Contact lines from peptide to groove walls
      for (let i = 0; i < Math.floor(fitQuality * 4); i++) {
        const ci = Math.floor(seq.length * (i + 1) / 5);
        const crx = startX + ci * residueSpacing;
        // To left wall
        ctx.beginPath();
        ctx.moveTo(crx - 4, y);
        ctx.lineTo(x - grooveW / 2 + wallW / 2, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    return { fitQuality, config };
  }

  function render() {
    const { w, h, time, displayValue } = state;
    const cx = w * 0.4;
    const cy = h * 0.35;
    const rounded = clamp(Math.round(displayValue), 0, PEPTIDES.length - 1);
    const config = PEPTIDES[rounded];
    const fitQuality = clamp(1 - config.bindingScore / 50000, 0, 1);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // ---- MHC groove with peptide ----
    drawMHCGroove(cx, cy, 100, 50, displayValue);

    // ---- Right info panel ----
    const infoX = w * 0.62;
    let infoY = h * 0.12;

    drawText(ctx, 'Peptide', infoX, infoY, {
      fontSize: 11, color: PALETTE.text.tertiary,
    });
    infoY += 18;

    drawText(ctx, config.sequence, infoX, infoY, {
      fontSize: 14, fontWeight: '600', color: PALETTE.text.primary,
      fontFamily: 'monospace',
    });
    infoY += 24;

    // Binding score
    drawText(ctx, 'Binding affinity (IC50)', infoX, infoY, {
      fontSize: 11, color: PALETTE.text.tertiary,
    });
    infoY += 18;

    const scoreText = config.bindingScore >= 1000
      ? `${(config.bindingScore / 1000).toFixed(0)} \u03BCM`
      : `${config.bindingScore} nM`;
    drawText(ctx, scoreText, infoX, infoY, {
      fontSize: 20, fontWeight: 'bold', color: config.color,
    });
    infoY += 30;

    drawBadge(ctx, config.label, infoX, infoY, config.color.replace(/[\d.]+\)$/, '0.15)'), config.color, 11);
    infoY += 30;

    // Fit quality meter
    drawText(ctx, 'Shape complementarity', infoX, infoY, {
      fontSize: 11, color: PALETTE.text.tertiary,
    });
    infoY += 15;

    const meterW = w * 0.28;
    const meterH = 8;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect(infoX, infoY, meterW, meterH, meterH / 2);
    ctx.fill();

    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.roundRect(infoX, infoY, meterW * fitQuality, meterH, meterH / 2);
    ctx.fill();

    infoY += 22;

    // Threshold note
    if (config.bindingScore <= 500) {
      drawText(ctx, '\u2713 Below 500nM threshold', infoX, infoY, {
        fontSize: 10, color: 'rgba(80,200,140,0.8)',
      });
      drawText(ctx, 'Candidate for vaccine inclusion', infoX, infoY + 16, {
        fontSize: 10, color: 'rgba(80,200,140,0.6)',
      });
    } else {
      drawText(ctx, '\u2717 Above 500nM threshold', infoX, infoY, {
        fontSize: 10, color: 'rgba(255,100,80,0.7)',
      });
      drawText(ctx, 'Unlikely to trigger immune response', infoX, infoY + 16, {
        fontSize: 10, color: PALETTE.text.tertiary,
      });
    }

    // ---- Slider ----
    const sliderY = h - 55;
    const sliderX = w * 0.1;
    const sliderW = w * 0.8;
    state.sliderArea = drawSlider(ctx, state.sliderValue, 0, PEPTIDES.length - 1, sliderX, sliderY, sliderW,
      PEPTIDES.map((_, i) => `P${i + 1}`));

    drawText(ctx, 'Peptide sequence', w / 2, sliderY - 20, {
      fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
    });
  }

  function updateSliderFromPointer(x: number) {
    if (!state.sliderArea) return;
    const normalized = clamp((x - state.sliderArea.x) / state.sliderArea.width, 0, 1);
    state.sliderValue = normalized * (PEPTIDES.length - 1);
    state.fitAnimation = 0;
  }

  function onPointerDown(x: number, y: number) {
    if (state.sliderArea && hitTest(x, y, state.sliderArea)) {
      state.dragging = true;
      updateSliderFromPointer(x);
    }
  }

  function onPointerMove(x: number, _y: number) {
    if (state.dragging) updateSliderFromPointer(x);
  }

  function onPointerUp() {
    if (state.dragging) {
      state.dragging = false;
      state.sliderValue = Math.round(state.sliderValue);
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
    onPointerMove,
    onPointerUp,
    nextStage: () => { state.sliderValue = clamp(Math.round(state.sliderValue) + 1, 0, PEPTIDES.length - 1); },
    prevStage: () => { state.sliderValue = clamp(Math.round(state.sliderValue) - 1, 0, PEPTIDES.length - 1); },
    getStage: () => Math.round(state.sliderValue),
  };
}
