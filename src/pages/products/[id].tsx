import { GetServerSideProps } from 'next';
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { IProduct } from '../../models/Product';
import { useNotification } from '../../context/NotificationContext';
import ExternalImage from '../../components/ExternalImage';
import connectDB from '../../lib/dbConnect';
import Product from '../../models/Product';

interface ProductDetailProps {
  product: IProduct | null;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { showNotification } = useNotification();
  
  // If product is null, show loading state or redirect
  if (!product) {
    return (
      <Layout title="Product Not Found" description="The requested product could not be found">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="mb-8">The product you are looking for could not be found or has been removed.</p>
            <Link href="/products" className="bg-primary-main text-white px-6 py-3 rounded-md hover:bg-primary-dark transition duration-300">
              Browse Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Combine images and videos for the carousel
  const mediaItems = [
    ...(product.images || []),
    ...(product.aliExpressData?.videos || [])
  ];
  
  // Check if current slide is a video
  const isCurrentItemVideo = (index: number) => {
    return product.aliExpressData?.videos && 
           product.aliExpressData.videos.includes(mediaItems[index]);
  };
  
  // Handle video play/pause
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle slide navigation
  const goToSlide = (index: number) => {
    // If leaving a video slide, pause the video
    if (isCurrentItemVideo(currentSlide) && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentSlide(index);
  };
  
  const nextSlide = () => {
    goToSlide((currentSlide + 1) % mediaItems.length);
  };
  
  const prevSlide = () => {
    goToSlide((currentSlide - 1 + mediaItems.length) % mediaItems.length);
  };

  const increaseQuantity = () => {
    if (quantity < product.countInStock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const addToCartHandler = () => {
    try {
      if (!product || !product._id) {
        showNotification('Invalid product', 'error');
        return;
      }
      
      // Get existing cart from localStorage or initialize empty array
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Check if product already exists in cart
      const existingItemIndex = existingCart.findIndex(
        (item: any) => item.product && item.product._id === product._id
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        existingCart[existingItemIndex].quantity = (existingCart[existingItemIndex].quantity || existingCart[existingItemIndex].qty || 0) + quantity;
        showNotification(`Updated quantity in cart (${existingCart[existingItemIndex].quantity}x)`, 'success');
      } else {
        // Add new item to cart
        existingCart.push({
          product: product,
          quantity: quantity
        });
        showNotification(`${product.name} added to cart`, 'success');
      }
      
      // Save updated cart to localStorage
      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Failed to add item to cart', 'error');
    }
  };

  return (
    <Layout title={`AliShop - ${product.name}`} description={product.description}>
      <div className="container mx-auto px-6 py-8">
        <Link href="/products" className="text-blue-600 hover:text-blue-800 transition duration-300 cursor-pointer">
          Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
          <div>
            {/* Image/Video Carousel */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4 relative hover-card">
              {mediaItems.length > 0 ? (
                <div className="relative h-96">
                  {/* Current Media Item */}
                  {isCurrentItemVideo(currentSlide) ? (
                    <div className="h-full flex items-center justify-center bg-black">
                      <video
                        ref={videoRef}
                        src={mediaItems[currentSlide]}
                        className="max-h-full max-w-full"
                        poster={product.images && product.images.length > 0 ? product.images[0] : ''}
                        onClick={toggleVideo}
                      />
                      {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button 
                            className="bg-black bg-opacity-50 rounded-full p-4 text-white hover:bg-opacity-70 transition-all"
                            onClick={toggleVideo}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <img
                      src={mediaItems[currentSlide]}
                      alt={`${product.name} - Image ${currentSlide + 1}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                  
                  {/* Navigation Arrows */}
                  {mediaItems.length > 1 && (
                    <>
                      <button 
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-all"
                        onClick={prevSlide}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-all"
                        onClick={nextSlide}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* Slide Indicator */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <div className="bg-black bg-opacity-50 rounded-full px-3 py-1 text-white text-sm">
                      {currentSlide + 1} / {mediaItems.length}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-200">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            
            {/* Thumbnail Navigation */}
            {mediaItems.length > 1 && (
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {mediaItems.map((item, index) => (
                  <div 
                    key={index}
                    className={`flex-shrink-0 cursor-pointer border-2 rounded overflow-hidden ${
                      index === currentSlide ? 'border-blue-500' : 'border-gray-200'
                    } hover:border-blue-300 transition-all`}
                    onClick={() => goToSlide(index)}
                  >
                    {isCurrentItemVideo(index) ? (
                      <div className="w-20 h-20 bg-black flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : (
                      <img 
                        src={item} 
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        className="w-20 h-20 object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover-card">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(product.rating) ? 'fill-current' : 'stroke-current'}`}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-gray-600">{product.rating} ({product.numReviews} reviews)</span>
            </div>
            <div className="flex items-center mb-4">
              <span className="text-3xl font-bold text-gray-800 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
              
              {product.aliExpressPrice && product.aliExpressPrice > product.price && (
                <span className="ml-3 text-xl text-gray-500 line-through">
                  ${product.aliExpressPrice.toFixed(2)}
                </span>
              )}
              
              {product.aliExpressPrice && product.aliExpressPrice > product.price && (
                <span className="ml-3 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                  {Math.round(((product.aliExpressPrice - product.price) / product.aliExpressPrice) * 100)}% OFF
                </span>
              )}
            </div>
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Availability</h2>
              <p className={`${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>

            {product.countInStock > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Quantity</h2>
                <div className="flex items-center">
                  <button
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-md hover:bg-gray-300 transition duration-300"
                    onClick={decreaseQuantity}
                  >
                    -
                  </button>
                  <span className="bg-gray-100 text-gray-700 px-4 py-1">{quantity}</span>
                  <button
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-md hover:bg-gray-300 transition duration-300"
                    onClick={increaseQuantity}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              className={`w-full py-3 px-6 rounded-full font-bold text-white ${
                product.countInStock > 0
                  ? 'bg-primary-main hover:bg-primary-dark'
                  : 'bg-gray-400 cursor-not-allowed'
              } transition duration-300`}
              onClick={addToCartHandler}
              disabled={product.countInStock === 0}
            >
              {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg glass-effect">
              <h2 className="text-lg font-bold text-gray-800 mb-2">AliExpress Details</h2>
              {product.aliExpressPrice ? (
                <>
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">Original Price:</span> $
                    {product.aliExpressPrice.toFixed(2)}
                  </p>
                  {product.price > 0 && (
                    <p className="text-gray-700">
                      <span className="font-medium">Savings:</span>{' '}
                      <span className="text-green-600 font-bold">
                        ${(product.aliExpressPrice - product.price).toFixed(2)} (
                        {Math.round((product.aliExpressPrice - product.price) / 
                          product.aliExpressPrice * 100)}
                        %)
                      </span>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-700">Original price information not available</p>
              )}
              {product.aliExpressData?.originalUrl && (
                <p className="mt-2">
                  <a 
                    href={product.aliExpressData.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View on AliExpress
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    if (!params?.id) {
      return {
        props: {
          product: null,
        },
      };
    }

    await connectDB();
    
    let product = null;
    const paramId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    // Try to fetch by ID if it's a valid MongoDB ID
    if (paramId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(paramId).lean();
    }
    
    // If not found by ID, try by slug
    if (!product) {
      product = await Product.findOne({ slug: paramId }).lean();
    }
    
    if (!product) {
      return {
        props: {
          product: null,
        },
      };
    }

    return {
      props: {
        product: JSON.parse(JSON.stringify(product)),
      },
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      props: {
        product: null,
      },
    };
  }
}; 