// ============================================================================
// T10 — mRNA Cancer Vaccine: 8-Stage Stepper — Flagship Visualization
// Biopsy → Sequencing → Prediction → mRNA → LNP → Injection → Translation → Killing
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawDNA, drawGlow, drawMolecule, drawReceptor, drawAntibody,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest, drawArrow,
  lerp, clamp, easeOut, getAnimationSpeed,
} from '../framework';
import { drawText, drawBadge } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const STAGES = [
  { label: '1. Tumor biopsy', caption: 'A tissue sample is taken from the tumor. DNA is extracted for analysis.' },
  { label: '2. Genome sequencing', caption: 'The tumor DNA is sequenced to identify mutations unique to this cancer.' },
  { label: '3. Neoantigen prediction', caption: 'AI algorithms predict which mutations will create the best immune targets.' },
  { label: '4. mRNA design', caption: 'Synthetic mRNA is designed encoding the selected neoantigens with optimized codons.' },
  { label: '5. LNP encapsulation', caption: 'The mRNA is wrapped in lipid nanoparticles — tiny fat bubbles that protect it and help delivery.' },
  { label: '6. Vaccine injection', caption: 'The LNP-encapsulated mRNA vaccine is injected into muscle tissue.' },
  { label: '7. Protein production', caption: 'Ribosomes in muscle cells read the mRNA and produce neoantigen proteins on the cell surface.' },
  { label: '8. Immune response', caption: 'Trained T-cells recognize the neoantigens and hunt down cancer cells displaying the same markers.' },
];

