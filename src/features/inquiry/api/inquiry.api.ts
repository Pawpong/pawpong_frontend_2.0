import { apiClient, API_VERSION, unwrap, unwrapVoid } from '@/shared/api'
import type { ApiResponse, CreateInquiryRequest } from '@/shared/types'

/** 문의 작성 */
export const createInquiry = async (data: CreateInquiryRequest): Promise<{ inquiryId: string }> => {
  return apiClient
    .post<ApiResponse<{ inquiryId: string }>>(`${API_VERSION}/inquiry`, data)
    .then((res) => unwrap(res, '문의 작성에 실패했습니다.'))
}

/** 답변 작성 */
export const createInquiryAnswer = async (inquiryId: string, content: string): Promise<void> => {
  const response = await apiClient.post<ApiResponse<null>>(
    `${API_VERSION}/inquiry/${inquiryId}/answer`,
    { content },
  )
  unwrapVoid(response, '답변 작성에 실패했습니다.')
}
