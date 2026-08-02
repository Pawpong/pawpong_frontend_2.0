import type { AdoptionListingCard } from '@/shared/types'
import { AdoptionGridCard } from './AdoptionGridCard'

interface AdoptionShowcaseCardProps {
  listing: AdoptionListingCard
  className?: string
  isFavorite?: boolean
  onToggle?: () => void
}

/** 홈 분양 쇼케이스용 카드 — 공용 AdoptionGridCard(layout="showcase") 위임. 관심 연결은 features 래퍼가 담당한다. */
const AdoptionShowcaseCard = ({
  listing,
  className,
  isFavorite,
  onToggle,
}: AdoptionShowcaseCardProps) => (
  <AdoptionGridCard
    listing={listing}
    className={className}
    isFavorite={isFavorite}
    onToggle={onToggle}
  />
)

export { AdoptionShowcaseCard }
export type { AdoptionShowcaseCardProps }
