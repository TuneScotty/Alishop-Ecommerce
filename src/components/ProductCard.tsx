// Product card component with image carousel, cart integration, and discount display
import Link from 'next/link';
import { useState } from 'react';
import { IProduct } from '../models/Product';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import ExternalImage from './ExternalImage';
import CartPopup from './CartPopup';

interface ProductCardProps {
  product: IProduct;
  onAddToCart?: (product: IProduct) => void;
}

/**
 * Product card component with image carousel, cart integration, and discount display
 * @param product - Product object containing all product details and metadata
 * @param onAddToCart - Optional callback function triggered when product is added to cart
 * @returns JSX.Element - Interactive product card with hover effects, image rotation, and cart functionality
 * Purpose: Displays product information in a card format with add-to-cart functionality,
 * image carousel, discount badges, stock status, and responsive design
 */
export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  
  /**
   * Rotates through product images in carousel fashion
   * Purpose: Cycles through available product images to show different views
   */
  const rotateImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  // Get current image to display
  const currentImage = product.images && product.images.length > 0 
    ? product.images[currentImageIndex] 
    : null;
  
  // Indicator if product has video
  const hasVideo = product.aliExpressData?.videos && product.aliExpressData.videos.length > 0;
  
  /**
   * Handles adding product to cart with popup notification
   * Purpose: Adds product to cart context, shows confirmation popup, and triggers optional callback
   */
  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      name: product.name,
      image: product.images[currentImageIndex],
      price: product.price,
      countInStock: product.countInStock,
    }, 1);
    
    setShowCartPopup(true);
    
    // Also call the onAddToCart prop if provided
    if (onAddToCart) {
      onAddToCart(product);
    }
  };
  
  const discount = product.aliExpressPrice 
    ? Math.round(((product.aliExpressPrice - product.price) / product.aliExpressPrice) * 100) 
    : 0;

  return (
    <>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 h-full flex flex-col relative hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm">
            {discount}% OFF
          </div>
        )}
        
        <Link 
          href={`/products/${product._id}`} 
          className="block relative pt-[100%] overflow-hidden"
        >
          <ExternalImage
            src={product.images && product.images.length > 0 
              ? product.images[currentImageIndex] 
              : '/images/placeholder.png'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className={`object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            priority={false}
            fallbackSrc="/images/placeholder.png"
          />
        </Link>
        
        <div className="p-5 flex-grow flex flex-col">
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 line-clamp-2 hover:text-primary-main transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 line-clamp-2 flex-grow">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  ${product.aliExpressPrice == 0 ? (product.price * 1.5).toFixed(2) : product.aliExpressPrice}
                </span>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                product.countInStock === 0
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-primary-main hover:bg-primary-dark text-white'
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Cart Popup */}
      <CartPopup isOpen={showCartPopup} onClose={() => setShowCartPopup(false)} />
    </>
  );
} 