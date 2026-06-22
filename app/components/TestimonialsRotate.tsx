'use client';

import React from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { TextRotate } from '@/components/ui/text-rotate';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

export default function TestimonialsRotate() {
  const { lang } = useLanguage();
  const tr = t[lang].testimonials;

  const quotes = tr.items.map((item) => item.text);
  const names = tr.items.map((item) => item.name);

  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <section
      id="testimonials"
      className="px-6 py-24 bg-background scroll-mt-20"
    >
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
            key={names[activeIndex]}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="mt-4 text-sm font-medium tracking-wide"
          >
            — {names[activeIndex]}
          </motion.p>
        </LayoutGroup>
      </div>
    </section>
  );
}
