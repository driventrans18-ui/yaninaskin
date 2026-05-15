'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function submitReview(
  name: string,
  rating: number,
  comment: string
) {
  try {
    const { error } = await supabase
      .from('reviews')
      .insert([
        {
          name,
          rating,
          comment,
          approved: false,
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { error } = await supabase
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
    const { error } = await supabase
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

export async function addReply(id: number, reply_text: string, reply_by: string = 'Admin') {
  try {
    const { error } = await supabase
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
