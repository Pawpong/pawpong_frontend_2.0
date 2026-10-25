'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import {
  Container,
  InfiniteScrollTrigger,
  ListState,
  ListingCardGrid,
  ListingCardGridSkeleton,
} from '@/shared/ui'
import { EmptyStateLink } from '@/shared/ui/EmptyStateLink'
import { profileQueries } from '@/entities/profile'
import type { FavoriteBreederCard } from '@/shared/types'
import type { FavoriteBreeder } from '@/shared/types'
import { BreederCard } from '@/app/(main)/home/_ui/BreederCard'

// 백엔드 FavoriteBreederCard → BreederCard 뷰 모델(FavoriteBreeder) 매핑
// (badges/date는 카드에서 렌더하지 않아 최소값만 채움)
const toBreederCardModel = (breeder: FavoriteBreederCard): FavoriteBreeder => ({
  id: breeder.breederId,
  nickname: breeder.nickname,
  imageUrl: breeder.profileImageUrl ?? null,
  badges: [],
  isBreeding: breeder.recentPetStatus === 'available',
  location: breeder.breederLocation,
  date: breeder.addedAt,
  isFavorited: breeder.isFavorited,
})

const FavoriteBreedersContent = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    refetch,
    isFetching: isRetrying,
  } = useInfiniteQuery(profileQueries.favoriteBreeders())

  const breeders = (data?.pages ?? []).flatMap((page) => page.items.map(toBreederCardModel))

  return (
    /* 열 수·간격은 공통 카드 격자(ListingCardGrid)를 따른다 */
    <Container className="px-4 py-5 tab:py-10 pc:pb-27">
      {/* 조회 실패를 "즐겨찾는 브리더가 없습니다"로 뭉뚱그리면 권한·네트워크 문제가 빈 목록으로 위장된다 */}
      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={breeders.length === 0}
        loadingText="즐겨찾는 브리더를 불러오는 중이에요."
        loadingFallback={<ListingCardGridSkeleton label="즐겨찾는 브리더를 불러오는 중이에요." />}
        errorText="즐겨찾는 브리더를 불러오지 못했어요."
        emptyText="아직 즐겨찾는 브리더가 없어요."
        emptyAction={<EmptyStateLink href="/explore">브리더 둘러보기</EmptyStateLink>}
        onRetry={() => void refetch()}
        isRetrying={isRetrying}
      >
        <ListingCardGrid
          items={breeders}
          getKey={(breeder) => breeder.id}
          renderItem={(breeder, index) => (
            <BreederCard breeder={breeder} preload={index < 4 && Boolean(breeder.imageUrl)} />
          )}
        />
      </ListState>
      <InfiniteScrollTrigger
        onIntersect={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </Container>
  )
}

export { FavoriteBreedersContent }
