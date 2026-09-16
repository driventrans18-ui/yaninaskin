'use client';

import { useMemo, useState } from 'react';
import { Check, EyeOff, Eye, MoreHorizontal, Pin, PinOff, Trash2, Mail, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { addReply, deleteReviewPhoto, setFeaturedReviews, setReviewService, setReviewVisibility, type AdminReview } from '../../actions/reviews';
import type { Booking, ServiceLite } from '@/lib/booking/types';
import { buildClients } from '@/lib/booking/clients';
import { formatPhone } from '@/lib/phone';
import { smsHref, mailtoHref } from '@/lib/booking/templates';
import { formatDateTime } from '@/lib/tz';
import ImageLightbox from '../../components/ImageLightbox';
import { useAdminT } from '../_components/AdminLang';
import { useToast } from '../_components/ui/Toast';
import Sheet from '../_components/ui/Sheet';
import { ConfirmDialog } from '../_components/ui/Dialog';
import { Menu, MenuItem, MenuSeparator } from '../_components/ui/Menu';
import { Chip, SectionTitle } from '../_components/ui/Bits';
import { Stars, ReviewStateChip, reviewState } from './ReviewsWorkspace';

export default function ReviewDrawer({
  review,
  featured,
  bookings,
  services,
  onClose,
  onChanged,
  onTrash,
  onFeaturedChange,
}: {
  review: AdminReview | null;
  featured: string[];
  bookings: Booking[];
  services: ServiceLite[];
  onClose: () => void;
  onChanged: () => Promise<void>;
  onTrash: (id: number) => void;
  onFeaturedChange: (ids: string[]) => void;
}) {
  const { t, lang } = useAdminT();
  const { toast } = useToast();
  // Draft reply is keyed by review id so switching reviews resets it without
  // an effect.
  const [draft, setDraft] = useState<{ id: number; text: string } | null>(null);
  const reply = draft && draft.id === review?.id ? draft.text : review?.reply_text || '';
  const setReply = (text: string) => review && setDraft({ id: review.id, text });
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Match the reviewer to a client: email first, then exact name.
  const client = useMemo(() => {
    if (!review) return null;
    const clients = buildClients(bookings);
    const seen = new Set<string>();
    const list = [...clients.values()].filter((c) => (seen.has(c.key) ? false : (seen.add(c.key), true)));
    const email = review.email?.trim().toLowerCase();
    if (email) {
      const byEmail = list.find((c) => c.email === email);
      if (byEmail) return byEmail;
    }
    const name = review.name.trim().toLowerCase();
    return list.find((c) => c.name.trim().toLowerCase() === name) ?? null;
  }, [review, bookings]);

  if (!review) return null;
  const state = reviewState(review);
  const key = `review:${review.id}`;
  const isFeatured = featured.includes(key);
  const imgs = review.photos?.length ? review.photos : review.photo_url ? [review.photo_url] : [];

  const run = async (fn: () => Promise<{ success: boolean; error?: string }>, ok: string) => {
    setBusy(true);
    const r = await fn();
    setBusy(false);
    if (!r.success) return toast({ title: t.toastError, description: r.error, tone: 'error' });
    toast({ title: ok });
    await onChanged();
  };

  const toggleFeatured = async () => {
    if (!isFeatured && featured.length >= 6) return toast({ title: t.featuredLimit, tone: 'error' });
    const next = isFeatured ? featured.filter((x) => x !== key) : [...featured, key];
    onFeaturedChange(next);
    const r = await setFeaturedReviews(next);
    if (!r.success) {
      onFeaturedChange(featured);
      toast({ title: t.toastError, tone: 'error' });
    } else toast({ title: t.toastUpdated });
  };

  return (
    <>
      <Sheet
        open={Boolean(review)}
        onClose={onClose}
        title={review.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Stars n={review.rating} />
            <ReviewStateChip state={state} />
            {isFeatured && <Chip tone="accent" icon={<Pin />}>{t.featuredChip}</Chip>}
          </span>
        }
        footer={
          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-wrap gap-2">
              {state !== 'published' && (
                <Button className="h-11 flex-1 rounded-full md:flex-none" disabled={busy} onClick={() => void run(() => setReviewVisibility(review.id, 'published'), t.toastUpdated)}>
                  <Check /> {t.actPublish}
                </Button>
              )}
              {state === 'published' && (
                <Button variant="outline" className="h-11 flex-1 rounded-full md:flex-none" disabled={busy} onClick={() => void run(() => setReviewVisibility(review.id, 'hidden'), t.toastUpdated)}>
                  <EyeOff /> {t.actHide}
                </Button>
              )}
              {state === 'hidden' && (
                <Button variant="outline" className="h-11 flex-1 rounded-full md:flex-none" disabled={busy} onClick={() => void run(() => setReviewVisibility(review.id, 'published'), t.toastUpdated)}>
                  <Eye /> {t.actUnhide}
                </Button>
              )}
              {state === 'published' && (
                <Button variant={isFeatured ? 'accent' : 'outline'} className="h-11 flex-1 rounded-full md:flex-none" disabled={busy} onClick={() => void toggleFeatured()}>
                  {isFeatured ? <PinOff /> : <Pin />} {isFeatured ? t.actUnfeature : t.actFeature}
                </Button>
              )}
            </div>
            <Menu
              label={t.actMore}
              trigger={
                <Button variant="outline" size="icon-lg" aria-label={t.actMore} className="h-11 w-11 rounded-full">
                  <MoreHorizontal />
                </Button>
              }
            >
              {state === 'published' && (
                <MenuItem icon={<EyeOff />} onSelect={() => void run(() => setReviewVisibility(review.id, 'pending'), t.toastUpdated)}>
                  {t.statusPending}
                </MenuItem>
              )}
              <MenuSeparator />
              <MenuItem icon={<Trash2 />} danger onSelect={() => setConfirmDelete(true)}>
                {t.actDelete}
              </MenuItem>
            </Menu>
          </div>
        }
      >
        <div className="space-y-6">
          <section>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{review.comment}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDateTime(new Date(review.created_at), lang)}
              {typeof review.likes === 'number' && review.likes > 0 ? ` · ♥ ${review.likes}` : ''}
            </p>
          </section>

          {imgs.length > 0 && (
            <section>
              <SectionTitle>{t.reviewPhotos}</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {imgs.map((url) => (
                  <div key={url} className="relative">
                    <button type="button" onClick={() => setLightbox(url)} className="block overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="size-24 object-cover" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void run(() => deleteReviewPhoto(review.id, url), t.toastUpdated)}
                      aria-label={t.delete}
                      className="absolute -right-1.5 -top-1.5 flex size-7 items-center justify-center rounded-full bg-foreground text-xs text-background shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionTitle>{t.reviewService}</SectionTitle>
            <Select value={review.service || ''} onChange={(e) => void run(() => setReviewService(review.id, e.target.value || null), t.toastUpdated)} className="h-11 w-full text-sm" aria-label={t.reviewService}>
              <option value="">{t.setService}</option>
              {services.map((s) => (
                <option key={s.id} value={s.title}>
                  {s.title}
                </option>
              ))}
              {review.service && !services.some((s) => s.title === review.service) && <option value={review.service}>{review.service}</option>}
            </Select>
          </section>

          <section>
            <SectionTitle>{t.matchedClient}</SectionTitle>
            {client ? (
              <div className="rounded-xl border border-border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{client.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {t.visitsCount.replace('{n}', String(client.visits))} · {t.requestsCount.replace('{n}', String(client.requests))}
                  </span>
                </div>
                <div className="mt-1 text-muted-foreground">{client.phone ? formatPhone(client.phone) : client.email || ''}</div>
                <div className="mt-2 flex gap-2">
                  {client.phone && (
                    <Button asChild size="sm" variant="outline" className="h-10 rounded-full">
                      <a href={smsHref(client.phone, '')}>
                        <MessageSquareText /> {t.actionText}
                      </a>
                    </Button>
                  )}
                  {client.email && (
                    <Button asChild size="sm" variant="outline" className="h-10 rounded-full">
                      <a href={mailtoHref(client.email, '', '')}>
                        <Mail /> {t.actionEmail}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.noMatchedClient}</p>
            )}
          </section>

          <section>
            <SectionTitle>{t.replyPublicly}</SectionTitle>
            <Textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder={t.replyPlaceholderNew} aria-label={t.replyPublicly} />
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">{t.replyHint}</p>
              <Button size="sm" className="h-10 rounded-full" disabled={busy || reply.trim() === (review.reply_text || '')} onClick={() => void run(() => addReply(review.id, reply.trim(), 'Yanina'), t.replySaved)}>
                {t.save}
              </Button>
            </div>
          </section>
        </div>
      </Sheet>

      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={() => { setConfirmDelete(false); onTrash(review.id); }} title={t.deleteTitle} body={t.deleteBody} confirmLabel={t.actDelete} danger />
      {lightbox && <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}
