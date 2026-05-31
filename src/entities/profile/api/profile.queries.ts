import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import { getMyProfile, getFavoriteBreeders } from './profile.api'

export const profileQueries = {
  all: () => ['profile'] as const,

  me: () =>
    createQuery({
      queryKey: [...profileQueries.all(), 'me'],
      queryFn: () => getMyProfile(),
      staleTime: STALE_TIME.VERY_LONG,
    }),

  favoriteBreeders: (pageSize = 10) =>
    createInfiniteQuery({
      queryKey: [...profileQueries.all(), 'favoriteBreeders', pageSize],
      queryFn: (page) => getFavoriteBreeders({ page, pageSize }),
      staleTime: STALE_TIME.DEFAULT,
    }),
}
