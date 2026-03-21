// ============================================================================
// V2 — Risk Factor Landscape: Toggle Factors to See Compounding Risk
// Explorable with toggleable risk factors
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawButton, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawWrappedText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

interface RiskFactor {
  id: string;
  name: string;
  relativeRisk: number; // multiplier, e.g. 1.5x
  description: string;
  modifiable: boolean;
  color: string;
}

const FACTORS: RiskFactor[] = [
  {
    id: 'genetics',
    name: 'BRCA1/2 Mutation',
    relativeRisk: 5.0,
    description: 'Inherited BRCA mutations increase lifetime breast cancer risk to 45-72%. The strongest single risk factor.',
    modifiable: false,
    color: 'rgba(255,100,80,0.6)',
  },
  {
    id: 'age',
    name: 'Age (50+)',
    relativeRisk: 2.0,
    description: 'Risk doubles after age 50. Two-thirds of breast cancers are diagnosed in women over 55.',
    modifiable: false,
    color: 'rgba(255,180,80,0.6)',
  },
  {
    id: 'hormones',
    name: 'Hormone Therapy (HRT)',
    relativeRisk: 1.5,
    description: 'Combined estrogen-progestin HRT increases risk by ~50% after 5+ years of use.',
    modifiable: true,
    color: 'rgba(200,140,255,0.6)',
  },
  {
    id: 'lifestyle',
    name: 'Alcohol (2+ drinks/day)',
    relativeRisk: 1.5,
    description: 'Regular alcohol intake increases estrogen levels. Risk rises ~7% per drink per day.',
    modifiable: true,
    color: 'rgba(100,200,160,0.6)',
  },
  {
    id: 'density',
    name: 'Dense Breast Tissue',
    relativeRisk: 2.0,
    description: 'Extremely dense breasts have 4-6x higher risk than fatty breasts. Also makes mammograms harder to read.',
    modifiable: false,
    color: 'rgba(100,170,255,0.6)',
  },
];

interface State {
  active: boolean[];
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  buttonAreas: ControlHitArea[];
  displayRisk: number;
}

