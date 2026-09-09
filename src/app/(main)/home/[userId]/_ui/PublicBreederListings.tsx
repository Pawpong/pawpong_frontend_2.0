'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  Button,
  Container,
  FilterChip,
  InfiniteScrollTrigger,
  ListState,
  ListingCardGrid,
} from '@/shared/ui'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import type { PetStatus } from '@/shared/types'
import { ADOPTION_CARD_STATUS, adoptionQueries } from '@/entities/adoption'
import { FavoriteAdoptionGridCard } from '@/features/adoption'

const HOME_LISTING_PAGE_SIZE = 16

// 상태 목록·라벨 단일 소스는 ADOPTION_CARD_STATUS (카드 뱃지·마이홈 필터와 같은 곳)
const STATUS_FILTERS = Object.keys(ADOPTION_CARD_STATUS) as PetStatus[]

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
  const listings = dedupeBy(
    flattenPages(query.data).map(mapAdoptionCard),
    (listing) => listing.listingId,
  )
  const totalItems = getTotalItems(query.data)

  return (
    <Container className="px-4 py-5 tab:py-10">
      <div className="mx-auto flex w-full max-w-[74.625rem] flex-col gap-5">
        {/* 라벨 + 상태 필터 — 마이홈 분양 목록(MyPetPostingList)과 같은 배치 */}
        <div className="flex items-center justify-between gap-2">
          <p className="px-0.5 text-sm leading-6 font-semibold text-neutral-850 tab:text-base">
            전체 분양건 {totalItems}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((value) => (
              <FilterChip
                key={value}
                size="responsive"
                selected={status === value}
                onClick={() => setStatus(status === value ? null : value)}
              >
                {ADOPTION_CARD_STATUS[value].label}
              </FilterChip>
            ))}
          </div>
        </div>

        <ListState
          isPending={query.isPending}
          isError={query.isError}
          isEmpty={listings.length === 0}
          loadingText="분양글을 불러오는 중입니다."
          errorText="분양글을 불러오지 못했습니다."
          emptyText={status ? '해당 상태의 분양글이 없습니다.' : '등록된 분양글이 없습니다.'}
          errorAction={
            <Button variant="fill" size="sm" onClick={() => void query.refetch()}>
              다시 시도
            </Button>
          }
        >
          <ListingCardGrid
            layout="publicBreeder"
            className={gridClassName}
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
