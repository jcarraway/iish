// ============================================================================
// D5 — ctDNA Monitoring: Liquid Biopsy Concept
// Stepper, 9 stages — Tumor sheds → blood draw → isolation → sequencing →
// mutation detection → quantification → monitoring → interpretation → early detection
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawDNA, drawMolecule, drawGlow, drawArrow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, easeOut, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const STAGES = [
  { label: '1. Tumor sheds DNA', caption: 'As cancer cells divide and die, they release tiny fragments of their DNA into the bloodstream — circulating tumor DNA (ctDNA).' },
  { label: '2. Blood draw', caption: 'A simple blood draw collects plasma containing both normal cell-free DNA and tumor-derived ctDNA fragments.' },
  { label: '3. cfDNA isolation', caption: 'Cell-free DNA is separated from blood cells. ctDNA fragments are mixed in with normal cfDNA — often less than 1%.' },
  { label: '4. Sequencing', caption: 'Next-generation sequencing reads millions of DNA fragments simultaneously, looking for tumor-specific mutations.' },
  { label: '5. Mutation detection', caption: 'Bioinformatics algorithms identify mutations matching the tumor\'s known profile, distinguishing signal from noise.' },
  { label: '6. Quantification', caption: 'The variant allele frequency (VAF) is calculated — the percentage of fragments carrying the mutation. Lower VAF = less tumor burden.' },
  { label: '7. Monitoring over time', caption: 'Serial blood draws track ctDNA levels over time. Rising levels may signal residual disease before imaging can detect it.' },
  { label: '8. Clinical interpretation', caption: 'Oncologists interpret ctDNA trends alongside clinical context — treatment response, molecular residual disease (MRD), or possible progression.' },
  { label: '9. Early recurrence detection', caption: 'ctDNA can detect recurrence months before symptoms or scans. Earlier detection may enable more effective intervention.' },
];

interface DNAFragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isTumor: boolean;
  length: number;
  phase: number;
}

