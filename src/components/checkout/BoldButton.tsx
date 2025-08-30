
'use client';
import React, { useEffect, useRef } from 'react';

// Props based on Bold's documentation and our server action
interface BoldButtonProps {
  apiKey: string;
  orderId: string;
  amount: number;
  currency: string;
  signature: string;
  redirectionUrl: string;
  description: string;
  customerData: string; // JSON string
  billingAddress: string; // JSON string
  onClose: () => void; // Callback to reset the state in the parent
}

const BoldButton: React.FC<BoldButtonProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const BOLD_SCRIPT_URL = 'https://checkout.bold.co/library/boldPaymentButton.js';

  useEffect(() => {
    const handleBoldClose = () => {
      console.log('Bold checkout closed.');
      props.onClose();
    };

    // Add event listener to the window to catch the close event from Bold
    window.addEventListener('bold.checkout.closed', handleBoldClose);

    const container = containerRef.current;
    if (!container) return;

    // 1. Create the button's placeholder script tag with all the data
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
    // Use embedded checkout for a better user experience (opens in a modal)
    buttonScript.setAttribute('data-render-mode', 'embedded');

    // Clear the container and add the new button script
    container.innerHTML = '';
    container.appendChild(buttonScript);

    // 2. Load the Bold library script to activate the button script we just added.
    // This ensures the library runs after the button's placeholder is in the DOM.
    let boldLibraryScript = document.querySelector(`script[src="${BOLD_SCRIPT_URL}"]`);
    if (boldLibraryScript) {
      // If it exists, remove and re-add to force re-evaluation.
      // This is a common pattern for libraries that don't offer a manual re-init function.
      boldLibraryScript.remove();
    }
    
    boldLibraryScript = document.createElement('script');
    boldLibraryScript.src = BOLD_SCRIPT_URL;
    boldLibraryScript.async = true;
    document.head.appendChild(boldLibraryScript);

    // Cleanup listener on component unmount
    return () => {
        window.removeEventListener('bold.checkout.closed', handleBoldClose);
        if (boldLibraryScript) {
            boldLibraryScript.remove();
        }
    };

  }, [props]); // Re-run this logic whenever the payment data changes.

  return <div ref={containerRef} className="w-full" />;
};

export default BoldButton;
