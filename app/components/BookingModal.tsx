'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Instagram, Calendar as CalendarIcon, CheckCircle2, MessageSquareText, Mail, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import { trackEvent } from '@/lib/gtag';
import { submitBooking } from '../actions/bookings';
import type { PublicBookingConfig } from '../actions/settings';
import type { BookingSettings, ContactMethod } from '@/lib/booking/types';
import { DEFAULT_SETTINGS, legacyHours } from '@/lib/booking/settings';
import { slotsForDate, isOpenDay } from '@/lib/booking/availability';
import { normalizePhone, normalizeEmail } from '@/lib/phone';
import { addDays, dateKey, timeKey, formatTime } from '@/lib/tz';

export interface BookingTreatment {
  title: string;
  price?: string;
  duration?: string;
}

export interface BookingCategory {
  title: string;
  treatments: BookingTreatment[];
}

// Sentinel value for the "Something else / not sure" dropdown option.
const OTHER = '__other__';

function instagramHandle(value?: string | null): string {
  if (!value) return '';
  const raw = value.trim();
  try {
    const u = new URL(raw);
    const seg = u.pathname.split('/').filter(Boolean)[0] || '';
    return seg.replace(/^@/, '');
  } catch {
    return raw.replace(/^@/, '');
  }
}

// Turn the public config (or the legacy hour props) into booking settings.
function settingsFrom(config: PublicBookingConfig | null, legacy: { startHour: number; endHour: number; openDays: number[] }): BookingSettings {
  if (!config) {
    return {
      ...DEFAULT_SETTINGS,
      businessHours: legacyHours({ booking_start_hour: legacy.startHour, booking_end_hour: legacy.endHour, booking_open_days: legacy.openDays }),
      minNoticeHours: 0,
    };
  }
  return {
    ...DEFAULT_SETTINGS,
    timezone: config.timezone,
    businessHours: config.businessHours,
    blackoutDates: config.blackoutDates,
    blockedTimes: [],
    minNoticeHours: config.minNoticeHours,
    maxDaysAhead: config.maxDaysAhead,
    slotMinutes: config.slotMinutes,
    bufferMinutes: config.bufferMinutes,
  };
}

const localDateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function BookingModal({
  phone,
  instagramUrl,
  email: studioEmail,
  categories = [],
  initialService = '',
  startHour = 9,
  endHour = 18,
  openDays = [1, 2, 3, 4, 5],
  config = null,
  onClose,
}: {
  phone?: string | null;
  instagramUrl?: string | null;
  email?: string | null;
  categories?: BookingCategory[];
  initialService?: string;
  // Legacy availability props (used until the public config has loaded).
  startHour?: number;
  endHour?: number;
  openDays?: number[];
  config?: PublicBookingConfig | null;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const tr = (t[lang] as typeof t.en).booking;
  const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));

  const settings = useMemo(() => settingsFrom(config, { startHour, endHour, openDays }), [config, startHour, endHour, openDays]);
  const tz = settings.timezone;
  const methods: ContactMethod[] = useMemo(() => {
    const list = config?.contactMethods?.length ? config.contactMethods : (['sms', 'instagram'] as ContactMethod[]);
    const hasPhone = Boolean((phone || '').replace(/[^\d+]/g, ''));
    const hasIg = Boolean((instagramUrl || '').trim());
    return list.filter((m) => (m === 'sms' || m === 'call' ? hasPhone : m === 'instagram' ? hasIg : m === 'email' ? Boolean(studioEmail) : true));
  }, [config, phone, instagramUrl, studioEmail]);

  const [name, setName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [method, setMethod] = useState<ContactMethod>(methods[0] ?? 'sms');
  const [service, setService] = useState(initialService);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState(''); // HH:MM
  const [pickerOpen, setPickerOpen] = useState(false);
  const [details, setDetails] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState<{ duplicate: boolean } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!methods.includes(method)) setMethod(methods[0] ?? 'sms');
  }, [methods, method]);

  const hasTreatments = categories.some((c) => c.treatments.length > 0);
  const isOther = service === OTHER;
  const selectedTreatment = categories.flatMap((c) => c.treatments).find((tt) => tt.title === service);
  const duration = config?.services.find((s) => s.title === service)?.durationMinutes ?? settings.slotMinutes;

  const now = useMemo(() => new Date(), []);
  const todayKey = dateKey(now, tz);
  const lastKey = addDays(todayKey, settings.maxDaysAhead);
  const busy = useMemo(() => (config?.busy ?? []).map((b) => ({ start: new Date(b.start), end: new Date(b.end) })), [config]);

  const dayKey = date ? localDateKey(date) : null;
  const slots = useMemo(() => {
    if (!dayKey) return [];
    return slotsForDate(dayKey, settings, duration, { now, busy }).map((d) => ({ value: timeKey(d, tz), label: formatTime(d, lang, tz) }));
  }, [dayKey, settings, duration, now, busy, tz, lang]);

  const disabledDay = (d: Date) => {
    const k = localDateKey(d);
    if (k < todayKey || k > lastKey) return true;
    if (!isOpenDay(k, settings)) return true;
    return slotsForDate(k, settings, duration, { now, busy }).length === 0;
  };

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

  const timeLabel = time ? slots.find((s) => s.value === time)?.label ?? '' : '';

  const formatWhen = (): string => {
    if (!date && !time) return '';
    let out = '';
    if (date) out = date.toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric' });
    if (timeLabel) out = out ? `${out} ${tr.atWord} ${timeLabel}` : timeLabel;
    return `${tr.preferredPrefix}: ${out}`;
  };

  const composeMessage = (): string => {
    const parts: string[] = [];
    if (service && !isOther) parts.push(service);
    const when = formatWhen();
    if (when) parts.push(when);
    if (details.trim()) parts.push(details.trim());
    const request = parts.join(' — ');
    const nm = name.trim();
    if (nm) return (tr.messageTemplate as string).replace('{name}', nm).replace('{request}', request);
    return request ? `${tr.messageNoName}: ${request}` : `${tr.messageNoName}.`;
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = tr.nameRequired;
    if (method === 'sms' || method === 'call') {
      if (!clientPhone.trim()) e.phone = tr.phoneRequired;
      else if (!normalizePhone(clientPhone)) e.phone = tr.phoneInvalid;
    } else if (clientPhone.trim() && !normalizePhone(clientPhone)) e.phone = tr.phoneInvalid;
    if (method === 'email') {
      if (!clientEmail.trim()) e.email = tr.emailRequired;
      else if (!normalizeEmail(clientEmail)) e.email = tr.emailInvalid;
    } else if (clientEmail.trim() && !normalizeEmail(clientEmail)) e.email = tr.emailInvalid;
    if (hasTreatments && !service) e.service = tr.serviceRequired;
    if ((!hasTreatments || isOther) && !details.trim()) e.details = tr.detailsRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (submitting || !validate()) return;
    setSubmitting(true);
    setServerError('');
    trackEvent('booking_submit', { method, service: service || '(unspecified)' });
    try {
      const result = await submitBooking({
        name: name.trim(),
        phone: clientPhone.trim() || null,
        email: clientEmail.trim() || null,
        service: isOther ? tr.otherOption : service || null,
        price: selectedTreatment?.price ?? null,
        preferredDate: dayKey,
        preferredTime: time || null,
        details: details.trim() || null,
        method,
        lang,
        website,
      });
      if (result.success) {
        setDone({ duplicate: result.duplicate });
      } else if (result.code === 'validation' && result.field) {
        setErrors((prev) => ({ ...prev, [result.field as string]: result.error }));
      } else {
        setServerError(result.code === 'rate_limited' ? tr.rateLimited : tr.serverError);
      }
    } catch {
      setServerError(tr.serverError);
    } finally {
      setSubmitting(false);
    }
  };

  const cleanPhone = (phone || '').replace(/[^\d+]/g, '');
  const igHandle = instagramHandle(instagramUrl);
  const igUrl = igHandle ? `https://ig.me/m/${igHandle}` : (instagramUrl || '').trim();
  const canBook = methods.length > 0;
  const methodLabel = (m: ContactMethod) => (m === 'sms' ? tr.methodSms : m === 'instagram' ? tr.methodInstagram : m === 'email' ? tr.methodEmail : tr.methodCall);
  const labelCls = 'mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={tr.title}
    >
      <Card className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-b-none p-5 sm:rounded-2xl sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1.5 flex items-start justify-between gap-4">
          <h3 className="text-lg">{done ? tr.receivedTitle : tr.title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr.cancel}
            className="-mr-2 -mt-2 flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!canBook ? (
          <p className="mt-4 text-sm text-muted-foreground">{tr.noPhone}</p>
        ) : done ? (
          <div className="mt-2 text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-accent/25 text-foreground">
              <CheckCircle2 className="size-7" aria-hidden />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {done.duplicate ? tr.receivedDuplicate + ' ' : ''}
              {fill(tr.receivedBody, { method: methodLabel(method) })}
            </p>
            <div className="mt-4 rounded-xl border border-border bg-muted/60 p-3 text-left text-sm">
              {service && !isOther && <p className="font-medium">{service}</p>}
              {formatWhen() && <p className="text-muted-foreground">{formatWhen()}</p>}
            </div>
            <div className="mt-4 grid gap-2">
              {method === 'sms' && cleanPhone && (
                <Button asChild variant="accent" size="pill" className="w-full py-2.5">
                  <a href={`sms:${cleanPhone}?&body=${encodeURIComponent(composeMessage())}`}>
                    <MessageSquareText aria-hidden /> {tr.openMessagesCta}
                  </a>
                </Button>
              )}
              {method === 'instagram' && igUrl && (
                <Button asChild variant="accent" size="pill" className="w-full py-2.5">
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      try {
                        navigator.clipboard?.writeText(composeMessage());
                      } catch {
                        /* clipboard unavailable */
                      }
                    }}
                  >
                    <Instagram aria-hidden /> {tr.openInstagramCta}
                  </a>
                </Button>
              )}
              {method === 'email' && studioEmail && (
                <Button asChild variant="accent" size="pill" className="w-full py-2.5">
                  <a href={`mailto:${studioEmail}?subject=${encodeURIComponent(tr.title)}&body=${encodeURIComponent(composeMessage())}`}>
                    <Mail aria-hidden /> {tr.openEmailCta}
                  </a>
                </Button>
              )}
              <Button variant="outline" size="pill" className="w-full py-2.5" onClick={onClose}>
                {tr.closeCta}
              </Button>
            </div>
            {method === 'instagram' && <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">{tr.instagramNotice}</p>}
          </div>
        ) : (
          <form
            className="mt-1"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            noValidate
          >
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{tr.subtitle}</p>

            <div className="grid gap-2.5">
              <div>
                <label htmlFor="bk-name" className={labelCls}>
                  {tr.nameLabel}
                </label>
                <Input
                  id="bk-name"
                  value={name}
                  autoComplete="name"
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: '' }));
                  }}
                  placeholder={tr.namePlaceholder}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
              </div>

              {/* Honeypot — hidden from people, filled by bots */}
              <div className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="bk-website">Website</label>
                <input id="bk-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="bk-phone" className={labelCls}>
                    {tr.phoneLabel}
                  </label>
                  <Input
                    id="bk-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={clientPhone}
                    onChange={(e) => {
                      setClientPhone(e.target.value);
                      setErrors((p) => ({ ...p, phone: '' }));
                    }}
                    placeholder={tr.phonePlaceholder}
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="bk-email" className={labelCls}>
                    {tr.emailLabel}
                  </label>
                  <Input
                    id="bk-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={clientEmail}
                    onChange={(e) => {
                      setClientEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: '' }));
                    }}
                    placeholder={tr.emailPlaceholder}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
                </div>
              </div>

              {methods.length > 1 && (
                <fieldset>
                  <legend className={labelCls}>{tr.contactMethodLabel}</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {methods.map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={method === m}
                        onClick={() => setMethod(m)}
                        className={`min-h-[40px] rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          method === m ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {methodLabel(m)}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {hasTreatments && (
                <div>
                  <label htmlFor="bk-service" className={labelCls}>
                    {tr.serviceLabel}
                  </label>
                  <Select
                    id="bk-service"
                    value={service}
                    onChange={(e) => {
                      setService(e.target.value);
                      setTime('');
                      setErrors((p) => ({ ...p, service: '', details: '' }));
                    }}
                    aria-invalid={Boolean(errors.service)}
                    className="h-10 w-full px-3 py-2 text-sm"
                  >
                    <option value="" disabled>
                      {tr.servicePlaceholder}
                    </option>
                    <option value={OTHER}>{`✨ ${tr.otherOption}`}</option>
                    {categories.map((cat) =>
                      cat.treatments.length > 0 ? (
                        <optgroup key={cat.title} label={cat.title}>
                          {cat.treatments.map((treat) => {
                            const meta = [treat.price, treat.duration].filter(Boolean).join(', ');
                            return (
                              <option key={`${cat.title}-${treat.title}`} value={treat.title}>
                                {meta ? `${treat.title} — ${meta}` : treat.title}
                              </option>
                            );
                          })}
                        </optgroup>
                      ) : null,
                    )}
                  </Select>
                  {errors.service && <p className="mt-1 text-xs text-red-700">{errors.service}</p>}
                </div>
              )}

              <div>
                <label className={labelCls}>{tr.dateTimeLabel}</label>
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 text-sm transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={tr.dateTimeLabel}
                    >
                      <span className={date || time ? 'text-foreground' : 'text-muted-foreground'}>
                        {[date ? date.toLocaleDateString(lang, { weekday: 'short', month: 'short', day: 'numeric' }) : '', timeLabel].filter(Boolean).join(' · ') || tr.dateTimePlaceholder}
                      </span>
                      <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-3">
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => {
                          setDate(d);
                          setTime('');
                        }}
                        disabled={disabledDay}
                        startMonth={now}
                      />
                      <div className="mt-3 border-t border-border pt-3 sm:mt-0 sm:w-[190px] sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">{tr.pickTime}</p>
                        {!date ? (
                          <p className="text-xs text-muted-foreground">{tr.dateTimePlaceholder}</p>
                        ) : slots.length === 0 ? (
                          <p className="text-xs text-muted-foreground">{tr.noSlots}</p>
                        ) : (
                          <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1">
                            {slots.map((slot) => (
                              <Button
                                key={slot.value}
                                type="button"
                                variant={time === slot.value ? 'accent' : 'outline'}
                                size="sm"
                                className="h-10 w-full"
                                onClick={() => {
                                  setTime(slot.value);
                                  setPickerOpen(false);
                                }}
                              >
                                {slot.label}
                              </Button>
                            ))}
                          </div>
                        )}
                        {settings.minNoticeHours > 0 && <p className="mt-2 text-[11px] text-muted-foreground">{fill(tr.noticeNote, { n: settings.minNoticeHours })}</p>}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="mt-1 text-[11px] text-muted-foreground">{tr.preferredOptional}</p>
              </div>

              <div>
                <label htmlFor="bk-details" className={labelCls}>
                  {!hasTreatments || isOther ? tr.detailsLabelOther : tr.detailsLabel}
                </label>
                <Textarea
                  id="bk-details"
                  value={details}
                  onChange={(e) => {
                    setDetails(e.target.value);
                    setErrors((p) => ({ ...p, details: '' }));
                  }}
                  placeholder={!hasTreatments || isOther ? tr.detailsPlaceholderOther : tr.detailsPlaceholder}
                  rows={2}
                  aria-invalid={Boolean(errors.details)}
                />
                {errors.details && <p className="mt-1 text-xs text-red-700">{errors.details}</p>}
              </div>
            </div>

            <p className="mt-3 rounded-lg bg-accent/10 px-3 py-2 text-[11px] leading-snug text-muted-foreground">{tr.disclaimer}</p>

            {serverError && (
              <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {serverError}
              </p>
            )}

            <div className="mt-3 grid gap-2">
              <Button type="submit" variant="accent" size="pill" className="w-full py-2.5" disabled={submitting} aria-busy={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden /> {tr.submitting}
                  </>
                ) : (
                  <>
                    {method === 'instagram' ? <Instagram aria-hidden /> : null}
                    {tr.submit}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
