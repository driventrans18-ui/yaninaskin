'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAdminT, AdminLangToggle } from './AdminLang';

export default function AdminLogin({
  onSubmit,
  error,
  subtitle,
}: {
  onSubmit: (password: string) => void;
  error?: string;
  subtitle?: string;
}) {
  const { t } = useAdminT();
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="eyebrow">{t.adminTitle}</p>
          <div className="flex items-center gap-3">
            <AdminLangToggle />
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.website}
            </a>
          </div>
        </div>
        <h1 className="text-3xl">{t.signIn}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="text-sm font-medium text-foreground"
            >
              {t.password}
            </label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            {t.loginBtn}
          </Button>
        </form>
      </Card>
    </div>
  );
}
