// Payment return page for processing Tranzila payment callbacks
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';

/**
 * Payment return page for processing Tranzila payment callbacks
 * @returns JSX.Element - Payment processing status page with success/error handling
 * Purpose: Handles payment gateway return callbacks, processes order creation,
 * and provides user feedback for payment success or failure scenarios
 */
export default function PaymentReturnPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState<'success' | 'error' | 'processing'>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    /**
     * Processes payment return from Tranzila gateway
     * Purpose: Validates payment response, creates order, and handles success/error states
     */
    const processPaymentReturn = async () => {
      try {
        // Get the pending order from session storage
        const pendingOrderJson = sessionStorage.getItem('pendingOrder');
        if (!pendingOrderJson) {
          setStatus('error');
          setMessage('No pending order found. Please try again.');
          return;
        }

        const pendingOrder = JSON.parse(pendingOrderJson);
        
        // Get payment status from query parameters
        const { Response, index, AuthNr, TranzilaTK } = router.query;
        
        // Check if payment was successful
        if (Response === '000') {
          // Add payment details to the order
          pendingOrder.paymentDetails.paymentId = `${index}-${AuthNr}`;
          pendingOrder.paymentDetails.token = TranzilaTK;
          
          // Create the order
          const { data } = await axios.post('/api/orders', pendingOrder);
          
          // Clear cart and session storage
          clearCart();
          sessionStorage.removeItem('pendingOrder');
          
          // Show success message
          setStatus('success');
          setMessage('Payment successful! Redirecting to your order...');
          
          // Redirect to order page
          setTimeout(() => {
            router.push(`/orders/${data._id}`);
          }, 2000);
        } else {
          // Payment failed
          setStatus('error');
          setMessage(`Payment failed: ${getErrorMessage(Response as string)}`);
        }
      } catch (error: any) {
        console.error('Error processing payment return:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to process payment. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    if (router.isReady) {
      processPaymentReturn();
    }
  }, [router.isReady, router.query, clearCart, router]);

  /**
   * Maps Tranzila response codes to user-friendly error messages
   * @param responseCode - Tranzila payment response code
   * @returns User-friendly error message
   * Purpose: Provides meaningful error messages for payment failures
   */
  const getErrorMessage = (responseCode: string): string => {
    const errorCodes: Record<string, string> = {
      '001': 'Card company hasn\'t authorized the transaction',
      '002': 'Blocked card',
      '003': 'Invalid card number',
      // Add more error codes as needed
    };
    
    return errorCodes[responseCode] || 'Unknown error';
  };

  return (
    <Layout title="Payment Processing" description="Processing your payment">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="text-center">
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-main mx-auto mb-4"></div>
            )}
            
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {status === 'processing' ? 'Processing Payment' : 
               status === 'success' ? 'Payment Successful' : 'Payment Failed'}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            
            {status === 'error' && (
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => router.push('/checkout')}
                  className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Try Again
                </button>
                
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 text-primary-main hover:underline"
                >
                  Return to Home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 