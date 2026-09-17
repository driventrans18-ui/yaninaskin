// Small AES-256-GCM box for secrets the owner wants to keep in the admin
// (e.g. the Wix login). The key is derived from CREDENTIALS_SECRET, or from
// the service-role key when that is not set, so nothing extra is required to
// get started. Rotating either makes previously sealed values unreadable —
// they then need to be entered again.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const PREFIX = 'enc1';

function key(): Buffer {
  const secret = process.env.CREDENTIALS_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!secret) throw new Error('No server secret is configured to protect saved logins');
  return createHash('sha256').update(`saved-logins:${secret}`).digest();
}

export function seal(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [PREFIX, iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), data.toString('base64url')].join('.');
}

export function open(sealed: string): string {
  const [prefix, iv, tag, data] = sealed.split('.');
  if (prefix !== PREFIX || !iv || !tag || !data) throw new Error('Unrecognised sealed value');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
}

export const isSealed = (v: unknown): v is string => typeof v === 'string' && v.startsWith(`${PREFIX}.`);
