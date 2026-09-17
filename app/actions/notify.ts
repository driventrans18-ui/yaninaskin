// Owner notifications. Uses Resend (already configured for the contact form)
// when RESEND_API_KEY is set; silently does nothing otherwise. Never throws.
import { Resend } from 'resend';
import type { Booking, BookingSettings } from '@/lib/booking/types';
import { formatDateTime } from '@/lib/tz';
import { formatPhone } from '@/lib/phone';
import { siteConfig } from '@/lib/siteConfig';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fromAddress() {
  return process.env.RESEND_FROM || 'Skin Beauty Website <onboarding@resend.dev>';
}

export function emailNotificationsAvailable(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendOwnerEmail(to: string, subject: string, html: string, replyTo?: string) {
  if (!process.env.RESEND_API_KEY || !to) return false;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: fromAddress(),
      to,
      ...(replyTo ? { replyTo } : {}),
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('Resend email error:', err);
    return false;
  }
}

export async function notifyNewBooking(b: Booking, settings: BookingSettings, opts: { duplicate?: boolean } = {}) {
  if (settings.notificationPrefs.new_booking_email === false) return;
  const to = settings.notificationPrefs?.email?.trim() || settings.email;
  if (!to) return;
  const when = b.preferred_at
    ? formatDateTime(new Date(b.preferred_at), 'en', settings.timezone) + (b.preferred_time ? '' : ' (no time chosen)')
    : 'No date chosen';
  const link = `${siteConfig.url}/admin/bookings?open=${encodeURIComponent(b.id)}`;
  const rows: [string, string][] = [
    ['Client', b.name],
    ['Service', b.service || '—'],
    ['Price', b.price || '—'],
    ['Preferred', when],
    ['Phone', b.phone ? formatPhone(b.phone) : '—'],
    ['Email', b.email || '—'],
    ['Contact via', b.method || '—'],
    ['Language', (b.lang || 'en').toUpperCase()],
  ];
  const html = `
    <h2 style="font-family:Georgia,serif;font-weight:500">${opts.duplicate ? 'Repeated' : 'New'} booking request</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#777">${k}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
        )
        .join('')}
    </table>
    ${b.details ? `<p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;border-left:3px solid #d4b0a6;padding-left:12px">${escapeHtml(b.details)}</p>` : ''}
    <p style="font-family:sans-serif;font-size:14px"><a href="${link}" style="background:#2b2724;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Open in admin</a></p>
    <p style="font-family:sans-serif;font-size:12px;color:#888">Reply to this email to write to the client directly.</p>`;
  await sendOwnerEmail(
    to,
    `${opts.duplicate ? 'Repeated' : 'New'} booking request from ${b.name} — ${b.service || 'Skin Beauty'}`,
    html,
    b.email && b.email.includes('@') ? b.email : undefined,
  );
}
