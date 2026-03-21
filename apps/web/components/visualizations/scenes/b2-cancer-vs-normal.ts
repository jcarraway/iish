// ============================================================================
// B2 — Cancer Cell vs Normal Cell: Side-by-Side Comparison
// Toggle, 5 features — division rate, death signals, immune evasion,
// blood vessel growth (angiogenesis), tissue invasion
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawGlow, drawMolecule, drawArrow, drawReceptor,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawButton, hitTest,
  lerp, clamp, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

interface Feature {
  name: string;
  label: string;
  normalDesc: string;
  cancerDesc: string;
}

const FEATURES: Feature[] = [
  {
    name: 'Division Rate',
    label: 'Uncontrolled Growth',
    normalDesc: 'Normal cells divide only when signaled and stop when enough cells are present.',
    cancerDesc: 'Cancer cells ignore stop signals and divide relentlessly, forming a growing mass.',
  },
  {
    name: 'Death Signals',
    label: 'Evading Apoptosis',
    normalDesc: 'Damaged normal cells self-destruct through apoptosis — programmed cell death.',
    cancerDesc: 'Cancer cells disable their self-destruct mechanism, surviving despite DNA damage.',
  },
  {
    name: 'Immune Evasion',
    label: 'Hiding from Immunity',
    normalDesc: 'Normal cells display identity markers that the immune system recognizes as "self."',
    cancerDesc: 'Cancer cells disguise themselves with checkpoint molecules (PD-L1) to avoid immune attack.',
  },
  {
    name: 'Blood Vessels',
    label: 'Angiogenesis',
    normalDesc: 'Normal tissue has orderly blood vessels that supply oxygen and nutrients.',
    cancerDesc: 'Tumors recruit new, chaotic blood vessels (angiogenesis) to fuel their rapid growth.',
  },
  {
    name: 'Invasion',
    label: 'Tissue Invasion',
    normalDesc: 'Normal cells respect tissue boundaries and stay in their designated location.',
    cancerDesc: 'Cancer cells break through tissue boundaries and invade surrounding structures (metastasis).',
  },
];

interface DivisionCell {
  x: number;
  y: number;
  r: number;
  phase: number;
  dividing: boolean;
  splitProgress: number;
}

interface State {
  current: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  buttonAreas: ControlHitArea[];
  normalCellX: number;
  normalCellY: number;
  cancerCellX: number;
  cancerCellY: number;
  // Feature-specific animation state
  divisionCells: DivisionCell[];
  vesselAngle: number;
}

