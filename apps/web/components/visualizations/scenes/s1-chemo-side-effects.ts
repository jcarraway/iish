// ============================================================================
// S1 — Chemo Side Effects: Explorable Body Diagram
// Click 5 body regions to learn why chemo affects each fast-dividing tissue
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawWrappedText } from '../framework/text';
import type { ParticleSystem } from '../framework/particles';

interface BodyRegion {
  id: string;
  label: string;
  hitY: [number, number]; // top/bottom as fraction of body height
  hitX: [number, number]; // left/right as fraction of body width
  color: string;
  title: string;
  mechanism: string;
  symptoms: string[];
  recovery: string;
}

const REGIONS: BodyRegion[] = [
  {
    id: 'hair',
    label: 'Hair',
    hitY: [0, 0.12],
    hitX: [0.3, 0.7],
    color: 'rgba(200,170,100,0.5)',
    title: 'Hair Follicles',
    mechanism: 'Hair follicle cells divide every 23-72 hours — one of the fastest in the body. Chemo disrupts this rapid division.',
    symptoms: ['Hair thinning or complete loss', 'Usually starts 2-3 weeks after first cycle', 'Affects scalp, eyebrows, eyelashes'],
    recovery: 'Hair typically begins regrowth 3-6 months after treatment ends. Texture and color may change initially.',
  },
  {
    id: 'mouth',
    label: 'Mouth',
    hitY: [0.12, 0.2],
    hitX: [0.3, 0.7],
    color: 'rgba(200,120,140,0.5)',
    title: 'Oral Mucosa',
    mechanism: 'The mouth lining renews every 7-14 days. Chemo kills these rapidly dividing cells, causing mucositis.',
    symptoms: ['Mouth sores (mucositis)', 'Difficulty swallowing', 'Altered taste sensation'],
    recovery: 'Sores heal within 2-4 weeks after treatment cycle. Good oral care can reduce severity.',
  },
  {
    id: 'gut',
    label: 'Gut',
    hitY: [0.32, 0.52],
    hitX: [0.3, 0.7],
    color: 'rgba(200,160,100,0.5)',
    title: 'Gut Lining',
    mechanism: 'The intestinal lining replaces itself every 3-5 days — the fastest renewal rate of any organ. Chemo disrupts this.',
    symptoms: ['Nausea and vomiting', 'Diarrhea or constipation', 'Loss of appetite'],
    recovery: 'GI symptoms improve between cycles. Anti-nausea medications have dramatically improved quality of life.',
  },
  {
    id: 'marrow',
    label: 'Bone Marrow',
    hitY: [0.2, 0.4],
    hitX: [0.1, 0.3],
    color: 'rgba(180,100,140,0.5)',
    title: 'Bone Marrow',
    mechanism: 'Bone marrow produces billions of blood cells daily. Chemo suppresses this, affecting all blood cell lines.',
    symptoms: ['Fatigue (low red cells)', 'Infection risk (low white cells)', 'Bruising (low platelets)'],
    recovery: 'Counts typically recover before each cycle (nadir at day 7-14). Growth factors can help.',
  },
  {
    id: 'nails',
    label: 'Nails',
    hitY: [0.62, 0.72],
    hitX: [0.1, 0.25],
    color: 'rgba(160,140,120,0.5)',
    title: 'Nail Beds',
    mechanism: 'Nail matrix cells divide continuously. Chemo can disrupt the growth pattern, leaving visible marks.',
    symptoms: ['Beau\'s lines (horizontal ridges)', 'Darkening or discoloration', 'Brittleness or loosening'],
    recovery: 'Nails grow slowly (~3mm/month), so changes are visible for months. Healthy nail eventually grows out.',
  },
];

interface RegionLayout {
  cx: number;
  cy: number;
  hitArea: { x: number; y: number; w: number; h: number };
}

interface State {
  selected: number | null;
  hovered: number | null;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  selectedGlow: number;
  layouts: RegionLayout[];
  bodyX: number;
  bodyY: number;
  bodyW: number;
  bodyH: number;
}

