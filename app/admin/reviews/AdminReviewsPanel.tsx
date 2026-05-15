'use client';

import { useState, useEffect } from 'react';
import { getAllReviews, approveReview, deleteReview, addReply } from '../../actions/reviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Review = {
  id: number;
  name: string;
  email: string;
  rating: number;
  comment: string;
  approved: boolean;
  reply_text: string | null;
  reply_by: string | null;
  created_at: string;
};

const RATING_EMOJI = ['😔', '😕', '😐', '🙂', '😍'];

export default function AdminReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

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

  const handleApprove = async (id: number) => {
    await approveReview(id);
    await loadReviews();
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

  const filteredReviews = reviews.filter(r => {
    if (filter === 'pending') return !r.approved;
    if (filter === 'approved') return r.approved;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reviews Management</h1>
          <p className="text-slate-600">Manage and respond to customer reviews</p>
        </div>

        {/* Filter buttons */}
        <div className="mb-6 flex gap-2">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-2 text-sm">
                {f === 'all' && `(${reviews.length})`}
                {f === 'pending' && `(${reviews.filter(r => !r.approved).length})`}
                {f === 'approved' && `(${reviews.filter(r => r.approved).length})`}
              </span>
            </button>
          ))}
        </div>

        {/* Reviews list */}
        {isLoading ? (
          <p className="text-slate-600">Loading reviews...</p>
        ) : filteredReviews.length === 0 ? (
          <p className="text-slate-600">No reviews to display</p>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map(review => (
              <div
                key={review.id}
                className={`bg-white border-l-4 rounded-lg p-6 ${
                  review.approved ? 'border-green-500' : 'border-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold">
                      {review.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{review.name}</p>
                      <p className="text-xs text-slate-500">{review.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl">{RATING_EMOJI[review.rating - 1]}</p>
                    <p className={`text-xs font-semibold ${
                      review.approved ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {review.approved ? 'Approved' : 'Pending'}
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
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
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
