import { siteConfig } from '@/lib/siteConfig';
import { getAboutContent } from '../actions/content';

// Server-rendered structured data (schema.org BeautySalon / LocalBusiness).
// This is what helps Google understand the business is a Rochester, NY
// esthetician serving Upstate NY — improving eligibility for local results
// and rich snippets. NAP details the owner edits in the admin (phone,
// Instagram, TikTok) are pulled in so the schema stays accurate over time.
export default async function LocalBusinessJsonLd() {
  // Best-effort: if the DB is unavailable we still emit the static schema.
  let about: {
    phone?: string;
    email?: string;
    instagram_url?: string;
    tiktok_url?: string;
  } | null = null;
  try {
    const res = await getAboutContent();
    if (res.success) about = res.data;
  } catch {
    /* fall back to static data below */
  }

  const sameAs = [about?.instagram_url, about?.tiktok_url].filter(
    (v): v is string => Boolean(v),
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': `${siteConfig.url}/#business`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    priceRange: siteConfig.priceRange,
    ...(about?.phone ? { telephone: about.phone } : {}),
    ...(about?.email ? { email: about.email } : {}),
    // By-appointment business: advertise the city/region, not a street address.
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.locality,
      addressRegion: siteConfig.region,
      addressCountry: siteConfig.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    areaServed: siteConfig.areaServed.map((name) => ({
      '@type': 'City',
      name,
    })),
    knowsAbout: [
      'Facials',
      'Chemical Peels',
      'Acne Treatment',
      'Skincare',
      'Esthetics',
    ],
    founder: {
      '@type': 'Person',
      name: 'Yanina Menaker',
      jobTitle: 'Licensed Esthetician',
    },
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; there is no user-controlled
      // HTML here (values are business NAP fields), and React would otherwise
      // escape the JSON and break it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
