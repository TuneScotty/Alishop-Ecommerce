import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

interface CartSummaryProps {
  onClose?: () => void;
}

export default function CartSummary({ onClose }: CartSummaryProps) {
  const { cartItems, totalPrice } = useCart();
  
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 'Free';
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
      {cartItems.length > 0 && (
        <>
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 relative flex-shrink-0 mr-4">
              <Image
                src={cartItems[0].image}
                alt={cartItems[0].name}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300">Qty: {cartItems[0].quantity}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-800 dark:text-white font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <span className="text-gray-800 dark:text-white font-medium">{shipping}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="text-gray-800 dark:text-white font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <span className="text-gray-800 dark:text-white font-bold">Total</span>
              <span className="text-primary-main font-bold">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <Link 
              href="/cart" 
              className="text-primary-main hover:text-primary-dark transition-colors"
            >
              Edit Cart
            </Link>
            <Link
              href="/checkout"
              className="bg-primary-main hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
            >
              Checkout
            </Link>
          </div>
        </>
      )}

      {cartItems.length === 0 && (
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
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
} 