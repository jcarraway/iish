// ============================================================================
// T1 — Antibody-Drug Conjugate Mechanism: 7-Phase Timeline
// Antibody binds → internalized → payload released → DNA damage → death → bystander
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawGlow, drawMolecule, drawAntibody, drawDNA,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, easeOut, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const PHASES = [
  { label: '1. ADC in bloodstream', caption: 'The antibody-drug conjugate circulates through the blood, searching for its target.' },
  { label: '2. Receptor binding', caption: 'The antibody arm locks onto the HER2 receptor on the cancer cell surface.' },
  { label: '3. Internalization', caption: 'The cell membrane wraps around the ADC and pulls it inside the cell.' },
  { label: '4. Payload release', caption: 'Inside a lysosome, the chemical linker breaks and the cytotoxic drug is released.' },
  { label: '5. DNA damage', caption: 'The payload drug enters the nucleus and damages the cancer cell\'s DNA.' },
  { label: '6. Cell death', caption: 'Unable to repair the damage, the cell undergoes programmed death (apoptosis).' },
  { label: '7. Bystander effect', caption: 'Released payload leaks to nearby cancer cells, destroying them too.' },
];

interface State {
  stage: number;
  stageProgress: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
  // Positions
  cellX: number;
  cellY: number;
  adcX: number;
  adcY: number;
  // Death fragments
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
    cellX: width * 0.6,
    cellY: height * 0.42,
    adcX: width * 0.15,
    adcY: height * 0.42,
    fragments: [],
  };

  function layout() {
    state.cellX = state.w * 0.6;
    state.cellY = state.h * 0.42;
  }

  layout();

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, PHASES.length - 1);
    state.stageProgress = 0;
    if (idx < 5) state.fragments = [];
    if (idx === 0) {
      state.adcX = state.w * 0.15;
      state.adcY = state.h * 0.42;
    }
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    state.stageProgress = clamp(state.stageProgress + dt * 0.25, 0, 1);

    updateParticles(state.particles, dt * speed);

    const { stage } = state;
    const cellRadius = Math.min(state.w, state.h) * 0.14;

    // ADC movement
    if (stage === 0) {
      // Floating in bloodstream
      state.adcX = state.w * 0.15 + Math.sin(state.time * 0.8) * 15;
      state.adcY = state.h * 0.42 + Math.cos(state.time * 0.6) * 10;
    } else if (stage === 1) {
      // Moving toward cell surface
      const targetX = state.cellX - cellRadius - 15;
      state.adcX = lerp(state.adcX, targetX, dt * 2);
      state.adcY = lerp(state.adcY, state.cellY, dt * 2);
    } else if (stage >= 2 && stage <= 4) {
      // Inside cell
      state.adcX = lerp(state.adcX, state.cellX, dt * 2);
      state.adcY = lerp(state.adcY, state.cellY, dt * 2);
    }

    // Fragments
    for (const f of state.fragments) {
      f.x += f.vx * dt * 60;
      f.y += f.vy * dt * 60;
      f.a -= dt * 0.2;
    }
    state.fragments = state.fragments.filter(f => f.a > 0);

    if (stage === 5 && state.stageProgress > 0.3 && state.fragments.length < 15) {
      state.fragments.push({
        x: state.cellX + (Math.random() - 0.5) * 60,
        y: state.cellY + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        r: 2 + Math.random() * 5,
        a: 0.6,
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

    // ---- Cancer cell ----
    const cellAlpha = stage === 5 ? clamp(1 - stageProgress * 0.7, 0.2, 1) : 1;
    ctx.globalAlpha = cellAlpha;

    if (stage <= 5) {
      drawCell(ctx, state.cellX, state.cellY, cellRadius, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
        glow: stage >= 4 ? PALETTE.signal.death : PALETTE.cancer.glow,
      }, time);

      // HER2 receptors on cell surface
      const receptorCount = 6;
      for (let i = 0; i < receptorCount; i++) {
        const angle = Math.PI + (i - 2.5) * 0.35;
        const rx = state.cellX + Math.cos(angle) * (cellRadius + 2);
        const ry = state.cellY + Math.sin(angle) * (cellRadius + 2);
        ctx.globalAlpha = cellAlpha * (stage <= 1 ? 1 : 0.4);
        drawMolecule(ctx, rx, ry, 3, PALETTE.receptor.her2, 'circle');
      }
      ctx.globalAlpha = cellAlpha;

      // Nucleus with DNA
      if (stage >= 4) {
        drawDNA(ctx, state.cellX - cellRadius * 0.4, state.cellY, cellRadius * 0.8,
          PALETTE.dna.fill, true, time);
        // Red flashes
        if (stageProgress > 0.2) {
          drawGlow(ctx, state.cellX, state.cellY, cellRadius * 0.5,
            PALETTE.dna.damaged, Math.sin(time * 6) * 0.3 + 0.3, time);
        }
      } else {
        drawNucleus(ctx, state.cellX, state.cellY, cellRadius * 0.3, PALETTE.cancer.accent);
      }

      ctx.globalAlpha = 1;
    }

    // ---- ADC molecule ----
    if (stage <= 4) {
      const adcAlpha = stage >= 3 ? clamp(1 - stageProgress, 0.2, 1) : 1;
      ctx.globalAlpha = adcAlpha;

      // Antibody body
      drawAntibody(ctx, state.adcX, state.adcY, 20, PALETTE.drug.edge);

      // Payload spheres attached to antibody
      const payloadPositions = [
        { dx: -6, dy: 8 },
        { dx: 6, dy: 8 },
        { dx: 0, dy: 14 },
      ];
      for (const p of payloadPositions) {
        if (stage < 3 || (stage === 3 && stageProgress < 0.5)) {
          drawMolecule(ctx, state.adcX + p.dx, state.adcY + p.dy, 3, PALETTE.payload.fill, 'circle');
        }
      }

      // Drug label
      if (stage === 0) {
        drawText(ctx, 'ADC', state.adcX, state.adcY - 30, {
          fontSize: 11,
          fontWeight: '600',
          color: PALETTE.drug.label,
          align: 'center',
        });
      }

      ctx.globalAlpha = 1;
    }

    // Released payload (stage 3-4)
    if (stage >= 3 && stage <= 4) {
      const payloadAlpha = clamp(stageProgress * 2, 0, 0.8);
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + time;
        const dist = 10 + stageProgress * 20;
        const px = state.cellX + Math.cos(angle) * dist;
        const py = state.cellY + Math.sin(angle) * dist;
        ctx.globalAlpha = payloadAlpha;
        drawMolecule(ctx, px, py, 3, PALETTE.payload.fill, 'circle');
        drawGlow(ctx, px, py, 8, PALETTE.payload.glow, 0.3, time);
      }
      ctx.globalAlpha = 1;
    }

    // Internalization membrane wrap (stage 2)
    if (stage === 2) {
      const wrapProgress = easeOut(stageProgress);
      ctx.strokeStyle = PALETTE.cancer.edge;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const wrapAngle = Math.PI * wrapProgress;
      ctx.arc(state.cellX - cellRadius, state.cellY, 12, -wrapAngle / 2, wrapAngle / 2);
      ctx.stroke();
    }

    // Binding indicator (stage 1)
    if (stage === 1 && stageProgress > 0.5) {
      drawGlow(ctx, state.adcX + 10, state.adcY, 15, PALETTE.signal.activation, 0.5, time);
    }

    // Death fragments (stage 5)
    for (const f of state.fragments) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,100,80,${f.a.toFixed(3)})`;
      ctx.fill();
    }

    // ---- Bystander effect (stage 6) ----
    if (stage === 6) {
      // Neighbor cells being affected
      const neighbors = [
        { x: state.cellX - cellRadius * 2.5, y: state.cellY - cellRadius },
        { x: state.cellX + cellRadius * 2, y: state.cellY + cellRadius * 0.5 },
        { x: state.cellX - cellRadius, y: state.cellY + cellRadius * 2 },
      ];

      for (let i = 0; i < neighbors.length; i++) {
        const n = neighbors[i];
        const nAlpha = clamp(1 - stageProgress * (0.3 + i * 0.2), 0.3, 1);
        ctx.globalAlpha = nAlpha;
        drawCell(ctx, n.x, n.y, cellRadius * 0.7, {
          fill: PALETTE.cancer.fill,
          edge: PALETTE.cancer.edge,
        }, time, 2);
        ctx.globalAlpha = 1;

        // Payload trail from dead cell to neighbor
        const trailAlpha = clamp(stageProgress * 2 - i * 0.3, 0, 0.5);
        if (trailAlpha > 0) {
          ctx.setLineDash([3, 6]);
          ctx.strokeStyle = `rgba(240,90,70,${trailAlpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(state.cellX, state.cellY);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Payload dots along trail
          drawMolecule(ctx,
            lerp(state.cellX, n.x, stageProgress),
            lerp(state.cellY, n.y, stageProgress),
            3, `rgba(240,90,70,${trailAlpha.toFixed(3)})`, 'circle');
        }
      }
    }

    // ---- Labels ----
    if (stage <= 5) {
      drawText(ctx, 'Cancer cell', state.cellX, state.cellY + cellRadius + 16, {
        fontSize: 11,
        color: PALETTE.cancer.label,
        align: 'center',
      });
    }

    // ---- Controls ----
    const controlY = h - 45;
    state.stepperAreas = drawStepperDots(ctx, stage, PHASES.length, w / 2, controlY);
    drawPhaseLabel(ctx, PHASES[stage].label, w / 2, controlY - 28);
    drawCaption(ctx, PHASES[stage].caption, w / 2, controlY + 16, w * 0.75);
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
