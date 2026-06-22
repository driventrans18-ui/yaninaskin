'use client';

import { useState, useEffect, useRef } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { GripVertical } from 'lucide-react';
import { getBrands, saveBrands } from '../../actions/content';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminShell from '../_components/AdminShell';
import StatusBanner from '../_components/StatusBanner';
import Field from '../_components/Field';
import ImageUploadField from '../_components/ImageUploadField';
import { useAdminT } from '../_components/AdminLang';

type BrandItem = { id: string; name: string; logo?: string | null };

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

function BrandRow({
  brand,
  t,
  onUpdate,
  onRemove,
}: {
  brand: BrandItem;
  t: ReturnType<typeof useAdminT>['t'];
  onUpdate: (id: string, patch: Partial<BrandItem>) => void;
  onRemove: (id: string) => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="div"
      value={brand.id}
      dragListener={false}
      dragControls={controls}
    >
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label={t.dragToReorder}
            onPointerDown={(e) => controls.start(e)}
            className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(brand.id)}
          >
            {t.delete}
          </Button>
        </div>
        <Field label={t.brandName}>
          <Input
            value={brand.name}
            onChange={(e) => onUpdate(brand.id, { name: e.target.value })}
            placeholder={t.brandNamePlaceholder}
          />
        </Field>
        <ImageUploadField
          label={t.brandLogo}
          folder="brands"
          value={brand.logo}
          onChange={(url) => onUpdate(brand.id, { logo: url })}
        />
      </Card>
    </Reorder.Item>
  );
}

export default function AdminBrandsPage() {
  const { t } = useAdminT();
  const [items, setItems] = useState<BrandItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  // Auto-save: debounce timer + snapshot of the last-persisted state.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getBrands();
      if (result.success) {
        const mapped = result.data.map((b) => ({ ...b, id: newId() }));
        setItems(mapped);
        // Seed the snapshot so loading doesn't trigger an auto-save.
        lastSaved.current = JSON.stringify(mapped);
      } else {
        lastSaved.current = JSON.stringify([]);
      }
      setIsLoading(false);
    })();
  }, []);

  // Build the persist payload from the current items (shared by Save + auto-save).
  const buildPayload = () => {
    const kept = items.filter((b) => b.name.trim());
    const payload = kept.map((b) =>
      b.logo ? { name: b.name.trim(), logo: b.logo } : { name: b.name.trim() }
    );
    return { kept, payload };
  };

  // Debounced auto-save whenever the brands change (after initial load).
  useEffect(() => {
    if (lastSaved.current === null) return;
    const snapshot = JSON.stringify(items);
    if (snapshot === lastSaved.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { payload } = buildPayload();
      const result = await saveBrands(payload);
      if (result.success) {
        lastSaved.current = snapshot;
        setMessage('✓ ' + t.save);
        setTimeout(() => setMessage(''), 1500);
      } else {
        setMessage('✗ ' + (result.error || 'Failed to save'));
      }
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    []
  );

  const addBrand = () =>
    setItems((prev) => [...prev, { id: newId(), name: '', logo: null }]);

  const updateBrand = (id: string, patch: Partial<BrandItem>) =>
    setItems((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );

  const removeBrand = (id: string) => {
    if (!confirm(t.confirmDeleteBrand)) return;
    setItems((prev) => prev.filter((b) => b.id !== id));
  };

  const reorder = (ids: string[]) => {
    setItems((prev) => {
      const byId = new Map(prev.map((b) => [b.id, b]));
      return ids.map((id) => byId.get(id)!).filter(Boolean);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const { kept, payload } = buildPayload();
    const cleaned: BrandItem[] = kept.map((b, i) => ({
      id: b.id,
      ...payload[i],
    }));
    const result = await saveBrands(payload);
    if (result.success) {
      setItems(cleaned);
      // Keep the snapshot in sync so this manual save doesn't re-trigger auto-save.
      lastSaved.current = JSON.stringify(cleaned);
      setMessage('✓ ' + t.save);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('✗ ' + (result.error || 'Failed to save'));
    }
    setSaving(false);
  };

  return (
    <AdminShell active="brands" maxWidth="max-w-3xl">
      <StatusBanner message={message} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl mb-1">{t.editBrands}</h2>
          <p className="text-sm text-muted-foreground">{t.brandsIntro}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={addBrand} disabled={isLoading}>
            {t.addBrand}
          </Button>
          <Button onClick={handleSave} disabled={saving || isLoading}>
            {saving ? t.saving : t.save}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t.loading}</p>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center">
          <h2 className="text-xl mb-1">{t.noBrandsTitle}</h2>
          <p className="text-muted-foreground">{t.noBrandsBody}</p>
        </Card>
      ) : (
        <Reorder.Group
          as="div"
          axis="y"
          values={items.map((b) => b.id)}
          onReorder={reorder}
          className="space-y-4"
        >
          {items.map((brand) => (
            <BrandRow
              key={brand.id}
              brand={brand}
              t={t}
              onUpdate={updateBrand}
              onRemove={removeBrand}
            />
          ))}
        </Reorder.Group>
      )}
    </AdminShell>
  );
}
