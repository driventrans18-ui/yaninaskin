'use client';

import Script from 'next/script';
import { GA_ID, gaEnabled } from '@/lib/gtag';

// Loads the Google Analytics 4 (gtag.js) snippet. Rendered once in the root
// layout. If NEXT_PUBLIC_GA_ID isn't set, nothing is injected — so the site
// ships zero analytics weight until the owner adds the Measurement ID.
export default function Analytics() {
  if (!gaEnabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
