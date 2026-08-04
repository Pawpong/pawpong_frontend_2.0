'use client'

import Image from 'next/image'
import { cn } from '@/shared/lib/cn'
import type { AdoptionDetailDto } from '@/shared/types'

interface BreedingEnvironmentCardProps {
  detail: AdoptionDetailDto
  onImageClick?: (images: string[], index?: number) => void
  className?: string
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
    <Image
      src={src}
      alt={`사육 환경 ${index + 1}`}
      fill
      sizes="(max-width: 1440px) 191px, 320px"
      className="object-cover"
    />
  </button>
)

const BreedingEnvironmentCard = ({
  detail,
  onImageClick,
  className,
}: BreedingEnvironmentCardProps) => {
  const { description, imageUrls } = detail.breedingEnvironment

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[1rem] bg-[#f5f5f5] p-[0.75rem] pc:p-[1.25rem]',
        className,
      )}
    >
      {/* [refactored] 모바일/pc 단일 레이아웃 — 제목·설명·이미지맵 1벌, 순서만 flex order로 분기 */}
      {/* 제목 (모바일 12px #5d5d5d / pc 20px #3e3e3e) */}
      <p className="text-[0.75rem] leading-[1.375rem] font-medium text-[#5d5d5d] pc:text-[1.25rem] pc:leading-[1.5] pc:font-semibold pc:text-neutral-850">
        사육 환경
      </p>

      {/* 모바일: 설명 → 이미지 / pc: 이미지 → 설명 (order로 순서만 전환) */}
      <div className="mt-[0.5rem] flex flex-col gap-[0.75rem] pc:mt-[1.25rem] pc:gap-[1.25rem]">
        <p className="order-1 text-[0.875rem] leading-[1.5] font-semibold text-[#5d5d5d] pc:order-2 pc:text-[1rem]">
          {description}
        </p>
        <div className="order-2 flex gap-[0.75rem] overflow-x-auto pc:order-1">
          {imageUrls.map((url, i) => (
            <EnvImageButton
              key={`env-${i}`}
              src={url}
              index={i}
              onClick={() => onImageClick?.(imageUrls, i)}
              className="h-[8.125rem] w-[11.9375rem] pc:h-[15rem] pc:w-[20rem]"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export { BreedingEnvironmentCard }
