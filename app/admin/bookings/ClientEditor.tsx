'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { saveClient, type ClientRecord } from '../../actions/clients';
import { useAdminT } from '../_components/AdminLang';
import { useToast } from '../_components/ui/Toast';
import Sheet from '../_components/ui/Sheet';
import { Field } from '../_components/ui/Bits';

export interface ClientDraft {
  name: string;
  phone: string;
  email: string;
  instagram: string;
  birthday: string;
  notes: string;
}

export const emptyDraft = (): ClientDraft => ({ name: '', phone: '', email: '', instagram: '', birthday: '', notes: '' });

export default function ClientEditor({
  open,
  record,
  initial,
  onClose,
  onSaved,
  onRemove,
}: {
  open: boolean;
  record: ClientRecord | null; // existing record being edited, or null for a new one
  initial: ClientDraft; // prefilled values (from a booking-derived client, or empty)
  onClose: () => void;
  onSaved: (saved: ClientRecord) => Promise<void> | void;
  onRemove?: () => void;
}) {
  const { t } = useAdminT();
  const { toast } = useToast();
  const [draft, setDraft] = useState<ClientDraft>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientDraft, string>>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setDraft(initial);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (k: keyof ClientDraft, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const save = async () => {
    if (!draft.name.trim()) return setErrors({ name: t.clientNameRequired });
    setBusy(true);
    const r = await saveClient(record?.id ?? null, draft);
    setBusy(false);
    if (!r.success || !r.data) {
      if (r.field === 'phone') return setErrors({ phone: t.clientPhoneInvalid });
      if (r.field === 'email') return setErrors({ email: t.clientEmailInvalid });
      if (r.field === 'name') return setErrors({ name: t.clientNameRequired });
      return toast({ title: t.toastError, description: r.error, tone: 'error' });
    }
    toast({ title: t.clientSaved });
    await onSaved(r.data);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={record ? t.editClient : t.newClientTitle}
      footer={
        <div className="flex items-center gap-2">
          <Button className="h-12 flex-1 rounded-full md:h-11 md:flex-none" onClick={() => void save()} disabled={busy}>
            {t.save}
          </Button>
          <Button variant="outline" className="h-12 rounded-full md:h-11" onClick={onClose} disabled={busy}>
            {t.cancel}
          </Button>
          {record && onRemove && (
            <Button variant="ghost" className="ml-auto h-12 rounded-full text-muted-foreground md:h-11" onClick={onRemove} disabled={busy}>
              <Trash2 /> {t.removeLogin}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <Field label={t.clientName} required hint={errors.name}>
          <Input value={draft.name} onChange={(e) => set('name', e.target.value)} autoComplete="off" className={`h-12 ${errors.name ? 'border-destructive' : ''}`} data-autofocus />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.clientPhone} hint={errors.phone}>
            <Input type="tel" inputMode="tel" value={draft.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(585) 555-0123" className={`h-12 ${errors.phone ? 'border-destructive' : ''}`} />
          </Field>
          <Field label={t.clientEmail} hint={errors.email}>
            <Input type="email" inputMode="email" value={draft.email} onChange={(e) => set('email', e.target.value)} className={`h-12 ${errors.email ? 'border-destructive' : ''}`} />
          </Field>
          <Field label={t.clientInstagram}>
            <Input value={draft.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@username" className="h-12" />
          </Field>
          <Field label={t.clientBirthday} hint={errors.birthday}>
            <Input type="date" value={draft.birthday} onChange={(e) => set('birthday', e.target.value)} className="h-12" />
          </Field>
        </div>
        <Field label={t.clientNotes} hint={t.notesPlaceholder}>
          <Textarea rows={4} value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </div>
    </Sheet>
  );
}
