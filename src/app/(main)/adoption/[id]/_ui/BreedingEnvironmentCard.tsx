'use client'

import { cn } from '@/shared/lib/cn'
import type { AdoptionDetailDto } from '@/shared/types'
import { EmptyState } from '@/shared/ui'
import { TEXT } from '@/shared/config'
import { PHOTO_GRID_COLS } from '../_lib/detailTypography'
import { DetailPhotoButton } from './DetailPhotoButton'
import { DetailSection } from './DetailSection'

interface BreedingEnvironmentCardProps {
  detail: AdoptionDetailDto
  onImageClick?: (images: string[], index?: number) => void
  className?: string
}

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
          <p className={cn(TEXT.prose, 'order-1 pc:order-2')}>{description}</p>
        ) : (
          imageUrls.length === 0 && (
            <EmptyState message="등록된 사육 환경 정보가 없어요." size="compact" />
          )
        )}
        {/* 사진이 없으면 빈 영역이 자리를 차지하지 않도록 행 자체를 렌더하지 않음 */}
        {imageUrls.length > 0 && (
          <div className={cn(PHOTO_GRID_COLS, 'order-2 gap-3 pc:order-1')}>
            {imageUrls.map((url, i) => (
              // [refactored] 부모 정보와 같은 사진 버튼 (EnvImageButton 대체)
              <DetailPhotoButton
                key={`env-${i}`}
                src={url}
                alt={`사육 환경 ${i + 1}`}
                sizes="(max-width: 1439px) 191px, 320px"
                onClick={() => onImageClick?.(imageUrls, i)}
              />
            ))}
          </div>
        )}
      </div>
    </DetailSection>
  )
}

export { BreedingEnvironmentCard }
