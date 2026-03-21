// ============================================================================
// Canvas-Drawn UI Controls
// Stepper dots, play/pause, toggle, slider — all rendered on canvas
// ============================================================================

import { PALETTE } from './palette';
import { drawText, measureText } from './text';

export interface ControlHitArea {
  type: 'stepper' | 'play' | 'toggle' | 'slider' | 'button';
  x: number;
  y: number;
  width: number;
  height: number;
  index?: number; // For stepper dots
  value?: number; // For slider
}

// ============================================================================
// Stepper Dots
// ============================================================================

/** Draw clickable step indicator dots. Returns hit areas. */
export function drawStepperDots(
  ctx: CanvasRenderingContext2D,
  current: number,
  total: number,
  x: number,
  y: number,
  dotRadius: number = 5,
  gap: number = 16
): ControlHitArea[] {
  const hitAreas: ControlHitArea[] = [];
  const totalWidth = (total - 1) * gap;
  const startX = x - totalWidth / 2;

  for (let i = 0; i < total; i++) {
    const dx = startX + i * gap;
    const isActive = i === current;
    const isPast = i < current;

    ctx.beginPath();
    ctx.arc(dx, y, isActive ? dotRadius : dotRadius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = isActive
      ? PALETTE.ui.dotActive
      : isPast
        ? 'rgba(255,255,255,0.4)'
        : PALETTE.ui.dotInactive;
    ctx.fill();

    hitAreas.push({
      type: 'stepper',
      x: dx - dotRadius - 4,
      y: y - dotRadius - 4,
      width: dotRadius * 2 + 8,
      height: dotRadius * 2 + 8,
      index: i,
    });
  }

  return hitAreas;
}

// ============================================================================
// Play/Pause Button
// ============================================================================

/** Draw play/pause toggle. Returns hit area. */
export function drawPlayPause(
  ctx: CanvasRenderingContext2D,
  isPlaying: boolean,
  x: number,
  y: number,
  size: number = 14
): ControlHitArea {
  ctx.save();
  ctx.fillStyle = PALETTE.text.secondary;

  if (isPlaying) {
    // Pause: two bars
    const barW = size * 0.25;
    const barH = size;
    const gap = size * 0.2;
    ctx.fillRect(x - gap - barW, y - barH / 2, barW, barH);
    ctx.fillRect(x + gap, y - barH / 2, barW, barH);
  } else {
    // Play: triangle
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y - size * 0.5);
    ctx.lineTo(x + size * 0.5, y);
    ctx.lineTo(x - size * 0.35, y + size * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  return {
    type: 'play',
    x: x - size,
    y: y - size,
    width: size * 2,
    height: size * 2,
  };
}

// ============================================================================
// Progress Bar
// ============================================================================

/** Draw scrubable timeline bar. Returns hit area with current value. */
export function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  progress: number, // 0-1
  x: number,
  y: number,
  width: number,
  height: number = 4
): ControlHitArea {
  // Track
  ctx.fillStyle = PALETTE.ui.sliderTrack;
  ctx.beginPath();
  ctx.roundRect(x, y - height / 2, width, height, height / 2);
  ctx.fill();

  // Fill
  ctx.fillStyle = PALETTE.ui.sliderFill;
  ctx.beginPath();
  ctx.roundRect(x, y - height / 2, width * progress, height, height / 2);
  ctx.fill();

  // Thumb
  const thumbX = x + width * progress;
  ctx.beginPath();
  ctx.arc(thumbX, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.ui.sliderThumb;
  ctx.fill();

  return {
    type: 'slider',
    x,
    y: y - 12,
    width,
    height: 24,
    value: progress,
  };
}

// ============================================================================
// Toggle Switch
// ============================================================================

/** Draw on/off toggle with labels. Returns hit area. */
export function drawToggle(
  ctx: CanvasRenderingContext2D,
  isOn: boolean,
  x: number,
  y: number,
  labels?: { off: string; on: string }
): ControlHitArea {
  const trackW = 40;
  const trackH = 20;
  const thumbR = 8;

  // Labels
  if (labels) {
    drawText(ctx, labels.off, x - 8, y, {
      fontSize: 12,
      color: !isOn ? PALETTE.text.primary : PALETTE.text.tertiary,
      align: 'right',
    });
    drawText(ctx, labels.on, x + trackW + 8, y, {
      fontSize: 12,
      color: isOn ? PALETTE.text.primary : PALETTE.text.tertiary,
      align: 'left',
    });
  }

  // Track
  ctx.beginPath();
  ctx.roundRect(x, y - trackH / 2, trackW, trackH, trackH / 2);
  ctx.fillStyle = isOn ? PALETTE.ui.toggleOn : PALETTE.ui.toggleOff;
  ctx.fill();

  // Thumb
  const thumbX = isOn ? x + trackW - thumbR - 2 : x + thumbR + 2;
  ctx.beginPath();
  ctx.arc(thumbX, y, thumbR, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.ui.sliderThumb;
  ctx.fill();

  return {
    type: 'toggle',
    x,
    y: y - trackH / 2,
    width: trackW,
    height: trackH,
  };
}

// ============================================================================
// Slider
// ============================================================================

/** Draw continuous slider with labels. Returns hit area. */
export function drawSlider(
  ctx: CanvasRenderingContext2D,
  value: number,
  min: number,
  max: number,
  x: number,
  y: number,
  width: number,
  labels?: string[]
): ControlHitArea {
  const trackH = 4;
  const normalized = (value - min) / (max - min);

  // Track
  ctx.fillStyle = PALETTE.ui.sliderTrack;
  ctx.beginPath();
  ctx.roundRect(x, y - trackH / 2, width, trackH, trackH / 2);
  ctx.fill();

  // Fill
  ctx.fillStyle = PALETTE.ui.sliderFill;
  ctx.beginPath();
  ctx.roundRect(x, y - trackH / 2, width * normalized, trackH, trackH / 2);
  ctx.fill();

  // Thumb
  const thumbX = x + width * normalized;
  ctx.beginPath();
  ctx.arc(thumbX, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.ui.sliderThumb;
  ctx.fill();

  // Labels at discrete positions
  if (labels && labels.length > 0) {
    for (let i = 0; i < labels.length; i++) {
      const lx = x + (i / (labels.length - 1)) * width;
      const isClosest = Math.abs(normalized - i / (labels.length - 1)) <
        0.5 / (labels.length - 1);

      // Tick mark
      ctx.fillStyle = isClosest ? PALETTE.text.primary : PALETTE.text.tertiary;
      ctx.fillRect(lx - 0.5, y + 10, 1, 4);

      drawText(ctx, labels[i], lx, y + 22, {
        fontSize: 10,
        color: isClosest ? PALETTE.text.primary : PALETTE.text.tertiary,
        align: 'center',
        baseline: 'top',
      });
    }
  }

  return {
    type: 'slider',
    x,
    y: y - 12,
    width,
    height: 24,
    value: normalized,
  };
}

// ============================================================================
// Phase Label
// ============================================================================

/** Draw current phase/stage label */
export function drawPhaseLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
): void {
  drawText(ctx, text, x, y, {
    fontSize: 13,
    color: PALETTE.text.accent,
    align: 'center',
    fontWeight: '600',
  });
}

// ============================================================================
// Caption
// ============================================================================

/** Draw multi-line caption with word wrap */
export function drawCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
): number {
  // Use drawWrappedText from text module (inline here for self-containment)
  ctx.save();
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = PALETTE.text.secondary;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const words = text.split(' ');
  let line = '';
  const lineHeight = 20;
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
      line = words[i];
      lineCount++;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, y + lineCount * lineHeight);
    lineCount++;
  }

  ctx.restore();
  return lineCount * lineHeight;
}

// ============================================================================
// Button
// ============================================================================

/** Draw a labeled button. Returns hit area. */
export function drawButton(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  active: boolean = false
): ControlHitArea {
  const textW = measureText(ctx, text, 12, '600');
  const padX = 14;
  const padY = 8;
  const w = textW + padX * 2;
  const h = 12 + padY * 2;
  const bx = x - w / 2;
  const by = y - h / 2;

  ctx.beginPath();
  ctx.roundRect(bx, by, w, h, h / 2);
  ctx.fillStyle = active ? PALETTE.ui.toggleOn : PALETTE.ui.buttonFill;
  ctx.fill();

  drawText(ctx, text, x, y, {
    fontSize: 12,
    fontWeight: '600',
    color: active ? PALETTE.text.primary : PALETTE.text.secondary,
    align: 'center',
  });

  return {
    type: 'button',
    x: bx,
    y: by,
    width: w,
    height: h,
  };
}

// ============================================================================
// Hit Testing
// ============================================================================

/** Check if a point falls within a control's hit area */
export function hitTest(
  px: number,
  py: number,
  control: ControlHitArea
): boolean {
  return (
    px >= control.x &&
    px <= control.x + control.width &&
    py >= control.y &&
    py <= control.y + control.height
  );
}
