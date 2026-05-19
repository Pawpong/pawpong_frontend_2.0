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

      <div className="flex flex-wrap gap-x-[1.438rem] gap-y-3">
        {/* Upload Button */}
        <button
          type="button"
          onClick={handleClick}
          className="flex h-[12.623rem] w-[12.363rem] flex-col items-center justify-center gap-[0.188rem] rounded-[0.596rem] border border-fill-placeholder"
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
            className="relative h-[12.623rem] w-[12.363rem] overflow-hidden rounded-[0.596rem] bg-fill-placeholder"
          >
            <Image
              src={src}
              alt={`업로드 이미지 ${index + 1}`}
              fill
              className="object-cover"
            />

            {/* 순번 */}
            <div className="absolute left-0 top-0 flex size-[2.822rem] items-center justify-center">
              <span className="text-[1.562rem] font-bold leading-[1.552rem] text-white">
                {index + 1}
              </span>
            </div>

            {/* 삭제 버튼 */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute right-[0.323rem] top-[0.323rem] flex size-[2.5rem] items-center justify-center"
              aria-label={`이미지 ${index + 1} 삭제`}
            >
              <div className="flex size-6 items-center justify-center rounded-full bg-text-primary/60">
                <CloseIcon className="size-3.5 text-white" />
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export { ImageUploadArea }
