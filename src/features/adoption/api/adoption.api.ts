import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  AdoptionFavoriteResponse,
  CreateAdoptionApplicationRequest,
  CreateAdoptionApplicationResponse,
} from '@/shared/types'

/** 동물 관심 등록 */
export const addAdoptionFavorite = async (petId: string): Promise<AdoptionFavoriteResponse> => {
  const response = await apiClient.post<ApiResponseFull<AdoptionFavoriteResponse>>(
    `${API_VERSION}/adoption/${petId}/favorite`,
  )
  return unwrap(response, '관심 동물 등록에 실패했습니다.')
}

/** 동물 관심 해제 */
export const removeAdoptionFavorite = async (petId: string): Promise<AdoptionFavoriteResponse> => {
  const response = await apiClient.delete<ApiResponseFull<AdoptionFavoriteResponse>>(
    `${API_VERSION}/adoption/${petId}/favorite`,
  )
  return unwrap(response, '관심 동물 해제에 실패했습니다.')
}

/** 입양 신청서 제출 */
export const createAdoptionApplication = async (
  data: CreateAdoptionApplicationRequest,
): Promise<CreateAdoptionApplicationResponse> => {
  const response = await apiClient.post<ApiResponseFull<CreateAdoptionApplicationResponse>>(
    `${API_VERSION}/adoption-application`,
    data,
  )
  return unwrap(response, '입양 신청에 실패했습니다.')
}
