/**
 * 피드(영상) 관련 타입 정의
 * 출처: feed.ts
 */

import type { ApiResponseFull, PaginatedApiResponse } from './api.types'

export interface FeedVideo {
  _id: string
  uploaderId: string
  uploaderName: string
  uploaderProfileImage?: string
  title: string
  description?: string
  videoUrl: string
  thumbnailUrl?: string
  hlsUrl?: string
  duration: number
  viewCount: number
  likeCount: number
  commentCount: number
  tags: string[]
  createdAt: string
  updatedAt: string
  isLiked?: boolean
}

export interface FeedComment {
  _id: string
  commentId: string
  videoId: string
  userId: string
  userName: string
  userProfileImage?: string
  content: string
  likeCount: number
  replyCount: number
  isOwner: boolean
  createdAt: string
  updatedAt?: string
}

export type FeedVideosResponse = PaginatedApiResponse<FeedVideo>

export interface LikeData {
  videoId: string
  isLiked: boolean
  likeCount: number
}
export type LikeResponse = ApiResponseFull<LikeData>

export interface TagSearchData {
  tags: string[]
}
export type TagSearchResponse = ApiResponseFull<TagSearchData>
