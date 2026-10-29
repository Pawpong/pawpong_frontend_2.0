'use client'

import { useEffect, useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { useQuery } from '@tanstack/react-query'
import { homeQueries } from '@/entities/home'
import type { InitialBanners } from '@/entities/home/server'
import type { BannerDto } from '@/shared/types'
import { ChevronRight } from '@/widgets/banner/ui/Banner'
import { BannerSlide } from '@/widgets/banner/ui/BannerSlide'

const fallbackBanner: BannerDto = {
  bannerId: 'home-preview-welcome',
  desktopImageUrl: '/images/banners/live-copy-v1/welcome-butter.png',
  mobileImageUrl: '/images/banners/live-copy-v1/welcome-butter.png',
  desktopImageFileName: 'welcome-butter.png',
  mobileImageFileName: 'welcome-butter.png',
  linkType: 'internal',
  linkUrl: '/about',
  title: '포퐁에서 새로운 가족을 만나보세요',
  textOverlay: {
    layout: 'welcome',
    headline: '새로운 가족과의 만남',
    subtitle: '에서 시작해요',
    ctaLabel: '포퐁 둘러보기',
  },
  order: 0,
  isActive: true,
}

const NAV_ARROWS = [
  { label: '이전 배너', step: -1, side: 'left-1 tab:left-2', mirrored: true },
  { label: '다음 배너', step: 1, side: 'right-1 tab:right-2', mirrored: false },
] as const

export function PreviewBanner({ initial }: { initial: InitialBanners | null }) {
  const { data } = useQuery({
    ...homeQueries.banners(),
    ...(initial && { initialData: initial.banners, initialDataUpdatedAt: initial.fetchedAt }),
  })
  const swiper = useRef<SwiperInstance | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const banners = data?.length ? [...data].sort((a, b) => a.order - b.order) : [fallbackBanner]

  return (
    <section aria-label="포퐁 배너" className="min-w-0">
      {/* 기존 홈 배너처럼 배너 양옆에 픽셀 화살표만 둔다 */}
      <div className="relative">
        <div className="overflow-hidden rounded-xl border border-primary-100 bg-secondary-50">
          <Swiper
            key={banners.map((banner) => banner.bannerId).join(':')}
            slidesPerView={1}
            loop={banners.length > 1}
            speed={reducedMotion ? 0 : 450}
            onSwiper={(instance) => {
              swiper.current = instance
              setActiveIndex(instance.realIndex)
            }}
            onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
          >
            {banners.map((banner, index) => (
              <SwiperSlide key={banner.bannerId}>
                <div aria-hidden={index !== activeIndex} inert={index !== activeIndex}>
                  <BannerSlide banner={banner} first={index === 0} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        {banners.length > 1 &&
          NAV_ARROWS.map(({ label, step, side, mirrored }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => {
                if (step < 0) swiper.current?.slidePrev()
                else swiper.current?.slideNext()
              }}
              className={`absolute top-1/2 z-20 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-primary-500 focus-ring transition-colors hover:text-primary-700 focus-visible:rounded-sm ${side}`}
            >
              <ChevronRight className={`h-6 w-[0.9375rem] ${mirrored ? '-scale-x-100' : ''}`} />
            </button>
          ))}
      </div>
    </section>
  )
}
