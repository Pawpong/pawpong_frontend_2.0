import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiRequestConfig } from '@/shared/api'
import type {
  ApiResponseFull,
  BreederProfileResponseDto,
  BreederPublicProfile,
  DashboardResponseDto,
  Breeder,
  SearchBreederParams,
  PaginationResponse,
  AvailablePetSummaryDto,
  ParentPetSummaryDto,
  PublicReviewDto,
  ReceivedApplicationItemDto,
  ReceivedApplicationDetailDto,
  BreederApplicationFormDto,
  ChatMessageDto,
} from '@/shared/types'

/** 브리더 공개 프로필 조회 (브리더홈) */
export const getBreederPublicProfile = (breederId: string) =>
  apiClient
    .get<
      ApiResponseFull<BreederPublicProfile>
    >(`${API_VERSION}/profile/breeders/${breederId}`, { skipAuth: true } as ApiRequestConfig)
    .then((res) => unwrap(res, '브리더 프로필 조회에 실패했습니다.'))

/** 브리더 상세 프로필 조회 (기존) */
export const getBreederProfile = (breederId: string) =>
  apiClient
    .get<{
      success: boolean
      data: BreederProfileResponseDto
      message?: string
    }>(`${API_VERSION}/breeder/${breederId}`, { skipAuth: true } as ApiRequestConfig)
    .then(unwrap)

/** 내 브리더 프로필 조회 */
export const getMyBreederProfile = () =>
  apiClient
    .get<{
      success: boolean
      data: BreederProfileResponseDto
      message?: string
    }>(`${API_VERSION}/breeder-management/profile`)
    .then(unwrap)

/** 브리더 대시보드 조회 */
export const getBreederDashboard = () =>
  apiClient
    .get<{
      success: boolean
      data: DashboardResponseDto
      message?: string
    }>(`${API_VERSION}/breeder-management/dashboard`)
    .then(unwrap)

/** 브리더 탐색/검색 */
export const exploreBreeders = (params: SearchBreederParams = {}) =>
  apiClient
    .post<{
      success: boolean
      data: PaginationResponse<Breeder>
      message?: string
    }>(`${API_VERSION}/breeder/explore`, params)
    .then(unwrap)

/** 인기 브리더 목록 */
export const getPopularBreeders = () =>
  apiClient
    .get<{
      success: boolean
      data: Breeder[]
      message?: string
    }>(`${API_VERSION}/breeder/popular`, { skipAuth: true } as ApiRequestConfig)
    .then(unwrap)

/** 분양 개체 목록 */
export const getBreederPets = (breederId: string, page = 1, limit = 20) =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<AvailablePetSummaryDto>
      message?: string
    }>(`${API_VERSION}/breeder/${breederId}/pets`, {
      params: { page, limit },
      skipAuth: true,
    } as ApiRequestConfig)
    .then(unwrap)

/** 부모견/묘 목록 */
export const getParentPets = (breederId: string, page = 1, limit = 4) =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<ParentPetSummaryDto>
      message?: string
    }>(`${API_VERSION}/breeder/${breederId}/parent-pets`, {
      params: { page, limit },
      skipAuth: true,
    } as ApiRequestConfig)
    .then(unwrap)

/** 브리더 후기 목록 */
export const getBreederReviews = (breederId: string, page = 1, limit = 10) =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<PublicReviewDto>
      message?: string
    }>(`${API_VERSION}/breeder/${breederId}/reviews`, {
      params: { page, limit },
      skipAuth: true,
    } as ApiRequestConfig)
    .then(unwrap)

/** 입양 신청 폼 조회 (공개) */
export const getBreederApplicationForm = (breederId: string) =>
  apiClient
    .get<{
      success: boolean
      data: BreederApplicationFormDto
      message?: string
    }>(`${API_VERSION}/breeder/${breederId}/application-form`, {
      skipAuth: true,
    } as ApiRequestConfig)
    .then(unwrap)

/** 받은 신청 목록 (브리더용) */
export const getReceivedApplications = (page = 1, limit = 10) =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<ReceivedApplicationItemDto>
      message?: string
    }>(`${API_VERSION}/breeder-management/applications`, { params: { page, limit } })
    .then(unwrap)

/** 받은 신청 상세 (브리더용) */
export const getReceivedApplicationDetail = (applicationId: string) =>
  apiClient
    .get<{
      success: boolean
      data: ReceivedApplicationDetailDto
      message?: string
    }>(`${API_VERSION}/breeder-management/applications/${applicationId}`)
    .then(unwrap)

/** 채팅 메시지 조회 */
export const getApplicationChatMessages = async (
  applicationId: string,
): Promise<ChatMessageDto[]> => {
  const res = await apiClient.get<{
    success: boolean
    data: ChatMessageDto[] | { messages?: ChatMessageDto[]; items?: ChatMessageDto[] }
    message?: string
  }>(`${API_VERSION}/breeder-management/applications/${applicationId}/chat/messages`)

  const data = unwrap(res)
  if (Array.isArray(data)) return data
  if ('messages' in data && Array.isArray(data.messages)) return data.messages
  if ('items' in data && Array.isArray(data.items)) return data.items!
  return []
}
