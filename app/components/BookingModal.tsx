'use client';

import React, { useEffect, useState } from 'react';
import { X, Instagram, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import { trackEvent } from '@/lib/gtag';
import { submitBooking } from '../actions/bookings';

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

// Pull a clean Instagram handle out of whatever the admin saved — a full
// profile URL ("https://instagram.com/yaninaskin/"), or a bare "@handle".
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

export default function BookingModal({
  phone,
  instagramUrl,
  categories = [],
  initialService = '',
  onClose,
}: {
  phone?: string | null;
  instagramUrl?: string | null;
  categories?: BookingCategory[];
  initialService?: string;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const tr = (t[lang] as any).booking;

  const [name, setName] = useState('');
  const [service, setService] = useState(initialService);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [details, setDetails] = useState('');
  const [igNotice, setIgNotice] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    service?: string;
    details?: string;
  }>({});

  const hasTreatments = categories.some((c) => c.treatments.length > 0);
  const isOther = service === OTHER;

  // Midnight today — used to disable past dates in the calendar.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Whole-hour appointment slots (9 AM – 6 PM), labelled in the active locale.
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const h = 9 + i;
    const dt = new Date();
    dt.setHours(h, 0, 0, 0);
    return {
      value: `${String(h).padStart(2, '0')}:00`,
      label: dt.toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' }),
    };
  });

  // Friendly label for the chosen time slot (e.g. "9:00 AM"), if any.
  const timeLabel = time
    ? timeSlots.find((s) => s.value === time)?.label ?? ''
    : '';

  // Build the picker's trigger text and the localized phrase for the message.
  const formatWhen = (): string => {
    if (!date && !time) return '';
    let out = '';
    if (date) {
      out = date.toLocaleDateString(lang, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
    if (timeLabel) {
      out = out ? `${out} ${tr.atWord} ${timeLabel}` : timeLabel;
    }
    return `${tr.preferredPrefix}: ${out}`;
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

  // Assemble the message from whatever the visitor filled in. Best-effort:
  // any field may be blank (the Instagram path doesn't require them).
  const composeMessage = (): string => {
    const parts: string[] = [];
    if (service && !isOther) parts.push(service);
    const when = formatWhen();
    if (when) parts.push(when);
    if (details.trim()) parts.push(details.trim());
    const request = parts.join(' — ');

    const nm = name.trim();
    if (nm) {
      return (tr.messageTemplate as string)
        .replace('{name}', nm)
        .replace('{request}', request);
    }
    // No name given — fall back to a clean greeting (Instagram path).
    return request ? `${tr.messageNoName}: ${request}` : `${tr.messageNoName}.`;
  };

  // Assemble the structured booking record saved to the admin Bookings tab.
  // Looks up the chosen treatment so the owner sees its price alongside the
  // request. Any field may be blank (the Instagram path is lenient).
  const buildBookingRecord = (method: 'sms' | 'instagram') => {
    const selectedTreatment = categories
      .flatMap((c) => c.treatments)
      .find((tr) => tr.title === service);
    const preferredDate = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
          date.getDate(),
        ).padStart(2, '0')}`
      : null;
    return {
      name: name.trim() || 'No name given',
      service: isOther ? tr.otherOption : service || null,
      price: selectedTreatment?.price ?? null,
      preferredDate,
      preferredTime: timeLabel || null,
      details: details.trim() || null,
      method,
    };
  };

  // Check the required fields for the text path and surface any errors.
  const validate = (): boolean => {
    const e: { name?: string; service?: string; details?: string } = {};
    if (!name.trim()) e.name = tr.nameRequired;
    if (hasTreatments && !service) e.service = tr.serviceRequired;
    // The details field carries the request when there's no treatment list,
    // or when they pick "Something else".
    if ((!hasTreatments || isOther) && !details.trim()) {
      e.details = tr.detailsRequired;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const sendText = async () => {
    if (!validate()) return;
    // A completed booking hand-off via SMS — the real conversion.
    trackEvent('booking_submit', { method: 'sms', service: service || '(unspecified)' });
    // Save the request to the admin Bookings tab. Await before navigating away
    // (the sms: link replaces the page) so the insert isn't cancelled in
    // flight; a DB hiccup must never block the actual text.
    try {
      await submitBooking(buildBookingRecord('sms'));
    } catch {
      /* ignore — proceed to open the SMS app regardless */
    }
    const body = composeMessage();

    // Keep digits and a leading "+" so the sms: scheme gets a clean number.
    const cleanPhone = (phone || '').replace(/[^\d+]/g, '');

    // "?&body=" is the cross-platform form that works on both modern iOS
    // (Messages) and Android (Messages) when opening the SMS app.
    const smsLink = `sms:${cleanPhone}?&body=${encodeURIComponent(body)}`;

    window.location.href = smsLink;
    onClose();
  };

  // Instagram can't pre-fill a DM and doesn't need the form filled out, so we
  // skip the required-field checks, copy whatever was entered, and open the
  // chat — the visitor just pastes (or types) and sends.
  const sendInstagram = () => {
    // A completed booking hand-off via Instagram DM — the real conversion.
    trackEvent('booking_submit', { method: 'instagram', service: service || '(unspecified)' });
    // Save the request for the admin Bookings tab. Fire-and-forget: the current
    // page stays open (Instagram opens in a new tab), so the insert completes,
    // and not awaiting keeps window.open() inside the user gesture so it isn't
    // blocked as a popup.
    void submitBooking(buildBookingRecord('instagram'));
    const body = composeMessage();

    try {
      navigator.clipboard?.writeText(body);
    } catch {
      /* clipboard may be unavailable — the chat still opens */
    }

    // ig.me/m/<handle> deep-links straight into a DM thread; fall back to the
    // plain profile URL if we couldn't work out the handle.
    const url = igHandle
      ? `https://ig.me/m/${igHandle}`
      : (instagramUrl || '').trim();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');

    setIgNotice(true);
  };

  const hasPhone = Boolean((phone || '').replace(/[^\d+]/g, ''));
  const igHandle = instagramHandle(instagramUrl);
  const hasInstagram = Boolean(igHandle || (instagramUrl || '').trim());
  const canBook = hasPhone || hasInstagram;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={tr.title}
    >
      <Card
        className="w-full max-w-lg p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-1.5">
          <h3 className="text-lg">{tr.title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr.cancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!canBook ? (
          <p className="mt-4 text-sm text-muted-foreground">{tr.noPhone}</p>
        ) : (
          <>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{tr.subtitle}</p>

            <div className="grid gap-2.5">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">
                  {tr.nameLabel}
                </label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder={tr.namePlaceholder}
                  aria-label={tr.nameLabel}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Treatment dropdown — grouped by category, plus "Something else" */}
              {hasTreatments && (
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">
                    {tr.serviceLabel}
                  </label>
                  <Select
                    value={service}
                    onChange={(e) => {
                      setService(e.target.value);
                      setErrors((prev) => ({ ...prev, service: '', details: '' }));
                    }}
                    aria-label={tr.serviceLabel}
                    className="w-full px-3 py-2 text-sm"
                  >
                    <option value="" disabled>
                      {tr.servicePlaceholder}
                    </option>
                    {categories.map((cat) =>
                      cat.treatments.length > 0 ? (
                        <optgroup key={cat.title} label={cat.title}>
                          {cat.treatments.map((treat) => {
                            const meta = [treat.price, treat.duration]
                              .filter(Boolean)
                              .join(', ');
                            return (
                              <option
                                key={`${cat.title}-${treat.title}`}
                                value={treat.title}
                              >
                                {meta ? `${treat.title} — ${meta}` : treat.title}
                              </option>
                            );
                          })}
                        </optgroup>
                      ) : null
                    )}
                    <option value={OTHER}>{tr.otherOption}</option>
                  </Select>
                  {errors.service && (
                    <p className="mt-1 text-xs text-red-500">{errors.service}</p>
                  )}
                </div>
              )}

              {/* Preferred date & time — calendar + slots in a popover so the
                  modal stays compact. Weekends and past days are disabled. */}
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">
                  {tr.dateTimeLabel}
                </label>
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 text-sm transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={tr.dateTimeLabel}
                    >
                      <span
                        className={
                          date || time ? 'text-foreground' : 'text-muted-foreground'
                        }
                      >
                        {[
                          date
                            ? date.toLocaleDateString(lang, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '',
                          timeLabel,
                        ]
                          .filter(Boolean)
                          .join(' · ') || tr.dateTimePlaceholder}
                      </span>
                      <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-3">
                    {/* Calendar and time stack on mobile, sit side by side on
                        wider screens so the popover never needs to scroll. */}
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={[{ before: today }, { dayOfWeek: [0, 6] }]}
                      />
                      <div className="mt-3 border-t border-border pt-3 sm:mt-0 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                          {tr.pickTime}
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:w-[180px]">
                          {timeSlots.map((slot) => (
                            <Button
                              key={slot.value}
                              type="button"
                              variant={time === slot.value ? 'accent' : 'outline'}
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setTime(slot.value);
                                setPickerOpen(false);
                              }}
                            >
                              {slot.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">
                  {/* If no treatment list exists, or they picked "Something
                      else", this field carries the actual request. */}
                  {!hasTreatments || isOther
                    ? tr.detailsLabelOther
                    : tr.detailsLabel}
                </label>
                <Textarea
                  value={details}
                  onChange={(e) => {
                    setDetails(e.target.value);
                    setErrors((prev) => ({ ...prev, details: '' }));
                  }}
                  placeholder={
                    !hasTreatments || isOther
                      ? tr.detailsPlaceholderOther
                      : tr.detailsPlaceholder
                  }
                  aria-label={
                    !hasTreatments || isOther
                      ? tr.detailsLabelOther
                      : tr.detailsLabel
                  }
                  rows={2}
                />
                {errors.details && (
                  <p className="mt-1 text-xs text-red-500">{errors.details}</p>
                )}
              </div>
            </div>

            <p className="mt-3 rounded-lg bg-accent/10 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
              {tr.disclaimer}
            </p>

            <div className="mt-3 grid gap-2">
              {hasPhone && (
                <Button
                  onClick={sendText}
                  variant="accent"
                  size="pill"
                  className="w-full py-2.5"
                >
                  {tr.send}
                </Button>
              )}

              {hasInstagram && (
                <Button
                  onClick={sendInstagram}
                  variant={hasPhone ? 'outline' : 'accent'}
                  size="pill"
                  className="w-full py-2.5"
                >
                  <Instagram aria-hidden />
                  {tr.sendInstagram}
                </Button>
              )}
            </div>

            {igNotice && (
              <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">
                {tr.instagramNotice}
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