export function init(
  _canvas: HTMLCanvasElement,
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
    selectedGlow: 0,
    layouts: [],
    bodyX: 0, bodyY: 0, bodyW: 0, bodyH: 0,
  };

  function computeLayouts() {
    const { w, h } = state;
    const hasDetail = state.selected !== null;
    state.bodyX = hasDetail ? w * 0.08 : w * 0.3;
    state.bodyY = h * 0.06;
    state.bodyW = hasDetail ? w * 0.25 : w * 0.4;
    state.bodyH = h * 0.72;

    state.layouts = REGIONS.map(region => {
      const cx = state.bodyX + state.bodyW * (region.hitX[0] + region.hitX[1]) / 2;
      const cy = state.bodyY + state.bodyH * (region.hitY[0] + region.hitY[1]) / 2;
      return {
        cx,
        cy,
        hitArea: {
          x: state.bodyX + state.bodyW * region.hitX[0],
          y: state.bodyY + state.bodyH * region.hitY[0],
          w: state.bodyW * (region.hitX[1] - region.hitX[0]),
          h: state.bodyH * (region.hitY[1] - region.hitY[0]),
        },
      };
    });
  }

  computeLayouts();

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);

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

    computeLayouts();

    // ---- Stylized body outline ----
    const bx = state.bodyX;
    const by = state.bodyY;
    const bw = state.bodyW;
    const bh = state.bodyH;

    // Head
    const headCx = bx + bw * 0.5;
    const headCy = by + bh * 0.06;
    const headR = bw * 0.09;
    ctx.beginPath();
    ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Torso
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.3, by + bh * 0.13);
    ctx.lineTo(bx + bw * 0.7, by + bh * 0.13);
    ctx.lineTo(bx + bw * 0.65, by + bh * 0.55);
    ctx.lineTo(bx + bw * 0.35, by + bh * 0.55);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.3, by + bh * 0.15);
    ctx.lineTo(bx + bw * 0.1, by + bh * 0.45);
    ctx.lineTo(bx + bw * 0.08, by + bh * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.7, by + bh * 0.15);
    ctx.lineTo(bx + bw * 0.9, by + bh * 0.45);
    ctx.lineTo(bx + bw * 0.92, by + bh * 0.55);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.4, by + bh * 0.55);
    ctx.lineTo(bx + bw * 0.35, by + bh * 0.85);
    ctx.lineTo(bx + bw * 0.3, by + bh * 0.95);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.6, by + bh * 0.55);
    ctx.lineTo(bx + bw * 0.65, by + bh * 0.85);
    ctx.lineTo(bx + bw * 0.7, by + bh * 0.95);
    ctx.stroke();

    // ---- Clickable regions ----
    for (let i = 0; i < REGIONS.length; i++) {
      const region = REGIONS[i];
      const layout = state.layouts[i];
      const isSelected = selected === i;
      const isHovered = hovered === i;

      // Highlight circle
      const radius = Math.min(layout.hitArea.w, layout.hitArea.h) * 0.4;
      if (isSelected) {
        drawGlow(ctx, layout.cx, layout.cy, radius * 2, region.color, 0.6, time);
        ctx.beginPath();
        ctx.arc(layout.cx, layout.cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = region.color.replace('0.5)', '0.2)');
        ctx.fill();
        ctx.strokeStyle = region.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (isHovered) {
        ctx.beginPath();
        ctx.arc(layout.cx, layout.cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = region.color.replace('0.5)', '0.1)');
        ctx.fill();
        ctx.strokeStyle = region.color.replace('0.5)', '0.3)');
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Subtle dot
        ctx.beginPath();
        ctx.arc(layout.cx, layout.cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = region.color.replace('0.5)', '0.3)');
        ctx.fill();
      }

      // Label
      drawText(ctx, region.label, layout.cx, layout.cy + radius + 10, {
        fontSize: 10,
        color: isSelected ? region.color : PALETTE.text.tertiary,
        align: 'center',
      });
    }

    // ---- Detail panel ----
    if (selected !== null && state.selectedGlow > 0.1) {
      const region = REGIONS[selected];
      const panelX = w * 0.42;
      const panelY = h * 0.06;
      const panelW = w * 0.54;
      const panelH = h * 0.72;

      ctx.globalAlpha = clamp(state.selectedGlow, 0, 1);

      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelW, panelH, 10);
      ctx.fillStyle = 'rgba(15,20,30,0.95)';
      ctx.fill();
      ctx.strokeStyle = region.color.replace('0.5)', '0.2)');
      ctx.lineWidth = 1;
      ctx.stroke();

      let py = panelY + 20;
      const px = panelX + 18;
      const maxW = panelW - 36;

      drawText(ctx, region.title, px, py, {
        fontSize: 16, fontWeight: 'bold', color: PALETTE.text.primary, baseline: 'top',
      });
      py += 26;

      // Why it's affected
      drawText(ctx, 'Why chemo affects this', px, py, {
        fontSize: 11, fontWeight: '600', color: PALETTE.text.accent, baseline: 'top',
      });
      py += 18;
      py += drawWrappedText(ctx, region.mechanism, px, py, maxW, 18, {
        fontSize: 12, color: PALETTE.text.secondary,
      });
      py += 14;

      // Symptoms
      drawText(ctx, 'Common symptoms', px, py, {
        fontSize: 11, fontWeight: '600', color: PALETTE.text.accent, baseline: 'top',
      });
      py += 18;
      for (const s of region.symptoms) {
        drawText(ctx, `\u2022 ${s}`, px + 4, py, {
          fontSize: 11, color: PALETTE.text.secondary, baseline: 'top',
        });
        py += 16;
      }
      py += 10;

      // Recovery
      ctx.beginPath();
      ctx.roundRect(px, py, maxW, 50, 6);
      ctx.fillStyle = 'rgba(80,200,140,0.06)';
      ctx.fill();
      drawText(ctx, 'Recovery', px + 10, py + 8, {
        fontSize: 10, fontWeight: '600', color: 'rgba(80,200,140,0.8)', baseline: 'top',
      });
      drawWrappedText(ctx, region.recovery, px + 10, py + 24, maxW - 20, 16, {
        fontSize: 11, color: 'rgba(80,200,140,0.7)',
      });

      ctx.globalAlpha = 1;
    }

    // ---- Instruction ----
    if (selected === null) {
      drawText(ctx, 'Click a body region to learn why chemo affects it', w / 2, h - 20, {
        fontSize: 12, color: PALETTE.text.tertiary, align: 'center',
      });
    } else {
      drawText(ctx, 'Click another region or click again to close', w / 2, h - 20, {
        fontSize: 12, color: PALETTE.text.tertiary, align: 'center',
      });
    }
  }

  function onPointerDown(x: number, y: number) {
    for (let i = 0; i < state.layouts.length; i++) {
      const ha = state.layouts[i].hitArea;
      if (x >= ha.x && x <= ha.x + ha.w && y >= ha.y && y <= ha.y + ha.h) {
        state.selected = state.selected === i ? null : i;
        return;
      }
    }
    if (state.selected !== null) state.selected = null;
  }

  function onPointerMove(x: number, y: number) {
    let found = false;
    for (let i = 0; i < state.layouts.length; i++) {
      const ha = state.layouts[i].hitArea;
      if (x >= ha.x && x <= ha.x + ha.w && y >= ha.y && y <= ha.y + ha.h) {
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
      computeLayouts();
    },
    onPointerDown,
    onPointerMove,
    nextStage: () => {
      const next = state.selected === null ? 0 : (state.selected + 1) % REGIONS.length;
      state.selected = next;
    },
    prevStage: () => {
      const prev = state.selected === null ? REGIONS.length - 1 : (state.selected - 1 + REGIONS.length) % REGIONS.length;
      state.selected = prev;
    },
    getStage: () => state.selected ?? -1,
  };
}
