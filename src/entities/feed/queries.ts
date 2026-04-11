import { createInfiniteQuery, createQuery, STALE_TIME } from '@/shared/api'
import { getFeedVideos, getVideoComments, searchTags } from './api'

export const feedQueries = {
  all: () => ['feed'] as const,

  videos: (sortBy: 'latest' | 'popular' | 'trending' = 'latest', tags?: string, limit = 10) =>
    createInfiniteQuery({
      queryKey: [...feedQueries.all(), 'videos', sortBy, tags, limit],
      queryFn: (page) => getFeedVideos(page, limit, sortBy, tags),
    }),

  comments: (videoId: string, limit = 20) =>
    createInfiniteQuery({
      queryKey: [...feedQueries.all(), 'comments', videoId, limit],
      queryFn: async (page) => {
        const result = await getVideoComments(videoId, page, limit)
        // createInfiniteQuery는 PaginationResponse 형식을 기대하므로 변환
        return {
          items: result.items,
          pagination: {
            currentPage: page,
            pageSize: limit,
            totalItems: result.totalCount,
            totalPages: Math.ceil(result.totalCount / limit),
            hasNextPage: result.hasNextPage,
            hasPrevPage: page > 1,
          },
        }
      },
      enabled: !!videoId,
      staleTime: STALE_TIME.REALTIME,
    }),

  tagSearch: (query: string) =>
    createQuery({
      queryKey: [...feedQueries.all(), 'tags', query],
      queryFn: () => searchTags(query),
      enabled: query.length > 0,
    }),
}
