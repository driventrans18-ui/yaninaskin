'use client';

import { useState, useEffect } from 'react';
import { getAllReviews, approveReview, deleteReview, addReply } from '../../actions/reviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminShell from '../_components/AdminShell';
import StatusBanner from '../_components/StatusBanner';
import { useAdminT } from '../_components/AdminLang';

type Review = {
  id: number;
  name: string;
  email: string | null;
  rating: number;
  comment: string;
  approved: boolean;
  reply_text: string | null;
  reply_by: string | null;
  created_at: string;
};

const StarIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    />
  </svg>
);

export default function AdminReviewsPanel({ onLogout }: { onLogout: () => void }) {
  const { t } = useAdminT();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    const result = await getAllReviews();
    if (result.success) {
      setReviews(result.data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t.confirmDeleteReview)) {
      await deleteReview(id);
      await loadReviews();
    }
  };

  const handleReply = async (id: number) => {
    if (!replyText.trim()) return;
    await addReply(id, replyText.trim(), 'Admin');
    setReplyText('');
    setReplyingTo(null);
    await loadReviews();
  };

  return (
    <AdminShell active="reviews" onLogout={onLogout} maxWidth="max-w-5xl">
      <StatusBanner tone="info" message={t.reviewsInfo} />

      {isLoading ? (
        <p className="text-muted-foreground">{t.loadingReviews}</p>
      ) : reviews.length === 0 ? (
        <Card className="p-10 text-center">
          <h2 className="text-xl mb-1">{t.noReviewsTitle}</h2>
          <p className="text-muted-foreground">{t.noReviewsBody}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <Card key={review.id} className="border-l-4 border-accent p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold">
                    {review.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{review.name}</p>
                    <div className="flex gap-0.5 text-accent mt-1">
                      {[1, 2, 3, 4, 5].map(val => (
                        <StarIcon key={val} filled={val <= review.rating} className="w-4 h-4" />
                      ))}
                    </div>
                  </div>
                </div>
                <Badge variant="accent">{t.published}</Badge>
              </div>

              <p className="text-foreground mb-4">{review.comment}</p>
              <p className="text-xs text-muted-foreground mb-4">
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>

              {review.reply_text && (
                <div className="bg-muted border border-border rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    {t.responseFrom} {review.reply_by}
                  </p>
                  <p className="text-foreground">{review.reply_text}</p>
                </div>
              )}

              {replyingTo === review.id ? (
                <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-4">
                  <Textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={t.replyPlaceholder}
                    rows={3}
                    className="mb-3"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleReply(review.id)}
                      disabled={!replyText.trim()}
                    >
                      {t.sendResponse}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    >
                      {t.cancel}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  className="mb-4 px-0"
                  onClick={() => setReplyingTo(review.id)}
                >
                  {t.reply}
                </Button>
              )}

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(review.id)}
                >
                  {t.delete}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
