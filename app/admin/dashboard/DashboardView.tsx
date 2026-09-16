'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarCheck, CalendarOff, ExternalLink, ImagePlus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Booking, BookingSettings, ServiceLite } from '@/lib/booking/types';
import { DEFAULT_SETTINGS } from '@/lib/booking/settings';
import { statusOf, preferredDate, needsAction } from '@/lib/booking/status';
import { parsePrice, formatMoney } from '@/lib/booking/price';
import { dateKey, addDays, formatTime, zonedToUtc } from '@/lib/tz';
import { getBookings } from '../../actions/bookings';
import { getBookingSettings, saveBookingSettings } from '../../actions/settings';
import { getReviewsAdmin, type AdminReview } from '../../actions/reviews';
import AdminShell from '../_components/AdminShell';
import { useAdminT } from '../_components/AdminLang';
import { useAdminCounts } from '../_components/AdminCounts';
import { useToast } from '../_components/ui/Toast';
import { CardSkeleton, ErrorState, Chip, SectionTitle, Switch, Field } from '../_components/ui/Bits';
import { Dialog } from '../_components/ui/Dialog';
import { useBookingsModel } from '../bookings/useBookingsModel';
import BookingCard, { StatusChip } from '../bookings/BookingCard';
import BookingDrawer from '../bookings/BookingDrawer';
import { displayName, formatPreferred } from '../bookings/bookingFormat';
import { trashBookings, restoreBookings } from '../../actions/bookings';

const REVIEW_NEEDS = (r: AdminReview) => !r.approved && !r.hidden && !r.deleted_at;

