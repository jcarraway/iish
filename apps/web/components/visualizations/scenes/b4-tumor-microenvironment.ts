// ============================================================================
// B4 — Tumor Microenvironment: Explorable Ecosystem
// Click elements to learn about T-cells, fibroblasts, blood vessels,
// immunosuppressive molecules, and extracellular matrix surrounding a tumor
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawGlow, drawMolecule,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawWrappedText, drawBadge } from '../framework/text';
import type { ParticleSystem } from '../framework/particles';

// ---------------------------------------------------------------------------
// Element data
// ---------------------------------------------------------------------------

interface TMEElement {
  id: string;
  label: string;
  role: string;
  cancerEffect: string;
  clinicalNote: string;
  // Position offset from center (fractions of cellRadius)
  offsetX: number;
  offsetY: number;
  // Rendering hints
  color: { fill: string; edge: string; glow: string };
  shapeType: 'cell' | 'molecule' | 'vessel' | 'matrix';
  size: number; // relative size multiplier
}

const ELEMENTS: TMEElement[] = [
  {
    id: 'tcell',
    label: 'T-Cells (TILs)',
    role: 'Tumor-infiltrating lymphocytes that attempt to recognize and kill cancer cells. Their presence generally indicates the immune system is fighting the tumor.',
    cancerEffect: 'Cancer cells suppress T-cells through PD-L1 and immunosuppressive molecules, causing exhaustion. More TILs often means better immunotherapy response.',
    clinicalNote: 'TIL density is used to predict immunotherapy response, especially in triple-negative and HER2+ breast cancer.',
    offsetX: -2.4,
    offsetY: -0.8,
    color: { fill: PALETTE.immune.fill, edge: PALETTE.immune.edge, glow: PALETTE.immune.glow },
    shapeType: 'cell',
    size: 0.35,
  },
  {
    id: 'fibroblast',
    label: 'Cancer-Associated Fibroblasts (CAFs)',
    role: 'Structural cells hijacked by the tumor. They produce growth factors, remodel tissue, and create a protective scaffold around the tumor.',
    cancerEffect: 'CAFs secrete collagen that forms a physical barrier, blocking immune cells and drugs from reaching cancer cells. They also release growth signals.',
    clinicalNote: 'High CAF density correlates with treatment resistance. New therapies target CAF-secreted factors like FAP.',
    offsetX: 2.3,
    offsetY: -1.2,
    color: { fill: 'rgba(200,170,100,0.2)', edge: 'rgba(200,170,100,0.35)', glow: 'rgba(200,170,100,0.12)' },
    shapeType: 'cell',
    size: 0.42,
  },
  {
    id: 'vessel',
    label: 'Tumor Blood Vessels',
    role: 'Abnormal, leaky blood vessels formed through angiogenesis. They supply nutrients and oxygen to the growing tumor but are disorganized.',
    cancerEffect: 'Tumor vessels are chaotic: leaky walls, inconsistent flow. This creates low-oxygen zones and makes it hard for drugs and immune cells to penetrate evenly.',
    clinicalNote: 'Anti-angiogenic drugs (bevacizumab) normalize vessels. Paradoxically, pruning vessels can improve drug delivery.',
    offsetX: 1.8,
    offsetY: 1.8,
    color: { fill: 'rgba(200,60,60,0.2)', edge: 'rgba(200,60,60,0.4)', glow: 'rgba(200,60,60,0.1)' },
    shapeType: 'vessel',
    size: 0.5,
  },
  {
    id: 'suppressive',
    label: 'Immunosuppressive Molecules',
    role: 'Chemical signals (TGF-beta, IL-10, PGE2) released by cancer and stromal cells that shut down immune responses in the microenvironment.',
    cancerEffect: 'These molecules create an "immune desert" — even when immune cells arrive, they are deactivated. They also recruit regulatory T-cells that further suppress immunity.',
    clinicalNote: 'Combining checkpoint inhibitors with TGF-beta blockers is an active area of clinical trials.',
    offsetX: -2.0,
    offsetY: 1.6,
    color: { fill: 'rgba(255,80,80,0.25)', edge: 'rgba(255,80,80,0.4)', glow: 'rgba(255,80,80,0.12)' },
    shapeType: 'molecule',
    size: 0.2,
  },
  {
    id: 'matrix',
    label: 'Extracellular Matrix (ECM)',
    role: 'A dense meshwork of collagen, fibronectin, and other proteins surrounding the tumor. It provides structural support and stores growth factors.',
    cancerEffect: 'Stiffened ECM promotes cancer invasion and blocks immune cell migration. Cancer cells remodel the ECM to create escape routes for metastasis.',
    clinicalNote: 'ECM stiffness can be measured on imaging. Dense tissue correlates with higher breast cancer risk and treatment resistance.',
    offsetX: 0.0,
    offsetY: 2.6,
    color: { fill: 'rgba(140,160,180,0.15)', edge: 'rgba(140,160,180,0.3)', glow: 'rgba(140,160,180,0.08)' },
    shapeType: 'matrix',
    size: 0.5,
  },
];

