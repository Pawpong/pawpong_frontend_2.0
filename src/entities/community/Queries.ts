import { createInfiniteQuery, createQuery, STALE_TIME } from '@/shared/api'
import type { CommunityPostListParams, CommunitySortType, CommunityPetType } from '@/shared/types'
import { getCommunityPosts, getCommunityPostDetail } from './Api'

export const communityQueries = {
  all: () => ['community'] as const,

  posts: (
    sort: CommunitySortType = 'latest',
    petType?: CommunityPetType,
    category?: string,
    pageSize = 15,
  ) =>
    createInfiniteQuery({
      queryKey: [...communityQueries.all(), 'posts', sort, petType, category, pageSize],
      queryFn: (page) =>
        getCommunityPosts({ sort, petType, category, page, pageSize }),
      staleTime: STALE_TIME.DEFAULT,
    }),

  detail: (postId: string) =>
    createQuery({
      queryKey: [...communityQueries.all(), 'detail', postId],
      queryFn: () => getCommunityPostDetail(postId),
      enabled: !!postId,
      staleTime: STALE_TIME.DEFAULT,
    }),
}
