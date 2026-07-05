'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Container, Tabs, TabsList, TabsTrigger } from '@/shared/ui'
import { SearchSection } from '@/features/search'
import { CategorySection } from '@/features/category-filter'
import { cn } from '@/shared/lib/cn'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'
import { createMockListings } from '@/shared/mocks/adoption'
import { ANIMAL_CATEGORIES } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'
import { FavoriteAdoptionCard } from '@/features/adoption'
import { BreederExploreContent } from './BreederExploreContent'
import { ExploreListingSection } from './ExploreListingSection'
import { ExploreFilterBar } from './ExploreFilterBar'
import { EXPLORE_TABS, SEARCH_PLACEHOLDERS, EXPLORE_SECTION_CONTAINER } from '../_lib/constants'
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

  // 스크롤 인터랙션: 픽셀 카테고리+큰 검색바가 스크롤로 벗어나면 컴팩트 필터바를
  // 탭바 아래에 fixed로 노출(레이아웃 점프 방지). 탭바는 tab+에서 상단 고정(sticky).
  const headerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  // [refactored] GNB 높이는 공통 훅 재사용 (직접 querySelector 측정 제거)
  const gnbH = useGnbHeight()
  const [headerH, setHeaderH] = useState(0)
  const [isStuck, setIsStuck] = useState(false)
  // 헤더는 tab+에서만 sticky(탭바가 남음) → 고정 칩바 top에 headerH 반영. 모바일은 탭바가 스크롤로 사라져 gnbH만.
  const isTabUp = useBreakpoint('tab')
  const stickyBarTop = gnbH + (isTabUp ? headerH : 0)

  useEffect(() => {
    const measure = () => {
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
      rootMargin: `-${stickyBarTop}px 0px 0px 0px`,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [stickyBarTop])

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
      </div>

      {/* 스크롤 시 GNB(+tab: 탭바) 아래 고정 컴팩트 칩바 (fixed → 레이아웃 점프 없음, 구분선 없음) */}
      <div
        className={cn('fixed right-0 left-0 z-30 hidden bg-white', isStuck && 'block')}
        style={{ top: stickyBarTop }}
      >
        <Container>
          <ExploreFilterBar selected={selectedCategory} onChange={handleCategoryChange} />
        </Container>
      </div>

      {/* ══════ 콘텐츠 영역 — 섹션별로 각자 Container를 갖도록 분리 (전역 px 제거) ══════ */}
      {/* 상단: 픽셀 카테고리(모바일 2x2 / tab+ 4열 가운데) + 큰 검색바 — 스크롤되면 위 fixed 칩바로 전환 */}
      <div>
        <CategorySection selected={selectedCategory} onChange={handleCategoryChange} />
        {/* 검색바: 홈과 동일 — SearchSection 자체 패딩 20px(py-3 tab:py-5) / 80px(pc:px-20) */}
        <SearchSection placeholder={SEARCH_PLACEHOLDERS[selectedType]} />
      </div>
      {/* 스크롤 트리거 sentinel (상단 영역 끝) */}
      <div ref={sentinelRef} aria-hidden />

      {selectedType === 'breeder' ? (
        <BreederExploreContent />
      ) : (
        <>
          {/* 인기 브리더와 동일 — 섹션별 Container, padding 세로 mo 20px→tab+ 40px, 가로 mo 16px/tab 48/pc 80 */}
          {/* [refactored] 공용 ExploreListingSection — 인기 동물만 tab 가로 80px(margin/pc, Figma 1652-125625) */}
          <Container className={cn(EXPLORE_SECTION_CONTAINER, 'tab:px-20')}>
            <ExploreListingSection
              title="인기 동물"
              items={popularListings}
              getKey={(listing) => listing.listingId}
              renderCard={(listing) => <FavoriteAdoptionCard listing={listing} />}
              variant="featured"
            />
          </Container>
          <Container className={EXPLORE_SECTION_CONTAINER}>
            <ExploreListingSection
              title="전체 입양 소식"
              items={mockListings}
              getKey={(listing) => listing.listingId}
              renderCard={(listing) => <FavoriteAdoptionCard listing={listing} />}
            />
          </Container>
        </>
      )}
    </>
  )
}

export { ExploreContent }
