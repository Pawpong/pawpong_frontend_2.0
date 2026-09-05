'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { Button, Container, InfiniteScrollTrigger, ListState, ListingCardGrid } from '@/shared/ui'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { adoptionQueries } from '@/entities/adoption'
import { FavoriteAdoptionGridCard } from '@/features/adoption'

const HOME_LISTING_PAGE_SIZE = 16

interface PublicBreederListingsProps {
  breederId: string
}

/** 브리더 공개 홈의 분양 목록. 카드 자체는 탐색 화면과 같은 공용 카드다. */
const PublicBreederListings = ({ breederId }: PublicBreederListingsProps) => {
  const query = useInfiniteQuery({
    ...adoptionQueries.breederPets(breederId, undefined, HOME_LISTING_PAGE_SIZE),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const listings = dedupeBy(
    flattenPages(query.data).map(mapAdoptionCard),
    (listing) => listing.listingId,
  )
  const totalItems = getTotalItems(query.data)

  return (
    <Container className="px-4 py-5 tab:px-20 tab:py-10 pc:px-0">
      <div className="mx-auto flex w-full max-w-[74.625rem] flex-col gap-5">
        <p className="px-0.5 text-sm leading-6 font-semibold text-neutral-850 tab:text-base">
          전체 분양건 {totalItems}
        </p>

        <ListState
          isPending={query.isPending}
          isError={query.isError}
          isEmpty={listings.length === 0}
          loadingText="분양글을 불러오는 중입니다."
          errorText="분양글을 불러오지 못했습니다."
          emptyText="등록된 분양글이 없습니다."
          errorAction={
            <Button variant="fill" size="sm" onClick={() => void query.refetch()}>
              다시 시도
            </Button>
          }
        >
          <ListingCardGrid
            layout="publicBreeder"
            items={listings}
            getKey={(listing) => listing.listingId}
            renderItem={(listing, index) => (
              <FavoriteAdoptionGridCard listing={listing} preload={index < 4} />
            )}
          />
        </ListState>
        <InfiniteScrollTrigger
          onIntersect={() => void query.fetchNextPage()}
          hasNextPage={query.hasNextPage ?? false}
          isFetchingNextPage={query.isFetchingNextPage}
        />
      </div>
    </Container>
  )
}

export { PublicBreederListings }
