'use client'

import { useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { SectionHeader, Tabs, TabsList, TabsTrigger } from '@/shared/ui'
import { SearchBar, PopularKeywords } from '@/features/search'
import { CategoryFilter } from '@/features/category-filter'
import { AdoptionCard, AdoptionCardHorizontal } from '@/entities/adoption'
import { createMockListings } from '@/shared/mocks/adoption'
import { ANIMAL_CATEGORIES } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'
import { BreederExploreContent } from './BreederExploreContent'
import { EXPLORE_TABS, SEARCH_PLACEHOLDERS } from '../_lib/constants'
import type { ExploreType } from '../_lib/constants'

const mockListings = createMockListings()
const popularListings = mockListings.filter((l) => l.isPopular)

const ExploreContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const typeParam = searchParams.get('type')
  const selectedType: ExploreType = typeParam === 'breeder' ? 'breeder' : 'adoption'

  const categoryParam = searchParams.get('category')
  const selectedCategory: AnimalCategory =
    categoryParam && ANIMAL_CATEGORIES.includes(categoryParam as AnimalCategory)
      ? (categoryParam as AnimalCategory)
      : 'all'

  const handleTypeChange = useCallback(
    (type: ExploreType) => {
      const params = new URLSearchParams()
      if (type === 'breeder') {
        params.set('type', 'breeder')
      }
      const query = params.toString()
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
    },
    [router, pathname],
  )

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
      {/* 탐색 탭 — 입양 탐색 / 브리더 탐색 (Figma 언더라인 탭: 모바일 md / 태블릿+ lg) */}
      <Tabs
        value={selectedType}
        onValueChange={(value) => handleTypeChange(value as ExploreType)}
        className="pt-3 tab:pt-4"
      >
        <TabsList variant="underline">
          {EXPLORE_TABS.map((tab) => (
            <TabsTrigger
              key={tab.type}
              value={tab.type}
              variant="underline"
              size="md"
              className="tab:h-[3.8125rem] tab:pt-2 tab:text-base tab:after:h-[0.5625rem]"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ══════ 카테고리 영역 (Figma: mo py24/px16/gap8, tab py32/px48/gap12, pc py48/px80/gap12) ══════ */}
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 tab:gap-3 tab:px-12 tab:py-8 pc:px-20 pc:py-12">
        <CategoryFilter selected={selectedCategory} onChange={handleCategoryChange} />
      </div>

      {selectedType === 'breeder' ? (
        <BreederExploreContent />
      ) : (
        <>
          {/* 검색바 + 인기 검색어 */}
          <div className="w-full tab:mx-auto tab:mt-[2.188rem] tab:max-w-[42.5rem]">
            <SearchBar placeholder={SEARCH_PLACEHOLDERS.adoption} />
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
                  <AdoptionCardHorizontal key={listing.listingId} listing={listing} />
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
        </>
      )}
    </div>
  )
}

export { ExploreContent }
