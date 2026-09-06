import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApplicationCreateRequest, ApplicationUpdateRequest } from '@/shared/types'

/** 입양 신청 제출 */
export const createApplication = (data: ApplicationCreateRequest) =>
  apiClient
    .post<{
      success: boolean
      data: { applicationId: string; message: string }
      message?: string
    }>(`${API_VERSION}/adopter/application`, data)
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
