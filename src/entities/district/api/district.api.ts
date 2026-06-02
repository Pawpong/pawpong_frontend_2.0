import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiResponseFull, District } from '@/shared/types'

/** 모든 지역 데이터 조회 */
export const getDistricts = async (): Promise<District[]> => {
  const response = await apiClient.get<ApiResponseFull<District[]>>(`${API_VERSION}/districts`)
  return unwrap(response, '지역 데이터 조회에 실패했습니다.')
}
