'use client';

import { useEffect, useState } from 'react';
import { getStorageUsage } from '../../actions/storage';
import { useAdminT } from './AdminLang';

function fmt(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(1)} MB`;
}

export default function StorageBar() {
  const { t } = useAdminT();
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    let active = true;
    getStorageUsage()
      .then((r) => {
        if (!active) return;
        setOk(r.success);
        setUsed(r.usedBytes);
        setLimit(r.limitBytes);
      })
      .catch(() => active && setOk(false))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <p className="mt-8 text-xs text-muted-foreground">{t.loading}</p>
    );
  }

  if (!ok || limit <= 0) return null;

  const pct = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="mt-8">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground">
          {t.storage}
        </span>
        <span className="text-xs text-muted-foreground">
          {fmt(used)} / {fmt(limit)} · {pct}%
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t.storage}
      >
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 90 ? 'bg-destructive' : 'bg-accent'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
