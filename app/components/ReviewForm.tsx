'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

type Review = {
  id: number;
  name: string;
  rating: number;
  text: string;
  avatar: string | null;
  date: string;
};

export default function ReviewForm() {
  const { lang } = useLanguage();
  const tr = t[lang].reviews;

  const EMOJIS = tr.emojiLabels.map((label, i) => ({ val: i + 1, emoji: ['😔','😕','😐','🙂','😍'][i], label }));

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
            {tr.eyebrow}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">
            {tr.heading} <em>{tr.headingEm}</em>
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {tr.subheading}
          </p>
        </div>

        {/* Form card */}
        <div className="max-w-lg mx-auto rounded-2xl p-8" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-sm font-medium mb-1">{tr.formTitle}</p>
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {tr.formSubtitle}
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
                  : <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6rem' }}>{tr.photoUpload}</span>
                }
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
            <div>
              <p className="text-xs font-medium mb-0.5">{tr.photoLabel}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{tr.photoHint}</p>
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.5rem' }}>
              {tr.nameLabel}
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={tr.namePlaceholder}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontFamily: 'inherit' }}
            />
          </div>

          {/* Emoji rating */}
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.5rem' }}>
              {tr.ratingLabel}
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
              {tr.reviewLabel}
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={tr.reviewPlaceholder}
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
            {tr.submit}
          </button>

          {submitted && (
            <p className="text-center mt-4 text-sm" style={{ color: 'hsl(14 30% 74%)' }}>
              {tr.thankYou}
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
            {showAll ? tr.hideAll : tr.showAll}
          </button>

          {showAll && (
            <div className="mt-4">
              {/* Sort header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {tr.reviewCount(reviews.length)}
                </span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-xs rounded-lg px-3 py-1.5 outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
                >
                  <option value="newest">{tr.sortNewest}</option>
                  <option value="oldest">{tr.sortOldest}</option>
                  <option value="highest">{tr.sortHighest}</option>
                  <option value="lowest">{tr.sortLowest}</option>
                </select>
              </div>

              {/* Review list */}
              {sorted.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {tr.firstReview}
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
                            {new Date(r.date).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'uk' ? 'uk-UA' : 'es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
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
