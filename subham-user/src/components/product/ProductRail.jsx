/** Horizontal product carousel with on-brand navigation. */
import { useCallback, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, FreeMode, Keyboard, Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import ProductCard from './ProductCard';
import { SectionHeader } from '../ui/Common';
import { RowSkeleton } from '../ui/Skeleton';

export default function ProductRail({ eyebrow, title, subtitle, viewAllUrl, products = [], loading = false, compact = false, className = '' }) {
  const swiperRef = useRef(null);
  const [state, setState] = useState({ isBeginning: true, isEnd: false });

  const onSwiper = useCallback((sw) => {
    swiperRef.current = sw;
    setState({ isBeginning: sw.isBeginning, isEnd: sw.isEnd });
  }, []);
  const onChange = useCallback((sw) => setState({ isBeginning: sw.isBeginning, isEnd: sw.isEnd }), []);

  if (!loading && !products.length) return null;

  return (
    <section className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} viewAllUrl={viewAllUrl} className="mb-4 sm:mb-5" />
        </div>
        <div className="mb-4 hidden shrink-0 gap-2 sm:mb-5 sm:flex">
          <button type="button" aria-label="Previous" disabled={state.isBeginning} onClick={() => swiperRef.current?.slidePrev()}
            className="btn-icon border border-ink-200 text-ink-600 hover:bg-ink-900 hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink-600">
            <FiChevronLeft size={17} />
          </button>
          <button type="button" aria-label="Next" disabled={state.isEnd} onClick={() => swiperRef.current?.slideNext()}
            className="btn-icon border border-ink-200 text-ink-600 hover:bg-ink-900 hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink-600">
            <FiChevronRight size={17} />
          </button>
        </div>
      </div>

      {loading ? <RowSkeleton count={6} /> : (
        <Swiper modules={[Navigation, FreeMode, Keyboard, A11y]}
          onSwiper={onSwiper} onSlideChange={onChange} onReachBeginning={onChange} onReachEnd={onChange}
          freeMode={{ enabled: true, momentumBounce: false }} keyboard={{ enabled: true }}
          spaceBetween={16} slidesPerView={2.1}
          breakpoints={{
            480: { slidesPerView: 2.4, spaceBetween: 16 },
            640: { slidesPerView: 3.2, spaceBetween: 18 },
            1024: { slidesPerView: 4.2, spaceBetween: 20 },
            1280: { slidesPerView: compact ? 6.2 : 5.2, spaceBetween: 20 },
          }}
          className="!overflow-visible">
          {products.map((p, i) => (
            <SwiperSlide key={p._id || p.slug} className="!h-auto">
              <ProductCard product={p} compact={compact} eager={i < 3} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}
