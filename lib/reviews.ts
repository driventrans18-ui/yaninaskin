// Shared shape, constraints, and validators for client reviews.
// Used by the public review section (and safe to reuse in the admin panel).

export interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
  reply_text?: string | null;
  reply_by?: string | null;
  photos?: string[] | null;
  photo_url?: string | null; // legacy single-photo reviews
  likes?: number | null;
}

// Submission constraints
export const NAME_MAX = 60;
export const REVIEW_MIN = 10;
export const REVIEW_MAX = 1000;
export const MAX_PHOTOS = 4;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB each
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

// How long a comment can be before the card truncates it with "Read more".
export const READ_MORE_THRESHOLD = 280;

// Validators return a translation key (mapped to localized copy by the UI) or
// null when the value is valid. Names mirror keys in translations `reviews`.
export type ReviewErrorKey =
  | 'nameRequired'
  | 'nameTooLong'
  | 'reviewRequired'
  | 'reviewTooShort'
  | 'reviewTooLong'
  | 'ratingRequired';

export function validateName(name: string): ReviewErrorKey | null {
  const trimmed = name.trim();
  if (!trimmed) return 'nameRequired';
  if (trimmed.length > NAME_MAX) return 'nameTooLong';
  return null;
}

export function validateReview(text: string): ReviewErrorKey | null {
  const trimmed = text.trim();
  if (!trimmed) return 'reviewRequired';
  if (trimmed.length < REVIEW_MIN) return 'reviewTooShort';
  if (trimmed.length > REVIEW_MAX) return 'reviewTooLong';
  return null;
}

export function validateRating(rating: number): ReviewErrorKey | null {
  if (!rating || rating < 1) return 'ratingRequired';
  return null;
}
