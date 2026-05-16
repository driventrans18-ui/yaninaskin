'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Field from './Field';
import ImageAdjuster from './ImageAdjuster';

export default function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  position,
  onPositionChange,
  adjustAspect = 'aspect-[4/3]',
  folder,
}: {
  label: string;
  hint?: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  position?: string | null;
  onPositionChange?: (pos: string) => void;
  adjustAspect?: string;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);
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
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Field label={label} hint={hint}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      {value ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={value}
              alt={label}
              className="h-16 w-16 rounded-lg border border-border object-cover"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? 'Uploading…' : 'Replace'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onChange(null)}
              >
                Remove
              </Button>
            </div>
          </div>
          {onPositionChange && (
            <ImageAdjuster
              src={value}
              position={position || '50% 50%'}
              aspectClass={adjustAspect}
              onChange={onPositionChange}
            />
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Uploading…' : 'Upload image'}
        </Button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </Field>
  );
}
