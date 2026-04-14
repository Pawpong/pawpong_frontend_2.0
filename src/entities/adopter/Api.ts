import { apiClient, unwrap } from '@/shared/api'
import type {
  AdopterProfileDto,
  FavoriteItemDto,
  FavoriteAddResponseDto,
  FavoriteRemoveResponseDto,
  MyReviewItemDto,
  ReviewCreateRequest,
  WithdrawReason,
  PaginationResponse,
} from '@/shared/types'

/** 내 프로필 조회 */
export const getAdopterProfile = () =>
  apiClient
    .get<{ success: boolean; data: AdopterProfileDto; message?: string }>('/api/adopter/profile')
    .then(unwrap)

/** 프로필 수정 */
export const updateAdopterProfile = (data: Partial<AdopterProfileDto>) =>
  apiClient
    .patch<{
      success: boolean
      data: { adopterId: string; updatedFields: string[]; message: string }
      message?: string
    }>('/api/adopter/profile', data)
    .then(unwrap)

/** 회원 탈퇴 */
export const deleteAdopterAccount = (data: { reason: WithdrawReason; otherReason?: string }) =>
  apiClient
    .delete<{
      success: boolean
      data: { adopterId: string; deletedAt: string; message: string }
      message?: string
    }>('/api/adopter/account', { data })
    .then(unwrap)

/** 즐겨찾기 목록 */
export const getFavorites = (page = 1, limit = 20) =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<FavoriteItemDto>
      message?: string
    }>('/api/adopter/favorites', { params: { page, limit } })
    .then(unwrap)

/** 즐겨찾기 추가 */
export const addFavorite = (breederId: string) =>
  apiClient
    .post<{ success: boolean; data: FavoriteAddResponseDto; message?: string }>(
      '/api/adopter/favorite',
      {
        breederId,
      },
    )
    .then(unwrap)

/** 즐겨찾기 삭제 */
export const removeFavorite = (breederId: string) =>
  apiClient
    .delete<{
      success: boolean
      data: FavoriteRemoveResponseDto
      message?: string
    }>(`/api/adopter/favorite/${breederId}`)
    .then(unwrap)

/** 내 후기 목록 */
export const getMyReviews = (page = 1, limit = 10) =>
  apiClient
    .get<{
      success: boolean
      data: PaginationResponse<MyReviewItemDto>
      message?: string
    }>('/api/adopter/reviews', { params: { page, limit } })
    .then(unwrap)

/** 후기 작성 */
export const createReview = (data: ReviewCreateRequest) =>
  apiClient
    .post<{
      success: boolean
      data: { reviewId: string; message: string }
      message?: string
    }>('/api/adopter/review', data)
    .then(unwrap)
