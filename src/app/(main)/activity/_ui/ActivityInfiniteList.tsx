'use client'

import { useMemo, type ReactNode } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { createInfiniteQuery } from '@/shared/api'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages } from '@/shared/lib/infiniteList'
import { ActivityListLayout } from './ActivityListLayout'

interface ActivityInfiniteListProps<T> {
  query: ReturnType<typeof createInfiniteQuery<T>>
  title: string
  description: string
  emptyText: string
  keyOf: (item: T) => string
  renderItem: (item: T) => ReactNode
}

/** 네 활동 탭 리스트(보낸/받은 신청·후기)가 공유하는 무한 스크롤 조회 뼈대. */
export const ActivityInfiniteList = <T,>({
  query,
  title,
  description,
  emptyText,
  keyOf,
  renderItem,
}: ActivityInfiniteListProps<T>) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, refetch } =
    useInfiniteQuery(query)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- keyOf/renderItem은 호출부에서 매 렌더 새로 만들어지는 순수 함수라, data 변경 시에만 재계산하면 된다
  const items = useMemo(() => dedupeBy(flattenPages(data), keyOf), [data])

  return (
    <ActivityListLayout
      title={title}
      description={description}
      isPending={isPending}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText={emptyText}
      hasNextPage={!!hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onRetry={() => void refetch()}
      onLoadMore={() => void fetchNextPage()}
    >
      {items.map(renderItem)}
    </ActivityListLayout>
  )
}
