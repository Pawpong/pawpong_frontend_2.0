import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  AdopterProfileUpdateRequest,
  FavoriteAddResponseDto,
  FavoriteRemoveResponseDto,
  ReviewCreateRequest,
  ReviewCreateResponseDto,
  WithdrawReason,
} from '@/shared/types'

/** 프로필 수정 (name/phone/profileImage/marketingConsent) */
export const updateAdopterProfile = (data: AdopterProfileUpdateRequest) =>
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

/** 즐겨찾기 추가 */
export const addFavorite = (breederId: string) =>
  apiClient
    .post<{
      success: boolean
      data: FavoriteAddResponseDto
      message?: string
    }>(`${API_VERSION}/adopter/favorite`, { breederId })
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

/** 후기 작성 */
export const createReview = (data: ReviewCreateRequest) =>
  apiClient
    .post<{
      success: boolean
      data: ReviewCreateResponseDto
      message?: string
    }>(`${API_VERSION}/adopter/review`, data)
    .then(unwrap)
