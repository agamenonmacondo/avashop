'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || 'D4PSQJJC77UCR38FRVEG';

// Declaración de tipos global ANTES del componente
declare global {
  interface Window {
    ttq: {
      track: (eventName: string, params?: Record<string, any>) => void;
      page: () => void;
      load: (pixelId: string, options?: Record<string, any>) => void;
      identify: (userData?: Record<string, any>) => void;
      enableCookie: () => void;
      disableCookie: () => void;
    };
    TiktokAnalyticsObject: string;
  }
}

export default function TikTokPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inicializar TikTok Pixel
  useEffect(() => {
    // Verificar si ya está inicializado
    if (typeof window !== 'undefined' && window.ttq) {
      console.log('✅ TikTok Pixel ya inicializado');
      return;
    }

    const script = document.createElement('script');
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
        ttq.load('${TIKTOK_PIXEL_ID}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    
    document.head.appendChild(script);
    console.log('✅ TikTok Pixel inicializado con ID:', TIKTOK_PIXEL_ID);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Rastrear cambios de página
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.page();
      console.log('📄 TikTok PageView:', pathname);
    }
  }, [pathname, searchParams]);

  return null;
}