// ---------------------------------------------------------------------------
// Hit area for each ecosystem element
// ---------------------------------------------------------------------------

interface ElementLayout {
  id: string;
  cx: number;
  cy: number;
  radius: number;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface State {
  selected: number | null;
  hovered: number | null;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  layouts: ElementLayout[];
  selectedGlow: number;
  centerX: number;
  centerY: number;
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
    selected: null,
    hovered: null,
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(40, { width, height }),
    layouts: [],
    selectedGlow: 0,
    centerX: width * 0.5,
    centerY: height * 0.42,
  };

  function computeLayouts() {
    const { w, h, selected } = state;
    const coreR = Math.min(w, h) * 0.1;
    // When a panel is open shift everything left
    const cx = selected !== null ? w * 0.3 : w * 0.5;
    const cy = h * 0.42;
    state.centerX = cx;
    state.centerY = cy;

    const layouts: ElementLayout[] = [];
    for (const el of ELEMENTS) {
      const elemRadius = coreR * el.size;
      layouts.push({
        id: el.id,
        cx: cx + el.offsetX * coreR,
        cy: cy + el.offsetY * coreR,
        radius: elemRadius,
      });
    }
    state.layouts = layouts;
  }

  computeLayouts();

  // ---- Update / Render ----

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

    const coreR = Math.min(w, h) * 0.1;

    // ---- ECM background web (drawn first, behind everything) ----
    drawECMBackground(coreR);

    // ---- Central cancer cell ----
    drawCell(ctx, state.centerX, state.centerY, coreR, {
      fill: PALETTE.cancer.fill,
      edge: PALETTE.cancer.edge,
      glow: PALETTE.cancer.glow,
    }, time, 3);
    drawNucleus(ctx, state.centerX, state.centerY, coreR * 0.35, PALETTE.cancer.accent);
    drawText(ctx, 'Tumor', state.centerX, state.centerY + coreR + 14, {
      fontSize: 11,
      fontWeight: '600',
      color: PALETTE.cancer.label,
      align: 'center',
    });

