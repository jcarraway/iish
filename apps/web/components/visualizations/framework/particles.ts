// ============================================================================
// Ambient Particle System — Brownian Motion
// Subtle floating white particles for cinematic depth
// ============================================================================

import { PALETTE } from './palette';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  phase: number;
}

export interface ParticleSystem {
  particles: Particle[];
  bounds: { width: number; height: number };
}

/** Create a particle system with random initial positions */
export function createParticleSystem(
  count: number,
  bounds: { width: number; height: number }
): ParticleSystem {
  const particles: Particle[] = [];
  const [minOpacity, maxOpacity] = PALETTE.particle.opacityRange;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 1 + Math.random() * 1.5,
      opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
      phase: Math.random() * Math.PI * 2,
    });
  }

  return { particles, bounds };
}

/** Update particle positions with Brownian drift */
export function updateParticles(system: ParticleSystem, dt: number): void {
  const { particles, bounds } = system;
  const cappedDt = Math.min(dt, 0.05); // Cap at 50ms to avoid jumps

  for (const p of particles) {
    // Brownian motion: random nudge each frame
    p.vx += (Math.random() - 0.5) * 0.1;
    p.vy += (Math.random() - 0.5) * 0.1;

    // Damping
    p.vx *= 0.98;
    p.vy *= 0.98;

    p.x += p.vx * cappedDt * 60;
    p.y += p.vy * cappedDt * 60;

    // Opacity flicker
    p.phase += cappedDt * 0.5;
    const [minOpacity, maxOpacity] = PALETTE.particle.opacityRange;
    p.opacity = minOpacity + (Math.sin(p.phase) * 0.5 + 0.5) * (maxOpacity - minOpacity);

    // Wrap around bounds
    if (p.x < -10) p.x = bounds.width + 10;
    if (p.x > bounds.width + 10) p.x = -10;
    if (p.y < -10) p.y = bounds.height + 10;
    if (p.y > bounds.height + 10) p.y = -10;
  }
}

/** Render all particles */
export function drawParticles(
  ctx: CanvasRenderingContext2D,
  system: ParticleSystem
): void {
  for (const p of system.particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p.opacity.toFixed(3)})`;
    ctx.fill();
  }
}

/** Resize particle system bounds */
export function resizeParticleSystem(
  system: ParticleSystem,
  width: number,
  height: number
): void {
  system.bounds.width = width;
  system.bounds.height = height;
}
