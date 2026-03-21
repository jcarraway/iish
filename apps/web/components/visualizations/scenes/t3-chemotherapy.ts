// ============================================================================
// T3 — Chemotherapy: Drug → Dividing Cell → DNA Disruption → Death
// Timeline animation, 5 phases
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawDNA, drawMolecule, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, easeOut, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const PHASES = [
  { label: '1. Drug enters bloodstream', caption: 'Chemotherapy drugs travel through the blood to reach cancer cells throughout the body.' },
  { label: '2. Reaching dividing cells', caption: 'The drug finds cells that are actively dividing — including cancer cells.' },
  { label: '3. DNA disruption', caption: 'The drug intercalates DNA or disrupts the mitotic spindle, preventing cell division.' },
  { label: '4. Cell death', caption: 'Unable to divide, the cell undergoes programmed death (apoptosis).' },
  { label: '5. Side effects', caption: 'The same mechanism affects fast-dividing normal cells: hair follicles, gut lining, bone marrow.' },
];

interface DrugParticle {
  x: number; y: number; vx: number; vy: number; phase: number;
}

interface State {
  stage: number;
  stageProgress: number; // 0-1 within current stage
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
  drugs: DrugParticle[];
  cellX: number;
  cellY: number;
  // Death animation
  fragments: { x: number; y: number; vx: number; vy: number; r: number; a: number }[];
  isPlaying: boolean;
}

