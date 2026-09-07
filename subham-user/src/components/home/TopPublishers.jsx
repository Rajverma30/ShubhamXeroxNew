/**
 * Top Publishers & Categories component (Light Theme).
 * Features a clean light gradient background container, circular badge icons with crisp borders,
 * uppercase dark labels underneath, and left/right navigation arrows.
 * Placed directly below the "Trending this week" section on the homepage.
 */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useStore } from '../../context/StoreContext';
import { imgUrl } from '../../lib/format';

export default function TopPublishers({ items: propItems, title = 'Top Publishers & Categories' }) {
  const { categories } = useStore();
  const scrollRef = useRef(null);

  // Derive items from subcategories and categories if not passed explicitly
  const items = propItems || categories.flatMap((cat) => {
    const list = [];
    if (cat.image?.url || cat.name) {
      list.push({
        id: cat._id,
        name: cat.name,
        image: cat.image,
        to: `/category/${cat.slug}`,
      });
    }
    if (cat.subCategories?.length) {
      cat.subCategories.forEach((sub) => {
        list.push({
          id: sub._id,
          name: sub.name,
          image: sub.image,
          to: `/collection/${sub.slug}`,
        });
      });
    }
    return list;
  });

  if (!items || items.length === 0) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="my-8 overflow-hidden rounded-3xl border border-ink-100/80 bg-gradient-to-b from-ink-50/90 via-white to-ink-50/50 p-6 text-ink-900 shadow-soft sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="w-full text-center font-display text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl lg:text-3xl">
          {title}
        </h2>
      </div>

      <div className="group relative">
        {/* Navigation Buttons */}
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 bg-white/95 text-ink-700 shadow-md backdrop-blur-md transition-all hover:border-brand-300 hover:bg-white hover:text-brand-600 hover:scale-110 active:scale-95 disabled:opacity-0"
        >
          <FiChevronLeft size={22} />
        </button>

        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 bg-white/95 text-ink-700 shadow-md backdrop-blur-md transition-all hover:border-brand-300 hover:bg-white hover:text-brand-600 hover:scale-110 active:scale-95 disabled:opacity-0"
        >
          <FiChevronRight size={22} />
        </button>

        {/* Circular Items Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto py-3 sm:gap-6 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {items.map((item, idx) => {
            const imageUrl = item.image?.url ? imgUrl(item.image, 'thumb') : null;
            const initials = item.name
              ? item.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'PX';

            return (
              <Link
                key={item.id || idx}
                to={item.to || `/shop?search=${encodeURIComponent(item.name)}`}
                className="group/item flex w-24 shrink-0 flex-col items-center gap-2.5 text-center snap-start sm:w-28"
              >
                {/* Circular Badge Ring (Light Theme) */}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-ink-200 bg-white p-1 shadow-soft transition-all duration-300 group-hover/item:-translate-y-1 group-hover/item:border-brand-500 group-hover/item:shadow-lift sm:h-24 sm:w-24">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-ink-50">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                      />
                    ) : (
                      <span className="font-display text-sm font-extrabold text-ink-700 sm:text-base">
                        {initials}
                      </span>
                    )}
                  </div>
                </div>

                {/* Item Label (Uppercase dark font) */}
                <span className="line-clamp-2 text-2xs font-bold uppercase tracking-wide text-ink-800 transition-colors group-hover/item:text-brand-600 sm:text-xs">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
