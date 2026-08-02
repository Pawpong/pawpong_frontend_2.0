'use client'

import { AdoptionCard, AdoptionCardHorizontal, AdoptionShowcaseCard } from '@/entities/adoption'
import type { AdoptionListingCard } from '@/shared/types'
import { useToggleAdoptionFavorite } from '../api/adoption.mutations'

interface FavoriteAdoptionCardProps {
  listing: AdoptionListingCard
  className?: string
}

/**
 * entities의 프레젠테이셔널 카드에 관심(좋아요) mutation을 연결한 features 레이어 래퍼.
 * (entities → features 역방향 import 금지이므로 연결은 이 래퍼에서 수행)
 */
// [refactored] 세로형/가로형 래퍼가 렌더 카드만 다르고 훅·prop 주입이 동일 → 팩토리로 통합
const createFavoriteCard = (
  Card: typeof AdoptionCard | typeof AdoptionCardHorizontal | typeof AdoptionShowcaseCard,
  displayName: string,
) => {
  const FavoriteCard = ({ listing, className }: FavoriteAdoptionCardProps) => {
    const { isFavorite, toggleFavorite } = useToggleAdoptionFavorite(
      listing.listingId,
      listing.isFavorited,
    )

    return (
      <Card
        listing={listing}
        className={className}
        isFavorite={isFavorite}
        onToggle={toggleFavorite}
      />
    )
  }
  FavoriteCard.displayName = displayName
  return FavoriteCard
}

const FavoriteAdoptionCard = createFavoriteCard(AdoptionCard, 'FavoriteAdoptionCard')
const FavoriteAdoptionCardHorizontal = createFavoriteCard(
  AdoptionCardHorizontal,
  'FavoriteAdoptionCardHorizontal',
)
const FavoriteAdoptionShowcaseCard = createFavoriteCard(
  AdoptionShowcaseCard,
  'FavoriteAdoptionShowcaseCard',
)

export { FavoriteAdoptionCard, FavoriteAdoptionCardHorizontal, FavoriteAdoptionShowcaseCard }
