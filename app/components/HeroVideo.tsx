'use client';

import { useEffect, useRef } from 'react';

export default function HeroVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const textRef   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video   = videoRef.current;
    const text    = textRef.current;
    const overlay = overlayRef.current;
    if (!section || !video || !text) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY    = window.scrollY;
        const viewH      = window.innerHeight;
        // progress 0 → 1 as hero scrolls out of view
        const progress   = Math.min(scrollY / viewH, 1);

        // Video: slow upward parallax + very subtle zoom-in
        video.style.transform = `translateY(${scrollY * 0.35}px) scale(${1 + progress * 0.06})`;

        // Text: drifts upward faster + fades out cleanly
        text.style.transform  = `translateY(${scrollY * -0.15}px)`;
        text.style.opacity    = `${Math.max(0, 1 - progress * 2.2)}`;

        // Overlay: deepens slightly as you scroll (adds drama)
        if (overlay) {
          overlay.style.opacity = `${0.35 + progress * 0.35}`;
        }

        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-[#0d0a08]"
    >
      {/* ── Video layer: starts 10 % taller so parallax has room ── */}
      <video
        ref={videoRef}
        className="absolute inset-x-0 w-full object-cover will-change-transform pointer-events-none"
        style={{ top: '-10%', height: '120%', objectPosition: 'center top' }}
        autoPlay
        muted
        loop
        playsInline
      >
        {/* Place your video at public/videos/hero.mp4 */}
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* ── Gradient overlay ── */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none will-change-[opacity]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.55) 100%)',
          opacity: 0.35,
        }}
      />

      {/* ── Arch frames ── */}
      <div className="absolute inset-0 flex pointer-events-none">
        {/* Left arch */}
        <div
          className="hidden md:block absolute bottom-0 border-[2px] border-white/20"
          style={{
            left: '-5%', width: '35%', height: '80%',
            borderRadius: '50% 50% 0 0 / 18% 18% 0 0',
            borderBottom: 'none',
          }}
        />
        {/* Center arch */}
        <div
          className="absolute bottom-0 border-[2.5px] border-white/28"
          style={{
            left: '50%', transform: 'translateX(-50%)',
            width: '44%', height: '88%',
            borderRadius: '50% 50% 0 0 / 16% 16% 0 0',
            borderBottom: 'none',
          }}
        />
        {/* Right arch */}
        <div
          className="hidden md:block absolute bottom-0 border-[2px] border-white/20"
          style={{
            right: '-5%', width: '35%', height: '80%',
            borderRadius: '50% 50% 0 0 / 18% 18% 0 0',
            borderBottom: 'none',
          }}
        />
      </div>

      {/* ── Navigation ── */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
        <span className="font-serif text-xl text-white tracking-wide">YaninaSkin</span>
        <div className="hidden md:flex gap-8 text-xs tracking-[0.2em] text-white/85 uppercase">
          {['Shop', 'Philosophy', 'Gallery', 'Journal'].map((item) => (
            <a key={item} href="#" className="hover:text-white transition-colors duration-200">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3 text-white/80">
          {/* User icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          {/* Bag icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
        </div>
      </nav>

      {/* ── Hero text + CTA ── */}
      <div
        ref={textRef}
        className="absolute bottom-20 inset-x-0 z-20 flex flex-col items-center text-center text-white px-4 will-change-transform"
      >
        <p className="mb-1 font-serif italic text-xl md:text-2xl text-white/90 tracking-wide">
          Luxe Radiance
        </p>
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

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/50">
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <div className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
