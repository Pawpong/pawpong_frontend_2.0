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
 * 페이지 재진입은 서버 상태를 다시 확인하되, 품종·지역·필터처럼 세션 동안 변하지 않는
 * STATIC 참조 데이터는 네트워크 요청을 반복하지 않는다.
 */
const resolveRefetchOnMount = (
  staleTime: number,
  refetchOnMount?: RefetchOnMount,
): RefetchOnMount => refetchOnMount ?? (staleTime === STALE_TIME.STATIC ? false : 'always')

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
    refetchOnMount: resolveRefetchOnMount(staleTime, config.refetchOnMount),
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
  queryFn: (page: number) => Promise<PaginationResponse<TData>>
  enabled?: boolean
  staleTime?: number
  refetchOnMount?: RefetchOnMount
}) {
  const staleTime = config.staleTime ?? DEFAULT_STALE_TIME

  return infiniteQueryOptions({
    queryKey: config.queryKey,
    queryFn: ({ pageParam }) => config.queryFn(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasNextPage ? last.pagination.currentPage + 1 : undefined,
    enabled: config.enabled,
    staleTime,
    refetchOnMount: resolveRefetchOnMount(staleTime, config.refetchOnMount),
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
    refetchOnMount: resolveRefetchOnMount(staleTime, config.refetchOnMount),
  })
}
