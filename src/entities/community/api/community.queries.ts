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

  posts: (
    sort: CommunitySortType = 'latest',
    petType?: CommunityPetType,
    category?: string,
    pageSize = 15,
  ) =>
    createInfiniteQuery({
      queryKey: [...communityQueries.all(), 'posts', sort, petType, category, pageSize],
      queryFn: (page) => getCommunityPosts({ sort, petType, category, page, pageSize }),
      staleTime: STALE_TIME.DEFAULT,
    }),

  detail: (postId: string) =>
    createQuery({
      queryKey: [...communityQueries.all(), 'detail', postId],
      queryFn: () => getCommunityPostDetail(postId),
      enabled: !!postId,
      staleTime: STALE_TIME.DEFAULT,
    }),

  // 마이홈 '게시글' 탭 — 내가 쓴 커뮤니티 글(authorId=me). 인증 필요.
  myPosts: (enabled = true, pageSize = 30) =>
    createQuery({
      queryKey: [...communityQueries.all(), 'myPosts', pageSize],
      queryFn: () => getCommunityPosts({ authorId: 'me', pageSize }),
      enabled,
      staleTime: STALE_TIME.DEFAULT,
    }),

  // 공개 프로필 게시글 탭 — 특정 사용자가 작성한 공개 글.
  userPosts: (userId: string, pageSize = 30) =>
    createQuery({
      queryKey: [...communityQueries.all(), 'userPosts', userId, pageSize],
      queryFn: () => getCommunityPosts({ authorId: userId, pageSize }),
      enabled: !!userId,
      staleTime: STALE_TIME.DEFAULT,
    }),

  // 임시저장(draft) 한 내 글 — 본인만 조회 가능. 인증 필요.
  drafts: (enabled = true, pageSize = 30) =>
    createQuery({
      queryKey: [...communityQueries.all(), 'drafts', pageSize],
      queryFn: () => getMyDraftPosts({ pageSize }),
      enabled,
      staleTime: STALE_TIME.DEFAULT,
    }),

  comments: (postId: string, pageSize = 20) =>
    createInfiniteQuery({
      queryKey: [...communityQueries.all(), 'comments', postId, pageSize],
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
