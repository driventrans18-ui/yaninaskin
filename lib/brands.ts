// Brands live as a JSON array on about_content.brands.
export interface BrandItem {
  id: string;
  name: string;
  logo?: string;
  description?: { en?: string; uk?: string };
  website?: string;
  hidden?: boolean;
}

export function brandIdFor(name: string, index: number): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || `brand-${index}`;
}

export function normalizeBrands(raw: unknown): BrandItem[] {
  const parsed = typeof raw === 'string' ? safeParse(raw) : raw;
  if (!Array.isArray(parsed)) return [];
  const seen = new Set<string>();
  const out: BrandItem[] = [];
  parsed.forEach((it, i) => {
    if (!it || typeof it !== 'object') return;
    const b = it as Record<string, unknown>;
    if (typeof b.name !== 'string' || !b.name.trim()) return;
    let id = typeof b.id === 'string' && b.id ? b.id : brandIdFor(b.name, i);
    while (seen.has(id)) id = `${id}-${i}`;
    seen.add(id);
    const item: BrandItem = { id, name: b.name.trim() };
    if (typeof b.logo === 'string' && b.logo) item.logo = b.logo;
    if (b.description && typeof b.description === 'object') {
      const d = b.description as Record<string, unknown>;
      item.description = { en: typeof d.en === 'string' ? d.en : undefined, uk: typeof d.uk === 'string' ? d.uk : undefined };
    }
    if (typeof b.website === 'string' && b.website) item.website = b.website;
    if (b.hidden === true) item.hidden = true;
    out.push(item);
  });
  return out;
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
