import type { InfiniteData } from '@tanstack/react-query'
import type { PaginationResponse } from '@/shared/types'

type InfinitePages<T> = InfiniteData<PaginationResponse<T>> | undefined

/** 무한 쿼리의 모든 페이지를 한 배열로 (data 가 아직 없으면 빈 배열) */
export const flattenPages = <T>(data: InfinitePages<T>): T[] =>
  data?.pages.flatMap((page) => page.items) ?? []

/** 필터 적용 후 전체 개수 — 첫 페이지 응답 기준 (목록 헤더의 "OO 109" 표기용) */
export const getTotalItems = <T>(data: InfinitePages<T>): number =>
  data?.pages[0]?.pagination.totalItems ?? 0
