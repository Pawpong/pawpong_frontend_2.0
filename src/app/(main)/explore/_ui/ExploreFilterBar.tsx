'use client'

import { useState } from 'react'
import Image from 'next/image'
import { SearchIcon, badgeVariants } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { ANIMAL_CATEGORIES, CATEGORY_LABEL } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'

interface ExploreFilterBarProps {
  selected: AnimalCategory
  onChange: (category: AnimalCategory) => void
  className?: string
}

// [refactored] 반복되던 pill 베이스 / 검색 라벨 스타일 상수화
const PILL_BASE = 'flex h-8 items-center rounded-full border bg-white'
const SEARCH_TEXT = 'text-[0.875rem] font-semibold text-[#6b6b6b]'

/* ═══════════════════════════════════════════════
   탭/모바일 카테고리 + 검색 한 줄 (Figma 1652-75035 / 1652-81824)
   - 기본: 카테고리 칩(badge) + 작은 "검색" 버튼
   - 검색 클릭 → 펼침: 필터 버튼 + 전체폭 검색바
   - 필터 클릭 → 다시 칩(뱃지) 형태로 복귀
   (모바일·태블릿 동일 로직)
   ═══════════════════════════════════════════════ */
const ExploreFilterBar = ({ selected, onChange, className }: ExploreFilterBarProps) => {
  const [searchExpanded, setSearchExpanded] = useState(false)

  // [refactored] 검색 라벨 + 아이콘 (full/small 검색 공통)
  const searchContent = (
    <>
      <span className={SEARCH_TEXT}>검색</span>
      <SearchIcon className="size-5 shrink-0 text-[#6b6b6b]" />
    </>
  )

  return (
    <div className={cn('flex items-center justify-between gap-3 py-3', className)}>
      {searchExpanded ? (
        <>
          {/* 필터 버튼 — 클릭 시 칩(뱃지) 형태로 복귀 */}
          <button
            type="button"
            onClick={() => setSearchExpanded(false)}
            className={cn(
              PILL_BASE,
              'shrink-0 gap-1 border-[#cacaca] px-2 text-[0.875rem] font-semibold whitespace-nowrap text-[#3e3e3e]',
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

          {/* 전체폭 검색바 */}
          <div
            className={cn(PILL_BASE, 'min-w-0 flex-1 justify-between gap-2 border-[#a6a6a6] px-2')}
          >
            {searchContent}
          </div>
        </>
      ) : (
        <>
          {/* 카테고리 칩 — 공통 Badge(default/active) */}
          <div className="flex flex-wrap items-center gap-2">
            {ANIMAL_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onChange(category)}
                className={badgeVariants({ variant: selected === category ? 'active' : 'default' })}
              >
                {CATEGORY_LABEL[category]}
              </button>
            ))}
          </div>

          {/* 작은 "검색" 버튼 — 클릭 시 검색바 펼침 */}
          <button
            type="button"
            onClick={() => setSearchExpanded(true)}
            className={cn(
              PILL_BASE,
              'max-w-[18.75rem] shrink-0 justify-center gap-0 border-[#a6a6a6] p-2 whitespace-nowrap',
            )}
          >
            {searchContent}
          </button>
        </>
      )}
    </div>
  )
}

export { ExploreFilterBar }
