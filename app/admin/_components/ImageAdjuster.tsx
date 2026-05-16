'use client';

import { useRef } from 'react';
import { useAdminT } from './AdminLang';

function parsePosition(pos: string | undefined): { x: number; y: number } {
  const parts = (pos || '50% 50%').split(' ');
  const x = parseFloat(parts[0]);
  const y = parseFloat(parts[1]);
  return {
    x: Number.isFinite(x) ? x : 50,
    y: Number.isFinite(y) ? y : 50,
  };
}

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const clampScale = (s: number) =>
  Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));

export default function ImageAdjuster({
  src,
  position,
  onChange,
  aspectClass = 'aspect-square',
  scale = 1,
  onScaleChange,
}: {
  src: string;
  position: string;
  onChange: (pos: string) => void;
  aspectClass?: string;
  scale?: number;
  onScaleChange?: (scale: number) => void;
}) {
  const { t } = useAdminT();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    posX: number;
    posY: number;
  } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(
    new Map()
  );
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(
    null
  );

  const { x: posX, y: posY } = parsePosition(position);

  const twoPointerDistance = () => {
    const pts = Array.from(pointersRef.current.values());
    if (pts.length < 2) return 0;
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    return Math.hypot(dx, dy);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (onScaleChange && pointersRef.current.size >= 2) {
      pinchRef.current = {
        startDist: twoPointerDistance(),
        startScale: scale,
      };
      dragStartRef.current = null;
      return;
    }
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      posX,
      posY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (
      onScaleChange &&
      pinchRef.current &&
      pointersRef.current.size >= 2
    ) {
      const dist = twoPointerDistance();
      if (pinchRef.current.startDist > 0 && dist > 0) {
        onScaleChange(
          clampScale(
            pinchRef.current.startScale *
              (dist / pinchRef.current.startDist)
          )
        );
      }
      return;
    }

    const start = dragStartRef.current;
    if (!start || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    // Drag the photo so it follows the finger: moving down reveals the top,
    // which lowers object-position Y. Hence subtract the pointer delta.
    const dxPct = ((e.clientX - start.pointerX) / rect.width) * 100;
    const dyPct = ((e.clientY - start.pointerY) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, start.posX - dxPct));
    const clampedY = Math.max(0, Math.min(100, start.posY - dyPct));

    onChange(`${clampedX}% ${clampedY}%`);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
    // Avoid a jump if one finger remains after a pinch — require a fresh
    // press to start repositioning again.
    dragStartRef.current = null;
  };

  return (
    <div className="space-y-1.5">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full ${aspectClass} cursor-grab active:cursor-grabbing overflow-hidden rounded-xl border border-border bg-secondary touch-none select-none`}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="h-full w-full object-cover pointer-events-none select-none transition-transform"
          style={{
            objectPosition: `${posX}% ${posY}%`,
            transform: `scale(${scale})`,
            transformOrigin: 'center',
          }}
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 h-full w-full border-2 border-dashed border-white/30" />
          <div className="absolute top-1/3 left-0 h-px w-full bg-white/20" />
          <div className="absolute top-2/3 left-0 h-px w-full bg-white/20" />
          <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" />
          <div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
        </div>
      </div>

      {onScaleChange && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">100%</span>
          <input
            type="range"
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={0.05}
            value={scale}
            onChange={(e) => onScaleChange(clampScale(Number(e.target.value)))}
            className="flex-1 accent-accent"
            aria-label={t.zoom}
          />
          <span className="text-xs text-muted-foreground">300%</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {t.dragHint} • X: {Math.round(posX)}%, Y: {Math.round(posY)}%
        {onScaleChange ? ` • ${t.zoom}: ${Math.round(scale * 100)}%` : ''}
      </p>
    </div>
  );
}
