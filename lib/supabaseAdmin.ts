import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Lazily-created Supabase clients for server code. Created on first use (not
// at import time) so a missing env var surfaces as a clear runtime error in
// the one action that needs it instead of breaking every page that imports
// the module during the build.
let adminClient: SupabaseClient | null = null;
let anonClient: SupabaseClient | null = null;

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function hasServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Service-role client: bypasses RLS. Only call after requireAdmin() (or from
// a validated public path such as the booking form submission).
export function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(url(), process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey() || 'missing-key', {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

// Anonymous client: what the public site is allowed to see.
export function getAnonClient(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(url(), anonKey() || 'missing-key', {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return anonClient;
}
