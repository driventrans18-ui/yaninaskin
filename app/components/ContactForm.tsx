'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { submitContactForm } from '../actions/contact';

export default function ContactForm() {
  const { lang } = useLanguage();
  const tr = (t[lang] as any).contact.form;

  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = tr.nameRequired;
    if (!phone.trim()) e.phone = tr.phoneRequired;
    if (!email.trim()) {
      e.email = tr.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = tr.emailInvalid;
    }
    if (!message.trim()) e.message = tr.messageRequired;
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setServerError('');
    setIsSubmitting(true);

    try {
      const result = await submitContactForm(
        name.trim(), phone.trim(), email.trim(), message.trim()
      );
      if (result.success) {
        setSubmitted(true);
        setName(''); setPhone(''); setEmail(''); setMessage('');
      } else {
        setServerError(result.error || tr.errorMsg);
      }
    } catch {
      setServerError(tr.errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-12 text-center py-8">
        <p className="text-accent font-medium">{tr.thankYou}</p>
      </div>
    );
  }

  return (
    <div className="mt-12 max-w-lg mx-auto">
      <p className="text-sm font-medium mb-6 text-center">{tr.title}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name */}
        <div>
          <Input
            value={name}
            onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
            placeholder={tr.namePlaceholder}
            aria-label={tr.namePlaceholder}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div>
          <Input
            value={phone}
            onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: '' })); }}
            placeholder={tr.phonePlaceholder}
            aria-label={tr.phonePlaceholder}
            type="tel"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className="sm:col-span-2">
          <Input
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
            placeholder={tr.emailPlaceholder}
            aria-label={tr.emailPlaceholder}
            type="email"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Message */}
        <div className="sm:col-span-2">
          <Textarea
            value={message}
            onChange={e => { setMessage(e.target.value); setErrors(prev => ({ ...prev, message: '' })); }}
            placeholder={tr.messagePlaceholder}
            aria-label={tr.messagePlaceholder}
            rows={4}
          />
          {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
        </div>
      </div>

      <Button
        onClick={submit}
        disabled={isSubmitting}
        variant="accent"
        size="pill"
        className="w-full mt-5"
      >
        {isSubmitting ? tr.submitting : tr.submit}
      </Button>

      {serverError && (
        <p className="mt-3 text-center text-sm text-red-500">{serverError}</p>
      )}
    </div>
  );
}
