'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { GripVertical, Plus, Pencil, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ServiceRow, ServiceTranslation } from '@/lib/services';
import { ukMissing } from '@/lib/services';
import type { BrandItem } from '@/lib/brands';
import { getServicesAdmin, getBrands, reorderServices, updateCategory } from '../../actions/content';
import AdminShell from '../_components/AdminShell';
import { useAdminT } from '../_components/AdminLang';
import { useToast } from '../_components/ui/Toast';
import { CardSkeleton, Chip, EmptyState, ErrorState, Field, Switch } from '../_components/ui/Bits';
import { Dialog } from '../_components/ui/Dialog';
import ServiceEditor from './ServiceEditor';

interface Category {
  title: string;
  description: string | null;
  uk?: ServiceTranslation;
  order: number;
  rows: ServiceRow[];
}

function groupRows(rows: ServiceRow[]): Category[] {
  const map = new Map<string, Category>();
  for (const r of rows) {
    const c = map.get(r.category_title) ?? { title: r.category_title, description: r.category_description, uk: r.translations?.uk, order: r.category_order ?? 0, rows: [] };
    c.rows.push(r);
    if (r.translations?.uk?.category_title && !c.uk?.category_title) c.uk = r.translations.uk;
    map.set(r.category_title, c);
  }
  const cats = [...map.values()];
  cats.forEach((c) => c.rows.sort((a, b) => (a.treatment_order ?? 0) - (b.treatment_order ?? 0)));
  cats.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  return cats;
}

// Sequential (category, position) pairs for every row, in display order.
function orderUpdates(rows: ServiceRow[]): { id: number; category_order: number; treatment_order: number }[] {
  const updates: { id: number; category_order: number; treatment_order: number }[] = [];
  groupRows(rows).forEach((c, ci) => c.rows.forEach((r, ri) => updates.push({ id: r.id, category_order: ci, treatment_order: ri })));
  return updates;
}
const orderKey = (rows: ServiceRow[]) => JSON.stringify(orderUpdates(rows).map((u) => [u.id, u.category_order, u.treatment_order]));

function ServiceRowItem({ row, onOpen, dragLabel, brands }: { row: ServiceRow; onOpen: () => void; dragLabel: string; brands: BrandItem[] }) {
  const { t, fmt } = useAdminT();
  const controls = useDragControls();
  const linked = brands.filter((b) => row.brand_ids?.includes(b.id)).map((b) => b.name);
  return (
    <Reorder.Item as="li" value={row.id} dragListener={false} dragControls={controls} className="flex items-stretch gap-1 rounded-xl border border-border bg-card">
      <button type="button" aria-label={dragLabel} onPointerDown={(e) => controls.start(e)} className="flex w-11 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground active:cursor-grabbing">
        <GripVertical className="size-5" aria-hidden />
      </button>
      <button type="button" onClick={onOpen} className="flex min-h-[56px] min-w-0 flex-1 items-center justify-between gap-3 py-2 pr-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="min-w-0">
          <span className={`line-clamp-2 text-[15px] leading-snug ${row.active === false || row.archived_at ? 'text-muted-foreground' : 'font-medium'}`}>{row.treatment_title}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {row.duration_minutes ? <span>{fmt(t.minutesShort, { n: row.duration_minutes })}</span> : row.treatment_duration ? <span>{row.treatment_duration}</span> : null}
            {row.archived_at && <Chip tone="muted">{t.archivedChip}</Chip>}
            {!row.archived_at && row.active === false && <Chip tone="muted">{t.inactiveChip}</Chip>}
            {row.bookable === false && <Chip tone="outline">{t.notBookableChip}</Chip>}
            {ukMissing(row) && <Chip tone="warn">{t.uaMissing}</Chip>}
            {linked.slice(0, 2).map((n) => (
              <Chip key={n} tone="outline">{n}</Chip>
            ))}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{row.treatment_price}</span>
      </button>
    </Reorder.Item>
  );
}

