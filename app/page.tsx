
import React from 'react';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── HERO ── */}
      <section className="relative h-screen w-full overflow-hidden bg-[#1a1008]">

        {/* Background photo */}
        <Image
          src="/images/add_the_logo_202603241928.png"
          alt="Yanina Skin hero"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Warm-to-transparent gradient veil */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/55 pointer-events-none" />

        {/* ── Arch frames overlay ── */}
        <div className="absolute inset-0 flex items-end justify-center gap-4 pb-0 pointer-events-none">
          {/* Left arch (partial) */}
          <div
            className="hidden md:block absolute left-[-6%] bottom-0 w-[36%] border-[3px] border-white/20"
            style={{
              height: '82%',
              borderRadius: '50% 50% 0 0 / 18% 18% 0 0',
              borderBottom: 'none',
            }}
          />
          {/* Center arch */}
          <div
            className="absolute bottom-0 w-[44%] border-[3px] border-white/30"
            style={{
              height: '88%',
              borderRadius: '50% 50% 0 0 / 16% 16% 0 0',
              borderBottom: 'none',
            }}
          />
          {/* Right arch (partial) */}
          <div
            className="hidden md:block absolute right-[-6%] bottom-0 w-[36%] border-[3px] border-white/20"
            style={{
              height: '82%',
              borderRadius: '50% 50% 0 0 / 18% 18% 0 0',
              borderBottom: 'none',
            }}
          />
        </div>

        {/* ── Navigation ── */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-20">
          <span className="font-serif text-xl text-white tracking-wide">YaninaSkin</span>
          <div className="hidden md:flex gap-8 text-xs tracking-[0.2em] text-white/85 uppercase">
            <a href="#" className="hover:text-white transition-colors">Shop</a>
            <a href="#" className="hover:text-white transition-colors">Philosophy</a>
            <a href="#" className="hover:text-white transition-colors">Gallery</a>
            <a href="#" className="hover:text-white transition-colors">Journal</a>
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
        <div className="absolute bottom-20 inset-x-0 z-20 flex flex-col items-center text-center text-white px-4">
          <p className="mb-1 font-serif italic text-xl md:text-2xl text-white/90">Luxe Radiance</p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight tracking-tight drop-shadow-lg">
            Refined Skincare
          </h1>
          <button className="mt-8 flex items-center gap-3 rounded-full border border-white/40 bg-white/15 backdrop-blur-sm px-7 py-3 text-sm tracking-[0.12em] uppercase text-white transition-all hover:bg-white/25">
            Shop the Collection
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </span>
          </button>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-accent">Our Expertise</p>
          <h2 className="mb-12 text-center text-4xl font-medium">Treatments</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <ServiceCard
              title="Facial Rejuvenation"
              description="Advanced anti-aging treatments combining medical expertise with luxurious skincare."
              accent
            />
            <ServiceCard
              title="Skin Analysis"
              description="Comprehensive skin assessment using state-of-the-art diagnostic technology."
            />
            <ServiceCard
              title="Body Contouring"
              description="Non-invasive body sculpting procedures for a refined silhouette."
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <h4 className="mb-2 font-serif text-xl">YaninaSkin</h4>
          <p className="text-sm text-muted-foreground">
            Premium Skincare & Aesthetic Medicine — Where Science Meets Elegance
          </p>
        </div>
      </footer>
    </main>
  );
}

function ServiceCard({ title, description, accent }: { title: string; description: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-6 transition-all hover:shadow-lg ${accent ? 'border-accent bg-accent/10' : 'border-border bg-card'}`}>
      <h4 className="mb-3 text-xl">{title}</h4>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <a href="#" className={`text-sm font-medium ${accent ? 'text-accent' : 'text-primary'} transition-colors hover:opacity-80`}>
        Learn More →
      </a>
    </div>
  );
}
