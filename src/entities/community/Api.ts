import { apiClient, API_VERSION, unwrap, unwrapVoid } from '@/shared/api'
import type {
  ApiResponseFull,
  PaginationResponse,
  CommunityPostCard,
  CommunityPostDetail,
  CommunityPostListParams,
  CommunityComment,
  CreateCommunityPostRequest,
  UpdateCommunityPostRequest,
  CommunityPostDeleteResponse,
  CommunityBookmarkResponse,
  CommunityUnsaveResponse,
  CommunityBookmarkListParams,
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

/** 게시글 작성 */
export const createCommunityPost = async (
  data: CreateCommunityPostRequest,
): Promise<CommunityPostDetail> => {
  const response = await apiClient.post<ApiResponseFull<CommunityPostDetail>>(
    `${API_VERSION}/community/posts`,
    data,
  )
  return unwrap(response, '게시글 작성에 실패했습니다.')
}

/** 게시글 수정 */
export const updateCommunityPost = async (
  postId: string,
  data: UpdateCommunityPostRequest,
): Promise<CommunityPostDetail> => {
  const response = await apiClient.patch<ApiResponseFull<CommunityPostDetail>>(
    `${API_VERSION}/community/posts/${postId}`,
    data,
  )
  return unwrap(response, '게시글 수정에 실패했습니다.')
}

/** 게시글 삭제 (소프트) */
export const deleteCommunityPost = async (postId: string): Promise<CommunityPostDeleteResponse> => {
  const response = await apiClient.delete<ApiResponseFull<CommunityPostDeleteResponse>>(
    `${API_VERSION}/community/posts/${postId}`,
  )
  return unwrap(response, '게시글 삭제에 실패했습니다.')
}

/** 게시글 북마크 */
export const bookmarkCommunityPost = async (
  postId: string,
): Promise<CommunityBookmarkResponse> => {
  const response = await apiClient.post<ApiResponseFull<CommunityBookmarkResponse>>(
    `${API_VERSION}/community/posts/${postId}/bookmark`,
  )
  return unwrap(response, '북마크 처리에 실패했습니다.')
}

/** 게시글 북마크 취소 */
export const unbookmarkCommunityPost = async (
  postId: string,
): Promise<CommunityUnsaveResponse> => {
  const response = await apiClient.delete<ApiResponseFull<CommunityUnsaveResponse>>(
    `${API_VERSION}/community/posts/${postId}/bookmark`,
  )
  return unwrap(response, '북마크 취소에 실패했습니다.')
}

/** 내가 저장한 게시글 목록 조회 */
export const getMyBookmarkedPosts = async (
  params: CommunityBookmarkListParams = {},
): Promise<PaginationResponse<CommunityPostCard>> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<CommunityPostCard>>>(
    `${API_VERSION}/community/posts/me/bookmarks?${query.toString()}`,
  )
  return unwrap(response, '저장한 게시글 목록 조회에 실패했습니다.')
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
