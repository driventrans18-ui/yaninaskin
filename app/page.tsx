'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import HeroVideo from './components/HeroVideo';
import { Header } from '@/components/ui/header-2';
import PoliciesAccordion from './components/PoliciesAccordion';
import ServicesAccordion from './components/ServicesAccordion';
import BrandsModal from './components/BrandsModal';
import GalleryLightbox from './components/GalleryLightbox';
import TreatmentMedia from './components/TreatmentMedia';
import ReviewForm from './components/ReviewForm';
import TestimonialsRotate from './components/TestimonialsRotate';
import ContactForm from './components/ContactForm';
import BookingModal from './components/BookingModal';
import { useLanguage } from './context/LanguageContext';
import { t } from './translations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Instagram, Maximize2 } from 'lucide-react';
import { getServices, getAboutContent } from './actions/content';

interface Service {
  id: number;
  category_order: number;
  category_title: string;
  category_description: string | null;
  treatment_order: number;
  treatment_title: string;
  treatment_price: string;
  treatment_duration: string | null;
  treatment_description: string | null;
  treatment_note: string | null;
  treatment_image_before: string | null;
  treatment_image_after: string | null;
  treatment_before_position: string | null;
  treatment_after_position: string | null;
}

interface AboutData {
  eyebrow?: string;
  name?: string;
  bio1?: string;
  bio2?: string;
  bio3?: string;
  bio4?: string;
  badges?: string[];
  photo_url?: string;
  photo_position?: string;
  phone?: string;
  email?: string;
  address?: string;
  instagram_url?: string;
  tiktok_url?: string;
  translations?: Record<
    string,
    {
      eyebrow?: string;
      name?: string;
      bio1?: string;
      bio2?: string;
      bio3?: string;
      bio4?: string;
      badges?: string[];
    }
  >;
  gallery?: {
    url: string;
    position: string;
    scale?: number;
    urlAfter?: string;
    positionAfter?: string;
    scaleAfter?: number;
  }[];
  brands?: { name: string; logo?: string }[];
}

