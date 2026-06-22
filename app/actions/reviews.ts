'use server';

import { createClient } from '@supabase/supabase-js';

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function submitReview(
  name: string,
  rating: number,
  comment: string,
  photos?: string[] | null
) {
  try {
    const { error } = await anonClient
      .from('reviews')
      .insert([
        {
          name,
          rating,
          comment,
          photos: photos && photos.length ? photos : [],
          approved: true,
        },
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit review';
    console.error('Error submitting review:', error);
    return { success: false, error: message };
  }
}

export async function getApprovedReviews() {
  try {
    const { data, error } = await anonClient
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { success: false, data: [] };
  }
}

export async function getAllReviews() {
  try {
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
    const { error } = await adminClient
      .from('reviews')
      .delete()
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

export async function addReply(id: number, reply_text: string, reply_by: string = 'Admin') {
  try {
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
