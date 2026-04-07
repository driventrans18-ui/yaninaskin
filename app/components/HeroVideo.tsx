'use client';

import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import { Button } from '@/components/ui/button';

export default function HeroVideo() {
  const { lang } = useLanguage();
  const tr = t[lang].hero;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#171A20]">

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

      {/* Hero text + CTA — Tesla style: centered, minimal */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-6">
        <h1 className="text-white font-medium">
          {tr.heading}
        </h1>
        <p className="mt-3 text-sm md:text-base text-white/75">
          {tr.subtitle}
        </p>
        <div className="mt-8 flex flex-row items-center gap-3">
          <Button asChild variant="hero-primary" size="pill">
            <a href="#book">
              {tr.bookFacial}
            </a>
          </Button>
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
