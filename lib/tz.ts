// Timezone helpers built on Intl only (no date library). The studio runs in one
// timezone (Settings → timezone, default America/New_York) while the server
// runs in UTC and the owner's phone may be anywhere, so every "9:00 AM on the
// 29th" must be resolved through these helpers rather than `new Date(y, m, d)`.

export const DEFAULT_TZ = 'America/New_York';

export type Lang = 'en' | 'uk' | 'es';

export function localeFor(lang: string | undefined | null): string {
  if (lang === 'uk') return 'uk-UA';
  if (lang === 'es') return 'es-ES';
  return 'en-US';
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(tz: string): Intl.DateTimeFormat {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
    });
    fmtCache.set(tz, f);
  }
  return f;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface TzParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number; // 0 = Sunday
}

// Wall-clock parts of `date` in timezone `tz`.
export function tzParts(date: Date, tz: string = DEFAULT_TZ): TzParts {
  const parts = partsFormatter(tz).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '0';
  const hourRaw = Number(get('hour'));
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: hourRaw === 24 ? 0 : hourRaw,
    minute: Number(get('minute')),
    second: Number(get('second')),
    weekday: Math.max(0, WEEKDAYS.indexOf(get('weekday'))),
  };
}

// Minutes to add to UTC to get local wall-clock time in `tz` at `date`.
export function tzOffsetMinutes(date: Date, tz: string = DEFAULT_TZ): number {
  const p = tzParts(date, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

const pad = (n: number) => String(n).padStart(2, '0');

// "YYYY-MM-DD" of `date` as seen in `tz`.
export function dateKey(date: Date, tz: string = DEFAULT_TZ): string {
  const p = tzParts(date, tz);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

// "HH:MM" (24h) of `date` as seen in `tz`.
export function timeKey(date: Date, tz: string = DEFAULT_TZ): string {
  const p = tzParts(date, tz);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

export function isValidDateKey(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function isValidTimeKey(s: unknown): s is string {
  if (typeof s !== 'string') return false;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return false;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  return h >= 0 && h < 24 && mi >= 0 && mi < 60;
}

// Parse legacy time labels ("9:00 AM", "6:00 PM", "18:00", "09:00") to "HH:MM".
export function parseTimeLabel(label: string | null | undefined): string | null {
  if (!label) return null;
  const s = label.trim();
  const ampm = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(s);
  if (ampm) {
    let h = Number(ampm[1]) % 12;
    if (ampm[3].toUpperCase() === 'PM') h += 12;
    return `${pad(h)}:${ampm[2]}`;
  }
  const plain = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (plain) return `${pad(Number(plain[1]))}:${plain[2]}`;
  return null;
}

// The instant at which the wall clock in `tz` reads `dateKey` `time`.
// Handles DST by re-checking the offset at the candidate instant.
export function zonedToUtc(dateKeyStr: string, time: string, tz: string = DEFAULT_TZ): Date {
  const [y, m, d] = dateKeyStr.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi, 0);
  let offset = tzOffsetMinutes(new Date(guess), tz);
  let result = guess - offset * 60000;
  const check = tzOffsetMinutes(new Date(result), tz);
  if (check !== offset) {
    offset = check;
    result = guess - offset * 60000;
  }
  return new Date(result);
}

// Midnight (start of day) in `tz` for a date key.
export function startOfDay(dateKeyStr: string, tz: string = DEFAULT_TZ): Date {
  return zonedToUtc(dateKeyStr, '00:00', tz);
}

// Calendar arithmetic on date keys (no timezone involved).
export function addDays(dateKeyStr: string, n: number): string {
  const [y, m, d] = dateKeyStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function weekdayOf(dateKeyStr: string): number {
  const [y, m, d] = dateKeyStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

// Whole calendar days from `a` to `b` (b - a).
export function daysBetween(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000);
}

// Monday-first start of the week containing dateKey.
export function startOfWeek(dateKeyStr: string): string {
  const wd = weekdayOf(dateKeyStr); // 0 = Sunday
  const back = wd === 0 ? 6 : wd - 1;
  return addDays(dateKeyStr, -back);
}

export function minutesOfTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function timeOfMinutes(mins: number): string {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

export function formatDate(
  date: Date,
  lang: string,
  tz: string = DEFAULT_TZ,
  opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' },
): string {
  return new Intl.DateTimeFormat(localeFor(lang), { timeZone: tz, ...opts }).format(date);
}

export function formatTime(date: Date, lang: string, tz: string = DEFAULT_TZ): string {
  return new Intl.DateTimeFormat(localeFor(lang), {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

// Format an "HH:MM" wall-clock time label for the locale ("6:00 PM" / "18:00").
export function formatTimeKey(time: string, lang: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(Date.UTC(2000, 0, 1, h, m));
  return new Intl.DateTimeFormat(localeFor(lang), {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function formatDateKey(
  dateKeyStr: string,
  lang: string,
  opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' },
): string {
  const [y, m, d] = dateKeyStr.split('-').map(Number);
  return new Intl.DateTimeFormat(localeFor(lang), { timeZone: 'UTC', ...opts }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function formatDateTime(date: Date, lang: string, tz: string = DEFAULT_TZ): string {
  return new Intl.DateTimeFormat(localeFor(lang), {
    timeZone: tz,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
