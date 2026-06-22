'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getGallery, saveGallery } from '../../actions/content';
import { compressImage } from '@/lib/compressImage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminShell from '../_components/AdminShell';
import StatusBanner from '../_components/StatusBanner';
import ImageAdjuster from '../_components/ImageAdjuster';
import ImageUploadField from '../_components/ImageUploadField';
import { useAdminT } from '../_components/AdminLang';

type GalleryItem = {
  id: string;
  url: string;
  position: string;
  scale?: number;
  urlAfter?: string | null;
  positionAfter?: string;
  scaleAfter?: number;
};

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

function GalleryCard({
  item,
  index,
  total,
  t,
  onUpdate,
  onRemove,
  onMove,
}: {
  item: GalleryItem;
  index: number;
  total: number;
  t: ReturnType<typeof useAdminT>['t'];
  onUpdate: (id: string, patch: Partial<GalleryItem>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}) {
  return (
    <Card className="p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t.moveEarlier}
            disabled={index === 0}
            onClick={() => onMove(item.id, -1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t.moveLater}
            disabled={index === total - 1}
            onClick={() => onMove(item.id, 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(item.id)}
        >
          {t.delete}
        </Button>
      </div>
      <ImageAdjuster
        src={item.url}
        position={item.position}
        scale={item.scale ?? 1}
        aspectClass="aspect-square"
        onChange={(pos) => onUpdate(item.id, { position: pos })}
        onScaleChange={(s) => onUpdate(item.id, { scale: s })}
      />
      <ImageUploadField
        label={t.afterPhoto}
        hint={t.beforeHint}
        folder="gallery"
        value={item.urlAfter}
        onChange={(url) => onUpdate(item.id, { urlAfter: url })}
        position={item.positionAfter}
        onPositionChange={(pos) => onUpdate(item.id, { positionAfter: pos })}
        scale={item.scaleAfter ?? 1}
        onScaleChange={(s) => onUpdate(item.id, { scaleAfter: s })}
        adjustAspect="aspect-square"
      />
    </Card>
  );
}

export default function AdminGalleryPage() {
  const { t } = useAdminT();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Auto-save: debounce timer + snapshot of the last-persisted state.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getGallery();
      if (result.success) {
        const mapped = result.data.map((it) => ({ ...it, id: newId() }));
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
  const buildPayload = () =>
    items.map((it) =>
      it.urlAfter
        ? {
            url: it.url,
            position: it.position,
            scale: it.scale ?? 1,
            urlAfter: it.urlAfter,
            positionAfter: it.positionAfter || '50% 50%',
            scaleAfter: it.scaleAfter ?? 1,
          }
        : {
            url: it.url,
            position: it.position,
            scale: it.scale ?? 1,
          }
    );

  // Debounced auto-save whenever the gallery changes (after initial load).
  useEffect(() => {
    if (lastSaved.current === null) return;
    const snapshot = JSON.stringify(items);
    if (snapshot === lastSaved.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const result = await saveGallery(buildPayload());
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

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;

    setUploading(true);
    setMessage('');
    try {
      const added: GalleryItem[] = [];
      for (const file of list) {
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.append('file', compressed);
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
        added.push({ id: newId(), url: data.url, position: '50% 50%', scale: 1 });
      }
      setItems((prev) => [...prev, ...added]);
      setMessage(
        `✓ ${added.length} ${added.length === 1 ? 'photo' : 'photos'} added`
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

  const removeItem = (id: string) => {
    if (!confirm(t.confirmDeleteGalleryImage)) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (id: string, patch: Partial<GalleryItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };

  const moveItem = (id: string, dir: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const payload = buildPayload();
    const cleaned: GalleryItem[] = items.map((it, i) => ({
      id: it.id,
      ...payload[i],
    }));
    const result = await saveGallery(payload);
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
    <AdminShell active="gallery" maxWidth="max-w-6xl">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <GalleryCard
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              t={t}
              onUpdate={updateItem}
              onRemove={removeItem}
              onMove={moveItem}
            />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
