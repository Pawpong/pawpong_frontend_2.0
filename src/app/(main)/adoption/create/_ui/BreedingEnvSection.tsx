'use client'

import { useState, useCallback } from 'react'
import { Textarea } from '@/shared/ui'
import { ImageUploadArea } from '@/app/(main)/post/create/_ui/ImageUploadArea'

const BreedingEnvSection = () => {
  const [images, setImages] = useState<string[]>([])

  const handleAddImages = useCallback((files: FileList) => {
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
    setImages((prev) => [...prev, ...newImages].slice(0, 10))
  }, [])

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[#f5f5f5] p-3.5 tab:p-[1.875rem]">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium leading-[1.375rem] text-text-primary tab:text-xl tab:font-semibold">
          사육 환경
        </span>
        <span className="text-xs font-medium leading-[1.375rem] text-text-primary tab:text-base tab:leading-[1.5]">
          필수
        </span>
      </div>

      <div className="flex flex-col gap-1.5 tab:px-0">
        <Textarea
          placeholder="사육환경에 대해서 알려주세요"
          className="h-[5.125rem] tab:h-[6.813rem]"
        />
        <ImageUploadArea
          images={images}
          onAdd={handleAddImages}
          onRemove={handleRemoveImage}
        />
      </div>
    </div>
  )
}

export { BreedingEnvSection }
