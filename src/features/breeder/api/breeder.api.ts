import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  BreederUploadDocumentType,
  ProfileUpdateRequestDto,
  BreederProfileUpdateResponseDto,
  ApplicationStatusUpdateRequest,
  ApplicationStatusUpdateResponseDto,
  ParentPetAddRequest,
  ParentPetUpdateRequest,
  PetAddResponse,
  PetMessageResponse,
  ReviewReplyRequest,
  ReviewReplyResponseDto,
  ReviewReplyDeleteResponseDto,
  SimpleApplicationFormUpdateRequest,
  SimpleApplicationFormUpdateResponse,
  SubmitVerificationDocumentsRequest,
  UploadVerificationDocumentsResponse,
  VerificationSubmitResponse,
  BreederAccountDeleteRequest,
  BreederAccountDeleteResponse,
} from '@/shared/types'

/** 브리더 프로필 수정 */
export const updateBreederProfile = (data: ProfileUpdateRequestDto) =>
  apiClient
    .patch<
      ApiResponseFull<BreederProfileUpdateResponseDto>
    >(`${API_VERSION}/breeder-management/profile`, data)
    .then(unwrap)

// ==================== 인증 서류 재제출 ====================

/** 인증 서류 업로드 — 새로 선택한 파일만 올린다 */
export const uploadVerificationDocuments = (
  files: { type: BreederUploadDocumentType; file: File }[],
) => {
  const formData = new FormData()
  files.forEach(({ file }) => formData.append('files', file))
  formData.append('types', JSON.stringify(files.map(({ type }) => type)))
  return apiClient
    .post<
      ApiResponseFull<UploadVerificationDocumentsResponse>
    >(`${API_VERSION}/breeder-management/verification/upload`, formData)
    .then(unwrap)
}

/** 인증 서류 제출 — 기존 서류(변경 없음) + 새로 업로드한 서류를 합쳐 보낸다 */
export const submitVerificationDocuments = (data: SubmitVerificationDocumentsRequest) =>
  apiClient
    .post<
      ApiResponseFull<VerificationSubmitResponse>
    >(`${API_VERSION}/breeder-management/verification/submit`, data)
    .then(unwrap)

/** 신청 상태 변경 (브리더용) — applicationId는 URL과 body 둘 다 필요해 호출부 대신 여기서 채운다 */
export const updateBreederApplicationStatus = (
  applicationId: string,
  data: Omit<ApplicationStatusUpdateRequest, 'applicationId'>,
) =>
  apiClient
    .patch<
      ApiResponseFull<ApplicationStatusUpdateResponseDto>
    >(`${API_VERSION}/breeder-management/applications/${applicationId}`, { applicationId, ...data })
    .then(unwrap)

// ==================== 부모견/묘 (parent-pets) ====================

/** 부모견/묘 추가 */
export const addParentPet = (data: ParentPetAddRequest) =>
  apiClient
    .post<ApiResponseFull<PetAddResponse>>(`${API_VERSION}/breeder-management/parent-pets`, data)
    .then(unwrap)

/** 부모견/묘 수정 */
export const updateParentPet = (petId: string, data: ParentPetUpdateRequest) =>
  apiClient
    .patch<
      ApiResponseFull<PetMessageResponse>
    >(`${API_VERSION}/breeder-management/parent-pets/${petId}`, data)
    .then(unwrap)

/** 부모견/묘 삭제 */
export const deleteParentPet = (petId: string) =>
  apiClient
    .delete<
      ApiResponseFull<PetMessageResponse>
    >(`${API_VERSION}/breeder-management/parent-pets/${petId}`)
    .then(unwrap)

// ==================== 후기 답글 (reviews/{reviewId}/reply) ====================

/** 후기 답글 등록 */
export const createReviewReply = (reviewId: string, data: ReviewReplyRequest) =>
  apiClient
    .post<
      ApiResponseFull<ReviewReplyResponseDto>
    >(`${API_VERSION}/breeder-management/reviews/${reviewId}/reply`, data)
    .then(unwrap)

/** 후기 답글 수정 */
export const updateReviewReply = (reviewId: string, data: ReviewReplyRequest) =>
  apiClient
    .patch<
      ApiResponseFull<ReviewReplyResponseDto>
    >(`${API_VERSION}/breeder-management/reviews/${reviewId}/reply`, data)
    .then(unwrap)

/** 후기 답글 삭제 */
export const deleteReviewReply = (reviewId: string) =>
  apiClient
    .delete<
      ApiResponseFull<ReviewReplyDeleteResponseDto>
    >(`${API_VERSION}/breeder-management/reviews/${reviewId}/reply`)
    .then(unwrap)

// ==================== 입양 신청 폼 (간소화) ====================

/** 입양 신청 폼 수정 (간소화) */
export const updateSimpleApplicationForm = (data: SimpleApplicationFormUpdateRequest) =>
  apiClient
    .patch<
      ApiResponseFull<SimpleApplicationFormUpdateResponse>
    >(`${API_VERSION}/breeder-management/application-form/simple`, data)
    .then(unwrap)

// ==================== 회원 탈퇴 ====================

/** 브리더 계정 탈퇴 */
export const deleteBreederAccount = (data: BreederAccountDeleteRequest) =>
  apiClient
    .delete<
      ApiResponseFull<BreederAccountDeleteResponse>
    >(`${API_VERSION}/breeder-management/account`, { data })
    .then(unwrap)
