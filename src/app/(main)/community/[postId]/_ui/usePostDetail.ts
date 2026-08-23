'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
import {
  useToggleCommunityPostLike,
  useToggleCommunityPostBookmark,
  useDeleteCommunityPost,
} from '@/features/community'
import { useAuthStatus } from '@/features/auth'
import { getMockPostDetail } from '../../_ui/mockFeed'

/**
 * 최은진: 신규 파일 — PostDetailContent에서 데이터 조회/액션 로직을 분리해서 만든 훅.
 * 게시글 상세에 필요한 데이터·액션 전부 — 풀페이지(PostDetailContent)와
 * 모달(PostDetailModalBody)이 같은 로직을 각자 다른 레이아웃으로 그린다.
 */
const usePostDetail = (postId: string) => {
  const router = useRouter()
  const { isLoggedIn } = useAuthStatus()
  const { data: fetchedPost } = useQuery(communityQueries.detail(postId))
  // 백엔드 없이 로컬 피드(mockFeed)만 있는 개발 환경에서, mock-* 글을 눌러도 상세가 비어 보이지 않도록 폴백.
  // postId가 'mock-'로 시작하는 글에만 적용되므로 실제 게시글에는 영향이 없다.
  const post = fetchedPost ?? (postId.startsWith('mock-') ? getMockPostDetail(postId) : undefined)
  // 공개 상세라 비로그인 조회도 가능 — 로그인 상태에서만 내 프로필을 조회(비로그인 401 리다이렉트 방지)
  const { data: me } = useQuery({ ...profileQueries.me(), enabled: isLoggedIn })

  // [refactored] 훅 반환값을 구조분해 — 호출부에서 toggleLike.toggleLike 처럼 겹쳐 쓰지 않게
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
