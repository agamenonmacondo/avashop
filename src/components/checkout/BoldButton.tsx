'use client';

import { useEffect, useRef } from 'react';

interface BoldButtonProps {
  orderId: string;
  amount: number;
  currency: string;
  integritySignature: string;
  redirectionUrl: string;
  description?: string;
  customerData?: {
    email?: string;
    fullName?: string;
    phone?: string;
  };
  billingAddress?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  onClose?: () => void;
}

const BoldButton: React.FC<BoldButtonProps> = ({
  orderId,
  amount,
  currency,
  integritySignature,
  redirectionUrl,
  description = '',
  customerData,
  billingAddress,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar script de Bold
    if (!document.querySelector('script[src*="boldPaymentButton.js"]')) {
      const boldScript = document.createElement('script');
      boldScript.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      boldScript.async = true;
      document.head.appendChild(boldScript);
    }

    // Crear el botón
    if (containerRef.current) {
      // Limpiar contenedor
      containerRef.current.innerHTML = '';

      // Crear script con atributos data-*
      const buttonScript = document.createElement('script');

      // Atributos obligatorios
      buttonScript.setAttribute('data-bold-button', 'dark-L');
      buttonScript.setAttribute('data-api-key', process.env.NEXT_PUBLIC_BOLD_API_KEY || '');
      buttonScript.setAttribute('data-order-id', orderId);
      buttonScript.setAttribute('data-amount', amount.toString());
      buttonScript.setAttribute('data-currency', currency);
      buttonScript.setAttribute('data-integrity-signature', integritySignature);
      buttonScript.setAttribute('data-redirection-url', redirectionUrl);
      buttonScript.setAttribute('data-render-mode', 'embedded');

      // Atributos opcionales
      if (description) {
        buttonScript.setAttribute('data-description', description);
      }

      if (customerData) {
        const customerDataStr = JSON.stringify({
          email: customerData.email || '',
          fullName: customerData.fullName || '',
          phone: customerData.phone || '',
        });
        buttonScript.setAttribute('data-customer-data', customerDataStr);
      }

      if (billingAddress) {
        const billingAddressStr = JSON.stringify({
          address: billingAddress.address || '',
          city: billingAddress.city || '',
          state: billingAddress.state || '',
          zipCode: billingAddress.zipCode || '',
          country: billingAddress.country || 'CO',
        });
        buttonScript.setAttribute('data-billing-address', billingAddressStr);
      }

      // Agregar al contenedor
      containerRef.current.appendChild(buttonScript);

      // Forzar re-evaluación del script
      setTimeout(() => {
        if (window.BoldCheckout && typeof window.BoldCheckout.init === 'function') {
          window.BoldCheckout.init();
        }
      }, 100);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [orderId, amount, currency, integritySignature, redirectionUrl, description, customerData, billingAddress]);

  return (
    <div className="w-full space-y-2">
      {onClose && (
        <button
          onClick={onClose}
          className="text-sm text-muted-foreground underline hover:text-primary transition-colors"
          type="button"
        >
          ← Cambiar método de pago
        </button>
      )}
      <div ref={containerRef} className="w-full min-h-[60px]" />
    </div>
  );
};

// Declaración global para TypeScript
declare global {
  interface Window {
    BoldCheckout?: {
      init: () => void;
    };
  }
}

export default BoldButton;
