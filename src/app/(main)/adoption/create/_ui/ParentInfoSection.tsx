'use client'

import { type Control, Controller, type UseFormRegister } from 'react-hook-form'
import { InfoIcon } from '@/shared/assets/icons'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import { useImageUpload } from '@/shared/lib/useImageUpload'
import { ImageUploadArea } from '@/app/(main)/post/create/_ui/ImageUploadArea'
import type { AdoptionCreateFormValues } from '../_lib/schema'
import { FormSection } from './FormSection'
import { AddRowButton } from './AddRowButton'

interface ParentInfoSectionProps {
  control: Control<AdoptionCreateFormValues>
  register: UseFormRegister<AdoptionCreateFormValues>
}

const ParentInfoSection = ({ control, register }: ParentInfoSectionProps) => {
  const { images, handleAddImages, handleRemoveImage } = useImageUpload({
    maxImages: 1,
  })

  return (
    <FormSection
      title="부모 정보"
      icon={<InfoIcon className="size-4 text-text-primary" />}
      className="gap-1.5"
    >
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
            <Controller
              name="parents.0.relationship"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="엄마" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mom">엄마</SelectItem>
                    <SelectItem value="dad">아빠</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5 tab:px-0">
            <p className="text-sm font-bold leading-[1.5] text-text-primary tab:text-base">
              품종 및 이름
            </p>
            <Input placeholder="입력" {...register('parents.0.breedAndName')} />
          </div>
          <div className="flex flex-col gap-1.5 tab:px-0">
            <p className="text-sm font-bold leading-[1.5] text-text-primary tab:text-base">
              태어난 날짜
            </p>
            <Input placeholder="입력" {...register('parents.0.birthDate')} />
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

      <AddRowButton label="부모 정보 추가하기" />
    </FormSection>
  )
}

export { ParentInfoSection }
