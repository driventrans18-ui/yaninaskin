'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trash2, RotateCcw, Sparkles, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { restoreBookings, purgeBookings } from '../../actions/bookings';
import { restoreReviews, purgeReviews } from '../../actions/reviews';
import { restoreMessages, purgeMessages } from '../../actions/contact';
import { restoreServices, purgeServices } from '../../actions/content';
import { restoreClients, purgeClients } from '../../actions/clients';
import { getTrash, emptyTrash, runMaintenanceNow, type TrashItem, type TrashKind } from '../../actions/trash';
import AdminShell from '../_components/AdminShell';
import { useAdminT } from '../_components/AdminLang';
import { useAdminCounts } from '../_components/AdminCounts';
import { useToast } from '../_components/ui/Toast';
import { CardSkeleton, Chip, EmptyState, ErrorState, Segmented } from '../_components/ui/Bits';
import { ConfirmDialog } from '../_components/ui/Dialog';
import { relativeSubmitted } from '../bookings/bookingFormat';

type Seg = 'all' | TrashKind;

export default function TrashPage() {
  const { t, lang, fmt } = useAdminT();
  const { toast } = useToast();
  const { refresh: refreshCounts } = useAdminCounts();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [retention, setRetention] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<Seg>('all');
  const [confirmItem, setConfirmItem] = useState<TrashItem | null>(null);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await getTrash();
    setError(r.success ? null : r.error || 'load failed');
    setItems(r.items);
    setRetention(r.retentionDays);
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<Seg, number> = { all: items.length, booking: 0, review: 0, message: 0, service: 0, client: 0 };
    for (const it of items) c[it.kind] += 1;
    return c;
  }, [items]);
  const list = useMemo(() => items.filter((it) => segment === 'all' || it.kind === segment), [items, segment]);

  const kindLabel = (k: TrashKind) => (k === 'booking' ? t.kindBooking : k === 'review' ? t.kindReview : k === 'message' ? t.kindMessage : k === 'client' ? t.kindClient : t.kindService);
  const daysLeft = (it: TrashItem) => Math.max(0, retention - Math.floor((Date.now() - new Date(it.deleted_at).getTime()) / 86400000));

  const act = async (it: TrashItem, mode: 'restore' | 'purge') => {
    setBusy(true);
    const ids = [it.id];
    const fn =
      it.kind === 'booking' ? (mode === 'restore' ? restoreBookings(ids) : purgeBookings(ids))
      : it.kind === 'review' ? (mode === 'restore' ? restoreReviews(ids.map(Number)) : purgeReviews(ids.map(Number)))
      : it.kind === 'message' ? (mode === 'restore' ? restoreMessages(ids) : purgeMessages(ids))
      : it.kind === 'client' ? (mode === 'restore' ? restoreClients(ids) : purgeClients(ids))
      : mode === 'restore' ? restoreServices(ids.map(Number)) : purgeServices(ids.map(Number));
    const r = await fn;
    setBusy(false);
    setConfirmItem(null);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    toast({ title: mode === 'restore' ? t.restoredToast : t.deletedForeverToast });
    await load();
    void refreshCounts();
  };

  const doEmpty = async () => {
    setBusy(true);
    const r = await emptyTrash();
    setBusy(false);
    setConfirmEmpty(false);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    toast({ title: t.deletedForeverToast });
    await load();
  };

  const cleanup = async () => {
    setBusy(true);
    const r = await runMaintenanceNow();
    setBusy(false);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    toast({ title: fmt(t.cleanupDone, { purged: r.purged ?? 0, archived: r.archived ?? 0 }) });
    await load();
    void refreshCounts();
  };

  return (
    <AdminShell
      active="trash"
      title={t.trashTitle}
      subtitle={fmt(t.trashIntro, { n: retention })}
      maxWidth="max-w-3xl"
      actions={
        <div className="flex w-full flex-wrap items-center justify-end gap-2">
          <Button variant="outline" className="h-11 rounded-full" onClick={() => void cleanup()} disabled={busy}>
            <Eraser /> {t.runCleanupNow}
          </Button>
          <Button variant="outline" className="h-11 rounded-full" onClick={() => setConfirmEmpty(true)} disabled={busy || items.length === 0}>
            <Trash2 /> {t.emptyTrash}
          </Button>
        </div>
      }
    >
      {loading ? (
        <CardSkeleton count={3} lines={2} />
      ) : error ? (
        <ErrorState body={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState icon={<Sparkles />} title={t.trashEmptyTitle} body={t.trashEmptyBody} />
      ) : (
        <>
          <div className="mb-4">
            <Segmented
              value={segment}
              onChange={setSegment}
              ariaLabel={t.trashTitle}
              options={[
                { value: 'all', label: t.segAll, count: counts.all },
                { value: 'booking', label: t.navBookings, count: counts.booking },
                { value: 'review', label: t.navReviews, count: counts.review },
                { value: 'message', label: t.navMessages, count: counts.message },
                { value: 'service', label: t.navServices, count: counts.service },
                { value: 'client', label: t.viewClients, count: counts.client },
              ]}
            />
          </div>
          <ul className="space-y-2">
            {list.map((it) => (
              <li key={`${it.kind}-${it.id}`} className="flex flex-col gap-2 rounded-2xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Chip tone="outline">{kindLabel(it.kind)}</Chip>
                    <span className="truncate font-medium">{it.title || '—'}</span>
                  </div>
                  {it.subtitle && <p className="mt-0.5 truncate text-sm text-muted-foreground">{it.subtitle}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {fmt(t.deletedOn, { when: relativeSubmitted(it.deleted_at, lang) })} · {daysLeft(it) > 0 ? fmt(t.purgesIn, { n: daysLeft(it) }) : t.purgesSoon}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" className="h-10 rounded-full" onClick={() => void act(it, 'restore')} disabled={busy}>
                    <RotateCcw /> {t.restore}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-10 rounded-full text-muted-foreground" onClick={() => setConfirmItem(it)} disabled={busy}>
                    {t.deleteForever}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <ConfirmDialog open={Boolean(confirmItem)} onClose={() => setConfirmItem(null)} onConfirm={() => { if (confirmItem) void act(confirmItem, 'purge'); }} title={t.deleteForever} body={t.deleteForeverConfirm} confirmLabel={t.deleteForever} danger busy={busy} />
      <ConfirmDialog open={confirmEmpty} onClose={() => setConfirmEmpty(false)} onConfirm={() => void doEmpty()} title={t.emptyTrash} body={t.emptyTrashConfirm} confirmLabel={t.emptyTrash} danger busy={busy} />
    </AdminShell>
  );
}