export function init(
  _canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): SceneAPI {
  const state: State = {
    current: 0,
    time: 0,
    w: width,
    h: height,
    particles: createParticleSystem(40, { width, height }),
    buttonAreas: [],
    normalCellX: width * 0.25,
    normalCellY: height * 0.36,
    cancerCellX: width * 0.75,
    cancerCellY: height * 0.36,
    divisionCells: [],
    vesselAngle: 0,
  };

  function layout() {
    state.normalCellX = state.w * 0.25;
    state.normalCellY = state.h * 0.36;
    state.cancerCellX = state.w * 0.75;
    state.cancerCellY = state.h * 0.36;
  }
  layout();

  function switchFeature(idx: number) {
    if (idx === state.current) return;
    state.current = idx;
    state.divisionCells = [];
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    state.vesselAngle += dt * 0.3;

    updateParticles(state.particles, dt * speed);

    // Division animation for feature 0
    if (state.current === 0) {
      // Cancer side: spawn new cells
      if (state.divisionCells.length < 6 && Math.random() < dt * 0.8) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 30;
        state.divisionCells.push({
          x: state.cancerCellX + Math.cos(angle) * dist,
          y: state.cancerCellY + Math.sin(angle) * dist,
          r: 2,
          phase: Math.random() * Math.PI * 2,
          dividing: true,
          splitProgress: 0,
        });
      }
      for (const dc of state.divisionCells) {
        dc.r = lerp(dc.r, 8, dt * 0.8);
        dc.phase += dt;
      }
    }

    render();
  }

  function drawSectionDivider() {
    // Vertical center line
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(state.w / 2, state.h * 0.08);
    ctx.lineTo(state.w / 2, state.h * 0.62);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawDeathSignals(cx: number, cy: number, r: number, working: boolean) {
    if (working) {
      // Normal: apoptosis signals active
      const pulseR = r * (1 + Math.sin(state.time * 3) * 0.1);
      drawGlow(ctx, cx, cy, pulseR * 1.5, 'rgba(80,200,140,0.3)', 0.3, state.time);

      // Death receptor on surface
      for (let i = 0; i < 3; i++) {
        const angle = Math.PI * 0.3 + i * Math.PI * 0.4;
        const rx = cx + Math.cos(angle) * (r + 2);
        const ry = cy + Math.sin(angle) * (r + 2);
        drawReceptor(ctx, rx, ry, angle + Math.PI / 2, PALETTE.healthy.edge, 'circle', 6);
      }

      // Check mark
      ctx.strokeStyle = PALETTE.healthy.edge;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy);
      ctx.lineTo(cx - 1, cy + 5);
      ctx.lineTo(cx + 8, cy - 6);
      ctx.stroke();
    } else {
      // Cancer: apoptosis blocked
      // Broken death receptors
      for (let i = 0; i < 3; i++) {
        const angle = Math.PI * 0.3 + i * Math.PI * 0.4;
        const rx = cx + Math.cos(angle) * (r + 2);
        const ry = cy + Math.sin(angle) * (r + 2);
        ctx.globalAlpha = 0.3;
        drawReceptor(ctx, rx, ry, angle + Math.PI / 2, PALETTE.cancer.edge, 'circle', 6);
        ctx.globalAlpha = 1;

        // X over receptor
        ctx.strokeStyle = PALETTE.signal.suppression;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx - 3, ry - 3);
        ctx.lineTo(rx + 3, ry + 3);
        ctx.moveTo(rx + 3, ry - 3);
        ctx.lineTo(rx - 3, ry + 3);
        ctx.stroke();
      }

      // Skull hint / X mark
      ctx.strokeStyle = PALETTE.signal.suppression;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 7);
      ctx.lineTo(cx + 7, cy + 7);
      ctx.moveTo(cx + 7, cy - 7);
      ctx.lineTo(cx - 7, cy + 7);
      ctx.stroke();
    }
  }

  function drawImmuneInteraction(cx: number, cy: number, r: number, evading: boolean) {
    // Small T-cell nearby
    const tcX = cx + r * 2;
    const tcY = cy - r * 0.5;
    const tcR = r * 0.4;

    drawCell(ctx, tcX, tcY, tcR, {
      fill: evading ? PALETTE.immune.exhausted.fill : PALETTE.immune.activated.fill,
      edge: evading ? PALETTE.immune.exhausted.edge : PALETTE.immune.activated.edge,
    }, state.time, 1);

    if (evading) {
      // PD-L1 on cancer cell
      const pdAngle = Math.atan2(tcY - cy, tcX - cx);
      const pdX = cx + Math.cos(pdAngle) * (r + 2);
      const pdY = cy + Math.sin(pdAngle) * (r + 2);
      drawReceptor(ctx, pdX, pdY, pdAngle + Math.PI / 2, PALETTE.signal.suppression, 'circle', 8);

      // Suppression dashes
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255,80,80,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pdX, pdY);
      ctx.lineTo(tcX - tcR, tcY);
      ctx.stroke();
      ctx.setLineDash([]);

      drawText(ctx, 'PD-L1', pdX - 12, pdY + 12, {
        fontSize: 8, color: PALETTE.signal.suppression, align: 'center',
      });

      // Exhausted T-cell label
      drawText(ctx, 'Exhausted', tcX, tcY + tcR + 10, {
        fontSize: 8, color: PALETTE.immune.exhausted.edge, align: 'center',
      });
    } else {
      // Normal: identity markers
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const rx = cx + Math.cos(angle) * (r + 2);
        const ry = cy + Math.sin(angle) * (r + 2);
        drawReceptor(ctx, rx, ry, angle + Math.PI / 2, PALETTE.healthy.edge, 'circle', 6);
      }

      // Patrol check mark
      drawText(ctx, 'Patrolling', tcX, tcY + tcR + 10, {
        fontSize: 8, color: PALETTE.immune.label, align: 'center',
      });

      // Green check
      ctx.strokeStyle = PALETTE.healthy.edge;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tcX - 4, tcY);
      ctx.lineTo(tcX - 1, tcY + 3);
      ctx.lineTo(tcX + 5, tcY - 4);
      ctx.stroke();
    }
  }

  function drawBloodVessels(cx: number, cy: number, r: number, chaotic: boolean) {
    if (chaotic) {
      // Chaotic tumor vasculature
      const vesselCount = 8;
      for (let i = 0; i < vesselCount; i++) {
        const angle = (i / vesselCount) * Math.PI * 2 + state.vesselAngle;
        const segments = 6;

        ctx.beginPath();
        let vx = cx + Math.cos(angle) * r * 0.3;
        let vy = cy + Math.sin(angle) * r * 0.3;
        ctx.moveTo(vx, vy);

        for (let s = 1; s <= segments; s++) {
          const t = s / segments;
          const wobble = Math.sin(state.time * 2 + i + s) * 8 * t;
          vx = cx + Math.cos(angle + wobble * 0.02) * (r * 0.3 + t * r * 1.2);
          vy = cy + Math.sin(angle + wobble * 0.02) * (r * 0.3 + t * r * 1.2) + wobble;
          ctx.lineTo(vx, vy);
        }

        ctx.strokeStyle = `rgba(200,60,60,${(0.12 + Math.sin(state.time + i) * 0.05).toFixed(3)})`;
        ctx.lineWidth = 1.5 + Math.sin(i * 1.7) * 0.5;
        ctx.stroke();
      }

      // VEGF signals
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + state.time * 0.5;
        const dist = r * 0.8 + Math.sin(state.time + i) * 10;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;
        drawMolecule(ctx, sx, sy, 3, 'rgba(255,100,80,0.3)', 'triangle');
      }

      drawText(ctx, 'VEGF signals', cx, cy + r * 1.5 + 30, {
        fontSize: 8, color: 'rgba(255,100,80,0.4)', align: 'center',
      });
    } else {
      // Orderly normal vasculature
      const vesselCount = 4;
      for (let i = 0; i < vesselCount; i++) {
        const vx = cx - r + (i + 0.5) / vesselCount * r * 2;

        ctx.beginPath();
        ctx.moveTo(vx, cy - r * 1.2);
        ctx.lineTo(vx, cy + r * 1.2);
        ctx.strokeStyle = 'rgba(200,60,60,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Red blood cells flowing through
        const rbcY = cy + Math.sin(state.time * 2 + i * 1.5) * r * 0.8;
        ctx.beginPath();
        ctx.arc(vx, rbcY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,60,60,0.2)';
        ctx.fill();
      }
    }
  }

  function drawTissueBoundary(cx: number, cy: number, r: number, invading: boolean) {
    // Tissue boundary line
    const boundaryY = cy + r * 0.8;
    const bStart = cx - r * 1.5;
    const bEnd = cx + r * 1.5;

    ctx.strokeStyle = invading ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash(invading ? [3, 5] : []);
    ctx.beginPath();
    ctx.moveTo(bStart, boundaryY);
    ctx.lineTo(bEnd, boundaryY);
    ctx.stroke();
    ctx.setLineDash([]);

    drawText(ctx, 'Tissue boundary', cx, boundaryY + 12, {
      fontSize: 8, color: PALETTE.text.tertiary, align: 'center',
    });

    if (invading) {
      // Cancer cells breaking through
      const invasionCount = 3;
      for (let i = 0; i < invasionCount; i++) {
        const ix = cx - 20 + i * 20;
        const dist = 10 + Math.sin(state.time + i * 1.2) * 5;
        const iy = boundaryY + dist;

        drawCell(ctx, ix, iy, 6, {
          fill: PALETTE.cancer.fill,
          edge: PALETTE.cancer.edge,
        }, state.time + i, 1);

        // Invasion arrow
        drawArrow(ctx,
          { x: ix, y: boundaryY - 2 },
          { x: ix, y: iy - 6 },
          'rgba(230,100,80,0.2)', 1, 3);
      }

      drawText(ctx, 'Metastasis', cx, boundaryY + 35, {
        fontSize: 9, fontWeight: '600', color: PALETTE.cancer.label, align: 'center',
      });
    } else {
      // Normal cells respecting boundary
      drawText(ctx, 'Cells stay in place', cx, boundaryY + 25, {
        fontSize: 9, color: PALETTE.healthy.edge, align: 'center',
      });
    }
  }

  function render() {
    const { w, h, time, current } = state;
    const r = Math.min(w, h) * 0.1;
    const feature = FEATURES[current];

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // Section headers
    drawText(ctx, 'Normal Cell', state.normalCellX, h * 0.08, {
      fontSize: 14, fontWeight: '600', color: PALETTE.healthy.edge, align: 'center',
    });
    drawText(ctx, 'Cancer Cell', state.cancerCellX, h * 0.08, {
      fontSize: 14, fontWeight: '600', color: PALETTE.cancer.label, align: 'center',
    });

    drawSectionDivider();

    // Feature title
    drawText(ctx, feature.label, w / 2, h * 0.14, {
      fontSize: 12, color: PALETTE.text.accent, align: 'center',
    });

    // ---- Normal cell (left) ----
    const normalColor = { fill: PALETTE.healthy.fill, edge: PALETTE.healthy.edge, glow: PALETTE.healthy.glow };
    drawCell(ctx, state.normalCellX, state.normalCellY, r, normalColor, time, 2);
    drawNucleus(ctx, state.normalCellX, state.normalCellY, r * 0.3, PALETTE.healthy.edge);

    // ---- Cancer cell (right) ----
    const cancerColor = { fill: PALETTE.cancer.fill, edge: PALETTE.cancer.edge, glow: PALETTE.cancer.glow };
    const cancerWobble = current === 0 ? 5 : 3;
    drawCell(ctx, state.cancerCellX, state.cancerCellY, r * 1.1, cancerColor, time, cancerWobble);
    drawNucleus(ctx, state.cancerCellX, state.cancerCellY, r * 0.4, PALETTE.cancer.accent);

    // ---- Feature-specific rendering ----
    if (current === 0) {
      // Division rate
      // Normal: single dividing cell, slow
      const normalDivPhase = (Math.sin(time * 0.3) + 1) / 2;
      if (normalDivPhase > 0.8) {
        const splitOffset = (normalDivPhase - 0.8) * 5 * 8;
        ctx.globalAlpha = 0.4;
        drawCell(ctx, state.normalCellX - splitOffset, state.normalCellY, r * 0.4, normalColor, time, 1);
        drawCell(ctx, state.normalCellX + splitOffset, state.normalCellY, r * 0.4, normalColor, time, 1);
        ctx.globalAlpha = 1;
      }

      // Cancer: multiple division cells
      for (const dc of state.divisionCells) {
        ctx.globalAlpha = clamp(dc.r / 8, 0, 0.5);
        drawCell(ctx, dc.x, dc.y, dc.r, cancerColor, time + dc.phase, 1);
        ctx.globalAlpha = 1;
      }

      drawText(ctx, 'Controlled', state.normalCellX, state.normalCellY + r + 20, {
        fontSize: 10, color: PALETTE.healthy.edge, align: 'center',
      });
      drawText(ctx, 'Uncontrolled', state.cancerCellX, state.cancerCellY + r * 1.1 + 20, {
        fontSize: 10, color: PALETTE.cancer.label, align: 'center',
      });
    }

    if (current === 1) {
      // Death signals
      drawDeathSignals(state.normalCellX, state.normalCellY, r, true);
      drawDeathSignals(state.cancerCellX, state.cancerCellY, r * 1.1, false);

      drawText(ctx, 'Apoptosis active', state.normalCellX, state.normalCellY + r + 20, {
        fontSize: 10, color: PALETTE.healthy.edge, align: 'center',
      });
      drawText(ctx, 'Apoptosis blocked', state.cancerCellX, state.cancerCellY + r * 1.1 + 20, {
        fontSize: 10, color: PALETTE.cancer.label, align: 'center',
      });
    }

    if (current === 2) {
      // Immune evasion
      drawImmuneInteraction(state.normalCellX, state.normalCellY, r, false);
      drawImmuneInteraction(state.cancerCellX, state.cancerCellY, r * 1.1, true);
    }

    if (current === 3) {
      // Blood vessels
      drawBloodVessels(state.normalCellX, state.normalCellY, r, false);
      drawBloodVessels(state.cancerCellX, state.cancerCellY, r * 1.1, true);

      drawText(ctx, 'Orderly vessels', state.normalCellX, state.normalCellY + r * 1.5 + 30, {
        fontSize: 10, color: PALETTE.healthy.edge, align: 'center',
      });
      drawText(ctx, 'Chaotic vessels', state.cancerCellX, state.cancerCellY + r * 1.5 + 30, {
        fontSize: 10, color: PALETTE.cancer.label, align: 'center',
      });
    }

    if (current === 4) {
      // Invasion
      drawTissueBoundary(state.normalCellX, state.normalCellY, r, false);
      drawTissueBoundary(state.cancerCellX, state.cancerCellY, r * 1.1, true);
    }

    // ---- Descriptions ----
    const descY = h * 0.67;
    const descMaxW = w * 0.38;

    // Normal description (left)
    ctx.save();
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = PALETTE.text.secondary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const normalWords = feature.normalDesc.split(' ');
    let normalLine = '';
    let normalLy = descY;
    for (const word of normalWords) {
      const test = normalLine ? `${normalLine} ${word}` : word;
      if (ctx.measureText(test).width > descMaxW && normalLine) {
        ctx.fillText(normalLine, state.normalCellX, normalLy);
        normalLine = word;
        normalLy += 16;
      } else {
        normalLine = test;
      }
    }
    if (normalLine) ctx.fillText(normalLine, state.normalCellX, normalLy);
    ctx.restore();

    // Cancer description (right)
    ctx.save();
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = PALETTE.text.secondary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const cancerWords = feature.cancerDesc.split(' ');
    let cancerLine = '';
    let cancerLy = descY;
    for (const word of cancerWords) {
      const test = cancerLine ? `${cancerLine} ${word}` : word;
      if (ctx.measureText(test).width > descMaxW && cancerLine) {
        ctx.fillText(cancerLine, state.cancerCellX, cancerLy);
        cancerLine = word;
        cancerLy += 16;
      } else {
        cancerLine = test;
      }
    }
    if (cancerLine) ctx.fillText(cancerLine, state.cancerCellX, cancerLy);
    ctx.restore();

    // ---- Feature toggle buttons ----
    const buttonY = h - 38;
    const totalButtons = FEATURES.length;
    const buttonGap = w * 0.17;
    const startX = w / 2 - (totalButtons - 1) * buttonGap / 2;
    state.buttonAreas = [];

    for (let i = 0; i < totalButtons; i++) {
      const bx = startX + i * buttonGap;
      const area = drawButton(ctx, FEATURES[i].name, bx, buttonY, i === current);
      state.buttonAreas.push(area);
    }
  }

  function onPointerDown(x: number, y: number) {
    for (let i = 0; i < state.buttonAreas.length; i++) {
      if (hitTest(x, y, state.buttonAreas[i])) {
        switchFeature(i);
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
    toggle: () => switchFeature((state.current + 1) % FEATURES.length),
    nextStage: () => switchFeature(Math.min(state.current + 1, FEATURES.length - 1)),
    prevStage: () => switchFeature(Math.max(state.current - 1, 0)),
    getStage: () => state.current,
  };
}
