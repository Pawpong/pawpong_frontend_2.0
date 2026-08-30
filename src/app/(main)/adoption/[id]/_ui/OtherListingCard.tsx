'use client'

import Image from 'next/image'
import { Badge } from '@/shared/ui'
import { GenderIcon } from '@/shared/assets'
import { FavoriteShareActions } from './FavoriteShareActions'
import { AdoptionCardHorizontal, AdoptionStatusBadge } from '@/entities/adoption'
import { useToggleAdoptionFavorite } from '@/features/adoption'
import type { AdoptionListingCard } from '@/shared/types'

const OtherListingCard = ({ listing }: { listing: AdoptionListingCard }) => {
  // 모바일/데스크탑 변형이 같은 관심 상태를 공유하도록 부모에서 토글 훅 호출
  const { isFavorite, toggleFavorite } = useToggleAdoptionFavorite(
    listing.listingId,
    listing.isFavorited,
  )

  return (
    <>
      {/* 모바일·탭: 가로형 카드 — 다른 분양건 카드 패딩 8px (Figma card-2) */}
      <div className="pc:hidden">
        <AdoptionCardHorizontal
          listing={listing}
          isFavorite={isFavorite}
          onToggle={toggleFavorite}
          className="p-[0.5rem]"
        />
      </div>
      {/* 데스크탑: 가로형 큰 카드 */}
      <div className="hidden pc:block">
        <DesktopOtherListingCard
          listing={listing}
          isFavorite={isFavorite}
          onToggle={toggleFavorite}
        />
      </div>
    </>
  )
}

// 피그마 card-2 (node 1226-54636): bg #f6f6f6, 이미지 280×210 + 정보(제목/소개/통계/관심·공유)
const DesktopOtherListingCard = ({
  listing,
  isFavorite,
  onToggle,
}: {
  listing: AdoptionListingCard
  isFavorite: boolean
  onToggle: () => void
}) => (
  <div className="flex items-center rounded-lg bg-neutral-50 px-5 py-3">
    <div className="flex w-full items-center gap-7">
      {/* 이미지 + 인기 배지 */}
      <div className="relative aspect-[4/3] h-[13.125rem] w-[17.5rem] shrink-0 overflow-hidden rounded-lg bg-neutral-700">
        <Image src={listing.thumbnailUrl} alt={listing.name} fill className="object-cover" />
        {listing.isPopular && (
          // [refactored] raw span → 공통 Badge(default 변형)
          <Badge variant="default" className="absolute top-[0.875rem] left-4">
            인기
          </Badge>
        )}
      </div>

      {/* 우측 정보 */}
      <div className="flex min-w-px flex-1 flex-col justify-between self-stretch">
        <div className="flex flex-col gap-3">
          {/* 제목(이름 + 성별 아이콘) + 상태 배지 / 아래 나이 (Figma 1226-54636) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="flex min-w-px items-center gap-[0.125rem]">
                <p className="min-w-px truncate text-[1.25rem] leading-[1.5] font-semibold text-neutral-850">
                  {listing.name}
                </p>
                <GenderIcon gender={listing.gender} className="size-8 shrink-0" />
              </div>
              <AdoptionStatusBadge status={listing.status} className="shrink-0" />
            </div>
            <p className="truncate text-[0.875rem] leading-[1.5] font-medium text-neutral-850">
              {listing.birthDateText}
            </p>
          </div>
          {listing.description && (
            <p className="line-clamp-3 text-[1rem] leading-[1.5] font-semibold text-neutral-850">
              {listing.description}
            </p>
          )}
        </div>

        {/* 하단: 관심있어요/공유 (우측 정렬) */}
        {/* [refactored] 공통 FavoriteShareActions 사용 */}
        <div className="flex w-full items-center justify-end gap-2">
          <FavoriteShareActions isFavorite={isFavorite} onToggle={onToggle} />
        </div>
      </div>
    </div>
  </div>
)

export { OtherListingCard }
