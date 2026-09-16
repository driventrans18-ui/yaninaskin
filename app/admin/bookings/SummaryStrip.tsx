'use client';

import { AlertTriangle, CalendarCheck, Copy, Sparkles } from 'lucide-react';
import { useAdminT } from '../_components/AdminLang';

export default function SummaryStrip({
  summary,
}: {
  summary: { replyToday: number; duplicatesMerged: number; conflicts: number; confirmedThisWeek: number };
}) {
  const { t, fmt } = useAdminT();
  const items = [
    { n: summary.replyToday, label: fmt(t.summaryReplyToday, { n: summary.replyToday }), icon: <Sparkles />, tone: summary.replyToday ? 'text-amber-900 bg-amber-100' : '' },
    { n: summary.duplicatesMerged, label: fmt(t.summaryDuplicates, { n: summary.duplicatesMerged }), icon: <Copy />, tone: '' },
    { n: summary.conflicts, label: fmt(t.summaryConflicts, { n: summary.conflicts }), icon: <AlertTriangle />, tone: summary.conflicts ? 'text-amber-900 bg-amber-100' : '' },
    { n: summary.confirmedThisWeek, label: fmt(t.summaryConfirmedWeek, { n: summary.confirmedThisWeek }), icon: <CalendarCheck />, tone: '' },
  ].filter((i) => i.n > 0);
  if (items.length === 0) {
    return <p className="mb-4 text-sm text-muted-foreground">{t.summaryAllClear}</p>;
  }
  return (
    <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" aria-label="Summary">
      {items.map((i, idx) => (
        <span
          key={idx}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm ${i.tone || 'bg-background text-foreground'} [&_svg]:size-3.5`}
        >
          {i.icon}
          {i.label}
        </span>
      ))}
    </div>
  );
}
