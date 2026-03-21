// ============================================================================
// P2 — MHC Class I Antigen Presentation Pathway
// Stepper, 10 stages — Protein → proteasome → TAP → MHC loading →
// conformational change → ER→Golgi→surface → T-cell check → recognition →
// immune activation → memory
// ============================================================================

import type { SceneAPI } from '../wrapper';
import {
  PALETTE, drawCell, drawNucleus, drawMolecule, drawGlow, drawArrow, drawReceptor,
  createParticleSystem, updateParticles, drawParticles, resizeParticleSystem,
  drawStepperDots, drawPhaseLabel, drawCaption, hitTest,
  lerp, clamp, easeOut, getAnimationSpeed,
} from '../framework';
import { drawText } from '../framework/text';
import type { ControlHitArea } from '../framework/controls';
import type { ParticleSystem } from '../framework/particles';

const STAGES = [
  { label: '1. Mutant protein', caption: 'A cancer cell produces a mutated protein — different from anything in a healthy cell.' },
  { label: '2. Proteasome cleaves peptides', caption: 'The proteasome — the cell\'s recycling machine — cuts the protein into short peptide fragments (8-10 amino acids).' },
  { label: '3. TAP transporter', caption: 'The TAP transporter acts as a gateway, shuttling peptide fragments from the cytoplasm into the endoplasmic reticulum (ER).' },
  { label: '4. MHC loading', caption: 'Inside the ER, the peptide fragment is loaded into the groove of an MHC class I molecule — like a key placed in a lock.' },
  { label: '5. Conformational change', caption: 'The MHC molecule snaps shut around the peptide, stabilizing the complex. Without a peptide, MHC cannot fold properly.' },
  { label: '6. Surface transport', caption: 'The loaded MHC-peptide complex travels from the ER through the Golgi apparatus to the cell surface for display.' },
  { label: '7. T-cell checks peptide', caption: 'A CD8+ T-cell patrols past the cell, using its T-cell receptor (TCR) to inspect the displayed peptide — is it self or foreign?' },
  { label: '8. Recognition', caption: 'The TCR fits the mutant peptide-MHC complex perfectly — this peptide is foreign! The T-cell docks firmly onto the cancer cell.' },
  { label: '9. Immune activation', caption: 'Recognition triggers a kill signal. The T-cell releases perforin and granzymes to destroy the cancer cell.' },
  { label: '10. Immune memory', caption: 'Memory T-cells remember this neoantigen. If cancer cells bearing it return, the response is faster and stronger.' },
];

interface PeptideFragment {
  x: number;
  y: number;
  size: number;
  color: string;
}

