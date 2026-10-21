'use client'

import { isCommunityPostHeld } from '@/entities/community'
import { trackAction } from '@/shared/lib/analyticsEvents'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CommunityPostReportRequest,
  CreateCommunityPostRequest,
  UpdateCommunityPostRequest,
} from '@/shared/types'
import {
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  reportCommunityPost,
} from './community.api'
import {
  invalidateCommunityPostData,
  invalidateCommunityPostLists,
  invalidateDeletedCommunityPost,
} from './community.cache'

export const useCreateCommunityPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCommunityPostRequest) => createCommunityPost(data),
    onSuccess: (post) => {
      if (post.status === 'published' && post.visibility === 'public' && !isCommunityPostHeld(post))
        trackAction('pawpong_post_publish', 'community')
      return invalidateCommunityPostLists(qc)
    },
  })
}

export const useUpdateCommunityPost = (postId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCommunityPostRequest) => updateCommunityPost(postId, data),
    onSuccess: () => invalidateCommunityPostData(qc, postId),
  })
}

export const useDeleteCommunityPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => deleteCommunityPost(postId),
    onSuccess: (_data, postId) => invalidateDeletedCommunityPost(qc, postId),
  })
}

export const useReportCommunityPost = (postId: string) =>
  useMutation({
    mutationFn: (data: CommunityPostReportRequest) => reportCommunityPost(postId, data),
  })
