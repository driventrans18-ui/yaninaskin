'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Archive, Check, Mail, MessageSquare, MessageSquareText, MoreHorizontal, Phone, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getMessagesAdmin, restoreMessages, saveMessageNotes, setMessagesRead, setMessagesStatus, trashMessages, type ContactMessage } from '../../actions/contact';
import { formatPhone, normalizePhone } from '@/lib/phone';
import { smsHref, telHref, mailtoHref } from '@/lib/booking/templates';
import { formatDateTime } from '@/lib/tz';
import AdminShell from '../_components/AdminShell';
import { useAdminT } from '../_components/AdminLang';
import { useAdminCounts } from '../_components/AdminCounts';
import { useToast } from '../_components/ui/Toast';
import { CardSkeleton, Chip, CopyButton, EmptyState, ErrorState, SearchInput, SectionTitle, Segmented } from '../_components/ui/Bits';
import Sheet from '../_components/ui/Sheet';
import { ConfirmDialog } from '../_components/ui/Dialog';
import { Menu, MenuItem, MenuSeparator } from '../_components/ui/Menu';
import { relativeSubmitted } from '../bookings/bookingFormat';

type Seg = 'inbox' | 'replied' | 'archived' | 'all';
const segOf = (m: ContactMessage): Exclude<Seg, 'all'> => (m.status === 'archived' ? 'archived' : m.status === 'replied' ? 'replied' : 'inbox');

