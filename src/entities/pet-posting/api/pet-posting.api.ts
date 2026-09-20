import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  PaginationResponse,
  MyPetPostingCard,
  MyPetPostingListParams,
  PetPostingDraftCard,
  PetPostingDraftDetail,
  PetPostingEditDetail,
} from '@/shared/types'

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

/** 내 임시저장 분양글 목록 */
export const getMyPetPostingDrafts = async (): Promise<PetPostingDraftCard[]> => {
  const response = await apiClient.get<ApiResponseFull<PetPostingDraftCard[]>>(
    `${API_VERSION}/breeder-pet-posting/drafts`,
  )
  return unwrap(response, '임시저장 목록 조회에 실패했습니다.')
}

/** 임시저장 글 단건 (작성 폼 복원용) */
export const getPetPostingDraft = async (draftId: string): Promise<PetPostingDraftDetail> => {
  const response = await apiClient.get<ApiResponseFull<PetPostingDraftDetail>>(
    `${API_VERSION}/breeder-pet-posting/drafts/${draftId}`,
  )
  return unwrap(response, '임시저장 글 조회에 실패했습니다.')
}

/**
 * 발행된 분양글 단건 (수정 폼 복원용, 브리더 본인만).
 *
 * 공개 상세와 달리 사진 '파일키'를 그대로 돌려준다 — 수정 시 그 키를 다시 보내야
 * 기존 사진이 유지된다.
 */
export const getPetPostingForEdit = async (petId: string): Promise<PetPostingEditDetail> => {
  const response = await apiClient.get<ApiResponseFull<PetPostingEditDetail>>(
    `${API_VERSION}/breeder-pet-posting/${petId}`,
  )
  return unwrap(response, '분양글을 불러오지 못했습니다.')
}
