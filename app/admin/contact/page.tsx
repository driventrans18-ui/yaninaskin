'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BookingSettings, BusinessHours, BlackoutDate, BlockedTime, ContactMethod } from '@/lib/booking/types';
import { DEFAULT_SETTINGS } from '@/lib/booking/settings';
import { minutesOfTime, formatDateKey, formatDateTime } from '@/lib/tz';
import { getBookingSettings, saveBookingSettings } from '../../actions/settings';
import AdminShell from '../_components/AdminShell';
import { useAdminT } from '../_components/AdminLang';
import { useToast } from '../_components/ui/Toast';
import { CardSkeleton, ErrorState, Field, SectionTitle, Switch } from '../_components/ui/Bits';
import UnsavedGuard from '../_components/ui/UnsavedGuard';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const METHODS: ContactMethod[] = ['sms', 'instagram', 'email', 'call'];

interface Form {
  phone: string;
  email: string;
  address: string;
  instagram_url: string;
  tiktok_url: string;
  social: Record<string, string>;
  hours: BusinessHours;
  closures: BlackoutDate[];
  blocked: BlockedTime[];
  methods: ContactMethod[];
}

const formFrom = (s: BookingSettings): Form => ({
  phone: s.phone,
  email: s.email,
  address: s.address,
  instagram_url: s.instagramUrl,
  tiktok_url: s.tiktokUrl,
  social: { ...s.socialLinks },
  hours: JSON.parse(JSON.stringify(s.businessHours)),
  closures: [...s.blackoutDates],
  blocked: [...s.blockedTimes],
  methods: [...s.contactMethods],
});

