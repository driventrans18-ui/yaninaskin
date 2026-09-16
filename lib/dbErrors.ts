// Detects "the database hasn't been migrated yet" errors from PostgREST so the
// admin can show a clear "run the migration" banner instead of a generic
// failure. PGRST204 = unknown column in insert/update; 42703 = unknown column
// in a filter/select; 42P01 = unknown table; 42883 = unknown function.
export function isSchemaError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; message?: string; hint?: string };
  const code = e.code || '';
  if (['PGRST204', '42703', '42P01', '42883', 'PGRST202'].includes(code)) return true;
  const msg = (e.message || '').toLowerCase();
  return (
    (msg.includes('column') && msg.includes('does not exist')) ||
    msg.includes('schema cache') ||
    (msg.includes('relation') && msg.includes('does not exist'))
  );
}

export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (!err) return fallback;
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return String(err) || fallback;
}
