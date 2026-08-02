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
// 백엔드는 PATCH /breeder-management/application-form/simple (질문 텍스트만 받는 간소화 폼).
// PUT · /application-form(전체 폼)로 보내면 404 → 메서드·경로를 백엔드 컨트롤러에 맞춘다.
export const updateApplicationForm = (data: ApplicationFormSimpleUpdateRequest) =>
  apiClient
    .patch<{
      success: boolean
      data: ApplicationFormSimpleUpdateResponse
      message?: string
    }>(`${API_VERSION}/breeder-management/application-form/simple`, data)
    .then(unwrap)
