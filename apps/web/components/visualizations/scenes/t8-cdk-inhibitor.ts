// ============================================================================
// T8 — CDK4/6 Inhibitors: Cell Cycle Arrest at G1/S Checkpoint
// Stepper, 8 stages — cell cycle wheel with drug blocking G1→S transition
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawMolecule, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const STAGES = [
  { label: '1. The cell cycle', caption: 'Every cell goes through a cycle: G1 (growth) → S (DNA copy) → G2 (prep) → M (division). Cancer cells cycle too fast.' },
  { label: '2. G1 phase', caption: 'During G1, the cell grows and prepares to copy its DNA. This is the first and longest phase.' },
  { label: '3. The G1/S checkpoint', caption: 'Before entering S phase, the cell must pass a critical checkpoint. CDK4/6 acts as the "green light."' },
  { label: '4. CDK4/6 gives the go', caption: 'CDK4/6 proteins partner with Cyclin D to phosphorylate Rb, releasing E2F transcription factors. Division proceeds.' },
  { label: '5. Unchecked cycling', caption: 'In ER+ breast cancer, the CDK4/6-Cyclin D pathway is hyperactive. Cells blast through the checkpoint.' },
  { label: '6. Drug enters', caption: 'CDK4/6 inhibitors (palbociclib, ribociclib, abemaciclib) enter the cell and find the CDK4/6-Cyclin D complex.' },
  { label: '7. Red light!', caption: 'The drug blocks CDK4/6, preventing Rb phosphorylation. The checkpoint stays locked. The cell is stuck in G1.' },
  { label: '8. Cell cycle arrest', caption: 'Unable to enter S phase, the cancer cell stops dividing. Combined with hormone therapy, this is very effective for ER+ disease.' },
];

const PHASES_RING = [
  { name: 'G1', startAngle: -Math.PI / 2, endAngle: Math.PI * 0.2, color: 'rgba(100,200,160,0.3)' },
  { name: 'S', startAngle: Math.PI * 0.2, endAngle: Math.PI * 0.7, color: 'rgba(100,170,255,0.3)' },
  { name: 'G2', startAngle: Math.PI * 0.7, endAngle: Math.PI * 1.05, color: 'rgba(200,160,255,0.3)' },
  { name: 'M', startAngle: Math.PI * 1.05, endAngle: Math.PI * 1.5, color: 'rgba(255,160,100,0.3)' },
];

