'use server';

import { requireAdmin } from '@/lib/requireAdmin';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { isSchemaError, errorMessage } from '@/lib/dbErrors';
import { normalizePhone, normalizeEmail } from '@/lib/phone';

// Clients the owner adds by hand. They are matched to booking requests by
// phone or email (see lib/booking/clients.ts), so a client who later books
// through the website shows one combined history.
export interface ClientRecord {
  id: string;
  name: string;
  phone: string | null;
  phone_normalized: string | null;
  email: string | null;
  email_normalized: string | null;
  instagram: string | null;
  notes: string | null;
  tags: string[];
  birthday: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ClientInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  notes?: string | null;
  birthday?: string | null;
}

type Result = { success: boolean; error?: string; schemaOutdated?: boolean };

const str = (v: unknown) => (typeof v === 'string' ? v : null);
function rowToRecord(r: Record<string, unknown>): ClientRecord {
  return {
    id: String(r.id),
    name: typeof r.name === 'string' ? r.name : '',
    phone: str(r.phone),
    phone_normalized: str(r.phone_normalized),
    email: str(r.email),
    email_normalized: str(r.email_normalized),
    instagram: str(r.instagram),
    notes: str(r.notes),
    tags: Array.isArray(r.tags) ? r.tags.filter((x): x is string => typeof x === 'string') : [],
    birthday: str(r.birthday),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at ?? r.created_at),
    deleted_at: str(r.deleted_at),
  };
}

export async function getClients(opts: { trashed?: boolean } = {}): Promise<{ success: boolean; data: ClientRecord[]; schemaOutdated: boolean; error?: string }> {
  try {
    await requireAdmin();
    const base = getAdminClient().from('clients').select('*').order('updated_at', { ascending: false });
    const { data, error } = await (opts.trashed ? base.not('deleted_at', 'is', null) : base.is('deleted_at', null));
    if (error) {
      if (isSchemaError(error)) return { success: true, data: [], schemaOutdated: true };
      throw error;
    }
    return { success: true, data: (data || []).map((r) => rowToRecord(r as Record<string, unknown>)), schemaOutdated: false };
  } catch (err) {
    return { success: false, data: [], schemaOutdated: isSchemaError(err), error: errorMessage(err) };
  }
}

// Create (id = null) or update a client. Phone and email are normalised for
// matching; a value that cannot be normalised is rejected with a field name.
export async function saveClient(
  id: string | null,
  input: ClientInput,
): Promise<{ success: boolean; data?: ClientRecord; error?: string; field?: 'name' | 'phone' | 'email' | 'birthday'; schemaOutdated?: boolean }> {
  try {
    await requireAdmin();
    const name = (input.name || '').trim().slice(0, 120);
    if (!name) return { success: false, error: 'Enter a name.', field: 'name' };
    const phoneRaw = (input.phone || '').trim().slice(0, 40);
    const phoneNorm = phoneRaw ? normalizePhone(phoneRaw) : null;
    if (phoneRaw && !phoneNorm) return { success: false, error: 'Check the phone number.', field: 'phone' };
    const emailRaw = (input.email || '').trim().slice(0, 200);
    const emailNorm = emailRaw ? normalizeEmail(emailRaw) : null;
    if (emailRaw && !emailNorm) return { success: false, error: 'Check the email address.', field: 'email' };
    const birthday = (input.birthday || '').trim();
    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return { success: false, error: 'Use a full date.', field: 'birthday' };
    const instagram = (input.instagram || '').trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/[/?].*$/, '').slice(0, 80);
    const row = {
      name,
      phone: phoneNorm ? phoneRaw : null,
      phone_normalized: phoneNorm,
      email: emailNorm ? emailRaw : null,
      email_normalized: emailNorm,
      instagram: instagram || null,
      notes: (input.notes || '').trim().slice(0, 4000) || null,
      birthday: birthday || null,
    };
    const db = getAdminClient();
    const q = id ? db.from('clients').update(row).eq('id', id).select('*').single() : db.from('clients').insert([row]).select('*').single();
    const { data, error } = await q;
    if (error) throw error;
    return { success: true, data: rowToRecord(data as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

async function setDeleted(ids: string[], deleted: boolean): Promise<Result> {
  try {
    await requireAdmin();
    if (!ids.length) return { success: true };
    const { error } = await getAdminClient().from('clients').update({ deleted_at: deleted ? new Date().toISOString() : null }).in('id', ids);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}
export async function trashClients(ids: string[]): Promise<Result> {
  return setDeleted(ids, true);
}
export async function restoreClients(ids: string[]): Promise<Result> {
  return setDeleted(ids, false);
}
export async function purgeClients(ids: string[]): Promise<Result> {
  try {
    await requireAdmin();
    if (!ids.length) return { success: true };
    const { error } = await getAdminClient().from('clients').delete().in('id', ids).not('deleted_at', 'is', null);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}
