import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  CreatePetPostingRequest,
  UpdatePetPostingRequest,
  PetPostingMutationResponse,
  PetPostingDeleteResponse,
  SavePetPostingDraftRequest,
  PetPostingDraftSaveResponse,
  PetPostingDraftDeleteResponse,
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

// ==================== 임시저장 ====================

/**
 * 분양글 임시저장
 *
 * 모든 필드가 선택이라 작성 도중 아무 때나 부를 수 있다.
 * 발행은 createPetPosting 이 담당하며, draftId 를 함께 넘기면 서버가 임시저장 글을 정리한다.
 */
export const savePetPostingDraft = async (
  data: SavePetPostingDraftRequest,
): Promise<PetPostingDraftSaveResponse> => {
  const response = await apiClient.post<ApiResponseFull<PetPostingDraftSaveResponse>>(
    `${API_VERSION}/breeder-pet-posting/drafts`,
    data,
  )
  return unwrap(response, '임시저장에 실패했습니다.')
}

/**
 * 임시저장 덮어쓰기
 *
 * 이어쓰기 중 다시 저장할 때 쓴다. 새로 만들면 초안이 계속 늘어난다.
 */
export const overwritePetPostingDraft = async (
  draftId: string,
  data: SavePetPostingDraftRequest,
): Promise<PetPostingDraftSaveResponse> => {
  const response = await apiClient.put<ApiResponseFull<PetPostingDraftSaveResponse>>(
    `${API_VERSION}/breeder-pet-posting/drafts/${draftId}`,
    data,
  )
  return unwrap(response, '임시저장에 실패했습니다.')
}

/** 임시저장 글 삭제 */
export const deletePetPostingDraft = async (
  draftId: string,
): Promise<PetPostingDraftDeleteResponse> => {
  const response = await apiClient.delete<ApiResponseFull<PetPostingDraftDeleteResponse>>(
    `${API_VERSION}/breeder-pet-posting/drafts/${draftId}`,
  )
  return unwrap(response, '임시저장 글 삭제에 실패했습니다.')
}
