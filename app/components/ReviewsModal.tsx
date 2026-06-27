'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import ReviewForm from './ReviewForm';

// A card/modal that lets visitors read all reviews and write one. The body is
// the existing ReviewForm in "embedded" mode; the card uses the same inverted
// dark surface the review UI is styled for, so nothing needs re-theming.
export default function ReviewsModal({
  title,
  closeLabel,
  openForm = false,
  onClose,
}: {
  title: string;
  closeLabel: string;
  openForm?: boolean;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--surface-inverted)] text-[var(--surface-inverted-foreground)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--surface-inverted-border)] bg-[var(--surface-inverted)] px-6 py-4">
          <h3 className="text-lg">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="text-[var(--surface-inverted-muted)] transition-colors hover:text-[var(--surface-inverted-foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-2 pb-6 sm:px-4">
          <ReviewForm embedded initialFormOpen={openForm} />
        </div>
      </div>
    </div>
  );
}
