'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FilterChip, SearchButton } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { ANIMAL_CATEGORIES, CATEGORY_LABEL } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'

interface ExploreFilterBarProps {
  selected: AnimalCategory
  onChange: (category: AnimalCategory) => void
  /** 현재 적용된 검색어 — 검색바를 펼칠 때 초기값으로 채운다 */
  keyword?: string
  onSearch: (keyword: string) => void
  className?: string
}

const PILL_BASE = 'flex h-8 items-center rounded-full border bg-white'

/* ═══════════════════════════════════════════════
   탭/모바일 카테고리 + 검색 한 줄 (Figma 1652-75035 / 1652-81824)
   - 기본: 카테고리 칩(badge) + 작은 "검색" 버튼
   - 검색 클릭 → 펼침: 필터 버튼 + 전체폭 검색바
   - 필터 클릭 → 다시 칩(뱃지) 형태로 복귀
   (모바일·태블릿 동일 로직)
   ═══════════════════════════════════════════════ */
const ExploreFilterBar = ({
  selected,
  onChange,
  keyword = '',
  onSearch,
  className,
}: ExploreFilterBarProps) => {
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [query, setQuery] = useState(keyword)

  return (
    <div className={cn('flex items-center justify-between gap-3 py-3', className)}>
      {searchExpanded ? (
        /* 필터 버튼 — 클릭 시 칩(뱃지) 형태로 복귀 */
        <button
          type="button"
          onClick={() => setSearchExpanded(false)}
          className={cn(
            PILL_BASE,
            'shrink-0 gap-1 border-neutral-300 px-2 text-[0.875rem] font-semibold whitespace-nowrap text-neutral-850',
          )}
        >
          <Image
            src="/images/category/filter.svg"
            alt=""
            width={20}
            height={20}
            className="size-5"
          />
          필터
        </button>
      ) : (
        /* 카테고리 칩 — 공통 Badge(primary 채움/아웃라인, Figma 1652-81786) */
        <div className="flex flex-wrap items-center gap-2">
          {ANIMAL_CATEGORIES.map((category) => (
            <FilterChip
              key={category}
              selected={selected === category}
              onClick={() => onChange(category)}
            >
              {CATEGORY_LABEL[category]}
            </FilterChip>
          ))}
        </div>
      )}

      <SearchButton
        active={searchExpanded}
        value={query}
        onChange={setQuery}
        // 펼칠 때마다 현재 적용된 검색어로 되맞춘다 (상단 큰 검색바로 검색해도 어긋나지 않도록)
        onClick={() => {
          setQuery(keyword)
          setSearchExpanded(true)
        }}
        onSubmit={() => onSearch(query.trim())}
        className={cn(searchExpanded ? 'max-w-none min-w-0 flex-1' : 'shrink-0')}
      />
    </div>
  )
}

export { ExploreFilterBar }
