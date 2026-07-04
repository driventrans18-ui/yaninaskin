'use server';

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { requireAdmin } from '@/lib/requireAdmin';

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

// Escape user-supplied text before dropping it into the notification email's
// HTML so a stray "<" or a pasted tag can't break (or inject into) the email.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
          const safeName = escapeHtml(name);
          // Sender address. Until a domain is verified in Resend, the shared
          // onboarding@resend.dev sender only delivers to the Resend account's
          // own email. Once my-skinbeauty.com is verified, set RESEND_FROM in
          // Vercel (e.g. "Skin Beauty <notifications@my-skinbeauty.com>") to
          // send to any address (the client's) with proper branding.
          const fromAddress =
            process.env.RESEND_FROM || 'Skin Beauty Website <onboarding@resend.dev>';
          // Let the owner hit "Reply" and write straight back to the visitor,
          // but only when the supplied email looks like a real address.
          const replyTo = email && email.includes('@') ? email : undefined;
          await resend.emails.send({
            from: fromAddress,
            to: businessEmail,
            ...(replyTo ? { replyTo } : {}),
            subject: `New message from ${name} — Skin Beauty`,
            html: `
              <h2>New message from your website</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Message:</strong></p>
              <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
              <hr />
              <p style="color:#888;font-size:12px">
                You can reply directly to this email to respond to ${safeName}.
                The message is also saved in your admin inbox.
              </p>
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
    await requireAdmin();
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
    await requireAdmin();
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
    await requireAdmin();
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

