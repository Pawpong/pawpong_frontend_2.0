import { createQuery, STALE_TIME } from '@/shared/api'
import { getDistricts } from './district.api'

export const districtQueries = {
  all: () => ['district'] as const,

  list: () =>
    createQuery({
      queryKey: [...districtQueries.all(), 'list'],
      queryFn: () => getDistricts(),
      staleTime: STALE_TIME.STATIC,
    }),
}
