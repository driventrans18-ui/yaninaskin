'use client';

import React from 'react';

type Policy = { title: string; body: string };
type Section = { heading: string; items: Policy[] };

export default function PoliciesAccordion({ sections }: { sections: Section[] }) {
  const [open, setOpen] = React.useState<string | null>(null);

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <div key={section.heading}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{section.heading}</p>
          <div className="divide-y divide-border">
            {section.items.map((policy) => {
              const key = `${section.heading}::${policy.title}`;
              return (
                <div key={policy.title}>
                  <button
                    onClick={() => setOpen(open === key ? null : key)}
                    className="flex w-full items-center justify-between py-5 text-left text-sm font-medium text-foreground transition-colors hover:text-accent"
                    aria-expanded={open === key}
                  >
                    <span>{policy.title}</span>
                    <svg
                      className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open === key ? 'rotate-180' : 'rotate-0'}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${open === key ? 'max-h-64 pb-5' : 'max-h-0'}`}>
                    <p className="text-sm leading-relaxed text-muted-foreground">{policy.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
