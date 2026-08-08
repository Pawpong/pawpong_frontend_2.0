import type { AdoptionListingCard } from '@/shared/types'

// 입양 상태 라벨 + 배지 variant 단일 소스 (앱 전역 상태 표기 공용).
// 분양중/예약중 → primary 아웃라인(743-68288), 분양완료 → 회색 채움.
export const ADOPTION_CARD_STATUS: Record<
  AdoptionListingCard['status'],
  { label: string; variant: 'primaryOutline' | 'neutralFilled' }
> = {
  available: { label: '분양중', variant: 'primaryOutline' },
  reserved: { label: '예약중', variant: 'primaryOutline' },
  completed: { label: '분양완료', variant: 'neutralFilled' },
}
