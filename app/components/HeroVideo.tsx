'use client';

import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import { Button } from '@/components/ui/button';

export default function HeroVideo({ onBookNow }: { onBookNow?: () => void }) {
  const { lang } = useLanguage();
  const tr = t[lang].hero;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">

      {/* Desktop video */}
      <video
        className="hidden md:block absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Mobile video */}
      <video
        className="block md:hidden absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/videos/hero-mobile.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none hero-gradient" />

      {/* Hero text + CTA */}
      <div className="absolute bottom-16 inset-x-0 z-20 flex flex-col items-center text-center text-white px-6">
        <p className="mb-2 font-serif italic text-lg md:text-xl text-white/85 tracking-wide">
          {tr.subtitle}
        </p>
        <h1 className="drop-shadow-lg">
          {tr.heading}
        </h1>
        <p className="mt-4 max-w-sm md:max-w-md text-sm md:text-base text-white/75 leading-relaxed">
          {tr.body}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          {/* Primary — Book a Facial */}
          <Button variant="hero-primary" size="pill" onClick={onBookNow}>
            {tr.bookFacial}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </span>
          </Button>
          {/* Secondary — View Services */}
          <Button asChild variant="hero-secondary" size="pill">
            <a href="#services">
              {tr.viewServices}
            </a>
          </Button>
        </div>
      </div>

    </div>
  );
}
