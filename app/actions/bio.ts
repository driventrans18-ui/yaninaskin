'use server';

import { requireAdmin } from '@/lib/requireAdmin';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { isSchemaError, errorMessage } from '@/lib/dbErrors';

export interface Certification {
  title: string;
  image?: string;
}

export interface BioLangFields {
  eyebrow: string;
  name: string;
  headline: string;
  bio1: string;
  bio2: string;
  bio3: string;
  bio4: string;
  badges: string[];
  yearsExperience: string;
  certifications: Certification[];
  specialties: string[];
}

export interface BioDraft {
  en: BioLangFields;
  uk: BioLangFields;
  photo_url: string;
  photo_position: string;
  photo_scale: number;
}

const EMPTY_LANG: BioLangFields = {
  eyebrow: '',
  name: '',
  headline: '',
  bio1: '',
  bio2: '',
  bio3: '',
  bio4: '',
  badges: [],
  yearsExperience: '',
  certifications: [],
  specialties: [],
};

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const strArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []);

function langFields(row: Record<string, unknown>, lang: 'en' | 'uk'): BioLangFields {
  const translations = (row.translations && typeof row.translations === 'object' ? row.translations : {}) as Record<string, Record<string, unknown>>;
  const fields = (row.bio_fields && typeof row.bio_fields === 'object' ? row.bio_fields : {}) as Record<string, Record<string, unknown>>;
  const base: Record<string, unknown> = lang === 'en' ? row : translations.uk || {};
  const extra = fields[lang] || {};
  return {
    eyebrow: str(base.eyebrow),
    name: str(base.name),
    headline: str(extra.headline),
    bio1: str(base.bio1),
    bio2: str(base.bio2),
    bio3: str(base.bio3),
    bio4: str(base.bio4),
    badges: strArr(base.badges),
    yearsExperience: str(extra.years_experience),
    certifications: Array.isArray(extra.certifications)
      ? (extra.certifications as unknown[])
          .filter((c): c is Record<string, unknown> => Boolean(c) && typeof c === 'object')
          .map((c) => ({ title: str(c.title), image: str(c.image) || undefined }))
          .filter((c) => c.title)
      : [],
    specialties: strArr(extra.specialties),
  };
}

// The live (published) bio as a draft-shaped object.
export async function liveBioFromRow(row: Record<string, unknown> | null): Promise<BioDraft> {
  if (!row) return { en: EMPTY_LANG, uk: EMPTY_LANG, photo_url: '', photo_position: '50% 50%', photo_scale: 1 };
  return {
    en: langFields(row, 'en'),
    uk: langFields(row, 'uk'),
    photo_url: str(row.photo_url),
    photo_position: str(row.photo_position) || '50% 50%',
    photo_scale: typeof row.photo_scale === 'number' ? row.photo_scale : 1,
  };
}

function cleanDraft(d: BioDraft): BioDraft {
  const cleanLang = (l: Partial<BioLangFields> | undefined): BioLangFields => ({
    eyebrow: str(l?.eyebrow),
    name: str(l?.name),
    headline: str(l?.headline),
    bio1: str(l?.bio1),
    bio2: str(l?.bio2),
    bio3: str(l?.bio3),
    bio4: str(l?.bio4),
    badges: strArr(l?.badges).map((b) => b.trim()),
    yearsExperience: str(l?.yearsExperience),
    certifications: Array.isArray(l?.certifications)
      ? l!.certifications.map((c) => ({ title: str(c?.title).trim(), image: str(c?.image) || undefined })).filter((c) => c.title)
      : [],
    specialties: strArr(l?.specialties).map((s) => s.trim()),
  });
  return {
    en: cleanLang(d?.en),
    uk: cleanLang(d?.uk),
    photo_url: str(d?.photo_url),
    photo_position: str(d?.photo_position) || '50% 50%',
    photo_scale: typeof d?.photo_scale === 'number' ? Math.max(1, Math.min(3, d.photo_scale)) : 1,
  };
}

