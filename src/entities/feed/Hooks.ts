'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { feedQueries } from './Queries'

export const useFeedVideos = (
  sortBy: 'latest' | 'popular' | 'trending' = 'latest',
  tags?: string,
  limit?: number,
) => useInfiniteQuery(feedQueries.videos(sortBy, tags, limit))

export const useVideoComments = (videoId: string, limit?: number) =>
  useInfiniteQuery(feedQueries.comments(videoId, limit))

export const useTagSearch = (query: string) => useQuery(feedQueries.tagSearch(query))
