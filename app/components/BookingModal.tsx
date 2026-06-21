'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

export default function BookingModal({
  phone,
  onClose,
}: {
  phone?: string | null;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const tr = (t[lang] as any).booking;

  const [name, setName] = useState('');
  const [request, setRequest] = useState('');
  const [errors, setErrors] = useState<{ name?: string; request?: string }>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const send = () => {
    const e: { name?: string; request?: string } = {};
    if (!name.trim()) e.name = tr.nameRequired;
    if (!request.trim()) e.request = tr.requestRequired;
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    // Build the pre-filled text message body from the chosen language template.
    const body = (tr.messageTemplate as string)
      .replace('{name}', name.trim())
      .replace('{request}', request.trim());

    // Keep digits and a leading "+" so the sms: scheme gets a clean number.
    const cleanPhone = (phone || '').replace(/[^\d+]/g, '');

    // "?&body=" is the cross-platform form that works on both modern iOS
    // (Messages) and Android (Messages) when opening the SMS app.
    const smsLink = `sms:${cleanPhone}?&body=${encodeURIComponent(body)}`;

    window.location.href = smsLink;
    onClose();
  };

  const hasPhone = Boolean((phone || '').replace(/[^\d+]/g, ''));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={tr.title}
    >
      <Card
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-xl">{tr.title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr.cancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!hasPhone ? (
          <p className="mt-4 text-sm text-muted-foreground">{tr.noPhone}</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">{tr.subtitle}</p>

            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
                  {tr.nameLabel}
                </label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder={tr.namePlaceholder}
                  aria-label={tr.nameLabel}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
                  {tr.requestLabel}
                </label>
                <Textarea
                  value={request}
                  onChange={(e) => {
                    setRequest(e.target.value);
                    setErrors((prev) => ({ ...prev, request: '' }));
                  }}
                  placeholder={tr.requestPlaceholder}
                  aria-label={tr.requestLabel}
                  rows={4}
                />
                {errors.request && (
                  <p className="mt-1 text-xs text-red-500">{errors.request}</p>
                )}
              </div>
            </div>

            <Button
              onClick={send}
              variant="accent"
              size="pill"
              className="w-full mt-6"
            >
              {tr.send}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
