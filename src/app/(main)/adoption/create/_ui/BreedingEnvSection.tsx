'use client'

import type { UseFormRegister } from 'react-hook-form'
import { Textarea } from '@/shared/ui'
import { BREEDING_ENV_DESCRIPTION_MAX_LENGTH, BREEDING_ENV_IMAGE_MAX } from '../_lib/constants'
import type { AdoptionCreateFormValues } from '../_lib/schema'
import { FormSection } from './FormSection'
import { ImageField } from './ImageField'

interface BreedingEnvSectionProps {
  register: UseFormRegister<AdoptionCreateFormValues>
  images: string[]
  onAddImages: (files: FileList) => void
  onRemoveImage: (index: number) => void
}

const BreedingEnvSection = ({
  register,
  images,
  onAddImages,
  onRemoveImage,
}: BreedingEnvSectionProps) => (
  <FormSection title="사육 환경">
    {/* Figma 3137-387145: PC는 이미지 372 + 텍스트영역 2단(gap 20), 텍스트영역 높이 207 */}
    <div className="flex flex-col gap-5 pc:flex-row">
      <ImageField
        images={images}
        onAdd={onAddImages}
        onRemove={onRemoveImage}
        maxImages={BREEDING_ENV_IMAGE_MAX}
      />
      <Textarea
        placeholder="사육 환경에 대해서 소개해주세요"
        className="pc:h-[12.9375rem] pc:flex-1"
        maxLength={BREEDING_ENV_DESCRIPTION_MAX_LENGTH}
        {...register('breedingEnvDescription')}
      />
    </div>
  </FormSection>
)

export { BreedingEnvSection }
