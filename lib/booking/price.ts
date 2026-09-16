// "$140-160" | "$110–250" | "From $90+" | "$ 220" → numbers
export function parsePrice(text: string | null | undefined): { min: number; max: number; mid: number } | null {
  if (!text) return null;
  const nums = text.match(/\d+(?:\.\d+)?/g);
  if (!nums || nums.length === 0) return null;
  const min = parseFloat(nums[0]);
  const max = nums.length > 1 ? parseFloat(nums[1]) : min;
  return { min, max, mid: (min + max) / 2 };
}

export function formatMoney(amount: number, currency = 'USD', lang = 'en'): string {
  const locale = lang === 'uk' ? 'uk-UA' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `$${Math.round(amount)}`;
  }
}
