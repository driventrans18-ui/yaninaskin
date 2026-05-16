'use client';

import { useState, useEffect } from 'react';
import { getAllReviews, approveReview, deleteReview, addReply } from '../../actions/reviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
    if (confirm('Are you sure you want to delete this review?')) {
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Admin Panel</h1>
            <div className="flex flex-wrap gap-4">
              <a href="/admin/reviews" className="text-sm font-medium px-3 py-1 bg-slate-900 text-white rounded">Reviews</a>
              <a href="/admin/services" className="text-sm font-medium px-3 py-1 text-slate-600 hover:text-slate-900">Services</a>
              <a href="/admin/about" className="text-sm font-medium px-3 py-1 text-slate-600 hover:text-slate-900">Bio</a>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition"
            >
              ← Back to Website
            </a>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Info message */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ Auto-posting enabled:</strong> Reviews are published immediately. You can delete or reply to reviews below.
          </p>
        </div>

        {/* Reviews list */}
        {isLoading ? (
          <p className="text-slate-600">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-slate-600">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div
                key={review.id}
                className="bg-white border-l-4 border-green-500 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold">
                      {review.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{review.name}</p>
                      <div className="flex gap-0.5 text-yellow-500 mt-1">
                        {[1, 2, 3, 4, 5].map(val => (
                          <StarIcon key={val} filled={val <= review.rating} className="w-4 h-4" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-green-600">
                      Published
                    </p>
                  </div>
                </div>

                <p className="text-slate-700 mb-4">{review.comment}</p>
                <p className="text-xs text-slate-500 mb-4">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>

                {/* Reply section */}
                {review.reply_text && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Response from {review.reply_by}
                    </p>
                    <p className="text-slate-700">{review.reply_text}</p>
                  </div>
                )}

                {/* Reply form */}
                {replyingTo === review.id ? (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                    <Textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write your response..."
                      rows={3}
                      className="mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(review.id)}
                        disabled={!replyText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        Send Response
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700 mb-4"
                  >
                    + Reply
                  </button>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
