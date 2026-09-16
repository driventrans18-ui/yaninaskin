'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, MessageSquareQuote, RefreshCw, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { getReviewsAdmin, restoreReviews, trashReviews, type AdminReview } from '../../actions/reviews';
import { getBookings } from '../../actions/bookings';
import { getBookingSettings } from '../../actions/settings';
import type { Booking, ServiceLite } from '@/lib/booking/types';
import { formatDate } from '@/lib/tz';
import AdminShell from '../_components/AdminShell';
import { useAdminT } from '../_components/AdminLang';
import { useAdminCounts } from '../_components/AdminCounts';
import { useToast } from '../_components/ui/Toast';
import { CardSkeleton, Chip, EmptyState, ErrorState, Segmented } from '../_components/ui/Bits';
import ReviewDrawer from './ReviewDrawer';

export type ReviewState = 'pending' | 'published' | 'hidden';
export const reviewState = (r: AdminReview): ReviewState => (r.hidden ? 'hidden' : r.approved ? 'published' : 'pending');

export function Stars({ n, className = 'size-4' }: { n: number; className?: string }) {
  const { t, fmt } = useAdminT();
  return (
    <span className="inline-flex text-accent-foreground/80" role="img" aria-label={fmt(t.starsN, { n })}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < n ? 'fill-accent text-accent' : 'text-border'}`} aria-hidden />
      ))}
    </span>
  );
}

export function ReviewStateChip({ state }: { state: ReviewState }) {
  const { t } = useAdminT();
  return (
    <Chip tone={state === 'published' ? 'dark' : state === 'pending' ? 'accent' : 'muted'}>
      {state === 'published' ? t.statusPublished : state === 'pending' ? t.statusPending : t.statusHidden}
    </Chip>
  );
}

type Segment = ReviewState | 'all';

export default function ReviewsWorkspace() {
  const { t, lang, fmt } = useAdminT();
  const { toast } = useToast();
  const { refresh: refreshCounts } = useAdminCounts();
  const router = useRouter();
  const params = useSearchParams();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [featured, setFeatured] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceLite[]>([]);
  const [requireApproval, setRequireApproval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<Segment>('pending');
  const [rating, setRating] = useState<number | 0>(0);
  const [sort, setSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [r, b, s] = await Promise.all([getReviewsAdmin(), getBookings(), getBookingSettings()]);
      if (!r.success) throw new Error(r.error || 'load failed');
      setReviews(r.data);
      setFeatured(r.featured);
      setBookings(b.data);
      setServices(s.services);
      setRequireApproval(s.data.requireReviewApproval);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (loading) return;
    const id = Number(params.get('open'));
    if (id && reviews.some((r) => r.id === id)) {
      setSegment('all');
      setOpenId(id);
      router.replace('/admin/reviews');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Default to Published when nothing is pending, so the tab isn't empty.
  useEffect(() => {
    if (!loading && segment === 'pending' && !reviews.some((r) => reviewState(r) === 'pending')) setSegment('published');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const counts = useMemo(() => {
    const c = { pending: 0, published: 0, hidden: 0, all: reviews.length };
    for (const r of reviews) c[reviewState(r)] += 1;
    return c;
  }, [reviews]);
  const published = reviews.filter((r) => reviewState(r) === 'published');
  const avg = published.length ? published.reduce((s, r) => s + r.rating, 0) / published.length : 0;

  const list = useMemo(() => {
    const l = reviews.filter((r) => (segment === 'all' || reviewState(r) === segment) && (!rating || r.rating === rating));
    l.sort((a, b) => {
      if (sort === 'highest') return b.rating - a.rating || +new Date(b.created_at) - +new Date(a.created_at);
      if (sort === 'lowest') return a.rating - b.rating || +new Date(b.created_at) - +new Date(a.created_at);
      if (sort === 'oldest') return +new Date(a.created_at) - +new Date(b.created_at);
      return +new Date(b.created_at) - +new Date(a.created_at);
    });
    return l;
  }, [reviews, segment, rating, sort]);

  const open = openId ? reviews.find((r) => r.id === openId) ?? null : null;

  const afterChange = useCallback(async () => {
    await load();
    void refreshCounts();
  }, [load, refreshCounts]);

  const trash = async (id: number) => {
    setOpenId(null);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    const r = await trashReviews([id]);
    if (!r.success) {
      toast({ title: t.toastError, description: r.error, tone: 'error' });
      await load();
      return;
    }
    void refreshCounts();
    toast({
      title: t.reviewDeleted,
      duration: 10000,
      action: { label: t.undo, onClick: async () => { await restoreReviews([id]); await afterChange(); toast({ title: t.restoredToast }); } },
    });
  };

  return (
    <AdminShell
      active="reviews"
      title={t.reviewsTitle}
      subtitle={t.reviewsIntro}
      maxWidth="max-w-5xl"
      actions={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-serif text-3xl leading-none">{avg ? avg.toFixed(1) : '–'}</span>
            <div>
              <Stars n={Math.round(avg)} />
              <p className="text-xs text-muted-foreground">
                {t.avgRating} · {fmt(t.totalReviews, { n: published.length })}
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon-lg" className="h-11 w-11 rounded-full" onClick={() => void load()} aria-label={t.refresh} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      }
    >
      {loading ? (
        <CardSkeleton count={4} />
      ) : error ? (
        <ErrorState body={error} onRetry={() => void load()} />
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground">{requireApproval ? t.moderationOn : t.moderationOff}</p>
          <div className="mb-3">
            <Segmented
              value={segment}
              onChange={setSegment}
              ariaLabel={t.reviewsTitle}
              options={[
                { value: 'pending', label: t.segPending, count: counts.pending },
                { value: 'published', label: t.segPublished, count: counts.published },
                { value: 'hidden', label: t.segHidden, count: counts.hidden },
                { value: 'all', label: t.segAll, count: counts.all },
              ]}
            />
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <Select value={rating} onChange={(e) => setRating(Number(e.target.value))} aria-label={t.filterRating} className="h-11 rounded-full text-sm">
              <option value={0}>{t.anyRating}</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {fmt(t.starsN, { n })}
                </option>
              ))}
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label={t.sortLabel} className="h-11 rounded-full text-sm">
              <option value="newest">{t.sortNewest}</option>
              <option value="oldest">{t.sortOldest}</option>
              <option value="highest">{t.sortHighest}</option>
              <option value="lowest">{t.sortLowest}</option>
            </Select>
            <span className="ml-auto self-center text-xs text-muted-foreground">
              <Pin className="mr-1 inline size-3.5" aria-hidden />
              {t.featuredChip}: {featured.length}/6
            </span>
          </div>

          {list.length === 0 ? (
            segment === 'pending' ? (
              <EmptyState icon={<MessageSquareQuote />} title={t.emptyPendingReviews} body={t.emptyPendingReviewsBody} />
            ) : (
              <EmptyState icon={<MessageSquareQuote />} title={t.emptyReviews} body={t.emptyReviewsBody} />
            )
          ) : (
            <div className="space-y-2.5">
              {list.map((r) => {
                const state = reviewState(r);
                const isFeatured = featured.includes(`review:${r.id}`);
                const imgs = r.photos?.length ? r.photos : r.photo_url ? [r.photo_url] : [];
                return (
                  <article key={r.id} className={`rounded-2xl border bg-card ${isFeatured ? 'border-accent' : 'border-border'}`}>
                    <button
                      type="button"
                      onClick={() => setOpenId(r.id)}
                      className="flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-serif text-sm text-secondary-foreground">{r.name.slice(0, 2).toUpperCase()}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[15px] font-medium">{r.name}</span>
                          <Stars n={r.rating} className="size-3.5" />
                          <span className="text-xs text-muted-foreground">{formatDate(new Date(r.created_at), lang, undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                        <span className="mt-1 line-clamp-2 block text-sm text-foreground/90">{r.comment}</span>
                        <span className="mt-1.5 flex flex-wrap gap-1.5">
                          <ReviewStateChip state={state} />
                          {isFeatured && <Chip tone="accent" icon={<Pin />}>{t.featuredChip}</Chip>}
                          {r.service && <Chip tone="outline">{r.service}</Chip>}
                          {imgs.length > 0 && <Chip tone="outline">📷 {imgs.length}</Chip>}
                          {r.reply_text && <Chip tone="outline">↩︎ {t.reply.replace('+ ', '')}</Chip>}
                        </span>
                      </span>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      <ReviewDrawer
        review={open}
        featured={featured}
        bookings={bookings}
        services={services}
        onClose={() => setOpenId(null)}
        onChanged={afterChange}
        onTrash={trash}
        onFeaturedChange={setFeatured}
      />
    </AdminShell>
  );
}
