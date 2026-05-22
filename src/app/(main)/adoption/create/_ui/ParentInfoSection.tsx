'use client'

import { useState, useCallback } from 'react'
import { InfoIcon } from '@/shared/assets/icons'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import { ImageUploadArea } from '@/app/(main)/post/create/_ui/ImageUploadArea'

const ParentInfoSection = () => {
  const [images, setImages] = useState<string[]>([])

  const handleAddImages = useCallback((files: FileList) => {
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
    setImages((prev) => [...prev, ...newImages].slice(0, 1))
  }, [])

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-[#f5f5f5] p-3.5 tab:p-[1.875rem]">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium leading-[1.375rem] text-text-primary tab:text-xl tab:font-semibold">
          부모 정보
        </span>
        <span className="text-xs font-medium leading-[1.375rem] text-text-primary tab:text-base tab:leading-[1.5]">
          선택
        </span>
        <InfoIcon className="size-4 text-text-primary" />
      </div>

      <div className="flex flex-col gap-1.5 tab:flex-row tab:gap-6">
        {/* 이미지 (데스크탑에서 좌측) */}
        <div className="hidden tab:block tab:pt-1.5">
          <p className="mb-1.5 text-base font-bold leading-[1.5] text-text-primary">
            이미지
          </p>
          <ImageUploadArea
            images={images}
            onAdd={handleAddImages}
            onRemove={handleRemoveImage}
            hideLabel
            maxImages={1}
          />
        </div>

        {/* 폼 필드 */}
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-col gap-1.5 tab:px-0">
            <p className="text-sm font-bold leading-[1.5] text-text-primary tab:text-base">관계</p>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="엄마" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mom">엄마</SelectItem>
                <SelectItem value="dad">아빠</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 tab:px-0">
            <p className="text-sm font-bold leading-[1.5] text-text-primary tab:text-base">
              품종 및 이름
            </p>
            <Input placeholder="입력" />
          </div>
          <div className="flex flex-col gap-1.5 tab:px-0">
            <p className="text-sm font-bold leading-[1.5] text-text-primary tab:text-base">
              태어난 날짜
            </p>
            <Input placeholder="입력" />
          </div>
          {/* 이미지 (모바일에서 하단) */}
          <div className="tab:hidden">
            <ImageUploadArea
              images={images}
              onAdd={handleAddImages}
              onRemove={handleRemoveImage}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mx-auto mt-1.5 h-7 rounded-[0.375rem] bg-[#a8a8a8] px-[0.625rem] text-sm font-medium text-white tab:h-auto tab:w-[28.625rem] tab:rounded-full tab:p-[0.625rem] tab:text-sm"
      >
        부모 정보 추가하기
      </button>
    </div>
  )
}

export { ParentInfoSection }
