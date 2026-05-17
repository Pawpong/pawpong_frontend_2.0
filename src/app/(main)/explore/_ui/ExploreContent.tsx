'use client'

import { useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { cn } from '@/shared/lib/Cn'
import { cafe24Proup } from '@/shared/lib/fonts'
import { SectionHeader } from '@/shared/ui'
import { SearchBar, PopularKeywords } from '@/features/search'
import { CategoryFilter } from '@/features/category-filter'
import { AdoptionCard, AdoptionCardHorizontal } from '@/entities/adoption'
import { createMockListings } from '@/shared/mocks/adoption'
import { CATEGORY_DESCRIPTION } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'

const VALID_CATEGORIES: AnimalCategory[] = ['all', 'dog', 'cat', 'lizard']

const mockListings = createMockListings()
const popularListings = mockListings.filter((l) => l.isPopular)

const ExploreContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const categoryParam = searchParams.get('category')
  const selectedCategory: AnimalCategory =
    categoryParam && VALID_CATEGORIES.includes(categoryParam as AnimalCategory)
      ? (categoryParam as AnimalCategory)
      : 'all'

  const handleCategoryChange = useCallback(
    (category: AnimalCategory) => {
      const params = new URLSearchParams(searchParams.toString())
      if (category === 'all') {
        params.delete('category')
      } else {
        params.set('category', category)
      }
      const query = params.toString()
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
    },
    [searchParams, router, pathname],
  )

  const [popularCollapsed, setPopularCollapsed] = useState(false)
  const [allCollapsed, setAllCollapsed] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-[67.5rem] flex-col">
      {/* 모바일 탭 — 입양 탐색 / 브리더 탐색 */}
      <div className="flex items-center tab:hidden">
        <button
          type="button"
          className={cn(
            cafe24Proup.className,
            'flex flex-1 items-center justify-center border-b-2 border-[#5d5d5d] p-[0.625rem] font-cafe24 text-[0.875rem] leading-[1.375rem] text-[#5d5d5d]',
          )}
        >
          입양 탐색
        </button>
        <button
          type="button"
          className={cn(
            cafe24Proup.className,
            'flex flex-1 items-center justify-center p-[0.625rem] font-cafe24 text-[0.75rem] leading-[1.375rem] text-[#a7a7a7]',
          )}
        >
          브리더 탐색
        </button>
      </div>

      {/* ══════ 모바일: 타이틀 + 카테고리 (gap12) ══════ */}
      <div className="flex flex-col gap-[0.75rem] py-5 tab:hidden">
        <p
          className={cn(
            cafe24Proup.className,
            'font-cafe24 text-center text-[0.875rem] leading-[1.5] text-[#5d5d5d]',
          )}
        >
          {CATEGORY_DESCRIPTION[selectedCategory]}
        </p>
        <CategoryFilter
          selected={selectedCategory}
          onChange={handleCategoryChange}
        />
      </div>

      {/* ══════ 데스크탑: 카테고리 (top146 → mt ~98px from header) ══════ */}
      <CategoryFilter
        selected={selectedCategory}
        onChange={handleCategoryChange}
        className="mt-[2.188rem] hidden tab:grid"
      />

      {/* 데스크탑 타이틀 — Pretendard Bold 20px, px100, h52, 중앙 정렬 (gap 35px from category) */}
      <p className="hidden px-[6.25rem] py-[0.625rem] text-center text-[1.25rem] font-bold leading-[1.375rem] text-[#5d5d5d] tab:mt-[2.188rem] tab:block">
        {CATEGORY_DESCRIPTION[selectedCategory]}
      </p>

      {/* 검색바 + 인기 검색어 */}
      <div className=" w-full tab:mx-auto tab:mt-[1.25rem] tab:max-w-[42.5rem]">
        <SearchBar />
        <PopularKeywords />
      </div>

      {/* ─── 인기 있는 동물들 (mo: top475→검색바 후 ~gap33, pc: top584→gap ~64px) ─── */}
      <section className="mt-[2.063rem] flex flex-col gap-[0.75rem] tab:mt-[4rem] tab:gap-[1.25rem]">
        <SectionHeader
          title={`인기있는 동물들 ${popularListings.length}`}
          collapsible
          collapsed={popularCollapsed}
          onToggle={() => setPopularCollapsed((prev) => !prev)}
        />
        {/* 모바일: 가로형 카드 리스트 (gap 12px) */}
        {!popularCollapsed && (
          <div className="flex flex-col gap-[0.75rem] tab:hidden">
            {popularListings.map((listing) => (
              <AdoptionCardHorizontal
                key={listing.listingId}
                listing={listing}
              />
            ))}
          </div>
        )}
        {/* 데스크탑: 3열 세로형 카드 (gap 18.493px) */}
        <div className="hidden tab:grid tab:grid-cols-3 tab:gap-[1.156rem]">
          {popularListings.map((listing) => (
            <AdoptionCard key={listing.listingId} listing={listing} />
          ))}
        </div>
      </section>

      {/* ─── 전체 입양 소식 (mo: gap20, pc: gap64→4rem) ─── */}
      <section className="mt-[1.25rem] flex flex-col gap-[0.75rem] tab:mt-[4rem] tab:gap-[1.25rem]">
        <SectionHeader
          title={`전체 입양 소식 ${mockListings.length}`}
          collapsible
          collapsed={allCollapsed}
          onToggle={() => setAllCollapsed((prev) => !prev)}
        />
        {/* 모바일 2열 / 데스크탑 3열, gap 피그마: mo 15.5px, pc 18.493px */}
        {!allCollapsed && (
          <div className="grid grid-cols-2 gap-[0.97rem] tab:hidden">
            {mockListings.map((listing) => (
              <AdoptionCard key={listing.listingId} listing={listing} />
            ))}
          </div>
        )}
        <div className="hidden tab:grid tab:grid-cols-3 tab:gap-[1.156rem]">
          {mockListings.map((listing) => (
            <AdoptionCard key={listing.listingId} listing={listing} />
          ))}
        </div>
      </section>

      {/* 하단 여백 */}
      <div className="h-[4rem]" />
    </div>
  )
}

export { ExploreContent }
