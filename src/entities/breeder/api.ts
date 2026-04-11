import { apiClient, unwrap } from '@/shared/api'
import type { ApiRequestConfig } from '@/shared/api'
import type {
  BreederProfileResponseDto,
  ProfileUpdateRequestDto,
  BreederProfileUpdateResponseDto,
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
  ApplicationStatusUpdateRequest,
  ApplicationStatusUpdateResponseDto,
  ChatMessageDto,
  SendChatMessageRequest,
} from '@/shared/types'

/** 브리더 공개 프로필 조회 */
export const getBreederProfile = (breederId: string) =>
  apiClient
    .get<{
      success: boolean
      data: BreederProfileResponseDto
      message?: string
    }>(`/api/breeder/${breederId}`, { skipAuth: true } as ApiRequestConfig)
    .then(unwrap)

/** 내 브리더 프로필 조회 */
export const getMyBreederProfile = () =>
  apiClient
    .get<{
      success: boolean
      data: BreederProfileResponseDto
      message?: string
    }>('/api/breeder-management/profile')
    .then(unwrap)

/** 브리더 프로필 수정 */
export const updateBreederProfile = (data: ProfileUpdateRequestDto) =>
  apiClient
    .patch<{
      success: boolean
      data: BreederProfileUpdateResponseDto
      message?: string
    }>('/api/breeder-management/profile', data)
    .then(unwrap)

/** 브리더 대시보드 조회 */
export const getBreederDashboard = () =>
  apiClient
    .get<{
      success: boolean
      data: DashboardResponseDto
      message?: string
    }>('/api/breeder-management/dashboard')
    .then(unwrap)

/** 브리더 탐색/검색 */
export const exploreBreeders = (params: SearchBreederParams = {}) =>
  apiClient
    .post<{
      success: boolean
      data: PaginationResponse<Breeder>
      message?: string
    }>('/api/breeder/explore', params)
    .then(unwrap)

/** 인기 브리더 목록 */
export const getPopularBreeders = () =>
  apiClient
    .get<{ success: boolean; data: Breeder[]; message?: string }>('/api/breeder/popular', {
      skipAuth: true,
    } as ApiRequestConfig)
    .then(unwrap)

/** 분양 개체 목록 */
export const getBreederPets = (breederId: string, page = 1, limit = 20) =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<AvailablePetSummaryDto>
      message?: string
    }>(`/api/breeder/${breederId}/pets`, { params: { page, limit }, skipAuth: true } as ApiRequestConfig)
    .then(unwrap)

/** 부모견/묘 목록 */
export const getParentPets = (breederId: string, page = 1, limit = 4) =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<ParentPetSummaryDto>
      message?: string
    }>(`/api/breeder/${breederId}/parent-pets`, { params: { page, limit }, skipAuth: true } as ApiRequestConfig)
    .then(unwrap)

/** 브리더 후기 목록 */
export const getBreederReviews = (breederId: string, page = 1, limit = 10) =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<PublicReviewDto>
      message?: string
    }>(`/api/breeder/${breederId}/reviews`, { params: { page, limit }, skipAuth: true } as ApiRequestConfig)
    .then(unwrap)

/** 입양 신청 폼 조회 (공개) */
export const getBreederApplicationForm = (breederId: string) =>
  apiClient
    .get<{
      success: boolean
      data: BreederApplicationFormDto
      message?: string
    }>(`/api/breeder/${breederId}/application-form`, { skipAuth: true } as ApiRequestConfig)
    .then(unwrap)

/** 받은 신청 목록 (브리더용) */
export const getReceivedApplications = (page = 1, limit = 10) =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<ReceivedApplicationItemDto>
      message?: string
    }>('/api/breeder-management/applications', { params: { page, limit } })
    .then(unwrap)

/** 받은 신청 상세 (브리더용) */
export const getReceivedApplicationDetail = (applicationId: string) =>
  apiClient
    .get<{
      success: boolean
      data: ReceivedApplicationDetailDto
      message?: string
    }>(`/api/breeder-management/applications/${applicationId}`)
    .then(unwrap)

/** 신청 상태 변경 (브리더용) */
export const updateBreederApplicationStatus = (
  applicationId: string,
  data: ApplicationStatusUpdateRequest,
) =>
  apiClient
    .patch<{
      success: boolean
      data: ApplicationStatusUpdateResponseDto
      message?: string
    }>(`/api/breeder-management/applications/${applicationId}`, data)
    .then(unwrap)

/** 채팅 메시지 조회 */
export const getApplicationChatMessages = async (
  applicationId: string,
): Promise<ChatMessageDto[]> => {
  const res = await apiClient.get<{
    success: boolean
    data: ChatMessageDto[] | { messages?: ChatMessageDto[]; items?: ChatMessageDto[] }
    message?: string
  }>(`/api/breeder-management/applications/${applicationId}/chat/messages`)

  const data = unwrap(res)
  if (Array.isArray(data)) return data
  if ('messages' in data && Array.isArray(data.messages)) return data.messages
  if ('items' in data && Array.isArray(data.items)) return data.items!
  return []
}

/** 채팅 메시지 전송 */
export const sendApplicationChatMessage = (applicationId: string, data: SendChatMessageRequest) =>
  apiClient
    .post<{
      success: boolean
      data: ChatMessageDto | null
      message?: string
    }>(`/api/breeder-management/applications/${applicationId}/chat/messages`, data)
    .then((res) => res.data.data ?? null)
