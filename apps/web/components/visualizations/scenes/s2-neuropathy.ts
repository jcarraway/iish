// ============================================================================
// S2 — Chemotherapy-Induced Peripheral Neuropathy (CIPN)
// Stepper, 8 stages — Normal nerve → taxane → microtubule stabilization →
// transport blocked → signals stuck → axon death → numbness → recovery
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawMolecule, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, easeOut, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const STAGES = [
  { label: '1. Normal nerve', caption: 'Peripheral nerves carry signals from your brain to your hands and feet. Vesicles travel along microtubule tracks inside the axon.' },
  { label: '2. Taxane enters', caption: 'Taxane chemotherapy drugs (paclitaxel, docetaxel) enter nerve cells. These drugs are designed to disrupt cell division, but nerves are affected too.' },
  { label: '3. Microtubules stabilized', caption: 'Taxanes lock microtubules in place — they can no longer dynamically assemble and disassemble as needed for transport.' },
  { label: '4. Transport blocked', caption: 'With microtubules frozen, molecular motors can no longer carry vesicles along the tracks. Cargo piles up.' },
  { label: '5. Signals stuck', caption: 'Neurotransmitters and growth factors can\'t reach the nerve endings. Signal transmission begins to fail.' },
  { label: '6. Distal axon dies', caption: 'Starved of supplies, the farthest nerve endings (in fingers and toes) degenerate first — "dying back" neuropathy.' },
  { label: '7. Numbness and tingling', caption: 'Loss of sensation begins in the extremities: tingling, numbness, pain, and difficulty with fine motor tasks like buttoning a shirt.' },
  { label: '8. Recovery potential', caption: 'After treatment ends, nerves can slowly regrow (~1mm/day). Recovery takes months to years, and may be incomplete for some patients.' },
];

interface Vesicle {
  pos: number; // 0-1 along axon
  speed: number;
  radius: number;
  color: string;
}

interface State {
  stage: number;
  stageProgress: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
  vesicles: Vesicle[];
  // Nerve geometry
  nerveStartX: number;
  nerveEndX: number;
  nerveY: number;
}