    // ---- Draw ecosystem elements ----
    for (let i = 0; i < ELEMENTS.length; i++) {
      const el = ELEMENTS[i];
      const layout = state.layouts[i];
      const isSelected = selected === i;
      const isHovered = hovered === i;

      // Highlight glow when selected/hovered
      if (isSelected || isHovered) {
        drawGlow(ctx, layout.cx, layout.cy, layout.radius * 3,
          el.color.glow, isSelected ? 0.8 : 0.4, time);
      }

      // Draw shape based on type
      if (el.shapeType === 'cell') {
        drawCell(ctx, layout.cx, layout.cy, layout.radius, el.color, time, 2);
        drawNucleus(ctx, layout.cx, layout.cy, layout.radius * 0.3, el.color.edge);
      } else if (el.shapeType === 'vessel') {
        drawVessel(layout.cx, layout.cy, layout.radius, el.color, time);
      } else if (el.shapeType === 'molecule') {
        drawSuppressiveMolecules(layout.cx, layout.cy, layout.radius, el.color, time);
      } else if (el.shapeType === 'matrix') {
        drawMatrixCluster(layout.cx, layout.cy, layout.radius, el.color, time);
      }

      // Draw connecting line to tumor
      const dist = Math.sqrt(
        (layout.cx - state.centerX) ** 2 + (layout.cy - state.centerY) ** 2
      );
      if (dist > coreR + layout.radius + 4) {
        const angle = Math.atan2(layout.cy - state.centerY, layout.cx - state.centerX);
        const fromX = state.centerX + Math.cos(angle) * (coreR + 4);
        const fromY = state.centerY + Math.sin(angle) * (coreR + 4);
        const toX = layout.cx - Math.cos(angle) * (layout.radius + 4);
        const toY = layout.cy - Math.sin(angle) * (layout.radius + 4);

        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = isSelected
          ? 'rgba(110,180,255,0.25)'
          : isHovered
            ? 'rgba(255,255,255,0.12)'
            : 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Label
      const labelY = layout.cy + layout.radius + 14;
      drawText(ctx, el.label.split('(')[0].trim(), layout.cx, labelY, {
        fontSize: 10,
        color: isSelected ? PALETTE.text.accent : isHovered ? PALETTE.text.secondary : PALETTE.text.tertiary,
        align: 'center',
      });
    }

    // ---- Detail panel ----
    if (selected !== null && state.selectedGlow > 0.1) {
      const el = ELEMENTS[selected];
      const panelX = w * 0.56;
      const panelY = h * 0.06;
      const panelW = w * 0.40;
      const panelH = h * 0.84;

      ctx.globalAlpha = clamp(state.selectedGlow, 0, 1);

      // Background
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelW, panelH, 10);
      ctx.fillStyle = 'rgba(15,20,30,0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(110,180,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawGlow(ctx, panelX + panelW / 2, panelY + 30, 40, 'rgba(110,180,255,0.15)', 0.3, time);

      let py = panelY + 20;
      const px = panelX + 18;
      const maxW = panelW - 36;

      // Title
      drawText(ctx, el.label, px, py, {
        fontSize: 15, fontWeight: 'bold', color: PALETTE.text.primary, baseline: 'top',
      });
      py += 26;

      // Badge
      const badgeColor = el.id === 'tcell' ? 'rgba(140,130,230,0.15)' : 'rgba(200,170,100,0.15)';
      const badgeFg = el.id === 'tcell' ? PALETTE.immune.label : PALETTE.text.accent;
      const badgeLabel = el.id === 'tcell' ? 'Immune' :
                         el.id === 'fibroblast' ? 'Stromal' :
                         el.id === 'vessel' ? 'Vascular' :
                         el.id === 'suppressive' ? 'Signaling' : 'Structural';
      drawBadge(ctx, badgeLabel, px, py, badgeColor, badgeFg, 10);
      py += 28;

      // Role
      drawText(ctx, 'Role in the microenvironment', px, py, {
        fontSize: 11, fontWeight: '600', color: PALETTE.text.accent, baseline: 'top',
      });
      py += 16;
      py += drawWrappedText(ctx, el.role, px, py, maxW, 16, {
        fontSize: 12, color: PALETTE.text.secondary,
      });
      py += 12;

      // Cancer effect
      drawText(ctx, 'How cancer exploits it', px, py, {
        fontSize: 11, fontWeight: '600', color: PALETTE.cancer.label, baseline: 'top',
      });
      py += 16;
      py += drawWrappedText(ctx, el.cancerEffect, px, py, maxW, 16, {
        fontSize: 12, color: PALETTE.text.secondary,
      });
      py += 12;

      // Clinical note
      ctx.beginPath();
      ctx.roundRect(px, py, maxW, 56, 6);
      ctx.fillStyle = 'rgba(80,200,140,0.06)';
      ctx.fill();
      drawText(ctx, 'Clinical relevance', px + 10, py + 10, {
        fontSize: 10, fontWeight: '600', color: 'rgba(80,200,140,0.7)', baseline: 'top',
      });
      drawWrappedText(ctx, el.clinicalNote, px + 10, py + 24, maxW - 20, 15, {
        fontSize: 11, color: 'rgba(80,200,140,0.6)',
      });

      ctx.globalAlpha = 1;
    }

