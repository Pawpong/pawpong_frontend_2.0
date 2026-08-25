import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'

/** 게시글 카드가 담기는 목록 캐시들. 상세·댓글처럼 무관한 캐시는 포함하지 않는다. */
const COMMUNITY_POST_LIST_KEYS: QueryKey[] = [
  communityQueries.postsAll(),
  communityQueries.myPostsAll(),
  communityQueries.userPostsAll(),
  communityQueries.draftsAll(),
  communityQueries.myBookmarksAll(),
]

export const invalidateCommunityPostLists = (queryClient: QueryClient) =>
  Promise.all(
    COMMUNITY_POST_LIST_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  )

/** 게시글 본문과 그 게시글이 담긴 목록만 최신화한다. */
export const invalidateCommunityPostData = (queryClient: QueryClient, postId: string) =>
  Promise.all([
    invalidateCommunityPostLists(queryClient),
    queryClient.invalidateQueries({ queryKey: communityQueries.detailKey(postId) }),
  ])

/** 댓글 목록·댓글 수·미리보기를 최신화하되 다른 게시글의 상세/댓글은 건드리지 않는다. */
export const invalidateCommunityPostSurface = (queryClient: QueryClient, postId: string) =>
  Promise.all([
    invalidateCommunityPostData(queryClient, postId),
    queryClient.invalidateQueries({ queryKey: communityQueries.commentsForPost(postId) }),
  ])

/** 삭제된 게시글 전용 캐시는 제거하고, 그 게시글이 포함될 수 있는 목록만 갱신한다. */
export const invalidateDeletedCommunityPost = (queryClient: QueryClient, postId: string) => {
  queryClient.removeQueries({ queryKey: communityQueries.detailKey(postId), exact: true })
  queryClient.removeQueries({ queryKey: communityQueries.commentsForPost(postId) })
  return invalidateCommunityPostLists(queryClient)
}