export function init(
  _canvas: HTMLCanvasElement,
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
    particles: createParticleSystem(35, { width, height }),
    stepperAreas: [],
    vesicles: [],
    nerveStartX: width * 0.08,
    nerveEndX: width * 0.92,
    nerveY: height * 0.38,
  };

  function layout() {
    state.nerveStartX = state.w * 0.08;
    state.nerveEndX = state.w * 0.92;
    state.nerveY = state.h * 0.38;
  }
  layout();
  initVesicles();

  function initVesicles() {
    state.vesicles = [];
    const colors = [
      'rgba(80,200,140,0.6)',
      'rgba(100,170,255,0.5)',
      'rgba(255,200,80,0.5)',
      'rgba(140,130,230,0.5)',
    ];
    for (let i = 0; i < 8; i++) {
      state.vesicles.push({
        pos: Math.random() * 0.7,
        speed: 0.03 + Math.random() * 0.04,
        radius: 3 + Math.random() * 2,
        color: colors[i % colors.length],
      });
    }
  }

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, STAGES.length - 1);
    state.stageProgress = 0;
    if (idx === 0) initVesicles();
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    state.stageProgress = clamp(state.stageProgress + dt * 0.2, 0, 1);
    updateParticles(state.particles, dt * speed);

    // Vesicle movement
    const transportActive = state.stage <= 1;
    const transportBlocked = state.stage >= 3 && state.stage <= 5;
    const recovering = state.stage === 7;

    for (const v of state.vesicles) {
      if (transportActive || recovering) {
        v.pos += v.speed * dt;
        if (v.pos > 1) v.pos = 0;
      } else if (transportBlocked) {
        // Vesicles slow down and pile up
        const blockPoint = 0.35 + (state.vesicles.indexOf(v) % 3) * 0.05;
        if (v.pos < blockPoint) {
          v.pos += v.speed * dt * 0.1;
          v.pos = Math.min(v.pos, blockPoint);
        }
      }
    }

    render();
  }

  function drawNerveAxon(startX: number, endX: number, y: number, degeneration: number) {
    const axonLength = endX - startX;

    // Myelin sheath segments
    const myelinCount = 12;
    const segW = axonLength / (myelinCount * 2);
    for (let i = 0; i < myelinCount; i++) {
      const mx = startX + i * segW * 2;
      const degenFactor = i > myelinCount * (1 - degeneration) ? degeneration : 0;
      const alpha = clamp(0.15 - degenFactor * 0.12, 0.03, 0.15);

      ctx.beginPath();
      ctx.roundRect(mx, y - 18, segW * 1.6, 36, 8);
      ctx.fillStyle = `rgba(200,180,100,${alpha.toFixed(3)})`;
      ctx.fill();
    }

    // Axon core
    const axonAlpha = clamp(0.3 - degeneration * 0.2, 0.05, 0.3);
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX - axonLength * degeneration, y);
    ctx.strokeStyle = `rgba(200,180,100,${axonAlpha.toFixed(3)})`;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Degenerated end (if dying)
    if (degeneration > 0.1) {
      const degenStart = endX - axonLength * degeneration;
      ctx.beginPath();
      ctx.moveTo(degenStart, y);
      ctx.lineTo(endX, y);
      ctx.strokeStyle = 'rgba(200,180,100,0.08)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function drawMicrotubules(startX: number, endX: number, y: number, frozen: boolean) {
    const mtCount = 3;
    const offsets = [-6, 0, 6];

    for (let m = 0; m < mtCount; m++) {
      const my = y + offsets[m];
      ctx.beginPath();
      ctx.moveTo(startX + 10, my);
      ctx.lineTo(endX - 10, my);

      if (frozen) {
        ctx.strokeStyle = 'rgba(100,170,255,0.35)';
        ctx.lineWidth = 2.5;
      } else {
        ctx.strokeStyle = 'rgba(100,170,255,0.15)';
        ctx.lineWidth = 1.5;
      }
      ctx.stroke();

      // Tubulin dimers (small marks along track)
      const dimerSpacing = 12;
      const length = endX - startX - 20;
      for (let d = 0; d < length / dimerSpacing; d++) {
        const dx = startX + 10 + d * dimerSpacing;
        ctx.fillStyle = frozen ? 'rgba(100,170,255,0.3)' : 'rgba(100,170,255,0.12)';
        ctx.fillRect(dx, my - 1, 3, 2);
      }
    }
  }

  function drawSignalGlow(x: number, y: number, intensity: number) {
    drawGlow(ctx, x, y, 25, 'rgba(255,200,80,0.5)', intensity, state.time);
    // Small lightning bolt hint
    if (intensity > 0.3) {
      ctx.strokeStyle = `rgba(255,200,80,${(intensity * 0.5).toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 8);
      ctx.lineTo(x + 1, y - 2);
      ctx.lineTo(x - 2, y + 1);
      ctx.lineTo(x + 4, y + 8);
      ctx.stroke();
    }
  }

  function render() {
    const { w, h, time, stage, stageProgress } = state;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    const nerveStart = state.nerveStartX;
    const nerveEnd = state.nerveEndX;
    const nerveY = state.nerveY;

    // ---- Stage 0: Normal nerve ----
    if (stage === 0) {
      drawNerveAxon(nerveStart, nerveEnd, nerveY, 0);
      drawMicrotubules(nerveStart, nerveEnd, nerveY, false);

      // Vesicles traveling along
      for (const v of state.vesicles) {
        const vx = nerveStart + v.pos * (nerveEnd - nerveStart);
        const vy = nerveY + Math.sin(time * 3 + v.pos * 10) * 2;
        drawMolecule(ctx, vx, vy, v.radius, v.color, 'circle');
      }

      // Signal glow at nerve ending
      drawSignalGlow(nerveEnd - 8, nerveY, 0.6);

      // Labels
      drawText(ctx, 'Cell body', nerveStart + 20, nerveY - 30, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
      drawText(ctx, 'Nerve ending', nerveEnd - 30, nerveY - 30, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });

      // Cell body bulge
      ctx.beginPath();
      ctx.arc(nerveStart + 8, nerveY, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,180,100,0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,180,100,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Nucleus in cell body
      ctx.beginPath();
      ctx.arc(nerveStart + 8, nerveY, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,180,100,0.3)';
      ctx.fill();

      // Legend
      const legendY = h * 0.65;
      ctx.beginPath();
      ctx.arc(w * 0.25, legendY, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(80,200,140,0.6)';
      ctx.fill();
      drawText(ctx, 'Vesicles (cargo)', w * 0.25 + 10, legendY, {
        fontSize: 10, color: PALETTE.text.tertiary,
      });

      ctx.fillStyle = 'rgba(100,170,255,0.15)';
      ctx.fillRect(w * 0.55, legendY - 1, 16, 2);
      drawText(ctx, 'Microtubule tracks', w * 0.55 + 22, legendY, {
        fontSize: 10, color: PALETTE.text.tertiary,
      });
    }

    // ---- Stage 1: Taxane enters ----
    if (stage === 1) {
      drawNerveAxon(nerveStart, nerveEnd, nerveY, 0);
      drawMicrotubules(nerveStart, nerveEnd, nerveY, false);

      // Vesicles still moving
      for (const v of state.vesicles) {
        const vx = nerveStart + v.pos * (nerveEnd - nerveStart);
        const vy = nerveY + Math.sin(time * 3 + v.pos * 10) * 2;
        drawMolecule(ctx, vx, vy, v.radius, v.color, 'circle');
      }

      // Taxane molecules approaching from above
      const taxaneCount = 6;
      for (let i = 0; i < taxaneCount; i++) {
        const tx = nerveStart + (i + 0.5) / taxaneCount * (nerveEnd - nerveStart);
        const startY = -20;
        const targetY = nerveY - 25;
        const progress = clamp((stageProgress - i * 0.08) * 2, 0, 1);
        const ty = lerp(startY, targetY, easeOut(progress));

        drawMolecule(ctx, tx, ty, 6, PALETTE.drug.fill, 'hexagon');
        if (progress > 0.5) {
          drawGlow(ctx, tx, ty, 12, PALETTE.drug.glow, 0.3, time + i);
        }
      }

      drawText(ctx, 'Taxane molecules', w * 0.5, h * 0.12, {
        fontSize: 12, color: PALETTE.drug.label, align: 'center',
      });

      drawSignalGlow(nerveEnd - 8, nerveY, 0.5);
    }

    // ---- Stage 2: Microtubules stabilized ----
    if (stage === 2) {
      drawNerveAxon(nerveStart, nerveEnd, nerveY, 0);
      drawMicrotubules(nerveStart, nerveEnd, nerveY, true);

      // Taxane molecules bound to microtubules
      const boundPositions = [0.15, 0.3, 0.45, 0.6, 0.75, 0.85];
      for (let i = 0; i < boundPositions.length; i++) {
        const bx = nerveStart + boundPositions[i] * (nerveEnd - nerveStart);
        const offY = [-6, 0, 6][i % 3];
        const alpha = clamp((stageProgress - i * 0.1) * 3, 0, 1);
        ctx.globalAlpha = alpha;
        drawMolecule(ctx, bx, nerveY + offY, 5, PALETTE.drug.fill, 'hexagon');
        ctx.globalAlpha = 1;
      }

      // Frozen glow along microtubules
      if (stageProgress > 0.5) {
        const glowAlpha = clamp((stageProgress - 0.5) * 2, 0, 0.3);
        const gradient = ctx.createLinearGradient(nerveStart, nerveY - 10, nerveEnd, nerveY + 10);
        gradient.addColorStop(0, `rgba(100,170,255,0)`);
        gradient.addColorStop(0.5, `rgba(100,170,255,${glowAlpha.toFixed(3)})`);
        gradient.addColorStop(1, `rgba(100,170,255,0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(nerveStart, nerveY - 15, nerveEnd - nerveStart, 30);
      }

      // Vesicles still moving but slowing
      for (const v of state.vesicles) {
        const vx = nerveStart + v.pos * (nerveEnd - nerveStart);
        const vy = nerveY + Math.sin(time * 2 + v.pos * 10) * 1;
        drawMolecule(ctx, vx, vy, v.radius, v.color, 'circle');
      }

      drawText(ctx, 'Microtubules locked in place', w * 0.5, h * 0.15, {
        fontSize: 12, fontWeight: '600', color: PALETTE.drug.label, align: 'center',
      });
    }

    // ---- Stage 3: Transport blocked ----
    if (stage === 3) {
      drawNerveAxon(nerveStart, nerveEnd, nerveY, 0);
      drawMicrotubules(nerveStart, nerveEnd, nerveY, true);

      // Taxane bound
      for (let i = 0; i < 5; i++) {
        const bx = nerveStart + (0.15 + i * 0.15) * (nerveEnd - nerveStart);
        drawMolecule(ctx, bx, nerveY + [-6, 0, 6][i % 3], 4, PALETTE.drug.fill, 'hexagon');
      }

      // Vesicles piled up near blockage
      for (const v of state.vesicles) {
        const vx = nerveStart + v.pos * (nerveEnd - nerveStart);
        const jitter = Math.sin(time * 4 + v.pos * 20) * 1.5;
        drawMolecule(ctx, vx, nerveY + jitter, v.radius, v.color, 'circle');
      }

      // Traffic jam indicator
      if (stageProgress > 0.3) {
        const jamX = nerveStart + 0.35 * (nerveEnd - nerveStart);
        drawText(ctx, 'Cargo pile-up', jamX, nerveY - 30, {
          fontSize: 10, fontWeight: '600', color: PALETTE.signal.activation, align: 'center',
        });

        // Warning glow
        drawGlow(ctx, jamX, nerveY, 30, PALETTE.signal.activation, 0.3, time);
      }

      // Empty nerve ending
      drawText(ctx, 'No cargo reaching ending', nerveEnd - 50, nerveY - 30, {
        fontSize: 10, color: PALETTE.signal.suppression, align: 'center',
      });
    }

    // ---- Stage 4: Signals stuck ----
    if (stage === 4) {
      drawNerveAxon(nerveStart, nerveEnd, nerveY, 0);
      drawMicrotubules(nerveStart, nerveEnd, nerveY, true);

      // Piled vesicles
      for (const v of state.vesicles) {
        const vx = nerveStart + v.pos * (nerveEnd - nerveStart);
        drawMolecule(ctx, vx, nerveY + Math.sin(time * 3 + v.pos * 15) * 2, v.radius, v.color, 'circle');
      }

      // Failed signal at nerve ending
      const endX = nerveEnd - 15;
      const failAlpha = Math.sin(time * 5) * 0.3 + 0.2;
      drawSignalGlow(endX, nerveY, failAlpha * 0.3);

      // X mark over signal
      if (stageProgress > 0.4) {
        ctx.strokeStyle = PALETTE.signal.suppression;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(endX - 8, nerveY - 8);
        ctx.lineTo(endX + 8, nerveY + 8);
        ctx.moveTo(endX + 8, nerveY - 8);
        ctx.lineTo(endX - 8, nerveY + 8);
        ctx.stroke();
      }

      // Brain to hand pathway dimming
      drawText(ctx, 'Signal transmission failing', w * 0.5, h * 0.15, {
        fontSize: 13, fontWeight: '600', color: PALETTE.signal.suppression, align: 'center',
      });
    }

    // ---- Stage 5: Distal axon dies ----
    if (stage === 5) {
      const degen = easeOut(clamp(stageProgress * 1.5, 0, 0.6));
      drawNerveAxon(nerveStart, nerveEnd, nerveY, degen);
      drawMicrotubules(nerveStart, nerveEnd * (1 - degen * 0.5), nerveY, true);

      // Remaining vesicles only in proximal part
      for (const v of state.vesicles) {
        if (v.pos < 0.4) {
          const vx = nerveStart + v.pos * (nerveEnd - nerveStart);
          drawMolecule(ctx, vx, nerveY, v.radius, v.color, 'circle');
        }
      }

      // Debris particles at degenerating end
      if (stageProgress > 0.3) {
        const debrisCount = Math.floor(stageProgress * 10);
        for (let i = 0; i < debrisCount; i++) {
          const dx = nerveEnd - (nerveEnd - nerveStart) * degen * 0.5 + Math.sin(time + i * 1.7) * 20;
          const dy = nerveY + Math.cos(time + i * 2.3) * 15;
          ctx.beginPath();
          ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200,180,100,0.15)';
          ctx.fill();
        }
      }

      drawText(ctx, '"Dying back" — farthest endings lost first', w * 0.5, h * 0.15, {
        fontSize: 12, fontWeight: '600', color: PALETTE.cancer.label, align: 'center',
      });

      // Arrow showing direction of degeneration
      if (stageProgress > 0.5) {
        const arrowStart = nerveEnd - 20;
        const arrowEnd = nerveEnd - (nerveEnd - nerveStart) * degen * 0.5;
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = PALETTE.cancer.edge;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(arrowStart, nerveY + 25);
        ctx.lineTo(arrowEnd, nerveY + 25);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        drawText(ctx, 'Degeneration direction', (arrowStart + arrowEnd) / 2, nerveY + 38, {
          fontSize: 9, color: PALETTE.cancer.label, align: 'center',
        });
      }
    }

    // ---- Stage 6: Numbness ----
    if (stage === 6) {
      // Hand outline (simplified)
      const handX = w * 0.5;
      const handY = h * 0.32;
      const handScale = Math.min(w, h) * 0.002;

      // Palm
      ctx.beginPath();
      ctx.ellipse(handX, handY + 20 * handScale, 35 * handScale, 40 * handScale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Fingers
      const fingerAngles = [-0.4, -0.2, 0, 0.2, 0.45];
      const fingerLengths = [28, 38, 40, 36, 22];
      for (let i = 0; i < 5; i++) {
        const angle = fingerAngles[i] - Math.PI / 2;
        const len = fingerLengths[i] * handScale;
        const fx = handX + Math.cos(angle) * 30 * handScale;
        const fy = handY - 15 * handScale + Math.sin(angle) * 30 * handScale;
        const ftx = fx + Math.cos(angle) * len;
        const fty = fy + Math.sin(angle) * len;

        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(ftx, fty);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 6 * handScale;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Numbness zones at fingertips (pulsing)
        const numbAlpha = 0.15 + Math.sin(time * 2 + i * 0.8) * 0.1;
        drawGlow(ctx, ftx, fty, 12 * handScale, 'rgba(230,100,80,0.5)', numbAlpha * easeOut(stageProgress), time + i);
      }

      // Symptoms list
      const symptoms = [
        { text: 'Tingling', icon: 'rgba(255,200,80,0.3)' },
        { text: 'Numbness', icon: 'rgba(140,130,230,0.3)' },
        { text: 'Burning pain', icon: 'rgba(230,100,80,0.3)' },
        { text: 'Fine motor difficulty', icon: 'rgba(100,170,255,0.3)' },
      ];

      const symStartY = h * 0.62;
      for (let i = 0; i < symptoms.length; i++) {
        const sx = w * 0.15 + (i % 2) * w * 0.4;
        const sy = symStartY + Math.floor(i / 2) * 24;
        const symAlpha = clamp((stageProgress - i * 0.15) * 3, 0, 1);
        ctx.globalAlpha = symAlpha;

        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = symptoms[i].icon;
        ctx.fill();
        drawText(ctx, symptoms[i].text, sx + 10, sy, {
          fontSize: 11, color: PALETTE.text.secondary,
        });
        ctx.globalAlpha = 1;
      }
    }

    // ---- Stage 7: Recovery ----
    if (stage === 7) {
      // Regrowing nerve
      const regenProgress = easeOut(clamp(stageProgress * 1.2, 0, 1));
      const regenEnd = nerveStart + (nerveEnd - nerveStart) * (0.5 + regenProgress * 0.5);

      drawNerveAxon(nerveStart, regenEnd, nerveY, 0);
      drawMicrotubules(nerveStart, regenEnd, nerveY, false);

      // Vesicles moving in regrown section
      for (const v of state.vesicles) {
        const maxPos = (regenEnd - nerveStart) / (nerveEnd - nerveStart);
        if (v.pos > maxPos) v.pos = 0;
        const vx = nerveStart + v.pos * (nerveEnd - nerveStart);
        if (vx < regenEnd) {
          const vy = nerveY + Math.sin(time * 3 + v.pos * 10) * 2;
          drawMolecule(ctx, vx, vy, v.radius, v.color, 'circle');
        }
      }

      // Growth cone at tip
      drawGlow(ctx, regenEnd, nerveY, 15, PALETTE.healthy.glow, 0.5, time);
      ctx.beginPath();
      ctx.arc(regenEnd, nerveY, 5, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.healthy.edge;
      ctx.fill();

      // Regrowing label
      drawText(ctx, 'Regrowth (~1mm/day)', regenEnd, nerveY - 25, {
        fontSize: 10, color: PALETTE.healthy.edge, align: 'center',
      });

      // Remaining gap
      if (regenEnd < nerveEnd - 10) {
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = 'rgba(200,180,100,0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(regenEnd + 8, nerveY);
        ctx.lineTo(nerveEnd, nerveY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Recovery note
      const noteY = h * 0.62;
      ctx.beginPath();
      ctx.roundRect(w * 0.12, noteY, w * 0.76, h * 0.1, 6);
      ctx.fillStyle = 'rgba(80,200,140,0.06)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(80,200,140,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawText(ctx, 'Recovery varies by patient', w * 0.5, noteY + h * 0.03, {
        fontSize: 12, fontWeight: '600', color: PALETTE.healthy.edge, align: 'center',
      });
      drawText(ctx, 'Some patients fully recover; others have lasting symptoms', w * 0.5, noteY + h * 0.065, {
        fontSize: 11, color: PALETTE.text.secondary, align: 'center',
      });
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
