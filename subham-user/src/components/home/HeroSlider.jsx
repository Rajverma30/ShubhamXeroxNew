/** Premium hero slider with responsive artwork per breakpoint. */
import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, EffectFade, Keyboard, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import api from '../../lib/api';
import { imgUrl } from '../../lib/format';

export default function HeroSlider({ banners = [] }) {
  const swiperRef = useRef(null);
  const [active, setActive] = useState(0);
  const onClick = useCallback((banner) => { if (banner?._id) api.trackBannerClick(banner._id); }, []);
  if (!banners.length) return null;

  return (
    <section className="container-x pt-4 sm:pt-6" aria-label="Featured promotions">
      <div className="relative overflow-hidden rounded-4xl bg-ink-950 shadow-lift sm:rounded-5xl">
        <Swiper modules={[Autoplay, EffectFade, Pagination, Keyboard, A11y]}
          onSwiper={(sw) => { swiperRef.current = sw; }} onSlideChange={(sw) => setActive(sw.realIndex)}
          effect="fade" fadeEffect={{ crossFade: true }} loop={banners.length > 1} speed={800}
          autoplay={banners.length > 1 ? { delay: 5800, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
          keyboard={{ enabled: true }} pagination={{ clickable: true, el: '.hero-dots' }}
          className="h-[360px] sm:h-[460px] lg:h-[560px]">
          {banners.map((banner, i) => {
            const desktop = imgUrl(banner.image, 'full');
            const tablet = imgUrl(banner.tabletImage || banner.image, 'full');
            const mobile = imgUrl(banner.mobileImage || banner.image, 'card');
            const dark = banner.theme !== 'light';
            return (
              <SwiperSlide key={banner._id || i}>
                <div className="relative h-full w-full">
                  <picture>
                    <source media="(min-width: 1024px)" srcSet={desktop} />
                    <source media="(min-width: 640px)" srcSet={tablet} />
                    <img src={mobile} alt={banner.title || 'Promotion'}
                      loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'}
                      className="absolute inset-0 h-full w-full object-cover" />
                  </picture>
                  <div className="absolute inset-0" style={{
                    background: dark
                      ? 'linear-gradient(90deg, rgba(8,13,24,.82) 0%, rgba(8,13,24,.5) 45%, rgba(8,13,24,.15) 100%)'
                      : 'linear-gradient(90deg, rgba(255,255,255,.9) 0%, rgba(255,255,255,.5) 45%, transparent 100%)',
                  }} />
                  <div className="container-x relative flex h-full items-center">
                    <motion.div key={`copy-${active}-${i}`}
                      initial={{ opacity: 0, y: 26 }} animate={{ opacity: active === i ? 1 : 0, y: active === i ? 0 : 26 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                      className={`max-w-xl ${dark ? 'text-white' : 'text-ink-900'}`}>
                      {banner.eyebrow && (
                        <p className={`mb-3 inline-flex rounded-full px-3 py-1.5 text-2xs font-bold uppercase tracking-[0.18em] ${
                          dark ? 'bg-white/12 text-white/85 backdrop-blur-md' : 'bg-ink-900/10 text-ink-700'}`}>
                          {banner.eyebrow}
                        </p>
                      )}
                      <h1 className="text-balance font-display text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
                        {banner.title}
                      </h1>
                      {banner.subtitle && (
                        <p className={`mt-3.5 max-w-md text-pretty text-sm leading-relaxed sm:text-base ${dark ? 'text-white/70' : 'text-ink-600'}`}>
                          {banner.subtitle}
                        </p>
                      )}
                      <div className="mt-7 flex flex-wrap gap-3">
                        {banner.buttonText && (
                          <Link to={banner.buttonUrl || '/shop'} onClick={() => onClick(banner)}
                            className="btn group gap-2 bg-white px-6 py-3.5 text-ink-900 shadow-lift hover:-translate-y-0.5 hover:bg-white/92">
                            {banner.buttonText}
                            <FiArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                          </Link>
                        )}
                        {banner.secondaryButtonText && (
                          <Link to={banner.secondaryButtonUrl || '/shop'} onClick={() => onClick(banner)}
                            className={`btn gap-2 px-6 py-3.5 backdrop-blur-md ${
                              dark ? 'border border-white/25 bg-white/10 text-white hover:bg-white/20'
                                   : 'border border-ink-300 bg-white/60 text-ink-900 hover:bg-white'}`}>
                            {banner.secondaryButtonText}
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {banners.length > 1 && (
          <div className="absolute bottom-5 left-0 right-0 z-10 flex items-center justify-between px-5 sm:px-8">
            <div className="hero-dots flex items-center gap-1.5 text-white" />
            <div className="hidden gap-2 sm:flex">
              <button type="button" aria-label="Previous slide" onClick={() => swiperRef.current?.slidePrev()}
                className="btn-icon border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20">
                <FiChevronLeft size={17} />
              </button>
              <button type="button" aria-label="Next slide" onClick={() => swiperRef.current?.slideNext()}
                className="btn-icon border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20">
                <FiChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
