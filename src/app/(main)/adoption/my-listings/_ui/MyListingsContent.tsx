'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  Container,
  FilterChip,
  InfiniteScrollTrigger,
  InputUpload,
  ListState,
  NavigationBar,
  TextLabel,
} from '@/shared/ui'
import type { PetStatus } from '@/shared/types'
import { ADOPTION_CARD_STATUS, AdoptionGridCard } from '@/entities/adoption'
import { petPostingQueries } from '@/entities/pet-posting'
import { mapMyPetPostingCard } from '@/shared/lib/mapMyPetPostingCard'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'

// [refactored] 상태 목록·라벨 단일 소스는 ADOPTION_CARD_STATUS (카드 뱃지와 같은 곳)
const STATUS_FILTERS = Object.keys(ADOPTION_CARD_STATUS) as PetStatus[]
const PAGE_SIZE = 16

/** 브리더 분양 페이지 (Figma 3138-493376) — 작성 유도 바 + 상태 필터 + 내 분양글 그리드 */
const MyListingsContent = () => {
  // 같은 칩을 다시 누르면 해제 -> 전체
  const [status, setStatus] = useState<PetStatus | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    useInfiniteQuery(petPostingQueries.myList(status ?? undefined, PAGE_SIZE))

  const postings = flattenPages(data)
  // 시안의 '분양 목록 109' — 필터 적용 후 전체 개수 (첫 페이지 응답 기준)
  const totalCount = getTotalItems(data)

  return (
    <div className="flex w-full flex-col pb-12">
      <NavigationBar title="분양 페이지" backHref="/home" />

      <InputUpload text="분양할 동물 작성하러가기" href="/adoption/create" />

      <Container className="flex flex-col gap-3 py-6 tab:py-10">
        <div className="flex items-center justify-between gap-2">
          <TextLabel size="16">분양 목록 {totalCount}</TextLabel>

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
          isPending={isPending}
          isError={isError}
          isEmpty={postings.length === 0}
          loadingText="분양 목록을 불러오는 중입니다."
          errorText="분양 목록을 불러오지 못했습니다."
          emptyText="등록한 분양글이 없습니다."
        >
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 tab:grid-cols-3 pc:grid-cols-4">
            {postings.map((posting) => (
              <AdoptionGridCard
                key={posting.petId}
                listing={mapMyPetPostingCard(posting)}
                showFavorite={false}
              />
            ))}
          </div>
        </ListState>

        <InfiniteScrollTrigger
          onIntersect={() => void fetchNextPage()}
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
        />
      </Container>
    </div>
  )
}

export { MyListingsContent }
