import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query'
import type { PaginationResponse } from '@/shared/types'

export const STALE_TIME = {
  REALTIME: 0,
  DEFAULT: 1000 * 60 * 5, // 5분
  LONG: 1000 * 60 * 10, // 10분
  VERY_LONG: 1000 * 60 * 30, // 30분
  STATIC: Infinity,
} as const

const DEFAULT_STALE_TIME = STALE_TIME.DEFAULT

/**
 * 단순 쿼리 옵션 생성 헬퍼.
 * queryKey, queryFn만 넘기면 staleTime 등 공통 옵션이 적용됩니다.
 */
export function createQuery<TData>(config: {
  queryKey: readonly unknown[]
  queryFn: () => Promise<TData>
  enabled?: boolean
  staleTime?: number
}) {
  return queryOptions({
    queryKey: config.queryKey,
    queryFn: config.queryFn,
    enabled: config.enabled,
    staleTime: config.staleTime ?? DEFAULT_STALE_TIME,
  })
}

/**
 * 무한 스크롤 쿼리 옵션 생성 헬퍼 (표준 PaginationResponse 형식).
 * queryFn은 page 번호만 받으면 됩니다.
 *
 * 응답 형식: { items: T[]; pagination: { hasNextPage, currentPage, ... } }
 */
export function createInfiniteQuery<TData>(config: {
  queryKey: readonly unknown[]
  queryFn: (page: number) => Promise<PaginationResponse<TData>>
  enabled?: boolean
  staleTime?: number
}) {
  return infiniteQueryOptions({
    queryKey: config.queryKey,
    queryFn: ({ pageParam }) => config.queryFn(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasNextPage ? last.pagination.currentPage + 1 : undefined,
    enabled: config.enabled,
    staleTime: config.staleTime ?? DEFAULT_STALE_TIME,
  })
}

/**
 * 무한 스크롤 쿼리 옵션 생성 헬퍼 (hasMore 형식).
 * queryFn은 page 번호만 받으면 됩니다.
 *
 * 응답 형식: { data: T[]; hasMore: boolean }
 */
export function createInfiniteQueryWithHasMore<TData>(config: {
  queryKey: readonly unknown[]
  queryFn: (page: number) => Promise<{ data: TData[]; hasMore: boolean }>
  enabled?: boolean
  staleTime?: number
}) {
  return infiniteQueryOptions({
    queryKey: config.queryKey,
    queryFn: ({ pageParam }) => config.queryFn(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.hasMore ? all.length + 1 : undefined),
    enabled: config.enabled,
    staleTime: config.staleTime ?? DEFAULT_STALE_TIME,
  })
}
