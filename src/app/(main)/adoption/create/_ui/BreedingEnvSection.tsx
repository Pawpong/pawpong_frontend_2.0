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
  <FormSection
    title="생활 환경"
    step={5}
    description="아이가 지내온 공간과 돌봄 방식을 알려주세요. 사진은 1장까지 등록할 수 있어요."
  >
    {/* Figma 3137-387145: PC는 이미지 372 + 텍스트영역 2단(gap 20), 텍스트영역 높이 207 */}
    <div className="flex flex-col gap-5">
      <ImageField
        images={images}
        onAdd={onAddImages}
        onRemove={onRemoveImage}
        maxImages={BREEDING_ENV_IMAGE_MAX}
      />
      <Textarea
        aria-label="생활 환경 소개"
        placeholder="생활 공간, 청결 관리, 먹이와 활동 환경 등을 소개해주세요"
        className="min-h-32"
        maxLength={BREEDING_ENV_DESCRIPTION_MAX_LENGTH}
        {...register('breedingEnvDescription')}
      />
    </div>
  </FormSection>
)

export { BreedingEnvSection }
