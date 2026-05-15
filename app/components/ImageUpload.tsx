'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  photoUrl: string | null;
  photoPosition?: string;
  onPhotoChange: (url: string) => void;
  onPositionChange: (position: string) => void;
}

export default function ImageUpload({
  photoUrl,
  photoPosition = '50% 50%',
  onPhotoChange,
  onPositionChange,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      onPhotoChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
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
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingImage || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setPosX(clampedX);
    setPosY(clampedY);
    onPositionChange(`${clampedX}% ${clampedY}%`);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
          className="hidden"
        />
        <div className="space-y-2">
          <div className="text-3xl">📸</div>
          <p className="font-medium text-slate-900">
            {uploading ? 'Uploading...' : 'Drop image here or click to browse'}
          </p>
          <p className="text-xs text-slate-500">Max 5MB • JPEG, PNG, WebP</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Image Preview with Position Control */}
      {photoUrl && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-slate-700">Adjust Position</div>
          <div
            ref={containerRef}
            onMouseDown={() => setIsDraggingImage(true)}
            onMouseUp={() => setIsDraggingImage(false)}
            onMouseLeave={() => setIsDraggingImage(false)}
            onMouseMove={handleImageMouseMove}
            className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 cursor-${
              isDraggingImage ? 'grabbing' : 'grab'
            } border border-slate-200`}
          >
            <img
              src={photoUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              style={{
                objectPosition: `${posX}% ${posY}%`,
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
          <p className="text-xs text-slate-500 text-center">
            Drag the image to adjust position • Position: {Math.round(posX)}%, {Math.round(posY)}%
          </p>
        </div>
      )}
    </div>
  );
}