export function init(
  canvas: HTMLCanvasElement,
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
    particles: createParticleSystem(50, { width, height }),
    stepperAreas: [],
    drugs: [],
    cellX: width * 0.5,
    cellY: height * 0.42,
    fragments: [],
    isPlaying: false,
  };

  function layout() {
    state.cellX = state.w * 0.5;
    state.cellY = state.h * 0.42;
  }

  layout();
  initDrugs();

  function initDrugs() {
    state.drugs = [];
    for (let i = 0; i < 8; i++) {
      state.drugs.push({
        x: -20 - Math.random() * 100,
        y: state.h * 0.2 + Math.random() * state.h * 0.4,
        vx: 1 + Math.random() * 0.5,
        vy: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, PHASES.length - 1);
    state.stageProgress = 0;
    if (idx === 0) initDrugs();
    if (idx < 3) state.fragments = [];
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;

    // Auto-advance progress within stage
    state.stageProgress = clamp(state.stageProgress + dt * 0.3, 0, 1);

    updateParticles(state.particles, dt * speed);

    // Update drug particles
    for (const d of state.drugs) {
      d.phase += dt;
      if (state.stage === 0) {
        d.x += d.vx * dt * 60;
        d.y += Math.sin(d.phase * 2) * 0.3;
        if (d.x > state.w + 20) d.x = -20;
      } else if (state.stage === 1) {
        // Converge toward cell
        const targetX = state.cellX;
        const targetY = state.cellY;
        d.x = lerp(d.x, targetX + (Math.random() - 0.5) * 30, dt * 1.5);
        d.y = lerp(d.y, targetY + (Math.random() - 0.5) * 30, dt * 1.5);
      }
    }

    // Fragment animation
    for (const f of state.fragments) {
      f.x += f.vx * dt * 60;
      f.y += f.vy * dt * 60;
      f.a -= dt * 0.3;
    }
    state.fragments = state.fragments.filter(f => f.a > 0);

    // Generate fragments at stage 3
    if (state.stage === 3 && state.stageProgress > 0.3 && state.fragments.length < 20) {
      state.fragments.push({
        x: state.cellX + (Math.random() - 0.5) * 60,
        y: state.cellY + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        r: 2 + Math.random() * 5,
        a: 0.5 + Math.random() * 0.3,
      });
    }

    render();
  }

  function render() {
    const { w, h, time, stage, stageProgress } = state;
    const cellRadius = Math.min(w, h) * 0.14;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);

    drawParticles(ctx, state.particles);

    // ---- Stage 0: Drugs in bloodstream ----
    if (stage === 0) {
      // Blood vessel hint (horizontal gradient band)
      const gradient = ctx.createLinearGradient(0, h * 0.25, 0, h * 0.55);
      gradient.addColorStop(0, 'rgba(200,60,60,0.03)');
      gradient.addColorStop(0.5, 'rgba(200,60,60,0.06)');
      gradient.addColorStop(1, 'rgba(200,60,60,0.03)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, h * 0.25, w, h * 0.3);

      // Drug molecules flowing
      for (const d of state.drugs) {
        drawMolecule(ctx, d.x, d.y, 5, PALETTE.drug.fill, 'circle');
        drawGlow(ctx, d.x, d.y, 10, PALETTE.drug.glow, 0.3, time + d.phase);
      }
    }

    // ---- Stage 1-2: Cell with drugs arriving ----
    if (stage >= 1 && stage <= 3) {
      const cellAlpha = stage === 3 ? clamp(1 - stageProgress * 0.8, 0.2, 1) : 1;
      ctx.globalAlpha = cellAlpha;

      drawCell(ctx, state.cellX, state.cellY, cellRadius, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
        glow: stage === 2 ? PALETTE.signal.death : PALETTE.cancer.glow,
      }, time);

      // DNA inside
      const dnaColor = stage >= 2 ? PALETTE.dna.damaged : PALETTE.dna.fill;
      drawDNA(ctx, state.cellX - cellRadius * 0.5, state.cellY, cellRadius, dnaColor, stage >= 2, time);

      // Mitotic spindle (stage 1)
      if (stage === 1) {
        ctx.strokeStyle = 'rgba(200,200,100,0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(state.cellX, state.cellY);
          ctx.lineTo(
            state.cellX + Math.cos(angle) * cellRadius * 0.8,
            state.cellY + Math.sin(angle) * cellRadius * 0.8
          );
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;

      // Drug molecules near/in cell
      if (stage >= 1 && stage <= 2) {
        for (const d of state.drugs) {
          const alpha = stage === 2 ? 0.5 : 1;
          ctx.globalAlpha = alpha;
          drawMolecule(ctx, d.x, d.y, 4, PALETTE.drug.fill, 'circle');
          ctx.globalAlpha = 1;
        }
      }

      // DNA damage flashes (stage 2)
      if (stage === 2 && stageProgress > 0.2) {
        const flashIntensity = Math.sin(time * 8) * 0.5 + 0.5;
        drawGlow(ctx, state.cellX, state.cellY, cellRadius * 0.6,
          PALETTE.dna.damaged, flashIntensity * 0.4, time);
      }
    }

    // ---- Stage 3: Death fragments ----
    for (const f of state.fragments) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,100,80,${f.a.toFixed(3)})`;
      ctx.fill();
    }

    // ---- Stage 4: Side effects panel ----
    if (stage === 4) {
      const panels = [
        { label: 'Hair follicles', desc: 'Fast-dividing cells → hair loss', y: h * 0.2, color: 'rgba(200,170,100,0.2)' },
        { label: 'Gut lining', desc: 'Renewal disrupted → nausea', y: h * 0.38, color: 'rgba(200,120,100,0.2)' },
        { label: 'Bone marrow', desc: 'Blood cell production drops → fatigue', y: h * 0.56, color: 'rgba(160,100,140,0.2)' },
      ];

      for (const p of panels) {
        const px = w * 0.15;
        const pw = w * 0.7;
        const ph = h * 0.12;

        ctx.beginPath();
        ctx.roundRect(px, p.y, pw, ph, 8);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        drawText(ctx, p.label, px + 16, p.y + ph * 0.35, {
          fontSize: 14,
          fontWeight: '600',
          color: PALETTE.text.primary,
        });
        drawText(ctx, p.desc, px + 16, p.y + ph * 0.65, {
          fontSize: 12,
          color: PALETTE.text.secondary,
        });

        // Affected cell icon
        const iconX = px + pw - 30;
        const iconY = p.y + ph / 2;
        drawCell(ctx, iconX, iconY, 12, {
          fill: 'rgba(255,255,255,0.05)',
          edge: 'rgba(255,255,255,0.15)',
        }, time, 1);
        // X mark
        ctx.strokeStyle = PALETTE.signal.death;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(iconX - 5, iconY - 5);
        ctx.lineTo(iconX + 5, iconY + 5);
        ctx.moveTo(iconX + 5, iconY - 5);
        ctx.lineTo(iconX - 5, iconY + 5);
        ctx.stroke();
      }
    }

    // ---- Controls ----
    const controlY = h - 45;
    state.stepperAreas = drawStepperDots(ctx, stage, PHASES.length, w / 2, controlY);

    drawPhaseLabel(ctx, PHASES[stage].label, w / 2, controlY - 28);
    drawCaption(ctx, PHASES[stage].caption, w / 2, controlY + 16, w * 0.7);
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
      layout();
    },
    onPointerDown,
    nextStage: () => goToStage(state.stage + 1),
    prevStage: () => goToStage(state.stage - 1),
    getStage: () => state.stage,
  };
}
