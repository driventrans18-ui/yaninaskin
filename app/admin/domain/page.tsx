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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const res = await getDomainInfo();
      setDomainName(res.data.domain_name || '');
      setRenewalDate((res.data.domain_renewal_date || '').slice(0, 10));
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

  const handleSave = async () => {
    setSaving(true);
    const res = await saveDomainInfo({
      domain_name: domainName.trim(),
      domain_renewal_date: renewalDate || null,
    });
    if (res.success) {
      setMessage(t.domainSaved);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('✗ ' + (res.error || 'Error'));
    }
    setSaving(false);
  };

  return (
    <AdminShell active="domain" maxWidth="max-w-2xl">
      <h2 className="text-2xl mb-1">{t.domainTitle}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t.domainIntro}</p>

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

          {/* Edit form */}
          <Card className="space-y-4 p-5">
            <Field label={t.domainNameLabel}>
              <Input
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="my-skinbeauty.com"
              />
            </Field>
            <Field label={t.renewalDateLabel}>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="max-w-[200px]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addYear}
                >
                  {t.addOneYear}
                </Button>
              </div>
            </Field>
            <Button onClick={handleSave} disabled={saving} variant="accent">
              {saving ? `${t.save}…` : t.save}
            </Button>
          </Card>
        </>
      )}
    </AdminShell>
  );
}
