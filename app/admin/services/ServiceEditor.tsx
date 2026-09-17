'use client';

import { useEffect, useMemo, useState } from 'react';
import { Archive, Copy, MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import type { ServiceRow, ServiceTranslation } from '@/lib/services';
import type { BrandItem } from '@/lib/brands';
import { parsePrice } from '@/lib/booking/price';
import { parseDurationMinutes } from '@/lib/booking/duration';
import { archiveOrDeleteService, duplicateService, saveService, unarchiveService } from '../../actions/content';
import ImageUploadField from '../_components/ImageUploadField';
import { useAdminT } from '../_components/AdminLang';
import { useToast } from '../_components/ui/Toast';
import Sheet from '../_components/ui/Sheet';
import { ConfirmDialog } from '../_components/ui/Dialog';
import { Menu, MenuItem, MenuSeparator } from '../_components/ui/Menu';
import { Chip, Field, SectionTitle, Switch } from '../_components/ui/Bits';
import ServiceCardPreview from './ServiceCardPreview';

interface Draft {
  category_title: string;
  category_description: string;
  category_title_uk: string;
  category_description_uk: string;
  treatment_title: string;
  treatment_price: string;
  treatment_description: string;
  treatment_note: string;
  uk: ServiceTranslation;
  duration_minutes: string;
  buffer_minutes: string;
  active: boolean;
  bookable: boolean;
  brand_ids: string[];
  prep_notes: string;
  aftercare_notes: string;
  contraindications: string;
  treatment_image_before: string | null;
  treatment_image_after: string | null;
  treatment_before_position: string | null;
  treatment_after_position: string | null;
}

const NEW_CATEGORY = '__new__';

function draftFrom(row: ServiceRow | null, defaults: { category_title: string; category_description: string | null; uk?: ServiceTranslation }): Draft {
  const uk = row?.translations?.uk ?? defaults.uk ?? {};
  return {
    category_title: row?.category_title ?? defaults.category_title,
    category_description: row?.category_description ?? defaults.category_description ?? '',
    category_title_uk: uk.category_title ?? '',
    category_description_uk: uk.category_description ?? '',
    treatment_title: row?.treatment_title ?? '',
    treatment_price: row?.treatment_price ?? '',
    treatment_description: row?.treatment_description ?? '',
    treatment_note: row?.treatment_note ?? '',
    uk: { treatment_title: uk.treatment_title ?? '', treatment_description: uk.treatment_description ?? '', treatment_note: uk.treatment_note ?? '', prep_notes: uk.prep_notes ?? '', aftercare_notes: uk.aftercare_notes ?? '', contraindications: uk.contraindications ?? '' },
    duration_minutes: row?.duration_minutes != null ? String(row.duration_minutes) : String(parseDurationMinutes(row?.treatment_duration) ?? ''),
    buffer_minutes: row?.buffer_minutes != null ? String(row.buffer_minutes) : '',
    active: row?.active !== false,
    bookable: row?.bookable !== false,
    brand_ids: Array.isArray(row?.brand_ids) ? row!.brand_ids! : [],
    prep_notes: row?.prep_notes ?? '',
    aftercare_notes: row?.aftercare_notes ?? '',
    contraindications: row?.contraindications ?? '',
    treatment_image_before: row?.treatment_image_before ?? null,
    treatment_image_after: row?.treatment_image_after ?? null,
    treatment_before_position: row?.treatment_before_position ?? null,
    treatment_after_position: row?.treatment_after_position ?? null,
  };
}

export default function ServiceEditor({
  open,
  row,
  categories,
  brands,
  allRows,
  onClose,
  onSaved,
}: {
  open: boolean;
  row: ServiceRow | null; // null = new
  categories: { title: string; description: string | null; uk?: ServiceTranslation; order: number }[];
  brands: BrandItem[];
  allRows: ServiceRow[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const { t, fmt } = useAdminT();
  const { toast } = useToast();
  const initial = useMemo(
    () => draftFrom(row, { category_title: categories[0]?.title ?? '', category_description: categories[0]?.description ?? null, uk: categories[0]?.uk }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [row?.id, open],
  );
  const [draft, setDraft] = useState<Draft>(initial);
  const [categoryMode, setCategoryMode] = useState<string>(initial.category_title || NEW_CATEGORY);
  const [editLang, setEditLang] = useState<'en' | 'uk'>('en');
  const [busy, setBusy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    setDraft(initial);
    setCategoryMode(initial.category_title || NEW_CATEGORY);
  }, [initial]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const setUk = (k: keyof ServiceTranslation, v: string) => setDraft((d) => ({ ...d, uk: { ...d.uk, [k]: v } }));

  const pickCategory = (title: string) => {
    setCategoryMode(title);
    if (title === NEW_CATEGORY) {
      setDraft((d) => ({ ...d, category_title: '', category_description: '', category_title_uk: '', category_description_uk: '' }));
    } else {
      const c = categories.find((x) => x.title === title);
      setDraft((d) => ({ ...d, category_title: title, category_description: c?.description ?? '', category_title_uk: c?.uk?.category_title ?? '', category_description_uk: c?.uk?.category_description ?? '' }));
    }
  };

  const save = async () => {
    if (!draft.treatment_title.trim() || !draft.treatment_price.trim() || !draft.category_title.trim()) {
      toast({ title: t.nameRequired, tone: 'error' });
      return;
    }
    setBusy(true);
    const cat = categories.find((c) => c.title === draft.category_title);
    const price = parsePrice(draft.treatment_price);
    const dur = draft.duration_minutes ? Number(draft.duration_minutes) : null;
    const sameCat = allRows.filter((r) => r.category_title === draft.category_title && r.id !== row?.id);
    const payload: Record<string, unknown> = {
      category_title: draft.category_title.trim(),
      category_description: draft.category_description.trim() || null,
      category_order: cat?.order ?? (categories.length ? Math.max(...categories.map((c) => c.order)) + 1 : 0),
      treatment_order: row?.treatment_order ?? (sameCat.length ? Math.max(...sameCat.map((r) => r.treatment_order ?? 0)) + 1 : 0),
      treatment_title: draft.treatment_title.trim(),
      treatment_price: draft.treatment_price.trim(),
      treatment_duration: dur ? (dur % 60 === 0 ? `${dur / 60} ${dur === 60 ? 'hour' : 'hours'}` : `${dur} min`) : null,
      treatment_description: draft.treatment_description.trim() || null,
      treatment_note: draft.treatment_note.trim() || null,
      translations: {
        ...(row?.translations || {}),
        uk: {
          ...Object.fromEntries(Object.entries(draft.uk).map(([k, v]) => [k, (v || '').trim() || undefined])),
          category_title: draft.category_title_uk.trim() || undefined,
          category_description: draft.category_description_uk.trim() || undefined,
        },
      },
      duration_minutes: dur && dur > 0 ? dur : null,
      buffer_minutes: draft.buffer_minutes ? Number(draft.buffer_minutes) : null,
      price_min: price?.min ?? null,
      price_max: price?.max ?? null,
      active: draft.active,
      bookable: draft.bookable,
      brand_ids: draft.brand_ids,
      prep_notes: draft.prep_notes.trim() || null,
      aftercare_notes: draft.aftercare_notes.trim() || null,
      contraindications: draft.contraindications.trim() || null,
      treatment_image_before: draft.treatment_image_before,
      treatment_image_after: draft.treatment_image_after,
      treatment_before_position: draft.treatment_before_position,
      treatment_after_position: draft.treatment_after_position,
    };
    const r = await saveService(row?.id ?? null, payload);
    setBusy(false);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    toast({ title: t.serviceSaved });
    await onSaved();
    onClose();
  };

  const remove = async () => {
    if (!row) return;
    setBusy(true);
    const r = await archiveOrDeleteService(row.id);
    setBusy(false);
    setConfirmDelete(false);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    toast({ title: r.action === 'archived' ? t.serviceArchivedToast : t.serviceDeletedToast });
    await onSaved();
    onClose();
  };

  const dup = async () => {
    if (!row) return;
    setBusy(true);
    const r = await duplicateService(row.id);
    setBusy(false);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    toast({ title: t.toastUpdated });
    await onSaved();
    onClose();
  };

  const restore = async () => {
    if (!row) return;
    const r = await unarchiveService(row.id);
    if (!r.success) return toast({ title: t.toastError, tone: 'error' });
    toast({ title: t.toastUpdated });
    await onSaved();
    onClose();
  };

  const tryClose = () => (dirty ? setConfirmClose(true) : onClose());

  const langTabs = (
    <div role="tablist" aria-label={t.adminLanguage} className="inline-flex rounded-full border border-border p-0.5 md:hidden">
      {(['en', 'uk'] as const).map((l) => (
        <button key={l} role="tab" aria-selected={editLang === l} type="button" onClick={() => setEditLang(l)} className={`h-9 rounded-full px-4 text-sm ${editLang === l ? 'bg-foreground text-background' : 'text-muted-foreground'}`}>
          {l === 'en' ? 'EN' : 'UA'}
        </button>
      ))}
    </div>
  );

  // EN + UA side by side on desktop; one at a time on phones.
  const pair = (label: string, en: React.ReactNode, uk: React.ReactNode, missing: boolean) => (
    <div className="grid gap-3 md:grid-cols-2">
      <div className={editLang === 'uk' ? 'hidden md:block' : ''}>
        <Field label={`${label} · EN`}>{en}</Field>
      </div>
      <div className={editLang === 'en' ? 'hidden md:block' : ''}>
        <Field
          label={
            <span className="inline-flex items-center gap-2">
              {label} · UA {missing && <Chip tone="warn">{t.uaMissing}</Chip>}
            </span>
          }
        >
          {uk}
        </Field>
      </div>
    </div>
  );

  const previewLang = editLang;
  const pv = (en: string, uk?: string) => (previewLang === 'uk' && uk?.trim() ? uk : en);
  const durLabel = draft.duration_minutes ? fmt(t.minutesShort, { n: draft.duration_minutes }) : undefined;

  return (
    <>
      <Sheet
        open={open}
        onClose={tryClose}
        title={row ? t.editService : t.newServiceTitle}
        subtitle={row?.archived_at ? <Chip tone="muted">{t.archivedChip}</Chip> : undefined}
        size="lg"
        headerExtra={langTabs}
        footer={
          <div className="flex items-center gap-2">
            <Button className="h-11 flex-1 rounded-full md:flex-none" onClick={() => void save()} disabled={busy || (!dirty && Boolean(row))}>
              {t.save}
            </Button>
            <Button variant="outline" className="h-11 rounded-full" onClick={tryClose} disabled={busy}>
              {t.cancel}
            </Button>
            {row && (
              <Menu
                label={t.actMore}
                trigger={
                  <Button variant="outline" size="icon-lg" aria-label={t.actMore} className="ml-auto h-11 w-11 rounded-full">
                    <MoreHorizontal />
                  </Button>
                }
              >
                <MenuItem icon={<Copy />} onSelect={() => void dup()}>
                  {t.duplicate}
                </MenuItem>
                {row.archived_at ? (
                  <MenuItem icon={<RotateCcw />} onSelect={() => void restore()}>
                    {t.unarchive}
                  </MenuItem>
                ) : (
                  <MenuItem icon={<Archive />} onSelect={() => setConfirmDelete(true)}>
                    {t.archive}
                  </MenuItem>
                )}
                <MenuSeparator />
                <MenuItem icon={<Trash2 />} danger onSelect={() => setConfirmDelete(true)}>
                  {t.actDelete}
                </MenuItem>
              </Menu>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          <section className="space-y-3">
            <SectionTitle>{t.categoryLabel}</SectionTitle>
            <Select value={categoryMode} onChange={(e) => pickCategory(e.target.value)} className="h-11 w-full text-sm" aria-label={t.categoryLabel}>
              {categories.map((c) => (
                <option key={c.title} value={c.title}>
                  {c.title}
                </option>
              ))}
              <option value={NEW_CATEGORY}>{t.categoryNew}</option>
            </Select>
            {categoryMode === NEW_CATEGORY &&
              pair(
                t.categoryLabel,
                <Input value={draft.category_title} onChange={(e) => set('category_title', e.target.value)} placeholder={t.categoryNamePlaceholder} className="h-11" />,
                <Input value={draft.category_title_uk} onChange={(e) => set('category_title_uk', e.target.value)} className="h-11" />,
                Boolean(draft.category_title) && !draft.category_title_uk,
              )}
          </section>

          <section className="space-y-3">
            <SectionTitle>{t.service}</SectionTitle>
            {pair(
              t.fieldName,
              <Input value={draft.treatment_title} onChange={(e) => set('treatment_title', e.target.value)} className="h-11" required />,
              <Input value={draft.uk.treatment_title || ''} onChange={(e) => setUk('treatment_title', e.target.value)} className="h-11" />,
              Boolean(draft.treatment_title) && !draft.uk.treatment_title,
            )}
            {pair(
              t.fieldDescription,
              <Textarea rows={3} value={draft.treatment_description} onChange={(e) => set('treatment_description', e.target.value)} />,
              <Textarea rows={3} value={draft.uk.treatment_description || ''} onChange={(e) => setUk('treatment_description', e.target.value)} />,
              Boolean(draft.treatment_description) && !draft.uk.treatment_description,
            )}
            {pair(
              t.fieldNote,
              <Input value={draft.treatment_note} onChange={(e) => set('treatment_note', e.target.value)} className="h-11" />,
              <Input value={draft.uk.treatment_note || ''} onChange={(e) => setUk('treatment_note', e.target.value)} className="h-11" />,
              Boolean(draft.treatment_note) && !draft.uk.treatment_note,
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t.fieldPrice} hint={t.priceHint} required>
                <Input value={draft.treatment_price} onChange={(e) => set('treatment_price', e.target.value)} placeholder="$120 or $140–160" className="h-11" />
              </Field>
              <Field label={`${t.fieldDuration} (${t.minutesUnit})`}>
                <Input type="number" inputMode="numeric" min={5} step={5} value={draft.duration_minutes} onChange={(e) => set('duration_minutes', e.target.value)} className="h-11" />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {[30, 45, 60, 75, 90, 120].map((m) => (
                    <button key={m} type="button" onClick={() => set('duration_minutes', String(m))} className={`h-8 rounded-full border px-2.5 text-xs ${draft.duration_minutes === String(m) ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={`${t.fieldBuffer} (${t.minutesUnit})`} hint={t.bufferHint}>
                <Input type="number" inputMode="numeric" min={0} step={5} value={draft.buffer_minutes} onChange={(e) => set('buffer_minutes', e.target.value)} className="h-11" />
              </Field>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Switch checked={draft.active} onChange={(v) => set('active', v)} label={t.activeLabel} description={t.activeHint} />
              <Switch checked={draft.bookable} onChange={(v) => set('bookable', v)} label={t.bookableLabel} description={t.bookableHint} />
            </div>
          </section>

          <section>
            <SectionTitle>{t.linkedBrands}</SectionTitle>
            {brands.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noBrandsYet}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {brands.map((b) => {
                  const on = draft.brand_ids.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => set('brand_ids', on ? draft.brand_ids.filter((x) => x !== b.id) : [...draft.brand_ids, b.id])}
                      className={`min-h-[40px] rounded-full border px-3 text-sm ${on ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground'}`}
                    >
                      {b.name}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <SectionTitle>{t.careNotesHint}</SectionTitle>
            {pair(
              t.prepNotes,
              <Textarea rows={2} value={draft.prep_notes} onChange={(e) => set('prep_notes', e.target.value)} />,
              <Textarea rows={2} value={draft.uk.prep_notes || ''} onChange={(e) => setUk('prep_notes', e.target.value)} />,
              Boolean(draft.prep_notes) && !draft.uk.prep_notes,
            )}
            {pair(
              t.aftercareNotes,
              <Textarea rows={2} value={draft.aftercare_notes} onChange={(e) => set('aftercare_notes', e.target.value)} />,
              <Textarea rows={2} value={draft.uk.aftercare_notes || ''} onChange={(e) => setUk('aftercare_notes', e.target.value)} />,
              Boolean(draft.aftercare_notes) && !draft.uk.aftercare_notes,
            )}
            {pair(
              t.contraindications,
              <Textarea rows={2} value={draft.contraindications} onChange={(e) => set('contraindications', e.target.value)} />,
              <Textarea rows={2} value={draft.uk.contraindications || ''} onChange={(e) => setUk('contraindications', e.target.value)} />,
              Boolean(draft.contraindications) && !draft.uk.contraindications,
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <ImageUploadField label={t.beforePhoto} hint={t.beforeHint} folder="services" value={draft.treatment_image_before} onChange={(url) => set('treatment_image_before', url)} position={draft.treatment_before_position} onPositionChange={(p) => set('treatment_before_position', p)} />
            <ImageUploadField label={t.afterPhoto} hint={t.afterHint} folder="services" value={draft.treatment_image_after} onChange={(url) => set('treatment_image_after', url)} position={draft.treatment_after_position} onPositionChange={(p) => set('treatment_after_position', p)} />
          </section>

          <section>
            <SectionTitle>{t.servicePreview}</SectionTitle>
            <ServiceCardPreview
              title={pv(draft.treatment_title, draft.uk.treatment_title)}
              price={draft.treatment_price}
              duration={durLabel}
              description={pv(draft.treatment_description, draft.uk.treatment_description)}
              note={pv(draft.treatment_note, draft.uk.treatment_note)}
              brands={brands.filter((b) => draft.brand_ids.includes(b.id)).map((b) => b.name)}
              prep={pv(draft.prep_notes, draft.uk.prep_notes)}
              aftercare={pv(draft.aftercare_notes, draft.uk.aftercare_notes)}
              before={draft.treatment_image_before}
              after={draft.treatment_image_after}
              beforePos={draft.treatment_before_position}
              afterPos={draft.treatment_after_position}
            />
          </section>
        </div>
      </Sheet>
      <ConfirmDialog open={confirmClose} onClose={() => setConfirmClose(false)} onConfirm={() => { setConfirmClose(false); onClose(); }} title={t.unsavedTitle} body={t.unsavedBody} confirmLabel={t.leave} cancelLabel={t.stay} />
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={() => void remove()} title={t.deleteTitle} body={t.deleteBody} confirmLabel={t.actDelete} danger busy={busy} />
    </>
  );
}
