'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useAdminT } from './AdminLang';

type AdminUser = { email: string };

type AdminAuthValue = {
  user: AdminUser | null;
  loading: boolean;
  error: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue>({
  user: null,
  loading: true,
  error: '',
  signIn: async () => {},
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
}: {
  children: React.ReactNode;
}) {
  const { t } = useAdminT();
  const clientRef = useRef<SupabaseClient | null>(null);
  if (!clientRef.current) {
    clientRef.current = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }
  const supabase = clientRef.current;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const resolve = async (email: string | undefined) => {
      if (email && isAllowed(email)) {
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
    setUser({ email: signedEmail! });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{ user, loading, error, signIn, signOut }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
