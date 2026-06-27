'use client';

import { useState, useEffect, useRef } from 'react';
import { getAboutContent, updateAboutContent } from '../../actions/content';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminShell from '../_components/AdminShell';
import StatusBanner from '../_components/StatusBanner';
import Field from '../_components/Field';
import { useAdminT } from '../_components/AdminLang';
import { t as publicT } from '../../translations';
import { createClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

type BioLang = 'en' | 'uk' | 'es';
const BIO_LANGS: { code: BioLang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'uk', label: 'UA' },
  { code: 'es', label: 'ES' },
];
type BioFields = {
  eyebrow?: string;
  name?: string;
  bio1?: string;
  bio2?: string;
  bio3?: string;
  bio4?: string;
  badges?: string[];
};

type AboutData = {
  eyebrow?: string;
  name?: string;
  bio1?: string;
  bio2?: string;
  bio3?: string;
  bio4?: string;
  badges?: string[];
  photo_url?: string;
  photo_position?: string;
  phone?: string;
  email?: string;
  address?: string;
  instagram_url?: string;
  tiktok_url?: string;
  translations?: Record<string, BioFields>;
};

type PhotoItem = {
  name: string;
  url: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AdminAboutPage() {
  const { t } = useAdminT();
  const [about, setAbout] = useState<AboutData>({});
  const [editLang, setEditLang] = useState<BioLang>('en');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  // Auto-save: debounce timer + snapshot of the last-persisted bio state.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; posX: number; posY: number } | null>(null);

  useEffect(() => {
    loadAbout();
    loadPhotos();
  }, []);

  const loadAbout = async () => {
    const result = await getAboutContent();
    if (result.data) {
      setAbout(result.data);
      // Seed the snapshot so loading doesn't trigger an auto-save.
      lastSaved.current = JSON.stringify(result.data);
      if (result.data.photo_position) {
        const parts = result.data.photo_position.split(' ');
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        setPosX(x);
        setPosY(y);
      }
    } else {
      lastSaved.current = JSON.stringify({});
    }
  };

  // Build the persist payload — drops empty localized fields / languages so an
  // English-only save never sends a `translations` key. Shared by Save + auto-save.
  const buildPayload = (): AboutData => {
    const payload: AboutData = { ...about };
    if (payload.translations) {
      const cleaned: Record<string, BioFields> = {};
      for (const [lng, fields] of Object.entries(payload.translations)) {
        const f: BioFields = {};
        for (const [k, v] of Object.entries(fields || {})) {
          if (Array.isArray(v)) {
            const arr = v.map((s) => s.trim()).filter(Boolean);
            if (arr.length) (f as any)[k] = arr;
          } else if (typeof v === 'string' && v.trim()) {
            (f as any)[k] = v;
          }
        }
        if (Object.keys(f).length) cleaned[lng] = f;
      }
      if (Object.keys(cleaned).length) payload.translations = cleaned;
      else delete payload.translations;
    }
    return payload;
  };

  // Debounced auto-save whenever the bio changes (after initial load).
  useEffect(() => {
    if (lastSaved.current === null) return;
    const snapshot = JSON.stringify(about);
    if (snapshot === lastSaved.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const result = await updateAboutContent(buildPayload());
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
  }, [about]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    []
  );

  const loadPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const { data, error } = await supabase.storage
        .from('about-photos')
        .list();

      if (error) {
        console.warn('Storage bucket not ready:', error);
        setPhotos([]);
        return;
      }

      if (!data) {
        setPhotos([]);
        return;
      }

      const photoList: PhotoItem[] = data
        .filter((file) => file.id !== null && !file.name.startsWith('.'))
        .map((file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('about-photos')
            .getPublicUrl(file.name);
          return { name: file.name, url: publicUrl };
        });

      setPhotos(photoList);
    } catch (err) {
      console.warn('Error loading photos (bucket may not exist):', err);
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const deletePhoto = async (fileName: string) => {
    if (!confirm(t.confirmDeletePhoto)) return;

    try {
      const { error } = await supabase.storage
        .from('about-photos')
        .remove([fileName]);

      if (error) throw error;

      setMessage('✓ Photo deleted');
      if (about.photo_url?.includes(fileName)) {
        setAbout({...about, photo_url: undefined});
      }
      loadPhotos();
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('✗ Error deleting photo: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    // Cancel any pending auto-save so it doesn't double-write.
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const snapshot = JSON.stringify(about);
    try {
      const result = await updateAboutContent(buildPayload());
      if (result.success) {
        lastSaved.current = snapshot;
        setMessage('✓ Bio saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('✗ Error saving bio: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      setMessage('✗ Error: ' + String(error));
    }
    setIsSaving(false);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage('✗ Please select an image file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      setMessage('⏳ Compressing image...');

      let fileToUpload = file;

      if (file.size > 4 * 1024 * 1024) {
        const options = {
          maxSizeMB: 3.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(file, options);
      }

      setMessage('⏳ Uploading...');

      const formData = new FormData();
      formData.append('file', fileToUpload);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();

      if (!response.ok) {
        let errorMsg = 'Upload failed';
        try {
          const data = JSON.parse(text);
          errorMsg = data.error || 'Upload failed';
        } catch {
          errorMsg = text || response.statusText || 'Upload failed';
        }
        throw new Error(errorMsg);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid server response');
      }

      setAbout({...about, photo_url: data.url});
      loadPhotos();
      setMessage('✓ Photo uploaded!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ ' + (err instanceof Error ? err.message : 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleImagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = { pointerX: e.clientX, pointerY: e.clientY, posX, posY };
    setIsDraggingImage(true);
  };

  const handleImagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    // Drag the photo so it follows the finger: moving down reveals the top,
    // which lowers object-position Y. Hence subtract the pointer delta.
    const dxPct = ((e.clientX - start.pointerX) / rect.width) * 100;
    const dyPct = ((e.clientY - start.pointerY) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, start.posX - dxPct));
    const clampedY = Math.max(0, Math.min(100, start.posY - dyPct));

    setPosX(clampedX);
    setPosY(clampedY);
    setAbout({...about, photo_position: `${clampedX}% ${clampedY}%`});
  };

  const handleImagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragStartRef.current = null;
    setIsDraggingImage(false);
  };

  // English lives in the top-level columns; UA/ES live in `translations`.
  // For UA/ES we show what the public site would show (the localized value,
  // else the owner's English, else the static built-in translation) so the
  // editor preview matches the live site and is never blank.
  const isEn = editLang === 'en';
  const staticAbout = (publicT[editLang]?.about || {}) as BioFields;
  const enAbout = (publicT.en?.about || {}) as BioFields;
  const loc = about.translations?.[editLang];
  // For UA/ES inputs, show the English text as the placeholder so the owner
  // knows what to translate.
  const ph = (key: keyof BioFields, fallback: string): string =>
    isEn ? fallback : (about[key] as string) || (enAbout[key] as string) || fallback;

  const getStr = (key: keyof BioFields): string => {
    if (isEn) return (about[key] as string) || '';
    const override = loc?.[key] as string | undefined;
    if (override !== undefined) return override;
    return (about[key] as string) || (staticAbout[key] as string) || '';
  };

  const setBio = (key: keyof BioFields, value: string | string[]) => {
    if (isEn) {
      setAbout({ ...about, [key]: value });
      return;
    }
    const next: Record<string, BioFields> = { ...(about.translations || {}) };
    next[editLang] = { ...(next[editLang] || {}), [key]: value };
    setAbout({ ...about, translations: next });
  };

  const getBadges = (): string[] => {
    if (isEn) return about.badges || [];
    return loc?.badges || about.badges || staticAbout.badges || [];
  };

  return (
    <AdminShell active="bio" maxWidth="max-w-7xl">
      <StatusBanner message={message} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Edit Panel */}
        <Card className="p-8 space-y-6">
          <h2 className="text-xl">{t.editBio}</h2>

          <div>
            <p className="block text-sm font-medium text-foreground mb-2">{t.photo}</p>

            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-4 ${
                dragActive
                  ? 'border-accent bg-accent/10'
                  : 'border-input hover:border-accent bg-muted'
              } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <div className="space-y-2">
                <div className="text-2xl">📸</div>
                <p className="font-medium text-foreground text-sm">
                  {uploading ? t.uploading : t.dropImage}
                </p>
                <p className="text-xs text-muted-foreground">{t.dropHint}</p>
              </div>
            </div>

            {/* Image Preview with Position and Zoom Control */}
            {about.photo_url && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-foreground">{t.adjustPosition}</div>
                  <div className="text-xs text-muted-foreground">{t.zoom}: {zoom}%</div>
                </div>
                <div
                  ref={containerRef}
                  onPointerDown={handleImagePointerDown}
                  onPointerMove={handleImagePointerMove}
                  onPointerUp={handleImagePointerUp}
                  onPointerCancel={handleImagePointerUp}
                  className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-secondary border border-border touch-none select-none ${
                    isDraggingImage ? 'cursor-grabbing' : 'cursor-grab'
                  }`}
                >
                  <img
                    src={about.photo_url}
                    alt="Preview"
                    draggable={false}
                    className="w-full h-full object-cover transition-transform pointer-events-none select-none"
                    style={{
                      objectPosition: `${posX}% ${posY}%`,
                      transform: `scale(${zoom / 100})`,
                    }}
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full border-2 border-dashed border-white/30" />
                    <div className="absolute top-1/3 left-0 w-full h-px bg-white/20" />
                    <div className="absolute top-2/3 left-0 w-full h-px bg-white/20" />
                    <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" />
                    <div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">100%</span>
                    <input
                      type="range"
                      min="100"
                      max="200"
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-1 accent-accent"
                    />
                    <span className="text-xs text-muted-foreground">200%</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {t.dragHint} • X: {Math.round(posX)}%, Y: {Math.round(posY)}%
                  </p>
                </div>
              </div>
            )}

            {/* Photo Gallery Browser */}
            {photos.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-foreground mb-2">{t.savedPhotos}</div>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-border rounded-lg bg-muted">
                  {photos.map((photo) => (
                    <div key={photo.name} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className={`w-full h-24 object-cover rounded cursor-pointer transition-opacity ${
                          about.photo_url?.includes(photo.name) ? 'ring-2 ring-ring' : ''
                        }`}
                        onClick={() => setAbout({...about, photo_url: photo.url})}
                      />
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => deletePhoto(photo.name)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Field label={t.bioLang} hint={t.bioLangHint}>
            <div className="flex gap-2">
              {BIO_LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setEditLang(l.code)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    editLang === l.code
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label={t.eyebrow}>
            <Input
              value={getStr('eyebrow')}
              onChange={(e) => setBio('eyebrow', e.target.value)}
              placeholder={ph('eyebrow', 'e.g., Meet Your Esthetician')}
            />
          </Field>

          <Field label={t.name}>
            <Input
              value={getStr('name')}
              onChange={(e) => setBio('name', e.target.value)}
              placeholder={ph('name', 'Full name')}
            />
          </Field>

          <Field label={`${t.bioP} 1`}>
            <Textarea
              value={getStr('bio1')}
              onChange={(e) => setBio('bio1', e.target.value)}
              placeholder={ph('bio1', 'First bio paragraph...')}
              rows={3}
            />
          </Field>

          <Field label={`${t.bioP} 2`}>
            <Textarea
              value={getStr('bio2')}
              onChange={(e) => setBio('bio2', e.target.value)}
              placeholder={ph('bio2', 'Second bio paragraph...')}
              rows={3}
            />
          </Field>

          <Field label={`${t.bioP} 3`}>
            <Textarea
              value={getStr('bio3')}
              onChange={(e) => setBio('bio3', e.target.value)}
              placeholder={ph('bio3', 'Third bio paragraph...')}
              rows={3}
            />
          </Field>

          <Field label={`${t.bioP} 4`} hint={t.optional}>
            <Textarea
              value={getStr('bio4')}
              onChange={(e) => setBio('bio4', e.target.value)}
              placeholder={ph('bio4', 'Fourth bio paragraph (optional)...')}
              rows={3}
            />
          </Field>

          <Field label={t.badges} hint={t.badgesHint}>
            <Input
              value={getBadges().join(', ')}
              onChange={(e) => setBio('badges', e.target.value.split(',').map(b => b.trim()))}
              placeholder="Licensed Esthetician, Rochester NY, Skin Specialist"
            />
          </Field>

          <p className="border-t border-border pt-6 text-xs text-muted-foreground">
            {t.contactMovedToSettings}
          </p>

          <div className="sticky bottom-0 -mx-8 px-8 py-4 bg-card/95 backdrop-blur border-t border-border">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="lg"
              className="w-full"
            >
              {isSaving ? t.saving : t.saveBio}
            </Button>
          </div>
        </Card>

        {/* Live Preview */}
        <div>
          <h2 className="text-xl mb-4">{t.livePreview}</h2>
          <Card className="p-8">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              {/* Photo */}
              <div className="relative aspect-[3/4] w-full max-w-sm mx-auto md:mx-0 rounded-2xl overflow-hidden bg-secondary">
                {about.photo_url ? (
                  <img
                    src={about.photo_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: about.photo_position || '50% 50%',
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span>{t.photoPreview}</span>
                  </div>
                )}
              </div>
              {/* Bio */}
              <div>
                <p className="eyebrow mb-2">{getStr('eyebrow') || 'EYEBROW'}</p>
                <h2 className="text-3xl mb-4">{getStr('name') || 'Name'}</h2>
                <p className="mb-3 text-muted-foreground text-sm leading-relaxed">{getStr('bio1') || 'Bio paragraph 1...'}</p>
                <p className="mb-3 text-muted-foreground text-sm leading-relaxed">{getStr('bio2') || 'Bio paragraph 2...'}</p>
                <p className="mb-6 text-muted-foreground text-sm leading-relaxed">{getStr('bio3') || 'Bio paragraph 3...'}</p>
                {getStr('bio4') && (
                  <p className="mb-6 text-muted-foreground text-sm leading-relaxed">{getStr('bio4')}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {getBadges().map((badge) => (
                    badge && (
                      <Badge key={badge} variant="outline">
                        {badge}
                      </Badge>
                    )
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
