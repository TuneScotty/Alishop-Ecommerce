import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';
import { useCart, CartItem } from '../context/CartContext';
import ExternalImage from '../components/ExternalImage';
import Image from 'next/image';
import OrderSummary from '../components/OrderSummary';
import TranzilaPaymentForm from '../components/TranzilaPaymentForm';

// Define interfaces for our data structures
interface ShippingAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

interface PaymentDetails {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  holderId?: string;
  name: string;
  email: string;
  phone: string;
}

// Define interfaces for Tranzila integration
interface TranzilaHostedFieldsProps {
  onSuccess: (token: string) => void;
  onError: (message: string) => void;
}

// Add TypeScript interface for window with Tranzila
declare global {
  interface Window {
    TranzilaHostedFields?: any;
  }
}

// Tranzila integration component
const TranzilaHostedFields: React.FC<TranzilaHostedFieldsProps> = ({ onSuccess, onError }) => {
  useEffect(() => {
    // Load Tranzila script
    const script = document.createElement('script');
    script.src = 'https://secure.tranzila.com/hosted-fields/v1.0/tranzila-hosted-fields.js';
    script.async = true;
    script.onload = initializeTranzila;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeTranzila = () => {
    if (window.TranzilaHostedFields) {
      const tranzilaFields = window.TranzilaHostedFields.create({
        terminal: process.env.NEXT_PUBLIC_TRANZILA_TERMINAL_NAME || 'your_terminal_name', // Use environment variable
        language: 'he', // Hebrew language
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
        }
      });

      const container = document.getElementById('tranzila-hosted-fields-container');
      if (container) {
        tranzilaFields.mount('#tranzila-hosted-fields-container');
      }

      // Handle form submission
      const form = document.getElementById('payment-form');
      if (form) {
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          
          try {
            const result = await tranzilaFields.createToken();
            if (result && result.token) {
              onSuccess(result.token);
            } else {
              onError('Payment processing failed. Please try again.');
            }
          } catch (error) {
            if (error instanceof Error) {
              onError(error.message);
            } else {
              onError('Payment processing failed. Please try again.');
            }
          }
        });
      }
    }
  };

  return (
    <div>
      <form id="payment-form" className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
            מספר כרטיס
          </label>
          <div id="tranzila-hosted-fields-container" className="p-3 border border-gray-300 rounded-md">
            {/* Tranzila will inject secure fields here */}
            <div id="card-number" className="h-10"></div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                  תוקף
                </label>
                <div id="expiry" className="h-10 mt-1"></div>
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                  CVV
                </label>
                <div id="cvv" className="h-10 mt-1"></div>
              </div>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-large"
        >
          Continue to Payment →
        </button>
      </form>
      
      {/* Security badges */}
      <div className="mt-6 flex flex-col items-center space-y-3">
        <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg w-full">
          <div className="text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">מאובטח בתקן PCI-DSS</p>
            <p className="text-xs text-gray-500">כל הנתונים מוצפנים ומאובטחים</p>
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <div className="h-10 w-16 relative">
            <Image src="/images/visa.png" alt="Visa" width={64} height={40} />
          </div>
          <div className="h-10 w-16 relative">
            <Image src="/images/mastercard.png" alt="Mastercard" width={64} height={40} />
          </div>
          <div className="h-10 w-16 relative">
            <Image src="/images/tranzila-logo.png" alt="Tranzila" width={64} height={40} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1);
  const [useNewAddress, setUseNewAddress] = useState(true);
  
  // Shipping address form state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    isDefault: false
  });
  
  // Customer info for payment
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  // Calculate tax (for example, 10% of the total price)
  const taxRate = 0.10;
  const taxAmount = totalPrice * taxRate;
  const orderTotal = totalPrice + taxAmount;
  
  // Load cart items from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
        
        // Calculate total price
        const total = parsedCart.reduce((sum: number, item: CartItem) => {
          return sum + (item.price * item.quantity);
        }, 0);
        setTotalPrice(total);
        
        // Redirect to cart if cart is empty
        if (parsedCart.length === 0 && typeof window !== 'undefined') {
          router.push('/cart');
          showNotification('Your cart is empty', 'info');
        }
      } else {
        // Redirect to cart if no cart in localStorage
        if (typeof window !== 'undefined') {
          router.push('/cart');
          showNotification('Your cart is empty', 'info');
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      showNotification('Error loading your cart', 'error');
      
      // Redirect to cart on error
      if (typeof window !== 'undefined') {
        router.push('/cart');
      }
    }
  }, [router, showNotification]);
  
  // Fetch user data and saved addresses when component mounts
  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated' && typeof window !== 'undefined') {
      router.push('/login?redirect=/checkout');
    }
  }, [status, router]);
  
  const fetchUserData = async () => {
    try {
      const { data } = await axios.get('/api/users/profile');
      
      // Set customer info
      setCustomerInfo({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
      });
      
      // Initialize shipping address with user data
      setShippingAddress(prev => ({
        ...prev,
        name: data.name || '',
        phone: data.phone || ''
      }));
      
      // Set saved addresses if available
      if (data.shippingAddresses && data.shippingAddresses.length > 0) {
        setSavedAddresses(data.shippingAddresses);
        
        // Find default address
        const defaultIndex = data.shippingAddresses.findIndex((addr: ShippingAddress) => addr.isDefault);
        
        if (defaultIndex >= 0) {
          setSelectedAddressIndex(defaultIndex);
          setUseNewAddress(false);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  const handleShippingAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddressSelection = (index: number) => {
    setSelectedAddressIndex(index);
    setUseNewAddress(false);
  };
  
  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressIndex(-1);
  };
  
  const handleNextStep = async () => {
    if (step === 1) {
      // Validate shipping address
      if (useNewAddress) {
        const { name, addressLine1, city, state, postalCode, country } = shippingAddress;
        if (!name || !addressLine1 || !city || !state || !postalCode || !country) {
          showNotification('Please fill in all required shipping address fields', 'error');
          return;
        }
      } else if (selectedAddressIndex === -1) {
        showNotification('Please select a shipping address', 'error');
        return;
      }
      
      // If using a new address and user is logged in, save it
      if (useNewAddress && session) {
        try {
          setIsLoading(true);
          
          // Validate address data
          const { name, addressLine1, city, state, postalCode, country } = shippingAddress;
          if (!name || !addressLine1 || !city || !state || !postalCode || !country) {
            showNotification('Please fill in all required shipping address fields', 'error');
            setIsLoading(false);
            return;
          }
          
          // Prepare address data
          const addressData = {
            name,
            addressLine1,
            addressLine2: shippingAddress.addressLine2 || '',
            city,
            state,
            postalCode,
            country,
            phone: shippingAddress.phone || '',
            isDefault: savedAddresses.length === 0 // Make it default if it's the first address
          };
          
          console.log('Saving address:', addressData);
          
          // Retry mechanism for saving address
          let retries = 3;
          let success = false;
          let lastError;
          
          while (retries > 0 && !success) {
            try {
              // Send request to save address
              const response = await axios.post('/api/users/addresses', {
                address: addressData
              });
              
              console.log('Address save response:', response.data);
              success = true;
            } catch (error: any) {
              console.error(`Error saving address (retries left: ${retries - 1}):`, error);
              lastError = error;
              retries--;
              
              // Wait a bit before retrying
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
          
          if (success) {
            // Refresh addresses
            await fetchUserData();
            showNotification('Address saved successfully', 'success');
          } else {
            // Handle the error
            const errorMessage = lastError?.response?.data?.message || 'Failed to save address';
            showNotification(errorMessage, 'error');
            setIsLoading(false);
            return; // Don't proceed to next step if address saving failed
          }
        } catch (error: any) {
          console.error('Error in address saving process:', error);
          const errorMessage = error.response?.data?.message || 'Failed to save address';
          showNotification(errorMessage, 'error');
          setIsLoading(false);
          return; // Don't proceed to next step if address saving failed
        } finally {
          setIsLoading(false);
        }
      }
      
      // Move to payment step
      setStep(2);
    }
  };
  
  // Function to clear cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    // Dispatch event to update cart count in header
    window.dispatchEvent(new Event('cartUpdated'));
  };
  
  const handlePaymentSuccess = async (paymentDetails: {
    cardNumber?: string;
    expMonth?: string;
    expYear?: string;
    cvv?: string;
    holderId?: string;
    name: string;
    email: string;
    phone: string;
    paymentMethod: string;
  }) => {
    setIsLoading(true);
    
    try {
      // Get the current shipping address
      const currentShippingAddress = useNewAddress
        ? shippingAddress
        : savedAddresses[selectedAddressIndex];
      
      // Create order data
      const orderData = {
        orderItems: cartItems,
        shippingAddress: currentShippingAddress,
        paymentMethod: paymentDetails.paymentMethod,
        paymentDetails: {
          ...paymentDetails,
          cardholderName: paymentDetails.name,
        },
        itemsPrice: totalPrice,
        shippingPrice: 0,
        taxPrice: taxAmount,
        totalPrice: orderTotal,
      };

      // For redirect-based payment methods, we need to handle differently
      if (['bit', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer'].includes(paymentDetails.paymentMethod)) {
        // Store order data in session storage for retrieval after redirect
        sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
        
        // Get the return URL for the payment
        const returnUrl = `${window.location.origin}/payment-return`;
        
        // Create a payment request to get the redirect URL
        const { data } = await axios.post('/api/payments/create-redirect', {
          amount: orderTotal,
          currency: 'ILS',
          description: `Order from ${currentShippingAddress.name}`,
          paymentMethod: paymentDetails.paymentMethod,
          returnUrl,
          customer: {
            name: paymentDetails.name,
            email: paymentDetails.email,
            phone: paymentDetails.phone,
          },
        });
        
        if (data.redirectUrl) {
          // Redirect to the payment provider
          window.location.href = data.redirectUrl;
          return;
        } else {
          throw new Error('Failed to create payment redirect URL');
        }
      } else {
        // For credit card payments, process normally
        const { data } = await axios.post('/api/orders', orderData);
        
        // Clear cart after successful order
        clearCart();
        
        // Redirect to order confirmation page
        router.push(`/orders/${data._id}`);
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      showNotification(error.response?.data?.message || 'Failed to create order', 'error');
      setIsLoading(false);
    }
  };
  
  const handlePaymentError = (errorMessage: string) => {
    showNotification(errorMessage, 'error');
  };
  
  return (
    <Layout title="Checkout" description="Complete your purchase">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="md:w-2/3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-4">Checkout</h1>
              
              {/* Checkout Steps */}
              <div className="flex mb-8">
                <div className={`flex-1 text-center py-2 ${step >= 1 ? 'bg-primary-main text-white' : 'bg-gray-200'}`}>
                  1. Shipping
                </div>
                <div className={`flex-1 text-center py-2 ${step >= 2 ? 'bg-primary-main text-white' : 'bg-gray-200'}`}>
                  2. Payment
                </div>
              </div>
              
              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Shipping Address</h2>
                  
                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">Saved Addresses</h3>
                        <Link 
                          href="/account?tab=addresses" 
                          className="text-sm text-primary-main dark:text-primary-light hover:underline"
                        >
                          Manage Addresses
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {savedAddresses.map((address, index) => (
                          <div 
                            key={index}
                            className={`border p-3 rounded-md cursor-pointer ${
                              selectedAddressIndex === index && !useNewAddress 
                                ? 'border-primary-main bg-primary-light/10 dark:bg-primary-dark/10' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                            onClick={() => handleAddressSelection(index)}
                          >
                            <div className="flex justify-between">
                              <div className="font-medium text-gray-800 dark:text-white">{address.name}</div>
                              {address.isDefault && (
                                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">Default</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {address.city}, {address.state} {address.postalCode}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">{address.country}</div>
                            {address.phone && <div className="text-sm text-gray-600 dark:text-gray-300">{address.phone}</div>}
                          </div>
                        ))}
                        
                        <button 
                          type="button"
                          className={`w-full border border-dashed p-3 rounded-md text-center ${
                            useNewAddress 
                              ? 'border-primary-main bg-primary-light/10 dark:bg-primary-dark/10 text-primary-main dark:text-primary-light' 
                              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          onClick={handleUseNewAddress}
                        >
                          + Add New Address
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* New Address Form */}
                  {(useNewAddress || savedAddresses.length === 0) && (
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name*
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={shippingAddress.name}
                          onChange={handleShippingAddressChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Address Line 1*
                        </label>
                        <input
                          type="text"
                          id="addressLine1"
                          name="addressLine1"
                          value={shippingAddress.addressLine1}
                          onChange={handleShippingAddressChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          id="addressLine2"
                          name="addressLine2"
                          value={shippingAddress.addressLine2}
                          onChange={handleShippingAddressChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            City*
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={shippingAddress.city}
                            onChange={handleShippingAddressChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            State/Province*
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={shippingAddress.state}
                            onChange={handleShippingAddressChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Postal Code*
                          </label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={shippingAddress.postalCode}
                            onChange={handleShippingAddressChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Country*
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={shippingAddress.country}
                            onChange={handleShippingAddressChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={shippingAddress.phone}
                          onChange={handleShippingAddressChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      </div>
                    </form>
                  )}
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={isLoading}
                      className="w-full bg-primary-main text-white py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : 'Continue to Payment'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Payment Information</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    All transactions are secure and encrypted. Your credit card information is never stored on our servers.
                  </p>
                  
                  <TranzilaPaymentForm
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    customerInfo={customerInfo}
                    returnUrl={`${window.location.origin}/payment-return`}
                  />
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-primary-main dark:text-primary-light hover:underline"
                    >
                      ← Back to Shipping
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="md:w-1/3">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Order Summary</h2>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {cartItems.map((item) => (
                  <div key={item._id} className="py-3 flex items-center">
                    <div className="w-16 h-16 relative flex-shrink-0">
                      <ExternalImage
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover rounded-md"
                        fallbackSrc="/images/placeholder.png"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="text-sm font-medium text-gray-800 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-800 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-800 dark:text-white">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-800 dark:text-white">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-800 dark:text-white">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-800 dark:text-white">Total</span>
                    <span className="text-primary-main">${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href="/cart" className="text-primary-main hover:underline block text-center">
                  Edit Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 