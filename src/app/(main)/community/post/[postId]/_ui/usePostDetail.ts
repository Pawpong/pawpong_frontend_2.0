'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { communityQueries, toPlaceholderPostDetail } from '@/entities/community'
import {
  useToggleCommunityPostLike,
  useToggleCommunityPostBookmark,
  useDeleteCommunityPost,
} from '@/features/community'
import { useMe } from '@/features/auth'
import type { CommunityPostCard, PaginationResponse } from '@/shared/types'

/**
 * 게시글 상세에 필요한 데이터·액션 — 풀페이지(PostDetailContent)와 모달(PostDetailPanel)이
 * 같은 로직을 각자 다른 레이아웃으로 그린다.
 */
const usePostDetail = (postId: string) => {
  const router = useRouter()
  // [refactored] useAuthStatus + profileQueries.me 조합을 useMe로
  const { me } = useMe()
  const queryClient = useQueryClient()
  // 피드에서 넘어온 경우 목록 캐시에 이미 카드가 있다 — 상세 응답을 기다리는 동안
  // 그 값으로 화면을 먼저 채워 빈 모달이 보이지 않게 한다 (정렬·검색어별 캐시를 모두 훑는다)
  const placeholder = useMemo(() => {
    const caches = queryClient.getQueriesData<InfiniteData<PaginationResponse<CommunityPostCard>>>({
      queryKey: communityQueries.postsAll(),
    })

    for (const [, data] of caches) {
      for (const page of data?.pages ?? []) {
        const card = page.items.find((item) => item.postId === postId)
        if (card) return toPlaceholderPostDetail(card)
      }
    }
    return undefined
  }, [queryClient, postId])

  const postQuery = useQuery({
    ...communityQueries.detail(postId),
    placeholderData: placeholder,
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const { data: post, isPending, isError } = postQuery

  const { toggleLike, isPending: isLikePending } = useToggleCommunityPostLike(
    postId,
    post?.isLiked ?? false,
  )
  const { toggleBookmark, isPending: isBookmarkPending } = useToggleCommunityPostBookmark(
    postId,
    post?.isSaved ?? false,
  )
  const deletePost = useDeleteCommunityPost()

  const [confirmDeletePost, setConfirmDeletePost] = useState(false)

  const isOwner = !!me?.userId && !!post && me.userId === post.authorId

  // 삭제 성공 시에만 목록으로 이동 (실패하면 모달을 유지해 재시도 가능)
  const handleDeletePost = () => {
    if (deletePost.isPending) return
    deletePost.mutate(postId, { onSuccess: () => router.push('/community') })
  }

  return {
    router,
    post,
    isPending,
    isError,
    refetch: postQuery.refetch,
    isOwner,
    toggleLike,
    isLikePending,
    toggleBookmark,
    isBookmarkPending,
    confirmDeletePost,
    setConfirmDeletePost,
    handleDeletePost,
    isDeletePending: deletePost.isPending,
  }
}

export { usePostDetail }
