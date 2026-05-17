'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
} from '@/shared/ui'
import * as DialogPrimitive from '@radix-ui/react-dialog'

interface ImageModalProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ImageModal = ({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImageModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }, [images.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }, [images.length])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-[57.25rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1rem] border border-[#c6c6c6] bg-black"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Title className="sr-only">
            이미지 상세 보기
          </DialogPrimitive.Title>

          <div className="relative flex h-[36.75rem] items-center justify-center">
            {/* 닫기 버튼 */}
            <DialogClose className="absolute left-[2.5625rem] top-[1.0625rem] z-10 flex w-[5.75rem] items-center justify-center rounded-full border border-[#d4d4d4] p-[0.625rem]">
              <span className="text-[0.875rem] font-medium text-white">
                닫기
              </span>
            </DialogClose>

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
            <div className="relative h-[28.1rem] w-[27.9rem] overflow-hidden rounded-[1.1rem] bg-[#c6c6c6]">
              <Image
                src={images[currentIndex]}
                alt={`이미지 ${currentIndex + 1}`}
                fill
                className="object-cover"
              />
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
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

export { ImageModal }
