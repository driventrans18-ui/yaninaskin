'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignIn2 } from '@/components/ui/clean-minimal-sign-in';
import { useAdminAuth } from './AdminAuth';
import { useAdminT, AdminLangToggle } from './AdminLang';

// Client half of the gate. The server layout decides whether the page's
// children are rendered at all; this component shows the sign-in form and,
// after a successful browser sign-in, refreshes so the server re-checks the
// new session cookie.
export default function AdminGate({
  children,
  serverAuthed = false,
}: {
  children?: React.ReactNode;
  serverAuthed?: boolean;
}) {
  const { user, loading, error, mfa, signIn, verifyMfa, resetPassword, signOut } = useAdminAuth();
  const { t } = useAdminT();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState('');
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetState, setResetState] = useState<{ sent?: boolean; error?: string }>({});

  // Signed in on the client but the server hasn't seen the cookie yet.
  useEffect(() => {
    if (user && !serverAuthed) router.refresh();
  }, [user, serverAuthed, router]);

  if (loading || (user && !serverAuthed)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">{t.checkingSession}</p>
      </div>
    );
  }

  if (!user && mfa) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <form
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            try {
              await verifyMfa(code);
            } finally {
              setSubmitting(false);
              setCode('');
            }
          }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl">{t.mfaTitle}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t.mfaBody}</p>
            </div>
            <AdminLangToggle />
          </div>
          <label className="sr-only" htmlFor="mfa-code">{t.twoFactorCode}</label>
          <input
            id="mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="h-14 w-full rounded-xl border border-input bg-background text-center text-2xl tracking-[0.5em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {error && <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>}
          <button type="submit" disabled={submitting || code.length < 6} className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50">
            {submitting ? t.signingIn : t.mfaSubmit}
          </button>
          <button type="button" onClick={() => void signOut()} className="mt-2 flex h-11 w-full items-center justify-center rounded-full text-sm text-muted-foreground hover:text-foreground">
            {t.cancel}
          </button>
        </form>
      </div>
    );
  }

  if (!user && forgot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <form
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            setResetState({});
            try {
              const r = await resetPassword(resetEmail);
              setResetState(r.ok ? { sent: true } : { error: r.error || t.toastError });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl">{t.resetTitle}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t.resetBody}</p>
            </div>
            <AdminLangToggle />
          </div>
          {resetState.sent ? (
            <p className="rounded-xl bg-muted px-3 py-3 text-sm" role="status">{t.resetSent}</p>
          ) : (
            <>
              <label className="sr-only" htmlFor="reset-email">{t.emailPlaceholder}</label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                placeholder={t.emailPlaceholder}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {resetState.error && <p className="mt-2 text-sm text-destructive" role="alert">{resetState.error}</p>}
              <button type="submit" disabled={submitting || !resetEmail.trim()} className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50">
                {submitting ? t.sendingLabel : t.resetSend}
              </button>
            </>
          )}
          <button type="button" onClick={() => { setForgot(false); setResetState({}); }} className="mt-2 flex h-11 w-full items-center justify-center rounded-full text-sm text-muted-foreground hover:text-foreground">
            {t.resetBack}
          </button>
        </form>
      </div>
    );
  }

  if (!user) {
    return (
      <SignIn2
        onSignIn={async (email, password) => {
          setSubmitting(true);
          try {
            await signIn(email, password);
          } finally {
            setSubmitting(false);
          }
        }}
        error={error}
        loading={submitting}
        title={t.signIn}
        subtitle={t.signInSubtitle}
        emailPlaceholder={t.emailPlaceholder}
        passwordPlaceholder={t.passwordPlaceholder}
        submitLabel={t.loginBtn}
        loadingLabel={t.signingIn}
        websiteLabel={t.website}
        topRight={<AdminLangToggle />}
        footer={
          <button type="button" onClick={() => setForgot(true)} className="mt-3 min-h-[44px] text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {t.forgotPassword}
          </button>
        }
      />
    );
  }

  return <>{children}</>;
}
