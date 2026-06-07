'use client'

import { useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Container, SectionHeader, Tabs, TabsList, TabsTrigger } from '@/shared/ui'
import { SearchSection } from '@/features/search'
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
        <div className="mx-auto flex w-full max-w-[67.5rem] flex-col">
          {/* 카테고리 영역 (Figma: mo py24/px16/gap8, tab py32/px48/gap12, pc py48/px80/gap12) */}
          <div className="flex flex-col items-center justify-center gap-2 py-6 tab:gap-3 tab:py-8 pc:py-12">
            <CategoryFilter selected={selectedCategory} onChange={handleCategoryChange} />
          </div>

          {selectedType === 'breeder' ? (
            <BreederExploreContent />
          ) : (
            <>
              {/* 검색바 + 인기 검색어 */}
              <SearchSection
                placeholder={SEARCH_PLACEHOLDERS.adoption}
                withPadding={false}
                className="tab:mt-[2.188rem]"
              />

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
      </Container>
    </>
  )
}

export { ExploreContent }
