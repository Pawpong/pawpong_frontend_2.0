'use client'

import Image from 'next/image'
import { PixelArrowRightIcon } from '@/shared/assets'

interface ModalPhotoProps {
  images: string[]
  currentIndex: number
  onPrev: () => void
  onNext: () => void
  representativeIndex?: number
}

/** 별도 배경판 없이 흰 모달 위에 사진과 탐색 버튼만 표시한다. */
export const ModalPhoto = ({
  images,
  currentIndex,
  onPrev,
  onNext,
  representativeIndex,
}: ModalPhotoProps) => (
  <>
    <div className="relative mx-5 shrink-0 tab:mx-6">
      {images[currentIndex] ? (
        <Image
          src={images[currentIndex]}
          alt={`사진 ${currentIndex + 1}`}
          width={1600}
          height={1200}
          sizes="(min-width: 1024px) 960px, 90vw"
          // 폭은 모달을 채우고 높이는 사진 비율을 따른다 (원본이 작아도 확대). 세로 사진만 60dvh 에서 멈춘다
          className="h-auto max-h-[min(34rem,60dvh)] w-full rounded-lg object-contain"
        />
      ) : (
        <div className="flex h-32 items-center justify-center text-body-md text-neutral-500">
          표시할 사진이 없습니다.
        </div>
      )}
      {representativeIndex === currentIndex && images.length > 0 && (
        <span className="absolute top-3 left-3 rounded-full bg-point-500 px-3 py-1 text-body-sm font-semibold text-primary-700">
          대표사진
        </span>
      )}
    </div>
    <div className="flex shrink-0 items-center justify-center gap-4 py-3">
      {images.length > 1 && (
        <button
          type="button"
          onClick={onPrev}
          aria-label="이전 이미지"
          className="flex size-10 items-center justify-center rounded-full text-primary-500 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-500"
        >
          <PixelArrowRightIcon className="size-5 rotate-180" />
        </button>
      )}
      <p aria-live="polite" className="text-body-md font-medium text-neutral-500 tabular-nums">
        <span className="font-semibold text-neutral-850">
          {images.length ? currentIndex + 1 : 0}
        </span>{' '}
        / {images.length}
      </p>

      {images.length > 1 && (
        <button
          type="button"
          onClick={onNext}
          aria-label="다음 이미지"
          className="flex size-10 items-center justify-center rounded-full text-primary-500 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-500"
        >
          <PixelArrowRightIcon className="size-5" />
        </button>
      )}
    </div>
  </>
)
