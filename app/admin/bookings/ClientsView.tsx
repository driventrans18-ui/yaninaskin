'use client';

import { useMemo, useState } from 'react';
import { Mail, Phone, MessageSquareText, UsersRound } from 'lucide-react';
import type { ClientProfile } from '@/lib/booking/clients';
import { statusOf } from '@/lib/booking/status';
import { formatPhone } from '@/lib/phone';
import { smsHref, telHref, mailtoHref } from '@/lib/booking/templates';
import { formatDate } from '@/lib/tz';
import { useAdminT } from '../_components/AdminLang';
import { Chip, EmptyState, SearchInput, SectionTitle } from '../_components/ui/Bits';
import Sheet from '../_components/ui/Sheet';
import { StatusChip } from './BookingCard';
import { formatPreferred } from './bookingFormat';

export default function ClientsView({
  clients,
  tz,
  now,
  onOpenBooking,
}: {
  clients: ClientProfile[];
  tz: string;
  now: Date;
  onOpenBooking: (bookingId: string) => void;
}) {
  const { t, lang, fmt } = useAdminT();
  const [q, setQ] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return clients;
    const digits = s.replace(/\D/g, '');
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.email && c.email.includes(s)) ||
        (digits && c.phone && c.phone.replace(/\D/g, '').includes(digits)) ||
        c.bookings.some((b) => (b.service || '').toLowerCase().includes(s)),
    );
  }, [clients, q]);
  const open = openKey ? clients.find((c) => c.key === openKey) : null;

  return (
    <div>
      <SearchInput value={q} onChange={setQ} placeholder={t.clientsSearch} className="mb-4" />
      {list.length === 0 ? (
        <EmptyState icon={<UsersRound />} title={t.clientNone} body={t.clientNoneBody} />
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {list.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                onClick={() => setOpenKey(c.key)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-serif text-sm text-secondary-foreground">
                  {c.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">{c.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {c.phone ? formatPhone(c.phone) : c.email || '—'}
                    {c.lastService ? ` · ${c.lastService}` : ''}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  {c.visits > 0 ? <Chip tone="success">{fmt(t.visitsCount, { n: c.visits })}</Chip> : <Chip tone="outline">{t.badgeNewClient}</Chip>}
                  <span className="text-[11px] text-muted-foreground">{fmt(t.requestsCount, { n: c.requests })}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={Boolean(open)} onClose={() => setOpenKey(null)} title={open?.name} subtitle={open ? `${t.clientSince} ${formatDate(new Date(open.firstSeenAt), lang, tz, { month: 'short', year: 'numeric' })}` : undefined}>
        {open && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                [t.clientRequests, open.requests],
                [t.clientVisits, open.visits],
                [t.clientUpcoming, open.upcoming],
              ].map(([label, n]) => (
                <div key={String(label)} className="rounded-xl border border-border p-3">
                  <p className="font-serif text-2xl">{n}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {open.phone && (
                <>
                  <a href={smsHref(open.phone, '')} className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-4 text-sm text-background [&_svg]:size-4">
                    <MessageSquareText /> {t.actionText}
                  </a>
                  <a href={telHref(open.phone)} className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm [&_svg]:size-4">
                    <Phone /> {t.actionCall}
                  </a>
                </>
              )}
              {open.email && (
                <a href={mailtoHref(open.email, '', '')} className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm [&_svg]:size-4">
                  <Mail /> {t.actionEmail}
                </a>
              )}
            </div>
            <div>
              <SectionTitle>{t.clientHistory}</SectionTitle>
              <ul className="divide-y divide-border rounded-2xl border border-border">
                {open.bookings.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenKey(null);
                        onOpenBooking(b.id);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{b.service || t.unknownService}</span>
                        <span className="block text-xs text-muted-foreground">{formatPreferred(b, { lang, tz, t, now })}</span>
                      </span>
                      <StatusChip status={statusOf(b)} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
