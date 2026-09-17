'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Images, Star, Tag, Trash2, Upload, X, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { compressImage } from '@/lib/compressImage';
import { uploadWithProgress, makeThumbnail } from '@/lib/imageTools';
import { newItemId, type GalleryItem } from '@/lib/gallery';
import type { ServiceLite } from '@/lib/booking/types';
import { getGallery, saveGallery } from '../../actions/content';
import { getBookingSettings } from '../../actions/settings';
import AdminShell from '../_components/AdminShell';
import ImageAdjuster from '../_components/ImageAdjuster';
import ImageUploadField from '../_components/ImageUploadField';
import { useAdminT } from '../_components/AdminLang';
import { useToast } from '../_components/ui/Toast';
import { CardSkeleton, Checkbox, Chip, EmptyState, ErrorState, Field, SectionTitle, Switch } from '../_components/ui/Bits';
import Sheet from '../_components/ui/Sheet';
import { ConfirmDialog, Dialog } from '../_components/ui/Dialog';

interface UploadJob {
  id: string;
  name: string;
  pct: number;
  error?: string;
}

export default function GalleryWorkspace() {
  const { t, fmt } = useAdminT();
  const { toast } = useToast();
  const params = useSearchParams();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [services, setServices] = useState<ServiceLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [tagDialog, setTagDialog] = useState(false);
  const [tagDraft, setTagDraft] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const lastSaved = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragFrom = useRef<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [g, s] = await Promise.all([getGallery(), getBookingSettings()]);
      if (!g.success) throw new Error('load failed');
      setItems(g.data);
      setServices(s.services);
      lastSaved.current = JSON.stringify(g.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!loading && params.get('add') === '1') fileRef.current?.click();
  }, [loading, params]);

  // Debounced autosave.
  useEffect(() => {
    if (lastSaved.current === null) return;
    const snap = JSON.stringify(items);
    if (snap === lastSaved.current) return;
    setSaveState('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const r = await saveGallery(items);
      if (r.success) {
        lastSaved.current = snap;
        setSaveState('saved');
      } else {
        setSaveState('idle');
        toast({ title: t.toastError, description: r.error, tone: 'error' });
      }
    }, 900);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [items, toast, t]);

  const update = (id: string, patch: Partial<GalleryItem>) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (ids: string[]) => {
    const removed = items.filter((it) => ids.includes(it.id));
    setItems((prev) => prev.filter((it) => !ids.includes(it.id)));
    setSelected(new Set());
    setOpenId(null);
    toast({
      title: fmt(t.photosDeleted, { n: removed.length }),
      duration: 10000,
      action: { label: t.undo, onClick: () => setItems((prev) => [...prev, ...removed]) },
    });
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    const newJobs = list.map((f) => ({ id: newItemId(), name: f.name, pct: 0 }));
    setJobs((j) => [...j, ...newJobs]);
    let added = 0;
    await Promise.all(
      list.map(async (file, i) => {
        const job = newJobs[i];
        try {
          const compressed = await compressImage(file);
          const thumbFile = await makeThumbnail(compressed);
          const url = await uploadWithProgress(compressed, 'gallery', (pct) => setJobs((j) => j.map((x) => (x.id === job.id ? { ...x, pct } : x))));
          const thumb = thumbFile ? await uploadWithProgress(thumbFile, 'gallery-thumbs').catch(() => undefined) : undefined;
          setItems((prev) => [...prev, { id: newItemId(), url, position: '50% 50%', scale: 1, thumb, alt: { en: '', uk: '' }, tags: [] }]);
          added += 1;
          setJobs((j) => j.filter((x) => x.id !== job.id));
        } catch (err) {
          setJobs((j) => j.map((x) => (x.id === job.id ? { ...x, error: err instanceof Error ? err.message : t.uploadFailed } : x)));
        }
      }),
    );
    if (added) toast({ title: fmt(t.photosAdded, { n: added }) });
    if (fileRef.current) fileRef.current.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
  };

  // Grid reorder: HTML5 drag & drop on desktop, arrows in the editor elsewhere.
  const move = (id: string, dir: -1 | 1) =>
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const reorderTo = (fromId: string, toId: string) =>
    setItems((prev) => {
      const from = prev.findIndex((x) => x.id === fromId);
      const to = prev.findIndex((x) => x.id === toId);
      if (from < 0 || to < 0 || from === to) return prev;
      const next = [...prev];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });

  const setCover = (id: string) => setItems((prev) => prev.map((it) => ({ ...it, cover: it.id === id })));
  const bulk = (patch: Partial<GalleryItem>) => setItems((prev) => prev.map((it) => (selected.has(it.id) ? { ...it, ...patch } : it)));
  const open = openId ? items.find((it) => it.id === openId) ?? null : null;
  const openIndex = open ? items.findIndex((it) => it.id === open.id) : -1;
  const tagNames = useMemo(() => Array.from(new Set(services.map((s) => s.title))), [services]);

  return (
    <AdminShell
      active="gallery"
      title={t.galleryTitle}
      subtitle={t.galleryIntro2}
      maxWidth="max-w-6xl"
      showStorage
      actions={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Button className="h-11 rounded-full" onClick={() => fileRef.current?.click()}>
            <Upload /> {t.uploadPhotos}
          </Button>
          <span className="text-sm text-muted-foreground">{saveState === 'saving' ? t.notesSaving : saveState === 'saved' ? t.saved : ''}</span>
        </div>
      }
    >
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && void uploadFiles(e.target.files)} />
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        className={`mb-6 flex min-h-[88px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center text-sm transition-colors ${dragActive ? 'border-accent bg-accent/10' : 'border-border bg-muted/40 hover:border-foreground/40'}`}
      >
        <Images className="mb-1 size-5 text-muted-foreground" aria-hidden />
        <span className="font-medium">{t.dropOrTap}</span>
        <span className="text-xs text-muted-foreground">{t.dropHint}</span>
      </div>

      {jobs.length > 0 && (
        <ul className="mb-4 space-y-1.5" aria-live="polite">
          {jobs.map((j) => (
            <li key={j.id} className="rounded-xl border border-border px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">{j.name}</span>
                {j.error ? (
                  <button type="button" className="text-xs text-destructive" onClick={() => setJobs((x) => x.filter((y) => y.id !== j.id))}>
                    {j.error} · {t.close}
                  </button>
                ) : (
                  <span className="text-xs tabular-nums text-muted-foreground">{j.pct}%</span>
                )}
              </div>
              {!j.error && (
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={j.pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full bg-accent transition-all" style={{ width: `${j.pct}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {loading ? (
        <CardSkeleton count={2} />
      ) : error ? (
        <ErrorState body={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState icon={<Images />} title={t.galleryEmpty} body={t.galleryEmptyBody} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => {
            const consentIssue = it.client && !it.consent;
            const hiddenOnSite = it.hidden || consentIssue;
            return (
              <li
                key={it.id}
                draggable
                onDragStart={() => (dragFrom.current = it.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (dragFrom.current) reorderTo(dragFrom.current, it.id); dragFrom.current = null; }}
                className={`group relative overflow-hidden rounded-2xl border bg-card ${selected.has(it.id) ? 'border-foreground' : 'border-border'}`}
              >
                <button type="button" onClick={() => setOpenId(it.id)} className="block aspect-square w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={t.editPhoto}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.thumb || it.url} alt={it.alt?.en || ''} className={`h-full w-full object-cover ${hiddenOnSite ? 'opacity-50' : ''}`} style={{ objectPosition: it.position }} />
                </button>
                <div className="absolute left-1 top-1">
                  <Checkbox checked={selected.has(it.id)} label={t.select} onChange={(v) => setSelected((s) => { const n = new Set(s); if (v) n.add(it.id); else n.delete(it.id); return n; })} className="bg-background/70 backdrop-blur" />
                </div>
                <div className="pointer-events-none absolute bottom-1 left-1 flex flex-wrap gap-1">
                  {it.cover && <Chip tone="dark" icon={<Star />}>{t.coverChip}</Chip>}
                  {it.urlAfter && <Chip tone="accent">{t.beforeAfter}</Chip>}
                  {it.hidden && <Chip tone="muted" icon={<EyeOff />}>{t.hiddenChip}</Chip>}
                  {consentIssue && <Chip tone="warn" icon={<AlertTriangle />}>{t.consentRequired.split('.')[0]}</Chip>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selected.size > 0 && (
        <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/95 p-2 shadow-xl backdrop-blur md:inset-x-auto md:bottom-6 md:left-1/2 md:-translate-x-1/2">
          <span className="px-2 text-sm font-medium">{fmt(t.selectedCount, { n: selected.size })}</span>
          <Button variant="outline" className="h-11 rounded-full" onClick={() => bulk({ hidden: true })}><EyeOff /> {t.bulkHide}</Button>
          <Button variant="outline" className="h-11 rounded-full" onClick={() => bulk({ hidden: false })}><Eye /> {t.bulkShow}</Button>
          <Button variant="outline" className="h-11 rounded-full" onClick={() => { setTagDraft([]); setTagDialog(true); }}><Tag /> {t.bulkTag}</Button>
          <Button variant="outline" className="h-11 rounded-full" onClick={() => setConfirmDelete([...selected])}><Trash2 /> {t.bulkDelete}</Button>
          <Button variant="ghost" size="icon-lg" className="h-11 w-11 rounded-full" aria-label={t.cancelSelect} onClick={() => setSelected(new Set())}><X /></Button>
        </div>
      )}

      <Sheet
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={t.editPhoto}
        size="lg"
        footer={
          open && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant={open.cover ? 'accent' : 'outline'} className="h-11 rounded-full" onClick={() => setCover(open.id)}><Star /> {open.cover ? t.coverChip : t.setCover}</Button>
              <Button variant="outline" className="h-11 rounded-full" onClick={() => update(open.id, { hidden: !open.hidden })}>{open.hidden ? <Eye /> : <EyeOff />} {open.hidden ? t.showPhoto : t.hidePhoto}</Button>
              <div className="ml-auto flex gap-1">
                <Button variant="outline" size="icon-lg" className="h-11 w-11 rounded-full" aria-label={t.moveEarlier} disabled={openIndex <= 0} onClick={() => move(open.id, -1)}><ArrowLeft /></Button>
                <Button variant="outline" size="icon-lg" className="h-11 w-11 rounded-full" aria-label={t.moveLater} disabled={openIndex >= items.length - 1} onClick={() => move(open.id, 1)}><ArrowRight /></Button>
                <Button variant="outline" size="icon-lg" className="h-11 w-11 rounded-full" aria-label={t.delete} onClick={() => setConfirmDelete([open.id])}><Trash2 /></Button>
              </div>
            </div>
          )
        }
      >
        {open && (
          <div className="space-y-6">
            <ImageAdjuster src={open.url} position={open.position} scale={open.scale ?? 1} aspectClass="aspect-square" onChange={(p) => update(open.id, { position: p })} onScaleChange={(s) => update(open.id, { scale: s })} />
            <ImageUploadField label={t.afterPhoto} hint={t.afterPhotoHint} folder="gallery" value={open.urlAfter ?? null} onChange={(url) => update(open.id, { urlAfter: url ?? undefined })} position={open.positionAfter} onPositionChange={(p) => update(open.id, { positionAfter: p })} scale={open.scaleAfter ?? 1} onScaleChange={(s) => update(open.id, { scaleAfter: s })} adjustAspect="aspect-square" />
            <section className="grid gap-3 md:grid-cols-2">
              <Field label={`${t.altText} · EN`} hint={t.altHint}>
                <Input value={open.alt?.en ?? ''} onChange={(e) => update(open.id, { alt: { ...open.alt, en: e.target.value } })} className="h-11" />
              </Field>
              <Field label={`${t.altText} · UA`}>
                <Input value={open.alt?.uk ?? ''} onChange={(e) => update(open.id, { alt: { ...open.alt, uk: e.target.value } })} className="h-11" />
              </Field>
            </section>
            <section>
              <SectionTitle>{t.tagsLabel}</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {tagNames.map((name) => {
                  const on = open.tags?.includes(name);
                  return (
                    <button key={name} type="button" role="checkbox" aria-checked={Boolean(on)} onClick={() => update(open.id, { tags: on ? (open.tags || []).filter((x) => x !== name) : [...(open.tags || []), name] })} className={`min-h-[40px] rounded-full border px-3 text-sm ${on ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground'}`}>
                      {name}
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="space-y-2">
              <Switch checked={Boolean(open.client)} onChange={(v) => update(open.id, { client: v })} label={t.consentClient} />
              {open.client && (
                <label className="flex min-h-[44px] cursor-pointer items-start gap-2 rounded-xl border border-border p-3 text-sm">
                  <input type="checkbox" checked={Boolean(open.consent)} onChange={(e) => update(open.id, { consent: e.target.checked })} className="mt-1 size-4 accent-[var(--foreground)]" />
                  <span>
                    {t.consentLabel}
                    {!open.consent && <span className="mt-1 block text-xs text-amber-800">{t.consentRequired}</span>}
                  </span>
                </label>
              )}
            </section>
          </div>
        )}
      </Sheet>

      <Dialog open={tagDialog} onClose={() => setTagDialog(false)} title={t.tagPhotos} footer={<><Button variant="outline" className="h-11" onClick={() => setTagDialog(false)}>{t.cancel}</Button><Button className="h-11" onClick={() => { bulk({ tags: tagDraft }); setTagDialog(false); }}>{t.apply}</Button></>}>
        <div className="flex flex-wrap gap-1.5">
          {tagNames.map((name) => {
            const on = tagDraft.includes(name);
            return (
              <button key={name} type="button" role="checkbox" aria-checked={on} onClick={() => setTagDraft((d) => (on ? d.filter((x) => x !== name) : [...d, name]))} className={`min-h-[40px] rounded-full border px-3 text-sm ${on ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground'}`}>
                {name}
              </button>
            );
          })}
        </div>
      </Dialog>

      <ConfirmDialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) remove(confirmDelete); setConfirmDelete(null); }} title={t.deleteTitle} confirmLabel={t.actDelete} danger />
    </AdminShell>
  );
}
