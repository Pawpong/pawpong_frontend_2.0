'use client'

import { useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectCoverflow, Navigation } from 'swiper/modules'
import { useQuery } from '@tanstack/react-query'
import { homeQueries } from '@/entities/home'
import { cn } from '@/shared/lib/cn'
import { BannerSlide } from './BannerSlide'
import 'swiper/css'

//QA: 배너 미리보기 수정 — API 배너를 하나의 Swiper로 렌더링하고 인접 배너를 함께 노출한다.
//QA: 배너 크기 수정 — 활성 배너는 원본, 인접 배너는 Coverflow scale(0.85)로 표시한다.
const AUTOPLAY_DELAY_MS = 4000
//QA: 화살표 연결 — Swiper navigation 설정과 버튼 className의 셀렉터를 상수로 공유한다.
const NAV_PREV_CLASS = 'banner-nav-prev'
const NAV_NEXT_CLASS = 'banner-nav-next'

//QA: 화살표 위치/방향 — Figma 기준 반응형 위치와 좌우 반전을 한 곳에서 관리한다.
const NAV_ARROWS = [
  {
    className: NAV_PREV_CLASS,
    label: '이전 배너',
    position: 'tab:left-0 pc:left-[max(1rem,calc(50%-40rem))]',
    mirrored: true,
  },
  {
    className: NAV_NEXT_CLASS,
    label: '다음 배너',
    position: 'tab:right-0 pc:right-[max(1rem,calc(50%-40rem))]',
    mirrored: false,
  },
] as const

//QA: 화살표 에셋 — Figma의 5칸 픽셀 스타일 chevron을 코드로 표시한다.
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

  //QA: API 응답 처리 — order 기준으로 정렬하고 응답 개수만큼 슬라이드/페이지네이션을 만든다.
  const orderedBanners = [...banners].sort((a, b) => a.order - b.order)
  const hasMultiple = orderedBanners.length > 1
  //QA: 끝 배너 처리 — loop를 끄고 첫 배너는 오른쪽, 마지막 배너는 왼쪽 미리보기만 보인다.
  const carouselBanners = orderedBanners.map((banner) => ({ banner }))

  const normalizeIndex = (index: number) =>
    ((index % orderedBanners.length) + orderedBanners.length) % orderedBanners.length

  return (
    <div className="relative w-full overflow-hidden">
      {/*
        //QA: 배너 비율 수정 — breakpoint별 캔버스 높이와 BannerSlide의 aspect-ratio를 분리한다.
        //QA: PC 미리보기 수정 — Coverflow로 활성/양옆 배너의 비율과 간격을 함께 축소한다.
      */}
      <Swiper
        modules={[Autoplay, EffectCoverflow, Navigation]}
        autoplay={hasMultiple ? { delay: AUTOPLAY_DELAY_MS, disableOnInteraction: false } : false}
        navigation={
          hasMultiple ? { prevEl: `.${NAV_PREV_CLASS}`, nextEl: `.${NAV_NEXT_CLASS}` } : false
        }
        slidesPerView="auto"
        centeredSlides
        spaceBetween={0}
        effect="coverflow"
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 0,
          modifier: 1,
          scale: 0.85, //QA: Figma의 비활성 배너 약 85% 크기 미리보기
          slideShadows: false,
        }}
        loop={false}
        initialSlide={0}
        allowTouchMove={hasMultiple}
        watchOverflow
        onSwiper={(swiper) => {
          swiperRef.current = swiper
          setActiveIndex(normalizeIndex(swiper.realIndex))
        }}
        onRealIndexChange={(swiper) => setActiveIndex(normalizeIndex(swiper.realIndex))}
        className="banner-swiper mx-auto h-auto w-full max-w-full py-0 tab:h-[16.2333rem] tab:w-full tab:py-[0.5833rem] pc:h-[30.4375rem] pc:w-full pc:py-[clamp(0.75rem,1.09375vw,1.09375rem)]"
      >
        {carouselBanners.map(({ banner }) => (
          <SwiperSlide
            key={banner.bannerId}
            className="!h-auto !w-full tab:!w-[37.8rem] pc:!w-[min(70.875rem,calc(100vw-2rem))]"
          >
            <BannerSlide banner={banner} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* //QA: 페이지네이션 수정 — 모바일은 배경 없이, 탭·PC는 Figma의 하단 그라디언트를 사용한다. */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center py-2.5 tab:bg-[linear-gradient(to_top,rgba(0,0,0,0.2),transparent)] pc:bottom-10">
        <div className="flex h-4 w-25 items-center justify-center gap-1 rounded-full px-4 py-1">
          {orderedBanners.map((banner, index) => (
            <button
              key={banner.bannerId}
              type="button"
              aria-label={`${index + 1}번째 배너 보기`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => swiperRef.current?.slideTo(index)}
              className={cn(
                'h-2 rounded-full transition-[width,background-color]',
                index === activeIndex ? 'w-5 bg-point-500' : 'w-2 bg-[rgba(173,101,29,0.3)]',
              )}
            />
          ))}
        </div>
      </div>

      {/* //QA: 네비게이션 수정 — 시작/끝 상태는 loop=false와 Swiper disabled 상태로 표현한다. */}
      {hasMultiple &&
        NAV_ARROWS.map(({ className, label, position, mirrored }) => (
          <button
            key={className}
            type="button"
            aria-label={label}
            className={cn(
              'absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center text-primary-500 transition-[color,transform] hover:text-primary-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 tab:flex pc:size-[clamp(2rem,3.333vw,3rem)] [&.swiper-button-disabled]:cursor-default [&.swiper-button-disabled]:text-neutral-400 [&.swiper-button-disabled]:hover:text-neutral-400',
              position,
              className,
            )}
          >
            <ChevronRight
              className={cn(
                'h-[1.25rem] w-[0.78125rem] pc:h-[clamp(1.6667rem,2.778vw,2.5rem)] pc:w-[clamp(1.0417rem,1.736vw,1.5625rem)]',
                mirrored && '-scale-x-100',
              )}
            />
          </button>
        ))}
    </div>
  )
}

export { Banner }
