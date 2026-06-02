import { createQuery, STALE_TIME } from '@/shared/api'
import { getActivePopularKeywords } from './popular-keyword.api'

export const popularKeywordQueries = {
  all: () => ['popularKeyword'] as const,

  list: () =>
    createQuery({
      queryKey: [...popularKeywordQueries.all(), 'list'],
      queryFn: () => getActivePopularKeywords(),
      staleTime: STALE_TIME.LONG,
    }),
}
