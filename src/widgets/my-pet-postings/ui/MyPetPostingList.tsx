'use client'

import { useState, type ReactNode } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { InfiniteScrollTrigger, ListState, TextLabel } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import type { PetStatus } from '@/shared/types'
import { AdoptionGridCard, PetStatusFilter } from '@/entities/adoption'
import { petPostingQueries } from '@/entities/pet-posting'
import { mapMyPetPostingCard } from '../model/mapMyPetPostingCard'

const DEFAULT_GRID = 'grid grid-cols-2 gap-x-3 gap-y-6 tab:grid-cols-3 pc:grid-cols-4'

interface MyPetPostingListProps {
  pageSize: number
  /** 라벨 줄 오른쪽 액션(분양글 작성 등) — 있으면 필터 칩은 다음 줄로 내려간다 */
  action?: ReactNode
  /** 필터 줄 오른쪽의 낮은 위계 관리 액션(임시저장 목록 등). */
  secondaryAction?: ReactNode
  /** 라벨 옆에 필터 적용 후 전체 개수 표시 (분양 페이지 시안의 '분양 목록 109') */
  showTotalCount?: boolean
  /** 그리드 간격 오버라이드 — 화면마다 시안 값이 다르다 */
  gridClassName?: string
}

/**
 * 내 분양글 목록 (상태 필터 + 그리드 + 무한 스크롤). 브리더 마이홈의 분양중 탭이 쓴다.
 * 바깥 여백은 호출부의 Container 가 담당한다.
 */
const MyPetPostingList = ({
  pageSize,
  action,
  secondaryAction,
  showTotalCount = false,
  gridClassName,
}: MyPetPostingListProps) => {
  // 같은 칩을 다시 누르면 해제 -> 전체
  const [status, setStatus] = useState<PetStatus | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    useInfiniteQuery(petPostingQueries.myList(status ?? undefined, pageSize))

  // 무한스크롤 페이지 병합 시 petId 중복 제거 (React key 중복 방어)
  const postings = dedupeBy(flattenPages(data), (posting) => posting.petId)

  return (
    <div className="flex flex-col gap-3">
      <div className={cn('flex gap-2', action ? 'flex-col' : 'items-center justify-between')}>
        <div className="flex items-center justify-between gap-2">
          <TextLabel size="16">
            분양 목록{showTotalCount ? ` ${getTotalItems(data)}` : ''}
          </TextLabel>
          {action}
        </div>

        <div className="flex items-center justify-between gap-3">
          <PetStatusFilter value={status} onChange={setStatus} />
          {secondaryAction && <div className="shrink-0">{secondaryAction}</div>}
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
