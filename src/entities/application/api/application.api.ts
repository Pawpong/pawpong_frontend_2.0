import { apiClient, API_VERSION, unwrap, unwrapNullable } from '@/shared/api'
import type {
  ApiResponseFull,
  ApplicationListItemDto,
  ApplicationDetailDto,
  ApplicationDraftDto,
  ApplicationFormDto,
  PaginationResponse,
} from '@/shared/types'

/** 이 분양글에 임시저장한 내 신청서 — 저장한 적 없으면 null */
export const getApplicationDraft = (petId: string) =>
  apiClient
    .get<
      ApiResponseFull<ApplicationDraftDto | null>
    >(`${API_VERSION}/adopter/application-drafts/${petId}`)
    .then((response) => unwrapNullable(response, '임시저장한 신청서를 불러오지 못했어요.'))

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

/** 브리더 신청 폼 조회 (브리더 관리용) */
export const getApplicationForm = () =>
  apiClient
    .get<{
      success: boolean
      data: ApplicationFormDto
      message?: string
    }>(`${API_VERSION}/breeder-management/application-form`)
    .then(unwrap)
