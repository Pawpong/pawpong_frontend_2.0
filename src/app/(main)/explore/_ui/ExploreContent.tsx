'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  Container,
  FilterChip,
  InfiniteScrollTrigger,
  ListState,
  PopularBadgeContent,
  TabBar,
} from '@/shared/ui'
import { CATEGORY_TO_PET_TYPE } from '@/shared/lib/petCategory'
import { adoptionQueries } from '@/entities/adoption'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { SearchSection } from '@/features/search'
import { CategorySection } from '@/features/category-filter'
import { cn } from '@/shared/lib/cn'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'
import { ANIMAL_CATEGORIES } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'
import { AdoptionCardGrid } from '@/features/adoption'
import { BreederExploreContent } from './BreederExploreContent'
import { ExploreFilterBar } from './ExploreFilterBar'
import { TitledSection } from './TitledSection'
import {
  EXPLORE_SECTION_CONTAINER,
  EXPLORE_SECTION_TITLE_CLASS,
  EXPLORE_TABS,
  SEARCH_PLACEHOLDERS,
} from '../_lib/constants'
import type { ExploreType } from '../_lib/constants'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'

type AdoptionListFilter = 'all' | 'available' | 'popular'

const ADOPTION_LIST_FILTERS: Array<{ value: AdoptionListFilter; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'available', label: '분양중' },
  { value: 'popular', label: '인기' },
]

// 필터 칩 → v2 /adoption 쿼리 파라미터 (서버 필터링 — 클라이언트 slice 금지)
const FILTER_TO_QUERY = {
  all: { sort: 'latest', status: undefined },
  available: { sort: 'latest', status: 'available' },
  popular: { sort: 'popular', status: undefined },
} as const

const ExploreContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const typeParam = searchParams.get('type')
  const selectedType: ExploreType = typeParam === 'breeder' ? 'breeder' : 'adoption'
  const [adoptionListFilter, setAdoptionListFilter] = useState<AdoptionListFilter>('all')

  const categoryParam = searchParams.get('category')
  const selectedCategory: AnimalCategory =
    categoryParam && ANIMAL_CATEGORIES.includes(categoryParam as AnimalCategory)
      ? (categoryParam as AnimalCategory)
      : 'all'

  // 입양 탐색 실데이터 — 카테고리 칩은 petType, 필터 칩은 sort/status로 매핑해 v2 API 조회
  // (입양 탭에서만 활성화). 필터가 바뀌면 queryKey가 바뀌어 서버에서 다시 받아온다.
  const petType = CATEGORY_TO_PET_TYPE[selectedCategory]
  const { sort, status } = FILTER_TO_QUERY[adoptionListFilter]
  const {
    data: listData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery({
    ...adoptionQueries.list(sort, petType, status),
    enabled: selectedType === 'adoption',
  })

  // 무한스크롤 페이지 병합 시 listingId 중복 제거 — 서버 페이지네이션이 경계에서 항목을
  // 겹쳐 주더라도 React key 중복(카드 중복/누락)이 발생하지 않도록 방어한다.
  const listings = useMemo(
    () => dedupeBy(flattenPages(listData).map(mapAdoptionCard), (listing) => listing.listingId),
    [listData],
  )
  const totalCount = getTotalItems(listData)

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
    const el = headerRef.current
    if (!el) return
    // ResizeObserver로 탭바 높이 상시 추적 (window resize만으론 폰트로드·HMR·동적변경 시
    // 높이 변화를 못 잡아 headerH가 stale → 컴팩트바가 탭바에 겹쳐 칩이 잘림)
    const measure = () => setHeaderH(el.offsetHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
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
        <TabBar
          items={EXPLORE_TABS.map((tab) => ({ value: tab.type, label: tab.label }))}
          value={selectedType}
          onValueChange={(value) => handleTypeChange(value as ExploreType)}
          ariaLabel="탐색 유형"
        />
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
        <BreederExploreContent selectedCategory={selectedCategory} />
      ) : (
        <>
          <Container className={EXPLORE_SECTION_CONTAINER}>
            <TitledSection
              title={`전체 분양 소식 ${totalCount}`}
              titleClassName={EXPLORE_SECTION_TITLE_CLASS}
              headerSlot={
                <div className="flex shrink-0 items-center gap-2" aria-label="분양 소식 필터">
                  {/* [refactored] 칩 버튼 스타일 → 공통 FilterChip */}
                  {ADOPTION_LIST_FILTERS.map((filter) => (
                    <FilterChip
                      key={filter.value}
                      selected={adoptionListFilter === filter.value}
                      onClick={() => setAdoptionListFilter(filter.value)}
                      size="responsive"
                    >
                      {filter.value === 'popular' ? (
                        <PopularBadgeContent size="responsive" />
                      ) : (
                        filter.label
                      )}
                    </FilterChip>
                  ))}
                </div>
              }
            >
              <ListState
                isPending={isPending}
                isError={isError}
                isEmpty={listings.length === 0}
                loadingText="분양글을 불러오는 중입니다."
                errorText="분양글을 불러오지 못했습니다."
                emptyText="등록된 분양글이 없습니다."
              >
                <AdoptionCardGrid listings={listings} />
              </ListState>
            </TitledSection>
            <InfiniteScrollTrigger
              onIntersect={fetchNextPage}
              hasNextPage={hasNextPage ?? false}
              isFetchingNextPage={isFetchingNextPage}
            />
          </Container>
        </>
      )}
    </>
  )
}

export { ExploreContent }
