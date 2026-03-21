// ============================================================================
// D4 — Oncotype DX Score: 21-Gene Heat Map with Treatment Decision
// Slider 0-100, shows low/intermediate/high risk with chemo benefit
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawSlider, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawBadge } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const GENE_GROUPS = [
  { name: 'Proliferation', genes: ['Ki-67', 'STK15', 'Survivin', 'CCNB1', 'MYBL2'], color: 'rgba(255,100,80,0.##)' },
  { name: 'Invasion', genes: ['Stromelysin 3', 'Cathepsin L2'], color: 'rgba(255,180,60,0.##)' },
  { name: 'HER2', genes: ['GRB7', 'HER2'], color: 'rgba(255,160,80,0.##)' },
  { name: 'Estrogen', genes: ['ER', 'PGR', 'BCL2', 'SCUBE2'], color: 'rgba(80,200,140,0.##)' },
  { name: 'Reference', genes: ['Beta-actin', 'GAPDH', 'RPLPO', 'GUS', 'TFRC'], color: 'rgba(150,150,150,0.##)' },
];

function getGeneColor(groupIdx: number, intensity: number): string {
  const templates = [
    [255, 100, 80],  // Proliferation — red
    [255, 180, 60],  // Invasion — orange
    [255, 160, 80],  // HER2 — amber
    [80, 200, 140],  // Estrogen — green
    [150, 150, 150], // Reference — gray
  ];
  const [r, g, b] = templates[groupIdx] ?? [150, 150, 150];
  return `rgba(${r},${g},${b},${(0.15 + intensity * 0.55).toFixed(2)})`;
}

function getRiskZone(score: number): { label: string; color: string; bgColor: string; description: string; chemoBenefit: string } {
  if (score < 18) return {
    label: 'Low Risk',
    color: 'rgba(80,200,140,0.9)',
    bgColor: 'rgba(80,200,140,0.15)',
    description: 'Excellent prognosis with hormone therapy alone.',
    chemoBenefit: 'Chemo unlikely to help — can be safely omitted.',
  };
  if (score < 31) return {
    label: 'Intermediate',
    color: 'rgba(255,200,80,0.9)',
    bgColor: 'rgba(255,200,80,0.15)',
    description: 'Moderate risk. Decision depends on age, menopause status.',
    chemoBenefit: 'Some benefit in premenopausal women under 50.',
  };
  return {
    label: 'High Risk',
    color: 'rgba(255,100,80,0.9)',
    bgColor: 'rgba(255,100,80,0.15)',
    description: 'Higher recurrence risk despite hormone therapy.',
    chemoBenefit: 'Chemo adds significant benefit — strongly recommended.',
  };
}

interface State {
  score: number;
  displayScore: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  sliderArea: ControlHitArea | null;
  dragging: boolean;
}

