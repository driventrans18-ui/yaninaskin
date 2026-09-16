'use client';

import type { ReactNode } from 'react';
import { Search, X, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminT } from '../AdminLang';

// ── Skeletons ─────────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export function CardSkeleton({ count = 3, lines = 3 }: { count?: number; lines?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border p-4">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: lines - 1 }).map((__, j) => (
            <Skeleton key={j} className={`mt-2.5 h-3 ${j % 2 ? 'w-1/2' : 'w-2/3'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Empty / error states ───────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  body,
  action,
  compact = false,
}: {
  icon?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center rounded-2xl border border-dashed border-border text-center ${compact ? 'px-4 py-8' : 'px-6 py-14'}`}>
      {icon && <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-accent/15 text-foreground [&_svg]:size-5">{icon}</div>}
      <h3 className="font-serif text-xl">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, body, onRetry }: { title?: ReactNode; body?: ReactNode; onRetry?: () => void }) {
  const { t } = useAdminT();
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-amber-500/40 bg-amber-500/5 px-6 py-10 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-800">
        <AlertTriangle className="size-5" aria-hidden />
      </div>
      <h3 className="font-serif text-xl">{title ?? t.errorTitle}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body ?? t.errorBody}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4 h-11" onClick={onRetry}>
          <RefreshCw aria-hidden /> {t.retry}
        </Button>
      )}
    </div>
  );
}

// ── Chips ─────────────────────────────────────────────────────────────
export type ChipTone = 'neutral' | 'accent' | 'dark' | 'warn' | 'success' | 'muted' | 'outline' | 'info';

const CHIP_TONES: Record<ChipTone, string> = {
  neutral: 'bg-secondary text-secondary-foreground',
  accent: 'bg-accent/25 text-foreground',
  dark: 'bg-primary text-primary-foreground',
  warn: 'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300/70',
  success: 'bg-emerald-50 text-emerald-900 ring-1 ring-inset ring-emerald-300/70',
  muted: 'bg-muted text-muted-foreground',
  outline: 'border border-border text-muted-foreground',
  info: 'bg-sky-50 text-sky-900 ring-1 ring-inset ring-sky-300/70',
};

export function Chip({
  tone = 'neutral',
  size = 'sm',
  icon,
  children,
  className = '',
  title,
}: {
  tone?: ChipTone;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full font-medium ${
        size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px] leading-4'
      } ${CHIP_TONES[tone]} ${className} [&_svg]:size-3`}
    >
      {icon}
      {children}
    </span>
  );
}

// ── Segmented control (scrollable pills with counts) ──────────────────
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  ariaLabel: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
            }`}
          >
            {o.label}
            {typeof o.count === 'number' && (
              <span className={`rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${active ? 'bg-background/20' : 'bg-muted'}`}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Inputs ─────────────────────────────────────────────────────────────
export function SearchInput({
  value,
  onChange,
  placeholder,
  className = '',
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const { t } = useAdminT();
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
        className="h-11 w-full rounded-full border border-input bg-background pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t.clearFilters}
          className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  className = '',
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      <span
        className={`flex size-5 items-center justify-center rounded-md border transition-colors ${
          checked ? 'border-foreground bg-foreground text-background' : 'border-input bg-background'
        }`}
      >
        {checked && <Check className="size-3.5" aria-hidden />}
      </span>
    </button>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex min-h-[44px] w-full items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
    >
      <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-foreground' : 'bg-border'}`}>
        <span className={`inline-block size-5 rounded-full bg-background shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </span>
      <span className="min-w-0 flex-1 text-sm">
        <span className="block font-medium text-foreground">{label}</span>
        {description && <span className="block text-xs text-muted-foreground">{description}</span>}
      </span>
    </button>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  required,
}: {
  label: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-accent-foreground/70" aria-hidden>*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// Section heading used inside drawers and settings cards.
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{children}</h3>
      {action}
    </div>
  );
}

// Copies text and briefly shows a check mark.
export function CopyButton({ text, label }: { text: string; label: string }) {
  const { t } = useAdminT();
  return (
    <button
      type="button"
      onClick={async (e) => {
        const btn = e.currentTarget;
        try {
          await navigator.clipboard.writeText(text);
          btn.dataset.copied = '1';
          setTimeout(() => delete btn.dataset.copied, 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      aria-label={`${label}: ${t.copy}`}
      className="group flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[copied=1]:text-emerald-700"
    >
      <Check className="hidden size-4 group-data-[copied=1]:block" aria-hidden />
      <svg className="size-4 group-data-[copied=1]:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V6a2 2 0 0 1 2-2h9" />
      </svg>
    </button>
  );
}
