'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { useQuery } from '@tanstack/react-query'
import { homeQueries } from '@/entities/home'
import type { BannerDto } from '@/shared/types'
import 'swiper/css'
import 'swiper/css/pagination'

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

const BannerSlide = ({ banner }: { banner: BannerDto }) => {
  const content = (
    <section className="relative w-full overflow-hidden bg-[#d9d9d9]">
      {/* Desktop */}
      <div className="hidden aspect-[768/347] tab:block pc:aspect-[180/47]">
        <Image
          src={banner.desktopImageUrl}
          alt={banner.title ?? ''}
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* Mobile */}
      <div className="block aspect-[375/323] tab:hidden">
        <Image
          src={banner.mobileImageUrl}
          alt={banner.title ?? ''}
          fill
          className="object-cover"
          priority
        />
      </div>
    </section>
  )

  if (banner.linkUrl) {
    if (banner.linkType === 'external') {
      return (
        <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      )
    }
    return <Link href={banner.linkUrl}>{content}</Link>
  }

  return content
}

const Banner = () => {
  const { data: banners } = useQuery(homeQueries.banners())

  if (!banners || banners.length === 0) return null

  const hasMultiple = banners.length > 1

  return (
    <div className="relative w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{ prevEl: '.banner-nav-prev', nextEl: '.banner-nav-next' }}
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
      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="이전 배너"
            className="banner-nav-prev absolute top-1/2 left-[3rem] z-10 hidden size-[3rem] -translate-y-1/2 items-center justify-center text-[#f6f6f6] tab:flex pc:left-[5rem]"
          >
            <ChevronRight className="h-[2.5rem] w-[1.5625rem] -scale-x-100" />
          </button>
          <button
            type="button"
            aria-label="다음 배너"
            className="banner-nav-next absolute top-1/2 right-[3rem] z-10 hidden size-[3rem] -translate-y-1/2 items-center justify-center text-[#f6f6f6] tab:flex pc:right-[5rem]"
          >
            <ChevronRight className="h-[2.5rem] w-[1.5625rem]" />
          </button>
        </>
      )}
    </div>
  )
}

export { Banner }
