import { apiClient, API_VERSION, unwrap } from '@/shared/api'
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
  postId: string
  author: RawAuthor
  authorModel: CommunityAuthorModel
  title?: string
  bodyExcerpt: string
  primaryPhotoUrl?: string
  photoUrls: string[]
  petType?: CommunityPetType
  category?: string
  visibility: CommunityPostVisibility
  status: CommunityPostStatus
  likeCount: number
  commentCount: number
  saveCount: number
  isLiked: boolean
  isSaved: boolean
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

interface RawCommunityPostDetail {
  postId: string
  author: RawAuthor
  authorModel: CommunityAuthorModel
  title?: string
  body: string
  photoUrls: string[]
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
  postId: raw.postId,
  ...flattenAuthor(raw.author),
  authorModel: raw.authorModel,
  title: raw.title,
  bodyExcerpt: raw.bodyExcerpt,
  primaryPhotoUrl: raw.primaryPhotoUrl,
  photoUrls: raw.photoUrls,
  petType: raw.petType,
  category: raw.category,
  visibility: raw.visibility,
  status: raw.status,
  likeCount: raw.likeCount,
  commentCount: raw.commentCount,
  saveCount: raw.saveCount,
  isLiked: raw.isLiked,
  isSaved: raw.isSaved,
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

const mapDetail = (raw: RawCommunityPostDetail): CommunityPostDetail => ({
  postId: raw.postId,
  ...flattenAuthor(raw.author),
  authorModel: raw.authorModel,
  title: raw.title,
  body: raw.body,
  photoUrls: raw.photoUrls,
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
  if (params.category) query.set('category', params.category)
  if (params.authorId) query.set('authorId', params.authorId)
  if (params.sort) query.set('sort', params.sort)
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<RawCommunityPostCard>>>(
    `${API_VERSION}/community/posts?${query.toString()}`,
  )

  const page = unwrap(response, '커뮤니티 게시글 목록 조회에 실패했습니다.')
  return { ...page, items: page.items.map(mapCard) }
}

/** 커뮤니티 게시글 상세 조회 */
export const getCommunityPostDetail = async (postId: string): Promise<CommunityPostDetail> => {
  const response = await apiClient.get<ApiResponseFull<RawCommunityPostDetail>>(
    `${API_VERSION}/community/posts/${postId}`,
  )
  return mapDetail(unwrap(response, '커뮤니티 게시글 조회에 실패했습니다.'))
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
