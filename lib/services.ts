// Service rows as stored in `services`, plus helpers to read them per language.
export interface ServiceTranslation {
  treatment_title?: string;
  treatment_description?: string;
  treatment_note?: string;
  category_title?: string;
  category_description?: string;
  prep_notes?: string;
  aftercare_notes?: string;
  contraindications?: string;
}

export interface ServiceRow {
  id: number;
  category_order: number | null;
  category_title: string;
  category_description: string | null;
  treatment_order: number | null;
  treatment_title: string;
  treatment_price: string;
  treatment_duration: string | null;
  treatment_description: string | null;
  treatment_note: string | null;
  treatment_image_before: string | null;
  treatment_image_after: string | null;
  treatment_before_position: string | null;
  treatment_after_position: string | null;
  translations?: { uk?: ServiceTranslation } | null;
  duration_minutes?: number | null;
  buffer_minutes?: number | null;
  price_min?: number | null;
  price_max?: number | null;
  active?: boolean | null;
  bookable?: boolean | null;
  brand_ids?: string[] | null;
  prep_notes?: string | null;
  aftercare_notes?: string | null;
  contraindications?: string | null;
  archived_at?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function isLiveService(s: ServiceRow): boolean {
  return s.active !== false && !s.archived_at && !s.deleted_at;
}

// Text for a field in the requested language, falling back to English.
export function serviceText(s: ServiceRow, lang: string, field: keyof ServiceTranslation): string {
  const uk = lang === 'uk' ? s.translations?.uk?.[field] : undefined;
  if (typeof uk === 'string' && uk.trim()) return uk;
  const en = (s as unknown as Record<string, unknown>)[field];
  return typeof en === 'string' ? en : '';
}

export function ukMissing(s: ServiceRow): boolean {
  const uk = s.translations?.uk;
  return !uk?.treatment_title?.trim();
}

// "$140–160" from numbers, or the fixed price.
export function formatPriceText(min: number | null, max: number | null): string {
  if (min == null) return '';
  if (max != null && max !== min) return `$${min}–${max}`;
  return `$${min}`;
}
