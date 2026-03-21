// ============================================================================
// T6 — Radiation Therapy: Photon → DNA Double-Strand Break → Cell Death
// Stepper, 8 stages — shows why cancer cells are worse at DNA repair
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawDNA, drawMolecule, drawGlow, drawArrow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const STAGES = [
  { label: '1. Photon beam', caption: 'High-energy X-ray photons are aimed precisely at the tumor from a linear accelerator.' },
  { label: '2. Entering tissue', caption: 'The photon beam passes through skin and tissue to reach the tumor inside.' },
  { label: '3. Hitting DNA', caption: 'The photon strikes DNA in a cancer cell, depositing energy at the molecular level.' },
  { label: '4. Double-strand break', caption: 'The energy breaks both strands of the DNA helix — the most lethal type of DNA damage.' },
  { label: '5. Repair attempt', caption: 'The cell activates DNA repair proteins, trying to fix the broken strands.' },
  { label: '6. Cancer: repair fails', caption: 'Cancer cells have defective repair pathways (like broken BRCA). The damage persists.' },
  { label: '7. Cell death', caption: 'Unable to repair its DNA, the cancer cell triggers programmed death (apoptosis).' },
  { label: '8. Normal cell repairs', caption: 'Healthy cells have intact repair machinery. They fix the break and survive — that\'s why radiation works.' },
];

interface State {
  stage: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
  beamX: number; // animated
  breakAnim: number; // 0-1
}

