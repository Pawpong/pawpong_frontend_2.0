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
type RefetchOnMount = boolean | 'always'

/**
 * 화면에 다시 들어올 때는 staleTime 이 지난 데이터만 다시 받는다 (TanStack 기본값 true).
 * 신선한 캐시는 그대로 쓰고, 쓰기 후에는 각 mutation 의 invalidateQueries 가 새로 받게 한다.
 * 실시간 데이터는 STALE_TIME.REALTIME(0) 이라 들어올 때마다 받는다.
 * 'always' 로 기본값을 두면 신선한 캐시도 매번 다시 받고, 무한 목록은 불러온 페이지를 전부 다시 받았다.
 * 수정 폼처럼 들어올 때 반드시 최신이어야 하는 화면만 refetchOnMount: 'always' 를 직접 넘긴다.
 */
const resolveRefetchOnMount = (refetchOnMount?: RefetchOnMount): RefetchOnMount =>
  refetchOnMount ?? true

/**
 * 단순 쿼리 옵션 생성 헬퍼.
 * queryKey, queryFn만 넘기면 staleTime 등 공통 옵션이 적용됩니다.
 */
export function createQuery<TData>(config: {
  queryKey: readonly unknown[]
  queryFn: () => Promise<TData>
  enabled?: boolean
  staleTime?: number
  refetchOnMount?: RefetchOnMount
  /** 비필수 섹션은 false로 — 실패해도 에러 바운더리로 던지지 않고 degrade (기본: 전역 정책) */
  throwOnError?: boolean
}) {
  const staleTime = config.staleTime ?? DEFAULT_STALE_TIME

  return queryOptions({
    queryKey: config.queryKey,
    queryFn: config.queryFn,
    enabled: config.enabled,
    staleTime,
    refetchOnMount: resolveRefetchOnMount(config.refetchOnMount),
    ...(config.throwOnError !== undefined && { throwOnError: config.throwOnError }),
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
  queryFn: (page: number, signal: AbortSignal) => Promise<PaginationResponse<TData>>
  enabled?: boolean
  staleTime?: number
  refetchOnMount?: RefetchOnMount
}) {
  const staleTime = config.staleTime ?? DEFAULT_STALE_TIME

  return infiniteQueryOptions({
    queryKey: config.queryKey,
    queryFn: ({ pageParam, signal }) => config.queryFn(pageParam as number, signal),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasNextPage ? last.pagination.currentPage + 1 : undefined,
    enabled: config.enabled,
    staleTime,
    refetchOnMount: resolveRefetchOnMount(config.refetchOnMount),
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
  refetchOnMount?: RefetchOnMount
}) {
  const staleTime = config.staleTime ?? DEFAULT_STALE_TIME

  return infiniteQueryOptions({
    queryKey: config.queryKey,
    queryFn: ({ pageParam }) => config.queryFn(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.hasMore ? all.length + 1 : undefined),
    enabled: config.enabled,
    staleTime,
    refetchOnMount: resolveRefetchOnMount(config.refetchOnMount),
  })
}
