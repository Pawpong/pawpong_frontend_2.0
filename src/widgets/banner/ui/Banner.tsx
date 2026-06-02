'use client'

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
    position: 'left-[3rem] pc:left-[5rem]',
    mirrored: true,
  },
  {
    className: NAV_NEXT_CLASS,
    label: '다음 배너',
    position: 'right-[3rem] pc:right-[5rem]',
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

  if (!banners || banners.length === 0) return null

  const hasMultiple = banners.length > 1

  return (
    <div className="relative w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: AUTOPLAY_DELAY_MS, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{ prevEl: `.${NAV_PREV_CLASS}`, nextEl: `.${NAV_NEXT_CLASS}` }}
        loop={hasMultiple}
        className="banner-swiper w-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.bannerId}>
            <BannerSlide banner={banner} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 좌우 네비게이션 화살표 — 데스크탑/패드만, 모바일 숨김 */}
      {hasMultiple &&
        NAV_ARROWS.map(({ className, label, position, mirrored }) => (
          <button
            key={className}
            type="button"
            aria-label={label}
            className={cn(
              'absolute top-1/2 z-10 hidden size-[3rem] -translate-y-1/2 items-center justify-center text-[#f6f6f6] tab:flex',
              position,
              className,
            )}
          >
            <ChevronRight className={cn('h-[2.5rem] w-[1.5625rem]', mirrored && '-scale-x-100')} />
          </button>
        ))}
    </div>
  )
}

export { Banner }
