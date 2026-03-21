// ============================================================================
// B3 — Metastasis: Seed and Soil — Cancer Cell Journey
// Stepper, 8 stages — cell detaches, travels, colonizes distant site
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawMembrane, drawMolecule, drawGlow, drawArrow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const STAGES = [
  { label: '1. Primary tumor', caption: 'Cancer cells grow as a mass in the original organ (e.g., breast). They are held together by adhesion proteins.' },
  { label: '2. Cell detaches', caption: 'Some cells lose adhesion proteins (like E-cadherin), allowing them to break free from the tumor mass.' },
  { label: '3. Invades tissue', caption: 'The freed cell releases enzymes (MMPs) that dissolve surrounding tissue, creating a path to blood vessels.' },
  { label: '4. Enters bloodstream', caption: 'The cancer cell squeezes through the vessel wall (intravasation) and enters the bloodstream.' },
  { label: '5. Travels', caption: 'The circulating tumor cell (CTC) travels through the bloodstream. Most die — less than 0.01% survive.' },
  { label: '6. Exits vessel', caption: 'The surviving cell sticks to a vessel wall at a distant organ and squeezes out (extravasation).' },
  { label: '7. Colonizes', caption: 'If the "soil" is favorable (the right organ microenvironment), the cell begins to grow at the new site.' },
  { label: '8. New tumor', caption: 'A metastatic tumor forms in the distant organ. It\'s breast cancer in the bone/liver/lung/brain — not a new cancer.' },
];

interface TravelingCell {
  x: number;
  y: number;
}

