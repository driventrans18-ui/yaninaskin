'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Download, KeyRound, LogOut, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import type { BookingSettings, NotificationPrefs, ReplyTemplates, TemplateKey } from '@/lib/booking/types';
import { DEFAULT_SETTINGS } from '@/lib/booking/settings';
import { DEFAULT_TEMPLATES, TEMPLATE_KEYS, renderTemplate } from '@/lib/booking/templates';
import { toCsv, downloadText } from '@/lib/csv';
import { formatDateKey } from '@/lib/tz';
import { getBookingSettings, saveBookingSettings } from '../../actions/settings';
import { getBookings } from '../../actions/bookings';
import { getReviewsAdmin } from '../../actions/reviews';
import { getMessagesAdmin } from '../../actions/contact';
import { getEmailProviderStatus } from '../../actions/admin';
import AdminShell from '../_components/AdminShell';
import { useAdminT } from '../_components/AdminLang';
import { useAdminAuth } from '../_components/AdminAuth';
import { useToast } from '../_components/ui/Toast';
import { CardSkeleton, Chip, ErrorState, Field, SectionTitle, Segmented, Switch } from '../_components/ui/Bits';
import { Dialog, ConfirmDialog } from '../_components/ui/Dialog';
import UnsavedGuard from '../_components/ui/UnsavedGuard';

type Lang = 'en' | 'uk';
const VARS = ['{name}', '{service}', '{date}', '{time}', '{price}'] as const;
const TIMEZONES = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/Kyiv', 'Europe/Warsaw', 'Europe/London'];
const CURRENCIES = ['USD', 'EUR', 'UAH', 'CAD'];

interface Form {
  minNotice: string;
  maxDays: string;
  slot: string;
  buffer: string;
  autoArchive: string;
  trashDays: string;
  requireReviewApproval: boolean;
  prefs: NotificationPrefs;
  templates: ReplyTemplates;
  adminLang: Lang;
  timezone: string;
  currency: string;
}

const formFrom = (s: BookingSettings): Form => ({
  minNotice: String(s.minNoticeHours),
  maxDays: String(s.maxDaysAhead),
  slot: String(s.slotMinutes),
  buffer: String(s.bufferMinutes),
  autoArchive: String(s.autoArchiveDays),
  trashDays: String(s.trashRetentionDays),
  requireReviewApproval: s.requireReviewApproval,
  prefs: { ...s.notificationPrefs },
  templates: JSON.parse(JSON.stringify(s.replyTemplates || {})),
  adminLang: s.adminLang,
  timezone: s.timezone,
  currency: s.currency,
});

const intOrNull = (v: string, min: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min ? n : null;
};