export default function DashboardView() {
  const { t, lang, fmt } = useAdminT();
  const { toast } = useToast();
  const { refresh: refreshCounts } = useAdminCounts();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<BookingSettings>(DEFAULT_SETTINGS);
  const [services, setServices] = useState<ServiceLite[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);
  const [block, setBlock] = useState({ date: '', allDay: false, from: '12:00', to: '13:00', label: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [b, s, r] = await Promise.all([getBookings(), getBookingSettings(), getReviewsAdmin()]);
      if (!b.success) throw new Error(b.error || 'load failed');
      setBookings(b.data);
      setSettings(s.data);
      setServices(s.services);
      setReviews(r.data);
      setNow(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const model = useBookingsModel(bookings, settings, services, now);
  const tz = settings.timezone;
  const todayKey = dateKey(now, tz);
  const tomorrowKey = addDays(todayKey, 1);

  const confirmedOn = (key: string) =>
    bookings
      .filter((b) => !b.deleted_at && statusOf(b) === 'confirmed')
      .map((b) => ({ b, at: preferredDate(b) }))
      .filter((x): x is { b: Booking; at: Date } => Boolean(x.at) && dateKey(x.at as Date, tz) === key)
      .sort((a, b) => a.at.getTime() - b.at.getTime());
  const today = confirmedOn(todayKey);
  const tomorrow = confirmedOn(tomorrowKey);

  const needs = useMemo(() => {
    const list = model.groups.filter((g) => needsAction(g.primary));
    const rank = (g: (typeof list)[number]) => {
      const d = model.decor.get(g.key)!;
      return [d.timing === 'expired' ? 1 : 0, preferredDate(g.primary)?.getTime() ?? Number.POSITIVE_INFINITY] as const;
    };
    list.sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      return ra[0] - rb[0] || ra[1] - rb[1] || new Date(b.primary.created_at).getTime() - new Date(a.primary.created_at).getTime();
    });
    return list.slice(0, 5);
  }, [model]);

  const month = useMemo(() => {
    const ym = todayKey.slice(0, 7);
    const live = bookings.filter((b) => !b.deleted_at);
    const received = live.filter((b) => dateKey(new Date(b.created_at), tz).startsWith(ym));
    const receivedGroups = model.groups.filter((g) => dateKey(new Date(g.primary.created_at), tz).startsWith(ym));
    const won = receivedGroups.filter((g) => ['confirmed', 'completed'].includes(statusOf(g.primary)));
    const revenueList = live.filter((b) => {
      const at = preferredDate(b);
      return ['confirmed', 'completed'].includes(statusOf(b)) && at && dateKey(at, tz).startsWith(ym);
    });
    const revenue = revenueList.reduce((sum, b) => sum + (parsePrice(b.price)?.mid ?? 0), 0);
    const byService = new Map<string, number>();
    for (const b of received) {
      const k = (b.service || '').trim();
      if (!k) continue;
      byService.set(k, (byService.get(k) ?? 0) + 1);
    }
    const top = [...byService.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { received: receivedGroups.length, confirmed: won.length, conversion: receivedGroups.length ? Math.round((won.length / receivedGroups.length) * 100) : 0, revenue, top };
  }, [bookings, model.groups, todayKey, tz]);

  const pendingReviews = reviews.filter(REVIEW_NEEDS);
  const openGroup = openKey ? model.groups.find((g) => g.key === openKey) ?? null : null;

  const afterChange = useCallback(async () => {
    await load();
    void refreshCounts();
  }, [load, refreshCounts]);

  const trash = async (ids: string[]) => {
    setOpenKey(null);
    const r = await trashBookings(ids);
    if (!r.success) return toast({ title: t.toastError, tone: 'error' });
    await afterChange();
    toast({
      title: t.deletedToast,
      duration: 10000,
      action: { label: t.undo, onClick: async () => { await restoreBookings(ids); await afterChange(); } },
    });
  };

  const saveBlock = async () => {
    if (!block.date) return;
    setSaving(true);
    try {
      if (block.allDay) {
        const r = await saveBookingSettings({ blackout_dates: [...settings.blackoutDates, { from: block.date, to: block.date, label: block.label || undefined }] });
        if (!r.success) throw new Error(r.error);
      } else {
        const start = zonedToUtc(block.date, block.from, tz);
        const end = zonedToUtc(block.date, block.to, tz);
        if (end.getTime() <= start.getTime()) {
          toast({ title: t.blockInvalid, tone: 'error' });
          return;
        }
        const r = await saveBookingSettings({
          blocked_times: [...settings.blockedTimes, { id: `${Date.now()}`, start: start.toISOString(), end: end.toISOString(), label: block.label || undefined }],
        });
        if (!r.success) throw new Error(r.error);
      }
      toast({ title: t.blockSaved });
      setBlockOpen(false);
      setBlock({ date: '', allDay: false, from: '12:00', to: '13:00', label: '' });
      await load();
    } catch (err) {
      toast({ title: t.toastError, description: err instanceof Error ? err.message : undefined, tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const apptRow = (x: { b: Booking; at: Date }) => (
    <li key={x.b.id}>
      <button
        type="button"
        onClick={() => {
          const g = model.groups.find((gg) => gg.members.some((m) => m.id === x.b.id));
          if (g) setOpenKey(g.key);
        }}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="w-[4.5rem] shrink-0 font-serif text-lg leading-none">{formatTime(x.at, lang, tz)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{displayName(x.b, t)}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {x.b.service || t.unknownService}
            {x.b.price ? ` · ${x.b.price}` : ''}
          </span>
        </span>
        <StatusChip status="confirmed" />
      </button>
    </li>
  );

  return (
    <AdminShell active="dashboard" title={t.dashTitle} subtitle={t.dashIntro} maxWidth="max-w-6xl">
      {loading ? (
        <CardSkeleton count={4} />
      ) : error ? (
        <ErrorState body={error} onRetry={() => void load()} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Today / tomorrow */}
          <section className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: t.dashToday, list: today },
                { label: t.dashTomorrow, list: tomorrow },
              ].map(({ label, list }) => (
                <div key={label}>
                  <SectionTitle>{label}</SectionTitle>
                  {list.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">{t.dashNoAppointments}</p>
                  ) : (
                    <ul className="divide-y divide-border">{list.map(apptRow)}</ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Quick actions */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <SectionTitle>{t.quickActions}</SectionTitle>
            <div className="grid gap-2">
              <Button asChild variant="outline" className="h-12 justify-start rounded-xl">
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink /> {t.qaViewWebsite}
                </a>
              </Button>
              <Button asChild variant="outline" className="h-12 justify-start rounded-xl">
                <a href="/admin/gallery?add=1">
                  <ImagePlus /> {t.qaAddPhoto}
                </a>
              </Button>
              <Button variant="outline" className="h-12 justify-start rounded-xl" onClick={() => setBlockOpen(true)}>
                <CalendarOff /> {t.qaBlockTime}
              </Button>
            </div>
          </section>

          {/* Needs reply */}
          <section className="lg:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <SectionTitle>{t.dashNeedsReply}</SectionTitle>
              <a href="/admin/bookings" className="inline-flex min-h-[36px] items-center gap-1 text-sm underline-offset-4 hover:underline">
                {t.dashViewAll} <ArrowRight className="size-3.5" aria-hidden />
              </a>
            </div>
            {needs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">{t.summaryAllClear}</p>
            ) : (
              <div className="space-y-2.5">
                {needs.map((g) => (
                  <BookingCard key={g.key} group={g} decor={model.decor.get(g.key)!} tz={tz} now={now} selectMode={false} selected={false} onToggleSelect={() => {}} onOpen={() => setOpenKey(g.key)} />
                ))}
              </div>
            )}
          </section>

          {/* Reviews pending */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <SectionTitle>{t.dashReviewsPending}</SectionTitle>
              <a href="/admin/reviews" className="inline-flex min-h-[36px] items-center gap-1 text-sm underline-offset-4 hover:underline">
                {t.moderate} <ArrowRight className="size-3.5" aria-hidden />
              </a>
            </div>
            {pendingReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.dashNoPendingReviews}</p>
            ) : (
              <ul className="space-y-2">
                {pendingReviews.slice(0, 4).map((r) => (
                  <li key={r.id}>
                    <a href={`/admin/reviews?open=${r.id}`} className="block rounded-xl border border-border px-3 py-2 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{r.name}</span>
                        <span className="flex text-accent" aria-label={fmt(t.starsN, { n: r.rating })}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`size-3.5 ${i < r.rating ? 'fill-current' : ''}`} aria-hidden />
                          ))}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{r.comment}</p>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Month stats */}
          <section className="rounded-2xl border border-border bg-card p-4 lg:col-span-3">
            <SectionTitle>{t.dashThisMonth}</SectionTitle>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {[
                { label: t.statRequests, value: String(month.received) },
                { label: t.statConfirmed, value: String(month.confirmed) },
                { label: t.statConversion, value: `${month.conversion}%` },
                { label: t.statRevenue, value: formatMoney(month.revenue, settings.currency, lang) },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-muted/60 p-3">
                  <p className="font-serif text-2xl">{s.value}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                </div>
              ))}
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{t.statTopServices}</p>
                {month.top.length === 0 ? (
                  <p className="text-sm text-muted-foreground">—</p>
                ) : (
                  <ol className="space-y-0.5 text-sm">
                    {month.top.map(([name, n]) => (
                      <li key={name} className="flex justify-between gap-2">
                        <span className="truncate">{name}</span>
                        <Chip tone="neutral">{n}</Chip>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t.revenueNote}</p>
          </section>
        </div>
      )}

      <Dialog
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title={t.blockTitle}
        description={t.blockHint}
        footer={
          <>
            <Button variant="outline" className="h-11" onClick={() => setBlockOpen(false)} disabled={saving}>
              {t.cancel}
            </Button>
            <Button className="h-11" onClick={() => void saveBlock()} disabled={saving || !block.date}>
              <CalendarCheck /> {t.save}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label={t.blockDate}>
            <Input type="date" value={block.date} min={todayKey} onChange={(e) => setBlock({ ...block, date: e.target.value })} className="h-11" />
          </Field>
          <Switch checked={block.allDay} onChange={(v) => setBlock({ ...block, allDay: v })} label={t.blockAllDay} />
          {!block.allDay && (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.blockFrom}>
                <Input type="time" step={900} value={block.from} onChange={(e) => setBlock({ ...block, from: e.target.value })} className="h-11" />
              </Field>
              <Field label={t.blockTo}>
                <Input type="time" step={900} value={block.to} onChange={(e) => setBlock({ ...block, to: e.target.value })} className="h-11" />
              </Field>
            </div>
          )}
          <Field label={t.blockLabel}>
            <Input value={block.label} onChange={(e) => setBlock({ ...block, label: e.target.value })} className="h-11" placeholder="Lunch, training, holiday…" />
          </Field>
        </div>
      </Dialog>

      <BookingDrawer
        group={openGroup}
        decor={openGroup ? model.decor.get(openGroup.key) : undefined}
        settings={settings}
        allBookings={bookings}
        durationOf={model.durationOf}
        now={now}
        aiAvailable={false}
        onClose={() => setOpenKey(null)}
        onChanged={afterChange}
        onTrash={trash}
        onOpenBooking={(id) => {
          const g = model.groups.find((gg) => gg.members.some((m) => m.id === id));
          if (g) setOpenKey(g.key);
        }}
      />
    </AdminShell>
  );
}
