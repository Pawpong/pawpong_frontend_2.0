'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { Container, InfiniteScrollTrigger } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { AnimalCategory } from '@/shared/types'
import { breederQueries } from '@/entities/breeder'
import { BreederCard } from '@/app/(main)/home/_ui/BreederCard'
import { ExploreListingSection } from './ExploreListingSection'
import { mapBreederCard } from '../_lib/mapBreederCard'
import { EXPLORE_SECTION_CONTAINER } from '../_lib/constants'

// 상단 카테고리/검색(픽셀 카테고리 + 큰 검색바)은 ExploreContent에서 공통 렌더
// [refactored] 입양 탐색 탭과 동일한 ExploreListingSection 사용
const BreederExploreContent = ({ selectedCategory }: { selectedCategory: AnimalCategory }) => {
  // 백엔드 브리더 탐색 petType enum 은 dog|cat 뿐 — 도마뱀(reptile)은 400이라 전체와 동일하게 필터 생략
  const petType =
    selectedCategory === 'dog' || selectedCategory === 'cat' ? selectedCategory : undefined

  // queryKey 안정성: params 객체는 결정적으로 생성 (칩 토글 시 동일 키 재사용)
  const {
    data: exploreData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(breederQueries.explore(petType ? { petType } : {}))
  const { data: popularData } = useQuery(breederQueries.popular())

  const featuredBreeders = (popularData ?? []).slice(0, 4).map((b) => mapBreederCard(b, true))
  const breeders = (exploreData?.pages.flatMap((page) => page.items) ?? []).map((b) =>
    mapBreederCard(b),
  )
  const totalCount = exploreData?.pages[0]?.pagination.totalItems

  if (isLoading) {
    return (
      <Container className="flex items-center justify-center py-10">
        <p className="text-sm text-[#6b6b6b]">불러오는 중...</p>
      </Container>
    )
  }

  if (isError) {
    return (
      <Container className="flex items-center justify-center py-10">
        <p className="text-sm text-[#6b6b6b]">브리더를 불러오지 못했습니다.</p>
      </Container>
    )
  }

  return (
    <>
      {/* 인기 브리더 — 입양 탐색 인기 동물과 동일 (tab 가로 80px) */}
      {featuredBreeders.length > 0 && (
        <Container className={cn(EXPLORE_SECTION_CONTAINER, 'tab:px-20')}>
          <ExploreListingSection
            title="인기 브리더"
            items={featuredBreeders}
            getKey={(breeder) => breeder.id}
            renderCard={(breeder) => <BreederCard breeder={breeder} showPopularBadge />}
            variant="featured"
          />
        </Container>
      )}

      {/* 전체 브리더 소식 — 전체 입양 소식과 동일 그리드 */}
      <Container className={EXPLORE_SECTION_CONTAINER}>
        {breeders.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#6b6b6b]">등록된 브리더가 없습니다.</p>
        ) : (
          <ExploreListingSection
            title="전체 브리더 소식"
            items={breeders}
            count={totalCount}
            getKey={(breeder) => breeder.id}
            renderCard={(breeder) => <BreederCard breeder={breeder} />}
          />
        )}
        <InfiniteScrollTrigger
          onIntersect={fetchNextPage}
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
        />
      </Container>
    </>
  )
}

export { BreederExploreContent }
