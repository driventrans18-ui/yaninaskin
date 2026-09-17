'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminLangProvider, AdminLangToggle, useAdminT } from '../admin/_components/AdminLang';

type Phase = 'checking' | 'ready' | 'invalid' | 'done';

function Inner() {
  const { t, fmt } = useAdminT();
  const clientRef = useRef<SupabaseClient | null>(null);
  if (!clientRef.current) {
    clientRef.current = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  }
  const supabase = clientRef.current;
  const [phase, setPhase] = useState<Phase>('checking');
  const [email, setEmail] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // The link can arrive three ways: a token_hash (email template), a PKCE
  // ?code (default template, same browser as the request) or hash tokens
  // (dashboard-sent links). Any of them ends in a recovery session.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tokenHash = params.get('token_hash');
        const code = params.get('code');
        let session = (await supabase.auth.getSession()).data.session;
        if (!session && tokenHash) {
          const r = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
          if (r.error) throw r.error;
          session = r.data.session;
        } else if (!session && code) {
          const r = await supabase.auth.exchangeCodeForSession(code);
          if (r.error) throw r.error;
          session = r.data.session;
        }
        if (!active) return;
        if (session?.user) {
          setEmail(session.user.email || '');
          setPhase('ready');
          window.history.replaceState(null, '', '/reset-password');
        } else {
          setPhase('invalid');
        }
      } catch {
        if (active) setPhase('invalid');
      }
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  const submit = async () => {
    if (pw1.length < 8) return setError(t.passwordTooShort);
    if (pw1 !== pw2) return setError(t.passwordMismatch);
    setError('');
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: pw1 });
    setBusy(false);
    if (updateError) return setError(updateError.message);
    setPhase('done');
    setTimeout(() => window.location.assign('/admin'), 900);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground">{t.resetBack}</a>
          <AdminLangToggle />
        </div>
        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-secondary">
          <KeyRound className="size-5" aria-hidden />
        </div>
        {phase === 'checking' && <p className="text-sm text-muted-foreground" role="status">{t.resetChecking}</p>}
        {phase === 'invalid' && (
          <>
            <h1 className="font-serif text-2xl">{t.resetTitle}</h1>
            <p className="mt-2 text-sm text-muted-foreground" role="alert">{t.resetInvalid}</p>
            <Button asChild className="mt-5 h-12 w-full rounded-full">
              <a href="/admin">{t.requestAgain}</a>
            </Button>
          </>
        )}
        {phase === 'done' && <p className="text-sm" role="status">{t.resetDone}</p>}
        {phase === 'ready' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="space-y-3"
          >
            <h1 className="font-serif text-2xl">{t.newPasswordTitle}</h1>
            <p className="text-sm text-muted-foreground">{fmt(t.newPasswordBody, { email })}</p>
            <Input type="password" autoComplete="new-password" placeholder={t.newPassword} aria-label={t.newPassword} value={pw1} onChange={(e) => setPw1(e.target.value)} className="h-12" autoFocus />
            <Input type="password" autoComplete="new-password" placeholder={t.confirmPassword} aria-label={t.confirmPassword} value={pw2} onChange={(e) => setPw2(e.target.value)} className="h-12" />
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <Button type="submit" className="h-12 w-full rounded-full" disabled={busy || !pw1}>
              {t.updatePassword}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <AdminLangProvider>
      <Inner />
    </AdminLangProvider>
  );
}
