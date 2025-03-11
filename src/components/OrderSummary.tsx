import React from 'react';
import Link from 'next/link';
import { CartItem } from '../context/CartContext';

interface OrderSummaryProps {
  cartItems: CartItem[];
  showCheckoutButton?: boolean;
  showEditButton?: boolean;
}

export default function OrderSummary({ 
  cartItems, 
  showCheckoutButton = true,
  showEditButton = false 
}: OrderSummaryProps) {
  
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateShipping = () => {
    return cartItems.length > 0 ? 0 : 0; // Free shipping
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Order Summary</h2>
      <div className="space-y-3">
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
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-800 dark:text-white">Total</span>
            <span className="text-xl text-gray-800 dark:text-white">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 space-y-3">
        {showCheckoutButton && (
          <Link
            href="/checkout"
            className="block w-full text-center bg-primary-main text-white px-4 py-3 rounded-md hover:bg-primary-dark transition-colors duration-300"
          >
            Proceed to Checkout
          </Link>
        )}
        
        {showEditButton && (
          <Link
            href="/cart"
            className="block w-full text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            Edit Cart
          </Link>
        )}
      </div>
    </div>
  );
} 