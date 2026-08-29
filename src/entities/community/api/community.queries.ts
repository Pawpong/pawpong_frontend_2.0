import { createInfiniteQuery, createQuery, STALE_TIME } from '@/shared/api'
import type { CommunitySortType, CommunityPetType } from '@/shared/types'
import {
  getCommunityPosts,
  getCommunityPostDetail,
  getCommunityComments,
  getMyBookmarkedPosts,
  getMyDraftPosts,
} from './community.api'

export const communityQueries = {
  all: () => ['community'] as const,

  postsAll: () => [...communityQueries.all(), 'posts'] as const,

  posts: (
    sort: CommunitySortType = 'latest',
    petType?: CommunityPetType,
    category?: string,
    search?: string,
    pageSize = 15,
  ) =>
    createInfiniteQuery({
      queryKey: [...communityQueries.postsAll(), sort, petType, category, search, pageSize],
      queryFn: (page) => getCommunityPosts({ sort, petType, category, search, page, pageSize }),
      staleTime: STALE_TIME.DEFAULT,
    }),

  detailsAll: () => [...communityQueries.all(), 'detail'] as const,

  detailKey: (postId: string) => [...communityQueries.detailsAll(), postId] as const,

  detail: (postId: string) =>
    createQuery({
      queryKey: communityQueries.detailKey(postId),
      queryFn: () => getCommunityPostDetail(postId),
      enabled: !!postId,
      staleTime: STALE_TIME.DEFAULT,
    }),

  myPostsAll: () => [...communityQueries.all(), 'myPosts'] as const,

  // 마이홈 '게시글' 탭 — 내가 쓴 커뮤니티 글(authorId=me). 인증 필요.
  myPosts: (enabled = true, pageSize = 30) =>
    createQuery({
      queryKey: [...communityQueries.myPostsAll(), pageSize],
      queryFn: () => getCommunityPosts({ authorId: 'me', pageSize }),
      enabled,
      staleTime: STALE_TIME.DEFAULT,
    }),

  userPostsAll: () => [...communityQueries.all(), 'userPosts'] as const,

  // 특정 사용자가 쓴 글 — 브리더홈 '게시글' 탭. 글 수 제한이 없어 무한 스크롤로 받는다.
  userPosts: (userId: string, pageSize = 30) =>
    createInfiniteQuery({
      queryKey: [...communityQueries.userPostsAll(), userId, pageSize],
      queryFn: (page) => getCommunityPosts({ authorId: userId, page, pageSize }),
      enabled: !!userId,
      staleTime: STALE_TIME.DEFAULT,
    }),

  draftsAll: () => [...communityQueries.all(), 'drafts'] as const,

  // 임시저장(draft) 한 내 글 — 본인만 조회 가능. 인증 필요.
  drafts: (enabled = true, pageSize = 30) =>
    createQuery({
      queryKey: [...communityQueries.draftsAll(), pageSize],
      queryFn: () => getMyDraftPosts({ pageSize }),
      enabled,
      staleTime: STALE_TIME.DEFAULT,
    }),

  commentsAll: () => [...communityQueries.all(), 'comments'] as const,

  commentsForPost: (postId: string) => [...communityQueries.commentsAll(), postId] as const,

  comments: (postId: string, pageSize = 20) =>
    createInfiniteQuery({
      queryKey: [...communityQueries.commentsForPost(postId), pageSize],
      queryFn: (page) => getCommunityComments(postId, { page, pageSize }),
      enabled: !!postId,
      staleTime: STALE_TIME.DEFAULT,
    }),

  myBookmarksAll: () => [...communityQueries.all(), 'myBookmarks'] as const,

  myBookmarks: (pageSize = 15) =>
    createInfiniteQuery({
      queryKey: [...communityQueries.myBookmarksAll(), pageSize],
      queryFn: (page) => getMyBookmarkedPosts({ page, pageSize }),
      staleTime: STALE_TIME.DEFAULT,
    }),
}
