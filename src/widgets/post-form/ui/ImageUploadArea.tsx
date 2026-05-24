'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, CloseIcon } from '@/shared/assets/icons'
import { ImageModal } from '@/shared/ui'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/shared/ui'

const MAX_IMAGES = 10

interface ImageUploadAreaProps {
  images: string[]
  onAdd: (files: FileList) => void
  onRemove: (index: number) => void
  /** 대표사진 인덱스 (옵션 — 넘기면 대표사진 기능 활성화) */
  representativeIndex?: number
  onSetRepresentative?: (index: number) => void
  /** 라벨 숨김 (외부에서 직접 라벨을 렌더링할 때) */
  hideLabel?: boolean
  /** 최대 이미지 수 */
  maxImages?: number
}

const ImageUploadArea = ({
  images,
  onAdd,
  onRemove,
  representativeIndex,
  onSetRepresentative,
  hideLabel = false,
  maxImages = MAX_IMAGES,
}: ImageUploadAreaProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionIndex, setActionIndex] = useState(0)

  const [desktopModalOpen, setDesktopModalOpen] = useState(false)
  const [desktopModalIndex, setDesktopModalIndex] = useState(0)

  const hasRepresentative = representativeIndex !== undefined

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAdd(e.target.files)
      e.target.value = ''
    }
  }

  const isDesktop = () => window.matchMedia('(min-width: 768px)').matches

  const handleImageClick = (index: number) => {
    if (hasRepresentative) {
      if (isDesktop()) {
        setDesktopModalIndex(index)
        setDesktopModalOpen(true)
      } else {
        setActionIndex(index)
        setActionDialogOpen(true)
      }
    } else {
      setModalIndex(index)
      setModalOpen(true)
    }
  }

  const isRepresentative = (index: number) =>
    hasRepresentative && representativeIndex === index

  return (
    <div className="flex flex-col gap-[0.375rem] tab:gap-3">
      {!hideLabel && (
        <p className="text-sm leading-[1.5] text-text-primary tab:text-base">
          <span className="font-bold">이미지</span>{' '}
          <span className="hidden font-medium tab:inline">선택</span>
          <span className="text-xs font-medium tab:hidden">
            (최소 1장 이상 업로드 해주세요) 필수
          </span>
        </p>
      )}

      <div className="flex gap-[0.375rem] tab:flex-wrap tab:gap-x-[1.438rem] tab:gap-y-3">
        {/* Upload Button */}
        <button
          type="button"
          onClick={handleClick}
          className="flex size-[3.793rem] shrink-0 flex-col items-center rounded-[0.438rem] border border-[#cdcdcd] pb-[0.569rem] pl-[1.131rem] pr-[1.162rem] pt-[0.802rem] tab:h-[12.623rem] tab:w-[12.363rem] tab:items-center tab:justify-center tab:gap-[0.188rem] tab:rounded-[0.596rem] tab:border-fill-placeholder tab:p-0"
        >
          <ImageIcon className="size-[1.459rem] text-text-primary tab:size-[3.285rem]" />
          <span className="text-[0.729rem] font-medium text-text-primary tab:text-[1.642rem]">
            {images.length}/{maxImages}
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleChange}
        />

        {/* Image Previews */}
        {images.map((src, index) => (
          <div
            key={src}
            className="relative size-[3.793rem] shrink-0 overflow-hidden rounded-[0.438rem] border border-[#cdcdcd] bg-fill-placeholder tab:h-[12.623rem] tab:w-[12.363rem] tab:rounded-[0.596rem] tab:border-0"
          >
            <button
              type="button"
              className="size-full"
              onClick={() => handleImageClick(index)}
              aria-label={`이미지 ${index + 1} ${isRepresentative(index) ? '대표사진' : '미리보기'}`}
            >
              <Image
                src={src}
                alt={`업로드 이미지 ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>

            {/* 대표사진 뱃지 */}
            {isRepresentative(index) && (
              <div className="pointer-events-none absolute bottom-0 left-1/2 flex h-[1.125rem] w-[3.813rem] -translate-x-1/2 items-center justify-center bg-[#929292] tab:left-0 tab:h-[2.188rem] tab:w-full tab:translate-x-0 tab:gap-[0.625rem] tab:bg-text-primary tab:p-[0.625rem]">
                <span className="text-[0.625rem] font-semibold text-white tab:text-base tab:font-bold">
                  대표사진
                </span>
              </div>
            )}

            {/* 삭제 버튼 (X) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(index)
              }}
              className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-text-primary/60 tab:right-[0.323rem] tab:top-[0.323rem] tab:size-6"
              aria-label={`이미지 ${index + 1} 삭제`}
            >
              <CloseIcon className="size-2.5 text-white tab:size-3.5" />
            </button>

            {/* 순번 — desktop only */}
            {!hasRepresentative && (
              <div className="pointer-events-none absolute left-0 top-0 hidden size-[2.822rem] items-center justify-center tab:flex">
                <span className="text-[1.562rem] font-bold leading-[1.552rem] text-white">
                  {index + 1}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Image Preview Modal (기본 모드) */}
      {!hasRepresentative && (
        <ImageModal
          images={images}
          initialIndex={modalIndex}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onDelete={onRemove}
        />
      )}

      {/* 대표사진 모바일 액션 모달 */}
      {hasRepresentative && (
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent className="fixed left-1/2 top-1/2 z-50 w-[16rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white">
              <DialogTitle className="sr-only">이미지 옵션</DialogTitle>
              <div className="flex flex-col">
                {!isRepresentative(actionIndex) && (
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="w-full py-3.5 text-center text-sm font-medium text-text-primary"
                      onClick={() => onSetRepresentative?.(actionIndex)}
                    >
                      대표사진으로 변경
                    </button>
                  </DialogClose>
                )}
                <DialogClose asChild>
                  <button
                    type="button"
                    className="w-full border-t border-[#e7e7e7] py-3.5 text-center text-sm font-medium text-red-500"
                    onClick={() => onRemove(actionIndex)}
                  >
                    이미지 삭제
                  </button>
                </DialogClose>
                <DialogClose asChild>
                  <button
                    type="button"
                    className="w-full border-t border-[#e7e7e7] py-3.5 text-center text-sm font-medium text-text-primary"
                  >
                    취소
                  </button>
                </DialogClose>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      )}

      {/* 대표사진 데스크탑 이미지 모달 */}
      {hasRepresentative && (
        <ImageModal
          images={images}
          initialIndex={desktopModalIndex}
          open={desktopModalOpen}
          onOpenChange={setDesktopModalOpen}
          onDelete={onRemove}
          onSetRepresentative={onSetRepresentative}
          representativeIndex={representativeIndex}
        />
      )}
    </div>
  )
}

export { ImageUploadArea }
