import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
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
