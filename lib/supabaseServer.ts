import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server-side Supabase client that reads the admin's auth session from the
// request cookies (written by the browser client in AdminAuth.tsx). This is
// what lets server actions and route handlers verify *who* is calling — the
// service-role client bypasses RLS, so every privileged path must first prove
// the caller is the signed-in owner via this session.
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a context with a read-only cookie store (e.g. a
            // Server Component). Safe to ignore: the middleware refreshes the
            // session cookie on navigation.
          }
        },
      },
    }
  );
}
