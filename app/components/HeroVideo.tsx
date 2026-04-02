'use client';

import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

export default function HeroVideo() {
  const { lang } = useLanguage();
  const tr = t[lang].hero;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">

      {/* Desktop video */}
      <video
        className="hidden md:block absolute inset-0 h-full w-full object-contain md:object-cover pointer-events-none"
        style={{ objectPosition: 'center center' }}
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
        className="block md:hidden absolute inset-0 h-full w-full object-cover pointer-events-none"
        style={{ objectPosition: 'center center' }}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/videos/hero-mobile.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom,rgba(0,0,0,0.28) 0%,rgba(0,0,0,0.04) 40%,rgba(0,0,0,0.58) 100%)',
        }}
      />

      {/* Logo — hidden on mobile, left corner on desktop */}
      <div className="hidden md:flex absolute top-0 left-0 right-0 z-20 items-start px-8 pt-7">
        <Image
          src="/images/logo main.png"
          alt="YaninaSkin"
          width={160}
          height={80}
          className="object-contain"
          priority
        />
      </div>

      {/* Hero text + CTA */}
      <div className="absolute bottom-16 inset-x-0 z-20 flex flex-col items-center text-center text-white px-6">
        <p className="mb-2 font-serif italic text-lg md:text-xl text-white/85 tracking-wide">
          {tr.subtitle}
        </p>
        <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight tracking-tight drop-shadow-lg">
          {tr.heading}
        </h1>
        <p className="mt-4 max-w-sm md:max-w-md text-sm md:text-base text-white/75 leading-relaxed">
          {tr.body}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          {/* Primary — Book a Facial */}
          <a
            href="#book"
            className="flex items-center gap-3 rounded-full border border-white/40 bg-white/20 backdrop-blur-sm px-7 py-3 text-sm tracking-[0.12em] uppercase text-white transition-all duration-300 hover:bg-white/30 hover:border-white/70"
          >
            {tr.bookFacial}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </span>
          </a>
          {/* Secondary — View Services */}
          <a
            href="#services"
            className="flex items-center gap-3 rounded-full border border-white/40 bg-transparent px-7 py-3 text-sm tracking-[0.12em] uppercase text-white/85 transition-all duration-300 hover:bg-white/10 hover:text-white"
          >
            {tr.viewServices}
          </a>
        </div>
      </div>

    </div>
  );
}
