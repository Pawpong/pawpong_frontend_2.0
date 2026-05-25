import { apiClient, API_VERSION, unwrap, unwrapVoid } from '@/shared/api'
import type {
  ApiResponseFull,
  PaginationResponse,
  CommunityPostCard,
  CommunityPostDetail,
  CommunityPostListParams,
  CommunityComment,
} from '@/shared/types'

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

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<CommunityPostCard>>>(
    `${API_VERSION}/community/posts?${query.toString()}`,
  )

  return unwrap(response, '커뮤니티 게시글 목록 조회에 실패했습니다.')
}

/** 커뮤니티 게시글 상세 조회 */
export const getCommunityPostDetail = async (postId: string): Promise<CommunityPostDetail> => {
  const response = await apiClient.get<ApiResponseFull<CommunityPostDetail>>(
    `${API_VERSION}/community/posts/${postId}`,
  )
  return unwrap(response, '커뮤니티 게시글 조회에 실패했습니다.')
}

/** 게시글 좋아요 */
export const likeCommunityPost = async (postId: string): Promise<void> => {
  const response = await apiClient.post(`${API_VERSION}/community/posts/${postId}/like`)
  unwrapVoid(response, '좋아요 처리에 실패했습니다.')
}

/** 게시글 좋아요 취소 */
export const unlikeCommunityPost = async (postId: string): Promise<void> => {
  const response = await apiClient.delete(`${API_VERSION}/community/posts/${postId}/like`)
  unwrapVoid(response, '좋아요 취소에 실패했습니다.')
}

/** 게시글 북마크 */
export const bookmarkCommunityPost = async (postId: string): Promise<void> => {
  const response = await apiClient.post(`${API_VERSION}/community/posts/${postId}/bookmark`)
  unwrapVoid(response, '북마크 처리에 실패했습니다.')
}

/** 게시글 북마크 취소 */
export const unbookmarkCommunityPost = async (postId: string): Promise<void> => {
  const response = await apiClient.delete(`${API_VERSION}/community/posts/${postId}/bookmark`)
  unwrapVoid(response, '북마크 취소에 실패했습니다.')
}

/** 커뮤니티 게시글 댓글 목록 조회 (페이지네이션) */
export const getCommunityComments = async (
  postId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginationResponse<CommunityComment>> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<CommunityComment>>>(
    `${API_VERSION}/community/posts/${postId}/comments?${query.toString()}`,
  )

  return unwrap(response, '댓글 목록 조회에 실패했습니다.')
}
