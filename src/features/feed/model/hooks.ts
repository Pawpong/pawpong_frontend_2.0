'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { feedQueries } from '@/entities/feed/Queries'
import { toggleVideoLike, createVideoComment } from '@/entities/feed/Api'

export const useToggleVideoLike = (videoId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => toggleVideoLike(videoId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: feedQueries.all() })
    },
  })
}

export const useCreateVideoComment = (videoId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => createVideoComment(videoId, content),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: feedQueries.comments(videoId).queryKey })
    },
  })
}
