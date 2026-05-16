'use client';

import {
  ImageComparison,
  ImageComparisonImage,
  ImageComparisonSlider,
} from '@/components/ui/image-comparison';

export default function TreatmentMedia({
  before,
  after,
  beforePos,
  afterPos,
  title,
  className,
  aspectClass = 'aspect-[4/3]',
}: {
  before?: string;
  after?: string;
  beforePos?: string;
  afterPos?: string;
  title: string;
  className?: string;
  aspectClass?: string;
}) {
  if (!before && !after) return null;

  if (before && after) {
    return (
      <ImageComparison
        className={`relative ${aspectClass} w-full overflow-hidden rounded-xl border border-border ${className ?? ''}`}
        enableHover
      >
        <ImageComparisonImage
          src={before}
          alt={`${title} — before`}
          position="left"
          objectPosition={beforePos}
        />
        <ImageComparisonImage
          src={after}
          alt={`${title} — after`}
          position="right"
          objectPosition={afterPos}
        />
        <ImageComparisonSlider className="w-0.5 bg-white/70 backdrop-blur-xs">
          <div className="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md ring-2 ring-accent" />
        </ImageComparisonSlider>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-foreground/70 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-background">
          Before
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-foreground/70 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-background">
          After
        </span>
      </ImageComparison>
    );
  }

  const single = (before || after) as string;
  const singlePos = before ? beforePos : afterPos;
  return (
    <img
      src={single}
      alt={title}
      className={`${aspectClass} w-full rounded-xl border border-border object-cover ${className ?? ''}`}
      style={{ objectPosition: singlePos || '50% 50%' }}
    />
  );
}
