// ============================================================================
// D1 — Tumor Sequencing Pipeline: Biopsy → Report (9 stages)
// Stepper demystifying the sequencing process
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawDNA, drawMolecule, drawArrow, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawBadge } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const STAGES = [
  { label: '1. Tumor biopsy', caption: 'A small piece of tumor tissue is collected by a surgeon or radiologist using a needle biopsy.' },
  { label: '2. DNA extraction', caption: 'DNA is isolated from the tumor cells, separating it from proteins and other cell components.' },
  { label: '3. Fragmentation', caption: 'The long DNA strands are cut into small fragments (~200-300 base pairs) for sequencing.' },
  { label: '4. Library preparation', caption: 'Adapters are attached to each fragment so the sequencing machine can read them. This is the "library."' },
  { label: '5. Sequencing', caption: 'Fluorescent bases are added one at a time. Each glows a different color: A, T, C, G. The machine reads millions in parallel.' },
  { label: '6. Raw data', caption: 'The sequencer outputs millions of short "reads" — raw text files of A, T, C, G sequences.' },
  { label: '7. Alignment', caption: 'Each read is matched to its position in the human reference genome — like fitting puzzle pieces.' },
  { label: '8. Variant calling', caption: 'Software compares tumor DNA to normal DNA and identifies mutations — the variants that drive the cancer.' },
  { label: '9. Clinical report', caption: 'Results are compiled into a report: actionable mutations, potential drug targets, and clinical trial eligibility.' },
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

    // ---- Stage-specific visuals ----
    if (stage === 0) {
      // Biopsy needle + tissue
      ctx.beginPath();
      ctx.roundRect(cx - 40, cy - 30, 80, 60, 8);
      ctx.fillStyle = 'rgba(200,160,140,0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,160,140,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      drawText(ctx, 'Tumor tissue', cx, cy + 40, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
      // Needle
      ctx.strokeStyle = 'rgba(200,200,200,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 50, cy - 50);
      ctx.lineTo(cx + 10, cy - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy - 10);
      ctx.lineTo(cx + 6, cy - 6);
      ctx.lineWidth = 1;
      ctx.stroke();
      // Cancer cells
      for (let i = 0; i < 5; i++) {
        const px = cx - 25 + (i % 3) * 25;
        const py = cy - 15 + Math.floor(i / 3) * 25;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = PALETTE.cancer.fill;
        ctx.fill();
        ctx.strokeStyle = PALETTE.cancer.edge;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    if (stage === 1) {
      // DNA extraction
      drawDNA(ctx, cx - 60, cy, 120, PALETTE.dna.fill, false, time);
      drawGlow(ctx, cx, cy, 50, 'rgba(100,180,255,0.15)', 0.4, time);
      drawText(ctx, 'Isolated DNA', cx, cy + 30, {
        fontSize: 11, color: PALETTE.dna.fill, align: 'center',
      });
    }

    if (stage === 2) {
      // Fragmented DNA
      const fragCount = 6;
      for (let i = 0; i < fragCount; i++) {
        const fx = cx - 80 + (i % 3) * 55;
        const fy = cy - 20 + Math.floor(i / 3) * 35;
        drawDNA(ctx, fx, fy, 40, PALETTE.dna.fill, false, time + i);
      }
      drawText(ctx, '~200-300bp fragments', cx, cy + 50, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 3) {
      // Library prep: fragments with adapters
      for (let i = 0; i < 4; i++) {
        const fx = cx - 60 + (i % 2) * 60;
        const fy = cy - 15 + Math.floor(i / 2) * 35;
        // Adapter (colored ends)
        drawMolecule(ctx, fx - 5, fy, 4, 'rgba(255,160,80,0.6)', 'diamond');
        drawDNA(ctx, fx, fy, 35, PALETTE.dna.fill, false, time + i);
        drawMolecule(ctx, fx + 40, fy, 4, 'rgba(255,160,80,0.6)', 'diamond');
      }
      drawText(ctx, 'Adapters attached', cx, cy + 50, {
        fontSize: 11, color: 'rgba(255,160,80,0.7)', align: 'center',
      });
    }

    if (stage === 4) {
      // Sequencing: fluorescent bases
      const bases = ['A', 'T', 'C', 'G'];
      const colors = ['rgba(80,200,100,0.7)', 'rgba(255,100,80,0.7)', 'rgba(100,160,255,0.7)', 'rgba(255,200,60,0.7)'];
      const seqLen = 16;
      for (let i = 0; i < seqLen; i++) {
        const bx = cx - 100 + i * 13;
        const by = cy;
        const bi = (i + Math.floor(time * 3)) % 4;
        const flash = i === Math.floor(time * 3) % seqLen;
        ctx.beginPath();
        ctx.arc(bx, by, flash ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = colors[bi];
        ctx.fill();
        if (flash) {
          drawGlow(ctx, bx, by, 12, colors[bi], 0.5, time);
        }
        drawText(ctx, bases[bi], bx, by + 14, {
          fontSize: 8, color: colors[bi], align: 'center',
        });
      }
      drawText(ctx, 'Reading bases in parallel', cx, cy + 40, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 5) {
      // Raw data output
      const reads = ['ATCGATCGATCG...', 'GCTAGCTAGCTA...', 'TTAACCGGTTAA...', 'AAGCTTAAGCTT...', 'CCGGAATTCCGG...'];
      for (let i = 0; i < reads.length; i++) {
        const ry = cy - 40 + i * 20;
        drawText(ctx, reads[i], cx, ry, {
          fontSize: 11, color: i < 2 ? PALETTE.text.accent : PALETTE.text.tertiary, align: 'center',
          fontFamily: 'monospace',
        });
      }
      drawText(ctx, 'Millions of reads', cx, cy + 55, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 6) {
      // Alignment: reads mapped to reference
      // Reference genome bar
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(cx - 120, cy - 5, 240, 10);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 120, cy - 5, 240, 10);
      drawText(ctx, 'Reference genome', cx, cy - 15, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });

      // Aligned reads below
      for (let i = 0; i < 5; i++) {
        const rx = cx - 100 + (i * 18) + Math.sin(i * 2.3) * 30;
        const ry = cy + 15 + i * 10;
        const rw = 40 + Math.sin(i * 1.7) * 15;
        ctx.fillStyle = PALETTE.drug.fill;
        ctx.fillRect(rx, ry, rw, 4);
        // Arrow to reference
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.moveTo(rx + rw / 2, ry);
        ctx.lineTo(rx + rw / 2, cy + 5);
        ctx.stroke();
      }
    }

    if (stage === 7) {
      // Variant calling
      // Reference vs tumor
      const refY = cy - 20;
      const tumY = cy + 15;
      drawText(ctx, 'Normal:', cx - 90, refY, {
        fontSize: 10, color: PALETTE.text.tertiary,
      });
      drawText(ctx, '...ATCGATCGATCG...', cx, refY, {
        fontSize: 12, color: PALETTE.text.secondary, align: 'center',
        fontFamily: 'monospace',
      });
      drawText(ctx, 'Tumor:', cx - 90, tumY, {
        fontSize: 10, color: PALETTE.cancer.label,
      });
      drawText(ctx, '...ATCG', cx - 30, tumY, {
        fontSize: 12, color: PALETTE.text.secondary,
        fontFamily: 'monospace',
      });
      drawText(ctx, 'T', cx + 22, tumY, {
        fontSize: 12, fontWeight: 'bold', color: 'rgba(255,80,60,0.9)',
        fontFamily: 'monospace',
      });
      drawText(ctx, 'TCGATCG...', cx + 32, tumY, {
        fontSize: 12, color: PALETTE.text.secondary,
        fontFamily: 'monospace',
      });

      // Highlight the mutation
      drawGlow(ctx, cx + 22, tumY, 12, 'rgba(255,80,60,0.3)', 0.5, time);
      drawText(ctx, 'Mutation detected', cx, tumY + 25, {
        fontSize: 11, fontWeight: '600', color: 'rgba(255,80,60,0.8)', align: 'center',
      });
    }

    if (stage === 8) {
      // Clinical report
      const repX = cx - 80;
      let repY = cy - 60;
      const repW = 160;

      ctx.beginPath();
      ctx.roundRect(repX - 10, repY - 10, repW + 20, 130, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawText(ctx, 'GENOMIC REPORT', cx, repY, {
        fontSize: 12, fontWeight: '600', color: PALETTE.text.primary, align: 'center',
      });
      repY += 22;

      const findings = [
        { gene: 'PIK3CA H1047R', badge: 'Actionable' },
        { gene: 'TP53 R273H', badge: 'Pathogenic' },
        { gene: 'BRCA2 wild-type', badge: 'Normal' },
      ];
      for (const f of findings) {
        drawText(ctx, f.gene, repX, repY, {
          fontSize: 11, color: PALETTE.text.secondary, baseline: 'top',
          fontFamily: 'monospace',
        });
        const bgColor = f.badge === 'Actionable' ? 'rgba(80,200,140,0.2)' : f.badge === 'Pathogenic' ? 'rgba(255,160,80,0.2)' : 'rgba(255,255,255,0.08)';
        const fgColor = f.badge === 'Actionable' ? 'rgba(80,200,140,0.9)' : f.badge === 'Pathogenic' ? 'rgba(255,160,80,0.9)' : PALETTE.text.tertiary;
        drawBadge(ctx, f.badge, repX + repW - 60, repY - 2, bgColor, fgColor, 9);
        repY += 22;
      }

      repY += 8;
      drawText(ctx, 'Matching trials: 4 found', cx, repY, {
        fontSize: 11, color: PALETTE.text.accent, align: 'center', baseline: 'top',
      });
    }

    // ---- Controls ----
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
