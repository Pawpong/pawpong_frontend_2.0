import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  PaginationResponse,
  MyPetPostingCard,
  MyPetPostingListParams,
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
