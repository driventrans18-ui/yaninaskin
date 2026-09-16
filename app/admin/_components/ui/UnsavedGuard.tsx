'use client';

import { useEffect, useState } from 'react';
import { ConfirmDialog } from './Dialog';
import { useAdminT } from '../AdminLang';

// Warns before leaving a page with unsaved changes: browser navigation via
// beforeunload, and in-app link clicks via a capture-phase click listener.
export default function UnsavedGuard({ dirty }: { dirty: boolean }) {
  const { t } = useAdminT();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || /^(mailto|tel|sms):/.test(href)) return;
      const url = new URL(href, window.location.href);
      if (url.href === window.location.href) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(url.href);
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty]);

  return (
    <ConfirmDialog
      open={pendingHref !== null}
      onClose={() => setPendingHref(null)}
      onConfirm={() => {
        const href = pendingHref;
        setPendingHref(null);
        if (href) window.location.href = href;
      }}
      title={t.unsavedTitle}
      body={t.unsavedBody}
      confirmLabel={t.leave}
      cancelLabel={t.stay}
    />
  );
}
