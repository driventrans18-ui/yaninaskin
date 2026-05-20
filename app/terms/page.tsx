'use client';

import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

export default function TermsPage() {
  const { lang } = useLanguage();
  const tr = (t[lang] as any).legal;
  const terms = tr.terms;
  const footer = t[lang].footer;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-5">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <a
            href="/"
            className="font-serif text-base tracking-[0.18em] uppercase text-foreground"
          >
            Skin Beauty
            <span className="block text-[9px] tracking-[0.22em] uppercase text-muted-foreground mt-0.5">
              by Yanina Menaker
            </span>
          </a>
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {tr.backHome}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-serif text-4xl md:text-5xl mb-4">{terms.title}</h1>
        <p className="text-muted-foreground text-sm mb-14">{terms.effectiveDate}</p>

        <div className="space-y-10">
          {terms.sections.map((section: { heading: string; body: string }) => (
            <section key={section.heading}>
              <h2 className="font-serif text-xl mb-3 text-foreground">{section.heading}</h2>
              <p className="text-foreground/75 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-border px-6 py-8 mt-16">
        <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{footer.copyright}</span>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-foreground transition-colors">
              {footer.privacyLink}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
