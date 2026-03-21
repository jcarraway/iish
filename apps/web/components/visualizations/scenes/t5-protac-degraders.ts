// ============================================================================
// T5 — PROTAC Degraders: Target Protein Destruction via Proteasome
// Stepper, 9 stages — "Unlike inhibitors that BLOCK, PROTACs REMOVE"
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawMolecule, drawGlow, drawArrow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  clamp, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const STAGES = [
  { label: '1. The target protein', caption: 'A disease-driving protein (like an oncogene product) is overactive in the cancer cell. Traditional drugs try to block it.' },
  { label: '2. Traditional inhibitor', caption: 'A standard drug sits in the active site, blocking function. But the protein is still there — and can evolve resistance.' },
  { label: '3. Enter PROTAC', caption: 'PROTAC is a bifunctional molecule: one end grabs the target protein, the other end grabs an E3 ubiquitin ligase.' },
  { label: '4. Ternary complex', caption: 'The PROTAC brings both proteins together, forming a ternary complex. The target and E3 ligase are now in close proximity.' },
  { label: '5. Ubiquitin tagging', caption: 'The E3 ligase attaches ubiquitin tags to the target protein. These tags are "destroy me" signals for the cell.' },
  { label: '6. Proteasome recruitment', caption: 'The cell\'s proteasome (protein shredder) recognizes the ubiquitin chain and pulls the tagged protein in.' },
  { label: '7. Target destroyed', caption: 'The proteasome breaks the target protein into small peptide fragments. The disease-driving protein is gone.' },
  { label: '8. PROTAC recycled', caption: 'The PROTAC molecule is released intact and can find another target protein. One PROTAC molecule can destroy many targets.' },
  { label: '9. Catalytic advantage', caption: 'Because PROTACs are catalytic (reusable), lower doses work. And degradation beats inhibition — you can\'t develop resistance to a protein that\'s gone.' },
];

