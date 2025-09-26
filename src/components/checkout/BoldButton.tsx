'use client';
import React, { useEffect, useRef } from 'react';

interface BoldButtonProps {
  apiKey: string;
  orderId: string;
  amount: number;
  currency: string;
  signature: string;
  redirectionUrl: string;
  description: string;
  customerData: string;
  billingAddress: string;
  onClose: () => void;
}

const BoldButton: React.FC<BoldButtonProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const BOLD_SCRIPT_URL = 'https://checkout.bold.co/library/boldPaymentButton.js';

  useEffect(() => {
    const handleBoldClose = () => {
      props.onClose();
    };

    window.addEventListener('bold.checkout.closed', handleBoldClose);

    const container = containerRef.current;
    if (!container) return;

    // Crear el script del botón con los atributos requeridos
    const buttonScript = document.createElement('script');
    buttonScript.setAttribute('data-bold-button', 'dark-L');
    buttonScript.setAttribute('data-api-key', props.apiKey);
    buttonScript.setAttribute('data-order-id', props.orderId);
    buttonScript.setAttribute('data-amount', String(props.amount));
    buttonScript.setAttribute('data-currency', props.currency);
    buttonScript.setAttribute('data-integrity-signature', props.signature);
    buttonScript.setAttribute('data-redirection-url', props.redirectionUrl);
    buttonScript.setAttribute('data-description', props.description);
    buttonScript.setAttribute('data-customer-data', props.customerData);
    buttonScript.setAttribute('data-billing-address', props.billingAddress);
    buttonScript.setAttribute('data-render-mode', 'embedded');

    container.innerHTML = '';
    container.appendChild(buttonScript);

    // Solo agrega el script global si no existe
    if (!document.querySelector(`script[src="${BOLD_SCRIPT_URL}"]`)) {
      const boldLibraryScript = document.createElement('script');
      boldLibraryScript.src = BOLD_SCRIPT_URL;
      boldLibraryScript.async = true;
      document.head.appendChild(boldLibraryScript);
    }

    // Cleanup solo el event listener
    return () => {
      window.removeEventListener('bold.checkout.closed', handleBoldClose);
    };
  }, [props]);

  return <div ref={containerRef} className="w-full" />;
};

export default BoldButton;
