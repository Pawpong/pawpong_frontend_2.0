import { Badge } from '@/shared/ui'
import type { AdoptionListingCard } from '@/shared/types'
import { ADOPTION_CARD_STATUS } from './adoptionCardStatus'

// [refactored] 입양 상태 뱃지 — variant+label 룩업 중복 제거 (카드 전반 공용)
export const AdoptionStatusBadge = ({
  status,
  size,
  className,
}: {
  status: AdoptionListingCard['status']
  size?: 'md' | 'lg'
  className?: string
}) => (
  <Badge variant={ADOPTION_CARD_STATUS[status].variant} size={size} className={className}>
    {ADOPTION_CARD_STATUS[status].label}
  </Badge>
)
