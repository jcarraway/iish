// ============================================================================
// T9 — Lumpectomy vs Mastectomy: Toggle Cross-Section Comparison
// Toggle between breast-conserving surgery (lumpectomy with margin) and
// full tissue removal (mastectomy). Shows margin concept and tissue preserved.
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawArrow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawToggle, drawPhaseLabel, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawWrappedText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface State {
  on: boolean; // false = lumpectomy, true = mastectomy
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
    particles: createParticleSystem(35, { width, height }),
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

    const cx = w * 0.38;
    const cy = h * 0.40;
    const breastR = Math.min(w, h) * 0.22;
    const tumorR = breastR * 0.18;
    const marginR = tumorR * 1.8;

    // ---- Draw breast cross-section ----
    // Outer breast tissue
    const tissueAlpha = 1 - t * 0.85; // mastectomy fades tissue

    ctx.globalAlpha = tissueAlpha;

    // Breast dome shape (half ellipse)
    ctx.beginPath();
    ctx.ellipse(cx, cy + breastR * 0.2, breastR, breastR * 1.1, 0, 0, Math.PI * 2);
    ctx.closePath();

    // Tissue gradient (skin to interior)
    const tissueGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, breastR);
    tissueGrad.addColorStop(0, 'rgba(255,210,180,0.12)');
    tissueGrad.addColorStop(0.6, 'rgba(255,190,160,0.08)');
    tissueGrad.addColorStop(0.85, 'rgba(200,150,130,0.06)');
    tissueGrad.addColorStop(1, 'rgba(180,130,110,0.15)');
    ctx.fillStyle = tissueGrad;
    ctx.fill();

    // Skin line
    ctx.strokeStyle = 'rgba(200,160,140,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Internal tissue structure (ducts)
    ctx.strokeStyle = 'rgba(200,160,140,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const innerR = breastR * 0.15;
      const outerR = breastR * 0.7;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      const cpx = cx + Math.cos(angle + 0.15) * outerR * 0.5;
      const cpy = cy + Math.sin(angle + 0.15) * outerR * 0.5;
      ctx.quadraticCurveTo(cpx, cpy, cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.stroke();
    }

    // Lobules (small circles at duct ends)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = breastR * 0.65;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,160,140,0.08)';
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    // ---- Tumor (always present until removed) ----
    const tumorX = cx + breastR * 0.15;
    const tumorY = cy - breastR * 0.1;

    // Lumpectomy: show margin ring
    if (t < 0.5) {
      // Margin ring (clear surgical boundary)
      const marginAlpha = 1 - t * 2;
      ctx.globalAlpha = marginAlpha;

      // Margin highlight zone
      ctx.beginPath();
      ctx.arc(tumorX, tumorY, marginR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(80,200,140,0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fill margin zone lightly
      ctx.beginPath();
      ctx.arc(tumorX, tumorY, marginR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(80,200,140,0.04)';
      ctx.fill();

      // Margin labels
      drawArrow(ctx,
        { x: tumorX + marginR + 4, y: tumorY },
        { x: tumorX + marginR + 28, y: tumorY },
        'rgba(80,200,140,0.5)', 1, 5
      );
      drawText(ctx, 'Margin', tumorX + marginR + 32, tumorY, {
        fontSize: 10, color: 'rgba(80,200,140,0.6)',
      });

      ctx.globalAlpha = 1;
    }

    // Tumor cell (fades in mastectomy as it is removed)
    const tumorAlpha = t < 0.5 ? 1 : clamp(1 - (t - 0.5) * 4, 0, 1);
    ctx.globalAlpha = tumorAlpha;
    drawCell(ctx, tumorX, tumorY, tumorR, {
      fill: PALETTE.cancer.fill,
      edge: PALETTE.cancer.edge,
      glow: PALETTE.cancer.glow,
    }, time, 2);
    drawNucleus(ctx, tumorX, tumorY, tumorR * 0.35, PALETTE.cancer.accent);
    ctx.globalAlpha = 1;

    // ---- Mastectomy: incision line ----
    if (t > 0.3) {
      const incisionAlpha = clamp((t - 0.3) * 2, 0, 0.7);
      ctx.globalAlpha = incisionAlpha;

      // Horizontal incision across the breast
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(255,100,80,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - breastR * 1.1, cy);
      ctx.lineTo(cx + breastR * 1.1, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cross marks at ends
      const crossSize = 5;
      const crossPositions = [cx - breastR * 1.1, cx + breastR * 1.1];
      for (const px of crossPositions) {
        ctx.beginPath();
        ctx.moveTo(px - crossSize, cy - crossSize);
        ctx.lineTo(px + crossSize, cy + crossSize);
        ctx.moveTo(px + crossSize, cy - crossSize);
        ctx.lineTo(px - crossSize, cy + crossSize);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    // ---- Removed area visualization ----
    if (t < 0.4) {
      // Lumpectomy: highlight what is removed (small circle)
      const removeAlpha = clamp(0.3 - t, 0, 0.3);
      ctx.globalAlpha = removeAlpha;
      ctx.beginPath();
      ctx.arc(tumorX, tumorY, marginR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,200,80,0.08)';
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ---- Right panel: procedure info ----
    const infoX = w * 0.65;
    const infoY = h * 0.12;
    const maxInfoW = w * 0.30;

    if (t < 0.5) {
      // Lumpectomy info
      const alpha = 1 - t * 2;
      ctx.globalAlpha = clamp(alpha, 0, 1);

      drawText(ctx, 'Lumpectomy', infoX, infoY, {
        fontSize: 18, fontWeight: 'bold', color: PALETTE.text.primary,
      });
      drawText(ctx, 'Breast-conserving surgery', infoX, infoY + 22, {
        fontSize: 12, color: PALETTE.text.accent,
      });

      let py = infoY + 48;
      py += drawWrappedText(ctx, 'Removes the tumor plus a small ring of healthy tissue (the margin). The rest of the breast is preserved.', infoX, py, maxInfoW, 18, {
        fontSize: 12, color: PALETTE.text.secondary,
      });
      py += 16;

      // Key points
      const points = [
        '\u2713 Preserves breast shape',
        '\u2713 Usually followed by radiation',
        '\u2713 Same survival as mastectomy for most',
        '\u2713 Shorter recovery time',
      ];
      for (const point of points) {
        drawText(ctx, point, infoX, py, {
          fontSize: 11, color: 'rgba(80,200,140,0.7)', baseline: 'top',
        });
        py += 18;
      }

      py += 10;
      ctx.beginPath();
      ctx.roundRect(infoX, py, maxInfoW, 36, 6);
      ctx.fillStyle = 'rgba(110,180,255,0.06)';
      ctx.fill();
      drawText(ctx, 'Clear margins = no cancer at edges', infoX + 10, py + 18, {
        fontSize: 11, color: PALETTE.text.accent,
      });

      ctx.globalAlpha = 1;
    } else {
      // Mastectomy info
      const alpha = (t - 0.5) * 2;
      ctx.globalAlpha = clamp(alpha, 0, 1);

      drawText(ctx, 'Mastectomy', infoX, infoY, {
        fontSize: 18, fontWeight: 'bold', color: PALETTE.text.primary,
      });
      drawText(ctx, 'Full tissue removal', infoX, infoY + 22, {
        fontSize: 12, color: PALETTE.cancer.label,
      });

      let py = infoY + 48;
      py += drawWrappedText(ctx, 'Removes all breast tissue, including the tumor. May be recommended for large tumors, multiple tumors, genetic risk (BRCA), or patient preference.', infoX, py, maxInfoW, 18, {
        fontSize: 12, color: PALETTE.text.secondary,
      });
      py += 16;

      const points = [
        '\u2022 All tissue removed',
        '\u2022 Radiation sometimes still needed',
        '\u2022 Reconstruction options available',
        '\u2022 Chosen for risk reduction (BRCA)',
      ];
      for (const point of points) {
        drawText(ctx, point, infoX, py, {
          fontSize: 11, color: PALETTE.text.secondary, baseline: 'top',
        });
        py += 18;
      }

      py += 10;
      ctx.beginPath();
      ctx.roundRect(infoX, py, maxInfoW, 36, 6);
      ctx.fillStyle = 'rgba(230,100,80,0.06)';
      ctx.fill();
      drawText(ctx, 'Neither option is inherently better', infoX + 10, py + 18, {
        fontSize: 11, color: PALETTE.cancer.label,
      });

      ctx.globalAlpha = 1;
    }

    // ---- Tissue preservation bar ----
    const barX = cx - breastR;
    const barY = cy + breastR * 1.35;
    const barW = breastR * 2;
    const barH = 8;
    const preserved = 1 - t * 0.95; // lumpectomy ~100%, mastectomy ~5%

    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * preserved, barH, 4);
    ctx.fillStyle = preserved > 0.5
      ? 'rgba(80,200,140,0.3)'
      : 'rgba(230,100,80,0.3)';
    ctx.fill();

    drawText(ctx, `Tissue preserved: ${Math.round(preserved * 100)}%`, cx, barY + barH + 14, {
      fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
    });

    // ---- Controls ----
    const controlY = h - 48;
    state.toggleArea = drawToggle(ctx, state.on, w / 2 - 20, controlY, {
      off: 'Lumpectomy',
      on: 'Mastectomy',
    });

    drawPhaseLabel(
      ctx,
      state.on
        ? 'All breast tissue is removed with the tumor'
        : 'Only the tumor and surrounding margin are removed',
      w / 2,
      controlY - 24
    );
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
