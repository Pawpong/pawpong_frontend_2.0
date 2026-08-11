'use client'

import { useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import { AdoptionCardGrid } from '@/features/adoption'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { Container, FilterChip, InfiniteScrollTrigger, ListState, SectionHeader } from '@/shared/ui'
import type { PetStatus } from '@/shared/types'

// 서버 status 필터 (미지정 = 전체) — 클라이언트에서 거르지 않고 쿼리 파라미터로 넘긴다
const STATUS_FILTERS: Array<{ value: PetStatus | 'all'; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'available', label: '분양중' },
  { value: 'adopted', label: '분양완료' },
]

const FavoritesTab = () => {
  const [filter, setFilter] = useState<PetStatus | 'all'>('all')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    useInfiniteQuery(adoptionQueries.myFavorites(filter === 'all' ? undefined : filter))

  // 페이지 경계에서 서버가 항목을 겹쳐 주더라도 React key가 중복되지 않도록 방어 (탐색과 동일)
  const listings = useMemo(
    () =>
      dedupeBy(
        (data?.pages.flatMap((page) => page.items) ?? []).map(mapAdoptionCard),
        (listing) => listing.listingId,
      ),
    [data],
  )
  const totalCount = data?.pages[0]?.pagination.totalItems ?? 0

  return (
    // 섹션 패딩을 Container로 일원화 (세로 20/40/40 · 가로 16/48/80, 모바일만 기본값 20→16 오버라이드)
    // 헤더-그리드 간격은 gap으로 (모바일 10px / tab 12px)
    <Container className="flex flex-col gap-2.5 px-4 py-5 tab:gap-3 tab:py-10">
      {/* 라벨 사이즈: 반응형 토큰 text-body-s (모바일 14 → tab+ 16). tab:/pc:도 지정해야 기본 램프를 덮음 */}
      <SectionHeader
        titleClassName="text-body-s tab:text-body-s pc:text-body-s"
        title={`입양 관심 목록 ${totalCount}`}
        // 입양 탐색 링크 자리에 상태 필터를 둔다
        rightSlot={
          // 탐색 탭과 동일한 필터 칩 (Figma 975-19584)
          <div className="flex shrink-0 items-center gap-2" aria-label="분양 상태 필터">
            {STATUS_FILTERS.map(({ value, label }) => (
              <FilterChip
                key={value}
                selected={filter === value}
                onClick={() => setFilter(value)}
                size="responsive"
              >
                {label}
              </FilterChip>
            ))}
          </div>
        }
      />

      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={listings.length === 0}
        loadingText="관심 목록을 불러오는 중입니다."
        errorText="관심 목록을 불러오지 못했습니다."
        emptyText="관심 표시한 입양글이 없습니다."
      >
        <AdoptionCardGrid listings={listings} />
      </ListState>

      <InfiniteScrollTrigger
        onIntersect={fetchNextPage}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </Container>
  )
}

export { FavoritesTab }
