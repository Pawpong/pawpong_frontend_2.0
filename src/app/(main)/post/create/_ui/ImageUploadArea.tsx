'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { ImageIcon, CloseIcon } from '@/shared/assets/icons'

const MAX_IMAGES = 10

interface ImageUploadAreaProps {
  images: string[]
  onAdd: (files: FileList) => void
  onRemove: (index: number) => void
}

const ImageUploadArea = ({ images, onAdd, onRemove }: ImageUploadAreaProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAdd(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base leading-[1.5] text-text-primary">
        <span className="font-bold">이미지</span>{' '}
        <span className="font-medium">선택</span>
      </p>

      <div className="flex flex-wrap gap-3">
        {/* Upload Button */}
        <button
          type="button"
          onClick={handleClick}
          className="flex h-[12.626rem] w-[12.363rem] flex-col items-center justify-center gap-[0.188rem] rounded-[0.596rem] border border-fill-placeholder tab:h-[12.626rem] tab:w-[12.363rem]"
        >
          <ImageIcon className="size-[3.285rem] text-text-primary" />
          <span className="text-[1.642rem] font-medium text-text-primary">
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
            className="relative h-[12.626rem] w-[12.363rem] overflow-hidden rounded-[0.596rem] border border-fill-placeholder"
          >
            <Image
              src={src}
              alt={`업로드 이미지 ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/50"
              aria-label={`이미지 ${index + 1} 삭제`}
            >
              <CloseIcon className="size-3.5 text-white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export { ImageUploadArea }
