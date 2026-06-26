'use client';

import { Button } from '@/components/ui/button';
import { useAdminT, AdminLangToggle } from './AdminLang';
import { useAdminAuth } from './AdminAuth';
import StorageBar from './StorageBar';

type AdminTab = 'reviews' | 'services' | 'bio' | 'gallery' | 'brands' | 'bookings' | 'contact' | 'domain';

export default function AdminShell({
  active,
  maxWidth = 'max-w-5xl',
  children,
}: {
  active: AdminTab;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  const { t } = useAdminT();
  const { signOut } = useAdminAuth();

  const nav: { key: AdminTab; label: string; href: string }[] = [
    { key: 'reviews', label: t.navReviews, href: '/admin/reviews' },
    { key: 'services', label: t.navServices, href: '/admin/services' },
    { key: 'bio', label: t.navBio, href: '/admin/about' },
    { key: 'gallery', label: t.navGallery, href: '/admin/gallery' },
    { key: 'brands', label: t.navBrands, href: '/admin/brands' },
    { key: 'bookings', label: t.navBookings, href: '/admin/bookings' },
    { key: 'contact', label: t.navContact, href: '/admin/contact' },
    { key: 'domain', label: t.navDomain, href: '/admin/domain' },
  ];

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className={`mx-auto ${maxWidth}`}>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="eyebrow mb-1">{t.studioAdmin}</p>
            <h1 className="text-3xl mb-4">{t.adminTitle}</h1>
            <div className="flex flex-wrap gap-1">
              {nav.map((item) => (
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
          <div className="flex flex-wrap items-center gap-2">
            <AdminLangToggle />
            <Button asChild variant="outline" size="sm">
              <a href="/">{t.website}</a>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => signOut()}>
              {t.logout}
            </Button>
          </div>
        </div>
        {children}
        <StorageBar />
      </div>
    </div>
  );
}
