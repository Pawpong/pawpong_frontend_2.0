import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import { parseCommunityPostReview } from '../model/communityReview'
import type {
  ApiResponseFull,
  PaginationResponse,
  CommunityPostCard,
  CommunityPostDetail,
  CommunityPostListParams,
  CommunityComment,
  CommunityBookmarkListParams,
  CommunityAuthorModel,
  CommunityPetType,
  CommunityPostVisibility,
  CommunityPostStatus,
  CommunityHallOfFame,
} from '@/shared/types'

/**
 * 백엔드는 작성자를 nested `author: { userId, nickname, profileImageUrl }` 로 내려주지만,
 * 프론트 컴포넌트/타입은 flat(`authorId`/`authorNickname`/`authorProfileImageUrl`) 을 쓴다.
 * API 경계에서 raw 응답을 flat 뷰 모델로 변환한다.
 */
interface RawAuthor {
  userId: string
  nickname: string
  profileImageUrl?: string
}

interface RawCommunityPostCard {
  aiReview?: unknown
  experience?: import('@/shared/types').CommunityExperience | null
  postId: string
  author: RawAuthor
  authorModel: CommunityAuthorModel
  title?: string
  bodyExcerpt: string
  primaryPhotoUrl?: string
  photoUrls: string[]
  aiComparison?: import('@/shared/types').CommunityAiComparison | null
  petType?: CommunityPetType
  category?: string
  visibility: CommunityPostVisibility
  status: CommunityPostStatus
  likeCount: number
  commentCount: number
  saveCount: number
  isLiked: boolean
  isSaved: boolean
  isFollowingAuthor?: boolean
  createdAt: string
  commentPreview?: RawCommunityComment[]
}

interface RawCommunityComment {
  commentId: string
  postId: string
  author: RawAuthor
  authorModel: CommunityAuthorModel
  parentCommentId: string | null
  body: string
  likeCount: number
  createdAt: string
}

export interface RawCommunityPostDetail {
  aiReview?: unknown
  experience?: import('@/shared/types').CommunityExperience | null
  postId: string
  author: RawAuthor
  authorModel: CommunityAuthorModel
  title?: string
  body: string
  photoUrls: string[]
  aiComparison?: import('@/shared/types').CommunityAiComparison | null
  petType?: CommunityPetType
  category?: string
  visibility: CommunityPostVisibility
  status: CommunityPostStatus
  likeCount: number
  commentCount: number
  saveCount: number
  viewCount: number
  createdAt: string
  commentPreview: RawCommunityComment[]
  isLiked: boolean
  isSaved: boolean
}

const flattenAuthor = (author: RawAuthor) => ({
  authorId: author.userId,
  authorNickname: author.nickname,
  authorProfileImageUrl: author.profileImageUrl,
})

const mapCard = (raw: RawCommunityPostCard): CommunityPostCard => ({
  ...(raw.aiReview !== undefined ? { aiReview: parseCommunityPostReview(raw.aiReview) } : {}),
  ...(raw.experience ? { experience: raw.experience } : {}),
  postId: raw.postId,
  ...flattenAuthor(raw.author),
  authorModel: raw.authorModel,
  title: raw.title,
  bodyExcerpt: raw.bodyExcerpt,
  primaryPhotoUrl: raw.primaryPhotoUrl,
  photoUrls: raw.photoUrls,
  aiComparison: raw.aiComparison,
  petType: raw.petType,
  category: raw.category,
  visibility: raw.visibility,
  status: raw.status,
  likeCount: raw.likeCount,
  commentCount: raw.commentCount,
  saveCount: raw.saveCount,
  isLiked: raw.isLiked,
  isSaved: raw.isSaved,
  isFollowingAuthor: raw.isFollowingAuthor,
  createdAt: raw.createdAt,
  commentPreview: raw.commentPreview?.map(mapComment),
})

const mapComment = (raw: RawCommunityComment): CommunityComment => ({
  commentId: raw.commentId,
  postId: raw.postId,
  ...flattenAuthor(raw.author),
  authorModel: raw.authorModel,
  parentCommentId: raw.parentCommentId,
  body: raw.body,
  likeCount: raw.likeCount,
  createdAt: raw.createdAt,
})

export const mapCommunityPostDetail = (raw: RawCommunityPostDetail): CommunityPostDetail => ({
  ...(raw.aiReview !== undefined ? { aiReview: parseCommunityPostReview(raw.aiReview) } : {}),
  ...(raw.experience ? { experience: raw.experience } : {}),
  postId: raw.postId,
  ...flattenAuthor(raw.author),
  authorModel: raw.authorModel,
  title: raw.title,
  body: raw.body,
  photoUrls: raw.photoUrls,
  aiComparison: raw.aiComparison,
  petType: raw.petType,
  category: raw.category,
  visibility: raw.visibility,
  status: raw.status,
  likeCount: raw.likeCount,
  commentCount: raw.commentCount,
  saveCount: raw.saveCount,
  viewCount: raw.viewCount,
  createdAt: raw.createdAt,
  commentPreview: raw.commentPreview.map(mapComment),
  isLiked: raw.isLiked,
  isSaved: raw.isSaved,
})

