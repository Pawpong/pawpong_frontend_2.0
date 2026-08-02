'use client'

import Image from 'next/image'
import { Badge, ListingStats } from '@/shared/ui'
import { ADOPTION_STATUS_LABEL, GENDER_LABEL } from '@/shared/types'
import { FavoriteShareActions } from './FavoriteShareActions'
import { AdoptionCardHorizontal } from '@/entities/adoption'
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
  <div className="flex items-center rounded-[0.5rem] bg-neutral-50 px-[1.25rem] py-[0.75rem]">
    <div className="flex w-full items-center gap-[1.75rem]">
      {/* 이미지 + 인기 배지 */}
      <div className="relative aspect-[4/3] h-[13.125rem] w-[17.5rem] shrink-0 overflow-hidden rounded-[0.5rem] bg-[#c6c6c6]">
        <Image src={listing.thumbnailUrl} alt={listing.name} fill className="object-cover" />
        {listing.isPopular && (
          // [refactored] raw span → 공통 Badge(default 변형)
          <Badge variant="default" className="absolute top-[0.875rem] left-[1rem]">
            인기
          </Badge>
        )}
      </div>

      {/* 우측 정보 */}
      <div className="flex min-w-px flex-1 flex-col justify-between self-stretch">
        <div className="flex flex-col gap-[0.75rem]">
          {/* 제목 + 상태 배지 */}
          <div className="flex items-center gap-[0.5rem]">
            <p className="min-w-px truncate text-[1.25rem] leading-[1.5] font-semibold text-neutral-850">
              {listing.name} | {GENDER_LABEL[listing.gender]} {listing.ageText}
            </p>
            {/* [refactored] raw span → 공통 Badge(active 변형) */}
            <Badge variant="active" className="shrink-0">
              {ADOPTION_STATUS_LABEL[listing.status]}
            </Badge>
          </div>
          {listing.description && (
            <p className="line-clamp-3 text-[1rem] leading-[1.5] font-semibold text-neutral-850">
              {listing.description}
            </p>
          )}
        </div>

        {/* 하단: 문의/관심/조회 + 관심있어요/공유 */}
        <div className="flex w-full items-center gap-[0.5rem]">
          <ListingStats
            inquiryCount={listing.inquiryCount}
            favoriteCount={listing.favoriteCount}
            viewCount={listing.viewCount}
            size="lg"
            className="flex-1 gap-[0.5rem] text-neutral-700"
          />
          {/* [refactored] 공통 FavoriteShareActions 사용 */}
          <FavoriteShareActions isFavorite={isFavorite} onToggle={onToggle} />
        </div>
      </div>
    </div>
  </div>
)

export { OtherListingCard }
