/** Image with lazy loading, a shimmer placeholder, and a branded fallback. */
import { useState } from 'react';
import { placeholderImage } from '../../lib/format';

export default function LazyImage({
  src, alt = '', className = '', wrapperClassName = '', eager = false,
  aspect = 'aspect-[3/4]', objectFit = 'object-cover', fallbackText, ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const finalSrc = failed || !src ? placeholderImage(fallbackText || 'Subham Xerox') : src;

  return (
    <div className={`relative overflow-hidden bg-ink-100 ${aspect} ${wrapperClassName}`}>
      {!loaded && <div className="skeleton absolute inset-0" aria-hidden />}
      <img
        src={finalSrc} alt={alt}
        loading={eager ? 'eager' : 'lazy'} decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => { setFailed(true); setLoaded(true); }}
        className={`h-full w-full ${objectFit} transition-opacity duration-500 ease-premium ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...rest}
      />
    </div>
  );
}
