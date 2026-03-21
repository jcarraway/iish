// ============================================================================
// D3 — Pathology Report: Explorable Clickable Fields
// Click fields to see explanations — Grade, Stage, ER/PR/HER2, Ki-67, etc.
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawGlow, lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawWrappedText, drawBadge, measureText } from '../framework/text';
import type { ParticleSystem } from '../framework/particles';

interface ReportField {
  id: string;
  label: string;
  value: string;
  meaning: string;
  whyItMatters: string;
  goodRange: string;
  concerningRange: string;
}

const FIELDS: ReportField[] = [
  {
    id: 'grade',
    label: 'Histologic Grade',
    value: 'Grade 2 (Moderately differentiated)',
    meaning: 'How abnormal the cancer cells look under a microscope, scored 1-3.',
    whyItMatters: 'Higher grade means faster-growing cells. Helps determine how aggressive treatment needs to be.',
    goodRange: 'Grade 1 — slow growing',
    concerningRange: 'Grade 3 — fast growing',
  },
  {
    id: 'stage',
    label: 'Pathologic Stage',
    value: 'pT2 N1mi M0 — Stage IIA',
    meaning: 'T = tumor size (2 = 2-5cm), N = lymph nodes (1mi = micrometastasis), M = distant spread (0 = none).',
    whyItMatters: 'Stage determines treatment intensity and gives a baseline for prognosis discussions.',
    goodRange: 'T1 N0 M0 — small, no spread',
    concerningRange: 'T3+ or N2+ — larger or more nodes',
  },
  {
    id: 'er',
    label: 'ER Status',
    value: 'Positive (95%, Allred 8/8)',
    meaning: 'Estrogen receptor: the cancer cells have receptors that respond to estrogen.',
    whyItMatters: 'ER+ cancers can be treated with hormone-blocking therapies (tamoxifen, aromatase inhibitors).',
    goodRange: 'Positive — more treatment options',
    concerningRange: 'Negative — hormone therapy won\'t work',
  },
  {
    id: 'pr',
    label: 'PR Status',
    value: 'Positive (80%)',
    meaning: 'Progesterone receptor: another hormone receptor. Usually correlates with ER.',
    whyItMatters: 'Confirms hormone sensitivity. Double-positive (ER+/PR+) has better outcomes than ER+/PR-.',
    goodRange: 'Positive — confirms hormone sensitivity',
    concerningRange: 'Negative with ER+ — slightly less favorable',
  },
  {
    id: 'her2',
    label: 'HER2 Status',
    value: 'Negative (IHC 1+, FISH not amplified)',
    meaning: 'HER2 protein level on cell surface. IHC 1+ is now called "HER2-low."',
    whyItMatters: 'HER2-low is a new category — you may be eligible for Enhertu (T-DXd), a breakthrough ADC therapy.',
    goodRange: '0 or 1+ — less aggressive',
    concerningRange: '3+ — aggressive but highly treatable with targeted therapy',
  },
  {
    id: 'ki67',
    label: 'Ki-67 Index',
    value: '22%',
    meaning: 'The percentage of cancer cells actively dividing. A marker of how fast the tumor is growing.',
    whyItMatters: 'Higher Ki-67 may indicate benefit from chemotherapy. Helps decide between chemo vs. hormone therapy alone.',
    goodRange: '<15% — slow proliferation',
    concerningRange: '>30% — rapid proliferation',
  },
  {
    id: 'margins',
    label: 'Surgical Margins',
    value: 'Negative (closest margin 3mm)',
    meaning: 'Whether cancer cells were found at the edge of the removed tissue.',
    whyItMatters: 'Negative margins mean the surgeon removed all visible cancer. Positive margins may require re-excision.',
    goodRange: 'Negative (>2mm) — clear margins',
    concerningRange: 'Positive — cancer at the edge',
  },
  {
    id: 'lymph',
    label: 'Lymph Nodes',
    value: '1/3 positive (micrometastasis)',
    meaning: '1 of 3 removed lymph nodes contained a tiny cancer deposit (<2mm).',
    whyItMatters: 'Lymph node status is the strongest predictor of whether cancer has started to spread.',
    goodRange: '0 positive — no spread to nodes',
    concerningRange: '4+ positive — more extensive spread',
  },
];

