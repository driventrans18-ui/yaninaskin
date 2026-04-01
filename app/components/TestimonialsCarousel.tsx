'use client';

import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Sarah M.',
    initials: 'SM',
    text: 'My skin has never looked better. Dr. Menaker really listened to my concerns and created a treatment plan that actually worked. I saw results after just two sessions.',
  },
  {
    name: 'Priya K.',
    initials: 'PK',
    text: 'The microneedling series completely transformed my skin texture and faded my acne scars. I\'m obsessed with my results and won\'t go anywhere else.',
  },
  {
    name: 'Jessica R.',
    initials: 'JR',
    text: 'Such a calming, professional experience from start to finish. I leave every single appointment glowing. Highly, highly recommend.',
  },
];

export default function TestimonialsCarousel() {
  const [active, setActive]     = useState(0);
  const [fading, setFading]     = useState(false);
  const touchStartX             = useRef(0);
  const autoRef                 = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (i: number) => {
    setFading(true);
    setTimeout(() => { setActive(i); setFading(false); }, 250);
  };

  const next = () => goTo((active + 1) % DEFAULT_TESTIMONIALS.length);
  const prev = () => goTo((active - 1 + DEFAULT_TESTIMONIALS.length) % DEFAULT_TESTIMONIALS.length);

  // Auto-rotate every 5 s
  const resetAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(next, 5000);
  };

  useEffect(() => {
    resetAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [active]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      resetAuto();
      diff > 0 ? next() : prev();
    }
  };

  const t = DEFAULT_TESTIMONIALS[active];

  return (
    <section id="testimonials" className="px-6 py-24 bg-background scroll-mt-20">
      <div className="mx-auto max-w-3xl text-center">

        {/* Heading */}
        <p className="mb-3 text-xs uppercase tracking-widest text-accent">Kind Words</p>
        <h2 className="mb-14 font-serif text-4xl md:text-5xl font-medium">
          What Clients <em>Say</em>
        </h2>

        {/* Quote */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="select-none"
        >
          <div
            className="relative transition-opacity duration-250"
            style={{ opacity: fading ? 0 : 1 }}
          >
            {/* Opening quote mark */}
            <span
              className="block font-serif leading-none mb-2 select-none"
              style={{ fontSize: '5rem', color: 'hsl(14 30% 74% / 0.3)', lineHeight: 1 }}
              aria-hidden
            >
              &#8220;
            </span>

            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground px-4 md:px-8 mb-4">
              {t.text}
            </p>

            {/* Closing quote mark */}
            <span
              className="block font-serif leading-none mt-2 select-none"
              style={{ fontSize: '5rem', color: 'hsl(14 30% 74% / 0.3)', lineHeight: 1 }}
              aria-hidden
            >
              &#8221;
            </span>
          </div>

          {/* Name */}
          <p
            className="mt-4 mb-8 text-sm font-medium tracking-wide transition-opacity duration-250"
            style={{ opacity: fading ? 0 : 1 }}
          >
            {t.name}
          </p>

          {/* Avatar circles */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {DEFAULT_TESTIMONIALS.map((item, i) => (
              <button
                key={i}
                onClick={() => { resetAuto(); goTo(i); }}
                aria-label={`View review by ${item.name}`}
                className="rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300"
                style={{
                  width: i === active ? '2.75rem' : '2.25rem',
                  height: i === active ? '2.75rem' : '2.25rem',
                  background: i === active ? 'hsl(24 10% 10%)' : 'hsl(30 10% 90%)',
                  color: i === active ? '#fff' : 'hsl(24 10% 40%)',
                  boxShadow: i === active ? '0 2px 12px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {item.initials}
              </button>
            ))}
          </div>

          {/* Swipe hint */}
          <p className="text-xs uppercase tracking-widest" style={{ color: 'hsl(24 10% 70%)' }}>
            swipe
          </p>
        </div>

      </div>
    </section>
  );
}
