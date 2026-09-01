/** Customer testimonials carousel — quotes come from Settings. */
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Pagination } from 'swiper/modules';
import { FiStar } from 'react-icons/fi';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Testimonials({ testimonials = [] }) {
  if (!testimonials.length) return null;
  return (
    <Swiper modules={[Autoplay, Pagination, A11y]} spaceBetween={18} slidesPerView={1.08}
      breakpoints={{ 640: { slidesPerView: 2.1 }, 1024: { slidesPerView: 3 } }}
      autoplay={{ delay: 5200, disableOnInteraction: false, pauseOnMouseEnter: true }}
      pagination={{ clickable: true }} className="!pb-11 text-ink-900">
      {testimonials.map((t, i) => (
        <SwiperSlide key={`${t.name}-${i}`} className="!h-auto">
          <figure className="flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-3 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <FiStar key={s} size={14} className={s <= (t.rating || 5) ? 'fill-gold-400 text-gold-400' : 'text-ink-200'} />
              ))}
            </div>
            <blockquote className="flex-1 text-pretty text-sm leading-relaxed text-ink-600">“{t.text}”</blockquote>
            <figcaption className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {t.name?.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink-900">{t.name}</span>
                {t.role && <span className="block text-2xs text-ink-400">{t.role}</span>}
              </span>
            </figcaption>
          </figure>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
