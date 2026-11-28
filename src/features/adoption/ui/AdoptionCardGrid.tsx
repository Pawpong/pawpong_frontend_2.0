import type { AdoptionListingCard } from '@/shared/types'
import { ListingCardGrid } from '@/shared/ui'
import { FavoriteAdoptionGridCard } from './FavoriteAdoptionCard'

interface AdoptionCardGridProps {
  listings: readonly AdoptionListingCard[]
  /** 열 수 조정 — 옆에 필터 칸이 있어 목록이 좁아지는 자리(탐색 PC) */
  className?: string
}

/** 입양 탐색·저장목록 공용 그리드. 호출부는 조회한 목록만 전달한다. */
const AdoptionCardGrid = ({ listings, className }: AdoptionCardGridProps) => (
  <ListingCardGrid
    className={className}
    items={listings}
    getKey={(listing) => listing.listingId}
    renderItem={(listing, index) => (
      <FavoriteAdoptionGridCard listing={listing} preload={index < 4} />
    )}
  />
)

export { AdoptionCardGrid }
