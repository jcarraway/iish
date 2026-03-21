// ============================================================================
// P3 — mRNA Translation: Ribosome Reads mRNA to Produce Protein
// Stepper, 12 stages — from mRNA entry to protein folding
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
  { label: '1. mRNA enters cell', caption: 'The lipid nanoparticle fuses with the cell membrane, releasing mRNA into the cytoplasm.' },
  { label: '2. Ribosome finds mRNA', caption: 'The small ribosomal subunit scans the mRNA looking for the start codon (AUG).' },
  { label: '3. Start codon (AUG)', caption: 'The ribosome locks onto AUG — the universal start signal. Translation begins here.' },
  { label: '4. tRNA brings amino acid', caption: 'Transfer RNA (tRNA) carries the matching amino acid. Its anticodon pairs with the mRNA codon.' },
  { label: '5. Codon matching', caption: 'Each 3-letter codon specifies one amino acid. UUU=Phe, GCU=Ala, etc. The genetic code is universal.' },
  { label: '6. Peptide bond forms', caption: 'The ribosome catalyzes a peptide bond between amino acids. The growing chain extends one residue.' },
  { label: '7. Elongation', caption: 'The ribosome slides along the mRNA, reading codons and adding amino acids. ~20 amino acids per second.' },
  { label: '8. Growing chain', caption: 'The polypeptide chain emerges from the ribosome, beginning to fold into its 3D structure.' },
  { label: '9. Stop codon', caption: 'The ribosome reaches a stop codon (UAA, UAG, or UGA). Release factors trigger chain release.' },
  { label: '10. Protein folds', caption: 'The released polypeptide folds into its functional 3D shape, guided by chaperone proteins.' },
  { label: '11. Neoantigen ready', caption: 'The folded neoantigen protein is processed and presented on the cell surface via MHC.' },
  { label: '12. Codon optimization', caption: 'Vaccine mRNA uses optimized codons — same protein, but codons chosen for maximal translation efficiency.' },
];

const CODONS = ['AUG', 'GCU', 'UUU', 'GAC', 'AAG', 'CUG', 'UAC', 'GGU'];
const AMINO_ACIDS = ['Met', 'Ala', 'Phe', 'Asp', 'Lys', 'Leu', 'Tyr', 'Gly'];
const AA_COLORS = [
  'rgba(100,200,160,0.6)', 'rgba(100,170,255,0.6)', 'rgba(255,180,80,0.6)',
  'rgba(200,140,255,0.6)', 'rgba(255,140,100,0.6)', 'rgba(140,200,100,0.6)',
  'rgba(200,170,100,0.6)', 'rgba(160,160,200,0.6)',
];

