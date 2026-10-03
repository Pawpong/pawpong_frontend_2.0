import { Badge } from '@/shared/ui'
import type { AdoptionListingCard } from '@/shared/types'
import { ADOPTION_CARD_STATUS } from './adoptionCardStatus'

// [refactored] 입양 상태 뱃지 — variant+label 룩업 중복 제거 (카드 전반 공용)
// 크기는 제목 옆 상태 뱃지 규격(responsive) 하나로 고정한다. className 은 배치(표시 여부·shrink)용으로만 쓴다.
export const AdoptionStatusBadge = ({
  status,
  className,
}: {
  status: AdoptionListingCard['status']
  className?: string
}) => (
  <Badge variant={ADOPTION_CARD_STATUS[status].variant} size="responsive" className={className}>
    {ADOPTION_CARD_STATUS[status].label}
  </Badge>
)
