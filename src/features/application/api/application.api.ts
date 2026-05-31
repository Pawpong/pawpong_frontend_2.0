import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApplicationCreateRequest,
  ApplicationStatusUpdateRequest,
  ApplicationStatusUpdateResponseDto,
  ApplicationFormSimpleUpdateRequest,
  ApplicationFormSimpleUpdateResponse,
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

/** 브리더 신청 폼 업데이트 */
export const updateApplicationForm = (data: ApplicationFormSimpleUpdateRequest) =>
  apiClient
    .put<{
      success: boolean
      data: ApplicationFormSimpleUpdateResponse
      message?: string
    }>(`${API_VERSION}/breeder-management/application-form`, data)
    .then(unwrap)
