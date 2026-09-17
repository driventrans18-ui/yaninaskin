'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Globe, RefreshCw, ShieldCheck, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getDomainInfo, saveDomainInfo } from '../../actions/content';
import { checkDomain, type DomainCheck } from '../../actions/domain';
import AdminShell from '../_components/AdminShell';
import { useAdminT } from '../_components/AdminLang';
import { useToast } from '../_components/ui/Toast';
import { CardSkeleton, Chip, CopyButton, Field, SectionTitle } from '../_components/ui/Bits';
import { ConfirmDialog } from '../_components/ui/Dialog';
import { relativeSubmitted } from '../bookings/bookingFormat';

export default function DomainPage() {
  const { t, lang, fmt } = useAdminT();
  const { toast } = useToast();
  const [domainName, setDomainName] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [saved, setSaved] = useState({ name: '', date: '' });
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [check, setCheck] = useState<DomainCheck | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const runCheck = useCallback(async (name: string) => {
    if (!name) return;
    setChecking(true);
    setCheckError(null);
    const r = await checkDomain(name);
    setChecking(false);
    if (r.success && r.data) setCheck(r.data);
    else setCheckError(r.error || 'failed');
  }, []);

  useEffect(() => {
    (async () => {
      const res = await getDomainInfo();
      const name = res.data.domain_name || (typeof window !== 'undefined' && !/localhost|127\.0\.0\.1/.test(window.location.hostname) ? window.location.hostname.replace(/^www\./, '') : '');
      const dateStr = (res.data.domain_renewal_date || '').slice(0, 10);
      setDomainName(name);
      setRenewalDate(dateStr);
      setSaved({ name, date: dateStr });
      setLoading(false);
      void runCheck(name);
    })();
  }, [runCheck]);

  const locale = lang === 'uk' ? 'uk-UA' : 'en-US';
  const daysLeft = (() => {
    if (!renewalDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((new Date(`${renewalDate}T00:00`).getTime() - today.getTime()) / 86400000);
  })();
  const formattedDate = renewalDate ? new Date(`${renewalDate}T00:00`).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  let countdown = '';
  let tone: 'muted' | 'warn' | 'success' | 'danger' = 'success';
  if (daysLeft === null) tone = 'muted';
  else if (daysLeft < 0) { tone = 'danger'; countdown = t.domainDaysAgo.replace('{n}', String(Math.abs(daysLeft))); }
  else if (daysLeft === 0) { tone = 'warn'; countdown = t.domainToday; }
  else { tone = daysLeft <= 60 ? 'warn' : 'success'; countdown = t.domainInDays.replace('{n}', String(daysLeft)); }

  const addYear = () => {
    const base = renewalDate ? new Date(`${renewalDate}T00:00`) : new Date();
    base.setFullYear(base.getFullYear() + 1);
    setRenewalDate(base.toLocaleDateString('en-CA'));
  };
  const cancelEdit = () => {
    setDomainName(saved.name);
    setRenewalDate(saved.date);
    setEditing(false);
  };
  const confirmSave = async () => {
    setSaving(true);
    const res = await saveDomainInfo({ domain_name: domainName.trim(), domain_renewal_date: renewalDate || null });
    setSaving(false);
    setConfirming(false);
    if (!res.success) return toast({ title: t.toastError, description: res.error, tone: 'error' });
    setSaved({ name: domainName.trim(), date: renewalDate });
    setEditing(false);
    toast({ title: t.domainSaved.replace('✓ ', '') });
    void runCheck(domainName.trim());
  };

  const live = check?.https.ok || (check?.https.status != null && check.https.status >= 300 && check.https.status < 400);
  const wwwOk = check ? check.www.ok || (check.www.status != null && check.www.status >= 300 && check.www.status < 400) : null;
  const dnsStatusChip = (s: 'ok' | 'mismatch' | 'missing' | 'unknown') =>
    s === 'ok' ? <Chip tone="success" icon={<CheckCircle2 />}>{t.dnsOk}</Chip> : s === 'mismatch' ? <Chip tone="warn" icon={<AlertTriangle />}>{t.dnsMismatch}</Chip> : s === 'missing' ? <Chip tone="warn">{t.dnsMissing}</Chip> : <Chip tone="muted">{t.dnsUnknown}</Chip>;

  return (
    <AdminShell active="domain" title={t.navDomain} subtitle={t.domainIntro} maxWidth="max-w-3xl">
      {loading ? (
        <CardSkeleton count={3} />
      ) : (
        <div className="space-y-6">
          {/* Status */}
          <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <SectionTitle action={<Button variant="outline" size="sm" className="h-10 rounded-full" onClick={() => void runCheck(domainName)} disabled={checking || !domainName}><RefreshCw className={checking ? 'animate-spin' : ''} /> {t.domainCheckAgain}</Button>}>
              {t.domainStatus}
            </SectionTitle>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`flex size-11 items-center justify-center rounded-full ${live ? 'bg-emerald-600/10 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                <Globe className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-all font-serif text-lg leading-tight md:text-xl">{domainName || '—'}</p>
                <p className="text-sm text-muted-foreground">
                  {checking ? t.domainChecking : checkError ? `${t.domainCheckFailed}: ${checkError}` : check ? (live ? t.domainLive : `${t.domainNotReachable}${check.https.error ? ` (${check.https.error})` : check.https.status ? ` (HTTP ${check.https.status})` : ''}`) : t.domainNeverChecked}
                </p>
              </div>
              {domainName && (
                <Button asChild variant="outline" size="sm" className="h-10 basis-full rounded-full sm:basis-auto">
                  <a href={`https://${domainName}`} target="_blank" rel="noopener noreferrer"><ExternalLink /> {t.viewWebsite}</a>
                </Button>
              )}
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
                <ShieldCheck className={`size-4 ${live ? 'text-emerald-700' : 'text-muted-foreground'}`} aria-hidden />
                <dt className="text-muted-foreground">{t.sslLabel}:</dt>
                <dd className="font-medium">{live ? t.sslOk : t.sslUnknown}</dd>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
                {wwwOk ? <CheckCircle2 className="size-4 text-emerald-700" aria-hidden /> : <AlertTriangle className="size-4 text-amber-700" aria-hidden />}
                <dd className="font-medium">{wwwOk == null ? '—' : wwwOk ? t.domainWwwRedirect : t.domainWwwProblem}</dd>
              </div>
            </dl>
            {check && <p className="mt-2 text-xs text-muted-foreground">{fmt(t.domainLastChecked, { when: relativeSubmitted(check.checkedAt, lang) })}</p>}
          </section>

          {/* DNS */}
          <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <SectionTitle>{t.domainDns}</SectionTitle>
            <p className="mb-3 text-xs text-muted-foreground">{t.domainDnsHint}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="py-1 pr-3 font-medium">{t.dnsType}</th>
                    <th className="py-1 pr-3 font-medium">{t.dnsHost}</th>
                    <th className="py-1 pr-3 font-medium">{t.dnsExpected}</th>
                    <th className="py-1 pr-3 font-medium">{t.dnsFound}</th>
                  </tr>
                </thead>
                <tbody>
                  {(check?.dns ?? [{ type: 'A' as const, host: '@', expected: '216.198.79.1', found: [], status: 'unknown' as const }, { type: 'CNAME' as const, host: 'www', expected: 'cname.vercel-dns.com', found: [], status: 'unknown' as const }]).map((row) => (
                    <tr key={row.type + row.host} className="border-t border-border align-top">
                      <td className="py-2 pr-3 font-mono text-xs">{row.type}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{row.host}</td>
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center gap-1 font-mono text-xs">
                          {row.expected} <CopyButton text={row.expected} label={row.expected} />
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {row.found.length > 0 && <span className="font-mono text-xs">{row.found.join(', ')}</span>}
                          {check && dnsStatusChip(row.status)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Renewal reminder — unchanged behaviour: it is only a reminder; renewal happens at Wix. */}
          <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <SectionTitle action={!editing ? <Button variant="outline" size="sm" className="h-10 rounded-full" onClick={() => setEditing(true)}>{t.domainEdit}</Button> : undefined}>
              {t.domainRenewalReminder}
            </SectionTitle>
            <div className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 ${tone === 'danger' ? 'border-destructive/30 bg-destructive/10' : tone === 'warn' ? 'border-amber-500/40 bg-amber-500/10' : 'border-border bg-muted/50'}`}>
              <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              {daysLeft === null ? (
                <p className="text-sm">{t.domainNoDate}</p>
              ) : (
                <div className="text-sm">
                  <p>
                    {t.domainRenewsOn} <span className="font-medium">{formattedDate}</span>
                  </p>
                  <p className={`font-medium ${tone === 'danger' ? 'text-destructive' : tone === 'warn' ? 'text-amber-800' : ''}`}>{daysLeft < 0 ? `${t.domainOverdue} · ${countdown}` : countdown}</p>
                  {daysLeft >= 0 && daysLeft <= 60 && <p className="text-xs text-muted-foreground">{t.domainSoonNote}</p>}
                </div>
              )}
            </div>
            <p className="mb-3 text-sm text-muted-foreground">{t.domainProviderNote} {t.domainWhoRenews}</p>
            <Button asChild variant="outline" size="sm" className="mb-4 h-10 rounded-full">
              <a href="https://manage.wix.com/account/domains" target="_blank" rel="noopener noreferrer">{t.domainWixCta}</a>
            </Button>
            {editing && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t.domainNameLabel}>
                  <Input value={domainName} onChange={(e) => setDomainName(e.target.value)} placeholder="my-skinbeauty.com" className="h-11" />
                </Field>
                <Field label={t.domainNewDateLabel}>
                  <div className="flex gap-2">
                    <Input type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} className="h-11" />
                    <Button type="button" variant="outline" className="h-11 shrink-0 rounded-full" onClick={addYear}>{t.domainAddYear}</Button>
                  </div>
                </Field>
                <div className="flex gap-2 sm:col-span-2">
                  <Button className="h-11 rounded-full" onClick={() => setConfirming(true)} disabled={saving}>{t.save}</Button>
                  <Button variant="outline" className="h-11 rounded-full" onClick={cancelEdit} disabled={saving}>{t.cancel}</Button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
      <ConfirmDialog open={confirming} onClose={() => setConfirming(false)} onConfirm={() => void confirmSave()} title={t.domainConfirmTitle} body={t.domainConfirmBody} confirmLabel={t.domainConfirmCta} busy={saving} />
    </AdminShell>
  );
}
