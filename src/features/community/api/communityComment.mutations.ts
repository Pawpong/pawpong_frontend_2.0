'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuthReadSession, type AuthReadSession } from '@/shared/api'
import type { CreateCommunityCommentRequest, UpdateCommunityCommentRequest } from '@/shared/types'
import {
  createCommunityComment,
  updateCommunityComment,
  deleteCommunityComment,
} from './community.api'
import { invalidateCommunityPostSurface } from './community.cache'

/** 댓글 작성 (parentCommentId 있으면 답글) — 목록 카드의 commentCount·commentPreview까지 갱신 */
export const useCreateCommunityComment = (
  postId: string,
  session: AuthReadSession | null = getAuthReadSession(),
) => {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['community-comment-create', postId, session?.scope ?? 'guest'],
    mutationFn: (data: CreateCommunityCommentRequest) =>
      createCommunityComment(postId, data, session),
    // 저장 응답 후 작성 상태를 끝낸다. 목록 갱신 지연을 댓글 저장 지연처럼 보이지 않게 한다.
    onSuccess: () => {
      void invalidateCommunityPostSurface(qc, postId)
    },
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
