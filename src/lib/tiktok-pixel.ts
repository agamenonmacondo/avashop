export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '';

// Tipos de eventos de TikTok
export type TikTokEventName = 
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'CompletePayment'
  | 'Search'
  | 'AddPaymentInfo'
  | 'Contact';

interface TikTokEventParams {
  content_id?: string;
  content_type?: string;
  content_name?: string;
  currency?: string;
  value?: number;
  quantity?: number;
  description?: string;
}

// Función para rastrear eventos
export const trackTikTokEvent = (
  eventName: TikTokEventName,
  params?: TikTokEventParams
) => {
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track(eventName, params);
    console.log(`📊 TikTok Event: ${eventName}`, params);
  }
};

// Extensión del objeto Window
declare global {
  interface Window {
    ttq: {
      track: (eventName: string, params?: any) => void;
      page: () => void;
      load: (pixelId: string) => void;
    };
  }
}