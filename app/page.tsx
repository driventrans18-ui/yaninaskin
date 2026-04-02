'use client';

import React from 'react';
import Image from 'next/image';
import HeroVideo from './components/HeroVideo';
import { Header } from '@/components/ui/header-2';
import PoliciesAccordion from './components/PoliciesAccordion';
import ReviewForm from './components/ReviewForm';
import TestimonialsCarousel from './components/TestimonialsCarousel';
import { useLanguage } from './context/LanguageContext';
import { t } from './translations';

export default function Home() {
  const { lang } = useLanguage();
  const tr = t[lang];

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── HEADER ── */}
      <Header />

      {/* ── HERO ── */}
      <HeroVideo />

      {/* ── SERVICES ── */}
      <section id="services" className="px-6 py-24 bg-background">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-accent">{tr.services.eyebrow}</p>
          <h2 className="mb-4 text-center font-serif text-4xl md:text-5xl font-medium">{tr.services.heading}</h2>
          <p className="mb-14 text-center text-muted-foreground max-w-lg mx-auto">
            {tr.services.body}
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {tr.services.items.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-8 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif text-xl">{s.title}</h3>
                  <span className="shrink-0 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent tracking-wide">
                    {s.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                <a
                  href="#book"
                  className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
                >
                  {tr.services.bookNow} <span aria-hidden>→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative px-6 py-24 overflow-hidden">
        <Image
          src="/images/yanianaclient.png"
          alt="Client receiving skin treatment"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-accent">{tr.process.eyebrow}</p>
          <h2 className="mb-16 text-center font-serif text-4xl md:text-5xl font-medium">{tr.process.heading}</h2>
          <div className="grid gap-12 md:grid-cols-3 md:gap-8 relative">
            {/* connector line desktop */}
            <div className="hidden md:block absolute top-8 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-border" />
            {tr.process.steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center gap-4">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent bg-background text-accent font-serif text-xl">
                  {i + 1}
                </div>
                <h3 className="font-serif text-xl">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="px-6 py-24 bg-background">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* Photo */}
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto md:mx-0 rounded-2xl overflow-hidden">
              <Image
                src="/images/yanina skin about.png"
                alt="Yanina Menaker, Licensed Esthetician"
                fill
                className="object-cover"
              />
            </div>
            {/* Bio */}
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-accent">{tr.about.eyebrow}</p>
              <h2 className="mb-6 font-serif text-4xl md:text-5xl font-medium">{tr.about.name}</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">{tr.about.bio1}</p>
              <p className="mb-4 text-muted-foreground leading-relaxed">{tr.about.bio2}</p>
              <p className="mb-8 text-muted-foreground leading-relaxed">{tr.about.bio3}</p>
              <div className="flex flex-wrap gap-3">
                {tr.about.badges.map((badge) => (
                  <span key={badge} className="rounded-full border border-border px-4 py-1.5 text-xs tracking-wide text-muted-foreground">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" className="px-6 py-24 bg-muted">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-accent">{tr.gallery.eyebrow}</p>
          <h2 className="mb-4 text-center font-serif text-4xl md:text-5xl font-medium">{tr.gallery.heading}</h2>
          <p className="mb-14 text-center text-muted-foreground max-w-md mx-auto">
            {tr.gallery.body}
          </p>
          {/* Replace these placeholder divs with <Image> components when photos are ready */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-secondary flex items-center justify-center"
              >
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{tr.gallery.photoLabel} {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEAVE A REVIEW (form) ── */}
      <ReviewForm />

      {/* ── WHAT CLIENTS SAY (carousel) ── */}
      <TestimonialsCarousel />

      {/* ── BOOK CTA BAND ── */}
      <section id="book" className="px-6 py-20 bg-accent/15">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-serif text-4xl md:text-5xl font-medium">{tr.book.heading}</h2>
          <p className="mb-8 text-muted-foreground">{tr.book.body}</p>
          <a
            href="#"
            className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-80"
          >
            {tr.book.cta}
            <span aria-hidden>→</span>
          </a>
        </div>
      </section>

      {/* ── POLICIES ── */}
      <section id="policies" className="px-6 py-24 bg-muted scroll-mt-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-accent">{tr.policies.eyebrow}</p>
          <h2 className="mb-14 text-center font-serif text-4xl md:text-5xl font-medium">{tr.policies.heading}</h2>
          <PoliciesAccordion policies={tr.policies.items} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-foreground text-background px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-3 mb-12">
            {/* Brand */}
            <div>
              <Image
                src="/images/logo main.png"
                alt="Dr. Yanina Menaker"
                width={140}
                height={56}
                className="object-contain mb-4 brightness-0 invert"
              />
              <p className="text-sm text-background/60 leading-relaxed whitespace-pre-line">
                {tr.footer.tagline}
              </p>
            </div>
            {/* Quick links */}
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-background/50">{tr.footer.quickLinks}</p>
              <div className="flex flex-col gap-2">
                {tr.footer.links.map(([label, href]) => (
                  <a key={label} href={href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {label}
                  </a>
                ))}
              </div>
            </div>
            {/* Social */}
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-background/50">{tr.footer.followAlong}</p>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-sm text-background/70 hover:text-background transition-colors">Instagram</a>
                <a href="#" className="text-sm text-background/70 hover:text-background transition-colors">TikTok</a>
              </div>
            </div>
          </div>
          <div className="border-t border-background/15 pt-6 text-center text-xs text-background/40">
            {tr.footer.copyright}
          </div>
        </div>
      </footer>

    </main>
  );
}
