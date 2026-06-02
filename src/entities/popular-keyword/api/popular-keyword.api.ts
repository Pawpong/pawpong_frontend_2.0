import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiResponseFull, PopularKeyword } from '@/shared/types'

/** 활성 인기 검색어 조회 */
export const getActivePopularKeywords = async (): Promise<PopularKeyword[]> => {
  const response = await apiClient.get<ApiResponseFull<PopularKeyword[]>>(
    `${API_VERSION}/popular-keyword`,
  )
  return unwrap(response, '인기 검색어 조회에 실패했습니다.')
}
