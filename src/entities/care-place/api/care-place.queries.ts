import { queryOptions } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/api'
import type { CarePlaceSearch } from '../model/types'
import { getCareDirectorySummary, getCareMapConfig, searchCarePlaces } from './care-place.api'

export const carePlaceQueries = {
  all: () => ['care-place'] as const,

  config: () =>
    queryOptions({
      queryKey: [...carePlaceQueries.all(), 'config'],
      queryFn: ({ signal }) => getCareMapConfig(signal),
      staleTime: STALE_TIME.DEFAULT,
    }),

  directorySummary: () =>
    queryOptions({
      queryKey: [...carePlaceQueries.all(), 'directory-summary'],
      queryFn: ({ signal }) => getCareDirectorySummary(signal),
      staleTime: STALE_TIME.DEFAULT,
    }),

  places: (search: CarePlaceSearch, page: number) =>
    queryOptions({
      queryKey: [...carePlaceQueries.all(), 'places', search, page],
      queryFn: ({ signal }) => searchCarePlaces(search, page, signal),
      // 실시간 장소 좌표는 지금 보여주는 결과에만 쓴다.
      staleTime: STALE_TIME.REALTIME,
      gcTime: 0,
      refetchOnWindowFocus: false,
    }),
}
