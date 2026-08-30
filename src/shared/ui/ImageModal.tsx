'use client'

import Image from 'next/image'
import { Dialog, DialogPortal, DialogOverlay, DialogClose } from '@/shared/ui'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useImageCarousel } from '@/shared/lib/useImageCarousel'

interface ImageModalProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: (index: number) => void
  onSetRepresentative?: (index: number) => void
  /** 현재 대표사진 인덱스 */
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
  const { currentIndex, handlePrev, handleNext } = useImageCarousel(images, initialIndex)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50" />
        <DialogPrimitive.Content
          className="fixed top-1/2 left-1/2 z-modal w-[57.25rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1rem] border border-[#c6c6c6] bg-black"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Title className="sr-only">이미지 상세 보기</DialogPrimitive.Title>

          <div className="flex h-[36.75rem] flex-col">
            {/* 닫기 버튼 */}
            <div className="relative h-[4.438rem] shrink-0">
              <DialogClose className="absolute top-[1.0625rem] left-[2.5625rem] z-10 flex w-[5.75rem] items-center justify-center rounded-full border border-[#d4d4d4] p-[0.625rem]">
                <span className="text-[0.875rem] font-medium text-white">닫기</span>
              </DialogClose>
            </div>

            {/* 이미지 + 네비게이션 */}
            <div className="relative flex flex-1 items-center justify-center">
              {/* 좌측 네비게이션 */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-[3rem] z-10 size-[3rem] rounded-full bg-[#8e8e8e] transition-opacity hover:opacity-80"
                  aria-label="이전 이미지"
                />
              )}

              {/* 중앙 이미지 */}
              <div className="relative h-[23.125rem] w-[22.938rem] overflow-hidden rounded-[0.906rem] bg-[#c6c6c6]">
                <Image
                  src={images[currentIndex]}
                  alt={`이미지 ${currentIndex + 1}`}
                  fill
                  sizes="(max-width: 767px) 100vw, 368px"
                  className="object-cover"
                />
                {representativeIndex !== undefined && representativeIndex === currentIndex && (
                  <div className="absolute bottom-0 flex h-[2.188rem] w-full items-center justify-center gap-[0.625rem] bg-text-primary p-[0.625rem]">
                    <span className="text-base font-bold text-white">대표사진</span>
                  </div>
                )}
              </div>

              {/* 우측 네비게이션 */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-[3rem] z-10 size-[3rem] rounded-full bg-[#8e8e8e] transition-opacity hover:opacity-80"
                  aria-label="다음 이미지"
                />
              )}
            </div>

            {/* 하단 액션 버튼 */}
            <div className="flex h-[5.5rem] shrink-0 items-center justify-center gap-[1.375rem]">
              {onSetRepresentative && representativeIndex !== currentIndex && (
                <button
                  type="button"
                  onClick={() => {
                    onSetRepresentative(currentIndex)
                    onOpenChange(false)
                  }}
                  className="flex w-[9.438rem] items-center justify-center rounded-full border border-[#d4d4d4] p-[0.625rem]"
                >
                  <span className="text-sm font-medium text-white">대표 이미지로 변경</span>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(currentIndex)
                    onOpenChange(false)
                  }}
                  className="flex w-[9.438rem] items-center justify-center rounded-full border border-[#d4d4d4] p-[0.625rem]"
                >
                  <span className="text-sm font-medium text-white">이미지 삭제</span>
                </button>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

export { ImageModal }
