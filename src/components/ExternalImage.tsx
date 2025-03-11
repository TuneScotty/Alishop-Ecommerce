import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface ExternalImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

export default function ExternalImage({
  src,
  fallbackSrc = '/images/placeholder.png',
  alt,
  ...props
}: ExternalImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

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