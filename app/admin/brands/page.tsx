'use client';

import { useState, useEffect } from 'react';
import { getBrands, saveBrands } from '../../actions/content';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminShell from '../_components/AdminShell';
import StatusBanner from '../_components/StatusBanner';
import Field from '../_components/Field';
import ImageUploadField from '../_components/ImageUploadField';
import { useAdminT } from '../_components/AdminLang';

type BrandItem = { name: string; logo?: string | null };

export default function AdminBrandsPage() {
  const { t } = useAdminT();
  const [items, setItems] = useState<BrandItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const result = await getBrands();
      if (result.success) setItems(result.data);
      setIsLoading(false);
    })();
  }, []);

  const addBrand = () =>
    setItems((prev) => [...prev, { name: '', logo: null }]);

  const updateBrand = (index: number, patch: Partial<BrandItem>) =>
    setItems((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...patch } : b))
    );

  const removeBrand = (index: number) => {
    if (!confirm(t.confirmDeleteBrand)) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const cleaned = items
      .filter((b) => b.name.trim())
      .map((b) => ({
        name: b.name.trim(),
        ...(b.logo ? { logo: b.logo } : {}),
      }));
    const result = await saveBrands(cleaned);
    if (result.success) {
      setItems(cleaned);
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
        <div className="space-y-4">
          {items.map((brand, index) => (
            <Card key={index} className="p-4 space-y-3">
              <Field label={t.brandName}>
                <Input
                  value={brand.name}
                  onChange={(e) => updateBrand(index, { name: e.target.value })}
                  placeholder={t.brandNamePlaceholder}
                />
              </Field>
              <ImageUploadField
                label={t.brandLogo}
                folder="brands"
                value={brand.logo}
                onChange={(url) => updateBrand(index, { logo: url })}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeBrand(index)}
              >
                {t.delete}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
