/**
 * Top Publishers & Categories component.
 * Features a dark navy gradient background container, circular badge icons with white borders,
 * uppercase labels underneath, and left/right navigation arrows.
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
    <section className="my-8 overflow-hidden rounded-3xl bg-[#0b0e26] p-6 text-white shadow-2xl sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl text-center w-full">
          {title}
        </h2>
      </div>

      <div className="relative group">
        {/* Navigation Buttons */}
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/25 hover:scale-110 active:scale-95 disabled:opacity-0"
        >
          <FiChevronLeft size={22} />
        </button>

        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/25 hover:scale-110 active:scale-95 disabled:opacity-0"
        >
          <FiChevronRight size={22} />
        </button>

        {/* Circular Items Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto py-3 no-scrollbar scroll-smooth snap-x snap-mandatory"
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
                className="group/item flex w-24 sm:w-28 shrink-0 snap-start flex-col items-center gap-2 text-center"
              >
                {/* Circular Badge Ring */}
                <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-2 border-white/90 bg-slate-900 p-1 shadow-lg transition-all duration-300 group-hover/item:scale-105 group-hover/item:border-brand-400 group-hover/item:shadow-brand-500/30">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-black/40">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                      />
                    ) : (
                      <span className="font-display text-sm sm:text-base font-extrabold text-white">
                        {initials}
                      </span>
                    )}
                  </div>
                </div>

                {/* Item Label (Uppercase, truncated like screenshot) */}
                <span className="line-clamp-2 text-2xs sm:text-xs font-bold uppercase tracking-wide text-white/90 group-hover/item:text-white">
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
