'use server';

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getBusinessEmail(): Promise<string | null> {
  try {
    const { data } = await adminClient
      .from('about_content')
      .select('email')
      .limit(1)
      .single();
    return data?.email || null;
  } catch {
    return null;
  }
}

export type BookingRequestInput = {
  name: string;
  service: string;
  preferred_when: string;
  details: string;
  method: 'sms' | 'instagram';
};

export async function submitBookingRequest(input: BookingRequestInput) {
  const { name, service, preferred_when, details, method } = input;
  try {
    const { error } = await anonClient
      .from('booking_requests')
      .insert([{ name, service, preferred_when, details, method }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }

    // Notify the owner by email, mirroring the contact form. Best-effort: an
    // email failure never fails the saved request.
    if (process.env.RESEND_API_KEY) {
      try {
        const businessEmail = await getBusinessEmail();
        if (businessEmail) {
          const channel = method === 'instagram' ? 'Instagram' : 'Text (SMS)';
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'Skin Beauty Website <onboarding@resend.dev>',
            to: businessEmail,
            subject: `New booking request from ${name || 'a visitor'}`,
            html: `
              <h2>New Booking Request</h2>
              <p><strong>Name:</strong> ${name || '—'}</p>
              <p><strong>Service:</strong> ${service || '—'}</p>
              <p><strong>Preferred time:</strong> ${preferred_when || '—'}</p>
              <p><strong>Details:</strong></p>
              <p>${(details || '—').replace(/\n/g, '<br>')}</p>
              <p><strong>Sent via:</strong> ${channel}</p>
            `,
          });
        }
      } catch (emailErr) {
        // Email failure does not fail the submission
        console.error('Resend email error:', emailErr);
      }
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to submit';
    console.error('Error submitting booking request:', err);
    return { success: false, error: msg };
  }
}

export async function getBookingRequests() {
  try {
    const { data, error } = await adminClient
      .from('booking_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Error fetching booking requests:', err);
    return { success: false, data: [] };
  }
}

export async function markBookingRead(id: string, read: boolean) {
  try {
    const { error } = await adminClient
      .from('booking_requests')
      .update({ read })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error updating booking request:', err);
    return { success: false };
  }
}

export async function deleteBookingRequest(id: string) {
  try {
    const { error } = await adminClient
      .from('booking_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting booking request:', err);
    return { success: false };
  }
}
