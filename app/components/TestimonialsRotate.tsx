'use client';

import React, { useEffect, useState } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { TextRotate } from '@/components/ui/text-rotate';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import { getApprovedReviews } from '../actions/reviews';
import type { Review } from '@/lib/reviews';
import ReviewsModal from './ReviewsModal';

// Keep rotator quotes short so the word-by-word animation stays compact.
const QUOTE_MAX = 200;
const truncate = (s: string) =>
  s.length > QUOTE_MAX ? s.slice(0, QUOTE_MAX).trimEnd() + '…' : s;

export default function TestimonialsRotate() {
  const { lang } = useLanguage();
  const tr = t[lang].testimonials;
  const reviewsT = t[lang].reviews;
  const servicesT = t[lang].services;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const loadReviews = async () => {
    const result = await getApprovedReviews();
    if (result.success) {
      setReviews(result.data);
      setActiveIndex(0);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Rotation pool: real approved reviews, strongest (4★+) first then newest,
  // truncated. No fake quotes — an empty pool shows the "be the first" invite.
  const pool = [...reviews]
    .filter((r) => r.comment && r.comment.trim().length > 0)
    .sort((a, b) => {
      const star = (b.rating >= 4 ? 1 : 0) - (a.rating >= 4 ? 1 : 0);
      if (star !== 0) return star;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 12);

  const hasReviews = pool.length > 0;
  const quotes = pool.map((r) => truncate(r.comment.trim()));
  const names = pool.map((r) => r.name);

  return (
    <section id="reviews" className="px-6 py-24 bg-background scroll-mt-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-3">{tr.eyebrow}</p>
        <h2 className="mb-14">
          {tr.heading} <em>{tr.headingEm}</em>
        </h2>

        {hasReviews ? (
          <LayoutGroup>
            {/* Opening quote mark */}
            <span
              className="block font-serif text-[5rem] leading-none mb-4 select-none text-accent/30"
              aria-hidden
            >
              &#8220;
            </span>

            <motion.div
              layout
              className="flex justify-center text-lg md:text-xl leading-relaxed text-muted-foreground px-4 md:px-8 min-h-[9rem] md:min-h-[8rem]"
            >
              <TextRotate
                // Re-initialise the rotator when the real data arrives.
                key={quotes.join('|')}
                texts={quotes}
                mainClassName="justify-center text-center"
                splitBy="words"
                staggerFrom="first"
                staggerDuration={0.01}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                rotationInterval={6000}
                onNext={(i) => setActiveIndex(i)}
              />
            </motion.div>

            {/* Closing quote mark */}
            <span
              className="block font-serif text-[5rem] leading-none mt-2 select-none text-accent/30"
              aria-hidden
            >
              &#8221;
            </span>

            <motion.p
              layout
              key={names[activeIndex] ?? activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="mt-4 text-sm font-medium tracking-wide"
            >
              — {names[activeIndex] ?? ''}
            </motion.p>
          </LayoutGroup>
        ) : (
          <p className="text-muted-foreground">{reviewsT.firstReview}</p>
        )}

        <div className="mt-10">
          <Button variant="outline" size="pill" onClick={() => setModalOpen(true)}>
            {tr.seeAll}
          </Button>
        </div>
      </div>

      {modalOpen && (
        <ReviewsModal
          title={tr.seeAll}
          closeLabel={servicesT.brandsClose}
          onClose={() => {
            setModalOpen(false);
            // A freshly submitted review may now be approved — refresh.
            loadReviews();
          }}
        />
      )}
    </section>
  );
}