interface State {
  stage: number;
  stageProgress: number;
  time: number;
  w: number;
  h: number;
  particles: ParticleSystem;
  stepperAreas: ControlHitArea[];
  peptides: PeptideFragment[];
  // Key positions
  cellX: number;
  cellY: number;
  erX: number;
  erY: number;
  tcellX: number;
  tcellY: number;
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
    peptides: [],
    cellX: width * 0.35,
    cellY: height * 0.38,
    erX: width * 0.35,
    erY: height * 0.38,
    tcellX: width * 0.75,
    tcellY: height * 0.38,
  };

  function layout() {
    state.cellX = state.w * 0.35;
    state.cellY = state.h * 0.38;
    state.erX = state.w * 0.35;
    state.erY = state.h * 0.38;
    state.tcellX = state.w * 0.75;
    state.tcellY = state.h * 0.38;
  }
  layout();

  function goToStage(idx: number) {
    state.stage = clamp(idx, 0, STAGES.length - 1);
    state.stageProgress = 0;
  }

  function update(dt: number) {
    const speed = getAnimationSpeed(1);
    state.time += dt * speed;
    state.stageProgress = clamp(state.stageProgress + dt * 0.2, 0, 1);
    updateParticles(state.particles, dt * speed);
    render();
  }

  function drawProteasome(cx: number, cy: number, r: number, active: boolean) {
    // Barrel shape — two stacked rings
    ctx.save();

    // Outer ring
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.3, r, r * 0.5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = active ? 'rgba(200,170,100,0.4)' : 'rgba(200,170,100,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.3, r, r * 0.5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = active ? 'rgba(200,170,100,0.4)' : 'rgba(200,170,100,0.2)';
    ctx.stroke();

    // Side lines connecting rings
    ctx.beginPath();
    ctx.moveTo(cx - r, cy - r * 0.3);
    ctx.lineTo(cx - r, cy + r * 0.3);
    ctx.moveTo(cx + r, cy - r * 0.3);
    ctx.lineTo(cx + r, cy + r * 0.3);
    ctx.strokeStyle = 'rgba(200,170,100,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Active glow
    if (active) {
      drawGlow(ctx, cx, cy, r * 1.5, 'rgba(200,170,100,0.3)', 0.4, state.time);
    }

    ctx.restore();
  }

  function drawTAPChannel(cx: number, cy: number, size: number, open: boolean) {
    // Membrane channel — two half-circles with gap
    const gapW = open ? size * 0.4 : size * 0.1;

    ctx.strokeStyle = 'rgba(100,200,180,0.35)';
    ctx.lineWidth = 3;

    // Left half
    ctx.beginPath();
    ctx.arc(cx - gapW / 2, cy, size * 0.5, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();

    // Right half
    ctx.beginPath();
    ctx.arc(cx + gapW / 2, cy, size * 0.5, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();

    // Channel label
    drawText(ctx, 'TAP', cx, cy + size * 0.5 + 12, {
      fontSize: 9, color: 'rgba(100,200,180,0.5)', align: 'center',
    });

    if (open) {
      drawGlow(ctx, cx, cy, size * 0.3, 'rgba(100,200,180,0.3)', 0.3, state.time);
    }
  }

  function drawMHCMolecule(cx: number, cy: number, size: number, loaded: boolean, closed: boolean) {
    // MHC groove — two helices with a groove between them
    const grooveW = size * 0.6;
    const grooveH = size * 0.3;

    // Base platform
    ctx.beginPath();
    ctx.roundRect(cx - size * 0.5, cy, size, size * 0.5, 4);
    ctx.fillStyle = 'rgba(140,180,220,0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(140,180,220,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Alpha helices (groove walls)
    const wallH = closed ? grooveH * 0.8 : grooveH;
    ctx.fillStyle = 'rgba(140,180,220,0.25)';
    ctx.beginPath();
    ctx.roundRect(cx - grooveW / 2, cy - wallH, grooveW * 0.25, wallH, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx + grooveW / 2 - grooveW * 0.25, cy - wallH, grooveW * 0.25, wallH, 3);
    ctx.fill();

    // Peptide in groove
    if (loaded) {
      drawMolecule(ctx, cx, cy - wallH * 0.4, 4, PALETTE.protein.mutant, 'diamond');
    }
  }

  function drawERMembrane(x: number, y: number, w2: number, h2: number) {
    ctx.beginPath();
    // Wavy ER membrane
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const px = x + t * w2;
      const py = y + Math.sin(t * Math.PI * 3 + state.time * 0.5) * 4;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(100,170,200,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Second line for double membrane
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const px = x + t * w2;
      const py = y + h2 + Math.sin(t * Math.PI * 3 + state.time * 0.5 + 0.5) * 4;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(100,170,200,0.12)';
    ctx.stroke();
  }

  function render() {
    const { w, h, time, stage, stageProgress } = state;
    const r = Math.min(w, h) * 0.1;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.bg.deep;
    ctx.fillRect(0, 0, w, h);
    drawParticles(ctx, state.particles);

    // ---- Stage 0: Mutant protein ----
    if (stage === 0) {
      // Cell outline
      drawCell(ctx, state.cellX, state.cellY, r * 1.5, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
        glow: PALETTE.cancer.glow,
      }, time, 2);

      // Large mutant protein
      const protY = state.cellY - r * 0.2;
      const protScale = 1 + Math.sin(time * 1.5) * 0.05;

      // Protein chain (beads on a string)
      const beadCount = 7;
      for (let i = 0; i < beadCount; i++) {
        const angle = (i / beadCount) * Math.PI * 1.2 - Math.PI * 0.3;
        const bx = state.cellX + Math.cos(angle) * r * 0.5 * protScale;
        const by = protY + Math.sin(angle) * r * 0.3 * protScale;
        const isMutant = i === 3 || i === 4;
        drawMolecule(ctx, bx, by, 5, isMutant ? PALETTE.protein.mutant : PALETTE.protein.normal, 'circle');
      }

      // Mutation highlight
      if (stageProgress > 0.3) {
        const mutX = state.cellX + Math.cos((3.5 / beadCount) * Math.PI * 1.2 - Math.PI * 0.3) * r * 0.5;
        const mutY = protY + Math.sin((3.5 / beadCount) * Math.PI * 1.2 - Math.PI * 0.3) * r * 0.3;
        drawGlow(ctx, mutX, mutY, 15, PALETTE.protein.mutant, 0.4, time);

        drawText(ctx, 'Mutation', mutX + 15, mutY - 10, {
          fontSize: 10, color: PALETTE.protein.mutant, align: 'left',
        });
      }

      drawText(ctx, 'Mutant protein', state.cellX, state.cellY + r * 1.5 + 18, {
        fontSize: 11, color: PALETTE.cancer.label, align: 'center',
      });
    }

    // ---- Stage 1: Proteasome cleaves ----
    if (stage === 1) {
      const protX = state.cellX - r;
      const proteasomeX = state.cellX;
      const outX = state.cellX + r;

      // Protein entering proteasome
      const enterProgress = easeOut(clamp(stageProgress * 2, 0, 1));

      // Incoming protein chain
      if (stageProgress < 0.6) {
        const chainX = lerp(protX - 20, proteasomeX - 12, enterProgress);
        for (let i = 0; i < 5; i++) {
          const bx = chainX - i * 8;
          const by = state.cellY + Math.sin(time * 2 + i) * 2;
          const alpha = clamp(1 - enterProgress + 0.3, 0.1, 1);
          ctx.globalAlpha = alpha;
          drawMolecule(ctx, bx, by, 4, i === 2 ? PALETTE.protein.mutant : PALETTE.protein.normal, 'circle');
        }
        ctx.globalAlpha = 1;
      }

      drawProteasome(proteasomeX, state.cellY, 14, stageProgress > 0.2);

      // Peptide fragments emerging
      if (stageProgress > 0.4) {
        const fragAlpha = clamp((stageProgress - 0.4) * 3, 0, 1);
        ctx.globalAlpha = fragAlpha;
        for (let i = 0; i < 3; i++) {
          const fx = lerp(proteasomeX + 14, outX + i * 15, clamp((stageProgress - 0.4 - i * 0.1) * 2, 0, 1));
          const fy = state.cellY + (i - 1) * 12;
          drawMolecule(ctx, fx, fy, 3.5, i === 1 ? PALETTE.protein.mutant : PALETTE.protein.normal, 'diamond');
        }
        ctx.globalAlpha = 1;
      }

      drawText(ctx, 'Proteasome', proteasomeX, state.cellY + 30, {
        fontSize: 10, color: 'rgba(200,170,100,0.5)', align: 'center',
      });
    }

    // ---- Stage 2: TAP transporter ----
    if (stage === 2) {
      // ER membrane
      drawERMembrane(state.cellX - r * 1.5, state.cellY - 5, r * 3, 10);

      drawText(ctx, 'Cytoplasm', state.cellX, state.cellY - 35, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });
      drawText(ctx, 'ER lumen', state.cellX, state.cellY + 30, {
        fontSize: 10, color: PALETTE.text.tertiary, align: 'center',
      });

      const tapX = state.cellX;
      const tapOpen = stageProgress > 0.3;
      drawTAPChannel(tapX, state.cellY, 20, tapOpen);

      // Peptide moving through TAP
      const pepStartY = state.cellY - 30;
      const pepEndY = state.cellY + 25;
      const pepProgress = clamp((stageProgress - 0.2) * 1.5, 0, 1);
      const pepY = lerp(pepStartY, pepEndY, easeOut(pepProgress));
      drawMolecule(ctx, tapX, pepY, 4, PALETTE.protein.mutant, 'diamond');

      if (pepProgress > 0.5) {
        drawGlow(ctx, tapX, pepY, 10, PALETTE.protein.mutant, 0.3, time);
      }
    }

    // ---- Stage 3: MHC loading ----
    if (stage === 3) {
      drawERMembrane(state.cellX - r * 2, state.cellY + r * 0.5, r * 4, 8);
      drawText(ctx, 'Inside the ER', state.cellX, state.cellY - r * 0.8, {
        fontSize: 11, color: PALETTE.text.tertiary, align: 'center',
      });

      // Empty MHC waiting
      const mhcX = state.cellX;
      const mhcY = state.cellY;
      drawMHCMolecule(mhcX, mhcY, 30, stageProgress > 0.6, false);

      // Peptide approaching MHC
      const pepStartX = mhcX - r * 1.5;
      const pepEndX = mhcX;
      const pepEndY = mhcY - 10;
      const pepProgress = easeOut(clamp(stageProgress * 1.5, 0, 1));
      const pepX = lerp(pepStartX, pepEndX, pepProgress);
      const pepY = lerp(state.cellY - r, pepEndY, pepProgress);

      if (stageProgress < 0.7) {
        drawMolecule(ctx, pepX, pepY, 4, PALETTE.protein.mutant, 'diamond');
      }

      // Chaperone proteins (helpers)
      const chapAlpha = clamp(1 - stageProgress * 1.5, 0, 0.5);
      if (chapAlpha > 0.05) {
        ctx.globalAlpha = chapAlpha;
        drawMolecule(ctx, mhcX - 25, mhcY - 5, 6, 'rgba(180,200,130,0.4)', 'hexagon');
        drawText(ctx, 'Chaperone', mhcX - 25, mhcY + 10, {
          fontSize: 8, color: 'rgba(180,200,130,0.4)', align: 'center',
        });
        ctx.globalAlpha = 1;
      }

      drawText(ctx, 'MHC class I', mhcX, mhcY + 30, {
        fontSize: 10, color: 'rgba(140,180,220,0.5)', align: 'center',
      });
    }

    // ---- Stage 4: Conformational change ----
    if (stage === 4) {
      drawERMembrane(state.cellX - r * 2, state.cellY + r * 0.5, r * 4, 8);

      const mhcX = state.cellX;
      const mhcY = state.cellY;
      const closed = stageProgress > 0.4;
      drawMHCMolecule(mhcX, mhcY, 30, true, closed);

      // Snap glow
      if (stageProgress > 0.35 && stageProgress < 0.6) {
        const snapAlpha = 1 - (stageProgress - 0.35) * 4;
        drawGlow(ctx, mhcX, mhcY - 10, 25, 'rgba(140,180,220,0.5)', snapAlpha, time);
      }

      // Stability indicator
      if (stageProgress > 0.5) {
        drawText(ctx, 'Stable complex', mhcX, mhcY - 35, {
          fontSize: 11, fontWeight: '600', color: 'rgba(140,180,220,0.6)', align: 'center',
        });
      }
    }

    // ---- Stage 5: Surface transport ----
    if (stage === 5) {
      // Cell with ER → Golgi → surface pathway
      drawCell(ctx, state.cellX, state.cellY, r * 1.5, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
      }, time, 2);

      // ER region
      const erX = state.cellX - r * 0.6;
      const erY = state.cellY + r * 0.3;
      ctx.beginPath();
      ctx.ellipse(erX, erY, r * 0.4, r * 0.25, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100,170,200,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      drawText(ctx, 'ER', erX, erY, { fontSize: 8, color: 'rgba(100,170,200,0.4)', align: 'center' });

      // Golgi region
      const golgiX = state.cellX;
      const golgiY = state.cellY;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(golgiX, golgiY + (i - 1) * 8, r * 0.3, r * 0.08, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200,170,100,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      drawText(ctx, 'Golgi', golgiX, golgiY + 18, { fontSize: 8, color: 'rgba(200,170,100,0.4)', align: 'center' });

      // Surface point
      const surfAngle = -Math.PI * 0.3;
      const surfX = state.cellX + Math.cos(surfAngle) * r * 1.5;
      const surfY = state.cellY + Math.sin(surfAngle) * r * 1.5;

      // MHC complex traveling along pathway
      const pathProgress = easeOut(clamp(stageProgress * 1.3, 0, 1));
      let mhcTravelX: number, mhcTravelY: number;

      if (pathProgress < 0.33) {
        const t = pathProgress / 0.33;
        mhcTravelX = lerp(erX, golgiX, t);
        mhcTravelY = lerp(erY, golgiY, t);
      } else if (pathProgress < 0.66) {
        const t = (pathProgress - 0.33) / 0.33;
        mhcTravelX = lerp(golgiX, surfX, t);
        mhcTravelY = lerp(golgiY, surfY, t);
      } else {
        mhcTravelX = surfX;
        mhcTravelY = surfY;
      }

      // Vesicle carrying MHC
      ctx.beginPath();
      ctx.arc(mhcTravelX, mhcTravelY, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(140,180,220,0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140,180,220,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      drawMolecule(ctx, mhcTravelX, mhcTravelY, 3, PALETTE.protein.mutant, 'diamond');

      // Pathway arrows
      drawArrow(ctx, { x: erX + r * 0.4, y: erY }, { x: golgiX - r * 0.3, y: golgiY }, 'rgba(255,255,255,0.1)', 1, 4);
      drawArrow(ctx, { x: golgiX + r * 0.3, y: golgiY - 8 }, { x: surfX - 8, y: surfY + 8 }, 'rgba(255,255,255,0.1)', 1, 4);

      // Surface display
      if (pathProgress > 0.8) {
        drawReceptor(ctx, surfX, surfY, surfAngle + Math.PI / 2, PALETTE.protein.mutant, 'diamond', 10);
      }
    }

    // ---- Stage 6: T-cell checks peptide ----
    if (stage === 6) {
      // Cancer cell with displayed MHC
      drawCell(ctx, state.cellX, state.cellY, r * 1.2, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
      }, time, 2);
      drawNucleus(ctx, state.cellX, state.cellY, r * 0.3, PALETTE.cancer.accent);

      // MHC receptors on surface facing right
      for (let i = 0; i < 4; i++) {
        const angle = -Math.PI * 0.3 + i * Math.PI * 0.2;
        const rx = state.cellX + Math.cos(angle) * (r * 1.2 + 2);
        const ry = state.cellY + Math.sin(angle) * (r * 1.2 + 2);
        drawReceptor(ctx, rx, ry, angle + Math.PI / 2, 'rgba(140,180,220,0.4)', 'diamond', 8);
      }

      // T-cell approaching
      const approachProgress = easeOut(clamp(stageProgress * 1.5, 0, 1));
      const tcStartX = state.w * 0.9;
      const tcApproachX = lerp(tcStartX, state.tcellX, approachProgress);

      drawCell(ctx, tcApproachX, state.tcellY, r * 0.9, {
        fill: PALETTE.immune.fill,
        edge: PALETTE.immune.edge,
        glow: PALETTE.immune.glow,
      }, time, 2);
      drawNucleus(ctx, tcApproachX, state.tcellY, r * 0.25, PALETTE.immune.label);

      // TCR
      const tcrAngle = Math.PI;
      drawReceptor(ctx,
        tcApproachX + Math.cos(tcrAngle) * (r * 0.9 + 2),
        state.tcellY + Math.sin(tcrAngle) * (r * 0.9 + 2),
        tcrAngle + Math.PI / 2, PALETTE.immune.label, 'antibody', 10);

      drawText(ctx, 'Cancer cell', state.cellX, state.cellY + r * 1.2 + 16, {
        fontSize: 10, color: PALETTE.cancer.label, align: 'center',
      });
      drawText(ctx, 'CD8+ T-cell', tcApproachX, state.tcellY + r + 16, {
        fontSize: 10, color: PALETTE.immune.label, align: 'center',
      });

      // Scanning indicator
      if (stageProgress > 0.6) {
        drawText(ctx, 'Scanning...', (state.cellX + tcApproachX) / 2, state.cellY - r * 0.5, {
          fontSize: 10, color: PALETTE.signal.activation, align: 'center',
        });
      }
    }

    // ---- Stage 7: Recognition ----
    if (stage === 7) {
      // Cancer cell
      drawCell(ctx, state.cellX, state.cellY, r * 1.2, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
      }, time, 2);

      // MHC with peptide
      const mhcAngle = 0;
      const mhcRx = state.cellX + Math.cos(mhcAngle) * (r * 1.2 + 2);
      const mhcRy = state.cellY + Math.sin(mhcAngle) * (r * 1.2 + 2);
      drawReceptor(ctx, mhcRx, mhcRy, mhcAngle + Math.PI / 2, PALETTE.protein.mutant, 'diamond', 10);

      // T-cell docked
      drawCell(ctx, state.tcellX, state.tcellY, r * 0.9, {
        fill: PALETTE.immune.fill,
        edge: PALETTE.immune.edge,
        glow: PALETTE.immune.glow,
      }, time, 2);

      // TCR locked onto MHC
      const tcrX = state.tcellX + Math.cos(Math.PI) * (r * 0.9 + 2);
      const tcrY = state.tcellY;
      drawReceptor(ctx, tcrX, tcrY, Math.PI + Math.PI / 2, PALETTE.immune.label, 'antibody', 10);

      // Lock-and-key glow between TCR and MHC
      const lockX = (mhcRx + tcrX) / 2;
      const lockY = (mhcRy + tcrY) / 2;
      const matchGlow = 0.3 + Math.sin(time * 3) * 0.2;
      drawGlow(ctx, lockX, lockY, 20, PALETTE.signal.activation, matchGlow, time);

      // Connection line
      ctx.strokeStyle = `rgba(255,200,80,${(0.3 + stageProgress * 0.3).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mhcRx, mhcRy);
      ctx.lineTo(tcrX, tcrY);
      ctx.stroke();

      drawText(ctx, 'Match!', lockX, lockY - 18, {
        fontSize: 13, fontWeight: '600', color: PALETTE.signal.activation, align: 'center',
      });

      drawText(ctx, 'Cancer cell', state.cellX, state.cellY + r * 1.2 + 16, {
        fontSize: 10, color: PALETTE.cancer.label, align: 'center',
      });
      drawText(ctx, 'CD8+ T-cell', state.tcellX, state.tcellY + r + 16, {
        fontSize: 10, color: PALETTE.immune.label, align: 'center',
      });
    }

    // ---- Stage 8: Immune activation / kill ----
    if (stage === 8) {
      // Cancer cell weakening
      const deathAlpha = clamp(1 - stageProgress * 0.7, 0.3, 1);
      ctx.globalAlpha = deathAlpha;
      drawCell(ctx, state.cellX, state.cellY, r * 1.2, {
        fill: PALETTE.cancer.fill,
        edge: PALETTE.cancer.edge,
      }, time, 2);
      ctx.globalAlpha = 1;

      // T-cell activated
      drawCell(ctx, state.tcellX, state.tcellY, r * 0.9, {
        fill: PALETTE.immune.activated.fill,
        edge: PALETTE.immune.activated.edge,
        glow: PALETTE.immune.activated.glow,
      }, time, 2);
      drawGlow(ctx, state.tcellX, state.tcellY, r * 2, PALETTE.immune.activated.glow, 0.5, time);

      // Kill signals — perforin/granzyme
      if (stageProgress > 0.2) {
        const attackCount = Math.floor((stageProgress - 0.2) * 8);
        for (let i = 0; i < attackCount; i++) {
          const t = (i + 1) / 8;
          const ax = lerp(state.tcellX - r * 0.9, state.cellX + r * 1.2, t);
          const ay = state.tcellY + Math.sin(time * 5 + i * 1.5) * 8;
          drawMolecule(ctx, ax, ay, 3, PALETTE.signal.attack, 'triangle');
        }

        drawText(ctx, 'Perforin + Granzymes', (state.cellX + state.tcellX) / 2, state.cellY - r * 0.8, {
          fontSize: 10, color: PALETTE.signal.attack, align: 'center',
        });
      }

      // Death fragments
      if (stageProgress > 0.6) {
        const fragCount = Math.floor((stageProgress - 0.6) * 15);
        for (let i = 0; i < fragCount; i++) {
          const angle = (i / 6) * Math.PI * 2 + time * 0.3;
          const dist = r * 0.5 + (stageProgress - 0.6) * r * 2;
          const fx = state.cellX + Math.cos(angle) * dist;
          const fy = state.cellY + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(fx, fy, 2 + Math.random(), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(230,100,80,${(0.3 * (1 - stageProgress)).toFixed(3)})`;
          ctx.fill();
        }
      }

      drawText(ctx, 'Activated T-cell', state.tcellX, state.tcellY + r + 16, {
        fontSize: 10, color: PALETTE.immune.label, align: 'center',
      });
    }

    // ---- Stage 9: Immune memory ----
    if (stage === 9) {
      // Memory T-cells
      const memoryPositions = [
        { x: w * 0.2, y: h * 0.25 },
        { x: w * 0.45, y: h * 0.2 },
        { x: w * 0.7, y: h * 0.28 },
        { x: w * 0.3, y: h * 0.48 },
        { x: w * 0.6, y: h * 0.45 },
      ];

      for (let i = 0; i < memoryPositions.length; i++) {
        const mp = memoryPositions[i];
        const cellAlpha = clamp((stageProgress - i * 0.1) * 3, 0, 1);
        ctx.globalAlpha = cellAlpha;

        const cellR = r * 0.5;
        drawCell(ctx, mp.x, mp.y, cellR, {
          fill: PALETTE.immune.fill,
          edge: PALETTE.immune.edge,
          glow: PALETTE.immune.glow,
        }, time + i, 1);

        // Memory marker (M badge)
        if (cellAlpha > 0.5) {
          drawText(ctx, 'M', mp.x, mp.y, {
            fontSize: 9, fontWeight: '600', color: PALETTE.immune.label, align: 'center',
          });
        }
      }
      ctx.globalAlpha = 1;

      drawText(ctx, 'Memory T-cells', w * 0.5, h * 0.12, {
        fontSize: 14, fontWeight: '600', color: PALETTE.text.accent, align: 'center',
      });

      // "Faster response" note
      if (stageProgress > 0.5) {
        ctx.beginPath();
        ctx.roundRect(w * 0.15, h * 0.6, w * 0.7, h * 0.1, 6);
        ctx.fillStyle = 'rgba(140,130,230,0.06)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(140,130,230,0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        drawText(ctx, 'Ready to respond faster and stronger if cancer returns', w * 0.5, h * 0.65, {
          fontSize: 12, color: PALETTE.immune.label, align: 'center',
        });
      }
    }

    // ---- Controls ----
    const controlY = h - 45;
    state.stepperAreas = drawStepperDots(ctx, stage, STAGES.length, w / 2, controlY, 4, 13);
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