export default function Home() {
  const { lang } = useLanguage();
  const tr = t[lang];
  const [services, setServices] = useState<Service[]>([]);
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingTreatment, setBookingTreatment] = useState('');

  const openBooking = (treatment = '') => {
    setBookingTreatment(treatment);
    setBookingOpen(true);
  };
  const [lightbox, setLightbox] = useState<{
    url: string;
    position: string;
    scale?: number;
    urlAfter?: string;
    positionAfter?: string;
    scaleAfter?: number;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesResult, aboutResult] = await Promise.all([
          getServices(),
          getAboutContent(),
        ]);
        if (servicesResult.success) setServices(servicesResult.data);
        if (aboutResult.success && aboutResult.data) setAbout(aboutResult.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const serviceCategories = services.length > 0
    ? Object.values(
        services.reduce((acc, service) => {
          if (!acc[service.category_title]) {
            acc[service.category_title] = {
              title: service.category_title,
              description: service.category_description,
              treatments: [],
            };
          }
          acc[service.category_title].treatments.push({
            title: service.treatment_title,
            price: service.treatment_price,
            duration: service.treatment_duration || undefined,
            description: service.treatment_description || undefined,
            note: service.treatment_note || undefined,
            imageBefore: service.treatment_image_before || undefined,
            imageAfter: service.treatment_image_after || undefined,
            imageBeforePos: service.treatment_before_position || undefined,
            imageAfterPos: service.treatment_after_position || undefined,
          });
          return acc;
        }, {} as Record<string, any>)
      )
    : tr.services.categories;

  // Bio text is stored once in English (the about_content columns) plus an
  // optional per-language `translations` map the owner fills in the admin.
  // For non-English, prefer the localized override, then the owner's English,
  // then the static translation — so a blank language never shows empty.
  const aboutLoc = lang !== 'en' ? about?.translations?.[lang] : undefined;
  const ab = {
    eyebrow: aboutLoc?.eyebrow || about?.eyebrow || tr.about.eyebrow,
    name: aboutLoc?.name || about?.name || tr.about.name,
    bio1: aboutLoc?.bio1 || about?.bio1 || tr.about.bio1,
    bio2: aboutLoc?.bio2 || about?.bio2 || tr.about.bio2,
    bio3: aboutLoc?.bio3 || about?.bio3 || tr.about.bio3,
    bio4: aboutLoc?.bio4 || about?.bio4 || '',
    badges:
      aboutLoc?.badges && aboutLoc.badges.length > 0
        ? aboutLoc.badges
        : about?.badges || tr.about.badges,
  };

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── HEADER ── */}
      <Header onBookNow={() => openBooking()} />

      {/* ── HERO ── */}
      <HeroVideo onBookNow={() => openBooking()} />

      {/* ── SERVICES ── */}
      <section id="services" className="px-6 py-24 bg-background scroll-mt-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-3 text-center">{tr.services.eyebrow}</p>
          <h2 className="mb-4 text-center">{tr.services.heading}</h2>
          <p className="mb-14 text-center text-muted-foreground max-w-lg mx-auto">
            {tr.services.body}
          </p>

          <ServicesAccordion
            categories={serviceCategories}
            onBook={(treatment) => openBooking(treatment)}
            bookLabel={tr.services.bookNow}
          />

          {about?.brands && about.brands.length > 0 && (
            <div className="mt-12 text-center">
              <Button
                variant="outline"
                size="pill"
                onClick={() => setBrandsOpen(true)}
              >
                {tr.services.brandsCta}
              </Button>
            </div>
          )}

          <div className="mt-10 text-center">
            <a
              href="#book"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              {tr.services.bookNow} <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative px-6 py-24 overflow-hidden">
        <Image
          src="/images/newabout.png"
          alt="Client receiving skin treatment"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="eyebrow mb-3 text-center">{tr.process.eyebrow}</p>
          <h2 className="mb-16 text-center">{tr.process.heading}</h2>
          <div className="grid gap-12 md:grid-cols-3 md:gap-8 relative">
            {/* connector line desktop */}
            <div className="hidden md:block absolute top-8 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-border" />
            {tr.process.steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center gap-4">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent bg-background text-accent font-serif text-xl">
                  {i + 1}
                </div>
                <h3>{step.title}</h3>
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
              <img
                src={about?.photo_url || '/images/yanina skin about.png'}
                alt="Yanina Menaker, Licensed Esthetician"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: about?.photo_position || '50% 50%',
                }}
              />
            </div>
            {/* Bio */}
            <div>
              <p className="eyebrow mb-3">{ab.eyebrow}</p>
              <h2 className="mb-6">{ab.name}</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">{ab.bio1}</p>
              <p className="mb-4 text-muted-foreground leading-relaxed">{ab.bio2}</p>
              <p className="mb-4 text-muted-foreground leading-relaxed">{ab.bio3}</p>
              {ab.bio4 && (
                <p className="mb-4 text-muted-foreground leading-relaxed">{ab.bio4}</p>
              )}
              <div className="mb-8" />
              <div className="flex flex-wrap gap-3">
                {ab.badges.map((badge) => (
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
      <section id="gallery" className="px-6 py-24 bg-muted">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow mb-3 text-center">{tr.gallery.eyebrow}</p>
          <h2 className="mb-4 text-center">{tr.gallery.heading}</h2>
          <p className="mb-14 text-center text-muted-foreground max-w-md mx-auto">
            {tr.gallery.body}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {about?.gallery && about.gallery.length > 0
              ? about.gallery.map((img, i) => (
                  <div key={`${img.url}-${i}`} className="relative">
                    <TreatmentMedia
                      before={img.url}
                      after={img.urlAfter || undefined}
                      beforePos={img.position}
                      afterPos={img.positionAfter}
                      beforeScale={img.scale}
                      afterScale={img.scaleAfter}
                      title={tr.gallery.heading}
                      aspectClass="aspect-square"
                    />
                    <button
                      type="button"
                      onClick={() => setLightbox(img)}
                      aria-label={tr.gallery.enlarge}
                      className="absolute right-2 top-2 z-10 rounded-full bg-foreground/60 p-1.5 text-background backdrop-blur-xs transition-colors hover:bg-foreground/80"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              : Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-secondary flex items-center justify-center"
                  >
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">{tr.gallery.photoLabel} {i + 1}</span>
                  </div>
                ))}
          </div>
          {about?.instagram_url && (
            <div className="mt-12 text-center">
              <Button asChild variant="default" size="pill">
                <a
                  href={about.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram aria-hidden />
                  {tr.gallery.instagramCta}
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── LEAVE A REVIEW (form) ── */}
      <ReviewForm />

      {/* ── WHAT CLIENTS SAY (animated rotator) ── */}
      <TestimonialsRotate />

      {/* ── BOOK CTA BAND ── */}
      <section id="book" className="px-6 py-24 bg-accent/15">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4">{tr.book.heading}</h2>
          <p className="mb-8 text-muted-foreground">{tr.book.body}</p>
          <Button
            variant="default"
            size="pill"
            onClick={() => openBooking()}
          >
            {tr.book.cta}
            <span aria-hidden>→</span>
          </Button>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="px-6 py-24 bg-background scroll-mt-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-3 text-center">{tr.contact.eyebrow}</p>
          <h2 className="mb-14 text-center">{tr.contact.heading}</h2>
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            {/* Location */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border">
                <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{tr.contact.addressLabel}</p>
              <p className="text-sm font-medium">{about?.address || tr.contact.addressDefault}</p>
            </div>
            {/* Phone */}
            {(about?.phone) && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                </div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{tr.contact.phoneLabel}</p>
                <a href={`tel:${about.phone}`} className="text-sm font-medium hover:text-accent transition-colors">{about.phone}</a>
              </div>
            )}
            {/* Email */}
            {(about?.email) && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                </div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{tr.contact.emailLabel}</p>
                <a href={`mailto:${about.email}`} className="text-sm font-medium hover:text-accent transition-colors">{about.email}</a>
              </div>
            )}
            {/* Show placeholder cards if phone/email not set */}
            {!about?.phone && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                </div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{tr.contact.phoneLabel}</p>
                <p className="text-sm text-muted-foreground">—</p>
              </div>
            )}
            {!about?.email && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                </div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{tr.contact.emailLabel}</p>
                <p className="text-sm text-muted-foreground">—</p>
              </div>
            )}
          </div>
          <ContactForm />
        </div>
      </section>

      {/* ── POLICIES ── */}
      <section id="policies" className="px-6 py-24 bg-muted scroll-mt-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-3 text-center">{tr.policies.eyebrow}</p>
          <h2 className="mb-14 text-center">{tr.policies.heading}</h2>
          <PoliciesAccordion sections={tr.policies.sections} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-foreground text-background px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-3 mb-12">
            {/* Brand */}
            <div>
              <Image
                src="/images/skin-beauty-logo.png"
                alt="Skin Beauty by Yanina Menaker"
                width={60}
                height={140}
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
                  <a key={label} href={href} className="text-sm text-background/70 hover:text-background transition-colors duration-[var(--duration-normal)]">
                    {label}
                  </a>
                ))}
              </div>
            </div>
            {/* Social */}
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-background/50">{tr.footer.followAlong}</p>
              <div className="flex flex-col gap-2">
                <a href={about?.instagram_url || '#'} target={about?.instagram_url ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm text-background/70 hover:text-background transition-colors duration-[var(--duration-normal)]">Instagram</a>
                <a href={about?.tiktok_url || '#'} target={about?.tiktok_url ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm text-background/70 hover:text-background transition-colors duration-[var(--duration-normal)]">TikTok</a>
              </div>
            </div>
          </div>
          <div className="border-t border-background/15 pt-6 text-xs text-background/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>{tr.footer.copyright}</span>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="hover:text-background/70 transition-colors duration-[var(--duration-normal)]">
                {(tr.footer as any).privacyLink}
              </a>
              <a href="/terms" className="hover:text-background/70 transition-colors duration-[var(--duration-normal)]">
                {(tr.footer as any).termsLink}
              </a>
              <a
                href="/admin/reviews"
                className="hover:text-background/60 transition-colors duration-[var(--duration-normal)]"
                title="Admin Panel"
              >
                🔐
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-[10px] text-background/30">
            Created &amp; designed by{' '}
            <a
              href="https://instagram.com/olezh_ax"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-background/60 transition-colors duration-[var(--duration-normal)]"
            >
              @olezh_ax
            </a>
          </div>
        </div>
      </footer>

      {bookingOpen && (
        <BookingModal
          phone={about?.phone}
          instagramUrl={about?.instagram_url}
          initialService={bookingTreatment}
          categories={serviceCategories.map((c: any) => ({
            title: c.title,
            treatments: (c.treatments || []).map((t: any) => ({
              title: t.title,
              price: t.price,
              duration: t.duration,
            })),
          }))}
          onClose={() => setBookingOpen(false)}
        />
      )}

      {brandsOpen && about?.brands && (
        <BrandsModal
          brands={about.brands}
          title={tr.services.brandsTitle}
          closeLabel={tr.services.brandsClose}
          andMoreLabel={tr.services.brandsMore}
          onClose={() => setBrandsOpen(false)}
        />
      )}

      {lightbox && (
        <GalleryLightbox
          before={lightbox.url}
          after={lightbox.urlAfter || undefined}
          beforePos={lightbox.position}
          afterPos={lightbox.positionAfter}
          beforeScale={lightbox.scale}
          afterScale={lightbox.scaleAfter}
          title={tr.gallery.heading}
          beforeLabel={tr.gallery.before}
          afterLabel={tr.gallery.after}
          closeLabel={tr.services.brandsClose}
          onClose={() => setLightbox(null)}
        />
      )}

    </main>
  );
}
