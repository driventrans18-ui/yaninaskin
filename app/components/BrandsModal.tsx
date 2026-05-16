'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function BrandsModal({
  brands,
  title,
  closeLabel,
  andMoreLabel,
  onClose,
}: {
  brands: { name: string; logo?: string }[];
  title: string;
  closeLabel: string;
  andMoreLabel: string;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <Card
        className="w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <h3 className="text-xl">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="divide-y divide-border">
          {brands.map((brand, i) => (
            <div key={`${brand.name}-${i}`} className="flex items-center gap-3 py-3">
              {brand.logo && (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-10 w-10 rounded-md object-contain bg-secondary"
                />
              )}
              <span className="text-sm font-medium text-foreground">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
        <p className="pt-4 text-center text-sm italic text-muted-foreground">
          {andMoreLabel}
        </p>
      </Card>
    </div>
  );
}
