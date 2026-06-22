-- Adds a public "likes" counter to reviews + an atomic RPC for anonymous
-- visitors to increment it. Run this once against the yaninaskin Supabase
-- project (SQL editor → New query → paste → Run).

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS likes INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_review_likes(review_id BIGINT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.reviews
     SET likes = COALESCE(likes, 0) + 1
   WHERE id = review_id
     AND approved = TRUE
  RETURNING likes INTO new_count;
  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_review_likes(BIGINT)
  TO anon, authenticated;
