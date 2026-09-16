'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getAdminCounts, type AdminCounts } from '../../actions/admin';
import { useAdminAuth } from './AdminAuth';

const EMPTY: AdminCounts = {
  bookingsNeedsAction: 0,
  bookingsUnread: 0,
  bookingsUrgent: 0,
  reviewsPending: 0,
  messagesUnread: 0,
  schemaOutdated: false,
};

const Ctx = createContext<{ counts: AdminCounts; refresh: () => Promise<void>; loaded: boolean }>({
  counts: EMPTY,
  refresh: async () => {},
  loaded: false,
});

// Badge counts for the navigation, refreshed on mount, on focus and every
// 90 seconds. Screens call refresh() after they change something.
export function AdminCountsProvider({ children }: { children: ReactNode }) {
  const { user } = useAdminAuth();
  const [counts, setCounts] = useState<AdminCounts>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const inflight = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    if (inflight.current) return inflight.current;
    inflight.current = getAdminCounts()
      .then((c) => {
        setCounts(c);
        setLoaded(true);
      })
      .catch(() => undefined)
      .finally(() => {
        inflight.current = null;
      });
    return inflight.current;
  }, [user]);

  useEffect(() => {
    void refresh();
    const iv = setInterval(() => void refresh(), 90000);
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(iv);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  return <Ctx.Provider value={{ counts, refresh, loaded }}>{children}</Ctx.Provider>;
}

export function useAdminCounts() {
  return useContext(Ctx);
}
