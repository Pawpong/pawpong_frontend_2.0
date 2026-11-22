import { StatusLabel } from '@/shared/ui'
import type { AdoptionListingCard } from '@/shared/types'
import { ADOPTION_CARD_STATUS } from './adoptionCardStatus'

// 입양 상태 표시 — 카드 전반 공용. 모양은 StatusLabel 하나로 고정한다.
export const AdoptionStatusBadge = ({
  status,
  size,
}: {
  status: AdoptionListingCard['status']
  /** 목록 카드는 sm */
  size?: 'md' | 'sm'
}) => (
  <StatusLabel tone={ADOPTION_CARD_STATUS[status].tone} size={size}>
    {ADOPTION_CARD_STATUS[status].label}
  </StatusLabel>
)
