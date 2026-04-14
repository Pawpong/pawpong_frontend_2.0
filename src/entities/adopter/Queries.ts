import { createQuery, createInfiniteQuery } from '@/shared/api'
import type { FavoriteItemDto, MyReviewItemDto } from '@/shared/types'
import { getAdopterProfile, getFavorites, getMyReviews } from './Api'

export const adopterQueries = {
  all: () => ['adopter'] as const,

  profile: () =>
    createQuery({
      queryKey: [...adopterQueries.all(), 'profile'],
      queryFn: getAdopterProfile,
    }),

  favorites: (limit = 20) =>
    createInfiniteQuery<FavoriteItemDto>({
      queryKey: [...adopterQueries.all(), 'favorites', limit],
      queryFn: (page) => getFavorites(page, limit),
    }),

  reviews: (limit = 10) =>
    createInfiniteQuery<MyReviewItemDto>({
      queryKey: [...adopterQueries.all(), 'reviews', limit],
      queryFn: (page) => getMyReviews(page, limit),
    }),
}