/** 커뮤니티 게시글 목록 조회 */
export const getCommunityPosts = async (
  params: CommunityPostListParams = {},
): Promise<PaginationResponse<CommunityPostCard>> => {
  const query = new URLSearchParams()
  if (params.petType) query.set('petType', params.petType)
  if (params.topic) query.set('topic', params.topic)
  if (params.topics?.length) query.set('topics', params.topics.join(','))
  if (params.topicMatch) query.set('topicMatch', params.topicMatch)
  if (params.tags?.length) query.set('tags', params.tags.join(','))
  if (params.kind) query.set('kind', params.kind)
  if (params.media) query.set('media', params.media)
  if (params.period) query.set('period', params.period)
  if (params.record) query.set('record', params.record)
  if (params.category) query.set('category', params.category)
  if (params.authorId) query.set('authorId', params.authorId)
  if (params.search) query.set('search', params.search)
  if (params.sort) query.set('sort', params.sort)
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<RawCommunityPostCard>>>(
    `${API_VERSION}/community/posts?${query.toString()}`,
  )

  const page = unwrap(response, '커뮤니티 게시글 목록 조회에 실패했습니다.')
  return { ...page, items: page.items.map(mapCard) }
}

/**
 * 함께 읽을 글 — 서버가 공통 태그·주제·동물 종류로 고른다.
 * 열람자가 볼 수 없는 글은 서버에서 빠지므로 여기서 다시 거르지 않는다.
 */
export const getRelatedCommunityPosts = async (
  postId: string,
  pageSize = 6,
  signal?: AbortSignal,
): Promise<PaginationResponse<CommunityPostCard>> => {
  const response = await apiClient.get<ApiResponseFull<PaginationResponse<RawCommunityPostCard>>>(
    `${API_VERSION}/community/posts/${postId}/related?page=1&pageSize=${pageSize}`,
    { signal },
  )
  const page = unwrap(response, '함께 읽을 글을 불러오지 못했습니다.')
  return { ...page, items: page.items.map(mapCard) }
}

/** 커뮤니티 게시글 상세 조회 */
export const getCommunityPostDetail = async (postId: string): Promise<CommunityPostDetail> => {
  const response = await apiClient.get<ApiResponseFull<RawCommunityPostDetail>>(
    `${API_VERSION}/community/posts/${postId}`,
  )
  return mapCommunityPostDetail(unwrap(response, '커뮤니티 게시글 조회에 실패했습니다.'))
}

/** 내가 저장한 게시글 목록 조회 */
export const getMyBookmarkedPosts = async (
  params: CommunityBookmarkListParams = {},
): Promise<PaginationResponse<CommunityPostCard>> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<RawCommunityPostCard>>>(
    `${API_VERSION}/community/posts/me/bookmarks?${query.toString()}`,
  )
  const page = unwrap(response, '저장한 게시글 목록 조회에 실패했습니다.')
  // 저장 목록 응답의 isSaved가 false로 내려와도 이 엔드포인트 결과는 전부 내가 저장한 글이다.
  return { ...page, items: page.items.map((raw) => ({ ...mapCard(raw), isSaved: true })) }
}

const getMyActivityPosts = async (
  path: 'liked' | 'commented',
  params: CommunityBookmarkListParams,
  errorMessage: string,
): Promise<PaginationResponse<CommunityPostCard>> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<RawCommunityPostCard>>>(
    `${API_VERSION}/community/posts/me/${path}?${query.toString()}`,
  )
  const page = unwrap(response, errorMessage)
  return { ...page, items: page.items.map(mapCard) }
}

/** 내가 좋아요한 게시글 목록 — 좋아요한 시각 최신순 */
export const getMyLikedPosts = (params: CommunityBookmarkListParams = {}) =>
  getMyActivityPosts('liked', params, '좋아요한 게시글 목록 조회에 실패했습니다.')

/** 내가 댓글 단 게시글 목록 — 글당 한 번, 최근 댓글 순 */
export const getMyCommentedPosts = (params: CommunityBookmarkListParams = {}) =>
  getMyActivityPosts('commented', params, '댓글 단 게시글 목록 조회에 실패했습니다.')

/** 내가 임시저장(draft) 한 게시글 목록 — 본인에게만 노출, 최신순 */
export const getMyDraftPosts = async (
  params: CommunityBookmarkListParams = {},
): Promise<PaginationResponse<CommunityPostCard>> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<RawCommunityPostCard>>>(
    `${API_VERSION}/community/posts/me/drafts?${query.toString()}`,
  )
  const page = unwrap(response, '임시저장 게시글 목록 조회에 실패했습니다.')
  return { ...page, items: page.items.map(mapCard) }
}

/** 커뮤니티 게시글 댓글 목록 조회 (페이지네이션) */
export const getCommunityComments = async (
  postId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginationResponse<CommunityComment>> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<RawCommunityComment>>>(
    `${API_VERSION}/community/posts/${postId}/comments?${query.toString()}`,
  )

  const page = unwrap(response, '댓글 목록 조회에 실패했습니다.')
  return { ...page, items: page.items.map(mapComment) }
}

/** 명예의 전당 현재 회차 */
export const getCurrentCommunityHallOfFame = async (): Promise<CommunityHallOfFame> => {
  const response = await apiClient.get<ApiResponseFull<CommunityHallOfFame>>(
    `${API_VERSION}/community/hall-of-fame/current`,
  )
  return unwrap(response, '명예의 전당 조회에 실패했습니다.')
}

/** 명예의 전당 지난 회차 목록 (확정분만, 최신순) */
export const getCommunityHallOfFameHistory = async (
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginationResponse<CommunityHallOfFame>> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<CommunityHallOfFame>>>(
    `${API_VERSION}/community/hall-of-fame?${query.toString()}`,
  )
  return unwrap(response, '지난 명예의 전당 조회에 실패했습니다.')
}
