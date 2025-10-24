'use client';

import { useEffect, useRef } from 'react';

interface BoldButtonProps {
  orderId: string;
  amount: number;
  currency: string;
  integritySignature: string;
  redirectionUrl: string;
  description: string;
  customerData?: {
    email: string;
    fullName: string;
    phone?: string;
  };
  billingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
  };
  onClose?: () => void;
}

const BoldButton: React.FC<BoldButtonProps> = ({
  orderId,
  amount,
  currency,
  integritySignature,
  redirectionUrl,
  description,
  customerData,
  billingAddress,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Cargar el script de Bold si no está cargado
    if (!scriptLoadedRef.current) {
      const script = document.createElement('script');
      script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Script de Bold cargado');
        scriptLoadedRef.current = true;
      };
      script.onerror = () => {
        console.error('❌ Error cargando el script de Bold');
      };
      document.head.appendChild(script);
    }

    return () => {
      // Limpiar el contenedor al desmontar
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Formatear datos del cliente
  const customerDataString = customerData
    ? JSON.stringify({
        email: customerData.email,
        fullName: customerData.fullName,
        phone: customerData.phone || '',
      })
    : undefined;

  // Formatear dirección de facturación
  const billingAddressString = billingAddress
    ? JSON.stringify({
        address: billingAddress.address,
        city: billingAddress.city,
        state: billingAddress.state,
        zipCode: billingAddress.zipCode || '',
        country: billingAddress.country,
      })
    : undefined;

  return (
    <div className="w-full">
      <div ref={containerRef} className="bold-button-container">
        <script
          data-bold-button="dark-L"
          data-api-key={process.env.NEXT_PUBLIC_BOLD_API_KEY}
          data-order-id={orderId}
          data-amount={amount}
          data-currency={currency}
          data-integrity-signature={integritySignature}
          data-redirection-url={redirectionUrl}
          data-description={description}
          data-customer-data={customerDataString}
          data-billing-address={billingAddressString}
          data-render-mode="embedded"
        />
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground underline"
        >
          Cancelar y volver
        </button>
      )}
    </div>
  );
};

export default BoldButton;
