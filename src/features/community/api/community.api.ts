import {
  apiClient,
  API_VERSION,
  unwrap,
  unwrapVoid,
  withAuthWriteSession,
  getAuthReadSession,
  type AuthReadSession,
} from '@/shared/api'
import { mapCommunityPostDetail, type RawCommunityPostDetail } from '@/entities/community'
import {
  captureCommunityWriteSession,
  communityWriteRequestOptions,
} from '../lib/communityWriteSession'
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
  CommunityPostReportRequest,
  CommunityPostReportResponse,
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
  signal?: AbortSignal,
): Promise<CommunityPostDetail> => {
  const assertCurrent = captureCommunityWriteSession(signal)
  const response = await apiClient.post<ApiResponseFull<RawCommunityPostDetail>>(
    `${API_VERSION}/community/posts`,
    data,
    communityWriteRequestOptions(signal, data.aiReviewConsent !== undefined),
  )
  assertCurrent()
  return mapCommunityPostDetail(unwrap(response, '게시글 작성에 실패했습니다.'))
}

/** 게시글 수정 */
export const updateCommunityPost = async (
  postId: string,
  data: UpdateCommunityPostRequest,
  signal?: AbortSignal,
): Promise<CommunityPostDetail> => {
  const assertCurrent = captureCommunityWriteSession(signal)
  const response = await apiClient.patch<ApiResponseFull<RawCommunityPostDetail>>(
    `${API_VERSION}/community/posts/${postId}`,
    data,
    communityWriteRequestOptions(signal, data.aiReviewConsent !== undefined),
  )
  assertCurrent()
  return mapCommunityPostDetail(unwrap(response, '게시글 수정에 실패했습니다.'))
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
  session: AuthReadSession | null = getAuthReadSession(),
): Promise<{ commentId: string }> => {
  return withAuthWriteSession(async (config) => {
    const response = await apiClient.post<ApiResponseFull<{ commentId: string }>>(
      `${API_VERSION}/community/posts/${postId}/comments`,
      data,
      { ...config, timeout: 15_000 },
    )
    return unwrap(response, '댓글 작성에 실패했습니다.')
  }, session)
}

/** 댓글 수정 */
export const updateCommunityComment = async (
  commentId: string,
  data: UpdateCommunityCommentRequest,
  session: AuthReadSession | null = getAuthReadSession(),
): Promise<void> => {
  return withAuthWriteSession(async (config) => {
    const response = await apiClient.patch(`${API_VERSION}/community/comments/${commentId}`, data, {
      ...config,
      timeout: 15_000,
    })
    unwrapVoid(response, '댓글 수정에 실패했습니다.')
  }, session)
}

/** 댓글 삭제 */
export const deleteCommunityComment = async (
  commentId: string,
  session: AuthReadSession | null = getAuthReadSession(),
): Promise<void> => {
  return withAuthWriteSession(async (config) => {
    const response = await apiClient.delete(`${API_VERSION}/community/comments/${commentId}`, {
      ...config,
      timeout: 15_000,
    })
    unwrapVoid(response, '댓글 삭제에 실패했습니다.')
  }, session)
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

/** 남의 게시글 신고 — 동일 사용자의 중복 신고는 reported=false로 반환된다. */
export const reportCommunityPost = async (
  postId: string,
  data: CommunityPostReportRequest,
): Promise<CommunityPostReportResponse> => {
  const response = await apiClient.post<ApiResponseFull<CommunityPostReportResponse>>(
    `${API_VERSION}/community/posts/${postId}/report`,
    data,
  )
  return unwrap(response, '게시글 신고에 실패했습니다.')
}
