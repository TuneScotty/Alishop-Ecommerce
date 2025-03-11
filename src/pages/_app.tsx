import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '../context/CartContext';
import { ThemeProvider } from '../context/ThemeContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NotificationProvider } from '../context/NotificationContext';
import connectDB from '../config/database';
import Head from 'next/head';

// Add global type for mongoose
declare global {
  var mongoose: {
    conn: any;
    promise: any;
  };
}

// Load environment variables
if (typeof window === 'undefined') {
  // This only runs on the server side
  try {
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env.local' });
    
    // Ensure database connection on server side only
    connectDB().catch(err => console.error('Failed to connect to MongoDB:', err));
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }
}

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

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Ensure cart consistency on initial load
  useEffect(() => {
    ensureCartConsistency();
  }, []);
  
  // Handle route change loading state
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);
    
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
    
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <SessionProvider session={session}>
      <NotificationProvider>
        <ThemeProvider>
          <CartProvider>
            <Head>
              <link rel="icon" href="/favicon.ico" />
              <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
              <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
              <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
              <link rel="manifest" href="/site.webmanifest" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            {loading ? (
              <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 z-50">
                <div className="text-center">
                  <div className="loading-spinner"></div>
                  <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</p>
                </div>
              </div>
            ) : null}
            <Component {...pageProps} />
          </CartProvider>
        </ThemeProvider>
      </NotificationProvider>
    </SessionProvider>
  );
} 