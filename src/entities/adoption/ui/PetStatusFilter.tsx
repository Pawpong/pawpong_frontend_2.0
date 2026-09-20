'use client'

import type { PetStatus } from '@/shared/types'
import { FilterChip } from '@/shared/ui'
import { ADOPTION_CARD_STATUS } from './adoptionCardStatus'

// 상태 목록·라벨 단일 소스는 ADOPTION_CARD_STATUS (카드 뱃지와 같은 곳)
const STATUS_FILTERS = Object.keys(ADOPTION_CARD_STATUS) as PetStatus[]

interface PetStatusFilterProps {
  /** null = 전체 */
  value: PetStatus | null
  onChange: (next: PetStatus | null) => void
}

/** 분양 목록 상태 필터 칩 줄. 같은 칩을 다시 누르면 해제 -> 전체 */
const PetStatusFilter = ({ value, onChange }: PetStatusFilterProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <FilterChip size="responsive" selected={value === null} onClick={() => onChange(null)}>
      전체
    </FilterChip>
    {STATUS_FILTERS.map((status) => (
      <FilterChip
        key={status}
        size="responsive"
        selected={value === status}
        onClick={() => onChange(value === status ? null : status)}
      >
        {ADOPTION_CARD_STATUS[status].label}
      </FilterChip>
    ))}
  </div>
)

export { PetStatusFilter }
