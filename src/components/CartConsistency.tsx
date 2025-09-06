// Cart consistency utility component that validates and cleans localStorage cart data
import { useEffect } from 'react';

/**
 * Validates and cleans cart data in localStorage to prevent corruption
 * Purpose: Removes invalid cart items and ensures data integrity on app initialization
 */
function ensureCartConsistency() {
  try {
    // Get existing cart from localStorage
    const storedCart = localStorage.getItem('cart');
    
    if (storedCart) {
      // Parse the stored cart
      const parsedCart = JSON.parse(storedCart);
      
      // Check if cart has any items
      if (Array.isArray(parsedCart) && parsedCart.length > 0) {
        // Filter out any invalid items
        const cleanedCart = parsedCart.filter((item) => {
          // Skip items with undefined or invalid _id
          if (!item._id || item._id === 'undefined') {
            return false;
          }
          // Ensure all required properties exist
          if (!item.name || !item.price || !item.quantity) {
            return false;
          }
          return true;
        });
        
        // Save cleaned cart back to localStorage
        localStorage.setItem('cart', JSON.stringify(cleanedCart));
      }
    } else {
      // Initialize empty cart if none exists
      localStorage.setItem('cart', '[]');
    }
  } catch (error) {
    // If there's an error, reset the cart
    localStorage.setItem('cart', '[]');
    console.error('Error ensuring cart consistency:', error);
  }
}

/**
 * Cart consistency utility component that validates and cleans localStorage cart data
 * @param children - React components to render after cart validation
 * @returns JSX.Element - Renders children after ensuring cart data integrity
 * Purpose: Wrapper component that validates cart data on mount to prevent issues
 * with corrupted or invalid cart items in localStorage
 */
export default function CartConsistency({ children }: { children: React.ReactNode }) {
  // Ensure cart consistency on initial load
  useEffect(() => {
    ensureCartConsistency();
  }, []);

  return <>{children}</>;
} 