export default function AdminContactPage() {
  const { t, lang } = useAdminT();
  const { toast } = useToast();
  const [form, setForm] = useState<Form>(formFrom(DEFAULT_SETTINGS));
  const [saved, setSaved] = useState<string>('');
  const [tz, setTz] = useState(DEFAULT_SETTINGS.timezone);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const r = await getBookingSettings();
    setError(r.success ? null : r.error || 'load failed');
    const f = formFrom(r.data);
    setForm(f);
    setSaved(JSON.stringify(f));
    setTz(r.data.timezone);
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const dirty = JSON.stringify(form) !== saved;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const invalidShift = useMemo(() => Object.values(form.hours).some((shifts) => shifts.some((s) => minutesOfTime(s.end) <= minutesOfTime(s.start))), [form.hours]);
  const methodBlocked = (m: ContactMethod) => (m === 'sms' || m === 'call' ? !form.phone.trim() && t.needsPhone : m === 'instagram' ? !form.instagram_url.trim() && t.needsInstagram : m === 'email' ? !form.email.trim() && t.needsEmail : false);

  const save = async () => {
    if (invalidShift) return toast({ title: t.hoursInvalid, tone: 'error' });
    setSaving(true);
    const r = await saveBookingSettings({
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      instagram_url: form.instagram_url.trim(),
      tiktok_url: form.tiktok_url.trim(),
      social_links: Object.fromEntries(Object.entries(form.social).filter(([, v]) => v.trim())),
      business_hours: Object.fromEntries(Object.entries(form.hours).filter(([, shifts]) => shifts.length > 0)),
      blackout_dates: form.closures.filter((c) => c.from),
      blocked_times: form.blocked,
      contact_methods: form.methods.filter((m) => !methodBlocked(m)),
    });
    setSaving(false);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    setSaved(JSON.stringify(form));
    toast({ title: t.contactSaved });
  };

  const setDay = (d: number, shifts: { start: string; end: string }[]) => setForm((f) => ({ ...f, hours: { ...f.hours, [String(d)]: shifts } }));
  const mapSrc = form.address.trim() ? `https://www.google.com/maps?q=${encodeURIComponent(form.address.trim())}&output=embed` : null;
  const methodLabel = (m: ContactMethod) => (m === 'sms' ? t.methodSms : m === 'instagram' ? t.methodInstagram : m === 'email' ? t.methodEmail : t.methodCall);

  return (
    <AdminShell
      active="contact"
      title={t.contactTitle}
      subtitle={t.contactIntro}
      maxWidth="max-w-4xl"
      actions={
        <div className="flex w-full items-center justify-end">
          <Button className="h-11 rounded-full" onClick={() => void save()} disabled={saving || !dirty}>
            <Save /> {t.saveChanges}
          </Button>
        </div>
      }
    >
      <UnsavedGuard dirty={dirty} />
      {loading ? (
        <CardSkeleton count={4} />
      ) : error ? (
        <ErrorState body={error} onRetry={() => void load()} />
      ) : (
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <SectionTitle>{t.contactDetails}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.phone}>
                <Input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(585) 555-0123" className="h-11" />
              </Field>
              <Field label={t.email}>
                <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="h-11" />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t.address}>
                  <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Rochester, NY" className="h-11" />
                </Field>
              </div>
            </div>
            {mapSrc && (
              <div className="mt-3">
                <p className="mb-1 text-xs text-muted-foreground">{t.mapPreview} · {t.mapHint}</p>
                <iframe title={t.mapPreview} src={mapSrc} className="h-48 w-full rounded-xl border border-border" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <SectionTitle>{t.socialLinks}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.instagram}><Input value={form.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} placeholder="https://instagram.com/…" className="h-11" /></Field>
              <Field label={t.tiktok}><Input value={form.tiktok_url} onChange={(e) => set('tiktok_url', e.target.value)} placeholder="https://tiktok.com/@…" className="h-11" /></Field>
              {(['facebook', 'whatsapp', 'telegram'] as const).map((k) => (
                <Field key={k} label={t[k]}>
                  <Input value={form.social[k] ?? ''} onChange={(e) => set('social', { ...form.social, [k]: e.target.value })} placeholder="https://" className="h-11" />
                </Field>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <SectionTitle>{t.weeklyHours}</SectionTitle>
            <p className="mb-3 text-xs text-muted-foreground">{t.hoursHint}</p>
            <ul className="divide-y divide-border">
              {DAY_ORDER.map((d) => {
                const shifts = form.hours[String(d)] ?? [];
                const open = shifts.length > 0;
                return (
                  <li key={d} className="grid gap-2 py-3 sm:grid-cols-[140px_1fr]">
                    <Switch checked={open} onChange={(v) => setDay(d, v ? [{ start: '09:00', end: '18:00' }] : [])} label={t.weekdayLong[d]} description={open ? t.openDay : t.closedDay} />
                    {open && (
                      <div className="space-y-2">
                        {shifts.map((s, i) => (
                          <div key={i} className="flex flex-wrap items-center gap-2">
                            <Input type="time" step={900} value={s.start} aria-label={t.shiftStart} onChange={(e) => setDay(d, shifts.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} className="h-11 w-32" />
                            <span className="text-muted-foreground">–</span>
                            <Input type="time" step={900} value={s.end} aria-label={t.shiftEnd} onChange={(e) => setDay(d, shifts.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} className="h-11 w-32" />
                            <Button variant="ghost" size="icon-lg" className="h-11 w-11 rounded-full" aria-label={t.removeShift} onClick={() => setDay(d, shifts.filter((_, j) => j !== i))}><Trash2 /></Button>
                          </div>
                        ))}
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="h-10 rounded-full" onClick={() => setDay(d, [...shifts, { start: shifts[shifts.length - 1]?.end ?? '14:00', end: '18:00' }])}><Plus /> {t.addShift}</Button>
                          <Button variant="ghost" size="sm" className="h-10 rounded-full" onClick={() => setForm((f) => ({ ...f, hours: Object.fromEntries(Object.entries(f.hours).map(([k, v]) => [k, v.length ? shifts.map((x) => ({ ...x })) : v])) }))}>{t.copyHoursToAll}</Button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            {invalidShift && <p className="mt-2 text-sm text-amber-800">{t.hoursInvalid}</p>}
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <SectionTitle>{t.closures}</SectionTitle>
            <p className="mb-3 text-xs text-muted-foreground">{t.closuresHint}</p>
            <ul className="space-y-2">
              {form.closures.map((c, i) => (
                <li key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <Input type="date" value={c.from} aria-label={t.closureFrom} onChange={(e) => set('closures', form.closures.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)))} className="h-11" />
                  <Input type="date" value={c.to ?? ''} aria-label={t.closureTo} onChange={(e) => set('closures', form.closures.map((x, j) => (j === i ? { ...x, to: e.target.value || undefined } : x)))} className="h-11" />
                  <Input value={c.label ?? ''} placeholder={t.closureLabel} aria-label={t.closureLabel} onChange={(e) => set('closures', form.closures.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className="h-11" />
                  <Button variant="ghost" size="icon-lg" className="h-11 w-11 rounded-full" aria-label={t.remove} onClick={() => set('closures', form.closures.filter((_, j) => j !== i))}><Trash2 /></Button>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="mt-3 h-10 rounded-full" onClick={() => set('closures', [...form.closures, { from: '' }])}><Plus /> {t.addClosure}</Button>
            {form.blocked.length > 0 && (
              <div className="mt-5">
                <SectionTitle>{t.blockedTimesTitle}</SectionTitle>
                <p className="mb-2 text-xs text-muted-foreground">{t.blockedTimesHint}</p>
                <ul className="space-y-1.5 text-sm">
                  {form.blocked.map((b, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-1">
                      <span>
                        {formatDateTime(new Date(b.start), lang, tz)} – {formatDateTime(new Date(b.end), lang, tz)}
                        {b.label ? ` · ${b.label}` : ''}
                      </span>
                      <Button variant="ghost" size="icon-lg" className="h-10 w-10 rounded-full" aria-label={t.remove} onClick={() => set('blocked', form.blocked.filter((_, j) => j !== i))}><Trash2 /></Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {form.closures.length > 0 && <p className="mt-2 text-xs text-muted-foreground">{form.closures.filter((c) => c.from).map((c) => `${formatDateKey(c.from, lang)}${c.to && c.to !== c.from ? ` – ${formatDateKey(c.to, lang)}` : ''}`).join(' · ')}</p>}
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <SectionTitle>{t.contactMethodsTitle}</SectionTitle>
            <p className="mb-2 text-xs text-muted-foreground">{t.contactMethodsHint}</p>
            <div className="grid gap-1 sm:grid-cols-2">
              {METHODS.map((m) => {
                const blocked = methodBlocked(m);
                return <Switch key={m} checked={form.methods.includes(m) && !blocked} disabled={Boolean(blocked)} onChange={(v) => set('methods', v ? [...form.methods, m] : form.methods.filter((x) => x !== m))} label={methodLabel(m)} description={blocked || undefined} />;
              })}
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
