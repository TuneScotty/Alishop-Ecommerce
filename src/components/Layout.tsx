import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { isAdmin } from '../utils/clientAuth';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children, title = 'AliShop', description = 'Premium shopping experience' }: LayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const router = useRouter();
  const { data: session } = useSession();
  
  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItemCount(cart.length);
      } catch (error) {
        console.error('Error reading cart from localStorage:', error);
        setCartItemCount(0);
      }
    };
    
    // Update on mount
    updateCartCount();
    
    // Update on storage change
    window.addEventListener('storage', updateCartCount);
    
    // Custom event for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);
  
  // Handle scroll for header transparency
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = typeof window !== 'undefined' ? window.pageYOffset || document.documentElement.scrollTop : 0;
      if (scrollPosition > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Navigation items
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
  ];

  // Add Admin link for admin users
  if (session && isAdmin(session)) {
    navItems.push({ name: 'Admin', href: '/admin' });
  }
  
  // Function to handle logout and clear cart
  const handleLogout = () => {
    // Clear cart from localStorage
    localStorage.removeItem('cart');
    // Dispatch event to notify cart components
    window.dispatchEvent(new Event('cartUpdated'));
    // Sign out
    signOut();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-gradient-to-r from-primary-main to-secondary-main py-2 shadow-lg' 
            : 'bg-gradient-to-r from-primary-dark/90 to-secondary-dark/90 backdrop-blur-md py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <span className="text-3xl font-bold text-white font-['Dancing_Script'] transition-all duration-300 group-hover:scale-110 group-hover:text-secondary-light">
                Ali<span className="text-accent-amber">Shop</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link 
                  href={item.href} 
                  key={item.name}
                  className={`relative font-medium text-lg transition-all duration-300 text-white hover:text-accent-amber group overflow-hidden ${
                    router.pathname === item.href ? 'font-bold' : ''
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-accent-amber transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${
                    router.pathname === item.href ? 'scale-x-100' : ''
                  }`}></span>
                </Link>
              ))}
            </nav>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search Button */}
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-full transition-all duration-300 text-white hover:text-accent-amber hover:scale-110"
                aria-label="Search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {/* Cart Button */}
              <Link 
                href="/cart"
                className="p-2 rounded-full transition-colors text-white hover:text-accent-amber hover:scale-110 relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-amber text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              
              {/* Account Button */}
              {session ? (
                <div className="relative group">
                  <button 
                    className="p-2 rounded-full transition-all duration-300 text-white hover:text-accent-amber"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20 transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 origin-top-right">
                    <div className="py-1">
                      <Link 
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        My Account
                      </Link>
                      <Link 
                        href="/account?tab=preferences"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Preferences
                      </Link>
                      <button 
                        onClick={() => handleLogout()}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  href="/login"
                  className="font-medium transition-all duration-300 text-white hover:text-accent-amber px-4 py-2 rounded-full border border-white/30 hover:border-accent-amber hover:shadow-glow"
                >
                  Login
                </Link>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-3">
              <Link 
                href="/cart"
                className="p-2 rounded-full transition-colors text-white relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-amber text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-full transition-all duration-300 text-white hover:text-accent-amber"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`transition-all duration-500 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="container mx-auto px-4 py-4 bg-gradient-to-b from-primary-dark to-secondary-dark">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link 
                  href={item.href} 
                  key={item.name}
                  className="block py-3 text-white hover:text-accent-amber transition-colors duration-300 text-lg font-medium border-b border-white/10"
                >
                  {item.name}
                </Link>
              ))}
              {session ? (
                <>
                  <Link 
                    href="/account"
                    className="block py-3 text-white hover:text-accent-amber transition-colors duration-300 text-lg font-medium border-b border-white/10"
                  >
                    My Account
                  </Link>
                  <Link 
                    href="/account?tab=preferences"
                    className="block py-3 text-white hover:text-accent-amber transition-colors duration-300 text-lg font-medium border-b border-white/10"
                  >
                    Preferences
                  </Link>
                  <button 
                    onClick={() => handleLogout()}
                    className="block w-full text-left py-3 text-red-400 hover:text-red-300 transition-colors duration-300 text-lg font-medium border-b border-white/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  href="/login"
                  className="block py-3 text-white hover:text-accent-amber transition-colors duration-300 text-lg font-medium border-b border-white/10"
                >
                  Login / Register
                </Link>
              )}
            </nav>
          </div>
        </div>
        
        {/* Search Overlay */}
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-all duration-500 flex items-start pt-20 ${
          isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          <div className="container mx-auto px-4 py-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-6 py-4 pr-12 rounded-lg border-2 border-accent-amber focus:outline-none focus:ring-2 focus:ring-accent-amber bg-black/50 text-white text-lg"
                autoFocus={isSearchOpen}
              />
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-accent-amber">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-accent-amber transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-neutral-900 text-white">
        {/* Main Footer - Simplified */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <h4 className="text-xl font-bold mb-4">AliShop</h4>
              <p className="text-white/60 mb-6">
                Premium Shopping Experience.
              </p>
              <div className="flex space-x-4 justify-center">
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm3.8 7.5c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25-1.25-.56-1.25-1.25.56-1.25 1.25-1.25zM12 7.5c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 7.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="text-xl font-bold mb-4">Quick Links</h4>
              <div className="flex flex-col space-y-2 items-center">
                <Link href="/products" className="text-white/60 hover:text-white transition-colors">
                  Products
                </Link>
                <Link href="/contact" className="text-white/60 hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-xl font-bold mb-4">More Information</h4>
              <div className="flex flex-col space-y-2 items-center">
                <Link href="/about" className="text-white/60 hover:text-white transition-colors">
                  About Us
                </Link>
                <Link href="/privacy-policy" className="text-white/60 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-white/10 text-center text-white/60 max-w-5xl mx-auto">
            <p>&copy; {new Date().getFullYear()} AliShop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 