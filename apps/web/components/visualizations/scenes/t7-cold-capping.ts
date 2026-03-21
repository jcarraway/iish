// ============================================================================
// T7 — Cold Capping: Scalp Cooling to Prevent Hair Loss During Chemo
// Toggle between with/without cap showing blood vessel constriction
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawMembrane, drawMolecule, drawGlow,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawToggle, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText, drawWrappedText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

interface ChemoParticle {
  x: number;
  y: number;
  speed: number;
  phase: number;
}

interface State {
  capOn: boolean;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  toggleArea: ControlHitArea | null;
  vesselWidth: number; // animated
  chemoAlpha: number; // animated
  tempGlow: number; // animated
  chemoParticles: ChemoParticle[];
}

export function init(
  _canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SceneAPI {
  const state: State = {
    capOn: false,
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(35, { width, height }),
    toggleArea: null,
    vesselWidth: 4,
    chemoAlpha: 1,
    tempGlow: 0,
    chemoParticles: [],
  };

  function initChemo() {
    state.chemoParticles = [];
    for (let i = 0; i < 10; i++) {
      state.chemoParticles.push({
        x: Math.random(),
        y: 0.3 + Math.random() * 0.4,
        speed: 0.3 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  initChemo();

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    updateParticles(state.particles, dt * speed);

    // Animate transitions
    const targetVesselW = state.capOn ? 1.5 : 4;
    const targetChemoA = state.capOn ? 0.2 : 1;
    const targetTempGlow = state.capOn ? 1 : 0;

    state.vesselWidth = lerp(state.vesselWidth, targetVesselW, dt * 3);
    state.chemoAlpha = lerp(state.chemoAlpha, targetChemoA, dt * 3);
    state.tempGlow = lerp(state.tempGlow, targetTempGlow, dt * 3);

    // Move chemo particles
    for (const p of state.chemoParticles) {
      p.x += p.speed * dt * (state.capOn ? 0.2 : 1);
      if (p.x > 1.1) p.x = -0.1;
      p.phase += dt;
    }

    render();
  }

  function render() {
    const { w, h, time, capOn } = state;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    const panelW = w * 0.42;
    const panelGap = w * 0.06;

    // ---- Left panel: Without cap ----
    const lx = w * 0.05;
    const ly = h * 0.08;
    drawPanel(lx, ly, panelW, h * 0.65, false);

    // ---- Right panel: With cap ----
    const rx = lx + panelW + panelGap;
    drawPanel(rx, ly, panelW, h * 0.65, true);

    // Active indicator
    const activeX = capOn ? rx : lx;
    ctx.strokeStyle = 'rgba(110,180,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(activeX - 4, ly - 4, panelW + 8, h * 0.65 + 8, 12);
    ctx.stroke();

    // Toggle
    const toggleX = w / 2 - 20;
    const toggleY = h - 48;
    state.toggleArea = drawToggle(ctx, capOn, toggleX, toggleY, {
      off: 'No cap',
      on: 'With cap',
    });

    drawText(ctx, 'Scalp Cooling', w / 2, toggleY - 22, {
      fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
    });
  }

  function drawPanel(px: number, py: number, pw: number, ph: number, isCapped: boolean) {
    const { time, w } = state;

    // Panel background
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fill();

    // Title
    drawText(ctx, isCapped ? 'With Cooling Cap' : 'Without Cap', px + pw / 2, py + 16, {
      fontSize: 13, fontWeight: '600', color: PALETTE.text.primary, align: 'center',
    });

    // Scalp cross-section
    const scalpY = py + 40;
    const scalpH = ph * 0.3;

    // Skin layers
    ctx.fillStyle = isCapped ? 'rgba(100,160,220,0.1)' : 'rgba(200,160,140,0.1)';
    ctx.fillRect(px + 10, scalpY, pw - 20, scalpH);

    // Cold glow when cap is on
    if (isCapped) {
      drawGlow(ctx, px + pw / 2, scalpY, pw * 0.4, 'rgba(100,180,255,0.2)', state.tempGlow * 0.5, time);
    }

    // Blood vessels
    const vesselY = scalpY + scalpH * 0.5;
    const vesselW = isCapped ? state.vesselWidth * 0.4 : state.vesselWidth;
    const vesselColor = isCapped ? 'rgba(200,80,80,0.25)' : 'rgba(200,80,80,0.5)';

    const vesselPoints: { x: number; y: number }[] = [];
    for (let i = 0; i <= 10; i++) {
      vesselPoints.push({
        x: px + 20 + (i / 10) * (pw - 40),
        y: vesselY,
      });
    }
    drawMembrane(ctx, vesselPoints, vesselColor, vesselW, time);

    // Chemo particles in vessels
    const chemoAlpha = isCapped ? state.chemoAlpha * 0.3 : state.chemoAlpha;
    if (chemoAlpha > 0.01) {
      ctx.globalAlpha = clamp(chemoAlpha, 0, 1);
      for (const cp of state.chemoParticles) {
        const cpx = px + 20 + cp.x * (pw - 40);
        const cpy = vesselY + Math.sin(cp.phase + time) * vesselW;
        if (cpx > px + 10 && cpx < px + pw - 10) {
          drawMolecule(ctx, cpx, cpy, 3, PALETTE.drug.fill, 'circle');
        }
      }
      ctx.globalAlpha = 1;
    }

    // Hair follicles
    const follicleY = scalpY + scalpH + 10;
    const follicleCount = 5;
    for (let i = 0; i < follicleCount; i++) {
      const fx = px + 30 + (i / (follicleCount - 1)) * (pw - 60);
      const fy = follicleY;
      const alive = isCapped ? true : (i % 2 === 0); // Without cap: some die

      // Follicle bulb
      ctx.beginPath();
      ctx.arc(fx, fy + 10, 6, 0, Math.PI * 2);
      ctx.fillStyle = alive
        ? 'rgba(200,170,100,0.3)'
        : 'rgba(200,170,100,0.08)';
      ctx.fill();

      // Hair strand
      if (alive) {
        ctx.strokeStyle = 'rgba(200,170,100,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fx, fy + 4);
        ctx.lineTo(fx + Math.sin(time + i) * 2, fy - 12);
        ctx.stroke();
      } else {
        // X mark
        ctx.strokeStyle = 'rgba(255,80,80,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fx - 3, fy + 7);
        ctx.lineTo(fx + 3, fy + 13);
        ctx.moveTo(fx + 3, fy + 7);
        ctx.lineTo(fx - 3, fy + 13);
        ctx.stroke();
      }
    }

    // Result label
    const resultY = py + ph - 50;
    const result = isCapped
      ? { text: 'Follicles protected', color: 'rgba(80,200,140,0.8)' }
      : { text: 'Hair loss occurs', color: 'rgba(240,100,80,0.8)' };

    drawText(ctx, result.text, px + pw / 2, resultY, {
      fontSize: 12, fontWeight: '600', color: result.color, align: 'center',
    });

    // Mechanism
    const mechText = isCapped
      ? 'Cold constricts vessels, reducing drug delivery to follicles'
      : 'Full blood flow delivers chemo to hair follicles';
    drawWrappedText(ctx, mechText, px + pw / 2, resultY + 18, pw - 30, 16, {
      fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
    });
  }

  function onPointerDown(x: number, y: number) {
    if (state.toggleArea && hitTest(x, y, state.toggleArea)) {
      state.capOn = !state.capOn;
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
    toggle: () => { state.capOn = !state.capOn; },
  };
}
