'use client'

import { usePublicActivityBadges } from '@/features/gamification'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  InfiniteScrollTrigger,
  ListState,
  ListingCardGrid,
  ListingCardGridSkeleton,
} from '@/shared/ui'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'
import { BreederCard } from '@/app/(main)/home/_ui/BreederCard'
import { EXPLORE_GRID, EXPLORE_SECTION_CONTAINER } from '../_lib/constants'
import { breederExploreQuery } from '../_lib/exploreQueries'
import { TEXT } from '@/shared/config'
import type { ExploreQuery } from '../_lib/useExploreQuery'
import type { Breeder, FavoriteBreeder } from '@/shared/types'

// Breeder(API) → BreederCard 뷰 모델. 카드는 즐겨찾는 브리더 탭과 같은 것을 쓴다.
const toBreederCardModel = (breeder: Breeder): FavoriteBreeder => ({
  id: breeder.breederId,
  nickname: breeder.breederName,
  imageUrl: breeder.profileImage ?? breeder.representativePhotos[0] ?? null,
  badges: [],
  isBreeding: breeder.isAdoptionAvailable,
  location: breeder.location,
  date: breeder.createdAt,
  isFavorited: breeder.isFavorited,
})

interface BreederExploreContentProps {
  /** URL 의 탐색 조건 — 카테고리·검색어·필터를 입양 탭과 같은 방식으로 받는다 */
  query: ExploreQuery
  emptyText: ReactNode
  emptyAction?: ReactNode
}

// 상단 카테고리·필터는 ExploreContent 에서 공통 렌더.
// 목록 레이아웃은 입양 탐색과 동일 — 공용 그리드 / 무한스크롤.
const BreederExploreContent = ({ query, emptyText, emptyAction }: BreederExploreContentProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    useInfiniteQuery(breederExploreQuery(query))

  // 서버 페이지 경계에서 항목이 겹쳐도 React key가 중복되지 않도록 방어 (입양 탭과 동일)
  const breeders = useMemo(
    () => dedupeBy(flattenPages(data).map(toBreederCardModel), (breeder) => breeder.id),
    [data],
  )
  const levels = usePublicActivityBadges(
    breeders.map((breeder) => ({ ownerId: breeder.id, role: 'breeder' })),
  )

  return (
    <div className={EXPLORE_SECTION_CONTAINER}>
      <section className="flex flex-col gap-3">
        <ListState
          appPublicContent
          isPending={isPending}
          isError={isError}
          isEmpty={breeders.length === 0}
          loadingText="브리더를 불러오는 중이에요."
          loadingFallback={
            <ListingCardGridSkeleton label="브리더를 불러오는 중이에요." className={EXPLORE_GRID} />
          }
          errorText="브리더를 불러오지 못했어요."
          emptyText={emptyText}
          emptyAction={emptyAction}
        >
          <p className={TEXT.meta}>총 {getTotalItems(data).toLocaleString()}명의 브리더</p>
          <ListingCardGrid
            className={EXPLORE_GRID}
            items={breeders}
            getKey={(breeder) => breeder.id}
            renderItem={(breeder, index) => (
              <BreederCard
                level={levels.find((owner) => owner.ownerId === breeder.id)?.level}
                breeder={breeder}
                preload={index < 4 && Boolean(breeder.imageUrl)}
              />
            )}
          />
        </ListState>
      </section>
      <InfiniteScrollTrigger
        onIntersect={fetchNextPage}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  )
}

export { BreederExploreContent }
