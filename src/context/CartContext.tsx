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

// Interface for cart data stored in sessionStorage
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

export const useCart = () => useContext(CartContext);

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

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === id 
          ? { ...item, quantity: Math.min(Math.max(1, quantity), item.countInStock) } 
          : item
      )
    );
  };

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