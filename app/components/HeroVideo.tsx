'use client';

import Image from 'next/image';

export default function HeroVideo() {
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

      {/* Logo */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-6">
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
      <div className="absolute bottom-20 inset-x-0 z-20 flex flex-col items-center text-center text-white px-4">
        <p className="mb-1 font-serif italic text-xl md:text-2xl text-white/90 tracking-wide">Luxe Radiance</p>
        <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight tracking-tight drop-shadow-lg">
          Refined Skincare
        </h1>
        <button className="mt-8 flex items-center gap-3 rounded-full border border-white/40 bg-white/15 backdrop-blur-sm px-7 py-3 text-sm tracking-[0.12em] uppercase text-white transition-all duration-300 hover:bg-white/25 hover:border-white/60">
          Shop the Collection
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </span>
        </button>
      </div>

    </div>
  );
}
