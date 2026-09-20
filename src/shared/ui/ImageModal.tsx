'use client'

import Image from 'next/image'
import { cn } from '@/shared/lib/cn'
import { useImageCarousel } from '@/shared/lib/useImageCarousel'
import { MediaDialog } from './MediaDialog'
import { ModalPhoto } from './ModalPhoto'
import { Button } from './Button'

interface ImageModalProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: (index: number) => void
  onSetRepresentative?: (index: number) => void
  representativeIndex?: number
}

const ImageModal = ({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
  onDelete,
  onSetRepresentative,
  representativeIndex,
}: ImageModalProps) => {
  // [refactored] 방향키 처리는 훅이 담당
  const { currentIndex, setCurrentIndex, handlePrev, handleNext, handleKeyDown } = useImageCarousel(
    images,
    initialIndex,
  )
  return (
    <MediaDialog
      open={open}
      onOpenChange={onOpenChange}
      title="사진 미리보기"
      fitContent
      onKeyDown={handleKeyDown}
    >
      <ModalPhoto
        images={images}
        currentIndex={currentIndex}
        onPrev={handlePrev}
        onNext={handleNext}
        representativeIndex={representativeIndex}
      />
      <div className="flex shrink-0 flex-col gap-4 border-t border-neutral-100 px-5 py-4 tab:flex-row tab:items-center tab:justify-between tab:px-6">
        <div aria-label="사진 선택" className="flex min-w-0 gap-3 overflow-x-auto p-1">
          {images.length > 1 &&
            images.map((src, index) => (
              <button
                key={src + index}
                type="button"
                aria-pressed={index === currentIndex}
                aria-label={`${index + 1}번째 이미지`}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'relative size-12 shrink-0 overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
                  index === currentIndex
                    ? 'ring-2 ring-primary-500 ring-offset-2'
                    : 'opacity-60 hover:opacity-100',
                )}
              >
                <Image src={src} alt="" fill sizes="48px" className="object-cover" />
              </button>
            ))}
        </div>
        {images.length > 0 && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {onDelete && (
              <Button
                variant="ghost"
                className="h-10 px-4 text-body-md text-error-500 hover:text-error-600"
                onClick={() => {
                  onDelete(currentIndex)
                  onOpenChange(false)
                }}
              >
                삭제
              </Button>
            )}
            {onSetRepresentative && (
              <Button
                variant="primary"
                className="h-10 px-5 text-body-md"
                disabled={representativeIndex === currentIndex}
                onClick={() => {
                  onSetRepresentative(currentIndex)
                  onOpenChange(false)
                }}
              >
                {representativeIndex === currentIndex ? '현재 대표사진' : '대표사진으로 설정'}
              </Button>
            )}
          </div>
        )}
      </div>
    </MediaDialog>
  )
}
export { ImageModal }
