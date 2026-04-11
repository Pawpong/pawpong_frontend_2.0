'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feedQueries } from './queries'
import { toggleVideoLike, createVideoComment } from './api'

export const useFeedVideos = (
  sortBy: 'latest' | 'popular' | 'trending' = 'latest',
  tags?: string,
  limit?: number,
) => useInfiniteQuery(feedQueries.videos(sortBy, tags, limit))

export const useVideoComments = (videoId: string, limit?: number) =>
  useInfiniteQuery(feedQueries.comments(videoId, limit))

export const useTagSearch = (query: string) => useQuery(feedQueries.tagSearch(query))

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
