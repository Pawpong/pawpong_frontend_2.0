'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  Container,
  InfiniteScrollTrigger,
  ListState,
  ListingCardGrid,
  ListingCardGridSkeleton,
} from '@/shared/ui'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import type { PetStatus } from '@/shared/types'
import { PetStatusFilter, adoptionQueries } from '@/entities/adoption'
import { FavoriteAdoptionGridCard } from '@/features/adoption'

const HOME_LISTING_PAGE_SIZE = 16

interface PublicBreederListingsProps {
  breederId: string
  /** 2단 레이아웃처럼 컬럼이 좁아지는 자리에서 고정폭 4열 대신 쓴다 */
  gridClassName?: string
}

/** 브리더 공개 홈의 분양 목록. 카드 자체는 탐색 화면과 같은 공용 카드다. */
const PublicBreederListings = ({ breederId, gridClassName }: PublicBreederListingsProps) => {
  // 같은 칩을 다시 누르면 해제 -> 전체 (마이홈 분양 목록과 같은 동작)
  const [status, setStatus] = useState<PetStatus | null>(null)

  const query = useInfiniteQuery({
    ...adoptionQueries.breederPets(
      breederId,
      undefined,
      HOME_LISTING_PAGE_SIZE,
      status ?? undefined,
    ),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  // 공개 목록 API 는 상태를 비우면 분양완료를 뺀다(탐색 화면용). '전체'는 분양완료를 따로 받아
  // 분양중·예약중을 다 넘긴 뒤에 잇는다 — 먼저 붙이면 다음 페이지가 그 사이로 끼어든다
  const isAll = status === null
  const adoptedQuery = useInfiniteQuery({
    ...adoptionQueries.breederPets(breederId, undefined, HOME_LISTING_PAGE_SIZE, 'adopted'),
    enabled: !!breederId && isAll,
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const showAdopted = isAll && !query.hasNextPage
  const listings = dedupeBy(
    [...flattenPages(query.data), ...(showAdopted ? flattenPages(adoptedQuery.data) : [])].map(
      mapAdoptionCard,
    ),
    (listing) => listing.listingId,
  )
  const totalItems = getTotalItems(query.data) + (isAll ? getTotalItems(adoptedQuery.data) : 0)
  const next = query.hasNextPage ? query : showAdopted ? adoptedQuery : null

  return (
    <Container className="py-5 tab:py-10">
      <div className="mx-auto flex w-full max-w-[74.625rem] flex-col gap-5">
        {/* 라벨 + 상태 필터 — 마이홈 분양 목록(MyPetPostingList)과 같은 배치 */}
        <div className="flex items-center justify-between gap-2">
          <p className="px-0.5 text-sm leading-6 font-semibold text-neutral-850 tab:text-base">
            전체 분양건 {totalItems}
          </p>

          <PetStatusFilter value={status} onChange={setStatus} />
        </div>

        <ListState
          isPending={query.isPending || (isAll && adoptedQuery.isPending)}
          isError={query.isError || (isAll && adoptedQuery.isError)}
          isEmpty={listings.length === 0}
          loadingText="분양글을 불러오는 중이에요."
          loadingFallback={
            <ListingCardGridSkeleton
              label="분양글을 불러오는 중이에요."
              className={gridClassName}
            />
          }
          errorText="분양글을 불러오지 못했어요."
          emptyText={status ? '해당 상태의 분양글이 없어요.' : '등록된 분양글이 없어요.'}
          onRetry={() => {
            void query.refetch()
            if (isAll) void adoptedQuery.refetch()
          }}
          isRetrying={query.isFetching || adoptedQuery.isFetching}
        >
          <ListingCardGrid
            className={gridClassName}
            items={listings}
            getKey={(listing) => listing.listingId}
            renderItem={(listing, index) => (
              <FavoriteAdoptionGridCard listing={listing} preload={index < 4} />
            )}
          />
        </ListState>
        <InfiniteScrollTrigger
          onIntersect={() => void next?.fetchNextPage()}
          hasNextPage={next?.hasNextPage ?? false}
          isFetchingNextPage={query.isFetchingNextPage || adoptedQuery.isFetchingNextPage}
        />
      </div>
    </Container>
  )
}

export { PublicBreederListings }
