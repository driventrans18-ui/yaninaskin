import imageCompression from 'browser-image-compression';

// Vercel serverless functions reject request bodies larger than ~4.5MB
// (FUNCTION_PAYLOAD_TOO_LARGE). Compress images in the browser before
// uploading so large phone photos still go through.
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  // Small files are already fine — skip the work.
  if (file.size < 1_000_000) return file;
  try {
    return await imageCompression(file, {
      maxSizeMB: 3,
      maxWidthOrHeight: 2000,
      useWebWorker: true,
    });
  } catch {
    // If compression fails, fall back to the original file.
    return file;
  }
}
