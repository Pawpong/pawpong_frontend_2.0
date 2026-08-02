import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiRequestConfig } from '@/shared/api'
import type {
  AdopterProfileDto,
  AdopterPublicProfile,
  MyReviewItemDto,
  PaginationResponse,
  ApiResponseFull,
} from '@/shared/types'

/** 입양자 공개 프로필 조회 (유저홈) */
export const getAdopterPublicProfile = (userId: string) =>
  apiClient
    .get<
      ApiResponseFull<AdopterPublicProfile>
    >(`${API_VERSION}/profile/users/${userId}`, { skipAuth: true } as ApiRequestConfig)
    .then((res) => unwrap(res, '입양자 프로필 조회에 실패했습니다.'))

/** 내 프로필 조회 */
export const getAdopterProfile = () =>
  apiClient
    .get<{
      success: boolean
      data: AdopterProfileDto
      message?: string
    }>(`${API_VERSION}/adopter/profile`)
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
