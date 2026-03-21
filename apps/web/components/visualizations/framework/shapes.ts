// ============================================================================
// Organic Cell/Membrane Rendering
// Procedural wobble, receptors, nuclei, DNA, molecules, glows
// ============================================================================

import { PALETTE } from './palette';

/** Draw an organic cell with multi-frequency sine wave wobble on the membrane */
export function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: { fill: string; edge: string; glow?: string },
  time: number,
  wobbleAmount: number = 3
): void {
  const segments = 64;

  // Glow
  if (color.glow) {
    const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 1.8);
    gradient.addColorStop(0, color.glow);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
  }

  // Membrane path with wobble
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const wobble =
      Math.sin(angle * 3 + time * 1.2) * wobbleAmount +
      Math.sin(angle * 5 + time * 0.8) * wobbleAmount * 0.5 +
      Math.sin(angle * 7 + time * 1.5) * wobbleAmount * 0.25;
    const r = radius + wobble;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  // Fill
  ctx.fillStyle = color.fill;
  ctx.fill();

  // Edge
  ctx.strokeStyle = color.edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/** Draw a wavy membrane line */
export function drawMembrane(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  color: string,
  thickness: number,
  time: number
): void {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    const wobble = Math.sin(i * 0.8 + time * 1.5) * 2;
    ctx.lineTo(points[i].x, points[i].y + wobble);
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.stroke();
}

/** Draw a surface receptor (Y-shaped antibody, diamond, or circle) */
export function drawReceptor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
  type: 'antibody' | 'diamond' | 'circle' = 'circle',
  size: number = 8
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  if (type === 'antibody') {
    // Y-shaped
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -size * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.6);
    ctx.lineTo(-size * 0.4, -size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.6);
    ctx.lineTo(size * 0.4, -size);
    ctx.stroke();
    // Tips
    ctx.beginPath();
    ctx.arc(-size * 0.4, -size, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.4, -size, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'diamond') {
    const s = size * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.6, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s * 0.6, 0);
    ctx.closePath();
    ctx.fill();
  } else {
    // Circle on a stem
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -size * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -size * 0.7, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Draw cell nucleus with chromatin texture */
export function drawNucleus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
): void {
  // Nucleus fill
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Chromatin dots
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = radius * 0.3 + Math.sin(i * 2.7) * radius * 0.2;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Draw a double helix DNA segment */
export function drawDNA(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  color: string,
  damaged: boolean = false,
  time: number = 0
): void {
  const segments = 20;
  const amplitude = 8;
  const period = length / 3;

  for (let strand = 0; strand < 2; strand++) {
    const offset = strand * Math.PI;
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const px = x + t * length;
      const py = y + Math.sin(t * Math.PI * 2 * (length / period) + time + offset) * amplitude;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = damaged ? PALETTE.dna.damaged : color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Base pair rungs
  ctx.strokeStyle = damaged ? PALETTE.dna.damaged : color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < segments; i += 2) {
    const t = i / segments;
    const px = x + t * length;
    const py1 = y + Math.sin(t * Math.PI * 2 * (length / period) + time) * amplitude;
    const py2 = y + Math.sin(t * Math.PI * 2 * (length / period) + time + Math.PI) * amplitude;
    ctx.beginPath();
    ctx.moveTo(px, py1);
    ctx.lineTo(px, py2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Draw a small molecule (circle, hexagon, or triangle) */
export function drawMolecule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  type: 'circle' | 'hexagon' | 'triangle' | 'diamond' = 'circle'
): void {
  ctx.fillStyle = color;
  ctx.beginPath();

  if (type === 'hexagon') {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (type === 'triangle') {
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (type === 'diamond') {
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x + radius * 0.7, y);
    ctx.lineTo(x, y + radius);
    ctx.lineTo(x - radius * 0.7, y);
    ctx.closePath();
  } else {
    ctx.arc(x, y, radius, 0, Math.PI * 2);
  }

  ctx.fill();
}

/** Draw a signal/flow arrow */
export function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  color: string,
  thickness: number = 2,
  headSize: number = 8
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);

  // Shaft
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x - Math.cos(angle) * headSize, to.y - Math.sin(angle) * headSize);
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - Math.cos(angle - Math.PI / 6) * headSize,
    to.y - Math.sin(angle - Math.PI / 6) * headSize
  );
  ctx.lineTo(
    to.x - Math.cos(angle + Math.PI / 6) * headSize,
    to.y - Math.sin(angle + Math.PI / 6) * headSize
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/** Draw a pulsing radial gradient glow */
export function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  intensity: number,
  time: number
): void {
  const pulse = 0.8 + Math.sin(time * 2) * 0.2;
  const r = radius * pulse;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);

  // Parse color to adjust alpha
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return;
  const cr = match[1], cg = match[2], cb = match[3];
  const baseAlpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
  const a = baseAlpha * intensity;

  gradient.addColorStop(0, `rgba(${cr},${cg},${cb},${(a * 0.8).toFixed(3)})`);
  gradient.addColorStop(0.5, `rgba(${cr},${cg},${cb},${(a * 0.3).toFixed(3)})`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw antibody Y-shape (standalone, for ADC etc.) */
export function drawAntibody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  // Stem
  ctx.beginPath();
  ctx.moveTo(0, size * 0.5);
  ctx.lineTo(0, 0);
  ctx.stroke();

  // Left arm
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.4, -size * 0.4);
  ctx.stroke();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.4, -size * 0.4);
  ctx.stroke();

  // Binding tips
  ctx.beginPath();
  ctx.arc(-size * 0.4, -size * 0.4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.4, -size * 0.4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
