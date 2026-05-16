'use server';

import { createClient } from '@supabase/supabase-js';

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
