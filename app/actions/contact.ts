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

export async function submitContactForm(
  name: string,
  phone: string,
  email: string,
  message: string
) {
  try {
    const { error } = await anonClient
      .from('contact_submissions')
      .insert([{ name, phone, email, message }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }

    // Send email notification using the email set in admin panel
    if (process.env.RESEND_API_KEY) {
      try {
        const businessEmail = await getBusinessEmail();
        if (businessEmail) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'Skin Beauty Website <onboarding@resend.dev>',
            to: businessEmail,
            subject: `New contact from ${name}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
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
    console.error('Error submitting contact form:', err);
    return { success: false, error: msg };
  }
}

export async function getContactSubmissions() {
  try {
    const { data, error } = await adminClient
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Error fetching contact submissions:', err);
    return { success: false, data: [] };
  }
}

export async function markContactRead(id: string, read: boolean) {
  try {
    const { error } = await adminClient
      .from('contact_submissions')
      .update({ read })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error updating contact submission:', err);
    return { success: false };
  }
}

export async function deleteContactSubmission(id: string) {
  try {
    const { error } = await adminClient
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting contact submission:', err);
    return { success: false };
  }
}