export default function SettingsWorkspace() {
  const { t, lang, fmt, setLang } = useAdminT();
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const supabaseRef = useRef<SupabaseClient | null>(null);
  if (!supabaseRef.current) supabaseRef.current = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  const supabase = supabaseRef.current;

  const [form, setForm] = useState<Form>(formFrom(DEFAULT_SETTINGS));
  const [saved, setSaved] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [tplLang, setTplLang] = useState<Lang>(lang === 'uk' ? 'uk' : 'en');
  const taRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  // Account
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null); // verified TOTP factor
  const [mfaSupported, setMfaSupported] = useState(true);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [enrollCode, setEnrollCode] = useState('');
  const [enrollError, setEnrollError] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const loadFactors = useCallback(async () => {
    try {
      const { data, error: e } = await supabase.auth.mfa.listFactors();
      if (e) throw e;
      setFactorId(data?.totp.find((f) => f.status === 'verified')?.id ?? null);
    } catch {
      setMfaSupported(false);
    }
  }, [supabase]);

  const load = useCallback(async () => {
    const [r, mail] = await Promise.all([getBookingSettings(), getEmailProviderStatus()]);
    setError(r.success ? null : r.error || 'load failed');
    const f = formFrom(r.data);
    setForm(f);
    setSaved(JSON.stringify(f));
    setEmailConfigured(mail.configured);
    setLoading(false);
    void loadFactors();
  }, [loadFactors]);
  useEffect(() => {
    void load();
  }, [load]);

  const dirty = JSON.stringify(form) !== saved;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const numbers = useMemo(
    () => ({
      minNotice: intOrNull(form.minNotice, 0),
      maxDays: intOrNull(form.maxDays, 1),
      slot: intOrNull(form.slot, 5),
      buffer: intOrNull(form.buffer, 0),
      autoArchive: intOrNull(form.autoArchive, 0),
      trashDays: intOrNull(form.trashDays, 1),
    }),
    [form],
  );
  const invalid = Object.values(numbers).some((v) => v === null);

  const save = async () => {
    if (invalid) return toast({ title: t.toastError, description: fmt(t.invalidNumber, { min: 0 }), tone: 'error' });
    setSaving(true);
    const templates: ReplyTemplates = {};
    for (const l of ['en', 'uk'] as Lang[]) {
      const entries = Object.entries(form.templates[l] || {}).filter(([, v]) => typeof v === 'string' && v.trim());
      if (entries.length) templates[l] = Object.fromEntries(entries);
    }
    const r = await saveBookingSettings({
      booking_min_notice_hours: numbers.minNotice!,
      booking_max_days_ahead: numbers.maxDays!,
      booking_slot_minutes: numbers.slot!,
      booking_buffer_minutes: numbers.buffer!,
      auto_archive_days: numbers.autoArchive!,
      trash_retention_days: numbers.trashDays!,
      require_review_approval: form.requireReviewApproval,
      notification_prefs: { ...form.prefs, email: form.prefs.email?.trim() || undefined },
      reply_templates: templates,
      admin_lang: form.adminLang,
      timezone: form.timezone,
      currency: form.currency,
    });
    setSaving(false);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    setSaved(JSON.stringify(form));
    if (form.adminLang !== lang) setLang(form.adminLang);
    toast({ title: t.settingsSavedToast });
  };

  // ---- account actions (immediate, not part of the form)
  const changePassword = async () => {
    if (pw1.length < 8) return toast({ title: t.passwordTooShort, tone: 'error' });
    if (pw1 !== pw2) return toast({ title: t.passwordMismatch, tone: 'error' });
    setPwBusy(true);
    const { error: e } = await supabase.auth.updateUser({ password: pw1 });
    setPwBusy(false);
    if (e) return toast({ title: t.toastError, description: e.message, tone: 'error' });
    setPw1('');
    setPw2('');
    toast({ title: t.passwordUpdated });
  };

  const startEnroll = async () => {
    setMfaBusy(true);
    setEnrollError('');
    try {
      // Clear any abandoned, never-verified factors first.
      const list = await supabase.auth.mfa.listFactors();
      for (const f of list.data?.totp || []) if (f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id });
      const { data, error: e } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Skin Beauty admin' });
      if (e || !data) throw e || new Error('enroll failed');
      setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
      setEnrollCode('');
    } catch (err) {
      toast({ title: t.toastError, description: err instanceof Error ? err.message : String(err), tone: 'error' });
    } finally {
      setMfaBusy(false);
    }
  };

  const verifyEnroll = async () => {
    if (!enroll) return;
    setMfaBusy(true);
    setEnrollError('');
    try {
      const ch = await supabase.auth.mfa.challenge({ factorId: enroll.id });
      if (ch.error || !ch.data) throw ch.error || new Error('challenge failed');
      const v = await supabase.auth.mfa.verify({ factorId: enroll.id, challengeId: ch.data.id, code: enrollCode.trim() });
      if (v.error) {
        setEnrollError(t.twoFactorInvalid);
        return;
      }
      setEnroll(null);
      setFactorId(enroll.id);
      toast({ title: t.twoFactor, description: t.twoFactorOnHint });
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : String(err));
    } finally {
      setMfaBusy(false);
    }
  };

  const cancelEnroll = async () => {
    if (enroll) await supabase.auth.mfa.unenroll({ factorId: enroll.id }).catch(() => undefined);
    setEnroll(null);
  };

  const disableMfa = async () => {
    if (!factorId) return;
    setMfaBusy(true);
    const { error: e } = await supabase.auth.mfa.unenroll({ factorId });
    setMfaBusy(false);
    setConfirmDisable(false);
    if (e) return toast({ title: t.toastError, description: e.message, tone: 'error' });
    setFactorId(null);
    toast({ title: t.twoFactor, description: t.twoFactorOffHint });
  };

  const signOutOthers = async () => {
    const { error: e } = await supabase.auth.signOut({ scope: 'others' });
    if (e) return toast({ title: t.toastError, description: e.message, tone: 'error' });
    toast({ title: t.signedOutOthers });
  };

  // ---- templates
  const tplValue = (l: Lang, key: TemplateKey) => form.templates[l]?.[key] ?? '';
  const setTpl = (l: Lang, key: TemplateKey, v: string | undefined) =>
    setForm((f) => {
      const next: ReplyTemplates = { ...f.templates, [l]: { ...(f.templates[l] || {}) } };
      if (v === undefined) delete next[l]![key];
      else next[l]![key] = v;
      return { ...f, templates: next };
    });
  const insertVar = (l: Lang, key: TemplateKey, v: string) => {
    const ta = taRefs.current[`${l}:${key}`];
    const cur = tplValue(l, key) || DEFAULT_TEMPLATES[l][key];
    const start = ta?.selectionStart ?? cur.length;
    const end = ta?.selectionEnd ?? start;
    const next = cur.slice(0, start) + v + cur.slice(end);
    setTpl(l, key, next);
    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(start + v.length, start + v.length);
    });
  };
  const sample = useMemo(
    () => ({ name: lang === 'uk' ? 'Анна' : 'Anna', service: 'Ultrasound Cleaning', date: formatDateKey('2026-10-03', tplLang), time: tplLang === 'uk' ? '11:00' : '11:00 AM', price: '$100' }),
    [lang, tplLang],
  );
  const tplLabel = (k: TemplateKey) => ({ confirm: t.tplConfirm, suggest: t.tplSuggest, decline: t.tplDecline, reminder: t.tplReminder, review: t.tplReview, quick: t.tplQuick })[k];

  // ---- exports
  const exportCsv = async (kind: 'bookings' | 'reviews' | 'messages') => {
    setExporting(kind);
    try {
      if (kind === 'bookings') {
        const r = await getBookings();
        const cols = ['id', 'status', 'name', 'phone', 'email', 'service', 'price', 'preferred_date', 'preferred_time', 'method', 'details', 'lang', 'submission_count', 'created_at'];
        downloadText(`bookings-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(r.data as unknown as Record<string, unknown>[], cols.map((c) => ({ key: c, label: c }))));
      } else if (kind === 'reviews') {
        const r = await getReviewsAdmin();
        const cols = ['id', 'name', 'email', 'rating', 'comment', 'service', 'approved', 'hidden', 'reply_text', 'created_at'];
        downloadText(`reviews-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(r.data as unknown as Record<string, unknown>[], cols.map((c) => ({ key: c, label: c }))));
      } else {
        const r = await getMessagesAdmin();
        const cols = ['id', 'name', 'phone', 'email', 'message', 'status', 'created_at'];
        downloadText(`messages-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(r.data as unknown as Record<string, unknown>[], cols.map((c) => ({ key: c, label: c }))));
      }
    } finally {
      setExporting(null);
    }
  };

  const card = 'rounded-2xl border border-border bg-card p-4 md:p-5';
  const numField = (label: string, k: keyof typeof numbers, formKey: keyof Form, min: number, hint?: string) => (
    <Field label={label} hint={numbers[k] === null ? fmt(t.invalidNumber, { min }) : hint} required>
      <Input type="number" inputMode="numeric" min={min} step={k === 'slot' || k === 'buffer' ? 5 : 1} value={form[formKey] as string} onChange={(e) => set(formKey, e.target.value as Form[typeof formKey])} className={`h-11 ${numbers[k] === null ? 'border-destructive' : ''}`} aria-invalid={numbers[k] === null} />
    </Field>
  );

  return (
    <AdminShell
      active="settings"
      title={t.settingsTitle}
      subtitle={t.settingsIntro}
      maxWidth="max-w-4xl"
      actions={
        <div className="flex w-full items-center justify-end">
          <Button className="h-11 rounded-full" onClick={() => void save()} disabled={saving || !dirty || invalid}>
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
        <div className="space-y-6">
          {/* Account */}
          <section className={card}>
            <SectionTitle>{t.secAccount}</SectionTitle>
            <p className="mb-4 text-sm">
              <span className="text-muted-foreground">{t.signedInAs}</span> <span className="font-medium">{user?.email ?? '—'}</span>
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border p-3">
                <p className="mb-2 flex items-center gap-2 text-sm font-medium"><KeyRound className="size-4" aria-hidden /> {t.changePassword}</p>
                <div className="space-y-2">
                  <Input type="password" autoComplete="new-password" placeholder={t.newPassword} aria-label={t.newPassword} value={pw1} onChange={(e) => setPw1(e.target.value)} className="h-11" />
                  <Input type="password" autoComplete="new-password" placeholder={t.confirmPassword} aria-label={t.confirmPassword} value={pw2} onChange={(e) => setPw2(e.target.value)} className="h-11" />
                  <Button variant="outline" className="h-11 rounded-full" onClick={() => void changePassword()} disabled={pwBusy || !pw1}>{t.updatePassword}</Button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-border p-3">
                  <p className="mb-1 flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4" aria-hidden /> {t.twoFactor} {factorId ? <Chip tone="success">ON</Chip> : <Chip tone="muted">OFF</Chip>}</p>
                  <p className="mb-2 text-xs text-muted-foreground">{factorId ? t.twoFactorOnHint : t.twoFactorOffHint}</p>
                  {mfaSupported ? (
                    factorId ? (
                      <Button variant="outline" className="h-11 rounded-full" onClick={() => setConfirmDisable(true)} disabled={mfaBusy}>{t.twoFactorDisable}</Button>
                    ) : (
                      <Button variant="outline" className="h-11 rounded-full" onClick={() => void startEnroll()} disabled={mfaBusy}>{t.twoFactorEnable}</Button>
                    )
                  ) : (
                    <p className="text-xs text-muted-foreground">—</p>
                  )}
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="mb-1 flex items-center gap-2 text-sm font-medium"><LogOut className="size-4" aria-hidden /> {t.sessions}</p>
                  <p className="mb-2 text-xs text-muted-foreground">{t.signOutOthersHint}</p>
                  <Button variant="outline" className="h-11 rounded-full" onClick={() => void signOutOthers()}>{t.signOutOthers}</Button>
                </div>
              </div>
            </div>
          </section>

          {/* Booking rules */}
          <section className={card}>
            <SectionTitle>{t.secBookingRules}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {numField(t.minNotice, 'minNotice', 'minNotice', 0, t.minNoticeHint)}
              {numField(t.maxDaysAhead, 'maxDays', 'maxDays', 1)}
              {numField(t.slotMinutes, 'slot', 'slot', 5)}
              {numField(t.defaultBuffer, 'buffer', 'buffer', 0, t.defaultBufferHint)}
              {numField(t.autoArchiveDays, 'autoArchive', 'autoArchive', 0, t.autoArchiveHint)}
              {numField(t.trashRetention, 'trashDays', 'trashDays', 1)}
            </div>
            <div className="mt-3">
              <Switch checked={form.requireReviewApproval} onChange={(v) => set('requireReviewApproval', v)} label={t.reviewsNeedApproval} />
            </div>
          </section>

          {/* Notifications */}
          <section className={card}>
            <SectionTitle>{t.secNotifications}</SectionTitle>
            <p className={`mb-3 text-xs ${emailConfigured ? 'text-muted-foreground' : 'text-amber-800'}`}>{emailConfigured === false ? t.notifyNotConfigured : emailConfigured ? t.notifyConfigured : ''}</p>
            <div className="grid gap-1">
              <Switch checked={form.prefs.new_booking_email !== false} onChange={(v) => set('prefs', { ...form.prefs, new_booking_email: v })} label={t.notifyNewBooking} />
              <Switch checked={form.prefs.new_review_email !== false} onChange={(v) => set('prefs', { ...form.prefs, new_review_email: v })} label={t.notifyNewReview} />
              <Switch checked={form.prefs.new_message_email !== false} onChange={(v) => set('prefs', { ...form.prefs, new_message_email: v })} label={t.notifyNewMessage} />
            </div>
            <div className="mt-3 max-w-md">
              <Field label={t.notifyEmail} hint={t.notifyEmailHint}>
                <Input type="email" value={form.prefs.email ?? ''} onChange={(e) => set('prefs', { ...form.prefs, email: e.target.value })} className="h-11" placeholder="you@example.com" />
              </Field>
            </div>
          </section>

          {/* Templates */}
          <section className={card}>
            <SectionTitle action={<Segmented value={tplLang} onChange={setTplLang} ariaLabel={t.adminLanguage} options={[{ value: 'en', label: 'EN' }, { value: 'uk', label: 'UA' }]} />}>{t.secTemplates}</SectionTitle>
            <p className="mb-4 text-xs text-muted-foreground">{t.templatesHint}</p>
            <div className="space-y-5">
              {TEMPLATE_KEYS.map((key) => {
                const cur = tplValue(tplLang, key);
                const isDefault = !cur.trim();
                const shown = isDefault ? DEFAULT_TEMPLATES[tplLang][key] : cur;
                return (
                  <div key={key} className="rounded-xl border border-border p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{tplLabel(key)} {isDefault && <Chip tone="muted">default</Chip>}</p>
                      {!isDefault && (
                        <button type="button" className="min-h-[36px] text-xs text-muted-foreground underline-offset-4 hover:underline" onClick={() => setTpl(tplLang, key, undefined)}>
                          {t.resetTemplate}
                        </button>
                      )}
                    </div>
                    <Textarea
                      ref={(el) => {
                        taRefs.current[`${tplLang}:${key}`] = el;
                      }}
                      rows={3}
                      value={cur}
                      placeholder={DEFAULT_TEMPLATES[tplLang][key]}
                      onChange={(e) => setTpl(tplLang, key, e.target.value)}
                      aria-label={tplLabel(key)}
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {VARS.map((v) => (
                        <button key={v} type="button" onClick={() => insertVar(tplLang, key, v)} className="min-h-[36px] rounded-full border border-border px-3 font-mono text-xs text-muted-foreground hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {v}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">{t.tplPreviewTitle}: </span>
                      {renderTemplate(shown, sample)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Defaults */}
          <section className={card}>
            <SectionTitle>{t.secDefaults}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t.adminLangDefault}>
                <Select value={form.adminLang} onChange={(e) => set('adminLang', e.target.value as Lang)} className="h-11 w-full">
                  <option value="en">English</option>
                  <option value="uk">Українська</option>
                </Select>
              </Field>
              <Field label={t.timezoneLabel}>
                <Select value={form.timezone} onChange={(e) => set('timezone', e.target.value)} className="h-11 w-full">
                  {(TIMEZONES.includes(form.timezone) ? TIMEZONES : [form.timezone, ...TIMEZONES]).map((z) => (
                    <option key={z} value={z}>{z.replace('_', ' ')}</option>
                  ))}
                </Select>
              </Field>
              <Field label={t.currencyLabel}>
                <Select value={form.currency} onChange={(e) => set('currency', e.target.value)} className="h-11 w-full">
                  {(CURRENCIES.includes(form.currency) ? CURRENCIES : [form.currency, ...CURRENCIES]).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          {/* Data */}
          <section className={card}>
            <SectionTitle>{t.secData}</SectionTitle>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="h-11 rounded-full" onClick={() => void exportCsv('bookings')} disabled={Boolean(exporting)}><Download /> {t.exportBookings}</Button>
              <Button variant="outline" className="h-11 rounded-full" onClick={() => void exportCsv('reviews')} disabled={Boolean(exporting)}><Download /> {t.exportReviews}</Button>
              <Button variant="outline" className="h-11 rounded-full" onClick={() => void exportCsv('messages')} disabled={Boolean(exporting)}><Download /> {t.exportMessages}</Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
              <Trash2 className="size-4 text-muted-foreground" aria-hidden />
              <p className="min-w-0 flex-1 text-sm text-muted-foreground">{fmt(t.trashRetentionNote, { n: numbers.trashDays ?? form.trashDays })}</p>
              <Button asChild variant="outline" size="sm" className="h-10 rounded-full">
                <Link href="/admin/trash">{t.openTrash}</Link>
              </Button>
            </div>
          </section>
        </div>
      )}

      <Dialog
        open={Boolean(enroll)}
        onClose={() => void cancelEnroll()}
        title={t.twoFactorEnable}
        size="md"
        footer={
          <>
            <Button variant="outline" className="h-11" onClick={() => void cancelEnroll()} disabled={mfaBusy}>{t.cancel}</Button>
            <Button className="h-11" onClick={() => void verifyEnroll()} disabled={mfaBusy || enrollCode.trim().length < 6}>{t.twoFactorVerify}</Button>
          </>
        }
      >
        {enroll && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t.twoFactorScan}</p>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={enroll.qr} alt="QR" className="size-48 rounded-xl border border-border bg-white p-2" />
            </div>
            <p className="break-all text-center font-mono text-xs text-muted-foreground">
              {t.twoFactorSecret}: {enroll.secret}
            </p>
            <Field label={t.twoFactorCode}>
              <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={enrollCode} onChange={(e) => setEnrollCode(e.target.value.replace(/\D/g, ''))} className="h-12 text-center text-xl tracking-[0.4em]" />
            </Field>
            {enrollError && <p className="text-sm text-destructive" role="alert">{enrollError}</p>}
            <p className="text-xs text-amber-800">{t.twoFactorWarning}</p>
          </div>
        )}
      </Dialog>
      <ConfirmDialog open={confirmDisable} onClose={() => setConfirmDisable(false)} onConfirm={() => void disableMfa()} title={t.twoFactorDisable} body={t.twoFactorDisableConfirm} confirmLabel={t.twoFactorDisable} busy={mfaBusy} />
    </AdminShell>
  );
}