export function init(
  _canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SceneAPI {
  const state: State = {
    score: 15,
    displayScore: 15,
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(30, { width, height }),
    sliderArea: null,
    dragging: false,
  };

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);
    state.displayScore = lerp(state.displayScore, state.score, dt * 5);
    render();
  }

  function render() {
    const { w, h, time, displayScore } = state;
    const score = Math.round(displayScore);
    const zone = getRiskZone(score);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // ---- Heat map grid (left side) ----
    const gridX = w * 0.05;
    const gridY = h * 0.08;
    const cellW = 18;
    const cellH = 14;
    const groupLabelW = 75;

    let gy = gridY;
    for (let gi = 0; gi < GENE_GROUPS.length; gi++) {
      const group = GENE_GROUPS[gi];

      // Group label
      drawText(ctx, group.name, gridX, gy + (group.genes.length * cellH) / 2, {
        fontSize: 9, color: PALETTE.text.tertiary,
      });

      for (let j = 0; j < group.genes.length; j++) {
        const geneY = gy + j * cellH;

        // Gene name
        drawText(ctx, group.genes[j], gridX + groupLabelW - 4, geneY + cellH / 2, {
          fontSize: 8, color: PALETTE.text.tertiary, align: 'right',
        });

        // Heat cells (simulate expression across score)
        const numCells = 12;
        for (let k = 0; k < numCells; k++) {
          const cellScore = (k / numCells) * 100;
          // Proliferation genes increase with score; estrogen genes decrease
          let intensity: number;
          if (gi === 0) { // Proliferation
            intensity = clamp((cellScore - 10) / 80, 0, 1);
          } else if (gi === 3) { // Estrogen (inversely protective)
            intensity = clamp(1 - cellScore / 100, 0, 1);
          } else if (gi === 4) { // Reference — constant
            intensity = 0.4;
          } else {
            intensity = clamp((cellScore - 20) / 70, 0, 1);
          }

          const cx = gridX + groupLabelW + k * cellW;
          ctx.fillStyle = getGeneColor(gi, intensity);
          ctx.fillRect(cx, geneY, cellW - 1, cellH - 1);

          // Current score indicator line
          const scoreX = gridX + groupLabelW + (score / 100) * numCells * cellW;
          if (Math.abs(cx + cellW / 2 - scoreX) < cellW / 2) {
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(cx, geneY, cellW - 1, cellH - 1);
          }
        }
      }
      gy += group.genes.length * cellH + 6;
    }

    // Score indicator line
    const scoreLineX = gridX + groupLabelW + (score / 100) * 12 * cellW;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(scoreLineX, gridY);
    ctx.lineTo(scoreLineX, gy - 6);
    ctx.stroke();
    ctx.setLineDash([]);

    // ---- Right panel: Score + decision ----
    const infoX = w * 0.62;
    let infoY = h * 0.1;

    drawText(ctx, 'Recurrence Score', infoX, infoY, {
      fontSize: 12, color: PALETTE.text.tertiary,
    });
    infoY += 22;

    drawText(ctx, String(score), infoX, infoY, {
      fontSize: 36, fontWeight: 'bold', color: zone.color,
    });
    infoY += 10;

    drawBadge(ctx, zone.label, infoX + 55, infoY, zone.bgColor, zone.color, 12);
    infoY += 35;

    // Zone bar
    const barX = infoX;
    const barW = w * 0.3;
    const barH = 12;
    const lowW = barW * 0.18;
    const midW = barW * 0.13;

    ctx.fillStyle = 'rgba(80,200,140,0.25)';
    ctx.fillRect(barX, infoY, lowW, barH);
    ctx.fillStyle = 'rgba(255,200,80,0.25)';
    ctx.fillRect(barX + lowW, infoY, midW, barH);
    ctx.fillStyle = 'rgba(255,100,80,0.25)';
    ctx.fillRect(barX + lowW + midW, infoY, barW - lowW - midW, barH);

    // Score marker on bar
    const markerX = barX + (score / 100) * barW;
    ctx.beginPath();
    ctx.moveTo(markerX, infoY - 4);
    ctx.lineTo(markerX - 4, infoY - 10);
    ctx.lineTo(markerX + 4, infoY - 10);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fill();

    drawText(ctx, '0', barX, infoY + barH + 10, { fontSize: 9, color: PALETTE.text.tertiary });
    drawText(ctx, '18', barX + lowW, infoY + barH + 10, { fontSize: 9, color: PALETTE.text.tertiary, align: 'center' });
    drawText(ctx, '31', barX + lowW + midW, infoY + barH + 10, { fontSize: 9, color: PALETTE.text.tertiary, align: 'center' });
    drawText(ctx, '100', barX + barW, infoY + barH + 10, { fontSize: 9, color: PALETTE.text.tertiary, align: 'right' });

    infoY += barH + 28;

    // Description
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = PALETTE.text.secondary;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const maxW = w * 0.32;
    const words = zone.description.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, infoX, infoY);
        line = word;
        infoY += 18;
      } else {
        line = test;
      }
    }
    if (line) { ctx.fillText(line, infoX, infoY); infoY += 18; }

    infoY += 10;
    drawText(ctx, 'Chemotherapy benefit:', infoX, infoY, {
      fontSize: 11, fontWeight: '600', color: PALETTE.text.accent, baseline: 'top',
    });
    infoY += 18;

    const chemoWords = zone.chemoBenefit.split(' ');
    let cLine = '';
    for (const word of chemoWords) {
      const test = cLine ? `${cLine} ${word}` : word;
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      if (ctx.measureText(test).width > maxW && cLine) {
        drawText(ctx, cLine, infoX, infoY, { fontSize: 12, color: PALETTE.text.secondary, baseline: 'top' });
        cLine = word;
        infoY += 18;
      } else {
        cLine = test;
      }
    }
    if (cLine) drawText(ctx, cLine, infoX, infoY, { fontSize: 12, color: PALETTE.text.secondary, baseline: 'top' });

    // ---- Slider ----
    const sliderY = h - 55;
    const sliderX = w * 0.15;
    const sliderW = w * 0.7;
    state.sliderArea = drawSlider(ctx, state.score, 0, 100, sliderX, sliderY, sliderW,
      ['0', '25', '50', '75', '100']);

    drawText(ctx, 'Oncotype DX Score', w / 2, sliderY - 20, {
      fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
    });
  }

  function updateSliderFromPointer(x: number) {
    if (!state.sliderArea) return;
    const normalized = clamp((x - state.sliderArea.x) / state.sliderArea.width, 0, 1);
    state.score = Math.round(normalized * 100);
  }

  function onPointerDown(x: number, y: number) {
    if (state.sliderArea && hitTest(x, y, state.sliderArea)) {
      state.dragging = true;
      updateSliderFromPointer(x);
    }
  }

  function onPointerMove(x: number, _y: number) {
    if (state.dragging) updateSliderFromPointer(x);
  }

  function onPointerUp() {
    state.dragging = false;
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
    onPointerMove,
    onPointerUp,
    nextStage: () => { state.score = clamp(state.score + 10, 0, 100); },
    prevStage: () => { state.score = clamp(state.score - 10, 0, 100); },
    getStage: () => Math.floor(state.score / 25),
  };
}
