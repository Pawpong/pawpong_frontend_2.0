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

//QA: 화살표 위치 — Figma 기준(768px→21.3175rem / 1440px→39.5953rem) 두 지점이 뷰포트 폭에
//QA: 거의 정비례(43.995vw)하므로, 768~1440 사이에서도 배너 폭과 같은 비율로 이동하도록
//QA: 비례식으로 바꾸고 1440 이상은 배너 폭처럼 고정값으로 캡한다.
const NAV_ARROWS = [
  {
    className: NAV_PREV_CLASS,
    label: '이전 배너',
    position: 'tab:left-[calc(50%-min(39.5953rem,43.995vw))]',
    mirrored: true,
  },
  {
    className: NAV_NEXT_CLASS,
    label: '다음 배너',
    position: 'tab:right-[calc(50%-min(39.5953rem,43.995vw))]',
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
        //QA: 배너 반응형 수정 — 캔버스 높이는 h-auto로 슬라이드 폭(aspect-ratio 연동)에 맡기고,
        //QA: 슬라이드 폭 자체를 78.75vw(1134/1440) 비례식으로 둬 768~1440 사이에서도
        //QA: 배너가 끊김 없이 같은 비율로 줄고 늘어난다 (Figma 4161-825592).
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
        className="banner-swiper mx-auto h-auto w-full max-w-full py-0 tab:py-[clamp(0.75rem,1.09375vw,1.09375rem)]"
      >
        {carouselBanners.map(({ banner }) => (
          <SwiperSlide
            key={banner.bannerId}
            className="!h-auto !w-full tab:!w-[min(70.875rem,78.75vw)]"
          >
            <BannerSlide banner={banner} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 모바일은 배너 아래에 배경 없이 배치하고, 탭·PC에서는 배너 내부에 배치한다. */}
      <div className="relative z-10 flex justify-center py-2.5 tab:absolute tab:inset-x-0 tab:bottom-0 pc:bottom-10">
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

      {/* //QA: 네비게이션 수정 — 시작/끝 상태는 loop=false와 Swiper disabled 상태로 표현한다.
          //QA: 버튼·아이콘 크기도 1440(48px/40px/25px)을 기준으로 3.333vw·2.778vw·1.736vw
          //QA: 비례식으로 둬, 768~1439 구간에서 배너와 같은 비율로 줄어들게 한다. */}
      {hasMultiple &&
        NAV_ARROWS.map(({ className, label, position, mirrored }) => (
          <button
            key={className}
            type="button"
            aria-label={label}
            className={cn(
              'absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center text-primary-500 transition-[color,transform] hover:text-primary-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 tab:flex tab:size-[min(3rem,3.333vw)] [&.swiper-button-disabled]:cursor-default [&.swiper-button-disabled]:text-neutral-400 [&.swiper-button-disabled]:hover:text-neutral-400',
              position,
              className,
            )}
          >
            <ChevronRight
              className={cn(
                'tab:h-[min(2.5rem,2.778vw)] tab:w-[min(1.5625rem,1.736vw)]',
                mirrored && '-scale-x-100',
              )}
            />
          </button>
        ))}
    </div>
  )
}

export { Banner }
