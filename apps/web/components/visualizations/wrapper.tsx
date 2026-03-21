'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { VISUALIZATION_REGISTRY } from './registry';
import { createAriaDescription, prefersReducedMotion, setupKeyboardNav } from './framework/accessibility';
import { PALETTE } from './framework/palette';

// ============================================================================
// Scene Interface — every scene module exports this
// ============================================================================

export interface SceneAPI {
  update: (dt: number) => void;
  destroy: () => void;
  resize: (w: number, h: number) => void;
  onPointerDown?: (x: number, y: number) => void;
  onPointerMove?: (x: number, y: number) => void;
  onPointerUp?: (x: number, y: number) => void;
  getStage?: () => number;
  nextStage?: () => void;
  prevStage?: () => void;
  toggle?: () => void;
}

// ============================================================================
// VisualizationEmbed Component
// ============================================================================

interface VisualizationEmbedProps {
  vizId: string;
  className?: string;
}

export function VisualizationEmbed({ vizId, className }: VisualizationEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneAPI | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const entry = VISUALIZATION_REGISTRY[vizId];
  if (!entry) return null;

  // Get logical canvas dimensions (CSS pixels)
  const getLogicalSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return { width: 800, height: 450 };
    const width = container.clientWidth;
    const height = Math.round(width * 9 / 16); // 16:9 aspect ratio
    return { width, height };
  }, []);

  // Set up canvas with DPI scaling
  const setupCanvas = useCallback((canvas: HTMLCanvasElement, width: number, height: number) => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    return ctx;
  }, []);

  // Convert pointer event to canvas-local coordinates
  const getPointerPos = useCallback((e: PointerEvent | MouseEvent | TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let destroyed = false;
    let cleanupKeyboard: (() => void) | undefined;

    // IntersectionObserver: load scene only when visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !sceneRef.current && !destroyed) {
          loadScene();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    async function loadScene() {
      try {
        const mod = await entry.load();
        if (destroyed) return;

        const { width, height } = getLogicalSize();
        const ctx = setupCanvas(canvas!, width, height);
        if (!ctx) return;

        const scene = mod.init(canvas!, ctx, width, height);
        sceneRef.current = scene;
        setLoaded(true);

        // Keyboard navigation
        cleanupKeyboard = setupKeyboardNav(canvas!, {
          onNext: () => scene.nextStage?.(),
          onPrev: () => scene.prevStage?.(),
          onToggle: () => scene.toggle?.(),
        });

        // Aria description
        canvas!.setAttribute('aria-label', createAriaDescription(vizId));

        // Start render loop
        lastTimeRef.current = performance.now();
        const reducedMotion = prefersReducedMotion();

        function frame(time: number) {
          if (destroyed) return;
          const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
          lastTimeRef.current = time;

          if (!reducedMotion || dt === 0) {
            scene.update(dt);
          } else {
            scene.update(0); // Still render, just no animation
          }

          rafRef.current = requestAnimationFrame(frame);
        }

        rafRef.current = requestAnimationFrame(frame);
      } catch (err) {
        console.error(`Failed to load visualization ${vizId}:`, err);
        setError(true);
      }
    }

    // Pointer events
    function onPointerDown(e: PointerEvent) {
      const pos = getPointerPos(e);
      if (pos) sceneRef.current?.onPointerDown?.(pos.x, pos.y);
    }
    function onPointerMove(e: PointerEvent) {
      const pos = getPointerPos(e);
      if (pos) sceneRef.current?.onPointerMove?.(pos.x, pos.y);
    }
    function onPointerUp(e: PointerEvent) {
      const pos = getPointerPos(e);
      if (pos) sceneRef.current?.onPointerUp?.(pos.x, pos.y);
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);

    // Resize handler
    let resizeTimeout: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (destroyed || !sceneRef.current) return;
        const { width, height } = getLogicalSize();
        setupCanvas(canvas!, width, height);
        sceneRef.current.resize(width, height);
      }, 150);
    }

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    return () => {
      destroyed = true;
      observer.disconnect();
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      cleanupKeyboard?.();
      sceneRef.current?.destroy();
      sceneRef.current = null;
    };
  }, [vizId]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 896,
        margin: '32px auto',
        borderRadius: 12,
        overflow: 'hidden',
        background: PALETTE.bg.deep,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: '12px 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            background: 'rgba(110,180,255,0.6)',
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {entry.title}
        </span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          cursor: 'pointer',
          touchAction: 'none',
        }}
        role="img"
        aria-label={entry.title}
      />

      {/* Loading skeleton */}
      {!loaded && !error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: PALETTE.bg.deep,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: '2px solid rgba(255,255,255,0.1)',
              borderTopColor: 'rgba(110,180,255,0.5)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: PALETTE.bg.deep,
            color: 'rgba(255,255,255,0.4)',
            fontSize: 14,
          }}
        >
          Visualization unavailable
        </div>
      )}

      <noscript>
        <p style={{ color: 'rgba(255,255,255,0.6)', padding: 16, fontSize: 14 }}>
          {entry.description ?? `Interactive visualization: ${entry.title}`}
        </p>
      </noscript>
    </div>
  );
}
