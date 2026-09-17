'use server';

import dns from 'node:dns/promises';
import { requireAdmin } from '@/lib/requireAdmin';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { isSchemaError, errorMessage } from '@/lib/dbErrors';
import { seal, open, isSealed } from '@/lib/secretBox';

// The records a Vercel-hosted domain needs. These are Vercel's published
// defaults; the Domain page shows them next to what DNS currently returns so
// the owner can fix them at the registrar (Wix) without changing anything here.
// Vercel's current default apex record, plus the older one that still works.
const VERCEL_A_OK = ['216.198.79.1', '76.76.21.21'];
const VERCEL_A = VERCEL_A_OK[0];
const VERCEL_CNAME = 'cname.vercel-dns.com';
const cnameOk = (v: string) => /(^|\.)vercel-dns(-\d+)?\.com$/.test(v);

export interface DnsRow {
  type: 'A' | 'CNAME';
  host: string;
  expected: string;
  found: string[];
  status: 'ok' | 'mismatch' | 'missing' | 'unknown';
}

export interface DomainCheck {
  domain: string;
  https: { ok: boolean; status: number | null; error?: string; redirectsTo?: string | null };
  www: { ok: boolean; status: number | null; error?: string };
  dns: DnsRow[];
  checkedAt: string;
}

const clean = (d: string) => d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

async function lookup(type: 'A' | 'CNAME', host: string): Promise<{ found: string[]; error?: string }> {
  try {
    const found = type === 'A' ? await dns.resolve4(host) : await dns.resolveCname(host);
    return { found: found.map((v) => v.toLowerCase()) };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code || '';
    if (code === 'ENODATA' || code === 'ENOTFOUND') return { found: [] };
    return { found: [], error: code || 'lookup failed' };
  }
}

async function probe(url: string): Promise<{ ok: boolean; status: number | null; error?: string; redirectsTo?: string | null }> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timer);
    const redirectsTo = res.status >= 300 && res.status < 400 ? res.headers.get('location') : null;
    return { ok: res.status < 400, status: res.status, redirectsTo };
  } catch (err) {
    return { ok: false, status: null, error: err instanceof Error ? err.message.slice(0, 120) : 'fetch failed' };
  }
}

export async function checkDomain(input: string): Promise<{ success: boolean; data?: DomainCheck; error?: string }> {
  try {
    await requireAdmin();
    const domain = clean(input);
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return { success: false, error: 'Enter a domain like my-skinbeauty.com' };
    const [apex, www, https, httpsWww] = await Promise.all([lookup('A', domain), lookup('CNAME', `www.${domain}`), probe(`https://${domain}/`), probe(`https://www.${domain}/`)]);
    const row = (type: 'A' | 'CNAME', host: string, expected: string, r: { found: string[]; error?: string }): DnsRow => ({
      type,
      host,
      expected,
      found: r.found,
      status: r.error
        ? 'unknown'
        : r.found.length === 0
          ? 'missing'
          : (type === 'A' ? r.found.some((v) => VERCEL_A_OK.includes(v)) : r.found.some(cnameOk))
            ? 'ok'
            : 'mismatch',
    });
    return {
      success: true,
      data: {
        domain,
        https,
        www: httpsWww,
        dns: [row('A', '@', VERCEL_A, apex), row('CNAME', 'www', VERCEL_CNAME, www)],
        checkedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
// Saved logins (e.g. the Wix account). Stored on about_content.saved_logins as
// { [key]: { login, password (sealed), note, updated_at } }. Only the signed-in
// admin can read them, and the password is decrypted on the server per request.
// ---------------------------------------------------------------------------
export interface SavedLogin {
  login: string;
  password: string;
  note: string;
  updated_at: string | null;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const validKey = (k: string) => /^[a-z0-9_-]{1,32}$/.test(k);

async function loadLogins(): Promise<{ id: number | string; logins: Record<string, Record<string, unknown>> } | { schemaOutdated: true }> {
  const db = getAdminClient();
  const { data, error } = await db.from('about_content').select('id, saved_logins').limit(1).maybeSingle();
  if (error) {
    if (isSchemaError(error)) return { schemaOutdated: true };
    throw error;
  }
  if (!data) throw new Error('Settings row not found');
  const logins = (data.saved_logins && typeof data.saved_logins === 'object' ? data.saved_logins : {}) as Record<string, Record<string, unknown>>;
  return { id: data.id as number | string, logins };
}

export async function getSavedLogin(key: string): Promise<{ success: boolean; data: SavedLogin | null; schemaOutdated?: boolean; error?: string }> {
  try {
    await requireAdmin();
    if (!validKey(key)) return { success: false, data: null, error: 'Invalid key' };
    const r = await loadLogins();
    if ('schemaOutdated' in r) return { success: true, data: null, schemaOutdated: true };
    const e = r.logins[key];
    if (!e) return { success: true, data: null };
    let password = '';
    try {
      password = isSealed(e.password) ? open(e.password) : str(e.password);
    } catch {
      return { success: false, data: null, error: 'The saved password can’t be read on this server (the secret changed). Enter it again.' };
    }
    return { success: true, data: { login: str(e.login), password, note: str(e.note), updated_at: typeof e.updated_at === 'string' ? e.updated_at : null } };
  } catch (err) {
    return { success: false, data: null, error: errorMessage(err) };
  }
}

export async function saveSavedLogin(key: string, input: { login: string; password: string; note?: string }): Promise<{ success: boolean; error?: string; schemaOutdated?: boolean }> {
  try {
    await requireAdmin();
    if (!validKey(key)) return { success: false, error: 'Invalid key' };
    const r = await loadLogins();
    if ('schemaOutdated' in r) return { success: false, schemaOutdated: true, error: 'Run the latest migration first.' };
    const login = (input.login || '').trim().slice(0, 200);
    const password = (input.password || '').slice(0, 500);
    const note = (input.note || '').trim().slice(0, 1000);
    if (!login && !password) return { success: false, error: 'Enter a login or a password.' };
    const next = { ...r.logins, [key]: { login, password: password ? seal(password) : '', note, updated_at: new Date().toISOString() } };
    const { error } = await getAdminClient().from('about_content').update({ saved_logins: next }).eq('id', r.id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function deleteSavedLogin(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    if (!validKey(key)) return { success: false, error: 'Invalid key' };
    const r = await loadLogins();
    if ('schemaOutdated' in r) return { success: true };
    const next = { ...r.logins };
    delete next[key];
    const { error } = await getAdminClient().from('about_content').update({ saved_logins: next }).eq('id', r.id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}
