// Central site / business info used for SEO (metadata + structured data).
// Edit these values here and they propagate to <head> tags, Open Graph,
// the sitemap, and the LocalBusiness JSON-LD. NAP details that the owner
// edits in the admin (phone, Instagram, etc.) are layered on top at runtime.

export const siteConfig = {
  name: 'Skin Beauty by Yanina Menaker',
  shortName: 'Skin Beauty',

  // Canonical production URL (no trailing slash).
  url: 'https://www.my-skinbeauty.com',

  description:
    'Licensed esthetician in Rochester, NY offering personalised facials, ' +
    'chemical peels, and results-driven skincare. Serving Rochester and ' +
    'Upstate New York — book your appointment today.',

  // A short, location-rich tagline used as the default page title.
  title:
    'Skin Beauty by Yanina Menaker | Licensed Esthetician in Rochester, NY',

  // Primary service location. This is a by-appointment business, so no
  // street address is published — only the city/region and service area.
  locality: 'Rochester',
  region: 'NY',
  regionName: 'New York',
  country: 'US',

  // Approx. coordinates for Rochester, NY (helps local relevance).
  geo: { latitude: 43.1566, longitude: -77.6088 },

  // Towns/areas the business serves — strengthens "near me" / local intent.
  areaServed: [
    'Rochester',
    'Brighton',
    'Pittsford',
    'Penfield',
    'Webster',
    'Greece',
    'Irondequoit',
    'Fairport',
    'Henrietta',
    'Victor',
    'Monroe County',
    'Finger Lakes',
    'Upstate New York',
  ],

  // Keywords surfaced in metadata.
  keywords: [
    'esthetician Rochester NY',
    'facials Rochester NY',
    'chemical peels Rochester NY',
    'skincare Rochester NY',
    'licensed esthetician Upstate NY',
    'facial treatments Rochester',
    'acne treatment Rochester NY',
    'skin specialist Rochester',
    'best facials Rochester NY',
    'Yanina Menaker',
    'Skin Beauty',
  ],

  // Image used for social previews (Open Graph / Twitter). Replace with a
  // 1200×630 branded image when one is available for best-looking shares.
  ogImage: '/images/skin-beauty-logo.png',

  // Rough price band shown in structured data ($–$$$$).
  priceRange: '$$',
} as const;
