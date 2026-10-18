'use client'

import { useState, type ReactNode } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  RetryButton,
  Button,
  SortOptions,
  InfiniteScrollTrigger,
  ListHeader,
  ListState,
} from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { TEXT } from '@/shared/config'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import type { PetStatus, MyPetPostingSort } from '@/shared/types'
import { PetStatusFilter } from '@/entities/adoption'
import { petPostingQueries } from '@/entities/pet-posting'
import { MyPetPostingCard } from './MyPetPostingCard'

const SORT_OPTIONS = [
  { value: 'latest', label: '최근 등록순' },
  { value: 'popular', label: '관심 많은순' },
] satisfies Array<{ value: MyPetPostingSort; label: string }>

const DEFAULT_GRID = 'flex flex-col'

interface MyPetPostingListProps {
  pageSize: number
  /** 등록된 글이 없을 때 안내와 함께 보여줄 액션. */
  emptyAction?: ReactNode
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
  emptyAction,
  showTotalCount = false,
  gridClassName,
}: MyPetPostingListProps) => {
  const [sort, setSort] = useState<MyPetPostingSort>('latest')
  // 같은 칩을 다시 누르면 해제 -> 전체
  const [status, setStatus] = useState<PetStatus | null>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    refetch,
    isFetchNextPageError,
    isFetching: isRetrying,
  } = useInfiniteQuery(petPostingQueries.myList(status ?? undefined, pageSize, sort))

  // 무한스크롤 페이지 병합 시 petId 중복 제거 (React key 중복 방어)
  const postings = dedupeBy(flattenPages(data), (posting) => posting.petId)

  return (
    <section aria-label="내 분양 목록" className="flex flex-col">
      <ListHeader
        title="분양 목록"
        count={showTotalCount && data ? getTotalItems(data) : undefined}
      >
        <PetStatusFilter value={status} onChange={setStatus} />
        <SortOptions
          compact
          ariaLabel="내 분양 목록 정렬"
          options={SORT_OPTIONS}
          value={sort}
          onValueChange={setSort}
        />
      </ListHeader>

      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={postings.length === 0}
        loadingText="분양 목록을 불러오는 중이에요."
        errorText="분양 목록을 불러오지 못했어요."
        emptyText={
          <div className="flex flex-col items-center gap-3">
            <span>{status ? '해당 상태의 분양글이 없어요.' : '아직 등록한 분양글이 없어요.'}</span>
            <span className={TEXT.sub}>
              {status
                ? '다른 상태의 아이들도 확인해 보세요.'
                : '첫 분양글을 작성하고 아이의 가족을 만나보세요.'}
            </span>
            {status ? (
              <Button intent="secondary" size="md" onClick={() => setStatus(null)}>
                전체 보기
              </Button>
            ) : (
              emptyAction
            )}
          </div>
        }
        onRetry={() => void refetch()}
        isRetrying={isRetrying}
      >
        <div className={cn(DEFAULT_GRID, gridClassName)}>
          {postings.map((posting) => (
            <MyPetPostingCard key={posting.petId} posting={posting} />
          ))}
        </div>
      </ListState>

      {isFetchNextPageError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-center gap-3 text-body-md text-neutral-700"
        >
          다음 분양글을 불러오지 못했어요.
          <RetryButton onRetry={() => void fetchNextPage()} isRetrying={isFetchingNextPage} />
        </div>
      )}
      <InfiniteScrollTrigger
        onIntersect={() => void fetchNextPage()}
        hasNextPage={Boolean(hasNextPage) && !isFetchNextPageError}
        isFetchingNextPage={isFetchingNextPage}
      />
    </section>
  )
}

export { MyPetPostingList }