interface State {
  stage: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
  chainLength: number;
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
    particles: createParticleSystem(30, { width, height }),
    stepperAreas: [],
    chainLength: 0,
  };

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, STAGES.length - 1);
    if (idx <= 2) state.chainLength = 0;
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);

    // Grow chain during elongation stages
    if (state.stage >= 6 && state.stage <= 8) {
      state.chainLength = clamp(state.chainLength + dt * 2, 0, CODONS.length);
    } else if (state.stage >= 3 && state.stage <= 5) {
      state.chainLength = clamp(state.chainLength + dt, 0, 2);
    }

    render();
  }

  function drawMRNA(x: number, y: number, length: number) {
    // mRNA strand
    ctx.strokeStyle = 'rgba(100,200,160,0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();

    // Codon markers
    const codonW = length / CODONS.length;
    for (let i = 0; i < CODONS.length; i++) {
      const cx = x + i * codonW + codonW / 2;
      drawText(ctx, CODONS[i], cx, y + 12, {
        fontSize: 8, color: PALETTE.text.tertiary, align: 'center',
        fontFamily: 'monospace',
      });
    }
  }

  function drawRibosome(x: number, y: number, size: number) {
    // Large subunit
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.15, size * 0.5, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,180,140,0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,180,140,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Small subunit
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.2, size * 0.35, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,180,140,0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,180,140,0.25)';
    ctx.stroke();
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
      // LNP releasing mRNA
      const lnpX = cx - 30;
      ctx.beginPath();
      ctx.arc(lnpX, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.lnp.fill;
      ctx.fill();
      ctx.strokeStyle = PALETTE.lnp.edge;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      drawText(ctx, 'LNP', lnpX, cy, { fontSize: 9, color: PALETTE.text.primary, align: 'center' });

      // mRNA emerging
      ctx.strokeStyle = 'rgba(100,200,160,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lnpX + 20, cy);
      for (let i = 0; i < 8; i++) {
        ctx.lineTo(lnpX + 25 + i * 10, cy + Math.sin(i + time * 3) * 3);
      }
      ctx.stroke();

      drawText(ctx, 'mRNA released into cytoplasm', cx, cy + 40, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 1) {
      // mRNA + ribosome scanning
      drawMRNA(cx - 100, cy, 200);
      const scanX = cx - 80 + ((time * 30) % 180);
      drawRibosome(scanX, cy - 15, 25);
      drawArrow(ctx, { x: scanX + 15, y: cy - 15 }, { x: scanX + 30, y: cy - 15 }, PALETTE.text.tertiary, 1, 4);
      drawText(ctx, 'Scanning for AUG...', scanX, cy - 35, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 2) {
      // Locked on AUG
      drawMRNA(cx - 100, cy, 200);
      const augX = cx - 100 + 200 / CODONS.length / 2;
      drawRibosome(augX, cy - 15, 25);
      drawGlow(ctx, augX, cy, 20, 'rgba(100,200,160,0.2)', 0.5, time);
      drawText(ctx, 'AUG = START', augX, cy - 38, {
        fontSize: 10, fontWeight: '600', color: 'rgba(100,200,160,0.8)', align: 'center',
      });
    }

    if (stage >= 3 && stage <= 4) {
      // tRNA + codon matching
      drawMRNA(cx - 100, cy + 10, 200);
      const codonIdx = 1;
      const codonW = 200 / CODONS.length;
      const codonX = cx - 100 + codonIdx * codonW + codonW / 2;

      drawRibosome(codonX, cy - 5, 28);

      // tRNA (inverted T shape)
      const trnaX = codonX + (stage === 3 ? 30 : 0);
      const trnaY = cy - 35;
      ctx.strokeStyle = AA_COLORS[codonIdx];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trnaX, trnaY - 15);
      ctx.lineTo(trnaX, trnaY + 5);
      ctx.lineTo(trnaX - 8, trnaY + 15);
      ctx.moveTo(trnaX, trnaY + 5);
      ctx.lineTo(trnaX + 8, trnaY + 15);
      ctx.stroke();

      // Amino acid on top
      drawMolecule(ctx, trnaX, trnaY - 20, 5, AA_COLORS[codonIdx], 'circle');
      drawText(ctx, AMINO_ACIDS[codonIdx], trnaX + 10, trnaY - 20, {
        fontSize: 9, color: AA_COLORS[codonIdx],
      });

      if (stage === 4) {
        // Anticodon label
        drawText(ctx, 'Anticodon matches codon', codonX, cy + 35, {
          fontSize: 10, color: PALETTE.text.accent, align: 'center',
        });
      }
    }

    if (stage === 5) {
      // Peptide bond forming
      drawMRNA(cx - 100, cy + 10, 200);
      const ribX = cx - 70;
      drawRibosome(ribX, cy - 5, 28);

      // Two amino acids bonding
      drawMolecule(ctx, ribX - 8, cy - 30, 5, AA_COLORS[0], 'circle');
      drawMolecule(ctx, ribX + 8, cy - 30, 5, AA_COLORS[1], 'circle');
      // Bond line
      ctx.strokeStyle = 'rgba(255,200,80,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ribX - 3, cy - 30);
      ctx.lineTo(ribX + 3, cy - 30);
      ctx.stroke();
      drawGlow(ctx, ribX, cy - 30, 12, 'rgba(255,200,80,0.2)', 0.5, time);

      drawText(ctx, 'Peptide bond', ribX, cy - 45, {
        fontSize: 10, color: 'rgba(255,200,80,0.7)', align: 'center',
      });
    }

    if (stage >= 6 && stage <= 7) {
      // Elongation — chain growing
      drawMRNA(cx - 100, cy + 10, 200);
      const progress = Math.floor(state.chainLength);
      const codonW = 200 / CODONS.length;
      const ribX = cx - 100 + clamp(progress + 1, 1, CODONS.length - 1) * codonW;
      drawRibosome(ribX, cy - 5, 28);

      // Growing peptide chain
      for (let i = 0; i <= Math.min(progress, CODONS.length - 1); i++) {
        const ax = ribX - 10 - i * 8;
        const ay = cy - 35 + Math.sin(i * 0.8) * 4;
        drawMolecule(ctx, ax, ay, 4, AA_COLORS[i % AA_COLORS.length], 'circle');
        if (i > 0) {
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ax + 4, ay);
          ctx.lineTo(ax + 12, ay - Math.sin((i - 1) * 0.8) * 4 + Math.sin(i * 0.8) * 4);
          ctx.stroke();
        }
      }

      drawText(ctx, `~20 amino acids/second`, cx, cy + 40, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 8) {
      // Growing chain emerging
      drawMRNA(cx - 100, cy + 10, 200);
      drawRibosome(cx + 20, cy - 5, 28);

      // Long chain
      for (let i = 0; i < 10; i++) {
        const ax = cx + 10 - i * 8;
        const ay = cy - 35 + Math.sin(i * 0.6 + time) * 5;
        drawMolecule(ctx, ax, ay, 3.5, AA_COLORS[i % AA_COLORS.length], 'circle');
      }

      drawText(ctx, 'Polypeptide chain emerging', cx, cy + 40, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    if (stage === 9) {
      // Stop codon
      drawMRNA(cx - 100, cy + 10, 200);
      const stopX = cx + 90;
      drawRibosome(stopX, cy - 5, 28);
      drawGlow(ctx, stopX, cy + 10, 15, 'rgba(255,80,60,0.2)', 0.5, time);
      drawText(ctx, 'STOP', stopX, cy + 30, {
        fontSize: 11, fontWeight: '600', color: 'rgba(255,80,60,0.7)', align: 'center',
      });

      // Released chain
      for (let i = 0; i < 8; i++) {
        const ax = stopX - 15 - i * 6;
        const ay = cy - 40 - i * 3 + Math.sin(i + time) * 3;
        drawMolecule(ctx, ax, ay, 3, AA_COLORS[i % AA_COLORS.length], 'circle');
      }
    }

    if (stage === 10) {
      // Protein folding
      const foldR = 22;
      // Folded globular shape
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const wobble = Math.sin(i * 2.3 + time * 0.5) * 4;
        const r = foldR + wobble;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(100,200,160,0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(100,200,160,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      drawGlow(ctx, cx, cy, foldR * 2, 'rgba(100,200,160,0.1)', 0.3, time);
      drawText(ctx, 'Neoantigen protein', cx, cy + 35, {
        fontSize: 12, fontWeight: '600', color: 'rgba(100,200,160,0.8)', align: 'center',
      });
    }

    if (stage === 11) {
      // Codon optimization comparison
      const leftX = w * 0.25;
      const rightX = w * 0.75;

      drawText(ctx, 'Natural codons', leftX, cy - 40, {
        fontSize: 12, fontWeight: '600', color: PALETTE.text.secondary, align: 'center',
      });
      drawText(ctx, 'Optimized codons', rightX, cy - 40, {
        fontSize: 12, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
      });

      // Bars
      const naturalRate = 0.4;
      const optimizedRate = 0.9;
      const barW = 80;
      const barH = 14;

      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(leftX - barW / 2, cy, barW, barH);
      ctx.fillStyle = 'rgba(255,200,80,0.3)';
      ctx.fillRect(leftX - barW / 2, cy, barW * naturalRate, barH);

      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(rightX - barW / 2, cy, barW, barH);
      ctx.fillStyle = 'rgba(80,200,140,0.4)';
      ctx.fillRect(rightX - barW / 2, cy, barW * optimizedRate, barH);

      drawText(ctx, 'Translation efficiency', leftX, cy - 15, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
      drawText(ctx, 'Translation efficiency', rightX, cy - 15, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
      drawText(ctx, '40%', leftX, cy + 30, {
        fontSize: 11, color: 'rgba(255,200,80,0.7)', align: 'center',
      });
      drawText(ctx, '90%', rightX, cy + 30, {
        fontSize: 11, color: 'rgba(80,200,140,0.8)', align: 'center',
      });

      drawText(ctx, 'Same protein, different codons', cx, cy + 55, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });
    }

    // Controls
    const controlY = h - 45;
    state.stepperAreas = drawStepperDots(ctx, stage, STAGES.length, w / 2, controlY, 3.5, 12);
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