function CategoryBlock({
  category,
  brands,
  onOpenRow,
  onAddRow,
  onEditCategory,
  onReorderRows,
  onDragEnd,
}: {
  category: Category;
  brands: BrandItem[];
  onOpenRow: (r: ServiceRow) => void;
  onAddRow: () => void;
  onEditCategory: () => void;
  onReorderRows: (ids: number[]) => void;
  onDragEnd: () => void;
}) {
  const { t, fmt } = useAdminT();
  const controls = useDragControls();
  return (
    <Reorder.Item as="section" value={category.title} dragListener={false} dragControls={controls} className="rounded-2xl border border-border bg-muted/40 p-2" onDragEnd={onDragEnd}>
      <div className="flex items-center gap-1 px-1 py-1">
        <button type="button" aria-label={t.dragToReorder} onPointerDown={(e) => controls.start(e)} className="flex size-11 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground active:cursor-grabbing">
          <GripVertical className="size-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 font-serif text-lg leading-tight">{category.title}</h2>
          <p className="text-xs text-muted-foreground">
            {fmt(t.servicesCount, { n: category.rows.length })}
            {!category.uk?.category_title && <span className="ml-2 text-amber-800">· {t.uaMissing}</span>}
          </p>
        </div>
        <Button variant="ghost" size="icon-lg" className="h-11 w-11 rounded-full" aria-label={t.editCategory} onClick={onEditCategory}>
          <Pencil />
        </Button>
      </div>
      <Reorder.Group as="ul" axis="y" values={category.rows.map((r) => r.id)} onReorder={onReorderRows} className="space-y-1.5 p-1">
        {category.rows.map((r) => (
          <ServiceRowItem key={r.id} row={r} brands={brands} dragLabel={t.dragToReorder} onOpen={() => onOpenRow(r)} />
        ))}
      </Reorder.Group>
      <button type="button" onClick={onAddRow} className="flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Plus className="size-4" aria-hidden /> {t.addService}
      </button>
    </Reorder.Item>
  );
}

