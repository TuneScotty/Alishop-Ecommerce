// External image component with fallback handling for external URLs and error recovery
import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface ExternalImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

/**
 * External image component with fallback handling for external URLs and error recovery
 * @param src - Image source URL (can be external or internal)
 * @param fallbackSrc - Fallback image path when original fails to load
 * @param alt - Alternative text for accessibility
 * @param props - Additional Next.js Image component props
 * @returns JSX.Element - Image component with error handling and external URL optimization
 * Purpose: Handles external images with fallback support and automatic optimization detection
 */
export default function ExternalImage({
  src,
  fallbackSrc = '/images/placeholder.png',
  alt,
  ...props
}: ExternalImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  /**
   * Handles image loading errors by switching to fallback source
   * Purpose: Provides graceful degradation when images fail to load
   */
  const handleError = () => {
    if (!error) {
      setImgSrc(fallbackSrc);
      setError(true);
    }
  };

  // For external URLs, use unoptimized images
  const isExternal = imgSrc.startsWith('http') || imgSrc.startsWith('https');
  
  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || 'Image'}
      onError={handleError}
      unoptimized={isExternal}
    />
  );
} 