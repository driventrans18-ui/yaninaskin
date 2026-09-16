'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Overflow / dropdown menu built on the existing Radix popover. Items are
// buttons with role="menuitem"; arrow keys move focus, Escape closes.
export function Menu({
  trigger,
  children,
  align = 'end',
  label,
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'end' | 'center';
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      listRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
    }, 20);
    return () => clearTimeout(timer);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} sideOffset={6} className="w-60 p-1.5" aria-label={label}>
        <div ref={listRef} role="menu" onKeyDown={onKeyDown} onClick={() => setOpen(false)}>
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function MenuItem({
  children,
  onSelect,
  icon,
  danger = false,
  disabled = false,
  href,
  download,
}: {
  children: ReactNode;
  onSelect?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  href?: string;
  download?: string;
}) {
  const cls = `flex w-full min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:bg-muted hover:bg-muted disabled:opacity-50 ${
    danger ? 'text-destructive' : 'text-foreground'
  }`;
  if (href) {
    return (
      <a role="menuitem" href={href} className={cls} download={download} onClick={onSelect}>
        {icon && <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>}
        <span className="flex-1">{children}</span>
      </a>
    );
  }
  return (
    <button type="button" role="menuitem" onClick={onSelect} disabled={disabled} className={cls}>
      {icon && <span className={danger ? '[&_svg]:size-4' : 'text-muted-foreground [&_svg]:size-4'}>{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}
