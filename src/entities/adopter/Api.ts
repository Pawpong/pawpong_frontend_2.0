import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiRequestConfig } from '@/shared/api'
import type {
  AdopterProfileDto,
  AdopterPublicProfile,
  FavoriteItemDto,
  FavoriteAddResponseDto,
  FavoriteRemoveResponseDto,
  MyReviewItemDto,
  ReviewCreateRequest,
  WithdrawReason,
  PaginationResponse,
  ApiResponseFull,
} from '@/shared/types'

/** 입양자 공개 프로필 조회 (유저홈) */
export const getAdopterPublicProfile = (userId: string) =>
  apiClient
    .get<ApiResponseFull<AdopterPublicProfile>>(
      `${API_VERSION}/profile/users/${userId}`,
      { skipAuth: true } as ApiRequestConfig,
    )
    .then((res) => unwrap(res, '입양자 프로필 조회에 실패했습니다.'))

/** 내 프로필 조회 */
export const getAdopterProfile = () =>
  apiClient
    .get<{ success: boolean; data: AdopterProfileDto; message?: string }>(
      `${API_VERSION}/adopter/profile`,
    )
    .then(unwrap)

/** 프로필 수정 */
export const updateAdopterProfile = (data: Partial<AdopterProfileDto>) =>
  apiClient
    .patch<{
      success: boolean
      data: { adopterId: string; updatedFields: string[]; message: string }
      message?: string
    }>(`${API_VERSION}/adopter/profile`, data)
    .then(unwrap)

/** 회원 탈퇴 */
export const deleteAdopterAccount = (data: { reason: WithdrawReason; otherReason?: string }) =>
  apiClient
    .delete<{
      success: boolean
      data: { adopterId: string; deletedAt: string; message: string }
      message?: string
    }>(`${API_VERSION}/adopter/account`, { data })
    .then(unwrap)

/** 즐겨찾기 목록 */
export const getFavorites = (page = 1, limit = 20) =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<FavoriteItemDto>
      message?: string
    }>(`${API_VERSION}/adopter/favorites`, { params: { page, limit } })
    .then(unwrap)

/** 즐겨찾기 추가 */
export const addFavorite = (breederId: string) =>
  apiClient
    .post<{ success: boolean; data: FavoriteAddResponseDto; message?: string }>(
      `${API_VERSION}/adopter/favorite`,
      { breederId },
    )
    .then(unwrap)

/** 즐겨찾기 삭제 */
export const removeFavorite = (breederId: string) =>
  apiClient
    .delete<{
      success: boolean
      data: FavoriteRemoveResponseDto
      message?: string
    }>(`${API_VERSION}/adopter/favorite/${breederId}`)
    .then(unwrap)

/** 내 후기 목록 */
export const getMyReviews = (page = 1, limit = 10) =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<MyReviewItemDto>
      message?: string
    }>(`${API_VERSION}/adopter/reviews`, { params: { page, limit } })
    .then(unwrap)

/** 후기 작성 */
export const createReview = (data: ReviewCreateRequest) =>
  apiClient
    .post<{
      success: boolean
      data: { reviewId: string; message: string }
      message?: string
    }>(`${API_VERSION}/adopter/review`, data)
    .then(unwrap)
