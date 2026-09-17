'use server';

import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/requireAdmin';
import { isSchemaError, errorMessage } from '@/lib/dbErrors';
import { normalizeGallery, normalizeGalleryItem, type GalleryItem } from '@/lib/gallery';
import { normalizeBrands, type BrandItem } from '@/lib/brands';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is not set in environment variables. Admin operations will fail.');
}

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-key'
);

const publicClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// SERVICES
export async function getServices() {
  try {
    const { data, error } = await publicClient
      .from('services')
      .select('*')
      .order('category_order')
      .order('treatment_order');

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching services:', error);
    return { success: false, data: [] };
  }
}

export async function updateService(
  id: number,
  updates: Record<string, any>
) {
  try {
    await requireAdmin();
    console.log('[updateService] Updating service', id, 'with:', updates);
    console.log('[updateService] Service role key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { id: _, ...safeUpdates } = updates;
    const { data, error } = await adminClient
      .from('services')
      .update({ ...safeUpdates, updated_at: new Date() })
      .eq('id', id)
      .select();

    console.log('[updateService] Result - error:', error, 'data:', data);
    if (error) {
      const errorMsg = error.message || JSON.stringify(error);
      throw new Error(`Supabase error: ${errorMsg}`);
    }
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('[updateService] Error:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function deleteService(id: number) {
  try {
    await requireAdmin();
    const res = await archiveOrDeleteService(id);
    if (!res.success) throw new Error(res.error);
    return { success: true };
  } catch (error) {
    console.error('Error deleting service:', error);
    return { success: false };
  }
}

export async function addService(serviceData: Record<string, any>) {
  try {
    await requireAdmin();
    const { error } = await adminClient
      .from('services')
      .insert([serviceData]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error adding service:', error);
    return { success: false, error: String(error) };
  }
}

// ABOUT CONTENT
export async function getAboutContent() {
  try {
    const { data, error } = await publicClient
      .from('about_content')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data || null };
  } catch (error) {
    console.error('Error fetching about content:', error);
    return { success: false, data: null };
  }
}

export async function updateAboutContent(about: Record<string, any>) {
  try {
    await requireAdmin();
    console.log('[updateAboutContent] Starting with data:', about);
    console.log('[updateAboutContent] Service role key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const existing = await getAboutContent();
    console.log('[updateAboutContent] Existing data:', existing);

    if (existing.data?.id) {
      console.log('[updateAboutContent] Updating existing record:', existing.data.id);
      const { id, ...updateData } = about;
      const { data, error } = await adminClient
        .from('about_content')
        .update({ ...updateData, updated_at: new Date() })
        .eq('id', existing.data.id)
        .select();

      console.log('[updateAboutContent] Update result - error:', error, 'data:', data);
      if (error) {
        const errorMsg = error.message || JSON.stringify(error);
        throw new Error(`Supabase error: ${errorMsg}`);
      }
    } else {
      console.log('[updateAboutContent] Inserting new record');
      const { data, error } = await adminClient
        .from('about_content')
        .insert([{ ...about }])
        .select();

      console.log('[updateAboutContent] Insert result - error:', error, 'data:', data);
      if (error) {
        const errorMsg = error.message || JSON.stringify(error);
        throw new Error(`Supabase error: ${errorMsg}`);
      }
    }

    console.log('[updateAboutContent] Success!');
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('[updateAboutContent] Error:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// DOMAIN RENEWAL — stored on the about_content singleton row alongside the
// other site settings. Lets the admin record when the domain renews and edit
// it after renewing (pushing the date years ahead).
export async function getDomainInfo() {
  const result = await getAboutContent();
  return {
    success: result.success,
    data: {
      domain_name: result.data?.domain_name ?? null,
      domain_renewal_date: result.data?.domain_renewal_date ?? null,
    },
  };
}

export async function saveDomainInfo(info: {
  domain_name?: string | null;
  domain_renewal_date?: string | null;
}) {
  return updateAboutContent({
    domain_name: info.domain_name || null,
    domain_renewal_date: info.domain_renewal_date || null,
  });
}

// GALLERY (stored as a JSON array on the about_content row; files live in
// storage but are referenced by URL so we never depend on Storage listing)
export async function getGallery() {
  try {
    const result = await getAboutContent();
    const items = normalizeGallery((result.data as Record<string, unknown> | null)?.gallery);
    return { success: true, data: items };
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return { success: false, data: [] as GalleryItem[] };
  }
}

export async function saveGallery(items: GalleryItem[]) {
  const clean = items.map((it, i) => normalizeGalleryItem(it, i)).filter((x): x is GalleryItem => Boolean(x));
  return updateAboutContent({ gallery: clean });
}

// BRANDS (stored as a JSON array on the about_content row)
export async function getBrands() {
  try {
    const result = await getAboutContent();
    return { success: true, data: normalizeBrands((result.data as Record<string, unknown> | null)?.brands) };
  } catch (error) {
    console.error('Error fetching brands:', error);
    return { success: false, data: [] as BrandItem[] };
  }
}

export async function saveBrands(items: BrandItem[]) {
  return updateAboutContent({ brands: normalizeBrands(items) });
}

// ---------------------------------------------------------------------------
// SERVICES (admin): richer editing added with the 2026-09 redesign
// ---------------------------------------------------------------------------
const SERVICE_COLUMNS = [
  'category_order', 'category_title', 'category_description', 'treatment_order', 'treatment_title', 'treatment_price',
  'treatment_duration', 'treatment_description', 'treatment_note', 'treatment_image_before', 'treatment_image_after',
  'treatment_before_position', 'treatment_after_position', 'translations', 'duration_minutes', 'buffer_minutes',
  'price_min', 'price_max', 'active', 'bookable', 'brand_ids', 'prep_notes', 'aftercare_notes', 'contraindications',
] as const;

function pickServiceColumns(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of SERVICE_COLUMNS) if (k in data) out[k] = data[k];
  return out;
}

// All services for the admin, including inactive/archived (but not trashed).
export async function getServicesAdmin(): Promise<{ success: boolean; data: Record<string, unknown>[]; schemaOutdated: boolean; error?: string }> {
  try {
    await requireAdmin();
    const { data, error } = await adminClient
      .from('services')
      .select('*')
      .is('deleted_at', null)
      .order('category_order')
      .order('treatment_order');
    if (error) {
      if (!isSchemaError(error)) throw error;
      const legacy = await adminClient.from('services').select('*').order('category_order').order('treatment_order');
      if (legacy.error) throw legacy.error;
      return { success: true, data: (legacy.data || []) as Record<string, unknown>[], schemaOutdated: true };
    }
    return { success: true, data: (data || []) as Record<string, unknown>[], schemaOutdated: false };
  } catch (error) {
    return { success: false, data: [], schemaOutdated: isSchemaError(error), error: errorMessage(error) };
  }
}

// Create or update one service. Unknown columns (pre-migration DB) are retried
// without the new fields so the basic edit still saves.
export async function saveService(id: number | null, data: Record<string, unknown>): Promise<{ success: boolean; id?: number; error?: string; schemaOutdated?: boolean }> {
  try {
    await requireAdmin();
    const payload = pickServiceColumns(data);
    const attempt = async (p: Record<string, unknown>) =>
      id
        ? adminClient.from('services').update({ ...p, updated_at: new Date().toISOString() }).eq('id', id).select('id').single()
        : adminClient.from('services').insert([p]).select('id').single();
    let res = await attempt(payload);
    if (res.error && isSchemaError(res.error)) {
      const legacyKeys = ['category_order', 'category_title', 'category_description', 'treatment_order', 'treatment_title', 'treatment_price', 'treatment_duration', 'treatment_description', 'treatment_note', 'treatment_image_before', 'treatment_image_after', 'treatment_before_position', 'treatment_after_position'];
      const legacy: Record<string, unknown> = {};
      for (const k of legacyKeys) if (k in payload) legacy[k] = payload[k];
      res = await attempt(legacy);
      if (!res.error) return { success: true, id: res.data?.id, schemaOutdated: true };
    }
    if (res.error) throw res.error;
    return { success: true, id: res.data?.id };
  } catch (error) {
    return { success: false, error: errorMessage(error), schemaOutdated: isSchemaError(error) };
  }
}

// Persist a new order (drag & drop). Updates every changed row.
export async function reorderServices(order: { id: number; category_order: number; treatment_order: number; category_title?: string }[]): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    for (const o of order) {
      const patch: Record<string, unknown> = { category_order: o.category_order, treatment_order: o.treatment_order };
      if (o.category_title) patch.category_title = o.category_title;
      const { error } = await adminClient.from('services').update(patch).eq('id', o.id);
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

// Edit category-level fields on every service in that category.
export async function updateCategory(oldTitle: string, patch: { category_title?: string; category_description?: string | null; uk_title?: string; uk_description?: string }): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const { data, error } = await adminClient.from('services').select('id, translations').eq('category_title', oldTitle);
    if (error) throw error;
    for (const row of data || []) {
      const update: Record<string, unknown> = {};
      if (patch.category_title !== undefined) update.category_title = patch.category_title;
      if (patch.category_description !== undefined) update.category_description = patch.category_description;
      if (patch.uk_title !== undefined || patch.uk_description !== undefined) {
        const tr = (row.translations && typeof row.translations === 'object' ? row.translations : {}) as Record<string, Record<string, unknown>>;
        const uk = { ...(tr.uk || {}) };
        if (patch.uk_title !== undefined) uk.category_title = patch.uk_title;
        if (patch.uk_description !== undefined) uk.category_description = patch.uk_description;
        update.translations = { ...tr, uk };
      }
      const { error: e2 } = await adminClient.from('services').update(update).eq('id', row.id);
      if (e2) throw e2;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error), };
  }
}

export async function duplicateService(id: number): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    await requireAdmin();
    const { data, error } = await adminClient.from('services').select('*').eq('id', id).single();
    if (error) throw error;
    const copy = pickServiceColumns(data as Record<string, unknown>);
    copy.treatment_title = `${String(copy.treatment_title || '')} (copy)`;
    copy.treatment_order = Number(copy.treatment_order ?? 0) + 1;
    if ('active' in copy) copy.active = false;
    const res = await adminClient.from('services').insert([copy]).select('id').single();
    if (res.error) throw res.error;
    return { success: true, id: res.data.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

// Delete a service — unless bookings reference it, in which case it's archived
// (hidden from the website, kept for history). Returns what happened.
export async function archiveOrDeleteService(id: number): Promise<{ success: boolean; action?: 'archived' | 'trashed'; error?: string }> {
  try {
    await requireAdmin();
    const { data: svc, error } = await adminClient.from('services').select('treatment_title').eq('id', id).single();
    if (error) throw error;
    let referenced = 0;
    try {
      const { count } = await adminClient.from('bookings').select('id', { count: 'exact', head: true }).eq('service', svc.treatment_title).is('deleted_at', null);
      referenced = count ?? 0;
    } catch {
      referenced = 0;
    }
    const now = new Date().toISOString();
    const patch = referenced > 0 ? { archived_at: now, active: false, bookable: false } : { deleted_at: now };
    const res = await adminClient.from('services').update(patch).eq('id', id);
    if (res.error) {
      if (!isSchemaError(res.error)) throw res.error;
      const hard = await adminClient.from('services').delete().eq('id', id);
      if (hard.error) throw hard.error;
      return { success: true, action: 'trashed' };
    }
    return { success: true, action: referenced > 0 ? 'archived' : 'trashed' };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function unarchiveService(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const { error } = await adminClient.from('services').update({ archived_at: null, active: true }).eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function restoreServices(ids: number[]): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const { error } = await adminClient.from('services').update({ deleted_at: null }).in('id', ids);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function purgeServices(ids: number[]): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const { error } = await adminClient.from('services').delete().in('id', ids);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
