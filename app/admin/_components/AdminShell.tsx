'use client';

import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Star,
  MessageSquare,
  Sparkles,
  User,
  Images,
  Tags,
  MapPin,
  Globe,
  Settings,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  LogOut,
  ChevronDown,
  Database,
} from 'lucide-react';
import { useAdminT, AdminLangToggle } from './AdminLang';
import { useAdminAuth } from './AdminAuth';
import { useAdminCounts } from './AdminCounts';
import { Menu, MenuItem, MenuSeparator } from './ui/Menu';
import Sheet from './ui/Sheet';
import StorageBar from './StorageBar';

export type AdminTab =
  | 'dashboard'
  | 'bookings'
  | 'reviews'
  | 'messages'
  | 'services'
  | 'bio'
  | 'gallery'
  | 'brands'
  | 'contact'
  | 'domain'
  | 'settings'
  | 'trash';

type NavItem = { key: AdminTab; label: string; href: string; icon: ReactNode; badge?: number };
type NavGroup = { label: string; items: NavItem[] };

function Badge({ n }: { n?: number }) {
  if (!n) return null;
  return (
    <span className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold leading-5 text-accent-foreground tabular-nums">
      {n > 99 ? '99+' : n}
    </span>
  );
}

export default function AdminShell({
  active,
  title,
  subtitle,
  actions,
  maxWidth = 'max-w-5xl',
  children,
  showStorage = false,
}: {
  active: AdminTab;
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  maxWidth?: string;
  children: ReactNode;
  showStorage?: boolean;
}) {
  const { t } = useAdminT();
  const { user, signOut } = useAdminAuth();
  const { counts } = useAdminCounts();
  const [moreOpen, setMoreOpen] = useState(false);

  const groups: NavGroup[] = [
    {
      label: t.groupOverview,
      items: [{ key: 'dashboard', label: t.navDashboard, href: '/admin', icon: <LayoutDashboard /> }],
    },
    {
      label: t.groupInbox,
      items: [
        { key: 'bookings', label: t.navBookings, href: '/admin/bookings', icon: <CalendarCheck />, badge: counts.bookingsNeedsAction },
        { key: 'reviews', label: t.navReviews, href: '/admin/reviews', icon: <Star />, badge: counts.reviewsPending },
        { key: 'messages', label: t.navMessages, href: '/admin/messages', icon: <MessageSquare />, badge: counts.messagesUnread },
      ],
    },
    {
      label: t.groupWebsite,
      items: [
        { key: 'services', label: t.navServices, href: '/admin/services', icon: <Sparkles /> },
        { key: 'bio', label: t.navBio, href: '/admin/about', icon: <User /> },
        { key: 'gallery', label: t.navGallery, href: '/admin/gallery', icon: <Images /> },
        { key: 'brands', label: t.navBrands, href: '/admin/brands', icon: <Tags /> },
        { key: 'contact', label: t.navContact, href: '/admin/contact', icon: <MapPin /> },
      ],
    },
    {
      label: t.groupSetup,
      items: [
        { key: 'domain', label: t.navDomain, href: '/admin/domain', icon: <Globe /> },
        { key: 'settings', label: t.navSettings, href: '/admin/settings', icon: <Settings /> },
        { key: 'trash', label: t.navTrash, href: '/admin/trash', icon: <Trash2 /> },
      ],
    },
  ];

  const allItems = groups.flatMap((g) => g.items);
  const mobilePrimary: AdminTab[] = ['dashboard', 'bookings', 'reviews'];
  const moreBadge = allItems.filter((i) => !mobilePrimary.includes(i.key)).reduce((s, i) => s + (i.badge ?? 0), 0);

  const navLink = (item: NavItem, mobile = false) => {
    const isActive = item.key === active;
    return (
      <a
        key={item.key}
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => setMoreOpen(false)}
        className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-[18px] [&_svg]:shrink-0 ${
          isActive
            ? 'bg-foreground text-background'
            : 'text-foreground/80 hover:bg-accent/20 hover:text-foreground'
        } ${mobile ? 'text-base' : ''}`}
      >
        <span className={isActive ? 'text-background' : 'text-muted-foreground'}>{item.icon}</span>
        <span className="truncate">{item.label}</span>
        <Badge n={item.badge} />
      </a>
    );
  };

  const accountMenu = (
    <Menu
      label={t.account}
      trigger={
        <button
          type="button"
          aria-label={t.account}
          className="flex h-11 items-center gap-2 rounded-full border border-border bg-background pl-1 pr-2.5 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-primary font-serif text-sm text-primary-foreground">
            {(user?.email?.[0] || 'A').toUpperCase()}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
        </button>
      }
    >
      <div className="px-3 py-2 text-xs text-muted-foreground">
        {t.signedInAs}
        <div className="truncate font-medium text-foreground">{user?.email}</div>
      </div>
      <MenuSeparator />
      <MenuItem href="/" icon={<ExternalLink />}>
        {t.viewWebsite}
      </MenuItem>
      <MenuItem href="/admin/settings" icon={<Settings />}>
        {t.navSettings}
      </MenuItem>
      <MenuSeparator />
      <MenuItem onSelect={() => void signOut()} icon={<LogOut />} danger>
        {t.logout}
      </MenuItem>
    </Menu>
  );

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="px-5 pb-4 pt-6">
          <p className="eyebrow mb-1">{t.studioAdmin}</p>
          <p className="font-serif text-2xl leading-none">Skin Beauty</p>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6" aria-label="Admin">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{g.label}</p>
              <div className="space-y-0.5">{g.items.map((i) => navLink(i))}</div>
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <a
            href="/"
            className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm text-foreground/80 hover:bg-accent/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-[18px]"
          >
            <ExternalLink className="text-muted-foreground" />
            {t.viewWebsite}
          </a>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className={`mx-auto flex w-full ${maxWidth} items-center justify-between gap-3 px-4 py-2.5 md:px-8 md:py-3`}>
            <div className="min-w-0 md:hidden">
              <p className="eyebrow leading-none">{t.studioAdmin}</p>
              <p className="truncate font-serif text-lg leading-tight">{allItems.find((i) => i.key === active)?.label ?? t.adminTitle}</p>
            </div>
            <div className="hidden min-w-0 md:block">
              {title && <h1 className="truncate font-serif text-2xl font-medium leading-tight">{title}</h1>}
              {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <AdminLangToggle />
              <a
                href="/"
                className="hidden h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
              >
                <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
                {t.viewWebsite}
              </a>
              {accountMenu}
            </div>
          </div>
        </header>

        <main className={`mx-auto w-full ${maxWidth} flex-1 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4 md:px-8 md:pb-12 md:pt-6`}>
          {counts.schemaOutdated && (
            <div role="alert" className="mb-5 flex gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
              <Database className="mt-0.5 size-4 shrink-0 text-amber-800" aria-hidden />
              <div>
                <p className="font-medium">{t.dbUpdateTitle}</p>
                <p className="text-muted-foreground">{t.dbUpdateBody}</p>
              </div>
            </div>
          )}
          {(title || actions) && (
            <div className="mb-5 flex flex-col gap-3 md:hidden">
              {title && (
                <div>
                  <h1 className="font-serif text-2xl font-medium leading-tight">{title}</h1>
                  {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
              )}
              {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
          )}
          {actions && <div className="mb-5 hidden flex-wrap gap-2 md:flex">{actions}</div>}
          {children}
          {showStorage && <StorageBar />}
        </main>
      </div>

      {/* ── Mobile bottom bar ── */}
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {allItems
          .filter((i) => mobilePrimary.includes(i.key))
          .map((item) => {
            const isActive = item.key === active;
            return (
              <a
                key={item.key}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&_svg]:size-[22px] ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <span className={`rounded-full px-3 py-0.5 ${isActive ? 'bg-accent/30' : ''}`}>{item.icon}</span>
                {item.label}
                {item.badge ? (
                  <span className="absolute left-1/2 top-1.5 ml-2 min-w-[18px] rounded-full bg-accent px-1 text-[10px] font-semibold leading-[18px] text-accent-foreground">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </a>
            );
          })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          className={`relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&_svg]:size-[22px] ${
            !mobilePrimary.includes(active) ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          <span className={`rounded-full px-3 py-0.5 ${!mobilePrimary.includes(active) ? 'bg-accent/30' : ''}`}>
            <MoreHorizontal />
          </span>
          {t.navMore}
          {moreBadge ? (
            <span className="absolute left-1/2 top-1.5 ml-2 min-w-[18px] rounded-full bg-accent px-1 text-[10px] font-semibold leading-[18px] text-accent-foreground">
              {moreBadge}
            </span>
          ) : null}
        </button>
      </nav>

      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title={t.navMore}>
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{g.label}</p>
              <div className="space-y-0.5">{g.items.map((i) => navLink(i, true))}</div>
            </div>
          ))}
          <div className="border-t border-border pt-4">
            <div className="mb-3 px-3 text-xs text-muted-foreground">
              {t.signedInAs} <span className="font-medium text-foreground">{user?.email}</span>
            </div>
            <a href="/" className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-base hover:bg-accent/20 [&_svg]:size-[18px]">
              <ExternalLink className="text-muted-foreground" /> {t.viewWebsite}
            </a>
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-left text-base text-destructive hover:bg-destructive/10 [&_svg]:size-[18px]"
            >
              <LogOut /> {t.logout}
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
