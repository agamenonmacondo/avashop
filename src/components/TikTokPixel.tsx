'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { TIKTOK_PIXEL_ID } from '@/lib/tiktok-pixel';

export function TikTokPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!TIKTOK_PIXEL_ID) {
      console.warn('⚠️ TikTok Pixel ID no configurado');
      return;
    }

    // Inicializar TikTok Pixel
    const script = document.createElement('script');
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${TIKTOK_PIXEL_ID}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);

    console.log('✅ TikTok Pixel inicializado');

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Rastrear cambios de página
  useEffect(() => {
    if (window.ttq) {
      window.ttq.page();
      console.log('📄 TikTok PageView:', pathname);
    }
  }, [pathname, searchParams]);

  return null;
}