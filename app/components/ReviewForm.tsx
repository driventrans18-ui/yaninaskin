'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { compressImage } from '@/lib/compressImage';
import { relativeTime } from '@/lib/relativeTime';
import {
  type Review,
  type ReviewErrorKey,
  NAME_MAX,
  REVIEW_MAX,
  MAX_PHOTOS,
  MAX_IMAGE_BYTES,
  ALLOWED_IMAGE_TYPES,
  READ_MORE_THRESHOLD,
  validateName,
  validateReview,
  validateRating,
} from '@/lib/reviews';
import ImageLightbox from './ImageLightbox';
import { submitReview, getApprovedReviews, likeReview } from '../actions/reviews';

const LIKED_STORAGE_KEY = 'yns:liked-reviews';

const AVATAR_GRADIENTS = [
  'from-rose-300 to-amber-200',
  'from-amber-200 to-orange-300',
  'from-stone-300 to-rose-200',
  'from-pink-200 to-rose-300',
  'from-orange-200 to-amber-300',
  'from-amber-300 to-rose-200',
];

const pickGradient = (seed: string) => {
  const n = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[n % AVATAR_GRADIENTS.length];
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?';

const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-90"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const StarIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    />
  </svg>
);

const HeartIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={1.75}
    className={cn('transition-transform', filled && 'scale-110', className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
    />
  </svg>
);

export default function ReviewForm() {
  const { lang } = useLanguage();
  const tr = t[lang].reviews;

  const RATING_LABELS = tr.emojiLabels;

  const [showForm, setShowForm]   = useState(false);
  const [name, setName]           = useState('');
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [text, setText]           = useState('');
  const [photos, setPhotos]       = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');
  const [showAll, setShowAll]     = useState(false);
  const [sortBy, setSortBy]       = useState<'relevant' | 'newest' | 'oldest' | 'highest' | 'lowest'>('relevant');
  const [reviews, setReviews]     = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightbox, setLightbox]   = useState<string | null>(null);
  const [likedIds, setLikedIds]   = useState<Set<number>>(new Set());
  const [expanded, setExpanded]   = useState<Set<number>>(new Set());
  const [touched, setTouched]     = useState({ name: false, rating: false, text: false });
  const [attempted, setAttempted] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // Live field validation (translation keys -> localized copy).
  const nameErrorKey   = validateName(name);
  const ratingErrorKey = validateRating(rating);
  const textErrorKey   = validateReview(text);
  const isValid = !nameErrorKey && !ratingErrorKey && !textErrorKey;

  const errorText = (key: ReviewErrorKey | null) =>
    key ? (tr[key] as string) : '';

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LIKED_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as number[];
        if (Array.isArray(parsed)) setLikedIds(new Set(parsed));
      }
    } catch {
      // ignore — localStorage may be unavailable
    }
  }, []);

  const persistLiked = (next: Set<number>) => {
    try {
      window.localStorage.setItem(
        LIKED_STORAGE_KEY,
        JSON.stringify(Array.from(next)),
      );
    } catch {
      // ignore
    }
  };

  const handleLike = async (id: number) => {
    if (likedIds.has(id)) return;
    // Optimistic update
    const next = new Set(likedIds);
    next.add(id);
    setLikedIds(next);
    persistLiked(next);
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, likes: (r.likes ?? 0) + 1 } : r,
      ),
    );
    const result = await likeReview(id);
    if (!result.success) {
      // revert on failure
      const revert = new Set(likedIds);
      setLikedIds(revert);
      persistLiked(revert);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, likes: Math.max(0, (r.likes ?? 1) - 1) }
            : r,
        ),
      );
    } else if (result.likes != null) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, likes: result.likes! } : r)),
      );
    }
  };

  const toggleExpanded = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    const result = await getApprovedReviews();
    if (result.success) {
      setReviews(result.data);
    }
    setIsLoading(false);
  };

  // Optional experience photos — compress each, then upload through the public
  // /api/upload route (which uses the service-role key server-side).
  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow re-selecting the same file(s)
    if (files.length === 0) return;
    setPhotoError('');

    const room = MAX_PHOTOS - photos.length;
    // Reject too many up front so the user knows nothing was dropped silently.
    if (files.length > room) {
      setPhotoError(tr.imageTooMany);
    }
    const candidates = files.slice(0, room);

    // Validate type + original size before any (lossy) compression.
    const valid: File[] = [];
    for (const file of candidates) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
        setPhotoError(tr.imageBadType);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setPhotoError(tr.imageTooLarge);
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of valid) {
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.append('file', compressed);
        formData.append('folder', 'review-photos');
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        setPhotos((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (url: string) =>
    setPhotos((prev) => prev.filter((p) => p !== url));

  const submit = async () => {
    setAttempted(true);
    if (!isValid) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitReview(name.trim(), rating, text.trim(), photos);

      if (result.success) {
        setSubmitted(true);
        setName(''); setRating(0); setText(''); setPhotos([]);
        setTouched({ name: false, rating: false, text: false });
        setAttempted(false);
        loadReviews();
        setTimeout(() => { setSubmitted(false); setShowForm(false); }, 3000);
      } else {
        setError(result.error || 'Failed to submit review. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const active = hovered || rating;

  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === 'newest')  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'oldest')  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest')  return a.rating - b.rating;
    // 'relevant' — likes desc, then rating desc, then newest
    const likeDiff = (b.likes ?? 0) - (a.likes ?? 0);
    if (likeDiff !== 0) return likeDiff;
    const ratingDiff = b.rating - a.rating;
    if (ratingDiff !== 0) return ratingDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <section id="reviews" className="px-6 py-24 scroll-mt-20 bg-[var(--surface-inverted)] text-[var(--surface-inverted-foreground)]">
      <div className="mx-auto max-w-5xl">

        {/* Heading */}
        <div className="text-center mb-10">
          <p className="eyebrow mb-3">{tr.eyebrow}</p>
          <h2 className="mb-4">
            {tr.heading} <em>{tr.headingEm}</em>
          </h2>
          <p className="text-sm mb-8 text-[var(--surface-inverted-muted)]">
            {tr.subheading}
          </p>

          {/* Toggle button */}
          <Button
            onClick={() => setShowForm(v => !v)}
            variant={showForm ? 'outline' : 'accent'}
            size="pill"
            className={cn(
              showForm && 'border-[var(--surface-inverted-border)] bg-[var(--surface-inverted-elevated)] text-[var(--surface-inverted-muted)] hover:bg-[var(--surface-inverted-elevated)] hover:text-[var(--surface-inverted-foreground)]'
            )}
          >
            {showForm ? tr.hideAll.replace('Reviews', 'Form') : tr.heading + ' ' + tr.headingEm}
            <span
              className="inline-block transition-transform duration-[var(--duration-normal)]"
              style={{ transform: showForm ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ↓
            </span>
          </Button>
        </div>

        {/* Collapsible form */}
        <div
          className="grid transition-all duration-[var(--duration-slow)]"
          style={{ gridTemplateRows: showForm ? '1fr' : '0fr', opacity: showForm ? 1 : 0 }}
        >
          <div className="overflow-hidden">
            <div className="max-w-lg mx-auto rounded-2xl p-8 mb-6 border border-[var(--surface-inverted-border)]">
              <p className="text-sm font-medium mb-1">{tr.formTitle}</p>
              <p className="text-xs mb-6 text-[var(--surface-inverted-subtle)]">
                {tr.formSubtitle}
              </p>

              {/* Name */}
              <div className="mb-4">
                <label htmlFor="review-name" className="block uppercase tracking-widest mb-2 text-[var(--surface-inverted-subtle)] text-[0.5rem]">
                  {tr.nameLabel}
                </label>
                <Input
                  id="review-name"
                  variant="inverted"
                  value={name}
                  maxLength={NAME_MAX}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => setTouched(s => ({ ...s, name: true }))}
                  placeholder={tr.namePlaceholder}
                  aria-invalid={(touched.name || attempted) && !!nameErrorKey}
                  aria-describedby="review-name-error"
                />
                {(touched.name || attempted) && nameErrorKey && (
                  <p id="review-name-error" className="mt-1.5 text-xs text-red-400">
                    {errorText(nameErrorKey)}
                  </p>
                )}
              </div>

              {/* Star rating */}
              <div className="mb-4">
                <label className="block uppercase tracking-widest mb-3 text-[var(--surface-inverted-subtle)] text-[0.5rem]">
                  {tr.ratingLabel}
                </label>
                <div className="flex gap-2 mb-2" role="radiogroup" aria-label={tr.ratingLabel}>
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      role="radio"
                      aria-checked={rating === val}
                      onClick={() => { setRating(val); setTouched(s => ({ ...s, rating: true })); }}
                      onMouseEnter={() => setHovered(val)}
                      onMouseLeave={() => setHovered(0)}
                      className={cn(
                        "transition-all duration-[var(--duration-fast)] select-none text-accent rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        val <= active ? 'opacity-100 scale-110' : 'opacity-30 scale-100'
                      )}
                      aria-label={RATING_LABELS[val - 1]}
                    >
                      <StarIcon filled={val <= active} className="w-8 h-8" />
                    </button>
                  ))}
                </div>
                <p className="text-xs h-4 transition-all text-accent">
                  {active > 0 ? RATING_LABELS[active - 1] : ''}
                </p>
                {(touched.rating || attempted) && ratingErrorKey && (
                  <p className="mt-1 text-xs text-red-400">{errorText(ratingErrorKey)}</p>
                )}
              </div>

              {/* Review text */}
              <div className="mb-5">
                <label htmlFor="review-text" className="block uppercase tracking-widest mb-2 text-[var(--surface-inverted-subtle)] text-[0.5rem]">
                  {tr.reviewLabel}
                </label>
                <Textarea
                  id="review-text"
                  variant="inverted"
                  value={text}
                  maxLength={REVIEW_MAX}
                  onChange={e => setText(e.target.value)}
                  onBlur={() => setTouched(s => ({ ...s, text: true }))}
                  placeholder={tr.reviewPlaceholder}
                  rows={4}
                  aria-invalid={(touched.text || attempted) && !!textErrorKey}
                  aria-describedby="review-text-error review-text-count"
                />
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  <p id="review-text-error" className="text-xs text-red-400">
                    {(touched.text || attempted) && textErrorKey ? errorText(textErrorKey) : ''}
                  </p>
                  <p
                    id="review-text-count"
                    className={cn(
                      'shrink-0 text-xs tabular-nums',
                      text.trim().length > REVIEW_MAX
                        ? 'text-red-400'
                        : text.trim().length > REVIEW_MAX * 0.9
                        ? 'text-amber-400'
                        : 'text-[var(--surface-inverted-subtle)]'
                    )}
                  >
                    {tr.charCount(text.trim().length, REVIEW_MAX)}
                  </p>
                </div>
              </div>

              {/* Optional experience photos — like Google reviews */}
              <div className="mb-5">
                <label className="block uppercase tracking-widest mb-2 text-[var(--surface-inverted-subtle)] text-[0.5rem]">
                  {tr.photoLabel}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {photos.map((url) => (
                    <div key={url} className="relative animate-in fade-in duration-[var(--duration-normal)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-16 w-16 rounded-lg object-cover border border-[var(--surface-inverted-border)]"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(url)}
                        aria-label="Remove photo"
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs leading-none text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <label
                      className={cn(
                        'inline-flex h-16 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[var(--surface-inverted-border)] px-4 text-xs text-[var(--surface-inverted-muted)] transition-colors hover:text-[var(--surface-inverted-foreground)]',
                        isUploading && 'pointer-events-none opacity-60'
                      )}
                    >
                      {isUploading ? '…' : tr.photoUpload}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handlePhotos}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="mt-2 text-[0.65rem] text-[var(--surface-inverted-subtle)]">
                  {tr.photoHint}
                </p>
                {photoError && (
                  <p className="mt-1.5 text-xs text-red-400">{photoError}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                onClick={submit}
                disabled={!isValid || isSubmitting || isUploading}
                variant="accent"
                size="pill"
                className="w-full"
              >
                {isSubmitting && <Spinner className="w-4 h-4" />}
                {isSubmitting ? 'Submitting...' : tr.submit}
              </Button>

              {error && (
                <p className="text-center mt-4 text-sm text-red-400">
                  {error}
                </p>
              )}

              {submitted && (
                <p className="text-center mt-4 text-sm text-accent">
                  {tr.thankYou}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Read All Reviews toggle */}
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setShowAll(v => !v)}
            className="w-full py-3 text-xs uppercase tracking-widest transition-all rounded-full border border-[var(--surface-inverted-border)] text-[var(--surface-inverted-muted)] hover:text-[var(--surface-inverted-foreground)]"
          >
            {showAll ? tr.hideAll : tr.showAll}
          </button>

          {showAll && (
            <div className="mt-6">
              {/* Summary header: average + count + star distribution */}
              {reviews.length > 0 && (() => {
                const total = reviews.length;
                const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;
                const counts = [5, 4, 3, 2, 1].map(
                  star => reviews.filter(r => Math.round(r.rating) === star).length
                );
                return (
                  <div className="mb-6 pb-6 border-b border-[var(--surface-inverted-border)] grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
                    <div className="text-center sm:text-left">
                      <div className="text-5xl font-light leading-none tracking-tight">
                        {avg.toFixed(1)}
                      </div>
                      <div className="mt-2 flex justify-center sm:justify-start gap-0.5 text-accent">
                        {[1, 2, 3, 4, 5].map(val => (
                          <StarIcon key={val} filled={val <= Math.round(avg)} className="w-4 h-4" />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-[var(--surface-inverted-muted)]">
                        {tr.reviewCount(total)}
                      </p>
                    </div>

                    {/* Distribution bars (5★ → 1★) */}
                    <div className="flex flex-col gap-1.5">
                      {[5, 4, 3, 2, 1].map((star, i) => {
                        const count = counts[i];
                        const pct = total ? (count / total) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs text-[var(--surface-inverted-muted)] w-8 shrink-0 tabular-nums">
                              {star}
                              <StarIcon filled className="w-3 h-3 text-accent" />
                            </span>
                            <div className="h-2 flex-1 rounded-full bg-[var(--surface-inverted-border)] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-accent transition-[width] duration-[var(--duration-slow)]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-[var(--surface-inverted-subtle)] w-6 shrink-0 text-right tabular-nums">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Sort pills */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
                  {([
                    ['relevant', tr.sortMostRelevant],
                    ['newest',   tr.sortNewest],
                    ['highest',  tr.sortHighest],
                    ['lowest',   tr.sortLowest],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSortBy(key)}
                      className={cn(
                        'shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors border',
                        sortBy === key
                          ? 'bg-accent/30 border-accent/40 text-[var(--surface-inverted-foreground)]'
                          : 'border-[var(--surface-inverted-border)] text-[var(--surface-inverted-muted)] hover:text-[var(--surface-inverted-foreground)] hover:border-[var(--surface-inverted-border)]'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {isLoading ? (
                <p className="text-center py-8 text-sm text-[var(--surface-inverted-subtle)]">
                  Loading reviews...
                </p>
              ) : sorted.length === 0 ? (
                <p className="text-center py-8 text-sm text-[var(--surface-inverted-subtle)]">
                  {tr.firstReview}
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start">
                  {sorted.map(r => {
                    const initials = getInitials(r.name);
                    const gradient = pickGradient(r.name);
                    const imgs = (r.photos && r.photos.length
                      ? r.photos
                      : r.photo_url
                      ? [r.photo_url]
                      : []) as string[];
                    const isLong = r.comment.length > READ_MORE_THRESHOLD;
                    const isExpanded = expanded.has(r.id);
                    const displayText =
                      !isLong || isExpanded
                        ? r.comment
                        : r.comment.slice(0, READ_MORE_THRESHOLD).trimEnd() + '…';
                    const liked = likedIds.has(r.id);
                    const likeCount = r.likes ?? 0;

                    return (
                      <article
                        key={r.id}
                        className="rounded-2xl border border-[var(--surface-inverted-border)] bg-[var(--surface-inverted-elevated)] p-5 sm:p-6 transition-colors"
                      >
                        {/* Header */}
                        <header className="flex items-start gap-3 mb-3">
                          <div
                            aria-hidden
                            className={cn(
                              'shrink-0 w-11 h-11 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-semibold text-stone-900 shadow-inner',
                              gradient,
                            )}
                          >
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-[var(--surface-inverted-foreground)]">
                              {r.name}
                            </p>
                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                              <div className="flex gap-0.5 text-accent">
                                {[1, 2, 3, 4, 5].map(val => (
                                  <StarIcon key={val} filled={val <= r.rating} className="w-3.5 h-3.5" />
                                ))}
                              </div>
                              <span className="text-[var(--surface-inverted-subtle)] text-xs">·</span>
                              <p className="text-xs text-[var(--surface-inverted-subtle)]">
                                {relativeTime(r.created_at, lang)}
                              </p>
                            </div>
                          </div>
                        </header>

                        {/* Body */}
                        <p className="text-sm leading-relaxed text-[var(--surface-inverted-foreground)]/90 whitespace-pre-line">
                          {displayText}
                          {isLong && (
                            <>
                              {' '}
                              <button
                                type="button"
                                onClick={() => toggleExpanded(r.id)}
                                className="text-xs font-medium text-accent hover:underline align-baseline"
                              >
                                {isExpanded ? tr.readLess : tr.readMore}
                              </button>
                            </>
                          )}
                        </p>

                        {/* Photos */}
                        {imgs.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {imgs.map((url) => (
                              <button
                                key={url}
                                type="button"
                                onClick={() => setLightbox(url)}
                                className="block overflow-hidden rounded-xl"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={url}
                                  alt={`Photo from ${r.name}'s review`}
                                  loading="lazy"
                                  className="h-24 w-24 object-cover transition-transform hover:scale-105 animate-in fade-in duration-[var(--duration-normal)]"
                                />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Owner reply */}
                        {r.reply_text && (
                          <div className="mt-4 rounded-xl bg-white/[0.04] border border-[var(--surface-inverted-border)] p-4">
                            <p className="text-xs font-medium text-accent mb-1.5">
                              {(() => {
                                const who =
                                  !r.reply_by || r.reply_by.toLowerCase() === 'admin'
                                    ? 'Yanina'
                                    : r.reply_by;
                                return `${who}'s Reply`;
                              })()}
                            </p>
                            <p className="text-sm leading-relaxed text-[var(--surface-inverted-muted)]">
                              {r.reply_text}
                            </p>
                          </div>
                        )}

                        {/* Footer: like button */}
                        <footer className="mt-4 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleLike(r.id)}
                            disabled={liked}
                            aria-pressed={liked}
                            aria-label={tr.helpful}
                            className={cn(
                              'group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                              liked
                                ? 'border-accent/50 bg-accent/20 text-[var(--surface-inverted-foreground)]'
                                : 'border-[var(--surface-inverted-border)] text-[var(--surface-inverted-muted)] hover:text-[var(--surface-inverted-foreground)] hover:border-accent/40 hover:bg-accent/10 active:scale-95'
                            )}
                          >
                            <HeartIcon filled={liked} className="w-3.5 h-3.5" />
                            <span>{tr.helpful}</span>
                            {likeCount > 0 && (
                              <span
                                className={cn(
                                  'ml-0.5 tabular-nums',
                                  liked ? 'text-[var(--surface-inverted-foreground)]' : 'text-[var(--surface-inverted-subtle)]'
                                )}
                              >
                                · {likeCount}
                              </span>
                            )}
                          </button>
                        </footer>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {lightbox && (
        <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}
    </section>
  );
}
