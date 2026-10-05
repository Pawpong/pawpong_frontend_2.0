import { queryOptions } from '@tanstack/react-query'
import { createQuery, STALE_TIME } from '@/shared/api'
import { getAiImageFilters, getMyAiImageGenerations } from './aiImage.api'

export const aiImageQueries = {
  all: () => ['ai-image'] as const,

  filters: () =>
    createQuery({
      queryKey: [...aiImageQueries.all(), 'filters'],
      queryFn: () => getAiImageFilters(),
      staleTime: STALE_TIME.LONG,
      // 필터 목록은 부가 기능이라 실패해도 화면 전체를 막지 않는다
      throwOnError: false,
    }),

  /** 내 AI 사진 보관함 — 로그인 상태에서만 켠다 */
  myGenerations: (enabled = true) =>
    queryOptions({
      ...createQuery({
        queryKey: [...aiImageQueries.all(), 'my-generations'],
        queryFn: () => getMyAiImageGenerations(),
        staleTime: STALE_TIME.REALTIME,
        enabled,
        throwOnError: false,
      }),
      refetchInterval: (query) =>
        query.state.data?.some((job) => ['pending', 'queued', 'processing'].includes(job.status))
          ? 5000
          : false,
    }),
}
