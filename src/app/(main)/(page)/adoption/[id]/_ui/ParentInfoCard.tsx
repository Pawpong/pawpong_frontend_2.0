import { EmptyState } from '@/shared/ui'
import { GenderIcon } from '@/shared/assets'
import type { AdoptionDetailDto } from '@/shared/types'
import { cn } from '@/shared/lib/cn'
import { TEXT } from '@/shared/config'
import { PHOTO_GRID_COLS } from '../_lib/detailTypography'
import { DetailPhotoButton } from './DetailPhotoButton'
import { DetailSection } from './DetailSection'

interface ParentInfoCardProps {
  detail: AdoptionDetailDto
  onImageClick?: (images: string[], index?: number) => void
}

const ParentInfoCard = ({ detail, onImageClick }: ParentInfoCardProps) => {
  // [refactored] onClick마다 재계산하던 부모 이미지 배열을 한 번만 계산
  const parentImages = detail.parents.map((p) => p.imageUrl)

  return (
    <DetailSection title="부모 정보">
      {detail.parents.length === 0 && (
        <EmptyState message="등록된 부모 정보가 없어요." size="compact" />
      )}

      {/* 세로 배치: 정사각 이미지 → 이름 + 성별 아이콘 → 생일 */}
      <div className={cn(PHOTO_GRID_COLS, 'gap-4 tab:gap-5')}>
        {detail.parents.map((parent, i) => (
          <div key={parent.role} className="flex flex-col items-start gap-3">
            {/* [refactored] 사육 환경과 같은 사진 버튼 */}
            <DetailPhotoButton
              src={parent.imageUrl}
              alt={`${parent.role} 사진`}
              sizes="(max-width: 767px) 40vw, 200px"
              onClick={() => onImageClick?.(parentImages, i)}
            />

            {/* 이전 프론트처럼 배지 없이 이름 + 성별 아이콘, 아래 생일. 엄마·아빠는 아이콘이 알린다 */}
            <div className="flex w-full min-w-0 flex-col gap-0.5">
              <div className={cn('flex items-center gap-0.5', TEXT.body)}>
                <span className="min-w-0 truncate">{parent.name}</span>
                <span className="sr-only">({parent.role})</span>
                <GenderIcon
                  gender={parent.role === '엄마' ? 'female' : 'male'}
                  className="size-5"
                />
              </div>
              <span className={TEXT.meta}>{parent.birthDate}</span>
            </div>
          </div>
        ))}
      </div>
    </DetailSection>
  )
}

export { ParentInfoCard }
