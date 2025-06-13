import { useState, useEffect, useRef } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import Layout from '../components/Layout';
import { IProduct } from '../models/Product';
import { useNotification } from '../context/NotificationContext';
import theme from '../styles/theme';
import ProductCard from '../components/ProductCard';
import connectDB from '../lib/dbConnect';
import Product from '../models/Product';

interface HomeProps {
  featuredProducts: IProduct[];
  newArrivals: IProduct[];
  trendingProducts: IProduct[];
}

export default function Home({ featuredProducts = [], newArrivals = [], trendingProducts = [] }: HomeProps) {
  const { showNotification } = useNotification();
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  
  // Ensure all product arrays are valid
  const safeNewArrivals = Array.isArray(newArrivals) ? newArrivals : [];
  const safeFeaturedProducts = Array.isArray(featuredProducts) ? featuredProducts : [];
  const safeTrendingProducts = Array.isArray(trendingProducts) ? trendingProducts : [];
  
  // Parallax effect for hero section
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollPosition = typeof window !== 'undefined' ? window.pageYOffset || document.documentElement.scrollTop : 0;
        heroRef.current.style.transform = `translateY(${scrollPosition * 0.5}px)`;
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Staggered animation on load
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Add to cart handler
  const addToCart = (product: IProduct) => {
    try {
      if (!product || !product._id) {
        showNotification('Invalid product', 'error');
        return;
      }
      
      // Get existing cart from sessionStorage or initialize empty array
      const existingCart = JSON.parse(sessionStorage.getItem('cart') || '[]');
      
      // Check if product already exists in cart
      const existingItemIndex = existingCart.findIndex(
        (item: any) => item.product && item.product._id === product._id
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        existingCart[existingItemIndex].quantity = (existingCart[existingItemIndex].quantity || existingCart[existingItemIndex].qty || 0) + 1;
      } else {
        // Add new item to cart
        existingCart.push({
          product: product,
          quantity: 1
        });
      }
      
      // Save updated cart to sessionStorage
      sessionStorage.setItem('cart', JSON.stringify(existingCart));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show notification only once
      showNotification(`${product.name} added to cart`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Failed to add item to cart', 'error');
    }
  };
  
  return (
    <Layout title="AliShop - Luxury Shopping Experience" description="Discover premium products at amazing prices">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen overflow-hidden hero-section">
        {/* Background Gradient instead of missing image */}
        <div ref={heroRef} className="absolute inset-0 z-0 bg-gradient-to-br from-neutral-900 via-primary-dark to-secondary-dark">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary-light blur-xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary-light blur-xl"></div>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-white px-4">
          <div className={`text-center transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="hero-title">
              <span className="block">Discover Luxury</span>
              <span className="block bg-primary-dark/90 px-6 py-3 mt-4 rounded-lg inline-block">Without Compromise</span>
            </h1>
            <p className="hero-subtitle">
              Curated collections of premium products at prices that will surprise you.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="/products" className="btn btn-primary btn-large">
                Shop Now
              </a>
              <a href="/products" className="btn btn-secondary btn-large">
                View Collections
              </a>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>
      
      {/* New Arrivals */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-16">
            <div>
              <span className="accent-text text-primary-main dark:text-primary-light">Fresh & New</span>
              <h2 className="section-title text-gray-800 dark:text-white">New Arrivals</h2>
            </div>
            <a href="/products" className="text-primary-main dark:text-primary-light font-medium text-lg hover:underline">
              View All
              <svg className="w-5 h-5 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
          
          {safeNewArrivals.filter(product => product && product._id).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-fade-in">
              {safeNewArrivals.filter(product => product && product._id).map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-neutral-50 dark:bg-gray-800 rounded-lg">
              <svg className="w-16 h-16 text-neutral-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <p className="text-neutral-500 dark:text-gray-400">No new products available at the moment.</p>
              <Link href="/products" className="inline-block mt-4 px-6 py-2 bg-primary-main text-white rounded-full">
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* Trending Products with 3D Effect */}
      <section ref={trendingRef} className="py-16 px-4 bg-gradient-to-r from-neutral-800 to-neutral-900 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="accent-text text-white">Hot Right Now</span>
            <h2 className="section-title text-white">Trending Products</h2>
            <p className="text-white max-w-2xl mx-auto">
              Discover what's popular among our shoppers right now.
            </p>
          </div>
          
          {safeTrendingProducts.filter(product => product && product._id).length > 0 ? (
            <div className="flex overflow-x-auto pb-8 space-x-6 no-scrollbar scroll-snap-x">
              {safeTrendingProducts.filter(product => product && product._id).map((product) => (
                <div 
                  key={product._id} 
                  className="flex-shrink-0 w-64 md:w-72 scroll-snap-center card"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <a href={`/products/${product._id}`} className="block">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-secondary-light to-secondary-dark flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">
                            {product.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </a>
                    <div className="absolute top-2 right-2">
                      <span className="bg-secondary-main text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        TRENDING
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <a href={`/products/${product._id}`} className="block">
                      <h3 className="text-lg font-semibold mb-1 line-clamp-1">{product.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-primary-main">${product.price.toFixed(2)}</span>
                        <button
                          onClick={() => addToCart(product)}
                          className="btn btn-primary text-sm px-3 py-1"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-lg">
              <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-white/80">No trending products available at the moment.</p>
              <Link href="/products" className="inline-block mt-4 px-6 py-2 bg-white text-primary-dark rounded-full font-medium">
                View All Trending
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 px-4 bg-neutral-50 dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <span className="accent-text text-2xl text-primary-main dark:text-primary-light">Handpicked</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">Featured Products</h2>
            <p className="text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our selection of premium products curated just for you.
            </p>
          </div>
          
          {safeFeaturedProducts.filter(product => product && product._id).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {safeFeaturedProducts.filter(product => product && product._id).map((product) => (
                <div key={product._id} className="group">
                  <div className="relative overflow-hidden rounded-lg shadow-lg">
                    <Link href={`/products/${product._id}`}>
                      <div className="aspect-video">
                        {product.images && product.images[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center">
                            <span className="text-4xl font-bold text-white">
                              {product.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                        <p className="text-white/80 mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-white font-bold text-xl">${product.price.toFixed(2)}</span>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="bg-primary-main text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-colors duration-300"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-700 rounded-lg shadow-soft">
              <svg className="w-16 h-16 text-neutral-300 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p className="text-neutral-500 dark:text-gray-300">No featured products available at the moment.</p>
              <Link href="/products" className="inline-block mt-4 px-6 py-2 bg-primary-main text-white rounded-full">
                Browse All Products
              </Link>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/products" className="inline-block bg-gradient-blue text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition-all duration-300">
              View All Products
            </Link>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <span className="accent-text text-2xl text-primary-main dark:text-primary-light">Stay Updated</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">Join Our Newsletter</h2>
            <p className="text-neutral-600 dark:text-gray-300 mb-8">
              Subscribe to our newsletter and be the first to know about new products, exclusive offers, and more.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-full border border-neutral-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-main dark:bg-gray-800 dark:text-white"
                required
              />
              <button
                type="submit"
                className="bg-gradient-blue text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  showNotification('Thank you for subscribing to our newsletter!', 'success');
                }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-neutral-50 dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-soft hover-card">
              <div className="w-16 h-16 bg-primary-light/10 dark:bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-main dark:text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Free Shipping</h3>
              <p className="text-neutral-600 dark:text-gray-300">
                Free shipping on all orders over $50. International shipping available.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-soft hover-card">
              <div className="w-16 h-16 bg-primary-light/10 dark:bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-main dark:text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Secure Payments</h3>
              <p className="text-neutral-600 dark:text-gray-300">
                All payments are processed securely through our payment gateway.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-soft hover-card">
              <div className="w-16 h-16 bg-primary-light/10 dark:bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-main dark:text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Easy Returns</h3>
              <p className="text-neutral-600 dark:text-gray-300">
                30-day return policy for all products. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Add a timeout to the MongoDB connection
    const connectionPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('MongoDB connection timeout')), 5000);
    });

    await Promise.race([connectionPromise, timeoutPromise]);
    
    // Get featured products directly from the database
    const featuredProducts = await Product.find({ featured: true })
      .limit(8)
      .lean()
      .exec();
    
    // Get new arrivals (most recent products)
    const newArrivals = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .lean()
      .exec();
    
    // Get trending products (you could modify this logic based on your needs)
    // For now, we'll just get products with highest ratings
    const trendingProducts = await Product.find({})
      .sort({ rating: -1 })
      .limit(8)
      .lean()
      .exec();

    return {
      props: {
        featuredProducts: JSON.parse(JSON.stringify(featuredProducts || [])),
        newArrivals: JSON.parse(JSON.stringify(newArrivals || [])),
        trendingProducts: JSON.parse(JSON.stringify(trendingProducts || []))
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty arrays for all products if there's an error
    return {
      props: {
        featuredProducts: [],
        newArrivals: [],
        trendingProducts: []
      }
    };
  }
}; 