'use client';

import { useEffect } from 'react';
import { gaEnabled, trackEvent } from '@/lib/gtag';

// The on-page sections, in the order a visitor scrolls through them. The id
// must match the `id` on each <section> in app/page.tsx.
const SECTIONS = [
  'services',
  'how-it-works',
  'about',
  'gallery',
  'reviews',
  'book',
  'contact',
  'policies',
];

// Because this is a single-page site, default GA page views can't show how far
// people get or which parts they actually look at. This watches each section
// and sends a `section_view` event the first time it scrolls into view, so the
// GA "Events" report reads like a funnel: how many reach Services, Gallery,
// Reviews, the booking band, etc.
export default function SectionTracker() {
  useEffect(() => {
    if (!gaEnabled) return;

    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting && !seen.has(id)) {
            seen.add(id);
            trackEvent('section_view', { section: id });
            observer.unobserve(entry.target);
          }
        }
      },
      // Count a section as "viewed" once ~35% of it is on screen.
      { threshold: 0.35 },
    );

    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
