/** Image with lazy loading, a shimmer placeholder, and a branded fallback. */
import { useState } from 'react';
import { placeholderImage, handleImgError } from '../../lib/format';

export default function LazyImage({
  src, fallbackUrl, alt = '', className = '', wrapperClassName = '', eager = false,
  aspect = 'aspect-[3/4]', objectFit = 'object-cover', fallbackText, onError: customOnError, ...rest
}) {
  const [loaded, setLoaded] = useState(!src);

  if (!src && !fallbackUrl) {
    return <div className={`relative overflow-hidden bg-ink-100/30 ${aspect} ${wrapperClassName}`} />;
  }

  const handleError = (e) => {
    handleImgError(e);
    setLoaded(true);
    if (customOnError) customOnError(e);
  };

  return (
    <div className={`relative overflow-hidden bg-ink-100 ${aspect} ${wrapperClassName}`}>
      {!loaded && <div className="skeleton absolute inset-0" aria-hidden />}
      <img
        src={src || fallbackUrl}
        data-fallback-url={fallbackUrl || undefined}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'} decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`h-full w-full ${objectFit} transition-opacity duration-500 ease-premium ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...rest}
      />
    </div>
  );
}
