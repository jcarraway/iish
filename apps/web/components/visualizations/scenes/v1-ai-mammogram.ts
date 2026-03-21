// ============================================================================
// V1 — AI Mammogram Analysis: Standard vs AI-Highlighted View
// Toggle between standard mammogram view and AI-augmented overlay with
// attention map, confidence scores, and sensitivity/specificity comparison
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawToggle, drawPhaseLabel, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawWrappedText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

// ---------------------------------------------------------------------------
// Mammogram tissue blob data (procedural "tissue" shapes)
// ---------------------------------------------------------------------------

interface TissueBlob {
  x: number; // fraction of image area
  y: number;
  rx: number;
  ry: number;
  opacity: number;
  isSuspicious: boolean;
}

const TISSUE: TissueBlob[] = [
  { x: 0.45, y: 0.30, rx: 0.22, ry: 0.25, opacity: 0.12, isSuspicious: false },
  { x: 0.55, y: 0.50, rx: 0.18, ry: 0.20, opacity: 0.10, isSuspicious: false },
  { x: 0.40, y: 0.60, rx: 0.15, ry: 0.12, opacity: 0.14, isSuspicious: false },
  { x: 0.50, y: 0.45, rx: 0.10, ry: 0.08, opacity: 0.08, isSuspicious: false },
  { x: 0.60, y: 0.35, rx: 0.08, ry: 0.10, opacity: 0.10, isSuspicious: false },
  // Suspicious region (small, subtle)
  { x: 0.52, y: 0.42, rx: 0.04, ry: 0.035, opacity: 0.16, isSuspicious: true },
  // Dense area
  { x: 0.35, y: 0.40, rx: 0.12, ry: 0.15, opacity: 0.09, isSuspicious: false },
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface State {
  on: boolean; // false = standard, true = AI-augmented
  t: number;   // 0 → 1 interpolation
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  toggleArea: ControlHitArea | null;
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

export function init(
  _canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SceneAPI {
  const state: State = {
    on: false,
    t: 0,
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(20, { width, height }),
    toggleArea: null,
  };

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;

    const target = state.on ? 1 : 0;
    state.t = lerp(state.t, target, dt * 3);
    state.t = clamp(state.t, 0, 1);

    updateParticles(state.particles, dt * speed);
    render();
  }

  function render() {
    const { w, h, time, t } = state;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // Mammogram image area
    const imgX = w * 0.06;
    const imgY = h * 0.06;
    const imgW = w * 0.44;
    const imgH = h * 0.68;

    // ---- Mammogram base (dark film look) ----
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, imgW, imgH, 8);
    ctx.fillStyle = '#0A0A0A';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Clip to image area
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, imgW, imgH, 8);
    ctx.clip();

    // ---- Breast silhouette ----
    ctx.beginPath();
    ctx.moveTo(imgX + imgW * 0.2, imgY);
    ctx.quadraticCurveTo(
      imgX + imgW * 0.15, imgY + imgH * 0.5,
      imgX + imgW * 0.25, imgY + imgH
    );
    ctx.lineTo(imgX + imgW * 0.85, imgY + imgH);
    ctx.quadraticCurveTo(
      imgX + imgW * 0.9, imgY + imgH * 0.4,
      imgX + imgW * 0.7, imgY
    );
    ctx.closePath();
    ctx.fillStyle = 'rgba(180,180,180,0.04)';
    ctx.fill();

    // ---- Tissue blobs (grayscale mammogram look) ----
    for (const blob of TISSUE) {
      const bx = imgX + blob.x * imgW;
      const by = imgY + blob.y * imgH;
      const brx = blob.rx * imgW;
      const bry = blob.ry * imgH;

      // Standard grayscale tissue
      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(brx, bry));
      grad.addColorStop(0, `rgba(200,200,200,${blob.opacity})`);
      grad.addColorStop(0.6, `rgba(160,160,160,${blob.opacity * 0.5})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(bx, by, brx, bry, 0, 0, Math.PI * 2);
      ctx.fill();

      // AI overlay — colored attention map
      if (t > 0.1) {
        const overlayAlpha = t * (blob.isSuspicious ? 0.5 : 0.12);
        const overlayColor = blob.isSuspicious
          ? `rgba(255,80,60,${overlayAlpha.toFixed(3)})`
          : `rgba(80,180,255,${(overlayAlpha * 0.3).toFixed(3)})`;

        const aiGrad = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(brx, bry) * 1.2);
        aiGrad.addColorStop(0, overlayColor);
        aiGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.globalAlpha = clamp(t, 0, 1);
        ctx.fillStyle = aiGrad;
        ctx.beginPath();
        ctx.ellipse(bx, by, brx * 1.1, bry * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // ---- Suspicious region marker (AI mode) ----
    if (t > 0.3) {
      const suspicious = TISSUE.find(b => b.isSuspicious);
      if (suspicious) {
        const sx = imgX + suspicious.x * imgW;
        const sy = imgY + suspicious.y * imgH;
        const sr = Math.max(suspicious.rx * imgW, suspicious.ry * imgH) * 1.6;

        const markerAlpha = clamp((t - 0.3) * 2, 0, 0.8);
        ctx.globalAlpha = markerAlpha;

        // Pulsing ring
        const pulseR = sr + Math.sin(time * 3) * 3;
        ctx.beginPath();
        ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,80,60,0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Corner brackets
        const bSize = sr * 0.4;
        ctx.strokeStyle = 'rgba(255,80,60,0.8)';
        ctx.lineWidth = 2;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(sx - sr, sy - sr + bSize);
        ctx.lineTo(sx - sr, sy - sr);
        ctx.lineTo(sx - sr + bSize, sy - sr);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(sx + sr - bSize, sy - sr);
        ctx.lineTo(sx + sr, sy - sr);
        ctx.lineTo(sx + sr, sy - sr + bSize);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(sx - sr, sy + sr - bSize);
        ctx.lineTo(sx - sr, sy + sr);
        ctx.lineTo(sx - sr + bSize, sy + sr);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(sx + sr - bSize, sy + sr);
        ctx.lineTo(sx + sr, sy + sr);
        ctx.lineTo(sx + sr, sy + sr - bSize);
        ctx.stroke();

        // Confidence label
        drawText(ctx, '94% confidence', sx, sy - sr - 10, {
          fontSize: 10, fontWeight: '600', color: 'rgba(255,100,80,0.9)', align: 'center',
        });

        drawGlow(ctx, sx, sy, sr * 2, 'rgba(255,80,60,0.15)', 0.3, time);

        ctx.globalAlpha = 1;
      }
    }

    ctx.restore(); // End clipping

    // ---- Image labels ----
    drawText(ctx, t < 0.5 ? 'Standard mammogram' : 'AI-augmented view', imgX, imgY - 10, {
      fontSize: 11, fontWeight: '600',
      color: t < 0.5 ? PALETTE.text.secondary : PALETTE.text.accent,
      baseline: 'bottom',
    });

    // ---- Color legend (AI mode) ----
    if (t > 0.2) {
      const legX = imgX;
      const legY = imgY + imgH + 12;
      ctx.globalAlpha = clamp(t * 1.5, 0, 1);

      // Red = suspicious
      ctx.beginPath();
      ctx.arc(legX + 5, legY + 4, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,80,60,0.6)';
      ctx.fill();
      drawText(ctx, 'Suspicious', legX + 14, legY + 4, {
        fontSize: 9, color: 'rgba(255,100,80,0.7)',
      });

      // Blue = normal attention
      ctx.beginPath();
      ctx.arc(legX + 90, legY + 4, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(80,180,255,0.4)';
      ctx.fill();
      drawText(ctx, 'Normal tissue', legX + 99, legY + 4, {
        fontSize: 9, color: 'rgba(80,180,255,0.5)',
      });

      ctx.globalAlpha = 1;
    }

    // ---- Right panel: stats comparison ----
    const panelX = w * 0.56;
    const panelY = h * 0.06;
    const panelW = w * 0.38;

    if (t < 0.5) {
      // Standard reading info
      const alpha = 1 - t * 2;
      ctx.globalAlpha = clamp(alpha, 0, 1);

      drawText(ctx, 'Radiologist Reading', panelX, panelY, {
        fontSize: 16, fontWeight: 'bold', color: PALETTE.text.primary,
      });
      drawText(ctx, 'Human expert interpretation', panelX, panelY + 22, {
        fontSize: 11, color: PALETTE.text.secondary,
      });

      let py = panelY + 50;

      // Sensitivity bar
      py = drawStatBar(panelX, py, panelW * 0.85, 'Sensitivity', 0.87, 'rgba(80,200,140,0.3)');
      py += 8;
      py = drawStatBar(panelX, py, panelW * 0.85, 'Specificity', 0.89, 'rgba(100,170,255,0.3)');
      py += 16;

      drawWrappedText(ctx, 'Sensitivity = ability to find real cancers. Specificity = ability to correctly identify normal tissue.', panelX, py, panelW * 0.85, 16, {
        fontSize: 10, color: PALETTE.text.tertiary,
      });
      py += 40;

      const humanNotes = [
        '\u2022 Reads ~50 mammograms per day',
        '\u2022 Accuracy affected by fatigue',
        '\u2022 Dense tissue can hide tumors',
        '\u2022 Double-reading standard in EU',
      ];
      for (const note of humanNotes) {
        drawText(ctx, note, panelX, py, {
          fontSize: 11, color: PALETTE.text.secondary, baseline: 'top',
        });
        py += 18;
      }

      ctx.globalAlpha = 1;
    } else {
      // AI-augmented info
      const alpha = (t - 0.5) * 2;
      ctx.globalAlpha = clamp(alpha, 0, 1);

      drawText(ctx, 'AI-Augmented Reading', panelX, panelY, {
        fontSize: 16, fontWeight: 'bold', color: PALETTE.text.primary,
      });
      drawText(ctx, 'AI assists the radiologist', panelX, panelY + 22, {
        fontSize: 11, color: PALETTE.text.accent,
      });

      let py = panelY + 50;

      // Better stats
      py = drawStatBar(panelX, py, panelW * 0.85, 'Sensitivity', 0.94, 'rgba(80,200,140,0.4)');
      py += 8;
      py = drawStatBar(panelX, py, panelW * 0.85, 'Specificity', 0.92, 'rgba(100,170,255,0.4)');
      py += 16;

      drawWrappedText(ctx, 'AI + radiologist together outperform either alone. The AI highlights regions of concern that may be missed.', panelX, py, panelW * 0.85, 16, {
        fontSize: 10, color: PALETTE.text.tertiary,
      });
      py += 48;

      const aiNotes = [
        '\u2713 Processes image in <1 second',
        '\u2713 Consistent — never fatigued',
        '\u2713 Better in dense tissue',
        '\u2713 Reduces false negatives by 20%',
      ];
      for (const note of aiNotes) {
        drawText(ctx, note, panelX, py, {
          fontSize: 11, color: 'rgba(80,200,140,0.7)', baseline: 'top',
        });
        py += 18;
      }

      py += 10;
      ctx.beginPath();
      ctx.roundRect(panelX, py, panelW * 0.85, 36, 6);
      ctx.fillStyle = 'rgba(110,180,255,0.06)';
      ctx.fill();
      drawText(ctx, 'AI is a tool — not a replacement for doctors', panelX + 10, py + 18, {
        fontSize: 10, color: PALETTE.text.accent,
      });

      ctx.globalAlpha = 1;
    }

    // ---- Controls ----
    const controlY = h - 48;
    state.toggleArea = drawToggle(ctx, state.on, w / 2 - 20, controlY, {
      off: 'Standard',
      on: 'AI-Augmented',
    });

    drawPhaseLabel(
      ctx,
      state.on
        ? 'AI highlights regions for radiologist review'
        : 'Standard mammogram as read by radiologist',
      w / 2,
      controlY - 24
    );
  }

  // ---- Helper: stat bar ----

  function drawStatBar(x: number, y: number, barW: number, label: string, value: number, color: string): number {
    drawText(ctx, label, x, y, {
      fontSize: 11, fontWeight: '600', color: PALETTE.text.secondary, baseline: 'top',
    });
    drawText(ctx, `${Math.round(value * 100)}%`, x + barW, y, {
      fontSize: 11, fontWeight: '600', color: PALETTE.text.primary, align: 'right', baseline: 'top',
    });

    const barY = y + 18;
    const barH = 6;

    // Track
    ctx.beginPath();
    ctx.roundRect(x, barY, barW, barH, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();

    // Fill
    ctx.beginPath();
    ctx.roundRect(x, barY, barW * value, barH, 3);
    ctx.fillStyle = color;
    ctx.fill();

    return barY + barH + 8;
  }

  function onPointerDown(x: number, y: number) {
    if (state.toggleArea && hitTest(x, y, state.toggleArea)) {
      state.on = !state.on;
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
    toggle: () => { state.on = !state.on; },
    getStage: () => state.on ? 1 : 0,
  };
}