    // ---- Instruction ----
    const instrText = selected === null
      ? 'Click any element to explore its role'
      : 'Click another element or click again to close';
    drawText(ctx, instrText, w * (selected !== null ? 0.3 : 0.5), h - 18, {
      fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
    });
  }

  // ---- Helper renderers ----

  function drawECMBackground(coreR: number) {
    const { centerX: cx, centerY: cy, time } = state;
    ctx.strokeStyle = 'rgba(140,160,180,0.04)';
    ctx.lineWidth = 1;
    // Draw fibrous lines radiating out
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + Math.sin(time * 0.3) * 0.02;
      const innerR = coreR * 1.6;
      const outerR = coreR * 3.5 + Math.sin(i * 1.7 + time * 0.5) * 8;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.stroke();
    }
    // Concentric rings
    ctx.strokeStyle = 'rgba(140,160,180,0.03)';
    for (let r = 2; r <= 3.5; r += 0.5) {
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawVessel(x: number, y: number, radius: number, color: { fill: string; edge: string }, time: number) {
    // Draw a curvy vessel cross-section
    const segments = 32;
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const wobble = Math.sin(angle * 4 + time * 1.5) * radius * 0.2 +
                     Math.sin(angle * 7 + time * 2) * radius * 0.1;
      const r = radius + wobble;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color.fill;
    ctx.fill();
    ctx.strokeStyle = color.edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner lumen
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,60,60,0.1)';
    ctx.fill();

    // Blood flow dots
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + time * 2;
      const dotR = radius * 0.3;
      const dx = x + Math.cos(angle) * dotR;
      const dy = y + Math.sin(angle) * dotR;
      ctx.beginPath();
      ctx.arc(dx, dy, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,60,60,0.5)';
      ctx.fill();
    }
  }

  function drawSuppressiveMolecules(x: number, y: number, radius: number, color: { fill: string; edge: string; glow: string }, time: number) {
    // Multiple small molecules in a cloud
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + time * 0.5;
      const dist = radius * 1.5 + Math.sin(time + i * 1.3) * radius * 0.5;
      const mx = x + Math.cos(angle) * dist;
      const my = y + Math.sin(angle) * dist;
      drawMolecule(ctx, mx, my, 3, color.fill, 'triangle');
    }
    // Central glow
    drawGlow(ctx, x, y, radius * 2, color.glow, 0.3, time);
    // Warning icon (X shape)
    ctx.strokeStyle = color.edge;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 4);
    ctx.lineTo(x + 4, y + 4);
    ctx.moveTo(x + 4, y - 4);
    ctx.lineTo(x - 4, y + 4);
    ctx.stroke();
  }

  function drawMatrixCluster(x: number, y: number, radius: number, color: { fill: string; edge: string; glow: string }, time: number) {
    // Crosshatch fiber pattern
    ctx.strokeStyle = color.edge;
    ctx.lineWidth = 1;
    const extent = radius * 1.5;
    for (let i = -3; i <= 3; i++) {
      const offset = i * (extent / 3);
      const wobble = Math.sin(time * 0.6 + i * 0.9) * 2;
      // Horizontal fibers
      ctx.beginPath();
      ctx.moveTo(x - extent, y + offset + wobble);
      ctx.lineTo(x + extent, y + offset + wobble);
      ctx.stroke();
      // Vertical fibers
      ctx.beginPath();
      ctx.moveTo(x + offset + wobble, y - extent);
      ctx.lineTo(x + offset + wobble, y + extent);
      ctx.stroke();
    }
    // Soft glow over the mesh
    drawGlow(ctx, x, y, extent, color.glow, 0.2, time);
  }

  // ---- Pointer events ----

  function onPointerDown(x: number, y: number) {
    for (let i = 0; i < state.layouts.length; i++) {
      const layout = state.layouts[i];
      const dx = x - layout.cx;
      const dy = y - layout.cy;
      // Use generous hit area (1.5x radius)
      if (dx * dx + dy * dy <= (layout.radius * 1.8) ** 2) {
        state.selected = state.selected === i ? null : i;
        return;
      }
    }
    // Click outside — deselect
    if (state.selected !== null) {
      state.selected = null;
    }
  }

  function onPointerMove(x: number, y: number) {
    let found = false;
    for (let i = 0; i < state.layouts.length; i++) {
      const layout = state.layouts[i];
      const dx = x - layout.cx;
      const dy = y - layout.cy;
      if (dx * dx + dy * dy <= (layout.radius * 1.8) ** 2) {
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
      const next = state.selected === null ? 0 : (state.selected + 1) % ELEMENTS.length;
      state.selected = next;
    },
    prevStage: () => {
      const prev = state.selected === null
        ? ELEMENTS.length - 1
        : (state.selected - 1 + ELEMENTS.length) % ELEMENTS.length;
      state.selected = prev;
    },
    getStage: () => state.selected ?? -1,
  };
}
