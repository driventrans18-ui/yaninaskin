// Browser-only helpers for the gallery uploader.

// Upload one file to /api/upload with a progress callback (XHR exposes upload
// progress; fetch does not).
export function uploadWithProgress(file: File, folder: string, onProgress?: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && data.url) resolve(data.url as string);
        else reject(new Error(data.error || `Upload failed (${xhr.status})`));
      } catch {
        reject(new Error('Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.open('POST', '/api/upload');
    xhr.send(fd);
  });
}

// Downscale to `maxPx` on the long edge as a JPEG (thumbnails for the grid).
export async function makeThumbnail(file: File, maxPx = 480, quality = 0.8): Promise<File | null> {
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) return null;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality));
    if (!blob) return null;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '-thumb.jpg', { type: 'image/jpeg' });
  } catch {
    return null;
  }
}
