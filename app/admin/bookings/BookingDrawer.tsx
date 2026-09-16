'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  Bell,
  CalendarPlus,
  Check,
  ChevronDown,
  Copy,
  Mail,
  MailOpen,
  MessageSquareText,
  MoreHorizontal,
  Phone,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
  UserX,
  X,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Booking, BookingEvent, BookingSettings, BookingStatus, TemplateKey } from '@/lib/booking/types';
import type { BookingGroup } from '@/lib/booking/duplicates';
import { statusOf, hasChosenTime, preferredDate } from '@/lib/booking/status';
import { detectConflicts, suggestTimes, type Conflict } from '@/lib/booking/availability';
import { renderTemplate, templateFor, smsHref, telHref, mailtoHref } from '@/lib/booking/templates';
import { formatPhone } from '@/lib/phone';
import { buildIcs } from '@/lib/ics';
import { formatDateTime, formatTime, formatDate, zonedToUtc, timeKey } from '@/lib/tz';
import { siteConfig } from '@/lib/siteConfig';
import {
  getBookingEvents,
  logBookingContact,
  mergeBookings,
  saveBookingNotes,
  setBookingsRead,
  updateBookingStatus,
} from '../../actions/bookings';
import { aiAssistBooking } from '../../actions/ai';
import { useAdminT } from '../_components/AdminLang';
import { useToast } from '../_components/ui/Toast';
import Sheet from '../_components/ui/Sheet';
import { Dialog, ConfirmDialog } from '../_components/ui/Dialog';
import { Menu, MenuItem, MenuSeparator } from '../_components/ui/Menu';
import { Chip, CopyButton, SectionTitle } from '../_components/ui/Bits';
import type { GroupDecor } from './useBookingsModel';
import { StatusChip } from './BookingCard';
import { displayName, firstName, formatPreferred, methodLabel, relativeSubmitted, statusLabel, templateDateTime, timeLabel } from './bookingFormat';

type DialogKind = 'confirm' | 'suggest' | 'decline' | 'reminder' | 'review' | 'delete' | null;

const REVIEW_PATH = '/#leave-review';

