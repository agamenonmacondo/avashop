'use client';

import { useEffect, useRef } from 'react';

interface BoldButtonProps {
  apiKey: string;
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
}

const BoldButton: React.FC<BoldButtonProps> = ({
  apiKey,
  orderId,
  amount,
  currency,
  integritySignature,
  redirectionUrl,
  description,
  customerData,
  billingAddress,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Cargar el script de Bold si no está cargado
    if (!scriptLoadedRef.current) {
      const script = document.createElement('script');
      script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      script.async = true;
      document.head.appendChild(script);
      scriptLoadedRef.current = true;
    }

    // Crear el botón de Bold
    if (containerRef.current) {
      const buttonScript = document.createElement('script');
      buttonScript.setAttribute('data-bold-button', 'dark-L');
      buttonScript.setAttribute('data-api-key', apiKey);
      buttonScript.setAttribute('data-order-id', orderId);
      buttonScript.setAttribute('data-amount', amount.toString());
      buttonScript.setAttribute('data-currency', currency);
      buttonScript.setAttribute('data-integrity-signature', integritySignature);
      buttonScript.setAttribute('data-redirection-url', redirectionUrl);
      buttonScript.setAttribute('data-render-mode', 'embedded');

      if (description) {
        buttonScript.setAttribute('data-description', description);
      }

      if (customerData) {
        buttonScript.setAttribute('data-customer-data', JSON.stringify(customerData));
      }

      if (billingAddress) {
        buttonScript.setAttribute('data-billing-address', JSON.stringify(billingAddress));
      }

      containerRef.current.appendChild(buttonScript);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [apiKey, orderId, amount, currency, integritySignature, redirectionUrl, description, customerData, billingAddress]);

  return <div ref={containerRef} />;
};

export default BoldButton;