interface State {
  stage: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
  travelingCell: TravelingCell;
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
    travelingCell: { x: 0, y: 0 },
  };

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, STAGES.length - 1);
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);

    // Traveling cell animation
    if (state.stage === 4) {
      state.travelingCell.x += dt * 60;
      state.travelingCell.y = Math.sin(state.time * 2) * 8;
      if (state.travelingCell.x > state.w * 0.8) state.travelingCell.x = state.w * 0.2;
    }

    render();
  }

  function render() {
    const { w, h, time, stage } = state;
    const cx = w * 0.5;
    const cy = h * 0.38;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    if (stage === 0) {
      // Primary tumor cluster
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const dist = i === 0 ? 0 : 22;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        drawCell(ctx, px, py, 14, {
          fill: PALETTE.cancer.fill,
          edge: PALETTE.cancer.edge,
        }, time + i, 1.5);
      }
      drawGlow(ctx, cx, cy, 60, PALETTE.cancer.glow, 0.3, time);
      drawText(ctx, 'Primary tumor', cx, cy + 50, {
        fontSize: 11, color: PALETTE.cancer.label, align: 'center',
      });
    }

    if (stage === 1) {
      // Tumor with one cell breaking away
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const dist = i === 0 ? 0 : 20;
        const px = cx - 20 + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        drawCell(ctx, px, py, 13, {
          fill: PALETTE.cancer.fill,
          edge: PALETTE.cancer.edge,
        }, time + i, 1.5);
      }

      // Detaching cell
      const detachX = cx + 40 + Math.sin(time * 2) * 5;
      drawCell(ctx, detachX, cy - 10, 12, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.accent,
        glow: 'rgba(255,130,100,0.15)',
      }, time, 2);

      // Broken connection
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(detachX, cy - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      drawText(ctx, 'E-cadherin lost', detachX, cy + 12, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 2) {
      // Cell invading tissue
      // Tissue background
      ctx.fillStyle = 'rgba(200,160,140,0.06)';
      ctx.fillRect(w * 0.15, cy - 40, w * 0.7, 80);

      // Enzyme particles
      for (let i = 0; i < 5; i++) {
        const ex = cx + 15 + Math.cos(time * 1.5 + i) * (10 + i * 8);
        const ey = cy + Math.sin(time + i * 2) * 10;
        drawMolecule(ctx, ex, ey, 3, 'rgba(255,200,80,0.5)', 'triangle');
      }
      drawText(ctx, 'MMP enzymes', cx + 60, cy + 30, {
        fontSize: 10, color: 'rgba(255,200,80,0.6)', align: 'center',
      });

      // Cancer cell pushing through
      drawCell(ctx, cx - 10, cy, 14, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.accent,
      }, time, 2);
      drawArrow(ctx, { x: cx + 10, y: cy }, { x: cx + 50, y: cy }, PALETTE.cancer.accent, 1.5, 6);
    }

    if (stage === 3) {
      // Intravasation — entering blood vessel
      // Vessel walls
      const vesselTop = cy - 20;
      const vesselBot = cy + 20;
      const vesselPoints: { x: number; y: number }[] = [];
      for (let i = 0; i <= 10; i++) {
        vesselPoints.push({ x: w * 0.15 + (i / 10) * w * 0.7, y: vesselTop });
      }
      drawMembrane(ctx, vesselPoints, 'rgba(200,80,80,0.3)', 2, time);
      const bottomPoints = vesselPoints.map(p => ({ ...p, y: vesselBot }));
      drawMembrane(ctx, bottomPoints, 'rgba(200,80,80,0.3)', 2, time);

      // Vessel interior
      ctx.fillStyle = 'rgba(200,60,60,0.04)';
      ctx.fillRect(w * 0.15, vesselTop, w * 0.7, vesselBot - vesselTop);

      // Cell squeezing through wall
      const squeezeX = cx - 10;
      ctx.save();
      ctx.scale(0.8, 1.3); // Elongated
      drawCell(ctx, squeezeX / 0.8, (vesselTop) / 1.3, 10, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.accent,
      }, time, 2);
      ctx.restore();

      drawText(ctx, 'Intravasation', cx, vesselBot + 25, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 4) {
      // Circulating in bloodstream
      // Blood vessel
      const gradient = ctx.createLinearGradient(0, cy - 25, 0, cy + 25);
      gradient.addColorStop(0, 'rgba(200,60,60,0.08)');
      gradient.addColorStop(0.5, 'rgba(200,60,60,0.04)');
      gradient.addColorStop(1, 'rgba(200,60,60,0.08)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, cy - 25, w, 50);

      // Blood cells
      for (let i = 0; i < 8; i++) {
        const bx = (i * w / 8 + time * 30) % w;
        const by = cy + Math.sin(i * 1.7 + time) * 12;
        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,80,80,0.2)';
        ctx.fill();
      }

      // CTC
      const ctcX = state.travelingCell.x;
      const ctcY = cy + state.travelingCell.y;
      drawCell(ctx, ctcX, ctcY, 10, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.accent,
        glow: 'rgba(255,130,100,0.2)',
      }, time, 2);
      drawGlow(ctx, ctcX, ctcY, 18, PALETTE.cancer.glow, 0.4, time);

      drawText(ctx, 'Circulating tumor cell (CTC)', cx, cy + 40, {
        fontSize: 11, color: PALETTE.cancer.label, align: 'center',
      });
      drawText(ctx, '<0.01% survive this journey', cx, cy + 55, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 5) {
      // Extravasation — exiting vessel at distant site
      const vesselY = cy;
      const vesselPoints: { x: number; y: number }[] = [];
      for (let i = 0; i <= 10; i++) {
        vesselPoints.push({ x: w * 0.2 + (i / 10) * w * 0.6, y: vesselY - 15 });
      }
      drawMembrane(ctx, vesselPoints, 'rgba(200,80,80,0.3)', 2, time);
      const botPoints = vesselPoints.map(p => ({ ...p, y: vesselY + 15 }));
      drawMembrane(ctx, botPoints, 'rgba(200,80,80,0.3)', 2, time);

      // Cell pushing out
      drawCell(ctx, cx, vesselY + 20, 10, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.accent,
      }, time, 2);

      // Arrow down
      drawArrow(ctx, { x: cx, y: vesselY + 5 }, { x: cx, y: vesselY + 35 }, PALETTE.cancer.accent, 1, 5);

      // Distant organ tissue
      ctx.fillStyle = 'rgba(160,180,200,0.06)';
      ctx.fillRect(w * 0.2, vesselY + 30, w * 0.6, 30);
      drawText(ctx, 'Distant organ tissue', cx, vesselY + 55, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 6) {
      // Colonization starting
      ctx.fillStyle = 'rgba(160,180,200,0.04)';
      ctx.fillRect(w * 0.2, cy - 30, w * 0.6, 60);

      // Small cluster forming
      drawCell(ctx, cx, cy, 12, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
      }, time, 2);
      drawCell(ctx, cx + 18, cy - 5, 10, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
      }, time + 1, 1.5);
      drawCell(ctx, cx - 10, cy + 15, 9, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
      }, time + 2, 1.5);

      drawGlow(ctx, cx, cy, 40, PALETTE.cancer.glow, 0.3, time);

      drawText(ctx, '"Seed" meets favorable "Soil"', cx, cy + 45, {
        fontSize: 11, color: PALETTE.text.accent, align: 'center',
      });
    }

    if (stage === 7) {
      // Metastatic tumor
      // Organ outline (simplified)
      ctx.beginPath();
      ctx.roundRect(cx - 60, cy - 40, 120, 80, 20);
      ctx.fillStyle = 'rgba(160,180,200,0.06)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(160,180,200,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
      drawText(ctx, 'Distant organ (e.g. bone, liver)', cx, cy - 50, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });

      // Tumor mass inside
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = i === 0 ? 0 : 18;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        drawCell(ctx, px, py, 10, {
          fill: PALETTE.cancer.fill,
          edge: PALETTE.cancer.edge,
        }, time + i, 1);
      }
      drawGlow(ctx, cx, cy, 50, PALETTE.cancer.glow, 0.4, time);

      drawText(ctx, 'Metastatic breast cancer', cx, cy + 50, {
        fontSize: 12, fontWeight: '600', color: PALETTE.cancer.label, align: 'center',
      });
      drawText(ctx, 'Still breast cancer — not a new cancer type', cx, cy + 66, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    // Controls
    const controlY = h - 45;
    state.stepperAreas = drawStepperDots(ctx, stage, STAGES.length, w / 2, controlY, 4, 14);
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