export default function BookingDrawer({
  group,
  decor,
  settings,
  allBookings,
  durationOf,
  now,
  aiAvailable,
  onClose,
  onChanged,
  onTrash,
  onOpenBooking,
}: {
  group: BookingGroup | null;
  decor?: GroupDecor;
  settings: BookingSettings;
  allBookings: Booking[];
  durationOf: (b: Booking) => number;
  now: Date;
  aiAvailable: boolean;
  onClose: () => void;
  onChanged: () => Promise<void>;
  onTrash: (ids: string[]) => void;
  onOpenBooking: (id: string) => void;
}) {
  const { t, lang, fmt } = useAdminT();
  const { toast } = useToast();
  const b = group?.primary ?? null;
  const memberIds = useMemo(() => group?.members.map((m) => m.id) ?? [], [group]);
  const otherIds = useMemo(() => memberIds.filter((id) => id !== b?.id), [memberIds, b]);
  const tz = settings.timezone;
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [busy, setBusy] = useState(false);
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [notes, setNotes] = useState('');
  const [notesState, setNotesState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [ai, setAi] = useState<{ loading: boolean; summary?: string; draft?: string; error?: string }>({ loading: false });
  const [message, setMessage] = useState('');
  const [chosenAt, setChosenAt] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [picked, setPicked] = useState<string[]>([]);

  // Load timeline + notes whenever a different booking opens.
  useEffect(() => {
    if (!b) return;
    setNotes(b.notes || '');
    setNotesState('idle');
    setShowSubmissions(false);
    setAi({ loading: false });
    setDialog(null);
    let active = true;
    getBookingEvents(b.id).then((r) => {
      if (active) setEvents(r.data);
    });
    if (!b.read) void setBookingsRead(memberIds, true);
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b?.id]);

  const clientLang = b?.lang === 'uk' ? 'uk' : 'en';
  const status: BookingStatus = b ? statusOf(b) : 'new';
  const phone = b?.phone || b?.phone_normalized || null;
  const email = b?.email || b?.email_normalized || null;
  const at = b ? preferredDate(b) : null;
  const timing = decor?.timing ?? 'unknown';
  const isExpired = timing === 'expired';

  const vars = useCallback(
    (when: Date | null, alternatives: Date[] = []) => {
      if (!b) return {};
      const dt = when ? templateDateTime(when, clientLang, tz) : { date: '—', time: '—' };
      return {
        name: firstName(b, t),
        service: b.service || (clientLang === 'uk' ? 'процедуру' : 'your appointment'),
        date: dt.date,
        time: dt.time,
        price: b.price || '',
        alt_times: alternatives.map((d) => `• ${templateDateTime(d, clientLang, tz).date}, ${templateDateTime(d, clientLang, tz).time}`).join('\n'),
        link: `${siteConfig.url}${REVIEW_PATH}`,
        studio: 'Skin Beauty',
      };
    },
    [b, clientLang, tz, t],
  );

  const tpl = (key: TemplateKey) => templateFor(settings, clientLang, key);

  // Open slots the owner can offer.
  const openSlots = useMemo(() => {
    if (!b) return [];
    return suggestTimes(allBookings, settings, durationOf(b), durationOf, { count: 6, excludeId: b.id, now });
  }, [b, allBookings, settings, durationOf, now]);

  const openDialog = (kind: DialogKind) => {
    if (!b) return;
    if (kind === 'confirm') {
      const initial = at && hasChosenTime(b) && !isExpired ? at : openSlots[0] ?? null;
      setChosenAt(initial ? initial.toISOString() : null);
      setMessage(renderTemplate(tpl('confirm'), vars(initial)));
    } else if (kind === 'suggest') {
      const first = openSlots.slice(0, 3);
      setPicked(first.map((d) => d.toISOString()));
      setMessage(renderTemplate(tpl('suggest'), vars(at, first)));
    } else if (kind === 'decline') {
      setMessage(renderTemplate(tpl('decline'), vars(at)));
    } else if (kind === 'reminder') {
      setMessage(renderTemplate(tpl('reminder'), vars(at)));
    } else if (kind === 'review') {
      setMessage(renderTemplate(tpl('review'), vars(at)));
    }
    setCustomDate('');
    setCustomTime('');
    setDialog(kind);
  };

  // Re-render the confirm message when the chosen time changes.
  useEffect(() => {
    if (dialog === 'confirm' && b) setMessage(renderTemplate(tpl('confirm'), vars(chosenAt ? new Date(chosenAt) : null)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenAt]);
  useEffect(() => {
    if (dialog === 'suggest' && b) setMessage(renderTemplate(tpl('suggest'), vars(at, picked.map((p) => new Date(p)))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked]);

  const run = async (fn: () => Promise<unknown>, okMsg?: string) => {
    setBusy(true);
    try {
      await fn();
      if (otherIds.length && b) await mergeBookings(b.id, otherIds);
      await onChanged();
      if (okMsg) toast({ title: okMsg });
    } catch (err) {
      toast({ title: t.toastError, description: err instanceof Error ? err.message : undefined, tone: 'error' });
    } finally {
      setBusy(false);
      setDialog(null);
    }
  };

  const setStatus = (s: BookingStatus, opts: { at?: string | null; note?: string } = {}) =>
    run(async () => {
      if (!b) return;
      const r = await updateBookingStatus([b.id], s, opts);
      if (!r.success) throw new Error(r.error);
    }, t.toastUpdated);

  const logContact = async (channel: 'sms' | 'email' | 'call' | 'instagram', kind: 'confirm' | 'suggest' | 'decline' | 'reminder' | 'review' | 'custom', alternatives?: string[]) => {
    if (!b) return;
    await logBookingContact(b.id, { channel, kind, alternatives });
  };

  // The message buttons are real links (sms:/mailto:) so the OS app opens from
  // the user's tap; the status/log writes run alongside.
  const messageHref = (channel: 'sms' | 'email', body: string, subject = 'Skin Beauty') =>
    channel === 'sms' ? smsHref(phone, body) : mailtoHref(email, subject, body);
  const preferredChannel: 'sms' | 'email' | null = phone ? 'sms' : email ? 'email' : null;

  const onNotesChange = (v: string) => {
    setNotes(v);
    setNotesState('saving');
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      if (!b) return;
      const r = await saveBookingNotes(b.id, v);
      setNotesState(r.success ? 'saved' : 'idle');
      if (!r.success) toast({ title: t.toastError, tone: 'error' });
    }, 800);
  };

  const runAi = async () => {
    if (!b) return;
    setAi({ loading: true });
    const r = await aiAssistBooking(b.id, lang);
    setAi({ loading: false, summary: r.summary, draft: r.draft, error: r.success ? undefined : r.error });
  };

  const conflictText = (c: Conflict) => {
    switch (c.kind) {
      case 'confirmed_overlap':
        return fmt(t.conflictConfirmed, { name: c.withName ?? '' });
      case 'pending_overlap':
        return fmt(t.conflictPending, { name: c.withName ?? '' });
      case 'outside_hours':
        return t.conflictOutside;
      case 'blackout':
        return t.conflictBlackout + (c.label ? ` (${c.label})` : '');
      case 'blocked':
        return t.conflictBlocked + (c.label ? ` (${c.label})` : '');
    }
  };

  const chosenConflicts = useMemo(() => {
    if (!b || !chosenAt) return [];
    const virtual: Booking = { ...b, preferred_at: chosenAt, preferred_time: timeKey(new Date(chosenAt), tz) };
    return detectConflicts(virtual, allBookings, settings, durationOf);
  }, [b, chosenAt, allBookings, settings, durationOf, tz]);

  const icsHref = useMemo(() => {
    if (!b || !at || status !== 'confirmed') return null;
    const ics = buildIcs({
      uid: `${b.id}@skinbeauty`,
      start: at,
      end: new Date(at.getTime() + durationOf(b) * 60000),
      summary: `${b.service || 'Appointment'} — ${displayName(b, t)}`,
      description: [phone ? formatPhone(phone) : '', email || '', b.details || ''].filter(Boolean).join('\n'),
      location: settings.address || undefined,
    });
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  }, [b, at, status, durationOf, phone, email, settings.address, t]);

  const addCustom = (): string | null => {
    if (!customDate || !customTime) return null;
    return zonedToUtc(customDate, customTime, tz).toISOString();
  };

  const eventLabel = (e: BookingEvent) => {
    switch (e.type) {
      case 'created':
        return t.evCreated;
      case 'resubmitted':
        return t.evResubmitted;
      case 'status':
        return fmt(t.evStatus, { from: statusLabel((e.from_status as BookingStatus) || 'new', t), to: statusLabel((e.to_status as BookingStatus) || 'new', t) });
      case 'contacted': {
        const [channel, kind] = (e.note || '').split(':');
        return fmt(t.evContacted, { channel: channel || '', kind: kind || '' });
      }
      case 'note':
        return t.evNote;
      case 'merged':
        return t.evMerged;
      case 'merged_in':
        return t.evMergedIn;
      case 'trashed':
        return t.evTrashed;
      case 'restored':
        return t.evRestored;
      case 'rescheduled':
        return t.evRescheduled;
      default:
        return e.type;
    }
  };

  if (!b || !group) return null;

  const primaryActions: { label: string; icon: React.ReactNode; onClick: () => void; variant?: 'default' | 'outline' | 'accent' }[] = [];
  if (status === 'new' || status === 'contacted') {
    if (isExpired) {
      primaryActions.push({ label: t.actFollowUp, icon: <MessageSquareText />, onClick: () => openDialog('suggest') });
      primaryActions.push({ label: t.actArchive, icon: <Archive />, onClick: () => void setStatus('archived'), variant: 'outline' });
    } else {
      primaryActions.push({ label: t.actConfirm, icon: <Check />, onClick: () => openDialog('confirm') });
      primaryActions.push({ label: t.actSuggest, icon: <CalendarPlus />, onClick: () => openDialog('suggest'), variant: 'outline' });
      primaryActions.push({ label: t.actDecline, icon: <X />, onClick: () => openDialog('decline'), variant: 'outline' });
    }
  } else if (status === 'confirmed') {
    primaryActions.push({ label: t.actComplete, icon: <Check />, onClick: () => void setStatus('completed') });
    if (preferredChannel) primaryActions.push({ label: t.actReminder, icon: <Bell />, onClick: () => openDialog('reminder'), variant: 'outline' });
  } else if (status === 'completed') {
    if (preferredChannel) primaryActions.push({ label: t.actRequestReview, icon: <Star />, onClick: () => openDialog('review') });
    primaryActions.push({ label: t.actArchive, icon: <Archive />, onClick: () => void setStatus('archived'), variant: 'outline' });
  } else {
    primaryActions.push({ label: t.actReopen, icon: <RotateCcw />, onClick: () => void setStatus('new') });
  }

  const overflow = (
    <Menu
      label={t.actMore}
      trigger={
        <Button variant="outline" size="icon-lg" aria-label={t.actMore} className="h-11 w-11 rounded-full">
          <MoreHorizontal />
        </Button>
      }
    >
      {status === 'confirmed' && (
        <>
          <MenuItem icon={<UserX />} onSelect={() => void setStatus('no_show')}>
            {t.actNoShow}
          </MenuItem>
          <MenuItem icon={<X />} onSelect={() => void setStatus('cancelled')}>
            {t.actCancelAppt}
          </MenuItem>
          {icsHref && (
            <MenuItem icon={<CalendarPlus />} href={icsHref} download={`appointment-${b.id.slice(0, 8)}.ics`}>
              {t.actDownloadIcs}
            </MenuItem>
          )}
          <MenuSeparator />
        </>
      )}
      {(status === 'new' || status === 'contacted') && !isExpired && (
        <MenuItem icon={<Archive />} onSelect={() => void setStatus('archived')}>
          {t.actArchive}
        </MenuItem>
      )}
      {status !== 'archived' && status !== 'completed' && status !== 'confirmed' && status !== 'new' && status !== 'contacted' && (
        <MenuItem icon={<Archive />} onSelect={() => void setStatus('archived')}>
          {t.actArchive}
        </MenuItem>
      )}
      <MenuItem
        icon={<MailOpen />}
        onSelect={() => {
          void setBookingsRead(memberIds, false).then(onChanged);
        }}
      >
        {t.actMarkUnread}
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={<Trash2 />} danger onSelect={() => setDialog('delete')}>
        {t.actDelete}
      </MenuItem>
    </Menu>
  );

  const slotButton = (iso: string, selected: boolean, onClick: () => void, multi = false) => {
    const d = new Date(iso);
    return (
      <button
        key={iso}
        type="button"
        role={multi ? 'checkbox' : 'radio'}
        aria-checked={selected}
        onClick={onClick}
        className={`flex min-h-[44px] items-center justify-between rounded-xl border px-3 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          selected ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground/40'
        }`}
      >
        <span>{formatDate(d, lang, tz, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        <span className="font-medium">{formatTime(d, lang, tz)}</span>
      </button>
    );
  };

  const messageBox = (
    <div>
      <SectionTitle>{t.messagePreview}</SectionTitle>
      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="text-[15px] leading-relaxed" aria-label={t.messagePreview} />
      <p className="mt-1 text-xs text-muted-foreground">{t.editMessage}</p>
    </div>
  );

  const sendButtons = (kind: 'confirm' | 'suggest' | 'decline' | 'reminder' | 'review', beforeNavigate: () => Promise<void>) => (
    <>
      <Button variant="outline" onClick={() => setDialog(null)} disabled={busy} className="h-11">
        {t.cancel}
      </Button>
      {phone && (
        <Button asChild className="h-11">
          <a
            href={messageHref('sms', message)}
            onClick={() => {
              void run(async () => {
                await beforeNavigate();
                await logContact('sms', kind, kind === 'suggest' ? picked : undefined);
              }, t.toastUpdated);
            }}
          >
            <MessageSquareText /> {kind === 'confirm' ? t.confirmAndText : t.openMessages}
          </a>
        </Button>
      )}
      {email && (
        <Button asChild variant={phone ? 'outline' : 'default'} className="h-11">
          <a
            href={messageHref('email', message, `Skin Beauty — ${b.service || ''}`)}
            onClick={() => {
              void run(async () => {
                await beforeNavigate();
                await logContact('email', kind, kind === 'suggest' ? picked : undefined);
              }, t.toastUpdated);
            }}
          >
            <Mail /> {kind === 'confirm' ? t.confirmAndEmail : t.openEmail}
          </a>
        </Button>
      )}
    </>
  );

  return (
    <>
      <Sheet
        open={Boolean(group)}
        onClose={onClose}
        title={displayName(b, t)}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <StatusChip status={status} size="md" />
            {decor?.client && decor.client.visits > 0 && <Chip tone="success">{fmt(t.badgeReturning, { n: decor.client.visits })}</Chip>}
            {decor?.client && decor.client.visits === 0 && <Chip tone="outline">{t.badgeNewClient}</Chip>}
            {group.count > 1 && <Chip tone="neutral">{fmt(t.badgeSubmissions, { n: group.count })}</Chip>}
          </span>
        }
        size="lg"
        footer={
          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-wrap gap-2">
              {primaryActions.map((a, i) => (
                <Button key={i} variant={a.variant ?? (i === 0 ? 'default' : 'outline')} onClick={a.onClick} disabled={busy} className="h-11 flex-1 rounded-full md:flex-none">
                  {a.icon} {a.label}
                </Button>
              ))}
            </div>
            {overflow}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Urgency / expiry hints */}
          {(status === 'new' || status === 'contacted') && timing === 'urgent' && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-100 px-3 py-2 text-sm text-amber-900">
              <Sparkles className="size-4" aria-hidden /> {t.badgeReplyToday}
            </div>
          )}
          {(status === 'new' || status === 'contacted') && isExpired && (
            <div className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
              {t.expiredHint} {t.followUpHint}
            </div>
          )}
          {status === 'contacted' && !isExpired && <div className="rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-900">{t.contactedHint}</div>}

          {/* Contact */}
          <section>
            <SectionTitle>{t.contact}</SectionTitle>
            <div className="rounded-2xl border border-border">
              {phone ? (
                <div className="flex items-center gap-2 px-3 py-1">
                  <Phone className="size-4 text-muted-foreground" aria-hidden />
                  <span className="flex-1 text-sm">{formatPhone(phone)}</span>
                  <CopyButton text={formatPhone(phone)} label={t.phone} />
                </div>
              ) : (
                <p className="px-3 py-3 text-sm text-muted-foreground">{t.noPhoneCaptured}</p>
              )}
              {email && (
                <div className="flex items-center gap-2 border-t border-border px-3 py-1">
                  <Mail className="size-4 text-muted-foreground" aria-hidden />
                  <span className="flex-1 truncate text-sm">{email}</span>
                  <CopyButton text={email} label={t.email} />
                </div>
              )}
              <div className={`flex flex-wrap gap-2 border-t border-border ${phone || email ? 'p-3' : 'px-3 py-2'}`}>
                {phone && (
                  <>
                    <Button asChild className="h-11 rounded-full">
                      <a href={smsHref(phone, renderTemplate(tpl('quick'), vars(at)))} onClick={() => void logContact('sms', 'custom').then(onChanged)}>
                        <MessageSquareText /> {t.actionText}
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="h-11 rounded-full">
                      <a href={telHref(phone)} onClick={() => void logContact('call', 'custom').then(onChanged)}>
                        <Phone /> {t.actionCall}
                      </a>
                    </Button>
                  </>
                )}
                {email && (
                  <Button asChild variant="outline" className="h-11 rounded-full">
                    <a href={mailtoHref(email, `Skin Beauty — ${b.service || ''}`, renderTemplate(tpl('quick'), vars(at)))} onClick={() => void logContact('email', 'custom').then(onChanged)}>
                      <Mail /> {t.actionEmail}
                    </a>
                  </Button>
                )}
                <span className="ml-auto self-center text-xs uppercase tracking-wider text-muted-foreground">
                  {t.via} {methodLabel(b.method, t)}
                </span>
              </div>
            </div>
          </section>

          {/* Request */}
          <section>
            <SectionTitle>{t.requestDetails}</SectionTitle>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">{t.service}</dt>
              <dd className="font-medium">{b.service || t.unknownService}</dd>
              <dt className="text-muted-foreground">{t.price}</dt>
              <dd>{b.price || '—'}</dd>
              <dt className="text-muted-foreground">{t.duration}</dt>
              <dd>{fmt(t.minutesShort, { n: durationOf(b) })}</dd>
              <dt className="text-muted-foreground">{t.preferredTime}</dt>
              <dd>
                <span className={isExpired ? 'text-muted-foreground line-through' : 'font-medium'}>{formatPreferred(b, { lang, tz, t, now, long: true })}</span>
                {b.preferred_time && !b.preferred_at && <span className="ml-1 text-muted-foreground">{timeLabel(b.preferred_time, lang)}</span>}
              </dd>
              {(group.options.length > 1 || (b.alt_times && b.alt_times.length > 0)) && (
                <>
                  <dt className="text-muted-foreground">{t.alsoOk}</dt>
                  <dd className="space-y-0.5">
                    {group.options
                      .filter((o) => o.bookingId !== b.id || o.at !== b.preferred_at)
                      .map((o) => (
                        <div key={o.bookingId}>
                          {o.at
                            ? formatDateTime(new Date(o.at), lang, tz)
                            : `${o.preferred_date ?? t.noDate} ${timeLabel(o.preferred_time, lang)}`}
                        </div>
                      ))}
                    {(b.alt_times ?? []).map((iso) => (
                      <div key={iso}>{formatDateTime(new Date(iso), lang, tz)}</div>
                    ))}
                  </dd>
                </>
              )}
              <dt className="text-muted-foreground">{t.submitted}</dt>
              <dd>
                {formatDateTime(new Date(b.created_at), lang, tz)} · {relativeSubmitted(b.created_at, lang)}
              </dd>
              <dt className="text-muted-foreground">{t.siteLanguage}</dt>
              <dd>{b.lang === 'uk' ? t.lang_uk : b.lang === 'es' ? t.lang_es : t.lang_en}</dd>
            </dl>
            {decor && decor.conflicts.length > 0 && (
              <ul className="mt-3 space-y-1 rounded-xl bg-amber-100 px-3 py-2 text-sm text-amber-900" role="alert">
                {decor.conflicts.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {conflictText(c)}
                  </li>
                ))}
              </ul>
            )}
            {b.details && (
              <blockquote className="mt-3 whitespace-pre-wrap rounded-xl border-l-4 border-accent bg-accent/10 px-3 py-2 text-[15px] leading-relaxed">{b.details}</blockquote>
            )}
          </section>

          {/* Duplicate submissions */}
          {group.count > 1 && (
            <section>
              <button
                type="button"
                onClick={() => setShowSubmissions((v) => !v)}
                aria-expanded={showSubmissions}
                className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-border px-3 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>
                  <Copy className="mr-2 inline size-4 text-muted-foreground" aria-hidden />
                  {fmt(t.badgeSubmissions, { n: group.count })}
                </span>
                <ChevronDown className={`size-4 transition-transform ${showSubmissions ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              {showSubmissions && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-muted-foreground">{fmt(t.duplicatesHint, { n: group.count })}</p>
                  {group.members.map((m) => (
                    <div key={m.id} className={`rounded-xl border px-3 py-2 text-sm ${m.id === b.id ? 'border-foreground/40' : 'border-border'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span>{formatDateTime(new Date(m.created_at), lang, tz)}</span>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">{methodLabel(m.method, t)}</span>
                      </div>
                      <div className="text-muted-foreground">{formatPreferred(m, { lang, tz, t, now })}</div>
                      {m.details && m.details !== b.details && <div className="mt-1 whitespace-pre-wrap">{m.details}</div>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Client history */}
          {decor?.client && (
            <section>
              <SectionTitle>{t.clientHistory}</SectionTitle>
              <div className="flex flex-wrap gap-2 text-sm">
                <Chip tone="neutral" size="md">{fmt(t.requestsCount, { n: decor.client.requests })}</Chip>
                <Chip tone={decor.client.visits ? 'success' : 'outline'} size="md">{fmt(t.visitsCount, { n: decor.client.visits })}</Chip>
                {decor.client.lastVisitAt && (
                  <Chip tone="outline" size="md">
                    {t.lastVisit}: {formatDate(new Date(decor.client.lastVisitAt), lang, tz, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Chip>
                )}
              </div>
              {decor.client.bookings.filter((x) => !memberIds.includes(x.id)).length > 0 && (
                <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
                  {decor.client.bookings
                    .filter((x) => !memberIds.includes(x.id))
                    .slice(0, 6)
                    .map((x) => (
                      <li key={x.id}>
                        <button
                          type="button"
                          onClick={() => onOpenBooking(x.id)}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="min-w-0">
                            <span className="block truncate">{x.service || t.unknownService}</span>
                            <span className="block text-xs text-muted-foreground">{formatPreferred(x, { lang, tz, t, now })}</span>
                          </span>
                          <StatusChip status={statusOf(x)} />
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </section>
          )}

          {/* AI assist */}
          {aiAvailable && (
            <section>
              <SectionTitle
                action={
                  <Button variant="outline" size="sm" onClick={runAi} disabled={ai.loading} className="h-9 rounded-full">
                    <Wand2 /> {ai.loading ? t.aiWorking : t.aiGenerate}
                  </Button>
                }
              >
                {t.actAi}
              </SectionTitle>
              {ai.error && <p className="text-sm text-destructive">{ai.error}</p>}
              {ai.summary && (
                <p className="rounded-xl bg-muted px-3 py-2 text-sm">
                  <span className="font-medium">{t.aiSummary}: </span>
                  {ai.summary}
                </p>
              )}
              {ai.draft && (
                <div className="mt-2 rounded-xl border border-border p-3 text-sm">
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{t.aiDraft}</p>
                  <p className="whitespace-pre-wrap">{ai.draft}</p>
                  {phone && (
                    <Button asChild size="sm" className="mt-3 h-10 rounded-full">
                      <a href={smsHref(phone, ai.draft)} onClick={() => void logContact('sms', 'custom').then(onChanged)}>
                        <MessageSquareText /> {t.aiUseDraft}
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Notes */}
          <section>
            <SectionTitle action={<span className="text-xs text-muted-foreground">{notesState === 'saving' ? t.notesSaving : notesState === 'saved' ? t.notesSaved : ''}</span>}>
              {t.privateNotes}
            </SectionTitle>
            <Textarea value={notes} onChange={(e) => onNotesChange(e.target.value)} placeholder={t.notesPlaceholder} rows={3} aria-label={t.privateNotes} />
          </section>

          {/* Activity */}
          <section>
            <SectionTitle>{t.activity}</SectionTitle>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noActivity}</p>
            ) : (
              <ol className="relative space-y-3 border-l border-border pl-4 text-sm">
                {[...events].reverse().map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-background bg-accent" aria-hidden />
                    <p>{eventLabel(e)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(new Date(e.created_at), lang, tz)}
                      {e.actor && e.actor !== 'client' && e.actor !== 'system' ? ` · ${e.actor}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </Sheet>

      {/* Confirm */}
      <Dialog
        open={dialog === 'confirm'}
        onClose={() => setDialog(null)}
        title={t.confirmTitle}
        size="md"
        footer={
          <>
            {sendButtons('confirm', async () => {
              const r = await updateBookingStatus([b.id], 'confirmed', { at: chosenAt });
              if (!r.success) throw new Error(r.error);
            })}
            <Button
              variant="ghost"
              disabled={busy || !chosenAt}
              className="h-11"
              onClick={() => void setStatus('confirmed', { at: chosenAt })}
            >
              {t.confirmOnly}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <SectionTitle>{t.timeForAppointment}</SectionTitle>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t.chooseTime}>
              {at && hasChosenTime(b) && !isExpired && slotButton(at.toISOString(), chosenAt === at.toISOString(), () => setChosenAt(at.toISOString()))}
              {group.options
                .filter((o) => o.at && o.at !== b.preferred_at && new Date(o.at).getTime() > now.getTime())
                .map((o) => slotButton(o.at as string, chosenAt === o.at, () => setChosenAt(o.at as string)))}
              {openSlots.slice(0, 3).map((d) => slotButton(d.toISOString(), chosenAt === d.toISOString(), () => setChosenAt(d.toISOString())))}
            </div>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <label className="flex-1 text-xs text-muted-foreground">
                {t.customTime}
                <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground" />
              </label>
              <input type="time" step={900} value={customTime} onChange={(e) => setCustomTime(e.target.value)} aria-label={t.customTime} className="h-11 w-32 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground" />
              <Button
                variant="outline"
                className="h-11"
                disabled={!customDate || !customTime}
                onClick={() => {
                  const iso = addCustom();
                  if (iso) setChosenAt(iso);
                }}
              >
                {t.apply}
              </Button>
            </div>
            {chosenAt && (
              <p className="mt-2 text-sm">
                {t.confirmFor}: <span className="font-medium">{formatDateTime(new Date(chosenAt), lang, tz)}</span>
              </p>
            )}
            {chosenConflicts.length > 0 && (
              <ul className="mt-2 space-y-1 rounded-xl bg-amber-100 px-3 py-2 text-sm text-amber-900" role="alert">
                {chosenConflicts.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {conflictText(c)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {(phone || email) && messageBox}
        </div>
      </Dialog>

      {/* Suggest another time */}
      <Dialog open={dialog === 'suggest'} onClose={() => setDialog(null)} title={t.suggestTitle} description={t.suggestHint} size="md" footer={sendButtons('suggest', async () => undefined)}>
        <div className="space-y-4">
          <div>
            <SectionTitle>{t.nextOpen}</SectionTitle>
            {openSlots.length === 0 && picked.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noOpenSlots}</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {Array.from(new Set([...openSlots.map((d) => d.toISOString()), ...picked]))
                  .sort()
                  .map((iso) =>
                    slotButton(
                      iso,
                      picked.includes(iso),
                      () => setPicked((p) => (p.includes(iso) ? p.filter((x) => x !== iso) : p.length >= 3 ? p : [...p, iso])),
                      true,
                    ),
                  )}
              </div>
            )}
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <label className="flex-1 text-xs text-muted-foreground">
                {t.customTime}
                <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground" />
              </label>
              <input type="time" step={900} value={customTime} onChange={(e) => setCustomTime(e.target.value)} aria-label={t.customTime} className="h-11 w-32 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground" />
              <Button
                variant="outline"
                className="h-11"
                disabled={!customDate || !customTime || picked.length >= 3}
                onClick={() => {
                  const iso = addCustom();
                  if (iso && !picked.includes(iso)) setPicked((p) => [...p, iso]);
                }}
              >
                {t.add}
              </Button>
            </div>
          </div>
          {messageBox}
        </div>
      </Dialog>

      {/* Decline */}
      <Dialog
        open={dialog === 'decline'}
        onClose={() => setDialog(null)}
        title={t.declineTitle}
        description={t.declineHint}
        size="md"
        footer={
          <>
            {sendButtons('decline', async () => {
              const r = await updateBookingStatus([b.id], 'declined');
              if (!r.success) throw new Error(r.error);
            })}
            <Button variant="ghost" disabled={busy} className="h-11" onClick={() => void setStatus('declined')}>
              {t.confirmOnly}
            </Button>
          </>
        }
      >
        {messageBox}
      </Dialog>

      {/* Reminder / review request */}
      <Dialog open={dialog === 'reminder'} onClose={() => setDialog(null)} title={t.actReminder} size="md" footer={sendButtons('reminder', async () => undefined)}>
        {messageBox}
      </Dialog>
      <Dialog open={dialog === 'review'} onClose={() => setDialog(null)} title={t.actRequestReview} size="md" footer={sendButtons('review', async () => undefined)}>
        {messageBox}
      </Dialog>

      {/* Delete → Trash */}
      <ConfirmDialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        onConfirm={() => {
          setDialog(null);
          onTrash(memberIds);
        }}
        title={t.deleteTitle}
        body={t.deleteBody}
        confirmLabel={t.actDelete}
        danger
      />
    </>
  );
}
