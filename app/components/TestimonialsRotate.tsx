'use client';

import React, { useEffect, useState } from 'react';
import { ReviewCard } from '@/components/ui/card-1';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import { getApprovedReviews } from '../actions/reviews';

type Review = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
  photos?: string[] | null;
  photo_url?: string | null;
};

// Curated Unsplash portraits used as deterministic fallback avatars when a
// review doesn't include a photo. These URLs are stable Unsplash CDN links.
const FALLBACK_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&auto=format&fit=crop&q=60',
];

const pickAvatar = (seed: number | string) => {
  const n =
    typeof seed === 'number'
      ? seed
      : Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  return FALLBACK_AVATARS[Math.abs(n) % FALLBACK_AVATARS.length];
};

export default function TestimonialsRotate() {
  const { lang } = useLanguage();
  const tr = t[lang].testimonials;
  const handleLabel = t[lang].reviews.eyebrow;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getApprovedReviews();
      if (cancelled) return;
      if (result.success) setReviews(result.data);
      setLoaded(true);
    })();
    return () => {
      cancelled = false;
    };
  }, []);

  const cards =
    reviews.length > 0
      ? reviews.slice(0, 6).map((r) => ({
          key: `r-${r.id}`,
          name: r.name,
          handle: handleLabel,
          review: r.comment,
          rating: r.rating,
          imageUrl:
            (r.photos && r.photos[0]) || r.photo_url || pickAvatar(r.id),
        }))
      : tr.items.map((item, i) => ({
          key: `t-${i}`,
          name: item.name,
          handle: handleLabel,
          review: item.text,
          rating: 5,
          imageUrl: pickAvatar(item.name),
        }));

  return (
    <section
      id="testimonials"
      className="px-6 py-24 bg-background scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">{tr.eyebrow}</p>
          <h2 className="mb-4">
            {tr.heading} <em>{tr.headingEm}</em>
          </h2>
        </div>

        {!loaded ? (
          <div
            aria-hidden
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-items-center"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-full max-w-md h-44 rounded-xl border bg-card/50 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
            {cards.map((c) => (
              <ReviewCard
                key={c.key}
                name={c.name}
                handle={c.handle}
                review={c.review}
                rating={c.rating}
                imageUrl={c.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