export async function getBio(): Promise<{
  success: boolean;
  live: BioDraft;
  draft: BioDraft;
  publishedAt: string | null;
  schemaOutdated: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();
    const { data, error } = await getAdminClient().from('about_content').select('*').limit(1).maybeSingle();
    if (error) throw error;
    const row = (data as Record<string, unknown> | null) ?? null;
    const live = await liveBioFromRow(row);
    const draftRaw = row?.bio_draft;
    const draft = draftRaw && typeof draftRaw === 'object' ? cleanDraft(draftRaw as BioDraft) : live;
    return {
      success: true,
      live,
      draft,
      publishedAt: typeof row?.bio_published_at === 'string' ? row.bio_published_at : null,
      schemaOutdated: Boolean(row) && !('bio_draft' in (row as object)),
    };
  } catch (error) {
    const empty = await liveBioFromRow(null);
    return { success: false, live: empty, draft: empty, publishedAt: null, schemaOutdated: isSchemaError(error), error: errorMessage(error) };
  }
}

async function singletonId(): Promise<number | null> {
  const { data } = await getAdminClient().from('about_content').select('id').limit(1).maybeSingle();
  return data?.id ?? null;
}

export async function saveBioDraft(draft: BioDraft): Promise<{ success: boolean; error?: string; schemaOutdated?: boolean }> {
  try {
    await requireAdmin();
    const id = await singletonId();
    const payload = { bio_draft: cleanDraft(draft), updated_at: new Date().toISOString() };
    const q = id ? getAdminClient().from('about_content').update(payload).eq('id', id) : getAdminClient().from('about_content').insert([payload]);
    const { error } = await q;
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error), schemaOutdated: isSchemaError(error) };
  }
}

// Copy the draft into the live columns the website reads.
export async function publishBio(draft: BioDraft): Promise<{ success: boolean; error?: string; schemaOutdated?: boolean }> {
  try {
    await requireAdmin();
    const d = cleanDraft(draft);
    const db = getAdminClient();
    const id = await singletonId();
    const { data: existing } = id ? await db.from('about_content').select('translations').eq('id', id).maybeSingle() : { data: null };
    const translations = (existing?.translations && typeof existing.translations === 'object' ? existing.translations : {}) as Record<string, unknown>;
    const ukHasText = Object.values(d.uk).some((v) => (Array.isArray(v) ? v.length > 0 : Boolean(v)));
    const payload: Record<string, unknown> = {
      eyebrow: d.en.eyebrow,
      name: d.en.name,
      bio1: d.en.bio1,
      bio2: d.en.bio2,
      bio3: d.en.bio3,
      bio4: d.en.bio4 || null,
      badges: d.en.badges,
      photo_url: d.photo_url || null,
      photo_position: d.photo_position,
      translations: {
        ...translations,
        uk: ukHasText
          ? { eyebrow: d.uk.eyebrow, name: d.uk.name, bio1: d.uk.bio1, bio2: d.uk.bio2, bio3: d.uk.bio3, bio4: d.uk.bio4, badges: d.uk.badges }
          : undefined,
      },
      bio_fields: {
        en: { headline: d.en.headline, years_experience: d.en.yearsExperience, certifications: d.en.certifications, specialties: d.en.specialties },
        uk: { headline: d.uk.headline, years_experience: d.uk.yearsExperience, certifications: d.uk.certifications, specialties: d.uk.specialties },
      },
      photo_scale: d.photo_scale,
      bio_draft: d,
      bio_published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const q = id ? db.from('about_content').update(payload).eq('id', id) : db.from('about_content').insert([payload]);
    const { error } = await q;
    if (error) {
      if (!isSchemaError(error)) throw error;
      // Pre-migration: publish the legacy columns only.
      const legacy: Record<string, unknown> = {
        eyebrow: payload.eyebrow, name: payload.name, bio1: payload.bio1, bio2: payload.bio2, bio3: payload.bio3, bio4: payload.bio4,
        badges: payload.badges, photo_url: payload.photo_url, photo_position: payload.photo_position, translations: payload.translations,
      };
      const q2 = id ? db.from('about_content').update(legacy).eq('id', id) : db.from('about_content').insert([legacy]);
      const { error: e2 } = await q2;
      if (e2) throw e2;
      return { success: true, schemaOutdated: true };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error), schemaOutdated: isSchemaError(error) };
  }
}
