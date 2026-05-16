'use client';

import { Button } from '@/components/ui/button';

type AdminTab = 'reviews' | 'services' | 'bio';

const NAV: { key: AdminTab; label: string; href: string }[] = [
  { key: 'reviews', label: 'Reviews', href: '/admin/reviews' },
  { key: 'services', label: 'Services', href: '/admin/services' },
  { key: 'bio', label: 'Bio', href: '/admin/about' },
];

export default function AdminShell({
  active,
  onLogout,
  maxWidth = 'max-w-5xl',
  children,
}: {
  active: AdminTab;
  onLogout: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className={`mx-auto ${maxWidth}`}>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="eyebrow mb-1">Studio Admin</p>
            <h1 className="text-3xl mb-4">Admin</h1>
            <div className="flex flex-wrap gap-1">
              {NAV.map((item) => (
                <Button
                  key={item.key}
                  asChild
                  size="sm"
                  variant={item.key === active ? 'default' : 'ghost'}
                >
                  <a href={item.href}>{item.label}</a>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/">← Website</a>
            </Button>
            <Button variant="destructive" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
