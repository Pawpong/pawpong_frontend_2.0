'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Container, Tabs, TabsList, TabsTrigger } from '@/shared/ui'
import { SearchSection } from '@/features/search'
import { CategoryFilter } from '@/features/category-filter'
import { cn } from '@/shared/lib/cn'
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

  // PC 스크롤 인터랙션: 픽셀 카테고리+큰 검색바가 스크롤로 벗어나면 컴팩트 필터바를
  // 탭바 아래에 fixed로 노출(레이아웃 점프 방지). 탭바는 tab+에서 상단 고정(sticky).
  const headerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [gnbH, setGnbH] = useState(0)
  const [headerH, setHeaderH] = useState(0)
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    const measure = () => {
      const gnb = document.querySelector('header')
      setGnbH(gnb instanceof HTMLElement ? gnb.offsetHeight : 0)
      if (headerRef.current) setHeaderH(headerRef.current.offsetHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setIsStuck(!entry.isIntersecting), {
      rootMargin: `-${gnbH + headerH}px 0px 0px 0px`,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [gnbH, headerH])

  return (
    <>
      {/* ══════ 탭 바(+모바일·탭 필터바) — tab+ 상단 고정(sticky), GNB 아래에 스택 ══════
          (모바일은 탭 바 비고정, GNB만 sticky) */}
      <div ref={headerRef} className="bg-white tab:sticky tab:z-40" style={{ top: gnbH }}>
        {/* 탐색 탭 바 (Figma 'tab bar-layout') — full-width + margin/pc inset, 하단 회색선 */}
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
        {/* 모바일·탭 필터바 (PC는 아래 fixed 바 사용하므로 숨김) */}
        <Container className="pc:hidden">
          <ExploreFilterBar selected={selectedCategory} onChange={handleCategoryChange} />
        </Container>
      </div>

      {/* PC: 스크롤 시 GNB+탭바 아래 고정 컴팩트 필터바 (fixed → 레이아웃 점프 없음, 구분선 없음) */}
      <div
        className={cn('fixed right-0 left-0 z-30 hidden bg-white', isStuck && 'pc:block')}
        style={{ top: gnbH + headerH }}
      >
        <Container>
          <ExploreFilterBar selected={selectedCategory} onChange={handleCategoryChange} />
        </Container>
      </div>

      {/* ══════ 콘텐츠 영역 — 1080 중앙 정렬 ══════
          섹션별로 각자 Container를 갖도록 분리 중 (전역 px 제거) */}
      <Container>
        {/* PC 전용 상단: 픽셀 카테고리(가운데) + 큰 검색바 (스크롤되면 위로 사라짐) */}
        <div className="hidden pc:block">
          <div className="flex flex-col items-center justify-center py-12">
            <CategoryFilter selected={selectedCategory} onChange={handleCategoryChange} />
          </div>
          <SearchSection placeholder={SEARCH_PLACEHOLDERS[selectedType]} withPadding={false} />
        </div>
        {/* 스크롤 트리거 sentinel (PC 상단 영역 끝) */}
        <div ref={sentinelRef} aria-hidden />
      </Container>

      {selectedType === 'breeder' ? (
        <BreederExploreContent />
      ) : (
        <Container>
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
        </Container>
      )}
    </>
  )
}

export { ExploreContent }
