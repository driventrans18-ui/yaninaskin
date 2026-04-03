'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Review = {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
};

export default function ReviewForm() {
  const { lang } = useLanguage();
  const tr = t[lang].reviews;

  const EMOJIS = tr.emojiLabels.map((label, i) => ({ val: i + 1, emoji: ['😔','😕','😐','🙂','😍'][i], label }));

  const [showForm, setShowForm]   = useState(false);
  const [name, setName]           = useState('');
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [text, setText]           = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showAll, setShowAll]     = useState(false);
  const [sortBy, setSortBy]       = useState('newest');
  const [reviews, setReviews]     = useState<Review[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('yaninaskin-reviews');
    if (stored) setReviews(JSON.parse(stored));
  }, []);

  const submit = () => {
    if (!name.trim() || !rating || !text.trim()) return;
    const review: Review = {
      id: Date.now(),
      name: name.trim(),
      rating,
      text: text.trim(),
      date: new Date().toISOString(),
    };
    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem('yaninaskin-reviews', JSON.stringify(updated));
    setSubmitted(true);
    setName(''); setRating(0); setText('');
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 3000);
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
    <section id="reviews" className="px-6 py-24 scroll-mt-20 bg-[var(--surface-inverted)] text-[var(--surface-inverted-foreground)]">
      <div className="mx-auto max-w-5xl">

        {/* Heading */}
        <div className="text-center mb-10">
          <p className="eyebrow mb-3">{tr.eyebrow}</p>
          <h2 className="mb-4">
            {tr.heading} <em>{tr.headingEm}</em>
          </h2>
          <p className="text-sm mb-8 text-[var(--surface-inverted-muted)]">
            {tr.subheading}
          </p>

          {/* Toggle button */}
          <Button
            onClick={() => setShowForm(v => !v)}
            variant={showForm ? 'outline' : 'accent'}
            size="pill"
            className={cn(
              showForm && 'border-[var(--surface-inverted-border)] bg-[var(--surface-inverted-elevated)] text-[var(--surface-inverted-muted)] hover:bg-[var(--surface-inverted-elevated)] hover:text-[var(--surface-inverted-foreground)]'
            )}
          >
            {showForm ? tr.hideAll.replace('Reviews', 'Form') : tr.heading + ' ' + tr.headingEm}
            <span
              className="inline-block transition-transform duration-[var(--duration-normal)]"
              style={{ transform: showForm ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ↓
            </span>
          </Button>
        </div>

        {/* Collapsible form */}
        <div
          className="grid transition-all duration-[var(--duration-slow)]"
          style={{ gridTemplateRows: showForm ? '1fr' : '0fr', opacity: showForm ? 1 : 0 }}
        >
          <div className="overflow-hidden">
            <div className="max-w-lg mx-auto rounded-2xl p-8 mb-6 border border-[var(--surface-inverted-border)]">
              <p className="text-sm font-medium mb-1">{tr.formTitle}</p>
              <p className="text-xs mb-6 text-[var(--surface-inverted-subtle)]">
                {tr.formSubtitle}
              </p>

              {/* Name */}
              <div className="mb-4">
                <label className="block uppercase tracking-widest mb-2 text-[var(--surface-inverted-subtle)] text-[0.5rem]">
                  {tr.nameLabel}
                </label>
                <Input
                  variant="inverted"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={tr.namePlaceholder}
                />
              </div>

              {/* Emoji rating */}
              <div className="mb-4">
                <label className="block uppercase tracking-widest mb-3 text-[var(--surface-inverted-subtle)] text-[0.5rem]">
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
                      className={cn(
                        "text-2xl transition-all duration-[var(--duration-fast)] select-none",
                        active === 0 ? 'opacity-40' : e.val <= active ? 'opacity-100' : 'opacity-25',
                        e.val === active ? 'scale-130' : 'scale-100'
                      )}
                      aria-label={e.label}
                    >
                      {e.emoji}
                    </button>
                  ))}
                </div>
                <p className="text-xs h-4 transition-all text-accent">
                  {active > 0 ? EMOJIS[active - 1].label : ''}
                </p>
              </div>

              {/* Review text */}
              <div className="mb-5">
                <label className="block uppercase tracking-widest mb-2 text-[var(--surface-inverted-subtle)] text-[0.5rem]">
                  {tr.reviewLabel}
                </label>
                <Textarea
                  variant="inverted"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={tr.reviewPlaceholder}
                  rows={4}
                />
              </div>

              {/* Submit */}
              <Button
                onClick={submit}
                disabled={!name.trim() || !rating || !text.trim()}
                variant="accent"
                size="pill"
                className="w-full"
              >
                {tr.submit}
              </Button>

              {submitted && (
                <p className="text-center mt-4 text-sm text-accent">
                  {tr.thankYou}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Read All Reviews toggle */}
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setShowAll(v => !v)}
            className="w-full py-3 text-xs uppercase tracking-widest transition-all rounded-full border border-[var(--surface-inverted-border)] text-[var(--surface-inverted-muted)]"
          >
            {showAll ? tr.hideAll : tr.showAll}
          </button>

          {showAll && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[var(--surface-inverted-subtle)]">
                  {tr.reviewCount(reviews.length)}
                </span>
                <Select
                  variant="inverted"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="newest">{tr.sortNewest}</option>
                  <option value="oldest">{tr.sortOldest}</option>
                  <option value="highest">{tr.sortHighest}</option>
                  <option value="lowest">{tr.sortLowest}</option>
                </Select>
              </div>

              {sorted.length === 0 ? (
                <p className="text-center py-8 text-sm text-[var(--surface-inverted-subtle)]">
                  {tr.firstReview}
                </p>
              ) : (
                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                  {sorted.map(r => (
                    <Card key={r.id} variant="inverted" className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 bg-accent/30">
                          {r.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{r.name}</p>
                          <p className="text-xs text-[var(--surface-inverted-subtle)]">
                            {new Date(r.date).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'uk' ? 'uk-UA' : 'es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <span className="text-sm">{EMOJIS[r.rating - 1]?.emoji}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[var(--surface-inverted-muted)]">{r.text}</p>
                    </Card>
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
