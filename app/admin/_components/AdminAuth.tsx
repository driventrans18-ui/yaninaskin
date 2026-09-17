'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { useAdminT } from './AdminLang';

type AdminUser = { email: string };

type MfaPending = { email: string; factorId: string; challengeId: string };
type AdminAuthValue = {
  user: AdminUser | null;
  loading: boolean;
  error: string;
  // Set when the password was accepted but a 2FA code is still required.
  mfa: MfaPending | null;
  signIn: (email: string, password: string) => Promise<void>;
  verifyMfa: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue>({
  user: null,
  loading: true,
  error: '',
  mfa: null,
  signIn: async () => {},
  verifyMfa: async () => {},
  signOut: async () => {},
});

function isAllowed(email: string | undefined | null): boolean {
  if (!email) return false;
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  const list = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  // If no allowlist is configured, rely on Supabase having only the
  // invited accounts (public sign-ups disabled).
  return list.length === 0 || list.includes(email.toLowerCase());
}

export function AdminAuthProvider({
  children,
  initialEmail = null,
}: {
  children: React.ReactNode;
  // Email verified by the server layout (cookie → Supabase). When present the
  // gate opens immediately; the browser client still tracks sign-out/expiry.
  initialEmail?: string | null;
}) {
  const { t } = useAdminT();
  const clientRef = useRef<SupabaseClient | null>(null);
  if (!clientRef.current) {
    // Cookie-backed client: the session is stored in cookies (not localStorage)
    // so server actions and route handlers can read it and verify the caller.
    clientRef.current = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }
  const supabase = clientRef.current;

  const [user, setUser] = useState<AdminUser | null>(initialEmail ? { email: initialEmail } : null);
  const [loading, setLoading] = useState(!initialEmail);
  const [error, setError] = useState('');
  const [mfa, setMfa] = useState<MfaPending | null>(null);
  const mfaRef = useRef<MfaPending | null>(null);
  mfaRef.current = mfa;

  // If the owner has enrolled an authenticator, a password-only session is
  // only half a sign-in: start a challenge and hold the gate until the code
  // is verified. Returns true when a challenge is pending.
  const needsSecondFactor = async (email: string): Promise<boolean> => {
    try {
      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal.error || aal.data?.nextLevel !== 'aal2' || aal.data.currentLevel === 'aal2') return false;
      const factors = await supabase.auth.mfa.listFactors();
      const factor = factors.data?.totp.find((f) => f.status === 'verified');
      if (!factor) return false;
      const ch = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (ch.error || !ch.data) return false;
      setMfa({ email, factorId: factor.id, challengeId: ch.data.id });
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let active = true;

    const resolve = async (email: string | undefined) => {
      if (email && isAllowed(email)) {
        if (mfaRef.current) return; // waiting for the 2FA code
        if (!initialEmail && (await needsSecondFactor(email))) return;
        if (active) setUser({ email });
      } else if (email) {
        // Authenticated but not on the allowlist.
        await supabase.auth.signOut();
        if (active) {
          setUser(null);
          setError(t.notAuthorized);
        }
      } else if (active) {
        setUser(null);
      }
    };

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        await resolve(data.session?.user?.email);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      resolve(session?.user?.email);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    setError('');
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email, password }
    );
    if (signInError) {
      setError(t.incorrectPassword);
      return;
    }
    const signedEmail = data.user?.email;
    if (!isAllowed(signedEmail)) {
      await supabase.auth.signOut();
      setUser(null);
      setError(t.notAuthorized);
      return;
    }
    if (await needsSecondFactor(signedEmail!)) return;
    setUser({ email: signedEmail! });
  };

  const verifyMfa = async (code: string) => {
    const pending = mfaRef.current;
    if (!pending) return;
    setError('');
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: pending.factorId, challengeId: pending.challengeId, code: code.trim() });
    if (verifyError) {
      setError(t.twoFactorInvalid);
      // A challenge is single-use: open a fresh one for the next attempt.
      const ch = await supabase.auth.mfa.challenge({ factorId: pending.factorId });
      if (!ch.error && ch.data) setMfa({ ...pending, challengeId: ch.data.id });
      return;
    }
    setMfa(null);
    setUser({ email: pending.email });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMfa(null);
    setUser(null);
    window.location.href = '/admin';
  };

  return (
    <AdminAuthContext.Provider
      value={{ user, loading, error, mfa, signIn, verifyMfa, signOut }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
