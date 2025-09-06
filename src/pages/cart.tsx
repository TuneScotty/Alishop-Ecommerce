// Shopping cart page with item management and checkout integration
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { CartItem } from '../context/CartContext';
import ExternalImage from '../components/ExternalImage';
import OrderSummary from '../components/OrderSummary';
import React from 'react';

/**
 * Shopping cart page with item management and checkout integration
 * @returns JSX.Element - Cart page with item list, quantity controls, and order summary
 * Purpose: Displays cart contents with quantity management, item removal, and checkout navigation
 */
export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart items from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart).map((it: any) => ({ ...it, price: Number(it.price) || 0 }));
        setCartItems(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Removes item from cart and updates localStorage
   * @param id - Product ID to remove from cart
   * Purpose: Handles item removal with cart synchronization
   */
  const removeFromCart = (id: string) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  /**
   * Updates item quantity with stock validation
   * @param id - Product ID to update
   * @param quantity - New quantity value
   * Purpose: Manages quantity changes with stock limits and cart synchronization
   */
  const updateQuantity = (id: string, quantity: number) => {
    const updatedCart = cartItems.map((item) =>
      item._id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.countInStock)) } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <Layout title="Your Cart" description="View and manage your shopping cart">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Your Shopping Cart</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
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
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-block bg-primary-main text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors duration-300"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cartItems.map((item) => (
                    <div key={item._id} className="p-6 flex items-center">
                      <div className="w-24 h-24 relative flex-shrink-0">
                        <ExternalImage
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover rounded-md"
                          fallbackSrc="/images/placeholder.png"
                        />
                      </div>
                      <div className="ml-6 flex-grow">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                          {item.name}
                        </h3>
                        <div className="mt-2 flex items-center">
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="px-3 py-1 border-r border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-4 py-1 text-gray-800 dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="px-3 py-1 border-l border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                              disabled={item.quantity >= item.countInStock}
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="ml-4 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-800 dark:text-white">
                          {((Number(item.price) || 0) * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(Number(item.price) || 0).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <OrderSummary cartItems={cartItems} showCheckoutButton={true} showEditButton={false} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 