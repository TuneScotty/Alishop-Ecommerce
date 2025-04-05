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

// Simple component that just renders the page with fonts
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

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <NotificationProvider>
          <CartProvider>
            <AdminRouteProtection>
              <CartConsistency>
                <AppContent Component={Component} pageProps={pageProps} />
              </CartConsistency>
            </AdminRouteProtection>
          </CartProvider>
        </NotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 