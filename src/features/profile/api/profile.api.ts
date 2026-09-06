import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  FollowResponse,
  UnfollowResponse,
  RemoveFollowerResponse,
} from '@/shared/types'

/** 사용자 팔로우 */
export const followUser = async (userId: string): Promise<FollowResponse> => {
  const response = await apiClient.post<ApiResponseFull<FollowResponse>>(
    `${API_VERSION}/profile/users/${userId}/follow`,
  )
  return unwrap(response, '팔로우 처리에 실패했습니다.')
}

/** 사용자 팔로우 취소 */
export const unfollowUser = async (userId: string): Promise<UnfollowResponse> => {
  const response = await apiClient.delete<ApiResponseFull<UnfollowResponse>>(
    `${API_VERSION}/profile/users/${userId}/follow`,
  )
  return unwrap(response, '팔로우 취소에 실패했습니다.')
}

/** 내 팔로워 삭제 — 상대가 나를 팔로우한 관계를 끊음 (언팔로우와 방향 반대) */
export const removeFollower = async (userId: string): Promise<RemoveFollowerResponse> => {
  const response = await apiClient.delete<ApiResponseFull<RemoveFollowerResponse>>(
    `${API_VERSION}/profile/me/followers/${userId}`,
  )
  return unwrap(response, '팔로워 삭제에 실패했습니다.')
}
