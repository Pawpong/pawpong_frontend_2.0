'use client'

import { cn } from '@/shared/lib/cn'
import { TextLabel } from '@/shared/ui'
import { ImageUploadArea } from '@/widgets/post-form'

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

/** 이미지 업로드 박스 (Figma img box-layout 1056-46032) — 라벨 + 180 타일, PC 372 고정폭 */
const ImageField = ({ className, requirement = '선택', ...props }: ImageFieldProps) => (
  <div className={cn('flex flex-col gap-1 pc:w-93 pc:shrink-0 pc:gap-2', className)}>
    <TextLabel size="14" requirement={requirement}>
      이미지
    </TextLabel>
    <ImageUploadArea size="post" hideLabel {...props} />
  </div>
)

export { ImageField }
