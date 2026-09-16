// Phone normalisation for a US studio: stores E.164 (+15855550123), accepts
// whatever a client types ("(585) 555-0123", "585.555.0123", "+380 67 ...").

export function normalizePhone(raw: string | null | undefined, defaultCountryCode = '1'): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith('+');
  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;
  // "00" international prefix → "+"
  if (!hasPlus && digits.startsWith('00') && digits.length > 11) digits = digits.slice(2);
  if (hasPlus) {
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }
  if (digits.length === 10) return `+${defaultCountryCode}${digits}`;
  if (digits.length === 11 && digits.startsWith(defaultCountryCode)) return `+${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function isValidPhone(raw: string | null | undefined): boolean {
  return normalizePhone(raw) !== null;
}

// Pretty display: US numbers as (585) 555-0123, everything else as stored.
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '';
  const e164 = normalizePhone(value) ?? value;
  const us = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  if (us) return `(${us[1]}) ${us[2]}-${us[3]}`;
  return e164;
}

export function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null;
}

// Mask for public/log contexts: +1585•••0123
export function maskPhone(e164: string | null | undefined): string {
  if (!e164) return '';
  if (e164.length < 7) return '•••';
  return `${e164.slice(0, 5)}•••${e164.slice(-3)}`;
}
