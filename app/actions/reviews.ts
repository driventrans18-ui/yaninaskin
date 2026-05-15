'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function submitReview(
  name: string,
  email: string,
  rating: number,
  comment: string
) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          name,
          email,
          rating,
          comment,
          approved: false,
        },
      ])
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error submitting review:', error);
    return { success: false, error: 'Failed to submit review' };
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
