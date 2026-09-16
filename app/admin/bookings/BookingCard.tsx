'use client';

import { AlertTriangle, Clock, Copy, Repeat2, Sparkles, UserRound } from 'lucide-react';
import type { BookingGroup } from '@/lib/booking/duplicates';
import { statusOf } from '@/lib/booking/status';
import { useAdminT } from '../_components/AdminLang';
import { Chip, Checkbox } from '../_components/ui/Bits';
import type { GroupDecor } from './useBookingsModel';
import { displayName, formatPreferred, statusLabel, methodLabel } from './bookingFormat';
import type { BookingStatus } from '@/lib/booking/types';

const STATUS_TONE: Record<BookingStatus, 'accent' | 'warn' | 'dark' | 'success' | 'muted' | 'outline' | 'info'> = {
  new: 'accent',
  contacted: 'info',
  confirmed: 'dark',
  completed: 'success',
  declined: 'muted',
  cancelled: 'muted',
  no_show: 'muted',
  archived: 'outline',
};

export function StatusChip({ status, size = 'sm' }: { status: BookingStatus; size?: 'sm' | 'md' }) {
  const { t } = useAdminT();
  return (
    <Chip tone={STATUS_TONE[status]} size={size}>
      {statusLabel(status, t)}
    </Chip>
  );
}

export default function BookingCard({
  group,
  decor,
  tz,
  now,
  selectMode,
  selected,
  onToggleSelect,
  onOpen,
}: {
  group: BookingGroup;
  decor: GroupDecor;
  tz: string;
  now: Date;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}) {
  const { t, lang, fmt } = useAdminT();
  const b = group.primary;
  const status = statusOf(b);
  const unread = group.unread;
  const hasConflict = decor.conflicts.some((c) => c.kind === 'confirmed_overlap' || c.kind === 'pending_overlap');
  const otherConflict = decor.conflicts.find((c) => c.kind === 'outside_hours' || c.kind === 'blackout' || c.kind === 'blocked');
  const showUrgent = decor.needsAction && decor.timing === 'urgent';
  const showExpired = decor.needsAction && decor.timing === 'expired';

  return (
    <article
      className={`group relative flex items-stretch gap-2 rounded-2xl border bg-card transition-colors ${
        selected ? 'border-foreground' : 'border-border hover:border-foreground/30'
      } ${unread ? 'shadow-[inset_3px_0_0_0_var(--accent)]' : ''}`}
    >
      {selectMode && (
        <div className="flex items-center pl-2">
          <Checkbox checked={selected} onChange={onToggleSelect} label={displayName(b, t)} />
        </div>
      )}
      <button
        type="button"
        onClick={selectMode ? onToggleSelect : onOpen}
        className={`flex min-h-[72px] flex-1 flex-col gap-1.5 rounded-2xl px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectMode ? 'pl-1' : ''}`}
        aria-label={`${displayName(b, t)} · ${b.service || t.unknownService}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`truncate text-[15px] leading-snug ${unread ? 'font-semibold text-foreground' : 'font-medium text-foreground/90'}`}>
              {displayName(b, t)}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {b.service || t.unknownService}
              {b.price ? <span className="ml-1.5 rounded-full bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">{b.price}</span> : null}
            </p>
          </div>
          <StatusChip status={status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className={`inline-flex items-center gap-1 ${decor.timing === 'expired' ? 'text-muted-foreground line-through decoration-muted-foreground/40' : 'text-foreground'}`}>
            <Clock className="size-3.5 text-muted-foreground" aria-hidden />
            {formatPreferred(b, { lang, tz, t, now })}
          </span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {t.via} {methodLabel(b.method, t)}
          </span>
        </div>
        {(showUrgent || showExpired || hasConflict || otherConflict || group.count > 1 || decor.client) && (
          <div className="mt-0.5 flex flex-wrap gap-1.5">
            {showUrgent && (
              <Chip tone="warn" icon={<Sparkles />}>
                {t.badgeReplyToday}
              </Chip>
            )}
            {showExpired && <Chip tone="muted">{t.badgeExpired}</Chip>}
            {hasConflict && (
              <Chip tone="warn" icon={<AlertTriangle />}>
                {t.badgeConflict}
              </Chip>
            )}
            {!hasConflict && otherConflict && (
              <Chip tone="warn" icon={<AlertTriangle />}>
                {otherConflict.kind === 'outside_hours' ? t.badgeOutsideHours : t.badgeClosedDay}
              </Chip>
            )}
            {group.count > 1 && (
              <Chip tone="neutral" icon={<Copy />}>
                {fmt(t.badgeSubmissions, { n: group.count })}
              </Chip>
            )}
            {decor.client && decor.client.visits > 0 && (
              <Chip tone="success" icon={<Repeat2 />}>
                {fmt(t.badgeReturning, { n: decor.client.visits })}
              </Chip>
            )}
            {decor.client && decor.client.visits === 0 && decor.client.requests > group.count && (
              <Chip tone="neutral" icon={<Repeat2 />}>
                {fmt(t.badgeReturningRequests, { n: decor.client.requests })}
              </Chip>
            )}
            {decor.client && decor.client.visits === 0 && decor.client.requests <= group.count && (
              <Chip tone="outline" icon={<UserRound />}>
                {t.badgeNewClient}
              </Chip>
            )}
          </div>
        )}
      </button>
    </article>
  );
}
