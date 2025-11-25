export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data);
  }
};

// Eventos específicos para e-commerce
export const trackViewContent = (productId: string, productName: string, price: number) => {
  trackEvent('ViewContent', {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price,
    currency: 'COP',
  });
};

export const trackAddToCart = (productId: string, productName: string, price: number, quantity: number) => {
  trackEvent('AddToCart', {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price * quantity,
    currency: 'COP',
  });
};

export const trackInitiateCheckout = (value: number, numItems: number) => {
  trackEvent('InitiateCheckout', {
    value,
    currency: 'COP',
    num_items: numItems,
  });
};

export const trackPurchase = (orderId: string, value: number, products: any[]) => {
  trackEvent('Purchase', {
    content_ids: products.map(p => p.id),
    content_type: 'product',
    value,
    currency: 'COP',
    transaction_id: orderId,
  });
};