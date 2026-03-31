
import React from 'react';
import HeroVideo from './components/HeroVideo';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── HERO (video + scroll parallax) ── */}
      <HeroVideo />

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
