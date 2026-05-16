'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminShell from '../_components/AdminShell';
import AdminLogin from '../_components/AdminLogin';
import StatusBanner from '../_components/StatusBanner';
import { useAdminT } from '../_components/AdminLang';

type GalleryImage = { name: string; url: string };

const BUCKET = 'about-photos';
const FOLDER = 'gallery';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AdminGalleryPage() {
  const { t } = useAdminT();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin-auth');
    if (stored === 'true') {
      setIsAuthenticated(true);
      loadImages();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(FOLDER, { sortBy: { column: 'name', order: 'asc' } });

      if (error) throw error;

      const list = (data || [])
        .filter((f) => f.id !== null && !f.name.startsWith('.'))
        .map((f) => {
          const { data: { publicUrl } } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(`${FOLDER}/${f.name}`);
          return { name: f.name, url: publicUrl };
        });

      setImages(list);
    } catch (err) {
      console.warn('Error loading gallery (bucket may not exist):', err);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;

    setUploading(true);
    setMessage('');
    try {
      for (const file of list) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', FOLDER);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const text = await res.text();
          let msg = 'Upload failed';
          try {
            msg = JSON.parse(text).error || msg;
          } catch {
            msg = text || msg;
          }
          throw new Error(msg);
        }
      }
      setMessage(`✓ ${list.length} ${list.length === 1 ? 'photo' : 'photos'} uploaded`);
      await loadImages();
      setTimeout(() => setMessage(''), 3000);
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

  const deleteImage = async (name: string) => {
    if (!confirm(t.confirmDeleteGalleryImage)) return;
    try {
      const { error } = await supabase.storage
        .from(BUCKET)
        .remove([`${FOLDER}/${name}`]);
      if (error) throw error;
      setMessage('✓ ' + t.delete);
      await loadImages();
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('✗ ' + (err instanceof Error ? err.message : 'Delete failed'));
    }
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        subtitle={t.subGallery}
        error={loginError}
        onSubmit={(pw) => {
          if (pw === 'skinbeauty') {
            setIsAuthenticated(true);
            localStorage.setItem('admin-auth', 'true');
            setLoginError('');
            loadImages();
          } else {
            setLoginError(t.incorrectPassword);
          }
        }}
      />
    );
  }

  return (
    <AdminShell
      active="gallery"
      maxWidth="max-w-5xl"
      onLogout={() => {
        localStorage.removeItem('admin-auth');
        window.location.href = '/admin/reviews';
      }}
    >
      <StatusBanner message={message} />

      <div className="mb-6">
        <h2 className="text-xl mb-1">{t.editGallery}</h2>
        <p className="text-sm text-muted-foreground">{t.galleryIntro}</p>
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
      ) : images.length === 0 ? (
        <Card className="p-10 text-center">
          <h2 className="text-xl mb-1">{t.noGalleryTitle}</h2>
          <p className="text-muted-foreground">{t.noGalleryBody}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.name}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary"
            >
              <img
                src={img.url}
                alt={img.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-end justify-end p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteImage(img.name)}
                >
                  {t.delete}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
