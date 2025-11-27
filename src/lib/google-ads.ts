declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const CONVERSION_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17757337492';
const PURCHASE_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

// Función general para enviar eventos
export const gtagEvent = (action: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
  }
};

// Evento de conversión de compra (PRINCIPAL)
export const gtagPurchase = (transactionId: string, value: number, items: any[]) => {
  console.log('📊 [Google Ads] Enviando conversión de compra:', {
    transactionId,
    value,
    items,
  });

  // Evento estándar de e-commerce
  gtagEvent('purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'COP',
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });

  // Evento de conversión específico de Google Ads
  if (typeof window !== 'undefined' && window.gtag && PURCHASE_LABEL) {
    window.gtag('event', 'conversion', {
      send_to: `${CONVERSION_ID}/${PURCHASE_LABEL}`,
      value: value,
      currency: 'COP',
      transaction_id: transactionId,
    });
    console.log('✅ [Google Ads] Conversión enviada correctamente');
  } else {
    console.warn('⚠️ [Google Ads] Conversion Label no configurado. Revisa NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL en .env.local');
  }
};

// Evento de agregar al carrito
export const gtagAddToCart = (value: number, items: any[]) => {
  gtagEvent('add_to_cart', {
    value: value,
    currency: 'COP',
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

// Evento de comenzar checkout
export const gtagBeginCheckout = (value: number, items: any[]) => {
  gtagEvent('begin_checkout', {
    value: value,
    currency: 'COP',
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

// Evento de vista de producto
export const gtagViewItem = (value: number, items: any[]) => {
  gtagEvent('view_item', {
    value: value,
    currency: 'COP',
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};