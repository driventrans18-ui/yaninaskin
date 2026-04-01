
import React from 'react';
import Image from 'next/image';
import HeroVideo from './components/HeroVideo';
import { Header } from '@/components/ui/header-2';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── HEADER ── */}
      <Header />

      {/* ── HERO ── */}
      <HeroVideo />

      {/* ── SERVICES ── */}
      <section id="services" className="px-6 py-24 bg-background">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-accent">What I Offer</p>
          <h2 className="mb-4 text-center font-serif text-4xl md:text-5xl font-medium">Treatments</h2>
          <p className="mb-14 text-center text-muted-foreground max-w-lg mx-auto">
            Every service is personalised to your skin — no two clients, no two protocols, are ever the same.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {services.map((s) => (
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
                  Book Now <span aria-hidden>→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-6 py-24 bg-muted">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-accent">The Process</p>
          <h2 className="mb-16 text-center font-serif text-4xl md:text-5xl font-medium">Your Journey to Glowing Skin</h2>
          <div className="grid gap-12 md:grid-cols-3 md:gap-8 relative">
            {/* connector line desktop */}
            <div className="hidden md:block absolute top-8 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-border" />
            {steps.map((step, i) => (
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
            {/* Photo placeholder */}
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto md:mx-0 rounded-2xl bg-muted flex items-end justify-center overflow-hidden">
              <span className="mb-6 text-xs uppercase tracking-widest text-muted-foreground">Photo coming soon</span>
            </div>
            {/* Bio */}
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-accent">Meet Your Esthetician</p>
              <h2 className="mb-6 font-serif text-4xl md:text-5xl font-medium">Dr. Yanina Menaker</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                I'm a licensed esthetician based in Rochester, NY, with a deep passion for helping clients feel
                confident and comfortable in their own skin. My approach is rooted in science, but always tailored
                to the individual — because your skin has a unique story, and it deserves to be treated that way.
              </p>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Whether you're dealing with acne, hyperpigmentation, premature aging, or simply want to invest in
                your skin's long-term health, I'm here to guide you with honest advice, proven techniques, and
                genuine care every step of the way.
              </p>
              <p className="mb-8 text-muted-foreground leading-relaxed">
                Every appointment is a space for you to relax, reset, and leave glowing — not just on the outside.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Licensed Esthetician', 'Rochester, NY', 'Skin Specialist'].map((badge) => (
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
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-accent">Results & Space</p>
          <h2 className="mb-4 text-center font-serif text-4xl md:text-5xl font-medium">The Experience</h2>
          <p className="mb-14 text-center text-muted-foreground max-w-md mx-auto">
            A glimpse into the treatments, the results, and the space where it all happens.
          </p>
          {/* Replace these placeholder divs with <Image> components when photos are ready */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-secondary flex items-center justify-center"
              >
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Photo {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" className="px-6 py-24 bg-background">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-accent">Testimonials</p>
          <h2 className="mb-14 text-center font-serif text-4xl md:text-5xl font-medium">Kind Words</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <div key={r.name} className="rounded-2xl border border-border bg-card p-8 flex flex-col gap-4">
                <div className="flex gap-0.5 text-accent text-lg">★★★★★</div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{r.quote}"</p>
                <div className="mt-auto">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Rochester, NY</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOK CTA BAND ── */}
      <section id="book" className="px-6 py-20 bg-accent/15">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-serif text-4xl md:text-5xl font-medium">Ready to Glow?</h2>
          <p className="mb-8 text-muted-foreground">
            Book your appointment online. New clients always welcome in Rochester, NY.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-80"
          >
            Book Your Appointment
            <span aria-hidden>→</span>
          </a>
        </div>
      </section>

      {/* ── POLICIES ── */}
      <section id="policies" className="px-6 py-24 bg-muted">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-accent">Before You Come In</p>
          <h2 className="mb-14 text-center font-serif text-4xl md:text-5xl font-medium">Good to Know</h2>
          <div className="flex flex-col gap-4">
            {policies.map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-8">
                <h3 className="mb-3 font-serif text-xl">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
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
              <p className="text-sm text-background/60 leading-relaxed">
                Luxury skincare in Rochester, NY.<br />
                Personalised treatments for your best skin.
              </p>
            </div>
            {/* Quick links */}
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-background/50">Quick Links</p>
              <div className="flex flex-col gap-2">
                {[['Services', '#services'], ['About', '#about'], ['Reviews', '#reviews'], ['Book Now', '#book'], ['Policies', '#policies']].map(([label, href]) => (
                  <a key={label} href={href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {label}
                  </a>
                ))}
              </div>
            </div>
            {/* Social */}
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-background/50">Follow Along</p>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-sm text-background/70 hover:text-background transition-colors">Instagram</a>
                <a href="#" className="text-sm text-background/70 hover:text-background transition-colors">TikTok</a>
              </div>
            </div>
          </div>
          <div className="border-t border-background/15 pt-6 text-center text-xs text-background/40">
            © 2026 Dr. Yanina Menaker · Rochester, NY · All rights reserved
          </div>
        </div>
      </footer>

    </main>
  );
}

/* ─── Data ─────────────────────────────────────────── */

const services = [
  {
    title: 'Custom Facial',
    price: 'From $95',
    description:
      'Tailored to your skin type — deep cleanse, exfoliation, steam, extractions if needed, mask, and hydration. Perfect for all skin types and great as a monthly reset.',
  },
  {
    title: 'Chemical Peel',
    price: 'From $120',
    description:
      'Resurface and renew with a professional-grade peel targeting hyperpigmentation, acne scarring, fine lines, and uneven texture. Customised strength for your skin.',
  },
  {
    title: 'Microneedling',
    price: 'From $250',
    description:
      'Collagen induction therapy using fine micro-channels to stimulate your skin's natural repair process. Results in firmer, smoother, more youthful-looking skin over time.',
  },
  {
    title: 'LED Light Therapy',
    price: 'From $65',
    description:
      'Non-invasive, relaxing treatment using targeted wavelengths to reduce inflammation, calm breakouts, and boost skin radiance. Can be added to any facial.',
  },
];

const steps = [
  {
    title: 'Consultation',
    description:
      'We begin with a thorough skin analysis to understand your concerns, goals, and skin history. No guesswork — just a personalised plan.',
  },
  {
    title: 'Treatment',
    description:
      'A bespoke protocol performed in a calm, serene space. Every step is intentional, from cleanse to finish.',
  },
  {
    title: 'Glow',
    description:
      'You'll leave with visible results and a curated aftercare routine to extend and protect your treatment at home.',
  },
];

const reviews = [
  {
    quote:
      'My skin has never looked better. Dr. Menaker really listened to my concerns and created a treatment plan that actually worked. I saw results after just two sessions.',
    name: 'Sarah M.',
  },
  {
    quote:
      'The microneedling series completely transformed my skin texture and faded my acne scars. I\'m obsessed with my results and won\'t go anywhere else.',
    name: 'Priya K.',
  },
  {
    quote:
      'Such a calming, professional experience from start to finish. I leave every single appointment glowing. Highly, highly recommend.',
    name: 'Jessica R.',
  },
];

const policies = [
  {
    title: 'Cancellation Policy',
    body: 'Please cancel or reschedule at least 24 hours in advance. Late cancellations (under 24 hours) are subject to a 50% service fee. No-shows will be charged the full service amount. I appreciate your understanding — this allows me to accommodate other clients.',
  },
  {
    title: 'Late Arrival',
    body: 'I do my best to accommodate late arrivals, however your treatment time may be shortened to avoid affecting other scheduled appointments. Arrivals more than 15 minutes late may need to be rescheduled.',
  },
  {
    title: 'Skincare Prep',
    body: 'Please arrive with a clean face. Avoid retinoids, exfoliants, or any active acids for 3–5 days prior to chemical peels or microneedling. SPF is required post-treatment — I recommend avoiding direct sun exposure for at least 48 hours after any resurfacing service.',
  },
];
