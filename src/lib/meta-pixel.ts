// Función general para trackear eventos
export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data);
  }
};

// ViewContent - Cuando alguien ve un producto
export const trackViewContent = (productId: string, productName: string, price: number) => {
  trackEvent('ViewContent', {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price,
    currency: 'COP',
  });
};

// AddToCart - Cuando alguien agrega un producto al carrito
export const trackAddToCart = (productId: string, productName: string, price: number, quantity: number) => {
  trackEvent('AddToCart', {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price * quantity,
    currency: 'COP',
    num_items: quantity,
  });
};

// InitiateCheckout - Cuando alguien inicia el proceso de checkout
export const trackInitiateCheckout = (value: number, numItems: number, contentIds: string[]) => {
  trackEvent('InitiateCheckout', {
    content_ids: contentIds,
    content_type: 'product',
    value,
    currency: 'COP',
    num_items: numItems,
  });
};

// Purchase - Cuando se completa una compra
export const trackPurchase = (orderId: string, value: number, products: Array<{ id: string; quantity: number; price: number }>) => {
  trackEvent('Purchase', {
    content_ids: products.map(p => p.id),
    content_type: 'product',
    value,
    currency: 'COP',
    num_items: products.reduce((sum, p) => sum + p.quantity, 0),
    content_name: products.map(p => p.id).join(', '),
  });
};

// Search - Cuando alguien busca productos
export const trackSearch = (searchQuery: string) => {
  trackEvent('Search', {
    search_string: searchQuery,
  });
};

// AddToWishlist - Cuando alguien agrega a favoritos (opcional)
export const trackAddToWishlist = (productId: string, productName: string, price: number) => {
  trackEvent('AddToWishlist', {
    content_ids: [productId],
    content_name: productName,
    value: price,
    currency: 'COP',
  });
};