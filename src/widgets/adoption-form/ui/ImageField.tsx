'use client'

import { cn } from '@/shared/lib/cn'
import { ImageUploadArea, TextLabel } from '@/shared/ui'

interface ImageFieldProps {
  images: string[]
  onAdd: (files: FileList) => void
  onRemove: (index: number) => void
  maxImages: number
  requirement?: '필수' | '선택'
  representativeIndex?: number
  onSetRepresentative?: (index: number) => void
  className?: string
}

/** 사진 필드의 폭은 배치하는 화면에서 결정한다. */
const ImageField = ({ className, requirement = '선택', ...props }: ImageFieldProps) => (
  <div className={cn('flex min-w-0 flex-col gap-3', className)}>
    <TextLabel size="14" requirement={requirement}>
      사진
    </TextLabel>
    <ImageUploadArea size="post" hideLabel {...props} />
  </div>
)

export { ImageField }
