// ============================================================================
// T2 — Checkpoint Inhibitor: PD-1/PD-L1 Blockade Toggle
// Toggle between "cancer winning" (T-cell exhausted) and "immunotherapy" (T-cell attacks)
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawReceptor, drawGlow, drawMolecule,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawToggle, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

interface State {
  on: boolean; // true = immunotherapy active
  t: number; // interpolation 0 (off) → 1 (on)
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  toggleArea: ControlHitArea | null;
  // Cell positions
  cancerX: number;
  cancerY: number;
  tcellX: number;
  tcellY: number;
  // Drug molecule positions
  drugX: number;
  drugY: number;
  // Fragment particles for death animation
  fragments: { x: number; y: number; vx: number; vy: number; r: number; a: number }[];
}

export function init(
  canvas: HTMLCanvasElement,
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
    particles: createParticleSystem(60, { width, height }),
    toggleArea: null,
    cancerX: width * 0.62,
    cancerY: height * 0.42,
    tcellX: width * 0.32,
    tcellY: height * 0.42,
    drugX: width * 0.47,
    drugY: height * 0.32,
    fragments: [],
  };

  function layout() {
    state.cancerX = state.w * 0.62;
    state.cancerY = state.h * 0.42;
    state.tcellX = state.w * 0.32;
    state.tcellY = state.h * 0.42;
    state.drugX = state.w * 0.47;
    state.drugY = state.h * 0.32;
  }

  layout();

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;

    // Interpolate toward target
    const target = state.on ? 1 : 0;
    state.t = lerp(state.t, target, dt * 3);
    state.t = clamp(state.t, 0, 1);

    updateParticles(state.particles, dt * speed);

    // Update fragments
    for (const f of state.fragments) {
      f.x += f.vx * dt * 60;
      f.y += f.vy * dt * 60;
      f.a -= dt * 0.5;
    }
    state.fragments = state.fragments.filter(f => f.a > 0);

    // Generate fragments when cancer is being destroyed
    if (state.t > 0.8 && state.fragments.length < 12) {
      state.fragments.push({
        x: state.cancerX + (Math.random() - 0.5) * 40,
        y: state.cancerY + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        r: 2 + Math.random() * 4,
        a: 0.6,
      });
    }

    render();
  }

  function render() {
    const { w, h, t, time } = state;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);

    // Particles
    drawParticles(ctx, state.particles);

    const cancerRadius = 55;
    const tcellRadius = 40;

    // T-cell moves closer when on
    const tcellXAnim = lerp(state.tcellX, state.tcellX + 30 * t, 0.1);

    // Cancer cell opacity decreases when being destroyed
    const cancerAlpha = 1 - t * 0.6;

    // ---- Cancer Cell ----
    ctx.globalAlpha = cancerAlpha;
    drawCell(ctx, state.cancerX, state.cancerY, cancerRadius, {
      fill: PALETTE.cancer.fill,
      edge: PALETTE.cancer.edge,
      glow: PALETTE.cancer.glow,
    }, time);
    drawNucleus(ctx, state.cancerX, state.cancerY, cancerRadius * 0.35, PALETTE.cancer.accent);

    // PD-L1 receptors on cancer cell (facing T-cell)
    const pdl1Count = 5;
    for (let i = 0; i < pdl1Count; i++) {
      const angle = Math.PI + (i - 2) * 0.3;
      const rx = state.cancerX + Math.cos(angle) * (cancerRadius + 2);
      const ry = state.cancerY + Math.sin(angle) * (cancerRadius + 2);
      drawReceptor(ctx, rx, ry, angle - Math.PI / 2, PALETTE.cancer.accent, 'diamond', 10);
    }
    ctx.globalAlpha = 1;

    // Cancer fragments
    for (const f of state.fragments) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,100,80,${f.a.toFixed(3)})`;
      ctx.fill();
    }

    // ---- T-Cell ----
    const tcellFill = t > 0.5 ? PALETTE.immune.activated.fill : PALETTE.immune.fill;
    const tcellEdge = t > 0.5 ? PALETTE.immune.activated.edge : PALETTE.immune.edge;
    const tcellGlow = t > 0.5 ? PALETTE.immune.activated.glow : PALETTE.immune.glow;

    // Exhaustion dimming when off
    const tcellAlpha = 0.4 + 0.6 * t;
    ctx.globalAlpha = tcellAlpha;

    drawCell(ctx, tcellXAnim, state.tcellY, tcellRadius, {
      fill: tcellFill,
      edge: tcellEdge,
      glow: tcellGlow,
    }, time, 2);
    drawNucleus(ctx, tcellXAnim, state.tcellY, tcellRadius * 0.3, PALETTE.immune.label);

    // PD-1 receptors on T-cell (facing cancer cell)
    const pd1Count = 3;
    for (let i = 0; i < pd1Count; i++) {
      const angle = (i - 1) * 0.35;
      const rx = tcellXAnim + Math.cos(angle) * (tcellRadius + 2);
      const ry = state.tcellY + Math.sin(angle) * (tcellRadius + 2);
      drawReceptor(ctx, rx, ry, angle - Math.PI / 2, PALETTE.immune.label, 'circle', 8);
    }
    ctx.globalAlpha = 1;

    // Activated glow
    if (t > 0.5) {
      drawGlow(ctx, tcellXAnim, state.tcellY, tcellRadius * 2.5, PALETTE.immune.activated.glow, t, time);
    }

    // ---- PD-1/PD-L1 Binding (off state) ----
    if (t < 0.7) {
      const bindAlpha = 1 - t * 1.4;
      ctx.strokeStyle = `rgba(255,80,80,${(bindAlpha * 0.5).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(tcellXAnim + tcellRadius, state.tcellY);
      ctx.lineTo(state.cancerX - cancerRadius, state.cancerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Suppression signal
      if (t < 0.3) {
        const midX = (tcellXAnim + state.cancerX) / 2;
        const midY = (state.tcellY + state.cancerY) / 2;
        drawGlow(ctx, midX, midY, 20, PALETTE.signal.suppression, 0.5 * (1 - t * 3), time);
      }
    }

    // ---- Drug Molecule (on state) ----
    if (t > 0.1) {
      const drugAlpha = clamp(t * 2, 0, 1);
      ctx.globalAlpha = drugAlpha;

      // Drug blocks the binding site
      const drugTargetX = (tcellXAnim + tcellRadius + state.cancerX - cancerRadius) / 2;
      const drugTargetY = state.tcellY;
      const drugAX = lerp(state.drugX, drugTargetX, t);
      const drugAY = lerp(state.drugY, drugTargetY, t);

      drawMolecule(ctx, drugAX, drugAY, 8, PALETTE.drug.fill, 'hexagon');
      drawGlow(ctx, drugAX, drugAY, 15, PALETTE.drug.glow, t * 0.6, time);

      // Drug label
      if (t > 0.3) {
        ctx.font = '600 10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = PALETTE.drug.label;
        ctx.textAlign = 'center';
        ctx.fillText('Anti-PD-1', drugAX, drugAY - 18);
      }

      ctx.globalAlpha = 1;
    }

    // ---- Attack signal (on state) ----
    if (t > 0.7) {
      const attackAlpha = (t - 0.7) * 3;
      drawGlow(ctx, state.cancerX, state.cancerY, cancerRadius * 1.5,
        PALETTE.signal.attack, clamp(attackAlpha, 0, 0.8), time * 2);
    }

    // ---- Labels ----
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.immune.label;
    ctx.fillText('T-cell', tcellXAnim, state.tcellY + tcellRadius + 18);
    ctx.fillStyle = PALETTE.cancer.label;
    ctx.fillText('Cancer cell', state.cancerX, state.cancerY + cancerRadius + 18);

    // ---- Controls ----
    const controlY = h - 50;
    state.toggleArea = drawToggle(ctx, state.on, w / 2 - 20, controlY, {
      off: 'No treatment',
      on: 'Immunotherapy',
    });

    // Phase label
    drawPhaseLabel(
      ctx,
      state.on ? 'Checkpoint blockade restores T-cell attack' : 'PD-L1 suppresses immune response',
      w / 2,
      controlY - 25
    );
  }

  function onPointerDown(x: number, y: number) {
    if (state.toggleArea && hitTest(x, y, state.toggleArea)) {
      state.on = !state.on;
      if (!state.on) {
        state.fragments = [];
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
    toggle: () => {
      state.on = !state.on;
      if (!state.on) state.fragments = [];
    },
    getStage: () => state.on ? 1 : 0,
  };
}
