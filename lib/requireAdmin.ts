import { getServerSupabase } from './supabaseServer';

// Thrown when a privileged server action or route is called without a valid
// admin session. Callers can catch it and turn it into a 401 / error result.
export class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

// Server-side allowlist. Prefer the non-public ADMIN_EMAILS; fall back to the
// existing NEXT_PUBLIC_ADMIN_EMAILS so nothing breaks for deployments that only
// set the public one. If neither is set we require a valid Supabase session but
// no specific address (matching the previous UI behaviour, which relied on
// Supabase sign-ups being disabled).
function allowlist(): string[] {
  const raw =
    process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// Verify the caller is the signed-in owner. getUser() validates the JWT against
// the Supabase auth server (not a local decode), so a forged or absent cookie
// fails here. Throws AuthError on any failure — call it before touching the
// service-role client.
export async function requireAdmin(): Promise<{ email: string }> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  const email = data?.user?.email?.toLowerCase();

  if (error || !email) {
    throw new AuthError();
  }

  const list = allowlist();
  if (list.length > 0 && !list.includes(email)) {
    throw new AuthError();
  }

  // If the owner has enrolled two-factor auth, a password-only session
  // (aal1) is not enough: the sign-in flow must have verified a code (aal2).
  const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!aal.error && aal.data?.nextLevel === 'aal2' && aal.data.currentLevel !== 'aal2') {
    throw new AuthError('Two-factor verification required');
  }

  return { email };
}

// Non-throwing variant for layouts: who is signed in (and allowed), or null.
export async function getAdminSession(): Promise<{ email: string } | null> {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}
