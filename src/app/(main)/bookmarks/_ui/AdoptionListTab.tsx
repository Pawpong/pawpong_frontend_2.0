'use client'

import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import { formatDate } from '@/shared/lib/formatDate'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { Container, InfiniteScrollTrigger, ListState } from '@/shared/ui'
import type { AdoptedListingCard as AdoptedListingCardType } from '@/shared/types'
import { AdoptedListingCard } from './AdoptedListingCard'
import { flattenPages } from '@/shared/lib/infiniteList'

const AdoptionListTab = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    useInfiniteQuery(adoptionQueries.myAdopted())

  // 입양일 기준 그룹 — 서버가 최신순으로 주므로 삽입 순서를 그대로 유지한다
  const groupedByDate = useMemo(() => {
    const items = dedupeBy(flattenPages(data), (pet) => pet.petId)
    return items.reduce<Record<string, AdoptedListingCardType[]>>((acc, pet) => {
      const date = formatDate(pet.adoptedAt)
      acc[date] ??= []
      acc[date].push({ ...mapAdoptionCard(pet), adoptedAt: date })
      return acc
    }, {})
  }, [data])
  const groupedEntries = Object.entries(groupedByDate)

  return (
    // 패딩: 모바일 py20·px16(기본 20→px-4 오버라이드) / tab px48 / pc px80·py40 — 카드는 max-w로 중앙정렬
    <Container className="px-4 py-5 pc:py-10">
      <div className="flex flex-col gap-3 tab:gap-[0.625rem]">
        <ListState
          isPending={isPending}
          isError={isError}
          isEmpty={groupedEntries.length === 0}
          loadingText="입양목록을 불러오는 중입니다."
          errorText="입양목록을 불러오지 못했습니다."
          emptyText="입양한 내역이 없습니다."
        >
          {groupedEntries.map(([date, items]) => (
            <div key={date} className="flex flex-col gap-[0.375rem] tab:gap-[0.625rem]">
              {/* 입양 날짜 — 모바일·탭 body-sm(12) / pc body-md(14), medium, #6b6b6b */}
              <p className="text-body-sm font-medium text-neutral-700 pc:text-body-md">
                입양 날짜 : {date}
              </p>
              {items.map((listing) => (
                <AdoptedListingCard key={listing.listingId} listing={listing} />
              ))}
            </div>
          ))}
        </ListState>

        <InfiniteScrollTrigger
          onIntersect={fetchNextPage}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
    </Container>
  )
}

export { AdoptionListTab }
