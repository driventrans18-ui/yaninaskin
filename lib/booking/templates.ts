import type { BookingSettings, TemplateKey } from './types';

export const TEMPLATE_KEYS: TemplateKey[] = ['confirm', 'suggest', 'decline', 'reminder', 'review', 'quick'];
export const TEMPLATE_VARS = ['name', 'service', 'date', 'time', 'price', 'alt_times', 'link', 'studio'] as const;

export const DEFAULT_TEMPLATES: Record<'en' | 'uk', Record<TemplateKey, string>> = {
  en: {
    confirm:
      'Hi {name}! This is Yanina from Skin Beauty. Your {service} is confirmed for {date} at {time}. Reply here if anything changes. See you soon! ✨',
    suggest:
      'Hi {name}! Thank you for your request for {service}. {date} at {time} is already taken. Would one of these work instead?\n{alt_times}\nJust reply with the one you prefer.',
    decline:
      "Hi {name}, thank you for reaching out about {service}. Unfortunately I can't take this appointment right now. I'd be happy to help another time, just text me. 🌸",
    reminder:
      'Hi {name}! A friendly reminder of your {service} tomorrow, {date} at {time}, at Skin Beauty. Reply if you need to reschedule. See you soon!',
    review:
      'Hi {name}! Thank you for visiting Skin Beauty. If you have a minute, I would love a short review. It helps so much: {link} 💛',
    quick: 'Hi {name}! This is Yanina from Skin Beauty about your {service} request. ',
  },
  uk: {
    confirm:
      'Вітаю, {name}! Це Яніна зі Skin Beauty. Ваш запис на {service} підтверджено: {date} о {time}. Напишіть, якщо щось зміниться. До зустрічі! ✨',
    suggest:
      'Вітаю, {name}! Дякую за запит на {service}. {date} о {time} уже зайнято. Чи підійде один із цих варіантів?\n{alt_times}\nПросто напишіть, який зручніший.',
    decline:
      'Вітаю, {name}, дякую, що звернулися щодо {service}. На жаль, зараз я не можу взяти цей запис. Із радістю допоможу іншим разом, просто напишіть мені. 🌸',
    reminder:
      'Вітаю, {name}! Нагадую про ваш запис на {service} завтра, {date} о {time}, у Skin Beauty. Напишіть, якщо потрібно перенести. До зустрічі!',
    review:
      'Вітаю, {name}! Дякую за візит до Skin Beauty. Якщо є хвилинка, буду вдячна за короткий відгук. Це дуже допомагає: {link} 💛',
    quick: 'Вітаю, {name}! Це Яніна зі Skin Beauty щодо вашого запиту на {service}. ',
  },
};

export function templateFor(settings: BookingSettings | null, lang: string | null | undefined, key: TemplateKey): string {
  const l: 'en' | 'uk' = lang === 'uk' ? 'uk' : 'en';
  const custom = settings?.replyTemplates?.[l]?.[key];
  return (typeof custom === 'string' && custom.trim()) || DEFAULT_TEMPLATES[l][key];
}

export function renderTemplate(tpl: string, vars: Partial<Record<(typeof TEMPLATE_VARS)[number], string>>): string {
  return tpl.replace(/\{(\w+)\}/g, (m, k: string) => {
    const v = (vars as Record<string, string | undefined>)[k];
    return v === undefined || v === null ? m : v;
  });
}

// Strip everything but digits and a leading "+" so URL schemes get a clean number.
export function telDigits(phone: string | null | undefined): string {
  return (phone || '').replace(/[^\d+]/g, '');
}

// "?&body=" works on both iOS Messages and Android Messages.
export function smsHref(phone: string | null | undefined, body: string): string {
  return `sms:${telDigits(phone)}?&body=${encodeURIComponent(body)}`;
}

export function telHref(phone: string | null | undefined): string {
  return `tel:${telDigits(phone)}`;
}

export function mailtoHref(email: string | null | undefined, subject: string, body: string): string {
  return `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
