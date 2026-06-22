import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';

// Allow search engines to crawl the public site, keep them out of the admin
// and API routes, and point them at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
