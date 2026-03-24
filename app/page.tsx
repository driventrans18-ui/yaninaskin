
import React from 'react'; // Added React import for JSX
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">Services</a>
            <a href="#" className="transition-colors hover:text-foreground">About</a>
            <a href="#" className="transition-colors hover:text-foreground">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/add_the_logo_202603241928.png"
              alt="Lumière Dermatology"
              width={300}
              height={168}
              className="object-contain"
            />
          </div>
          <p className="mb-4 text-sm uppercase tracking-widest text-accent">Premium Skincare & Aesthetic Medicine</p>
          <h2 className="mb-6 text-5xl font-medium leading-tight tracking-tight md:text-6xl">
            Where Science Meets <span className="italic">Elegance</span>
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
            Experience luxury dermatology treatments tailored to reveal your natural radiance in a serene, sophisticated environment.
          </p>
          <div className="flex justify-center gap-4">
            <button className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:opacity-90">
              Book Consultation
            </button>
            <button className="rounded-xl border border-border bg-secondary px-6 py-3 font-medium text-secondary-foreground transition-all hover:bg-muted">
              View Treatments
            </button>
          </div>
        </div>
      </section>

      {/* Color Palette Demo */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-8 text-center text-3xl font-medium">Color Palette</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            <ColorSwatch name="Background" className="bg-background border border-border" />
            <ColorSwatch name="Foreground" className="bg-foreground text-background" />
            <ColorSwatch name="Primary" className="bg-primary text-primary-foreground" />
            <ColorSwatch name="Secondary" className="bg-secondary text-secondary-foreground" />
            <ColorSwatch name="Accent" className="bg-accent text-accent-foreground" />
            <ColorSwatch name="Muted" className="bg-muted text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Typography Demo */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-8 text-center text-3xl font-medium">Typography</h3>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Headings - Playfair Display */}
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Headings — Playfair Display</p>
              <h1 className="mb-2 text-4xl">Heading One</h1>
              <h2 className="mb-2 text-3xl">Heading Two</h2>
              <h3 className="mb-2 text-2xl">Heading Three</h3>
              <h4 className="mb-2 text-xl">Heading Four</h4>
              <h5 className="mb-2 text-lg">Heading Five</h5>
              <h6 className="text-base">Heading Six</h6>
            </div>
            {/* Body - Geist Sans */}
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Body — Geist Sans</p>
              <p className="mb-3 text-lg">Large body text for introductions and key messaging.</p>
              <p className="mb-3">Regular body text for paragraphs and general content. The Geist Sans font provides excellent readability with a modern, clean aesthetic.</p>
              <p className="mb-3 text-sm text-muted-foreground">Small muted text for captions, labels, and secondary information.</p>
              <p className="text-xs uppercase tracking-widest text-accent">Accent uppercase tracking text</p>
            </div>
          </div>
        </div>
      </section>

      {/* Card Demo */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-8 text-center text-3xl font-medium">Cards & Components</h3>
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

      {/* Button States */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-8 text-center text-3xl font-medium">Button Variants</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:opacity-90">
              Primary
            </button>
            <button className="rounded-xl border border-border bg-secondary px-6 py-3 font-medium text-secondary-foreground transition-all hover:bg-muted">
              Secondary
            </button>
            <button className="rounded-xl bg-accent px-6 py-3 font-medium text-accent-foreground transition-all hover:opacity-90">
              Accent
            </button>
            <button className="rounded-xl border border-accent px-6 py-3 font-medium text-accent transition-all hover:bg-accent hover:text-accent-foreground">
              Outline Accent
            </button>
            <button className="rounded-xl bg-muted px-6 py-3 font-medium text-muted-foreground transition-all hover:text-foreground">
              Muted
            </button>
          </div>
        </div>
      </section>

      {/* Input Demo */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-md">
          <h3 className="mb-8 text-center text-3xl font-medium">Form Elements</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button className="w-full rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:opacity-90">
              Schedule Appointment
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <h4 className="mb-2 text-xl">Lumière Dermatology</h4>
          <p className="text-sm text-muted-foreground">
            Premium Skincare & Aesthetic Medicine — Where Science Meets Elegance
          </p>
        </div>
      </footer>
    </main>
  );
}

function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className={`flex h-24 flex-col items-center justify-center rounded-xl ${className}`}>
      <span className="text-sm font-medium">{name}</span>
    </div>
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