'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

export default function TestimonialsCarousel() {
  const { lang } = useLanguage();
  const tr = t[lang].testimonials;

  const [active, setActive]     = useState(0);
  const [fading, setFading]     = useState(false);
  const touchStartX             = useRef(0);
  const autoRef                 = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (i: number) => {
    setFading(true);
    setTimeout(() => { setActive(i); setFading(false); }, 250);
  };

  const next = () => goTo((active + 1) % tr.items.length);
  const prev = () => goTo((active - 1 + tr.items.length) % tr.items.length);

  const resetAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(next, 5000);
  };

  useEffect(() => {
    resetAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [active, lang]);

  // Reset to first slide when language changes
  useEffect(() => {
    setActive(0);
  }, [lang]);

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

  const currentActive = Math.min(active, tr.items.length - 1);
  const item = tr.items[currentActive];

  return (
    <section id="testimonials" className="px-6 py-24 bg-background scroll-mt-20">
      <div className="mx-auto max-w-3xl text-center">

        {/* Heading */}
        <p className="mb-3 text-xs uppercase tracking-widest text-accent">{tr.eyebrow}</p>
        <h2 className="mb-14 font-serif text-4xl md:text-5xl font-medium">
          {tr.heading} <em>{tr.headingEm}</em>
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
              {item.text}
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
            {item.name}
          </p>

          {/* Avatar circles */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {tr.items.map((t, i) => (
              <button
                key={i}
                onClick={() => { resetAuto(); goTo(i); }}
                aria-label={`View review by ${t.name}`}
                className="rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300"
                style={{
                  width: i === currentActive ? '2.75rem' : '2.25rem',
                  height: i === currentActive ? '2.75rem' : '2.25rem',
                  background: i === currentActive ? 'hsl(24 10% 10%)' : 'hsl(30 10% 90%)',
                  color: i === currentActive ? '#fff' : 'hsl(24 10% 40%)',
                  boxShadow: i === currentActive ? '0 2px 12px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {t.initials}
              </button>
            ))}
          </div>

          {/* Swipe hint */}
          <p className="text-xs uppercase tracking-widest" style={{ color: 'hsl(24 10% 70%)' }}>
            {tr.swipe}
          </p>
        </div>

      </div>
    </section>
  );
}
