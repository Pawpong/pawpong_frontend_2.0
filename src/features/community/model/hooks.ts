'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community/Queries'
import {
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  bookmarkCommunityPost,
  unbookmarkCommunityPost,
} from '@/entities/community/Api'
import type { CreateCommunityPostRequest, UpdateCommunityPostRequest } from '@/shared/types'

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
