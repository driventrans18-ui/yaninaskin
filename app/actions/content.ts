'use server';

import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
    const { error } = await adminClient
      .from('services')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating service:', error);
    return { success: false, error: String(error) };
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
    const existing = await getAboutContent();

    if (existing.data?.id) {
      const { error } = await adminClient
        .from('about_content')
        .update({ ...about, updated_at: new Date() })
        .eq('id', existing.data.id);

      if (error) throw error;
    } else {
      const { error } = await adminClient
        .from('about_content')
        .insert([{ ...about }]);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating about content:', error);
    return { success: false, error: String(error) };
  }
}
