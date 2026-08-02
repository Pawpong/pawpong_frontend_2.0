import type { AdoptionListingCard } from '@/shared/types'

// [refactored] 카드 배지용 상태 라벨/variant — ExploreAdoptionCard·AdoptionShowcaseCard 공용
// (shared/types의 ADOPTION_STATUS_LABEL과 문구가 다름: 카드는 "분양중"/"분양완료")

export const ADOPTION_CARD_STATUS_LABEL: Record<AdoptionListingCard['status'], string> = {
  available: '분양중',
  reserved: '예약중',
  completed: '분양완료',
}

// 분양중/예약중 → 파랑 채움, 분양완료 → 회색 채움
export const ADOPTION_CARD_STATUS_VARIANT: Record<
  AdoptionListingCard['status'],
  'primaryFilled' | 'neutralFilled'
> = {
  available: 'primaryFilled',
  reserved: 'primaryFilled',
  completed: 'neutralFilled',
}
