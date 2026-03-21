// ============================================================================
// State Interpolation Helpers
// Exponential ease-out, color lerp, point lerp, timing functions
// ============================================================================

/** Exponential ease-out: current approaches target smoothly */
export function lerp(current: number, target: number, speed: number): number {
  return current + (target - current) * speed;
}

/** Interpolate between two RGBA color strings */
export function lerpColor(from: string, to: string, t: number): string {
  const f = parseRGBA(from);
  const tgt = parseRGBA(to);
  if (!f || !tgt) return to;
  const r = Math.round(f.r + (tgt.r - f.r) * t);
  const g = Math.round(f.g + (tgt.g - f.g) * t);
  const b = Math.round(f.b + (tgt.b - f.b) * t);
  const a = f.a + (tgt.a - f.a) * t;
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

/** Interpolate between two {x, y} points */
export function lerpPoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number
): { x: number; y: number } {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}

/** Clamp value to [min, max] */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Map value from one range to another */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/** Smooth ease-in-out (cubic) */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Smooth ease-out (cubic) */
export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Smooth ease-in (cubic) */
export function easeIn(t: number): number {
  return t * t * t;
}

/** Smoothstep (Hermite interpolation) */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// ============================================================================
// Internal: Parse RGBA color string
// ============================================================================

function parseRGBA(color: string): { r: number; g: number; b: number; a: number } | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return null;
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
    a: match[4] !== undefined ? parseFloat(match[4]) : 1,
  };
}
