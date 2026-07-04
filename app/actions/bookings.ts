'use server';

import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/requireAdmin';

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface BookingInput {
  name: string;
  service?: string | null;
  price?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  details?: string | null;
  method: 'sms' | 'instagram';
}

// Save a booking request from the public "Book" modal. Uses the anon key so
// it works for unauthenticated visitors (insert-only, per RLS policy).
export async function submitBooking(input: BookingInput) {
  try {
    const { error } = await anonClient.from('bookings').insert([
      {
        name: input.name,
        service: input.service ?? null,
        price: input.price ?? null,
        preferred_date: input.preferredDate ?? null,
        preferred_time: input.preferredTime ?? null,
        details: input.details ?? null,
        method: input.method,
      },
    ]);

    if (error) {
      console.error('Supabase booking insert error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to submit booking';
    console.error('Error submitting booking:', err);
    return { success: false, error: msg };
  }
}

export async function getBookings() {
  try {
    await requireAdmin();
    const { data, error } = await adminClient
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return { success: false, data: [] };
  }
}

export async function markBookingRead(id: string, read: boolean) {
  try {
    await requireAdmin();
    const { error } = await adminClient
      .from('bookings')
      .update({ read })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error updating booking:', err);
    return { success: false };
  }
}

export async function deleteBooking(id: string) {
  try {
    await requireAdmin();
    const { error } = await adminClient.from('bookings').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting booking:', err);
    return { success: false };
  }
}
