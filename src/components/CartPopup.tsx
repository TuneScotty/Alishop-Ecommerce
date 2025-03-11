import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import ExternalImage from './ExternalImage';

interface CartPopupProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function CartPopup({ onClose, isOpen }: CartPopupProps) {
  const { cartItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Cart Summary</h2>

        {cartItems.length > 0 ? (
          <>
            <div className="max-h-60 overflow-y-auto mb-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center py-3 border-b border-gray-100 dark:border-gray-700">
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

            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-800 dark:text-white">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="text-gray-800 dark:text-white">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="text-gray-800 dark:text-white">${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="font-bold text-gray-800 dark:text-white">Total</span>
                <span className="font-bold text-primary-main">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <Link 
                href="/cart" 
                className="text-primary-main hover:text-primary-dark transition-colors"
                onClick={onClose}
              >
                Edit Cart
              </Link>
              <Link
                href="/checkout"
                className="bg-primary-main hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
                onClick={onClose}
              >
                Checkout
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <svg
              className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-block bg-primary-main text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
              onClick={onClose}
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
} 