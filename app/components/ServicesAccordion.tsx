'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import TreatmentMedia from './TreatmentMedia';
import type { ServiceCategory } from '../translations';

export default function ServicesAccordion({
  categories,
}: {
  categories: ServiceCategory[];
}) {
  const [open, setOpen] = React.useState<number | null>(null);

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
      {categories.map((cat, i) => {
        const isOpen = open === i;
        return (
          <div key={cat.title}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:text-accent"
              aria-expanded={isOpen}
            >
              <span className="font-serif text-lg sm:text-xl">{cat.title}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {cat.treatments.length}
                </span>
                <svg
                  className={`h-4 w-4 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6">
                  {cat.description && (
                    <p className="mb-4 text-sm italic text-muted-foreground max-w-xl">
                      {cat.description}
                    </p>
                  )}
                  <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-background/40">
                    {cat.treatments.map((tx) => (
                      <div
                        key={tx.title}
                        className="flex flex-col gap-1.5 px-5 py-4"
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <h4 className="font-serif text-base leading-snug">
                            {tx.title}
                          </h4>
                          <Badge variant="accent" className="shrink-0">
                            {tx.price}
                          </Badge>
                        </div>
                        {tx.duration && (
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">
                            {tx.duration}
                          </p>
                        )}
                        {tx.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {tx.description}
                          </p>
                        )}
                        {tx.note && (
                          <p className="text-xs italic text-muted-foreground/80">
                            {tx.note}
                          </p>
                        )}
                        <TreatmentMedia
                          before={tx.imageBefore}
                          after={tx.imageAfter}
                          beforePos={tx.imageBeforePos}
                          afterPos={tx.imageAfterPos}
                          title={tx.title}
                          className="mt-3 max-w-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
