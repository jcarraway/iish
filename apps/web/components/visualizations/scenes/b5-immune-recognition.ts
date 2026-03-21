// ============================================================================
// B5 — Immune Recognition: Neoantigen → T-cell → Evasion → Vaccine
// Stepper, 6 stages — platform's neoantigen concept explainer
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawGlow, drawMolecule, drawArrow, drawReceptor,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const STAGES = [
  { label: '1. Cancer cell with neoantigens', caption: 'Cancer cells develop mutations that produce abnormal proteins (neoantigens) visible on their surface.' },
  { label: '2. Dendritic cell captures fragment', caption: 'A dendritic cell — the immune system\'s scout — captures a neoantigen fragment from the cancer cell.' },
  { label: '3. Antigen presentation', caption: 'The dendritic cell presents the neoantigen to a T-cell via the MHC-peptide-TCR interaction, teaching it what to look for.' },
  { label: '4. T-cell activation', caption: 'Recognizing the threat, the T-cell activates — glowing with energy, ready to multiply and attack.' },
  { label: '5. Immune evasion', caption: 'The cancer cell fights back, displaying PD-L1 to silence T-cells. The immune response falters.' },
  { label: '6. Vaccine restores immunity', caption: 'A cancer vaccine trains many more T-cells to recognize neoantigens, overwhelming the cancer\'s defenses.' },
];

