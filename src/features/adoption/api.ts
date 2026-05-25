import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  CreateAdoptionApplicationRequest,
  CreateAdoptionApplicationResponse,
} from '@/shared/types'

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
