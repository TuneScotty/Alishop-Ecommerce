// Next.js application root with context providers, font loading, and PWA service worker registration
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '../context/NotificationContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CartProvider } from '../context/CartContext';
import { Playfair_Display, Poppins, Dancing_Script, Montserrat, Raleway, DM_Sans, Inter } from 'next/font/google';
import Head from 'next/head';
import { validateEnv } from '../utils/validateEnv';
import AdminRouteProtection from '../components/AdminRouteProtection';
import CartConsistency from '../components/CartConsistency';
import { useEffect, useState } from 'react';

// Add global type for mongoose
declare global {
  var mongoose: {
    conn: any;
    promise: any;
  };
}

// Load environment variables and validate them
if (typeof window === 'undefined') {
  // This only runs on the server side
  try {
    const dotenv = require('dotenv');
    dotenv.config();
    validateEnv();
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }
}

// Load fonts
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-dancing',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
});

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-raleway',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

/**
 * Simple component wrapper that renders pages with font variables applied
 * @param Component - Next.js page component to render
 * @param pageProps - Props passed to the page component
 * Purpose: Provides basic page rendering with font loading and meta tags
 */
function AppContent({ Component, pageProps }: { Component: any; pageProps: any }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Your one-stop shop for all your needs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${playfairDisplay.variable} ${poppins.variable} ${dancingScript.variable} ${montserrat.variable} ${raleway.variable} ${dmSans.variable} ${inter.variable}`}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

/**
 * Next.js application root with context providers, font loading, and PWA service worker registration
 * @param Component - Next.js page component to render
 * @param pageProps - Props including session data for the page
 * @returns JSX.Element - Complete application with all providers and PWA functionality
 * Purpose: Provides application-wide context providers, font loading, service worker registration,
 * admin route protection, and cart consistency validation for the entire ecommerce application
 */
export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [isStandalone, setIsStandalone] = useState(false);

  // Register service worker and detect standalone mode
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function(registration) {
            console.log('Service Worker registration successful with scope: ', registration.scope);
          },
          function(err) {
            console.log('Service Worker registration failed: ', err);
          }
        );
      });
    }
    
    // Detect if app is in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        // @ts-ignore - Safari specific property
        window.navigator.standalone === true) {
      setIsStandalone(true);
      console.log('App is running in standalone/installed mode');
    }
  }, []);

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <NotificationProvider>
          <CartProvider>
            <div className={`${playfairDisplay.variable} ${poppins.variable} ${dancingScript.variable} ${montserrat.variable} ${raleway.variable} ${dmSans.variable} ${inter.variable}`}>
              <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
              </Head>
              {isStandalone && (
                <div className="bg-green-500 text-white text-center py-1 text-sm">
                  Running as installed app
                </div>
              )}
              <AdminRouteProtection>
                <CartConsistency>
                  <Component {...pageProps} />
                </CartConsistency>
              </AdminRouteProtection>
            </div>
          </CartProvider>
        </NotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 