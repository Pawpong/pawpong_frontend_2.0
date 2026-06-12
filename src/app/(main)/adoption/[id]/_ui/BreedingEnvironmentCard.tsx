'use client'

import Image from 'next/image'
import { cn } from '@/shared/lib/cn'
import type { AdoptionDetailDto } from '@/shared/types'

interface BreedingEnvironmentCardProps {
  detail: AdoptionDetailDto
  onImageClick?: (images: string[], index?: number) => void
}

// [refactored] 사육 환경 이미지 버튼 — 모바일/데스크탑 중복 제거 (크기만 className)
const EnvImageButton = ({
  src,
  index,
  className,
  onClick,
}: {
  src: string
  index: number
  className: string
  onClick?: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn('relative shrink-0 overflow-hidden rounded-[0.5rem] bg-[#c6c6c6]', className)}
  >
    <Image src={src} alt={`사육 환경 ${index + 1}`} fill className="object-cover" />
  </button>
)

const BreedingEnvironmentCard = ({ detail, onImageClick }: BreedingEnvironmentCardProps) => {
  const { description, imageUrls } = detail.breedingEnvironment

  return (
    <div className="overflow-hidden rounded-[1rem] bg-[#f5f5f5] p-[0.875rem] pc:p-[1.25rem]">
      {/* 모바일: 세로 레이아웃 */}
      <div className="pc:hidden">
        <p className="text-[0.75rem] leading-[1.375rem] font-medium text-[#5d5d5d]">사육 환경</p>
        <p className="mt-[0.5rem] text-[0.875rem] leading-[1.5] font-semibold text-[#5d5d5d]">
          {description}
        </p>
        <div className="mt-[0.75rem] flex gap-[0.6875rem] overflow-x-auto">
          {/* [refactored] EnvImageButton 사용 */}
          {imageUrls.map((url, i) => (
            <EnvImageButton
              key={`env-mo-${i}`}
              src={url}
              index={i}
              onClick={() => onImageClick?.(imageUrls, i)}
              className="h-[8.125rem] w-[11.9375rem]"
            />
          ))}
        </div>
      </div>

      {/* 데스크탑: 세로 — 제목 → 이미지 스트립(320×240) → 설명 (피그마 1226-46244 environment) */}
      <div className="hidden pc:flex pc:flex-col pc:gap-[1.25rem]">
        <p className="text-[1.25rem] leading-[1.5] font-semibold text-[#3e3e3e]">사육 환경</p>
        <div className="flex gap-[0.75rem] overflow-x-auto">
          {/* [refactored] EnvImageButton 사용 */}
          {imageUrls.map((url, i) => (
            <EnvImageButton
              key={`env-pc-${i}`}
              src={url}
              index={i}
              onClick={() => onImageClick?.(imageUrls, i)}
              className="h-[15rem] w-[20rem]"
            />
          ))}
        </div>
        <p className="text-[1rem] leading-[1.5] font-semibold text-[#5d5d5d]">{description}</p>
      </div>
    </div>
  )
}

export { BreedingEnvironmentCard }
