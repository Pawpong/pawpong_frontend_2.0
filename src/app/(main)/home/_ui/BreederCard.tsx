'use client'

import { Badge, LocationText, MediaCard } from '@/shared/ui'
import { formatJoinedBreederLocation } from '@/shared/lib/formatBreederLocation'
import { FavoriteBreederIconButton } from './FavoriteBreederIconButton'
import type { FavoriteBreeder } from '@/shared/types'

interface BreederCardProps {
  breeder: FavoriteBreeder
  showPopularBadge?: boolean
  preload?: boolean
}

/**
 * 브리더 카드 (Figma CardStar 816-102863) — 즐겨찾기 탭·브리더 탐색 공용.
 *
 * 셸(이미지 + 본문 좌측 텍스트 + 우측 뱃지)은 분양 카드와 같아 MediaCard 로 공유하고,
 * 규격만 이 시안을 따른다: medium(모바일 164) / large(PC 282).
 * 즐겨찾기는 프로필과 같은 픽셀 별 버튼을 사용하며, 사진과 무관하게 상태가 읽히도록 바탕을 둔다.
 */
const BreederCard = ({ breeder, showPopularBadge, preload = false }: BreederCardProps) => {
  return (
    <MediaCard
      href={`/home/${breeder.id}`}
      thumbnailUrl={breeder.imageUrl ?? undefined}
      alt={breeder.nickname}
      preload={preload}
      // 시안: mo 164x133.84 / pc 282x230 (비율 동일), radius mo 4 / pc 8
      thumbnailClassName="aspect-[282/230] rounded tab:rounded-lg"
      overlay={
        <>
          {/* 인기 뱃지 — 좌상단, 박스 mo px-8 py-4 / pc px-12 py-8 */}
          {showPopularBadge && (
            <div className="absolute top-1 left-2 flex items-center tab:top-2 tab:left-3">
              <Badge variant="primaryOutline" size="responsive">
                인기
              </Badge>
            </div>
          )}

          <span className="absolute right-2 bottom-2 flex tab:right-3 tab:bottom-3">
            <FavoriteBreederIconButton
              breederId={breeder.id}
              isFavorited={!!breeder.isFavorited}
              size="card"
            />
          </span>
        </>
      }
    >
      {/* 이름 mo 12 / pc 16 bold */}
      <p className="truncate text-xs leading-[1.5] font-semibold text-neutral-850 tab:text-base">
        {breeder.nickname}
      </p>
      <LocationText location={formatJoinedBreederLocation(breeder.location)} size="compact" />
    </MediaCard>
  )
}

export { BreederCard }
