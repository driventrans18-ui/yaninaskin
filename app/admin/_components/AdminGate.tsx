'use client';

import { useState } from 'react';
import { SignIn2 } from '@/components/ui/clean-minimal-sign-in';
import { useAdminAuth } from './AdminAuth';
import { useAdminT, AdminLangToggle } from './AdminLang';

export default function AdminGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, error, signIn } = useAdminAuth();
  const { t } = useAdminT();
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
        topRight={<AdminLangToggle />}
      />
    );
  }

  return <>{children}</>;
}
