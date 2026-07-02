import { apiClient, API_VERSION, unwrap, unwrapVoid } from '@/shared/api'
import type {
  ApiResponseFull,
  CommunityPostDetail,
  CreateCommunityPostRequest,
  UpdateCommunityPostRequest,
  CreateCommunityCommentRequest,
  UpdateCommunityCommentRequest,
  CommunityPostDeleteResponse,
  CommunityBookmarkResponse,
  CommunityUnsaveResponse,
} from '@/shared/types'

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

/** 댓글 작성 (parentCommentId 있으면 답글) */
export const createCommunityComment = async (
  postId: string,
  data: CreateCommunityCommentRequest,
): Promise<{ commentId: string }> => {
  const response = await apiClient.post<ApiResponseFull<{ commentId: string }>>(
    `${API_VERSION}/community/posts/${postId}/comments`,
    data,
  )
  return unwrap(response, '댓글 작성에 실패했습니다.')
}

/** 댓글 수정 */
export const updateCommunityComment = async (
  commentId: string,
  data: UpdateCommunityCommentRequest,
): Promise<void> => {
  const response = await apiClient.patch(`${API_VERSION}/community/comments/${commentId}`, data)
  unwrapVoid(response, '댓글 수정에 실패했습니다.')
}

/** 댓글 삭제 */
export const deleteCommunityComment = async (commentId: string): Promise<void> => {
  const response = await apiClient.delete(`${API_VERSION}/community/comments/${commentId}`)
  unwrapVoid(response, '댓글 삭제에 실패했습니다.')
}

/** 게시글 북마크 */
export const bookmarkCommunityPost = async (postId: string): Promise<CommunityBookmarkResponse> => {
  const response = await apiClient.post<ApiResponseFull<CommunityBookmarkResponse>>(
    `${API_VERSION}/community/posts/${postId}/bookmark`,
  )
  return unwrap(response, '북마크 처리에 실패했습니다.')
}

/** 게시글 북마크 취소 */
export const unbookmarkCommunityPost = async (postId: string): Promise<CommunityUnsaveResponse> => {
  const response = await apiClient.delete<ApiResponseFull<CommunityUnsaveResponse>>(
    `${API_VERSION}/community/posts/${postId}/bookmark`,
  )
  return unwrap(response, '북마크 취소에 실패했습니다.')
}