export default function MessagesWorkspace() {
  const { t, lang, fmt } = useAdminT();
  const { toast } = useToast();
  const { refresh: refreshCounts } = useAdminCounts();
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<Seg>('inbox');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const r = await getMessagesAdmin();
    setError(r.success ? null : r.error || 'load failed');
    setItems(r.data);
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { inbox: 0, replied: 0, archived: 0, all: items.length };
    for (const m of items) c[segOf(m)] += 1;
    return c;
  }, [items]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((m) => (segment === 'all' || segOf(m) === segment) && (!q || [m.name, m.email, m.phone, m.message].some((v) => (v || '').toLowerCase().includes(q))));
  }, [items, segment, query]);

  const open = openId ? items.find((m) => m.id === openId) ?? null : null;
  const openMessage = (m: ContactMessage) => {
    setOpenId(m.id);
    setNotes(m.notes || '');
    if (!m.read) {
      setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
      void setMessagesRead([m.id], true).then(() => refreshCounts());
    }
  };
  const afterChange = async () => {
    await load();
    void refreshCounts();
  };
  const setStatus = async (id: string, status: 'new' | 'replied' | 'archived') => {
    const r = await setMessagesStatus([id], status);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    toast({ title: t.toastUpdated });
    await afterChange();
  };
  const trash = async (id: string) => {
    setOpenId(null);
    setItems((prev) => prev.filter((m) => m.id !== id));
    const r = await trashMessages([id]);
    if (!r.success) {
      toast({ title: t.toastError, description: r.error, tone: 'error' });
      return load();
    }
    void refreshCounts();
    toast({ title: t.messageDeleted, duration: 10000, action: { label: t.undo, onClick: async () => { await restoreMessages([id]); await afterChange(); } } });
  };
  const onNotes = (v: string) => {
    setNotes(v);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => open && void saveMessageNotes(open.id, v), 800);
  };

  const phone = open?.phone ? normalizePhone(open.phone) || open.phone : null;
  const replyBody = open ? (lang === 'uk' ? `Вітаю, ${open.name.split(' ')[0]}! Це Яніна зі Skin Beauty щодо вашого повідомлення. ` : `Hi ${open.name.split(' ')[0]}! This is Yanina from Skin Beauty about your message. `) : '';

  return (
    <AdminShell
      active="messages"
      title={t.messagesTitle}
      subtitle={t.messagesIntro}
      maxWidth="max-w-4xl"
      actions={
        <div className="flex w-full items-center justify-end">
          <Button variant="outline" size="icon-lg" className="h-11 w-11 rounded-full" onClick={() => void load()} aria-label={t.refresh} disabled={loading}><RefreshCw className={loading ? 'animate-spin' : ''} /></Button>
        </div>
      }
    >
      {loading ? (
        <CardSkeleton count={4} lines={2} />
      ) : error ? (
        <ErrorState body={error} onRetry={() => void load()} />
      ) : (
        <>
          <div className="mb-3">
            <Segmented value={segment} onChange={setSegment} ariaLabel={t.messagesTitle} options={[{ value: 'inbox', label: t.segInbox, count: counts.inbox }, { value: 'replied', label: t.segReplied, count: counts.replied }, { value: 'archived', label: t.segArchived, count: counts.archived }, { value: 'all', label: t.segAll, count: counts.all }]} />
          </div>
          <SearchInput value={query} onChange={setQuery} placeholder={t.search} className="mb-4" />
          {list.length === 0 ? (
            <EmptyState icon={<MessageSquare />} title={t.emptyMessages} body={t.emptyMessagesBody} />
          ) : (
            <ul className="space-y-2.5">
              {list.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => openMessage(m)} className={`flex w-full flex-col gap-1 rounded-2xl border border-border bg-card px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${!m.read ? 'shadow-[inset_3px_0_0_0_var(--accent)]' : ''}`}>
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-[15px] ${!m.read ? 'font-semibold' : 'font-medium'}`}>{m.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{relativeSubmitted(m.created_at, lang)}</span>
                    </span>
                    <span className="line-clamp-2 text-sm text-muted-foreground">{m.message}</span>
                    <span className="flex gap-1.5">
                      {segOf(m) === 'replied' && <Chip tone="success" icon={<Check />}>{t.msgReplied}</Chip>}
                      {segOf(m) === 'archived' && <Chip tone="outline">{t.msgArchived}</Chip>}
                      {!m.read && <Chip tone="accent">{t.msgNew}</Chip>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Sheet
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open?.name}
        subtitle={open ? formatDateTime(new Date(open.created_at), lang) : undefined}
        footer={
          open && (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 flex-wrap gap-2">
                {open.email && (
                  <Button asChild className="h-11 flex-1 rounded-full md:flex-none">
                    <a href={mailtoHref(open.email, 'Skin Beauty', replyBody)} onClick={() => void setStatus(open.id, 'replied')}><Mail /> {t.replyByEmail}</a>
                  </Button>
                )}
                {phone && (
                  <Button asChild variant={open.email ? 'outline' : 'default'} className="h-11 flex-1 rounded-full md:flex-none">
                    <a href={smsHref(phone, replyBody)} onClick={() => void setStatus(open.id, 'replied')}><MessageSquareText /> {t.replyByText}</a>
                  </Button>
                )}
              </div>
              <Menu label={t.actMore} trigger={<Button variant="outline" size="icon-lg" aria-label={t.actMore} className="h-11 w-11 rounded-full"><MoreHorizontal /></Button>}>
                {segOf(open) !== 'replied' && <MenuItem icon={<Check />} onSelect={() => void setStatus(open.id, 'replied')}>{t.markReplied}</MenuItem>}
                {segOf(open) !== 'archived' ? <MenuItem icon={<Archive />} onSelect={() => void setStatus(open.id, 'archived')}>{t.actArchive}</MenuItem> : <MenuItem icon={<Archive />} onSelect={() => void setStatus(open.id, 'new')}>{t.actReopen}</MenuItem>}
                <MenuItem icon={<Mail />} onSelect={() => { setItems((prev) => prev.map((x) => (x.id === open.id ? { ...x, read: false } : x))); void setMessagesRead([open.id], false).then(() => refreshCounts()); setOpenId(null); }}>{t.actMarkUnread}</MenuItem>
                <MenuSeparator />
                <MenuItem icon={<Trash2 />} danger onSelect={() => setConfirmDelete(true)}>{t.actDelete}</MenuItem>
              </Menu>
            </div>
          )
        }
      >
        {open && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-border">
              {phone && (
                <div className="flex items-center gap-2 px-3 py-1">
                  <Phone className="size-4 text-muted-foreground" aria-hidden />
                  <a href={telHref(phone)} className="flex-1 text-sm underline-offset-4 hover:underline">{formatPhone(phone)}</a>
                  <CopyButton text={formatPhone(phone)} label={t.phone} />
                </div>
              )}
              {open.email && (
                <div className="flex items-center gap-2 border-t border-border px-3 py-1">
                  <Mail className="size-4 text-muted-foreground" aria-hidden />
                  <span className="flex-1 truncate text-sm">{open.email}</span>
                  <CopyButton text={open.email} label={t.email} />
                </div>
              )}
            </section>
            <section>
              <SectionTitle>{t.clientMessage}</SectionTitle>
              <p className="whitespace-pre-wrap rounded-xl border-l-4 border-accent bg-accent/10 px-3 py-2 text-[15px] leading-relaxed">{open.message}</p>
            </section>
            <section>
              <SectionTitle>{t.privateNotes}</SectionTitle>
              <Textarea value={notes} onChange={(e) => onNotes(e.target.value)} rows={3} placeholder={t.notesPlaceholder} aria-label={t.privateNotes} />
            </section>
          </div>
        )}
      </Sheet>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={() => { setConfirmDelete(false); if (open) void trash(open.id); }} title={t.deleteTitle} body={t.deleteBody} confirmLabel={t.actDelete} danger />
      <span className="sr-only">{fmt(t.selectedCount, { n: 0 })}</span>
    </AdminShell>
  );
}