interface State {
  stage: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
  markerAngle: number; // current position on cycle
  blocked: boolean;
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
    particles: createParticleSystem(35, { width, height }),
    stepperAreas: [],
    markerAngle: -Math.PI / 2,
    blocked: false,
  };

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, STAGES.length - 1);
    state.blocked = idx >= 7;
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);

    // Marker rotation
    if (state.stage <= 4 && !state.blocked) {
      // Normal cycling — speed up at stage 4-5
      const cycleSpeed = state.stage >= 4 ? 0.8 : 0.3;
      state.markerAngle += dt * cycleSpeed;
      if (state.markerAngle > Math.PI * 1.5) state.markerAngle -= Math.PI * 2;
    } else if (state.stage === 1) {
      // Park in G1
      state.markerAngle = lerp(state.markerAngle, -Math.PI * 0.1, dt * 2);
    } else if (state.stage >= 6) {
      // Approach and stick at checkpoint
      const checkpointAngle = Math.PI * 0.18;
      state.markerAngle = lerp(state.markerAngle, checkpointAngle, dt * 2);
    }

    render();
  }

  function render() {
    const { w, h, time, stage } = state;
    const cx = w * 0.4;
    const cy = h * 0.42;
    const ringRadius = Math.min(w, h) * 0.18;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // ---- Cell cycle ring ----
    for (const phase of PHASES_RING) {
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, phase.startAngle, phase.endAngle);
      ctx.lineWidth = 18;
      ctx.strokeStyle = phase.color;
      ctx.stroke();

      // Label
      const midAngle = (phase.startAngle + phase.endAngle) / 2;
      const labelR = ringRadius + 22;
      const lx = cx + Math.cos(midAngle) * labelR;
      const ly = cy + Math.sin(midAngle) * labelR;
      drawText(ctx, phase.name, lx, ly, {
        fontSize: 13, fontWeight: '600', color: phase.color.replace(/0\.3\)/, '0.8)'), align: 'center',
      });
    }

    // Inner ring outline
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius - 10, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Marker on ring
    const markerX = cx + Math.cos(state.markerAngle) * ringRadius;
    const markerY = cy + Math.sin(state.markerAngle) * ringRadius;
    ctx.beginPath();
    ctx.arc(markerX, markerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = stage >= 7 ? 'rgba(255,80,80,0.8)' : 'rgba(255,255,255,0.9)';
    ctx.fill();
    drawGlow(ctx, markerX, markerY, 12, stage >= 7 ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.2)', 0.5, time);

    // ---- G1/S Checkpoint indicator ----
    const checkAngle = Math.PI * 0.2;
    const checkX = cx + Math.cos(checkAngle) * ringRadius;
    const checkY = cy + Math.sin(checkAngle) * ringRadius;

    if (stage >= 2) {
      const isBlocked = stage >= 6;
      // Gate bar
      ctx.strokeStyle = isBlocked ? 'rgba(255,80,80,0.6)' : 'rgba(80,200,140,0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const gateLen = 14;
      const perpAngle = checkAngle + Math.PI / 2;
      ctx.moveTo(checkX + Math.cos(perpAngle) * gateLen, checkY + Math.sin(perpAngle) * gateLen);
      ctx.lineTo(checkX - Math.cos(perpAngle) * gateLen, checkY - Math.sin(perpAngle) * gateLen);
      ctx.stroke();

      // Gate light
      const lightX = checkX + Math.cos(checkAngle) * 22;
      const lightY = checkY + Math.sin(checkAngle) * 22;
      ctx.beginPath();
      ctx.arc(lightX, lightY, 5, 0, Math.PI * 2);
      ctx.fillStyle = isBlocked ? 'rgba(255,80,80,0.8)' : 'rgba(80,200,140,0.8)';
      ctx.fill();
      drawGlow(ctx, lightX, lightY, 10,
        isBlocked ? 'rgba(255,80,80,0.3)' : 'rgba(80,200,140,0.3)', 0.5, time);

      drawText(ctx, isBlocked ? 'BLOCKED' : 'OPEN', lightX + 14, lightY, {
        fontSize: 9, color: isBlocked ? 'rgba(255,80,80,0.8)' : 'rgba(80,200,140,0.8)',
      });
    }

    // ---- CDK4/6 + Cyclin D (stages 3-4) ----
    if (stage >= 3 && stage <= 5) {
      const cdkX = cx;
      const cdkY = cy;
      drawMolecule(ctx, cdkX - 8, cdkY, 8, 'rgba(100,200,160,0.5)', 'hexagon');
      drawMolecule(ctx, cdkX + 8, cdkY, 7, 'rgba(255,200,80,0.5)', 'circle');
      drawText(ctx, 'CDK4/6', cdkX - 8, cdkY + 16, {
        fontSize: 9, color: 'rgba(100,200,160,0.7)', align: 'center',
      });
      drawText(ctx, 'Cyclin D', cdkX + 8, cdkY + 16, {
        fontSize: 9, color: 'rgba(255,200,80,0.7)', align: 'center',
      });
    }

    // ---- Drug blocking (stages 6-7) ----
    if (stage >= 6) {
      const cdkX = cx;
      const cdkY = cy;

      // CDK4/6 complex
      drawMolecule(ctx, cdkX - 8, cdkY, 8, 'rgba(100,200,160,0.3)', 'hexagon');
      drawMolecule(ctx, cdkX + 8, cdkY, 7, 'rgba(255,200,80,0.3)', 'circle');

      // Drug molecule on top
      drawMolecule(ctx, cdkX, cdkY, 10, 'rgba(100,170,255,0.6)', 'diamond');
      drawGlow(ctx, cdkX, cdkY, 18, 'rgba(100,170,255,0.2)', 0.4, time);

      drawText(ctx, 'CDK4/6i', cdkX, cdkY + 20, {
        fontSize: 10, fontWeight: '600', color: PALETTE.drug.label, align: 'center',
      });

      // Red X on the complex
      ctx.strokeStyle = 'rgba(255,80,80,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cdkX - 6, cdkY - 6);
      ctx.lineTo(cdkX + 6, cdkY + 6);
      ctx.moveTo(cdkX + 6, cdkY - 6);
      ctx.lineTo(cdkX - 6, cdkY + 6);
      ctx.stroke();
    }

    // ---- Stage 7 emphasis: stuck cell ----
    if (stage === 7) {
      drawText(ctx, 'ARRESTED IN G1', cx, cy + ringRadius + 40, {
        fontSize: 12, fontWeight: '600', color: 'rgba(255,80,80,0.8)', align: 'center',
      });
    }

    // ---- Right panel: context ----
    const infoX = w * 0.68;
    let infoY = h * 0.15;

    const titles: Record<number, string> = {
      0: 'Cell Division Cycle',
      1: 'G1: Growth Phase',
      2: 'The Checkpoint',
      3: 'CDK4/6 Complex',
      4: 'Hyperactive Cycling',
      5: 'Cancer Exploits This',
      6: 'Drug Intervention',
      7: 'Cycle Arrested',
    };

    drawText(ctx, titles[stage] ?? '', infoX, infoY, {
      fontSize: 16, fontWeight: 'bold', color: PALETTE.text.primary,
    });
    infoY += 28;

    if (stage >= 6) {
      drawText(ctx, 'Palbociclib / Ribociclib / Abemaciclib', infoX, infoY, {
        fontSize: 11, color: PALETTE.text.accent,
      });
      infoY += 20;
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
    },
    onPointerDown,
    nextStage: () => goToStage(state.stage + 1),
    prevStage: () => goToStage(state.stage - 1),
    getStage: () => state.stage,
  };
}
