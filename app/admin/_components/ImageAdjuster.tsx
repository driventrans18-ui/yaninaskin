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

export default function ImageAdjuster({
  src,
  position,
  onChange,
  aspectClass = 'aspect-square',
}: {
  src: string;
  position: string;
  onChange: (pos: string) => void;
  aspectClass?: string;
}) {
  const { t } = useAdminT();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    posX: number;
    posY: number;
  } | null>(null);

  const { x: posX, y: posY } = parsePosition(position);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      posX,
      posY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
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
          className="h-full w-full object-cover pointer-events-none select-none"
          style={{ objectPosition: `${posX}% ${posY}%` }}
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 h-full w-full border-2 border-dashed border-white/30" />
          <div className="absolute top-1/3 left-0 h-px w-full bg-white/20" />
          <div className="absolute top-2/3 left-0 h-px w-full bg-white/20" />
          <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" />
          <div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {t.dragHint} • X: {Math.round(posX)}%, Y: {Math.round(posY)}%
      </p>
    </div>
  );
}
