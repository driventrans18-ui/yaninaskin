'use client';

import { useEffect, useState } from 'react';
import { getDomainInfo, saveDomainInfo } from '../../actions/content';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminShell from '../_components/AdminShell';
import StatusBanner from '../_components/StatusBanner';
import Field from '../_components/Field';
import { useAdminT } from '../_components/AdminLang';

export default function DomainPage() {
  const { t, lang } = useAdminT();
  const [domainName, setDomainName] = useState('');
  const [renewalDate, setRenewalDate] = useState(''); // YYYY-MM-DD
  // Last-saved values, so Cancel can revert any unsaved edits.
  const [loadedName, setLoadedName] = useState('');
  const [loadedDate, setLoadedDate] = useState('');
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const res = await getDomainInfo();
      const name = res.data.domain_name || '';
      const dateStr = (res.data.domain_renewal_date || '').slice(0, 10);
      setDomainName(name);
      setRenewalDate(dateStr);
      setLoadedName(name);
      setLoadedDate(dateStr);
      setLoading(false);
    })();
  }, []);

  const locale = lang === 'uk' ? 'uk-UA' : 'en-US';

  // Whole days until renewal, comparing against local midnight today.
  const daysLeft = (() => {
    if (!renewalDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${renewalDate}T00:00`);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  })();

  const formattedDate = renewalDate
    ? new Date(`${renewalDate}T00:00`).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Color-coded reminder: neutral normally, amber within 60 days, red overdue.
  let tone = 'bg-accent/15 border-accent/30 text-foreground';
  let countdown = '';
  if (daysLeft === null) {
    tone = 'bg-muted border-border text-muted-foreground';
  } else if (daysLeft < 0) {
    tone = 'bg-destructive/10 border-destructive/30 text-destructive';
    countdown = t.domainDaysAgo.replace('{n}', String(Math.abs(daysLeft)));
  } else if (daysLeft === 0) {
    tone = 'bg-amber-500/10 border-amber-500/40 text-amber-700';
    countdown = t.domainToday;
  } else if (daysLeft <= 60) {
    tone = 'bg-amber-500/10 border-amber-500/40 text-amber-700';
    countdown = t.domainInDays.replace('{n}', String(daysLeft));
  } else {
    countdown = t.domainInDays.replace('{n}', String(daysLeft));
  }

  // Bump the date field a year ahead — handy right after renewing.
  const addYear = () => {
    const base = renewalDate ? new Date(`${renewalDate}T00:00`) : new Date();
    base.setFullYear(base.getFullYear() + 1);
    setRenewalDate(base.toLocaleDateString('en-CA')); // YYYY-MM-DD, local
  };

  // Cancel editing — revert any unsaved changes back to the last saved values.
  const cancelEdit = () => {
    setDomainName(loadedName);
    setRenewalDate(loadedDate);
    setEditing(false);
    setConfirming(false);
  };

  // Runs only after the confirmation step. Changing the date here is just a
  // reminder — it never renews the domain (that happens on Wix).
  const confirmSave = async () => {
    setSaving(true);
    const res = await saveDomainInfo({
      domain_name: domainName.trim(),
      domain_renewal_date: renewalDate || null,
    });
    if (res.success) {
      setLoadedName(domainName.trim());
      setLoadedDate(renewalDate);
      setMessage(t.domainSaved);
      setTimeout(() => setMessage(''), 3000);
      setEditing(false);
    } else {
      setMessage('✗ ' + (res.error || 'Error'));
    }
    setConfirming(false);
    setSaving(false);
  };

  return (
    <AdminShell active="domain" maxWidth="max-w-2xl">
      <h2 className="text-2xl mb-1">{t.domainTitle}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{t.domainIntro}</p>

      {/* Wix provider notice — renewal happens on Wix, not here. */}
      <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-4">
        <p className="text-sm text-foreground">{t.domainProviderNote}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t.domainWhoRenews}</p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <a
            href="https://manage.wix.com/account/domains"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.domainWixCta}
          </a>
        </Button>
      </div>

      <StatusBanner message={message} />

      {loading ? (
        <p className="text-sm text-muted-foreground">{t.loading}</p>
      ) : (
        <>
          {/* Color-coded reminder */}
          <div className={`mb-6 rounded-xl border px-5 py-4 ${tone}`}>
            {daysLeft === null ? (
              <p className="text-sm font-medium">{t.domainNoDate}</p>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-base font-medium">{domainName || '—'}</p>
                <p className="text-sm">
                  {t.domainRenewsOn} {formattedDate}
                </p>
                <p className="text-sm font-medium">
                  {daysLeft < 0 ? `${t.domainOverdue} · ${countdown}` : countdown}
                </p>
                {daysLeft >= 0 && daysLeft <= 60 && (
                  <p className="text-xs opacity-80">{t.domainSoonNote}</p>
                )}
              </div>
            )}
          </div>

          {/* Edit form — locked until "Edit" is clicked, with a confirm step. */}
          <Card className="space-y-4 p-5">
            <Field label={t.domainNameLabel}>
              <Input
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="my-skinbeauty.com"
                disabled={!editing}
              />
            </Field>
            <Field label={t.renewalDateLabel}>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="max-w-[200px]"
                  disabled={!editing}
                />
                {editing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addYear}
                  >
                    {t.addOneYear}
                  </Button>
                )}
              </div>
            </Field>

            {!editing ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(true)}
              >
                {t.edit}
              </Button>
            ) : confirming ? (
              // Confirmation step — restate that this does NOT renew the domain.
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                <p className="text-sm font-medium text-foreground">
                  {t.domainConfirmTitle}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.domainConfirmBody}
                </p>
                <p className="mt-2 text-sm">
                  {t.domainNewDateLabel}:{' '}
                  <span className="font-medium">{formattedDate || '—'}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="accent"
                    disabled={saving}
                    onClick={confirmSave}
                  >
                    {saving ? `${t.domainConfirmCta}…` : t.domainConfirmCta}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={saving}
                    onClick={() => setConfirming(false)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="accent"
                  onClick={() => setConfirming(true)}
                >
                  {t.save}
                </Button>
                <Button type="button" variant="ghost" onClick={cancelEdit}>
                  {t.cancel}
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </AdminShell>
  );
}