interface State {
  stage: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
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
  };

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, STAGES.length - 1);
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);
    render();
  }

  // Draw PROTAC bifunctional molecule
  function drawPROTAC(x: number, y: number, size: number, time: number) {
    // Left arm (target binder) — blue
    drawMolecule(ctx, x - size * 0.6, y, size * 0.35, 'rgba(100,170,255,0.6)', 'circle');
    // Linker
    ctx.strokeStyle = 'rgba(200,200,200,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y);
    ctx.lineTo(x + size * 0.3, y);
    ctx.stroke();
    // Right arm (E3 binder) — green
    drawMolecule(ctx, x + size * 0.6, y, size * 0.35, 'rgba(80,200,140,0.6)', 'hexagon');
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
      // Target protein
      drawMolecule(ctx, cx, cy, 25, PALETTE.protein.mutant, 'hexagon');
      drawGlow(ctx, cx, cy, 40, 'rgba(240,100,90,0.15)', 0.4, time);
      drawText(ctx, 'Target protein', cx, cy + 35, {
        fontSize: 11, color: PALETTE.protein.mutant, align: 'center',
      });
      drawText(ctx, '(overactive oncogene product)', cx, cy + 50, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 1) {
      // Traditional inhibitor blocking
      drawMolecule(ctx, cx, cy, 25, PALETTE.protein.mutant, 'hexagon');
      // Small inhibitor drug
      drawMolecule(ctx, cx, cy - 12, 8, PALETTE.drug.fill, 'diamond');
      drawText(ctx, 'Inhibitor', cx + 20, cy - 15, {
        fontSize: 10, color: PALETTE.drug.label,
      });
      drawText(ctx, 'Blocks active site', cx, cy + 35, {
        fontSize: 11, color: PALETTE.text.secondary, align: 'center',
      });
      drawText(ctx, 'Protein still exists — resistance can develop', cx, cy + 52, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 2) {
      // PROTAC molecule alone
      drawPROTAC(cx, cy, 40, time);
      drawText(ctx, 'Target binder', cx - 28, cy - 25, {
        fontSize: 9, color: 'rgba(100,170,255,0.7)', align: 'center',
      });
      drawText(ctx, 'Linker', cx, cy - 15, {
        fontSize: 9, color: PALETTE.text.tertiary, align: 'center',
      });
      drawText(ctx, 'E3 ligase binder', cx + 28, cy - 25, {
        fontSize: 9, color: 'rgba(80,200,140,0.7)', align: 'center',
      });
      drawText(ctx, 'PROTAC — Proteolysis-Targeting Chimera', cx, cy + 35, {
        fontSize: 11, color: PALETTE.text.accent, align: 'center',
      });
    }

    if (stage === 3) {
      // Ternary complex forming
      const targetX = cx - 40;
      const e3X = cx + 40;

      // Target protein
      drawMolecule(ctx, targetX, cy, 20, PALETTE.protein.mutant, 'hexagon');
      drawText(ctx, 'Target', targetX, cy + 30, {
        fontSize: 9, color: PALETTE.protein.mutant, align: 'center',
      });

      // E3 ligase
      drawMolecule(ctx, e3X, cy, 18, 'rgba(80,200,140,0.5)', 'circle');
      drawText(ctx, 'E3 Ligase', e3X, cy + 28, {
        fontSize: 9, color: 'rgba(80,200,140,0.7)', align: 'center',
      });

      // PROTAC bridging
      drawPROTAC(cx, cy - 5, 30, time);
      drawGlow(ctx, cx, cy, 50, 'rgba(255,200,80,0.1)', 0.3, time);

      drawText(ctx, 'Ternary complex', cx, cy + 50, {
        fontSize: 11, fontWeight: '600', color: PALETTE.signal.activation, align: 'center',
      });
    }

    if (stage === 4) {
      // Ubiquitin tagging
      drawMolecule(ctx, cx - 25, cy, 18, PALETTE.protein.mutant, 'hexagon');
      drawMolecule(ctx, cx + 25, cy, 16, 'rgba(80,200,140,0.4)', 'circle');

      // Ubiquitin chain
      const ubCount = 4;
      for (let i = 0; i < ubCount; i++) {
        const ux = cx - 25 + (i + 1) * 8;
        const uy = cy - 25 - i * 8;
        drawMolecule(ctx, ux, uy, 5, 'rgba(255,200,80,0.6)', 'circle');
        if (i > 0) {
          ctx.strokeStyle = 'rgba(255,200,80,0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ux - 8, uy + 8);
          ctx.lineTo(ux, uy);
          ctx.stroke();
        }
      }
      drawText(ctx, 'Ub', cx - 10, cy - 55, {
        fontSize: 9, color: 'rgba(255,200,80,0.7)', align: 'center',
      });
      drawText(ctx, '"Destroy me" tags', cx, cy + 35, {
        fontSize: 11, color: 'rgba(255,200,80,0.8)', align: 'center',
      });
    }

    if (stage === 5) {
      // Proteasome
      const protX = cx;
      const protY = cy;

      // Barrel shape
      ctx.beginPath();
      ctx.roundRect(protX - 25, protY - 35, 50, 70, 10);
      ctx.fillStyle = 'rgba(180,160,200,0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(180,160,200,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Rings
      for (let i = 0; i < 4; i++) {
        const ry = protY - 25 + i * 18;
        ctx.strokeStyle = 'rgba(180,160,200,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(protX - 25, ry);
        ctx.lineTo(protX + 25, ry);
        ctx.stroke();
      }

      // Tagged protein approaching
      drawMolecule(ctx, protX, protY - 50, 14, PALETTE.protein.mutant, 'hexagon');
      // Ub tags
      for (let i = 0; i < 3; i++) {
        drawMolecule(ctx, protX + 15 + i * 7, protY - 55, 4, 'rgba(255,200,80,0.5)', 'circle');
      }

      drawArrow(ctx, { x: protX, y: protY - 40 }, { x: protX, y: protY - 30 }, PALETTE.text.tertiary, 1, 5);
      drawText(ctx, 'Proteasome', protX, protY + 45, {
        fontSize: 11, color: 'rgba(180,160,200,0.7)', align: 'center',
      });
    }

    if (stage === 6) {
      // Destruction — fragments
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.5;
        const dist = 20 + Math.sin(time * 2 + i) * 10;
        const fx = cx + Math.cos(angle) * dist;
        const fy = cy + Math.sin(angle) * dist;
        const alpha = 0.3 + Math.sin(time + i) * 0.1;
        ctx.globalAlpha = alpha;
        drawMolecule(ctx, fx, fy, 3, PALETTE.protein.mutant, 'circle');
      }
      ctx.globalAlpha = 1;

      drawText(ctx, 'Protein destroyed', cx, cy + 45, {
        fontSize: 12, fontWeight: '600', color: PALETTE.signal.death, align: 'center',
      });
      drawText(ctx, 'Broken into peptide fragments', cx, cy + 62, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 7) {
      // PROTAC recycled — finding next target
      drawPROTAC(cx - 30, cy, 30, time);
      drawGlow(ctx, cx - 30, cy, 30, 'rgba(100,170,255,0.1)', 0.3, time);

      // Arrow to next target
      drawArrow(ctx, { x: cx + 5, y: cy }, { x: cx + 40, y: cy }, PALETTE.text.accent, 1.5, 6);

      // Next target
      ctx.globalAlpha = 0.5;
      drawMolecule(ctx, cx + 60, cy, 18, PALETTE.protein.mutant, 'hexagon');
      ctx.globalAlpha = 1;
      drawText(ctx, '?', cx + 60, cy, {
        fontSize: 14, color: PALETTE.text.primary, align: 'center',
      });

      drawText(ctx, 'PROTAC released intact', cx - 30, cy + 35, {
        fontSize: 11, color: PALETTE.text.accent, align: 'center',
      });
      drawText(ctx, 'Ready for the next target', cx - 30, cy + 50, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 8) {
      // Comparison: inhibitor vs degrader
      const leftX = w * 0.28;
      const rightX = w * 0.72;

      // Inhibitor side
      drawText(ctx, 'Traditional Inhibitor', leftX, cy - 55, {
        fontSize: 12, fontWeight: '600', color: PALETTE.text.secondary, align: 'center',
      });
      drawMolecule(ctx, leftX, cy, 20, PALETTE.protein.mutant, 'hexagon');
      drawMolecule(ctx, leftX, cy - 10, 6, PALETTE.drug.fill, 'diamond');
      drawText(ctx, 'Blocked but present', leftX, cy + 30, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
      drawText(ctx, '1 drug = 1 protein blocked', leftX, cy + 44, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });

      // VS
      drawText(ctx, 'vs', cx, cy, {
        fontSize: 14, color: PALETTE.text.tertiary, align: 'center',
      });

      // PROTAC side
      drawText(ctx, 'PROTAC Degrader', rightX, cy - 55, {
        fontSize: 12, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
      });
      // Empty spot with fragments
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        drawMolecule(ctx, rightX + Math.cos(angle) * 15, cy + Math.sin(angle) * 15, 2, 'rgba(240,100,90,0.3)', 'circle');
      }
      drawText(ctx, 'Protein gone', rightX, cy + 30, {
        fontSize: 10, color: 'rgba(80,200,140,0.7)', align: 'center',
      });
      drawText(ctx, '1 drug = many proteins destroyed', rightX, cy + 44, {
        fontSize: 10, color: PALETTE.text.accent, align: 'center',
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
