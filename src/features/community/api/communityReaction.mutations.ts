'use client'

import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import { patchCachedItem } from '@/shared/lib/patchCachedItem'
import {
  likeCommunityPost,
  unlikeCommunityPost,
  bookmarkCommunityPost,
  unbookmarkCommunityPost,
} from './community.api'

/** 리액션 패치에 필요한 공통 필드 — 목록 카드와 상세가 함께 가진다 */
interface ReactablePost {
  postId: string
  isLiked: boolean
  likeCount: number
  isSaved: boolean
  saveCount: number
}

const REACTION_FIELDS = ['postId', 'isLiked', 'likeCount', 'isSaved', 'saveCount'] as const

const isReactablePost = (value: unknown): value is ReactablePost =>
  typeof value === 'object' && value !== null && REACTION_FIELDS.every((field) => field in value)

/** community 캐시 안의 특정 게시글만 갈아끼운다. */
const patchCommunityPost = (
  data: unknown,
  postId: string,
  patch: (post: ReactablePost) => ReactablePost,
): unknown =>
  patchCachedItem(data, (value) =>
    isReactablePost(value) && value.postId === postId ? patch(value) : value,
  )

interface OptimisticReactionOptions {
  postId: string
  /** 토글 직전 상태 — true면 해제 요청 */
  active: boolean
  mutationFn: (active: boolean) => Promise<unknown>
  patch: (post: ReactablePost, nextActive: boolean) => ReactablePost
  /** 낙관적 패치만으로 부족해 실제 재조회가 필요한 쿼리 (예: 저장목록에서 항목 제거) */
  refetchKey?: QueryKey
}

/**
 * 좋아요/북마크 공용 낙관적 토글.
 *
 * 목록(posts/myPosts/drafts/myBookmarks)과 상세가 같은 게시글을 각각 들고 있어,
 * community 전체를 스코프로 잡고 해당 postId만 갈아끼운다.
 * onSettled는 refetchType 'none' — 재요청 없이 "다음 마운트 때 최신화" 표시만 남긴다.
 * active는 로컬 state가 아니라 호출부가 넘긴 캐시 값이 그대로 흐른다.
 */
const useOptimisticReaction = ({
  postId,
  active,
  mutationFn,
  patch,
  refetchKey,
}: OptimisticReactionOptions) => {
  const qc = useQueryClient()
  const scope = { queryKey: communityQueries.all() }

  const { mutate, isPending } = useMutation({
    mutationFn,
    onMutate: async (currentActive: boolean) => {
      // 진행 중인 refetch가 낙관적 패치를 덮어쓰지 않도록 먼저 취소.
      // 단 최초 로딩(데이터 없음)까지 끊으면 재요청 없이 pending으로 남으므로 제외한다.
      await qc.cancelQueries({ ...scope, predicate: (query) => query.state.data !== undefined })
      const snapshot = qc.getQueriesData(scope)
      qc.setQueriesData(scope, (data) =>
        patchCommunityPost(data, postId, (post) => patch(post, !currentActive)),
      )
      return { snapshot }
    },
    onError: (_error, _currentActive, context) => {
      context?.snapshot.forEach(([queryKey, data]) => qc.setQueryData(queryKey, data))
    },
    onSettled: () => {
      void qc.invalidateQueries({ ...scope, refetchType: 'none' })
      if (refetchKey) void qc.invalidateQueries({ queryKey: refetchKey })
    },
  })

  return {
    isPending,
    toggle: () => {
      if (isPending) return
      mutate(active)
    },
  }
}

/** 카드/상세 공용 좋아요 토글 — isLiked는 서버 상태(목록·상세 캐시)를 그대로 쓴다. */
export const useToggleCommunityPostLike = (postId: string, isLiked: boolean) => {
  const { isPending, toggle } = useOptimisticReaction({
    postId,
    active: isLiked,
    mutationFn: (liked) => (liked ? unlikeCommunityPost(postId) : likeCommunityPost(postId)),
    patch: (post, nextLiked) => ({
      ...post,
      isLiked: nextLiked,
      likeCount: Math.max(0, post.likeCount + (nextLiked ? 1 : -1)),
    }),
  })

  return { isPending, toggleLike: toggle }
}

/**
 * 카드/상세 공용 북마크 토글 — isSaved는 서버 상태(목록·상세 캐시)를 그대로 쓴다.
 * 저장목록은 "저장한 글만" 담는 목록이라 해제된 항목이 빠지도록 그 쿼리만 재조회한다.
 */
export const useToggleCommunityPostBookmark = (postId: string, isSaved: boolean) => {
  const { isPending, toggle } = useOptimisticReaction({
    postId,
    active: isSaved,
    mutationFn: (saved) =>
      saved ? unbookmarkCommunityPost(postId) : bookmarkCommunityPost(postId),
    patch: (post, nextSaved) => ({
      ...post,
      isSaved: nextSaved,
      saveCount: Math.max(0, post.saveCount + (nextSaved ? 1 : -1)),
    }),
    refetchKey: communityQueries.myBookmarksAll(),
  })

  return { isPending, toggleBookmark: toggle }
}
