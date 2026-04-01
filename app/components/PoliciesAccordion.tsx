'use client';

import React from 'react';

type Policy = { title: string; body: string };

export default function PoliciesAccordion({ policies }: { policies: Policy[] }) {
  const [open, setOpen] = React.useState<number | null>(null);

  return (
    <div className="divide-y divide-border">
      {policies.map((policy, i) => (
        <div key={policy.title}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between py-5 text-left text-sm font-medium text-foreground transition-colors hover:text-accent"
            aria-expanded={open === i}
          >
            <span>{policy.title}</span>
            <svg
              className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                open === i ? 'rotate-180' : 'rotate-0'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              open === i ? 'max-h-48 pb-5' : 'max-h-0'
            }`}
          >
            <p className="text-sm leading-relaxed text-muted-foreground">{policy.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
