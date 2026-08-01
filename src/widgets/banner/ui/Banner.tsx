'use client'

import { useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { useQuery } from '@tanstack/react-query'
import { homeQueries } from '@/entities/home'
import { cn } from '@/shared/lib/cn'
import { BannerSlide } from './BannerSlide'
import 'swiper/css'
import 'swiper/css/pagination'

const AUTOPLAY_DELAY_MS = 4000

// 셀렉터를 상수로 단일화 — navigation prop과 className에서 공유 (drift 방지)
const NAV_PREV_CLASS = 'banner-nav-prev'
const NAV_NEXT_CLASS = 'banner-nav-next'

// 좌우 화살표 설정 (방향/라벨/위치/미러)
const NAV_ARROWS = [
  {
    className: NAV_PREV_CLASS,
    label: '이전 배너',
    position:
      'left-[calc(50%-11.15625rem)] tab:left-[calc(50%-22.9375rem)] pc:left-[calc(50%-40rem)]',
    mirrored: true,
  },
  {
    className: NAV_NEXT_CLASS,
    label: '다음 배너',
    position:
      'right-[calc(50%-11.15625rem)] tab:right-[calc(50%-22.9375rem)] pc:right-[calc(50%-40rem)]',
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

  return (
    <div className="relative w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: AUTOPLAY_DELAY_MS, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{ prevEl: `.${NAV_PREV_CLASS}`, nextEl: `.${NAV_NEXT_CLASS}` }}
        slidesPerView="auto"
        centeredSlides
        spaceBetween={30}
        breakpoints={{ 768: { spaceBetween: 31.186 }, 1440: { spaceBetween: 80 } }}
        loop={hasMultiple}
        watchOverflow
        onSwiper={(swiper) => {
          swiperRef.current = swiper
          setActiveIndex(swiper.realIndex)
        }}
        onRealIndexChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="banner-swiper h-[13.1763rem] w-full py-[0.6875rem] tab:h-auto tab:py-[0.672rem] pc:py-5"
      >
        {banners.map((banner) => (
          <SwiperSlide
            key={banner.bannerId}
            className="!w-[19.6875rem] tab:!w-[42.1007rem] pc:!w-[70rem]"
          >
            <BannerSlide banner={banner} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 모바일 도트는 배너 카드 아래 Figma 좌표에 고정 */}
      <div className="absolute bottom-[0.6875rem] left-1/2 z-10 flex -translate-x-1/2 items-center gap-[0.2784rem] rounded-full px-[1.11375rem] py-[0.2784rem] tab:hidden">
        {banners.map((banner, index) => (
          <button
            key={banner.bannerId}
            type="button"
            aria-label={`${index + 1}번째 배너 보기`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() =>
              hasMultiple
                ? swiperRef.current?.slideToLoop(index)
                : swiperRef.current?.slideTo(index)
            }
            className={cn(
              'h-[0.556875rem] rounded-full transition-[width,background-color]',
              index === activeIndex ? 'w-[1.3922rem] bg-[#eac499]' : 'w-[0.556875rem] bg-[#ededed]',
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
              'absolute top-[6.19rem] z-10 flex size-5 -translate-y-1/2 items-center justify-center text-[#256ef4] tab:top-1/2 tab:size-[2.2275rem] pc:size-[3rem] [&.swiper-button-disabled]:cursor-default [&.swiper-button-disabled]:text-[#a6a6a6]',
              position,
              className,
            )}
          >
            <ChevronRight
              className={cn(
                'h-[0.7875rem] w-[0.4922rem] tab:h-[1.373rem] tab:w-[0.859rem] pc:h-[2.5rem] pc:w-[1.5625rem]',
                mirrored && '-scale-x-100',
              )}
            />
          </button>
        ))}
    </div>
  )
}

export { Banner }
