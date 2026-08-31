import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import type { MyReviewItemDto } from '@/shared/types'
import {
  getAdopterProfile,
  getAdopterPublicProfile,
  getMyReviewDetail,
  getMyReviews,
} from './adopter.api'

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

  // 후기 목록 키(...'reviews')의 하위가 아니라 형제 키로 둔다 —
  // 후기 작성/수정 뮤테이션이 목록만 무효화할 때 상세까지 함께 날아가지 않도록.
  reviewDetail: (reviewId: string) =>
    createQuery({
      queryKey: [...adopterQueries.all(), 'review-detail', reviewId],
      queryFn: () => getMyReviewDetail(reviewId),
      enabled: !!reviewId,
    }),
}
