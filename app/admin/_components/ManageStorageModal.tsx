'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  listStorageFiles,
  deleteStorageFiles,
  type StorageFile,
} from '../../actions/storage';
import { Button } from '@/components/ui/button';
import { useAdminT } from './AdminLang';

function fmt(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function ManageStorageModal({
  onClose,
  onChanged,
}: {
  onClose: () => void;
  onChanged: () => void;
}) {
  const { t } = useAdminT();
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await listStorageFiles();
    setFiles(res.files);
    setSelected(new Set());
    setLoading(false);
  };

  useEffect(() => {
    load();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const toggle = (path: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const selectUnused = () =>
    setSelected(new Set(files.filter((f) => !f.inUse).map((f) => f.path)));

  const selectedBytes = files
    .filter((f) => selected.has(f.path))
    .reduce((sum, f) => sum + f.size, 0);

  const handleDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(t.confirmDeleteFiles)) return;
    setDeleting(true);
    const res = await deleteStorageFiles([...selected]);
    setDeleting(false);
    if (res.success) {
      onChanged();
      await load();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.storageTitle}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3 className="text-xl">{t.storageTitle}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancel}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{t.storageIntro}</p>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectUnused} disabled={loading}>
            {t.selectUnused}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected(new Set())}
            disabled={selected.size === 0}
          >
            {t.clearSelection}
          </Button>
          <div className="ml-auto">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={selected.size === 0 || deleting}
            >
              {deleting
                ? t.storageDeleting
                : `${t.deleteSelected}${
                    selected.size ? ` (${selected.size} · ${fmt(selectedBytes)})` : ''
                  }`}
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t.loading}</p>
          ) : files.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t.storageNoFiles}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {files.map((f) => {
                const isImg = /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(f.name);
                return (
                  <li key={f.path} className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(f.path)}
                      onChange={() => toggle(f.path)}
                      disabled={f.inUse}
                      className="h-4 w-4 shrink-0 accent-[var(--accent)] disabled:opacity-40"
                      aria-label={f.name}
                    />
                    {isImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.url}
                        alt=""
                        loading="lazy"
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-md bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{f.path}</p>
                      <p className="text-xs text-muted-foreground">{fmt(f.size)}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                        f.inUse
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-accent/20 text-accent-foreground'
                      }`}
                    >
                      {f.inUse ? t.storageInUse : t.storageUnused}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
