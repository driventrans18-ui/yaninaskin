'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Archive, CheckSquare, Download, Inbox, ListFilter, MailOpen, RefreshCw, Trash2, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { Booking, BookingSettings, BookingStatus, ServiceLite } from '@/lib/booking/types';
import { BOOKING_STATUSES } from '@/lib/booking/types';
import { statusOf, preferredDate, type Segment } from '@/lib/booking/status';
import { DEFAULT_SETTINGS } from '@/lib/booking/settings';
import { toCsv, downloadText } from '@/lib/csv';
import { formatPhone } from '@/lib/phone';
import { dateKey, formatDateTime } from '@/lib/tz';
import { getBookings, restoreBookings, setBookingsRead, trashBookings, updateBookingStatus } from '../../actions/bookings';
import { getBookingSettings } from '../../actions/settings';
import { getAiAvailability } from '../../actions/admin';
import AdminShell from '../_components/AdminShell';
import { useAdminT } from '../_components/AdminLang';
import { useAdminCounts } from '../_components/AdminCounts';
import { useToast } from '../_components/ui/Toast';
import { CardSkeleton, EmptyState, ErrorState, SearchInput, Segmented } from '../_components/ui/Bits';
import Sheet from '../_components/ui/Sheet';
import { Menu, MenuItem } from '../_components/ui/Menu';
import { useBookingsModel } from './useBookingsModel';
import BookingCard from './BookingCard';
import BookingDrawer from './BookingDrawer';
import BookingCalendar from './BookingCalendar';
import ClientsView from './ClientsView';
import SummaryStrip from './SummaryStrip';
import { statusLabel } from './bookingFormat';

type View = 'inbox' | 'calendar' | 'clients';
type SegmentKey = Segment | 'all';

const PAGE = 40;

