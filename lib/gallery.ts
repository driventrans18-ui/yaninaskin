// Gallery items live as a JSON array on about_content.gallery. Kept tolerant so
// rows written by the old admin (url/position/scale only) still load.
export interface GalleryItem {
  id: string;
  url: string;
  position: string;
  scale?: number;
  urlAfter?: string;
  positionAfter?: string;
  scaleAfter?: number;
  thumb?: string;
  alt?: { en?: string; uk?: string };
  tags?: string[];
  client?: boolean; // shows a client → consent required
  consent?: boolean;
  hidden?: boolean;
  cover?: boolean;
}

const clampScale = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(1, Math.min(3, v)) : 1);

export function newItemId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeGalleryItem(raw: unknown, index: number): GalleryItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const it = raw as Record<string, unknown>;
  if (typeof it.url !== 'string' || !it.url) return null;
  const item: GalleryItem = {
    id: typeof it.id === 'string' && it.id ? it.id : `legacy-${index}-${it.url.slice(-24).replace(/[^a-z0-9]/gi, '')}`,
    url: it.url,
    position: typeof it.position === 'string' ? it.position : '50% 50%',
    scale: clampScale(it.scale),
  };
  if (typeof it.urlAfter === 'string' && it.urlAfter) {
    item.urlAfter = it.urlAfter;
    item.positionAfter = typeof it.positionAfter === 'string' ? it.positionAfter : '50% 50%';
    item.scaleAfter = clampScale(it.scaleAfter);
  }
  if (typeof it.thumb === 'string' && it.thumb) item.thumb = it.thumb;
  if (it.alt && typeof it.alt === 'object') {
    const a = it.alt as Record<string, unknown>;
    item.alt = { en: typeof a.en === 'string' ? a.en : undefined, uk: typeof a.uk === 'string' ? a.uk : undefined };
  }
  if (Array.isArray(it.tags)) item.tags = it.tags.filter((x): x is string => typeof x === 'string');
  if (it.client === true) item.client = true;
  if (it.consent === true) item.consent = true;
  if (it.hidden === true) item.hidden = true;
  if (it.cover === true) item.cover = true;
  return item;
}

export function normalizeGallery(raw: unknown): GalleryItem[] {
  const parsed = typeof raw === 'string' ? safeParse(raw) : raw;
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeGalleryItem).filter((x): x is GalleryItem => Boolean(x));
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

// What the public website shows: visible items, cover first, client photos
// only with consent.
export function publicGallery(items: GalleryItem[]): GalleryItem[] {
  return items
    .filter((it) => !it.hidden && (!it.client || it.consent))
    .sort((a, b) => Number(Boolean(b.cover)) - Number(Boolean(a.cover)));
}
