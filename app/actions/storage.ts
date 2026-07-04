'use server';

import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/requireAdmin';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-key'
);

const BUCKET = 'about-photos';
const MAX_DEPTH = 3;

// Supabase's storage API exposes per-file size but not the plan quota,
// so the limit is a configured constant (default 1 GB free tier).
export async function getStorageUsage() {
  const limitMb =
    Number(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_LIMIT_MB) || 1024;
  const limitBytes = limitMb * 1024 * 1024;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, usedBytes: 0, limitBytes };
  }

  try {
    await requireAdmin();
    let usedBytes = 0;

    const walk = async (prefix: string, depth: number): Promise<void> => {
      const { data, error } = await adminClient.storage
        .from(BUCKET)
        .list(prefix, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' },
        });
      if (error) throw error;
      if (!data) return;

      for (const entry of data) {
        if (!entry.name || entry.name.startsWith('.')) continue;
        const isFolder = entry.id === null;
        if (isFolder) {
          if (depth < MAX_DEPTH) {
            await walk(prefix ? `${prefix}/${entry.name}` : entry.name, depth + 1);
          }
        } else {
          const size = (entry.metadata as { size?: number } | null)?.size;
          usedBytes += typeof size === 'number' ? size : 0;
        }
      }
    };

    await walk('', 0);
    return { success: true, usedBytes, limitBytes };
  } catch (err) {
    console.error('Error computing storage usage:', err);
    return { success: false, usedBytes: 0, limitBytes };
  }
}

export type StorageFile = {
  path: string;
  name: string;
  size: number;
  url: string;
  inUse: boolean;
};

// Collect every storage URL the site currently references, so the manage-storage
// view can flag in-use files and protect them from deletion.
async function getReferencedUrls(): Promise<Set<string>> {
  const used = new Set<string>();
  const add = (v: unknown) => {
    if (typeof v === 'string' && v.trim()) used.add(v.trim());
  };

  // about_content: profile photo + gallery (before/after) + brand logos
  const { data: about } = await adminClient
    .from('about_content')
    .select('photo_url, gallery, brands')
    .single();
  if (about) {
    add(about.photo_url);
    const gallery = Array.isArray(about.gallery) ? about.gallery : [];
    for (const g of gallery) {
      add(g?.url);
      add(g?.urlAfter);
    }
    const brands = Array.isArray(about.brands) ? about.brands : [];
    for (const b of brands) add(b?.logo);
  }

  // reviews: photos array + legacy single photo_url
  const { data: reviews } = await adminClient
    .from('reviews')
    .select('photos, photo_url');
  for (const r of reviews || []) {
    add((r as any).photo_url);
    const photos = Array.isArray((r as any).photos) ? (r as any).photos : [];
    for (const p of photos) add(p);
  }

  return used;
}

// List every file in the bucket, largest first, flagged as in-use or unused.
export async function listStorageFiles(): Promise<{
  success: boolean;
  files: StorageFile[];
}> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, files: [] };
  }
  try {
    await requireAdmin();
    const used = await getReferencedUrls();
    const files: StorageFile[] = [];

    const walk = async (prefix: string, depth: number): Promise<void> => {
      const { data, error } = await adminClient.storage
        .from(BUCKET)
        .list(prefix, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
      if (error) throw error;
      if (!data) return;

      for (const entry of data) {
        if (!entry.name || entry.name.startsWith('.')) continue;
        const path = prefix ? `${prefix}/${entry.name}` : entry.name;
        const isFolder = entry.id === null;
        if (isFolder) {
          if (depth < MAX_DEPTH) await walk(path, depth + 1);
        } else {
          const size = (entry.metadata as { size?: number } | null)?.size ?? 0;
          const { data: pub } = adminClient.storage.from(BUCKET).getPublicUrl(path);
          const url = pub.publicUrl;
          files.push({ path, name: entry.name, size, url, inUse: used.has(url) });
        }
      }
    };

    await walk('', 0);
    files.sort((a, b) => b.size - a.size);
    return { success: true, files };
  } catch (err) {
    console.error('Error listing storage files:', err);
    return { success: false, files: [] };
  }
}

// Delete selected files from the bucket. Refuses any file that is still
// referenced on the site (belt-and-suspenders against the UI).
export async function deleteStorageFiles(
  paths: string[]
): Promise<{ success: boolean; error?: string; deleted?: number }> {
  if (!paths || paths.length === 0) return { success: true, deleted: 0 };
  try {
    await requireAdmin();
    const used = await getReferencedUrls();
    const safe = paths.filter((p) => {
      const { data } = adminClient.storage.from(BUCKET).getPublicUrl(p);
      return !used.has(data.publicUrl);
    });
    if (safe.length === 0) {
      return { success: false, error: 'Selected files are still in use.' };
    }
    const { error } = await adminClient.storage.from(BUCKET).remove(safe);
    if (error) throw error;
    return { success: true, deleted: safe.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete files';
    console.error('Error deleting storage files:', err);
    return { success: false, error: message };
  }
}
