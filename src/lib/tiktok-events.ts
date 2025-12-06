/**
 * Tipos de eventos soportados por TikTok Pixel
 */
export type TikTokEventName = 
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'CompletePayment'
  | 'Search'
  | 'AddPaymentInfo'
  | 'Contact'
  | 'ClickButton';

/**
 * Parámetros para eventos de TikTok
 */
export interface TikTokEventParams {
  content_id?: string;
  content_type?: string;
  content_name?: string;
  currency?: string;
  value?: number;
  quantity?: number;
  description?: string;
  query?: string;
}

/**
 * Función para rastrear eventos de TikTok
 */
export const trackTikTokEvent = (
  eventName: TikTokEventName,
  params?: TikTokEventParams
): void => {
  if (typeof window === 'undefined') return;

  const ttq = (window as any).ttq;
  if (!ttq) {
    console.warn('⚠️ TikTok Pixel no inicializado');
    return;
  }

  try {
    ttq.track(eventName, params);
    console.log(`📊 TikTok Event: ${eventName}`, params);
  } catch (error) {
    console.error('❌ Error al rastrear evento de TikTok:', error);
  }
};

export const trackProductView = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}): void => {
  trackTikTokEvent('ViewContent', {
    content_id: product.id,
    content_type: 'product',
    content_name: product.name,
    currency: 'USD',
    value: product.price,
    description: product.category,
  });
};

export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}): void => {
  trackTikTokEvent('AddToCart', {
    content_id: product.id,
    content_type: 'product',
    content_name: product.name,
    currency: 'USD',
    value: product.price,
    quantity: product.quantity || 1,
  });
};

export const trackCheckout = (cart: {
  total: number;
  itemCount: number;
}): void => {
  trackTikTokEvent('InitiateCheckout', {
    content_type: 'product',
    currency: 'USD',
    value: cart.total,
    quantity: cart.itemCount,
  });
};

export const trackPurchase = (order: {
  orderId: string;
  total: number;
  itemCount: number;
}): void => {
  trackTikTokEvent('CompletePayment', {
    content_id: order.orderId,
    content_type: 'product',
    currency: 'USD',
    value: order.total,
    quantity: order.itemCount,
  });
};

export const trackSearch = (query: string): void => {
  trackTikTokEvent('Search', {
    query,
    content_type: 'product',
  });
};