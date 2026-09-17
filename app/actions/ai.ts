'use server';

// Optional AI assist for the booking drawer. Only active when ANTHROPIC_API_KEY
// is configured; the UI hides the feature otherwise. Nothing is ever sent to a
// client automatically — the owner edits and sends the draft herself.
import Anthropic from '@anthropic-ai/sdk';
import { requireAdmin } from '@/lib/requireAdmin';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { errorMessage } from '@/lib/dbErrors';
import { settingsFromRow } from '@/lib/booking/settings';
import { formatDateTime } from '@/lib/tz';

export interface AiAssistResult {
  success: boolean;
  summary?: string;
  draft?: string;
  error?: string;
}

const MODEL = 'claude-opus-5';

export async function aiAssistBooking(bookingId: string, adminLang: 'en' | 'uk'): Promise<AiAssistResult> {
  try {
    await requireAdmin();
    if (!process.env.ANTHROPIC_API_KEY) return { success: false, error: 'AI assist is not configured.' };
    const db = getAdminClient();
    const [{ data: b }, { data: about }] = await Promise.all([
      db.from('bookings').select('*').eq('id', bookingId).maybeSingle(),
      db.from('about_content').select('*').limit(1).maybeSingle(),
    ]);
    if (!b) return { success: false, error: 'Booking not found' };
    const settings = settingsFromRow((about as Record<string, unknown> | null) ?? null);
    const clientLang = b.lang === 'uk' ? 'Ukrainian' : b.lang === 'es' ? 'Spanish' : 'English';
    const when = b.preferred_at ? formatDateTime(new Date(b.preferred_at), 'en', settings.timezone) : 'no date chosen';

    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 1200,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low' },
      system:
        'You help a solo skin esthetician (Yanina, Skin Beauty studio in Rochester, NY) triage booking requests. ' +
        'Be warm, brief and professional. Never invent prices, availability or medical advice. ' +
        'Reply with JSON only: {"summary": string, "draft": string}. ' +
        `"summary" is one sentence (max 25 words) in ${adminLang === 'uk' ? 'Ukrainian' : 'English'} describing what the client wants and anything the esthetician must decide. ` +
        `"draft" is a short text message reply (max 60 words) written in ${clientLang}, addressed to the client by first name, acknowledging the request and asking any needed clarifying question; do not confirm a time unless the request is unambiguous. Use plain sentences and no dashes.`,
      messages: [
        {
          role: 'user',
          content: [
            `Client name: ${b.name}`,
            `Service: ${b.service || 'not specified'}${b.price ? ` (${b.price})` : ''}`,
            `Preferred time: ${when}`,
            `Contact method: ${b.method || 'sms'}`,
            `Status: ${b.status || 'new'}`,
            `Message from client: ${b.details || '(none)'}`,
          ].join('\n'),
        },
      ],
    });
    if (response.stop_reason === 'refusal') return { success: false, error: 'The assistant declined this request.' };
    const text = response.content
      .filter((c): c is Anthropic.Beta.BetaTextBlock => c.type === 'text')
      .map((c) => c.text)
      .join('')
      .trim();
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return { success: false, error: 'No draft returned' };
    const parsed = JSON.parse(json) as { summary?: string; draft?: string };
    return { success: true, summary: String(parsed.summary || ''), draft: String(parsed.draft || '') };
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return { success: false, error: 'AI is busy, try again in a minute.' };
    if (err instanceof Anthropic.AuthenticationError) return { success: false, error: 'AI key is invalid.' };
    console.error('aiAssistBooking:', err);
    return { success: false, error: errorMessage(err) };
  }
}
