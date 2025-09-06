// Shopping cart context provider with localStorage persistence and cart management functionality
import React, { createContext, useContext, useState, useEffect } from 'react';
import { IProduct } from '../models/Product';
import axios from 'axios';

export interface CartItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  countInStock: number;
  aliExpressProductId?: string;
  variant?: string;
}

export interface SimpleCartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface StoredCartItem {
  productId: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cart: SimpleCartItem[]; // Simplified cart items for easier use in components
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalPrice: 0,
  totalItems: 0,
});

/**
 * Custom hook to access cart context functionality
 * @returns CartContextType - Cart state and methods for cart operations
 * Purpose: Provides easy access to cart context throughout the application
 */
export const useCart = () => useContext(CartContext);

/**
 * Cart context provider component that manages shopping cart state and operations
 * @param children - React child components that will have access to cart context
 * Purpose: Provides cart functionality including add/remove items, quantity updates, localStorage persistence,
 * and cart totals calculation for the entire application
 */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      setIsInitialized(true);
    }
  }, []);

  // Update localStorage whenever cart changes
  useEffect(() => {
    // Only update localStorage after initial load to prevent unnecessary operations
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // Calculate totals
      const itemsTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setTotalPrice(itemsTotal);
      
      const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
      setTotalItems(itemsCount);
      
      // Dispatch event for other components to listen to
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cartItems, isInitialized]);

  /**
   * Adds product to cart or updates quantity if already exists
   * @param product - Product object containing product details
   * @param quantity - Number of items to add to cart
   * Purpose: Handles adding products to cart with stock validation and quantity updates
   */
  const addToCart = (product: any, quantity: number) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item._id === product._id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        // Ensure quantity doesn't exceed available stock
        updatedItems[existingItemIndex].quantity = Math.min(
          newQuantity, 
          product.countInStock || 99
        );
        
        return updatedItems;
      } else {
        // Add new item to cart
        return [...prevItems, {
          _id: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: Math.min(quantity, product.countInStock || 99),
          countInStock: product.countInStock || 99,
          aliExpressProductId: product.aliExpressProductId,
          variant: product.variant,
        }];
      }
    });
  };

  /**
   * Removes product from cart by product ID
   * @param id - Product ID to remove from cart
   * Purpose: Completely removes item from cart and syncs with sessionStorage for legacy compatibility
   */
  const removeFromCart = (id: string) => {
    setCartItems(prevItems => {
      const updated = prevItems.filter(item => item._id !== id);
      // Sync with sessionStorage to keep legacy pages consistent
      if (typeof window !== 'undefined') {
        try {
          const sessionCart = JSON.parse(sessionStorage.getItem('cart') || '[]');
          const filtered = sessionCart.filter((it: any) => (it._id || it.product?._id) !== id);
          sessionStorage.setItem('cart', JSON.stringify(filtered));
        } catch (e) {
          console.error('Failed to sync sessionStorage cart', e);
        }
      }
      return updated;
    });
  };

  /**
   * Updates quantity of specific cart item with stock validation
   * @param id - Product ID to update quantity for
   * @param quantity - New quantity value (min 1, max countInStock)
   * Purpose: Modifies item quantity while ensuring it stays within valid bounds
   */
  const updateQuantity = (id: string, quantity: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === id 
          ? { ...item, quantity: Math.min(Math.max(1, quantity), item.countInStock) } 
          : item
      )
    );
  };

  /**
   * Clears all items from cart and removes localStorage data
   * Purpose: Empties cart completely for logout or order completion scenarios
   */
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  // Create simplified cart items
  const cart: SimpleCartItem[] = cartItems.map(item => ({
    _id: item._id,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: item.quantity
  }));
  
  return (
    <CartContext.Provider value={{
      cartItems,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalPrice,
      totalItems,
    }}>
      {children}
    </CartContext.Provider>
  );
}; 