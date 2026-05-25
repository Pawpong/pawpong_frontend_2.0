import type { BreederLevel } from './BreederTypes'

/** 브리더 플랜 */
export type BreederPlan = 'basic' | 'pro'

/** 사업장 위치 */
export interface BusinessLocation {
  city?: string
  district: string
  address?: string
}

/** 내 프로필 (마이홈) — role에 따라 필드가 다름 */
export interface MyProfile {
  role: 'adopter' | 'breeder'
  userId: string
  nickname: string
  profileImageUrl?: string
  bio: string
  bpm: number
  followerCount: number
  /** Adopter only */
  favoriteBreederCount?: number
  /** Breeder only */
  level?: BreederLevel
  /** Breeder only */
  plan?: BreederPlan
  /** Breeder only */
  businessLocation?: BusinessLocation
  /** Breeder only */
  longDescription?: string
}

/** 프로필 수정 요청 — 위치 */
export interface UpdateProfileLocation {
  city?: string
  district?: string
  address?: string
}

/** 프로필 수정 요청 */
export interface UpdateMyProfileRequest {
  bio?: string
  /** Breeder only */
  location?: UpdateProfileLocation
}

/** 즐겨찾는 브리더 카드 */
export interface FavoriteBreederCard {
  breederId: string
  nickname: string
  profileImageUrl?: string
  breederLocation: string
  recentPetStatus?: 'available' | 'reserved' | 'adopted'
  bpm: number
  level: BreederLevel
  addedAt: string
}

/** 즐겨찾는 브리더 목록 파라미터 */
export interface FavoriteBreederListParams {
  page?: number
  pageSize?: number
}

/** 팔로우 응답 */
export interface FollowResponse {
  followeeId: string
  followed: boolean
}

/** 팔로우 취소 응답 */
export interface UnfollowResponse {
  followeeId: string
  unfollowed: boolean
}
