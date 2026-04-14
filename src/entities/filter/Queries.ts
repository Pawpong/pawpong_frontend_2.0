import { createQuery, STALE_TIME } from '@/shared/api'
import { getAllFilterOptions } from './Api'

export const filterQueries = {
  all: () => ['filter'] as const,

  options: () =>
    createQuery({
      queryKey: [...filterQueries.all(), 'options'],
      queryFn: getAllFilterOptions,
      staleTime: STALE_TIME.STATIC,
    }),
}
