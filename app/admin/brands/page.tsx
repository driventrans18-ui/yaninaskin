'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { GripVertical, Plus, Tags, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { brandIdFor, type BrandItem } from '@/lib/brands';
import type { ServiceRow } from '@/lib/services';
import { getBrands, saveBrands, getServicesAdmin } from '../../actions/content';
import AdminShell from '../_components/AdminShell';
import ImageUploadField from '../_components/ImageUploadField';
import { useAdminT } from '../_components/AdminLang';
import { useToast } from '../_components/ui/Toast';
import { CardSkeleton, Chip, EmptyState, ErrorState, Field, Switch } from '../_components/ui/Bits';
import { ConfirmDialog } from '../_components/ui/Dialog';

function BrandRow({ brand, linked, onUpdate, onRemove }: { brand: BrandItem; linked: number; onUpdate: (patch: Partial<BrandItem>) => void; onRemove: () => void }) {
  const { t, fmt } = useAdminT();
  const controls = useDragControls();
  return (
    <Reorder.Item as="li" value={brand.id} dragListener={false} dragControls={controls} className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <button type="button" aria-label={t.dragToReorder} onPointerDown={(e) => controls.start(e)} className="flex size-11 cursor-grab touch-none items-center justify-center text-muted-foreground active:cursor-grabbing">
          <GripVertical className="size-5" aria-hidden />
        </button>
        <span className="min-w-0 flex-1 truncate font-serif text-lg">{brand.name || '—'}</span>
        {linked > 0 && <Chip tone="outline">{fmt(t.brandLinked, { n: linked })}</Chip>}
        <Button variant="ghost" size="icon-lg" className="h-11 w-11 rounded-full text-muted-foreground hover:text-destructive" aria-label={t.delete} onClick={onRemove}>
          <Trash2 />
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-[180px_1fr]">
        <ImageUploadField label={t.brandLogo} folder="brands" value={brand.logo} onChange={(url) => onUpdate({ logo: url ?? undefined })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.brandName}>
            <Input value={brand.name} onChange={(e) => onUpdate({ name: e.target.value })} placeholder={t.brandNamePlaceholder} className="h-11" />
          </Field>
          <Field label={t.brandWebsite}>
            <Input type="url" inputMode="url" value={brand.website ?? ''} onChange={(e) => onUpdate({ website: e.target.value })} placeholder="https://" className="h-11" />
          </Field>
          <Field label={`${t.brandDescription} · EN`}>
            <Input value={brand.description?.en ?? ''} onChange={(e) => onUpdate({ description: { ...brand.description, en: e.target.value } })} className="h-11" />
          </Field>
          <Field label={`${t.brandDescription} · UA`}>
            <Input value={brand.description?.uk ?? ''} onChange={(e) => onUpdate({ description: { ...brand.description, uk: e.target.value } })} className="h-11" />
          </Field>
          <div className="sm:col-span-2">
            <Switch checked={!brand.hidden} onChange={(v) => onUpdate({ hidden: !v })} label={brand.hidden ? t.brandHidden : t.brandVisible} />
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function AdminBrandsPage() {
  const { t } = useAdminT();
  const { toast } = useToast();
  const [items, setItems] = useState<BrandItem[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const lastSaved = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [b, s] = await Promise.all([getBrands(), getServicesAdmin()]);
      if (!b.success) throw new Error('load failed');
      setItems(b.data);
      setServices(s.data as unknown as ServiceRow[]);
      lastSaved.current = JSON.stringify(b.data);
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
    if (lastSaved.current === null) return;
    const snap = JSON.stringify(items);
    if (snap === lastSaved.current) return;
    setSaveState('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const r = await saveBrands(items.filter((b) => b.name.trim()));
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

  const linkedCount = (id: string) => services.filter((s) => s.brand_ids?.includes(id)).length;
  const add = () => setItems((prev) => [...prev, { id: `${brandIdFor('brand', prev.length)}-${Date.now().toString(36)}`, name: '', description: { en: '', uk: '' } }]);
  const update = (id: string, patch: Partial<BrandItem>) => setItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const remove = (id: string) => {
    const b = items.find((x) => x.id === id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    setConfirm(null);
    if (b) toast({ title: t.brandDeleted, duration: 10000, action: { label: t.undo, onClick: () => setItems((prev) => [...prev, b]) } });
  };

  return (
    <AdminShell
      active="brands"
      title={t.brandsTitle}
      subtitle={t.brandsIntro2}
      maxWidth="max-w-4xl"
      actions={
        <div className="flex w-full items-center justify-between gap-2">
          <Button className="h-11 rounded-full" onClick={add}><Plus /> {t.addBrand}</Button>
          <span className="text-sm text-muted-foreground">{saveState === 'saving' ? t.notesSaving : saveState === 'saved' ? t.saved : ''}</span>
        </div>
      }
    >
      {loading ? (
        <CardSkeleton count={3} />
      ) : error ? (
        <ErrorState body={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState icon={<Tags />} title={t.noBrandsTitle} body={t.noBrandsBody} action={<Button className="h-11 rounded-full" onClick={add}><Plus /> {t.addBrand}</Button>} />
      ) : (
        <Reorder.Group as="ul" axis="y" values={items.map((b) => b.id)} onReorder={(ids: string[]) => setItems((prev) => ids.map((id) => prev.find((b) => b.id === id)!).filter(Boolean))} className="space-y-3">
          {items.map((b) => (
            <BrandRow key={b.id} brand={b} linked={linkedCount(b.id)} onUpdate={(p) => update(b.id, p)} onRemove={() => setConfirm(b.id)} />
          ))}
        </Reorder.Group>
      )}
      <ConfirmDialog open={Boolean(confirm)} onClose={() => setConfirm(null)} onConfirm={() => { if (confirm) remove(confirm); }} title={t.confirmDeleteBrand} confirmLabel={t.delete} danger />
    </AdminShell>
  );
}
