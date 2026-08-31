'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { Button, Container, InfiniteScrollTrigger, ListState, ListingCardGrid } from '@/shared/ui'
import { profileQueries } from '@/entities/profile'
import type { FavoriteBreederCard } from '@/shared/types'
import type { FavoriteBreeder } from '@/shared/types'
import { BreederCard } from './BreederCard'

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
  level: breeder.level,
  isFavorited: breeder.isFavorited,
})

const FavoriteBreedersContent = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, refetch } =
    useInfiniteQuery(profileQueries.favoriteBreeders())

  const breeders = (data?.pages ?? []).flatMap((page) => page.items.map(toBreederCardModel))

  return (
    /* 디자인(1023-38692): 모바일 2열 / PC 4열, gap-20. PC는 1188px로 묶어 가운데 정렬 */
    <Container className="px-4 py-5 tab:py-10 pc:pb-27">
      {/* 조회 실패를 "즐겨찾는 브리더가 없습니다"로 뭉뚱그리면 권한·네트워크 문제가 빈 목록으로 위장된다 */}
      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={breeders.length === 0}
        loadingText="즐겨찾는 브리더를 불러오는 중입니다."
        errorText="즐겨찾는 브리더를 불러오지 못했습니다."
        emptyText="즐겨찾는 브리더가 없습니다."
        errorAction={
          <Button variant="fill" size="sm" onClick={() => void refetch()} className="px-4">
            다시 시도
          </Button>
        }
      >
        <ListingCardGrid
          layout="compact"
          items={breeders}
          getKey={(breeder) => breeder.id}
          renderItem={(breeder) => <BreederCard breeder={breeder} />}
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
