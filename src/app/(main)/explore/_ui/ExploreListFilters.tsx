'use client'

import { FilterChip, PopularBadgeContent } from '@/shared/ui'

export type ExploreListFilter = 'all' | 'available' | 'popular'

const FILTERS: Array<{ value: ExploreListFilter; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'available', label: '분양중' },
  { value: 'popular', label: '인기' },
]

interface ExploreListFiltersProps {
  value: ExploreListFilter
  onChange: (value: ExploreListFilter) => void
  ariaLabel: string
}

/** 전체 소식 섹션 헤더 우측 필터 칩 — 입양 탭·브리더 탭 공용 */
const ExploreListFilters = ({ value, onChange, ariaLabel }: ExploreListFiltersProps) => (
  <div className="flex shrink-0 items-center gap-2" aria-label={ariaLabel}>
    {FILTERS.map((filter) => (
      <FilterChip
        key={filter.value}
        selected={value === filter.value}
        onClick={() => onChange(filter.value)}
        size="responsive"
      >
        {filter.value === 'popular' ? <PopularBadgeContent size="responsive" /> : filter.label}
      </FilterChip>
    ))}
  </div>
)

export { ExploreListFilters }
