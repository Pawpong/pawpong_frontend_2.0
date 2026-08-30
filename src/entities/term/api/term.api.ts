import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiResponseFull, Terms, TermsCode } from '@/shared/types'

/** 활성 약관 목록 조회 */
export const getActiveTermsList = async (): Promise<Terms[]> => {
  const response = await apiClient.get<ApiResponseFull<Terms[]>>(`${API_VERSION}/terms`)
  return unwrap(response, '약관 목록 조회에 실패했습니다.')
}

/** 활성 약관 단건 조회 */
export const getTermsByCode = async (code: TermsCode): Promise<Terms> => {
  const response = await apiClient.get<ApiResponseFull<Terms>>(`${API_VERSION}/terms/${code}`)
  return unwrap(response, '약관 조회에 실패했습니다.')
}
