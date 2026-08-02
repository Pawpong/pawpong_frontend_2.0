import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import type { MyReviewItemDto } from '@/shared/types'
import { getAdopterProfile, getAdopterPublicProfile, getMyReviews } from './adopter.api'

export const adopterQueries = {
  all: () => ['adopter'] as const,

  profile: () =>
    createQuery({
      queryKey: [...adopterQueries.all(), 'profile'],
      queryFn: getAdopterProfile,
    }),

  publicProfile: (userId: string) =>
    createQuery({
      queryKey: [...adopterQueries.all(), 'public-profile', userId],
      queryFn: () => getAdopterPublicProfile(userId),
      enabled: !!userId,
      staleTime: STALE_TIME.VERY_LONG,
    }),

  reviews: (limit = 10) =>
    createInfiniteQuery<MyReviewItemDto>({
      queryKey: [...adopterQueries.all(), 'reviews', limit],
      queryFn: (page) => getMyReviews(page, limit),
    }),
}
