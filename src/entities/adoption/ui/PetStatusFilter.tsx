'use client'

import type { PetStatus } from '@/shared/types'
import { FilterTab } from '@/shared/ui'
import { ADOPTION_CARD_STATUS } from './adoptionCardStatus'

// 상태 목록·라벨 단일 소스는 ADOPTION_CARD_STATUS (카드 뱃지와 같은 곳)
const STATUS_FILTERS = Object.keys(ADOPTION_CARD_STATUS) as PetStatus[]

interface PetStatusFilterProps {
  /** null = 전체 */
  value: PetStatus | null
  onChange: (next: PetStatus | null) => void
}

/**
 * 분양 목록 상태 필터 칩 줄. 같은 칩을 다시 누르면 해제 -> 전체.
 * 탐색 화면 필터 칩과 같은 30px 칩이고, 375px 에서도 한 줄로 둔다.
 */
const PetStatusFilter = ({ value, onChange }: PetStatusFilterProps) => (
  <div className="flex shrink-0 items-center gap-1.5">
    <FilterTab look="chip" selected={value === null} onClick={() => onChange(null)}>
      전체
    </FilterTab>
    {STATUS_FILTERS.map((status) => (
      <FilterTab
        key={status}
        look="chip"
        selected={value === status}
        onClick={() => onChange(value === status ? null : status)}
      >
        {ADOPTION_CARD_STATUS[status].label}
      </FilterTab>
    ))}
  </div>
)

export { PetStatusFilter }
