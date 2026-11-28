'use client'

import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  Button,
  Dropdown,
  InfiniteScrollTrigger,
  ListState,
  ListingCardGridSkeleton,
  SearchBar,
  TabBarList,
  Tabs,
  TabsContent,
} from '@/shared/ui'
import { TEXT } from '@/shared/config'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'
import { AdoptionCardGrid } from '@/features/adoption'
import type { AdoptionSortType } from '@/shared/types'
import { BreederExploreContent } from './BreederExploreContent'
import { ExploreMobileFilters, ExploreSideFilters } from './ExploreFilters'
import {
  ALL_REGIONS,
  EXPLORE_GRID,
  EXPLORE_SECTION_CONTAINER,
  EXPLORE_TABS,
  SORT_OPTIONS,
} from '../_lib/constants'
import type { ExploreType } from '../_lib/constants'
import { adoptionExploreQuery } from '../_lib/exploreQueries'
import { hasNarrowedQuery, useExploreQuery } from '../_lib/useExploreQuery'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'

const SEARCH_PLACEHOLDER = {
  breeder: {
    mobile: '브리더·품종·지역 검색',
    desktop: '브리더 이름, 품종, 지역으로 검색해 보세요',
  },
  adoption: { mobile: '검색해서 원하는 동물 찾기', desktop: '검색해서 원하는 동물 찾기' },
} as const

// 탐색 — 탭 · 검색 · 필터(PC 왼쪽 칸 / 모바일 칩 + 펼침) · 목록.
// 헤더와 탭만 붙어 있고 검색·필터는 스크롤로 지나가 카드가 먼저 보이게 한다.
const ExploreContent = () => {
  const { query, setQuery } = useExploreQuery()
  const selectedType = query.type
  const gnbHeight = useGnbHeight()
  const narrowed = hasNarrowedQuery(query)

  // 입양 탐색 실데이터 — 카테고리는 petType, 필터는 sort/status 로 v2 API 조회 (서버 필터링)
  const {
    data: listData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery({
    ...adoptionExploreQuery(query),
    enabled: query.type === 'adoption',
  })

  // 무한스크롤 페이지 병합 시 listingId 중복 제거 — 서버 페이지네이션이 경계에서 항목을
  // 겹쳐 주더라도 React key 중복(카드 중복/누락)이 발생하지 않도록 방어한다.
  const listings = useMemo(
    () => dedupeBy(flattenPages(listData).map(mapAdoptionCard), (listing) => listing.listingId),
    [listData],
  )

  // 탭을 바꾸면 조건을 처음으로 — 분양 상태·지역은 탭마다 고를 수 있는 값이 다르다
  const handleTypeChange = (type: ExploreType) =>
    setQuery({
      type,
      category: 'all',
      status: 'all',
      sort: 'popular',
      region: ALL_REGIONS,
      keyword: '',
    })

  // 필터로 비었을 때만 되돌아갈 길을 준다. 초기화는 뒤로가기 한 번에 목록으로 돌아오게 히스토리를 쌓지 않는다
  const emptyAction = narrowed ? (
    <Button
      intent="secondary"
      size="md"
      onClick={() =>
        setQuery(
          { category: 'all', status: 'all', region: ALL_REGIONS, keyword: '' },
          { replace: true },
        )
      }
    >
      필터 초기화
    </Button>
  ) : undefined

  return (
    // 탭이 가리키는 목록 패널이 같은 Tabs 안에 있어야 하므로 Tabs 루트가 sticky 머리와 목록을 함께 감싼다.
    <Tabs
      value={selectedType}
      onValueChange={(value) => handleTypeChange(value as ExploreType)}
      className="w-full"
    >
      <div
        data-page-top
        className="sticky z-sticky frame-bleed bg-white"
        style={{ top: gnbHeight }}
      >
        <TabBarList items={EXPLORE_TABS} ariaLabel="탐색 유형" />
      </div>

      <TabsContent value={selectedType}>
        <div className="grid min-w-0 grid-cols-1 lap:grid-cols-[13rem_minmax(0,1fr)] lap:items-start lap:gap-12">
          <ExploreSideFilters query={query} onChange={setQuery} />

          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center gap-4">
              {/* 탭을 바꾸거나 초기화로 검색어가 비면 입력칸도 비운다 */}
              <SearchBar
                size="lg"
                key={`${query.type}-${query.keyword}`}
                defaultValue={query.keyword}
                placeholder={SEARCH_PLACEHOLDER[query.type]}
                onSubmit={(keyword) => setQuery({ keyword })}
              />
              {/* 모바일 정렬은 필터 펼침 칸에 있다 */}
              <div className="hidden lap:block">
                <Dropdown
                  appearance="bare"
                  ariaLabel="정렬"
                  options={[...SORT_OPTIONS]}
                  value={query.sort}
                  onValueChange={(sort) => setQuery({ sort: sort as AdoptionSortType })}
                />
              </div>
            </div>
            <ExploreMobileFilters query={query} onChange={setQuery} />

            {query.type === 'breeder' ? (
              <BreederExploreContent
                query={query}
                emptyText={narrowed ? '조건에 맞는 브리더가 없어요.' : '등록된 브리더가 없어요.'}
                emptyAction={emptyAction}
              />
            ) : (
              <div className={EXPLORE_SECTION_CONTAINER}>
                <section className="flex flex-col gap-3">
                  <ListState
                    appPublicContent
                    isPending={isPending}
                    isError={isError}
                    isEmpty={listings.length === 0}
                    loadingText="분양글을 불러오는 중이에요."
                    loadingFallback={
                      <ListingCardGridSkeleton
                        label="분양글을 불러오는 중이에요."
                        className={EXPLORE_GRID}
                      />
                    }
                    errorText="분양글을 불러오지 못했어요."
                    emptyText={
                      narrowed ? '조건에 맞는 분양글이 없어요.' : '등록된 분양글이 없어요.'
                    }
                    emptyAction={emptyAction}
                  >
                    <p className={TEXT.meta}>
                      총 {getTotalItems(listData).toLocaleString()}개의 분양글
                    </p>
                    <AdoptionCardGrid listings={listings} className={EXPLORE_GRID} />
                  </ListState>
                </section>
                <InfiniteScrollTrigger
                  onIntersect={fetchNextPage}
                  hasNextPage={hasNextPage ?? false}
                  isFetchingNextPage={isFetchingNextPage}
                />
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

export { ExploreContent }
