'use server';

import dns from 'node:dns/promises';
import { requireAdmin } from '@/lib/requireAdmin';

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
