'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import TreatmentMedia from './TreatmentMedia';

export default function GalleryLightbox({
  before,
  after,
  beforePos,
  afterPos,
  title,
  beforeLabel,
  afterLabel,
  closeLabel,
  onClose,
}: {
  before: string;
  after?: string;
  beforePos?: string;
  afterPos?: string;
  title: string;
  beforeLabel: string;
  afterLabel: string;
  closeLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute -top-10 right-0 z-10 text-background/80 hover:text-background transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        <TreatmentMedia
          before={before}
          after={after}
          beforePos={beforePos}
          afterPos={afterPos}
          title={title}
          beforeLabel={beforeLabel}
          afterLabel={afterLabel}
          aspectClass="aspect-square"
        />
      </div>
    </div>
  );
}
