'use client'

import Image from 'next/image'
import { useImageCarousel } from '@/shared/lib/useImageCarousel'
import { PixelArrowRightIcon, ShareIcon } from '@/shared/assets/icons'

// [refactored] 히어로 이미지 캐러셀 (이미지 + 모바일 공유 + 좌우 네비 + 인디케이터)
const HeroImageCarousel = ({
  images,
  alt,
  onImageClick,
}: {
  images: string[]
  alt: string
  onImageClick: (index: number) => void
}) => {
  const { currentIndex, handlePrev, handleNext } = useImageCarousel(images)
  const hasMultiple = images.length > 1

  return (
    <div className="relative aspect-[375/279] w-full overflow-hidden tab:flex tab:aspect-square tab:h-[31.25rem] tab:w-[31.25rem] tab:items-center tab:justify-center tab:self-stretch tab:rounded-[0.5rem]">
      <button
        type="button"
        onClick={() => onImageClick(currentIndex)}
        className="relative block size-full"
      >
        <Image src={images[currentIndex]} alt={alt} fill className="object-cover" />
      </button>

      {/* 공유 버튼 (모바일) */}
      <button type="button" className="absolute top-[0.75rem] right-[0.75rem] tab:hidden">
        <ShareIcon className="size-[2rem] text-white" />
      </button>

      {/* 좌우 슬라이드 네비게이션 — 첫 사진(대표사진)에서는 이전(왼쪽) 화살표 숨김 */}
      {currentIndex > 0 && (
        <SlideNavButton
          label="이전 사진"
          onClick={handlePrev}
          className="left-[1.25rem] rotate-180"
        />
      )}
      {hasMultiple && (
        <SlideNavButton label="다음 사진" onClick={handleNext} className="right-[1.25rem]" />
      )}

      {/* 인디케이터 — 활성 pill(20x8 #fffa94), 비활성 dot(8 #a9835a) */}
      <div className="absolute bottom-[1rem] left-1/2 flex -translate-x-1/2 items-center gap-[0.25rem] tab:bottom-[1.5rem]">
        {images.map((url, index) => (
          <span
            key={url}
            className={
              index === currentIndex
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
    className={`absolute top-1/2 -translate-y-1/2 ${className}`}
  >
    <PixelArrowRightIcon className="size-[3rem] text-[#f6f6f6]" />
  </button>
)

export { HeroImageCarousel }
