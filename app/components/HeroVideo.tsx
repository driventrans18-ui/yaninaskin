'use client';

import { useEffect, useRef } from 'react';

export default function HeroVideo() {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const textRef      = useRef<HTMLDivElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper   = wrapperRef.current;
    const video     = videoRef.current;
    const text      = textRef.current;
    const overlay   = overlayRef.current;
    const indicator = indicatorRef.current;
    if (!wrapper || !video || !text) return;

    let scrollControlled = false;
    let targetProgress   = 0;   // where scroll says we should be  (0–1)
    let lerpedProgress   = 0;   // smoothly chasing target          (0–1)
    let rafId: number;

    /* ─── Scroll handler: only update the target, nothing else ─── */
    const onScroll = () => {
      if (!scrollControlled) {
        scrollControlled = true;
        video.pause();
      }
      const rect       = wrapper.getBoundingClientRect();
      const scrollable = wrapper.offsetHeight - window.innerHeight;
      targetProgress   = Math.max(0, Math.min(1, -rect.top / scrollable));
    };

    /* ─── RAF loop: lerp towards target at 60 fps ─── */
    const tick = () => {
      // Ease factor — higher = snappier, lower = more buttery
      const ease = 0.14;
      lerpedProgress += (targetProgress - lerpedProgress) * ease;

      // Seek only when there is a meaningful difference (avoids redundant decodes)
      if (video.duration && Math.abs(lerpedProgress * video.duration - video.currentTime) > 0.015) {
        video.currentTime = lerpedProgress * video.duration;
      }

      // Text: fade + lift during first 30 % of scroll
      const textP = Math.min(1, lerpedProgress / 0.3);
      text.style.opacity   = `${Math.max(0, 1 - textP * 1.7)}`;
      text.style.transform = `translateY(${textP * -45}px)`;

      if (overlay)   overlay.style.opacity   = `${0.28 + lerpedProgress * 0.32}`;
      if (indicator) indicator.style.opacity = `${Math.max(0, 1 - lerpedProgress * 10)}`;

      rafId = requestAnimationFrame(tick);
    };

    /* ─── Start RAF loop as soon as video can play ─── */
    const onCanPlay = () => {
      if (!scrollControlled) {
        video.pause();
        video.currentTime = 0;
      }
      rafId = requestAnimationFrame(tick);
    };

    video.addEventListener('canplaythrough', onCanPlay, { once: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener('canplaythrough', onCanPlay);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    /*
     * Scroll room ≈ 3 natural mobile swipes (900 px).
     * The sticky inner div stays fullscreen while the wrapper scrolls.
     */
    <div ref={wrapperRef} style={{ height: 'calc(100vh + 900px)' }}>

      <div className="sticky top-0 h-screen w-full overflow-hidden bg-white">

        {/* Video — object-cover on all sizes; shift right on mobile so subject stays visible */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          style={{ objectPosition: '72% center' }}
          autoPlay
          muted
          playsInline
          preload="auto"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom,rgba(0,0,0,0.28) 0%,rgba(0,0,0,0.04) 40%,rgba(0,0,0,0.58) 100%)',
            opacity: 0.28,
          }}
        />

        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
          <span className="font-serif text-xl text-white tracking-wide">YaninaSkin</span>
          <div className="hidden md:flex gap-8 text-xs tracking-[0.2em] text-white/85 uppercase">
            {['Shop','Philosophy','Gallery','Journal'].map((item) => (
              <a key={item} href="#" className="hover:text-white transition-colors duration-200">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
          </div>
        </nav>

        {/* Hero text + CTA */}
        <div
          ref={textRef}
          className="absolute bottom-20 inset-x-0 z-20 flex flex-col items-center text-center text-white px-4"
          style={{ willChange: 'transform, opacity' }}
        >
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

        {/* Scroll indicator */}
        <div
          ref={indicatorRef}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/50"
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </div>

      </div>
    </div>
  );
}
