import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApplicationCreateRequest,
  ApplicationListItemDto,
  ApplicationDetailDto,
  ApplicationStatusUpdateRequest,
  ApplicationStatusUpdateResponseDto,
  ApplicationFormDto,
  ApplicationFormSimpleUpdateRequest,
  ApplicationFormSimpleUpdateResponse,
  PaginationResponse,
} from '@/shared/types'

/** 입양 신청 제출 */
export const createApplication = (data: ApplicationCreateRequest) =>
  apiClient
    .post<{
      success: boolean
      data: { applicationId: string; message: string }
      message?: string
    }>(`${API_VERSION}/adopter/application`, data)
    .then(unwrap)

/** 내 신청 목록 (입양자용) */
export const getMyApplications = (page = 1, limit = 10, animalType?: 'cat' | 'dog') =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<ApplicationListItemDto>
      message?: string
    }>(`${API_VERSION}/adopter/applications`, { params: { page, limit, animalType } })
    .then(unwrap)

/** 신청 상세 (입양자용) */
export const getApplicationDetail = (applicationId: string) =>
  apiClient
    .get<{
      success: boolean
      data: ApplicationDetailDto
      message?: string
    }>(`${API_VERSION}/adopter/applications/${applicationId}`)
    .then(unwrap)

/** 신청 상태 변경 (브리더용) */
export const updateApplicationStatus = (
  applicationId: string,
  data: ApplicationStatusUpdateRequest,
) =>
  apiClient
    .patch<{
      success: boolean
      data: ApplicationStatusUpdateResponseDto
      message?: string
    }>(`${API_VERSION}/breeder-management/applications/${applicationId}`, data)
    .then(unwrap)

/** 브리더 신청 폼 조회 (브리더 관리용) */
export const getApplicationForm = () =>
  apiClient
    .get<{
      success: boolean
      data: ApplicationFormDto
      message?: string
    }>(`${API_VERSION}/breeder-management/application-form`)
    .then(unwrap)

/** 브리더 신청 폼 업데이트 */
export const updateApplicationForm = (data: ApplicationFormSimpleUpdateRequest) =>
  apiClient
    .put<{
      success: boolean
      data: ApplicationFormSimpleUpdateResponse
      message?: string
    }>(`${API_VERSION}/breeder-management/application-form`, data)
    .then(unwrap)
