'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import { cn } from '@/lib/utils';

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
        <p className="eyebrow mb-3">{tr.eyebrow}</p>
        <h2 className="mb-14">
          {tr.heading} <em>{tr.headingEm}</em>
        </h2>

        {/* Quote */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="select-none"
        >
          <div
            className={cn(
              "relative transition-opacity duration-[var(--duration-slow)]",
              fading ? "opacity-0" : "opacity-100"
            )}
          >
            {/* Opening quote mark */}
            <span
              className="block font-serif text-[5rem] leading-none mb-2 select-none text-accent/30"
              aria-hidden
            >
              &#8220;
            </span>

            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground px-4 md:px-8 mb-4">
              {item.text}
            </p>

            {/* Closing quote mark */}
            <span
              className="block font-serif text-[5rem] leading-none mt-2 select-none text-accent/30"
              aria-hidden
            >
              &#8221;
            </span>
          </div>

          {/* Name */}
          <p
            className={cn(
              "mt-4 mb-8 text-sm font-medium tracking-wide transition-opacity duration-[var(--duration-slow)]",
              fading ? "opacity-0" : "opacity-100"
            )}
          >
            {item.name}
          </p>

          {/* Avatar circles */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {tr.items.map((testimonial, i) => (
              <button
                key={i}
                onClick={() => { resetAuto(); goTo(i); }}
                aria-label={`View review by ${testimonial.name}`}
                data-active={i === currentActive}
                className={cn(
                  "rounded-full flex items-center justify-center text-xs font-medium transition-all duration-[var(--duration-normal)]",
                  i === currentActive
                    ? "size-11 bg-foreground text-background shadow-md"
                    : "size-9 bg-secondary text-muted-foreground"
                )}
              >
                {testimonial.initials}
              </button>
            ))}
          </div>

          {/* Swipe hint */}
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {tr.swipe}
          </p>
        </div>

      </div>
    </section>
  );
}
