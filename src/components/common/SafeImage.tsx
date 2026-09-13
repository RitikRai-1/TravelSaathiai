import React, { useState } from 'react';

export type ImageCategory = 'hotel' | 'restaurant' | 'food' | 'place' | 'city' | 'taxi' | 'user' | 'gem';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  category?: ImageCategory;
  className?: string;
  aspectRatio?: string;
}

const FALLBACK_IMAGES: Record<ImageCategory, string> = {
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  food: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
  place: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
  city: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
  taxi: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
  user: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  gem: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  category = 'place',
  className = '',
  aspectRatio,
  loading = 'lazy',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || FALLBACK_IMAGES[category]);
  const [hasError, setHasError] = useState(false);

  // Update src if prop changes
  React.useEffect(() => {
    if (src) {
      setImgSrc(src);
      setHasError(false);
    } else {
      setImgSrc(FALLBACK_IMAGES[category]);
    }
  }, [src, category]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_IMAGES[category]);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading={loading}
      onError={handleError}
      className={`transition-opacity duration-300 ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
      {...props}
    />
  );
};

