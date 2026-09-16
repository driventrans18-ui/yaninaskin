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
  const { user, loading, error, signIn } = useAdminAuth();
  const { t } = useAdminT();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

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
      />
    );
  }

  return <>{children}</>;
}