interface State {
  stage: number;
  stageProgress: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
  cancerX: number;
  cancerY: number;
  dcX: number;
  dcY: number;
  tcellX: number;
  tcellY: number;
  fragments: { x: number; y: number; vx: number; vy: number; r: number; a: number }[];
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
    cancerX: width * 0.25,
    cancerY: height * 0.4,
    dcX: width * 0.5,
    dcY: height * 0.4,
    tcellX: width * 0.75,
    tcellY: height * 0.4,
    fragments: [],
  };

  function layout() {
    state.cancerX = state.w * 0.25;
    state.cancerY = state.h * 0.4;
    state.dcX = state.w * 0.5;
    state.dcY = state.h * 0.4;
    state.tcellX = state.w * 0.75;
    state.tcellY = state.h * 0.4;
  }
  layout();

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, STAGES.length - 1);
    state.stageProgress = 0;
    state.fragments = [];
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    state.stageProgress = clamp(state.stageProgress + dt * 0.2, 0, 1);
    updateParticles(state.particles, dt * speed);

    // Fragments
    for (const f of state.fragments) {
      f.x += f.vx * dt * 60;
      f.y += f.vy * dt * 60;
      f.a -= dt * 0.3;
    }
    state.fragments = state.fragments.filter(f => f.a > 0);

    if (state.stage === 5 && state.stageProgress > 0.5 && state.fragments.length < 12) {
      state.fragments.push({
        x: state.cancerX + (Math.random() - 0.5) * 50,
        y: state.cancerY + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        r: 2 + Math.random() * 4,
        a: 0.5,
      });
    }

    render();
  }

  function render() {
    const { w, h, time, stage, stageProgress } = state;
    const r = Math.min(w, h) * 0.1;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // ---- Cancer cell ----
    const cancerAlpha = stage === 5 && stageProgress > 0.5 ? clamp(1 - (stageProgress - 0.5) * 2, 0.2, 1) : 1;
    ctx.globalAlpha = cancerAlpha;

    drawCell(ctx, state.cancerX, state.cancerY, r, {
      fill: PALETTE.cancer.fill,
      edge: PALETTE.cancer.edge,
      glow: PALETTE.cancer.glow,
    }, time);
    drawNucleus(ctx, state.cancerX, state.cancerY, r * 0.3, PALETTE.cancer.accent);

    // Neoantigen proteins on surface (mutant — red-ish)
    const neoCount = 5;
    for (let i = 0; i < neoCount; i++) {
      const angle = (i / neoCount) * Math.PI * 2 + Math.PI * 0.2;
      const rx = state.cancerX + Math.cos(angle) * (r + 2);
      const ry = state.cancerY + Math.sin(angle) * (r + 2);
      drawReceptor(ctx, rx, ry, angle + Math.PI / 2, PALETTE.protein.mutant, 'diamond', 8);
    }

    // PD-L1 (stage 4-5)
    if (stage >= 4) {
      const pdl1Alpha = stage === 5 ? clamp(1 - stageProgress, 0, 1) : clamp(stageProgress, 0, 1);
      ctx.globalAlpha = cancerAlpha * pdl1Alpha;
      for (let i = 0; i < 3; i++) {
        const angle = Math.PI * 0.1 + i * 0.3;
        const rx = state.cancerX + Math.cos(angle) * (r + 2);
        const ry = state.cancerY + Math.sin(angle) * (r + 2);
        drawReceptor(ctx, rx, ry, angle + Math.PI / 2, PALETTE.signal.suppression, 'circle', 10);
      }
    }
    ctx.globalAlpha = 1;

    drawText(ctx, 'Cancer cell', state.cancerX, state.cancerY + r + 16, {
      fontSize: 10, color: PALETTE.cancer.label, align: 'center',
    });

    // Death fragments
    for (const f of state.fragments) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,100,80,${f.a.toFixed(3)})`;
      ctx.fill();
    }

    // ---- Dendritic cell (stages 1-3) ----
    if (stage >= 1 && stage <= 3) {
      const dcAlpha = stage === 1 ? clamp(stageProgress * 2, 0, 1) : 1;
      ctx.globalAlpha = dcAlpha;

      // DC is irregular-shaped — we use a cell with heavy wobble
      drawCell(ctx, state.dcX, state.dcY, r * 0.85, {
        fill: 'rgba(200,180,100,0.15)',
        edge: 'rgba(200,180,100,0.3)',
        glow: 'rgba(200,180,100,0.08)',
      }, time, 5);

      // DC "arms" (dendrites)
      ctx.strokeStyle = 'rgba(200,180,100,0.25)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const len = r * 0.5 + Math.sin(time + i) * 5;
        ctx.beginPath();
        ctx.moveTo(
          state.dcX + Math.cos(angle) * r * 0.6,
          state.dcY + Math.sin(angle) * r * 0.6
        );
        ctx.lineTo(
          state.dcX + Math.cos(angle) * (r * 0.6 + len),
          state.dcY + Math.sin(angle) * (r * 0.6 + len)
        );
        ctx.stroke();
      }

      // Captured neoantigen fragment (stage 1-3)
      if (stage >= 1) {
        const fragX = stage === 1 ? lerp(state.cancerX + r, state.dcX, stageProgress) : state.dcX;
        const fragY = stage === 1 ? lerp(state.cancerY, state.dcY, stageProgress) : state.dcY - r * 0.5;
        drawMolecule(ctx, fragX, fragY, 5, PALETTE.protein.mutant, 'diamond');
      }

      ctx.globalAlpha = 1;

      drawText(ctx, 'Dendritic cell', state.dcX, state.dcY + r + 16, {
        fontSize: 10, color: 'rgba(200,180,100,0.5)', align: 'center',
      });
    }

    // MHC-TCR interaction line (stage 2-3)
    if (stage === 2 && stageProgress > 0.3) {
      const lineAlpha = clamp((stageProgress - 0.3) * 2, 0, 0.4);
      drawArrow(ctx,
        { x: state.dcX + r * 0.8, y: state.dcY },
        { x: state.tcellX - r * 0.6, y: state.tcellY },
        `rgba(255,200,80,${lineAlpha.toFixed(3)})`, 1.5, 6
      );
    }

    // ---- T-cell ----
    const showTcell = stage >= 2;
    if (showTcell) {
      const tcellActivated = stage === 3 && stageProgress > 0.5 || stage === 5;
      const tcellExhausted = stage === 4;
      const tcellAlpha = stage === 2 ? clamp(stageProgress * 2, 0, 1) :
        tcellExhausted ? 0.4 : 1;

      ctx.globalAlpha = tcellAlpha;

      const tcellColor = tcellActivated
        ? { fill: PALETTE.immune.activated.fill, edge: PALETTE.immune.activated.edge, glow: PALETTE.immune.activated.glow }
        : tcellExhausted
          ? { fill: PALETTE.immune.exhausted.fill, edge: PALETTE.immune.exhausted.edge }
          : { fill: PALETTE.immune.fill, edge: PALETTE.immune.edge, glow: PALETTE.immune.glow };

      drawCell(ctx, state.tcellX, state.tcellY, r * 0.8, tcellColor, time, 2);
      drawNucleus(ctx, state.tcellX, state.tcellY, r * 0.25, PALETTE.immune.label);

      // TCR receptor
      const tcrAngle = Math.PI;
      drawReceptor(ctx,
        state.tcellX + Math.cos(tcrAngle) * (r * 0.8 + 2),
        state.tcellY + Math.sin(tcrAngle) * (r * 0.8 + 2),
        tcrAngle + Math.PI / 2, PALETTE.immune.label, 'antibody', 10);

      ctx.globalAlpha = 1;

      // Activation glow (stage 3)
      if (tcellActivated) {
        drawGlow(ctx, state.tcellX, state.tcellY, r * 2, PALETTE.immune.activated.glow, 0.6, time);
      }

      // T-cell clones (stage 5 — vaccine trains many)
      if (stage === 5 && stageProgress > 0.2) {
        const clonePositions = [
          { x: state.tcellX + r * 1.8, y: state.tcellY - r * 0.8 },
          { x: state.tcellX + r * 1.5, y: state.tcellY + r * 1.2 },
          { x: state.tcellX + r * 2.5, y: state.tcellY + r * 0.2 },
        ];
        for (let i = 0; i < clonePositions.length; i++) {
          const cloneAlpha = clamp((stageProgress - 0.2 - i * 0.15) * 3, 0, 0.7);
          ctx.globalAlpha = cloneAlpha;
          drawCell(ctx, clonePositions[i].x, clonePositions[i].y, r * 0.5, {
            fill: PALETTE.immune.activated.fill,
            edge: PALETTE.immune.activated.edge,
            glow: PALETTE.immune.activated.glow,
          }, time + i, 1);
        }
        ctx.globalAlpha = 1;
      }

      drawText(ctx, stage === 5 ? 'Trained T-cells' : 'T-cell', state.tcellX, state.tcellY + r + 16, {
        fontSize: 10, color: PALETTE.immune.label, align: 'center',
      });
    }

    // Suppression line (stage 4)
    if (stage === 4) {
      const lineAlpha = clamp(stageProgress * 0.5, 0, 0.4);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = `rgba(255,80,80,${lineAlpha.toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(state.cancerX + r, state.cancerY);
      ctx.lineTo(state.tcellX - r * 0.8, state.tcellY);
      ctx.stroke();
      ctx.setLineDash([]);

      drawText(ctx, 'PD-L1 suppression', (state.cancerX + state.tcellX) / 2, state.cancerY - 18, {
        fontSize: 10, color: PALETTE.signal.suppression, align: 'center',
      });
    }

    // Vaccine syringe hint (stage 5)
    if (stage === 5 && stageProgress < 0.3) {
      const syringeAlpha = clamp(stageProgress * 5, 0, 0.6);
      ctx.globalAlpha = syringeAlpha;
      drawText(ctx, 'Vaccine administered', w * 0.5, h * 0.12, {
        fontSize: 14, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
      });
      ctx.globalAlpha = 1;
    }

    // Attack arrows (stage 5, later)
    if (stage === 5 && stageProgress > 0.4) {
      const attackAlpha = clamp((stageProgress - 0.4) * 2, 0, 0.6);
      drawArrow(ctx,
        { x: state.tcellX - r * 0.8, y: state.tcellY },
        { x: state.cancerX + r, y: state.cancerY },
        `rgba(160,140,255,${attackAlpha.toFixed(3)})`, 2, 8);
    }

    // ---- Controls ----
    const controlY = h - 45;
    state.stepperAreas = drawStepperDots(ctx, stage, STAGES.length, w / 2, controlY);
    drawPhaseLabel(ctx, STAGES[stage].label, w / 2, controlY - 28);
    drawCaption(ctx, STAGES[stage].caption, w / 2, controlY + 16, w * 0.75);
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
