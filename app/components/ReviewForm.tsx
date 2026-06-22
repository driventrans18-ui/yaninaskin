'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { compressImage } from '@/lib/compressImage';
import ImageLightbox from './ImageLightbox';
import { submitReview, getApprovedReviews } from '../actions/reviews';

type Review = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
  reply_text?: string | null;
  reply_by?: string | null;
  photos?: string[] | null;
  photo_url?: string | null; // legacy single-photo reviews
};

const MAX_PHOTOS = 5;

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
  const [sortBy, setSortBy]       = useState('newest');
  const [reviews, setReviews]     = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightbox, setLightbox]   = useState<string | null>(null);

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
    setError('');
    setIsUploading(true);
    try {
      const room = MAX_PHOTOS - photos.length;
      for (const file of files.slice(0, room)) {
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
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (url: string) =>
    setPhotos((prev) => prev.filter((p) => p !== url));

  const submit = async () => {
    if (!name.trim() || !rating || !text.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitReview(name.trim(), rating, text.trim(), photos);

      if (result.success) {
        setSubmitted(true);
        setName(''); setRating(0); setText(''); setPhotos([]);
        loadReviews();
        setTimeout(() => { setSubmitted(false); setShowForm(false); }, 3000);
      } else {
        setError(result.error || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
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
    return 0;
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
                <label className="block uppercase tracking-widest mb-2 text-[var(--surface-inverted-subtle)] text-[0.5rem]">
                  {tr.nameLabel}
                </label>
                <Input
                  variant="inverted"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={tr.namePlaceholder}
                />
              </div>

              {/* Star rating */}
              <div className="mb-4">
                <label className="block uppercase tracking-widest mb-3 text-[var(--surface-inverted-subtle)] text-[0.5rem]">
                  {tr.ratingLabel}
                </label>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      onMouseEnter={() => setHovered(val)}
                      onMouseLeave={() => setHovered(0)}
                      className={cn(
                        "transition-all duration-[var(--duration-fast)] select-none text-accent",
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
              </div>

              {/* Review text */}
              <div className="mb-5">
                <label className="block uppercase tracking-widest mb-2 text-[var(--surface-inverted-subtle)] text-[0.5rem]">
                  {tr.reviewLabel}
                </label>
                <Textarea
                  variant="inverted"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={tr.reviewPlaceholder}
                  rows={4}
                />
              </div>

              {/* Optional experience photos — like Google reviews */}
              <div className="mb-5">
                <label className="block uppercase tracking-widest mb-2 text-[var(--surface-inverted-subtle)] text-[0.5rem]">
                  {tr.photoLabel}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {photos.map((url) => (
                    <div key={url} className="relative">
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
                        accept="image/*"
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
              </div>

              {/* Submit */}
              <Button
                onClick={submit}
                disabled={!name.trim() || !rating || !text.trim() || isSubmitting || isUploading}
                variant="accent"
                size="pill"
                className="w-full"
              >
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
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setShowAll(v => !v)}
            className="w-full py-3 text-xs uppercase tracking-widest transition-all rounded-full border border-[var(--surface-inverted-border)] text-[var(--surface-inverted-muted)]"
          >
            {showAll ? tr.hideAll : tr.showAll}
          </button>

          {showAll && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[var(--surface-inverted-subtle)]">
                  {tr.reviewCount(reviews.length)}
                </span>
                {reviews.length > 0 && (
                  <Select
                    variant="inverted"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="newest">{tr.sortNewest}</option>
                    <option value="oldest">{tr.sortOldest}</option>
                    <option value="highest">{tr.sortHighest}</option>
                    <option value="lowest">{tr.sortLowest}</option>
                  </Select>
                )}
              </div>

              {isLoading ? (
                <p className="text-center py-8 text-sm text-[var(--surface-inverted-subtle)]">
                  Loading reviews...
                </p>
              ) : sorted.length === 0 ? (
                <p className="text-center py-8 text-sm text-[var(--surface-inverted-subtle)]">
                  {tr.firstReview}
                </p>
              ) : (
                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                  {sorted.map(r => (
                    <Card key={r.id} variant="inverted" className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 bg-accent/30">
                          {r.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{r.name}</p>
                          <p className="text-xs text-[var(--surface-inverted-subtle)]">
                            {new Date(r.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'uk' ? 'uk-UA' : 'es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex gap-0.5 text-accent">
                          {[1, 2, 3, 4, 5].map(val => (
                            <StarIcon key={val} filled={val <= r.rating} className="w-3 h-3" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-[var(--surface-inverted-muted)] mb-3">{r.comment}</p>

                      {(() => {
                        const imgs = (r.photos && r.photos.length
                          ? r.photos
                          : r.photo_url
                          ? [r.photo_url]
                          : []) as string[];
                        if (imgs.length === 0) return null;
                        return (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {imgs.map((url) => (
                              <button
                                key={url}
                                type="button"
                                onClick={() => setLightbox(url)}
                                className="block"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={url}
                                  alt=""
                                  loading="lazy"
                                  className="h-20 w-20 rounded-lg object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        );
                      })()}

                      {r.reply_text && (
                        <div className="bg-white/10 rounded-lg p-3 text-xs">
                          <p className="font-medium text-white/90 mb-1">Response from {r.reply_by || 'Admin'}</p>
                          <p className="text-white/75">{r.reply_text}</p>
                        </div>
                      )}
                    </Card>
                  ))}
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
