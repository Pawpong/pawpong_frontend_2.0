'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/shared/lib/cn'

interface ImageCarouselProps {
  images: string[]
  /** 이미지 alt 접두사 — "{alt} 이미지 N" 으로 조합된다 */
  alt: string
  className?: string
  /** 이미지 로딩 전·레터박스 여백 배경 */
  bgClassName?: string
  /** 좌우 화살표 버튼 크기·배경 (내부 4px 패딩 고정, 아이콘이 나머지를 채운다) */
  buttonClassName?: string
  /** 점 인디케이터 — 활성/비활성 각각 크기·모양·색 */
  activeDotClassName?: string
  inactiveDotClassName?: string
  /** 이미지 채움 방식 — 잘리지 않게 두려면 object-contain */
  imageClassName?: string
  /** 첫 이미지를 LCP 후보로 선로딩한다. 화면의 첫 카드/상세 히어로에서만 사용한다. */
  preloadFirstImage?: boolean
  sizes?: string
}

const ArrowIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-full">
    <path
      d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * 사진 캐러셀 — 좌우 화살표·점 인디케이터로 넘기고, 트랙 자체가 가로 스크롤이라
 * 터치 스와이프도 그대로 동작한다(scroll-snap으로 한 장씩 맞춰 멈춘다).
 * 배경·버튼·인디케이터·채움 방식은 className으로 받아 화면마다 다른 톤을 쓴다.
 */
const ImageCarousel = ({
  images,
  alt,
  className,
  bgClassName = 'bg-black',
  buttonClassName = 'size-9 bg-black/40 hover:bg-black/60',
  activeDotClassName = 'size-1.5 rounded-full bg-white',
  inactiveDotClassName = 'size-1.5 rounded-full bg-white/40',
  imageClassName = 'object-contain',
  preloadFirstImage = false,
  sizes = '(min-width: 768px) 60vw, 100vw',
}: ImageCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const hasMultiple = images.length > 1

  // 스와이프로 넘긴 위치를 인디케이터에 반영 — 스크롤 좌표를 장 수로 환산한다
  useEffect(() => {
    const track = trackRef.current
    if (!track || !hasMultiple) return

    const onScroll = () => {
      const next = Math.round(track.scrollLeft / track.clientWidth)
      setIndex((prev) => (prev === next ? prev : next))
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [hasMultiple])

  const scrollTo = (next: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: track.clientWidth * next, behavior: 'smooth' })
  }

  const goPrev = () => scrollTo((index - 1 + images.length) % images.length)
  const goNext = () => scrollTo((index + 1) % images.length)

  return (
    <div className={cn('relative overflow-hidden', bgClassName, className)}>
      <div
        ref={trackRef}
        // 스크롤바는 감추고(전역 scrollbar-width:none) 스냅으로 한 장씩 정지시킨다
        className="flex size-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
      >
        {images.map((src, imageIndex) => (
          <div key={imageIndex} className="relative size-full shrink-0 snap-center">
            <Image
              src={src}
              alt={`${alt} 이미지 ${imageIndex + 1}`}
              fill
              sizes={sizes}
              className={imageClassName}
              preload={preloadFirstImage && imageIndex === 0}
            />
          </div>
        ))}
      </div>

      {hasMultiple && (
        <>
          {/* 화살표는 포인터 기기 보조 수단 — 터치에서는 스와이프가 주 조작이라 숨긴다 */}
          <button
            type="button"
            aria-label="이전 사진"
            onClick={goPrev}
            className={cn(
              'absolute top-1/2 left-3 hidden -translate-y-1/2 items-center justify-center rounded-full p-1 text-white transition tab:flex',
              buttonClassName,
            )}
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label="다음 사진"
            onClick={goNext}
            className={cn(
              'absolute top-1/2 right-3 hidden -translate-y-1/2 items-center justify-center rounded-full p-1 text-white transition tab:flex',
              buttonClassName,
            )}
          >
            <ArrowIcon direction="right" />
          </button>

          <div
            role="tablist"
            aria-label="사진 선택"
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1"
          >
            {images.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                role="tab"
                aria-selected={dotIndex === index}
                aria-label={`${dotIndex + 1}번째 사진`}
                onClick={() => scrollTo(dotIndex)}
                // 점 자체는 작아도 터치 영역은 24px 확보 (before 가상요소로 확장)
                className={cn(
                  'relative transition-all before:absolute before:top-1/2 before:left-1/2 before:size-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[""]',
                  dotIndex === index ? activeDotClassName : inactiveDotClassName,
                )}
              />
            ))}
          </div>

          <span className="sr-only" aria-live="polite">
            {images.length}장 중 {index + 1}번째 사진
          </span>
        </>
      )}
    </div>
  )
}

export { ImageCarousel }
