import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  PaginationResponse,
  MyProfile,
  FavoriteBreederCard,
  FavoriteBreederListParams,
  FollowUserCard,
  UpdateMyProfileRequest,
} from '@/shared/types'

/** 내 프로필 수정 — profile 관련 기능과 가입 완료 후 보강에서 공유하는 entity API. */
export const updateMyProfile = async (data: UpdateMyProfileRequest): Promise<MyProfile> => {
  const response = await apiClient.patch<ApiResponseFull<MyProfile>>(
    `${API_VERSION}/profile/me`,
    data,
  )
  return unwrap(response, '프로필 수정에 실패했습니다.')
}

/** 내 프로필 조회 (마이홈) */
export const getMyProfile = async (): Promise<MyProfile> => {
  const response = await apiClient.get<ApiResponseFull<MyProfile>>(`${API_VERSION}/profile/me`)
  return unwrap(response, '프로필 조회에 실패했습니다.')
}

/** 즐겨찾는 브리더 목록 */
export const getFavoriteBreeders = async (
  params: FavoriteBreederListParams = {},
): Promise<PaginationResponse<FavoriteBreederCard>> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<FavoriteBreederCard>>>(
    `${API_VERSION}/profile/me/favorite-breeders?${query.toString()}`,
  )
  return unwrap(response, '즐겨찾는 브리더 목록 조회에 실패했습니다.')
}

/** 친구 목록 세그먼트 — followers(나를 팔로우) / followings(내가 팔로우) */
export type FollowSegment = 'followers' | 'followings'

// [refactored] getFollowers/getFollowings 한 줄 래퍼 제거 — segment 인자 하나로 통일
/** 친구 목록 (팔로워/팔로잉) — 팔로우 최신순, 비로그인도 조회 가능 */
export const getFollowList = async (
  userId: string,
  segment: FollowSegment,
  page?: number,
  pageSize?: number,
): Promise<PaginationResponse<FollowUserCard>> => {
  const query = new URLSearchParams()
  if (page) query.set('page', String(page))
  if (pageSize) query.set('pageSize', String(pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<FollowUserCard>>>(
    `${API_VERSION}/profile/users/${userId}/${segment}?${query.toString()}`,
  )
  return unwrap(response, '친구 목록 조회에 실패했습니다.')
}