interface FieldLayout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface State {
  selected: number | null; // index of selected field
  hovered: number | null;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  fieldLayouts: FieldLayout[];
  selectedGlow: number; // 0-1 animation
}

export function init(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SceneAPI {
  const state: State = {
    selected: null,
    hovered: null,
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(30, { width, height }),
    fieldLayouts: [],
    selectedGlow: 0,
  };

  function computeFieldLayouts() {
    const { w, h } = state;
    const reportX = w * 0.04;
    const reportW = state.selected !== null ? w * 0.44 : w * 0.92;
    const startY = h * 0.06;
    const rowH = (h * 0.78) / FIELDS.length;
    const layouts: FieldLayout[] = [];

    for (let i = 0; i < FIELDS.length; i++) {
      layouts.push({
        id: FIELDS[i].id,
        x: reportX,
        y: startY + i * rowH,
        w: reportW,
        h: rowH - 4,
      });
    }
    state.fieldLayouts = layouts;
  }

  computeFieldLayouts();

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);

    // Glow animation
    const targetGlow = state.selected !== null ? 1 : 0;
    state.selectedGlow = lerp(state.selectedGlow, targetGlow, dt * 4);

    render();
  }

  function render() {
    const { w, h, time, selected, hovered } = state;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    computeFieldLayouts();

    // ---- Report header ----
    drawText(ctx, 'SURGICAL PATHOLOGY REPORT', w * 0.04, (state.fieldLayouts[0]?.y ?? 42) - 22, {
      fontSize: 11,
      fontWeight: '600',
      color: PALETTE.text.tertiary,
      baseline: 'bottom',
    });

    // ---- Report fields ----
    for (let i = 0; i < FIELDS.length; i++) {
      const field = FIELDS[i];
      const layout = state.fieldLayouts[i];
      const isSelected = selected === i;
      const isHovered = hovered === i;

      // Background
      ctx.beginPath();
      ctx.roundRect(layout.x, layout.y, layout.w, layout.h, 6);

      if (isSelected) {
        ctx.fillStyle = 'rgba(110,180,255,0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(110,180,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (isHovered) {
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.01)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Label
      const labelY = layout.y + layout.h * 0.35;
      const valueY = layout.y + layout.h * 0.7;

      drawText(ctx, field.label, layout.x + 12, labelY, {
        fontSize: 11,
        fontWeight: '600',
        color: isSelected ? PALETTE.text.accent : PALETTE.text.secondary,
      });

      // Value
      drawText(ctx, field.value, layout.x + 12, valueY, {
        fontSize: 12,
        color: isSelected ? PALETTE.text.primary : PALETTE.text.secondary,
        maxWidth: layout.w - 24,
      });

      // Click indicator
      if (!isSelected) {
        drawText(ctx, '\u2192', layout.x + layout.w - 20, layout.y + layout.h / 2, {
          fontSize: 12,
          color: isHovered ? PALETTE.text.secondary : PALETTE.text.tertiary,
          align: 'center',
        });
      }
    }

    // ---- Detail panel (when field selected) ----
    if (selected !== null && state.selectedGlow > 0.1) {
      const field = FIELDS[selected];
      const panelX = w * 0.52;
      const panelY = h * 0.06;
      const panelW = w * 0.44;
      const panelH = h * 0.82;

      ctx.globalAlpha = clamp(state.selectedGlow, 0, 1);

      // Panel background
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelW, panelH, 10);
      ctx.fillStyle = 'rgba(15,20,30,0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(110,180,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glow effect
      drawGlow(ctx, panelX + panelW / 2, panelY + 30, 40, 'rgba(110,180,255,0.15)', 0.3, time);

      let py = panelY + 20;
      const px = panelX + 18;
      const maxW = panelW - 36;

      // Field name
      drawText(ctx, field.label, px, py, {
        fontSize: 16, fontWeight: 'bold', color: PALETTE.text.primary, baseline: 'top',
      });
      py += 24;

      // Value badge
      drawBadge(ctx, field.value, px, py, 'rgba(110,180,255,0.12)', PALETTE.text.accent, 11);
      py += 32;

      // Meaning
      drawText(ctx, 'What it means', px, py, {
        fontSize: 11, fontWeight: '600', color: PALETTE.text.accent, baseline: 'top',
      });
      py += 18;
      py += drawWrappedText(ctx, field.meaning, px, py, maxW, 18, {
        fontSize: 12, color: PALETTE.text.secondary,
      });
      py += 14;

      // Why it matters
      drawText(ctx, 'Why it matters', px, py, {
        fontSize: 11, fontWeight: '600', color: PALETTE.text.accent, baseline: 'top',
      });
      py += 18;
      py += drawWrappedText(ctx, field.whyItMatters, px, py, maxW, 18, {
        fontSize: 12, color: PALETTE.text.secondary,
      });
      py += 14;

      // Good range
      ctx.beginPath();
      ctx.roundRect(px, py, maxW, 36, 6);
      ctx.fillStyle = 'rgba(80,200,140,0.08)';
      ctx.fill();
      drawText(ctx, '\u2713 ' + field.goodRange, px + 10, py + 18, {
        fontSize: 11, color: 'rgba(80,200,140,0.8)',
      });
      py += 44;

      // Concerning range
      ctx.beginPath();
      ctx.roundRect(px, py, maxW, 36, 6);
      ctx.fillStyle = 'rgba(240,100,80,0.08)';
      ctx.fill();
      drawText(ctx, '\u26A0 ' + field.concerningRange, px + 10, py + 18, {
        fontSize: 11, color: 'rgba(240,100,80,0.8)',
      });

      ctx.globalAlpha = 1;
    }

    // ---- Instruction ----
    if (selected === null) {
      drawText(ctx, 'Click any field to learn more', w / 2, h - 20, {
        fontSize: 12, color: PALETTE.text.tertiary, align: 'center',
      });
    } else {
      drawText(ctx, 'Click another field or click again to close', w / 2, h - 20, {
        fontSize: 12, color: PALETTE.text.tertiary, align: 'center',
      });
    }
  }

  function onPointerDown(x: number, y: number) {
    for (let i = 0; i < state.fieldLayouts.length; i++) {
      const layout = state.fieldLayouts[i];
      if (x >= layout.x && x <= layout.x + layout.w &&
          y >= layout.y && y <= layout.y + layout.h) {
        if (state.selected === i) {
          state.selected = null;
        } else {
          state.selected = i;
        }
        return;
      }
    }
    // Click outside fields — deselect
    if (state.selected !== null) {
      state.selected = null;
    }
  }

  function onPointerMove(x: number, y: number) {
    let found = false;
    for (let i = 0; i < state.fieldLayouts.length; i++) {
      const layout = state.fieldLayouts[i];
      if (x >= layout.x && x <= layout.x + layout.w &&
          y >= layout.y && y <= layout.y + layout.h) {
        state.hovered = i;
        found = true;
        break;
      }
    }
    if (!found) state.hovered = null;
  }

  return {
    update,
    destroy: () => {},
    resize: (w, h) => {
      state.w = w;
      state.h = h;
      resizeParticleSystem(state.particles, w, h);
      computeFieldLayouts();
    },
    onPointerDown,
    onPointerMove,
    nextStage: () => {
      const next = state.selected === null ? 0 : (state.selected + 1) % FIELDS.length;
      state.selected = next;
    },
    prevStage: () => {
      const prev = state.selected === null ? FIELDS.length - 1 : (state.selected - 1 + FIELDS.length) % FIELDS.length;
      state.selected = prev;
    },
    getStage: () => state.selected ?? -1,
  };
}
