import type { AdoptionListingCard } from '@/shared/types'
import { ListingCardGrid } from '@/shared/ui'
import { FavoriteAdoptionGridCard } from './FavoriteAdoptionCard'

interface AdoptionCardGridProps {
  listings: readonly AdoptionListingCard[]
}

/** 입양 탐색·저장목록 공용 그리드. 호출부는 조회한 목록만 전달한다. */
const AdoptionCardGrid = ({ listings }: AdoptionCardGridProps) => (
  <ListingCardGrid
    items={listings}
    getKey={(listing) => listing.listingId}
    renderItem={(listing) => <FavoriteAdoptionGridCard listing={listing} />}
  />
)

export { AdoptionCardGrid }
