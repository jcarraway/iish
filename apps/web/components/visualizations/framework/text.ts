// ============================================================================
// DPI-Aware Text Rendering
// Labels, captions, badges — crisp at any devicePixelRatio
// ============================================================================

import { PALETTE } from './palette';

export interface TextOptions {
  fontSize?: number;
  color?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  maxWidth?: number;
  fontWeight?: 'normal' | 'bold' | '600';
  fontFamily?: string;
}

const DEFAULT_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** Draw single-line text */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: TextOptions = {}
): void {
  const {
    fontSize = 14,
    color = PALETTE.text.primary,
    align = 'left',
    baseline = 'middle',
    maxWidth,
    fontWeight = 'normal',
    fontFamily = DEFAULT_FONT,
  } = opts;

  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (maxWidth) {
    ctx.fillText(text, x, y, maxWidth);
  } else {
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

/** Draw word-wrapped text, returns total height used */
export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  opts: TextOptions = {}
): number {
  const {
    fontSize = 14,
    color = PALETTE.text.secondary,
    fontWeight = 'normal',
    fontFamily = DEFAULT_FONT,
    align = 'left',
  } = opts;

  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';

  const words = text.split(' ');
  let line = '';
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

/** Measure text width */
export function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSize: number = 14,
  fontWeight: string = 'normal'
): number {
  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${DEFAULT_FONT}`;
  const w = ctx.measureText(text).width;
  ctx.restore();
  return w;
}

/** Draw rounded badge with text */
export function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  bgColor: string,
  fgColor: string,
  fontSize: number = 11
): { width: number; height: number } {
  ctx.save();
  ctx.font = `600 ${fontSize}px ${DEFAULT_FONT}`;
  const textWidth = ctx.measureText(text).width;
  const paddingX = 8;
  const paddingY = 4;
  const width = textWidth + paddingX * 2;
  const height = fontSize + paddingY * 2;
  const radius = height / 2;

  // Background
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();

  // Text
  ctx.fillStyle = fgColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width / 2, y + height / 2);

  ctx.restore();
  return { width, height };
}