interface State {
  stage: number;
  stageProgress: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
  fragments: DNAFragment[];
  tumorX: number;
  tumorY: number;
  // Monitoring chart data points (VAF over time)
  chartPoints: number[];
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
    particles: createParticleSystem(40, { width, height }),
    stepperAreas: [],
    fragments: [],
    tumorX: width * 0.25,
    tumorY: height * 0.38,
    chartPoints: [0.08, 0.065, 0.04, 0.02, 0.01, 0.005, 0.003, 0.002, 0.004, 0.012, 0.03],
  };

  function layout() {
    state.tumorX = state.w * 0.25;
    state.tumorY = state.h * 0.38;
  }
  layout();
  initFragments();

  function initFragments() {
    state.fragments = [];
    for (let i = 0; i < 20; i++) {
      const isTumor = i < 4;
      state.fragments.push({
        x: state.tumorX + (Math.random() - 0.5) * 60,
        y: state.tumorY + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        isTumor,
        length: 15 + Math.random() * 20,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, STAGES.length - 1);
    state.stageProgress = 0;
    if (idx === 0) initFragments();
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    state.stageProgress = clamp(state.stageProgress + dt * 0.25, 0, 1);
    updateParticles(state.particles, dt * speed);

    // Animate fragments drifting
    for (const f of state.fragments) {
      f.phase += dt * 0.5;
      if (state.stage <= 1) {
        f.x += f.vx * dt * 30;
        f.y += f.vy * dt * 30 + Math.sin(f.phase) * 0.2;
        // Keep in bounds around blood area
        if (f.x < state.w * 0.05) f.vx = Math.abs(f.vx);
        if (f.x > state.w * 0.95) f.vx = -Math.abs(f.vx);
        if (f.y < state.h * 0.15) f.vy = Math.abs(f.vy);
        if (f.y > state.h * 0.6) f.vy = -Math.abs(f.vy);
      } else if (state.stage === 2) {
        // Converge to isolation area
        const targetX = state.w * 0.55;
        const targetY = state.h * 0.35;
        f.x = lerp(f.x, targetX + (f.isTumor ? -15 : 15) + Math.sin(f.phase) * 5, dt * 1.5);
        f.y = lerp(f.y, targetY + (state.fragments.indexOf(f) % 5) * 12 - 24, dt * 1.5);
      }
    }

    render();
  }

  function drawBloodVessel(x: number, y: number, width: number, height: number) {
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, 'rgba(180,40,40,0.04)');
    gradient.addColorStop(0.3, 'rgba(180,40,40,0.08)');
    gradient.addColorStop(0.7, 'rgba(180,40,40,0.08)');
    gradient.addColorStop(1, 'rgba(180,40,40,0.04)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    // Vessel walls
    ctx.strokeStyle = 'rgba(180,40,40,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.stroke();
  }

  function drawTestTube(cx: number, cy: number, tubeW: number, tubeH: number) {
    ctx.beginPath();
    ctx.roundRect(cx - tubeW / 2, cy - tubeH / 2, tubeW, tubeH, [0, 0, tubeW / 2, tubeW / 2]);
    ctx.strokeStyle = 'rgba(150,200,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Liquid fill
    const fillH = tubeH * 0.65;
    ctx.beginPath();
    ctx.roundRect(cx - tubeW / 2 + 2, cy - tubeH / 2 + tubeH - fillH, tubeW - 4, fillH - 4, [0, 0, tubeW / 2 - 2, tubeW / 2 - 2]);
    ctx.fillStyle = 'rgba(180,50,50,0.12)';
    ctx.fill();
  }

  function drawMonitoringChart(cx: number, cy: number, chartW: number, chartH: number, progress: number) {
    const points = state.chartPoints;
    const maxVal = 0.1;
    const visibleCount = Math.floor(points.length * clamp(progress, 0.1, 1));

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy + chartH);
    ctx.lineTo(cx + chartW, cy + chartH);
    ctx.stroke();

    // Axis labels
    drawText(ctx, 'VAF %', cx - 8, cy - 8, { fontSize: 9, color: PALETTE.text.tertiary, align: 'center' });
    drawText(ctx, 'Time', cx + chartW / 2, cy + chartH + 14, { fontSize: 9, color: PALETTE.text.tertiary, align: 'center' });

    // Threshold line
    const thresholdY = cy + chartH - (0.01 / maxVal) * chartH;
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(255,200,80,0.2)';
    ctx.beginPath();
    ctx.moveTo(cx, thresholdY);
    ctx.lineTo(cx + chartW, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);
    drawText(ctx, 'Detection limit', cx + chartW + 4, thresholdY, { fontSize: 8, color: 'rgba(255,200,80,0.3)', align: 'left' });

    // Data line
    if (visibleCount > 1) {
      ctx.beginPath();
      for (let i = 0; i < visibleCount; i++) {
        const px = cx + (i / (points.length - 1)) * chartW;
        const py = cy + chartH - (points[i] / maxVal) * chartH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = PALETTE.drug.edge;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Data points
      for (let i = 0; i < visibleCount; i++) {
        const px = cx + (i / (points.length - 1)) * chartW;
        const py = cy + chartH - (points[i] / maxVal) * chartH;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = i >= points.length - 3 && points[i] > points[i - 1]
          ? PALETTE.cancer.edge
          : PALETTE.drug.fill;
        ctx.fill();
      }

      // Rising alert for last rising points
      if (visibleCount >= points.length - 1) {
        const lastPt = points[visibleCount - 1];
        const prevPt = points[visibleCount - 2];
        if (lastPt > prevPt) {
          const px = cx + ((visibleCount - 1) / (points.length - 1)) * chartW;
          const py = cy + chartH - (lastPt / maxVal) * chartH;
          drawGlow(ctx, px, py, 20, PALETTE.cancer.glow, 0.5, state.time);
        }
      }
    }
  }

  function render() {
    const { w, h, time, stage, stageProgress } = state;
    const r = Math.min(w, h) * 0.1;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // ---- Stage 0: Tumor shedding DNA ----
    if (stage === 0) {
      // Tumor cell
      drawCell(ctx, state.tumorX, state.tumorY, r * 1.2, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
        glow: PALETTE.cancer.glow,
      }, time);
      drawNucleus(ctx, state.tumorX, state.tumorY, r * 0.4, PALETTE.cancer.accent);

      drawText(ctx, 'Tumor', state.tumorX, state.tumorY + r * 1.2 + 16, {
        fontSize: 11, color: PALETTE.cancer.label, align: 'center',
      });

      // DNA fragments shedding outward
      const shedAlpha = clamp(stageProgress * 2, 0, 1);
      ctx.globalAlpha = shedAlpha;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + time * 0.3;
        const dist = r * 1.2 + easeOut(stageProgress) * r * 2;
        const fx = state.tumorX + Math.cos(angle) * dist;
        const fy = state.tumorY + Math.sin(angle) * dist;
        drawDNA(ctx, fx - 8, fy, 16, PALETTE.dna.damaged, true, time + i);
      }
      ctx.globalAlpha = 1;

      // Blood vessel hint
      drawBloodVessel(state.w * 0.5, state.h * 0.2, state.w * 0.45, state.h * 0.35);

      // Floating fragments in blood
      for (const f of state.fragments) {
        if (f.x > state.w * 0.45) {
          const color = f.isTumor ? PALETTE.dna.damaged : PALETTE.dna.fill;
          drawDNA(ctx, f.x, f.y, f.length * 0.5, color, f.isTumor, time + f.phase);
        }
      }

      drawArrow(ctx,
        { x: state.tumorX + r * 1.5, y: state.tumorY },
        { x: state.w * 0.48, y: state.tumorY },
        'rgba(255,255,255,0.15)', 1, 6);
    }

    // ---- Stage 1: Blood draw ----
    if (stage === 1) {
      // Syringe / vial hint
      const vialX = w * 0.5;
      const vialY = h * 0.35;
      drawTestTube(vialX, vialY, 24, 70);

      drawText(ctx, 'Blood sample', vialX, vialY + 50, {
        fontSize: 11, color: PALETTE.text.secondary, align: 'center',
      });

      // Fragments flowing toward vial
      for (const f of state.fragments) {
        const tx = vialX + (Math.random() - 0.5) * 10;
        const ty = vialY + (Math.random() - 0.5) * 30;
        const cx = lerp(f.x, tx, stageProgress * 0.5);
        const cy = lerp(f.y, ty, stageProgress * 0.5);
        const color = f.isTumor ? PALETTE.dna.damaged : PALETTE.dna.fill;
        drawDNA(ctx, cx, cy, f.length * 0.4, color, f.isTumor, time + f.phase);
      }

      // Red blood cells (circles flowing)
      for (let i = 0; i < 8; i++) {
        const bx = w * 0.15 + i * w * 0.1;
        const by = h * 0.25 + Math.sin(time + i * 1.3) * 15;
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,50,50,0.15)';
        ctx.fill();
      }
    }

    // ---- Stage 2: cfDNA isolation ----
    if (stage === 2) {
      // Separation visual
      const sepX = w * 0.3;
      const sepW = w * 0.4;

      // Left: mixed sample
      drawText(ctx, 'Mixed cfDNA', sepX, h * 0.15, {
        fontSize: 12, color: PALETTE.text.secondary, align: 'center',
      });

      // Divider
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.2);
      ctx.lineTo(w * 0.5, h * 0.6);
      ctx.stroke();
      ctx.setLineDash([]);

      // Right: isolated fragments, tumor highlighted
      drawText(ctx, 'Isolated cfDNA', sepX + sepW, h * 0.15, {
        fontSize: 12, color: PALETTE.text.secondary, align: 'center',
      });

      for (const f of state.fragments) {
        const color = f.isTumor ? PALETTE.dna.damaged : PALETTE.dna.fill;
        drawDNA(ctx, f.x, f.y, f.length * 0.4, color, f.isTumor, time + f.phase);
        if (f.isTumor) {
          drawGlow(ctx, f.x + f.length * 0.2, f.y, 15, PALETTE.cancer.glow, 0.3, time + f.phase);
        }
      }

      // Proportion label
      const tumorPct = clamp(stageProgress, 0, 1);
      if (tumorPct > 0.5) {
        drawText(ctx, 'ctDNA: < 1% of total cfDNA', w * 0.5, h * 0.65, {
          fontSize: 11, color: PALETTE.cancer.label, align: 'center',
        });
      }
    }

    // ---- Stage 3: Sequencing ----
    if (stage === 3) {
      const seqX = w * 0.2;
      const seqY = h * 0.22;
      const seqW = w * 0.6;
      const lineH = 14;
      const numLines = 12;

      drawText(ctx, 'Next-Generation Sequencing', w * 0.5, h * 0.12, {
        fontSize: 14, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
      });

      // Sequencing read lines
      for (let i = 0; i < numLines; i++) {
        const ly = seqY + i * lineH;
        const readProgress = clamp((stageProgress * 2 - i * 0.08), 0, 1);
        const readW = seqW * readProgress;

        // Read background
        ctx.beginPath();
        ctx.roundRect(seqX, ly, readW, lineH - 3, 2);
        ctx.fillStyle = i < 2 ? 'rgba(255,80,60,0.12)' : 'rgba(100,180,255,0.08)';
        ctx.fill();

        // Base pair colored blocks
        const blockW = 4;
        const colors = ['rgba(80,200,140,0.5)', 'rgba(100,170,255,0.5)', 'rgba(255,200,80,0.5)', 'rgba(230,100,80,0.5)'];
        for (let b = 0; b < readW / (blockW + 1); b++) {
          const bx = seqX + b * (blockW + 1);
          if (bx > seqX + readW - blockW) break;
          ctx.fillStyle = colors[(b + i * 3) % 4];
          ctx.fillRect(bx, ly + 2, blockW, lineH - 7);
        }
      }

      // Highlight mutant reads
      if (stageProgress > 0.6) {
        const alpha = clamp((stageProgress - 0.6) * 3, 0, 0.5);
        ctx.strokeStyle = `rgba(255,80,60,${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(seqX - 2, seqY - 2, seqW + 4, lineH * 2 + 1, 3);
        ctx.stroke();

        drawText(ctx, 'Tumor mutations detected', seqX + seqW + 10, seqY + lineH, {
          fontSize: 10, color: PALETTE.cancer.label,
        });
      }
    }

    // ---- Stage 4: Mutation detection ----
    if (stage === 4) {
      const cx = w * 0.5;
      const cy = h * 0.35;

      drawText(ctx, 'Mutation Analysis', cx, h * 0.12, {
        fontSize: 14, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
      });

      // Normal fragments
      for (let i = 0; i < 12; i++) {
        const fx = cx - 100 + (i % 4) * 55;
        const fy = cy + Math.floor(i / 4) * 30 - 30;
        drawDNA(ctx, fx, fy, 20, PALETTE.dna.fill, false, time + i * 0.5);
      }

      // Mutant fragments highlighted
      const mutantAlpha = clamp(stageProgress * 2, 0, 1);
      ctx.globalAlpha = mutantAlpha;
      for (let i = 0; i < 2; i++) {
        const fx = cx - 20 + i * 55;
        const fy = cy + 60;
        drawDNA(ctx, fx, fy, 20, PALETTE.dna.damaged, true, time + i);
        drawGlow(ctx, fx + 10, fy, 18, PALETTE.cancer.glow, 0.5, time);

        // Arrow pointing to detected mutation
        drawArrow(ctx,
          { x: fx + 10, y: fy - 15 },
          { x: fx + 10, y: fy - 5 },
          PALETTE.signal.activation, 1.5, 5);
      }
      ctx.globalAlpha = 1;

      if (stageProgress > 0.5) {
        drawText(ctx, 'Known tumor mutations identified', cx, h * 0.72, {
          fontSize: 12, color: PALETTE.text.secondary, align: 'center',
        });
      }
    }

    // ---- Stage 5: Quantification ----
    if (stage === 5) {
      const barX = w * 0.15;
      const barW = w * 0.7;
      const barH = 28;
      const barY = h * 0.28;

      drawText(ctx, 'Variant Allele Frequency (VAF)', w * 0.5, h * 0.14, {
        fontSize: 14, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
      });

      // Full bar (normal DNA)
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 6);
      ctx.fillStyle = 'rgba(100,180,255,0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(100,180,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Tumor fraction
      const vaf = 0.04;
      const tumorW = barW * vaf * easeOut(stageProgress);
      ctx.beginPath();
      ctx.roundRect(barX, barY, tumorW, barH, [6, 0, 0, 6]);
      ctx.fillStyle = 'rgba(230,100,80,0.35)';
      ctx.fill();

      drawText(ctx, `${(vaf * 100).toFixed(1)}% ctDNA`, barX + tumorW + 8, barY + barH / 2, {
        fontSize: 12, fontWeight: '600', color: PALETTE.cancer.label,
      });
      drawText(ctx, 'Normal cfDNA', barX + barW - 80, barY + barH / 2, {
        fontSize: 11, color: PALETTE.dna.fill, align: 'center',
      });

      // Explanation bar
      if (stageProgress > 0.4) {
        const items = [
          { label: 'High VAF (>10%)', desc: 'Large tumor burden', color: 'rgba(230,100,80,0.4)' },
          { label: 'Low VAF (1-10%)', desc: 'Moderate disease', color: 'rgba(230,100,80,0.25)' },
          { label: 'Very low (<1%)', desc: 'Minimal residual disease', color: 'rgba(230,100,80,0.12)' },
        ];
        for (let i = 0; i < items.length; i++) {
          const iy = h * 0.48 + i * 32;
          ctx.beginPath();
          ctx.arc(barX + 10, iy, 5, 0, Math.PI * 2);
          ctx.fillStyle = items[i].color;
          ctx.fill();
          drawText(ctx, items[i].label, barX + 24, iy, {
            fontSize: 11, fontWeight: '600', color: PALETTE.text.primary,
          });
          drawText(ctx, items[i].desc, barX + 140, iy, {
            fontSize: 11, color: PALETTE.text.secondary,
          });
        }
      }
    }

    // ---- Stage 6: Monitoring over time (chart) ----
    if (stage === 6) {
      drawText(ctx, 'Serial ctDNA Monitoring', w * 0.5, h * 0.08, {
        fontSize: 14, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
      });

      const chartX = w * 0.12;
      const chartY = h * 0.15;
      const chartW = w * 0.7;
      const chartH = h * 0.45;
      drawMonitoringChart(chartX, chartY, chartW, chartH, stageProgress);

      // Treatment annotation
      if (stageProgress > 0.3) {
        const txX = chartX + chartW * 0.15;
        ctx.setLineDash([2, 3]);
        ctx.strokeStyle = 'rgba(80,200,140,0.25)';
        ctx.beginPath();
        ctx.moveTo(txX, chartY);
        ctx.lineTo(txX, chartY + chartH);
        ctx.stroke();
        ctx.setLineDash([]);
        drawText(ctx, 'Treatment start', txX, chartY - 6, {
          fontSize: 8, color: PALETTE.healthy.edge, align: 'center', baseline: 'bottom',
        });
      }
    }

    // ---- Stage 7: Clinical interpretation ----
    if (stage === 7) {
      const panels = [
        { label: 'Treatment Response', desc: 'ctDNA declining = treatment is working', icon: 'rgba(80,200,140,0.3)', y: h * 0.15 },
        { label: 'Molecular Residual Disease', desc: 'ctDNA detected post-surgery = residual cancer cells', icon: 'rgba(255,200,80,0.3)', y: h * 0.32 },
        { label: 'Possible Progression', desc: 'ctDNA rising = cancer may be growing again', icon: 'rgba(230,100,80,0.3)', y: h * 0.49 },
      ];

      drawText(ctx, 'Clinical Interpretation', w * 0.5, h * 0.08, {
        fontSize: 14, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
      });

      for (let i = 0; i < panels.length; i++) {
        const p = panels[i];
        const panelAlpha = clamp((stageProgress - i * 0.2) * 3, 0, 1);
        ctx.globalAlpha = panelAlpha;

        const px = w * 0.12;
        const pw = w * 0.76;
        const ph = h * 0.13;

        ctx.beginPath();
        ctx.roundRect(px, p.y, pw, ph, 8);
        ctx.fillStyle = p.icon;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();

        drawText(ctx, p.label, px + 16, p.y + ph * 0.38, {
          fontSize: 13, fontWeight: '600', color: PALETTE.text.primary,
        });
        drawText(ctx, p.desc, px + 16, p.y + ph * 0.68, {
          fontSize: 11, color: PALETTE.text.secondary,
        });

        ctx.globalAlpha = 1;
      }
    }

    // ---- Stage 8: Early recurrence detection ----
    if (stage === 8) {
      drawText(ctx, 'Early Detection Advantage', w * 0.5, h * 0.08, {
        fontSize: 14, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
      });

      // Timeline comparison
      const tlY1 = h * 0.25;
      const tlY2 = h * 0.45;
      const tlX = w * 0.1;
      const tlW = w * 0.8;

      // ctDNA detection timeline
      drawText(ctx, 'ctDNA detection', tlX - 4, tlY1 - 12, {
        fontSize: 11, fontWeight: '600', color: PALETTE.drug.label, baseline: 'bottom',
      });
      ctx.beginPath();
      ctx.roundRect(tlX, tlY1, tlW, 6, 3);
      ctx.fillStyle = 'rgba(100,170,255,0.12)';
      ctx.fill();

      const ctdnaDetect = tlW * 0.25 * easeOut(clamp(stageProgress * 1.5, 0, 1));
      ctx.beginPath();
      ctx.roundRect(tlX, tlY1, ctdnaDetect, 6, 3);
      ctx.fillStyle = PALETTE.drug.fill;
      ctx.fill();

      // Detection marker
      if (stageProgress > 0.3) {
        const markerX = tlX + tlW * 0.25;
        ctx.beginPath();
        ctx.arc(markerX, tlY1 + 3, 5, 0, Math.PI * 2);
        ctx.fillStyle = PALETTE.drug.edge;
        ctx.fill();
        drawText(ctx, 'Detected early', markerX, tlY1 + 18, {
          fontSize: 10, color: PALETTE.drug.label, align: 'center',
        });
      }

      // Imaging detection timeline
      drawText(ctx, 'Imaging detection', tlX - 4, tlY2 - 12, {
        fontSize: 11, fontWeight: '600', color: PALETTE.text.secondary, baseline: 'bottom',
      });
      ctx.beginPath();
      ctx.roundRect(tlX, tlY2, tlW, 6, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fill();

      const imgDetect = tlW * 0.65 * easeOut(clamp(stageProgress * 1.2, 0, 1));
      ctx.beginPath();
      ctx.roundRect(tlX, tlY2, imgDetect, 6, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fill();

      if (stageProgress > 0.5) {
        const markerX2 = tlX + tlW * 0.65;
        ctx.beginPath();
        ctx.arc(markerX2, tlY2 + 3, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
        drawText(ctx, 'Detected later', markerX2, tlY2 + 18, {
          fontSize: 10, color: PALETTE.text.secondary, align: 'center',
        });
      }

      // Time advantage annotation
      if (stageProgress > 0.6) {
        const advAlpha = clamp((stageProgress - 0.6) * 3, 0, 1);
        ctx.globalAlpha = advAlpha;
        const midY = (tlY1 + tlY2) / 2 + 3;
        const arrowStart = tlX + tlW * 0.25;
        const arrowEnd = tlX + tlW * 0.65;

        drawArrow(ctx,
          { x: arrowStart, y: midY },
          { x: arrowEnd, y: midY },
          'rgba(80,200,140,0.4)', 1.5, 6);

        drawText(ctx, 'Months earlier', (arrowStart + arrowEnd) / 2, midY - 10, {
          fontSize: 11, fontWeight: '600', color: PALETTE.healthy.edge, align: 'center',
        });
        ctx.globalAlpha = 1;
      }
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
      layout();
    },
    onPointerDown,
    nextStage: () => goToStage(state.stage + 1),
    prevStage: () => goToStage(state.stage - 1),
    getStage: () => state.stage,
  };
}
