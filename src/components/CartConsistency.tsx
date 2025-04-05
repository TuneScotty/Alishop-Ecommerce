import { useEffect } from 'react';

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

export default function CartConsistency({ children }: { children: React.ReactNode }) {
  // Ensure cart consistency on initial load
  useEffect(() => {
    ensureCartConsistency();
  }, []);

  return <>{children}</>;
} 