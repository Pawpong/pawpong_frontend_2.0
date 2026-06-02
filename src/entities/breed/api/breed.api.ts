import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiResponseFull, BreedPetType, BreedsByPetType } from '@/shared/types'

/** 동물 타입별 품종 목록 조회 */
export const getBreeds = async (petType: BreedPetType): Promise<BreedsByPetType> => {
  const response = await apiClient.get<ApiResponseFull<BreedsByPetType>>(
    `${API_VERSION}/breeds/${petType}`,
  )
  return unwrap(response, '품종 목록 조회에 실패했습니다.')
}
