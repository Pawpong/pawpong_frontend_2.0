'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import type {
  CreateCommunityPostRequest,
  UpdateCommunityPostRequest,
  UpdateCommunityCommentRequest,
} from '@/shared/types'
import {
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  updateCommunityComment,
  deleteCommunityComment,
  bookmarkCommunityPost,
  unbookmarkCommunityPost,
} from './community.api'

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
