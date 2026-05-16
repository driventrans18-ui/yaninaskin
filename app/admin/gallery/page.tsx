'use client';

import { useState, useEffect, useRef } from 'react';
import { getGallery, saveGallery } from '../../actions/content';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminShell from '../_components/AdminShell';
import StatusBanner from '../_components/StatusBanner';
import ImageAdjuster from '../_components/ImageAdjuster';
import ImageUploadField from '../_components/ImageUploadField';
import { useAdminT } from '../_components/AdminLang';

type GalleryItem = {
  url: string;
  position: string;
  urlAfter?: string | null;
  positionAfter?: string;
};

export default function AdminGalleryPage() {
  const { t } = useAdminT();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const result = await getGallery();
      if (result.success) setItems(result.data);
      setIsLoading(false);
    })();
  }, []);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;

    setUploading(true);
    setMessage('');
    try {
      const added: GalleryItem[] = [];
      for (const file of list) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'gallery');
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const text = await res.text();
        if (!res.ok) {
          let msg = 'Upload failed';
          try {
            msg = JSON.parse(text).error || msg;
          } catch {
            msg = text || msg;
          }
          throw new Error(msg);
        }
        const data = JSON.parse(text);
        added.push({ url: data.url, position: '50% 50%' });
      }
      setItems((prev) => [...prev, ...added]);
      setMessage(
        `✓ ${added.length} ${added.length === 1 ? 'photo' : 'photos'} added — remember to Save`
      );
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('✗ ' + (err instanceof Error ? err.message : 'Upload failed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const removeItem = (index: number) => {
    if (!confirm(t.confirmDeleteGalleryImage)) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, patch: Partial<GalleryItem>) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const cleaned = items.map((it) =>
      it.urlAfter
        ? {
            url: it.url,
            position: it.position,
            urlAfter: it.urlAfter,
            positionAfter: it.positionAfter || '50% 50%',
          }
        : { url: it.url, position: it.position }
    );
    const result = await saveGallery(cleaned);
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
    <AdminShell active="gallery" maxWidth="max-w-5xl">
      <StatusBanner message={message} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl mb-1">{t.editGallery}</h2>
          <p className="text-sm text-muted-foreground">{t.galleryIntro}</p>
        </div>
        <Button onClick={handleSave} disabled={saving || isLoading}>
          {saving ? t.saving : t.save}
        </Button>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-8 ${
          dragActive
            ? 'border-accent bg-accent/10'
            : 'border-input hover:border-accent bg-muted'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <div className="space-y-2">
          <div className="text-2xl">📸</div>
          <p className="font-medium text-foreground text-sm">
            {uploading ? t.uploading : t.dropImage}
          </p>
          <p className="text-xs text-muted-foreground">{t.dropHint}</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t.loading}</p>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center">
          <h2 className="text-xl mb-1">{t.noGalleryTitle}</h2>
          <p className="text-muted-foreground">{t.noGalleryBody}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item, index) => (
            <Card key={`${item.url}-${index}`} className="p-4 space-y-3">
              <ImageAdjuster
                src={item.url}
                position={item.position}
                aspectClass="aspect-square"
                onChange={(pos) => updateItem(index, { position: pos })}
              />
              <ImageUploadField
                label={t.afterPhoto}
                hint={t.beforeHint}
                folder="gallery"
                value={item.urlAfter}
                onChange={(url) => updateItem(index, { urlAfter: url })}
                position={item.positionAfter}
                onPositionChange={(pos) =>
                  updateItem(index, { positionAfter: pos })
                }
                adjustAspect="aspect-square"
              />
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => removeItem(index)}
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
