'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { Container, InfiniteScrollTrigger, ListingCardGrid } from '@/shared/ui'
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
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    profileQueries.favoriteBreeders(),
  )

  const breeders = (data?.pages ?? []).flatMap((page) => page.items.map(toBreederCardModel))

  return (
    /* 디자인(1023-38692): 모바일 2열 / PC 4열, gap-20. PC는 1188px로 묶어 가운데 정렬 */
    <Container className="px-4 py-5 tab:py-10 pc:pb-27">
      {breeders.length === 0 ? (
        <p className="py-10 text-center text-sm leading-[1.5] font-medium text-neutral-700">
          즐겨찾는 브리더가 없습니다.
        </p>
      ) : (
        <ListingCardGrid
          layout="compact"
          items={breeders}
          getKey={(breeder) => breeder.id}
          renderItem={(breeder) => <BreederCard breeder={breeder} />}
        />
      )}
      <InfiniteScrollTrigger
        onIntersect={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </Container>
  )
}

export { FavoriteBreedersContent }
