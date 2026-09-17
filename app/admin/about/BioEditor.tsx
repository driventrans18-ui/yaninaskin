'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Upload, CheckCircle2, CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { compressImage } from '@/lib/compressImage';
import { uploadWithProgress } from '@/lib/imageTools';
import { getBio, publishBio, saveBioDraft, type BioDraft, type BioLangFields } from '../../actions/bio';
import AdminShell from '../_components/AdminShell';
import ImageAdjuster from '../_components/ImageAdjuster';
import ImageUploadField from '../_components/ImageUploadField';
import { useAdminT } from '../_components/AdminLang';
import { useToast } from '../_components/ui/Toast';
import { CardSkeleton, Chip, ErrorState, Field, SectionTitle } from '../_components/ui/Bits';
import { ConfirmDialog } from '../_components/ui/Dialog';
import UnsavedGuard from '../_components/ui/UnsavedGuard';
import { relativeSubmitted } from '../bookings/bookingFormat';

type Lang = 'en' | 'uk';
const TEXT_FIELDS: (keyof BioLangFields)[] = ['eyebrow', 'name', 'headline', 'bio1', 'bio2', 'bio3', 'bio4', 'yearsExperience'];

export default function BioEditor() {
  const { t, lang: adminLang, fmt } = useAdminT();
  const { toast } = useToast();
  const [draft, setDraft] = useState<BioDraft | null>(null);
  const [live, setLive] = useState<BioDraft | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mobileLang, setMobileLang] = useState<Lang>('en');
  const [previewLang, setPreviewLang] = useState<Lang>('en');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const savedDraft = useRef<string>('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setError(null);
    const r = await getBio();
    if (!r.success) setError(r.error || 'load failed');
    setDraft(r.draft);
    setLive(r.live);
    setPublishedAt(r.publishedAt);
    savedDraft.current = JSON.stringify(r.draft);
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  // Autosave the draft 1.2s after the last edit.
  useEffect(() => {
    if (!draft) return;
    const snap = JSON.stringify(draft);
    if (snap === savedDraft.current) return;
    setSaveState('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const r = await saveBioDraft(draft);
      if (r.success) {
        savedDraft.current = snap;
        setSaveState('saved');
      } else {
        setSaveState('idle');
        toast({ title: t.toastError, description: r.error, tone: 'error' });
      }
    }, 1200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [draft, toast, t]);

  const unpublished = useMemo(() => draft && live && JSON.stringify(draft) !== JSON.stringify(live), [draft, live]);
  const dirtyUnsaved = draft ? JSON.stringify(draft) !== savedDraft.current : false;

  const setLang = (l: Lang, k: keyof BioLangFields, v: BioLangFields[keyof BioLangFields]) => setDraft((d) => (d ? { ...d, [l]: { ...d[l], [k]: v } } : d));
  const setTop = <K extends keyof BioDraft>(k: K, v: BioDraft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const publish = async () => {
    if (!draft) return;
    setPublishing(true);
    const r = await publishBio(draft);
    setPublishing(false);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    toast({ title: t.bioPublished });
    await load();
  };

  const discard = async () => {
    if (!live) return;
    setConfirmDiscard(false);
    setDraft(live);
    const r = await saveBioDraft(live);
    if (r.success) savedDraft.current = JSON.stringify(live);
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const url = await uploadWithProgress(compressed, 'bio');
      setTop('photo_url', url);
      setTop('photo_position', '50% 50%');
      setTop('photo_scale', 1);
    } catch (err) {
      toast({ title: t.uploadFailed, description: err instanceof Error ? err.message : undefined, tone: 'error' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const missing = (l: Lang, k: keyof BioLangFields) => {
    if (!draft) return false;
    const other: Lang = l === 'en' ? 'uk' : 'en';
    const v = draft[l][k];
    const o = draft[other][k];
    const has = (x: unknown) => (Array.isArray(x) ? x.length > 0 : Boolean(x));
    return !has(v) && has(o);
  };

  // One field, EN and UA side by side (stacked with a toggle on phones).
  const pair = (k: keyof BioLangFields, label: string, kind: 'input' | 'textarea' | 'list' = 'input', hint?: string) => {
    if (!draft) return null;
    const render = (l: Lang) => {
      const val = draft[l][k];
      const warn = missing(l, k);
      const labelNode = (
        <span className="inline-flex flex-wrap items-center gap-2">
          {label} · {l === 'en' ? 'EN' : 'UA'}
          {warn && <Chip tone="warn">{l === 'uk' ? t.bioMissingUk : t.bioMissingEn}</Chip>}
        </span>
      );
      if (kind === 'list') {
        return (
          <Field label={labelNode} hint={hint}>
            <Input value={(val as string[]).join(', ')} onChange={(e) => setLang(l, k, e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} className="h-11" />
          </Field>
        );
      }
      if (kind === 'textarea') {
        return (
          <Field label={labelNode}>
            <Textarea rows={3} value={val as string} onChange={(e) => setLang(l, k, e.target.value)} />
          </Field>
        );
      }
      return (
        <Field label={labelNode} hint={hint}>
          <Input value={val as string} onChange={(e) => setLang(l, k, e.target.value)} className="h-11" />
        </Field>
      );
    };
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <div className={mobileLang === 'uk' ? 'hidden md:block' : ''}>{render('en')}</div>
        <div className={mobileLang === 'en' ? 'hidden md:block' : ''}>{render('uk')}</div>
      </div>
    );
  };

  const previewFields = draft ? draft[previewLang] : null;
  const fallback = draft ? draft.en : null;
  type StrKey = 'eyebrow' | 'name' | 'headline' | 'bio1' | 'bio2' | 'bio3' | 'bio4' | 'yearsExperience';
  const pv = (k: StrKey): string => previewFields?.[k] || fallback?.[k] || '';
  const pvList = (k: 'badges' | 'specialties'): string[] => (previewFields?.[k]?.length ? previewFields[k] : fallback?.[k]) || [];
  const pvCerts = () => (previewFields?.certifications?.length ? previewFields.certifications : fallback?.certifications) || [];

  return (
    <AdminShell
      active="bio"
      title={t.bioTitle}
      subtitle={t.bioIntro}
      maxWidth="max-w-6xl"
      actions={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div role="tablist" aria-label={t.adminLanguage} className="inline-flex rounded-full border border-border p-0.5 md:hidden">
            {(['en', 'uk'] as Lang[]).map((l) => (
              <button key={l} role="tab" aria-selected={mobileLang === l} type="button" onClick={() => setMobileLang(l)} className={`h-10 rounded-full px-4 text-sm ${mobileLang === l ? 'bg-foreground text-background' : 'text-muted-foreground'}`}>
                {l === 'en' ? 'EN' : 'UA'}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {saveState === 'saving' ? t.notesSaving : unpublished ? t.bioUnpublished : t.bioUpToDate}
            </span>
            {unpublished && (
              <Button variant="ghost" className="h-11 rounded-full" onClick={() => setConfirmDiscard(true)}>
                {t.bioDiscardDraft}
              </Button>
            )}
            <Button className="h-11 rounded-full" onClick={() => void publish()} disabled={publishing || !unpublished}>
              <CloudUpload /> {t.bioPublish}
            </Button>
          </div>
        </div>
      }
    >
      <UnsavedGuard dirty={dirtyUnsaved} />
      {loading || !draft ? (
        <CardSkeleton count={4} />
      ) : error ? (
        <ErrorState body={error} onRetry={() => void load()} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            {/* Photo */}
            <section>
              <SectionTitle>{t.bioPhoto}</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
                <div>
                  {draft.photo_url ? (
                    <ImageAdjuster src={draft.photo_url} position={draft.photo_position} scale={draft.photo_scale} aspectClass="aspect-[3/4]" onChange={(p) => setTop('photo_position', p)} onScaleChange={(s) => setTop('photo_scale', s)} />
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">{t.photoPreview}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && void uploadPhoto(e.target.files[0])} />
                  <Button variant="outline" className="h-11 rounded-full" disabled={uploading} onClick={() => fileRef.current?.click()}>
                    <Upload /> {uploading ? t.uploading : draft.photo_url ? t.replace : t.uploadImage}
                  </Button>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle>{t.bioStory}</SectionTitle>
              {pair('eyebrow', t.bioEyebrow)}
              {pair('name', t.bioName)}
              {pair('headline', t.bioHeadline, 'input', t.bioHeadlineHint)}
              {pair('bio1', fmt(t.bioParagraph, { n: 1 }), 'textarea')}
              {pair('bio2', fmt(t.bioParagraph, { n: 2 }), 'textarea')}
              {pair('bio3', fmt(t.bioParagraph, { n: 3 }), 'textarea')}
              {pair('bio4', fmt(t.bioParagraph, { n: 4 }), 'textarea')}
              {pair('badges', t.bioBadges, 'list', t.bioBadgesHint)}
            </section>

            <section className="space-y-4">
              <SectionTitle>{t.bioCertifications}</SectionTitle>
              {pair('yearsExperience', t.bioYears)}
              {pair('specialties', t.bioSpecialties, 'list', t.bioSpecialtiesHint)}
              <div className="space-y-3">
                {Array.from({ length: Math.max(draft.en.certifications.length, draft.uk.certifications.length) }).map((_, i) => (
                  <div key={i} className="grid gap-3 rounded-xl border border-border p-3 md:grid-cols-[1fr_1fr_auto]">
                    <Field label={`${t.bioCertTitle} · EN`}>
                      <Input value={draft.en.certifications[i]?.title ?? ''} onChange={(e) => setLang('en', 'certifications', draft.en.certifications.map((c, j) => (j === i ? { ...c, title: e.target.value } : c)).concat(i >= draft.en.certifications.length ? [{ title: e.target.value }] : []))} className="h-11" />
                    </Field>
                    <Field label={`${t.bioCertTitle} · UA`}>
                      <Input value={draft.uk.certifications[i]?.title ?? ''} onChange={(e) => setLang('uk', 'certifications', draft.uk.certifications.map((c, j) => (j === i ? { ...c, title: e.target.value } : c)).concat(i >= draft.uk.certifications.length ? [{ title: e.target.value }] : []))} className="h-11" />
                    </Field>
                    <div className="flex items-end gap-2">
                      <ImageUploadField label={t.bioCertImage} folder="bio" value={draft.en.certifications[i]?.image ?? null} onChange={(url) => { setLang('en', 'certifications', draft.en.certifications.map((c, j) => (j === i ? { ...c, image: url ?? undefined } : c))); setLang('uk', 'certifications', draft.uk.certifications.map((c, j) => (j === i ? { ...c, image: url ?? undefined } : c))); }} />
                      <Button variant="ghost" size="icon-lg" className="h-11 w-11 rounded-full" aria-label={t.remove} onClick={() => { setLang('en', 'certifications', draft.en.certifications.filter((_, j) => j !== i)); setLang('uk', 'certifications', draft.uk.certifications.filter((_, j) => j !== i)); }}>
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="h-11 rounded-full" onClick={() => { setLang('en', 'certifications', [...draft.en.certifications, { title: '' }]); setLang('uk', 'certifications', [...draft.uk.certifications, { title: '' }]); }}>
                  <Plus /> {t.bioAddCertification}
                </Button>
              </div>
            </section>
          </div>

          {/* Live preview */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-2 flex items-center justify-between">
              <SectionTitle>{t.livePreview}</SectionTitle>
              <div role="tablist" aria-label={t.bioPreviewLang} className="inline-flex rounded-full border border-border p-0.5">
                {(['en', 'uk'] as Lang[]).map((l) => (
                  <button key={l} role="tab" aria-selected={previewLang === l} type="button" onClick={() => setPreviewLang(l)} className={`h-8 rounded-full px-3 text-xs ${previewLang === l ? 'bg-foreground text-background' : 'text-muted-foreground'}`}>
                    {l === 'en' ? 'EN' : 'UA'}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mx-auto mb-4 aspect-[3/4] w-40 overflow-hidden rounded-2xl bg-secondary">
                {draft.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.photo_url} alt="" className="h-full w-full object-cover" style={{ objectPosition: draft.photo_position, transform: `scale(${draft.photo_scale})` }} />
                )}
              </div>
              <p className="eyebrow mb-1">{pv('eyebrow') || '—'}</p>
              <h2 className="font-serif text-2xl">{pv('name') || '—'}</h2>
              {pv('headline') && <p className="mt-1 text-sm text-muted-foreground">{pv('headline')}</p>}
              {(['bio1', 'bio2', 'bio3', 'bio4'] as const).map((k) => pv(k) && <p key={k} className="mt-3 text-sm leading-relaxed text-muted-foreground">{pv(k)}</p>)}
              <div className="mt-4 flex flex-wrap gap-2">
                {pvList('badges').map((b) => (
                  <Badge key={b} variant="outline">{b}</Badge>
                ))}
              </div>
              {pvList('specialties').length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">{pvList('specialties').join(' · ')}</p>
              )}
              {pvCerts().length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {pvCerts().map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-accent" aria-hidden /> {c.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{publishedAt ? fmt(t.bioLastPublished, { when: relativeSubmitted(publishedAt, adminLang) }) : t.bioNeverPublished}</p>
          </aside>
        </div>
      )}
      <ConfirmDialog open={confirmDiscard} onClose={() => setConfirmDiscard(false)} onConfirm={discard} title={t.bioDiscardDraft} body={t.unsavedBody} confirmLabel={t.bioDiscardDraft} danger />
    </AdminShell>
  );
}
