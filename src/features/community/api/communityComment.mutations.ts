'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateCommunityCommentRequest, UpdateCommunityCommentRequest } from '@/shared/types'
import {
  createCommunityComment,
  updateCommunityComment,
  deleteCommunityComment,
} from './community.api'
import { invalidateCommunityPostSurface } from './community.cache'

/** 댓글 작성 (parentCommentId 있으면 답글) — 목록 카드의 commentCount·commentPreview까지 갱신 */
export const useCreateCommunityComment = (postId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCommunityCommentRequest) => createCommunityComment(postId, data),
    onSuccess: () => invalidateCommunityPostSurface(qc, postId),
  })
}

export const useUpdateCommunityComment = (commentId: string, postId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCommunityCommentRequest) => updateCommunityComment(commentId, data),
    onSuccess: () => invalidateCommunityPostSurface(qc, postId),
  })
}

export const useDeleteCommunityComment = (postId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => deleteCommunityComment(commentId),
    onSuccess: () => invalidateCommunityPostSurface(qc, postId),
  })
}
