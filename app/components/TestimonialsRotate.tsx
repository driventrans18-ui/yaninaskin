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

// Turn a (possibly multi-paragraph) review into a single clean line for the
// rotator: collapse newlines / runs of spaces so the word-by-word animation
// doesn't show gaps, then truncate at a word boundary.
const QUOTE_MAX = 170;
const toQuote = (s: string) => {
  const clean = s.replace(/\s+/g, ' ').trim();
  if (clean.length <= QUOTE_MAX) return clean;
  const cut = clean.slice(0, QUOTE_MAX).replace(/\s+\S*$/, '');
  return (cut || clean.slice(0, QUOTE_MAX)) + '…';
};

export default function TestimonialsRotate({
  featured = [],
}: { featured?: string[] } = {}) {
  const { lang } = useLanguage();
  const tr = t[lang].testimonials;
  const reviewsT = t[lang].reviews;
  const servicesT = t[lang].services;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  // Whether to open the modal straight to the write form (Leave a review) or
  // to the read view (See all reviews).
  const [modalWrite, setModalWrite] = useState(false);

  const openModal = (write: boolean) => {
    setModalWrite(write);
    setModalOpen(true);
  };

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

  // The rotator shows the admin's "featured" picks (set in Settings). Each id is
  // "sample:N" (a built-in sample review) or "review:N" (a real approved one).
  // With nothing picked — the default — it shows the built-in samples.
  const samples = tr.items;
  const featuredList: { text: string; name: string }[] = (() => {
    if (featured.length > 0) {
      const out: { text: string; name: string }[] = [];
      for (const id of featured) {
        if (id.startsWith('sample:')) {
          const s = samples[Number(id.slice(7))];
          if (s) out.push({ text: s.text, name: s.name });
        } else if (id.startsWith('review:')) {
          const r = reviews.find((x) => x.id === Number(id.slice(7)));
          if (r && r.comment?.trim()) out.push({ text: toQuote(r.comment), name: r.name });
        }
      }
      if (out.length > 0) return out;
    }
    return samples.map((s) => ({ text: s.text, name: s.name }));
  })();

  const quotes = featuredList.map((f) => f.text);
  const names = featuredList.map((f) => f.name);

  const leaveLabel = `${reviewsT.heading} ${reviewsT.headingEm}`;

  return (
    <section id="reviews" className="px-6 py-24 bg-background scroll-mt-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-3">{tr.eyebrow}</p>
        <h2 className="mb-14">
          {tr.heading} <em>{tr.headingEm}</em>
        </h2>

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

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button variant="default" size="pill" onClick={() => openModal(true)}>
            {leaveLabel}
          </Button>
          <Button variant="outline" size="pill" onClick={() => openModal(false)}>
            {tr.seeAll}
          </Button>
        </div>
      </div>

      {modalOpen && (
        <ReviewsModal
          title={modalWrite ? leaveLabel : tr.seeAll}
          closeLabel={servicesT.brandsClose}
          formOnly={modalWrite}
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
