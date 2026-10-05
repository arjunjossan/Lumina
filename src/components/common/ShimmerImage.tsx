import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ShimmerImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  containerClassName?: string;
  aspectRatioClassName?: string;
  fallbackSrc?: string;
  showIconPlaceholder?: boolean;
}

export const ShimmerImage: React.FC<ShimmerImageProps> = ({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  aspectRatioClassName = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  showIconPlaceholder = true,
  loading = 'lazy',
  onLoad,
  onError,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // When src changes, reset loading and error state
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    
    // Check if the image is already cached and loaded by the browser
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      if (onError) {
        onError(e);
      }
    }
  };

  const currentSrc = hasError ? fallbackSrc : (src || fallbackSrc);

  return (
    <div 
      className={`relative overflow-hidden bg-slate-100 ${aspectRatioClassName} ${containerClassName}`}
    >
      {/* Shimmer / Skeleton Placeholder */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 z-0 bg-slate-200/80 shimmer-effect flex items-center justify-center select-none"
          aria-hidden="true"
        >
          {showIconPlaceholder && (
            <div className="flex flex-col items-center justify-center text-slate-400/80">
              <ImageIcon className="w-8 h-8 opacity-40 animate-pulse" />
            </div>
          )}
        </div>
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-opacity duration-300 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...rest}
      />
    </div>
  );
};
