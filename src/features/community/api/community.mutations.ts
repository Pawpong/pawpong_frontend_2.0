'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import type {
  CreateCommunityPostRequest,
  UpdateCommunityPostRequest,
  CreateCommunityCommentRequest,
  UpdateCommunityCommentRequest,
  CommunityPostDetail,
} from '@/shared/types'
import {
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  likeCommunityPost,
  unlikeCommunityPost,
  createCommunityComment,
  updateCommunityComment,
  deleteCommunityComment,
  bookmarkCommunityPost,
  unbookmarkCommunityPost,
} from './community.api'

/**
 * 게시글 좋아요 토글 — 상세 캐시를 낙관적으로 갱신(즉시 반응), 실패 시 롤백.
 * mutate 인자는 "토글 직전의 isLiked" 값.
 */
export const useToggleCommunityPostLike = (postId: string) => {
  const qc = useQueryClient()
  const detailKey = communityQueries.detail(postId).queryKey
  return useMutation({
    mutationFn: (isLiked: boolean) =>
      isLiked ? unlikeCommunityPost(postId) : likeCommunityPost(postId),
    onMutate: async (isLiked: boolean) => {
      await qc.cancelQueries({ queryKey: detailKey })
      const prev = qc.getQueryData<CommunityPostDetail>(detailKey)
      if (prev) {
        qc.setQueryData<CommunityPostDetail>(detailKey, {
          ...prev,
          isLiked: !isLiked,
          likeCount: Math.max(0, prev.likeCount + (isLiked ? -1 : 1)),
        })
      }
      return { prev }
    },
    onError: (_err, _isLiked, ctx) => {
      if (ctx?.prev) qc.setQueryData(detailKey, ctx.prev)
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: detailKey })
      void qc.invalidateQueries({ queryKey: [...communityQueries.all(), 'posts'] })
    },
  })
}

/** 댓글 작성 (parentCommentId 있으면 답글) — 댓글 목록 + 상세(댓글 수) 갱신 */
export const useCreateCommunityComment = (postId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCommunityCommentRequest) => createCommunityComment(postId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...communityQueries.all(), 'comments', postId] })
      void qc.invalidateQueries({ queryKey: communityQueries.detail(postId).queryKey })
    },
  })
}

export const useCreateCommunityPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCommunityPostRequest) => createCommunityPost(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
    },
  })
}

export const useUpdateCommunityPost = (postId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCommunityPostRequest) => updateCommunityPost(postId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
    },
  })
}

export const useDeleteCommunityPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => deleteCommunityPost(postId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
    },
  })
}

export const useUpdateCommunityComment = (commentId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCommunityCommentRequest) => updateCommunityComment(commentId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
    },
  })
}

export const useDeleteCommunityComment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => deleteCommunityComment(commentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
    },
  })
}

export const useBookmarkCommunityPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => bookmarkCommunityPost(postId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
    },
  })
}

export const useUnbookmarkCommunityPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => unbookmarkCommunityPost(postId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
    },
  })
}
