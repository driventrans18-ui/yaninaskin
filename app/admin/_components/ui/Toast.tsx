'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number; // ms; default 4000 (10000 when an action is present)
  action?: { label: string; onClick: () => void | Promise<void> };
}

interface ToastItem extends ToastOptions {
  id: number;
}

const ToastContext = createContext<{ toast: (o: ToastOptions) => number; dismiss: (id: number) => void }>({
  toast: () => 0,
  dismiss: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    const tm = timers.current.get(id);
    if (tm) clearTimeout(tm);
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (o: ToastOptions) => {
      const id = nextId.current++;
      const duration = o.duration ?? (o.action ? 10000 : 4000);
      setItems((prev) => [...prev.slice(-2), { ...o, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((tm) => clearTimeout(tm));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[90] flex flex-col items-center gap-2 px-4 md:top-auto md:bottom-6"
        aria-live="polite"
        aria-atomic="false"
      >
        {items.map((it) => {
          const Icon = it.tone === 'error' ? AlertCircle : it.tone === 'info' ? Info : CheckCircle2;
          return (
            <div
              key={it.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-border bg-foreground px-4 py-3 text-background shadow-xl animate-in slide-in-from-top-2 fade-in-0 duration-200 md:slide-in-from-bottom-2"
            >
              <Icon className={`size-5 shrink-0 ${it.tone === 'error' ? 'text-red-300' : 'text-accent'}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{it.title}</p>
                {it.description && <p className="text-xs text-background/70">{it.description}</p>}
              </div>
              {it.action && (
                <button
                  type="button"
                  onClick={async () => {
                    dismiss(it.id);
                    await it.action?.onClick();
                  }}
                  className="min-h-[44px] shrink-0 rounded-full border border-background/30 px-3 text-sm font-semibold hover:bg-background/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {it.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(it.id)}
                aria-label="Dismiss"
                className="-mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-background/60 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
