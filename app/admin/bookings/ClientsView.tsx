'use client';

import { useMemo, useState } from 'react';
import { Mail, Phone, MessageSquareText, UsersRound, Plus, Pencil, Instagram, Cake, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ClientProfile } from '@/lib/booking/clients';
import { statusOf } from '@/lib/booking/status';
import { formatPhone } from '@/lib/phone';
import { smsHref, telHref, mailtoHref } from '@/lib/booking/templates';
import { formatDate, formatDateKey } from '@/lib/tz';
import { restoreClients, trashClients, type ClientRecord } from '../../actions/clients';
import { useAdminT } from '../_components/AdminLang';
import { useToast } from '../_components/ui/Toast';
import { Chip, CopyButton, EmptyState, SearchInput, SectionTitle } from '../_components/ui/Bits';
import Sheet from '../_components/ui/Sheet';
import { ConfirmDialog } from '../_components/ui/Dialog';
import { Menu, MenuItem } from '../_components/ui/Menu';
import { StatusChip } from './BookingCard';
import { formatPreferred } from './bookingFormat';
import ClientEditor, { emptyDraft, type ClientDraft } from './ClientEditor';

export default function ClientsView({
  clients,
  tz,
  now,
  onOpenBooking,
  onChanged,
}: {
  clients: ClientProfile[];
  tz: string;
  now: Date;
  onOpenBooking: (bookingId: string) => void;
  onChanged: () => Promise<void>;
}) {
  const { t, lang, fmt } = useAdminT();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ open: boolean; record: ClientRecord | null; initial: ClientDraft }>({ open: false, record: null, initial: emptyDraft() });
  const [confirmRemove, setConfirmRemove] = useState(false);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return clients;
    const digits = s.replace(/\D/g, '');
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.email && c.email.includes(s)) ||
        (digits && c.phone && c.phone.replace(/\D/g, '').includes(digits)) ||
        (c.record?.instagram || '').toLowerCase().includes(s) ||
        (c.record?.notes || '').toLowerCase().includes(s) ||
        c.bookings.some((b) => (b.service || '').toLowerCase().includes(s)),
    );
  }, [clients, q]);
  // A hand-added record that matched a booking client shares that client's
  // profile, so look it up by either the profile key or the record id.
  const open = openKey ? clients.find((c) => c.key === openKey || (c.record && `client:${c.record.id}` === openKey)) ?? null : null;
  const record = (open?.record as ClientRecord | undefined) ?? null;

  const startAdd = () => setEditor({ open: true, record: null, initial: emptyDraft() });
  const startEdit = (c: ClientProfile) => {
    const r = c.record as ClientRecord | undefined;
    setEditor({
      open: true,
      record: r ?? null,
      initial: {
        name: r?.name ?? c.name,
        phone: r?.phone ?? (c.phone ? formatPhone(c.phone) : ''),
        email: r?.email ?? c.email ?? '',
        instagram: r?.instagram ?? '',
        birthday: r?.birthday ?? '',
        notes: r?.notes ?? '',
      },
    });
  };
  const remove = async () => {
    if (!record) return;
    const id = record.id;
    setConfirmRemove(false);
    setEditor((e) => ({ ...e, open: false }));
    setOpenKey(null);
    const r = await trashClients([id]);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    await onChanged();
    toast({ title: t.clientRemoved, duration: 10000, action: { label: t.undo, onClick: async () => { await restoreClients([id]); await onChanged(); } } });
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput value={q} onChange={setQ} placeholder={t.clientsSearch} className="flex-1" />
        <Button className="h-11 rounded-full" onClick={startAdd}>
          <Plus /> {t.addClient}
        </Button>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<UsersRound />} title={t.clientNone} body={t.clientNoneBody} action={<Button className="h-11 rounded-full" onClick={startAdd}><Plus /> {t.addClient}</Button>} />
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {list.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                onClick={() => setOpenKey(c.key)}
                className="flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-serif text-sm text-secondary-foreground">
                  {c.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">{c.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {c.phone ? formatPhone(c.phone) : c.email || (c.record?.instagram ? `@${c.record.instagram}` : '—')}
                    {c.lastService ? ` · ${c.lastService}` : ''}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  {c.visits > 0 ? <Chip tone="success">{fmt(t.visitsCount, { n: c.visits })}</Chip> : c.requests > 0 ? <Chip tone="outline">{t.badgeNewClient}</Chip> : <Chip tone="muted">{t.clientAddedManually}</Chip>}
                  <span className="text-[11px] text-muted-foreground">{c.requests > 0 ? fmt(t.requestsCount, { n: c.requests }) : t.clientNoRequests}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={Boolean(open)}
        onClose={() => setOpenKey(null)}
        title={open?.name}
        subtitle={
          open ? (
            <span className="flex flex-wrap items-center gap-2">
              <Chip tone={open.record ? 'neutral' : 'outline'}>{open.record ? t.clientAddedManually : t.clientFromRequests}</Chip>
              <span className="text-xs text-muted-foreground">{t.clientSince} {formatDate(new Date(open.firstSeenAt), lang, tz, { month: 'short', year: 'numeric' })}</span>
            </span>
          ) : undefined
        }
        footer={
          open && (
            <div className="flex items-center gap-2">
              <Button className="h-12 flex-1 rounded-full md:h-11 md:flex-none" onClick={() => startEdit(open)}>
                <Pencil /> {open.record ? t.editClient : t.addDetails}
              </Button>
              {open.record && (
                <Menu label={t.actMore} trigger={<Button variant="outline" size="icon-lg" aria-label={t.actMore} className="ml-auto h-12 w-12 rounded-full md:h-11 md:w-11"><MoreHorizontal /></Button>}>
                  <MenuItem icon={<Trash2 />} danger onSelect={() => setConfirmRemove(true)}>
                    {t.actDelete}
                  </MenuItem>
                </Menu>
              )}
            </div>
          )
        }
      >
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

            <section>
              <SectionTitle>{t.clientDetails}</SectionTitle>
              <div className="rounded-2xl border border-border">
                {open.phone && (
                  <div className="flex items-center gap-2 px-3 py-1">
                    <Phone className="size-4 text-muted-foreground" aria-hidden />
                    <a href={telHref(open.phone)} className="flex-1 text-sm underline-offset-4 hover:underline">{formatPhone(open.phone)}</a>
                    <CopyButton text={formatPhone(open.phone)} label={t.clientPhone} />
                  </div>
                )}
                {open.email && (
                  <div className="flex items-center gap-2 border-t border-border px-3 py-1 first:border-t-0">
                    <Mail className="size-4 text-muted-foreground" aria-hidden />
                    <span className="flex-1 truncate text-sm">{open.email}</span>
                    <CopyButton text={open.email} label={t.clientEmail} />
                  </div>
                )}
                {open.record?.instagram && (
                  <div className="flex items-center gap-2 border-t border-border px-3 py-1 first:border-t-0">
                    <Instagram className="size-4 text-muted-foreground" aria-hidden />
                    <a href={`https://instagram.com/${open.record.instagram}`} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-sm underline-offset-4 hover:underline">@{open.record.instagram}</a>
                  </div>
                )}
                {open.record?.birthday && (
                  <div className="flex items-center gap-2 border-t border-border px-3 py-2 first:border-t-0">
                    <Cake className="size-4 text-muted-foreground" aria-hidden />
                    <span className="flex-1 text-sm">{formatDateKey(open.record.birthday, lang)}</span>
                  </div>
                )}
                {!open.phone && !open.email && !open.record?.instagram && !open.record?.birthday && (
                  <p className="px-3 py-3 text-sm text-muted-foreground">{t.noPhoneCaptured}</p>
                )}
                <div className="flex flex-wrap gap-2 border-t border-border p-3">
                  {open.phone && (
                    <>
                      <Button asChild className="h-11 rounded-full">
                        <a href={smsHref(open.phone, '')}><MessageSquareText /> {t.actionText}</a>
                      </Button>
                      <Button asChild variant="outline" className="h-11 rounded-full">
                        <a href={telHref(open.phone)}><Phone /> {t.actionCall}</a>
                      </Button>
                    </>
                  )}
                  {open.email && (
                    <Button asChild variant="outline" className="h-11 rounded-full">
                      <a href={mailtoHref(open.email, 'Skin Beauty', '')}><Mail /> {t.actionEmail}</a>
                    </Button>
                  )}
                </div>
              </div>
            </section>

            {open.record?.notes && (
              <section>
                <SectionTitle>{t.clientNotes}</SectionTitle>
                <p className="whitespace-pre-wrap rounded-xl bg-muted px-3 py-2 text-sm">{open.record.notes}</p>
              </section>
            )}

            <section>
              <SectionTitle>{t.clientHistory}</SectionTitle>
              {open.bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.clientNoRequests}</p>
              ) : (
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
              )}
            </section>
          </div>
        )}
      </Sheet>

      <ClientEditor
        open={editor.open}
        record={editor.record}
        initial={editor.initial}
        onClose={() => setEditor((e) => ({ ...e, open: false }))}
        onSaved={async (saved) => {
          setEditor((e) => ({ ...e, open: false }));
          await onChanged();
          setOpenKey(`client:${saved.id}`);
        }}
        onRemove={editor.record ? () => setConfirmRemove(true) : undefined}
      />
      <ConfirmDialog open={confirmRemove} onClose={() => setConfirmRemove(false)} onConfirm={() => void remove()} title={t.actDelete} body={t.clientRemoveConfirm} confirmLabel={t.actDelete} danger />
    </div>
  );
}
