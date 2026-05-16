'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminLogin({
  onSubmit,
  error,
  subtitle,
}: {
  onSubmit: (password: string) => void;
  error?: string;
  subtitle?: string;
}) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="eyebrow">Admin</p>
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Website
          </a>
        </div>
        <h1 className="text-3xl">Sign in</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
}