interface State {
  stage: number;
  stageProgress: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
  centerX: number;
  centerY: number;
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
    centerX: width / 2,
    centerY: height * 0.4,
  };

  function layout() {
    state.centerX = state.w / 2;
    state.centerY = state.h * 0.4;
  }
  layout();

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, STAGES.length - 1);
    state.stageProgress = 0;
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    state.stageProgress = clamp(state.stageProgress + dt * 0.2, 0, 1);
    updateParticles(state.particles, dt * speed);
    render();
  }

  function render() {
    const { w, h, time, stage, stageProgress, centerX, centerY } = state;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    const unit = Math.min(w, h) * 0.08;

    // ---- Stage-specific rendering ----
    switch (stage) {
      case 0: renderBiopsy(unit); break;
      case 1: renderSequencing(unit); break;
      case 2: renderPrediction(unit); break;
      case 3: renderMRNADesign(unit); break;
      case 4: renderLNP(unit); break;
      case 5: renderInjection(unit); break;
      case 6: renderTranslation(unit); break;
      case 7: renderKilling(unit); break;
    }

    // ---- Flow dots connecting stages ----
    const flowY = state.h * 0.08;
    const flowStartX = w * 0.08;
    const flowEndX = w * 0.92;
    const flowW = flowEndX - flowStartX;

    for (let i = 0; i < STAGES.length; i++) {
      const fx = flowStartX + (i / (STAGES.length - 1)) * flowW;
      const isActive = i === stage;
      const isPast = i < stage;

      ctx.beginPath();
      ctx.arc(fx, flowY, isActive ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? PALETTE.text.accent
        : isPast ? 'rgba(110,180,255,0.4)'
        : 'rgba(255,255,255,0.15)';
      ctx.fill();

      // Connecting line
      if (i < STAGES.length - 1) {
        const nextX = flowStartX + ((i + 1) / (STAGES.length - 1)) * flowW;
        ctx.strokeStyle = isPast ? 'rgba(110,180,255,0.2)' : 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fx + 5, flowY);
        ctx.lineTo(nextX - 5, flowY);
        ctx.stroke();
      }
    }

    // ---- Controls ----
    const controlY = h - 45;
    state.stepperAreas = drawStepperDots(ctx, stage, STAGES.length, w / 2, controlY);
    drawPhaseLabel(ctx, STAGES[stage].label, w / 2, controlY - 28);
    drawCaption(ctx, STAGES[stage].caption, w / 2, controlY + 16, w * 0.75);
  }

  // ==== Per-stage render functions ====

  function renderBiopsy(u: number) {
    const { centerX: cx, centerY: cy, time: t, stageProgress: p } = state;

    // Tumor mass
    drawCell(ctx, cx, cy, u * 1.5, {
      fill: PALETTE.cancer.fill,
      edge: PALETTE.cancer.edge,
      glow: PALETTE.cancer.glow,
    }, t, 4);
    drawNucleus(ctx, cx, cy, u * 0.5, PALETTE.cancer.accent);

    // Neoantigens on surface
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      drawReceptor(ctx, cx + Math.cos(angle) * (u * 1.5 + 3), cy + Math.sin(angle) * (u * 1.5 + 3),
        angle + Math.PI / 2, PALETTE.protein.mutant, 'diamond', 7);
    }

    // Biopsy needle animation
    const needleProgress = easeOut(clamp(p * 2, 0, 1));
    const needleX = cx + u * 2.5 - needleProgress * u * 1.5;
    const needleY = cy - u * 1.5 + needleProgress * u * 1;

    ctx.strokeStyle = 'rgba(200,200,200,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(needleX + u * 1.5, needleY - u);
    ctx.lineTo(needleX, needleY);
    ctx.stroke();

    // Needle tip
    ctx.beginPath();
    ctx.arc(needleX, needleY, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,200,200,0.7)';
    ctx.fill();

    // DNA extraction hint
    if (p > 0.5) {
      const extractAlpha = clamp((p - 0.5) * 2, 0, 0.8);
      ctx.globalAlpha = extractAlpha;
      drawDNA(ctx, cx - u * 0.6, cy + u * 2.2, u * 1.2, PALETTE.dna.fill, false, t);
      drawText(ctx, 'DNA extracted', cx, cy + u * 2.8, {
        fontSize: 11, color: PALETTE.text.accent, align: 'center',
      });
      ctx.globalAlpha = 1;
    }

    drawText(ctx, 'Tumor', cx, cy + u * 1.5 + 16, {
      fontSize: 11, color: PALETTE.cancer.label, align: 'center',
    });
  }

  function renderSequencing(u: number) {
    const { centerX: cx, centerY: cy, time: t, stageProgress: p } = state;

    // DNA double helix
    drawDNA(ctx, cx - u * 2, cy - u * 0.5, u * 4, PALETTE.dna.fill, false, t);

    // Scanning line
    const scanX = cx - u * 2 + p * u * 4;
    ctx.strokeStyle = 'rgba(110,180,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scanX, cy - u * 1.5);
    ctx.lineTo(scanX, cy + u * 1.5);
    ctx.stroke();
    drawGlow(ctx, scanX, cy, u, 'rgba(110,180,255,0.15)', 0.3, t);

    // Mutation markers
    const mutations = [0.2, 0.45, 0.72];
    for (const pos of mutations) {
      if (p > pos) {
        const mx = cx - u * 2 + pos * u * 4;
        const alpha = clamp((p - pos) * 4, 0, 1);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(mx, cy + u * 0.3, 4, 0, Math.PI * 2);
        ctx.fillStyle = PALETTE.protein.mutant;
        ctx.fill();
        drawText(ctx, 'MUT', mx, cy + u * 0.3 + 12, {
          fontSize: 8, color: PALETTE.protein.mutant, align: 'center',
        });
        ctx.globalAlpha = 1;
      }
    }

    // Sequence readout
    if (p > 0.3) {
      const readAlpha = clamp((p - 0.3) * 2, 0, 0.7);
      ctx.globalAlpha = readAlpha;
      const bases = 'ATCGATCGTTACGATCGAATCG';
      for (let i = 0; i < bases.length; i++) {
        const bx = cx - u * 2 + (i / bases.length) * u * 4;
        const color = [3, 10, 16].includes(i) ? PALETTE.protein.mutant : 'rgba(100,180,255,0.4)';
        drawText(ctx, bases[i], bx, cy + u * 1.8, {
          fontSize: 10, color, align: 'center', fontFamily: 'monospace',
        });
      }
      ctx.globalAlpha = 1;
    }
  }

  function renderPrediction(u: number) {
    const { centerX: cx, centerY: cy, time: t, stageProgress: p } = state;

    // Candidate neoantigens as bars
    const candidates = [
      { name: 'KRAS G12V', score: 0.95 },
      { name: 'TP53 R175H', score: 0.87 },
      { name: 'PIK3CA E545K', score: 0.72 },
      { name: 'CDH1 Q23*', score: 0.61 },
      { name: 'ESR1 D538G', score: 0.45 },
      { name: 'BRCA2 frame', score: 0.33 },
    ];

    const barStartX = cx - u * 2.5;
    const barMaxW = u * 4;
    const barH = u * 0.45;
    const barGap = u * 0.55;
    const startY = cy - u * 2;

    drawText(ctx, 'Binding Affinity Ranking', cx, startY - u * 0.4, {
      fontSize: 13, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
    });

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      const by = startY + i * barGap;
      const barProgress = clamp(p * 3 - i * 0.3, 0, 1);
      const barW = barMaxW * c.score * easeOut(barProgress);
      const isTop = i < 3;

      // Bar background
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.beginPath();
      ctx.roundRect(barStartX, by, barMaxW, barH, 4);
      ctx.fill();

      // Bar fill
      const barColor = isTop ? 'rgba(110,180,255,0.3)' : 'rgba(255,255,255,0.08)';
      ctx.fillStyle = barColor;
      ctx.beginPath();
      ctx.roundRect(barStartX, by, barW, barH, 4);
      ctx.fill();

      // Label
      drawText(ctx, c.name, barStartX - 6, by + barH / 2, {
        fontSize: 10, color: isTop ? PALETTE.text.primary : PALETTE.text.tertiary,
        align: 'right', fontFamily: 'monospace',
      });

      // Score
      if (barProgress > 0.5) {
        drawText(ctx, `${Math.round(c.score * 100)}%`, barStartX + barW + 6, by + barH / 2, {
          fontSize: 10, color: PALETTE.text.secondary,
        });
      }

      // Selection indicator for top 3
      if (isTop && p > 0.7) {
        ctx.strokeStyle = 'rgba(110,180,255,0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.roundRect(barStartX - 2, by - 2, barMaxW + 4, barH + 4, 5);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    if (p > 0.8) {
      drawText(ctx, 'Top 3 selected for vaccine', cx, startY + candidates.length * barGap + u * 0.3, {
        fontSize: 12, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
      });
    }
  }

  function renderMRNADesign(u: number) {
    const { centerX: cx, centerY: cy, time: t, stageProgress: p } = state;

    // mRNA strand being assembled — wavy line
    const strandLen = u * 5;
    const strandX = cx - strandLen / 2;
    const progress = easeOut(clamp(p * 1.5, 0, 1));

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(100,200,150,0.5)';
    ctx.lineWidth = 3;
    for (let i = 0; i <= 40; i++) {
      const t_norm = i / 40;
      if (t_norm > progress) break;
      const px = strandX + t_norm * strandLen;
      const py = cy + Math.sin(t_norm * Math.PI * 6 + t) * 8;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Codons along strand
    const codons = ['AUG', 'GCU', 'UAC', 'CAG', 'GAU', 'UGC', 'AAG', 'CCA', 'UAA'];
    for (let i = 0; i < codons.length; i++) {
      const t_norm = (i + 0.5) / codons.length;
      if (t_norm > progress) break;
      const px = strandX + t_norm * strandLen;
      const py = cy + Math.sin(t_norm * Math.PI * 6 + t) * 8;
      drawText(ctx, codons[i], px, py - 16, {
        fontSize: 9, color: 'rgba(100,200,150,0.6)', align: 'center', fontFamily: 'monospace',
      });
    }

    // 5' cap and poly-A tail labels
    if (p > 0.3) {
      drawBadge(ctx, "5' cap", strandX - 10, cy - 25, 'rgba(200,170,100,0.15)', 'rgba(200,170,100,0.8)', 9);
    }
    if (p > 0.8) {
      drawBadge(ctx, "poly-A tail", strandX + strandLen - 20, cy - 25, 'rgba(200,170,100,0.15)', 'rgba(200,170,100,0.8)', 9);
    }

    // Optimized codon highlight
    if (p > 0.5) {
      drawText(ctx, 'Codon-optimized for human ribosomes', cx, cy + u * 2, {
        fontSize: 12, color: PALETTE.text.secondary, align: 'center',
      });
    }
  }

  function renderLNP(u: number) {
    const { centerX: cx, centerY: cy, time: t, stageProgress: p } = state;

    // LNP sphere
    const lnpRadius = u * 1.2;
    const assemblyProgress = easeOut(clamp(p * 2, 0, 1));

    // Lipid bilayer (concentric circles)
    for (let layer = 0; layer < 3; layer++) {
      const layerR = lnpRadius * (1 - layer * 0.25) * assemblyProgress;
      ctx.beginPath();
      ctx.arc(cx, cy, layerR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200,170,100,${(0.15 + layer * 0.1).toFixed(2)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Lipid head groups (small circles on outer layer)
    const headCount = 24;
    for (let i = 0; i < headCount; i++) {
      const angle = (i / headCount) * Math.PI * 2 + t * 0.1;
      const hx = cx + Math.cos(angle) * lnpRadius * assemblyProgress;
      const hy = cy + Math.sin(angle) * lnpRadius * assemblyProgress;
      ctx.beginPath();
      ctx.arc(hx, hy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.lnp.edge;
      ctx.fill();
    }

    // mRNA coil inside
    if (assemblyProgress > 0.5) {
      const coilAlpha = clamp((assemblyProgress - 0.5) * 2, 0, 0.6);
      ctx.globalAlpha = coilAlpha;
      ctx.beginPath();
      for (let i = 0; i <= 30; i++) {
        const angle = (i / 30) * Math.PI * 4;
        const r = (i / 30) * lnpRadius * 0.6;
        const px = cx + Math.cos(angle + t) * r;
        const py = cy + Math.sin(angle + t) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(100,200,150,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Glow
    drawGlow(ctx, cx, cy, lnpRadius * 2, PALETTE.lnp.fill, 0.3, t);

    drawText(ctx, 'Lipid Nanoparticle', cx, cy + lnpRadius + 20, {
      fontSize: 12, color: PALETTE.lnp.edge, align: 'center',
    });

    // Labels
    if (p > 0.6) {
      drawArrow(ctx,
        { x: cx + lnpRadius + 20, y: cy - 10 },
        { x: cx + lnpRadius + 5, y: cy - 3 },
        'rgba(200,170,100,0.3)', 1, 4);
      drawText(ctx, 'Lipid shell protects mRNA', cx + lnpRadius + 25, cy - 14, {
        fontSize: 10, color: PALETTE.text.secondary,
      });
    }
  }

  function renderInjection(u: number) {
    const { centerX: cx, centerY: cy, time: t, stageProgress: p } = state;

    // Muscle tissue (horizontal fibers)
    for (let i = 0; i < 5; i++) {
      const fy = cy - u * 1.5 + i * u * 0.8;
      ctx.strokeStyle = 'rgba(180,100,100,0.08)';
      ctx.lineWidth = u * 0.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - u * 3, fy);
      ctx.lineTo(cx + u * 3, fy);
      ctx.stroke();
    }

    // Syringe
    const syringeProgress = easeOut(clamp(p * 1.5, 0, 1));
    const syringeX = cx;
    const syringeTopY = cy - u * 3 + syringeProgress * u * 1.5;

    ctx.strokeStyle = 'rgba(200,200,200,0.4)';
    ctx.lineWidth = 2;
    // Barrel
    ctx.beginPath();
    ctx.roundRect(syringeX - 6, syringeTopY, 12, u * 1.5, 2);
    ctx.stroke();
    // Needle
    ctx.beginPath();
    ctx.moveTo(syringeX, syringeTopY + u * 1.5);
    ctx.lineTo(syringeX, syringeTopY + u * 2.2);
    ctx.stroke();

    // LNPs dispersing from injection site
    if (p > 0.4) {
      const disperseP = clamp((p - 0.4) * 2, 0, 1);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + t * 0.3;
        const dist = disperseP * u * 1.5;
        const lx = cx + Math.cos(angle) * dist;
        const ly = cy + Math.sin(angle) * dist * 0.5;
        const size = 4 + Math.sin(t + i) * 1;

        ctx.beginPath();
        ctx.arc(lx, ly, size, 0, Math.PI * 2);
        ctx.fillStyle = PALETTE.lnp.fill;
        ctx.fill();
        ctx.strokeStyle = PALETTE.lnp.edge;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Label
    if (p > 0.5) {
      drawText(ctx, 'LNPs enter muscle cells', cx, cy + u * 2, {
        fontSize: 12, color: PALETTE.text.secondary, align: 'center',
      });
    }
  }

  function renderTranslation(u: number) {
    const { centerX: cx, centerY: cy, time: t, stageProgress: p } = state;

    // Muscle cell
    drawCell(ctx, cx, cy, u * 1.8, {
      fill: 'rgba(180,120,120,0.1)',
      edge: 'rgba(180,120,120,0.25)',
      glow: 'rgba(180,120,120,0.06)',
    }, t, 3);

    // mRNA strand inside
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(100,200,150,0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 20; i++) {
      const tn = i / 20;
      const px = cx - u + tn * u * 2;
      const py = cy - u * 0.3 + Math.sin(tn * Math.PI * 4 + t) * 5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Ribosome sliding along mRNA
    const ribosomePos = (t * 0.15) % 1;
    const ribX = cx - u + ribosomePos * u * 2;
    const ribY = cy - u * 0.3 + Math.sin(ribosomePos * Math.PI * 4 + t) * 5;

    ctx.beginPath();
    ctx.arc(ribX, ribY, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,180,100,0.4)';
    ctx.fill();

    drawText(ctx, 'Ribosome', ribX, ribY - 14, {
      fontSize: 9, color: 'rgba(200,180,100,0.6)', align: 'center',
    });

    // Produced neoantigen proteins appearing on surface
    if (p > 0.4) {
      const neoAlpha = clamp((p - 0.4) * 2, 0, 1);
      ctx.globalAlpha = neoAlpha;
      for (let i = 0; i < 5; i++) {
        const angle = Math.PI * 0.4 + (i / 5) * Math.PI * 1.2;
        const rx = cx + Math.cos(angle) * (u * 1.8 + 3);
        const ry = cy + Math.sin(angle) * (u * 1.8 + 3);
        drawReceptor(ctx, rx, ry, angle + Math.PI / 2, PALETTE.protein.mutant, 'diamond', 8);
      }
      ctx.globalAlpha = 1;

      drawText(ctx, 'Neoantigens displayed on surface', cx, cy + u * 2.2, {
        fontSize: 11, color: PALETTE.text.accent, align: 'center',
      });
    }
  }

  function renderKilling(u: number) {
    const { centerX: cx, centerY: cy, time: t, stageProgress: p } = state;

    // Cancer cell (target)
    const cancerAlpha = clamp(1 - p * 0.6, 0.3, 1);
    ctx.globalAlpha = cancerAlpha;

    drawCell(ctx, cx, cy, u * 1.2, {
      fill: PALETTE.cancer.fill,
      edge: PALETTE.cancer.edge,
      glow: p > 0.5 ? PALETTE.signal.death : PALETTE.cancer.glow,
    }, t, 3);

    // Matching neoantigens on cancer cell
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      drawReceptor(ctx, cx + Math.cos(angle) * (u * 1.2 + 3), cy + Math.sin(angle) * (u * 1.2 + 3),
        angle + Math.PI / 2, PALETTE.protein.mutant, 'diamond', 7);
    }
    ctx.globalAlpha = 1;

    // T-cells attacking
    const tcellPositions = [
      { x: cx - u * 2.5, y: cy - u },
      { x: cx + u * 2.5, y: cy - u * 0.5 },
      { x: cx - u * 2, y: cy + u * 1.5 },
      { x: cx + u * 2, y: cy + u * 1.2 },
    ];

    for (let i = 0; i < tcellPositions.length; i++) {
      const tp = tcellPositions[i];
      const approachP = clamp(p * 2 - i * 0.15, 0, 1);
      const tx = lerp(tp.x, cx + (tp.x > cx ? u * 1.5 : -u * 1.5), approachP * 0.6);
      const ty = lerp(tp.y, cy + (tp.y > cy ? u * 1.2 : -u * 0.8), approachP * 0.5);

      drawCell(ctx, tx, ty, u * 0.6, {
        fill: PALETTE.immune.activated.fill,
        edge: PALETTE.immune.activated.edge,
        glow: PALETTE.immune.activated.glow,
      }, t + i, 1.5);

      drawGlow(ctx, tx, ty, u, PALETTE.immune.activated.glow, 0.3, t + i);

      // Attack line
      if (approachP > 0.3) {
        const lineAlpha = clamp((approachP - 0.3) * 2, 0, 0.4);
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = `rgba(160,140,255,${lineAlpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    drawText(ctx, 'Cancer cell', cx, cy + u * 1.2 + 16, {
      fontSize: 10, color: PALETTE.cancer.label, align: 'center',
    });

    // Death indication
    if (p > 0.6) {
      drawGlow(ctx, cx, cy, u * 2, PALETTE.signal.death, clamp((p - 0.6) * 2, 0, 0.5), t * 2);
    }

    // Victory text
    if (p > 0.8) {
      drawText(ctx, 'Trained T-cells destroy cancer cells', cx, state.h * 0.12, {
        fontSize: 14, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
      });
    }
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
