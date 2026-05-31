import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  MyProfile,
  UpdateMyProfileRequest,
  FollowResponse,
  UnfollowResponse,
} from '@/shared/types'

/** 내 프로필 수정 */
export const updateMyProfile = async (data: UpdateMyProfileRequest): Promise<MyProfile> => {
  const response = await apiClient.patch<ApiResponseFull<MyProfile>>(
    `${API_VERSION}/profile/me`,
    data,
  )
  return unwrap(response, '프로필 수정에 실패했습니다.')
}

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
