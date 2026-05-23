'use client'

import { Textarea } from '@/shared/ui'
import { useImageUpload } from '@/shared/lib/useImageUpload'
import { ImageUploadArea } from '@/app/(main)/post/create/_ui/ImageUploadArea'
import { FormSection } from './FormSection'

const BreedingEnvSection = () => {
  const { images, handleAddImages, handleRemoveImage } = useImageUpload()

  return (
    <FormSection title="사육 환경" required>
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
    </FormSection>
  )
}

export { BreedingEnvSection }
