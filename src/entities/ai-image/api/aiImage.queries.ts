import { createQuery, STALE_TIME } from '@/shared/api'
import { getAiImageFilters } from './aiImage.api'

export const aiImageQueries = {
  all: () => ['ai-image'] as const,

  filters: () =>
    createQuery({
      queryKey: [...aiImageQueries.all(), 'filters'],
      queryFn: () => getAiImageFilters(),
      staleTime: STALE_TIME.LONG,
      // 필터 목록은 참여 화면의 부가 기능이라 실패해도 화면 전체를 막지 않는다
      throwOnError: false,
    }),
}
