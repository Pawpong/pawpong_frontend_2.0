'use client'

import { useToggleAdoptionFavorite } from '@/features/adoption'
import { AdoptionGridCard } from '@/entities/adoption'
import type { AdoptionListingCard } from '@/shared/types'

// 탐색 그리드 카드 — 공용 AdoptionGridCard에 관심 토글만 연결
const ExploreAdoptionCard = ({ listing }: { listing: AdoptionListingCard }) => {
  const { isFavorite, toggleFavorite } = useToggleAdoptionFavorite(
    listing.listingId,
    listing.isFavorited,
  )

  return <AdoptionGridCard listing={listing} isFavorite={isFavorite} onToggle={toggleFavorite} />
}

export { ExploreAdoptionCard }