export function init(
  _canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SceneAPI {
  const state: State = {
    active: FACTORS.map(() => false),
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(30, { width, height }),
    buttonAreas: [],
    displayRisk: 1,
  };

  function computeRisk(): number {
    let risk = 1;
    for (let i = 0; i < FACTORS.length; i++) {
      if (state.active[i]) risk *= FACTORS[i].relativeRisk;
    }
    return risk;
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);
    state.displayRisk = lerp(state.displayRisk, computeRisk(), dt * 4);
    render();
  }

  function render() {
    const { w, h, time } = state;
    const risk = state.displayRisk;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // ---- Risk meter (left side) ----
    const meterX = w * 0.08;
    const meterY = h * 0.1;
    const meterW = w * 0.35;
    const meterH = h * 0.5;

    // Risk visualization — concentric rings
    const ringCx = meterX + meterW / 2;
    const ringCy = meterY + meterH * 0.45;
    const maxRadius = Math.min(meterW, meterH) * 0.4;

    // Base ring (population average)
    ctx.beginPath();
    ctx.arc(ringCx, ringCy, maxRadius * 0.3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    drawText(ctx, '1x', ringCx, ringCy, {
      fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
    });

    // Risk ring — grows with multiplier
    const riskRadius = clamp(maxRadius * 0.3 * Math.sqrt(risk), maxRadius * 0.3, maxRadius);
    const riskColor = risk > 5 ? 'rgba(255,80,60,0.##)' : risk > 2 ? 'rgba(255,180,80,0.##)' : 'rgba(100,200,160,0.##)';
    const riskAlpha = 0.15 + clamp(risk / 20, 0, 0.3);
    ctx.beginPath();
    ctx.arc(ringCx, ringCy, riskRadius, 0, Math.PI * 2);
    ctx.fillStyle = riskColor.replace('##', riskAlpha.toFixed(2));
    ctx.fill();
    ctx.strokeStyle = riskColor.replace('##', '0.5');
    ctx.lineWidth = 2;
    ctx.stroke();

    drawGlow(ctx, ringCx, ringCy, riskRadius * 1.3, riskColor.replace('##', '0.15'), 0.3, time);

    // Risk multiplier text
    const riskStr = risk.toFixed(1) + 'x';
    drawText(ctx, riskStr, ringCx, ringCy + riskRadius + 20, {
      fontSize: 20, fontWeight: 'bold',
      color: risk > 5 ? 'rgba(255,80,60,0.9)' : risk > 2 ? 'rgba(255,180,80,0.9)' : 'rgba(100,200,160,0.9)',
      align: 'center',
    });
    drawText(ctx, 'relative risk', ringCx, ringCy + riskRadius + 40, {
      fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
    });

    // Active factor rings
    let activeCount = 0;
    for (let i = 0; i < FACTORS.length; i++) {
      if (state.active[i]) {
        activeCount++;
        const ringR = maxRadius * 0.3 + activeCount * 8;
        ctx.beginPath();
        ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = FACTORS[i].color.replace('0.6)', '0.2)');
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // ---- Factor toggles (right side) ----
    const factorX = w * 0.5;
    let factorY = h * 0.08;
    state.buttonAreas = [];

    drawText(ctx, 'RISK FACTORS', factorX, factorY, {
      fontSize: 11, fontWeight: '600', color: PALETTE.text.tertiary, baseline: 'top',
    });
    factorY += 22;

    for (let i = 0; i < FACTORS.length; i++) {
      const f = FACTORS[i];
      const isActive = state.active[i];
      const rowH = 55;

      // Row background
      ctx.beginPath();
      ctx.roundRect(factorX, factorY, w * 0.44, rowH, 6);
      ctx.fillStyle = isActive ? f.color.replace('0.6)', '0.06)') : 'rgba(255,255,255,0.01)';
      ctx.fill();
      if (isActive) {
        ctx.strokeStyle = f.color.replace('0.6)', '0.2)');
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Toggle button
      const btnArea = drawButton(ctx, isActive ? 'ON' : 'OFF', factorX + 28, factorY + rowH / 2, isActive);
      state.buttonAreas.push({ ...btnArea, index: i });

      // Factor name + risk
      drawText(ctx, f.name, factorX + 60, factorY + 14, {
        fontSize: 12, fontWeight: '600',
        color: isActive ? PALETTE.text.primary : PALETTE.text.secondary,
        baseline: 'top',
      });

      // Risk multiplier
      drawText(ctx, `${f.relativeRisk}x risk`, factorX + 60, factorY + 32, {
        fontSize: 10,
        color: isActive ? f.color : PALETTE.text.tertiary,
        baseline: 'top',
      });

      // Modifiable badge
      if (f.modifiable) {
        drawText(ctx, 'Modifiable', factorX + w * 0.34, factorY + rowH / 2, {
          fontSize: 9, color: 'rgba(80,200,140,0.6)',
        });
      }

      factorY += rowH + 4;
    }

    // ---- Description of active factors ----
    const activeFactors = FACTORS.filter((_, i) => state.active[i]);
    if (activeFactors.length > 0) {
      const last = activeFactors[activeFactors.length - 1];
      drawWrappedText(ctx, last.description, w * 0.5, factorY + 8, w * 0.44, 16, {
        fontSize: 11, color: PALETTE.text.secondary,
      });
    } else {
      drawText(ctx, 'Toggle factors to see how risks compound', w * 0.5 + w * 0.22, factorY + 8, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    // Baseline note
    drawText(ctx, 'Average lifetime risk: ~12% (1 in 8 women)', w / 2, h - 20, {
      fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
    });
  }

  function onPointerDown(x: number, y: number) {
    for (let i = 0; i < state.buttonAreas.length; i++) {
      if (hitTest(x, y, state.buttonAreas[i])) {
        const idx = state.buttonAreas[i].index ?? i;
        state.active[idx] = !state.active[idx];
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
    toggle: () => {
      // Toggle next inactive factor
      const nextOff = state.active.indexOf(false);
      if (nextOff >= 0) state.active[nextOff] = true;
      else state.active.fill(false);
    },
    nextStage: () => {
      const nextOff = state.active.indexOf(false);
      if (nextOff >= 0) state.active[nextOff] = true;
    },
    prevStage: () => {
      for (let i = state.active.length - 1; i >= 0; i--) {
        if (state.active[i]) { state.active[i] = false; return; }
      }
    },
    getStage: () => state.active.filter(Boolean).length,
  };
}
