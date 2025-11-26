'use client';

import Script from 'next/script';

export default function GoogleAds() {
  const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

  if (!ADS_ID) {
    console.warn('⚠️ Google Ads ID no encontrado. Revisa tu archivo .env.local');
    return null;
  }

  return (
    <>
      {/* Google Ads (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ADS_ID}');
        `}
      </Script>
    </>
  );
}