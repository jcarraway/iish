// ============================================================================
// B1 — How Mutations Cause Cancer: From Single Base Change to Tumor
// Stepper, 7 stages — "A single letter change starts everything"
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawDNA, drawMolecule, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  clamp, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const STAGES = [
  { label: '1. Normal DNA', caption: 'Your DNA contains ~3 billion base pairs organized in 20,000+ genes. Each gene is a set of instructions.' },
  { label: '2. A single base changes', caption: 'One letter changes: A→T, C→G, or a deletion. This can happen from radiation, chemicals, or random copying errors.' },
  { label: '3. Protein changes shape', caption: 'The mutated gene produces a misfolded protein. If it\'s a critical protein like p53, the consequences are severe.' },
  { label: '4. Tumor suppressor lost', caption: 'p53 normally stops damaged cells from dividing. Without it, the cell loses its "emergency brake."' },
  { label: '5. Uncontrolled division', caption: 'With no brake, the cell divides unchecked. Each daughter cell carries the same mutation.' },
  { label: '6. More mutations accumulate', caption: 'Each division risks more errors. Mutations in growth genes (oncogenes) accelerate division further.' },
  { label: '7. Tumor forms', caption: 'After accumulating 4-7 driver mutations, a mass of abnormal cells forms — a tumor. This may take years.' },
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
    particles: createParticleSystem(40, { width, height }),
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

  function render() {
    const { w, h, time, stage } = state;
    const cx = w * 0.5;
    const cy = h * 0.38;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    if (stage === 0) {
      // Normal DNA strand
      drawDNA(ctx, cx - 80, cy, 160, PALETTE.dna.fill, false, time);
      drawGlow(ctx, cx, cy, 60, 'rgba(100,180,255,0.1)', 0.3, time);
      // Base pair labels
      const bases = ['A', 'T', 'C', 'G', 'A', 'T', 'G', 'C'];
      for (let i = 0; i < bases.length; i++) {
        drawText(ctx, bases[i], cx - 70 + i * 20, cy + 22, {
          fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
          fontFamily: 'monospace',
        });
      }
      drawText(ctx, '...3 billion base pairs...', cx, cy + 40, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 1) {
      // Mutation highlight
      drawDNA(ctx, cx - 80, cy, 160, PALETTE.dna.fill, false, time);
      // Mutation flash
      const mutX = cx + 10;
      drawGlow(ctx, mutX, cy, 15, 'rgba(255,80,60,0.4)', 0.5 + Math.sin(time * 4) * 0.3, time);
      // Before/after
      drawText(ctx, '...ATCGATCG...', cx - 20, cy - 25, {
        fontSize: 12, color: PALETTE.text.secondary, align: 'center', fontFamily: 'monospace',
      });
      drawText(ctx, '...ATCG', cx - 48, cy + 25, {
        fontSize: 12, color: PALETTE.text.secondary, fontFamily: 'monospace',
      });
      drawText(ctx, 'T', cx + 6, cy + 25, {
        fontSize: 12, fontWeight: 'bold', color: 'rgba(255,80,60,0.9)', fontFamily: 'monospace',
      });
      drawText(ctx, 'TCG...', cx + 16, cy + 25, {
        fontSize: 12, color: PALETTE.text.secondary, fontFamily: 'monospace',
      });
    }

    if (stage === 2) {
      // Normal protein vs mutant protein
      const leftX = cx - 50;
      const rightX = cx + 50;

      // Normal
      drawMolecule(ctx, leftX, cy, 20, PALETTE.protein.normal, 'hexagon');
      drawText(ctx, 'Normal p53', leftX, cy + 30, {
        fontSize: 10, color: PALETTE.protein.normal, align: 'center',
      });

      // Arrow
      ctx.strokeStyle = PALETTE.text.tertiary;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftX + 25, cy);
      ctx.lineTo(rightX - 25, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightX - 28, cy - 4);
      ctx.lineTo(rightX - 25, cy);
      ctx.lineTo(rightX - 28, cy + 4);
      ctx.fill();

      // Mutant (misshapen)
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
        const wobble = Math.sin(i * 2.1) * 5;
        const r = 20 + wobble;
        const px = rightX + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = PALETTE.protein.mutant;
      ctx.fill();
      drawText(ctx, 'Mutant p53', rightX, cy + 30, {
        fontSize: 10, color: PALETTE.protein.mutant, align: 'center',
      });
    }

    if (stage === 3) {
      // Lost tumor suppressor — cell with missing brake
      drawCell(ctx, cx, cy, 50, {
        fill: PALETTE.healthy.fill,
        edge: PALETTE.healthy.edge,
      }, time, 2);
      drawNucleus(ctx, cx, cy, 18, PALETTE.healthy.edge);

      // X on p53
      const p53X = cx + 35;
      const p53Y = cy - 35;
      drawMolecule(ctx, p53X, p53Y, 10, PALETTE.protein.mutant, 'hexagon');
      ctx.strokeStyle = 'rgba(255,80,80,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p53X - 8, p53Y - 8);
      ctx.lineTo(p53X + 8, p53Y + 8);
      ctx.moveTo(p53X + 8, p53Y - 8);
      ctx.lineTo(p53X - 8, p53Y + 8);
      ctx.stroke();

      drawText(ctx, 'p53 non-functional', cx, cy + 60, {
        fontSize: 11, color: 'rgba(255,80,80,0.7)', align: 'center',
      });
      drawText(ctx, '"Emergency brake broken"', cx, cy + 76, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 4) {
      // Dividing cells
      const cellCount = 4;
      for (let i = 0; i < cellCount; i++) {
        const angle = (i / cellCount) * Math.PI * 2 + time * 0.2;
        const dist = 30 + i * 10;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        drawCell(ctx, px, py, 18 - i * 2, {
          fill: PALETTE.cancer.fill,
          edge: PALETTE.cancer.edge,
        }, time + i, 2);
      }
      // Division arrows
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
        const startR = 25;
        const endR = 55;
        ctx.strokeStyle = 'rgba(255,200,80,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * startR, cy + Math.sin(angle) * startR);
        ctx.lineTo(cx + Math.cos(angle) * endR, cy + Math.sin(angle) * endR);
        ctx.stroke();
      }
      drawText(ctx, 'Uncontrolled division', cx, cy + 70, {
        fontSize: 11, color: PALETTE.cancer.label, align: 'center',
      });
    }

    if (stage === 5) {
      // Multiple mutations accumulating
      const cellRadius = 40;
      drawCell(ctx, cx, cy, cellRadius, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
        glow: PALETTE.cancer.glow,
      }, time, 3);
      drawNucleus(ctx, cx, cy, cellRadius * 0.3, PALETTE.cancer.edge);

      // Mutation markers
      const mutations = [
        { angle: 0.3, label: 'p53' },
        { angle: 1.2, label: 'KRAS' },
        { angle: 2.5, label: 'PIK3CA' },
        { angle: 3.8, label: 'PTEN' },
      ];
      for (const m of mutations) {
        const mx = cx + Math.cos(m.angle) * (cellRadius + 15);
        const my = cy + Math.sin(m.angle) * (cellRadius + 15);
        drawMolecule(ctx, mx, my, 5, PALETTE.protein.mutant, 'diamond');
        drawText(ctx, m.label, mx + 10, my, {
          fontSize: 9, color: PALETTE.protein.mutant,
        });
      }
      drawText(ctx, '4-7 driver mutations accumulate', cx, cy + 65, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 6) {
      // Tumor mass
      const tumorR = 50;
      for (let ring = 3; ring >= 0; ring--) {
        const r = tumorR - ring * 10;
        const count = ring === 0 ? 1 : ring * 4;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + ring * 0.5;
          const dist = ring === 0 ? 0 : r * 0.6;
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;
          const cr = 10 - ring;
          drawCell(ctx, px, py, cr, {
            fill: PALETTE.cancer.fill,
            edge: PALETTE.cancer.edge,
          }, time + i + ring, 1.5);
        }
      }
      drawGlow(ctx, cx, cy, tumorR * 1.5, PALETTE.cancer.glow, 0.4, time);
      drawText(ctx, 'Tumor', cx, cy + tumorR + 20, {
        fontSize: 13, fontWeight: '600', color: PALETTE.cancer.label, align: 'center',
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
    },
    onPointerDown,
    nextStage: () => goToStage(state.stage + 1),
    prevStage: () => goToStage(state.stage - 1),
    getStage: () => state.stage,
  };
}
