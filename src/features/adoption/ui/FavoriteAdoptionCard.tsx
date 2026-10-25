'use client'

import { AdoptionGridCard } from '@/entities/adoption'
import type { AdoptionListingCard } from '@/shared/types'
import { useToggleAdoptionFavorite } from '../api/adoption.mutations'

interface FavoriteAdoptionGridCardProps {
  listing: AdoptionListingCard
  preload?: boolean
}

/**
 * 탐색·저장목록·홈 공용 분양 카드에 관심(좋아요) mutation 을 연결한 features 레이어 래퍼 (Figma 797-93446).
 * (entities → features 역방향 import 금지이므로 연결은 이 래퍼에서 수행)
 */
const FavoriteAdoptionGridCard = ({ listing, preload }: FavoriteAdoptionGridCardProps) => {
  const { isFavorite, toggleFavorite } = useToggleAdoptionFavorite(
    listing.listingId,
    listing.isFavorited,
  )

  return (
    <AdoptionGridCard
      listing={listing}
      preload={preload}
      isFavorite={isFavorite}
      onToggle={toggleFavorite}
    />
  )
}

export { FavoriteAdoptionGridCard }
