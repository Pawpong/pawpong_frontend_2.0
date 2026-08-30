'use client'

import { useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import { useQuery } from '@tanstack/react-query'
import { homeQueries } from '@/entities/home'
import { cn } from '@/shared/lib/cn'
import { BannerSlide } from './BannerSlide'
import 'swiper/css'

const AUTOPLAY_DELAY_MS = 4000
const INACTIVE_SLIDE_SCALE = 974 / 1134
const CAROUSEL_COPY_COUNT = 3

// 셀렉터를 상수로 단일화 — navigation prop과 className에서 공유 (drift 방지)
const NAV_PREV_CLASS = 'banner-nav-prev'
const NAV_NEXT_CLASS = 'banner-nav-next'

// 좌우 화살표 설정 (방향/라벨/위치/미러)
const NAV_ARROWS = [
  {
    className: NAV_PREV_CLASS,
    label: '이전 배너',
    position: 'tab:left-0 pc:left-[calc(50%-40rem)]',
    mirrored: true,
  },
  {
    className: NAV_NEXT_CLASS,
    label: '다음 배너',
    position: 'tab:right-0 pc:right-[calc(50%-40rem)]',
    mirrored: false,
  },
] as const

/** Figma: 5칸 픽셀 스타일 chevron (#F6F6F6) */
const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 25 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path d="M10 0H0V10H10V0Z" fill="currentColor" />
    <path d="M17.5 7.5H7.5V17.5H17.5V7.5Z" fill="currentColor" />
    <path d="M25 15H15V25H25V15Z" fill="currentColor" />
    <path d="M17.5 22.5H7.5V32.5H17.5V22.5Z" fill="currentColor" />
    <path d="M10 30H0V40H10V30Z" fill="currentColor" />
  </svg>
)

const Banner = () => {
  const { data: banners } = useQuery(homeQueries.banners())
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  if (!banners || banners.length === 0) return null

  const hasMultiple = banners.length > 1
  const initialSlide = hasMultiple ? banners.length : 0
  const carouselBanners = hasMultiple
    ? Array.from({ length: CAROUSEL_COPY_COUNT }, (_, copyIndex) =>
        banners.map((banner) => ({ banner, copyIndex })),
      ).flat()
    : banners.map((banner) => ({ banner, copyIndex: 0 }))

  const normalizeIndex = (index: number) =>
    ((index % banners.length) + banners.length) % banners.length

  return (
    <div className="relative w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={hasMultiple ? { delay: AUTOPLAY_DELAY_MS, disableOnInteraction: false } : false}
        navigation={
          hasMultiple ? { prevEl: `.${NAV_PREV_CLASS}`, nextEl: `.${NAV_NEXT_CLASS}` } : false
        }
        slidesPerView="auto"
        centeredSlides
        spaceBetween={0}
        loop={hasMultiple}
        initialSlide={initialSlide}
        allowTouchMove={hasMultiple}
        watchOverflow
        onSwiper={(swiper) => {
          swiperRef.current = swiper
          setActiveIndex(normalizeIndex(swiper.realIndex))
        }}
        onRealIndexChange={(swiper) => setActiveIndex(normalizeIndex(swiper.realIndex))}
        className="banner-swiper h-[11.9792rem] w-full py-0 tab:h-[16.2333rem] tab:py-[0.5833rem] pc:h-[30.4375rem] pc:py-[1.09375rem]"
      >
        {carouselBanners.map(({ banner, copyIndex }) => (
          <SwiperSlide
            key={`${copyIndex}-${banner.bannerId}`}
            className="!h-auto !w-[23.4375rem] tab:!w-[37.8rem] pc:!w-[70.875rem]"
            style={{ '--inactive-banner-scale': INACTIVE_SLIDE_SCALE } as React.CSSProperties}
          >
            <BannerSlide banner={banner} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 원본 배너 수를 기준으로 표시해 완충 슬라이드가 페이지네이션에 노출되지 않게 한다. */}
      <div className="absolute bottom-[0.6875rem] left-1/2 z-10 flex -translate-x-1/2 items-center gap-[0.2784rem] rounded-full px-[1.11375rem] py-[0.2784rem] tab:bottom-4 tab:gap-1 tab:px-4 tab:py-1 pc:bottom-10">
        {banners.map((banner, index) => (
          <button
            key={banner.bannerId}
            type="button"
            aria-label={`${index + 1}번째 배너 보기`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() =>
              hasMultiple
                ? swiperRef.current?.slideToLoop(initialSlide + index)
                : swiperRef.current?.slideTo(index)
            }
            className={cn(
              'h-[0.556875rem] rounded-full transition-[width,background-color] tab:h-2',
              index === activeIndex
                ? 'w-[1.3922rem] bg-secondary-500 tab:w-5'
                : 'w-[0.556875rem] bg-neutral-100 tab:w-2',
            )}
          />
        ))}
      </div>

      {/* 좌우 네비게이션 화살표 */}
      {hasMultiple &&
        NAV_ARROWS.map(({ className, label, position, mirrored }) => (
          <button
            key={className}
            type="button"
            aria-label={label}
            className={cn(
              'absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center text-primary-500 transition-[color,transform] hover:text-primary-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 tab:flex pc:size-[3rem] [&.swiper-button-disabled]:cursor-default [&.swiper-button-disabled]:text-neutral-400 [&.swiper-button-disabled]:hover:text-neutral-400',
              position,
              className,
            )}
          >
            <ChevronRight
              className={cn(
                'h-[1.25rem] w-[0.78125rem] pc:h-[2.5rem] pc:w-[1.5625rem]',
                mirrored && '-scale-x-100',
              )}
            />
          </button>
        ))}
    </div>
  )
}

export { Banner }
