import { apiClient, API_VERSION, unwrap, unwrapNullable } from '@/shared/api'
import type {
  ApiResponseFull,
  ProfileUpdateRequestDto,
  BreederProfileUpdateResponseDto,
  ApplicationStatusUpdateRequest,
  ApplicationStatusUpdateResponseDto,
  ChatMessageDto,
  SendChatMessageRequest,
  AvailablePetAddRequest,
  ParentPetAddRequest,
  ParentPetUpdateRequest,
  PetAddResponse,
  PetMessageResponse,
  PetStatusUpdateRequest,
  ReviewReplyRequest,
  ReviewReplyResponseDto,
  ReviewReplyDeleteResponseDto,
  VerificationSubmitRequest,
  VerificationSubmitResponse,
  SubmitDocumentsRequest,
  UploadDocumentsResponseDto,
  SimpleApplicationFormUpdateRequest,
  SimpleApplicationFormUpdateResponse,
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

/** 신청 상태 변경 (브리더용) */
export const updateBreederApplicationStatus = (
  applicationId: string,
  data: ApplicationStatusUpdateRequest,
) =>
  apiClient
    .patch<
      ApiResponseFull<ApplicationStatusUpdateResponseDto>
    >(`${API_VERSION}/breeder-management/applications/${applicationId}`, data)
    .then(unwrap)

/** 채팅 메시지 전송 */
export const sendApplicationChatMessage = (applicationId: string, data: SendChatMessageRequest) =>
  apiClient
    .post<
      ApiResponseFull<ChatMessageDto | null>
    >(`${API_VERSION}/breeder-management/applications/${applicationId}/chat/messages`, data)
    .then((res) => unwrapNullable(res, '채팅 메시지 전송에 실패했습니다.'))

// ==================== 분양 개체 (available-pets) ====================

/** 분양 개체 추가 */
export const addAvailablePet = (data: AvailablePetAddRequest) =>
  apiClient
    .post<ApiResponseFull<PetAddResponse>>(`${API_VERSION}/breeder-management/available-pets`, data)
    .then(unwrap)

/** 분양 개체 수정 */
export const updateAvailablePet = (petId: string, data: AvailablePetAddRequest) =>
  apiClient
    .patch<
      ApiResponseFull<PetMessageResponse>
    >(`${API_VERSION}/breeder-management/available-pets/${petId}`, data)
    .then(unwrap)

/** 분양 개체 삭제 */
export const deleteAvailablePet = (petId: string) =>
  apiClient
    .delete<
      ApiResponseFull<PetMessageResponse>
    >(`${API_VERSION}/breeder-management/available-pets/${petId}`)
    .then(unwrap)

/** 분양 개체 상태 변경 */
export const updateAvailablePetStatus = (petId: string, data: PetStatusUpdateRequest) =>
  apiClient
    .patch<
      ApiResponseFull<PetMessageResponse>
    >(`${API_VERSION}/breeder-management/available-pets/${petId}/status`, data)
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

// ==================== 인증 (verification) ====================

/** 브리더 인증 신청 */
export const submitVerification = (data: VerificationSubmitRequest) =>
  apiClient
    .post<
      ApiResponseFull<VerificationSubmitResponse>
    >(`${API_VERSION}/breeder-management/verification`, data)
    .then(unwrap)

/** 브리더 인증 서류 제출 (간소화) */
export const submitVerificationDocuments = (data: SubmitDocumentsRequest) =>
  apiClient
    .post<
      ApiResponseFull<VerificationSubmitResponse>
    >(`${API_VERSION}/breeder-management/verification/submit`, data)
    .then(unwrap)

/** 브리더 인증 서류 업로드 (multipart) */
export const uploadVerificationDocuments = (
  files: { type: string; file: File }[],
  level: 'new' | 'elite',
) => {
  const formData = new FormData()
  files.forEach(({ file }) => formData.append('files', file))
  formData.append('types', JSON.stringify(files.map(({ type }) => type)))
  formData.append('level', level)

  return apiClient
    .post<
      ApiResponseFull<UploadDocumentsResponseDto>
    >(`${API_VERSION}/breeder-management/verification/upload`, formData)
    .then(unwrap)
}

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