export default function ServicesWorkspace() {
  const { t } = useAdminT();
  const { toast } = useToast();
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [editor, setEditor] = useState<{ open: boolean; row: ServiceRow | null; category?: string }>({ open: false, row: null });
  const [catEdit, setCatEdit] = useState<Category | null>(null);
  const [catDraft, setCatDraft] = useState({ title: '', description: '', uk_title: '', uk_description: '' });
  const [catBusy, setCatBusy] = useState(false);
  const lastPersisted = useRef<string>('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const [s, b] = await Promise.all([getServicesAdmin(), getBrands()]);
      if (!s.success) throw new Error(s.error || 'load failed');
      const list = s.data as unknown as ServiceRow[];
      setRows(list);
      setBrands(b.data);
      lastPersisted.current = orderKey(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const visibleRows = useMemo(() => rows.filter((r) => showArchived || !r.archived_at), [rows, showArchived]);
  const categories = useMemo(() => groupRows(visibleRows), [visibleRows]);
  const allCategories = useMemo(() => groupRows(rows), [rows]);

  // Persist the current order after a drag ends (only if it changed).
  const persistOrder = useCallback(async () => {
    const updates = orderUpdates(rows);
    const key = JSON.stringify(updates.map((u) => [u.id, u.category_order, u.treatment_order]));
    if (key === lastPersisted.current) return;
    lastPersisted.current = key;
    const r = await reorderServices(updates);
    if (!r.success) toast({ title: t.toastError, description: r.error, tone: 'error' });
  }, [rows, toast, t]);

  const reorderCategories = (titles: string[]) => {
    setRows((prev) => prev.map((r) => ({ ...r, category_order: Math.max(0, titles.indexOf(r.category_title)) })));
  };
  const reorderRows = (title: string, ids: number[]) => {
    setRows((prev) => prev.map((r) => (r.category_title === title ? { ...r, treatment_order: ids.indexOf(r.id) } : r)));
  };
  // Persist after a service drag ends: the Reorder.Item doesn't expose onDragEnd
  // through our wrapper, so persist on pointer-up anywhere in the list.
  useEffect(() => {
    const onUp = () => void persistOrder();
    window.addEventListener('pointerup', onUp);
    return () => window.removeEventListener('pointerup', onUp);
  }, [persistOrder]);

  const openCategory = (c: Category) => {
    setCatEdit(c);
    setCatDraft({ title: c.title, description: c.description ?? '', uk_title: c.uk?.category_title ?? '', uk_description: c.uk?.category_description ?? '' });
  };
  const saveCategory = async () => {
    if (!catEdit || !catDraft.title.trim()) return;
    setCatBusy(true);
    const r = await updateCategory(catEdit.title, { category_title: catDraft.title.trim(), category_description: catDraft.description.trim() || null, uk_title: catDraft.uk_title.trim(), uk_description: catDraft.uk_description.trim() });
    setCatBusy(false);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    toast({ title: t.toastSaved });
    setCatEdit(null);
    await load();
  };

  return (
    <AdminShell
      active="services"
      title={t.servicesTitle}
      subtitle={t.servicesIntro}
      maxWidth="max-w-4xl"
      actions={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Button className="h-11 rounded-full" onClick={() => setEditor({ open: true, row: null })}>
            <Plus /> {t.addService}
          </Button>
          <div className="w-56">
            <Switch checked={showArchived} onChange={setShowArchived} label={t.showArchived} />
          </div>
        </div>
      }
    >
      {loading ? (
        <CardSkeleton count={4} />
      ) : error ? (
        <ErrorState body={error} onRetry={() => void load()} />
      ) : categories.length === 0 ? (
        <EmptyState icon={<Sparkles />} title={t.emptyServices} body={t.emptyServicesBody} action={<Button className="h-11 rounded-full" onClick={() => setEditor({ open: true, row: null })}><Plus /> {t.addService}</Button>} />
      ) : (
        <Reorder.Group as="div" axis="y" values={categories.map((c) => c.title)} onReorder={reorderCategories} className="space-y-4">
          {categories.map((c) => (
            <CategoryBlock
              key={c.title}
              category={c}
              brands={brands}
              onOpenRow={(r) => setEditor({ open: true, row: r })}
              onAddRow={() => setEditor({ open: true, row: null, category: c.title })}
              onEditCategory={() => openCategory(c)}
              onReorderRows={(ids) => reorderRows(c.title, ids)}
              onDragEnd={() => void persistOrder()}
            />
          ))}
        </Reorder.Group>
      )}

      <ServiceEditor
        open={editor.open}
        row={editor.row}
        categories={(editor.category ? [...allCategories].sort((a, b) => (a.title === editor.category ? -1 : b.title === editor.category ? 1 : 0)) : allCategories).map((c) => ({ title: c.title, description: c.description, uk: c.uk, order: c.order }))}
        brands={brands}
        allRows={rows}
        onClose={() => setEditor({ open: false, row: null })}
        onSaved={load}
      />

      <Dialog
        open={Boolean(catEdit)}
        onClose={() => setCatEdit(null)}
        title={t.editCategory}
        size="md"
        footer={
          <>
            <Button variant="outline" className="h-11" onClick={() => setCatEdit(null)} disabled={catBusy}>
              {t.cancel}
            </Button>
            <Button className="h-11" onClick={() => void saveCategory()} disabled={catBusy || !catDraft.title.trim()}>
              {t.save}
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={`${t.categoryLabel} · EN`}>
            <Input value={catDraft.title} onChange={(e) => setCatDraft({ ...catDraft, title: e.target.value })} className="h-11" />
          </Field>
          <Field label={`${t.categoryLabel} · UA`}>
            <Input value={catDraft.uk_title} onChange={(e) => setCatDraft({ ...catDraft, uk_title: e.target.value })} className="h-11" />
          </Field>
          <Field label={`${t.categoryDescription} · EN`}>
            <Textarea rows={2} value={catDraft.description} onChange={(e) => setCatDraft({ ...catDraft, description: e.target.value })} />
          </Field>
          <Field label={`${t.categoryDescription} · UA`}>
            <Textarea rows={2} value={catDraft.uk_description} onChange={(e) => setCatDraft({ ...catDraft, uk_description: e.target.value })} />
          </Field>
        </div>
      </Dialog>
    </AdminShell>
  );
}