export function init(
  _canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SceneAPI {
  const state: State = {
    stage: 0,
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(40, { width, height }),
    stepperAreas: [],
    beamX: -50,
    breakAnim: 0,
  };

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, STAGES.length - 1);
    state.breakAnim = 0;
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);

    // Animate beam position
    if (state.stage === 0) {
      state.beamX = lerp(state.beamX, state.w * 0.5, dt * 2);
    } else if (state.stage === 1) {
      state.beamX = lerp(state.beamX, state.w * 0.5, dt * 3);
    }

    // Break animation progress
    if (state.stage >= 3) {
      state.breakAnim = clamp(state.breakAnim + dt * 0.8, 0, 1);
    }

    render();
  }

  function render() {
    const { w, h, time, stage } = state;
    const cx = w * 0.5;
    const cy = h * 0.38;
    const cellRadius = Math.min(w, h) * 0.14;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // ---- Stage 0: Beam source ----
    if (stage === 0) {
      // Linear accelerator representation
      const srcX = w * 0.1;
      const srcY = cy;
      ctx.beginPath();
      ctx.roundRect(srcX - 15, srcY - 20, 30, 40, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      drawText(ctx, 'LINAC', srcX, srcY + 30, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });

      // Beam
      const beamEndX = state.beamX;
      ctx.strokeStyle = 'rgba(255,220,80,0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(srcX + 15, srcY);
      ctx.lineTo(beamEndX, srcY);
      ctx.stroke();

      // Beam tip glow
      drawGlow(ctx, beamEndX, srcY, 15, 'rgba(255,220,80,0.3)', 0.6, time);
    }

    // ---- Stages 1-2: Beam entering tissue to cell ----
    if (stage >= 1 && stage <= 2) {
      // Tissue layers
      const layerH = h * 0.5;
      const gradient = ctx.createLinearGradient(0, cy - layerH / 2, 0, cy + layerH / 2);
      gradient.addColorStop(0, 'rgba(200,160,140,0.06)');
      gradient.addColorStop(0.5, 'rgba(200,160,140,0.04)');
      gradient.addColorStop(1, 'rgba(200,160,140,0.06)');
      ctx.fillStyle = gradient;
      ctx.fillRect(w * 0.2, cy - layerH / 2, w * 0.6, layerH);

      // Beam line through tissue
      ctx.strokeStyle = 'rgba(255,220,80,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.1, cy);
      ctx.lineTo(cx, cy);
      ctx.stroke();

      // Cell
      drawCell(ctx, cx, cy, cellRadius, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
      }, time, 2);
      drawNucleus(ctx, cx, cy, cellRadius * 0.3, PALETTE.cancer.edge);

      if (stage === 2) {
        // Beam hits DNA
        drawGlow(ctx, cx, cy, cellRadius * 0.5, 'rgba(255,220,80,0.25)', 0.7, time);
        drawDNA(ctx, cx - cellRadius * 0.5, cy, cellRadius, PALETTE.dna.fill, false, time);
      }
    }

    // ---- Stages 3-5: DNA break + repair ----
    if (stage >= 3 && stage <= 5) {
      drawCell(ctx, cx, cy, cellRadius, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
      }, time, 2);

      // Broken DNA
      const gapSize = state.breakAnim * 12;
      drawDNA(ctx, cx - cellRadius * 0.5, cy - gapSize, cellRadius * 0.45, PALETTE.dna.damaged, true, time);
      drawDNA(ctx, cx + 2, cy + gapSize, cellRadius * 0.45, PALETTE.dna.damaged, true, time);

      // Break flash
      if (stage === 3) {
        drawGlow(ctx, cx, cy, 20, 'rgba(255,80,60,0.4)', 0.5 + Math.sin(time * 4) * 0.3, time);
      }

      // Repair proteins (stage 4)
      if (stage === 4) {
        for (let i = 0; i < 4; i++) {
          const angle = time * 0.8 + (i / 4) * Math.PI * 2;
          const dist = 15 + Math.sin(time * 2 + i) * 5;
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;
          drawMolecule(ctx, px, py, 4, 'rgba(255,200,80,0.6)', 'hexagon');
        }
        drawText(ctx, 'Repair proteins', cx, cy + cellRadius + 20, {
          fontSize: 10, color: 'rgba(255,200,80,0.6)', align: 'center',
        });
      }

      // Repair failure (stage 5)
      if (stage === 5) {
        // Scattered repair proteins (failed)
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + 0.3;
          const dist = 25 + Math.sin(time + i) * 3;
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;
          ctx.globalAlpha = 0.3;
          drawMolecule(ctx, px, py, 3, 'rgba(255,200,80,0.3)', 'hexagon');
          ctx.globalAlpha = 1;
        }
        // Red X on DNA
        ctx.strokeStyle = 'rgba(255,80,60,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 12);
        ctx.lineTo(cx + 12, cy + 12);
        ctx.moveTo(cx + 12, cy - 12);
        ctx.lineTo(cx - 12, cy + 12);
        ctx.stroke();

        drawText(ctx, 'BRCA defective', cx, cy + cellRadius + 20, {
          fontSize: 10, color: 'rgba(255,80,80,0.7)', align: 'center',
        });
      }
    }

    // ---- Stage 6: Cell death ----
    if (stage === 6) {
      const deathAlpha = 0.3 + Math.sin(time * 2) * 0.1;
      ctx.globalAlpha = deathAlpha;
      drawCell(ctx, cx, cy, cellRadius, {
        fill: PALETTE.cancer.dead,
        edge: 'rgba(230,100,80,0.15)',
      }, time, 1);
      ctx.globalAlpha = 1;

      // Fragment particles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.3;
        const dist = cellRadius * 1.2 + time * 3;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const a = clamp(1 - dist / (cellRadius * 3), 0, 0.4);
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = PALETTE.cancer.edge;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      drawText(ctx, 'Apoptosis', cx, cy + cellRadius + 20, {
        fontSize: 12, fontWeight: '600', color: PALETTE.signal.death, align: 'center',
      });
    }

    // ---- Stage 7: Normal cell comparison ----
    if (stage === 7) {
      // Cancer cell (left, dead)
      const leftX = w * 0.3;
      ctx.globalAlpha = 0.3;
      drawCell(ctx, leftX, cy, cellRadius * 0.8, {
        fill: PALETTE.cancer.dead,
        edge: 'rgba(230,100,80,0.15)',
      }, time, 1);
      ctx.globalAlpha = 1;
      drawText(ctx, 'Cancer cell', leftX, cy + cellRadius + 8, {
        fontSize: 10, color: PALETTE.cancer.label, align: 'center',
      });
      drawText(ctx, 'Repair failed', leftX, cy + cellRadius + 22, {
        fontSize: 10, color: 'rgba(255,80,80,0.6)', align: 'center',
      });

      // Normal cell (right, repaired)
      const rightX = w * 0.7;
      drawCell(ctx, rightX, cy, cellRadius * 0.8, {
        fill: PALETTE.healthy.fill,
        edge: PALETTE.healthy.edge,
        glow: PALETTE.healthy.glow,
      }, time, 2);
      drawNucleus(ctx, rightX, cy, cellRadius * 0.25, PALETTE.healthy.edge);
      drawDNA(ctx, rightX - cellRadius * 0.4, cy, cellRadius * 0.8, 'rgba(80,200,140,0.5)', false, time);
      drawText(ctx, 'Normal cell', rightX, cy + cellRadius + 8, {
        fontSize: 10, color: 'rgba(80,200,140,0.6)', align: 'center',
      });
      drawText(ctx, 'DNA repaired', rightX, cy + cellRadius + 22, {
        fontSize: 10, color: 'rgba(80,200,140,0.8)', align: 'center',
      });

      // Arrow between
      drawArrow(ctx, { x: leftX + cellRadius + 10, y: cy }, { x: rightX - cellRadius - 10, y: cy }, PALETTE.text.tertiary, 1, 6);
      drawText(ctx, 'vs', w * 0.5, cy - 8, {
        fontSize: 12, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    // ---- Controls ----
    const controlY = h - 45;
    state.stepperAreas = drawStepperDots(ctx, stage, STAGES.length, w / 2, controlY);
    drawPhaseLabel(ctx, STAGES[stage].label, w / 2, controlY - 28);
    drawCaption(ctx, STAGES[stage].caption, w / 2, controlY + 16, w * 0.7);
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
