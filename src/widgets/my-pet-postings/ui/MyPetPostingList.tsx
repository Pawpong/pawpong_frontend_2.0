'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { FilterChip, InfiniteScrollTrigger, ListState, TextLabel } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'
import type { PetStatus } from '@/shared/types'
import { ADOPTION_CARD_STATUS, AdoptionGridCard } from '@/entities/adoption'
import { petPostingQueries } from '@/entities/pet-posting'
import { mapMyPetPostingCard } from '../model/mapMyPetPostingCard'

// 상태 목록·라벨 단일 소스는 ADOPTION_CARD_STATUS (카드 뱃지와 같은 곳)
const STATUS_FILTERS = Object.keys(ADOPTION_CARD_STATUS) as PetStatus[]

const DEFAULT_GRID = 'grid grid-cols-2 gap-x-3 gap-y-6 tab:grid-cols-3 pc:grid-cols-4'

interface MyPetPostingListProps {
  pageSize?: number
  /** 라벨 옆에 필터 적용 후 전체 개수 표시 (분양 페이지 시안의 '분양 목록 109') */
  showTotalCount?: boolean
  /** 그리드 간격 오버라이드 — 화면마다 시안 값이 다르다 */
  gridClassName?: string
}

/**
 * 내 분양글 목록 (상태 필터 + 그리드 + 무한 스크롤).
 *
 * [refactored] 분양 페이지(`/adoption/my-listings`)와 브리더 마이홈 분양 탭이
 * 쿼리·필터 상태·빈/에러 문구·카드 그리드까지 똑같아 한 곳으로 모았다.
 * 바깥 여백은 호출부의 Container 가 담당한다.
 */
const MyPetPostingList = ({
  pageSize = 16,
  showTotalCount = false,
  gridClassName,
}: MyPetPostingListProps) => {
  // 같은 칩을 다시 누르면 해제 -> 전체
  const [status, setStatus] = useState<PetStatus | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    useInfiniteQuery(petPostingQueries.myList(status ?? undefined, pageSize))

  const postings = flattenPages(data)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <TextLabel size="16">분양 목록{showTotalCount ? ` ${getTotalItems(data)}` : ''}</TextLabel>

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
        <div className={cn(DEFAULT_GRID, gridClassName)}>
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
    </div>
  )
}

export { MyPetPostingList }
