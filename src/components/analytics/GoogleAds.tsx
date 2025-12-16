'use client';

import Script from 'next/script';
import { useEffect } from 'react';

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17796310652';

export default function GoogleAds() {
  useEffect(() => {
    console.log('✅ [Google Ads] Componente montado con ID:', GOOGLE_ADS_ID);
  }, []);

  return (
    <>
      {/* Global site tag (gtag.js) - Google Ads */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      />
      
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
          console.log('✅ [Google Ads] Etiqueta global configurada: ${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}