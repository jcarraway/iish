// ============================================================================
// P1 — Neoantigen Pipeline: From FASTQ to Vaccine Design (9 stages)
// Stepper mapping to the platform's Phase 3 pipeline
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawDNA, drawMolecule, drawArrow, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawBadge } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const STAGES = [
  { label: '1. Raw sequences (FASTQ)', caption: 'Sequencing produces millions of short reads — raw text files encoding the As, Ts, Cs, and Gs of your tumor DNA.' },
  { label: '2. Alignment', caption: 'Each short read is mapped to its position on the human reference genome using BWA-MEM or similar aligner.' },
  { label: '3. Variant calling', caption: 'Somatic variants (mutations only in tumor, not in normal tissue) are identified by tools like Mutect2.' },
  { label: '4. HLA typing', caption: 'Your specific HLA alleles are determined. HLA defines which peptides your immune system can "see."' },
  { label: '5. Peptide generation', caption: 'Each somatic mutation generates candidate neopeptides — short amino acid sequences (8-11 residues) spanning the mutation.' },
  { label: '6. Binding prediction', caption: 'NetMHCpan predicts how strongly each neopeptide binds to your specific HLA alleles. Strong binders are more immunogenic.' },
  { label: '7. Ranking', caption: 'Candidates are ranked by binding affinity, expression level, variant allele frequency, and clonality. Top 20 are selected.' },
  { label: '8. Vaccine design', caption: 'Selected neoantigens are encoded into an mRNA construct with optimized codons and delivery sequence.' },
  { label: '9. Report', caption: 'A comprehensive report shows selected neoantigens, binding predictions, and the vaccine construct — ready for manufacturing.' },
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

  function render() {
    const { w, h, time, stage } = state;
    const cx = w * 0.5;
    const cy = h * 0.38;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    if (stage === 0) {
      // FASTQ data scrolling
      const lines = ['@SEQ_001 length=150', 'ATCGATCGATCGATCGATCG...', '+', '!!!!!!!!!IIIIIIIII...'];
      for (let i = 0; i < lines.length; i++) {
        drawText(ctx, lines[i], cx, cy - 30 + i * 18, {
          fontSize: 11, color: i === 0 ? PALETTE.text.accent : PALETTE.text.tertiary,
          align: 'center', fontFamily: 'monospace',
        });
      }
      drawText(ctx, 'Millions of reads', cx, cy + 50, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 1) {
      // Reference bar + mapped reads
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(cx - 120, cy - 3, 240, 6);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 120, cy - 3, 240, 6);
      drawText(ctx, 'Reference genome', cx, cy - 15, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });

      for (let i = 0; i < 6; i++) {
        const rx = cx - 100 + i * 25 + Math.sin(i * 1.7) * 20;
        const ry = cy + 10 + i * 8;
        ctx.fillStyle = 'rgba(100,170,255,0.3)';
        ctx.fillRect(rx, ry, 35 + Math.sin(i) * 10, 3);
      }
    }

    if (stage === 2) {
      // Variant calling — normal vs tumor comparison
      drawText(ctx, 'Normal: ...ATCGATCGATCG...', cx, cy - 15, {
        fontSize: 11, color: PALETTE.text.secondary, align: 'center', fontFamily: 'monospace',
      });
      drawText(ctx, 'Tumor:  ...ATCG', cx - 30, cy + 10, {
        fontSize: 11, color: PALETTE.text.secondary, fontFamily: 'monospace',
      });
      drawText(ctx, 'T', cx + 24, cy + 10, {
        fontSize: 11, fontWeight: 'bold', color: 'rgba(255,80,60,0.9)', fontFamily: 'monospace',
      });
      drawText(ctx, 'TCGATCG...', cx + 34, cy + 10, {
        fontSize: 11, color: PALETTE.text.secondary, fontFamily: 'monospace',
      });
      drawGlow(ctx, cx + 24, cy + 10, 12, 'rgba(255,80,60,0.3)', 0.5, time);
      drawText(ctx, 'Somatic mutation identified', cx, cy + 40, {
        fontSize: 11, color: 'rgba(255,80,60,0.7)', align: 'center',
      });
    }

    if (stage === 3) {
      // HLA typing
      const hlaTypes = ['HLA-A*02:01', 'HLA-A*03:01', 'HLA-B*07:02', 'HLA-B*44:03', 'HLA-C*07:01', 'HLA-C*16:01'];
      for (let i = 0; i < hlaTypes.length; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const hx = cx - 60 + col * 120;
        const hy = cy - 25 + row * 22;
        drawBadge(ctx, hlaTypes[i], hx - 40, hy, 'rgba(140,130,230,0.15)', 'rgba(140,130,230,0.8)', 10);
      }
      drawText(ctx, 'Your unique immune fingerprint', cx, cy + 50, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 4) {
      // Peptide generation
      const peptides = ['YLQLVFGI', 'KQMVDLFL', 'SIINFEKL', 'ALWGPDPA'];
      for (let i = 0; i < peptides.length; i++) {
        const py = cy - 25 + i * 20;
        const highlight = i === 0;
        drawText(ctx, peptides[i], cx, py, {
          fontSize: 12, color: highlight ? PALETTE.text.accent : PALETTE.text.secondary,
          align: 'center', fontFamily: 'monospace',
        });
        if (highlight) {
          // Highlight mutation position
          drawGlow(ctx, cx + 15, py, 10, 'rgba(255,80,60,0.2)', 0.4, time);
        }
      }
      drawText(ctx, '8-11 amino acids spanning each mutation', cx, cy + 50, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 5) {
      // Binding prediction — MHC groove with peptide
      // MHC groove (simplified)
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy + 15);
      ctx.quadraticCurveTo(cx - 35, cy - 15, cx - 15, cy - 15);
      ctx.lineTo(cx + 15, cy - 15);
      ctx.quadraticCurveTo(cx + 35, cy - 15, cx + 35, cy + 15);
      ctx.strokeStyle = 'rgba(140,130,230,0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();
      drawText(ctx, 'MHC groove', cx, cy + 30, {
        fontSize: 10, color: 'rgba(140,130,230,0.6)', align: 'center',
      });

      // Peptide fitting in
      for (let i = 0; i < 8; i++) {
        const px = cx - 28 + i * 8;
        drawMolecule(ctx, px, cy, 3, PALETTE.drug.fill, 'circle');
      }
      drawGlow(ctx, cx, cy, 30, 'rgba(100,170,255,0.1)', 0.3, time);
      drawText(ctx, 'IC50 = 15 nM (strong binder)', cx, cy + 45, {
        fontSize: 10, color: 'rgba(80,200,140,0.7)', align: 'center',
      });
    }

    if (stage === 6) {
      // Ranking — bar chart
      const candidates = [
        { name: 'NEO-001', score: 0.95 },
        { name: 'NEO-002', score: 0.88 },
        { name: 'NEO-003', score: 0.82 },
        { name: 'NEO-004', score: 0.71 },
        { name: 'NEO-005', score: 0.65 },
        { name: '...', score: 0 },
      ];
      const barX = cx - 80;
      const barMaxW = 120;
      for (let i = 0; i < candidates.length; i++) {
        const by = cy - 40 + i * 18;
        if (candidates[i].name === '...') {
          drawText(ctx, '...15 more', barX, by + 4, {
            fontSize: 10, color: PALETTE.text.tertiary,
          });
          continue;
        }
        drawText(ctx, candidates[i].name, barX - 5, by + 4, {
          fontSize: 9, color: PALETTE.text.secondary, align: 'right',
        });
        const bw = candidates[i].score * barMaxW;
        const green = i < 3;
        ctx.fillStyle = green ? 'rgba(80,200,140,0.3)' : 'rgba(255,200,80,0.2)';
        ctx.fillRect(barX, by, bw, 12);
        drawText(ctx, candidates[i].score.toFixed(2), barX + bw + 5, by + 6, {
          fontSize: 9, color: green ? 'rgba(80,200,140,0.8)' : PALETTE.text.tertiary,
        });
      }
      drawText(ctx, 'Top 20 selected', cx, cy + 55, {
        fontSize: 11, color: PALETTE.text.accent, align: 'center',
      });
    }

    if (stage === 7) {
      // mRNA construct
      drawDNA(ctx, cx - 80, cy, 160, 'rgba(100,200,160,0.5)', false, time);
      // Labeled regions
      const regions = [
        { x: cx - 60, label: "5'UTR", color: 'rgba(200,200,200,0.4)' },
        { x: cx - 20, label: 'NEO-1', color: 'rgba(100,170,255,0.5)' },
        { x: cx + 10, label: 'NEO-2', color: 'rgba(100,170,255,0.5)' },
        { x: cx + 40, label: 'NEO-3', color: 'rgba(100,170,255,0.5)' },
        { x: cx + 70, label: "3'UTR", color: 'rgba(200,200,200,0.4)' },
      ];
      for (const r of regions) {
        drawText(ctx, r.label, r.x, cy - 20, {
          fontSize: 8, color: r.color, align: 'center',
        });
        ctx.fillStyle = r.color;
        ctx.fillRect(r.x - 10, cy + 12, 20, 2);
      }
      drawText(ctx, 'mRNA vaccine construct', cx, cy + 35, {
        fontSize: 11, color: 'rgba(100,200,160,0.7)', align: 'center',
      });
    }

    if (stage === 8) {
      // Report summary
      const rX = cx - 80;
      let rY = cy - 55;
      ctx.beginPath();
      ctx.roundRect(rX - 10, rY - 10, 180, 120, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawText(ctx, 'NEOANTIGEN REPORT', cx, rY, {
        fontSize: 12, fontWeight: '600', color: PALETTE.text.primary, align: 'center',
      });
      rY += 22;
      drawText(ctx, 'Somatic variants: 847', rX, rY, {
        fontSize: 10, color: PALETTE.text.secondary, baseline: 'top',
      });
      rY += 16;
      drawText(ctx, 'Candidate peptides: 2,341', rX, rY, {
        fontSize: 10, color: PALETTE.text.secondary, baseline: 'top',
      });
      rY += 16;
      drawText(ctx, 'Strong binders: 156', rX, rY, {
        fontSize: 10, color: PALETTE.text.secondary, baseline: 'top',
      });
      rY += 16;
      drawBadge(ctx, '20 neoantigens selected', rX, rY, 'rgba(80,200,140,0.15)', 'rgba(80,200,140,0.9)', 10);
      rY += 22;
      drawBadge(ctx, 'Ready for manufacturing', rX, rY, 'rgba(100,170,255,0.15)', 'rgba(100,170,255,0.9)', 10);
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
