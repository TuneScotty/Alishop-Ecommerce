import { useState, useEffect, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import tranzilaService, { PaymentMethod } from '../services/tranzilaService';
import Image from 'next/image';

interface TranzilaPaymentFormProps {
  onSuccess: (paymentDetails: {
    cardNumber?: string;
    expMonth?: string;
    expYear?: string;
    cvv?: string;
    holderId?: string;
    name: string;
    email: string;
    phone: string;
    paymentMethod: PaymentMethod;
  }) => void;
  onError: (message: string) => void;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  returnUrl?: string;
}

declare global {
  interface Window {
    TranzilaHostedFields?: any;
  }
}

const TranzilaPaymentForm: React.FC<TranzilaPaymentFormProps> = ({ 
  onSuccess, 
  onError,
  customerInfo,
  returnUrl
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card');
  const formContainerRef = useRef<HTMLDivElement>(null);
  const { showNotification } = useNotification();
  const availablePaymentMethods = tranzilaService.getAvailablePaymentMethods();

  useEffect(() => {
    // Load Tranzila script
    const script = document.createElement('script');
    script.src = 'https://secure.tranzila.com/hosted-fields/v1/tranzila-hosted-fields.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      onError('Failed to load payment processor. Please try again later.');
    };
    document.body.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onError]);

  useEffect(() => {
    if (isScriptLoaded && formContainerRef.current && selectedPaymentMethod === 'credit_card') {
      initializeTranzila();
    }
  }, [isScriptLoaded, selectedPaymentMethod]);

  const initializeTranzila = () => {
    if (!window.TranzilaHostedFields) {
      onError('Payment processor not available. Please try again later.');
      return;
    }

    try {
      const tranzilaTerminal = process.env.NEXT_PUBLIC_TRANZILA_TERMINAL_NAME || 'your_terminal';
      
      const hostedFields = window.TranzilaHostedFields.create({
        terminal: tranzilaTerminal,
        container: formContainerRef.current,
        styles: {
          base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        },
        fields: {
          cardNumber: {
            selector: '#card-number',
            placeholder: '1234 5678 9012 3456'
          },
          expirationDate: {
            selector: '#card-expiry',
            placeholder: 'MM / YY'
          },
          cvv: {
            selector: '#card-cvc',
            placeholder: 'CVC'
          }
        }
      });

      // Handle form submission
      const form = document.getElementById('payment-form') as HTMLFormElement;
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (selectedPaymentMethod !== 'credit_card') {
          handleAlternativePayment();
          return;
        }
        
        setIsLoading(true);

        try {
          const result = await hostedFields.createToken({
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone
          });

          if (result.error) {
            throw new Error(result.error.message || 'Payment processing failed');
          }

          // Extract card details from token result
          const { token, details } = result;
          
          onSuccess({
            cardNumber: details.cardNumber || '',
            expMonth: details.expMonth || '',
            expYear: details.expYear || '',
            cvv: details.cvv || '',
            holderId: token,
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            paymentMethod: 'credit_card'
          });
        } catch (error: any) {
          onError(error.message || 'Payment processing failed');
          showNotification(error.message || 'Payment processing failed', 'error');
        } finally {
          setIsLoading(false);
        }
      });
    } catch (error: any) {
      onError(error.message || 'Failed to initialize payment form');
      showNotification(error.message || 'Failed to initialize payment form', 'error');
    }
  };

  const handleAlternativePayment = () => {
    setIsLoading(true);
    
    try {
      // For alternative payment methods, we just pass the payment method to the parent
      onSuccess({
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        paymentMethod: selectedPaymentMethod
      });
    } catch (error: any) {
      onError(error.message || 'Payment processing failed');
      showNotification(error.message || 'Payment processing failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'credit_card': return 'Credit Card';
      case 'bit': return 'Bit';
      case 'paypal': return 'PayPal';
      case 'apple_pay': return 'Apple Pay';
      case 'google_pay': return 'Google Pay';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method;
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod): string => {
    switch (method) {
      case 'credit_card': return '/images/payment/credit-card.svg';
      case 'bit': return '/images/payment/bit.svg';
      case 'paypal': return '/images/payment/paypal.svg';
      case 'apple_pay': return '/images/payment/apple-pay.svg';
      case 'google_pay': return '/images/payment/google-pay.svg';
      case 'bank_transfer': return '/images/payment/bank-transfer.svg';
      default: return '/images/payment/credit-card.svg';
    }
  };

  return (
    <div className="mt-6">
      <form id="payment-form" className="space-y-6">
        {/* Payment Method Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Payment Method
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availablePaymentMethods.map((method) => (
              <div 
                key={method}
                className={`
                  border rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all
                  ${selectedPaymentMethod === method 
                    ? 'border-primary-main bg-primary-light/10 dark:bg-primary-dark/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-light hover:bg-gray-50 dark:hover:bg-gray-700/30'}
                `}
                onClick={() => setSelectedPaymentMethod(method)}
              >
                <div className="w-10 h-10 mb-2 relative">
                  <Image 
                    src={getPaymentMethodIcon(method)}
                    alt={getPaymentMethodLabel(method)}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-center">
                  {getPaymentMethodLabel(method)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Credit Card Form - Only show when credit card is selected */}
        {selectedPaymentMethod === 'credit_card' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Card Number
              </label>
              <div id="card-number" className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="card-expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expiration Date
                </label>
                <div id="card-expiry" className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"></div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="card-cvc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  CVC
                </label>
                <div id="card-cvc" className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"></div>
              </div>
            </div>
            
            <div ref={formContainerRef} className="tranzila-container"></div>
          </div>
        )}
        
        {/* Alternative Payment Method Info */}
        {selectedPaymentMethod !== 'credit_card' && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 mr-3 relative">
                <Image 
                  src={getPaymentMethodIcon(selectedPaymentMethod)}
                  alt={getPaymentMethodLabel(selectedPaymentMethod)}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Pay with {getPaymentMethodLabel(selectedPaymentMethod)}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {selectedPaymentMethod === 'bit' && 
                "You'll be redirected to Bit to complete your payment securely. After payment, you'll return to our site."}
              {selectedPaymentMethod === 'paypal' && 
                "You'll be redirected to PayPal to complete your payment securely. After payment, you'll return to our site."}
              {selectedPaymentMethod === 'apple_pay' && 
                "You'll be prompted to confirm payment with Apple Pay. This is a secure and quick way to pay."}
              {selectedPaymentMethod === 'google_pay' && 
                "You'll be prompted to confirm payment with Google Pay. This is a secure and quick way to pay."}
              {selectedPaymentMethod === 'bank_transfer' && 
                "You'll be redirected to complete a secure bank transfer. After payment, you'll return to our site."}
            </p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || !isScriptLoaded}
          className="w-full px-4 py-2 text-white bg-primary-main rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Pay with ${getPaymentMethodLabel(selectedPaymentMethod)}`
          )}
        </button>
        
        <div className="mt-4 flex items-center justify-center">
          <div className="text-xs text-gray-500 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure payment powered by Tranzila
          </div>
        </div>
      </form>
    </div>
  );
};

export default TranzilaPaymentForm; 