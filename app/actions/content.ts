'use server';

import { createClient } from '@supabase/supabase-js';

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
    console.log('[updateService] Updating service', id, 'with:', updates);
    console.log('[updateService] Service role key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await adminClient
      .from('services')
      .update({ ...updates, updated_at: new Date() })
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
    const { error } = await adminClient
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting service:', error);
    return { success: false };
  }
}

export async function addService(serviceData: Record<string, any>) {
  try {
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
    console.log('[updateAboutContent] Starting with data:', about);
    console.log('[updateAboutContent] Service role key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const existing = await getAboutContent();
    console.log('[updateAboutContent] Existing data:', existing);

    if (existing.data?.id) {
      console.log('[updateAboutContent] Updating existing record:', existing.data.id);
      const { data, error } = await adminClient
        .from('about_content')
        .update({ ...about, updated_at: new Date() })
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
