'use client';

import { Badge } from '@/components/ui/badge';
import TreatmentMedia from '../../components/TreatmentMedia';

// Mirrors the treatment row in the public ServicesAccordion.
export default function ServiceCardPreview({
  title,
  price,
  duration,
  description,
  note,
  brands,
  prep,
  aftercare,
  before,
  after,
  beforePos,
  afterPos,
}: {
  title: string;
  price: string;
  duration?: string;
  description?: string;
  note?: string;
  brands?: string[];
  prep?: string;
  aftercare?: string;
  before?: string | null;
  after?: string | null;
  beforePos?: string | null;
  afterPos?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-1.5 px-5 py-4">
        <div className="flex items-baseline justify-between gap-4">
          <h4 className="font-serif text-base leading-snug">{title || '—'}</h4>
          <Badge variant="accent" className="shrink-0">
            {price || '$—'}
          </Badge>
        </div>
        {duration && <p className="text-xs uppercase tracking-widest text-muted-foreground">{duration}</p>}
        {description && <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>}
        {note && <p className="text-xs italic text-muted-foreground/80">{note}</p>}
        {brands && brands.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {brands.map((b) => (
              <span key={b} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                {b}
              </span>
            ))}
          </div>
        )}
        {(prep || aftercare) && (
          <dl className="mt-1 grid gap-1 text-xs text-muted-foreground">
            {prep && (
              <div>
                <dt className="inline font-medium text-foreground/80">Prep: </dt>
                <dd className="inline">{prep}</dd>
              </div>
            )}
            {aftercare && (
              <div>
                <dt className="inline font-medium text-foreground/80">Aftercare: </dt>
                <dd className="inline">{aftercare}</dd>
              </div>
            )}
          </dl>
        )}
        <TreatmentMedia before={before ?? undefined} after={after ?? undefined} beforePos={beforePos ?? undefined} afterPos={afterPos ?? undefined} title={title} className="mt-3 max-w-md" />
      </div>
    </div>
  );
}
