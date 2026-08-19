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
  /** 내가 팔로우하는 수 (브리더는 항상 0) */
  followingCount?: number
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

/**
 * 즐겨찾는 브리더 카드의 화면 표시용 뷰 모델.
 * FavoriteBreederCard(API) 를 BreederCard 컴포넌트가 쓰는 형태로 옮겨 담는다.
 */
export interface FavoriteBreeder {
  id: string
  nickname: string
  imageUrl: string | null
  badges: string[]
  isBreeding: boolean
  location: string
  date: string
  /** 카드 우측 뱃지에 표기 (시안 CardStar 816-102863) */
  level?: BreederLevel
  /** 즐겨찾기 등록 여부 — 카드의 다이아몬드 채움 상태 */
  isFavorited?: boolean
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

/** 친구 목록(팔로워/팔로잉) 사용자 카드 */
export interface FollowUserCard {
  userId: string
  nickname: string
  profileImageUrl?: string
  /** 한 줄 소개 (없으면 "") */
  bio: string
  /** 내가 이 사람을 팔로우 중 */
  isFollowing: boolean
  /** 이 사람이 나를 팔로우 중 */
  isFollowedBy: boolean
  followedAt: string
}

/** 팔로워 삭제 응답 — removed: false면 원래 내 팔로워가 아니었음(멱등) */
export interface RemoveFollowerResponse {
  followerId: string
  removed: boolean
}
