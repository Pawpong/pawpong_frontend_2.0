import type { AdoptionListingCard } from '@/shared/types'
import type { StatusTone } from '@/shared/ui'

// 입양 상태 라벨 + 상태 표시 tone 단일 소스 (앱 전역 상태 표기 공용).
export const ADOPTION_CARD_STATUS: Record<
  AdoptionListingCard['status'],
  { label: string; tone: StatusTone }
> = {
  available: { label: '분양중', tone: 'available' },
  reserved: { label: '예약중', tone: 'waiting' },
  adopted: { label: '분양완료', tone: 'done' },
}
