'use client';

import React, { useState, useEffect } from 'react';

const EMOJIS = [
  { val: 1, emoji: '😔', label: 'Terrible' },
  { val: 2, emoji: '😕', label: 'Poor' },
  { val: 3, emoji: '😐', label: 'Okay' },
  { val: 4, emoji: '🙂', label: 'Good' },
  { val: 5, emoji: '😍', label: 'Amazing' },
];

type Review = {
  id: number;
  name: string;
  rating: number;
  text: string;
  avatar: string | null;
  date: string;
};

export default function ReviewForm() {
  const [name, setName]         = useState('');
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [text, setText]         = useState('');
  const [avatar, setAvatar]     = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showAll, setShowAll]   = useState(false);
  const [sortBy, setSortBy]     = useState('newest');
  const [reviews, setReviews]   = useState<Review[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('yaninaskin-reviews');
    if (stored) setReviews(JSON.parse(stored));
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!name.trim() || !rating || !text.trim()) return;
    const review: Review = {
      id: Date.now(),
      name: name.trim(),
      rating,
      text: text.trim(),
      avatar,
      date: new Date().toISOString(),
    };
    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem('yaninaskin-reviews', JSON.stringify(updated));
    setSubmitted(true);
    setName(''); setRating(0); setText(''); setAvatar(null);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const active = hovered || rating;

  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === 'newest')  return b.id - a.id;
    if (sortBy === 'oldest')  return a.id - b.id;
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest')  return a.rating - b.rating;
    return 0;
  });

  return (
    <section id="reviews" className="px-6 py-24 scroll-mt-20" style={{ background: 'hsl(24 10% 10%)', color: '#fff' }}>
      <div className="mx-auto max-w-5xl">

        {/* Heading */}
        <div className="text-center mb-12">
          <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: 'hsl(14 30% 74%)' }}>
            Client Reviews
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            Leave a <em>Review</em>
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Had a visit with Dr. Menaker? We&apos;d love to hear about your experience.
          </p>
        </div>

        {/* Form card */}
        <div className="max-w-lg mx-auto rounded-2xl p-8" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-sm font-medium mb-1">Share Your Experience</p>
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Your review helps others discover Dr. Yanina Menaker.
          </p>

          {/* Avatar upload */}
          <div className="flex items-center gap-4 mb-5">
            <label className="cursor-pointer flex-shrink-0">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xs text-center leading-tight overflow-hidden"
                style={{ border: '1.5px dashed rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.04)' }}
              >
                {avatar
                  ? <img src={avatar} alt="preview" className="w-full h-full object-cover rounded-full" />
                  : <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6rem' }}>+ Photo</span>
                }
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
            <div>
              <p className="text-xs font-medium mb-0.5">Profile Photo</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Optional · appears with your review</p>
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.5rem' }}>
              Your Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sofia M."
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontFamily: 'inherit' }}
            />
          </div>

          {/* Emoji rating */}
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.5rem' }}>
              Rating
            </label>
            <div className="flex gap-3 mb-2">
              {EMOJIS.map(e => (
                <button
                  key={e.val}
                  type="button"
                  onClick={() => setRating(e.val)}
                  onMouseEnter={() => setHovered(e.val)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-2xl transition-all duration-150 select-none"
                  style={{
                    opacity: active === 0 ? 0.4 : e.val <= active ? 1 : 0.25,
                    transform: e.val === active ? 'scale(1.3)' : 'scale(1)',
                  }}
                  aria-label={e.label}
                >
                  {e.emoji}
                </button>
              ))}
            </div>
            <p className="text-xs h-4 transition-all" style={{ color: 'hsl(14 30% 74%)' }}>
              {active > 0 ? EMOJIS[active - 1].label : ''}
            </p>
          </div>

          {/* Review text */}
          <div className="mb-5">
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.5rem' }}>
              Your Review
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontFamily: 'inherit' }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            disabled={!name.trim() || !rating || !text.trim()}
            className="w-full rounded-full py-3 text-xs uppercase tracking-widest font-medium transition-opacity disabled:opacity-30"
            style={{ background: 'hsl(14 30% 74%)', color: 'hsl(24 10% 10%)' }}
          >
            Submit Review
          </button>

          {submitted && (
            <p className="text-center mt-4 text-sm" style={{ color: 'hsl(14 30% 74%)' }}>
              Thank you! ✦
            </p>
          )}
        </div>

        {/* Read All Reviews toggle */}
        <div className="max-w-lg mx-auto mt-6">
          <button
            onClick={() => setShowAll(v => !v)}
            className="w-full py-3 text-xs uppercase tracking-widest transition-all rounded-full"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}
          >
            {showAll ? 'Hide Reviews' : 'Read All Reviews'}
          </button>

          {showAll && (
            <div className="mt-4">
              {/* Sort header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-xs rounded-lg px-3 py-1.5 outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
              </div>

              {/* Review list */}
              {sorted.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Be the first to leave a review ✦
                </p>
              ) : (
                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                  {sorted.map(r => (
                    <div key={r.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden flex-shrink-0"
                          style={{ background: 'hsl(14 30% 30%)' }}
                        >
                          {r.avatar
                            ? <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" />
                            : r.name.slice(0, 2).toUpperCase()
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{r.name}</p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <span className="text-sm">{EMOJIS[r.rating - 1]?.emoji}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
