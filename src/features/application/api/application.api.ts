import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  ApplicationCreateRequest,
  ApplicationUpdateRequest,
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

/** 입양 신청 취소 — 상담 대기·상담 완료인 내 신청만 가능, 확정·거절은 409 */
export const cancelApplication = (applicationId: string) =>
  apiClient
    .patch<
      ApiResponseFull<{ applicationId: string; status: 'adoption_cancelled' }>
    >(`${API_VERSION}/adopter/application/${applicationId}/cancel`)
    .then(unwrap)

/** 입양 신청서 전체 수정 — 상담 대기 상태인 내 신청만 가능 */
export const updateApplication = (applicationId: string, data: ApplicationUpdateRequest) =>
  apiClient
    .patch<{
      success: boolean
      data: { applicationId: string; message: string }
      message?: string
    }>(`${API_VERSION}/adopter/application/${applicationId}`, data)
    .then(unwrap)
