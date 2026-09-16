'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft } from 'lucide-react';
import { useIsMobile } from './useMediaQuery';
import { useAdminT } from '../AdminLang';

// Detail drawer: slides in from the right on desktop, becomes a full-screen
// sheet on phones. Traps focus loosely (first focusable gets focus, Tab cycles
// within), closes on Escape / backdrop tap, and locks body scroll.
export default function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  headerExtra,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
  headerExtra?: ReactNode;
}) {
  const { t } = useAdminT();
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);
    const timer = setTimeout(() => {
      const first = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0];
      first?.focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab') {
        const els = focusables();
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const width = size === 'lg' ? 'md:max-w-2xl' : 'md:max-w-xl';

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="presentation">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-background shadow-2xl ${width} ${
          isMobile ? 'animate-in slide-in-from-bottom-4 duration-200' : 'animate-in slide-in-from-right-8 duration-200'
        } md:border-l md:border-border`}
      >
        <header className="flex items-start gap-3 border-b border-border px-4 py-3 md:px-6 md:py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1 pt-1.5 md:pt-0">
            {title && <h2 className="truncate font-serif text-xl leading-tight md:text-2xl">{title}</h2>}
            {subtitle && <div className="mt-0.5 text-sm text-muted-foreground">{subtitle}</div>}
          </div>
          {headerExtra}
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="hidden size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6 md:py-5">{children}</div>
        {footer && (
          <footer className="border-t border-border bg-background px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
