'use client';

import { useEffect, useState } from 'react';
import { getAboutContent, updateAboutContent } from '../../actions/content';
import AdminShell from '../_components/AdminShell';
import StatusBanner from '../_components/StatusBanner';
import Field from '../_components/Field';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAdminT } from '../_components/AdminLang';

type Settings = {
  email: string;
  phone: string;
  address: string;
  instagram_url: string;
  tiktok_url: string;
  booking_start_hour: number;
  booking_end_hour: number;
  booking_open_days: number[];
  require_review_approval: boolean;
};

const DEFAULTS: Settings = {
  email: '',
  phone: '',
  address: '',
  instagram_url: '',
  tiktok_url: '',
  booking_start_hour: 9,
  booking_end_hour: 18,
  booking_open_days: [1, 2, 3, 4, 5],
  require_review_approval: false,
};

// Weekday chip order, Monday-first. Values are JS getDay() numbers (0 = Sunday);
// the visible label comes from the localized `weekdayShort` array.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

// "9:00 AM" style label for an hour-of-day number.
function hourLabel(h: number): string {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const HOUR_OPTIONS = Array.from({ length: 17 }, (_, i) => 6 + i); // 6 AM – 10 PM

export default function AdminSettingsPage() {
  const { t } = useAdminT();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const result = await getAboutContent();
      const d = result.data;
      if (d) {
        setSettings({
          email: d.email || '',
          phone: d.phone || '',
          address: d.address || '',
          instagram_url: d.instagram_url || '',
          tiktok_url: d.tiktok_url || '',
          booking_start_hour:
            typeof d.booking_start_hour === 'number' ? d.booking_start_hour : DEFAULTS.booking_start_hour,
          booking_end_hour:
            typeof d.booking_end_hour === 'number' ? d.booking_end_hour : DEFAULTS.booking_end_hour,
          booking_open_days: Array.isArray(d.booking_open_days)
            ? d.booking_open_days
            : DEFAULTS.booking_open_days,
          require_review_approval: Boolean(d.require_review_approval),
        });
      }
      setLoading(false);
    })();
  }, []);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const toggleDay = (n: number) =>
    setSettings((prev) => ({
      ...prev,
      booking_open_days: prev.booking_open_days.includes(n)
        ? prev.booking_open_days.filter((d) => d !== n)
        : [...prev.booking_open_days, n].sort(),
    }));

  const handleSave = async () => {
    if (settings.booking_end_hour <= settings.booking_start_hour) {
      setMessage(t.closingAfterOpening);
      return;
    }
    setSaving(true);
    setMessage('');
    const result = await updateAboutContent({
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      instagram_url: settings.instagram_url,
      tiktok_url: settings.tiktok_url,
      booking_start_hour: settings.booking_start_hour,
      booking_end_hour: settings.booking_end_hour,
      booking_open_days: settings.booking_open_days,
      require_review_approval: settings.require_review_approval,
    });
    if (result.success) {
      setMessage(t.settingsSaved);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('✗ Error: ' + (result.error || 'Failed to save'));
    }
    setSaving(false);
  };

  return (
    <AdminShell active="settings">
      <StatusBanner message={message} />
      <h2 className="text-xl font-medium mb-1">{t.settingsTitle}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settingsIntro}</p>

      {loading ? (
        <p className="text-muted-foreground text-sm py-12 text-center">{t.loading}</p>
      ) : (
        <div className="space-y-6">
          {/* ── Notifications ── */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold">{t.notifications}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t.notificationsHint}</p>
            </div>
            <Field label={t.notificationEmail} hint={t.notificationEmailHint}>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="e.g. hello@my-skinbeauty.com"
              />
            </Field>
          </Card>

          {/* ── Booking availability ── */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold">{t.bookingAvailability}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t.bookingAvailabilityHint}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Field label={t.opensAt}>
                <Select
                  value={settings.booking_start_hour}
                  onChange={(e) => set('booking_start_hour', Number(e.target.value))}
                  className="text-sm"
                >
                  {HOUR_OPTIONS.map((h) => (
                    <option key={h} value={h}>{hourLabel(h)}</option>
                  ))}
                </Select>
              </Field>
              <Field label={t.closesAt}>
                <Select
                  value={settings.booking_end_hour}
                  onChange={(e) => set('booking_end_hour', Number(e.target.value))}
                  className="text-sm"
                >
                  {HOUR_OPTIONS.map((h) => (
                    <option key={h} value={h}>{hourLabel(h)}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label={t.openDays} hint={t.openDaysHint}>
              <div className="flex flex-wrap gap-2">
                {DAY_ORDER.map((n) => {
                  const on = settings.booking_open_days.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleDay(n)}
                      aria-pressed={on}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        on
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t.weekdayShort[n]}
                    </button>
                  );
                })}
              </div>
            </Field>
          </Card>

          {/* ── Reviews ── */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold">{t.reviewsSection}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t.reviewsSectionHint}</p>
            </div>
            <button
              type="button"
              onClick={() => set('require_review_approval', !settings.require_review_approval)}
              aria-pressed={settings.require_review_approval}
              className="flex items-center gap-3 text-left"
            >
              <span
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  settings.require_review_approval ? 'bg-accent' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    settings.require_review_approval ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </span>
              <span className="text-sm">
                {t.requireApprovalLabel}
                <span className="block text-xs text-muted-foreground">
                  {settings.require_review_approval
                    ? t.requireApprovalOn
                    : t.requireApprovalOff}
                </span>
              </span>
            </button>
          </Card>

          {/* ── Contact & social ── */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold">{t.contactSocial}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t.contactSocialHint}</p>
            </div>
            <Field label={t.phone}>
              <Input
                value={settings.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="e.g. (585) 555-0123"
              />
            </Field>
            <Field label={t.address}>
              <Input
                value={settings.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="e.g. Rochester, NY"
              />
            </Field>
            <Field label={t.instagram}>
              <Input
                value={settings.instagram_url}
                onChange={(e) => set('instagram_url', e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </Field>
            <Field label={t.tiktok}>
              <Input
                value={settings.tiktok_url}
                onChange={(e) => set('tiktok_url', e.target.value)}
                placeholder="https://tiktok.com/@..."
              />
            </Field>
          </Card>

          <div className="sticky bottom-4">
            <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
              {saving ? t.saving : t.saveSettings}
            </Button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
