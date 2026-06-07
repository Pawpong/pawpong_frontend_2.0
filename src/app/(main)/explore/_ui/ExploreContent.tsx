'use client'

import { useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Container, Tabs, TabsList, TabsTrigger } from '@/shared/ui'
import { SearchSection } from '@/features/search'
import { CategoryFilter } from '@/features/category-filter'
import { createMockListings } from '@/shared/mocks/adoption'
import { ANIMAL_CATEGORIES } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'
import { BreederExploreContent } from './BreederExploreContent'
import { AdoptionListingSection } from './AdoptionListingSection'
import { ExploreFilterBar } from './ExploreFilterBar'
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

  return (
    <>
      {/* ══════ 탐색 탭 바 (Figma 'tab bar-layout') ══════
          - GNB 헤더와 동일하게 max-width 캡 없는 full-width + margin/pc(20/48/80) inset.
            (1440 초과 화면에서 헤더는 끝까지 가는데 탭만 멈춰 여백이 생기는 것 방지)
          - 하단 회색선(border-b)은 이 래퍼에 두어 px(margin)을 무시하고 전폭(edge-to-edge)으로 항상 노출.
          - spacing/16 상단 패딩(pt-4). */}
      <div className="w-full border-b border-[#cacaca] px-[1.25rem] pt-3 tab:px-[3rem] tab:pt-4 pc:px-[5rem]">
        <Tabs
          value={selectedType}
          onValueChange={(value) => handleTypeChange(value as ExploreType)}
          className="w-full"
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
      </div>

      {/* ══════ 콘텐츠 영역 — 1080 중앙 정렬 ══════ */}
      <Container>
        {/* 카테고리/검색 영역
            - PC: 픽셀 카테고리(가운데) + 검색바(SearchSection)
            - 탭/모바일: 카테고리+검색 한 줄 필터바 (Figma 1652-75035) */}
        <div className="hidden flex-col items-center justify-center pc:flex pc:py-12">
          <CategoryFilter selected={selectedCategory} onChange={handleCategoryChange} />
        </div>
        <ExploreFilterBar
          selected={selectedCategory}
          onChange={handleCategoryChange}
          className="pc:hidden"
        />

        {selectedType === 'breeder' ? (
          <BreederExploreContent />
        ) : (
          <>
            {/* 검색바 + 인기 검색어 — PC 전용 (탭/모바일은 상단 필터바의 검색 pill 사용) */}
            <SearchSection
              placeholder={SEARCH_PLACEHOLDERS.adoption}
              withPadding={false}
              className="hidden pc:flex"
            />

            {/* [refactored] 인기 동물 / 전체 입양 소식 — 공통 컴포넌트로 통합 (상단 여백만 차이) */}
            <AdoptionListingSection
              title="인기 동물"
              listings={popularListings}
              className="mt-[2.063rem]"
            />
            <AdoptionListingSection
              title="전체 입양 소식"
              listings={mockListings}
              className="mt-[1.25rem]"
            />

            {/* 하단 여백 */}
            <div className="h-[4rem]" />
          </>
        )}
      </Container>
    </>
  )
}

export { ExploreContent }
