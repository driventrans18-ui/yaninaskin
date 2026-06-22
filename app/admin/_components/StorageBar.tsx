'use client';

import { useEffect, useState } from 'react';
import { getStorageUsage } from '../../actions/storage';
import { useAdminT } from './AdminLang';
import { Button } from '@/components/ui/button';
import ManageStorageModal from './ManageStorageModal';

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
  const [showManage, setShowManage] = useState(false);

  const refresh = () => {
    getStorageUsage()
      .then((r) => {
        setOk(r.success);
        setUsed(r.usedBytes);
        setLimit(r.limitBytes);
      })
      .catch(() => setOk(false))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
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
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground">
          {t.storage}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {fmt(used)} / {fmt(limit)} · {pct}%
          </span>
          <Button variant="outline" size="sm" onClick={() => setShowManage(true)}>
            {t.manageStorage}
          </Button>
        </div>
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

      {showManage && (
        <ManageStorageModal
          onClose={() => setShowManage(false)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}
