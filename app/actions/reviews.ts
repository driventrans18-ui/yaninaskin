'use server';

import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/requireAdmin';
import type { Review } from '@/lib/reviews';
import { isSchemaError, errorMessage } from '@/lib/dbErrors';
import { settingsFromRow } from '@/lib/booking/settings';
import { sendOwnerEmail } from './notify';
import { siteConfig } from '@/lib/siteConfig';

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Whether the owner requires manual approval before a review is published.
// Defaults to false (auto-publish) if the setting/column isn't present.
async function requiresReviewApproval(): Promise<boolean> {
  try {
    const { data } = await adminClient
      .from('about_content')
      .select('require_review_approval')
      .limit(1)
      .single();
    return Boolean(data?.require_review_approval);
  } catch {
    return false;
  }
}

export async function submitReview(
  name: string,
  rating: number,
  comment: string,
  photos?: string[] | null
) {
  try {
    // Auto-publish unless the owner turned on moderation in Settings.
    const approved = !(await requiresReviewApproval());
    const { error } = await anonClient
      .from('reviews')
      .insert([
        {
          name,
          rating,
          comment,
          photos: photos && photos.length ? photos : [],
          approved,
        },
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }

    await notifyOwnerOfReview({ name, rating, comment, approved });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit review';
    console.error('Error submitting review:', error);
    return { success: false, error: message };
  }
}

// Public columns only — reviewer emails must never reach the browser.
const PUBLIC_REVIEW_COLUMNS = 'id, name, rating, comment, created_at, reply_text, reply_by, photos, photo_url, likes, service';

export async function getApprovedReviews() {
  try {
    const first = await anonClient
      .from('reviews')
      .select(PUBLIC_REVIEW_COLUMNS)
      .eq('approved', true)
      .eq('hidden', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    let rows: Review[] | null = first.data as unknown as Review[] | null;
    let error = first.error;
    if (error) {
      // Pre-migration schema: fall back to the legacy filter.
      const legacy = await anonClient
        .from('reviews')
        .select('id, name, rating, comment, created_at, reply_text, reply_by, photos, photo_url, likes')
        .eq('approved', true)
        .order('created_at', { ascending: false });
      rows = legacy.data as unknown as Review[] | null;
      error = legacy.error;
    }
    if (error) throw error;

    return { success: true, data: rows || [] };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { success: false, data: [] };
  }
}

export async function getAllReviews() {
  try {
    await requireAdmin();
    const { data, error } = await adminClient
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return { success: false, data: [] };
  }
}

export async function approveReview(id: number) {
  try {
    await requireAdmin();
    const { error } = await adminClient
      .from('reviews')
      .update({ approved: true })
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error approving review:', error);
    return { success: false };
  }
}

export async function deleteReview(id: number) {
  try {
    await requireAdmin();
    const { error } = await adminClient
      .from('reviews')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false };
  }
}

// Delete a single photo from a review — removes the file from storage (to free
// space) and drops the URL from the review's photos array.
export async function deleteReviewPhoto(id: number, url: string) {
  try {
    await requireAdmin();
    // Best-effort storage removal: derive the in-bucket path from the public URL.
    const marker = '/about-photos/';
    const idx = url.indexOf(marker);
    if (idx >= 0) {
      const path = url.slice(idx + marker.length);
      await adminClient.storage.from('about-photos').remove([path]);
    }

    const { data, error } = await adminClient
      .from('reviews')
      .select('photos, photo_url')
      .eq('id', id)
      .single();
    if (error) throw error;

    const photos: string[] = Array.isArray(data?.photos) ? data.photos : [];
    const update: Record<string, any> = {
      photos: photos.filter((p) => p !== url),
    };
    if (data?.photo_url === url) update.photo_url = null;

    const { error: upErr } = await adminClient
      .from('reviews')
      .update(update)
      .eq('id', id);
    if (upErr) throw upErr;

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete photo';
    console.error('Error deleting review photo:', error);
    return { success: false, error: message };
  }
}

export async function likeReview(id: number) {
  try {
    const { data, error } = await anonClient.rpc('increment_review_likes', {
      review_id: id,
    });
    if (error) throw error;
    return { success: true, likes: (data as number) ?? null };
  } catch (error) {
    console.error('Error liking review:', error);
    return { success: false, likes: null };
  }
}

export async function addReply(id: number, reply_text: string, reply_by: string = 'Yanina') {
  try {
    await requireAdmin();
    const { error } = await adminClient
      .from('reviews')
      .update({ reply_text, reply_by })
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error adding reply:', error);
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// Admin moderation (added with the 2026-09 redesign)
// ---------------------------------------------------------------------------

export interface AdminReview {
  id: number;
  name: string;
  email: string | null;
  rating: number;
  comment: string;
  approved: boolean;
  hidden?: boolean | null;
  service?: string | null;
  reply_text: string | null;
  reply_by: string | null;
  photos: string[] | null;
  photo_url: string | null;
  likes: number | null;
  created_at: string;
  deleted_at?: string | null;
}

type Result = { success: true } | { success: false; error: string; schemaOutdated?: boolean };

export async function getReviewsAdmin(opts: { trashed?: boolean } = {}): Promise<{ success: boolean; data: AdminReview[]; featured: string[]; schemaOutdated: boolean; error?: string }> {
  try {
    await requireAdmin();
    const about = await adminClient.from('about_content').select('featured_reviews').limit(1).maybeSingle();
    const featured = Array.isArray(about.data?.featured_reviews) ? (about.data.featured_reviews as string[]) : [];
    const base = adminClient.from('reviews').select('*').order('created_at', { ascending: false });
    const q = opts.trashed ? base.not('deleted_at', 'is', null) : base.is('deleted_at', null);
    const { data, error } = await q;
    if (error) {
      if (!isSchemaError(error)) throw error;
      if (opts.trashed) return { success: true, data: [], featured, schemaOutdated: true };
      const legacy = await adminClient.from('reviews').select('*').order('created_at', { ascending: false });
      if (legacy.error) throw legacy.error;
      return { success: true, data: (legacy.data || []) as AdminReview[], featured, schemaOutdated: true };
    }
    return { success: true, data: (data || []) as AdminReview[], featured, schemaOutdated: false };
  } catch (err) {
    console.error('getReviewsAdmin:', err);
    return { success: false, data: [], featured: [], schemaOutdated: isSchemaError(err), error: errorMessage(err) };
  }
}

// Publish / hide. Publishing also un-hides; hiding keeps `approved` so the
// review can be shown again later without re-moderation.
export async function setReviewVisibility(id: number, state: 'published' | 'hidden' | 'pending'): Promise<Result> {
  try {
    await requireAdmin();
    const update = state === 'published' ? { approved: true, hidden: false } : state === 'hidden' ? { hidden: true } : { approved: false, hidden: false };
    const { error } = await adminClient.from('reviews').update(update).eq('id', id);
    if (error) {
      if (!isSchemaError(error)) throw error;
      // Pre-migration: only `approved` exists.
      const { error: e2 } = await adminClient.from('reviews').update({ approved: state === 'published' }).eq('id', id);
      if (e2) throw e2;
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

export async function setReviewService(id: number, service: string | null): Promise<Result> {
  try {
    await requireAdmin();
    const { error } = await adminClient.from('reviews').update({ service: service?.trim() || null }).eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

export async function trashReviews(ids: number[]): Promise<Result> {
  try {
    await requireAdmin();
    if (!ids.length) return { success: true };
    const { error } = await adminClient.from('reviews').update({ deleted_at: new Date().toISOString() }).in('id', ids);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

export async function restoreReviews(ids: number[]): Promise<Result> {
  try {
    await requireAdmin();
    if (!ids.length) return { success: true };
    const { error } = await adminClient.from('reviews').update({ deleted_at: null }).in('id', ids);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err), schemaOutdated: isSchemaError(err) };
  }
}

export async function purgeReviews(ids: number[]): Promise<Result> {
  try {
    await requireAdmin();
    if (!ids.length) return { success: true };
    const { error } = await adminClient.from('reviews').delete().in('id', ids);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

// Featured reviews for the homepage rotator (ordered ids like "review:12").
const MAX_FEATURED_REVIEWS = 6;
export async function setFeaturedReviews(ids: string[]): Promise<Result> {
  try {
    await requireAdmin();
    const clean = ids.filter((x) => /^(review|sample):\d+$/.test(x)).slice(0, MAX_FEATURED_REVIEWS);
    const { data } = await adminClient.from('about_content').select('id').limit(1).maybeSingle();
    if (!data?.id) return { success: false, error: 'No settings row' };
    const { error } = await adminClient.from('about_content').update({ featured_reviews: clean }).eq('id', data.id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

// Email the owner about a new review (respects Settings → Notifications).
export async function notifyOwnerOfReview(review: { name: string; rating: number; comment: string; approved: boolean }) {
  try {
    const { data } = await adminClient.from('about_content').select('*').limit(1).maybeSingle();
    const settings = settingsFromRow((data as Record<string, unknown> | null) ?? null);
    const to = settings.notificationPrefs?.email?.trim() || settings.email;
    if (settings.notificationPrefs.new_review_email === false || !to) return;
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    await sendOwnerEmail(
      to,
      `New ${review.rating}-star review from ${review.name}${review.approved ? '' : ' (waiting for approval)'}`,
      `<h2 style="font-family:Georgia,serif;font-weight:500">New review</h2>
       <p style="font-family:sans-serif"><strong>${esc(review.name)}</strong> · <span style="color:#b08968">${stars}</span></p>
       <p style="font-family:sans-serif;white-space:pre-wrap;border-left:3px solid #d4b0a6;padding-left:12px">${esc(review.comment)}</p>
       <p style="font-family:sans-serif"><a href="${siteConfig.url}/admin/reviews" style="background:#2b2724;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">${review.approved ? 'Open reviews' : 'Moderate now'}</a></p>`,
    );
  } catch (err) {
    console.error('notifyOwnerOfReview:', err);
  }
}
