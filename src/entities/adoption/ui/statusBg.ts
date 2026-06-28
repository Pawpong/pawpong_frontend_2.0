import type { AdoptionListingCard } from '@/shared/types'

// 상태별 배지 배경색 (variant="status" 카드 공통) — 분양중/예약중 다크, 분양완료 라이트그레이
export const ADOPTION_STATUS_BG: Record<AdoptionListingCard['status'], string> = {
  available: 'bg-[#5d5d5d]',
  reserved: 'bg-[#5d5d5d]',
  completed: 'bg-[#a4a4a4]',
}