export default function BookingsWorkspace() {
  const { t, lang, fmt } = useAdminT();
  const { toast } = useToast();
  const { refresh: refreshCounts } = useAdminCounts();
  const router = useRouter();
  const params = useSearchParams();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<BookingSettings>(DEFAULT_SETTINGS);
  const [services, setServices] = useState<ServiceLite[]>([]);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  const view = (params.get('view') as View) || 'inbox';
  const [segment, setSegment] = useState<SegmentKey>('needs_action');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState<'needs' | 'newest'>('needs');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [b, s, ai] = await Promise.all([getBookings(), getBookingSettings(), getAiAvailability()]);
      if (!b.success) throw new Error(b.error || 'load failed');
      setBookings(b.data);
      setSettings(s.data);
      setServices(s.services);
      setAiAvailable(ai);
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
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(iv);
  }, []);

  const model = useBookingsModel(bookings, settings, services, now);

  // Deep link: ?open=<booking id> (from the notification email) opens the card.
  useEffect(() => {
    const id = params.get('open');
    if (!id || loading) return;
    const g = model.groups.find((x) => x.members.some((m) => m.id === id));
    if (g) {
      setSegment('all');
      setOpenKey(g.key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, loading]);

  const setView = (v: View) => {
    const next = new URLSearchParams(params.toString());
    if (v === 'inbox') next.delete('view');
    else next.set('view', v);
    next.delete('open');
    router.replace(`/admin/bookings${next.toString() ? `?${next}` : ''}`);
  };

  const openBookingById = (id: string) => {
    const g = model.groups.find((x) => x.members.some((m) => m.id === id));
    if (g) setOpenKey(g.key);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    const list = model.groups.filter((g) => {
      const d = model.decor.get(g.key)!;
      if (segment !== 'all' && d.segment !== segment) return false;
      if (statusFilter && statusOf(g.primary) !== statusFilter) return false;
      if (serviceFilter && (g.primary.service || '').trim() !== serviceFilter) return false;
      if (from || to) {
        const at = preferredDate(g.primary);
        const k = at ? dateKey(at, settings.timezone) : null;
        if (!k) return false;
        if (from && k < from) return false;
        if (to && k > to) return false;
      }
      if (q) {
        const hit = g.members.some(
          (m) =>
            (m.name || '').toLowerCase().includes(q) ||
            (m.service || '').toLowerCase().includes(q) ||
            (m.email || '').toLowerCase().includes(q) ||
            (m.details || '').toLowerCase().includes(q) ||
            (digits.length >= 3 && (m.phone_normalized || m.phone || '').replace(/\D/g, '').includes(digits)),
        );
        if (!hit) return false;
      }
      return true;
    });
    const rank = (g: (typeof list)[number]) => {
      const d = model.decor.get(g.key)!;
      const at = preferredDate(g.primary)?.getTime() ?? Number.POSITIVE_INFINITY;
      // needs action first; within it upcoming before expired; then soonest.
      const na = d.needsAction ? 0 : 1;
      const exp = d.timing === 'expired' ? 1 : 0;
      return [na, exp, at] as const;
    };
    if (sort === 'newest') {
      list.sort((a, b) => new Date(b.primary.created_at).getTime() - new Date(a.primary.created_at).getTime());
    } else {
      list.sort((a, b) => {
        const ra = rank(a);
        const rb = rank(b);
        for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return (ra[i] as number) - (rb[i] as number);
        return new Date(b.primary.created_at).getTime() - new Date(a.primary.created_at).getTime();
      });
    }
    return list;
  }, [model, segment, query, statusFilter, serviceFilter, from, to, sort, settings.timezone]);

  const activeFilters = [statusFilter, serviceFilter, from, to].filter(Boolean).length;
  const visible = filtered.slice(0, limit);
  const openGroup = openKey ? model.groups.find((g) => g.key === openKey) ?? null : null;

  const afterChange = useCallback(async () => {
    await load();
    void refreshCounts();
  }, [load, refreshCounts]);

  // Soft delete with a 10-second Undo.
  const trash = async (ids: string[]) => {
    const snapshot = bookings;
    setBookings((prev) => prev.filter((b) => !ids.includes(b.id)));
    setOpenKey(null);
    setSelected(new Set());
    const r = await trashBookings(ids);
    if (!r.success) {
      setBookings(snapshot);
      toast({ title: t.toastError, description: r.error, tone: 'error' });
      return;
    }
    void refreshCounts();
    toast({
      title: t.deletedToast,
      duration: 10000,
      action: {
        label: t.undo,
        onClick: async () => {
          const rr = await restoreBookings(ids);
          if (rr.success) {
            toast({ title: t.restoredToast });
            await afterChange();
          } else toast({ title: t.toastError, tone: 'error' });
        },
      },
    });
  };

  const selectedIds = useMemo(
    () => model.groups.filter((g) => selected.has(g.key)).flatMap((g) => g.members.map((m) => m.id)),
    [model.groups, selected],
  );
  const selectedPrimaryIds = useMemo(() => model.groups.filter((g) => selected.has(g.key)).map((g) => g.primary.id), [model.groups, selected]);

  const bulk = async (action: 'read' | 'archive' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete') return trash(selectedIds);
    setBusy(true);
    const r = action === 'read' ? await setBookingsRead(selectedIds, true) : await updateBookingStatus(selectedIds, 'archived');
    setBusy(false);
    if (!r.success) return toast({ title: t.toastError, tone: 'error' });
    setSelected(new Set());
    setSelectMode(false);
    toast({ title: t.toastUpdated });
    await afterChange();
  };
  void selectedPrimaryIds;

  const exportCsv = () => {
    const rows = filtered.flatMap((g) => g.members).map((b) => ({
      name: b.name,
      phone: b.phone ? formatPhone(b.phone) : '',
      email: b.email || '',
      service: b.service || '',
      price: b.price || '',
      preferred: b.preferred_at ? formatDateTime(new Date(b.preferred_at), lang, settings.timezone) : b.preferred_date || '',
      status: statusLabel(statusOf(b), t),
      method: b.method || '',
      lang: b.lang || 'en',
      submitted: formatDateTime(new Date(b.created_at), lang, settings.timezone),
      message: b.details || '',
      notes: b.notes || '',
    }));
    const csv = toCsv(rows, [
      { key: 'name', label: t.name },
      { key: 'phone', label: t.phone },
      { key: 'email', label: t.email },
      { key: 'service', label: t.service },
      { key: 'price', label: t.price },
      { key: 'preferred', label: t.preferredTime },
      { key: 'status', label: t.filterStatus },
      { key: 'method', label: t.contact },
      { key: 'lang', label: t.siteLanguage },
      { key: 'submitted', label: t.submitted },
      { key: 'message', label: t.clientMessage },
      { key: 'notes', label: t.privateNotes },
    ]);
    downloadText(`bookings-${dateKey(now, settings.timezone)}.csv`, csv);
    toast({ title: t.csvExported });
  };

  const segments: { value: SegmentKey; label: string; count: number }[] = [
    { value: 'needs_action', label: t.segNeedsAction, count: model.counts.needs_action },
    { value: 'confirmed', label: t.segConfirmed, count: model.counts.confirmed },
    { value: 'past', label: t.segPast, count: model.counts.past },
    { value: 'archived', label: t.segArchived, count: model.counts.archived },
    { value: 'all', label: t.segAll, count: model.counts.all },
  ];

  const viewTabs = (
    <div role="tablist" aria-label={t.bookingsTitle} className="inline-flex rounded-full border border-border bg-background p-0.5">
      {(['inbox', 'calendar', 'clients'] as View[]).map((v) => (
        <button
          key={v}
          role="tab"
          aria-selected={view === v}
          type="button"
          onClick={() => setView(v)}
          className={`h-10 rounded-full px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${view === v ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {v === 'inbox' ? t.viewInbox : v === 'calendar' ? t.viewCalendar : t.viewClients}
        </button>
      ))}
    </div>
  );

  const headerActions = (
    <div className="flex w-full flex-wrap items-center gap-2">
      {viewTabs}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="icon-lg" className="h-11 w-11 rounded-full" onClick={() => void load()} aria-label={t.refresh} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} />
        </Button>
        <Menu
          label={t.actMore}
          trigger={
            <Button variant="outline" size="icon-lg" className="h-11 w-11 rounded-full" aria-label={t.actMore}>
              <SlidersHorizontal />
            </Button>
          }
        >
          <MenuItem icon={<Download />} onSelect={exportCsv}>
            {t.actExportCsv}
          </MenuItem>
          <MenuItem icon={<Trash2 />} href="/admin/trash">
            {t.showTrash}
          </MenuItem>
        </Menu>
      </div>
    </div>
  );

  return (
    <AdminShell active="bookings" title={t.bookingsTitle} subtitle={t.bookingsIntro} actions={headerActions} maxWidth="max-w-6xl">
      {loading ? (
        <CardSkeleton count={5} />
      ) : error ? (
        <ErrorState body={error} onRetry={() => void load()} />
      ) : view === 'calendar' ? (
        <BookingCalendar bookings={bookings} settings={settings} durationOf={model.durationOf} now={now} onOpen={openBookingById} />
      ) : view === 'clients' ? (
        <ClientsView clients={model.clients} tz={settings.timezone} now={now} onOpenBooking={openBookingById} />
      ) : (
        <>
          <SummaryStrip summary={model.summary} />
          <div className="mb-3">
            <Segmented value={segment} onChange={(v) => { setSegment(v); setLimit(PAGE); }} options={segments} ariaLabel={t.bookingsTitle} />
          </div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput value={query} onChange={(v) => { setQuery(v); setLimit(PAGE); }} placeholder={t.searchBookings} className="flex-1" />
            <div className="flex gap-2">
              <Button variant="outline" className="h-11 rounded-full" onClick={() => setFiltersOpen(true)}>
                <ListFilter /> {t.filters}
                {activeFilters > 0 && <span className="rounded-full bg-foreground px-1.5 text-[11px] text-background">{activeFilters}</span>}
              </Button>
              <Select value={sort} onChange={(e) => setSort(e.target.value as 'needs' | 'newest')} aria-label={t.sortLabel} className="h-11 rounded-full text-sm">
                <option value="needs">{t.sortNeedsFirst}</option>
                <option value="newest">{t.sortNewest}</option>
              </Select>
              <Button
                variant={selectMode ? 'default' : 'outline'}
                className="h-11 rounded-full"
                aria-pressed={selectMode}
                onClick={() => {
                  setSelected(new Set());
                  setSelectMode((v) => !v);
                }}
              >
                <CheckSquare /> {selectMode ? t.cancel : t.selectMode}
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            query || activeFilters ? (
              <EmptyState
                icon={<Inbox />}
                title={query ? fmt(t.emptySearch, { q: query }) : t.emptySegment}
                body={query ? t.emptySearchBody : t.emptySegmentBody}
                action={
                  <Button variant="outline" className="h-11 rounded-full" onClick={() => { setQuery(''); setStatusFilter(''); setServiceFilter(''); setFrom(''); setTo(''); }}>
                    <X /> {t.clearFilters}
                  </Button>
                }
              />
            ) : segment === 'needs_action' || segment === 'all' ? (
              <EmptyState icon={<Inbox />} title={t.emptyInboxTitle} body={t.emptyInboxBody} />
            ) : (
              <EmptyState icon={<Inbox />} title={t.emptySegment} body={t.emptySegmentBody} compact />
            )
          ) : (
            <div className="space-y-2.5">
              {selectMode && (
                <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background/95 px-3 py-2 text-sm shadow-sm backdrop-blur md:top-20">
                  <span className="font-medium">{selected.size > 0 ? fmt(t.selectedCount, { n: selected.size }) : t.selectHint}</span>
                  <div className="ml-auto flex gap-2">
                    {selected.size < filtered.length ? (
                      <Button variant="outline" size="sm" className="h-10 rounded-full" onClick={() => setSelected(new Set(filtered.map((g) => g.key)))}>
                        {fmt(t.selectAllCount, { n: filtered.length })}
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="h-10 rounded-full" onClick={() => setSelected(new Set())}>
                        {t.deselectAll}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-10 rounded-full" onClick={() => { setSelected(new Set()); setSelectMode(false); }}>
                      {t.cancel}
                    </Button>
                  </div>
                </div>
              )}
              {visible.map((g) => (
                <BookingCard
                  key={g.key}
                  group={g}
                  decor={model.decor.get(g.key)!}
                  tz={settings.timezone}
                  now={now}
                  selectMode={selectMode}
                  selected={selected.has(g.key)}
                  onToggleSelect={() =>
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(g.key)) next.delete(g.key);
                      else next.add(g.key);
                      return next;
                    })
                  }
                  onOpen={() => setOpenKey(g.key)}
                />
              ))}
              {filtered.length > visible.length && (
                <Button variant="outline" className="h-11 w-full rounded-full" onClick={() => setLimit((l) => l + PAGE)}>
                  {t.loadMore} ({filtered.length - visible.length})
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Bulk bar */}
      {selectMode && selected.size > 0 && (
        <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex items-center gap-2 rounded-2xl border border-border bg-background/95 p-2 shadow-xl backdrop-blur md:inset-x-auto md:bottom-6 md:left-1/2 md:-translate-x-1/2">
          <span className="px-2 text-sm font-medium">{fmt(t.selectedCount, { n: selected.size })}</span>
          <Button variant="outline" className="h-11 rounded-full" disabled={busy} onClick={() => void bulk('read')}>
            <MailOpen /> {t.bulkMarkRead}
          </Button>
          <Button variant="outline" className="h-11 rounded-full" disabled={busy} onClick={() => void bulk('archive')}>
            <Archive /> {t.bulkArchive}
          </Button>
          <Menu
            trigger={
              <Button variant="outline" size="icon-lg" className="h-11 w-11 rounded-full" aria-label={t.actMore}>
                <SlidersHorizontal />
              </Button>
            }
          >
            <MenuItem icon={<Trash2 />} danger onSelect={() => void bulk('delete')}>
              {t.bulkDelete}
            </MenuItem>
          </Menu>
          <Button variant="ghost" className="h-11 rounded-full" onClick={() => { setSelected(new Set()); setSelectMode(false); }}>
            <X /> {t.cancel}
          </Button>
        </div>
      )}

      {/* Filters sheet */}
      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={t.filters}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="h-11 flex-1 rounded-full" onClick={() => { setStatusFilter(''); setServiceFilter(''); setFrom(''); setTo(''); }}>
              {t.clearFilters}
            </Button>
            <Button className="h-11 flex-1 rounded-full" onClick={() => setFiltersOpen(false)}>
              {t.apply}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <label className="block text-sm font-medium">
            {t.filterStatus}
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')} className="mt-1.5 h-11 w-full text-sm">
              <option value="">{t.filterAnyStatus}</option>
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s, t)}
                </option>
              ))}
            </Select>
          </label>
          <label className="block text-sm font-medium">
            {t.filterService}
            <Select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="mt-1.5 h-11 w-full text-sm">
              <option value="">{t.filterAnyService}</option>
              {model.serviceNames.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </label>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">{t.filterDateRange}</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-muted-foreground">
                {t.filterFrom}
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground" />
              </label>
              <label className="text-xs text-muted-foreground">
                {t.filterTo}
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground" />
              </label>
            </div>
          </fieldset>
        </div>
      </Sheet>

      <BookingDrawer
        group={openGroup}
        decor={openGroup ? model.decor.get(openGroup.key) : undefined}
        settings={settings}
        allBookings={bookings}
        durationOf={model.durationOf}
        now={now}
        aiAvailable={aiAvailable}
        onClose={() => setOpenKey(null)}
        onChanged={afterChange}
        onTrash={trash}
        onOpenBooking={openBookingById}
      />
    </AdminShell>
  );
}
