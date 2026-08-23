'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/shared/lib/cn'

/**
 * 최은진: 신규 파일 — 피드 카드와 상세 모달(극장 모드)이 이미지 캐러셀을 공유하도록
 * 분리한 컴포넌트. 배경/버튼/인디케이터/이미지 채움 방식을 전부 className prop으로
 * 받아서, 두 화면이 서로 다른 스타일을 각자 넘겨 쓴다(기본값은 모달 기준).
 */
interface PostImageCarouselProps {
  images: string[]
  alt: string
  className?: string
  /** 캐러셀 배경 (이미지 로딩 전/여백) — 기본은 모달의 극장 모드 검정 */
  bgClassName?: string
  /** 화살표 버튼 크기·배경 — 기본은 모달용 36px (내부 4px 패딩은 고정, 아이콘이 나머지를 채운다) */
  buttonClassName?: string
  /** 점 인디케이터 — 활성/비활성 각각 크기·모양·색을 통째로 지정 (기본은 모달의 흰 원) */
  activeDotClassName?: string
  inactiveDotClassName?: string
  /** 이미지 채움 방식 — 기본은 모달의 극장 모드(contain, 잘리지 않고 레터박스) */
  imageClassName?: string
}

const ArrowIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    className="size-full"
  >
    <path
      d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * 사진 한 장을 영역 가득 채우고, 여러 장이면 좌우 화살표 + 점 인디케이터로 넘기는 캐러셀.
 * 상세 모달과 피드 카드에서 함께 쓴다 — 버튼 크기·점 모양·색만 각 컨텍스트에 맞게 다르다.
 */
const PostImageCarousel = ({
  images,
  alt,
  className,
  bgClassName = 'bg-black',
  buttonClassName = 'size-9 bg-black/40 hover:bg-black/60',
  activeDotClassName = 'size-1.5 rounded-full bg-white',
  inactiveDotClassName = 'size-1.5 rounded-full bg-white/40',
  imageClassName = 'object-contain',
}: PostImageCarouselProps) => {
  const [index, setIndex] = useState(0)
  const hasMultiple = images.length > 1

  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const goNext = () => setIndex((i) => (i + 1) % images.length)

  return (
    <div className={cn('relative overflow-hidden', bgClassName, className)}>
      <Image
        src={images[index]}
        alt={`${alt} 이미지 ${index + 1}`}
        fill
        sizes="(min-width: 768px) 60vw, 100vw"
        className={imageClassName}
        priority
      />

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="이전 사진"
            onClick={goPrev}
            className={cn(
              'absolute top-1/2 left-3 flex -translate-y-1/2 items-center justify-center rounded-full p-1 text-white transition',
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
              'absolute top-1/2 right-3 flex -translate-y-1/2 items-center justify-center rounded-full p-1 text-white transition',
              buttonClassName,
            )}
          >
            <ArrowIcon direction="right" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={cn(
                  'transition-all',
                  dotIndex === index ? activeDotClassName : inactiveDotClassName,
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export { PostImageCarousel }
