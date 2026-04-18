import { apiClient, unwrap } from '@/shared/api'
import type { FeedVideo, FeedComment, PaginationResponse } from '@/shared/types'

/** 백엔드 원본 비디오 타입 */
interface BackendFeedVideo {
  videoId: string
  title: string
  thumbnailUrl: string
  duration: number
  viewCount: number
  likeCount?: number
  uploadedBy: {
    _id: string
    name: string
    profileImageFileName?: string
    businessName?: string
  }
  createdAt: string
}

/** 백엔드 댓글 타입 */
interface BackendComment {
  commentId: string
  content: string
  author: {
    _id: string
    name: string
    profileImageFileName?: string
    businessName?: string
  }
  parentId?: string
  likeCount: number
  replyCount: number
  createdAt: string
  isOwner: boolean
}

function transformVideo(v: BackendFeedVideo): FeedVideo {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'
  const hlsUrl = `${baseUrl}/api/feed/videos/stream/${v.videoId}/master.m3u8`
  return {
    _id: v.videoId,
    uploaderId: v.uploadedBy._id,
    uploaderName: v.uploadedBy.name || v.uploadedBy.businessName || 'Unknown',
    uploaderProfileImage: v.uploadedBy.profileImageFileName,
    title: v.title,
    description: '',
    videoUrl: hlsUrl,
    thumbnailUrl: v.thumbnailUrl ?? '',
    hlsUrl,
    duration: v.duration,
    viewCount: v.viewCount,
    likeCount: v.likeCount ?? 0,
    commentCount: 0,
    tags: [],
    createdAt: v.createdAt,
    updatedAt: v.createdAt,
    isLiked: false,
  }
}

function transformComment(c: BackendComment, videoId: string): FeedComment {
  return {
    _id: c.commentId,
    commentId: c.commentId,
    videoId,
    userId: c.author._id,
    userName: c.author.name || c.author.businessName || 'Unknown',
    userProfileImage: c.author.profileImageFileName,
    content: c.content,
    likeCount: c.likeCount,
    replyCount: c.replyCount,
    isOwner: c.isOwner,
    createdAt: c.createdAt,
  }
}

/** 피드 비디오 목록 조회 */
export const getFeedVideos = async (
  page = 1,
  limit = 10,
  sortBy: 'latest' | 'popular' | 'trending' = 'latest',
  tags?: string,
): Promise<PaginationResponse<FeedVideo>> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy })
  if (tags) params.append('tags', tags)

  const response = await apiClient.get<{
    items: BackendFeedVideo[]
    pagination: PaginationResponse<FeedVideo>['pagination']
  }>(`/api/feed/videos?${params.toString()}`)

  return {
    items: response.data.items.map(transformVideo),
    pagination: response.data.pagination,
  }
}

/** 비디오 좋아요 토글 */
export const toggleVideoLike = (videoId: string) =>
  apiClient
    .post<{
      success: boolean
      data: { videoId: string; isLiked: boolean; likeCount: number }
    }>(`/api/feed/like/${videoId}`)
    .then((res) => unwrap(res, '좋아요 처리에 실패했습니다.'))

/** 비디오 댓글 목록 조회 */
export const getVideoComments = async (
  videoId: string,
  page = 1,
  limit = 20,
): Promise<{ items: FeedComment[]; totalCount: number; hasNextPage: boolean }> => {
  const response = await apiClient.get<{
    success: boolean
    data: { comments: BackendComment[]; totalCount: number; hasNextPage: boolean }
  }>(`/api/feed/comment/${videoId}?page=${page}&limit=${limit}`)

  const data = unwrap(response, '댓글 목록 조회에 실패했습니다.')
  return {
    items: data.comments.map((c) => transformComment(c, videoId)),
    totalCount: data.totalCount,
    hasNextPage: data.hasNextPage,
  }
}

/** 댓글 작성 */
export const createVideoComment = (videoId: string, content: string) =>
  apiClient.post(`/api/feed/comment/${videoId}`, { content }).then((res) => res.data)

/** 태그 검색 */
export const searchTags = (query: string) =>
  apiClient
    .get<{
      success: boolean
      data: { tags: string[] }
    }>(`/api/feed/tag/search?q=${encodeURIComponent(query)}`)
    .then((res) => unwrap(res, '태그 검색에 실패했습니다.').tags)

/** HLS 스트리밍 URL 생성 */
export const getHlsStreamUrl = (videoId: string, filename: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'
  return `${baseUrl}/api/feed/videos/stream/${videoId}/${filename}`
}
