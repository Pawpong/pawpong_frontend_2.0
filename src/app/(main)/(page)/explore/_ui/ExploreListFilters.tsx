'use client'

import { FilterTab, PopularBadgeContent } from '@/shared/ui'

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

/** 목록 바로 위 오른쪽 필터 — 입양 탭·브리더 탭 공용 */
const ExploreListFilters = ({ value, onChange, ariaLabel }: ExploreListFiltersProps) => (
  <div className="flex shrink-0 items-center justify-end gap-2" aria-label={ariaLabel}>
    {FILTERS.map((filter) => (
      <FilterTab
        key={filter.value}
        selected={value === filter.value}
        onClick={() => onChange(filter.value)}
      >
        {filter.value === 'popular' ? <PopularBadgeContent size="responsive" /> : filter.label}
      </FilterTab>
    ))}
  </div>
)

export { ExploreListFilters }
