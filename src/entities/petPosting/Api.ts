import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  PaginationResponse,
  CreatePetPostingRequest,
  UpdatePetPostingRequest,
  PetPostingMutationResponse,
  PetPostingDeleteResponse,
  MyPetPostingCard,
  MyPetPostingListParams,
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

/** 내 분양글 목록 조회 */
export const getMyPetPostings = async (
  params: MyPetPostingListParams = {},
): Promise<PaginationResponse<MyPetPostingCard>> => {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<MyPetPostingCard>>>(
    `${API_VERSION}/breeder-pet-posting/me?${query.toString()}`,
  )
  return unwrap(response, '내 분양글 목록 조회에 실패했습니다.')
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
