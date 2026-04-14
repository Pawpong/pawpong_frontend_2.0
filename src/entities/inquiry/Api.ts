import { apiClient } from '@/shared/api'
import type {
  ApiResponse,
  Inquiry,
  InquiryListResponse,
  InquirySortType,
  AnimalType,
  CreateInquiryRequest,
} from '@/shared/types'

/** 문의 목록 조회 */
export const getInquiries = async (
  page: number,
  animalType: AnimalType,
  sort: InquirySortType,
): Promise<InquiryListResponse> => {
  const response = await apiClient.get<ApiResponse<InquiryListResponse>>('/api/inquiry', {
    params: { page, limit: 15, animalType, sort },
  })
  return response.data.data ?? { data: [], hasMore: false }
}

/** 문의 상세 조회 */
export const getInquiryDetail = async (inquiryId: string): Promise<Inquiry | null> => {
  try {
    const response = await apiClient.get<ApiResponse<Inquiry>>(`/api/inquiry/${inquiryId}`)
    return response.data.data ?? null
  } catch {
    return null
  }
}

/** 문의 작성 */
export const createInquiry = async (data: CreateInquiryRequest): Promise<{ inquiryId: string }> => {
  const response = await apiClient.post<ApiResponse<{ inquiryId: string }>>('/api/inquiry', data)
  if (!response.data.success || !response.data.data) {
    throw new Error('문의 작성에 실패했습니다.')
  }
  return response.data.data
}

/** 브리더 내 답변 목록 조회 */
export const getBreederInquiries = async (
  answered: boolean,
  page: number,
): Promise<InquiryListResponse> => {
  const response = await apiClient.get<ApiResponse<InquiryListResponse>>('/api/inquiry/breeder', {
    params: { answered, page, limit: 15 },
  })
  return response.data.data ?? { data: [], hasMore: false }
}

/** 답변 작성 */
export const createInquiryAnswer = async (inquiryId: string, content: string): Promise<void> => {
  const response = await apiClient.post<ApiResponse<null>>(`/api/inquiry/${inquiryId}/answer`, {
    content,
  })
  if (!response.data.success) {
    throw new Error('답변 작성에 실패했습니다.')
  }
}
