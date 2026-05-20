'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, CloseIcon } from '@/shared/assets/icons'
import { ImageModal } from '@/app/(main)/adoption/[id]/_ui/ImageModal'

const MAX_IMAGES = 10

interface ImageUploadAreaProps {
  images: string[]
  onAdd: (files: FileList) => void
  onRemove: (index: number) => void
}

const ImageUploadArea = ({ images, onAdd, onRemove }: ImageUploadAreaProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAdd(e.target.files)
      e.target.value = ''
    }
  }

  const handleImageClick = (index: number) => {
    setModalIndex(index)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-[0.375rem] tab:gap-3">
      <p className="text-sm leading-[1.5] text-text-primary tab:text-base">
        <span className="font-bold">이미지</span>{' '}
        <span className="hidden font-medium tab:inline">선택</span>
        <span className="text-xs font-medium tab:hidden">
          (최소 1장 이상 업로드 해주세요) 필수
        </span>
      </p>

      <div className="flex gap-[0.375rem] tab:flex-wrap tab:gap-x-[1.438rem] tab:gap-y-3">
        {/* Upload Button */}
        <button
          type="button"
          onClick={handleClick}
          className="flex size-[3.793rem] shrink-0 flex-col items-center rounded-[0.438rem] border border-[#cdcdcd] pb-[0.569rem] pl-[1.131rem] pr-[1.162rem] pt-[0.802rem] tab:h-[12.623rem] tab:w-[12.363rem] tab:items-center tab:justify-center tab:gap-[0.188rem] tab:rounded-[0.596rem] tab:border-fill-placeholder tab:p-0"
        >
          <ImageIcon className="size-[1.459rem] text-text-primary tab:size-[3.285rem]" />
          <span className="text-[0.729rem] font-medium text-text-primary tab:text-[1.642rem]">
            {images.length}/{MAX_IMAGES}
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
              className="hidden size-full tab:block"
              onClick={() => handleImageClick(index)}
              aria-label={`이미지 ${index + 1} 미리보기`}
            >
              <Image
                src={src}
                alt={`업로드 이미지 ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
            {/* Mobile — no click */}
            <Image
              src={src}
              alt={`업로드 이미지 ${index + 1}`}
              fill
              className="object-cover tab:hidden"
            />

            {/* 순번 — desktop only */}
            <div className="pointer-events-none absolute left-0 top-0 hidden size-[2.822rem] items-center justify-center tab:flex">
              <span className="text-[1.562rem] font-bold leading-[1.552rem] text-white">
                {index + 1}
              </span>
            </div>

            {/* 삭제 버튼 — desktop only */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute right-[0.323rem] top-[0.323rem] hidden size-[2.5rem] items-center justify-center tab:flex"
              aria-label={`이미지 ${index + 1} 삭제`}
            >
              <div className="flex size-6 items-center justify-center rounded-full bg-text-primary/60">
                <CloseIcon className="size-3.5 text-white" />
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Image Preview Modal */}
      <ImageModal
        images={images}
        initialIndex={modalIndex}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onDelete={onRemove}
      />
    </div>
  )
}

export { ImageUploadArea }
