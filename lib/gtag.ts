// Google Analytics 4 helper.
//
// The Measurement ID lives in NEXT_PUBLIC_GA_ID (e.g. "G-XXXXXXXXXX"). When it
// is absent — local dev, or before the owner sets it in Vercel — every helper
// here quietly no-ops, so the site behaves exactly as before with analytics off.

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// True only when a Measurement ID is configured. Used to decide whether to
// inject the gtag script at all.
export const gaEnabled = Boolean(GA_ID);

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Fire a custom GA4 event. Safe to call anywhere — does nothing if analytics
// isn't loaded (no ID, ad-blocker, script still loading).
export function trackEvent(action: string, params: GtagParams = {}): void {
  if (!gaEnabled || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, params);
}
