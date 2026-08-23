'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper'
import { PixelArrowRightIcon } from '@/shared/assets'
import 'swiper/css'

// [refactored] 히어로 이미지 캐러셀 — Swiper 기반(모바일/탭 스와이프) + 커스텀 화살표·인디케이터
// 공유 버튼은 정보 영역 하단으로 이동(피그마 1240-45672) — 이미지에서는 제거
const HeroImageCarousel = ({
  images,
  alt,
  onImageClick,
}: {
  images: string[]
  alt: string
  onImageClick: (index: number) => void
}) => {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="relative aspect-[375/279] w-full overflow-hidden pc:aspect-square pc:h-[31.25rem] pc:w-[31.25rem] pc:rounded-[0.5rem]">
      <Swiper
        onSwiper={setSwiper}
        onSlideChange={(s) => setActiveIndex(s.activeIndex)}
        className="size-full"
      >
        {images.map((url, index) => (
          // 같은 이미지 URL이 중복될 수 있어 index를 포함해 고유 key 생성
          <SwiperSlide key={`${url}-${index}`}>
            <button
              type="button"
              onClick={() => onImageClick(index)}
              className="relative block size-full"
            >
              {/* draggable=false: 네이티브 이미지 드래그가 Swiper 스와이프를 가로채는 것 방지 */}
              <Image
                src={url}
                alt={alt}
                fill
                sizes="(max-width: 1440px) 100vw, 500px"
                draggable={false}
                className="object-cover"
              />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 좌우 슬라이드 네비게이션 — 첫 사진(대표사진)에서는 이전(왼쪽) 화살표 숨김 */}
      {activeIndex > 0 && (
        <SlideNavButton
          label="이전 사진"
          onClick={() => swiper?.slidePrev()}
          className="left-[1.25rem] rotate-180"
        />
      )}
      {/* 마지막 사진에서는 다음(오른쪽) 화살표 숨김 */}
      {activeIndex < images.length - 1 && (
        <SlideNavButton
          label="다음 사진"
          onClick={() => swiper?.slideNext()}
          className="right-[1.25rem]"
        />
      )}

      {/* 인디케이터 — 활성 pill(20x8 #fffa94), 비활성 dot(8 #a9835a) */}
      <div className="pointer-events-none absolute bottom-[1rem] left-1/2 z-10 flex -translate-x-1/2 items-center gap-[0.25rem] pc:bottom-[1.5rem]">
        {images.map((url, index) => (
          <span
            key={`${url}-${index}`}
            className={
              index === activeIndex
                ? 'h-[0.5rem] w-[1.25rem] rounded-[0.5rem] bg-[#fffa94]'
                : 'size-[0.5rem] rounded-[0.5rem] bg-[#a9835a]'
            }
          />
        ))}
      </div>
    </div>
  )
}

// 좌우 슬라이드 네비 버튼 (동일 마크업의 prev/next 공통화)
const SlideNavButton = ({
  label,
  onClick,
  className,
}: {
  label: string
  onClick: () => void
  className: string
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`absolute top-1/2 z-10 hidden -translate-y-1/2 pc:block ${className}`}
  >
    <PixelArrowRightIcon className="size-[3rem] text-neutral-50" />
  </button>
)

export { HeroImageCarousel }
