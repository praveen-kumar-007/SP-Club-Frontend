import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * OptimizedImage Component
 * - Lazy loads images
 * - Shows placeholder while loading
 * - Optimizes performance with native lazy loading
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Generate WebP version if not already WebP
  const getImageSrc = (imgSrc: string) => {
    if (imgSrc.endsWith('.webp')) return imgSrc;
    // For now, return original, but set up for future WebP conversion
    return imgSrc;
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder background while loading */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}
      
      <img
        src={getImageSrc(src)}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {error && (
        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-600">
          Image failed to load
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
