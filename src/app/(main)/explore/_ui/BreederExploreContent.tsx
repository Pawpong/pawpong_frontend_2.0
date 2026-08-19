'use client'

import { useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Container, InfiniteScrollTrigger, ListState, ListingCardGrid } from '@/shared/ui'
import { breederQueries } from '@/entities/breeder'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'
import { CATEGORY_TO_PET_TYPE } from '@/shared/lib/petCategory'
import { BreederCard } from '@/app/(main)/home/_ui/BreederCard'
import { TitledSection } from './TitledSection'
import { ExploreListFilters } from './ExploreListFilters'
import type { ExploreListFilter } from './ExploreListFilters'
import { EXPLORE_SECTION_CONTAINER, EXPLORE_SECTION_TITLE_CLASS } from '../_lib/constants'
import type { AnimalCategory, Breeder, FavoriteBreeder } from '@/shared/types'

// 필터 칩 → /breeder/explore 파라미터 (서버 필터링 — 클라이언트 slice 금지)
const FILTER_TO_QUERY = {
  all: { sortBy: 'latest' },
  available: { sortBy: 'latest', isAdoptionAvailable: true },
  popular: { sortBy: 'favorite' },
} as const

// 탐색 카테고리 → 브리더 검색 petType. 도마뱀(reptile)은 API enum(dog|cat)에 없어 전체 조회로 둔다.
const toBreederPetType = (category: AnimalCategory) => {
  const petType = CATEGORY_TO_PET_TYPE[category]
  return petType === 'dog' || petType === 'cat' ? petType : undefined
}

// Breeder(API) → BreederCard 뷰 모델. 카드는 즐겨찾는 브리더 탭과 같은 것을 쓴다.
const toBreederCardModel = (breeder: Breeder): FavoriteBreeder => ({
  id: breeder.breederId,
  nickname: breeder.breederName,
  imageUrl: breeder.profileImage ?? breeder.representativePhotos[0] ?? null,
  badges: [],
  isBreeding: breeder.isAdoptionAvailable,
  location: breeder.location,
  date: breeder.createdAt,
  level: breeder.breederLevel,
  isFavorited: breeder.isFavorited,
})

interface BreederExploreContentProps {
  /** 상단 픽셀 카테고리 칩 선택값 — 입양 탭과 같은 필터를 공유한다 */
  category: AnimalCategory
}

// 상단 카테고리/검색(픽셀 카테고리 + 큰 검색바)은 ExploreContent에서 공통 렌더.
// 목록 레이아웃은 입양 탐색과 동일 — 제목+필터 칩 헤더 / 공용 그리드 / 무한스크롤.
const BreederExploreContent = ({ category }: BreederExploreContentProps) => {
  const [listFilter, setListFilter] = useState<ExploreListFilter>('all')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    useInfiniteQuery(
      breederQueries.explore({
        petType: toBreederPetType(category),
        ...FILTER_TO_QUERY[listFilter],
      }),
    )

  // 서버 페이지 경계에서 항목이 겹쳐도 React key가 중복되지 않도록 방어 (입양 탭과 동일)
  const breeders = useMemo(
    () => dedupeBy(flattenPages(data).map(toBreederCardModel), (breeder) => breeder.id),
    [data],
  )
  const totalCount = getTotalItems(data)

  return (
    <Container className={EXPLORE_SECTION_CONTAINER}>
      <TitledSection
        title={`전체 브리더 소식 ${totalCount}`}
        titleClassName={EXPLORE_SECTION_TITLE_CLASS}
        headerSlot={
          <ExploreListFilters
            value={listFilter}
            onChange={setListFilter}
            ariaLabel="브리더 소식 필터"
          />
        }
      >
        <ListState
          isPending={isPending}
          isError={isError}
          isEmpty={breeders.length === 0}
          loadingText="브리더를 불러오는 중입니다."
          errorText="브리더를 불러오지 못했습니다."
          emptyText="등록된 브리더가 없습니다."
        >
          <ListingCardGrid
            items={breeders}
            getKey={(breeder) => breeder.id}
            renderItem={(breeder) => <BreederCard breeder={breeder} />}
          />
        </ListState>
      </TitledSection>
      <InfiniteScrollTrigger
        onIntersect={fetchNextPage}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
      />
    </Container>
  )
}

export { BreederExploreContent }
