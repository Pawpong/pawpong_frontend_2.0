/**
 * 입양자 관련 타입 정의
 * 출처: adopter.ts, review.ts (입양자 후기)
 */

import type { AuthProvider } from './BreederTypes'
import type { PaginationResponse } from './ApiTypes'

// ==================== 프로필 ====================

export interface AdopterProfileDto {
  adopterId: string
  emailAddress: string
  nickname: string
  phoneNumber?: string
  profileImageFileName?: string
  accountStatus: string
  authProvider: AuthProvider
  marketingAgreed: boolean
  createdAt: string
  updatedAt: string
}

export interface AdopterProfileUpdateRequest {
  name?: string
  phone?: string
  profileImage?: string
  marketingConsent?: boolean
}

export interface AdopterProfileUpdateDto {
  adopterId: string
  updatedFields: string[]
  message: string
}

// ==================== 회원 탈퇴 ====================

/** 입양자 회원 탈퇴 사유 */
export enum WithdrawReason {
  ALREADY_ADOPTED = 'already_adopted',
  NO_SUITABLE_PET = 'no_suitable_pet',
  ADOPTION_FEE_BURDEN = 'adoption_fee_burden',
  UNCOMFORTABLE_UI = 'uncomfortable_ui',
  PRIVACY_CONCERN = 'privacy_concern',
  OTHER = 'other',
}

export interface AccountDeleteRequest {
  reason: WithdrawReason
  otherReason?: string
}

export interface AccountDeleteResponse {
  adopterId: string
  deletedAt: string
  message: string
}

// ==================== 즐겨찾기 ====================

export interface FavoriteItemDto {
  breederId: string
  breederName: string
  profileImage?: string
  representativePhotos?: string[]
  breederLevel?: string
  petType?: string
  location: string
  specialization?: string[]
  averageRating: number
  totalReviews: number
  priceRange?: {
    min: number
    max: number
    display: string
  }
  availablePets?: number
  addedAt: string
  isActive?: boolean
}

export type FavoritesListResponseDto = PaginationResponse<FavoriteItemDto>

export interface FavoriteAddResponseDto {
  favoriteId: string
  breederId: string
  message: string
}

export interface FavoriteRemoveResponseDto {
  breederId: string
  message: string
}

// ==================== 입양자가 작성한 후기 ====================

/**
 * 입양자가 작성한 후기 아이템
 * @중복제거 - adopter.ts의 ReviewCreateResponseDto + review.ts의 MyReviewItemDto 통합
 *   (review.ts는 목록용, adopter.ts는 작성 응답용 — 구조가 달라 별도 유지)
 */
export interface MyReviewItemDto {
  reviewId: string
  applicationId: string | null
  breederId: string | null
  breederNickname: string
  breederProfileImage: string | null
  breederLevel: string
  breedingPetType: string
  content: string
  reviewType: string
  writtenAt: Date
}

export interface MyReviewDetailDto extends MyReviewItemDto {
  isVisible: boolean
}

/** 후기 작성 요청
 * @중복제거 - adopter.ts의 ReviewCreateRequestDto + review.ts의 ReviewCreateRequest 동일 구조
 */
export interface ReviewCreateRequest {
  applicationId: string
  reviewType: 'consultation' | 'adoption'
  content: string
}

/** 후기 작성 응답 (adopter.ts) */
export interface ReviewCreateResponseDto {
  reviewId: string
  breederId: string
  breederName: string
  adopterId: string
  adopterName: string
  applicationId: string
  reviewType: string
  content: string
  createdAt: string
}
