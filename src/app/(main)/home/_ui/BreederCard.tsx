'use client'

import { Badge, MediaCard } from '@/shared/ui'
import { LocationOnIcon } from '@/shared/assets'
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
 * 아이콘(IconStar 2949-296222)은 픽셀 마름모다 — 미등록은 흰색 60% 외곽선, 등록은 투톤 채움.
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
              <Badge variant="primaryOutline" size="md" className="tab:h-[1.8125rem] tab:text-sm">
                인기
              </Badge>
            </div>
          )}

          {/* 즐겨찾기 토글 — 프로필 카드와 같은 공용 버튼 (박스 mo 32 / pc 48, 글리프 24 / 40).
              이미지 위라 미등록 색만 흰색 60% 로 덮는다 */}
          <FavoriteBreederIconButton
            breederId={breeder.id}
            isFavorited={!!breeder.isFavorited}
            size="card"
            iconClassName={breeder.isFavorited ? undefined : 'text-white/60'}
            className="absolute right-2 bottom-1 tab:right-3 tab:bottom-2"
          />
        </>
      }
    >
      {/* 이름 mo 12 / pc 16 bold, 위치 mo 10 / pc 14 medium #6b6b6b */}
      <p className="truncate text-xs leading-[1.5] font-semibold text-neutral-850 tab:text-base">
        {breeder.nickname}
      </p>
      <div className="flex min-w-0 items-center">
        <LocationOnIcon className="size-5 shrink-0 text-neutral-700 tab:size-6" />
        <span className="truncate text-[0.625rem] leading-[1.5] font-medium text-neutral-700 tab:text-sm">
          {breeder.location}
        </span>
      </div>
    </MediaCard>
  )
}

export { BreederCard }
