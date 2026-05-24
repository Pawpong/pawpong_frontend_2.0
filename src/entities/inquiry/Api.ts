import { ApiError, apiClient, API_VERSION, unwrap, unwrapVoid } from '@/shared/api'
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
  return apiClient
    .get<ApiResponse<InquiryListResponse>>(`${API_VERSION}/inquiry`, {
      params: { page, limit: 15, animalType, sort },
    })
    .then((res) => unwrap(res, '문의 목록 조회에 실패했습니다.'))
}

/** 문의 상세 조회 */
export const getInquiryDetail = async (inquiryId: string): Promise<Inquiry | null> => {
  try {
    const response = await apiClient.get<ApiResponse<Inquiry>>(
      `${API_VERSION}/inquiry/${inquiryId}`,
    )
    return unwrap(response, '문의 상세 조회에 실패했습니다.')
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

/** 문의 작성 */
export const createInquiry = async (data: CreateInquiryRequest): Promise<{ inquiryId: string }> => {
  return apiClient
    .post<ApiResponse<{ inquiryId: string }>>(`${API_VERSION}/inquiry`, data)
    .then((res) => unwrap(res, '문의 작성에 실패했습니다.'))
}

/** 브리더 내 답변 목록 조회 */
export const getBreederInquiries = async (
  answered: boolean,
  page: number,
): Promise<InquiryListResponse> => {
  return apiClient
    .get<ApiResponse<InquiryListResponse>>(`${API_VERSION}/inquiry/breeder`, {
      params: { answered, page, limit: 15 },
    })
    .then((res) => unwrap(res, '문의 답변 목록 조회에 실패했습니다.'))
}

/** 답변 작성 */
export const createInquiryAnswer = async (inquiryId: string, content: string): Promise<void> => {
  const response = await apiClient.post<ApiResponse<null>>(
    `${API_VERSION}/inquiry/${inquiryId}/answer`,
    { content },
  )
  unwrapVoid(response, '답변 작성에 실패했습니다.')
}
