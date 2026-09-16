import type { Booking, BookingSettings, ServiceLite } from './types';

// "1 hour" | "1.5 hours" | "80 min" | "90" | "2 hours" → minutes
export function parseDurationMinutes(text: string | null | undefined): number | null {
  if (!text) return null;
  const s = text.trim().toLowerCase();
  const hours = /^(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)\b/.exec(s);
  if (hours) return Math.round(parseFloat(hours[1]) * 60);
  const mins = /(\d+)\s*(m|min|mins|minute|minutes)\b/.exec(s);
  if (mins) return parseInt(mins[1], 10);
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  return null;
}

const norm = (s: string | null | undefined) => (s || '').trim().toLowerCase();

export function findService(services: ServiceLite[], title: string | null | undefined): ServiceLite | undefined {
  const key = norm(title);
  if (!key) return undefined;
  return services.find((s) => norm(s.title) === key);
}

// Effective appointment length for a booking.
export function durationFor(b: Booking, services: ServiceLite[], settings: BookingSettings): number {
  if (typeof b.duration_minutes === 'number' && b.duration_minutes > 0) return b.duration_minutes;
  const svc = findService(services, b.service);
  if (svc?.durationMinutes) return svc.durationMinutes;
  return settings.slotMinutes;
}

export function bufferFor(b: Booking, services: ServiceLite[], settings: BookingSettings): number {
  const svc = findService(services, b.service);
  if (svc && typeof svc.bufferMinutes === 'number') return svc.bufferMinutes;
  return settings.bufferMinutes;
}
