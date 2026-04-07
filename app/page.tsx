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
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
          <p className="eyebrow mb-3 text-center">{tr.services.eyebrow}</p>
          <h2 className="mb-4 text-center">{tr.services.heading}</h2>
          <p className="mb-14 text-center text-muted-foreground max-w-lg mx-auto text-sm">
            {tr.services.body}
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {tr.services.items.map((s) => (
              <Card key={s.title} className="p-8 flex flex-col gap-4 border border-border">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[#171A20]">{s.title}</h3>
                  <Badge variant="accent" className="shrink-0">
                    {s.price}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                <a
                  href="#book"
                  className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-[#5C5E62] hover:text-[#171A20] transition-colors duration-[330ms]"
                >
                  {tr.services.bookNow} <span aria-hidden>→</span>
                </a>
              </Card>
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
        <div className="absolute inset-0 bg-[#171A20]/70" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="eyebrow mb-3 text-center text-white/50">{tr.process.eyebrow}</p>
          <h2 className="mb-16 text-center text-white">{tr.process.heading}</h2>
          <div className="grid gap-12 md:grid-cols-3 md:gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-white/20" />
            {tr.process.steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center gap-4">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#3E6AE1] bg-[#171A20] text-[#3E6AE1] text-xl font-medium">
                  {i + 1}
                </div>
                <h3 className="text-white">{step.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{step.description}</p>
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
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto md:mx-0 rounded-[12px] overflow-hidden">
              <Image
                src="/images/yanina skin about.png"
                alt="Yanina Menaker, Licensed Esthetician"
                fill
                className="object-cover"
              />
            </div>
            {/* Bio */}
            <div>
              <p className="eyebrow mb-3">{tr.about.eyebrow}</p>
              <h2 className="mb-6">{tr.about.name}</h2>
              <p className="mb-4 text-[#393C41] leading-relaxed text-sm">{tr.about.bio1}</p>
              <p className="mb-4 text-[#393C41] leading-relaxed text-sm">{tr.about.bio2}</p>
              <p className="mb-8 text-[#393C41] leading-relaxed text-sm">{tr.about.bio3}</p>
              <div className="flex flex-wrap gap-3">
                {tr.about.badges.map((badge) => (
                  <Badge key={badge} variant="outline" className="py-1.5 px-4">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" className="px-6 py-24 bg-[#F4F4F4]">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow mb-3 text-center">{tr.gallery.eyebrow}</p>
          <h2 className="mb-4 text-center">{tr.gallery.heading}</h2>
          <p className="mb-14 text-center text-muted-foreground max-w-md mx-auto text-sm">
            {tr.gallery.body}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-[12px] bg-white flex items-center justify-center"
              >
                <span className="text-xs uppercase tracking-widest text-[#8E8E8E]">{tr.gallery.photoLabel} {i + 1}</span>
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
      <section id="book" className="px-6 py-24 bg-[#F4F4F4]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4">{tr.book.heading}</h2>
          <p className="mb-8 text-muted-foreground text-sm">{tr.book.body}</p>
          <Button asChild variant="default" size="pill">
            <a href="#">
              {tr.book.cta}
              <span aria-hidden>→</span>
            </a>
          </Button>
        </div>
      </section>

      {/* ── POLICIES ── */}
      <section id="policies" className="px-6 py-24 bg-background scroll-mt-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-3 text-center">{tr.policies.eyebrow}</p>
          <h2 className="mb-14 text-center">{tr.policies.heading}</h2>
          <PoliciesAccordion policies={tr.policies.items} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#171A20] text-white px-6 py-16">
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
              <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">
                {tr.footer.tagline}
              </p>
            </div>
            {/* Quick links */}
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-white/35">{tr.footer.quickLinks}</p>
              <div className="flex flex-col gap-2">
                {tr.footer.links.map(([label, href]) => (
                  <a key={label} href={href} className="text-sm text-white/60 hover:text-white transition-colors duration-[330ms]">
                    {label}
                  </a>
                ))}
              </div>
            </div>
            {/* Social */}
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-white/35">{tr.footer.followAlong}</p>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors duration-[330ms]">Instagram</a>
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors duration-[330ms]">TikTok</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-xs text-white/30">
            {tr.footer.copyright}
          </div>
        </div>
      </footer>

    </main>
  );
}
