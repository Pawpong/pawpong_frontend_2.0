'use client'

import Image from 'next/image'
import { cn } from '@/shared/lib/cn'
import type { AdoptionDetailDto } from '@/shared/types'
import { EmptyState } from '@/shared/ui'
import { DETAIL_TYPE, PHOTO_GRID_COLS } from '../_lib/detailTypography'
import { DetailSection } from './DetailSection'

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
      sizes="(max-width: 1439px) 191px, 320px"
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
    <DetailSection title="사육 환경" className={className}>
      {/* [refactored] 모바일/pc 단일 레이아웃 — 설명·이미지맵 1벌, 순서만 flex order로 분기 */}
      {/* 모바일: 설명 → 이미지 / pc: 이미지 → 설명 (order로 순서만 전환) */}
      <div className="flex flex-col gap-3 tab:gap-4">
        {description ? (
          <p className={cn(DETAIL_TYPE.prose, 'order-1 pc:order-2')}>{description}</p>
        ) : (
          imageUrls.length === 0 && (
            <EmptyState message="등록된 사육 환경 정보가 없어요." size="compact" />
          )
        )}
        {/* 사진이 없으면 빈 영역이 자리를 차지하지 않도록 행 자체를 렌더하지 않음 */}
        {imageUrls.length > 0 && (
          <div className={cn(PHOTO_GRID_COLS, 'order-2 gap-3 pc:order-1')}>
            {imageUrls.map((url, i) => (
              <EnvImageButton
                key={`env-${i}`}
                src={url}
                index={i}
                onClick={() => onImageClick?.(imageUrls, i)}
                className="aspect-[4/3] w-full"
              />
            ))}
          </div>
        )}
      </div>
    </DetailSection>
  )
}

export { BreedingEnvironmentCard }
