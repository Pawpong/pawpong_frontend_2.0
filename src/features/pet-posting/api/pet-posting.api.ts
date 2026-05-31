import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  CreatePetPostingRequest,
  UpdatePetPostingRequest,
  PetPostingMutationResponse,
  PetPostingDeleteResponse,
} from '@/shared/types'

/** 분양글 작성 */
export const createPetPosting = async (
  data: CreatePetPostingRequest,
): Promise<PetPostingMutationResponse> => {
  const response = await apiClient.post<ApiResponseFull<PetPostingMutationResponse>>(
    `${API_VERSION}/breeder-pet-posting`,
    data,
  )
  return unwrap(response, '분양글 작성에 실패했습니다.')
}

/** 분양글 수정 */
export const updatePetPosting = async (
  petId: string,
  data: UpdatePetPostingRequest,
): Promise<PetPostingMutationResponse> => {
  const response = await apiClient.patch<ApiResponseFull<PetPostingMutationResponse>>(
    `${API_VERSION}/breeder-pet-posting/${petId}`,
    data,
  )
  return unwrap(response, '분양글 수정에 실패했습니다.')
}

/** 분양글 삭제 (소프트) */
export const deletePetPosting = async (petId: string): Promise<PetPostingDeleteResponse> => {
  const response = await apiClient.delete<ApiResponseFull<PetPostingDeleteResponse>>(
    `${API_VERSION}/breeder-pet-posting/${petId}`,
  )
  return unwrap(response, '분양글 삭제에 실패했습니다.')
}
