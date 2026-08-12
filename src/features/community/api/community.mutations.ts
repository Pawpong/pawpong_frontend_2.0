'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import type { CreateCommunityPostRequest, UpdateCommunityPostRequest } from '@/shared/types'
import { createCommunityPost, updateCommunityPost, deleteCommunityPost } from './community.api'

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
