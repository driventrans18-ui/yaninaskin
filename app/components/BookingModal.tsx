'use client';

import React, { useEffect, useState } from 'react';
import { X, Instagram } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

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
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [details, setDetails] = useState('');
  const [igNotice, setIgNotice] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    service?: string;
    details?: string;
  }>({});

  const hasTreatments = categories.some((c) => c.treatments.length > 0);
  const isOther = service === OTHER;

  // Don't let visitors pick a date in the past.
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  // Turn the raw <input> values into a friendly, localized phrase for the text.
  const formatWhen = (): string => {
    if (!date && !time) return '';
    let out = '';
    if (date) {
      const d = new Date(`${date}T00:00`);
      out = d.toLocaleDateString(lang, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
    if (time) {
      const [h, m] = time.split(':');
      const dt = new Date();
      dt.setHours(Number(h), Number(m));
      const timeStr = dt.toLocaleTimeString(lang, {
        hour: 'numeric',
        minute: '2-digit',
      });
      out = out ? `${out} ${tr.atWord} ${timeStr}` : timeStr;
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

  // Validate the form and assemble the message. Returns the ready-to-send
  // text, or null if something's missing (in which case errors are shown).
  const buildMessage = (): string | null => {
    const e: { name?: string; service?: string; details?: string } = {};
    if (!name.trim()) e.name = tr.nameRequired;
    if (hasTreatments && !service) e.service = tr.serviceRequired;
    // The details field carries the request when there's no treatment list,
    // or when they pick "Something else".
    if ((!hasTreatments || isOther) && !details.trim()) {
      e.details = tr.detailsRequired;
    }
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return null;
    }

    // Build the human-readable request: the chosen treatment (if any), the
    // preferred date/time, plus any extra details the visitor typed.
    const parts: string[] = [];
    if (service && !isOther) parts.push(service);
    const when = formatWhen();
    if (when) parts.push(when);
    if (details.trim()) parts.push(details.trim());
    const request = parts.join(' — ');

    return (tr.messageTemplate as string)
      .replace('{name}', name.trim())
      .replace('{request}', request);
  };

  const sendText = () => {
    const body = buildMessage();
    if (body === null) return;

    // Keep digits and a leading "+" so the sms: scheme gets a clean number.
    const cleanPhone = (phone || '').replace(/[^\d+]/g, '');

    // "?&body=" is the cross-platform form that works on both modern iOS
    // (Messages) and Android (Messages) when opening the SMS app.
    const smsLink = `sms:${cleanPhone}?&body=${encodeURIComponent(body)}`;

    window.location.href = smsLink;
    onClose();
  };

  // Instagram has no way to pre-fill a DM, so we copy the message to the
  // clipboard and open the chat — the visitor just pastes and sends.
  const sendInstagram = () => {
    const body = buildMessage();
    if (body === null) return;

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
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-xl">{tr.title}</h3>
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
            <p className="mb-6 text-sm text-muted-foreground">{tr.subtitle}</p>

            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
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
                  <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
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

              {/* Preferred date & time */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
                    {tr.dateLabel}
                  </label>
                  <Input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    aria-label={tr.dateLabel}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
                    {tr.timeLabel}
                  </label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    aria-label={tr.timeLabel}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
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
                  rows={4}
                />
                {errors.details && (
                  <p className="mt-1 text-xs text-red-500">{errors.details}</p>
                )}
              </div>
            </div>

            <p className="mt-5 rounded-lg bg-accent/10 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              {tr.disclaimer}
            </p>

            <div className="mt-4 grid gap-3">
              {hasPhone && (
                <Button
                  onClick={sendText}
                  variant="accent"
                  size="pill"
                  className="w-full"
                >
                  {tr.send}
                </Button>
              )}

              {hasInstagram && (
                <Button
                  onClick={sendInstagram}
                  variant={hasPhone ? 'outline' : 'accent'}
                  size="pill"
                  className="w-full"
                >
                  <Instagram aria-hidden />
                  {tr.sendInstagram}
                </Button>
              )}
            </div>

            {igNotice && (
              <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                {tr.instagramNotice}
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
