'use server';

import { requireAdmin } from '@/lib/requireAdmin';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { isSchemaError, errorMessage } from '@/lib/dbErrors';
import { DEFAULT_SETTINGS } from '@/lib/booking/settings';

export type TrashKind = 'booking' | 'review' | 'message' | 'service';

export interface TrashItem {
  kind: TrashKind;
  id: string;
  title: string;
  subtitle: string;
  deleted_at: string;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

// Everything currently in the trash, newest deletion first.
export async function getTrash(): Promise<{ success: boolean; items: TrashItem[]; retentionDays: number; schemaOutdated: boolean; error?: string }> {
  try {
    await requireAdmin();
    const db = getAdminClient();
    const about = await db.from('about_content').select('trash_retention_days').limit(1).maybeSingle();
    const retentionDays = typeof about.data?.trash_retention_days === 'number' ? about.data.trash_retention_days : DEFAULT_SETTINGS.trashRetentionDays;
    const [b, r, m, s] = await Promise.all([
      db.from('bookings').select('id, name, service, preferred_date, deleted_at').not('deleted_at', 'is', null),
      db.from('reviews').select('id, name, rating, comment, deleted_at').not('deleted_at', 'is', null),
      db.from('contact_submissions').select('id, name, message, deleted_at').not('deleted_at', 'is', null),
      db.from('services').select('id, treatment_title, category_title, deleted_at').not('deleted_at', 'is', null),
    ]);
    const firstErr = [b.error, r.error, m.error, s.error].find(Boolean);
    if (firstErr) {
      if (isSchemaError(firstErr)) return { success: true, items: [], retentionDays, schemaOutdated: true };
      throw firstErr;
    }
    const items: TrashItem[] = [
      ...(b.data || []).map((x) => ({ kind: 'booking' as const, id: String(x.id), title: str(x.name), subtitle: [str(x.service), str(x.preferred_date)].filter(Boolean).join(' · '), deleted_at: str(x.deleted_at) })),
      ...(r.data || []).map((x) => ({ kind: 'review' as const, id: String(x.id), title: str(x.name), subtitle: `${'★'.repeat(Number(x.rating) || 0)} ${str(x.comment).slice(0, 80)}`.trim(), deleted_at: str(x.deleted_at) })),
      ...(m.data || []).map((x) => ({ kind: 'message' as const, id: String(x.id), title: str(x.name), subtitle: str(x.message).slice(0, 80), deleted_at: str(x.deleted_at) })),
      ...(s.data || []).map((x) => ({ kind: 'service' as const, id: String(x.id), title: str(x.treatment_title), subtitle: str(x.category_title), deleted_at: str(x.deleted_at) })),
    ].sort((a, c) => c.deleted_at.localeCompare(a.deleted_at));
    return { success: true, items, retentionDays, schemaOutdated: false };
  } catch (err) {
    return { success: false, items: [], retentionDays: DEFAULT_SETTINGS.trashRetentionDays, schemaOutdated: isSchemaError(err), error: errorMessage(err) };
  }
}

// Permanently delete everything past the retention window (calls the
// security-definer purge_trash function) and archive finished bookings older
// than auto_archive_days. Shared by the cron route and the Trash page.
export async function runMaintenance(): Promise<{ purged: number; archived: number }> {
  const db = getAdminClient();
  const about = await db.from('about_content').select('trash_retention_days, auto_archive_days').limit(1).maybeSingle();
  const retention = typeof about.data?.trash_retention_days === 'number' ? about.data.trash_retention_days : DEFAULT_SETTINGS.trashRetentionDays;
  const archiveDays = typeof about.data?.auto_archive_days === 'number' ? about.data.auto_archive_days : DEFAULT_SETTINGS.autoArchiveDays;
  const purge = await db.rpc('purge_trash', { retention_days: retention });
  if (purge.error) throw purge.error;
  let archived = 0;
  if (archiveDays > 0) {
    const cutoff = new Date(Date.now() - archiveDays * 86400000).toISOString();
    const upd = await db
      .from('bookings')
      .update({ status: 'archived', archived_at: new Date().toISOString() })
      .in('status', ['completed', 'declined', 'cancelled', 'no_show'])
      .is('deleted_at', null)
      .lt('updated_at', cutoff)
      .select('id');
    if (upd.error && !isSchemaError(upd.error)) throw upd.error;
    archived = upd.data?.length ?? 0;
  }
  return { purged: typeof purge.data === 'number' ? purge.data : 0, archived };
}

export async function runMaintenanceNow(): Promise<{ success: boolean; purged?: number; archived?: number; error?: string }> {
  try {
    await requireAdmin();
    const r = await runMaintenance();
    return { success: true, ...r };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

// Empty the trash right now, regardless of age.
export async function emptyTrash(): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const db = getAdminClient();
    const r = await db.rpc('purge_trash', { retention_days: 0 });
    if (r.error) throw r.error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}
