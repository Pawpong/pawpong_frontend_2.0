import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  PaginationResponse,
  MyProfile,
  FavoriteBreederCard,
  FavoriteBreederListParams,
} from '@/shared/types'

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
